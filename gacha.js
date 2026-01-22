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
    const video = contentArea.querySelector('#gacha-video');
    const skipBtn = contentArea.querySelector('#skip-button');
    const spinner = contentArea.querySelector('#gacha-spinner');
    
    // 버튼 비활성화 및 스피너 표시
    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    // 비디오 로딩 (프리로딩 및 대기)
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
    const loadedVideos = [];

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
        
        // 이미 로딩되어 있는지 확인 (캐시 등)
        if (v.readyState >= 3) { // HAVE_FUTURE_DATA 이상
            loadedCount++;
        } else {
            v.oncanplaythrough = () => {
                loadedCount++;
                checkLoadingComplete();
                v.oncanplaythrough = null; // 이벤트 제거
            };
            v.onerror = () => {
                console.error(`Failed to preload: ${src}`);
                loadedCount++; // 실패해도 카운트는 올려서 무한 로딩 방지
                checkLoadingComplete();
            };
        }
        loadedVideos.push(v);
        preloadContainer.appendChild(v);
    });
    contentArea.appendChild(preloadContainer);
    
    // 캐시된 비디오 즉시 체크 및 안전장치 (타임아웃 5초)
    checkLoadingComplete();
    setTimeout(() => {
        // 5초 지나면 강제 활성화
        if (btn1 && btn1.disabled) {
             btn1.disabled = false;
             if (btn10) btn10.disabled = false;
             if (spinner) spinner.classList.remove('active');
        }
    }, 5000);

    // 상태 변수
    let gachaMode = 0; // 1 or 10
    let videoStep = 0; // 0: 첫영상, 1: 후속영상

    // 가챠 종료 (초기화)
    const finishGacha = () => {
        if(video) video.pause();
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode'); // UI 복구
        gachaMode = 0;
        videoStep = 0;
    };

    // 비디오 클릭 핸들러 (핵심 로직)
    const handleVideoClick = () => {
        if (gachaMode === 1 || gachaMode === 10) {
            if (videoStep === 0) {
                // 첫 영상 중 클릭 -> 후속 영상 재생
                videoStep = 1;
                const sequelSrc = (gachaMode === 1) ? 'gasya/start_ren1_1.mp4' : 'gasya/start_ren10_1.mp4';
                
                video.src = sequelSrc;
                video.load();
                video.play().catch(e => {
                    finishGacha();
                });
            } else {
                // 후속 영상 중 클릭 -> 종료
                finishGacha();
            }
        }
    };

    // 비디오 재생 시작 함수
    const startGacha = (mode) => {
        document.body.classList.add('immersive-mode'); // UI 숨김
        gachaMode = mode;
        videoStep = 0;
        const src = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        
        if (video && videoContainer) {
            video.src = src;
            videoContainer.classList.remove('hidden');
            video.muted = false;
            video.load();
            
            video.onclick = handleVideoClick;
            video.onended = () => {
                 finishGacha(); 
            };
            
            video.play().catch(err => {
                finishGacha();
            });
        }
    };

    // 버튼 이벤트 연결
    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
