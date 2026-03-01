// gacha-utils.js - 가챠 UI 보조 유틸리티
import { state } from './state.js';
import translations from './i18n.js';
import { openDrawer } from './gacha-drawer.js';

/**
 * 드래그와 클릭을 구분하는 안전한 클릭 핸들러 바인딩
 */
export function bindSafeClick(el, callback) {
    let sX, sY;
    const onStart = (x, y) => { sX = x; sY = y; };
    const onEnd = (x, y) => {
        if (Math.abs(x - sX) < 10 && Math.abs(y - sY) < 10) callback();
    };

    el.onmousedown = (e) => onStart(e.clientX, e.clientY);
    el.onmouseup = (e) => onEnd(e.clientX, e.clientY);
    
    el.ontouchstart = (e) => onStart(e.touches[0].clientX, e.touches[0].clientY);
    el.ontouchend = (e) => onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

/**
 * 쥬얼 표시 업데이트
 */
export function updateJewelUI(ui) {
    if (ui.jewelCount) ui.jewelCount.textContent = state.jewels.toLocaleString();
}

/**
 * 총 뽑기 횟수(교환pt) 업데이트
 */
export function updateTotalPullsUI(ui, prevCount = null) {
    if (ui.totalPullCount) {
        const exchangeText = translations[state.currentLang]?.gacha_exchange_pt || "교환pt";
        const currentPulls = state.totalPulls[state.gachaType] || 0;
        ui.totalPullCount.textContent = (prevCount !== null) ? 
            `${exchangeText}    ${prevCount}  →  ${currentPulls}` : `${exchangeText}    ${currentPulls}`;
    }
}
