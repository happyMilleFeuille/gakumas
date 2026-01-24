import { state, setJewels, setTotalPulls, addGachaLog } from './state.js';
import { pickGacha, getHighestRarity } from './gachalist.js';

export function setupGachaAnimation(contentArea, assetBlobs, gachaBGM, mainBGM, callbacks) {
    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const muteControls = document.getElementById('gacha-header-controls');

    // 이미지 오버레이 요소 동적 생성 및 초기 스타일 설정
    const imgOverlay = document.createElement('img');
    imgOverlay.id = 'gacha-card-overlay';
    imgOverlay.className = 'hidden';
    imgOverlay.style.cssText = `
        position: absolute;
        top: 44%; left: 50%;
        transform: translate(-50%, -50%) scale(0.1); /* 초기 상태: 매우 작음 */
        z-index: 10;
        width: 45vh; 
        max-width: 100%; 
        height: auto;
        pointer-events: none;
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    `;
    if (videoContainer) videoContainer.appendChild(imgOverlay);

    let currentResults = [];
    let currentVideoSrc = "";
    let clickTimer = null;
    let screenSfxTimeout = null;
    let activeScreenSfx = null;
    let videoStep = 0; 
    let gachaMode = 0;
    let canClick = false;

    const finishGacha = () => {
        if (clickTimer) clearTimeout(clickTimer);
        if (screenSfxTimeout) clearTimeout(screenSfxTimeout);
        if (activeScreenSfx) { activeScreenSfx.pause(); activeScreenSfx.currentTime = 0; }
        gachaBGM.pause();
        gachaBGM.currentTime = 0;
        imgOverlay.classList.add('hidden');
        imgOverlay.style.opacity = '0';

        if (!state.gachaMuted) {
            mainBGM.currentTime = 0;
            mainBGM.play().catch(() => {});
        }

        const resultSound = (gachaMode === 1) ? 'gasya/1ren_result.mp3' : 'gasya/10ren_result.mp3';
        if (!state.gachaMuted && assetBlobs[resultSound]) {
            new Audio(assetBlobs[resultSound]).play().catch(() => {});
        }

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
        // 매 연출 시작 시 이미지 초기화
        imgOverlay.style.transition = 'none';
        imgOverlay.style.transform = 'translate(-50%, -50%) scale(0.1)';
        imgOverlay.style.opacity = '0';
        imgOverlay.classList.add('hidden');

        if (index >= currentResults.length) {
            finishGacha();
            return;
        }

        const card = currentResults[index];
        // 개별 연출 대상 판별 (서포트 R/SR 또는 프로듀스 PSR)
        const isRSupport = card.type !== 'produce' && card.displayRarity === 'R';
        const isSRSupport = card.type !== 'produce' && card.displayRarity === 'SR';
        const isPSR = card.type === 'produce' && card.rarity === 'PSR';

        if (isRSupport || isSRSupport || isPSR) {
            canClick = false; // 영상 시작 시 클릭(스킵) 차단
            setTimeout(() => { canClick = true; }, 700); // 0.7초 후 클릭 허용

            let getSrc = 'gasya/spotget_rsupport.mp4';
            if (isSRSupport) getSrc = 'gasya/spotget_srsupport.mp4';
            if (isPSR) getSrc = 'gasya/spotget_psrsupport.mp4';

            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = state.gachaMuted;
            videoNext.load();

            // 카드 타입에 따라 위치와 크기 개별 설정
            const targetTop = isPSR ? '43.5%' : '45%';
            const targetScale = isPSR ? 0.60 : 0.9;

            imgOverlay.style.top = targetTop;
            imgOverlay.src = card.type === 'produce' ? `idols/${card.id}1.webp` : `images/support/${card.id}.webp`;
            
            videoNext.onplaying = () => {
                // 효과음 재생
                if (!state.gachaMuted && assetBlobs['gasya/spotget_r.mp3']) {
                    new Audio(assetBlobs['gasya/spotget_r.mp3']).play().catch(() => {});
                }
                
                setTimeout(() => {
                    imgOverlay.classList.remove('hidden');
                    imgOverlay.offsetHeight; // 리플로우 강제
                    imgOverlay.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
                    imgOverlay.style.transform = `translate(-50%, -50%) scale(${targetScale})`; 
                    imgOverlay.style.opacity = '1';
                }, 350); // 0.35초 지연 후 애니메이션 시작
            };
            videoNext.onended = () => playIndividualResults(index + 1);
            videoNext.onclick = () => { if (canClick) playIndividualResults(index + 1); };
            videoNext.play().catch(() => playIndividualResults(index + 1));
        } else {
            playIndividualResults(index + 1);
        }
    };

    const playGetAnimation = () => {
        const highest = getHighestRarity(currentResults);
        let getSrc = (highest === 'SSR' || highest === 'SR') ? 'gasya/get_sr.mp4' : 'gasya/get_r.mp4';
        
        if (videoNext && videoMain) {
            videoStep = 2; 
            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = state.gachaMuted;
            videoNext.load();
            videoNext.onplaying = () => {
                videoMain.classList.add('hidden');
                videoNext.classList.remove('hidden');
                videoMain.pause();
            };
            videoNext.onended = () => playIndividualResults(0);
            videoNext.onclick = () => { if (canClick) playIndividualResults(0); };
            videoNext.play().catch(() => playIndividualResults(0));
        } else {
            playIndividualResults(0);
        }
    };

    const playSequel = () => {
        if (videoStep !== 0 || !canClick) return;
        const isRen10 = currentVideoSrc.includes('ren10');
        const jumpTime = isRen10 ? 8.6 : 9.8;

        if (videoMain) {
            if (videoMain.currentTime > jumpTime + 0.1) return;
            if (!state.gachaMuted) {
                if (assetBlobs['gasya/start_click.mp3']) new Audio(assetBlobs['gasya/start_click.mp3']).play().catch(() => {});
                if (assetBlobs['gasya/screen1.mp3']) {
                    screenSfxTimeout = setTimeout(() => {
                        activeScreenSfx = new Audio(assetBlobs['gasya/screen1.mp3']);
                        activeScreenSfx.play().catch(() => {});
                    }, 300);
                }
            }
            videoStep = 1;
            canClick = false;
            videoMain.currentTime = jumpTime;
            if (gachaBGM && !gachaBGM.paused && gachaBGM.currentTime < 6.5) gachaBGM.currentTime = 6.5;
            videoMain.play().catch(finishGacha);
            clickTimer = setTimeout(() => { canClick = true; }, 2000);
        }
    };

    const startGacha = (mode) => {
        const cost = (mode === 1) ? 250 : 2500;
        mainBGM.pause();

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({ title: '', artist: '', album: '', artwork: [] });
            navigator.mediaSession.playbackState = 'playing';
        }

        const prevPulls = state.totalPulls[state.gachaType] || 0;
        setJewels(state.jewels - cost);
        setTotalPulls(prevPulls + mode, state.gachaType);

        currentResults = pickGacha(mode, state.gachaType);

        if (callbacks.onStart) callbacks.onStart(mode, prevPulls);

        addGachaLog(currentResults, state.gachaType);

        document.body.classList.add('immersive-mode');
        history.pushState({ target: 'gacha', view: 'playing' }, "");

        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        setTimeout(() => { canClick = true; }, 600);
        
        let src = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        if (mode === 10 && Math.random() < 0.2) src = 'gasya/start_ren1.mp4';
        currentVideoSrc = src;
        
        if (videoMain && videoContainer) {
            videoContainer.classList.remove('hidden');
            if (assetBlobs['gasya/start_bgmnormal.mp3']) {
                gachaBGM.src = assetBlobs['gasya/start_bgmnormal.mp3'];
                gachaBGM.muted = state.gachaMuted;
                gachaBGM.play().catch(() => {});
            }
            videoMain.src = assetBlobs[src] || src;
            videoMain.muted = true; 
            videoMain.classList.remove('hidden'); 
            videoMain.onclick = () => { if (canClick) playSequel(); };
            videoMain.onended = playGetAnimation;

            const checkPausePoint = () => {
                if (videoStep === 0 && videoMain && !videoMain.paused) {
                    const jt = currentVideoSrc.includes('ren1') ? 9.8 : 8.6;
                    if (videoMain.currentTime >= jt) {
                        videoMain.pause();
                        videoMain.currentTime = jt;
                        return;
                    }
                    requestAnimationFrame(checkPausePoint);
                }
            };
            videoMain.play().then(() => requestAnimationFrame(checkPausePoint)).catch(finishGacha);
        }
    };

    if (skipBtn) skipBtn.onclick = () => { if (canClick) finishGacha(); };

    return { startGacha };
}