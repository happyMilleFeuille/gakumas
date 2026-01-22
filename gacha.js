// gacha.js
import { updatePageTranslations } from './utils.js';
import { pickGacha, getHighestRarity } from './gachalist.js';

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
    const resultsContainer = contentArea.querySelector('#gacha-results');
    
    // 오디오 객체 생성
    const gachaBGM = new Audio();
    let isMuted = true; 
    let currentResults = [];
    let clickTimer = null;
    let videoStep = 0; // 0: 시작, 1: 결과진입
    let gachaMode = 0;
    let canClick = false;
    
    const toggleMute = () => {
        isMuted = !isMuted;
        gachaBGM.muted = isMuted;
        if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';
    };

    if (muteBtn) {
        muteBtn.textContent = '🔇'; 
        muteBtn.onclick = toggleMute;
    }

    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    const assets = [
        'gasya/start_ren1.mp4', 
        'gasya/start_ren10.mp4',
        'gasya/start_bgmnormal.mp3',
        'gasya/gasyaclick.mp3',
        'gasya/start_click.mp3',
        'gasya/get_sr.mp4', // 추가
        'gasya/get_r.mp4'   // 추가
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

    const renderResults = () => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        const itemTpl = document.getElementById('tpl-gacha-result-item');
        
        currentResults.forEach(card => {
            const clone = itemTpl.content.cloneNode(true);
            const cardEl = clone.querySelector('.gacha-result-card');
            const img = clone.querySelector('.result-card-img');
            const rarity = clone.querySelector('.result-card-rarity');
            const name = clone.querySelector('.result-card-name');

            if (card.id.includes('dummy') || card.id.includes('produce')) {
                img.src = 'icons/idol.png';
            } else {
                img.src = `images/support/${card.id}.webp`;
            }

            rarity.textContent = card.displayRarity;
            const rarityClass = card.displayRarity.toLowerCase();
            rarity.className = `result-card-rarity rarity-${rarityClass}`;
            cardEl.className = `gacha-result-card ${rarityClass}-border`;
            name.textContent = card.name;
            resultsContainer.appendChild(clone);
        });
    };

    const finishGacha = () => {
        if (clickTimer) clearTimeout(clickTimer);
        gachaBGM.pause();
        gachaBGM.currentTime = 0;
        if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }
        if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        videoStep = 0;
        renderResults();
    };

    // 추가 연출 시작 함수
    const playGetAnimation = () => {
        const highest = getHighestRarity(currentResults);
        let getSrc = (highest === 'SSR' || highest === 'SR') ? 'gasya/get_sr.mp4' : 'gasya/get_r.mp4';
        
        if (videoNext && videoMain) {
            videoStep = 2; // 획득 연출 단계
            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = isMuted;
            videoNext.load();
            
            videoNext.onplaying = () => {
                videoMain.classList.add('hidden');
                videoNext.classList.remove('hidden');
                videoMain.pause();
            };

            videoNext.onended = () => {
                finishGacha();
            };

            videoNext.onclick = () => {
                if (canClick) finishGacha();
            };

            videoNext.play().catch(() => finishGacha());
        } else {
            finishGacha();
        }
    };

    const playSequel = () => {
        if (videoStep !== 0 || !canClick) return;
        const jumpTime = (gachaMode === 1) ? 9.8 : 8.6;
        if (videoMain) {
            if (videoMain.currentTime > jumpTime + 0.1) return;
            if (!isMuted && assetBlobs['gasya/start_click.mp3']) {
                const jumpSfx = new Audio(assetBlobs['gasya/start_click.mp3']);
                jumpSfx.play().catch(() => {});
            }
            videoStep = 1;
            canClick = false;
            if (clickTimer) clearTimeout(clickTimer);
            videoMain.currentTime = jumpTime;
            videoMain.play().catch(() => finishGacha());
            clickTimer = setTimeout(() => { canClick = true; }, 2000);
        }
    };

    const startGacha = (mode) => {
        if (!isMuted && assetBlobs['gasya/gasyaclick.mp3']) {
            const clickSfx = new Audio(assetBlobs['gasya/gasyaclick.mp3']);
            clickSfx.play().catch(() => {});
        }
        currentResults = pickGacha(mode);
        if (resultsContainer) resultsContainer.innerHTML = '';
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
            videoMain.onended = () => { playGetAnimation(); }; // 메인 연출 후 GET 연출로 전환

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
