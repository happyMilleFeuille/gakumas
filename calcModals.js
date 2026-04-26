// calcModals.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import { skillCardList } from './skillcarddata.js';
import { produceList } from './producedata.js';
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
    const planCards = calcStore.planCards[selectedPlan] || [];
    const filledCount = planCards.filter(id => id !== null).length;
    const isSelectingSixth = filledCount === 5 && planCards[5] === null;

    // 패널 자체에 상태 클래스 추가/제거 (CSS에서 활용)
    if (isSelectingSixth) panel.classList.add('is-selecting-sixth');
    else panel.classList.remove('is-selecting-sixth');

    const filtered = cardList.filter(c =>
        (c.plan === selectedPlan || c.plan === 'free') &&
        c.rarity !== 'R' &&
        c.type !== 'assist'
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
                <img src="images/support/${c.id}.webp" onerror="this.src='icons/card.png'">
                <img src="images/support/${c.id}_card.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_item.webp'; this.onerror=null;">
                <div class="calc-card-stars">${Array.from({ length: 4 }, (_, i) => `<img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div>
                <div class="card-bonus-overlay"><span class="bonus-val"></span></div>
                <div class="info-btn">i</div>
            </div>`;
    }).join('');

    const tabsStyle = isSelectingSixth ? 'background: #8FDDBA; border-bottom-color: #eee;' : 'background: white; border-bottom-color: #eee;';
    const contentStyle = isSelectingSixth ? 'background: #8FDDBA;' : 'background: white;';

    panel.innerHTML = `
        <div class="side-panel-tabs" style="${tabsStyle} position: relative;">
            <div class="panel-tab-item"><img src="icons/vocal.png"></div>
            <div class="panel-tab-item"><img src="icons/dance.png"></div>
            <div class="panel-tab-item"><img src="icons/visual.png"></div>
            ${isSelectingSixth ? '<span class="rental-badge" style="position: absolute; top: 2px; left: 6px; font-size: 8px; font-weight: bold; color: #fff; letter-spacing: 0.5px; z-index: 10; opacity: 0.8;">RENTAL</span>' : ''}
        </div>
        <div class="side-panel-content" style="${contentStyle}">
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
                        const isJa = state.currentLang === 'ja';
                        const toastMsg = isJa ? "カード枚数(20枚以上)の条件は常に満たすものとします。" : "카드 갯수(20장 이상) 조건은 항상 만족함으로 취급합니다.";
                        showTemporaryToast(toastMsg);
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
                            badge.textContent = 'RENTAL';
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
        document.body.appendChild(overlay); overlay.onclick = closeSupportCardPanel;
    }

    renderSidePanelContent(panel, selectedPlan);
    const planCards = calcStore.planCards[selectedPlan] || [];
    planCards.forEach(id => {
        if (!id) return;
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
    if (calcStore.isKyouka && (activePlan === 'logic' || activePlan === 'sense' || activePlan === 'anomaly') ) {
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

            // Logic Headers
            if (activePlan === 'logic') {
                if (groups.goodimpression.length > 0) {
                    cardGroups.push([`header-goodimpression`]);
                    groups.goodimpression.forEach(id => cardGroups.push([id]));
                }
                if (groups.motivation.length > 0) {
                    cardGroups.push([`header-motivation`]);
                    groups.motivation.forEach(id => cardGroups.push([id]));
                }
            }
            // Sense Headers
            if (activePlan === 'sense') {
                if (groups.goodcondition.length > 0) {
                    cardGroups.push([`header-goodcondition`]);
                    groups.goodcondition.forEach(id => cardGroups.push([id]));
                }
                if (groups.concentration.length > 0) {
                    cardGroups.push([`header-concentration`]);
                    groups.concentration.forEach(id => cardGroups.push([id]));
                }
            }
            // Anomaly Headers
            if (activePlan === 'anomaly') {
                if (groups.enthusiasm.length > 0) {
                    cardGroups.push([`header-enthusiasm`]);
                    groups.enthusiasm.forEach(id => cardGroups.push([id]));
                }
                if (groups.fullpower.length > 0) {
                    cardGroups.push([`header-fullpower`]);
                    groups.fullpower.forEach(id => cardGroups.push([id]));
                }
            }
            
            if (groups.others.length > 0) {
                groups.others.forEach(id => cardGroups.push([id]));
            }
        }
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '40000';
    modal.addEventListener('mousedown', (e) => e.stopPropagation());
    modal.addEventListener('click', (e) => e.stopPropagation());

    const isJa = state.currentLang === 'ja';
    const renderCardItem = (id) => {
        if (id.startsWith('header-')) {
            const type = id.replace('header-', '');
            let label = '';
            const icon = `<img src="icons/${type}.webp" style="width: 18px; height: 18px; object-fit: contain;">`;
            if (type === 'goodimpression') {
                label = isJa ? '[強化月間] 好印象' : '[강화월간] 호인상';
            } else if (type === 'motivation') {
                label = isJa ? '[強化月間] やる気' : '[강화월간] 의욕';
            } else if (type === 'concentration') {
                label = isJa ? '[強化月間] 集中' : '[강화월간] 집중';
            } else if (type === 'goodcondition') {
                label = isJa ? '[強化月間] 好調' : '[강화월간] 호조';
            } else if (type === 'enthusiasm') {
                label = isJa ? '[強化月間] 強気' : '[강화월간] 강기';
            } else if (type === 'fullpower') {
                label = isJa ? '[強化月間] 全力' : '[강화월간] 전력';
            }
            return `<div class="tune-card-group-header" style="grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; background: #f3e5f5; padding: 6px 10px; font-size: 0.85rem; font-weight: bold; color: #9c27b0; border-radius: 6px; margin-top: 8px; border-left: 4px solid #9c27b0;">${icon}<span>${label}</span></div>`;
        }
        if (id === 'trouble') {
            const tCount = counts.total.get_t || 0;
            return `
                <div class="tune-card-item selected" data-id="trouble" style="pointer-events: none; opacity: 0.9; filter: saturate(1.2);">
                    <img src="icons/cal/card/trouble.webp">
                    <div class="card-count-badge ${tCount > 1 ? '' : 'hidden'}">x${tCount}</div>
                </div>`;
        }
        const skill = skillCardList[id] || {}, count = selectedSkills[id] || 0, isSelected = count > 0;
        let imgSrc = `icons/cal/card/${id}.webp`;
        if (skill.isKyoukaOnly) {
            const parts = id.split('-');
            const plan = parts[0];
            const fileName = parts.slice(1).join('-');
            imgSrc = `idols/${plan}/${fileName}.webp`;
        }
        return `
            <div class="tune-card-item ${isSelected ? 'selected' : ''}" data-id="${id}" ${skill.multi ? 'data-multi="true"' : ''}>
                <img src="${imgSrc}" onerror="this.parentElement.style.display='none';">
                <div class="card-count-badge ${count > 1 ? '' : 'hidden'}">x${count}</div>
                <div class="card-reset-btn ${isSelected && skill.multi ? '' : 'hidden'}">×</div>
            </div>`;
    };

    if (counts.total.get_t > 0) cardGroups.unshift(['trouble']);


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
            if (!id) return;
            if (calcStore.cardChecked[id]) {
                const card = cardList.find(c => c.id === id);
                if (card && card.have?.startsWith('card_')) total++;
            }
        });
        const titleEl = document.getElementById('modal-tune-title');
        if (titleEl) {
            const planLabel = isJa ? (currentPlan === 'sense' ? 'センス' : (currentPlan === 'logic' ? 'ロジック' : 'アノマリー')) : currentPlan.toUpperCase();
            const kyoukaPrefix = calcStore.isKyouka ? (isJa ? '[強化月間] ' : '[강화월간] ') : '';
            titleEl.textContent = isJa ? `${kyoukaPrefix}${planLabel}カード選択 (${total} / ${boardGetCount})` : `${kyoukaPrefix}${currentPlan.toUpperCase()} 카드 선택 (${total} / ${boardGetCount})`;
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
