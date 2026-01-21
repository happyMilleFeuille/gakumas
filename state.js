// state.js
export const state = {
    currentLang: localStorage.getItem('lang') || 'ko',
    currentBg: localStorage.getItem('selectedBg') || '',
    filters: {
        plan: 'all',
        attr: 'all',
        source: 'all'
    },
    supportLB: JSON.parse(localStorage.getItem('supportLB')) || {}
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