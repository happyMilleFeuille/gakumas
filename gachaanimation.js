import { state, setJewels, setTotalPulls, addGachaLog } from './state.js';
import { pickGacha, getHighestRarity } from './gachalist.js';
import { playSound, stopBGM } from './gacha.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';

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
    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const muteControls = document.getElementById('gacha-header-controls');

    const imgOverlay = document.getElementById('gacha-card-overlay') || createOverlay('img', 'gacha-card-overlay');
    const nameOverlay = document.getElementById('gacha-name-overlay') || createOverlay('div', 'gacha-name-overlay');
    const newBadgeOverlay = document.getElementById('gacha-new-badge') || createOverlay('div', 'gacha-new-badge');

    function createOverlay(tag, id) {
        const el = document.createElement(tag);
        el.id = id;
        if (tag === 'div' && id === 'gacha-new-badge') el.textContent = 'NEW';
        if (videoContainer) videoContainer.appendChild(el);
        return el;
    }

    let currentState = States.IDLE;
    let currentStep = 0;
    let currentResults = [];
    let currentVideoSrc = "";
    let gachaMode = 0;
    let canClick = false;
    let clickTimer = null; // 클릭 잠금 타이머
    let activeStepSfx = null;
    let blackoutScheduled = null;
    let gachaBgmStartTime = 0;
    let existingIdsSet = new Set();
    let subState = "";

    const stopStepSfx = () => {
        if (activeStepSfx) {
            try { activeStepSfx.stop(); activeStepSfx.disconnect(); } catch(e) {}
            activeStepSfx = null;
        }
    };

    const clearVideoHandlers = (video) => {
        if (!video) return;
        video.onplaying = null;
        video.onended = null;
        video.onclick = null;
    };

    const resetOverlays = () => {
        [imgOverlay, nameOverlay, newBadgeOverlay].forEach(el => {
            el.classList.remove('visible');
        });
    };

    const transitionTo = (newState, params = {}) => {
        console.log(`Transitioning: ${currentState} -> ${newState}`);
        if (clickTimer) clearTimeout(clickTimer); // 상태 전환 시 타이머 청소
        
        currentState = newState;
        currentStep = params.step || 0;
        canClick = false;
        
        clearVideoHandlers(videoMain);
        clearVideoHandlers(videoNext);

        switch (newState) {
            case States.IDLE:
                resetOverlays();
                if (videoContainer) videoContainer.classList.add('hidden');
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
        const highest = getHighestRarity(currentResults);
        let src = (gachaMode === 1) ? 'gasya/start_r.mp4' : 'gasya/start_sr.mp4';
        if (highest === 'SSR' && Math.random() < 0.6) src = 'gasya/start_ssr.mp4';
        else if (gachaMode === 10 && Math.random() < 0.2) src = 'gasya/start_r.mp4';

        currentVideoSrc = src;
        if (videoContainer) videoContainer.classList.remove('hidden');
        playSound('gasya/start_bgmnormal.mp3', { loop: true, isBGM: true, bgmType: 'gacha' });
        gachaBgmStartTime = Date.now();

        videoMain.src = assetBlobs[src] || src;
        videoMain.classList.remove('hidden');
        videoMain.onended = () => transitionTo(States.PROMOTION, { step: 1 });
        videoMain.onclick = () => { if (canClick) transitionTo(States.SEQUEL); };

        const checkLoop = () => {
            if (currentState !== States.STARTING) return;
            const isSsr = currentVideoSrc.includes('start_ssr');
            const isSr = currentVideoSrc.includes('start_sr');
            let loopEnd = isSsr ? 13.8 : (isSr ? 8.6 : 9.7);
            const loopStart = loopEnd - 1.9;
            if (videoMain.currentTime >= loopEnd) videoMain.currentTime = loopStart;
            requestAnimationFrame(checkLoop);
        };

        videoMain.play().then(() => {
            requestAnimationFrame(checkLoop);
            setTimeout(() => { if (currentState === States.STARTING) canClick = true; }, 600);
        }).catch(finishGacha);
    };

    const playSequelVideo = () => {
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
        
                    videoMain.classList.add('hidden');
                    videoNext.classList.remove('hidden');
                    videoMain.pause();
                    
                    if (!state.gachaMuted && !soundPlayed) {
                        let sfx = "";
                        if (step === 2) sfx = (nextType === "r" ? 'gasya/screen_r2.mp3' : 'gasya/screen_sr2.mp3');
                        else if (step === 3 && nextType !== "r") sfx = 'gasya/screen_sr3.mp3';
                        
                        if (sfx) {
                            stopStepSfx(); // 새로운 단계의 소리가 있을 때만 정지 후 재생
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
            playSound('gasya/blackoutbgm.mp3', { loop: true, isBGM: true, bgmType: 'blackout' });
            if (char) {
                videoNext.src = assetBlobs[`gasya/blackout${char}.mp4`] || `gasya/blackout${char}.mp4`;
                videoNext.onplaying = () => { 
                    if (currentState !== States.BLACKOUT) return; 
                    stopStepSfx();
                    activeStepSfx = playSound('gasya/blackoutresult.mp3'); 
                };
                videoNext.onended = () => transitionTo(States.SHOWING_INDIVIDUAL);
                videoNext.load();
                videoNext.play().catch(() => transitionTo(States.SHOWING_INDIVIDUAL));
            } else { transitionTo(States.SHOWING_INDIVIDUAL); }
        };
        videoNext.play().then(() => { requestAnimationFrame(checkLoop); setTimeout(() => { if (currentState === States.BLACKOUT) canClick = true; }, 1000); });
    };

    const playIndividualResults = (index) => {
        resetOverlays();
        canClick = false; 
        if (index >= currentResults.length) { transitionTo(States.FINISHED); return; }

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

        imgOverlay.classList.remove('produce-card', 'landscape-card');
        imgOverlay.classList.add(isSupport ? 'landscape-card' : 'produce-card');
        nameOverlay.classList.remove('produce-name', 'landscape-name');
        nameOverlay.classList.add(isSupport ? 'landscape-name' : 'produce-name');

        imgOverlay.src = card.type === 'produce' ? `idols/${card.id}1.webp` : `images/support/${card.id}.webp`;
        nameOverlay.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        nameOverlay.style.background = (card.displayRarity === 'SSR' ? '#a335ee' : (card.displayRarity === 'SR' ? '#f5cd46' : '#add0eb'));

        videoNext.onplaying = () => {
            if (currentState !== States.SHOWING_INDIVIDUAL) return;
            
            // [추가] 스킵으로 바로 넘어온 경우를 대비해 비디오 레이어 교체
            if (videoMain && !videoMain.classList.contains('hidden')) {
                videoMain.classList.add('hidden');
                videoMain.pause();
            }
            if (videoNext) videoNext.classList.remove('hidden');

            if (!state.gachaMuted && !soundPlayed) {
                const sfx = (card.rarity === 'PSSR' || card.displayRarity === 'SSR') ? 'gasya/get_pssr.mp3' : (card.displayRarity === 'SR' ? 'gasya/spotget_sr.mp3' : 'gasya/spotget_r.mp3');
                stopStepSfx();
                activeStepSfx = playSound(sfx); 
                soundPlayed = true;
            }
            if (card.rarity !== 'PSSR') {
                setTimeout(() => {
                    if (currentState !== States.SHOWING_INDIVIDUAL) return;
                    imgOverlay.classList.add('visible'); nameOverlay.classList.add('visible');
                    if (isNew) { newBadgeOverlay.classList.add('visible'); }
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
                videoNext.onplaying = () => { 
                    if (currentState !== States.SHOWING_INDIVIDUAL) return; 
                    subState = "pssr_special"; 
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
        stopBGM('gacha'); stopBGM('main'); stopBGM('blackout'); stopStepSfx();
        resetOverlays();
        canClick = false; // 종료 시 즉시 클릭 차단
        if (clickTimer) clearTimeout(clickTimer);
        
        if (!state.gachaMuted) playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
        playSound(gachaMode === 1 ? 'gasya/1ren_result.mp3' : 'gasya/10ren_result.mp3');
        if (videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }
        if (videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }
        if (videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        if (muteControls) { muteControls.classList.remove('hidden'); muteControls.style.display = 'flex'; }
        if (callbacks.onFinish) callbacks.onFinish(currentResults, gachaMode);
        currentState = States.FINISHED;
    };

    const startGacha = (mode, results) => {
        stopBGM('main'); 
        // 상태 초기화
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
        existingIdsSet = new Set(currentLog.map(item => item.id));
        const pickups = CURRENT_PICKUPS[state.gachaType] || { pssr: [] };
        const pssrPickup = currentResults.find(c => pickups.pssr.some(p => p.id === c.id));
        blackoutScheduled = null;
        if (pssrPickup && Math.random() < 0.9) {
            const char = pickups.pssr.find(p => p.id === pssrPickup.id)?.char;
            const highest = getHighestRarity(currentResults);
            blackoutScheduled = { step: Math.floor(Math.random() * (highest === 'R' ? 2 : 3)) + 1, time: 0.3 + Math.random() * 0.8, char };
        }
        if (callbacks.onStart) callbacks.onStart(mode, prevPulls);
        addGachaLog(currentResults, state.gachaType);
        document.body.classList.add('immersive-mode');
        transitionTo(States.STARTING);
    };

    const prepareResults = (mode) => pickGacha(mode, state.currentGachaType || state.gachaType);

    if (skipBtn) {
        skipBtn.onclick = () => {
            if (!canClick || currentState === States.IDLE || currentState === States.FINISHED) return;

            // [추가] 개별 연출 진입 전(시작/승격/블랙아웃)에 스킵을 누른 경우
            if (currentState !== States.SHOWING_INDIVIDUAL) {
                const firstSSRIndex = currentResults.findIndex(c => c.displayRarity === 'SSR');
                
                // SSR이 결과에 포함되어 있다면 해당 지점으로 점프
                if (firstSSRIndex !== -1) {
                    // 건너뛰는 카드들의 ID를 기존 목록에 추가 (NEW 뱃지 계산용)
                    for (let i = 0; i < firstSSRIndex; i++) {
                        existingIdsSet.add(currentResults[i].id);
                    }
                    transitionTo(States.SHOWING_INDIVIDUAL, { index: firstSSRIndex });
                    return;
                }
            }

            // 그 외(이미 연출 중이거나 SSR이 없음)의 경우는 즉시 종료
            transitionTo(States.FINISHED);
        };
    }

    return { startGacha, prepareResults };
}
