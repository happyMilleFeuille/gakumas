// gachalist.js
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';

// --- 확률 테이블 정의 ---
const RATES = { PSSR: 0.02, SSSR: 0.03, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312, R_CARD: 0.468 };
const GUARANTEED_RATES = { PSSR: 0.02, SSSR: 0.03, PSR: 0.38, SSR_CARD: 0.57 };

const FES_RATES = { PSSR: 0.03, SSSR: 0.045, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312 * (0.755 / 0.78), R_CARD: 0.468 * (0.755 / 0.78) };
const FES_GUARANTEED_RATES = { PSSR: 0.03, SSSR: 0.045, PSR: 0.37, SSR_CARD: 0.555 };

const UNIT_RATES = { PSSR: 0.0225, SSSR: 0.0275, PSR: 0.068, SSR_CARD: 0.102, PR: 0.312, R_CARD: 0.468 };
const UNIT_GUARANTEED_RATES = { PSSR: 0.0225, SSSR: 0.0275, PSR: 0.38 * (0.9475 / 0.95), SSR_CARD: 0.57 * (0.9475 / 0.95) };

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

// 일반적인 픽업 처리 로직 (PSSR, SSSR, SR_CARD)
function handleStandardPickup(key, pool, poolType, isGuaranteedSlot, rates, guaranteed) {
    const pickups = CURRENT_PICKUPS[poolType];
    if (!pickups) return getRandomFrom(pool[key] || pool.R_CARD);

    let targetPool = pool[key] || pool.R_CARD;
    const rand = Math.random();

    if (key === 'PSSR' && pickups.pssr?.length > 0) {
        if (rand < (0.0075 / rates.PSSR)) {
            const p = pool.PSSR.filter(c => pickups.pssr.some(item => item.id === c.id));
            if (p.length > 0) targetPool = p;
        } else {
            const o = pool.PSSR.filter(c => !pickups.pssr.some(item => item.id === c.id));
            if (o.length > 0) targetPool = o;
        }
    } else if (key === 'SSSR' && pickups.sssr?.length > 0) {
        if (rand < (0.01 / rates.SSSR)) {
            const p = pool.SSSR.filter(c => pickups.sssr.includes(c.id));
            if (p.length > 0) targetPool = p;
        } else {
            const o = pool.SSSR.filter(c => !pickups.sssr.includes(c.id));
            if (o.length > 0) targetPool = o;
        }
    } else if (key === 'SR_CARD' && pickups.sr_card?.length > 0) {
        const pickupProb = isGuaranteedSlot ? (0.223529 / guaranteed.SR_CARD) : (0.04 / rates.SSR_CARD);
        if (rand < pickupProb) {
            const p = pool.SR_CARD.filter(c => pickups.sr_card.includes(c.id));
            if (p.length > 0) targetPool = p;
        } else {
            const o = pool.SR_CARD.filter(c => !pickups.sr_card.includes(c.id));
            if (o.length > 0) targetPool = o;
        }
    }

    return getRandomFrom(targetPool);
}

// --- 가챠 타입별 전략 정의 ---

export const GACHA_STRATEGIES = {
    normal: {
        rates: RATES,
        guaranteed: GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => handleStandardPickup(key, pool, 'normal', isGuaranteedSlot, RATES, GUARANTEED_RATES)
    },
    limited: {
        rates: RATES,
        guaranteed: GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => handleStandardPickup(key, pool, 'limited', isGuaranteedSlot, RATES, GUARANTEED_RATES)
    },
    platinum: {
        rates: RATES,
        guaranteed: GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => handleStandardPickup(key, pool, 'platinum', isGuaranteedSlot, RATES, GUARANTEED_RATES)
    },
    fes: {
        rates: FES_RATES,
        guaranteed: FES_GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => {
            const pickups = CURRENT_PICKUPS.fes;
            const rand = Math.random();
            if (key === 'PSSR') {
                const pickupIds = pickups?.pssr?.map(p => typeof p === 'string' ? p : p.id) || [];
                const randPSSR = Math.random() * 3.0;
                if (randPSSR < 0.75) return getRandomFrom(pool.PSSR.filter(c => pickupIds.includes(c.id))) || getRandomFrom(pool.PSSR);
                if (randPSSR < 2.25) return getRandomFrom(pool.PSSR.filter(c => c.source === 'limited_f' && !pickupIds.includes(c.id))) || getRandomFrom(pool.PSSR);
                return getRandomFrom(pool.PSSR.filter(c => c.source !== 'limited_f')) || getRandomFrom(pool.PSSR);
            }
            if (key === 'SSSR') {
                const pickupIds = pickups?.sssr || [];
                const randSSSR = Math.random() * 4.5;
                if (randSSSR < 1.0) return getRandomFrom(pool.SSSR.filter(c => pickupIds.includes(c.id))) || getRandomFrom(pool.SSSR);
                if (randSSSR < 2.0) return getRandomFrom(pool.SSSR.filter(c => c.source === 'limited_f' && !pickupIds.includes(c.id))) || getRandomFrom(pool.SSSR);
                return getRandomFrom(pool.SSSR.filter(c => c.source !== 'limited_f')) || getRandomFrom(pool.SSSR);
            }
            return getRandomFrom(pool[key] || pool.R_CARD);
        }
    },
    unit: {
        rates: UNIT_RATES,
        guaranteed: UNIT_GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => {
            const pickups = CURRENT_PICKUPS.unit;
            const rand = Math.random();
            if (key === 'PSSR') {
                const isPickup = rand < (1.5 / 2.25);
                const p = isPickup ? pool.PSSR.filter(c => pickups.pssr.some(item => item.id === c.id)) : pool.PSSR.filter(c => !pickups.pssr.some(item => item.id === c.id));
                return getRandomFrom(p.length > 0 ? p : pool.PSSR);
            }
            if (key === 'SSSR') {
                const isPickup = rand < (1.0 / 3.0);
                const p = isPickup ? pool.SSSR.filter(c => pickups.sssr.includes(c.id)) : pool.SSSR.filter(c => !pickups.sssr.includes(c.id));
                return getRandomFrom(p.length > 0 ? p : pool.SSSR);
            }
            if (key === 'SR_CARD') {
                const pickupProb = isGuaranteedSlot ? (0.2236 / UNIT_GUARANTEED_RATES.SR_CARD) : (0.04 / UNIT_RATES.SSR_CARD);
                const p = rand < pickupProb ? pool.SR_CARD.filter(c => pickups.sr_card.includes(c.id)) : pool.SR_CARD.filter(c => !pickups.sr_card.includes(c.id));
                return getRandomFrom(p.length > 0 ? p : pool.SR_CARD);
            }
            return getRandomFrom(pool[key] || pool.R_CARD);
        }
    },
    selection: {
        rates: RATES,
        guaranteed: SELECTION_GUARANTEED_RATES,
        pick: (key, pool, isGuaranteedSlot) => handleStandardPickup(key, pool, 'selection', isGuaranteedSlot, RATES, SELECTION_GUARANTEED_RATES)
    },
    test: { 
        rates: TEST_RATES,        guaranteed: TEST_RATES,
        pick: (key, pool) => {
            const testCfg = CURRENT_PICKUPS.test;
            const allCandidates = [
                ...(testCfg.pssr || []).map(p => ({ id: p.id, isPickup: true })),
                ...(testCfg.others || []).map(id => ({ id, isPickup: false }))
            ];
            if (key === 'PSSR' && allCandidates.length > 0) {
                const chosen = allCandidates[Math.floor(Math.random() * allCandidates.length)];
                return produceList.find(c => c.id === chosen.id) || getRandomFrom(pool.PSSR);
            }
            return getRandomFrom(pool[key] || pool.R_CARD);
        }
    }
};

// --- 기존 함수 유지 및 내부 로직 교체 ---

export function getGachaPool(poolType = 'normal') {
    const config = CURRENT_PICKUPS[poolType] || CURRENT_PICKUPS.normal;
    const targetDate = config.date || "2026-03-01";
    
    // 픽업 아이디 세트 (날짜 무시 대상)
    const pickupIds = new Set([
        ...(config.pssr || []).map(p => typeof p === 'string' ? p : p.id),
        ...(config.sssr || []),
        ...(config.sr_card || [])
    ]);

    const isReleased = (item) => {
        if (pickupIds.has(item.id)) return true; // 픽업은 무조건 포함
        if (!item.releasedAt) return true; // 날짜 없으면 포함 (R등급 등)
        return item.releasedAt <= targetDate; // 기준 날짜 이전 출시만 포함
    };

    if (poolType === 'test') {
        const testCfg = CURRENT_PICKUPS.test || {};
        const testPssrIds = [...(testCfg.pssr || []).map(p => typeof p === 'string' ? p : p.id), ...(testCfg.others || [])].flat(Infinity).filter(id => id); 
        const pssrPool = produceList.filter(p => p.rarity === 'PSSR' && testPssrIds.includes(p.id));
        const sssrPool = cardList.filter(card => card.rarity === 'SSR' && (testCfg.sssr || []).includes(card.id));
        const srCardPool = cardList.filter(card => card.rarity === 'SR' && (testCfg.sr_card || []).includes(card.id));
        return {
            PSSR: pssrPool.length > 0 ? pssrPool : produceList.filter(p => p.rarity === 'PSSR'),
            SSSR: sssrPool.length > 0 ? sssrPool : cardList.filter(c => c.rarity === 'SSR'),
            PSR: [], SR_CARD: srCardPool.length > 0 ? srCardPool : dummyData.SR_CARD,
            PR: [], R_CARD: dummyData.R_CARD
        };
    }

    const validSources = ['normal'];
    if (poolType === 'limited') validSources.push('limited');
    if (poolType === 'unit') validSources.push('limited_u');
    if (poolType === 'fes') validSources.push('limited_f');

    const isInPool = (card, forceLimitedU = false) => {
        const source = card.source || 'normal';
        const isSourceMatch = forceLimitedU ? (source === 'limited_u') : validSources.includes(source);
        if (!isSourceMatch) return false;
        if (card.gacha === false) return false;
        
        return isReleased(card); // 날짜 필터링 적용
    };

    // PSSR 풀 결정 로직 (셀렉션 타입 특수 처리)
    let pssrPool;
    if (poolType === 'selection' && config.pool_pssr) {
        pssrPool = produceList.filter(p => p.rarity === 'PSSR' && config.pool_pssr.includes(p.id));
    } else {
        pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isInPool(p, poolType === 'unit'));
    }

    return { 
        PSSR: pssrPool,
        SSSR: cardList.filter(card => card.rarity === 'SSR' && isInPool(card)),
        PSR: produceList.filter(p => p.rarity === 'PSR' && isInPool(p)),
        SR_CARD: cardList.filter(card => card.rarity === 'SR' && isInPool(card)).filter(isReleased).length > 0 
                 ? cardList.filter(card => card.rarity === 'SR' && isInPool(card)).filter(isReleased) 
                 : dummyData.SR_CARD,
        PR: produceList.filter(p => p.rarity === 'PR' && isInPool(p)).filter(isReleased),
        R_CARD: cardList.filter(card => card.rarity === 'R' && isInPool(card)).filter(isReleased).length > 0 
                 ? cardList.filter(card => card.rarity === 'R' && isInPool(card)).filter(isReleased) 
                 : dummyData.R_CARD
    };
}

export function pickGacha(count = 1, poolType = 'normal') {
    const pool = getGachaPool(poolType);
    const strategy = GACHA_STRATEGIES[poolType] || GACHA_STRATEGIES.normal;
    const results = [];
    
    for (let i = 0; i < count; i++) {
        const isGuaranteedSlot = (count === 10 && i === 9);
        const rates = isGuaranteedSlot ? strategy.guaranteed : strategy.rates;
        const key = rollRarity(rates);
        
        const pickedCard = strategy.pick(key, pool, isGuaranteedSlot);
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
