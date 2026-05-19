import { state, idolColors } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { activityOptions } from './calcOptions.js';
import { idolData, hifParameterLimitBonuses, canUseHifPrimaStella } from './calcData.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calcStore } from './calcStore.js';
import { showMemorySelectModal } from './calcModals.js';
import { pItemDescriptions } from './pItemData.js';

/**
 * 아이돌별 표시 색상 반환 (릴리야 보정 포함)
 */
export const getIdolDisplayColor = (id) => (idolColors[id] || "#ff4d8d");
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);
const getOptionLabel = (opt) => opt?.labelKey ? t(opt.labelKey) : (opt?.[`label_${state.currentLang}`] || opt?.label_ko || '');
const getOptionMainLabel = (opt) => opt?.mainLabelKey ? t(opt.mainLabelKey) : (opt?.mainlabel || '');
const getCalcIconSrc = (value, calcType = calcStore.type) => `icons/cal/${calcType === 'hif' && value === 'test' ? 'test_hif' : value}.webp`;

/**
 * 서포트 카드의 아이템 효과 또는 HIF P-아이템의 item_effects 배열을 다국어 설명 텍스트로 파싱하는 공통 엔진
 */
export function getParsedItemEffectsText(itemEffects) {
    if (!itemEffects || !Array.isArray(itemEffects)) return '';

    const labels = {
        get: t('support_effect_get'),
        get_concentration: t('support_effect_get_concentration'),
        get_goodcondition: t('support_effect_get_goodcondition'),
        get_motivation: t('support_effect_get_motivation'),
        get_goodimpression: t('support_effect_get_goodimpression'),
        get_genki: t('support_effect_get_genki'),
        get_preservation: t('support_effect_get_preservation'),
        get_enthusiasm: t('support_effect_get_enthusiasm'),
        get_fullpower: t('support_effect_get_fullpower'),
        get_drink: t('support_effect_get_drink'),
        get_item: t('support_effect_get_item'),
        get_ssr: t('support_effect_get_ssr'),
        purchase_drink: t('support_effect_purchase_drink'),
        gift: t('support_effect_gift'),
        goout: t('support_effect_goout'),
        lesson: t('support_effect_lesson'),
        sp: t('support_effect_sp'),
        sp_lesson: t('support_effect_sp_lesson'),
        audition: t('support_effect_audition'),
        advice: t('support_effect_advice'),
        rest: t('support_effect_rest'),
        test: t('support_effect_test'),
        round_hif: t('support_effect_round_hif'),
        class: t('support_effect_class'),
        spclass: t('support_effect_spclass'),
        enhance: t('support_effect_enhance'),
        delete: t('support_effect_delete'),
        delete_t: t('support_effect_delete_t'),
        change: t('support_effect_change')
    };

    const statLabels = {
        vocal: t('attr_vocal'),
        dance: t('attr_dance'),
        visual: t('attr_visual')
    };

    return itemEffects.map(eff => {
        // 트리거 처리 (배열인 경우 모든 요소를 매핑하여 합침)
        const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
        const trigger = triggers.map(t => labels[t] || t).join(', ');
        const maxSuffix = (eff.max && eff.max < 9) ? t('support_effect_max_suffix', { count: eff.max }) : '';

        if (eff.type === 'action') {
            let effectDescParts = [];
            if (eff.stats) {
                const statsStr = Object.entries(eff.stats).map(([k, v]) => `${statLabels[k] || k.toUpperCase()} +${v}`).join(', ');
                effectDescParts.push(statsStr);
            }
            if (eff.target) {
                let displayText = null;
                if (eff.display) {
                    if (typeof eff.display === 'object') {
                        displayText = eff.display[state.currentLang] || eff.display.ja || eff.display.ko || '';
                    } else {
                        displayText = eff.display;
                    }
                }

                let targetStr = "";
                if (displayText) {
                    targetStr = displayText;
                } else {
                    const targets = Array.isArray(eff.target) ? eff.target : [eff.target];
                    const targetCounts = [];
                    targets.forEach(t => {
                        const existing = targetCounts.find(tc => tc.id === t);
                        if (existing) {
                            existing.count++;
                        } else {
                            targetCounts.push({ id: t, count: 1 });
                        }
                    });

                    targetStr = targetCounts.map(tc => {
                        const name = labels[tc.id] || tc.id;
                        return tc.count > 1 ? `${name} +${tc.count}` : name;
                    }).join(', ');
                }

                if (eff.value) targetStr += ` +${eff.value}`;
                effectDescParts.push(targetStr);
            }
            if (eff.targettext) {
                const tTexts = Array.isArray(eff.targettext) ? eff.targettext : [eff.targettext];
                const parsedParts = [];
                tTexts.forEach(tt => {
                    const match = tt.match(/^(ppoint|hp|goodcondition|concentration|motivation|goodimpression|anomaly)(\d+)$/i);
                    let translated = "";
                    let isSpecial = false;

                    if (match) {
                        const type = match[1].toLowerCase();
                        const val = match[2];
                        translated = t(`support_effect_targettext_${type}`, { val });
                        if (['goodcondition', 'concentration', 'motivation', 'goodimpression'].includes(type)) {
                            isSpecial = true;
                        }
                    } else {
                        let localTrans = t(`support_effect_condition_${tt}`);
                        if (!localTrans) {
                            localTrans = t(`support_effect_targettext_${tt}`, {}, tt);
                        }
                        translated = localTrans;
                    }
                    parsedParts.push({ text: translated, isSpecial });
                });

                let targetTextDesc = "";
                for (let i = 0; i < parsedParts.length; i++) {
                    if (i > 0) {
                        const prev = parsedParts[i - 1];
                        const curr = parsedParts[i];
                        if (prev.isSpecial && curr.isSpecial) {
                            targetTextDesc += " · ";
                        } else {
                            targetTextDesc += ", ";
                        }
                    }
                    targetTextDesc += parsedParts[i].text;
                }
                if (targetTextDesc) {
                    effectDescParts.push(targetTextDesc);
                }
            }
            const effectDesc = effectDescParts.join(', ');
            let finalDesc = t('support_effect_action_format', { trigger, effect: effectDesc, suffix: maxSuffix });

            if (eff.triggertext) {
                const tTexts = Array.isArray(eff.triggertext) ? eff.triggertext : [eff.triggertext];
                const prefixStr = tTexts.map(tt => {
                    const percentMatch = tt.match(/^(hp)(\d+)percent(up|down)$/i);
                    if (percentMatch) {
                        const num = percentMatch[2];
                        const dir = percentMatch[3].toLowerCase();
                        return t(`support_effect_condition_percent_${dir}`, { num });
                    }

                    const match = tt.match(/^(vocal|dance|visual|hp)(\d+)(up|down)?$/i);
                    if (match) {
                        const attrKey = match[1].toLowerCase();
                        const num = match[2];
                        const dir = match[3] ? match[3].toLowerCase() : 'up';
                        const attrName = attrKey === 'hp' ? 'HP' : t(`attr_${attrKey}`);
                        return t(`support_effect_condition_${dir}`, { attr: attrName, num: num });
                    }
                    return tt + (state.currentLang === 'ja' ? '、' : ', ');
                }).join('');
                finalDesc = prefixStr + finalDesc;
            }

            return finalDesc;
        } else if (eff.type === 'add_count') {
            const targets = Array.isArray(eff.target) ? eff.target : [eff.target];
            const target = targets.map(t => labels[t] || t).join(', ');
            return `${target} +${eff.value}${maxSuffix}`;
        }
        return '';
    }).filter(t => t).join('<br>');
}

export function getNormalizedSelectedCardIds(store, disabledCards = state.disabledCards) {
    const ids = [...(store.planCards[store.planType] || [])];
    while (ids.length < 6) ids.push(null);

    let changed = false;
    for (let i = 0; i < 5; i++) {
        if (ids[i] && disabledCards[ids[i]]) {
            ids[i] = null;
            changed = true;
        }
    }

    return { ids, changed };
}

export function syncDisabledSelectedCards(store, disabledCards = state.disabledCards) {
    const { ids, changed } = getNormalizedSelectedCardIds(store, disabledCards);
    if (changed) {
        store.planCards[store.planType] = ids;
        store.save();
    }
    return ids;
}

function renderMemorySlotContent(memArray, isJa, slotIndex) {
    const normalizedMemArray = Array.isArray(memArray) ? memArray : (memArray ? [memArray] : []);
    let linesHtml = '';

    ['vocal', 'dance', 'visual'].forEach(sName => {
        const memKey = normalizedMemArray.find(k => window.calcData?.memoryOptions?.[k]?.stat === sName);
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

    return `<div class="memory-slot-badge">memory ${slotIndex + 1}</div>${linesHtml}`;
}

/**
 * 하단 활동 카운터 UI 업데이트
 */
export function updateActivityCountsUI(store, counts) {
    const isJa = state.currentLang === 'ja';
    const counterContainer = document.getElementById('activity-counter');
    if (!counterContainer) return;

    // 1. 메인 활동 아이콘들 (레슨, 휴식 등)
    let allPossibleValues = Array.from(new Set(Object.values(store.weeks).map(w => w.value))).filter(v => v);

    // 보컬, 댄스, 비주얼 레슨은 0회여도 무조건 포함
    const baseLessons = ['lessonvo', 'lessondan', 'lessonvi'];
    baseLessons.forEach(lesson => {
        if (!allPossibleValues.includes(lesson)) {
            allPossibleValues.push(lesson);
        }
    });

    const sortOrder = ['lessonvo', 'lessondan', 'lessonvi', 'class_hajime', 'class_nia', 'class_hif', 'class_hif0', 'class_hif1', 'goout_hajime', 'goout_nia', 'gift_hajime', 'gift_nia', 'advice', 'spclass', 'audition', 'test', 'oikomi'];

    allPossibleValues.sort((a, b) => {
        let indexA = sortOrder.indexOf(a), indexB = sortOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    const activityLabels = {
        lessonvo: { ko: '보컬 레슨', ja: 'Voレッスン' },
        lessondan: { ko: '댄스 레슨', ja: 'Daレッスン' },
        lessonvi: { ko: '비주얼 레슨', ja: 'Viレッスン' },
        class_hajime: { ko: '수업/영업', ja: '授業/営業' },
        class_nia: { ko: '수업/영업', ja: '授業/営業' },
        class_hif: { ko: '수업', ja: '授業' },
        class_hif0: { ko: '수업', ja: '授業' },
        class_hif1: { ko: '수업', ja: '授業' },
        goout_hajime: { ko: '외출', ja: 'おでかけ' },
        goout_nia: { ko: '외출', ja: 'おでかけ' },
        gift_hajime: { ko: '활동지급', ja: '活動支給' },
        gift_nia: { ko: '활동지급', ja: '活動支給' },
        advice: { ko: '상담', ja: '相談' },
        spclass: { ko: '특별지도', ja: '特別指導' },
        audition: { ko: '오디션', ja: 'オーディション' },
        test: { ko: '시험', ja: '試験' },
        oikomi: { ko: '追い込み', ja: '追い込み' }
    };

    // 보컬, 댄스, 비주얼 레슨 (3열 격자)
    let html = '<div class="activity-grid base-lessons-grid">';
    baseLessons.forEach(val => {
        const count = counts.total[val] || 0;
        const spCount = (val === 'lessonvo' ? counts.lessons.vocal.sp : (val === 'lessondan' ? counts.lessons.dance.sp : (val === 'lessonvi' ? counts.lessons.visual.sp : 0)));

        html += `
            <div class="activity-cell active-cell activity-${val}">
                <div class="activity-cell-icon">
                    <img src="${getCalcIconSrc(val, store.type)}" class="activity-mini-icon">
                </div>
                <div class="activity-cell-count">
                    <span class="main-count">${count}${spCount > 0 ? `<span class="sp-sub-count">(SP ${spCount})</span>` : ''}</span>
                </div>
            </div>
        `;
    });
    html += '</div>';

    // 나머지 활동들 (5열 격자)
    const otherValues = allPossibleValues.filter(val => !baseLessons.includes(val));
    if (otherValues.length > 0) {
        html += '<div class="activity-grid other-activities-grid">';
        otherValues.forEach(val => {
            const count = counts.total[val] || 0;
            html += `
                <div class="activity-cell ${count > 0 ? 'active-cell' : 'empty-cell'}">
                    <div class="activity-cell-icon">
                        <img src="${getCalcIconSrc(val, store.type)}" class="activity-mini-icon">
                    </div>
                    <div class="activity-cell-count">
                        <span class="main-count">${count}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }



    const renderDist = (label, total, m, a, color = '#ff4d8d', bg = 'rgba(255, 77, 141, 0.05)', type = 'e') => `
        <div class="enhance-item-content compact-dist" style="background: ${bg}; border-color: ${color}33;">
            <span class="dist-label" style="opacity: ${total > 0 ? 1 : 0.3}; color: ${color};">${label} <span class="counter-count">${total}</span></span>
            <div class="dist-group" style="opacity: ${total > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>${t('calc_label_mental')}</span><span class="dist-val">${m}</span><button class="dist-btn plus" data-dist="${type}m">+</button></div>
                <div class="dist-unit"><span>${t('calc_label_active')}</span><span class="dist-val">${a}</span><button class="dist-btn plus" data-dist="${type}a">+</button></div>
            </div>
        </div>
    `;

    const drinkTotal = (counts.total.get_drink || 0) + (counts.total.purchase_drink || 0);
    const drinkDisplay = `
        <div class="enhance-item-content compact-dist" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.2);">
            <span class="dist-label" style="opacity: ${drinkTotal > 0 ? 1 : 0.3}; color: #4caf50;">${t('calc_label_drink')} <span class="counter-count">${drinkTotal}</span></span>
            <div class="dist-group" style="opacity: ${drinkTotal > 0 ? 1 : 0.3};">
                <div class="dist-unit"><span>${t('calc_label_get')}</span><span class="dist-val" style="color: #4caf50;">${counts.total.get_drink || 0}</span></div>
                <div class="dist-unit"><span>${t('calc_label_purchase')}</span><span class="dist-val" style="color: #4caf50;">${counts.total.purchase_drink || 0}</span></div>
            </div>
        </div>
    `;

    const renderOtherUnit = (label, key, color) => `
        <div class="dist-unit">
            <span>${label}</span>
            <span class="dist-val" style="color: ${color};">${counts.total[key] || 0}</span>
        </div>
    `;

    let otherGetItems = renderOtherUnit('SSR', 'get_ssr', '#673ab7') + renderOtherUnit(t('calc_label_genki'), 'get_genki', '#ff5722');
    if (store.planType === 'sense') {
        otherGetItems += renderOtherUnit(t('calc_label_goodcondition'), 'get_goodcondition', '#e91e63') + renderOtherUnit(t('calc_label_concentration'), 'get_concentration', '#e91e63');
    } else if (store.planType === 'logic') {
        otherGetItems += renderOtherUnit(t('calc_label_motivation'), 'get_motivation', '#2196f3') + renderOtherUnit(t('calc_label_goodimpression'), 'get_goodimpression', '#2196f3');
    } else if (store.planType === 'anomaly') {
        otherGetItems += renderOtherUnit(t('calc_label_preservation'), 'get_preservation', '#9c27b0') + renderOtherUnit(t('calc_label_enthusiasm'), 'get_enthusiasm', '#9c27b0') + renderOtherUnit(t('calc_label_fullpower'), 'get_fullpower', '#9c27b0');
    }

    const otherGetDisplay = `
        <div class="enhance-item-content compact-dist has-tune-btn" style="border-color: rgba(156, 39, 176, 0.2); position: relative; min-width: 140px;">
            <div class="dist-group" style="flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 4px 8px;">
                ${otherGetItems}
            </div>
            <button class="other-tune-btn" id="btn-other-tune" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); min-width: 26px; width: auto; height: 26px; padding: 0 6px; background: ${getIdolDisplayColor(store.selectedIdol)}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.65rem; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                <img src="icons/check-square.svg" style="width: 12px; height: 12px; filter: invert(1);">
                ${t('ui_bulk_adjust')}
            </button>
        </div>
    `;

    html += `
        <div class="counter-divider"></div>
        <div class="extra-text-counts" style="font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: flex-start;">
            <!-- Column 1: Enhance & Delete -->
            <div class="counter-column">
                <div class="text-count-item">${renderDist(t('calc_label_enhance'), counts.total.enhance || 0, counts.total.enhance_m || 0, counts.total.enhance_a || 0, '#ff4d8d', 'rgba(255, 77, 141, 0.05)', 'e')}</div>
                <div class="text-count-item">
                    <div class="enhance-item-content compact-dist" style="background: rgba(0,0,0,0.05); border-color: #555333;">
                        <span class="dist-label" style="opacity: ${((counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)) > 0 ? 1 : 0.3}; color: #555;">${t('calc_label_delete')} <span class="counter-count">${(counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)}</span></span>
                        <div class="dist-group" style="opacity: ${((counts.total.delete_m || 0) + (counts.total.delete_a || 0) + (counts.total.delete_t || 0)) > 0 ? 1 : 0.3};">
                            <div class="dist-unit"><span>${t('calc_label_mental')}</span><span class="dist-val">${counts.total.delete_m || 0}</span><button class="dist-btn plus" data-dist="dm">+</button></div>
                            <div class="dist-unit"><span>${t('calc_label_active')}</span><span class="dist-val">${counts.total.delete_a || 0}</span><button class="dist-btn plus" data-dist="da">+</button></div>
                            <div class="dist-unit">
                                <span>${t('calc_label_trouble')}</span>
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
                                <span>${t('calc_label_item')}</span>
                                <span class="dist-val" style="color: #2196f3;">${counts.total.get_item || 0}</span>
                            </div>
                            <div class="dist-unit" style="opacity: ${counts.total.change > 0 ? 1 : 0.3}">
                                <span>${t('calc_label_change')}</span>
                                <span class="dist-val" style="color: #2196f3;">${counts.total.change || 0}</span>
                            </div>
                            <div class="dist-unit" style="opacity: ${counts.total.customize > 0 ? 1 : 0.3}">
                                <span>${t('calc_label_customize')}</span>
                                <span class="dist-val" style="color: #2196f3;">${counts.total.customize || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Column 3: Card Get -->
            <div class="counter-column">
                <div class="text-count-item">
                    <div class="enhance-item-content compact-dist has-tune-btn" style="background: rgba(255, 152, 0, 0.05); border-color: rgba(255, 152, 0, 0.2); position: relative;">
                        <span class="dist-label" style="opacity: ${counts.total.get > 0 ? 1 : 0.3}; color: #ff9800;">${t('calc_title_card_get')} <span class="counter-count">${counts.total.get || 0}</span></span>
                        <div class="dist-group" style="opacity: ${counts.total.get > 0 ? 1 : 0.3};">
                            <div class="dist-unit"><span>${t('calc_label_mental')}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_m || 0}</span></div>
                            <div class="dist-unit"><span>${t('calc_label_active')}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_a || 0}</span></div>
                            <div class="dist-unit"><span>${t('calc_label_trouble')}</span><span class="dist-val" style="color: #ff9800;">${counts.total.get_t || 0}</span></div>
                        </div>
                        <div style="width: 100%; height: 1px; background: rgba(255,152,0,0.1); margin: 4px 0;"></div>
                        <div class="dist-group">
                            ${otherGetItems}
                        </div>
                        <div style="width: 100%; height: 1px; background: rgba(156,39,176,0.1); margin: 4px 0;"></div>
                        <button class="other-tune-btn" id="btn-other-tune" style="width: 85%; height: 26px; margin: 6px auto 8px; display: flex; align-items: center; justify-content: center; gap: 4px; background: ${getIdolDisplayColor(store.selectedIdol)}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.65rem;">
                            <img src="icons/check-square.svg" style="width: 12px; height: 12px; filter: invert(1);">
                            ${t('calc_label_select')}
                        </button>
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

    const { ids: selectedIds } = getNormalizedSelectedCardIds(store);
    const isAllEmpty = selectedIds.every(id => !id);
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

        if (i === 5) slotEl.classList.add('sixth-slot');
        else slotEl.classList.remove('sixth-slot');

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
                if (e2.includes('enhance')) optLabel = t('calc_label_enhance');
                else if (e2.includes('change')) optLabel = t('calc_label_change');
                else if (e2.includes('del')) optLabel = t('calc_label_delete');
                else optLabel = t('calc_label_option');

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
                            <span>${t('calc_label_event')}</span>
                        </label>
                    </div>
                </div>
            `;

            let optRow = slotEl.querySelector('.card-opt-row');
            if (optRow) optRow.outerHTML = optCheckHtml;

            // 2. Slot frame (Image and check/remove controls)
            let frame = slotEl.querySelector('.slot-frame');

            if (!frame.querySelector('img')) {
                const imgSuffix = cardData?.have?.startsWith('card') ? 'card' : 'item';
                const fallbackSuffix = imgSuffix === 'card' ? 'item' : 'card';
                // If it was empty, construct inner elements
                frame.innerHTML = `
                    <img src="images/support/${cardId}_${imgSuffix}.webp" onerror="this.src='images/support/${cardId}_${fallbackSuffix}.webp'; this.onerror=null;">
                    <div class="card-slot-remove" data-id="${cardId}">
                        <img src="icons/x.svg" class="cnt-btn-icon" style="filter: brightness(0) invert(1);">
                    </div>
                    <input type="checkbox" class="card-slot-check" data-id="${cardId}" ${checked ? 'checked' : ''}>
                `;
            } else {
                // Targeted update
                const img = frame.querySelector('img');
                const imgSuffix = cardData?.have?.startsWith('card') ? 'card' : 'item';
                const fallbackSuffix = imgSuffix === 'card' ? 'item' : 'card';
                const targetSrc = `images/support/${cardId}_${imgSuffix}.webp`;
                // Only update src if the card changed, to prevent flickering
                if (!img.src.endsWith(targetSrc)) {
                    img.src = targetSrc;
                    img.onerror = function () { this.src = `images/support/${cardId}_${fallbackSuffix}.webp`; this.onerror = null; };
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
                            <button class="card-counter-btn minus" data-id="${cardId}">
                                <img src="icons/minus.svg" class="cnt-btn-icon" style="width: 8px; height: 8px; filter: brightness(0) invert(1);">
                            </button>
                            <span class="card-counter-val">${counter}</span>
                            <button class="card-counter-btn plus" data-id="${cardId}">
                                <img src="icons/plus.svg" class="cnt-btn-icon" style="width: 8px; height: 8px; filter: brightness(0) invert(1);">
                            </button>
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
            if (i === 5) {
                frame.innerHTML = `<span class="rental-bg-text">${t('calc_label_rental')}</span>`;
            } else {
                frame.innerHTML = '<span class="support-bg-text">SUPPORT</span>';
            }
            frame.style.borderColor = '';

            let counterContainer = slotEl.querySelector('.card-item-counter');
            if (counterContainer) counterContainer.remove();
        }
    }
}

/**
 * 계산기 메뉴 렌더링
 */
export function renderCalcMenu(updatePageTranslations, onHajime, onNia, onHif) {
    localStorage.removeItem('last_calc_type');
    const root = document.getElementById('calc-root');
    if (!root) return;

    const favIdol = state.favoriteIdol || 'saki';
    const color = getIdolDisplayColor(favIdol);

    root.innerHTML = `
        <div class="calc-menu-container">
            <div class="calc-buttons">
                <div class="calc-menu-item" id="btn-hif" style="--idol-theme-color: ${color};">
                    <div class="calc-menu-label" style="border-left-color: ${color};">HIF</div>
                    <img src="images/hif.webp" class="calc-menu-img hif-menu-img" alt="HIF">
                </div>
                <div class="calc-menu-item" id="btn-hajime" style="--idol-theme-color: ${color};">
                    <div class="calc-menu-label" style="border-left-color: ${color};" data-i18n="gacha_menu_legend">HAJIME LEGEND</div>
                    <img src="images/hajime.webp" class="calc-menu-img" alt="Hajime" style="border-color: ${color};">
                </div>
                <div class="calc-menu-item" id="btn-nia" style="--idol-theme-color: ${color};">
                    <div class="calc-menu-label" style="border-left-color: ${color};" data-i18n="gacha_menu_master">NIA MASTER</div>
                    <img src="images/nia.webp" class="calc-menu-img" alt="N.i.a" style="border-color: ${color};">
                </div>
            </div>
        </div>`;
    updatePageTranslations();
    document.getElementById('btn-hajime').onclick = onHajime;
    document.getElementById('btn-nia').onclick = onNia;
    if (onHif) document.getElementById('btn-hif').onclick = onHif;
}
/**
 * 계산기 전체 화면 렌더링
 */
export function renderWeeklyPlan(store, calcPlans, idolList, handlers) {
    const root = document.getElementById('calc-root');
    const planData = calcPlans[store.type];
    const isJa = state.currentLang === 'ja';
    const idolColor = getIdolDisplayColor(store.selectedIdol);

    if (window._showPreset === undefined) {
        window._showPreset = localStorage.getItem('calc_show_preset') === 'true';
    }

    const idolsHtml = idolList.map(name => {
        const isActive = store.selectedIdol === name;
        const color = getIdolDisplayColor(name);
        const colorShadow = color + 'b3'; // 70% alpha for shadow
        const variables = isActive ? `style="--idol-color: ${color}; --idol-color-shadow: ${colorShadow};"` : '';
        return `<div class="idol-sel-item ${isActive ? 'active' : ''}" data-id="${name}" ${variables}><img src="icons/idolicons/${name}_c.png" onerror="this.src='icons/idol.png'"></div>`;
    }).join('');

    const weekNumbers = Object.keys(planData.weeks).map(Number).sort((a, b) => b - a);
    const weeksHtml = weekNumbers.map(i => {
        const options = planData.weeks[i] || [];
        const savedWeek = store.weeks[i] || {};
        const optionsHtml = options.map(opt => {
            const isActive = savedWeek.value === opt.value;
            const isLarge = ['audition', 'test', 'oikomi', 'round_hif1', 'round_hif2'].includes(opt.value);
            let optAttrs = isActive && savedWeek.opts ? Object.keys(savedWeek.opts).map(k => ` data-opt${k}="${savedWeek.opts[k]}"`).join('') : '';

            let activeStyle = '';
            if (isActive) {
                if (isLarge) {
                    activeStyle = `style="--idol-color: ${idolColor};"`;
                } else {
                    activeStyle = `style="border-color: ${idolColor}; box-shadow: none;"`;
                }
            }

            const isTestOrAudition = ['test', 'audition'].includes(opt.value) && !(store.type === 'hif' && opt.value === 'test');
            const infoBtnHtml = isTestOrAudition ? `<div class="info-i-btn" data-type="${opt.value}" style="background-color: ${idolColor};">i</div>` : '';

            return `
                <div class="icon-outer-container ${isLarge ? 'large-container' : ''}">
                    <div class="plan-icon-wrapper ${isLarge ? 'large-icon' : ''} ${isActive ? 'active' : ''}" data-value="${opt.value}" ${optAttrs} ${activeStyle}>
                        <img src="${getCalcIconSrc(opt.value, store.type)}" class="plan-icon-img">
                    </div>
                    ${infoBtnHtml}
                </div>`;
        }).join('');
        const isHif = store.type === 'hif';
        const displayedWeekNum = isHif && i >= 21 ? (i - 20) : i;
        const hifSpecialLabels = {
            7: '<small>R</small><span class="week-num">1</span>',
            8: '<small>Break</small>',
            9: '<small>R</small><span class="week-num">2</span>'
        };
        const specialHifLabel = isHif && i >= 21 ? hifSpecialLabels[displayedWeekNum] : null;
        const weekLabelContent = specialHifLabel
            ? specialHifLabel
            : state.currentLang === 'en'
                ? `<small>${isHif ? 'D' : 'W'}</small><span class="week-num">${displayedWeekNum}</span>`
                : `<span class="week-num">${displayedWeekNum}</span><small>${isHif ? (isJa ? '日' : '일') : (isJa ? '週' : '주')}</small>`;
        const rowClass = `week-row${isHif && i === 21 ? ' hif-reset-boundary' : ''}`;
        return `<div class="${rowClass}" data-week="${i}"><div class="week-diamond">✦</div><div class="week-header"><span class="week-label">${weekLabelContent}</span></div><div class="plan-icons-container">${optionsHtml}</div></div>`;
    }).join('');

    root.innerHTML = `
        <div class="calc-container">
            <div class="calc-main-wrapper">
                <div class="calc-actions top">
                    <button class="calc-btn primary-btn" id="btn-run-calc" style="background-color: ${idolColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">${t('calc_label_calculate')}</button>
                    <button class="calc-btn recommend-btn" id="btn-recommend-cards" style="background: linear-gradient(135deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%); color: #fff; border: 1px solid #d991c7; display: flex; align-items: center; justify-content: center; padding: 0 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); white-space: nowrap;">${t('calc_label_recommend')}</button>
                    <button class="back-btn primary-btn">${t('calc_label_back')}</button>
                </div>


                <div class="idol-selector-grid" id="idol-selector-grid">${idolsHtml}</div>
                <div class="idol-options-row" style="margin-bottom: ${window._showPreset ? '0' : '12px'}; border-bottom-left-radius: ${window._showPreset ? '0' : '12px'}; border-bottom-right-radius: ${window._showPreset ? '0' : '12px'}; border-bottom: ${window._showPreset ? '1px solid #ccc' : '1px solid #ddd'};">
                    ${(store.type === 'nia' || store.type === 'hajime' || store.type === 'hif') ? `
                    <div class="sr-toggle-item ${store.isSR ? 'active' : ''}" id="sr-toggle">
                        <img src="icons/sr.png" onerror="this.src='icons/sr.webp'">
                    </div>
                    <div class="talent-toggle-item ${store.pItemChecked ? 'active' : ''}" id="p-item-toggle" style="--idol-color: ${idolColor};">
                        <img src="icons/sainou.webp">
                    </div>
                    ${store.type === 'hif' ? `
                    <div class="talent-toggle-item ${store.hifPrimaChecked ? 'active' : ''} ${!canUseHifPrimaStella(store.selectedIdol, store.planType) ? 'disabled' : ''}" id="hif-prima-toggle" style="--idol-color: ${idolColor};">
                        <div style="width: 19px; height: 19px; background-color: var(--idol-color, #ff4d8d); -webkit-mask-image: url('icons/primastella.webp'); mask-image: url('icons/primastella.webp'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;"></div>
                    </div>
                    ` : ''}
                    <button class="talent-bloom-info-btn">i</button>
                    <div class="idol-opt-divider"></div>
                    ` : ''}
                    <div class="plan-type-btns-group">
                        ${['sense', 'logic', 'anomaly'].map(pt => {
        const isActive = store.planType === pt;
        const activeStyle = isActive ? `style="--idol-color: ${idolColor};"` : '';
        return `<div class="plan-type-btn ${isActive ? 'active' : ''}" data-type="${pt}" ${activeStyle}><img src="icons/${pt}.webp"></div>`;
    }).join('')}
                    </div>
                </div>

                <!-- 통합 프리셋 카드 (상시 노출, 상단 캐릭터/플랜 선택 칸과 밀착 결합형 구조) -->
                <div id="preset-integrated-card" style="width: 100%; margin-bottom: 12px; background: #f5f5f5; border-radius: 0 0 12px 12px; border: 1px solid #ddd; border-top: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box; display: ${window._showPreset ? 'flex' : 'none'}; flex-direction: column; overflow: hidden;">
                    <!-- 상단 헤더 (타이틀 + 10개 슬롯 동그라미) -->
                    <div id="preset-header-row" style="display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 38px; padding: 0 16px; box-sizing: border-box; gap: 24px;">
                        <!-- 좌측: 심플한 텍스트 타이틀 (회색) + 플랜 미니 아이콘 -->
                        <div id="preset-title" style="font-size: 0.75rem; color: #888; font-weight: bold; user-select: none; letter-spacing: -0.2px; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            ${(store.type === 'hif' || store.type === 'nia') ? `
                            <div class="preset-brand-icon" style="width: 28px; height: 14px; background-color: ${idolColor}; -webkit-mask-image: url('icons/${store.type}.webp'); mask-image: url('icons/${store.type}.webp'); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;"></div>
                            ` : ''}
                            <span>Preset</span>
                        </div>
                        <!-- 우측: 10개 슬롯 동그라미 미리보기 영역 -->
                        <div id="preset-preview" style="display: flex; align-items: center; gap: 14px; overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 2px; min-width: 0;">
                        </div>
                    </div>
                    <!-- 하단 상세 정보 영역 (기본 display: none) -->
                    <div id="calc-preset-slots-container" style="display: none; flex-direction: column; padding: 12px 14px; border-top: 1px solid #eee; gap: 10px; width: 100%;">
                        <!-- 슬롯 상세 내용이 JS로 들어갑니다 -->
                    </div>
                </div>

                <div class="stat-header" style="border-color: ${idolColor}; overflow: hidden;">
                    <div class="stat-header-top-bar" style="background-color: ${idolColor};">
                        ${(store.type === 'hif' || store.type === 'nia') ? `<img src="icons/${store.type}.webp" class="stat-header-icon ${store.type}-icon">` : ''}
                        <span class="stat-header-title">PRODUCE RESULT</span>
                        ${store.type === 'hif' ? `
                        <button id="btn-hif-eval" class="hif-eval-btn" style="border-color: color-mix(in srgb, ${idolColor} 95%, #000) !important;">
                            ${t('calc_hif_eval_btn')}
                        </button>
                        ` : ''}
                    </div>
                    <div class="stat-header-content">
                        ${store.type !== 'hif' ? `
                        <button id="btn-kyouka" class="kyouka-btn header-kyouka-btn">
                            <img src="icons/kyoukagekkan${state.currentLang === 'ko' ? '-k' : ''}.webp" alt="Kyouka">
                        </button>
                        ` : ''}
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
                            </div>
                            <div class="stat-item item-dance">
                                <img src="icons/dance.png">
                                <span id="final-dance" class="final-stat-label" style="font-size: 0.8rem; color: #46a4f3;">0</span>
                                <span id="total-perc-dance" style="font-size: 0.65rem; color: #aaa; margin-top: -2px; font-weight: 600;">0%</span>
                            </div>
                            <div class="stat-item item-visual">
                                <img src="icons/visual.png">
                                <span id="final-visual" class="final-stat-label" style="font-size: 0.8rem; color: #fcc75e;">0</span>
                                <span id="total-perc-visual" style="font-size: 0.65rem; color: #aaa; margin-top: -2px; font-weight: 600;">0%</span>
                            </div>
                        </div>

                        <div class="stat-detail-toggle-bar ${calcStore.statDetailsOpen ? 'active' : ''}" id="btn-stat-detail-toggle">
                            <div class="toggle-line"></div>
                            <div class="toggle-label">SUPPORT CARD</div>
                            <div class="toggle-arrow">▼</div>
                            <div class="toggle-line"></div>
                        </div>

                        <div class="stat-items-row stat-detail-area ${calcStore.statDetailsOpen ? '' : 'collapsed'}">
                            <div class="stat-item item-vocal" style="border:none; background:none; box-shadow:none; padding:0;">
                                <div class="stat-detail-content" style="display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center;">
                                    <div class="bonus-bar-container" style="margin-bottom: 0;">
                                        <div id="bonus-bar-vocal" class="bonus-bar"></div>
                                        <div id="sp-dot-vocal" class="sp-dot"></div>
                                    </div>
                                    <div class="stat-values" style="display: flex; flex-direction: column; align-items: center; gap: 0px;">
                                        <span id="total-vocal" style="height: 14px; line-height: 14px; text-align: center;">0</span>
                                        <span id="sp-vocal-percent" class="sp-percent-label" style="color: #888; text-align: center;"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="stat-item item-dance" style="border:none; background:none; box-shadow:none; padding:0;">
                                <div class="stat-detail-content" style="display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center;">
                                    <div class="bonus-bar-container" style="margin-bottom: 0;">
                                        <div id="bonus-bar-dance" class="bonus-bar"></div>
                                        <div id="sp-dot-dance" class="sp-dot"></div>
                                    </div>
                                    <div class="stat-values" style="display: flex; flex-direction: column; align-items: center; gap: 0px;">
                                        <span id="total-dance" style="height: 14px; line-height: 14px; text-align: center;">0</span>
                                        <span id="sp-dance-percent" class="sp-percent-label" style="color: #888; text-align: center;"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="stat-item item-visual" style="border:none; background:none; box-shadow:none; padding:0;">
                                <div class="stat-detail-content" style="display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center;">
                                    <div class="bonus-bar-container" style="margin-bottom: 0;">
                                        <div id="bonus-bar-visual" class="bonus-bar"></div>
                                        <div id="sp-dot-visual" class="sp-dot"></div>
                                    </div>
                                    <div class="stat-values" style="display: flex; flex-direction: column; align-items: center; gap: 0px;">
                                        <span id="total-visual" style="height: 14px; line-height: 14px; text-align: center;">0</span>
                                        <span id="sp-visual-percent" class="sp-percent-label" style="color: #888; text-align: center;"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                ${(store.type === 'nia' || store.type === 'hajime' || store.type === 'hif') ? `
                <div class="calc-integrated-container" id="p-item-container" style="display: flex; flex-direction: column; width: 100%; margin-bottom: 1rem; padding: 12px; background: white; border-radius: 12px; border: 1px solid #ddd; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                    ${store.type === 'hif' ? `
                    <!-- HIF Stats Section -->
                    <div class="hif-stats-container">
                        <div class="memory-slot-badge">HIF Bonus</div>
                        ${['vocal', 'dance', 'visual'].map((attr, index) => {
        const attrColor = attr === 'vocal' ? '#ff4d8d' : (attr === 'dance' ? '#46a4f3' : '#fcc75e');
        return `
                            ${index > 0 ? '<div class="hif-stat-divider"></div>' : ''}
                            <div class="hif-stat-item">
                                <div class="hif-stat-top">
                                    <img src="icons/${attr}.png" class="hif-stat-img">
                                    <div class="hif-bonus-vals" style="color: ${attrColor};">
                                        <span>+${(store.hifStats?.[attr] || 0) * 20}</span>
                                        <span>+${(store.hifStats?.[attr] || 0) * 2}%</span>
                                    </div>
                                </div>
                                <div class="counter-controls hif-stat-controls" data-attr="${attr}" style="border-color: ${attrColor}40;">
                                    <button class="cnt-btn minus" style="border-right: 1px solid ${attrColor}20;">
                                        <img src="icons/minus.svg" class="cnt-btn-icon">
                                    </button>
                                    <span class="cnt-val" style="color: ${attrColor};">${store.hifStats?.[attr] || 0}</span>
                                    <button class="cnt-btn plus" style="border-left: 1px solid ${attrColor}20;">
                                        <img src="icons/plus.svg" class="cnt-btn-icon">
                                    </button>
                                </div>
                            </div>
                        `;
    }).join('')}
                        <div class="hif-stat-divider full-width"></div>
                        <div class="hif-param-limit-item">
                            <div class="hif-stat-top hif-param-limit-top">
                                <div class="hif-param-limit-title" data-i18n="hif_param_limit_title">${t('hif_param_limit_title')}</div>
                                <div class="hif-bonus-vals" style="color: #5960fb;">
                                    <span>+${hifParameterLimitBonuses[store.hifParamLimitLevel || 0] || 0}</span>
                                </div>
                            </div>
                            <div class="counter-controls hif-stat-controls hif-param-limit-controls" style="border-color: #5960fb40;">
                                <button class="cnt-btn minus" style="border-right: 1px solid #5960fb20;">
                                    <img src="icons/minus.svg" class="cnt-btn-icon">
                                </button>
                                <span class="cnt-val" style="color: #5960fb;">${store.hifParamLimitLevel || 0}</span>
                                <button class="cnt-btn plus" style="border-left: 1px solid #5960fb20;">
                                    <img src="icons/plus.svg" class="cnt-btn-icon">
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style="width: 100%; height: 1px; background-color: #eee; margin: 8px 0 12px 0;"></div>
                    ` : ''}

                    <!-- 1. P-Item Section -->
                    <div id="p-item-container-inner" style="display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; position: relative;">
                        ${Array.from({ length: store.type === 'nia' ? 5 : (store.type === 'hif' ? 1 : 2) }).map((_, i) => `
                            <div class="p-item-slot" data-idx="${i}" style="border-color: ${store.pItems[i] ? 'transparent' : '#ddd'};"></div>
                        `).join('')}
                        <button class="p-item-info-btn" style="position: absolute; right: 0; width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ddd; background: #f8f9fa; color: #666; font-size: 9px; cursor: pointer; flex-shrink: 0; display: ${store.type === 'hif' && !store.pItems[0] ? 'none' : 'flex'}; align-items: center; justify-content: center; font-weight: bold; font-family: serif;">i</button>
                    </div>

                    <!-- Divider -->
                    <div style="width: 100%; height: 1px; background-color: #eee; margin: 12px 0 18px 0;"></div>

                    <!-- 2. Memory Section -->
                    <div class="memory-container" id="memory-container" style="width: 100%; --idol-color: ${idolColor}; --idol-color-transparent: ${idolColor}26;">
                        ${Array.from({ length: 4 }).map((_, i) => {
        return `
                            <div class="memory-slot" data-idx="${i}">
                                ${renderMemorySlotContent(store.memories[i], isJa, i)}
                            </div>
                            `;
    }).join('')}
                    </div>

                    <!-- Divider -->
                    <div style="width: 100%; height: 1px; background-color: #eee; margin: 12px 0;"></div>

                    <!-- 3. Support Cards Section -->
                    <div class="selected-support-container" id="selected-support-container" style="margin-bottom: 0; background: transparent; border: none; box-shadow: none; padding: 0;"></div>

                </div>
                ` : ''}

                <div class="activity-counter" id="activity-counter"></div>
                <div class="board-title-row" style="background-color: ${idolColor}; border-color: ${idolColor};">
                    ${(store.type === 'hif' || store.type === 'nia') ? `<img src="icons/${store.type}.webp" class="board-title-icon ${store.type}-icon">` : ''}
                    <div class="board-title-tab">SCHEDULE</div>
                    <button class="board-reset-btn" id="btn-reset-weeks" data-i18n="calc_reset_weeks">${isJa ? 'リセット' : '초기화'}</button>
                </div>
                <div class="unified-plan-board" data-calc-type="${store.type}">${weeksHtml}</div>
            </div>
        </div>
    `;

    document.querySelectorAll('.plan-type-btn.active').forEach(btn => {
        btn.style.setProperty('--idol-color', idolColor);
    });
    root.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
        updateSPBadge(w, store.selectedIdol);
        updateMainLabel(w);
    });
    updatePageTranslations();
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

    if (calcStore.type === 'hif' && w.dataset.value === 'test') {
        const vo = parseInt(savedOpts.hif_test_vocal);
        const da = parseInt(savedOpts.hif_test_dance);
        const vi = parseInt(savedOpts.hif_test_visual);
        const labels = [];
        if (!isNaN(vo) && vo > 0) labels.push(`Vo ${vo}`);
        if (!isNaN(da) && da > 0) labels.push(`Da ${da}`);
        if (!isNaN(vi) && vi > 0) labels.push(`Vi ${vi}`);
        if (labels.length > 0) {
            const l = document.createElement('div');
            l.className = 'main-label-text';
            const prefix = savedOpts.hif_test_use_perc === 'true' ? '(%) ' : '';
            l.textContent = prefix + labels.join(' ');
            w.appendChild(l);
        }
        return;
    }

    // 속성 아이콘 추가 (수업 메인 속성 / HIF 레슨 보조 속성)
    const attrBadge = savedOpts?.selectedAttr || savedOpts?.selectedSubAttr;
    if (attrBadge) {
        const b = document.createElement('div');
        b.className = 'class-attr-badge';
        b.innerHTML = `<img src="icons/${attrBadge}.png" alt="${attrBadge}">`;
        w.appendChild(b);
    }

    const opts = activityOptions[w.dataset.value] || [];
    const labels = opts
        .filter(o => getOptionMainLabel(o) && (o.type === 'counter' ? parseInt(w.dataset[`opt${o.id}`]) > 0 : w.dataset[`opt${o.id}`] === 'true'))
        .map(o => {
            const mainLabel = getOptionMainLabel(o);
            return o.type === 'counter' ? `${mainLabel} ${w.dataset[`opt${o.id}`]}` : mainLabel;
        });
    if (labels.length > 0) {
        const l = document.createElement('div'); l.className = 'main-label-text'; l.textContent = labels.join(' '); w.appendChild(l);
    }
}
export function updateStatHeaderUI(store, breakdown) {
    const attrs = ['vocal', 'dance', 'visual'];
    const idolInfo = idolData[store.selectedIdol];
    const hifParamLimitBonus = store.type === 'hif' ? (hifParameterLimitBonuses[store.hifParamLimitLevel || 0] || 0) : 0;
    const maxStat = store.type === 'hajime'
        ? 3000
        : (store.type === 'hif' ? (3000 + hifParamLimitBonus) : (store.type === 'nia' ? 2600 : 0));
    const idolColor = getIdolDisplayColor(store.selectedIdol);

    // 헤더 및 테두리 색상 동적 업데이트
    const headerBar = document.querySelector('.stat-header-top-bar');
    const statHeader = document.querySelector('.stat-header');
    const totalSumContainer = document.getElementById('total-stats-sum-container');

    if (headerBar) {
        if (store.type === 'hif') {
            // 헤더 바와 부모 박스 전체에 그라데이션 적용 (틈새 방지)
            const grad = 'linear-gradient(135deg, #67c7d3, #189cfa, #3d64fb, #9575fb, #5960fb)';
            statHeader.style.background = grad;
        } else {
            statHeader.style.background = '';
            statHeader.style.backgroundColor = idolColor;
        }
    }
    if (statHeader) {
        // 모든 모드에서 아이돌 고유색 배경과 테두리 적용
        statHeader.style.background = '';
        statHeader.style.backgroundColor = idolColor;
        statHeader.style.border = `2px solid ${idolColor}`;
        statHeader.style.backgroundClip = '';
        statHeader.style.backgroundOrigin = '';
    }
    if (totalSumContainer) {
        totalSumContainer.style.backgroundColor = idolColor;
        totalSumContainer.style.boxShadow = `0 2px 6px ${idolColor}33`;
    }
    const hifEvalBtn = document.getElementById('btn-hif-eval');
    if (hifEvalBtn) {
        hifEvalBtn.style.setProperty('border-color', `color-mix(in srgb, ${idolColor} 95%, #000)`, 'important');
    }

    let sum = 0;
    let cappedSum = 0;
    let overflowSum = 0;
    let hasOverflow = false;
    let maxBonus = 0;
    const bonusVals = {};
    attrs.forEach(attr => {
        const val = (breakdown.supportFixed?.[attr] || 0) + (breakdown.supportPercent?.[attr] || 0);
        bonusVals[attr] = val;
        if (val > maxBonus) maxBonus = val;
    });

    attrs.forEach(attr => {
        const totalEl = document.getElementById(`total-${attr}`);
        const finalEl = document.getElementById(`final-${attr}`);
        const spEl = document.getElementById(`sp-${attr}-percent`);
        const itemEl = document.querySelector(`.stat-item.item-${attr}`);
        const barEl = document.getElementById(`bonus-bar-${attr}`);

        const bonusVal = bonusVals[attr];
        if (totalEl) totalEl.textContent = bonusVal > 0 ? bonusVal : '0';

        if (barEl) {
            const height = maxBonus > 0 ? (bonusVal / maxBonus) * 100 : 0;
            barEl.style.height = `${height}%`;
            barEl.style.backgroundColor = (attr === 'vocal' ? '#ff4d8d' : (attr === 'dance' ? '#46a4f3' : '#fcc75e'));
        }

        const dotEl = document.getElementById(`sp-dot-${attr}`);
        if (dotEl && window._lastSpTotals) {
            const rawSpVal = window._lastSpTotals[attr] || 0;
            const spVal = Math.min(rawSpVal, 100);
            dotEl.style.bottom = `${spVal}%`;
            // 0%일 때는 점을 숨김
            dotEl.style.opacity = rawSpVal > 0 ? '1' : '0';
            // 다시 테두리 색상을 스탯 색상으로 변경
            dotEl.style.borderColor = (attr === 'vocal' ? '#ff4d8d' : (attr === 'dance' ? '#46a4f3' : '#fcc75e'));
        }

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
        if (maxStat > 0) {
            cappedSum += Math.min(finalStat, maxStat);
            const overflow = Math.max(0, finalStat - maxStat);
            overflowSum += overflow;
            if (overflow > 0) hasOverflow = true;
        } else {
            cappedSum += finalStat;
        }

        // SP lesson up total display
        // SP lesson up total display
        if (spEl && window._lastSpTotals) {
            spEl.textContent = `sp +${window._lastSpTotals[attr]}%`;
        }

        if (itemEl && idolInfo) {
            const rank = idolInfo.priority.indexOf(attr) + 1;
            itemEl.classList.remove('rank-1', 'rank-2', 'rank-3');
            if (rank > 0) itemEl.classList.add(`rank-${rank}`);
        }
    });

    const sumValueEl = document.getElementById('total-stats-sum-value');
    if (sumValueEl) {
        const displaySum = maxStat > 0 ? cappedSum : sum;
        if (hasOverflow && overflowSum > 0) {
            sumValueEl.innerHTML = `${displaySum}<span class="total-overflow-text">(-${overflowSum})</span>`;
            sumValueEl.classList.add('is-overflow');
            sumValueEl.style.color = '#ffffff';
        } else {
            sumValueEl.textContent = displaySum;
            sumValueEl.classList.remove('is-overflow');
            sumValueEl.style.color = '';
        }
    }
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
        slot.innerHTML = renderMemorySlotContent(store.memories[i], isJa, i);
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

    sub.innerHTML = parent.subOptions.map(o => `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${calcStore.weeks[week].opts[o.id] === 'true' ? 'checked' : ''}><span>${getOptionLabel(o)}</span></label>`).join('');

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
 * P-아이템의 다국어 조건(레슨 시 등)과 번역 텍스트를 동적으로 결합하여 최종 설명문을 반환하는 헬퍼 함수
 */
export function getPItemDescriptionText(descObj, subOptId, subSubOptId) {
    if (!descObj) return '';
    const lang = state.currentLang;
    const isJa = lang !== 'ko';

    // 1. 3단계 세부 옵션(1-1-1 등)이 선택되었고 해당 subSubOption이 존재하는 경우 최우선 출력
    if (subOptId && subSubOptId) {
        const subObj = descObj.subOptions?.find(s => s.id === subOptId);
        const subSubObj = subObj?.subOptions?.find(s => s.id === subSubOptId);
        if (subSubObj) {
            if (subSubObj.item_effects && subSubObj.item_effects.length > 0) {
                return getParsedItemEffectsText(subSubObj.item_effects);
            }
            return lang === 'en' ? (subSubObj.en || subSubObj.ja || subSubObj.ko) : (isJa ? (subSubObj.ja || subSubObj.ko) : subSubObj.ko);
        }
    }

    // 2. 세부 옵션(HIF 등)이 선택되었고 해당 subOption이 존재하는 경우 출력
    const subObj = subOptId ? descObj.subOptions?.find(s => s.id === subOptId) : null;
    if (subObj) {
        if (subObj.item_effects) {
            // Re-use the exact same parser engine as support cards!
            return getParsedItemEffectsText(subObj.item_effects);
        }
        return lang === 'en' ? (subObj.en || subObj.ja || subObj.ko) : (isJa ? (subObj.ja || subObj.ko) : subObj.ko);
    }

    // 3. 일반 아이돌(니아, 하지메) 또는 HIF의 고유 베이스 설명이 적혀있는 경우 출력
    if (descObj.item_effects) {
        return getParsedItemEffectsText(descObj.item_effects);
    }
    if (descObj.ko || descObj.ja || descObj.en) {
        return lang === 'en' ? (descObj.en || descObj.ja || descObj.ko) : (isJa ? (descObj.ja || descObj.ko) : descObj.ko);
    }

    return '';
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

    const isHif = calcStore.type === 'hif';
    const targetWidth = isHif ? (isMobile ? '230px' : '300px') : (isMobile ? '135px' : '165px');

    if (isHif) {
        tooltip.style.cssText = `display:flex; flex-direction:column; width:${targetWidth}; gap:8px; justify-content:flex-start; padding:${tooltipPadding}; box-sizing:border-box; border: 2px solid ${idolColor};`;
    } else {
        tooltip.style.cssText = `flex-direction:row; flex-wrap:wrap; width:${targetWidth}; min-width:130px; gap:8px; justify-content:flex-start; padding:${tooltipPadding}; box-sizing:border-box; border: 2px solid ${idolColor};`;
    }

    const btnSize = isMobile ? '32px' : '40px';

    // X 버튼(지우기) 제거됨

    const slotItems = itemsBySlot[idx] || [];

    if (isHif) {
        const header = document.createElement('div');
        header.style.cssText = `display:flex; align-items:center; gap:8px; width:100%; border-bottom:1px solid #ccc; padding-bottom:6px; margin-bottom:4px; box-sizing:border-box;`;

        const titleSpan = document.createElement('span');
        titleSpan.innerText = 'HIF P-item Select';
        titleSpan.style.cssText = `font-size:${isMobile ? '0.58rem' : '0.68rem'}; font-weight:bold; color:#666;`;

        header.appendChild(titleSpan);
        tooltip.appendChild(header);
    }

    function adjustTooltipPosition() {
        const rect = slot.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;

        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        let top = rect.bottom + window.scrollY + 8;

        if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
        if (left < 10) left = 10;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function renderSubOptionsScreen(selectedItem, descObj) {
        tooltip.innerHTML = ''; // Clear main choices

        // Header (Back button and title)
        const header = document.createElement('div');
        header.style.cssText = `display:flex; align-items:center; gap:8px; width:100%; border-bottom:1px solid #ccc; padding-bottom:6px; margin-bottom:4px; box-sizing:border-box;`;

        const backBtn = document.createElement('button');
        backBtn.innerText = '←';
        backBtn.style.cssText = `background:none; border:none; color:${idolColor}; font-size:${isMobile ? '0.9rem' : '1.1rem'}; font-weight:bold; cursor:pointer; padding:0 4px; line-height:1; margin-left:auto;`;
        backBtn.onclick = (e) => {
            e.stopPropagation();
            // Re-render the main P-item selector tooltip
            showPItemSelectorTooltip(slot, idx, itemsBySlot, refreshAll);
        };

        const selectedIcon = document.createElement('img');
        selectedIcon.src = `icons/cal/${selectedItem}.webp`;
        selectedIcon.style.cssText = `width:${isMobile ? '20px' : '24px'}; height:${isMobile ? '20px' : '24px'}; min-width:${isMobile ? '20px' : '24px'} !important; flex-shrink:0; border-radius:4px; object-fit:contain; border:1px solid #eee; box-sizing:border-box;`;

        header.appendChild(selectedIcon);
        header.appendChild(backBtn);
        tooltip.appendChild(header);

        // Sub options
        descObj.subOptions.forEach(sub => {
            const subRow = document.createElement('div');
            subRow.style.cssText = `display:flex; align-items:center; gap:8px; padding:6px; border-radius:6px; cursor:pointer; transition:background 0.2s; width:100%; box-sizing:border-box;`;

            subRow.onmouseenter = () => { subRow.style.backgroundColor = `${idolColor}15`; };
            subRow.onmouseleave = () => { subRow.style.backgroundColor = 'transparent'; };

            const text = getPItemDescriptionText(descObj, sub.id);
            subRow.innerHTML = `
                <img src="icons/cal/${sub.id}.webp" style="width:${btnSize}; height:${btnSize}; min-width:${btnSize} !important; flex-shrink:0; aspect-ratio:1/1; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;">
                <span style="font-size: ${isMobile ? '0.54rem' : '0.68rem'}; color: #333; line-height: 1.3;">${text}</span>
            `;

            subRow.onclick = (e) => {
                e.stopPropagation();
                if (sub.subOptions && sub.subOptions.length > 0) {
                    renderSubSubOptionsScreen(selectedItem, sub.id, sub, descObj);
                } else {
                    calcStore.pItems[idx] = selectedItem;
                    calcStore.pItemSubOpts[idx] = sub.id;
                    calcStore.pItemSubSubOpts[idx] = null;
                    calcStore.save();
                    refreshAll();
                    tooltip.remove();
                }
            };
            tooltip.appendChild(subRow);
        });

        // Instantly adjust size and position
        adjustTooltipPosition();
    }

    function renderSubSubOptionsScreen(selectedItem, selectedSubId, subObj, descObj) {
        tooltip.innerHTML = ''; // Clear sub choices

        // Header (Back button and title)
        const header = document.createElement('div');
        header.style.cssText = `display:flex; align-items:center; gap:8px; width:100%; border-bottom:1px solid #ccc; padding-bottom:6px; margin-bottom:4px; box-sizing:border-box;`;

        const backBtn = document.createElement('button');
        backBtn.innerText = '←';
        backBtn.style.cssText = `background:none; border:none; color:${idolColor}; font-size:${isMobile ? '0.9rem' : '1.1rem'}; font-weight:bold; cursor:pointer; padding:0 4px; line-height:1; margin-left:auto;`;
        backBtn.onclick = (e) => {
            e.stopPropagation();
            renderSubOptionsScreen(selectedItem, descObj);
        };

        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `display:flex; align-items:center; gap:4px;`;

        const icon1 = document.createElement('img');
        icon1.src = `icons/cal/${selectedItem}.webp`;
        icon1.style.cssText = `width:${isMobile ? '20px' : '24px'}; height:${isMobile ? '20px' : '24px'}; min-width:${isMobile ? '20px' : '24px'} !important; flex-shrink:0; border-radius:4px; object-fit:contain; border:1px solid #eee; box-sizing:border-box;`;

        const arrow = document.createElement('span');
        arrow.innerText = '›';
        arrow.style.cssText = `font-size:${isMobile ? '0.6rem' : '0.8rem'}; color:#aaa; font-weight:bold; line-height:1; display:flex; align-items:center;`;

        const icon2 = document.createElement('img');
        icon2.src = `icons/cal/${selectedSubId}.webp`;
        icon2.style.cssText = `width:${isMobile ? '20px' : '24px'}; height:${isMobile ? '20px' : '24px'}; min-width:${isMobile ? '20px' : '24px'} !important; flex-shrink:0; border-radius:4px; object-fit:contain; border:1px solid #eee; box-sizing:border-box;`;

        iconWrapper.appendChild(icon1);
        iconWrapper.appendChild(arrow);
        iconWrapper.appendChild(icon2);

        header.appendChild(iconWrapper);
        header.appendChild(backBtn);
        tooltip.appendChild(header);

        // Sub Sub options
        subObj.subOptions.forEach(subSub => {
            const subSubRow = document.createElement('div');
            subSubRow.style.cssText = `display:flex; align-items:center; gap:8px; padding:6px; border-radius:6px; cursor:pointer; transition:background 0.2s; width:100%; box-sizing:border-box;`;

            subSubRow.onmouseenter = () => { subSubRow.style.backgroundColor = `${idolColor}15`; };
            subSubRow.onmouseleave = () => { subSubRow.style.backgroundColor = 'transparent'; };

            const text = getPItemDescriptionText(descObj, selectedSubId, subSub.id);
            subSubRow.innerHTML = `
                <img src="icons/cal/${subSub.id}.webp" style="width:${btnSize}; height:${btnSize}; min-width:${btnSize} !important; flex-shrink:0; aspect-ratio:1/1; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;" onerror="this.src='icons/cal/${selectedSubId}.webp'; this.onerror=null;">
                <span style="font-size: ${isMobile ? '0.54rem' : '0.68rem'}; color: #333; line-height: 1.3;">${text}</span>
            `;

            subSubRow.onclick = (e) => {
                e.stopPropagation();
                calcStore.pItems[idx] = selectedItem;
                calcStore.pItemSubOpts[idx] = selectedSubId;
                calcStore.pItemSubSubOpts[idx] = subSub.id;

                calcStore.save();
                refreshAll();
                tooltip.remove();
            };
            tooltip.appendChild(subSubRow);
        });

        // Instantly adjust size and position
        adjustTooltipPosition();
    }

    slotItems.forEach(item => {
        if (isHif) {
            const descObj = pItemDescriptions.hif?.find(d => d.icons.includes(item));
            const descText = getPItemDescriptionText(descObj, null);

            const row = document.createElement('div');
            row.style.cssText = `display:flex; align-items:center; gap:8px; cursor:pointer; padding:6px; border-radius:6px; transition:background 0.2s; width:100%; box-sizing:border-box;`;

            row.onmouseenter = () => { row.style.backgroundColor = `${idolColor}15`; };
            row.onmouseleave = () => { row.style.backgroundColor = 'transparent'; };

            row.innerHTML = `
                <img src="icons/cal/${item}.webp" style="width:${btnSize}; height:${btnSize}; min-width:${btnSize} !important; flex-shrink:0; aspect-ratio:1/1; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;">
                <span style="font-size: ${isMobile ? '0.54rem' : '0.68rem'}; color: #333; white-space: normal; line-height: 1.3;">${descText}</span>
            `;
            row.onclick = (e) => {
                e.stopPropagation();
                console.log('[DEBUG showPItemSelectorTooltip] clicked:', item, 'planType:', calcStore.planType, 'descObj:', descObj);
                if (descObj && descObj.subOptions && descObj.subOptions.length > 0) {
                    renderSubOptionsScreen(item, descObj);
                } else {
                    calcStore.pItems[idx] = item;
                    calcStore.pItemSubOpts[idx] = null;
                    calcStore.pItemSubSubOpts[idx] = null;
                    calcStore.save(); refreshAll(); tooltip.remove();
                }
            };
            tooltip.appendChild(row);
        } else {
            const img = document.createElement('img');
            img.src = `icons/cal/${item}.webp`;
            img.style.cssText = `width:${btnSize}; height:${btnSize}; min-width:0 !important; aspect-ratio:1/1; cursor:pointer; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;`;
            img.onclick = () => {
                calcStore.pItems[idx] = item;
                calcStore.pItemSubOpts[idx] = null;
                calcStore.pItemSubSubOpts[idx] = null;
                calcStore.save(); refreshAll(); tooltip.remove();
            };
            tooltip.appendChild(img);
        }
    });

    document.body.appendChild(tooltip);
    history.pushState({ modalOpen: 'pItem' }, "");
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
            if (e.type === 'scroll' || (!tooltip.contains(e.target) && !slot.contains(e.target))) {
                tooltip.remove();
                document.removeEventListener('click', closeTooltip);
                if (idolContainer) idolContainer.removeEventListener('scroll', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
        if (idolContainer) idolContainer.addEventListener('scroll', closeTooltip, { passive: true });
    }, 10);
}

/**
 * P-아이템 정보 툴팁 표시
 */
export function showPItemInfoTooltip(infoBtn, pItemDescriptions) {
    if (document.querySelector('.p-item-info-tooltip')) { document.querySelector('.p-item-info-tooltip').remove(); return; }

    const isMobile = window.innerWidth <= 768;
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const isJa = state.currentLang !== 'ko';
    const fontSize = isMobile ? (state.currentLang === 'en' ? '0.56rem' : (isJa ? '0.5rem' : '0.55rem')) : (state.currentLang === 'en' ? '0.7rem' : '0.75rem');
    const imgSize = isMobile ? '16px' : '24px';
    const gap = isMobile ? '4px' : '8px';

    const tooltip = document.createElement('div');
    tooltip.className = 'calc-tooltip p-item-info-tooltip';
    tooltip.style.cssText = `position: absolute; width: max-content; max-width: 95vw; padding: ${isMobile ? '6px 8px' : '12px 15px'}; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); border: 2px solid ${idolColor}; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); font-size: ${fontSize}; color: #333; line-height: 1.2; z-index: 10000; white-space: nowrap;`;

    let selectedItems = [];
    const maxSlots = calcStore.type === 'nia' ? 5 : (calcStore.type === 'hif' ? 1 : 2);

    for (let i = 0; i < maxSlots; i++) {
        const itemId = calcStore.pItems[i];
        if (!itemId) continue;

        const descObj = pItemDescriptions[calcStore.type]?.find(d => d.icons?.includes(itemId));
        if (!descObj) continue;

        if (calcStore.type === 'hif') {
            // 1차 메인 P-아이템 효과 추가
            selectedItems.push({
                icon: itemId,
                text: getPItemDescriptionText(descObj, null, null)
            });

            // 2차 서브 옵션 효과 추가
            const subId = calcStore.pItemSubOpts[i];
            if (subId) {
                selectedItems.push({
                    icon: subId,
                    text: getPItemDescriptionText(descObj, subId, null)
                });

                // 3차 추가 세부 옵션 효과 추가
                const subSubId = calcStore.pItemSubSubOpts[i];
                if (subSubId) {
                    selectedItems.push({
                        icon: subSubId,
                        text: getPItemDescriptionText(descObj, subId, subSubId)
                    });
                }
            }
        } else {
            // 일반 아이돌은 슬롯별 메인 아이콘/효과 표시
            selectedItems.push({
                icon: itemId,
                text: getPItemDescriptionText(descObj, null, null)
            });
        }
    }

    let contentHtml = '';
    if (selectedItems.length === 0) {
        const fallbackText = state.currentLang === 'en' ? 'No P-items equipped.' : (state.currentLang === 'ja' ? '装備されたPアイテムがありません。' : '장착된 P-아이템이 없습니다.');
        contentHtml = `<div style="text-align: center; color: #999; padding: 4px 0;">${fallbackText}</div>`;
    } else {
        if (calcStore.type === 'hif') {
            // HIF 모드에서는 각 단계별 활성 구간 타이틀과 경계선을 융합하여 렌더링 (하드코딩 방식)
            const sections = [];
            selectedItems.forEach((item, index) => {
                const dashCount = (item.icon.match(/-/g) || []).length;
                let titleText = '';
                if (dashCount === 0) {
                    titleText = state.currentLang === 'en' ? 'Selection Exam Day 7 ~ 12' : (state.currentLang === 'ja' ? '選抜試験7日~12日' : '선발시험 7일 ~ 12일');
                } else if (dashCount === 1) {
                    titleText = state.currentLang === 'en' ? 'Selection Exam Day 14 ~ 19' : (state.currentLang === 'ja' ? '選抜試験14日~19日' : '선발시험 14일 ~ 19일');
                } else if (dashCount === 2) {
                    titleText = state.currentLang === 'en' ? 'Finals Day 1 ~ 6' : (state.currentLang === 'ja' ? '本戦1日~6日' : '본선 1일 ~ 6일');
                }

                const sectionHeaderHtml = `
                    <div style="display: flex; align-items: center; gap: 8px; margin: ${index === 0 ? '2px' : '8px'} 0 4px 0; width: 100%; box-sizing: border-box;">
                        <span style="font-size: ${isMobile ? '0.52rem' : '0.6rem'}; font-weight: bold; color: #888; white-space: nowrap;">${titleText}</span>
                        <div style="height: 1px; flex-grow: 1; background: #ddd;"></div>
                    </div>
                `;

                sections.push(`
                    ${sectionHeaderHtml}
                    <div style="display: flex; align-items: center; gap: ${gap}; padding-left: 4px; box-sizing: border-box; width: 100%;">
                        <img src="icons/cal/${item.icon}.webp" style="width: ${imgSize}; height: ${imgSize}; border-radius: 4px; object-fit: contain; flex-shrink: 0;" onerror="this.src='icons/cal/hif1.webp'; this.onerror=null;">
                        <span style="font-size: ${fontSize}; color: #333; line-height: 1.3; white-space: normal;">${item.text}</span>
                    </div>
                `);
            });
            contentHtml = sections.join('');
        } else {
            // 일반 아이돌은 기존처럼 리스트만 출력
            contentHtml = selectedItems.map(item => {
                return `<div style="display: flex; align-items: center; gap: ${gap};">
                            <img src="icons/cal/${item.icon}.webp" style="width: ${imgSize}; height: ${imgSize}; border-radius: 4px; object-fit: contain; flex-shrink: 0;" onerror="this.src='icons/cal/hif1.webp'; this.onerror=null;">
                            <span style="font-size: ${fontSize}; color: #333; line-height: 1.3;">${item.text}</span>
                        </div>`;
            }).join('');
        }
    }

    tooltip.innerHTML = `<div style="display: flex; flex-direction: column; gap: ${gap};">${contentHtml}</div>`;
    document.body.appendChild(tooltip);

    const rect = infoBtn.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 8;

    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;
    // 무조건 아래로 표시되도록 위로 뜨는 로직 제거

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // 스크롤 시 닫기 리스너 추가
    setTimeout(() => {
        const idolContainer = document.getElementById('idol');
        const closeTooltip = (e) => {
            if (!tooltip.parentElement) return;
            if (e.type === 'scroll' || (!tooltip.contains(e.target) && !infoBtn.contains(e.target))) {
                tooltip.remove();
                document.removeEventListener('click', closeTooltip);
                if (idolContainer) idolContainer.removeEventListener('scroll', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
        if (idolContainer) idolContainer.addEventListener('scroll', closeTooltip, { passive: true });
    }, 10);
}

/**
 * 서포트 카드의 아이템 효과 설명을 보여주는 툴팁
 */
export function showSupportItemTooltip(slot, cardId) {
    document.querySelectorAll('.support-item-tooltip').forEach(t => t.remove());

    const isMobile = window.innerWidth <= 768;
    const attrColors = {
        vocal: "#f766a4",
        dance: "#5aa6f0",
        visual: "#fdc361",
        assist: "#72da49"
    };
    const card = cardList.find(c => c.id === cardId);
    if (!card || !card.item_effects) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'calc-tooltip support-item-tooltip';

    // 모바일 대응 스타일 조정
    const padding = isMobile ? '6px 10px' : '10px 14px';
    const borderWidth = isMobile ? '1.2px' : '2px';
    const fontSize = isMobile ? '0.7rem' : '0.8rem';
    const imgSize = isMobile ? '24px' : '32px';

    const borderColor = attrColors[card.type] || getIdolDisplayColor(calcStore.selectedIdol || 'saki');
    const maxWidth = isMobile ? '240px' : '300px';
    const gap = isMobile ? '6px' : '10px';
    tooltip.style.cssText = `position: absolute; display: inline-flex; flex-direction: row; align-items: center; gap: ${gap}; width: auto; max-width: ${maxWidth}; padding: ${padding}; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border: ${borderWidth} solid ${borderColor}; border-radius: 8px; font-size: ${fontSize}; color: #333; line-height: 1.4; z-index: 40000;`;

    // 아이템 효과 텍스트 생성
    const effects = getParsedItemEffectsText(card.item_effects);

    tooltip.innerHTML = `
        <img src="images/support/${cardId}_item.webp" style="width: ${imgSize}; height: ${imgSize}; border-radius: 4px; border: 1px solid #eee; flex-shrink: 0;" onerror="this.src='images/support/${cardId}.webp'; this.onerror=null;">
        <div style="opacity: 0.9;">${effects}</div>
    `;

    document.body.appendChild(tooltip);

    const rect = slot.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 10;

    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;

    if (rect.bottom + tooltipHeight + 50 > window.innerHeight) {
        top = rect.top + window.scrollY - tooltipHeight - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    setTimeout(() => {
        const idolContainer = document.getElementById('idol');
        const closeTooltip = (e) => {
            if (!tooltip.parentElement) return;
            if (e.type === 'scroll' || (!tooltip.contains(e.target) && !slot.contains(e.target))) {
                tooltip.remove();
                document.removeEventListener('click', closeTooltip);
                if (idolContainer) idolContainer.removeEventListener('scroll', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
        if (idolContainer) idolContainer.addEventListener('scroll', closeTooltip, { passive: true });
    }, 10);
}

/**
 * 재능개화 정보 툴팁 표시
 */
export function showTalentBloomInfoTooltip(infoBtn) {
    if (document.querySelector('.talent-bloom-info-tooltip')) { document.querySelector('.talent-bloom-info-tooltip').remove(); return; }

    const isMobile = window.innerWidth <= 768;
    const lang = state.currentLang;
    const isJa = lang === 'ja';
    const isEn = lang === 'en';
    const fontSize = isMobile ? (isJa ? '0.5rem' : '0.55rem') : '0.75rem';
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    const tooltip = document.createElement('div');
    tooltip.className = 'calc-tooltip talent-bloom-info-tooltip';
    // PC에서는 450px 정도의 적절한 최대 너비를 주고, 모바일에서는 90vw를 유지
    const maxWidth = isMobile ? '90vw' : '450px';
    tooltip.style.cssText = `position: absolute; width: max-content; max-width: ${maxWidth}; padding: ${isMobile ? '8px 10px' : '12px 15px'}; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border: 2px solid ${idolColor}; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); font-size: ${fontSize}; color: #333; line-height: 1.4; z-index: 10000;`;

    const srRow = `<div style="display: flex; align-items: center; gap: 6px;"><img src="icons/sr.png" onerror="this.src='icons/sr.webp'" style="width: 16px; height: 16px; object-fit: contain; opacity: 0.8;"><span>${isEn ? 'SR Idol' : (isJa ? 'SRアイドル' : 'SR 등급')}</span></div>`;
    const sainouRow = `<div style="display: flex; align-items: center; gap: 6px;"><img src="icons/sainou.webp" style="width: 16px; height: 16px; object-fit: contain; opacity: 0.8;"><span>${isEn ? 'Bloom 3+' : (isJa ? '才能開花3段階以上' : '재능개화 3단계 이상')}</span></div>`;
    const primaRow = calcStore.type === 'hif' ? `<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 16px; height: 16px; background-color: ${idolColor}; -webkit-mask-image: url('icons/primastella.webp'); mask-image: url('icons/primastella.webp'); -webkit-mask-size: contain; mask-size: contain; mask-position: center; mask-repeat: no-repeat; opacity: 0.8;"></div><span>${isEn ? 'Primastella' : (isJa ? '一番星解放' : '프리마스텔라 해방')}</span></div>` : '';

    tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; color: #333; align-items: center; text-align: center;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center;">
                ${srRow}
                ${sainouRow}
                ${primaRow}
            </div>
            <div style="width: 100%; height: 1px; background: #ddd; margin: 2px 0;"></div>
            <div style="line-height: 1.4; text-align: left;">${t('talent_bloom_desc_2')}</div>
        </div>
    `;

    document.body.appendChild(tooltip);

    const rect = infoBtn.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + window.scrollY + 8;

    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
    if (left < 10) left = 10;
    if (rect.bottom + tooltipHeight + 20 > window.innerHeight) top = rect.top + window.scrollY - tooltipHeight - 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    setTimeout(() => {
        const closeTooltip = (e) => {
            if (!tooltip.parentElement) return;
            if (!tooltip.contains(e.target) && !infoBtn.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', closeTooltip);
            }
        };
        document.addEventListener('click', closeTooltip);
    }, 10);
}

/**
 * 화면 중앙 하단에 토스트 메시지 표시
 */
export function showToast(msg) {
    // 기존 토스트 제거
    const existing = document.querySelector('.calc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'calc-toast';
    toast.textContent = msg;

    // 스타일 적용
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        backgroundColor: 'rgba(255, 64, 129, 0.95)', // 브랜드 컬러 느낌의 핑크
        color: 'white',
        padding: '12px 24px',
        borderRadius: '30px',
        fontSize: '0.85rem',
        zIndex: '10000',
        opacity: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
        fontWeight: 'bold'
    });

    document.body.appendChild(toast);

    // 애니메이션 시작
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // 3초 후 제거
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
