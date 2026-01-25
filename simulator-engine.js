import { abilityData } from './abilitydata.js';

/**
 * 현재 보드 상태에서 트리거들의 총 횟수를 추출
 */
export function getTriggerCounts(calcState) {
    const counts = {};
    if (!calcState || !calcState.weeks) return counts;

    Object.values(calcState.weeks).forEach(week => {
        const actionId = week.value;
        const opts = week.opts || {};
        counts[actionId] = (counts[actionId] || 0) + 1;
        Object.keys(opts).forEach(optId => {
            const val = opts[optId];
            if (val === 'true') counts[optId] = (counts[optId] || 0) + 1;
            else if (!isNaN(val)) counts[optId] = (counts[optId] || 0) + parseInt(val);
        });
    });
    return counts;
}

/**
 * 개별 카드의 기대 보너스 계산 (보컬, 댄스, 비주얼 합계)
 * @param {Object} card - 카드 객체
 * @param {Object} triggerData - 집계된 트리거 데이터 (total, lessons 정보 포함)
 * @param {number} lb - 카드의 돌파 수치 (0~4)
 */
export function calculateCardBonus(card, triggerData, lb = 4) {
    const results = { vocal: 0, dance: 0, visual: 0, percent: 0 };
    const rarity = card.rarity;
    const isDist = card.source === 'dist';
    const cardType = card.type; // vocal, dance, visual
    
    if (!card.abilities) return results;

    const totalCounts = triggerData.total || triggerData;
    const lessonCounts = triggerData.lessons || { vocal: {normal:0, sp:0}, dance: {normal:0, sp:0}, visual: {normal:0, sp:0} };

    // --- 1. 등급별 기본 보너스 및 event_paraup 적용 ---
    let baseBonus = rarity === 'SSR' ? 20 : (rarity === 'SR' ? 15 : 0);
    
    // event_paraup 어빌리티가 있는지 확인하여 기본 보너스 강화
    if (card.abilities.includes('event_paraup')) {
        const epAbility = abilityData['event_paraup'];
        if (epAbility) {
            // lb에 따른 레벨 결정 (ui.js 규칙: SSR은 0돌:Lv1, 1-3돌:Lv2, 4돌:Lv3 / SR은 0-1돌:Lv1, 2-3돌:Lv2, 4돌:Lv3)
            let epLv = 1;
            if (rarity === 'SSR') epLv = (lb >= 4 ? 3 : (lb >= 1 ? 2 : 1));
            else if (rarity === 'SR') epLv = (lb >= 4 ? 3 : (lb >= 2 ? 2 : 1));
            
            const epVal = epAbility.levels[epLv] || 0; // 50, 75, 100 등
            baseBonus = baseBonus * (1 + (epVal / 100));
        }
    }
    applyStat(results, cardType, baseBonus);

    // --- 2. 나머지 어빌리티 계산 ---
    const excludedAbilities = [
        'hpmax', 'supportrateup', 'event_paraup', // event_paraup은 위에서 처리함
        'event_recoveryup', 'alllesson_ppoint', 'ppoint', 'sp_ppoint',
        'sp_recovery', 'allsp_recovery', 'test_recovery', 'gift_recovery',
        'sp_lessonup', 'allsp_lessonup'
    ];

    card.abilities.forEach((abilityId, index) => {
        if (excludedAbilities.includes(abilityId)) return;

        const ability = abilityData[abilityId];
        if (!ability) return;

        // --- 레벨 결정 로직 ---
        let targetLv = 1;
        if (abilityId === 'percentparam' || abilityId === 'fixedparam') {
            targetLv = lb + 1;
        } else {
            if (index === 1) targetLv = (rarity === 'SSR' ? (lb >= 2 ? 2 : 1) : (lb >= 1 ? 2 : 1));
            else if (index === 3) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 3 ? 2 : 1) : (lb >= 4 ? 2 : 1));
            else if (index === 4) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 4 ? 2 : 1) : (lb >= 3 ? 2 : 1));
            else targetLv = (lb >= 2 ? 2 : 1);
        }

        const rarityKey = (rarity === 'SSR' && isDist && ability.levels['SSR_DIST']) ? 'SSR_DIST' : rarity;
        const bonusLevels = ability.levels[rarityKey] || ability.levels[rarity] || ability.levels;
        const availableLevels = Object.keys(bonusLevels).map(Number).sort((a, b) => b - a);
        const finalLv = availableLevels.includes(targetLv) ? targetLv : availableLevels[0];
        const bonusVal = bonusLevels[finalLv] || 0;

        if (bonusVal === 0) return;

        if (abilityId === 'percentparam') {
            results.percent = bonusVal;
            return;
        }

        // --- 보너스 카운트 계산 ---
        let count = 0;

        // 1. 특이 케이스: 카드 타입과 레슨 타입이 일치해야 하는 항목들
        if (abilityId === 'sp_param') {
            count = lessonCounts[cardType]?.sp || 0;
        } else if (abilityId === 'normallesson_param') {
            count = lessonCounts[cardType]?.normal || 0;
        } else if (abilityId === 'lesson_param') {
            const c = lessonCounts[cardType];
            count = c ? (c.normal + c.sp) : 0;
        } 
        // 2. 범용 케이스: abilitydata.js의 trigger 배열을 그대로 따름 (sp_param20 등)
        else if (ability.trigger) {
            ability.trigger.forEach(tid => { 
                count += (totalCounts[tid] || 0); 
            });
        } 
        // 3. 트리거 없는 경우: 초기 스탯 보너스
        else {
            applyStat(results, cardType, bonusVal);
            return;
        }

        // 횟수 제한(max) 적용
        if (ability.max) count = Math.min(count, ability.max);

        if (count > 0) {
            applyStat(results, cardType, bonusVal * count);
        }
    });

    return results;
}

/**
 * 타입에 맞춰 스탯 합산
 */
function applyStat(results, type, val) {
    if (type === 'vocal') results.vocal += val;
    else if (type === 'dance') results.dance += val;
    else if (type === 'visual') results.visual += val;
}

/**
 * 전체 시뮬레이션 실행
 */
export function runSimulation(calcState, selectedCards) {
    const triggerCounts = getTriggerCounts(calcState);
    const total = { vocal: 0, dance: 0, visual: 0 };

    selectedCards.forEach(card => {
        const bonus = calculateCardBonus(card, triggerCounts);
        total.vocal += bonus.vocal;
        total.dance += bonus.dance;
        total.visual += bonus.visual;
    });

    return total;
}
