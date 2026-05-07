// main.js
import { state, setLanguage } from './state.js';
import { updatePageTranslations, initMobileHeightFix } from './utils.js';
import { handleNavigation } from './router.js';
import { renderSupport, updateGlobalBackgroundColor } from './ui.js';
import { renderGacha } from './gacha.js';

// Idol Grid Drag-to-Scroll Implementation (글로벌 스코프로 이동하여 에러 방지)
let isDown = false;
let startX;
let scrollLeft;

document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
    const langSelect = document.getElementById('lang-select');
    const langOptions = document.getElementById('lang-options');
    const langCurrentLabel = document.getElementById('lang-current-label');
    const idolSection = document.getElementById('idol'); // 배경이 적용될 섹션 (혹은 fixedBg)
    const logo = document.querySelector('.logo');

    // 2. 초기화
    updatePageTranslations();
    // initMobileHeightFix(); // 내부 스크롤 구조이므로 더 이상 필요하지 않음

    // [전역 배경 및 색상 설정]
    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) {
        const maskUrl = "url('images/background.webp')";
        fixedBg.style.webkitMaskImage = maskUrl;
        fixedBg.style.maskImage = maskUrl;
        fixedBg.style.opacity = (state.favoriteIdol === 'lilja') ? '0.7' : '0.2';
    }

    // [중요] 초기화 직후 즉시 배경색 동기화 호출
    import('./ui.js').then(m => {
        m.updateGlobalBackgroundColor();
    });

    if (navigator.storage?.persisted && navigator.storage?.persist) {
        navigator.storage.persisted()
            .then(isPersisted => {
                if (!isPersisted) return navigator.storage.persist();
                return true;
            })
            .catch(() => false);
    }

    // 모든 언어 버튼 상태 동기화 함수
    const syncLangControl = () => {
        if (langCurrentLabel) {
            langCurrentLabel.textContent = state.currentLang.toUpperCase();
        }
        if (langOptions) {
            langOptions.querySelectorAll('.lang-option').forEach((option) => {
                option.classList.toggle('active', option.dataset.lang === state.currentLang);
                option.setAttribute('aria-selected', option.dataset.lang === state.currentLang ? 'true' : 'false');
            });
        }
        if (langSelect) {
            langSelect.setAttribute('aria-expanded', 'false');
        }
    };

    const closeLangDropdown = () => {
        if (langOptions) {
            langOptions.classList.add('hidden');
        }
        if (langSelect) {
            langSelect.setAttribute('aria-expanded', 'false');
        }
    };

    // 전역 UI 상태 동기화 (배경, 버튼 등)
    const syncGlobalUI = () => {
        syncLangControl();
        // 가챠 탭이 아닐 때만 일반 배경 적용 (가챠 탭은 자체 픽업 배경 로직 사용)
        const isGachaView = document.querySelector('.gacha-container');
    };

    // 초기 실행
    syncGlobalUI();
    document.documentElement.lang = state.currentLang;

    // 초기 화면 렌더링 (URL 해시 반영)
    const initialTarget = window.location.hash.substring(1) || 'home';
    handleNavigation(initialTarget);

    // 해시 변경 이벤트 리스너 추가
    window.addEventListener('hashchange', () => {
        const target = window.location.hash.substring(1) || 'home';
        handleNavigation(target, true);
    });

    // 화면 전환 이벤트 발생 시 동기화
    window.addEventListener('viewChanged', syncGlobalUI);

    // 3. 이벤트 바인딩

    // 이미지 및 별 우클릭 방지
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('card-star') || e.target.classList.contains('star')) {
            e.preventDefault();
        }
    });

    document.addEventListener('click', (e) => {
        const langButton = e.target.closest('#lang-select');
        const langOption = e.target.closest('.lang-option');

        if (langButton) {
            const willOpen = langOptions?.classList.contains('hidden');
            if (langOptions) {
                langOptions.classList.toggle('hidden');
            }
            langSelect?.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            return;
        }

        if (langOption) {
            const newLang = langOption.dataset.lang;
            if (!newLang || newLang === state.currentLang) {
                closeLangDropdown();
                return;
            }

            setLanguage(newLang);
            updatePageTranslations();
            syncLangControl();
            closeLangDropdown();

            if (document.querySelector('.pssr-roadmap-container')) {
                import('./ui.js').then(m => m.renderHome());
            }
            if (document.querySelector('.support-grid')) {
                renderSupport();
            }
            if (document.querySelector('.gacha-container')) {
                renderGacha();
            }
            return;
        }

        if (!e.target.closest('#lang-dropdown')) {
            closeLangDropdown();
        }
    });

    // 네비게이션 링크
    document.querySelectorAll('.menu-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            handleNavigation(el.dataset.target);
        });
    });

    // 홈 퀵 메뉴 바로가기 (이벤트 위임)
    document.addEventListener('click', (e) => {
        const quickBtn = e.target.closest('.home-quick-btn');
        if (quickBtn) {
            handleNavigation(quickBtn.dataset.target);
        }
    });

    // [반응형 대응] 주요 경계(768px, 1024px)를 넘나들 때 로드맵 재렌더링
    const getLayoutStage = (w) => {
        if (w <= 768) return 'mobile';
        if (w <= 1024) return 'tablet';
        return 'pc';
    };

    let currentStage = getLayoutStage(window.innerWidth);
    window.addEventListener('resize', () => {
        const nextStage = getLayoutStage(window.innerWidth);
        if (currentStage !== nextStage) {
            currentStage = nextStage;
            // 로드맵 컨테이너가 존재하는 경우에만 재렌더링
            if (document.getElementById('pssr-roadmap-list')) {
                import('./roadmap.js').then(m => {
                    m.renderPSSRRoadmap(false);
                });
            }
        }
    });

    // [Declaration moved to top level]

    // 로드맵 필터 버튼 토글
    document.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('#roadmap-filter-btn');
        const container = e.target.closest('.roadmap-filter-container'); // ID가 아닌 클래스로 수정
        const dropdown = document.getElementById('roadmap-filter-dropdown');

        if (filterBtn) {
            filterBtn.classList.toggle('active');
            dropdown?.classList.toggle('active');
        } else if (!container && dropdown?.classList.contains('active')) {
            document.getElementById('roadmap-filter-btn')?.classList.remove('active');
            dropdown.classList.remove('active');
        }

        // 로드맵 펼치기/접기 버튼
        const expandBtn = e.target.closest('#btn-roadmap-expand');
        if (expandBtn) {
            const roadmapContainer = document.getElementById('pssr-roadmap-container');
            if (roadmapContainer) {
                const isCollapsed = roadmapContainer.classList.toggle('is-collapsed');
                expandBtn.classList.toggle('active', !isCollapsed); // active 클래스 토글 추가

                // 펼칠 때 렌더링 실행
                if (!isCollapsed) {
                    import('./roadmap.js').then(m => m.renderPSSRRoadmap(false));
                } else {
                    // 접을 때 상단으로 스크롤
                    roadmapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    });

    // 로드맵 필터 변경 (이벤트 위임)
    document.addEventListener('change', (e) => {
        if (e.target.id && e.target.id.startsWith('pssr-')) {
            const filterType = e.target.id.replace('pssr-', '').replace('-toggle', '');
            import('./state.js').then(s => {
                s.setRoadmapFilter(filterType, e.target.checked);
                import('./roadmap.js').then(m => m.renderPSSRRoadmap(false));
            });
        }
    });

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
    const gachaRatesModal = document.getElementById('gacha-rates-modal');
    const closeModal = document.querySelector('.close-modal');
    const closeGachaLogModal = document.querySelector('.close-log-modal');
    const closeGachaRatesModal = document.querySelector('.close-rates-modal');

    function hideModal() {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            modal.style.display = 'none';

            // [수정] 모달이 닫힐 때 계산기가 활성화된 상태라면 무조건 갱신
            if (document.querySelector('.stat-header') || window._modalCardId) {
                if (typeof window.refreshAll === 'function') {
                    window.refreshAll();
                }
            }
            // 상태 초기화
            window._modalCardId = null;
            window._modalInitialLB = null;
        }
    }

    function hideGachaLogModal() {
        if (gachaLogModal && !gachaLogModal.classList.contains('hidden')) {
            gachaLogModal.classList.add('hidden');
            gachaLogModal.style.display = 'none';
        }
    }

    function hideGachaRatesModal() {
        if (gachaRatesModal && !gachaRatesModal.classList.contains('hidden')) {
            gachaRatesModal.classList.add('hidden');
            gachaRatesModal.style.display = 'none';
        }
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modal && (modal.style.display === 'flex' || !modal.classList.contains('hidden'))) {
                history.back();
            } else {
                hideModal();
            }
        });
    }

    if (closeGachaLogModal) {
        closeGachaLogModal.addEventListener('click', () => {
            if (gachaLogModal && (gachaLogModal.style.display === 'flex' || !gachaLogModal.classList.contains('hidden'))) {
                history.back();
            } else {
                hideGachaLogModal();
            }
        });
    }

    if (closeGachaRatesModal) {
        closeGachaRatesModal.addEventListener('click', () => {
            if (gachaRatesModal && (gachaRatesModal.style.display === 'flex' || !gachaRatesModal.classList.contains('hidden'))) {
                history.back();
            } else {
                hideGachaRatesModal();
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            if (modal.style.display === 'flex' || !modal.classList.contains('hidden')) {
                history.back();
            } else {
                hideModal();
            }
        }
        if (event.target === gachaLogModal) {
            if (gachaLogModal.style.display === 'flex' || !gachaLogModal.classList.contains('hidden')) {
                history.back();
            } else {
                hideGachaLogModal();
            }
        }
        if (event.target === gachaRatesModal) {
            if (gachaRatesModal.style.display === 'flex' || !gachaRatesModal.classList.contains('hidden')) {
                history.back();
            } else {
                hideGachaRatesModal();
            }
        }
    });

    // 브라우저 뒤로가기 버튼 처리
    window.addEventListener('popstate', (event) => {
        const cardModal = document.getElementById('card-modal');
        const videoModal = document.getElementById('video-modal');
        const recommendModal = document.getElementById('calc-recommend-modal');
        const memorySelectModal = document.getElementById('calc-memory-select-modal');
        const tuneModal = document.getElementById('calc-tune-modal');
        const statDetailModal = document.getElementById('stat-detail-modal');
        const isVideoModalOpen = window.__videoModalOpen ||
            window.__videoModalPendingClose ||
            document.body.classList.contains('video-modal-open') ||
            (videoModal && (videoModal.style.display === 'flex' || !videoModal.classList.contains('hidden')));

        if (isVideoModalOpen) {
            if (typeof window.closeVideoModal === 'function') window.closeVideoModal(true);
            else {
                if (videoModal) {
                    videoModal.style.display = 'none';
                    videoModal.classList.add('hidden');
                }
                const iframe = document.getElementById('video-iframe');
                if (iframe) iframe.src = '';
                document.body.classList.remove('video-modal-open');
                window.__videoModalOpen = false;
                window.__videoModalPendingClose = false;
            }
            return;
        }

        if (statDetailModal && statDetailModal.style.display !== 'none' && !statDetailModal.classList.contains('hidden')) {
            if (typeof window.closeStatDetailModal === 'function') window.closeStatDetailModal(true);
            else {
                statDetailModal.classList.add('hidden');
                statDetailModal.style.display = 'none';
            }
            return;
        }

        if (tuneModal && tuneModal.style.display !== 'none' && !tuneModal.classList.contains('hidden')) {
            tuneModal.remove();
            return;
        }

        if (memorySelectModal && memorySelectModal.style.display !== 'none' && !memorySelectModal.classList.contains('hidden')) {
            if (typeof window.closeMemoryModal === 'function') window.closeMemoryModal(true);
            else {
                memorySelectModal.classList.add('hidden');
                memorySelectModal.style.display = 'none';
                memorySelectModal.remove();
            }
            return;
        }

        if (recommendModal && recommendModal.style.display !== 'none' && !recommendModal.classList.contains('hidden')) {
            if (typeof window.closeRecommendModal === 'function') window.closeRecommendModal(true);
            else {
                recommendModal.classList.add('hidden');
                recommendModal.style.display = 'none';
            }
            return;
        }

        // 1. 최상위 상세 모달이 열려있으면 얘부터 닫기 (최우선순위)
        if (cardModal && (cardModal.style.display === 'flex' || !cardModal.classList.contains('hidden'))) {
            hideModal();
            return;
        }

        // 2. 모든 종류의 모달 및 툴팁 자동 감지 및 닫기
        const allPossibleModals = document.querySelectorAll('.modal, .calc-tooltip, .modal-content, .confirm-modal-content, .side-panel, #calc-side-panel');
        let overlayClosed = false;

        allPossibleModals.forEach(m => {
            // 보이는 상태인지 체크 (display가 none이 아니거나 hidden 클래스가 없는 경우)
            const isVisible = m.style.display !== 'none' && !m.classList.contains('hidden') && m.offsetHeight > 0;
            
            if (isVisible) {
                // 상세 모달(card-modal)은 특수 처리 (데이터 갱신 등)를 위해 아래 로직으로 토스
                if (m.id === 'card-modal' || m.closest('#card-modal')) return;

                // 일반 모달 닫기
                if (m.classList.contains('calc-tooltip')) {
                    m.remove(); // 툴팁은 보통 remove
                } else if (m.id === 'calc-side-panel' || m.classList.contains('side-panel')) {
                    if (typeof window.closeSupportCardPanel === 'function') window.closeSupportCardPanel(true);
                    else { m.classList.add('hidden'); m.style.display = 'none'; }
                } else if (m.id === 'video-modal') {
                    if (typeof window.closeVideoModal === 'function') window.closeVideoModal(true);
                    else {
                        m.style.display = 'none'; m.classList.add('hidden');
                        const iframe = document.getElementById('video-iframe');
                        if (iframe) iframe.src = '';
                    }
                } else if (m.id === 'calc-recommend-modal') {
                    if (typeof window.closeRecommendModal === 'function') window.closeRecommendModal(true);
                    else { m.classList.add('hidden'); m.style.display = 'none'; }
                } else if (m.querySelector('.memory-select-content') || m.querySelector('.memory-option-list')) {
                    // 메모리 선택 모달은 아이디가 없을 수 있으므로 내부 구조로 판단
                    if (typeof window.closeMemoryModal === 'function') window.closeMemoryModal(true);
                    else m.remove();
                } else {
                    // 일반 모달은 숨기기
                    m.style.display = 'none';
                    m.classList.add('hidden');
                    // 만약 동적으로 생성된 slot-modal 등이라면 삭제
                    if (m.id === 'slot-modal' || m.id === 'stat-detail-modal') m.remove();
                }
                overlayClosed = true;
            }
        });

        if (overlayClosed) return;

        const gachaLogModal = document.getElementById('gacha-log-modal');
        const gachaRatesModal = document.getElementById('gacha-rates-modal');
        const resultsContainer = document.querySelector('#gacha-results');
        const calcPanel = document.getElementById('calc-side-panel');

        // 1. 영상 재생 중 예외 처리 (가챠 애니메이션)
        if (document.body.classList.contains('immersive-mode')) {
            history.pushState({ target: 'gacha', view: 'playing' }, "");
            return;
        }




        // 4. 가챠 로그 모달이 열려있으면 닫기
        if (gachaLogModal && (gachaLogModal.style.display === 'flex' || !gachaLogModal.classList.contains('hidden'))) {
            hideGachaLogModal();
            return;
        }

        // [추가] 가챠 확률 모달이 열려있으면 닫기
        if (gachaRatesModal && (gachaRatesModal.style.display === 'flex' || !gachaRatesModal.classList.contains('hidden'))) {
            hideGachaRatesModal();
            return;
        }

        // 3. 계산기 패널이 열려있으면 패널만 닫기
        if (calcPanel && calcPanel.classList.contains('open')) {
            if (window.closeSupportCardPanel) {
                window.closeSupportCardPanel(true);
            } else {
                calcPanel.classList.remove('open');
                const overlay = document.getElementById('panel-overlay');
                if (overlay) overlay.classList.remove('show');
            }
            return;
        }

        // 4. 가챠 결과 화면 처리
        if (resultsContainer && resultsContainer.children.length > 0) {
            document.body.classList.remove('immersive-mode');
            resultsContainer.innerHTML = '';
            renderGacha();
            return;
        }

        // 5. 기본 내비게이션 (현재 해시값 기준)
        const target = window.location.hash.substring(1) || 'home';
        handleNavigation(target, true);
    });

    // [추가] 페이지 가시성(Visibility) 감지하여 오디오 제어
    document.addEventListener('visibilitychange', () => {
        import('./gacha.js').then(m => {
            if (m.audioCtx) {
                if (document.hidden) {
                    // 탭을 내리거나 홈 화면으로 나갔을 때 일시 정지
                    m.audioCtx.suspend();
                } else {
                    // 다시 돌아왔을 때 재개 (음소거 상태가 아닐 때만)
                    const { state } = m;
                    if (state && !state.gachaMuted) {
                        m.audioCtx.resume();
                    }
                }
            }
        });
    });
});
