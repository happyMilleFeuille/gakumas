import { state, setJewels, setTotalPulls, addGachaLog } from './state.js';
import { pickGacha, getHighestRarity } from './gachalist.js';
import { playSound, stopBGM } from './gacha.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';

// 연출 상태 정의
const States = {
    IDLE: 'IDLE',
    STARTING: 'STARTING',
    SEQUEL: 'SEQUEL',
    PROMOTION: 'PROMOTION',
    BLACKOUT: 'BLACKOUT',
    SHOWING_INDIVIDUAL: 'SHOWING_INDIVIDUAL',
    FINISHED: 'FINISHED'
};

export function setupGachaAnimation(contentArea, assetBlobs, callbacks) {
    // 요소를 찾는 헬퍼 함수 (매번 최신 상태를 반영하기 위함)
    const getElements = () => {
        const container = document.getElementById('gacha-video-container');
        return {
            videoContainer: container,
            videoMain: document.getElementById('gacha-video-main'),
            videoNext: document.getElementById('gacha-video-next'),
            skipBtn: document.getElementById('skip-button'),
            imgOverlay: document.getElementById('gacha-card-overlay') || createOverlay('img', 'gacha-card-overlay', container),
            nameOverlay: document.getElementById('gacha-name-overlay') || createOverlay('div', 'gacha-name-overlay', container),
            newBadgeOverlay: document.getElementById('gacha-new-badge') || createOverlay('div', 'gacha-new-badge', container)
        };
    };

    function createOverlay(tag, id, container) {
        if (!container) return null;
        const el = document.createElement(tag);
        el.id = id;
        if (tag === 'div' && id === 'gacha-new-badge') el.textContent = 'NEW';
        container.appendChild(el);
        return el;
    }

    let currentState = States.IDLE;
    let currentStep = 0;
    let currentResults = [];
    let currentVideoSrc = "";
    let gachaMode = 0;
    let canClick = false;
    let clickTimer = null; 
    let activeStepSfx = null;
    let blackoutScheduled = null;
    let gachaBgmStartTime = 0;
    let existingIdsSet = new Set();
    let baselineIdsSet = new Set(); // 가챠 시작 시점의 순수 베이스라인 보관용
    let subState = "";

    const stopStepSfx = () => {
        if (activeStepSfx) {
            try { activeStepSfx.stop(); activeStepSfx.disconnect(); } catch(e) {}
            activeStepSfx = null;
        }
    };

    const clearVideoHandlers = (video) => {
        if (!video) return;
        video.pause();
        video.removeAttribute('src'); 
        video.load();
        video.onplaying = null;
        video.onended = null;
        video.onclick = null;
        video.oncanplay = null;
    };

    const resetOverlays = () => {
        const { imgOverlay, nameOverlay, newBadgeOverlay } = getElements();
        [imgOverlay, nameOverlay, newBadgeOverlay].forEach(el => {
            if (el) el.classList.remove('visible');
        });
    };

    const transitionTo = (newState, params = {}) => {
        console.log(`Transitioning: ${currentState} -> ${newState}`);
        const { videoContainer, videoMain, videoNext } = getElements();
        
        if (clickTimer) clearTimeout(clickTimer); 
        
        currentState = newState;
        currentStep = params.step || 0;
        canClick = false;
        
        if (newState === States.IDLE || newState === States.FINISHED) {
            clearVideoHandlers(videoMain);
            clearVideoHandlers(videoNext);
        }

        switch (newState) {
            case States.IDLE:
                resetOverlays();
                if (videoContainer) {
                    videoContainer.classList.add('hidden');
                    videoContainer.style.display = 'none';
                }
                document.body.classList.remove('immersive-mode');
                break;
            case States.STARTING:
                playStartingVideo();
                break;
            case States.SEQUEL:
                playSequelVideo();
                break;
            case States.PROMOTION:
                playPromotionVideo(params.step || 1, params.prevType);
                break;
            case States.BLACKOUT:
                playBlackoutVideo(params.char);
                break;
            case States.SHOWING_INDIVIDUAL:
                playIndividualResults(params.index || 0);
                break;
            case States.FINISHED:
                finishGacha();
                break;
        }
    };

    const playStartingVideo = () => {
        const { videoContainer, videoMain, videoNext } = getElements();
        const highest = getHighestRarity(currentResults);
        let src = (gachaMode === 1) ? 'gasya/start_r.mp4' : 'gasya/start_sr.mp4';
        if (highest === 'SSR' && Math.random() < 0.6) src = 'gasya/start_ssr.mp4';
        else if (gachaMode === 10 && Math.random() < 0.2) src = 'gasya/start_r.mp4';

        currentVideoSrc = src;
        
        if (videoContainer) {
            videoContainer.classList.remove('hidden');
            videoContainer.style.display = 'flex';
        }

        if (videoMain) {
            videoMain.pause();
            videoMain.onplaying = null;
            videoMain.onended = null;
            videoMain.onclick = null;
            videoMain.src = assetBlobs[src] || src;
            videoMain.load();

            playSound('gasya/start_bgmnormal.mp3', { loop: true, isBGM: true, bgmType: 'gacha' });
            gachaBgmStartTime = Date.now();

            videoMain.oncanplay = () => {
                if (currentState !== States.STARTING) return;
                videoMain.oncanplay = null;
                
                videoMain.classList.remove('hidden');
                videoMain.style.display = 'block';
                if (videoNext) {
                    videoNext.classList.add('hidden');
                    videoNext.style.display = 'none';
                }

                videoMain.play().then(() => {
                    requestAnimationFrame(checkLoop);
                    setTimeout(() => { if (currentState === States.STARTING) canClick = true; }, 600);
                }).catch(err => {
                    console.error("Video play failed:", err);
                    setTimeout(() => transitionTo(States.SHOWING_INDIVIDUAL), 500);
                });
            };

            videoMain.onended = () => transitionTo(States.PROMOTION, { step: 1 });
            videoMain.onclick = () => { if (canClick) transitionTo(States.SEQUEL); };
        }

        const checkLoop = () => {
            if (currentState !== States.STARTING || !videoMain) return;
            const isSsr = currentVideoSrc.includes('start_ssr');
            const isSr = currentVideoSrc.includes('start_sr');
            let loopEnd = isSsr ? 13.8 : (isSr ? 8.6 : 9.7);
            const loopStart = loopEnd - 1.9;
            if (videoMain.currentTime >= loopEnd) videoMain.currentTime = loopStart;
            requestAnimationFrame(checkLoop);
        };
    };

    const playSequelVideo = () => {
        const { videoMain } = getElements();
        if (!videoMain) return;

        const isSsr = currentVideoSrc.includes('start_ssr');
        const isSr = currentVideoSrc.includes('start_sr');
        let jumpTime = isSsr ? 13.9 : (isSr ? 8.6 : 9.8);

        if (!state.gachaMuted) {
            const clickSfx = isSsr ? 'gasya/start_ssrclick.mp3' : (isSr ? 'gasya/start_srclick.mp3' : 'gasya/start_click.mp3');
            playSound(clickSfx);
            setTimeout(() => { 
                if (currentState === States.SEQUEL) {
                    stopStepSfx();
                    activeStepSfx = playSound('gasya/screen1.mp3'); 
                }
            }, 300);
        }

        videoMain.currentTime = jumpTime;
        if (!state.gachaMuted && gachaBgmStartTime > 0) {
            const elapsed = (Date.now() - gachaBgmStartTime) / 1000;
            if (elapsed < 6.5) playSound('gasya/start_bgmnormal.mp3', { loop: true, isBGM: true, bgmType: 'gacha', offset: 6.5 });
        }

        videoMain.onended = () => transitionTo(States.PROMOTION, { step: 1 });
        videoMain.onclick = () => { if (canClick) videoMain.onended(); };
        videoMain.play();
        setTimeout(() => { if (currentState === States.SEQUEL) canClick = true; }, 2000);
    };

    const playPromotionVideo = (step, prevType) => {
        const { videoMain, videoNext } = getElements();
        if (!videoNext) return;

        const highest = getHighestRarity(currentResults);
        let nextType = "", nextSrc = "", soundPlayed = false;

        if (step === 1) {
            nextType = currentVideoSrc.includes('start_ssr') ? "ssr" : (currentVideoSrc.includes('start_sr') ? "sr" : "r");
        } else {
            const canPromote = (prevType === "r" && (highest === "SSR" || highest === "SR")) || (prevType === "sr" && highest === "SSR");
            const shouldPromote = canPromote && Math.random() < 0.5;
            if (shouldPromote) {
                if (prevType === "r") nextType = (highest === "SR") ? "sr" : (Math.random() < 0.7 ? "sr" : "ssr");
                else nextType = "ssr";
            } else {
                if (prevType === "r" && step === 2) nextType = "r";
                else if (prevType === "r" && step === 3) { transitionTo(States.SHOWING_INDIVIDUAL); return; }
                else nextType = prevType;
            }
        }
        nextSrc = `gasya/get_${nextType}${step}.mp4`;

        if (nextType === "ssr" && prevType !== "ssr") {
            playSound('gasya/bgm_ssr.mp3', { loop: true, isBGM: true, bgmType: 'gacha' });
        }

        videoNext.src = assetBlobs[nextSrc] || nextSrc;
        videoNext.onplaying = () => {
            if (currentState !== States.PROMOTION || currentStep !== step) return;

            if (videoMain) {
                videoMain.classList.add('hidden');
                videoMain.style.display = 'none';
                videoMain.pause();
            }
            
            videoNext.classList.remove('hidden');
            videoNext.style.display = 'block';
            
            if (!state.gachaMuted && !soundPlayed) {
                let sfx = "";
                if (step === 2) sfx = (nextType === "r" ? 'gasya/screen_r2.mp3' : 'gasya/screen_sr2.mp3');
                else if (step === 3 && nextType !== "r") sfx = 'gasya/screen_sr3.mp3';
                
                if (sfx) {
                    stopStepSfx(); 
                    activeStepSfx = playSound(sfx);
                    soundPlayed = true;
                }
            }
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { if (currentState === States.PROMOTION && currentStep === step) canClick = true; }, step === 1 ? 800 : (step === 2 ? 1200 : 1400));
            if (blackoutScheduled && blackoutScheduled.step === step) {
                const checkBlackout = () => {
                    if (currentState !== States.PROMOTION || currentStep !== step) return;
                    if (videoNext.currentTime >= blackoutScheduled.time) transitionTo(States.BLACKOUT, { char: blackoutScheduled.char });
                    else requestAnimationFrame(checkBlackout);
                };
                requestAnimationFrame(checkBlackout);
            }
        };
        videoNext.onended = () => {
            if (currentState !== States.PROMOTION || currentStep !== step) return;
            if (nextType === "r" && step === 2) transitionTo(States.SHOWING_INDIVIDUAL);
            else if (step < 3) transitionTo(States.PROMOTION, { step: step + 1, prevType: nextType });
            else transitionTo(States.SHOWING_INDIVIDUAL);
        };
        videoNext.onclick = () => { if (canClick) videoNext.onended(); };
        videoNext.play().catch(() => transitionTo(States.SHOWING_INDIVIDUAL));
    };

    const playBlackoutVideo = (char) => {
        const { videoNext } = getElements();
        if (!videoNext) return;

        stopBGM('gacha');
        videoNext.src = assetBlobs['gasya/blackout.mp4'] || 'gasya/blackout.mp4';
        
        stopStepSfx();
        activeStepSfx = playSound('gasya/blackout.mp3');

        let isLooping = true;
        const checkLoop = () => {
            if (!isLooping || currentState !== States.BLACKOUT) return;
            if (videoNext.currentTime >= videoNext.duration - 0.1) videoNext.currentTime = Math.max(0, videoNext.duration - 2.0);
            requestAnimationFrame(checkLoop);
        };
        videoNext.onclick = () => {
            if (!canClick) return;
            isLooping = false; canClick = false; 
            const bgmSrc = char ? `bgm/bgm${char}.mp3` : 'gasya/blackoutbgm.mp3';
            playSound(bgmSrc, { loop: true, isBGM: true, bgmType: 'blackout', volume: 0.7 });
            if (char) {
                videoNext.src = assetBlobs[`gasya/blackout${char}.mp4`] || `gasya/blackout${char}.mp4`;
                videoNext.onplaying = () => { 
                    if (currentState !== States.BLACKOUT) return; 
                    stopStepSfx();
                    activeStepSfx = playSound('gasya/blackoutresult.mp3'); 
                    videoNext.style.display = 'block'; 
                };
                videoNext.onended = () => transitionTo(States.SHOWING_INDIVIDUAL);
                videoNext.load();
                videoNext.play().catch(() => transitionTo(States.SHOWING_INDIVIDUAL));
            } else { transitionTo(States.SHOWING_INDIVIDUAL); }
        };
        videoNext.play().then(() => { 
            videoNext.style.display = 'block';
            requestAnimationFrame(checkLoop); 
            setTimeout(() => { if (currentState === States.BLACKOUT) canClick = true; }, 1000); 
        });
    };

    const playIndividualResults = (index) => {
        const { videoMain, videoNext, imgOverlay, nameOverlay, newBadgeOverlay } = getElements();
        resetOverlays();
        canClick = false; 
        if (index >= currentResults.length || !videoNext) { transitionTo(States.FINISHED); return; }

        const card = currentResults[index];
        const isRevealTarget = (card.type === 'produce' || card.type === 'support' || !!card.rarity);
        let soundPlayed = false;

        if (!isRevealTarget) {
            if (!existingIdsSet.has(card.id)) existingIdsSet.add(card.id);
            playIndividualResults(index + 1); return;
        }

        const isNew = !existingIdsSet.has(card.id);
        if (isNew) existingIdsSet.add(card.id);

        let getSrc = 'gasya/spotget_rsupport.mp4';
        const isSupport = card.type !== 'produce';
        if (isSupport) {
            if (card.displayRarity === 'SR') getSrc = 'gasya/spotget_srsupport.mp4';
            else if (card.displayRarity === 'SSR') getSrc = 'gasya/spotget_ssrsupport.mp4';
        } else {
            getSrc = (card.rarity === 'PSSR') ? 'gasya/spotget_pssr.mp4' : (card.rarity === 'PSR' ? 'gasya/spotget_psr.mp4' : 'gasya/spotget_pr.mp4');
        }

        videoNext.src = assetBlobs[getSrc] || getSrc;
        subState = (card.rarity === 'PSSR') ? "pssr_intro" : "normal";

        if (imgOverlay) {
            imgOverlay.classList.remove('produce-card', 'landscape-card');
            imgOverlay.classList.add(isSupport ? 'landscape-card' : 'produce-card');
            if (card.type === 'produce') imgOverlay.src = `idols/${card.id}1.webp`;
            else imgOverlay.src = `images/support/${card.id}.webp`;
        }

        if (nameOverlay) {
            nameOverlay.classList.remove('produce-name', 'landscape-name');
            nameOverlay.classList.add(isSupport ? 'landscape-name' : 'produce-name');
            nameOverlay.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            nameOverlay.style.background = (card.displayRarity === 'SSR' ? '#a335ee' : (card.displayRarity === 'SR' ? '#f5cd46' : '#add0eb'));
        }

        videoNext.onplaying = () => {
            if (currentState !== States.SHOWING_INDIVIDUAL) return;
            
            if (videoMain) {
                videoMain.classList.add('hidden');
                videoMain.style.display = 'none';
                videoMain.pause();
            }
            if (videoNext) {
                videoNext.classList.remove('hidden');
                videoNext.style.display = 'block';
            }

            if (!state.gachaMuted && !soundPlayed) {
                const sfx = (card.rarity === 'PSSR' || card.displayRarity === 'SSR') ? 'gasya/get_pssr.mp3' : (card.displayRarity === 'SR' ? 'gasya/spotget_sr.mp3' : 'gasya/spotget_r.mp3');
                stopStepSfx();
                activeStepSfx = playSound(sfx); 
                soundPlayed = true;
            }
            if (card.rarity !== 'PSSR') {
                setTimeout(() => {
                    if (currentState !== States.SHOWING_INDIVIDUAL) return;
                    if (imgOverlay) imgOverlay.classList.add('visible'); 
                    if (nameOverlay) nameOverlay.classList.add('visible');
                    if (isNew && newBadgeOverlay) newBadgeOverlay.classList.add('visible');
                }, 350);
            }
            const lockTime = (card.displayRarity === 'SSR' || card.rarity === 'PSSR') ? 1300 : 500;
            if (clickTimer) clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { if (currentState === States.SHOWING_INDIVIDUAL) canClick = true; }, lockTime);
        };

        videoNext.onended = () => {
            if (currentState !== States.SHOWING_INDIVIDUAL) return;
            if (subState === "pssr_intro" && assetBlobs[`gasya/pssr/${card.id}.mp4`]) {
                canClick = false; 
                if (clickTimer) clearTimeout(clickTimer);
                
                videoNext.src = assetBlobs[`gasya/pssr/${card.id}.mp4`];
                videoNext.muted = state.gachaMuted; 
                videoNext.onplaying = () => { 
                    if (currentState !== States.SHOWING_INDIVIDUAL) return; 
                    subState = "pssr_special"; 
                    videoNext.style.display = 'block';
                    if (clickTimer) clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => { if (currentState === States.SHOWING_INDIVIDUAL) canClick = true; }, 1000); 
                };
                videoNext.play();
            } else { playIndividualResults(index + 1); }
        };

        videoNext.onclick = () => {
            if (!canClick) return;
            if (subState === "pssr_intro") return;
            if (subState === "pssr_special") {
                const j1 = card.jumpTime1 || 3.3, j2 = card.jumpTime2;
                const cur = videoNext.currentTime;
                if (cur < j1) { 
                    canClick = false; 
                    if (clickTimer) clearTimeout(clickTimer);
                    videoNext.currentTime = j1; 
                    clickTimer = setTimeout(() => { if (currentState === States.SHOWING_INDIVIDUAL) canClick = true; }, 1200); 
                    return; 
                }
                if (j2 && cur < j2) { 
                    canClick = false; 
                    if (clickTimer) clearTimeout(clickTimer);
                    videoNext.currentTime = j2; 
                    clickTimer = setTimeout(() => { if (currentState === States.SHOWING_INDIVIDUAL) canClick = true; }, 500); 
                    return; 
                }
            }
            videoNext.onended();
        };
        videoNext.play().catch(() => playIndividualResults(index + 1));
    };

    const finishGacha = () => {
        const { videoContainer, videoMain, videoNext } = getElements();
        stopBGM('gacha'); stopBGM('main'); stopBGM('blackout'); stopStepSfx();
        resetOverlays();
        canClick = false; 
        if (clickTimer) clearTimeout(clickTimer);
        
        const muteControls = document.getElementById('gacha-header-controls');
        if (!state.gachaMuted) playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
        playSound(gachaMode === 1 ? 'gasya/1ren_result.mp3' : 'gasya/10ren_result.mp3');
        if (videoMain) { 
            videoMain.pause(); videoMain.src = ""; 
            videoMain.classList.add('hidden'); 
            videoMain.style.display = 'none';
        }
        if (videoNext) { 
            videoNext.pause(); videoNext.src = ""; 
            videoNext.classList.add('hidden'); 
            videoNext.style.display = 'none';
        }
        if (videoContainer) {
            videoContainer.classList.add('hidden');
            videoContainer.style.display = 'none';
        }
        document.body.classList.remove('immersive-mode');
        if (muteControls) { muteControls.classList.remove('hidden'); muteControls.style.display = 'flex'; }
        if (callbacks.onFinish) callbacks.onFinish(currentResults, gachaMode, baselineIdsSet);
        currentState = States.FINISHED;
    };

    const startGacha = (mode, results) => {
        const { videoContainer, videoMain, videoNext, skipBtn } = getElements();
        stopBGM('main'); 
        
        // 스킵 버튼 이벤트 바인딩 (매번 최신 요소에 적용)
        if (skipBtn) {
            skipBtn.onclick = () => {
                if (!canClick || currentState === States.IDLE || currentState === States.FINISHED) return;

                if (currentState !== States.SHOWING_INDIVIDUAL) {
                    const firstSSRIndex = currentResults.findIndex(c => c.displayRarity === 'SSR');
                    if (firstSSRIndex !== -1) {
                        for (let i = 0; i < firstSSRIndex; i++) {
                            existingIdsSet.add(currentResults[i].id);
                        }
                        transitionTo(States.SHOWING_INDIVIDUAL, { index: firstSSRIndex });
                        return;
                    }
                }
                transitionTo(States.FINISHED);
            };
        }

        if (videoContainer) {
            videoContainer.classList.remove('hidden');
            videoContainer.style.display = 'flex';
        }

        if (videoMain) {
            videoMain.muted = state.gachaMuted;
            videoMain.classList.remove('hidden');
        }
        if (videoNext) {
            videoNext.muted = state.gachaMuted;
            videoNext.classList.add('hidden');
        }

        canClick = false;
        if (clickTimer) clearTimeout(clickTimer);
        currentStep = 0;
        subState = "";
        
        const cost = (mode === 1) ? 250 : 2500;
        const prevPulls = state.totalPulls[state.gachaType] || 0;
        setJewels(state.jewels - cost);
        setTotalPulls(prevPulls + mode, state.gachaType);
        gachaMode = mode;
        currentResults = results;
        const currentLog = state.gachaLog[state.gachaType] || [];
        baselineIdsSet = new Set(currentLog.map(item => item.id)); // 원본 보존
        existingIdsSet = new Set(baselineIdsSet); // 연출용 복사본
        
        const type = state.gachaType;
        let activeCfg = CURRENT_PICKUPS[type] || { pssr: [] };
        if (type === 'selection') activeCfg = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
        else if (type === 'normal') activeCfg = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        else if (type === 'limited') activeCfg = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        else if (type === 'unit') activeCfg = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        else if (type === 'fes') activeCfg = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];

        const pssrPickups = activeCfg.pssr || activeCfg.pool?.pssr || [];
        const pssrPickup = currentResults.find(c => pssrPickups.some(p => (typeof p === 'string' ? p : p.id) === c.id));
        
        blackoutScheduled = null;
        if (pssrPickup && Math.random() < 0.9) {
            const p = pssrPickups.find(p => (typeof p === 'string' ? p : p.id) === pssrPickup.id);
            const char = typeof p === 'string' ? p.replace('ssr', '').split('_')[0] : p.char;
            const highest = getHighestRarity(currentResults);
            blackoutScheduled = { step: Math.floor(Math.random() * (highest === 'R' ? 2 : 3)) + 1, time: 0.3 + Math.random() * 0.8, char };
        }
        if (callbacks.onStart) callbacks.onStart(mode, prevPulls);
        addGachaLog(currentResults, state.gachaType);
        document.body.classList.add('immersive-mode');
        transitionTo(States.STARTING);
    };

    const prepareResults = (mode, customPool = null) => pickGacha(mode, state.currentGachaType || state.gachaType, customPool);

    return { startGacha, prepareResults };
}

