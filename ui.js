// ui.js
import { state, setFilter, setBackground, setSupportLB, setPSSRIndex } from './state.js';
import { updatePageTranslations, applyBackground } from './utils.js';
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { abilityData } from './abilitydata.js';
import { initCalc } from './calc.js';
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

const idolColors = {
    saki: "#E30F25",
    temari: "#0C7BBB",
    kotone: "#F8C112",
    mao: "#7F1184",
    lilja: "#EAFDFF",
    china: "#F68B1F",
    sumika: "#7CFC00",
    hiro: "#00AFCC",
    rinami: "#F6ADC6",
    ume: "#EA533A",
    misuzu: "#7A99CF",
    sena: "#F6AE54",
    tsubame: "#7B68E8"
};

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
        img.src = `icons/idolicons/${name}.png`;
        img.alt = name;
        img.addEventListener('click', (e) => {
            setBackground(name);
            applyBackground(name);

            // Center the clicked icon
            const clickedItem = e.currentTarget.parentElement;
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
        infoBox.style.backgroundColor = personalColor + "26"; 
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
        name.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        
        container.appendChild(item);
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
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderSupport();
        });
    }

    const allMaxBtn = container.querySelector('#btn-all-max-lb');
    if (allMaxBtn) {
        allMaxBtn.addEventListener('click', () => {
            if (!confirm('모든 카드를 4단계 돌파(풀돌) 상태로 변경하시겠습니까?')) return;
            cardList.forEach(card => {
                setSupportLB(card.id, 4);
            });
            renderSupport();
            if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
        });
    }

    const grid = container.querySelector('.support-grid');
    grid.addEventListener('click', (e) => {
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
            const isActive = Array.isArray(state.filters[type]) 
                ? state.filters[type].includes(btn.dataset.val)
                : state.filters[type] === btn.dataset.val;
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
        const sourceMatch = (state.filters.source === 'all') || (cSource === state.filters.source);
        const rarityMatch = (state.filters.rarity === 'all') || (cRarity === state.filters.rarity);

        return planMatch && attrMatch && sourceMatch && rarityMatch;
    });

    const getNumericId = (id) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    filteredList.sort((a, b) => {
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
            cardEl.dataset.id = cardId;
            cardEl.classList.add(`rarity-${card.rarity.toLowerCase()}`);
            
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
