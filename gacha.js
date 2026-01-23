// gacha.js
import { updatePageTranslations, applyBackground } from './utils.js';
import { pickGacha, getHighestRarity } from './gachalist.js';
import { state, setJewels, setTotalPulls, addGachaLog, clearGachaLog, setGachaType } from './state.js';
import { currencyData } from './currency.js';
import translations from './i18n.js';

// 오디오 객체 고정 (중복 생성 방지)
const gachaBGM = new Audio();
gachaBGM.disableRemotePlayback = true;

export const mainBGM = new Audio('bgm/mainbgm.mp3');
mainBGM.loop = true;
mainBGM.disableRemotePlayback = true;

export function renderGacha() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // 레이아웃 시프트 방지: 화면을 그리기 전에 버튼 영역 클래스 미리 정리
    const fixedBtnArea = document.getElementById('gacha-fixed-buttons');
    if (fixedBtnArea) {
        fixedBtnArea.classList.add('loading-shift'); // 전환 중 숨김
        fixedBtnArea.classList.remove('view-result');
        fixedBtnArea.classList.add('view-main');
        
        // 렌더링 후 다시 표시
        requestAnimationFrame(() => {
            setTimeout(() => fixedBtnArea.classList.remove('loading-shift'), 50);
        });
    }

    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    // 메뉴로 돌아오면 배경 복구
    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) fixedBg.style.transition = 'none';

    if (state.currentBg) {
        applyBackground(state.currentBg);
    } else {
        if (fixedBg) {
            fixedBg.style.backgroundImage = '';
            fixedBg.style.backgroundSize = 'contain';
        }
    }
    if (fixedBg) fixedBg.style.backgroundSize = 'contain';

    // 요소 선택 (변수 재사용, 재선언 제거)
    const logBtn = document.getElementById('btn-gacha-log');
    const resetBtn = document.getElementById('btn-gacha-reset');
    const btn1 = document.getElementById('btn-1pull-fixed');
    const btn10 = document.getElementById('btn-10pull-fixed');
    
    // 쥬얼(재화) 처리 로직 추가
    const jewelContainer = document.getElementById('jewel-container');
    const jewelCount = document.getElementById('jewel-count');
    const addJewelBtn = document.getElementById('btn-add-jewel');
    const typeSelect = document.getElementById('gacha-type-select');
    const totalPullCount = document.getElementById('total-pull-count');

    const updateJewelUI = () => {
        if (jewelCount) jewelCount.textContent = state.jewels.toLocaleString();
        updateGachaButtonsState();
    };

    const updateTotalPullsUI = (prevCount = null) => {
        if (totalPullCount) {
            const lang = document.documentElement.lang || 'ko';
            const exchangeText = translations[lang]?.gacha_exchange_pt || "교환pt";
            const currentPulls = state.totalPulls[state.gachaType] || 0;

            if (prevCount !== null) {
                totalPullCount.textContent = `${exchangeText}    ${prevCount}  →  ${currentPulls}`;
            } else {
                totalPullCount.textContent = `${exchangeText}    ${currentPulls}`;
            }
        }
    };

    // 가챠 타입 전환 로직
    const types = ['normal', 'limited', 'unit', 'fes'];
    const typeDisplayNames = {
        normal: state.currentLang === 'ko' ? '통상' : '通常',
        limited: state.currentLang === 'ko' ? '한정' : '限定',
        unit: state.currentLang === 'ko' ? '유닛' : 'ユニット',
        fes: state.currentLang === 'ko' ? '페스' : 'フェス'
    };

    const typeDisplay = document.getElementById('current-gacha-type-display');
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');

    const updateTypeUI = () => {
        const typeSpan = typeDisplay.querySelector('span');
        if (typeSpan) typeSpan.textContent = typeDisplayNames[state.gachaType];
        
        // 인디케이터 업데이트
        const dots = document.querySelectorAll('.gacha-type-indicator .dot');
        const currentIdx = types.indexOf(state.gachaType);
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIdx);
        });

        // 양옆 버튼 <span>에 텍스트 표시
        if (btnPrev && btnNext) {
            let idx = types.indexOf(state.gachaType);
            const prevIdx = (idx - 1 + types.length) % types.length;
            const nextIdx = (idx + 1) % types.length;
            
            const prevSpan = btnPrev.querySelector('span');
            const nextSpan = btnNext.querySelector('span');
            if (prevSpan) prevSpan.textContent = typeDisplayNames[types[prevIdx]];
            if (nextSpan) nextSpan.textContent = typeDisplayNames[types[nextIdx]];
        }
        
        updateTotalPullsUI();
    };

    if (btnPrev && btnNext) {
        const animateChange = (direction) => {
            const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
            const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

            // 다시 박스 자체를 타겟팅 (CSS에서 내부 span까지 제어)
            const elements = [typeDisplay, btnPrev, btnNext];
            
            elements.forEach(el => { if(el) el.classList.add(outClass); });
            
            setTimeout(() => {
                let idx = types.indexOf(state.gachaType);
                if (direction === 'next') idx = (idx + 1) % types.length;
                else idx = (idx - 1 + types.length) % types.length;
                
                setGachaType(types[idx]);
                updateTypeUI();
                
                elements.forEach(el => {
                    if(el) {
                        el.classList.remove(outClass);
                        void el.offsetWidth;
                        el.classList.add(inClass);
                    }
                });
                
                setTimeout(() => {
                    elements.forEach(el => { if(el) el.classList.remove(inClass); });
                }, 80);
            }, 80);
        };

        btnPrev.onclick = () => animateChange('prev');
        btnNext.onclick = () => animateChange('next');
    }

    updateTypeUI(); // 초기 텍스트 설정

    const updateGachaButtonsState = () => {
        // btn1이 '닫기' 상태인 경우 비활성화하지 않음
        if (btn1) {
            const isCloseBtn = (btn1.textContent === '닫기' || btn1.textContent === '閉じる');
            btn1.disabled = isCloseBtn ? false : (state.jewels < 250);
        }
        if (btn10) {
            // 결과 화면에서 btn10이 1회 뽑기용으로 쓰이고 있는지 확인
            const is1PullRetry = (btn10.textContent === '1회 뽑기' || btn10.textContent === '1回引く');
            const cost = is1PullRetry ? 250 : 2500;
            btn10.disabled = (state.jewels < cost);
        }
    };

    if (jewelContainer) {
        jewelContainer.classList.remove('hidden');
        updateJewelUI();
    }
    updateTotalPullsUI();

    // 가챠 타입 셀렉터 다시 보이게 설정
    const controlsTop = document.querySelector('.gacha-controls-top');
    if (addJewelBtn) {
        addJewelBtn.onclick = (e) => {
            e.stopPropagation();
            setJewels(state.jewels + 8200);
            updateJewelUI();
        };
    }

    if (fixedBtnArea) {
        fixedBtnArea.classList.remove('hidden');
        fixedBtnArea.style.display = 'flex'; // 가챠 탭 진입 시 보이기
    }

    if (logBtn) {
        logBtn.classList.remove('hidden');
        logBtn.onclick = () => {
            openGachaLogModal();
        };
    }

    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.onclick = () => {
            if (confirm(state.currentLang === 'ko' ? '쥬얼과 가챠 기록을 초기화하시겠습니까?' : 'ジュエルとガチャ記録を初期化しますか？')) {
                setJewels(0);
                setTotalPulls(0, state.gachaType);
                clearGachaLog(state.gachaType);
                updateJewelUI();
                updateTotalPullsUI();
                if (resultsContainer) resultsContainer.innerHTML = '';
                alert(state.currentLang === 'ko' ? '초기화되었습니다.' : '初期化されました。');
            }
        };
    }

    const showMenuUI = () => {
        document.body.classList.remove('immersive-mode'); 
        if (muteBtn) muteBtn.style.display = 'flex';
        if (backBtn) backBtn.classList.add('hidden');
        if (resultsContainer) resultsContainer.innerHTML = '';
        if (fixedBtnArea) fixedBtnArea.style.display = 'flex'; // 메뉴에서도 보이기
        currentResults = [];
        videoStep = 0;
    };

    const videoContainer = contentArea.querySelector('#gacha-video-container');
    const videoMain = contentArea.querySelector('#gacha-video-main');
    const videoNext = contentArea.querySelector('#gacha-video-next'); 
    const skipBtn = contentArea.querySelector('#skip-button');
    const spinner = contentArea.querySelector('#gacha-spinner');
    const muteControls = document.getElementById('gacha-header-controls');
    const muteBtn = document.getElementById('gacha-mute-btn');
    const resultsContainer = contentArea.querySelector('#gacha-results');
    
    if (muteControls) {
        muteControls.classList.remove('hidden');
        muteControls.style.display = 'flex';
    }

    // 상태 동기화
    let isMuted = state.gachaMuted; 
    gachaBGM.muted = isMuted;
    mainBGM.muted = isMuted;

    // 가챠 탭 진입 시 BGM 재생 시도 (음소거가 아니고, 아직 재생 중이 아닐 때만 처음부터 재생)
    if (!isMuted && (mainBGM.paused || mainBGM.currentTime === 0)) {
        mainBGM.currentTime = 0;
        mainBGM.play().catch(() => {
            console.log("BGM autoplay blocked. Waiting for interaction.");
        });
    }
    
    let currentResults = [];
    let currentVideoSrc = ""; // 현재 재생 중인 영상 파일명 추적
    let clickTimer = null;
    let screenSfxTimeout = null; // 효과음 지연용 타이머
    let activeScreenSfx = null;  // 현재 재생 중인 효과음 객체
    let videoStep = 0; 
    let gachaMode = 0;
    let canClick = false;
    
    const toggleMute = () => {
        state.gachaMuted = !state.gachaMuted; 
        isMuted = state.gachaMuted;
        gachaBGM.muted = isMuted;
        mainBGM.muted = isMuted;
        
        if (!isMuted) {
            mainBGM.play().catch(() => {});
        }

        if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';
    };

    if (muteBtn) {
        muteBtn.textContent = isMuted ? '🔇' : '🔊'; 
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
        'gasya/screen1.mp3',
        'gasya/get_sr.mp4',
        'gasya/get_r.mp4',
        'gasya/1ren_result.mp3',
        'gasya/10ren_result.mp3'
    ];

    const assetBlobs = {}; 
    let loadedCount = 0;

    const checkLoadingComplete = () => {
        if (loadedCount >= assets.length) {
            updateGachaButtonsState(); // 로딩 완료 후 쥬얼 상태에 따라 버튼 활성화
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
        
        // 1연일 때 중앙 정렬을 위한 클래스 추가
        if (currentResults.length === 1) {
            resultsContainer.classList.add('single-result');
        } else {
            resultsContainer.classList.remove('single-result');
        }

        currentResults.forEach((card, index) => {
            const clone = itemTpl.content.cloneNode(true);
            const cardEl = clone.querySelector('.gacha-result-card');
            
            // 애니메이션 클래스 및 지연 시간 추가
            cardEl.classList.add('animate');
            cardEl.style.animationDelay = `${index * 0.08}s`;

            const img = clone.querySelector('.result-card-img');
            const badgeContainer = clone.querySelector('.result-card-badge-container');
            const planIcon = clone.querySelector('.result-card-plan-icon');
            const rarityImg = clone.querySelector('.result-card-rarity-img');
            const name = clone.querySelector('.result-card-name');

            if (card.type === 'produce') {
                img.src = `idols/${card.id}1.webp`;
                cardEl.classList.add('produce-card');
                
                // 기본값 설정
                let scale = card.scale || 1.60;
                let offsetY = card.offsetY || 55;

                // 모바일 환경일 경우 일괄적으로 0.7배 적용
                if (window.innerWidth <= 768) {
                    scale *= 0.7;
                    offsetY *= 0.7;
                }

                img.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
                img.style.transformOrigin = 'center center';

                if (card.plan && planIcon) {

                    planIcon.src = `icons/${card.plan}.webp`;
                    planIcon.classList.remove('hidden');
                }
            } else if (card.id.includes('dummy')) {
                img.src = 'icons/idol.png';
            } else {
                img.src = `images/support/${card.id}.webp`;
            }

            // 등급 이미지 설정
            const rarityKey = card.displayRarity.toLowerCase(); // ssr, sr, r
            rarityImg.src = `icons/${rarityKey}.png`;
            
            // 등급별 배경 클래스 추가
            cardEl.classList.add(`${rarityKey}-bg`);
            
            // 테두리 클래스 등은 제거됨 (스타일에서 border: none 처리함)
            // cardEl.className = `gacha-result-card ${rarityKey}-border`; // 필요시 유지
            
            if (card.type !== 'produce') {
                cardEl.classList.add('landscape');
            }

            const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            name.textContent = displayName;
            
            resultsContainer.appendChild(clone);
        });
    };

    const finishGacha = () => {
        if (clickTimer) clearTimeout(clickTimer);
        if (screenSfxTimeout) clearTimeout(screenSfxTimeout); // 효과음 타이머 취소
        if (activeScreenSfx) {
            activeScreenSfx.pause(); // 재생 중인 효과음 정지
            activeScreenSfx.currentTime = 0;
        }
        gachaBGM.pause();
        gachaBGM.currentTime = 0;

        // BGM 다시 재생 (처음부터)
        if (!isMuted) {
            mainBGM.currentTime = 0;
            mainBGM.play().catch(() => {});
        }

        // 결과 효과음 재생
        const resultSound = (gachaMode === 1) ? 'gasya/1ren_result.mp3' : 'gasya/10ren_result.mp3';
        if (!isMuted && assetBlobs[resultSound]) {
            const sfx = new Audio(assetBlobs[resultSound]);
            sfx.play().catch(() => {});
        }

        if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }
        if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        videoStep = 0;

        // 미디어 세션 종료
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none';
        }

        // 가챠 결과가 나타나면 기록 버튼 및 음소거 버튼 표시
        if (muteControls) {
            muteControls.classList.remove('hidden');
            muteControls.style.display = 'flex';
        }
        
        // 결과 화면에서 타입 셀렉터 영역 숨김
        const controlsTop = document.querySelector('.gacha-controls-top');
        if (controlsTop) controlsTop.classList.add('hidden');

        if (logBtn) logBtn.classList.remove('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
        if (jewelContainer) jewelContainer.classList.remove('hidden');
        if (typeSelect) typeSelect.classList.add('hidden');

        // 하단 버튼 영역 상태 변경 (결과 화면용)
        if (fixedBtnArea) {
            fixedBtnArea.classList.remove('view-main');
            fixedBtnArea.classList.add('view-result');
        }

        // 하단 버튼 재설정 (왼쪽: 닫기, 오른쪽: 다시 뽑기)
        if (btn1 && btn10) {
            btn1.textContent = translations[state.currentLang].gacha_close;
            btn1.onclick = () => {
                // 가챠 UI 초기화 및 메뉴 표시 (showMenuUI 로직 활용)
                document.body.classList.remove('immersive-mode');
                if (resultsContainer) resultsContainer.innerHTML = '';
                // 다시 원래 버튼 상태로 복구하기 위해 renderGacha를 다시 호출하거나 초기화 로직 수행
                renderGacha(); 
            };

            const is10 = (gachaMode === 10);
            const retryText = translations[state.currentLang][is10 ? 'gacha_10pull' : 'gacha_1pull'];
            btn10.textContent = retryText;
            btn10.onclick = () => startGacha(gachaMode);

            // 텍스트가 변경되었으므로 버튼 활성화 상태를 즉시 갱신
            updateGachaButtonsState();
        }

        renderResults();

        // 결과 화면 배경 설정
        const fixedBg = document.getElementById('fixed-bg');
        if (fixedBg) {
            fixedBg.style.backgroundImage = "url('gasya/background.jpg')";
            fixedBg.style.backgroundSize = "cover";
        }

        // 결과 화면임을 히스토리에 기록 (뒤로가기 시 가챠 메인으로 복귀용)
        history.pushState({ target: 'gacha', view: 'result' }, "");
    };

    const playGetAnimation = () => {
        const highest = getHighestRarity(currentResults);
        let getSrc = (highest === 'SSR' || highest === 'SR') ? 'gasya/get_sr.mp4' : 'gasya/get_r.mp4';
        
        if (videoNext && videoMain) {
            videoStep = 2; 
            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = isMuted;
            videoNext.disableRemotePlayback = true;
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
        
        // 'ren10'을 먼저 체크하거나, 'ren1.' 처럼 확장자 앞의 점을 포함하여 정확히 구분
        const isRen10 = currentVideoSrc.includes('ren10');
        const jumpTime = isRen10 ? 8.6 : 9.8;

        if (videoMain) {
            if (videoMain.currentTime > jumpTime + 0.1) return;
            if (!isMuted) {
                if (assetBlobs['gasya/start_click.mp3']) {
                    const jumpSfx = new Audio(assetBlobs['gasya/start_click.mp3']);
                    jumpSfx.play().catch(() => {});
                }
                if (assetBlobs['gasya/screen1.mp3']) {
                    screenSfxTimeout = setTimeout(() => {
                        activeScreenSfx = new Audio(assetBlobs['gasya/screen1.mp3']);
                        activeScreenSfx.play().catch(() => {});
                    }, 300); // 0.3초 지연
                }
            }
            videoStep = 1;
            canClick = false;
            if (clickTimer) clearTimeout(clickTimer);
            videoMain.currentTime = jumpTime;
            
            // BGM 싱크 맞춤 (6.5초 미만일 때만 6.5초로 점프)
            if (gachaBGM && !gachaBGM.paused) {
                if (gachaBGM.currentTime < 6.5) {
                    gachaBGM.currentTime = 6.5;
                }
            }

            videoMain.play().catch(finishGacha);
            clickTimer = setTimeout(() => { canClick = true; }, 2000);
        }
    };

    const startGacha = (mode) => {
        const cost = (mode === 1) ? 250 : 2500;

        // 메인 BGM 일시정지
        mainBGM.pause();

        // 미디어 세션 정보 설정 (상태창에 아무것도 안뜨게 함)
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: '', artist: '', album: '', artwork: []
            });
            navigator.mediaSession.playbackState = 'playing';
        }

        if (!isMuted && assetBlobs['gasya/gasyaclick.mp3']) {
            const clickSfx = new Audio(assetBlobs['gasya/gasyaclick.mp3']);
            clickSfx.play().catch(() => {});
        }

        // 쥬얼 차감 및 UI 갱신 (이미 버튼 비활성화를 통해 검증됨)
        setJewels(state.jewels - cost);
        updateJewelUI();

        // 누적 가챠 횟수 증가 및 UI 갱신
        const currentPulls = state.totalPulls[state.gachaType] || 0;
        const prevPulls = currentPulls;
        setTotalPulls(currentPulls + mode, state.gachaType);
        updateTotalPullsUI(prevPulls);

        currentResults = pickGacha(mode, state.gachaType);
        addGachaLog(currentResults, state.gachaType); // 가챠 기록 저장

        if (resultsContainer) resultsContainer.innerHTML = '';
        
        // 가챠 시작 시 모든 UI 숨김 (영상 집중)
        if (muteControls) muteControls.style.display = 'none';
        if (logBtn) logBtn.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
        if (jewelContainer) jewelContainer.classList.add('hidden');

        document.body.classList.add('immersive-mode');
        
        // 영상 재생 중임을 히스토리에 기록 (뒤로가기 차단용)
        history.pushState({ target: 'gacha', view: 'playing' }, "");

        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        if (clickTimer) clearTimeout(clickTimer);

        clickTimer = setTimeout(() => { 
            canClick = true; 
        }, 600);
        
        let src = (mode === 1) ? 'gasya/start_ren1.mp4' : 'gasya/start_ren10.mp4';
        
        // 10연차일 때 20% 확률로 1연차 영상(ren1) 깜짝 출현
        if (mode === 10 && Math.random() < 0.2) {
            src = 'gasya/start_ren1.mp4';
        }
        currentVideoSrc = src; // 현재 영상 경로 저장
        
        if (videoMain && videoContainer) {
            videoContainer.classList.remove('hidden');
            if (assetBlobs['gasya/start_bgmnormal.mp3']) {
                gachaBGM.src = assetBlobs['gasya/start_bgmnormal.mp3'];
                gachaBGM.muted = isMuted;
                gachaBGM.play().catch(() => {});
            }
            videoMain.src = assetBlobs[src] || src;
            videoMain.muted = true; 
            videoMain.disableRemotePlayback = true; // 원격 재생 방지
            videoMain.disablePictureInPicture = true; // PIP 방지
            videoMain.classList.remove('hidden'); 
            videoMain.onclick = () => { if (canClick) playSequel(); };
            videoMain.onended = playGetAnimation;

            const checkPausePoint = () => {
                if (videoStep === 0 && videoMain && !videoMain.paused) {
                    const isRen1 = currentVideoSrc.includes('ren1');
                    const jt = isRen1 ? 9.8 : 8.6;
                    if (videoMain.currentTime >= jt) {
                        videoMain.pause();
                        videoMain.currentTime = jt;
                        return;
                    }
                    requestAnimationFrame(checkPausePoint);
                }
            };
            videoMain.play().then(() => {
                requestAnimationFrame(checkPausePoint);
            }).catch(finishGacha);

            videoNext.muted = true;
            videoNext.classList.add('hidden');
        }
    };

    if (btn1) {
        btn1.textContent = translations[state.currentLang].gacha_1pull;
        btn1.onclick = () => startGacha(1);
    }
    if (btn10) {
        btn10.textContent = translations[state.currentLang].gacha_10pull;
        btn10.onclick = () => startGacha(10);
    }
    if (skipBtn) {
        skipBtn.onclick = () => {
            if (canClick) finishGacha();
        };
    }
}

function openGachaLogModal() {
    const modal = document.getElementById('gacha-log-modal');
    const statsArea = document.getElementById('gacha-log-stats');
    const list = document.getElementById('gacha-log-list');
    const closeBtn = document.querySelector('.close-log-modal');

    if (!modal || !list || !statsArea) return;

    list.innerHTML = '';
    statsArea.innerHTML = '';

    const currentLog = state.gachaLog[state.gachaType] || [];

    if (currentLog.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">기록이 없습니다.</p>';
        return;
    }

    // 1. 통계 계산
    const total = currentLog.length;
    const stats = {
        total: { SSR: 0, SR: 0, R: 0 },
        produce: { SSR: 0, SR: 0, R: 0 },
        support: { SSR: 0, SR: 0, R: 0 }
    };
    const grouped = new Map();

    currentLog.forEach(item => {
        const isProduce = item.type === 'produce';
        const rarity = item.displayRarity;
        
        stats.total[rarity]++;
        if (isProduce) stats.produce[rarity]++;
        else stats.support[rarity]++;

        // 중복 체크: ID와 타입을 조합하여 고유 키 생성
        const groupKey = `${item.type}_${item.id}`;
        if (grouped.has(groupKey)) {
            grouped.get(groupKey).count++;
        } else {
            grouped.set(groupKey, { ...item, count: 1 });
        }
    });

    const getPerc = (c) => ((c / total) * 100).toFixed(1) + '%';
    
    // 언어 설정에 따른 가격 표시 (1.1951: 1쥬얼당 엔화 계수)
    const isJa = document.documentElement.lang === 'ja';
    const yenPerJewel = 1.1951;
    const totalJewels = total * 250;

    let priceDisplay;
    if (isJa) {
         const totalPriceJPY = Math.round(totalJewels * yenPerJewel);
         priceDisplay = `(￥${totalPriceJPY.toLocaleString()})`;
    } else {
         const totalPriceKRW = Math.round(totalJewels * yenPerJewel * currencyData.rate);
         priceDisplay = `(₩${totalPriceKRW.toLocaleString()})`;
    }

    statsArea.innerHTML = `
        <div class="stat-row-top">
            <div class="stat-item full-width">
                <span class="stat-label">${isJa ? '総ガチャ回数' : '총 뽑기 횟수'} <span class="stat-value" style="margin-left: 5px;">${total}</span></span>
                <span class="stat-value" style="color: #777; font-weight: normal;">${priceDisplay}</span>
            </div>
            <div class="stat-row-bottom" style="border-top: 1px dashed #ccc; padding-top: 8px;">
                <div class="stat-item">
                    <span class="stat-label">${isJa ? '全体 SSR' : '전체 SSR'}</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${stats.total.SSR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.total.SSR)})</span></span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${isJa ? '全体 SR' : '전체 SR'}</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${stats.total.SR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.total.SR)})</span></span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${isJa ? '全体 R' : '전체 R'}</span>
                    <span class="stat-value" style="font-size: 0.85rem;">${stats.total.R} <span style="color: #777; font-weight: normal;">(${getPerc(stats.total.R)})</span></span>
                </div>
            </div>
        </div>

        <div class="stat-category-header" data-target="produce">
            <span>${isJa ? 'プロデュースアイドル詳細' : '프로듀스 아이돌 상세'}</span>
            <span class="toggle-icon">▼</span>
        </div>
        <div id="stat-produce-content" class="stat-row-bottom hidden">
            <div class="stat-item">
                <span class="stat-label">PSSR</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.produce.SSR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.produce.SSR)})</span></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">PSR</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.produce.SR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.produce.SR)})</span></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">PR</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.produce.R} <span style="color: #777; font-weight: normal;">(${getPerc(stats.produce.R)})</span></span>
            </div>
        </div>

        <div class="stat-category-header" data-target="support">
            <span>${isJa ? 'サポートカード詳細' : '서포트 카드 상세'}</span>
            <span class="toggle-icon">▼</span>
        </div>
        <div id="stat-support-content" class="stat-row-bottom hidden">
            <div class="stat-item">
                <span class="stat-label">SSR</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.support.SSR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.support.SSR)})</span></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">SR</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.support.SR} <span style="color: #777; font-weight: normal;">(${getPerc(stats.support.SR)})</span></span>
            </div>
            <div class="stat-item">
                <span class="stat-label">R</span>
                <span class="stat-value" style="font-size: 0.8rem;">${stats.support.R} <span style="color: #777; font-weight: normal;">(${getPerc(stats.support.R)})</span></span>
            </div>
        </div>
    `;

    // 접기/펼치기 이벤트 바인딩
    statsArea.querySelectorAll('.stat-category-header').forEach(header => {
        header.onclick = () => {
            const targetId = `stat-${header.dataset.target}-content`;
            const content = document.getElementById(targetId);
            header.classList.toggle('active');
            content.classList.toggle('hidden');
        };
    });

    // 2. 목록 렌더링 (등급 -> 타입 -> 중복순 정렬)
    const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
    const sortedGrouped = Array.from(grouped.values()).sort((a, b) => {
        // 1. 등급순 (SSR > SR > R)
        if (rarityOrder[b.displayRarity] !== rarityOrder[a.displayRarity]) {
            return rarityOrder[b.displayRarity] - rarityOrder[a.displayRarity];
        }
        // 2. 같은 등급 내 타입순 (Produce > Support)
        if (a.type !== b.type) {
            return a.type === 'produce' ? -1 : 1;
        }
        // 3. 중복 횟수순
        return b.count - a.count;
    });

    sortedGrouped.forEach(item => {
        const el = document.createElement('div');
        const isProduce = item.type === 'produce';
        // 클래스 부여를 더욱 명확히 함
        el.className = isProduce ? 'log-item item-produce' : 'log-item item-support';
        
        const rarityLabel = isProduce ? 'P' + item.displayRarity : item.displayRarity;        
        let imgSrc = '';
        if (isProduce) {
            imgSrc = `idols/${item.id}1.webp`;
        } else if (item.id.includes('dummy')) {
            imgSrc = 'icons/idol.png';
        } else {
            imgSrc = `images/support/${item.id}.webp`;
        }

        const name = (state.currentLang === 'ja' && item.name_ja) ? item.name_ja : item.name;
        const countBadge = item.count > 1 ? `<span class="log-item-count">x${item.count}</span>` : '';
        
        el.innerHTML = `
            <img src="${imgSrc}" class="log-item-img ${isProduce ? 'produce-img' : ''}">
            <div class="log-item-rarity rarity-${item.displayRarity.toLowerCase()}">${rarityLabel}</div>
            <div class="log-item-info">
                <div class="log-item-name">${name}</div>
            </div>
            ${countBadge}
        `;
        list.appendChild(el);
    });

    modal.classList.remove('hidden');
    
    // Add state to history for back button support
    history.pushState({ modalOpen: 'gachaLog' }, "");
}
