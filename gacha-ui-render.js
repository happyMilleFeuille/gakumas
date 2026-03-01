// gacha-ui-render.js - 가챠 UI 렌더링 로직
import { state, setSelectedPickup, idolColors } from './state.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { openDrawer } from './gacha-drawer.js';
import { bindSafeClick } from './gacha-utils.js';

/**
 * 픽업 선택기 영역 렌더링
 */
export function renderPickupSelector(ui) {
    if (!ui.pickupSelector) return;
    const type = state.gachaType;
    const checkHasCard = (id) => (state.gachaLog[type] || []).some(item => item.id === id);

    // 1. 드로어 방식 (셀렉션, 통상, 한정)
    if (type === 'selection' || type === 'normal' || type === 'limited') {
        ui.pickupSelector.classList.remove('hidden');
        const { currentCfg, favColor, displayName, bannerImg, bgImg } = getDrawerTypeDisplayData(type, checkHasCard);
        const isSelection = type === 'selection';
        const itemClass = isSelection ? 'selection-item' : 'normal-selection-item';

        ui.pickupSelector.innerHTML = `
            <div class="selector-bg-container">
                <div class="selector-bg-item single-bg" style="background-image: url('${bgImg}'); background-position: top;"></div>
            </div>
            <div class="pickup-wrapper ${isSelection ? 'selection-wrapper' : ''}">
                <div class="pickup-item ${itemClass}" style="box-shadow: 0 0 20px 5px ${favColor}99;">
                    <div class="pickup-img-wrapper" style="border: 1px solid ${favColor};">
                        <div class="selection-banner-img" style="background-image: url('${bannerImg}'); width: 100%; height: 100%; background-size: cover; background-position: top;"></div>
                    </div>
                </div>
                <div class="pickup-name">${displayName}</div>
            </div>
        `;
        const banner = ui.pickupSelector.querySelector('.pickup-item');
        if (banner) bindSafeClick(banner, openDrawer);
        return;
    }

    // 2. 그리드 방식 (유닛, 페스)
    const typesWithPickups = ['unit', 'fes'];
    if (!typesWithPickups.includes(type)) { ui.pickupSelector.classList.add('hidden'); return; }

    const pickups = CURRENT_PICKUPS[type];
    if (!pickups?.pssr?.length) { ui.pickupSelector.classList.add('hidden'); return; }

    ui.pickupSelector.classList.remove('hidden');
    ui.pickupSelector.innerHTML = '<div class="selector-bg-container"></div>'; 
    const bgContainer = ui.pickupSelector.querySelector('.selector-bg-container');
    const isMultiPickup = true; // 유닛, 페스는 항상 멀티

    pickups.pssr.forEach(p => {
        const pid = typeof p === 'string' ? p : p.id;
        const bgItem = document.createElement('div');
        bgItem.className = `selector-bg-item unit-bg`;
        bgItem.style.backgroundImage = `url('idols/${pid}${checkHasCard(pid) ? '2' : '1'}.webp')`;
        bgItem.style.backgroundPosition = 'top';
        bgContainer.appendChild(bgItem);
    });

    pickups.pssr.forEach(p => {
        const pid = typeof p === 'string' ? p : p.id;
        const cardData = produceList.find(c => c.id === pid);
        const displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || pid);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        const color = idolColors[charKey] || "#ff4081";
        const wrapper = document.createElement('div');
        wrapper.className = 'pickup-wrapper';
        const item = document.createElement('div');
        item.className = 'pickup-item selected';
        item.style.boxShadow = `0 0 20px 5px ${color}99`; 
        item.style.border = `1px solid ${color}`;
        
        item.innerHTML = `
            <div class="pickup-img-wrapper">
                <img src="idols/${pid}${checkHasCard(pid) ? '2' : '1'}.webp" class="pickup-img" alt="${pid}" style="object-position: top;">
            </div>
        `;
        const nameEl = document.createElement('div');
        nameEl.className = 'pickup-name';
        nameEl.textContent = displayName;
        bindSafeClick(item, openDrawer);
        wrapper.appendChild(item);
        wrapper.appendChild(nameEl);
        ui.pickupSelector.appendChild(wrapper);
    });
}

export function renderResults(ui, currentResults) {
    if (!ui.resultsContainer) return;
    ui.resultsContainer.innerHTML = '';
    const itemTpl = document.getElementById('tpl-gacha-result-item');
    ui.resultsContainer.classList.toggle('single-result', currentResults.length === 1);
    const currentLog = state.gachaLog[state.gachaType] || [];
    const prePullExistingIds = new Set(currentLog.slice(0, -currentResults.length).map(item => item.id));

    currentResults.forEach((card, index) => {
        const clone = itemTpl.content.cloneNode(true);
        const cardEl = clone.querySelector('.gacha-result-card');
        cardEl.classList.add('animate', `${card.displayRarity.toLowerCase()}-bg`);
        cardEl.style.animationDelay = `${index * 0.08}s`;
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
    let currentCfg, favColor, displayName, bannerImg;
    if (type === 'selection') {
        currentCfg = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
        favColor = idolColors[state.favoriteIdol] || "#ff4081";
        displayName = currentCfg.name;
        bannerImg = currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp';
    } else if (type === 'normal') {
        currentCfg = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
    } else if (type === 'limited') {
        currentCfg = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
    }
    return { currentCfg, favColor, displayName, bannerImg, bgImg: bannerImg };
}
