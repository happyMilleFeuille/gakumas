// calcLogic.js
import { state } from './state.js';
import { calcPlans, baseStats, idolData, niaAuditionStats } from './calcData.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { activityOptions } from './calcOptions.js';
import { calculateCardBonus } from './simulator-engine.js';

/**
 * 하지메(Hajime) 전용 레슨 수치 로직
 */
export const getHajimeLessonStat = (actionId, isSP, week) => {
    let stats = { vocal: 0, dance: 0, visual: 0 };
    let values = [0, 0, 0]; // [주속성, 부속성, 부속성]

    if (week === 4) {
        values = isSP ? [140, 55, 55] : [110, 50, 50];
    } else if (week === 7) {
        values = isSP ? [180, 60, 60] : [144, 53, 53];
    } else if (week === 12) {
        values = isSP ? [260, 70, 70] : [214, 58, 58];
    } else if (week === 14) {
        values = isSP ? [370, 90, 90] : [320, 75, 75];
    } else if (week === 16) {
        values = isSP ? [570, 115, 115] : [504, 108, 108];
    } else {
        return null;
    }

    if (actionId === 'lessonvo') {
        stats.vocal = values[0]; stats.dance = values[1]; stats.visual = values[2];
    } else if (actionId === 'lessondan') {
        stats.dance = values[0]; stats.vocal = values[1]; stats.visual = values[2];
    } else if (actionId === 'lessonvi') {
        stats.visual = values[0]; stats.vocal = values[1]; stats.dance = values[2];
    }
    return stats;
};

/**
 * 니아(NIA) 전용 레슨 수치 로직
 */
export const getNiaLessonStat = (actionId, isSP, week) => {
    let val = 0;
    if (week <= 8) val = isSP ? 100 : 80;
    else if (week <= 16) val = isSP ? 120 : 100;
    else if (week <= 25) val = isSP ? 150 : 120;
    else val = isSP ? 150 : 120;

    return {
        vocal: actionId === 'lessonvo' ? val : 0,
        dance: actionId === 'lessondan' ? val : 0,
        visual: actionId === 'lessonvi' ? val : 0
    };
};

/**
 * 전역 상태(Store) 객체를 바탕으로 트리거 횟수를 정밀하게 집계
 */
export function getTriggerCounts(store) {
    const counts = {
        total: { enhance: 0, enhance_m: 0, enhance_a: 0, delete: 0, delete_m: 0, delete_a: 0, delete_t: 0, get: 0, get_m: 0, get_a: 0, get_drink: 0, purchase_drink: 0, get_item: (store.type === 'nia' ? 1 : 0), change: 0 },
        lessons: { vocal: { normal: 0, sp: 0 }, dance: { normal: 0, sp: 0 }, visual: { normal: 0, sp: 0 } }
    };
    
    // 1. 보드 행동(Weeks) 분석 및 기본 풀(Pool) 집계
    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum];
        if (!week || !week.value) return;
        const actionId = week.value, opts = week.opts || {}, isSP = opts.sp === 'true';

        counts.total[actionId] = (counts.total[actionId] || 0) + 1;

        const planData = store.type === 'hajime' ? calcPlans.hajime : calcPlans.nia;
        const weekOptions = planData.weeks[weekNum] || [];
        const actionDef = weekOptions.find(o => o.value === actionId);
        if (actionDef && actionDef.results) {
            actionDef.results.forEach(rid => {
                const id = rid.trim();
                if (id === 'get') counts.total.get++;
                else if (id === 'get_t') counts.total.get_t++;
                else if (id === 'delete') counts.total.delete++;
                else if (id === 'delete_t') counts.total.delete_t++;
                else if (id === 'get_drink') counts.total.get_drink++;
                else counts.total[id] = (counts.total[id] || 0) + 1;
            });
        }

        if (actionId === 'lessonvo') { if (isSP) counts.lessons.vocal.sp++; else counts.lessons.vocal.normal++; }
        else if (actionId === 'lessondan') { if (isSP) counts.lessons.dance.sp++; else counts.lessons.dance.normal++; }
        else if (actionId === 'lessonvi') { if (isSP) counts.lessons.visual.sp++; else counts.lessons.visual.normal++; }

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

    // 2. Nia 전용 P-아이템 보너스
    if (store.type === 'nia' && store.pItems) {
        const boardCounts = {};
        Object.values(store.weeks).forEach(w => { if(w.value) boardCounts[w.value] = (boardCounts[w.value] || 0) + 1; });
        let niaBonusGet = 0, niaBonusDelete = 0, niaBonusEnhance = 0;
        if (store.pItems.includes('nia1-1')) { const b = Math.min(boardCounts['spclass'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia1-2')) { const b = Math.min(boardCounts['advice'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
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
        if (store.pItems.includes('nia3-1') || store.pItems.includes('nia3-2')) { const b = Math.min(boardCounts['audition'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia4-1')) niaBonusEnhance += Math.min(n41, 2);
        if (store.pItems.includes('nia4-2')) {
            let n42 = 0;
            Object.values(store.weeks).forEach(w => { if(w.value === 'class_nia' && w.opts.get_drink === 'true') n42++; });
            counts.total.get_drink = (counts.total.get_drink || 0) + (Math.min(n42, 2) * 2);
        }
        if (store.pItems.includes('nia5-1')) { if (Object.keys(store.weeks).some(w => parseInt(w) > 17 && store.weeks[w].opts.sp === 'true')) niaBonusEnhance += 1; }
        counts.total.get += niaBonusGet;
        counts.total.delete += niaBonusDelete;
        counts.total.enhance += niaBonusEnhance;
    }

    // 3. 서포트 카드 엑스트라 옵션 (강화/삭제/체인지) 합산
    let activePlan = store.planType || 'sense';
    let selectedIds = store.planCards[activePlan] || [];
    selectedIds.forEach(id => {
        // 비활성화된 카드는 무시
        if (state.disabledCards[id]) return;
        
        if (store.cardExtraChecked[id]) {
            const card = cardList.find(c => c.id === id);
            if (card && card.extra2) {
                const e2 = card.extra2;
                if (e2.includes('enhance')) counts.total.enhance++;
                if (e2.includes('change')) counts.total.change++;
                if (e2.includes('del')) counts.total.delete++;
            }
        }
    });

    // 4. 스킬 카드 및 서포트 카드 보너스
    const selectedSkills = store.planSkills?.[activePlan] || {};
    Object.keys(selectedSkills).forEach(skillId => {
        const skill = skillCardList[skillId], count = selectedSkills[skillId] || 0;
        if (skill && count > 0) {
            if (skill.type === 'active') counts.total.get_a += count;
            else if (skill.type === 'mental') counts.total.get_m += count;
            if (skill.rarity === 'SSR') counts.total.get_ssr = (counts.total.get_ssr || 0) + count;
            if (skill.attrs) skill.attrs.forEach(attr => { counts.total[`get_${attr}`] = (counts.total[`get_${attr}`] || 0) + count; });
        }
    });

    selectedIds = store.planCards?.[activePlan] || [];
    selectedIds.forEach(id => {
        // 비활성화된 카드는 무시
        if (state.disabledCards[id]) return;

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
        // 비활성화된 카드는 무시
        if (state.disabledCards[cardId]) return;

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
                            let countForThisTrigger = 0;
                            if (t === 'lesson') {
                                if (card.type === 'vocal') countForThisTrigger = (counts.lessons.vocal.normal + counts.lessons.vocal.sp);
                                else if (card.type === 'dance') countForThisTrigger = (counts.lessons.dance.normal + counts.lessons.dance.sp);
                                else if (card.type === 'visual') countForThisTrigger = (counts.lessons.visual.normal + counts.lessons.visual.sp);
                                else countForThisTrigger = (counts.lessons.vocal.normal + counts.lessons.vocal.sp + counts.lessons.dance.normal + counts.lessons.dance.sp + counts.lessons.visual.normal + counts.lessons.visual.sp);
                            } else if (t === 'sp') {
                                if (card.type === 'vocal') countForThisTrigger = counts.lessons.vocal.sp;
                                else if (card.type === 'dance') countForThisTrigger = counts.lessons.dance.sp;
                                else if (card.type === 'visual') countForThisTrigger = counts.lessons.visual.sp;
                                else countForThisTrigger = (counts.lessons.vocal.sp + counts.lessons.dance.sp + counts.lessons.visual.sp);
                            } else if (t === 'class') {
                                countForThisTrigger = (counts.total['class_hajime'] || 0) + (counts.total['class_nia'] || 0);
                            } else if (t === 'gift') {
                                countForThisTrigger = (counts.total['gift_hajime'] || 0) + (counts.total['gift_nia'] || 0);
                            } else if (t === 'goout') {
                                countForThisTrigger = (counts.total['goout_hajime'] || 0) + (counts.total['goout_nia'] || 0);
                            } else {
                                countForThisTrigger = (counts.total[t] || 0);
                            }
                            totalTriggerCount += countForThisTrigger;
                        });
                        multiplier = Math.min(totalTriggerCount, counter);
                    }
                    if (multiplier > 0) {
                        const bonusValue = (eff.value || 1) * (eff.max ? Math.min(multiplier, eff.max) : multiplier);
                        const rawTarget = eff.target || eff.targets; // target 우선, targets 하위호환
                        const targetList = Array.isArray(rawTarget) ? rawTarget : (rawTarget ? [rawTarget] : []);

                        targetList.forEach(t => {
                            if (t === 'delete_t' || t === 'get_t') counts.total[t] += bonusValue;
                            else if (counts.total.hasOwnProperty(t)) counts.total[t] += bonusValue;
                            else counts.total[t] = (counts.total[t] || 0) + bonusValue;
                        });
                    }
                }
            });
        }
    });

    // --- 하지메(Hajime) P-아이템 보너스 ---
    if (store.type === 'hajime' && store.pItems) {
        if (store.pItems.includes('hajime2')) {
            const classCount = counts.total['class_hajime'] || 0;
            const bonus = Math.min(classCount, 2);
            counts.total.get += bonus;
        }
    }

    // 6. 수동 분배 수치 자동 할당 및 합산 (모든 트리거 합산 후 최종 수행)
    const currentEnhancePool = counts.total.enhance || 0;
    let em = Number(store.manualEnhance?.m) || 0;
    let ea = Number(store.manualEnhance?.a) || 0;
    if (currentEnhancePool === 0) { em = 0; ea = 0; }
    else {
        let diffE = currentEnhancePool - (em + ea);
        if (diffE > 0) em += diffE;
        else if (diffE < 0) {
            const reduceM = Math.min(em, Math.abs(diffE)); em -= reduceM; diffE += reduceM;
            if (diffE < 0) ea = Math.max(0, ea + diffE);
        }
    }
    store.manualEnhance = { m: em, a: ea };
    counts.total.enhance_m += em; counts.total.enhance_a += ea;

    const currentDeletePool = counts.total.delete || 0;
    let dm = Number(store.manualDelete?.m) || 0;
    let da = Number(store.manualDelete?.a) || 0;
    let dt = Number(store.manualDelete?.t) || 0;
    if (currentDeletePool === 0) { dm = 0; da = 0; dt = 0; }
    else {
        let diffD = currentDeletePool - (dm + da + dt);
        if (diffD > 0) dm += diffD;
        else if (diffD < 0) {
            let absDiff = Math.abs(diffD);
            const redM = Math.min(dm, absDiff); dm -= redM; absDiff -= redM;
            const redA = Math.min(da, absDiff); da -= redA; absDiff -= redA;
            if (absDiff > 0) dt = Math.max(0, dt - absDiff);
        }
    }
    store.manualDelete = { m: dm, a: da, t: dt };
    counts.total.delete_m += dm; counts.total.delete_a += da; 

    // [잠금] 최종 트러블 삭제량은 획득량을 절대로 넘을 수 없음
    counts.total.delete_t_before_cap = (counts.total.delete_t || 0) + dt;
    counts.total.delete_t = Math.min(counts.total.delete_t_before_cap, counts.total.get_t || 0);

    return counts;
}/**
 * 전역 상태를 바탕으로 최종 합계 스탯 계산
 */
export function calculateTotals(store, detailedCounts) {
    let baseTotal = { vocal: 0, dance: 0, visual: 0 };
    let idolBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let supportFixedTotal = { vocal: 0, dance: 0, visual: 0 };
    let supportPercentTotal = { vocal: 0, dance: 0, visual: 0 };
    let itemBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let percentBonuses = { vocal: 0, dance: 0, visual: 0 };

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

    const currentIdolData = idolData[store.selectedIdol];
    if (currentIdolData) {
        idolBonusTotal.vocal = Math.floor(baseTotal.vocal * (currentIdolData.vocalBonus / 100));
        idolBonusTotal.dance = Math.floor(baseTotal.dance * (currentIdolData.danceBonus / 100));
        idolBonusTotal.visual = Math.floor(baseTotal.visual * (currentIdolData.visualBonus / 100));
    }

    const activePlan = store.planType || 'sense', selectedIds = store.planCards[activePlan] || [];
    selectedIds.forEach(cardId => {
        if (state.disabledCards[cardId]) return;
        const card = cardList.find(c => c.id === cardId); if (!card) return;
        
        // --- 리팩토링: 공통 엔진을 사용하여 모든 고정 보너스(어빌리티 + 아이템) 통합 계산 ---
        const lb = state.supportLB[cardId] || 0;
        const itemCounter = store.cardChecked[cardId] ? (store.itemCounters[cardId] || 0) : 0;
        const bonus = calculateCardBonus(card, detailedCounts, lb, itemCounter);
        
        supportFixedTotal.vocal += bonus.vocal || 0; 
        supportFixedTotal.dance += bonus.dance || 0; 
        supportFixedTotal.visual += bonus.visual || 0;
        
        if (bonus.percent > 0) percentBonuses[card.type] += bonus.percent;
    });

    supportPercentTotal.vocal = Math.round(baseTotal.vocal * (percentBonuses.vocal / 100));
    supportPercentTotal.dance = Math.round(baseTotal.dance * (percentBonuses.dance / 100));
    supportPercentTotal.visual = Math.round(baseTotal.visual * (percentBonuses.visual / 100));

    const cardBonusTotal = {
        vocal: idolBonusTotal.vocal + supportFixedTotal.vocal + supportPercentTotal.vocal,
        dance: idolBonusTotal.dance + supportFixedTotal.dance + supportPercentTotal.dance,
        visual: idolBonusTotal.visual + supportFixedTotal.visual + supportPercentTotal.visual
    };

    return { 
        baseTotal, 
        cardBonusTotal,
        breakdown: {
            base: baseTotal,
            idol: {
                vocal: idolBonusTotal.vocal,
                dance: idolBonusTotal.dance,
                visual: idolBonusTotal.visual,
                percent: {
                    vocal: currentIdolData ? currentIdolData.vocalBonus : 0,
                    dance: currentIdolData ? currentIdolData.danceBonus : 0,
                    visual: currentIdolData ? currentIdolData.visualBonus : 0
                }
            },
            supportFixed: supportFixedTotal,
            supportPercent: {
                vocal: supportPercentTotal.vocal,
                dance: supportPercentTotal.dance,
                visual: supportPercentTotal.visual,
                factors: {
                    vocal: percentBonuses.vocal,
                    dance: percentBonuses.dance,
                    visual: percentBonuses.visual
                }
            },
            item: itemBonusTotal
        }
    };
    }