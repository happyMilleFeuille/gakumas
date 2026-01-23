// router.js
import { renderHome, renderIdolList, renderCalc, renderSupport } from './ui.js';
import { renderGacha, mainBGM } from './gacha.js';

export function handleNavigation(target, isBack = false) {
    if (!target) return;
    
    // 현재 활성화된 탭과 동일한 경우 무시 (중복 렌더링 및 음악 재시작 방지)
    if (history.state && history.state.target === target && !isBack) {
        return;
    }

    // 가챠 관련 UI 요소들 숨김 처리
    const gachaElements = [
        'gacha-fixed-buttons',
        'btn-gacha-log',
        'btn-gacha-reset',
        'gacha-header-controls',
        'jewel-container'
    ];
    gachaElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            // 가챠 탭에서 display: flex를 직접 준 경우를 대비해 style 초기화
            if (id === 'gacha-fixed-buttons') el.style.display = 'none';
        }
    });

    // 다른 탭으로 이동 시 가챠 BGM 정지 및 가챠 배경 초기화
    if (target !== 'gacha') {
        if (mainBGM) mainBGM.pause();
        const fixedBg = document.getElementById('fixed-bg');
        if (fixedBg) {
            fixedBg.style.backgroundImage = '';
        }
    }

    // 히스토리 상태 기록 (뒤로가기 시 홈으로 보내기 위해, 뒤로가기 중이 아닐 때만)
    if (!isBack) {
        if (!history.state || history.state.target !== target) {
            history.pushState({ target: target }, "");
        }
    }

    switch(target) {
        case 'home': renderHome(); break;
        case 'idol': renderIdolList(); break;
        case 'calc': renderCalc(); break;
        case 'support': renderSupport(); break;
        case 'gacha': renderGacha(); break;
        default: console.warn('Unknown navigation target:', target);
    }
}