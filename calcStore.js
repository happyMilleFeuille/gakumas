// calcStore.js
import { calcPlans } from './calcData.js';

/**
 * 계산기 전역 상태 관리 객체 (Store)
 */
export const calcStore = {
    type: 'hajime', // 'hajime' or 'nia'
    selectedIdol: '',
    planType: 'sense', // 'sense', 'logic', 'anomaly'
    weeks: {}, // { weekNum: { value: 'lessonvo', opts: { sp: 'true', ... } } }
    planCards: { sense: [], logic: [], anomaly: [] },
    planSkills: { sense: {}, logic: {}, anomaly: {} },
    cardChecked: {},
    itemCounters: {},
    manualEnhance: { m: 0, a: 0 },
    manualDelete: { m: 0, a: 0 },
    pItems: [null, null, null, null, null],
    isBoardCollapsed: false,

    /**
     * 초기 로드 및 저장된 상태 복원
     */
    init(type) {
        this.type = type;
        const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        
        this.selectedIdol = saved.selectedIdol || '';
        this.planType = saved.planType || 'sense';
        this.weeks = saved.weeks || {};
        this.planCards = saved.planCards || { sense: [], logic: [], anomaly: [] };
        this.planSkills = saved.planSkills || { sense: {}, logic: {}, anomaly: {} };
        this.cardChecked = saved.cardChecked || {};
        this.itemCounters = saved.itemCounters || {};
        this.manualEnhance = saved.manualEnhance || { m: 0, a: 0 };
        this.manualDelete = saved.manualDelete || { m: 0, a: 0 };
        this.pItems = saved.pItems || [null, null, null, null, null];
        this.isBoardCollapsed = !!saved.isBoardCollapsed;

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
    },

    save() {
        localStorage.setItem(`calc_state_${this.type}`, JSON.stringify(this));
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
