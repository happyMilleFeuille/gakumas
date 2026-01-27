// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {
    normal: { 
        pssr: [{ id: 'ssrrinami_3rd', char: 'rinami' }],
        sssr: [],
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
        pssr: [],
        sssr: [],
        sr_card: []
    },
    test: { 
        pssr: [{ id: 'ssrrinami_3rd', char: 'rinami' }],
        sssr: [],
        sr_card: []
    }
};