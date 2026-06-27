// guidePresets.js
import { state } from './state.js';
import { idolData } from './calcData.js';

const DEFAULT_DESCRIPTIONS = {
    ko: '각 아이돌과 플랜에 맞는 스케줄을 제공합니다.\n서포트 카드 자동 추천과 함께 사용하는 것을 권장합니다.\n※ 최고의 효율성을 보장하지 않습니다.',
    ja: '各アイドルとプランに合わせたスケジュールを提供します。\nサポートカードおすすめとの併用を推奨します。\n※ 最高の効率を保証するものではありません。',
    en: 'Provides a schedule suitable for each idol and plan.\nIt is recommended to use alongside the support card recommendation feature.\n* Maximum efficiency is not guaranteed.'
};

/**
 * [가이드 프리셋 데이터 정의]
 * 하지메 모드처럼 플랜과 상관없이 공통 스케쥴을 쓰는 경우 'default' 키 하위에 공용 템플릿 하나만 정의합니다.
 * 플랜별로 카드/스킬 체크 세팅이 다를 경우 해당 플랜 키(예: sense, logic) 하위에 특화 세팅을 작성하여 병합합니다.
 */
export const guidePresets = {
    hajime: {
        // 하지메 모드 공용 템플릿 (플랜 통합)
        default: {
            description: '',
            calcState: {
                pItems: ['{thirdAttrPItem}', '{fixedPItem2}', null, null, null],
                memories: [
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20']
                ],
                manualEnhance: { m: 0, a: 1 },
                manualDelete: { m: 1, a: 1, t: 0 },
                weeks: {
                    '1': { value: 'class_hajime', opts: { 'class_hajime2': 'true', 'selectedAttr': '{firstAttr}' } },
                    '2': { value: 'class_hajime', opts: { 'class_hajime2': 'true', 'selectedAttr': '{secondAttr}' } },
                    '3': { value: 'gift_hajime', opts: {} },
                    '4': { value: '{firstAttrLesson}', opts: { 'sp': 'true' } },
                    '5': { value: 'gift_hajime', opts: {} },
                    '6': { value: 'class_hajime', opts: { 'class_hajime2': 'true', 'selectedAttr': '{thirdAttr}' } },
                    '7': { value: '{secondAttrLesson}', opts: { 'sp': 'true' } },
                    '8': { value: 'advice', opts: { 'enhance': '1', 'delete': '1', 'purchase_ssr': '1', 'purchase_drink': '2' } },
                    '9': { value: 'spclass', opts: { 'spclass_customize': '4' } },
                    '10': { value: 'test', opts: {} },
                    '11': { value: 'gift_hajime', opts: {} },
                    '12': { value: '{secondAttrLesson}', opts: { 'sp': 'true' } },
                    '13': { value: 'gift_hajime', opts: {} },
                    '14': { value: '{firstAttrLesson}', opts: { 'sp': 'true' } },
                    '15': { value: 'class_hajime', opts: { 'class_hajime2': 'true', 'selectedAttr': '{thirdAttr}' } },
                    '16': { value: '{firstAttrLesson}', opts: { 'sp': 'true' } },
                    '17': { value: 'advice', opts: { 'delete': '1', 'purchase_drink': '6' } },
                    '18': { value: 'test', opts: {} }
                }
            }
        },
        // 하지메 Sense 플랜 특화 데이터 (카드/스킬셋)
        sense: {
            calcState: {
                planSkills: {
                    sense: {
                        "sense-legend1": 1,
                        "free-ssr4": 1,
                        "sense-ssr6": 1,
                        "sense-ssr3": 1,
                        "sense-ssr5": 1,
                        "sense-ssr4": 1,
                        "sense-ssr9": 1,
                        "sense-ssr11": 1,
                        "sense-sr18": 1,
                        "sense-sr19": 1,
                        "sense-sr20": 1,
                        "sense-sr13": 1,
                        "sense-sr16": 1,
                        "sense-sr6alt": 1,
                        "sense-sr1alt": 1,
                        "sense-r11": 1,
                        "sense-sr8": 1,
                        "sense-sr10": 1,
                        "sense-sr12": 1,
                        "sense-ssr8": 1,
                        "sense-ssr1alt": 1,
                    },
                    logic: {},
                    anomaly: {}
                }
            }
        },
        // 하지메 Logic 플랜 특화 데이터 (카드/스킬셋)
        logic: {
            calcState: {
                planSkills: {
                    sense: {},
                    logic: {
                        "logic-legend4": 1,
                        "free-ssr4": 1,
                        "logic-ssr13": 1,
                        "logic-ssr10": 1,
                        "logic-ssr8": 1,
                        "logic-ssr6": 1,
                        "logic-ssr7": 1,
                        "logic-ssr4": 1,
                        "logic-ssr3": 1,
                        "logic-sr14": 2,
                        "logic-sr6alt": 1,
                        "logic-sr3alt": 1,
                        "logic-r12": 1,
                        "logic-r3alt": 1,
                        "logic-sr8alt": 1,
                        "logic-sr16": 1,
                        "logic-sr15": 1,
                        "logic-sr13": 1,
                        "logic-ssr1alt": 1,
                        "logic-sr2": 1
                    }
                }
            }
        },
        // 하지메 Anomaly 플랜 특화 데이터 (카드/스킬셋)
        anomaly: {
            calcState: {
                planSkills: {
                    anomaly: {
                        "anomaly-sr1alt": 1,
                        "anomaly-sr3alt": 1,
                        "anomaly-sr4alt": 1,
                        "anomaly-sr7": 1,
                        "anomaly-sr9": 1,
                        "anomaly-sr19": 1,
                        "anomaly-sr20": 1,
                        "anomaly-sr17": 1,
                        "anomaly-sr16": 1,
                        "anomaly-ssr2alt": 1,
                        "anomaly-ssr1alt": 1,
                        "anomaly-ssr5": 1,
                        "anomaly-ssr7": 1,
                        "anomaly-ssr11": 1,
                        "anomaly-legend2": 1,
                        "free-ssr4": 1,
                        "anomaly-ssr8": 1,
                        "anomaly-ssr3": 1,
                        "anomaly-r11": 2,
                        "anomaly-r10": 1
                    }
                }
            }
        }
    },
    nia: {
        // 니아 모드 공용 템플릿
        default: {
            description: '',
            calcState: {
                pItems: ['nia1-1', 'nia2-1', 'nia3-1', 'nia4-2', 'nia5-2'],
                memories: [
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20']
                ],
                weeks: {
                    '1': { value: '{firstAttrLesson}', opts: { sp: 'true' } },
                    '2': { value: 'class_nia', opts: { get_enhancedcard: 'true', selectedAttr: '{thirdAttr}' } },
                    '3': { value: 'gift_nia', opts: {} },
                    '4': { value: '{secondAttrLesson}', opts: { sp: 'true' } },
                    '5': { value: 'class_nia', opts: { get_ppoint: 'true', selectedAttr: '{thirdAttr}' } },
                    '6': { value: 'goout_nia', opts: { goout_nia6: 'true' } },
                    '7': { value: 'class_nia', opts: { get_enhancedcard: 'true', selectedAttr: '{secondAttr}' } },
                    '8': { value: 'spclass', opts: { spclass_customize: '4' } },
                    '9': { value: 'audition', opts: {} },
                    '10': { value: 'gift_nia', opts: {} },
                    '11': { value: '{firstAttrLesson}', opts: { sp: 'true' } },
                    '12': { value: 'class_nia', opts: { get_drink: 'true', selectedAttr: '{secondAttr}' } },
                    '13': { value: 'gift_nia', opts: {} },
                    '14': { value: '{secondAttrLesson}', opts: { sp: 'true' } },
                    '15': { value: 'class_nia', opts: { get_ppoint: 'true', selectedAttr: '{firstAttr}' } },
                    '16': { value: 'spclass', opts: { spclass_customize: '4' } },
                    '17': { value: 'audition', opts: {} },
                    '18': { value: 'gift_nia', opts: {} },
                    '19': { value: '{secondAttrLesson}', opts: { sp: 'true' } },
                    '20': { value: 'class_nia', opts: { get_drink: 'true', selectedAttr: '{thirdAttr}' } },
                    '21': { value: 'gift_nia', opts: {} },
                    '22': { value: '{firstAttrLesson}', opts: { sp: 'true' } },
                    '23': { value: 'class_nia', opts: { selectedAttr: '{thirdAttr}' } },
                    '24': { value: '{firstAttrLesson}', opts: { sp: 'true' } },
                    '25': { value: 'advice', opts: { delete: '2', purchase_drink: '4' } },
                    '26': { value: 'audition', opts: {} }
                }
            }
        },
        // 니아 Sense 플랜 특화 데이터 (카드/스킬셋)
        sense: {
            calcState: {
                planSkills: {
                    sense: {
                        "free-ssr4": 1,
                        "sense-ssr6": 1,
                        "sense-ssr3": 1,
                        "sense-ssr5": 1,
                        "sense-ssr4": 1,
                        "sense-ssr9": 1,
                        "sense-ssr11": 1,
                        "sense-sr18": 1,
                        "sense-sr19": 1,
                        "sense-sr20": 1,
                        "sense-sr13": 1,
                        "sense-sr16": 1,
                        "sense-sr6alt": 1,
                        "sense-sr1alt": 1,
                        "sense-r11": 1,
                        "sense-sr8": 1,
                        "sense-sr10": 1,
                        "sense-sr12": 1,
                        "sense-ssr8": 1,
                        "sense-ssr1alt": 1,
                        "sense-r13": 1
                    }
                }
            }
        },
        // 니아 Logic 플랜 특화 데이터 (카드/스킬셋)
        logic: {
            calcState: {
                planSkills: {
                    logic: {
                        "free-ssr4": 1,
                        "logic-ssr13": 1,
                        "logic-ssr10": 1,
                        "logic-ssr8": 1,
                        "logic-ssr6": 1,
                        "logic-ssr7": 1,
                        "logic-ssr4": 1,
                        "logic-ssr3": 1,
                        "logic-sr14": 2,
                        "logic-sr11": 1,
                        "logic-sr6alt": 1,
                        "logic-sr3alt": 1,
                        "logic-r12": 1,
                        "logic-r3alt": 1,
                        "logic-sr8alt": 1,
                        "logic-sr16": 1,
                        "logic-sr15": 1,
                        "logic-sr13": 1,
                        "logic-ssr1alt": 1,
                        "logic-sr2": 1
                    }
                }
            }
        },
        // 니아 Anomaly 플랜 특화 데이터 (카드/스킬셋)
        anomaly: {
            calcState: {
                planSkills: {
                    anomaly: {
                        "anomaly-sr1alt": 1,
                        "anomaly-sr3alt": 1,
                        "anomaly-sr4alt": 1,
                        "anomaly-sr7": 1,
                        "anomaly-sr8": 1,
                        "anomaly-sr9": 1,
                        "anomaly-sr19": 1,
                        "anomaly-sr20": 1,
                        "anomaly-sr17": 1,
                        "anomaly-sr16": 1,
                        "anomaly-ssr2alt": 1,
                        "anomaly-ssr1alt": 1,
                        "anomaly-ssr5": 1,
                        "anomaly-ssr7": 1,
                        "anomaly-ssr11": 1,
                        "free-ssr4": 1,
                        "anomaly-ssr8": 1,
                        "anomaly-ssr3": 1,
                        "anomaly-r11": 2,
                        "anomaly-r10": 1
                    }
                }
            }
        }
    },
    hif: {
        // HIF 모드 공용 템플릿
        default: {
            description: '',
            calcState: {
                pItems: ['hif3'],
                pItemSubOpts: ['hif3-2'],
                pItemSubSubOpts: ['hif3-2-1'],
                hifStats: { vocal: 5, dance: 5, visual: 5 },
                hifParamLimitLevel: 6,
                manualDelete: { m: 3, a: 2, t: 0 },
                manualEnhance: { m: 1, a: 0 },
                memories: [
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20'],
                    ['{firstAttr}28p', '{secondAttr}28p', '{thirdAttr}20']
                ],
                weeks: {
                    '1': { value: 'gift_hif', opts: {} },
                    '2': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '3': { value: 'class_hif0', opts: { selectedAttr: '{thirdAttr}', class_hajime2: 'true' } },
                    '4': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '5': { value: 'goout_hif', opts: { goout_hif2: 'true' } },
                    '6': { value: 'class_hif0', opts: { selectedAttr: '{thirdAttr}', class_hajime2: 'true' } },
                    '7': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest7_1st}', 'hif_test_{secondAttr}': '{hifTest7_2nd}', 'hif_test_{thirdAttr}': '{hifTest7_3rd}' } },
                    '8': { value: 'gift_hif', opts: {} },
                    '9': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{thirdAttr}' } },
                    '10': { value: 'class_hif1', opts: { selectedAttr: '{thirdAttr}', class_hif1: 'true' } },
                    '11': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '12': { value: 'advice', opts: { enhance: '1', purchase_ssr: '1', purchase_drink: '4' } },
                    '13': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest13_1st}', 'hif_test_{secondAttr}': '{hifTest13_2nd}', 'hif_test_{thirdAttr}': '{hifTest13_3rd}' } },
                    '14': { value: 'goout_hif', opts: { goout_hif2: 'true' } },
                    '15': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '16': { value: 'gift_hif', opts: {} },
                    '17': { value: 'class_hif1', opts: { selectedAttr: '{thirdAttr}', class_hif1: 'true' } },
                    '18': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{thirdAttr}' } },
                    '19': { value: 'advice', opts: { delete: '1', purchase_drink: '4' } },
                    '20': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest20_1st}', 'hif_test_{secondAttr}': '{hifTest20_2nd}', 'hif_test_{thirdAttr}': '{hifTest20_3rd}' } },
                    '21': { value: 'class_hif1', opts: { selectedAttr: '{secondAttr}', class_hif1: 'true' } },
                    '22': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '23': { value: 'gift_hif', opts: {} },
                    '24': { value: 'class_hif1', opts: { selectedAttr: '{secondAttr}', class_hif1: 'true' } },
                    '25': { value: '{firstAttrLesson}', opts: { sp: 'true', selectedSubAttr: '{secondAttr}' } },
                    '26': { value: 'advice', opts: { purchase_drink: '8', purchase_ssr: '1' } },
                    '27': { value: 'round_hif', opts: {} },
                    '28': { value: 'advice_hif', opts: { purchase_drink: '2', purchase_ssr: '1' } },
                    '29': { value: 'round_hif', opts: {} }
                }
            }
        },
        // HIF 모드 두 번째 공용 템플릿: 가이드 프리셋 (댄스+드링크)
        default2: {
            description: '',
            calcState: {
                pItems: ['hif3'],
                pItemSubOpts: ['hif3-1'],
                pItemSubSubOpts: ['hif3-1-1'],
                hifStats: { vocal: 5, dance: 5, visual: 5 },
                hifParamLimitLevel: 6,
                manualDelete: { m: 3, a: 2, t: 0 },
                manualEnhance: { m: 1, a: 0 },
                memories: [
                    ['{hif2Mem1}', '{hif2Mem2}', '{hif2Mem3}'],
                    ['{hif2Mem1}', '{hif2Mem2}', '{hif2Mem3}'],
                    ['{hif2Mem1}', '{hif2Mem2}', '{hif2Mem3}'],
                    ['{hif2Mem1}', '{hif2Mem2}', '{hif2Mem3}']
                ],
                weeks: {
                    '1': { value: 'gift_hif', opts: {} },
                    '2': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '3': { value: 'class_hif0', opts: { selectedAttr: '{thirdAttr}', class_hajime2: 'true' } },
                    '4': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '5': { value: 'goout_hif', opts: { goout_hif2: 'true' } },
                    '6': { value: 'class_hif0', opts: { selectedAttr: '{thirdAttr}', class_hajime2: 'true' } },
                    '7': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest7_1st}', 'hif_test_{secondAttr}': '{hifTest7_2nd}', 'hif_test_{thirdAttr}': '{hifTest7_3rd}' } },
                    '8': { value: 'gift_hif', opts: {} },
                    '9': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{thirdAttr}' } },
                    '10': { value: 'class_hif1', opts: { selectedAttr: '{thirdAttr}', class_hif1: 'true' } },
                    '11': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '12': { value: 'advice', opts: { enhance: '1', purchase_ssr: '1', purchase_drink: '4' } },
                    '13': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest13_1st}', 'hif_test_{secondAttr}': '{hifTest13_2nd}', 'hif_test_{thirdAttr}': '{hifTest13_3rd}' } },
                    '14': { value: 'goout_hif', opts: { goout_hif2: 'true' } },
                    '15': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '16': { value: 'gift_hif', opts: {} },
                    '17': { value: 'class_hif1', opts: { selectedAttr: '{thirdAttr}', class_hif1: 'true' } },
                    '18': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{thirdAttr}' } },
                    '19': { value: 'advice', opts: { delete: '1', purchase_drink: '4' } },
                    '20': { value: 'test', opts: { 'hif_test_{firstAttr}': '{hifTest20_1st}', 'hif_test_{secondAttr}': '{hifTest20_2nd}', 'hif_test_{thirdAttr}': '{hifTest20_3rd}' } },
                    '21': { value: 'class_hif1', opts: { selectedAttr: '{firstAttr}', class_hif1: 'true' } },
                    '22': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '23': { value: 'gift_hif', opts: {} },
                    '24': { value: 'class_hif1', opts: { selectedAttr: '{firstAttr}', class_hif1: 'true' } },
                    '25': { value: 'lessondan', opts: { sp: 'true', selectedSubAttr: '{firstAttr}' } },
                    '26': { value: 'advice', opts: { purchase_drink: '6', purchase_ssr: '1' } },
                    '27': { value: 'round_hif', opts: {} },
                    '28': { value: 'advice_hif', opts: { purchase_drink: '2', purchase_ssr: '1' } },
                    '29': { value: 'round_hif', opts: {} }
                }
            }
        },
        // HIF Sense 플랜 특화 데이터 (스킬셋)
        sense: {
            calcState: {
                planSkills: {
                    sense: {
                        "free-ssr4": 1,
                        "sense-ssr11": 1,
                        "sense-ssr3": 1,
                        "sense-sr13": 1,
                        "sense-sr12": 1,
                        "sense-sr10": 1,
                        "sense-sr8": 1,
                        "sense-sr6alt": 1,
                        "sense-r11": 1,
                        "sense-ssr4": 1,
                        "sense-sr20": 1,
                        "sense-sr16": 1,
                        "sense-r13": 1,
                        "sense-ssr9": 1,
                        "sense-ssr6": 1,
                        "sense-ssr5": 1,
                        "sense-ssr7": 1
                    }
                }
            }
        },
        // HIF Logic 플랜 특화 데이터 (스킬셋)
        logic: {
            calcState: {
                planSkills: {
                    logic: {
                        "logic-ssr13": 2,
                        "logic-ssr7": 1,
                        "logic-ssr6": 1,
                        "logic-ssr2alt": 1,
                        "logic-ssr5": 1,
                        "logic-ssr10": 2,
                        "free-ssr4": 1,
                        "logic-sr18": 1,
                        "logic-sr17": 1,
                        "logic-sr14": 1,
                        "logic-sr15": 1,
                        "logic-sr6alt": 1,
                        "logic-sr3alt": 1,
                        "logic-ssr3": 1,
                        "logic-ssr4": 1
                    }
                }
            }
        },
        // HIF Anomaly 플랜 특화 데이터 (스킬셋)
        anomaly: {
            calcState: {
                planSkills: {
                    anomaly: {
                        "anomaly-ssr1alt": 1,
                        "anomaly-ssr2alt": 1,
                        "anomaly-ssr7": 1,
                        "anomaly-ssr8": 1,
                        "anomaly-ssr11": 1,
                        "free-ssr1": 1,
                        "free-ssr4": 1,
                        "anomaly-sr17": 1,
                        "anomaly-sr9": 1,
                        "anomaly-sr8": 1,
                        "anomaly-sr3alt": 1,
                        "anomaly-sr4alt": 1,
                        "anomaly-sr1alt": 1,
                        "anomaly-r11": 3,
                        "anomaly-ssr6": 1
                    }
                }
            }
        }
    }
};

/**
 * 지정된 모드, 아이돌, 플랜타입에 매핑되는 가이드 프리셋 데이터를 생성하여 반환합니다.
 * 정의된 데이터가 없을 경우 기본 빈 구조의 프리셋을 생성합니다.
 */
export function getGuidePreset(mode, idol, planType, slotId = 'guide') {
    const defaultState = {
        type: mode,
        selectedIdol: idol,
        planType: planType,
        weeks: {},
        planCards: { sense: [], logic: [], anomaly: [] },
        planSkills: { sense: {}, logic: {}, anomaly: {} },
        cardChecked: {},
        cardExtraChecked: {},
        cardEventChecked: {},
        itemCounters: {},
        manualEnhance: {},
        manualDelete: {},
        pItems: [null, null, null, null, null],
        pItemSubOpts: [null, null, null, null, null],
        pItemSubSubOpts: [null, null, null, null, null],
        pItemChecked: {},
        isSR: false,
        memories: [null, null, null, null],
        isKyouka: false,
        lockCards: {},
        hifStats: { vocal: 10, dance: 10, visual: 10, hp: 10, lesson: 0, sp: 0 },
        hifParamLimitLevel: 0,
        updatedAt: Date.now()
    };

    // 캐릭터의 1속성(속성 우선순위 1순위) 판정
    const idolInfo = idolData[idol];
    let firstAttr = '';
    let secondAttr = '';
    let thirdAttr = '';
    if (idolInfo && idolInfo.priority) {
        firstAttr = idolInfo.priority[0];
        secondAttr = idolInfo.priority[1];
        thirdAttr = idolInfo.priority[2];
    }

    // 1. 우선순위 로드 및 병합 (default 공용 뼈대 + 플랜별 특약 세팅 + 아이돌별 개별 세팅)
    // 댄스가 1속성(firstAttr === 'dance')이면 guide2 요청이더라도 default1과 그대로 동일하게 작동
    const defaultKey = (mode === 'hif' && slotId === 'guide2' && firstAttr !== 'dance') ? 'default2' : 'default';
    const defaultData = guidePresets[mode]?.[defaultKey] || {};
    const planData = guidePresets[mode]?.[planType] || {};
    const idolDataPreset = guidePresets[mode]?.[idol]?.[planType] || {};

    const baseCalcState = {
        ...(defaultData.calcState || {}),
        ...(planData.calcState || {}),
        ...(idolDataPreset.calcState || {})
    };

    // 하위 객체 (planSkills, planCards 등) 정밀 병합
    if (planData.calcState?.planSkills || idolDataPreset.calcState?.planSkills) {
        baseCalcState.planSkills = {
            ...(defaultData.calcState?.planSkills || {}),
            ...(planData.calcState?.planSkills || {}),
            ...(idolDataPreset.calcState?.planSkills || {})
        };
    }
    if (planData.calcState?.planCards || idolDataPreset.calcState?.planCards) {
        baseCalcState.planCards = {
            ...(defaultData.calcState?.planCards || {}),
            ...(planData.calcState?.planCards || {}),
            ...(idolDataPreset.calcState?.planCards || {})
        };
    }

    // 2. 템플릿 플레이스홀더를 캐릭터 실제 속성 정보로 동적 치환
    let calcStateStr = JSON.stringify(baseCalcState);
    if (firstAttr) {

        let thirdAttrPItem = '';
        if (thirdAttr === 'vocal') thirdAttrPItem = 'hajime1-1';
        else if (thirdAttr === 'dance') thirdAttrPItem = 'hajime1-2';
        else if (thirdAttr === 'visual') thirdAttrPItem = 'hajime1-3';

        let firstAttrLesson = '';
        if (firstAttr === 'vocal') firstAttrLesson = 'lessonvo';
        else if (firstAttr === 'dance') firstAttrLesson = 'lessondan';
        else if (firstAttr === 'visual') firstAttrLesson = 'lessonvi';

        let secondAttrLesson = '';
        if (secondAttr === 'vocal') secondAttrLesson = 'lessonvo';
        else if (secondAttr === 'dance') secondAttrLesson = 'lessondan';
        else if (secondAttr === 'visual') secondAttrLesson = 'lessonvi';

        // HIF 시험 점수 동적 계산 (최저치 + 유동분 배분)
        const hifTestConfig = [
            { week: 7, max: 140, min: 20 },
            { week: 13, max: 440, min: 80 },
            { week: 20, max: 520, min: 100 }
        ];
        hifTestConfig.forEach(({ week, max, min }) => {
            const flex = max - min * 3;
            let v1st, v2nd, v3rd;
            if (mode === 'hif' && slotId === 'guide2' && firstAttr !== 'dance') {
                // 가이드 프리셋 2번 (댄스가 1속성이 아닐 때): 1속 70%, 댄스 10%, 나머지 20% 배분
                v1st = String(min + Math.round(flex * 0.70));
                if (secondAttr === 'dance') {
                    v2nd = String(min + Math.round(flex * 0.10)); // 댄스 10%
                    v3rd = String(min + Math.round(flex * 0.20)); // 나머지 3속성 20%
                } else {
                    v2nd = String(min + Math.round(flex * 0.20)); // 나머지 2속성 20%
                    v3rd = String(min + Math.round(flex * 0.10)); // 댄스 10%
                }
            } else {
                // 가이드 프리셋 1번 기본형: 1속 20%, 2속 70%, 3속 10% 배분
                v1st = String(min + Math.round(flex * 0.20));
                v2nd = String(min + Math.round(flex * 0.70));
                v3rd = String(min + Math.round(flex * 0.10));
            }
            calcStateStr = calcStateStr
                .replace(new RegExp(`\\{hifTest${week}_1st\\}`, 'g'), v1st)
                .replace(new RegExp(`\\{hifTest${week}_2nd\\}`, 'g'), v2nd)
                .replace(new RegExp(`\\{hifTest${week}_3rd\\}`, 'g'), v3rd);
        });

        // HIF 가이드 프리셋 2 전용 메모리 템플릿 치환 (1속이 dance면 그대로, 아니면 1속/dance 2.8%, 나머지 20)
        if (mode === 'hif' && slotId === 'guide2') {
            let m1, m2, m3;
            if (firstAttr === 'dance') {
                m1 = 'dance28p';
                m2 = secondAttr + '28p';
                m3 = thirdAttr + '20';
            } else {
                m1 = firstAttr + '28p';
                m2 = 'dance28p';
                const other = firstAttr === 'vocal' ? 'visual' : 'vocal';
                m3 = other + '20';
            }
            calcStateStr = calcStateStr
                .replace(/\{hif2Mem1\}/g, m1)
                .replace(/\{hif2Mem2\}/g, m2)
                .replace(/\{hif2Mem3\}/g, m3);
        }

        // HIF 가이드 프리셋 2에서 3속성이 dance이고 댄스 레슨 고정으로 인해 서브 속성마저 dance가 되는 현상(중복) 방지
        if (mode === 'hif' && slotId === 'guide2' && thirdAttr === 'dance') {
            calcStateStr = calcStateStr.replace(/"selectedSubAttr"\s*:\s*"\{thirdAttr\}"/g, `"selectedSubAttr": "${secondAttr}"`);
        }

        // HIF 가이드 프리셋 2에서 3속성이 dance일 때, 수업/영업에서 3속성 대신 다른 속성(2속성)을 선택하도록 우회
        if (mode === 'hif' && slotId === 'guide2' && thirdAttr === 'dance') {
            calcStateStr = calcStateStr.replace(/"selectedAttr"\s*:\s*"\{thirdAttr\}"/g, `"selectedAttr": "${secondAttr}"`);
        }

        calcStateStr = calcStateStr
            .replace(/\{firstAttr\}/g, firstAttr)
            .replace(/\{secondAttr\}/g, secondAttr)
            .replace(/\{thirdAttr\}/g, thirdAttr)
            .replace(/\{firstAttrLesson\}/g, firstAttrLesson)
            .replace(/\{secondAttrLesson\}/g, secondAttrLesson)
            .replace(/\{thirdAttrPItem\}/g, thirdAttrPItem)
            .replace(/\{fixedPItem2\}/g, 'hajime2');
    }

    let parsedCalcState = {};
    try {
        parsedCalcState = JSON.parse(calcStateStr);
    } catch (e) {
        console.error("Failed to parse resolved calcState template:", e);
    }

    const mergedState = {
        ...defaultState,
        ...parsedCalcState,
        weeks: parsedCalcState.weeks ? { ...parsedCalcState.weeks } : defaultState.weeks,
        memories: parsedCalcState.memories ? [...parsedCalcState.memories] : defaultState.memories,
        pItems: parsedCalcState.pItems ? [...parsedCalcState.pItems] : defaultState.pItems,
        type: mode,
        selectedIdol: idol,
        planType: planType,
        updatedAt: Date.now()
    };

    // HIF 가이드 프리셋 2(guide2)의 경우, 댄스가 1속성인 캐릭터라도 P아이템은 hif3-1-1로 강제 고정
    if (mode === 'hif' && slotId === 'guide2') {
        mergedState.pItems = ['hif3'];
        mergedState.pItemSubOpts = ['hif3-1'];
        mergedState.pItemSubSubOpts = ['hif3-1-1'];
    }

    const lang = state.currentLang || 'ko';
    const defaultDesc = DEFAULT_DESCRIPTIONS[lang] || DEFAULT_DESCRIPTIONS.ko;

    let modePrefix = '';
    if (mode === 'hif') {
        modePrefix = 'HIF';
    } else if (mode === 'nia') {
        modePrefix = lang === 'ko' ? 'NIA' : 'NIA';
    } else if (mode === 'hajime') {
        modePrefix = lang === 'ko' ? '하지메' : (lang === 'ja' ? '初' : 'HAJIME');
    }

    let customName = '가이드 프리셋';
    if (mode === 'hif' && slotId === 'guide2') {
        if (lang === 'ja') {
            customName = 'ガイドプリセット (ダンス+ドリンク)';
        } else if (lang === 'en') {
            customName = 'Guide Preset (Dance+Drink)';
        } else {
            customName = '가이드 프리셋 (댄스+드링크)';
        }
    } else {
        if (lang === 'ja') {
            customName = modePrefix ? `${modePrefix} ガイドプリセット` : 'ガイドプリセット';
        } else if (lang === 'en') {
            customName = modePrefix ? `${modePrefix} Guide Preset` : 'Guide Preset';
        } else {
            customName = modePrefix ? `${modePrefix} 가이드 프리셋` : '가이드 프리셋';
        }
    }

    const resolvedDescription = idolDataPreset.description || planData.description || defaultData.description || defaultDesc;
    const resolvedFinalStats = idolDataPreset.finalStats || planData.finalStats || defaultData.finalStats || { vocal: 0, dance: 0, visual: 0, total: 0 };
    const resolvedPercentBonus = idolDataPreset.percentBonus || planData.percentBonus || defaultData.percentBonus || { vocal: 0, dance: 0, visual: 0 };

    const finalPreset = {
        slotId: slotId,
        customName: customName,
        type: mode,
        timestamp: 'SYSTEM',
        description: resolvedDescription,
        calcState: mergedState,
        finalStats: resolvedFinalStats,
        percentBonus: resolvedPercentBonus
    };

    return finalPreset;
}
