// state.js
const safeParse = (key, def) => {
    try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
};

// 초기화 및 마이그레이션 로직
let storedPulls = safeParse('totalPullsObj', null);
if (!storedPulls) {
    const oldVal = parseInt(localStorage.getItem('totalPulls')) || 0;
    storedPulls = { normal: oldVal, limited: 0, unit: 0, fes: 0 };
}

let storedLog = safeParse('gachaLogObj', null);
if (!storedLog) {
    const oldVal = safeParse('gachaLog', []);
    storedLog = { normal: oldVal, limited: [], unit: [], fes: [] };
}

export const state = {
    currentLang: localStorage.getItem('lang') || 'ko',
    currentBg: localStorage.getItem('selectedBg') || '',
    filters: {
        plan: 'all',
        attr: 'all',
        source: 'all',
        rarity: 'all'
    },
    sortBy: 'id-desc', // 기본값: 최신순
    extraFiltersOpen: false, // 상세 필터 열림 여부
    gachaMuted: true, // 가챠 음소거 상태 (기본값: 음소거)
    supportLB: JSON.parse(localStorage.getItem('supportLB')) || {},
    jewels: parseInt(localStorage.getItem('jewels')) || 0,
    totalPulls: storedPulls,
    gachaLog: storedLog,
    gachaType: localStorage.getItem('gachaType') || 'normal'
};

export function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
}

export function setGachaType(type) {
    state.gachaType = type;
    localStorage.setItem('gachaType', type);
}

export function setBackground(name) {
    state.currentBg = name;
    localStorage.setItem('selectedBg', name);
}

export function setFilter(type, value) {
    if (state.filters[type] !== undefined) {
        state.filters[type] = value;
    }
}

export function setSupportLB(cardId, lb) {
    state.supportLB[cardId] = lb;
    localStorage.setItem('supportLB', JSON.stringify(state.supportLB));
}

export function setTotalPulls(count, type = state.gachaType) {
    state.totalPulls[type] = count;
    localStorage.setItem('totalPullsObj', JSON.stringify(state.totalPulls));
}

export function addGachaLog(results, type = state.gachaType) {
    const currentLog = state.gachaLog[type] || [];
    // 최신 기록이 위로 오도록 앞에 추가
    const newLog = [...results, ...currentLog].slice(0, 9999); // 최근 9999개까지만 저장
    state.gachaLog[type] = newLog;
    localStorage.setItem('gachaLogObj', JSON.stringify(state.gachaLog));
}

export function clearGachaLog(type = state.gachaType) {
    state.gachaLog[type] = [];
    localStorage.setItem('gachaLogObj', JSON.stringify(state.gachaLog));
}

export function setJewels(amount) {
    state.jewels = amount;
    localStorage.setItem('jewels', amount);
}