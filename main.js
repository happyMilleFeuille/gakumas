// main.js
import { state, setLanguage } from './state.js';
import { updatePageTranslations, applyBackground, initMobileHeightFix } from './utils.js';
import { handleNavigation } from './router.js';
import { renderSupport } from './ui.js';
import { renderGacha } from './gacha.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const langBtns = document.querySelectorAll('.lang-btn');
    const idolSection = document.getElementById('idol'); // 배경이 적용될 섹션 (혹은 fixedBg)
    const logo = document.querySelector('.logo');
    
    // 2. 초기화
    updatePageTranslations();
    if (state.currentBg) {
        applyBackground(state.currentBg);
    }
    initMobileHeightFix();

    // 모든 언어 버튼 상태 동기화 함수
    const syncLangBtns = () => {
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.id === `lang-${state.currentLang}`);
        });
    };

    // 전역 UI 상태 동기화 (배경, 버튼 등)
    const syncGlobalUI = () => {
        syncLangBtns();
        if (state.currentBg) {
            applyBackground(state.currentBg);
        }
    };

    // 초기 실행
    syncGlobalUI();
    document.documentElement.lang = state.currentLang;

    // 초기 화면 렌더링 (홈)
    handleNavigation('home');

    // 화면 전환 이벤트 발생 시 동기화
    window.addEventListener('viewChanged', syncGlobalUI);

    // 3. 이벤트 바인딩

    // 이미지 및 별 우클릭 방지
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('card-star') || e.target.classList.contains('star')) {
            e.preventDefault();
        }
    });

    // 언어 변경 (이벤트 위임 방식)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn');
        if (!btn) return;

        const newLang = btn.id.split('-')[1];
        if (!newLang) return;

        setLanguage(newLang);
        updatePageTranslations();

        // UI 업데이트 (모든 언어 버튼들의 활성화 상태 갱신)
        syncLangBtns();
        
        // 현재 화면 상태에 따라 추가 렌더링
        if (document.querySelector('.support-grid')) {
            renderSupport();
        }
        if (document.querySelector('.gacha-container')) {
            renderGacha();
        }
    });

    // 네비게이션 링크
    document.querySelectorAll('.menu-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            handleNavigation(el.dataset.target);
        });
    });

    // Idol Grid Drag-to-Scroll Implementation
    let isDown = false;
    let startX;
    let scrollLeft;

    document.addEventListener('mousedown', (e) => {
        const grid = e.target.closest('.idol-grid');
        if (!grid) return;
        isDown = true;
        grid.classList.add('active');
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
    });

    document.addEventListener('mouseleave', () => {
        isDown = false;
    });

    document.addEventListener('mouseup', () => {
        isDown = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const grid = document.querySelector('.idol-grid');
        if (!grid) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절
        grid.scrollLeft = scrollLeft - walk;
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
        const calcPanel = document.getElementById('calc-side-panel'); // 계산기 패널 추가
        
        const isCardModalVisible = cardModal && !cardModal.classList.contains('hidden');
        const isGachaLogVisible = gachaLogModal && !gachaLogModal.classList.contains('hidden');
        const isGachaPlaying = document.body.classList.contains('immersive-mode');
        const isGachaResultVisible = resultsContainer && resultsContainer.children.length > 0;
        const isCalcPanelOpen = calcPanel && calcPanel.classList.contains('open'); // 계산기 패널 상태

        if (isGachaPlaying) {
            // 영상 재생 중 뒤로가기 시도 -> 히스토리를 다시 쌓아서 현재 페이지 유지 (차단)
            history.pushState({ target: 'gacha', view: 'playing' }, "");
            return;
        }

        if (isCalcPanelOpen) {
            // 계산기 패널이 열려있으면 패널만 닫음 (calc.js의 close 지원 호출)
            if (window.closeSupportCardPanel) {
                window.closeSupportCardPanel(true);
            } else {
                calcPanel.classList.remove('open');
                const overlay = document.getElementById('panel-overlay');
                if (overlay) overlay.classList.remove('show');
            }
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