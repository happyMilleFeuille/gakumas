// ui.js
import { state, setFilter, setSupportLB, setPSSRIndex, setFavoriteIdol, idolColors, toggleDisabledCard, saveToSlot, loadFromSlot, getSlotInfo, deleteSlot } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { initCalc } from './calc.js';
import { calcStore } from './calcStore.js';
import { renderPSSRRoadmap, idolList } from './roadmap.js';
import { showCardModal } from './cardModal.js';

const contentArea = document.getElementById('content-area');
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);

// 계산기 화면 복귀 이벤트 리스너
window.addEventListener('renderCalcRequested', () => {
    renderCalc();
});

let homeCachedContent = null;
let lastRenderedLang = null;
window.__videoModalOpen = false;
window.__videoModalPendingClose = false;
window.__videoModalPopHandler = null;

function closeVideoModal(isPopState = false) {
    const videoModal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');

    if (!isPopState && window.__videoModalOpen) {
        window.__videoModalPendingClose = true;
        history.back();
        return;
    }

    if (iframe) iframe.src = '';
    if (videoModal) {
        const resetModal = videoModal.cloneNode(true);
        resetModal.classList.add('hidden');
        resetModal.style.display = 'none';
        const resetIframe = resetModal.querySelector('#video-iframe');
        if (resetIframe) resetIframe.src = '';
        videoModal.replaceWith(resetModal);
    }
    document.body.classList.remove('video-modal-open');
    window.__videoModalOpen = false;
    window.__videoModalPendingClose = false;
    if (window.__videoModalPopHandler) {
        window.removeEventListener('popstate', window.__videoModalPopHandler);
        window.__videoModalPopHandler = null;
    }
}

window.closeVideoModal = closeVideoModal;
window.hideVideoModal = closeVideoModal;

export function renderHome() {
    if (!contentArea) return;

    const isFirstVisit = !homeCachedContent;

    // 언어가 바뀌었거나 캐시가 없으면 새로 렌더링
    if (!homeCachedContent || lastRenderedLang !== state.currentLang) {
        const tpl = document.getElementById('tpl-home');
        contentArea.innerHTML = '';
        contentArea.appendChild(tpl.content.cloneNode(true));
        updatePageTranslations(contentArea);

        // 로드맵 렌더링 (자동 스크롤 제거)
        renderPSSRRoadmap(false);

        homeCachedContent = contentArea.innerHTML;
        lastRenderedLang = state.currentLang;
        return;
    }

    // 캐시가 있어도 로드맵 영역은 비우고 다시 그려서 새로운 높이/JS 반영
    contentArea.innerHTML = homeCachedContent;
    const listContainer = document.getElementById('pssr-roadmap-list');
    if (listContainer) listContainer.innerHTML = '';
    renderPSSRRoadmap(false);
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
        favBtn.style.setProperty('--fav-color', idolColors[name] || '#fbc02d');

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

    // [수정] 즐겨찾기 아이돌이 있다면 애니메이션 없이 즉시 선택 상태로 렌더링
    if (state.favoriteIdol) {
        const favIcon = contentArea.querySelector(`.idol-icon[alt="${state.favoriteIdol}"]`);
        if (favIcon) {
            // 1. 선택 스타일 즉시 적용
            favIcon.classList.add('selected');
            const color = (idolColors[state.favoriteIdol] || "#ff4d8d");
            favIcon.style.borderColor = color;
            favIcon.style.boxShadow = `0 0 15px ${color}66`;

            // 2. 스크롤 위치 즉시 이동 (Smooth 없이)
            const clickedItem = favIcon.parentElement.parentElement;
            const gridContainer = clickedItem.parentElement;
            if (gridContainer) {
                const scrollPos = clickedItem.offsetLeft - (gridContainer.offsetWidth / 2) + (clickedItem.offsetWidth / 2);
                gridContainer.scrollTo({ left: scrollPos, behavior: 'auto' });
            }

            // 3. 하단 PSSR 리스트 즉시 렌더링
            renderProduceCards(state.favoriteIdol, pssrGrid);
        }
    }
}

function renderProduceCards(idolName, container) {
    container.innerHTML = '';
    const itemTpl = document.getElementById('tpl-pssr-item');
    if (!itemTpl) return;

    const produceCards = produceList.filter(p => {
        const nameMatch = p.id.startsWith(`ssr${idolName}_`) ||
            p.id.startsWith(`sr${idolName}_`) ||
            p.id.startsWith(`r${idolName}_`);

        return nameMatch &&
            (p.rarity === 'PSSR' || p.rarity === 'PSR' || p.rarity === 'PR') &&
            p.another !== true;
    });

    produceCards.sort((a, b) => {
        const rarityOrder = { 'PSSR': 3, 'PSR': 2, 'PR': 1 };
        const rA = rarityOrder[a.rarity] || 0;
        const rB = rarityOrder[b.rarity] || 0;

        if (rA !== rB) {
            return rB - rA; // 등급 높은 순
        }

        const dateA = a.releasedAt || "";
        const dateB = b.releasedAt || "";
        return dateB.localeCompare(dateA); // 같은 등급이면 최신순
    });

    if (produceCards.length === 0) {
        container.innerHTML = `<p style="color:#999; padding:2rem; width:100%; text-align:center;">${t('ui_no_cards_found_for', { idolName }, `No cards found for ${idolName}.`)}</p>`;
        return;
    }

    produceCards.forEach((card, index) => {
        const item = itemTpl.content.cloneNode(true);
        const cardEl = item.querySelector('.pssr-card');
        const img = item.querySelector('.pssr-img');
        const imgWrapper = item.querySelector('.pssr-img-wrapper');
        const infoBox = item.querySelector('.pssr-info');
        const name = item.querySelector('.pssr-name');
        const personalColor = idolColors[idolName] || "#ffffff";

        const mixedBg = `linear-gradient(${personalColor}26, ${personalColor}26)`; 
        cardEl.style.backgroundColor = "#ffffff";
        cardEl.style.backgroundImage = mixedBg;

        infoBox.style.backgroundColor = "transparent"; 
        infoBox.style.backgroundImage = "none";

        name.style.color = '#333';
        imgWrapper.style.backgroundColor = personalColor + "11";

        const planIcon = item.querySelector('.pssr-plan-icon');
        if (card.plan) {
            planIcon.src = `icons/${card.plan}.webp`;
        } else {
            planIcon.style.display = 'none';
        }

        if (card.osusume) {
            const osusumeIcon = document.createElement('img');
            osusumeIcon.className = 'pssr-osusume-icon';
            osusumeIcon.src = `icons/${card.osusume}.webp`;
            planIcon.parentElement.insertBefore(osusumeIcon, planIcon);
        }

        const rarityIcon = item.querySelector('.pssr-rarity-icon');

        const imageList = [
            `idols/${card.id}1.webp`,
            `idols/${card.id}2.webp`
        ];

        const anothers = produceList.filter(p => p.another === true && p.id.startsWith(card.id));
        anothers.forEach(a => {
            imageList.push(`idols/${a.id}1.webp`);
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

        const rarityKey = card.rarity.toLowerCase().replace('p', '');
        rarityIcon.src = `icons/${rarityKey}.png`;

        const sourceBadge = item.querySelector('.pssr-source-badge');
        if (sourceBadge) {
            const sourceMap = {
                'limited': t('filter_limited'),
                'limited_f': t('filter_limited_f'),
                'limited_u': t('filter_limited_u'),
                'normal': t('filter_normal'),
                'dist': t('filter_dist')
            };
            const cSource = card.source || 'normal';
            if (sourceMap[cSource]) {
                sourceBadge.textContent = sourceMap[cSource];
                sourceBadge.style.display = 'inline-block';
            } else {
                sourceBadge.style.display = 'none';
            }
        }

        const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        name.textContent = displayName;

        if (state.currentLang === 'ja') {
            name.style.wordBreak = 'normal';
            name.style.overflowWrap = 'anywhere';
        } else {
            name.style.wordBreak = 'keep-all';
            name.style.overflowWrap = 'normal';
        }

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
                    let embedUrl = finalUrl;
                    if (finalUrl.includes('watch?v=')) {
                        const videoId = finalUrl.split('watch?v=')[1].split('&')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    } else if (finalUrl.includes('youtu.be/')) {
                        const videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    }
                    iframe.src = embedUrl;

                    const modalContent = videoModal.querySelector('.video-modal-content');
                    const innerContainer = videoModal.querySelector('.video-container');
                    const color = idolColors[idolName] || '#ff4d8d';
                    if (modalContent) modalContent.style.borderColor = color;
                    if (innerContainer) innerContainer.style.borderColor = color;

                    videoModal.classList.remove('hidden');
                    videoModal.style.display = 'flex';
                    document.body.classList.add('video-modal-open');
                    window.__videoModalOpen = true;
                    window.__videoModalPendingClose = false;
                    if (window.__videoModalPopHandler) {
                        window.removeEventListener('popstate', window.__videoModalPopHandler);
                    }
                    window.__videoModalPopHandler = () => {
                        closeVideoModal(true);
                    };
                    window.addEventListener('popstate', window.__videoModalPopHandler);
                    videoModal.onclick = (ev) => {
                        if (ev.target === videoModal) closeVideoModal();
                    };
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
                <div class="slot-modal-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9f9f9; border-radius: 10px; border: 1px solid #eee; margin-bottom: 10px;">
                    <div class="slot-modal-info" style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="slot-modal-name" style="font-weight: bold; font-size: 1rem; color: #333;">Slot ${i}</span>
                            <button class="slot-btn save" data-slot="${i}" style="width: 38px; flex: none; padding: 3px 0; font-size: 0.65rem; background: #e3f2fd; color: #1976d2; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; white-space: nowrap; text-align: center;">${t('ui_slot_save')}</button>
                        </div>
                        <span class="slot-modal-date" style="font-size: 0.75rem; color: #888;">${info || t('ui_slot_empty')}</span>
                    </div>
                    <div class="slot-modal-actions" style="display: flex; align-items: center; gap: 8px;">
                        <button class="slot-btn load" data-slot="${i}" ${!info ? 'disabled' : ''} style="width: 65px; flex: none; padding: 6px 0; font-size: 0.85rem; background: #f1f8e9; color: #689f38; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; text-align: center;">${t('ui_slot_load')}</button>
                        <button class="slot-btn delete" data-slot="${i}" ${!info ? 'style="display:none;"' : ''} style="background: #ffebee; color: #ef5350; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer;">&times;</button>
                    </div>
                </div>`;
        }
        return slotsHtml;
    };

    const isMobile = window.innerWidth <= 768;

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 350px; padding: ${isMobile ? '15px' : '20px'};">
            <span class="close-modal" style="${isMobile ? 'top: 5px; right: 15px;' : ''}">&times;</span>
            <h3 style="margin-top:0; color:#ff4d8d; font-size:${isMobile ? '0.95rem' : '1.1rem'};">${t('ui_slot_title')}</h3>
            <div class="slot-modal-list">
                ${renderSlots()}
            </div>
        </div>`;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    history.pushState({ modalOpen: 'slot' }, "");

    modal.querySelector('.close-modal').onclick = () => history.back();
    modal.onclick = (e) => { if (e.target === modal) history.back(); };

    modal.addEventListener('click', (e) => {
        const saveBtn = e.target.closest('.save');
        const loadBtn = e.target.closest('.load');
        const deleteBtn = e.target.closest('.delete');

        if (saveBtn) {
            const slotId = saveBtn.dataset.slot;
            if (confirm(t('ui_slot_save_confirm', { slotId }))) {
                saveToSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            }
        }

        if (loadBtn) {
            const slotId = loadBtn.dataset.slot;
            if (loadFromSlot(slotId)) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].map(id =>
                            (id && state.disabledCards[id]) ? null : id
                        );
                    }
                });
                calcStore.save();
                renderSupport();
                modal.remove();
            }
        }

        if (deleteBtn) {
            const slotId = deleteBtn.dataset.slot;
            if (confirm(t('ui_slot_delete_confirm', { slotId }))) {
                deleteSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            }
        }
    });
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
        sortSelect.innerHTML = `
            <option value="id-desc">${t('ui_sort_latest')}</option>
            <option value="id-asc">${t('ui_sort_oldest')}</option>
            <option value="lb-desc">${t('ui_sort_lb')}</option>
        `;
        sortSelect.value = state.sortBy;
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderSupport();
        });
    }

    const allMaxBtn = container.querySelector('#btn-all-max-lb');
    if (allMaxBtn) {
        allMaxBtn.textContent = t('ui_bulk_adjust');
        allMaxBtn.addEventListener('click', () => {
            const confirmMsg = t('ui_bulk_adjust_confirm');
            const confirmLabel = t('ui_bulk_adjust_confirm_label');

            showCustomConfirm(confirmMsg, () => {
                cardList.forEach(card => {
                    setSupportLB(card.id, 4);
                });
                renderSupport();
                if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            }, () => {
                cardList.forEach(card => {
                    setSupportLB(card.id, 0);
                });
                state.disabledCards = {};
                localStorage.setItem('disabledCards', JSON.stringify(state.disabledCards));
                renderSupport();
                if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            }, confirmLabel);
        });
    }

    const openSlotBtn = container.querySelector('#btn-open-slot-modal');
    if (openSlotBtn) {
        openSlotBtn.addEventListener('click', () => {
            openSlotModal();
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
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].map(id => id === cardId ? null : id);
                    }
                });
                calcStore.save();
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
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].map(id => id === cardId ? null : id);
                    }
                });
                calcStore.save();
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
                isActive = (state.filters[type].length === 0);
            } else {
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

    filteredList.sort((a, b) => {
        const aDisabled = !!state.disabledCards[a.id];
        const bDisabled = !!state.disabledCards[b.id];
        if (aDisabled !== bDisabled) return aDisabled ? 1 : -1;

        const dateA = a.releasedAt || "";
        const dateB = b.releasedAt || "";
        if (state.sortBy === 'id-desc') {
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;
            if (rA !== rB) return rB - rA;
            return getNumericId(b.id) - getNumericId(a.id) || b.id.localeCompare(a.id);
        } else if (state.sortBy === 'id-asc') {
            if (dateA !== dateB) return dateA.localeCompare(dateB);
            const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;
            if (rA !== rB) return rB - rA;
            return getNumericId(a.id) - getNumericId(b.id) || a.id.localeCompare(b.id);
        } else if (state.sortBy === 'lb-desc') {
            const lbA = state.supportLB[a.id] || 0;
            const lbB = state.supportLB[b.id] || 0;
            if (lbA !== lbB) return lbB - lbA;
            const dateA = a.releasedAt || "";
            const dateB = b.releasedAt || "";
            if (dateA !== dateB) return dateB.localeCompare(dateA);
            const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;
            if (rA !== rB) return rB - rA;
            return getNumericId(b.id) - getNumericId(a.id);
        }
        return 0;
    });

    grid.innerHTML = '';
    if (filteredList.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%; grid-column:1/-1; padding:2rem;">${t('ui_no_cards_found', {}, 'No cards found.')}</p>`;
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

export function updateGlobalBackgroundColor() {
    const fixedBg = document.getElementById('fixed-bg');
    if (state.favoriteIdol && idolColors[state.favoriteIdol]) {
        let color = idolColors[state.favoriteIdol];
        document.documentElement.style.setProperty('--idol-theme-color', color);
        document.body.style.backgroundColor = color + "00";
        if (fixedBg) fixedBg.style.opacity = '0.2';
        if (fixedBg) {
            fixedBg.style.backgroundColor = color;
        }
    } else {
        document.documentElement.style.setProperty('--idol-theme-color', '#ff4081');
        if (fixedBg) {
            fixedBg.style.backgroundColor = "#adb5bd";
            fixedBg.style.opacity = '0.2';
        }
        document.body.style.backgroundColor = "#ffffff";
    }
}

function showCustomConfirm(message, onConfirmCallback, onResetCallback, confirmLabel) {
    let modal = document.getElementById('custom-confirm-modal');
    if (modal) modal.remove();

    const isMobile = window.innerWidth <= 768;

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'custom-confirm-modal';
    modal.style.zIndex = '40000';

    const pSize = isMobile ? '0.8rem' : '0.95rem';
    const pad = isMobile ? '20px 15px' : '25px 20px';
    const btnSize = '0.75rem';
    const modalWidth = isMobile ? '320px' : '400px';

    const resetBtnHtml = onResetCallback ? `<button class="calc-btn reset-btn" style="background:#2196F3; min-width:80px; font-size:${btnSize}; height:27px; padding:0;">${t('gacha_reset')}</button>` : '';
    const finalConfirmLabel = confirmLabel || t('ui_confirm');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: ${modalWidth}; text-align: center; padding: ${pad};">
            <p style="margin-bottom: 20px; font-size: ${pSize}; color: #333; line-height: 1.5; font-weight: bold; word-break: keep-all;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                ${resetBtnHtml}
                <button class="calc-btn cancel-btn" style="background:#eee; color:#666 !important; min-width:80px; font-size:${btnSize}; height:27px; padding:0;">${t('ui_cancel')}</button>
                <button class="calc-btn confirm-btn" style="min-width:80px; font-size:${btnSize}; height:27px; padding:0;">${finalConfirmLabel}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'customConfirm' }, "");
    modal.style.display = 'flex';

    modal.querySelector('.cancel-btn').addEventListener('click', () => history.back());
    if (onResetCallback) {
        modal.querySelector('.reset-btn').addEventListener('click', () => {
            history.back();
            onResetCallback();
        });
    }
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        history.back();
        onConfirmCallback();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) history.back();
    });
}
