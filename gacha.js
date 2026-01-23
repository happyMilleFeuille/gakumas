// gacha.js
import { updatePageTranslations } from './utils.js';
import { pickGacha, getHighestRarity } from './gachalist.js';
import { state, setJewels, setTotalPulls, addGachaLog, clearGachaLog } from './state.js';
import { currencyData } from './currency.js';
import translations from './i18n.js';

export function renderGacha() {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    const tpl = document.getElementById('tpl-gacha');
    if (!tpl) return;
    
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();

    // 요소 선택 (외부 고정 버튼 사용)
    const fixedBtnArea = document.getElementById('gacha-fixed-buttons');
    const logBtn = document.getElementById('btn-gacha-log');
    const resetBtn = document.getElementById('btn-gacha-reset');
    const btn1 = document.getElementById('btn-1pull-fixed');
    const btn10 = document.getElementById('btn-10pull-fixed');
    
    // 쥬얼(재화) 처리 로직 추가
    const jewelContainer = document.getElementById('jewel-container');
    const jewelCount = document.getElementById('jewel-count');
    const addJewelBtn = document.getElementById('btn-add-jewel');
    const totalPullCount = document.getElementById('total-pull-count');

    const updateJewelUI = () => {
        if (jewelCount) jewelCount.textContent = state.jewels.toLocaleString();
        updateGachaButtonsState();
    };

    const updateTotalPullsUI = (prevCount = null) => {
        if (totalPullCount) {
    const lang = document.documentElement.lang || 'ko';
    const exchangeText = translations[lang]?.gacha_exchange_pt || "교환pt";

    if (prevCount !== null) {
        totalPullCount.textContent = `${exchangeText}    ${prevCount}  →  ${state.totalPulls}`;
    } else {
        totalPullCount.textContent = `${exchangeText}    ${state.totalPulls}`;
    }
        }
    };

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
            if (confirm(state.currentLang === 'ko' ? '쥬얼과 가챠 기록을 초기화하시겠습니까?' : 'ジュエルとガチャ記録を初期化합니다까？')) {
                setJewels(0);
                setTotalPulls(0);
                clearGachaLog();
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

    // 오디오 객체 생성
    const gachaBGM = new Audio();
    let isMuted = state.gachaMuted; 
    gachaBGM.muted = isMuted;
    
    let currentResults = [];
    let clickTimer = null;
    let videoStep = 0; 
    let gachaMode = 0;
    let canClick = false;
    
    const toggleMute = () => {
        state.gachaMuted = !state.gachaMuted; 
        isMuted = state.gachaMuted;
        gachaBGM.muted = isMuted;
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
        'gasya/get_sr.mp4',
        'gasya/get_r.mp4'
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
        
        currentResults.forEach(card => {
            const clone = itemTpl.content.cloneNode(true);
            const cardEl = clone.querySelector('.gacha-result-card');
            const img = clone.querySelector('.result-card-img');
            const rarity = clone.querySelector('.result-card-rarity');
            const name = clone.querySelector('.result-card-name');

            if (card.type === 'produce') {
                img.src = `idols/${card.id}1.webp`;
            } else if (card.id.includes('dummy')) {
                img.src = 'icons/idol.png';
            } else {
                img.src = `images/support/${card.id}.webp`;
            }

            rarity.textContent = card.displayRarity;
            const rarityClass = card.displayRarity.toLowerCase();
            rarity.className = `result-card-rarity rarity-${rarityClass}`;
            cardEl.className = `gacha-result-card ${rarityClass}-border`;
            
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
        gachaBGM.pause();
        gachaBGM.currentTime = 0;
        if(videoMain) { videoMain.pause(); videoMain.src = ""; videoMain.classList.add('hidden'); }
        if(videoNext) { videoNext.pause(); videoNext.src = ""; videoNext.classList.add('hidden'); }
        if(videoContainer) videoContainer.classList.add('hidden');
        document.body.classList.remove('immersive-mode');
        videoStep = 0;

        // 가챠 결과가 나타나면 기록 버튼 및 음소거 버튼 표시
        if (muteControls) {
            muteControls.classList.remove('hidden');
            muteControls.style.display = 'flex';
        }
        if (logBtn) logBtn.classList.remove('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
        if (jewelContainer) jewelContainer.classList.remove('hidden');

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
    };

    const playGetAnimation = () => {
        const highest = getHighestRarity(currentResults);
        let getSrc = (highest === 'SSR' || highest === 'SR') ? 'gasya/get_sr.mp4' : 'gasya/get_r.mp4';
        
        if (videoNext && videoMain) {
            videoStep = 2; 
            videoNext.src = assetBlobs[getSrc] || getSrc;
            videoNext.muted = isMuted;
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
            videoMain.play().catch(finishGacha);
            clickTimer = setTimeout(() => { canClick = true; }, 2000);
        }
    };

    const startGacha = (mode) => {
        const cost = (mode === 1) ? 250 : 2500;

        if (!isMuted && assetBlobs['gasya/gasyaclick.mp3']) {
            const clickSfx = new Audio(assetBlobs['gasya/gasyaclick.mp3']);
            clickSfx.play().catch(() => {});
        }

        // 쥬얼 차감 및 UI 갱신 (이미 버튼 비활성화를 통해 검증됨)
        setJewels(state.jewels - cost);
        updateJewelUI();

        // 누적 가챠 횟수 증가 및 UI 갱신
        const prevPulls = state.totalPulls;
        setTotalPulls(state.totalPulls + mode);
        updateTotalPullsUI(prevPulls);

        currentResults = pickGacha(mode);
        addGachaLog(currentResults); // 가챠 기록 저장

        if (resultsContainer) resultsContainer.innerHTML = '';
        
        // 가챠 시작 시 모든 UI 숨김 (영상 집중)
        if (muteControls) muteControls.style.display = 'none';
        if (logBtn) logBtn.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
        if (jewelContainer) jewelContainer.classList.add('hidden');

        document.body.classList.add('immersive-mode');
        gachaMode = mode;
        videoStep = 0;
        canClick = false;
        if (clickTimer) clearTimeout(clickTimer);

        clickTimer = setTimeout(() => { 
            canClick = true; 
        }, 600);
        
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
            videoMain.onended = playGetAnimation;

            const checkPausePoint = () => {
                if (videoStep === 0 && videoMain && !videoMain.paused) {
                    const jt = (gachaMode === 1) ? 9.8 : 8.6;
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

    if (state.gachaLog.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">기록이 없습니다.</p>';
        return;
    }

    // 1. 통계 계산
    const total = state.gachaLog.length;
    const stats = {
        total: { SSR: 0, SR: 0, R: 0 },
        produce: { SSR: 0, SR: 0, R: 0 },
        support: { SSR: 0, SR: 0, R: 0 }
    };
    const grouped = new Map();

    state.gachaLog.forEach(item => {
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
    
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
}
