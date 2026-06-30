// main.js
import './storage-override.js';
import { state, setLanguage } from './state.js';
import { updatePageTranslations, initMobileHeightFix, translate } from './utils.js';
import { handleNavigation } from './router.js';
import { renderSupport, updateGlobalBackgroundColor, preloadSupportImages, preloadCalcImages } from './ui.js';
import { renderGacha } from './gacha.js';
import { loginWithGoogle, logout, auth, onAuthStateChanged } from './firebase-auth.js';
import './firebase-sync.js';

// Idol Grid Drag-to-Scroll Implementation (글로벌 스코프로 이동하여 에러 방지)
let isDown = false;
let startX;
let scrollLeft;

document.addEventListener('DOMContentLoaded', () => {
    let isAuthInitialized = false;

    // [구글 로그인 예외 처리 핸들러]
    const handleLoginError = (err) => {
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
            return; // 사용자가 창을 닫은 경우 조용히 처리
        }
        alert("로그인 실패: " + err.message);
    };

    // [구글 로그인 UI 동기화 및 이벤트 바인딩]
    const updateAuthUI = (user) => {
        // 1. 홈 카드형 버튼 업데이트
        const homeAuthBtn = document.getElementById('home-auth-btn');
        if (homeAuthBtn) {
            const titleEl = document.getElementById('home-auth-title');
            const iconWrapEl = document.getElementById('home-auth-icon-wrap');
            const descEl = document.getElementById('home-auth-desc');

            if (user) {
                if (titleEl) {
                    titleEl.removeAttribute('data-i18n');
                    titleEl.textContent = user.displayName || translate('ui_user_default', {}, '유저');
                }
                if (iconWrapEl) {
                    iconWrapEl.innerHTML = `<img src="${user.photoURL || 'icons/idol.svg'}" class="quick-btn-icon" style="border-radius: 50%; object-fit: cover; border: 1px solid var(--idol-theme-color);" alt="Avatar">`;
                }
                if (descEl) {
                    descEl.textContent = translate('desc_logout_card', {}, '클릭하여 로그아웃합니다.');
                }
            } else {
                // 로그인 검증 대기 중이고 기존 세션 기록이 있는 경우 "로그인 중..." 노출
                if (!isAuthInitialized && localStorage.getItem('sync_loaded')) {
                    if (titleEl) {
                        titleEl.setAttribute('data-i18n', 'ui_logging_in');
                        titleEl.textContent = translate('ui_logging_in', {}, '로그인 중...');
                    }
                } else {
                    if (titleEl) {
                        titleEl.setAttribute('data-i18n', 'btn_login_card');
                        titleEl.textContent = translate('btn_login_card', {}, '구글 로그인');
                    }
                    if (iconWrapEl) {
                        iconWrapEl.innerHTML = `<img src="icons/user.svg" alt="User" class="quick-btn-icon">`;
                    }
                    if (descEl) {
                        descEl.textContent = translate('desc_login_card', {}, '구글 계정에 로그인합니다. 계정에는 서포카 설정 및 계산기 프리셋 등의 데이터가 저장됩니다.');
                    }
                }
            }
        }

        // 2. PC 전용 하단 네비게이션 바 로그인 버튼 업데이트
        const navAuthBtn = document.getElementById('nav-auth-btn');
        if (navAuthBtn) {
            if (user) {
                navAuthBtn.classList.add('logged-in');
                navAuthBtn.innerHTML = `<img src="${user.photoURL || 'icons/idol.svg'}" class="btn-icon" style="border-radius: 50%; object-fit: cover;" alt="Avatar">`;
            } else {
                navAuthBtn.classList.remove('logged-in');
                navAuthBtn.innerHTML = `<img src="icons/user.svg" alt="User" class="btn-icon">`;
            }
        }
    };

    // PC 전용 하단 네비게이션 바 로그인 버튼 클릭 이벤트 바인딩
    const navAuthBtn = document.getElementById('nav-auth-btn');
    if (navAuthBtn) {
        navAuthBtn.addEventListener('click', () => {
            if (auth.currentUser) {
                if (confirm(translate('ui_logout_confirm', {}, '로그아웃 하시겠습니까?'))) {
                    logout();
                }
            } else {
                loginWithGoogle().catch(handleLoginError);
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        isAuthInitialized = true;
        updateAuthUI(user);
    });

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
        updateAuthUI(auth.currentUser);
    };

    // 화면 전환 이벤트 발생 시 동기화 (초기화 및 네비게이션 전에 먼저 등록)
    window.addEventListener('viewChanged', syncGlobalUI);

    // 초기 실행
    syncGlobalUI();
    document.documentElement.lang = state.currentLang;

    // 초기 화면 렌더링 (URL 해시 반영)
    const initialTarget = window.location.hash.substring(1) || sessionStorage.getItem('lastTarget') || 'home';
    handleNavigation(initialTarget);

    // 해시 변경 이벤트 리스너 추가
    window.addEventListener('hashchange', () => {
        const target = window.location.hash.substring(1) || 'home';
        handleNavigation(target, true);
    });

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
                import('./ui.js').then(m => {
                    m.renderHome();
                    updateAuthUI(auth.currentUser);
                });
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
            if (quickBtn.id === 'home-auth-btn') {
                if (auth.currentUser) {
                    if (confirm(translate('ui_logout_confirm', {}, '로그아웃 하시겠습니까?'))) {
                        logout();
                    }
                } else {
                    loginWithGoogle().catch(handleLoginError);
                }
                return;
            }

            const target = quickBtn.dataset.target;
            if (target === 'idol-stats') {
                import('./idolPossessionModal.js').then(m => m.openIdolPossessionModal());
            } else {
                handleNavigation(target);
            }
        }
    });

    // 서포트 카드 및 계산기 탭/버튼 프리로드 연결 (이벤트 위임)
    ['mouseover', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            const supportBtn = e.target.closest('.menu-btn[data-target="support"], .home-quick-btn[data-target="support"]');
            if (supportBtn) preloadSupportImages();

            const calcBtn = e.target.closest('.menu-btn[data-target="calc"], .home-quick-btn[data-target="calc"]');
            if (calcBtn) preloadCalcImages();
        }, evt === 'touchstart' ? { passive: true } : false);
    });

    // [반응형 대응] 768px 경계를 넘나들 때 서포트 패널 닫기 및 로드맵 재렌더링
    const getLayoutStage = (w) => {
        if (w <= 768) return 'mobile';
        return 'pc';
    };

    let currentStage = getLayoutStage(window.innerWidth);
    window.addEventListener('resize', () => {
        const nextStage = getLayoutStage(window.innerWidth);
        if (currentStage !== nextStage) {
            currentStage = nextStage;

            // 서포트 패널 닫기 (768px 경계를 넘나들 때 UI 깨짐 방지)
            if (typeof window.closeSupportCardPanel === 'function') {
                window.closeSupportCardPanel();
            }

            // 로드맵 컨테이너가 존재하는 경우에만 재렌더링
            if (document.getElementById('pssr-roadmap-list')) {
                import('./roadmap.js').then(m => {
                    m.renderPSSRRoadmap(false);
                });
            }

            // [추가] 계산기 화면 프리셋 반응형 대응 갱신
            const previewEl = document.getElementById('preset-preview');
            if (previewEl && typeof window.renderPresetPreview === 'function') {
                window.renderPresetPreview(previewEl);
            }
            const slotsContainer = document.getElementById('calc-preset-slots-container');
            if (slotsContainer && slotsContainer.style.display !== 'none' && typeof window.renderCalcPresetSlots === 'function') {
                window.renderCalcPresetSlots(slotsContainer);
            }

            // [추가] 서포트/계산기 공유 및 모달 반응형 대응을 위해 닫기
            const slotShareModal = document.getElementById('slot-share-modal');
            if (slotShareModal && slotShareModal.dataset.processing !== 'true') {
                slotShareModal.remove();
            }
            const slotModal = document.getElementById('slot-modal');
            if (slotModal) {
                slotModal.remove();
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

    let activeScrollContainer = null;

    document.addEventListener('mousedown', (e) => {
        const scrollContainer = e.target.closest('.idol-grid, .idol-video-list, #preset-preview');
        if (!scrollContainer) return;
        isDown = true;
        activeScrollContainer = scrollContainer;
        scrollContainer.classList.add('active');
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
    });

    document.addEventListener('mouseleave', () => {
        if (activeScrollContainer) activeScrollContainer.classList.remove('active');
        isDown = false;
        activeScrollContainer = null;
    });

    document.addEventListener('mouseup', () => {
        if (activeScrollContainer) activeScrollContainer.classList.remove('active');
        isDown = false;
        activeScrollContainer = null;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDown || !activeScrollContainer) return;
        e.preventDefault();
        const x = e.pageX - activeScrollContainer.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절
        activeScrollContainer.scrollLeft = scrollLeft - walk;
    });

    // 로고 클릭 -> 홈
    if (logo) logo.addEventListener('click', () => handleNavigation('home'));

    // 모달 닫기
    const modal = document.getElementById('card-modal');
    const gachaLogModal = document.getElementById('gacha-log-modal');
    const gachaRatesModal = document.getElementById('gacha-rates-modal');
    const closeGachaLogModal = document.querySelector('.close-log-modal');
    const closeGachaRatesModal = document.querySelector('.close-rates-modal');

    function hideModal() {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            modal.style.display = 'none';

            // [추가] 모달이 닫힐 때 활성화된 모든 서포트 아이템 툴팁 제거
            document.querySelectorAll('.support-item-tooltip').forEach(el => el.remove());

            // [수정] 모달이 닫힐 때 계산기가 활성화된 상태라면 무조건 갱신
            if (document.querySelector('.stat-header') || window._modalCardId) {
                if (typeof window.refreshAll === 'function') {
                    window.refreshAll();
                }
            }
            // 상태 및 이미지 초기화
            window._modalCardId = null;
            window._modalInitialLB = null;

            const mImg = document.getElementById('modal-img');
            const mRarity = document.getElementById('modal-rarity');
            const mPlan = document.getElementById('modal-plan');
            const mType = document.getElementById('modal-type');
            const mExtraIcon = document.getElementById('modal-extra-icon');
            if (mImg) mImg.src = '';
            if (mRarity) mRarity.src = '';
            if (mPlan) mPlan.src = '';
            if (mType) mType.src = '';
            if (mExtraIcon) mExtraIcon.src = '';
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
        // 저장방식 선택 모달이 열려있는 경우, 저장방식 선택 모달만 닫음
        const saveOptionsModal = document.querySelector('.possession-save-options-content')?.closest('.modal');
        if (saveOptionsModal && saveOptionsModal.style.display !== 'none' && !saveOptionsModal.classList.contains('hidden')) {
            if (typeof saveOptionsModal.onClose === 'function') {
                saveOptionsModal.onClose();
            } else {
                saveOptionsModal.remove();
            }
            return;
        }

        const verygoodModal = document.getElementById('verygood-download-modal');
        if (verygoodModal) {
            if (typeof window.closeVeryGoodDownloadModal === 'function') window.closeVeryGoodDownloadModal(true);
            else verygoodModal.remove();
            return;
        }

        const cardModal = document.getElementById('card-modal');
        const videoModal = document.getElementById('video-modal');
        const recommendModal = document.getElementById('calc-recommend-modal');
        const memorySelectModal = document.getElementById('calc-memory-select-modal');
        const tuneModal = document.getElementById('calc-tune-modal');
        const statDetailModal = document.getElementById('stat-detail-modal');
        const presetSaveModal = document.getElementById('preset-save-modal');
        const supportPresetSaveModal = document.getElementById('support-preset-save-modal');
        const slotShareModal = document.getElementById('slot-share-modal');
        const hifEvalModal = document.getElementById('hif-eval-modal');
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

        const pssrInfoModal = document.getElementById('pssr-info-modal');
        if (pssrInfoModal && pssrInfoModal.style.display !== 'none' && !pssrInfoModal.classList.contains('hidden')) {
            if (typeof window.closeProduceCardInfoModal === 'function') window.closeProduceCardInfoModal(true);
            else pssrInfoModal.remove();
            return;
        }

        const possessionModal = document.getElementById('possession-modal');
        if (possessionModal && possessionModal.style.display !== 'none' && !possessionModal.classList.contains('hidden')) {
            if (possessionModal.dataset.preventPopstate === 'true') {
                possessionModal.removeAttribute('data-prevent-popstate');
                return;
            }
            possessionModal.remove();
            return;
        }

        const idolPossessionModal = document.getElementById('idol-possession-modal');
        if (idolPossessionModal && idolPossessionModal.style.display !== 'none' && !idolPossessionModal.classList.contains('hidden')) {
            if (idolPossessionModal.dataset.preventPopstate === 'true') {
                idolPossessionModal.removeAttribute('data-prevent-popstate');
                return;
            }
            idolPossessionModal.remove();
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

        if (hifEvalModal && hifEvalModal.style.display !== 'none' && !hifEvalModal.classList.contains('hidden')) {
            if (typeof window.closeHifEvalModal === 'function') window.closeHifEvalModal(true);
            else {
                hifEvalModal.classList.add('hidden');
                hifEvalModal.style.display = 'none';
            }
            return;
        }

        const confirmResetWeeksModal = document.getElementById('calc-confirm-reset-weeks-modal');
        if (confirmResetWeeksModal && confirmResetWeeksModal.style.display !== 'none' && !confirmResetWeeksModal.classList.contains('hidden')) {
            if (typeof window.closeConfirmResetWeeksModal === 'function') window.closeConfirmResetWeeksModal(true);
            else {
                confirmResetWeeksModal.classList.add('hidden');
                confirmResetWeeksModal.style.display = 'none';
            }
            return;
        }

        if (tuneModal && tuneModal.style.display !== 'none' && !tuneModal.classList.contains('hidden')) {
            tuneModal.remove();
            return;
        }

        if (presetSaveModal && presetSaveModal.style.display !== 'none' && !presetSaveModal.classList.contains('hidden')) {
            presetSaveModal.remove();
            return;
        }

        if (supportPresetSaveModal && supportPresetSaveModal.style.display !== 'none' && !supportPresetSaveModal.classList.contains('hidden')) {
            supportPresetSaveModal.remove();
            return;
        }

        if (slotShareModal && slotShareModal.style.display !== 'none' && !slotShareModal.classList.contains('hidden')) {
            if (slotShareModal.dataset.processing === 'true') {
                history.pushState(null, "");
                return;
            }
            slotShareModal.remove();
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

    // [추가] 페이지 로드 직후 가벼운 썸네일 및 핵심 아이콘 즉시 프리로드 (사용자 체감 성능 향상)
    setTimeout(() => {
        preloadSupportImages();
    }, 100);
});
