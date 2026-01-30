// calc.js
import { state } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCountsFromDOM, calculateAllTotals } from './calcLogic.js';
import { 
    updateActivityCountsUI, updateSelectedCardsUI, updateStatHeaderUI, 
    renderCalcMenu, renderWeeklyPlan, updateSPBadge, updateMainLabel 
} from './calcUI.js';
import { 
    initGlobalDistListener, setupIdolSelector, setupPlanTypeSelector, 
    setupIconToggles, setupPItemSelector 
} from './calcEvents.js';
import { toggleSupportCardPanel, renderSidePanelContent, closeSupportCardPanel } from './calcModals.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];

export function initCalc() { 
    renderCalcMenu(updatePageTranslations, () => startWeeklyPlan('hajime'), () => startWeeklyPlan('nia')); 
    initGlobalDistListener(getBoardPools, refreshCardBonuses, updateActivityCounts);
}

function startWeeklyPlan(type) {
    renderWeeklyPlan(type, calcPlans, idolList, {
        setupBackBtn: () => { document.querySelector('.back-btn').onclick = () => renderCalcMenu(updatePageTranslations, () => startWeeklyPlan('hajime'), () => startWeeklyPlan('nia')); },
        setupPlanTypeSelector: () => setupPlanTypeSelector(saveCalcState, renderSidePanelContent, updateSelectedCardsUI),
        setupIdolSelector: () => setupIdolSelector(saveCalcState),
        setupIconToggles: () => setupIconToggles(updateSPBadge, updateMainLabel, updateActivityCounts, saveCalcState),
        setupCalcAction: () => { document.getElementById('btn-run-calc').onclick = () => {
            const panel = document.getElementById('calc-side-panel');
            if (panel?.classList.contains('open')) { closeSupportCardPanel(); return; }
            const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
            if (activePlan) toggleSupportCardPanel(activePlan, refreshCardBonuses, saveCalcState);
        }; },
        setupPItemSelector: (t) => setupPItemSelector(t, saveCalcState, refreshCardBonuses, updateActivityCounts)
    });
    
    saveCalcState();
    refreshCardBonuses();
    updateActivityCounts();
}

// 보드에서 사용 가능한 각종 풀(pool) 계산 (이벤트 리스너용)
function getBoardPools(type, current) {
    const board = document.querySelector('.unified-plan-board');
    const resArr = { enhance: { generic: 0, m: 0, a: 0 }, delete: { generic: 0, m: 0, a: 0 }, get: { generic: 0, m: 0, a: 0 } };
    if (!board) return resArr;

    board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
        const val = icon.dataset.value;
        const res = (icon.dataset.results ? icon.dataset.results.split(',') : []).concat(Object.keys(icon.dataset).filter(k => k.startsWith('opt')).flatMap(k => {
            const optId = k.slice(3).toLowerCase(), countInc = (icon.dataset[k] === 'true' ? 1 : (!isNaN(icon.dataset[k]) ? parseInt(icon.dataset[k]) : 0));
            if (countInc === 0) return [];
            const optDef = (activityOptions[val] || []).find(o => o.id === optId) || (activityOptions[val] || []).flatMap(o => o.subOptions || []).find(so => so.id === optId);
            return Array(countInc).fill((optDef && optDef.results) ? optDef.results : [optId]).flat();
        }));
        res.forEach(rid => {
            const id = rid.trim();
            if (['enhance', 'ranenhance'].includes(id)) resArr.enhance.generic++;
            else if (id === 'enhance_m') resArr.enhance.m++;
            else if (id === 'enhance_a') resArr.enhance.a++;
            else if (id === 'delete') resArr.delete.generic++;
            else if (id === 'delete_m') resArr.delete.m++;
            else if (id === 'delete_a') resArr.delete.a++;
            else if (id === 'get') resArr.get.generic++;
            else if (id === 'get_m') resArr.get.m++;
            else if (id === 'get_a') resArr.get.a++;
        });
    });

    // Nia 전용 보너스 합산
    if (type === 'nia' && current.pItems) {
        const counts = {};
        board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => { const val = icon.dataset.value; counts[val] = (counts[val] || 0) + 1; });
        
        let niaBonusGet = 0, niaBonusDelete = 0, niaBonusEnhance = 0;
        if (current.pItems.includes('nia1-1')) { const b = Math.min(counts['spclass'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (current.pItems.includes('nia1-2')) { const b = Math.min(counts['advice'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        
        let n21 = 0, n22 = 0, n23 = 0, n41 = 0;
        board.querySelectorAll('.week-row').forEach(row => {
            const w = parseInt(row.dataset.week), icon = row.querySelector('.plan-icon-wrapper.active[data-value="class_nia"]');
            if (icon) {
                if (icon.dataset.optget_enhancedcard === 'true') { n21++; if (w >= 10) n41++; }
                if (icon.dataset.optget_ppoint === 'true') n22++;
                if (icon.dataset.optget_drink === 'true') n23++;
            }
        });
        if (current.pItems.includes('nia2-1')) { const b = Math.min(n21, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (current.pItems.includes('nia2-2')) { const b = Math.min(n22, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (current.pItems.includes('nia2-3')) { const b = Math.min(n23, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (current.pItems.includes('nia3-1') || current.pItems.includes('nia3-2')) { const b = Math.min(counts['audition'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (current.pItems.includes('nia4-1')) niaBonusEnhance += Math.min(n41, 2);
        if (current.pItems.includes('nia5-1')) {
            const hasSP = Array.from(board.querySelectorAll('.week-row')).some(row => parseInt(row.dataset.week) > 17 && row.querySelector('.plan-icon-wrapper.active')?.dataset.optsp === 'true');
            if (hasSP) niaBonusEnhance += 1;
        }
        resArr.get.generic += niaBonusGet; resArr.delete.generic += niaBonusDelete; resArr.enhance.generic += niaBonusEnhance;
    }
    return resArr;
}

function refreshCardBonuses(providedCounts) {
    const panel = document.getElementById('calc-side-panel');
    const boardElem = document.querySelector('.unified-plan-board');
    if (!boardElem) return;
    const type = boardElem.dataset.calcType;
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
    const detailedCounts = providedCounts || getTriggerCountsFromDOM();
    
    let selectedIds = [];
    if (panel) selectedIds = Array.from(panel.querySelectorAll('.side-card-item.selected')).map(i => i.dataset.id);
    else {
        const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        if (saved.planCards && activePlan) selectedIds = saved.planCards[activePlan] || [];
    }

    const { baseTotal, cardBonusTotal } = calculateAllTotals(detailedCounts, selectedIds);
    updateStatHeaderUI(cardBonusTotal, document.querySelector('.idol-sel-item.active')?.dataset.id, selectedIds, type);

    if (panel?.classList.contains('open')) {
        panel.querySelectorAll('.side-card-item').forEach(item => {
            const card = cardList.find(c => c.id === item.dataset.id);
            if (!card) return;
            const bonus = calculateCardBonus(card, detailedCounts, state.supportLB[card.id] || 0);
            let val = bonus.vocal + bonus.dance + bonus.visual + (bonus.percent > 0 ? Math.round((baseTotal[card.type] || 0) * (bonus.percent / 100)) : 0);
            const bonusEl = item.querySelector('.bonus-val');
            if (bonusEl) {
                bonusEl.textContent = val > 0 ? `+${val}` : '';
                bonusEl.classList.remove('sp-vocal', 'sp-dance', 'sp-visual');
                if (card.abilities.includes('sp_lessonup')) bonusEl.classList.add(`sp-${card.type}`);
            }
            item.style.order = -val;
        });
    }
}

function updateActivityCounts() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;
    const type = board.dataset.calcType, activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    const counts = {}, spCounts = { lessonvo: 0, lessondan: 0, lessonvi: 0 }, extraCounts = { enhance: 0, enhance_m: 0, enhance_a: 0, delete: 0, delete_m: 0, delete_a: 0, get_drink: 0, purchase_drink: 0, change: 0, customize: 0, get: 0, get_m: 0, get_a: 0, get_ssr: 0, get_genki: 0, get_goodcondition: 0, get_concentration: 0, get_motivation: 0, get_goodimpression: 0, get_preservation: 0, get_enthusiasm: 0, get_fullpower: 0, get_item: (type === 'nia' ? 1 : 0) };

    const pools = getBoardPools(type, savedState);
    
    board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
        const val = icon.dataset.value; counts[val] = (counts[val] || 0) + 1;
        if (icon.dataset.optsp === 'true' && spCounts.hasOwnProperty(val)) spCounts[val]++;
        const res = (icon.dataset.results ? icon.dataset.results.split(',') : []).concat(Object.keys(icon.dataset).filter(k => k.startsWith('opt')).flatMap(k => {
            const optId = k.slice(3).toLowerCase(), countInc = (icon.dataset[k] === 'true' ? 1 : (!isNaN(icon.dataset[k]) ? parseInt(icon.dataset[k]) : 0));
            if (countInc === 0) return [];
            const optDef = (activityOptions[val] || []).find(o => o.id === optId) || (activityOptions[val] || []).flatMap(o => o.subOptions || []).find(so => so.id === optId);
            return Array(countInc).fill((optDef && optDef.results) ? optDef.results : [optId]).flat();
        }));
        res.forEach(rid => { 
            const id = rid.trim();
            if (id === 'item') extraCounts.get_item++;
            if (!['enhance', 'ranenhance', 'enhance_m', 'enhance_a', 'delete', 'delete_m', 'delete_a', 'get', 'get_m', 'get_a'].includes(id)) {
                if (extraCounts.hasOwnProperty(id)) extraCounts[id]++; 
            }
        });
    });

    // 4, 5단계 보너스 반영 (드링크 등)
    if (type === 'nia' && savedState.pItems) {
        if (savedState.pItems.includes('nia4-2')) {
            let n42 = 0;
            board.querySelectorAll('.week-row').forEach(row => { if (parseInt(row.dataset.week) >= 10 && row.querySelector('.plan-icon-wrapper.active[data-value="class_nia"]')?.dataset.optget_drink === 'true') n42++; });
            extraCounts.get_drink += Math.min(n42, 2) * 2;
        }
    }

    // 모달에서 선택한 스킬 카드 반영
    const selectedSkills = savedState.selectedSkills || {};
    Object.keys(selectedSkills).forEach(skillId => {
        const skill = skillCardList[skillId];
        const count = selectedSkills[skillId] || 0;
        if (skill && count > 0) {
            if (skill.type === 'active') extraCounts.get_a += count;
            else if (skill.type === 'mental') extraCounts.get_m += count;
            if (skill.rarity === 'SSR') extraCounts.get_ssr += count;
            if (skill.attrs && Array.isArray(skill.attrs)) {
                skill.attrs.forEach(attr => {
                    const key = `get_${attr}`;
                    if (extraCounts.hasOwnProperty(key)) extraCounts[key] += count;
                });
            }
        }
    });

    // 슬롯 선택 카드 반영
    const selectedIds = (savedState.planCards && activePlan) ? (savedState.planCards[activePlan] || []) : [];
    const cardChecked = savedState.cardChecked || {};
    selectedIds.forEach(id => {
        if (cardChecked[id]) {
            const card = cardList.find(c => c.id === id);
            if (card) {
                if (card.have === 'item') extraCounts.get_item++;
                else if (card.have?.startsWith('card_')) {
                    if (card.rarity === 'SSR') extraCounts.get_ssr++;
                    if (card.have === 'card_m') { extraCounts.get_m++; }
                    else if (card.have === 'card_a') { extraCounts.get_a++; }
                    extraCounts.get++;
                    if (card.attrs && Array.isArray(card.attrs)) {
                        card.attrs.forEach(attr => {
                            const key = `get_${attr}`;
                            if (extraCounts.hasOwnProperty(key)) extraCounts[key]++;
                        });
                    }
                }
            }
        }
    });

    // [New] 아이템 효과 (add_count) 반영
    const itemCounters = savedState.itemCounters || {};
    selectedIds.forEach(id => {
        if (cardChecked[id]) {
            const card = cardList.find(c => c.id === id);
            if (card && card.item_effects) {
                const counter = itemCounters[id] || 0;
                card.item_effects.forEach(eff => {
                    if (eff.type === 'add_count' && eff.target && counter > 0) {
                        if (extraCounts.hasOwnProperty(eff.target)) {
                            extraCounts[eff.target] += (eff.value || 1) * counter;
                        }
                    }
                });
            }
        }
    });

    // 분배 로직 적용 (모든 추가 수치가 반영된 extraCounts 기반)
    // 1. 보드의 기본 풀 수치 합산
    extraCounts.enhance += pools.enhance.generic + pools.enhance.m + pools.enhance.a;
    extraCounts.enhance_m += pools.enhance.m;
    extraCounts.enhance_a += pools.enhance.a;
    
    extraCounts.delete += pools.delete.generic + pools.delete.m + pools.delete.a;
    extraCounts.delete_m += pools.delete.m;
    extraCounts.delete_a += pools.delete.a;

    // 2. 미분배 수치에 대한 수동 분배 및 자동 할당 적용
    const currentEnhanceTotal = extraCounts.enhance;
    let em = Number(savedState.manualEnhance?.m) || 0;
    let ea = Number(savedState.manualEnhance?.a) || 0;
    let diffE = currentEnhanceTotal - (em + ea);
    if (diffE > 0) em += diffE;
    else if (diffE < 0) {
        const redM = Math.min(em, -diffE);
        em -= redM; diffE += redM;
        if (diffE < 0) ea = Math.max(0, ea + diffE);
    }
    savedState.manualEnhance = { m: em, a: ea };
    extraCounts.enhance_m += em;
    extraCounts.enhance_a += ea;
    
    const currentDeleteTotal = extraCounts.delete;
    let dm = Number(savedState.manualDelete?.m) || 0;
    let da = Number(savedState.manualDelete?.a) || 0;
    let diffD = currentDeleteTotal - (dm + da);
    if (diffD > 0) dm += diffD;
    else if (diffD < 0) {
        const redM = Math.min(dm, -diffD);
        dm -= redM; diffD += redM;
        if (diffD < 0) da = Math.max(0, da + diffD);
    }
    savedState.manualDelete = { m: dm, a: da };
    extraCounts.delete_m += dm;
    extraCounts.delete_a += da;

    const totalGetPool = pools.get.generic;
    let gm = Number(savedState.manualGet?.m) || 0;
    let ga = Number(savedState.manualGet?.a) || 0;
    extraCounts.get += totalGetPool + pools.get.m + pools.get.a;
    extraCounts.get_m += pools.get.m + gm;
    extraCounts.get_a += pools.get.a + ga;

    updateActivityCountsUI(counts, spCounts, extraCounts, activePlan, Array.from(new Set(Array.from(board.querySelectorAll('.plan-icon-wrapper')).map(w => w.dataset.value))), ['lessonvo', 'lessondan', 'lessonvi', 'class_hajime', 'class_nia', 'goout_hajime', 'goout_nia', 'gift_hajime', 'gift_nia', 'advice', 'spclass', 'audition', 'test', 'oikomi'], type);

    // [New] UI 카운트 기반으로 보너스 재계산 (동기화)
    const mergedCounts = {
        total: { ...counts, ...extraCounts },
        lessons: {
            vocal: { normal: (counts.lessonvo || 0) - (spCounts.lessonvo || 0), sp: spCounts.lessonvo || 0 },
            dance: { normal: (counts.lessondan || 0) - (spCounts.lessondan || 0), sp: spCounts.lessondan || 0 },
            visual: { normal: (counts.lessonvi || 0) - (spCounts.lessonvi || 0), sp: spCounts.lessonvi || 0 }
        }
    };

    // UI의 동적 max 계산을 위해 현재 상태 저장
    savedState.lastCounts = mergedCounts.total;
    localStorage.setItem(`calc_state_${type}`, JSON.stringify(savedState));

    refreshCardBonuses(mergedCounts);
}

function saveCalcState() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;
    const type = board.dataset.calcType, activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type || '';
    const oldSaved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    
    const pItems = []; document.querySelectorAll('.p-item-slot').forEach(slot => { const img = slot.querySelector('img'); pItems.push(img ? img.dataset.val : null); });
    const planCards = oldSaved.planCards || {};
    const panel = document.getElementById('calc-side-panel');
    if (panel && activePlan) planCards[activePlan] = Array.from(panel.querySelectorAll('.side-card-item.selected')).map(i => i.dataset.id);

    // 구형 데이터(manualOther, manualGet)를 제거하고 저장
    const { manualOther, manualGet, ...restSaved } = oldSaved;

    const stateData = { 
        ...restSaved, 
        pItems, 
        planCards, 
        selectedIdol: document.querySelector('.idol-sel-item.active')?.dataset.id || '', 
        planType: activePlan, 
        isBoardCollapsed: board.classList.contains('collapsed-board'), 
        weeks: {} 
    };
    board.querySelectorAll('.week-row').forEach(row => {
        const activeIcon = row.querySelector('.plan-icon-wrapper.active');
        if (activeIcon) {
            const opts = {}; Object.keys(activeIcon.dataset).forEach(k => { if (k.startsWith('opt')) opts[k.slice(3).toLowerCase()] = activeIcon.dataset[k]; });
            stateData.weeks[row.dataset.week] = { value: activeIcon.dataset.value, opts };
        }
    });
    localStorage.setItem(`calc_state_${type}`, JSON.stringify(stateData));
    refreshCardBonuses(); updateActivityCounts();
}

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const cur = window.innerWidth;
    if ((lastWidth <= 768 && cur > 768) || (lastWidth > 768 && cur <= 768)) {
        document.getElementById('calc-side-panel')?.remove(); document.getElementById('panel-overlay')?.remove();
        const board = document.querySelector('.unified-plan-board');
        if (board) startWeeklyPlan(board.dataset.calcType);
    }
    lastWidth = cur;
});