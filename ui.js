// ui.js
import { state, setFilter, setBackground, setSupportLB, setPSSRIndex } from './state.js';
import { updatePageTranslations, applyBackground } from './utils.js';
import { cardList } from './carddata.js';
import { produceList } from './producedata.js';
import { abilityData } from './abilitydata.js';
import translations from './i18n.js';

const contentArea = document.getElementById('content-area');
// ... 생략 (idolList 및 renderHome, renderCalc, renderIdolList는 동일하게 유지)
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

    // 해당 아이돌의 PSSR 및 PSR (어나더 제외) 필터링
    const produceCards = produceList.filter(p => 
        p.id.includes(idolName) && 
        (p.rarity === 'PSSR' || p.rarity === 'PSR') && 
        p.another !== true
    );

    // 등급순 정렬 (PSSR -> PSR)
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
        
        // 카드 스타일링: 정보창 배경색을 아주 연하게 적용 (15% 투명도)
        const infoBox = item.querySelector('.pssr-info');
        infoBox.style.backgroundColor = personalColor + "26"; 
        name.style.color = '#333'; 
        
        imgWrapper.style.backgroundColor = personalColor + "11"; 

        // 이미지 순환 리스트 구성
        const imageList = [
            `idols/${card.id}1.webp`,
            `idols/${card.id}2.webp`
        ];
        
        // 해당 카드의 어나더 버전들 추가
        const anothers = produceList.filter(p => p.another === true && p.id.startsWith(card.id));
        anothers.forEach(a => {
            imageList.push(`idols/${a.id}1.webp`);
        });

        // 저장된 인덱스 불러오기
        let currentIndex = state.pssrIndex[card.id] || 0;
        if (currentIndex >= imageList.length) currentIndex = 0;
        
        img.src = imageList[currentIndex];

        cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            img.classList.add('slide-out');
            imgWrapper.style.backgroundColor = personalColor; // 전환 중 색상 강조
            
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

        // 존재하지 않는 이미지 자동 건너뛰기
        let retryCount = 0;
        img.onerror = () => {
            if (retryCount < imageList.length) {
                retryCount++;
                currentIndex = (currentIndex + 1) % imageList.length;
                img.src = imageList[currentIndex];
            } else {
                img.onerror = null;
            }
        };
        
        if (card.plan) {
            planIcon.src = `icons/${card.plan}.webp`;
            planIcon.style.display = 'block';
        } else {
            planIcon.style.display = 'none';
        }

        // 등급 아이콘 설정 (PSSR -> ssr.png, PSR -> sr.png)
        const rarityKey = card.rarity.toLowerCase().replace('p', ''); // pssr -> ssr, psr -> sr
        rarityIcon.src = `icons/${rarityKey}.png`;
        name.textContent = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
        
        container.appendChild(item);
    });
}

export function renderSupport() {
    if (!contentArea) return;

    // 1. Initial Shell Setup (Only once)
    let container = contentArea.querySelector('.support-container');
    if (!container) {
        contentArea.innerHTML = '';
        const tpl = document.getElementById('tpl-support');
        contentArea.appendChild(tpl.content.cloneNode(true));
        container = contentArea.querySelector('.support-container');

        // Setup Static Listeners (Filters, Sort, Toggle)
        setupStaticListeners(container);
    }

    // 2. Sync Filter UI State
    syncFilterUI(container);

    // 3. Render/Update the Grid
    updateSupportGrid(container);
}

function setupStaticListeners(container) {
    // Filter Buttons
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

    // Toggle Extra
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

    // Sort Select
    const sortSelect = container.querySelector('#support-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderSupport();
        });
    }

    // Event Delegation for Grid (Stars and Card Click)
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
            
            // Update UI for this card's stars only
            const stars = cardEl.querySelectorAll('.card-star');
            stars.forEach((s, idx) => {
                s.classList.toggle('active', idx < newLB);
            });
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
    
    // 1. Filter Data
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

    // 2. Sort Data
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

    // 3. Batch DOM updates using Fragment
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
            
            const cardStars = item.querySelectorAll('.card-star');
            cardStars.forEach((s, idx) => {
                s.classList.toggle('active', idx < currentLB);
            });
            
            const planIcon = item.querySelector('.card-plan-icon');
            const plan = (card.plan || 'free').toLowerCase();
            planIcon.src = `icons/${plan}.webp`;
            planIcon.alt = plan;

            const typeIcon = item.querySelector('.card-type-icon');
            typeIcon.src = `icons/${card.type.toLowerCase()}.png`;
            typeIcon.alt = card.type;

            fragment.appendChild(item);
        });
        grid.appendChild(fragment);
    }
    updatePageTranslations(container);
}

// 모달 표시 함수
function showCardModal(card, displayName, imgSrc) {
    const modal = document.getElementById('card-modal');
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

    // 등급 및 속성 아이콘 설정
    mRarity.src = `icons/${card.rarity.toLowerCase()}.png`;
    mPlan.src = `icons/${(card.plan || 'free').toLowerCase()}.webp`;
    mType.src = `icons/${card.type.toLowerCase()}.png`;

    // 제목 색상 변경 (기존 속성 클래스 제거 후 추가)
    mTitle.classList.remove('title-vocal', 'title-dance', 'title-visual', 'title-assist');
    mTitle.classList.add(`title-${card.type.toLowerCase()}`);

    // 아이콘 이미지 설정 (_card 시도 후 실패 시 _item 시도)
    const baseIconPath = `images/support/${card.id}`;
    mExtraIcon.src = `${baseIconPath}_card.webp`;
    mExtraIcon.onerror = () => {
        mExtraIcon.src = `${baseIconPath}_item.webp`;
        mExtraIcon.onerror = null; // 무한 루프 방지
    };

            // 수치에 색상을 입히는 헬퍼
            const highlightNumbers = (text, type) => {
                if (!text) return '';
                const colorClass = `highlight-${type.toLowerCase()}`;
                // 숫자, %, . 을 포함한 패턴을 찾아 span으로 감쌈 (+ 제외)
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
        
        // SSR일 때만 extra2 표시, SR 등 그 외에는 숨김
        if (card.rarity === 'SSR') {
            mExtra2.innerHTML = getExtraText(card.extra2);
            mExtra2.classList.remove('hidden');
        } else {
            mExtra2.innerHTML = '';
            mExtra2.classList.add('hidden');
        }
    
        let currentLB = state.supportLB[card.id] || 0; // 저장된 돌파 상태 가져오기
    
        const updateAbilities = (lb) => {
            mAbilities.innerHTML = '';
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((abId, index) => {
                    const data = abilityData[abId];
                    if (data) {
                        // ... 생략 (수치 결정 로직은 동일)
                        const rarity = card.rarity || 'SSR';
                        const isDist = card.source === 'dist';
                        let rarityKey = rarity;
                        
                        if (rarity === 'SSR' && isDist && data.levels['SSR_DIST']) {
                            rarityKey = 'SSR_DIST';
                        }
    
                        let val = 0;
                        if (abId === 'supportrateup' || abId === 'percentparam' || abId === 'fixedparam') {
                            const targetLv = lb + 1;
                            if (data.levels[rarity]) {
                                val = data.levels[rarity][targetLv] || data.levels[rarity][5];
                            }
                            else {
                                val = data.levels[targetLv] || Object.values(data.levels)[0];
                            }
                        } else if (abId === 'event_paraup' || abId === 'event_recoveryup') {
                            let targetLv = 1;
                            if (rarity === 'SSR') {
                                if (lb >= 4) targetLv = 3;
                                else if (lb >= 1) targetLv = 2;
                            } else if (rarity === 'SR') {
                                if (lb >= 4) targetLv = 3;
                                else if (lb >= 2) targetLv = 2;
                            }
                            val = data.levels[targetLv] || data.levels[1];
                        } else {
                            let targetLv = 1;
                            if (index === 1) { 
                                if (rarity === 'SSR') targetLv = (lb >= 2) ? 2 : 1;
                                else if (rarity === 'SR') targetLv = (lb >= 1) ? 2 : 1;
                            } else if (index === 3) {
                                if (rarity === 'SSR' && !isDist) targetLv = (lb >= 3) ? 2 : 1;
                                else if (rarity === 'SR' || isDist) targetLv = (lb >= 4) ? 2 : 1;
                            } else if (index === 4) {
                                if (rarity === 'SSR' && !isDist) targetLv = (lb >= 4) ? 2 : 1;
                                else if (rarity === 'SR' || isDist) targetLv = (lb >= 3) ? 2 : 1;
                            } else {
                                targetLv = (lb >= 2) ? 2 : 1;
                            }
    
                            if (data.levels[rarityKey]) {
                                val = data.levels[rarityKey][targetLv] || data.levels[rarityKey][1];
                            } else if (data.levels[rarity]) {
                                val = data.levels[rarity][targetLv] || data.levels[rarity][1];
                            } else {
                                val = data.levels[targetLv] || Object.values(data.levels)[0];
                            }
                        }
    
                        const format = data.format[state.currentLang] || data.format['ko'];
                        const attrKey = `attr_${card.type.toLowerCase()}`;
                        const translatedType = translations[state.currentLang][attrKey] || card.type;
                        const rawText = format.replaceAll('{val}', val).replaceAll('{type}', translatedType);
                        
                                            // 수치 하이라이트 적용
                                            const highlightedText = highlightNumbers(rawText, card.type);
                                            
                                            const abEl = document.createElement('div');
                                            abEl.className = `ability-item border-${card.type.toLowerCase()}`;
                                            
                                            // 글자 수가 많으면 shrink 클래스 추가 (줄바꿈 1회까지만 허용하기 위함)
                                            const isLongText = rawText.length > 35;
                                            const shrinkClass = isLongText ? 'shrink' : '';
                        
                                            abEl.innerHTML = `
                                                <div class="ability-text ${shrinkClass}">
                                                    ${highlightedText}
                                                </div>
                                            `;
                                            mAbilities.appendChild(abEl);                    }
                });
            }
        };
    const updateStars = (lb) => {
        stars.forEach((s, idx) => {
            s.classList.toggle('active', idx < lb);
        });
        updateAbilities(lb);
    };

    // 초기 별 상태
    updateStars(currentLB);

    // 별 클릭 이벤트 등록
    stars.forEach((s, idx) => {
        s.onclick = () => {
            const newLB = (idx + 1 === currentLB) ? 0 : idx + 1;
            currentLB = newLB;
            setSupportLB(card.id, currentLB); // 모달에서의 변경사항도 전역 상태에 저장
            updateStars(currentLB);
            
            // 서포트 카드 목록의 해당 카드 별점 즉시 업데이트 (ID 기반 최적화)
            const cardInGrid = document.querySelector(`.support-card[data-id="${card.id}"]`);
            if (cardInGrid) {
                const cardStars = cardInGrid.querySelectorAll('.card-star');
                cardStars.forEach((cs, cIdx) => {
                    cs.classList.toggle('active', cIdx < currentLB);
                });
            }
        };
    });

    modal.classList.remove('hidden');

    // Add state to history for back button support
    history.pushState({ modalOpen: true }, "");
}