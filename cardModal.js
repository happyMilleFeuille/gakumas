// cardModal.js
import { state, setSupportLB, idolColors } from './state.js';
import { abilityData } from './abilitydata.js';
import translations from './i18n.js';
import { showSupportItemTooltip } from './calcUI.js';
import { FES_CONFIG, UNIT_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';

const getLocalizedName = (item) => {
    if (!item) return '';
    if (state.currentLang === 'en' && item.name_en) return item.name_en;
    if (state.currentLang === 'ja' && item.name_ja) return item.name_ja;
    return item.name || '';
};

const normalizePoolIds = (entries = []) => entries.map(entry => typeof entry === 'string' ? entry : entry?.id).filter(Boolean);

const getSourceDetailLabel = (detail) => {
    if (detail !== 'sale') return '';
    if (state.currentLang === 'ja') return '販売';
    if (state.currentLang === 'en') return 'sale';
    return '판매';
};

const getProduceChar = (entry) => {
    if (!entry) return '';
    if (typeof entry !== 'string' && entry.char) return entry.char;

    const id = typeof entry === 'string' ? entry : entry.id;
    const charIds = ['rinami', 'saki', 'china', 'sumika', 'mao', 'kotone', 'temari', 'lilja', 'hiro', 'tsubame', 'sena', 'ume', 'misuzu'];
    return charIds.find(charId => id?.startsWith(`ssr${charId}`)) || '';
};

const normalizeCardChars = (chars) => {
    if (!chars) return [];
    return [...new Set((Array.isArray(chars) ? chars : [chars]).filter(Boolean))];
};

const getSupportGachaInfo = (cardId) => {
    const configs = [...FES_CONFIG, ...UNIT_CONFIG, ...NORMAL_CONFIG, ...LIMITED_CONFIG];
    const matchedConfigs = configs.filter(config => {
        const supportIds = [
            ...normalizePoolIds(config.pool?.sssr),
            ...normalizePoolIds(config.pool?.sr_card)
        ];
        return supportIds.includes(cardId);
    });
    if (matchedConfigs.length === 0) return { name: '', chars: [] };

    const chars = [...new Set(matchedConfigs.flatMap(config =>
        (config.pool?.pssr || []).map(entry => getProduceChar(entry)).filter(Boolean)
    ))];

    const names = matchedConfigs.map(config => {
        const configName = getLocalizedName(config);
        if (configName) return configName;

        const pssrId = normalizePoolIds(config.pool?.pssr)[0];
        const pssrName = getLocalizedName(produceList.find(card => card.id === pssrId));

        return pssrName || config.id;
    });

    return { name: names.find(Boolean) || '', chars };
};

// 모달 표시 함수
export function showCardModal(card, displayName, imgSrc) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    // 초기 상태 저장 (닫을 때 변화 감지용)
    window._modalCardId = card.id;
    window._modalInitialLB = state.supportLB[card.id] || 0;

    const mImg = document.getElementById('modal-img');
    const mTitle = document.getElementById('modal-title');
    const mRarity = document.getElementById('modal-rarity');
    const mPlan = document.getElementById('modal-plan');
    const mType = document.getElementById('modal-type');
    const mReleaseDate = document.getElementById('modal-release-date');
    const mSource = document.getElementById('modal-source');
    const mGachaName = document.getElementById('modal-gacha-name');
    const mExtraIcon = document.getElementById('modal-extra-icon');
    const mExtra1 = document.getElementById('modal-extra-1');
    const mExtra2 = document.getElementById('modal-extra-2');
    const mAbilities = document.getElementById('modal-abilities');
    const stars = document.querySelectorAll('.star');

    mImg.src = imgSrc;
    mTitle.textContent = displayName;
    mRarity.src = `icons/${card.rarity.toLowerCase()}.png`;
    mPlan.src = `icons/${(card.plan || 'free').toLowerCase()}.webp`;
    mType.src = `icons/${card.type.toLowerCase()}.webp`;
    if (mReleaseDate) mReleaseDate.textContent = card.releasedAt || '';
    if (mSource) {
        const sourceKeyMap = {
            limited: 'filter_limited',
            limited_f: 'filter_limited_f',
            limited_u: 'filter_limited_u',
            dist: 'filter_dist'
        };
        const sourceKey = sourceKeyMap[card.source] || 'filter_normal';
        const sourceText = translations[state.currentLang]?.[sourceKey] || translations.ko[sourceKey] || '';
        const sourceDetailText = getSourceDetailLabel(card.source_details);
        mSource.textContent = sourceDetailText ? `${sourceText} ${sourceDetailText}` : sourceText;
    }
    if (mGachaName) {
        const gachaInfo = card.gacha === false ? { name: '', chars: [] } : getSupportGachaInfo(card.id);
        const displayChars = normalizeCardChars(card.char);
        const chars = displayChars.length > 0 ? displayChars : gachaInfo.chars;
        mGachaName.innerHTML = '';
        (chars || []).forEach(char => {
            const icon = document.createElement('img');
            icon.className = 'modal-gacha-char-icon';
            icon.src = `icons/idolicons/${char}_c.png`;
            icon.alt = '';
            mGachaName.appendChild(icon);
        });

        // 캐릭터 고유색 수직 그라데이션 + 수평 덮개 레이어 적용 (마스킹으로 인해 글자와 아이콘이 가려지는 문제 방지)
        const charColors = (chars || []).map(char => idolColors[char]).filter(Boolean);
        if (charColors.length > 0) {
            const verticalStops = charColors.map((color, idx) => {
                const pct = Math.round((idx / (charColors.length - 1 || 1)) * 100);
                return `${color}4d ${pct}%`;
            }).join(', ');
            
            // 수평 덮개 레이어(왼쪽 투명 -> 오른쪽 40% 지점에서 회색배경 #fafafa로 완전히 덮음)를 수직 그라데이션 위에 겹쳐 쌓음
            mGachaName.style.background = `linear-gradient(90deg, rgba(250, 250, 250, 0) 0%, #fafafa 40%, #fafafa 100%), linear-gradient(to bottom, ${verticalStops})`;
            
            // 기존 마스크 속성 초기화
            mGachaName.style.webkitMaskImage = '';
            mGachaName.style.maskImage = '';
        } else {
            mGachaName.style.background = '';
            mGachaName.style.webkitMaskImage = '';
            mGachaName.style.maskImage = '';
        }

        const nameText = document.createElement('span');
        nameText.className = 'modal-gacha-name-text';
        const gachaNameText = card.name_modal || gachaInfo.name;
        nameText.textContent = gachaNameText;
        nameText.classList.toggle('long-gacha-name', gachaNameText.length >= 18);
        mGachaName.appendChild(nameText);
        mGachaName.classList.toggle('hidden', !(card.name_modal || gachaInfo.name));
    }

    mTitle.classList.remove('title-vocal', 'title-dance', 'title-visual', 'title-assist');
    mTitle.classList.add(`title-${card.type.toLowerCase()}`);

    // 미리 확인된 경로가 있으면 즉시 사용, 없으면 추측 경로 사용
    const baseIconPath = `images/support/${card.id}`;
    const isCardType = card.have && card.have.startsWith('card');
    const guessedPath = isCardType ? `${baseIconPath}_card.webp` : `${baseIconPath}_item.webp`;

    mExtraIcon.src = card._extraPath || guessedPath;

    // 혹시 모를 상황 대비 (프리로드가 안 됐을 경우)
    if (!card._extraPath) {
        mExtraIcon.onerror = () => {
            mExtraIcon.src = isCardType ? `${baseIconPath}_item.webp` : `${baseIconPath}_card.webp`;
            mExtraIcon.onerror = null;
        };
    } else {
        mExtraIcon.onerror = null;
    }

    const attrColors = {
        vocal: "#f766a4",
        dance: "#5aa6f0",
        visual: "#fdc361",
        assist: "#72da49"
    };

    if (card.item_effects) {
        const color = attrColors[card.type.toLowerCase()] || '#ff4d8d';
        mExtraIcon.style.backgroundColor = '#fff';
        mExtraIcon.style.borderColor = color;
        mExtraIcon.style.borderWidth = '1px';
    } else {
        mExtraIcon.style.backgroundColor = '#fff';
        mExtraIcon.style.borderColor = '#e0e0e0';
        mExtraIcon.style.borderWidth = '1px';
    }
    mExtraIcon.style.filter = 'none';

    mExtraIcon.onclick = (e) => {
        if (card.item_effects) {
            e.stopPropagation();
            showSupportItemTooltip(mExtraIcon, card.id);
        }
    };

    const highlightNumbers = (text, type) => {
        if (!text) return '';
        const colorClass = `highlight-${type.toLowerCase()}`;
        return text.replace(/([0-9]+[0-9.]*[%]*)/g, `<span class="${colorClass}">$1</span>`);
    };

    const getExtraText = (val) => {
        if (!val) return '';
        let resultText = '';
        if (val === 'param') {
            const rarity = card.rarity || 'SSR';
            const valNum = (rarity === 'SSR') ? 20 : 15;
            const attrKey = `attr_${card.type.toLowerCase()}`;
            const translatedType = translations[state.currentLang][attrKey] || card.type;
            const format = translations[state.currentLang]['extra_param'] || '{type} 상승+{val}';
            resultText = format.replace('{type}', translatedType).replace('{val}', valNum);
        } else if (val === 'ppoint') {
            const rarity = card.rarity || 'SSR';
            const valNum = (rarity === 'SR') ? 25 : 40;
            const format = translations[state.currentLang]['extra_ppoint'] || 'P포인트+{val}';
            resultText = format.replace('{val}', valNum);
        } else {
            const key = `extra_${val}`;
            resultText = translations[state.currentLang][key] || val;
        }
        return highlightNumbers(resultText, card.type);
    };

    mExtra1.innerHTML = getExtraText(card.extra1);
    if (card.rarity === 'SSR') {
        mExtra2.innerHTML = getExtraText(card.extra2);
        mExtra2.classList.remove('hidden');
    } else {
        mExtra2.innerHTML = '';
        mExtra2.classList.add('hidden');
    }

    let currentLB = state.supportLB[card.id] || 0;

    const updateAbilities = (lb) => {
        mAbilities.innerHTML = '';
        if (card.abilities && card.abilities.length > 0) {
            card.abilities.forEach((abId, index) => {
                const data = abilityData[abId];
                if (data) {
                    const displayTarget = card.abilityTargets?.[abId] || card.type;
                    const rarity = card.rarity || 'SSR';
                    const isDist = card.source === 'dist';
                    let rarityKey = rarity;
                    if (rarity === 'SSR' && isDist && data.levels['SSR_DIST']) rarityKey = 'SSR_DIST';

                    let val = 0;
                    if (abId === 'hpmax' || abId === 'supportrateup' || abId === 'percentparam' || abId === 'fixedparam' || abId === 'assistppoint' || abId === 'allsp_lessonup') {
                        const targetLv = lb + 1;
                        const bonusLevels = data.levels[rarityKey] || data.levels[rarity] || data.levels;
                        val = bonusLevels[targetLv] || bonusLevels[5] || Object.values(bonusLevels)[Object.values(bonusLevels).length - 1];
                    } else if (abId === 'event_paraup' || abId === 'event_recoveryup' || abId === 'event_ppointup') {
                        let targetLv = (rarity === 'SSR') ? (lb >= 4 ? 3 : (lb >= 1 ? 2 : 1)) : (lb >= 4 ? 3 : (lb >= 2 ? 2 : 1));
                        val = data.levels[targetLv] || data.levels[1];
                    } else {
                        let targetLv = 1;
                        if (index === 1) targetLv = (rarity === 'SSR' ? (lb >= 2 ? 2 : 1) : (lb >= 1 ? 2 : 1));
                        else if (index === 3) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 3 ? 2 : 1) : (lb >= 4 ? 2 : 1));
                        else if (index === 4) targetLv = ((rarity === 'SSR' && !isDist) ? (lb >= 4 ? 2 : 1) : (lb >= 3 ? 2 : 1));
                        else targetLv = (lb >= 2 ? 2 : 1);

                        const bonusLevels = data.levels[rarityKey] || data.levels[rarity] || data.levels;
                        val = bonusLevels[targetLv] || bonusLevels[1];
                    }

                    const format = data.format[state.currentLang] || data.format['ko'];
                    const attrKey = `attr_${displayTarget.toLowerCase()}`;
                    const translatedType = translations[state.currentLang][attrKey] || displayTarget;
                    const rawText = format.replaceAll('{val}', val).replaceAll('{type}', translatedType);
                    const highlightedText = highlightNumbers(rawText, card.type);

                    const abEl = document.createElement('div');
                    abEl.className = `ability-item border-${card.type.toLowerCase()}`;
                    const shrinkClass = rawText.length > 35 ? 'shrink' : '';
                    abEl.innerHTML = `<div class="ability-text ${shrinkClass}">${highlightedText}</div>`;
                    mAbilities.appendChild(abEl);
                }
            });
        }
    };

    const updateStars = (lb) => {
        stars.forEach((s, idx) => s.classList.toggle('active', idx < lb));
        updateAbilities(lb);
    };

    updateStars(currentLB);

    stars.forEach((s, idx) => {
        s.onclick = () => {
            const newLB = (idx + 1 === currentLB) ? 0 : idx + 1;
            currentLB = newLB;
            setSupportLB(card.id, currentLB);
            updateStars(currentLB);
            if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            if (typeof window.updateActivityCounts === 'function') window.updateActivityCounts();

            // 1. 서포트 카드 그리드 업데이트
            const cardInGrid = document.querySelector(`.support-card[data-id="${card.id}"]`);
            if (cardInGrid) {
                cardInGrid.querySelectorAll('.card-star').forEach((cs, cIdx) => cs.classList.toggle('active', cIdx < currentLB));
            }

            // 2. 계산기 사이드 패널 업데이트 (추가)
            const cardInSidePanel = document.querySelector(`.side-card-item[data-id="${card.id}"]`);
            if (cardInSidePanel) {
                cardInSidePanel.querySelectorAll('.calc-card-star').forEach((cs, cIdx) => cs.classList.toggle('active', cIdx < currentLB));
            }
        };
    });

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '30001';
    history.pushState({ modalOpen: true }, "");
}
window.showCardModal = showCardModal;
