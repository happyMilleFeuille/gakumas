// router.js
import { renderHome, renderIdolList, renderCalc, renderSupport } from './ui.js';
import { renderGacha } from './gacha.js';

export function handleNavigation(target, isBack = false) {
    if (!target) return;
    
    // ... (중략 - UI 초기화 로직은 동일)
    const jewelContainer = document.getElementById('jewel-container');
    if (jewelContainer) {
        jewelContainer.classList.add('hidden');
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