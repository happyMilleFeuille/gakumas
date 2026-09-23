// supportLbEfficiencyModal.js
import { state, idolColors } from './state.js';
import { translate } from './utils.js';
import { cardList } from './carddata.js';
import { idolList } from './roadmap.js';
import { getTriggerCounts, calculateTotals, getSupportPercentBonusForCard } from './calcLogic.js';
import { getGuidePreset } from './guidePresets.js';
import { checkCardMatchFilters } from './ui.js';
import { showCardModal } from './cardModal.js';
import { calculateCardBonus } from './simulator-engine.js';
import { showSupportItemTooltip } from './calcUI.js';

const MODES = ['hajime', 'nia', 'hif'];
const PLAN_TYPES = ['sense', 'logic', 'anomaly'];
const SELECTION_STORAGE_KEY = 'support_lb_efficiency_modal_selection';
const RECENT_REWARD_STORAGE_KEY = 'support_lb_efficiency_recent_rewards';

const t = (key, params = {}, fallback = '') => translate(key, params, fallback);
const sleep = () => new Promise(resolve => setTimeout(resolve, 0));
const clone = (value) => JSON.parse(JSON.stringify(value || {}));

const getText = (ko, ja, en) => {
    if (state.currentLang === 'ja') return ja;
    if (state.currentLang === 'en') return en;
    return ko;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[ch]);

const getTitleText = () => getText('서포트 카드 돌파 효율', 'サポカ開花効率', 'Support Card LB Efficiency');
const getSubtitleText = () => getText('참조할 프리셋을 선택해주세요.', '参照するプリセットを選択してください。', 'Select a preset to use as reference.');
const renderCalcTypeToggle = (isStep) => `
    <div class="support-lb-mode-toggle">
        <button type="button" class="support-lb-toggle-btn ${isStep ? 'active' : ''}" data-type="step">${getText('구간별', '区間別', 'Step')}</button>
        <button type="button" class="support-lb-toggle-btn ${!isStep ? 'active' : ''}" data-type="cumulative">${getText('누적', '累積', 'Cumulative')}</button>
    </div>
`;
const getThemeColor = () => (state.favoriteIdol && idolColors[state.favoriteIdol]) ? idolColors[state.favoriteIdol] : '#ff4d8d';
const getSelectedIdolColor = (idolId) => (idolId && idolColors[idolId]) ? idolColors[idolId] : getThemeColor();
const getIdolName = (idolId) => {
    const translated = t(`idol_name_${idolId}`, {}, '');
    return translated || idolId;
};
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (state.currentLang !== 'ko' && card.name_ja) return card.name_ja;
    return card.name || card.id;
};
const getSupportRewardKind = (card) => card?.have?.startsWith('card') ? 'card' : 'item';
const getSupportRewardImage = (card) => `images/support/${card.id}_${getSupportRewardKind(card)}.webp`;
const getSupportRewardFallbackImage = (card) => `images/support/${card.id}_${getSupportRewardKind(card) === 'card' ? 'item' : 'card'}.webp`;
const getRewardMaxCounter = (card) => {
    let max = 0;
    (card?.item_effects || []).forEach(eff => {
        if ((eff.type === 'action' || eff.type === 'add_count') && (eff.target || eff.targets) && typeof eff.max === 'number') {
            max = Math.max(max, eff.max);
        }
    });
    return max;
};
const getInitialPlan = (mode) => {
    try {
        const saved = JSON.parse(localStorage.getItem(`calc_state_${mode}`));
        const planType = saved?.planType;
        return PLAN_TYPES.includes(planType) ? planType : 'sense';
    } catch {
        return 'sense';
    }
};

const readSavedSelection = () => {
    try {
        return JSON.parse(sessionStorage.getItem(SELECTION_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

const saveSelection = (modalState) => {
    try {
        sessionStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify({
            selectedIdol: modalState.selectedIdol,
            selectedMode: modalState.selectedMode,
            selectedPlan: modalState.selectedPlan,
            selectedPresetKey: modalState.selectedPresetKey
        }));
    } catch {
    }
};

function getModeLabel(mode) {
    if (mode === 'hajime') return getText('하지메', '初', 'Hajime');
    if (mode === 'nia') return 'NIA';
    if (mode === 'hif') return 'HIF';
    return mode;
}

function getPlanLabel(planType) {
    if (planType === 'sense') return 'SENSE';
    if (planType === 'logic') return 'LOGIC';
    if (planType === 'anomaly') return 'ANOMALY';
    return planType;
}

function getPlanCards(calcState) {
    const planType = calcState.planType || 'sense';
    const planCards = calcState.planCards || {};
    if (Array.isArray(planCards)) return { planType, planCards: { sense: planCards, logic: planCards, anomaly: planCards } };
    return { planType, planCards };
}

function normalizeCalcState(rawState, mode, idolId) {
    const calcState = typeof rawState === 'string' ? JSON.parse(rawState) : clone(rawState);
    calcState.type = calcState.type || mode;
    calcState.selectedIdol = calcState.selectedIdol || idolId;
    calcState.planType = calcState.planType || 'sense';
    calcState.weeks = calcState.weeks || {};
    Object.keys(calcState.weeks).forEach(weekNum => {
        calcState.weeks[weekNum] = {
            ...(calcState.weeks[weekNum] || {}),
            opts: calcState.weeks[weekNum]?.opts || {}
        };
    });
    const normalized = getPlanCards(calcState);
    calcState.planCards = {
        sense: normalized.planCards.sense || [],
        logic: normalized.planCards.logic || [],
        anomaly: normalized.planCards.anomaly || []
    };
    calcState.planSkills = calcState.planSkills || { sense: {}, logic: {}, anomaly: {} };
    if (!calcState.planSkills.sense && !calcState.planSkills.logic && !calcState.planSkills.anomaly) {
        calcState.planSkills = { sense: { ...calcState.planSkills }, logic: {}, anomaly: {} };
    }
    calcState.cardChecked = calcState.cardChecked || {};
    calcState.cardExtraChecked = calcState.cardExtraChecked || {};
    calcState.cardEventChecked = calcState.cardEventChecked || {};
    calcState.itemCounters = calcState.itemCounters || {};
    calcState.manualEnhance = calcState.manualEnhance || { m: 0, a: 0 };
    calcState.manualDelete = calcState.manualDelete || { m: 0, a: 0, t: 0 };
    calcState.manualGet = calcState.manualGet || { m: 0, a: 0, t: 0 };
    calcState.pItems = Array.isArray(calcState.pItems) ? calcState.pItems : [null, null, null, null, null];
    calcState.pItemSubOpts = Array.isArray(calcState.pItemSubOpts) ? calcState.pItemSubOpts : [null, null, null, null, null];
    calcState.pItemSubSubOpts = Array.isArray(calcState.pItemSubSubOpts) ? calcState.pItemSubSubOpts : [null, null, null, null, null];
    calcState.memories = Array.isArray(calcState.memories) ? calcState.memories : [[], [], [], []];
    calcState.hifStats = calcState.hifStats || { vocal: 0, dance: 0, visual: 0 };
    return calcState;
}

function getSavedCalcPresets(idolId, mode, selectedPlanType) {
    const presets = [];
    const planType = PLAN_TYPES.includes(selectedPlanType) ? selectedPlanType : 'sense';
    const guideSlotIds = mode === 'hif' ? ['guide', 'guide2'] : ['guide'];
    guideSlotIds.forEach(slotId => {
        try {
            const data = getGuidePreset(mode, idolId, planType, slotId);
            if (!data?.calcState) return;
            const calcState = normalizeCalcState(data.calcState, mode, idolId);
            presets.push({
                key: `guide_${mode}_${idolId}_${planType}_${slotId}`,
                mode,
                idolId,
                slotId,
                name: data.customName || getText('가이드 프리셋', 'ガイドプリセット', 'Guide Preset'),
                timestamp: data.timestamp || 'SYSTEM',
                calcState,
                isGuide: true
            });
        } catch {
        }
    });

    for (let slotId = 1; slotId <= 15; slotId++) {
        const key = `calc_preset_slot_${mode}_${idolId}_${slotId}`;

        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data?.calcState) continue;
            const calcState = normalizeCalcState(data.calcState, mode, idolId);
            if ((calcState.planType || 'sense') !== planType) continue;
            presets.push({
                key,
                mode,
                idolId,
                slotId,
                name: data.customName || `Slot ${slotId}`,
                timestamp: data.timestamp || '',
                calcState
            });
        } catch {
        }
    }

    return presets.sort((a, b) => {
        if (a.isGuide !== b.isGuide) return a.isGuide ? -1 : 1;
        const aPlanIdx = PLAN_TYPES.indexOf(a.calcState.planType || 'sense');
        const bPlanIdx = PLAN_TYPES.indexOf(b.calcState.planType || 'sense');
        if (aPlanIdx !== bPlanIdx) return aPlanIdx - bPlanIdx;
        if (String(a.slotId) !== String(b.slotId)) return String(a.slotId).localeCompare(String(b.slotId), undefined, { numeric: true });
        return a.key.localeCompare(b.key);
    });
}

function getMaxItemCounter(card) {
    let max = 0;
    (card.item_effects || []).forEach(eff => {
        if (typeof eff.max === 'number') max = Math.max(max, eff.max);
    });
    return max || 9;
}

function getEligibleCards(planType) {
    return cardList
        .filter(card => card.encyclopedia !== false)
        .filter(card => card.plan === 'free' || card.plan === planType)
        .filter(card => checkCardMatchFilters(card, true));
}

function getRewardTriggerCount(counts, rewardCard, triggerId) {
    if (triggerId === 'lesson') {
        if (rewardCard.type === 'vocal') return (counts.lessons.vocal.normal + counts.lessons.vocal.sp);
        if (rewardCard.type === 'dance') return (counts.lessons.dance.normal + counts.lessons.dance.sp);
        if (rewardCard.type === 'visual') return (counts.lessons.visual.normal + counts.lessons.visual.sp);
        return (counts.lessons.vocal.normal + counts.lessons.vocal.sp + counts.lessons.dance.normal + counts.lessons.dance.sp + counts.lessons.visual.normal + counts.lessons.visual.sp);
    }
    if (triggerId === 'sp' || triggerId === 'sp_lesson') {
        if (rewardCard.type === 'vocal') return counts.lessons.vocal.sp;
        if (rewardCard.type === 'dance') return counts.lessons.dance.sp;
        if (rewardCard.type === 'visual') return counts.lessons.visual.sp;
        return (counts.lessons.vocal.sp + counts.lessons.dance.sp + counts.lessons.visual.sp);
    }
    return counts.total?.[triggerId] || 0;
}

function applySelectedRewardCounts(counts, modalState, currentCardId) {
    const selectedRewardIds = modalState?.selectedRewards || [];
    const selectedRewardCounters = modalState?.selectedRewardCounters || [];
    let rewardEnhanceTotal = 0;
    let rewardDeleteTotal = 0;
    (selectedRewardIds || []).forEach((rewardCardId, slotIndex) => {
        if (!rewardCardId || rewardCardId === currentCardId) return;
        const rewardCard = cardList.find(c => c.id === rewardCardId);
        if (!rewardCard) return;

        if (rewardCard.have === 'item') {
            counts.total.get_item = (counts.total.get_item || 0) + 1;
        } else if (rewardCard.have?.startsWith('card_')) {
            counts.total.get = (counts.total.get || 0) + 1;
            if (rewardCard.have === 'card_m') {
                counts.total.get_m = (counts.total.get_m || 0) + 1;
            } else if (rewardCard.have === 'card_a') {
                counts.total.get_a = (counts.total.get_a || 0) + 1;
            }
            if (rewardCard.rarity === 'SSR') {
                counts.total.get_ssr = (counts.total.get_ssr || 0) + 1;
            }
            if (rewardCard.attrs) {
                rewardCard.attrs.forEach(attr => {
                    counts.total[`get_${attr}`] = (counts.total[`get_${attr}`] || 0) + 1;
                });
            }
        }

        if (rewardCard.extra2) {
            const extra = rewardCard.extra2;
            if (extra.includes('enhance')) rewardEnhanceTotal += 1;
            if (extra.includes('change')) counts.total.change = (counts.total.change || 0) + 1;
            if (extra.includes('del')) rewardDeleteTotal += 1;
        }

        if (!rewardCard.item_effects) return;
        const maxCounter = getRewardMaxCounter(rewardCard);
        const counter = maxCounter > 0 ? Math.max(0, Math.min(maxCounter, Number(selectedRewardCounters[slotIndex]) || 0)) : 1;
        if (counter <= 0) return;

        rewardCard.item_effects.forEach(eff => {
            if (eff.type !== 'action' && eff.type !== 'add_count') return;
            const rawTarget = eff.target || eff.targets;
            const targetList = Array.isArray(rawTarget) ? rawTarget : (rawTarget ? [rawTarget] : []);
            if (targetList.length === 0) return;

            let multiplier = counter;
            if (eff.trigger) {
                const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                const triggerCount = triggers.reduce((sum, triggerId) => sum + getRewardTriggerCount(counts, rewardCard, triggerId), 0);
                multiplier = Math.min(triggerCount, counter);
            }
            if (typeof eff.max === 'number') multiplier = Math.min(multiplier, eff.max);
            if (multiplier <= 0) return;

            const bonusValue = (eff.value || 1) * multiplier;
            targetList.forEach(target => {
                if (target === 'get_t') {
                    counts.total.get_t = (counts.total.get_t || 0) + bonusValue;
                    counts.total.get = (counts.total.get || 0) + bonusValue;
                } else if (target === 'get_m') {
                    counts.total.get_m = (counts.total.get_m || 0) + bonusValue;
                    counts.total.get = (counts.total.get || 0) + bonusValue;
                } else if (target === 'get_a') {
                    counts.total.get_a = (counts.total.get_a || 0) + bonusValue;
                    counts.total.get = (counts.total.get || 0) + bonusValue;
                } else if (target === 'purchase_card') {
                    counts.total.purchase_card = (counts.total.purchase_card || 0) + bonusValue;
                    counts.total.get = (counts.total.get || 0) + bonusValue;
                } else if (target === 'get_card') {
                    counts.total.get_card = (counts.total.get_card || 0) + bonusValue;
                    counts.total.get = (counts.total.get || 0) + bonusValue;
                } else if (target === 'delete') {
                    rewardDeleteTotal += bonusValue;
                } else if (target === 'enhance') {
                    rewardEnhanceTotal += bonusValue;
                } else {
                    counts.total[target] = (counts.total[target] || 0) + bonusValue;
                }
            });
        });
    });

    if (rewardEnhanceTotal > 0) {
        const mental = Math.max(0, Math.min(rewardEnhanceTotal, Number(modalState?.rewardEnhanceMental ?? rewardEnhanceTotal)));
        const active = rewardEnhanceTotal - mental;
        counts.total.enhance = (counts.total.enhance || 0) + rewardEnhanceTotal;
        counts.total.enhance_m = (counts.total.enhance_m || 0) + mental;
        counts.total.enhance_a = (counts.total.enhance_a || 0) + active;
    }

    if (rewardDeleteTotal > 0) {
        const mental = Math.max(0, Math.min(rewardDeleteTotal, Number(modalState?.rewardDeleteMental ?? rewardDeleteTotal)));
        const remainingAfterMental = rewardDeleteTotal - mental;
        const active = Math.max(0, Math.min(remainingAfterMental, Number(modalState?.rewardDeleteActive ?? 0)));
        const trouble = rewardDeleteTotal - mental - active;
        counts.total.delete = (counts.total.delete || 0) + rewardDeleteTotal;
        counts.total.delete_m = (counts.total.delete_m || 0) + mental;
        counts.total.delete_a = (counts.total.delete_a || 0) + active;
        counts.total.delete_t = (counts.total.delete_t || 0) + trouble;
    }
}

function createCardEvaluationContext(baseState, lb) {
    const store = clone(baseState);
    const counts = getTriggerCounts(store);
    const { breakdown } = calculateTotals(store, counts);
    return {
        store,
        counts,
        lb,
        totalPercs: breakdown?.totalPercs || null
    };
}

function evaluateCardDisplayScore(context, card, modalState) {
    const counts = clone(context.counts);
    applySelectedRewardCounts(counts, modalState, card.id);
    const store = context.store;
    const planType = store.planType || 'sense';
    const selectedIds = store.planCards?.[planType] || [];
    const lb = selectedIds.indexOf(card.id) === 5 ? 4 : context.lb;
    const itemCounter = store.cardChecked?.[card.id] ? (store.itemCounters?.[card.id] || 0) : 0;
    const includeEvent = !!store.cardEventChecked?.[card.id];
    const bonus = calculateCardBonus(card, counts, lb, itemCounter, includeEvent);
    let totalVal = (bonus.vocal || 0) + (bonus.dance || 0) + (bonus.visual || 0);
    if (bonus.percent > 0 && card.type) {
        totalVal += getSupportPercentBonusForCard(store, bonus.percent, card.type, context.totalPercs);
    }
    return Math.floor(totalVal);
}

function buildCardStore(baseState, card, lb) {
    const store = clone(baseState);
    const planType = store.planType || 'sense';
    store.planCards = { ...(store.planCards || {}), [planType]: [card.id] };
    store.cardChecked = { ...(store.cardChecked || {}), [card.id]: true };
    store.cardExtraChecked = { ...(store.cardExtraChecked || {}), [card.id]: false };
    store.cardEventChecked = { ...(store.cardEventChecked || {}), [card.id]: true };
    store.itemCounters = { ...(store.itemCounters || {}), [card.id]: getMaxItemCounter(card) };
    return { store, lb };
}

function buildNoSupportBaseState(calcState) {
    const baseNoSupport = clone(calcState);
    const planType = baseNoSupport.planType || 'sense';
    baseNoSupport.planCards = { ...(baseNoSupport.planCards || {}), [planType]: [] };
    baseNoSupport.cardChecked = {};
    baseNoSupport.cardExtraChecked = {};
    baseNoSupport.cardEventChecked = {};
    baseNoSupport.itemCounters = {};
    return baseNoSupport;
}

function getPresetBaseDetailCounts(preset) {
    const baseState = normalizeCalcState(preset.calcState, preset.mode, preset.idolId);
    const baseNoSupport = buildNoSupportBaseState(baseState);
    const counts = getTriggerCounts(baseNoSupport);
    const cardGetDetails = getCardGetDetailCounts(counts);
    return {
        enhanceMental: counts.total.enhance_m || 0,
        enhanceActive: counts.total.enhance_a || 0,
        change: counts.total.change || 0,
        customize: counts.total.customize || 0,
        getItem: counts.total.get_item || 0,
        drink: (counts.total.get_drink || 0) + (counts.total.purchase_drink || 0),
        purchaseDrink: counts.total.purchase_drink || 0,
        cardGet: (counts.total.get || 0) + (counts.total.get_card || 0),
        cardGetDetails,
        delete: counts.total.delete || 0,
        deleteMental: counts.total.delete_m || 0,
        deleteActive: counts.total.delete_a || 0,
        deleteTrouble: counts.total.delete_t || 0
    };
}

function getCardGetDetailCounts(counts) {
    const total = counts?.total || {};
    return {
        purchase: total.purchase_card || 0,
        mental: total.get_m || 0,
        active: total.get_a || 0,
        trouble: total.get_t || 0,
        ssr: total.get_ssr || 0,
        genki: total.get_genki || 0,
        goodcondition: total.get_goodcondition || 0,
        concentration: total.get_concentration || 0,
        motivation: total.get_motivation || 0,
        goodimpression: total.get_goodimpression || 0,
        enthusiasm: total.get_enthusiasm || 0,
        fullpower: total.get_fullpower || 0
    };
}

async function calculateEfficiencyRows(preset, onProgress, modalState = {}) {
    const baseState = normalizeCalcState(preset.calcState, preset.mode, preset.idolId);
    const planType = baseState.planType || 'sense';
    const eligibleCards = getEligibleCards(planType);
    const originalSupportLB = state.supportLB;
    const originalDisabledCards = state.disabledCards;
    const rows = [];

    state.supportLB = { ...originalSupportLB };
    state.disabledCards = { ...originalDisabledCards };

    try {
        const baseNoSupport = buildNoSupportBaseState(baseState);
        const singleCardBase = clone(baseNoSupport);
        getTriggerCounts(singleCardBase);

        for (let i = 0; i < eligibleCards.length; i++) {
            const card = eligibleCards[i];
            const values = [];
            const contexts = [];

            for (let lb = 0; lb <= 4; lb++) {
                state.supportLB[card.id] = lb;
                const { store } = buildCardStore(singleCardBase, card, lb);
                const context = createCardEvaluationContext(store, lb);
                contexts.push(context);
                values.push(Math.max(0, evaluateCardDisplayScore(context, card, modalState)));
            }

            rows.push({ card, values, contexts, max: Math.max(...values) });

            if (i % 8 === 0) {
                onProgress(Math.round(((i + 1) / eligibleCards.length) * 100));
                await sleep();
            }
        }
    } finally {
        state.supportLB = originalSupportLB;
        state.disabledCards = originalDisabledCards;
    }

    function getNextLbStepVal(row) {
        const cardId = row.card.id;
        const currentLb = originalSupportLB[cardId] ?? 0;
        if (currentLb >= 4) return -1;
        const curVal = row.values[currentLb] || 0;
        const nextVal = row.values[currentLb + 1] || 0;
        return nextVal - curVal;
    }

    rows.sort((a, b) => {
        const isFullA = (originalSupportLB[a.card.id] ?? 0) >= 4;
        const isFullB = (originalSupportLB[b.card.id] ?? 0) >= 4;
        if (isFullA !== isFullB) return isFullA ? 1 : -1;

        const nextGainA = getNextLbStepVal(a);
        const nextGainB = getNextLbStepVal(b);
        if (nextGainB !== nextGainA) {
            return nextGainB - nextGainA;
        }

        const max4A = a.values[4] || 0;
        const max4B = b.values[4] || 0;
        if (max4B !== max4A) {
            return max4B - max4A;
        }

        return (b.card.id || '').localeCompare(a.card.id || '');
    });
    onProgress(100);
    return rows;
}

function refreshRowsWithSelectedRewards(modalState) {
    modalState.rows = (modalState.rows || []).map(row => {
        if (!row.contexts) return row;
        const values = row.contexts.map(context => Math.max(0, evaluateCardDisplayScore(context, row.card, modalState)));
        return { ...row, values, max: Math.max(...values) };
    });
}

function rerenderResultStepPreservingScroll(content, modalState) {
    const table = content.querySelector('.support-lb-table');
    const scrollTop = table?.scrollTop || 0;
    renderResultStep(content, modalState);
    const nextTable = content.querySelector('.support-lb-table');
    if (nextTable) nextTable.scrollTop = scrollTop;
}

function getRewardEnhanceTotalForDisplay(modalState) {
    const context = modalState.rows?.find(row => row.contexts?.[0])?.contexts?.[0];
    if (!context) return 0;
    const counts = clone(context.counts);
    const before = counts.total.enhance || 0;
    const cloneState = { ...modalState, rewardEnhanceMental: Number.MAX_SAFE_INTEGER };
    applySelectedRewardCounts(counts, cloneState, '');
    return Math.max(0, (counts.total.enhance || 0) - before);
}

function getRewardSimpleTotalsForDisplay(modalState) {
    const context = modalState.rows?.find(row => row.contexts?.[0])?.contexts?.[0];
    if (!context) return { change: 0, delete: 0, customize: 0, getItem: 0, drink: 0, purchaseDrink: 0, cardGet: 0, cardGetDetails: getEmptyCardGetDetails() };
    const counts = clone(context.counts);
    const beforeChange = counts.total.change || 0;
    const beforeDelete = counts.total.delete || 0;
    const beforeCustomize = counts.total.customize || 0;
    const beforeGetItem = counts.total.get_item || 0;
    const beforeDrink = (counts.total.get_drink || 0) + (counts.total.purchase_drink || 0);
    const beforePurchaseDrink = counts.total.purchase_drink || 0;
    const beforeCardGet = (counts.total.get || 0) + (counts.total.get_card || 0);
    const beforeCardGetDetails = getCardGetDetailCounts(counts);
    applySelectedRewardCounts(counts, modalState, '');
    const afterCardGetDetails = getCardGetDetailCounts(counts);
    return {
        change: Math.max(0, (counts.total.change || 0) - beforeChange),
        delete: Math.max(0, (counts.total.delete || 0) - beforeDelete),
        customize: Math.max(0, (counts.total.customize || 0) - beforeCustomize),
        getItem: Math.max(0, (counts.total.get_item || 0) - beforeGetItem),
        drink: Math.max(0, ((counts.total.get_drink || 0) + (counts.total.purchase_drink || 0)) - beforeDrink),
        purchaseDrink: Math.max(0, (counts.total.purchase_drink || 0) - beforePurchaseDrink),
        cardGet: Math.max(0, ((counts.total.get || 0) + (counts.total.get_card || 0)) - beforeCardGet),
        cardGetDetails: Object.fromEntries(Object.keys(afterCardGetDetails).map(key => [
            key,
            Math.max(0, afterCardGetDetails[key] - (beforeCardGetDetails[key] || 0))
        ]))
    };
}

function getEmptyCardGetDetails() {
    return {
        purchase: 0,
        mental: 0,
        active: 0,
        trouble: 0,
        ssr: 0,
        genki: 0,
        goodcondition: 0,
        concentration: 0,
        motivation: 0,
        goodimpression: 0,
        enthusiasm: 0,
        fullpower: 0
    };
}

function getRewardDeleteTotalForDisplay(modalState) {
    return getRewardSimpleTotalsForDisplay(modalState).delete;
}

function renderEnhanceDistributor(modalState) {
    const total = getRewardEnhanceTotalForDisplay(modalState);
    const deleteTotal = getRewardDeleteTotalForDisplay(modalState);
    const baseCounts = modalState.baseDetailCounts || { enhanceMental: 0, enhanceActive: 0, change: 0, customize: 0, getItem: 0, drink: 0, purchaseDrink: 0, cardGet: 0, delete: 0, deleteMental: 0, deleteActive: 0, deleteTrouble: 0 };
    const mental = Math.max(0, Math.min(total, Number(modalState.rewardEnhanceMental ?? total)));
    const active = total - mental;
    const deleteMental = Math.max(0, Math.min(deleteTotal, Number(modalState.rewardDeleteMental ?? deleteTotal)));
    const deleteRemaining = deleteTotal - deleteMental;
    const deleteActive = Math.max(0, Math.min(deleteRemaining, Number(modalState.rewardDeleteActive ?? 0)));
    const deleteTrouble = deleteTotal - deleteMental - deleteActive;
    const renderTotalWithDelta = (base, delta) => `${base + delta}${delta > 0 ? ` <em>(+${delta})</em>` : ''}`;
    return `
        <div class="support-lb-enhance-distributor ${(total > 0 || deleteTotal > 0) ? '' : 'disabled'}">
            <div class="support-lb-enhance-controls">
                <div class="support-lb-enhance-control support-lb-enhance-kind">
                    <span>${getText('강화(멘탈)', '強化(メンタル)', 'Enhance(M)')}</span>
                    <div class="support-lb-enhance-stepper">
                        <strong>${renderTotalWithDelta(baseCounts.enhanceMental, mental)}</strong>
                        <button type="button" data-enhance-action="mental-plus" ${total <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="support-lb-enhance-control support-lb-enhance-kind">
                    <span>${getText('강화(액티브)', '強化(アクティブ)', 'Enhance(A)')}</span>
                    <div class="support-lb-enhance-stepper">
                        <strong>${renderTotalWithDelta(baseCounts.enhanceActive, active)}</strong>
                        <button type="button" data-enhance-action="active-plus" ${total <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="support-lb-enhance-control support-lb-delete-kind">
                    <span>${getText('삭제(멘탈)', '削除(メンタル)', 'Delete(M)')}</span>
                    <div class="support-lb-enhance-stepper">
                        <strong>${renderTotalWithDelta(baseCounts.deleteMental, deleteMental)}</strong>
                        <button type="button" data-delete-action="mental-plus" ${deleteTotal <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="support-lb-enhance-control support-lb-delete-kind">
                    <span>${getText('삭제(액티브)', '削除(アクティブ)', 'Delete(A)')}</span>
                    <div class="support-lb-enhance-stepper">
                        <strong>${renderTotalWithDelta(baseCounts.deleteActive, deleteActive)}</strong>
                        <button type="button" data-delete-action="active-plus" ${deleteTotal <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="support-lb-enhance-control support-lb-delete-kind">
                    <span>${getText('삭제(트러블)', '削除(トラブル)', 'Delete(T)')}</span>
                    <div class="support-lb-enhance-stepper">
                        <strong>${renderTotalWithDelta(baseCounts.deleteTrouble, deleteTrouble)}</strong>
                        <button type="button" data-delete-action="trouble-plus" ${deleteTotal <= 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRewardCountSummary(modalState) {
    const enhanceTotal = getRewardEnhanceTotalForDisplay(modalState);
    const deleteTotal = getRewardDeleteTotalForDisplay(modalState);
    const simpleTotals = getRewardSimpleTotalsForDisplay(modalState);
    const baseCounts = modalState.baseDetailCounts || { enhanceMental: 0, enhanceActive: 0, change: 0, customize: 0, getItem: 0, drink: 0, purchaseDrink: 0, cardGet: 0, cardGetDetails: getEmptyCardGetDetails(), deleteMental: 0, deleteActive: 0, deleteTrouble: 0 };
    const baseEnhanceTotal = (baseCounts.enhanceMental || 0) + (baseCounts.enhanceActive || 0);
    const baseDeleteTotal = (baseCounts.deleteMental || 0) + (baseCounts.deleteActive || 0) + (baseCounts.deleteTrouble || 0);
    const renderTotalWithDelta = (base, delta) => `${base + delta}${delta > 0 ? ` <em>(+${delta})</em>` : ''}`;
    const hasExtraSummary = enhanceTotal > 0 || deleteTotal > 0 || simpleTotals.change > 0 || simpleTotals.customize > 0 || simpleTotals.getItem > 0 || simpleTotals.drink > 0 || simpleTotals.purchaseDrink > 0 || simpleTotals.cardGet > 0;
    return `
        <div class="support-lb-count-summary ${hasExtraSummary ? '' : 'disabled'}">
            <div class="support-lb-extra-summary">
                <div>${getText('체인지', 'チェンジ', 'Change')} <strong>${renderTotalWithDelta(baseCounts.change, simpleTotals.change)}</strong></div>
                <div>${getText('개조', 'カスタマイズ', 'Customize')} <strong>${renderTotalWithDelta(baseCounts.customize, simpleTotals.customize)}</strong></div>
                <div>${getText('아이템', 'アイテム', 'Item')} <strong>${renderTotalWithDelta(baseCounts.getItem, simpleTotals.getItem)}</strong></div>
                <span class="support-lb-summary-break" aria-hidden="true"></span>
                <div class="enhance-summary">${getText('강화', '強化', 'Enhance')} <strong>${renderTotalWithDelta(baseEnhanceTotal, enhanceTotal)}</strong></div>
                <div class="delete-summary">${getText('삭제', '削除', 'Delete')} <strong>${renderTotalWithDelta(baseDeleteTotal, deleteTotal)}</strong></div>
                <div class="drink-summary">${getText('드링크', 'ドリンク', 'Drink')} <strong>${renderTotalWithDelta(baseCounts.drink, simpleTotals.drink)}</strong></div>
                <div class="card-summary">${getText('카드획득', 'カード獲得', 'Card Gain')} <strong>${renderTotalWithDelta(baseCounts.cardGet, simpleTotals.cardGet)}</strong></div>
            </div>
        </div>
    `;
}

function renderRewardDetailSummary(modalState) {
    const simpleTotals = getRewardSimpleTotalsForDisplay(modalState);
    const baseCounts = modalState.baseDetailCounts || { purchaseDrink: 0, cardGetDetails: getEmptyCardGetDetails() };
    const planType = modalState.preset?.calcState?.planType || modalState.selectedPlan || 'sense';
    const renderTotalWithDelta = (base, delta) => `${base + delta}${delta > 0 ? ` <em>(+${delta})</em>` : ''}`;
    const planCardAttrs = {
        sense: [
            ['goodcondition', getText('호조', '好調', 'Good')],
            ['concentration', getText('집중', '集中', 'Focus')]
        ],
        logic: [
            ['motivation', getText('의욕', 'やる気', 'Motivation')],
            ['goodimpression', getText('호인상', '好印象', 'Impression')]
        ],
        anomaly: [
            ['enthusiasm', getText('강기', '強気', 'Enthusiasm')],
            ['fullpower', getText('전력', '全力', 'Full Power')]
        ]
    };
    const detailItems = [
        ['purchaseDrink', getText('드링크 구매', 'ドリンク交換', 'Drink Buy'), 'drink'],
        ['purchase', getText('카드 구매', 'カード交換', 'Card Buy'), 'card'],
        ['mental', getText('멘탈', 'メンタル', 'Mental'), 'card joined-start'],
        ['active', getText('액티브', 'アクティブ', 'Active'), 'card joined-mid'],
        ['trouble', getText('트러블', 'トラブル', 'Trouble'), 'card joined-end'],
        ['ssr', 'SSR', 'card joined-start'],
        ['genki', getText('원기', '元気', 'Genki'), 'card joined-mid'],
        ...(planCardAttrs[planType] || planCardAttrs.sense).map((item, idx, arr) => [
            item[0],
            item[1],
            `card ${idx === arr.length - 1 ? 'joined-end' : 'joined-mid'}`
        ])
    ];
    return `
        <div class="support-lb-detail-summary">
            <div class="support-lb-cardget-summary">
                ${detailItems.map(([key, label, className = 'card']) => {
        const baseDetail = key === 'purchaseDrink' ? (baseCounts.purchaseDrink || 0) : (baseCounts.cardGetDetails?.[key] || 0);
        const deltaDetail = key === 'purchaseDrink' ? (simpleTotals.purchaseDrink || 0) : (simpleTotals.cardGetDetails?.[key] || 0);
        return `<div class="${className}"><span>${label}</span><strong>${renderTotalWithDelta(baseDetail, deltaDetail)}</strong></div>`;
    }).join('')}
            </div>
        </div>
    `;
}

function renderIdolButtons(selectedIdol) {
    return idolList.map(idolId => `
        <button class="support-lb-idol-btn ${selectedIdol === idolId ? 'active' : ''}" data-idol="${idolId}" style="--idol-color: ${idolColors[idolId] || '#ff4d8d'};" type="button">
            <img src="icons/idolicons/${idolId}_c.png" alt="${idolId}" onerror="this.src='icons/idol.png'">
        </button>
    `).join('');
}

function renderModeButtons(selectedMode) {
    return MODES.map(mode => `
        <button class="support-lb-mode-btn ${selectedMode === mode ? 'active' : ''}" data-mode="${mode}" type="button">
            <span>${escapeHtml(getModeLabel(mode))}</span>
        </button>
    `).join('');
}

function renderPlanButtons(selectedPlan) {
    return PLAN_TYPES.map(planType => `
        <button class="support-lb-plan-btn ${selectedPlan === planType ? 'active' : ''}" data-plan="${planType}" type="button">
            <img src="icons/${planType}.webp" alt="${planType}" onerror="this.style.display='none'">
            <span>${escapeHtml(getPlanLabel(planType))}</span>
        </button>
    `).join('');
}

function renderPresetButtons(presets, selectedKey) {
    if (presets.length === 0) {
        return `<div class="support-lb-empty">${getText('저장된 계산기 프리셋이 없습니다.', '保存された計算機プリセットがありません。', 'No saved calculator presets.')}</div>`;
    }

    return presets.map(preset => {
        const planType = preset.calcState.planType || 'sense';
        const subLabel = `${escapeHtml(getModeLabel(preset.mode))}${preset.timestamp ? ` · ${escapeHtml(preset.timestamp)}` : ''}`;
        return `
            <button class="support-lb-preset-btn ${selectedKey === preset.key ? 'active' : ''}" data-key="${escapeHtml(preset.key)}" type="button">
                <div class="support-lb-preset-main">
                    <img src="icons/${planType}.webp" alt="${planType}" onerror="this.style.display='none'">
                    <span>${escapeHtml(preset.name)}</span>
                </div>
                <div class="support-lb-preset-sub">${subLabel}</div>
            </button>
        `;
    }).join('');
}

function renderSupportRewardSlots(modalState) {
    const selectedRewards = modalState.selectedRewards || [];
    const selectedRewardCounters = modalState.selectedRewardCounters || [];
    return Array.from({ length: 6 }, (_, idx) => {
        const card = selectedRewards[idx] ? cardList.find(c => c.id === selectedRewards[idx]) : null;
        const maxCounter = getRewardMaxCounter(card);
        const content = card
            ? `<img src="${getSupportRewardImage(card)}" alt="${escapeHtml(getLocalizedCardName(card))}" onerror="this.src='${getSupportRewardFallbackImage(card)}'; this.onerror=null;">`
            : '<span class="support-lb-result-slot-plus">+</span>';
        const removeHtml = card
            ? `<button type="button" class="support-lb-reward-remove-btn" data-slot-index="${idx}">${getText('삭제', '削除', 'Remove')}</button>`
            : '<div class="support-lb-reward-remove-spacer"></div>';
        const counterHtml = card && maxCounter > 0
            ? `<div class="support-lb-reward-counter">
                <button type="button" class="support-lb-reward-counter-btn" data-counter-action="minus" data-slot-index="${idx}">-</button>
                <span>${Math.max(0, Math.min(maxCounter, Number(selectedRewardCounters[idx]) || 0))}</span>
                <button type="button" class="support-lb-reward-counter-btn" data-counter-action="plus" data-slot-index="${idx}">+</button>
            </div>`
            : '<div class="support-lb-reward-counter-spacer"></div>';
        return `<div class="support-lb-result-slot-wrap">
            ${removeHtml}
            <button class="support-lb-result-slot ${card ? 'filled' : ''}" type="button" data-slot-index="${idx}" aria-label="support reward slot ${idx + 1}">${content}</button>
            ${counterHtml}
        </div>`;
    }).join('');
}

function pruneSelectedRewardsForPlan(modalState, planType) {
    const selectedRewards = modalState.selectedRewards || [];
    const selectedRewardCounters = modalState.selectedRewardCounters || [];
    let changed = false;
    modalState.selectedRewards = selectedRewards.map(cardId => {
        if (!cardId) return cardId;
        const card = cardList.find(c => c.id === cardId);
        const isValid = card && (card.plan === 'free' || card.plan === planType);
        if (isValid) return cardId;
        changed = true;
        return null;
    });
    if (changed) {
        modalState.selectedRewardCounters = selectedRewardCounters.map((count, idx) => modalState.selectedRewards[idx] ? count : 0);
        modalState.rewardEnhanceMental = null;
        modalState.rewardDeleteMental = null;
        modalState.rewardDeleteActive = null;
    }
}

function closeSupportRewardPicker() {
    document.querySelectorAll('.support-lb-reward-picker').forEach(el => el.remove());
}

function closeSupportLbInfoTooltip() {
    document.querySelectorAll('.support-lb-info-tooltip').forEach(el => el.remove());
}

function openSupportLbInfoTooltip(anchorEl) {
    const existing = document.querySelector('.support-lb-info-tooltip');
    if (existing) {
        existing.remove();
        return;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'support-lb-info-tooltip';
    tooltip.innerHTML = getText(
        '각 서포트 카드의 P아이템 및 이벤트 등은 프리셋의 스케줄을 기준으로 최대치로 발동되어 계산되었으며, 추가로 P아이템 등을 추가해 타 서포트 카드와의 시너지도 확인할 수 있습니다. <br><span class="support-lb-info-note">※ P아이템의 직접적인 스텟 상승 옵션은 이미 기계산되어 있기에 무시됩니다.</span>',
        '各サポートカードのPアイテムやイベントなどは、プリセットのスケジュールを基準に最大値で発動したものとして計算されています。さらにPアイテムなどを追加して、他のサポートカードとのシナジーも確認できます。<br><span class="support-lb-info-note">※ Pアイテムの直接的なパラメータ上昇効果はすでに計算済みのため無視されます。</span>',
        'Each support card\'s P items, events, and related effects are calculated as if they triggered at their maximum values based on the preset schedule. You can also add P items to check synergy with other support cards.<br><span class="support-lb-info-note">* Direct stat increases from P items are ignored because they are already pre-calculated.</span>'
    );
    const themeHost = anchorEl.closest('.support-lb-efficiency-content');
    tooltip.style.setProperty('--support-lb-theme', themeHost ? getComputedStyle(themeHost).getPropertyValue('--support-lb-theme').trim() : getThemeColor());
    document.body.appendChild(tooltip);

    const rect = anchorEl.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    let left = rect.right + 8;
    let top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);

    if (left + tooltipWidth > window.innerWidth - 10) left = rect.left - tooltipWidth - 8;
    if (left < 10) left = 10;
    if (top < window.scrollY + 10) top = window.scrollY + 10;
    if (top + tooltipHeight > window.scrollY + window.innerHeight - 10) top = window.scrollY + window.innerHeight - tooltipHeight - 10;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    setTimeout(() => {
        const closeOnOutside = (e) => {
            if (!tooltip.parentElement) return;
            if (!tooltip.contains(e.target) && !anchorEl.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeOnOutside);
            }
        };
        document.addEventListener('click', closeOnOutside);
    }, 10);
}

function getRecentRewardStorageKey(planType) {
    return `${RECENT_REWARD_STORAGE_KEY}_${PLAN_TYPES.includes(planType) ? planType : 'sense'}`;
}

function getRecentRewardIds(planType) {
    try {
        const ids = JSON.parse(localStorage.getItem(getRecentRewardStorageKey(planType)));
        return Array.isArray(ids) ? ids.filter(Boolean) : [];
    } catch {
        return [];
    }
}

function saveRecentRewardId(cardId, planType) {
    if (!cardId) return;
    try {
        const ids = [cardId, ...getRecentRewardIds(planType).filter(id => id !== cardId)].slice(0, 5);
        localStorage.setItem(getRecentRewardStorageKey(planType), JSON.stringify(ids));
    } catch {
    }
}

function renderRewardPickerOption(card, extraClass = '') {
    const kind = getSupportRewardKind(card);
    return `
        <button class="support-lb-reward-option ${extraClass}" type="button" data-kind="${kind}" data-card-id="${escapeHtml(card.id)}" title="${escapeHtml(getLocalizedCardName(card))}">
            <img src="${getSupportRewardImage(card)}" alt="${escapeHtml(getLocalizedCardName(card))}" onerror="this.src='${getSupportRewardFallbackImage(card)}'; this.onerror=null;">
        </button>
    `;
}

function openSupportRewardPicker(slotEl, slotIndex, modalState, rows, rerender) {
    closeSupportRewardPicker();

    const candidates = [...rows]
        .map(row => row.card)
        .filter(card => card?.have)
        .filter(card => getSupportRewardKind(card) === 'item' || getSupportRewardKind(card) === 'card')
        .sort((a, b) => {
            const rarityOrder = { SSR: 0, SR: 1, R: 2 };
            const rarityA = rarityOrder[a.rarity] ?? 9;
            const rarityB = rarityOrder[b.rarity] ?? 9;
            if (rarityA !== rarityB) return rarityA - rarityB;
            const dateA = a.releasedAt || '0000-00-00';
            const dateB = b.releasedAt || '0000-00-00';
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            return (b.id || '').localeCompare(a.id || '');
        });
    const planType = modalState.preset?.calcState?.planType || modalState.selectedPlan || 'sense';
    const candidateIds = new Set(candidates.map(card => card.id));
    const recentCards = getRecentRewardIds(planType)
        .filter(cardId => candidateIds.has(cardId))
        .map(cardId => cardList.find(card => card.id === cardId))
        .filter(Boolean);

    const tooltip = document.createElement('div');
    tooltip.className = 'support-lb-reward-picker';
    tooltip.style.setProperty('--support-lb-theme', getSelectedIdolColor(modalState.selectedIdol));
    document.body.appendChild(tooltip);

    tooltip.innerHTML = `
        <div class="support-lb-reward-picker-head">
            <span>${getText('서포카 P아이템 선택', 'サポカPアイテム選択', 'Select Support P Item')}</span>
            <button class="support-lb-reward-picker-close" type="button" aria-label="close">×</button>
        </div>
        <div class="support-lb-reward-recent ${recentCards.length > 0 ? '' : 'empty'}">
            <div class="support-lb-reward-recent-grid">
                ${Array.from({ length: 5 }, (_, idx) => recentCards[idx]
        ? renderRewardPickerOption(recentCards[idx], 'recent')
        : '<div class="support-lb-reward-recent-empty"></div>').join('')}
            </div>
        </div>
        <div class="support-lb-reward-tabs">
            <button type="button" data-kind="item">${getText('아이템', 'アイテム', 'Item')}</button>
            <button type="button" data-kind="card">${getText('카드', 'カード', 'Card')}</button>
        </div>
        <div class="support-lb-reward-grid">
            ${candidates.map(card => renderRewardPickerOption(card)).join('')}
        </div>
    `;

    tooltip.querySelector('.support-lb-reward-picker-close')?.addEventListener('click', closeSupportRewardPicker);
    tooltip.querySelectorAll('.support-lb-reward-tabs button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = btn.classList.contains('active');
            tooltip.querySelectorAll('.support-lb-reward-tabs button').forEach(tab => {
                tab.classList.toggle('active', tab === btn && !wasActive);
            });
            const activeKind = tooltip.querySelector('.support-lb-reward-tabs button.active')?.dataset.kind || '';
            tooltip.querySelectorAll('.support-lb-reward-grid .support-lb-reward-option').forEach(option => {
                option.classList.toggle('hidden', !!activeKind && option.dataset.kind !== activeKind);
            });
        });
    });
    tooltip.querySelectorAll('.support-lb-reward-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            modalState.selectedRewards = [...(modalState.selectedRewards || [])];
            modalState.selectedRewardCounters = [...(modalState.selectedRewardCounters || [])];
            modalState.selectedRewards.forEach((cardId, idx) => {
                if (idx !== slotIndex && cardId === btn.dataset.cardId) {
                    modalState.selectedRewards[idx] = null;
                    modalState.selectedRewardCounters[idx] = 0;
                }
            });
            modalState.selectedRewards[slotIndex] = btn.dataset.cardId;
            const selectedCard = cardList.find(c => c.id === btn.dataset.cardId);
            const maxCounter = getRewardMaxCounter(selectedCard);
            modalState.selectedRewardCounters[slotIndex] = maxCounter || 0;
            saveRecentRewardId(btn.dataset.cardId, planType);
            closeSupportRewardPicker();
            rerender();
        });
    });

    const rect = slotEl.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 8;

    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;
    if (rect.bottom + tooltipHeight + 24 > window.innerHeight) top = rect.top + window.scrollY - tooltipHeight - 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    setTimeout(() => {
        const closeOnOutside = (e) => {
            if (!tooltip.parentElement) return;
            if (!tooltip.contains(e.target) && !slotEl.contains(e.target)) {
                closeSupportRewardPicker();
                document.removeEventListener('click', closeOnOutside);
            }
        };
        document.addEventListener('click', closeOnOutside);
    }, 0);
}

function renderSelectStep(content, modalState) {
    closeSupportRewardPicker();
    content.closest('.support-lb-efficiency-content')?.style.setProperty('--support-lb-theme', getSelectedIdolColor(modalState.selectedIdol));
    content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-efficiency-subtitle')?.classList.remove('hidden');
    const headerAction = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-header-action');
    if (headerAction) headerAction.innerHTML = '';
    const titleSummary = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-title-summary');
    if (titleSummary) titleSummary.innerHTML = '';
    const presets = getSavedCalcPresets(modalState.selectedIdol, modalState.selectedMode, modalState.selectedPlan);
    if (!presets.some(p => p.key === modalState.selectedPresetKey)) {
        modalState.selectedPresetKey = presets[0]?.key || '';
    }
    saveSelection(modalState);

    content.innerHTML = `
        <div class="support-lb-select-step">
            <div class="support-lb-section-title">・${getText('계산기 프리셋', '計算機プリセット', 'Calculator Preset')}</div>
            <div class="support-lb-idol-grid">${renderIdolButtons(modalState.selectedIdol)}</div>
            <div class="support-lb-mode-grid">${renderModeButtons(modalState.selectedMode)}</div>
            <div class="support-lb-plan-grid">${renderPlanButtons(modalState.selectedPlan)}</div>
            <div class="support-lb-preset-panel">
                <div class="support-lb-preset-list">${renderPresetButtons(presets, modalState.selectedPresetKey)}</div>
            </div>
            <div class="support-lb-footer">
                <div class="support-lb-filter-note">${getText('* 현재 서포트 카드 탭의 필터가 적용됩니다.', '* 現在のサポートカードタブのフィルターが適用されます。', '* Uses the filters currently set in the Support Cards tab.')}</div>
                <button class="support-lb-primary-btn" type="button" ${modalState.selectedPresetKey ? '' : 'disabled'}>${getText('다음', '次へ', 'Next')}</button>
            </div>
        </div>
    `;

    content.querySelectorAll('.support-lb-idol-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalState.selectedIdol = btn.dataset.idol;
            modalState.selectedPresetKey = '';
            saveSelection(modalState);
            renderSelectStep(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalState.selectedMode = btn.dataset.mode;
            modalState.selectedPlan = getInitialPlan(modalState.selectedMode);
            modalState.selectedPresetKey = '';
            saveSelection(modalState);
            renderSelectStep(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalState.selectedPlan = btn.dataset.plan;
            modalState.selectedPresetKey = '';
            saveSelection(modalState);
            renderSelectStep(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalState.selectedPresetKey = btn.dataset.key;
            saveSelection(modalState);
            renderSelectStep(content, modalState);
        });
    });

    content.querySelector('.support-lb-primary-btn')?.addEventListener('click', () => {
        const preset = getSavedCalcPresets(modalState.selectedIdol, modalState.selectedMode, modalState.selectedPlan).find(p => p.key === modalState.selectedPresetKey);
        if (preset) renderLoadingStep(content, modalState, preset);
    });
}

function renderLoadingStep(content, modalState, preset) {
    pruneSelectedRewardsForPlan(modalState, preset.calcState.planType || 'sense');
    closeSupportRewardPicker();
    content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-efficiency-subtitle')?.classList.add('hidden');
    const headerAction = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-header-action');
    if (headerAction) headerAction.innerHTML = '';
    const titleSummary = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-title-summary');
    if (titleSummary) titleSummary.innerHTML = '';
    content.innerHTML = `
        <div class="support-lb-loading-step">
            <div class="support-lb-spinner"></div>
            <div class="support-lb-loading-title">${getText('돌파 효율 계산 중', '開花効率を計算中', 'Calculating efficiency')}</div>
            <div class="support-lb-loading-progress">0%</div>
        </div>
    `;

    const progressEl = content.querySelector('.support-lb-loading-progress');
    setTimeout(async () => {
        try {
            const rows = await calculateEfficiencyRows(preset, progress => {
                if (progressEl) progressEl.textContent = `${progress}%`;
            }, modalState);
            modalState.rows = rows;
            modalState.preset = preset;
            modalState.baseDetailCounts = getPresetBaseDetailCounts(preset);
            renderResultStep(content, modalState);
        } catch (error) {
            console.error('Support LB efficiency calculation failed:', error);
            content.innerHTML = `
                <div class="support-lb-loading-step">
                    <div class="support-lb-loading-title">${getText('계산에 실패했습니다.', '計算に失敗しました。', 'Calculation failed.')}</div>
                    <button class="support-lb-primary-btn" type="button">${getText('돌아가기', '戻る', 'Back')}</button>
                </div>
            `;
            content.querySelector('.support-lb-primary-btn')?.addEventListener('click', () => renderSelectStep(content, modalState));
        }
    }, 80);
}

function renderResultStep(content, modalState) {
    closeSupportRewardPicker();
    content.closest('.support-lb-efficiency-content')?.style.setProperty('--support-lb-theme', getSelectedIdolColor(modalState.selectedIdol));
    content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-efficiency-subtitle')?.classList.add('hidden');
    const headerAction = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-header-action');
    const titleSummary = content.closest('.support-lb-efficiency-content')?.querySelector('.support-lb-title-summary');
    const rows = modalState.rows || [];
    const preset = modalState.preset;
    const globalMax = Math.max(1, ...rows.map(row => row.max || 0));
    const calcType = modalState.calcType || 'step';
    const isStep = calcType === 'step';
    const sortType = modalState.sortType || 'currentValue';

    // 전체 리스트 중 최대 상승 수치(점수 차이 최댓값) 계산 (구간별 vs 누적 모드 반영)
    const allGains = rows.flatMap(r => {
        const base = r.values[0] || 0;
        return [1, 2, 3, 4].map(i => {
            const cur = r.values[i] || 0;
            const prev = isStep ? (r.values[i - 1] || 0) : base;
            return Math.max(0, cur - prev);
        });
    });
    const globalMaxGain = Math.max(1, ...allGains);

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const ownedSuffix = isJa ? '凸' : isEn ? 'LB' : '돌';
    const headerLabels = [0, 1, 2, 3, 4].map(i => {
        return `<div class="support-lb-header-col" style="flex: 1; text-align: center; font-size: 0.75rem; font-weight: 800; color: #555555;">${i}${ownedSuffix}</div>`;
    }).join('');

    const compareEfficiency = (a, b) => {
        if (isStep) {
            // 구간별 모드: 1순위 현재 돌파에서 +1돌 시 점수 상승 수치, 2순위 4돌 점수 수치
            const getStepGainVal = (row) => {
                const cardId = row.card.id;
                const currentLb = state.supportLB[cardId] ?? 0;
                if (currentLb >= 4) return -1;
                const curVal = row.values[currentLb] || 0;
                const nextVal = row.values[currentLb + 1] || 0;
                return nextVal - curVal;
            };

            const gainA = getStepGainVal(a);
            const gainB = getStepGainVal(b);
            if (gainB !== gainA) return gainB - gainA;

            const rarityOrder = { ssr: 0, sr: 1, r: 2 };
            const rA = rarityOrder[(a.card.rarity || 'r').toLowerCase()] ?? 9;
            const rB = rarityOrder[(b.card.rarity || 'r').toLowerCase()] ?? 9;
            if (rA !== rB) return rA - rB;

            const max4A = a.values[4] || 0;
            const max4B = b.values[4] || 0;
            if (max4B !== max4A) return max4B - max4A;

            return (b.card.id || '').localeCompare(a.card.id || '');
        } else {
            // 누적 모드: 1순위 4돌(풀돌) 총 누적 점수 상승 수치, 2순위 4돌 점수 수치
            const getTotGainVal = (row) => {
                const base = row.values[0] || 0;
                const maxVal = row.values[4] || 0;
                return maxVal - base;
            };
            const totA = getTotGainVal(a);
            const totB = getTotGainVal(b);
            if (totB !== totA) return totB - totA;

            const max4A = a.values[4] || 0;
            const max4B = b.values[4] || 0;
            if (max4B !== max4A) return max4B - max4A;

            return (b.card.id || '').localeCompare(a.card.id || '');
        }
    };

    const sortedRows = [...rows].sort((a, b) => {
        if (sortType === 'max4' || sortType === 'base0') {
            const idx = sortType === 'max4' ? 4 : 0;
            const valA = a.values[idx] || 0;
            const valB = b.values[idx] || 0;
            if (valB !== valA) return valB - valA;
            const rarityOrder = { ssr: 0, sr: 1, r: 2 };
            const rA = rarityOrder[(a.card.rarity || 'r').toLowerCase()] ?? 9;
            const rB = rarityOrder[(b.card.rarity || 'r').toLowerCase()] ?? 9;
            if (rA !== rB) return rA - rB;
        }
        if (sortType === 'currentValue') {
            const disabledA = !!state.disabledCards?.[a.card.id];
            const disabledB = !!state.disabledCards?.[b.card.id];
            if (disabledA !== disabledB) return disabledA ? 1 : -1;

            const lbA = state.supportLB[a.card.id] ?? 0;
            const lbB = state.supportLB[b.card.id] ?? 0;
            const valA = a.values[lbA] || 0;
            const valB = b.values[lbB] || 0;
            if (valB !== valA) return valB - valA;

            const rarityOrder = { ssr: 0, sr: 1, r: 2 };
            const rA = rarityOrder[(a.card.rarity || 'r').toLowerCase()] ?? 9;
            const rB = rarityOrder[(b.card.rarity || 'r').toLowerCase()] ?? 9;
            if (rA !== rB) return rA - rB;
        }
        if (sortType === 'lbLow' || sortType === 'lbHigh') {
            const lbA = state.disabledCards?.[a.card.id] ? -1 : (state.supportLB[a.card.id] ?? 0);
            const lbB = state.disabledCards?.[b.card.id] ? -1 : (state.supportLB[b.card.id] ?? 0);
            if (lbA !== lbB) return sortType === 'lbLow' ? lbA - lbB : lbB - lbA;
            const rarityOrder = { ssr: 0, sr: 1, r: 2 };
            const rA = rarityOrder[(a.card.rarity || 'r').toLowerCase()] ?? 9;
            const rB = rarityOrder[(b.card.rarity || 'r').toLowerCase()] ?? 9;
            if (rA !== rB) return rA - rB;
        }
        if (sortType === 'oldest' || sortType === 'latest') {
            const dateA = a.card.releasedAt || '0000-00-00';
            const dateB = b.card.releasedAt || '0000-00-00';
            if (dateA !== dateB) return sortType === 'oldest' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        }
        return compareEfficiency(a, b);
    });
    if (titleSummary) titleSummary.innerHTML = `
        <div class="support-lb-header-result-summary">
            <img class="support-lb-result-idol-icon" src="icons/idolicons/${preset.idolId}_c.png" alt="${escapeHtml(getIdolName(preset.idolId))}" onerror="this.src='icons/idol.png'">
            <div class="support-lb-result-meta-text">
                <span class="support-lb-result-idol-name"><img class="support-lb-result-plan-icon-sm" src="icons/${preset.calcState.planType || 'sense'}.webp" alt="${preset.calcState.planType || 'sense'}" onerror="this.style.display='none'">${escapeHtml(getIdolName(preset.idolId))}</span>
                <span class="support-lb-result-preset-info">${escapeHtml(getModeLabel(preset.mode))} · ${escapeHtml(preset.name)}</span>
            </div>
        </div>
    `;

    if (headerAction) headerAction.innerHTML = `
        <div class="support-lb-header-result-controls">
            ${renderCalcTypeToggle(isStep)}
            <select class="support-lb-sort-select" aria-label="sort">
                <option value="currentValue" ${sortType === 'currentValue' ? 'selected' : ''}>${getText('수치순', '数値順', 'Current Score')}</option>
                <option value="base0" ${sortType === 'base0' ? 'selected' : ''}>${getText('0돌 수치순', '0凸数値順', '0LB Score')}</option>
                <option value="max4" ${sortType === 'max4' ? 'selected' : ''}>${getText('4돌 수치순', '4凸数値順', '4LB Score')}</option>
                <option value="latest" ${sortType === 'latest' ? 'selected' : ''}>${getText('최신순', '新しい順', 'Newest')}</option>
                <option value="oldest" ${sortType === 'oldest' ? 'selected' : ''}>${getText('오래된순', '古い順', 'Oldest')}</option>
                <option value="lbHigh" ${sortType === 'lbHigh' ? 'selected' : ''}>${getText('돌파순', '凸順', 'LB')}</option>
                <option value="lbLow" ${sortType === 'lbLow' ? 'selected' : ''}>${getText('낮은 돌파순', '低凸順', 'Low LB')}</option>
                <option value="efficiency" ${sortType === 'efficiency' ? 'selected' : ''}>${getText('효율순', '効率順', 'Efficiency')}</option>
            </select>
            <button class="support-lb-back-btn" type="button">${getText('돌아가기', '戻る', 'Back')}</button>
        </div>
    `;

    content.innerHTML = `
        <div class="support-lb-result-step">
            <div class="support-lb-result-head">
                <div class="support-lb-result-meta ${modalState.metaExpanded ? 'expanded' : ''}">
                    <div class="support-lb-result-slots">
                        ${renderSupportRewardSlots(modalState)}
                    </div>
                    ${renderRewardCountSummary(modalState)}
                    ${renderEnhanceDistributor(modalState)}
                    ${renderRewardDetailSummary(modalState)}
                    <button class="support-lb-info-btn" type="button" aria-label="info"><img src="icons/info.svg" alt=""></button>
                    <button class="support-lb-meta-expand-btn ${modalState.metaExpanded ? 'expanded' : ''}" type="button" aria-label="expand">‹</button>
                </div>
            </div>
            <div class="support-lb-table">
                <div class="support-lb-table-header">
                    <div class="support-lb-header-card"></div>
                    <div class="support-lb-header-chart">
                        <div class="support-lb-header-cols">
                            ${headerLabels}
                        </div>
                    </div>
                </div>
                <div class="support-lb-table-body">
                    ${sortedRows.length > 0 ? sortedRows.map(row => renderResultRow(row, globalMax, globalMaxGain, isStep)).join('') : `<div class="support-lb-empty" style="text-align: center; padding: 28px; color: #888;">${getText('서포트 카드 탭의 필터와 일치하는 카드가 없습니다.', 'サポートカードタブのフィルターに一致するカード가ありません。', 'No cards match the filters set in the Support Cards tab.')}</div>`}
                </div>
            </div>
        </div>
    `;

    headerAction?.querySelector('.support-lb-back-btn')?.addEventListener('click', () => {
        renderSelectStep(content, modalState);
    });

    content.querySelector('.support-lb-meta-expand-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        modalState.metaExpanded = !modalState.metaExpanded;
        const meta = content.querySelector('.support-lb-result-meta');
        const btn = content.querySelector('.support-lb-meta-expand-btn');
        if (meta) meta.classList.toggle('expanded', modalState.metaExpanded);
        if (btn) btn.classList.toggle('expanded', modalState.metaExpanded);
    });

    content.querySelector('.support-lb-info-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSupportRewardPicker();
        openSupportLbInfoTooltip(e.currentTarget);
    });

    headerAction?.querySelector('.support-lb-sort-select')?.addEventListener('change', (e) => {
        modalState.sortType = e.currentTarget.value;
        renderResultStep(content, modalState);
    });

    headerAction?.querySelectorAll('.support-lb-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            if (modalState.calcType !== type) {
                modalState.calcType = type;
                renderResultStep(content, modalState);
            }
        });
    });

    content.querySelectorAll('.support-lb-result-slot').forEach(slotEl => {
        slotEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const slotIndex = Number(slotEl.dataset.slotIndex);
            const selectedRewardId = modalState.selectedRewards?.[slotIndex];
            if (selectedRewardId) {
                closeSupportRewardPicker();
                showSupportItemTooltip(slotEl, selectedRewardId);
                return;
            }
            openSupportRewardPicker(slotEl, slotIndex, modalState, sortedRows, () => {
                refreshRowsWithSelectedRewards(modalState);
                rerenderResultStepPreservingScroll(content, modalState);
            });
        });
    });

    content.querySelectorAll('.support-lb-reward-counter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slotIndex = Number(btn.dataset.slotIndex);
            const selectedCard = cardList.find(c => c.id === modalState.selectedRewards?.[slotIndex]);
            const maxCounter = getRewardMaxCounter(selectedCard);
            modalState.selectedRewardCounters = [...(modalState.selectedRewardCounters || [])];
            const current = Number(modalState.selectedRewardCounters[slotIndex]) || 0;
            const next = btn.dataset.counterAction === 'plus'
                ? Math.min(maxCounter, current + 1)
                : Math.max(0, current - 1);
            modalState.selectedRewardCounters[slotIndex] = next;
            refreshRowsWithSelectedRewards(modalState);
            rerenderResultStepPreservingScroll(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-reward-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slotIndex = Number(btn.dataset.slotIndex);
            modalState.selectedRewards = [...(modalState.selectedRewards || [])];
            modalState.selectedRewardCounters = [...(modalState.selectedRewardCounters || [])];
            modalState.selectedRewards[slotIndex] = null;
            modalState.selectedRewardCounters[slotIndex] = 0;
            refreshRowsWithSelectedRewards(modalState);
            rerenderResultStepPreservingScroll(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-enhance-stepper button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.dataset.deleteAction) {
                const total = getRewardDeleteTotalForDisplay(modalState);
                if (total <= 0) return;
                const mental = Math.max(0, Math.min(total, Number(modalState.rewardDeleteMental ?? total)));
                const remaining = total - mental;
                const active = Math.max(0, Math.min(remaining, Number(modalState.rewardDeleteActive ?? 0)));
                let nextMental = mental;
                let nextActive = active;

                if (btn.dataset.deleteAction === 'mental-plus') {
                    if (active > 0) nextActive -= 1;
                    else if (total - mental - active > 0) nextMental += 1;
                } else if (btn.dataset.deleteAction === 'active-plus') {
                    if (mental > 0) nextMental -= 1;
                    else if (total - mental - active > 0) nextActive += 1;
                } else if (btn.dataset.deleteAction === 'trouble-plus') {
                    if (active > 0) nextActive -= 1;
                    else if (mental > 0) nextMental -= 1;
                }

                modalState.rewardDeleteMental = Math.max(0, Math.min(total, nextMental));
                modalState.rewardDeleteActive = Math.max(0, Math.min(total - modalState.rewardDeleteMental, nextActive));
                refreshRowsWithSelectedRewards(modalState);
                rerenderResultStepPreservingScroll(content, modalState);
                return;
            }

            const total = getRewardEnhanceTotalForDisplay(modalState);
            if (total <= 0) return;
            const mental = Math.max(0, Math.min(total, Number(modalState.rewardEnhanceMental ?? total)));
            let nextMental = mental;
            if (btn.dataset.enhanceAction === 'mental-plus') {
                nextMental = Math.min(total, mental + 1);
            } else {
                nextMental = Math.max(0, mental - 1);
            }
            modalState.rewardEnhanceMental = nextMental;
            refreshRowsWithSelectedRewards(modalState);
            rerenderResultStepPreservingScroll(content, modalState);
        });
    });

    content.querySelectorAll('.support-lb-card-bg[data-card-id]').forEach(cardBgEl => {
        cardBgEl.addEventListener('click', () => {
            const card = cardList.find(c => c.id === cardBgEl.dataset.cardId);
            if (!card) return;
            const imgSrc = card.image || `images/support/${card.id}.webp`;
            showCardModal(card, getLocalizedCardName(card), imgSrc);
            const cardModal = document.getElementById('card-modal');
            if (cardModal) cardModal.style.zIndex = '35000';
        });
    });
}

function renderResultRow(row, globalMax, globalMaxGain, isStep = true) {
    const card = row.card;
    const currentLb = state.supportLB[card.id] ?? 0;
    const attrColor = card.type === 'vocal' ? '#ff4d8d' : (card.type === 'dance' ? '#46a4f3' : (card.type === 'visual' ? '#fcc75e' : '#72da49'));
    const lineColor = card.type === 'vocal' ? '#a92758' : (card.type === 'dance' ? '#24679f' : (card.type === 'visual' ? '#946815' : '#3e7f28'));
    const isDisabledCard = !!state.disabledCards?.[card.id];
    const isFullLb = currentLb >= 4;
    const cardImageStyle = isDisabledCard ? 'filter: grayscale(95%);' : (isFullLb ? 'filter: grayscale(0%); opacity: 1;' : '');
    const displayCurrentLb = isDisabledCard ? 0 : currentLb;
    const chartGuideColor = '#a0aec0';
    const baseVal = row.values[0] || 0;
    const hasSpLessonUp = card.abilities?.some(ability =>
        ability === 'allsp_lessonup' ||
        ability === 'suballsp_lessonup' ||
        ability === 'sp_lessonup'
    );

    let barsOnlyHtml = '';
    let overlayHtml = '';
    let valColsHtml = '';
    const points = [];
    const xPositions = [10, 30, 50, 70, 90];

    for (let i = 0; i <= 4; i++) {
        const val = row.values[i] || 0;
        const pctNum = globalMax > 0 ? ((val / globalMax) * 100) : 0;
        const barHeight = Math.max(val > 0 ? 3 : 0, pctNum).toFixed(1);

        // 구간별: 현재돌파와 현재돌파+1 진한색 / 누적: 현재돌파 이상 전부 진한색
        const isHighlighted = isDisabledCard
            ? (isStep ? i === 0 : true)
            : (isStep ? (i === displayCurrentLb || i === Math.min(4, displayCurrentLb + 1)) : i >= displayCurrentLb);
        const barBgColor = isHighlighted ? attrColor : `color-mix(in srgb, ${attrColor} 34%, #ffffff)`;
        const dotColor = lineColor;

        // 꺾은선 보조축: 0돌은 0(하단 4%), 1~4돌은 전체 리스트의 최고 상승 수치(globalMaxGain)를 100%(상단 90%) 기준으로 매핑
        const prevVal = isStep ? (row.values[i - 1] || 0) : baseVal;
        const valGain = (i > 0) ? Math.max(0, val - prevVal) : 0;
        let gainPct = 0;
        if (i > 0) {
            if (prevVal > 0) {
                gainPct = Math.round(((val - prevVal) / prevVal) * 100);
            } else if (val > 0) {
                gainPct = 100;
            }
        }
        const lineRatio = (i > 0 && globalMaxGain > 0) ? (valGain / globalMaxGain) : 0;
        const lineHeightPct = Math.min(92, Math.max(4, Math.round(4 + lineRatio * 86)));

        let dotHtml = '';
        let pctLabelHtml = '';
        if (i > 0) {
            const lineLabelOpacity = isHighlighted ? '1' : '0.6';
            const isHighPoint = lineHeightPct >= 78;
            const pctPosStyle = isHighPoint
                ? `bottom: calc(${lineHeightPct}% - 17px); left: calc(50% + 8px); transform: translateX(-50%);`
                : `bottom: calc(${lineHeightPct}% + 5px); left: calc(50% + 8px); transform: translateX(-50%);`;
            pctLabelHtml = `<div class="support-lb-line-pct" style="position: absolute; ${pctPosStyle} font-size: 0.68rem; font-weight: 800; color: #334155; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9); white-space: nowrap; user-select: none; pointer-events: none; z-index: 8; opacity: ${lineLabelOpacity};">+${valGain}</div>`;
            dotHtml = `<div class="support-lb-line-dot" style="position: absolute; bottom: calc(${lineHeightPct}% - 4px); left: 50%; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background: #ffffff; border: 2px solid ${dotColor}; box-sizing: border-box; pointer-events: none; z-index: 6; opacity: ${lineLabelOpacity};"></div>`;
        }

        // 레이어 1: 막대 본체 (선보다 뒤쪽, z-index: 2)
        barsOnlyHtml += `
            <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                <div class="support-lb-bar" style="width: 16px; height: ${barHeight}%; background: ${barBgColor}; opacity: 1; border-radius: 0; box-sizing: border-box;"></div>
            </div>
        `;

        // 레이어 3: 포인트 원(z-index: 6) 및 상단 +수치(z-index: 8)
        overlayHtml += `
            <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                ${dotHtml}
                ${pctLabelHtml}
            </div>
        `;

        // 하단 수치 행: 각 돌파별 절대 점수 수치 및 (+%) 증분율
        const pctSubColor = isHighlighted ? attrColor : '#888888';
        const pctSubHtml = (i > 0)
            ? `<div style="font-size: 0.60rem; font-weight: 700; color: ${pctSubColor}; margin-top: 1px;">(+${gainPct}%)</div>`
            : `<div style="font-size: 0.60rem; font-weight: 700; color: transparent; margin-top: 1px;">-</div>`;
        const valOpacity = isHighlighted ? '1' : '0.6';
        valColsHtml += `
            <div class="support-lb-val-col" style="flex: 1; text-align: center; font-size: 0.72rem; font-weight: ${isHighlighted ? '900' : '800'}; color: ${isHighlighted ? '#0f172a' : (val > 0 ? '#475569' : '#bbb')}; line-height: 1.1; opacity: ${valOpacity};">
                <div>${val}</div>
                ${pctSubHtml}
            </div>
        `;

        const y = (100 - lineHeightPct).toFixed(1);
        points.push(`${xPositions[i]},${y}`);
    }

    // 레이어 2: 꺾은선 (막대보다 앞, 원/수치보다 뒤, z-index: 4)
    const lineChartSvg = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; left: 7px; right: 7px; top: 0; bottom: 0; width: calc(100% - 14px); height: 100%; overflow: visible; pointer-events: none; z-index: 4;">
            <polyline points="${points.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
        </svg>
    `;

    const flowersHtml = Array.from({ length: 4 }, (_, idx) => {
        const src = idx < currentLb ? 'icons/flower.webp' : 'icons/flowerback.webp';
        return `<img src="${src}" class="support-lb-card-flower" alt="flower">`;
    }).join('');
    const dividerRatio = (currentLb + 0.5) / 5;
    const dividerOffset = 7 - (14 * dividerRatio);
    const dividerLeft = `calc(${(dividerRatio * 100).toFixed(1)}% ${dividerOffset >= 0 ? '+' : '-'} ${Math.abs(dividerOffset).toFixed(1)}px)`;
    const currentDividerHtml = !isDisabledCard
        ? `<div class="support-lb-current-divider" style="position: absolute; top: 0; bottom: 0; left: ${dividerLeft}; border-left: 1px dashed ${chartGuideColor}; pointer-events: none; z-index: 1;"></div>`
        : '';

    return `
        <div class="support-lb-row rarity-${(card.rarity || 'r').toLowerCase()} ${isFullLb ? 'is-full-lb' : ''}" style="--row-attr-color: ${attrColor};">
            <div class="support-lb-card-bg ${isDisabledCard ? 'is-disabled-card' : ''}" data-card-id="${escapeHtml(card.id)}">
                <img class="support-lb-card-img" src="images/support/thumb/${card.id}.webp" alt="${card.id}" style="${cardImageStyle}" onerror="this.src='images/support/${card.id}.webp';">
                ${card.type ? `<img class="support-lb-type-icon" src="icons/${card.type.toLowerCase()}.webp" alt="${escapeHtml(card.type)}" onerror="this.style.display='none';">` : ''}
                ${hasSpLessonUp ? `<img class="support-lb-sp-icon" src="icons/sp_icon.webp" alt="SP" onerror="this.style.display='none';">` : ''}
                ${isDisabledCard ? '' : `<div class="support-lb-card-flowers">${flowersHtml}</div>`}
            </div>
            <div class="support-lb-card-spacer"></div>
            <div class="support-lb-chart-wrapper">
                <div class="possession-chart-bars" style="width: 100%; height: 66px; position: relative; border-bottom: 2px solid ${chartGuideColor}; box-sizing: border-box;">
                    <div style="position: absolute; left: 0; right: 0; top: 0%; border-top: 1px dashed ${chartGuideColor}; z-index: 1;"></div>
                    <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed ${chartGuideColor}; z-index: 1;"></div>
                    
                    <div style="position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: flex-end; z-index: 2; padding: 0 7px;">
                        ${barsOnlyHtml}
                    </div>

                    ${lineChartSvg}
                    ${currentDividerHtml}

                    <div style="position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: flex-end; z-index: 8; padding: 0 7px; pointer-events: none;">
                        ${overlayHtml}
                    </div>
                </div>
                <div class="support-lb-chart-val-row" style="display: flex; justify-content: space-around; padding: 4px 7px 0; box-sizing: border-box;">
                    ${valColsHtml}
                </div>
            </div>
        </div>
    `;
}

export function openSupportLbEfficiencyModal() {
    const existing = document.getElementById('support-lb-efficiency-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'support-lb-efficiency-modal';
    modal.style.zIndex = '34000';

    const themeColor = getThemeColor();
    const savedSelection = readSavedSelection();
    const fallbackIdol = state.favoriteIdol || idolList[0] || 'saki';
    const fallbackMode = localStorage.getItem('last_calc_type') || 'hajime';
    const selectedIdol = idolList.includes(savedSelection.selectedIdol) ? savedSelection.selectedIdol : fallbackIdol;
    const selectedMode = MODES.includes(savedSelection.selectedMode) ? savedSelection.selectedMode : fallbackMode;
    const selectedPlan = PLAN_TYPES.includes(savedSelection.selectedPlan) ? savedSelection.selectedPlan : getInitialPlan(selectedMode);
    const modalState = {
        selectedIdol,
        selectedMode,
        selectedPlan,
        selectedPresetKey: savedSelection.selectedPresetKey || '',
        calcType: 'step',
        sortType: 'currentValue',
        selectedRewards: [],
        selectedRewardCounters: [],
        rewardEnhanceMental: null,
        rewardDeleteMental: null,
        rewardDeleteActive: null,
        metaExpanded: false,
        rows: [],
        preset: null
    };

    modal.innerHTML = `
        <div class="modal-content support-lb-efficiency-content" style="width: min(860px, 94vw); max-width: 94vw; border-color: ${themeColor}; --support-lb-theme: ${themeColor};">
            <div class="support-lb-efficiency-header">
                <div class="support-lb-header-text">
                    <div class="support-lb-title-row">
                        <div class="support-lb-efficiency-title">${getTitleText()}</div>
                        <div class="support-lb-title-summary"></div>
                    </div>
                    <div class="support-lb-efficiency-subtitle">${getSubtitleText()}</div>
                </div>
                <div class="support-lb-header-action"></div>
            </div>
            <div class="support-lb-efficiency-body"></div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    history.pushState({ modalOpen: 'supportLbEfficiency' }, "");

    const content = modal.querySelector('.support-lb-efficiency-body');
    renderSelectStep(content, modalState);

    const closeModal = () => {
        history.back();
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.closeSupportLbEfficiencyModal = (isPopState = false) => {
        modal.remove();
        if (!isPopState && history.state?.modalOpen === 'supportLbEfficiency') {
            history.back();
        }
    };
}

window.openSupportLbEfficiencyModal = openSupportLbEfficiencyModal;
