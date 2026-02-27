// calcLogic.js
import { state } from './state.js';
import { calcPlans } from './calcData.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { activityOptions } from './calcOptions.js';
import { calculateCardBonus } from './simulator-engine.js';
import { baseStats, getNiaLessonStat, getHajimeLessonStat, idolData, niaAuditionStats } from './calcStats.js';

/**
 * 전역 상태(Store) 객체를 바탕으로 트리거 횟수를 정밀하게 집계
 */
export function getTriggerCounts(store) {
    const counts = {
        total: { enhance: 0, enhance_m: 0, enhance_a: 0, delete: 0, delete_m: 0, delete_a: 0, get: 0, get_m: 0, get_a: 0, get_drink: 0, purchase_drink: 0, get_item: (store.type === 'nia' ? 1 : 0), change: 0 },
        lessons: { vocal: { normal: 0, sp: 0 }, dance: { normal: 0, sp: 0 }, visual: { normal: 0, sp: 0 } }
    };
    
    // 1. 보드 행동(Weeks) 분석 및 기본 풀(Pool) 집계
    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum];
        if (!week || !week.value) return;
        const actionId = week.value, opts = week.opts || {}, isSP = opts.sp === 'true';

        counts.total[actionId] = (counts.total[actionId] || 0) + 1;

        // 1. 계획(calcPlans)에 직접 정의된 결과물(results) 집계 (예: gift의 get 등)
        const planData = store.type === 'hajime' ? calcPlans.hajime : calcPlans.nia;
        const weekOptions = planData.weeks[weekNum] || [];
        const actionDef = weekOptions.find(o => o.value === actionId);
        if (actionDef && actionDef.results) {
            actionDef.results.forEach(rid => {
                const id = rid.trim();
                if (id === 'get') counts.total.get++;
                else if (id === 'get_drink') counts.total.get_drink++;
                else counts.total[id] = (counts.total[id] || 0) + 1;
            });
        }

        // 2. 활동 정의(activityOptions)에 있는 기본 결과물 가산 (하위 호환성)
        const optDefMain = (activityOptions[actionId] || []).find(o => o.value === actionId);
        if (optDefMain && optDefMain.results) {
            optDefMain.results.forEach(rid => { counts.total[rid] = (counts.total[rid] || 0) + 1; });
        }

        // 레슨 타입 분류
        if (actionId === 'lessonvo') { if (isSP) counts.lessons.vocal.sp++; else counts.lessons.vocal.normal++; }
        else if (actionId === 'lessondan') { if (isSP) counts.lessons.dance.sp++; else counts.lessons.dance.normal++; }
        else if (actionId === 'lessonvi') { if (isSP) counts.lessons.visual.sp++; else counts.lessons.visual.normal++; }

        // 옵션에서 발생하는 획득/강화/삭제 키워드 분석
        Object.keys(opts).forEach(optId => {
            const countInc = (opts[optId] === 'true') ? 1 : (!isNaN(opts[optId]) ? parseInt(opts[optId]) : 0);
            if (countInc === 0) return;

            const options = activityOptions[actionId] || [];
            const optDef = options.find(o => o.id === optId) || options.flatMap(o => o.subOptions || []).find(so => so.id === optId);
            const targets = (optDef && optDef.results) ? optDef.results : [optId];

            targets.forEach(t => {
                const id = t.trim();
                if (['enhance', 'ranenhance'].includes(id)) counts.total.enhance += countInc;
                else if (id === 'enhance_m') { counts.total.enhance += countInc; counts.total.enhance_m += countInc; }
                else if (id === 'enhance_a') { counts.total.enhance += countInc; counts.total.enhance_a += countInc; }
                else if (id === 'delete') counts.total.delete += countInc;
                else if (id === 'delete_m') { counts.total.delete += countInc; counts.total.delete_m += countInc; }
                else if (id === 'delete_a') { counts.total.delete += countInc; counts.total.delete_a += countInc; }
                else if (id === 'get') counts.total.get += countInc;
                else if (id === 'get_m') { counts.total.get += countInc; counts.total.get_m += countInc; }
                else if (id === 'get_a') { counts.total.get += countInc; counts.total.get_a += countInc; }
                else if (counts.total.hasOwnProperty(id)) counts.total[id] += countInc;
                else counts.total[id] = (counts.total[id] || 0) + countInc;
            });
        });
    });

    // 2. Nia 전용 P-아이템 보너스 (Nia 모드일 때만)
    if (store.type === 'nia' && store.pItems) {
        const boardCounts = {};
        Object.values(store.weeks).forEach(w => { if(w.value) boardCounts[w.value] = (boardCounts[w.value] || 0) + 1; });
        
        let niaBonusGet = 0, niaBonusDelete = 0, niaBonusEnhance = 0;

        // 1단계 아이템: 특별수업(spclass), 상담(advice) 시 보너스
        if (store.pItems.includes('nia1-1')) { const b = Math.min(boardCounts['spclass'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia1-2')) { const b = Math.min(boardCounts['advice'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        
        // 2단계 아이템: 영업(class_nia) 세부 옵션에 따른 보너스
        let n21 = 0, n22 = 0, n23 = 0, n41 = 0;
        Object.keys(store.weeks).forEach(wNum => {
            const week = store.weeks[wNum];
            if (week.value === 'class_nia') {
                if (week.opts.get_enhancedcard === 'true') { n21++; if (parseInt(wNum) >= 10) n41++; }
                if (week.opts.get_ppoint === 'true') n22++;
                if (week.opts.get_drink === 'true') n23++;
            }
        });
        if (store.pItems.includes('nia2-1')) { const b = Math.min(n21, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia2-2')) { const b = Math.min(n22, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia2-3')) { const b = Math.min(n23, 2); niaBonusGet += b; niaBonusDelete += b; }

        // 3단계 아이템: 오디션(audition) 종료 시 보너스
        if (store.pItems.includes('nia3-1') || store.pItems.includes('nia3-2')) {
            const b = Math.min(boardCounts['audition'] || 0, 2);
            niaBonusGet += b; niaBonusDelete += b;
        }

        // 4, 5단계 아이템: 강화 보너스
        if (store.pItems.includes('nia4-1')) niaBonusEnhance += Math.min(n41, 2);
        if (store.pItems.includes('nia4-2')) {
            let n42 = 0;
            Object.values(store.weeks).forEach(w => { if(w.value === 'class_nia' && w.opts.get_drink === 'true') n42++; });
            counts.total.get_drink = (counts.total.get_drink || 0) + (Math.min(n42, 2) * 2);
        }
        if (store.pItems.includes('nia5-1')) {
            if (Object.keys(store.weeks).some(w => parseInt(w) > 17 && store.weeks[w].opts.sp === 'true')) niaBonusEnhance += 1;
        }

        counts.total.get += niaBonusGet;
        counts.total.delete += niaBonusDelete;
        counts.total.enhance += niaBonusEnhance;
    }

    // 3. 수동 분배 수치 자동 할당 및 합산 (동적 총량 동기화)
    const currentEnhancePool = counts.total.enhance || 0;
    let em = Number(store.manualEnhance?.m) || 0;
    let ea = Number(store.manualEnhance?.a) || 0;

    if (currentEnhancePool === 0) {
        em = 0; ea = 0;
    } else {
        let diffE = currentEnhancePool - (em + ea);
        if (diffE > 0) {
            em += diffE; // 늘어나면 멘탈에 추가
        } else if (diffE < 0) {
            // 줄어들면 멘탈에서 먼저 빼고, 부족하면 액티브에서 뺌
            const reduceM = Math.min(em, Math.abs(diffE));
            em -= reduceM;
            diffE += reduceM;
            if (diffE < 0) ea = Math.max(0, ea + diffE);
        }
    }
    store.manualEnhance = { m: em, a: ea };
    counts.total.enhance_m += em;
    counts.total.enhance_a += ea;

    const currentDeletePool = counts.total.delete || 0;
    let dm = Number(store.manualDelete?.m) || 0;
    let da = Number(store.manualDelete?.a) || 0;

    if (currentDeletePool === 0) {
        dm = 0; da = 0;
    } else {
        let diffD = currentDeletePool - (dm + da);
        if (diffD > 0) {
            dm += diffD;
        } else if (diffD < 0) {
            const reduceM = Math.min(dm, Math.abs(diffD));
            dm -= reduceM;
            diffD += reduceM;
            if (diffD < 0) da = Math.max(0, da + diffD);
        }
    }
    store.manualDelete = { m: dm, a: da };
    counts.total.delete_m += dm;
    counts.total.delete_a += da;

    // 4. 스킬 카드 및 서포트 카드 보너스 (모달 선택은 획득 총량에 합산하지 않음)
    const activePlan = store.planType || 'sense', selectedSkills = store.planSkills?.[activePlan] || {};
    Object.keys(selectedSkills).forEach(skillId => {
        const skill = skillCardList[skillId], count = selectedSkills[skillId] || 0;
        if (skill && count > 0) {
            // 스탯 트리거용 속성 카운트만 합산
            if (skill.type === 'active') counts.total.get_a += count;
            else if (skill.type === 'mental') counts.total.get_m += count;
            
            if (skill.rarity === 'SSR') counts.total.get_ssr = (counts.total.get_ssr || 0) + count;
            if (skill.attrs) skill.attrs.forEach(attr => { counts.total[`get_${attr}`] = (counts.total[`get_${attr}`] || 0) + count; });
            
            // counts.total.get += count; <-- 이 줄을 제거하여 총 획득량 중복 합산 방지
        }
    });

    const selectedIds = store.planCards?.[activePlan] || [];
    selectedIds.forEach(id => {
        if (store.cardChecked?.[id]) {
            const card = cardList.find(c => c.id === id);
            if (card) {
                if (card.have === 'item') counts.total.get_item++;
                else if (card.have?.startsWith('card_')) {
                    if (card.have === 'card_a') counts.total.get_a++; else if (card.have === 'card_m') counts.total.get_m++;
                    if (card.rarity === 'SSR') counts.total.get_ssr = (counts.total.get_ssr || 0) + 1;
                    counts.total.get++;
                    if (card.attrs) card.attrs.forEach(attr => { counts.total[`get_${attr}`] = (counts.total[`get_${attr}`] || 0) + 1; });
                }
            }
        }
    });

    // 5. 아이템 효과(Item Effects) 보너스 트리거 반영
    selectedIds.forEach(cardId => {
        const card = cardList.find(c => c.id === cardId);
        if (card && card.item_effects && store.cardChecked?.[cardId]) {
            const counter = store.itemCounters[cardId] || 0;
            card.item_effects.forEach(eff => {
                if ((eff.type === 'action' || eff.type === 'add_count') && eff.target && counter > 0) {
                    let multiplier = counter;
                    if (eff.trigger) {
                        const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                        let totalTriggerCount = 0;
                        triggers.forEach(t => {
                            if (t === 'lesson') {
                                if (card.type === 'vocal') totalTriggerCount += (counts.lessons.vocal.normal + counts.lessons.vocal.sp);
                                else if (card.type === 'dance') totalTriggerCount += (counts.lessons.dance.normal + counts.lessons.dance.sp);
                                else if (card.type === 'visual') totalTriggerCount += (counts.lessons.visual.normal + counts.lessons.visual.sp);
                                else totalTriggerCount += (counts.lessons.vocal.normal + counts.lessons.vocal.sp + counts.lessons.dance.normal + counts.lessons.dance.sp + counts.lessons.visual.normal + counts.lessons.visual.sp);
                            } else if (t === 'sp') {
                                if (card.type === 'vocal') totalTriggerCount += counts.lessons.vocal.sp; else if (card.type === 'dance') totalTriggerCount += counts.lessons.dance.sp; else if (card.type === 'visual') totalTriggerCount += counts.lessons.visual.sp;
                                else totalTriggerCount += (counts.lessons.vocal.sp + counts.lessons.dance.sp + counts.lessons.visual.sp);
                            } else totalTriggerCount += (counts.total[t] || 0);
                        });
                        multiplier = Math.min(totalTriggerCount, counter);
                    }
                    if (multiplier > 0 && counts.total.hasOwnProperty(eff.target)) counts.total[eff.target] += ((eff.value || 1) * multiplier);
                    else if (multiplier > 0) counts.total[eff.target] = (counts.total[eff.target] || 0) + ((eff.value || 1) * multiplier);
                }
            });
        }
    });

    return counts;
}

/**
 * 전역 상태를 바탕으로 최종 합계 스탯 계산
 */
export function calculateTotals(store, detailedCounts) {
    let baseTotal = { vocal: 0, dance: 0, visual: 0 };
    let cardBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let percentBonuses = { vocal: 0, dance: 0, visual: 0 };

    // 1. 행동 기본 수치 합산
    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum]; if(!week || !week.value) return;
        const actionId = week.value, isSP = week.opts.sp === 'true', wInt = parseInt(weekNum);
        let stats = null;
        if (store.type === 'nia' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) stats = getNiaLessonStat(actionId, isSP, wInt);
        else if (store.type === 'hajime' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) stats = getHajimeLessonStat(actionId, isSP, wInt) || (isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId]);
        else if (store.type === 'nia' && actionId === 'audition') {
            const data = idolData[store.selectedIdol];
            if (data) {
                const stage = wInt === 9 ? 1 : (wInt === 17 ? 2 : (wInt === 26 ? 3 : 0)), stageStats = niaAuditionStats[stage];
                if (stageStats) {
                    const vals = data.growthType === 'protruded' ? stageStats.protruded : stageStats.balanced;
                    stats = { vocal: 0, dance: 0, visual: 0 }; data.priority.forEach((attr, idx) => { stats[attr] = vals[idx]; });
                }
            }
        } else stats = isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId];
        if (stats) { baseTotal.vocal += stats.vocal || 0; baseTotal.dance += stats.dance || 0; baseTotal.visual += stats.visual || 0; }
    });

    // 2. 아이돌 성장 보너스
    const currentIdolData = idolData[store.selectedIdol];
    if (currentIdolData) {
        cardBonusTotal.vocal += Math.floor(baseTotal.vocal * (currentIdolData.vocalBonus / 100));
        cardBonusTotal.dance += Math.floor(baseTotal.dance * (currentIdolData.danceBonus / 100));
        cardBonusTotal.visual += Math.floor(baseTotal.visual * (currentIdolData.visualBonus / 100));
    }

    // 3. 카드 보너스
    const activePlan = store.planType || 'sense', selectedIds = store.planCards[activePlan] || [];
    selectedIds.forEach(cardId => {
        const card = cardList.find(c => c.id === cardId); if (!card) return;
        const lb = state.supportLB[cardId] || 0, bonus = calculateCardBonus(card, detailedCounts, lb);
        cardBonusTotal.vocal += bonus.vocal || 0; cardBonusTotal.dance += bonus.dance || 0; cardBonusTotal.visual += bonus.visual || 0;
        if (bonus.percent > 0) percentBonuses[card.type] += bonus.percent;

        if (card.item_effects && store.cardChecked[cardId]) {
            const counter = store.itemCounters[cardId] || 0;
            card.item_effects.forEach(eff => {
                if (eff.type === 'fixed' && eff.stats) { cardBonusTotal.vocal += eff.stats.vocal || 0; cardBonusTotal.dance += eff.stats.dance || 0; cardBonusTotal.visual += eff.stats.visual || 0; }
                else if (eff.type === 'action' && eff.stats && counter > 0) {
                    let multiplier = counter;
                    if (eff.trigger) {
                        const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                        let totalTriggerCount = 0;
                        triggers.forEach(t => { 
                            if (t === 'lesson') totalTriggerCount += (detailedCounts.lessons.vocal.normal + detailedCounts.lessons.vocal.sp + detailedCounts.lessons.dance.normal + detailedCounts.lessons.dance.sp + detailedCounts.lessons.visual.normal + detailedCounts.lessons.visual.sp);
                            else totalTriggerCount += (detailedCounts.total[t] || 0);
                        });
                        multiplier = Math.min(totalTriggerCount, multiplier);
                    }
                    if (multiplier > 0) { cardBonusTotal.vocal += (eff.stats.vocal || 0) * multiplier; cardBonusTotal.dance += (eff.stats.dance || 0) * multiplier; cardBonusTotal.visual += (eff.stats.visual || 0) * multiplier; }
                }
            });
        }
    });

    cardBonusTotal.vocal += Math.round(baseTotal.vocal * (percentBonuses.vocal / 100));
    cardBonusTotal.dance += Math.round(baseTotal.dance * (percentBonuses.dance / 100));
    cardBonusTotal.visual += Math.round(baseTotal.visual * (percentBonuses.visual / 100));

    return { baseTotal, cardBonusTotal };
}
