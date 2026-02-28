// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {
    normal: { 
        date: "2026-02-09",
        pssr: [{ id: 'ssrsena_3rd', char: 'sena' }],
        sssr: ['visual_logic5'],
        sr_card: ['vocal_srlogic5']
    },
    limited: { 
        date: "2026-02-27",
        pssr: [{ id: 'ssrume_endlesslimited', char: 'ume' }],
        sssr: ['dance_limitedsense3'],
        sr_card: ['dance_srlimitedsense4']
    },
    unit: { 
        date: "2026-01-17",
        pssr: [
            { id: 'ssrchina_michinaruunit', char: 'china' },
            { id: 'ssrhiro_michinaruunit', char: 'hiro' }
        ],
        sssr: ['vocal_unitlogic1'],
        sr_card: ['visual_srunitsense1']
    },
    fes: { 
        date: "2025-12-26",
        pssr: ['ssrtsubame_campusfes'],
        sssr: ['dance_fessense1'],
        sr_card: []
    },
    platinum: { 
        date: "2025-05-16",
        pssr: [],
        sssr: [],
        sr_card: []
    },
    selection: { 
        date: "2026-05-16",
        pool_pssr: ['ssrmisuzu_2nd','ssrtsubame_1st','ssrkotone_gamusyaralimited','ssrtemari_gamusyaralimited','ssrsumika_sakuralimited','ssrsaki_sakuralimited','ssrlilja_2nd','ssrsaki_animate','ssrmao_2nd','ssrume_1st','ssrtemari_2nd','ssrsaki_1st'], // 여기에 등장할 PSSR ID들을 직접 기입 (예: ['ssr_id1', 'ssr_id2'])
        pssr: [],      // 픽업 연출을 줄 카드 (선택 사항)
        sssr: [],
        sr_card: []
    }
};
