// state.js
const safeParse = (key, def) => {
    try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
};

const safeSessionParse = (key, def) => {
    try { return JSON.parse(sessionStorage.getItem(key)) || def; } catch { return def; }
};

const getTodayStr = () => {
    // 한국/일본 표준시(UTC+9) 기준으로 오늘 날짜 고정 계산 (미국 등 해외 사용자 오차 방지)
    const tzOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(Date.now() + tzOffset);
    return `${jstDate.getUTCFullYear()}-${String(jstDate.getUTCMonth() + 1).padStart(2, '0')}-${String(jstDate.getUTCDate()).padStart(2, '0')}`;
};

const initialActiveBannerIds = {
    selection: localStorage.getItem('activeSelectionId') || 'ongakusai_day1',
    normal: localStorage.getItem('activeNormalId') || 'normal_default',
    limited: localStorage.getItem('activeLimitedId') || 'ssrume_endlesslimited',
    unit: localStorage.getItem('activeUnitId') || 'michinaruunit',
    fes: localStorage.getItem('activeFesId') || 'ssrtsubame_campusfes'
};

const makeGachaBannerKey = (type, bannerId) => `${type}:${bannerId || 'default'}`;

const pruneInactiveBannerData = (record) => {
    let changed = false;
    Object.entries(initialActiveBannerIds).forEach(([type, bannerId]) => {
        const activeKey = makeGachaBannerKey(type, bannerId);
        Object.keys(record).forEach(key => {
            if (key.startsWith(`${type}:`) && key !== activeKey) {
                delete record[key];
                changed = true;
            }
        });
    });
    return changed;
};

// 초기화 및 마이그레이션 로직
let storedPulls = safeParse('totalPullsObj', null);
let shouldPersistStoredPulls = false;
if (!storedPulls) {
    const oldVal = parseInt(localStorage.getItem('totalPulls')) || 0;
    storedPulls = { normal: oldVal, limited: 0, unit: 0, fes: 0 };
    shouldPersistStoredPulls = true;
}
if (Object.prototype.hasOwnProperty.call(storedPulls, 'normal_multi')) {
    storedPulls.normal = (storedPulls.normal || 0) + (storedPulls.normal_multi || 0);
    delete storedPulls.normal_multi;
    shouldPersistStoredPulls = true;
}
Object.entries(initialActiveBannerIds).forEach(([type, bannerId]) => {
    if (!Object.prototype.hasOwnProperty.call(storedPulls, type)) return;
    const bannerKey = makeGachaBannerKey(type, bannerId);
    storedPulls[bannerKey] = (storedPulls[bannerKey] || 0) + (storedPulls[type] || 0);
    delete storedPulls[type];
    shouldPersistStoredPulls = true;
});
if (pruneInactiveBannerData(storedPulls)) shouldPersistStoredPulls = true;
if (shouldPersistStoredPulls) {
    localStorage.setItem('totalPullsObj', JSON.stringify(storedPulls));
}

let storedLog = safeParse('gachaLogObj', null);
if (!storedLog) {
    const oldVal = safeParse('gachaLog', []);
    storedLog = { normal: oldVal, limited: [], unit: [], fes: [] };
}
let shouldPersistStoredLog = false;
if (Object.prototype.hasOwnProperty.call(storedLog, 'normal_multi')) {
    storedLog.normal = [...(storedLog.normal || []), ...(storedLog.normal_multi || [])];
    delete storedLog.normal_multi;
    shouldPersistStoredLog = true;
}
Object.entries(initialActiveBannerIds).forEach(([type, bannerId]) => {
    if (!Object.prototype.hasOwnProperty.call(storedLog, type)) return;
    const bannerKey = makeGachaBannerKey(type, bannerId);
    const legacyEntries = Array.isArray(storedLog[type]) ? storedLog[type] : [];
    const bannerEntries = Array.isArray(storedLog[bannerKey]) ? storedLog[bannerKey] : [];
    storedLog[bannerKey] = [...legacyEntries, ...bannerEntries].slice(0, 9999);
    delete storedLog[type];
    shouldPersistStoredLog = true;
});
if (pruneInactiveBannerData(storedLog)) shouldPersistStoredLog = true;

// 가챠 로그에는 순서와 중복을 보존한 카드 ID만 저장한다.
// 기존 객체형 로그는 최초 로드 시 자동으로 경량 형식으로 변환한다.
Object.entries(storedLog).forEach(([type, entries]) => {
    if (!Array.isArray(entries)) {
        storedLog[type] = [];
        shouldPersistStoredLog = true;
        return;
    }

    const normalizedEntries = entries
        .map(entry => typeof entry === 'string' ? entry : entry?.id)
        .filter(id => typeof id === 'string' && id.length > 0);
    if (normalizedEntries.length !== entries.length || entries.some(entry => typeof entry !== 'string')) {
        storedLog[type] = normalizedEntries;
        shouldPersistStoredLog = true;
    }
});
if (shouldPersistStoredLog) {
    localStorage.setItem('gachaLogObj', JSON.stringify(storedLog));
}

const storedGachaType = localStorage.getItem('gachaType');
const initialGachaType = storedGachaType === 'normal_multi' ? 'normal' : (storedGachaType || 'normal');
if (storedGachaType === 'normal_multi') localStorage.setItem('gachaType', 'normal');
localStorage.removeItem('activeNormalMultiId');

export const idolColors = {
    saki: "#E30F25",
    temari: "#0C7BBB",
    kotone: "#F8C112",
    mao: "#7F1184",
    lilja: "#7BC8F6",
    china: "#F68B1F",
    sumika: "#82E255",
    hiro: "#00AFCC",
    rinami: "#F6ADC6",
    ume: "#EA533A",
    misuzu: "#7A99CF",
    sena: "#F6AE54",
    tsubame: "#7B68E8",
    kanae: "#008969"
};

const getBrowserLang = () => {
    const lang = navigator.language || navigator.userLanguage;
    if (lang && lang.startsWith('ko')) return 'ko';
    if (lang && lang.startsWith('en')) return 'en';
    return 'ja'; // 기본값 일본어
};

export const state = {
    currentLang: localStorage.getItem('lang') || getBrowserLang(),
    filters: safeSessionParse('filters', {
        plan: [],
        attr: [],
        source: [],
        rarity: [],
        ability: [],
        abilityMode: 'and',
        dateRange: {
            start: '2024-05-16',
            end: getTodayStr()
        }
    }),
    roadmapFilters: (() => {
        const defaults = {
            another: false,
            dist: false,
            fes: true,
            limited: true,
            unit: true,
            normal: true,
            concentration: false,
            goodcondition: false,
            goodimpression: false,
            motivation: false,
            fullpower: false,
            enthusiasm: false
        };
        const loaded = safeSessionParse('roadmapFilters', {});
        return { ...defaults, ...loaded };
    })(),
    sortBy: localStorage.getItem('sortBy') || 'id',
    sortOrder: localStorage.getItem('sortOrder') || 'desc',
    extraFiltersOpen: false,
    gachaMuted: true,
    supportLB: JSON.parse(localStorage.getItem('supportLB')) || {},
    jewels: parseInt(localStorage.getItem('jewels')) || 0,
    totalPulls: storedPulls,
    gachaLog: storedLog,
    gachaType: initialGachaType,
    pssrIndex: JSON.parse(localStorage.getItem('pssrIndex')) || {},
    favoriteIdol: localStorage.getItem('favoriteIdol') || '',
    disabledCards: JSON.parse(localStorage.getItem('disabledCards')) || {},
    selectedPickup: safeParse('selectedPickup', {}),
    activeSelectionId: initialActiveBannerIds.selection,
    activeNormalId: initialActiveBannerIds.normal,
    activeLimitedId: initialActiveBannerIds.limited,
    activeUnitId: initialActiveBannerIds.unit,
    activeFesId: initialActiveBannerIds.fes
};

const gachaLogIdCounts = new Map();

const clearGachaDataForType = (type) => {
    const prefix = `${type}:`;
    Object.keys(state.gachaLog).forEach(key => {
        if (key.startsWith(prefix)) delete state.gachaLog[key];
    });
    Object.keys(state.totalPulls).forEach(key => {
        if (key.startsWith(prefix)) delete state.totalPulls[key];
    });
    Array.from(gachaLogIdCounts.keys()).forEach(key => {
        if (key.startsWith(prefix)) gachaLogIdCounts.delete(key);
    });
    localStorage.setItem('gachaLogObj', JSON.stringify(state.gachaLog));
    localStorage.setItem('totalPullsObj', JSON.stringify(state.totalPulls));
};

export function getActiveGachaBannerKey(type = state.gachaType) {
    const normalizedType = type === 'normal_multi' ? 'normal' : type;
    const bannerId = normalizedType === 'selection' ? state.activeSelectionId
        : normalizedType === 'normal' ? state.activeNormalId
            : normalizedType === 'limited' ? state.activeLimitedId
                : normalizedType === 'unit' ? state.activeUnitId
                    : normalizedType === 'fes' ? state.activeFesId
                        : state.selectedPickup[normalizedType];
    return makeGachaBannerKey(normalizedType, bannerId);
}

const resolveGachaBannerKey = (typeOrKey = state.gachaType) => (
    typeof typeOrKey === 'string' && typeOrKey.includes(':')
        ? typeOrKey
        : getActiveGachaBannerKey(typeOrKey)
);

export function getGachaLog(typeOrKey = state.gachaType) {
    return state.gachaLog[resolveGachaBannerKey(typeOrKey)] || [];
}

export function getTotalPulls(typeOrKey = state.gachaType) {
    return state.totalPulls[resolveGachaBannerKey(typeOrKey)] || 0;
}

const rebuildGachaLogIdCounts = (typeOrKey) => {
    const bannerKey = resolveGachaBannerKey(typeOrKey);
    const counts = new Map();
    (state.gachaLog[bannerKey] || []).forEach(id => {
        counts.set(id, (counts.get(id) || 0) + 1);
    });
    gachaLogIdCounts.set(bannerKey, counts);
    return counts;
};

Object.keys(state.gachaLog).forEach(rebuildGachaLogIdCounts);

const getGachaLogIdCounts = (typeOrKey) => {
    const bannerKey = resolveGachaBannerKey(typeOrKey);
    return gachaLogIdCounts.get(bannerKey) || rebuildGachaLogIdCounts(bannerKey);
};

export function hasGachaLogCard(id, type = state.gachaType) {
    return getGachaLogIdCounts(type).has(id);
}

export function getGachaLogIdSet(type = state.gachaType) {
    return new Set(getGachaLogIdCounts(type).keys());
}

// 마이그레이션: 기존 세션에 dateRange가 없는 경우 초기화
if (!state.filters.dateRange) {
    state.filters.dateRange = {
        start: '2024-05-16',
        end: getTodayStr()
    };
    sessionStorage.setItem('filters', JSON.stringify(state.filters));
}

if (!['or', 'and'].includes(state.filters.abilityMode)) {
    state.filters.abilityMode = 'and';
    sessionStorage.setItem('filters', JSON.stringify(state.filters));
}

export function setActiveFesId(id) {
    if (state.activeFesId !== id) clearGachaDataForType('fes');
    state.activeFesId = id;
    localStorage.setItem('activeFesId', id);
}

export function setActiveUnitId(id) {
    if (state.activeUnitId !== id) clearGachaDataForType('unit');
    state.activeUnitId = id;
    localStorage.setItem('activeUnitId', id);
}

export function setActiveSelectionId(id) {
    if (state.activeSelectionId !== id) clearGachaDataForType('selection');
    state.activeSelectionId = id;
    localStorage.setItem('activeSelectionId', id);
}

export function setActiveNormalId(id) {
    if (state.activeNormalId !== id) clearGachaDataForType('normal');
    state.activeNormalId = id;
    localStorage.setItem('activeNormalId', id);
}

export function setActiveLimitedId(id) {
    if (state.activeLimitedId !== id) clearGachaDataForType('limited');
    state.activeLimitedId = id;
    localStorage.setItem('activeLimitedId', id);
}

export function setSelectedPickup(type, id) {
    if (state.selectedPickup[type] !== id) clearGachaDataForType(type);
    state.selectedPickup[type] = id;
    localStorage.setItem('selectedPickup', JSON.stringify(state.selectedPickup));
}

export function setRoadmapFilter(type, value) {
    state.roadmapFilters[type] = value;
    sessionStorage.setItem('roadmapFilters', JSON.stringify(state.roadmapFilters));
}

export function setLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
}

export function setGachaType(type) {
    const normalizedType = type === 'normal_multi' ? 'normal' : type;
    state.gachaType = normalizedType;
    localStorage.setItem('gachaType', normalizedType);
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
                state.filters[type].push(value);
            }
        } else {
            state.filters[type] = (state.filters[type] === value) ? 'all' : value;
        }
        sessionStorage.setItem('filters', JSON.stringify(state.filters));
    }
}

export function setSupportLB(cardId, lb) {
    state.supportLB[cardId] = lb;
    localStorage.setItem('supportLB', JSON.stringify(state.supportLB));
}

export function setTotalPulls(count, type = state.gachaType) {
    state.totalPulls[resolveGachaBannerKey(type)] = count;
    localStorage.setItem('totalPullsObj', JSON.stringify(state.totalPulls));
}

export function addGachaLog(results, type = state.gachaType) {
    const bannerKey = resolveGachaBannerKey(type);
    const currentLog = state.gachaLog[bannerKey] || [];
    const resultIds = results
        .map(result => typeof result === 'string' ? result : result?.id)
        .filter(id => typeof id === 'string' && id.length > 0);
    const combinedLength = resultIds.length + currentLog.length;
    const overflow = Math.max(0, combinedLength - 9999);
    const droppedIds = overflow === 0
        ? []
        : (overflow <= currentLog.length
            ? currentLog.slice(-overflow)
            : [...resultIds.slice(9999), ...currentLog]);
    const newLog = [...resultIds, ...currentLog].slice(0, 9999);
    state.gachaLog[bannerKey] = newLog;

    const counts = getGachaLogIdCounts(bannerKey);
    resultIds.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
    droppedIds.forEach(id => {
        const nextCount = (counts.get(id) || 0) - 1;
        if (nextCount > 0) counts.set(id, nextCount);
        else counts.delete(id);
    });

    localStorage.setItem('gachaLogObj', JSON.stringify(state.gachaLog));
}

export function clearGachaLog(type = state.gachaType) {
    const bannerKey = resolveGachaBannerKey(type);
    state.gachaLog[bannerKey] = [];
    gachaLogIdCounts.set(bannerKey, new Map());
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
        timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    };
}

// [추가] 슬롯 저장/로드 기능
export function saveToSlot(slotId, customName) {
    const saveData = buildSupportSlotData();
    if (customName) saveData.customName = customName;
    localStorage.setItem(`support_slot_${slotId}`, JSON.stringify(saveData));
}

export function setSlotData(slotId, slotData) {
    if (!slotData) return;
    localStorage.setItem(`support_slot_${slotId}`, JSON.stringify({
        supportLB: slotData.supportLB || {},
        disabledCards: slotData.disabledCards || {},
        customName: slotData.customName || `Slot ${slotId}`,
        timestamp: slotData.timestamp || new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
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
