// calcUI.js
import { state } from './state.js';
import { activityOptions } from './calcOptions.js';
import { idolData } from './calcStats.js';

/**
 * 하단 활동 카운터 UI 업데이트
 */
export function updateActivityCountsUI(counts, spCounts, extraCounts, currentPlan, allPossibleValues, sortOrder, calcType) {
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

    // 1. 강화 분배기
    const totalEnhance = Number(extraCounts.enhance) || 0;
    const mCount = Number(extraCounts.enhance_m) || 0;
    const aCount = Number(extraCounts.enhance_a) || 0;
    let enhanceDisplay = `
        <div class="enhance-item-content">
            <span class="dist-label">강화 <span class="counter-count">${totalEnhance}</span></span>
            <div class="dist-group">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val">${mCount}</span><button class="dist-btn plus" data-dist="m">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val">${aCount}</span><button class="dist-btn plus" data-dist="a">+</button></div>
            </div>
        </div>
    `;

    // 2. 삭제 분배기
    const totalDelete = Number(extraCounts.delete) || 0;
    const mDelCount = Number(extraCounts.delete_m) || 0;
    const aDelCount = Number(extraCounts.delete_a) || 0;
    let deleteDisplay = `
        <div class="enhance-item-content" style="background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.1);">
            <span class="dist-label">삭제 <span class="counter-count" style="color: #555;">${totalDelete}</span></span>
            <div class="dist-group">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val" style="color: #555;">${mDelCount}</span><button class="dist-btn plus" data-dist="dm">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val" style="color: #555;">${aDelCount}</span><button class="dist-btn plus" data-dist="da">+</button></div>
            </div>
        </div>
    `;

    // 3. 카드 획득 분배기
    const totalGet = Number(extraCounts.get) || 0;
    const mGetCount = Number(extraCounts.get_m) || 0;
    const aGetCount = Number(extraCounts.get_a) || 0;
    let getDisplay = `
        <div class="enhance-item-content" style="background: rgba(255, 193, 7, 0.05); border-color: rgba(255, 193, 7, 0.2);">
            <span class="dist-label">카드획득 <span class="counter-count" style="color: #ff9800;">${totalGet}</span></span>
            <div class="dist-group">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val" style="color: #ff9800;">${mGetCount}</span><button class="dist-btn plus" data-dist="gm">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val" style="color: #ff9800;">${aGetCount}</span><button class="dist-btn plus" data-dist="ga">+</button></div>
            </div>
        </div>
    `;

    html += `
        <div class="counter-divider" style="width: 100%; height: 1px; background: rgba(0,0,0,0.08); margin: 2px 0;"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: center; color: #555; font-weight: 500;">
            <div class="text-count-item" style="opacity: ${totalEnhance > 0 ? 1 : 0.4}; border:none; padding:0;">${enhanceDisplay}</div>
            <div class="text-count-item" style="opacity: ${totalDelete > 0 ? 1 : 0.4}; border:none; padding:0;">${deleteDisplay}</div>
            <div class="text-count-item" style="opacity: ${totalGet > 0 ? 1 : 0.4}; border:none; padding:0;">${getDisplay}</div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_ssr > 0 ? 1 : 0.4}">SSR획득 <span class="counter-count">${extraCounts.get_ssr}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_drink > 0 ? 1 : 0.4}">드링크획득 <span class="counter-count">${extraCounts.get_drink}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.purchase_drink > 0 ? 1 : 0.4}">드링크구매 <span class="counter-count">${extraCounts.purchase_drink}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.change > 0 ? 1 : 0.4}">체인지 <span class="counter-count">${extraCounts.change}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.customize > 0 ? 1 : 0.4}">개조 <span class="counter-count">${extraCounts.customize}</span></div>
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
