// main.js
import { state, setLanguage } from './state.js';
import { updatePageTranslations, applyBackground, initMobileHeightFix } from './utils.js';
import { handleNavigation } from './router.js';
import { renderSupport } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const langBtns = document.querySelectorAll('.lang-btn');
    const idolSection = document.getElementById('idol'); // 배경이 적용될 섹션 (혹은 fixedBg)
    const logo = document.querySelector('.logo');
    
    // 2. 초기화
    updatePageTranslations();
    if (state.currentBg) {
        applyBackground(state.currentBg);
    }
    initMobileHeightFix();

    // 초기 언어 버튼 활성화 상태 설정
    langBtns.forEach(b => b.classList.toggle('active', b.id === `lang-${state.currentLang}`));
    document.documentElement.lang = state.currentLang;

    // 3. 이벤트 바인딩

    // 이미지 및 별 우클릭 방지
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('card-star') || e.target.classList.contains('star')) {
            e.preventDefault();
        }
    });

    // 언어 변경
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newLang = btn.id.split('-')[1];
            setLanguage(newLang);
            updatePageTranslations();

            // UI 업데이트 (버튼 활성화 상태)
            langBtns.forEach(b => b.classList.toggle('active', b.id === `lang-${newLang}`));
            
            // 현재 화면이 서포트 카드라면 갱신
            if (document.querySelector('.support-grid')) {
                renderSupport();
            }
        });
    });

    // 햄버거 메뉴
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    // 네비게이션 링크
    document.querySelectorAll('.nav-links a, .menu-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            if (el.tagName === 'A' && el.getAttribute('href').startsWith('#')) e.preventDefault();
            handleNavigation(el.dataset.target);
        });
    });

    // 로고 클릭 -> 홈
    if (logo) logo.addEventListener('click', () => handleNavigation('home'));

    // 모달 닫기
    const modal = document.getElementById('card-modal');
    const closeModal = document.querySelector('.close-modal');
    
    function hideModal() {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            // If the modal was closed manually, we might need to pop the state
            // But popstate will handle it if we use the back button.
        }
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            hideModal();
            if (history.state && history.state.modalOpen) {
                history.back(); // 상태 제거
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
            if (history.state && history.state.modalOpen) {
                history.back(); // 상태 제거
            }
        }
    });

    // 브라우저 뒤로가기 버튼 처리
    window.addEventListener('popstate', (event) => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
});