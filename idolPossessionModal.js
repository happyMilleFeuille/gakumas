// idolPossessionModal.js
import { state } from './state.js';
import { produceList } from './producedata.js';
import { idolColors } from './state.js';
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

const SUB_TYPE_LABELS = {
    ko: {
        goodcondition: '상태 이상',
        concentration: '집중',
        goodimpression: '호인상',
        motivation: '의욕',
        enthusiasm: '강기',
        fullpower: '풀파워'
    },
    ja: {
        goodcondition: '好調',
        concentration: '集中',
        goodimpression: '好印象',
        motivation: 'やる気',
        enthusiasm: '熱意',
        fullpower: 'フルパワー'
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
    const src = c.source || 'normal';
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
        plan_stats: '플랜별',
        source_stats: '분류별',
        char_stats: '아이돌별',
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
        plan_stats: 'プラン別所持率',
        source_stats: '分類別所持率',
        char_stats: 'キャラクター別所持率',
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
        plan_stats: 'By Plan',
        source_stats: 'By Source',
        char_stats: 'By Character',
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
                width: 86px;
                height: 129px;
                border-radius: 0 18px 0 0;
                background: #eee;
                flex-shrink: 0;
            }
            .pssr-stat-icon-box {
                position: absolute;
                inset: 0;
                border-radius: 0 18px 0 0;
                overflow: hidden;
                z-index: 1;
                box-sizing: border-box;
            }
            .pssr-stat-icon-box img {
                position: absolute;
                width: 150%;
                height: auto;
                left: -25%;
                top: -15px;
                display: block;
            }
            .pssr-char-badge {
                position: absolute;
                bottom: -1px;
                left: -1px;
                padding: 0 6px;
                height: 22px;
                border-radius: 0 4px 0 0;
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

            @media (max-width: 768px) {
                body:not(.is-capturing) .idol-possession-content {
                    width: 100% !important;
                    max-width: 95% !important;
                    min-width: 0 !important;
                    padding: 14px 5px 12px 5px !important;
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
                .pssr-stat-icon-wrap {
                    width: 35px !important;
                    height: 52.5px !important;
                    border-radius: 5px !important;
                }
                .pssr-stat-icon-box img {
                    top: -6px !important;
                }
                .pssr-stat-icons-container, .pssr-char-icons-container {
                    gap: 4px !important;
                    padding: 0 2px !important;
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
            if (ownedMap[c.id]) ownedCount++;
        });

        const overallRate = formatRate(ownedCount, totalCount);

        const numRate = parseFloat(overallRate);
        let rankImg = 'r.png';
        if (numRate >= 95) rankImg = 'ssr.png';
        else if (numRate >= 50) rankImg = 'sr.png';
        const rankImgHtml = `<img class="idol-stats-overall-rank-icon" src="icons/${rankImg}" style="height: 38px; object-fit: contain; flex-shrink: 0; vertical-align: middle;">`;

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
            const isOwned = !!ownedMap[c.id];

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
        const R = 66;
        const pSense = statsByPlan.sense.total > 0 ? (statsByPlan.sense.owned / statsByPlan.sense.total) * 100 : 0;
        const pLogic = statsByPlan.logic.total > 0 ? (statsByPlan.logic.owned / statsByPlan.logic.total) * 100 : 0;
        const pAnomaly = statsByPlan.anomaly.total > 0 ? (statsByPlan.anomaly.owned / statsByPlan.anomaly.total) * 100 : 0;

        const rS = R * (pSense / 100);
        const rL = R * (pLogic / 100);
        const rA = R * (pAnomaly / 100);

        // Concentric grid triangles for 25%, 50%, 75%, 100%
        let gridHtml = '';
        [25, 50, 75, 100].forEach(level => {
            const rLvl = R * (level / 100);
            const pt1 = `${cx},${cy - rLvl}`;
            const pt2 = `${cx + 0.866 * rLvl},${cy + 0.5 * rLvl}`;
            const pt3 = `${cx - 0.866 * rLvl},${cy + 0.5 * rLvl}`;
            gridHtml += `<polygon points="${pt1} ${pt2} ${pt3}" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="1" />`;
        });

        const PLAN_COLORS = {
            sense: '#ff4d8d',
            logic: '#46a4f3',
            anomaly: '#ffb300'
        };
        const highestPlanColor = PLAN_COLORS[highestPlan] || '#ff4d8d';
        const radarIconSize = 22;
        const radarIconHalf = radarIconSize / 2;

        const planRadarChartHtml = `
            <svg viewBox="0 0 170 205" width="170" height="205" style="overflow: visible; display: block; margin: auto;">
                <!-- Grid Triangles -->
                ${gridHtml}
                <!-- Axis lines -->
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="${cx}" y1="${cy}" x2="${cx + 0.866 * R}" y2="${cy + 0.5 * R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                <line x1="${cx}" y1="${cy}" x2="${cx - 0.866 * R}" y2="${cy + 0.5 * R}" stroke="rgba(0,0,0,0.08)" stroke-width="1" stroke-dasharray="2,2" />
                
                <!-- Axis Icon Labels -->
                <image href="icons/sense.webp" x="${cx - radarIconHalf}" y="${cy - R - 32}" width="${radarIconSize}" height="${radarIconSize}" />
                <image href="icons/anomaly.webp" x="${cx + 0.866 * R + 2}" y="${cy + 0.5 * R - radarIconHalf}" width="${radarIconSize}" height="${radarIconSize}" />
                <image href="icons/logic.webp" x="${cx - 0.866 * R - radarIconSize - 2}" y="${cy + 0.5 * R - radarIconHalf}" width="${radarIconSize}" height="${radarIconSize}" />
                
                <!-- Axis Percent texts -->
                <text x="${cx}" y="${cy - R - 1}" text-anchor="middle" font-size="9" font-weight="800" fill="#555">${Math.round(pSense)}%</text>
                <text x="${cx + 0.866 * R + 11}" y="${cy + 0.5 * R + 20}" text-anchor="middle" font-size="9" font-weight="800" fill="#555">${Math.round(pAnomaly)}%</text>
                <text x="${cx - 0.866 * R - 11}" y="${cy + 0.5 * R + 20}" text-anchor="middle" font-size="9" font-weight="800" fill="#555">${Math.round(pLogic)}%</text>
                
                <!-- Possession Polygon -->
                <polygon points="${cx},${cy - rS} ${cx + 0.866 * rA},${cy + 0.5 * rA} ${cx - 0.866 * rL},${cy + 0.5 * rL}" 
                         fill="${hexToRgba(highestPlanColor, 0.22)}" 
                         stroke="${highestPlanColor}" 
                         stroke-width="2" 
                         stroke-linejoin="round" />
                <!-- Vertex Dots -->
                <circle class="radar-vertex-dot" cx="${cx}" cy="${cy - rS}" r="3.5" fill="${PLAN_COLORS.sense}" stroke="#fff" stroke-width="1.5" />
                <circle class="radar-vertex-dot" cx="${cx + 0.866 * rA}" cy="${cy + 0.5 * rA}" r="3.5" fill="${PLAN_COLORS.anomaly}" stroke="#fff" stroke-width="1.5" />
                <circle class="radar-vertex-dot" cx="${cx - 0.866 * rL}" cy="${cy + 0.5 * rL}" r="3.5" fill="${PLAN_COLORS.logic}" stroke="#fff" stroke-width="1.5" />
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
            const xIcon = hexCx + (hexR + 10) * Math.cos(angle) - radarIconHalf;
            let yIcon = hexCy + (hexR + 10) * Math.sin(angle) - radarIconHalf;
            if (i === 0) {
                yIcon -= 10; // Move the 12 o'clock icon 10px upwards to avoid overlapping
            }

            // Percent text sits directly below each icon.
            const xText = hexCx + (hexR + 10) * Math.cos(angle);
            let yText = hexCy + (hexR + 10) * Math.sin(angle) + (i === 0 ? 14 : 21);
            if (i === 0) {
                yText -= 4; // Move the 12 o'clock text 4px upwards along with the icon
            }

            subtypeIconsAndTextsHtml += `
                <image href="icons/${key}.webp" x="${xIcon}" y="${yIcon}" width="${radarIconSize}" height="${radarIconSize}" />
                <text x="${xText}" y="${yText}" text-anchor="middle" font-size="9" font-weight="800" fill="#555">${Math.round(pSub[key])}%</text>
            `;
        }

        const subtypeRadarChartHtml = `
            <svg viewBox="0 0 170 205" width="170" height="205" style="overflow: visible; display: block; margin: auto;">
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
                    const dotColor = SUBTYPE_PLAN_COLORS[SUBTYPE_KEYS[i]] || firstPlaceCharColor;
                    return `<circle class="radar-vertex-dot" cx="${x}" cy="${y}" r="3.5" fill="${dotColor}" stroke="#fff" stroke-width="1.5" />`;
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
            // Fallback: default index in CHARACTER_ORDER
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

        // Populate source stats rows html
        let sourceRowsHtml = '';
        const sourceOrder = ['normal', 'limited', 'limited_f', 'limited_u', 'dist', 'another'];
        sourceOrder.forEach(src => {
            const s = statsBySource[src];
            if (s.total === 0) return; // Hide categories with 0 cards
            const rate = formatRate(s.owned, s.total);
            const srcLabel = src === 'another'
                ? (globalTranslations[lang]?.roadmap_show_another || globalTranslations.ko.roadmap_show_another || '어나더')
                : (globalTranslations[lang]?.[`filter_${src}`] || globalTranslations.ko[`filter_${src}`] || text[`filter_${src}`] || src);

            // Determine dominant character for this source (category)
            const ownedSrcCards = activeCards.filter(c => {
                const cardSrc = c.another ? 'another' : (c.source || 'normal');
                return cardSrc === src && !!ownedMap[c.id];
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

            const sourceColor = chosenCharId ? (idolColors[chosenCharId] || '#ff4d8d') : '#cbd5e1';

            sourceRowsHtml += `
                <div class="source-stat-card" data-source="${src}" data-color="${sourceColor}">
                    <div class="source-stat-circle-view">
                        <div style="position: relative; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center;">
                            <svg width="84" height="84" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" stroke-width="3.5"></circle>
                                <circle cx="18" cy="18" r="15.915" fill="none" stroke="${sourceColor}" stroke-width="3.5"
                                        stroke-dasharray="${rate} ${100 - rate}" stroke-dashoffset="25" stroke-linecap="round"></circle>
                            </svg>
                            <div style="position: absolute; font-size: 0.88rem; font-weight: 800; color: #333; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; box-sizing: border-box;">${srcLabel}</div>
                        </div>
                        <div style="font-size: 0.74rem; font-weight: 800; color: #555; text-align: center; white-space: nowrap;">
                            <span style="color: ${sourceColor};">${rate}%</span> <span style="font-size: 0.68rem; color: #777; font-weight: bold; margin-left: 2px;">(${s.owned}/${s.total})</span>
                        </div>
                    </div>
                    <div class="source-stat-main" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: bold; color: #333; gap: 10px; cursor: pointer; user-select: none; padding: 4px 6px; border-radius: 8px; transition: background-color 0.15s ease;">
                        <span class="idol-stats-source-label" style="display: flex; align-items: center; justify-content: center; width: 50px; font-weight: 800; color: #555; text-align: center; flex-shrink: 0; pointer-events: none;">${srcLabel}</span>
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
                    <div class="source-stat-details" style="display: none; background: rgba(250, 249, 250, 0.45); border-top: 1px solid rgba(0, 0, 0, 0.05); padding: 12px 4px; border-radius: 8px; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; margin-top: 4px;">
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
                const crownSize = isMobile ? '8px' : '10px';
                const fontSize = isMobile ? '0.52rem' : '0.62rem';
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

            charCards.forEach(c => {
                const src = c.another ? 'another' : (c.source || 'normal');
                const isOwned = !!ownedMap[c.id];
                if (charSourceStats[src] !== undefined) {
                    charSourceStats[src].total++;
                    if (isOwned) charSourceStats[src].owned++;
                }
            });

            // Generate owned/unowned PSSR icons for this character (separated into normal and another cards)
            const buildCardIconsHtml = (cards) => {
                let html = '';
                cards.forEach(c => {
                    const isOwned = !!ownedMap[c.id];
                    const suffix = c.another ? '1.webp' : '2.webp';
                    const cardName = getLocalizedCardName(c, lang);

                    const containerStyle = isOwned
                        ? `border: 1.5px solid ${charColor};`
                        : `border: 1px solid #ccc;`;

                    const imgStyle = isOwned
                        ? `display: block; opacity: 1;`
                        : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                    html += `
                        <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                            <div class="pssr-stat-icon-box">
                                <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                            </div>

                            <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                            <img class="pssr-plan-badge" src="icons/${c.plan || 'sense'}.webp">
                        </div>
                    `;
                });
                return html;
            };

            const normalCards = charCards.filter(c => !c.another);
            const anotherCards = charCards.filter(c => c.another);

            const normalIconsHtml = buildCardIconsHtml(normalCards);
            const anotherIconsHtml = buildCardIconsHtml(anotherCards);

            let barsHtml = '';
            let xAxisLabelsHtml = '';
            const sourceOrder = ['normal', 'limited', 'limited_f', 'limited_u', 'dist', 'another'];
            const activeSources = includeAnother ? sourceOrder : sourceOrder.filter(s => s !== 'another');
            activeSources.forEach(src => {
                const s = charSourceStats[src];
                const srcLabel = src === 'another'
                    ? (globalTranslations[lang]?.roadmap_show_another || globalTranslations.ko.roadmap_show_another || '어나더')
                    : (globalTranslations[lang]?.[`filter_${src}`] || globalTranslations.ko[`filter_${src}`] || text[`filter_${src}`] || src);
                const srcRate = s.total > 0 ? ((s.owned / s.total) * 100).toFixed(0) : '0';
                const labelText = s.total > 0 ? `${s.owned}/${s.total}` : '';

                barsHtml += `
                    <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; height: 100%; position: relative;">
                        <div style="width: 14px; height: ${srcRate}%; background-color: ${charColor}; border-top-left-radius: 2px; border-top-right-radius: 2px; position: relative;">
                            <div class="idol-stats-bar-val" style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 800; color: ${s.owned > 0 ? '#333' : '#bbb'}; white-space: nowrap; user-select: none;">
                                ${labelText}
                            </div>
                        </div>
                    </div>
                `;

                xAxisLabelsHtml += `
                    <div class="idol-stats-xaxis-label" style="flex: 1; font-size: 0.72rem; font-weight: bold; color: #777; text-align: center;">${srcLabel}</div>
                `;
            });

            let rankBg = 'rgba(255, 255, 255, 0.45)';
            let rankBorder = 'rgba(0, 0, 0, 0.06)';
            if (rankIndex === 0) { rankBg = 'linear-gradient(135deg, rgba(255, 235, 122, 0.17) 0%, rgba(255, 139, 173, 0.15) 35%, rgba(194, 147, 255, 0.15) 70%, rgba(115, 232, 255, 0.15) 100%)'; rankBorder = 'rgba(255, 139, 173, 0.45)'; }
            else if (rankIndex === 1) { rankBg = 'linear-gradient(135deg, rgba(255, 204, 0, 0.13), rgba(255, 204, 0, 0.19))'; rankBorder = 'rgba(255, 204, 0, 0.4)'; }
            else if (rankIndex === 2) { rankBg = 'linear-gradient(135deg, rgba(70, 164, 243, 0.11), rgba(70, 164, 243, 0.15))'; rankBorder = 'rgba(70, 164, 243, 0.35)'; }

            charListHtml += `
                <div class="char-stat-card" data-rank="${rankIndex + 1}" style="display: flex; flex-direction: column; background: ${rankBg}; border: 1px solid ${rankBorder}; border-radius: 12px; overflow: hidden; box-sizing: border-box; transition: none !important; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
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
                            <svg class="char-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block; transition: none !important;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                    <div class="char-stat-details" style="display: none; background: rgba(250, 249, 250, 0.45); border-top: 1px solid rgba(0, 0, 0, 0.05); padding: 12px 10px; flex-direction: column; gap: 6px;">
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
                            ${(normalIconsHtml || anotherIconsHtml) ? `
                            <div class="pssr-char-icons-container">
                                <div class="pssr-stat-icons-row">
                                    ${normalIconsHtml}
                                </div>
                                ${anotherIconsHtml ? `
                                <div style="width: 100%; border-top: 1px dashed rgba(0, 0, 0, 0.12); margin: 6px 0;"></div>
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
        let cardBg = 'linear-gradient(135deg, rgba(255, 235, 122, 0.05) 0%, rgba(255, 139, 173, 0.05) 35%, rgba(194, 147, 255, 0.05) 70%, rgba(115, 232, 255, 0.05) 100%)';
        let cardBorder = '1px solid rgba(255, 139, 173, 0.2)';
        if (numRate < 50) {
            barColor = '#eef8ff';
            cardBg = 'linear-gradient(135deg, rgba(70, 164, 243, 0.04), rgba(70, 164, 243, 0.08))';
            cardBorder = '1px solid rgba(70, 164, 243, 0.15)';
        } else if (numRate < 95) {
            barColor = 'linear-gradient(90deg, #fff44f 0%, #fffde6 25%, #ffcc00 50%)';
            cardBg = 'linear-gradient(135deg, rgba(255, 204, 0, 0.04), rgba(255, 204, 0, 0.08))';
            cardBorder = '1px solid rgba(255, 204, 0, 0.15)';
        }

        scrollArea.innerHTML = `
            <style>
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
                    border-color: ${firstPlaceCharColor} !important;
                    box-shadow: 0 0 0 2.5px ${hexToRgba(firstPlaceCharColor, 0.25)} !important;
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
                    background: rgba(255, 255, 255, 0.45);
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
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
                #plan-stat-details .pssr-stat-icon-wrap {
                    width: 86px !important;
                    height: 129px !important;
                }
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
                .idol-stats-section-title {
                    margin-bottom: -10px !important;
                    padding-left: 8px !important;
                }
                .idol-stats-chart-area-wrapper {
                    width: 100% !important;
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
            </style>
            <style id="idol-possession-mobile-styles">
                @media (max-width: 768px) {
                    body:not(.is-capturing) .radar-vertex-dot {
                        display: none !important;
                    }
                    body:not(.is-capturing) .idol-stats-plan-radars-wrapper {
                        flex-direction: row !important;
                        gap: 6px !important;
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
                    .idol-stats-overall-lbl {
                        font-size: 0.68rem !important;
                        white-space: nowrap !important;
                    }
                    .idol-stats-overall-chk {
                        font-size: 0.58rem !important;
                        margin-left: 2px !important;
                        padding: 1px 3px !important;
                        border-radius: 3px !important;
                    }
                    .idol-stats-overall-chk input {
                        width: 9px !important;
                        height: 9px !important;
                    }
                    .idol-stats-overall-val {
                        font-size: 0.76rem !important;
                        white-space: nowrap !important;
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
                        width: 35px !important;
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
                    #plan-stat-details .pssr-stat-icon-wrap,
                    .pssr-stat-icon-wrap {
                        width: 46px !important;
                        height: 70px !important;
                        border-radius: 0 9px 0 0 !important;
                    }
                    .pssr-stat-icon-box {
                        border-radius: 0 9px 0 0 !important;
                    }
                    .pssr-char-badge {
                        height: 12px !important;
                        padding: 0 4px !important;
                        font-size: 6px !important;
                        font-weight: 700 !important;
                        border: none !important;
                        bottom: -1px !important;
                        left: -1px !important;
                        border-radius: 0 2px 0 0 !important;
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
                    #plan-stat-details {
                        padding: 8px 2px !important;
                    }
                    #plan-stat-details .pssr-stat-icons-container {
                        padding: 0 !important;
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
                        width: 86px !important;
                        height: 129px !important;
                        border-radius: 0 18px 0 0 !important;
                    }
                    body.is-capturing .pssr-stat-icon-box {
                        border-radius: 0 18px 0 0 !important;
                    }
                    body.is-capturing .pssr-stat-icon-box img {
                        top: -15px !important;
                    }
                    body.is-capturing .pssr-char-badge {
                        height: 22px !important;
                        padding: 0 6px !important;
                        font-size: 9px !important;
                        font-weight: bold !important;
                        border-radius: 0 4px 0 0 !important;
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
            <div id="idol-possession-stats-wrapper" style="display: flex; flex-direction: column; gap: 14px;">
                <!-- Overall Stats Card -->
                <div class="possession-section-card" data-is-overall="true" style="background: ${cardBg}; border: ${cardBorder}; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px;">
                    <div class="idol-stats-overall-header" style="display: flex; justify-content: space-between; align-items: center; font-size: 1.05rem; font-weight: 800; color: #333;">
                        <span class="idol-stats-overall-left-wrap" style="display: flex; align-items: center; gap: 6px;">
                            <img class="idol-stats-overall-icon" src="icons/sainou.webp" style="width: 18px; height: 18px; object-fit: contain; flex-shrink: 0;">
                            <span class="idol-stats-overall-lbl">${text.overall_rate}</span>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; background: #fff; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 6px; margin: 0;">
                                    <span>${text.include_another}</span>
                                    <input type="checkbox" id="chk-include-another" ${includeAnother ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                                </label>
                                <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; background: #fff; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 6px; margin: 0;">
                                    <span>${text.include_dist}</span>
                                    <input type="checkbox" id="chk-include-dist" ${includeDist ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                                </label>
                            </div>
                        </span>
                    </div>
                    <div class="possession-overall-bar-container" style="width: 100%; height: 36px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; box-sizing: border-box; position: relative; cursor: pointer;">
                        <!-- 평소에 보이는 그라데이션/단색 바 -->
                        <div class="overall-bar-gradient" style="width: ${overallRate}%; height: 100%; background: ${barColor};"></div>
                        <!-- 호버/클릭 시 보이는 캐릭터별 분할 바 -->
                        <div class="overall-bar-chars" style="width: ${overallRate}%; height: 100%;">
                            ${charSegmentsHtml}
                        </div>
                    </div>
                    <div class="idol-stats-overall-val" style="color: ${firstPlaceCharColor}; font-size: 1.15rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 800; margin-top: 4px;">
                        ${rankImgHtml}
                        <span>${overallRate}% (${ownedCount}/${totalCount})</span>
                    </div>
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
                    ${sourceRowsHtml}
                </div>

                <!-- Row for Character Stats -->
                <div id="pssr-char-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/idolicons/${firstPlaceChar}_c.png" style="width: 22px; height: 22px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.char_stats}</span>
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
        const overallCard = scrollArea.querySelector('.possession-section-card[data-is-overall="true"]');
        if (overallCard) {
            const overallBar = overallCard.querySelector('.possession-overall-bar-container');
            if (overallBar) {
                overallBar.addEventListener('click', () => {
                    overallCard.classList.toggle('show-detail');
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

        const leftOwnedCount = leftTotalCards.filter(c => !!ownedMap[c.id]).length;
        const rightOwnedCount = rightTotalCards.filter(c => !!ownedMap[c.id]).length;

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

                        const ownedCards = sourceCards.filter(c => !!ownedMap[c.id]);
                        const unownedCards = sourceCards.filter(c => !ownedMap[c.id]);

                        const sortFn = (a, b) => {
                            const charA = getCharacterId(a.id);
                            const charB = getCharacterId(b.id);
                            const idxA = CHARACTER_ORDER.indexOf(charA);
                            const idxB = CHARACTER_ORDER.indexOf(charB);
                            if (idxA !== idxB) return idxA - idxB;
                            const dateA = a.releasedAt || '1970-01-01';
                            const dateB = b.releasedAt || '1970-01-01';
                            if (dateA !== dateB) {
                                return dateA.localeCompare(dateB);
                            }
                            return a.id.localeCompare(b.id);
                        };
                        ownedCards.sort(sortFn);
                        unownedCards.sort(sortFn);

                        const buildIconsHtml = (cardsList, isOwnedList) => {
                            let html = '';
                            cardsList.forEach(c => {
                                const suffix = c.another ? '1.webp' : '2.webp';
                                const cardName = getLocalizedCardName(c, lang);
                                const charId = getCharacterId(c.id);
                                const charColor = idolColors[charId] || '#cbd5e1';

                                const containerStyle = isOwnedList
                                    ? `border: 1.5px solid ${charColor};`
                                    : `border: 1px solid #ccc;`;

                                const imgStyle = isOwnedList
                                    ? `display: block; opacity: 1;`
                                    : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                                html += `
                                    <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                                        <div class="pssr-stat-icon-box">
                                            <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                                        </div>
                                        <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                                        <img class="pssr-plan-badge" src="icons/${c.plan || 'sense'}.webp">
                                    </div>
                                `;
                            });
                            return html;
                        };

                        const ownedContainer = detailsDiv.querySelector('.source-stat-owned-container');
                        const unownedContainer = detailsDiv.querySelector('.source-stat-unowned-container');
                        const ownedGroup = detailsDiv.querySelector('.source-stat-owned-group');
                        const unownedGroup = detailsDiv.querySelector('.source-stat-unowned-group');

                        const isJa = lang === 'ja';
                        const isEn = lang === 'en';
                        const ownedLabel = isJa ? '所持' : isEn ? 'Owned' : '소지';
                        const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';

                        const hasOwned = ownedCards.length > 0;
                        const hasUnowned = unownedCards.length > 0;

                        const hexToRgba = (hex, alpha) => {
                            if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };

                        const sourceColor = sourceCard.dataset.color || '#ff4d8d';
                        const ownedBg = hexToRgba(sourceColor, 0.08);
                        const ownedBorder = hexToRgba(sourceColor, 0.12);

                        if (hasOwned) {
                            ownedGroup.style.display = 'flex';
                            ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                            ownedContainer.innerHTML = buildIconsHtml(ownedCards, true);

                            ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: var(--pssr-title-gap); width: 100%; padding: var(--pssr-box-padding); box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: ${hasUnowned ? '8px 8px 0 0' : '8px'};`;
                        } else {
                            ownedGroup.style.display = 'none';
                        }

                        if (hasUnowned) {
                            unownedGroup.style.display = 'flex';
                            unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                            unownedContainer.innerHTML = buildIconsHtml(unownedCards, false);

                            unownedGroup.style.cssText = `display: flex; flex-direction: column; gap: var(--pssr-title-gap); width: 100%; padding: var(--pssr-box-padding); box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: ${hasOwned ? '0 0 8px 8px' : '8px'};`;
                        } else {
                            unownedGroup.style.display = 'none';
                        }
                        detailsDiv.style.gap = (hasOwned && hasUnowned) ? '1px' : '12px';
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
                    const ownedCards = planCards.filter(c => !!ownedMap[c.id]);
                    const unownedCards = planCards.filter(c => !ownedMap[c.id]);

                    const sortFn = (a, b) => {
                        const charA = getCharacterId(a.id);
                        const charB = getCharacterId(b.id);
                        const idxA = CHARACTER_ORDER.indexOf(charA);
                        const idxB = CHARACTER_ORDER.indexOf(charB);
                        if (idxA !== idxB) return idxA - idxB;
                        const dateA = a.releasedAt || '1970-01-01';
                        const dateB = b.releasedAt || '1970-01-01';
                        if (dateA !== dateB) {
                            return dateA.localeCompare(dateB);
                        }
                        return a.id.localeCompare(b.id);
                    };
                    ownedCards.sort(sortFn);
                    unownedCards.sort(sortFn);

                    const buildIconsHtml = (cardsList, isOwnedList) => {
                        let html = '';
                        cardsList.forEach(c => {
                            const suffix = c.another ? '1.webp' : '2.webp';
                            const cardName = getLocalizedCardName(c, lang);
                            const charId = getCharacterId(c.id);
                            const charColor = idolColors[charId] || '#cbd5e1';

                            const containerStyle = isOwnedList
                                ? `border: 1.5px solid ${charColor};`
                                : `border: 1px solid #ccc;`;

                            const imgStyle = isOwnedList
                                ? `display: block; opacity: 1;`
                                : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                            html += `
                                <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                                    <div class="pssr-stat-icon-box">
                                        <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                                    </div>
                                    <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                                    <img class="pssr-plan-badge" src="icons/${c.plan || 'sense'}.webp">
                                </div>
                            `;
                        });
                        return html;
                    };

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

                    const hexToRgba = (hex, alpha) => {
                        if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    };

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

        const charCard = e.target.closest('.char-stat-card');
        if (charCard) {
            const mainRow = e.target.closest('.char-stat-main');
            if (mainRow) {
                const details = charCard.querySelector('.char-stat-details');
                const chevron = charCard.querySelector('.char-chevron');
                if (details) {
                    const isHidden = details.style.display === 'none';
                    details.style.display = isHidden ? 'flex' : 'none';
                    if (isHidden) {
                        charCard.classList.add('expanded');
                    } else {
                        charCard.classList.remove('expanded');
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
            const optCharAllText = isJa ? 'キャラクター別保存' : isEn ? 'Save by Character' : '캐릭터별 저장';

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
                optionsModal.remove();
                onSelect(null);
            };

            const closeOptionsModal = (result) => {
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
                    }
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

                    const sortFn = (a, b) => {
                        const charA = getCharacterId(a.id);
                        const charB = getCharacterId(b.id);
                        const idxA = CHARACTER_ORDER.indexOf(charA);
                        const idxB = CHARACTER_ORDER.indexOf(charB);
                        if (idxA !== idxB) return idxA - idxB;
                        const dateA = a.releasedAt || '1970-01-01';
                        const dateB = b.releasedAt || '1970-01-01';
                        if (dateA !== dateB) return dateA.localeCompare(dateB);
                        return a.id.localeCompare(b.id);
                    };

                    const buildIconsHtml = (cardsList, isOwnedList) => {
                        let html = '';
                        cardsList.forEach(c => {
                            const suffix = c.another ? '1.webp' : '2.webp';
                            const cardName = getLocalizedCardName(c, lang);
                            const charId = getCharacterId(c.id);
                            const charColor = idolColors[charId] || '#cbd5e1';

                            const containerStyle = isOwnedList
                                ? `border: 1.5px solid ${charColor};`
                                : `border: 1px solid #ccc;`;

                            const imgStyle = isOwnedList
                                ? `display: block; opacity: 1;`
                                : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                            html += `
                                <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                                    <div class="pssr-stat-icon-box">
                                        <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                                    </div>
                                    <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                                    <img class="pssr-plan-badge" src="icons/${c.plan || 'sense'}.webp">
                                </div>
                            `;
                        });
                        return html;
                    };

                    const hexToRgba = (hex, alpha) => {
                        if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    };

                    const isJa = lang === 'ja';
                    const isEn = lang === 'en';
                    const ownedLabel = isJa ? '所持' : isEn ? 'Owned' : '소지';
                    const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';

                    let allPlansHtml = '<div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">';

                    const plans = ['sense', 'logic', 'anomaly'];
                    plans.forEach((p, pIdx) => {
                        const planCards = activeCards.filter(c => (c.plan || 'sense') === p);
                        const ownedCards = planCards.filter(c => !!ownedMap[c.id]);
                        const unownedCards = planCards.filter(c => !ownedMap[c.id]);
                        ownedCards.sort(sortFn);
                        unownedCards.sort(sortFn);

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

                            const ownedCards = sourceCards.filter(c => !!ownedMap[c.id]);
                            const unownedCards = sourceCards.filter(c => !ownedMap[c.id]);

                            const sortFn = (a, b) => {
                                const charA = getCharacterId(a.id);
                                const charB = getCharacterId(b.id);
                                const idxA = CHARACTER_ORDER.indexOf(charA);
                                const idxB = CHARACTER_ORDER.indexOf(charB);
                                if (idxA !== idxB) return idxA - idxB;
                                const dateA = a.releasedAt || '1970-01-01';
                                const dateB = b.releasedAt || '1970-01-01';
                                if (dateA !== dateB) return dateA.localeCompare(dateB);
                                return a.id.localeCompare(b.id);
                            };
                            ownedCards.sort(sortFn);
                            unownedCards.sort(sortFn);

                            const buildIconsHtml = (cardsList, isOwnedList) => {
                                let html = '';
                                cardsList.forEach(c => {
                                    const suffix = c.another ? '1.webp' : '2.webp';
                                    const cardName = getLocalizedCardName(c, lang);
                                    const charId = getCharacterId(c.id);
                                    const charColor = idolColors[charId] || '#cbd5e1';

                                    const containerStyle = isOwnedList
                                        ? `border: 1.5px solid ${charColor};`
                                        : `border: 1px solid #ccc;`;

                                    const imgStyle = isOwnedList
                                        ? `display: block; opacity: 1;`
                                        : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                                    html += `
                                        <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                                            <div class="pssr-stat-icon-box">
                                                <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                                            </div>
                                            <span class="pssr-char-badge" style="background-color: ${charColor};">${getBadgeText(c, lang)}</span>
                                        </div>
                                    `;
                                });
                                return html;
                            };

                            const ownedContainer = detailsDiv.querySelector('.source-stat-owned-container');
                            const unownedContainer = detailsDiv.querySelector('.source-stat-unowned-container');
                            const ownedGroup = detailsDiv.querySelector('.source-stat-owned-group');
                            const unownedGroup = detailsDiv.querySelector('.source-stat-unowned-group');

                            const isJa = lang === 'ja';
                            const isEn = lang === 'en';
                            const ownedLabel = isJa ? '所持' : isEn ? 'Owned' : '소지';
                            const unownedLabel = isJa ? '未所持' : isEn ? 'Not Owned' : '미소지';

                            const hexToRgba = (hex, alpha) => {
                                if (!hex || !hex.startsWith('#')) return `rgba(255, 77, 141, ${alpha})`;
                                const r = parseInt(hex.slice(1, 3), 16);
                                const g = parseInt(hex.slice(3, 5), 16);
                                const b = parseInt(hex.slice(5, 7), 16);
                                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                            };

                            const sourceColor = sourceCard.dataset.color || '#ff4d8d';
                            const ownedBg = hexToRgba(sourceColor, 0.08);
                            const ownedBorder = hexToRgba(sourceColor, 0.12);

                            if (ownedCards.length > 0) {
                                ownedGroup.style.display = 'flex';
                                ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                                ownedContainer.innerHTML = buildIconsHtml(ownedCards, true);

                                if (unownedCards.length > 0) {
                                    ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px; box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px 8px 0 0;`;
                                } else {
                                    ownedGroup.style.cssText = `display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px; box-sizing: border-box; background-color: ${ownedBg}; border: 1px solid ${ownedBorder}; border-radius: 8px;`;
                                }
                            } else {
                                ownedGroup.style.display = 'none';
                            }

                            if (unownedCards.length > 0) {
                                unownedGroup.style.display = 'flex';
                                unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                                unownedContainer.innerHTML = buildIconsHtml(unownedCards, false);

                                if (ownedCards.length > 0) {
                                    unownedGroup.style.cssText = `display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px; box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 0 0 8px 8px; margin-top: var(--pssr-group-gap);`;
                                } else {
                                    unownedGroup.style.cssText = `display: flex; flex-direction: column; gap: 8px; width: 100%; padding: 8px; box-sizing: border-box; background-color: rgba(100, 116, 139, 0.09); border: 1px solid rgba(100, 116, 139, 0.12); border-radius: 8px; margin-top: 12px;`;
                                }
                            } else {
                                unownedGroup.style.display = 'none';
                            }

                            detailsDiv.style.display = 'flex';
                            detailsDiv.style.gap = (ownedCards.length > 0 && unownedCards.length > 0) ? 'var(--pssr-group-gap)' : '12px';
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
                            const width = Math.ceil(svg.getBoundingClientRect().width || Number(svg.getAttribute('width')) || 170);
                            const height = Math.ceil(svg.getBoundingClientRect().height || Number(svg.getAttribute('height')) || 205);
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
                const captureDelay = isMobileDevice ? 500 : 350;

                // Set scroll to top and adjust styles for flat render
                const origScrollMaxHeight = scrollArea.style.maxHeight;
                const origScrollFlex = scrollArea.style.flex;
                const origScrollMinHeight = scrollArea.style.minHeight;
                const origScrollOverflow = scrollArea.style.overflowY;
                const origScrollPadding = scrollArea.style.paddingRight;
                const origScrollTop = scrollArea.scrollTop;

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

                let origRadarSvgs = [];

                setTimeout(async () => {
                    origRadarSvgs = await rasterizeRadarSvgs();
                    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

                    window.html2canvas(modalContent, {
                        backgroundColor: '#ffffff',
                        scale: captureScale,
                        useCORS: true,
                        logging: false,
                        windowWidth: 1024,
                        scrollX: 0,
                        scrollY: 0,
                        width: 740
                    }).then(canvas => {
                        const dataUrl = canvas.toDataURL('image/webp', 0.85);
                        const isWebp = dataUrl.startsWith('data:image/webp');
                        const ext = isWebp ? 'webp' : 'png';

                        const rand = Math.floor(1000 + Math.random() * 9000);
                        const nameSuffix = isPlanAll ? '_plan_all' : (isSourceAll ? '_source_all' : (isCharAll ? '_char_all' : ''));
                        const link = document.createElement('a');
                        link.download = `gakumasnote_possession_idol${nameSuffix}_${rand}.${ext}`;
                        link.href = dataUrl;
                        link.click();

                        // Restore original image sources after capture
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
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
                        showIdolToast(text.alert_success);
                    }).catch(err => {
                        console.error('html2canvas error:', err);
                        alert(text.alert_fail);

                        // Restore original image sources after capture failure
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
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
                    });
                }, captureDelay);
            };

            startCapture();
        });
    };
}
