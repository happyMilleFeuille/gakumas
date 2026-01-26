// calcStats.js
// 각 활동별 기본 상승 수치를 정의합니다.

export const baseStats = {
    // 공통/기본 수치 (필요 시 채워넣음)
    test: { vocal: 0, dance: 0, visual: 0 },
    audition: { vocal: 0, dance: 0, visual: 0 },
    initial: { vocal: 0, dance: 0, visual: 0 }
};

// 니아(NIA) 전용 오디션 수치
export const niaAuditionStats = {
    1: { // 1차 오디션 (9주차)
        protruded: [116, 69, 46], // 1순위, 2순위, 3순위
        balanced: [92, 76, 62]
    },
    2: { // 2차 오디션 (17주차)
        protruded: [149, 89, 59],
        balanced: [119, 98, 80]
    },
    3: { // 3차 오디션 (26주차)
        protruded: [215, 129, 86],
        balanced: [172, 142, 116]
    }
};

// 하지메(Hajime) 전용 레슨 수치 로직
export const getHajimeLessonStat = (actionId, isSP, week) => {
    let stats = { vocal: 0, dance: 0, visual: 0 };
    let values = [0, 0, 0]; // [주속성, 부속성, 부속성]

    if (week === 4) {
        values = isSP ? [140, 55, 55] : [110, 50, 50];
    } else if (week === 7) {
        values = isSP ? [180, 60, 60] : [144, 53, 53];
    } else if (week === 12) {
        values = isSP ? [260, 70, 70] : [214, 58, 58];
    } else if (week === 14) {
        values = isSP ? [370, 90, 90] : [320, 75, 75];
    } else if (week === 16) {
        values = isSP ? [570, 115, 115] : [504, 108, 108];
    } else {
        return null; // 지정되지 않은 주차는 기본 로직 사용
    }

    if (actionId === 'lessonvo') {
        stats.vocal = values[0]; stats.dance = values[1]; stats.visual = values[2];
    } else if (actionId === 'lessondan') {
        stats.dance = values[0]; stats.vocal = values[1]; stats.visual = values[2];
    } else if (actionId === 'lessonvi') {
        stats.visual = values[0]; stats.vocal = values[1]; stats.dance = values[2];
    }

    return stats;
};

// 니아(NIA) 전용 레슨 수치 로직
export const getNiaLessonStat = (actionId, isSP, week) => {
    let val = 0;
    if (week <= 8) {
        val = isSP ? 100 : 80;
    } else if (week <= 16) {
        val = isSP ? 120 : 100;
    } else if (week <= 25) {
        val = isSP ? 150 : 120;
    } else {
        // 26주차 이후 혹은 예외 처리
        val = isSP ? 150 : 120;
    }

        return {

            vocal: actionId === 'lessonvo' ? val : 0,

            dance: actionId === 'lessondan' ? val : 0,

            visual: actionId === 'lessonvi' ? val : 0

        };

    };

    

// 아이돌별 데이터 (특화 순서, 성장 유형 및 성장 보너스%)
export const idolData = {
    'saki': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 16.5, danceBonus: 16.5, visualBonus: 20.5 },
    'temari': { priority: ['vocal', 'dance', 'visual'], growthType: 'protruded', vocalBonus: 24.0, danceBonus: 21.5, visualBonus: 8.5 },
    'kotone': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 8.0, danceBonus: 24.5, visualBonus: 22.5 },
    'tsubame': { priority: ['dance', 'vocal', 'visual'], growthType: 'protruded', vocalBonus: 15, danceBonus: 20, visualBonus: 12 },
    'mao': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 22.0, danceBonus: 8.0, visualBonus: 23.0 },
    'lilja': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 18.0, danceBonus: 20.0, visualBonus: 18.0 },
    'china': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 10.0, danceBonus: 24.0, visualBonus: 20.5 },
    'sumika': { priority: ['dance', 'visual', 'vocal'], growthType: 'protruded', vocalBonus: 9.0, danceBonus: 23.0, visualBonus: 23.0 },
    'hiro': { priority: ['vocal', 'dance', 'visual'], growthType: 'balanced', vocalBonus: 23.0, danceBonus: 19.5, visualBonus: 10.0 },
    'sena': { priority: ['visual', 'vocal', 'dance'], growthType: 'balanced', vocalBonus: 15.0, danceBonus: 8.0, visualBonus: 20.5 },
    'misuzu': { priority: ['vocal', 'visual', 'dance'], growthType: 'protruded', vocalBonus: 27.0, danceBonus: 10.0, visualBonus: 18.0 },
    'ume': { priority: ['dance', 'vocal', 'visual'], growthType: 'balanced', vocalBonus: 20.0, danceBonus: 23.0, visualBonus: 15.0 },
    'rinami': { priority: ['visual', 'dance', 'vocal'], growthType: 'balanced', vocalBonus: 11.0, danceBonus: 21.5, visualBonus: 23.5 }
};

    