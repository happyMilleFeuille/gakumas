// gacharates.js
import { state } from './state.js';
import { GACHA_STRATEGIES, getGachaPool } from './gachalist.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import translations from './i18n.js';

const typeDisplayNames = {
    normal: '통상', limited: '한정', unit: '유닛', fes: '페스', platinum: '플래티넘', selection: '셀렉션'
};

const charNameMap = {
    rinami_: { ko: '히메사키 리나미', ja: '姫崎 莉波' },
    saki_: { ko: '하나미 사키', ja: '花海 咲季' },
    china_: { ko: '쿠라모토 치나', ja: '倉本 千奈' },
    sumika_: { ko: '시운 스미카', ja: '紫雲 清夏' },
    mao_: { ko: '아리무라 마오', ja: '有村 麻央' },
    kotone_: { ko: '후지타 코토네', ja: '藤田 ことね' },
    temari_: { ko: '츠키무라 테마리', ja: '月村 手毬' },
    lilja_: { ko: '카츠라기 릴리야', ja: '葛城 リーリヤ' },
    hiro_: { ko: '시노사와 히로', ja: '篠澤 広' },
    tsubame_: { ko: '아마야 츠바메', ja: '雨夜 燕' },
    sena_: { ko: '쥬오 세나', ja: '十王 星南' },
    ume_: { ko: '하나미 우메', ja: '花海 佑芽' },
    misuzu_: { ko: '하타야 미스즈', ja: '秦谷 美鈴' }
};

const getCharName = (id, lang) => {
    const key = Object.keys(charNameMap).find(k => id.includes(k));
    if (!key) return "";
    return charNameMap[key][lang] || charNameMap[key]['ko'];
};

export function openGachaRatesModal() {
    const modal = document.getElementById('gacha-rates-modal');
    const body = document.getElementById('gacha-rates-body');
    const title = document.getElementById('rates-modal-title');
    if (!modal || !body) return;

    const lang = state.currentLang;
    const type = state.gachaType;
    let strategy = { ...(GACHA_STRATEGIES[type] || GACHA_STRATEGIES.normal) };
    const pool = getGachaPool(type);

    let config = CURRENT_PICKUPS[type] || {};
    let activeName = "";

    if (type === 'selection') {
        const sel = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
        if (sel) {
            config = sel.pool || { pssr: [] };
            activeName = sel.name;
            config.isOnlyPool = !!sel.only_pool_pssr;
            if (sel.ssr_guaranteed) {
                strategy.guaranteed = { PSSR: 0.4, SSSR: 0.6, PSR: 0, SSR_CARD: 0, PR: 0, R_CARD: 0 };
            }
        }
    } else if (type === 'normal') {
        const norm = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        if (norm) {
            config = norm.pool || config;
            const firstPSSR = config.pssr?.[0];
            const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
            const cardData = produceList.find(c => c.id === pid);
            activeName = (lang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || "");
        }
    } else if (type === 'limited') {
        const lim = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        if (lim) {
            config = lim.pool || config;
            const firstPSSR = config.pssr?.[0];
            const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
            const cardData = produceList.find(c => c.id === pid);
            activeName = (lang === 'ja' && cardData?.name_ja) ? cardData.name_ja : (cardData?.name || "");
        }
    } else if (type === 'unit') {
        const unt = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        if (unt) {
            config = unt.pool || config;
            const firstPSSR = config.pssr?.[0];
            const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
            const cardData = produceList.find(c => c.id === pid);
            activeName = unt.name || (lang === 'ja' && cardData?.name_ja ? cardData.name_ja : cardData?.name) || "";
        }
    } else if (type === 'fes') {
        const fes = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
        if (fes) {
            config = fes.pool || config;
            const firstPSSR = config.pssr?.[0];
            const pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
            const cardData = produceList.find(c => c.id === pid);
            activeName = fes.name || (lang === 'ja' && cardData?.name_ja ? cardData.name_ja : cardData?.name) || "";
        }
    }

    const rateKeys = { PSSR: 'PSSR', SSSR: 'SSSR', PSR: 'PSR', SR_CARD: 'SSR_CARD', PR: 'PR', R_CARD: 'R_CARD' };
    const typeName = lang === 'ja' ? 
        { normal:'恒常', limited:'限定', unit:'ユニット', fes:'フェス', platinum:'プラチナ', selection:'セレクション' }[type] || type : 
        typeDisplayNames[type] || type;

    const titleSuffix = activeName ? ` (${activeName})` : "";
    if (title) title.textContent = typeName + titleSuffix + " " + (translations[lang].rates_title || '가챠 확률 정보');

    const formatPercent = (val) => {
        const isMobile = window.innerWidth <= 768;
        return (val * 100).toFixed(isMobile ? 2 : 3) + "%";
    };

    const getIndividualCardData = (rarityKey) => {
        const rarityPool = pool[rarityKey] || [];
        if (rarityPool.length === 0) return [];

        const internalKey = rateKeys[rarityKey];
        const totalRate = strategy.rates[internalKey] || 0;
        const totalGuaranteed = strategy.guaranteed[internalKey] || 0;

        const pickups = (rarityKey === 'PSSR') ? (config.pssr || config.pool?.pssr || []) : 
                       (rarityKey === 'SSSR' ? (config.sssr || config.pool?.sssr || []) : 
                       (rarityKey === 'SR_CARD' ? (config.sr_card || config.pool?.sr_card || []) : []));
        
        const pickupIds = pickups.map(p => typeof p === 'string' ? p : p.id);
        const pickupCards = rarityPool.filter(c => pickupIds.includes(c.id));
        const regularCards = rarityPool.filter(c => !pickupIds.includes(c.id));

        let results = [];

        if (config.isOnlyPool) {
            const nRate = totalRate / rarityPool.length;
            const gRate = totalGuaranteed / rarityPool.length;
            results = rarityPool.map(c => ({ card: c, nRate, gRate, forceNoPk: true }));
        } else if (type === 'fes' && (rarityKey === 'PSSR' || rarityKey === 'SSSR')) {
            const isP = rarityKey === 'PSSR';
            const pTotal = isP ? 0.0075 : 0.01, fTotal = isP ? 0.015 : 0.01, nTotal = isP ? 0.0075 : 0.025;
            const fesCards = regularCards.filter(c => c.source === 'limited_f'), normalCards = regularCards.filter(c => c.source !== 'limited_f');
            const pRN = pickupCards.length > 0 ? (pTotal / pickupCards.length) : 0;
            const fRN = fesCards.length > 0 ? (fTotal / fesCards.length) : 0;
            const nRN = normalCards.length > 0 ? (nTotal / normalCards.length) : 0;
            const gRatio = totalGuaranteed / totalRate;
            results = rarityPool.map(c => {
                let rN = pickupIds.includes(c.id) ? pRN : (c.source === 'limited_f' ? fRN : nRN);
                return { card: c, nRate: rN, gRate: rN * gRatio };
            });
        } else {
            let pTotal = 0;
            if (rarityKey === 'PSSR') {
                // 유닛 가챠 PSSR: 캐릭터당 고정 0.75%
                const singlePkRate = 0.0075;
                pTotal = singlePkRate * pickupCards.length;
            }
            else if (rarityKey === 'SSSR') {
                // SSSR: 카드당 1.0% (유닛 가챠 특성 유지)
                pTotal = 0.01 * pickupCards.length;
            }
            else if (rarityKey === 'SR_CARD') {
                // SR 서포트: 카드당 4.0%
                pTotal = 0.04 * pickupCards.length;
            }
            
            // 픽업 총 확률 결정 (전체 확률을 넘지 않음)
            const actualPTotal = pickupCards.length > 0 ? Math.min(pTotal, totalRate) : 0;
            const pRN = actualPTotal / Math.max(1, pickupCards.length);
            
            // 남은 확률(픽뚫) 계산: 전체 확률에서 픽업 합계를 뺀 나머지를 일반 카드들에게 배분
            let nRN = 0;
            if (regularCards.length > 0) {
                nRN = Math.max(0, totalRate - actualPTotal) / regularCards.length;
            } else if (pickupCards.length > 0 && actualPTotal < totalRate) {
                // 만약 일반 카드가 없는데 확률이 남는 특수 상황(거의 없음)이면 픽업에 합산
                const bonus = (totalRate - actualPTotal) / pickupCards.length;
                // 이 경우 pRN에 더해줌 (아래 결과 매핑 시 적용)
            }

            let pRG = 0, nRG = 0;
            if (totalGuaranteed > 0) {
                // 확정 슬롯 확률 배분
                let pTG = (rarityKey === 'SR_CARD') ? Math.min(0.223529 * pickupCards.length, totalGuaranteed) : (actualPTotal * (totalGuaranteed / totalRate));
                
                if (totalGuaranteed - pTG < 0.00001) {
                    pTG = totalGuaranteed;
                    nRG = 0;
                } else if (regularCards.length > 0) {
                    nRG = (totalGuaranteed - pTG) / regularCards.length;
                }
                
                pRG = pTG / Math.max(1, pickupCards.length);
            }
            results = rarityPool.map(c => {
                const isPk = pickupIds.includes(c.id);
                // 일반 카드가 없을 때 남는 확률 보정 포함
                const finalPRN = (isPk && regularCards.length === 0) ? totalRate / pickupCards.length : pRN;
                return { card: c, nRate: isPk ? finalPRN : nRN, gRate: isPk ? pRG : nRG };
            });
        }

        const isProduce = (rarityKey === 'PSSR' || rarityKey === 'PSR' || rarityKey === 'PR');
        return results.map(item => {
            const c = item.card, isPk = item.forceNoPk ? false : pickupIds.includes(c.id);
            let n = (lang === 'ja' && c.name_ja) ? c.name_ja : c.name;
            if (c.another) n = (lang === 'ja' ? '[アナザー] ' : '[어나더] ') + n;
            return { card: c, name: n, isPk, rarity: rarityKey, charName: isProduce ? getCharName(c.id, lang) : "", releasedAt: c.releasedAt || "2024-05-16", normalRate: item.nRate, guaranteedRate: item.gRate };
        }).sort((a, b) => (b.isPk - a.isPk) || (b.card.source === 'limited_f' ? 1 : 0) - (a.card.source === 'limited_f' ? 1 : 0) || b.releasedAt.localeCompare(a.releasedAt) || a.name.localeCompare(b.name));
    };

    const mainGroups = [
        { id: 'SSR', label: 'SSR', subRarities: [{ key: 'PSSR', label: 'PSSR' }, { key: 'SSSR', label: 'SSR (Support)' }] },
        { id: 'SR', label: 'SR', subRarities: [{ key: 'PSR', label: 'PSR' }, { key: 'SR_CARD', label: 'SR (Support)' }] },
        { id: 'R', label: 'R', subRarities: [{ key: 'PR', label: 'PR' }, { key: 'R_CARD', label: 'R (Support)' }] }
    ];

    body.innerHTML = `
        <table class="rates-table">
            <thead><tr><th>등급</th><th>일반 확률</th><th>확정 슬롯</th></tr></thead>
            <tbody id="rates-accordion-body">
                ${mainGroups.map(group => {
                    const tN = group.subRarities.reduce((s, r) => s + (strategy.rates[rateKeys[r.key]] || 0), 0), tG = group.subRarities.reduce((s, r) => s + (strategy.guaranteed[rateKeys[r.key]] || 0), 0);
                    return `<tr class="rate-row main-group expandable" data-target="group-${group.id}"><td class="rarity-label rarity-${group.id.toLowerCase()}"><span class="expand-icon">▶</span> ${group.label}</td><td>${formatPercent(tN)}</td><td>${tG > 0 ? formatPercent(tG) : '-'}</td></tr>
                        <tr class="sub-group-row hidden" id="group-${group.id}"><td colspan="3" style="padding: 0;"><table class="sub-rates-table"><tbody>
                            ${group.subRarities.map(sub => {
                                const sN = strategy.rates[rateKeys[sub.key]] || 0, sG = strategy.guaranteed[rateKeys[sub.key]] || 0, cards = getIndividualCardData(sub.key);
                                let cC = sub.key.toLowerCase(); if (cC === 'sr_card') cC = 'sr'; if (cC === 'r_card') cC = 'r';
                                return `<tr class="rate-row sub-group expandable" data-target="detail-${sub.key}"><td class="sub-label rarity-${cC}"><span class="expand-icon">▶</span> ${sub.label}</td><td>${formatPercent(sN)}</td><td>${sG > 0 ? formatPercent(sG) : '-'}</td></tr>
                                    <tr class="detail-row hidden" id="detail-${sub.key}"><td colspan="3"><div class="detail-container"><div class="detail-header"><span class="header-name">${lang === 'ja' ? '名前' : '이름'}</span><span class="header-rate">${lang === 'ja' ? '通常' : '일반'}</span><span class="header-rate">${lang === 'ja' ? '確定' : '확정'}</span></div>
                                    <div class="detail-list">${cards.map(c => {
                                        if (!c || !c.card) return "";
                                        const isSupport = c.rarity.includes('CARD') || c.rarity === 'SSSR', imgTag = isSupport ? `<img src="images/support/${c.card.id}.webp" class="detail-card-img" onerror="this.style.display='none'" alt="">` : "";
                                        const isPk = c.isPk && !config.isOnlyPool;
                                        const pkClass = isPk ? 'is-pickup' : '';
                                        const displayNormalRate = c.normalRate > 0.000001 ? formatPercent(c.normalRate) : '-';
                                        const displayGuaranteedRate = c.guaranteedRate > 0.000001 ? formatPercent(c.guaranteedRate) : '-';
                                        return `<div class="detail-item ${pkClass}"><div class="detail-name-row">${imgTag}<div class="detail-name-wrapper"><span class="detail-name">${isPk ? '[PICKUP] ' : ''}${c.name}</span>${c.charName ? `<span class="detail-char-name">${c.charName}</span>` : ""}</div></div><div class="detail-rate-group"><span class="detail-rate">${displayNormalRate}</span><span class="detail-rate">${displayGuaranteedRate}</span></div></div>`;
                                    }).join('')}</div></div></td></tr>`;
                            }).join('')}</tbody></table></td></tr>`;
                }).join('')}
            </tbody>
        </table>
        <div class="rates-footer"><p class="rates-notice">* 등급 이름을 클릭하면 상세 항목을 볼 수 있습니다.</p><p class="rates-notice">* 확정 슬롯은 10회 뽑기의 마지막 1회에 적용되는 확률입니다.</p></div>
    `;

    const setupEvents = () => {
        let tooltip = document.getElementById('card-preview-tooltip');
        if (!tooltip) { tooltip = document.createElement('div'); tooltip.id = 'card-preview-tooltip'; tooltip.innerHTML = '<img src="" alt="">'; document.body.appendChild(tooltip); }
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
        accordionBody.addEventListener('mouseover', (e) => { if (window.innerWidth <= 768) return; const img = e.target.closest('.detail-card-img'); if (!img) return; tImg.src = img.src; tooltip.style.display = 'block'; setTimeout(() => tooltip.style.opacity = '1', 10); });
        accordionBody.addEventListener('mousemove', (e) => { if (window.innerWidth <= 768 || tooltip.style.display !== 'block') return; const offset = 20; let x = e.clientX + offset, y = e.clientY + offset; if (x + 260 > window.innerWidth) x = e.clientX - 260 - offset; if (y + 200 > window.innerHeight) y = e.clientY - 200 - offset; tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px'; });
        accordionBody.addEventListener('mouseout', (e) => { if (window.innerWidth <= 768) return; if (e.target.closest('.detail-card-img')) hideTooltip(); });
        modal.addEventListener('scroll', hideTooltip, { passive: true });
    };
    setupEvents();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
