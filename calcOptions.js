// calcOptions.js
// 각 활동(value)별로 나타날 툴팁 옵션들을 정의합니다.

export const activityOptions = {
    class_hajime: [
        { id: "class_hajime1", results: ["get_t", "change"], mainLabelKey: "calc_option_main_change", labelKey: "calc_option_class_hajime1", type: "checkbox" },
        { id: "class_hajime2", results: ["get"], labelKey: "calc_option_none", type: "checkbox" },
    ],
    class_hif1: [
        { id: "class_hif1", results: ["change"], mainLabelKey: "calc_option_main_change", labelKey: "calc_option_class_hif1", type: "checkbox" },
        { id: "class_hif2", results: ["get_t", "change"], mainlabel: "change_t", labelKey: "calc_option_class_hif2", type: "checkbox" },
    ],
    class_hif0: [
        { id: "class_hajime1", results: ["get_t", "change"], mainLabelKey: "calc_option_main_change", labelKey: "calc_option_class_hajime1", type: "checkbox" },
        { id: "class_hajime2", results: ["get"], labelKey: "calc_option_none", type: "checkbox" },
    ],
    class_nia: [
        { id: "get_drink", results: ["get", "get_drink"], mainLabelKey: "calc_option_main_drink", labelKey: "calc_option_get_drink", type: "checkbox" },
        { id: "get_enhancedcard", results: ["get"], mainLabelKey: "calc_option_main_card", labelKey: "calc_option_get_enhancedcard", type: "checkbox" },
        { id: "get_ppoint", results: ["get"], mainLabelKey: "calc_option_main_ppoint", labelKey: "calc_option_get_ppoint", type: "checkbox" },
    ],
    goout_hajime: [
        { id: "goout_hajime1", results: ["enhance", "get_drink"], labelKey: "calc_option_goout_hajime1", type: "checkbox" },
        { id: "goout_hajime2", results: ["change", "get_drink", "get_t"], labelKey: "calc_option_goout_hajime2", type: "checkbox" },
    ],
    goout_nia: [
        { id: "goout_nia1", results: ["enhance", "get_t"], labelKey: "calc_option_goout_nia1", type: "checkbox" },
        { id: "goout_nia2", results: ["enhance", "get_drink"], labelKey: "calc_option_goout_nia2", type: "checkbox" },
        { id: "goout_nia3", results: ["change", "get_drink", "get_drink"], labelKey: "calc_option_goout_nia3", type: "checkbox" },
        { id: "goout_nia4", results: ["enhance"], labelKey: "calc_option_goout_nia4", type: "checkbox" },
        { id: "goout_nia5", results: ["delete", "get_drink", "get_drink"], labelKey: "calc_option_goout_nia5", type: "checkbox" },
        { id: "goout_nia6", results: ["get_drink"], labelKey: "calc_option_goout_nia6", type: "checkbox" },
        { id: "not", labelKey: "calc_option_none", type: "checkbox" },
    ],
    goout_hif: [
        { id: "goout_hif1", results: ["get_drink", "get", "get"], mainlabel: "-50p", labelKey: "calc_option_goout_hif1", type: "checkbox" },
        { id: "goout_hif2", results: ["get_drink", "get_t", "get", "get"], mainlabel: "get_t", labelKey: "calc_option_goout_hif2", type: "checkbox" },
        { id: "goout_hif3", results: ["get", "get_drink"], labelKey: "calc_option_goout_hif3", type: "checkbox" },
    ],
    lessonvo: [
        { id: "sp", labelKey: "calc_option_sp", type: "checkbox" },
        { id: "not", labelKey: "calc_option_none", type: "checkbox" },
    ],
    lessondan: [
        { id: "sp", labelKey: "calc_option_sp", type: "checkbox" },
        { id: "not", labelKey: "calc_option_none", type: "checkbox" },
    ],
    lessonvi: [
        { id: "sp", labelKey: "calc_option_sp", type: "checkbox" },
        { id: "not", labelKey: "calc_option_none", type: "checkbox" },
    ],
    advice: [
        { id: "enhance", results: ["enhance"], mainLabelKey: "calc_option_main_enhance", labelKey: "calc_option_advice_enhance", type: "counter", max: 2 },
        { id: "delete", results: ["delete"], mainLabelKey: "calc_option_main_delete", labelKey: "calc_option_advice_delete", type: "counter", max: 2 },
        { id: "purchase_ssr", results: ["get"], mainLabelKey: "calc_option_main_card", labelKey: "calc_option_purchase_ssr", type: "counter", max: 8 },
        { id: "purchase_drink", results: ["purchase_drink"], mainLabelKey: "calc_option_main_drink", labelKey: "calc_option_purchase_drink", type: "counter", max: 8 },
    ],
    advice_hif: [
        { id: "enhance", results: ["enhance"], mainLabelKey: "calc_option_main_enhance", labelKey: "calc_option_advice_enhance", type: "counter", max: 9 },
        { id: "change", results: ["change"], mainLabelKey: "calc_option_main_change", labelKey: "calc_option_advice_change", type: "counter", max: 9 },
        { id: "purchase_ssr", results: ["get"], mainLabelKey: "calc_option_main_card", labelKey: "calc_option_purchase_ssr", type: "counter", max: 9 },
        { id: "purchase_drink", results: ["get_drink"], mainLabelKey: "calc_option_main_drink", labelKey: "calc_option_purchase_drink", type: "counter", max: 9 },
        { id: "spclass_customize", results: ["customize"], mainLabelKey: "calc_option_main_customize", labelKey: "calc_option_spclass_customize", type: "counter", max: 9 },
    ],
    spclass: [
        { id: "spclass_customize", results: ["customize"], mainLabelKey: "calc_option_main_customize", labelKey: "calc_option_spclass_customize", type: "counter", max: 6 },
    ],
};
