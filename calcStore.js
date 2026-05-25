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
    pItemSubOpts: [null, null, null, null, null],
    pItemSubSubOpts: [null, null, null, null, null],
    pItemChecked: false,
    isSR: false,
    memories: [null, null, null, null],
    isKyouka: false,
    recommendSettings: { vocal: 0, dance: 0, visual: 0 },
    lockCards: false,
    hifStats: { vocal: 0, dance: 0, visual: 0 },
    activeWeek: null,
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
            if (sessionStorage.getItem('is_loading_preset') === 'true') {
                return;
            }
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
            type: this.type,
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
            pItemSubOpts: this.pItemSubOpts,
            pItemSubSubOpts: this.pItemSubSubOpts,
            pItemChecked: this.pItemChecked,
            isSR: this.isSR,
            memories: this.memories,
            isKyouka: this.isKyouka,
            recommendSettings: this.recommendSettings,
            lockCards: this.lockCards,
            hifStats: this.hifStats,
            hifParamLimitLevel: this.hifParamLimitLevel || 0,
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

        // 마이그레이션: planCards가 과거 방식(단일 배열)인지 확인 후 변환
        if (Array.isArray(saved.planCards)) {
            this.planCards = {
                sense: [...saved.planCards],
                logic: [...saved.planCards],
                anomaly: [...saved.planCards]
            };
        } else {
            this.planCards = {
                ...createDefaultPlanCards(),
                ...(saved.planCards || {})
            };
        }

        // 마이그레이션: planSkills가 과거 방식(단일 객체, sense/logic/anomaly 키가 없음)인지 확인 후 변환
        if (saved.planSkills && !saved.planSkills.sense && !saved.planSkills.logic && !saved.planSkills.anomaly) {
            this.planSkills = {
                sense: { ...saved.planSkills },
                logic: { ...saved.planSkills },
                anomaly: { ...saved.planSkills }
            };
        } else {
            this.planSkills = {
                ...createDefaultPlanSkills(),
                ...(saved.planSkills || {})
            };
        }

        this.cardChecked = saved.cardChecked || {};
        this.cardExtraChecked = saved.cardExtraChecked || {};
        this.cardEventChecked = saved.cardEventChecked || {};
        this.itemCounters = saved.itemCounters || {};
        this.manualEnhance = { ...createDefaultManualEnhance(), ...(saved.manualEnhance || {}) };
        this.manualDelete = { ...createDefaultManualDelete(), ...(saved.manualDelete || {}) };
        this.manualGet = { ...createDefaultManualGet(), ...(saved.manualGet || {}) };
        this.pItems = Array.isArray(saved.pItems) ? saved.pItems : [null, null, null, null, null];
        this.pItemSubOpts = Array.isArray(saved.pItemSubOpts) ? saved.pItemSubOpts : [null, null, null, null, null];
        this.pItemSubSubOpts = Array.isArray(saved.pItemSubSubOpts) ? saved.pItemSubSubOpts : [null, null, null, null, null];
        this.pItemChecked = saved.pItemChecked === true || saved.pItemChecked === 'true';
        this.isSR = saved.isSR === true || saved.isSR === 'true';

        // 마이그레이션: 메모리가 과거 방식(단일 문자열 요소 배열)인지 확인 후 배열의 배열로 변환
        this.memories = Array.isArray(saved.memories) ? saved.memories.map(m => {
            if (m === null) return [];
            if (!Array.isArray(m)) return [m];
            return m;
        }) : [[], [], [], []];

        this.isKyouka = !!saved.isKyouka;
        this.recommendSettings = { ...createDefaultRecommendSettings(), ...(saved.recommendSettings || {}) };
        this.hifStats = { vocal: 0, dance: 0, visual: 0, ...(saved.hifStats || {}) };
        this.hifParamLimitLevel = saved.hifParamLimitLevel || 0;
        this.lockCards = saved.lockCards === true || saved.lockCards === 'true';
    },

    /**
     * 초기 로드 및 저장된 상태 복원
     */
    init(type) {
        this.type = type;
        localStorage.setItem('last_calc_type', type);
        this.ensurePersistenceGuards();
        const saved = this.loadPersistedState(type);
        this.applySavedState(saved);

        // 주간 계획 검증 및 동기화 (업데이트 시 누락되거나 잘못된 값 방지)
        const planData = calcPlans[type];
        if (planData && planData.weeks) {
            const currentWeeks = {};
            const isInitial = Object.keys(this.weeks).length === 0;

            Object.keys(planData.weeks).forEach(w => {
                const options = planData.weeks[w];
                const savedWeek = this.weeks[w];

                if (isInitial) {
                    if (options && options.length > 0) {
                        currentWeeks[w] = { value: '', opts: {} };
                    }
                } else {
                    const isValidValue = savedWeek && 
                        (savedWeek.value === '' || (options && options.some(opt => opt.value === savedWeek.value)));
                    
                    if (isValidValue) {
                        currentWeeks[w] = savedWeek;
                    } else {
                        // 주차가 새로 추가되었거나, 이전 선택값이 무효화된 경우 기본값으로 덮어씀
                        if (options && options.length > 0) {
                            currentWeeks[w] = { value: '', opts: {} };
                        }
                    }
                }
            });
            this.weeks = currentWeeks;
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

    resetState({ memories, pItems, skillCards, supportCards, schedule }) {
        if (memories) {
            this.memories = [[], [], [], []];
        }
        if (pItems) {
            this.pItems = [null, null, null, null, null];
            this.pItemSubOpts = [null, null, null, null, null];
            this.pItemSubSubOpts = [null, null, null, null, null];
            this.pItemChecked = false;
        }
        if (skillCards) {
            this.planSkills = { sense: {}, logic: {}, anomaly: {} };
        }
        if (supportCards) {
            this.cardChecked = {};
            this.cardExtraChecked = {};
            this.cardEventChecked = {};
            this.itemCounters = {};
            this.manualEnhance = { m: 0, a: 0 };
            this.manualDelete = { m: 0, a: 0, t: 0 };
            this.manualGet = { m: 0, a: 0, t: 0 };
        }
        if (schedule) {
            this.weeks = {};
            const planData = calcPlans[this.type];
            if (planData?.weeks) {
                Object.keys(planData.weeks).forEach(w => {
                    this.weeks[w] = { value: '', opts: {} };
                });
            }
        }
        if (memories && pItems && skillCards && supportCards && schedule) {
            this.isKyouka = false;
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
