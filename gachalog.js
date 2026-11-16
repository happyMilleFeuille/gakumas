import { state, getGachaLog, getTotalPulls } from './state.js';
import { getActiveGachaConfig, getEffectiveGachaStrategy } from './gachalist.js';
import translations from './i18n.js';
import { produceList } from './producedata.js';
import { cardList } from './carddata.js';

let pickupFilterEnabled = false;
const getPickupFilterEnabled = () => pickupFilterEnabled;
const setPickupFilterEnabled = enabled => {
    pickupFilterEnabled = enabled;
};

const toDisplayRarity = (rarity) => {
    if (rarity === 'PSSR' || rarity === 'SSSR' || rarity === 'SSR') return 'SSR';
    if (rarity === 'PSR' || rarity === 'SR') return 'SR';
    return 'R';
};

// 같은 카드가 수천 번 기록되어도 카드 객체는 ID별 하나만 재사용한다.
const produceById = new Map(produceList.map(card => [card.id, {
    ...card,
    type: 'produce',
    displayRarity: toDisplayRarity(card.rarity)
}]));
const supportById = new Map(cardList.map(card => [card.id, {
    ...card,
    type: 'support',
    displayRarity: toDisplayRarity(card.rarity)
}]));

const resolveLogEntry = (entry) => {
    if (entry && typeof entry === 'object') return entry;

    const id = entry;
    const produce = produceById.get(id);
    if (produce) return produce;

    const support = supportById.get(id);
    if (support) return support;

    const isSrDummy = id === 'ssrcard_dummy';
    return {
        id,
        name: isSrDummy ? '더미 서포트 SR' : (id === 'rcard_dummy' ? '더미 서포트 R' : id),
        type: 'support',
        displayRarity: isSrDummy ? 'SR' : 'R'
    };
};

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (item) => {
    if (!item) return '';
    if (state.currentLang === 'en' && item.name_en) return item.name_en;
    if (useJaNames() && item.name_ja) return item.name_ja;
    return item.name;
};

const getLocalizedGachaName = (config) => {
    if (!config) return '';
    if (state.currentLang === 'en' && config.name_en) return config.name_en;
    if (useJaNames() && config.name_ja) return config.name_ja;
    if (config.name) return config.name;

    const firstPickup = config.pssr?.[0] || config.pool?.pssr?.[0];
    const pickupId = typeof firstPickup === 'string' ? firstPickup : firstPickup?.id;
    return getLocalizedCardName(produceById.get(pickupId));
};

const getGachaCharacterIds = (config) => {
    if (state.gachaType === 'selection') return [];
    const pickups = config?.pssr || config?.pool?.pssr || [];
    return [...new Set(pickups.map(pickup => {
        if (typeof pickup === 'object' && pickup?.char) return pickup.char;
        const pickupId = typeof pickup === 'string' ? pickup : pickup?.id;
        return pickupId?.split('_')[0].replace(/^ssr/i, '') || '';
    }).filter(Boolean))];
};

const getPickupCardIds = (config) => {
    if (state.gachaType === 'selection') return new Set();
    const getIds = key => (config?.[key] || config?.pool?.[key] || [])
        .map(item => typeof item === 'string' ? item : item?.id)
        .filter(Boolean);
    return new Set([...getIds('pssr'), ...getIds('sssr'), ...getIds('psr'), ...getIds('sr_card')]);
};

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normalCdf = (value) => {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value) / Math.sqrt(2);
    const t = 1 / (1 + (0.3275911 * x));
    const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return 0.5 * (1 + (sign * erf));
};

const formatRankPercent = (value) => {
    const percent = Math.max(0, Math.min(100, value * 100));
    return percent < 1 ? percent.toFixed(2) : percent.toFixed(1);
};

const getBinomialProbability = (trials, probability, successes) => {
    const n = Math.max(0, Math.floor(trials));
    const k = Math.max(0, Math.floor(successes));
    if (k > n) return 0;
    if (probability <= 0) return k === 0 ? 1 : 0;
    if (probability >= 1) return k === n ? 1 : 0;

    let logCombination = 0;
    for (let index = 1; index <= k; index++) {
        logCombination += Math.log((n - k + index) / index);
    }
    return Math.exp(logCombination + (k * Math.log(probability)) + ((n - k) * Math.log(1 - probability)));
};

const getBinomialUpperTail = (trials, probability, minimumSuccesses) => {
    const n = Math.max(0, Math.floor(trials));
    const minimum = Math.max(0, Math.floor(minimumSuccesses));
    if (minimum <= 0) return 1;
    if (minimum > n || probability <= 0) return 0;
    if (probability >= 1) return 1;

    let term = getBinomialProbability(n, probability, minimum);
    let total = term;
    for (let successes = minimum; successes < n; successes++) {
        term *= ((n - successes) / (successes + 1)) * (probability / (1 - probability));
        total += term;
        if (term === 0) break;
    }
    return Math.min(1, total);
};

const formatProbabilityPercent = (value) => {
    const percent = Math.max(0, Math.min(100, value * 100));
    if (percent > 0 && percent < 0.01) return '<0.01';
    return percent < 10 ? percent.toFixed(2) : percent.toFixed(1);
};

const formatRatePercent = value => `${(Math.max(0, Math.min(1, value)) * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
const formatAverageCount = value => Math.max(0, value).toFixed(2).replace(/\.?0+$/, '');
const getLogText = key => translations[state.currentLang]?.[key] || translations.ko?.[key] || key;

const renderOccurrenceBars = (trials, probability, observed = 0) => {
    const n = Math.max(0, Number(trials) || 0);
    const p = Math.min(1, Math.max(0, Number(probability) || 0));
    const mean = n * p;
    const averageCount = Math.round(mean);
    const rangeStart = Math.max(0, averageCount - 4);
    const rangeEnd = Math.min(Math.floor(n), averageCount + 5);
    const displayedCounts = Array.from(
        new Set([0, ...Array.from({ length: Math.max(0, rangeEnd - rangeStart + 1) }, (_, index) => rangeStart + index)])
    ).sort((a, b) => a - b);
    const occurrenceData = displayedCounts.map(count => ({
        count,
        isUpperTail: count === rangeEnd,
        cumulativeProbability: getBinomialUpperTail(n, p, count),
        probability: count === rangeEnd
            ? getBinomialUpperTail(n, p, count)
            : getBinomialProbability(n, p, count)
    }));

    return occurrenceData.map(({ count, isUpperTail, probability: itemProbability, cumulativeProbability }) => {
        const barWidth = itemProbability * 100;
        const cumulativeWidth = cumulativeProbability * 100;
        const percent = formatProbabilityPercent(itemProbability);
        const cumulativePercent = formatProbabilityPercent(cumulativeProbability);
        const countLabel = isUpperTail ? `${count}+ SSR` : `${count} SSR`;
        const isCurrent = isUpperTail ? observed >= count : observed === count;
        return `
            <div class="stat-probability-bar-item${isCurrent ? ' is-current' : ''}" aria-label="SSR ${countLabel} 나올 확률 ${percent}%${isCurrent ? ', 현재 위치' : ''}">
                <span class="stat-probability-label">${countLabel}</span>
                <span class="stat-probability-track" style="--bar-width: ${barWidth.toFixed(2)}%; --cumulative-width: ${cumulativeWidth.toFixed(2)}%">
                    ${count === 0 ? '' : '<span class="stat-probability-cumulative"></span>'}
                    <span class="stat-probability-fill"></span>
                    <span class="stat-probability-value">${percent}%</span>
                </span>
                <span class="stat-probability-cumulative-value">${count === 0 ? '' : `${cumulativePercent}%`}</span>
            </div>`;
    }).join('');
};

const renderSsrNormalGraph = (trials, probability, observed, scope = 'total') => {
    const n = Math.max(0, Number(trials) || 0);
    const p = Math.min(1, Math.max(0, Number(probability) || 0));
    const actual = Math.max(0, Number(observed) || 0);
    const mean = n * p;
    const sigma = Math.sqrt(n * p * (1 - p));
    const curveSigma = Math.max(sigma, 0.35);
    const halfRange = Math.max(curveSigma * 4, Math.abs(actual - mean) + (curveSigma * 0.5), 1);
    const minX = mean - halfRange;
    const maxX = mean + halfRange;
    const width = 240;
    const height = 92;
    const left = 8;
    const right = 8;
    const top = 22;
    const baseline = 75;
    const plotWidth = width - left - right;
    const plotHeight = baseline - top;
    const toSvgX = value => left + ((value - minX) / (maxX - minX)) * plotWidth;
    const points = Array.from({ length: 65 }, (_, index) => {
        const xValue = minX + ((maxX - minX) * index / 64);
        const densityRatio = Math.exp(-0.5 * Math.pow((xValue - mean) / curveSigma, 2));
        return [toSvgX(xValue), baseline - (densityRatio * plotHeight)];
    });
    const curvePath = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const areaPath = `M${points[0][0].toFixed(2)},${baseline} ${curvePath.replace(/^M/, 'L')} L${points.at(-1)[0].toFixed(2)},${baseline} Z`;
    const meanX = toSvgX(mean);
    const actualX = toSvgX(actual);
    const rankPercent = formatRankPercent(1 - normalCdf((actual - mean) / curveSigma));
    const occurrenceBars = renderOccurrenceBars(n, p, actual);
    const percentileTicks = [
        { percent: 95, zScore: -1.64485, showLabel: false },
        { percent: 90, zScore: -1.28155, showLabel: true },
        { percent: 50, zScore: 0, showLabel: true },
        { percent: 10, zScore: 1.28155, showLabel: true },
        { percent: 5, zScore: 1.64485, showLabel: false }
    ].map(({ percent, zScore, showLabel }) => {
        const xValue = mean + (zScore * curveSigma);
        return `
            <line x1="${toSvgX(xValue).toFixed(2)}" y1="${baseline}" x2="${toSvgX(xValue).toFixed(2)}" y2="${baseline + 3}" class="stat-chart-axis"></line>
            ${showLabel ? `<text x="${toSvgX(xValue).toFixed(2)}" y="88" text-anchor="middle" class="stat-chart-caption">${percent}%</text>` : ''}`;
    }).join('');

    return `
        <div class="stat-distribution-layout" data-distribution="${scope}">
            <div class="stat-normal-chart" role="img" aria-label="SSR normal approximation: p ${(p * 100).toFixed(2)}%, n ${n}, mean ${mean.toFixed(2)}, observed ${actual}">
                <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <text x="${width / 2}" y="12" text-anchor="middle" class="stat-chart-meta">${getLogText('gacha_log_current_top')} ${rankPercent}%</text>
                    <path d="${areaPath}" class="stat-chart-area"></path>
                    <path d="${curvePath}" class="stat-chart-curve"></path>
                    <line x1="${meanX.toFixed(2)}" y1="${top}" x2="${meanX.toFixed(2)}" y2="${baseline}" class="stat-chart-mean"></line>
                    <line x1="${actualX.toFixed(2)}" y1="${top}" x2="${actualX.toFixed(2)}" y2="${baseline}" class="stat-chart-observed"></line>
                    <line x1="${left}" y1="${baseline}" x2="${width - right}" y2="${baseline}" class="stat-chart-axis"></line>
                    ${percentileTicks}
                </svg>
            </div>
            <div class="stat-probability-panel">
                <div class="stat-probability-header">
                    <div class="stat-probability-header-item"><span>${getLogText('gacha_log_total_count')}</span><strong>${n}</strong></div>
                    <div class="stat-probability-header-item"><span>${getLogText('gacha_log_hit_rate')}</span><strong class="stat-hit-rate">${formatRatePercent(p)}</strong></div>
                    <div class="stat-probability-header-item"><span>${getLogText('gacha_log_average')}</span><strong>${formatAverageCount(mean)}</strong></div>
                </div>
                <div class="stat-probability-chart" aria-label="SSR 개수별 출현 확률 막대그래프">
                    ${occurrenceBars}
                </div>
            </div>
        </div>`;
};

export function openGachaLogModal() {
    const modal = document.getElementById('gacha-log-modal');
    const statsArea = document.getElementById('gacha-log-stats');
    const list = document.getElementById('gacha-log-list');
    if (!modal || !list || !statsArea) return;

    list.innerHTML = '';
    list.classList.add('hidden');
    statsArea.innerHTML = '';
    const currentLog = getGachaLog().map(resolveLogEntry);

    if (currentLog.length === 0) return;

    // calc.css의 공통 .modal 규칙(display: none)보다 확실하게 우선하여 표시한다.
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    const total = currentLog.length;
    const pickupCardIds = getPickupCardIds(getActiveGachaConfig(state.gachaType));
    const stats = {
        total: { SSR: 0, SR: 0, R: 0 },
        produce: { SSR: 0, SR: 0, R: 0 },
        support: { SSR: 0, SR: 0, R: 0 }
    };
    const grouped = new Map();

    // 통계 및 그룹화 계산
    currentLog.forEach(item => {
        const rarity = item.displayRarity;
        stats.total[rarity] = (stats.total[rarity] || 0) + 1;
        
        if (item.type === 'produce') stats.produce[rarity] = (stats.produce[rarity] || 0) + 1;
        else stats.support[rarity] = (stats.support[rarity] || 0) + 1;

        const groupKey = `${item.type}_${item.id}`;
        if (grouped.has(groupKey)) {
            grouped.get(groupKey).count++;
        } else {
            grouped.set(groupKey, { ...item, count: 1 });
        }
    });

    renderStats(statsArea, total, stats, currentLog);

    // 각 상세 영역 안에서 등급(SSR>SR>R) -> 횟수(내림차순)로 정렬한다.
    const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
    const sorted = Array.from(grouped.values()).sort((a, b) => 
        (rarityOrder[b.displayRarity] - rarityOrder[a.displayRarity]) || 
        (b.count - a.count)
    );

    const produceList = statsArea.querySelector('#gacha-log-produce-list');
    const supportList = statsArea.querySelector('#gacha-log-support-list');
    const produceFragment = document.createDocumentFragment();
    const supportFragment = document.createDocumentFragment();

    sorted.forEach(item => {
        const target = item.type === 'produce' ? produceFragment : supportFragment;
        target.appendChild(createLogItem(item, pickupCardIds.has(item.id)));
    });
    produceList?.appendChild(produceFragment);
    supportList?.appendChild(supportFragment);

}

function renderStats(container, total, stats, currentLog = []) {
    const t = translations[state.currentLang];
    const totalJewels = total * 250;
    const yenPerJewel = 1.1951;
    let priceDisplay = `<span class="stat-jewel-amount">${totalJewels.toLocaleString()}<span class="stat-yen-price">(￥${Math.floor(totalJewels * yenPerJewel).toLocaleString()})</span></span>`;
    const getPerc = (c) => ((c / total) * 100).toFixed(1) + '%';
    const labels = {
        total: t.gacha_log_total_count,
        p: t.gacha_log_p_detail,
        s: t.gacha_log_s_detail
    };
    const rarityIcon = rarity => `<img src="icons/${rarity.toLowerCase()}.png" alt="${rarity}" class="stat-rarity-icon">`;
    const rarityStat = (rarity, count, scope) => `
        <div class="stat-item stat-rarity-item" data-stat-scope="${scope}" data-rarity="${rarity}">
            ${rarityIcon(rarity)}
            <span class="stat-value">${count}</span>
            <small class="stat-percent">(${getPerc(count)})</small>
        </div>`;
    const activeConfig = getActiveGachaConfig(state.gachaType) || {};
    const gachaName = getLocalizedGachaName(activeConfig);
    const gachaCharacterIds = getGachaCharacterIds(activeConfig);
    const gachaCharacterNames = gachaCharacterIds
        .map(characterId => t[`idol_fullname_${characterId}`] || '')
        .filter(Boolean);
    const gachaCharacterIcons = gachaCharacterIds
        .map(characterId => `<img src="icons/idolicons/${escapeHtml(characterId)}_c.png" alt="" class="stat-gacha-character-icon">`)
        .join('');
    const strategy = getEffectiveGachaStrategy(state.gachaType, activeConfig);
    const ssrProbability = (strategy.rates.PSSR || 0) + (strategy.rates.SSSR || 0);
    const getPickupIds = key => activeConfig[key] || activeConfig.pool?.[key] || [];
    const normalizePickupIds = list => new Set(list.map(item => typeof item === 'string' ? item : item.id).filter(Boolean));
    const pssrPickupIds = normalizePickupIds(getPickupIds('pssr'));
    const sssrPickupIds = normalizePickupIds(getPickupIds('sssr'));
    const pickupIds = new Set([...pssrPickupIds, ...sssrPickupIds]);
    const pssrPickupCount = pssrPickupIds.size;
    const sssrPickupCount = sssrPickupIds.size;
    const pssrRatePerCard = state.gachaType === 'fes' ? (activeConfig.pickupRate ?? 0.0075) : 0.0075;
    const pickupProbability = Math.min(pssrRatePerCard * pssrPickupCount, strategy.rates.PSSR || 0)
        + Math.min(sssrPickupCount > 0 ? 0.01 : 0, strategy.rates.SSSR || 0);
    const pickupObserved = currentLog.filter(item => pickupIds.has(item.id)).length;
    const produceProbability = strategy.rates.PSSR || 0;
    const supportProbability = strategy.rates.SSSR || 0;
    const producePickupProbability = Math.min(pssrRatePerCard * pssrPickupCount, produceProbability);
    const supportPickupProbability = Math.min(sssrPickupCount > 0 ? 0.01 : 0, supportProbability);
    const producePickupObserved = currentLog.filter(item => item.type === 'produce' && pickupIds.has(item.id)).length;
    const supportPickupObserved = currentLog.filter(item => item.type === 'support' && pickupIds.has(item.id)).length;
    const totalPulls = getTotalPulls();
    const showDistributionGraphs = state.gachaType !== 'selection';
    const initialUsePickup = showDistributionGraphs && getPickupFilterEnabled();
    const initialTotalSsr = initialUsePickup ? pickupObserved : stats.total.SSR;
    const initialProduceSsr = initialUsePickup ? producePickupObserved : stats.produce.SSR;
    const initialSupportSsr = initialUsePickup ? supportPickupObserved : stats.support.SSR;
    const normalGraph = renderSsrNormalGraph(totalPulls, initialUsePickup ? pickupProbability : ssrProbability, initialTotalSsr, 'total');
    const produceGraph = renderSsrNormalGraph(totalPulls, initialUsePickup ? producePickupProbability : produceProbability, initialProduceSsr, 'produce');
    const supportGraph = renderSsrNormalGraph(totalPulls, initialUsePickup ? supportPickupProbability : supportProbability, initialSupportSsr, 'support');

    container.innerHTML = `
        <div class="stat-row-top">
            ${gachaName ? `<div class="stat-gacha-name${state.gachaType === 'selection' ? ' is-selection' : ''}" title="${escapeHtml(gachaName)}">${state.gachaType !== 'selection' ? '<span class="stat-gacha-pickup-label">[PICK UP]</span>' : ''}${gachaCharacterIcons ? `<span class="stat-gacha-character-icons">${gachaCharacterIcons}</span>` : ''}<span class="stat-gacha-name-text">${gachaCharacterNames.length ? `<span class="stat-gacha-character-names">${escapeHtml(gachaCharacterNames.join(' / '))}</span><span class="stat-gacha-title-separator">-</span>` : ''}<span class="stat-gacha-title">${escapeHtml(gachaName)}</span></span></div>` : ''}
            <div class="stat-item full-width stat-total-heading">
                <span class="stat-label stat-total-count"><img src="icons/flower.webp" alt="" class="stat-total-icon">${labels.total} <span class="stat-value" style="margin-left: 5px;">${total}</span></span>
                <span class="stat-value stat-jewel-cost"><img src="icons/jewel.png" alt="쥬얼" class="stat-jewel-icon">${priceDisplay}</span>
                <div class="stat-rarity-stack">
                    ${rarityStat('SSR', initialTotalSsr, 'total')}
                    ${rarityStat('SR', stats.total.SR, 'total')}
                    ${rarityStat('R', stats.total.R, 'total')}
                </div>
                ${showDistributionGraphs ? `<label class="stat-header-pickup"><input type="checkbox" aria-label="${t.gacha_log_pickup_ssr}"${initialUsePickup ? ' checked' : ''}><span>${t.gacha_log_pickup_ssr}</span></label>` : ''}
            </div>
            ${showDistributionGraphs ? `<div class="stat-row-bottom stat-total-body" style="border-top: 1px dashed #ccc; padding-top: 8px;">${normalGraph}</div>` : ''}
        </div>
        
        <div class="stat-category-header" data-target="produce">
            <span class="stat-category-title">${labels.p}</span>
            <div class="stat-category-rarities">
                ${rarityStat('SSR', initialProduceSsr, 'produce')}
                ${rarityStat('SR', stats.produce.SR, 'produce')}
                ${rarityStat('R', stats.produce.R, 'produce')}
            </div>
            <span class="toggle-icon">▼</span>
        </div>
        <div id="stat-produce-content" class="gacha-log-category-content hidden">
            ${showDistributionGraphs ? `<div class="stat-category-distribution">${produceGraph}</div>` : ''}
            <div id="gacha-log-produce-list" class="gacha-log-list"></div>
        </div>

        <div class="stat-category-header" data-target="support">
            <span class="stat-category-title">${labels.s}</span>
            <div class="stat-category-rarities">
                ${rarityStat('SSR', initialSupportSsr, 'support')}
                ${rarityStat('SR', stats.support.SR, 'support')}
                ${rarityStat('R', stats.support.R, 'support')}
            </div>
            <span class="toggle-icon">▼</span>
        </div>
        <div id="stat-support-content" class="gacha-log-category-content hidden">
            ${showDistributionGraphs ? `<div class="stat-category-distribution">${supportGraph}</div>` : ''}
            <div id="gacha-log-support-list" class="gacha-log-list"></div>
        </div>
    `;

    container.querySelectorAll('.stat-category-header').forEach(header => {
        header.onclick = () => {
            const content = document.getElementById(`stat-${header.dataset.target}-content`);
            if (content) {
                header.classList.toggle('active');
                content.classList.toggle('hidden');
            }
        };
    });

    const pickupToggle = container.querySelector('.stat-header-pickup input');
    if (pickupToggle) {
        pickupToggle.onchange = () => {
            const usePickup = pickupToggle.checked;
            setPickupFilterEnabled(usePickup);
            const observedByScope = {
                total: usePickup ? pickupObserved : stats.total.SSR,
                produce: usePickup ? producePickupObserved : stats.produce.SSR,
                support: usePickup ? supportPickupObserved : stats.support.SSR
            };
            Object.entries(observedByScope).forEach(([scope, count]) => {
                const statItem = container.querySelector(`[data-stat-scope="${scope}"][data-rarity="SSR"]`);
                if (!statItem) return;
                const value = statItem.querySelector('.stat-value');
                const percent = statItem.querySelector('.stat-percent');
                if (value) value.textContent = count;
                if (percent) percent.textContent = `(${getPerc(count)})`;
            });
            const graphConfigs = [
                { scope: 'total', probability: usePickup ? pickupProbability : ssrProbability, observed: usePickup ? pickupObserved : stats.total.SSR },
                { scope: 'produce', probability: usePickup ? producePickupProbability : produceProbability, observed: usePickup ? producePickupObserved : stats.produce.SSR },
                { scope: 'support', probability: usePickup ? supportPickupProbability : supportProbability, observed: usePickup ? supportPickupObserved : stats.support.SSR }
            ];
            graphConfigs.forEach(({ scope, probability, observed }) => {
                const distributionLayout = container.querySelector(`[data-distribution="${scope}"]`);
                if (distributionLayout) {
                    distributionLayout.outerHTML = renderSsrNormalGraph(totalPulls, probability, observed, scope);
                }
            });
        };
    }

}

function createLogItem(item, isPickup = false) {
    const el = document.createElement('div');
    const isProduce = item.type === 'produce';
    
    // 클래스 추가
    el.classList.add('log-item');
    el.classList.add(isProduce ? 'type-produce' : 'type-support');
    el.classList.add(`rarity-${item.displayRarity.toLowerCase()}`);
    if (isPickup) el.classList.add('is-pickup');

    // 이미지 생성
    const img = document.createElement('img');
    img.className = 'log-card-img'; // 클래스 추가
    if (isProduce) {
        img.src = `idols/thumb/${item.id}1.webp`;
        img.loading = 'lazy';
    } else {
        img.src = item.id.includes('dummy') ? 'icons/idol.png' : `images/support/thumb/${item.id}.webp`;
        img.loading = 'lazy';
    }
    el.appendChild(img);

    // 등급 배지 (이미지)
    const rarityBadge = document.createElement('img');
    const rKey = item.displayRarity.toLowerCase();
    rarityBadge.className = 'log-badge-rarity';
    rarityBadge.src = `icons/${rKey}.png`;
    el.appendChild(rarityBadge);

    // 개수 카운트 (2개 이상일 때만)
    if (item.count > 1) {
        const countBadge = document.createElement('div');
        countBadge.className = 'log-badge-count';
        countBadge.textContent = `x${item.count}`;
        el.appendChild(countBadge);
    }

    // 이름 오버레이
    const nameOverlay = document.createElement('div');
    nameOverlay.className = 'log-item-name-overlay';
    const nameText = getLocalizedCardName(item);
    nameOverlay.textContent = nameText;
    nameOverlay.title = nameText; // 마우스 오버 시 전체 이름 표시
    if (isPickup && item.displayRarity === 'SSR') {
        nameOverlay.style.color = '#d4a5ff';
    } else if (isPickup && item.displayRarity === 'SR') {
        nameOverlay.style.color = '#ffe082';
    }
    el.appendChild(nameOverlay);

    return el;
}
