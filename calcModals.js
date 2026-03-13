// calcModals.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCounts, calculateTotals } from './calcLogic.js';
import { updateSelectedCardsUI, getIdolDisplayColor } from './calcUI.js';
import { calcStore } from './calcStore.js';

// 모달 및 상세 내역 스타일 상수
const MODAL_STYLES = {
    row: `display: grid; grid-template-columns: 100px repeat(4, 1fr); align-items: center; padding: 6px 0;`,
    jpFont: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    val: (isJa) => `text-align: center; font-family: ${isJa ? MODAL_STYLES.jpFont : 'monospace'}; font-weight: bold; line-height: 1.2;`,
    content: `max-width: 420px; padding: 20px;`,
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
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const renderRow = (label, values, subValues = null, rowClass = '') => {
        const rowSum = Math.floor((values?.vocal || 0) + (values?.dance || 0) + (values?.visual || 0));

        const getCell = (val, sub, colorClass) => {
            const hasSub = sub !== null && sub !== undefined;
            return `
                <div class="stat-val-cell ${colorClass}">
                    ${hasSub ? `<span class="stat-sub-val">${Number(sub || 0).toFixed(1)}%</span>` : ''}
                    <span class="stat-main-val">${Math.floor(val || 0)}</span>
                </div>`;
        };

        return `
            <div class="stat-detail-row ${rowClass}">
                <span class="stat-detail-label">${label}</span>
                ${getCell(values?.vocal, subValues?.vocal, 'color-vo')}
                ${getCell(values?.dance, subValues?.dance, 'color-da')}
                ${getCell(values?.visual, subValues?.visual, 'color-vi')}
                <div class="stat-sum-cell">${rowSum}</div>
            </div>`;
    };

    const bonusTotal = {
        vocal: (breakdown.idol.vocal || 0) + (breakdown.supportFixed.vocal || 0) + (breakdown.supportPercent.vocal || 0) + (breakdown.item?.vocal || 0) + (breakdown.memory?.fixed?.vocal || 0) + (breakdown.memory?.percent?.vocal || 0),
        dance: (breakdown.idol.dance || 0) + (breakdown.supportFixed.dance || 0) + (breakdown.supportPercent.dance || 0) + (breakdown.item?.dance || 0) + (breakdown.memory?.fixed?.dance || 0) + (breakdown.memory?.percent?.dance || 0),
        visual: (breakdown.idol.visual || 0) + (breakdown.supportFixed.visual || 0) + (breakdown.supportPercent.visual || 0) + (breakdown.item?.visual || 0) + (breakdown.memory?.fixed?.visual || 0) + (breakdown.memory?.percent?.visual || 0)
    };

    modal.innerHTML = `
        <div class="stat-detail-modal-content">
            <span class="stat-detail-close" onclick="document.getElementById('stat-detail-modal').style.display='none'">&times;</span>
            
            <div class="stat-detail-grid">
                <div class="stat-grid-header">
                    <span class="header-label">${isJa ? '詳細項目' : '상세 내역'}</span>
                    <span class="color-vo">${isJa ? 'Vo' : '보컬'}</span>
                    <span class="color-da">${isJa ? 'Da' : '댄스'}</span>
                    <span class="color-vi">${isJa ? 'Vi' : '비주얼'}</span>
                    <span style="border-left: 1px solid transparent;">Total</span>
                </div>
                
                ${renderRow(isJa ? 'アイドル(固定)' : '아이돌 (고정)', breakdown.idolBase, null, 'row-base')}
                ${(calcStore.type === 'hajime' || calcStore.type === 'nia') ? `
                    ${renderRow(isJa ? '授業' : '수업', breakdown.class, null, 'row-base')}
                    ${renderRow(isJa ? '試験' : '시험', breakdown.exam, null, 'row-base')}
                    ${renderRow(isJa ? 'レッスン' : '레슨', breakdown.lesson, null, 'row-base')}
                ` : `
                    ${renderRow(isJa ? '営業' : '영업', breakdown.class, null, 'row-base')}
                    ${renderRow(isJa ? 'レッスン/オーディション' : '레슨/오디션', breakdown.base, null, 'row-base')}
                `}
                
                ${renderRow(`<span id="bonus-toggle-icon" style="margin-right: 4px;">▼</span>${isJa ? 'ボーナス合計' : '보너스 합계'}`, bonusTotal, null, 'row-bonus-total')}
                
                <div id="bonus-sub-items">
                    ${renderRow(isJa ? 'アイドル(%)' : '아이돌 (%)', breakdown.idol, breakdown.idol.percent, 'row-sub-item')}
                    ${renderRow(isJa ? 'サポート(%)' : '서포트 (%)', breakdown.supportPercent, breakdown.supportPercent.factors, 'row-sub-item')}
                    ${renderRow(isJa ? 'サポート(固定)' : '서포트 (고정)', breakdown.supportFixed, null, 'row-sub-item')}
                    ${renderRow(isJa ? 'メモリー(%)' : '메모리 (%)', breakdown.memory?.percent, breakdown.memory?.percent?.factors, 'row-sub-item')}
                    ${renderRow(isJa ? 'メモリー(固定)' : '메모리 (고정)', breakdown.memory?.fixed, null, 'row-sub-item')}
                    ${renderRow(isJa ? 'Pアイテム' : (calcStore.type === 'nia' ? 'p아이템 (55%)' : 'p아이템'), breakdown.item, null, 'row-sub-item')}
                </div>
            </div>
            ${renderRow(isJa ? '総合計' : '최종 합계', {
        vocal: breakdown.base.vocal + breakdown.idolBase.vocal + bonusTotal.vocal,
        dance: breakdown.base.dance + breakdown.idolBase.dance + bonusTotal.dance,
        visual: breakdown.base.visual + breakdown.idolBase.visual + bonusTotal.visual
    }, null, 'row-total')}
        </div>`;

    // 종합계 수치 직접 수정 (breakdown.class + lesson + exam 포함)
    const finalTotalRow = modal.querySelector('.row-total');
    if (finalTotalRow) {
        const baseVo = (breakdown.lesson?.vocal || 0) + (breakdown.exam?.vocal || 0);
        const baseDa = (breakdown.lesson?.dance || 0) + (breakdown.exam?.dance || 0);
        const baseVi = (breakdown.lesson?.visual || 0) + (breakdown.exam?.visual || 0);
        const tVo = Math.floor(baseVo + breakdown.idolBase.vocal + (breakdown.class?.vocal || 0) + bonusTotal.vocal);
        const tDa = Math.floor(baseDa + breakdown.idolBase.dance + (breakdown.class?.dance || 0) + bonusTotal.dance);
        const tVi = Math.floor(baseVi + breakdown.idolBase.visual + (breakdown.class?.visual || 0) + bonusTotal.visual);
        const tSum = tVo + tDa + tVi;

        const cells = finalTotalRow.querySelectorAll('.stat-main-val');
        if (cells.length >= 3) {
            cells[0].textContent = tVo;
            cells[1].textContent = tDa;
            cells[2].textContent = tVi;
        }
        const sumCell = finalTotalRow.querySelector('.stat-sum-cell');
        if (sumCell) sumCell.textContent = tSum;
    }

    // 토글 이벤트 리스너 추가
    const bonusRow = modal.querySelector('.row-bonus-total');
    const subItemsContainer = modal.querySelector('#bonus-sub-items');
    const toggleIcon = modal.querySelector('#bonus-toggle-icon');

    if (bonusRow && subItemsContainer && toggleIcon) {
        bonusRow.style.cursor = 'pointer';
        bonusRow.addEventListener('click', () => {
            const isCollapsing = subItemsContainer.style.display !== 'none';
            if (isCollapsing) {
                subItemsContainer.style.display = 'none';
                toggleIcon.textContent = '▶';
                bonusRow.classList.add('collapsed');
            } else {
                subItemsContainer.style.display = 'block';
                toggleIcon.textContent = '▼';
                bonusRow.classList.remove('collapsed');
            }
        });
    }

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
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');
    const planCards = calcStore.planCards[selectedPlan] || [];

    const renderCol = (type) => filtered.filter(c => c.type === type).map(c => {
        const lb = state.supportLB[c.id] || 0;
        const isSelected = planCards.includes(c.id);
        const style = isSelected ? `style="border-color: ${idolColor}; border-width: 2px;"` : '';
        return `
            <div class="side-card-item ${isSelected ? 'selected' : ''}" data-id="${c.id}" ${style}>
                <img src="images/support/${c.id}.webp" onerror="this.src='icons/card.png'">
                <img src="images/support/${c.id}_card.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_item.webp'; this.onerror=null;">
                <div class="calc-card-stars">${Array.from({ length: 4 }, (_, i) => `<img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div>
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
                const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

                if (isSelected) {
                    item.classList.remove('selected'); delete item.dataset.selectTime;
                    item.style.borderColor = '#ddd';
                    calcStore.planCards[plan] = currentPlanCards.filter(id => id !== cardId);
                    if (calcStore.cardChecked[cardId]) delete calcStore.cardChecked[cardId];
                } else {
                    if (currentPlanCards.length >= 6) {
                        const sorted = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0));
                        const oldest = sorted[0];
                        if (oldest) {
                            oldest.classList.remove('selected'); delete oldest.dataset.selectTime;
                            oldest.style.borderColor = '#ddd';
                            calcStore.planCards[plan] = calcStore.planCards[plan].filter(id => id !== oldest.dataset.id);
                        }
                    }
                    item.classList.add('selected'); item.dataset.selectTime = Date.now();
                    item.style.borderColor = idolColor;
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

export function showMemorySelectModal(slotIndex, refreshAll) {
    const isJa = state.currentLang === 'ja';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '40000';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.width = '300px';
    content.style.padding = '15px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';


    // calcStore.memories[slotIndex]는 이제 배열 형태여야 함
    let currentSelections = Array.isArray(calcStore.memories[slotIndex]) ? [...calcStore.memories[slotIndex]] : [];

    // 비우기 버튼 (해제)
    const clearBtn = document.createElement('div');
    clearBtn.style.padding = '10px';
    clearBtn.style.background = '#f5f5f5';
    clearBtn.style.borderRadius = '6px';
    clearBtn.style.marginBottom = '8px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.textAlign = 'center';
    clearBtn.style.fontWeight = 'bold';
    clearBtn.style.color = '#666';
    clearBtn.textContent = isJa ? '全体解除' : '전체 해제';
    clearBtn.onclick = () => {
        currentSelections = [];
        Array.from(content.querySelectorAll('.memory-opt-btn')).forEach(el => {
            el.style.background = '#fff';
            el.style.borderColor = '#ddd';
        });
    };

    // 모달 닫기 로직: 닫을 때 스토어 저장 및 새로고침
    const closeModalAndSave = () => {
        calcStore.memories[slotIndex] = currentSelections;
        calcStore.save();
        refreshAll();
        modal.remove();
    };

    // 옵션 리스트 렌더링
    import('./calcData.js').then(({ memoryOptions }) => {
        if (!memoryOptions) return;

        const colsContainer = document.createElement('div');
        colsContainer.style.display = 'grid';
        colsContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
        colsContainer.style.gap = '8px';
        content.appendChild(colsContainer);

        const columns = { vocal: null, dance: null, visual: null };
        const headers = { vocal: isJa ? 'ボーカル' : '보컬', dance: isJa ? 'ダンス' : '댄스', visual: isJa ? 'ビジュアル' : '비주얼' };
        const colors = { vocal: '#ff4d8d', dance: '#46a4f3', visual: '#fcc75e' };
        const bgColors = { vocal: '#fff0f5', dance: '#eef7ff', visual: '#fffdf0' };

        Object.keys(columns).forEach(type => {
            const col = document.createElement('div');
            col.style.display = 'flex';
            col.style.flexDirection = 'column';
            col.style.gap = '6px';

            const title = document.createElement('div');
            title.style.textAlign = 'center';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '0.9rem';
            title.style.color = colors[type];
            title.style.marginBottom = '4px';
            title.textContent = headers[type];
            col.appendChild(title);

            columns[type] = col;
            colsContainer.appendChild(col);
        });

        Object.keys(memoryOptions).forEach(key => {
            const opt = memoryOptions[key];
            const type = opt.type;
            if (!columns[type]) return;

            const btn = document.createElement('div');
            btn.className = 'memory-opt-btn';
            btn.style.padding = '8px 4px';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.textAlign = 'center';

            const isSelected = currentSelections.includes(key);
            btn.style.background = isSelected ? bgColors[type] : '#fff';
            btn.style.borderColor = isSelected ? colors[type] : '#ddd';

            const shortText = (opt.label_ko || '').split(' ')[1] || opt.label_ko;
            btn.innerHTML = `<div style="font-weight: bold; color: #333; font-size: 0.85rem;">${shortText}</div>`;

            btn.onclick = () => {
                const idx = currentSelections.indexOf(key);
                if (idx > -1) {
                    currentSelections.splice(idx, 1);
                    btn.style.background = '#fff';
                    btn.style.borderColor = '#ddd';
                } else {
                    // 같은 type의 기존 선택 제거
                    const existIdx = currentSelections.findIndex(k => memoryOptions[k].type === type);
                    if (existIdx > -1) {
                        const oldKey = currentSelections[existIdx];
                        currentSelections.splice(existIdx, 1);
                        // DOM에서 이전 버튼 스타일 초기화
                        const oldBtn = Array.from(columns[type].children).find(child => child.dataset.key === oldKey);
                        if (oldBtn) {
                            oldBtn.style.background = '#fff';
                            oldBtn.style.borderColor = '#ddd';
                        }
                    }

                    currentSelections.push(key);
                    btn.style.background = bgColors[type];
                    btn.style.borderColor = colors[type];

                    // 3개 선택 시 자동 닫기
                    if (currentSelections.length === 3) {
                        setTimeout(() => {
                            closeModalAndSave();
                        }, 100);
                    }
                }
            };
            btn.dataset.key = key; // 기존 버튼을 찾기 위해 key 저장
            columns[type].appendChild(btn);
        });

        // 비우기 버튼 (해제)을 옵션 리스트 아래로 이동
        clearBtn.style.marginTop = '12px';
        content.appendChild(clearBtn);
    });

    modal.appendChild(content);
    modal.onclick = (e) => { if (e.target === modal) closeModalAndSave(); };


    document.body.appendChild(modal);
}
