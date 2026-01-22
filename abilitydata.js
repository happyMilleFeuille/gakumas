// abilitydata.js
export const abilityData = {
    "hpmax": {
        format: { ko: "최대체력상승+{val}", ja: "最大体力上昇+{val}" },
        levels: {
            "SSR": {1: 9, 2: 9,},
            "SSR_DIST": {1: 9, 2: 9},
            "SR": {1: 3, 2: 3},
        }
    },
    "percentparam": {
        format: { ko: "{type} 파라미터 보너스+{val}%", ja: "{type}パラメータボーナス+{val}%" },
        levels: {
            "SSR": {1: 6.5,2: 7,3: 7.5,4: 8,5: 8.5},            
            "SR": {1: 4.4, 2: 4.9,3: 5.4,4: 5.9,5: 6.4},               
        }
    },
    "fixedparam": {
        format: { ko: "초기 {type} 상승+{val}", ja: "初期{type}上昇+{val}" },
        levels: {
            "SSR": {1: 51,2: 56, 3: 59,4: 62,5: 65},            
            "SR": {1: 37, 2: 40,3: 43,4: 46,5: 49},               
        }
    },           
    "allsp_lessonup": {
        format: { ko: "보컬, 댄스, 비쥬얼 모든 SP레슨 발생률+{val}%", ja: "ボーカル、ダンス、ビジュアルすべてのSPレッスン発生率+{val}%" },
        levels: {
            "SSR": {1: 10.5, 2: 14 },
            "SSR_DIST": {1: 0, 2: 0 },
            "SR": { 1: 0, 2: 0 }
        }
    },
    "sp_lessonup": {
        format: { ko: "{type} SP레슨 발생률+{val}%", ja: "{type}SPレッスン発生率+{val}%" },
        levels: {
            "SSR": {1: 21, 2: 28 },
            "SSR_DIST": {1: 14, 2: 21 },
            "SR": { 1: 10.5, 2:21 }
        }
    },    
    "sp_param": {
        format: { ko: "{type} SP레슨 종료시 {type} 상승+{val}", ja: "{type}SPレッスン終了時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 13, 2: 17 },
            "SSR_DIST": {1: 9, 2: 13 },
            "SR": { 1: 7, 2:13 }
        }
    },  
    "sp_param20": {
        format: { ko: "SP레슨 종료시 소지한 카드가 20장 이상인 경우, {type} 상승+{val} (프로듀스 중 4회)", ja: "SPレッスン終了時、所持スキルカードが20枚以上の場合、{type}上昇+{val} (プロヂュース中4回)" },
        levels: {
            "SSR": {1: 15, 2: 21},
            "SSR_DIST": {1: 0, 2: 0 },
            "SR": { 1: 8, 2: 15 }
        }
    },      
    "lesson_param": {
        format: { ko: "{type} 레슨 종료시 {type} 상승+{val}", ja: "{type}レッスン終了時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 4, 2: 6 },
            "SSR_DIST": {1: 3, 2: 4 },
            "SR": { 1: 2, 2:4 }
        }
    },            
    "normallesson_param": {
        format: { ko: "{type} 통상레슨 종료시 {type} 상승+{val}", ja: "{type}通常レッスン終了時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 0, 2: 0 },
            "SSR_DIST": {1: 0, 2: 0 },
            "SR": { 1: 7, 2:13 }
        }
    },     
    "supportrateup": {
        format: { ko: "해당 서포트 카드의 스킬 카드 서포트 발생률 {val}% 증가", ja: "このサポートカードのスキルカードサポート発生率を{val}%増加" },
        levels: {
            "SSR": {1: 66.1,2: 74.6,3: 83.1,4: 91.5,5: 100},            
            "SR": {1: 59.2, 2: 69.4,3: 79.6,4: 89.8,5: 100},               
        }
    },
    "event_paraup": {
        format: { ko: "해당 서포트 카드의 이벤트로 인한 파라미터 상승량 {val}% 증가", ja: "このサポートカードのイベントによるパラメータ上昇を{val}%増加" },
        levels: {
            1: 50,
            2: 75,
            3: 100
        }
    },
    "event_recoveryup": {
        format: { ko: "해당 서포트 카드의 이벤트로 인한 회복량 {val}% 증가", ja: "このサポートカードのイベントによる体力回復量を{val}%増加" },
        levels: {
            1: 50,
            2: 75,
            3: 100
        }
    },    
    "alllesson_ppoint": {
        format: { ko: "레슨종료 시 P포인트 획득량 증가 +{val}%", ja: "レッスン終了時、Pポイント獲得量増加+{val}%" },
        levels: {
            "SSR": {1: 16.5,2: 22},     
            "SSR_DIST": {1: 0, 2: 0 },                   
            "SR": {1: 8.3, 2: 16.5 },         
        }
    },
    "ppoint": {
        format: { ko: "초기 P포인트+{val}", ja: "初期Pポイント+{val}" },
        levels: {
            "SSR": {1: 30,2: 40},     
            "SSR_DIST": {1: 15, 2: 30 },                   
            "SR": {1: 15, 2: 30 },         
        }
    },
    "sp_ppoint": {
        format: { ko: "{type} SP레슨 종료 시, P포인트 획득량 증가+{val}%", ja: "{type}SPレッスン終了時、Pポイント獲得量増加+{val}%" },
        levels: {
            "SSR": {1: 33,2: 45},     
            "SSR_DIST": {1: 22, 2: 33 },                   
            "SR": {1: 0, 2: 0 },               
        }
    },     
    "allsp_recovery": {
        format: { ko: "SP레슨 종료 시, 체력회복+{val}", ja: "SPレッスン終了時、体力回復+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 0, 2:  0},                   
            "SR": {1: 0, 2: 0 },              
        }
    },
    "sp_recovery": {
        format: { ko: "{type} SP레슨 종료 시, 체력회복+{val}", ja: "{type}SPレッスン終了時、体力回復+{val}" },
        levels: {
            "SSR": {1: 5,2: 7},     
            "SSR_DIST": {1: 4, 2: 5 },                   
            "SR": {1: 3, 2: 5 },    
        }
    },    
    "test_recovery": {
        format: { ko: "시험・오디션 종료 시, 체력회복+{val} (프로듀스 중 1회)", ja: "試験・オーディション終了時、体力回復+{val} (プロヂュース中1回)" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 6 },                   
            "SR": {1: 0, 2: 0 }, 
        }
    } ,  
    "enhance": {
        format: { ko: "카드 강화 시 {type} 상승+{val}", ja: "スキルカード強化時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3 },                   
            "SR": {1: 2, 2: 3 },               
        }
    },         
    "enhance_mental": {
        format: { ko: "멘탈 카드 강화 시 {type} 상승+{val}", ja: "メンタルスキルカード強化時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 7,2: 9},     
            "SSR_DIST": {1: 5, 2: 7 },                   
            "SR": {1: 4, 2: 6 },               
        }
    },     
    "enhance_active": {
        format: { ko: "액티브 카드 강화 시 {type} 상승+{val}", ja: "アクティブスキルカード強化時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 7,2: 9},     
            "SSR_DIST": {1: 5, 2: 7 },                   
            "SR": {1: 4, 2: 6 },               
        }
    },
    "get": {
        format: { ko: "카드 획득 시 {type} 상승+{val}", ja: "スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 0,2: 0},     
            "SSR_DIST": {1: 0, 2: 0 },                   
            "SR": {1: 1, 2: 2 },               
        }
    },
    "get_mental": {
        format: { ko: "멘탈 카드 획득 시 {type} 상승+{val}", ja: "メンタルスキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 2,2: 3},     
            "SSR_DIST": {1: 1, 2: 2},                   
            "SR": {1: 1, 2: 2 },               
        }
    },
    "get_active": {
        format: { ko: "액티브 카드 획득 시 {type} 상승+{val}", ja: "アクティブスキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 2,2: 3},     
            "SSR_DIST": {1: 1, 2: 2},                   
            "SR": {1: 1, 2: 2 },               
        }
    },
    "get_goodcondition": {
        format: { ko: "호조 카드 획득 시 {type} 상승+{val}", ja: "好調キルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },               
        }
    },
    "get_concentration": {
        format: { ko: "집중 카드 획득 시 {type} 상승+{val}", ja: "集中スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_goodimpression": {
        format: { ko: "호인상 카드 획득 시 {type} 상승+{val}", ja: "好印象スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_motivation": {
        format: { ko: "의욕 카드 획득 시 {type} 상승+{val}", ja: "やる気スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_genki": {
        format: { ko: "원기 카드 획득 시 {type} 상승+{val}", ja: "元気スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },                                 
    "get_enthusiasm": {
        format: { ko: "강기 카드 획득 시 {type} 상승+{val}", ja: "強気スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_preservation": {
        format: { ko: "온존 카드 획득 시 {type} 상승+{val}", ja: "温存スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_fullpower": {
        format: { ko: "전력 카드 획득 시 {type} 상승+{val}", ja: "全力スキルカード獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 3,2: 4},     
            "SSR_DIST": {1: 2, 2: 3},                   
            "SR": {1: 2, 2: 3 },                
        }
    },
    "get_ssr": {
        format: { ko: "SSR 카드 획득 시 {type} 상승+{val}", ja: "スキルカード(SSR)獲得時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 5,2: 6},     
            "SSR_DIST": {1: 3, 2: 5},                   
            "SR": {1: 3, 2: 5 },                
        }
    },
    "get_item": {
        format: { ko: "P아이템 획득 시 {type} 상승+{val} (프로듀스 중 6회)", ja: "Pアイテム獲得時、{type}上昇+{val} (プロヂュース中6回)" },
        levels: {
            "SSR": {1: 11,2: 15},     
            "SSR_DIST": {1: 8, 2: 11},                   
            "SR": {1: 6, 2: 11 },                
        }
    },    
    "gift": {
        format: { ko: "활동지급・사시이레 선택 시 {type} 상승+{val}", ja: "活動支給・差し入れ選択時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 12,2: 17},     
            "SSR_DIST": {1: 0, 2: 0},                   
            "SR": {1: 6, 2: 11 },                
        }
    },
    "gift_recovery": {
        format: { ko: "활동지급・사시이레 선택 시 체력회복+{val}", ja: "活動支給・差し入れ選択時、体力回復+{val}" },
        levels: {
            "SSR": {1: 0,2: 0},     
            "SSR_DIST": {1: 3, 2: 4},                   
            "SR": {1: 0, 2: 0 },                
        }
    },    
    "goout": {
        format: { ko: "외출 종료 시 {type} 상승+{val}", ja: "おでかけ終了時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 11,2: 15},     
            "SSR_DIST": {1: 8, 2: 11},                   
            "SR": {1: 5, 2: 10 },                
        }
    },
    "class": {
        format: { ko: "수업・영업 종료 시 {type} 상승+{val}", ja: "授業・営業終了時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 5,2: 7},     
            "SSR_DIST": {1: 4, 2: 5},                   
            "SR": {1: 3, 2: 5 },                
        }
    },
    "advice": {
        format: { ko: "상담 선택 시 {type} 상승+{val}", ja: "相談選択時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 14,2: 18},     
            "SSR_DIST": {1: 9, 2: 14},                   
            "SR": {1: 7, 2: 14 },                
        }
    },
    "rest": {
        format: { ko: "휴식 선택 시 {type} 상승+{val}", ja: "休む選択時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 17,2: 22},     
            "SSR_DIST": {1: 11, 2: 17},                   
            "SR": {1: 9, 2: 17 },                
        }
    } ,
    "test": {
        format: { ko: "시험・오디션 종료 시 {type} 상승+{val} (프로듀스 중 1회)", ja: "試験・オーディション終了時、{type}上昇+{val} (プロヂュース中1回)" },
        levels: {
            "SSR": {1: 17,2: 22},     
            "SSR_DIST": {1: 11, 2: 17},                   
            "SR": {1: 9, 2: 17 },                  
        }
    },
    "delete": {
        format: { ko: "카드 삭제 시 {type} 상승+{val}", ja: "スキルカード削除時、{type}上昇+{val}" },
        levels: {
            "SSR": {1: 8,2: 11},     
            "SSR_DIST": {1: 6, 2: 8},                   
            "SR": {1: 4, 2: 8 },                  
        }
    }                                                                     
};