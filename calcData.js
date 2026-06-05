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
    },
    hif: {
        title: "hif",
        weeks: {
            1: [{ value: "advice" }, { value: "gift_hif", results: ["get", "get_drink"] }, { value: "spclass" }],
            2: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            3: [{ value: "class_hif0" }],
            4: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            5: [{ value: "goout_hif" }, { value: "advice" }],
            6: [{ value: "class_hif0" }],
            7: [{ value: "test", results: ["get", "get", "get", "get", "get_item", "delete", "delete"] }],
            8: [{ value: "goout_hif" }, { value: "gift_hif", results: ["get", "get_drink"] }],
            9: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            10: [{ value: "class_hif1" }],
            11: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            12: [{ value: "advice" }, { value: "spclass" }],
            13: [{ value: "test", results: ["delete", "delete"] }],
            14: [{ value: "goout_hif" }, { value: "gift_hif", results: ["get", "get_drink"] }],
            15: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            16: [{ value: "goout_hif" }, { value: "advice" }, { value: "gift_hif", results: ["get", "get_drink"] }],
            17: [{ value: "class_hif1" }],
            18: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            19: [{ value: "advice" }, { value: "spclass" }],
            20: [{ value: "test", results: [] }],
            21: [{ value: "class_hif1" }],
            22: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            23: [{ value: "goout_hif" }, { value: "gift_hif", results: ["get", "get_drink"] }],
            24: [{ value: "class_hif1" }],
            25: [{ value: "lessonvo" }, { value: "lessondan" }, { value: "lessonvi" }],
            26: [{ value: "advice" }],
            27: [{ value: "round_hif", results: ["get_item"] }],
            28: [{ value: "advice_hif" }],
            29: [{ value: "round_hif" }],



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
    4: { sp: [140, 55, 55], normal: [110, 50, 50] },
    7: { sp: [180, 60, 60], normal: [144, 53, 53] },
    12: { sp: [260, 70, 70], normal: [214, 58, 58] },
    14: { sp: [370, 90, 90], normal: [320, 75, 75] },
    16: { sp: [570, 115, 115], normal: [504, 108, 108] }
};

export const niaLessonStats = [
    { maxWeek: 8, sp: 100, normal: 80 },
    { maxWeek: 16, sp: 120, normal: 100 },
    { maxWeek: 99, sp: 150, normal: 120 }
];

export const hifLessonStats = {

    byWeek: {
        2: { sp: 60, normal: 50, subSp: 20, subNormal: 10 },
        4: { sp: 80, normal: 60, subSp: 50, subNormal: 20 },
        9: { sp: 80, normal: 70, subSp: 20, subNormal: 10 },
        11: { sp: 100, normal: 80, subSp: 60, subNormal: 30 },
        15: { sp: 100, normal: 90, subSp: 20, subNormal: 10 },
        18: { sp: 120, normal: 100, subSp: 70, subNormal: 40 },
        22: { sp: 120, normal: 110, subSp: 20, subNormal: 10 },
        25: { sp: 140, normal: 120, subSp: 80, subNormal: 50 },
    }
};

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

export const hifClassStats = {
    3: 120,
    6: 120,
    10: 150,
    17: 150,
    21: 180,
    24: 180,
};

export const hifTestStats = {
    7: { first: null, second: null, third: null },
    13: { first: null, second: null, third: null },
    20: { first: null, second: null, third: null }
};

export const hifParameterLimitBonuses = [0, 50, 80, 110, 140, 170, 200];

export const idolData = {
    'saki': {
        priority: ['visual', 'dance', 'vocal'], growthType: 'balanced',
        // 기본 스텟
        baseStats: {
            ssr: { vocal: 100, dance: 100, visual: 105 },
            sr: { vocal: 95, dance: 95, visual: 100 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 3.0, dance: 3.0, visual: 3.0 }
            },
            20: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 1.5, dance: 1.5, visual: 2.5 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 12.0, dance: 12.0, visual: 15.0 },
                bloom3: { vocal: 3.0, dance: 3.0, visual: 2.0 } // +3.0%, +3.0%, +2.0% 추가
            },
            sr: {
                base: { vocal: 12.0, dance: 12.0, visual: 13.0 },
                bloom3: { vocal: 2.0, dance: 2.0, visual: 1.0 } // +2.0%, +2.0%, +1.0% 추가
            }
        }
    },
    'temari': {
        priority: ['vocal', 'dance', 'visual'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 100, dance: 90, visual: 80 },
            sr: { vocal: 95, dance: 85, visual: 75 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 10, dance: 0, visual: 0 },
                bonus: { vocal: 0, dance: 5.0, visual: 0 }
            },
            20: {
                base: { vocal: 10, dance: 10, visual: 0 },
                bonus: { vocal: 0, dance: 0.5, visual: 2.5 }
            },
            37: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 3, dance: 1, visual: 3 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 24.0, dance: 16.0, visual: 6.0 },
                bloom3: { vocal: 3.0, dance: 5.0, visual: 0 } // +3.0%, +5.0% 추가
            },
            sr: {
                base: { vocal: 24.0, dance: 15.0, visual: 5.0 },
                bloom3: { vocal: 2.0, dance: 3.0, visual: 0 }  // +2.0%, +3.0% 추가
            }
        }
    },
    'kotone': {
        priority: ['dance', 'visual', 'vocal'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 90, dance: 80, visual: 100 },
            sr: { vocal: 85, dance: 75, visual: 95 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 0, visual: 10 },
                bonus: { vocal: 0, dance: 6.0, visual: 0 }
            },
            20: {
                base: { vocal: 0, dance: 10, visual: 10 },
                bonus: { vocal: 2.0, dance: 0.5, visual: 0.5 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 6.0, dance: 18.0, visual: 22.0 },
                bloom3: { vocal: 0, dance: 5.0, visual: 3.0 } // +5.0%, +3.0% 추가
            },
            sr: {
                base: { vocal: 5.0, dance: 17.0, visual: 22.0 },
                bloom3: { vocal: 0, dance: 3.0, visual: 2.0 }  // +3.0%, +2.0% 추가
            }
        }
    },
    'tsubame': {
        priority: ['dance', 'vocal', 'visual'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 105, dance: 115, visual: 95 },
            sr: { vocal: 100, dance: 110, visual: 90 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 10, dance: 20, visual: 0 },
                bonus: { vocal: 1.0, dance: 3.0, visual: 0 }
            },
            20: {
                base: { vocal: 0, dance: 5, visual: 15 },
                bonus: { vocal: 2.0, dance: 0, visual: 1.0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 14.0, dance: 17.0, visual: 12.0 },
                bloom3: { vocal: 2.0, dance: 4.0, visual: 0 } // +2.0%, +4.0% 추가
            },
            sr: {
                base: { vocal: 13.0, dance: 16.0, visual: 11.0 },
                bloom3: { vocal: 2.0, dance: 4.0, visual: 0 }  // +2.0%, +4.0% 추가
            }
        }
    },
    'mao': {
        priority: ['vocal', 'visual', 'dance'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 100, dance: 90, visual: 80 },
            sr: { vocal: 95, dance: 85, visual: 75 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 10, dance: 0, visual: 10 },
                bonus: { vocal: 0, dance: 0, visual: 5.0 }
            },
            20: {
                base: { vocal: 15, dance: 0, visual: 10 },
                bonus: { vocal: 0, dance: 2.0, visual: 0 }
            },
            37: {
                base: { vocal: 0, dance: 0, visual: 15 },
                bonus: { vocal: 1, dance: 3, visual: 1 }
            }

        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 22.0, dance: 6.0, visual: 18.0 },
                bloom3: { vocal: 3.0, dance: 0, visual: 5.0 } // +3.0%, +5.0% 추가
            },
            sr: {
                base: { vocal: 21.0, dance: 5.0, visual: 18.0 },
                bloom3: { vocal: 2.0, dance: 0, visual: 3.0 }  // +2.0%, +3.0% 추가
            }
        }
    },
    'lilja': {
        priority: ['visual', 'dance', 'vocal'], growthType: 'balanced',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 75, dance: 75, visual: 85 },
            sr: { vocal: 70, dance: 70, visual: 80 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 0, visual: 20 },
                bonus: { vocal: 4.0, dance: 4.0, visual: 0 }
            },
            20: {
                base: { vocal: 5, dance: 25, visual: 10 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            },
            37: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 14.0, dance: 16.0, visual: 18.0 },
                bloom3: { vocal: 0, dance: 5.0, visual: 3.0 } // +5.0%, +3.0% 추가
            },
            sr: {
                base: { vocal: 13.0, dance: 16.0, visual: 17.0 },
                bloom3: { vocal: 0, dance: 3.0, visual: 2.0 }  // +3.0%, +2.0% 추가
            }
        }
    },
    'china': {
        priority: ['dance', 'visual', 'vocal'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 75, dance: 75, visual: 80 },
            sr: { vocal: 70, dance: 70, visual: 75 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 35, visual: 35 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            },
            20: {
                base: { vocal: 0, dance: 5, visual: 10 },
                bonus: { vocal: 0, dance: 1.0, visual: 1.5 }
            },
            37: {
                base: { vocal: 20, dance: 10, visual: 10 },
                bonus: { vocal: 3.0, dance: 0, visual: 1.0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 10.0, dance: 23.0, visual: 19.0 },
                bloom3: { vocal: 0, dance: 5.0, visual: 3.0 } // +5.0%, +3.0% 추가
            },
            sr: {
                base: { vocal: 10.0, dance: 23.0, visual: 17.0 },
                bloom3: { vocal: 0, dance: 3.0, visual: 2.0 }  // +3.0%, +2.0% 추가
            }
        }
    },
    'sumika': {
        priority: ['dance', 'visual', 'vocal'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 90, dance: 80, visual: 90 },
            sr: { vocal: 85, dance: 75, visual: 85 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 5, visual: 0 },
                bonus: { vocal: 0, dance: 3.0, visual: 3.0 }
            },
            20: {
                base: { vocal: 10, dance: 30, visual: 0 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            },
            37: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 9.0, dance: 20.0, visual: 20.0 },
                bloom3: { vocal: 0, dance: 5.0, visual: 3.0 } // +5.0%, +3.0% 추가
            },
            sr: {
                base: { vocal: 8.0, dance: 20.0, visual: 19.0 },
                bloom3: { vocal: 0, dance: 3.0, visual: 2.0 }  // +3.0%, +2.0% 추가
            }
        }
    },
    'hiro': {
        priority: ['vocal', 'dance', 'visual'], growthType: 'balanced',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 75, dance: 75, visual: 80 },
            sr: { vocal: 70, dance: 70, visual: 75 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 40, dance: 40, visual: 0 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            },
            20: {
                base: { vocal: 10, dance: 5, visual: 0 },
                bonus: { vocal: 1.0, dance: 1.5, visual: 0 }
            },
            37: {
                base: { vocal: 5, dance: 5, visual: 15 },
                bonus: { vocal: 2.0, dance: 0, visual: 3.0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 22.0, dance: 18.0, visual: 10.0 },
                bloom3: { vocal: 5.0, dance: 5.0, visual: 0 } // +5.0%, +5.0% 추가
            },
            sr: {
                base: { vocal: 22.0, dance: 17.0, visual: 9.0 },
                bloom3: { vocal: 3.0, dance: 3.0, visual: 0 }  // +3.0%, +3.0% 추가
            }
        }
    },
    'sena': {
        priority: ['visual', 'vocal', 'dance'], growthType: 'balanced',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 155, dance: 125, visual: 130 },
            sr: { vocal: 145, dance: 115, visual: 120 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 20, dance: 0, visual: 10 },
                bonus: { vocal: 3.0, dance: 0, visual: 1.0 }
            },
            20: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 1.0, dance: 2.0, visual: 2.5 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 11.0, dance: 6.0, visual: 17.0 },
                bloom3: { vocal: 2.0, dance: 0, visual: 4.0 } // +2.0%, +4.0% 추가
            },
            sr: {
                base: { vocal: 10.0, dance: 5.0, visual: 16.0 },
                bloom3: { vocal: 2.0, dance: 0, visual: 4.0 }  // +2.0%, +4.0% 추가
            }
        }
    },
    'misuzu': {
        priority: ['vocal', 'visual', 'dance'], growthType: 'protruded',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 85, dance: 90, visual: 100 },
            sr: { vocal: 80, dance: 85, visual: 95 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 25, visual: 25 },
                bonus: { vocal: 4.0, dance: 0, visual: 0 }
            },
            20: {
                base: { vocal: 0, dance: 10, visual: 10 },
                bonus: { vocal: 1.0, dance: 0, visual: 2.0 }
            },
            37: {
                base: { vocal: 10, dance: 0, visual: 5 },
                bonus: { vocal: 0, dance: 3, visual: 2.0 }
            },

        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 22.0, dance: 10.0, visual: 16.0 },
                bloom3: { vocal: 4.0, dance: 0, visual: 2.0 } // +4.0%, +2.0% 추가
            },
            sr: {
                base: { vocal: 21.0, dance: 9.0, visual: 15.0 },
                bloom3: { vocal: 4.0, dance: 0, visual: 2.0 }  // +4.0%, +2.0% 추가
            }
        }
    },
    'ume': {
        priority: ['dance', 'vocal', 'visual'], growthType: 'balanced',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 75, dance: 85, visual: 85 },
            sr: { vocal: 70, dance: 80, visual: 80 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 0, visual: 0 },
                bonus: { vocal: 3.0, dance: 3.0, visual: 3.0 }
            },
            20: {
                base: { vocal: 15, dance: 10, visual: 15 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            }
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 17.0, dance: 20.0, visual: 12.0 },
                bloom3: { vocal: 3.0, dance: 5.0, visual: 0 } // +3.0%, +5.0% 추가
            },
            sr: {
                base: { vocal: 16.0, dance: 20.0, visual: 11.0 },
                bloom3: { vocal: 2.0, dance: 3.0, visual: 0 }  // +2.0%, +3.0% 추가
            }
        }
    },
    'rinami': {
        priority: ['visual', 'dance', 'vocal'], growthType: 'balanced',
        // 기본 스텟 (친밀도 보너스 제외, 레벨 50 기준)
        baseStats: {
            ssr: { vocal: 85, dance: 95, visual: 80 },
            sr: { vocal: 80, dance: 90, visual: 75 }
        },
        // 친밀도 보너스 (항상 합산 적용)
        affinity: {
            10: {
                base: { vocal: 0, dance: 0, visual: 5 },
                bonus: { vocal: 0, dance: 2.5, visual: 2.5 }
            },
            20: {
                base: { vocal: 0, dance: 15, visual: 25 },
                bonus: { vocal: 0, dance: 0, visual: 0 }
            },
            37: {
                base: { vocal: 0, dance: 10, visual: 15 },
                bonus: { vocal: 2, dance: 0, visual: 2 }
            },
        },
        // 보너스 % (단계별)
        bonus: {
            ssr: {
                base: { vocal: 11.0, dance: 19.0, visual: 21.0 },
                bloom3: { vocal: 0, dance: 3.0, visual: 5.0 } // +3.0%, +5.0% 추가
            },
            sr: {
                base: { vocal: 10.0, dance: 18.0, visual: 21.0 },
                bloom3: { vocal: 0, dance: 2.0, visual: 3.0 }  // +2.0%, +3.0% 추가
            }
        }
    },
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
    },
    hif: {
        1: { protruded: { circle: [312, 208, 174] }, balanced: { circle: [297, 222, 173] } },
        2: { protruded: { circle: [614, 411, 342] }, balanced: { circle: [586, 436, 341] } },
        3: { protruded: { circle: [1036, 691, 576] }, balanced: { circle: [989, 736, 575] } },
        4: { protruded: { circle: [1961, 1308, 1090] }, balanced: { circle: [1872, 1393, 1089] } }
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

// HIF 모드 프리마 스텔라 해금 캐릭터 리스트
export const hifPrimaStellaIdols = ['mao', 'misuzu', 'rinami', 'temari', 'china', 'hiro', 'lilja', 'sumika'];

