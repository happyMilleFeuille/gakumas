// calcLogic.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
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
        // 보드 활동 횟수 재집계
        let niaBonusGet = 0;
        let niaBonusDelete = 0;
        let niaBonusEnhance = 0;

        const boardCounts = {};
        board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
            const val = icon.dataset.value; boardCounts[val] = (boardCounts[val] || 0) + 1;
        });

        if (saved.pItems.includes('nia1-1')) {
            const bonus = Math.min(boardCounts['spclass'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (saved.pItems.includes('nia1-2')) {
            const bonus = Math.min(boardCounts['advice'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        
        let nia21Count = 0, nia22Count = 0, nia23Count = 0;
        let nia41Count = 0;
        board.querySelectorAll('.week-row').forEach(row => {
            const week = parseInt(row.dataset.week);
            const icon = row.querySelector('.plan-icon-wrapper.active[data-value="class_nia"]');
            if (icon) {
                if (icon.dataset.optget_enhancedcard === 'true') {
                    nia21Count++;
                    if (week >= 10) nia41Count++;
                }
                if (icon.dataset.optget_ppoint === 'true') nia22Count++;
                if (icon.dataset.optget_drink === 'true') nia23Count++;
            }
        });

        if (saved.pItems.includes('nia2-1')) {
            const bonus = Math.min(nia21Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (saved.pItems.includes('nia2-2')) {
            const bonus = Math.min(nia22Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (saved.pItems.includes('nia2-3')) {
            const bonus = Math.min(nia23Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }

        if (saved.pItems.includes('nia3-1')) {
            const bonus = Math.min(boardCounts['audition'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (saved.pItems.includes('nia3-2')) {
            const bonus = Math.min(boardCounts['audition'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }

        // 4단계 & 5단계 강화 보너스 반영
        if (saved.pItems.includes('nia4-1')) {
            niaBonusEnhance += Math.min(nia41Count, 2);
        }
        if (saved.pItems.includes('nia5-1')) {
            const hasSPAfterAudition2 = Array.from(board.querySelectorAll('.week-row')).some(row => {
                const week = parseInt(row.dataset.week);
                const activeIcon = row.querySelector('.plan-icon-wrapper.active');
                return week > 17 && activeIcon && activeIcon.dataset.optsp === 'true';
            });
            if (hasSPAfterAudition2) niaBonusEnhance += 1;
        }

        counts.total['get'] = (counts.total['get'] || 0) + niaBonusGet;
        counts.total['delete'] = (counts.total['delete'] || 0) + niaBonusDelete;
        counts.total['enhance'] = (counts.total['enhance'] || 0) + niaBonusEnhance;
    }

    // 1. 강화 분배 반영 (니아 보너스 포함)
    const totalEnhancePool = (counts.total['enhance'] || 0);
    let em = Number(saved.manualEnhance?.m) || 0;
    let ea = Number(saved.manualEnhance?.a) || 0;
    const diffE = totalEnhancePool - (em + ea);
    if (diffE !== 0) em = Math.max(0, em + diffE); // 부족한 수치는 멘탈에 우선 가산
    
    counts.total['enhance_m'] = (counts.total['enhance_m'] || 0) + em;
    counts.total['enhance_a'] = (counts.total['enhance_a'] || 0) + ea;

    // 2. 삭제 분배 반영 (니아 보너스 포함)
    const totalDeletePool = (counts.total['delete'] || 0);
    let dm = Number(saved.manualDelete?.m) || 0;
    let da = Number(saved.manualDelete?.a) || 0;
    const diffD = totalDeletePool - (dm + da);
    if (diffD !== 0) dm = Math.max(0, dm + diffD);
    
    counts.total['delete_m'] = (counts.total['delete_m'] || 0) + dm;
    counts.total['delete_a'] = (counts.total['delete_a'] || 0) + da;

    // 3. 카드 획득 분배 및 스킬 카드 보너스 반영 (모달 선택 기반)
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type || 'sense';
    const selectedSkills = saved.planSkills?.[activePlan] || {};
    Object.keys(selectedSkills).forEach(skillId => {
        const skill = skillCardList[skillId];
        if (skill) {
            const count = selectedSkills[skillId] || 0;
            if (count <= 0) return;

            // 1) 카드 획득 타입 반영 (active -> get_a, mental -> get_m)
            if (skill.type === 'active') {
                counts.total['get_a'] = (counts.total['get_a'] || 0) + count;
            } else if (skill.type === 'mental') {
                counts.total['get_m'] = (counts.total['get_m'] || 0) + count;
            }
            counts.total['get'] = (counts.total['get'] || 0) + count;

            // 2) 희귀도 반영 (SSR)
            if (skill.rarity === 'SSR') {
                counts.total['get_ssr'] = (counts.total['get_ssr'] || 0) + count;
            }

            // 3) 속성 반영 (attrs)
            if (skill.attrs && Array.isArray(skill.attrs)) {
                skill.attrs.forEach(attr => {
                    const key = `get_${attr}`;
                    counts.total[key] = (counts.total[key] || 0) + count;
                });
            }
        }
    });

    // 3.5. 슬롯 선택 서포트 카드 반영 (체크박스 기반 - 기존 로직 유지)
    const selectedIds = (saved.planCards && activePlan) ? (saved.planCards[activePlan] || []) : [];
    const cardChecked = saved.cardChecked || {};

    selectedIds.forEach(id => {
        const card = cardList.find(c => c.id === id);
        if (card && cardChecked[id]) {
            if (card.have === 'item') {
                counts.total['item'] = (counts.total['item'] || 0) + 1;
            } else if (card.have?.startsWith('card_')) {
                if (card.have === 'card_a') {
                    counts.total['get_a'] = (counts.total['get_a'] || 0) + 1;
                } else if (card.have === 'card_m') {
                    counts.total['get_m'] = (counts.total['get_m'] || 0) + 1;
                }
                if (card.rarity === 'SSR') counts.total['get_ssr'] = (counts.total['get_ssr'] || 0) + 1;
                
                // [중요] 전체 카드 획득 수치(get)에도 반영
                counts.total['get'] = (counts.total['get'] || 0) + 1;
            }
        }
    });

    // 4. 아이템 획득 수치를 get_item 트리거로 연결
    const totalItemCount = (counts.total['item'] || 0) + (counts.total['get_item'] || 0);
    if (totalItemCount > 0) {
        counts.total['get_item'] = (counts.total['get_item'] || 0) + totalItemCount;
    }

    // 4.5 [New] 아이템 효과(item_effects)의 target 수치 반영 (trigger 제한 포함)
    const itemCounters = saved.itemCounters || {};
    selectedIds.forEach(cardId => {
        const card = cardList.find(c => c.id === cardId);
        if (card && card.item_effects && cardChecked[cardId]) {
            const counter = itemCounters[cardId] || 0;
            card.item_effects.forEach(eff => {
                if ((eff.type === 'action' || eff.type === 'add_count') && eff.target && counter > 0) {
                    let multiplier = counter;
                    if (eff.trigger) {
                        const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                        let totalTriggerCount = 0;
                        triggers.forEach(t => {
                            const l = counts.lessons;
                            if (t === 'lesson') {
                                // 카드 타입과 일치하는 레슨(일반+SP)만 합산
                                if (card.type === 'vocal') totalTriggerCount += (l.vocal.normal + l.vocal.sp);
                                else if (card.type === 'dance') totalTriggerCount += (l.dance.normal + l.dance.sp);
                                else if (card.type === 'visual') totalTriggerCount += (l.visual.normal + l.visual.sp);
                                else totalTriggerCount += (l.vocal.normal + l.vocal.sp + l.dance.normal + l.dance.sp + l.visual.normal + l.visual.sp);
                            } else if (t === 'sp') {
                                // 카드 타입과 일치하는 SP 레슨만 합산
                                if (card.type === 'vocal') totalTriggerCount += l.vocal.sp;
                                else if (card.type === 'dance') totalTriggerCount += l.dance.sp;
                                else if (card.type === 'visual') totalTriggerCount += l.visual.sp;
                                else totalTriggerCount += (l.vocal.sp + l.dance.sp + l.visual.sp);
                            } else {
                                totalTriggerCount += (counts.total[t] || 0);
                            }
                        });
                        multiplier = Math.min(totalTriggerCount, counter);
                    }
                    if (multiplier > 0) {
                        const val = eff.value || 1;
                        counts.total[eff.target] = (counts.total[eff.target] || 0) + (val * multiplier);
                    }
                }
            });
        }
    });

    // 5. 개조(customize) 수치 반영
    // calc.js의 updateActivityCounts에서 계산된 수치가 있다면 localStorage나 다른 방식으로 전달되어야 하지만,
    // 현재 구조상 calcLogic.js가 독립적으로 계산하는 경우가 많으므로 여기서도 유사하게 집계해야 합니다.
    // 일단 기본적으로 보드 옵션에서 optcustomize가 있으면 집계됩니다 (위의 opt 처리 로직).
    // 여기에 추가로 서포트 카드나 P-아이템에 의한 개조 횟수 증가 로직을 보강합니다.
    
    // (1) 서포트 카드 체크박스에 의한 개조 카운트 (customize)
    selectedIds.forEach(id => {
        const card = cardList.find(c => c.id === id);
        if (card && cardChecked[id]) {
             // 개조 관련 효과를 가진 카드가 있다면 여기서 counts.total['customize']를 증가시킬 수 있습니다.
             // 현재 carddata.js에는 'customize'라는 have 속성이나 직접적인 개조 증가 속성은 없으나,
             // 질문 내용에 따라 "customize6" 코드를 가진 카드가 개조 횟수에 반응해야 한다고 했으므로,
             // 만약 "개조" 자체를 제공하는 카드가 있다면 여기서 처리합니다.
             // 다만, "개조 횟수에 따라 수치가 오른다"는 것은 트리거 카운트 문제이고,
             // "개조 횟수 자체"를 늘려주는 카드는 별개입니다.
             
             // 만약 특정 카드가 개조 횟수를 +1 해준다면:
             // if (card.abilities.includes('some_ability_that_gives_customize')) {
             //    counts.total['customize'] = (counts.total['customize'] || 0) + 1;
             // }
        }
    });

    // (2) P-아이템 등에 의한 개조 카운트 (필요 시 추가)
    // 예: saved.pItems에 'customize_item'이 있다면
    // if (saved.pItems && saved.pItems.includes('some_p_item')) {
    //    counts.total['customize'] = (counts.total['customize'] || 0) + 1;
    // }

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
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${calcType}`)) || {};
    const cardChecked = savedState.cardChecked || {};
    const itemCounters = savedState.itemCounters || {};

    selectedIds.forEach(cardId => {
        const card = cardList.find(c => c.id === cardId);
        if (!card) return;

        // 일반 어빌리티 보너스
        const lb = state.supportLB[cardId] || 0;
        const bonus = calculateCardBonus(card, detailedCounts, lb);
        
        cardBonusTotal.vocal += bonus.vocal || 0;
        cardBonusTotal.dance += bonus.dance || 0;
        cardBonusTotal.visual += bonus.visual || 0;
        if (bonus.percent > 0) percentBonuses[card.type] += bonus.percent;

        // [New] 아이템 효과 (fixed, action) 반영
        if (card.item_effects && cardChecked[cardId]) {
            const counter = itemCounters[cardId] || 0;
            card.item_effects.forEach(eff => {
                if (eff.type === 'fixed' && eff.stats) {
                    cardBonusTotal.vocal += eff.stats.vocal || 0;
                    cardBonusTotal.dance += eff.stats.dance || 0;
                    cardBonusTotal.visual += eff.stats.visual || 0;
                } else if (eff.type === 'action' && eff.stats && counter > 0) {
                    let multiplier = counter;
                    
                    // trigger가 있으면 실제 행동 횟수와 비교하여 제한
                    if (eff.trigger) {
                        const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                        let totalTriggerCount = 0;
                        triggers.forEach(t => {
                            if (t === 'lesson') {
                                // 'lesson' 키워드는 모든 레슨(vo, da, vi) 합산
                                const l = detailedCounts.lessons;
                                totalTriggerCount += (l.vocal.normal + l.vocal.sp + l.dance.normal + l.dance.sp + l.visual.normal + l.visual.sp);
                            } else {
                                totalTriggerCount += (detailedCounts.total[t] || 0);
                            }
                        });
                        multiplier = Math.min(totalTriggerCount, counter);
                    }

                    if (multiplier > 0) {
                        cardBonusTotal.vocal += (eff.stats.vocal || 0) * multiplier;
                        cardBonusTotal.dance += (eff.stats.dance || 0) * multiplier;
                        cardBonusTotal.visual += (eff.stats.visual || 0) * multiplier;
                    }
                }
            });
        }
    });

    cardBonusTotal.vocal += Math.round(baseTotal.vocal * (percentBonuses.vocal / 100));
    cardBonusTotal.dance += Math.round(baseTotal.dance * (percentBonuses.dance / 100));
    cardBonusTotal.visual += Math.round(baseTotal.visual * (percentBonuses.visual / 100));

    return { baseTotal, cardBonusTotal };
}
