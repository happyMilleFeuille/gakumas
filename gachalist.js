// gachalist.js
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';

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

// 페스 10연차 마지막 자리 (SSR 1.5배 적용)
const FES_GUARANTEED_RATES = {
    PSSR: 0.03,
    SSSR: 0.045, // SSR 합계 7.5%
    PSR: 0.38 * (0.925 / 0.95), // 나머지 92.5%를 SR 비율로 재분배
    SSR_CARD: 0.57 * (0.925 / 0.95)
};

// 부족한 등급용 더미 데이터 (서포트 SR/R 등)
const dummyData = {
    SR_CARD: [{ id: "ssrcard_dummy", name: "더미 서포트 SR", rarity: "SR", type: "dance" }],
    R_CARD: [{ id: "rcard_dummy", name: "더미 서포트 R", rarity: "R", type: "visual" }]
};

export function getGachaPool(poolType = 'normal') {
    // 풀 타입에 따른 포함 가능한 소스 목록 정의
    const validSources = ['normal']; // 통상은 기본 포함
    if (poolType === 'limited') validSources.push('limited');
    if (poolType === 'unit') validSources.push('limited_u');
    if (poolType === 'fes') validSources.push('limited_f');

    // 카드 포함 여부 체크 로직
    const isInPool = (card) => {
        const source = card.source || 'normal';
        return validSources.includes(source) && card.gacha !== false;
    };

    // 1. 서포트 카드 풀 (모든 등급에 제외 규칙 적용)
    const sssrPool = cardList.filter(card => card.rarity === 'SSR' && isInPool(card));
    const srCardPool = cardList.filter(card => card.rarity === 'SR' && isInPool(card));
    const rCardPool = cardList.filter(card => card.rarity === 'R' && isInPool(card));

    // 2. 프로듀스 아이돌 풀 (모든 등급에 제외 규칙 적용)
    const pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isInPool(p));
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
    const currentRates = isFes ? FES_RATES : RATES;
    const currentGuaranteed = isFes ? FES_GUARANTEED_RATES : GUARANTEED_RATES;

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
                    // 통상 카드가 없으면(혹시 모를 예외) 그냥 페스 풀에서 뽑음
                    targetPool = fesCards;
                }
            }
        }

        const pickedCard = targetPool[Math.floor(Math.random() * targetPool.length)];
        
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
