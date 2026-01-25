// gacha.js
import { updatePageTranslations, applyBackground } from './utils.js';
import { state, setJewels, setTotalPulls, clearGachaLog, setGachaType } from './state.js';
import translations from './i18n.js';
import { setupGachaAnimation } from './gachaanimation.js';
import { openGachaLogModal } from './gachalog.js';

const gachaBGM = new Audio();
gachaBGM.disableRemotePlayback = true;

export const mainBGM = new Audio('bgm/mainbgm.mp3');
mainBGM.loop = true;
mainBGM.disableRemotePlayback = true;

export function renderGacha() {
    document.body.classList.remove('immersive-mode'); 
    document.body.classList.remove('gacha-result-active'); 
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    const fixedBtnArea = document.getElementById('gacha-fixed-buttons');
    if (fixedBtnArea) {
        fixedBtnArea.classList.add('loading-shift');
        fixedBtnArea.classList.remove('view-result');
        fixedBtnArea.classList.add('view-main');
        requestAnimationFrame(() => {
            setTimeout(() => fixedBtnArea.classList.remove('loading-shift'), 50);
        });
    }

    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    const fixedBg = document.getElementById('fixed-bg');
    if (fixedBg) {
        fixedBg.style.transition = 'none';
        fixedBg.style.backgroundSize = 'contain'; // 기본적으로 contain으로 초기화
        if (state.currentBg) applyBackground(state.currentBg);
        else {
            fixedBg.style.backgroundImage = '';
        }
    }

    const logBtn = document.getElementById('btn-gacha-log');
    const resetBtn = document.getElementById('btn-gacha-reset');
    const btn1 = document.getElementById('btn-1pull-fixed');
    const btn10 = document.getElementById('btn-10pull-fixed');
    const jewelContainer = document.getElementById('jewel-container');
    const jewelCount = document.getElementById('jewel-count');
    const addJewelBtn = document.getElementById('btn-add-jewel');
    const totalPullCount = document.getElementById('total-pull-count');
    const muteControls = document.getElementById('gacha-header-controls');
    const muteBtn = document.getElementById('gacha-mute-btn');
    const resultsContainer = contentArea.querySelector('#gacha-results');

    const updateJewelUI = () => {
        if (jewelCount) jewelCount.textContent = state.jewels.toLocaleString();
        updateGachaButtonsState();
    };

    const updateTotalPullsUI = (prevCount = null) => {
        if (totalPullCount) {
            const exchangeText = translations[state.currentLang]?.gacha_exchange_pt || "교환pt";
            const currentPulls = state.totalPulls[state.gachaType] || 0;
            totalPullCount.textContent = (prevCount !== null) ? 
                `${exchangeText}    ${prevCount}  →  ${currentPulls}` : `${exchangeText}    ${currentPulls}`;
        }
    };

    const types = ['normal', 'limited', 'unit', 'fes'];
    const typeDisplayNames = {
        normal: state.currentLang === 'ko' ? '통상' : '恒常',
        limited: state.currentLang === 'ko' ? '한정' : '限定',
        unit: state.currentLang === 'ko' ? '유닛' : 'ユニット',
        fes: state.currentLang === 'ko' ? '페스' : 'フェス'
    };

    const typeDisplay = document.getElementById('current-gacha-type-display');
    const btnPrev = document.getElementById('btn-prev-gacha');
    const btnNext = document.getElementById('btn-next-gacha');

    const updateTypeUI = () => {
        const typeSpan = typeDisplay?.querySelector('span');
        if (typeSpan) typeSpan.textContent = typeDisplayNames[state.gachaType];
        
        document.querySelectorAll('.gacha-type-indicator .dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === types.indexOf(state.gachaType));
        });

        if (btnPrev && btnNext) {
            const idx = types.indexOf(state.gachaType);
            const prevSpan = btnPrev.querySelector('span');
            const nextSpan = btnNext.querySelector('span');
            if (prevSpan) prevSpan.textContent = typeDisplayNames[types[(idx - 1 + types.length) % types.length]];
            if (nextSpan) nextSpan.textContent = typeDisplayNames[types[(idx + 1) % types.length]];
        }
        updateTotalPullsUI();
    };

    const slideSFX = new Audio('gasya/slide.mp3');
    slideSFX.disableRemotePlayback = true;

    const clickSFX = new Audio('gasya/gasyaclick.mp3');
    clickSFX.disableRemotePlayback = true;

    const playClickSFX = () => {
        if (!state.gachaMuted) {
            clickSFX.currentTime = 0;
            clickSFX.play().catch(() => {});
        }
    };

    if (btnPrev && btnNext) {
        const animateChange = (direction) => {
            if (!state.gachaMuted) {
                slideSFX.currentTime = 0;
                slideSFX.play().catch(() => {});
            }
            const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
            const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
            const elements = [typeDisplay, btnPrev, btnNext];
            elements.forEach(el => el?.classList.add(outClass));
            setTimeout(() => {
                let idx = types.indexOf(state.gachaType);
                idx = (direction === 'next') ? (idx + 1) % types.length : (idx - 1 + types.length) % types.length;
                setGachaType(types[idx]);
                updateTypeUI();
                elements.forEach(el => {
                    if(el) { el.classList.remove(outClass); void el.offsetWidth; el.classList.add(inClass); }
                });
                setTimeout(() => elements.forEach(el => el?.classList.remove(inClass)), 80);
            }, 80);
        };
        btnPrev.onclick = () => animateChange('prev');
        btnNext.onclick = () => animateChange('next');

        // 드래그(스와이프)로 가챠 종류 전환 기능 추가
        let touchStartX = 0;
        let touchEndX = 0;
        const gachaContainer = contentArea.querySelector('.gacha-container');

        const handleSwipe = () => {
            const swipeDistance = touchEndX - touchStartX;
            const threshold = 50; // 최소 드래그 거리 (픽셀)
            if (Math.abs(swipeDistance) > threshold) {
                if (swipeDistance > 0) {
                    animateChange('prev');
                } else {
                    animateChange('next');
                }
            }
        };

        // 드래그 이벤트를 적용할 대상 목록 (상단 컨텐츠 영역 + 하단 버튼 영역)
        const swipeTargets = [gachaContainer, fixedBtnArea].filter(Boolean);

        swipeTargets.forEach(target => {
            // 터치 이벤트 (모바일)
            target.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            target.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            // 마우스 드래그 이벤트 (PC)
            target.addEventListener('mousedown', (e) => {
                touchStartX = e.screenX;
            });

            target.addEventListener('mouseup', (e) => {
                touchEndX = e.screenX;
                handleSwipe();
            });
        });
    }

    updateTypeUI();

    const updateGachaButtonsState = () => {
        if (btn1) {
            const isClose = (btn1.textContent === '닫기' || btn1.textContent === '閉じる');
            btn1.disabled = isClose ? false : (state.jewels < 250);
        }
        if (btn10) {
            const isRetry = (btn10.textContent === '1회 뽑기' || btn10.textContent === '1回引く');
            btn10.disabled = (state.jewels < (isRetry ? 250 : 2500));
        }
    };

    if (jewelContainer) { jewelContainer.classList.remove('hidden'); updateJewelUI(); }
    updateTotalPullsUI();

    const controlsTop = document.querySelector('.gacha-controls-top');
    if (controlsTop) controlsTop.classList.remove('hidden');

    if (addJewelBtn) {
        addJewelBtn.onclick = (e) => {
            e.stopPropagation();
            setJewels(state.jewels + 8200);
            updateJewelUI();
        };
    }

    if (fixedBtnArea) { fixedBtnArea.classList.remove('hidden'); fixedBtnArea.style.display = 'flex'; }
    if (logBtn) { logBtn.classList.remove('hidden'); logBtn.onclick = openGachaLogModal; }
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
        resetBtn.onclick = () => {
            setTotalPulls(0, state.gachaType); 
            clearGachaLog(state.gachaType);
            updateJewelUI(); 
            updateTotalPullsUI();
            if (resultsContainer) resultsContainer.innerHTML = '';
        };
    }

    const showMenuUI = () => {
        document.body.classList.remove('immersive-mode'); 
        if (muteBtn) muteBtn.style.display = 'flex';
        if (resultsContainer) resultsContainer.innerHTML = '';
        if (fixedBtnArea) fixedBtnArea.style.display = 'flex';
        if (controlsTop) controlsTop.classList.remove('hidden');
    };

    if (muteControls) { muteControls.classList.remove('hidden'); muteControls.style.display = 'flex'; }
    gachaBGM.muted = state.gachaMuted;
    mainBGM.muted = state.gachaMuted;

    if (!state.gachaMuted && (mainBGM.paused || mainBGM.currentTime === 0)) {
        mainBGM.currentTime = 0;
        mainBGM.play().catch(() => {});
    }
    
    if (muteBtn) {
        muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊'; 
        muteBtn.onclick = () => {
            state.gachaMuted = !state.gachaMuted;
            gachaBGM.muted = state.gachaMuted;
            mainBGM.muted = state.gachaMuted;
            if (!state.gachaMuted) mainBGM.play().catch(() => {});
            muteBtn.textContent = state.gachaMuted ? '🔇' : '🔊';
        };
    }

    const spinner = contentArea.querySelector('#gacha-spinner');
    if (btn1) btn1.disabled = true;
    if (btn10) btn10.disabled = true;
    if (spinner) spinner.classList.add('active');

    const assets = ['gasya/start_ren1.mp4', 'gasya/start_ren10.mp4', 'gasya/start_bgmnormal.mp3', 'gasya/gasyaclick.mp3', 'gasya/start_click.mp3', 'gasya/screen1.mp3', 'gasya/get_sr.mp4', 'gasya/get_r.mp4', 'gasya/1ren_result.mp3', 'gasya/10ren_result.mp3', 'gasya/spotget_rsupport.mp4', 'gasya/spotget_srsupport.mp4', 'gasya/spotget_psrsupport.mp4', 'gasya/spotget_r.mp3'];
    const assetBlobs = {}; 
    let loadedCount = 0;

    assets.forEach(src => {
        fetch(src).then(r => r.blob()).then(blob => {
            assetBlobs[src] = URL.createObjectURL(blob);
            if (++loadedCount >= assets.length) {
                updateGachaButtonsState();
                if (spinner) spinner.classList.remove('active');
            }
        }).catch(() => { if (++loadedCount >= assets.length && spinner) spinner.classList.remove('active'); });
    });

    const renderResults = (currentResults, existingIds = new Set()) => {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        const itemTpl = document.getElementById('tpl-gacha-result-item');
        resultsContainer.classList.toggle('single-result', currentResults.length === 1);

        currentResults.forEach((card, index) => {
            const clone = itemTpl.content.cloneNode(true);
            const cardEl = clone.querySelector('.gacha-result-card');
            cardEl.classList.add('animate');
            cardEl.style.animationDelay = `${index * 0.08}s`;

            const img = clone.querySelector('.result-card-img');
            const planIcon = clone.querySelector('.result-card-plan-icon');
            const rarityImg = clone.querySelector('.result-card-rarity-img');
            const name = clone.querySelector('.result-card-name');

            // NEW 뱃지 처리 (전달받은 가챠 전 보유 목록에 없으면 NEW)
            if (!existingIds.has(card.id)) {
                const newBadge = document.createElement('div');
                newBadge.className = 'new-badge';
                newBadge.textContent = 'NEW';
                cardEl.appendChild(newBadge);
                // 이번 10연차 내 중복은 NEW 표시 안 함
                existingIds.add(card.id);
            }

            if (card.type === 'produce') {
                img.src = `idols/${card.id}1.webp`;
                cardEl.classList.add('produce-card');
                let scale = card.scale || 1.60;
                let offsetY = card.offsetY || 55;
                if (window.innerWidth <= 768) { scale *= 0.7; offsetY *= 0.7; }
                img.style.transform = `scale(${scale}) translateY(${offsetY}px)`;
                if (card.plan && planIcon) { planIcon.src = `icons/${card.plan}.webp`; planIcon.classList.remove('hidden'); }
            } else {
                img.src = card.id.includes('dummy') ? 'icons/idol.png' : `images/support/${card.id}.webp`;
                cardEl.classList.add('landscape');
            }

            const rKey = card.displayRarity.toLowerCase();
            rarityImg.src = `icons/${rKey}.png`;
            cardEl.classList.add(`${rKey}-bg`);

            // IDOL / SUPPORT 타입 텍스트 추가
            const typeLabel = document.createElement('div');
            typeLabel.className = 'card-type-label';
            typeLabel.textContent = card.type === 'produce' ? 'IDOL' : 'SUPPORT';
            cardEl.appendChild(typeLabel);

            name.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            resultsContainer.appendChild(clone);
        });
    };

    let prevPulls = 0; 
    let prePullExistingIds = new Set(); // 가챠 전 보유 목록 저장

    const animation = setupGachaAnimation(contentArea, assetBlobs, gachaBGM, mainBGM, {
        onStart: (mode, actualPrevPulls) => {
            prevPulls = actualPrevPulls;
            
            // 가챠 시작 전 보유 아이디들을 미리 복사해둠
            const currentLog = state.gachaLog[state.gachaType] || [];
            prePullExistingIds = new Set(currentLog.map(item => item.id));

            if (muteControls) muteControls.style.display = 'none';
            if (logBtn) logBtn.classList.add('hidden');
            if (resetBtn) resetBtn.classList.add('hidden');
            if (jewelContainer) jewelContainer.classList.add('hidden');
            if (controlsTop) controlsTop.classList.add('hidden');
        },
        onFinish: (currentResults, gachaMode) => {
            document.body.classList.add('gacha-result-active'); // 결과 화면 전용 클래스 추가
            updateTotalPullsUI(prevPulls); 
            if (logBtn) logBtn.classList.remove('hidden');
            if (jewelContainer) jewelContainer.classList.remove('hidden');
            if (fixedBtnArea) { fixedBtnArea.classList.remove('view-main'); fixedBtnArea.classList.add('view-result'); }
            
            if (btn1 && btn10) {
                btn1.classList.add('close-style');
                btn1.innerHTML = "<span class='close-x'>✕</span> " + translations[state.currentLang].gacha_close;
                btn1.onclick = () => {
                    btn1.style.pointerEvents = 'none';
                    btn10.style.pointerEvents = 'none';
                    setTimeout(() => renderGacha(), 100);
                };
                
                const is10 = (gachaMode === 10);
                btn10.innerHTML = translations[state.currentLang][is10 ? 'gacha_10pull' : 'gacha_1pull'] + "<br><span class='btn-cost'>" + (is10 ? "2500" : "250") + "</span>";
                btn10.onclick = () => {
                    playClickSFX();
                    updateJewelDisplayOnly(gachaMode === 1 ? 250 : 2500);
                    btn1.style.pointerEvents = 'none';
                    btn10.style.pointerEvents = 'none';
                    setTimeout(() => animation.startGacha(gachaMode), 100);
                };
                
                // 0.3초간 실수 클릭 방지
                btn1.style.pointerEvents = 'none';
                btn10.style.pointerEvents = 'none';
                setTimeout(() => {
                    btn1.style.pointerEvents = 'auto';
                    btn10.style.pointerEvents = 'auto';
                    updateGachaButtonsState();
                }, 300);
            }
            renderResults(currentResults, prePullExistingIds); // 저장해둔 목록 전달
            const fixedBg = document.getElementById('fixed-bg');
            if (fixedBg) { fixedBg.style.backgroundImage = "url('gasya/background.jpg')"; fixedBg.style.backgroundSize = "cover"; }
            history.pushState({ target: 'gacha', view: 'result' }, "");
        }
    });

    const updateJewelDisplayOnly = (cost) => {
        if (jewelCount) {
            const newCount = Math.max(0, state.jewels - cost);
            jewelCount.textContent = newCount.toLocaleString();
        }
    };

    if (btn1) {
        btn1.classList.remove('close-style'); // 초기화 시 클래스 제거
        btn1.innerHTML = translations[state.currentLang].gacha_1pull + "<br><span class='btn-cost'>250</span>";
        btn1.style.pointerEvents = 'auto'; // 확실하게 초기화
        btn1.onclick = () => {
            playClickSFX();
            updateJewelDisplayOnly(250); // 즉시 갱신
            btn1.style.pointerEvents = 'none';
            btn10.style.pointerEvents = 'none';
            setTimeout(() => animation.startGacha(1), 100);
        };
    }
    if (btn10) {
        btn10.innerHTML = translations[state.currentLang].gacha_10pull + "<br><span class='btn-cost'>2500</span>";
        btn10.style.pointerEvents = 'auto'; // 확실하게 초기화
        btn10.onclick = () => {
            playClickSFX();
            updateJewelDisplayOnly(gachaBGM && gachaBGM.src.includes('view-result') ? (gachaMode === 1 ? 250 : 2500) : 2500); // gachaMode 접근 문제 해결 필요
            // 단순하게 가기로 함: 메인 버튼은 10pull(2500), 결과창 버튼은 gachaMode에 따라 다름.
            const cost = (fixedBtnArea && fixedBtnArea.classList.contains('view-result')) ? (gachaMode === 1 ? 250 : 2500) : 2500;
            updateJewelDisplayOnly(cost);
            btn1.style.pointerEvents = 'none';
            btn10.style.pointerEvents = 'none';
            setTimeout(() => animation.startGacha(10), 100);
        };
    }
}