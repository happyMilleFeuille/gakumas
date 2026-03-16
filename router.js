// router.js
import { state, idolColors } from './state.js';
import { renderHome, renderIdolList, renderCalc, renderSupport, updateGlobalBackgroundColor } from './ui.js';
import { renderGacha, stopBGM } from './gacha.js';

export function handleNavigation(target, isBack = false) {
    if (!target) return;
    
    const contentArea = document.getElementById('content-area');
    const isContentEmpty = contentArea && contentArea.innerHTML.trim() === '';

    // 현재 활성화된 탭과 동일하고, 화면이 비어있지 않은 경우만 무시
    if (history.state && history.state.target === target && !isBack && !isContentEmpty) {
        return;
    }

    // 가챠 관련 UI 요소들 숨김 처리
    const gachaElements = [
        'gacha-fixed-buttons',
        'btn-gacha-log',
        'btn-gacha-rates',
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

    // 가챠 탭 전용 배경 처리 추가
    const fixedBg = document.getElementById('fixed-bg');
    if (target === 'gacha') {
        if (fixedBg) {
            fixedBg.style.webkitMaskImage = 'none';
            fixedBg.style.maskImage = 'none';
            fixedBg.style.backgroundImage = '';
            fixedBg.style.backgroundColor = 'transparent';
        }
        if (state.favoriteIdol && idolColors[state.favoriteIdol]) {
            document.body.style.backgroundColor = idolColors[state.favoriteIdol] + "1a"; // 10% 농도
        } else {
            document.body.style.backgroundColor = "#8888881a"; // 미선택 시 회색 10% 농도
        }
    } else {
        // 다른 탭으로 이동 시 가챠 BGM 정지 및 배경 문양 복구
        stopBGM('all'); 
        if (fixedBg) {
            const maskUrl = "url('images/background.webp')";
            fixedBg.style.webkitMaskImage = maskUrl;
            fixedBg.style.maskImage = maskUrl;
            fixedBg.style.backgroundImage = '';
            fixedBg.style.filter = '';
            // 전역 배경색 업데이트 함수 호출하여 문양 색상 복구
            updateGlobalBackgroundColor();
        }
    }

    // 히스토리 상태 기록 (뒤로가기 시 홈으로 보내기 위해, 뒤로가기 중이 아닐 때만)
    if (!isBack) {
        if (!history.state || history.state.target !== target) {
            history.pushState({ target: target }, "");
        }
    }

    // 가챠 관련 UI 초기화 (가챠 탭이 아닐 때 숨김 처리)
    const jewelContainer = document.getElementById('jewel-container');
    if (jewelContainer) jewelContainer.classList.add('hidden');

    const gachaHeaderControls = document.getElementById('gacha-header-controls');
    if (gachaHeaderControls) gachaHeaderControls.classList.add('hidden');

    const gachaFixedButtons = document.getElementById('gacha-fixed-buttons');
    if (gachaFixedButtons) gachaFixedButtons.classList.add('hidden');

    // [추가] 언어 전환 버튼: 홈 화면일 때만 표시
    const langSwitch = document.querySelector('.lang-switch-container');
    if (langSwitch) {
        if (target === 'home') {
            langSwitch.classList.remove('hidden');
        } else {
            langSwitch.classList.add('hidden');
        }
    }

    switch (target) {
        case 'home': renderHome(); break;
        case 'idol': renderIdolList(); break;
        case 'calc': renderCalc(); break;
        case 'support': renderSupport(); break;
        case 'gacha': renderGacha(); break;
        default: console.warn('Unknown navigation target:', target);
    }

    // 화면 전환 후 전역 UI 상태 동기화 (main.js에서 제공하는 기능을 window 전역 객체 등을 통해 간접 실행하거나 이벤트를 발생시킴)
    window.dispatchEvent(new CustomEvent('viewChanged'));
}