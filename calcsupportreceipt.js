import { state, idolColors } from './state.js';
import { calcStore } from './calcStore.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getSupportPercentBonusForCard, getTriggerCounts } from './calcLogic.js';

// CSS 동적 로드
if (!document.getElementById('calc-support-receipt-css')) {
    const link = document.createElement('link');
    link.id = 'calc-support-receipt-css';
    link.rel = 'stylesheet';
    link.href = 'css/calcsupportreceipt.css';
    document.head.appendChild(link);
}

/**
 * 어빌리티 ID에 해당하는 다국어/가독성 높은 설명 텍스트 반환
 */
function getAbilityName(abilityId, card, lb) {
    let nameText = '';

    if (abilityId === 'event') {
        if (state.currentLang === 'ja') nameText = 'イベント発動';
        else if (state.currentLang === 'en') nameText = 'Event Trigger';
        else nameText = '이벤트 발동';
    } else if (abilityId === 'item_effect') {
        if (state.currentLang === 'ja') nameText = 'Pアイテム';
        else if (state.currentLang === 'en') nameText = 'P-Item';
        else nameText = 'P아이템';
    } else {
        const data = abilityData[abilityId];
        if (!data) return abilityId;

        if (data.name) {
            nameText = data.name[state.currentLang] || data.name.ko || data.name.en || abilityId;
        } else if (data.format) {
            const format = data.format[state.currentLang] || data.format.ko || data.format.en;
            const displayTarget = card.abilityTargets?.[abilityId] || card.type;
            const rarity = card.rarity || 'SSR';
            const isDist = card.source === 'dist';
            let rarityKey = rarity;
            if (rarity === 'SSR' && isDist && data.levels['SSR_DIST']) rarityKey = 'SSR_DIST';

            let val = 0;
            if (abilityId === 'percentparam' || abilityId === 'fixedparam' || abilityId === 'assistppoint') {
                const targetLv = lb + 1;
                const bonusLevels = data.levels[rarityKey] || data.levels[rarity] || data.levels;
                val = bonusLevels[targetLv] || bonusLevels[5] || Object.values(bonusLevels)[Object.values(bonusLevels).length - 1];
            } else {
                let targetLv = 1;
                const bonusLevels = data.levels[rarityKey] || data.levels[rarity] || data.levels;
                val = bonusLevels[targetLv] || bonusLevels[1];
            }

            let translatedType = '';
            if (state.currentLang === 'ja') {
                translatedType = displayTarget === 'vocal' ? 'ボーカル' : (displayTarget === 'dance' ? 'ダンス' : (displayTarget === 'visual' ? 'ビジュアル' : 'アシスト'));
            } else if (state.currentLang === 'en') {
                translatedType = displayTarget === 'vocal' ? 'Vocal' : (displayTarget === 'dance' ? 'Dance' : (displayTarget === 'visual' ? 'Visual' : 'Assist'));
            } else {
                translatedType = displayTarget === 'vocal' ? '보컬' : (displayTarget === 'dance' ? '댄스' : (displayTarget === 'visual' ? '비쥬얼' : '어시스트'));
            }

            nameText = format.replaceAll('{val}', val).replaceAll('{type}', translatedType);
        } else {
            nameText = abilityId;
        }
    }

    return nameText
        .replace(' 파라미터', '')
        .replace('パラメータ', '')
        .replace(' Parameter', '');
}

/**
 * 서포트 카드가 특정 속성에 기여한 상세 내역 계산
 */
export function getCardReceiptBreakdown(card, attr) {
    const selectedIds = calcStore.planCards[calcStore.planType] || [];
    const isSixth = selectedIds.indexOf(card.id) === 5;
    const lb = isSixth ? 4 : (state.supportLB[card.id] || 0);

    const counts = getTriggerCounts(calcStore);
    const itemCounter = calcStore.cardChecked?.[card.id] ? (calcStore.itemCounters[card.id] || 0) : 0;
    const includeEvent = !!calcStore.cardEventChecked[card.id];

    // 1. 단일 서포트 카드 보너스 계산 (breakdowns 포함)
    const bonus = calculateCardBonus(card, counts, lb, itemCounter, includeEvent);

    const breakdownItems = [];
    let totalSum = 0;

    // 2. 고정치 상승 어빌리티 / 기본 보너스 / 아이템 효과 내역 파싱
    const candidateSources = [];
    candidateSources.push('event');
    let hasStatItemEffect = false;
    if (card.item_effects) {
        card.item_effects.forEach(eff => {
            if (eff.stats && ((eff.stats.vocal || 0) > 0 || (eff.stats.dance || 0) > 0 || (eff.stats.visual || 0) > 0)) {
                hasStatItemEffect = true;
            }
        });
    }
    if (hasStatItemEffect) {
        candidateSources.push('item_effect');
    }
    const excludedAbilities = [
        'hpmax', 'supportrateup', 'event_paraup',
        'event_recoveryup', 'alllesson_ppoint', 'ppoint', 'sp_ppoint',
        'sp_recovery', 'allsp_recovery', 'test_recovery', 'gift_recovery',
        'sp_lessonup', 'allsp_lessonup'
    ];
    if (card.abilities) {
        card.abilities.forEach(abId => {
            if (!excludedAbilities.includes(abId) && abId !== 'percentparam') {
                candidateSources.push(abId);
            }
        });
    }

    candidateSources.forEach(sourceId => {
        let val = 0;
        let count = null;
        let max = null;

        if (sourceId === 'event') {
            val = bonus.breakdowns?.['event']?.[attr] || 0;
        } else if (sourceId === 'item_effect') {
            val = bonus.breakdowns?.['item_effect']?.[attr] || 0;
            if (card.item_effects) {
                card.item_effects.forEach(eff => {
                    if (eff.type === 'action' && eff.stats && itemCounter > 0) {
                        if (eff.stats[attr] > 0) {
                            let totalTriggerCount = 0;
                            const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                            const lessonCounts = counts.lessons;
                            const totalCounts = counts.total || counts;
                            triggers.forEach(t => {
                                if (t === 'lesson') {
                                    totalTriggerCount += (lessonCounts[card.type]?.normal || 0) + (lessonCounts[card.type]?.sp || 0);
                                } else if (t === 'sp') {
                                    totalTriggerCount += (lessonCounts[card.type]?.sp || 0);
                                } else if (t === 'class') {
                                    totalTriggerCount += (totalCounts['class_hajime'] || 0) + (totalCounts['class_nia'] || 0) + (totalCounts['class_hif0'] || 0) + (totalCounts['class_hif1'] || 0);
                                } else if (t === 'gift') {
                                    totalTriggerCount += (totalCounts['gift_hajime'] || 0) + (totalCounts['gift_nia'] || 0) + (totalCounts['gift_hif'] || 0);
                                } else if (t === 'goout') {
                                    totalTriggerCount += (totalCounts['goout_hajime'] || 0) + (totalCounts['goout_nia'] || 0) + (totalCounts['goout_hif'] || 0);
                                } else {
                                    totalTriggerCount += (totalCounts[t] || 0);
                                }
                            });
                            count = totalTriggerCount;
                            max = itemCounter;
                        }
                    }
                });
            }
        } else {
            val = bonus.breakdowns?.[sourceId]?.[attr] || 0;
            const data = abilityData[sourceId];
            const abilityTarget = card.abilityTargets?.[sourceId] || card.type;

            if (sourceId === 'sp_param') {
                count = counts.lessons[abilityTarget]?.sp || 0;
            } else if (sourceId === 'normallesson_param') {
                count = counts.lessons[abilityTarget]?.normal || 0;
            } else if (sourceId === 'lesson_param') {
                const c = counts.lessons[abilityTarget];
                count = c ? (c.normal + c.sp) : 0;
            } else if (data && data.trigger) {
                count = 0;
                data.trigger.forEach(tid => {
                    count += (counts.total?.[tid] || counts[tid] || 0);
                });
                if (data.max) {
                    max = data.max;
                }
            }
        }

        if (max !== null && count !== null) {
            count = Math.min(count, max);
        }

        breakdownItems.push({
            id: sourceId,
            name: getAbilityName(sourceId, card, lb),
            value: val,
            count: count,
            max: max
        });
        totalSum += val;
    });

    // 3. 퍼센트 보너스 어빌리티 기여량 계산 (어빌리티에 존재한다면 0이어도 항상 노출)
    if (card.abilities?.includes('percentparam')) {
        const totalPercs = window._lastStatBreakdown?.totalPercs || null;
        const canGivePercent = card.type === attr || card.type === 'assist';
        const percentContrib = canGivePercent ? getSupportPercentBonusForCard(calcStore, bonus.percent, attr, totalPercs) : 0;

        breakdownItems.push({
            id: 'percentparam',
            name: getAbilityName('percentparam', card, lb),
            value: percentContrib,
            count: null,
            max: null
        });
        totalSum += percentContrib;
    }

    // 4. carddata.js 내 abilities 배열의 순서대로 정렬 (아이템 효과 및 이벤트 발동을 최하단에 배치)
    const abilityOrder = card.abilities || [];
    breakdownItems.sort((a, b) => {
        let idxA = abilityOrder.indexOf(a.id);
        let idxB = abilityOrder.indexOf(b.id);

        if (a.id === 'item_effect') idxA = 100;
        if (b.id === 'item_effect') idxB = 100;

        if (a.id === 'event') idxA = 101;
        if (b.id === 'event') idxB = 101;

        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;

        return idxA - idxB;
    });

    return {
        card,
        lb,
        attr,
        items: breakdownItems,
        total: totalSum
    };
}

/**
 * 서포트 카드별 상세 스탯 영수증 툴팁 열기
 */
export function showSupportCardReceiptTooltip(textBox, cardId, attr) {
    // 1. 기존 영수증 툴팁이 열려있다면 닫기
    const existing = document.getElementById('calc-support-receipt-tooltip');
    if (existing) {
        existing.remove();
        if (existing.dataset.targetId === cardId && existing.dataset.targetAttr === attr) {
            // 동일한 대상을 클릭했을 경우 닫기(Toggle)만 수행하고 리턴
            return;
        }
    }

    const card = cardList.find(c => c.id === cardId);
    if (!card) return;

    // 2. 영수증 기여 상세 내역 계산
    const receipt = getCardReceiptBreakdown(card, attr);
    if (receipt.items.length === 0) return; // 표시할 내역이 전혀 없으면 열지 않음

    const row = textBox.closest('.detail-column-card-row');
    if (!row) return;

    // 3. 툴팁 엘리먼트 동적 생성
    const tooltip = document.createElement('div');
    tooltip.id = 'calc-support-receipt-tooltip';

    let docClickHandler = null;

    // 툴팁 자체를 클릭해도 닫히도록 설정하고 부모 요소로의 전파만 차단
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip.remove();
        if (docClickHandler) {
            document.removeEventListener('click', docClickHandler);
        }
    });
    tooltip.addEventListener('mousedown', (e) => e.stopPropagation());
    // 보컬(좌측)은 좌정렬, 비주얼(우측)은 우정렬, 댄스(중앙)는 중앙정렬로 상단에 배치
    if (attr === 'vocal') {
        tooltip.className = 'calc-support-receipt-tooltip pos-top-left';
    } else if (attr === 'visual') {
        tooltip.className = 'calc-support-receipt-tooltip pos-top-right';
    } else {
        tooltip.className = 'calc-support-receipt-tooltip pos-top-center';
    }
    tooltip.dataset.targetId = cardId;
    tooltip.dataset.targetAttr = attr;

    // 속성별 컬러 지정 (보컬: 분홍, 댄스: 파랑, 비쥬얼: 노랑)
    const themeColor = attr === 'vocal' ? '#ff4d8d' : (attr === 'dance' ? '#46a4f3' : '#fcc75e');
    tooltip.style.borderColor = themeColor;

    let attrName = '';
    let totalLabel = '';
    if (state.currentLang === 'ja') {
        attrName = attr === 'vocal' ? 'ボーカル' : (attr === 'dance' ? 'ダンス' : 'ビジュアル');
        totalLabel = `${attrName}合計`;
    } else if (state.currentLang === 'en') {
        attrName = attr === 'vocal' ? 'Vocal' : (attr === 'dance' ? 'Dance' : 'Visual');
        totalLabel = `${attrName} Total`;
    } else {
        attrName = attr === 'vocal' ? '보컬' : (attr === 'dance' ? '댄스' : '비쥬얼');
        totalLabel = `${attrName} 합계`;
    }

    const flowersHtml = Array.from({ length: 4 }, (_, i) => {
        const active = i < receipt.lb;
        const src = active ? 'icons/flower.webp' : 'icons/flowerback.webp';
        return `<img src="${src}" style="width: 12px; height: 12px; object-fit: contain; margin-right: 1px; vertical-align: middle;">`;
    }).join('');

    const cardDisplayName = (state.currentLang === 'en') ? (card.name_en || card.name_ja || card.name) : (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;

    tooltip.innerHTML = `
        <div class="receipt-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <img src="icons/${card.rarity.toLowerCase()}.png" onerror="this.src='icons/${card.rarity.toLowerCase()}.webp'" style="height: 20px; object-fit: contain; vertical-align: middle;">
                    <img src="icons/${(card.plan || 'free').toLowerCase()}.webp" onerror="this.src='icons/${(card.plan || 'free').toLowerCase()}.png'" style="height: 20px; object-fit: contain; vertical-align: middle;">
                </div>
                <div class="receipt-card-stars" style="display: flex; align-items: center; gap: 1px;">${flowersHtml}</div>
            </div>
            <div class="receipt-card-name" style="font-weight: 800; font-size: 0.7rem; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; margin-top: 4px;">${cardDisplayName}</div>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-body">
            ${receipt.items.map(item => `
                <div class="receipt-item">
                    <div style="display: flex; align-items: center; gap: 4px; overflow: hidden; max-width: 80%;">
                        <span class="receipt-item-name" style="max-width: 100%;">${item.name}</span>
                        ${item.count !== null && item.count !== undefined ? (
                            item.max !== null && item.max !== undefined
                            ? `<span style="font-size: 0.62rem; color: #888; font-weight: normal; white-space: nowrap; flex-shrink: 0;">(${item.count}/${item.max})</span>`
                            : `<span style="font-size: 0.62rem; color: #888; font-weight: normal; white-space: nowrap; flex-shrink: 0;">(${item.count})</span>`
                        ) : ''}
                    </div>
                    <span class="receipt-item-value" style="color: ${themeColor}; font-weight: bold; flex-shrink: 0;">+${item.value}</span>
                </div>
            `).join('')}
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-footer">
            <span class="receipt-total-label">${totalLabel}</span>
            <span class="receipt-total-value" style="background-color: ${themeColor}; color: white; font-weight: bold; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem;">+${receipt.total}</span>
        </div>
    `;

    // document.body 대신 카드 로우 자체에 속하도록 자식으로 추가하여 스크롤 시 자연스럽게 연동
    row.appendChild(tooltip);

    // 5. 툴팁 바깥 영역 클릭 시 닫히도록 하는 이벤트 위임
    setTimeout(() => {
        docClickHandler = (e) => {
            if (!tooltip.contains(e.target) && !textBox.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', docClickHandler);
            }
        };
        document.addEventListener('click', docClickHandler);
    }, 10);
}
