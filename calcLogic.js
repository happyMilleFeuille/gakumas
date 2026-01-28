// calcLogic.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { activityOptions } from './calcOptions.js';
import { calculateCardBonus } from './simulator-engine.js';
import { baseStats, getNiaLessonStat, getHajimeLessonStat, idolData, niaAuditionStats } from './calcStats.js';

/**
 * DOM에서 현재 선택된 모든 활동과 옵션의 트리거 횟수를 집계
 */
export function getTriggerCountsFromDOM() {
    const counts = {
        total: {},
        lessons: {
            vocal: { normal: 0, sp: 0 },
            dance: { normal: 0, sp: 0 },
            visual: { normal: 0, sp: 0 }
        }
    };
    
    const board = document.querySelector('.unified-plan-board');
    if (!board) return counts;

    board.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        const actionId = wrapper.dataset.value;
        const isSP = wrapper.dataset.optsp === 'true';
        
        counts.total[actionId] = (counts.total[actionId] || 0) + 1;

        if (wrapper.dataset.results) {
            wrapper.dataset.results.split(',').forEach(rid => {
                if (rid) counts.total[rid] = (counts.total[rid] || 0) + 1;
            });
        }

        if (actionId === 'lessonvo') {
            if (isSP) counts.lessons.vocal.sp++; else counts.lessons.vocal.normal++;
        } else if (actionId === 'lessondan') {
            if (isSP) counts.lessons.dance.sp++; else counts.lessons.dance.normal++;
        } else if (actionId === 'lessonvi') {
            if (isSP) counts.lessons.visual.sp++; else counts.lessons.visual.normal++;
        }

        Object.keys(wrapper.dataset).forEach(key => {
            if (key.startsWith('opt')) {
                const optId = key.slice(3).toLowerCase();
                const countInc = (wrapper.dataset[key] === 'true') ? 1 : (!isNaN(wrapper.dataset[key]) ? parseInt(wrapper.dataset[key]) : 0);
                if (countInc === 0) return;

                const options = activityOptions[actionId] || [];
                const optDef = options.find(o => o.id === optId) || 
                             options.flatMap(o => o.subOptions || []).find(so => so.id === optId);

                const targetIds = (optDef && optDef.results) ? optDef.results : [optId];
                targetIds.forEach(tid => {
                    counts.total[tid] = (counts.total[tid] || 0) + countInc;
                });
            }
        });
    });

    const calcType = board.dataset.calcType;
    const saved = JSON.parse(localStorage.getItem(`calc_state_${calcType}`)) || {};

    // 0. Nia 전용 P-아이템 보너스 반영 (서포카 보너스용)
    if (calcType === 'nia' && saved.pItems) {
        // 보드 활동 횟수 재집계 (counts.total 활용 가능)
        if (saved.pItems.includes('nia1-1')) {
            const bonus = Math.min(counts.total['spclass'] || 0, 2);
            counts.total['get'] = (counts.total['get'] || 0) + bonus;
            counts.total['delete'] = (counts.total['delete'] || 0) + bonus;
        }
        if (saved.pItems.includes('nia1-2')) {
            const bonus = Math.min(counts.total['advice'] || 0, 2);
            counts.total['get'] = (counts.total['get'] || 0) + bonus;
            counts.total['delete'] = (counts.total['delete'] || 0) + bonus;
        }
        
        let nia21Count = 0, nia22Count = 0, nia23Count = 0;
        board.querySelectorAll('.plan-icon-wrapper.active[data-value="class_nia"]').forEach(icon => {
            if (icon.dataset.optget_enhancedcard === 'true') nia21Count++;
            if (icon.dataset.optget_ppoint === 'true') nia22Count++;
            if (icon.dataset.optget_drink === 'true') nia23Count++;
        });

        if (saved.pItems.includes('nia2-1')) {
            const bonus = Math.min(nia21Count, 2);
            counts.total['get'] = (counts.total['get'] || 0) + bonus;
            counts.total['delete'] = (counts.total['delete'] || 0) + bonus;
        }
        if (saved.pItems.includes('nia2-2')) {
            const bonus = Math.min(nia22Count, 2);
            counts.total['get'] = (counts.total['get'] || 0) + bonus;
            counts.total['delete'] = (counts.total['delete'] || 0) + bonus;
        }
        if (saved.pItems.includes('nia2-3')) {
            const bonus = Math.min(nia23Count, 2);
            counts.total['get'] = (counts.total['get'] || 0) + bonus;
            counts.total['delete'] = (counts.total['delete'] || 0) + bonus;
        }
    }

    // 1. 강화 분배 반영
    const manualE = saved.manualEnhance || { m: 0, a: 0 };
    const mVal = Number(manualE.m) || 0;
    const aVal = Number(manualE.a) || 0;
    if (mVal > 0) counts.total['enhance_m'] = (counts.total['enhance_m'] || 0) + mVal;
    if (aVal > 0) counts.total['enhance_a'] = (counts.total['enhance_a'] || 0) + aVal;

    // 2. 삭제 분배 반영
    const manualD = saved.manualDelete || { m: 0, a: 0 };
    const dmVal = Number(manualD.m) || 0;
    const daVal = Number(manualD.a) || 0;
    if (dmVal > 0) counts.total['delete_m'] = (counts.total['delete_m'] || 0) + dmVal;
    if (daVal > 0) counts.total['delete_a'] = (counts.total['delete_a'] || 0) + daVal;

    // 3. 카드 획득 분배 반영
    const manualG = saved.manualGet || { m: 0, a: 0 };
    const gmVal = Number(manualG.m) || 0;
    const gaVal = Number(manualG.a) || 0;
    if (gmVal > 0) counts.total['get_m'] = (counts.total['get_m'] || 0) + gmVal;
    if (gaVal > 0) counts.total['get_a'] = (counts.total['get_a'] || 0) + gaVal;

    // 3.5. 슬롯 선택 카드 반영 (체크박스 기반)
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
    const selectedIds = (saved.planCards && activePlan) ? (saved.planCards[activePlan] || []) : [];
    const cardChecked = saved.cardChecked || {};

    selectedIds.forEach(id => {
        const card = cardList.find(c => c.id === id);
        if (card) {
            // 체크박스가 체크된 경우에만 수치에 반영
            if (cardChecked[id]) {
                if (card.have === 'item') {
                    counts.total['item'] = (counts.total['item'] || 0) + 1;
                } else if (card.have?.startsWith('card_')) {
                    if (card.have === 'card_a') counts.total['get_a'] = (counts.total['get_a'] || 0) + 1;
                    else if (card.have === 'card_m') counts.total['get_m'] = (counts.total['get_m'] || 0) + 1;
                    if (card.rarity === 'SSR') counts.total['get_ssr'] = (counts.total['get_ssr'] || 0) + 1;
                }
            }
        }
    });

    // 4. 기타 획득 수동 보정 반영 (SSR, 원기, 플랜별 스탯 등)
    const manualO = saved.manualOther || {};
    Object.keys(manualO).forEach(key => {
        const val = Number(manualO[key]) || 0;
        if (val !== 0) {
            counts.total[key] = (counts.total[key] || 0) + val;
        }
    });

    // [추가] 아이템 획득 수치를 get_item 트리거로 연결
    const totalItemCount = (counts.total['item'] || 0) + (counts.total['get_item'] || 0);
    if (totalItemCount > 0) {
        counts.total['get_item'] = (counts.total['get_item'] || 0) + totalItemCount;
    }

    return counts;
}

/**
 * 기본 스탯 및 카드 보너스를 포함한 전체 합계 계산
 */
export function calculateAllTotals(detailedCounts, selectedIds) {
    let baseTotal = { vocal: 0, dance: 0, visual: 0 };
    let cardBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let percentBonuses = { vocal: 0, dance: 0, visual: 0 };

    const board = document.querySelector('.unified-plan-board');
    if (!board) return { baseTotal, cardBonusTotal };

    const calcType = board.dataset.calcType;

    // 1. 행동 기본 수치 합산
    board.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        const actionId = wrapper.dataset.value;
        const isSP = wrapper.dataset.optsp === 'true';
        const week = parseInt(wrapper.closest('.week-row')?.dataset.week || 0);
        
        let stats = null;
        if (calcType === 'nia' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) {
            stats = getNiaLessonStat(actionId, isSP, week);
        } else if (calcType === 'hajime' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) {
            stats = getHajimeLessonStat(actionId, isSP, week) || (isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId]);
        } else if (calcType === 'nia' && actionId === 'audition') {
            const currentIdol = document.querySelector('.idol-sel-item.active');
            const data = idolData[currentIdol?.dataset.id];
            if (data) {
                const stage = week === 9 ? 1 : (week === 17 ? 2 : (week === 26 ? 3 : 0));
                const stageStats = niaAuditionStats[stage];
                if (stageStats) {
                    const vals = data.growthType === 'protruded' ? stageStats.protruded : stageStats.balanced;
                    stats = { vocal: 0, dance: 0, visual: 0 };
                    data.priority.forEach((attr, idx) => { stats[attr] = vals[idx]; });
                }
            }
        } else {
            stats = isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId];
        }

        if (stats) {
            baseTotal.vocal += stats.vocal || 0;
            baseTotal.dance += stats.dance || 0;
            baseTotal.visual += stats.visual || 0;
        }
    });

    // 2. 아이돌 성장 보너스 적용
    const currentIdolBtn = document.querySelector('.idol-sel-item.active');
    const currentIdolId = currentIdolBtn?.dataset.id;
    const currentIdolData = idolData[currentIdolId];

    if (currentIdolData) {
        cardBonusTotal.vocal += Math.floor(baseTotal.vocal * (currentIdolData.vocalBonus / 100));
        cardBonusTotal.dance += Math.floor(baseTotal.dance * (currentIdolData.danceBonus / 100));
        cardBonusTotal.visual += Math.floor(baseTotal.visual * (currentIdolData.visualBonus / 100));
    }

    // 3. 카드 보너스 합산
    selectedIds.forEach(cardId => {
        const card = cardList.find(c => c.id === cardId);
        if (!card) return;
        const lb = state.supportLB[cardId] || 0;
        const bonus = calculateCardBonus(card, detailedCounts, lb);
        
        cardBonusTotal.vocal += bonus.vocal || 0;
        cardBonusTotal.dance += bonus.dance || 0;
        cardBonusTotal.visual += bonus.visual || 0;
        if (bonus.percent > 0) percentBonuses[card.type] += bonus.percent;
    });

    cardBonusTotal.vocal += Math.round(baseTotal.vocal * (percentBonuses.vocal / 100));
    cardBonusTotal.dance += Math.round(baseTotal.dance * (percentBonuses.dance / 100));
    cardBonusTotal.visual += Math.round(baseTotal.visual * (percentBonuses.visual / 100));

    return { baseTotal, cardBonusTotal };
}
