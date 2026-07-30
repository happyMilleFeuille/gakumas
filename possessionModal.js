// possessionModal.js
import { state } from './state.js';
import { cardList } from './carddata.js';
import translations from './i18n.js';
import { openIdolPossessionModal } from './idolPossessionModal.js';

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
    return translations[currentLang]?.[key] || translations.ko[key] || src;
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

const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkenColor = (hex, factor = 0.4) => {
    if (!hex || !hex.startsWith('#')) return '#333333';
    const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
};


const TYPE_ORDER = ['vocal', 'dance', 'visual', 'assist'];
const PLAN_ORDER = ['free', 'sense', 'logic', 'anomaly'];

const RARITY_GRADIENTS = {
    'SSR': 'linear-gradient(180deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)',
    'SR': 'linear-gradient(180deg, #fff44f 0%, #fffde6 25%, #ffcc00 100%)',
    'R': '#cbd5e1'
};

const SOURCE_COLORS = {
    normal: '#93c5fd', // Pastel Blue
    limited: '#c084fc', // Pastel Purple
    limited_f: '#f87171', // Soft Red
    limited_u: '#fcd34d', // Pastel Yellow
    dist: '#8FDDBA' // Pastel Mint
};

const TYPE_COLORS = {
    vocal: '#ff2a6d', // Vivid Vibrant Pink/Red
    dance: '#0091ff', // Vivid Electric Blue
    visual: '#ffc107', // Vivid Pure Sunny Gold Yellow (No brown/mustard tone)
    assist: '#72da49' // Vivid Lime Green
};

const waffleQuarterState = {};

function getPreCroppedCardDataUrl(imgEl, targetWidth, targetHeight, isGrayscale, offsetYPx = 6) {
    try {
        const canvas = document.createElement('canvas');
        const scale = 2;
        const cw = Math.round((targetWidth || 138.4) * scale);
        const ch = Math.round((targetHeight || 50.32) * scale);
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);

        const nw = imgEl.naturalWidth || imgEl.width || cw;
        const nh = imgEl.naturalHeight || imgEl.height || ch;

        const fillScale = Math.max(cw / nw, ch / nh);
        const sWidth = cw / fillScale;
        const sHeight = ch / fillScale;
        const sx = (nw - sWidth) / 2;

        const defaultSy = (nh - sHeight) / 2;
        const syOffset = (offsetYPx / (targetHeight || 50.32)) * sHeight;
        const sy = Math.max(0, Math.min(nh - sHeight, defaultSy - syOffset));

        ctx.drawImage(imgEl, sx, sy, sWidth, sHeight, 0, 0, cw, ch);

        if (isGrayscale) {
            const imgData = ctx.getImageData(0, 0, cw, ch);
            const data = imgData.data;
            const factor = typeof isGrayscale === 'number' ? isGrayscale : 1.0;
            const colorFactor = 1 - factor;
            for (let i = 0; i < data.length; i += 4) {
                const gray = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
                data[i] = Math.round(data[i] * colorFactor + gray * factor);
                data[i + 1] = Math.round(data[i + 1] * colorFactor + gray * factor);
                data[i + 2] = Math.round(data[i + 2] * colorFactor + gray * factor);
            }
            ctx.putImageData(imgData, 0, 0);
        }

        return canvas.toDataURL('image/png');
    } catch (e) {
        console.warn("Pre-cropped card data URL failed:", e);
        return imgEl.src;
    }
}

const getCardQuarterKey = (releasedAt) => {
    if (!releasedAt) return '기타';
    const dateStr = typeof releasedAt === 'object' ? releasedAt.releasedAt : releasedAt;
    if (!dateStr) return '기타';
    const parts = dateStr.split('-');
    if (parts.length < 2) return '기타';
    const yearShort = parts[0].slice(-2);
    const month = parseInt(parts[1], 10);
    const half = month <= 6 ? 'H1' : 'H2';
    return `'${yearShort} ${half}`;
};

const getCardYearKey = (releasedAt) => {
    if (!releasedAt) return '기타';
    const dateStr = typeof releasedAt === 'object' ? releasedAt.releasedAt : releasedAt;
    if (!dateStr) return '기타';
    const parts = dateStr.split('-');
    if (parts.length < 1) return '기타';
    const yearShort = parts[0].slice(-2);
    return `'${yearShort}`;
};

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
    const byType = {};
    const byPlan = {};

    activeCards.forEach(card => {
        const rarity = card.rarity || 'Other';
        const source = card.source || 'normal';
        const type = (card.type || 'vocal').toLowerCase();
        const plan = (card.plan || 'free').toLowerCase();

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

        if (!byType[type]) {
            byType[type] = {
                total: 0,
                owned: 0,
                lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
                cardsByLb: { 0: [], 1: [], 2: [], 3: [], 4: [] },
                unownedCards: []
            };
        }
        byType[type].total++;

        if (!byPlan[plan]) {
            byPlan[plan] = {
                total: 0,
                owned: 0,
                lb: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
                cardsByLb: { 0: [], 1: [], 2: [], 3: [], 4: [] },
                unownedCards: []
            };
        }
        byPlan[plan].total++;

        const isDeactivated = !!state.disabledCards[card.id];
        if (!isDeactivated) {
            const lb = state.supportLB[card.id] || 0;
            const cardEntry = { ...card, isDeactivated, lb };
            byRarity[rarity].owned++;
            bySource[source].owned++;
            byType[type].owned++;
            byPlan[plan].owned++;

            byRarity[rarity].lb[lb] = (byRarity[rarity].lb[lb] || 0) + 1;
            bySource[source].lb[lb] = (bySource[source].lb[lb] || 0) + 1;
            byType[type].lb[lb] = (byType[type].lb[lb] || 0) + 1;
            byPlan[plan].lb[lb] = (byPlan[plan].lb[lb] || 0) + 1;

            byRarity[rarity].cardsByLb[lb].push(cardEntry);
            bySource[source].cardsByLb[lb].push(cardEntry);
            byType[type].cardsByLb[lb].push(cardEntry);
            byPlan[plan].cardsByLb[lb].push(cardEntry);
        } else {
            const cardEntry = { ...card, isDeactivated, lb: 0 };
            byRarity[rarity].unownedCards.push(cardEntry);
            bySource[source].unownedCards.push(cardEntry);
            byType[type].unownedCards.push(cardEntry);
            byPlan[plan].unownedCards.push(cardEntry);
        }
    });

    const sortCards = (list) => {
        list.sort((a, b) => {
            const rOrder = { 'SSR': 1, 'SR': 2, 'R': 3 };
            const rA = rOrder[a.rarity] || 99;
            const rB = rOrder[b.rarity] || 99;
            if (rA !== rB) return rA - rB;

            const tOrder = { 'vocal': 1, 'dance': 2, 'visual': 3, 'assist': 4 };
            const tA = tOrder[(a.type || '').toLowerCase()] || 99;
            const tB = tOrder[(b.type || '').toLowerCase()] || 99;
            if (tA !== tB) return tA - tB;

            const pOrder = { 'sense': 1, 'logic': 2, 'anomaly': 3, 'free': 4 };
            const pA = pOrder[(a.plan || '').toLowerCase()] || 99;
            const pB = pOrder[(b.plan || '').toLowerCase()] || 99;
            if (pA !== pB) return pA - pB;

            const dateA = a.releasedAt || '1970-01-01';
            const dateB = b.releasedAt || '1970-01-01';
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }
            return b.id.localeCompare(a.id);
        });
    };

    [byRarity, bySource, byType, byPlan].forEach(group => {
        Object.keys(group).forEach(key => {
            for (let i = 0; i <= 4; i++) {
                if (group[key].cardsByLb[i]) {
                    sortCards(group[key].cardsByLb[i]);
                }
            }
            if (group[key].unownedCards) {
                sortCards(group[key].unownedCards);
            }
        });
    });

    return { byRarity, bySource, byType, byPlan };
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

function buildSectionInnerParts(label, sStats, themeColor, isOverall = false, sourceSegmentsHtml = '', srcKey = '') {
    const rate = formatRate(sStats.owned, sStats.total);
    const numRate = parseFloat(rate);
    let rankImgHtml = '';
    if (isOverall) {
        let rankImg = 'r.png';
        if (numRate >= 95) rankImg = 'ssr.png';
        else if (numRate >= 50) rankImg = 'sr.png';
        rankImgHtml = `<img class="possession-overall-rank-icon" src="icons/${rankImg}" style="height: 46px; object-fit: contain; flex-shrink: 0; margin-right: 2px; vertical-align: middle;">`;
    }

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const currentLang = state.currentLang || 'ko';
    const ownedLabel = isJa ? '凸' : isEn ? 'LB' : '돌';

    let titleLabelHtml = '';
    if (isOverall) {
        const overallText = isJa ? '全体所持率' : isEn ? 'Overall Rate' : '전체 소지율';
        titleLabelHtml = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <img src="icons/flower.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span class="possession-section-title-label" style="font-weight: 800; color: #333;">${overallText} (${label})</span>
            </div>
        `;
    } else {
        titleLabelHtml = `
            <span class="possession-section-title-label" style="font-weight: 800; color: #333;">${label}</span>
        `;
    }

    const maxLbVal = sStats.total || 1;

    // Exactly three integer Y-axis labels: Max, Mid, 0
    const gridMax = sStats.total;
    const gridMid = Math.round(sStats.total / 2);

    const unownedCount = sStats.total - sStats.owned;
    const unownedPct = ((unownedCount / maxLbVal) * 100).toFixed(1);
    const unownedLabelText = isJa ? '未所持' : isEn ? 'Unowned' : '미소지';

    let barsHtml = `
        <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
            <div style="width: 14px; height: ${unownedPct}%; background-color: #cbd5e1; border-radius: 0; position: relative; border: 1px solid #94a3b8; border-bottom: none; box-sizing: border-box;">
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
                <div style="width: 14px; height: ${pct}%; background: ${barBgColor}; border-radius: 0; position: relative; border: 1px solid ${barBorderColor}; border-bottom: none; box-sizing: border-box;">
                    <!-- Prevent vertical wrapping of multi-digit values -->
                    <div class="possession-chart-bar-value" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${val > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none;">${formatRate(val, maxLbVal)}%</div>
                </div>
            </div>
        `;

        xAxisLabelsHtml += `
            <div class="possession-chart-xaxis-label" style="flex: 1; font-size: 0.75rem; font-weight: bold; color: ${labelColor}; text-align: center;">${i}${ownedLabel}</div>
        `;
    }

    let barColor = themeColor;
    if (isOverall) {
        barColor = 'linear-gradient(90deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)';
        if (numRate < 50) {
            barColor = '#eef8ff';
        } else if (numRate < 95) {
            barColor = 'linear-gradient(90deg, #fff44f 0%, #fffde6 25%, #ffcc00 50%)';
        }
    }

    const allCards = [];
    for (let i = 0; i <= 4; i++) {
        if (sStats.cardsByLb?.[i]) {
            allCards.push(...sStats.cardsByLb[i]);
        }
    }
    if (sStats.unownedCards) {
        allCards.push(...sStats.unownedCards);
    }

    allCards.sort((a, b) => {
        const rOrder = { 'SSR': 1, 'SR': 2, 'R': 3 };
        const rA = rOrder[a.rarity] || 99;
        const rB = rOrder[b.rarity] || 99;
        if (rA !== rB) return rA - rB;

        // 2순위: 돌파 높은 순 (4돌 -> 0돌 -> 미보유)
        const lbA = a.isDeactivated ? -1 : (a.lb || 0);
        const lbB = b.isDeactivated ? -1 : (b.lb || 0);
        if (lbA !== lbB) return lbB - lbA;

        const dateA = a.releasedAt || '1970-01-01';
        const dateB = b.releasedAt || '1970-01-01';
        if (dateA !== dateB) {
            return dateA.localeCompare(dateB);
        }

        const tOrder = { 'vocal': 1, 'dance': 2, 'visual': 3, 'assist': 4 };
        const tA = tOrder[(a.type || '').toLowerCase()] || 99;
        const tB = tOrder[(b.type || '').toLowerCase()] || 99;
        if (tA !== tB) return tA - tB;

        const pOrder = { 'sense': 1, 'logic': 2, 'anomaly': 3, 'free': 4 };
        const pA = pOrder[(a.plan || '').toLowerCase()] || 99;
        const pB = pOrder[(b.plan || '').toLowerCase()] || 99;
        if (pA !== pB) return pA - pB;

        return a.id.localeCompare(b.id);
    });

    const headerHtml = `
        ${titleLabelHtml}
        ${isOverall ? `
        <div style="display: flex; align-items: center; gap: 8px; margin-right: 4px;">
            <div class="possession-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; border-radius: 50%; transition: none !important;">
                <svg class="possession-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </div>
        ` : `
        <div style="display: flex; align-items: center; gap: 8px; margin-right: 4px;">
            <div style="display: flex; align-items: center; gap: 4px;">
                ${rankImgHtml}
                <span class="possession-section-title-rate" style="font-weight: 800; color: ${themeColor};">${rate}%</span>
                <span class="possession-section-title-count" style="font-weight: 800; color: #333;">(${sStats.owned}/${sStats.total})</span>
            </div>
            <div class="possession-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; border-radius: 50%; transition: none !important;">
                <svg class="possession-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </div>
        `}
    `;

    const overallValHtml = `
        <div class="possession-overall-val" style="color: ${themeColor}; font-size: 1.15rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 800; margin-top: 4px; margin-bottom: 12px;">
            ${rankImgHtml}
            <span>${rate}% (${sStats.owned}/${sStats.total})</span>
        </div>
    `;

    const overallBarHtml = `
        <div class="possession-overall-bar-container" style="width: 100%; height: ${isOverall ? '36px' : '10px'}; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: ${isOverall ? '6px' : '0'}; overflow: hidden; box-sizing: border-box; margin-bottom: 14px; position: relative; ${isOverall ? 'cursor: pointer;' : ''}">
            ${isOverall ? `
            <!-- 평소에 보이는 그라데이션/단색 바 -->
            <div class="overall-bar-gradient" style="width: ${rate}%; height: 100%; background: ${barColor};"></div>
            <!-- 호버/클릭 시 보이는 분류별 분할 바 -->
            <div class="overall-bar-chars" style="width: ${rate}%; height: 100%;">
                ${sourceSegmentsHtml}
            </div>
            ` : `
            <div style="width: ${rate}%; height: 100%; background: ${barColor};"></div>
            `}
        </div>
    `;

    const chartHtml = `
        <div style="display: flex; flex-direction: column; gap: 5px; background: #ffffff; padding: 14px 12px 6px; border-radius: 8px; border: 1px solid #f0f0f0;">
            <div class="possession-chart-area-wrapper" style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
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
    `;

    // Group cards by quarter for Waffle Chart & Section Grouping (latest quarter first)
    const isYearOnly = ['limited_f', 'limited_u', 'dist'].includes(srcKey);
    const quarterMap = {};
    allCards.forEach(c => {
        const qKey = isYearOnly ? getCardYearKey(c.releasedAt) : getCardQuarterKey(c.releasedAt);
        if (!quarterMap[qKey]) quarterMap[qKey] = [];
        quarterMap[qKey].push(c);
    });

    const getLocalizedCardName = (card) => {
        if (!card) return '';
        const currentLang = state.currentLang || 'ko';
        if (currentLang === 'en' && card.name_en) return card.name_en;
        if (currentLang !== 'ko' && card.name_ja) return card.name_ja;
        return card.name || card.name_ko || card.name_ja || card.id || '';
    };

    let quarterSectionsHtml = '';
    const sortedQKeys = Object.keys(quarterMap).sort((a, b) => {
        const getSortVal = (key) => {
            if (key === '기타') return 9999;
            const clean = key.replace("'", "").trim();
            const parts = clean.split(' ');
            const year = parseInt(parts[0], 10) || 0;
            const sub = parts[1] || 'H99';
            const subVal = sub === 'H1' ? 1 : sub === 'H2' ? 2 : 9;
            return year * 10 + subVal;
        };
        return getSortVal(a) - getSortVal(b);
    });

    let sectionMaxSpanRows = 2;
    let sectionMaxMobileSpanRows = 2;
    sortedQKeys.forEach(qKey => {
        const qCards = quarterMap[qKey];
        const waffleColsCount = Math.min(4, qCards.length);
        const waffleColsDesktop = Math.min(5, qCards.length);
        const waffleRowsCount = Math.ceil(qCards.length / waffleColsCount);
        const waffleRowsCountDesktop = Math.ceil(qCards.length / waffleColsDesktop);
        const maxRowsNeeded = Math.max(waffleRowsCount, waffleRowsCountDesktop);
        const sRows = maxRowsNeeded <= 2 ? 2 : maxRowsNeeded <= 4 ? 3 : maxRowsNeeded <= 6 ? 4 : maxRowsNeeded <= 9 ? 5 : maxRowsNeeded <= 11 ? 6 : Math.ceil(maxRowsNeeded / 2) + 1;
        const mRows = waffleRowsCount <= 2 ? 2 : waffleRowsCount <= 4 ? 3 : waffleRowsCount <= 5 ? 4 : waffleRowsCount <= 7 ? 5 : waffleRowsCount <= 9 ? 6 : waffleRowsCount <= 11 ? 7 : Math.ceil(waffleRowsCount / 2) + 1;
        if (sRows > sectionMaxSpanRows) {
            sectionMaxSpanRows = sRows;
        }
        if (mRows > sectionMaxMobileSpanRows) {
            sectionMaxMobileSpanRows = mRows;
        }
    });
    const sectionMaxHeightCalc = `${sectionMaxSpanRows * 55 + (sectionMaxSpanRows - 1) * 5}px`;
    const mobileSectionMaxHeightCalc = `${sectionMaxMobileSpanRows * 30 + (sectionMaxMobileSpanRows - 1) * 2}px`;

    sortedQKeys.forEach(qKey => {
        const qCards = quarterMap[qKey];
        let waffleCellsHtml = '';
        let qCardImgsHtml = '';

        const ownedQCount = qCards.filter(x => !x.isDeactivated).length;
        const waffleColsCount = Math.min(4, qCards.length);
        const waffleColsDesktop = Math.min(5, qCards.length);
        const waffleRowsCount = Math.ceil(qCards.length / waffleColsCount);
        const waffleRowsCountDesktop = Math.ceil(qCards.length / waffleColsDesktop);
        const maxRowsNeeded = Math.max(waffleRowsCount, waffleRowsCountDesktop);

        // Desktop waffle content height: padding(16px) + title(~20px) + grid(rows*24 + gaps*3) + grid-padding(4px)
        const waffleContentHeight = 40 + maxRowsNeeded * 24 + (maxRowsNeeded - 1) * 3;
        // Mobile waffle content height: padding(~16px) + title(~14px) + grid(rows*16 + gaps*2)
        const mobileWaffleContentHeight = 30 + waffleRowsCount * 16 + (waffleRowsCount - 1) * 2;
        // PC: 1-2 cell rows = 2, 3-4 = 3, 5-6 = 4, 7-9 = 5, 10-11 = 6
        const spanRows = maxRowsNeeded <= 2 ? 2 : maxRowsNeeded <= 4 ? 3 : maxRowsNeeded <= 6 ? 4 : maxRowsNeeded <= 9 ? 5 : maxRowsNeeded <= 11 ? 6 : Math.ceil(maxRowsNeeded / 2) + 1;
        // Mobile: 1-2 cell rows = 2, 3-4 = 3, 5 = 4, 6-7 = 5, 8-9 = 6, 10-11 = 7
        const mobileSpanRows = waffleRowsCount <= 2 ? 2 : waffleRowsCount <= 4 ? 3 : waffleRowsCount <= 5 ? 4 : waffleRowsCount <= 7 ? 5 : waffleRowsCount <= 9 ? 6 : waffleRowsCount <= 11 ? 7 : Math.ceil(waffleRowsCount / 2) + 1;

        const boxMinHeightCalc = `${spanRows * 55 + (spanRows - 1) * 5}px`;
        const mobileBoxMinHeightCalc = `${mobileSpanRows * 30 + (mobileSpanRows - 1) * 2}px`;
        const waffleMarginStyle = 'margin: auto;';

        // Limit break progress score for Waffle Box background fill
        // Unowned (isDeactivated) or 0-LB = 0 points, 1-LB = 1 pt, 2-LB = 2 pts, 3-LB = 3 pts, 4-LB = 4 pts
        const maxScore = qCards.length * 4;
        let currentScore = 0;
        qCards.forEach(c => {
            if (!c.isDeactivated) {
                const lb = c.lb || 0;
                currentScore += lb;
            }
        });
        const progressPct = maxScore > 0 ? ((currentScore / maxScore) * 100).toFixed(1) : '0';
        const fillRgba = hexToRgba(themeColor, 0.18);
        const boxBgStyle = parseFloat(progressPct) > 0
            ? `background: linear-gradient(to top, ${fillRgba} 0%, ${fillRgba} ${progressPct}%, #ffffff ${progressPct}%, #ffffff 100%);`
            : 'background: #ffffff;';
        const isFullScore = maxScore > 0 && currentScore >= maxScore;
        const boxBorderStyle = isFullScore
            ? `border: 1.5px solid ${themeColor};`
            : 'border: 1px solid #cbd5e1;';

        if (waffleQuarterState[qKey] === undefined) waffleQuarterState[qKey] = true;
        const isCollapsed = !!waffleQuarterState[qKey];
        const cardDisplayStyle = isCollapsed ? 'display: none !important;' : '';
        const pcHeight = isCollapsed ? sectionMaxHeightCalc : boxMinHeightCalc;
        const mobileHeight = isCollapsed ? mobileSectionMaxHeightCalc : mobileBoxMinHeightCalc;
        const containerGridStyle = isCollapsed
            ? `grid-column: span 1; grid-row: span 1;`
            : `grid-column: 1; grid-row: span ${spanRows};`;
        const chevronTransform = isCollapsed ? 'transform: rotate(-90deg);' : 'transform: rotate(0deg);';
        const blockClass = isCollapsed ? 'possession-quarter-block collapsed' : 'possession-quarter-block';

        qCards.forEach(c => {
            const imgSrc = c.image || `images/support/thumb/${c.id}.webp`;
            const lb = c.isDeactivated ? -1 : (c.lb || 0);
            const imgStyle = c.isDeactivated ? 'filter: grayscale(100%) brightness(0.8);' : '';

            // Waffle cell (Flat solid attribute color 100% opacity with white LB numbers 1~4)
            const cardType = (c.type || 'vocal').toLowerCase();
            const attrColor = TYPE_COLORS[cardType] || '#ff2a6d';
            const darkAttrColor = darkenColor(attrColor, 0.45);
            const cellBgStyle = c.isDeactivated
                ? `background: ${darkAttrColor}; border: none; opacity: 0.35;`
                : `background: ${attrColor}; border: none; opacity: 1.0;`;
            const cellRadius = (c.rarity === 'SR') ? '14px 14px 4px 14px' : '4px';
            const cardLocalizedName = getLocalizedCardName(c);
            let cellTextHtml = '';
            if (!c.isDeactivated) {
                if (lb >= 4) {
                    cellTextHtml = `<img src="icons/primastella.webp" class="waffle-cell-primastella" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; object-fit: contain; pointer-events: none; user-select: none; filter: brightness(0) invert(1);">`;
                } else {
                    cellTextHtml = `<span style="position: absolute; right: 3.5px; bottom: 2px; font-size: 0.6rem; font-weight: 900; color: #ffffff; line-height: 1; user-select: none;">${lb}</span>`;
                }
            }

            waffleCellsHtml += `
                <div class="possession-waffle-cell" 
                     data-card-id="${c.id}"
                     title="${cardLocalizedName}"
                     style="position: relative; width: 24px; height: 24px; border-radius: ${cellRadius}; overflow: hidden; ${cellBgStyle} box-sizing: border-box; flex-shrink: 0;">
                    ${cellTextHtml}
                </div>
            `;

            // Full detail card (Hide limit break flowers for unowned cards)
            const flowersHtml = c.isDeactivated ? '' : Array.from({ length: 4 }, (_, idx) => {
                const src = (idx < lb) ? 'icons/flower.webp' : 'icons/flowerback.webp';
                return `<img src="${src}" class="support-card-flower">`;
            }).join('');

            const is4Lb = !c.isDeactivated && lb >= 4;
            const detailCardBorder = is4Lb
                ? `border: 1px solid ${attrColor};`
                : 'border: 1px solid #ddd;';
            const overlayStyle = is4Lb
                ? `background: linear-gradient(to right, ${hexToRgba(attrColor, 0.65)} 0%, ${hexToRgba(attrColor, 0.3)} 10%, ${hexToRgba(attrColor, 0.08)} 20%, ${hexToRgba(attrColor, 0)} 33%, ${hexToRgba(attrColor, 0)} 100%);`
                : '';

            qCardImgsHtml += `
                <div class="possession-detail-card" 
                     data-qkey="${qKey}"
                     data-card-id="${c.id}" 
                     style="position: relative; width: 100%; height: 55px; border-radius: 3px 16px 3px 3px; overflow: hidden; background: ${RARITY_GRADIENTS[c.rarity] || '#f0f0f0'}; ${detailCardBorder} box-sizing: border-box; padding-left: 5px; display: flex; flex-direction: column; ${cardDisplayStyle}">
                    <img src="${imgSrc}" 
                         onerror="this.src='icons/card.png';" 
                         style="width: 100%; height: 100%; object-fit: cover; display: block; ${imgStyle}">
                    <div class="support-card-gradient-overlay" style="${overlayStyle}"></div>
                    <img class="support-type-badge" src="icons/${(c.type || 'vocal').toLowerCase()}.webp">
                    <img class="support-plan-badge" src="icons/${(c.plan || 'free').toLowerCase()}.webp">
                    <div class="support-card-flowers">${flowersHtml}</div>
                </div>
            `;
        });

        // PC Detail card spacers: (1) pcBaseLimit = spanRows * 4 (2) overflow padded to multiples of 5
        const pcBaseLimit = spanRows * 4;
        let pcTargetCount = pcBaseLimit;
        if (qCards.length > pcBaseLimit) {
            const overflow = qCards.length - pcBaseLimit;
            const overflowRem = overflow % 5;
            pcTargetCount = qCards.length + (overflowRem === 0 ? 0 : (5 - overflowRem));
        }
        const pcSpacerCount = pcTargetCount - qCards.length;

        // Mobile Detail card spacers: (1) mobileBaseLimit = mobileSpanRows * 2 (2) overflow padded to multiples of 3
        const mobileBaseLimit = mobileSpanRows * 2;
        let mobileTargetCount = mobileBaseLimit;
        if (qCards.length > mobileBaseLimit) {
            const overflow = qCards.length - mobileBaseLimit;
            const overflowRem = overflow % 3;
            mobileTargetCount = qCards.length + (overflowRem === 0 ? 0 : (3 - overflowRem));
        }
        const mobileSpacerCount = mobileTargetCount - qCards.length;

        if (pcSpacerCount > 0) {
            for (let s = 0; s < pcSpacerCount; s++) {
                qCardImgsHtml += `
                    <div class="possession-detail-card possession-detail-card-spacer possession-detail-card-spacer-pc" 
                         data-qkey="${qKey}"
                         style="position: relative; width: 100%; height: 55px; border-radius: 3px 16px 3px 3px; overflow: hidden; background: transparent; border: 1px dashed rgba(0, 0, 0, 0.08); box-sizing: border-box; visibility: hidden; pointer-events: none; ${cardDisplayStyle}">
                    </div>
                `;
            }
        }

        if (mobileSpacerCount > 0) {
            for (let s = 0; s < mobileSpacerCount; s++) {
                qCardImgsHtml += `
                    <div class="possession-detail-card possession-detail-card-spacer possession-detail-card-spacer-mobile" 
                         data-qkey="${qKey}"
                         style="position: relative; width: 100%; height: 55px; border-radius: 3px 16px 3px 3px; overflow: hidden; background: transparent; border: 1px dashed rgba(0, 0, 0, 0.08); box-sizing: border-box; visibility: hidden; pointer-events: none; ${cardDisplayStyle}">
                    </div>
                `;
            }
        }



        quarterSectionsHtml += `
            <!-- 분기 첫번째 슬롯: 차트 내부 좌상단 분기 제목 + 와플 차트 -->
            <div class="waffle-quarter-container ${blockClass}" 
                 data-qkey="${qKey}" 
                 data-span-rows="${spanRows}"
                 data-mobile-span-rows="${mobileSpanRows}"
                 data-min-height-calc="${boxMinHeightCalc}"
                 data-max-min-height-calc="${sectionMaxHeightCalc}"
                 data-mobile-min-height-calc="${mobileBoxMinHeightCalc}"
                 data-mobile-max-min-height-calc="${mobileSectionMaxHeightCalc}"
                 style="${containerGridStyle} position: relative; width: 100%; border-radius: 3px 16px 3px 3px; ${boxBgStyle} ${boxBorderStyle} box-sizing: border-box; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; padding: 8px 6px; overflow: hidden; cursor: pointer; user-select: none; --pc-height: ${pcHeight}; --mobile-min-height: ${mobileHeight}; --mobile-span-rows: ${mobileSpanRows};">
                <!-- 차트 내부 좌상단 제목 -->
                <div class="waffle-quarter-title" style="font-size: 0.7rem; font-weight: 800; color: #333; margin-bottom: 6px; padding-left: 2px; user-select: none; align-self: flex-start; display: flex; align-items: center; width: 100%; justify-content: space-between;">
                    <div>
                        <span>${qKey}</span>
                        <span style="font-size: 0.65rem; color: ${themeColor}; font-weight: 800; margin-left: 2px;">(${ownedQCount}/${qCards.length})</span>
                    </div>
                    <svg class="waffle-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease; ${chevronTransform} margin-right: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <!-- 와플 셀 그리드 -->
                <div class="possession-waffle-grid" style="display: grid; grid-template-columns: repeat(${waffleColsCount}, 24px); gap: 3px; max-width: 100%; align-self: center; ${waffleMarginStyle} padding: 2px; --waffle-cols: ${waffleColsCount}; --waffle-cols-desktop: ${waffleColsDesktop}; --waffle-cols-mobile: ${waffleColsCount};">
                    ${waffleCellsHtml}
                </div>
            </div>

            <!-- 뒤이어 유동적으로 빈 슬롯을 채우는 카드 이미지들 -->
            ${qCardImgsHtml}
        `;
    });

    const detailContainerHtml = `
        <div class="possession-detail-container" style="display: none; margin-top: 12px;">
            <div class="possession-detail-scroll-wrapper" style="box-sizing: border-box; display: flex; flex-direction: column;">
                <div class="possession-unified-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; width: 100%; padding: 0; box-sizing: border-box;">
                    ${quarterSectionsHtml || `<div style="font-size: 0.65rem; color: #bbb; text-align: center; user-select: none; grid-column: 1 / -1;">-</div>`}
                </div>
            </div>
        </div>
    `;

    return {
        headerHtml,
        overallValHtml,
        overallBarHtml,
        chartHtml,
        detailContainerHtml
    };
}

function buildSectionInnerHtml(label, sStats, themeColor, isOverall = false, sourceSegmentsHtml = '') {
    const parts = buildSectionInnerParts(label, sStats, themeColor, isOverall, sourceSegmentsHtml);
    return `
        <div class="possession-category-item" style="display: flex; flex-direction: column;">
            <div class="possession-category-header" style="display: flex; justify-content: space-between; align-items: center; user-select: none; cursor: pointer;">
                ${parts.headerHtml}
            </div>
            ${isOverall ? parts.overallValHtml : ''}
            ${parts.overallBarHtml}
            ${parts.chartHtml}
            ${parts.detailContainerHtml}
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

    // Sort globally by rarity first (SSR -> SR) then releasedAt descending (newest first) across all merged rarities
    for (let i = 0; i <= 4; i++) {
        mergedRarityStats.cardsByLb[i].sort((a, b) => {
            const rOrder = { 'SSR': 1, 'SR': 2, 'R': 3 };
            const rA = rOrder[a.rarity] || 99;
            const rB = rOrder[b.rarity] || 99;
            if (rA !== rB) return rA - rB;

            const tOrder = { 'vocal': 1, 'dance': 2, 'visual': 3, 'assist': 4 };
            const tA = tOrder[(a.type || '').toLowerCase()] || 99;
            const tB = tOrder[(b.type || '').toLowerCase()] || 99;
            if (tA !== tB) return tA - tB;

            const pOrder = { 'sense': 1, 'logic': 2, 'anomaly': 3, 'free': 4 };
            const pA = pOrder[(a.plan || '').toLowerCase()] || 99;
            const pB = pOrder[(b.plan || '').toLowerCase()] || 99;
            if (pA !== pB) return pA - pB;

            const dateA = a.releasedAt || '1970-01-01';
            const dateB = b.releasedAt || '1970-01-01';
            if (dateA !== dateB) {
                return dateB.localeCompare(dateA);
            }
            return b.id.localeCompare(a.id);
        });
    }
    mergedRarityStats.unownedCards.sort((a, b) => {
        const rOrder = { 'SSR': 1, 'SR': 2, 'R': 3 };
        const rA = rOrder[a.rarity] || 99;
        const rB = rOrder[b.rarity] || 99;
        if (rA !== rB) return rA - rB;

        const tOrder = { 'vocal': 1, 'dance': 2, 'visual': 3, 'assist': 4 };
        const tA = tOrder[(a.type || '').toLowerCase()] || 99;
        const tB = tOrder[(b.type || '').toLowerCase()] || 99;
        if (tA !== tB) return tA - tB;

        const pOrder = { 'sense': 1, 'logic': 2, 'anomaly': 3, 'free': 4 };
        const pA = pOrder[(a.plan || '').toLowerCase()] || 99;
        const pB = pOrder[(b.plan || '').toLowerCase()] || 99;
        if (pA !== pB) return pA - pB;

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

    let sourceSegmentsHtml = '';
    if (ownedAll > 0) {
        const ownedUnit = isJa ? '枚' : isEn ? ' owned' : '장 소지';
        SOURCE_ORDER.forEach(src => {
            const sStats = stats.bySource[src];
            if (!sStats || sStats.owned === 0) return;
            const label = getSourceLabel(src);
            const pct = (sStats.owned / ownedAll) * 100;
            const color = SOURCE_COLORS[src] || '#cbd5e1';
            sourceSegmentsHtml += `<div style="width: ${pct}%; height: 100%; background-color: ${color};" title="${label}: ${sStats.owned}${ownedUnit} (${pct.toFixed(1)}%)"></div>`;
        });
    }

    let raritySectionsHtml = '';
    if (activeRarities.length > 0) {
        const innerHtml = buildSectionInnerHtml(rarityLabelText, mergedRarityStats, themeColor, true, sourceSegmentsHtml);
        raritySectionsHtml = `
            <div class="possession-section-card" data-is-overall="true" style="margin-bottom: 15px; background: ${cardBg}; border: ${cardBorder}; border-radius: 10px; padding: 16px;">
                ${innerHtml}
            </div>
        `;
    }

    // Source sections
    let sourceSectionsHtml = '';
    const sourceCardsHtmlList = [];

    if (ownedAll >= 0) {
        SOURCE_ORDER.forEach(src => {
            const sStats = stats.bySource[src];
            if (!sStats) return;
            const label = getSourceLabel(src);
            const customColor = SOURCE_COLORS[src] || themeColor;

            const rate = formatRate(sStats.owned, sStats.total);
            const parts = buildSectionInnerParts(label, sStats, customColor, false, '', src);

            sourceCardsHtmlList.push(`
                <div class="possession-source-card" data-source="${src}">
                    <div class="possession-source-circle-view">
                        <div style="position: relative; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center;">
                            <svg width="84" height="84" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" stroke-width="4.0"></circle>
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="${customColor}" stroke-width="4.0"
                                        stroke-dasharray="${rate} ${100 - rate}" stroke-dashoffset="25" stroke-linecap="butt"></circle>
                            </svg>
                            <div class="possession-source-circle-label" style="position: absolute; font-size: 0.88rem; font-weight: 800; color: #333; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; box-sizing: border-box;">${label}</div>
                        </div>
                        <div class="possession-source-circle-rate" style="font-size: 0.74rem; font-weight: 800; color: #555; text-align: center; white-space: nowrap;">
                            <span style="color: ${customColor};">${rate}%</span> <span style="font-size: 0.68rem; color: #777; font-weight: bold; margin-left: 2px;">(${sStats.owned}/${sStats.total})</span>
                        </div>
                    </div>
                    <div class="possession-source-main-view" style="display: none; width: 100%;">
                        <div class="possession-category-item" style="display: flex; flex-direction: column;">
                            <div class="possession-category-header" style="display: flex; justify-content: space-between; align-items: center; user-select: none; cursor: pointer;">
                                ${parts.headerHtml}
                            </div>
                            ${parts.overallBarHtml}
                        </div>
                    </div>
                    <div class="possession-source-chart-container" style="display: none; width: 100%;">
                        ${parts.chartHtml}
                    </div>
                    ${parts.detailContainerHtml}
                </div>
            `);
        });

        if (sourceCardsHtmlList.length > 0) {
            sourceSectionsHtml = `
                <div class="possession-stats-source-card" style="margin-bottom: 15px;">
                    ${sourceCardsHtmlList.join('')}
                </div>
            `;
        }
    }

    // Type sections
    let typeSectionsHtml = '';
    const typeCardsHtmlList = [];
    const typeColors = {
        vocal: '#ff4d8d',
        dance: '#46a4f3',
        visual: '#ffb300',
        assist: '#a3e635'
    };

    if (ownedAll >= 0) {
        TYPE_ORDER.forEach(type => {
            const tStats = stats.byType[type];
            if (!tStats) return;
            const label = getTypeLabel(type);
            const customColor = typeColors[type] || themeColor;

            const rate = formatRate(tStats.owned, tStats.total);
            const parts = buildSectionInnerParts(label, tStats, customColor, false);

            typeCardsHtmlList.push(`
                <div class="possession-type-card" data-type="${type}">
                    <div class="possession-type-basic-view" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                        <div class="possession-type-title-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: 800; color: #333;">
                            <span style="display: flex; align-items: center; gap: 6px;">
                                <img src="icons/${type.toLowerCase()}.webp" onerror="this.src='icons/card.png';" style="width: 16px; height: 16px; object-fit: contain; flex-shrink: 0;">
                                <span>${label}</span>
                            </span>
                            <span class="possession-type-rate-col" style="font-size: 0.74rem;">
                                <span style="color: ${customColor};">${rate}%</span>
                                <span style="color: #777; font-weight: bold; margin-left: 2px;">(${tStats.owned}/${tStats.total})</span>
                            </span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 0; overflow: hidden; position: relative;">
                            <div style="width: ${rate}%; height: 100%; background: ${customColor}; border-radius: 0;"></div>
                        </div>
                    </div>
                    <div class="possession-type-main-view" style="display: none; width: 100%;">
                        <div class="possession-category-item" style="display: flex; flex-direction: column;">
                            <div class="possession-category-header" style="display: flex; justify-content: space-between; align-items: center; user-select: none; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <img src="icons/${type.toLowerCase()}.webp" onerror="this.src='icons/card.png';" style="width: 16px; height: 16px; object-fit: contain; flex-shrink: 0;">
                                    <span class="possession-section-title-label" style="font-weight: 800; color: #333;">${label}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; margin-right: 4px;">
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <span class="possession-section-title-rate" style="font-weight: 800; color: ${customColor};">${rate}%</span>
                                        <span class="possession-section-title-count" style="font-weight: 800; color: #333;">(${tStats.owned}/${tStats.total})</span>
                                    </div>
                                    <div class="possession-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; border-radius: 50%; transition: none !important;">
                                        <svg class="possession-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important; transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </div>
                            ${parts.overallBarHtml}
                        </div>
                    </div>
                    <div class="possession-type-chart-container" style="display: none; width: 100%;">
                        ${parts.chartHtml}
                    </div>
                    ${parts.detailContainerHtml}
                </div>
            `);
        });
    }

    if (typeCardsHtmlList.length > 0) {
        typeSectionsHtml = `
            <div class="possession-stats-type-card" style="margin-bottom: 15px;">
                ${typeCardsHtmlList.join('')}
            </div>
        `;
    }

    // Plan sections (2D Heatmap Grid Layout)
    let planSectionsHtml = '';
    const planColors = {
        sense: '#ff5a79',
        logic: '#20b2aa',
        anomaly: '#ff8225',
        free: '#8fa3ad'
    };
    const planRgb = {
        sense: '255, 90, 121',
        logic: '32, 178, 170',
        anomaly: '255, 130, 37',
        free: '143, 163, 173'
    };
    const ownedLabel = isJa ? '凸' : isEn ? 'LB' : '돌';

    if (ownedAll >= 0) {
        const rows = ['4', '3', '2', '1', '0'];

        let rowLabelsHtml = '';
        rows.forEach(row => {
            const isUnowned = row === 'unowned';
            const rowLabel = isUnowned
                ? (isJa ? '未所持' : isEn ? 'Unowned' : '미소지')
                : `${row}${ownedLabel}`;
            rowLabelsHtml += `
                <div class="possession-heatmap-row-label" style="height: 44px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.72rem; color: #475569; background: #f8fafc; border-radius: 4px 0 0 4px; text-align: center; box-sizing: border-box; user-select: none;">
                    ${rowLabel}
                </div>
            `;
        });

        let columnsHtml = '';
        PLAN_ORDER.forEach(plan => {
            const label = getPlanLabel(plan);
            const tStats = stats.byPlan[plan];

            let cellsHtml = '';
            rows.forEach(row => {
                const isUnowned = row === 'unowned';
                let count = 0;
                if (tStats) {
                    count = isUnowned ? (tStats.unownedCards?.length || 0) : (tStats.lb[row] || 0);
                }

                let pctText = '0%';
                if (tStats && tStats.total > 0) {
                    const rawPct = (count / tStats.total) * 100;
                    if (count > 0 && rawPct < 1) {
                        pctText = `${rawPct.toFixed(1)}%`;
                    } else {
                        pctText = `${Math.round(rawPct)}%`;
                    }
                }

                let bgStyle = 'background-color: #f1f5f9; color: #cbd5e1; font-weight: 500;';
                if (count > 0 && tStats && tStats.total > 0) {
                    const alpha = 0.15 + (count / tStats.total) * 0.75;
                    const textColor = alpha > 0.55 ? '#ffffff' : '#0f172a';
                    bgStyle = `background-color: rgba(${planRgb[plan]}, ${alpha}); color: ${textColor}; font-weight: 800;`;
                }

                cellsHtml += `
                    <div class="possession-heatmap-cell" style="height: 44px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; border-radius: 0 !important; pointer-events: none; box-sizing: border-box; ${bgStyle}">
                        ${pctText}
                    </div>
                `;
            });

            let planPossessionRate = 0;
            if (tStats && tStats.total > 0) {
                planPossessionRate = Math.round((tStats.owned / tStats.total) * 100);
            }

            columnsHtml += `
                <div class="possession-heatmap-col" data-plan="${plan}" style="flex: 1; display: flex; flex-direction: column; gap: 2px; cursor: pointer; border-radius: 6px; transition: all 0.15s ease; box-sizing: border-box;">
                    <!-- 열 헤더 (상단) -->
                    <div class="possession-heatmap-col-header" style="height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; pointer-events: none; box-sizing: border-box; user-select: none; border-radius: 0;">
                        <div style="display: flex; align-items: center; gap: 4px; line-height: 1;">
                            <img src="icons/${plan.toLowerCase()}.webp" onerror="this.src='icons/card.png';" style="width: 18px; height: 18px; object-fit: contain;">
                            <span class="possession-heatmap-header-txt" style="font-size: 0.72rem; font-weight: 800; color: #475569; white-space: nowrap;">
                                ${planPossessionRate}% <span class="possession-heatmap-header-subtxt" style="font-size: 0.6rem; color: #94a3b8; font-weight: 600;">(${tStats.owned}/${tStats.total})</span>
                            </span>
                        </div>
                        <div style="width: 50%; height: 6px; background: #e2e8f0; border-radius: 0; overflow: hidden;">
                            <div style="width: ${planPossessionRate}%; height: 100%; background-color: ${planColors[plan] || '#cbd5e1'};"></div>
                        </div>
                    </div>
                    <!-- 셀들 -->
                    ${cellsHtml}
                </div>
            `;
        });

        const heatmapGridHtml = `
                <div class="possession-heatmap-container" style="display: flex; gap: 5px; width: 100%; box-sizing: border-box;">
                    <!-- 왼쪽 행 라벨 열 -->
                    <div class="possession-heatmap-row-labels" style="display: flex; flex-direction: column; gap: 2px; width: 52px; flex-shrink: 0; padding-top: 58px; box-sizing: border-box;">
                        ${rowLabelsHtml}
                    </div>
                    <!-- 플랜별 열들 -->
                    ${columnsHtml}
                </div>
        `;

        // Details drawer panels
        let planDetailsHtml = '';
        PLAN_ORDER.forEach(plan => {
            const tStats = stats.byPlan[plan];
            if (!tStats) return;
            const label = getPlanLabel(plan);
            const customColor = planColors[plan] || themeColor;
            const rate = formatRate(tStats.owned, tStats.total);
            const parts = buildSectionInnerParts(label, tStats, customColor, false);

            planDetailsHtml += `
                <div class="possession-plan-detail-wrapper" data-plan="${plan}" style="display: none; margin-top: 10px; width: 100%;">
                    <div class="possession-category-item" style="display: flex; flex-direction: column;">
                        <div class="possession-category-header" style="display: flex; justify-content: space-between; align-items: center; user-select: none; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 6px; pointer-events: none;">
                                <img src="icons/${plan.toLowerCase()}.webp" onerror="this.src='icons/card.png';" style="width: 16px; height: 16px; object-fit: contain;">
                                <span class="possession-section-title-label" style="font-weight: 800; color: #333;">${label}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; pointer-events: none;">
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <span class="possession-section-title-rate" style="font-weight: 800; color: ${customColor};">${rate}%</span>
                                    <span class="possession-section-title-count" style="font-weight: 800; color: #333;">(${tStats.owned}/${tStats.total})</span>
                                </div>
                                <div class="possession-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%;">
                                    <svg class="possession-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transform: rotate(0deg); transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                        </div>
                        ${parts.overallBarHtml}
                        ${parts.detailContainerHtml}
                    </div>
                </div>
            `;
        });

        planSectionsHtml = `
            <div class="possession-stats-plan-card" style="margin-bottom: 15px; display: flex; flex-direction: column; width: 100%; background: rgba(255, 255, 255, 0.45); border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 12px; padding: 14px 12px 14px 12px; box-sizing: border-box;">
                <div class="possession-plan-heatmap-card" style="display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
                    ${heatmapGridHtml}
                    ${planDetailsHtml}
                </div>
            </div>
        `;
    }

    const totalRateLabel = isJa ? '全体所持率' : isEn ? 'Overall Rate' : '전체 소지율';
    const rarityLabel = totalRateLabel;
    const sourceLabel = isJa ? '分類別' : isEn ? 'By Source' : '분류별';
    const typeLabel = isJa ? 'パラメーター別' : isEn ? 'By Parameter' : '파라미터별';
    const planLabel = isJa ? 'プラン別' : isEn ? 'By Plan' : '플랜별';

    return {
        totalRate, totalAll, ownedAll, totalRateLabel,
        html: `
            <style>
                .overall-bar-gradient {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    z-index: 2;
                    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .overall-bar-chars {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    z-index: 1;
                    opacity: 0;
                    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                }
                .possession-section-card.show-detail .overall-bar-gradient {
                    opacity: 0;
                }
                .possession-section-card.show-detail .overall-bar-chars {
                    opacity: 1;
                }
                @media (hover: hover) {
                    .possession-overall-bar-container:hover .overall-bar-gradient {
                        opacity: 0;
                    }
                    .possession-overall-bar-container:hover .overall-bar-chars {
                        opacity: 1;
                    }
                    .possession-overall-bar-container:hover {
                        border-color: rgba(0, 0, 0, 0.15) !important;
                    }
                }
                .possession-overall-bar-container {
                    transition: border-color 0.22s cubic-bezier(0.4, 0, 0.2, 1), 
                                box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .possession-section-card.show-detail .possession-overall-bar-container {
                    border-color: ${themeColor} !important;
                    box-shadow: 0 0 0 2.5px ${hexToRgba(themeColor, 0.25)} !important;
                }

                .possession-stats-source-card {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    background: transparent;
                    border: none;
                    padding: 0;
                }
                .possession-source-card {
                    grid-column: span 1;
                    background: rgba(255, 255, 255, 0.45);
                    border: 1px solid rgba(0, 0, 0, 0.06) !important;
                    border-radius: 12px;
                    padding: 12px 10px;
                    margin-bottom: 0 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    cursor: pointer;
                    user-select: none;
                    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                }
                .possession-source-card.expanded {
                    grid-column: span 2 !important;
                    cursor: default;
                }
                
                /* 기본 상태 제어 */
                .possession-source-card .possession-source-chart-container,
                .possession-source-card .possession-source-main-view,
                .possession-source-card .possession-detail-container {
                    display: none;
                }

                /* expanded 모드일 때 (공통) */
                .possession-source-card.expanded .possession-source-main-view,
                .possession-source-card.expanded .possession-source-chart-container,
                .possession-source-card.expanded .possession-detail-container {
                    display: block !important;
                }
                .possession-source-card.expanded .possession-source-circle-view {
                    display: none !important;
                }

                /* PC 환경(width > 768px)에서의 제어 */
                @media (min-width: 769px) {
                    /* PC이고 expanded가 아닐 때: 도넛 뷰 + 차트(세로 막대 그래프)가 둘 다 노출되게 함 */
                    .possession-source-card:not(.expanded) .possession-source-circle-view {
                        display: flex !important;
                    }
                    .possession-source-card:not(.expanded) .possession-source-chart-container {
                        display: block !important;
                        margin-top: 4px;
                    }
                }

                /* 모바일 환경(width <= 768px)에서의 제어 */
                @media (max-width: 768px) {
                    /* 모바일이고 expanded가 아닐 때: 도넛 뷰만 노출 */
                    .possession-source-card:not(.expanded) .possession-source-circle-view {
                        display: flex !important;
                    }
                    .possession-source-card:not(.expanded) .possession-source-chart-container {
                        display: none !important;
                    }
                }

                .possession-source-circle-view {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 0;
                    background: transparent;
                    border: none;
                    pointer-events: none;
                }
                
                /* 분류별 카드 내부의 세로 차트 테두리와 배경 제거하여 하나의 카드로 묶기 */
                .possession-source-card .possession-source-chart-container > div {
                    background: transparent !important;
                    border: none !important;
                    padding: 8px 0 0 0 !important;
                }

                @media (hover: hover) {
                    .possession-source-card:not(.expanded):hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                        border-color: rgba(0, 0, 0, 0.12) !important;
                        transform: translateY(-1px);
                    }
                }

                /* 파라미터별 카드 관련 CSS */
                .possession-stats-type-card {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    background: transparent;
                    border: none;
                    padding: 0;
                }
                .possession-type-card {
                    grid-column: span 1;
                    background: rgba(255, 255, 255, 0.45);
                    border: 1px solid rgba(0, 0, 0, 0.06) !important;
                    border-radius: 12px;
                    padding: 12px 10px;
                    margin-bottom: 0 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    cursor: pointer;
                    user-select: none;
                    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                }
                .possession-type-card.expanded {
                    grid-column: span 2 !important;
                    cursor: default;
                }
                
                /* 기본 상태 제어 */
                .possession-type-card .possession-type-chart-container,
                .possession-type-card .possession-type-main-view,
                .possession-type-card .possession-detail-container {
                    display: none;
                }

                /* expanded 모드일 때 (공통) */
                .possession-type-card.expanded .possession-type-main-view,
                .possession-type-card.expanded .possession-type-chart-container,
                .possession-type-card.expanded .possession-detail-container {
                    display: block !important;
                }
                .possession-type-card.expanded .possession-type-basic-view {
                    display: none !important;
                }

                /* PC 환경(width > 768px)에서의 제어 */
                @media (min-width: 769px) {
                    /* PC이고 expanded가 아닐 때: 베이직 뷰 + 차트(세로 막대 그래프)가 둘 다 노출되게 함 */
                    .possession-type-card:not(.expanded) .possession-type-basic-view {
                        display: flex !important;
                    }
                    .possession-type-card:not(.expanded) .possession-type-chart-container {
                        display: block !important;
                        margin-top: 4px;
                    }
                }

                /* 모바일 환경(width <= 768px)에서의 제어 */
                @media (max-width: 768px) {
                    /* 모바일이고 expanded가 아닐 때: 베이직 뷰만 노출 */
                    .possession-type-card:not(.expanded) .possession-type-basic-view {
                        display: flex !important;
                    }
                    .possession-type-card:not(.expanded) .possession-type-chart-container {
                        display: none !important;
                    }
                }

                /* 파라미터별 카드 내부의 세로 차트 테두리와 배경 제거하여 하나의 카드로 묶기 */
                .possession-type-card .possession-type-chart-container > div {
                    background: transparent !important;
                    border: none !important;
                    padding: 8px 0 0 0 !important;
                }

                @media (hover: hover) {
                    .possession-type-card:not(.expanded):hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                        border-color: rgba(0, 0, 0, 0.12) !important;
                        transform: translateY(-1px);
                    }
                }

                /* 플랜별 히트맵 관련 CSS */
                .possession-plan-heatmap-card {
                    margin-bottom: 0 !important;
                }
                .possession-plan-detail-wrapper .possession-category-header {
                    margin: 0 0 6px 0 !important;
                }
                .possession-heatmap-cell {
                    user-select: none;
                }
                
                /* 열 기준 클릭 활성화 효과 */
                .possession-heatmap-container.col-active-mode .possession-heatmap-col {
                    transition: opacity 0.15s ease;
                }
                .possession-heatmap-container.col-active-mode .possession-heatmap-col:not(.active-highlight) {
                    opacity: 0.45;
                }
                .possession-heatmap-container.col-active-mode .possession-heatmap-col.active-highlight {
                    opacity: 1;
                    filter: brightness(1.03);
                }
                .possession-heatmap-container.col-active-mode .possession-heatmap-col.active-highlight .possession-heatmap-col-header {
                    background-color: rgba(0, 0, 0, 0.04) !important;
                    border-radius: 4px 4px 0 0;
                }
                @media (hover: hover) {
                    .possession-heatmap-col:hover .possession-heatmap-col-header {
                        background-color: rgba(0, 0, 0, 0.04) !important;
                        border-radius: 4px 4px 0 0;
                    }
                }

                @media (max-width: 768px) {
                    body:not(.is-capturing) .possession-stats-source-card {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 8px !important;
                    }
                    body:not(.is-capturing) .possession-stats-type-card {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 8px !important;
                    }
                    body:not(.is-capturing) .possession-stats-plan-card {
                        padding: 8px 8px 8px 8px !important;
                        margin-bottom: 4px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-container {
                        gap: 4px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-row-labels {
                        gap: 2px !important;
                        padding-top: 30px !important;
                        width: 42px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-col {
                        gap: 2px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-row-label,
                    body:not(.is-capturing) .possession-heatmap-cell {
                        height: 24px !important;
                        font-size: 0.4rem !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-col-header {
                        height: 28px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-col-header img {
                        width: 10px !important;
                        height: 10px !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-col-header > div:last-child {
                        width: 50% !important;
                        height: 3px !important;
                    }

                    body:not(.is-capturing) .possession-heatmap-header-txt {
                        font-size: 0.45rem !important;
                    }
                    body:not(.is-capturing) .possession-heatmap-header-subtxt {
                        font-size: 0.35rem !important;
                    }
                }

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
                    padding: 6px 12px;
                    margin: -6px -8px 6px -8px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    transition: background-color 0.15s, border-color 0.15s;
                }
                .possession-type-title-row {
                    padding: 4px 12px;
                }
                .possession-category-header:hover {
                    background: rgba(0, 0, 0, 0.03);
                    border-color: rgba(0, 0, 0, 0.08);
                }
                .possession-chart-area-wrapper {
                    width: 100% !important;
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
                .possession-detail-card > img:first-child {
                    object-position: center calc(50% + 6px);
                }
                .support-type-badge {
                    position: absolute;
                    top: calc(50% - 22px);
                    left: 8px;
                    width: 20px;
                    height: 20px;
                    z-index: 5;
                    pointer-events: none;
                    user-select: none;
                    object-fit: contain;
                    box-sizing: border-box;
                }
                .support-plan-badge {
                    position: absolute;
                    top: calc(50% + 2px);
                    left: 8px;
                    width: 20px;
                    height: 20px;
                    z-index: 5;
                    pointer-events: none;
                    user-select: none;
                    object-fit: contain;
                    box-sizing: border-box;
                }
                .support-card-gradient-overlay {
                    position: absolute;
                    top: 0;
                    left: 5px;
                    bottom: 0;
                    right: -1px;
                    background: linear-gradient(to right, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.3) 10%, rgba(0, 0, 0, 0.08) 20%, rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0) 100%);
                    pointer-events: none;
                    z-index: 2;
                }
                .support-card-flowers {
                    position: absolute;
                    bottom: 3px;
                    right: 4px;
                    display: flex;
                    align-items: center;
                    gap: 1px;
                    z-index: 5;
                    pointer-events: none;
                    user-select: none;
                }
                .support-card-flower {
                    width: 12px;
                    height: 12px;
                    object-fit: contain;
                    display: block;
                }
                @media (min-width: 769px) {
                    .possession-detail-card-spacer-mobile { display: none !important; }
                }
                @media (min-width: 951px) {
                    body:not(.is-capturing) .possession-waffle-grid {
                        grid-template-columns: repeat(var(--waffle-cols-desktop, 5), 24px) !important;
                    }
                }
                @media (max-width: 768px) {
                    body:not(.is-capturing) .possession-detail-card-spacer-pc { display: none !important; }
                    body:not(.is-capturing) .possession-unified-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                        column-gap: 6px !important;
                        row-gap: 2px !important;
                        padding: 6px 1px !important;
                    }
                    body:not(.is-capturing) .possession-detail-card {
                        height: 30px !important;
                        padding-left: 2.5px !important;
                    }
                    body:not(.is-capturing) .support-card-gradient-overlay {
                        left: 2.5px !important;
                    }
                    body:not(.is-capturing) .support-type-badge {
                        width: 10px !important;
                        height: 10px !important;
                        top: 2px !important;
                        bottom: auto !important;
                        left: 4px !important;
                    }
                    body:not(.is-capturing) .support-plan-badge {
                        width: 10px !important;
                        height: 10px !important;
                        bottom: 2px !important;
                        top: auto !important;
                        left: 4px !important;
                    }
                    body:not(.is-capturing) .support-card-flowers {
                        bottom: 2px !important;
                        right: 3px !important;
                        gap: 0.5px !important;
                    }
                    body:not(.is-capturing) .support-card-flower {
                        width: 6px !important;
                        height: 6px !important;
                    }
                    body:not(.is-capturing) .possession-category-header {
                        padding: 4px 6px !important;
                    }
                    body:not(.is-capturing) .possession-category-header .possession-section-title-label {
                        font-size: 0.72rem !important;
                    }
                    body:not(.is-capturing) .possession-category-header .possession-section-title-rate {
                        font-size: 0.72rem !important;
                    }
                    body:not(.is-capturing) .possession-category-header .possession-section-title-count {
                        font-size: 0.6rem !important;
                    }
                    body:not(.is-capturing) .possession-category-header img {
                        width: 13px !important;
                        height: 13px !important;
                    }
                    body:not(.is-capturing) .possession-category-header .possession-chevron-btn {
                        width: 20px !important;
                        height: 20px !important;
                    }
                    body:not(.is-capturing) .possession-category-header .possession-chevron {
                        width: 10px !important;
                        height: 10px !important;
                    }
                    body:not(.is-capturing) .possession-type-title-row {
                        font-size: 0.76rem !important;
                    }
                    body:not(.is-capturing) .possession-type-rate-col {
                        font-size: 0.64rem !important;
                    }
                    body:not(.is-capturing) .possession-source-circle-label {
                        font-size: 0.76rem !important;
                    }
                    body:not(.is-capturing) .possession-source-circle-rate {
                        font-size: 0.64rem !important;
                    }
                    body:not(.is-capturing) .possession-source-circle-rate span {
                        font-size: 0.58rem !important;
                    }
                    body:not(.is-capturing) .possession-plan-detail-wrapper .possession-category-header {
                        margin-bottom: 2px !important;
                    }
                    body:not(.is-capturing) .possession-plan-detail-wrapper .possession-detail-container {
                        margin-top: 2px !important;
                    }
                    body:not(.is-capturing) .possession-waffle-grid {
                        grid-template-columns: repeat(var(--waffle-cols-mobile, 4), 15px) !important;
                        gap: 2px !important;
                        margin: auto !important;
                        align-self: center !important;
                    }
                    body:not(.is-capturing) .possession-waffle-cell {
                        width: 15px !important;
                        height: 15px !important;
                    }
                    body:not(.is-capturing) .possession-waffle-cell > span {
                        font-size: 0.42rem !important;
                        right: 1px !important;
                        bottom: 0.5px !important;
                    }
                    body:not(.is-capturing) .waffle-cell-primastella {
                        width: 9px !important;
                        height: 9px !important;
                    }
                    .waffle-quarter-container {
                        height: var(--pc-height) !important;
                        min-height: var(--pc-height) !important;
                        max-height: var(--pc-height) !important;
                    }
                    @media (max-width: 768px) {
                        body:not(.is-capturing) .waffle-quarter-container {
                            height: var(--mobile-min-height) !important;
                            min-height: var(--mobile-min-height) !important;
                            max-height: var(--mobile-min-height) !important;
                            padding-top: 3px !important;
                        }
                        body:not(.is-capturing) .waffle-quarter-container:not(.collapsed) {
                            grid-row: span var(--mobile-span-rows, 2) !important;
                        }
                    }
                    body:not(.is-capturing) .waffle-quarter-title {
                        font-size: 0.45rem !important;
                        margin-top: -1px !important;
                        margin-bottom: 3px !important;
                    }
                    body:not(.is-capturing) .waffle-quarter-title span:first-child {
                        font-size: 0.45rem !important;
                    }
                    body:not(.is-capturing) .waffle-quarter-title span:last-child {
                        font-size: 0.4rem !important;
                    }
                    body:not(.is-capturing) .waffle-quarter-title .waffle-chevron {
                        width: 7px !important;
                        height: 7px !important;
                    }
                }
            </style>
            <div id="possession-overall-label" style="display: none;"></div>
            ${raritySectionsHtml}
            <div id="possession-source-label" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; margin-top: 4px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                <img src="icons/train.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span>${sourceLabel}</span>
            </div>
            ${sourceSectionsHtml}
            <div id="possession-type-label" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; margin-top: 12px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                <img src="icons/flower.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span>${typeLabel}</span>
            </div>
            ${typeSectionsHtml}
            <div id="possession-plan-label" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; margin-top: 12px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                <img src="icons/free.webp" onerror="this.src='icons/card.png';" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                <span>${planLabel}</span>
            </div>
            ${planSectionsHtml}
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

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `(${yyyy}. ${mm}. ${dd}.)`;

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
                body:not(.is-capturing) .possession-modal-content {
                    width: 100% !important;
                    max-width: 95% !important;
                    min-width: 0 !important;
                    padding: 14px 8px 3px 8px !important;
                    gap: 8px !important;
                    border-radius: 14px !important;
                }

                body:not(.is-capturing) .possession-title-wrap {
                    font-size: 1.05rem !important;
                    gap: 6px !important;
                }
                body:not(.is-capturing) .possession-title-icon {
                    width: 30px !important;
                    height: 30px !important;
                    margin-bottom: -1px !important;
                    margin-right: 6px !important;
                }
                body:not(.is-capturing) .possession-title-date {
                    display: none !important;
                }
                body:not(.is-capturing) #possession-header-line {
                    margin-left: 15px !important;
                    width: calc(100% - 15px) !important;
                }
                body:not(.is-capturing) .possession-title-indicator {
                    height: 16px !important;
                }
                body:not(.is-capturing) #btn-possession-save-image {
                    height: 28px !important;
                    padding: 0 12px !important;
                    font-size: 0.72rem !important;
                    border-radius: 0 6px 6px 0 !important;
                    font-weight: bold !important;
                }
                body:not(.is-capturing) #possession-filter-rarity-area {
                    border-radius: 6px !important;
                }
                body:not(.is-capturing) #possession-filter-rarity-area button {
                    padding: 4px 0 !important;
                }
                body:not(.is-capturing) #possession-filter-rarity-area img {
                    height: 16px !important;
                }
                body:not(.is-capturing) #possession-filter-source-area {
                    border-radius: 6px !important;
                }
                body:not(.is-capturing) #possession-filter-source-area button {
                    padding: 4px 0 !important;
                    font-size: 0.7rem !important;
                    min-width: 36px !important;
                }
                body:not(.is-capturing) #possession-scroll-area {
                    padding-left: 12px !important;
                    padding-right: 12px !important;
                    gap: 4px !important;
                }
                body:not(.is-capturing) .possession-section-card {
                    border-radius: 6px !important;
                    padding: 10px 8px !important;
                }
                body:not(.is-capturing) .possession-overall-rank-icon {
                    height: 38px !important;
                }
                body:not(.is-capturing) #possession-stats-area {
                    gap: 8px !important;
                }
                body:not(.is-capturing) #possession-overall-label {
                    margin-top: 10px !important;
                }
                body:not(.is-capturing) #possession-overall-label,
                body:not(.is-capturing) #possession-source-label {
                    font-size: 0.85rem !important;
                    margin-bottom: -3px !important;
                }
                /* Overall Section (Main) - Mobile */
                body:not(.is-capturing) .possession-section-card[data-is-overall="true"] .possession-section-title-label {
                    font-size: 0.85rem !important;
                }
                body:not(.is-capturing) .possession-section-card[data-is-overall="true"] .possession-section-title-rate {
                    font-size: 0.82rem !important;
                }
                body:not(.is-capturing) .possession-section-card[data-is-overall="true"] .possession-section-title-count {
                    font-size: 0.6rem !important;
                }

                /* Sub Section (Source/Classification) - Mobile */
                body:not(.is-capturing) .possession-section-card:not([data-is-overall="true"]) .possession-section-title-label {
                    font-size: 0.72rem !important;
                }
                body:not(.is-capturing) .possession-section-card:not([data-is-overall="true"]) .possession-section-title-rate {
                    font-size: 0.7rem !important;
                }
                body:not(.is-capturing) .possession-section-card:not([data-is-overall="true"]) .possession-section-title-count {
                    font-size: 0.52rem !important;
                }
                body:not(.is-capturing) .possession-chart-xaxis-label {
                    font-size: 0.48rem !important;
                }
                body:not(.is-capturing) .possession-chart-bar-value {
                    font-size: 0.48rem !important;
                    top: -10px !important;
                }
                body:not(.is-capturing) .possession-col-header {
                    font-size: 0.4rem !important;
                }
                body:not(.is-capturing) .possession-detail-col {
                    padding: 0 4px 6px 4px !important;
                }
                body:not(.is-capturing) .possession-category-header,
                body:not(.is-capturing) .possession-type-title-row,
                body:not(.is-capturing) .possession-section-title-label {
                    padding: 0 10px !important;
                }
                body:not(.is-capturing) .possession-category-header:hover {
                    background: transparent !important;
                    border-color: transparent !important;
                }
                body:not(.is-capturing) #possession-desc {
                    font-size: 0.58rem !important;
                    line-height: 1.35 !important;
                    margin: 0 !important;
                }
                body:not(.is-capturing) .possession-category-item > div:last-child {
                    border-radius: 5px !important;
                }
                body:not(.is-capturing) .possession-detail-scroll-wrapper {
                    border-radius: 5px !important;
                    padding: 3px 2px 8px 2px !important;
                }
                body:not(.is-capturing) .possession-detail-card-list {
                    gap: 2px !important;
                }
                body:not(.is-capturing) .possession-detail-card {
                    border-radius: 2px 12px 2px 2px !important;
                    margin-bottom: 0 !important;
                }
                body:not(.is-capturing) .possession-chart-area-wrapper {
                    max-width: 270px !important;
                    margin: 0 auto !important;
                }
                body:not(.is-capturing) .possession-chart-yaxis {
                    font-size: 0.45rem !important;
                    height: 45px !important;
                    width: 12px !important;
                    margin-right: 1px !important;
                }
                body:not(.is-capturing) .possession-chart-bars {
                    height: 45px !important;
                }
                body:not(.is-capturing) .possession-chart-xaxis-container {
                    padding-left: 18px !important;
                }
                body:not(.is-capturing) .possession-save-options-content {
                    width: 270px !important;
                    padding: 16px !important;
                    gap: 8px !important;
                    border-radius: 12px !important;
                }
                body:not(.is-capturing) .possession-save-options-content .save-opt-title {
                    font-size: 0.85rem !important;
                    margin-top: 2px !important;
                    margin-bottom: 2px !important;
                }
                body:not(.is-capturing) .possession-save-options-content .save-opt-warning {
                    font-size: 0.4rem !important;
                    margin-top: 2px !important;
                }
                body:not(.is-capturing) .possession-save-options-content button.calc-btn {
                    padding: 11px 8px !important;
                    font-size: 0.65rem !important;
                    border-radius: 6px !important;
                    width: 90% !important;
                }
                body:not(.is-capturing) .possession-save-options-content #btn-save-opt-close {
                    font-size: 1rem !important;
                    top: 4px !important;
                    right: 4px !important;
                }
            }
        </style>
        <div class="modal-content possession-modal-content" style="width: 1000px; max-width: 90%; min-width: min(740px, 90%); max-height: 85dvh; padding: 20px 20px 9px 20px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; border-radius: 18px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); overflow: hidden; background-color: #ffffff;">
            <!-- Header section containing the Title and Save Image button on the top-right -->
            <div id="possession-header-area" style="display: flex; align-items: flex-end; user-select: none; width: 100%; padding-bottom: 8px; box-sizing: border-box;">
                <div style="display: flex; flex-direction: column; align-items: flex-start; flex: 1; gap: 0; margin-right: 5px;">
                    <div class="possession-title-wrap" style="display: flex; align-items: flex-end; gap: 8px; font-size: 1.3rem; font-weight: 800; color: #333; width: 100%;">
                        <svg class="possession-title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; flex-shrink: 0; margin-bottom: -1px;">
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                        </svg>
                        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 2px;">
                            <span>${title}</span>
                            <span class="possession-title-date" style="font-size: 0.7em; font-weight: 500; color: #666; margin-left: 4px;">${formattedDate}</span>
                        </div>
                    </div>
                    <div id="possession-header-line" style="width: calc(100% - 20px); height: 3px; background-color: ${themeColor}; margin-top: -3px; margin-left: 20px; z-index: 5;"></div>
                </div>
                <button id="btn-possession-save-image" class="calc-btn" style="height: 34px; padding: 0 16px; background-color: ${themeColor}; color: #fff; font-weight: bold; font-size: 0.85rem; border: none; border-radius: 0 8px 8px 0; cursor: pointer; transition: none !important; display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
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

    // Filter logic - Default ALL selected (on Mobile, SR is excluded by default)
    const isMobileModal = window.innerWidth <= 768;
    const filterSSR = modal.querySelector('#filter-ssr');
    const filterSR = modal.querySelector('#filter-sr');
    let ssrActive = true;
    let srActive = isMobileModal ? false : true;

    const sourceButtons = {};
    const activeSources = {};
    SOURCE_ORDER.forEach(src => {
        sourceButtons[src] = modal.querySelector(`#filter-src-${src}`);
        activeSources[src] = true;
    });

    updateFilters();

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

        const ssrActiveStyle = `background: linear-gradient(90deg, rgba(255, 235, 122, 0.45) 0%, rgba(255, 139, 173, 0.45) 35%, rgba(194, 147, 255, 0.45) 70%, rgba(115, 232, 255, 0.45) 100%);`;
        const srActiveStyle = `background: linear-gradient(90deg, rgba(255, 244, 79, 0.45) 0%, rgba(255, 253, 230, 0.45) 25%, rgba(255, 204, 0, 0.45) 50%);`;

        filterSSR.style.cssText = `flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; border-right: 1px solid #cbd5e1; cursor: pointer; transition: none !important; ${ssrActive ? ssrActiveStyle : inactiveImgStyle}`;
        const ssrImg = filterSSR.querySelector('img');
        if (ssrImg) {
            ssrImg.style.filter = ssrActive ? 'none' : 'grayscale(100%) opacity(40%)';
            ssrImg.style.transition = 'none';
        }

        filterSR.style.cssText = `flex: 1; display: flex; justify-content: center; align-items: center; padding: 6px 0; border: none; cursor: pointer; transition: none !important; ${srActive ? srActiveStyle : inactiveImgStyle}`;
        const srImg = filterSR.querySelector('img');
        if (srImg) {
            srImg.style.filter = srActive ? 'none' : 'grayscale(100%) opacity(40%)';
            srImg.style.transition = 'none';
        }

        SOURCE_ORDER.forEach((src, idx) => {
            const isLast = idx === SOURCE_ORDER.length - 1;
            const borderStyle = isLast ? 'border: none;' : 'border: none; border-right: 1px solid #cbd5e1;';
            const activeSrcStyle = `background: ${SOURCE_COLORS[src] || themeColor}; color: #fff;`;
            sourceButtons[src].style.cssText = `flex: 1; min-width: 50px; padding: 6px 0; ${borderStyle} font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: none !important; ${activeSources[src] ? activeSrcStyle : inactiveTextStyle}`;
        });

        currentStats = calculatePossessionStats(currentFilter, currentSourceFilter, null, null);
        const content = buildStatsContent(currentStats, themeColor, langKey, isJa, isEn);
        modal.querySelector('#possession-stats-area').innerHTML = content.html;
    }

    filterSSR.onclick = () => {
        if (ssrActive && !srActive) return; // Block unselecting last active rarity
        ssrActive = !ssrActive;
        updateFilters();
    };

    filterSR.onclick = () => {
        if (srActive && !ssrActive) return; // Block unselecting last active rarity
        srActive = !srActive;
        updateFilters();
    };

    SOURCE_ORDER.forEach(src => {
        sourceButtons[src].onclick = () => {
            if (activeSources[src]) {
                const activeCount = Object.values(activeSources).filter(Boolean).length;
                if (activeCount <= 1) return; // Block unselecting last active source
            }
            activeSources[src] = !activeSources[src];
            updateFilters();
        };
    });

    const statsArea = modal.querySelector('#possession-stats-area');
    statsArea.addEventListener('click', (e) => {
        // Waffle quarter container click handler (collapse/expand cards in that quarter)
        const waffleQuarterContainer = e.target.closest('.waffle-quarter-container');
        if (waffleQuarterContainer) {
            const qKey = waffleQuarterContainer.getAttribute('data-qkey');
            if (qKey) {
                const isCurrentlyCollapsed = waffleQuarterContainer.classList.contains('collapsed');
                const nextState = !isCurrentlyCollapsed;

                waffleQuarterState[qKey] = nextState;
                waffleQuarterContainer.classList.toggle('collapsed', nextState);

                const origSpan = waffleQuarterContainer.getAttribute('data-span-rows') || '2';
                const origMobileSpan = waffleQuarterContainer.getAttribute('data-mobile-span-rows') || origSpan;
                const origMinHeight = waffleQuarterContainer.getAttribute('data-min-height-calc') || '';
                const maxMinHeight = waffleQuarterContainer.getAttribute('data-max-min-height-calc') || origMinHeight;
                const mobileMinHeight = waffleQuarterContainer.getAttribute('data-mobile-min-height-calc') || origMinHeight;
                const mobileMaxMinHeight = waffleQuarterContainer.getAttribute('data-mobile-max-min-height-calc') || mobileMinHeight;

                const pcHeight = nextState ? maxMinHeight : origMinHeight;
                const mobileHeight = nextState ? mobileMaxMinHeight : mobileMinHeight;

                waffleQuarterContainer.style.setProperty('--pc-height', pcHeight);
                waffleQuarterContainer.style.setProperty('--mobile-min-height', mobileHeight);

                const isMobile = window.innerWidth <= 768;
                if (nextState) {
                    waffleQuarterContainer.style.gridColumn = 'span 1';
                    waffleQuarterContainer.style.gridRow = 'span 1';
                } else {
                    const currentSpan = isMobile ? origMobileSpan : origSpan;
                    waffleQuarterContainer.style.gridColumn = '1';
                    waffleQuarterContainer.style.gridRow = `span ${currentSpan}`;
                }

                const unifiedGrid = waffleQuarterContainer.closest('.possession-unified-grid');
                if (unifiedGrid) {
                    const cards = unifiedGrid.querySelectorAll(`.possession-detail-card[data-qkey="${qKey}"]`);
                    cards.forEach(c => {
                        c.style.display = nextState ? 'none' : 'flex';
                    });
                }

                const chevron = waffleQuarterContainer.querySelector('.waffle-chevron');
                if (chevron) {
                    chevron.style.transform = nextState ? 'rotate(-90deg)' : 'rotate(0deg)';
                }
            }
            return;
        }

        // Overall bar click handler
        const overallBar = e.target.closest('.possession-overall-bar-container');
        if (overallBar) {
            const overallCard = overallBar.closest('.possession-section-card');
            if (overallCard && overallCard.getAttribute('data-is-overall') === 'true') {
                overallCard.classList.toggle('show-detail');
            }
            return;
        }

        // 1. 도넛 그래프 카드 클릭 -> 막대 그래프 및 상세 아코디언 펼침
        const sourceCard = e.target.closest('.possession-source-card');
        if (sourceCard && !sourceCard.classList.contains('expanded')) {
            const mainView = sourceCard.querySelector('.possession-source-main-view');
            const chartContainer = sourceCard.querySelector('.possession-source-chart-container');
            const detailContainer = sourceCard.querySelector('.possession-detail-container');
            const chevron = sourceCard.querySelector('.possession-chevron');

            if (mainView) mainView.style.display = 'block';
            if (chartContainer) chartContainer.style.display = '';
            if (detailContainer) detailContainer.style.display = 'block';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            sourceCard.classList.add('expanded');
            return;
        }

        // 파라미터별 카드 클릭 -> 막대 그래프 및 상세 아코디언 펼침
        const typeCard = e.target.closest('.possession-type-card');
        if (typeCard && !typeCard.classList.contains('expanded')) {
            if (e.target.closest('.possession-detail-card') || e.target.closest('.possession-col-header') || e.target.closest('.waffle-quarter-container')) {
                return;
            }
            const mainView = typeCard.querySelector('.possession-type-main-view');
            const chartContainer = typeCard.querySelector('.possession-type-chart-container');
            const detailContainer = typeCard.querySelector('.possession-detail-container');
            const chevron = typeCard.querySelector('.possession-chevron');

            if (mainView) mainView.style.display = 'block';
            if (chartContainer) chartContainer.style.display = '';
            if (detailContainer) detailContainer.style.display = 'block';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            typeCard.classList.add('expanded');
            return;
        }

        // 플랜 히트맵 열 클릭 -> 특정 플랜 상세 아코디언 토글 (열 단위 기준)
        const heatmapCol = e.target.closest('.possession-heatmap-col');
        if (heatmapCol) {
            const plan = heatmapCol.getAttribute('data-plan');
            if (plan) {
                const targetWrapper = statsArea.querySelector(`.possession-plan-detail-wrapper[data-plan="${plan}"]`);
                if (targetWrapper) {
                    const detailContainer = targetWrapper.querySelector('.possession-detail-container');
                    const chevron = targetWrapper.querySelector('.possession-chevron');
                    const isCurrentlyOpen = targetWrapper.style.display === 'block';

                    // 1. Close all plan detail drawers first
                    const allWrappers = statsArea.querySelectorAll('.possession-plan-detail-wrapper');
                    allWrappers.forEach(w => {
                        w.style.display = 'none';
                        const det = w.querySelector('.possession-detail-container');
                        if (det) det.style.display = 'none';
                        const chev = w.querySelector('.possession-chevron');
                        if (chev) chev.style.transform = 'rotate(0deg)';
                    });

                    // Reset highlight state
                    const container = heatmapCol.closest('.possession-heatmap-container');
                    if (container) {
                        container.classList.remove('col-active-mode');
                        container.querySelectorAll('.possession-heatmap-col').forEach(el => {
                            el.classList.remove('active-highlight');
                        });
                    }

                    // 2. If it was closed, open it now
                    if (!isCurrentlyOpen) {
                        targetWrapper.style.display = 'block';
                        if (detailContainer) detailContainer.style.display = 'block';
                        if (chevron) chevron.style.transform = 'rotate(180deg)';

                        if (container) {
                            container.classList.add('col-active-mode');
                            heatmapCol.classList.add('active-highlight');
                        }
                    }
                }
            }
            return;
        }

        // 2. 이미 펼쳐진 막대 헤더 클릭 -> 접히면서 다시 원래 뷰로 복귀
        const categoryHeader = e.target.closest('.possession-category-header');
        if (categoryHeader) {
            const sourceCard = categoryHeader.closest('.possession-source-card');
            if (sourceCard) {
                const mainView = sourceCard.querySelector('.possession-source-main-view');
                const chartContainer = sourceCard.querySelector('.possession-source-chart-container');
                const detailContainer = sourceCard.querySelector('.possession-detail-container');
                const chevron = sourceCard.querySelector('.possession-chevron');

                if (mainView) mainView.style.display = 'none';
                if (chartContainer) chartContainer.style.display = '';
                if (detailContainer) detailContainer.style.display = 'none';
                if (chevron) chevron.style.transform = 'rotate(0deg)';
                sourceCard.classList.remove('expanded');
                return;
            }

            const typeCard = categoryHeader.closest('.possession-type-card');
            if (typeCard) {
                const mainView = typeCard.querySelector('.possession-type-main-view');
                const chartContainer = typeCard.querySelector('.possession-type-chart-container');
                const detailContainer = typeCard.querySelector('.possession-detail-container');
                const chevron = typeCard.querySelector('.possession-chevron');

                if (mainView) mainView.style.display = 'none';
                if (chartContainer) chartContainer.style.display = '';
                if (detailContainer) detailContainer.style.display = 'none';
                if (chevron) chevron.style.transform = 'rotate(0deg)';
                typeCard.classList.remove('expanded');
                return;
            }

            const planDetailWrapper = categoryHeader.closest('.possession-plan-detail-wrapper');
            if (planDetailWrapper) {
                const detailContainer = planDetailWrapper.querySelector('.possession-detail-container');
                const chevron = planDetailWrapper.querySelector('.possession-chevron');

                planDetailWrapper.style.display = 'none';
                if (detailContainer) detailContainer.style.display = 'none';
                if (chevron) chevron.style.transform = 'rotate(0deg)';

                // Reset table active states
                const plan = planDetailWrapper.getAttribute('data-plan');
                const container = statsArea.querySelector('.possession-heatmap-container');
                if (container && plan) {
                    container.classList.remove('col-active-mode');
                    container.querySelectorAll('.possession-heatmap-col').forEach(el => {
                        el.classList.remove('active-highlight');
                    });
                }
                return;
            }

            // 일반 카테고리 헤더(전체 소지율 등)의 원래 아코디언 토글 로직
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
        const warningText = isJa
            ? '※ モバイルではSSR+SRの全体所持率保存に対応していません。'
            : isEn
                ? '* When saving overall rate, mobile does not support SSR+SR.'
                : '※ 모바일은 SSR+SR의 전체 소지율 저장을 지원하지 않습니다.';

        const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDoubleFilter = (ssrActive && srActive) || (!ssrActive && !srActive);
        const overallDisabled = isMobileDevice && isDoubleFilter;

        const disabledStyle = overallDisabled
            ? 'background: #cbd5e1; color: #94a3b8; cursor: not-allowed; opacity: 0.75;'
            : 'background: #555; color: #fff; cursor: pointer;';
        const disabledAttr = overallDisabled ? 'disabled' : '';
        const warningDisplay = overallDisabled ? 'display: block;' : 'display: none;';

        optionsModal.innerHTML = `
            <div class="modal-content possession-save-options-content" style="width: 380px; padding: 24px; border-radius: 16px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 13px; box-sizing: border-box; text-align: center; position: relative;">
                <button id="btn-save-opt-close" style="position: absolute; right: 6px; top: 6px; background: none; border: none; font-size: 1.25rem; font-weight: bold; color: #888; cursor: pointer; padding: 2px; line-height: 1; transition: none !important;">&times;</button>
                <div class="save-opt-title" style="font-weight: 800; font-size: 1.1rem; color: #333; margin-bottom: 4px; margin-top: 8px;">${titleText}</div>
                <button id="btn-save-opt-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: ${themeColor}; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                    ${optAllText}
                </button>
                <button id="btn-save-opt-overall" class="calc-btn" ${disabledAttr} style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; ${disabledStyle} border: none; border-radius: 8px; transition: none !important;">
                    ${optOverallText}
                </button>
                <div class="save-opt-warning" style="font-size: 0.72rem; color: #dc2626; font-weight: bold; margin-top: 4px; word-break: keep-all; line-height: 1.35; user-select: none; ${warningDisplay}">
                    ${warningText}
                </div>
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
                document.body.classList.add('is-capturing');
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
                const origModalWidth = modalContent.style.width;
                const origModalMaxWidth = modalContent.style.maxWidth;
                const origModalMinWidth = modalContent.style.minWidth;

                // Elements to hide temporarily to make the image clean showing ONLY overall rate card
                const filterRarityArea = modalContent.querySelector('#possession-filter-rarity-area');
                const filterSourceArea = modalContent.querySelector('#possession-filter-source-area');
                const sourceLabelEl = modalContent.querySelector('#possession-source-label');
                const typeLabelEl = modalContent.querySelector('#possession-type-label');
                const planLabelEl = modalContent.querySelector('#possession-plan-label');

                const origFilterRarityDisplay = filterRarityArea ? filterRarityArea.style.display : '';
                const origFilterSourceDisplay = filterSourceArea ? filterSourceArea.style.display : '';
                const origSourceLabelDisplay = sourceLabelEl ? sourceLabelEl.style.display : '';
                const origTypeLabelDisplay = typeLabelEl ? typeLabelEl.style.display : '';
                const origPlanLabelDisplay = planLabelEl ? planLabelEl.style.display : '';

                const statsSourceGridEl = modalContent.querySelector('.possession-stats-source-card');
                const origStatsSourceGridDisplay = statsSourceGridEl ? statsSourceGridEl.style.display : '';
                if (saveType === 'overall' && statsSourceGridEl) {
                    statsSourceGridEl.style.display = 'none';
                }

                const statsTypeGridEl = modalContent.querySelector('.possession-stats-type-card');
                const origStatsTypeGridDisplay = statsTypeGridEl ? statsTypeGridEl.style.display : '';
                if (saveType === 'overall' && statsTypeGridEl) {
                    statsTypeGridEl.style.display = 'none';
                }

                const statsPlanGridEl = modalContent.querySelector('.possession-stats-plan-card');
                const origStatsPlanGridDisplay = statsPlanGridEl ? statsPlanGridEl.style.display : '';
                if (saveType === 'overall' && statsPlanGridEl) {
                    statsPlanGridEl.style.display = 'none';
                }

                // Track source card expansions
                const sourceCards = modalContent.querySelectorAll('.possession-source-card');
                const origSourceCardStates = [];

                sourceCards.forEach(card => {
                    const mainView = card.querySelector('.possession-source-main-view');
                    const chartContainer = card.querySelector('.possession-source-chart-container');
                    const detailContainer = card.querySelector('.possession-detail-container');
                    const chevron = card.querySelector('.possession-chevron');

                    origSourceCardStates.push({
                        card,
                        expanded: card.classList.contains('expanded'),
                        mainViewDisplay: mainView ? mainView.style.display : '',
                        chartContainerDisplay: chartContainer ? chartContainer.style.display : '',
                        detailDisplay: detailContainer ? detailContainer.style.display : '',
                        chevronTransform: chevron ? chevron.style.transform : ''
                    });

                    if (saveType === 'all') {
                        card.classList.remove('expanded');
                        if (mainView) mainView.style.display = 'none';
                        if (chartContainer) chartContainer.style.display = '';
                        if (detailContainer) detailContainer.style.display = 'none';
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    }
                });

                // Track type card expansions
                const typeCards = modalContent.querySelectorAll('.possession-type-card');
                const origTypeCardStates = [];

                typeCards.forEach(card => {
                    const mainView = card.querySelector('.possession-type-main-view');
                    const chartContainer = card.querySelector('.possession-type-chart-container');
                    const detailContainer = card.querySelector('.possession-detail-container');
                    const chevron = card.querySelector('.possession-chevron');

                    origTypeCardStates.push({
                        card,
                        expanded: card.classList.contains('expanded'),
                        mainViewDisplay: mainView ? mainView.style.display : '',
                        chartContainerDisplay: chartContainer ? chartContainer.style.display : '',
                        detailDisplay: detailContainer ? detailContainer.style.display : '',
                        chevronTransform: chevron ? chevron.style.transform : ''
                    });

                    if (saveType === 'all') {
                        card.classList.remove('expanded');
                        if (mainView) mainView.style.display = 'none';
                        if (chartContainer) chartContainer.style.display = '';
                        if (detailContainer) detailContainer.style.display = 'none';
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    }
                });

                // Track plan card expansions
                const planDetailWrappers = modalContent.querySelectorAll('.possession-plan-detail-wrapper');
                const origPlanDetailWrapperStates = [];

                planDetailWrappers.forEach(wrapper => {
                    const detailContainer = wrapper.querySelector('.possession-detail-container');
                    const chevron = wrapper.querySelector('.possession-chevron');

                    origPlanDetailWrapperStates.push({
                        wrapper,
                        display: wrapper.style.display,
                        detailDisplay: detailContainer ? detailContainer.style.display : '',
                        chevronTransform: chevron ? chevron.style.transform : ''
                    });

                    if (saveType === 'all') {
                        wrapper.style.display = 'none';
                        if (detailContainer) detailContainer.style.display = 'none';
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    }
                });

                // Reset heatmap highlight states for capture
                if (saveType === 'all') {
                    const heatmapContainer = modalContent.querySelector('.possession-heatmap-container');
                    if (heatmapContainer) {
                        heatmapContainer.classList.remove('col-active-mode');
                        heatmapContainer.querySelectorAll('.possession-heatmap-col').forEach(el => {
                            el.classList.remove('active-highlight');
                        });
                    }
                }

                btn.innerHTML = 'GAKUMAS NOTE';
                if (descArea) descArea.style.display = 'none';
                if (filterRarityArea) filterRarityArea.style.display = 'none';
                if (saveType === 'overall' && sourceLabelEl) sourceLabelEl.style.display = 'none';
                if (saveType === 'overall' && typeLabelEl) typeLabelEl.style.display = 'none';
                if (saveType === 'overall' && planLabelEl) planLabelEl.style.display = 'none';

                // Reset scroll to top before screenshot
                if (scrollArea) {
                    scrollArea.scrollTop = 0;
                    scrollArea.offsetHeight; // force reflow
                }


                // Expand only the overall rate section and columns during screenshot
                const detailContainers = modalContent.querySelectorAll('.possession-detail-container');
                const origDetailDisplays = [];
                detailContainers.forEach(container => {
                    origDetailDisplays.push({ el: container, display: container.style.display });
                    const sectionCard = container.closest('.possession-section-card');
                    const isOverallSection = sectionCard && sectionCard.getAttribute('data-is-overall') === 'true';
                    container.style.display = (saveType === 'overall' && isOverallSection) ? 'block' : 'none';
                });

                // Temporarily expand all Waffle Quarter Containers and Detail Cards inside overall section when saveType === 'overall'
                const origWaffleBlockStates = [];
                if (saveType === 'overall') {
                    const overallWaffleBlocks = modalContent.querySelectorAll('.possession-section-card[data-is-overall="true"] .waffle-quarter-container');
                    overallWaffleBlocks.forEach(box => {
                        const qKey = box.getAttribute('data-qkey');
                        const spanRows = box.getAttribute('data-span-rows');
                        const boxMinHeightCalc = box.getAttribute('data-min-height-calc');
                        const chevron = box.querySelector('.waffle-chevron');
                        const detailCards = modalContent.querySelectorAll(`.possession-detail-card[data-qkey="${qKey}"]`);

                        const origDetailCardDisplays = [];
                        detailCards.forEach(card => {
                            origDetailCardDisplays.push({ card: card, display: card.style.display });
                            card.style.display = 'flex';
                        });

                        origWaffleBlockStates.push({
                            box: box,
                            isCollapsed: box.classList.contains('collapsed'),
                            gridColumn: box.style.gridColumn,
                            gridRow: box.style.gridRow,
                            minHeight: box.style.minHeight,
                            chevronTransform: chevron ? chevron.style.transform : '',
                            detailCardStates: origDetailCardDisplays
                        });

                        box.classList.remove('collapsed');
                        box.style.gridColumn = '1';
                        box.style.gridRow = `span ${spanRows}`;
                        box.style.height = boxMinHeightCalc;
                        box.style.minHeight = boxMinHeightCalc;
                        box.style.maxHeight = boxMinHeightCalc;
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    });
                }

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
                modalContent.style.width = '740px';
                modalContent.style.maxWidth = '740px';
                modalContent.style.minWidth = '740px';

                scrollWrappers.forEach(wrapper => {
                    wrapper.style.maxHeight = 'none';
                    wrapper.style.overflowY = 'visible';
                });

                // Temporarily pre-crop and convert all card thumbnail images right before capture so html2canvas renders exact 5.5:2 ratio without vertical squishing
                const cardImgs = modalContent.querySelectorAll('.possession-detail-card > img:first-child');
                const origImgStates = [];
                cardImgs.forEach(img => {
                    const isGrayscale = (img.style.filter || '').includes('grayscale(100%)');
                    const grayscaleAmount = isGrayscale ? 1.0 : 0;
                    const w = img.offsetWidth || 138.4;
                    const h = img.offsetHeight || 50.32;
                    origImgStates.push({
                        img: img,
                        src: img.src,
                        filter: img.style.filter,
                        objectFit: img.style.objectFit,
                        objectPosition: img.style.objectPosition
                    });
                    img.src = getPreCroppedCardDataUrl(img, w, h, grayscaleAmount, 6);
                    img.style.filter = 'none';
                    img.style.objectFit = 'fill';
                    img.style.objectPosition = 'center';
                });

                const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const captureScale = isMobileDevice ? 1.5 : 2;
                const captureDelay = isMobileDevice ? 500 : 350;

                setTimeout(() => {
                    window.html2canvas(modalContent, {
                        backgroundColor: '#ffffff',
                        scale: captureScale,
                        useCORS: true,
                        logging: false,
                        windowWidth: 1024,
                        width: 740
                    }).then(canvas => {
                        const dataUrl = canvas.toDataURL('image/webp', 0.85);
                        const isWebp = dataUrl.startsWith('data:image/webp');
                        const ext = isWebp ? 'webp' : 'png';

                        const rand = Math.floor(1000 + Math.random() * 9000);
                        const link = document.createElement('a');
                        link.download = `gakumasnote_possession_support_${rand}.${ext}`;
                        link.href = dataUrl;
                        link.click();

                        // Restore original image sources and styles after capture
                        origImgStates.forEach(item => {
                            item.img.src = item.src;
                            item.img.style.filter = item.filter;
                            item.img.style.objectFit = item.objectFit;
                            item.img.style.objectPosition = item.objectPosition;
                        });

                        // Restore original styles
                        if (descArea) descArea.style.display = '';
                        if (filterRarityArea) filterRarityArea.style.display = origFilterRarityDisplay;
                        if (filterSourceArea) filterSourceArea.style.display = origFilterSourceDisplay;
                        if (sourceLabelEl) sourceLabelEl.style.display = origSourceLabelDisplay;
                        if (typeLabelEl) typeLabelEl.style.display = origTypeLabelDisplay;
                        if (planLabelEl) planLabelEl.style.display = origPlanLabelDisplay;

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
                        modalContent.style.width = origModalWidth;
                        modalContent.style.maxWidth = origModalMaxWidth;
                        modalContent.style.minWidth = origModalMinWidth;

                        if (statsSourceGridEl) {
                            statsSourceGridEl.style.display = origStatsSourceGridDisplay;
                        }
                        if (statsTypeGridEl) {
                            statsTypeGridEl.style.display = origStatsTypeGridDisplay;
                        }
                        if (statsPlanGridEl) {
                            statsPlanGridEl.style.display = origStatsPlanGridDisplay;
                        }

                        origSourceCardStates.forEach(state => {
                            if (state.expanded) state.card.classList.add('expanded');
                            else state.card.classList.remove('expanded');

                            const mainView = state.card.querySelector('.possession-source-main-view');
                            const chartContainer = state.card.querySelector('.possession-source-chart-container');
                            const detailContainer = state.card.querySelector('.possession-detail-container');
                            const chevron = state.card.querySelector('.possession-chevron');

                            if (mainView) mainView.style.display = state.mainViewDisplay;
                            if (chartContainer) chartContainer.style.display = state.chartContainerDisplay;
                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origTypeCardStates.forEach(state => {
                            if (state.expanded) state.card.classList.add('expanded');
                            else state.card.classList.remove('expanded');

                            const mainView = state.card.querySelector('.possession-type-main-view');
                            const chartContainer = state.card.querySelector('.possession-type-chart-container');
                            const detailContainer = state.card.querySelector('.possession-detail-container');
                            const chevron = state.card.querySelector('.possession-chevron');

                            if (mainView) mainView.style.display = state.mainViewDisplay;
                            if (chartContainer) chartContainer.style.display = state.chartContainerDisplay;
                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origPlanDetailWrapperStates.forEach(state => {
                            state.wrapper.style.display = state.display;
                            const detailContainer = state.wrapper.querySelector('.possession-detail-container');
                            const chevron = state.wrapper.querySelector('.possession-chevron');

                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origWaffleBlockStates.forEach(state => {
                            if (state.isCollapsed) {
                                state.box.classList.add('collapsed');
                            } else {
                                state.box.classList.remove('collapsed');
                            }
                            state.box.style.gridColumn = state.gridColumn;
                            state.box.style.gridRow = state.gridRow;
                            state.box.style.minHeight = state.minHeight;
                            const chevron = state.box.querySelector('.waffle-chevron');
                            if (chevron) chevron.style.transform = state.chevronTransform;
                            state.detailCardStates.forEach(item => {
                                item.card.style.display = item.display;
                            });
                        });

                        origDetailDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });
                        origWrapperStyles.forEach(item => {
                            item.el.style.maxHeight = item.maxHeight;
                            item.el.style.overflowY = item.overflowY;
                            item.el.scrollTop = item.scrollTop;
                        });

                        btn.innerHTML = originalText;
                        hideSpinnerOverlay();
                        document.body.classList.remove('is-capturing');
                        showSupportToast(alertSuccessImage);
                    }).catch(err => {
                        console.error('html2canvas error:', err);
                        alert(alertFailImage);

                        // Restore original image sources after capture failure
                        origImgStates.forEach(item => {
                            item.img.src = item.src;
                            item.img.style.filter = item.filter;
                            item.img.style.objectFit = item.objectFit;
                            item.img.style.objectPosition = item.objectPosition;
                        });

                        // Restore original styles
                        if (descArea) descArea.style.display = '';
                        if (filterRarityArea) filterRarityArea.style.display = origFilterRarityDisplay;
                        if (filterSourceArea) filterSourceArea.style.display = origFilterSourceDisplay;
                        if (sourceLabelEl) sourceLabelEl.style.display = origSourceLabelDisplay;
                        if (typeLabelEl) typeLabelEl.style.display = origTypeLabelDisplay;
                        if (planLabelEl) planLabelEl.style.display = origPlanLabelDisplay;

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
                        modalContent.style.width = origModalWidth;
                        modalContent.style.maxWidth = origModalMaxWidth;
                        modalContent.style.minWidth = origModalMinWidth;

                        if (statsSourceGridEl) {
                            statsSourceGridEl.style.display = origStatsSourceGridDisplay;
                        }
                        if (statsTypeGridEl) {
                            statsTypeGridEl.style.display = origStatsTypeGridDisplay;
                        }
                        if (statsPlanGridEl) {
                            statsPlanGridEl.style.display = origStatsPlanGridDisplay;
                        }

                        origSourceCardStates.forEach(state => {
                            if (state.expanded) state.card.classList.add('expanded');
                            else state.card.classList.remove('expanded');

                            const mainView = state.card.querySelector('.possession-source-main-view');
                            const chartContainer = state.card.querySelector('.possession-source-chart-container');
                            const detailContainer = state.card.querySelector('.possession-detail-container');
                            const chevron = state.card.querySelector('.possession-chevron');

                            if (mainView) mainView.style.display = state.mainViewDisplay;
                            if (chartContainer) chartContainer.style.display = state.chartContainerDisplay;
                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origTypeCardStates.forEach(state => {
                            if (state.expanded) state.card.classList.add('expanded');
                            else state.card.classList.remove('expanded');

                            const mainView = state.card.querySelector('.possession-type-main-view');
                            const chartContainer = state.card.querySelector('.possession-type-chart-container');
                            const detailContainer = state.card.querySelector('.possession-detail-container');
                            const chevron = state.card.querySelector('.possession-chevron');

                            if (mainView) mainView.style.display = state.mainViewDisplay;
                            if (chartContainer) chartContainer.style.display = state.chartContainerDisplay;
                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origPlanDetailWrapperStates.forEach(state => {
                            state.wrapper.style.display = state.display;
                            const detailContainer = state.wrapper.querySelector('.possession-detail-container');
                            const chevron = state.wrapper.querySelector('.possession-chevron');

                            if (detailContainer) detailContainer.style.display = state.detailDisplay;
                            if (chevron) chevron.style.transform = state.chevronTransform;
                        });

                        origWaffleBlockStates.forEach(state => {
                            if (state.isCollapsed) {
                                state.box.classList.add('collapsed');
                            } else {
                                state.box.classList.remove('collapsed');
                            }
                            state.box.style.gridColumn = state.gridColumn;
                            state.box.style.gridRow = state.gridRow;
                            state.box.style.minHeight = state.minHeight;
                            const chevron = state.box.querySelector('.waffle-chevron');
                            if (chevron) chevron.style.transform = state.chevronTransform;
                            state.detailCardStates.forEach(item => {
                                item.card.style.display = item.display;
                            });
                        });

                        origDetailDisplays.forEach(item => {
                            item.el.style.display = item.display;
                        });
                        origWrapperStyles.forEach(item => {
                            item.el.style.maxHeight = item.maxHeight;
                            item.el.style.overflowY = item.overflowY;
                            item.el.scrollTop = item.scrollTop;
                        });

                        btn.innerHTML = originalText;
                        hideSpinnerOverlay();
                        document.body.classList.remove('is-capturing');
                    });
                }, captureDelay);
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
    const btnOrderHistoryText = isJa ? '課金履歴レポート' : isEn ? 'Payment Report' : '결제 내역 보고서';

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

    const descOrderHistoryText = isJa
        ? 'Google Playの注文履歴を分析し、課金履歴の要約レポートを確認します。'
        : isEn
            ? 'Analyze Google Play order history to view a payment summary report.'
            : '구글 플레이 결제 내역 파일을 분석하여 총 결제 금액 및 항목별 요약 보고서를 확인합니다.';

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
                <button id="btn-menu-order-history" class="support-menu-btn">
                    <div class="menu-btn-title">
                        ${btnOrderHistoryText}
                    </div>
                    <div class="menu-btn-divider" style="width: 100%; height: 1px; background: #cbd5e1; margin: 0;"></div>
                    <div class="menu-btn-desc-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-credit-card"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <div class="menu-btn-desc">
                            ${descOrderHistoryText}
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

    const orderHistoryBtn = menuModal.querySelector('#btn-menu-order-history');

    setupHover(idolStatsBtn);
    setupHover(statsBtn);
    setupHover(orderHistoryBtn);

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

    orderHistoryBtn.onclick = () => {
        closeMenu();
        import('./orderHistoryModal.js').then(m => m.openOrderHistoryModal());
    };
}

