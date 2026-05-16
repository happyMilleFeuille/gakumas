// gachalist.js
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { state } from './state.js';

// --- 확률 테이블 정의 ---
const RATES = { PSSR: 0.02, SSSR: 0.03, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312, R_CARD: 0.468 };
const GUARANTEED_RATES = { PSSR: 0.02, SSSR: 0.03, PSR: 0.38, SSR_CARD: 0.57 };

const FES_RATES = { PSSR: 0.03, SSSR: 0.045, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312 * (0.755 / 0.78), R_CARD: 0.468 * (0.755 / 0.78) };
const FES_GUARANTEED_RATES = { PSSR: 0.03, SSSR: 0.045, PSR: 0.37, SSR_CARD: 0.555 };

const UNIT_RATES = { PSSR: 0.0225, SSSR: 0.0275, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312, R_CARD: 0.468 };
const UNIT_GUARANTEED_RATES = { PSSR: 0.0225, SSSR: 0.0275, PSR: 0.38, SSR_CARD: 0.57 };

const SELECTION_GUARANTEED_RATES = { PSSR: 0.4, SSSR: 0.6, PSR: 0, SSR_CARD: 0 };

const TEST_RATES = { PSSR: 1.0, SSSR: 0, PSR: 0, SSR_CARD: 0, PR: 0, R_CARD: 0 };

const dummyData = {
    SR_CARD: [{ id: "ssrcard_dummy", name: "더미 서포트 SR", rarity: "SR", type: "dance" }],
    R_CARD: [{ id: "rcard_dummy", name: "더미 서포트 R", rarity: "R", type: "visual" }]
};

// --- 공통 유틸리티 함수 ---

function rollRarity(rates, rand = Math.random()) {
    let acc = 0;
    if (rand < (acc += rates.PSSR)) return 'PSSR';
    if (rand < (acc += rates.SSSR)) return 'SSSR';
    if (rand < (acc += rates.PSR)) return 'PSR';
    if (rand < (acc += rates.SSR_CARD)) return 'SR_CARD';
    if (rand < (acc += rates.PR)) return 'PR';
    return 'R_CARD';
}

function getRandomFrom(pool) {
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function normalizePickupIds(list) {
    return list.map(item => typeof item === 'string' ? item : item.id).filter(Boolean);
}

function getPoolSource(card) {
    return card.source || 'normal';
}

function getPickupBuckets(key, pool, poolType, pickups, rates) {
    const targetPool = pool[key] || pool.R_CARD || [];
    const pickupLists = {
        PSSR: pickups.pssr || pickups.pool?.pssr || [],
        SSSR: pickups.sssr || pickups.pool?.sssr || [],
        SR_CARD: pickups.sr_card || pickups.pool?.sr_card || []
    };
    const pickupList = pickupLists[key] || [];
    const pickupIds = normalizePickupIds(pickupList);
    const pickupCards = targetPool.filter(card => pickupIds.includes(card.id));
    const regularCards = targetPool.filter(card => !pickupIds.includes(card.id));

    if (key === 'PSSR' && poolType === 'fes') {
        const hasExplicitPickupRate = typeof pickups.pickupRate === 'number';
        const perPickupRate = pickups.pickupRate ?? 0.0075;
        const pickupTotal = Math.min(perPickupRate * pickupCards.length, rates.PSSR);

        if (!hasExplicitPickupRate) {
            const nonPickupFesCards = regularCards.filter(card => getPoolSource(card) === 'limited_f');
            const normalCards = regularCards.filter(card => getPoolSource(card) !== 'limited_f');
            const nonPickupFesTotal = Math.min(0.015, Math.max(0, rates.PSSR - pickupTotal));
            const normalTotal = Math.max(0, rates.PSSR - pickupTotal - nonPickupFesTotal);

            return {
                pickupIds,
                pickupCards,
                regularCards,
                buckets: [
                    { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                    { ids: nonPickupFesCards.map(card => card.id), cards: nonPickupFesCards, totalRate: nonPickupFesTotal },
                    { ids: normalCards.map(card => card.id), cards: normalCards, totalRate: normalTotal }
                ]
            };
        }

        return {
            pickupIds,
            pickupCards,
            regularCards,
            buckets: [
                { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                { ids: regularCards.map(card => card.id), cards: regularCards, totalRate: Math.max(0, rates.PSSR - pickupTotal) }
            ]
        };
    }

    if (key === 'PSSR') {
        const pickupTotal = Math.min(0.0075 * pickupCards.length, rates.PSSR);
        return {
            pickupIds,
            pickupCards,
            regularCards,
            buckets: [
                { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                { ids: regularCards.map(card => card.id), cards: regularCards, totalRate: Math.max(0, rates.PSSR - pickupTotal) }
            ]
        };
    }

    if (key === 'SSSR') {
        const pickupTotal = Math.min(0.01 * pickupCards.length, rates.SSSR);
        if (poolType === 'fes') {
            const hasExplicitPickupRate = typeof pickups.pickupRate === 'number';

            if (!hasExplicitPickupRate) {
                const nonPickupFesCards = regularCards.filter(card => getPoolSource(card) === 'limited_f');
                const normalCards = regularCards.filter(card => getPoolSource(card) !== 'limited_f');
                const nonPickupFesTotal = Math.min(0.01, Math.max(0, rates.SSSR - pickupTotal));
                const normalTotal = Math.max(0, rates.SSSR - pickupTotal - nonPickupFesTotal);

                return {
                    pickupIds,
                    pickupCards,
                    regularCards,
                    buckets: [
                        { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                        { ids: nonPickupFesCards.map(card => card.id), cards: nonPickupFesCards, totalRate: nonPickupFesTotal },
                        { ids: normalCards.map(card => card.id), cards: normalCards, totalRate: normalTotal }
                    ]
                };
            }

            return {
                pickupIds,
                pickupCards,
                regularCards,
                buckets: [
                    { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                    { ids: regularCards.map(card => card.id), cards: regularCards, totalRate: Math.max(0, rates.SSSR - pickupTotal) }
                ]
            };
        }

        return {
            pickupIds,
            pickupCards,
            regularCards,
            buckets: [
                { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                { ids: regularCards.map(card => card.id), cards: regularCards, totalRate: Math.max(0, rates.SSSR - pickupTotal) }
            ]
        };
    }

    if (key === 'SR_CARD') {
        const pickupTotal = Math.min(0.04 * pickupCards.length, rates.SSR_CARD);
        return {
            pickupIds,
            pickupCards,
            regularCards,
            buckets: [
                { ids: pickupIds, cards: pickupCards, totalRate: pickupTotal },
                { ids: regularCards.map(card => card.id), cards: regularCards, totalRate: Math.max(0, rates.SSR_CARD - pickupTotal) }
            ]
        };
    }

    return {
        pickupIds,
        pickupCards,
        regularCards,
        buckets: [{ ids: targetPool.map(card => card.id), cards: targetPool, totalRate: rates[key] || 0 }]
    };
}

export function getActiveGachaConfig(poolType = state.gachaType) {
    if (poolType === 'selection') return SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
    if (poolType === 'normal') return NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
    if (poolType === 'limited') return LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
    if (poolType === 'unit') return UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
    if (poolType === 'fes') return FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
    return CURRENT_PICKUPS[poolType] || {};
}

export function getDisplayStrategy(poolType = state.gachaType) {
    const strategy = { ...(GACHA_STRATEGIES[poolType] || GACHA_STRATEGIES.normal) };
    if (poolType === 'selection') {
        const activeConfig = getActiveGachaConfig(poolType);
        if (activeConfig?.ssr_guaranteed) {
            strategy.guaranteed = { PSSR: 0.4, SSSR: 0.6, PSR: 0, SSR_CARD: 0, PR: 0, R_CARD: 0 };
        }
    }
    return strategy;
}

export function getRarityRateEntries(rarityKey, options = {}) {
    const poolType = options.poolType || state.gachaType;
    const activeConfig = options.activeConfig || getActiveGachaConfig(poolType);
    const strategy = options.strategy || getDisplayStrategy(poolType);
    const pool = options.pool || getGachaPool(poolType);
    const rarityPool = pool[rarityKey] || [];
    const totalRate = options.totalRate ?? strategy.rates[rarityKey] ?? 0;
    const totalGuaranteed = options.totalGuaranteed ?? strategy.guaranteed[rarityKey] ?? 0;

    if (rarityPool.length === 0) return [];

    if (activeConfig?.only_pool_pssr && rarityKey === 'PSSR') {
        const nRate = totalRate / rarityPool.length;
        const gRate = totalGuaranteed / rarityPool.length;
        return rarityPool.map(card => ({ card, normalRate: nRate, guaranteedRate: gRate, isPickup: false }));
    }

    if (!['PSSR', 'SSSR', 'SR_CARD'].includes(rarityKey)) {
        const nRate = totalRate / rarityPool.length;
        const gRate = totalGuaranteed / rarityPool.length;
        return rarityPool.map(card => ({ card, normalRate: nRate, guaranteedRate: gRate, isPickup: false }));
    }

    const pickupInfo = getPickupBuckets(rarityKey, pool, poolType, activeConfig, strategy.rates);
    const guaranteedRatio = totalRate > 0 ? (totalGuaranteed / totalRate) : 0;
    const rateMap = new Map();

    pickupInfo.buckets.forEach(bucket => {
        const perCardRate = bucket.cards.length > 0 ? (bucket.totalRate / bucket.cards.length) : 0;
        bucket.cards.forEach(card => {
            rateMap.set(card.id, {
                normalRate: perCardRate,
                guaranteedRate: perCardRate * guaranteedRatio,
                isPickup: pickupInfo.pickupIds.includes(card.id)
            });
        });
    });

    return rarityPool.map(card => {
        const entry = rateMap.get(card.id) || { normalRate: 0, guaranteedRate: 0, isPickup: false };
        return { card, ...entry };
    });
}

// 일반적인 픽업 처리 로직 (PSSR, SSSR, SR_CARD)
function handleStandardPickup(key, pool, poolType, isGuaranteedSlot, rates, guaranteed, customPickups = null) {
    const pickups = customPickups || CURRENT_PICKUPS[poolType];
    if (!pickups) return getRandomFrom(pool[key] || pool.R_CARD);

    let targetPool = pool[key] || pool.R_CARD;
    const rand = Math.random();

    const pssrList = pickups.pssr || pickups.pool?.pssr || [];
    const sssrList = pickups.sssr || pickups.pool?.sssr || [];
    const srCardList = pickups.sr_card || pickups.pool?.sr_card || [];

    if (key === 'PSSR' && pssrList.length > 0) {
        const pickupInfo = getPickupBuckets(key, pool, poolType, pickups, rates);
        let threshold = 0;
        for (const bucket of pickupInfo.buckets) {
            threshold += bucket.totalRate / rates.PSSR;
            if (rand < threshold && bucket.cards.length > 0) {
                return getRandomFrom(bucket.cards);
            }
        }
        return getRandomFrom(targetPool);
    }
    if (key === 'SSSR' && sssrList.length > 0) {
        const pickupInfo = getPickupBuckets(key, pool, poolType, pickups, rates);
        let threshold = 0;
        for (const bucket of pickupInfo.buckets) {
            threshold += bucket.totalRate / rates.SSSR;
            if (rand < threshold && bucket.cards.length > 0) {
                return getRandomFrom(bucket.cards);
            }
        }
        return getRandomFrom(targetPool);
    }
    if (key === 'SR_CARD' && srCardList.length > 0) {
        const baseRate = isGuaranteedSlot ? (0.223529 / 0.57) : (0.04 / rates.SSR_CARD);
        if (rand < baseRate) return getRandomFrom(srCardList.map(id => cardList.find(c => c.id === id)).filter(Boolean));
        targetPool = targetPool.filter(card => !srCardList.includes(card.id));
    }

    return getRandomFrom(targetPool.length > 0 ? targetPool : (pool[key] || pool.R_CARD));
}

export const GACHA_STRATEGIES = {
    normal: { rates: RATES, guaranteed: GUARANTEED_RATES, pick: (key, pool) => handleStandardPickup(key, pool, 'normal') },
    limited: { rates: RATES, guaranteed: GUARANTEED_RATES, pick: (key, pool) => handleStandardPickup(key, pool, 'limited') },
    unit: { rates: UNIT_RATES, guaranteed: UNIT_GUARANTEED_RATES, pick: (key, pool) => handleStandardPickup(key, pool, 'unit') },
    fes: { rates: FES_RATES, guaranteed: FES_GUARANTEED_RATES, pick: (key, pool) => getRandomFrom(pool[key] || pool.R_CARD) },
    selection: { rates: RATES, guaranteed: GUARANTEED_RATES, pick: (key, pool, isGuaranteedSlot, rates, guaranteed, customPickups) => handleStandardPickup(key, pool, 'selection', isGuaranteedSlot, rates, guaranteed, customPickups) }
    };

function isReleased(card) {
    if (!card.releasedAt) return true;
    const releaseDate = new Date(card.releasedAt);
    const today = new Date();
    return releaseDate <= today;
}

export function getGachaPool(poolType) {
    let config = CURRENT_PICKUPS[poolType] || {};
    
    // [추가] 가챠 타입별 상위 설정 객체 가져오기 (exclude 필드 참조용)
    let activeConfig = config;
    if (poolType === 'normal') {
        activeConfig = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        config = activeConfig?.pool || config;
    } else if (poolType === 'limited') {
        activeConfig = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        config = activeConfig?.pool || config;
    } else if (poolType === 'unit') {
        activeConfig = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        config = activeConfig?.pool || config;
    } else if (poolType === 'fes') {
        activeConfig = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
        config = activeConfig?.pool || config;
    } else if (poolType === 'selection') {
        const selId = state.activeSelectionId || SELECTION_CONFIG[0].id;
        activeConfig = SELECTION_CONFIG.find(c => c.id === selId) || SELECTION_CONFIG[0];
        config = activeConfig?.pool || config;
    }

    const validSources = ['normal'];
    
    // [수정] 셀렉션 가챠일 때 config에 is_limited가 있으면 한정 풀 포함
    let isLimitedSelection = false;
    if (poolType === 'selection') {
        const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId);
        if (sel?.is_limited) isLimitedSelection = true;
    }

    if (poolType === 'limited' || isLimitedSelection) validSources.push('limited');
    if (poolType === 'unit') validSources.push('limited_u');
    if (poolType === 'fes') validSources.push('limited_f');

    const isInPool = (card, forceLimitedU = false) => {
        const source = card.source || 'normal';
        const isSourceMatch = forceLimitedU ? (source === 'limited_u') : validSources.includes(source);
        
        if (!isSourceMatch) return false;
        if (card.gacha === false) return false;
        
        // 날짜 필터링 (선택된 가챠 버전의 날짜 기준, 없으면 오늘 기준)
        let referenceDate = new Date();
        if (poolType === 'selection') {
            const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId);
            if (sel?.date) referenceDate = new Date(sel.date);
        } else if (poolType === 'normal') {
            const norm = NORMAL_CONFIG.find(c => c.id === state.activeNormalId);
            if (norm?.date) referenceDate = new Date(norm.date);
        } else if (poolType === 'limited') {
            const lim = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId);
            if (lim?.date) referenceDate = new Date(lim.date);
        } else if (poolType === 'unit') {
            const unt = UNIT_CONFIG.find(c => c.id === state.activeUnitId);
            if (unt?.date) referenceDate = new Date(unt.date);
        } else if (poolType === 'fes') {
            const fes = FES_CONFIG.find(c => c.id === state.activeFesId);
            if (fes?.date) referenceDate = new Date(fes.date);
        }

        if (!card.releasedAt) return true;
        const releaseDate = new Date(card.releasedAt);
        return releaseDate <= referenceDate;
    };

    // PSSR 풀 결정 로직 (셀렉션 타입 특수 처리)
    let pssrPool;
    if (poolType === 'selection') {
        const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId);
        
        // explicit 설정(only_pool_pssr)이 있거나, 수동 pool_pssr이 있는 경우 처리
        if (sel?.only_pool_pssr && sel.pool?.pssr) {
            pssrPool = produceList.filter(p => p.rarity === 'PSSR' && sel.pool.pssr.includes(p.id));
        } else if (config.pool_pssr) {
            pssrPool = produceList.filter(p => p.rarity === 'PSSR' && config.pool_pssr.includes(p.id));
        } else {
            pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isInPool(p));
        }
    } else {
        pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isInPool(p, poolType === 'unit'));
    }

    // [추가] 제외 목록(exclude) 처리
    const exclude = activeConfig?.exclude || {};
    const filterExclude = (list, type) => {
        const exList = exclude[type] || [];
        if (exList.length === 0) return list;
        // ID 공백 제거 및 대소문자 무시 비교 (안전용)
        const normalizedExList = exList.map(id => id.trim());
        return list.filter(item => !normalizedExList.includes(item.id));
    };

    const finalPool = { 
        PSSR: filterExclude(pssrPool, 'pssr'),
        SSSR: filterExclude(cardList.filter(card => card.rarity === 'SSR' && isInPool(card)), 'sssr'),
        PSR: filterExclude(produceList.filter(p => p.rarity === 'PSR' && isInPool(p)), 'psr'),
        SR_CARD: filterExclude(
                    cardList.filter(card => card.rarity === 'SR' && isInPool(card)).filter(isReleased).length > 0 
                    ? cardList.filter(card => card.rarity === 'SR' && isInPool(card)).filter(isReleased) 
                    : dummyData.SR_CARD, 
                    'sr_card'
                 ),
        PR: filterExclude(produceList.filter(p => p.rarity === 'PR' && isInPool(p)).filter(isReleased), 'pr'),
        R_CARD: filterExclude(
                    cardList.filter(card => card.rarity === 'R' && isInPool(card)).filter(isReleased).length > 0 
                    ? cardList.filter(card => card.rarity === 'R' && isInPool(card)).filter(isReleased) 
                    : dummyData.R_CARD,
                    'r_card'
                 )
    };

    return finalPool;
}

export function pickGacha(count = 1, poolType = 'normal', customPool = null) {
    const pool = getGachaPool(poolType);
    const strategy = GACHA_STRATEGIES[poolType] || GACHA_STRATEGIES.normal;
    const results = [];
    
    // 현재 선택된 배너의 상세 설정을 찾아서 픽업 정보로 사용 (동기화 핵심)
    let activeConfig = customPool || CURRENT_PICKUPS[poolType];
    if (poolType === 'selection') {
        activeConfig = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
    } else if (poolType === 'normal') {
        activeConfig = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
    } else if (poolType === 'limited') {
        activeConfig = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
    } else if (poolType === 'unit') {
        activeConfig = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
    } else if (poolType === 'fes') {
        activeConfig = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
    }

    for (let i = 0; i < count; i++) {
        const isGuaranteedSlot = (count === 10 && i === 9);
        const isLastSlot = (i === count - 1);
        let rates = isGuaranteedSlot ? strategy.guaranteed : strategy.rates;
        
        if (poolType === 'selection' && isLastSlot) {
            const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId);
            if (sel?.ssr_guaranteed) {
                rates = { PSSR: 0.4, SSSR: 0.6, PSR: 0, SSR_CARD: 0, PR: 0, R_CARD: 0 };
            }
        }

        const key = rollRarity(rates);
        
        let pickedCard;
        // PSSR, SSSR, SR_CARD 등급인 경우 현재 활성화된 배너의 픽업 가중치 적용
        if (['PSSR', 'SSSR', 'SR_CARD'].includes(key)) {
            pickedCard = handleStandardPickup(key, pool, poolType, isGuaranteedSlot, rates, strategy.guaranteed, activeConfig);
        } else {
            pickedCard = strategy.pick(key, pool, isGuaranteedSlot);
        }

        const result = { ...(pickedCard || dummyData.R_CARD[0]) };
        
        if (key === 'SSSR' || key === 'PSSR') result.displayRarity = 'SSR';
        else if (key === 'PSR' || key === 'SR_CARD') result.displayRarity = 'SR';
        else result.displayRarity = 'R';
        
        results.push(result);
    }
    return results;
}

export function getHighestRarity(results) {
    const rarityMap = { 'SSR': 3, 'SR': 2, 'R': 1 };
    let highest = 0, highestKey = 'R';
    results.forEach(res => {
        const score = rarityMap[res.displayRarity] || 0;
        if (score > highest) { highest = score; highestKey = res.displayRarity; }
    });
    return highestKey;
}
