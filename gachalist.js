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

// 10연차 마지막 자리(SR 확정) 확률
const GUARANTEED_RATES = {
    PSSR: 0.02,
    SSSR: 0.03, // SSR 합계 5%
    PSR: 0.38,  // SR 중 PSR 38%
    SSR_CARD: 0.57 // SR 중 나머지 57% (합계 95%)
};

// 부족한 등급용 더미 데이터 (서포트 SR/R 등)
const dummyData = {
    SR_CARD: [{ id: "ssrcard_dummy", name: "더미 서포트 SR", rarity: "SR", type: "dance" }],
    R_CARD: [{ id: "rcard_dummy", name: "더미 서포트 R", rarity: "R", type: "visual" }]
};

export function getGachaPool() {
    // 통상 가챠 포함 여부 공통 체크 로직
    const isNormal = (card) => {
        const source = card.source || 'normal';
        return !['dist', 'limited', 'limited_f', 'limited_u'].includes(source) && card.gacha !== false;
    };

    // 1. 서포트 카드 풀 (모든 등급에 제외 규칙 적용)
    const sssrPool = cardList.filter(card => card.rarity === 'SSR' && isNormal(card));
    const srCardPool = cardList.filter(card => card.rarity === 'SR' && isNormal(card));
    const rCardPool = cardList.filter(card => card.rarity === 'R' && isNormal(card));

    // 2. 프로듀스 아이돌 풀 (모든 등급에 제외 규칙 적용)
    const pssrPool = produceList.filter(p => p.rarity === 'PSSR' && isNormal(p));
    const psrPool = produceList.filter(p => p.rarity === 'PSR' && isNormal(p));
    const prPool = produceList.filter(p => p.rarity === 'PR' && isNormal(p));

    return { 
        PSSR: pssrPool,
        SSSR: sssrPool,
        PSR: psrPool,
        SR_CARD: srCardPool.length > 0 ? srCardPool : dummyData.SR_CARD,
        PR: prPool,
        R_CARD: rCardPool.length > 0 ? rCardPool : dummyData.R_CARD
    };
}

export function pickGacha(count = 1) {
    const pool = getGachaPool();
    const results = [];

    for (let i = 0; i < count; i++) {
        const isGuaranteedSlot = (count === 10 && i === 9); // 10연차의 마지막 자리
        const rand = Math.random();
        let key = 'R_CARD';

        if (isGuaranteedSlot) {
            // SR 이상 확정 로직
            let acc = 0;
            if (rand < (acc += GUARANTEED_RATES.PSSR)) key = 'PSSR';
            else if (rand < (acc += GUARANTEED_RATES.SSSR)) key = 'SSSR';
            else if (rand < (acc += GUARANTEED_RATES.PSR)) key = 'PSR';
            else key = 'SR_CARD';
        } else {
            // 일반 확률 로직
            let acc = 0;
            if (rand < (acc += RATES.PSSR)) key = 'PSSR';
            else if (rand < (acc += RATES.SSSR)) key = 'SSSR';
            else if (rand < (acc += RATES.PSR)) key = 'PSR';
            else if (rand < (acc += RATES.SSR_CARD)) key = 'SR_CARD';
            else if (rand < (acc += RATES.PR)) key = 'PR';
            else key = 'R_CARD';
        }

        const currentPool = pool[key];
        const targetPool = currentPool.length > 0 ? currentPool : pool.R_CARD;
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
