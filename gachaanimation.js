import { state, setJewels, setTotalPulls, addGachaLog } from './state.js';
import { pickGacha, getHighestRarity } from './gachalist.js';

export function setupGachaAnimation(contentArea, assetBlobs, gachaBGM, mainBGM, callbacks) {
    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const muteControls = document.getElementById('gacha-header-controls');

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
            videoNext.onended = finishGacha;
            videoNext.onclick = () => { if (canClick) finishGacha(); };
            videoNext.play().catch(finishGacha);
        } else {
            finishGacha();
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

        // 클릭음 제거 (gacha.js로 이동)

        setJewels(state.jewels - cost);
        const currentPulls = state.totalPulls[state.gachaType] || 0;
        setTotalPulls(currentPulls + mode, state.gachaType);

        currentResults = pickGacha(mode, state.gachaType);
        addGachaLog(currentResults, state.gachaType);

        if (callbacks.onStart) callbacks.onStart(mode);

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
