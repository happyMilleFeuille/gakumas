// calcRecommend.js (Beta)
import { cardList } from './carddata.js';
import { getTriggerCounts, calculateTotals } from './calcLogic.js';
import { state } from './state.js';

/**
 * 서포트 카드 자동 추천 엔진 (Beta)
 * @param {Object} store - 현재 계산기 상태 (calcStore)
 * @param {string} targetAttr - 집중할 속성 ('all', 'vocal', 'dance', 'visual')
 * @param {Object} spSettings - 필수 포함할 SP 레슨 확률 업 카드 설정 {vocal, dance, visual}
 * @returns {Array} 추천된 카드 ID 배열 (6개)
 */
export function getRecommendedCards(store, targetAttr = 'all', spSettings = { vocal: 0, dance: 0, visual: 0 }) {
    const planType = store.planType || 'sense';
    const currentCards = [...(store.planCards[planType] || [])];
    const cardMap = new Map(cardList.map(card => [card.id, card]));
    const maxStackCache = new Map();
    const evaluationCache = new Map();
    const validAttrs = new Set(['vocal', 'dance', 'visual']);
    const cap = (store.type === 'nia') ? 2600 : (store.type === 'hajime' ? 2800 : 9999);

    // 1. 카드 판별 유틸리티 (속성 및 SP 여부)
    const getCardData = (id) => cardMap.get(id);
    const getCardMaxStack = (id) => {
        if (!id) return 9;
        if (maxStackCache.has(id)) return maxStackCache.get(id);

        const cardData = getCardData(id);
        let maxStack = 9;
        if (cardData?.item_effects) {
            cardData.item_effects.forEach(eff => {
                if (eff.max && eff.max > maxStack) maxStack = eff.max;
                else if (eff.max && maxStack === 9) maxStack = eff.max;
            });
        }
        maxStackCache.set(id, maxStack);
        return maxStack;
    };
    const isSPCard = (id) => {
        const card = getCardData(id);
        return card && card.abilities && card.abilities.includes('sp_lessonup');
    };
    const getCardAttr = (id) => {
        const card = getCardData(id);
        if (!card || !card.type) return null;
        const type = card.type.toLowerCase();
        if (validAttrs.has(type)) return type;
        return null;
    };
    const buildCheckedMap = (cards) => {
        const checkedMap = {};
        cards.forEach(id => {
            if (id) checkedMap[id] = true;
        });
        return checkedMap;
    };
    const buildItemCounters = (cards) => {
        const itemCounters = {};
        cards.forEach(id => {
            if (id) itemCounters[id] = getCardMaxStack(id);
        });
        return itemCounters;
    };
    const buildRecommendationStore = (cards) => ({
        ...store,
        planCards: { ...store.planCards, [planType]: cards },
        cardChecked: buildCheckedMap(cards),
        cardExtraChecked: buildCheckedMap(cards),
        cardEventChecked: buildCheckedMap(cards),
        itemCounters: buildItemCounters(cards)
    });
    const getBaseScore = (result) => {
        const cappedVo = Math.min(result.finalTotal.vocal, cap);
        const cappedDa = Math.min(result.finalTotal.dance, cap);
        const cappedVi = Math.min(result.finalTotal.visual, cap);

        if (targetAttr === 'vocal') return cappedVo;
        if (targetAttr === 'dance') return cappedDa;
        if (targetAttr === 'visual') return cappedVi;
        return cappedVo + cappedDa + cappedVi;
    };
    const getOverflowAmount = (result) => {
        const overflowVo = Math.max(0, result.finalTotal.vocal - cap);
        const overflowDa = Math.max(0, result.finalTotal.dance - cap);
        const overflowVi = Math.max(0, result.finalTotal.visual - cap);
        return overflowVo + overflowDa + overflowVi;
    };
    const buildInvalidEvaluation = () => ({
        baseScore: -9999999,
        overflowAmount: Number.POSITIVE_INFINITY,
        penalty: Number.POSITIVE_INFINITY,
        finalScore: -9999999
    });
    const isBetterEvaluation = (nextEval, currentEval) => {
        if (!currentEval) return true;
        if (nextEval.finalScore !== currentEval.finalScore) return nextEval.finalScore > currentEval.finalScore;
        if (nextEval.overflowAmount !== currentEval.overflowAmount) return nextEval.overflowAmount < currentEval.overflowAmount;
        return nextEval.baseScore > currentEval.baseScore;
    };
    const normalizeCardsForRentalSlot = (cards) => {
        if (!cards || cards.length !== 6 || cards.some(id => !id)) {
            return { cards, evaluation: buildInvalidEvaluation() };
        }

        let bestCards = [...cards];
        let bestEvaluation = null;

        cards.forEach(rentalId => {
            const ordered = cards.filter(id => id !== rentalId);
            if (ordered.some(id => !poolASet.has(id))) return;
            ordered.push(rentalId);
            const evaluation = evaluate(ordered);
            if (isBetterEvaluation(evaluation, bestEvaluation)) {
                bestCards = ordered;
                bestEvaluation = evaluation;
            }
        });

        if (!bestEvaluation) {
            return { cards, evaluation: buildInvalidEvaluation() };
        }

        return { cards: bestCards, evaluation: bestEvaluation };
    };
    const fillSeedToSix = (seed) => {
        const nextSeed = [...seed];
        while (nextSeed.length < 5) {
            const cand = poolA.find(card => !nextSeed.includes(card.id));
            if (!cand) break;
            nextSeed.push(cand.id);
        }
        if (nextSeed.length === 5) {
            const rentalCand = poolB.find(card => !nextSeed.includes(card.id));
            if (rentalCand) nextSeed.push(rentalCand.id);
        }
        return nextSeed.slice(0, 6);
    };
    const seedKey = (cards) => cards.join('|');

    // 어시스트 제외 및 플랜 필터링
    const baseFilter = (c) => !state.disabledCards[c.id] && (c.plan === 'free' || c.plan === planType) && c.type !== 'assist';
    const poolA = cardList.filter(baseFilter);
    const poolB = cardList.filter(c => (c.plan === 'free' || c.plan === planType) && c.type !== 'assist');
    const poolASet = new Set(poolA.map(card => card.id));

    // 평가 함수 (7:3 강화 배분 기대값 반영)
    const evaluate = (cards) => {
        if (!cards || cards.length < 6 || cards.some(id => !id)) return buildInvalidEvaluation();
        const cacheKey = seedKey(cards);
        if (evaluationCache.has(cacheKey)) return evaluationCache.get(cacheKey);

        const spCounts = { vocal: 0, dance: 0, visual: 0 };
        cards.forEach(id => {
            if (isSPCard(id)) {
                const attr = getCardAttr(id);
                if (attr && spCounts.hasOwnProperty(attr)) spCounts[attr]++;
            }
        });

        let penalty = 0;
        ['vocal', 'dance', 'visual'].forEach(attr => {
            const target = spSettings[attr] || 0;
            if (spCounts[attr] < target) {
                penalty += (target - spCounts[attr]) * 100000;
            }
        });

        const tempStore = buildRecommendationStore(cards);

        const counts = getTriggerCounts(tempStore);
        const totalE = counts.total.enhance || 0;

        // 7:3 비율 기대값 설정 (정수 보정)
        const em = Math.round(totalE * 0.7);
        const ea = totalE - em;
        tempStore.manualEnhance = { m: em, a: ea };
        const finalCounts = getTriggerCounts(tempStore);

        const result = calculateTotals(tempStore, finalCounts);

        const baseScore = getBaseScore(result);
        const overflowAmount = getOverflowAmount(result);
        const finalScore = baseScore - penalty;

        const evaluation = {
            baseScore,
            overflowAmount,
            penalty,
            finalScore
        };
        evaluationCache.set(cacheKey, evaluation);
        return evaluation;
    };

    // 최적화 루프
    const optimize = (initialCards) => {
        let { cards, evaluation } = normalizeCardsForRentalSlot([...initialCards]);

        let improved = true;
        let iter = 0;
        while (improved && iter < 10) {
            improved = false; iter++;
            for (let i = 0; i < 6; i++) {
                const pool = (i === 5) ? poolB : poolA;
                for (const cand of pool) {
                    if (cards.includes(cand.id) || cand.id === cards[i]) continue;
                    const next = [...cards]; next[i] = cand.id;
                    const normalized = normalizeCardsForRentalSlot(next);
                    if (isBetterEvaluation(normalized.evaluation, evaluation)) {
                        evaluation = normalized.evaluation;
                        cards = normalized.cards;
                        improved = true;
                    }
                }
            }
        }
        return { cards, score: evaluation.finalScore, evaluation };
    };

    let bestResult = { score: -Infinity, cards: [] };
    const seeds = [];
    const seenSeeds = new Set();
    const addSeed = (seed) => {
        if (!seed || seed.length !== 6 || seed.some(id => !id)) return;
        const key = seedKey(seed);
        if (seenSeeds.has(key)) return;
        seenSeeds.add(key);
        seeds.push(seed);
    };

    // 시드 1: 현재 덱 기반 최적화
    addSeed(fillSeedToSix(currentCards.filter(Boolean)));

    // 시드 2: SP 요구사항을 충실히 반영한 초기 덱 구성
    const spPools = {
        vocal: poolA.filter(c => getCardAttr(c.id) === 'vocal' && isSPCard(c.id)),
        dance: poolA.filter(c => getCardAttr(c.id) === 'dance' && isSPCard(c.id)),
        visual: poolA.filter(c => getCardAttr(c.id) === 'visual' && isSPCard(c.id))
    };

    const seed2 = [];
    ['vocal', 'dance', 'visual'].forEach(attr => {
        const target = spSettings[attr] || 0;
        for (let i = 0; i < target; i++) {
            if (spPools[attr][i]) seed2.push(spPools[attr][i].id);
        }
    });
    addSeed(fillSeedToSix(seed2));

    // 시드 3+: 상위 카드들을 섞어 시작점을 다양화
    const seedPoolAIds = poolA.slice(0, Math.min(poolA.length, 12)).map(card => card.id);
    const seedPoolBIds = poolB.slice(0, Math.min(poolB.length, 6)).map(card => card.id);
    const seedAttrIds = {
        vocal: poolA.filter(card => getCardAttr(card.id) === 'vocal').slice(0, 4).map(card => card.id),
        dance: poolA.filter(card => getCardAttr(card.id) === 'dance').slice(0, 4).map(card => card.id),
        visual: poolA.filter(card => getCardAttr(card.id) === 'visual').slice(0, 4).map(card => card.id)
    };

    addSeed(fillSeedToSix(seedPoolAIds.slice(0, 5)));
    addSeed(fillSeedToSix([
        ...seedAttrIds.vocal.slice(0, 2),
        ...seedAttrIds.dance.slice(0, 2),
        ...seedAttrIds.visual.slice(0, 2)
    ]));
    addSeed(fillSeedToSix([
        ...seedAttrIds.vocal.slice(0, 3),
        ...seedAttrIds.dance.slice(0, 1),
        ...seedAttrIds.visual.slice(0, 1)
    ]));
    addSeed(fillSeedToSix([
        ...seedAttrIds.vocal.slice(0, 1),
        ...seedAttrIds.dance.slice(0, 3),
        ...seedAttrIds.visual.slice(0, 1)
    ]));
    addSeed(fillSeedToSix([
        ...seedAttrIds.vocal.slice(0, 1),
        ...seedAttrIds.dance.slice(0, 1),
        ...seedAttrIds.visual.slice(0, 3)
    ]));

    seedPoolBIds.forEach(rentalId => {
        const baseSeed = fillSeedToSix(seedPoolAIds.slice(0, 5));
        if (baseSeed.length === 6) {
            baseSeed[5] = rentalId;
            addSeed(baseSeed);
        }
    });

    seeds.forEach(seed => {
        const result = optimize(seed);
        if (isBetterEvaluation(result.evaluation, bestResult.evaluation)) bestResult = result;
    });

    if (!bestResult.cards || bestResult.cards.length !== 6 || bestResult.cards.some(id => !id)) {
        const fallbackCards = fillSeedToSix(currentCards.filter(Boolean));
        if (fallbackCards.length === 6 && !fallbackCards.some(id => !id)) {
            const normalizedFallback = normalizeCardsForRentalSlot(fallbackCards);
            bestResult = {
                cards: normalizedFallback.cards,
                score: normalizedFallback.evaluation.finalScore,
                evaluation: normalizedFallback.evaluation
            };
        }
    }

    // 최종 추천된 카드들에 대해 7:3 강화 배분 기대값 계산
    const finalCards = bestResult.cards;
    const tempStore = buildRecommendationStore(finalCards);
    const finalCounts = getTriggerCounts(tempStore);
    const totalE = finalCounts.total.enhance || 0;
    const finalEm = Math.round(totalE * 0.7);
    const finalEa = totalE - finalEm;

    return {
        ...bestResult,
        bestEnhance: { m: finalEm, a: finalEa }
    };
}

/**
 * 추천 기능 초기화 (이벤트 바인딩 및 유효성 검사 포함)
 */
export function initRecommendationFeature(store, calcPlans, refreshAll, syncSupportPanelUI, showToast, state, showRecommendModal, ensureSupportPanelOpen = null) {
    const recommendBtn = document.getElementById('btn-recommend-cards');
    if (!recommendBtn) return;

    recommendBtn.onclick = () => {
        const planData = calcPlans[store.type];
        const weekNums = Object.keys(planData.weeks);
        const isAllSelected = weekNums.every(w => store.weeks[w] && store.weeks[w].value);

        if (!isAllSelected) {
            showToast(state.currentLang === 'ja' ? 'すべての週のスケジュールを選択してから実行してください。' : '모든 주차의 행동을 선택한 후 실행해 주세요.');
            return;
        }

        showRecommendModal((settings) => {
            const result = getRecommendedCards(store, 'all', settings);
            if (applyRecommendedCards(store, result.cards, result.bestEnhance)) {
                store.save();
                refreshAll();
                if (typeof ensureSupportPanelOpen === 'function') ensureSupportPanelOpen();
                syncSupportPanelUI();
                showToast(state.currentLang === 'ja' ? 'おすすめの組み合わせが適用されました。' : '추천 조합이 적용되었습니다.');
            }
        });
    };
}

/**
 * 추천된 결과를 실제 스토어 상태에 적용 (초기화 포함)
 */
export function applyRecommendedCards(store, recommended, bestEnhance = null) {
    if (!recommended || recommended.length !== 6) return false;

    const planType = store.planType;
    store.planCards[planType] = [...recommended];

    // 강화 설정 최적화 반영
    if (bestEnhance) {
        store.manualEnhance = { ...bestEnhance };
    }

    // 상태 초기화
    store.cardChecked = {};
    store.cardExtraChecked = {};
    store.cardEventChecked = {};
    store.itemCounters = {};

    // 추천된 카드 적용
    recommended.forEach(id => {
        if (id) {
            store.cardChecked[id] = true;
            store.cardExtraChecked[id] = true;
            store.cardEventChecked[id] = true;
            store.itemCounters[id] = getMaxStack(id);
        }
    });

    return true;
}

/**
 * 카드 데이터에서 아이템 최대 스택 수치를 찾아 반환 (기본값 9)
 */
export function getMaxStack(cardId) {
    const cardData = cardList.find(c => c.id === cardId);
    let maxStack = 9;
    if (cardData && cardData.item_effects) {
        cardData.item_effects.forEach(eff => {
            if (eff.max && eff.max > maxStack) maxStack = eff.max;
            else if (eff.max && maxStack === 9) maxStack = eff.max;
        });
    }
    return maxStack;
}
