// gacharates.js
import { state } from './state.js';
import { GACHA_STRATEGIES, getGachaPool } from './gachalist.js';
import { CURRENT_PICKUPS } from './gachaconfig.js';
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
    hiro_: { ko: '시노사와 히로', ja: '篠澤 莉波' },
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
    const strategy = GACHA_STRATEGIES[type] || GACHA_STRATEGIES.normal;
    const pool = getGachaPool(type);
    const config = CURRENT_PICKUPS[type] || {};
    
    // 키 맵핑 가이드 (gachalist.js의 혼란스러운 네이밍 대응)
    const rateKeys = {
        PSSR: 'PSSR', SSSR: 'SSSR', PSR: 'PSR', SR_CARD: 'SSR_CARD', PR: 'PR', R_CARD: 'R_CARD'
    };

    const typeName = lang === 'ja' ? 
        { normal:'恒常', limited:'限定', unit:'ユニット', fes:'フェス', platinum:'プラチナ', selection:'セレクション' }[type] || type : 
        typeDisplayNames[type] || type;
    
    if (title) title.textContent = typeName + " " + (translations[lang].rates_title || '가챠 확률 정보');

    const formatPercent = (val) => {
        const isMobile = window.innerWidth <= 768;
        return (val * 100).toFixed(isMobile ? 2 : 3) + "%";
    };

    // 개별 카드 확률 데이터 생성
    const getIndividualCardData = (rarityKey) => {
        const rarityPool = pool[rarityKey] || [];
        const poolSize = rarityPool.length;
        if (poolSize === 0) return [];

        const internalKey = rateKeys[rarityKey];
        const totalRate = strategy.rates[internalKey] || 0;
        const totalGuaranteed = strategy.guaranteed[internalKey] || 0;

        const pickups = (rarityKey === 'PSSR') ? (config.pssr || []) : 
                       (rarityKey === 'SSSR' ? (config.sssr || []) : 
                       (rarityKey === 'SR_CARD' ? (config.sr_card || []) : []));
        
        const pickupIds = pickups.map(p => typeof p === 'string' ? p : p.id);
        const pickupCards = rarityPool.filter(c => pickupIds.includes(c.id));
        const regularCards = rarityPool.filter(c => !pickupIds.includes(c.id));

        let results = [];

        // --- 확률 배분 핵심 로직 ---
        if (type === 'fes' && (rarityKey === 'PSSR' || rarityKey === 'SSSR')) {
            // 페스 가챠 (3단 배분)
            const isP = rarityKey === 'PSSR';
            const pickupTotal = isP ? 0.0075 : 0.01;
            const fesTotal = isP ? 0.015 : 0.01;
            const normalTotal = isP ? 0.0075 : 0.025;

            const fesCards = regularCards.filter(c => c.source === 'limited_f');
            const normalCards = regularCards.filter(c => c.source !== 'limited_f');

            const pRateN = pickupCards.length > 0 ? (pickupTotal / pickupCards.length) : 0;
            const fRateN = fesCards.length > 0 ? (fesTotal / fesCards.length) : 0;
            const nRateN = normalCards.length > 0 ? (normalTotal / normalCards.length) : 0;

            const gRatio = totalGuaranteed / totalRate;

            results = rarityPool.map(c => {
                let rN = 0;
                if (pickupIds.includes(c.id)) rN = pRateN;
                else if (c.source === 'limited_f') rN = fRateN;
                else rN = nRateN;
                return { card: c, nRate: rN, gRate: rN * gRatio };
            });
        } else {
            // 일반 / 유닛 / 셀렉션 가챠
            let pickupTotal = 0;
            if (rarityKey === 'PSSR') pickupTotal = (type === 'unit' ? 0.015 : 0.0075);
            else if (rarityKey === 'SSSR') pickupTotal = 0.01;
            else if (rarityKey === 'SR_CARD') pickupTotal = 0.04;

            const actualPickupTotal = pickupCards.length > 0 ? Math.min(pickupTotal, totalRate) : 0;
            const pRateN = actualPickupTotal / Math.max(1, pickupCards.length);
            const nRateN = (totalRate - actualPickupTotal) / Math.max(1, regularCards.length);

            // 확정 슬롯 비율 계산
            let pRateG = 0, nRateG = 0;
            if (totalGuaranteed > 0) {
                let pickupTotalG = (rarityKey === 'SR_CARD') ? 0.223529 : (actualPickupTotal * (totalGuaranteed / totalRate));
                pickupTotalG = Math.min(totalGuaranteed * 0.99, pickupTotalG);
                pRateG = pickupTotalG / Math.max(1, pickupCards.length);
                nRateG = (totalGuaranteed - pickupTotalG) / Math.max(1, regularCards.length);
            }

            results = rarityPool.map(c => {
                const isPk = pickupIds.includes(c.id);
                return { card: c, nRate: isPk ? pRateN : nRateN, gRate: isPk ? pRateG : nRateG };
            });
        }

        const isProduce = (rarityKey === 'PSSR' || rarityKey === 'PSR' || rarityKey === 'PR');

        return results.map(item => {
            const c = item.card;
            const isPk = pickupIds.includes(c.id);
            let name = (lang === 'ja' && c.name_ja) ? c.name_ja : c.name;
            if (c.another) name = (lang === 'ja' ? '[アナザー] ' : '[어나더] ') + name;
            return {
                card: c, name, isPk, rarity: rarityKey,
                charName: isProduce ? getCharName(c.id, lang) : "",
                releasedAt: c.releasedAt || "2024-05-16",
                normalRate: item.nRate,
                guaranteedRate: item.gRate
            };
        }).sort((a, b) => {
            // 1순위: 픽업 여부
            if (a.isPk !== b.isPk) return b.isPk - a.isPk;
            
            // 2순위: 페스 한정 여부 (source === 'limited_f')
            const isFesA = a.card.source === 'limited_f';
            const isFesB = b.card.source === 'limited_f';
            if (isFesA !== isFesB) return isFesB - isFesA;

            // 3순위: 출시일 (최신순)
            if (a.releasedAt !== b.releasedAt) return b.releasedAt.localeCompare(a.releasedAt);
            
            // 4순위: 이름순
            return a.name.localeCompare(b.name);
        });
    };

    // 대그룹 정의
    const mainGroups = [
        { id: 'SSR', label: 'SSR', subRarities: [
            { key: 'PSSR', label: 'PSSR' },
            { key: 'SSSR', label: 'SSR (Support)' }
        ]},
        { id: 'SR', label: 'SR', subRarities: [
            { key: 'PSR', label: 'PSR' },
            { key: 'SR_CARD', label: 'SR (Support)' }
        ]},
        { id: 'R', label: 'R', subRarities: [
            { key: 'PR', label: 'PR' },
            { key: 'R_CARD', label: 'R (Support)' }
        ]}
    ];

    body.innerHTML = `
        <table class="rates-table">
            <thead>
                <tr><th>등급</th><th>일반 확률</th><th>확정 슬롯</th></tr>
            </thead>
            <tbody id="rates-accordion-body">
                ${mainGroups.map(group => {
                    const totalN = group.subRarities.reduce((sum, r) => sum + (strategy.rates[rateKeys[r.key]] || 0), 0);
                    const totalG = group.subRarities.reduce((sum, r) => sum + (strategy.guaranteed[rateKeys[r.key]] || 0), 0);
                    
                    return `
                        <tr class="rate-row main-group expandable" data-target="group-${group.id}">
                            <td class="rarity-label rarity-${group.id.toLowerCase()}"><span class="expand-icon">▶</span> ${group.label}</td>
                            <td>${formatPercent(totalN)}</td>
                            <td>${totalG > 0 ? formatPercent(totalG) : '-'}</td>
                        </tr>
                        <tr class="sub-group-row hidden" id="group-${group.id}">
                            <td colspan="3" style="padding: 0;">
                                <table class="sub-rates-table">
                                    <tbody>
                                        ${group.subRarities.map(sub => {
                                            const subN = strategy.rates[rateKeys[sub.key]] || 0;
                                            const subG = strategy.guaranteed[rateKeys[sub.key]] || 0;
                                            const cards = getIndividualCardData(sub.key);
                                            
                                            // 등급 키 정규화
                                            let colorClass = sub.key.toLowerCase();
                                            if (colorClass === 'sr_card') colorClass = 'sr';
                                            if (colorClass === 'r_card') colorClass = 'r';

                                            return `
                                                <tr class="rate-row sub-group expandable" data-target="detail-${sub.key}">
                                                    <td class="sub-label rarity-${colorClass}"><span class="expand-icon">▶</span> ${sub.label}</td>
                                                    <td>${formatPercent(subN)}</td>
                                                    <td>${subG > 0 ? formatPercent(subG) : '-'}</td>
                                                </tr>
                                                <tr class="detail-row hidden" id="detail-${sub.key}">
                                                    <td colspan="3">
                                                        <div class="detail-container">
                                                            <div class="detail-header">
                                                                <span class="header-name">카드명</span>
                                                                <span class="header-rate">일반</span>
                                                                <span class="header-rate">확정</span>
                                                            </div>
                                                            <div class="detail-list">
                                                                ${cards.map(c => {
                                                                    if (!c || !c.card) return "";
                                                                    
                                                                    const rarity = c.rarity || "";
                                                                    const isSupport = rarity.includes('CARD') || rarity === 'SSSR';
                                                                    
                                                                    // 서포트 카드일 때만 이미지 태그 생성
                                                                    const imgTag = isSupport ? `<img src="images/support/${c.card.id}.webp" class="detail-card-img" onerror="this.style.display='none'" alt="">` : "";

                                                                    return `
                                                                        <div class="detail-item ${c.isPk ? 'is-pickup' : ''}">
                                                                            <div class="detail-name-row">
                                                                                ${imgTag}
                                                                                <div class="detail-name-wrapper">
                                                                                    <span class="detail-name">${c.isPk ? '[PICKUP] ' : ''}${c.name}</span>
                                                                                    ${c.charName ? `<span class="detail-char-name">${c.charName}</span>` : ""}
                                                                                </div>
                                                                            </div>
                                                                            <div class="detail-rate-group">
                                                                                <span class="detail-rate">${formatPercent(c.normalRate)}</span>
                                                                                <span class="detail-rate">${c.guaranteedRate > 0 ? formatPercent(c.guaranteedRate) : '-'}</span>
                                                                            </div>
                                                                        </div>
                                                                    `;
                                                                }).join('')}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div class="rates-footer">
            <p class="rates-notice">* 등급 이름을 클릭하면 상세 항목을 볼 수 있습니다.</p>
            <p class="rates-notice">* 확정 슬롯은 10회 뽑기의 마지막 1회에 적용되는 확률입니다.</p>
        </div>
    `;

    // 아코디언 이벤트 연결 및 툴팁 초기화
    const setupEvents = () => {
        // 1. 툴팁 요소 준비
        let tooltip = document.getElementById('card-preview-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'card-preview-tooltip';
            tooltip.innerHTML = '<img src="" alt="">';
            document.body.appendChild(tooltip);
        }
        const tooltipImg = tooltip.querySelector('img');

        // 2. 아코디언 열기/닫기 (위임 방식)
        const accordionBody = body.querySelector('#rates-accordion-body');
        accordionBody.addEventListener('click', (e) => {
            const row = e.target.closest('.expandable');
            if (!row) return;
            const targetId = row.dataset.target;
            const target = body.querySelector(`#${targetId}`);
            const icon = row.querySelector('.expand-icon');
            if (target.classList.contains('hidden')) {
                target.classList.remove('hidden');
                icon.textContent = '▼';
                row.classList.add('expanded');
            } else {
                target.classList.add('hidden');
                icon.textContent = '▶';
                row.classList.remove('expanded');
                if (row.classList.contains('main-group')) {
                    target.querySelectorAll('.sub-group-row, .detail-row').forEach(el => el.classList.add('hidden'));
                    target.querySelectorAll('.expanded').forEach(el => el.classList.remove('expanded'));
                    target.querySelectorAll('.expand-icon').forEach(i => i.textContent = '▶');
                }
            }
        });

        // 3. 이미지 미리보기 툴팁 (PC 마우스 오버 / 모바일 터치)
        let autoCloseTimer = null;
        const hideTooltip = () => {
            tooltip.style.opacity = '0';
            setTimeout(() => { if(tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 150);
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
        };

        accordionBody.addEventListener('mouseover', (e) => {
            if (window.innerWidth <= 768) return; 
            const img = e.target.closest('.detail-card-img');
            if (!img) return;
            tooltipImg.src = img.src;
            tooltip.style.display = 'block';
            setTimeout(() => tooltip.style.opacity = '1', 10);
        });

        accordionBody.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            if (tooltip.style.display === 'block') {
                const offset = 20;
                let x = e.clientX + offset;
                let y = e.clientY + offset;
                if (x + 260 > window.innerWidth) x = e.clientX - 260 - offset;
                if (y + 200 > window.innerHeight) y = e.clientY - 200 - offset;
                tooltip.style.left = x + 'px';
                tooltip.style.top = y + 'px';
            }
        });

        accordionBody.addEventListener('mouseout', (e) => {
            if (window.innerWidth <= 768) return;
            const img = e.target.closest('.detail-card-img');
            if (!img) return;
            hideTooltip();
        });

        // 모바일 전용: 터치 시 툴팁 표시
        accordionBody.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return; // PC는 제외
            const img = e.target.closest('.detail-card-img');
            if (!img) {
                hideTooltip(); // 이미지 외 클릭 시 닫기
                return;
            }

            e.stopPropagation(); // 아코디언 열림 방지 (이미지 클릭 시)
            
            tooltipImg.src = img.src;
            tooltip.style.display = 'block';
            tooltip.style.left = '50%';
            tooltip.style.top = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            setTimeout(() => tooltip.style.opacity = '1', 10);

            // 2초 후 자동 닫기
            if (autoCloseTimer) clearTimeout(autoCloseTimer);
            autoCloseTimer = setTimeout(hideTooltip, 2000);
        });

        // 다른 터치나 스크롤 시 닫기
        window.addEventListener('touchstart', (e) => {
            if (!e.target.closest('#card-preview-tooltip') && !e.target.closest('.detail-card-img')) {
                hideTooltip();
            }
        }, { passive: true });

        modal.addEventListener('scroll', hideTooltip, { passive: true });
    };

    setupEvents();

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
