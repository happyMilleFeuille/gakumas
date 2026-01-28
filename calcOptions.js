// calcOptions.js
// 각 활동(value)별로 나타날 툴팁 옵션들을 정의합니다.

const enhanceSubOpts = [
    { id: "enhance_m", results: ["enhance_m"],label_ko: "멘탈 강화", label_ja: "メンタルカード強化", type: "checkbox" },
    { id: "enhance_a", results: ["enhance_a"],label_ko: "액티브 강화", label_ja: "アクティブカード強化", type: "checkbox" },
];

const changeSubOpts = [
    { id: "change_m", results: ["change_m", "change"],label_ko: "멘탈 체인지", label_ja: "メンタルカードチェンジ", type: "checkbox" },
    { id: "change_a", results: ["change_m", "change"],label_ko: "액티브 체인지", label_ja: "アクティブカードチェンジ", type: "checkbox" },
];

const deleteSubOpts = [
    { id: "delete_m", results: ["delete_m"],label_ko: "멘탈 삭제", label_ja: "メンタルカード削除", type: "checkbox" },
    { id: "delete_a", results: ["delete_a"],label_ko: "액티브 삭제", label_ja: "アクティブカード削除", type: "checkbox" },
];

export const activityOptions = {
    class_hajime: [  
        { id: "class_hajime1", mainlabel: "Change",label_ko: "카드 체인지", label_ja: "カードチェンジ", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },  
    ],
    class_nia: [
        { id: "get_drink", mainlabel: "Drink",label_ko: "드링크 선택", label_ja: "ドリンク選択", type: "checkbox" },
        { id: "get_enhancedcard", mainlabel: "Card",label_ko: "강화카드 선택", label_ja: "強化カード選択", type: "checkbox" },
        { id: "get_ppoint", mainlabel: "Ppoint",label_ko: "P포인트 선택", label_ja: "Pポイント選択", type: "checkbox" },                
    ],
    goout_nia: [
        { id: "goout_nia1", results: ["enhance","get"],label_ko: "카드강화, 트러블 추가", label_ja: "カード強化・トラブルカード獲得", type: "checkbox"},
        { id: "goout_nia2", results: ["enhance","get_drink"],label_ko: "(-100)카드강화, 드링크 획득", label_ja: "(-100)カード強化・ドリンク獲得", type: "checkbox"},        
        { id: "goout_nia3", results: ["change","get_drink","get_drink"],label_ko: "(-50)체인지, 드링크 2개 획득", label_ja: "(-50)カードチェンジ・ドリンク2つ獲得", type: "checkbox"},        
        { id: "goout_nia4", results: ["enhance"],label_ko: "카드강화", label_ja: "カード強化", type: "checkbox"},        
        { id: "goout_nia5", results: ["delete","get_drink","get_drink"],label_ko: "(-50)기본카드 삭제, 드링크 2개 획득", label_ja: "(-50)名前に「基本」を含むカード削除・ドリンク2つ獲得", type: "checkbox"},             
        { id: "goout_nia6", results: ["get_drink"],label_ko: "드링크 획득", label_ja: "ドリンク獲得", type: "checkbox" },             
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },    
    ],    
    lessonvo: [
        { id: "sp", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },          
    ],
    lessondan: [
        { id: "sp", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },          
    ],
    lessonvi: [
        { id: "sp", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },          
    ],
    advice: [
        { id: "enhance", results: ["enhance"],mainlabel: "enhance",label_ko: "강화", label_ja: "カード強化", type: "counter", max:2},
        { id: "delete", results: ["delete"],mainlabel: "del",label_ko: "삭제", label_ja: "カード削除", type: "counter", max:2},                
        { id: "purchase_ssr",results: ["get"], mainlabel: "Card",label_ko: "카드 구매", label_ja: "カード交換", type: "counter", max:8},        
        { id: "purchase_drink",results: ["purchase_drink", "get_drink"], mainlabel: "Drink",label_ko: "드링크 구매", label_ja: "ドリンク獲得", type: "counter", max:8},
    ],    
    spclass: [
        { id: "spclass_customize", mainlabel: "Custom",label_ko: "카드 개조", label_ja: "カスタマイズ", type: "counter", max:6},
    ],        
};