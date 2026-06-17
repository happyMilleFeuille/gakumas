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


const TRANSLATIONS = {
    ko: {
        title_select: '아이돌 선택',
        desc_select: '소지하고 있는 아이돌을 클릭해주세요.',
        title_stats: '아이돌 카드 소지 통계',
        btn_save_image: '이미지 저장',
        overall_rate: '전체 소지율',
        include_another: '어나더 포함',
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
                width: 740px;
                max-width: 90%;
                min-width: min(560px, 90%);
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
                width: 80px;
                height: 80px;
                border-radius: 12px;
                overflow: hidden;
                background: #eee;
                flex-shrink: 0;
            }
            .pssr-stat-icon-wrap img {
                position: absolute;
                width: 150%;
                height: auto;
                left: -25%;
                top: -15px;
                display: block;
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
                .idol-possession-content {
                    width: 100% !important;
                    max-width: 95% !important;
                    min-width: 0 !important;
                    padding: 14px 16px 12px 16px !important;
                    gap: 12px !important;
                    border-radius: 14px !important;
                }
                .idol-possession-title-wrap {
                    font-size: 1.05rem !important;
                    gap: 6px !important;
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
                    width: 32px !important;
                    height: 32px !important;
                    border-radius: 5px !important;
                }
                .pssr-stat-icon-wrap img {
                    top: -6px !important;
                }
                .pssr-stat-icons-container {
                    gap: 4px !important;
                    padding: 0 2px !important;
                }
                #btn-idol-possession-save {
                    height: 24px !important;
                    padding: 0 8px !important;
                    font-size: 0.68rem !important;
                    border-radius: 5px !important;
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
        saveOwnedPssrs(ownedMap);
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
                    saveOwnedPssrs(ownedMap);

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
        showIdolPossessionStats(modal, pssrCards, ownedMap, lang, text, closeModal, renderSelectionView);
    };
}

function showIdolPossessionStats(modal, pssrCards, ownedMap, lang, text, closeModal, onBackToSelection) {
    const modalContent = modal.querySelector('.modal-content');
    const scrollArea = modal.querySelector('#idol-possession-scroll-area');
    const bottomArea = modal.querySelector('#idol-possession-bottom-area');
    const headerArea = modal.querySelector('#idol-possession-header-area');
    let firstPlaceCharColor = '#ff4d8d';

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
    headerArea.innerHTML = `
        <div class="idol-possession-title-wrap">
            <div id="idol-possession-title-indicator" class="idol-possession-title-indicator" style="background-color: #ff4d8d; transition: none !important;"></div>
            <span id="idol-possession-title">${text.title_stats}</span>
        </div>
        <button id="btn-idol-possession-save" class="calc-btn" style="height: 34px; padding: 0 14px; background-color: #ff4d8d; color: #fff; font-weight: bold; font-size: 0.85rem; border: none; border-radius: 8px; cursor: pointer; box-shadow: none; transition: none !important;">
            ${text.btn_save_image}
        </button>
    `;

    // Clear bottom buttons
    bottomArea.innerHTML = '';

    let includeAnother = loadIncludeAnother();

    function updateStatsUI() {
        const activeCards = includeAnother ? pssrCards : pssrCards.filter(c => !c.another);

        // Calculate statistics
        const totalCount = activeCards.length;
        let ownedCount = 0;
        activeCards.forEach(c => {
            if (ownedMap[c.id]) ownedCount++;
        });

        const overallRate = formatRate(ownedCount, totalCount);

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

        const firstPlaceChar = charList[0]?.charId;
        firstPlaceCharColor = (firstPlaceChar && idolColors[firstPlaceChar]) || '#ff4d8d';

        // Update header save button and indicator colors dynamically to match 1st place character color
        const saveBtn = headerArea.querySelector('#btn-idol-possession-save');
        if (saveBtn) {
            saveBtn.style.backgroundColor = firstPlaceCharColor;
            saveBtn.style.boxShadow = 'none';
            saveBtn.style.transition = 'none';
        }
        const titleIndicator = headerArea.querySelector('#idol-possession-title-indicator');
        if (titleIndicator) {
            titleIndicator.style.backgroundColor = firstPlaceCharColor;
            titleIndicator.style.transition = 'none';
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
                <div class="source-stat-card" data-source="${src}">
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

            // Generate owned/unowned PSSR icons for this character
            let charIconsHtml = '';
            charCards.forEach(c => {
                const isOwned = !!ownedMap[c.id];
                const suffix = c.another ? '1.webp' : '2.webp';
                const cardName = getLocalizedCardName(c, lang);

                const containerStyle = isOwned
                    ? `border: 1.5px solid ${charColor};`
                    : `border: 1px solid #ccc;`;

                const imgStyle = isOwned
                    ? `display: block; opacity: 1;`
                    : `display: block; filter: grayscale(90%); -webkit-filter: grayscale(90%); opacity: 0.8;`;

                const onloadAttr = '';

                charIconsHtml += `
                    <div class="pssr-stat-icon-wrap" style="${containerStyle}" title="${cardName}">
                        <img src="idols/thumb/${c.id}${suffix}" ${onloadAttr} onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                    </div>
                `;
            });

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
                        <img src="icons/idolicons/${iconName}_c.png" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid ${charColor}; flex-shrink: 0;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                            <div class="idol-stats-char-name-row" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 800; color: #333;">
                                <span style="display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; white-space: nowrap;">
                                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1;">${charName}</span>
                                    <span class="idol-stats-char-fraction" style="font-size: 0.72rem; font-weight: normal; color: #777; flex-shrink: 0;">(${owned}/${total})</span>
                                </span>
                                <span class="idol-stats-char-pct" style="font-size: 0.75rem; font-weight: 800; color: ${charColor}; flex-shrink: 0;">${Math.round(item.rateNum)}%</span>
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
                            <div class="idol-stats-chart-area-wrapper" style="display: flex; flex-direction: column; gap: 5px; width: 100%; max-width: 556px;">
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
                            ${charIconsHtml ? `
                            <div class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; margin-top: 10px; padding: 0 10px; box-sizing: border-box; width: 100%;">
                                ${charIconsHtml}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        const numRate = parseFloat(overallRate);
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
                .char-stat-card:hover {
                    border-color: #cbd5e1 !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
                }
                .source-stat-card {
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04) !important;
                    padding-top: 6px !important;
                    padding-bottom: 6px !important;
                    margin-bottom: 0 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .source-stat-card:last-child {
                    border-bottom: none !important;
                }
                .source-stat-main:hover {
                    background-color: rgba(0, 0, 0, 0.03) !important;
                }

                .idol-stats-plan-col {
                    padding: 8px 10px !important;
                    border-radius: 8px !important;
                    transition: background-color 0.15s ease, border-color 0.15s ease !important;
                    border: 1px solid transparent !important;
                    cursor: pointer;
                    user-select: none;
                }
                .idol-stats-plan-col:hover {
                    background-color: rgba(0, 0, 0, 0.03) !important;
                    border-color: rgba(0, 0, 0, 0.05) !important;
                }
                .idol-stats-plan-col.active {
                    background-color: rgba(0, 0, 0, 0.06) !important;
                    border-color: rgba(0, 0, 0, 0.1) !important;
                }
                #plan-stat-details .pssr-stat-icon-wrap {
                    width: 86px !important;
                    height: 86px !important;
                }
                .idol-stats-section-title {
                    margin-bottom: -10px !important;
                    padding-left: 8px !important;
                }
                .idol-stats-chart-area-wrapper {
                    width: 100% !important;
                    max-width: 556px !important;
                }
                 @media (max-width: 768px) {
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
                    .pssr-stat-icons-container {
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
                    #plan-stat-details .pssr-stat-icon-wrap {
                        width: 39px !important;
                        height: 39px !important;
                    }
                    #plan-stat-details {
                        padding: 8px 2px !important;
                    }
                    #plan-stat-details .pssr-stat-icons-container {
                        padding: 0 !important;
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
                            <label class="idol-stats-overall-chk" style="font-size: 0.8rem; font-weight: 800; margin-left: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; user-select: none; color: #777; background: #fff; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 6px;">
                                <span>${text.include_another}</span>
                                <input type="checkbox" id="chk-include-another" ${includeAnother ? 'checked' : ''} style="cursor: pointer; accent-color: ${firstPlaceCharColor}; width: 13px; height: 13px; margin: 0;">
                            </label>
                        </span>
                        <span class="idol-stats-overall-val" style="color: ${firstPlaceCharColor}; font-size: 1.15rem;">${overallRate}% (${ownedCount}/${totalCount})</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; box-sizing: border-box;">
                        <div style="width: ${overallRate}%; height: 100%; background: ${barColor};"></div>
                    </div>
                </div>

                <!-- Row for Plan Stats -->
                <div id="pssr-plan-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/${highestPlan}.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.plan_stats}</span>
                </div>
                <div class="possession-section-card idol-stats-plan-card" style="background: transparent; border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px;">
                    <div class="idol-stats-plan-row-container" style="display: flex; gap: 16px; flex-wrap: wrap; width: 100%;">
                        ${planRowsHtml}
                    </div>
                    <div id="plan-stat-details" style="display: none; background: rgba(250, 249, 250, 0.45); border-top: 1px solid rgba(0, 0, 0, 0.05); padding: 12px 4px; border-radius: 8px; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
                        <!-- Owned Cards Group -->
                        <div id="plan-stat-owned-group" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #555; padding-left: 6px; user-select: none;"></div>
                            <div id="plan-stat-owned-container" class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                        <!-- Unowned Cards Group -->
                        <div id="plan-stat-unowned-group" style="display: flex; flex-direction: column; gap: 8px; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                            <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #999; padding-left: 6px; user-select: none;"></div>
                            <div id="plan-stat-unowned-container" class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;"></div>
                        </div>
                    </div>
                </div>

                <div id="pssr-source-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/train.webp" style="width: 15px; height: 15px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.source_stats}</span>
                </div>
                <div class="possession-section-card idol-stats-source-card" style="background: transparent; border: 1px solid #f0f0f0; border-radius: 12px; padding: 10px 18px; display: flex; flex-direction: column; gap: 0;">
                    ${sourceRowsHtml}
                </div>

                <!-- Row for Character Stats -->
                <div id="pssr-char-stats-label" class="idol-stats-section-title" style="font-weight: 800; font-size: 0.95rem; color: #555; margin-bottom: -6px; padding-left: 2px; display: flex; align-items: center; gap: 6px;">
                    <img src="icons/idolicons/${firstPlaceChar}_c.png" style="width: 22px; height: 22px; object-fit: contain; flex-shrink: 0;">
                    <span>${text.char_stats}</span>
                </div>
                <div class="possession-section-card idol-stats-char-card" style="background: transparent; border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;">
                    ${charListHtml}
                </div>
            </div>
        `;

        const checkbox = scrollArea.querySelector('#chk-include-another');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                includeAnother = e.target.checked;
                saveIncludeAnother(includeAnother);
                updateStatsUI();
            });
        }
    }

    // Register click delegator for collapsible details (character cards & plan cards)
    scrollArea.addEventListener('click', (e) => {
        const sourceCard = e.target.closest('.source-stat-card');
        if (sourceCard) {
            const mainRow = e.target.closest('.source-stat-main');
            if (mainRow) {
                const detailsDiv = sourceCard.querySelector('.source-stat-details');
                const chevron = sourceCard.querySelector('.source-chevron');
                if (detailsDiv) {
                    const isHidden = detailsDiv.style.display === 'none';
                    if (isHidden) {
                        const src = sourceCard.dataset.source;
                        const includeAnother = scrollArea.querySelector('#chk-include-another')?.checked || false;
                        const activeCards = includeAnother ? pssrCards : pssrCards.filter(c => !c.another);

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
                                        <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
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

                        if (ownedCards.length > 0) {
                            ownedGroup.style.display = 'flex';
                            ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                            ownedContainer.innerHTML = buildIconsHtml(ownedCards, true);
                        } else {
                            ownedGroup.style.display = 'none';
                        }

                        if (unownedCards.length > 0) {
                            unownedGroup.style.display = 'flex';
                            unownedGroup.style.borderTop = ownedCards.length > 0 ? '1px solid #e2e8f0' : 'none';
                            unownedGroup.style.paddingTop = ownedCards.length > 0 ? '12px' : '0';
                            unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                            unownedContainer.innerHTML = buildIconsHtml(unownedCards, false);
                        } else {
                            unownedGroup.style.display = 'none';
                        }
                    }

                    detailsDiv.style.display = isHidden ? 'flex' : 'none';
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
                    const includeAnother = scrollArea.querySelector('#chk-include-another')?.checked || false;
                    const activeCards = includeAnother ? pssrCards : pssrCards.filter(c => !c.another);

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
                                    <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
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

                    if (ownedCards.length > 0) {
                        ownedGroup.style.display = 'flex';
                        ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                        ownedContainer.innerHTML = buildIconsHtml(ownedCards, true);
                    } else {
                        ownedGroup.style.display = 'none';
                    }

                    if (unownedCards.length > 0) {
                        unownedGroup.style.display = 'flex';
                        unownedGroup.style.borderTop = ownedCards.length > 0 ? '1px solid #e2e8f0' : 'none';
                        unownedGroup.style.paddingTop = ownedCards.length > 0 ? '12px' : '0';
                        unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                        unownedContainer.innerHTML = buildIconsHtml(unownedCards, false);
                    } else {
                        unownedGroup.style.display = 'none';
                    }

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

            const closeBtn = optionsModal.querySelector('#btn-save-opt-close');
            closeBtn.onclick = () => {
                optionsModal.remove();
                onSelect(null);
            };
            optionsModal.querySelector('#btn-save-opt-all').onclick = () => {
                optionsModal.remove();
                onSelect('all');
            };
            optionsModal.querySelector('#btn-save-opt-plan-all').onclick = () => {
                optionsModal.remove();
                onSelect('plan-all');
            };
            optionsModal.querySelector('#btn-save-opt-source-all').onclick = () => {
                optionsModal.remove();
                onSelect('source-all');
            };
            optionsModal.querySelector('#btn-save-opt-char-all').onclick = () => {
                optionsModal.remove();
                onSelect('char-all');
            };
            optionsModal.onclick = (e) => {
                if (e.target === optionsModal) {
                    optionsModal.remove();
                    onSelect(null);
                }
            };
        };

        showSaveOptionsModal((saveType) => {
            if (!saveType) return;

            showSpinnerOverlay();

            saveBtn.innerHTML = `<span style="font-size: 0.8rem; font-weight: normal; display: flex; align-items: center; gap: 4px;">${text.alert_generating}</span>`;
            saveBtn.disabled = true;

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
                        saveBtn.disabled = false;
                        hideSpinnerOverlay();
                    };
                    document.head.appendChild(script);
                }
            };

            const capture = () => {
                // Hide button during screenshot
                saveBtn.style.display = 'none';

                const isPlanAll = saveType === 'plan-all';
                const isSourceAll = saveType === 'source-all';
                const isCharAll = saveType === 'char-all';

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
                    origDisplays.push({ el, display: el.style.display });
                    el.style.display = 'none';
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

                    const activeCards = includeAnother ? pssrCards : pssrCards.filter(c => !c.another);

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
                                    <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
                                </div>
                            `;
                        });
                        return html;
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

                        allPlansHtml += `
                            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; ${borderStyle}">
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                                    <img src="icons/${p}.webp" style="width: 15px; height: 15px; object-fit: contain;">
                                    <span style="font-weight: 800; font-size: 0.85rem; color: ${planColor};">${planTitle}</span>
                                </div>
                        `;

                        if (ownedCards.length > 0) {
                            allPlansHtml += `
                                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                                    <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #555; padding-left: 6px; user-select: none;">${ownedLabel} (${ownedCards.length})</div>
                                    <div class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;">${buildIconsHtml(ownedCards, true)}</div>
                                </div>
                            `;
                        }

                        if (unownedCards.length > 0) {
                            const borderTopStyle = ownedCards.length > 0 ? 'border-top: 1px solid #e2e8f0; padding-top: 12px;' : '';
                            allPlansHtml += `
                                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; ${borderTopStyle}">
                                    <div class="plan-group-title" style="font-size: 0.72rem; font-weight: 800; color: #999; padding-left: 6px; user-select: none;">${unownedLabel} (${unownedCards.length})</div>
                                    <div class="pssr-stat-icons-container" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 0 2px; box-sizing: border-box; width: 100%;">${buildIconsHtml(unownedCards, false)}</div>
                                </div>
                            `;
                        }

                        allPlansHtml += `</div>`;
                    });

                    allPlansHtml += '</div>';
                    detailsDiv.innerHTML = allPlansHtml;
                    detailsDiv.style.display = 'flex';
                    detailsDiv.dataset.activePlan = 'all';
                }

                // Temporarily expand all classification/source cards during capture
                const sourceCardsList = scrollArea.querySelectorAll('.source-stat-card');
                const origSourceCardsState = [];

                if (isSourceAll) {
                    sourceCardsList.forEach(sourceCard => {
                        const detailsDiv = sourceCard.querySelector('.source-stat-details');
                        const chevron = sourceCard.querySelector('.source-chevron');

                        if (detailsDiv) {
                            // Save original state
                            origSourceCardsState.push({
                                detailsDiv,
                                chevron,
                                display: detailsDiv.style.display,
                                innerHTML: detailsDiv.innerHTML,
                                transform: chevron ? chevron.style.transform : ''
                            });

                            // Populate details drawer
                            const src = sourceCard.dataset.source;
                            const includeAnother = scrollArea.querySelector('#chk-include-another')?.checked || false;
                            const activeCards = includeAnother ? pssrCards : pssrCards.filter(c => !c.another);

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
                                            <img src="idols/thumb/${c.id}${suffix}" onerror="this.src='idols/${c.id}${suffix}'; this.onerror=function(){this.src='icons/idol.png'};" style="${imgStyle}">
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

                            if (ownedCards.length > 0) {
                                ownedGroup.style.display = 'flex';
                                ownedGroup.querySelector('.plan-group-title').textContent = `${ownedLabel} (${ownedCards.length})`;
                                ownedContainer.innerHTML = buildIconsHtml(ownedCards, true);
                            } else {
                                ownedGroup.style.display = 'none';
                            }

                            if (unownedCards.length > 0) {
                                unownedGroup.style.display = 'flex';
                                unownedGroup.style.borderTop = ownedCards.length > 0 ? '1px solid #e2e8f0' : 'none';
                                unownedGroup.style.paddingTop = ownedCards.length > 0 ? '12px' : '0';
                                unownedGroup.querySelector('.plan-group-title').textContent = `${unownedLabel} (${unownedCards.length})`;
                                unownedContainer.innerHTML = buildIconsHtml(unownedCards, false);
                            } else {
                                unownedGroup.style.display = 'none';
                            }

                            detailsDiv.style.display = 'flex';
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                        }
                    });
                }

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
                        details: details,
                        chevron: chevron,
                        display: details ? details.style.display : 'none',
                        transform: chevron ? chevron.style.transform : ''
                    });

                    if (details) {
                        if (isCharAll) {
                            details.style.display = 'flex';
                            if (chevron) chevron.style.transform = 'rotate(180deg)';
                        } else if (!isPlanAll && !isSourceAll) {
                            if (idx < 3) {
                                details.style.display = 'flex';
                                if (chevron) chevron.style.transform = 'rotate(180deg)';
                            } else {
                                details.style.display = 'none';
                                if (chevron) chevron.style.transform = 'rotate(0deg)';
                            }
                        }
                    }
                });

                // Set scroll to top and adjust styles for flat render
                const origScrollMaxHeight = scrollArea.style.maxHeight;
                const origScrollFlex = scrollArea.style.flex;
                const origScrollMinHeight = scrollArea.style.minHeight;
                const origScrollOverflow = scrollArea.style.overflowY;
                const origScrollPadding = scrollArea.style.paddingRight;
                const origScrollTop = scrollArea.scrollTop;

                const origModalMaxHeight = modalContent.style.maxHeight;
                const origModalOverflow = modalContent.style.overflow;

                scrollArea.scrollTop = 0;
                scrollArea.offsetHeight;

                scrollArea.style.maxHeight = 'none';
                scrollArea.style.flex = 'none';
                scrollArea.style.minHeight = 'auto';
                scrollArea.style.overflowY = 'visible';
                scrollArea.style.paddingRight = '0';

                modalContent.style.maxHeight = 'none';
                modalContent.style.overflow = 'visible';

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
                        const nameSuffix = isPlanAll ? '_plan_all' : (isSourceAll ? '_source_all' : (isCharAll ? '_char_all' : ''));
                        const link = document.createElement('a');
                        link.download = `gakumasnote_possession_idol${nameSuffix}_${rand}.${ext}`;
                        link.href = dataUrl;
                        link.click();

                        // Restore original image sources after capture
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
                        });

                        // Restore original hidden elements
                        origDisplays.forEach(item => {
                            item.el.style.display = item.display;
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
                        });

                        // Restore original char-stat-card details states
                        origCharCardStyles.forEach(item => {
                            if (item.details) item.details.style.display = item.display;
                            if (item.chevron) item.chevron.style.transform = item.transform;
                        });

                        // Restore original styles
                        saveBtn.style.display = 'block';

                        scrollArea.style.maxHeight = origScrollMaxHeight;
                        scrollArea.style.flex = origScrollFlex;
                        scrollArea.style.minHeight = origScrollMinHeight;
                        scrollArea.style.overflowY = origScrollOverflow;
                        scrollArea.style.paddingRight = origScrollPadding;
                        scrollArea.scrollTop = origScrollTop;

                        modalContent.style.maxHeight = origModalMaxHeight;
                        modalContent.style.overflow = origModalOverflow;

                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                        hideSpinnerOverlay();
                        showIdolToast(text.alert_success);
                    }).catch(err => {
                        console.error('html2canvas error:', err);
                        alert(text.alert_fail);

                        // Restore original image sources after capture failure
                        origImgSrcs.forEach(item => {
                            item.img.src = item.src;
                        });

                        // Restore original hidden elements
                        origDisplays.forEach(item => {
                            item.el.style.display = item.display;
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
                        });

                        // Restore original char-stat-card details states
                        origCharCardStyles.forEach(item => {
                            if (item.details) item.details.style.display = item.display;
                            if (item.chevron) item.chevron.style.transform = item.transform;
                        });

                        // Restore original styles
                        saveBtn.style.display = 'block';

                        scrollArea.style.maxHeight = origScrollMaxHeight;
                        scrollArea.style.flex = origScrollFlex;
                        scrollArea.style.minHeight = origScrollMinHeight;
                        scrollArea.style.overflowY = origScrollOverflow;
                        scrollArea.style.paddingRight = origScrollPadding;
                        scrollArea.scrollTop = origScrollTop;

                        modalContent.style.maxHeight = origModalMaxHeight;
                        modalContent.style.overflow = origModalOverflow;

                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                        hideSpinnerOverlay();
                    });
                }, 350);
            };

            startCapture();
        });
    };
}
