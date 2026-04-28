// utils.js
import translations from './i18n.js';
import { state } from './state.js';

// 텍스트 번역 업데이트
export function updatePageTranslations(root = document) {
    const lang = state.currentLang;
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'SPAN' || el.children.length === 0) {
                el.innerHTML = translations[lang][key];
            } else {
                const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = translations[lang][key];
            }
        }
    });
}

export function translate(key, params = {}, fallback = '') {
    const lang = state.currentLang;
    const template = translations[lang]?.[key] ?? fallback;
    if (typeof template !== 'string') return fallback;

    return template.replace(/\{(\w+)\}/g, (_, paramKey) => {
        const value = params[paramKey];
        return value === undefined || value === null ? '' : String(value);
    });
}

// 모바일 배경 높이 고정 (주소창 꿀렁임 방지)
export function initMobileHeightFix() {
    const fixedBg = document.getElementById('fixed-bg');
    let lastWidth = window.innerWidth;

    function setHeight() {
        if (fixedBg) {
            fixedBg.style.height = `${window.innerHeight}px`;
        }
    }

    setHeight();
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWidth) {
            lastWidth = window.innerWidth;
            setHeight();
        }
    });
}
