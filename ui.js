// ui.js
import { state, setFilter, setBackground, setSupportLB } from './state.js';
import { updatePageTranslations, applyBackground } from './utils.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import translations from './i18n.js';

const contentArea = document.getElementById('content-area');
// ... 생략 (idolList 및 renderHome, renderCalc, renderIdolList는 동일하게 유지)
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
}

export function renderIdolList() {
    if (!contentArea) return;
    contentArea.innerHTML = '';
    
    const gridTpl = document.getElementById('tpl-idol-grid');
    const itemTpl = document.getElementById('tpl-idol-item');
    const grid = gridTpl.content.cloneNode(true).querySelector('.idol-grid');

    idolList.forEach(name => {
        const item = itemTpl.content.cloneNode(true);
        const img = item.querySelector('.idol-icon');
        img.src = `icons/idolicons/${name}.png`;
        img.alt = name;
        img.addEventListener('click', () => {
            setBackground(name);
            applyBackground(name);
        });
        grid.appendChild(item);
    });

    contentArea.appendChild(grid);
}

export function renderSupport() {
    if (!contentArea) return;
    
    // 1. Setup Template
    const tpl = document.getElementById('tpl-support');
    contentArea.innerHTML = '';
    const view = tpl.content.cloneNode(true);
    const grid = view.querySelector('.support-grid');
    const itemTpl = document.getElementById('tpl-support-item');

    // 2. Setup Filter UI State
    const planBtns = view.querySelectorAll('#filter-plan .filter-btn');
    const attrBtns = view.querySelectorAll('#filter-attr .filter-btn');
    const sourceBtns = view.querySelectorAll('#filter-source .filter-btn');

    const setupFilterBtn = (btns, type) => {
        btns.forEach(btn => {
            if(btn.dataset.val === state.filters[type]) btn.classList.add('active');
            else btn.classList.remove('active');
            
            btn.addEventListener('click', () => {
                setFilter(type, btn.dataset.val);
                renderSupport(); 
            });
        });
    };

    setupFilterBtn(planBtns, 'plan');
    setupFilterBtn(attrBtns, 'attr');
    setupFilterBtn(sourceBtns, 'source');

    // 3. Filter Data
    const filteredList = cardList.filter(card => {
        // 도감 제외 설정 확인
        if (card.encyclopedia === false) return false;

        const cPlan = (card.plan || 'free').toLowerCase();
        const cType = card.type.toLowerCase();
        const cSource = (card.source || 'normal').toLowerCase();

        // Plan Filter (Free is always included)
        const planMatch = (state.filters.plan === 'all') || 
                          (cPlan === state.filters.plan) || 
                          (cPlan === 'free');

        // Attribute Filter (Assist is always included)
        const attrMatch = (state.filters.attr === 'all') || 
                          (cType === state.filters.attr) || 
                          (cType === 'assist');

        // Source Filter
        const sourceMatch = (state.filters.source === 'all') || (cSource === state.filters.source);

        return planMatch && attrMatch && sourceMatch;
    });

    // 4. Render Grid
    if (filteredList.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1; padding:2rem;">No cards found.</p>';
    } else {
        filteredList.forEach(card => {
            const item = itemTpl.content.cloneNode(true);
            const cardId = card.id;
            const currentLB = state.supportLB[cardId] || 0;
            
            // Set Image
            const imgSrc = card.image || `images/support/${cardId}.webp`;
            item.querySelector('.card-img').src = imgSrc;
            
            item.querySelector('.card-rarity').textContent = card.rarity;
            
            // Stars (Limit Break)
            const cardStars = item.querySelectorAll('.card-star');
            const updateCardStars = (lb) => {
                cardStars.forEach((s, idx) => {
                    s.classList.toggle('active', idx < lb);
                });
            };
            updateCardStars(currentLB);

            cardStars.forEach((s, idx) => {
                s.addEventListener('click', (e) => {
                    e.stopPropagation(); // 모달 열기 방지
                    const newLB = (idx + 1 === (state.supportLB[cardId] || 0)) ? 0 : idx + 1;
                    setSupportLB(cardId, newLB);
                    updateCardStars(newLB);
                });
            });
            
            // Plan Icon
            const planIcon = item.querySelector('.card-plan-icon');
            const plan = (card.plan || 'free').toLowerCase();
            if (plan === 'free') {
                planIcon.style.display = 'none';
            } else {
                planIcon.src = `icons/${plan}.webp`;
                planIcon.alt = plan;
            }
            
            // Type Class
            const typeEl = item.querySelector('.card-type');
            const type = card.type.toLowerCase();
            typeEl.textContent = card.type;
            
            if (type === 'vocal') typeEl.classList.add('type-vocal');
            else if (type === 'dance') typeEl.classList.add('type-dance');
            else if (type === 'visual') typeEl.classList.add('type-visual');
            else if (type === 'assist') typeEl.classList.add('type-assist');

            // Name Translation
            const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            item.querySelector('.card-name').textContent = displayName;

            // Click Event for Modal
            item.querySelector('.support-card').addEventListener('click', () => {
                showCardModal(card, displayName, imgSrc);
            });

            grid.appendChild(item);
        });
    }

    contentArea.appendChild(view);
    updatePageTranslations();
}

// 모달 표시 함수
function showCardModal(card, displayName, imgSrc) {
    const modal = document.getElementById('card-modal');
    const mImg = document.getElementById('modal-img');
    const mTitle = document.getElementById('modal-title');
    const mExtraIcon = document.getElementById('modal-extra-icon');
    const mExtra1 = document.getElementById('modal-extra-1');
    const mExtra2 = document.getElementById('modal-extra-2');
    const mAbilities = document.getElementById('modal-abilities');
    const stars = document.querySelectorAll('.star');

    mImg.src = imgSrc;
    mTitle.textContent = displayName;

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
        mExtra2.innerHTML = getExtraText(card.extra2);
    
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
            
            // 서포트 카드 목록의 해당 카드 별점 즉시 업데이트
            const mainCards = document.querySelectorAll('.support-card');
            mainCards.forEach(mc => {
                // 클릭 이벤트를 통해 카드 데이터를 식별하기 위해 
                // renderSupport에서 ID를 저장해두거나 데이터를 비교해야 함.
                // 여기서는 간단하게 모든 카드를 다시 그리지 않고 
                // 해당 ID를 가진 카드의 별점만 찾아 업데이트함.
                const nameEl = mc.querySelector('.card-name');
                if (nameEl && nameEl.textContent === displayName) {
                    const cardStars = mc.querySelectorAll('.card-star');
                    cardStars.forEach((cs, cIdx) => {
                        cs.classList.toggle('active', cIdx < currentLB);
                    });
                }
            });
        };
    });

    modal.classList.remove('hidden');

    // Add state to history for back button support
    history.pushState({ modalOpen: true }, "");
}