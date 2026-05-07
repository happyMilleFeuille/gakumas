// cardModal.js
import { state, setSupportLB } from './state.js';
import { abilityData } from './abilitydata.js';
import translations from './i18n.js';
import { showSupportItemTooltip } from './calcUI.js';

// 모달 표시 함수
export function showCardModal(card, displayName, imgSrc) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    // 초기 상태 저장 (닫을 때 변화 감지용)
    window._modalCardId = card.id;
    window._modalInitialLB = state.supportLB[card.id] || 0;

    const mImg = document.getElementById('modal-img');
    const mTitle = document.getElementById('modal-title');
    const mRarity = document.getElementById('modal-rarity');
    const mPlan = document.getElementById('modal-plan');
    const mType = document.getElementById('modal-type');
    const mExtraIcon = document.getElementById('modal-extra-icon');
    const mExtra1 = document.getElementById('modal-extra-1');
    const mExtra2 = document.getElementById('modal-extra-2');
    const mAbilities = document.getElementById('modal-abilities');
    const stars = document.querySelectorAll('.star');

    mImg.src = imgSrc;
    mTitle.textContent = displayName;
    mRarity.src = `icons/${card.rarity.toLowerCase()}.png`;
    mPlan.src = `icons/${(card.plan || 'free').toLowerCase()}.webp`;
    mType.src = `icons/${card.type.toLowerCase()}.png`;

    mTitle.classList.remove('title-vocal', 'title-dance', 'title-visual', 'title-assist');
    mTitle.classList.add(`title-${card.type.toLowerCase()}`);
    
    // 미리 확인된 경로가 있으면 즉시 사용, 없으면 추측 경로 사용
    const baseIconPath = `images/support/${card.id}`;
    const isCardType = card.have && card.have.startsWith('card');
    const guessedPath = isCardType ? `${baseIconPath}_card.webp` : `${baseIconPath}_item.webp`;
    
    mExtraIcon.src = card._extraPath || guessedPath;
    
    // 혹시 모를 상황 대비 (프리로드가 안 됐을 경우)
    if (!card._extraPath) {
        mExtraIcon.onerror = () => {
            mExtraIcon.src = isCardType ? `${baseIconPath}_item.webp` : `${baseIconPath}_card.webp`;
            mExtraIcon.onerror = null;
        };
    } else {
        mExtraIcon.onerror = null;
    }

    const attrColors = {
        vocal: "#f766a4",
        dance: "#5aa6f0",
        visual: "#fdc361",
        assist: "#72da49"
    };

    if (card.item_effects) {
        const color = attrColors[card.type.toLowerCase()] || '#ff4d8d';
        mExtraIcon.style.backgroundColor = '#fff';
        mExtraIcon.style.borderColor = color;
        mExtraIcon.style.borderWidth = '1px';
    } else {
        mExtraIcon.style.backgroundColor = '#fff';
        mExtraIcon.style.borderColor = '#e0e0e0';
        mExtraIcon.style.borderWidth = '1px';
    }
    mExtraIcon.style.filter = 'none';

    mExtraIcon.onclick = (e) => {
        if (card.item_effects) {
            e.stopPropagation();
            showSupportItemTooltip(mExtraIcon, card.id);
        }
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
