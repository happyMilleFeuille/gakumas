// calcOptions.js
// 각 활동(value)별로 나타날 툴팁 옵션들을 정의합니다.

export const activityOptions = {
    class1: [
        { id: "change", mainlabel: "Change",label_ko: "카드 체인지", label_ja: "カードチェンジ", type: "checkbox" }
    ],
    class2: [
        { id: "get_drink", mainlabel: "Drink",label_ko: "드링크 획득", label_ja: "ドリンク獲得", type: "checkbox" }
    ],
    lessonvo: [
        { id: "sp_param", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" }
    ],
    lessondan: [
        { id: "sp_param", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" }
    ],
    lessonvi: [
        { id: "sp_param", label_ko: "SP 레슨", label_ja: "SPレッスン", type: "checkbox" }
    ],
    advice: [
        { id: "enhance", mainlabel: "enhance",label_ko: "카드 강화", label_ja: "カード強化", type: "counter", max:2},
        { id: "delete", mainlabel: "delete",label_ko: "카드 삭제", label_ja: "カード削除", type: "counter", max:2},        
        { id: "get_ssr", mainlabel: "Card_SSR",label_ko: "SSR카드 구매", label_ja: "SSRカード交換", type: "counter", max:8},        
        { id: "get_active", mainlabel: "Card_A",label_ko: "액티브카드 구매", label_ja: "アクティブカード交換", type: "counter", max:8},        
        { id: "get_mental", mainlabel: "Card_M",label_ko: "멘탈카드 구매", label_ja: "メンタルカード交換", type: "counter", max:8},
        { id: "purchase_drink", mainlabel: "Drink",label_ko: "드링크 구매", label_ja: "ドリンク獲得", type: "counter", max:8},
    ],    
    spclass: [
        { id: "spclass_customize", mainlabel: "customize",label_ko: "카드 개조", label_ja: "カスタマイズ", type: "counter", max:6},
    ],        
};