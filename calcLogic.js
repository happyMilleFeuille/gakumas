// calcLogic.js
import { state } from './state.js';
import { calcPlans, baseStats, idolData, niaAuditionStats, hajimeLessonStats, niaLessonStats, hifLessonStats, hajimeClassStats, niaClassStats, hifClassStats, hifTestStats } from './calcData.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { activityOptions } from './calcOptions.js';
import { calculateCardBonus } from './simulator-engine.js';
import { pItemDescriptions } from './pItemData.js';

const hifClassActionIds = ['class_hif', 'class_hif0', 'class_hif1'];

/**
 * 하지메(Hajime) 전용 레슨 수치 로직
 */
export const getHajimeLessonStat = (actionId, isSP, week) => {
    let stats = { vocal: 0, dance: 0, visual: 0 };
    const weekData = hajimeLessonStats[week];
    if (!weekData) return null;
    const values = isSP ? weekData.sp : weekData.normal;

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
    const step = niaLessonStats.find(s => week <= s.maxWeek) || niaLessonStats[niaLessonStats.length - 1];
    let val = isSP ? step.sp : step.normal;

    return {
        vocal: actionId === 'lessonvo' ? val : 0,
        dance: actionId === 'lessondan' ? val : 0,
        visual: actionId === 'lessonvi' ? val : 0
    };
};

/**
 * HIF 전용 레슨 수치 로직
 */
export const getHifLessonStat = (actionId, isSP, week, selectedSubAttr = null) => {
    const weekStat = hifLessonStats.byWeek?.[week];
    const rangeStat = (hifLessonStats.ranges || []).find(s => week <= s.maxWeek) || null;
    const step = weekStat || rangeStat;
    if (!step) return null;
    const val = isSP ? step.sp : step.normal;
    const subVal = isSP ? step.subSp : step.subNormal;
    const stats = { vocal: 0, dance: 0, visual: 0 };

    if (actionId === 'lessonvo') {
        stats.vocal = val || 0;
    } else if (actionId === 'lessondan') {
        stats.dance = val || 0;
    } else if (actionId === 'lessonvi') {
        stats.visual = val || 0;
    }

    if (selectedSubAttr) {
        stats[selectedSubAttr] = subVal || 0;
    }

    return stats;
};

/**
 * 전역 상태(Store) 객체를 바탕으로 트리거 횟수를 정밀하게 집계
 */
export function getTriggerCounts(store) {
    const counts = {
        total: { enhance: 0, enhance_m: 0, enhance_a: 0, delete: 0, delete_m: 0, delete_a: 0, delete_t: 0, get: 0, get_m: 0, get_a: 0, get_t: 0, get_drink: 0, purchase_drink: 0, purchase_card: 0, get_item: ((store.type === 'nia' || store.type === 'hif') ? 1 : 0), change: 0 },
        lessons: { vocal: { normal: 0, sp: 0 }, dance: { normal: 0, sp: 0 }, visual: { normal: 0, sp: 0 } }
    };

    // 1. 보드 행동(Weeks) 분석 및 기본 풀(Pool) 집계
    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum];
        if (!week || !week.value) return;
        const actionId = week.value, opts = week.opts || {}, isSP = opts.sp === 'true';

        counts.total[actionId] = (counts.total[actionId] || 0) + 1;

        // 범용 트리거 통합 집계 (아이템 트리거 연동용)
        const classIds = ['class', 'class_hajime', 'class_nia', 'class_hif0', 'class_hif1'];
        const gooutIds = ['goout', 'goout_hajime', 'goout_nia', 'goout_hif'];
        const giftIds = ['gift', 'gift_hajime', 'gift_nia', 'gift_hif'];

        if (classIds.includes(actionId)) counts.total.class = (counts.total.class || 0) + 1;
        if (gooutIds.includes(actionId)) counts.total.goout = (counts.total.goout || 0) + 1;
        if (giftIds.includes(actionId)) counts.total.gift = (counts.total.gift || 0) + 1;

        const planData = store.type === 'hajime' ? calcPlans.hajime : (calcPlans[store.type] || calcPlans.nia);
        const weekOptions = planData.weeks[weekNum] || [];
        const actionDef = weekOptions.find(o => o.value === actionId);
        if (actionDef && actionDef.results) {
            actionDef.results.forEach(rid => {
                const id = rid.trim();
                if (id === 'get') counts.total.get++;
                else if (id === 'get_t') { counts.total.get_t++; counts.total.get++; }
                else if (id === 'delete') counts.total.delete++;
                else if (id === 'delete_t') counts.total.delete_t++;
                else if (id === 'get_drink') counts.total.get_drink++;
                else if (id === 'purchase_card') { counts.total.purchase_card = (counts.total.purchase_card || 0) + 1; counts.total.get++; }
                else counts.total[id] = (counts.total[id] || 0) + 1;
            });
        }

        // [추가] 강화주간(kyouka) 보너스: 특정 주차 시험/오디션 시 아이템 획득 +1
        if (store.isKyouka) {
            const wInt = parseInt(weekNum);
            if (store.type === 'hajime' && wInt === 10 && actionId === 'test') {
                counts.total.get_item++;
            } else if (store.type === 'nia' && (wInt === 9 || wInt === 17) && actionId === 'audition') {
                counts.total.get_item++;
            } else if (store.type === 'hif' && wInt === 27 && actionId === 'round_hif') {
                counts.total.get_item++;
            }
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
                else if (id === 'get_t') { counts.total.get += countInc; counts.total.get_t += countInc; }
                else if (id === 'purchase_card') {
                    counts.total.purchase_card = (counts.total.purchase_card || 0) + countInc;
                    counts.total.get += countInc;
                }
                else if (counts.total.hasOwnProperty(id)) counts.total[id] += countInc;
                else counts.total[id] = (counts.total[id] || 0) + countInc;
            });
        });
    });

    // 2. Nia 전용 P-아이템 보너스
    if (store.type === 'nia' && store.pItems) {
        const boardCounts = {};
        Object.values(store.weeks).forEach(w => { if (w.value) boardCounts[w.value] = (boardCounts[w.value] || 0) + 1; });
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
            Object.values(store.weeks).forEach(w => { if (w.value === 'class_nia' && w.opts.get_drink === 'true') n42++; });
            counts.total.get_drink = (counts.total.get_drink || 0) + (Math.min(n42, 2) * 2);
        }
        if (store.pItems.includes('nia5-1')) {
            Object.keys(store.weeks).forEach(w => {
                if (parseInt(w) > 17 && store.weeks[w].opts.sp === 'true') niaBonusEnhance += 1;
            });
        }
        counts.total.get += niaBonusGet;
        counts.total.delete += niaBonusDelete;
        counts.total.enhance += niaBonusEnhance;
    }

    // --- 하지메(Hajime) P-아이템 보너스 ---
    if (store.type === 'hajime' && store.pItems) {
        if (store.pItems.includes('hajime2')) {
            const classCount = (counts.total['class_hajime'] || 0);
            const bonus = Math.min(classCount, 3);
            counts.total.get += bonus;
        }
    }

    // --- HIF P-아이템 보너스 (메인 효과 + 서브 효과 둘 다 누적) ---
    if (store.type === 'hif' && store.pItems) {
        const applyHifItemEffects = (effects, itemId) => {
            const dashCount = (itemId.match(/-/g) || []).length;

            let lessonWeeks = [9, 11];
            let allowedWeeks = Object.keys(store.weeks).map(Number);
            if (dashCount === 1) {
                lessonWeeks = [15, 18];
                allowedWeeks = [14, 15, 16, 17, 18, 19];
            } else if (dashCount === 2) {
                lessonWeeks = [22, 25];
                allowedWeeks = [21, 22, 23, 24, 25, 26];
            }

            effects.forEach(eff => {
                let multiplier = 1;
                if (eff.trigger) {
                    const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                    let totalTriggerCount = 0;
                    triggers.forEach(t => {
                        if (t === 'lesson') {
                            let lessonCount = 0;
                            lessonWeeks.forEach(w => {
                                const week = store.weeks[w];
                                if (week && week.value && ['lessonvo', 'lessondan', 'lessonvi'].includes(week.value)) {
                                    lessonCount++;
                                }
                            });
                            totalTriggerCount += lessonCount;
                        } else {
                            allowedWeeks.forEach(w => {
                                const week = store.weeks[w];
                                if (!week || !week.value) return;
                                const actionId = week.value;

                                let matches = false;
                                if (t === 'advice') {
                                    matches = (actionId === 'advice');
                                } else if (t === 'gift') {
                                    matches = ['gift', 'gift_hajime', 'gift_nia', 'gift_hif'].includes(actionId);
                                } else if (t === 'goout') {
                                    matches = ['goout', 'goout_hajime', 'goout_nia', 'goout_hif'].includes(actionId);
                                }

                                if (matches) {
                                    totalTriggerCount++;
                                }
                            });
                        }
                    });
                    multiplier = eff.max ? Math.min(totalTriggerCount, eff.max) : totalTriggerCount;
                }

                if (multiplier > 0) {
                    const rawTarget = eff.target || eff.targets;
                    if (rawTarget) {
                        const targets = Array.isArray(rawTarget) ? rawTarget : [rawTarget];
                        targets.forEach(t => {
                            const bonusValue = multiplier;
                            if (t === 'delete_t') counts.total[t] = (counts.total[t] || 0) + bonusValue;
                            else if (t === 'get_t') {
                                counts.total[t] = (counts.total[t] || 0) + bonusValue;
                                counts.total.get = (counts.total.get || 0) + bonusValue;
                            }
                            else if (counts.total.hasOwnProperty(t)) counts.total[t] += bonusValue;
                            else counts.total[t] = (counts.total[t] || 0) + bonusValue;
                        });
                    }
                }
            });
        };

        // 1. 메인 아이템 효과 적용
        store.pItems.forEach(itemId => {
            if (!itemId) return;
            const itemDef = pItemDescriptions.hif?.find(d => d.icons.includes(itemId));
            if (itemDef && itemDef.item_effects) {
                applyHifItemEffects(itemDef.item_effects, itemId);
            }
        });

        // 2. 서브 옵션 효과 적용 (메인과 둘 다 중첩해서 획득)
        if (store.pItemSubOpts) {
            store.pItemSubOpts.forEach(subOptId => {
                if (!subOptId) return;
                let foundSub = null;
                pItemDescriptions.hif?.forEach(item => {
                    if (item.subOptions) {
                        const sub = item.subOptions.find(s => s.id === subOptId);
                        if (sub) foundSub = sub;
                    }
                });
                if (foundSub && foundSub.item_effects) {
                    applyHifItemEffects(foundSub.item_effects, subOptId);
                }
            });
        }

        // 3. 서브-서브 옵션 효과 적용 (메인, 서브, 서브-서브 셋 다 중첩해서 획득)
        if (store.pItemSubSubOpts) {
            store.pItemSubSubOpts.forEach(subSubOptId => {
                if (!subSubOptId) return;
                let foundSubSub = null;
                pItemDescriptions.hif?.forEach(item => {
                    item.subOptions?.forEach(sub => {
                        if (sub.subOptions) {
                            const subSub = sub.subOptions.find(s => s.id === subSubOptId);
                            if (subSub) foundSubSub = subSub;
                        }
                    });
                });
                if (foundSubSub && foundSubSub.item_effects) {
                    applyHifItemEffects(foundSubSub.item_effects, subSubOptId);
                }
            });
        }
    }

    // 3. 서포트 카드 엑스트라 옵션 (강화/삭제/체인지) 합산
    let activePlan = store.planType || 'sense';
    let selectedIds = store.planCards[activePlan] || [];
    selectedIds.forEach(id => {
        // 비활성화된 카드는 무시 (단, 6번째 렌탈 슬롯은 예외)
        const isSixth = selectedIds.indexOf(id) === 5;
        if (state.disabledCards[id] && !isSixth) return;

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
            if (skill.primastella) counts.total.get += count;
        }
    });



    selectedIds = store.planCards?.[activePlan] || [];
    selectedIds.forEach(id => {
        if (!id) return;
        // 비활성화된 카드는 무시 (단, 6번째 렌탈 슬롯은 예외)
        const isSixth = selectedIds.indexOf(id) === 5;
        if (state.disabledCards[id] && !isSixth) return;

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
        if (!cardId) return;
        const isSixth = selectedIds.indexOf(cardId) === 5;
        if (state.disabledCards[cardId] && !isSixth) return;

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
                            } else if (t === 'class' || t === 'gift' || t === 'goout') {
                                countForThisTrigger = (counts.total[t] || 0);
                            } else {
                                countForThisTrigger = (counts.total[t] || 0);
                            }
                            totalTriggerCount += countForThisTrigger;
                        });
                        multiplier = Math.min(totalTriggerCount, counter);
                    }
                    if (multiplier > 0) {
                        const bonusValue = (eff.value || 1) * (eff.max ? Math.min(multiplier, eff.max) : multiplier);
                        const rawTarget = eff.target || eff.targets;
                        const targetList = Array.isArray(rawTarget) ? rawTarget : (rawTarget ? [rawTarget] : []);
                        targetList.forEach(t => {
                            if (t === 'delete_t') counts.total[t] += bonusValue;
                            else if (t === 'get_t') {
                                counts.total[t] = (counts.total[t] || 0) + bonusValue;
                                counts.total.get = (counts.total.get || 0) + bonusValue;
                            }
                            else if (counts.total.hasOwnProperty(t)) counts.total[t] += bonusValue;
                            else counts.total[t] = (counts.total[t] || 0) + bonusValue;
                        });
                    }
                }
            });
        }
    });

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

    // 총 카드 삭제/강화 횟수 최종 갱신 (트러블 삭제 및 각 카드 종류별 삭제/강화 합산)
    counts.total.delete = (counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0);
    counts.total.enhance = (counts.total.enhance_m || 0) + (counts.total.enhance_a || 0);

    return counts;
}/**
 * 전역 상태를 바탕으로 최종 합계 스탯 계산
 */
export function calculateTotals(store, detailedCounts) {
    let itemBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let baseTotal = { vocal: 0, dance: 0, visual: 0 };
    let lessonTotal = { vocal: 0, dance: 0, visual: 0 };
    let examTotal = { vocal: 0, dance: 0, visual: 0 };
    let examFlatTotal = { vocal: 0, dance: 0, visual: 0 };
    let classTotal = { vocal: 0, dance: 0, visual: 0 };

    let hifFixedTotal = { vocal: 0, dance: 0, visual: 0 };
    let hifPercentFactors = { vocal: 0, dance: 0, visual: 0 };
    let hifPercentTotal = { vocal: 0, dance: 0, visual: 0 };

    if (store.type === 'hif' && store.hifStats) {
        ['vocal', 'dance', 'visual'].forEach(attr => {
            const count = store.hifStats[attr] || 0;
            hifFixedTotal[attr] += count * 20;
            hifPercentFactors[attr] += count * 2;
        });
    }


    // --- [Pre-calculate Percentage Bonuses] ---
    // 1. Idol Percentages
    const currentIdolData = idolData[store.selectedIdol];
    let idolPercs = { vocal: 0, dance: 0, visual: 0 };
    if (currentIdolData) {
        const isBloom3 = !!store.pItemChecked;
        const isSR = !!store.isSR;
        const affinityEntries = Object.values(currentIdolData.affinity || {});
        const affinityBonusTotal = affinityEntries.reduce((acc, entry) => ({
            vocal: acc.vocal + (entry?.bonus?.vocal || 0),
            dance: acc.dance + (entry?.bonus?.dance || 0),
            visual: acc.visual + (entry?.bonus?.visual || 0)
        }), { vocal: 0, dance: 0, visual: 0 });

        // 신규 스키마 (bonus 객체 존재 시)
        if (currentIdolData.bonus) {
            const rarityKey = isSR ? 'sr' : 'ssr';
            const baseBonus = currentIdolData.bonus[rarityKey].base;
            const bloom3Bonus = isBloom3 ? (currentIdolData.bonus[rarityKey].bloom3 || { vocal: 0, dance: 0, visual: 0 }) : { vocal: 0, dance: 0, visual: 0 };

            idolPercs.vocal = (baseBonus.vocal || 0) + (bloom3Bonus.vocal || 0) + affinityBonusTotal.vocal;
            idolPercs.dance = (baseBonus.dance || 0) + (bloom3Bonus.dance || 0) + affinityBonusTotal.dance;
            idolPercs.visual = (baseBonus.visual || 0) + (bloom3Bonus.visual || 0) + affinityBonusTotal.visual;
        }
        // 기존 스키마 호환
        else {
            if (isSR) {
                idolPercs.vocal = currentIdolData.srVocalBonus || currentIdolData.vocalBonus;
                idolPercs.dance = currentIdolData.srDanceBonus || currentIdolData.danceBonus;
                idolPercs.visual = currentIdolData.srVisualBonus || currentIdolData.visualBonus;
                if (isBloom3) {
                    if (currentIdolData.srVocalBonus3) idolPercs.vocal = currentIdolData.srVocalBonus3;
                    if (currentIdolData.srDanceBonus3) idolPercs.dance = currentIdolData.srDanceBonus3;
                    if (currentIdolData.srVisualBonus3) idolPercs.visual = currentIdolData.srVisualBonus3;
                }
            } else {
                idolPercs.vocal = currentIdolData.vocalBonus;
                idolPercs.dance = currentIdolData.danceBonus;
                idolPercs.visual = currentIdolData.visualBonus;
                if (isBloom3) {
                    if (currentIdolData.vocalBonus3) idolPercs.vocal = currentIdolData.vocalBonus3;
                    if (currentIdolData.danceBonus3) idolPercs.dance = currentIdolData.danceBonus3;
                    if (currentIdolData.visualBonus3) idolPercs.visual = currentIdolData.visualBonus3;
                }
            }
        }
    }

    // 2. Support Card Percentages
    const activePlan = store.planType || 'sense', selectedIds = store.planCards[activePlan] || [];
    let supportPercs = { vocal: 0, dance: 0, visual: 0 };
    let supportFixedTotal = { vocal: 0, dance: 0, visual: 0, factors: {} };

    selectedIds.forEach(cardId => {
        if (!cardId) return;
        if (state.disabledCards[cardId] && selectedIds.indexOf(cardId) !== 5) return;
        const card = cardList.find(c => c.id === cardId); if (!card) return;
        const lb = (selectedIds.indexOf(cardId) === 5) ? 4 : (state.supportLB[cardId] || 0);
        const itemCounter = store.cardChecked[cardId] ? (store.itemCounters[cardId] || 0) : 0;
        const includeEvent = !!store.cardEventChecked[cardId];
        const bonusResult = calculateCardBonus(card, detailedCounts, lb, itemCounter, includeEvent);

        supportFixedTotal.vocal += bonusResult.vocal || 0;
        supportFixedTotal.dance += bonusResult.dance || 0;
        supportFixedTotal.visual += bonusResult.visual || 0;

        if (bonusResult.breakdowns) {
            Object.keys(bonusResult.breakdowns).forEach(key => {
                if (!supportFixedTotal.factors[key]) supportFixedTotal.factors[key] = { vocal: 0, dance: 0, visual: 0 };
                supportFixedTotal.factors[key].vocal += bonusResult.breakdowns[key].vocal || 0;
                supportFixedTotal.factors[key].dance += bonusResult.breakdowns[key].dance || 0;
                supportFixedTotal.factors[key].visual += bonusResult.breakdowns[key].visual || 0;
            });
        }

        if (bonusResult.percent > 0) supportPercs[card.type] += bonusResult.percent;
    });

    // 3. Memory Percentages
    let memoryPercentFactors = { vocal: 0, dance: 0, visual: 0 };
    let memoryBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    if (store.memories) {
        store.memories.forEach(memArray => {
            if (!memArray) return;
            const keys = Array.isArray(memArray) ? memArray : [memArray];
            keys.forEach(memKey => {
                const opt = window.calcData?.memoryOptions?.[memKey];
                if (opt) {
                    if (opt.isPercent) {
                        if (Array.isArray(opt.stat)) opt.stat.forEach(s => { memoryPercentFactors[s] += opt.value; });
                        else memoryPercentFactors[opt.stat] += opt.value;
                    } else {
                        if (Array.isArray(opt.stat)) opt.stat.forEach(s => { memoryBonusTotal[s] += opt.value; });
                        else memoryBonusTotal[opt.stat] += opt.value;
                    }
                }
            });
        });
    }

    // Total Percentage sum for Nia calculation
    const totalPercs = {
        vocal: idolPercs.vocal + supportPercs.vocal + memoryPercentFactors.vocal + hifPercentFactors.vocal,
        dance: idolPercs.dance + supportPercs.dance + memoryPercentFactors.dance + hifPercentFactors.dance,
        visual: idolPercs.visual + supportPercs.visual + memoryPercentFactors.visual + hifPercentFactors.visual
    };

    // --- [Weekly Loop] ---
    let idolBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let supportPercentTotal = { vocal: 0, dance: 0, visual: 0 };
    let memoryPercentTotal = { vocal: 0, dance: 0, visual: 0 };
    let itemBaseBonusTotal = { vocal: 0, dance: 0, visual: 0 };
    let itemPercBonusTotal = { vocal: 0, dance: 0, visual: 0 };

    const applyLessonBonus = (base, attr) => {
        if (!base || base <= 0) return;
        const totalP = totalPercs[attr];
        const unifiedTotal = Math.floor(base * (totalP / 100));
        if (unifiedTotal === 0) return;

        const percs = {
            idol: idolPercs[attr],
            support: supportPercs[attr],
            memory: memoryPercentFactors[attr],
            hif: hifPercentFactors[attr]
        };

        let idolVal = Math.floor(base * (percs.idol / 100));
        let supportVal = Math.floor(base * (percs.support / 100));
        let memoryVal = Math.floor(base * (percs.memory / 100));
        let hifVal = Math.floor(base * (percs.hif / 100));

        const diff = unifiedTotal - (idolVal + supportVal + memoryVal + hifVal);
        if (diff !== 0) {
            const raw = [base * (percs.idol / 100), base * (percs.support / 100), base * (percs.memory / 100), base * (percs.hif / 100)];
            const maxIdx = raw.indexOf(Math.max(...raw));
            if (maxIdx === 0) idolVal += diff;
            else if (maxIdx === 1) supportVal += diff;
            else if (maxIdx === 2) memoryVal += diff;
            else hifVal += diff;
        }

        idolBonusTotal[attr] += idolVal;
        supportPercentTotal[attr] += supportVal;
        memoryPercentTotal[attr] += memoryVal;
        hifPercentTotal[attr] += hifVal;
    };

    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum]; if (!week || !week.value) return;
        const actionId = week.value, isSP = week.opts.sp === 'true', wInt = parseInt(weekNum);
        let stats = null;
        if (store.type === 'nia' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) stats = getNiaLessonStat(actionId, isSP, wInt);
        else if (store.type === 'hif' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) stats = getHifLessonStat(actionId, isSP, wInt, week.opts.selectedSubAttr);
        else if (store.type === 'hajime' && ['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) stats = getHajimeLessonStat(actionId, isSP, wInt) || (isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId]);
        else if ((store.type === 'nia' || store.type === 'hif') && actionId === 'audition') {
            const data = idolData[store.selectedIdol];
            if (data) {
                const stage = wInt === 9 ? 1 : (wInt === 17 ? 2 : (wInt === 26 ? 3 : 0)), stageStats = niaAuditionStats[stage];
                if (stageStats) {
                    const vals = data.growthType === 'protruded' ? stageStats.protruded : stageStats.balanced;
                    stats = { vocal: 0, dance: 0, visual: 0 };
                    data.priority.forEach((attr, idx) => {
                        const baseVal = vals[idx];
                        stats[attr] = baseVal;
                        // 니아 오디션 수치 보너스 (상세공식 반영)
                        // 1. 기본 보너스: floor(기본 수치 * 0.55)
                        const bonusA = Math.floor(baseVal * 0.55);
                        // 2. % 추가분 보너스: floor(floor(기본 수치 * 총%합산 / 100) * 0.55)
                        const bonusB = Math.floor(Math.floor(baseVal * (totalPercs[attr] / 100)) * 0.55);

                        itemBaseBonusTotal[attr] += bonusA;
                        itemPercBonusTotal[attr] += bonusB;
                    });
                }
            }
        } else if (store.type === 'hif' && actionId === 'test') {
            const manualVo = parseInt(week.opts.hif_test_vocal);
            const manualDa = parseInt(week.opts.hif_test_dance);
            const manualVi = parseInt(week.opts.hif_test_visual);
            const hasManualInput = !isNaN(manualVo) || !isNaN(manualDa) || !isNaN(manualVi);

            if (hasManualInput) {
                stats = {
                    vocal: isNaN(manualVo) ? 0 : manualVo,
                    dance: isNaN(manualDa) ? 0 : manualDa,
                    visual: isNaN(manualVi) ? 0 : manualVi
                };

                // [% 포함] 옵션이 켜져있다면, 입력한 수치를 (1 + 현재보너스%)로 나누어 베이스 수치로 역산
                if (week.opts.hif_test_use_perc === 'true') {
                    ['vocal', 'dance', 'visual'].forEach(attr => {
                        if (stats[attr] > 0) {
                            const bonusFactor = 1 + (totalPercs[attr] / 100);
                            const rawBase = stats[attr] / bonusFactor;
                            // 소수점 4째자리에서 반올림 후 올림 처리 (더 정밀한 오차 방지)
                            stats[attr] = Math.ceil(Math.round(rawBase * 10000) / 10000);
                        }
                    });
                }
            } else {
                const testStat = hifTestStats[wInt];
                const data = idolData[store.selectedIdol];
                stats = { vocal: 0, dance: 0, visual: 0 };
                if (testStat && data?.priority?.length === 3) {
                    stats[data.priority[0]] = testStat.first ?? 0;
                    stats[data.priority[1]] = testStat.second ?? 0;
                    stats[data.priority[2]] = testStat.third ?? 0;
                }
            }
        } else if (actionId === 'class_hajime' || actionId === 'class_nia' || hifClassActionIds.includes(actionId)) {
            const selectedAttr = week.opts.selectedAttr;
            stats = { vocal: 0, dance: 0, visual: 0 };
            if (selectedAttr) {
                let baseVal = 100;
                if (actionId === 'class_hajime') {
                    baseVal = hajimeClassStats[wInt] || 100;
                } else if (hifClassActionIds.includes(actionId)) {
                    baseVal = hifClassStats[wInt] || 100;
                } else if (actionId === 'class_nia') {
                    baseVal = niaClassStats[wInt] || 100;
                }
                stats[selectedAttr] = baseVal;
            }
        } else stats = isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId];

        if (stats) {
            if (actionId === 'class_hajime' || actionId === 'class_nia' || hifClassActionIds.includes(actionId)) {
                classTotal.vocal += stats.vocal || 0;
                classTotal.dance += stats.dance || 0;
                classTotal.visual += stats.visual || 0;
            } else {
                // 레슨/시험 개별 내림 보너스
                ['vocal', 'dance', 'visual'].forEach(attr => {
                    if (stats[attr] > 0) applyLessonBonus(stats[attr], attr);
                });

                baseTotal.vocal += stats.vocal || 0;
                baseTotal.dance += stats.dance || 0;
                baseTotal.visual += stats.visual || 0;

                if (actionId === 'test' || actionId === 'audition') {
                    examTotal.vocal += stats.vocal || 0;
                    examTotal.dance += stats.dance || 0;
                    examTotal.visual += stats.visual || 0;

                    if (store.type === 'hajime') {
                        let bonusVal = 0;
                        if (wInt === 10) bonusVal = 80;
                        else if (wInt === 18) bonusVal = 160;
                        if (bonusVal > 0) {
                            examFlatTotal.vocal += bonusVal;
                            examFlatTotal.dance += bonusVal;
                            examFlatTotal.visual += bonusVal;
                        }
                    }
                } else {
                    lessonTotal.vocal += stats.vocal || 0;
                    lessonTotal.dance += stats.dance || 0;
                    lessonTotal.visual += stats.visual || 0;
                }
            }
        }
    });

    let idolBaseTotal = { vocal: 0, dance: 0, visual: 0 };
    if (currentIdolData) {
        const isSR = !!store.isSR;
        const affinityEntries = Object.values(currentIdolData.affinity || {});
        const affinityBaseTotal = affinityEntries.reduce((acc, entry) => ({
            vocal: acc.vocal + (entry?.base?.vocal || 0),
            dance: acc.dance + (entry?.base?.dance || 0),
            visual: acc.visual + (entry?.base?.visual || 0)
        }), { vocal: 0, dance: 0, visual: 0 });
        // 신규 스키마 (baseStats 존재 시)
        if (currentIdolData.baseStats) {
            const base = currentIdolData.baseStats[isSR ? 'sr' : 'ssr'];

            idolBaseTotal.vocal = (base.vocal || 0) + affinityBaseTotal.vocal;
            idolBaseTotal.dance = (base.dance || 0) + affinityBaseTotal.dance;
            idolBaseTotal.visual = (base.visual || 0) + affinityBaseTotal.visual;
        }
        // 기존 스키마 호환
        else {
            if (isSR) {
                idolBaseTotal.vocal = currentIdolData.srBaseVocal || (currentIdolData.baseVocal - 5) || 0;
                idolBaseTotal.dance = currentIdolData.srBaseDance || (currentIdolData.baseDance - 5) || 0;
                idolBaseTotal.visual = currentIdolData.srBaseVisual || (currentIdolData.baseVisual - 5) || 0;
            } else {
                idolBaseTotal.vocal = currentIdolData.baseVocal || 0;
                idolBaseTotal.dance = currentIdolData.baseDance || 0;
                idolBaseTotal.visual = currentIdolData.baseVisual || 0;
            }
        }
    }

    // --- 5. P-아이템 효과 합산 ---
    if (store.pItems) {
        store.pItems.forEach(itemId => {
            if (!itemId) return;
            const cardGetCount = detailedCounts.total.get || 0;
            if (itemId === 'hajime1-1') itemBaseBonusTotal.vocal += 15 * Math.min(cardGetCount, 5);
            else if (itemId === 'hajime1-2') itemBaseBonusTotal.dance += 15 * Math.min(cardGetCount, 5);
            else if (itemId === 'hajime1-3') itemBaseBonusTotal.visual += 15 * Math.min(cardGetCount, 5);
        });
    }

    const bonusTotal = {
        vocal: idolBonusTotal.vocal + supportFixedTotal.vocal + supportPercentTotal.vocal + itemBaseBonusTotal.vocal + itemPercBonusTotal.vocal + memoryBonusTotal.vocal + memoryPercentTotal.vocal + hifFixedTotal.vocal + hifPercentTotal.vocal,
        dance: idolBonusTotal.dance + supportFixedTotal.dance + supportPercentTotal.dance + itemBaseBonusTotal.dance + itemPercBonusTotal.dance + memoryBonusTotal.dance + memoryPercentTotal.dance + hifFixedTotal.dance + hifPercentTotal.dance,
        visual: idolBonusTotal.visual + supportFixedTotal.visual + supportPercentTotal.visual + itemBaseBonusTotal.visual + itemPercBonusTotal.visual + memoryBonusTotal.visual + memoryPercentTotal.visual + hifFixedTotal.visual + hifPercentTotal.visual
    };

    const finalTotal = {
        vocal: idolBaseTotal.vocal + baseTotal.vocal + classTotal.vocal + examFlatTotal.vocal + bonusTotal.vocal,
        dance: idolBaseTotal.dance + baseTotal.dance + classTotal.dance + examFlatTotal.dance + bonusTotal.dance,
        visual: idolBaseTotal.visual + baseTotal.visual + classTotal.visual + examFlatTotal.visual + bonusTotal.visual
    };

    return {
        baseTotal,
        bonusTotal,
        finalTotal,
        breakdown: {
            base: baseTotal,
            lesson: lessonTotal,
            exam: {
                vocal: examTotal.vocal + examFlatTotal.vocal,
                dance: examTotal.dance + examFlatTotal.dance,
                visual: examTotal.visual + examFlatTotal.visual
            },
            class: classTotal,
            idolBase: idolBaseTotal,
            idol: {
                vocal: idolBonusTotal.vocal,
                dance: idolBonusTotal.dance,
                visual: idolBonusTotal.visual,
                percent: {
                    vocal: idolPercs.vocal,
                    dance: idolPercs.dance,
                    visual: idolPercs.visual
                }
            },
            supportFixed: supportFixedTotal,
            supportPercent: {
                vocal: supportPercentTotal.vocal,
                dance: supportPercentTotal.dance,
                visual: supportPercentTotal.visual,
                factors: {
                    vocal: supportPercs.vocal,
                    dance: supportPercs.dance,
                    visual: supportPercs.visual
                }
            },
            item: {
                base: itemBaseBonusTotal,
                perc: itemPercBonusTotal
            },
            memory: {
                fixed: memoryBonusTotal,
                percent: {
                    vocal: memoryPercentTotal.vocal,
                    dance: memoryPercentTotal.dance,
                    visual: memoryPercentTotal.visual,
                    factors: memoryPercentFactors
                }
            },
            hif: {
                fixed: hifFixedTotal,
                percent: {
                    vocal: hifPercentTotal.vocal,
                    dance: hifPercentTotal.dance,
                    visual: hifPercentTotal.visual,
                    factors: hifPercentFactors
                }
            },
            totalPercs: totalPercs
        }
    };
}

/**
 * 특정 카드의 % 보너스가 현재 계획에서 실제로 몇 점을 올려주는지 계산 (레슨별 개별 내림 반영)
 */
export function getSupportPercentBonusForCard(store, cardPercent, cardType, totalPercs = null) {
    if (!cardPercent || !cardType || !store.weeks) return 0;
    let totalFlooredBonus = 0;

    Object.keys(store.weeks).forEach(weekNum => {
        const week = store.weeks[weekNum];
        if (!week || !week.value) return;
        const actionId = week.value, isSP = week.opts.sp === 'true', wInt = parseInt(weekNum);

        let stats = null;
        if (store.type === 'nia' || store.type === 'hif') {
            if (['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) {
                stats = store.type === 'hif'
                    ? getHifLessonStat(actionId, isSP, wInt, week.opts.selectedSubAttr)
                    : getNiaLessonStat(actionId, isSP, wInt);
            } else if (actionId === 'audition') {
                const data = idolData[store.selectedIdol];
                if (data) {
                    const stage = wInt === 9 ? 1 : (wInt === 17 ? 2 : (wInt === 26 ? 3 : 0));
                    const stageStats = niaAuditionStats[stage];
                    if (stageStats) {
                        const vals = data.growthType === 'protruded' ? stageStats.protruded : stageStats.balanced;
                        const baseVal = vals[data.priority.indexOf(cardType)];
                        if (baseVal) {
                            // 니아 오디션 % 보너스: UI 표시용으로는 계수(0.55) 없이 생수치로 계산
                            totalFlooredBonus += Math.floor(baseVal * (cardPercent / 100));
                        }
                    }
                }
            } else if (store.type === 'hif' && actionId === 'test') {
                const manualVo = parseInt(week.opts.hif_test_vocal);
                const manualDa = parseInt(week.opts.hif_test_dance);
                const manualVi = parseInt(week.opts.hif_test_visual);
                const hasManualInput = !isNaN(manualVo) || !isNaN(manualDa) || !isNaN(manualVi);

                if (hasManualInput) {
                    let val = 0;
                    if (cardType === 'vocal' && !isNaN(manualVo)) val = manualVo;
                    else if (cardType === 'dance' && !isNaN(manualDa)) val = manualDa;
                    else if (cardType === 'visual' && !isNaN(manualVi)) val = manualVi;

                    if (val > 0) {
                        let baseVal = val;
                        if (week.opts.hif_test_use_perc === 'true' && totalPercs) {
                            const bonusFactor = 1 + (totalPercs[cardType] / 100);
                            const rawBase = val / bonusFactor;
                            baseVal = Math.ceil(Math.round(rawBase * 10000) / 10000);
                        }
                        totalFlooredBonus += Math.floor(baseVal * (cardPercent / 100));
                    }
                } else {
                    const testStat = hifTestStats[wInt];
                    const data = idolData[store.selectedIdol];
                    if (testStat && data?.priority?.length === 3) {
                        const priorities = data.priority;
                        const idx = priorities.indexOf(cardType);
                        let baseVal = 0;
                        if (idx === 0) baseVal = testStat.first ?? 0;
                        else if (idx === 1) baseVal = testStat.second ?? 0;
                        else if (idx === 2) baseVal = testStat.third ?? 0;

                        if (baseVal > 0) {
                            totalFlooredBonus += Math.floor(baseVal * (cardPercent / 100));
                        }
                    }
                }
            }
        } else if (store.type === 'hajime') {
            if (['lessonvo', 'lessondan', 'lessonvi'].includes(actionId)) {
                stats = getHajimeLessonStat(actionId, isSP, wInt) || (isSP ? baseStats[`${actionId}_sp`] : baseStats[actionId]);
            }
            // 하지메 시험(test)은 % 보너스 계산에서 제외 (stats = null 유지)
        }

        if (stats && stats[cardType] > 0) {
            totalFlooredBonus += Math.floor(stats[cardType] * (cardPercent / 100));
        }
    });

    return totalFlooredBonus;
}
