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

    let loadedCount = 0;
    const totalVideos = videoAssets.length;

    const checkLoadingComplete = () => {
        if (loadedCount >= totalVideos) {
            // 로딩 완료
            if (btn1) btn1.disabled = false;
            if (btn10) btn10.disabled = false;
            if (spinner) spinner.classList.remove('active');
        }
    };

    videoAssets.forEach(src => {
        const v = document.createElement('video');
        v.src = src;
        v.preload = 'auto'; 
        v.muted = true;
        
        // 이미 로딩되어 있는지 확인
        if (v.readyState >= 3) { 
            loadedCount++;
            checkLoadingComplete();
        } else {
            v.oncanplaythrough = () => {
                loadedCount++;
                checkLoadingComplete();
                v.oncanplaythrough = null;
            };
            v.onerror = () => {
                console.warn(`Failed to preload: ${src}`);
                loadedCount++; 
                checkLoadingComplete();
            };
        }
        preloadContainer.appendChild(v);
    });
    contentArea.appendChild(preloadContainer);
    
    // 안전장치 (5초 후 강제 활성화)
    setTimeout(() => {
        if (btn1 && btn1.disabled) {
             btn1.disabled = false;
             if (btn10) btn10.disabled = false;
             if (spinner) spinner.classList.remove('active');
        }
    }, 5000);

    // ... (이후 더블 버퍼링 로직은 그대로 유지) ...

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

    const playSequel = () => {
        // 이미 후속 영상이 재생 중이거나 클릭 불가능 상태면 중단
        if (videoStep !== 0 || !canClick) return;
        
        if (videoNext && videoMain) {
            videoStep = 1; 
            
            // 후속 영상 재생 시작
            videoNext.play().catch(e => {
                console.error("Sequel play failed", e);
                finishGacha();
            });

            // 실제로 후속 영상의 화면이 나오기 시작할 때 메인 영상을 숨김 (끊김 방지)
            videoNext.onplaying = () => {
                videoMain.classList.add('hidden'); 
                videoNext.classList.remove('hidden'); 
                videoMain.pause();
                videoNext.onplaying = null; // 이벤트 한 번만 실행
            };
        }
    };

    const startGacha = (mode) => {
        document.body.classList.add('immersive-mode');
        
        const mainSrc = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        const nextSrc = (mode === 1) ? 'gasya/start_ren1_1.mp4' : 'gasya/start_ren10_1.mp4';
        
        if (videoMain && videoNext && videoContainer) {
            videoContainer.classList.remove('hidden');
            videoStep = 0; 
            canClick = false; 

            setTimeout(() => { canClick = true; }, 1000);
            
            // 1. Main 비디오 설정
            videoMain.src = mainSrc;
            videoMain.muted = false;
            videoMain.classList.add('hidden'); 
            
            // 2. Next 비디오 미리 설정 (대기 상태)
            videoNext.src = nextSrc;
            videoNext.muted = false;
            videoNext.classList.add('hidden');
            videoNext.load(); // 미리 로드만 해둠

            videoMain.onplaying = () => {
                videoMain.classList.remove('hidden');
                
                // 모바일 최적화: 메인 재생 중에 다음 영상 디코더 웜업(Warming)
                // 아주 잠깐 틀었다가 0초로 돌려놓아 재생 준비를 마침
                videoNext.muted = true;
                videoNext.play().then(() => {
                    videoNext.pause();
                    videoNext.muted = false;
                    videoNext.currentTime = 0;
                }).catch(e => {});
            };
            
            videoMain.onclick = playSequel;
            videoNext.onclick = () => { finishGacha(); };
            
            videoMain.onended = () => { playSequel(); };
            videoNext.onended = () => { finishGacha(); };

            videoMain.play().catch(err => {
                console.error("Main play failed", err);
                finishGacha();
            });
        }
    };


    // 버튼 이벤트 연결
    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
