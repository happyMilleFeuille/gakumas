// gacha.js
import { updatePageTranslations } from './utils.js';
import { state, setJewels, setTotalPulls, clearGachaLog, setGachaType, setSelectedPickup, idolColors } from './state.js';
import translations from './i18n.js';
import { setupGachaAnimation } from './gachaanimation.js';
import { pickGacha } from './gachalist.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { audioCtx, assetBlobs, loadGachaAssets, playSound, stopBGM, playMainBGM } from './gacha-assets.js';

// 외부 노출이 필요한 함수들 (애니메이션 등에서 사용)
export { audioCtx, playSound, stopBGM, playMainBGM };

/**
 * 가챠 메인 렌더링 함수
 */
export function renderGacha() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    document.body.classList.remove('immersive-mode', 'gacha-result-active'); 
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const fixedBtnArea = setupFixedButtons();
    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) {
        fixedBg.style.transition = 'none';
        fixedBg.style.backgroundImage = '';
        fixedBg.style.filter = '';
    }

    // UI 요소 참조
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

    // 버튼 활성화 초기화 (먹통 방지)
    if (ui.btn1) ui.btn1.style.pointerEvents = 'auto';
    if (ui.btn10) ui.btn10.style.pointerEvents = 'auto';

    // 초기화 및 이벤트 바인딩
    initUIState(ui);
    initNavigation(ui);
    initHeaderControls(ui);
    
    const animation = setupAnimationLogic(ui, contentArea);
    bindGachaActions(ui, animation);

    updateTypeUI(ui);

    if (!state.gachaMuted) playMainBGM();

    // 자산 로딩
    const spinner = document.getElementById('gacha-spinner');
    if (spinner) spinner.classList.add('active');
    loadGachaAssets().then(() => {
        updateGachaButtonsState(ui);
        if (spinner) spinner.classList.remove('active');
    }).catch(() => {
        if (spinner) spinner.classList.remove('active');
    });
}

/**
 * 고정 버튼 영역 초기 설정
 */
function setupFixedButtons() {
    const area = document.getElementById('gacha-fixed-buttons');
    if (area) {
        area.classList.add('loading-shift');
        area.classList.remove('view-result');
        area.classList.add('view-main');
        area.style.display = 'flex';
        area.classList.remove('hidden');
        requestAnimationFrame(() => {
            setTimeout(() => area.classList.remove('loading-shift'), 50);
        });
    }
    return area;
}

/**
 * 초기 UI 상태 설정
 */
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
        };
    }
}

/**
 * 네비게이션 (이전/다음/스와이프) 초기화
 */
function initNavigation(ui) {
    const types = ['normal', 'limited', 'unit', 'fes', 'platinum', 'selection'];
    const typeDisplay = document.getElementById('current-gacha-type-display');
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');
    const gachaContainer = document.querySelector('.gacha-container');

    if (!btnPrev || !btnNext) return;

    const animateChange = (direction) => {
        const spinner = document.getElementById('gacha-spinner');
        const isResultView = ui.fixedBtnArea?.classList.contains('view-result');
        if (document.body.classList.contains('immersive-mode') || isResultView || spinner?.classList.contains('active')) return;

        playSound('gasya/slide.mp3');
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        const elements = [typeDisplay, btnPrev, btnNext];

        elements.forEach(el => el?.classList.add(outClass));
        setTimeout(() => {
            let idx = types.indexOf(state.gachaType);
            idx = (direction === 'next') ? (idx + 1) % types.length : (idx - 1 + types.length) % types.length;
            setGachaType(types[idx]);
            updateTypeUI(ui);
            elements.forEach(el => {
                if(el) { el.classList.remove(outClass); void el.offsetWidth; el.classList.add(inClass); }
            });
            setTimeout(() => elements.forEach(el => el?.classList.remove(inClass)), 80);
        }, 80);
    };

    btnPrev.onclick = () => animateChange('prev');
    btnNext.onclick = () => animateChange('next');

    // 스와이프 로직
    let touchStartX = 0;
    let isSliding = false;
    const handleSwipe = (endX) => {
        if (isSliding) return;
        const swipeDistance = endX - touchStartX;
        if (Math.abs(swipeDistance) > 50) {
            isSliding = true;
            animateChange(swipeDistance > 0 ? 'prev' : 'next');
            setTimeout(() => { isSliding = false; }, 300);
        }
    };

    const targets = [ui.fixedBtnArea, gachaContainer];
    targets.forEach(target => {
        if (!target || target.dataset.swipeInitialized) return;
        target.dataset.swipeInitialized = "true";
        target.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        target.addEventListener('touchend', (e) => handleSwipe(e.changedTouches[0].screenX), { passive: true });
        target.addEventListener('mousedown', (e) => { touchStartX = e.screenX; });
        target.addEventListener('mouseup', (e) => handleSwipe(e.screenX));
    });
}

/**
 * 상단 및 보조 컨트롤 버튼 초기화
 */
function initHeaderControls(ui) {
    const logBtn = document.getElementById('btn-gacha-log');
    const ratesBtn = document.getElementById('btn-gacha-rates');
    const resetBtn = document.getElementById('btn-gacha-reset');

    if (logBtn) {
        logBtn.classList.remove('hidden');
        logBtn.onclick = () => {
            history.pushState({ modalOpen: 'gachaLog' }, "");
            import('./gachalog.js').then(m => m.openGachaLogModal());
        };
    }
    if (ratesBtn) {
        ratesBtn.classList.remove('hidden');
        ratesBtn.onclick = () => {
            history.pushState({ modalOpen: 'rates' }, "");
            import('./gacharates.js').then(m => m.openGachaRatesModal());
        };
    }
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.onclick = () => {
            setTotalPulls(0, state.gachaType); 
            clearGachaLog(state.gachaType);
            renderGacha(); 
        };
    }
    if (ui.muteBtn) {
        ui.muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊'; 
        ui.muteBtn.onclick = () => {
            state.gachaMuted = !state.gachaMuted;
            state.gachaMuted ? stopBGM('all') : playMainBGM();
            ui.muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊';
        };
        const muteControls = document.getElementById('gacha-header-controls');
        if (muteControls) { muteControls.classList.remove('hidden'); muteControls.style.display = 'flex'; }
    }
}

/**
 * 가챠 타입 UI 업데이트 (도트, 이름, 픽업 선택기)
 */
function updateTypeUI(ui) {
    const types = ['normal', 'limited', 'unit', 'fes', 'platinum', 'selection'];
    const typeDisplayNames = {
        normal: state.currentLang === 'ko' ? '통상' : '恒常',
        limited: state.currentLang === 'ko' ? '한정' : '限定',
        unit: state.currentLang === 'ko' ? '유닛' : 'ユニット',
        fes: state.currentLang === 'ko' ? '페스' : 'フェス',
        platinum: state.currentLang === 'ko' ? '플래티넘' : 'プラチナ',
        selection: state.currentLang === 'ko' ? '셀렉션' : 'セレクション'
    };

    const typeDisplay = document.getElementById('current-gacha-type-display');
    const typeSpan = typeDisplay?.querySelector('span');
    if (typeSpan) typeSpan.textContent = typeDisplayNames[state.gachaType];
    
    document.querySelectorAll('.gacha-type-indicator .dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === types.indexOf(state.gachaType));
    });

    // 이전/다음 버튼 텍스트 업데이트
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');
    if (btnPrev && btnNext) {
        const idx = types.indexOf(state.gachaType);
        const prevSpan = btnPrev.querySelector('span');
        const nextSpan = btnNext.querySelector('span');
        if (prevSpan) prevSpan.textContent = typeDisplayNames[types[(idx - 1 + types.length) % types.length]];
        if (nextSpan) nextSpan.textContent = typeDisplayNames[types[(idx + 1) % types.length]];
    }

    updateTotalPullsUI(ui);
    updateGachaButtonsState(ui);
    renderPickupSelector(ui);
}

/**
 * 픽업 선택기 렌더링
 */
function renderPickupSelector(ui) {
    if (!ui.pickupSelector) return;

    if (state.gachaType === 'selection') {
        ui.pickupSelector.classList.remove('hidden');
        
        // 즐겨찾기 아이돌 색상 계산
        const favColor = idolColors[state.favoriteIdol] || "#ff4081";
        
        ui.pickupSelector.innerHTML = `
            <div class="selector-bg-container"></div>
            <div class="pickup-wrapper selection-wrapper">
                <div class="pickup-item selection-item" style="box-shadow: 0 0 20px 5px ${favColor}99;">
                    <div class="pickup-img-wrapper" style="border: 1px solid ${favColor};">
                        <div class="selection-banner-img" style="background-image: url('gasya/gasya_ongakusai1.webp'); width: 100%; height: 100%; background-size: cover; background-position: center;"></div>
                    </div>
                </div>
                <div class="pickup-name">초성음악제 DAY1</div>
            </div>
        `;
        return;
    }

    const typesWithPickups = ['normal', 'limited', 'unit', 'fes'];
    
    if (!typesWithPickups.includes(state.gachaType)) {
        ui.pickupSelector.classList.add('hidden');
        return;
    }

    ui.pickupSelector.classList.remove('hidden');
    ui.pickupSelector.innerHTML = '<div class="selector-bg-container"></div>'; 
    const bgContainer = ui.pickupSelector.querySelector('.selector-bg-container');
    const pickups = CURRENT_PICKUPS[state.gachaType];
    
    if (!pickups?.pssr?.length) return;

    const isUnit = (state.gachaType === 'unit');
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);

    const createBgItems = (activeId = null) => {
        if (!bgContainer) return;
        bgContainer.innerHTML = '';
        pickups.pssr.forEach(p => {
            const pid = typeof p === 'string' ? p : p.id;
            if (activeId && activeId !== pid) return; 
            const bgItem = document.createElement('div');
            bgItem.className = `selector-bg-item single-bg`;
            bgItem.style.backgroundImage = `url('idols/${pid}${checkHasCard(pid) ? '2' : '1'}.webp')`;
            bgContainer.appendChild(bgItem);
        });
    };

    const applyShadow = (el, pid) => {
        const charKey = pid.replace('ssr', '').split('_')[0];
        const color = idolColors[charKey] || "#ff4081";
        el.style.boxShadow = `0 0 20px 5px ${color}99`; 
        el.style.border = `1px solid ${color}`;
    };

    if (!state.selectedPickup[state.gachaType]) {
        const firstP = pickups.pssr[0];
        setSelectedPickup(state.gachaType, typeof firstP === 'string' ? firstP : firstP.id);
    }
    
    createBgItems(isUnit ? null : state.selectedPickup[state.gachaType]);

    pickups.pssr.forEach(p => {
        const pid = typeof p === 'string' ? p : p.id;
        const cardData = produceList.find(c => c.id === pid);
        const displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || pid);

        const wrapper = document.createElement('div');
        wrapper.className = 'pickup-wrapper';

        const item = document.createElement('div');
        item.className = 'pickup-item';
        if (isUnit || state.selectedPickup[state.gachaType] === pid) {
            item.classList.add('selected');
            applyShadow(item, pid);
        }
        
        item.innerHTML = `
            <div class="pickup-img-wrapper">
                <img src="idols/${pid}${checkHasCard(pid) ? '2' : '1'}.webp" class="pickup-img" alt="${pid}">
            </div>
        `;

        const nameEl = document.createElement('div');
        nameEl.className = 'pickup-name';
        nameEl.textContent = displayName;

        if (!isUnit) {
            item.onclick = () => {
                setSelectedPickup(state.gachaType, pid);
                ui.pickupSelector.querySelectorAll('.pickup-item').forEach(el => {
                    el.classList.remove('selected');
                    el.style.boxShadow = el.style.border = 'none';
                });
                item.classList.add('selected');
                applyShadow(item, pid);
                createBgItems(pid);
            };
        }

        wrapper.appendChild(item);
        wrapper.appendChild(nameEl);
        ui.pickupSelector.appendChild(wrapper);
    });
}

/**
 * 애니메이션 콜백 및 결과 렌더링 설정
 */
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
                const el = document.querySelector('.' + id);
                if (el) el.classList.add('hidden');
            });
        },
        onFinish: (currentResults, gachaMode) => {
            document.body.classList.add('gacha-result-active');
            updateTotalPullsUI(ui, prevPulls);
            ['btn-gacha-log', 'btn-gacha-rates', 'jewel-container'].forEach(id => document.getElementById(id)?.classList.remove('hidden'));
            if (ui.fixedBtnArea) { ui.fixedBtnArea.classList.remove('view-main'); ui.fixedBtnArea.classList.add('view-result'); }
            
            if (ui.btn1 && ui.btn10) {
                ui.btn1.classList.add('close-style');
                ui.btn1.innerHTML = `<span class='close-x'>✕</span> ${translations[state.currentLang].gacha_close}`;
                ui.btn1.onclick = () => {
                    ui.btn1.style.pointerEvents = ui.btn10.style.pointerEvents = 'none';
                    setTimeout(() => renderGacha(), 100);
                };

                if (state.gachaType === 'selection') {
                    ui.btn10.style.display = 'none';
                } else {
                    const is10 = (gachaMode === 10);
                    ui.btn10.style.display = 'block';
                    ui.btn10.innerHTML = `${translations[state.currentLang][is10 ? 'gacha_10pull' : 'gacha_1pull']}<br><span class='btn-cost'>${is10 ? "2500" : "250"}</span>`;
                    ui.btn10.onclick = () => handleGachaClick(ui, gachaMode, ui.animationInstance);
                }

                // 버튼 비활성화 해제 (pointerEvents 복구)
                ui.btn1.style.pointerEvents = 'none';
                ui.btn10.style.pointerEvents = 'none';
                setTimeout(() => {
                    ui.btn1.style.pointerEvents = 'auto';
                    ui.btn10.style.pointerEvents = 'auto';
                    updateGachaButtonsState(ui);
                }, 300);
            }
            renderResults(ui, currentResults);
            const fixedBg = document.getElementById('fixed-bg');
            if (fixedBg) { fixedBg.style.backgroundImage = "url('gasya/background.jpg')"; fixedBg.style.backgroundSize = "cover"; }
            history.pushState({ target: 'gacha', view: 'result' }, "");
        }
    });
}

/**
 * 가챠 실행 버튼 바인딩
 */
function bindGachaActions(ui, animation) {
    ui.animationInstance = animation; // 전역 참조용
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
    if (ui.jewelCount) {
        ui.jewelCount.textContent = Math.max(0, state.jewels - cost).toLocaleString();
    }
    if (ui.btn1) ui.btn1.style.pointerEvents = 'none';
    if (ui.btn10) ui.btn10.style.pointerEvents = 'none';

    const results = animation.prepareResults(mode);
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

/**
 * 결과 목록 렌더링
 */
function renderResults(ui, currentResults) {
    if (!ui.resultsContainer) return;
    ui.resultsContainer.innerHTML = '';
    const itemTpl = document.getElementById('tpl-gacha-result-item');
    ui.resultsContainer.classList.toggle('single-result', currentResults.length === 1);

    const currentLog = state.gachaLog[state.gachaType] || [];
    const prePullExistingIds = new Set(currentLog.slice(0, -currentResults.length).map(item => item.id));

    currentResults.forEach((card, index) => {
        const clone = itemTpl.content.cloneNode(true);
        const cardEl = clone.querySelector('.gacha-result-card');
        cardEl.classList.add('animate', `${card.displayRarity.toLowerCase()}-bg`);
        cardEl.style.animationDelay = `${index * 0.08}s`;

        if (!prePullExistingIds.has(card.id)) {
            const badge = document.createElement('div');
            badge.className = 'new-badge'; badge.textContent = 'NEW';
            cardEl.appendChild(badge);
        }

        const img = clone.querySelector('.result-card-img');
        if (card.type === 'produce') {
            img.src = `idols/${card.id}1.webp`;
            cardEl.classList.add('produce-card');
            let scale = (card.scale || 1.60) * (window.innerWidth <= 768 ? 0.7 : 1);
            let offsetY = (card.offsetY || 55) * (window.innerWidth <= 768 ? 0.7 : 1);
            img.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
            const planIcon = clone.querySelector('.result-card-plan-icon');
            if (card.plan && planIcon) { planIcon.src = `icons/${card.plan}.webp`; planIcon.classList.remove('hidden'); }
        } else {
            img.src = card.id.includes('dummy') ? 'icons/idol.png' : `images/support/${card.id}.webp`;
            cardEl.classList.add('landscape');
        }

        clone.querySelector('.result-card-rarity-img').src = `icons/${card.displayRarity.toLowerCase()}.png`;
        const typeLabel = document.createElement('div');
        typeLabel.className = 'card-type-label';
        typeLabel.textContent = card.type === 'produce' ? 'IDOL' : 'SUPPORT';
        cardEl.appendChild(typeLabel);
        clone.querySelector('.result-card-name').textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        ui.resultsContainer.appendChild(clone);
    });
}

// --- 단순 UI 갱신 유틸리티 ---

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
        if (isResultView && state.gachaType === 'selection') ui.btn10.style.display = 'none';
        else if (!isResultView && state.gachaType === 'selection' && currentPulls >= 10) {
            ui.btn10.style.display = 'block'; ui.btn10.disabled = true; ui.btn10.style.opacity = '0.5';
            ui.btn10.innerHTML = `${state.currentLang === 'ko' ? '10회 뽑기' : '10회引く'}<br><span class='btn-cost'>2500</span>`;
        } else {
            ui.btn10.style.display = 'block'; ui.btn10.style.opacity = '1';
            const cost = parseInt(ui.btn10.innerHTML.match(/2500|250/)?.[0] || 2500);
            ui.btn10.disabled = (state.jewels < cost);
            if (!isResultView) ui.btn10.innerHTML = `${state.currentLang === 'ko' ? '10회 뽑기' : '10회引く'}<br><span class='btn-cost'>${cost}</span>`;
        }
    }
}

function updateJewelUI(ui) {
    if (ui.jewelCount) ui.jewelCount.textContent = state.jewels.toLocaleString();
    updateGachaButtonsState(ui);
}

function updateTotalPullsUI(ui, prevCount = null) {
    if (ui.totalPullCount) {
        const exchangeText = translations[state.currentLang]?.gacha_exchange_pt || "교환pt";
        const currentPulls = state.totalPulls[state.gachaType] || 0;
        ui.totalPullCount.textContent = (prevCount !== null) ? 
            `${exchangeText}    ${prevCount}  →  ${currentPulls}` : `${exchangeText}    ${currentPulls}`;
    }
}
