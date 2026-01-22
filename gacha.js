// gacha.js
import { updatePageTranslations } from './utils.js';

export function renderGacha() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    // 요소 선택
    const btn1 = contentArea.querySelector('#btn-1pull');
    const btn10 = contentArea.querySelector('#btn-10pull');
    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const spinner = contentArea.querySelector('#gacha-spinner');
    const muteBtn = contentArea.querySelector('#gacha-mute-btn');
    
    // 오디오 객체 생성
    const gachaBGM = new Audio();
    let isMuted = true; // 기본 음소거 상태
    gachaBGM.muted = true;
    
    const toggleMute = () => {
        isMuted = !isMuted;
        gachaBGM.muted = isMuted;
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';
    };

    if (muteBtn) {
        muteBtn.textContent = '🔇'; // 초기 아이콘 설정
        muteBtn.onclick = toggleMute;
    }

    // 상태 변수
    let gachaMode = 0; 
    let videoStep = 0; 
    let canClick = false; 
    let clickTimer = null; 

    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

        const assets = [

            'gasya/start_ren1.mp4', 

            'gasya/start_ren10.mp4',

            'gasya/start_bgmnormal.mp3',

            'gasya/gasyaclick.mp3',

            'gasya/start_click.mp3' // 점프 효과음 추가

        ];

    

        const assetBlobs = {}; 

        let loadedCount = 0;

    

        const checkLoadingComplete = () => {

            if (loadedCount >= assets.length) {

                if (btn1) btn1.disabled = false;

                if (btn10) btn10.disabled = false;

                if (spinner) spinner.classList.remove('active');

            }

        };

    

        assets.forEach(src => {

            fetch(src)

                .then(response => response.blob())

                .then(blob => {

                    const objectURL = URL.createObjectURL(blob);

                    assetBlobs[src] = objectURL;

                    loadedCount++;

                    checkLoadingComplete();

                })

                .catch(() => {

                    loadedCount++;

                    checkLoadingComplete();

                });

        });

    

        const finishGacha = () => {

            if (clickTimer) clearTimeout(clickTimer);

            gachaBGM.pause();

            gachaBGM.currentTime = 0;

            if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }

            if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }

            if(videoContainer) videoContainer.classList.add('hidden');

            document.body.classList.remove('immersive-mode');

            videoStep = 0;

        };

    

        const playSequel = () => {

            if (videoStep !== 0 || !canClick) return;

            

            const jumpTime = (gachaMode === 1) ? 9.8 : 8.6;

            

            if (videoMain) {

                if (videoMain.currentTime > jumpTime + 0.1) return;

    

                // [추가] 점프 시 효과음 재생

                if (!isMuted && assetBlobs['gasya/start_click.mp3']) {

                    const jumpSfx = new Audio(assetBlobs['gasya/start_click.mp3']);

                    jumpSfx.play().catch(() => {});

                }

    

                videoStep = 1;

                canClick = false;

                if (clickTimer) clearTimeout(clickTimer);

    

                videoMain.currentTime = jumpTime;

                videoMain.play().catch(() => finishGacha());

                

                clickTimer = setTimeout(() => { 

                    canClick = true; 

                }, 2000);

            }

        };

    const startGacha = (mode) => {
        if (!isMuted && assetBlobs['gasya/gasyaclick.mp3']) {
            const clickSfx = new Audio(assetBlobs['gasya/gasyaclick.mp3']);
            clickSfx.play().catch(() => {});
        }
        document.body.classList.add('immersive-mode');
        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        if (clickTimer) clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { canClick = true; }, 600);
        
        const src = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        
        if (videoMain && videoContainer) {
            videoContainer.classList.remove('hidden');
            if (assetBlobs['gasya/start_bgmnormal.mp3']) {
                gachaBGM.src = assetBlobs['gasya/start_bgmnormal.mp3'];
                gachaBGM.muted = isMuted;
                gachaBGM.play().catch(() => {});
            }
            videoMain.src = assetBlobs[src] || src;
            videoMain.muted = true; 
            videoMain.classList.remove('hidden'); 
            videoMain.onclick = () => { if (canClick) playSequel(); };
            videoMain.onended = () => { finishGacha(); };

            const checkPausePoint = () => {
                if (videoStep === 0 && videoMain && !videoMain.paused) {
                    const jumpTime = (gachaMode === 1) ? 9.8 : 8.6;
                    if (videoMain.currentTime >= jumpTime) {
                        videoMain.pause();
                        videoMain.currentTime = jumpTime;
                        return;
                    }
                    requestAnimationFrame(checkPausePoint);
                }
            };
            videoMain.play().then(() => {
                requestAnimationFrame(checkPausePoint);
            }).catch(() => finishGacha());
        }
    };

    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) {
        skipBtn.onclick = () => {
            if (canClick) finishGacha();
        };
    }
}