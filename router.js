// router.js
import { renderHome, renderIdolList, renderCalc, renderSupport } from './ui.js';
import { renderGacha } from './gacha.js';

export function handleNavigation(target) {
    if (!target) return;
    
    // UI 초기화 (메뉴 닫기 등) - 필요 시 여기서 처리하거나 main.js에서 처리
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navLinks) navLinks.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('is-active');

    // 가챠 고정 버튼 영역 숨김 초기화
    const gachaFixedBtns = document.getElementById('gacha-fixed-buttons');
    if (gachaFixedBtns) {
        gachaFixedBtns.classList.add('hidden');
        gachaFixedBtns.style.display = 'none';
    }

    const gachaLogBtn = document.getElementById('btn-gacha-log');
    if (gachaLogBtn) {
        gachaLogBtn.classList.add('hidden');
    }

    const gachaResetBtn = document.getElementById('btn-gacha-reset');
    if (gachaResetBtn) {
        gachaResetBtn.classList.add('hidden');
    }

    const muteControls = document.getElementById('gacha-header-controls');
    if (muteControls) {
        muteControls.classList.add('hidden');
        muteControls.style.display = 'none';
    }

    const jewelContainer = document.getElementById('jewel-container');
    if (jewelContainer) {
        jewelContainer.classList.add('hidden');
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