// calcStore.js
import { calcPlans } from './calcData.js';

function createDefaultPlanCards() {
    return { sense: [], logic: [], anomaly: [] };
}

function createDefaultPlanSkills() {
    return { sense: {}, logic: {}, anomaly: {} };
}

function createDefaultManualEnhance() {
    return { m: 0, a: 0 };
}

function createDefaultManualDelete() {
    return { m: 0, a: 0, t: 0 };
}

function createDefaultManualGet() {
    return { m: 0, a: 0, t: 0 };
}

function createDefaultRecommendSettings() {
    return { vocal: 0, dance: 0, visual: 0 };
}

function readJson(storage, key) {
    try {
        const raw = storage?.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * 계산기 전역 상태 관리 객체 (Store)
 */
export const calcStore = {
    type: 'hajime', // 'hajime' or 'nia'
    selectedIdol: 'saki',
    planType: 'sense', // 'sense', 'logic', 'anomaly'
    weeks: {}, // { weekNum: { value: 'lessonvo', opts: { sp: 'true', ... } } }
    planCards: { sense: [], logic: [], anomaly: [] },
    planSkills: { sense: {}, logic: {}, anomaly: {} },
    cardChecked: {},
    cardExtraChecked: {}, // 엑스트라 옵션(강화/삭제/체인지) 체크
    cardEventChecked: {}, // 이벤트 옵션(Option 1) 체크
    itemCounters: {},
    manualEnhance: { m: 0, a: 0 },
    manualDelete: { m: 0, a: 0, t: 0 },
    manualGet: { m: 0, a: 0, t: 0 },
    pItems: [null, null, null, null, null],
    pItemChecked: false,
    isSR: false,
    memories: [null, null, null, null],
    isKyouka: false,
    recommendSettings: { vocal: 0, dance: 0, visual: 0 },
    _persistenceReady: false,

    getPrimaryKey(type = this.type) {
        return `calc_state_${type}`;
    },

    getShadowKey(type = this.type) {
        return `calc_state_shadow_${type}`;
    },

    getSessionKey(type = this.type) {
        return `calc_state_session_${type}`;
    },

    ensurePersistenceGuards() {
        if (this._persistenceReady) return;
        this._persistenceReady = true;

        const flush = () => {
            if (!this.type) return;
            this.persistState();
        };

        window.addEventListener('pagehide', flush);
        window.addEventListener('beforeunload', flush);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) flush();
        });
    },

    serializeState() {
        return {
            selectedIdol: this.selectedIdol,
            planType: this.planType,
            weeks: this.weeks,
            planCards: this.planCards,
            planSkills: this.planSkills,
            cardChecked: this.cardChecked,
            cardExtraChecked: this.cardExtraChecked,
            cardEventChecked: this.cardEventChecked,
            itemCounters: this.itemCounters,
            manualEnhance: this.manualEnhance,
            manualDelete: this.manualDelete,
            manualGet: this.manualGet,
            pItems: this.pItems,
            pItemChecked: this.pItemChecked,
            isSR: this.isSR,
            memories: this.memories,
            isKyouka: this.isKyouka,
            recommendSettings: this.recommendSettings,
            updatedAt: Date.now()
        };
    },

    persistState() {
        const serialized = JSON.stringify(this.serializeState());

        try {
            localStorage.setItem(this.getPrimaryKey(), serialized);
            localStorage.setItem(this.getShadowKey(), serialized);
        } catch (err) {
            console.warn('Failed to persist calc state to localStorage:', err);
        }

        try {
            sessionStorage.setItem(this.getSessionKey(), serialized);
        } catch (err) {
            console.warn('Failed to persist calc state to sessionStorage:', err);
        }
    },

    loadPersistedState(type) {
        const candidates = [
            readJson(localStorage, this.getPrimaryKey(type)),
            readJson(localStorage, this.getShadowKey(type)),
            readJson(sessionStorage, this.getSessionKey(type))
        ].filter(Boolean);

        if (candidates.length === 0) return {};

        candidates.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        return candidates[0];
    },

    applySavedState(saved) {
        this.selectedIdol = saved.selectedIdol || 'saki';
        this.planType = saved.planType || 'sense';
        this.weeks = saved.weeks || {};
        this.planCards = {
            ...createDefaultPlanCards(),
            ...(saved.planCards || {})
        };
        this.planSkills = {
            ...createDefaultPlanSkills(),
            ...(saved.planSkills || {})
        };
        this.cardChecked = saved.cardChecked || {};
        this.cardExtraChecked = saved.cardExtraChecked || {};
        this.cardEventChecked = saved.cardEventChecked || {};
        this.itemCounters = saved.itemCounters || {};
        this.manualEnhance = { ...createDefaultManualEnhance(), ...(saved.manualEnhance || {}) };
        this.manualDelete = { ...createDefaultManualDelete(), ...(saved.manualDelete || {}) };
        this.manualGet = { ...createDefaultManualGet(), ...(saved.manualGet || {}) };
        this.pItems = Array.isArray(saved.pItems) ? saved.pItems : [null, null, null, null, null];
        this.pItemChecked = saved.pItemChecked === true || saved.pItemChecked === 'true';
        this.isSR = saved.isSR === true || saved.isSR === 'true';
        this.memories = Array.isArray(saved.memories) ? saved.memories : [null, null, null, null];
        this.isKyouka = !!saved.isKyouka;
        this.recommendSettings = { ...createDefaultRecommendSettings(), ...(saved.recommendSettings || {}) };
    },

    /**
     * 초기 로드 및 저장된 상태 복원
     */
    init(type) {
        this.type = type;
        this.ensurePersistenceGuards();
        const saved = this.loadPersistedState(type);
        this.applySavedState(saved);

        // 초기 주간 계획 설정 (저장된 게 없으면 기본값)
        const planData = calcPlans[type];
        if (Object.keys(this.weeks).length === 0 && planData) {
            Object.keys(planData.weeks).forEach(w => {
                const options = planData.weeks[w];
                if (options && options.length > 0) {
                    this.weeks[w] = { value: options[0].value, opts: {} };
                }
            });
        }

        // 읽기 성공 시 주 저장소/보조 저장소를 즉시 다시 맞춰 둔다.
        this.persistState();
    },

    save() {
        this.persistState();
    },

    resetWeeks() {
        this.weeks = {};
        const planData = calcPlans[this.type];
        if (planData?.weeks) {
            Object.keys(planData.weeks).forEach(w => {
                this.weeks[w] = { value: '', opts: {} };
            });
        }
        this.save();
    },

    setWeekAction(week, value, opts = {}) {
        this.weeks[week] = { value, opts };
        this.save();
    },

    updateWeekOpt(week, optId, value) {
        if (!this.weeks[week]) return;
        if (value === null || value === undefined || value === 'false' || value === false) {
            delete this.weeks[week].opts[optId];
        } else {
            this.weeks[week].opts[optId] = String(value);
        }
        this.save();
    },

    setPlanType(type) {
        this.planType = type;
        this.save();
    },

    setSelectedIdol(idolId) {
        this.selectedIdol = idolId;
        this.save();
    }
};
