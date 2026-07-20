// gachaconfig.js
// 현재 가챠 픽업 설정 (ID 및 캐릭터 식별자)
export const CURRENT_PICKUPS = {
};

// 페스 가챠 상세 설정
export const FES_CONFIG = [
    {
        id: 'ssrsaki_hiffes',
        date: '2026-07-21',
        bannerImg: 'idols/ssrsaki_hiffes1.webp',
        pickupRate: 0.015,
        pool: {
            pssr: ['ssrsaki_hiffes'],
            sssr: ['visual_fesanomaly1'],
            sr_card: []
        },
    },
    {
        id: 'ssrlilja_hiffes',
        date: '2026-06-05',
        bannerImg: 'idols/ssrlilja_hiffes1.webp',
        pickupRate: 0.015,
        pool: {
            pssr: ['ssrlilja_hiffes'],
            sssr: ['dance_feslogic1'],
            sr_card: []
        },
        exclude: {
            pssr: ['ssrtemari_hiffes', 'ssrrinami_hiffes', 'ssrhiro_hiffes'],
            sssr: ['visual_fessense1', 'assist_fesfree1']
        }
    },
    {
        id: 'ssrhiro_hiffes',
        date: '2026-05-26',
        bannerImg: 'idols/ssrhiro_hiffes1.webp',
        pickupRate: 0.015,
        pool: {
            pssr: ['ssrhiro_hiffes'],
            sssr: ['assist_fesfree1'],
            sr_card: []
        },
        exclude: {
            pssr: ['ssrtemari_hiffes', 'ssrrinami_hiffes'],
            sssr: ['visual_fessense1']
        }
    },
    {
        id: 'ssrrinami_hiffes',
        date: '2026-05-16',
        bannerImg: 'idols/ssrrinami_hiffes1.webp',
        pickupRate: 0.015,
        pool: {
            pssr: ['ssrrinami_hiffes'],
            sssr: ['visual_fessense1'],
            sr_card: []
        },
        exclude: {
            pssr: ['ssrtemari_hiffes']
        }
    },
    {
        id: 'ssrtemari_hiffes',
        date: '2026-05-16',
        bannerImg: 'idols/ssrtemari_hiffes1.webp',
        pickupRate: 0.015,
        pool: {
            pssr: ['ssrtemari_hiffes'],
            sssr: ['visual_fessense1'],
            sr_card: []
        },
        exclude: {
            pssr: ['ssrrinami_hiffes']
        }
    },
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
        id: 'ssrmisuzu_campusfes',
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
        id: 'sugarunit',
        date: '2026-06-15',
        bannerImg: 'idols/ssrmao_sugarunit1.webp',
        pool: {
            pssr: [
                { id: 'ssrmao_sugarunit', char: 'mao' },
                { id: 'ssrrinami_sugarunit', char: 'rinami' }
            ],
            sssr: ['visual_unitanomaly1'],
            sr_card: ['vocal_srunitsense2']
        }
    },
    {
        id: 'dokimekiunit',
        date: '2026-04-01',
        bannerImg: 'idols/ssrsumika_dokimekiunit1.webp',
        pool: {
            pssr: [
                { id: 'ssrsumika_dokimekiunit', char: 'sumika' },
                { id: 'ssrlilja_dokimekiunit', char: 'lilja' }
            ],
            sssr: ['visual_unitsense1'],
            sr_card: ['vocal_srunitanomaly1']
        }
    },
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
                { id: 'ssrume_starmineunit', char: 'ume' },
                { id: 'ssrmisuzu_starmineunit', char: 'misuzu' },

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
        id: 'ssrmisuzu_3rd',
        date: '2026-04-29',
        bannerImg: 'idols/ssrmisuzu_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrmisuzu_3rd', char: 'misuzu' }],
            sssr: ['vocal_anomaly3'],
            sr_card: ['visual_sranomaly3']
        }
    },
    {
        id: 'ssrume_3rd',
        date: '2026-04-10',
        bannerImg: 'idols/ssrume_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrume_3rd', char: 'ume' }],
            sssr: ['dance_logic3'],
            sr_card: ['visual_srlogic6']
        }
    },
    {
        id: 'ssrsaki_3rd',
        date: '2026-03-19',
        bannerImg: 'idols/ssrsaki_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrsaki_3rd', char: 'saki' }],
            sssr: ['visual_logic6'],
            sr_card: ['visual_srlogic5']
        }
    },
    {
        id: 'ssrsena_3rd',
        date: '2026-02-09',
        bannerImg: 'idols/ssrsena_3rd1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_3rd', char: 'sena' }],
            sssr: ['visual_logic5'],
            sr_card: ['vocal_srlogic6']
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
    },
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
            sssr: ['vocal_free7'],
            sr_card: ['vocal_srlogic2']
        }
    },
    {
        id: 'ssrchina_onsen',
        date: '2024-09-11',
        bannerImg: 'idols/ssrchina_onsen1.webp',
        pool: {
            pssr: [{ id: 'ssrchina_onsen', char: 'china' }],
            sssr: ['visual_free6'],
        }
    },
    {
        id: 'ssrrinami_onsen',
        date: '2024-09-01',
        bannerImg: 'idols/ssrrinami_onsen1.webp',
        pool: {
            pssr: [{ id: 'ssrrinami_onsen', char: 'rinami' }],
            sssr: ['visual_logic2'],
            sr_card: ['visual_srlogic2']
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
        id: 'ssrume_gomywaylimited',
        date: '2026-07-08',
        bannerImg: 'idols/ssrume_gomywaylimited1.webp',
        pool: {
            pssr: [{ id: 'ssrume_gomywaylimited', char: 'ume' }],
            sssr: ['vocal_limitedlogic4'],
            sr_card: ['dance_srlimitedlogic4']
        }
    },
    {
        id: 'ssrkotone_gomywaylimited',
        date: '2026-06-26',
        bannerImg: 'idols/ssrkotone_gomywaylimited1.webp',
        pool: {
            pssr: [{ id: 'ssrkotone_gomywaylimited', char: 'kotone' }],
            sssr: ['visual_limitedanomaly5'],
            sr_card: ['visual_srlimitedanomaly4']
        }
    },
    {
        id: 'ssrsena_endlesslimited',
        date: '2026-03-09',
        bannerImg: 'idols/ssrsena_endlesslimited1.webp',
        pool: {
            pssr: [{ id: 'ssrsena_endlesslimited', char: 'sena' }],
            sssr: ['visual_limitedanomaly4'],
            sr_card: ['vocal_limitedanomaly2']
        }
    },
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
    },
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
        id: 'HIF_day2',
        name: 'The 2nd period HIF DAY2',
        display_date: '2026-06-07',
        date: '2026-03-19',
        bannerImg: 'gasya/gasya_HIF2.webp',
        only_pool_pssr: true,
        pssr_guaranteed: true, // 10회째 PSSR 확정 설정
        is_limited: true, // 한정 가챠 풀 포함        
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrsaki_3rd', 'ssrsena_3rd', 'ssrtemari_3rd', 'ssrmisuzu_2nd', 'ssrlilja_3rd', 'ssrume_2nd', 'ssrtsubame_1st', 'ssrmao_3rd', 'ssrchina_3rd', 'ssrtemari_gamusyaralimited', 'ssrkotone_gamusyaralimited', 'ssrrinami_3rd', 'ssrkotone_3rd', 'ssrhiro_3rd', 'ssrsumika_3rd', 'ssrlilja_howlinglimited', 'ssrchina_howlinglimited', 'ssrmao_yukidokenilimited', 'ssrchina_yukidokenilimited', 'ssrsena_valentinelimited', 'ssrrinami_valentinelimited', 'ssrlilja_christmaslimited', 'ssrume_christmaslimited', 'ssrsaki_animate']
        },
        exclude: {
            sssr: [
                // 한정 시리즈 (엔들리스, 미라클, 벚꽃포토그래프, 가장광소곡, 관국, 세미블루)
                'visual_limitedanomaly4', 'dance_limitedsense3',
                'vocal_limitedanomaly1', 'vocal_limitedlogic2',
                'visual_limitedanomaly3', 'dance_limitedsense2',
                'vocal_limitedlogic3', 'vocal_limitedsense3',
                'dance_limitedlogic2', 'visual_limitedsense1',
                'vocal_limitedsense1', 'dance_limitedlogic1'
            ],
            sr_card: [
                // 한정 시리즈 (엔들리스, 미라클, 벚꽃포토그래프, 가장광소곡, 관국, 세미블루)
                'vocal_limitedanomaly2', 'dance_srlimitedsense4',
                'vocal_srlimitedanomaly1', 'visual_srlimitedlogic2',
                'visual_srlimitedanomaly3', 'dance_srlimitedsense2',
                'vocal_srlimitedlogic3', 'dance_srlimitedsense3',
                'dance_srlimitedfree1', 'visual_srlimitedsense1',
                'vocal_srlimitedlogic1'
            ]
        }
    },
    {
        id: 'HIF_day1',
        name: 'The 2nd period HIF DAY1',
        display_date: '2026-06-06',
        date: '2026-03-19',
        bannerImg: 'gasya/gasya_HIF1.webp',
        only_pool_pssr: true,
        pssr_guaranteed: true, // 10회째 PSSR 확정 설정
        is_limited: true, // 한정 가챠 풀 포함        
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrsaki_3rd', 'ssrsena_endlesslimited', 'ssrume_endlesslimited', 'ssrsena_3rd', 'ssrtemari_3rd', 'ssrmisuzu_2nd', 'ssrlilja_3rd', 'ssrume_2nd', 'ssrtsubame_1st', 'ssrmao_3rd', 'ssrchina_3rd', 'ssrrinami_3rd', 'ssrhiro_miraclelimited', 'ssrmao_miraclelimited', 'ssrkotone_3rd', 'ssrhiro_3rd', 'ssrsumika_3rd', 'ssrsumika_sakuralimited', 'ssrsaki_sakuralimited', 'ssrsaki_animate', 'ssrtemari_halloweenlimited', 'ssrhiro_halloweenlimited', 'ssrlilja_kanmurilimited', 'ssrkotone_kanmurilimited', 'ssrsumika_summerlimited', 'ssrrinami_summerlimited']
        },
        exclude: {
            sssr: [
                // 한정 시리즈 (가무샤라, 하울링, 유키도케니, 발렌타인, 크리스마스)
                'vocal_limitedlogic3', 'vocal_limitedsense3',
                'visual_limitedlogic2', 'dance_limitedanomaly1',
                'visual_limitedanomaly2', 'dance_limitedlogic4',
                'vocal_limitedlogic1', 'visual_limitedanomaly1',
                'visual_limitedlogic1', 'dance_limitedsense1'
            ],
            sr_card: [
                // 한정 시리즈 (가무샤라, 하울링, 유키도케니, 발렌타인, 크리스마스)
                'vocal_srlimitedlogic3', 'dance_srlimitedsense3',
                'visual_srlimitedlogic1', 'dance_srlimitedanomaly1',
                'visual_srlimitedanomaly2', 'dance_srlimitedlogic3',
                'vocal_srlimitedlogic2', 'visual_srlimitedanomaly1',
                'dance_srlimitedlogic2', 'dance_srlimitedsense1'
            ]
        }
    },
    {
        id: '2ani100ren',
        name: '시즌한정 포함 100연',
        name_en: '100 Free Pulls with Seasonal Limiteds',
        name_ja: 'シーズン限定入り100連',
        display_date: '2026-05-01',
        date: '2026-04-28',
        bannerImg: 'gasya/gasya_2ani100ren.webp',
        is_free: true, // 무료 가챠 설정 추가
        is_limited: true, // 한정 가챠 풀 포함
        exclude: {
            pssr: [
                'ssrchina_3rd', 'ssrmao_3rd', 'ssrlilja_3rd', 'ssrhiro_3rd',
                'ssrsumika_3rd', 'ssrkotone_3rd', 'ssrrinami_3rd',
                'ssrsaki_3rd', 'ssrume_3rd', 'ssrsena_3rd', 'ssrtemari_3rd',
                'ssrtemari_gamusyaralimited', 'ssrkotone_gamusyaralimited',
                'ssrhiro_miraclelimited', 'ssrmao_miraclelimited',
                'ssrlilja_howlinglimited', 'ssrchina_howlinglimited',
                'ssrsena_endlesslimited', 'ssrume_endlesslimited',
                // 하울링 어나더 (9another)
                'ssrsaki_1st9another', 'ssrsumika_1st9another', 'ssrmao_1st9another', 'ssrkotone_1st9another',
                'ssrtemari_1st9another', 'ssrhiro_1st9another', 'ssrsena_1st9another', 'ssrume_1st9another',
                // 미라클 어나더 (10another)
                'ssrrinami_1st10another', 'ssrsaki_1st10another', 'ssrchina_1st10another', 'ssrkotone_1st10another',
                'ssrtemari_1st10another', 'ssrlilja_1st10another', 'ssrsena_1st10another', 'ssrume_1st10another', 'ssrmisuzu_1st10another',
                // 가무샤라 어나더 (11another)
                'ssrrinami_1st11another', 'ssrchina_1st11another', 'ssrsumika_1st11another', 'ssrmao_1st11another',
                'ssrlilja_1st11another', 'ssrhiro_1st11another', 'ssrsena_1st11another', 'ssrume_1st11another', 'ssrmisuzu_1st11another',
                // 엔들리스 어나더 (12another)
                'ssrrinami_1st12another', 'ssrsaki_1st12another', 'ssrchina_1st12another', 'ssrsumika_1st12another',
                'ssrmao_1st12another', 'ssrkotone_1st12another', 'ssrtemari_1st12another', 'ssrlilja_1st12another',
                'ssrhiro_1st12another', 'ssrtsubame_1st12another'
            ],
            sssr: [
                // 3차 서포트 (11명)
                'visual_sense1', 'vocal_sense2', 'dance_anomaly3', 'vocal_anomaly1',
                'visual_limitedsense2', 'dance_sense2', 'visual_logic4',
                'dance_logic3', 'visual_logic6', 'visual_logic5', 'vocal_anomaly2',
                // 한정 시리즈 (가무샤라, 미라클, 하울링, 엔들리스)
                'vocal_limitedlogic3', 'vocal_limitedsense3', 'vocal_limitedanomaly1',
                'vocal_limitedlogic2', 'visual_limitedlogic2', 'dance_limitedanomaly1',
                'visual_limitedanomaly4', 'dance_limitedsense3'
            ],
            sr_card: [
                // 3차 서포트 (11명)
                'visual_srsense2', 'vocal_srsense2', 'visual_sranomaly2', 'vocal_sranomaly1',
                'dance_srsense5', 'visual_srsense1', 'visual_srlogic4',
                'visual_srlogic6', 'visual_srlogic5', 'vocal_srlogic6', 'dance_sranomaly2',
                // 한정 시리즈 (가무샤라, 미라클, 하울링, 엔들리스)
                'vocal_srlimitedlogic3', 'dance_srlimitedsense3', 'vocal_srlimitedanomaly1',
                'visual_srlimitedlogic2', 'visual_srlimitedlogic1', 'dance_srlimitedanomaly1',
                'vocal_limitedanomaly2', 'dance_srlimitedsense4'
            ]
        },
        pull_count: 10,
        max_pulls: 100, // 최대 뽑기 가능 횟수 설정 추가
    },
    {
        id: 'ongakusai_day2',
        name: '초성음악제 DAY2',
        name_en: 'Hatsuboshi Music Festival Day 2',
        name_ja: '初星音楽祭 DAY2',
        display_date: '2026-03-02',
        date: '2025-05-16',
        bannerImg: 'gasya/gasya_ongakusai2.webp',
        only_pool_pssr: true,
        ssr_guaranteed: true, // 10회째 SSR 확정 설정 추가
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrtsubame_1st', 'ssrmao_miraclelimited', 'ssrhiro_miraclelimited', 'ssrchina_howlinglimited', 'ssrlilja_howlinglimited', 'ssrsena_2nd', 'ssrsumika_2nd', 'ssrrinami_2nd', 'ssrhiro_2nd', 'ssrsaki_2nd', 'ssrkotone_2nd', 'ssrtemari_1st', 'ssrlilja_1st', 'ssrsumika_summerlimited', 'ssrrinami_summerlimited']
        }
    },

    {
        id: 'ongakusai_day1',
        name: '초성음악제 DAY1',
        name_en: 'Hatsuboshi Music Festival Day 1',
        name_ja: '初星音楽祭 DAY1',
        display_date: '2026-03-01',
        date: '2025-05-16',
        bannerImg: 'gasya/gasya_ongakusai1.webp',
        only_pool_pssr: true,
        ssr_guaranteed: true, // 10회째 SSR 확정 설정 추가
        pull_count: 10,
        max_pulls: 10, // 최대 뽑기 가능 횟수 설정 추가
        pool: {
            pssr: ['ssrmisuzu_2nd', 'ssrtsubame_1st', 'ssrkotone_gamusyaralimited', 'ssrtemari_gamusyaralimited', 'ssrsumika_sakuralimited', 'ssrsaki_sakuralimited', 'ssrlilja_2nd', 'ssrsaki_animate', 'ssrmao_2nd', 'ssrume_1st', 'ssrtemari_2nd', 'ssrsaki_1st']
        }
    },

];
