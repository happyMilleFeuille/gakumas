// main.js
import { state, setLanguage } from './state.js';
import { updatePageTranslations, applyBackground, initMobileHeightFix } from './utils.js';
import { handleNavigation } from './router.js';
import { renderSupport } from './ui.js';
import { renderGacha } from './gacha.js';

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
            // 현재 화면이 가챠라면 갱신
            if (document.querySelector('.gacha-container')) {
                renderGacha();
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
    const gachaLogModal = document.getElementById('gacha-log-modal');
    const closeModal = document.querySelector('.close-modal');
    const closeGachaLogModal = document.querySelector('.close-log-modal');
    
    function hideModal() {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }

    function hideGachaLogModal() {
        if (gachaLogModal && !gachaLogModal.classList.contains('hidden')) {
            gachaLogModal.classList.add('hidden');
        }
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            hideModal();
            if (history.state && history.state.modalOpen === true) {
                history.back(); // 상태 제거
            }
        });
    }

    if (closeGachaLogModal) {
        closeGachaLogModal.addEventListener('click', () => {
            hideGachaLogModal();
            if (history.state && history.state.modalOpen === 'gachaLog') {
                history.back();
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
            if (history.state && history.state.modalOpen === true) {
                history.back();
            }
        }
        if (event.target === gachaLogModal) {
            hideGachaLogModal();
            if (history.state && history.state.modalOpen === 'gachaLog') {
                history.back();
            }
        }
    });

    // 브라우저 뒤로가기 버튼 처리
    window.addEventListener('popstate', (event) => {
        // 모든 모달 닫기
        hideModal();
        hideGachaLogModal();
    });
});