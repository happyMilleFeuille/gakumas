// gacha.js
import { updatePageTranslations } from './utils.js';
import { state, setJewels, setTotalPulls, clearGachaLog, setGachaType } from './state.js';
import translations from './i18n.js';
import { setupGachaAnimation } from './gachaanimation.js';
import { pickGacha, getGachaPool, GACHA_STRATEGIES } from './gachalist.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';

// Web Audio API Context
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};
const assetBlobs = {}; // 전역 캐시로 이동
let activeNodes = {}; // 현재 재생 중인 소스 노드들 관리

// 가챠 자산 목록 정의
const GACHA_ASSETS = [
    'bgm/mainbgm.mp3',
    'gasya/start_r.mp4', 'gasya/start_sr.mp4', 'gasya/start_ssr.mp4', 
    'gasya/start_bgmnormal.mp3', 'gasya/bgm_ssr.mp3', 
    'gasya/gasyaclick.mp3', 'gasya/start_click.mp3', 'gasya/start_srclick.mp3', 'gasya/start_ssrclick.mp3', 'gasya/screen1.mp3',
    'gasya/screen_sr2.mp3', 'gasya/screen_sr3.mp3', 'gasya/screen_r2.mp3', 'gasya/slide.mp3',
    'gasya/blackout.mp4', 'gasya/blackout.mp3', 'gasya/blackoutresult.mp3', 'gasya/blackoutbgm.mp3',
    'gasya/get_r1.mp4', 'gasya/get_r2.mp4',
    'gasya/get_sr1.mp4', 'gasya/get_sr2.mp4', 'gasya/get_sr3.mp4',
    'gasya/get_ssr1.mp4', 'gasya/get_ssr2.mp4', 'gasya/get_ssr3.mp4',
    'gasya/1ren_result.mp3', 'gasya/10ren_result.mp3', 
    'gasya/spotget_rsupport.mp4', 'gasya/spotget_srsupport.mp4', 'gasya/spotget_ssrsupport.mp4', 
    'gasya/spotget_psr.mp4', 'gasya/spotget_pr.mp4', 'gasya/spotget_pssr.mp4', 
    'gasya/spotget_r.mp3', 'gasya/spotget_sr.mp3', 'gasya/get_pssr.mp3'
];

// 자산 로딩 상태 관리
let isAssetsLoading = false;
let assetsLoadedPromise = null;

async function loadGachaAssets() {
    if (assetsLoadedPromise) return assetsLoadedPromise;
    if (isAssetsLoading) return;

    isAssetsLoading = true;
    const progressText = document.getElementById('gacha-progress-text');
    let loadedCount = 0;
    const totalCount = GACHA_ASSETS.length;

    const updateProgress = () => {
        if (progressText) {
            const percent = Math.floor((loadedCount / totalCount) * 100);
            progressText.textContent = `${percent}%`;
        }
    };

    assetsLoadedPromise = (async () => {
        const loadTasks = GACHA_ASSETS.map(async (src) => {
            // 이미 로드된 경우 스킵
            if ((src.endsWith('.mp3') && audioBuffers[src]) || (src.endsWith('.mp4') && assetBlobs[src])) {
                loadedCount++;
                updateProgress();
                return;
            }

            try {
                const response = await fetch(src);
                const buffer = await response.arrayBuffer();
                
                if (src.endsWith('.mp3')) {
                    const decoded = await audioCtx.decodeAudioData(buffer);
                    audioBuffers[src] = decoded;
                } else {
                    const blob = new Blob([buffer], { type: 'video/mp4' });
                    assetBlobs[src] = URL.createObjectURL(blob);
                }
            } catch (error) {
                console.error(`Failed to load asset: ${src}`, error);
            } finally {
                loadedCount++;
                updateProgress();
            }
        });

        await Promise.allSettled(loadTasks);
        isAssetsLoading = false;
        // 로딩 완료 후 텍스트 초기화 (다음에 다시 띄울 때를 위해)
        if (progressText) progressText.textContent = '0%';
    })();

    return assetsLoadedPromise;
}

// 오디오 재생 유틸리티
export function playSound(name, options = {}) {
    if (state.gachaMuted || !audioBuffers[name]) return null;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const { loop = false, isBGM = false, bgmType = null, offset = 0 } = options;

    // 기존 동일 BGM 중단
    if (bgmType) stopBGM(bgmType);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[name];
    source.loop = loop;
    source.connect(audioCtx.destination);
    source.start(0, offset); // offset 적용

    if (isBGM && bgmType) {
        activeNodes[bgmType] = source;
    }
    
    return source;
}

export function stopBGM(type) {
    if (type === 'all') {
        Object.keys(activeNodes).forEach(key => {
            try { activeNodes[key].stop(); } catch(e) {}
            delete activeNodes[key];
        });
        return;
    }
    if (activeNodes[type]) {
        try { activeNodes[type].stop(); } catch(e) {}
        delete activeNodes[type];
    }
}

export function playMainBGM() {
    playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
}

export function renderGacha() {
    // AudioContext 재개 (브라우저 정책 대응)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    document.body.classList.remove('immersive-mode'); 
    document.body.classList.remove('gacha-result-active'); 
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const fixedBtnArea = document.getElementById('gacha-fixed-buttons');
    if (fixedBtnArea) {
        fixedBtnArea.classList.add('loading-shift');
        fixedBtnArea.classList.remove('view-result');
        fixedBtnArea.classList.add('view-main');
        requestAnimationFrame(() => {
            setTimeout(() => fixedBtnArea.classList.remove('loading-shift'), 50);
        });
    }

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

    const logBtn = document.getElementById('btn-gacha-log');
    const ratesBtn = document.getElementById('btn-gacha-rates');
    const resetBtn = document.getElementById('btn-gacha-reset');
    const btn1 = document.getElementById('btn-1pull-fixed');
    const btn10 = document.getElementById('btn-10pull-fixed');
    const jewelContainer = document.getElementById('jewel-container');
    const jewelCount = document.getElementById('jewel-count');
    const addJewelBtn = document.getElementById('btn-add-jewel');
    const totalPullCount = document.getElementById('total-pull-count');
    const muteControls = document.getElementById('gacha-header-controls');
    const muteBtn = document.getElementById('gacha-mute-btn');
    const resultsContainer = contentArea.querySelector('#gacha-results');

    // --- 함수 순서 조정 (초기화 에러 방지) ---
    const updateGachaButtonsState = () => {
        const isResultView = fixedBtnArea && fixedBtnArea.classList.contains('view-result');
        const currentPulls = state.totalPulls[state.gachaType] || 0;

        if (btn1) {
            if (!isResultView && state.gachaType === 'selection') {
                btn1.style.display = 'none'; // 셀렉션에서는 1회 뽑기 숨김
            } else {
                btn1.style.display = 'block'; // 다른 탭에서는 다시 표시
                btn1.disabled = isResultView ? false : (state.jewels < 250);
                btn1.style.opacity = '1';
                // 일반 가챠는 텍스트를 고정하지 않고 필요한 경우에만 업데이트
                if (!isResultView) {
                    btn1.innerHTML = (state.currentLang === 'ko' ? '1회 뽑기' : '1회引く') + "<br><span class='btn-cost'>250</span>";
                }
            }
        }
        
        if (btn10) {
            if (isResultView && state.gachaType === 'selection') {
                btn10.style.display = 'none'; // 결과 화면에서 셀렉션 10회 버튼 숨김
            } else if (!isResultView && state.gachaType === 'selection' && currentPulls >= 10) {
                btn10.style.display = 'block';
                btn10.disabled = true;
                btn10.style.opacity = '0.5';
                btn10.innerHTML = (state.currentLang === 'ko' ? '10회 뽑기' : '10회引く') + "<br><span class='btn-cost'>2500</span>";
            } else {
                btn10.style.display = 'block'; // 기본적으로 표시
                const match = btn10.innerHTML.match(/2500|250/);
                const cost = match ? parseInt(match[0]) : 2500;
                btn10.disabled = (state.jewels < cost);
                btn10.style.opacity = '1';
                // 일반 가챠는 텍스트를 고정하지 않고 필요한 경우에만 업데이트
                if (!isResultView && state.gachaType !== 'selection') {
                    btn10.innerHTML = (state.currentLang === 'ko' ? '10회 뽑기' : '10회引く') + "<br><span class='btn-cost'>2500</span>";
                } else if (!isResultView && state.gachaType === 'selection') {
                    btn10.innerHTML = (state.currentLang === 'ko' ? '10회 뽑기' : '10회引く') + "<br><span class='btn-cost'>2500</span>";
                }
            }
        }
    };

    const updateJewelUI = () => {
        if (jewelCount) jewelCount.textContent = state.jewels.toLocaleString();
        updateGachaButtonsState();
    };

    const updateTotalPullsUI = (prevCount = null) => {
        if (totalPullCount) {
            const exchangeText = translations[state.currentLang]?.gacha_exchange_pt || "교환pt";
            const currentPulls = state.totalPulls[state.gachaType] || 0;
            totalPullCount.textContent = (prevCount !== null) ? 
                `${exchangeText}    ${prevCount}  →  ${currentPulls}` : `${exchangeText}    ${currentPulls}`;
        }
    };

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
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');

    const updateTypeUI = () => {
        const typeSpan = typeDisplay?.querySelector('span');
        if (typeSpan) typeSpan.textContent = typeDisplayNames[state.gachaType];
        
        document.querySelectorAll('.gacha-type-indicator .dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === types.indexOf(state.gachaType));
        });

        if (btnPrev && btnNext) {
            const idx = types.indexOf(state.gachaType);
            const prevSpan = btnPrev.querySelector('span');
            const nextSpan = btnNext.querySelector('span');
            if (prevSpan) prevSpan.textContent = typeDisplayNames[types[(idx - 1 + types.length) % types.length]];
            if (nextSpan) nextSpan.textContent = typeDisplayNames[types[(idx + 1) % types.length]];
        }
        updateTotalPullsUI();
        updateGachaButtonsState(); // 추가: 가챠 타입 변경 시 버튼 상태 즉시 갱신

        // 픽업 배경 업데이트 제거
        const fixedBg = document.getElementById('fixed-bg');
        if (fixedBg) {
            fixedBg.style.filter = '';
            fixedBg.style.backgroundImage = '';
        }
    };

    if (btnPrev && btnNext) {
        const animateChange = (direction) => {
            const spinner = document.getElementById('gacha-spinner');
            if (document.body.classList.contains('immersive-mode') || 
                (fixedBtnArea && fixedBtnArea.classList.contains('view-result')) ||
                (spinner && spinner.classList.contains('active'))) {
                return;
            }

            playSound('gasya/slide.mp3');
            const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
            const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
            const elements = [typeDisplay, btnPrev, btnNext];
            elements.forEach(el => el?.classList.add(outClass));
            setTimeout(() => {
                let idx = types.indexOf(state.gachaType);
                idx = (direction === 'next') ? (idx + 1) % types.length : (idx - 1 + types.length) % types.length;
                setGachaType(types[idx]);
                updateTypeUI();
                elements.forEach(el => {
                    if(el) { el.classList.remove(outClass); void el.offsetWidth; el.classList.add(inClass); }
                });
                setTimeout(() => elements.forEach(el => el?.classList.remove(inClass)), 80);
            }, 80);
        };
        btnPrev.onclick = () => animateChange('prev');
        btnNext.onclick = () => animateChange('next');

        let touchStartX = 0;
        let touchEndX = 0;
        let isSliding = false;
        const gachaContainer = contentArea.querySelector('.gacha-container');

        const handleSwipe = () => {
            if (isSliding) return;
            const spinner = document.getElementById('gacha-spinner');
            if (document.body.classList.contains('immersive-mode') || 
                (fixedBtnArea && fixedBtnArea.classList.contains('view-result')) ||
                (spinner && spinner.classList.contains('active'))) {
                return;
            }
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                isSliding = true;
                if (swipeDistance > 0) animateChange('prev'); else animateChange('next');
                setTimeout(() => { isSliding = false; }, 300);
            }
        };

        if (!fixedBtnArea.dataset.swipeInitialized) {
            fixedBtnArea.dataset.swipeInitialized = "true";
            fixedBtnArea.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            fixedBtnArea.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
            fixedBtnArea.addEventListener('mousedown', (e) => { touchStartX = e.screenX; });
            fixedBtnArea.addEventListener('mouseup', (e) => { touchEndX = e.screenX; handleSwipe(); });
        }
        gachaContainer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        gachaContainer.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
        gachaContainer.addEventListener('mousedown', (e) => { touchStartX = e.screenX; });
        gachaContainer.addEventListener('mouseup', (e) => { touchEndX = e.screenX; handleSwipe(); });
    }

    updateTypeUI();

    if (jewelContainer) { jewelContainer.classList.remove('hidden'); updateJewelUI(); }
    updateTotalPullsUI();

    const controlsTop = document.querySelector('.gacha-controls-top');
    if (controlsTop) controlsTop.classList.remove('hidden');

    if (addJewelBtn) {
        addJewelBtn.onclick = (e) => {
            e.stopPropagation();
            setJewels(state.jewels + 8200);
            updateJewelUI();
        };
    }

    if (fixedBtnArea) { fixedBtnArea.classList.remove('hidden'); fixedBtnArea.style.display = 'flex'; }
    if (logBtn) { 
        logBtn.classList.remove('hidden'); 
        logBtn.onclick = () => {
            const modal = document.getElementById('gacha-log-modal');
            if (modal) {
                // 히스토리 추가
                history.pushState({ modalOpen: 'gachaLog' }, "");
                import('./gachalog.js').then(m => {
                    m.openGachaLogModal();
                    modal.style.display = 'flex'; // 확실히 열기
                });
            }
        };
    }
    if (ratesBtn) {
        ratesBtn.classList.remove('hidden');
        ratesBtn.onclick = () => {
            const modal = document.getElementById('gacha-rates-modal');
            if (modal) {
                history.pushState({ modalOpen: 'rates' }, "");
                import('./gacharates.js').then(m => m.openGachaRatesModal());
            }
        };
    }
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.onclick = () => {
            setTotalPulls(0, state.gachaType); 
            clearGachaLog(state.gachaType);
            updateJewelUI(); 
            updateTotalPullsUI();
            if (resultsContainer) resultsContainer.innerHTML = '';
        };
    }

    if (muteBtn) {
        muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊'; 
        muteBtn.onclick = () => {
            state.gachaMuted = !state.gachaMuted;
            if (state.gachaMuted) {
                stopBGM('main');
                stopBGM('gacha');
            } else {
                playMainBGM();
            }
            muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊';
        };
    }

    if (muteControls) {
        muteControls.classList.remove('hidden');
        muteControls.style.display = 'flex';
    }

    if (!state.gachaMuted) playMainBGM();

    const spinner = document.getElementById('gacha-spinner');
    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    // 리팩토링된 자산 로딩 호출
    loadGachaAssets().then(() => {
        updateGachaButtonsState();
        if (spinner) spinner.classList.remove('active');
    }).catch(() => {
        if (spinner) spinner.classList.remove('active');
    });

    const renderResults = (currentResults, existingIds = new Set()) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        const itemTpl = document.getElementById('tpl-gacha-result-item');
        resultsContainer.classList.toggle('single-result', currentResults.length === 1);

        currentResults.forEach((card, index) => {
            const clone = itemTpl.content.cloneNode(true);
            const cardEl = clone.querySelector('.gacha-result-card');
            cardEl.classList.add('animate');
            cardEl.style.animationDelay = `${index * 0.08}s`;
            const img = clone.querySelector('.result-card-img');
            const planIcon = clone.querySelector('.result-card-plan-icon');
            const rarityImg = clone.querySelector('.result-card-rarity-img');
            const name = clone.querySelector('.result-card-name');
            if (!existingIds.has(card.id)) {
                const newBadge = document.createElement('div');
                newBadge.className = 'new-badge';
                newBadge.textContent = 'NEW';
                cardEl.appendChild(newBadge);
                existingIds.add(card.id);
            }
            if (card.type === 'produce') {
                img.src = `idols/${card.id}1.webp`;
                cardEl.classList.add('produce-card');
                let scale = card.scale || 1.60;
                let offsetY = card.offsetY || 55;
                if (window.innerWidth <= 768) { scale *= 0.7; offsetY *= 0.7; }
                img.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
                if (card.plan && planIcon) { planIcon.src = `icons/${card.plan}.webp`; planIcon.classList.remove('hidden'); }
            } else {
                img.src = card.id.includes('dummy') ? 'icons/idol.png' : `images/support/${card.id}.webp`;
                cardEl.classList.add('landscape');
            }
            const rKey = card.displayRarity.toLowerCase();
            rarityImg.src = `icons/${rKey}.png`;
            cardEl.classList.add(`${rKey}-bg`);
            const typeLabel = document.createElement('div');
            typeLabel.className = 'card-type-label';
            typeLabel.textContent = card.type === 'produce' ? 'IDOL' : 'SUPPORT';
            cardEl.appendChild(typeLabel);
            name.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            resultsContainer.appendChild(clone);
        });
    };

    let prevPulls = 0; 
    let prePullExistingIds = new Set();

    const animation = setupGachaAnimation(contentArea, assetBlobs, {
        onStart: (mode, actualPrevPulls) => {
            prevPulls = actualPrevPulls;
            const currentLog = state.gachaLog[state.gachaType] || [];
            prePullExistingIds = new Set(currentLog.map(item => item.id));
            if (muteControls) muteControls.style.display = 'none';
            if (logBtn) logBtn.classList.add('hidden');
            if (ratesBtn) ratesBtn.classList.add('hidden');
            if (resetBtn) resetBtn.classList.add('hidden');
            if (jewelContainer) jewelContainer.classList.add('hidden');
            if (controlsTop) controlsTop.classList.add('hidden');
        },
        onFinish: (currentResults, gachaMode) => {
            document.body.classList.add('gacha-result-active');
            updateTotalPullsUI(prevPulls);
            if (logBtn) logBtn.classList.remove('hidden');
            if (ratesBtn) ratesBtn.classList.remove('hidden');
            if (jewelContainer) jewelContainer.classList.remove('hidden');
            if (fixedBtnArea) { fixedBtnArea.classList.remove('view-main'); fixedBtnArea.classList.add('view-result'); }            if (btn1 && btn10) {
                const isSelection = state.gachaType === 'selection';
                btn1.classList.add('close-style');
                btn1.innerHTML = "<span class='close-x'>✕</span> " + translations[state.currentLang].gacha_close;
                btn1.onclick = () => {
                    btn1.style.pointerEvents = 'none';
                    btn10.style.pointerEvents = 'none';
                    setTimeout(() => renderGacha(), 100);
                };

                const is10 = (gachaMode === 10);
                if (isSelection) {
                    btn10.style.display = 'none'; // 셀렉션이면 결과창에서 즉시 숨김
                } else {
                    btn10.style.display = 'block';
                    btn10.innerHTML = translations[state.currentLang][is10 ? 'gacha_10pull' : 'gacha_1pull'] + "<br><span class='btn-cost'>" + (is10 ? "2500" : "250") + "</span>";
                    btn10.onclick = () => {
                        handleGachaClick(gachaMode);
                    };
                }

                btn1.style.pointerEvents = 'none';
                btn10.style.pointerEvents = 'none';
                setTimeout(() => {
                    btn1.style.pointerEvents = 'auto';
                    btn10.style.pointerEvents = 'auto';
                    updateGachaButtonsState();
                }, 300);
            }
            renderResults(currentResults, prePullExistingIds);
            const fixedBg = document.getElementById('fixed-bg');
            if (fixedBg) { fixedBg.style.backgroundImage = "url('gasya/background.jpg')"; fixedBg.style.backgroundSize = "cover"; }
            history.pushState({ target: 'gacha', view: 'result' }, "");
        }
    });

    const updateJewelDisplayOnly = (cost) => {
        if (jewelCount) {
            const newCount = Math.max(0, state.jewels - cost);
            jewelCount.textContent = newCount.toLocaleString();
        }
    };

    const handleGachaClick = async (mode) => {
        playSound('gasya/gasyaclick.mp3');
        const cost = mode === 1 ? 250 : 2500;
        updateJewelDisplayOnly(cost);
        if (btn1) btn1.style.pointerEvents = 'none';
        if (btn10) btn10.style.pointerEvents = 'none';
        const results = animation.prepareResults(mode);
        const pssrCards = results.filter(c => c.rarity === 'PSSR');
        if (pssrCards.length > 0) {
            const loadPromises = pssrCards.flatMap(card => {
                const videoIds = [card.id];

                return videoIds.map(vid => {
                    const videoPath = `gasya/pssr/${vid}.mp4`;
                    if (assetBlobs[videoPath]) return Promise.resolve();
                    return fetch(videoPath).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(buffer => { 
                        const blob = new Blob([buffer], { type: 'video/mp4' });
                        assetBlobs[videoPath] = URL.createObjectURL(blob); 
                    }).catch(() => {});
                });
            });
            await Promise.allSettled(loadPromises);
        }
        setTimeout(() => animation.startGacha(mode, results), 50);
    };

    if (btn1) {
        btn1.classList.remove('close-style');
        btn1.innerHTML = translations[state.currentLang].gacha_1pull + "<br><span class='btn-cost'>250</span>";
        btn1.style.pointerEvents = 'auto';
        btn1.onclick = () => handleGachaClick(1);
    }
    if (btn10) {
        btn10.innerHTML = translations[state.currentLang].gacha_10pull + "<br><span class='btn-cost'>2500</span>";
        btn10.style.pointerEvents = 'auto';
        btn10.onclick = () => handleGachaClick(10);
    }
}
