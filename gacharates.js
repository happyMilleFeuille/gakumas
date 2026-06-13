// gacharates.js
import { state } from './state.js';
import { getActiveGachaConfig, getDisplayStrategy, getGachaPool, getRarityRateEntries } from './gachalist.js';
import { produceList } from './producedata.js';
import translations from './i18n.js';

const useJaNames = (lang) => lang !== 'ko';





const charNameMap = {
    rinami_: 'idol_fullname_rinami',
    saki_: 'idol_fullname_saki',
    china_: 'idol_fullname_china',
    sumika_: 'idol_fullname_sumika',
    mao_: 'idol_fullname_mao',
    kotone_: 'idol_fullname_kotone',
    temari_: 'idol_fullname_temari',
    lilja_: 'idol_fullname_lilja',
    hiro_: 'idol_fullname_hiro',
    tsubame_: 'idol_fullname_tsubame',
    sena_: 'idol_fullname_sena',
    ume_: 'idol_fullname_ume',
    misuzu_: 'idol_fullname_misuzu'
};

const getCharName = (id, lang) => {
    const key = Object.keys(charNameMap).find(k => id.includes(k));
    if (!key) return "";
    const nameKey = charNameMap[key];
    return translations[lang]?.[nameKey] || translations.ko?.[nameKey] || "";
};

const getCardDisplayName = (card, lang) => {
    if (!card) return "";
    if (lang === 'en' && card.name_en) return card.name_en;
    return (useJaNames(lang) && card.name_ja) ? card.name_ja : (card.name || "");
};

const getConfigDisplayName = (configEntry, fallbackCard, lang) => {
    if (lang === 'en' && configEntry?.name_en) return configEntry.name_en;
    if (useJaNames(lang) && configEntry?.name_ja) return configEntry.name_ja;
    if (useJaNames(lang) && fallbackCard?.name_ja) return fallbackCard.name_ja;
    return configEntry?.name || fallbackCard?.name || "";
};

export function openGachaRatesModal() {
    const modal = document.getElementById('gacha-rates-modal');
    const body = document.getElementById('gacha-rates-body');
    const title = document.getElementById('rates-modal-title');
    if (!modal || !body) return;

    const lang = state.currentLang;
    const t = translations[lang];
    const type = state.gachaType;
    let strategy = getDisplayStrategy(type);
    const pool = getGachaPool(type);

    let activeConfig = getActiveGachaConfig(type) || {};
    let config = {};
    let activeName = "";

    if (type === 'selection') {
        config = activeConfig?.pool || { pssr: [] };
        activeName = getConfigDisplayName(activeConfig, null, lang);
    } else if (type === 'normal') {
        config = activeConfig?.pool || config;
        const firstPSSR = config.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        activeName = getCardDisplayName(cardData, lang);
    } else if (type === 'limited') {
        config = activeConfig?.pool || config;
        const firstPSSR = config.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        activeName = getCardDisplayName(cardData, lang);
    } else if (type === 'unit') {
        config = activeConfig?.pool || config;
        const firstPSSR = config.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        activeName = getConfigDisplayName(activeConfig, cardData, lang);
    } else if (type === 'fes') {
        config = activeConfig?.pool || config;
        const firstPSSR = config.pssr?.[0];
        const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        activeName = getConfigDisplayName(activeConfig, cardData, lang);
    }

    const rateKeys = { PSSR: 'PSSR', SSSR: 'SSSR', PSR: 'PSR', SR_CARD: 'SSR_CARD', PR: 'PR', R_CARD: 'R_CARD' };
    
    // i18n.js에 있는 gacha_type_ 키를 활용하여 안전하게 타입 이름 결정
    const i18nKey = `gacha_type_${type}`;
    const typeName = t[i18nKey] || type;

    const titleSuffix = activeName ? ` (${activeName})` : "";
    if (title) title.textContent = typeName + titleSuffix + " " + t.rates_title;

    const formatPercent = (val) => {
        return (val * 100).toFixed(3) + "%";
    };

    const getIndividualCardData = (rarityKey) => {
        const rarityPool = pool[rarityKey] || [];
        if (rarityPool.length === 0) return [];

        const results = getRarityRateEntries(rarityKey, { poolType: type, activeConfig, strategy, pool });

        const isProduce = (rarityKey === 'PSSR' || rarityKey === 'PSR' || rarityKey === 'PR');
        return results.map(item => {
            const c = item.card;
            const isPk = item.isPickup;
            let n = getCardDisplayName(c, lang);
            if (c.another) n = `${t.gacha_another_prefix || '[Another] '}${n}`;
            return { card: c, name: n, isPk, rarity: rarityKey, charName: isProduce ? getCharName(c.id, lang) : "", releasedAt: c.releasedAt || "2024-05-16", normalRate: item.normalRate, guaranteedRate: item.guaranteedRate };
        }).sort((a, b) => (b.isPk - a.isPk) || (b.card.source === 'limited_f' ? 1 : 0) - (a.card.source === 'limited_f' ? 1 : 0) || b.releasedAt.localeCompare(a.releasedAt) || a.name.localeCompare(b.name));
    };

    const mainGroups = [
        { id: 'SSR', label: 'SSR', subRarities: [{ key: 'PSSR', label: 'PSSR' }, { key: 'SSSR', label: 'SSR (Support)' }] },
        { id: 'SR', label: 'SR', subRarities: [{ key: 'PSR', label: 'PSR' }, { key: 'SR_CARD', label: 'SR (Support)' }] },
        { id: 'R', label: 'R', subRarities: [{ key: 'PR', label: 'PR' }, { key: 'R_CARD', label: 'R (Support)' }] }
    ];

    body.innerHTML = `
        <table class="rates-table">
            <thead><tr><th>${t.gacha_rates_header_rarity}</th><th>${t.gacha_rates_header_normal}</th><th>${t.gacha_rates_header_guaranteed}</th></tr></thead>
            <tbody id="rates-accordion-body">
                ${mainGroups.map(group => {
                    const tN = group.subRarities.reduce((s, r) => s + (strategy.rates[rateKeys[r.key]] || 0), 0), tG = group.subRarities.reduce((s, r) => s + (strategy.guaranteed[rateKeys[r.key]] || 0), 0);

                    return `<tr class="rate-row main-group expandable" data-target="group-${group.id}"><td class="rarity-label rarity-${group.id.toLowerCase()}"><span class="expand-icon">▶</span> ${group.label}</td><td>${formatPercent(tN)}</td><td>${tG > 0 ? formatPercent(tG) : '-'}</td></tr>
                        <tr class="sub-group-row hidden" id="group-${group.id}"><td colspan="3" style="padding: 0;"><table class="sub-rates-table"><tbody>
                            ${group.subRarities.map(sub => {
                                const sN = strategy.rates[rateKeys[sub.key]] || 0, sG = strategy.guaranteed[rateKeys[sub.key]] || 0, cards = getIndividualCardData(sub.key);
                                let cC = sub.key.toLowerCase(); if (cC === 'sr_card') cC = 'sr'; if (cC === 'r_card') cC = 'r';
                                return `<tr class="rate-row sub-group expandable" data-target="detail-${sub.key}"><td class="sub-label rarity-${cC}"><span class="expand-icon">▶</span> ${sub.label}</td><td>${formatPercent(sN)}</td><td>${sG > 0 ? formatPercent(sG) : '-'}</td></tr>
                                    <tr class="detail-row hidden" id="detail-${sub.key}"><td colspan="3"><div class="detail-container"><div class="detail-header"><span class="header-name">${t.gacha_rates_header_name}</span><span class="header-rate">${t.gacha_rates_header_normal}</span><span class="header-rate">${t.gacha_rates_header_guaranteed}</span></div>
                                    <div class="detail-list">${cards.map(c => {
                                        if (!c || !c.card) return "";
                                        const isSupport = c.rarity.includes('CARD') || c.rarity === 'SSSR', imgTag = isSupport ? `<img src="images/support/thumb/${c.card.id}.webp" class="detail-card-img" data-card-id="${c.card.id}" onerror="this.style.display='none'" alt="">` : "";
                                        const isPk = c.isPk && !config.isOnlyPool;
                                        const pkClass = isPk ? 'is-pickup' : '';
                                        const displayNormalRate = c.normalRate > 0.000001 ? formatPercent(c.normalRate) : '-';
                                        const displayGuaranteedRate = c.guaranteedRate > 0.000001 ? formatPercent(c.guaranteedRate) : '-';
                                        return `<div class="detail-item ${pkClass}"><div class="detail-name-row">${imgTag}<div class="detail-name-wrapper"><span class="detail-name">${isPk ? (t.gacha_pickup_prefix || '[PICKUP] ') : ''}${c.name}</span>${c.charName ? `<span class="detail-char-name">${c.charName}</span>` : ""}</div></div><div class="detail-rate-group"><span class="detail-rate">${displayNormalRate}</span><span class="detail-rate">${displayGuaranteedRate}</span></div></div>`;
                                    }).join('')}</div></div></td></tr>`;
                            }).join('')}</tbody></table></td></tr>`;
                }).join('')}
            </tbody>
        </table>
        <div class="rates-footer"><p class="rates-notice">${t.gacha_rates_notice_1}</p><p class="rates-notice">${t.gacha_rates_notice_2}</p></div>
    `;

    const setupEvents = () => {
        let tooltip = document.getElementById('card-preview-tooltip');
        if (!tooltip) { 
            tooltip = document.createElement('div'); 
            tooltip.id = 'card-preview-tooltip'; 
            tooltip.innerHTML = '<img src="" alt="">'; 
            tooltip.style.transition = 'none'; // GPU 컴포지팅 화질 저하 방지
            document.body.appendChild(tooltip); 
        }
        const tImg = tooltip.querySelector('img'), accordionBody = body.querySelector('#rates-accordion-body');
        accordionBody.addEventListener('click', (e) => {
            const row = e.target.closest('.expandable'); if (!row) return;
            const targetId = row.dataset.target, target = body.querySelector(`#${targetId}`), icon = row.querySelector('.expand-icon');
            if (target.classList.contains('hidden')) { target.classList.remove('hidden'); icon.textContent = '▼'; row.classList.add('expanded'); }
            else { target.classList.add('hidden'); icon.textContent = '▶'; row.classList.remove('expanded');
                if (row.classList.contains('main-group')) { target.querySelectorAll('.sub-group-row, .detail-row').forEach(el => el.classList.add('hidden')); target.querySelectorAll('.expanded').forEach(el => el.classList.remove('expanded')); target.querySelectorAll('.expand-icon').forEach(i => i.textContent = '▶'); }
            }
        });
        const hideTooltip = () => { tooltip.style.opacity = '0'; setTimeout(() => { if(tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 150); };
        accordionBody.addEventListener('mouseover', (e) => { 
            if (window.innerWidth <= 768) return; 
            const img = e.target.closest('.detail-card-img'); 
            if (!img) return; 
            const cardId = img.dataset.cardId;
            tImg.onload = () => { tooltip.style.opacity = '1'; };
            tImg.onerror = () => {
                // 고해상도 이미지 로드 실패 시 섬네일로 폴백
                tImg.src = img.src; 
                tImg.onload = () => { tooltip.style.opacity = '1'; };
                tImg.onerror = () => { tooltip.style.display = 'none'; };
            };
            tImg.src = `images/support/${cardId}.webp`; // 툴팁은 원본 고해상도 카드 이미지 사용
            tooltip.style.display = 'block'; 
        });
        accordionBody.addEventListener('mousemove', (e) => { 
            if (window.innerWidth <= 768 || tooltip.style.display !== 'block') return; 
            const offset = 20; 
            let x = e.clientX + offset, y = e.clientY + offset; 
            if (x + 310 > window.innerWidth) x = e.clientX - 310 - offset; 
            if (y + 185 > window.innerHeight) y = e.clientY - 185 - offset; 
            tooltip.style.left = x + 'px'; 
            tooltip.style.top = y + 'px'; 
        });
        accordionBody.addEventListener('mouseout', (e) => { if (window.innerWidth <= 768) return; if (e.target.closest('.detail-card-img')) hideTooltip(); });
        modal.addEventListener('scroll', hideTooltip, { passive: true });
    };
    setupEvents();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
