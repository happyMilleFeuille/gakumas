export const pItemDescriptions = {
    nia: [
        { icons: ['nia1-1'], ko: '특별수업 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '特別レッスン時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Special Lesson (2 times per Produce)' },
        { icons: ['nia1-2'], ko: '상담 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '相談時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Consultation (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia2-1'], ko: '영업(강화카드) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(強化カード)時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Promotion (Enhanced Card) (2 times per Produce)' },
        { icons: ['nia2-2'], ko: '영업(P포인트) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(Pポイント)時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Promotion (P Points) (2 times per Produce)' },
        { icons: ['nia2-3'], ko: '영업(드링크) 시 카드 삭제 및 획득 (프로듀스 중 2회)', ja: '営業(ドリンク)時、カード削除および獲得 (プロデュース中2回)', en: 'Delete and obtain a card during Promotion (Drink) (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia3-1', 'nia3-2'], ko: '오디션 종료 시 카드 삭제 및 복제 (프로듀스 중 2회)', ja: 'オーディション終了時、カード削除およびコピー (プロデュース中2回)', en: 'Delete and copy a card after an Audition (2 times per Produce)' },
        { type: 'separator' },
        { icons: ['nia4-1'], ko: '영업(강화카드) 시 카드 강화 (프로듀스 중 2회)', ja: '営業(強化カード)時、カードを強化 (プロデュース中2回)', en: 'Enhance a card during Promotion (Enhanced Card) (2 times per Produce)' },
        { icons: ['nia4-2'], ko: '영업(드링크) 시 드링크 2개 획득 (프로듀스 중 2회)', ja: '営業(ドリンク)時、ドリンク2個を獲得 (プロデュース中2回)', en: 'Obtain 2 Drinks during Promotion (Drink) (2 times per Produce)' },
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
        { icons: ['hif1-1'], ko: '준비 중', ja: '準備中', en: 'Under Preparation' }
    ]
};

export const pItemSlots = {
    nia: [['nia1-1', 'nia1-2'], ['nia2-1', 'nia2-2', 'nia2-3'], ['nia3-1', 'nia3-2'], ['nia4-1', 'nia4-2', 'nia4-3'], ['nia5-1', 'nia5-2', 'nia5-3']],
    hajime: [['hajime1-1', 'hajime1-2', 'hajime1-3'], ['hajime2']],
    hif: [['hif1-1']]
};
