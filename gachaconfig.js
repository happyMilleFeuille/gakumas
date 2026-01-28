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
            { id: 'ssrchina_michinaruunit', char: 'china' }, 
            { id: 'ssrhiro_michinaruunit', char: 'hiro' },                                  
        ],
        // 일반 SSR 연출 확인용 카드 리스트 (블랙아웃 안 터짐)
        others: [
            'ssrrinami_1st2another',
            'ssrume_starmineunit',
            'ssrsena_campusfes',
            'ssrsaki_2nd',
            'ssrsumika_1st',
            'ssrhiro_3rd',
            'ssrume_1st8another',                        
            'ssrsaki_animate',
            'ssrrinami_summerlimited',                        
        ],
        sssr: [],
        sr_card: []
    }
};
