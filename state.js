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

export const idolColors = {
    saki: "#E30F25",
    temari: "#0C7BBB",
    kotone: "#F3B005",
    mao: "#7F1184",
    lilja: "#7BC8F6",
    china: "#F68B1F",
    sumika: "#82E255",
    hiro: "#00AFCC",
    rinami: "#F6ADC6",
    ume: "#EA533A",
    misuzu: "#7A99CF",
    sena: "#F6AE54",
    tsubame: "#7B68E8"
};

const getBrowserLang = () => {
    const lang = navigator.language || navigator.userLanguage;
    if (lang && lang.startsWith('ko')) return 'ko';
    if (lang && lang.startsWith('en')) return 'en';
    return 'ja'; // 기본값 일본어
};

export const state = {
    currentLang: localStorage.getItem('lang') || getBrowserLang(),
    filters: safeParse('filters', {
        plan: [],
        attr: [],
        source: [],
        rarity: [],
        ability: []
    }),
    roadmapFilters: safeParse('roadmapFilters', {
        another: true,
        dist: true,
        fes: true,
        limited: true,
        unit: true,
        normal: true,
        logic: true,
        sense: true,
        anomaly: true
    }),
    sortBy: localStorage.getItem('sortBy') || 'id',
    sortOrder: localStorage.getItem('sortOrder') || 'desc',
    extraFiltersOpen: false,
    gachaMuted: true,
    supportLB: JSON.parse(localStorage.getItem('supportLB')) || {},
    jewels: parseInt(localStorage.getItem('jewels')) || 0,
    totalPulls: storedPulls,
    gachaLog: storedLog,
    gachaType: localStorage.getItem('gachaType') || 'normal',
    pssrIndex: JSON.parse(localStorage.getItem('pssrIndex')) || {},
    favoriteIdol: localStorage.getItem('favoriteIdol') || '',
    disabledCards: JSON.parse(localStorage.getItem('disabledCards')) || {},
    selectedPickup: safeParse('selectedPickup', {}),
    activeSelectionId: localStorage.getItem('activeSelectionId') || 'ongakusai_day1',
    activeNormalId: localStorage.getItem('activeNormalId') || 'normal_default',
    activeLimitedId: localStorage.getItem('activeLimitedId') || 'ssrume_endlesslimited',
    activeUnitId: localStorage.getItem('activeUnitId') || 'michinaruunit',
    activeFesId: localStorage.getItem('activeFesId') || 'ssrtsubame_campusfes'
};

export function setActiveFesId(id) {
    state.activeFesId = id;
    localStorage.setItem('activeFesId', id);
}

export function setActiveUnitId(id) {
    state.activeUnitId = id;
    localStorage.setItem('activeUnitId', id);
}

export function setActiveSelectionId(id) {
    state.activeSelectionId = id;
    localStorage.setItem('activeSelectionId', id);
}

export function setActiveNormalId(id) {
    state.activeNormalId = id;
    localStorage.setItem('activeNormalId', id);
}

export function setActiveLimitedId(id) {
    state.activeLimitedId = id;
    localStorage.setItem('activeLimitedId', id);
}

export function setSelectedPickup(type, id) {
    state.selectedPickup[type] = id;
    localStorage.setItem('selectedPickup', JSON.stringify(state.selectedPickup));
}

export function setRoadmapFilter(type, value) {
    state.roadmapFilters[type] = value;
    localStorage.setItem('roadmapFilters', JSON.stringify(state.roadmapFilters));
}

export function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
}

export function setGachaType(type) {
    state.gachaType = type;
    localStorage.setItem('gachaType', type);
}

export function setSortBy(val) {
    state.sortBy = val;
    localStorage.setItem('sortBy', val);
}

export function setSortOrder(val) {
    state.sortOrder = val;
    localStorage.setItem('sortOrder', val);
}

export function setFilter(type, value) {
    if (state.filters[type] !== undefined) {
        if (value === 'all') {
            state.filters[type] = [];
        } else if (Array.isArray(state.filters[type])) {
            const index = state.filters[type].indexOf(value);
            if (index > -1) {
                state.filters[type].splice(index, 1);
            } else {
                if (type === 'ability') {
                    if (value === 'percentparam') {
                        const idx = state.filters[type].indexOf('fixedparam');
                        if (idx > -1) state.filters[type].splice(idx, 1);
                    } else if (value === 'fixedparam') {
                        const idx = state.filters[type].indexOf('percentparam');
                        if (idx > -1) state.filters[type].splice(idx, 1);
                    }
                }
                state.filters[type].push(value);
            }
        } else {
            state.filters[type] = (state.filters[type] === value) ? 'all' : value;
        }
        localStorage.setItem('filters', JSON.stringify(state.filters));
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

export function setFavoriteIdol(name) {
    state.favoriteIdol = (state.favoriteIdol === name) ? '' : name;
    localStorage.setItem('favoriteIdol', state.favoriteIdol);
}

export function toggleDisabledCard(cardId) {
    if (state.disabledCards[cardId]) {
        delete state.disabledCards[cardId];
    } else {
        state.disabledCards[cardId] = true;
    }
    localStorage.setItem('disabledCards', JSON.stringify(state.disabledCards));
}

export function buildSupportSlotData() {
    return {
        supportLB: state.supportLB,
        disabledCards: state.disabledCards,
        timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    };
}

// [추가] 슬롯 저장/로드 기능
export function saveToSlot(slotId) {
    const saveData = buildSupportSlotData();
    localStorage.setItem(`support_slot_${slotId}`, JSON.stringify(saveData));
}

export function setSlotData(slotId, slotData) {
    if (!slotData) return;
    localStorage.setItem(`support_slot_${slotId}`, JSON.stringify({
        supportLB: slotData.supportLB || {},
        disabledCards: slotData.disabledCards || {},
        timestamp: slotData.timestamp || new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }));
}

export function getSlotData(slotId) {
    try {
        return JSON.parse(localStorage.getItem(`support_slot_${slotId}`));
    } catch {
        return null;
    }
}

export function loadFromSlot(slotId) {
    const saved = getSlotData(slotId);
    if (!saved) return false;

    state.supportLB = saved.supportLB || {};
    state.disabledCards = saved.disabledCards || {};

    localStorage.setItem('supportLB', JSON.stringify(state.supportLB));
    localStorage.setItem('disabledCards', JSON.stringify(state.disabledCards));
    return true;
}

export function deleteSlot(slotId) {
    localStorage.removeItem(`support_slot_${slotId}`);
}

export function getSlotInfo(slotId) {
    const saved = getSlotData(slotId);
    return saved ? saved.timestamp : null;
}
