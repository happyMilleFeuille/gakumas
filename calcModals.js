// calcModals.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCounts, calculateTotals } from './calcLogic.js';
import { updateSelectedCardsUI } from './calcUI.js';
import { calcStore } from './calcStore.js';

// 모달 및 상세 내역 스타일 상수
const MODAL_STYLES = {
    row: `display: grid; grid-template-columns: 120px repeat(3, 1fr); align-items: center; padding: 6px 0;`,
    jpFont: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    val: (isJa) => `text-align: center; font-family: ${isJa ? MODAL_STYLES.jpFont : 'monospace'}; font-weight: bold; line-height: 1.2;`,
    content: `max-width: 380px; padding: 20px;`,
    header: `display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;`
};

/**
 * 스탯 상세 내역 모달 표시
 */
export function showStatDetailModal(breakdown) {
    const isJa = state.currentLang === 'ja';
    const modalId = 'stat-detail-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div'); modal.id = modalId; 
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const renderRow = (label, values, isTotal = false, isBase = false, subValues = null) => {
        const getValHtml = (val, sub, color) => {
            const hasSub = sub !== null && sub !== undefined;
            return `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    ${hasSub ? `<span style="font-size: 0.6rem; color: #999; margin-bottom: -2px; opacity: 0.8;">${Number(sub || 0).toFixed(1)}%</span>` : ''}
                    <span style="${MODAL_STYLES.val(isJa)} color: ${color}; font-size: ${isTotal ? '1rem' : '0.85rem'};">${Math.round(val || 0)}</span>
                </div>`;
        };

        return `
            <div class="stat-detail-row" style="${MODAL_STYLES.row} ${isTotal ? 'border-top: 2px solid #ff4d8d; margin-top: 8px; padding-top: 10px;' : (isBase ? 'background: #fdf2f7; border-bottom: 2px solid #ff4d8d; margin-bottom: 5px;' : 'border-bottom: 1px solid #f5f5f5;')} position: relative;">
                <span style="color: #333; font-weight: ${isTotal || isBase ? 'bold' : 'normal'}; padding-left: 5px; font-size: 0.85rem;">${label}</span>
                ${getValHtml(values?.vocal, subValues?.vocal, '#ff4d8d')}
                ${getValHtml(values?.dance, subValues?.dance, '#46a4f3')}
                ${getValHtml(values?.visual, subValues?.visual, '#fcc75e')}
            </div>`;
    };

    const bonusTotal = {
        vocal: (breakdown.idol.vocal || 0) + (breakdown.supportFixed.vocal || 0) + (breakdown.supportPercent.vocal || 0) + (breakdown.item?.vocal || 0),
        dance: (breakdown.idol.dance || 0) + (breakdown.supportFixed.dance || 0) + (breakdown.supportPercent.dance || 0) + (breakdown.item?.dance || 0),
        visual: (breakdown.idol.visual || 0) + (breakdown.supportFixed.visual || 0) + (breakdown.supportPercent.visual || 0) + (breakdown.item?.visual || 0)
    };

    const allBonusSum = Math.round(bonusTotal.vocal + bonusTotal.dance + bonusTotal.visual);

    modal.innerHTML = `
        <div class="modal-content" style="${MODAL_STYLES.content}">
            <div class="modal-header" style="${MODAL_STYLES.header}">
                <h3 style="margin: 0; color: #ff4d8d; font-size: 1rem;">
                    ${isJa ? 'ステータス詳細' : '스탯 상세 내역'} 
                    <span style="font-size: 0.8rem; color: #666; font-weight: normal; margin-left: 5px;">(+${allBonusSum})</span>
                </h3>
                <span class="modal-close" style="cursor: pointer; font-size: 24px; color: #aaa;" onclick="document.getElementById('stat-detail-modal').style.display='none'">&times;</span>
            </div>
            <div class="stat-detail-header" style="${MODAL_STYLES.row} border-bottom: 1px solid #eee; margin-bottom: 2px; font-weight: bold; font-size: 0.8rem; color: #666;">
                <span></span>
                <span style="text-align: center; color: #ff4d8d;">${isJa ? 'Vo' : '보컬'}</span>
                <span style="text-align: center; color: #46a4f3;">${isJa ? 'Da' : '댄스'}</span>
                <span style="text-align: center; color: #fcc75e;">${isJa ? 'Vi' : '비주얼'}</span>
            </div>
            <div class="stat-detail-body">
                ${renderRow(isJa ? 'レッスン・試験' : '레슨/시험', breakdown.base, false, true)}
                <div style="font-size: 0.65rem; color: #999; margin: 8px 0 4px 5px; font-weight: bold;">${isJa ? '▼ ボーナス' : '▼ 보너스'}</div>
                ${renderRow(isJa ? 'アイドル(%)' : '아이돌 (%)', breakdown.idol, false, false, breakdown.idol.percent)}
                ${renderRow(isJa ? 'サ포카(固定)' : '서포트 (고정)', breakdown.supportFixed, false, false, null)}
                ${renderRow(isJa ? 'サ포카(%)' : '서포트 (%)', breakdown.supportPercent, false, false, breakdown.supportPercent.factors)}
                ${(breakdown.item?.vocal || breakdown.item?.dance || breakdown.item?.visual) ? renderRow(isJa ? 'アイテム' : '아이템 보너스', breakdown.item, false, false, null) : ''}
                ${renderRow(isJa ? 'ボーナス合計' : '최종 보너스 합계', bonusTotal, true, false, null)}
            </div>
        </div>`;

    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    history.pushState({ modalOpen: modalId }, "");
}

/**
 * 서포트 카드 선택 패널 렌더링
 */
export function renderSidePanelContent(panel, selectedPlan) {
    const filtered = cardList.filter(c => 
        (c.plan === selectedPlan || c.plan === 'free') && 
        c.rarity !== 'R' && 
        c.type !== 'assist' &&
        !state.disabledCards[c.id]
    );
    const renderCol = (type) => filtered.filter(c => c.type === type).map(c => {
        const lb = state.supportLB[c.id] || 0;
        return `
            <div class="side-card-item" data-id="${c.id}">
                <img src="images/support/${c.id}.webp" onerror="this.src='icons/card.png'">
                <img src="images/support/${c.id}_card.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_item.webp'; this.onerror=null;">
                <div class="calc-card-stars">${Array.from({length:4}, (_, i) => `<img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div>
                <div class="card-bonus-overlay"><span class="bonus-val"></span></div>
                <div class="info-btn">i</div>
            </div>`;
    }).join('');

    panel.innerHTML = `
        <div class="side-panel-tabs">
            <div class="panel-tab-item"><img src="icons/vocal.png"></div>
            <div class="panel-tab-item"><img src="icons/dance.png"></div>
            <div class="panel-tab-item"><img src="icons/visual.png"></div>
        </div>
        <div class="side-panel-content">
            <div class="calc-spinner-overlay" id="calc-side-spinner-overlay"><div class="calc-spinner"></div></div>
            <div class="side-panel-column" data-type="vocal">${renderCol('vocal')}</div>
            <div class="side-panel-column" data-type="dance">${renderCol('dance')}</div>
            <div class="side-panel-column" data-type="visual">${renderCol('visual')}</div>
        </div>`;
}

/**
 * 서포트 카드 패널 토글
 */
export function toggleSupportCardPanel(selectedPlan, refreshAll) {
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
                const cardId = item.dataset.id, isSelected = item.classList.contains('selected');
                const plan = calcStore.planType;
                let currentPlanCards = calcStore.planCards[plan] || [];

                if (isSelected) { 
                    item.classList.remove('selected'); delete item.dataset.selectTime;
                    calcStore.planCards[plan] = currentPlanCards.filter(id => id !== cardId);
                    if (calcStore.cardChecked[cardId]) delete calcStore.cardChecked[cardId];
                } else {
                    if (currentPlanCards.length >= 6) { 
                        const sorted = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0));
                        const oldest = sorted[0];
                        if (oldest) {
                            oldest.classList.remove('selected'); delete oldest.dataset.selectTime;
                            calcStore.planCards[plan] = calcStore.planCards[plan].filter(id => id !== oldest.dataset.id);
                        }
                    }
                    item.classList.add('selected'); item.dataset.selectTime = Date.now();
                    calcStore.planCards[plan].push(cardId);
                    calcStore.cardChecked[cardId] = false;
                }
                calcStore.save();
                updateSelectedCardsUI(calcStore); 
                refreshAll();
            }
        });
    }

    if (window.innerWidth <= 768 && !overlay) { 
        overlay = document.createElement('div'); overlay.id = 'panel-overlay'; overlay.className = 'panel-overlay'; 
        document.body.appendChild(overlay); overlay.onclick = closeSupportCardPanel; 
    }
    
    renderSidePanelContent(panel, selectedPlan);
    const planCards = calcStore.planCards[selectedPlan] || [];
    planCards.forEach(id => {
        const item = panel.querySelector(`.side-card-item[data-id="${id}"]`);
        if (item) { item.classList.add('selected'); item.dataset.selectTime = Date.now(); }
    });
    updateSelectedCardsUI(calcStore);

    requestAnimationFrame(() => {
        panel.classList.add('open'); if (overlay) overlay.classList.add('show');
        setTimeout(() => { 
            try { refreshAll(); } catch (err) { console.error(err); }
            finally { document.getElementById('calc-side-spinner-overlay')?.remove(); }
        }, 150);
    });
}

export function closeSupportCardPanel(isPopState = false) {
    const panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (panel?.classList.contains('open')) { 
        panel.classList.remove('open'); 
        if (overlay) overlay.classList.remove('show'); 
        if (!isPopState && window.innerWidth <= 768 && history.state?.panelOpen) history.back(); 
    }
}
window.closeSupportCardPanel = closeSupportCardPanel;

/**
 * 스킬 카드 선택(조정) 모달
 */
export function showOtherTuneModal(refreshAll) {
    const activePlan = calcStore.planType;
    const selectedSkills = calcStore.planSkills[activePlan] || {};
    const counts = getTriggerCounts(calcStore);
    const cardGroups = [];
    const rarities = ['r', 'sr', 'ssr'];
    if (calcStore.type === 'hajime') rarities.push('legend');

    const allCardIds = Object.keys(skillCardList);
    rarities.forEach(r => {
        const planCards = allCardIds
            .filter(id => id.startsWith(`${activePlan}-${r}`) && !id.endsWith('alt'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+$/)[0]);
                const numB = parseInt(b.match(/\d+$/)[0]);
                return numA - numB;
            });
        planCards.forEach(baseId => {
            const group = [baseId];
            if (skillCardList[`${baseId}alt`]) group.push(`${baseId}alt`);
            cardGroups.push(group);
        });
        if (r !== 'legend') {
            const freeCards = allCardIds
                .filter(id => id.startsWith(`free-${r}`))
                .sort((a, b) => {
                    const numA = parseInt(a.match(/\d+$/)[0]);
                    const numB = parseInt(b.match(/\d+$/)[0]);
                    return numA - numB;
                });
            freeCards.forEach(id => cardGroups.push([id]));
        }
    });

    const modal = document.createElement('div');
    modal.className = 'modal'; 
    modal.style.display = 'flex'; 
    modal.style.zIndex = '40000';
    modal.addEventListener('mousedown', (e) => e.stopPropagation());
    modal.addEventListener('click', (e) => e.stopPropagation());
    
    const renderCardItem = (id) => {
        if (id === 'trouble') {
            const tCount = counts.total.get_t || 0;
            return `
                <div class="tune-card-item selected" data-id="trouble" style="pointer-events: none; opacity: 0.9; filter: saturate(1.2);">
                    <img src="icons/cal/card/trouble.webp">
                    <div class="card-count-badge ${tCount > 1 ? '' : 'hidden'}">x${tCount}</div>
                </div>`;
        }
        const skill = skillCardList[id] || {}, count = selectedSkills[id] || 0, isSelected = count > 0;
        return `
            <div class="tune-card-item ${isSelected ? 'selected' : ''}" data-id="${id}" ${skill.multi ? 'data-multi="true"' : ''}>
                <img src="icons/cal/card/${id}.webp" onerror="this.parentElement.style.display='none';">
                <div class="card-count-badge ${count > 1 ? '' : 'hidden'}">x${count}</div>
                <div class="card-reset-btn ${isSelected && skill.multi ? '' : 'hidden'}">×</div>
            </div>`;
    };

    if (counts.total.get_t > 0) cardGroups.unshift(['trouble']);

    const isJa = state.currentLang === 'ja';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; width: 500px; max-height: 80vh; padding: 12px; display: flex; flex-direction: column; position: relative; box-sizing: border-box;">
            <h3 id="modal-tune-title" style="margin-top: 0; margin-bottom: 12px; text-align: center; color: #9c27b0; font-size: 1rem;"></h3>
            <div class="tune-card-grid" style="flex: 1; overflow-y: auto;">${cardGroups.map(g => g.length > 1 ? `<div class="tune-card-group-box" data-group="${g.join(',')}">${g.map(renderCardItem).join('')}</div>` : renderCardItem(g[0])).join('')}</div>
            <div style="display: flex; gap: 8px; margin-top: 12px; width: 100%; box-sizing: border-box;">
                <button class="primary-btn" id="reset-all-skills" style="flex: 1; background: #666; padding: 8px 4px; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; min-width: 0;">${isJa ? '一括初期化' : '전체 초기화'}</button>
                <button class="primary-btn" id="close-tune-modal" style="flex: 1; background: #9c27b0; padding: 8px 4px; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; min-width: 0;">${isJa ? '閉じる' : '닫기'}</button>
            </div>
        </div>`;

    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const updateTitle = () => {
        const counts = getTriggerCounts(calcStore);
        const boardGetCount = counts.total.get || 0;
        const currentPlan = calcStore.planType;
        const skills = calcStore.planSkills[currentPlan] || {};
        let total = Object.values(skills).reduce((a, b) => a + b, 0);
        total += (counts.total.get_t || 0);
        const selectedIds = calcStore.planCards[currentPlan] || [];
        selectedIds.forEach(id => {
            if (calcStore.cardChecked[id]) {
                const card = cardList.find(c => c.id === id);
                if (card && card.have?.startsWith('card_')) total++;
            }
        });
        const titleEl = document.getElementById('modal-tune-title');
        if (titleEl) {
            const planLabel = isJa ? (currentPlan === 'sense' ? 'センス' : (currentPlan === 'logic' ? 'ロジック' : 'アノマリー')) : currentPlan.toUpperCase();
            titleEl.textContent = isJa ? `${planLabel}カード選択 (${total} / ${boardGetCount})` : `${currentPlan.toUpperCase()} 카드 선택 (${total} / ${boardGetCount})`;
        }
    };
    updateTitle();

    modal.querySelectorAll('.tune-card-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            const id = item.dataset.id, skill = skillCardList[id] || {}, resetBtn = e.target.closest('.card-reset-btn');
            const currentPlan = calcStore.planType;
            if (!calcStore.planSkills[currentPlan]) calcStore.planSkills[currentPlan] = {};
            const skills = calcStore.planSkills[currentPlan];
            if (resetBtn) delete skills[id];
            else {
                const groupBox = item.closest('.tune-card-group-box');
                if (groupBox) groupBox.dataset.group.split(',').forEach(gid => { if (gid !== id) delete skills[gid]; });
                if (skill.multi) skills[id] = (skills[id] || 0) + 1;
                else if (skills[id]) delete skills[id]; else skills[id] = 1;
            }
            calcStore.save(); refreshAll(); updateTitle();
            modal.querySelectorAll('.tune-card-item').forEach(el => {
                const cid = el.dataset.id; if (cid === 'trouble') return;
                const count = skills[cid] || 0;
                el.classList.toggle('selected', count > 0);
                const badge = el.querySelector('.card-count-badge');
                if (badge) { badge.textContent = `x${count}`; badge.classList.toggle('hidden', count <= 1); }
                const rb = el.querySelector('.card-reset-btn');
                if (rb) rb.classList.toggle('hidden', count === 0 || !skillCardList[cid]?.multi);
            });
        };
    });

    document.getElementById('reset-all-skills').onclick = () => {
        const resetConfirm = isJa ? '初期化しますか？' : '초기화할까요?';
        if (!confirm(resetConfirm)) return;
        calcStore.planSkills[activePlan] = {}; calcStore.save(); refreshAll(); updateTitle();
        modal.querySelectorAll('.tune-card-item').forEach(el => {
            const cid = el.dataset.id; if (cid === 'trouble') return;
            el.classList.remove('selected');
            const badge = el.querySelector('.card-count-badge'); if (badge) badge.classList.add('hidden');
            const rb = el.querySelector('.card-reset-btn'); if (rb) rb.classList.add('hidden');
        });
    };
    document.getElementById('close-tune-modal').onclick = () => modal.remove();
}
