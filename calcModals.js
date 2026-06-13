// calcModals.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { produceList } from './producedata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCounts, calculateTotals } from './calcLogic.js';
import { updateSelectedCardsUI, getIdolDisplayColor, getNormalizedSelectedCardIds, getParsedItemEffectsText } from './calcUI.js';
import { calcStore } from './calcStore.js';
import { translate } from './utils.js';
import { abilityData } from './abilitydata.js';
import { hifParameterLimitBonuses } from './calcData.js';

const t = (key, params = {}, fallback = '') => translate(key, params, fallback);

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
    const closeStatDetailModal = (isPopState = false) => {
        const statModal = document.getElementById(modalId);
        if (!statModal) return;
        if (!isPopState) {
            history.back();
            return;
        }
        statModal.style.display = 'none';
        statModal.classList.add('hidden');
    };
    window.closeStatDetailModal = closeStatDetailModal;

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
        vocal: (breakdown.idol.vocal || 0) + (breakdown.supportPercent.vocal || 0) + (calcStore.type === 'nia' ? (breakdown.item?.perc?.vocal || 0) : 0) + (breakdown.memory?.percent?.vocal || 0) + (breakdown.hif?.percent?.vocal || 0),
        dance: (breakdown.idol.dance || 0) + (breakdown.supportPercent.dance || 0) + (calcStore.type === 'nia' ? (breakdown.item?.perc?.dance || 0) : 0) + (breakdown.memory?.percent?.dance || 0) + (breakdown.hif?.percent?.dance || 0),
        visual: (breakdown.idol.visual || 0) + (breakdown.supportPercent.visual || 0) + (calcStore.type === 'nia' ? (breakdown.item?.perc?.visual || 0) : 0) + (breakdown.memory?.percent?.visual || 0) + (breakdown.hif?.percent?.visual || 0)
    };

    const getAbilityName = (key) => {
        if (key === 'item_effect') {
            return state.currentLang === 'en' ? 'P-Item Effect' : (state.currentLang === 'ja' ? 'Pアイテム効果' : 'P아이템 효과');
        }
        if (key === 'event') {
            return state.currentLang === 'en' ? 'Event' : (state.currentLang === 'ja' ? 'イベント' : '이벤트');
        }
        const ab = abilityData[key];
        if (ab && ab.name && ab.name[state.currentLang]) {
            return ab.name[state.currentLang];
        }
        return key;
    };

    const hasSupportFixedFactors = breakdown.supportFixed && breakdown.supportFixed.factors && Object.keys(breakdown.supportFixed.factors).length > 0;
    const supportFixedFactorsHtml = hasSupportFixedFactors ? Object.keys(breakdown.supportFixed.factors).sort((a, b) => {
        if (a === 'fixedparam') return -1;
        if (b === 'fixedparam') return 1;
        return 0;
    }).map(key => {
        const factor = breakdown.supportFixed.factors[key];
        if (factor.vocal === 0 && factor.dance === 0 && factor.visual === 0) return '';
        return renderRow(getAbilityName(key), factor, null, 'row-sub-item');
    }).join('') : '';

    modal.innerHTML = `
        <div class="stat-detail-modal-content">
            <span class="stat-detail-close">&times;</span>
            <div class="stat-detail-grid">
                <div class="stat-grid-header">
                    <span class="header-label"></span>
                    <span class="color-vo"><img src="icons/vocal.webp" class="stat-detail-header-icon"></span>
                    <span class="color-da"><img src="icons/dance.webp" class="stat-detail-header-icon"></span>
                    <span class="color-vi"><img src="icons/visual.webp" class="stat-detail-header-icon"></span>
                    <span style="border-left: 1px solid transparent;"></span>
                </div>
                
                ${renderRow(t('calc_detail_idol_fixed'), breakdown.idolBase, null, 'row-base')}
                ${hasSupportFixedFactors ? renderRow(`<span id="support-fixed-toggle-icon" style="margin-right: 4px;">▶</span>${t('calc_detail_support_fixed')}`, breakdown.supportFixed, null, 'row-base row-support-fixed-total') : renderRow(t('calc_detail_support_fixed'), breakdown.supportFixed, null, 'row-base')}
                ${hasSupportFixedFactors ? `<div id="support-fixed-sub-items">${supportFixedFactorsHtml}</div>` : ''}
                ${renderRow(t('calc_detail_memory_fixed'), breakdown.memory?.fixed, null, 'row-base')}
                ${calcStore.type === 'hif' ? renderRow(t('calc_detail_hif_fixed'), breakdown.hif?.fixed, null, 'row-base') : ''}
                ${calcStore.type !== 'hif' ? renderRow(calcStore.type === 'nia' ? t('calc_detail_pitem_nia_base') : t('calc_detail_pitem'), breakdown.item?.base, null, 'row-base') : ''}
                
                ${calcStore.type === 'hajime' ? `
                    ${renderRow(t('calc_detail_class'), breakdown.class, null, 'row-base')}
                    ${renderRow(t('calc_detail_exam'), breakdown.exam, null, 'row-base')}
                    ${renderRow(t('calc_detail_lesson'), breakdown.lesson, null, 'row-base')}
                ` : (calcStore.type === 'nia' ? `
                    ${renderRow(t('calc_detail_promotion'), breakdown.class, null, 'row-base')}
                    ${renderRow(t('calc_detail_audition'), breakdown.exam, null, 'row-base')}
                    ${renderRow(t('calc_detail_lesson'), breakdown.lesson, null, 'row-base')}
                ` : `
                    ${renderRow(t('calc_detail_class'), breakdown.class, null, 'row-base')}
                    ${renderRow(t('calc_detail_selection_exam'), breakdown.exam, null, 'row-base')}
                    ${renderRow(t('calc_detail_lesson'), breakdown.lesson, null, 'row-base')}
                `)}
                
                ${renderRow(`<span id="bonus-toggle-icon" style="margin-right: 4px;">▶</span>${t('calc_detail_bonus_total')}`, bonusTotal, breakdown.totalPercs, 'row-bonus-total')}
                
                <div id="bonus-sub-items">
                    ${renderRow(t('calc_detail_idol_percent'), breakdown.idol, breakdown.idol.percent, 'row-sub-item')}
                    ${renderRow(t('calc_detail_support_percent'), breakdown.supportPercent, breakdown.supportPercent.factors, 'row-sub-item')}
                    ${renderRow(t('calc_detail_memory_percent'), breakdown.memory?.percent, breakdown.memory?.percent?.factors, 'row-sub-item')}
                    ${calcStore.type === 'nia' ? `
                        ${renderRow(t('calc_detail_pitem_nia_perc'), breakdown.item?.perc, null, 'row-sub-item')}
                    ` : ''}
                    ${calcStore.type === 'hif' ? renderRow(t('calc_detail_hif_percent'), breakdown.hif?.percent, breakdown.hif?.percent?.factors, 'row-sub-item') : ''}
                </div>
            </div>
            ${renderRow(t('calc_detail_final_total'), {
        vocal: breakdown.base.vocal + breakdown.idolBase.vocal + (breakdown.supportFixed?.vocal || 0) + (breakdown.memory?.fixed?.vocal || 0) + (breakdown.item?.base?.vocal || 0) + (breakdown.hif?.fixed?.vocal || 0) + bonusTotal.vocal,
        dance: breakdown.base.dance + breakdown.idolBase.dance + (breakdown.supportFixed?.dance || 0) + (breakdown.memory?.fixed?.dance || 0) + (breakdown.item?.base?.dance || 0) + (breakdown.hif?.fixed?.dance || 0) + bonusTotal.dance,
        visual: breakdown.base.visual + breakdown.idolBase.visual + (breakdown.supportFixed?.visual || 0) + (breakdown.memory?.fixed?.visual || 0) + (breakdown.item?.base?.visual || 0) + (breakdown.hif?.fixed?.visual || 0) + bonusTotal.visual
    }, null, 'row-total')}
        </div>`;

    // 종합계 수치 직접 수정 (breakdown.class + lesson + exam 포함)
    const finalTotalRow = modal.querySelector('.row-total');
    if (finalTotalRow) {
        const baseVo = (breakdown.lesson?.vocal || 0) + (breakdown.exam?.vocal || 0);
        const baseDa = (breakdown.lesson?.dance || 0) + (breakdown.exam?.dance || 0);
        const baseVi = (breakdown.lesson?.visual || 0) + (breakdown.exam?.visual || 0);
        const tVo = Math.floor(baseVo + breakdown.idolBase.vocal + (breakdown.supportFixed?.vocal || 0) + (breakdown.memory?.fixed?.vocal || 0) + (breakdown.item?.base?.vocal || 0) + (breakdown.class?.vocal || 0) + (breakdown.hif?.fixed?.vocal || 0) + bonusTotal.vocal);
        const tDa = Math.floor(baseDa + breakdown.idolBase.dance + (breakdown.supportFixed?.dance || 0) + (breakdown.memory?.fixed?.dance || 0) + (breakdown.item?.base?.dance || 0) + (breakdown.class?.dance || 0) + (breakdown.hif?.fixed?.dance || 0) + bonusTotal.dance);
        const tVi = Math.floor(baseVi + breakdown.idolBase.visual + (breakdown.supportFixed?.visual || 0) + (breakdown.memory?.fixed?.visual || 0) + (breakdown.item?.base?.visual || 0) + (breakdown.class?.visual || 0) + (breakdown.hif?.fixed?.visual || 0) + bonusTotal.visual);
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
        // 초기 상태를 닫힘(collapsed)으로 설정
        subItemsContainer.style.display = 'none';
        toggleIcon.textContent = '▶';
        bonusRow.classList.add('collapsed');

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

    const sfRow = modal.querySelector('.row-support-fixed-total');
    const sfSubItemsContainer = modal.querySelector('#support-fixed-sub-items');
    const sfToggleIcon = modal.querySelector('#support-fixed-toggle-icon');

    if (sfRow && sfSubItemsContainer && sfToggleIcon) {
        sfSubItemsContainer.style.display = 'none';
        sfToggleIcon.textContent = '▶';
        sfRow.classList.add('collapsed');
        sfRow.style.cursor = 'pointer';
        sfRow.addEventListener('click', () => {
            const isCollapsing = sfSubItemsContainer.style.display !== 'none';
            if (isCollapsing) {
                sfSubItemsContainer.style.display = 'none';
                sfToggleIcon.textContent = '▶';
                sfRow.classList.add('collapsed');
            } else {
                sfSubItemsContainer.style.display = 'block';
                sfToggleIcon.textContent = '▼';
                sfRow.classList.remove('collapsed');
            }
        });
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    modal.querySelector('.stat-detail-close').onclick = () => closeStatDetailModal();
    modal.onclick = (e) => { if (e.target === modal) closeStatDetailModal(); };
    history.pushState({ modalOpen: modalId }, "");
}

/**
 * 서포트 카드 선택 패널 렌더링
 */
export function renderSidePanelContent(panel, selectedPlan) {
    const planCards = calcStore.planCards[selectedPlan] || [];
    const filledCount = planCards.filter(id => id !== null).length;
    const isSelectingSixth = filledCount === 5 && planCards[5] === null;

    // 패널 자체에 상태 클래스 추가/제거 (CSS에서 활용)
    if (isSelectingSixth) panel.classList.add('is-selecting-sixth');
    else panel.classList.remove('is-selecting-sixth');

    const filtered = cardList.filter(c =>
        (c.plan === selectedPlan || c.plan === 'free') &&
        c.rarity !== 'R'
    );
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const renderCol = (type) => filtered.filter(c => c.type === type).map(c => {
        const rawLb = state.supportLB[c.id] || 0;
        const isSelected = planCards.includes(c.id);
        const isSixth = isSelected && planCards.indexOf(c.id) === 5;
        const lb = (isSelectingSixth && !isSelected) || isSixth ? 4 : rawLb;
        const cardColor = isSixth ? '#8FDDBA' : idolColor;
        const style = isSelected ? `style="border-color: ${cardColor}; border-width: 2px;"` : '';
        const isDisabled = state.disabledCards[c.id];

        return `
            <div class="side-card-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'is-disabled-card' : ''}" data-id="${c.id}" ${style}>
                <img src="images/support/thumb/${c.id}.webp" onerror="this.src='icons/card.png'">
                <img src="images/support/${c.id}_${c.have && c.have.startsWith('card') ? 'card' : 'item'}.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_${c.have && c.have.startsWith('card') ? 'item' : 'card'}.webp'; this.onerror=null;">
                <div class="calc-card-stars">${Array.from({ length: 4 }, (_, i) => `<img src="icons/flower.webp" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div>
                <div class="card-bonus-overlay"><span class="bonus-val"></span></div>
                <div class="info-btn">i</div>
            </div>`;
    }).join('');

    const renderAssistRow = () => filtered.filter(c => c.type === 'assist').map(c => {
        const rawLb = state.supportLB[c.id] || 0;
        const isSelected = planCards.includes(c.id);
        const isSixth = isSelected && planCards.indexOf(c.id) === 5;
        const lb = (isSelectingSixth && !isSelected) || isSixth ? 4 : rawLb;
        const cardColor = isSixth ? '#8FDDBA' : idolColor;
        const style = isSelected ? `style="border-color: ${cardColor}; border-width: 2px;"` : '';
        const isDisabled = state.disabledCards[c.id];

        return `
            <div class="side-card-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'is-disabled-card' : ''}" data-id="${c.id}" ${style}>
                <img src="images/support/thumb/${c.id}.webp" onerror="this.src='icons/card.png'">
                <img src="images/support/${c.id}_${c.have && c.have.startsWith('card') ? 'card' : 'item'}.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_${c.have && c.have.startsWith('card') ? 'item' : 'card'}.webp'; this.onerror=null;">
                <div class="calc-card-stars">${Array.from({ length: 4 }, (_, i) => `<img src="icons/flower.webp" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div>
                <div class="card-bonus-overlay"><span class="bonus-val"></span></div>
                <div class="info-btn">i</div>
            </div>`;
    }).join('');

    const assistCardsHtml = renderAssistRow();

    const tabsStyle = isSelectingSixth ? 'background: #8FDDBA; border-bottom-color: #eee;' : 'background: white; border-bottom-color: #eee;';
    const contentStyle = isSelectingSixth ? 'background: #8FDDBA;' : 'background: white;';

    panel.innerHTML = `
        <div class="side-panel-tabs" style="${tabsStyle} position: relative;">
            <div class="panel-tab-item"><img src="icons/vocal.webp"></div>
            <div class="panel-tab-item"><img src="icons/dance.webp"></div>
            <div class="panel-tab-item"><img src="icons/visual.webp"></div>
            ${isSelectingSixth ? `<span class="rental-badge" style="position: absolute; top: 2px; left: 6px; font-size: 8px; font-weight: bold; color: #fff; letter-spacing: 0.5px; z-index: 10; opacity: 0.8;">${t('calc_label_rental')}</span>` : ''}
        </div>
        <div class="side-panel-content" style="${contentStyle}">
            <div class="calc-spinner-overlay" id="calc-side-spinner-overlay"><div class="calc-spinner"></div></div>
            <div class="side-panel-column" data-type="vocal">${renderCol('vocal')}</div>
            <div class="side-panel-column" data-type="dance">${renderCol('dance')}</div>
            <div class="side-panel-column" data-type="visual">${renderCol('visual')}</div>
            ${assistCardsHtml ? `
            <div class="side-panel-assist-section">
                <div class="side-panel-assist-header">
                    <img src="icons/assist.webp" alt="Assist">
                    <span>Assist</span>
                </div>
                <div class="side-panel-assist-grid">${assistCardsHtml}</div>
            </div>` : ''}
        </div>
        ${assistCardsHtml ? `
        <div class="side-panel-assist-hint" aria-hidden="true">
            <img src="icons/assist.webp" alt="">
            <span class="assist-hint-arrow">▼</span>
        </div>` : ''}`;
}

function updateSupportPanelAssistHint(panel) {
    if (!panel) return;

    const content = panel.querySelector('.side-panel-content');
    const assistSection = panel.querySelector('.side-panel-assist-section');
    const hint = panel.querySelector('.side-panel-assist-hint');
    if (!content || !assistSection || !hint) return;

    const canScrollMore = content.scrollTop + content.clientHeight < content.scrollHeight - 8;
    const assistBelowViewport = assistSection.offsetTop > (content.scrollTop + content.clientHeight - 28);
    hint.classList.toggle('visible', canScrollMore && assistBelowViewport);
}

function setupSupportPanelAssistHint(panel) {
    if (!panel) return;

    const content = panel.querySelector('.side-panel-content');
    const hint = panel.querySelector('.side-panel-assist-hint');
    if (!content || !hint) return;

    if (panel._assistHintScrollHandler) {
        content.removeEventListener('scroll', panel._assistHintScrollHandler);
    }

    const update = () => updateSupportPanelAssistHint(panel);
    panel._assistHintScrollHandler = update;
    content.addEventListener('scroll', update, { passive: true });
    requestAnimationFrame(update);
    setTimeout(update, 180);
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
                if (card) window.showCardModal(card, (state.currentLang === 'en' && card.name_en ? card.name_en : (state.currentLang !== 'ko' && card.name_ja ? card.name_ja : card.name)), card.image || `images/support/${card.id}.webp`);
                return;
            }
            if (item) {
                const cardId = item.dataset.id, isSelected = item.classList.contains('selected');
                const plan = calcStore.planType;
                let currentPlanCards = calcStore.planCards[plan] || [];
                while (currentPlanCards.length < 6) currentPlanCards.push(null);
                const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

                if (isSelected) {
                    item.classList.remove('selected'); delete item.dataset.selectTime;
                    item.style.borderColor = '#ddd';
                    item.style.borderWidth = '';
                    item.style.boxShadow = '';
                    const idx = currentPlanCards.indexOf(cardId);
                    if (idx !== -1) currentPlanCards[idx] = null;
                    calcStore.planCards[plan] = currentPlanCards;

                    // 카드 해제 시 해당 카드의 체크박스 옵션들(이벤트, 강화, 체인지 등) 초기화
                    delete calcStore.cardEventChecked[cardId];
                    delete calcStore.cardExtraChecked[cardId];

                } else {
                    const emptyIdx = currentPlanCards.indexOf(null);
                    if (emptyIdx === -1) {
                        return;
                    }
                    item.classList.add('selected'); item.dataset.selectTime = Date.now();
                    item.style.borderColor = (emptyIdx === 5) ? '#8FDDBA' : idolColor;
                    currentPlanCards[emptyIdx] = cardId;
                    calcStore.planCards[plan] = currentPlanCards;


                    const selectedCardObj = cardList.find(c => c.id === cardId);
                    if (selectedCardObj && selectedCardObj.abilities && selectedCardObj.abilities.includes('sp_param20')) {
                        showTemporaryToast(t('calc_toast_sp_card_condition'));
                    }
                }
                calcStore.save();
                updateSelectedCardsUI(calcStore);

                const updatedPlanCards = calcStore.planCards[plan] || [];
                const updatedFilledCount = updatedPlanCards.filter(id => id !== null).length;
                const isNowSelectingSixth = updatedFilledCount === 5 && updatedPlanCards[5] === null;

                if (isNowSelectingSixth) panel.classList.add('is-selecting-sixth');
                else panel.classList.remove('is-selecting-sixth');

                const tabs = panel.querySelector('.side-panel-tabs');
                const content = panel.querySelector('.side-panel-content');
                if (tabs) {
                    tabs.style.background = isNowSelectingSixth ? '#8FDDBA' : 'white';
                    tabs.style.borderBottomColor = '#eee';
                    tabs.style.position = 'relative';

                    let badge = tabs.querySelector('.rental-badge');
                    if (isNowSelectingSixth) {
                        if (!badge) {
                            badge = document.createElement('span');
                            badge.className = 'rental-badge';
                            badge.textContent = t('calc_label_rental');
                            Object.assign(badge.style, {
                                position: 'absolute', top: '2px', left: '6px',
                                fontSize: '8px', fontWeight: 'bold', color: '#fff',
                                letterSpacing: '0.5px', zIndex: '10', opacity: '0.8'
                            });
                            tabs.appendChild(badge);
                        }
                    } else if (badge) {
                        badge.remove();
                    }
                }
                if (content) {
                    content.style.background = isNowSelectingSixth ? '#8FDDBA' : 'white';
                }

                panel.querySelectorAll('.side-card-item').forEach(el => {
                    const id = el.dataset.id;
                    const isSixth = updatedPlanCards.indexOf(id) === 5;
                    if (updatedPlanCards.includes(id)) {
                        el.style.borderColor = isSixth ? '#8FDDBA' : idolColor;
                        el.style.borderWidth = '2px';
                    } else {
                        el.style.borderColor = '#ddd';
                        el.style.borderWidth = '';
                    }
                    // Update star display for 6th slot mode
                    const isSelectedCard = updatedPlanCards.includes(id);
                    const rawLb = state.supportLB[id] || 0;
                    const displayLb = (isNowSelectingSixth && !isSelectedCard) || isSixth ? 4 : rawLb;
                    const stars = el.querySelectorAll('.calc-card-star');
                    stars.forEach((star, i) => {
                        if (i < displayLb) star.classList.add('active');
                        else star.classList.remove('active');
                    });
                });

                refreshAll();
            }
        });
    }

    if (window.innerWidth <= 768 && !overlay) {
        overlay = document.createElement('div'); overlay.id = 'panel-overlay'; overlay.className = 'panel-overlay';
        document.body.appendChild(overlay); overlay.onclick = () => history.back();
    }

    renderSidePanelContent(panel, selectedPlan);
    setupSupportPanelAssistHint(panel);
    const planCards = calcStore.planCards[selectedPlan] || [];
    planCards.forEach(id => {
        if (!id) return;
        const item = panel.querySelector(`.side-card-item[data-id="${id}"]`);
        if (item) { item.classList.add('selected'); item.dataset.selectTime = Date.now(); }
    });
    updateSelectedCardsUI(calcStore);

    requestAnimationFrame(() => {
        panel.classList.add('open'); if (overlay) overlay.classList.add('show');
        history.pushState({ modalOpen: 'sidePanel' }, "");
        setTimeout(() => {
            try { refreshAll(); } catch (err) { console.error(err); }
            finally {
                document.getElementById('calc-side-spinner-overlay')?.remove();
                updateSupportPanelAssistHint(panel);
            }
        }, 150);
    });
}

export function closeSupportCardPanel(isPopState = false) {
    const panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (!panel?.classList.contains('open')) return;

    if (!isPopState) {
        history.back();
        return;
    }

    panel.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}
export function syncSupportPanelUI() {
    const panel = document.getElementById('calc-side-panel');
    if (!panel) return;

    const plan = calcStore.planType;
    const currentPlanCards = calcStore.planCards[plan] || [];
    const filledCount = currentPlanCards.filter(id => id !== null).length;
    const isNowSelectingSixth = filledCount === 5 && currentPlanCards[5] === null;
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    // 6주차(렌탈) 모드 표시 업데이트
    if (isNowSelectingSixth) panel.classList.add('is-selecting-sixth');
    else panel.classList.remove('is-selecting-sixth');

    const tabs = panel.querySelector('.side-panel-tabs');
    const content = panel.querySelector('.side-panel-content');
    if (tabs) {
        tabs.style.background = isNowSelectingSixth ? '#8FDDBA' : 'white';
        let badge = tabs.querySelector('.rental-badge');
        if (isNowSelectingSixth && !badge) {
            badge = document.createElement('span');
            badge.className = 'rental-badge';
            badge.textContent = t('calc_label_rental');
            Object.assign(badge.style, {
                position: 'absolute', top: '2px', left: '6px',
                fontSize: '8px', fontWeight: 'bold', color: '#fff',
                letterSpacing: '0.5px', zIndex: '10', opacity: '0.8'
            });
            tabs.appendChild(badge);
        } else if (!isNowSelectingSixth && badge) {
            badge.remove();
        }
    }
    if (content) content.style.background = isNowSelectingSixth ? '#8FDDBA' : 'white';

    // 모든 카드 아이템 상태 초기화 및 현재 선택된 카드 적용
    panel.querySelectorAll('.side-card-item').forEach(el => {
        const id = el.dataset.id;
        const idx = currentPlanCards.indexOf(id);
        const isSelected = idx !== -1;
        const isSixth = idx === 5;

        if (isSelected) {
            el.classList.add('selected');
            el.style.borderColor = isSixth ? '#8FDDBA' : idolColor;
            el.style.borderWidth = '2px';
        } else {
            el.classList.remove('selected');
            el.style.borderColor = '#ddd';
            el.style.borderWidth = '';
            delete el.dataset.selectTime;
        }

        // 별(한계 돌파) 표시 업데이트
        const displayLb = (isNowSelectingSixth && !isSelected) || isSixth ? 4 : (state.supportLB[id] || 0);
        const stars = el.querySelectorAll('.calc-card-star');
        stars.forEach((star, i) => {
            if (i < displayLb) star.classList.add('active');
            else star.classList.remove('active');
        });
    });

    updateSupportPanelAssistHint(panel);
}

window.closeSupportCardPanel = closeSupportCardPanel;

/**
 * 스킬 카드 선택(조정) 모달
 */
export function showOtherTuneModal(refreshAll, showSidebar = false) {
    const activePlan = calcStore.planType;
    const selectedSkills = calcStore.planSkills[activePlan] || {};
    const counts = getTriggerCounts(calcStore);
    const cardGroups = [];
    const allCardIds = Object.keys(skillCardList);

    const rarities = ['r', 'sr', 'ssr'];
    if (calcStore.type === 'hajime') rarities.push('legend');

    // 1. 모든 등급의 미분류 카드(기본, 프리, 레전드) 먼저 배치
    rarities.forEach(r => {
        const planCards = allCardIds
            .filter(id => {
                const skill = skillCardList[id];
                if (!id.startsWith(`${activePlan}-${r}`) || id.endsWith('alt')) return false;
                if (skill.isKyoukaOnly) return false; // 강화월간 전용은 여기서 제외
                return true;
            })
            .sort((a, b) => {
                const numA = a.match(/\d+$/);
                const numB = b.match(/\d+$/);
                if (numA && numB) return parseInt(numA[0]) - parseInt(numB[0]);
                if (numA) return -1;
                if (numB) return 1;
                return a.localeCompare(b);
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
                    const numA = parseInt(a.match(/\d+$/)?.[0] || 0);
                    const numB = parseInt(b.match(/\d+$/)?.[0] || 0);
                    return numA - numB;
                });
            freeCards.forEach(id => cardGroups.push([id]));
        }
    });

    // 2. 강화월간 전용 카드들 그룹화 (로직, 센스, 어노말리 SSR인 경우)
    if (calcStore.isKyouka && (activePlan === 'logic' || activePlan === 'sense' || activePlan === 'anomaly')) {
        const kyoukaCards = allCardIds
            .filter(id => id.startsWith(`${activePlan}-ssr`) && skillCardList[id].isKyoukaOnly)
            .sort((a, b) => a.localeCompare(b));

        if (kyoukaCards.length > 0) {
            const groups = {
                // Logic
                goodimpression: [],
                motivation: [],
                // Sense
                concentration: [],
                goodcondition: [],
                // Anomaly
                enthusiasm: [],
                fullpower: [],
                // Common
                others: []
            };

            kyoukaCards.forEach(id => {
                const fileName = id.split('-')[1] || id;
                // dist와 limited가 혼용되는 경우를 위해 둘 다 체크
                let produce = produceList.find(p => p.id === fileName);
                if (!produce) {
                    const altName = fileName.includes('limited') ? fileName.replace('limited', 'dist') : fileName.replace('dist', 'limited');
                    produce = produceList.find(p => p.id === altName);
                }
                let osusume = produce ? produce.osusume : null;

                // 온존(preservation)을 전력(fullpower)으로 취급
                if (osusume === 'preservation') osusume = 'fullpower';

                if (groups[osusume]) groups[osusume].push(id);
                else groups.others.push(id);
            });

            // Logic Groups
            if (activePlan === 'logic') {
                if (groups.goodimpression.length > 0) cardGroups.push([`header-goodimpression`, ...groups.goodimpression]);
                if (groups.motivation.length > 0) cardGroups.push([`header-motivation`, ...groups.motivation]);
            }
            // Sense Groups
            if (activePlan === 'sense') {
                if (groups.goodcondition.length > 0) cardGroups.push([`header-goodcondition`, ...groups.goodcondition]);
                if (groups.concentration.length > 0) cardGroups.push([`header-concentration`, ...groups.concentration]);
            }
            // Anomaly Groups
            if (activePlan === 'anomaly') {
                if (groups.enthusiasm.length > 0) cardGroups.push([`header-enthusiasm`, ...groups.enthusiasm]);
                if (groups.fullpower.length > 0) cardGroups.push([`header-fullpower`, ...groups.fullpower]);
            }

            if (groups.others.length > 0) {
                groups.others.forEach(id => cardGroups.push([id]));
            }
        }
    }

    const modal = document.createElement('div');
    modal.id = 'calc-tune-modal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '40000';
    modal.addEventListener('mousedown', (e) => e.stopPropagation());
    modal.addEventListener('click', (e) => e.stopPropagation());

    const isJa = state.currentLang === 'ja';
    const isPCView = showSidebar && window.innerWidth > 768;
    const renderCardItem = (id) => {
        if (id.startsWith('header-')) {
            const type = id.replace('header-', '');
            let label = '';
            const icon = `<img src="icons/${type}.webp" style="width: 18px; height: 18px; object-fit: contain;">`;
            if (type === 'goodimpression') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_goodimpression')}`;
            } else if (type === 'motivation') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_motivation')}`;
            } else if (type === 'concentration') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_concentration')}`;
            } else if (type === 'goodcondition') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_goodcondition')}`;
            } else if (type === 'enthusiasm') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_enthusiasm')}`;
            } else if (type === 'fullpower') {
                label = `${t('calc_tune_prefix_kyouka')}${t('support_effect_get_fullpower')}`;
            }
            return `<div class="tune-card-group-header" style="grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; background: #f3e5f5; padding: 6px 10px; font-size: 0.85rem; font-weight: bold; color: #9c27b0; border-radius: 6px; margin-top: 8px; border-left: 4px solid #9c27b0; cursor: pointer; transition: background 0.2s; position: relative;">${icon}<span>${label}</span><span class="toggle-icon" style="margin-left: auto; transition: transform 0.2s;">▼</span></div>`;
        }
        if (id === 'trouble') {
            const tCount = counts.total.get_t || 0;
            return `
                <div class="tune-card-item selected" data-id="trouble" style="pointer-events: none; opacity: 0.9; filter: saturate(1.2);">
                    <img src="icons/cal/card/trouble.webp">
                    <div class="card-count-badge ${tCount > 1 ? '' : 'hidden'}">x${tCount}</div>
                </div>`;
        }
        const skill = skillCardList[id] || {};
        const count = selectedSkills[id] || 0;
        const isSelected = count > 0;
        let imgSrc = `icons/cal/card/${id}.webp`;
        if (skill.isKyoukaOnly || skill.primastella) {
            const parts = id.split('-');
            const plan = parts[0];
            const fileName = parts.slice(1).join('-');
            imgSrc = `idols/${plan}/${fileName}.webp`;
        }
        return `
            <div class="tune-card-item ${isSelected ? 'selected' : ''}" data-id="${id}" data-multi="true">
                <img src="${imgSrc}" onerror="this.parentElement.style.display='none';">
                <div class="card-count-badge ${count > 1 ? '' : 'hidden'}">x${count}</div>
                <div class="card-reset-btn ${isSelected ? '' : 'hidden'}">×</div>
            </div>`;
    };

    if (counts.total.get_t > 0) cardGroups.unshift(['trouble']);

    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    // PC 전용: 서포카 사이드바 렌더링 함수
    const renderTuneSidebar = (container) => {
        const { ids: selectedIds } = getNormalizedSelectedCardIds(calcStore);
        let html = '';
        for (let i = 0; i < 6; i++) {
            const cardId = selectedIds[i];
            if (cardId) {
                const cardData = cardList.find(c => c.id === cardId);
                const checked = calcStore.cardChecked[cardId];
                const optChecked = calcStore.cardExtraChecked[cardId];
                const eventChecked = calcStore.cardEventChecked[cardId];
                const counter = calcStore.itemCounters[cardId] || 0;
                const isRental = i === 5;
                const attrColor = cardData?.type === 'vocal' ? '#ff4d8d' : (cardData?.type === 'dance' ? '#46a4f3' : '#fcc75e');
                const borderColor = isRental ? '#8FDDBA' : attrColor;

                let extraOptHtml = '';
                if (cardData?.extra2) {
                    let optLabel = '';
                    const e2 = cardData.extra2;
                    if (e2.includes('enhance')) optLabel = t('calc_label_enhance');
                    else if (e2.includes('change')) optLabel = t('calc_label_change');
                    else if (e2.includes('del')) optLabel = t('calc_label_delete');
                    else optLabel = t('calc_label_option');
                    extraOptHtml = `
                        <label class="opt-check-label" style="font-size: 0.55rem; gap: 2px; justify-content: center;">
                            <input type="checkbox" class="card-opt-check" data-id="${cardId}" ${optChecked ? 'checked' : ''}>
                            <span>${optLabel}</span>
                        </label>`;
                }

                let counterHtml = '';
                if (cardData?.item_effects?.some(e => e.type === 'action' || e.type === 'add_count')) {
                    counterHtml = `
                        <div class="card-item-counter" style="margin-top: 1px;">
                            <button class="card-counter-btn minus" data-id="${cardId}">
                                <img src="icons/minus.svg" class="cnt-btn-icon" style="width: 7px; height: 7px; filter: brightness(0) invert(1);">
                            </button>
                            <span class="card-counter-val" style="font-size: 0.65rem;">${counter}</span>
                            <button class="card-counter-btn plus" data-id="${cardId}">
                                <img src="icons/plus.svg" class="cnt-btn-icon" style="width: 7px; height: 7px; filter: brightness(0) invert(1);">
                            </button>
                        </div>`;
                } else {
                    counterHtml = `<div style="height: 18px; margin-top: 1px;"></div>`;
                }

                const imgSuffix = cardData?.have?.startsWith('card') ? 'card' : 'item';
                const fallbackSuffix = imgSuffix === 'card' ? 'item' : 'card';

                html += `
                    <div class="tune-sidebar-card selected-card-slot filled" data-id="${cardId}" style="display: flex; flex-direction: column; align-items: center;">
                        <div style="display: flex; gap: 2px; justify-content: center; margin-bottom: 2px;">
                            ${extraOptHtml}
                            <label class="opt-check-label" style="font-size: 0.55rem; gap: 2px; justify-content: center;">
                                <input type="checkbox" class="card-event-check" data-id="${cardId}" ${eventChecked ? 'checked' : ''}>
                                <span>${t('calc_label_event')}</span>
                            </label>
                        </div>
                        <div class="slot-frame" style="width: 70px; height: 70px; border-radius: 6px; overflow: hidden; border: 2px solid ${borderColor}; position: relative; margin: 0 auto;">
                            <img src="images/support/${cardId}_${imgSuffix}.webp" onerror="this.src='images/support/${cardId}_${fallbackSuffix}.webp'; this.onerror=null;" style="width: 100%; height: 100%; object-fit: cover;">
                            <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked ? 'checked' : ''} style="position: absolute; top: 1px; right: 1px; width: 13px; height: 13px;">
                        </div>
                        ${counterHtml}
                    </div>`;
            } else {
                const label = i === 5 ? t('calc_label_rental') : '';
                html += `
                    <div class="tune-sidebar-card" style="display: flex; flex-direction: column; align-items: center; opacity: 0.25;">
                        <div style="width: 70px; height: 70px; border-radius: 6px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; color: #bbb; margin: 0 auto;">${label}</div>
                    </div>`;
            }
        }
        container.innerHTML = html;
    };

    const sidebarHtml = isPCView ? `
        <div id="tune-sidebar" style="width: 150px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 12px; padding: 8px 6px; display: flex; flex-direction: column; box-sizing: border-box; flex-shrink: 0;">
            <div style="font-size: 0.65rem; font-weight: bold; color: #999; text-align: center; padding-bottom: 6px; border-bottom: 1px solid #eee; margin-bottom: 6px; letter-spacing: 1px;">SUPPORT CARD</div>
            <div id="tune-sidebar-cards" style="display: grid; grid-template-columns: 1fr; gap: 6px; flex: 1; align-content: start;"></div>
        </div>` : '';

    modal.innerHTML = `
        <div id="calc-tune-modal-wrapper" style="display: flex; gap: 12px; align-items: stretch; justify-content: center; max-height: 90vh; width: 100%; max-width: 100vw; box-sizing: border-box;">
        <div class="modal-content" style="max-width: 90%; width: 500px; max-height: 80vh; padding: 12px; display: flex; flex-direction: column; position: relative; box-sizing: border-box;">
            <h3 id="modal-tune-title" style="margin: -12px -12px 12px -12px; text-align: center; color: #fff; font-size: 1rem; background-color: ${idolColor}; padding: 12px; border-radius: 12px 12px 0 0; position: relative;"></h3>
            <div class="tune-card-grid" style="flex: 1; overflow-y: auto;">${cardGroups.map(g => {
        if (g.length > 1) {
            if (g[0].startsWith('header-')) {
                return `
                            <div class="tune-kyouka-group-container" style="grid-column: 1 / -1; display: contents;">
                                ${renderCardItem(g[0])}
                                ${g.slice(1).map(id => renderCardItem(id)).join('')}
                            </div>
                        `;
            }
            return `<div class="tune-card-group-box" data-group="${g.join(',')}">${g.map(renderCardItem).join('')}</div>`;
        }
        return renderCardItem(g[0]);
    }).join('')}</div>
            <div style="display: flex; gap: 8px; margin-top: 12px; width: 100%; box-sizing: border-box;">
                <button class="primary-btn" id="reset-all-skills" style="flex: 1; background: #666; padding: 8px 4px; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; min-width: 0;">${t('calc_reset_skills_btn')}</button>
                <button class="primary-btn" id="close-tune-modal" style="flex: 1; background: ${idolColor}; padding: 8px 4px; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; min-width: 0;">${t('gacha_close')}</button>
            </div>
        </div>
        ${sidebarHtml}
        </div>`;
    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'tune' }, "");
    modal.onclick = (e) => {
        if (e.target === modal || e.target.closest('#calc-tune-modal-wrapper') === e.target) {
            history.back();
        }
    };

    // PC 사이드바 초기 렌더링 및 이벤트 바인딩
    const sidebarInitContainer = document.getElementById('tune-sidebar-cards');
    if (sidebarInitContainer) {
        renderTuneSidebar(sidebarInitContainer);

        // 사이드바 이벤트 delegation (모달의 stopPropagation 때문에 직접 처리)
        const tuneSidebar = document.getElementById('tune-sidebar');
        if (tuneSidebar) {
            tuneSidebar.addEventListener('click', (e) => {
                const counterBtn = e.target.closest('.card-counter-btn');
                const cardCheckBtn = e.target.closest('.card-slot-check');
                const cardOptCheckBtn = e.target.closest('.card-opt-check');
                const cardEventCheckBtn = e.target.closest('.card-event-check');

                if (counterBtn) {
                    const id = counterBtn.dataset.id;
                    const card = cardList.find(c => c.id === id);
                    if (!card) return;
                    const maxVal = card.item_effects?.find(e => e.max)?.max || 99;
                    let count = calcStore.itemCounters[id] || 0;
                    if (counterBtn.classList.contains('plus')) { if (count < maxVal) count++; }
                    else { if (count > 0) count--; }
                    calcStore.itemCounters[id] = count;
                    calcStore.save(); refreshAll();
                    renderTuneSidebar(sidebarInitContainer);
                    return;
                }
                if (cardCheckBtn) {
                    calcStore.cardChecked[cardCheckBtn.dataset.id] = cardCheckBtn.checked;
                    calcStore.save(); refreshAll();
                    renderTuneSidebar(sidebarInitContainer);
                    return;
                }
                if (cardOptCheckBtn) {
                    calcStore.cardExtraChecked[cardOptCheckBtn.dataset.id] = cardOptCheckBtn.checked;
                    calcStore.save(); refreshAll();
                    renderTuneSidebar(sidebarInitContainer);
                    return;
                }
                if (cardEventCheckBtn) {
                    calcStore.cardEventChecked[cardEventCheckBtn.dataset.id] = cardEventCheckBtn.checked;
                    calcStore.save(); refreshAll();
                    renderTuneSidebar(sidebarInitContainer);
                    return;
                }
            });
        }
    }

    const updateTitle = () => {
        const counts = getTriggerCounts(calcStore);
        const boardGetCount = counts.total.get || 0;
        const currentPlan = calcStore.planType;
        const skills = calcStore.planSkills[currentPlan] || {};
        let total = Object.values(skills).reduce((a, b) => a + b, 0);
        const selectedIds = calcStore.planCards[currentPlan] || [];
        selectedIds.forEach(id => {
            if (!id) return;
            if (calcStore.cardChecked[id]) {
                const card = cardList.find(c => c.id === id);
                if (card && card.have?.startsWith('card_')) total++;
            }
        });
        const tCount = counts.total.get_t || 0;
        total += tCount;
        const titleEl = document.getElementById('modal-tune-title');
        if (titleEl) {
            const kyoukaPrefix = calcStore.isKyouka ? t('calc_tune_prefix_kyouka') : '';
            const planIcon = `<img src="icons/${currentPlan}.webp" style="width: 28px; height: 28px; object-fit: contain; position: absolute; left: 18px; top: 50%; transform: translateY(-50%);">`;
            const titleText = t('calc_tune_title_format', { prefix: kyoukaPrefix, plan: '', selected: total, total: boardGetCount });
            titleEl.innerHTML = planIcon + titleText;
        }
    };
    updateTitle();

    // 강화월간 그룹 토글 이벤트 리스너
    modal.querySelectorAll('.tune-card-group-header').forEach(header => {
        header.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            const container = header.parentElement; // display: contents 때문에 형제들을 찾아야 함
            const toggleIcon = header.querySelector('.toggle-icon');
            const isCollapsed = header.classList.toggle('collapsed');

            if (toggleIcon) toggleIcon.style.transform = isCollapsed ? 'rotate(-90deg)' : '';

            // 헤더 바로 다음에 오는 아이템들을 찾아서 토글
            let next = header.nextElementSibling;
            while (next && next.classList.contains('tune-card-item')) {
                next.style.display = isCollapsed ? 'none' : 'flex';
                next = next.nextElementSibling;
            }
        };
    });

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
                skills[id] = (skills[id] || 0) + 1;
            }
            calcStore.save(); refreshAll(); updateTitle();
            const sidebarContainer = document.getElementById('tune-sidebar-cards');
            if (sidebarContainer) renderTuneSidebar(sidebarContainer);
            modal.querySelectorAll('.tune-card-item').forEach(el => {
                const cid = el.dataset.id; if (cid === 'trouble') return;
                const count = skills[cid] || 0;
                el.classList.toggle('selected', count > 0);
                const badge = el.querySelector('.card-count-badge');
                if (badge) { badge.textContent = `x${count}`; badge.classList.toggle('hidden', count <= 1); }
                const rb = el.querySelector('.card-reset-btn');
                if (rb) rb.classList.toggle('hidden', count === 0);
            });
        };
    });

    document.getElementById('reset-all-skills').onclick = () => {
        calcStore.planSkills[activePlan] = {}; calcStore.save(); refreshAll(); updateTitle();
        const sidebarContainer2 = document.getElementById('tune-sidebar-cards');
        if (sidebarContainer2) renderTuneSidebar(sidebarContainer2);
        modal.querySelectorAll('.tune-card-item').forEach(el => {
            const cid = el.dataset.id; if (cid === 'trouble') return;
            el.classList.remove('selected');
            const badge = el.querySelector('.card-count-badge'); if (badge) badge.classList.add('hidden');
            const rb = el.querySelector('.card-reset-btn'); if (rb) rb.classList.add('hidden');
        });
    };
    document.getElementById('close-tune-modal').onclick = () => history.back();
}

export function showMemorySelectModal(slotIndex, refreshAll) {
    const isJa = state.currentLang === 'ja';
    const isMobile = window.innerWidth <= 768;
    const modal = document.createElement('div');
    modal.id = 'calc-memory-select-modal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '40000';

    const content = document.createElement('div');
    content.className = 'modal-content memory-select-content';
    content.style.width = isMobile ? '85vw' : '640px';
    content.style.padding = isMobile ? '15px 8px' : '15px';
    content.style.maxHeight = '105vh';
    content.style.overflowY = 'auto';


    // calcStore.memories[slotIndex]는 이제 배열 형태여야 함
    let currentSelections = Array.isArray(calcStore.memories[slotIndex]) ? [...calcStore.memories[slotIndex]] : [];

    // 모달 닫기 로직: 닫을 때 스토어 저장 및 새로고침
    const closeModalAndSave = (isPopState = false) => {
        calcStore.memories[slotIndex] = currentSelections;
        calcStore.save();
        refreshAll();
        // 상세 모달이 열려있다면 갱신
        if (typeof window.refreshAll === 'function') window.refreshAll();

        if (!isPopState) history.back();
        else modal.remove();
    };
    window.closeMemoryModal = closeModalAndSave;

    // 우측 상단 작은 ✕ (닫기) 버튼
    content.style.position = 'relative';
    const xBtn = document.createElement('div');
    xBtn.innerHTML = '✕';
    xBtn.style.cssText = `position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #bbb; cursor: pointer; transition: all 0.2s; z-index: 10; font-family: sans-serif;`;
    xBtn.onmouseenter = () => { xBtn.style.color = '#333'; xBtn.style.transform = 'scale(1.1)'; };
    xBtn.onmouseleave = () => { xBtn.style.color = '#bbb'; xBtn.style.transform = 'scale(1)'; };
    xBtn.onclick = () => closeModalAndSave();
    content.appendChild(xBtn);

    // 옵션 리스트 렌더링
    import('./calcData.js').then(({ memoryOptions }) => {
        if (!memoryOptions) return;

        const colsContainer = document.createElement('div');
        colsContainer.style.display = 'grid';
        // 2열(보컬) + 1열(선) + 2열(댄스) + 1열(선) + 2열(비주얼) = 총 8열
        colsContainer.style.gridTemplateColumns = '1fr 1fr auto 1fr 1fr auto 1fr 1fr';
        colsContainer.style.columnGap = isMobile ? '2px' : '6px';
        colsContainer.style.rowGap = isMobile ? '4px' : '6px';
        content.appendChild(colsContainer);

        const headers = { vocal: isJa ? 'Vo' : '보컬', dance: isJa ? 'Da' : '댄스', visual: isJa ? 'Vi' : '비주얼' };
        const colors = { vocal: '#ff4d8d', dance: '#46a4f3', visual: '#fcc75e' };
        const bgColors = { vocal: '#ffd1e0', dance: '#cce5ff', visual: '#fff4c2' };

        // 아주 연한 속성 색상 (미선택 시 배경 및 테두리용)
        const tintBgs = {
            vocal: 'rgba(255, 77, 141, 0.04)',
            dance: 'rgba(70, 164, 243, 0.04)',
            visual: 'rgba(252, 199, 94, 0.04)'
        };
        const tintBorders = {
            vocal: 'rgba(255, 77, 141, 0.15)',
            dance: 'rgba(70, 164, 243, 0.15)',
            visual: 'rgba(252, 199, 94, 0.15)'
        };

        // 1. 헤더 렌더링 (적절한 위치에 배치)
        const typeOrder = ['vocal', 'dance', 'visual'];
        typeOrder.forEach((type, idx) => {
            const title = document.createElement('div');
            title.style.gridColumn = `${idx * 3 + 1} / span 2`;
            title.style.textAlign = 'center';
            title.style.display = 'flex';
            title.style.justifyContent = 'center';
            title.style.alignItems = 'center';
            title.style.padding = '4px 0';

            const icon = document.createElement('img');
            icon.src = `icons/${type}.webp`;
            icon.style.width = isMobile ? '18px' : '22px';
            icon.style.height = 'auto';
            icon.style.objectFit = 'contain';

            title.appendChild(icon);
            colsContainer.appendChild(title);
        });

        // 2. 옵션 버튼들을 타입별/형식별(고정/%)로 분류
        const groupedOpts = {
            vocal: { fixed: [], percent: [] },
            dance: { fixed: [], percent: [] },
            visual: { fixed: [], percent: [] }
        };
        Object.keys(memoryOptions).forEach(key => {
            const opt = memoryOptions[key];
            if (opt.isPercent) groupedOpts[opt.type].percent.push({ key, ...opt });
            else groupedOpts[opt.type].fixed.push({ key, ...opt });
        });

        const maxRows = Math.max(
            Math.ceil(groupedOpts.vocal.fixed.length),
            Math.ceil(groupedOpts.dance.fixed.length),
            Math.ceil(groupedOpts.visual.fixed.length),
            Math.ceil(groupedOpts.vocal.percent.length),
            Math.ceil(groupedOpts.dance.percent.length),
            Math.ceil(groupedOpts.visual.percent.length)
        );

        // 3. 세로 구분선 추가 (3열과 6열)
        [3, 6].forEach(colIdx => {
            const divider = document.createElement('div');
            divider.style.gridColumn = colIdx;
            divider.style.gridRow = `1 / span ${maxRows + 2}`;
            divider.style.width = '1px';
            divider.style.background = '#eee';
            divider.style.margin = isMobile ? '0 1px' : '0 4px';
            colsContainer.appendChild(divider);
        });

        // 4. 행 단위로 버튼 렌더링
        for (let r = 0; r < maxRows; r++) {
            typeOrder.forEach((type, typeIdx) => {
                // c=0: 고정치, c=1: %
                for (let c = 0; c < 2; c++) {
                    const opt = (c === 0) ? groupedOpts[type].fixed[r] : groupedOpts[type].percent[r];

                    if (opt) {
                        const btn = document.createElement('div');
                        btn.className = 'memory-opt-btn';
                        btn.style.padding = isMobile ? '8px 1px' : '8px 2px';
                        btn.style.border = '1px solid #ddd';
                        btn.style.borderRadius = '4px';
                        btn.style.cursor = 'pointer';
                        btn.style.textAlign = 'center';
                        btn.dataset.key = opt.key;
                        btn.style.gridColumn = `${typeIdx * 3 + (c + 1)}`;

                        const isSelected = currentSelections.includes(opt.key);
                        btn.style.background = isSelected ? bgColors[type] : tintBgs[type];
                        btn.style.borderColor = isSelected ? colors[type] : tintBorders[type];

                        const shortText = (opt.label_ko || '').split(' ')[1] || opt.label_ko;
                        btn.innerHTML = `<div style="font-weight: bold; color: #333; font-size: ${isMobile ? '0.62rem' : '0.8rem'}; line-height: 1.1;">${shortText}</div>`;

                        btn.onclick = () => {
                            const idx = currentSelections.indexOf(opt.key);
                            if (idx > -1) {
                                currentSelections.splice(idx, 1);
                                btn.style.background = tintBgs[type];
                                btn.style.borderColor = tintBorders[type];
                            } else {
                                // 같은 타입의 기존 선택 제거 (수치 버튼 OR 해당없음 버튼)
                                const noneKey = `${type}_none`;
                                const existIdx = currentSelections.findIndex(k =>
                                    k === noneKey || (memoryOptions[k] && memoryOptions[k].type === type)
                                );

                                if (existIdx > -1) {
                                    const oldKey = currentSelections[existIdx];
                                    currentSelections.splice(existIdx, 1);
                                    const oldBtn = colsContainer.querySelector(`.memory-opt-btn[data-key="${oldKey}"]`);
                                    if (oldBtn) {
                                        const isNone = oldKey.endsWith('_none');
                                        oldBtn.style.background = isNone ? (isSelected ? bgColors[type] : tintBgs[type]) : tintBgs[type];
                                        oldBtn.style.borderColor = tintBorders[type];
                                        if (isNone) oldBtn.style.color = '#999';
                                    }
                                }
                                currentSelections.push(opt.key);
                                btn.style.background = bgColors[opt.type];
                                btn.style.borderColor = colors[opt.type];
                            }
                        };
                        colsContainer.appendChild(btn);
                    } else {
                        const empty = document.createElement('div');
                        empty.style.gridColumn = `${typeIdx * 3 + (c + 1)}`;
                        colsContainer.appendChild(empty);
                    }
                }
            });
        }

    });

    modal.appendChild(content);
    modal.onclick = (e) => { if (e.target === modal) closeModalAndSave(); };
    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'memorySelect' }, "");
}

function showTemporaryToast(message) {
    const tooltip = document.createElement('div');
    const isMobile = window.innerWidth <= 768;

    tooltip.textContent = message;
    tooltip.style.position = 'fixed';
    tooltip.style.backgroundColor = 'rgba(0,0,0,0.85)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = isMobile ? '6px 12px' : '12px 20px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontSize = isMobile ? '0.7rem' : '0.95rem';
    tooltip.style.fontWeight = 'bold';
    tooltip.style.zIndex = '9999999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    // 중앙 하단 고정
    tooltip.style.left = '50%';
    tooltip.style.bottom = isMobile ? '12%' : '10%';
    tooltip.style.transform = 'translateX(-50%)';

    // 부드러운 페이드 효과를 위해 transition 사용 (keyframes 충돌 방지)
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s ease-in-out';

    document.body.appendChild(tooltip);

    // 렌더링 후 투명도 1로 올려서 서서히 나타나게 함
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
    });

    // 2초 뒤 다시 서서히 사라짐
    setTimeout(() => {
        tooltip.style.opacity = '0';
        // 완전히 사라진 뒤 DOM 제거
        setTimeout(() => {
            if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        }, 300);
    }, 2000);
}

/**
 * 추천 설정 및 확인 모달 표시
 */
export function showRecommendModal(onConfirm) {
    const modalId = 'calc-recommend-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    history.pushState({ modalOpen: 'recommend' }, "");

    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');
    const isJa = state.currentLang === 'ja';

    // 기본 선택값 (저장된 설정 반영)
    let settings = { ...calcStore.recommendSettings };
    const getSum = () => settings.vocal + settings.dance + settings.visual;

    const titleText = t('calc_title_support_recommend');

    const renderSubRow = (key) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 8px 24px; border-bottom: 1px solid #f9f9f9;">
            <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #666;">
                <img src="icons/${key}.png" style="width: 15px; height: 15px;">
                <span style="font-weight: 700; letter-spacing: -0.01em;">SP</span>
            </span>
            <div style="display: flex; gap: 4px;" class="sp-sub-options" data-key="${key}">
                ${[0, 1, 2, 3].map(num => `
                    <button class="sp-opt-btn ${num === settings[key] ? 'active' : ''}" data-val="${num}" 
                        style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 11px; font-weight: bold; color: #666; transition: all 0.2s;">
                        ${num}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    modal.innerHTML = `
        <div class="confirm-modal-content" style="border: 1px solid #ddd; border-radius: 12px; padding: 24px; background: #fff; max-width: 380px; width: 95%; margin: auto; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: modal-fade-in 0.2s ease-out;">
            <div style="font-size: 17px; font-weight: bold; margin-bottom: 20px; color: #333; text-align: center;">${titleText}</div>
            
            <div style="border: 1px solid #eee; border-radius: 10px; overflow: hidden; margin-bottom: 24px; background: #fff;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #fcfcfc; border-bottom: 2px solid #eee;">
                    <span style="font-size: 14px; font-weight: bold; color: #333;">${t('calc_title_sp_support_count')}</span>
                    <span id="sp-total-count" style="font-size: 16px; font-weight: 900; color: ${idolColor}; background: ${idolColor}15; padding: 2px 10px; border-radius: 12px;">${getSum()}</span>
                </div>
                ${renderSubRow('vocal')}
                ${renderSubRow('dance')}
                ${renderSubRow('visual')}
            </div>

            <div style="border: 1px solid #eee; border-radius: 10px; overflow: hidden; margin-bottom: 24px; background: #fff;">
                <label id="lock-cards-toggle" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; cursor: pointer; user-select: none;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 14px; font-weight: bold; color: #333;">${t('calc_lock_current_cards')}</span>
                        <span id="lock-cards-desc" style="font-size: 11px; color: #999;">${t('calc_lock_current_cards_desc')}</span>
                    </div>
                    <div style="position: relative; width: 44px; height: 24px; flex-shrink: 0; margin-left: 12px;">
                        <input type="checkbox" id="lock-cards-checkbox" ${calcStore.lockCards ? 'checked' : ''} style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <div class="lock-toggle-track" style="position: absolute; inset: 0; background: #ddd; border-radius: 12px; transition: background 0.2s;"></div>
                        <div class="lock-toggle-thumb" style="position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 0.2s;"></div>
                    </div>
                </label>
                <div id="lock-cards-preview" style="display: none; padding: 8px 12px; border-top: 1px solid #f0f0f0; background: #fafafa;"></div>
            </div>

            <div style="margin-bottom: 20px; padding: 0 4px;">
                <div style="font-size: 11px; color: #999; line-height: 1.5; letter-spacing: -0.02em;">
                    <div style="font-weight: bold; margin-bottom: 4px; color: #777;">⚠️ ${t('calc_notice')}</div>
                    <div id="recommend-notice-content">
                        • ${t('calc_notice_recommend_1')}<br>
                        • ${t('calc_notice_recommend_2')}
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 10px;">
                <button class="confirm-btn cancel" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #eee; background: #fcfcfc; color: #888; cursor: pointer; font-size: 13px;">${t('ui_cancel')}</button>
                <button class="confirm-btn ok" style="flex: 1.5; padding: 10px; border-radius: 8px; border: none; background: ${idolColor}; color: #fff; cursor: pointer; font-size: 13px; font-weight: bold;">${t('calc_label_recommend_start')}</button>
            </div>
        </div>
        <style>
            .sp-opt-btn.active {
                background: ${idolColor} !important;
                color: #fff !important;
                border-color: ${idolColor} !important;
                box-shadow: 0 2px 6px ${idolColor}44;
            }
            @media (max-width: 768px) {
                .confirm-modal-content { padding: 18px !important; }
                .confirm-modal-content > div:first-child { font-size: 15px !important; margin-bottom: 14px !important; }
                .confirm-modal-content span[style*="font-size: 14px"] { font-size: 12px !important; }
                .confirm-modal-content span[style*="font-size: 13px"] { font-size: 11px !important; }
                .confirm-modal-content .sp-opt-btn { width: 24px !important; height: 24px !important; font-size: 10px !important; }
                #lock-cards-toggle span[style*="font-size: 14px"] { font-size: 12px !important; }
                #lock-cards-toggle span[style*="font-size: 11px"] { font-size: 10px !important; }
            }
        </style>
    `;

    modal.style.display = 'flex';
    modal.style.zIndex = '30000';

    const totalDisplay = modal.querySelector('#sp-total-count');

    // 이벤트 바인딩 및 실시간 합계 업데이트 (6개 제한 추가)
    modal.querySelectorAll('.sp-sub-options').forEach(container => {
        const key = container.dataset.key;
        const btns = container.querySelectorAll('.sp-opt-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                const newVal = parseInt(btn.dataset.val);
                const currentSumWithoutKey = getSum() - settings[key];

                // 합계가 6を 넘으면 선택 불가
                if (currentSumWithoutKey + newVal > 6) {
                    showTemporaryToast(t('calc_toast_recommend_limit'));
                    return;
                }

                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                settings[key] = newVal;
                calcStore.recommendSettings[key] = newVal;
                calcStore.save();
                totalDisplay.innerText = getSum();
            };
        });
    });

    // 서포카 고정 토글 이벤트
    const lockToggle = modal.querySelector('#lock-cards-toggle');
    const lockCheckbox = modal.querySelector('#lock-cards-checkbox');
    const lockTrack = modal.querySelector('.lock-toggle-track');
    const lockThumb = modal.querySelector('.lock-toggle-thumb');
    const lockPreview = modal.querySelector('#lock-cards-preview');
    const lockDesc = modal.querySelector('#lock-cards-desc');

    const planType = calcStore.planType || 'sense';
    const currentCards = (calcStore.planCards[planType] || []).filter(Boolean);

    // 개별 카드 고정 상태 추적
    const lockedCardSet = new Set();

    const updateLockUI = () => {
        const checked = lockCheckbox.checked;
        lockTrack.style.background = checked ? idolColor : '#ddd';
        lockThumb.style.transform = checked ? 'translateX(20px)' : 'translateX(0)';
        if (lockDesc) lockDesc.style.display = checked ? 'block' : 'none';

        if (checked) {
            if (currentCards.length > 0) {
                lockPreview.innerHTML = `<div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">${currentCards.map((id, idx) => {
                    const card = (typeof cardList !== 'undefined' ? cardList : []).find(c => c.id === id);
                    const attrColor = card?.type === 'vocal' ? '#ff4d8d' : (card?.type === 'dance' ? '#46a4f3' : '#fcc75e');
                    const isRental = idx === 5;
                    const isLocked = lockedCardSet.has(id);
                    const borderColor = isLocked ? (isRental ? '#5ECFB1' : attrColor) : '#88888866';
                    return `<div class="lock-card-item" data-card-id="${id}" style="position: relative; width: 81px; height: 45px; border-radius: 4px; overflow: hidden; border: 2px solid ${borderColor}; box-shadow: 0 1px 4px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.2s;">
                        <img src="images/support/thumb/${id}.webp" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="lock-card-overlay" style="position: absolute; inset: 0; background: ${isLocked ? 'transparent' : 'rgba(0,0,0,0.55)'}; transition: background 0.2s; display: flex; align-items: center; justify-content: center;">
                            ${(!isLocked && isRental) ? '<span style="color: #fff; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">RENTAL</span>' : ''}
                        </div>
                    </div>`;
                }).join('')}</div>`;
                lockPreview.style.display = 'block';

                // 각 카드 클릭 이벤트
                lockPreview.querySelectorAll('.lock-card-item').forEach(el => {
                    el.onclick = (e) => {
                        e.stopPropagation();
                        const cardId = el.dataset.cardId;
                        if (lockedCardSet.has(cardId)) {
                            lockedCardSet.delete(cardId);
                        } else {
                            lockedCardSet.add(cardId);
                        }
                        updateLockUI();
                    };
                });
            } else {
                lockPreview.innerHTML = '<div style="font-size: 11px; color: #bbb; text-align: center; padding: 4px 0;">—</div>';
                lockPreview.style.display = 'block';
            }
        } else {
            lockPreview.style.display = 'none';
        }
    };

    // 이전 토글 상태 복원
    if (calcStore.lockCards && lockCheckbox) {
        lockCheckbox.checked = true;
        updateLockUI();
    }

    if (lockToggle) {
        lockToggle.onclick = (e) => {
            e.preventDefault();
            lockCheckbox.checked = !lockCheckbox.checked;
            calcStore.lockCards = lockCheckbox.checked;
            calcStore.save();

            // 토글을 껐을 때는 고정 선택을 모두 해제(비움)
            if (!lockCheckbox.checked) {
                lockedCardSet.clear();
            }

            updateLockUI();
        };
    }

    const close = (isPopState = false) => {
        if (!isPopState) history.back();
        else modal.style.display = 'none';
    };
    window.closeRecommendModal = close;
    modal.querySelector('.confirm-btn.cancel').onclick = close;

    const okBtn = modal.querySelector('.confirm-btn.ok');
    okBtn.onclick = () => {
        const footer = modal.querySelector('.confirm-modal-content > div:last-of-type');
        footer.innerHTML = `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 10px 0;">
                <div class="loading-spinner" style="width: 24px; height: 24px; border: 3px solid rgba(0,0,0,0.1); border-top: 3px solid ${idolColor}; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <div style="font-size: 12px; color: ${idolColor}; font-weight: bold;"></div>
            </div>
        `;

        setTimeout(() => {
            const lockEnabled = modal.querySelector('#lock-cards-checkbox')?.checked || false;
            const selectedLockedCards = lockEnabled ? [...lockedCardSet] : [];
            onConfirm(settings, lockEnabled, selectedLockedCards);
            close();
        }, 100);
    };

    modal.onclick = (e) => { if (e.target === modal) close(); };

    if (!document.getElementById('modal-spin-style')) {
        const style = document.createElement('style');
        style.id = 'modal-spin-style';
        style.innerHTML = `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes modal-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 헥사 색상을 주어진 비율만큼 어둡게 만드는 헬퍼 함수
 */
function getDarkenedColor(hex, percent = 45) {
    if (!hex || !hex.startsWith('#')) return '#222222';
    let num = parseInt(hex.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    R = R < 0 ? 0 : R > 255 ? 255 : R;
    G = G < 0 ? 0 : G > 255 ? 255 : G;
    B = B < 0 ? 0 : B > 255 ? 255 : B;
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * HIF 평가치 계산 모달 표시
 */
export function showHifEvalModal() {
    const modalId = 'hif-eval-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const closeHifEvalModal = (isPopState = false) => {
        const evalModal = document.getElementById(modalId);
        if (!evalModal) return;
        if (!isPopState) {
            history.back();
            return;
        }
        evalModal.style.display = 'none';
        evalModal.classList.add('hidden');
    };
    window.closeHifEvalModal = closeHifEvalModal;

    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    modal.innerHTML = `
        <div class="stat-detail-modal-content" style="max-width: 320px; border-color: ${idolColor};">
            <span class="stat-detail-close">&times;</span>
            <h3 style="margin-top: 0; margin-bottom: 15px; text-align: center; color: ${idolColor}; font-size: 1.0rem; font-weight: 800; border-bottom: 2px solid ${idolColor}; padding-bottom: 8px;">
                ${t('calc_hif_eval_title')}
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <label style="font-size: 0.82rem; font-weight: 700; color: #444; margin: 0; display: flex; align-items: center; gap: 4px;">
                        ${t('calc_hif_eval_stat')}
                        <span style="display: inline-flex; align-items: center; gap: 2px; margin-left: 1px;">
                            <img src="icons/vocal.webp" alt="Vocal" style="width: 12px; height: 12px; object-fit: contain;" />
                            <img src="icons/dance.webp" alt="Dance" style="width: 12px; height: 12px; object-fit: contain;" />
                            <img src="icons/visual.webp" alt="Visual" style="width: 12px; height: 12px; object-fit: contain;" />
                        </span>
                    </label>
                    <input type="number" id="hif-eval-in-0" placeholder="0" max="10000" style="width: 130px; box-sizing: border-box; border: 1px solid ${idolColor}44; border-radius: 8px; padding: 6px 10px; font-size: 0.88rem; outline: none; font-family: 'Inter', 'Pretendard', -apple-system, sans-serif !important; font-weight: 400 !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; background-color: ${idolColor}0d; transition: all 0.15s ease-in-out;" />
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <label style="font-size: 0.82rem; font-weight: 700; color: #444; margin: 0; display: flex; align-items: center; gap: 5px;">
                        <img src="icons/cal/round_hif.webp" alt="Round" style="width: 25px; height: 25px; object-fit: contain;" />
                        ${t('calc_hif_eval_r1')}
                    </label>
                    <input type="number" id="hif-eval-in-1" placeholder="0" max="1400000" style="width: 130px; box-sizing: border-box; border: 1px solid ${idolColor}44; border-radius: 8px; padding: 6px 10px; font-size: 0.88rem; outline: none; font-family: 'Inter', 'Pretendard', -apple-system, sans-serif !important; font-weight: 400 !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; background-color: ${idolColor}0d; transition: all 0.15s ease-in-out;" />
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <label style="font-size: 0.82rem; font-weight: 700; color: #444; margin: 0; display: flex; align-items: center; gap: 5px;">
                        <img src="icons/cal/round_hif.webp" alt="Round" style="width: 25px; height: 25px; object-fit: contain;" />
                        ${t('calc_hif_eval_r2')}
                    </label>
                    <input type="number" id="hif-eval-in-2" placeholder="0" max="2400000" style="width: 130px; box-sizing: border-box; border: 1px solid ${idolColor}44; border-radius: 8px; padding: 6px 10px; font-size: 0.88rem; outline: none; font-family: 'Inter', 'Pretendard', -apple-system, sans-serif !important; font-weight: 400 !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; background-color: ${idolColor}0d; transition: all 0.15s ease-in-out;" />
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <label style="font-size: 0.82rem; font-weight: 700; color: #444; margin: 0;">
                        ${t('calc_hif_eval_star')}
                    </label>
                    <input type="number" id="hif-eval-in-3" placeholder="0" max="1335" style="width: 130px; box-sizing: border-box; border: 1px solid ${idolColor}44; border-radius: 8px; padding: 6px 10px; font-size: 0.88rem; outline: none; font-family: 'Inter', 'Pretendard', -apple-system, sans-serif !important; font-weight: 400 !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; background-color: ${idolColor}0d; transition: all 0.15s ease-in-out;" />
                </div>
                
                <div style="margin-top: 10px; padding: 12px; background: ${idolColor}1a; border: 1px solid ${idolColor}; border-radius: 10px; display: flex; justify-content: center; align-items: center;">
                    <span id="hif-eval-result" style="font-size: 1.5rem; font-weight: 900; color: ${idolColor}; display: flex; align-items: center; justify-content: center; gap: 8px;">0</span>
                </div>
            </div>
        </div>
    `;

    const in0 = modal.querySelector('#hif-eval-in-0');
    const in1 = modal.querySelector('#hif-eval-in-1');
    const in2 = modal.querySelector('#hif-eval-in-2');
    const in3 = modal.querySelector('#hif-eval-in-3');
    const resultEl = modal.querySelector('#hif-eval-result');

    in1.value = localStorage.getItem('hif_eval_in_1') || "";
    in2.value = localStorage.getItem('hif_eval_in_2') || "";
    in3.value = localStorage.getItem('hif_eval_in_3') || "";

    if (calcStore.finalTotal) {
        const hifParamLimitBonus = calcStore.type === 'hif' ? (hifParameterLimitBonuses[calcStore.hifParamLimitLevel || 0] || 0) : 0;
        const maxStat = calcStore.type === 'hajime'
            ? 3000
            : (calcStore.type === 'hif' ? (3000 + hifParamLimitBonus) : (calcStore.type === 'nia' ? 2600 : 0));

        const v = Math.floor(calcStore.finalTotal.vocal || 0);
        const d = Math.floor(calcStore.finalTotal.dance || 0);
        const vi = Math.floor(calcStore.finalTotal.visual || 0);

        const cappedVo = maxStat > 0 ? Math.min(v, maxStat) : v;
        const cappedDa = maxStat > 0 ? Math.min(d, maxStat) : d;
        const cappedVi = maxStat > 0 ? Math.min(vi, maxStat) : vi;

        const totalCappedStats = cappedVo + cappedDa + cappedVi;
        in0.value = totalCappedStats || "";
    }

    const calculate = () => {
        let v0 = parseFloat(in0.value) || 0;
        if (v0 > 10000) {
            v0 = 10000;
            in0.value = 10000;
        }
        let v1 = parseFloat(in1.value) || 0;
        if (v1 > 1400000) {
            v1 = 1400000;
            in1.value = 1400000;
        }
        localStorage.setItem('hif_eval_in_1', in1.value);

        // 본선 1Round 점수 -> 평가 포인트 구간제 연산
        let v1Pts = 0;
        if (v1 <= 300000) {
            v1Pts = 0;
        } else if (v1 <= 700000) {
            v1Pts = (v1 - 300000) * 0.01;
        } else if (v1 <= 1000000) {
            v1Pts = 4000 + (v1 - 700000) * 0.003;
        } else if (v1 <= 1200000) {
            v1Pts = 4900 + (v1 - 1000000) * 0.002;
        } else {
            v1Pts = 5300 + (v1 - 1200000) * 0.001;
        }

        let v2 = parseFloat(in2.value) || 0;
        if (v2 > 2400000) {
            v2 = 2400000;
            in2.value = 2400000;
        }
        localStorage.setItem('hif_eval_in_2', in2.value);

        // 본선 2Round 점수 -> 평가 포인트 구간제 연산
        let v2Pts = 0;
        if (v2 <= 600000) {
            v2Pts = 0;
        } else if (v2 <= 900000) {
            v2Pts = (v2 - 600000) * 0.004;
        } else if (v2 <= 1500000) {
            v2Pts = 1200 + (v2 - 900000) * 0.008;
        } else if (v2 <= 2000000) {
            v2Pts = 6000 + (v2 - 1500000) * 0.002;
        } else {
            v2Pts = 7000 + (v2 - 2000000) * 0.001;
        }

        let v3 = parseFloat(in3.value) || 0;
        if (v3 > 1335) {
            v3 = 1335;
            in3.value = 1335;
        }
        localStorage.setItem('hif_eval_in_3', in3.value);
        const sum = Math.max(0, Math.floor((v0 * 2) + v1Pts + v2Pts + (v3 * 7.5)) - 2000);

        const getProduceRank = (score) => {
            if (score >= 35000) return 'S5';
            if (score >= 30000) return 'S4+';
            if (score >= 26000) return 'S4';
            if (score >= 23000) return 'SSS+';
            if (score >= 20000) return 'SSS';
            if (score >= 18000) return 'SS+';
            if (score >= 16000) return 'SS';
            if (score >= 14500) return 'S+';
            if (score >= 13000) return 'S';
            if (score >= 11500) return 'A+';
            if (score >= 10000) return 'A';
            if (score >= 8000) return 'B+';
            if (score >= 6000) return 'B';
            if (score >= 4500) return 'C+';
            if (score >= 3000) return 'C';
            return 'D';
        };
        const rank = getProduceRank(sum);
        const rankColors = {
            'S5': '#ff3e80', 'S4+': '#ff4d8d', 'S4': '#ff609d',
            'SSS+': '#fcae21', 'SSS': '#fcbd3f', 'SS+': '#fcc75e', 'SS': '#fcd07d',
            'S+': '#46a4f3', 'S': '#69b4f5',
            'A+': '#a288e3', 'A': '#b39df5',
            'B+': '#2ec4b6', 'B': '#5bc8af',
            'C+': '#9a9eab', 'C': '#b2b5be',
            'D': '#cdcfd6'
        };
        const rankColor = rankColors[rank] || idolColor;
        resultEl.innerHTML = `<span style="color: ${rankColor}; font-weight: 900; font-size: 1.65rem; text-shadow: 0 1px 2px rgba(0,0,0,0.05); -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important;">${rank}</span> <span style="font-size: 1.2rem; font-family: 'Inter', 'Pretendard', -apple-system, sans-serif !important; font-weight: 700 !important; -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; color: #555; margin-left: 5px;">${sum.toLocaleString()}</span>`;
    };

    in0.addEventListener('input', calculate);
    in1.addEventListener('input', calculate);
    in2.addEventListener('input', calculate);
    in3.addEventListener('input', calculate);

    calculate();

    [in0, in1, in2, in3].forEach(input => {
        input.addEventListener('focus', () => {
            input.style.backgroundColor = '#ffffff';
            input.style.borderColor = idolColor;
            input.style.boxShadow = `0 0 0 3px ${idolColor}22`;
        });
        input.addEventListener('blur', () => {
            input.style.backgroundColor = `${idolColor}0d`;
            input.style.borderColor = `${idolColor}44`;
            input.style.boxShadow = 'none';
        });
    });

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    modal.querySelector('.stat-detail-close').onclick = () => closeHifEvalModal();
    let isMouseDownOnBackdrop = false;
    modal.onmousedown = (e) => {
        isMouseDownOnBackdrop = (e.target === modal);
    };
    modal.onmouseup = (e) => {
        if (isMouseDownOnBackdrop && e.target === modal) {
            closeHifEvalModal();
        }
        isMouseDownOnBackdrop = false;
    };

    history.pushState({ modalOpen: modalId }, "");
}

/**
 * 초기화 확인 모달 표시
 */
export function showConfirmResetModal(onConfirm) {
    const modalId = 'calc-confirm-reset-weeks-modal'; // 동일 아이디로 백버튼 호환
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    history.pushState({ modalOpen: 'confirmResetWeeks' }, "");

    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const closeConfirmResetWeeksModal = (isPopState = false) => {
        const targetModal = document.getElementById(modalId);
        if (!targetModal) return;
        if (!isPopState) {
            history.back();
            return;
        }
        targetModal.style.display = 'none';
        targetModal.classList.add('hidden');
    };
    window.closeConfirmResetWeeksModal = closeConfirmResetWeeksModal;

    modal.innerHTML = `
        <div class="confirm-modal-content" style="border: 1px solid ${idolColor}33; border-radius: 20px; padding: 28px 24px; background: #fff; max-width: 400px; width: 90%; margin: auto; position: relative; box-shadow: 0 20px 45px rgba(0,0,0,0.18); animation: modal-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px; box-sizing: border-box;">
            <style>
                .reset-toggle-checkbox:checked + .custom-switch-slider {
                    background-color: ${idolColor} !important;
                }
                .reset-toggle-checkbox:checked + .custom-switch-slider:before {
                    transform: translateX(20px);
                }
                .custom-switch-slider {
                    background-color: #e2e8f0;
                }
                .custom-switch-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .25s cubic-bezier(0.16, 1, 0.3, 1);
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                }
                .reset-toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    user-select: none;
                    box-sizing: border-box;
                }
                .reset-toggle-row:hover {
                    background-color: #f1f5f9;
                    border-color: ${idolColor}33;
                }
                .reset-toggle-row:hover .toggle-icon {
                    border-color: ${idolColor}44;
                    color: ${idolColor};
                }
                .confirm-btn.ok:disabled {
                    opacity: 0.4 !important;
                    cursor: not-allowed !important;
                    box-shadow: none !important;
                }
            </style>

            <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 1.15rem; font-weight: 800; color: #1e293b; letter-spacing: -0.02em;">
                    ${t('calc_reset_title', {}, '초기화')}
                </div>
                <div style="font-size: 0.85rem; color: #64748b; line-height: 1.4; font-weight: 500; word-break: keep-all; padding: 0 16px;">
                    ${t('calc_reset_desc', {}, '초기화할 항목을 선택해 주세요.')}
                </div>
            </div>

            <!-- Toggles Container -->
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                
                <!-- Memories Toggle -->
                <label class="reset-toggle-row">
                    <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                        <span class="toggle-icon" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.9rem; font-weight: 700; color: #334155;">${t('calc_reset_memories', {}, '메모리')}</span>
                    </div>
                    <div class="custom-switch-wrapper" style="position: relative; width: 44px; height: 24px;">
                        <input type="checkbox" class="reset-toggle-checkbox" data-key="memories" style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <span class="custom-switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .25s; border-radius: 24px;"></span>
                    </div>
                </label>

                <!-- P-Items Toggle -->
                <label class="reset-toggle-row">
                    <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                        <span class="toggle-icon" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a5 5 0 0 0-5 5v3.66c0 .8.3 1.58.85 2.14l1.3 1.3c.55.55.85 1.3.85 2.06v.84h4v-.84c0-.76.3-1.5.85-2.06l1.3-1.3c.55-.56.85-1.34.85-2.14V7a5 5 0 0 0-5-5z"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.9rem; font-weight: 700; color: #334155;">${t('calc_reset_pitems', {}, 'P아이템')}</span>
                    </div>
                    <div class="custom-switch-wrapper" style="position: relative; width: 44px; height: 24px;">
                        <input type="checkbox" class="reset-toggle-checkbox" data-key="pItems" style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <span class="custom-switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .25s; border-radius: 24px;"></span>
                    </div>
                </label>

                <!-- Skill Cards Toggle -->
                <label class="reset-toggle-row">
                    <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                        <span class="toggle-icon" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.9rem; font-weight: 700; color: #334155;">${t('calc_reset_skillcards', {}, '스킬카드')}</span>
                    </div>
                    <div class="custom-switch-wrapper" style="position: relative; width: 44px; height: 24px;">
                        <input type="checkbox" class="reset-toggle-checkbox" data-key="skillCards" style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <span class="custom-switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .25s; border-radius: 24px;"></span>
                    </div>
                </label>

                <!-- Support Cards Toggle -->
                <label class="reset-toggle-row">
                    <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                        <span class="toggle-icon" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.9rem; font-weight: 700; color: #334155;">${t('calc_reset_supportcards', {}, '서포카 상태')}</span>
                    </div>
                    <div class="custom-switch-wrapper" style="position: relative; width: 44px; height: 24px;">
                        <input type="checkbox" class="reset-toggle-checkbox" data-key="supportCards" style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <span class="custom-switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .25s; border-radius: 24px;"></span>
                    </div>
                </label>

                <!-- Schedule Toggle -->
                <label class="reset-toggle-row">
                    <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
                        <span class="toggle-icon" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.2s;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.9rem; font-weight: 700; color: #334155;">${t('calc_reset_schedule', {}, '스케쥴')}</span>
                    </div>
                    <div class="custom-switch-wrapper" style="position: relative; width: 44px; height: 24px;">
                        <input type="checkbox" class="reset-toggle-checkbox" data-key="schedule" style="opacity: 0; width: 0; height: 0; position: absolute;">
                        <span class="custom-switch-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; transition: .25s; border-radius: 24px;"></span>
                    </div>
                </label>

            </div>
            
            <div style="display: flex; gap: 12px; width: 100%; margin-top: 6px;">
                <button class="confirm-btn cancel" style="flex: 1; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; cursor: pointer; font-size: 0.88rem; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">
                    ${t('ui_cancel', {}, '취소')}
                </button>
                <button class="confirm-btn ok" style="flex: 1.2; padding: 12px; border-radius: 12px; border: none; background: ${idolColor}; color: #fff; cursor: pointer; font-size: 0.88rem; font-weight: bold; transition: all 0.2s; box-shadow: 0 4px 12px ${idolColor}33;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    ${t('ui_confirm', {}, '확인')}
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    const okBtn = modal.querySelector('.confirm-btn.ok');
    const cancelBtn = modal.querySelector('.confirm-btn.cancel');
    const checkboxes = modal.querySelectorAll('.reset-toggle-checkbox');

    // 이전 체크 상태 복원 (기본값은 true로 설정)
    checkboxes.forEach(cb => {
        const key = cb.dataset.key;
        const saved = localStorage.getItem(`calc_reset_pref_${key}`);
        if (saved !== null) {
            cb.checked = saved === 'true';
        } else {
            cb.checked = true;
        }
    });

    const updateOkBtnState = () => {
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        okBtn.disabled = !anyChecked;
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const key = cb.dataset.key;
            localStorage.setItem(`calc_reset_pref_${key}`, cb.checked);
            updateOkBtnState();
        });
    });

    updateOkBtnState(); // Initial check

    cancelBtn.onclick = () => {
        closeConfirmResetWeeksModal();
    };

    okBtn.onclick = () => {
        closeConfirmResetWeeksModal();
        if (typeof onConfirm === 'function') {
            const results = {};
            checkboxes.forEach(cb => {
                results[cb.dataset.key] = cb.checked;
            });
            onConfirm(results);
        }
    };

    let isMouseDownOnBackdrop = false;
    modal.onmousedown = (e) => {
        isMouseDownOnBackdrop = (e.target === modal);
    };
    modal.onmouseup = (e) => {
        if (isMouseDownOnBackdrop && e.target === modal) {
            closeConfirmResetWeeksModal();
        }
        isMouseDownOnBackdrop = false;
    };
}
