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
    const videoNext = contentArea.querySelector('#gacha-video-next'); // 대기열 비디오
    const skipBtn = contentArea.querySelector('#skip-button');
    const spinner = contentArea.querySelector('#gacha-spinner');
    
    // 상태 변수 선언
    let gachaMode = 0; // 1 or 10
    let videoStep = 0; // 0: 첫영상, 1: 후속영상
    let canClick = false; // 클릭 가능 여부

    // 버튼 비활성화 및 스피너 표시
    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    // 비디오 프리로딩 및 대기 로직
    const preloadContainer = document.createElement('div');
    preloadContainer.style.display = 'none'; 
    preloadContainer.id = 'video-preloader';
    
    const videoAssets = [
        'gasya/start_ren1.mp4', 
        'gasya/start_ren1_1.mp4',
        'gasya/start_ren10.mp4', 
        'gasya/start_ren10_1.mp4'
    ];

    const videoBlobs = {}; // 다운로드된 Blob URL 저장소
    let loadedCount = 0;
    const totalVideos = videoAssets.length;

    const checkLoadingComplete = () => {
        if (loadedCount >= totalVideos) {
            if (btn1) btn1.disabled = false;
            if (btn10) btn10.disabled = false;
            if (spinner) spinner.classList.remove('active');
        }
    };

    // [핵심] 영상을 Blob으로 강제 다운로드
    videoAssets.forEach(src => {
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                const objectURL = URL.createObjectURL(blob);
                videoBlobs[src] = objectURL;
                loadedCount++;
                checkLoadingComplete();
            })
            .catch(err => {
                console.warn(`Failed to fetch video blob: ${src}`, err);
                loadedCount++; // 실패 시에도 진행은 시킴
                checkLoadingComplete();
            });
    });

    // 안전장치 (10초 후 강제 활성화)
    setTimeout(() => {
        if (btn1 && btn1.disabled) {
             btn1.disabled = false;
             if (btn10) btn10.disabled = false;
             if (spinner) spinner.classList.remove('active');
        }
    }, 10000);

    // [중요] 함수 정의 순서 조정 (ReferenceError 방지)

    // 가챠 종료 (초기화)
    const finishGacha = () => {
        if(videoMain) { videoMain.pause(); videoMain.src = ""; }
        if(videoNext) { videoNext.pause(); videoNext.src = ""; }
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        
        // 초기 상태로 리셋
        if(videoMain) videoMain.classList.remove('hidden');
        if(videoNext) videoNext.classList.add('hidden');
    };

    const playSequel = (isAuto = false) => {
        if (videoStep !== 0) return;
        if (!isAuto && !canClick) return;
        
        videoStep = 1; 
        canClick = false; 
        
        if (videoNext && videoMain) {
            const sequelSrc = (gachaMode === 1) ? 'gasya/start_ren1_1.mp4' : 'gasya/start_ren10_1.mp4';
            if (videoBlobs[sequelSrc]) {
                videoNext.src = videoBlobs[sequelSrc];
            }

            videoNext.play().catch(e => {
                finishGacha();
            });

            videoNext.onplaying = () => {
                videoMain.classList.add('hidden'); 
                videoNext.classList.remove('hidden'); 
                videoMain.pause();
                videoNext.onplaying = null;

                setTimeout(() => {
                    canClick = true;
                }, 600);
            };
        }
    };

    const startGacha = (mode) => {
        document.body.classList.add('immersive-mode');
        gachaMode = mode;
        
        const mainSrc = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        const nextSrc = (mode === 1) ? 'gasya/start_ren1_1.mp4' : 'gasya/start_ren10_1.mp4';
        
        if (videoMain && videoNext && videoContainer) {
            videoContainer.classList.remove('hidden');
            videoStep = 0; 
            canClick = false; 

            setTimeout(() => { canClick = true; }, 600);
            
            videoMain.src = videoBlobs[mainSrc] || mainSrc;
            videoMain.muted = false;
            videoMain.classList.add('hidden'); 
            
            videoNext.src = videoBlobs[nextSrc] || nextSrc;
            videoNext.muted = false;
            videoNext.classList.add('hidden');
            videoNext.load(); 

            videoMain.onplaying = () => {
                videoMain.classList.remove('hidden');
                videoNext.muted = true;
                videoNext.play().then(() => {
                    videoNext.pause();
                    videoNext.muted = false;
                    videoNext.currentTime = 0;
                }).catch(e => {});
            };
            
            videoMain.onclick = () => {
                if (canClick) playSequel(false);
            };
            
            videoNext.onclick = () => {
                if (canClick) finishGacha();
            };
            
            videoMain.onended = () => { 
                playSequel(true); 
            };
            
            videoNext.onended = () => { 
                finishGacha(); 
            };

            videoMain.play().catch(err => {
                finishGacha();
            });
        }
    };

    // [마지막] 버튼 이벤트 연결
    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
