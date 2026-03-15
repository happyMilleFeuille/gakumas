// ui.js
import { state, setFilter, setSupportLB, setPSSRIndex, setFavoriteIdol, idolColors, toggleDisabledCard, saveToSlot, loadFromSlot, getSlotInfo, deleteSlot } from './state.js';
import { updatePageTranslations } from './utils.js';
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { abilityData } from './abilitydata.js';
import { initCalc } from './calc.js';
import { calcStore } from './calcStore.js';
import translations from './i18n.js';

const contentArea = document.getElementById('content-area');

// 계산기 화면 복귀 이벤트 리스너
window.addEventListener('renderCalcRequested', () => {
    renderCalc();
});

const idolList = [
    'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 
    'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
];

export function renderHome() {
    if (!contentArea) return;
    const tpl = document.getElementById('tpl-home');
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();
}

export function renderCalc() {
    if (!contentArea) return;
    const tpl = document.getElementById('tpl-calc');
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();
    initCalc();
}

export function renderIdolList() {
    if (!contentArea) return;
    contentArea.innerHTML = '';
    
    const gridTpl = document.getElementById('tpl-idol-grid');
    const itemTpl = document.getElementById('tpl-idol-item');
    const view = gridTpl.content.cloneNode(true);
    const grid = view.querySelector('.idol-grid');
    
    // PSSR 컨테이너 추가
    const pssrArea = document.createElement('div');
    pssrArea.className = 'pssr-container';
    pssrArea.innerHTML = '<div class="pssr-grid"></div>';
    const pssrGrid = pssrArea.querySelector('.pssr-grid');

    idolList.forEach(name => {
        const item = itemTpl.content.cloneNode(true);
        const img = item.querySelector('.idol-icon');
        const favBtn = item.querySelector('.fav-star-btn');
        
        img.src = `icons/idolicons/${name}.png`;
        img.alt = name;

        // 즐겨찾기 상태 반영
        if (state.favoriteIdol === name) {
            favBtn.classList.add('active');
        }

        favBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 카드 클릭 이벤트 방지
            setFavoriteIdol(name);
            
            // 모든 별 버튼 상태 업데이트
            document.querySelectorAll('.fav-star-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            if (state.favoriteIdol === name) {
                favBtn.classList.add('active');
            }

            // [추가] 전체 배경색 업데이트
            updateGlobalBackgroundColor();
        });

        img.addEventListener('click', (e) => {
            // [추가] 선택된 아이콘 스타일링
            document.querySelectorAll('.idol-icon').forEach(icon => {
                icon.classList.remove('selected');
                icon.style.borderColor = ''; // 기존 스타일 초기화
                icon.style.boxShadow = '';
            });
            
            img.classList.add('selected');
            const getIdolDisplayColor = (id) => (idolColors[id] || "#ff4d8d");
            const color = getIdolDisplayColor(name);
            img.style.borderColor = color;
            img.style.boxShadow = `0 0 15px ${color}66`;

            // Center the clicked icon
            const clickedItem = e.currentTarget.parentElement.parentElement;
            const gridContainer = clickedItem.parentElement;
            if (gridContainer) {
                const containerWidth = gridContainer.offsetWidth;
                const itemOffsetLeft = clickedItem.offsetLeft;
                const itemWidth = clickedItem.offsetWidth;
                const scrollPos = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);
                gridContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }

            // Render Produce Cards for this idol
            renderProduceCards(name, pssrGrid);
        });
        grid.appendChild(item);
    });

    contentArea.appendChild(view);
    contentArea.appendChild(pssrArea);

    // [추가] 즐겨찾기 아이돌이 있다면 자동으로 선택
    if (state.favoriteIdol) {
        setTimeout(() => {
            const favIcon = contentArea.querySelector(`.idol-icon[alt="${state.favoriteIdol}"]`);
            if (favIcon) {
                favIcon.click();
            }
        }, 100); // 렌더링 후 안정적인 실행을 위해 짧은 지연
    }
}

function renderProduceCards(idolName, container) {
    container.innerHTML = '';
    const itemTpl = document.getElementById('tpl-pssr-item');
    if (!itemTpl) return;

    const produceCards = produceList.filter(p => {
        // ID가 ssr이름_ 혹은 sr이름_ 형식으로 시작하는지 정교하게 체크
        // 예: ssrchina_... 는 china에게만 매칭되고, ssrhiro_michinaru... 는 hiro에게만 매칭됨
        const nameMatch = p.id.startsWith(`ssr${idolName}_`) || 
                          p.id.startsWith(`sr${idolName}_`) || 
                          p.id.startsWith(`r${idolName}_`);
        
        return nameMatch && 
               (p.rarity === 'PSSR' || p.rarity === 'PSR') && 
               p.another !== true;
    });

    produceCards.sort((a, b) => {
        if (a.rarity === b.rarity) return 0;
        return a.rarity === 'PSSR' ? -1 : 1;
    });

    if (produceCards.length === 0) {
        container.innerHTML = `<p style="color:#999; padding:2rem; width:100%; text-align:center;">No cards found for ${idolName}.</p>`;
        return;
    }

    produceCards.forEach((card, index) => {
        const item = itemTpl.content.cloneNode(true);
        const cardEl = item.querySelector('.pssr-card');
        const img = item.querySelector('.pssr-img');
        const imgWrapper = item.querySelector('.pssr-img-wrapper');
        const planIcon = item.querySelector('.pssr-plan-icon');
        const rarityIcon = item.querySelector('.pssr-rarity-icon');
        const name = item.querySelector('.pssr-name');

        const personalColor = idolColors[idolName] || "#ffffff";
        const infoBox = item.querySelector('.pssr-info');
        
        // [수정] 카드 전체와 정보창의 색상을 완벽하게 일치시킴 (불투명 처리)
        const mixedBg = `linear-gradient(${personalColor}26, ${personalColor}26)`; // 약 15% 농도
        cardEl.style.backgroundColor = "#ffffff";
        cardEl.style.backgroundImage = mixedBg;
        
        infoBox.style.backgroundColor = "transparent"; // 정보창 배경을 투명하게 하여 카드 배경이 그대로 보이게 함
        infoBox.style.backgroundImage = "none";
        
        name.style.color = '#333'; 
        imgWrapper.style.backgroundColor = personalColor + "11"; 

        const imageList = [
            `idols/${card.id}1.webp`,
            `idols/${card.id}2.webp`
        ];
        
        const anothers = produceList.filter(p => p.another === true && p.id.startsWith(card.id));
        anothers.forEach(a => {
            imageList.push(`idols/${a.id}1.webp`);
        });

        imageList.forEach(url => {
            const preimg = new Image();
            preimg.src = url;
        });

        let currentIndex = state.pssrIndex[card.id] || 0;
        if (currentIndex >= imageList.length) currentIndex = 0;
        img.src = imageList[currentIndex];

        cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            img.classList.add('slide-out');
            imgWrapper.style.backgroundColor = personalColor; 
            
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % imageList.length;
                setPSSRIndex(card.id, currentIndex);
                
                img.style.transition = 'none';
                img.classList.remove('slide-out');
                img.classList.add('slide-prepare');
                img.src = imageList[currentIndex];
                
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        img.style.transition = '';
                        img.classList.remove('slide-prepare');
                        setTimeout(() => {
                            imgWrapper.style.backgroundColor = personalColor + "11";
                        }, 200);
                    });
                });
            }, 100);
        });

        let retryCount = 0;
        img.onerror = () => {
            if (retryCount < imageList.length) {
                retryCount++;
                currentIndex = (currentIndex + 1) % imageList.length;
                img.src = imageList[currentIndex];
            }
        };
        
        if (card.plan) {
            planIcon.src = `icons/${card.plan}.webp`;
            planIcon.style.display = 'block';
        } else {
            planIcon.style.display = 'none';
        }

        const rarityKey = card.rarity.toLowerCase().replace('p', ''); 
        rarityIcon.src = `icons/${rarityKey}.png`;
        const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        name.textContent = displayName;

        // 유튜브 링크 설정
        const youtubeLink = item.querySelector('.pssr-youtube-link');
        if (youtubeLink) {
            if (card.youtube_url) {
                youtubeLink.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const videoModal = document.getElementById('video-modal');
                    const iframe = document.getElementById('video-iframe');
                    if (!videoModal || !iframe) return;

                    const finalUrl = card.youtube_url;
                    // 유튜브 URL을 embed용으로 변환
                    let embedUrl = finalUrl;
                    if (finalUrl.includes('watch?v=')) {
                        const videoId = finalUrl.split('watch?v=')[1].split('&')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    } else if (finalUrl.includes('youtu.be/')) {
                        const videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    }

                                                    iframe.src = embedUrl;
                                    
                                                    // 캐릭터별 테두리 색상 적용
                                                    const modalContent = videoModal.querySelector('.video-modal-content');
                                                    const innerContainer = videoModal.querySelector('.video-container');
                                                    const personalColor = idolColors[idolName] || '#ff4d8d';
                                                    if (modalContent) modalContent.style.borderColor = personalColor;
                                                    if (innerContainer) innerContainer.style.borderColor = personalColor;
                                    
                                                    // 로딩 지연 및 싱크 개선: 약간의 시간차를 두고 모달 표시
                                                    setTimeout(() => {
                                                        videoModal.classList.remove('hidden');
                                                        videoModal.style.display = 'flex';
                                                    }, 100);
                                                    
                                                    const hideVideoModal = () => {
                                                        videoModal.classList.add('hidden');
                                                        videoModal.style.display = 'none';
                                                        iframe.src = '';
                                                    };
                                                    window.hideVideoModal = hideVideoModal;
                    
                    videoModal.onclick = (ev) => { if (ev.target === videoModal) hideVideoModal(); };
                    
                    history.pushState({ modalOpen: 'video' }, "");
                };
                youtubeLink.classList.remove('hidden');
            } else {
                youtubeLink.classList.add('hidden');
            }
        }
        
        container.appendChild(item);
    });
}

function openSlotModal() {
    const isJa = state.currentLang === 'ja';
    let modal = document.getElementById('slot-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'slot-modal';
    
    const renderSlots = () => {
        let slotsHtml = '';
        for (let i = 1; i <= 3; i++) {
            const info = getSlotInfo(i);
            slotsHtml += `
                <div class="slot-modal-item">
                    <div class="slot-modal-info">
                        <span class="slot-modal-name">Slot ${i}</span>
                        <span class="slot-modal-date">${info || (isJa ? 'データなし' : '데이터 없음')}</span>
                    </div>
                    <div class="slot-modal-actions">
                        <button class="slot-btn save" data-slot="${i}">${isJa ? 'セーブ' : '저장'}</button>
                        <button class="slot-btn load" data-slot="${i}" ${!info ? 'disabled' : ''}>${isJa ? 'ロード' : '로드'}</button>
                        <button class="slot-btn delete" data-slot="${i}" ${!info ? 'style="display:none;"' : ''}>&times;</button>
                    </div>
                </div>`;
        }
        return slotsHtml;
    };

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 350px;">
            <span class="close-modal">&times;</span>
            <h3 style="margin-top:0; color:#ff4d8d; font-size:1.1rem;">${isJa ? 'セーブ / ロード' : '프리셋 저장/로드'}</h3>
            <div class="slot-modal-list">
                ${renderSlots()}
            </div>
        </div>`;



    document.body.appendChild(modal);
    modal.style.display = 'flex';

    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('.save');
        const loadBtn = e.target.closest('.load');
        const deleteBtn = e.target.closest('.delete');
        
        if (saveBtn) {
            const slotId = saveBtn.dataset.slot;
            if (confirm(isJa ? `スロット ${slotId} に現在の状態を保存しますか？` : `슬롯 ${slotId} 에 현재 상태를 저장하시겠습니까?`)) {
                saveToSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            }
        }
        
        if (loadBtn) {
            const slotId = loadBtn.dataset.slot;
            if (confirm(isJa ? `スロット ${slotId} のデータを読み込みますか？` : `슬롯 ${slotId} 의 데이터를 불러오시겠습니까?`)) {
                if (loadFromSlot(slotId)) {
                    renderSupport();
                    modal.remove();
                }
            }
        }

        if (deleteBtn) {
            const slotId = deleteBtn.dataset.slot;
            if (confirm(isJa ? `スロット ${slotId} 의 데이터를 삭제하시겠습니까?` : `슬롯 ${slotId} 의 데이터를 삭제하시겠습니까?`)) {
                deleteSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            }
        }
    });
}

function syncSlotUI(container) {
    // 기존 슬롯 UI 동기화 기능은 모달로 대체됨 (빈 함수로 유지하거나 삭제 가능)
}

export function renderSupport() {
    if (!contentArea) return;

    let container = contentArea.querySelector('.support-container');
    if (!container) {
        contentArea.innerHTML = '';
        const tpl = document.getElementById('tpl-support');
        contentArea.appendChild(tpl.content.cloneNode(true));
        container = contentArea.querySelector('.support-container');
        setupStaticListeners(container);
    }

    syncFilterUI(container);
    syncSlotUI(container); // [추가] 슬롯 정보 업데이트
    updateSupportGrid(container);
}

function setupStaticListeners(container) {
    const filterGroups = ['plan', 'attr', 'source', 'rarity'];
    filterGroups.forEach(type => {
        const group = container.querySelector(`#filter-${type}`);
        if (!group) return;
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            setFilter(type, btn.dataset.val);
            renderSupport(); 
        });
    });

    const toggleBtn = container.querySelector('#btn-toggle-extra');
    const extraWrapper = container.querySelector('#extra-filters');
    if (toggleBtn && extraWrapper) {
        toggleBtn.addEventListener('click', () => {
            state.extraFiltersOpen = !state.extraFiltersOpen;
            if (state.extraFiltersOpen) {
                extraWrapper.classList.remove('hidden');
                toggleBtn.classList.add('active');
            } else {
                extraWrapper.classList.add('hidden');
                toggleBtn.classList.remove('active');
            }
        });
    }

    const sortSelect = container.querySelector('#support-sort');
    if (sortSelect) {
        const isJa = state.currentLang === 'ja';
        sortSelect.innerHTML = `
            <option value="id-desc">${isJa ? '最新順' : '최신순'}</option>
            <option value="id-asc">${isJa ? '古い順' : '과거순'}</option>
            <option value="lb-desc">${isJa ? '特訓順' : '돌파순'}</option>
            <option value="name-asc">${isJa ? '名前順' : '이름순'}</option>
        `;
        sortSelect.value = state.sortBy;
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderSupport();
        });
    }

    const allMaxBtn = container.querySelector('#btn-all-max-lb');
    if (allMaxBtn) {
        const isJa = state.currentLang === 'ja';
        allMaxBtn.textContent = isJa ? '全カード完凸' : '모든 카드 풀돌';
        allMaxBtn.addEventListener('click', () => {
            const confirmMsg = isJa ? 'すべてのカードを完凸状態に変更しますか？' : '모든 카드를 4단계 돌파(풀돌) 상태로 변경하시겠습니까?';
            if (!confirm(confirmMsg)) return;
            cardList.forEach(card => {
                setSupportLB(card.id, 4);
            });
            renderSupport();
            if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
        });
    }

    // 슬롯 관리 모달 열기
    const openSlotBtn = container.querySelector('#btn-open-slot-modal');
    if (openSlotBtn) {
        openSlotBtn.addEventListener('click', () => {
            openSlotModal();
        });
    }

    if (false) {
        slotContainer.addEventListener('click', (e) => {
            const saveBtn = e.target.closest('.slot-btn.save');
            const loadBtn = e.target.closest('.slot-btn.load');
            const isJa = state.currentLang === 'ja';

            if (saveBtn) {
                const slotId = saveBtn.dataset.slot;
                const confirmMsg = isJa ? `スロット ${slotId} 에 현재 상태를 저장하시겠습니까?` : `슬롯 ${slotId} 에 현재 상태(돌파/비활성화)를 저장하시겠습니까?`;
                if (!confirm(confirmMsg)) return;
                
                import('./state.js').then(m => {
                    m.saveToSlot(slotId);
                    syncSlotUI(container);
                    alert(isJa ? '保存されました。' : '저장되었습니다.');
                });
            }

            if (loadBtn) {
                const slotId = loadBtn.dataset.slot;
                const confirmMsg = isJa ? `スロット ${slotId} 의 데이터를 불러오시겠습니까? 현재 상태는 덮어씌워집니다.` : `슬롯 ${slotId} 의 데이터를 불러오시겠습니까? 현재 설정된 상태가 모두 바뀝니다.`;
                if (!confirm(confirmMsg)) return;

                import('./state.js').then(m => {
                    if (m.loadFromSlot(slotId)) {
                        renderSupport();
                        alert(isJa ? '読み込みが完了しました。' : '데이터를 불러왔습니다.');
                    } else {
                        alert(isJa ? '保存된 데이터가 없습니다.' : '저장된 데이터가 없습니다.');
                    }
                });
            }
        });
    }

    const grid = container.querySelector('.support-grid');
    let longPressTimer;
    let isLongPress = false;

    grid.addEventListener('mousedown', (e) => {
        const cardEl = e.target.closest('.support-card');
        if (!cardEl) return;
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const cardId = cardEl.dataset.id;
            toggleDisabledCard(cardId);
            
            // [추가] 계산기 선택 목록에서도 실제로 제거 (선택 취소)
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].filter(id => id !== cardId);
                    }
                });
                calcStore.save(); // 변경사항 저장
            }

            renderSupport();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    });

    grid.addEventListener('touchstart', (e) => {
        const cardEl = e.target.closest('.support-card');
        if (!cardEl) return;
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const cardId = cardEl.dataset.id;
            toggleDisabledCard(cardId);

            // [추가] 계산기 선택 목록에서도 실제로 제거 (선택 취소)
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].filter(id => id !== cardId);
                    }
                });
                calcStore.save(); // 변경사항 저장
            }

            renderSupport();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    }, { passive: true });

    const cancelLongPress = () => clearTimeout(longPressTimer);
    grid.addEventListener('mouseup', cancelLongPress);
    grid.addEventListener('mouseleave', cancelLongPress);
    grid.addEventListener('touchend', cancelLongPress);
    grid.addEventListener('touchmove', cancelLongPress);

    grid.addEventListener('click', (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const star = e.target.closest('.card-star');
        const cardEl = e.target.closest('.support-card');
        
        if (star && cardEl) {
            e.stopPropagation();
            const cardId = cardEl.dataset.id;
            const starIdx = parseInt(star.dataset.star, 10);
            const currentLB = state.supportLB[cardId] || 0;
            const newLB = (starIdx === currentLB) ? 0 : starIdx;
            
            setSupportLB(cardId, newLB);
            const stars = cardEl.querySelectorAll('.card-star');
            stars.forEach((s, idx) => s.classList.toggle('active', idx < newLB));
            return;
        }

        if (cardEl) {
            const cardId = cardEl.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (card) {
                const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
                const imgSrc = card.image || `images/support/${cardId}.webp`;
                showCardModal(card, displayName, imgSrc);
            }
        }
    });
}

function syncFilterUI(container) {
    const filterGroups = ['plan', 'attr', 'source', 'rarity'];
    filterGroups.forEach(type => {
        const btns = container.querySelectorAll(`#filter-${type} .filter-btn`);
        btns.forEach(btn => {
            const val = btn.dataset.val;
            let isActive = false;
            
            if (val === 'all') {
                // 배열이 비어있으면 '전체' 활성화
                isActive = (state.filters[type].length === 0);
            } else {
                // 배열 내에 값이 포함되어 있으면 활성화
                isActive = state.filters[type].includes(val);
            }
            btn.classList.toggle('active', isActive);
        });
    });

    const toggleBtn = container.querySelector('#btn-toggle-extra');
    const extraWrapper = container.querySelector('#extra-filters');
    if (state.extraFiltersOpen) {
        extraWrapper?.classList.remove('hidden');
        toggleBtn?.classList.add('active');
    }

    const sortSelect = container.querySelector('#support-sort');
    if (sortSelect) sortSelect.value = state.sortBy;
}

function updateSupportGrid(container) {
    const grid = container.querySelector('.support-grid');
    const itemTpl = document.getElementById('tpl-support-item');
    
    let filteredList = cardList.filter(card => {
        if (card.encyclopedia === false) return false;
        const cPlan = (card.plan || 'free').toLowerCase();
        const cType = card.type.toLowerCase();
        const cSource = (card.source || 'normal').toLowerCase();
        const cRarity = card.rarity;

        const planMatch = (state.filters.plan.length === 0) || (state.filters.plan.includes(cPlan));
        const attrMatch = (state.filters.attr.length === 0) || (state.filters.attr.includes(cType));
        const sourceMatch = (state.filters.source.length === 0) || (state.filters.source.includes(cSource));
        const rarityMatch = (state.filters.rarity.length === 0) || (state.filters.rarity.includes(cRarity));

        return planMatch && attrMatch && sourceMatch && rarityMatch;
    });

    const getNumericId = (id) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    // 정렬 로직 수정: 비활성화된 카드는 항상 맨 뒤로
    filteredList.sort((a, b) => {
        const aDisabled = !!state.disabledCards[a.id];
        const bDisabled = !!state.disabledCards[b.id];
        if (aDisabled !== bDisabled) return aDisabled ? 1 : -1;

        const dateA = a.releasedAt || "";
        const dateB = b.releasedAt || "";
        if (state.sortBy === 'id-desc') {
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            return getNumericId(b.id) - getNumericId(a.id) || b.id.localeCompare(a.id);
        } else if (state.sortBy === 'id-asc') {
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            return getNumericId(a.id) - getNumericId(b.id) || a.id.localeCompare(b.id);
        } else if (state.sortBy === 'lb-desc') {
            const lbA = state.supportLB[a.id] || 0;
            const lbB = state.supportLB[b.id] || 0;
            return lbB - lbA || getNumericId(b.id) - getNumericId(a.id);
        } else if (state.sortBy === 'name-asc') {
            const nameA = (state.currentLang === 'ja' && a.name_ja) ? a.name_ja : a.name;
            const nameB = (state.currentLang === 'ja' && b.name_ja) ? b.name_ja : b.name;
            return nameA.localeCompare(nameB);
        }
        return 0;
    });

    grid.innerHTML = '';
    if (filteredList.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1; padding:2rem;">No cards found.</p>';
    } else {
        const fragment = document.createDocumentFragment();
        filteredList.forEach(card => {
            const item = itemTpl.content.cloneNode(true);
            const cardEl = item.querySelector('.support-card');
            const cardId = card.id;
            const currentLB = state.supportLB[cardId] || 0;
            const isDeactivated = !!state.disabledCards[cardId];

            cardEl.dataset.id = cardId;
            cardEl.classList.add(`rarity-${card.rarity.toLowerCase()}`);
            if (isDeactivated) cardEl.classList.add('is-disabled');
            
            const imgSrc = card.image || `images/support/${cardId}.webp`;
            item.querySelector('.card-img').src = imgSrc;
            item.querySelectorAll('.card-star').forEach((s, idx) => s.classList.toggle('active', idx < currentLB));
            
            const plan = (card.plan || 'free').toLowerCase();
            item.querySelector('.card-plan-icon').src = `icons/${plan}.webp`;
            item.querySelector('.card-type-icon').src = `icons/${card.type.toLowerCase()}.png`;

            fragment.appendChild(item);
        });
        grid.appendChild(fragment);
    }
    updatePageTranslations(container);
}

// 모달 표시 함수
export function showCardModal(card, displayName, imgSrc) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    // 초기 상태 저장 (닫을 때 변화 감지용)
    window._modalCardId = card.id;
    window._modalInitialLB = state.supportLB[card.id] || 0;

    const mImg = document.getElementById('modal-img');    const mTitle = document.getElementById('modal-title');
    const mRarity = document.getElementById('modal-rarity');
    const mPlan = document.getElementById('modal-plan');
    const mType = document.getElementById('modal-type');
    const mExtraIcon = document.getElementById('modal-extra-icon');
    const mExtra1 = document.getElementById('modal-extra-1');
    const mExtra2 = document.getElementById('modal-extra-2');
    const mAbilities = document.getElementById('modal-abilities');
    const stars = document.querySelectorAll('.star');

    // 이전 데이터 비우기 (반짝임 방지)
    mImg.src = '';
    mRarity.src = '';
    mPlan.src = '';
    mType.src = '';
    mExtraIcon.src = '';

    mImg.src = imgSrc;
    mTitle.textContent = displayName;
    mRarity.src = `icons/${card.rarity.toLowerCase()}.png`;
    mPlan.src = `icons/${(card.plan || 'free').toLowerCase()}.webp`;
    mType.src = `icons/${card.type.toLowerCase()}.png`;

    mTitle.classList.remove('title-vocal', 'title-dance', 'title-visual', 'title-assist');
    mTitle.classList.add(`title-${card.type.toLowerCase()}`);

    const baseIconPath = `images/support/${card.id}`;
    mExtraIcon.src = `${baseIconPath}_card.webp`;
    mExtraIcon.onerror = () => {
        mExtraIcon.src = `${baseIconPath}_item.webp`;
        mExtraIcon.onerror = null;
    };

    const highlightNumbers = (text, type) => {
        if (!text) return '';
        const colorClass = `highlight-${type.toLowerCase()}`;
        return text.replace(/([0-9]+[0-9.]*[%]*)/g, `<span class="${colorClass}">$1</span>`);
    };    

    const getExtraText = (val) => {
        if (!val) return '';
        let resultText = '';
        if (val === 'param') {
            const rarity = card.rarity || 'SSR';
            const valNum = (rarity === 'SSR') ? 20 : 15;
            const attrKey = `attr_${card.type.toLowerCase()}`;
            const translatedType = translations[state.currentLang][attrKey] || card.type;
            const format = translations[state.currentLang]['extra_param'] || '{type} 상승+{val}';
            resultText = format.replace('{type}', translatedType).replace('{val}', valNum);
        } else {
            const key = `extra_${val}`;
            resultText = translations[state.currentLang][key] || val;
        }
        return highlightNumbers(resultText, card.type);
    };

    mExtra1.innerHTML = getExtraText(card.extra1);
    if (card.rarity === 'SSR') {
        mExtra2.innerHTML = getExtraText(card.extra2);
        mExtra2.classList.remove('hidden');
    } else {
        mExtra2.innerHTML = '';
        mExtra2.classList.add('hidden');
    }

    let currentLB = state.supportLB[card.id] || 0;

    const updateAbilities = (lb) => {
        mAbilities.innerHTML = '';
        if (card.abilities && card.abilities.length > 0) {
            card.abilities.forEach((abId, index) => {
                const data = abilityData[abId];
                if (data) {
                    const rarity = card.rarity || 'SSR';
                    const isDist = card.source === 'dist';
                    let rarityKey = rarity;
                    if (rarity === 'SSR' && isDist && data.levels['SSR_DIST']) rarityKey = 'SSR_DIST';

                    let val = 0;
                    if (abId === 'supportrateup' || abId === 'percentparam' || abId === 'fixedparam') {
                        const targetLv = lb + 1;
                        const bonusLevels = data.levels[rarity] || data.levels;
                        val = bonusLevels[targetLv] || bonusLevels[5] || Object.values(bonusLevels)[Object.values(bonusLevels).length-1];
                    } else if (abId === 'event_paraup' || abId === 'event_recoveryup') {
                        let targetLv = (rarity === 'SSR') ? (lb >= 4 ? 3 : (lb >= 1 ? 2 : 1)) : (lb >= 4 ? 3 : (lb >= 2 ? 2 : 1));
                        val = data.levels[targetLv] || data.levels[1];
                    } else {
                        let targetLv = 1;
                        if (index === 1) targetLv = (rarity === 'SSR' ? (lb >= 2 ? 2 : 1) : (lb >= 1 ? 2 : 1));
                        else if (index === 3) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 3 ? 2 : 1) : (lb >= 4 ? 2 : 1));
                        else if (index === 4) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 4 ? 2 : 1) : (lb >= 3 ? 2 : 1));
                        else targetLv = (lb >= 2 ? 2 : 1);

                        const bonusLevels = data.levels[rarityKey] || data.levels[rarity] || data.levels;
                        val = bonusLevels[targetLv] || bonusLevels[1];
                    }

                    const format = data.format[state.currentLang] || data.format['ko'];
                    const attrKey = `attr_${card.type.toLowerCase()}`;
                    const translatedType = translations[state.currentLang][attrKey] || card.type;
                    const rawText = format.replaceAll('{val}', val).replaceAll('{type}', translatedType);
                    const highlightedText = highlightNumbers(rawText, card.type);
                    
                    const abEl = document.createElement('div');
                    abEl.className = `ability-item border-${card.type.toLowerCase()}`;
                    const shrinkClass = rawText.length > 35 ? 'shrink' : '';
                    abEl.innerHTML = `<div class="ability-text ${shrinkClass}">${highlightedText}</div>`;
                    mAbilities.appendChild(abEl);
                }
            });
        }
    };

    const updateStars = (lb) => {
        stars.forEach((s, idx) => s.classList.toggle('active', idx < lb));
        updateAbilities(lb);
    };

    updateStars(currentLB);

    stars.forEach((s, idx) => {
        s.onclick = () => {
            const newLB = (idx + 1 === currentLB) ? 0 : idx + 1;
            currentLB = newLB;
            setSupportLB(card.id, currentLB);
            updateStars(currentLB);
            if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            if (typeof window.updateActivityCounts === 'function') window.updateActivityCounts();
            
            // 1. 서포트 카드 그리드 업데이트
            const cardInGrid = document.querySelector(`.support-card[data-id="${card.id}"]`);
            if (cardInGrid) {
                cardInGrid.querySelectorAll('.card-star').forEach((cs, cIdx) => cs.classList.toggle('active', cIdx < currentLB));
            }

            // 2. 계산기 사이드 패널 업데이트 (추가)
            const cardInSidePanel = document.querySelector(`.side-card-item[data-id="${card.id}"]`);
            if (cardInSidePanel) {
                cardInSidePanel.querySelectorAll('.calc-card-star').forEach((cs, cIdx) => cs.classList.toggle('active', cIdx < currentLB));
            }
        };
    });

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '30001';
    history.pushState({ modalOpen: true }, "");
}
window.showCardModal = showCardModal;

// [추가] 즐겨찾기 기반 배경색 업데이트 함수
export function updateGlobalBackgroundColor() {
    const fixedBg = document.getElementById('fixed-bg');
    if (state.favoriteIdol && idolColors[state.favoriteIdol]) {
        let color = idolColors[state.favoriteIdol];
        
        document.body.style.backgroundColor = color + "00"; // 바탕 배경색 투명도를 0%로 (사실상 완전 흰색)
        if (fixedBg) fixedBg.style.opacity = '0.2'; // 문양을 더 은은하게 (0.2)

        if (fixedBg) {
            fixedBg.style.backgroundColor = color; // 마스크 문양 색상 설정
        }
    } else {
        if (fixedBg) {
            fixedBg.style.backgroundColor = "transparent";
        }
        document.body.style.backgroundColor = "#ffffff";
    }
}
