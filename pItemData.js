export const pItemDescriptions = {
    nia: [
        { icons: ['nia1-1'], ko: '특별수업 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '特別レッスン時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Special Lesson (2 times per Produce)' },
        { icons: ['nia1-2'], ko: '상담 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '相談時、カード削除および獲得 (プロデュース중 2회)', en: 'Delete and obtain a card during Consultation (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia2-1'], ko: '영업(강화카드) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(強化カード)時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Promotion (Enhanced Card) (2 times per Produce)' },
        { icons: ['nia2-2'], ko: '영업(P포인트) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(Pポイント)時、カード削除および獲得 (プロデュース중 2회)', en: 'Delete and obtain a card during Promotion (P Points) (2 times per Produce)' },
        { icons: ['nia2-3'], ko: '영업(드링크) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(ドリンク)時、カード削除および獲得 (プロデュース중 2회)', en: 'Delete and obtain a card during Promotion (Drink) (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia3-1', 'nia3-2'], ko: '오디션 종료 시 카드 삭제 및 복제 (프로듀스 중 2회)', ja: 'オーディション終了時、カード削除およびコピー (プロデュース中2回)', en: 'Delete and copy a card after an Audition (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia4-1'], ko: '영업(강화카드) 시 카드 강화 (프로듀스 중 2회)', ja: '営業(強化カード)時、カードを強化 (プロデュース中2回)', en: 'Enhance a card during Promotion (Enhanced Card) (2 times per Produce)' },
        { icons: ['nia4-2'], ko: '영업(드링크) 시 드링크 2개 획득 (프로듀스 중 2회)', ja: '営業(ドリンク)時、ドリンク2個を獲得 (プロデュース중 2회)', en: 'Obtain 2 Drinks during Promotion (Drink) (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia5-1'], ko: 'SP레슨 종료 시 카드를 선택해 강화', ja: 'SPレッスン終了時、スキルカードを選択して強化', en: 'Choose a card to enhance after an SP Lesson' }
    ],
    hajime: [
        { icons: ['hajime1-1'], ko: '카드 획득 시 보컬 +15 (프로듀스 중 5회)', ja: 'カード獲得時Vo+15 (プロデュース中5回)', en: 'Vocal +15 when obtaining a card (5 times per Produce)' },
        { icons: ['hajime1-2'], ko: '카드 획득 시 댄스 +15 (프로듀스 중 5회)', ja: 'カード獲得時Da+15 (プロデュース中5回)', en: 'Dance +15 when obtaining a card (5 times per Produce)' },
        { icons: ['hajime1-3'], ko: '카드 획득 시 비주얼 +15 (프로듀스 중 5회)', ja: 'カード獲得時Vi+15 (プロデュース中5回)', en: 'Visual +15 when obtaining a card (5 times per Produce)' },
        { type: 'separator' },
        { icons: ['hajime2'], ko: '수업 시 카드 획득 (프로듀스 중 3회)', ja: '授業時にカード獲得 (プロデュース中3回)', en: 'Obtain a card during Class (3 times per Produce)' }
    ],
    hif: [
        {
            icons: ['hif1'],
            item_effects: [{ type: 'action', trigger: ['lesson'], targettext: ['hp6'], max: 2 }],
            subOptions: [
                {
                    id: 'hif1-1',
                    item_effects: [{ type: 'action', trigger: ['lesson'], target: "get_drink", targettext: ['hp6'], max: 2 }],
                    subOptions: [
                        { id: 'hif1-1-1', item_effects: [{ type: 'action', trigger: ['lesson'], target: "get_drink", targettext: ['hp6'], max: 2 }] },
                        { id: 'hif1-1-2', item_effects: [{ type: 'action', trigger: ['lesson'], target: "change", targettext: ['hp6'], max: 2 }] },
                        { id: 'hif1-1-3', item_effects: [{ type: 'action', trigger: ['lesson'], target: "get", targettext: ['hp12'], max: 1 }] },
                    ]
                },
                {
                    id: 'hif1-2',
                    item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['hp12', 'ppoint40'], max: 1 }],
                    subOptions: [
                        { id: 'hif1-2-1', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['hp12', 'drink50'], max: 1 }] },
                        { id: 'hif1-2-2', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['hp12', 'ppoint40', 'enhance50'], max: 1 }] },
                        { id: 'hif1-2-3', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['hp12', 'ppoint40', 'delete50'], max: 1 }] },
                        { id: 'hif1-2-4', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['hp12', 'ppoint20', 'get50'], max: 1 }] }
                    ]
                },
                {
                    id: 'hif1-3',
                    item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['hp12'], max: 1 }],
                    subOptions: [
                        { id: 'hif1-3-1', item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['hp12'], max: 1 }] },
                        { id: 'hif1-3-2', item_effects: [{ type: 'action', trigger: ['gift'], target: "get", targettext: ['hp12'], max: 1 }] },
                        { id: 'hif1-3-3', item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['hp6'], max: 1 }] },
                        { id: 'hif1-3-4', item_effects: [{ type: 'action', trigger: ['gift'], target: "get", targettext: ['hp6'], max: 1 }] }
                    ]
                },
                {
                    id: 'hif1-4',
                    item_effects: [{ type: 'action', trigger: ['goout'], target: "enhance", targettext: ['hp6'], max: 1 }],
                    subOptions: [
                        { id: 'hif1-4-1', item_effects: [{ type: 'action', trigger: ['goout'], target: "change", targettext: ['hp6'], max: 1 }] },
                        {
                            id: 'hif1-4-2', item_effects: [{ type: 'action', trigger: ['goout'], target: "get", display: { ko: "카드 복제", ja: "カードコピー", en: "Copy Card" }, targettext: ['hp6'], max: 1 }]
                        },
                        { id: 'hif1-4-3', item_effects: [{ type: 'action', trigger: ['goout'], target: "enhance", targettext: ['hp6'], max: 1 }] },
                        { id: 'hif1-4-4', item_effects: [{ type: 'action', trigger: ['goout'], target: "delete", targettext: ['hp6'], max: 1 }] }
                    ]
                }
            ]
        },
        {
            icons: ['hif2'],
            item_effects: [{ type: 'action', trigger: ['lesson'], targettext: ['ppoint30'], max: 2 }],
            subOptions: [
                {
                    id: 'hif2-1',
                    item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['ppoint60'], max: 1 }],
                    subOptions: [
                        { id: 'hif2-1-1', item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['ppoint60'], max: 1 }] },
                        { id: 'hif2-1-2', item_effects: [{ type: 'action', trigger: ['gift'], target: "get", targettext: ['ppoint60'], max: 1 }] },
                        { id: 'hif2-1-3', item_effects: [{ type: 'action', trigger: ['gift'], target: "change", targettext: ['ppoint30'], max: 1 }] },
                        { id: 'hif2-1-4', item_effects: [{ type: 'action', trigger: ['gift'], target: "get", targettext: ['ppoint30'], max: 1 }] }
                    ]
                },
                {
                    id: 'hif2-2',
                    item_effects: [{ type: 'action', trigger: ['goout'], target: "enhance", targettext: ['ppoint60'], max: 1 }],
                    subOptions: [
                        { id: 'hif2-2-1', item_effects: [{ type: 'action', trigger: ['goout'], target: "change", targettext: ['ppoint60'], max: 1 }] },
                        {
                            id: 'hif2-2-2', item_effects: [{ type: 'action', trigger: ['goout'], target: "get", display: { ko: "카드 복제", ja: "カードコピー", en: "Copy Card" }, targettext: ['ppoint60'], max: 1 }]
                        },
                        { id: 'hif2-2-3', item_effects: [{ type: 'action', trigger: ['goout'], target: "enhance", targettext: ['ppoint60'], max: 1 }] },
                        { id: 'hif2-2-4', item_effects: [{ type: 'action', trigger: ['goout'], target: "delete", targettext: ['ppoint60'], max: 1 }] }
                    ]
                },
                {
                    id: 'hif2-3',
                    item_effects: [{ type: 'action', trigger: ['lesson'], target: "get_drink", targettext: ['ppoint30'], max: 2 }],
                    subOptions: [
                        { id: 'hif2-3-1', item_effects: [{ type: 'action', trigger: ['lesson'], target: "get_drink", targettext: ['ppoint30'], max: 2 }] },
                        { id: 'hif2-3-2', item_effects: [{ type: 'action', trigger: ['lesson'], target: "change", targettext: ['ppoint30'], max: 2 }] },
                        { id: 'hif2-3-3', item_effects: [{ type: 'action', trigger: ['lesson'], target: "get", targettext: ['ppoint60'], max: 1 }] },
                    ]
                },
                {
                    id: 'hif2-4',
                    item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['ppoint100'], max: 1 }],
                    subOptions: [
                        { id: 'hif2-4-1', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['ppoint60', 'drink50'], max: 1 }] },
                        { id: 'hif2-4-2', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['ppoint100', 'enhance50'], max: 1 }] },
                        { id: 'hif2-4-3', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['ppoint100', 'delete50'], max: 1 }] },
                        { id: 'hif2-4-4', item_effects: [{ type: 'action', trigger: ['advice'], targettext: ['ppoint80', 'get50'], max: 1 }] }
                    ]
                }
            ]
        },
        {
            icons: ['hif3'],
            item_effects: [{ type: 'action', trigger: ['lesson'], target: "get_drink", max: 2 }],
            subOptions: [
                {
                    id: 'hif3-1',
                    item_effects: [{ type: 'action', trigger: ['lesson'], target: ["get_drink", "get_drink"], max: 2 }],
                    subOptions: [
                        { id: 'hif3-1-1', item_effects: [{ type: 'action', trigger: ['lesson'], target: ["get_drink", "get_drink"], max: 2 }] },
                        { id: 'hif3-1-2', item_effects: [{ type: 'action', trigger: ['lesson'], target: ["change", "get_drink"], max: 2 }] },
                        { id: 'hif3-1-3', item_effects: [{ type: 'action', trigger: ['lesson'], target: ["get", "get_drink", "get_drink"], max: 1 }] },
                    ]
                },
                {
                    id: 'hif3-2',
                    item_effects: [{ type: 'action', trigger: ['advice'], target: ["get_drink", "get_drink"], targettext: ['ppoint40'], max: 1 }],
                    subOptions: [
                        { id: 'hif3-2-1', item_effects: [{ type: 'action', trigger: ['advice'], target: ["get_drink", "get_drink"], targettext: ['drink50'], max: 1 }] },
                        { id: 'hif3-2-2', item_effects: [{ type: 'action', trigger: ['advice'], target: ["get_drink", "get_drink"], targettext: ['enhance50'], max: 1 }] },
                        { id: 'hif3-2-3', item_effects: [{ type: 'action', trigger: ['advice'], target: ["get_drink", "get_drink"], targettext: ['delete50'], max: 1 }] },
                        { id: 'hif3-2-4', item_effects: [{ type: 'action', trigger: ['advice'], target: ["get_drink", "get_drink"], targettext: ['get50'], max: 1 }] }
                    ]
                },
                {
                    id: 'hif3-3',
                    item_effects: [{ type: 'action', trigger: ['gift'], target: ["get_drink", "get_drink", "change"], max: 1 }],
                    subOptions: [
                        { id: 'hif3-3-1', item_effects: [{ type: 'action', trigger: ['gift'], target: ["change", "get_drink", "get_drink"], max: 1 }] },
                        { id: 'hif3-3-2', item_effects: [{ type: 'action', trigger: ['gift'], target: ["get", "get_drink", "get_drink"], max: 1 }] },
                        { id: 'hif3-3-3', item_effects: [{ type: 'action', trigger: ['gift'], target: ["change", "get_drink"], max: 1 }] },
                        { id: 'hif3-3-4', item_effects: [{ type: 'action', trigger: ['gift'], target: ["get", "get_drink"], max: 1 }] }
                    ]
                },
                {
                    id: 'hif3-4',
                    item_effects: [{ type: 'action', trigger: ['goout'], target: ["get_drink", "get_drink", "enhance"], max: 1 }],
                    subOptions: [
                        { id: 'hif3-4-1', item_effects: [{ type: 'action', trigger: ['goout'], target: ["change", "get_drink", "get_drink"], max: 1 }] },
                        {
                            id: 'hif3-4-2', item_effects: [{ type: 'action', trigger: ['goout'], target: ["get", "get_drink", "get_drink"], display: { ko: "카드 복제, 드링크 획득 +2", ja: "カードコピー、ドリンク獲得+2", en: "Copy Card, Get Drink +2" }, max: 1 }]
                        },
                        { id: 'hif3-4-3', item_effects: [{ type: 'action', trigger: ['goout'], target: ["enhance", "get_drink", "get_drink"], targettext: ['ppoint60'], max: 1 }] },
                        { id: 'hif3-4-4', item_effects: [{ type: 'action', trigger: ['goout'], target: ["delete", "get_drink", "get_drink"], targettext: ['ppoint60'], max: 1 }] }
                    ]
                }
            ]
        }
    ]
};

export const pItemSlots = {
    nia: [['nia1-1', 'nia1-2'], ['nia2-1', 'nia2-2', 'nia2-3'], ['nia3-1', 'nia3-2'], ['nia4-1', 'nia4-2', 'nia4-3'], ['nia5-1', 'nia5-2', 'nia5-3']],
    hajime: [['hajime1-1', 'hajime1-2', 'hajime1-3'], ['hajime2']],
    hif: [['hif1', 'hif2', 'hif3']]
};
