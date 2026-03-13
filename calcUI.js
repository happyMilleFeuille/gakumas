// calcUI.js
import { state, idolColors } from './state.js';
import { activityOptions } from './calcOptions.js';
import { idolData } from './calcData.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calcStore } from './calcStore.js';
import { showMemorySelectModal } from './calcModals.js';

/**
 * 아이돌별 표시 색상 반환 (릴리야 보정 포함)
 */
export const getIdolDisplayColor = (id) => (idolColors[id] || "#ff4d8d");

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

    const isJa = state.currentLang === 'ja';

    const renderDist = (label, total, m, a, color = '#ff4d8d', bg = 'rgba(255, 77, 141, 0.05)', type = 'e') => `
        <div class="enhance-item-content compact-dist" style="background: ${bg}; border-color: ${color}33;">
            <span class="dist-label" style="opacity: ${total > 0 ? 1 : 0.3}; color: ${color};">${label} <span class="counter-count">${total}</span></span>
            <div class="dist-group" style="opacity: ${total > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>${isJa ? 'メンタル' : '멘탈'}</span><span class="dist-val">${m}</span><button class="dist-btn plus" data-dist="${type}m">+</button></div>
                <div class="dist-unit"><span>${isJa ? 'アクティブ' : '액티브'}</span><span class="dist-val">${a}</span><button class="dist-btn plus" data-dist="${type}a">+</button></div>
            </div>
        </div>
    `;

    const drinkTotal = (counts.total.get_drink || 0) + (counts.total.purchase_drink || 0);
    const drinkDisplay = `
        <div class="enhance-item-content compact-dist" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.2);">
            <span class="dist-label" style="opacity: ${drinkTotal > 0 ? 1 : 0.3}; color: #4caf50;">${isJa ? 'ドリンク' : '드링크'} <span class="counter-count">${drinkTotal}</span></span>
            <div class="dist-group" style="opacity: ${drinkTotal > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>${isJa ? '獲得' : '획득'}</span><span class="dist-val" style="color: #4caf50;">${counts.total.get_drink || 0}</span></div>
                <div class="dist-unit"><span>${isJa ? '交換' : '구매'}</span><span class="dist-val" style="color: #4caf50;">${counts.total.purchase_drink || 0}</span></div>
            </div>
        </div>
    `;

    const renderOtherUnit = (label, key, color) => `
        <div class="dist-unit">
            <span>${label}</span>
            <span class="dist-val" style="color: ${color};">${counts.total[key] || 0}</span>
        </div>
    `;

    let otherGetItems = renderOtherUnit('SSR', 'get_ssr', '#673ab7') + renderOtherUnit(isJa ? '元気' : '원기', 'get_genki', '#ff5722');
    if (store.planType === 'sense') {
        otherGetItems += renderOtherUnit(isJa ? '好調' : '호조', 'get_goodcondition', '#e91e63') + renderOtherUnit(isJa ? '集中' : '집중', 'get_concentration', '#e91e63');
    } else if (store.planType === 'logic') {
        otherGetItems += renderOtherUnit(isJa ? 'やる気' : '의욕', 'get_motivation', '#2196f3') + renderOtherUnit(isJa ? '好印象' : '호인상', 'get_goodimpression', '#2196f3');
    } else if (store.planType === 'anomaly') {
        otherGetItems += renderOtherUnit(isJa ? '温存' : '온존', 'get_preservation', '#9c27b0') + renderOtherUnit(isJa ? '強気' : '강기', 'get_enthusiasm', '#9c27b0') + renderOtherUnit(isJa ? '全力' : '전력', 'get_fullpower', '#9c27b0');
    }

    const otherGetDisplay = `
        <div class="enhance-item-content compact-dist has-tune-btn" style="background: rgba(156, 39, 176, 0.05); border-color: rgba(156, 39, 176, 0.2); position: relative; min-width: 140px;">
            <div class="dist-group" style="flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px 8px;">
                ${otherGetItems}
            </div>
            <button class="other-tune-btn" id="btn-other-tune" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); min-width: 26px; width: auto; height: 26px; padding: 0 4px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.65rem; white-space: nowrap;">${isJa ? '調整' : '조정'}</button>
        </div>
    `;

    html += `
        <div class="counter-divider"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: flex-start;">
            <!-- Column 1: Enhance & Delete -->
            <div class="counter-column">
                <div class="text-count-item">${renderDist(isJa ? '強化' : '강화', counts.total.enhance || 0, counts.total.enhance_m || 0, counts.total.enhance_a || 0, '#ff4d8d', 'rgba(255, 77, 141, 0.05)', 'e')}</div>
                <div class="text-count-item">
                    <div class="enhance-item-content compact-dist" style="background: rgba(0,0,0,0.05); border-color: #555333;">
                        <span class="dist-label" style="opacity: ${((counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)) > 0 ? 1 : 0.3}; color: #555;">${isJa ? '削除' : '삭제'} <span class="counter-count">${(counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)}</span></span>
                        <div class="dist-group" style="opacity: ${((counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)) > 0 ? 1 : 0.3};">
                            <div class="dist-unit"><span>${isJa ? 'メンタル' : '멘탈'}</span><span class="dist-val">${counts.total.delete_m || 0}</span><button class="dist-btn plus" data-dist="dm">+</button></div>
                            <div class="dist-unit"><span>${isJa ? 'アクティブ' : '액티브'}</span><span class="dist-val">${counts.total.delete_a || 0}</span><button class="dist-btn plus" data-dist="da">+</button></div>
                            <div class="dist-unit">
                                <span>${isJa ? 'トラブル' : '트러블'}</span>
                                <span class="dist-val">${counts.total.delete_t || 0}${(() => {
            const rawTotal = (counts.total.delete_t_before_cap || counts.total.delete_t);
            const excess = Math.max(0, rawTotal - counts.total.delete_t);
            return excess > 0 ? `<span style="color: #ff4d8d; font-size: 0.6rem; margin-left: 1px; font-weight: normal;">(-${excess})</span>` : '';
        })()}</span>
                                <button class="dist-btn plus" data-dist="dt">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 2: Drink & Item/Change -->
            <div class="counter-column">
                <div class="text-count-item">${drinkDisplay}</div>
                <div class="text-count-item">
                    <div class="enhance-item-content compact-dist" style="background: rgba(33, 150, 243, 0.05); border-color: rgba(33, 150, 243, 0.2);">
                        <div class="dist-group">
                            <div class="dist-unit" style="opacity: ${counts.total.get_item > 0 ? 1 : 0.3}">
                                <span>${isJa ? 'アイテム' : '아이템'}</span>
                                <span class="dist-val" style="color: #2196f3;">${counts.total.get_item || 0}</span>
                            </div>
                            <div class="dist-unit" style="opacity: ${counts.total.change > 0 ? 1 : 0.3}">
                                <span>${isJa ? 'チェンジ' : '체인지'}</span>
                                <span class="dist-val" style="color: #2196f3;">${counts.total.change || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 3: Card Get -->
            <div class="counter-column">
                <div class="text-count-item">
                    <div class="enhance-item-content compact-dist has-tune-btn" style="background: rgba(255, 152, 0, 0.05); border-color: rgba(255, 152, 0, 0.2); position: relative;">
                        <span class="dist-label" style="opacity: ${counts.total.get > 0 ? 1 : 0.3}; color: #ff9800;">${isJa ? 'カード獲得' : '카드획득'} <span class="counter-count">${counts.total.get || 0}</span></span>
                        <div class="dist-group" style="opacity: ${counts.total.get > 0 ? 1 : 0.3};">
                            <div class="dist-unit"><span>${isJa ? 'メンタル' : '멘탈'}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_m || 0}</span></div>
                            <div class="dist-unit"><span>${isJa ? 'アクティブ' : '액티브'}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_a || 0}</span></div>
                            <div class="dist-unit"><span>${isJa ? 'トラブル' : '트러블'}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_t || 0}</span></div>
                        </div>
                        <div style="width: 100%; height: 1px; background: rgba(255,152,0,0.1); margin: 4px 0;"></div>
                        <div class="dist-group">
                            ${otherGetItems}
                        </div>
                        <div style="width: 100%; height: 1px; background: rgba(156,39,176,0.1); margin: 4px 0;"></div>
                        <button class="other-tune-btn" id="btn-other-tune" style="width: 85%; height: 26px; margin: 6px auto 8px; display: block; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.65rem;">${isJa ? '選択' : '선택'}</button>
                    </div>
                </div>
            </div>
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

    const selectedIds = (store.planCards[store.planType] || []).filter(id => !state.disabledCards[id]);
    const isAllEmpty = selectedIds.length === 0;
    const isJa = state.currentLang === 'ja';

    // Initialize 6 empty slots if they don't exist yet
    if (container.children.length !== 6) {
        container.innerHTML = Array.from({ length: 6 }, () => `
            <div class="selected-card-slot empty">
                <div class="card-opt-row no-opt"></div>
                <div class="slot-frame"></div>
                <!-- counter goes here -->
            </div>
        `).join('');
    }

    // Update each of the 6 slots
    for (let i = 0; i < 6; i++) {
        const slotEl = container.children[i];
        const cardId = selectedIds[i];

        if (cardId) {
            const cardData = cardList.find(c => c.id === cardId);
            const checked = store.cardChecked[cardId];
            const optChecked = store.cardExtraChecked[cardId];
            const eventChecked = store.cardEventChecked[cardId];
            const counter = store.itemCounters[cardId] || 0;

            // Update slot base attributes
            slotEl.dataset.id = cardId;
            slotEl.classList.remove('empty');
            slotEl.classList.add('filled');

            // 1. Opt check row
            let extraOptHtml = '';
            if (cardData?.extra2) {
                let optLabel = '';
                const e2 = cardData.extra2;
                if (e2.includes('enhance')) optLabel = isJa ? '強化' : '강화';
                else if (e2.includes('change')) optLabel = isJa ? 'チェンジ' : '체인지';
                else if (e2.includes('del')) optLabel = isJa ? '削除' : '삭제';
                else optLabel = isJa ? 'オプション' : '옵션';

                extraOptHtml = `
                    <label class="opt-check-label">
                        <input type="checkbox" class="card-opt-check" data-id="${cardId}" ${optChecked ? 'checked' : ''}>
                        <span>${optLabel}</span>
                    </label>
                `;
            }

            const optCheckHtml = `
                <div class="card-opt-row">
                    <div class="opt-line">${extraOptHtml || ''}</div>
                    <div class="opt-line">
                        <label class="opt-check-label">
                            <input type="checkbox" class="card-event-check" data-id="${cardId}" ${eventChecked ? 'checked' : ''}>
                            <span>${isJa ? 'イベント' : '이벤트'}</span>
                        </label>
                    </div>
                </div>
            `;

            let optRow = slotEl.querySelector('.card-opt-row');
            if (optRow) optRow.outerHTML = optCheckHtml;

            // 2. Slot frame (Image and check/remove controls)
            let frame = slotEl.querySelector('.slot-frame');
            if (!frame.querySelector('img')) {
                // If it was empty, construct inner elements
                frame.style.borderColor = 'transparent';
                frame.innerHTML = `
                    <img src="images/support/${cardId}_card.webp" onerror="this.src='images/support/${cardId}_item.webp'; this.onerror=null;">
                    <div class="card-slot-remove" data-id="${cardId}">×</div>
                    <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked ? 'checked' : ''}>
                `;
            } else {
                // Targeted update
                const img = frame.querySelector('img');
                const targetSrc = `images/support/${cardId}_card.webp`;
                // Only update src if the card changed, to prevent flickering
                if (!img.src.endsWith(targetSrc)) {
                    img.src = targetSrc;
                    img.onerror = function () { this.src = 'images/support/' + cardId + '_item.webp'; this.onerror = null; };
                }
                frame.querySelector('.card-slot-remove').dataset.id = cardId;
                const slotCheck = frame.querySelector('.card-slot-check');
                slotCheck.dataset.id = cardId;
                slotCheck.checked = !!checked;
            }

            // 3. Counter
            let counterContainer = slotEl.querySelector('.card-item-counter');
            if (cardData?.item_effects?.some(e => e.type === 'action' || e.type === 'add_count')) {
                if (!counterContainer) {
                    slotEl.insertAdjacentHTML('beforeend', `
                        <div class="card-item-counter">
                            <button class="card-counter-btn minus" data-id="${cardId}">-</button>
                            <span class="card-counter-val">${counter}</span>
                            <button class="card-counter-btn plus" data-id="${cardId}">+</button>
                        </div>
                    `);
                } else {
                    counterContainer.querySelector('.card-counter-val').textContent = counter;
                    counterContainer.querySelectorAll('.card-counter-btn').forEach(b => b.dataset.id = cardId);
                }
            } else {
                if (counterContainer) counterContainer.remove();
            }

        } else {
            // Empty slot
            delete slotEl.dataset.id;
            slotEl.classList.remove('filled');
            slotEl.classList.add('empty');

            let optRow = slotEl.querySelector('.card-opt-row');
            if (optRow) {
                // 카드가 하나라도 선택되어 있다면 빈 슬롯도 높이를 맞춰야 함
                if (isAllEmpty) {
                    optRow.style.display = 'none';
                    optRow.innerHTML = '';
                } else {
                    optRow.style.display = 'flex';
                    optRow.innerHTML = '<div class="opt-line"></div><div class="opt-line"></div>';
                }
            }

            let frame = slotEl.querySelector('.slot-frame');
            frame.innerHTML = ''; // clear image and controls
            frame.style.borderColor = '';

            let counterContainer = slotEl.querySelector('.card-item-counter');
            if (counterContainer) counterContainer.remove();
        }
    }
}

/**
 * 계산기 메뉴 렌더링
 */
export function renderCalcMenu(updatePageTranslations, onHajime, onNia) {
    const root = document.getElementById('calc-root');
    if (!root) return;

    const favIdol = state.favoriteIdol || 'saki';
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
    const isJa = state.currentLang === 'ja';
    const idolColor = getIdolDisplayColor(store.selectedIdol);

    const idolsHtml = idolList.map(name => {
        const isActive = store.selectedIdol === name;
        const color = getIdolDisplayColor(name);
        const style = isActive ? `style="border-color: ${color}; border-width: 3px; box-shadow: 0 0 12px ${color}b3; transform: scale(1.1);"` : '';
        return `<div class="idol-sel-item ${isActive ? 'active' : ''}" data-id="${name}" ${style}><img src="icons/idolicons/${name}.png" onerror="this.src='icons/idol.png'"></div>`;
    }).join('');

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
                    activeStyle = `style="filter: drop-shadow(1.5px 0 0 ${idolColor}) drop-shadow(-1.5px 0 0 ${idolColor}) drop-shadow(0 1.5px 0 ${idolColor}) drop-shadow(0 -1.5px 0 ${idolColor}) drop-shadow(0 0 5px ${idolColor});"`;
                } else {
                    activeStyle = `style="border-color: ${idolColor}; box-shadow: 0 0 8px ${idolColor}66;"`;
                }
            }

            const isTestOrAudition = ['test', 'audition'].includes(opt.value);
            const infoBtnHtml = isTestOrAudition ? `<div class="info-i-btn" data-type="${opt.value}" style="background-color: ${idolColor};">i</div>` : '';

            return `
                <div class="icon-outer-container ${isLarge ? 'large-container' : ''}">
                    <div class="plan-icon-wrapper ${isLarge ? 'large-icon' : ''} ${isActive ? 'active' : ''}" data-value="${opt.value}" ${optAttrs} ${activeStyle}>
                        <img src="icons/cal/${opt.value}.webp" class="plan-icon-img">
                    </div>
                    ${infoBtnHtml}
                </div>`;
        }).join('');
        return `<div class="week-row" data-week="${i}"><div class="week-header"><span class="week-label">${i}${isJa ? '週' : '주'}</span></div><div class="plan-icons-container">${optionsHtml}</div></div>`;
    }).join('');

    root.innerHTML = `
        <div class="calc-container">
            <div class="calc-main-wrapper">
                <div class="calc-actions top">
                    <button class="calc-btn primary-btn" id="btn-run-calc" style="background-color: ${idolColor}; box-shadow: 0 2px 6px ${idolColor}33;">${isJa ? '計算' : '계산'}</button>
                    <button class="back-btn primary-btn">${isJa ? '戻る' : '뒤로가기'}</button>
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
                        <div class="stat-info-btn" id="btn-stat-info">i</div>
                    </div>
                    <div class="stat-items-row">
                        <div class="stat-item item-vocal">
                            <img src="icons/vocal.png">
                            <span id="final-vocal" class="final-stat-label" style="font-size: 0.8rem; color: #ff4d8d;">0</span>
                            <span id="total-perc-vocal" style="font-size: 0.65rem; color: #aaa; margin-top: -2px; font-weight: 600;">0%</span>
                            <div style="width: 100%; height: 1px; background: #eee; margin: 4px 0;"></div>
                            <span id="total-vocal" style="font-size: 0.8rem; height: 14px; margin-top: -2px;">0</span>
                            <span id="sp-vocal-percent" class="sp-percent-label"></span>
                        </div>
                        <div class="stat-item item-dance">
                            <img src="icons/dance.png">
                            <span id="final-dance" class="final-stat-label" style="font-size: 0.8rem; color: #46a4f3;">0</span>
                            <span id="total-perc-dance" style="font-size: 0.65rem; color: #aaa; margin-top: -2px; font-weight: 600;">0%</span>
                            <div style="width: 100%; height: 1px; background: #eee; margin: 4px 0;"></div>
                            <span id="total-dance" style="font-size: 0.8rem; height: 14px; margin-top: -2px;">0</span>
                            <span id="sp-dance-percent" class="sp-percent-label"></span>
                        </div>
                        <div class="stat-item item-visual">
                            <img src="icons/visual.png">
                            <span id="final-visual" class="final-stat-label" style="font-size: 0.8rem; color: #fcc75e;">0</span>
                            <span id="total-perc-visual" style="font-size: 0.65rem; color: #aaa; margin-top: -2px; font-weight: 600;">0%</span>
                            <div style="width: 100%; height: 1px; background: #eee; margin: 4px 0;"></div>
                            <span id="total-visual" style="font-size: 0.8rem; height: 14px; margin-top: -2px;">0</span>
                            <span id="sp-visual-percent" class="sp-percent-label"></span>
                        </div>
                    </div>
                </div>

                ${(store.type === 'nia' || store.type === 'hajime') ? `
                <div class="p-item-container" id="p-item-container" style="display: flex; flex-direction: column; width: 100%; margin-bottom: 1rem; padding: 10px; background: white; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                    
                    <!-- P-Item Row -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
                        <label style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; cursor: pointer; margin: 0 2px;">
                            <span class="p-item-check-txt">${isJa ? '재능개화 3' : '재능개화 3'}</span>
                            <input type="checkbox" id="p-item-checkbox" ${store.pItemChecked ? 'checked' : ''} style="margin: 0; accent-color: #ff4d8d; transform: scale(1.0); cursor: pointer;">
                        </label>
                        <div style="width: 1px; height: 24px; background-color: #ddd; margin: 0 4px;"></div>
                        <button class="p-item-info-btn" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ddd; background: #f8f9fa; color: #666; font-size: 12px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: bold;">i</button>
                        ${Array.from({ length: store.type === 'nia' ? 5 : 4 }).map((_, i) => `
                            <div class="p-item-slot" data-idx="${i}" style="border-color: ${store.pItems[i] ? 'transparent' : '#ddd'};"></div>
                        `).join('')}
                    </div>

                    <!-- Divider -->
                    <div style="width: 100%; height: 1px; background-color: #eee; margin: 12px 0;"></div>

                    <!-- Memory Row -->
                    <div class="memory-container" id="memory-container" style="width: 100%; --idol-color: ${idolColor}; --idol-color-transparent: ${idolColor}26;">
                        ${Array.from({ length: 4 }).map((_, i) => {
        const memArray = Array.isArray(store.memories[i]) ? store.memories[i] : (store.memories[i] ? [store.memories[i]] : []);
        let linesHtml = '';
        ['vocal', 'dance', 'visual'].forEach(sName => {
            const memKey = memArray.find(k => window.calcData?.memoryOptions?.[k]?.stat === sName);
            const opt = memKey ? window.calcData.memoryOptions[memKey] : null;
            if (opt) {
                const attrColor = (sName === 'vocal' ? '#ff4d8d' : (sName === 'dance' ? '#46a4f3' : '#fcc75e'));
                const icon = `<img src="icons/${sName}.png" style="width:12px; height:12px; vertical-align:middle; margin-right:2px; margin-top:-2px;">`;
                const valText = (isJa ? opt.label_ja : opt.label_ko).replace(/^(Vo|Da|Vi)\s*/, '');
                linesHtml += `<div class="memory-slot-line title" style="color: ${attrColor}; display:flex; align-items:center; justify-content:center; gap:2px;">${icon}<span>${valText}</span></div>`;
            } else {
                linesHtml += `<div class="memory-slot-line title">-</div>`;
            }
        });
        return `
                            <div class="memory-slot" data-idx="${i}">
                                <div class="memory-slot-badge">memory ${i + 1}</div>
                                ${linesHtml}
                            </div>
                            `;
    }).join('')}
                    </div>

                </div>
                ` : ''}

                <div class="selected-support-container" id="selected-support-container"></div>
                <div class="activity-counter" id="activity-counter"></div>
                <div class="board-toggle-bar" id="board-toggle-bar">${store.isBoardCollapsed ? (isJa ? 'スケジュールを開く ▼' : '주간 행동 열기 ▼') : (isJa ? 'スケジュールを 閉じる ▲' : '주간 행동 닫기 ▲')}</div>
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
        b.style.backgroundColor = getIdolDisplayColor(currentIdolId || 'saki');
        w.appendChild(b);
    }
}

export function updateMainLabel(w) {
    w.querySelector('.main-label-text')?.remove();
    w.querySelector('.class-attr-badge')?.remove();

    const weekNum = w.closest('.week-row')?.dataset.week;
    const week = weekNum ? calcStore.weeks[weekNum] : null;
    const savedOpts = week ? week.opts : {};

    // 속성 아이콘 추가 (Hajime/Nia 수업 전용)
    if (savedOpts && savedOpts.selectedAttr) {
        const attr = savedOpts.selectedAttr;
        const b = document.createElement('div');
        b.className = 'class-attr-badge';
        b.innerHTML = `<img src="icons/${attr}.png" alt="${attr}">`;
        w.appendChild(b);
    }

    const opts = activityOptions[w.dataset.value] || [];
    const labels = opts.filter(o => o.mainlabel && (o.type === 'counter' ? parseInt(w.dataset[`opt${o.id}`]) > 0 : w.dataset[`opt${o.id}`] === 'true')).map(o => o.type === 'counter' ? `${o.mainlabel} ${w.dataset[`opt${o.id}`]}` : o.mainlabel);
    if (labels.length > 0) {
        const l = document.createElement('div'); l.className = 'main-label-text'; l.textContent = labels.join(' '); w.appendChild(l);
    }
}

export function updateStatHeaderUI(store, breakdown) {
    const attrs = ['vocal', 'dance', 'visual'];
    const idolInfo = idolData[store.selectedIdol];
    const maxStat = store.type === 'hajime' ? 2800 : (store.type === 'nia' ? 2600 : 0);

    let sum = 0;
    attrs.forEach(attr => {
        const totalEl = document.getElementById(`total-${attr}`);
        const finalEl = document.getElementById(`final-${attr}`);
        const spEl = document.getElementById(`sp-${attr}-percent`);
        const itemEl = document.querySelector(`.stat-item.item-${attr}`);

        const bonusVal = (breakdown.supportFixed?.[attr] || 0) + (breakdown.supportPercent?.[attr] || 0);
        if (totalEl) totalEl.textContent = bonusVal > 0 ? `+${bonusVal}` : '0';

        const percEl = document.getElementById(`total-perc-${attr}`);
        if (percEl && breakdown.totalPercs) {
            percEl.textContent = `${breakdown.totalPercs[attr].toFixed(1)}%`;
        }

        const finalStat = (store.finalTotal && store.finalTotal[attr]) || 0;
        if (finalEl) {
            if (maxStat > 0) {
                if (finalStat >= maxStat) {
                    finalEl.innerHTML = `<span style="color: #e53935; font-weight: bold; font-size: 1rem;">${finalStat}</span> <span style="font-size: 0.7rem; color: #888; font-weight: normal;">/ ${maxStat}</span>`;
                } else {
                    finalEl.innerHTML = `${finalStat} <span style="font-size: 0.7rem; color: #888; font-weight: normal;">/ ${maxStat}</span>`;
                }
                if (finalStat >= maxStat) {
                    finalEl.classList.add('max-stat-glow');
                } else {
                    finalEl.classList.remove('max-stat-glow');
                }
            } else {
                finalEl.textContent = finalStat;
            }
        }
        sum += finalStat;

        // SP lesson up total display
        if (spEl && window._lastSpTotals) {
            spEl.textContent = `sp (+${window._lastSpTotals[attr]}%)`;
        }

        if (itemEl && idolInfo) {
            const rank = idolInfo.priority.indexOf(attr) + 1;
            itemEl.classList.remove('rank-1', 'rank-2', 'rank-3');
            if (rank > 0) itemEl.classList.add(`rank-${rank}`);
        }
    });

    const sumValueEl = document.getElementById('total-stats-sum-value');
    if (sumValueEl) sumValueEl.textContent = sum;
}

export function updateMemorySlotsUI(store) {
    const isJa = state.currentLang === 'ja';
    const container = document.getElementById('memory-container');
    if (!container) return;

    const idolColor = getIdolDisplayColor(store.selectedIdol || 'saki');
    container.style.setProperty('--idol-color', idolColor);
    container.style.setProperty('--idol-color-transparent', idolColor + '26');

    const slots = container.querySelectorAll('.memory-slot');
    slots.forEach((slot, i) => {
        const memArray = Array.isArray(store.memories[i]) ? store.memories[i] : (store.memories[i] ? [store.memories[i]] : []);
        let linesHtml = '';
        ['vocal', 'dance', 'visual'].forEach(sName => {
            const memKey = memArray.find(k => window.calcData?.memoryOptions?.[k]?.stat === sName);
            const opt = memKey ? window.calcData.memoryOptions[memKey] : null;
            if (opt) {
                const attrColor = (sName === 'vocal' ? '#ff4d8d' : (sName === 'dance' ? '#46a4f3' : '#fcc75e'));
                const icon = `<img src="icons/${sName}.png" style="width:12px; height:12px; vertical-align:middle; margin-right:2px; margin-top:-2px;">`;
                const valText = (isJa ? opt.label_ja : opt.label_ko).replace(/^(Vo|Da|Vi)\s*/, '');
                linesHtml += `<div class="memory-slot-line title" style="color: ${attrColor}; display:flex; align-items:center; justify-content:center; gap:2px;">${icon}<span>${valText}</span></div>`;
            } else {
                linesHtml += `<div class="memory-slot-line title">-</div>`;
            }
        });
        slot.innerHTML = `<div class="memory-slot-badge">memory ${i + 1}</div>${linesHtml}`;
    });
}

/**
 * 보드판 서브 옵션 툴팁 표시
 */
export function showSubTooltip(parent, week, wrapper, pTooltip) {
    const sub = document.createElement('div'); sub.className = 'calc-tooltip calc-sub-tooltip'; sub.style.zIndex = '1100'; sub.style.backgroundColor = '#fefefe';

    const idolId = calcStore.selectedIdol;
    const idolColor = getIdolDisplayColor(idolId);
    sub.style.border = `1px solid ${idolColor}`;

    sub.innerHTML = parent.subOptions.map(o => `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${calcStore.weeks[week].opts[o.id] === 'true' ? 'checked' : ''}><span>${o[`label_${state.currentLang}`] || o.label_ko}</span></label>`).join('');

    wrapper.appendChild(sub);
    sub.style.left = '50%';
    sub.style.top = '50%';
    sub.style.transform = 'translate(-50%, -50%)';
    sub.style.position = 'absolute';
    sub.style.width = 'max-content';

    sub.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = () => {
            if (chk.checked) {
                sub.querySelectorAll('input[type="checkbox"]').forEach(other => {
                    if (other !== chk && other.checked) {
                        other.checked = false;
                        calcStore.updateWeekOpt(week, other.dataset.id, false);
                    }
                });
            }
            calcStore.updateWeekOpt(week, chk.dataset.id, chk.checked);
            calcStore.save();
            const iconWrapper = wrapper.querySelector('.plan-icon-wrapper');
            if (iconWrapper) {
                if (chk.checked) iconWrapper.dataset[`opt${chk.dataset.id}`] = 'true';
                else delete iconWrapper.dataset[`opt${chk.dataset.id}`];
                updateMainLabel(iconWrapper);
            }
            if (window.refreshAll) window.refreshAll();
        };
    });
}

/**
 * P-아이템 선택 툴팁 표시
 */
export function showPItemSelectorTooltip(slot, idx, itemsBySlot, refreshAll) {
    document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove());

    const isMobile = window.innerWidth <= 768;
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const tooltip = document.createElement('div');
    tooltip.className = 'calc-tooltip p-item-tooltip';
    const tooltipPadding = isMobile ? '8px' : '12px';
    const targetWidth = isMobile ? '175px' : '215px';
    tooltip.style.cssText = `flex-direction:row; flex-wrap:wrap; width:${targetWidth}; min-width:140px; gap:8px; justify-content:flex-start; padding:${tooltipPadding}; box-sizing:border-box; border: 2px solid ${idolColor};`;

    const btnSize = isMobile ? '32px' : '40px';
    const clearBtn = document.createElement('div');
    clearBtn.textContent = 'X'; clearBtn.className = 'calc-btn-square';
    clearBtn.style.cssText = `width:${btnSize}; height:${btnSize}; min-width:0 !important; aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center; font-size:${isMobile ? '1rem' : '1.2rem'}; background:#f8f9fa; color:#888; border:1px solid #ddd; cursor:pointer; box-sizing:border-box; border-radius:4px;`;
    clearBtn.onclick = () => {
        calcStore.pItems[idx] = null;
        slot.innerHTML = '<span class="p-item-placeholder">+</span>';
        calcStore.save(); refreshAll(); tooltip.remove();
    };
    tooltip.appendChild(clearBtn);

    const slotItems = itemsBySlot[idx] || [];
    slotItems.forEach(item => {
        const img = document.createElement('img');
        img.src = `icons/cal/${item}.webp`;
        img.style.cssText = `width:${btnSize}; height:${btnSize}; min-width:0 !important; aspect-ratio:1/1; cursor:pointer; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;`;
        img.onclick = () => {
            calcStore.pItems[idx] = item;
            slot.innerHTML = `<img src="icons/cal/${item}.webp" data-val="${item}">`;
            calcStore.save(); refreshAll(); tooltip.remove();
        };
        tooltip.appendChild(img);
    });

    document.body.appendChild(tooltip);
    const rect = slot.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 8;

    // 화면 밖으로 나가지 않게 조정
    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;

    tooltip.style.position = 'absolute';
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.zIndex = '1000';

    // 바깥 클릭 시 닫기
    setTimeout(() => {
        const idolContainer = document.getElementById('idol');
        const closeTooltip = (e) => {
            if (!tooltip.parentElement) return;
            if (e.type === 'scroll' || (!tooltip.contains(e.target) && e.target !== slot)) {
                tooltip.remove();
                document.removeEventListener('click', closeTooltip);
                if (idolContainer) idolContainer.removeEventListener('scroll', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
        if (idolContainer) idolContainer.addEventListener('scroll', closeTooltip, { passive: true });
    }, 0);
}

/**
 * P-아이템 정보 툴팁 표시
 */
export function showPItemInfoTooltip(infoBtn, pItemDescriptions) {
    if (document.querySelector('.p-item-info-tooltip')) { document.querySelector('.p-item-info-tooltip').remove(); return; }

    const isMobile = window.innerWidth <= 768;
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const tooltip = document.createElement('div');
    tooltip.className = 'calc-tooltip p-item-info-tooltip';
    tooltip.style.cssText = `position: absolute; width: max-content; max-width: 95vw; padding: ${isMobile ? '6px 8px' : '12px 15px'}; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); border: 2px solid ${idolColor}; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); font-size: ${isMobile ? '0.65rem' : '0.85rem'}; color: #333; line-height: 1.2; z-index: 10000; white-space: nowrap;`;

    const imgSize = isMobile ? '16px' : '24px';
    const gap = isMobile ? '4px' : '8px';
    const isJa = state.currentLang === 'ja';

    const items = pItemDescriptions[calcStore.type] || [];
    let contentHtml = items.map(item => {
        if (item.type === 'separator') return `<div style="height: 1px; background: #eee; margin: 1px 0;"></div>`;
        const iconsHtml = item.icons.map(icon => `<img src="icons/cal/${icon}.webp" style="width: ${imgSize}; height: ${imgSize}; border-radius: 4px;">`).join('<div style="width:2px;"></div>');
        return `<div style="display: flex; align-items: center; gap: ${gap};">
                    <div style="display: flex; align-items: center; gap: 2px;">${iconsHtml}</div>
                    <span>${isJa ? (item.ja || item.ko) : item.ko}</span>
                </div>`;
    }).join('');

    tooltip.innerHTML = `<div style="display: flex; flex-direction: column; gap: ${gap};">${contentHtml}</div>`;
    document.body.appendChild(tooltip);

    const rect = infoBtn.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = rect.left;
    let top = rect.bottom + window.scrollY + 8;

    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;
    if (rect.bottom + tooltipHeight + 20 > window.innerHeight) top = rect.top + window.scrollY - tooltipHeight - 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // 스크롤 시 닫기 리스너 추가
    setTimeout(() => {
        const idolContainer = document.getElementById('idol');
        const onScrollClose = () => {
            tooltip.remove();
            if (idolContainer) idolContainer.removeEventListener('scroll', onScrollClose);
        };
        if (idolContainer) idolContainer.addEventListener('scroll', onScrollClose, { passive: true });
    }, 0);
}
