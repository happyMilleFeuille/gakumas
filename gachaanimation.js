import { state, setJewels, setTotalPulls, addGachaLog } from './state.js';
import { pickGacha, getHighestRarity } from './gachalist.js';
import { playSound, stopBGM } from './gacha.js';

export function setupGachaAnimation(contentArea, assetBlobs, callbacks) {
    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const muteControls = document.getElementById('gacha-header-controls');

    // 이미지 오버레이 요소 동적 생성
    const imgOverlay = document.createElement('img');
    imgOverlay.id = 'gacha-card-overlay';
    imgOverlay.className = 'hidden';
    imgOverlay.style.cssText = `
        position: absolute;
        top: 44%; left: 50%;
        transform: translate(-50%, -50%) scale(0.1);
        z-index: 10;
        width: 45vh; 
        max-width: 100%; 
        height: auto;
        pointer-events: none;
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    `;
    if (videoContainer) videoContainer.appendChild(imgOverlay);

    // 이름 오버레이 요소 동적 생성
    const nameOverlay = document.createElement('div');
    nameOverlay.id = 'gacha-name-overlay';
    nameOverlay.className = 'hidden';
    nameOverlay.style.cssText = `
        position: absolute;
        top: 78%; left: 50%;
        transform: translate(-50%, -50%) translateY(20px);
        z-index: 11;
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
        background: #000;
        padding: 8px 25px;
        border-radius: 4px;
        pointer-events: none;
        opacity: 0;
        transition: transform 0.4s ease, opacity 0.4s ease;
        white-space: nowrap;
    `;
    if (videoContainer) videoContainer.appendChild(nameOverlay);

    // NEW 뱃지 오버레이 요소 생성
    const newBadgeOverlay = document.createElement('div');
    newBadgeOverlay.id = 'gacha-new-badge';
    newBadgeOverlay.className = 'hidden';
    newBadgeOverlay.textContent = 'NEW';
    newBadgeOverlay.style.cssText = `
        position: absolute;
        top: 15%; left: 50%; 
        transform: translate(-50%, -50%) scale(0);
        z-index: 12;
        background: none;
        color: white;
        font-size: 1.5rem;
        font-weight: 900;
        text-shadow: 0 0 2px #ffcc00, 0 0 4px rgba(255, 153, 0, 0.6);
        pointer-events: none;
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
    `;
    if (videoContainer) videoContainer.appendChild(newBadgeOverlay);

    let currentResults = [];
    let currentVideoSrc = "";
    let clickTimer = null;
    let screenSfxTimeout = null;
    let videoStep = 0; 
    let gachaMode = 0;
    let canClick = false;
    let existingIdsSet = new Set();
    let currentSubVideo = ""; 

    const finishGacha = () => {
        if (clickTimer) clearTimeout(clickTimer);
        if (screenSfxTimeout) clearTimeout(screenSfxTimeout);
        
        stopBGM('gacha');
        
        imgOverlay.classList.add('hidden');
        imgOverlay.style.opacity = '0';
        nameOverlay.classList.add('hidden');
        nameOverlay.style.opacity = '0';
        newBadgeOverlay.classList.add('hidden');
        newBadgeOverlay.style.opacity = '0';

        if (!state.gachaMuted) {
            playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
        }

        const resultSound = (gachaMode === 1) ? 'gasya/1ren_result.mp3' : 'gasya/10ren_result.mp3';
        playSound(resultSound);

        if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }
        if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        
        if (muteControls) {
            muteControls.classList.remove('hidden');
            muteControls.style.display = 'flex';
        }
        
        if (callbacks.onFinish) callbacks.onFinish(currentResults, gachaMode);
    };

    const playIndividualResults = (index = 0) => {
        imgOverlay.style.transition = 'none';
        imgOverlay.style.transform = 'translate(-50%, -50%) scale(0.1)';
        imgOverlay.style.opacity = '0';
        imgOverlay.classList.add('hidden');
        nameOverlay.style.transition = 'none';
        nameOverlay.style.transform = 'translate(-50%, -50%) translateY(20px)';
        nameOverlay.style.opacity = '0';
        nameOverlay.classList.add('hidden');
        newBadgeOverlay.style.transition = 'none';
        newBadgeOverlay.style.transform = 'translate(-50%, -50%) scale(0)';
        newBadgeOverlay.style.opacity = '0';
        newBadgeOverlay.classList.add('hidden');

        if (index >= currentResults.length) {
            finishGacha();
            return;
        }

        const card = currentResults[index];
        const isRSupport = card.type !== 'produce' && card.displayRarity === 'R';
        const isSRSupport = card.type !== 'produce' && card.displayRarity === 'SR';
        const isSSSR = card.type !== 'produce' && card.displayRarity === 'SSR';
        const isPSR = card.type === 'produce' && (card.rarity === 'PSSR' || card.rarity === 'PSR');
        const isPR = card.type === 'produce' && (card.rarity === 'PR' || card.rarity === 'R');

        if (isRSupport || isSRSupport || isSSSR || isPSR || isPR) {
            const isNew = !existingIdsSet.has(card.id);
            if (isNew) existingIdsSet.add(card.id);

            if (clickTimer) clearTimeout(clickTimer);
            canClick = false; 
            const lockTime = isSSSR ? 1300 : 700;

            let getSrc = 'gasya/spotget_rsupport.mp4';
            if (isSRSupport) getSrc = 'gasya/spotget_srsupport.mp4';
            if (isSSSR) getSrc = 'gasya/spotget_ssrsupport.mp4';
            if (isPSR) getSrc = (card.rarity === 'PSSR') ? 'gasya/spotget_pssr.mp4' : 'gasya/spotget_psr.mp4';
            if (isPR) getSrc = 'gasya/spotget_pr.mp4';

            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = true;
            videoNext.classList.remove('hidden');
            videoNext.load();

            if (card.rarity === 'PSSR') currentSubVideo = "pssr_intro";
            else currentSubVideo = "normal";

            const targetTop = (isPSR || isPR) ? '43.5%' : '45%';
            const targetScale = (isPSR || isPR) ? 0.60 : 0.9;
            imgOverlay.style.top = targetTop;
            imgOverlay.src = card.type === 'produce' ? `idols/${card.id}1.webp` : `images/support/${card.id}.webp`;
            
            nameOverlay.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            nameOverlay.style.top = (card.type !== 'produce') ? '66%' : '78%';

            const rarity = card.displayRarity || card.rarity;
            let bgCol = '#000';
            if (rarity === 'SR') bgCol = 'rgb(245, 205, 70)';
            else if (rarity === 'R') bgCol = '#add0eb';
            else if (rarity === 'SSR') bgCol = '#a335ee';
            nameOverlay.style.background = bgCol;

            videoNext.onplaying = () => {
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(() => { canClick = true; }, lockTime);

                let spotSfxSrc = 'gasya/spotget_r.mp3';
                if (card.rarity === 'PSSR' || isSSSR) spotSfxSrc = 'gasya/get_pssr.mp3';
                else if (card.displayRarity === 'SR') spotSfxSrc = 'gasya/spotget_sr.mp3';
                
                playSound(spotSfxSrc);
                
                if (card.rarity !== 'PSSR') {
                    setTimeout(() => {
                        imgOverlay.classList.remove('hidden');
                        void imgOverlay.offsetWidth;
                        imgOverlay.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
                        imgOverlay.style.transform = `translate(-50%, -50%) scale(${targetScale})`;
                        imgOverlay.style.opacity = '1';

                        nameOverlay.classList.remove('hidden');
                        void nameOverlay.offsetWidth;
                        nameOverlay.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                        nameOverlay.style.transform = 'translate(-50%, -50%) translateY(0)';
                        nameOverlay.style.opacity = '1';

                        if (isNew) {
                            newBadgeOverlay.classList.remove('hidden');
                            void newBadgeOverlay.offsetWidth;
                            newBadgeOverlay.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
                            newBadgeOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
                            newBadgeOverlay.style.opacity = '1';
                        }
                    }, 350);
                }
            };

            videoNext.onclick = () => {
                if (!canClick) return;
                if (currentSubVideo === "pssr_intro") return;

                if (card.rarity === 'PSSR' && currentSubVideo === "pssr_special") {
                    const j1 = card.jumpTime1 !== undefined ? card.jumpTime1 : 3.3;
                    const j2 = card.jumpTime2;

                    if (videoNext.currentTime < j1) {
                        videoNext.currentTime = j1;
                        if (clickTimer) clearTimeout(clickTimer);
                        canClick = false;
                        clickTimer = setTimeout(() => { canClick = true; }, 2000);
                        return;
                    }
                    if (j2 !== undefined && videoNext.currentTime < j2) {
                        videoNext.currentTime = j2;
                        if (clickTimer) clearTimeout(clickTimer);
                        canClick = false;
                        clickTimer = setTimeout(() => { canClick = true; }, 2000);
                        return;
                    }
                }
                if (clickTimer) clearTimeout(clickTimer);
                canClick = false; 
                playIndividualResults(index + 1);
            };

            videoNext.onended = () => {
                if (clickTimer) clearTimeout(clickTimer);
                canClick = false; 
                if (currentSubVideo === "pssr_intro") {
                    const specialSrc = `gasya/pssr/${card.id}.mp4`;
                    const specialBlob = assetBlobs[specialSrc];
                    const finalSrc = specialBlob || specialSrc;
                    
                    videoNext.src = finalSrc;
                    videoNext.onplaying = () => {
                        currentSubVideo = "pssr_special"; 
                        if (clickTimer) clearTimeout(clickTimer);
                        clickTimer = setTimeout(() => { canClick = true; }, 1000);
                    };
                    videoNext.load();
                    videoNext.play().catch(() => playIndividualResults(index + 1));
                } else {
                    playIndividualResults(index + 1);
                }
            };

            videoNext.play().catch(() => playIndividualResults(index + 1));
        } else {
            if (!existingIdsSet.has(card.id)) existingIdsSet.add(card.id);
            playIndividualResults(index + 1);
        }
    };

    const playGetAnimation = (step = 1, prevType = null) => {
        const highest = getHighestRarity(currentResults);
        let nextType = ""; 
        let nextSrc = "";

        if (step === 1) {
            if (currentVideoSrc.includes('start_ssr')) nextType = "ssr";
            else if (currentVideoSrc.includes('start_sr')) nextType = "sr";
            else nextType = "r";
            nextSrc = `gasya/get_${nextType}1.mp4`;
        } else {
            const canPromote = (type) => {
                if (type === "r") return highest === "SSR" || highest === "SR";
                if (type === "sr") return highest === "SSR";
                return false;
            };

            const shouldPromote = canPromote(prevType) && Math.random() < 0.3;

            if (shouldPromote) {
                if (prevType === "r") {
                    nextType = Math.random() < 0.7 ? "sr" : "ssr";
                } else if (prevType === "sr") {
                    nextType = "ssr";
                }
            } else {
                if (prevType === "r") {
                    if (step === 2) nextType = "r";
                    else { playIndividualResults(0); return; }
                } else {
                    nextType = prevType;
                }
            }
            nextSrc = `gasya/get_${nextType}${step}.mp4`;
        }

        if (nextType === "ssr" && (!prevType || prevType !== "ssr")) {
            playSound('gasya/bgm_ssr.mp3', { loop: true, isBGM: true, bgmType: 'gacha' });
        }

        if (videoNext && videoMain) {
            videoStep = 2;
            videoNext.src = assetBlobs[nextSrc] || nextSrc;
            videoNext.muted = true;
            videoNext.load();
            videoNext.onplaying = () => {
                videoMain.classList.add('hidden');
                videoNext.classList.remove('hidden');
                videoMain.pause();
                
                if (!state.gachaMuted) {
                    let sfxSrc = "";
                    if (step === 2) {
                        sfxSrc = (nextType === "r") ? 'gasya/screen_r2.mp3' : 'gasya/screen_sr2.mp3';
                    } else if (step === 3) {
                        if (nextType !== "r") sfxSrc = 'gasya/screen_sr3.mp3';
                    }
                    playSound(sfxSrc);
                }

                if (clickTimer) clearTimeout(clickTimer);
                canClick = false;
                let lockTime = 800; 
                if (step === 2) lockTime = 1200; 
                else if (step === 3) lockTime = 1400; 
                
                clickTimer = setTimeout(() => { canClick = true; }, lockTime);
            };
            
            videoNext.onended = () => {
                if (clickTimer) clearTimeout(clickTimer);
                if (nextType === "r" && step === 2) {
                    playIndividualResults(0); 
                } else if (step < 3) {
                    playGetAnimation(step + 1, nextType); 
                } else {
                    playIndividualResults(0); 
                }
            };

            videoNext.onclick = () => { 
                if (!canClick) return;
                videoNext.onended();
            };
            videoNext.play().catch(() => playIndividualResults(0));
        } else {
            playIndividualResults(0);
        }
    };

    const playSequel = () => {
        if (videoStep !== 0 || !canClick) return;
        const isSsr = currentVideoSrc.includes('start_ssr');
        const isSr = currentVideoSrc.includes('start_sr');
        
        let jumpTime;
        if (isSsr) jumpTime = 13.9;
        else if (isSr) jumpTime = 8.6;
        else jumpTime = 9.8;

        if (videoMain) {
            if (videoMain.currentTime > jumpTime + 0.1) return;
            if (!state.gachaMuted) {
                let clickSfxSrc = 'gasya/start_click.mp3';
                if (isSsr) clickSfxSrc = 'gasya/start_ssrclick.mp3';
                else if (isSr) clickSfxSrc = 'gasya/start_srclick.mp3';
                playSound(clickSfxSrc);
                
                screenSfxTimeout = setTimeout(() => {
                    playSound('gasya/screen1.mp3');
                }, 300);
            }
            videoStep = 1;
            canClick = false;
            videoMain.currentTime = jumpTime;
            videoMain.play().catch(finishGacha);
            clickTimer = setTimeout(() => { canClick = true; }, 2000);
        }
    };

    const startGacha = (mode, precomputedResults = null) => {
        stopBGM('main');
        
        const prevPulls = state.totalPulls[state.gachaType] || 0;
        const currentLog = state.gachaLog[state.gachaType] || [];
        existingIdsSet = new Set(currentLog.map(item => item.id));
        
        currentResults = precomputedResults || pickGacha(mode, state.gachaType);
        if (callbacks.onStart) callbacks.onStart(mode, prevPulls);
        addGachaLog(currentResults, state.gachaType);
        document.body.classList.add('immersive-mode');
        history.pushState({ target: 'gacha', view: 'playing' }, "");
        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        setTimeout(() => { canClick = true; }, 600);

        const highest = getHighestRarity(currentResults);
        let src = (mode === 1) ? 'gasya/start_r.mp4' : 'gasya/start_sr.mp4';
        
        if (highest === 'SSR' && Math.random() < 0.3) {
            src = 'gasya/start_ssr.mp4';
        } else if (mode === 10 && Math.random() < 0.2) {
            src = 'gasya/start_r.mp4';
        }

        currentVideoSrc = src;
        if (videoMain && videoContainer) {
            videoContainer.classList.remove('hidden');
            playSound('gasya/start_bgmnormal.mp3', { loop: true, isBGM: true, bgmType: 'gacha' });
            
            videoMain.src = assetBlobs[src] || src;
            videoMain.muted = true; 
            videoMain.classList.remove('hidden'); 
            videoMain.onclick = () => { if (canClick) playSequel(); };
            videoMain.onended = () => playGetAnimation(1);
            
            const checkPausePoint = () => {
                if (videoStep === 0 && videoMain && !videoMain.paused) {
                    const isSsr = currentVideoSrc.includes('start_ssr');
                    const isSr = currentVideoSrc.includes('start_sr');
                    let loopEnd = isSsr ? 13.8 : (isSr ? 8.6 : 9.7);
                    const loopStart = loopEnd - 1.9;
                    if (videoMain.currentTime >= loopEnd) videoMain.currentTime = loopStart;
                    requestAnimationFrame(checkPausePoint);
                }
            };
            videoMain.play().then(() => requestAnimationFrame(checkPausePoint)).catch(finishGacha);
        }
    };

    const prepareResults = (mode) => {
        return pickGacha(mode, state.gachaType);
    };

    if (skipBtn) skipBtn.onclick = () => { if (canClick) finishGacha(); };

    return { startGacha, prepareResults };
}