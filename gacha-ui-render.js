// gacha-ui-render.js - 가챠 UI 렌더링 로직
import { state, setSelectedPickup, idolColors } from './state.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { cardList } from './carddata.js'; // 서포트 카드 데이터 추가
import { openDrawer } from './gacha-drawer.js';
import { bindSafeClick } from './gacha-utils.js';

/**
 * 픽업 선택기 영역 렌더링
 */
export function renderPickupSelector(ui) {
    if (!ui.pickupSelector) return;
    const type = state.gachaType;
    const checkHasCard = (id) => (state.gachaLog[type] || []).some(item => item.id === id);

    // 1. 드로어 방식 (셀렉션, 통상, 한정, 유닛, 페스)
    if (type === 'selection' || type === 'normal' || type === 'limited' || type === 'unit' || type === 'fes') {
        ui.pickupSelector.classList.remove('hidden');
        const { currentCfg, favColor, displayName, bannerImg, bgImg } = getDrawerTypeDisplayData(type, checkHasCard);
        
        const gachaDate = currentCfg.display_date || currentCfg.date || ''; // display_date가 있으면 우선 사용
        
        // 셀렉션이거나 유닛/페스 더블 픽업일 때만 가로 스타일 적용
        const isSelection = type === 'selection';
        const isMulti = ( (type === 'unit' || type === 'fes') && currentCfg.pool?.pssr?.length >= 2);
        const itemClass = (isSelection || isMulti) ? 'selection-item' : 'normal-selection-item';

        // 픽업 서포트 카드 데이터 추출
        const sssrPickups = currentCfg.pool?.sssr || [];
        const srPickups = currentCfg.pool?.sr_card || [];

        // 배경 레이어 업데이트
        if (ui.gachaBgLayer) {
            ui.gachaBgLayer.innerHTML = `
                <div class="selector-bg-item ${isMulti ? 'unit-bg' : 'single-bg'}" style="background-image: url('${bgImg}');"></div>
            `;
        }

        ui.pickupSelector.innerHTML = `
            <div class="pickup-wrapper ${ (isSelection || isMulti) ? 'selection-wrapper' : ''}">
                <div class="pickup-item ${itemClass}">
                    <div class="pickup-name">${displayName}</div>
                    <div class="pickup-img-wrapper idol-main-img" style="border: 1px solid ${favColor}; ${isMulti ? 'display: flex; position: relative;' : 'position: relative;'} box-shadow: 0 0 20px 5px ${favColor}99;">
                        ${ isMulti ? 
                            currentCfg.pool.pssr.map((p, idx) => {
                                const pid = typeof p === 'string' ? p : p.id;
                                const imgVer = checkHasCard(pid) ? '2' : '1';
                                const cardData = produceList.find(c => c.id === pid);
                                const isMobile = window.innerWidth <= 768;
                                const planIconSize = isMobile ? '22px' : '30px';
                                const rarityIconSize = isMobile ? '25px' : '45px';
                                const planIcon = (cardData?.plan && !isSelection) ? `<img src="icons/${cardData.plan}.webp" class="pickup-plan-icon" style="position: absolute; top: 8px; left: 8px; width: ${planIconSize}; z-index: 2;">` : '';
                                
                                // 등급 아이콘 매핑 (PSSR -> ssr, SR -> sr 등)
                                const rarityKey = (cardData?.rarity || 'ssr').toLowerCase().replace('p', '');
                                const rarityIcon = cardData?.rarity ? `<img src="icons/${rarityKey}.png" class="pickup-rarity-icon" style="position: absolute; bottom: 6px; right: 6px; width: ${rarityIconSize}; z-index: 5; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">` : '';
                                
                                return `
                                <div style="flex: 1; background-image: url('idols/${pid}${imgVer}.webp'); background-size: cover; background-position: top; position: relative; ${idx < currentCfg.pool.pssr.length - 1 ? `border-right: 1px solid ${favColor}88;` : ''}">
                                    ${planIcon}
                                    ${rarityIcon}
                                </div>`;
                            }).join('')
                            : `
                            <div class="selection-banner-img" style="background-image: url('${bannerImg}'); width: 100%; height: 100%; background-size: cover; background-position: top;"></div>
                            ${ (currentCfg.pool?.pssr?.[0] && !isSelection) ? (() => {
                                const pid = typeof currentCfg.pool.pssr[0] === 'string' ? currentCfg.pool.pssr[0] : currentCfg.pool.pssr[0].id;
                                const cardData = produceList.find(c => c.id === pid);
                                const isMobile = window.innerWidth <= 768;
                                const planIconSize = isMobile ? '25px' : '35px';
                                const rarityIconSize = isMobile ? '30px' : '60px';
                                
                                const planIcon = cardData?.plan ? `<img src="icons/${cardData.plan}.webp" class="pickup-plan-icon" style="position: absolute; top: 8px; left: 8px; width: ${planIconSize}; z-index: 2;">` : '';
                                
                                // 등급 아이콘 매핑
                                const rarityKey = (cardData?.rarity || 'ssr').toLowerCase().replace('p', '');
                                const rarityIcon = cardData?.rarity ? `<img src="icons/${rarityKey}.png" class="pickup-rarity-icon" style="position: absolute; bottom: 8px; right: 8px; width: ${rarityIconSize}; z-index: 5; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));">` : '';
                                
                                return `${planIcon}${rarityIcon}`;
                            })() : '' }
                            `
                        }
                    </div>
                    ${gachaDate ? `<div class="pickup-date ${type === 'unit' ? 'is-unit' : ''}">${gachaDate}</div>` : ''}
                    <div class="pickup-support-column">
                        ${sssrPickups.map(id => `<div class="support-pickup-mini" data-rarity="SSR" style="background-image: url('images/support/${id}.webp');"></div>`).join('')}
                        ${srPickups.map(id => `<div class="support-pickup-mini" data-rarity="SR" style="background-image: url('images/support/${id}.webp');"></div>`).join('')}
                    </div>
                </div>
            </div>
        `;
        const banner = ui.pickupSelector.querySelector('.pickup-item');
        if (banner) bindSafeClick(banner, openDrawer);

        // 서포트 카드 클릭/터치 시 상세 서랍 열림 방지
        const supportColumn = ui.pickupSelector.querySelector('.pickup-support-column');
        if (supportColumn) {
            ['mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach(evt => {
                supportColumn.addEventListener(evt, (e) => e.stopPropagation());
            });
        }

        // 픽업 서포트 카드 툴팁 이벤트 바인딩 (PC 전용)
        setupSupportTooltips(ui.pickupSelector);
        return;
    }

    // 2. 기타 방식 (필요 시)
    ui.pickupSelector.classList.add('hidden');
}

/**
 * 서포트 카드 툴팁 설정
 */
function setupSupportTooltips(container) {
    const isMobile = window.innerWidth <= 768;

    let tooltip = document.getElementById('gacha-card-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'gacha-card-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '9999';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.border = '2px solid #fff';
        tooltip.style.borderRadius = '8px';
        tooltip.style.transition = 'opacity = 0.15s ease';
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.overflow = 'hidden';
        tooltip.style.padding = '0';
        tooltip.style.margin = '0';
        tooltip.style.boxSizing = 'border-box';
        document.body.appendChild(tooltip);
    }
    
    // 내부 구조 고정 (쏠림 방지를 위해 전용 컨테이너 사용)
    tooltip.innerHTML = `
        <div class="tooltip-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; display: block; background: #000;">
            <img src="" class="tooltip-main-img" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block; z-index: 1;">
            <img src="" class="tooltip-attr-icon" style="position: absolute; top: 8px; left: 8px; z-index: 5; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
            <div class="tooltip-card-name" style="position: absolute; bottom: 8px; right: 8px; z-index: 10; color: #fff; font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.8); padding: 2px 0; pointer-events: none; white-space: nowrap;"></div>
            <img src="" class="tooltip-rarity-img" style="position: absolute; bottom: 8px; left: 8px; z-index: 5;">
            <img src="" class="tooltip-plan-icon" style="position: absolute; z-index: 5; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
        </div>
    `;

    const tImg = tooltip.querySelector('.tooltip-main-img');
    const attrIcon = tooltip.querySelector('.tooltip-attr-icon');
    const rarityImg = tooltip.querySelector('.tooltip-rarity-img');
    const planIcon = tooltip.querySelector('.tooltip-plan-icon');
    const nameLabel = tooltip.querySelector('.tooltip-card-name');

    // 이미지 로드 실패 시 툴팁 자동 닫기
    tImg.onerror = () => {
        tooltip.style.opacity = '0';
        setTimeout(() => { tooltip.style.display = 'none'; }, 150);
    };

    const showTooltip = (e, clientX, clientY) => {
        // 드래그 중일 때는 툴팁을 표시하지 않음
        if (window.isGlobalDragging) return;

        const item = e.target.closest('.support-pickup-mini');
        if (!item) return;

        const bgImgPath = item.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        const cardId = bgImgPath.split('/').pop().replace('.webp', '');
        const cardData = cardList.find(c => c.id === cardId);

        if (cardData) {
            attrIcon.src = `icons/${cardData.type}.png`;
            attrIcon.style.display = 'block';
            rarityImg.src = `icons/${cardData.rarity.toLowerCase()}.png`;
            rarityImg.style.display = 'block';
            
            // 카드 이름 설정 (다국어 지원)
            nameLabel.textContent = (state.currentLang === 'ja' && cardData.name_ja) ? cardData.name_ja : cardData.name;
            
            if (cardData.plan && cardData.plan !== 'free') {
                planIcon.src = `icons/${cardData.plan}.webp`;
                planIcon.style.display = 'block';
            } else {
                planIcon.style.display = 'none';
            }
        }

        tImg.style.opacity = '0';
        tImg.src = `images/support/${cardId}.webp`; // 이미지 로드 시도
        tImg.onload = () => tImg.style.opacity = '1';
        tImg.src = bgImgPath;
        
        const rarity = item.dataset.rarity;
        const color = rarity === 'SSR' ? '#d4a5ff' : '#ffe082';
        const shadow = rarity === 'SSR' ? 'rgba(212, 165, 255, 0.4)' : 'rgba(255, 224, 130, 0.3)';

        tooltip.style.borderColor = color;
        tooltip.style.boxShadow = `0 10px 40px ${shadow}`;
        tooltip.style.display = 'block';
        
        moveTooltipInternal(clientX, clientY);
        setTimeout(() => tooltip.style.opacity = '1', 10);
    };

    const moveTooltipInternal = (clientX, clientY) => {
        if (tooltip.style.display !== 'block') return;
        
        // 매번 현재 화면 크기를 체크하여 모바일 여부 판단
        const currentIsMobile = window.innerWidth <= 768;
        const tw = currentIsMobile ? 240 : 400; 
        const th = tw * (9 / 16);
        
        let x, y;
        if (currentIsMobile) {
            x = clientX - (tw / 2); // 손가락 중앙
            y = clientY - th - 40; // 기본적으로 위쪽
            
            // 상단 경계 돌파 시 아래쪽으로 반전
            if (y < 10) {
                y = clientY + 40;
            }
        } else {
            x = clientX + 25;
            y = clientY + 25;
        }

        // 화면 좌우 경계 체크
        if (x + tw > window.innerWidth - 10) x = window.innerWidth - tw - 10;
        if (x < 10) x = 10;
        
        // 화면 하단 경계 체크
        if (y + th > window.innerHeight - 10) y = window.innerHeight - th - 10;
        if (y < 10) y = 10;

        tooltip.style.setProperty('width', tw + 'px', 'important');
        tooltip.style.setProperty('height', th + 'px', 'important');
        tooltip.style.setProperty('min-width', tw + 'px', 'important');
        tooltip.style.setProperty('min-height', th + 'px', 'important');
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        
        // 아이콘 크기/위치 최적화 (모두 좌측 배치)
        if (currentIsMobile) {
            attrIcon.style.width = '25px';
            attrIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'; // 그림자 축소
            
            rarityImg.style.width = '35px';
            
            planIcon.style.width = '20px';
            planIcon.style.bottom = '42px';
            planIcon.style.left = '10px';
            planIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'; // 그림자 축소
            
            // 이름 폰트 및 그림자 축소
            nameLabel.style.fontSize = '0.7rem';
            nameLabel.style.textShadow = '0 1px 3px rgba(0,0,0,1)';
        } else {
            attrIcon.style.width = '45px';
            attrIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
            
            rarityImg.style.width = '65px';
            
            planIcon.style.width = '38px';
            planIcon.style.bottom = '62px';
            planIcon.style.left = '15px';
            planIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
            
            nameLabel.style.fontSize = '1.1rem';
            nameLabel.style.textShadow = '0 1px 3px rgba(0,0,0,1)';
        }
    };

    const hideTooltip = () => {
        tooltip.style.opacity = '0';
        setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 150);
    };

    const globalHide = (e) => { if (!e.target.closest('.support-pickup-mini')) hideTooltip(); };

    const targets = container.querySelectorAll('.support-pickup-mini');
    targets.forEach(target => {
        if (isMobile) {
            target.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                showTooltip(e, e.touches[0].clientX, e.touches[0].clientY);
            });
        } else {
            target.addEventListener('mouseenter', (e) => showTooltip(e, e.clientX, e.clientY));
            target.addEventListener('mousemove', (e) => moveTooltipInternal(e.clientX, e.clientY));
            target.addEventListener('mouseleave', hideTooltip);
        }
    });

    if (isMobile) document.addEventListener('touchstart', globalHide, { passive: true });
}

export function renderResults(ui, currentResults, existingIdsBeforePull = null) {
    if (!ui.resultsContainer) return;
    ui.resultsContainer.innerHTML = '';
    const itemTpl = document.getElementById('tpl-gacha-result-item');
    ui.resultsContainer.classList.toggle('single-result', currentResults.length === 1);

    // existingIdsBeforePull이 전달되면 그대로 사용, 아니면 로그에서 계산
    let prePullExistingIds;
    if (existingIdsBeforePull) {
        prePullExistingIds = existingIdsBeforePull;
    } else {
        const currentLog = state.gachaLog[state.gachaType] || [];
        const priorEntries = currentLog.filter((item, idx) => idx < currentLog.length - currentResults.length);
        prePullExistingIds = new Set(priorEntries.map(item => item.id));
    }

    currentResults.forEach((card, index) => {
        const clone = itemTpl.content.cloneNode(true);
        const cardEl = clone.querySelector('.gacha-result-card');
        cardEl.classList.add('animate', `${card.displayRarity.toLowerCase()}-bg`);
        cardEl.style.animationDelay = `${index * 0.08}s`;
        // 이전 기록에 이 카드 ID가 없었으면 NEW 배지 표시
        if (!prePullExistingIds.has(card.id)) {
            const badge = document.createElement('div'); badge.className = 'new-badge'; badge.textContent = 'NEW'; cardEl.appendChild(badge);
        }


        const img = clone.querySelector('.result-card-img');
        if (card.type === 'produce') {
            img.src = `idols/${card.id}1.webp`; cardEl.classList.add('produce-card');
            
            let s = (card.scale || 1.60) * (window.innerWidth <= 768 ? 0.7 : 1), o = (card.offsetY || 55) * (window.innerWidth <= 768 ? 0.7 : 1);
            img.style.transform = `scale(${s}) translateY(${o}px)`;
            const p = clone.querySelector('.result-card-plan-icon'); if (card.plan && p) { p.src = `icons/${card.plan}.webp`; p.classList.remove('hidden'); }
        } else {
            img.src = card.id.includes('dummy') ? 'icons/idol.png' : `images/support/${card.id}.webp`; cardEl.classList.add('landscape');
        }
        clone.querySelector('.result-card-rarity-img').src = `icons/${card.displayRarity.toLowerCase()}.png`;
        const t = document.createElement('div'); t.className = 'card-type-label'; t.textContent = card.type === 'produce' ? 'IDOL' : 'SUPPORT'; cardEl.appendChild(t);
        clone.querySelector('.result-card-name').textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        ui.resultsContainer.appendChild(clone);
    });
}

function getDrawerTypeDisplayData(type, checkHasCard) {
    let currentCfg, favColor, displayName, bannerImg, bgImg;
    if (type === 'selection') {
        currentCfg = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
        favColor = idolColors[state.favoriteIdol] || "#ff4081";
        displayName = (state.currentLang === 'ja' && currentCfg.name_ja) ? currentCfg.name_ja : currentCfg.name;
        bannerImg = currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp';
        bgImg = bannerImg;
    } else if (type === 'normal') {
        currentCfg = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/${pid}1.webp` : bannerImg;
    } else if (type === 'limited') {
        currentCfg = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/${pid}1.webp` : bannerImg;
    } else if (type === 'unit') {
        currentCfg = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/${pid}1.webp` : bannerImg;
    } else if (type === 'fes') {
        currentCfg = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/${pid}1.webp` : bannerImg;
    }
    return { currentCfg, favColor, displayName, bannerImg, bgImg };
}
