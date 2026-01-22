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

    // 영상 내 점프 로직 (1연차 & 10연차 공통)
    const playSequel = (isAuto = false) => {
        if (videoStep !== 0) return;
        if (!isAuto && !canClick) return;
        
        // 점프 시간 설정 (1연: 9.8초, 10연: 8.6초)
        const jumpTime = (gachaMode === 1) ? 9.8 : 8.6;
        
        if (videoMain && videoMain.duration >= jumpTime) {
            videoStep = 1;
            canClick = false;
            videoMain.currentTime = jumpTime;
            
            // 점프 후 다시 0.6초간 클릭 방지
            setTimeout(() => { canClick = true; }, 600);
        }
    };

    const startGacha = (mode) => {
        document.body.classList.add('immersive-mode');
        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        
        // 시작 시 0.6초간 클릭 방지
        setTimeout(() => { canClick = true; }, 600);
        
        const mainSrc = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        
        if (videoMain && videoContainer) {
            videoContainer.classList.remove('hidden');
            
            videoMain.src = videoBlobs[mainSrc] || mainSrc;
            videoMain.muted = false;
            videoMain.classList.remove('hidden'); 

            // 10연차/1연차 모두 동일하게 단일 비디오 태그 사용
            if (videoNext) videoNext.classList.add('hidden');

            videoMain.onended = () => { finishGacha(); };
            videoMain.onclick = () => { if (canClick) playSequel(false); };

            videoMain.play().catch(() => finishGacha());
        }
    };

    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
