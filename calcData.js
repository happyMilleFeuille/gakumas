// calcData.js
export const calcPlans = {
    hajime: {
        title: "Hajime",
        weeks: {
            1: [{ value: "class_hajime" }],
            2: [{ value: "class_hajime" }],
            3: [{ value: "goout_hajime"}, { value: "gift_hajime", results: ["get", "get_drink"]}],
            4: [{ value: "lessonvo",results:["get","get_drink"]}, { value: "lessondan",results:["get","get_drink"]}, { value: "lessonvi",results:["get","get_drink"]}],
            5: [{ value: "goout_hajime"}, { value: "advice"}, { value: "gift_hajime", results: ["get", "get_drink"]}],
            6: [{ value: "class_hajime" }],                     
            7: [{ value: "lessonvo",results:["get","get_drink"]}, { value: "lessondan",results:["get","get_drink"]}, { value: "lessonvi",results:["get","get_drink"]}],      
            8: [{ value: "advice"}],                
            9: [{ value: "spclass"}],         
            10: [{ value: "test",results:["get","get","get","get","get_item"]}],
            11: [{ value: "goout_hajime"}, { value: "gift_hajime", results: ["get", "get_drink"]}],    
            12: [{ value: "lessonvo",results:["get","get_drink"]}, { value: "lessondan",results:["get","get_drink"]}, { value: "lessonvi",results:["get","get_drink"]}],    
            13: [{ value: "goout_hajime"}, { value: "advice"}, { value: "gift_hajime", results: ["get", "get_drink"]}],     
            14: [{ value: "lessonvo",results:["get","get_drink"]}, { value: "lessondan",results:["get","get_drink"]}, { value: "lessonvi",results:["get","get_drink"]}],  
            15: [{ value: "class_hajime"}],          
            16: [{ value: "lessonvo",results:["get","get_drink"]}, { value: "lessondan",results:["get","get_drink"]}, { value: "lessonvi",results:["get","get_drink"]}],                                                                                              
            17: [{ value: "advice"}, { value: "spclass"}],            
            18: [{ value: "test"}]
        }
    },
    nia: {
        title: "nia",
        weeks: {
            1: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],
            2: [{ value: "class_nia" }],
            3: [{ value: "goout_nia"}, { value: "gift_nia", results:["get","get_drink"]}],
            4: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],
            5: [{ value: "class_nia"}],
            6: [{ value: "goout_nia"}, { value: "advice"}],                     
            7: [{ value: "class_nia"}],      
            8: [{ value: "spclass"}],                
            9: [{ value: "audition",results:["get","get","get","get","get_item"]}],         
            10: [{ value: "goout_nia"}, { value: "gift_nia", results:["get","get_drink"]}],
            11: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],    
            12: [{ value: "class_nia"}],    
            13: [{ value: "goout_nia"}, { value: "advice"}, { value: "gift_nia", results:["get","get_drink"]}],     
            14: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],  
            15: [{ value: "class_nia"}],          
            16: [{ value: "spclass"}],                                                                                              
            17: [{ value: "audition",results:["get_item"]}],            
            18: [{ value: "goout_nia"}, { value: "gift_nia", results:["get","get_drink"]}], 
            19: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],                        
            20: [{ value: "class_nia"}],
            21: [{ value: "advice"}, { value: "gift_nia", results:["get","get_drink"]}, { value: "spclass"}],     
            22: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],  
            23: [{ value: "class_nia"}],                                                 
            24: [{ value: "lessonvo"}, { value: "lessondan"}, { value: "lessonvi"}],  
            25: [{ value: "goout_nia"}, { value: "advice"}, { value: "spclass"}],      
            26: [{ value: "audition"}]
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

export const idolData = {
    'saki': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 16.5, danceBonus: 16.5, visualBonus: 20.5 },
    'temari': { priority: ['vocal', 'dance', 'visual'], growthType: 'protruded', vocalBonus: 24.0, danceBonus: 21.5, visualBonus: 8.5 },
    'kotone': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 8.0, danceBonus: 24.5, visualBonus: 22.5 },
    'tsubame': { priority: ['dance', 'vocal', 'visual'], growthType: 'protruded', vocalBonus: 15, danceBonus: 20, visualBonus: 12 },
    'mao': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 22.0, danceBonus: 8.0, visualBonus: 23.0 },
    'lilja': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 18.0, danceBonus: 20.0, visualBonus: 18.0 },
    'china': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 10.0, danceBonus: 24.0, visualBonus: 20.5 },
    'sumika': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 9.0, danceBonus: 23.0, visualBonus: 23.0 },
    'hiro': { priority: ['vocal', 'dance', 'visual'], growthType: 'balanced', vocalBonus: 23.0, danceBonus: 19.5, visualBonus: 10.0 },
    'sena': { priority: ['visual', 'vocal', 'dance'], growthType: 'balanced', vocalBonus: 15.0, danceBonus: 8.0, visualBonus: 20.5 },
    'misuzu': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 27.0, danceBonus: 10.0, visualBonus: 18.0 },
    'ume': { priority: ['dance', 'vocal', 'visual'], growthType: 'balanced', vocalBonus: 20.0, danceBonus: 23.0, visualBonus: 15.0 },
    'rinami': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 11.0, danceBonus: 21.5, visualBonus: 23.5 }
};

export const judgingRatios = {
    hajime: {
        1: { protruded: { circle: [625, 441, 341] }, balanced: { circle: [560, 419, 370] } },
        2: { protruded: { circle: [1924, 1281, 1065]}, balanced: { circle: [1834, 1361, 1065] } }
    },
    nia: {
        1: { protruded: { circle: [332, 200, 133] }, balanced: { circle: [264, 218, 179] } },
        2: { protruded: { circle: [738, 443, 296]}, balanced: { circle: [587, 484, 397] } },
        3: { protruded: { circle: [1389, 834, 556] }, balanced: { circle: [1105, 912, 746] } }
    }
};
