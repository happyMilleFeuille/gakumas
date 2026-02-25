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
            <div class="counter-item" style="position: relative; flex-direction: column; height: 36px; min-width: 32px;">
                <div style="display: flex; align-items: center; gap: 2px; opacity: ${count > 0 ? 1 : 0.3};">
                    <img src="icons/cal/${val}.webp" alt="${val}" style="width: 20px; height: 20px;">
                    <span class="counter-count">${count}</span>
                </div>
                ${spCount > 0 ? `<div style="font-size: 0.65rem; color: #ff4d8d; font-weight: bold; margin-top: -2px; opacity: ${count > 0 ? 1 : 0.3};">SP ${spCount}</div>` : ''}
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
            <span class="dist-label" style="opacity: ${totalEnhance > 0 ? 1 : 0.3};">강화 <span class="counter-count">${totalEnhance}</span></span>
            <div class="dist-group" style="opacity: ${totalEnhance > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val">${mCount}</span><button class="dist-btn plus" data-dist="m" style="opacity: 1 !important;">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val">${aCount}</span><button class="dist-btn plus" data-dist="a" style="opacity: 1 !important;">+</button></div>
            </div>
        </div>
    `;

    // 2. 삭제 분배기
    const totalDelete = Number(extraCounts.delete) || 0;
    const mDelCount = Number(extraCounts.delete_m) || 0;
    const aDelCount = Number(extraCounts.delete_a) || 0;
    let deleteDisplay = `
        <div class="enhance-item-content" style="background: rgba(0, 0, 0, 0.05); border-color: rgba(0, 0, 0, 0.1);">
            <span class="dist-label" style="opacity: ${totalDelete > 0 ? 1 : 0.3};">삭제 <span class="counter-count" style="color: #555;">${totalDelete}</span></span>
            <div class="dist-group" style="opacity: ${totalDelete > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val" style="color: #555;">${mDelCount}</span><button class="dist-btn plus" data-dist="dm" style="opacity: 1 !important;">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val" style="color: #555;">${aDelCount}</span><button class="dist-btn plus" data-dist="da" style="opacity: 1 !important;">+</button></div>
            </div>
        </div>
    `;

    // 3. 카드 획득 분배기
    const totalGet = Number(extraCounts.get) || 0;
    const mGetCount = Number(extraCounts.get_m) || 0;
    const aGetCount = Number(extraCounts.get_a) || 0;
    let getDisplay = `
        <div class="enhance-item-content" style="background: rgba(255, 193, 7, 0.05); border-color: rgba(255, 193, 7, 0.2);">
            <span class="dist-label" style="opacity: ${totalGet > 0 ? 1 : 0.3};">카드획득 <span class="counter-count" style="color: #ff9800;">${totalGet}</span></span>
            <div class="dist-group" style="opacity: ${totalGet > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val" style="color: #ff9800;">${mGetCount}</span></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val" style="color: #ff9800;">${aGetCount}</span></div>
            </div>
        </div>
    `;

    // 4. 드링크 묶음
    const drinkGetCount = Number(extraCounts.get_drink) || 0;
    const drinkBuyCount = Number(extraCounts.purchase_drink) || 0;
    const totalDrink = drinkGetCount + drinkBuyCount;
    let drinkDisplay = `
        <div class="enhance-item-content" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.2);">
            <span class="dist-label" style="opacity: ${totalDrink > 0 ? 1 : 0.3};">드링크 <span class="counter-count" style="color: #4caf50;">${totalDrink}</span></span>
            <div class="dist-group" style="opacity: ${totalDrink > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>획득</span><span class="dist-val" style="color: #4caf50;">${drinkGetCount}</span></div>
                <div class="dist-unit"><span>구매</span><span class="dist-val" style="color: #4caf50;">${drinkBuyCount}</span></div>
            </div>
        </div>
    `;

    // 5. 기타 획득 묶음
    const renderOtherUnit = (label, key, val, color) => `
        <div class="dist-unit" style="width: auto; gap: 4px; align-items: center;">
            <span style="font-size: 0.75rem;">${label}</span>
            <div style="display:flex; align-items:center; gap:2px;">
                 <span class="dist-val" style="color: ${color}; min-width:16px;">${val}</span>
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

    const hasAnyOtherGet = extraCounts.get_ssr > 0 || extraCounts.get_genki > 0 || 
                           (currentPlan === 'sense' && (extraCounts.get_goodcondition > 0 || extraCounts.get_concentration > 0)) ||
                           (currentPlan === 'logic' && (extraCounts.get_motivation > 0 || extraCounts.get_goodimpression > 0)) ||
                           (currentPlan === 'anomaly' && (extraCounts.get_preservation > 0 || extraCounts.get_enthusiasm > 0 || extraCounts.get_fullpower > 0));

    let otherGetDisplay = `
        <div class="enhance-item-content" style="background: rgba(156, 39, 176, 0.05); border-color: rgba(156, 39, 176, 0.2); padding: 6px 10px; width: auto; min-width: 120px; position: relative; padding-right: 35px;">
            <div class="dist-group" style="flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 6px 12px; opacity: ${hasAnyOtherGet ? 1 : 0.3};">
                ${otherGetItems}
            </div>
            <button class="other-tune-btn" id="btn-other-tune" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; padding: 0; font-size: 0.65rem; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; opacity: 1 !important;">조정</button>
        </div>
    `;

    html += `
        <div class="counter-divider" style="width: 100%; height: 1px; background: rgba(0,0,0,0.08); margin: 2px 0;"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px 12px; justify-content: center; color: #555; font-weight: 500;">
            <div class="text-count-item" style="border:none; padding:0;">${enhanceDisplay}</div>
            <div class="text-count-item" style="border:none; padding:0;">${deleteDisplay}</div>
            <div class="text-count-item" style="border:none; padding:0;">${getDisplay}</div>
            <div class="text-count-item" style="border:none; padding:0;">${drinkDisplay}</div>
            <div class="text-count-item" style="border:none; padding:0;">${otherGetDisplay}</div>
            <div class="text-count-item" style="opacity: ${extraCounts.get_item > 0 ? 1 : 0.3}">아이템획득 <span class="counter-count">${extraCounts.get_item}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.change > 0 ? 1 : 0.3}">체인지 <span class="counter-count">${extraCounts.change}</span></div>
            <div class="text-count-item" style="opacity: ${extraCounts.customize > 0 ? 1 : 0.3}">개조 <span class="counter-count">${extraCounts.customize}</span></div>
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
    const itemCounters = saved.itemCounters || {};
    
    // 동적 max 계산을 위해 현재 집계된 카운트 필요 (없으면 99로 대체)
    // 실제 정밀한 max는 calc.js에서 넘어온 데이터를 쓰면 좋지만, 일단 UI 표시용으로만 처리
    const currentCounts = saved.lastCounts || {}; 

    container.innerHTML = Array.from({length: 6}, (_, i) => {
        const cardId = selectedIds[i];
        if (cardId) {
            const card = cardList.find(c => c.id === cardId);
            const checked = cardChecked[cardId] ? 'checked' : '';
            const counter = itemCounters[cardId] || 0;
            
            let counterHtml = '';
            if (card && card.item_effects) {
                const needsCounter = card.item_effects.some(e => e.type === 'action' || e.type === 'add_count');
                if (needsCounter) {
                    counterHtml = `
                        <div class="card-item-counter">
                            <button class="card-counter-btn minus" data-id="${cardId}">-</button>
                            <span class="card-counter-val">${counter}</span>
                            <button class="card-counter-btn plus" data-id="${cardId}">+</button>
                        </div>
                    `;
                }
            }
            
            return `<div class="selected-card-slot filled" data-id="${cardId}">
                        <div class="slot-frame">
                            <img src="images/support/${cardId}_card.webp" 
                                 onerror="this.src='images/support/${cardId}_item.webp'; this.onerror=null;">
                            <div class="card-slot-remove" data-id="${cardId}" style="position:absolute; top:-6px; left:-6px; width:16px; height:16px; background:red; color:white; border-radius:50%; font-size:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-weight:bold; z-index:10; line-height:1;">×</div>
                            <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked}>
                        </div>
                        ${counterHtml}
                    </div>`;
        }
        return `<div class="selected-card-slot empty">
                    <div class="slot-frame"></div>
                </div>`;
    }).join('');
}

/**
 * 계산기 메뉴 렌더링
 */
export function renderCalcMenu(updatePageTranslations, onHajime, onNia) {
    const root = document.getElementById('calc-root');
    if (!root) return;
    root.innerHTML = `<div class="calc-menu-container"><h2 data-i18n="calc_title">계산기 메뉴</h2><div class="calc-buttons"><button class="primary-btn" id="btn-hajime">Hajime</button><button class="primary-btn" id="btn-nia">N.i.a</button></div></div>`;
    updatePageTranslations();
    document.getElementById('btn-hajime').onclick = onHajime;
    document.getElementById('btn-nia').onclick = onNia;
}

/**
 * 주간 계획표 보드 렌더링
 */
export function renderWeeklyPlan(type, calcPlans, idolList, handlers) {
    const root = document.getElementById('calc-root');
    const planData = calcPlans[type];
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || { weeks: {}, planCards: {} };
    
    if (!savedState.selectedIdol) savedState.selectedIdol = idolList[0];
    if (!savedState.planType) savedState.planType = 'sense';

    const idolsHtml = idolList.map(name => `<div class="idol-sel-item" data-id="${name}"><img src="icons/idolicons/${name}.png" onerror="this.src='icons/idol.png'"></div>`).join('');
    const weekNumbers = Object.keys(planData.weeks).map(Number).sort((a, b) => b - a);
    
    let weeksHtml = weekNumbers.map(i => {
        const options = planData.weeks[i] || [];
        const savedWeek = (savedState.weeks || {})[i] || {};
        const optionsHtml = options.map(opt => {
            const isActive = savedWeek.value === opt.value;
            const resData = (opt.results || opt.result) ? ` data-results="${(opt.results || opt.result).join(',')}"` : '';
            let optAttrs = isActive && savedWeek.opts ? Object.keys(savedWeek.opts).map(k => ` data-opt${k}="${savedWeek.opts[k]}"`).join('') : '';
            return `<div class="plan-icon-wrapper ${['audition', 'test', 'oikomi'].includes(opt.value) ? 'large-icon' : ''} ${isActive ? 'active' : ''}" data-value="${opt.value}" ${optAttrs} ${resData}><img src="icons/cal/${opt.value}.webp" class="plan-icon-img"></div>`;
        }).join('');
        return `<div class="week-row" data-week="${i}"><div class="week-header"><span class="week-label">${i}주</span></div><div class="plan-icons-container">${optionsHtml}</div></div>`;
    }).join('');

    const pItemHtml = type === 'nia' ? `
        <div class="p-item-container" id="p-item-container" style="position: relative; padding-left: 28px;">
            <div class="p-item-info-btn" style="position: absolute; left: 5px; top: 5px; width: 20px; height: 20px; border-radius: 50%; background: #ddd; color: #555; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; cursor: pointer;">i</div>
            <div class="p-item-slot" data-index="0"></div>
            <div class="p-item-slot" data-index="1"></div>
            <div class="p-item-slot" data-index="2"></div>
            <div class="p-item-slot" data-index="3"></div>
            <div class="p-item-slot" data-index="4"></div>
        </div>
    ` : '';

    root.innerHTML = `<div class="calc-container"><div class="calc-main-wrapper"><div class="calc-actions top"><button class="calc-btn primary-btn" id="btn-run-calc">계산</button><button class="back-btn primary-btn">뒤로가기</button></div><div class="idol-selector-grid" id="idol-selector-grid">${idolsHtml}</div><div class="plan-type-selector"><div class="plan-type-btn" data-type="sense"><img src="icons/sense.webp"></div><div class="plan-type-btn" data-type="logic"><img src="icons/logic.webp"></div><div class="plan-type-btn" data-type="anomaly"><img src="icons/anomaly.webp"></div></div>${pItemHtml}<div class="selected-support-container" id="selected-support-container"></div><div class="stat-header">
    <div class="stat-item"><img src="icons/vocal.png" alt="Vocal"><span id="total-vocal">0</span><span id="sp-vocal-percent" class="sp-percent-label"></span></div>
    <div class="stat-item"><img src="icons/dance.png" alt="Dance"><span id="total-dance">0</span><span id="sp-dance-percent" class="sp-percent-label"></span></div>
    <div class="stat-item"><img src="icons/visual.png" alt="Visual"><span id="total-visual">0</span><span id="sp-visual-percent" class="sp-percent-label"></span></div>
</div>
<div class="activity-counter" id="activity-counter"></div><div class="board-toggle-bar" id="board-toggle-bar">주간 행동 닫기 ▲</div><div class="unified-plan-board" data-calc-type="${type}">${weeksHtml}</div></div></div>`;

    const board = document.querySelector('.unified-plan-board');
    if (savedState.isBoardCollapsed) board.classList.add('collapsed-board');

    const savedIdolItem = root.querySelector(`.idol-sel-item[data-id="${savedState.selectedIdol}"]`);
    if (savedIdolItem) {
        savedIdolItem.classList.add('active');
        requestAnimationFrame(() => savedIdolItem.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' }));
    }
    const activePlan = savedState.planType || 'sense';
    const savedPlanBtn = root.querySelector(`.plan-type-btn[data-type="${activePlan}"]`);
    if (savedPlanBtn) savedPlanBtn.classList.add('active');

    if (activePlan && savedState.planCards && savedState.planCards[activePlan]) {
        updateSelectedCardsUI(savedState.planCards[activePlan], type);
    }

    // 저장된 뱃지 및 라벨 UI 복원
    root.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        updateSPBadge(wrapper);
        updateMainLabel(wrapper);
    });

    // 핸들러 연결
    handlers.setupBackBtn(); 
    handlers.setupPlanTypeSelector(); 
    handlers.setupIdolSelector(); 
    handlers.setupIconToggles(); 
    handlers.setupCalcAction(); 
    handlers.setupPItemSelector(type);
}

export function updateSPBadge(w) { w.querySelector('.sp-badge')?.remove(); if (w.classList.contains('active') && w.dataset.optsp === 'true') { const b = document.createElement('div'); b.className = 'sp-badge'; b.textContent = 'SP'; w.appendChild(b); } }
export function updateMainLabel(w) {
    w.querySelector('.main-label-text')?.remove(); if (!w.classList.contains('active')) return;
    const labels = (activityOptions[w.dataset.value] || []).filter(o => o.mainlabel && (o.type === 'counter' ? parseInt(w.dataset[`opt${o.id}`]) > 0 : w.dataset[`opt${o.id}`] === 'true')).map(o => o.type === 'counter' ? `${o.mainlabel} ${w.dataset[`opt${o.id}`]}` : o.mainlabel);
    if (labels.length > 0) { const l = document.createElement('div'); l.className = 'main-label-text'; l.textContent = labels.join(' '); w.appendChild(l); }
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

