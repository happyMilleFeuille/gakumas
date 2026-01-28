// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {
    normal: { 
        pssr: [{ id: 'ssrrinami_3rd', char: 'rinami' }],
        sssr: ['visual_logic4'],
        sr_card: []
    },
    limited: { 
        pssr: [{ id: 'ssrrinami_valentinelimited', char: 'rinami' }],
        sssr: [],
        sr_card: []
    },
    unit: { 
        pssr: [
            { id: 'ssrchina_michinaruunit', char: 'china' },
            { id: 'ssrhiro_michinaruunit', char: 'hiro' }
        ],
        sssr: ['vocal_unitlogic1'],
        sr_card: ['visual_srunitsense1']
    },
    fes: { 
        pssr: ['ssrtsubame_campusfes'],
        sssr: ['dance_fessense1'],
        sr_card: []
    },
    test: { 
        // 픽업 연출(블랙아웃) 확인용 카드 리스트
        pssr: [
            { id: 'ssrtemari_campusfes', char: 'temari' },                                
        ],
        // 일반 SSR 연출 확인용 카드 리스트 (블랙아웃 안 터짐)
        others: [
[
  'ssrrinami_1st',
  'ssrrinami_1st2another',
  'ssrrinami_1st4another',
  'ssrrinami_3rd',
  'ssrsaki_1st5another',
  'ssrsaki_2nd',
  'ssrchina_1st',
  'ssrchina_1st4another',
  'ssrchina_1st7another',
  'ssrchina_2nd',
  'ssrsumika_1st',
  'ssrsumika_1st2another',
  'ssrsumika_2nd',
  'ssrmao_1st',
  'ssrmao_1st9another',
  'ssrmao_2nd',
  'ssrmao_3rd',
  'ssrkotone_1st',
  'ssrkotone_1st3another',
  'ssrkotone_2nd',
  'ssrkotone_3rd',
  'ssrtemari_1st',
  'ssrtemari_1st4another',
  'ssrtemari_1st9another',
  'ssrtemari_2nd',
  'ssrlilja_1st',
  'ssrlilja_1st8another',
  'ssrlilja_2nd',
  'ssrlilja_3rd',
  'ssrhiro_1st',
  'ssrhiro_1st1another',
  'ssrhiro_1st6another',
  'ssrhiro_2nd',
  'ssrhiro_3rd',
  'ssrtsubame_1st',
  'ssrsena_1st',
  'ssrsena_2nd',
  'ssrume_1st',
  'ssrume_1st8another',
  'ssrmisuzu_1st',
  'ssrmisuzu_2nd',
  'ssrrinami_onsen',
  'ssrchina_onsen',
  'ssrsaki_animate',
  'ssrchina_campusfes',
  'ssrtsubame_campusfes',
  'ssrsena_campusfes',
  'ssrsaki_campusfes',
  'ssrtemari_campusfes',
  'ssrkotone_campusfes',
  'ssrmao_campusfes',
  'ssrrinami_summerlimited',
  'ssrlilja_kanmurilimited',
  'ssrrinami_valentinelimited',
  'ssrsena_valentinelimited',
  'ssrchina_yukidokenilimited',
  'ssrlilja_howlinglimited',
  'ssrmao_miraclelimited',
  'ssrsena_starmineunit',
  'ssrume_starmineunit',
  'ssrmisuzu_starmineunit',
  'ssrsaki_ameagariunit',
  'ssrkotone_ameagariunit',
  'ssrchina_michinaruunit',
  'ssrhiro_michinaruunit',
]
                      
        ],
        sssr: [],
        sr_card: []
    }
};
