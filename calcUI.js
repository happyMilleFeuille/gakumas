// calcUI.js
import { state } from './state.js';
import { activityOptions } from './calcOptions.js';
import { idolData } from './calcStats.js';

/**
 * 하단 활동 카운터 UI 업데이트
 */
export function updateActivityCountsUI(counts, spCounts, extraCounts, currentPlan, allPossibleValues, sortOrder) {
    const counterContainer = document.getElementById('activity-counter');
    if (!counterContainer) return;

    allPossibleValues.sort((a, b) => {
        let indexA = sortOrder.indexOf(a);
        let indexB = sortOrder.indexOf(b);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
    });

    let html = '<div class="main-counts">';
    allPossibleValues.forEach(val => {
        const count = counts[val] || 0;
        const spCount = spCounts[val] || 0;
        html += `
            <div class="counter-item" style="opacity: ${count > 0 ? 1 : 0.3}; position: relative; flex-direction: column; height: 36px; min-width: 32px;">
                <div style="display: flex; align-items: center; gap: 2px;">
                    <img src="icons/cal/${val}.webp" alt="${val}" style="width: 20px; height: 20px;">
                    <span class="counter-count">${count}</span>
                </div>
                ${spCount > 0 ? `<div style="font-size: 0.65rem; color: #ff4d8d; font-weight: bold; margin-top: -2px;">SP ${spCount}</div>` : ''}
            </div>
        `;
    });
    html += '</div>';

    html += `
        <div class="counter-divider" style="width: 100%; height: 1px; background: rgba(0,0,0,0.08); margin: 2px 0;"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: center; color: #555; font-weight: 500;">
            <div class="text-count-item" style="opacity: ${extraCounts.enhance > 0 ? 1 : 0.4}">강화 <span class="counter-count">${extraCounts.enhance}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.enhance_m > 0 ? 1 : 0.4}">멘탈강화 <span class="counter-count">${extraCounts.enhance_m}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.enhance_a > 0 ? 1 : 0.4}">액티브강화 <span class="counter-count">${extraCounts.enhance_a}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.delete > 0 ? 1 : 0.4}">삭제 <span class="counter-count">${extraCounts.delete}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.delete_m > 0 ? 1 : 0.4}">멘탈삭제 <span class="counter-count">${extraCounts.delete_m}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.delete_a > 0 ? 1 : 0.4}">액티브삭제 <span class="counter-count">${extraCounts.delete_a}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_drink > 0 ? 1 : 0.4}">드링크획득 <span class="counter-count">${extraCounts.get_drink}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.purchase_drink > 0 ? 1 : 0.4}">드링크구매 <span class="counter-count">${extraCounts.purchase_drink}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.change > 0 ? 1 : 0.4}">체인지 <span class="counter-count">${extraCounts.change}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.customize > 0 ? 1 : 0.4}">개조 <span class="counter-count">${extraCounts.customize}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get > 0 ? 1 : 0.4}">카드획득 <span class="counter-count">${extraCounts.get}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_m > 0 ? 1 : 0.4}">멘탈획득 <span class="counter-count">${extraCounts.get_m}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_a > 0 ? 1 : 0.4}">액티브획득 <span class="counter-count">${extraCounts.get_a}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_ssr > 0 ? 1 : 0.4}">SSR획득 <span class="counter-count">${extraCounts.get_ssr}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_genki > 0 ? 1 : 0.4}">원기획득 <span class="counter-count">${extraCounts.get_genki}</span></div>
            ${currentPlan === 'sense' ? `
                <div class="text-count-item" style="opacity: ${extraCounts.get_goodcondition > 0 ? 1 : 0.4}">호조획득 <span class="counter-count">${extraCounts.get_goodcondition}</span></div>
                <div class="text-count-item" style="opacity: ${extraCounts.get_concentration > 0 ? 1 : 0.4}">집중획득 <span class="counter-count">${extraCounts.get_concentration}</span></div>
            ` : ''}
            ${currentPlan === 'logic' ? `
                <div class="text-count-item" style="opacity: ${extraCounts.get_motivation > 0 ? 1 : 0.4}">의욕획득 <span class="counter-count">${extraCounts.get_motivation}</span></div>
                <div class="text-count-item" style="opacity: ${extraCounts.get_goodimpression > 0 ? 1 : 0.4}">호인상획득 <span class="counter-count">${extraCounts.get_goodimpression}</span></div>
            ` : ''}
            ${currentPlan === 'anomaly' ? `
                <div class="text-count-item" style="opacity: ${extraCounts.get_preservation > 0 ? 1 : 0.4}">온존획득 <span class="counter-count">${extraCounts.get_preservation}</span></div>
                <div class="text-count-item" style="opacity: ${extraCounts.get_enthusiasm > 0 ? 1 : 0.4}">강기획득 <span class="counter-count">${extraCounts.get_enthusiasm}</span></div>
                <div class="text-count-item" style="opacity: ${extraCounts.get_fullpower > 0 ? 1 : 0.4}">전력획득 <span class="counter-count">${extraCounts.get_fullpower}</span></div>
            ` : ''}
        </div>
    `;
    counterContainer.innerHTML = html;
}

/**
 * 상단 선택된 카드 슬롯 UI 업데이트
 */
export function updateSelectedCardsUI(selectedIds) {
    const container = document.getElementById('selected-support-container');
    if (!container) return;

    container.innerHTML = Array.from({length: 6}, (_, i) => {
        const cardId = selectedIds[i];
        if (cardId) {
            return `<div class="selected-card-slot filled" data-id="${cardId}">
                        <img src="images/support/${cardId}_card.webp" 
                             onerror="this.src='images/support/${cardId}_item.webp'; this.onerror=null;">
                    </div>`;
        }
        return `<div class="selected-card-slot empty"></div>`;
    }).join('');
}

/**
 * 상단 스탯 헤더(링 포함) 업데이트
 */
export function updateStatHeaderUI(cardBonusTotal, idolId) {
    const voEl = document.getElementById('total-vocal');
    const daEl = document.getElementById('total-dance');
    const viEl = document.getElementById('total-visual');

    if (voEl) voEl.textContent = cardBonusTotal.vocal > 0 ? `+${cardBonusTotal.vocal}` : '0';
    if (daEl) daEl.textContent = cardBonusTotal.dance > 0 ? `+${cardBonusTotal.dance}` : '0';
    if (viEl) viEl.textContent = cardBonusTotal.visual > 0 ? `+${cardBonusTotal.visual}` : '0';

    const data = idolData[idolId];
    if (data) {
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            const img = item.querySelector('img');
            const type = img.alt.toLowerCase();
            const rank = data.priority.indexOf(type) + 1;
            item.classList.remove('rank-1', 'rank-2', 'rank-3', 'item-vocal', 'item-dance', 'item-visual');
            item.classList.add(`item-${type}`);
            if (rank > 0) item.classList.add(`rank-${rank}`);
        });
    }
}
