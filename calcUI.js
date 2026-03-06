// calcUI.js
import { state, idolColors } from './state.js';
import { activityOptions } from './calcOptions.js';
import { idolData } from './calcStats.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';

/**
 * 하단 활동 카운터 UI 업데이트
 */
export function updateActivityCountsUI(store, counts) {
    const counterContainer = document.getElementById('activity-counter');
    if (!counterContainer) return;

    // 1. 메인 활동 아이콘들 (레슨, 휴식 등)
    const allPossibleValues = Array.from(new Set(Object.values(store.weeks).map(w => w.value))).filter(v => v);
    const sortOrder = ['lessonvo', 'lessondan', 'lessonvi', 'class_hajime', 'class_nia', 'goout_hajime', 'goout_nia', 'gift_hajime', 'gift_nia', 'advice', 'spclass', 'audition', 'test', 'oikomi'];
    
    allPossibleValues.sort((a, b) => {
        let indexA = sortOrder.indexOf(a), indexB = sortOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    let html = '<div class="main-counts">';
    allPossibleValues.forEach(val => {
        const count = counts.total[val] || 0;
        const spCount = (val === 'lessonvo' ? counts.lessons.vocal.sp : (val === 'lessondan' ? counts.lessons.dance.sp : (val === 'lessonvi' ? counts.lessons.visual.sp : 0)));
        
        html += `
            <div class="counter-item" style="position: relative; flex-direction: column; height: 36px; min-width: 32px;">
                <div style="display: flex; align-items: center; gap: 2px; opacity: ${count > 0 ? 1 : 0.3};">
                    <img src="icons/cal/${val}.webp" alt="${val}" style="width: 20px; height: 20px;">
                    <span class="counter-count">${count}</span>
                </div>
                ${spCount > 0 ? `<div style="font-size: 0.65rem; color: #ff4d8d; font-weight: bold; margin-top: -2px;">SP ${spCount}</div>` : ''}
            </div>
        `;
    });
    html += '</div>';

    // 2. 분배기 및 기타 수치 (강화, 삭제, 카드획득, 드링크, 특수 스탯)
    const renderDist = (label, total, m, a, color = '#ff4d8d', bg = 'rgba(255, 77, 141, 0.05)', type = 'e') => `
        <div class="enhance-item-content" style="background: ${bg}; border-color: ${color}33;">
            <span class="dist-label" style="opacity: ${total > 0 ? 1 : 0.3}; color: ${color};">${label} <span class="counter-count">${total}</span></span>
            <div class="dist-group" style="opacity: ${total > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>멘탈</span><span class="dist-val">${m}</span><button class="dist-btn plus" data-dist="${type}m">+</button></div>
                <div class="dist-unit"><span>액티브</span><span class="dist-val">${a}</span><button class="dist-btn plus" data-dist="${type}a">+</button></div>
            </div>
        </div>
    `;

    // 드링크 섹션
    const drinkTotal = (counts.total.get_drink || 0) + (counts.total.purchase_drink || 0);
    const drinkDisplay = `
        <div class="enhance-item-content" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.2);">
            <span class="dist-label" style="opacity: ${drinkTotal > 0 ? 1 : 0.3}; color: #4caf50;">드링크 <span class="counter-count">${drinkTotal}</span></span>
            <div class="dist-group" style="opacity: ${drinkTotal > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>획득</span><span class="dist-val" style="color: #4caf50;">${counts.total.get_drink || 0}</span></div>
                <div class="dist-unit"><span>구매</span><span class="dist-val" style="color: #4caf50;">${counts.total.purchase_drink || 0}</span></div>
            </div>
        </div>
    `;

    // 특수 스탯 (SSR, 원기, 호조 등) 및 조정 버튼
    const renderOtherUnit = (label, key, color) => `
        <div class="dist-unit" style="width: auto; gap: 4px; align-items: center;">
            <span style="font-size: 0.75rem;">${label}</span>
            <span class="dist-val" style="color: ${color}; min-width:12px;">${counts.total[key] || 0}</span>
        </div>
    `;

    let otherGetItems = renderOtherUnit('SSR', 'get_ssr', '#673ab7') + renderOtherUnit('원기', 'get_genki', '#ff5722');
    if (store.planType === 'sense') {
        otherGetItems += renderOtherUnit('호조', 'get_goodcondition', '#e91e63') + renderOtherUnit('집중', 'get_concentration', '#e91e63');
    } else if (store.planType === 'logic') {
        otherGetItems += renderOtherUnit('의욕', 'get_motivation', '#2196f3') + renderOtherUnit('호인상', 'get_goodimpression', '#2196f3');
    } else if (store.planType === 'anomaly') {
        otherGetItems += renderOtherUnit('온존', 'get_preservation', '#9c27b0') + renderOtherUnit('강기', 'get_enthusiasm', '#9c27b0') + renderOtherUnit('전력', 'get_fullpower', '#9c27b0');
    }

    const otherGetDisplay = `
        <div class="enhance-item-content" style="background: rgba(156, 39, 176, 0.05); border-color: rgba(156, 39, 176, 0.2); padding-right: 35px; position: relative; min-width: 140px;">
            <div class="dist-group" style="flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px 8px;">
                ${otherGetItems}
            </div>
            <button class="other-tune-btn" id="btn-other-tune" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.65rem;">조정</button>
        </div>
    `;

    html += `
        <div class="counter-divider"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
            <div class="text-count-item">${renderDist('강화', counts.total.enhance || 0, counts.total.enhance_m || 0, counts.total.enhance_a || 0, '#ff4d8d', 'rgba(255, 77, 141, 0.05)', 'e')}</div>
            <div class="text-count-item">${renderDist('삭제', (counts.total.delete || 0) + (counts.total.delete_t || 0), counts.total.delete_m || 0, counts.total.delete_a || 0, '#555', 'rgba(0,0,0,0.05)', 'd')}</div>
            <div class="text-count-item">
                <div class="enhance-item-content" style="background: rgba(255, 152, 0, 0.05); border-color: rgba(255, 152, 0, 0.2);">
                    <span class="dist-label" style="opacity: ${counts.total.get > 0 ? 1 : 0.3}; color: #ff9800;">카드획득 <span class="counter-count">${counts.total.get || 0}</span></span>
                    <div class="dist-group" style="opacity: ${counts.total.get > 0 ? 1 : 0.3};">
                        <div class="dist-unit"><span>멘탈</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_m || 0}</span></div>
                        <div class="dist-unit"><span>액티브</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_a || 0}</span></div>
                    </div>
                </div>
            </div>
            <div class="text-count-item">${drinkDisplay}</div>
            <div class="text-count-item">${otherGetDisplay}</div>
            <div class="text-count-item" style="opacity: ${counts.total.get_item > 0 ? 1 : 0.3}">아이템 <span class="counter-count">${counts.total.get_item || 0}</span></div>
            <div class="text-count-item" style="opacity: ${counts.total.change > 0 ? 1 : 0.3}">체인지 <span class="counter-count">${counts.total.change || 0}</span></div>
        </div>
    `;
    counterContainer.innerHTML = html;
}

/**
 * 상단 선택된 카드 슬롯 UI 업데이트
 */
export function updateSelectedCardsUI(store) {
    const container = document.getElementById('selected-support-container');
    if (!container) return;

    const selectedIds = store.planCards[store.planType] || [];
    const isAllEmpty = selectedIds.every(id => !id);

    container.innerHTML = Array.from({length: 6}, (_, i) => {
        const cardId = selectedIds[i];
        if (cardId) {
            // ... (기존 로직 유지) ...
            const cardData = cardList.find(c => c.id === cardId);
            const checked = store.cardChecked[cardId] ? 'checked' : '';
            const optChecked = store.cardExtraChecked[cardId] ? 'checked' : '';
            const counter = store.itemCounters[cardId] || 0;
            
            let counterHtml = '';
            if (cardData?.item_effects?.some(e => e.type === 'action' || e.type === 'add_count')) {
                counterHtml = `
                    <div class="card-item-counter">
                        <button class="card-counter-btn minus" data-id="${cardId}">-</button>
                        <span class="card-counter-val">${counter}</span>
                        <button class="card-counter-btn plus" data-id="${cardId}">+</button>
                    </div>
                `;
            }

            // extra2 옵션 라벨 결정
            let optLabel = '';
            if (cardData?.extra2) {
                const e2 = cardData.extra2;
                if (e2.includes('enhance')) optLabel = '강화';
                else if (e2.includes('change')) optLabel = '체인지';
                else if (e2.includes('del')) optLabel = '삭제';
                else optLabel = '옵션';
            }
            
            const optCheckHtml = cardData?.extra2 ? `
                <div class="card-opt-row">
                    <label class="opt-check-label">
                        <input type="checkbox" class="card-opt-check" data-id="${cardId}" ${optChecked}>
                        <span>${optLabel}</span>
                    </label>
                </div>
            ` : `<div class="card-opt-row no-opt"></div>`;
            
            return `<div class="selected-card-slot filled" data-id="${cardId}">
                        ${optCheckHtml}
                        <div class="slot-frame">
                            <img src="images/support/${cardId}_card.webp" onerror="this.src='images/support/${cardId}_item.webp'; this.onerror=null;">
                            <div class="card-slot-remove" data-id="${cardId}">×</div>
                            <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked}>
                        </div>
                        ${counterHtml}
                    </div>`;
        }
        
        // 전부 비어있으면 공백 제거, 하나라도 있으면 공백 유지
        return `<div class="selected-card-slot empty">
                    ${isAllEmpty ? '' : '<div class="card-opt-row no-opt"></div>'}
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
    
    // 즐겨찾기 아이돌 색상 가져오기 (릴리야 보정 포함)
    const favIdol = state.favoriteIdol || 'saki';
    const getIdolDisplayColor = (id) => (id === 'lilja') ? "#a0e6ff" : (idolColors[id] || "#ff4d8d");
    const color = getIdolDisplayColor(favIdol);

    root.innerHTML = `
        <div class="calc-menu-container">
            <div class="calc-buttons">
                <img src="images/hajime.webp" id="btn-hajime" class="calc-menu-img" alt="Hajime" style="border-color: ${color}; box-shadow: 0 4px 15px ${color}33;">
                <img src="images/nia.webp" id="btn-nia" class="calc-menu-img" alt="N.i.a" style="border-color: ${color}; box-shadow: 0 4px 15px ${color}33;">
            </div>
        </div>`;
    updatePageTranslations();
    document.getElementById('btn-hajime').onclick = onHajime;
    document.getElementById('btn-nia').onclick = onNia;
}

/**
 * 계산기 전체 화면 렌더링
 */
export function renderWeeklyPlan(store, calcPlans, idolList, handlers) {
    const root = document.getElementById('calc-root');
    const planData = calcPlans[store.type];
    
    const getIdolDisplayColor = (id) => (id === 'lilja') ? "#a0e6ff" : (idolColors[id] || "#ff4d8d");
    
    const idolsHtml = idolList.map(name => {
        const isActive = store.selectedIdol === name;
        const color = getIdolDisplayColor(name);
        const style = isActive ? `style="border-color: ${color}; border-width: 3px; box-shadow: 0 0 12px ${color}b3; transform: scale(1.1);"` : '';
        return `<div class="idol-sel-item ${isActive ? 'active' : ''}" data-id="${name}" ${style}><img src="icons/idolicons/${name}.png" onerror="this.src='icons/idol.png'"></div>`;
    }).join('');
    
    const idolColor = getIdolDisplayColor(store.selectedIdol);
    const weekNumbers = Object.keys(planData.weeks).map(Number).sort((a, b) => b - a);
    const weeksHtml = weekNumbers.map(i => {
        const options = planData.weeks[i] || [];
        const savedWeek = store.weeks[i] || {};
        const optionsHtml = options.map(opt => {
            const isActive = savedWeek.value === opt.value;
            const isLarge = ['audition', 'test', 'oikomi'].includes(opt.value);
            let optAttrs = isActive && savedWeek.opts ? Object.keys(savedWeek.opts).map(k => ` data-opt${k}="${savedWeek.opts[k]}"`).join('') : '';
            
            let activeStyle = '';
            if (isActive) {
                if (isLarge) {
                    // 이미지 외곽을 따라가는 선명한 테두리 + 캐릭터 색상의 얕은 그림자
                    activeStyle = `style="filter: drop-shadow(1.5px 0 0 ${idolColor}) drop-shadow(-1.5px 0 0 ${idolColor}) drop-shadow(0 1.5px 0 ${idolColor}) drop-shadow(0 -1.5px 0 ${idolColor}) drop-shadow(0 0 5px ${idolColor});"`;
                } else {
                    activeStyle = `style="border-color: ${idolColor}; box-shadow: 0 0 8px ${idolColor}66;"`;
                }
            }
            
            return `<div class="plan-icon-wrapper ${isLarge ? 'large-icon' : ''} ${isActive ? 'active' : ''}" data-value="${opt.value}" ${optAttrs} ${activeStyle}><img src="icons/cal/${opt.value}.webp" class="plan-icon-img"></div>`;
        }).join('');
        return `<div class="week-row" data-week="${i}"><div class="week-header"><span class="week-label">${i}주</span></div><div class="plan-icons-container">${optionsHtml}</div></div>`;
    }).join('');

    root.innerHTML = `
        <div class="calc-container">
            <div class="calc-main-wrapper">
                <div class="calc-actions top">
                    <button class="calc-btn primary-btn" id="btn-run-calc" style="background-color: ${idolColor}; box-shadow: 0 2px 6px ${idolColor}33;">계산</button>
                    <button class="back-btn primary-btn">뒤로가기</button>
                </div>
                <div class="idol-selector-grid" id="idol-selector-grid">${idolsHtml}</div>
                <div class="plan-type-selector">
                    ${['sense', 'logic', 'anomaly'].map(pt => {
                        const isActive = store.planType === pt;
                        const activeStyle = isActive ? `style="border-color: ${idolColor}; box-shadow: 0 0 8px ${idolColor}66; opacity: 1; transform: scale(1.1);"` : '';
                        return `<div class="plan-type-btn ${isActive ? 'active' : ''}" data-type="${pt}" ${activeStyle}><img src="icons/${pt}.webp"></div>`;
                    }).join('')}
                </div>

                <div class="stat-header" style="border-color: ${idolColor};">
                    <div class="total-stats-sum" id="total-stats-sum-container" style="background-color: ${idolColor}; box-shadow: 0 2px 6px ${idolColor}33;">
                        <span class="sum-label">TOTAL</span>
                        <span id="total-stats-sum-value">0</span>
                    </div>
                    <div class="stat-items-row">
                        <div class="stat-item item-vocal"><img src="icons/vocal.png"><span id="total-vocal">0</span><span id="sp-vocal-percent" class="sp-percent-label"></span></div>
                        <div class="stat-item item-dance"><img src="icons/dance.png"><span id="total-dance">0</span><span id="sp-dance-percent" class="sp-percent-label"></span></div>
                        <div class="stat-item item-visual"><img src="icons/visual.png"><span id="total-visual">0</span><span id="sp-visual-percent" class="sp-percent-label"></span></div>
                    </div>
                </div>

                ${(store.type === 'nia' || store.type === 'hajime') ? `
                <div class="p-item-container" id="p-item-container">
                    <button class="p-item-info-btn" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: white; font-size: 12px; cursor: pointer; flex-shrink: 0;">?</button>
                    ${Array.from({length: store.type === 'nia' ? 5 : 4}).map((_, i) => `
                        <div class="p-item-slot" data-idx="${i}"></div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="selected-support-container" id="selected-support-container"></div>
                <div class="activity-counter" id="activity-counter"></div>                <div class="board-toggle-bar" id="board-toggle-bar">${store.isBoardCollapsed ? '주간 행동 열기 ▼' : '주간 행동 닫기 ▲'}</div>
                <div class="unified-plan-board ${store.isBoardCollapsed ? 'collapsed-board' : ''}" data-calc-type="${store.type}">${weeksHtml}</div>
            </div>
        </div>
    `;

    root.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
        updateSPBadge(w, store.selectedIdol);
        updateMainLabel(w);
    });

    handlers.setupAll();
}

export function updateSPBadge(w, currentIdolId) { 
    w.querySelector('.sp-badge')?.remove(); 
    if (w.dataset.optsp === 'true') { 
        const b = document.createElement('div'); b.className = 'sp-badge'; b.textContent = 'SP'; 
        
        // 현재 선택된 아이돌의 색상 적용 (릴리야 보정 포함)
        const getIdolDisplayColor = (id) => (id === 'lilja') ? "#a0e6ff" : (idolColors[id] || "#ff4d8d");
        b.style.backgroundColor = getIdolDisplayColor(currentIdolId || 'saki');

        w.appendChild(b); 
    } 
}

export function updateMainLabel(w) {
    w.querySelector('.main-label-text')?.remove();
    const opts = activityOptions[w.dataset.value] || [];
    const labels = opts.filter(o => o.mainlabel && (o.type === 'counter' ? parseInt(w.dataset[`opt${o.id}`]) > 0 : w.dataset[`opt${o.id}`] === 'true')).map(o => o.type === 'counter' ? `${o.mainlabel} ${w.dataset[`opt${o.id}`]}` : o.mainlabel);
    if (labels.length > 0) { 
        const l = document.createElement('div'); l.className = 'main-label-text'; l.textContent = labels.join(' '); w.appendChild(l); 
    }
}

export function updateStatHeaderUI(store, cardBonusTotal, spTotals) {
    const attrs = ['vocal', 'dance', 'visual'];
    const idolInfo = idolData[store.selectedIdol];

    let sum = 0;
    attrs.forEach(attr => {
        const totalEl = document.getElementById(`total-${attr}`);
        const spEl = document.getElementById(`sp-${attr}-percent`);
        const itemEl = document.querySelector(`.stat-item.item-${attr}`);

        const val = cardBonusTotal[attr] || 0;
        sum += val;

        if (totalEl) totalEl.textContent = val > 0 ? `+${val}` : '0';
        if (spEl) spEl.textContent = `sp (+${spTotals[attr]}%)`;

        // 특화 순위(Rank) 클래스 적용
        if (itemEl && idolInfo) {
            const rank = idolInfo.priority.indexOf(attr) + 1; // 1, 2, 3순위
            itemEl.classList.remove('rank-1', 'rank-2', 'rank-3');
            if (rank > 0) itemEl.classList.add(`rank-${rank}`);
        }
    });

    const sumEl = document.getElementById('total-stats-sum-value');
    if (sumEl) sumEl.textContent = sum > 0 ? `+${sum}` : '0';
}
