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

    // 새로고침 시 히스토리 상태 초기화 (현재 화면이 홈이므로 상태를 홈으로 맞춤)
    history.replaceState({ target: 'home' }, "");

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
            if (history.state && history.state.modalOpen === true) {
                history.back(); 
            } else {
                hideModal();
            }
        });
    }

    if (closeGachaLogModal) {
        closeGachaLogModal.addEventListener('click', () => {
            if (history.state && history.state.modalOpen === 'gachaLog') {
                history.back();
            } else {
                hideGachaLogModal();
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            if (history.state && history.state.modalOpen === true) {
                history.back();
            } else {
                hideModal();
            }
        }
        if (event.target === gachaLogModal) {
            if (history.state && history.state.modalOpen === 'gachaLog') {
                history.back();
            } else {
                hideGachaLogModal();
            }
        }
    });

    // 브라우저 뒤로가기 버튼 처리
    window.addEventListener('popstate', (event) => {
        const cardModal = document.getElementById('card-modal');
        const gachaLogModal = document.getElementById('gacha-log-modal');
        const resultsContainer = document.querySelector('#gacha-results');
        
        const isCardModalVisible = cardModal && !cardModal.classList.contains('hidden');
        const isGachaLogVisible = gachaLogModal && !gachaLogModal.classList.contains('hidden');
        const isGachaPlaying = document.body.classList.contains('immersive-mode');
        const isGachaResultVisible = resultsContainer && resultsContainer.children.length > 0;

        if (isGachaPlaying) {
            // 영상 재생 중 뒤로가기 시도 -> 히스토리를 다시 쌓아서 현재 페이지 유지 (차단)
            history.pushState({ target: 'gacha', view: 'playing' }, "");
            return;
        }

        if (isCardModalVisible || isGachaLogVisible) {
            hideModal();
            hideGachaLogModal();
        } else if (isGachaResultVisible) {
            document.body.classList.remove('immersive-mode');
            if (resultsContainer) resultsContainer.innerHTML = '';
            renderGacha();
        } else {
            handleNavigation('home', true);
        }
    });
});