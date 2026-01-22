// utils.js
import translations from './i18n.js';
import { state } from './state.js';

// 텍스트 번역 업데이트
export function updatePageTranslations() {
    const lang = state.currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
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

// 배경 이미지 설정
export function applyBackground(name) {
    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) {
        fixedBg.style.backgroundImage = `url('images/${name}.png')`;
    }
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