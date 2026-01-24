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
        plan: [],
        attr: [],
        source: 'all',
        rarity: 'all'
    },
    sortBy: 'id-desc',
    extraFiltersOpen: false,
    gachaMuted: true,
    supportLB: JSON.parse(localStorage.getItem('supportLB')) || {},
    jewels: parseInt(localStorage.getItem('jewels')) || 0,
    totalPulls: storedPulls,
    gachaLog: storedLog,
    gachaType: localStorage.getItem('gachaType') || 'normal',
    pssrIndex: JSON.parse(localStorage.getItem('pssrIndex')) || {}
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
        if (Array.isArray(state.filters[type])) {
            const index = state.filters[type].indexOf(value);
            if (index > -1) {
                state.filters[type].splice(index, 1);
            } else {
                state.filters[type].push(value);
            }
        } else {
            state.filters[type] = (state.filters[type] === value) ? 'all' : value;
        }
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
    const newLog = [...results, ...currentLog].slice(0, 9999);
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

export function setPSSRIndex(cardId, index) {
    state.pssrIndex[cardId] = index;
    localStorage.setItem('pssrIndex', JSON.stringify(state.pssrIndex));
}
