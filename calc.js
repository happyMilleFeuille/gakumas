// calc.js
import { state } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';

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
            <!-- 메인 컨텐츠 래퍼 (왼쪽 열) -->
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
            <!-- 메인 컨텐츠 래퍼 끝 -->
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
            openSupportCardPanel(selectedPlan);
        };
    }
}

function openSupportCardPanel(selectedPlan) {
    let panel = document.getElementById('calc-side-panel');
    if (panel) panel.remove();

    panel = document.createElement('div');
    panel.id = 'calc-side-panel';
    panel.className = 'calc-side-panel';

    // 해당하는 플랜 + 프리 플랜 필터링 (R등급 및 어시스트 제외)
    const filteredCards = cardList.filter(c => 
        (c.plan === selectedPlan || c.plan === 'free') && 
        c.rarity !== 'R' && 
        c.type !== 'assist'
    );

    // 속성별 카드 분류
    const vocalCards = filteredCards.filter(c => c.type === 'vocal');
    const danceCards = filteredCards.filter(c => c.type === 'dance');
    const visualCards = filteredCards.filter(c => c.type === 'visual');

    const renderColumnCards = (cards) => cards.map(card => `
        <div class="side-card-item" data-id="${card.id}">
            <img src="images/support/${card.id}.webp" alt="${card.name}" onerror="this.src='icons/card.png'">
        </div>
    `).join('');

    panel.innerHTML = `
        <div class="side-panel-tabs">
            <div class="panel-tab-item"><img src="icons/vocal.png" alt="Vocal"></div>
            <div class="panel-tab-item"><img src="icons/dance.png" alt="Dance"></div>
            <div class="panel-tab-item"><img src="icons/visual.png" alt="Visual"></div>
        </div>
        <div class="side-panel-content">
            <div class="side-panel-column" data-type="vocal">${renderColumnCards(vocalCards)}</div>
            <div class="side-panel-column" data-type="dance">${renderColumnCards(danceCards)}</div>
            <div class="side-panel-column" data-type="visual">${renderColumnCards(visualCards)}</div>
        </div>
    `;

    document.querySelector('.calc-container').appendChild(panel);
}

function setupPlanTypeSelector() {
    const btns = document.querySelectorAll('.plan-type-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            const isActive = btn.classList.contains('active');
            btns.forEach(b => b.classList.remove('active'));
            if (!isActive) btn.classList.add('active');
            saveCalcState();
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
    if (wrapper.classList.contains('active') && wrapper.dataset.optsp_param === 'true') {
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
            return `${opt.mainlabel}x${count}`;
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

    const removeAllTooltips = () => {
        document.querySelectorAll('.calc-tooltip').forEach(t => t.remove());
    };

    board.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.plan-icon-wrapper');
        if (e.target.closest('.calc-tooltip')) return;
        if (!wrapper) { removeAllTooltips(); return; }

        const row = wrapper.closest('.week-row');
        const isAlreadyActive = wrapper.classList.contains('active');
        const val = wrapper.dataset.value;
        
        if (isAlreadyActive) {
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
            removeAllTooltips();

            const options = activityOptions[val];
            if (options && options.length > 0) {
                const tooltip = document.createElement('div');
                tooltip.className = 'calc-tooltip';
                let optionsHtml = '';
                options.forEach(opt => {
                    const label = opt[`label_${state.currentLang}`] || opt.label_ko;
                    if (opt.type === 'checkbox') {
                        const isChecked = wrapper.dataset[`opt${opt.id}`] === 'true';
                        optionsHtml += `<label class="tooltip-option"><input type="checkbox" data-id="${opt.id}" ${isChecked ? 'checked' : ''}><span>${label}</span></label>`;
                    } else if (opt.type === 'counter') {
                        const currentVal = parseInt(wrapper.dataset[`opt${opt.id}`]) || 0;
                        optionsHtml += `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${opt.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${currentVal}</span><button class="cnt-btn plus">+</button></div></div>`;
                    }
                });
                tooltip.innerHTML = optionsHtml;
                document.body.appendChild(tooltip);
                const rect = wrapper.getBoundingClientRect();
                tooltip.style.left = `${rect.right}px`;
                tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;

                tooltip.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                    chk.onchange = () => {
                        wrapper.dataset[`opt${chk.dataset.id}`] = chk.checked;
                        if (chk.dataset.id === 'sp_param') updateSPBadge(wrapper);
                        updateMainLabel(wrapper);
                        saveCalcState();
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
        if (!e.target.closest('.calc-tooltip') && !e.target.closest('.plan-icon-wrapper')) {
            removeAllTooltips();
        }
    });
    window.addEventListener('scroll', removeAllTooltips, { passive: true });
    const idolContainer = document.getElementById('idol');
    if (idolContainer) idolContainer.addEventListener('scroll', removeAllTooltips, { passive: true });
    board.addEventListener('touchmove', removeAllTooltips, { passive: true });
}

function setupBackBtn() {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            renderCalcMenu();
        };
    }
}
