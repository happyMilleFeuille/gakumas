// gacha.js
import { updatePageTranslations } from './utils.js';
import { state, setJewels, setTotalPulls, clearGachaLog, setGachaType, setSelectedPickup, idolColors } from './state.js';
import translations from './i18n.js';
import { setupGachaAnimation } from './gachaanimation.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { audioCtx, assetBlobs, loadGachaAssets, playSound, stopBGM, playMainBGM, isAllLoaded, fetchTotalAssetSizeMB } from './gacha-assets.js';
import { initGachaDrawer, openDrawer } from './gacha-drawer.js';
import { bindSafeClick, updateJewelUI, updateTotalPullsUI } from './gacha-utils.js';
import { renderPickupSelector, renderResults } from './gacha-ui-render.js';
import { handleNavigation } from './router.js';

export { audioCtx, playSound, stopBGM, playMainBGM };

/**
 * 가챠 메인 렌더링 함수
 */
export function renderGacha(isRefresh = false) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    document.body.classList.remove('immersive-mode', 'gacha-result-active'); 
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // 이미 로드되었거나, 이번 세션에서 이미 승인했거나, 새로고침인 경우 바로 진행
    const isApproved = sessionStorage.getItem('gachaAssetsApproved') === 'true';
    if (isAllLoaded || isApproved || isRefresh) {
        startGachaUI(contentArea, isRefresh);
    } else {
        showDownloadConfirm(contentArea);
    }
}

function showDownloadConfirm(contentArea) {
    const tpl = document.getElementById('tpl-gacha-confirm');
    if (!tpl) return startGachaUI(contentArea, false);

    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    // 동적 용량 표시 (비동기 계산)
    const sizeMsg = contentArea.querySelector('.gacha-confirm-body p:first-child');
    if (sizeMsg) {
        sizeMsg.textContent = `가챠 리소스 용량 확인 중...`;
        fetchTotalAssetSizeMB().then(size => {
            sizeMsg.textContent = `가챠 연출 및 음원 리소스를 다운로드합니다. (약 ${size}MB)`;
        });
    }

    const startBtn = document.getElementById('btn-gacha-start');
    const cancelBtn = document.getElementById('btn-gacha-cancel');

    if (startBtn) {
        startBtn.onclick = () => {
            sessionStorage.setItem('gachaAssetsApproved', 'true');
            startGachaUI(contentArea, false);
        };
    }
    if (cancelBtn) {
        cancelBtn.onclick = () => handleNavigation('home');
    }
}

function startGachaUI(contentArea, isRefresh) {
    const fixedBtnArea = setupFixedButtons();
    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    initGachaDrawer();

    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) { fixedBg.style.transition = 'none'; fixedBg.style.backgroundImage = ''; fixedBg.style.filter = ''; }

    const ui = {
        btn1: document.getElementById('btn-1pull-fixed'),
        btn10: document.getElementById('btn-10pull-fixed'),
        jewelCount: document.getElementById('jewel-count'),
        totalPullCount: document.getElementById('total-pull-count'),
        muteBtn: document.getElementById('gacha-mute-btn'),
        pickupSelector: contentArea.querySelector('#gacha-pickup-selector'),
        resultsContainer: contentArea.querySelector('#gacha-results'),
        fixedBtnArea
    };

    if (ui.btn1) ui.btn1.style.pointerEvents = 'auto';
    if (ui.btn10) ui.btn10.style.pointerEvents = 'auto';

    initUIState(ui);
    
    // 초기 진입 시 쥬얼 컨테이너 표시 보장
    const jewelContainer = document.getElementById('jewel-container');
    if (jewelContainer) jewelContainer.classList.remove('hidden');

    initNavigation(ui);
    initHeaderControls(ui);
    
    const animation = setupAnimationLogic(ui, contentArea);
    bindGachaActions(ui, animation);

    updateTypeUI(ui);

    // 단순 갱신이 아닐 때만 BGM 재생
    if (!isRefresh && !state.gachaMuted) playMainBGM();

    const spinner = document.getElementById('gacha-spinner');
    if (spinner) spinner.classList.add('active');
    loadGachaAssets().then(() => {
        updateGachaButtonsState(ui);
        if (spinner) spinner.classList.remove('active');
    }).catch(() => { if (spinner) spinner.classList.remove('active'); });
}

function setupFixedButtons() {
    const area = document.getElementById('gacha-fixed-buttons');
    if (area) {
        area.classList.add('loading-shift'); area.classList.remove('view-result'); area.classList.add('view-main');
        area.style.display = 'flex'; area.classList.remove('hidden');
        requestAnimationFrame(() => { setTimeout(() => area.classList.remove('loading-shift'), 50); });
    }
    return area;
}

function initUIState(ui) {
    updateJewelUI(ui);
    updateTotalPullsUI(ui);
    const controlsTop = document.querySelector('.gacha-controls-top');
    if (controlsTop) controlsTop.classList.remove('hidden');
    
    const addJewelBtn = document.getElementById('btn-add-jewel');
    if (addJewelBtn) {
        addJewelBtn.onclick = (e) => {
            e.stopPropagation();
            setJewels(state.jewels + 8200);
            updateJewelUI(ui);
            updateGachaButtonsState(ui); // 버튼 활성화 상태 즉시 갱신 추가
        };
    }
}

function initNavigation(ui) {
    const types = ['normal', 'limited', 'unit', 'fes', 'selection'];
    const typeDisplay = document.getElementById('current-gacha-type-display');
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');
    const gachaContainer = document.querySelector('.gacha-container');

    if (!btnPrev || !btnNext) return;

    const animateChange = (direction) => {
        const spinner = document.getElementById('gacha-spinner');
        const isResultView = ui.fixedBtnArea?.classList.contains('view-result');
        if (document.body.classList.contains('immersive-mode') || isResultView || spinner?.classList.contains('active')) return;

        // [수정] ui.pickupSelector(과거 참조) 대신 현재 DOM에 있는 배너를 직접 참조
        const currentPickupSelector = document.getElementById('gacha-pickup-selector');

        playSound('gasya/slide.mp3');
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        
        // [수정] 배너(currentPickupSelector)를 애니메이션 대상에 포함
        const elements = [typeDisplay, btnPrev, btnNext, currentPickupSelector];

        elements.forEach(el => el?.classList.add(outClass));
        setTimeout(() => {
            let idx = types.indexOf(state.gachaType);
            idx = (direction === 'next') ? (idx + 1) % types.length : (idx - 1 + types.length) % types.length;
            setGachaType(types[idx]);

            // [수정] 최신 배너 엘리먼트를 포함하여 UI 업데이트 호출
            const latestUi = { ...ui, pickupSelector: currentPickupSelector };
            updateTypeUI(latestUi);

            elements.forEach(el => {
                if(el) { el.classList.remove(outClass); void el.offsetWidth; el.classList.add(inClass); }
            });
            setTimeout(() => elements.forEach(el => el?.classList.remove(inClass)), 80);
        }, 80);
    };

    btnPrev.onclick = () => animateChange('prev');
    btnNext.onclick = () => animateChange('next');

    // 통합 스와이프 핸들러
    const onSwipe = (endX, startX) => {
        if (startX === null || startX === undefined) return;
        const diff = endX - startX;
        if (Math.abs(diff) > 50) animateChange(diff > 0 ? 'prev' : 'next');
    };

    // 공통 이벤트 바인딩 로직
    const bindSwipeEvents = (target) => {
        if (!target || target.dataset.swipeInitialized) return;
        target.dataset.swipeInitialized = "true";
        let sX = null;

        target.addEventListener('touchstart', (e) => { sX = e.changedTouches[0].screenX; }, { passive: true });
        target.addEventListener('touchend', (e) => { if (sX !== null) onSwipe(e.changedTouches[0].screenX, sX); sX = null; }, { passive: true });
        target.addEventListener('mousedown', (e) => { sX = e.screenX; });
        target.addEventListener('mouseup', (e) => { if (sX !== null) onSwipe(e.screenX, sX); sX = null; });
        target.addEventListener('mouseleave', () => { sX = null; });
    };

    [ui.fixedBtnArea, gachaContainer].forEach(bindSwipeEvents);
}

function initHeaderControls(ui) {
    const ids = { log: 'btn-gacha-log', rates: 'btn-gacha-rates', reset: 'btn-gacha-reset' };
    const logBtn = document.getElementById(ids.log);
    const ratesBtn = document.getElementById(ids.rates);
    const resetBtn = document.getElementById(ids.reset);

    if (logBtn) {
        logBtn.classList.remove('hidden');
        logBtn.onclick = () => { history.pushState({ modalOpen: 'gachaLog' }, ""); import('./gachalog.js').then(m => m.openGachaLogModal()); };
    }
    if (ratesBtn) {
        ratesBtn.classList.remove('hidden');
        ratesBtn.onclick = () => { history.pushState({ modalOpen: 'rates' }, ""); import('./gacharates.js').then(m => m.openGachaRatesModal()); };
    }
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.onclick = () => { setTotalPulls(0, state.gachaType); clearGachaLog(state.gachaType); renderGacha(); };
    }
    if (ui.muteBtn) {
        ui.muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊'; 
        ui.muteBtn.onclick = () => { state.gachaMuted = !state.gachaMuted; state.gachaMuted ? stopBGM('all') : playMainBGM(); ui.muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊'; };
        const muteControls = document.getElementById('gacha-header-controls');
        if (muteControls) { muteControls.classList.remove('hidden'); muteControls.style.display = 'flex'; }
    }
}

function updateTypeUI(ui) {
    const types = ['normal', 'limited', 'unit', 'fes', 'selection'];
    const typeDisplayNames = {
        normal: state.currentLang === 'ko' ? '통상' : '恒常', limited: state.currentLang === 'ko' ? '한정' : '限定',
        unit: state.currentLang === 'ko' ? '유닛' : 'ユニット', fes: state.currentLang === 'ko' ? '페스' : 'フェ스',
        selection: state.currentLang === 'ko' ? '셀렉션' : 'セレクション'
    };

    const typeDisplay = document.getElementById('current-gacha-type-display');
    const typeSpan = typeDisplay?.querySelector('span');
    if (typeSpan) typeSpan.textContent = typeDisplayNames[state.gachaType];
    
    document.querySelectorAll('.gacha-type-indicator .dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === types.indexOf(state.gachaType));
    });

    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');
    if (btnPrev && btnNext) {
        const idx = types.indexOf(state.gachaType);
        const prevSpan = btnPrev.querySelector('span'), nextSpan = btnNext.querySelector('span');
        if (prevSpan) prevSpan.textContent = typeDisplayNames[types[(idx - 1 + types.length) % types.length]];
        if (nextSpan) nextSpan.textContent = typeDisplayNames[types[(idx + 1) % types.length]];
    }

    updateTotalPullsUI(ui);
    updateGachaButtonsState(ui);
    renderPickupSelector(ui);
}

function setupAnimationLogic(ui, contentArea) {
    let prevPulls = 0;
    return setupGachaAnimation(contentArea, assetBlobs, {
        onStart: (mode, actualPrevPulls) => {
            prevPulls = actualPrevPulls;
            ui.pickupSelector?.classList.add('hidden');
            const muteControls = document.getElementById('gacha-header-controls');
            if (muteControls) muteControls.style.display = 'none';
            ['btn-gacha-log', 'btn-gacha-rates', 'btn-gacha-reset', 'jewel-container', 'gacha-controls-top'].forEach(id => {
                document.getElementById(id)?.classList.add('hidden');
                const el = document.querySelector('.' + id); if (el) el.classList.add('hidden');
            });
        },
        onFinish: (currentResults, gachaMode) => {
            document.body.classList.add('gacha-result-active');
            updateTotalPullsUI(ui, prevPulls);
            ['btn-gacha-log', 'btn-gacha-rates', 'jewel-container'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('hidden');
            });
            if (ui.fixedBtnArea) { ui.fixedBtnArea.classList.remove('view-main'); ui.fixedBtnArea.classList.add('view-result'); }
            
            if (ui.btn1 && ui.btn10) {
                ui.btn1.classList.add('close-style'); ui.btn1.innerHTML = `<span class='close-x'>✕</span> ${translations[state.currentLang].gacha_close}`;
                ui.btn1.onclick = () => { ui.btn1.style.pointerEvents = ui.btn10.style.pointerEvents = 'none'; setTimeout(() => renderGacha(), 100); };

                if (state.gachaType === 'selection') {
                    ui.btn10.style.display = 'none';
                } else {
                    const is10 = (gachaMode === 10);
                    ui.btn10.style.display = 'block';
                    ui.btn10.innerHTML = `${translations[state.currentLang][is10 ? 'gacha_10pull' : 'gacha_1pull']}<br><span class='btn-cost'>${is10 ? "2500" : "250"}</span>`;
                    ui.btn10.onclick = () => handleGachaClick(ui, gachaMode, ui.animationInstance);
                }
                ui.btn1.style.pointerEvents = ui.btn10.style.pointerEvents = 'none';
                setTimeout(() => { ui.btn1.style.pointerEvents = ui.btn10.style.pointerEvents = 'auto'; updateGachaButtonsState(ui); }, 300);
            }
            renderResults(ui, currentResults);
            const fixedBg = document.getElementById('fixed-bg');
            if (fixedBg) {
                // [수정] 마스크를 제거하고 결과 전용 배경 이미지를 선명하게 표시
                fixedBg.style.webkitMaskImage = 'none';
                fixedBg.style.maskImage = 'none';
                fixedBg.style.backgroundImage = "url('gasya/background.jpg')";
                fixedBg.style.backgroundSize = "cover";
                fixedBg.style.opacity = '1'; // 결과창 배경은 선명하게
            }
            history.pushState({ target: 'gacha', view: 'result' }, "");
        }
    });
}

function bindGachaActions(ui, animation) {
    ui.animationInstance = animation;
    if (ui.btn1) {
        ui.btn1.classList.remove('close-style');
        ui.btn1.innerHTML = `${translations[state.currentLang].gacha_1pull}<br><span class='btn-cost'>250</span>`;
        ui.btn1.onclick = () => handleGachaClick(ui, 1, animation);
    }
    if (ui.btn10) {
        ui.btn10.innerHTML = `${translations[state.currentLang].gacha_10pull}<br><span class='btn-cost'>2500</span>`;
        ui.btn10.onclick = () => handleGachaClick(ui, 10, animation);
    }
}

async function handleGachaClick(ui, mode, animation) {
    playSound('gasya/gasyaclick.mp3');
    const cost = mode === 1 ? 250 : 2500;
    if (ui.jewelCount) ui.jewelCount.textContent = Math.max(0, state.jewels - cost).toLocaleString();
    if (ui.btn1) ui.btn1.style.pointerEvents = 'none';
    if (ui.btn10) ui.btn10.style.pointerEvents = 'none';

    let customPool = null;
    if (state.gachaType === 'selection') {
        const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId);
        if (sel) customPool = sel.pool;
    } else if (state.gachaType === 'normal') {
        const norm = NORMAL_CONFIG.find(c => c.id === state.activeNormalId);
        if (norm) customPool = norm.pool;
    } else if (state.gachaType === 'limited') {
        const lim = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId);
        if (lim) customPool = lim.pool;
    } else if (state.gachaType === 'unit') {
        const unt = UNIT_CONFIG.find(c => c.id === state.activeUnitId);
        if (unt) customPool = unt.pool;
    } else if (state.gachaType === 'fes') {
        const fes = FES_CONFIG.find(c => c.id === state.activeFesId);
        if (fes) customPool = fes.pool;
    }

    const results = animation.prepareResults(mode, customPool); 
    const pssrCards = results.filter(c => c.rarity === 'PSSR');
    if (pssrCards.length > 0) {
        const loadPromises = pssrCards.map(card => {
            const videoPath = `gasya/pssr/${card.id}.mp4`;
            if (assetBlobs[videoPath]) return Promise.resolve();
            return fetch(videoPath).then(r => r.ok ? r.arrayBuffer() : Promise.reject())
                .then(buf => { assetBlobs[videoPath] = URL.createObjectURL(new Blob([buf], { type: 'video/mp4' })); })
                .catch(() => {});
        });
        await Promise.allSettled(loadPromises);
    }
    setTimeout(() => animation.startGacha(mode, results), 50);
}

function updateGachaButtonsState(ui) {
    const isResultView = ui.fixedBtnArea?.classList.contains('view-result');
    const currentPulls = state.totalPulls[state.gachaType] || 0;

    if (ui.btn1) {
        if (!isResultView && state.gachaType === 'selection') ui.btn1.style.display = 'none';
        else {
            ui.btn1.style.display = 'block';
            ui.btn1.disabled = isResultView ? false : (state.jewels < 250);
            if (!isResultView) ui.btn1.innerHTML = `${state.currentLang === 'ko' ? '1회 뽑기' : '1회引く'}<br><span class='btn-cost'>250</span>`;
        }
    }
    
    if (ui.btn10) {
        if (isResultView && state.gachaType === 'selection') {
            ui.btn10.style.display = 'none';
        } else if (!isResultView && state.gachaType === 'selection') {
            const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
            const pullCount = sel?.pull_count || 10, maxPulls = sel?.max_pulls || Infinity, cost = pullCount * 250;
            ui.btn10.style.display = 'block';
            if (currentPulls >= maxPulls) { ui.btn10.disabled = true; ui.btn10.style.opacity = '0.5'; }
            else { ui.btn10.disabled = (state.jewels < cost); ui.btn10.style.opacity = '1'; }
            const label = state.currentLang === 'ko' ? `${pullCount}회 뽑기` : `${pullCount}회引く`;
            ui.btn10.innerHTML = `${label}<br><span class='btn-cost'>${cost}</span>`;
            ui.btn10.onclick = () => handleGachaClick(ui, pullCount, ui.animationInstance);
        } else {
            ui.btn10.style.display = 'block'; ui.btn10.style.opacity = '1';
            const cost = 2500; ui.btn10.disabled = (state.jewels < cost);
            if (!isResultView) {
                ui.btn10.innerHTML = `${state.currentLang === 'ko' ? '10회 뽑기' : '10회引く'}<br><span class='btn-cost'>${cost}</span>`;
                ui.btn10.onclick = () => handleGachaClick(ui, 10, ui.animationInstance);
            }
        }
    }
}
