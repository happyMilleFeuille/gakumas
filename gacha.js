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
        // 끊김 없는 전환: Next 비디오를 보여주고 Main을 숨김
        console.log("Seamless switching to sequel...");
        
        if (videoNext && videoMain) {
            videoMain.classList.add('hidden'); // Main 숨김
            videoNext.classList.remove('hidden'); // Next 표시
            videoNext.play().catch(e => {
                console.error("Sequel play failed", e);
                finishGacha();
            });
            // Main은 이제 필요 없음 (정지)
            videoMain.pause();
        }
    };

    const startGacha = (mode) => {
        document.body.classList.add('immersive-mode');
        
        const mainSrc = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        const nextSrc = (mode === 1) ? 'gasya/start_ren1_1.mp4' : 'gasya/start_ren10_1.mp4';
        
        if (videoMain && videoNext && videoContainer) {
            videoContainer.classList.remove('hidden');
            
            // 1. Main 비디오 설정 및 재생
            videoMain.src = mainSrc;
            videoMain.muted = false;
            
            // 수정: 재생이 실제로 시작될 때까지 숨김 (검은 화면 유지)
            videoMain.classList.add('hidden'); 
            videoMain.load();
            
            // 버퍼링이 충분히 되었을 때 재생 시도
            videoMain.oncanplaythrough = () => {
                videoMain.play().catch(err => {
                    console.error("Main play failed", err);
                    finishGacha();
                });
                videoMain.oncanplaythrough = null; 
            };
            
            // 실제로 재생이 시작되면 화면 표시 (멈춤 현상 제거)
            videoMain.onplaying = () => {
                videoMain.classList.remove('hidden');
            };
            
            // 2. Next 비디오 미리 설정 (대기)
            videoNext.src = nextSrc;
            videoNext.muted = false;
            videoNext.classList.add('hidden');
            videoNext.load(); 
            // 주의: 미리 play() 하면 소리가 겹칠 수 있으므로 load()만 하거나
            // 0초에서 일시정지 상태로 두어야 함.
            
            // Main 클릭 이벤트 -> Next로 전환
            videoMain.onclick = () => {
                playSequel();
            };
            
            // Next 클릭 이벤트 -> 종료
            videoNext.onclick = () => {
                finishGacha();
            };
            
            // Main 종료 시 -> 자동 전환 안 함 (클릭 대기) 또는 종료
            videoMain.onended = () => {
                // 사용자가 클릭 안 하고 멍하니 보고 있으면?
                // 보통은 루프 돌리거나 멈춰있음. 여기선 일단 멈춤.
                // 만약 자동으로 넘기고 싶으면 playSequel() 호출
            };

            // Next 종료 시 -> 종료
            videoNext.onended = () => {
                finishGacha();
            };

        }
    };

    // 버튼 이벤트 연결
    if (btn1) btn1.onclick = () => startGacha(1);
    if (btn10) btn10.onclick = () => startGacha(10);
    if (skipBtn) skipBtn.onclick = finishGacha;
}
