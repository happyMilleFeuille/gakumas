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

    switch(target) {
        case 'home': renderHome(); break;
        case 'idol': renderIdolList(); break;
        case 'calc': renderCalc(); break;
        case 'support': renderSupport(); break;
        case 'gacha': renderGacha(); break;
        default: console.warn('Unknown navigation target:', target);
    }
}