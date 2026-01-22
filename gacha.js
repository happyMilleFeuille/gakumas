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
    
    // 상태 변수
    let gachaMode = 0; 
    let videoStep = 0; 
    let canClick = false; 

    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    const videoAssets = [
        'gasya/start_ren1.mp4', 
        'gasya/start_ren10.mp4'
    ];

    const videoBlobs = {}; 
    let loadedCount = 0;

    const checkLoadingComplete = () => {
        if (loadedCount >= videoAssets.length) {
            if (btn1) btn1.disabled = false;
            if (btn10) btn10.disabled = false;
            if (spinner) spinner.classList.remove('active');
        }
    };

    videoAssets.forEach(src => {
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                const objectURL = URL.createObjectURL(blob);
                videoBlobs[src] = objectURL;
                loadedCount++;
                checkLoadingComplete();
            })
            .catch(() => {
                loadedCount++;
                checkLoadingComplete();
            });
    });

    setTimeout(() => {
        if (btn1 && btn1.disabled) {
             btn1.disabled = false;
             if (btn10) btn10.disabled = false;
             if (spinner) spinner.classList.remove('active');
        }
    }, 10000);

        const finishGacha = () => {

            if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }

            if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }

            if(videoContainer) videoContainer.classList.add('hidden');

            document.body.classList.remove('immersive-mode');

            videoStep = 0;

        };

    

        const playSequel = (isAuto = false) => {

            if (videoStep !== 0 || !canClick) return;

            

            if (videoNext && videoMain) {

                videoStep = 1; 

                canClick = false; 

    

                // 이미 점프 지점에서 대기 중인 videoNext를 즉시 재생 및 표시

                videoNext.play().catch(() => finishGacha());

    

                videoNext.onplaying = () => {

                    videoMain.classList.add('hidden'); 

                    videoNext.classList.remove('hidden'); 

                    videoMain.pause();

                    videoNext.onplaying = null;

                    setTimeout(() => { canClick = true; }, 600);

                };

            }

        };

    

        const startGacha = (mode) => {

            document.body.classList.add('immersive-mode');

            gachaMode = mode;

            videoStep = 0;

            canClick = false;

            setTimeout(() => { canClick = true; }, 600);

            

            const src = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';

            const jumpTime = (mode === 1) ? 9.8 : 8.6;

            

            if (videoMain && videoNext && videoContainer) {

                videoContainer.classList.remove('hidden');

                

                // 1. Main 비디오: 처음부터 재생

                videoMain.src = videoBlobs[src] || src;

                videoMain.muted = false;

                videoMain.classList.remove('hidden'); 

    

                // 2. Next 비디오: 똑같은 파일을 점프 지점에서 대기

                videoNext.src = videoBlobs[src] || src;

                videoNext.muted = false;

                videoNext.classList.add('hidden');

                videoNext.load();

                

                // 미리 점프 시켜서 디코더를 대기시킴 (Warming)

                videoNext.onloadedmetadata = () => {

                    videoNext.currentTime = jumpTime;

                    videoNext.onloadedmetadata = null;

                };

    

                videoMain.onclick = () => { if (canClick) playSequel(false); };

                videoNext.onclick = () => { if (canClick) finishGacha(); };

                

                videoMain.onended = () => { playSequel(true); };

                videoNext.onended = () => { finishGacha(); };

    

                videoMain.play().catch(() => finishGacha());

            }

        };

    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
