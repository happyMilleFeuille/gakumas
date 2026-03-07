// gacha-drawer.js - 가챠 선택 서랍 로직 (스크롤 정밀 보정)
import { state, setSelectedPickup, setActiveSelectionId, setActiveNormalId, setActiveLimitedId, setActiveUnitId, setActiveFesId, idolColors } from './state.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { renderGacha } from './gacha.js';

let drawerEl, overlayEl, contentEl, closeBtn;
let scrollTimer = null;
let isScrollingToItem = false; // 최상위로 이동하여 어디서든 접근 가능하게 함
let isRestoringScroll = false; // 복원 중인지 체크하는 플래그 추가
let isInitialized = false; // 초기화 여부 플래그 추가
const lastScrollPositions = {}; // 가챠 종류별 마지막 스크롤 위치 저장

/**
 * 드로어 초기화
 */
export function initGachaDrawer() {
    if (isInitialized) return; // 이미 초기화되었다면 중단
    drawerEl = document.getElementById('gacha-drawer');
    overlayEl = document.getElementById('drawer-overlay');
    contentEl = document.getElementById('drawer-content');
    closeBtn = document.getElementById('btn-close-drawer');

    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (overlayEl) overlayEl.onclick = closeDrawer;

    if (contentEl) {
        contentEl.onscroll = handleDrawerScroll;

        // 평범한 마우스 드래그 구현
        let isDown = false;
        let startX, scrollLeft;

        contentEl.addEventListener('mousedown', (e) => {
            // 수동 조작 시작 시 모든 자동 정렬/복원 잠금 즉시 해제
            isScrollingToItem = false;
            isRestoringScroll = false;
            if (scrollTimer) {
                clearTimeout(scrollTimer);
                scrollTimer = null;
            }

            isDown = true;
            contentEl.classList.add('grabbing');
            contentEl.style.scrollSnapType = 'none'; 
            contentEl.style.scrollBehavior = 'auto';
            startX = e.pageX - contentEl.offsetLeft;
            scrollLeft = contentEl.scrollLeft;
            // 클릭 판정을 위한 초기 좌표 저장
            contentEl.dataset.downX = e.pageX;
            contentEl.dataset.downY = e.pageY;
        });

        const endDrag = (e) => {
            if (!isDown) return;
            isDown = false;
            contentEl.classList.remove('grabbing');
            contentEl.style.scrollSnapType = 'x mandatory'; 
            contentEl.style.scrollBehavior = 'smooth'; 

            // 클릭 판정: 누른 곳과 뗀 곳의 차이가 적으면 클릭으로 처리
            const diffX = Math.abs(e.pageX - parseInt(contentEl.dataset.downX));
            const diffY = Math.abs(e.pageY - parseInt(contentEl.dataset.downY));
            
            if (diffX < 10 && diffY < 10) {
                const item = e.target.closest('.drawer-item');
                if (item) handleItemClick(item.dataset.id, item);
            }
            // 드래그 종료 시에는 CSS Snap이 자동으로 정렬하므로 별도 로직 불필요
            // handleDrawerScroll에서 정렬 완료 시점에 자연스럽게 업데이트함
        };

        contentEl.addEventListener('mouseleave', (e) => { isDown = false; contentEl.classList.remove('grabbing'); });
        contentEl.addEventListener('mouseup', endDrag);

        contentEl.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - contentEl.offsetLeft;
            const walk = (x - startX) * 1.8; // 감도 최적화 (2.5 -> 1.8)
            contentEl.scrollLeft = scrollLeft - walk;
        });

        isInitialized = true;
    }
}

            /**
            * 드로어 열기
            */
            export function openDrawer() {
            if (!drawerEl || !overlayEl || !contentEl) return;

            isRestoringScroll = true;
            // 임시로 CSS 자석 효과와 부드러운 스크롤 끄기 (충돌 방지)
            contentEl.style.scrollSnapType = 'none';
            contentEl.style.scrollBehavior = 'auto';

            renderDrawerContent();
            drawerEl.classList.add('active');
            overlayEl.classList.add('active');

            const type = state.gachaType;

            // 다음 프레임에서 위치 복원 (렌더링 완료 보장)
            requestAnimationFrame(() => {
            if (lastScrollPositions[type] !== undefined) {
                contentEl.scrollLeft = lastScrollPositions[type];
            } else {
                scrollToActiveItem(true);
            }

            // 위치 이동 후 약간의 지연을 두어 스냅 다시 켜기
            setTimeout(() => {
                contentEl.style.scrollSnapType = 'x mandatory';
                isRestoringScroll = false;
                handleDrawerScroll();
            }, 30);
            });
            }

/**
 * 드로어 닫기
 */
export function closeDrawer() {
    if (!drawerEl || !overlayEl || !contentEl) return;
    
    // 닫기 전 현재 렌더링된 타입의 위치를 저장
    const type = contentEl.dataset.currentType;
    if (type) {
        lastScrollPositions[type] = contentEl.scrollLeft;
    }
    
    drawerEl.classList.remove('active');
    overlayEl.classList.remove('active');
}

function renderDrawerContent() {
    if (!contentEl || !drawerEl) return;
    
    // 내용 초기화 전 현재 타입 기록 (스크롤 이벤트 혼선 방지)
    const type = state.gachaType;
    contentEl.dataset.currentType = type;
    contentEl.innerHTML = '';

    // 가로선은 서랍 배경(drawerEl)에 고정 배치 (중복 추가 방지)
    let line = drawerEl.querySelector('.drawer-indicator-line');
    if (!line) {
        line = document.createElement('div');
        line.className = 'drawer-indicator-line';
        drawerEl.appendChild(line);
    }

    const indicatorLayer = document.createElement('div');
    indicatorLayer.className = 'drawer-indicator-layer';
    contentEl.appendChild(indicatorLayer);

    const itemsLayer = document.createElement('div');
    itemsLayer.className = 'drawer-items-layer';
    contentEl.appendChild(itemsLayer);

    if (type === 'selection') renderSelectionList(itemsLayer, indicatorLayer);
    else if (type === 'normal') renderNormalList(itemsLayer, indicatorLayer);
    else if (type === 'limited') renderLimitedList(itemsLayer, indicatorLayer);
    else if (type === 'unit') renderUnitList(itemsLayer, indicatorLayer);
    else if (type === 'fes') renderFesList(itemsLayer, indicatorLayer);
    else renderPickupList(itemsLayer, indicatorLayer);

    // 마지막 항목을 중앙으로 보내기 위한 빈 공간(Spacer) 추가
    const spacer = document.createElement('div');
    spacer.style.minWidth = '50vw';
    spacer.style.height = '1px';
    itemsLayer.appendChild(spacer);

    const indSpacer = document.createElement('div');
    indSpacer.style.minWidth = '50vw';
    indicatorLayer.appendChild(indSpacer);
}

/**
 * 스크롤 감지: 중앙 아이템 확대 및 마름모 활성화
 */
function handleDrawerScroll() {
    if (!contentEl || isRestoringScroll) return;
    
    const type = contentEl.dataset.currentType;
    if (!type) return;

    // 자동 정렬(isScrollingToItem) 중이 아닐 때만 현재 위치를 저장소에 기록
    if (!isScrollingToItem && drawerEl.classList.contains('active')) {
        lastScrollPositions[type] = contentEl.scrollLeft;
    }

    const items = contentEl.querySelectorAll('.drawer-item');
    const diamonds = contentEl.querySelectorAll('.drawer-diamond-wrapper');
    const scrollCenter = contentEl.scrollLeft + (contentEl.clientWidth / 2);
    
    let closestIdx = -1;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
        const itemRect = item.getBoundingClientRect();
        const containerRect = contentEl.getBoundingClientRect();
        const itemCenterX = (itemRect.left - containerRect.left) + contentEl.scrollLeft + (item.clientWidth / 2);
        
        const distance = Math.abs(scrollCenter - itemCenterX);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestIdx = idx;
        }
        
        item.classList.remove('active-item');
        if (diamonds[idx]) diamonds[idx].classList.remove('active-diamond');
    });

    if (closestIdx !== -1) {
        items[closestIdx].classList.add('active-item');
        if (diamonds[closestIdx]) diamonds[closestIdx].classList.add('active-diamond');

        // 자동 정렬 중이 아닐 때만 데이터 선택 상태를 업데이트 (디바운싱 적용)
        if (!isScrollingToItem) {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                updateSelection(items[closestIdx].dataset.id);
            }, 200);
        }
    }
}

function handleItemClick(id, el) {
    if (!el || !contentEl) return;
    const containerWidth = contentEl.clientWidth;
    const itemRect = el.getBoundingClientRect();
    const containerRect = contentEl.getBoundingClientRect();
    
    const itemRelativeLeft = itemRect.left - containerRect.left + contentEl.scrollLeft;
    const targetX = itemRelativeLeft - (containerWidth / 2) + (el.clientWidth / 2);
    
    isScrollingToItem = true;
    contentEl.scrollTo({ left: targetX, behavior: 'smooth' });
    
    // 이전 타이머가 있다면 제거하고 새로 설정
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { 
        // 중간에 다른 조작이 없었을 때만 해제 및 업데이트
        if (isScrollingToItem) {
            isScrollingToItem = false; 
            updateSelection(id);
        }
    }, 500);
}

function updateSelection(id) {
    if (!id) return;
    const type = state.gachaType;
    let changed = false;

    if (type === 'selection') {
        if (state.activeSelectionId !== id) { setActiveSelectionId(id); changed = true; }
    } else if (type === 'normal') {
        if (state.activeNormalId !== id) { setActiveNormalId(id); changed = true; }
    } else if (type === 'limited') {
        if (state.activeLimitedId !== id) { setActiveLimitedId(id); changed = true; }
    } else if (type === 'unit') {
        if (state.activeUnitId !== id) { setActiveUnitId(id); changed = true; }
    } else if (type === 'fes') {
        if (state.activeFesId !== id) { setActiveFesId(id); changed = true; }
    } else {
        if (state.selectedPickup[type] !== id) { setSelectedPickup(type, id); changed = true; }
    }

    if (changed) {
        renderGacha(true);
    }
}

function scrollToActiveItem(instant = false) {
    const type = state.gachaType;
    const activeId = (type === 'selection') ? state.activeSelectionId : 
                     (type === 'normal') ? state.activeNormalId : 
                     (type === 'limited') ? state.activeLimitedId :
                     (type === 'unit') ? state.activeUnitId :
                     (type === 'fes') ? state.activeFesId : state.selectedPickup[type];
    
    const activeItem = contentEl.querySelector(`.drawer-item[data-id="${activeId}"]`);
    if (activeItem) {
        const containerWidth = contentEl.clientWidth;
        const itemAbsoluteLeft = activeItem.parentElement.offsetLeft + activeItem.offsetLeft;
        const targetX = itemAbsoluteLeft - (containerWidth / 2) + (activeItem.clientWidth / 2);
        
        contentEl.scrollTo({ left: targetX, behavior: instant ? 'auto' : 'smooth' });
        if (instant) handleDrawerScroll();
    }
}

// --- 렌더링 함수들 ---

function renderPickupList(itemsLayer, indicatorLayer) {
    const pickups = CURRENT_PICKUPS[state.gachaType];
    if (!pickups?.pssr) return;
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);

    pickups.pssr.forEach(p => {
        const pid = typeof p === 'string' ? p : p.id;
        const cardData = produceList.find(c => c.id === pid);
        const color = idolColors[pid ? pid.replace('ssr', '').split('_')[0] : ''] || "#ff4081";
        const item = document.createElement('div');
        item.className = 'drawer-item';
        item.dataset.id = pid;
        const imgVer = checkHasCard(pid) ? '2' : '1';
        item.innerHTML = `<div class="drawer-card-img" style="background-image: url('idols/${pid}${imgVer}.webp'); border: 1px solid ${color};"></div>
            <div class="drawer-item-name">${(state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || pid)}</div>`;
        item.onclick = () => handleItemClick(pid, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = 'drawer-diamond-wrapper';
        dw.innerHTML = `
            <div class="drawer-item-date">${pickups.date || ''}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}

function renderNormalList(itemsLayer, indicatorLayer) {
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);
    const isJa = state.currentLang === 'ja';
    NORMAL_CONFIG.forEach(cfg => {
        const firstPSSR = cfg.pool?.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const color = idolColors[pid ? pid.replace('ssr', '').split('_')[0] : ''] || "#ff4081";
        const item = document.createElement('div');
        item.className = 'drawer-item';
        item.dataset.id = cfg.id;
        const imgVer = checkHasCard(pid) ? '2' : '1';
        const displayName = (isJa && cfg.name_ja) ? cfg.name_ja : (cfg.name || '');
        item.innerHTML = `<div class="drawer-card-img" style="background-image: url('${pid ? `idols/${pid}${imgVer}.webp` : cfg.bannerImg}'); border: 1px solid ${color};"></div>
            <div class="drawer-item-name">${displayName}</div>`;
        item.onclick = () => handleItemClick(cfg.id, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = 'drawer-diamond-wrapper';
        const displayDate = (cfg?.display_date || cfg?.date || '');
        dw.innerHTML = `
            <div class="drawer-item-date">${displayDate}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}

function renderLimitedList(itemsLayer, indicatorLayer) {
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);
    const isJa = state.currentLang === 'ja';
    LIMITED_CONFIG.forEach(cfg => {
        const firstPSSR = cfg.pool?.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const color = idolColors[pid ? pid.replace('ssr', '').split('_')[0] : ''] || "#ff4081";
        const item = document.createElement('div');
        item.className = 'drawer-item';
        item.dataset.id = cfg.id;
        const imgVer = checkHasCard(pid) ? '2' : '1';
        const displayName = (isJa && cfg.name_ja) ? cfg.name_ja : (cfg.name || '');
        item.innerHTML = `<div class="drawer-card-img" style="background-image: url('${pid ? `idols/${pid}${imgVer}.webp` : cfg.bannerImg}'); border: 1px solid ${color};"></div>
            <div class="drawer-item-name">${displayName}</div>`;
        item.onclick = () => handleItemClick(cfg.id, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = 'drawer-diamond-wrapper';
        const displayDate = (cfg?.display_date || cfg?.date || '');
        dw.innerHTML = `
            <div class="drawer-item-date">${displayDate}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}

function renderUnitList(itemsLayer, indicatorLayer) {
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);
    const isJa = state.currentLang === 'ja';
    UNIT_CONFIG.forEach(cfg => {
        const pssrCount = cfg.pool?.pssr?.length || 0;
        const isDouble = pssrCount >= 2;
        
        const firstPSSR = cfg.pool?.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const color = idolColors[pid ? pid.replace('ssr', '').split('_')[0] : ''] || "#ff4081";
        
        const item = document.createElement('div');
        item.className = `drawer-item ${isDouble ? 'selection-type' : ''}`;
        item.dataset.id = cfg.id;
        
        // 이미지 생성 로직: 더블 픽업 이상이면 나열, 아니면 단일
        let imgInnerHtml = '';
        if (isDouble) {
            imgInnerHtml = `<div style="display: flex; width: 100%; height: 100%;">
                ${cfg.pool.pssr.map(p => {
                    const pid = typeof p === 'string' ? p : p.id;
                    const imgVer = checkHasCard(pid) ? '2' : '1';
                    return `<div style="flex: 1; background-image: url('idols/${pid}${imgVer}.webp'); background-size: cover; background-position: top;"></div>`;
                }).join('')}
            </div>`;
        } else {
            const imgVer = checkHasCard(pid) ? '2' : '1';
            imgInnerHtml = `<div style="width: 100%; height: 100%; background-image: url('idols/${pid}${imgVer}.webp'); background-size: cover; background-position: top;"></div>`;
        }
        
        const displayName = (isJa && cfg.name_ja) ? cfg.name_ja : (cfg.name || '');
        item.innerHTML = `<div class="drawer-card-img" style="border: 1px solid ${color}; overflow: hidden;">${imgInnerHtml}</div>
            <div class="drawer-item-name">${displayName}</div>`;
        item.onclick = () => handleItemClick(cfg.id, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = `drawer-diamond-wrapper ${isDouble ? 'selection-diamond' : ''}`;
        const displayDate = (cfg?.display_date || cfg?.date || '');
        dw.innerHTML = `
            <div class="drawer-item-date">${displayDate}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}

function renderSelectionList(itemsLayer, indicatorLayer) {
    const isJa = state.currentLang === 'ja';
    SELECTION_CONFIG.forEach(cfg => {
        const item = document.createElement('div');
        item.className = 'drawer-item selection-type';
        item.dataset.id = cfg.id;
        const favColor = idolColors[state.favoriteIdol] || "#ff4081";
        
        const displayName = (isJa && cfg.name_ja) ? cfg.name_ja : (cfg.name || '');
        item.innerHTML = `<div class="drawer-card-img" style="border: 1px solid ${favColor}; overflow: hidden; background-image: url('${cfg.bannerImg}'); background-size: cover; background-position: top;"></div>
            <div class="drawer-item-name">${displayName}</div>`;
        item.onclick = () => handleItemClick(cfg.id, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = 'drawer-diamond-wrapper selection-diamond';
        const displayDate = cfg.display_date || cfg.date || '';
        dw.innerHTML = `
            <div class="drawer-item-date">${displayDate}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}

function renderFesList(itemsLayer, indicatorLayer) {
    const checkHasCard = (id) => (state.gachaLog[state.gachaType] || []).some(item => item.id === id);
    const isJa = state.currentLang === 'ja';
    FES_CONFIG.forEach(cfg => {
        const firstPSSR = cfg.pool?.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const color = idolColors[pid ? pid.replace('ssr', '').split('_')[0] : ''] || "#ff4081";
        const item = document.createElement('div');
        item.className = 'drawer-item';
        item.dataset.id = cfg.id;
        const imgVer = checkHasCard(pid) ? '2' : '1';
        const displayName = (isJa && cfg.name_ja) ? cfg.name_ja : (cfg.name || '');
        item.innerHTML = `<div class="drawer-card-img" style="background-image: url('${pid ? `idols/${pid}${imgVer}.webp` : cfg.bannerImg}'); border: 1px solid ${color};"></div>
            <div class="drawer-item-name">${displayName}</div>`;
        item.onclick = () => handleItemClick(cfg.id, item);
        itemsLayer.appendChild(item);

        const dw = document.createElement('div');
        dw.className = 'drawer-diamond-wrapper';
        const displayDate = (cfg?.display_date || cfg?.date || '');
        dw.innerHTML = `
            <div class="drawer-item-date">${displayDate}</div>
            <div class="drawer-diamond"></div>
        `;
        indicatorLayer.appendChild(dw);
    });
}
