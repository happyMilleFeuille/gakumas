// gachalist.js
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';

// 기본 가챠 확률
const RATES = {
    PSSR: 0.02,
    SSSR: 0.03, // SSR 합계 5%
    PSR: 0.068,
    SSR_CARD: 0.102, // SR 합계 17%
    PR: 0.312,
    R_CARD: 0.468    // R 합계 78%
};

// 페스 가챠 확률 (SSR 1.5배)
// PSSR: 3% (2.5% 페스 + 0.5% 통상), SSSR: 4.5%
// R 합계: 78% - 2.5% = 75.5%
const FES_RATES = {
    PSSR: 0.03,
    SSSR: 0.045, // SSR 합계 7.5%
    PSR: 0.068,
    SSR_CARD: 0.102, // SR 합계 17%
    PR: 0.312 * (0.755 / 0.78), // 비율에 맞춰 감소
    R_CARD: 0.468 * (0.755 / 0.78) // 비율에 맞춰 감소
};

// 10연차 마지막 자리(SR 확정) 확률
const GUARANTEED_RATES = {
    PSSR: 0.02,
    SSSR: 0.03, // SSR 합계 5%
    PSR: 0.38,  // SR 중 PSR 38%
    SSR_CARD: 0.57 // SR 중 나머지 57% (합계 95%)
};

// 유닛 가챠 확률 (PSSR 2.25%, SSSR 3%)
const UNIT_RATES = {
    PSSR: 0.0225,
    SSSR: 0.03, 
    PSR: 0.068,
    SSR_CARD: 0.102,
    PR: 0.312,
    R_CARD: 0.4655 // 합계 1.0을 위해 조정
};

const UNIT_GUARANTEED_RATES = {
    PSSR: 0.0225,
    SSSR: 0.03,
    PSR: 0.38 * (0.9475 / 0.95), // 나머지 94.75% 분배
    SSR_CARD: 0.57 * (0.9475 / 0.95)
};

// 테스트 가챠 확률 (SSR 100%: PSSR 50%, SSSR 50%)
const TEST_RATES = {
    PSSR: 0.5,
    SSSR: 0.5,
    PSR: 0,
    SSR_CARD: 0,
    PR: 0,
    R_CARD: 0
};

// 부족한 등급용 더미 데이터 (서포트 SR/R 등)
const dummyData = {
    SR_CARD: [{ id: "ssrcard_dummy", name: "더미 서포트 SR", rarity: "SR", type: "dance" }],
    R_CARD: [{ id: "rcard_dummy", name: "더미 서포트 R", rarity: "R", type: "visual" }]
};

export function getGachaPool(poolType = 'normal') {
    // 풀 타입에 따른 포함 가능한 소스 목록 정의
    const validSources = ['normal']; // 기본적으로 통상은 포함
    if (poolType === 'limited') validSources.push('limited');
    if (poolType === 'unit') validSources.push('limited_u');
    if (poolType === 'fes') validSources.push('limited_f');

    // 카드 포함 여부 체크 로직
    const isInPool = (card, forceLimitedU = false) => {
        const source = card.source || 'normal';
        // 유닛 가챠의 PSSR은 통상을 제외하고 limited_u만 포함
        if (forceLimitedU) return source === 'limited_u' && card.gacha !== false;
        return validSources.includes(source) && card.gacha !== false;
    };

    // 1. 서포트 카드 풀
    const sssrPool = cardList.filter(card => card.rarity === 'SSR' && isInPool(card));
    const srCardPool = cardList.filter(card => card.rarity === 'SR' && isInPool(card));
    const rCardPool = cardList.filter(card => card.rarity === 'R' && isInPool(card));

    // 2. 프로듀스 아이돌 풀
    // 유닛 가챠(poolType === 'unit')일 경우 PSSR 풀에서 통상('normal')을 제외
    const pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isInPool(p, poolType === 'unit'));
    const psrPool = produceList.filter(p => p.rarity === 'PSR' && isInPool(p));
    const prPool = produceList.filter(p => p.rarity === 'PR' && isInPool(p));

    return { 
        PSSR: pssrPool,
        SSSR: sssrPool,
        PSR: psrPool,
        SR_CARD: srCardPool.length > 0 ? srCardPool : dummyData.SR_CARD,
        PR: prPool,
        R_CARD: rCardPool.length > 0 ? rCardPool : dummyData.R_CARD
    };
}

export function pickGacha(count = 1, poolType = 'normal') {
    const pool = getGachaPool(poolType);
    const results = [];
    
    // 페스 여부에 따라 확률 테이블 선택
    const isFes = (poolType === 'fes');
    const isUnit = (poolType === 'unit');
    
    let currentRates = RATES;
    if (isFes) currentRates = FES_RATES;
    else if (isUnit) currentRates = UNIT_RATES;
    else if (poolType === 'test') currentRates = TEST_RATES;

    let currentGuaranteed = isFes ? FES_GUARANTEED_RATES : GUARANTEED_RATES;
    if (isUnit) currentGuaranteed = UNIT_GUARANTEED_RATES;

    for (let i = 0; i < count; i++) {
        const isGuaranteedSlot = (count === 10 && i === 9); // 10연차의 마지막 자리
        const rand = Math.random();
        let key = 'R_CARD';

        if (isGuaranteedSlot) {
            // SR 이상 확정 로직
            let acc = 0;
            if (rand < (acc += currentGuaranteed.PSSR)) key = 'PSSR';
            else if (rand < (acc += currentGuaranteed.SSSR)) key = 'SSSR';
            else if (rand < (acc += currentGuaranteed.PSR)) key = 'PSR';
            else key = 'SR_CARD';
        } else {
            // 일반 확률 로직
            let acc = 0;
            if (rand < (acc += currentRates.PSSR)) key = 'PSSR';
            else if (rand < (acc += currentRates.SSSR)) key = 'SSSR';
            else if (rand < (acc += currentRates.PSR)) key = 'PSR';
            else if (rand < (acc += currentRates.SSR_CARD)) key = 'SR_CARD';
            else if (rand < (acc += currentRates.PR)) key = 'PR';
            else key = 'R_CARD';
        }

        const currentPool = pool[key];
        let targetPool = currentPool.length > 0 ? currentPool : pool.R_CARD;
        
        // [중요] 페스 가챠에서 PSSR이 선택되었을 때, 픽업(2.5%)과 통상(0.5%) 분리 추첨
        if (isFes && key === 'PSSR' && pool.PSSR.length > 0) {
            // 페스 한정 카드와 통상 카드 분리
            const fesCards = pool.PSSR.filter(c => c.source === 'limited_f');
            const normalCards = pool.PSSR.filter(c => c.source !== 'limited_f');
            
            // 페스 카드가 존재할 경우에만 분리 추첨 진행
            if (fesCards.length > 0) {
                // PSSR 전체 3.0 중 2.5(약 83.3%)는 페스, 0.5(약 16.7%)는 통상
                const isPickup = Math.random() < (2.5 / 3.0);
                if (isPickup) {
                    targetPool = fesCards;
                } else if (normalCards.length > 0) {
                    targetPool = normalCards;
                } else {
                    targetPool = fesCards;
                }
            }
        }
        // [수정] 유닛 가챠 전용 픽업 로직
        else if (isUnit) {
            const pickups = CURRENT_PICKUPS.unit;
            if (key === 'PSSR' && pickups.pssr.length > 0) {
                // PSSR 당첨(2.25%) 상태에서 픽업 대상(1.5%)인지 판별
                const isPickup = Math.random() < (1.5 / 2.25);
                if (isPickup) {
                    const pickupCards = pool.PSSR.filter(c => pickups.pssr.some(p => p.id === c.id));
                    if (pickupCards.length > 0) targetPool = pickupCards;
                } else {
                    const otherCards = pool.PSSR.filter(c => !pickups.pssr.some(p => p.id === c.id));
                    if (otherCards.length > 0) targetPool = otherCards;
                }
            } else if (key === 'SSSR' && pickups.sssr.length > 0) {
                // SSSR 당첨(3.0%) 상태에서 픽업 대상(1.0%)인지 판별
                const isPickup = Math.random() < (1.0 / 3.0);
                if (isPickup) {
                    const pickupCards = pool.SSSR.filter(c => pickups.sssr.includes(c.id));
                    if (pickupCards.length > 0) targetPool = pickupCards;
                } else {
                    const otherCards = pool.SSSR.filter(c => !pickups.sssr.includes(c.id));
                    if (otherCards.length > 0) targetPool = otherCards;
                }
            } else if (key === 'SR_CARD' && pickups.sr_card.length > 0) {
                // SR 서포트 카드 당첨 시 픽업 확률 적용
                let pickupProb = 0;
                if (isGuaranteedSlot) {
                    pickupProb = 0.2236 / currentGuaranteed.SR_CARD;
                } else {
                    pickupProb = 0.04 / currentRates.SSR_CARD;
                }

                const isPickup = Math.random() < pickupProb;
                if (isPickup) {
                    const pickupCards = pool.SR_CARD.filter(c => pickups.sr_card.includes(c.id));
                    if (pickupCards.length > 0) targetPool = pickupCards;
                } else {
                    const otherCards = pool.SR_CARD.filter(c => !pickups.sr_card.includes(c.id));
                    if (otherCards.length > 0) targetPool = otherCards;
                }
            }
        }
        // [기본] 일반/한정/테스트 가챠 픽업 로직 (PSSR만 처리)
        else if ((poolType === 'normal' || poolType === 'limited' || poolType === 'test') && key === 'PSSR') {
            const pickups = CURRENT_PICKUPS[poolType];
            if (pickups && pickups.pssr && pickups.pssr.length > 0) {
                // PSSR 당첨(2.0%) 상태에서 픽업 대상(0.75%)인지 판별
                const isPickup = Math.random() < (0.75 / 2.0);
                if (isPickup) {
                    const pickupCards = pool.PSSR.filter(c => pickups.pssr.some(p => p.id === c.id));
                    if (pickupCards.length > 0) targetPool = pickupCards;
                } else {
                    const otherCards = pool.PSSR.filter(c => !pickups.pssr.some(p => p.id === c.id));
                    if (otherCards.length > 0) targetPool = otherCards;
                }
            }
        }

        const pickedCard = (poolType === 'test' && key === 'PSSR') 
            ? (() => {
                const testPickups = CURRENT_PICKUPS.test.pssr || [];
                const testOthers = CURRENT_PICKUPS.test.others || [];
                
                // 픽업 리스트와 일반 리스트를 합침
                const allTestCandidates = [
                    ...testPickups.map(p => ({ id: p.id, isPickup: true })),
                    ...testOthers.map(id => ({ id: id, isPickup: false }))
                ];

                if (allTestCandidates.length > 0) {
                    const chosen = allTestCandidates[Math.floor(Math.random() * allTestCandidates.length)];
                    // 테스트 모드이므로 풀 필터링을 무시하고 전체 데이터(produceList)에서 직접 찾음
                    const card = produceList.find(c => c.id === chosen.id);
                    if (card) return card;
                }
                return targetPool[Math.floor(Math.random() * targetPool.length)];
              })()
            : targetPool[Math.floor(Math.random() * targetPool.length)];
        
        const result = {...pickedCard};
        if (key === 'SSSR' || key === 'PSSR') result.displayRarity = 'SSR';
        else if (key === 'PSR' || key === 'SR_CARD') result.displayRarity = 'SR';
        else result.displayRarity = 'R';
        
        results.push(result);
    }

    return results;
}

// 최고 등급 확인 함수 추가
export function getHighestRarity(results) {
    const rarityMap = { 'SSR': 3, 'SR': 2, 'R': 1 };
    let highest = 0;
    let highestKey = 'R';

    results.forEach(res => {
        const score = rarityMap[res.displayRarity] || 0;
        if (score > highest) {
            highest = score;
            highestKey = res.displayRarity;
        }
    });
    return highestKey;
}
