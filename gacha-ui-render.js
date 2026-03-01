// gacha-ui-render.js - 가챠 UI 렌더링 로직
import { state, setSelectedPickup, idolColors } from './state.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
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

    // 1. 드로어 방식 (셀렉션, 통상, 한정, 유닛, 페스)
    if (type === 'selection' || type === 'normal' || type === 'limited' || type === 'unit' || type === 'fes') {
        ui.pickupSelector.classList.remove('hidden');
        const { currentCfg, favColor, displayName, bannerImg, bgImg } = getDrawerTypeDisplayData(type, checkHasCard);
        
        // 셀렉션이거나 유닛/페스 더블 픽업일 때만 가로 스타일 적용
        const isSelection = type === 'selection';
        const isMulti = ( (type === 'unit' || type === 'fes') && currentCfg.pool?.pssr?.length >= 2);
        const itemClass = (isSelection || isMulti) ? 'selection-item' : 'normal-selection-item';

        ui.pickupSelector.innerHTML = `
            <div class="selector-bg-container">
                <div class="selector-bg-item single-bg" style="background-image: url('${bgImg}'); background-position: top; ${isMulti ? 'width: 500px; aspect-ratio: 16/9;' : ''}"></div>
            </div>
            <div class="pickup-wrapper ${ (isSelection || isMulti) ? 'selection-wrapper' : ''}">
                <div class="pickup-item ${itemClass}" style="box-shadow: 0 0 20px 5px ${favColor}99;">
                    <div class="pickup-img-wrapper" style="border: 1px solid ${favColor}; display: flex;">
                        ${ isMulti ? 
                            currentCfg.pool.pssr.map(p => {
                                const pid = typeof p === 'string' ? p : p.id;
                                const imgVer = checkHasCard(pid) ? '2' : '1';
                                return `<div style="flex: 1; background-image: url('idols/${pid}${imgVer}.webp'); background-size: cover; background-position: top;"></div>`;
                            }).join('')
                            : `<div class="selection-banner-img" style="background-image: url('${bannerImg}'); width: 100%; height: 100%; background-size: cover; background-position: top;"></div>`
                        }
                    </div>
                </div>
                <div class="pickup-name">${displayName}</div>
            </div>
        `;
        const banner = ui.pickupSelector.querySelector('.pickup-item');
        if (banner) bindSafeClick(banner, openDrawer);
        return;
    }

    // 2. 기타 방식 (필요 시)
    ui.pickupSelector.classList.add('hidden');
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
    } else if (type === 'unit') {
        currentCfg = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = (state.currentLang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || currentCfg.name);
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
    } else if (type === 'fes') {
        currentCfg = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
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
