// idolPossessionModal.js
import { state, idolColors } from './state.js';
import { produceList } from './producedata.js';
import globalTranslations from './i18n.js';

window.getGrayscaleDataUrl = function (imgEl) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.naturalWidth || imgEl.width || 80;
        canvas.height = imgEl.naturalHeight || imgEl.height || 80;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Modern BT.709 coefficients for accurate digital luma conversion
            const gray = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
            data[i] = Math.round(data[i] * 0.1 + gray * 0.9);
            data[i + 1] = Math.round(data[i + 1] * 0.1 + gray * 0.9);
            data[i + 2] = Math.round(data[i + 2] * 0.1 + gray * 0.9);
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.warn("Grayscale conversion failed:", e);
        return imgEl.src;
    }
};

const CHARACTER_ORDER = [
    'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja',
    'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
];

const HEATMAP_CHARACTER_ORDER = [
    'saki', 'temari', 'kotone', 'mao', 'lilja', 'china',
    'sumika', 'hiro', 'rinami', 'ume', 'sena', 'misuzu', 'tsubame'
];

const SUB_TYPE_LABELS = {
    ko: {
        goodcondition: '호조',
        concentration: '집중',
        goodimpression: '호인상',
        motivation: '의욕',
        enthusiasm: '강기',
        fullpower: '전력'
    },
    ja: {
        goodcondition: '好調',
        concentration: '集中',
        goodimpression: '好印象',
        motivation: 'やる気',
        enthusiasm: '強気',
        fullpower: '全力'
    },
    en: {
        goodcondition: 'Condition',
        concentration: 'Concentration',
        goodimpression: 'Impression',
        motivation: 'Motivation',
        enthusiasm: 'Enthusiasm',
        fullpower: 'Full Power'
    }
};

const getOsusume = (card, allPssrCards) => {
    if (card.osusume) return card.osusume;
    const baseId = card.id.replace(/[0-9]+another$/, '');
    const baseCard = allPssrCards.find(c => c.osusume && c.id.startsWith(baseId));
    return baseCard ? baseCard.osusume : '';
};

const getBadgeText = (c, lang) => {
    if (!c) return '';
    const src = c.source || 'normal';
    if (src === 'limited_u') {
        if (lang === 'ja' || lang === 'en') return 'Unit';
    }
    if (src === 'limited_f') {
        if (lang === 'ja' || lang === 'en') return 'Fes';
    }
    const key = `filter_${src}`;
    return globalTranslations[lang]?.[key] || globalTranslations.ko[key] || src;
};

const TRANSLATIONS = {
    ko: {
        title_select: '아이돌 선택',
        desc_select: '소지하고 있는 아이돌을 클릭해주세요.',
        title_stats: '아이돌 카드 소지 통계',
        btn_save_image: '이미지 저장',
        overall_rate: '전체 소지율',
        include_another: '어나더 포함',
        include_dist: '배포 포함',
        show_100percent_only: '100% 소지',
        plan_stats: '플랜별',
        source_stats: '분류별',
        char_stats: '아이돌별',
        toggle_plan: '플랜별',
        toggle_source: '분류별',
        alert_generating: '이미지 생성 중...',
        alert_fail: '이미지 저장에 실패했습니다.',
        alert_success: '이미지가 저장되었습니다.',
        btn_reset: '초기화',
        confirm_reset: '정말 선택한 소지 카드를 모두 초기화하시겠습니까?'
    },
    ja: {
        title_select: 'PSSR所持状況の選択',
        desc_select: '所持しているPSSRカードをクリックしてください。選択されたカードは鮮明に表示されます。',
        title_stats: 'PSSR所持状況の統計',
        btn_save_image: '画像保存',
        overall_rate: '全体所持率',
        include_another: 'アナザー含む',
        include_dist: '配布含む',
        show_100percent_only: '100%所持',
        plan_stats: 'プラン別所持率',
        source_stats: '分類別所持率',
        char_stats: 'アイドル別所持率',
        toggle_plan: 'プラン別',
        toggle_source: '分類別',
        alert_generating: '画像生成中...',
        alert_fail: '画像の保存に失敗しました。',
        alert_success: '画像を保存しました。',
        btn_reset: '初期化',
        confirm_reset: '本当に選択した所持カードをすべてクリアしますか？'
    },
    en: {
        title_select: 'Select PSSR Possession',
        desc_select: 'Click the PSSR cards you own. Selected cards will be highlighted.',
        title_stats: 'PSSR Possession Stats',
        btn_save_image: 'Save Image',
        overall_rate: 'Overall Rate',
        include_another: 'Include Another',
        include_dist: 'Include Event',
        show_100percent_only: '100% Owned',
        plan_stats: 'By Plan',
        source_stats: 'By Source',
        char_stats: 'By Character',
        toggle_plan: 'By Plan',
        toggle_source: 'By Source',
        alert_generating: 'Generating image...',
        alert_fail: 'Failed to save image.',
        alert_success: 'Image saved successfully.',
        btn_reset: 'Reset',
        confirm_reset: 'Are you sure you want to reset all selected owned cards?'
    }
};

function showIdolToast(message, duration = 2000) {
    const existing = document.querySelector('.idol-possession-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'idol-possession-toast';
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

function loadOwnedPssrs() {
    try {
        return JSON.parse(localStorage.getItem('gakumas_owned_pssr')) || {};
    } catch {
        return {};
    }
}

function saveOwnedPssrs(ownedMap) {
    localStorage.setItem('gakumas_owned_pssr', JSON.stringify(ownedMap));
}

function loadIncludeAnother() {
    try {
        const val = localStorage.getItem('gakumas_possession_include_another');
        return val === null ? false : val === 'true';
    } catch {
        return false;
    }
}

function saveIncludeAnother(val) {
    localStorage.setItem('gakumas_possession_include_another', String(val));
}

function loadIncludeDist() {
    try {
        const val = localStorage.getItem('gakumas_possession_include_dist');
        return val === null ? true : val === 'true';
    } catch {
        return true;
    }
}

function saveIncludeDist(val) {
    localStorage.setItem('gakumas_possession_include_dist', String(val));
}

function loadShow100PercentOnly() {
    try {
        const val = localStorage.getItem('gakumas_possession_show_100percent_only');
        return val === null ? false : val === 'true';
    } catch {
        return false;
    }
}

function saveShow100PercentOnly(val) {
    localStorage.setItem('gakumas_possession_show_100percent_only', String(val));
}

const hexToRgba = (hex, alpha) => {
    if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCharacterId = (cardId) => {
    const match = cardId.match(/^(?:ssr|sr|r)([a-z]+)_/);
    return match ? match[1] : '';
};

const getCardSeriesOrder = (card) => {
    if (!card || !card.id) return 0;
    const match = card.id.match(/_(\d+)(?:st|nd|rd|th)/i);
    return match ? parseInt(match[1], 10) : 0;
};

const getSeriesBadgeText = (card) => {
    const num = getCardSeriesOrder(card);
    if (num === 0 || num === 999) return null;
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
};

const IGNORED_CARD_TYPES = new Set(['vocal', 'dance', 'visual', 'sense', 'logic', 'anomaly', 'free', 'produce', 'support']);

const TYPE_TITLES = {
    location: { ko: '로케이션', ja: 'ロケーション', en: 'Location' },
    collabo: { ko: '콜라보', ja: 'コラボ', en: 'Collab' },
    season: { ko: '시즌', ja: 'シーズン', en: 'Season' },
    live: { ko: '라이브 투어', ja: 'ライブツアー', en: 'Live Tour' },
    nia: { ko: 'NIA', ja: 'NIA', en: 'NIA' },
    campus: { ko: 'NIA', ja: 'NIA', en: 'NIA' },
    hif: { ko: 'HIF', ja: 'HIF', en: 'HIF' }
};

const getTypeTitle = (type, lang) => {
    if (!type) return '';
    if (TYPE_TITLES[type]) {
        return TYPE_TITLES[type][lang] || TYPE_TITLES[type]['ko'] || type;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
};

const getNormalCardGroupKey = (c) => {
    if (!c) return null;
    const num = getCardSeriesOrder(c);
    if (num !== 0 && num !== 999) {
        return `series-${num}`;
    }
    const type = c.category || c.type;
    if (type && !IGNORED_CARD_TYPES.has(type.toLowerCase())) {
        return type;
    }
    return null;
};

const getNormalCardGroupTitle = (c, lang) => {
    if (!c) return null;
    const num = getCardSeriesOrder(c);
    if (num !== 0 && num !== 999) {
        return getSeriesBadgeText(c) || `${num}th`;
    }
    const type = c.category || c.type;
    if (type && !IGNORED_CARD_TYPES.has(type.toLowerCase())) {
        return getTypeTitle(type, lang);
    }
    return getSeriesBadgeText(c) || `${num}th`;
};

const getNormalCardBadgeText = (c, lang) => {
    if (!c) return null;
    const num = getCardSeriesOrder(c);
    if (num !== 0 && num !== 999) {
        return getSeriesBadgeText(c);
    }
    const type = c.category || c.type;
    if (type && !IGNORED_CARD_TYPES.has(type.toLowerCase())) {
        return null;
    }
    return getSeriesBadgeText(c);
};

const TYPE_SORT_ORDERS = {
    location: 50,
    collabo: 60
};

const getNormalGroupSortOrder = (card) => {
    if (!card) return 999;
    const num = getCardSeriesOrder(card);
    if (num !== 0 && num !== 999) {
        return num;
    }
    const type = card.category || card.type;
    if (type && !IGNORED_CARD_TYPES.has(type.toLowerCase())) {
        return TYPE_SORT_ORDERS[type] || 500;
    }
    return 900;
};

const getWaffleGridStyle = (totalCards) => {
    if (totalCards <= 2) {
        return ` style="justify-content: center; grid-template-columns: repeat(${totalCards}, auto);"`;
    }
    return '';
};

const getCardPeriodKey = (c) => {
    if (!c) return null;
    const type = c.category || c.type;
    if (!type) return null;
    if (type === 'season' || type === 'live') {
        return type;
    }
    return null;
};

const getPeriodBadgeTitle = (periodKey, lang) => {
    if (periodKey === 'season') return (lang === 'ja' || lang === 'en') ? 'Sea.' : '시즌';
    if (periodKey === 'live') return (lang === 'ja' || lang === 'en') ? 'Live' : '라이브';
    return null;
};

const getPeriodWaffleTitle = (periodKey, lang) => {
    if (periodKey === 'season') {
        if (lang === 'ja') return 'シーズン';
        if (lang === 'en') return 'Season';
        return '시즌';
    }
    if (periodKey === 'live') {
        if (lang === 'ja') return 'ライブツアー';
        if (lang === 'en') return 'Live Tour';
        return '라이브 투어';
    }
    return null;
};

const getFesSubCategoryOrder = (card) => {
    if (!card) return 999;
    const type = card.category || card.type;
    if (!type) return 999;
    if (type === 'nia' || type === 'campus') return 1;
    if (type === 'hif') return 2;
    return 999;
};

const getFesSubCategoryTitle = (order) => {
    if (order === 1) return 'NIA';
    if (order === 2) return 'HIF';
    return null;
};

const sortPssrFesCards = (a, b) => {
    const fesOrderA = getFesSubCategoryOrder(a);
    const fesOrderB = getFesSubCategoryOrder(b);
    if (fesOrderA !== fesOrderB) return fesOrderA - fesOrderB;

    const dateA = a.releasedAt || '1970-01-01';
    const dateB = b.releasedAt || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const charA = getCharacterId(a.id);
    const charB = getCharacterId(b.id);
    const idxA = CHARACTER_ORDER.indexOf(charA);
    const idxB = CHARACTER_ORDER.indexOf(charB);
    if (idxA !== idxB) return idxA - idxB;

    return a.id.localeCompare(b.id);
};

const sortPssrUnitCards = (a, b) => {
    const dateA = a.releasedAt || '1970-01-01';
    const dateB = b.releasedAt || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const nameA = (a.name || '').trim();
    const nameB = (b.name || '').trim();
    if (nameA !== nameB) return nameA.localeCompare(nameB);

    const charA = getCharacterId(a.id);
    const charB = getCharacterId(b.id);
    const idxA = CHARACTER_ORDER.indexOf(charA);
    const idxB = CHARACTER_ORDER.indexOf(charB);
    if (idxA !== idxB) return idxA - idxB;

    return a.id.localeCompare(b.id);
};

const sortPssrNormalCards = (a, b) => {
    const orderA = getNormalGroupSortOrder(a);
    const orderB = getNormalGroupSortOrder(b);
    if (orderA !== orderB) return orderA - orderB;

    const dateA = a.releasedAt || '1970-01-01';
    const dateB = b.releasedAt || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const charA = getCharacterId(a.id);
    const charB = getCharacterId(b.id);
    const idxA = CHARACTER_ORDER.indexOf(charA);
    const idxB = CHARACTER_ORDER.indexOf(charB);
    if (idxA !== idxB) return idxA - idxB;

    return a.id.localeCompare(b.id);
};

const getCardAnotherInfo = (card) => {
    if (!card || !card.id || !card.another) return null;
    const match = card.id.match(/(\d+)(?:st|nd|rd|th)(\d+)another/i) || card.id.match(/(\d+)another/i);
    if (!match) return null;
    if (match[2] !== undefined) {
        const seriesNum = parseInt(match[1], 10);
        const subNum = parseInt(match[2], 10);
        const suffix = seriesNum === 1 ? '1st' : seriesNum === 2 ? '2nd' : seriesNum === 3 ? '3rd' : `${seriesNum}th`;
        return {
            key: `${suffix}${subNum}`,
            sortOrder: seriesNum * 1000 + subNum,
            badgeText: `${suffix}${subNum}`
        };
    } else {
        const subNum = parseInt(match[1], 10);
        return {
            key: `1st${subNum}`,
            sortOrder: 1000 + subNum,
            badgeText: `1st${subNum}`
        };
    }
};

const getCardAnotherKey = (card) => {
    const info = getCardAnotherInfo(card);
    return info ? info.key : null;
};

const getAnotherBadgeText = (card) => {
    const info = getCardAnotherInfo(card);
    return info ? info.badgeText : null;
};

const getAnotherSortOrder = (card) => {
    const info = getCardAnotherInfo(card);
    return info ? info.sortOrder : 999999;
};

const sortPssrAnotherCards = (a, b) => {
    const orderA = getAnotherSortOrder(a);
    const orderB = getAnotherSortOrder(b);
    if (orderA !== orderB) return orderA - orderB;

    const dateA = a.releasedAt || '1970-01-01';
    const dateB = b.releasedAt || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const charA = getCharacterId(a.id);
    const charB = getCharacterId(b.id);
    const idxA = CHARACTER_ORDER.indexOf(charA);
    const idxB = CHARACTER_ORDER.indexOf(charB);
    if (idxA !== idxB) return idxA - idxB;

    return a.id.localeCompare(b.id);
};

const sortPssrByCharacterAndRelease = (a, b) => {
    const dateA = a.releasedAt || '1970-01-01';
    const dateB = b.releasedAt || '1970-01-01';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const charA = getCharacterId(a.id);
    const charB = getCharacterId(b.id);
    const idxA = CHARACTER_ORDER.indexOf(charA);
    const idxB = CHARACTER_ORDER.indexOf(charB);
    if (idxA !== idxB) return idxA - idxB;

    return a.id.localeCompare(b.id);
};

const getLocalizedCardName = (card, lang) => {
    if (!card) return '';
    if (lang === 'en' && card.name_en) return card.name_en;
    if (lang !== 'ko' && card.name_ja) return card.name_ja;
    return card.name;
};

export function openIdolPossessionModal() {
    let modal = document.getElementById('idol-possession-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'idol-possession-modal';
    modal.style.zIndex = '35000';
    modal.style.background = 'rgba(0, 0, 0, 0.7)';

    const lang = state.currentLang || 'ko';
    const text = TRANSLATIONS[lang] || TRANSLATIONS.ko;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `(${yyyy}. ${mm}. ${dd}.)`;

    // Filter PSSRs (including another cards)
    const pssrCards = produceList.filter(c => c.rarity === 'PSSR');

    // Sort PSSRs by release date ascending (earliest first), placing another cards at the end
    pssrCards.sort((a, b) => {
        const anotherA = a.another ? 1 : 0;
        const anotherB = b.another ? 1 : 0;
        if (anotherA !== anotherB) {
            return anotherA - anotherB;
        }
        const dateA = a.releasedAt || '1970-01-01';
        const dateB = b.releasedAt || '1970-01-01';
        if (dateA !== dateB) {
            return dateA.localeCompare(dateB);
        }
        return a.id.localeCompare(b.id);
    });

    // Load owned state
    const ownedMap = loadOwnedPssrs();

    modal.innerHTML = `
        <style>
            .idol-possession-content {
                width: 1000px;
                max-width: 90%;
                min-width: min(740px, 90%);
                max-height: 85dvh;
                padding: 20px 28px 18px 28px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                box-sizing: border-box;
                border-radius: 18px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                background-color: #ffffff;
                --pssr-group-gap: 6px;
                --pssr-title-gap: 4px;
                --pssr-box-padding: 10px;
            }
            .idol-possession-title-wrap {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1.3rem;
                font-weight: 800;
                color: #333;
            }
            .idol-possession-title-indicator {
                width: 4px;
                height: 20px;
                background-color: #ff4d8d;
                border-radius: 2px;
            }
            .idol-possession-reset-btn {
                height: 32px;
                padding: 0 12px;
                background-color: #fee2e2;
                color: #7f1d1d !important;
                border: 1px solid #fca5a5;
                border-radius: 8px;
                font-weight: bold;
                font-size: 0.85rem;
                cursor: pointer;
                transition: none !important;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 3px rgba(220,38,38,0.1);
            }
            .idol-possession-scroll {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                padding-right: 4px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .idol-possession-desc-banner {
                font-size: 0.85rem;
                color: #666;
                line-height: 1.4;
                padding-left: 2px;
            }
            .char-section {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .char-section-card {
                border-radius: 5px;
                padding: 7px 7px 0 7px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                box-sizing: border-box;
            }
            .char-section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 800;
                font-size: 1.0rem;
                color: #333;
                user-select: none;
            }
            .char-section-indicator {
                width: 3px;
                height: 14px;
                border-radius: 1.5px;
            }
            .char-section-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                object-fit: cover;
                box-sizing: border-box;
            }
            .pssr-selection-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 8px;
            }
            .pssr-selection-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                position: relative;
            }
            .pssr-card-thumb {
                width: 120px;
                height: 216px;
                border-radius: 6px;
                overflow: hidden;
                background: #f0f0f0;
                box-sizing: border-box;
            }
            .pssr-card-name {
                font-size: 0.65rem;
                font-weight: bold;
                color: #555;
                text-align: center;
                margin-top: 4px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                height: 28px;
                line-height: 1.25;
                word-break: keep-all;
                width: 120px;
                user-select: none;
            }
            .pssr-check-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                color: #fff;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.65rem;
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                border: 1.5px solid #fff;
                z-index: 10;
            }
            .idol-possession-confirm-btn {
                width: 100%;
                height: 42px;
                background-color: #ff4d8d;
                color: #fff;
                font-weight: 800;
                font-size: 1.0rem;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: none !important;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                box-shadow: 0 2px 6px rgba(255, 77, 141, 0.3);
            }
            .pssr-stat-icon-wrap {
                position: relative;
                width: 60px;
                height: 180px;
                border-radius: 0 18px 0 0;
                background: #eee;
                flex-shrink: 0;
            }
            .pssr-stat-icon-spacer {
                width: 60px;
                height: 0;
                margin: 0;
                padding: 0;
                pointer-events: none;
                visibility: hidden;
            }
            .pssr-stat-waffle-wrap {
                position: relative;
                width: 128px;
                height: 180px;
                border-radius: 12px 0 0 12px;
                background: #ffffff;
                border: 1.5px solid #cbd5e1;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 10px 6px;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                cursor: pointer;
                user-select: none;
            }
            .pssr-stat-waffle-wrap.collapsed {
                border-radius: 12px;
            }
            .pssr-waffle-badge {
                position: absolute;
                top: 6px;
                left: 8px;
                right: 8px;
                color: #555;
                font-size: 0.64rem;
                font-weight: 800;
                line-height: 1.15;
                z-index: 5;
                white-space: normal;
                word-break: break-word;
            }
            .pssr-waffle-footer-badge {
                position: absolute;
                bottom: 6px;
                right: 8px;
                color: #666;
                font-size: 0.72rem;
                font-weight: 800;
                line-height: 1;
                z-index: 5;
            }
            .pssr-waffle-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5px;
                width: 100%;
                max-width: 90px;
                justify-items: center;
                align-items: center;
                margin: 0 auto;
            }
            .pssr-waffle-cell {
                width: 22px;
                height: 22px;
                border-radius: 4px;
                box-shadow: none;
                transition: transform 0.15s ease;
            }
            .pssr-waffle-footer {
                font-size: 0.82rem;
                font-weight: 800;
                color: #ff4d8d;
                text-align: center;
                line-height: 1.1;
            }
            .pssr-waffle-primastella {
                position: absolute;
                bottom: 4px;
                left: 4px;
                width: 18px;
                height: 18px;
                z-index: 10;
                pointer-events: none;
            }
            .pssr-stat-icon-box {
                position: absolute;
                inset: 0;
                border-radius: 0 18px 0 0;
                overflow: hidden;
                z-index: 1;
                box-sizing: border-box;
            }
            .pssr-stat-icon-box::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: -2px;
                left: -2px;
                right: -2px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 18%, rgba(0, 0, 0, 0) 30%, transparent 100%);
                pointer-events: none;
                z-index: 2;
            }
            .pssr-stat-icon-box img {
                position: absolute;
                height: 100%;
                width: auto;
                left: 50%;
                transform: translateX(-50%);
                top: 0;
                display: block;
            }
            .pssr-char-badge {
                position: absolute;
                top: -1px;
                left: -1px;
                padding: 0 6px;
                height: 20px;
                border-radius: 0 0 4px 0;
                border: none !important;
                z-index: 5;
                pointer-events: none;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 11px;
                font-weight: bold;
                line-height: 1;
            }

            .pssr-char-icons-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 10px;
                padding: 0 10px;
                box-sizing: border-box;
                width: 100%;
            }
            .pssr-stat-icons-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                align-items: center;
                width: 100%;
            }
            .pssr-plan-badge {
                position: absolute;
                bottom: -1px;
                right: -1px;
                width: 26px;
                height: 26px;
                border-radius: 4px;
                border: none !important;
                z-index: 5;
                pointer-events: none;
                user-select: none;
                object-fit: contain;
                padding: 3px;
                box-sizing: border-box;
            }
            .plan-subgroup-col-left {
                padding: 0px 6px 4px 4px;
            }
            .plan-subgroup-col-right {
                padding: 0px 4px 4px 6px;
            }
            .pssr-stat-rate-pct {
                font-size: 0.65rem;
                font-weight: 800;
                opacity: 0.9;
            }
            .pssr-stat-rate-fraction {
                font-size: 0.58rem;
                font-weight: normal;
                color: #777;
                margin-left: 2px;
            }
            .possession-save-options-content {
                width: 380px;
                padding: 24px;
                border-radius: 16px;
                background: #fff;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                gap: 13px;
                box-sizing: border-box;
                text-align: center;
                position: relative;
            }

        </style>
        <style id="idol-possession-mobile-styles">
            @media (max-width: 768px) {
                body:not(.is-capturing) .idol-possession-content {
                    width: 100% !important;
                    max-width: 95% !important;
                    min-width: 0 !important;
                    padding: 14px 2px 12px 2px !important;
                    gap: 12px !important;
                    border-radius: 14px !important;
                    --pssr-group-gap: 2px;
                    --pssr-title-gap: 2px;
                    --pssr-box-padding: 4px;
                }
                .idol-possession-title-wrap {
                    font-size: 1.05rem !important;
                    gap: 6px !important;
                }
                .possession-title-date {
                    display: none !important;
                }
                .idol-possession-title-indicator {
                    height: 16px !important;
                }
                .idol-possession-reset-btn {
                    height: 28px !important;
                    padding: 0 8px !important;
                    font-size: 0.75rem !important;
                    border-radius: 6px !important;
                }
                .idol-possession-scroll {
                    gap: 14px !important;
                    padding-left: 12px !important;
                    padding-right: 12px !important;
                }
                .idol-possession-desc-banner {
                    font-size: 0.75rem !important;
                    line-height: 1.35 !important;
                }
                .char-section {
                    gap: 3px !important;
                }
                .char-section-card {
                    padding: 3px !important;
                    border-radius: 5px !important;
                    gap: 8px !important;
                }
                .char-section-title {
                    font-size: 0.85rem !important;
                    gap: 6px !important;
                }
                .char-section-icon {
                    width: 18px !important;
                    height: 18px !important;
                }
                .char-section-indicator {
                    height: 12px !important;
                }
                .pssr-selection-grid {
                    grid-template-columns: repeat(5, 1fr) !important;
                    gap: 4px !important;
                }
                .pssr-card-thumb {
                    width: 100% !important;
                    height: 100px !important;
                    border-radius: 4px !important;
                }
                .pssr-card-name {
                    font-size: 0.35rem !important;
                    margin-top: 1px !important;
                    height: auto !important;
                    line-height: 1.2 !important;
                    width: 100% !important;
                    word-break: break-all !important;
                }
                .pssr-check-badge {
                    top: -3px !important;
                    right: -3px !important;
                    width: 14px !important;
                    height: 14px !important;
                    font-size: 0.5rem !important;
                    border-width: 1px !important;
                }
                .idol-possession-confirm-btn {
                    height: 36px !important;
                    font-size: 0.85rem !important;
                    border-radius: 8px !important;
                }

                .pssr-stat-icons-container, .pssr-char-icons-container {
                    gap: 3px !important;
                    padding: 0 !important;
                }
                #btn-idol-possession-save {
                    height: 24px !important;
                    padding: 0 8px !important;
                    font-size: 0.68rem !important;
                    border-radius: 0 5px 5px 0 !important;
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
                .possession-save-options-content .save-opt-plan-btn {
                    padding: 8px 2px !important;
                    gap: 2px !important;
                }
                .possession-save-options-content .save-opt-plan-btn span {
                    font-size: 0.48rem !important;
                }
                .possession-save-options-content .save-opt-plan-btn img {
                    width: 9px !important;
                    height: 9px !important;
                }
                .source-stat-circle-view svg circle {
                    stroke-width: 3.5 !important;
                }

                .source-stacked-bar-segment {
                    font-size: 0.45rem !important;
                }
                .source-stat-circle-label {
                    font-size: 0.7rem !important;
                }
                .source-stat-circle-subtext {
                    font-size: 0.6rem !important;
                }
                .source-stat-circle-subtext span:last-child {
                    font-size: 0.52rem !important;
                }
                .source-stat-circle-wrapper {
                    width: 62px !important;
                    height: 62px !important;
                }
                body:not(.is-capturing) .radar-vertex-dot {
                    display: none !important;
                }
                body:not(.is-capturing) .idol-stats-plan-radars-wrapper {
                    flex-direction: row !important;
                    gap: 10px !important;
                    flex-wrap: nowrap !important;
                }
                body:not(.is-capturing) .idol-stats-plan-radar-container {
                    height: 170px !important;
                }
                body:not(.is-capturing) .idol-stats-plan-radar-container svg {
                    width: 140px !important;
                    height: 170px !important;
                }
                body:not(.is-capturing) .idol-stats-plan-radar-container:first-child svg {
                    margin-right: 0 !important;
                }
                body:not(.is-capturing) .idol-stats-plan-radar-container:last-child svg {
                    margin-left: 0 !important;
                }
                body:not(.is-capturing) .idol-stats-radar-divider {
                    width: 1px !important;
                    min-width: 1px !important;
                    flex: 0 0 1px !important;
                    height: 130px !important;
                    background-color: #f0f0f0 !important;
                }
                .pssr-stat-icons-container, .pssr-char-icons-container {
                    gap: 4px !important;
                    padding: 0 2px !important;
                }
                .pssr-stat-icons-row {
                    gap: 4px !important;
                }
                .possession-title-date {
                    display: none !important;
                }
                .possession-title-wrap {
                    font-size: 1.05rem !important;
                    gap: 6px !important;
                }
                .possession-title-icon {
                    width: 30px !important;
                    height: 30px !important;
                    margin-bottom: -1px !important;
                    margin-right: 6px !important;
                }
                #possession-header-line {
                    margin-left: 15px !important;
                    width: calc(100% - 15px) !important;
                }
                #btn-idol-possession-save {
                    height: 28px !important;
                    padding: 0 12px !important;
                    font-size: 0.72rem !important;
                    border-radius: 0 6px 6px 0 !important;
                    font-weight: bold !important;
                }
                .possession-section-card {
                    padding: 6px 8px !important;
                    border-radius: 6px !important;
                }
                .char-stat-card {
                    border-radius: 6px !important;
                }
                body:not(.is-capturing) .idol-stats-xaxis-label img {
                    width: 11px !important;
                    height: 11px !important;
                }
                body:not(.is-capturing) .idol-stats-char-toggle-group {
                    height: 20px !important;
                    border-radius: 4px !important;
                }
                body:not(.is-capturing) .idol-stats-char-toggle-btn {
                    font-size: 0.58rem !important;
                    padding: 1px 6px !important;
                }
                body:not(.is-capturing) .possession-heatmap-row-labels {
                    padding-top: 0 !important;
                    width: 50px !important;
                    gap: 0 !important;
                }
                body:not(.is-capturing) .possession-heatmap-row-header-spacer {
                    height: 18px !important;
                }
                body:not(.is-capturing) .possession-heatmap-row-label {
                    height: 22px !important;
                    border-left-width: 2px !important;
                    justify-content: flex-start !important;
                    padding-left: 6px !important;
                }
                body:not(.is-capturing) .possession-heatmap-row-label img {
                    width: 18px !important;
                    height: 18px !important;
                }
                body:not(.is-capturing) .possession-heatmap-row-sum-val {
                    font-size: 0.58rem !important;
                    margin-left: 3px !important;
                }
                body:not(.is-capturing) .possession-heatmap-col-header {
                    height: 18px !important;
                }
                body:not(.is-capturing) .possession-heatmap-header-txt {
                    font-size: 0.52rem !important;
                }
                body:not(.is-capturing) .heatmap-col-count-lbl {
                    font-size: 0.44rem !important;
                }
                body:not(.is-capturing) .possession-heatmap-col-header img {
                    width: 14px !important;
                    height: 14px !important;
                }

                body:not(.is-capturing) .possession-heatmap-cell {
                    height: 22px !important;
                    font-size: 0.38rem !important;
                }
                body:not(.is-capturing) .possession-heatmap-cell div {
                    transform: scale(0.85);
                }

                .char-stat-details {
                    padding: 8px 4px !important;
                }
                .char-stat-details > div {
                    border-radius: 5px !important;
                    padding: 10px 6px 6px 6px !important;
                }
                .pssr-stat-icons-container, .pssr-char-icons-container {
                    padding: 0 4px !important;
                    margin-top: 2px !important;
                }
                .idol-stats-overall-left-wrap {
                    gap: 3px !important;
                }
                .idol-stats-overall-icon {
                    width: 12px !important;
                    height: 12px !important;
                }
                body:not(.is-capturing) .idol-stats-overall-rank-icon {
                    height: 38px !important;
                }
                .idol-stats-overall-lbl {
                    font-size: 0.68rem !important;
                    white-space: nowrap !important;
                }
                .idol-stats-overall-chk {
                    font-size: 0.52rem !important;
                    margin-left: 2px !important;
                    padding: 0px 6px !important;
                    border-radius: 3px !important;
                    height: 20px !important;
                }
                .idol-stats-overall-chk-group {
                    border-radius: 3px !important;
                    height: 20px !important;
                }
                .idol-stats-overall-chk input {
                    width: 9px !important;
                    height: 9px !important;
                }
                .idol-stats-overall-val {
                    font-size: 0.76rem !important;
                    white-space: nowrap !important;
                    margin-top: 10px !important;
                }
                .idol-stats-plan-row {
                    font-size: 0.5rem !important;
                    gap: 1px !important;
                }
                .idol-stats-plan-fraction {
                    font-size: 0.4rem !important;
                }
                .idol-stats-plan-row span.idol-plan-text {
                    display: none !important;
                }
                .idol-stats-plan-row > span {
                    white-space: nowrap !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 1px !important;
                }
                .idol-stats-plan-row img {
                    width: 12px !important;
                    height: 12px !important;
                }
                .idol-stats-source-row {
                    font-size: 0.5rem !important;
                }
                .idol-stats-source-fraction {
                    font-size: 0.48rem !important;
                    margin-left: 4px !important;
                }
                .idol-stats-source-label {
                    width: 40px !important;
                    font-size: 0.6rem !important;
                }
                .idol-stats-source-pct {
                    font-size: 0.6rem !important;
                }
                .idol-stats-source-val-wrap {
                    width: 50px !important;
                }
                .idol-stats-bar-val {
                    font-size: 0.48rem !important;
                    top: -10px !important;
                }
                .idol-stats-xaxis-label {
                    font-size: 0.4rem !important;
                }
                .idol-stats-char-name-row {
                    font-size: 0.65rem !important;
                }
                .idol-stats-char-fraction {
                    font-size: 0.58rem !important;
                }
                .idol-stats-char-pct {
                    font-size: 0.58rem !important;
                    margin-left: auto !important;
                }
                /* Hide name + fraction by default for 4th rank and below on mobile when collapsed */
                .char-stat-card:not(.expanded):not([data-rank="1"]):not([data-rank="2"]):not([data-rank="3"]) .idol-stats-char-name-wrap {
                    display: none !important;
                }
                .idol-stats-yaxis-label {
                    font-size: 0.35rem !important;
                    height: 40px !important;
                    width: 10px !important;
                    margin-right: 1px !important;
                }
                .idol-stats-chart-wrapper {
                    height: 40px !important;
                }
                .idol-stats-xaxis-container {
                    padding-left: 11px !important;
                }
                .idol-stats-chart-area-wrapper {
                    max-width: 230px !important;
                    margin: 0 auto !important;
                }
                .idol-stats-section-title {
                    font-size: 0.78rem !important;
                    margin-bottom: -10px !important;
                }
                .idol-stats-char-card {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 10px !important;
                }
                .char-stat-card {
                    grid-column: span 1 !important;
                }
                .char-stat-card[data-rank="1"],
                .char-stat-card[data-rank="2"],
                .char-stat-card[data-rank="3"] {
                    grid-column: span 2 !important;
                }
                .char-stat-card.expanded {
                    grid-column: span 2 !important;
                }
                .idol-stats-plan-row-container {
                    flex-wrap: nowrap !important;
                    gap: 12px !important;
                    justify-content: center !important;
                }
                .idol-stats-plan-card {
                    padding: 6px 4px !important;
                }
                .idol-stats-plan-col {
                    min-width: 0 !important;
                    flex: 1 !important;
                    max-width: 80px !important;
                    padding: 4px 6px !important;
                }
                .idol-stats-plan-col > div:last-child {
                    height: 8px !important;
                }
                .pssr-stat-icon-wrap {
                    width: 35px !important;
                    height: 105px !important;
                    border-radius: 0 9px 0 0 !important;
                    border-width: 1px !important;
                }
                .pssr-stat-icon-spacer {
                    width: 35px !important;
                }
                .pssr-stat-waffle-wrap {
                    width: 73px !important;
                    height: 105px !important;
                    border-radius: 8px 0 0 8px !important;
                    padding: 5px 3px !important;
                    border-width: 1px !important;
                }
                .pssr-stat-waffle-wrap.collapsed {
                    border-radius: 8px !important;
                }
                .pssr-waffle-badge {
                    top: 4px !important;
                    left: 5px !important;
                    right: 5px !important;
                    font-size: 0.36rem !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                .pssr-waffle-footer-badge {
                    bottom: 3px !important;
                    right: 4px !important;
                    font-size: 0.42rem !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                .pssr-waffle-footer-badge img {
                    width: 9px !important;
                    height: 9px !important;
                }
                .pssr-waffle-header {
                    font-size: 0.58rem !important;
                }
                .pssr-waffle-grid {
                    gap: 2.5px !important;
                    max-width: 50px !important;
                }
                .pssr-waffle-cell {
                    width: 13px !important;
                    height: 13px !important;
                    border-radius: 2.5px !important;
                }
                .pssr-waffle-footer {
                    font-size: 0.52rem !important;
                }
                .pssr-waffle-primastella {
                    width: 10px !important;
                    height: 10px !important;
                    bottom: 2px !important;
                    left: 2px !important;
                }
                .pssr-stat-icon-box {
                    border-radius: 0 9px 0 0 !important;
                }



                .pssr-char-badge {
                    height: 10px !important;
                    padding: 0 2.5px !important;
                    font-size: 4.5px !important;
                    font-weight: 700 !important;
                    border: none !important;
                    top: -1px !important;
                    left: -1px !important;
                    border-radius: 0 0 2px 0 !important;
                }

                .pssr-plan-badge {
                    width: 16px !important;
                    height: 16px !important;
                    border: none !important;
                    bottom: -1px !important;
                    right: -1px !important;
                    border-radius: 2px 2px 0 2px !important;
                    padding: 1.5px !important;
                }
                .plan-subgroup-col-left {
                    padding: 2px 4px !important;
                    gap: 3px !important;
                }
                .plan-subgroup-col-right {
                    padding: 2px 4px !important;
                    gap: 3px !important;
                }
                #plan-stat-details .pssr-stat-icons-container + div[style*="width: 1px"] {
                    margin: 4px 0 !important;
                }
                .plan-subgroup-col-left > div:first-child, .plan-subgroup-col-right > div:first-child {
                    margin-bottom: 2px !important;
                }
                #plan-stat-owned-group, #plan-stat-unowned-group {
                    padding: 4px 4px !important;
                    gap: 2px !important;
                }
                .source-stat-owned-group {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                }
                .source-stat-details, .source-stat-main, .source-stat-card {
                    padding-left: 2px !important;
                    padding-right: 2px !important;
                }
                .plan-group-title {
                    font-size: 0.6rem !important;
                }
                .pssr-stat-rate-pct {
                    font-size: 0.55rem !important;
                }
                .pssr-stat-rate-fraction {
                    font-size: 0.52rem !important;
                }
                body.is-capturing .pssr-stat-icon-wrap,
                body.is-capturing #plan-stat-details .pssr-stat-icon-wrap {
                    width: 60px !important;
                    height: 180px !important;
                    border-radius: 0 18px 0 0 !important;
                }
                body.is-capturing .pssr-stat-waffle-wrap {
                    width: 128px !important;
                    height: 180px !important;
                    border-radius: 12px 0 0 12px !important;
                    padding: 10px 6px !important;
                    box-shadow: none !important;
                    border-width: 1.5px !important;
                }
                body.is-capturing .pssr-waffle-badge {
                    top: 6px !important;
                    left: 8px !important;
                    right: auto !important;
                    font-size: 0.72rem !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                body.is-capturing .pssr-waffle-footer-badge {
                    bottom: 6px !important;
                    right: 8px !important;
                    font-size: 0.72rem !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                body.is-capturing .pssr-waffle-header {
                    font-size: 0.92rem !important;
                }
                body.is-capturing .pssr-waffle-grid {
                    gap: 5px !important;
                    max-width: 90px !important;
                }
                body.is-capturing .pssr-waffle-cell {
                    width: 22px !important;
                    height: 22px !important;
                    border-radius: 4px !important;
                    box-shadow: none !important;
                }
                body.is-capturing .pssr-waffle-footer {
                    font-size: 0.82rem !important;
                }
                body.is-capturing .pssr-waffle-primastella {
                    bottom: 4px !important;
                    left: 4px !important;
                    width: 18px !important;
                    height: 18px !important;
                }
                body.is-capturing .pssr-stat-icon-box {
                    border-radius: 0 18px 0 0 !important;
                }
                body.is-capturing .pssr-stat-icon-box img {
                    top: 0 !important;
                }
                body.is-capturing .pssr-char-badge {
                    height: 20px !important;
                    padding: 0 6px !important;
                    font-size: 9px !important;
                    font-weight: bold !important;
                    border-radius: 0 0 4px 0 !important;
                }
                body.is-capturing .pssr-plan-badge {
                    width: 26px !important;
                    height: 26px !important;
                    border-radius: 4px !important;
                    padding: 3px !important;
                }
                body.is-capturing .pssr-stat-icons-container,
                body.is-capturing .pssr-char-icons-container {
                    gap: 8px !important;
                    margin-top: 10px !important;
                    padding: 0 10px !important;
                }
                body.is-capturing .pssr-stat-icons-row {
                    gap: 8px !important;
                }
                body.is-capturing .plan-subgroup-col-left {
                    padding: 0px 6px 4px 4px !important;
                }
                body.is-capturing .plan-subgroup-col-right {
                    padding: 0px 4px 4px 6px !important;
                }
                body.is-capturing .plan-group-title {
                    font-size: 0.75rem !important;
                }
                body.is-capturing .pssr-stat-rate-pct {
                    font-size: 0.65rem !important;
                }
                body.is-capturing .pssr-stat-rate-fraction {
                    font-size: 0.58rem !important;
                }
                body:not(.is-capturing) .plan-subgroup-headers {
                    display: flex !important;
                }
                body:not(.is-capturing) .plan-subgroup-divider {
                    display: none !important;
                }
                body:not(.is-capturing) .plan-subgroup-title-row {
                    display: none !important;
                }
                body:not(.is-capturing) .plan-subgroup-columns-row {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    justify-content: center !important;
                    gap: 4px !important;
                    width: 100% !important;
                }
                body:not(.is-capturing) .plan-subgroup-col-left,
                body:not(.is-capturing) .plan-subgroup-col-right,
                body:not(.is-capturing) .plan-subgroup-col-left .pssr-stat-icons-container,
                body:not(.is-capturing) .plan-subgroup-col-right .pssr-stat-icons-container {
                    display: contents !important;
                }
                body:not(.is-capturing) .plan-subgroup-wrapper[data-active-subgroup="left"] .plan-subgroup-col-right {
                    display: none !important;
                }
                body:not(.is-capturing) .plan-subgroup-wrapper[data-active-subgroup="right"] .plan-subgroup-col-left {
                    display: none !important;
                }
                body:not(.is-capturing) .plan-subgroup-wrapper[data-plan="sense"] .plan-subgroup-header-btn.active {
                    background-color: rgba(255, 77, 141, 0.2) !important;
                    color: #ff4d8d !important;
                }
                body:not(.is-capturing) .plan-subgroup-wrapper[data-plan="logic"] .plan-subgroup-header-btn.active {
                    background-color: rgba(70, 164, 243, 0.2) !important;
                    color: #46a4f3 !important;
                }
                body:not(.is-capturing) .plan-subgroup-wrapper[data-plan="anomaly"] .plan-subgroup-header-btn.active {
                    background-color: rgba(255, 179, 0, 0.2) !important;
                    color: #ffb300 !important;
                }
            }
        </style>
        <div class="modal-content idol-possession-content">
            <!-- Selection View Header -->
            <div id="idol-possession-header-area" style="display: flex; justify-content: space-between; align-items: center; user-select: none; width: 100%;">
                <div class="idol-possession-title-wrap">
                    <div class="idol-possession-title-indicator"></div>
                    <span id="idol-possession-title">${text.title_select}</span>
                </div>
                <button id="btn-idol-possession-reset" class="calc-btn idol-possession-reset-btn">
                    ${text.btn_reset}
                </button>
            </div>

            <!-- Scrollable List Area -->
            <div id="idol-possession-scroll-area" class="idol-possession-scroll">
                <div id="idol-possession-desc-banner" class="idol-possession-desc-banner">
                    ${text.desc_select}
                </div>
                
                <div id="idol-possession-list-container" style="display: flex; flex-direction: column; gap: 18px;">
                    <!-- Dynamically populated character groups -->
                </div>
            </div>

            <!-- Bottom Button View -->
            <div id="idol-possession-bottom-area" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                <button id="btn-idol-possession-action" class="calc-btn idol-possession-confirm-btn">
                    ${globalTranslations[lang]?.ui_confirm || globalTranslations.ko.ui_confirm || '확인'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'idolPossession' }, "");
    modal.style.display = 'flex';

    let isClosing = false;
    const closeModal = () => {
        if (isClosing) return;
        isClosing = true;
        if (history.state && history.state.modalOpen === 'idolPossession') {
            history.back();
        } else {
            modal.remove();
        }
    };

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    const resetBtn = modal.querySelector('#btn-idol-possession-reset');
    resetBtn.onmouseenter = () => {
        resetBtn.style.backgroundColor = '#fca5a5';
        resetBtn.style.setProperty('color', '#450a0a', 'important');
        resetBtn.style.borderColor = '#f87171';
    };
    resetBtn.onmouseleave = () => {
        resetBtn.style.backgroundColor = '#fee2e2';
        resetBtn.style.setProperty('color', '#7f1d1d', 'important');
        resetBtn.style.borderColor = '#fca5a5';
    };
    resetBtn.onclick = () => {
        for (const key in ownedMap) {
            delete ownedMap[key];
        }
        renderSelectionView();
    };

    const listContainer = modal.querySelector('#idol-possession-list-container');

    // Render Selection view
    renderSelectionView();

    function renderSelectionView() {
        listContainer.innerHTML = '';

        CHARACTER_ORDER.forEach(charId => {
            const charCards = pssrCards.filter(c => getCharacterId(c.id) === charId);
            if (charCards.length === 0) return;

            const charColor = idolColors[charId] || '#cbd5e1';
            const charNameKey = `idol_name_${charId}`;
            const charName = globalTranslations[lang]?.[charNameKey] || globalTranslations.ko[charNameKey] || charId;

            const charSection = document.createElement('div');
            charSection.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

            charSection.innerHTML = `
                <div class="char-section-title">
                    <div class="char-section-indicator" style="background-color: ${charColor};"></div>
                    <span>${charName}</span>
                    <img class="char-section-icon" src="icons/idolicons/${charId}_c.png">
                </div>
                <div class="char-section-card" style="background-color: ${charColor}14;">
                    <div class="pssr-selection-grid"></div>
                </div>
            `;

            const grid = charSection.querySelector('.pssr-selection-grid');

            charCards.forEach(c => {
                const isOwned = !!ownedMap[c.id];
                const cardNameText = getLocalizedCardName(c, lang);

                const cardBox = document.createElement('div');
                cardBox.className = 'pssr-selection-item';
                cardBox.dataset.cardId = c.id;

                const imgStyle = isOwned
                    ? `border: 2px solid ${charColor}; filter: none; opacity: 1;`
                    : 'border: 1px solid #ccc; filter: grayscale(90%); opacity: 0.8;';

                const suffix = c.another ? '1.webp' : '2.webp';

                cardBox.innerHTML = `
                    <div class="pssr-card-thumb" style="${imgStyle}">
                        <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    </div>
                    <span class="pssr-card-name">
                        ${cardNameText}
                    </span>
                    ${isOwned ? `<div class="pssr-check-badge" style="background-color: ${charColor};">✓</div>` : ''}
                `;

                cardBox.addEventListener('click', () => {
                    const nextOwned = !ownedMap[c.id];
                    if (nextOwned) {
                        ownedMap[c.id] = true;
                    } else {
                        delete ownedMap[c.id];
                    }

                    // Update UI state without re-rendering everything to prevent scroll jumps
                    const thumb = cardBox.querySelector('.pssr-card-thumb');

                    if (nextOwned) {
                        thumb.style.border = `2px solid ${charColor}`;
                        thumb.style.filter = 'none';
                        thumb.style.opacity = '1';
                        if (!cardBox.querySelector('.pssr-check-badge')) {
                            const badge = document.createElement('div');
                            badge.className = 'pssr-check-badge';
                            badge.style.backgroundColor = charColor;
                            badge.textContent = '✓';
                            cardBox.appendChild(badge);
                        }
                    } else {
                        thumb.style.border = '1px solid #ccc';
                        thumb.style.filter = 'grayscale(90%)';
                        thumb.style.opacity = '0.8';
                        const badge = cardBox.querySelector('.pssr-check-badge');
                        if (badge) badge.remove();
                    }
                });

                grid.appendChild(cardBox);
            });

            listContainer.appendChild(charSection);
        });
    }

    // View Stats listener
    const actionBtn = modal.querySelector('#btn-idol-possession-action');
    actionBtn.onclick = () => {
        saveOwnedPssrs(ownedMap);
        showIdolPossessionStats(modal, pssrCards, ownedMap, lang, text, closeModal, renderSelectionView);
    };
}






function showIdolPossessionStats(modal, pssrCards, ownedMap, lang, text, closeModal, onBackToSelection) {
    const getAbsoluteUrl = (relPath) => new URL(relPath, window.location.href).href;
    const mixWithWhite = (hex, weight = 0.15) => {
        if (!hex) return '#ffffff';
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        const r = Math.round(((num >> 16) & 255) * weight + 255 * (1 - weight));
        const g = Math.round(((num >> 8) & 255) * weight + 255 * (1 - weight));
        const b = Math.round((num & 255) * weight + 255 * (1 - weight));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const _primastellaCache = {};
    const _primastellaImg = new Image();
    _primastellaImg.crossOrigin = 'anonymous';
    _primastellaImg.src = getAbsoluteUrl('icons/primastella.webp');
    const getTintedPrimastella = (color) => {
        if (_primastellaCache[color]) return _primastellaCache[color];
        if (!_primastellaImg.complete || !_primastellaImg.naturalWidth) return getAbsoluteUrl('icons/primastella.webp');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = _primastellaImg.naturalWidth;
            canvas.height = _primastellaImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(_primastellaImg, 0, 0);
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            _primastellaCache[color] = dataUrl;
            return dataUrl;
        } catch (e) {
            return getAbsoluteUrl('icons/primastella.webp');
        }
    };

    // Track collapsed state per waffle group across re-renders (undefined = use default)
    const waffleGroupState = {};

    const buildPssrIconsHtml = (cardsList, isOwnedList, { useSeriesBadgeForNormal = false, useWaffleChartForNormalSeries = false, useSubCategoryBadgeForFes = false, useWaffleChartForFesSubCategory = false, usePeriodBadgeForLimitedAndDist = false, useWaffleChartForLimitedPeriod = false, useSeriesBadgeForAnother = false, useWaffleChartForAnotherSeries = false, useWaffleChartForUnitName = false, useOsusumeBadgeForPlan = false, sourceColor = '#93c5fd' } = {}) => {
        let html = '';
        let hasVisibleCard = false;
        const seenSeries = new Set();
        const seenPeriod = new Set();
        const seenFes = new Set();
        const seenAnother = new Set();
        const seenUnit = new Set();
        cardsList.forEach(c => {
            if (useSeriesBadgeForAnother && useWaffleChartForAnotherSeries && c.another) {
                const ak = getCardAnotherKey(c);
                if (ak && !seenAnother.has(ak)) {
                    seenAnother.add(ak);
                    const anotherCards = cardsList.filter(card => card.another && getCardAnotherKey(card) === ak);
                    const totalAnother = anotherCards.length;
                    const ownedAnother = anotherCards.filter(card => (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id)).length;
                    const rateAnother = totalAnother > 0 ? Math.round((ownedAnother / totalAnother) * 100) : 0;
                    const anotherTitle = getLocalizedCardName(c, lang) || getAnotherBadgeText(c) || ak;

                    let waffleCellsHtml = '';
                    anotherCards.forEach(card => {
                        const cardOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id);
                        const cardCharId = getCharacterId(card.id);
                        const cardColor = idolColors[cardCharId] || '#ff4d8d';
                        const cardName = getLocalizedCardName(card, lang);

                        if (cardOwned) {
                            waffleCellsHtml += `<div class="pssr-waffle-cell owned" style="background-color: ${cardColor};" title="${cardName}"></div>`;
                        } else {
                            waffleCellsHtml += `<div class="pssr-waffle-cell unowned" style="background-color: #e2e8f0;" title="${cardName}"></div>`;
                        }
                    });

                    const fillBgAnother = `background: linear-gradient(to top, ${mixWithWhite(sourceColor, 0.15)} 0%, ${mixWithWhite(sourceColor, 0.15)} ${rateAnother}%, #ffffff ${rateAnother}%, #ffffff 100%);`;
                    const borderAnother = rateAnother === 100 ? `border-color: ${sourceColor};` : '';

                    const anotherGroupKey = `another-${ak}`;
                    const isCollapsed = waffleGroupState[anotherGroupKey] !== undefined ? waffleGroupState[anotherGroupKey] : true;
                    if (waffleGroupState[anotherGroupKey] === undefined) waffleGroupState[anotherGroupKey] = true;
                    const rateDisplayAnother = rateAnother === 100 ? `<img src="${getTintedPrimastella(sourceColor)}" style="width: 16px; height: 16px; vertical-align: middle;">` : `<span style="color: ${sourceColor};">${rateAnother}%</span>`;
                    html += `
                        <div class="pssr-stat-waffle-wrap${isCollapsed ? ' collapsed' : ''}" data-waffle-group="${anotherGroupKey}" style="${fillBgAnother} ${borderAnother}" title="${anotherTitle} (${ownedAnother}/${totalAnother})">
                            <span class="pssr-waffle-badge">${anotherTitle}</span>
                            <div class="pssr-waffle-grid"${getWaffleGridStyle(totalAnother)}>
                                ${waffleCellsHtml}
                            </div>
                            <span class="pssr-waffle-footer-badge">${rateDisplayAnother} <span style="font-size: 0.85em; opacity: 0.85; color: #666;">(${ownedAnother}/${totalAnother})</span></span>
                        </div>
                    `;
                }
            }
            if (useSubCategoryBadgeForFes && useWaffleChartForFesSubCategory && c.source === 'limited_f') {
                const fesOrder = getFesSubCategoryOrder(c);
                if (fesOrder !== 999 && (fesOrder === 1 || fesOrder === 2) && !seenFes.has(fesOrder)) {
                    seenFes.add(fesOrder);
                    const fesCards = cardsList.filter(card => card.source === 'limited_f' && getFesSubCategoryOrder(card) === fesOrder);
                    const totalFes = fesCards.length;
                    const ownedFes = fesCards.filter(card => (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id)).length;
                    const rateFes = totalFes > 0 ? Math.round((ownedFes / totalFes) * 100) : 0;
                    const fesTitle = getFesSubCategoryTitle(fesOrder) || (fesOrder === 1 ? 'NIA' : 'HIF');

                    let waffleCellsHtml = '';
                    fesCards.forEach(card => {
                        const cardOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id);
                        const cardCharId = getCharacterId(card.id);
                        const cardColor = idolColors[cardCharId] || '#ff4d8d';
                        const cardName = getLocalizedCardName(card, lang);

                        if (cardOwned) {
                            waffleCellsHtml += `<div class="pssr-waffle-cell owned" style="background-color: ${cardColor};" title="${cardName}"></div>`;
                        } else {
                            waffleCellsHtml += `<div class="pssr-waffle-cell unowned" style="background-color: #e2e8f0;" title="${cardName}"></div>`;
                        }
                    });

                    const fillBgFes = `background: linear-gradient(to top, ${mixWithWhite(sourceColor, 0.15)} 0%, ${mixWithWhite(sourceColor, 0.15)} ${rateFes}%, #ffffff ${rateFes}%, #ffffff 100%);`;
                    const borderFes = rateFes === 100 ? `border-color: ${sourceColor};` : '';

                    const fesGroupKey = `fes-${fesOrder}`;
                    const isCollapsedFes = waffleGroupState[fesGroupKey] !== undefined ? waffleGroupState[fesGroupKey] : false;
                    const rateDisplayFes = rateFes === 100 ? `<img src="${getTintedPrimastella(sourceColor)}" style="width: 16px; height: 16px; vertical-align: middle;">` : `<span style="color: ${sourceColor};">${rateFes}%</span>`;
                    html += `
                        <div class="pssr-stat-waffle-wrap${isCollapsedFes ? ' collapsed' : ''}" data-waffle-group="${fesGroupKey}" style="${fillBgFes} ${borderFes}" title="${fesTitle} (${ownedFes}/${totalFes})">
                            <span class="pssr-waffle-badge">${fesTitle}</span>
                            <div class="pssr-waffle-grid"${getWaffleGridStyle(totalFes)}>
                                ${waffleCellsHtml}
                            </div>
                            <span class="pssr-waffle-footer-badge">${rateDisplayFes} <span style="font-size: 0.85em; opacity: 0.85; color: #666;">(${ownedFes}/${totalFes})</span></span>
                        </div>
                    `;
                }
            }
            if (usePeriodBadgeForLimitedAndDist && useWaffleChartForLimitedPeriod && (c.source === 'limited' || c.source === 'dist')) {
                const periodKey = getCardPeriodKey(c);
                if (periodKey && !seenPeriod.has(periodKey)) {
                    seenPeriod.add(periodKey);
                    const periodCards = cardsList.filter(card => (card.source === 'limited' || card.source === 'dist') && getCardPeriodKey(card) === periodKey);
                    const totalPeriod = periodCards.length;
                    const ownedPeriod = periodCards.filter(card => (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id)).length;
                    const ratePeriod = totalPeriod > 0 ? Math.round((ownedPeriod / totalPeriod) * 100) : 0;
                    const periodTitle = getPeriodWaffleTitle(periodKey, lang) || periodKey;

                    let waffleCellsHtml = '';
                    periodCards.forEach(card => {
                        const cardOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id);
                        const cardCharId = getCharacterId(card.id);
                        const cardColor = idolColors[cardCharId] || '#ff4d8d';
                        const cardName = getLocalizedCardName(card, lang);

                        if (cardOwned) {
                            waffleCellsHtml += `<div class="pssr-waffle-cell owned" style="background-color: ${cardColor};" title="${cardName}"></div>`;
                        } else {
                            waffleCellsHtml += `<div class="pssr-waffle-cell unowned" style="background-color: #e2e8f0;" title="${cardName}"></div>`;
                        }
                    });

                    const fillBgPeriod = `background: linear-gradient(to top, ${mixWithWhite(sourceColor, 0.15)} 0%, ${mixWithWhite(sourceColor, 0.15)} ${ratePeriod}%, #ffffff ${ratePeriod}%, #ffffff 100%);`;
                    const borderPeriod = ratePeriod === 100 ? `border-color: ${sourceColor};` : '';

                    const periodGroupKey = `period-${periodKey}`;
                    const isCollapsedPeriod = waffleGroupState[periodGroupKey] !== undefined ? waffleGroupState[periodGroupKey] : false;
                    const rateDisplayPeriod = ratePeriod === 100 ? `<img src="${getTintedPrimastella(sourceColor)}" style="width: 16px; height: 16px; vertical-align: middle;">` : `<span style="color: ${sourceColor};">${ratePeriod}%</span>`;
                    html += `
                        <div class="pssr-stat-waffle-wrap${isCollapsedPeriod ? ' collapsed' : ''}" data-waffle-group="${periodGroupKey}" style="${fillBgPeriod} ${borderPeriod}" title="${periodTitle} (${ownedPeriod}/${totalPeriod})">
                            <span class="pssr-waffle-badge">${periodTitle}</span>
                            <div class="pssr-waffle-grid"${getWaffleGridStyle(totalPeriod)}>
                                ${waffleCellsHtml}
                            </div>
                            <span class="pssr-waffle-footer-badge">${rateDisplayPeriod} <span style="font-size: 0.85em; opacity: 0.85; color: #666;">(${ownedPeriod}/${totalPeriod})</span></span>
                        </div>
                    `;
                }
            }
            if (useWaffleChartForUnitName && c.source === 'limited_u') {
                const unitKey = (c.name || '').trim();
                if (unitKey && !seenUnit.has(unitKey)) {
                    seenUnit.add(unitKey);
                    const unitCards = cardsList.filter(card => card.source === 'limited_u' && (card.name || '').trim() === unitKey);
                    const totalUnit = unitCards.length;
                    const ownedUnit = unitCards.filter(card => (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id)).length;
                    const rateUnit = totalUnit > 0 ? Math.round((ownedUnit / totalUnit) * 100) : 0;
                    const unitTitle = getLocalizedCardName(c, lang);

                    let waffleCellsHtml = '';
                    unitCards.forEach(card => {
                        const cardOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id);
                        const cardCharId = getCharacterId(card.id);
                        const cardColor = idolColors[cardCharId] || '#ff4d8d';
                        const cardName = getLocalizedCardName(card, lang);

                        if (cardOwned) {
                            waffleCellsHtml += `<div class="pssr-waffle-cell owned" style="background-color: ${cardColor};" title="${cardName}"></div>`;
                        } else {
                            waffleCellsHtml += `<div class="pssr-waffle-cell unowned" style="background-color: #e2e8f0;" title="${cardName}"></div>`;
                        }
                    });

                    const fillBgUnit = `background: linear-gradient(to top, ${mixWithWhite(sourceColor, 0.15)} 0%, ${mixWithWhite(sourceColor, 0.15)} ${rateUnit}%, #ffffff ${rateUnit}%, #ffffff 100%);`;
                    const borderUnit = rateUnit === 100 ? `border-color: ${sourceColor};` : '';

                    const unitGroupKey = `unit-${unitKey}`;
                    const isCollapsedUnit = waffleGroupState[unitGroupKey] !== undefined ? waffleGroupState[unitGroupKey] : false;
                    const rateDisplayUnit = rateUnit === 100 ? `<img src="${getTintedPrimastella(sourceColor)}" style="width: 16px; height: 16px; vertical-align: middle;">` : `<span style="color: ${sourceColor};">${rateUnit}%</span>`;
                    html += `
                        <div class="pssr-stat-waffle-wrap${isCollapsedUnit ? ' collapsed' : ''}" data-waffle-group="${unitGroupKey}" style="${fillBgUnit} ${borderUnit}" title="${unitTitle} (${ownedUnit}/${totalUnit})">
                            <span class="pssr-waffle-badge">${unitTitle}</span>
                            <div class="pssr-waffle-grid"${getWaffleGridStyle(totalUnit)}>
                                ${waffleCellsHtml}
                            </div>
                            <span class="pssr-waffle-footer-badge">${rateDisplayUnit} <span style="font-size: 0.85em; opacity: 0.85; color: #666;">(${ownedUnit}/${totalUnit})</span></span>
                        </div>
                    `;
                }
            }
            if (useSeriesBadgeForNormal && useWaffleChartForNormalSeries && (c.source || 'normal') === 'normal' && !c.another) {
                const groupKey = getNormalCardGroupKey(c);
                if (groupKey && !seenSeries.has(groupKey)) {
                    seenSeries.add(groupKey);
                    const seriesCards = cardsList.filter(card => (card.source || 'normal') === 'normal' && !card.another && getNormalCardGroupKey(card) === groupKey);
                    const totalSeries = seriesCards.length;
                    const ownedSeries = seriesCards.filter(card => (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id)).length;
                    const rateSeries = totalSeries > 0 ? Math.round((ownedSeries / totalSeries) * 100) : 0;
                    const seriesTitle = getNormalCardGroupTitle(c, lang);

                    let waffleCellsHtml = '';
                    seriesCards.forEach(card => {
                        const cardOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(card.id);
                        const cardCharId = getCharacterId(card.id);
                        const cardColor = idolColors[cardCharId] || '#ff4d8d';
                        const cardName = getLocalizedCardName(card, lang);

                        if (cardOwned) {
                            waffleCellsHtml += `<div class="pssr-waffle-cell owned" style="background-color: ${cardColor};" title="${cardName}"></div>`;
                        } else {
                            waffleCellsHtml += `<div class="pssr-waffle-cell unowned" style="background-color: #e2e8f0;" title="${cardName}"></div>`;
                        }
                    });

                    const fillBgSeries = `background: linear-gradient(to top, ${mixWithWhite(sourceColor, 0.15)} 0%, ${mixWithWhite(sourceColor, 0.15)} ${rateSeries}%, #ffffff ${rateSeries}%, #ffffff 100%);`;
                    const borderSeries = rateSeries === 100 ? `border-color: ${sourceColor};` : '';

                    const seriesGroupKey = `normal-${groupKey}`;
                    const isCollapsedSeries = waffleGroupState[seriesGroupKey] !== undefined ? waffleGroupState[seriesGroupKey] : false;
                    const rateDisplaySeries = rateSeries === 100 ? `<img src="${getTintedPrimastella(sourceColor)}" style="width: 16px; height: 16px; vertical-align: middle;">` : `<span style="color: ${sourceColor};">${rateSeries}%</span>`;
                    html += `
                        <div class="pssr-stat-waffle-wrap${isCollapsedSeries ? ' collapsed' : ''}" data-waffle-group="${seriesGroupKey}" style="${fillBgSeries} ${borderSeries}" title="${seriesTitle} (${ownedSeries}/${totalSeries})">
                            <span class="pssr-waffle-badge">${seriesTitle}</span>
                            <div class="pssr-waffle-grid"${getWaffleGridStyle(totalSeries)}>
                                ${waffleCellsHtml}
                            </div>
                            <span class="pssr-waffle-footer-badge">${rateDisplaySeries} <span style="font-size: 0.85em; opacity: 0.85; color: #666;">(${ownedSeries}/${totalSeries})</span></span>
                        </div>
                    `;
                }
            }
            const suffix = c.another ? '1.webp' : '2.webp';
            const cardName = getLocalizedCardName(c, lang);
            const charId = getCharacterId(c.id);
            const charColor = idolColors[charId] || '#cbd5e1';

            const isOwned = (isOwnedList === true || isOwnedList === false) ? isOwnedList : isCardOwned(c.id);

            const containerStyle = isOwned
                ? `border: 1.5px solid ${charColor};`
                : `border: 1px solid #ccc;`;

            const imgStyle = isOwned
                ? `display: block; opacity: 1;`
                : `display: block; filter: grayscale(95%) brightness(0.9); -webkit-filter: grayscale(95%) brightness(0.9); opacity: 0.7;`;

            let badgeText = getBadgeText(c, lang);
            if (useSeriesBadgeForNormal && (c.source || 'normal') === 'normal' && !c.another) {
                const normalBadge = getNormalCardBadgeText(c, lang);
                if (normalBadge) {
                    badgeText = normalBadge;
                }
            } else if (useSubCategoryBadgeForFes && c.source === 'limited_f') {
                const type = c.category || c.type;
                if (type === 'nia' || type === 'campus') {
                    badgeText = 'NIA';
                } else if (type === 'hif') {
                    badgeText = 'HIF';
                }
            } else if (usePeriodBadgeForLimitedAndDist && (c.source === 'limited' || c.source === 'dist' || c.another)) {
                const periodKey = getCardPeriodKey(c);
                if (periodKey === 'season') {
                    badgeText = (lang === 'ja' || lang === 'en') ? 'Sea.' : '시즌';
                } else if (periodKey === 'live') {
                    badgeText = (lang === 'ja' || lang === 'en') ? 'Live' : '라이브';
                }
            }

            let planBadgeIcon = `icons/${c.plan || 'sense'}.webp`;
            if (useOsusumeBadgeForPlan) {
                let os = getOsusume(c, pssrCards);
                if (os === 'preservation') os = 'fullpower';
                if (os) {
                    planBadgeIcon = `icons/${os}.webp`;
                }
            }

            // Determine waffle group for this card
            let waffleGroup = '';
            if (useSeriesBadgeForAnother && useWaffleChartForAnotherSeries && c.another) {
                const ak = getCardAnotherKey(c);
                if (ak) waffleGroup = `another-${ak}`;
            } else if (useSubCategoryBadgeForFes && useWaffleChartForFesSubCategory && c.source === 'limited_f') {
                const fo = getFesSubCategoryOrder(c);
                if (fo === 1 || fo === 2) waffleGroup = `fes-${fo}`;
            } else if (usePeriodBadgeForLimitedAndDist && useWaffleChartForLimitedPeriod && (c.source === 'limited' || c.source === 'dist')) {
                const pk = getCardPeriodKey(c);
                if (pk) waffleGroup = `period-${pk}`;
            } else if (useWaffleChartForUnitName && c.source === 'limited_u') {
                const uk = (c.name || '').trim();
                if (uk) waffleGroup = `unit-${uk}`;
            } else if (useSeriesBadgeForNormal && useWaffleChartForNormalSeries && (c.source || 'normal') === 'normal' && !c.another) {
                const groupKey = getNormalCardGroupKey(c);
                if (groupKey) waffleGroup = `normal-${groupKey}`;
            }
            const waffleGroupAttr = waffleGroup ? ` data-waffle-group="${waffleGroup}"` : '';
            const isGroupCollapsed = waffleGroup && (waffleGroupState[waffleGroup] !== undefined ? waffleGroupState[waffleGroup] : waffleGroup.startsWith('another-'));
            if (!isGroupCollapsed) hasVisibleCard = true;
            const hideStyle = isGroupCollapsed ? ' display: none;' : '';

            html += `
                <div class="pssr-stat-icon-wrap"${waffleGroupAttr} style="${containerStyle}${hideStyle}" title="${cardName}">
                    <div class="pssr-stat-icon-box">
                        <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                    </div>
                    <span class="pssr-char-badge" style="background-color: ${charColor};">${badgeText}</span>
                    <img class="pssr-plan-badge" src="${planBadgeIcon}">
                </div>
            `;
        });

        const spacerHide = hasVisibleCard ? '' : ' style="display: none;"';
        for (let i = 0; i < 12; i++) {
            html += `<div class="pssr-stat-icon-spacer"${spacerHide}></div>`;
        }
        return html;
    };
    const modalContent = modal.querySelector('.modal-content');
    const scrollArea = modal.querySelector('#idol-possession-scroll-area');
    const bottomArea = modal.querySelector('#idol-possession-bottom-area');
    const headerArea = modal.querySelector('#idol-possession-header-area');
    let firstPlaceCharColor = '#ff4d8d';

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `(${yyyy}. ${mm}. ${dd}.)`;

    modalContent.style.position = 'relative';
    headerArea.style.position = 'relative';
    headerArea.style.zIndex = '1';
    scrollArea.style.position = 'relative';
    scrollArea.style.zIndex = '1';
    bottomArea.style.position = 'relative';
    bottomArea.style.zIndex = '1';

    // Change title
    modal.querySelector('#idol-possession-title').textContent = text.title_stats;

    // Add header content with title and save image button on the right
    headerArea.style.display = 'flex';
    headerArea.style.alignItems = 'flex-end';
    headerArea.style.userSelect = 'none';
    headerArea.style.width = '100%';
    headerArea.style.paddingBottom = '8px';
    headerArea.style.boxSizing = 'border-box';

    headerArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; flex: 1; gap: 0; margin-right: 5px;">
            <div class="possession-title-wrap" style="display: flex; align-items: flex-end; gap: 8px; font-size: 1.3rem; font-weight: 800; color: #333; width: 100%;">
                <svg id="idol-possession-title-icon" class="possession-title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff4d8d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px; flex-shrink: 0; margin-bottom: -1px;">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 2px;">
                    <span id="idol-possession-title">${text.title_stats}</span>
                    <span class="possession-title-date" style="font-size: 0.7em; font-weight: 500; color: #666; margin-left: 4px;">${formattedDate}</span>
                </div>
            </div>
            <div id="possession-header-line" style="width: calc(100% - 20px); height: 3px; background-color: #ff4d8d; margin-top: -3px; margin-left: 20px; z-index: 5;"></div>
        </div>
        <button id="btn-idol-possession-save" class="calc-btn" style="height: 34px; padding: 0 16px; background-color: #ff4d8d; color: #fff; font-weight: bold; font-size: 0.85rem; border: none; border-radius: 0 8px 8px 0; cursor: pointer; transition: none !important; display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            ${text.btn_save_image}
        </button>
    `;

    bottomArea.innerHTML = '';

    let includeAnother = loadIncludeAnother();
    let includeDist = loadIncludeDist();
    let show100PercentOnly = loadShow100PercentOnly();
    let showHeatmapNumbers = false;
    let showOverallDetail = false;
    let heatmapViewMode = 'source'; // 'source' or 'subtype'
    let charStatsViewMode = 'plan'; // 'plan' (osusume/subtype) or 'source' (standard category)
    let expandedCharIds = new Set();
    const isCardOwned = (cardId) => show100PercentOnly || !!ownedMap[cardId];

    function updateStatsUI() {
        let activeCards = pssrCards;
        if (!includeAnother) {
            activeCards = activeCards.filter(c => !c.another);
        }
        if (!includeDist) {
            activeCards = activeCards.filter(c => c.source !== 'dist');
        }

        // Calculate statistics
        const totalCount = activeCards.length;
        let ownedCount = 0;
        activeCards.forEach(c => {
            if (isCardOwned(c.id)) ownedCount++;
        });

        const overallRate = formatRate(ownedCount, totalCount);

        const numRate = parseFloat(overallRate);
        let rankImg = 'r.png';
        if (numRate >= 90) rankImg = 'ssr.png';
        else if (numRate >= 50) rankImg = 'sr.png';
        const rankImgHtml = `<img class="idol-stats-overall-rank-icon" src="icons/${rankImg}" style="height: 46px; object-fit: contain; flex-shrink: 0; vertical-align: middle;">`;

        // Calculate by plan
        const statsByPlan = {
            sense: { total: 0, owned: 0 },
            logic: { total: 0, owned: 0 },
            anomaly: { total: 0, owned: 0 }
        };
        // Calculate by source
        const statsBySource = {
            normal: { total: 0, owned: 0 },
            limited: { total: 0, owned: 0 },
            limited_f: { total: 0, owned: 0 },
            limited_u: { total: 0, owned: 0 },
            dist: { total: 0, owned: 0 },
            another: { total: 0, owned: 0 }
        };
        // Calculate by character
        const statsByChar = {};
        CHARACTER_ORDER.forEach(charId => {
            statsByChar[charId] = { total: 0, owned: 0 };
        });

        // Calculate by subtype
        const statsBySubtype = {
            goodcondition: { total: 0, owned: 0 },
            concentration: { total: 0, owned: 0 },
            goodimpression: { total: 0, owned: 0 },
            motivation: { total: 0, owned: 0 },
            enthusiasm: { total: 0, owned: 0 },
            fullpower: { total: 0, owned: 0 }
        };

        activeCards.forEach(c => {
            const charId = getCharacterId(c.id);
            const plan = c.plan || 'sense';
            const source = c.another ? 'another' : (c.source || 'normal');
            const isOwned = isCardOwned(c.id);

            if (statsByPlan[plan] !== undefined) {
                statsByPlan[plan].total++;
                if (isOwned) statsByPlan[plan].owned++;
            }
            if (statsBySource[source] !== undefined) {
                statsBySource[source].total++;
                if (isOwned) statsBySource[source].owned++;
            }
            if (statsByChar[charId] !== undefined) {
                statsByChar[charId].total++;
                if (isOwned) statsByChar[charId].owned++;
            }

            let os = getOsusume(c, pssrCards);
            if (os === 'preservation') os = 'fullpower';
            if (statsBySubtype[os] !== undefined) {
                statsBySubtype[os].total++;
                if (isOwned) statsBySubtype[os].owned++;
            }
        });

        // Determine the plan with the highest possession rate
        let highestPlan = 'sense';
        let maxPlanRate = -1;
        ['sense', 'logic', 'anomaly'].forEach(plan => {
            const s = statsByPlan[plan];
            const rate = s.total > 0 ? (s.owned / s.total) * 100 : 0;
            if (rate > maxPlanRate) {
                maxPlanRate = rate;
                highestPlan = plan;
            }
        });

        // ------------------ Plan Radar Chart SVG ------------------
        const cx = 85;
        const cy = 118;
        const R = 58;

        const PLAN_COLORS = {
            sense: '#ff4d8d',
            logic: '#46a4f3',
            anomaly: '#ffb300'
        };
        const highestPlanColor = PLAN_COLORS[highestPlan] || '#ff4d8d';
        const radarIconSize = 22;
        const radarIconHalf = radarIconSize / 2;

        const pSense = statsByPlan.sense.total > 0 ? (statsByPlan.sense.owned / statsByPlan.sense.total) * 100 : 0;
        const pLogic = statsByPlan.logic.total > 0 ? (statsByPlan.logic.owned / statsByPlan.logic.total) * 100 : 0;
        const pAnomaly = statsByPlan.anomaly.total > 0 ? (statsByPlan.anomaly.owned / statsByPlan.anomaly.total) * 100 : 0;

        const rS = R * (pSense / 100);
        const rL = R * (pLogic / 100);
        const rA = R * (pAnomaly / 100);

        // Find the highest plan percentage to make its vertex dot larger
        const maxPlanPct = Math.max(pSense, pLogic, pAnomaly);
        const rDotS = (maxPlanPct > 0 && pSense === maxPlanPct) ? 4.3 : 3.5;
        const rDotL = (maxPlanPct > 0 && pLogic === maxPlanPct) ? 4.3 : 3.5;
        const rDotA = (maxPlanPct > 0 && pAnomaly === maxPlanPct) ? 4.3 : 3.5;

        // Custom text colors for percentage labels (highlight highest)
        const colorSenseText = (maxPlanPct > 0 && pSense === maxPlanPct) ? PLAN_COLORS.sense : '#555';
        const colorLogicText = (maxPlanPct > 0 && pLogic === maxPlanPct) ? PLAN_COLORS.logic : '#555';
        const colorAnomalyText = (maxPlanPct > 0 && pAnomaly === maxPlanPct) ? PLAN_COLORS.anomaly : '#555';

        // Concentric grid triangles for 25%, 50%, 75%, 100%
        let gridHtml = '';
        [25, 50, 75, 100].forEach(level => {
            const rLvl = R * (level / 100);
            const pt1 = `${cx},${cy - rLvl}`;
            const pt2 = `${cx + 0.866 * rLvl},${cy + 0.5 * rLvl}`;
            const pt3 = `${cx - 0.866 * rLvl},${cy + 0.5 * rLvl}`;
            gridHtml += `<polygon points="${pt1} ${pt2} ${pt3}" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />`;
        });

        const planRadarChartHtml = `
            <svg viewBox="0 0 170 205" width="170" height="205" style="overflow: visible; display: block; margin: auto;">
                <defs>
                    <filter id="glow-plan-sense" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="0.8" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#ff4d8d" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-plan-logic" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="0.8" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#46a4f3" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-plan-anomaly" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="0.8" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#ffb300" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <!-- Grid Triangles -->
                ${gridHtml}
                <!-- Axis lines -->
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="${cx}" y1="${cy}" x2="${cx + 0.866 * R}" y2="${cy + 0.5 * R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="${cx}" y1="${cy}" x2="${cx - 0.866 * R}" y2="${cy + 0.5 * R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                
                <!-- Axis Icon Labels -->
                <image href="icons/sense.webp" x="${cx - radarIconHalf}" y="${cy - R - 38}" width="${radarIconSize}" height="${radarIconSize}" ${maxPlanPct > 0 && pSense === maxPlanPct ? 'filter="url(#glow-plan-sense)"' : ''} />
                <image href="icons/anomaly.webp" x="${cx + 0.866 * R + 10}" y="${cy + 0.5 * R - radarIconHalf + 4}" width="${radarIconSize}" height="${radarIconSize}" ${maxPlanPct > 0 && pAnomaly === maxPlanPct ? 'filter="url(#glow-plan-anomaly)"' : ''} />
                <image href="icons/logic.webp" x="${cx - 0.866 * R - radarIconSize - 10}" y="${cy + 0.5 * R - radarIconHalf + 4}" width="${radarIconSize}" height="${radarIconSize}" ${maxPlanPct > 0 && pLogic === maxPlanPct ? 'filter="url(#glow-plan-logic)"' : ''} />
                
                <!-- Axis Percent texts -->
                <text x="${cx}" y="${cy - R - 6}" text-anchor="middle" font-size="9" font-weight="800" fill="${colorSenseText}">${Math.round(pSense)}%</text>
                <text x="${cx + 0.866 * R + 20}" y="${cy + 0.5 * R + 26}" text-anchor="middle" font-size="9" font-weight="800" fill="${colorAnomalyText}">${Math.round(pAnomaly)}%</text>
                <text x="${cx - 0.866 * R - 20}" y="${cy + 0.5 * R + 26}" text-anchor="middle" font-size="9" font-weight="800" fill="${colorLogicText}">${Math.round(pLogic)}%</text>
                
                <!-- Possession Polygon -->
                <polygon points="${cx},${cy - rS} ${cx + 0.866 * rA},${cy + 0.5 * rA} ${cx - 0.866 * rL},${cy + 0.5 * rL}" 
                         fill="${hexToRgba(highestPlanColor, 0.22)}" 
                         stroke="${highestPlanColor}" 
                         stroke-width="2" 
                         stroke-linejoin="round" />
                <!-- Vertex Dots -->
                <circle class="radar-vertex-dot" cx="${cx}" cy="${cy - rS}" r="${rDotS}" fill="${PLAN_COLORS.sense}" stroke="#fff" stroke-width="1.5" />
                <circle class="radar-vertex-dot" cx="${cx + 0.866 * rA}" cy="${cy + 0.5 * rA}" r="${rDotA}" fill="${PLAN_COLORS.anomaly}" stroke="#fff" stroke-width="1.5" />
                <circle class="radar-vertex-dot" cx="${cx - 0.866 * rL}" cy="${cy + 0.5 * rL}" r="${rDotL}" fill="${PLAN_COLORS.logic}" stroke="#fff" stroke-width="1.5" />
            </svg>
        `;

        // ------------------ Subtype Radar Chart SVG ------------------
        const angles = [-Math.PI / 2, -Math.PI / 6, Math.PI / 6, Math.PI / 2, 5 * Math.PI / 6, 7 * Math.PI / 6];
        const hexCx = 85;
        const hexCy = 102;
        const hexR = 58;

        const pSub = {
            goodcondition: statsBySubtype.goodcondition.total > 0 ? (statsBySubtype.goodcondition.owned / statsBySubtype.goodcondition.total) * 100 : 0,
            concentration: statsBySubtype.concentration.total > 0 ? (statsBySubtype.concentration.owned / statsBySubtype.concentration.total) * 100 : 0,
            goodimpression: statsBySubtype.goodimpression.total > 0 ? (statsBySubtype.goodimpression.owned / statsBySubtype.goodimpression.total) * 100 : 0,
            motivation: statsBySubtype.motivation.total > 0 ? (statsBySubtype.motivation.owned / statsBySubtype.motivation.total) * 100 : 0,
            enthusiasm: statsBySubtype.enthusiasm.total > 0 ? (statsBySubtype.enthusiasm.owned / statsBySubtype.enthusiasm.total) * 100 : 0,
            fullpower: statsBySubtype.fullpower.total > 0 ? (statsBySubtype.fullpower.owned / statsBySubtype.fullpower.total) * 100 : 0
        };

        const rSub = [
            hexR * (pSub.goodcondition / 100),
            hexR * (pSub.concentration / 100),
            hexR * (pSub.fullpower / 100),
            hexR * (pSub.enthusiasm / 100),
            hexR * (pSub.motivation / 100),
            hexR * (pSub.goodimpression / 100)
        ];

        let polyPoints = '';
        for (let i = 0; i < 6; i++) {
            const x = hexCx + rSub[i] * Math.cos(angles[i]);
            const y = hexCy + rSub[i] * Math.sin(angles[i]);
            polyPoints += `${x},${y} `;
        }

        let gridHexHtml = '';
        [25, 50, 75, 100].forEach(level => {
            const rLvl = hexR * (level / 100);
            let pts = [];
            for (let i = 0; i < 6; i++) {
                pts.push(`${hexCx + rLvl * Math.cos(angles[i])},${hexCy + rLvl * Math.sin(angles[i])}`);
            }
            gridHexHtml += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />`;
        });

        const SUBTYPE_KEYS = ['goodcondition', 'concentration', 'fullpower', 'enthusiasm', 'motivation', 'goodimpression'];
        const SUBTYPE_TO_PLAN = {
            goodcondition: 'sense', concentration: 'sense',
            goodimpression: 'logic', motivation: 'logic',
            enthusiasm: 'anomaly', fullpower: 'anomaly'
        };
        let highestSubtype = 'goodcondition';
        let highestSubRate = -1;
        for (const st of SUBTYPE_KEYS) {
            if (pSub[st] > highestSubRate) {
                highestSubRate = pSub[st];
                highestSubtype = st;
            }
        }
        const subtypePolygonColor = PLAN_COLORS[SUBTYPE_TO_PLAN[highestSubtype]] || '#ff4d8d';
        let subtypeIconsAndTextsHtml = '';
        for (let i = 0; i < 6; i++) {
            const key = SUBTYPE_KEYS[i];
            const angle = angles[i];

            // Icon position
            const xIcon = hexCx + (hexR + 24) * Math.cos(angle) - radarIconHalf;
            let yIcon = hexCy + (hexR + 24) * Math.sin(angle) - radarIconHalf;
            if (i === 0) {
                yIcon -= 2; // Move the 12 o'clock icon 2px upwards (lowered by 4px from -6)
            } else if (i === 2 || i === 3 || i === 4) {
                yIcon -= 6; // Raise fullpower, enthusiasm (강기), and motivation icons by 6px
            }

            // Percent text sits directly below each icon.
            const xText = hexCx + (hexR + 24) * Math.cos(angle);
            let yText = hexCy + (hexR + 24) * Math.sin(angle) + (i === 0 ? 14 : 21);
            if (i === 0) {
                yText += 4; // Lower 12 o'clock text by 1px
            } else if (i === 2 || i === 3 || i === 4) {
                yText -= 6; // Raise fullpower, enthusiasm (강기), and motivation texts by 6px
            }

            const isHighest = (highestSubRate > 0 && pSub[key] === highestSubRate);
            const planOfSubtype = SUBTYPE_TO_PLAN[key];
            const filterAttr = isHighest ? `filter="url(#glow-sub-${planOfSubtype})"` : '';
            const textColor = isHighest ? PLAN_COLORS[planOfSubtype] : '#555';

            subtypeIconsAndTextsHtml += `
                <image href="icons/${key}.webp" x="${xIcon}" y="${yIcon}" width="${radarIconSize}" height="${radarIconSize}" ${filterAttr} />
                <text x="${xText}" y="${yText}" text-anchor="middle" font-size="9" font-weight="800" fill="${textColor}">${Math.round(pSub[key])}%</text>
            `;
        }

        const subtypeRadarChartHtml = `
            <svg viewBox="0 0 170 205" width="170" height="205" style="overflow: visible; display: block; margin: auto;">
                <defs>
                    <filter id="glow-sub-sense" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="1.2" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#ff4d8d" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-sub-logic" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="1.2" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#46a4f3" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-sub-anomaly" x="-30%" y="-30%" width="160%" height="160%">
                        <feMorphology operator="dilate" radius="1.2" in="SourceAlpha" result="expanded" />
                        <feGaussianBlur stdDeviation="1.4" in="expanded" result="blurred" />
                        <feFlood flood-color="#ffb300" flood-opacity="1" result="color" />
                        <feComposite in="color" in2="blurred" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <!-- Grid Hexagons -->
                ${gridHexHtml}
                <!-- Axis lines -->
                ${angles.map(angle => `
                    <line x1="${hexCx}" y1="${hexCy}" x2="${hexCx + hexR * Math.cos(angle)}" y2="${hexCy + hexR * Math.sin(angle)}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                `).join('')}
                <!-- Icons and Texts -->
                ${subtypeIconsAndTextsHtml}
                <!-- Polygon -->
                <polygon points="${polyPoints.trim()}" 
                         fill="${hexToRgba(subtypePolygonColor, 0.22)}" 
                         stroke="${subtypePolygonColor}" 
                         stroke-width="2" 
                         stroke-linejoin="round" />
                <!-- Vertex Dots -->
                ${(() => {
                const SUBTYPE_PLAN_COLORS = {
                    goodcondition: PLAN_COLORS.sense,
                    concentration: PLAN_COLORS.sense,
                    goodimpression: PLAN_COLORS.logic,
                    motivation: PLAN_COLORS.logic,
                    enthusiasm: PLAN_COLORS.anomaly,
                    fullpower: PLAN_COLORS.anomaly
                };
                return rSub.map((r, i) => {
                    const x = hexCx + r * Math.cos(angles[i]);
                    const y = hexCy + r * Math.sin(angles[i]);
                    const key = SUBTYPE_KEYS[i];
                    const dotColor = SUBTYPE_PLAN_COLORS[key] || firstPlaceCharColor;
                    const dotRadius = (highestSubRate > 0 && pSub[key] === highestSubRate) ? 4.3 : 3.5;
                    return `<circle class="radar-vertex-dot" cx="${x}" cy="${y}" r="${dotRadius}" fill="${dotColor}" stroke="#fff" stroke-width="1.5" />`;
                }).join('\n                ');
            })()}
            </svg>
        `;

        // Populate plan rows html
        let planRowsHtml = '';
        const planOrder = ['sense', 'logic', 'anomaly'];
        planOrder.forEach(plan => {
            const s = statsByPlan[plan];
            const rate = formatRate(s.owned, s.total);
            const planLabel = plan.toUpperCase();
            let planColor = '#ff4d8d';
            if (plan === 'logic') planColor = '#46a4f3';
            if (plan === 'anomaly') planColor = '#ffb300';

            planRowsHtml += `
                <div class="idol-stats-plan-col" data-plan="${plan}" style="flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 4px;">
                    <div class="idol-stats-plan-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 800; color: #555; pointer-events: none;">
                        <span style="display: flex; align-items: center; gap: 4px;">
                            <img src="icons/${plan}.webp" style="width: 14px; height: 14px;">
                            <span class="idol-plan-text">${planLabel}</span>
                        </span>
                        <span><span style="color: ${planColor};">${rate}%</span> <span class="idol-stats-plan-fraction">(${s.owned}/${s.total})</span></span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 0; overflow: hidden; pointer-events: none;">
                        <div style="width: ${rate}%; height: 100%; background: ${planColor}; border-radius: 0;"></div>
                    </div>
                </div>
            `;
        });

        // Populate character list (sorted by possession rate descending)
        const charList = CHARACTER_ORDER.map(charId => {
            const s = statsByChar[charId];
            const total = s ? s.total : 0;
            const owned = s ? s.owned : 0;
            const rateNum = total > 0 ? (owned / total) * 100 : 0;
            return { charId, total, owned, rateNum };
        }).filter(item => item.total > 0);

        charList.sort((a, b) => {
            if (b.rateNum !== a.rateNum) {
                return b.rateNum - a.rateNum;
            }
            // 2nd priority: Place the one with higher owned count first if possession rate is the same
            if (b.owned !== a.owned) {
                return b.owned - a.owned;
            }
            // 3rd priority: Place favorite idol at the top
            if (state.favoriteIdol) {
                if (a.charId === state.favoriteIdol && b.charId !== state.favoriteIdol) return -1;
                if (b.charId === state.favoriteIdol && a.charId !== state.favoriteIdol) return 1;
            }
            // 4th priority: fallback to default CHARACTER_ORDER index
            return CHARACTER_ORDER.indexOf(a.charId) - CHARACTER_ORDER.indexOf(b.charId);
        });

        let charSegmentsHtml = '';
        if (ownedCount > 0) {
            const ownedChars = charList.filter(item => item.owned > 0);
            ownedChars.sort((a, b) => CHARACTER_ORDER.indexOf(a.charId) - CHARACTER_ORDER.indexOf(b.charId));
            const ownedUnit = lang === 'ja' ? '枚' : lang === 'en' ? ' owned' : '장 소지';

            ownedChars.forEach((item) => {
                const charId = item.charId;
                const charColor = idolColors[charId] || '#cbd5e1';
                const charNameKey = `idol_name_${charId}`;
                const charName = globalTranslations[lang]?.[charNameKey] || globalTranslations.ko[charNameKey] || charId;

                const pct = (item.owned / ownedCount) * 100;
                charSegmentsHtml += `
                    <div style="width: ${pct}%; height: 100%; background-color: ${charColor};"
                         title="${charName}: ${item.owned}${ownedUnit} (${pct.toFixed(1)}%)">
                    </div>
                `;
            });
        }

        const firstPlaceChar = charList[0]?.charId;
        firstPlaceCharColor = (firstPlaceChar && idolColors[firstPlaceChar]) || '#ff4d8d';

        // Update header save button and indicator colors dynamically to match 1st place character color
        const saveBtn = headerArea.querySelector('#btn-idol-possession-save');
        if (saveBtn) {
            saveBtn.style.backgroundColor = firstPlaceCharColor;
            saveBtn.style.boxShadow = 'none';
            saveBtn.style.transition = 'none';
        }
        const titleIcon = headerArea.querySelector('#idol-possession-title-icon');
        if (titleIcon) {
            titleIcon.style.stroke = firstPlaceCharColor;
            titleIcon.style.transition = 'none';
        }
        const headerLine = headerArea.querySelector('#possession-header-line');
        if (headerLine) {
            headerLine.style.backgroundColor = firstPlaceCharColor;
            headerLine.style.transition = 'none';
        }

        if (firstPlaceChar) {
            const existingBg = modalContent.querySelector('.modal-bg-image');
            if (existingBg) existingBg.remove();

            const bgImg = document.createElement('img');
            bgImg.className = 'modal-bg-image';
            bgImg.src = `idols/r${firstPlaceChar}_1r1.webp`;
            bgImg.style.cssText = `position: absolute; right: 0; bottom: 0; height: 58%; max-height: 760px; opacity: 0.15; pointer-events: none; z-index: 0; object-fit: contain;`;
            modalContent.appendChild(bgImg);
        }

        // Calculate stacked bar segments for all active cards
        const segments = {
            normal: 0,
            limited: 0,
            limited_f: 0,
            limited_u: 0,
            dist: 0,
            another: 0,
            unowned: 0
        };

        activeCards.forEach(c => {
            const isOwned = isCardOwned(c.id);
            if (isOwned) {
                const src = c.another ? 'another' : (c.source || 'normal');
                if (segments[src] !== undefined) {
                    segments[src]++;
                }
            } else {
                segments.unowned++;
            }
        });

        const pctNormal = totalCount > 0 ? (segments.normal / totalCount) * 100 : 0;
        const pctLimited = totalCount > 0 ? (segments.limited / totalCount) * 100 : 0;
        const pctLimitedF = totalCount > 0 ? (segments.limited_f / totalCount) * 100 : 0;
        const pctLimitedU = totalCount > 0 ? (segments.limited_u / totalCount) * 100 : 0;
        const pctDist = totalCount > 0 ? (segments.dist / totalCount) * 100 : 0;
        const pctAnother = totalCount > 0 ? (segments.another / totalCount) * 100 : 0;
        const pctUnowned = totalCount > 0 ? (segments.unowned / totalCount) * 100 : 0;

        let sourceStackedBarHtml = `
            <div style="grid-column: span 2; width: 96%; height: 25px; background: #cbd5e1; overflow: hidden; display: flex; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06); border-radius: 0; margin: 0 auto 2px auto; box-sizing: border-box;">
                ${pctNormal > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctNormal}%; height: 100%; background-color: #93c5fd; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="통상: ${segments.normal}장 (${pctNormal.toFixed(1)}%)">${pctNormal >= 5 ? `${Math.round(pctNormal)}%` : ''}</div>` : ''}
                ${pctLimited > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctLimited}%; height: 100%; background-color: #c084fc; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="한정: ${segments.limited}장 (${pctLimited.toFixed(1)}%)">${pctLimited >= 5 ? `${Math.round(pctLimited)}%` : ''}</div>` : ''}
                ${pctLimitedF > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctLimitedF}%; height: 100%; background-color: #f87171; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="페스: ${segments.limited_f}장 (${pctLimitedF.toFixed(1)}%)">${pctLimitedF >= 5 ? `${Math.round(pctLimitedF)}%` : ''}</div>` : ''}
                ${pctLimitedU > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctLimitedU}%; height: 100%; background-color: #fcd34d; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="유닛: ${segments.limited_u}장 (${pctLimitedU.toFixed(1)}%)">${pctLimitedU >= 5 ? `${Math.round(pctLimitedU)}%` : ''}</div>` : ''}
                ${includeDist && pctDist > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctDist}%; height: 100%; background-color: #8FDDBA; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="배포: ${segments.dist}장 (${pctDist.toFixed(1)}%)">${pctDist >= 5 ? `${Math.round(pctDist)}%` : ''}</div>` : ''}
                ${includeAnother && pctAnother > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctAnother}%; height: 100%; background-color: #fda4af; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="어나더: ${segments.another}장 (${pctAnother.toFixed(1)}%)">${pctAnother >= 5 ? `${Math.round(pctAnother)}%` : ''}</div>` : ''}
                ${pctUnowned > 0 ? `<div class="source-stacked-bar-segment" style="width: ${pctUnowned}%; height: 100%; background-color: #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; text-shadow: 0.5px 0.5px 1.5px rgba(0,0,0,0.35);" title="미소지: ${segments.unowned}장 (${pctUnowned.toFixed(1)}%)">${pctUnowned >= 5 ? `${Math.round(pctUnowned)}%` : ''}</div>` : ''}
            </div>
        `;

        // Populate source stats rows html
        let sourceRowsHtml = '';
        const sourceOrder = ['normal', 'limited', 'limited_f', 'limited_u', 'dist', 'another'];
        sourceOrder.forEach(src => {
            const s = statsBySource[src];
            if (s.total === 0) return; // Hide categories with 0 cards
            const rate = formatRate(s.owned, s.total);
            let srcLabel = src === 'another'
                ? (globalTranslations[lang]?.roadmap_show_another || globalTranslations.ko.roadmap_show_another || '어나더')
                : (globalTranslations[lang]?.[`filter_${src}`] || globalTranslations.ko[`filter_${src}`] || text[`filter_${src}`] || src);
            if (lang === 'en' && src === 'limited_f') srcLabel = 'Fes';
            if (lang === 'en' && src === 'limited_u') srcLabel = 'Unit';

            // Determine dominant character for this source (category)
            const ownedSrcCards = activeCards.filter(c => {
                const cardSrc = c.another ? 'another' : (c.source || 'normal');
                return cardSrc === src && isCardOwned(c.id);
            });

            const charCounts = {};
            CHARACTER_ORDER.forEach(charId => {
                charCounts[charId] = 0;
            });
            ownedSrcCards.forEach(c => {
                const charId = getCharacterId(c.id);
                if (charCounts[charId] !== undefined) {
                    charCounts[charId]++;
                }
            });

            let maxCount = 0;
            CHARACTER_ORDER.forEach(charId => {
                if (charCounts[charId] > maxCount) {
                    maxCount = charCounts[charId];
                }
            });

            let chosenCharId = null;
            if (maxCount > 0) {
                const tiedChars = CHARACTER_ORDER.filter(charId => charCounts[charId] === maxCount);
                if (firstPlaceChar && tiedChars.includes(firstPlaceChar)) {
                    chosenCharId = firstPlaceChar;
                } else if (state.favoriteIdol && tiedChars.includes(state.favoriteIdol)) {
                    chosenCharId = state.favoriteIdol;
                } else {
                    chosenCharId = tiedChars[0];
                }
            }

            const SOURCE_COLORS = {
                normal: '#93c5fd',   // Pastel Blue
                limited: '#c084fc',  // Pastel Purple
                limited_f: '#f87171', // Soft Red
                limited_u: '#fcd34d', // Pastel Yellow
                dist: '#8FDDBA',      // Pastel Mint
                another: '#fda4af'    // Pastel Pink/Rose
            };
            const sourceColor = SOURCE_COLORS[src] || '#cbd5e1';

            sourceRowsHtml += `
                <div class="source-stat-card" data-source="${src}" data-color="${sourceColor}">
                    <div class="source-stat-circle-view">
                        <div class="source-stat-circle-wrapper" style="position: relative; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 36 36" style="width: 100%; height: 100%;">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" stroke-width="4.0"></circle>
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="${sourceColor}" stroke-width="4.0"
                                        stroke-dasharray="${rate} ${100 - rate}" stroke-dashoffset="25" stroke-linecap="butt"></circle>
                            </svg>
                            <div class="source-stat-circle-label" style="position: absolute; font-size: 0.88rem; font-weight: 800; color: #333; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; box-sizing: border-box;">${srcLabel}</div>
                        </div>
                        <div class="source-stat-circle-subtext" style="font-size: 0.74rem; font-weight: 800; color: #555; text-align: center; white-space: nowrap;">
                            <span style="color: ${sourceColor};">${rate}%</span> <span style="font-size: 0.68rem; color: #777; font-weight: bold; margin-left: 2px;">(${s.owned}/${s.total})</span>
                        </div>
                    </div>
                    <div class="source-stat-main" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: bold; color: #333; gap: 10px; cursor: pointer; user-select: none; padding: 4px 6px; border-radius: 8px; transition: background-color 0.15s ease;">
                        <span class="idol-stats-source-label" style="display: flex; align-items: center; justify-content: center; width: 60px; font-weight: 800; color: #555; text-align: center; flex-shrink: 0; pointer-events: none;">${srcLabel}</span>
                        <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 0; overflow: hidden; position: relative; pointer-events: none;">
                            <div style="width: ${rate}%; height: 100%; background: ${sourceColor}; border-radius: 0;"></div>
                        </div>
                        <span class="idol-stats-source-val-wrap" style="display: flex; align-items: center; width: 110px; text-align: left; white-space: nowrap; flex-shrink: 0; pointer-events: none;">
                            <span class="idol-stats-source-pct" style="font-weight: 800; color: ${sourceColor};">${rate}%</span>
                            <span class="idol-stats-source-fraction" style="font-weight: bold; color: #777; font-size: 0.75rem; margin-left: 8px;">(${s.owned}/${s.total})</span>
                        </span>
                        <div class="source-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; pointer-events: none; transition: transform 0.15s ease;">
                            <svg class="source-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: transform 0.15s ease !important;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                    <div class="source-stat-details" style="display: none; background: rgba(100, 116, 139, 0.07); border-top: 1px solid rgba(0, 0, 0, 0.08); padding: 12px 4px; border-radius: 8px; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; margin-top: 4px;">
                        <!-- Owned Cards Group -->
                        <div class="source-stat-owned-group" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #555; padding-left: 6px; user-select: none;"></div>
                            <div class="source-stat-owned-container pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                        <!-- Unowned Cards Group -->
                        <div class="source-stat-unowned-group" style="display: flex; flex-direction: column; gap: 8px; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #999; padding-left: 6px; user-select: none;"></div>
                            <div class="source-stat-unowned-container pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Populate character list html
        let charListHtml = '';
        charList.forEach((item, rankIndex) => {
            const charId = item.charId;
            const isMobile = window.innerWidth <= 768;
            const rankWidth = isMobile ? '24px' : '30px';
            const idolIconSize = isMobile ? '28px' : '34px';
            let rankBadgeHtml = '';
            if (rankIndex === 0) {
                rankBadgeHtml = `<div style="width: ${rankWidth}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><img src="icons/1st.webp" style="width: 100%; height: auto; object-fit: contain; user-select: none;"></div>`;
            } else if (rankIndex === 1) {
                rankBadgeHtml = `<div style="width: ${rankWidth}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><img src="icons/2nd.webp" style="width: 100%; height: auto; object-fit: contain; user-select: none;"></div>`;
            } else if (rankIndex === 2) {
                rankBadgeHtml = `<div style="width: ${rankWidth}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><img src="icons/3rd.webp" style="width: 100%; height: auto; object-fit: contain; user-select: none;"></div>`;
            } else {
                const crownSize = isMobile ? '10px' : '12px';
                const fontSize = isMobile ? '0.55rem' : '0.67rem';
                rankBadgeHtml = `<div style="width: ${rankWidth}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; flex-shrink: 0; user-select: none;">
                    <img src="icons/crown.webp" style="width: ${crownSize}; height: ${crownSize}; object-fit: contain; opacity: 0.55; filter: grayscale(100%);">
                    <span style="font-size: ${fontSize}; font-weight: 800; color: #94a3b8; line-height: 1.0;">${rankIndex + 1}</span>
                </div>`;
            }
            const total = item.total;
            const owned = item.owned;
            const rate = formatRate(item.owned, item.total);
            const charNameKey = `idol_name_${charId}`;
            const charName = globalTranslations[lang]?.[charNameKey] || globalTranslations.ko[charNameKey] || charId;
            const charColor = idolColors[charId] || '#cbd5e1';

            const iconName = charId === 'tsubame' ? 'tsubame' : charId;

            // Calculate breakdowns for this character based on activeCards
            const charCards = activeCards.filter(c => getCharacterId(c.id) === charId);

            const charSourceStats = {
                normal: { total: 0, owned: 0 },
                limited: { total: 0, owned: 0 },
                limited_f: { total: 0, owned: 0 },
                limited_u: { total: 0, owned: 0 },
                dist: { total: 0, owned: 0 },
                another: { total: 0, owned: 0 }
            };

            const charSubtypeStats = {
                goodcondition: { total: 0, owned: 0 },
                concentration: { total: 0, owned: 0 },
                goodimpression: { total: 0, owned: 0 },
                motivation: { total: 0, owned: 0 },
                enthusiasm: { total: 0, owned: 0 },
                fullpower: { total: 0, owned: 0 }
            };

            charCards.forEach(c => {
                const src = c.another ? 'another' : (c.source || 'normal');
                const isOwned = isCardOwned(c.id);
                if (charSourceStats[src] !== undefined) {
                    charSourceStats[src].total++;
                    if (isOwned) charSourceStats[src].owned++;
                }

                let os = getOsusume(c, pssrCards);
                if (os === 'preservation') os = 'fullpower';
                if (charSubtypeStats[os] !== undefined) {
                    charSubtypeStats[os].total++;
                    if (isOwned) charSubtypeStats[os].owned++;
                }
            });

            // Generate owned/unowned PSSR icons for this character (separated into normal and another cards)
            const buildCardIconsHtml = (cards) => {
                if (!cards || cards.length === 0) return '';
                let html = '';
                cards.forEach(c => {
                    const isOwned = isCardOwned(c.id);
                    const suffix = c.another ? '1.webp' : '2.webp';
                    const cardName = getLocalizedCardName(c, lang);

                    const containerStyle = isOwned
                        ? `border: 1.5px solid ${charColor};`
                        : `border: 1px solid #ccc;`;

                    const imgStyle = isOwned
                        ? `display: block; opacity: 1;`
                        : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                    let os = getOsusume(c, pssrCards);
                    if (os === 'preservation') os = 'fullpower';

                    html += `
                        <div class="pssr-stat-icon-wrap" data-source="${c.another ? 'another' : (c.source || 'normal')}" data-subtype="${os}" style="${containerStyle}" title="${cardName}">
                            <div class="pssr-stat-icon-box">
                                <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                            </div>

                            <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                            <img class="pssr-plan-badge" src="icons/${c.plan || 'sense'}.webp">
                        </div>
                    `;
                });
                for (let i = 0; i < 12; i++) {
                    html += `<div class="pssr-stat-icon-spacer"></div>`;
                }
                return html;
            };

            const normalCards = charCards.filter(c => !c.another);
            const anotherCards = charCards.filter(c => c.another);

            const normalIconsHtml = buildCardIconsHtml(normalCards);
            const anotherIconsHtml = buildCardIconsHtml(anotherCards);

            let barsHtml = '';
            let xAxisLabelsHtml = '';

            if (charStatsViewMode === 'source') {
                const sourceOrder = ['normal', 'limited', 'limited_f', 'limited_u', 'dist', 'another'];
                let activeSources = sourceOrder;
                if (!includeAnother) {
                    activeSources = activeSources.filter(s => s !== 'another');
                }
                if (!includeDist) {
                    activeSources = activeSources.filter(s => s !== 'dist');
                }
                activeSources.forEach(src => {
                    const s = charSourceStats[src];
                    let srcLabel = src === 'another'
                        ? (globalTranslations[lang]?.roadmap_show_another || globalTranslations.ko.roadmap_show_another || '어나더')
                        : (globalTranslations[lang]?.[`filter_${src}`] || globalTranslations.ko[`filter_${src}`] || text[`filter_${src}`] || src);
                    if (lang === 'en' && src === 'limited_f') srcLabel = 'Fes';
                    if (lang === 'en' && src === 'limited_u') srcLabel = 'Unit';
                    const isSelectable = s.total > 0;
                    const srcRate = isSelectable ? ((s.owned / s.total) * 100).toFixed(0) : '0';
                    const labelText = isSelectable ? `${s.owned}/${s.total}` : '';

                    const outerStyle = isSelectable
                        ? 'width: 24px; height: 100%; display: flex; justify-content: center; align-items: flex-end; cursor: pointer; position: relative; z-index: 5;'
                        : 'width: 24px; height: 100%; display: flex; justify-content: center; align-items: flex-end; cursor: default; position: relative; z-index: 5; pointer-events: none; opacity: 0.25;';

                    const labelStyle = isSelectable
                        ? 'font-size: 0.72rem; font-weight: bold; color: #777; text-align: center; cursor: pointer; user-select: none; padding: 2px 6px;'
                        : 'font-size: 0.72rem; font-weight: bold; color: #bbb; text-align: center; cursor: default; user-select: none; padding: 2px 6px; pointer-events: none; opacity: 0.45;';

                    barsHtml += `
                        <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                            <div class="idol-stats-bar-outer" data-source="${src}" style="${outerStyle}">
                                <div class="idol-stats-bar" style="width: 14px; height: ${srcRate}%; background-color: ${charColor}; border-top-left-radius: 2px; border-top-right-radius: 2px; position: relative; transition: all 0.15s ease; box-sizing: border-box; pointer-events: none;">
                                    <div class="idol-stats-bar-val" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${s.owned > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none; pointer-events: none;">
                                        ${labelText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    xAxisLabelsHtml += `
                        <div style="flex: 1; display: flex; justify-content: center;">
                            <div class="idol-stats-xaxis-label" data-source="${src}" style="${labelStyle}">${srcLabel}</div>
                        </div>
                    `;
                });
            } else {
                const subtypeOrder = ['goodcondition', 'concentration', 'goodimpression', 'motivation', 'enthusiasm', 'fullpower'];
                const subtypeColors = {
                    goodcondition: '#ff4d8d',   // Sense pink
                    concentration: '#ff4d8d',
                    goodimpression: '#46a4f3',  // Logic blue
                    motivation: '#46a4f3',
                    enthusiasm: '#ffb300',      // Anomaly yellow
                    fullpower: '#ffb300'
                };

                subtypeOrder.forEach(sub => {
                    const s = charSubtypeStats[sub];
                    const isSelectable = s.total > 0;
                    const srcRate = isSelectable ? ((s.owned / s.total) * 100).toFixed(0) : '0';
                    const labelText = isSelectable ? `${s.owned}/${s.total}` : '';
                    const barColor = subtypeColors[sub] || charColor;

                    const outerStyle = isSelectable
                        ? 'width: 24px; height: 100%; display: flex; justify-content: center; align-items: flex-end; cursor: pointer; position: relative; z-index: 5;'
                        : 'width: 24px; height: 100%; display: flex; justify-content: center; align-items: flex-end; cursor: default; position: relative; z-index: 5; pointer-events: none; opacity: 0.25;';

                    const labelStyle = isSelectable
                        ? 'display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; padding: 2px 6px;'
                        : 'display: flex; align-items: center; justify-content: center; cursor: default; user-select: none; padding: 2px 6px; pointer-events: none; opacity: 0.45;';

                    barsHtml += `
                        <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                            <div class="idol-stats-bar-outer" data-subtype="${sub}" style="${outerStyle}">
                                <div class="idol-stats-bar" style="width: 14px; height: ${srcRate}%; background-color: ${barColor}; border-top-left-radius: 2px; border-top-right-radius: 2px; position: relative; transition: all 0.15s ease; box-sizing: border-box; pointer-events: none;">
                                    <div class="idol-stats-bar-val" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${s.owned > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none; pointer-events: none;">
                                        ${labelText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    xAxisLabelsHtml += `
                        <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
                            <div class="idol-stats-xaxis-label" data-subtype="${sub}" style="${labelStyle}">
                                <img src="icons/${sub}.webp" style="width: 18px; height: 18px; object-fit: contain;">
                            </div>
                        </div>
                    `;
                });
            }

            let rankBg = 'rgba(255, 255, 255, 0.45)';
            let rankBorder = 'rgba(0, 0, 0, 0.06)';
            if (rankIndex === 0) { rankBg = 'linear-gradient(135deg, rgba(255, 235, 122, 0.17) 0%, rgba(255, 139, 173, 0.15) 35%, rgba(194, 147, 255, 0.15) 70%, rgba(115, 232, 255, 0.15) 100%)'; rankBorder = 'rgba(255, 139, 173, 0.45)'; }
            else if (rankIndex === 1) { rankBg = 'linear-gradient(135deg, rgba(255, 204, 0, 0.13), rgba(255, 204, 0, 0.19))'; rankBorder = 'rgba(255, 204, 0, 0.4)'; }
            else if (rankIndex === 2) { rankBg = 'linear-gradient(135deg, rgba(70, 164, 243, 0.11), rgba(70, 164, 243, 0.15))'; rankBorder = 'rgba(70, 164, 243, 0.35)'; }

            const isExpanded = expandedCharIds.has(charId);
            const chevronRotateStyle = isExpanded ? 'transform: rotate(180deg);' : '';

            charListHtml += `
                <div class="char-stat-card ${isExpanded ? 'expanded' : ''}" data-char-id="${charId}" data-rank="${rankIndex + 1}" style="display: flex; flex-direction: column; background: ${rankBg}; border: 1px solid ${rankBorder}; border-radius: 12px; overflow: hidden; box-sizing: border-box; transition: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div class="char-stat-main" style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; user-select: none;">
                        ${rankBadgeHtml}
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0;">
                            <img src="icons/idolicons/${iconName}_c.png" style="width: ${idolIconSize}; height: ${idolIconSize}; border-radius: 6px; border: 1px solid ${charColor}; background-color: ${charColor}33; display: block;">
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                            <div class="idol-stats-char-name-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 800; color: #333;">
                                <span class="idol-stats-char-name-wrap" style="display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; white-space: nowrap;">
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1;">${charName}</span>
                                    <span class="idol-stats-char-fraction" style="font-size: 0.72rem; font-weight: normal; color: #777; flex-shrink: 0;">(${owned}/${total})</span>
                                </span>
                                <span class="idol-stats-char-pct" style="font-size: 0.78rem; font-weight: 800; color: ${charColor}; flex-shrink: 0;">${Math.round(item.rateNum)}%</span>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 0; overflow: hidden; position: relative;">
                                    <div style="width: ${rate}%; height: 100%; background: ${charColor}; border-radius: 0;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="char-chevron-btn" style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; transition: none !important;">
                            <svg class="char-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important; ${chevronRotateStyle}"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                    <div class="char-stat-details" style="display: ${isExpanded ? 'flex' : 'none'}; background: rgba(250, 249, 250, 0.45); border-top: 1px solid rgba(0, 0, 0, 0.05); padding: 12px 10px; flex-direction: column; gap: 6px;">
                        <div style="display: flex; flex-direction: column; gap: 5px; background: rgba(255, 255, 255, 0.55); padding: 14px 12px 6px; border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.06); box-sizing: border-box; width: 100%;">
                            <div class="idol-stats-chart-area-wrapper" style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
                                <div style="display: flex; align-items: flex-end;">
                                    <div class="idol-stats-yaxis-label" style="position: relative; width: 30px; height: 60px; font-size: 0.65rem; color: #888; font-weight: bold; margin-right: 6px; user-select: none;">
                                        <span style="position: absolute; right: 4px; top: 0%; transform: translateY(-50%); white-space: nowrap;">100%</span>
                                        <span style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); white-space: nowrap;">50%</span>
                                        <span style="position: absolute; right: 4px; top: 100%; transform: translateY(-50%); white-space: nowrap;">0</span>
                                    </div>
                                    <div class="idol-stats-chart-wrapper" style="flex: 1; height: 60px; position: relative; border-bottom: 2px solid #cbd5e1; border-left: 2px solid #cbd5e1; box-sizing: border-box;">
                                        <div style="position: absolute; left: 0; right: 0; top: 0%; border-top: 1px dashed #e2e8f0;"></div>
                                        <div style="position: absolute; left: 0; right: 0; top: 50%; border-top: 1px dashed #e2e8f0;"></div>
                                        <div style="position: absolute; inset: 0; display: flex; justify-content: space-around; align-items: flex-end; z-index: 2; padding: 0 10px;">
                                            ${barsHtml}
                                        </div>
                                    </div>
                                </div>
                                <div class="idol-stats-xaxis-container" style="display: flex; padding-left: 36px;">
                                    <div style="flex: 1; display: flex; justify-content: space-around; text-align: center; padding: 0 10px; user-select: none;">
                                        ${xAxisLabelsHtml}
                                    </div>
                                </div>
                            </div>
                            ${(normalIconsHtml || (anotherIconsHtml && includeAnother)) ? `
                            <div class="pssr-char-icons-container">
                                ${normalIconsHtml ? `
                                <div class="pssr-stat-icons-row">
                                    ${normalIconsHtml}
                                </div>
                                ` : ''}
                                ${(anotherIconsHtml && includeAnother) ? `
                                ${normalIconsHtml ? `<div style="width: 100%; border-top: 1px dashed rgba(0, 0, 0, 0.12); margin: 6px 0;"></div>` : ''}
                                <div class="pssr-stat-icons-row">
                                    ${anotherIconsHtml}
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        let barColor = 'linear-gradient(90deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)';
        let cardBg = 'linear-gradient(135deg, rgba(255, 235, 122, 0.12) 0%, rgba(255, 139, 173, 0.10) 35%, rgba(194, 147, 255, 0.10) 70%, rgba(115, 232, 255, 0.10) 100%)';
        let cardBorder = '1px solid rgba(255, 139, 173, 0.3)';
        if (numRate < 50) {
            barColor = '#eef8ff';
            cardBg = 'linear-gradient(135deg, rgba(70, 164, 243, 0.04), rgba(70, 164, 243, 0.08))';
            cardBorder = '1px solid rgba(70, 164, 243, 0.15)';
        } else if (numRate < 90) {
            barColor = 'linear-gradient(90deg, #fff44f 0%, #fffde6 25%, #ffcc00 50%)';
            cardBg = 'linear-gradient(135deg, rgba(255, 204, 0, 0.08), rgba(255, 204, 0, 0.14))';
            cardBorder = '1px solid rgba(255, 204, 0, 0.25)';
        }

        // 2D Heatmap Grid calculation
        const viewList = [];
        if (heatmapViewMode === 'source') {
            viewList.push('normal', 'limited', 'limited_f', 'limited_u');
            if (includeDist) viewList.push('dist');
            if (includeAnother) viewList.push('another');
        } else {
            viewList.push('goodcondition', 'concentration', 'goodimpression', 'motivation', 'enthusiasm', 'fullpower');
        }

        const heatmapData = {};
        HEATMAP_CHARACTER_ORDER.forEach(charId => {
            heatmapData[charId] = {};
            viewList.forEach(key => {
                heatmapData[charId][key] = { total: 0, owned: 0 };
            });
        });

        activeCards.forEach(c => {
            const charId = getCharacterId(c.id);
            if (heatmapData[charId] === undefined) return;

            let key = '';
            if (heatmapViewMode === 'source') {
                key = c.another ? 'another' : (c.source || 'normal');
            } else {
                key = getOsusume(c, pssrCards);
                if (key === 'preservation') key = 'fullpower';
            }

            if (heatmapData[charId][key] !== undefined) {
                heatmapData[charId][key].total++;
                if (isCardOwned(c.id)) {
                    heatmapData[charId][key].owned++;
                }
            }
        });

        const getSourceShortLabel = (src, lang) => {
            const map = {
                ko: {
                    normal: '통상',
                    limited: '한정',
                    limited_f: '페스',
                    limited_u: '유닛',
                    dist: '배포',
                    another: '어나더'
                },
                ja: {
                    normal: '恒常',
                    limited: '限定',
                    limited_f: 'フェス',
                    limited_u: 'ユニット',
                    dist: '配布',
                    another: 'アナザー'
                },
                en: {
                    normal: 'Std',
                    limited: 'Lmtd',
                    limited_f: 'Fes',
                    limited_u: 'Unit',
                    dist: 'Free',
                    another: 'Anthr'
                }
            };
            return map[lang]?.[src] || map.ko[src] || src;
        };

        const getColLabel = (key, lang) => {
            if (heatmapViewMode === 'source') {
                return getSourceShortLabel(key, lang);
            } else {
                return SUB_TYPE_LABELS[lang]?.[key] || SUB_TYPE_LABELS.ko[key] || key;
            }
        };

        let rowLabelsHtml = '';
        HEATMAP_CHARACTER_ORDER.forEach(charId => {
            const charColor = idolColors[charId] || '#cbd5e1';

            let rowOwnedSum = 0;
            viewList.forEach(key => {
                const stat = heatmapData[charId][key];
                if (stat && stat.owned > 0) {
                    rowOwnedSum += stat.owned;
                }
            });

            let sumLabelHtml = '';
            if (rowOwnedSum > 0) {
                sumLabelHtml = `<span class="possession-heatmap-row-sum-val" style="font-size: 0.72rem; font-weight: 800; color: #475569; margin-left: 5px;">${rowOwnedSum}</span>`;
            }

            rowLabelsHtml += `
                <div class="possession-heatmap-row-label" style="height: 38px; display: flex; align-items: center; background: #ffffff; border-radius: 4px 0 0 4px; box-sizing: border-box; user-select: none; border-left: 3px solid ${charColor}; border-bottom: 1px solid #f1f5f9;">
                    <img src="icons/idolicons/${charId}_c.png" onerror="this.src='icons/idol.png';" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                    ${sumLabelHtml}
                </div>
            `;
        });

        const catColors = {
            normal: '#93c5fd',   // Pastel Blue
            limited: '#c084fc',  // Pastel Purple
            limited_f: '#f87171', // Soft Red
            limited_u: '#fcd34d', // Pastel Yellow
            dist: '#8FDDBA',      // Pastel Mint
            another: '#fda4af'    // Pastel Pink/Rose
        };

        const subtypeColors = {
            goodcondition: '#ff4d8d',   // Sense pink
            concentration: '#ff4d8d',   // Sense pink
            goodimpression: '#46a4f3',  // Logic blue
            motivation: '#46a4f3',      // Logic blue
            enthusiasm: '#ffb300',      // Anomaly yellow
            fullpower: '#ffb300'        // Anomaly yellow
        };

        let columnsHtml = '';
        viewList.forEach(key => {
            const srcLabel = getColLabel(key, lang);

            // Calculate max owned and total counts in this specific column
            let maxOwnedVal = 0;
            let maxTotalVal = 0;
            HEATMAP_CHARACTER_ORDER.forEach(charId => {
                const stat = heatmapData[charId][key];
                if (stat) {
                    if (stat.owned > maxOwnedVal) {
                        maxOwnedVal = stat.owned;
                    }
                    if (stat.total > maxTotalVal) {
                        maxTotalVal = stat.total;
                    }
                }
            });

            const maxTotal = maxTotalVal > 0 ? maxTotalVal : 1;

            // Determine dynamic column color based on the dominant idol in this category (resolving ties)
            let columnColor = firstPlaceCharColor;
            if (maxOwnedVal > 0) {
                const tiedChars = HEATMAP_CHARACTER_ORDER.filter(charId => {
                    const stat = heatmapData[charId][key];
                    return stat && stat.owned === maxOwnedVal;
                });

                let chosenIdol = null;
                if (firstPlaceChar && tiedChars.includes(firstPlaceChar)) {
                    chosenIdol = firstPlaceChar;
                } else if (state.favoriteIdol && tiedChars.includes(state.favoriteIdol)) {
                    chosenIdol = state.favoriteIdol;
                } else {
                    chosenIdol = tiedChars[0];
                }
                columnColor = idolColors[chosenIdol] || firstPlaceCharColor;
            }

            let cellsHtml = '';
            HEATMAP_CHARACTER_ORDER.forEach(charId => {
                const stat = heatmapData[charId][key];
                const total = stat.total;
                const owned = stat.owned;

                let bgStyle = '';
                let cellText = '';

                if (total === 0 || owned === 0) {
                    bgStyle = 'background: #ffffff;';
                } else {
                    const rate = (owned / total) * 100;
                    const alpha = 0.15 + (owned / maxTotal) * 0.85;

                    let textColor = '#0f172a';
                    if (columnColor && columnColor.startsWith('#')) {
                        const r = parseInt(columnColor.slice(1, 3), 16);
                        const g = parseInt(columnColor.slice(3, 5), 16);
                        const b = parseInt(columnColor.slice(5, 7), 16);
                        const effR = r * alpha + 255 * (1 - alpha);
                        const effG = g * alpha + 255 * (1 - alpha);
                        const effB = b * alpha + 255 * (1 - alpha);
                        const effLuminance = (0.299 * effR + 0.587 * effG + 0.114 * effB) / 255;
                        if (effLuminance < 0.6) {
                            textColor = '#ffffff';
                        }
                    }

                    bgStyle = `background: linear-gradient(${hexToRgba(columnColor, alpha)}, ${hexToRgba(columnColor, alpha)}), #ffffff; color: ${textColor};`;
                    cellText = `<span class="heatmap-cell-number">${owned}</span>`;
                }

                cellsHtml += `
                    <div class="possession-heatmap-cell" style="height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 0 !important; box-sizing: border-box; border-bottom: 1px solid rgba(0,0,0,0.03); ${bgStyle}">
                        ${cellText}
                    </div>
                `;
            });

            const borderTopColor = heatmapViewMode === 'source'
                ? (catColors[key] || '#cbd5e1')
                : (subtypeColors[key] || '#cbd5e1');

            let headerImgHtml = '';
            if (heatmapViewMode === 'subtype') {
                headerImgHtml = `<img src="icons/${key}.webp" style="width: 22px; height: 22px; margin-bottom: 0; object-fit: contain;">`;
            }

            // Calculate column total and owned sum
            let columnOwnedSum = 0;
            let columnTotalSum = 0;
            HEATMAP_CHARACTER_ORDER.forEach(charId => {
                const stat = heatmapData[charId][key];
                if (stat) {
                    columnOwnedSum += stat.owned;
                    columnTotalSum += stat.total;
                }
            });

            const countLabelHtml = `<span class="heatmap-col-count-lbl" style="font-size: 0.58rem; font-weight: bold; color: #64748b; display: inline-block;">(${columnOwnedSum})</span>`;

            columnsHtml += `
                <div class="possession-heatmap-col" style="flex: 1; display: flex; flex-direction: column; gap: 0; border-radius: 0; box-sizing: border-box;">
                    <!-- 열 헤더 (상단) -->
                    <div class="possession-heatmap-col-header" style="height: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; box-sizing: border-box; user-select: none; border-radius: 4px 4px 0 0; background: #ffffff; border-top: 3px solid ${borderTopColor}; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9;">
                        <span class="possession-heatmap-header-txt" style="font-size: 0.75rem; font-weight: 800; color: #475569; white-space: nowrap; text-align: center; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 3px; line-height: 1.0;">
                            ${heatmapViewMode === 'subtype' ? headerImgHtml : srcLabel}
                            ${countLabelHtml}
                        </span>
                    </div>
                    <!-- 셀들 -->
                    ${cellsHtml}
                </div>
            `;
        });

        const heatmapTitle = lang === 'ja' ? 'キャラクター・分類別所持率' : lang === 'en' ? 'Rate by Character & Source' : '아이돌・분류별 소지 통계';
        const heatmapGridHtml = `
            <div class="possession-heatmap-container ${showHeatmapNumbers ? 'show-numbers' : ''}" style="display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box; margin-top: 12px; cursor: pointer; user-select: none;">
                <div style="display: flex; gap: 0; width: 100%; box-sizing: border-box;">
                    <!-- 왼쪽 행 라벨 열 -->
                    <div class="possession-heatmap-row-labels" style="display: flex; flex-direction: column; gap: 0; width: 70px; flex-shrink: 0; box-sizing: border-box;">
                        <div class="possession-heatmap-row-header-spacer" style="height: 30px; box-sizing: border-box;"></div>
                        ${rowLabelsHtml}
                    </div>
                    <!-- 오스스메별 열들 -->
                    ${columnsHtml}
                </div>
            </div>
        `;

        scrollArea.innerHTML = `
            <style>
                .source-stacked-bar-segment {
                    font-size: 0.68rem;
                }
                .possession-heatmap-row-labels {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    width: 70px;
                    flex-shrink: 0;
                    box-sizing: border-box;
                }
                .possession-heatmap-row-label {
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    padding-left: 8px;
                    background: #ffffff;
                    border-radius: 4px 0 0 4px;
                    box-sizing: border-box;
                    user-select: none;
                    border-bottom: 1px solid #f1f5f9;
                }
                .possession-heatmap-cell {
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: 800;
                    border-radius: 0 !important;
                    pointer-events: none;
                    box-sizing: border-box;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    border-right: 1px solid rgba(0,0,0,0.03);
                    user-select: none;
                }
                .possession-heatmap-col-header {
                    height: 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    box-sizing: border-box;
                    user-select: none;
                    border-radius: 4px 4px 0 0;
                    background: #ffffff;
                    border-bottom: 1px solid #f1f5f9;
                    border-right: 1px solid #f1f5f9;
                }
                @media (hover: hover) {
                    .char-stat-card:hover {
                        border-color: #cbd5e1 !important;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
                    }
                    .source-stat-main:hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                    }
                    .idol-stats-plan-col:hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                        border-color: rgba(0, 0, 0, 0.05) !important;
                    }
                }
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
                    .possession-overall-bar-container:hover:not(.no-hover-preview) .overall-bar-gradient {
                        opacity: 0;
                    }
                    .possession-overall-bar-container:hover:not(.no-hover-preview) .overall-bar-chars {
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
                    border-color: ${firstPlaceCharColor} !important;
                    box-shadow: 0 0 0 2.5px ${hexToRgba(firstPlaceCharColor, 0.25)} !important;
                }
                .possession-heatmap-container {
                    display: none !important;
                }
                .possession-section-card.show-detail .possession-heatmap-container {
                    display: flex !important;
                }
                .idol-stats-source-card {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    background: transparent;
                    border: none;
                    padding: 0;
                }
                .source-stat-card {
                    grid-column: span 1;
                    border: none !important;
                    padding: 0 !important;
                    margin-bottom: 0 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .source-stat-card.expanded {
                    grid-column: span 2 !important;
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(0, 0, 0, 0.08) !important;
                    border-radius: 12px;
                    padding: 10px 12px !important;
                }
                .source-stat-card:not(.expanded) .source-stat-main {
                    display: none !important;
                }
                .source-stat-card.expanded .source-stat-circle-view {
                    display: none !important;
                }
                .source-stat-circle-view {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 12px 10px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.45);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    cursor: pointer;
                    user-select: none;
                    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                }
                .source-stat-circle-wrapper {
                    width: 84px;
                    height: 84px;
                }
                @media (hover: hover) {
                    .source-stat-circle-view:hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                        border-color: rgba(0, 0, 0, 0.12) !important;
                        transform: translateY(-1px);
                    }
                    .source-stat-main:hover {
                        background-color: rgba(0, 0, 0, 0.03) !important;
                    }
                }
 
                .idol-stats-plan-col {
                    padding: 8px 10px !important;
                    border-radius: 8px !important;
                    transition: background-color 0.15s ease, border-color 0.15s ease !important;
                    border: 1px solid transparent !important;
                    cursor: pointer;
                    user-select: none;
                }
                .idol-stats-plan-col.active {
                    background-color: rgba(0, 0, 0, 0.008) !important;
                    border-color: rgba(0, 0, 0, 0.1) !important;
                }

                @media (min-width: 769px) {
                    .idol-stats-char-card {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                    }
                    .char-stat-card {
                        grid-column: span 1;
                    }
                    .char-stat-card[data-rank="1"],
                    .char-stat-card[data-rank="2"],
                    .char-stat-card[data-rank="3"] {
                        grid-column: span 3;
                    }
                    .char-stat-card.expanded {
                        grid-column: span 3 !important;
                    }
                    .char-stat-card:not(.expanded):not([data-rank="1"]):not([data-rank="2"]):not([data-rank="3"]) .idol-stats-char-name-wrap > span:first-child {
                        display: none !important;
                    }
                }
                body.is-capturing .idol-stats-char-card {
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 10px !important;
                }
                body.is-capturing .char-stat-card {
                    grid-column: span 1 !important;
                }
                body.is-capturing .char-stat-card[data-rank="1"],
                body.is-capturing .char-stat-card[data-rank="2"],
                body.is-capturing .char-stat-card[data-rank="3"] {
                    grid-column: span 3 !important;
                }
                body.is-capturing .char-stat-card.expanded {
                    grid-column: span 3 !important;
                }
                body.is-capturing .char-stat-card:not(.expanded):not([data-rank="1"]):not([data-rank="2"]):not([data-rank="3"]) .idol-stats-char-name-wrap > span:first-child {
                    display: none !important;
                }
                .idol-stats-section-title {
                    margin-bottom: -10px !important;
                    padding-left: 8px !important;
                }
                .idol-stats-chart-area-wrapper {
                    width: 100% !important;
                }
                .idol-stats-bar-outer {
                    transition: opacity 0.15s ease;
                }
                .idol-stats-chart-wrapper.has-active .idol-stats-bar-outer {
                    opacity: 0.5;
                }
                .idol-stats-chart-wrapper.has-active .idol-stats-bar-outer.active {
                    opacity: 1;
                }
                .idol-stats-bar-outer.active .idol-stats-bar {
                    filter: brightness(0.9) saturate(1.3);
                }
                .idol-stats-xaxis-label {
                    transition: opacity 0.15s ease, color 0.15s ease;
                }
                .idol-stats-xaxis-container.has-active .idol-stats-xaxis-label {
                    opacity: 0.5;
                }
                .idol-stats-xaxis-container.has-active .idol-stats-xaxis-label.active {
                    opacity: 1;
                    color: #1e293b !important;
                    font-weight: 800 !important;
                }
                .idol-stats-radar-divider {
                    width: 1px;
                    min-width: 1px;
                    flex: 0 0 1px;
                    height: 170px;
                    background-color: #f0f0f0;
                    align-self: center;
                }
                .idol-stats-plan-radars-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    flex-direction: row;
                    width: 100%;
                }
                .idol-stats-plan-radar-container {
                    flex: 1;
                    display: block;
                    height: 205px;
                    position: relative;
                    overflow: visible;
                }
                .idol-stats-plan-radar-container svg {
                    display: block;
                    margin: 0 auto;
                    width: 170px;
                    height: 205px;
                    overflow: visible;
                    flex-shrink: 0;
                }
                body.is-capturing .idol-stats-plan-radars-wrapper,
                body.is-capturing .idol-stats-plan-radar-container,
                body.is-capturing .idol-stats-plan-radar-container svg {
                    overflow: visible !important;
                }
                body.is-capturing .idol-stats-plan-radar-container {
                    min-height: 205px !important;
                }
                body.is-capturing .idol-stats-plan-radars-wrapper {
                    gap: 15px !important;
                }
                body.is-capturing .idol-stats-plan-radar-container {
                    height: 270px !important;
                    min-height: 270px !important;
                }
                body.is-capturing .idol-stats-plan-radar-container svg {
                    width: 226px !important;
                    height: 270px !important;
                }
                body.is-capturing .idol-stats-radar-divider {
                    height: 226px !important;
                }

                @media (min-width: 769px) {
                    .idol-stats-plan-radars-wrapper {
                        gap: 15px !important;
                    }
                    .idol-stats-plan-radar-container {
                        height: 270px !important;
                    }
                    .idol-stats-plan-radar-container svg {
                        width: 226px !important;
                        height: 270px !important;
                    }
                    .idol-stats-radar-divider {
                        height: 226px !important;
                    }
                    body.is-capturing .idol-stats-plan-radar-container {
                        min-height: 270px !important;
                    }
                }
                .plan-subgroup-headers {
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: #fff;
                    display: none;
                    width: 100%;
                    box-sizing: border-box;
                    margin-bottom: 8px;
                }
                .plan-subgroup-header-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: none;
                    background-color: transparent;
                    color: #777;
                    font-family: inherit;
                    font-size: 0.72rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: background-color 0.15s ease, color 0.15s ease;
                }
                .plan-subgroup-header-btn:first-child {
                    border-right: 1px solid rgba(0,0,0,0.08);
                }
                .plan-subgroup-header-btn img {
                    pointer-events: none;
                }
                .plan-subgroup-header-btn span {
                    pointer-events: none;
                }
                .heatmap-cell-number {
                    display: inline-block;
                    pointer-events: none;
                }
                .possession-heatmap-row-sum-val {
                    display: inline-block;
                    pointer-events: none;
                }
                .idol-stats-char-toggle-group {
                    display: inline-flex;
                    align-items: center;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 0;
                    box-sizing: border-box;
                    overflow: hidden;
                    height: 24px;
                    vertical-align: middle;
                }
                .idol-stats-char-toggle-btn {
                    font-size: 0.72rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #777;
                    padding: 2px 10px;
                    margin: 0;
                    height: 100%;
                    box-sizing: border-box;
                    background: transparent;
                    user-select: none;
                    transition: background-color 0.15s, color 0.15s;
                }
                .idol-stats-char-toggle-btn:first-child {
                    border-right: 1px solid #e2e8f0;
                }
                .idol-stats-char-toggle-btn.active {
                    color: #1e293b !important;
                    background: #f1f5f9 !important;
                }

            </style>

            <div id="idol-possession-stats-wrapper" style="display: flex; flex-direction: column; gap: 14px;">
                <!-- Overall Stats Card -->
                <div class="possession-section-card ${showOverallDetail ? 'show-detail' : ''}" data-is-overall="true" style="background: ${cardBg}; border: ${cardBorder}; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;">
                    <div class="idol-stats-overall-header" style="display: flex; justify-content: space-between; align-items: center; font-size: 1.05rem; font-weight: 800; color: #333;">
                        <span class="idol-stats-overall-left-wrap" style="display: flex; align-items: center; gap: 6px;">
                            <img class="idol-stats-overall-icon" src="icons/sainou.webp" style="width: 18px; height: 18px; object-fit: contain; flex-shrink: 0;">
                            <span class="idol-stats-overall-lbl">${text.overall_rate}</span>
                            <div class="idol-stats-overall-chk-group" style="display: inline-flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0; box-sizing: border-box; overflow: hidden; height: 26px; vertical-align: middle;">
                                <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; border: none !important; background: transparent !important; padding: 2px 8px; margin: 0; height: 100%; box-sizing: border-box; border-radius: 0;">
                                    <span>${text.include_dist}</span>
                                    <input type="checkbox" id="chk-include-dist" ${includeDist ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                                </label>
                                <div style="width: 1px; height: 12px; background: #cbd5e1; flex-shrink: 0; align-self: center;"></div>
                                <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; border: none !important; background: transparent !important; padding: 2px 8px; margin: 0; height: 100%; box-sizing: border-box; border-radius: 0;">
                                    <span>${text.include_another}</span>
                                    <input type="checkbox" id="chk-include-another" ${includeAnother ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                                </label>
                            </div>
                        </span>
                        <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; background: #fff; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 6px; margin: 0; height: 26px; box-sizing: border-box; flex-shrink: 0;">
                            <span>${text.show_100percent_only}</span>
                            <input type="checkbox" id="chk-show-100percent-only" ${show100PercentOnly ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                        </label>
                    </div>
                    <div class="idol-stats-overall-val" style="color: ${firstPlaceCharColor}; font-size: 1.15rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 800; margin-top: 26px; margin-bottom: 4px;">
                        ${rankImgHtml}
                        <span>${overallRate}% (${ownedCount}/${totalCount})</span>
                    </div>
                    <div class="possession-overall-bar-container" style="width: 100%; height: 36px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; box-sizing: border-box; position: relative; cursor: pointer;">
                        <!-- 평소에 보이는 그라데이션/단색 바 -->
                        <div class="overall-bar-gradient" style="width: ${overallRate}%; height: 100%; background: ${barColor};"></div>
                        <!-- 호버/클릭 시 보이는 캐릭터별 분할 바 -->
                        <div class="overall-bar-chars" style="width: ${overallRate}%; height: 100%;">
                            ${charSegmentsHtml}
                        </div>
                    </div>
                    ${heatmapGridHtml}
                </div>

                <!-- Row for Plan Stats -->
                <div id="pssr-plan-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/${highestPlan}.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.plan_stats}</span>
                </div>
                <div class="possession-section-card idol-stats-plan-card" style="background: transparent; border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px;">
                    <div class="idol-stats-plan-radars-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: -6px;">
                        <div class="idol-stats-plan-radar-container">
                            ${planRadarChartHtml}
                        </div>
                        <div class="idol-stats-radar-divider"></div>
                        <div class="idol-stats-plan-radar-container subtype-radar">
                            ${subtypeRadarChartHtml}
                        </div>
                    </div>
                    <div class="idol-stats-plan-row-container" style="display: flex; gap: 16px; flex-wrap: wrap; width: 100%;">
                        ${planRowsHtml}
                    </div>
                    <div id="plan-stat-details" style="display: none; background: rgba(250, 249, 250, 0.45); border-top: 1px solid rgba(0, 0, 0, 0.05); padding: 12px 4px; border-radius: 8px; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                        <!-- Owned Cards Group -->
                        <div id="plan-stat-owned-group" style="display: flex; flex-direction: column; gap: 0; width: 100%;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #555; padding-left: 6px; user-select: none;"></div>
                            <div id="plan-stat-owned-container" style="padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                        <!-- Unowned Cards Group -->
                        <div id="plan-stat-unowned-group" style="display: flex; flex-direction: column; gap: 0; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #999; padding-left: 6px; user-select: none;"></div>
                            <div id="plan-stat-unowned-container" style="padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                    </div>
                </div>

                <div id="pssr-source-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/train.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.source_stats}</span>
                </div>
                <div class="possession-section-card idol-stats-source-card" style="background: transparent; border: none; padding: 0;">
                    ${sourceStackedBarHtml}
                    ${sourceRowsHtml}
                </div>

                <div id="pssr-char-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <img src="icons/idolicons/${firstPlaceChar}_c.png" style="width: 22px; height: 22px; object-fit: contain; flex-shrink: 0;">
                        <span>${text.char_stats}</span>
                    </span>
                    <!-- 플랜별/분류별 토글박스 -->
                    <div class="idol-stats-char-toggle-group">
                        <label class="idol-stats-char-toggle-btn ${charStatsViewMode === 'plan' ? 'active' : ''}" data-mode="plan">
                            <span>${text.toggle_plan}</span>
                        </label>
                        <label class="idol-stats-char-toggle-btn ${charStatsViewMode === 'source' ? 'active' : ''}" data-mode="source">
                            <span>${text.toggle_source}</span>
                        </label>
                    </div>
                </div>
                <div class="possession-section-card idol-stats-char-card" style="background: transparent; border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px;">
                    ${charListHtml}
                </div>
            </div>
        `;

        const anotherCheckbox = scrollArea.querySelector('#chk-include-another');
        if (anotherCheckbox) {
            anotherCheckbox.addEventListener('change', (e) => {
                includeAnother = e.target.checked;
                saveIncludeAnother(includeAnother);
                updateStatsUI();
            });
        }
        const distCheckbox = scrollArea.querySelector('#chk-include-dist');
        if (distCheckbox) {
            distCheckbox.addEventListener('change', (e) => {
                includeDist = e.target.checked;
                saveIncludeDist(includeDist);
                updateStatsUI();
            });
        }
        const show100PercentCheckbox = scrollArea.querySelector('#chk-show-100percent-only');
        if (show100PercentCheckbox) {
            show100PercentCheckbox.addEventListener('change', (e) => {
                show100PercentOnly = e.target.checked;
                saveShow100PercentOnly(show100PercentOnly);
                updateStatsUI();
            });
        }
        const heatmapContainer = scrollArea.querySelector('.possession-heatmap-container');
        if (heatmapContainer) {
            heatmapContainer.addEventListener('click', () => {
                heatmapViewMode = heatmapViewMode === 'source' ? 'subtype' : 'source';
                updateStatsUI();
            });
        }
        const overallCard = scrollArea.querySelector('.possession-section-card[data-is-overall="true"]');
        if (overallCard) {
            const overallBar = overallCard.querySelector('.possession-overall-bar-container');
            if (overallBar) {
                overallBar.addEventListener('click', () => {
                    showOverallDetail = !showOverallDetail;
                    overallCard.classList.toggle('show-detail', showOverallDetail);
                    if (!showOverallDetail) {
                        overallBar.classList.add('no-hover-preview');
                    }
                });
                overallBar.addEventListener('mouseleave', () => {
                    overallBar.classList.remove('no-hover-preview');
                });
            }
        }
    }

    const PLAN_SPECS = {
        sense: ['goodcondition', 'concentration'],
        logic: ['goodimpression', 'motivation'],
        anomaly: ['enthusiasm', 'fullpower']
    };

    const renderPlanSubGroupsHtml = (cards, isOwned, plan, lang, buildIconsHtml, allPlanCards) => {
        const specs = PLAN_SPECS[plan] || [];
        const leftCards = cards.filter(c => getOsusume(c, pssrCards) === specs[0]);
        const rightCards = cards.filter(c => {
            const os = getOsusume(c, pssrCards);
            if (plan === 'anomaly' && os === 'preservation') return true;
            return os === specs[1];
        });
        const otherCards = cards.filter(c => {
            const os = getOsusume(c, pssrCards);
            if (plan === 'anomaly' && os === 'preservation') return false;
            return !specs.includes(os);
        });

        const leftHtml = buildIconsHtml(leftCards.concat(otherCards), isOwned);
        const rightHtml = buildIconsHtml(rightCards, isOwned);

        const leftLabel = SUB_TYPE_LABELS[lang]?.[specs[0]] || specs[0];
        const rightLabel = SUB_TYPE_LABELS[lang]?.[specs[1]] || specs[1];

        const leftIconSrc = specs[0] ? `icons/${specs[0]}.webp` : '';
        const rightIconSrc = specs[1] ? `icons/${specs[1]}.webp` : '';

        // Calculate rates based on allPlanCards
        const leftTotalCards = allPlanCards.filter(c => {
            const os = getOsusume(c, pssrCards);
            return os === specs[0] || (!specs.includes(os) && !(plan === 'anomaly' && os === 'preservation'));
        });
        const rightTotalCards = allPlanCards.filter(c => {
            const os = getOsusume(c, pssrCards);
            if (plan === 'anomaly' && os === 'preservation') return true;
            return os === specs[1];
        });

        const leftOwnedCount = leftTotalCards.filter(c => isCardOwned(c.id)).length;
        const rightOwnedCount = rightTotalCards.filter(c => isCardOwned(c.id)).length;

        const leftRate = leftTotalCards.length > 0 ? Math.round((leftOwnedCount / leftTotalCards.length) * 100) : 0;
        const rightRate = rightTotalCards.length > 0 ? Math.round((rightOwnedCount / rightTotalCards.length) * 100) : 0;

        const planColors = { sense: '#ff4d8d', logic: '#46a4f3', anomaly: '#ffb300' };
        const pColor = planColors[plan] || '#ff4d8d';

        return `
            <div class="plan-subgroup-wrapper" data-plan="${plan}" data-active-subgroup="none" style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
                <!-- Header Tab Buttons (only shown on mobile) -->
                <div class="plan-subgroup-headers">
                    <button type="button" class="plan-subgroup-header-btn left" data-subgroup="left">
                        <img src="${leftIconSrc}" style="width: 16px; height: 16px; object-fit: contain;">
                        <span class="pssr-stat-rate-pct">
                            ${isOwned ? leftRate : (100 - leftRate)}% <span class="pssr-stat-rate-fraction">(${isOwned ? leftOwnedCount : (leftTotalCards.length - leftOwnedCount)}/${leftTotalCards.length})</span>
                        </span>
                    </button>
                    <button type="button" class="plan-subgroup-header-btn right" data-subgroup="right">
                        <img src="${rightIconSrc}" style="width: 16px; height: 16px; object-fit: contain;">
                        <span class="pssr-stat-rate-pct">
                            ${isOwned ? rightRate : (100 - rightRate)}% <span class="pssr-stat-rate-fraction">(${isOwned ? rightOwnedCount : (rightTotalCards.length - rightOwnedCount)}/${rightTotalCards.length})</span>
                        </span>
                    </button>
                </div>
                
                <div class="plan-subgroup-columns-row" style="display: flex; width: 100%; gap: 0; position: relative;">
                    <div class="plan-subgroup-col-left" style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                        <div class="plan-subgroup-title-row" style="display: flex; justify-content: center; align-items: center; gap: 4px; margin-bottom: 4px; user-select: none;">
                            <img src="${leftIconSrc}" style="width: 18px; height: 18px; object-fit: contain;">
                            <span style="color: ${pColor};" class="pssr-stat-rate-pct">
                                ${isOwned ? leftRate : (100 - leftRate)}% <span class="pssr-stat-rate-fraction">(${isOwned ? leftOwnedCount : (leftTotalCards.length - leftOwnedCount)}/${leftTotalCards.length})</span>
                            </span>
                        </div>
                        <div class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">${leftHtml}</div>
                    </div>
                    <div class="plan-subgroup-divider" style="width: 1px; background: rgba(0,0,0,0.08); align-self: stretch; margin: 8px 0;"></div>
                    <div class="plan-subgroup-col-right" style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                        <div class="plan-subgroup-title-row" style="display: flex; justify-content: center; align-items: center; gap: 4px; margin-bottom: 4px; user-select: none;">
                            <img src="${rightIconSrc}" style="width: 18px; height: 18px; object-fit: contain;">
                            <span style="color: ${pColor};" class="pssr-stat-rate-pct">
                                ${isOwned ? rightRate : (100 - rightRate)}% <span class="pssr-stat-rate-fraction">(${isOwned ? rightOwnedCount : (rightTotalCards.length - rightOwnedCount)}/${rightTotalCards.length})</span>
                            </span>
                        </div>
                        <div class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">${rightHtml}</div>
                    </div>
                </div>
            </div>
        `;
    };

    // Register click delegator for collapsible details (character cards & plan cards)
    scrollArea.addEventListener('click', (e) => {
        const waffleWrap = e.target.closest('.pssr-stat-waffle-wrap[data-waffle-group]');
        if (waffleWrap) {
            e.stopPropagation();
            const group = waffleWrap.dataset.waffleGroup;
            const parent = waffleWrap.parentElement;
            if (!parent || !group) return;
            const isCollapsed = waffleWrap.classList.toggle('collapsed');
            waffleGroupState[group] = isCollapsed;
            parent.querySelectorAll(`.pssr-stat-icon-wrap[data-waffle-group="${group}"]`).forEach(icon => {
                icon.style.display = isCollapsed ? 'none' : '';
            });

            const hasVisibleIcon = Array.from(parent.querySelectorAll('.pssr-stat-icon-wrap')).some(icon => icon.style.display !== 'none');
            parent.querySelectorAll('.pssr-stat-icon-spacer').forEach(spacer => {
                spacer.style.display = hasVisibleIcon ? '' : 'none';
            });
            return;
        }

        const toggleBtn = e.target.closest('.idol-stats-char-toggle-btn');
        if (toggleBtn) {
            e.stopPropagation();
            const mode = toggleBtn.dataset.mode;
            if (mode && charStatsViewMode !== mode) {
                charStatsViewMode = mode;
                updateStatsUI();
            }
            return;
        }

        const subgroupBtn = e.target.closest('.plan-subgroup-header-btn');
        if (subgroupBtn) {
            e.stopPropagation();
            const detailsDiv = subgroupBtn.closest('#plan-stat-details');
            if (detailsDiv) {
                const isLeftClick = subgroupBtn.classList.contains('left');
                const wasActive = subgroupBtn.classList.contains('active');

                detailsDiv.querySelectorAll('.plan-subgroup-wrapper').forEach(wrapper => {
                    const leftBtn = wrapper.querySelector('.plan-subgroup-header-btn.left');
                    const rightBtn = wrapper.querySelector('.plan-subgroup-header-btn.right');

                    if (isLeftClick) {
                        if (wasActive) {
                            if (leftBtn) leftBtn.classList.remove('active');
                            if (rightBtn) rightBtn.classList.remove('active');
                            wrapper.setAttribute('data-active-subgroup', 'none');
                        } else {
                            if (leftBtn) leftBtn.classList.add('active');
                            if (rightBtn) rightBtn.classList.remove('active');
                            wrapper.setAttribute('data-active-subgroup', 'left');
                        }
                    } else {
                        if (wasActive) {
                            if (leftBtn) leftBtn.classList.remove('active');
                            if (rightBtn) rightBtn.classList.remove('active');
                            wrapper.setAttribute('data-active-subgroup', 'none');
                        } else {
                            if (leftBtn) leftBtn.classList.remove('active');
                            if (rightBtn) rightBtn.classList.add('active');
                            wrapper.setAttribute('data-active-subgroup', 'right');
                        }
                    }
                });
            }
            return;
        }

        const sourceCard = e.target.closest('.source-stat-card');
        if (sourceCard) {
            const mainRow = e.target.closest('.source-stat-main') || e.target.closest('.source-stat-circle-view');
            if (mainRow) {
                const detailsDiv = sourceCard.querySelector('.source-stat-details');
                const chevron = sourceCard.querySelector('.source-chevron');
                if (detailsDiv) {
                    const isHidden = detailsDiv.style.display === 'none';
                    if (isHidden) {
                        const src = sourceCard.dataset.source;
                        let activeCards = pssrCards;
                        if (!includeAnother) activeCards = activeCards.filter(c => !c.another);
                        if (!includeDist) activeCards = activeCards.filter(c => c.source !== 'dist');

                        const sourceCards = activeCards.filter(c => {
                            const cardSrc = c.another ? 'another' : (c.source || 'normal');
                            return cardSrc === src;
                        });

                        const sortFn = src === 'limited_f' ? sortPssrFesCards : (src === 'normal' ? sortPssrNormalCards : (src === 'another' ? sortPssrAnotherCards : (src === 'limited_u' ? sortPssrUnitCards : sortPssrByCharacterAndRelease)));
                        sourceCards.sort(sortFn);

                        const sourceColor = sourceCard.dataset.color || '#93c5fd';
                        const buildIconsHtml = (cardsList, isOwnedList) => buildPssrIconsHtml(cardsList, isOwnedList, { useSeriesBadgeForNormal: src === 'normal', useWaffleChartForNormalSeries: src === 'normal', useSubCategoryBadgeForFes: src === 'limited_f', useWaffleChartForFesSubCategory: src === 'limited_f', usePeriodBadgeForLimitedAndDist: (src === 'limited' || src === 'dist'), useWaffleChartForLimitedPeriod: (src === 'limited' || src === 'dist'), useSeriesBadgeForAnother: src === 'another', useWaffleChartForAnotherSeries: src === 'another', useWaffleChartForUnitName: src === 'limited_u', sourceColor: sourceColor });

                        const ownedContainer = detailsDiv.querySelector('.source-stat-owned-container');
                        const unownedContainer = detailsDiv.querySelector('.source-stat-unowned-container');
                        const ownedGroup = detailsDiv.querySelector('.source-stat-owned-group');
                        const unownedGroup = detailsDiv.querySelector('.source-stat-unowned-group');

                        const isJa = lang === 'ja';
                        const isEn = lang === 'en';
                        const ownedBg = hexToRgba(sourceColor, 0.08);
                        const ownedBorder = hexToRgba(sourceColor, 0.12);

                        if (sourceCards.length > 0) {
                            ownedGroup.style.display = 'flex';
                            const titleEl = ownedGroup.querySelector('.plan-group-title');
                            if (titleEl) titleEl.style.display = 'none';
                            ownedContainer.innerHTML = buildIconsHtml(sourceCards, null);

                            ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: var(--pssr-title-gap); width: 100%; box-sizing: border-box; background-color: transparent; border: none; padding: 0;`;
                        } else {
                            ownedGroup.style.display = 'none';
                        }
                        unownedGroup.style.display = 'none';
                        detailsDiv.style.gap = '0';
                    }

                    detailsDiv.style.display = isHidden ? 'flex' : 'none';
                    sourceCard.classList.toggle('expanded', isHidden);
                    if (chevron) {
                        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                }
            }
            return;
        }

        const planCol = e.target.closest('.idol-stats-plan-col');
        if (planCol) {
            const plan = planCol.dataset.plan;
            const detailsDiv = scrollArea.querySelector('#plan-stat-details');
            if (detailsDiv) {
                const currentPlan = detailsDiv.dataset.activePlan;
                const isCurrentlyActive = currentPlan === plan && detailsDiv.style.display !== 'none';

                scrollArea.querySelectorAll('.idol-stats-plan-col').forEach(col => {
                    col.classList.remove('active');
                });

                if (isCurrentlyActive) {
                    detailsDiv.style.display = 'none';
                    detailsDiv.dataset.activePlan = '';
                } else {
                    let activeCards = pssrCards;
                    if (!includeAnother) activeCards = activeCards.filter(c => !c.another);
                    if (!includeDist) activeCards = activeCards.filter(c => c.source !== 'dist');

                    const planCards = activeCards.filter(c => (c.plan || 'sense') === plan);
                    const ownedCards = planCards.filter(c => isCardOwned(c.id));
                    const unownedCards = planCards.filter(c => !isCardOwned(c.id));

                    ownedCards.sort(sortPssrByCharacterAndRelease);
                    unownedCards.sort(sortPssrByCharacterAndRelease);

                    const buildIconsHtml = (cardsList, isOwnedList) => buildPssrIconsHtml(cardsList, isOwnedList, { useOsusumeBadgeForPlan: true });

                    const ownedContainer = detailsDiv.querySelector('#plan-stat-owned-container');
                    const unownedContainer = detailsDiv.querySelector('#plan-stat-unowned-container');
                    const ownedGroup = detailsDiv.querySelector('#plan-stat-owned-group');
                    const unownedGroup = detailsDiv.querySelector('#plan-stat-unowned-group');

                    const isJa = lang === 'ja';
                    const isEn = lang === 'en';
                    const ownedLabel = isJa ? '所持' : isEn ? 'Owned' : '소지';
                    const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';

                    const hasOwned = ownedCards.length > 0;
                    const hasUnowned = unownedCards.length > 0;

                    const planColors = {
                        sense: '#ff4d8d',
                        logic: '#46a4f3',
                        anomaly: '#ffb300'
                    };
                    const planColor = planColors[plan] || '#ff4d8d';
                    const ownedBg = hexToRgba(planColor, 0.08);
                    const ownedBorder = hexToRgba(planColor, 0.12);

                    if (hasOwned) {
                        ownedGroup.style.display = 'flex';
                        ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                        ownedContainer.innerHTML = renderPlanSubGroupsHtml(ownedCards, true, plan, lang, buildIconsHtml, planCards);

                        ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: var(--pssr-title-gap); width: 100%; padding: var(--pssr-box-padding); box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: ${hasUnowned ? '8px 8px 0 0' : '8px'};`;
                    } else {
                        ownedGroup.style.display = 'none';
                    }

                    if (hasUnowned) {
                        unownedGroup.style.display = 'flex';
                        unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                        unownedContainer.innerHTML = renderPlanSubGroupsHtml(unownedCards, false, plan, lang, buildIconsHtml, planCards);

                        unownedGroup.style.cssText = `display: flex; flex-direction: column; gap: var(--pssr-title-gap); width: 100%; padding: var(--pssr-box-padding); box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: ${hasOwned ? '0 0 8px 8px' : '8px'};`;
                    } else {
                        unownedGroup.style.display = 'none';
                    }
                    detailsDiv.style.gap = (hasOwned && hasUnowned) ? '1px' : '12px';

                    detailsDiv.style.display = 'flex';
                    detailsDiv.dataset.activePlan = plan;
                    planCol.classList.add('active');
                }
            }
            return;
        }

        const clickedFilterItem = e.target.closest('.idol-stats-bar-outer') || e.target.closest('.idol-stats-xaxis-label');
        if (clickedFilterItem) {
            e.stopPropagation();
            const charCard = clickedFilterItem.closest('.char-stat-card');
            if (charCard) {
                const isPlanMode = charStatsViewMode === 'plan';
                const filterKey = isPlanMode ? clickedFilterItem.dataset.subtype : clickedFilterItem.dataset.source;
                const selectorAttr = isPlanMode ? 'data-subtype' : 'data-source';

                const barOuter = charCard.querySelector(`.idol-stats-bar-outer[${selectorAttr}="${filterKey}"]`);
                const label = charCard.querySelector(`.idol-stats-xaxis-label[${selectorAttr}="${filterKey}"]`);

                if (barOuter) {
                    const isActive = barOuter.classList.contains('active');

                    charCard.querySelectorAll('.idol-stats-bar-outer').forEach(b => b.classList.remove('active'));
                    charCard.querySelectorAll('.idol-stats-xaxis-label').forEach(l => l.classList.remove('active'));

                    const iconWrappers = charCard.querySelectorAll('.pssr-char-icons-container .pssr-stat-icon-wrap');
                    const separators = charCard.querySelectorAll('.pssr-char-icons-container div[style*="border-top"]');

                    if (isActive) {
                        iconWrappers.forEach(w => {
                            w.style.display = '';
                        });
                        separators.forEach(sep => {
                            sep.style.display = '';
                        });

                        const chartWrapper = barOuter.closest('.idol-stats-chart-wrapper');
                        if (chartWrapper) chartWrapper.classList.remove('has-active');

                        const xaxisContainer = charCard.querySelector('.idol-stats-xaxis-container');
                        if (xaxisContainer) xaxisContainer.classList.remove('has-active');
                    } else {
                        barOuter.classList.add('active');
                        if (label) label.classList.add('active');

                        const chartWrapper = barOuter.closest('.idol-stats-chart-wrapper');
                        if (chartWrapper) chartWrapper.classList.add('has-active');

                        const xaxisContainer = charCard.querySelector('.idol-stats-xaxis-container');
                        if (xaxisContainer) xaxisContainer.classList.add('has-active');

                        iconWrappers.forEach(w => {
                            const itemVal = isPlanMode ? w.dataset.subtype : w.dataset.source;
                            if (itemVal === filterKey) {
                                w.style.display = '';
                            } else {
                                w.style.display = 'none';
                            }
                        });
                        separators.forEach(sep => {
                            sep.style.display = 'none';
                        });
                    }
                }
            }
            return;
        }

        const charCard = e.target.closest('.char-stat-card');
        if (charCard) {
            const mainRow = e.target.closest('.char-stat-main');
            if (mainRow) {
                const charId = charCard.dataset.charId;
                const details = charCard.querySelector('.char-stat-details');
                const chevron = charCard.querySelector('.char-chevron');
                if (details) {
                    const isHidden = details.style.display === 'none';
                    details.style.display = isHidden ? 'flex' : 'none';
                    if (isHidden) {
                        charCard.classList.add('expanded');
                        if (charId) expandedCharIds.add(charId);
                    } else {
                        charCard.classList.remove('expanded');
                        if (charId) expandedCharIds.delete(charId);
                        // Reset filters when collapsing
                        charCard.querySelectorAll('.idol-stats-bar-outer').forEach(b => b.classList.remove('active'));
                        charCard.querySelectorAll('.idol-stats-xaxis-label').forEach(l => l.classList.remove('active'));

                        const chartWrapper = charCard.querySelector('.idol-stats-chart-wrapper');
                        if (chartWrapper) chartWrapper.classList.remove('has-active');

                        const xaxisContainer = charCard.querySelector('.idol-stats-xaxis-container');
                        if (xaxisContainer) xaxisContainer.classList.remove('has-active');

                        charCard.querySelectorAll('.pssr-char-icons-container .pssr-stat-icon-wrap').forEach(w => {
                            w.style.display = '';
                        });
                        charCard.querySelectorAll('.pssr-char-icons-container div[style*="border-top"]').forEach(sep => {
                            sep.style.display = '';
                        });
                    }
                    if (chevron) {
                        chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                }
            }
        }
    });

    updateStatsUI();
    scrollArea.scrollTop = 0;

    // Save Image button listener
    const saveBtn = headerArea.querySelector('#btn-idol-possession-save');
    saveBtn.onclick = () => {
        // Reset all active bar filters inside the modal when saving image
        modal.querySelectorAll('.idol-stats-bar-outer').forEach(b => b.classList.remove('active'));
        modal.querySelectorAll('.idol-stats-xaxis-label').forEach(l => l.classList.remove('active'));
        modal.querySelectorAll('.idol-stats-chart-wrapper').forEach(w => w.classList.remove('has-active'));
        modal.querySelectorAll('.idol-stats-xaxis-container').forEach(c => c.classList.remove('has-active'));
        modal.querySelectorAll('.pssr-char-icons-container .pssr-stat-icon-wrap').forEach(w => {
            w.style.display = '';
        });
        modal.querySelectorAll('.pssr-char-icons-container div[style*="border-top"]').forEach(sep => {
            sep.style.display = '';
        });

        const originalText = saveBtn.innerHTML;

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
                border-top: 4.5px solid ${firstPlaceCharColor};
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
            label.textContent = text.alert_generating;

            overlay.appendChild(spinner);
            overlay.appendChild(label);
            document.body.appendChild(overlay);
        };

        const hideSpinnerOverlay = () => {
            const overlay = document.getElementById('possession-save-spinner-overlay');
            if (overlay) overlay.remove();
        };

        const showSaveOptionsModal = (onSelect) => {
            history.pushState({ modalOpen: 'saveOptions' }, "");

            let optionsModal = document.createElement('div');
            let didClose = false;
            optionsModal.className = 'modal';
            optionsModal.style.zIndex = '36000';
            optionsModal.style.display = 'flex';
            optionsModal.style.alignItems = 'center';
            optionsModal.style.justifyContent = 'center';
            optionsModal.style.position = 'fixed';
            optionsModal.style.inset = '0';
            optionsModal.style.background = 'rgba(0, 0, 0, 0.7)';

            const isJa = lang === 'ja';
            const isEn = lang === 'en';
            const titleText = isJa ? '保存方法の選択 (.webp)' : isEn ? 'Select Save Method (.webp)' : '저장 방식 선택 (.webp)';
            const optAllText = isJa ? '全体保存' : isEn ? 'Save Everything' : '전체 저장';
            const optPlanAllText = isJa ? 'プラン別保存' : isEn ? 'Save by Plan' : '플랜별 저장';
            const optSourceAllText = isJa ? '分類別保存' : isEn ? 'Save by Category' : '분류별 저장';
            const optCharAllText = isJa ? 'アイドル別保存' : isEn ? 'Save by Idol' : '아이돌별 저장';

            optionsModal.innerHTML = `
                <div class="modal-content possession-save-options-content">
                    <button id="btn-save-opt-close" style="position: absolute; right: 6px; top: 6px; background: none; border: none; font-size: 1.25rem; font-weight: bold; color: #888; cursor: pointer; padding: 2px; line-height: 1; transition: none !important;">&times;</button>
                    <div class="save-opt-title" style="font-weight: 800; font-size: 1.1rem; color: #333; margin-bottom: 4px; margin-top: 8px;">${titleText}</div>
                    <button id="btn-save-opt-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: ${firstPlaceCharColor}; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                        ${optAllText}
                    </button>
                    <button id="btn-save-opt-plan-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: #64748b; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                        ${optPlanAllText}
                    </button>
                    <button id="btn-save-opt-source-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: #475569; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                        ${optSourceAllText}
                    </button>
                    <button id="btn-save-opt-char-all" class="calc-btn" style="width: 82%; margin: 0 auto; padding: 12px; font-weight: bold; background: #334155; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: none !important;">
                        ${optCharAllText}
                    </button>
                </div>
            `;

            document.body.appendChild(optionsModal);

            optionsModal.onClose = () => {
                if (didClose) return;
                didClose = true;
                optionsModal.remove();
                onSelect(null);
            };

            const closeOptionsModal = (result) => {
                if (didClose) return;
                didClose = true;
                const parentModal = document.getElementById('idol-possession-modal');
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
                optionsModal.onClose = null;
                onSelect(result);
            };

            const closeBtn = optionsModal.querySelector('#btn-save-opt-close');
            closeBtn.onclick = () => {
                closeOptionsModal(null);
            };
            optionsModal.querySelector('#btn-save-opt-all').onclick = () => {
                closeOptionsModal('all');
            };
            optionsModal.querySelector('#btn-save-opt-plan-all').onclick = () => {
                closeOptionsModal('plan-all');
            };
            optionsModal.querySelector('#btn-save-opt-source-all').onclick = () => {
                closeOptionsModal('source-all');
            };
            optionsModal.querySelector('#btn-save-opt-char-all').onclick = () => {
                closeOptionsModal('char-all');
            };
            optionsModal.onclick = (e) => {
                if (e.target === optionsModal) {
                    closeOptionsModal(null);
                }
            };
        };

        showSaveOptionsModal((saveType) => {
            if (!saveType) return;

            showSpinnerOverlay();

            saveBtn.innerHTML = `<span style="font-size: 0.8rem; font-weight: normal; display: flex; align-items: center; gap: 4px;">${text.alert_generating}</span>`;

            const startCapture = () => {
                const executeCapture = () => capture();

                if (window.html2canvas) {
                    setTimeout(executeCapture, 50);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => executeCapture();
                    script.onerror = () => {
                        alert(text.alert_fail);
                        saveBtn.innerHTML = originalText;
                        hideSpinnerOverlay();
                    };
                    document.head.appendChild(script);
                }
            };

            const capture = () => {
                document.body.classList.add('is-capturing');
                const mobileStyles = document.getElementById('idol-possession-mobile-styles');
                if (mobileStyles) {
                    mobileStyles.disabled = true;
                    mobileStyles.setAttribute('disabled', '');
                }
                saveBtn.innerHTML = 'GAKUMAS NOTE';

                const isPlanAll = saveType === 'plan-all';
                const isSourceAll = saveType === 'source-all';
                const isCharAll = saveType === 'char-all';
                const getActiveCaptureCards = () => {
                    let activeCards = pssrCards;
                    if (!includeAnother) {
                        activeCards = activeCards.filter(c => !c.another);
                    }
                    if (!includeDist) {
                        activeCards = activeCards.filter(c => c.source !== 'dist');
                    }
                    return activeCards;
                };

                // Hide other sections/elements if plan-only or source-only or char-only mode
                const elementsToHide = [];
                if (isPlanAll || isSourceAll || isCharAll) {
                    // Hide overall card
                    const overallCard = modalContent.querySelector('.possession-section-card[data-is-overall="true"]');
                    if (overallCard) elementsToHide.push(overallCard);

                    // Hide background image
                    const bgImg = modalContent.querySelector('.modal-bg-image');
                    if (bgImg) elementsToHide.push(bgImg);

                    if (isPlanAll) {
                        // Hide source label/cards
                        const sourceLbl = modalContent.querySelector('#pssr-source-stats-label');
                        if (sourceLbl) elementsToHide.push(sourceLbl);
                        const sourceCard = modalContent.querySelector('.idol-stats-source-card');
                        if (sourceCard) elementsToHide.push(sourceCard);

                        // Hide char label/cards
                        const charLbl = modalContent.querySelector('#pssr-char-stats-label');
                        if (charLbl) elementsToHide.push(charLbl);
                        const charCard = modalContent.querySelector('.idol-stats-char-card');
                        if (charCard) elementsToHide.push(charCard);
                    } else if (isSourceAll) {
                        // Hide plan label/cards
                        const planLbl = modalContent.querySelector('#pssr-plan-stats-label');
                        if (planLbl) elementsToHide.push(planLbl);
                        const planCard = modalContent.querySelector('.idol-stats-plan-card');
                        if (planCard) elementsToHide.push(planCard);

                        // Hide char label/cards
                        const charLbl = modalContent.querySelector('#pssr-char-stats-label');
                        if (charLbl) elementsToHide.push(charLbl);
                        const charCard = modalContent.querySelector('.idol-stats-char-card');
                        if (charCard) elementsToHide.push(charCard);
                    } else if (isCharAll) {
                        // Hide plan label/cards
                        const planLbl = modalContent.querySelector('#pssr-plan-stats-label');
                        if (planLbl) elementsToHide.push(planLbl);
                        const planCard = modalContent.querySelector('.idol-stats-plan-card');
                        if (planCard) elementsToHide.push(planCard);

                        // Hide source label/cards
                        const sourceLbl = modalContent.querySelector('#pssr-source-stats-label');
                        if (sourceLbl) elementsToHide.push(sourceLbl);
                        const sourceCard = modalContent.querySelector('.idol-stats-source-card');
                        if (sourceCard) elementsToHide.push(sourceCard);

                        // Hide 4th place and below characters' card icons list, keeping only the chart
                        const charCardsList = modalContent.querySelectorAll('.char-stat-card');
                        charCardsList.forEach((card, idx) => {
                            if (idx >= 3) {
                                const iconsContainer = card.querySelector('.pssr-char-icons-container');
                                if (iconsContainer) {
                                    elementsToHide.push(iconsContainer);
                                }
                            }
                        });
                    }
                }

                // Hide 2nd and 3rd place characters' card icons list during overall save to prevent huge height
                if (!isPlanAll && !isSourceAll && !isCharAll) {
                    const charCardsList = modalContent.querySelectorAll('.char-stat-card');
                    charCardsList.forEach((card, idx) => {
                        if (idx === 1 || idx === 2) {
                            const iconsContainer = card.querySelector('.pssr-char-icons-container');
                            if (iconsContainer) {
                                elementsToHide.push(iconsContainer);
                            }
                        }
                    });
                }

                const origDisplays = [];
                elementsToHide.forEach(el => {
                    origDisplays.push({
                        el,
                        display: el.style.display,
                        displayPriority: el.style.getPropertyPriority('display')
                    });
                    el.style.setProperty('display', 'none', 'important');
                });

                // Programmatically set up the plan drawer contents
                const detailsDiv = scrollArea.querySelector('#plan-stat-details');
                const origPlanDetailsHtml = detailsDiv ? detailsDiv.innerHTML : '';
                const origPlanDetailsDisplay = detailsDiv ? detailsDiv.style.display : '';
                const origPlanDetailsActive = detailsDiv ? detailsDiv.dataset.activePlan : '';
                const origPlanColsActive = [];
                scrollArea.querySelectorAll('.idol-stats-plan-col').forEach(col => {
                    origPlanColsActive.push({ col, active: col.classList.contains('active') });
                });

                if (isPlanAll && detailsDiv) {
                    const planCols = scrollArea.querySelectorAll('.idol-stats-plan-col');
                    planCols.forEach(col => col.classList.add('active'));

                    const activeCards = getActiveCaptureCards();

                    const buildIconsHtml = (cardsList, isOwnedList) => buildPssrIconsHtml(cardsList, isOwnedList, { useOsusumeBadgeForPlan: true });

                    const isJa = lang === 'ja';
                    const isEn = lang === 'en';
                    const ownedLabel = isJa ? '所持' : isEn ? 'Owned' : '소지';
                    const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';

                    let allPlansHtml = '<div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">';

                    const plans = ['sense', 'logic', 'anomaly'];
                    plans.forEach((p, pIdx) => {
                        const planCards = activeCards.filter(c => (c.plan || 'sense') === p);
                        const ownedCards = planCards.filter(c => isCardOwned(c.id));
                        const unownedCards = planCards.filter(c => !isCardOwned(c.id));
                        ownedCards.sort(sortPssrByCharacterAndRelease);
                        unownedCards.sort(sortPssrByCharacterAndRelease);

                        const planColor = p === 'sense' ? '#ff4d8d' : p === 'logic' ? '#46a4f3' : '#ffb300';
                        const planTitle = p.toUpperCase();

                        const borderStyle = pIdx < plans.length - 1 ? 'border-bottom: 1px dashed rgba(0, 0, 0, 0.08); padding-bottom: 16px;' : '';

                        const ownedBg = hexToRgba(planColor, 0.08);
                        const ownedBorder = hexToRgba(planColor, 0.12);

                        allPlansHtml += `
                            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; ${borderStyle}">
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                                    <img src="icons/${p}.webp" style="width: 15px; height: 15px; object-fit: contain;">
                                    <span style="font-weight: 800; font-size: 0.85rem; color: ${planColor};">${planTitle}</span>
                                </div>
                        `;

                        if (ownedCards.length > 0) {
                            const groupStyle = unownedCards.length > 0
                                ? `padding: 8px; box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px 8px 0 0;`
                                : `padding: 8px; box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px;`;

                            allPlansHtml += `
                                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; ${groupStyle}">
                                    <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #555; padding-left: 6px; user-select: none;">${ownedLabel} (${ownedCards.length})</div>
                                    ${renderPlanSubGroupsHtml(ownedCards, true, p, lang, buildIconsHtml, planCards)}
                                </div>
                            `;
                        }

                        if (unownedCards.length > 0) {
                            const groupStyle = ownedCards.length > 0
                                ? `padding: 8px; box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 0 0 8px 8px; margin-top: var(--pssr-group-gap);`
                                : `padding: 8px; box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 8px;`;

                            allPlansHtml += `
                                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; ${groupStyle}">
                                    <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #999; padding-left: 6px; user-select: none;">${unownedLabel} (${unownedCards.length})</div>
                                    ${renderPlanSubGroupsHtml(unownedCards, false, p, lang, buildIconsHtml, planCards)}
                                </div>
                            `;
                        }

                        allPlansHtml += `</div>`;
                    });

                    allPlansHtml += '</div>';
                    detailsDiv.innerHTML = allPlansHtml;
                    detailsDiv.style.display = 'flex';
                    detailsDiv.dataset.activePlan = 'all';
                } else if (detailsDiv) {
                    detailsDiv.style.display = 'none';
                }

                // Temporarily expand all classification/source cards during capture
                const sourceCardsList = scrollArea.querySelectorAll('.source-stat-card');
                const origSourceCardsState = [];

                sourceCardsList.forEach(sourceCard => {
                    const detailsDiv = sourceCard.querySelector('.source-stat-details');
                    const chevron = sourceCard.querySelector('.source-chevron');

                    if (detailsDiv) {
                        // Save original state
                        origSourceCardsState.push({
                            sourceCard,
                            detailsDiv,
                            chevron,
                            display: detailsDiv.style.display,
                            innerHTML: detailsDiv.innerHTML,
                            transform: chevron ? chevron.style.transform : '',
                            isExpanded: sourceCard.classList.contains('expanded')
                        });

                        if (isSourceAll) {
                            // Populate details drawer
                            const src = sourceCard.dataset.source;
                            const activeCards = getActiveCaptureCards();

                            const sourceCards = activeCards.filter(c => {
                                const cardSrc = c.another ? 'another' : (c.source || 'normal');
                                return cardSrc === src;
                            });

                            const sortFn = src === 'limited_f' ? sortPssrFesCards : (src === 'normal' ? sortPssrNormalCards : (src === 'another' ? sortPssrAnotherCards : (src === 'limited_u' ? sortPssrUnitCards : sortPssrByCharacterAndRelease)));
                            sourceCards.sort(sortFn);

                            const sourceColor = sourceCard.dataset.color || '#93c5fd';
                            const buildIconsHtml = (cardsList, isOwnedList) => buildPssrIconsHtml(cardsList, isOwnedList, { useSeriesBadgeForNormal: src === 'normal', useWaffleChartForNormalSeries: src === 'normal', useSubCategoryBadgeForFes: src === 'limited_f', useWaffleChartForFesSubCategory: src === 'limited_f', usePeriodBadgeForLimitedAndDist: (src === 'limited' || src === 'dist'), useWaffleChartForLimitedPeriod: (src === 'limited' || src === 'dist'), useSeriesBadgeForAnother: src === 'another', useWaffleChartForAnotherSeries: src === 'another', useWaffleChartForUnitName: src === 'limited_u', sourceColor: sourceColor });

                            const ownedContainer = detailsDiv.querySelector('.source-stat-owned-container');
                            const unownedContainer = detailsDiv.querySelector('.source-stat-unowned-container');
                            const ownedGroup = detailsDiv.querySelector('.source-stat-owned-group');
                            const unownedGroup = detailsDiv.querySelector('.source-stat-unowned-group');

                            const ownedBg = hexToRgba(sourceColor, 0.08);
                            const ownedBorder = hexToRgba(sourceColor, 0.12);

                            if (sourceCards.length > 0) {
                                ownedGroup.style.display = 'flex';
                                const titleEl = ownedGroup.querySelector('.plan-group-title');
                                if (titleEl) titleEl.style.display = 'none';
                                ownedContainer.innerHTML = buildIconsHtml(sourceCards, null);
                                ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; background-color: transparent; border: none; padding: 0;`;
                            } else {
                                ownedGroup.style.display = 'none';
                            }
                            unownedGroup.style.display = 'none';

                            detailsDiv.style.display = 'flex';
                            detailsDiv.style.gap = '0';
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                            sourceCard.classList.add('expanded');
                        } else {
                            detailsDiv.style.display = 'none';
                            if (chevron) chevron.style.transform = 'rotate(0deg)';
                            sourceCard.classList.remove('expanded');
                        }
                    }
                });

                // Temporarily convert SVG <image> hrefs to absolute URLs for html2canvas
                const svgImages = modalContent.querySelectorAll('svg image[href]');
                const origSvgHrefs = [];
                svgImages.forEach(img => {
                    const origHref = img.getAttribute('href');
                    if (origHref && !origHref.startsWith('http') && !origHref.startsWith('data:')) {
                        origSvgHrefs.push({ img, href: origHref });
                        img.setAttribute('href', getAbsoluteUrl(origHref));
                    }
                });

                const rasterizeRadarSvgs = async () => {
                    const radarSvgs = Array.from(modalContent.querySelectorAll('.idol-stats-plan-radar-container svg'));
                    const replacements = [];
                    const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    await Promise.all(radarSvgs.map(svg => new Promise(resolve => {
                        try {
                            const rect = svg.getBoundingClientRect();
                            if (rect.width === 0 || rect.height === 0) {
                                resolve();
                                return;
                            }
                            const width = Math.ceil(rect.width || Number(svg.getAttribute('width')) || 170);
                            const height = Math.ceil(rect.height || Number(svg.getAttribute('height')) || 205);
                            const clone = svg.cloneNode(true);
                            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            clone.setAttribute('width', String(width));
                            clone.setAttribute('height', String(height));

                            const inlineImages = async () => {
                                const images = Array.from(clone.querySelectorAll('image'));
                                await Promise.all(images.map(async imageNode => {
                                    const href = imageNode.getAttribute('href') || imageNode.getAttribute('xlink:href');
                                    if (!href || href.startsWith('data:')) return;

                                    try {
                                        const response = await fetch(href);
                                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                                        const dataUrl = await blobToDataUrl(await response.blob());
                                        imageNode.setAttribute('href', dataUrl);
                                        imageNode.removeAttribute('xlink:href');
                                    } catch (err) {
                                        imageNode.remove();
                                    }
                                }));
                            };

                            inlineImages().then(() => {
                                const svgText = new XMLSerializer().serializeToString(clone);
                                const svgUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
                                const image = new Image();

                                image.onload = () => {
                                    try {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = width * 2;
                                        canvas.height = height * 2;
                                        const ctx = canvas.getContext('2d');
                                        ctx.scale(2, 2);
                                        ctx.drawImage(image, 0, 0, width, height);

                                        const replacement = document.createElement('img');
                                        replacement.src = canvas.toDataURL('image/png');
                                        replacement.style.cssText = `display: block; width: ${width}px; height: ${height}px; margin: 0 auto; flex-shrink: 0;`;
                                        svg.replaceWith(replacement);
                                        replacements.push({ replacement, svg });
                                    } catch (err) {
                                        console.warn('Radar SVG rasterize draw failed:', err);
                                    } finally {
                                        URL.revokeObjectURL(svgUrl);
                                        resolve();
                                    }
                                };

                                image.onerror = () => {
                                    URL.revokeObjectURL(svgUrl);
                                    resolve();
                                };

                                image.src = svgUrl;
                            }).catch(err => {
                                console.warn('Radar SVG image inline failed:', err);
                                resolve();
                            });
                        } catch (err) {
                            console.warn('Radar SVG rasterize failed:', err);
                            resolve();
                        }
                    })));

                    return replacements;
                };

                const restoreRadarSvgs = (items) => {
                    items.forEach(item => {
                        if (item.replacement.parentNode) {
                            item.replacement.replaceWith(item.svg);
                        }
                    });
                };

                // Temporarily convert unowned card images to grayscale Base64 data URLs right before capture
                const statImgs = modalContent.querySelectorAll('.pssr-stat-icon-wrap img');
                const origImgSrcs = [];
                statImgs.forEach(img => {
                    const isUnowned = img.style.opacity === '0.9' || img.style.opacity === '0.8' || img.style.opacity === '0.85' || img.style.opacity === '0.3' || (img.style.filter && img.style.filter.includes('grayscale'));
                    if (isUnowned) {
                        origImgSrcs.push({ img: img, src: img.src });
                        if (window.getGrayscaleDataUrl) {
                            img.src = window.getGrayscaleDataUrl(img);
                        }
                    }
                });

                // Expand 1st place character drawer, collapse others during capture
                const charCards = modalContent.querySelectorAll('.char-stat-card');
                const origCharCardStyles = [];
                charCards.forEach((card, idx) => {
                    const details = card.querySelector('.char-stat-details');
                    const chevron = card.querySelector('.char-chevron');
                    origCharCardStyles.push({
                        card: card,
                        details: details,
                        chevron: chevron,
                        display: details ? details.style.display : 'none',
                        transform: chevron ? chevron.style.transform : '',
                        isExpanded: card.classList.contains('expanded')
                    });

                    if (details) {
                        if (isCharAll) {
                            details.style.display = 'flex';
                            card.classList.add('expanded');
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                        } else if (!isPlanAll && !isSourceAll) {
                            if (idx < 3) {
                                details.style.display = 'flex';
                                card.classList.add('expanded');
                                if (chevron) chevron.style.transform = 'rotate(180deg)';
                            } else {
                                details.style.display = 'none';
                                card.classList.remove('expanded');
                                if (chevron) chevron.style.transform = 'rotate(0deg)';
                            }
                        }
                    }
                });

                const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const captureScale = isMobileDevice ? 1.5 : 2;
                let captureDelay = isMobileDevice ? 500 : 350;
                if (isCharAll) {
                    captureDelay = isMobileDevice ? 800 : 500;
                }

                // Set scroll to top and adjust styles for flat render
                const origScrollMaxHeight = scrollArea.style.maxHeight;
                const origScrollFlex = scrollArea.style.flex;
                const origScrollMinHeight = scrollArea.style.minHeight;
                const origScrollOverflow = scrollArea.style.overflowY;
                const origScrollPadding = scrollArea.style.paddingRight;
                const origScrollTop = scrollArea.scrollTop;

                const origModalHeight = modalContent.style.height;
                const origModalMaxHeight = modalContent.style.maxHeight;
                const origModalOverflow = modalContent.style.overflow;
                const origModalWidth = modalContent.style.width;
                const origModalMaxWidth = modalContent.style.maxWidth;
                const origModalMinWidth = modalContent.style.minWidth;
                const origModalFlexShrink = modalContent.style.flexShrink;

                scrollArea.scrollTop = 0;
                scrollArea.offsetHeight;

                scrollArea.style.maxHeight = 'none';
                scrollArea.style.flex = 'none';
                scrollArea.style.minHeight = 'auto';
                scrollArea.style.overflowY = 'visible';
                scrollArea.style.paddingRight = '0';

                modalContent.style.height = 'auto';
                modalContent.style.maxHeight = 'none';
                modalContent.style.overflow = 'visible';
                modalContent.style.width = '740px';
                modalContent.style.maxWidth = '740px';
                modalContent.style.minWidth = '740px';
                modalContent.style.flexShrink = '0';

                // Save window scroll and parent modal styles to prevent cutoff on mobile
                const origScrollX = window.scrollX || window.pageXOffset || 0;
                const origScrollY = window.scrollY || window.pageYOffset || 0;
                const origParentPosition = modal.style.position;
                const origParentAlign = modal.style.alignItems;
                const origParentHeight = modal.style.height;
                const origParentOverflow = modal.style.overflow;

                // Temporarily scroll to top and adjust parent layout so the fixed/centered content is drawn without clipping
                window.scrollTo(0, 0);
                modal.style.position = 'absolute';
                modal.style.alignItems = 'flex-start';
                modal.style.height = 'auto';
                modal.style.overflow = 'visible';

                // Temporarily convert all normal <img> srcs to absolute URLs for html2canvas
                const normalImages = modalContent.querySelectorAll('img');
                const origImgSrcsAbsolute = [];
                normalImages.forEach(img => {
                    const origSrc = img.getAttribute('src');
                    if (origSrc && !origSrc.startsWith('http') && !origSrc.startsWith('data:')) {
                        origImgSrcsAbsolute.push({ img, src: origSrc });
                        img.setAttribute('src', getAbsoluteUrl(origSrc));
                    }
                });

                let origRadarSvgs = [];

                const restoreAfterCapture = () => {
                    // Restore original image sources after capture
                    origImgSrcs.forEach(item => {
                        item.img.src = item.src;
                    });

                    // Restore original normal <img> srcs
                    origImgSrcsAbsolute.forEach(item => {
                        item.img.setAttribute('src', item.src);
                    });

                    // Restore original SVG image hrefs
                    origSvgHrefs.forEach(item => {
                        item.img.setAttribute('href', item.href);
                    });

                    restoreRadarSvgs(origRadarSvgs);

                    // Restore original hidden elements
                    origDisplays.forEach(item => {
                        item.el.style.setProperty('display', item.display, item.displayPriority || '');
                    });

                    // Restore original plan stats details states
                    if (detailsDiv) {
                        detailsDiv.innerHTML = origPlanDetailsHtml;
                        detailsDiv.style.display = origPlanDetailsDisplay;
                        detailsDiv.dataset.activePlan = origPlanDetailsActive;
                    }
                    origPlanColsActive.forEach(item => {
                        if (item.active) {
                            item.col.classList.add('active');
                        } else {
                            item.col.classList.remove('active');
                        }
                    });

                    // Restore original source stats cards states
                    origSourceCardsState.forEach(item => {
                        item.detailsDiv.innerHTML = item.innerHTML;
                        item.detailsDiv.style.display = item.display;
                        if (item.chevron) item.chevron.style.transform = item.transform;
                        if (item.isExpanded) {
                            item.sourceCard.classList.add('expanded');
                        } else {
                            item.sourceCard.classList.remove('expanded');
                        }
                    });

                    // Restore original char-stat-card details states
                    origCharCardStyles.forEach(item => {
                        if (item.details) item.details.style.display = item.display;
                        if (item.chevron) item.chevron.style.transform = item.transform;
                        if (item.isExpanded) {
                            item.card.classList.add('expanded');
                        } else {
                            item.card.classList.remove('expanded');
                        }
                    });

                    // Restore original styles
                    scrollArea.style.maxHeight = origScrollMaxHeight;
                    scrollArea.style.flex = origScrollFlex;
                    scrollArea.style.minHeight = origScrollMinHeight;
                    scrollArea.style.overflowY = origScrollOverflow;
                    scrollArea.style.paddingRight = origScrollPadding;
                    scrollArea.scrollTop = origScrollTop;

                    modalContent.style.height = origModalHeight;
                    modalContent.style.maxHeight = origModalMaxHeight;
                    modalContent.style.overflow = origModalOverflow;
                    modalContent.style.width = origModalWidth;
                    modalContent.style.maxWidth = origModalMaxWidth;
                    modalContent.style.minWidth = origModalMinWidth;
                    modalContent.style.flexShrink = origModalFlexShrink;

                    window.scrollTo(origScrollX, origScrollY);
                    modal.style.position = origParentPosition;
                    modal.style.alignItems = origParentAlign;
                    modal.style.height = origParentHeight;
                    modal.style.overflow = origParentOverflow;

                    const mobileStyles = document.getElementById('idol-possession-mobile-styles');
                    if (mobileStyles) {
                        mobileStyles.disabled = false;
                        mobileStyles.removeAttribute('disabled');
                    }
                    saveBtn.innerHTML = originalText;
                    hideSpinnerOverlay();
                    document.body.classList.remove('is-capturing');
                };

                setTimeout(async () => {
                    try {
                        origRadarSvgs = await rasterizeRadarSvgs();
                        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                        const canvas = await window.html2canvas(modalContent, {
                            backgroundColor: '#ffffff',
                            scale: captureScale,
                            useCORS: true,
                            logging: false,
                            windowWidth: 1024,
                            windowHeight: modalContent.scrollHeight || 2000,
                            scrollX: 0,
                            scrollY: 0,
                            width: 740,
                            height: modalContent.scrollHeight || 2000
                        });

                        let dataUrl = canvas.toDataURL('image/webp', 0.85);
                        let isWebp = dataUrl.startsWith('data:image/webp');
                        let ext = isWebp ? 'webp' : 'png';

                        // Fallback to PNG if webp encoding returns empty (common for huge canvas on some platforms)
                        if (!dataUrl || dataUrl === 'data:' || dataUrl === 'data:,') {
                            dataUrl = canvas.toDataURL('image/png');
                            ext = 'png';
                        }

                        const rand = Math.floor(1000 + Math.random() * 9000);
                        const nameSuffix = isPlanAll ? '_plan_all' : (isSourceAll ? '_source_all' : (isCharAll ? '_char_all' : ''));
                        const link = document.createElement('a');
                        link.download = `gakumasnote_possession_idol${nameSuffix}_${rand}.${ext}`;
                        link.href = dataUrl;
                        link.click();
                        showIdolToast(text.alert_success);
                    } catch (err) {
                        console.error('html2canvas error:', err);
                        alert(text.alert_fail);
                    } finally {
                        restoreAfterCapture();
                    }
                }, captureDelay);
            };

            startCapture();
        });
    };
}
