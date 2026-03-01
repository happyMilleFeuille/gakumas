// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {

    platinum: { 
        date: "2025-05-16",
        pssr: [],
        sssr: [],
        sr_card: []
    }
};

// 페스 가챠 상세 설정
export const FES_CONFIG = [
    {
        id: 'ssrtsubame_campusfes',
        date: '2025-12-26',
        bannerImg: 'idols/ssrtsubame_campusfes1.webp',
        pool: {
            pssr: ['ssrtsubame_campusfes'],
            sssr: ['dance_fessense1'],
            sr_card: []
        }
    },
    {
        id: 'ssrtmisuzu_campusfes',
        date: '2025-06-30',
        bannerImg: 'idols/ssrmisuzu_campusfes1.webp',
        pool: {
            pssr: ['ssrmisuzu_campusfes'],
            sssr: ['vocal_feslogic1'],
            sr_card: []
        }
    }    
];

// 유닛 가챠 상세 설정
export const UNIT_CONFIG = [
    {
        id: 'michinaruunit',
        date: '2026-01-17',
        bannerImg: 'idols/ssrchina_michinaruunit1.webp',
        pool: {
            pssr: [
                { id: 'ssrchina_michinaruunit', char: 'china' },
                { id: 'ssrhiro_michinaruunit', char: 'hiro' }
            ],
            sssr: ['vocal_unitlogic1'],
            sr_card: ['visual_srunitsense1']
        }
    },
    {
        id: 'starmineunit',
        date: '2025-07-31',
        bannerImg: 'idols/ssrsena_starmineunit1.webp',
        pool: {
            pssr: [
                { id: 'ssrsena_starmineunit', char: 'sena' },
                { id: 'ssrmisuzu_starmineunit', char: 'misuzu' },
                { id: 'ssrume_starmineunit', char: 'ume' },

            ],
            sssr: ['dance_unitfree2'],
            sr_card: ['dance_srunitfree1']
        }
    }    
];

// 통상 가챠 상세 설정 (기간별 라인업 등)
export const NORMAL_CONFIG = [
    {
        id: 'ssrsena_3rd',
        date: '2026-02-09',
        bannerImg: 'idols/ssrsena_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_3rd', char: 'sena' }],
            sssr: ['visual_logic5'],
            sr_card: ['vocal_srlogic5']
        }
    },
    {
        id: 'ssrtemari_3rd',
        date: '2026-01-16',
        bannerImg: 'idols/ssrtemari_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrtemari_3rd', char: 'temari' }],
            sssr: ['vocal_anomaly2'],
            sr_card: ['dance_sranomaly2']
        }
    }   ,
    {
        id: 'ssrmisuzu_2nd',
        date: '2026-01-05',
        bannerImg: 'idols/ssrmisuzu_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrmisuzu_2nd', char: 'misuzu' }],
            sssr: ['vocal_logic2'],
            sr_card: ['vocal_srlogic5']
        }
    }, 
    {
        id: 'ssrlilja_3rd',
        date: '2025-12-08',
        bannerImg: 'idols/ssrlilja_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrlilja_3rd', char: 'lilja' }],
            sssr: ['dance_anomaly3'],
            sr_card: ['visual_sranomaly2']
        }
    },  
    {
        id: 'ssrume_2nd',
        date: '2025-11-28',
        bannerImg: 'idols/ssrume_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrume_2nd', char: 'ume' }],
            sssr: ['dance_anomaly2'],
            sr_card: ['dance_sranomaly1']
        }
    },
    {
        id: 'ssrtsubame_1st',
        date: '2025-11-16',
        bannerImg: 'idols/ssrtsubame_1st1.webp',
        pool: {
            pssr: [{ id: 'ssrtsubame_1st', char: 'tsubame' }],
            sssr: ['dance_logic2'],
            sr_card: ['vocal_srlogic4']
        }
    },      
    {
        id: 'ssrmao_3rd',
        date: '2025-10-31',
        bannerImg: 'idols/ssrmao_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrmao_3rd', char: 'mao' }],
            sssr: ['vocal_sense2'],
            sr_card: ['vocal_srsense2']
        }
    },    
    {
        id: 'ssrchina_3rd',
        date: '2025-10-21',
        bannerImg: 'idols/ssrchina_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrchina_3rd', char: 'china' }],
            sssr: ['visual_sense1'],
            sr_card: ['visual_srsense2']
        }
    },   
    {
        id: 'ssrrinami_3rd',
        date: '2025-09-17',
        bannerImg: 'idols/ssrrinami_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrrinami_3rd', char: 'rinami' }],
            sssr: ['visual_logic4'],
            sr_card: ['visual_srlogic4']
        }
    }, 
    {
        id: 'ssrkotone_3rd',
        date: '2025-08-12',
        bannerImg: 'idols/ssrkotone_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrkotone_3rd', char: 'kotone' }],
            sssr: ['dance_sense2'],
            sr_card: ['visual_srsense1']
        }
    }, 
    {
        id: 'ssrhiro_3rd',
        date: '2025-07-17',
        bannerImg: 'idols/ssrhiro_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrhiro_3rd', char: 'hiro' }],
            sssr: ['vocal_anomaly1'],
            sr_card: ['vocal_sranomaly1']
        }
    }, 
    {
        id: 'ssrsumika_3rd',
        date: '2025-06-19',
        bannerImg: 'idols/ssrsumika_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrsumika_3rd', char: 'sumika' }],
            sssr: ['visual_limitedsense2'],
            sr_card: ['dance_srsense5']
        }
    },   
    {
        id: 'ssrmisuzu_1st',
        date: '2025-05-16',
        bannerImg: 'idols/ssrmisuzu_1st1.webp',
        pool: {
            pssr: [{ id: 'ssrmisuzu_1st', char: 'misuzu' }],
            sssr: ['visual_anomaly1'],
            sr_card: ['visual_sranomaly1']
        }
    },                                  
];

// 한정 가챠 상세 설정
export const LIMITED_CONFIG = [
    {
        id: 'ssrume_endlesslimited',
        date: '2026-02-27',
        bannerImg: 'idols/ssrume_endlesslimited1.webp',
        pool: {
            pssr: [{ id: 'ssrume_endlesslimited', char: 'ume' }],
            sssr: ['dance_limitedsense3'],
            sr_card: ['dance_srlimitedsense4']
        }
    },
    {
        id: 'ssrtemari_gamusyaralimited',
        date: '2025-10-10',
        bannerImg: 'idols/ssrtemari_gamusyaralimited1.webp',
        pool: {
            pssr: [{ id: 'ssrtemari_gamusyaralimited', char: 'temari' }],
            sssr: ['vocal_limitedlogic3'],
            sr_card: ['vocal_srlimitedlogic3']
        }
    } ,
    {
        id: 'ssrkotone_gamusyaralimited',
        date: '2025-09-29',
        bannerImg: 'idols/ssrkotone_gamusyaralimited1.webp',
        pool: {
            pssr: [{ id: 'ssrkotone_gamusyaralimited', char: 'kotone' }],
            sssr: ['vocal_limitedsense3'],
            sr_card: ['dance_srlimitedsense3']
        }
    },
    {
        id: 'ssrhiro_miraclelimited',
        date: '2025-09-08',
        bannerImg: 'idols/ssrhiro_miraclelimited1.webp',
        pool: {
            pssr: [{ id: 'ssrhiro_miraclelimited', char: 'hiro' }],
            sssr: ['vocal_limitedanomaly1'],
            sr_card: ['vocal_srlimitedanomaly1']
        }
    }, 
    {
        id: 'ssrmao_miraclelimited',
        date: '2025-08-29',
        bannerImg: 'idols/ssrmao_miraclelimited1.webp',
        pool: {
            pssr: [{ id: 'ssrmao_miraclelimited', char: 'mao' }],
            sssr: ['vocal_limitedlogic2'],
            sr_card: ['visual_srlimitedlogic2']
        }
    }, 
    {
        id: 'ssrlilja_howlinglimited',
        date: '2025-06-09',
        bannerImg: 'idols/ssrlilja_howlinglimited1.webp',
        pool: {
            pssr: [{ id: 'ssrlilja_howlinglimited', char: 'lilja' }],
            sssr: ['visual_limitedlogic2'],
            sr_card: ['visual_srlimitedlogic1']
        }
    }, 
    {
        id: 'ssrchina_howlinglimited',
        date: '2025-05-29',
        bannerImg: 'idols/ssrchina_howlinglimited1.webp',
        pool: {
            pssr: [{ id: 'ssrchina_howlinglimited', char: 'china' }],
            sssr: ['dance_limitedanomaly1'],
            sr_card: ['dance_srlimitedanomaly1']
        }
    },                                        
];

// 셀렉션 가챠 상세 설정 (드로어 리스트 및 가챠 풀)
export const SELECTION_CONFIG = [
        {
        id: 'ongakusai_day2',
        name: '초성음악제 DAY2',
        display_date:'2026-03-02',
        date: '2025-05-16',
        bannerImg: 'gasya/gasya_ongakusai2.webp',
        only_pool_pssr: true,
        ssr_guaranteed: true, // 10회째 SSR 확정 설정 추가
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrtsubame_1st','ssrmao_miraclelimited','ssrhiro_miraclelimited','ssrchina_howlinglimited','ssrlilja_howlinglimited','ssrsena_2nd','ssrsumika_2nd','ssrrinami_2nd','ssrhiro_2nd','ssrsaki_2nd','ssrkotone_2nd','ssrtemari_1st','ssrlilja_1st','ssrsumika_summerlimited','ssrrinami_summerlimited']
        }
    }  ,
    
    {
        id: 'ongakusai_day1',
        name: '초성음악제 DAY1',
        display_date:'2026-03-01',
        date: '2025-05-16',
        bannerImg: 'gasya/gasya_ongakusai1.webp',
        only_pool_pssr: true,
        ssr_guaranteed: true, // 10회째 SSR 확정 설정 추가
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrmisuzu_2nd','ssrtsubame_1st','ssrkotone_gamusyaralimited','ssrtemari_gamusyaralimited','ssrsumika_sakuralimited','ssrsaki_sakuralimited','ssrlilja_2nd','ssrsaki_animate','ssrmao_2nd','ssrume_1st','ssrtemari_2nd','ssrsaki_1st']
        }
    },
  
];
