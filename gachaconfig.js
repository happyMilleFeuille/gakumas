// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {
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
        date: '2026-01-27',
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
    },    
    {
        id: 'ameagariunit',
        date: '2025-05-01',
        bannerImg: 'idols/ssrsaki_ameagariunit1.webp',
        pool: {
            pssr: [
                { id: 'ssrsaki_ameagariunit', char: 'saki' },
                { id: 'ssrtemari_ameagariunit', char: 'temari' },
                { id: 'ssrkotone_ameagariunit', char: 'kotone' },

            ],
            sssr: ['dance_unitfree1'],
            sr_card: ['vocal_srunitfree1']
        }
    },    
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
    {
        id: 'ssrsena_2nd',
        date: '2025-04-22',
        bannerImg: 'idols/ssrsena_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_2nd', char: 'sena' }],
            sssr: ['vocal_logic1'],
            sr_card: ['vocal_srlogic3']
        }
    },    
    {
        id: 'ssrlilja_2nd',
        date: '2025-03-21',
        bannerImg: 'idols/ssrlilja_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrlilja_2nd', char: 'lilja' }],
            sssr: ['dance_free6'],
        }
    }, 
    {
        id: 'ssrsumika_2nd',
        date: '2024-12-18',
        bannerImg: 'idols/ssrsumika_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrsumika_2nd', char: 'sumika' }],
            sssr: ['dance_anomaly1'],
            sr_card: ['dance_srfree5']            
        }
    },
    {
        id: 'ssrsena_1st',
        date: '2024-11-16',
        bannerImg: 'idols/ssrsena_1st1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_1st', char: 'sena' }],
            sssr: ['visual_free7'],
            sr_card: ['visual_srfree6']            
        }
    },   
    {
        id: 'ssrsaki_animate',
        date: '2024-10-28',
        bannerImg: 'idols/ssrsaki_animate1.webp',
        pool: {
            pssr: [{ id: 'ssrsaki_animate', char: 'saki' }],
            sssr: ['assist_free2'],
            sr_card: ['dance_srsense4']            
        }
    },
    {
        id: 'ssrrinami_2nd',
        date: '2024-10-18',
        bannerImg: 'idols/ssrrinami_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrrinami_2nd', char: 'rinami' }],
            sssr: ['visual_logic3'],
            sr_card: ['visual_srlogic3']            
        }
    },
    {
        id: 'ssrmao_2nd',
        date: '2024-09-20',
        bannerImg: 'idols/ssrmao_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrmao_2nd', char: 'mao' }],
            sssr: ['vocal_free8'],
            sr_card: ['vocal_srlogic2']            
        }
    },    
    {
        id: 'ssrchina_2nd',
        date: '2024-08-22',
        bannerImg: 'idols/ssrchina_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrchina_2nd', char: 'china' }],
            sssr: ['dance_sense1'],
            sr_card: ['dance_srsense3']            
        }
    }, 
    {
        id: 'ssrhiro_2nd',
        date: '2024-07-22',
        bannerImg: 'idols/ssrhiro_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrhiro_2nd', char: 'hiro' }],
            sssr: ['vocal_sense1'],
            sr_card: ['vocal_srsense1']            
        }
    }, 
    {
        id: 'ssrsaki_2nd',
        date: '2024-06-19',
        bannerImg: 'idols/ssrsaki_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrsaki_2nd', char: 'saki' }],
            sssr: ['visual_logic1'],
            sr_card: ['visual_srlogic1']            
        }
    },  
    {
        id: 'ssrkotone_2nd',
        date: '2024-06-10',
        bannerImg: 'idols/ssrkotone_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrkotone_2nd', char: 'kotone' }],
            sssr: ['dance_free5'],
            sr_card: ['dance_srsense2']            
        }
    },    
    {
        id: 'ssrume_1st',
        date: '2024-06-01',
        bannerImg: 'idols/ssrume_1st1.webp',
        pool: {
            pssr: [{ id: 'ssrume_1st', char: 'ume' }],
            sssr: ['vocal_free6'],
            sr_card: ['dance_srsense1']            
        }
    },  
    {
        id: 'ssrtemari_2nd',
        date: '2024-05-22',
        bannerImg: 'idols/ssrtemari_2nd1.webp',
        pool: {
            pssr: [{ id: 'ssrtemari_2nd', char: 'temari' }],
            sssr: ['vocal_free5'],
            sr_card: ['vocal_srlogic1']            
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
    {
        id: 'ssrsaki_sakuralimited',
        date: '2025-04-11',
        bannerImg: 'idols/ssrsaki_sakuralimited1.webp',
        pool: {
            pssr: [{ id: 'ssrsaki_sakuralimited', char: 'saki' }],
            sssr: ['visual_limitedanomaly3'],
            sr_card: ['visual_srlimitedanomaly3']
        }
    },     
    {
        id: 'ssrsumika_sakuralimited',
        date: '2025-04-01',
        bannerImg: 'idols/ssrsumika_sakuralimited1.webp',
        pool: {
            pssr: [{ id: 'ssrsumika_sakuralimited', char: 'sumika' }],
            sssr: ['dance_limitedsense2'],
            sr_card: ['dance_srlimitedsense2']
        }
    }, 
    {
        id: 'ssrmao_yukidokenilimited',
        date: '2025-03-10',
        bannerImg: 'idols/ssrmao_yukidokenilimited1.webp',
        pool: {
            pssr: [{ id: 'ssrmao_yukidokenilimited', char: 'mao' }],
            sssr: ['visual_limitedanomaly2'],
            sr_card: ['visual_srlimitedanomaly2']
        }
    },
    {
        id: 'ssrchina_yukidokenilimited',
        date: '2025-02-28',
        bannerImg: 'idols/ssrchina_yukidokenilimited1.webp',
        pool: {
            pssr: [{ id: 'ssrchina_yukidokenilimited', char: 'china' }],
            sssr: ['dance_limitedlogic4'],
            sr_card: ['dance_srlimitedlogic3']
        }
    },           
    {
        id: 'ssrsena_valentinelimited',
        date: '2025-02-14',
        bannerImg: 'idols/ssrsena_valentinelimited1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_valentinelimited', char: 'sena' }],
            sssr: ['vocal_limitedlogic1'],
            sr_card: ['vocal_srlimitedlogic2']
        }
    },    
    {
        id: 'ssrrinami_valentinelimited',
        date: '2025-02-01',
        bannerImg: 'idols/ssrrinami_valentinelimited1.webp',
        pool: {
            pssr: [{ id: 'ssrrinami_valentinelimited', char: 'rinami' }],
            sssr: ['visual_limitedanomaly1'],
            sr_card: ['visual_srlimitedanomaly1']
        }
    },   
    {
        id: 'ssrlilja_christmaslimited',
        date: '2024-12-09',
        bannerImg: 'idols/ssrlilja_christmaslimited1.webp',
        pool: {
            pssr: [{ id: 'ssrlilja_christmaslimited', char: 'lilja' }],
            sssr: ['visual_limitedlogic1'],
            sr_card: ['dance_srlimitedlogic2']
        }
    }, 
    {
        id: 'ssrume_christmaslimited',
        date: '2024-11-28',
        bannerImg: 'idols/ssrume_christmaslimited1.webp',
        pool: {
            pssr: [{ id: 'ssrume_christmaslimited', char: 'ume' }],
            sssr: ['dance_limitedsense1'],
            sr_card: ['dance_srlimitedsense1']
        }
    },   
    {
        id: 'ssrhiro_halloweenlimited',
        date: '2024-10-08',
        bannerImg: 'idols/ssrhiro_halloweenlimited1.webp',
        pool: {
            pssr: [{ id: 'ssrhiro_halloweenlimited', char: 'hiro' }],
            sssr: ['vocal_limitedsense2'],
            sr_card: ['vocal_srlimitedsense1']
        }
    },  
    {
        id: 'ssrtemari_halloweenlimited',
        date: '2024-09-30',
        bannerImg: 'idols/ssrtemari_halloweenlimited1.webp',
        pool: {
            pssr: [{ id: 'ssrtemari_halloweenlimited', char: 'temari' }],
            sssr: ['dance_limitedlogic3'],
            sr_card: ['dance_srlimitedlogic1']
        }
    },   
    {
        id: 'ssrkotone_kanmurilimited',
        date: '2024-08-11',
        bannerImg: 'idols/ssrkotone_kanmurilimited1.webp',
        pool: {
            pssr: [{ id: 'ssrkotone_kanmurilimited', char: 'kotone' }],
            sssr: ['dance_limitedlogic2'],
            sr_card: ['dance_srlimitedfree1']
        }
    }, 
    {
        id: 'ssrlilja_kanmurilimited',
        date: '2024-08-01',
        bannerImg: 'idols/ssrlilja_kanmurilimited1.webp',
        pool: {
            pssr: [{ id: 'ssrlilja_kanmurilimited', char: 'lilja' }],
            sssr: ['visual_limitedsense1'],
            sr_card: ['visual_srlimitedsense1']
        }
    }, 
    {
        id: 'ssrrinami_summerlimited',
        date: '2024-07-12',
        bannerImg: 'idols/ssrrinami_summerlimited1.webp',
        pool: {
            pssr: [{ id: 'ssrrinami_summerlimited', char: 'rinami' }],
            sssr: ['vocal_limitedsense1'],
            sr_card: ['vocal_srlimitedlogic1']
        }
    }, 
    {
        id: 'ssrsumika_summerlimited',
        date: '2024-07-01',
        bannerImg: 'idols/ssrsumika_summerlimited1.webp',
        pool: {
            pssr: [{ id: 'ssrsumika_summerlimited', char: 'sumika' }],
            sssr: ['dance_limitedlogic1'],
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
