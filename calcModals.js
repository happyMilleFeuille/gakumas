// calcModals.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCountsFromDOM, calculateAllTotals } from './calcLogic.js';
import { updateSelectedCardsUI, updateStatHeaderUI } from './calcUI.js';

/**
 * 서포트 카드 선택 패널 렌더링
 */
export function renderSidePanelContent(panel, selectedPlan) {
    const filtered = cardList.filter(c => (c.plan === selectedPlan || c.plan === 'free') && c.rarity !== 'R' && c.type !== 'assist');
    const renderCol = (type) => filtered.filter(c => c.type === type).map(c => {
        const lb = state.supportLB[c.id] || 0;
        return `<div class="side-card-item" data-id="${c.id}"><img src="images/support/${c.id}.webp" onerror="this.src='icons/card.png'"><img src="images/support/${c.id}_card.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_item.webp'; this.onerror=null;"><div class="calc-card-stars">${Array.from({length:4}, (_, i) => `<img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div><div class="card-bonus-overlay"><span class="bonus-val"></span></div><div class="info-btn">i</div></div>`;
    }).join('');
    panel.innerHTML = `<div class="side-panel-tabs"><div class="panel-tab-item"><img src="icons/vocal.png"></div><div class="panel-tab-item"><img src="icons/dance.png"></div><div class="panel-tab-item"><img src="icons/visual.png"></div></div><div class="side-panel-content"><div class="calc-spinner-overlay" id="calc-side-spinner-overlay"><div class="calc-spinner"></div></div><div class="side-panel-column" data-type="vocal">${renderCol('vocal')}</div><div class="side-panel-column" data-type="dance">${renderCol('dance')}</div><div class="side-panel-column" data-type="visual">${renderCol('visual')}</div></div>`;
}

/**
 * 서포트 카드 패널 토글
 */
export function toggleSupportCardPanel(selectedPlan, refreshCardBonuses, saveCalcState) {
    let panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (panel?.classList.contains('open')) { closeSupportCardPanel(); return; }
    if (!panel) {
        panel = document.createElement('div'); panel.id = 'calc-side-panel'; panel.className = 'calc-side-panel';
        (window.innerWidth <= 768 ? document.body : document.querySelector('.calc-container')).appendChild(panel);
        panel.addEventListener('click', (e) => {
            const infoBtn = e.target.closest('.info-btn'), item = e.target.closest('.side-card-item');
            if (infoBtn && item) {
                e.stopPropagation();
                const card = cardList.find(c => c.id === item.dataset.id);
                if (card) window.showCardModal(card, (state.currentLang === 'ja' && card.name_ja ? card.name_ja : card.name), card.image || `images/support/${card.id}.webp`);
                return;
            }
            if (item) {
                const board = document.querySelector('.unified-plan-board');
                const type = board?.dataset.calcType;
                const cardId = item.dataset.id, isSelected = item.classList.contains('selected');
                let selectedItems = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0));
                
                const current = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
                if (!current.cardChecked) current.cardChecked = {};

                if (isSelected) { 
                    item.classList.remove('selected'); 
                    delete item.dataset.selectTime;
                    if (current.cardChecked[cardId]) delete current.cardChecked[cardId];
                }
                else {
                    if (selectedItems.length >= 6) { 
                        const oldestItem = selectedItems[0]; 
                        oldestItem.classList.remove('selected'); 
                        delete oldestItem.dataset.selectTime;
                        if (current.cardChecked[oldestItem.dataset.id]) delete current.cardChecked[oldestItem.dataset.id];
                    }
                    item.classList.add('selected'); item.dataset.selectTime = Date.now();
                }
                
                localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
                const finalIds = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0)).map(el => el.dataset.id);
                updateSelectedCardsUI(finalIds, type); 
                saveCalcState();
            }
        });
    }
    if (window.innerWidth <= 768 && !overlay) { overlay = document.createElement('div'); overlay.id = 'panel-overlay'; overlay.className = 'panel-overlay'; document.body.appendChild(overlay); overlay.onclick = closeSupportCardPanel; }
    renderSidePanelContent(panel, selectedPlan);
    const boardElem = document.querySelector('.unified-plan-board');
    if (boardElem) {
        const type = boardElem.dataset.calcType, saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        const planCards = (saved.planCards && selectedPlan) ? (saved.planCards[selectedPlan] || []) : [];
        planCards.forEach(id => {
            const item = panel.querySelector(`.side-card-item[data-id="${id}"]`);
            if (item) { item.classList.add('selected'); item.dataset.selectTime = Date.now(); }
        });
        updateSelectedCardsUI(planCards, type);
    }
    requestAnimationFrame(() => {
        panel.classList.add('open'); if (overlay) overlay.classList.add('show');
        setTimeout(() => { refreshCardBonuses(); document.getElementById('calc-side-spinner-overlay')?.remove(); }, 150);
    });
}

export function closeSupportCardPanel(isPopState = false) {
    const panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (panel?.classList.contains('open')) { panel.classList.remove('open'); if (overlay) overlay.classList.remove('show'); if (!isPopState && window.innerWidth <= 768 && history.state?.panelOpen) history.back(); }
}
window.closeSupportCardPanel = closeSupportCardPanel;

/**
 * 스킬 카드 선택(조정) 모달
 */
export function showOtherTuneModal(type, current, refreshCardBonuses, updateActivityCounts, getBoardPools) {
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type || 'sense';
    const isHajime = type === 'hajime';
    
    // 현재 선택된 스킬 카드 상태 로드
    const selectedSkills = current.selectedSkills || {};
    
    // 보드에서의 카드 획득 수치 계산 (모든 타입 합산 + 서포트 카드 보너스)
    const pools = getBoardPools(type, current);
    let boardGetCount = pools.get.generic + pools.get.m + pools.get.a;
    
    // 서포트 카드 체크박스 보너스 합산
    const cardChecked = current.cardChecked || {};
    const planCards = current.planCards || {};
    const selectedIds = planCards[activePlan] || [];
    selectedIds.forEach(id => {
        if (cardChecked[id]) {
            const card = cardList.find(c => c.id === id);
            if (card && card.have?.startsWith('card_')) boardGetCount++;
        }
    });

    const cardGroups = [];
    const rarities = ['r', 'sr', 'ssr'];
    if (isHajime) rarities.push('legend');

    const maxNums = { ssr: 13, sr: 21, r: 14, legend: 3 };
    const freeMaxNums = { ssr: 9, sr: 3, r: 2 };

    rarities.forEach(r => {
        const planMax = maxNums[r] || 0;
        for(let i=1; i<=planMax; i++) {
            const group = [`${activePlan}-${r}${i}`];
            const key = `${r}${i}`;
            let hasAlt = false;
            if (activePlan === 'sense' && ['r2', 'r8', 'sr1', 'sr6', 'sr9'].includes(key)) hasAlt = true;
            if (activePlan === 'logic' && ['r1', 'r3', 'sr3', 'sr6', 'sr8'].includes(key)) hasAlt = true;
            if (activePlan === 'anomaly' && ['r3', 'r4', 'sr1', 'sr3', 'sr4'].includes(key)) hasAlt = true;
            
            if (hasAlt) group.push(`${activePlan}-${r}${i}alt`);
            cardGroups.push(group);
        }
        
        if (r !== 'legend') {
            const freeMax = freeMaxNums[r] || 0;
            for(let i=1; i<=freeMax; i++) {
                cardGroups.push([`free-${r}${i}`]);
            }
        }
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '30000';
    
    const renderCardItem = (id) => {
        const skill = skillCardList[id] || {};
        const count = selectedSkills[id] || 0;
        const isSelected = count > 0;
        const multiAttr = skill.multi ? 'data-multi="true"' : '';
        
        return `
            <div class="tune-card-item ${isSelected ? 'selected' : ''}" data-id="${id}" ${multiAttr}>
                <img src="icons/cal/card/${id}.webp" onerror="this.parentElement.style.display='none';">
                <div class="card-count-badge ${count > 1 ? '' : 'hidden'}">x${count}</div>
                <div class="card-reset-btn ${isSelected && skill.multi ? '' : 'hidden'}">×</div>
            </div>
        `;
    };

    const cardsHtml = cardGroups.map(group => {
        const itemsHtml = group.map(id => renderCardItem(id)).join('');
        return group.length > 1 ? `<div class="tune-card-group-box" data-group="${group.join(',')}">${itemsHtml}</div>` : itemsHtml;
    }).join('');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 95%; width: 600px; max-height: 85vh; padding: 15px; display: flex; flex-direction: column;">
            <h3 id="modal-tune-title" style="margin-top: 0; margin-bottom: 15px; text-align: center; color: #9c27b0;">카드 선택 (0 / 0)</h3>
            <style>
                .tune-card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 5px; flex: 1; overflow-y: auto; }
                @media (min-width: 769px) { .tune-card-grid { grid-template-columns: repeat(5, 1fr); gap: 12px; } }
                .tune-card-group-box { grid-column: span 2; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; padding: 6px; background: rgba(156, 39, 176, 0.12); border: 2px solid rgba(156, 39, 176, 0.4); border-radius: 12px; }
                .tune-card-item { cursor: pointer; transition: transform 0.1s; position: relative; }
                .tune-card-item img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 8px; border: 2px solid #eee; background: #fdfdfd; display: block; }
                .tune-card-item.selected img { border-color: #9c27b0; box-shadow: 0 0 8px rgba(156, 39, 176, 0.4); }
                .tune-card-item:hover img { border-color: #9c27b0; }
                .tune-card-item:active { transform: scale(0.95); }
                .card-count-badge { position: absolute; top: -5px; right: -5px; background: #9c27b0; color: white; font-size: 0.75rem; font-weight: bold; padding: 2px 6px; border-radius: 10px; z-index: 10; pointer-events: none; }
                .card-reset-btn { position: absolute; top: -5px; left: -5px; background: #ff4d4d; color: white; font-size: 1rem; font-weight: bold; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10; line-height: 1; }
                .hidden { display: none !important; }
            </style>
            <div class="tune-card-grid">${cardsHtml}</div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="primary-btn" id="reset-all-skills" style="flex: 1; padding: 12px; background: #666; border-radius: 8px;">전체 초기화</button>
                <button class="primary-btn" id="close-tune-modal" style="flex: 1; padding: 12px; background: #9c27b0; border-radius: 8px;">닫기</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 외부 클릭 처리
    const closeModal = () => {
        modal.remove();
    };

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    const updateTitle = () => {
        const selectedCount = Object.values(selectedSkills).reduce((a, b) => a + b, 0);
        const titleEl = document.getElementById('modal-tune-title');
        if (titleEl) {
            titleEl.textContent = `카드 선택 (${selectedCount} / ${boardGetCount})`;
        }
    };

    updateTitle(); // 초기 제목 설정

    const updateUI = (id) => {
        const item = modal.querySelector(`.tune-card-item[data-id="${id}"]`);
        if (!item) return;
        const count = selectedSkills[id] || 0;
        const skill = skillCardList[id] || {};
        
        item.classList.toggle('selected', count > 0);
        const badge = item.querySelector('.card-count-badge');
        if (badge) {
            badge.textContent = `x${count}`;
            badge.classList.toggle('hidden', count <= 1);
        }
        const resetBtn = item.querySelector('.card-reset-btn');
        if (resetBtn) {
            resetBtn.classList.toggle('hidden', count === 0 || !skill.multi);
        }
        updateTitle();
    };

    // 전체 초기화 로직
    document.getElementById('reset-all-skills').onclick = () => {
        if (!confirm('모든 선택을 초기화하시겠습니까?')) return;
        Object.keys(selectedSkills).forEach(id => {
            delete selectedSkills[id];
            updateUI(id);
        });
        current.selectedSkills = selectedSkills;
        localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
        refreshCardBonuses();
        updateActivityCounts();
    };

    modal.querySelectorAll('.tune-card-item').forEach(item => {
        item.onclick = (e) => {
            const id = item.dataset.id;
            const skill = skillCardList[id] || {};
            const resetBtn = e.target.closest('.card-reset-btn');

            if (resetBtn) {
                e.stopPropagation();
                delete selectedSkills[id];
            } else {
                if (skill.multi) {
                    selectedSkills[id] = (selectedSkills[id] || 0) + 1;
                } else {
                    if (selectedSkills[id]) {
                        delete selectedSkills[id];
                    } else {
                        // 얼터 로직: 같은 그룹 내 다른 카드 해제
                        const groupBox = item.closest('.tune-card-group-box');
                        if (groupBox) {
                            const groupIds = groupBox.dataset.group.split(',');
                            groupIds.forEach(gid => {
                                if (gid !== id) {
                                    delete selectedSkills[gid];
                                    updateUI(gid);
                                }
                            });
                        }
                        selectedSkills[id] = 1;
                    }
                }
            }

            updateUI(id);
            current.selectedSkills = selectedSkills;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            refreshCardBonuses();
            updateActivityCounts();
        };
    });

    document.getElementById('close-tune-modal').onclick = () => closeModal();
}

