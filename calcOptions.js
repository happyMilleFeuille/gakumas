// calcOptions.js
// 각 활동(value)별로 나타날 툴팁 옵션들을 정의합니다.

const enhanceSubOpts = [
    { id: "enhance_m", label_ko: "멘탈 강화", label_ja: "メンタルカード強化", type: "checkbox" },
    { id: "enhance_a", label_ko: "액티브 강화", label_ja: "アクティブカード強化", type: "checkbox" },
    { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" }
];

const changeSubOpts = [
    { id: "change_m", label_ko: "멘탈 체인지", label_ja: "メンタルカードチェンジ", type: "checkbox" },
    { id: "change_a", label_ko: "액티브 체인지", label_ja: "アクティブカードチェンジ", type: "checkbox" },
    { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" }
];

const deleteSubOpts = [
    { id: "delete_m", label_ko: "멘탈 삭제", label_ja: "メンタルカード削除", type: "checkbox" },
    { id: "delete_a", label_ko: "액티브 삭제", label_ja: "アクティブカード削除", type: "checkbox" },
    { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" }
];

export const activityOptions = {
    class_hajime: [  
        { id: "change", mainlabel: "Change",label_ko: "카드 체인지", label_ja: "カードチェンジ", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },  
    ],
    class_nia: [
        { id: "get_drink", mainlabel: "Drink",label_ko: "드링크 선택", label_ja: "ドリンク選択", type: "checkbox" },
        { id: "not", label_ko: "해당 없음", label_ja: "該当なし", type: "checkbox" },    
    ],
    goout_nia: [
        { id: "goout_nia1", label_ko: "카드강화, 트러블 추가", label_ja: "カード強化・トラブルカード獲得", type: "checkbox", subOptions: enhanceSubOpts },
        { id: "goout_nia2", label_ko: "카드강화, 드링크 획득", label_ja: "カード強化・ドリンク獲得", type: "checkbox", subOptions: enhanceSubOpts },        
        { id: "goout_nia3", label_ko: "체인지, 드링크 2개 획득", label_ja: "カードチェンジ・ドリンク2つ獲得", type: "checkbox", subOptions: changeSubOpts },        
        { id: "goout_nia4", label_ko: "카드강화", label_ja: "カード強化", type: "checkbox", subOptions: enhanceSubOpts },        
        { id: "goout_nia5", label_ko: "기본카드 삭제, 드링크 2개 획득", label_ja: "名前に「基本」を含むカード削除・ドリンク2つ獲得", type: "checkbox", subOptions: deleteSubOpts },             
        { id: "goout_nia6", label_ko: "드링크 획득", label_ja: "ドリンク獲得", type: "checkbox" },             
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
        { id: "enhance_m", mainlabel: "enhance",label_ko: "멘탈 강화", label_ja: "メンタルカード強化", type: "counter", max:2},
        { id: "enhance_a", mainlabel: "enhance",label_ko: "액티브 강화", label_ja: "アクティブカード強化", type: "counter", max:2},        
        { id: "delete_m", mainlabel: "delm",label_ko: "멘탈 삭제", label_ja: "メンタルカード削除", type: "counter", max:2},        
        { id: "delete_a", mainlabel: "dela",label_ko: "액티브 삭제", label_ja: "アクティブカード削除", type: "counter", max:2},             
        { id: "purchase_ssr", mainlabel: "Card_SSR",label_ko: "SSR카드 구매", label_ja: "SSRカード交換", type: "counter", max:8},        
        { id: "purchase_a", mainlabel: "Card_A",label_ko: "액티브카드 구매", label_ja: "アクティブカード交換", type: "counter", max:8},        
        { id: "purchase_m", mainlabel: "Card_M",label_ko: "멘탈카드 구매", label_ja: "メンタルカード交換", type: "counter", max:8},
        { id: "purchase_drink", mainlabel: "Drink",label_ko: "드링크 구매", label_ja: "ドリンク獲得", type: "counter", max:8},
    ],    
    spclass: [
        { id: "spclass_customize", mainlabel: "Custom",label_ko: "카드 개조", label_ja: "カスタマイズ", type: "counter", max:6},
    ],        
};