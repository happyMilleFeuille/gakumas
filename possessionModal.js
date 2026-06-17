// possessionModal.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import translations from './i18n.js';
import { openIdolPossessionModal } from './idolPossessionModal.js';



// Avoid circular dependency by dynamically importing ui.js when needed
async function getRenderSupport() {
    const { renderSupport } = await import('./ui.js');
    return renderSupport;
}


const SOURCE_ORDER = ['normal', 'limited', 'limited_f', 'limited_u', 'dist'];
const SOURCE_KEY_MAP = {
    normal: 'filter_normal',
    limited: 'filter_limited',
    limited_f: 'filter_limited_f',
    limited_u: 'filter_limited_u',
    dist: 'filter_dist'
};
const getSourceLabel = (src) => {
    const key = SOURCE_KEY_MAP[src];
    if (!key) return src;
    const currentLang = state.currentLang || 'ko';
    return translations[currentLang]?.[key] || translations.ko[key] || '';
};

const formatRate = (owned, total) => {
    if (total === 0) return '0';
    if (owned === total) return '100';
    if (owned === 0) return '0';
    const rateRaw = (owned / total) * 100;
    let formatted = rateRaw.toFixed(1);
    if (formatted === '100.0' || formatted === '100') {
        formatted = '99.9';
    }
    if (formatted === '0.0' || formatted === '0') {
        formatted = '0.1';
    }
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
};


const TYPE_ORDER = ['vocal', 'dance', 'visual', 'assist'];
const PLAN_ORDER = ['free', 'sense', 'logic', 'anomaly'];

const getTypeLabel = (type) => {
    const key = `attr_${type.toLowerCase()}`;
    const currentLang = state.currentLang || 'ko';
    return translations[currentLang]?.[key] || translations.ko[key] || type;
};

const getPlanLabel = (plan) => {
    if (plan === 'free') {
        const currentLang = state.currentLang || 'ko';
        const freeLabels = { ko: '프리', ja: 'フリー', en: 'Free' };
        return freeLabels[currentLang] || freeLabels.ko;
    }
    const key = `calc_tune_plan_${plan.toLowerCase()}`;
    const currentLang = state.currentLang || 'ko';
    return translations[currentLang]?.[key] || translations.ko[key] || plan;
};

function calculatePossessionStats(rarityFilter, sourceFilter, typeFilter, planFilter) {
    const activeCards = cardList.filter(c => {
        if (c.encyclopedia === false) return false;

        // Rarity filter
        if (rarityFilter && rarityFilter.length > 0) {
            if (!rarityFilter.includes(c.rarity)) return false;
        }

        // Source filter
        const cardSource = c.source || 'normal';
        if (sourceFilter && sourceFilter.length > 0) {
            if (!sourceFilter.includes(cardSource)) return false;
        }

        // Type filter
        const cardType = c.type ? c.type.toLowerCase() : '';
        if (typeFilter && typeFilter.length > 0) {
            if (!typeFilter.includes(cardType)) return false;
        }

        // Plan filter
        const cardPlan = c.plan ? c.plan.toLowerCase() : 'free';
        if (planFilter && planFilter.length > 0) {
            if (!planFilter.includes(cardPlan)) return false;
        }

        return true;
    });
    const byRarity = {};
    const bySource = {};

    activeCards.forEach(card => {
        const rarity = card.rarity || 'Other';
        const source = card.source || 'normal';

        if (!byRarity[rarity]) {
            byRarity[rarity] = {
                total: 0,
                owned: 0,
                lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
                cardsByLb: { 0: [], 1: [], 2: [], 3: [], 4: [] },
                unownedCards: []
            };
        }
        byRarity[rarity].total++;

        if (!bySource[source]) {
            bySource[source] = {
                total: 0,
                owned: 0,
                lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
                cardsByLb: { 0: [], 1: [], 2: [], 3: [], 4: [] },
                unownedCards: []
            };
        }
        bySource[source].total++;

        const isDeactivated = !!state.disabledCards[card.id];
        if (!isDeactivated) {
            const lb = state.supportLB[card.id] || 0;
            const cardEntry = { ...card, isDeactivated, lb };
            byRarity[rarity].owned++;
            bySource[source].owned++;
            byRarity[rarity].lb[lb] = (byRarity[rarity].lb[lb] || 0) + 1;
            bySource[source].lb[lb] = (bySource[source].lb[lb] || 0) + 1;
            byRarity[rarity].cardsByLb[lb].push(cardEntry);
            bySource[source].cardsByLb[lb].push(cardEntry);
        } else {
            const cardEntry = { ...card, isDeactivated, lb: 0 };
            byRarity[rarity].unownedCards.push(cardEntry);
            bySource[source].unownedCards.push(cardEntry);
        }
    });

    // Sort rarity card lists by releasedAt descending (newest first)
    Object.keys(byRarity).forEach(rarity => {
        for (let i = 0; i <= 4; i++) {
            byRarity[rarity].cardsByLb[i].sort((a, b) => {
                const dateA = a.releasedAt || '1970-01-01';
                const dateB = b.releasedAt || '1970-01-01';
                if (dateA !== dateB) {
                    return dateB.localeCompare(dateA);
                }
                return b.id.localeCompare(a.id);
            });
        }
        byRarity[rarity].unownedCards.sort((a, b) => {
            const dateA = a.releasedAt || '1970-01-01';
            const dateB = b.releasedAt || '1970-01-01';
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }
            return b.id.localeCompare(a.id);
        });
    });

    // Sort source card lists by releasedAt descending (newest first)
    Object.keys(bySource).forEach(source => {
        for (let i = 0; i <= 4; i++) {
            bySource[source].cardsByLb[i].sort((a, b) => {
                const dateA = a.releasedAt || '1970-01-01';
                const dateB = b.releasedAt || '1970-01-01';
                if (dateA !== dateB) {
                    return dateB.localeCompare(dateA);
                }
                return b.id.localeCompare(a.id);
            });
        }
        bySource[source].unownedCards.sort((a, b) => {
            const dateA = a.releasedAt || '1970-01-01';
            const dateB = b.releasedAt || '1970-01-01';
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }
            return b.id.localeCompare(a.id);
        });
    });

    return { byRarity, bySource };
}

function getPossessionTextSummary(stats) {
    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const langKey = isJa ? 'ja' : isEn ? 'en' : 'ko';

    let summary = isJa ? `📊 Gakumas Note サポカ所持状況\n` : isEn ? `📊 Gakumas Note Support Card Stats\n` : `📊 Gakumas Note 서포 카드 소지 현황\n`;

    const activeRarities = Object.keys(stats.byRarity).sort().reverse();
    const rarityLabelText = activeRarities.join(' + ') || 'None';

    const mergedRarityStats = { total: 0, owned: 0, lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } };
    activeRarities.forEach(rarity => {
        const rStats = stats.byRarity[rarity];
        mergedRarityStats.total += rStats.total;
        mergedRarityStats.owned += rStats.owned;
        for (let i = 0; i <= 4; i++) {
            mergedRarityStats.lb[i] += rStats.lb[i] || 0;
        }
    });

    const rate = formatRate(mergedRarityStats.owned, mergedRarityStats.total);
    const rateLabel = isJa ? '所持率' : isEn ? 'Rate' : '소지율';
    const ownedLabel = isJa ? '凸' : isEn ? 'LB' : '돌';

    summary += `\n⭐ ${rarityLabelText} ${rateLabel}: ${rate}% (${mergedRarityStats.owned}/${mergedRarityStats.total})\n`;
    summary += `   ▸0${ownedLabel}: ${mergedRarityStats.lb[0]} | 1${ownedLabel}: ${mergedRarityStats.lb[1]} | 2${ownedLabel}: ${mergedRarityStats.lb[2]} | 3${ownedLabel}: ${mergedRarityStats.lb[3]} | 4${ownedLabel}: ${mergedRarityStats.lb[4]}\n`;

    const totalAll = mergedRarityStats.total;
    const ownedAll = mergedRarityStats.owned;

    const totalRate = formatRate(ownedAll, totalAll);
    const overallRateLabel = isJa ? '全体所持率' : isEn ? 'Overall Rate' : '전체 소지율';
    summary += `\n📈 ${overallRateLabel}: ${totalRate}% (${ownedAll}/${totalAll})`;

    summary += `\n\n--- ${isJa ? '分類別' : isEn ? 'By Source' : '분류별'} ---`;
    SOURCE_ORDER.forEach(src => {
        const sStats = stats.bySource[src];
        if (!sStats) return;
        const label = getSourceLabel(src);
        const rate = formatRate(sStats.owned, sStats.total);
        summary += `\n🏷️ ${label}: ${rate}% (${sStats.owned}/${sStats.total})`;
    });

    return summary;
}

function buildSectionInnerHtml(label, sStats, themeColor, isOverall = false) {
    const rate = formatRate(sStats.owned, sStats.total);

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const ownedLabel = isJa ? '凸' : isEn ? 'LB' : '돌';

    const maxLbVal = sStats.total || 1;

    // Exactly three integer Y-axis labels: Max, Mid, 0
    const gridMax = sStats.total;
    const gridMid = Math.round(sStats.total / 2);

    const unownedCount = sStats.total - sStats.owned;
    const unownedPct = ((unownedCount / maxLbVal) * 100).toFixed(1);
    const unownedLabelText = isJa ? '未所持' : isEn ? 'Unowned' : '미소지';

    let barsHtml = `
        <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
            <div style="width: 14px; height: ${unownedPct}%; background-color: #cbd5e1; border-top-left-radius: 2px; border-top-right-radius: 2px; position: relative; border: 1px solid #94a3b8; border-bottom: none; box-sizing: border-box;">
                <!-- Prevent vertical wrapping of multi-digit values -->
                <div class="possession-chart-bar-value" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${unownedCount > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none;">${formatRate(unownedCount, maxLbVal)}%</div>
            </div>
        </div>
    `;

    let xAxisLabelsHtml = `
        <div class="possession-chart-xaxis-label" style="flex: 1; font-size: 0.75rem; font-weight: bold; color: #777; text-align: center;">${unownedLabelText}</div>
    `;

    for (let i = 0; i <= 4; i++) {
        const val = sStats.lb[i] || 0;
        const pct = ((val / maxLbVal) * 100).toFixed(1);
        const isMax = i === 4;

        // Colors: 명함~3돌(i < 4)은 금색(#ffb300), 4돌(isMax)은 무지개 그라데이션
        const barBgColor = isMax 
            ? 'linear-gradient(180deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)' 
            : '#ffb300';
        const labelColor = isMax ? '#ff4d8d' : '#e68a00';
        const barBorderColor = isMax ? '#ff7fa5' : '#d97706';

        barsHtml += `
            <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                <div style="width: 14px; height: ${pct}%; background: ${barBgColor}; border-top-left-radius: 2px; border-top-right-radius: 2px; position: relative; border: 1px solid ${barBorderColor}; border-bottom: none; box-sizing: border-box;">
                    <!-- Prevent vertical wrapping of multi-digit values -->
                    <div class="possession-chart-bar-value" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${val > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none;">${formatRate(val, maxLbVal)}%</div>
                </div>
            </div>
        `;

        xAxisLabelsHtml += `
            <div class="possession-chart-xaxis-label" style="flex: 1; font-size: 0.75rem; font-weight: bold; color: ${labelColor}; text-align: center;">${i}${ownedLabel}</div>
        `;
    }

    let barColor = 'linear-gradient(90deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)';
    const numRate = parseFloat(rate);
    if (numRate < 50) {
        barColor = '#eef8ff';
    } else if (numRate < 95) {
        barColor = 'linear-gradient(90deg, #fff44f 0%, #fffde6 25%, #ffcc00 50%)';
    }

    let detailColsHtml = '';
    for (let i = 0; i <= 4; i++) {
        const cards = sStats.cardsByLb?.[i] || [];

        let cardImgsHtml = '';
        cards.forEach(c => {
            const imgSrc = c.image || `images/support/thumb/${c.id}.webp`;
            const imgStyle = c.isDeactivated
                ? 'filter: grayscale(90%); opacity: 0.8; border: 1px dashed #ccc;'
                : '';

            cardImgsHtml += `
                <div class="possession-detail-card" 
                     data-card-id="${c.id}" 
                     style="position: relative; width: 100%; aspect-ratio: 5 / 3; border-radius: 6px; overflow: hidden; background: #f0f0f0; border: 1px solid #ddd; box-sizing: border-box; margin-bottom: 4px; flex-shrink: 0;">
                    <img src="${imgSrc}" 
                         onerror="this.src='icons/card.png';" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block; ${imgStyle}">
                </div>
            `;
        });

        const borderRightStyle = i === 4 ? '' : 'border-right: 1px solid #f0f0f0;';
        detailColsHtml += `
            <div class="possession-detail-col" style="flex: 1; display: flex; flex-direction: column; min-width: 0; padding: 0 8px 6px 8px; ${borderRightStyle} box-sizing: border-box; position: relative;">
                <div class="possession-col-header" style="font-size: 0.72rem; font-weight: 800; color: #555; text-align: center; padding-top: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; user-select: none; flex-shrink: 0; position: sticky; top: 0; background: #ffffff; z-index: 10; margin-bottom: 8px;">
                    ${i}${ownedLabel} (${cards.length})
                </div>
                <div class="possession-detail-card-list" style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 2px;">
                    ${cardImgsHtml || `<div style="font-size: 0.65rem; color: #bbb; text-align: center; margin-top: 10px; user-select: none;">-</div>`}
                </div>
            </div>
        `;
    }

    const unownedCards = sStats.unownedCards || [];
    const hasOwned = sStats.owned > 0;
    const hasUnowned = unownedCards.length > 0;

    const hexToRgba = (hex, alpha) => {
        if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const ownedBg = hexToRgba(themeColor, 0.08);
    const ownedBorder = hexToRgba(themeColor, 0.12);

    let ownedStyle = '';
    let unownedSectionStyle = '';

    if (hasOwned && hasUnowned) {
        ownedStyle = `background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px 8px 0 0; border-bottom: none;`;
        unownedSectionStyle = `margin-top: -1px; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 0 0 8px 8px;`;
    } else if (hasOwned) {
        ownedStyle = `background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px;`;
    } else if (hasUnowned) {
        unownedSectionStyle = `margin-top: 12px; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 8px;`;
    }

    let unownedCardsHtml = '';
    if (hasUnowned) {
        let unownedCardImgsHtml = '';
        unownedCards.forEach(c => {
            const imgSrc = c.image || `images/support/thumb/${c.id}.webp`;

            unownedCardImgsHtml += `
                <div class="possession-detail-card" 
                     data-card-id="${c.id}" 
                     style="position: relative; width: 100%; aspect-ratio: 5 / 3; border-radius: 6px; overflow: hidden; background: #f0f0f0; border: 1px solid #ddd; box-sizing: border-box;">
                    <img src="${imgSrc}" 
                         onerror="this.src='icons/card.png';" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(90%); opacity: 0.8;">
                </div>
            `;
        });

        const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';
        unownedCardsHtml = `
            <div class="possession-unowned-section" style="display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px; box-sizing: border-box; ${unownedSectionStyle}">
                <div class="possession-unowned-title" style="font-size: 0.72rem; font-weight: 800; color: #999; text-align: left; padding-left: 8px; user-select: none;">
                    ${unownedLabel} (${unownedCards.length})
                </div>
                <div class="possession-unowned-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 0 8px;">
                    ${unownedCardImgsHtml}
                </div>
            </div>
        `;
    }

    let ownedContainerHtml = '';
    if (hasOwned) {
        ownedContainerHtml = `
            <div class="possession-owned-container" style="display: flex; gap: 0; justify-content: space-between; align-items: stretch; width: 100%; box-sizing: border-box; ${ownedStyle}">
                ${detailColsHtml}
            </div>
        `;
    }

    const detailContainerHtml = `
        <div class="possession-detail-container" style="display: none; margin-top: 12px;">
            <div class="possession-detail-scroll-wrapper" style="background: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; max-height: ${isOverall ? '520px' : '420px'}; overflow-y: auto; padding: 8px; box-sizing: border-box; display: flex; flex-direction: column;">
                ${ownedContainerHtml}
                ${unownedCardsHtml}
            </div>
        </div>
    `;

    return `
        <div class="possession-category-item" style="display: flex; flex-direction: column;">
            <div class="possession-category-header" style="display: flex; justify-content: space-between; align-items: center; user-select: none; cursor: pointer;">
                <span class="possession-section-title-label" style="font-weight: 800; color: #333;">${label}</span>
                <div style="display: flex; align-items: center; gap: 8px; margin-right: 4px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span class="possession-section-title-rate" style="font-weight: 800; color: ${themeColor};">${rate}%</span>
                        <span class="possession-section-title-count" style="font-weight: 800; color: #333;">(${sStats.owned}/${sStats.total})</span>
                    </div>
                    <div class="possession-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; border-radius: 50%; transition: none !important;">
                        <svg class="possession-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>
            <div style="width: 100%; height: 10px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: ${isOverall ? '5px' : '0'}; overflow: hidden; box-sizing: border-box; margin-bottom: 14px;">
                <div style="width: ${rate}%; height: 100%; background: ${barColor};"></div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 5px; background: #ffffff; padding: 14px 12px 6px; border-radius: 8px; border: 1px solid #f0f0f0;">
                <div class="possession-chart-area-wrapper" style="display: flex; flex-direction: column; gap: 5px; width: 100%; max-width: 630px;">
                    <!-- Chart Area (Y axis + Bars with grid) -->
                    <div style="display: flex; align-items: flex-end;">
                        <!-- Y Axis labels (Max, Mid, 0) -->
                        <div class="possession-chart-yaxis" style="position: relative; width: 30px; height: 60px; font-size: 0.7rem; color: #888; font-weight: bold; margin-right: 6px; user-select: none;">
                            <span style="position: absolute; right: 4px; top: 0%; transform: translateY(-50%); white-space: nowrap;">${gridMax}</span>
                            <span style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); white-space: nowrap;">${gridMid}</span>
                            <span style="position: absolute; right: 4px; top: 100%; transform: translateY(-50%); white-space: nowrap;">0</span>
                        </div>
                        
                        <!-- Bars Container with grids -->
                        <div class="possession-chart-bars" style="flex: 1; height: 60px; position: relative; border-bottom: 2px solid #cbd5e1; border-left: 2px solid #cbd5e1; box-sizing: border-box;">
                            <div style="position: absolute; left: 0; right: 0; top: 0%; border-top: 1px dashed #e2e8f0;"></div>
                            <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed #e2e8f0;"></div>
                            
                            <div style="position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: flex-end; z-index: 2; padding: 0 10px;">
                                ${barsHtml}
                            </div>
                        </div>
                    </div>
                    
                    <!-- X Axis Labels (left padding aligned with Y axis width 30px + margin 6px = 36px) -->
                    <div class="possession-chart-xaxis-container" style="display: flex; padding-left: 36px;">
                        <div style="flex: 1; display: flex; justify-content: space-around; text-align: center; padding: 0 10px;">
                            ${xAxisLabelsHtml}
                        </div>
                    </div>
                </div>
            </div>
            ${detailContainerHtml}
        </div>
    `;
}

function buildStatsContent(stats, themeColor, langKey, isJa, isEn) {
    let totalAll = 0;
    let ownedAll = 0;

    // Rarity sections - merged into a single section
    const activeRarities = Object.keys(stats.byRarity).sort().reverse();
    const rarityLabelText = activeRarities.join(' + ') || 'None';

    const mergedRarityStats = {
        total: 0,
        owned: 0,
        lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
        cardsByLb: { 0: [], 1: [], 2: [], 3: [], 4: [] },
        unownedCards: []
    };
    activeRarities.forEach(rarity => {
        const rStats = stats.byRarity[rarity];
        if (!rStats) return;
        mergedRarityStats.total += rStats.total;
        mergedRarityStats.owned += rStats.owned;
        for (let i = 0; i <= 4; i++) {
            mergedRarityStats.lb[i] += rStats.lb[i] || 0;
            if (rStats.cardsByLb && rStats.cardsByLb[i]) {
                mergedRarityStats.cardsByLb[i].push(...rStats.cardsByLb[i]);
            }
        }
        if (rStats.unownedCards) {
            mergedRarityStats.unownedCards.push(...rStats.unownedCards);
        }
    });

    // Sort globally by releasedAt descending (newest first) across all merged rarities
    for (let i = 0; i <= 4; i++) {
        mergedRarityStats.cardsByLb[i].sort((a, b) => {
            const dateA = a.releasedAt || '1970-01-01';
            const dateB = b.releasedAt || '1970-01-01';
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }
            return b.id.localeCompare(a.id);
        });
    }
    mergedRarityStats.unownedCards.sort((a, b) => {
        const dateA = a.releasedAt || '1970-01-01';
        const dateB = b.releasedAt || '1970-01-01';
        if (dateA !== dateB) {
            return dateB.localeCompare(dateA);
        }
        return b.id.localeCompare(a.id);
    });

    totalAll = mergedRarityStats.total;
    ownedAll = mergedRarityStats.owned;
    const totalRate = formatRate(ownedAll, totalAll);
    const numRate = parseFloat(totalRate);

    let cardBg = 'linear-gradient(135deg, rgba(255, 235, 122, 0.10) 0%, rgba(255, 139, 173, 0.10) 35%, rgba(194, 147, 255, 0.10) 70%, rgba(115, 232, 255, 0.10) 100%)';
    let cardBorder = '1px solid rgba(255, 139, 173, 0.25)';
    if (numRate < 50) {
        cardBg = 'linear-gradient(135deg, rgba(70, 164, 243, 0.09), rgba(70, 164, 243, 0.13))';
        cardBorder = '1px solid rgba(70, 164, 243, 0.20)';
    } else if (numRate < 95) {
        cardBg = 'linear-gradient(135deg, rgba(255, 204, 0, 0.09), rgba(255, 204, 0, 0.13))';
        cardBorder = '1px solid rgba(255, 204, 0, 0.20)';
    }

    let raritySectionsHtml = '';
    if (activeRarities.length > 0) {
        const innerHtml = buildSectionInnerHtml(rarityLabelText, mergedRarityStats, themeColor, true);
        raritySectionsHtml = `
            <div class="possession-section-card" data-is-overall="true" style="margin-bottom: 15px; background: ${cardBg}; border: ${cardBorder}; border-radius: 10px; padding: 16px;">
                ${innerHtml}
            </div>
        `;
    }

    // Source sections
    let sourceSectionsHtml = '';
    const sourceItems = [];
    SOURCE_ORDER.forEach(src => {
        const sStats = stats.bySource[src];
        if (!sStats) return;
        const label = getSourceLabel(src);
        sourceItems.push(buildSectionInnerHtml(label, sStats, themeColor, false));
    });

    if (sourceItems.length > 0) {
        const sourceCardBodyHtml = sourceItems.join('<div style="height: 24px;"></div>');
        sourceSectionsHtml = `
            <div class="possession-section-card" style="margin-bottom: 15px; background: #fafafa; border: 1px solid #eee; border-radius: 10px; padding: 16px;">
                ${sourceCardBodyHtml}
            </div>
        `;
    }

    const totalRateLabel = isJa ? '全体所持率' : isEn ? 'Overall Rate' : '전체 소지율';
    const rarityLabel = totalRateLabel;
    const sourceLabel = isJa ? '分類別' : isEn ? 'By Source' : '분류별';

    return {
        totalRate, totalAll, ownedAll, totalRateLabel,
        html: `
            <style>
                .possession-detail-card-list::-webkit-scrollbar {
                    width: 3px;
                }
                .possession-detail-card-list::-webkit-scrollbar-track {
                    background: transparent;
                }
                .possession-detail-card-list::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 1.5px;
                }
                .possession-detail-card-list::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .possession-detail-scroll-wrapper::-webkit-scrollbar {
                    width: 4px;
                }
                .possession-detail-scroll-wrapper::-webkit-scrollbar-track {
                    background: transparent;
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                .possession-detail-scroll-wrapper::-webkit-scrollbar-thumb {
                    background: #bbb;
                    border-radius: 2px;
                }
                .possession-detail-scroll-wrapper::-webkit-scrollbar-thumb:hover {
                    background: #888;
                }
                .possession-category-header {
                    padding: 6px 8px;
                    margin: -6px -8px 6px -8px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    transition: background-color 0.15s, border-color 0.15s;
                }
                .possession-category-header:hover {
                    background: rgba(0, 0, 0, 0.03);
                    border-color: rgba(0, 0, 0, 0.08);
                }
                .possession-chart-area-wrapper {
                    width: 100% !important;
                    max-width: 630px !important;
                }
                .possession-unowned-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                    padding: 0 8px;
                }
                .possession-unowned-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: #999;
                    text-align: left;
                    padding-left: 8px;
                    user-select: none;
                }
                @media (max-width: 768px) {
                    .possession-unowned-grid {
                        gap: 4px !important;
                        padding: 0 4px !important;
                    }
                    .possession-unowned-title {
                        font-size: 0.55rem !important;
                        padding-left: 4px !important;
                    }
                }
            </style>
            <div id="possession-overall-label" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                <img src="icons/flower.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span>${rarityLabel}</span>
            </div>
            ${raritySectionsHtml}
            <div id="possession-source-label" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; margin-top: 4px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                <img src="icons/train.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span>${sourceLabel}</span>
            </div>
            ${sourceSectionsHtml}
        `
    };
}

export function openPossessionModal() {
    let modal = document.getElementById('possession-modal');
    if (modal) modal.remove();

    const themeColor = '#ff4d8d';

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'possession-modal';
    modal.style.zIndex = '35000';

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const langKey = isJa ? 'ja' : isEn ? 'en' : 'ko';

    const title = isJa ? 'サポカ所持状況' : isEn ? 'Support Card Stats' : '서포트 카드 통계';
    const desc = isJa ? '💡 <b>カード目録で長押しして非活性化</b>したカードは未所持カードに分類されます。' : isEn ? '💡 Cards <b>deactivated by long-press</b> are classified as not owned.' : '💡 <b>카드 목록에서 길게 눌러 비활성화</b>한 카드는 미소지 카드로 분류됩니다.';
    const saveImageBtn = isJa ? '이미지 저장' : isEn ? 'Save Image' : '이미지 저장';
    const alertGeneratingImage = isJa ? '이미지 생성 중...' : isEn ? 'Generating image...' : '이미지 생성 중...';
    const alertFailImage = isJa ? '이미지 저장에 실패했습니다.' : isEn ? 'Failed to save image.' : '이미지 저장에 실패했습니다.';
    const alertSuccessImage = isJa ? '画像を保存しました。' : isEn ? 'Image saved successfully.' : '이미지가 저장되었습니다.';

    function showSupportToast(message, duration = 2000) {
        const existing = document.querySelector('.support-possession-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'support-possession-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(0, 0, 0, 0.78);
            color: #fff;
            padding: 10px 24px;
            border-radius: 24px;
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 100001;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        `;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }

    // Initial stats (both unchecked = show all)
    let currentFilter = ['SSR', 'SR'];
    let currentSourceFilter = [...SOURCE_ORDER];
    let currentStats = calculatePossessionStats(currentFilter, currentSourceFilter, null, null);
    const initialContent = buildStatsContent(currentStats, themeColor, langKey, isJa, isEn);

    const activeTextStyle = `background: ${themeColor}; color: #fff;`;
    const inactiveTextStyle = `background: #fff; color: #999;`;
    const activeImgStyle = `background: #ffe4ef;`;
    const inactiveImgStyle = `background: #fff;`;

    modal.innerHTML = `
        <style>
            /* Overall Section (Main) - PC */
            .possession-section-card[data-is-overall="true"] .possession-section-title-label {
                font-size: 1.05rem;
            }
            .possession-section-card[data-is-overall="true"] .possession-section-title-rate {
                font-size: 0.98rem;
            }
            .possession-section-card[data-is-overall="true"] .possession-section-title-count {
                font-size: 0.82rem;
            }

            /* Sub Section (Source/Classification) - PC */
            .possession-section-card:not([data-is-overall="true"]) .possession-section-title-label {
                font-size: 0.92rem;
            }
            .possession-section-card:not([data-is-overall="true"]) .possession-section-title-rate {
                font-size: 0.85rem;
            }
            .possession-section-card:not([data-is-overall="true"]) .possession-section-title-count {
                font-size: 0.72rem;
            }

            @media (max-width: 768px) {
                .possession-modal-content {
                    width: 100% !important;
                    max-width: 95% !important;
                    min-width: 0 !important;
                    padding: 14px 16px 6px 16px !important;
                    gap: 8px !important;
                    border-radius: 14px !important;
                }
                .possession-title-wrap {
                    font-size: 1.05rem !important;
                    gap: 6px !important;
                }
                .possession-title-indicator {
                    height: 16px !important;
                }
                #btn-possession-save-image {
                    height: 24px !important;
                    padding: 0 8px !important;
                    font-size: 0.68rem !important;
                    border-radius: 5px !important;
                }
                #possession-filter-rarity-area {
                    border-radius: 6px !important;
                }
                #possession-filter-rarity-area button {
                    padding: 4px 0 !important;
                }
                #possession-filter-rarity-area img {
                    height: 16px !important;
                }
                #possession-filter-source-area {
                    border-radius: 6px !important;
                }
                #possession-filter-source-area button {
                    padding: 4px 0 !important;
                    font-size: 0.7rem !important;
                    min-width: 36px !important;
                }
                #possession-scroll-area {
                    padding-left: 12px !important;
                    padding-right: 12px !important;
                    gap: 4px !important;
                }
                .possession-section-card {
                    border-radius: 6px !important;
                }
                #possession-stats-area {
                    gap: 8px !important;
                }
                #possession-overall-label {
                    margin-top: 10px !important;
                }
                #possession-overall-label,
                #possession-source-label {
                    font-size: 0.85rem !important;
                    margin-bottom: -3px !important;
                }
                /* Overall Section (Main) - Mobile */
                .possession-section-card[data-is-overall="true"] .possession-section-title-label {
                    font-size: 0.85rem !important;
                }
                .possession-section-card[data-is-overall="true"] .possession-section-title-rate {
                    font-size: 0.82rem !important;
                }
                .possession-section-card[data-is-overall="true"] .possession-section-title-count {
                    font-size: 0.6rem !important;
                }

                /* Sub Section (Source/Classification) - Mobile */
                .possession-section-card:not([data-is-overall="true"]) .possession-section-title-label {
                    font-size: 0.72rem !important;
                }
                .possession-section-card:not([data-is-overall="true"]) .possession-section-title-rate {
                    font-size: 0.7rem !important;
                }
                .possession-section-card:not([data-is-overall="true"]) .possession-section-title-count {
                    font-size: 0.52rem !important;
                }
                .possession-chart-xaxis-label {
                    font-size: 0.48rem !important;
                }
                .possession-chart-bar-value {
                    font-size: 0.48rem !important;
                    top: -10px !important;
                }
                .possession-col-header {
                    font-size: 0.4rem !important;
                }
                .possession-detail-col {
                    padding: 0 4px 6px 4px !important;
                }
                .possession-category-header:hover {
                    background: transparent !important;
                    border-color: transparent !important;
                }
                #possession-desc {
                    font-size: 0.58rem !important;
                    line-height: 1.35 !important;
                    margin: 0 !important;
                }
                .possession-category-item > div:last-child {
                    border-radius: 5px !important;
                }
                .possession-detail-scroll-wrapper {
                    border-radius: 5px !important;
                    padding: 0 6px 8px 6px !important;
                }
                .possession-detail-card-list {
                    gap: 2px !important;
                }
                .possession-detail-card {
                    border-radius: 3px !important;
                    margin-bottom: 2px !important;
                }
                .possession-chart-area-wrapper {
                    max-width: 270px !important;
                    margin: 0 auto !important;
                }
                .possession-chart-yaxis {
                    font-size: 0.45rem !important;
                    height: 45px !important;
                    width: 12px !important;
                    margin-right: 1px !important;
                }
                .possession-chart-bars {
                    height: 45px !important;
                }
                .possession-chart-xaxis-container {
                    padding-left: 18px !important;
                }
                .possession-save-options-content {
                    width: 270px !important;
                    padding: 16px !important;
                    gap: 8px !important;
                    border-radius: 12px !important;
                }
                .possession-save-options-content .save-opt-title {
                    font-size: 0.85rem !important;
                    margin-top: 2px !important;
                    margin-bottom: 2px !important;
                }
                .possession-save-options-content button.calc-btn {
                    padding: 11px 8px !important;
                    font-size: 0.65rem !important;
                    border-radius: 6px !important;
                    width: 90% !important;
                }
                .possession-save-options-content #btn-save-opt-close {
                    font-size: 1rem !important;
                    top: 4px !important;
                    right: 4px !important;
                }
            }
        </style>
        <div class="modal-content possession-modal-content" style="width: 740px; max-width: 90%; min-width: min(560px, 90%); max-height: 85dvh; padding: 20px 28px 18px 28px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; border-radius: 18px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); overflow: hidden; background-color: #ffffff;">
            <!-- Header section containing the Title and Save Image button on the top-right -->
            <div id="possession-header-area" style="display: flex; justify-content: space-between; align-items: center; user-select: none; width: 100%;">
                <div class="possession-title-wrap" style="display: flex; align-items: center; gap: 8px; font-size: 1.3rem; font-weight: 800; color: #333;">
                    <div class="possession-title-indicator" style="width: 4px; height: 20px; background-color: ${themeColor}; border-radius: 2px;"></div>
                    <span>${title}</span>
                </div>
                <button id="btn-possession-save-image" class="calc-btn" style="height: 34px; padding: 0 14px; background-color: ${themeColor}; color: #fff; font-weight: bold; font-size: 0.85rem; border: none; border-radius: 8px; cursor: pointer; transition: none !important; display: flex; align-items: center; gap: 4px;">
                    ${saveImageBtn}
                </button>
            </div>

            <!-- Scrollable container that wraps both filters and stats -->
            <div id="possession-scroll-area" style="flex: 1; min-height: 0; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 14px;">
                <div id="possession-filter-rarity-area" style="display: flex; flex-shrink: 0; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff;">
                    <button id="filter-ssr" style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; cursor: pointer; transition: none !important; ${inactiveImgStyle}">
                        <img src="icons/ssr.png" alt="SSR" style="height: 20px; object-fit: contain; transition: none !important; filter: grayscale(100%) opacity(40%);">
                    </button>
                    <button id="filter-sr" style="flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; cursor: pointer; transition: none !important; ${inactiveImgStyle}">
                        <img src="icons/sr.png" alt="SR" style="height: 20px; object-fit: contain; transition: none !important; filter: grayscale(100%) opacity(40%);">
                    </button>
                </div>

                <!-- Source Filters -->
                <div id="possession-filter-source-area" style="display: flex; flex-shrink: 0; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff;">
                    <button id="filter-src-normal" style="flex: 1; min-width: 50px; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${inactiveTextStyle}">${getSourceLabel('normal')}</button>
                    <button id="filter-src-limited" style="flex: 1; min-width: 50px; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${inactiveTextStyle}">${getSourceLabel('limited')}</button>
                    <button id="filter-src-limited_f" style="flex: 1; min-width: 50px; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${inactiveTextStyle}">${getSourceLabel('limited_f')}</button>
                    <button id="filter-src-limited_u" style="flex: 1; min-width: 50px; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${inactiveTextStyle}">${getSourceLabel('limited_u')}</button>
                    <button id="filter-src-dist" style="flex: 1; min-width: 50px; padding: 6px 0; border: none; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${inactiveTextStyle}">${getSourceLabel('dist')}</button>
                </div>

                <div id="possession-stats-area" style="display: flex; flex-direction: column; gap: 12px;">
                    ${initialContent.html}
                </div>
            </div>

            <!-- Description moved to the bottom -->
            <div id="possession-desc" style="font-size: 0.82rem; color: #777; line-height: 1.4; margin-top: 0; word-break: keep-all;">
                ${desc}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'supportPossession' }, "");
    modal.style.display = 'flex';

    let isClosing = false;
    const closeModal = () => {
        if (isClosing) return;
        isClosing = true;
        if (history.state && history.state.modalOpen === 'supportPossession') {
            history.back();
        } else {
            modal.remove();
        }
    };

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Filter logic
    const filterSSR = modal.querySelector('#filter-ssr');
    const filterSR = modal.querySelector('#filter-sr');
    let ssrActive = false;
    let srActive = false;

    const sourceButtons = {};
    const activeSources = {};
    SOURCE_ORDER.forEach(src => {
        sourceButtons[src] = modal.querySelector(`#filter-src-${src}`);
        activeSources[src] = false;
    });

    function updateFilters() {
        currentFilter = [];
        if (ssrActive) currentFilter.push('SSR');
        if (srActive) currentFilter.push('SR');
        // Both off = both on (show all)
        if (currentFilter.length === 0) currentFilter = ['SSR', 'SR'];

        currentSourceFilter = [];
        SOURCE_ORDER.forEach(src => {
            if (activeSources[src]) currentSourceFilter.push(src);
        });
        if (currentSourceFilter.length === 0) currentSourceFilter = [...SOURCE_ORDER];

        filterSSR.style.cssText = `flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; cursor: pointer; transition: none !important; ${ssrActive ? activeImgStyle : inactiveImgStyle}`;
        const ssrImg = filterSSR.querySelector('img');
        if (ssrImg) {
            ssrImg.style.filter = ssrActive ? 'none' : 'grayscale(100%) opacity(40%)';
            ssrImg.style.transition = 'none';
        }

        filterSR.style.cssText = `flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; cursor: pointer; transition: none !important; ${srActive ? activeImgStyle : inactiveImgStyle}`;
        const srImg = filterSR.querySelector('img');
        if (srImg) {
            srImg.style.filter = srActive ? 'none' : 'grayscale(100%) opacity(40%)';
            srImg.style.transition = 'none';
        }

        SOURCE_ORDER.forEach((src, idx) => {
            const isLast = idx === SOURCE_ORDER.length - 1;
            const borderStyle = isLast ? 'border: none;' : 'border: none; border-right: 1px solid #cbd5e1;';
            sourceButtons[src].style.cssText = `flex: 1; min-width: 50px; padding: 6px 0; ${borderStyle} font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${activeSources[src] ? activeTextStyle : inactiveTextStyle}`;
        });

        currentStats = calculatePossessionStats(currentFilter, currentSourceFilter, null, null);
        const content = buildStatsContent(currentStats, themeColor, langKey, isJa, isEn);
        modal.querySelector('#possession-stats-area').innerHTML = content.html;
    }

    filterSSR.onclick = () => {
        ssrActive = !ssrActive;
        updateFilters();
    };

    filterSR.onclick = () => {
        srActive = !srActive;
        updateFilters();
    };

    SOURCE_ORDER.forEach(src => {
        sourceButtons[src].onclick = () => {
            activeSources[src] = !activeSources[src];
            updateFilters();
        };
    });

    const statsArea = modal.querySelector('#possession-stats-area');
    statsArea.addEventListener('click', (e) => {
        const categoryHeader = e.target.closest('.possession-category-header');
        if (categoryHeader) {
            const categoryItem = categoryHeader.closest('.possession-category-item');
            if (categoryItem) {
                const detailContainer = categoryItem.querySelector('.possession-detail-container');
                if (detailContainer) {
                    const chevron = categoryHeader.querySelector('.possession-chevron');
                    if (detailContainer.style.display === 'none' || detailContainer.style.display === '') {
                        detailContainer.style.display = 'block';
                        if (chevron) {
                            chevron.style.transform = 'rotate(180deg)';
                        }
                    } else {
                        detailContainer.style.display = 'none';
                        if (chevron) {
                            chevron.style.transform = 'rotate(0deg)';
                        }
                    }
                }
            }
        }
    });

    const showSaveOptionsModal = (onSelect) => {
        history.pushState({ modalOpen: 'saveOptions' }, "");

        let optionsModal = document.createElement('div');
        optionsModal.className = 'modal';
        optionsModal.style.zIndex = '36000';
        optionsModal.style.display = 'flex';
        optionsModal.style.alignItems = 'center';
        optionsModal.style.justifyContent = 'center';
        optionsModal.style.position = 'fixed';
        optionsModal.style.inset = '0';
        optionsModal.style.background = 'rgba(0, 0, 0, 0.7)';

        const titleText = isJa ? '保存方法の選択 (.webp)' : isEn ? 'Select Save Method (.webp)' : '저장 방식 선택 (.webp)';
        const optOverallText = isJa ? '全体所持率のみ保存 (詳細情報を含む)' : isEn ? 'Save Overall Rate Only (Include Details)' : '전체 소지율만 저장(상세정보 포함)';
        const optAllText = isJa ? '全体保存' : isEn ? 'Save Everything' : '전체 저장';

        optionsModal.innerHTML = `
            <div class="modal-content possession-save-options-content" style="width: 380px; padding: 24px; border-radius: 16px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 13px; box-sizing: border-box; text-align: center; position: relative;">
                <button id="btn-save-opt-close" style="position: absolute; right: 6px; top: 6px; background: none; border: none; font-size: 1.25rem; font-weight: bold; color: #888; cursor: pointer; padding: 2px; line-height: 1; transition: none !important;">&times;</button>
                <div class="save-opt-title" style="font-weight: 800; font-size: 1.1rem; color: #333; margin-bottom: 4px; margin-top: 8px;">${titleText}</div>
                <button id="btn-save-opt-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: ${themeColor}; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                    ${optAllText}
                </button>
                <button id="btn-save-opt-overall" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: #555; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                    ${optOverallText}
                </button>
            </div>
        `;

        document.body.appendChild(optionsModal);

        optionsModal.onClose = () => {
            optionsModal.remove();
            onSelect(null);
        };

        const closeOptionsModal = (result) => {
            const parentModal = document.getElementById('possession-modal');
            if (parentModal) {
                parentModal.setAttribute('data-prevent-popstate', 'true');
            }
            optionsModal.remove();
            if (history.state && history.state.modalOpen === 'saveOptions') {
                history.back();
            } else {
                if (parentModal) {
                    parentModal.removeAttribute('data-prevent-popstate');
                }
            }
            onSelect(result);
        };

        const closeBtn = optionsModal.querySelector('#btn-save-opt-close');
        closeBtn.onclick = () => {
            closeOptionsModal(null);
        };
        optionsModal.querySelector('#btn-save-opt-overall').onclick = () => {
            closeOptionsModal('overall');
        };
        optionsModal.querySelector('#btn-save-opt-all').onclick = () => {
            closeOptionsModal('all');
        };
        optionsModal.onclick = (e) => {
            if (e.target === optionsModal) {
                closeOptionsModal(null);
            }
        };
    };

    modal.querySelector('#btn-possession-save-image').onclick = () => {
        const btn = modal.querySelector('#btn-possession-save-image');
        const originalText = btn.innerHTML;

        const showSpinnerOverlay = () => {
            let overlay = document.getElementById('possession-save-spinner-overlay');
            if (overlay) overlay.remove();

            overlay = document.createElement('div');
            overlay.id = 'possession-save-spinner-overlay';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.45);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                color: #fff;
                font-family: inherit;
                gap: 16px;
            `;
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                width: 46px;
                height: 46px;
                border: 4.5px solid rgba(255, 255, 255, 0.25);
                border-top: 4.5px solid ${themeColor};
                border-radius: 50%;
                animation: possession-spin 0.85s linear infinite;
                box-sizing: border-box;
                will-change: transform;
                transform: translateZ(0);
            `;
            
            if (!document.getElementById('possession-spin-style')) {
                const style = document.createElement('style');
                style.id = 'possession-spin-style';
                style.textContent = `
                    @keyframes possession-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            const label = document.createElement('div');
            label.style.cssText = `
                font-size: 0.95rem;
                font-weight: 800;
                text-shadow: 0 1px 4px rgba(0,0,0,0.4);
                letter-spacing: 0.5px;
            `;
            label.textContent = alertGeneratingImage;

            overlay.appendChild(spinner);
            overlay.appendChild(label);
            document.body.appendChild(overlay);
        };

        const hideSpinnerOverlay = () => {
            const overlay = document.getElementById('possession-save-spinner-overlay');
            if (overlay) overlay.remove();
        };

        showSaveOptionsModal((saveType) => {
            if (!saveType) return;

            showSpinnerOverlay();

            btn.innerHTML = `<span style="font-size: 0.8rem; font-weight: normal; display: flex; align-items: center; gap: 4px;">${alertGeneratingImage}</span>`;
            btn.disabled = true;

            const startCapture = () => {
                const executeCapture = () => capture();

                if (window.html2canvas) {
                    setTimeout(executeCapture, 50);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => executeCapture();
                    script.onerror = () => {
                        alert(alertFailImage);
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        hideSpinnerOverlay();
                    };
                    document.head.appendChild(script);
                }
            };

            const capture = () => {
                const modalContent = modal.querySelector('.modal-content');
                const statsArea = modal.querySelector('#possession-stats-area');
                const scrollArea = modal.querySelector('#possession-scroll-area');
                const descArea = modal.querySelector('#possession-desc');

                // Save original styles
                const origStatsFlex = statsArea ? statsArea.style.flex : '';
                const origStatsMinHeight = statsArea ? statsArea.style.minHeight : '';

                const origScrollMaxHeight = scrollArea ? scrollArea.style.maxHeight : '';
                const origScrollFlex = scrollArea ? scrollArea.style.flex : '';
                const origScrollMinHeight = scrollArea ? scrollArea.style.minHeight : '';
                const origScrollOverflow = scrollArea ? scrollArea.style.overflowY : '';
                const origScrollPadding = scrollArea ? scrollArea.style.paddingRight : '';
                const origScrollTop = scrollArea ? scrollArea.scrollTop : 0;

                const origModalMaxHeight = modalContent.style.maxHeight;
                const origModalOverflow = modalContent.style.overflow;

                // Elements to hide temporarily to make the image clean showing ONLY overall rate card
                const filterRarityArea = modalContent.querySelector('#possession-filter-rarity-area');
                const filterSourceArea = modalContent.querySelector('#possession-filter-source-area');
                const sourceLabelEl = modalContent.querySelector('#possession-source-label');

                const origFilterRarityDisplay = filterRarityArea ? filterRarityArea.style.display : '';
                const origFilterSourceDisplay = filterSourceArea ? filterSourceArea.style.display : '';
                const origSourceLabelDisplay = sourceLabelEl ? sourceLabelEl.style.display : '';

                btn.style.display = 'none';
                if (descArea) descArea.style.display = 'none';
                if (filterRarityArea) filterRarityArea.style.display = 'none';
                // Keep filterSourceArea visible in screenshots
                if (saveType === 'overall' && sourceLabelEl) sourceLabelEl.style.display = 'none';

                // Reset scroll to top before screenshot
                if (scrollArea) {
                    scrollArea.scrollTop = 0;
                    scrollArea.offsetHeight; // force reflow
                }

                // Hide the "By Source" section cards completely
                const sourceSectionCards = modalContent.querySelectorAll('.possession-section-card:not([data-is-overall="true"])');
                const origSourceCardDisplays = [];
                sourceSectionCards.forEach(card => {
                    origSourceCardDisplays.push({ el: card, display: card.style.display });
                    if (saveType === 'overall') card.style.display = 'none';
                });

                // Expand only the overall rate section and columns during screenshot
                const detailContainers = modalContent.querySelectorAll('.possession-detail-container');
                const origDetailDisplays = [];
                detailContainers.forEach(container => {
                    origDetailDisplays.push({ el: container, display: container.style.display });
                    const sectionCard = container.closest('.possession-section-card');
                    const isOverallSection = sectionCard && sectionCard.getAttribute('data-is-overall') === 'true';
                    container.style.display = (saveType === 'overall' && isOverallSection) ? 'block' : 'none';
                });

                // Reset wrapper scroll to top and force reflow
                const scrollWrappers = modalContent.querySelectorAll('.possession-detail-scroll-wrapper');
                const origWrapperStyles = [];
                scrollWrappers.forEach(wrapper => {
                    origWrapperStyles.push({
                        el: wrapper,
                        maxHeight: wrapper.style.maxHeight,
                        overflowY: wrapper.style.overflowY,
                        scrollTop: wrapper.scrollTop
                    });
                    wrapper.scrollTop = 0;
                    wrapper.offsetHeight; // force reflow
                });

                // Apply expansion styles to containers
                if (statsArea) {
                    statsArea.style.flex = 'none';
                    statsArea.style.minHeight = 'auto';
                }
                if (scrollArea) {
                    scrollArea.style.maxHeight = 'none';
                    scrollArea.style.flex = 'none';
                    scrollArea.style.minHeight = 'auto';
                    scrollArea.style.overflowY = 'visible';
                    scrollArea.style.paddingRight = '0';
                }
                modalContent.style.maxHeight = 'none';
                modalContent.style.overflow = 'visible';

                scrollWrappers.forEach(wrapper => {
                    wrapper.style.maxHeight = 'none';
                    wrapper.style.overflowY = 'visible';
                });

                // Save sticky headers position and change to static so they draw naturally at the top
                const headers = modalContent.querySelectorAll('.possession-col-header');
                const origHeaderPositions = [];
                headers.forEach(hdr => {
                    origHeaderPositions.push({ el: hdr, position: hdr.style.position });
                    hdr.style.position = 'static';
                });

                // Temporarily convert unowned card images to grayscale Base64 data URLs right before capture
                const unownedImgs = modalContent.querySelectorAll('.possession-unowned-grid img');
                const origImgSrcs = [];
                unownedImgs.forEach(img => {
                    origImgSrcs.push({ img: img, src: img.src });
                    if (window.getGrayscaleDataUrl) {
                        img.src = window.getGrayscaleDataUrl(img);
                    }
                });

                setTimeout(() => {
                    window.html2canvas(modalContent, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        useCORS: true,
                        logging: false
                    }).then(canvas => {
                        const dataUrl = canvas.toDataURL('image/webp', 0.85);
                        const isWebp = dataUrl.startsWith('data:image/webp');
                        const ext = isWebp ? 'webp' : 'png';

                        const rand = Math.floor(1000 + Math.random() * 9000);
                        const link = document.createElement('a');
                        link.download = `gakumasnote_possession_support_${rand}.${ext}`;
                        link.href = dataUrl;
                        link.click();

                        // Restore original image sources after capture
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
                        });

                        // Restore original styles
                        btn.style.display = 'flex';
                        if (descArea) descArea.style.display = '';
                        if (filterRarityArea) filterRarityArea.style.display = origFilterRarityDisplay;
                        if (filterSourceArea) filterSourceArea.style.display = origFilterSourceDisplay;
                        if (sourceLabelEl) sourceLabelEl.style.display = origSourceLabelDisplay;

                        if (statsArea) {
                            statsArea.style.flex = origStatsFlex;
                            statsArea.style.minHeight = origStatsMinHeight;
                        }
                        if (scrollArea) {
                            scrollArea.style.maxHeight = origScrollMaxHeight;
                            scrollArea.style.flex = origScrollFlex;
                            scrollArea.style.minHeight = origScrollMinHeight;
                            scrollArea.style.overflowY = origScrollOverflow;
                            scrollArea.style.paddingRight = origScrollPadding;
                            scrollArea.scrollTop = origScrollTop;
                        }
                        modalContent.style.maxHeight = origModalMaxHeight;
                        modalContent.style.overflow = origModalOverflow;

                        origSourceCardDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });

                        origDetailDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });
                        origWrapperStyles.forEach(item => {
                            item.el.style.maxHeight = item.maxHeight;
                            item.el.style.overflowY = item.overflowY;
                            item.el.scrollTop = item.scrollTop;
                        });
                        origHeaderPositions.forEach(item => {
                            item.el.style.position = item.position;
                        });

                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        hideSpinnerOverlay();
                        showSupportToast(alertSuccessImage);
                    }).catch(err => {
                        console.error('html2canvas error:', err);
                        alert(alertFailImage);

                        // Restore original image sources after capture failure
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
                        });

                        // Restore original styles
                        btn.style.display = 'flex';
                        if (descArea) descArea.style.display = '';
                        if (filterRarityArea) filterRarityArea.style.display = origFilterRarityDisplay;
                        if (filterSourceArea) filterSourceArea.style.display = origFilterSourceDisplay;
                        if (sourceLabelEl) sourceLabelEl.style.display = origSourceLabelDisplay;

                        if (statsArea) {
                            statsArea.style.flex = origStatsFlex;
                            statsArea.style.minHeight = origStatsMinHeight;
                        }
                        if (scrollArea) {
                            scrollArea.style.maxHeight = origScrollMaxHeight;
                            scrollArea.style.flex = origScrollFlex;
                            scrollArea.style.minHeight = origScrollMinHeight;
                            scrollArea.style.overflowY = origScrollOverflow;
                            scrollArea.style.paddingRight = origScrollPadding;
                            scrollArea.scrollTop = origScrollTop;
                        }
                        modalContent.style.maxHeight = origModalMaxHeight;
                        modalContent.style.overflow = origModalOverflow;

                        origSourceCardDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });

                        origDetailDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });
                        origWrapperStyles.forEach(item => {
                            item.el.style.maxHeight = item.maxHeight;
                            item.el.style.overflowY = item.overflowY;
                            item.el.scrollTop = item.scrollTop;
                        });
                        origHeaderPositions.forEach(item => {
                            item.el.style.position = item.position;
                        });

                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        hideSpinnerOverlay();
                    });
                }, 350);
            };

            startCapture();
        });
    };
}

export function openSupportMenuModal() {
    let menuModal = document.getElementById('support-menu-modal');
    if (menuModal) menuModal.remove();

    menuModal = document.createElement('div');
    menuModal.className = 'modal';
    menuModal.id = 'support-menu-modal';
    menuModal.style.zIndex = '34000';
    menuModal.style.display = 'flex';
    menuModal.style.alignItems = 'center';
    menuModal.style.justifyContent = 'center';
    menuModal.style.position = 'fixed';
    menuModal.style.inset = '0';
    menuModal.style.background = 'rgba(0, 0, 0, 0.7)';

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';

    const titleText = isJa ? 'サポートツール' : isEn ? 'Support Tools' : '지원 도구';
    const btnIdolStatsText = isJa ? 'アイドル所持状況' : isEn ? 'Idol Card Stats' : '아이돌 카드 소지 통계';
    const btnStatsText = isJa ? 'サポカ所持状況' : isEn ? 'Support Card Stats' : '서포트 카드 통계';

    const descIdolStatsText = isJa
        ? 'アイドルカードの所持状況をチェックし、統計を確認します。'
        : isEn
            ? 'Check the possession of idol cards to view the statistics.'
            : '아이돌 카드의 소지 여부를 체크하여 통계를 확인합니다.';

    const descStatsText = isJa
        ? 'サポートカードタブに設定されたサポートカード情報を基準にした統計を確認します。'
        : isEn
            ? 'Check the statistics based on the support card information set in the Support Card tab.'
            : '서포트 카드 탭에 설정된 서포트 카드 정보를 기준으로 한 통계를 확인합니다.';

    const themeColor = '#ff4d8d';

    menuModal.innerHTML = `
        <style>
            .support-menu-content {
                width: 320px;
                padding: 24px;
                border-radius: 16px;
                background: #fff;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                gap: 16px;
                box-sizing: border-box;
                position: relative;
            }
            .support-menu-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-top: 10px;
            }
            .support-menu-btn {
                width: 100%;
                padding: 0;
                font-weight: bold;
                background: #fff;
                color: #333;
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: flex-start;
                transition: none !important;
                box-sizing: border-box;
                outline: none;
                text-align: left;
                overflow: hidden;
            }
            .support-menu-btn .menu-btn-title {
                font-size: 0.95rem;
                padding: 8px 16px;
                background: #fff;
                transition: none !important;
                box-sizing: border-box;
                width: 100%;
            }
            .support-menu-btn .menu-btn-desc-row {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 14px 16px;
                box-sizing: border-box;
                background: #fff;
                color: #64748b;
            }
            .support-menu-btn .menu-btn-desc-row svg {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }
            .support-menu-btn .menu-btn-desc {
                font-size: 0.72rem;
                font-weight: normal;
                line-height: 1.4;
            }

            @media (max-width: 768px) {
                .support-menu-content {
                    width: 270px !important;
                    padding: 20px !important;
                    border-radius: 14px !important;
                    gap: 12px !important;
                }
                .support-menu-list {
                    gap: 12px !important;
                    margin-top: 6px !important;
                }
                .support-menu-btn {
                    border-radius: 10px !important;
                }
                .support-menu-btn .menu-btn-title {
                    font-size: 0.72rem !important;
                    padding: 4px 12px !important;
                }
                .support-menu-btn .menu-btn-desc-row {
                    padding: 6px 12px !important;
                    gap: 6px !important;
                }
                .support-menu-btn .menu-btn-desc-row svg {
                    width: 16px !important;
                    height: 16px !important;
                }
                .support-menu-btn .menu-btn-desc {
                    font-size: 0.58rem !important;
                    line-height: 1.3 !important;
                }
                #btn-support-menu-close {
                    top: 6px !important;
                }
            }
        </style>
        <div class="modal-content support-menu-content">
            <button id="btn-support-menu-close" style="position: absolute; right: 10px; top: 10px; background: none; border: none; font-size: 1.25rem; font-weight: bold; color: #888; cursor: pointer; padding: 2px; line-height: 1; transition: none !important;">&times;</button>
            <div class="support-menu-list">
                <button id="btn-menu-idol-stats" class="support-menu-btn">
                    <div class="menu-btn-title">
                        ${btnIdolStatsText}
                    </div>
                    <div class="menu-btn-divider" style="width: 100%; height: 1px; background: #cbd5e1; margin: 0;"></div>
                    <div class="menu-btn-desc-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-smile"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        <div class="menu-btn-desc">
                            ${descIdolStatsText}
                        </div>
                    </div>
                </button>
                <button id="btn-menu-stats" class="support-menu-btn">
                    <div class="menu-btn-title">
                        ${btnStatsText}
                    </div>
                    <div class="menu-btn-divider" style="width: 100%; height: 1px; background: #cbd5e1; margin: 0;"></div>
                    <div class="menu-btn-desc-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <div class="menu-btn-desc">
                            ${descStatsText}
                        </div>
                    </div>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(menuModal);
    menuModal.style.display = 'flex';

    // Hover effect on the buttons
    const idolStatsBtn = menuModal.querySelector('#btn-menu-idol-stats');
    const statsBtn = menuModal.querySelector('#btn-menu-stats');

    const setupHover = (btn) => {
        const titleArea = btn.querySelector('.menu-btn-title');
        const divider = btn.querySelector('.menu-btn-divider');

        const setHoverState = () => {
            btn.style.borderColor = themeColor;
            if (titleArea) titleArea.style.background = '#ffe4ef';
            if (divider) divider.style.background = 'rgba(255, 77, 141, 0.35)';
        };
        const setNormalState = () => {
            btn.style.borderColor = '#cbd5e1';
            if (titleArea) titleArea.style.background = '#fff';
            if (divider) divider.style.background = '#cbd5e1';
        };
        const setActiveState = () => {
            btn.style.borderColor = themeColor;
            if (titleArea) titleArea.style.background = '#ffd0e3';
            if (divider) divider.style.background = 'rgba(255, 77, 141, 0.35)';
        };

        btn.onmouseenter = setHoverState;
        btn.onmouseleave = setNormalState;
        btn.onmousedown = setActiveState;
        btn.onmouseup = setHoverState;

        btn.ontouchstart = setActiveState;
        btn.ontouchend = setNormalState;
    };

    setupHover(idolStatsBtn);
    setupHover(statsBtn);

    const closeBtn = menuModal.querySelector('#btn-support-menu-close');
    const closeMenu = () => {
        menuModal.remove();
    };

    closeBtn.onclick = closeMenu;
    menuModal.onclick = (e) => {
        if (e.target === menuModal) closeMenu();
    };

    idolStatsBtn.onclick = () => {
        closeMenu();
        openIdolPossessionModal();
    };

    statsBtn.onclick = () => {
        closeMenu();
        openPossessionModal();
    };
}

