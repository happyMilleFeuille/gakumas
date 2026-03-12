// calcData.js
export const calcPlans = {
    hajime: {
        title: "Hajime",
        weeks: {
            1: [{ value: "class_hajime" }],
            2: [{ value: "class_hajime" }],
            3: [{ value: "goout_hajime" }, { value: "gift_hajime", results: ["get", "get_drink"] }],
            4: [{ value: "lessonvo", results: ["get", "get_drink"] }, { value: "lessondan", results: ["get", "get_drink"] }, { value: "lessonvi", results: ["get", "get_drink"] }],
            5: [{ value: "goout_hajime" }, { value: "advice" }, { value: "gift_hajime", results: ["get", "get_drink"] }],
            6: [{ value: "class_hajime" }],
            7: [{ value: "lessonvo", results: ["get", "get_drink"] }, { value: "lessondan", results: ["get", "get_drink"] }, { value: "lessonvi", results: ["get", "get_drink"] }],
            8: [{ value: "advice" }],
            9: [{ value: "spclass" }],
            10: [{ value: "test", results: ["get", "get", "get", "get", "get_item"] }],
            11: [{ value: "goout_hajime" }, { value: "gift_hajime", results: ["get", "get_drink"] }],
            12: [{ value: "lessonvo", results: ["get", "get_drink"] }, { value: "lessondan", results: ["get", "get_drink"] }, { value: "lessonvi", results: ["get", "get_drink"] }],
            13: [{ value: "goout_hajime" }, { value: "advice" }, { value: "gift_hajime", results: ["get", "get_drink"] }],
            14: [{ value: "lessonvo", results: ["get", "get_drink"] }, { value: "lessondan", results: ["get", "get_drink"] }, { value: "lessonvi", results: ["get", "get_drink"] }],
            15: [{ value: "class_hajime" }],
            16: [{ value: "lessonvo", results: ["get", "get_drink"] }, { value: "lessondan", results: ["get", "get_drink"] }, { value: "lessonvi", results: ["get", "get_drink"] }],
            17: [{ value: "advice" }, { value: "spclass" }],
            18: [{ value: "test" }]
        }
    },
    nia: {
        title: "nia",
        weeks: {
            1: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            2: [{ value: "class_nia" }],
            3: [{ value: "goout_nia" }, { value: "gift_nia", results: ["get", "get_drink"] }],
            4: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            5: [{ value: "class_nia" }],
            6: [{ value: "goout_nia" }, { value: "advice" }],
            7: [{ value: "class_nia" }],
            8: [{ value: "spclass" }],
            9: [{ value: "audition", results: ["get", "get", "get", "get", "get_item"] }],
            10: [{ value: "goout_nia" }, { value: "gift_nia", results: ["get", "get_drink"] }],
            11: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            12: [{ value: "class_nia" }],
            13: [{ value: "goout_nia" }, { value: "advice" }, { value: "gift_nia", results: ["get", "get_drink"] }],
            14: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            15: [{ value: "class_nia" }],
            16: [{ value: "spclass" }],
            17: [{ value: "audition", results: ["get_item"] }],
            18: [{ value: "goout_nia" }, { value: "gift_nia", results: ["get", "get_drink"] }],
            19: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            20: [{ value: "class_nia" }],
            21: [{ value: "advice" }, { value: "gift_nia", results: ["get", "get_drink"] }, { value: "spclass" }],
            22: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            23: [{ value: "class_nia" }],
            24: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            25: [{ value: "goout_nia" }, { value: "advice" }, { value: "spclass" }],
            26: [{ value: "audition" }]
        }
    }
};

export const baseStats = {
    test: { vocal: 0, dance: 0, visual: 0 },
    audition: { vocal: 0, dance: 0, visual: 0 },
    initial: { vocal: 0, dance: 0, visual: 0 },
    lessonvo: { vocal: 0, dance: 0, visual: 0 }, // 기본값
    lessondan: { vocal: 0, dance: 0, visual: 0 },
    lessonvi: { vocal: 0, dance: 0, visual: 0 }
};

export const niaAuditionStats = {
    1: { protruded: [116, 69, 46], balanced: [92, 76, 62] },
    2: { protruded: [149, 89, 59], balanced: [119, 98, 80] },
    3: { protruded: [215, 129, 86], balanced: [172, 142, 116] }
};

export const hajimeLessonStats = {
    4:  { sp: [140, 55, 55], normal: [110, 50, 50] },
    7:  { sp: [180, 60, 60], normal: [144, 53, 53] },
    12: { sp: [260, 70, 70], normal: [214, 58, 58] },
    14: { sp: [370, 90, 90], normal: [320, 75, 75] },
    16: { sp: [570, 115, 115], normal: [504, 108, 108] }
};

export const niaLessonStats = [
    { maxWeek: 8,  sp: 100, normal: 80 },
    { maxWeek: 16, sp: 120, normal: 100 },
    { maxWeek: 99, sp: 150, normal: 120 }
];

export const hajimeClassStats = {
    1: 100,
    2: 100,
    6: 150,
    15: 200
};

export const niaClassStats = {
    2: 80,
    5: 80,
    7: 80,
    12: 110,
    15: 110,
    20: 130,
    23: 130
};

export const idolData = {
    'saki': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 16.5, danceBonus: 16.5, visualBonus: 20.5, baseVocal: 100, baseDance: 100, baseVisual: 105, vocalBonus3: 19.5, danceBonus3: 19.5, visualBonus3: 22.5 },
    'temari': { priority: ['vocal', 'dance', 'visual'], growthType: 'protruded', vocalBonus: 24.0, danceBonus: 21.5, visualBonus: 8.5, baseVocal: 120, baseDance: 100, baseVisual: 80, vocalBonus3: 27, danceBonus3: 26.5, visualBonus3: 8.5 },
    'kotone': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 8.0, danceBonus: 24.5, visualBonus: 22.5, vocalBonus3: 8, danceBonus3: 29.5, visualBonus3: 25.5, baseVocal: 90, baseDance: 90, baseVisual: 120 },
    'tsubame': { priority: ['dance', 'vocal', 'visual'], growthType: 'protruded', vocalBonus: 15, danceBonus: 20, visualBonus: 12, vocalBonus3: 19, danceBonus3: 24, visualBonus3: 12, baseVocal: 115, baseDance: 140, baseVisual: 110 },
    'mao': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 22.0, danceBonus: 8.0, visualBonus: 23.0, vocalBonus3: 25, danceBonus3: 8, visualBonus3: 28, baseVocal: 125, baseDance: 90, baseVisual: 100 },
    'lilja': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 18.0, danceBonus: 20.0, visualBonus: 18.0, vocalBonus3: 18, danceBonus3: 25, visualBonus3: 21, baseVocal: 80, baseDance: 100, baseVisual: 115 },
    'china': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 10.0, danceBonus: 24.0, visualBonus: 20.5, vocalBonus3: 10, danceBonus3: 29, visualBonus3: 23.5, baseVocal: 75, baseDance: 115, baseVisual: 125 },
    'sumika': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 9.0, danceBonus: 23.0, visualBonus: 23.0, vocalBonus3: 9, danceBonus3: 28, visualBonus3: 26, baseVocal: 100, baseDance: 115, baseVisual: 90 },
    'hiro': { priority: ['vocal', 'dance', 'visual'], growthType: 'balanced', vocalBonus: 23.0, danceBonus: 19.5, visualBonus: 10.0, vocalBonus3: 28, danceBonus3: 24.5, visualBonus3: 10, baseVocal: 125, baseDance: 120, baseVisual: 80 },
    'sena': { priority: ['visual', 'vocal', 'dance'], growthType: 'balanced', vocalBonus: 15.0, danceBonus: 8.0, visualBonus: 20.5, vocalBonus3: 17, danceBonus3: 8, visualBonus3: 24.5, baseVocal: 175, baseDance: 125, baseVisual: 140 },
    'misuzu': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 27.0, danceBonus: 10.0, visualBonus: 18.0, vocalBonus3: 31, danceBonus3: 10, visualBonus3: 20, baseVocal: 85, baseDance: 125, baseVisual: 135 },
    'ume': { priority: ['dance', 'vocal', 'visual'], growthType: 'balanced', vocalBonus: 20.0, danceBonus: 23.0, visualBonus: 15.0, vocalBonus3: 23, danceBonus3: 28, visualBonus3: 15, baseVocal: 90, baseDance: 95, baseVisual: 100 },
    'rinami': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 11.0, danceBonus: 21.5, visualBonus: 23.5, vocalBonus3: 11, danceBonus3: 24.5, visualBonus3: 28.5, baseVocal: 85, baseDance: 110, baseVisual: 110 }
};

export const judgingRatios = {
    hajime: {
        1: { protruded: { circle: [625, 441, 341] }, balanced: { circle: [560, 419, 370] } },
        2: { protruded: { circle: [1924, 1281, 1065] }, balanced: { circle: [1834, 1361, 1065] } }
    },
    nia: {
        1: { protruded: { circle: [332, 200, 133] }, balanced: { circle: [264, 218, 179] } },
        2: { protruded: { circle: [738, 443, 296] }, balanced: { circle: [587, 484, 397] } },
        3: { protruded: { circle: [1389, 834, 556] }, balanced: { circle: [1105, 912, 746] } }
    }
};

export const memoryOptions = {
    vocal25: { label_ko: "Vo +25", label_ja: "Vo +25", stat: "vocal", value: 25, type: "vocal" },
    vocal20: { label_ko: "Vo +20", label_ja: "Vo +20", stat: "vocal", value: 20, type: "vocal" },
    vocal15: { label_ko: "Vo +15", label_ja: "Vo +15", stat: "vocal", value: 15, type: "vocal" },
    vocal10: { label_ko: "Vo +10", label_ja: "Vo +10", stat: "vocal", value: 10, type: "vocal" },
    vocal35p: { label_ko: "Vo +3.5%", label_ja: "Vo +3.5%", stat: "vocal", value: 3.5, type: "vocal", isPercent: true },
    vocal28p: { label_ko: "Vo +2.8%", label_ja: "Vo +2.8%", stat: "vocal", value: 2.8, type: "vocal", isPercent: true },
    vocal21p: { label_ko: "Vo +2.1%", label_ja: "Vo +2.1%", stat: "vocal", value: 2.1, type: "vocal", isPercent: true },
    vocal14p: { label_ko: "Vo +1.4%", label_ja: "Vo +1.4%", stat: "vocal", value: 1.4, type: "vocal", isPercent: true },

    dance25: { label_ko: "Da +25", label_ja: "Da +25", stat: "dance", value: 25, type: "dance" },
    dance20: { label_ko: "Da +20", label_ja: "Da +20", stat: "dance", value: 20, type: "dance" },
    dance15: { label_ko: "Da +15", label_ja: "Da +15", stat: "dance", value: 15, type: "dance" },
    dance10: { label_ko: "Da +10", label_ja: "Da +10", stat: "dance", value: 10, type: "dance" },
    dance35p: { label_ko: "Da +3.5%", label_ja: "Da +3.5%", stat: "dance", value: 3.5, type: "dance", isPercent: true },
    dance28p: { label_ko: "Da +2.8%", label_ja: "Da +2.8%", stat: "dance", value: 2.8, type: "dance", isPercent: true },
    dance21p: { label_ko: "Da +2.1%", label_ja: "Da +2.1%", stat: "dance", value: 2.1, type: "dance", isPercent: true },
    dance14p: { label_ko: "Da +1.4%", label_ja: "Da +1.4%", stat: "dance", value: 1.4, type: "dance", isPercent: true },

    visual25: { label_ko: "Vi +25", label_ja: "Vi +25", stat: "visual", value: 25, type: "visual" },
    visual20: { label_ko: "Vi +20", label_ja: "Vi +20", stat: "visual", value: 20, type: "visual" },
    visual15: { label_ko: "Vi +15", label_ja: "Vi +15", stat: "visual", value: 15, type: "visual" },
    visual10: { label_ko: "Vi +10", label_ja: "Vi +10", stat: "visual", value: 10, type: "visual" },
    visual35p: { label_ko: "Vi +3.5%", label_ja: "Vi +3.5%", stat: "visual", value: 3.5, type: "visual", isPercent: true },
    visual28p: { label_ko: "Vi +2.8%", label_ja: "Vi +2.8%", stat: "visual", value: 2.8, type: "visual", isPercent: true },
    visual21p: { label_ko: "Vi +2.1%", label_ja: "Vi +2.1%", stat: "visual", value: 2.1, type: "visual", isPercent: true },
    visual14p: { label_ko: "Vi +1.4%", label_ja: "Vi +1.4%", stat: "visual", value: 1.4, type: "visual", isPercent: true }
};

if (typeof window !== 'undefined') {
    window.calcData = window.calcData || {};
    window.calcData.memoryOptions = memoryOptions;
}
