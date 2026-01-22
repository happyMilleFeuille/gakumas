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
    
    // 상태 변수
    let gachaMode = 0; // 1 or 10
    let videoStep = 0; // 0: 첫영상, 1: 후속영상

    // 가챠 종료 (초기화)
    const finishGacha = () => {
        if(video) video.pause();
        if(videoContainer) videoContainer.classList.add('hidden');
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
