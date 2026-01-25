// calc.js
import { state } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { getTriggerCounts, calculateCardBonus } from './simulator-engine.js';

const idolList = [
    'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 
    'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
];

export function initCalc() {
    renderCalcMenu();
}

function renderCalcMenu() {
    const calcRoot = document.getElementById('calc-root');
    if (!calcRoot) return;

    calcRoot.innerHTML = `
        <div class="calc-menu-container">
            <h2 data-i18n="calc_title">계산기 메뉴</h2>
            <div class="calc-buttons">
                <button class="primary-btn" id="btn-hajime">Hajime</button>
                <button class="primary-btn" id="btn-nia">N.i.a</button>
            </div>
        </div>
    `;
    
    updatePageTranslations();

    document.getElementById('btn-hajime').addEventListener('click', () => renderWeeklyPlan('hajime'));
    document.getElementById('btn-nia').addEventListener('click', () => renderWeeklyPlan('nia'));
}

function renderWeeklyPlan(type) {
    const calcRoot = document.getElementById('calc-root');
    const planData = calcPlans[type];
    
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    const savedWeeks = savedState.weeks || savedState;

    const idolsHtml = idolList.map(name => `
        <div class="idol-sel-item" data-id="${name}">
            <img src="icons/idolicons/${name}.png" alt="${name}" onerror="this.src='icons/idol.png'">
        </div>
    `).join('');

    const weekNumbers = Object.keys(planData.weeks)
        .map(n => parseInt(n))
        .sort((a, b) => b - a);
    
    let weeksHtml = '';
    weekNumbers.forEach(i => {
        const options = planData.weeks[i] || [];
        const savedWeek = savedWeeks[i] || {};

        const optionsHtml = options.map(opt => {
            const isLarge = ['audition', 'test', 'oikomi'].includes(opt.value);
            const largeClass = isLarge ? 'large-icon' : '';
            const isActive = savedWeek.value === opt.value;
            const activeClass = isActive ? 'active' : '';
            
            let optDataAttrs = '';
            if (isActive && savedWeek.opts) {
                Object.keys(savedWeek.opts).forEach(k => {
                    optDataAttrs += ` data-opt${k}="${savedWeek.opts[k]}"`;
                });
            }

            return `
                <div class="plan-icon-wrapper ${largeClass} ${activeClass}" 
                     data-value="${opt.value}" 
                     ${optDataAttrs}>
                    <img src="icons/cal/${opt.value}.webp" alt="${opt.value}" class="plan-icon-img">
                </div>
            `;
        }).join('');

        weeksHtml += `
            <div class="week-row" data-week="${i}">
                <div class="week-header">
                    <span class="week-label">${i}주</span>
                </div>
                <div class="plan-icons-container">
                    ${optionsHtml}
                </div>
            </div>
        `;
    });

    calcRoot.innerHTML = `
        <div class="calc-container">
            <div class="calc-main-wrapper">
                <div class="calc-actions top">
                    <button class="calc-btn primary-btn" id="btn-run-calc">계산</button>
                    <button class="back-btn primary-btn">뒤로가기</button>
                </div>

                <div class="idol-selector-grid" id="idol-selector-grid">
                    ${idolsHtml}
                </div>

                <div class="plan-type-selector">
                    <div class="plan-type-btn" data-type="sense">
                        <img src="icons/sense.webp" alt="Sense">
                    </div>
                    <div class="plan-type-btn" data-type="logic">
                        <img src="icons/logic.webp" alt="Logic">
                    </div>
                    <div class="plan-type-btn" data-type="anomaly">
                        <img src="icons/anomaly.webp" alt="Anomaly">
                    </div>
                </div>

                <div class="stat-header">
                    <div class="stat-item">
                        <img src="icons/vocal.png" alt="Vocal">
                        <span>보컬</span>
                    </div>
                    <div class="stat-item">
                        <img src="icons/dance.png" alt="Dance">
                        <span>댄스</span>
                    </div>
                    <div class="stat-item">
                        <img src="icons/visual.png" alt="Visual">
                        <span>비주얼</span>
                    </div>
                </div>
                
                <div class="activity-counter" id="activity-counter"></div>

                <div class="board-toggle-bar" id="board-toggle-bar">주간 행동 닫기 ▲</div>

                <div class="unified-plan-board" data-calc-type="${type}">
                    ${weeksHtml}
                </div>
            </div>
        </div>
    `;
    
    const board = document.querySelector('.unified-plan-board');
    const toggleBar = document.getElementById('board-toggle-bar');

    if (savedState.isBoardCollapsed) {
        board.classList.add('collapsed-board');
        if (toggleBar) toggleBar.textContent = '주간 행동 열기 ▼';
    }

    const savedIdolId = savedState.selectedIdol || '';
    if (savedIdolId) {
        const item = document.querySelector(`.idol-sel-item[data-id="${savedIdolId}"]`);
        if (item) item.classList.add('active');
    }

    const savedPlanType = savedState.planType || '';
    if (savedPlanType) {
        const btn = document.querySelector(`.plan-type-btn[data-type="${savedPlanType}"]`);
        if (btn) btn.classList.add('active');
    }

    setupBackBtn();
    setupPlanTypeSelector();
    setupIdolSelector();
    setupIconToggles();
    setupCalcAction(); 
    updateCalcButtonState(); 

    const idolContainer = document.getElementById('idol');
    if (idolContainer) {
        requestAnimationFrame(() => {
            idolContainer.scrollTop = idolContainer.scrollHeight;
        });
    }
}

function updateCalcButtonState() {
    const activeIdol = document.querySelector('.idol-sel-item.active');
    const activePlan = document.querySelector('.plan-type-btn.active');
    const calcBtn = document.getElementById('btn-run-calc');
    if (calcBtn) {
        calcBtn.disabled = !(activeIdol && activePlan);
    }
}

function setupIdolSelector() {
    const grid = document.getElementById('idol-selector-grid');
    if (!grid) return;

    const items = grid.querySelectorAll('.idol-sel-item');
    items.forEach(item => {
        item.onclick = () => {
            const isActive = item.classList.contains('active');
            items.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
            saveCalcState();
            updateCalcButtonState(); 
        };
    });

    let isDown = false;
    let startX;
    let scrollLeft;

    grid.addEventListener('mousedown', (e) => {
        isDown = true;
        grid.classList.add('active');
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
    });
    grid.addEventListener('mouseleave', () => { isDown = false; });
    grid.addEventListener('mouseup', () => { isDown = false; });
    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 2;
        grid.scrollLeft = scrollLeft - walk;
    });
}

function setupCalcAction() {
    const calcBtn = document.getElementById('btn-run-calc');
    if (calcBtn) {
        calcBtn.onclick = () => {
            const activePlanBtn = document.querySelector('.plan-type-btn.active');
            if (!activePlanBtn) return;
            
            const selectedPlan = activePlanBtn.dataset.type;
            toggleSupportCardPanel(selectedPlan);
        };
    }
}

// DOM에서 실시간으로 트리거 횟수 집계 (레슨 타입 상세화)
function getTriggerCountsFromDOM() {
    const counts = {
        // 일반 집계
        total: {},
        // 레슨 상세 집계 (vocal_lesson, vocal_sp, etc.)
        lessons: {
            vocal: { normal: 0, sp: 0 },
            dance: { normal: 0, sp: 0 },
            visual: { normal: 0, sp: 0 }
        }
    };
    
    const board = document.querySelector('.unified-plan-board');
    if (!board) return counts;

    board.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        const actionId = wrapper.dataset.value;
        const isSP = wrapper.dataset.optsp === 'true';
        
        // 1. 일반 ID 기반 카운트 (기존 호환성)
        counts.total[actionId] = (counts.total[actionId] || 0) + 1;

        // 2. 레슨 상세 분류
        if (actionId === 'lessonvo') {
            if (isSP) counts.lessons.vocal.sp++;
            else counts.lessons.vocal.normal++;
        } else if (actionId === 'lessondan') {
            if (isSP) counts.lessons.dance.sp++;
            else counts.lessons.dance.normal++;
        } else if (actionId === 'lessonvi') {
            if (isSP) counts.lessons.visual.sp++;
            else counts.lessons.visual.normal++;
        }

        // 3. 모든 옵션(opt*) 데이터셋 순회
        Object.keys(wrapper.dataset).forEach(key => {
            if (key.startsWith('opt')) {
                const optId = key.slice(3).toLowerCase();
                const val = wrapper.dataset[key];
                if (val === 'true') {
                    counts.total[optId] = (counts.total[optId] || 0) + 1;
                } else if (!isNaN(val)) {
                    counts.total[optId] = (counts.total[optId] || 0) + parseInt(val);
                }
            }
        });
    });
    return counts;
}

// 실시간 수치 갱신 함수 (상세 집계 대응)
function refreshCardBonuses() {
    const panel = document.getElementById('calc-side-panel');
    if (!panel || !panel.classList.contains('open')) return;

    const detailedCounts = getTriggerCountsFromDOM();

    panel.querySelectorAll('.side-card-item').forEach(item => {
        const cardId = item.dataset.id;
        const card = cardList.find(c => c.id === cardId);
        if (!card) return;

        const lb = state.supportLB[cardId] || 0;
        // 엔진에 상세 집계 데이터 전달
        const bonus = calculateCardBonus(card, detailedCounts, lb);
        const totalStat = bonus.vocal + bonus.dance + bonus.visual;

        const bonusEl = item.querySelector('.bonus-val');
        if (bonusEl) {
            bonusEl.textContent = totalStat > 0 ? '+' + totalStat : '';
        }
        item.style.order = -totalStat; 
    });
}
window.refreshCardBonuses = refreshCardBonuses; // 전역 등록

function toggleSupportCardPanel(selectedPlan) {
    let panel = document.getElementById('calc-side-panel');
    let overlay = document.getElementById('panel-overlay');

    if (panel && panel.classList.contains('open')) {
        closeSupportCardPanel();
        return;
    }

    const isMobile = window.innerWidth <= 768;

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'calc-side-panel';
        panel.className = 'calc-side-panel';
        
        if (isMobile) {
            document.body.appendChild(panel);
        } else {
            const container = document.querySelector('.calc-container');
            if (container) container.appendChild(panel);
        }

        // 이벤트 위임 적용 (한 번만 등록)
        panel.addEventListener('click', (e) => {
            const item = e.target.closest('.side-card-item');
            if (item) {
                e.stopPropagation();
                const cardId = item.dataset.id;
                const card = cardList.find(c => c.id === cardId);
                if (card) {
                    const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
                    const imgSrc = card.image || `images/support/${cardId}.webp`;
                    
                    // 전역 함수 호출 확인 및 실행
                    if (typeof window.showCardModal === 'function') {
                        window.showCardModal(card, displayName, imgSrc);
                    } else {
                        // 만약 로딩 순서 문제로 아직 없다면 직접 ui.js에서 가져오는 시도 대신 
                        // 전역 객체를 다시 확인하도록 유도
                        console.error('showCardModal is not defined on window');
                    }
                }
            }
        });
    }

    if (isMobile && !overlay) {
        overlay = document.createElement('div');
        overlay.id = 'panel-overlay';
        overlay.className = 'panel-overlay';
        document.body.appendChild(overlay);
        overlay.onclick = closeSupportCardPanel;
    }

    const filteredCards = cardList.filter(c => 
        (c.plan === selectedPlan || c.plan === 'free') && 
        c.rarity !== 'R' && 
        c.type !== 'assist'
    );

    panel.innerHTML = `
        <div class="side-panel-tabs">
            <div class="panel-tab-item"><img src="icons/vocal.png" alt="Vocal"></div>
            <div class="panel-tab-item"><img src="icons/dance.png" alt="Dance"></div>
            <div class="panel-tab-item"><img src="icons/visual.png" alt="Visual"></div>
        </div>
        <div class="side-panel-content">
            <div class="calc-spinner-overlay" id="calc-side-spinner-overlay">
                <div class="calc-spinner"></div>
            </div>
            <div class="side-panel-column" data-type="vocal"></div>
            <div class="side-panel-column" data-type="dance"></div>
            <div class="side-panel-column" data-type="visual"></div>
        </div>
    `;

    // 초기 카드 목록 렌더링
    const renderInitialColumn = (type) => {
        const cards = filteredCards.filter(c => c.type === type);
        return cards.map(card => {
            const lb = state.supportLB[card.id] || 0;
            const starsHtml = Array.from({length: 4}, (_, i) => `
                <img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">
            `).join('');

            return `
                <div class="side-card-item" data-id="${card.id}">
                    <img src="images/support/${card.id}.webp" alt="${card.name}" onerror="this.src='icons/card.png'">
                    <img src="images/support/${card.id}_card.webp" class="side-card-overlay-icon" 
                         onerror="this.src='images/support/${card.id}_item.webp'; this.onerror=null;">
                    <div class="calc-card-stars">${starsHtml}</div>
                    <div class="card-bonus-overlay">
                        <span class="bonus-val"></span>
                    </div>
                </div>
            `;
        }).join('');
    };

    const contentArea = panel.querySelector('.side-panel-content');
    contentArea.querySelector('[data-type="vocal"]').innerHTML = renderInitialColumn('vocal');
    contentArea.querySelector('[data-type="dance"]').innerHTML = renderInitialColumn('dance');
    contentArea.querySelector('[data-type="visual"]').innerHTML = renderInitialColumn('visual');

    requestAnimationFrame(() => {
        if (panel) panel.classList.add('open');
        if (overlay) overlay.classList.add('show');
        
        // 애니메이션 시작 후 약간의 지연을 주어 렌더링 보장
        setTimeout(() => {
            refreshCardBonuses();
            const spinnerOverlay = document.getElementById('calc-side-spinner-overlay');
            if (spinnerOverlay) spinnerOverlay.remove();
        }, 150);
    });
}


function closeSupportCardPanel(isPopState = false) {
    const panel = document.getElementById('calc-side-panel');
    const overlay = document.getElementById('panel-overlay');
    
    if (panel && panel.classList.contains('open')) {
        panel.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        
        // 수동으로 닫은 경우(뒤로가기 버튼이 아닌 경우) 히스토리 한 칸 되돌리기
        if (!isPopState && window.innerWidth <= 768 && history.state && history.state.panelOpen) {
            history.back();
        }
    }
}
window.closeSupportCardPanel = closeSupportCardPanel; // 전역 등록

function setupPlanTypeSelector() {
    const btns = document.querySelectorAll('.plan-type-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            const isActive = btn.classList.contains('active');
            btns.forEach(b => b.classList.remove('active'));
            if (!isActive) btn.classList.add('active');
            
            saveCalcState();
            
            // 플랜이 바뀌면 카드 목록 자체를 다시 그려야 함
            const activePlanBtn = document.querySelector('.plan-type-btn.active');
            if (activePlanBtn) {
                const selectedPlan = activePlanBtn.dataset.type;
                const panel = document.getElementById('calc-side-panel');
                // 패널이 열려있는 경우에만 목록 갱신
                if (panel && panel.classList.contains('open')) {
                    // 전체를 다시 그리면 깜빡이므로, 목록 렌더링 로직을 다시 호출하되
                    // 현재 상태에 맞게 toggle 로직의 일부를 수행
                    const filteredCards = cardList.filter(c => 
                        (c.plan === selectedPlan || c.plan === 'free') && 
                        c.rarity !== 'R' && 
                        c.type !== 'assist'
                    );

    // 초기 카드 목록 렌더링
    const renderInitialColumn = (type) => {
        const cards = filteredCards.filter(c => c.type === type);
        return cards.map(card => {
            const lb = state.supportLB[card.id] || 0;
            const starsHtml = Array.from({length: 4}, (_, i) => `
                <img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">
            `).join('');

            return `
                <div class="side-card-item" data-id="${card.id}">
                    <img src="images/support/${card.id}.webp" alt="${card.name}" onerror="this.src='icons/card.png'">
                    <img src="images/support/${card.id}_card.webp" class="side-card-overlay-icon" 
                         onerror="this.src='images/support/${card.id}_item.webp'; this.onerror=null;">
                    <div class="calc-card-stars">${starsHtml}</div>
                    <div class="card-bonus-overlay">
                        <span class="bonus-val"></span>
                    </div>
                </div>
            `;
        }).join('');
    };

                    const contentArea = panel.querySelector('.side-panel-content');
                    if (contentArea) {
                        contentArea.querySelector('[data-type="vocal"]').innerHTML = renderInitialColumn('vocal');
                        contentArea.querySelector('[data-type="dance"]').innerHTML = renderInitialColumn('dance');
                        contentArea.querySelector('[data-type="visual"]').innerHTML = renderInitialColumn('visual');
                        refreshCardBonuses();
                    }
                }
            }
            updateCalcButtonState(); 
        };
    });
}

function saveCalcState() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;

    const type = board.dataset.calcType;
    const activePlanTypeBtn = document.querySelector('.plan-type-btn.active');
    const activeIdolItem = document.querySelector('.idol-sel-item.active');
    const isBoardCollapsed = board.classList.contains('collapsed-board');
    
    const state = {
        selectedIdol: activeIdolItem ? activeIdolItem.dataset.id : '',
        planType: activePlanTypeBtn ? activePlanTypeBtn.dataset.type : '',
        isBoardCollapsed: isBoardCollapsed,
        weeks: {}
    };

    board.querySelectorAll('.week-row').forEach(row => {
        const week = row.dataset.week;
        const activeIcon = row.querySelector('.plan-icon-wrapper.active');
        if (activeIcon) {
            const opts = {};
            Object.keys(activeIcon.dataset).forEach(key => {
                if (key.startsWith('opt')) {
                    const optId = key.slice(3).toLowerCase();
                    opts[optId] = activeIcon.dataset[key];
                }
            });
            state.weeks[week] = {
                value: activeIcon.dataset.value,
                opts: opts
            };
        }
    });

    localStorage.setItem(`calc_state_${type}`, JSON.stringify(state));
    
    // 실시간 수치 갱신 호출
    if (typeof refreshCardBonuses === 'function') {
        refreshCardBonuses();
    }
}

function updateActivityCounts() {
    const counterContainer = document.getElementById('activity-counter');
    const board = document.querySelector('.unified-plan-board');
    if (!counterContainer || !board) return;

    const counts = {};
    const activeIcons = board.querySelectorAll('.plan-icon-wrapper.active');
    activeIcons.forEach(icon => {
        const val = icon.dataset.value;
        counts[val] = (counts[val] || 0) + 1;
    });

    const allPossibleValues = new Set();
    board.querySelectorAll('.plan-icon-wrapper').forEach(w => allPossibleValues.add(w.dataset.value));

    let html = '';
    Array.from(allPossibleValues).sort().forEach(val => {
        const count = counts[val] || 0;
        html += `
            <div class="counter-item" style="opacity: ${count > 0 ? 1 : 0.3}">
                <img src="icons/cal/${val}.webp" alt="${val}">
                <span class="counter-count">${count}</span>
            </div>
        `;
    });
    counterContainer.innerHTML = html;
}

function updateSPBadge(wrapper) {
    const oldBadge = wrapper.querySelector('.sp-badge');
    if (oldBadge) oldBadge.remove();
    if (wrapper.classList.contains('active') && wrapper.dataset.optsp === 'true') {
        const badge = document.createElement('div');
        badge.className = 'sp-badge';
        badge.textContent = 'SP';
        wrapper.appendChild(badge);
    }
}

function updateMainLabel(wrapper) {
    const oldLabel = wrapper.querySelector('.main-label-text');
    if (oldLabel) oldLabel.remove();
    if (!wrapper.classList.contains('active')) return;

    const val = wrapper.dataset.value;
    const options = activityOptions[val];
    if (!options) return;

    const activeLabels = options.filter(opt => {
        if (!opt.mainlabel) return false;
        const optVal = wrapper.dataset[`opt${opt.id}`];
        if (opt.type === 'counter') return parseInt(optVal) > 0;
        return optVal === 'true';
    }).map(opt => {
        if (opt.type === 'counter') {
            const count = parseInt(wrapper.dataset[`opt${opt.id}`]) || 0;
            return `${opt.mainlabel} ${count}`;
        }
        return opt.mainlabel;
    });

    if (activeLabels.length > 0) {
        const labelEl = document.createElement('div');
        labelEl.className = 'main-label-text';
        labelEl.textContent = activeLabels.join(' ');
        wrapper.appendChild(labelEl);
    }
}

function setupIconToggles() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;

    board.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        const val = wrapper.dataset.value;
        const options = activityOptions[val];
        if (options) {
            const anyChecked = options.some(o => {
                const optVal = wrapper.dataset[`opt${o.id}`];
                return o.type === 'counter' ? parseInt(optVal) > 0 : optVal === 'true';
            });
            wrapper.classList.toggle('has-options', anyChecked);
            updateSPBadge(wrapper);
            updateMainLabel(wrapper);
        }
    });

    updateActivityCounts();

    const removeAllTooltips = (excludeWrapper = null) => {
        const tooltips = document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip');
        if (tooltips.length === 0 && !excludeWrapper) return; // 열린 툴팁이 없으면 중단

        // 옵션이 있는 아이콘인데 아무것도 선택 안 했으면 선택 취소 처리
        document.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
            if (wrapper === excludeWrapper) return; 
            // ... (기존 로직 동일)

            const val = wrapper.dataset.value;
            const options = activityOptions[val];
            if (options && options.length > 0) {
                // 이 툴팁에 체크박스가 포함되어 있는지 확인
                const hasCheckbox = options.some(o => o.type === 'checkbox');
                if (!hasCheckbox) return; // 카운터만 있는 경우 등은 검사 안 함

                let hasSelectedAny = false;
                options.forEach(o => {
                    const isParentChecked = wrapper.dataset[`opt${o.id}`] === 'true';
                    const isCounterActive = o.type === 'counter' && parseInt(wrapper.dataset[`opt${o.id}`]) > 0;
                    
                    if (o.subOptions) {
                        // 하위 옵션이 있는 경우: 부모와 자식 둘 다 체크되어야 함
                        if (isParentChecked) {
                            const subChecked = o.subOptions.some(so => wrapper.dataset[`opt${so.id}`] === 'true');
                            if (subChecked) hasSelectedAny = true;
                        }
                    } else {
                        // 하위 옵션이 없는 경우: 체크박스나 카운터 확인
                        if (isParentChecked || isCounterActive) hasSelectedAny = true;
                    }
                });

                if (!hasSelectedAny) {
                    Object.keys(wrapper.dataset).forEach(key => {
                        if (key.startsWith('opt')) delete wrapper.dataset[key];
                    });
                    wrapper.classList.remove('active');
                    updateSPBadge(wrapper);
                    updateMainLabel(wrapper);
                }
            }
        });

        document.querySelectorAll('.calc-tooltip').forEach(t => t.remove());
        document.querySelectorAll('.calc-sub-tooltip').forEach(t => t.remove());
        updateActivityCounts();
        saveCalcState();
    };

    board.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.plan-icon-wrapper');
        // sub-tooltip 클릭 시 닫히지 않도록
        if (e.target.closest('.calc-tooltip') || e.target.closest('.calc-sub-tooltip')) return;
        if (!wrapper) { removeAllTooltips(); return; }

        const row = wrapper.closest('.week-row');
        const isAlreadyActive = wrapper.classList.contains('active');
        const val = wrapper.dataset.value;
        
        if (isAlreadyActive) {
            // 비활성화 시 옵션 초기화
            Object.keys(wrapper.dataset).forEach(key => {
                if (key.startsWith('opt')) {
                    delete wrapper.dataset[key];
                }
            });
            wrapper.classList.remove('active');
            updateSPBadge(wrapper); 
            updateMainLabel(wrapper);
            removeAllTooltips();
        } else {
            row.querySelectorAll('.plan-icon-wrapper').forEach(w => {
                w.classList.remove('active');
                const b = w.querySelector('.sp-badge'); if(b) b.remove();
                const l = w.querySelector('.main-label-text'); if(l) l.remove();
            });
            wrapper.classList.add('active');
            updateSPBadge(wrapper);
            updateMainLabel(wrapper);
            removeAllTooltips(wrapper); // 현재 래퍼는 제외하고 툴팁들 제거

            const options = activityOptions[val];
            if (options && options.length > 0) {
                const tooltip = document.createElement('div');
                tooltip.className = 'calc-tooltip';
                let optionsHtml = '';
                options.forEach(opt => {
                    const label = opt[`label_${state.currentLang}`] || opt.label_ko;
                    if (opt.type === 'checkbox') {
                        const isChecked = wrapper.dataset[`opt${opt.id}`] === 'true';
                        const hasSubArrow = opt.subOptions ? ' <span style="font-size:0.8em">▶</span>' : '';
                        optionsHtml += `<label class="tooltip-option"><input type="checkbox" data-id="${opt.id}" ${isChecked ? 'checked' : ''}><span>${label}${hasSubArrow}</span></label>`;
                    } else if (opt.type === 'counter') {
                        const currentVal = parseInt(wrapper.dataset[`opt${opt.id}`]) || 0;
                        optionsHtml += `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${opt.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${currentVal}</span><button class="cnt-btn plus">+</button></div></div>`;
                    }
                });
                tooltip.innerHTML = optionsHtml;
                document.body.appendChild(tooltip);
                const rect = wrapper.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
                tooltip.style.transform = 'translate(-50%, -50%)'; // 정중앙 정렬

                tooltip.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                    chk.onchange = () => {
                        const optId = chk.dataset.id;
                        const selectedOpt = options.find(o => o.id === optId);

                        // 체크박스 중복 선택 방지 (하나만 선택 가능하게)
                        if (chk.checked) {
                            tooltip.querySelectorAll('input[type="checkbox"]').forEach(other => {
                                if (other !== chk && other.checked) {
                                    other.checked = false;
                                    wrapper.dataset[`opt${other.dataset.id}`] = 'false';
                                    if (other.dataset.id === 'sp') updateSPBadge(wrapper);
                                    // 다른 옵션 해제 시 관련된 서브 툴팁도 닫기 (필요하다면 로직 추가)
                                }
                            });
                        }

                        wrapper.dataset[`opt${optId}`] = chk.checked;
                        if (optId === 'sp') updateSPBadge(wrapper);
                        updateMainLabel(wrapper);
                        saveCalcState();
                        
                        // 하위 옵션 처리
                        const existingSubTooltip = document.querySelector('.calc-sub-tooltip');
                        if (existingSubTooltip) existingSubTooltip.remove();

                        if (chk.checked && selectedOpt && selectedOpt.subOptions) {
                            showSubTooltip(selectedOpt, wrapper, tooltip);
                            // 하위 옵션이 열리면 부모 툴팁은 닫지 않음
                        } else {
                            // 만약 이 툴팁에 카운터 타입이 없고 하위 옵션도 안 열렸다면 닫기
                            const hasCounter = options.some(o => o.type === 'counter');
                            if (!hasCounter) {
                                setTimeout(() => {
                                    // 여전히 서브 툴팁이 없는 경우에만 닫기
                                    if (!document.querySelector('.calc-sub-tooltip')) {
                                        removeAllTooltips();
                                    }
                                }, 100);
                            }
                        }
                    };
                });


                tooltip.querySelectorAll('.counter-controls').forEach(ctrl => {
                    const optId = ctrl.dataset.id;
                    const valSpan = ctrl.querySelector('.cnt-val');
                    ctrl.onclick = (ce) => {
                        const btn = ce.target.closest('.cnt-btn'); if (!btn) return;
                        const optData = options.find(o => o.id === optId);
                        const maxVal = optData?.max || 9;
                        let current = parseInt(wrapper.dataset[`opt${optId}`]) || 0;
                        if (btn.classList.contains('plus') && current < maxVal) current++;
                        else if (btn.classList.contains('minus') && current > 0) current--;
                        wrapper.dataset[`opt${optId}`] = current;
                        valSpan.textContent = current;
                        updateMainLabel(wrapper);
                        saveCalcState();
                    };
                });
            }
        }
        updateActivityCounts();
        saveCalcState();
    });

    const toggleBar = document.getElementById('board-toggle-bar');
    if (toggleBar) {
        toggleBar.onclick = () => {
            board.classList.toggle('collapsed-board');
            const isCollapsed = board.classList.contains('collapsed-board');
            toggleBar.textContent = isCollapsed ? '주간 행동 열기 ▼' : '주간 행동 닫기 ▲';
            saveCalcState();
        };
    }

    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.calc-tooltip') && !e.target.closest('.calc-sub-tooltip') && !e.target.closest('.plan-icon-wrapper')) {
            removeAllTooltips();
        }
    });
}

function setupBackBtn() {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            renderCalcMenu();
        };
    }
}

function showSubTooltip(parentOpt, wrapper, parentTooltip) {
    const subTooltip = document.createElement('div');
    subTooltip.className = 'calc-tooltip calc-sub-tooltip';
    
    // 스타일 조정 (부모 툴팁 위에 겹치게)
    subTooltip.style.zIndex = '1100'; 
    subTooltip.style.backgroundColor = '#fefefe';
    subTooltip.style.border = '1px solid #ff4d8d';
    
    let html = '';
    parentOpt.subOptions.forEach(subOpt => {
        const label = subOpt[`label_${state.currentLang}`] || subOpt.label_ko;
        const isChecked = wrapper.dataset[`opt${subOpt.id}`] === 'true';
        html += `<label class="tooltip-option"><input type="checkbox" data-id="${subOpt.id}" ${isChecked ? 'checked' : ''}><span>${label}</span></label>`;
    });
    
    subTooltip.innerHTML = html;
    document.body.appendChild(subTooltip);

    // 위치 설정: 부모 툴팁의 중심에 배치 (덮어씌우기)
    const rect = parentTooltip.getBoundingClientRect();
    subTooltip.style.left = `${rect.left + rect.width / 2}px`; 
    subTooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
    subTooltip.style.transform = 'translate(-50%, -50%)';

    // 서브 툴팁 이벤트 리스너
    subTooltip.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = () => {
            // 서브 옵션 중복 방지
            if (chk.checked) {
                subTooltip.querySelectorAll('input[type="checkbox"]').forEach(other => {
                    if (other !== chk && other.checked) {
                        other.checked = false;
                        wrapper.dataset[`opt${other.dataset.id}`] = 'false';
                    }
                });
            }

            wrapper.dataset[`opt${chk.dataset.id}`] = chk.checked;
            updateMainLabel(wrapper);
            saveCalcState();

            // 선택 후 전체 닫기 (약간 지연)
            setTimeout(() => {
                document.querySelectorAll('.calc-tooltip').forEach(t => t.remove());
                document.querySelectorAll('.calc-sub-tooltip').forEach(t => t.remove());
            }, 100);
        };
    });
}
