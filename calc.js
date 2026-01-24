// calc.js
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';

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
    
    const weekNumbers = Object.keys(planData.weeks)
        .map(n => parseInt(n))
        .sort((a, b) => b - a);
    
    let weeksHtml = '';
    weekNumbers.forEach(i => {
        const options = planData.weeks[i] || [];
        const optionsHtml = options.map(opt => {
            const isLarge = ['audition', 'test', 'oikomi'].includes(opt.value);
            const largeClass = isLarge ? 'large-icon' : '';
            return `
                <div class="plan-icon-wrapper ${largeClass}" data-value="${opt.value}">
                    <img src="icons/cal/${opt.value}.webp" alt="${opt.value}" class="plan-icon-img">
                </div>
            `;
        }).join('');

        weeksHtml += `
            <div class="week-row">
                <span class="week-label">${i}주</span>
                <div class="plan-icons-container">
                    ${optionsHtml}
                </div>
            </div>
        `;
    });

    calcRoot.innerHTML = `
        <div class="calc-container">
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
            <div class="unified-plan-board">
                ${weeksHtml}
            </div>
            <div class="calc-actions">
                <button class="back-btn primary-btn">뒤로가기</button>
            </div>
        </div>
    `;
    
    setupBackBtn();
    setupIconToggles();
}

function setupIconToggles() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;

    board.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.plan-icon-wrapper');
        if (!wrapper) return;

        const row = wrapper.closest('.week-row');
        const isAlreadyActive = wrapper.classList.contains('active');
        
        if (isAlreadyActive) {
            wrapper.classList.remove('active');
        } else {
            row.querySelectorAll('.plan-icon-wrapper').forEach(w => w.classList.remove('active'));
            wrapper.classList.add('active');
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