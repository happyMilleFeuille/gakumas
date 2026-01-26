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

    baseTotal.vocal += baseStats.initial.vocal || 0;
    baseTotal.dance += baseStats.initial.dance || 0;
    baseTotal.visual += baseStats.initial.visual || 0;

    // 2. 카드 보너스 합산
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
