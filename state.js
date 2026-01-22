// state.js
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
    totalPulls: parseInt(localStorage.getItem('totalPulls')) || 0,
    gachaLog: JSON.parse(localStorage.getItem('gachaLog')) || []
};

export function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
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

export function setTotalPulls(count) {
    state.totalPulls = count;
    localStorage.setItem('totalPulls', count);
}

export function addGachaLog(results) {
    // 최신 기록이 위로 오도록 앞에 추가
    state.gachaLog = [...results, ...state.gachaLog].slice(0, 200); // 최근 200개까지만 저장
    localStorage.setItem('gachaLog', JSON.stringify(state.gachaLog));
}

export function clearGachaLog() {
    state.gachaLog = [];
    localStorage.removeItem('gachaLog');
}

export function setJewels(amount) {
    state.jewels = amount;
    localStorage.setItem('jewels', amount);
}