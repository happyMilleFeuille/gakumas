// calcUI.js
import { state } from './state.js';
import { activityOptions } from './calcOptions.js';
import { idolData } from './calcStats.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';

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

    // 4. 드링크 묶음 (단순 표시용)
    const drinkGetCount = Number(extraCounts.get_drink) || 0;
    const drinkBuyCount = Number(extraCounts.purchase_drink) || 0;
    const totalDrink = drinkGetCount + drinkBuyCount;
    let drinkDisplay = `
        <div class="enhance-item-content" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.2);">
            <span class="dist-label">드링크 <span class="counter-count" style="color: #4caf50;">${totalDrink}</span></span>
            <div class="dist-group">
                <div class="dist-unit"><span>획득</span><span class="dist-val" style="color: #4caf50;">${drinkGetCount}</span></div>
                <div class="dist-unit"><span>구매</span><span class="dist-val" style="color: #4caf50;">${drinkBuyCount}</span></div>
            </div>
        </div>
    `;

    // 5. 기타 획득 묶음 (SSR, 원기 + 플랜별 스탯) - 버튼 추가
    const renderOtherUnit = (label, key, val, color) => `
        <div class="dist-unit" style="width: auto; gap: 4px; align-items: center;">
            <span style="font-size: 0.75rem;">${label}</span>
            <div style="display:flex; align-items:center; gap:2px;">
                 <button class="dist-btn other-btn minus" data-target="${key}">-</button>
                 <span class="dist-val" style="color: ${color}; min-width:16px;">${val}</span>
                 <button class="dist-btn other-btn plus" data-target="${key}">+</button>
            </div>
        </div>
    `;

    let otherGetItems = renderOtherUnit('SSR', 'get_ssr', extraCounts.get_ssr, '#673ab7') +
                        renderOtherUnit('원기', 'get_genki', extraCounts.get_genki, '#ff5722');

    if (currentPlan === 'sense') {
        otherGetItems += renderOtherUnit('호조', 'get_goodcondition', extraCounts.get_goodcondition, '#e91e63') +
                         renderOtherUnit('집중', 'get_concentration', extraCounts.get_concentration, '#e91e63');
    } else if (currentPlan === 'logic') {
        otherGetItems += renderOtherUnit('의욕', 'get_motivation', extraCounts.get_motivation, '#2196f3') +
                         renderOtherUnit('호인상', 'get_goodimpression', extraCounts.get_goodimpression, '#2196f3');
    } else if (currentPlan === 'anomaly') {
        otherGetItems += renderOtherUnit('온존', 'get_preservation', extraCounts.get_preservation, '#9c27b0') +
                         renderOtherUnit('강기', 'get_enthusiasm', extraCounts.get_enthusiasm, '#9c27b0') +
                         renderOtherUnit('전력', 'get_fullpower', extraCounts.get_fullpower, '#9c27b0');
    }
    
    // 합계 계산 (SSR + 원기 + 플랜별 스탯)
    const hasAnyOtherGet = extraCounts.get_ssr > 0 || extraCounts.get_genki > 0 || 
                           (currentPlan === 'sense' && (extraCounts.get_goodcondition > 0 || extraCounts.get_concentration > 0)) ||
                           (currentPlan === 'logic' && (extraCounts.get_motivation > 0 || extraCounts.get_goodimpression > 0)) ||
                           (currentPlan === 'anomaly' && (extraCounts.get_preservation > 0 || extraCounts.get_enthusiasm > 0 || extraCounts.get_fullpower > 0));

    let otherGetDisplay = `
        <div class="enhance-item-content" style="background: rgba(156, 39, 176, 0.05); border-color: rgba(156, 39, 176, 0.2); padding: 6px 10px; width: auto; min-width: 120px;">
            <div class="dist-group" style="flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 6px 12px;">
                ${otherGetItems}
            </div>
        </div>
    `;

    html += `
        <div class="counter-divider" style="width: 100%; height: 1px; background: rgba(0,0,0,0.08); margin: 2px 0;"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: center; color: #555; font-weight: 500;">
            <div class="text-count-item" style="opacity: ${totalEnhance > 0 ? 1 : 0.4}; border:none; padding:0;">${enhanceDisplay}</div>
            <div class="text-count-item" style="opacity: ${totalDelete > 0 ? 1 : 0.4}; border:none; padding:0;">${deleteDisplay}</div>
            <div class="text-count-item" style="opacity: ${totalGet > 0 ? 1 : 0.4}; border:none; padding:0;">${getDisplay}</div>
            <div class="text-count-item" style="opacity: ${totalDrink > 0 ? 1 : 0.4}; border:none; padding:0;">${drinkDisplay}</div>
            <div class="text-count-item" style="opacity: ${hasAnyOtherGet ? 1 : 0.4}; border:none; padding:0;">${otherGetDisplay}</div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_item > 0 ? 1 : 0.4}">아이템획득 <span class="counter-count">${extraCounts.get_item}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.change > 0 ? 1 : 0.4}">체인지 <span class="counter-count">${extraCounts.change}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.customize > 0 ? 1 : 0.4}">개조 <span class="counter-count">${extraCounts.customize}</span></div>
        </div>
    `;
    counterContainer.innerHTML = html;
}

/**
 * 상단 선택된 카드 슬롯 UI 업데이트
 */
export function updateSelectedCardsUI(selectedIds, calcType) {
    const container = document.getElementById('selected-support-container');
    if (!container) return;

    const saved = JSON.parse(localStorage.getItem(`calc_state_${calcType}`)) || {};
    const cardChecked = saved.cardChecked || {};

    container.innerHTML = Array.from({length: 6}, (_, i) => {
        const cardId = selectedIds[i];
        if (cardId) {
            const checked = cardChecked[cardId] ? 'checked' : '';
            
            return `<div class="selected-card-slot filled" data-id="${cardId}">
                        <img src="images/support/${cardId}_card.webp" 
                             onerror="this.src='images/support/${cardId}_item.webp'; this.onerror=null;">
                        <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked}>
                    </div>`;
        }
        return `<div class="selected-card-slot empty"></div>`;
    }).join('');
}

/**
 * 상단 스탯 헤더(링 포함) 업데이트
 */
export function updateStatHeaderUI(cardBonusTotal, idolId, selectedIds, calcType) {
    const voEl = document.getElementById('total-vocal');
    const daEl = document.getElementById('total-dance');
    const viEl = document.getElementById('total-visual');

    if (voEl) voEl.textContent = cardBonusTotal.vocal > 0 ? `+${cardBonusTotal.vocal}` : '0';
    if (daEl) daEl.textContent = cardBonusTotal.dance > 0 ? `+${cardBonusTotal.dance}` : '0';
    if (viEl) viEl.textContent = cardBonusTotal.visual > 0 ? `+${cardBonusTotal.visual}` : '0';

    // SP 레슨 발생률 합계 계산
    const spTotals = { vocal: 0, dance: 0, visual: 0 };
    if (selectedIds && selectedIds.length > 0) {
        selectedIds.forEach(id => {
            const card = cardList.find(c => c.id === id);
            if (card && card.abilities && card.abilities.includes('sp_lessonup')) {
                const lb = state.supportLB[id] || 0;
                const ability = abilityData['sp_lessonup'];
                if (ability) {
                    const rarity = card.rarity || 'SSR';
                    const isDist = card.source === 'dist';
                    let rarityKey = rarity;
                    if (rarity === 'SSR' && isDist && ability.levels['SSR_DIST']) rarityKey = 'SSR_DIST';
                    
                    const bonusLevels = ability.levels[rarityKey] || ability.levels[rarity] || ability.levels;
                    const val = bonusLevels[lb >= 2 ? 2 : 1] || bonusLevels[1];
                    
                    if (spTotals.hasOwnProperty(card.type)) {
                        spTotals[card.type] += val;
                    }
                }
            }
        });
    }

    const spVoEl = document.getElementById('sp-vocal-percent');
    const spDaEl = document.getElementById('sp-dance-percent');
    const spViEl = document.getElementById('sp-visual-percent');

    if (spVoEl) spVoEl.textContent = `sp (+${spTotals.vocal}%)`;
    if (spDaEl) spDaEl.textContent = `sp (+${spTotals.dance}%)`;
    if (spViEl) spViEl.textContent = `sp (+${spTotals.visual}%)`;

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
