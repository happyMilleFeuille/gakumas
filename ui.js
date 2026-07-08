// ui.js
import { state, setFilter, setSupportLB, setPSSRIndex, setFavoriteIdol, idolColors, toggleDisabledCard, saveToSlot, setSlotData, loadFromSlot, getSlotInfo, getSlotData, deleteSlot, setSortBy, setSortOrder } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { initCalc } from './calc.js';
import { calcStore } from './calcStore.js';
import { renderPSSRRoadmap } from './roadmap.js';
import { showCardModal } from './cardModal.js';
import { pItemDescriptions } from './pItemData.js';
import { initDatePicker, syncDatePickerUI, updateDatePickerDots, syncDateModifiedClass } from './datepicker.js';

const contentArea = document.getElementById('content-area');
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);

export const PRESET_EXPORT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwSafeNbHyCmIU9YHHXX-mdtKukA8fcEHlWkzOegXxOwQTUnoSp4MKa_EMBkQU_PuiE/exec';

// 계산기 화면 복귀 이벤트 리스너
window.addEventListener('renderCalcRequested', () => {
    renderCalc();
});

let homeCachedContent = null;
let lastRenderedLang = null;
window.__videoModalOpen = false;
window.__videoModalHistoryPushed = false;
window.__videoModalPendingClose = false;

// 서포트 카드 이미지 프리로드 (호버/클릭/스크롤 시)
let preloadedSupport = false;

const mainImagePreloadQueue = new Set();
const preloadedMainImages = new Set();
let preloadIntervalId = null;

const isMobileDevice = () => window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

const preloadMainImage = (cardId) => {
    return; // Disabled for all devices to prevent bulk download side effects
};

let supportCardObserver = null;
function initSupportObserver() {
    return; // Disabled for all devices
}

function startBackgroundSequentialPreload() {
    return; // Disabled for all devices
}

export function preloadSupportImages() {
    if (preloadedSupport) return;
    preloadedSupport = true;

    const thumbDir = 'images/support/thumb';
    const mainDir = 'images/support';

    // 0순위: 모달 및 UI에서 공통으로 쓰는 작은 아이콘들 싹 다 미리 메모리에 올리기 (깜빡임 방지)
    const coreUIIcons = [
        'icons/ssr.png', 'icons/sr.png', 'icons/r.png',
        'icons/sense.webp', 'icons/logic.webp', 'icons/anomaly.webp', 'icons/free.webp',
        'icons/flower.webp', 'icons/flowerback.webp',
        'icons/vocal.webp', 'icons/dance.webp', 'icons/visual.webp'
    ];
    coreUIIcons.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // 1순위: 메인 리스트용 썸네일 프리로드 (디스크 캐시에만 저장, RAM 디코딩 방지)
    const fragment = document.createDocumentFragment();
    cardList.forEach(card => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = `${thumbDir}/${card.id}.webp`;
        fragment.appendChild(link);
    });

    // 2순위: 모달용 아이콘 이미지 프리로드 (썸네일 로딩 후 시작하도록 딜레이)
    setTimeout(() => {
        const modalFragment = document.createDocumentFragment();
        cardList.forEach(card => {
            const baseIconPath = `${mainDir}/${card.id}`;
            const isCardType = card.have && card.have.startsWith('card');
            const path1 = isCardType ? `${baseIconPath}_card.webp` : `${baseIconPath}_item.webp`;
            const path2 = isCardType ? `${baseIconPath}_item.webp` : `${baseIconPath}_card.webp`;

            // 모달 열 때 path1/path2를 쓸 수 있도록 경로만 세팅
            card._extraPath = path1; // 일단 path1을 기본으로 세팅

            const link1 = document.createElement('link');
            link1.rel = 'preload';
            link1.as = 'image';
            link1.href = path1;
            modalFragment.appendChild(link1);

            const link2 = document.createElement('link');
            link2.rel = 'preload';
            link2.as = 'image';
            link2.href = path2;
            modalFragment.appendChild(link2);
        });
        document.head.appendChild(modalFragment);
    }, 600);
    
    document.head.appendChild(fragment);

    // 3순위: 화면에 보이는 것 우선 및 나머지는 백그라운드에서 순차적으로 프리로드 시작
    startBackgroundSequentialPreload();
}

// 계산기 화면 이미지 프리로드 (P-아이템 및 공통 아이콘)
let preloadedCalc = false;
export function preloadCalcImages() {
    if (preloadedCalc) return;
    preloadedCalc = true;

    const urls = [];

    // 1. 공통 계산기 UI 아이콘
    const commonIcons = [
        'advice', 'advice_hif', 'audition', 'drink', 'lessondan', 'lessonvi', 'lessonvo',
        'oikomi', 'spclass', 'test', 'test_hif', 'round_hif',
        'class_hajime', 'class_hif0', 'class_hif1', 'class_nia',
        'gift_hajime', 'gift_hif', 'gift_nia',
        'goout_hajime', 'goout_hif', 'goout_nia'
    ];
    commonIcons.forEach(icon => urls.push(`icons/cal/${icon}.webp`));

    // 2. pItemData에서 P아이템 아이콘 수집
    if (pItemDescriptions) {
        Object.keys(pItemDescriptions).forEach(key => {
            const list = pItemDescriptions[key];
            if (!Array.isArray(list)) return;

            const traverse = (obj) => {
                if (obj.icons && Array.isArray(obj.icons)) {
                    obj.icons.forEach(icon => urls.push(`icons/cal/${icon}.webp`));
                }
                if (obj.id) {
                    urls.push(`icons/cal/${obj.id}.webp`);
                }
                if (obj.subOptions && Array.isArray(obj.subOptions)) {
                    obj.subOptions.forEach(sub => traverse(sub));
                }
            };

            list.forEach(item => traverse(item));
        });
    }

    // 중복 제거 및 이미지 객체 생성하여 프리로드
    const uniqueUrls = [...new Set(urls)];
    uniqueUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (useJaNames() && card.name_ja) return card.name_ja;
    return card.name;
};

export function openVideoModal(embedUrl, borderColor = '#ff4d8d', isVertical = false) {
    const videoModal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    if (!videoModal || !iframe) return;

    const modalContent = videoModal.querySelector('.video-modal-content');
    const innerContainer = videoModal.querySelector('.video-container');
    const localVideo = document.getElementById('video-local-player');

    if (modalContent) {
        modalContent.style.borderColor = borderColor;
        if (isVertical) {
            modalContent.classList.add('vertical-video-modal');
        } else {
            modalContent.classList.remove('vertical-video-modal');
        }
    }
    if (innerContainer) innerContainer.style.borderColor = borderColor;

    const isLocalMp4 = embedUrl.split('#')[0].split('?')[0].endsWith('.mp4');

    if (isLocalMp4) {
        if (iframe) iframe.classList.add('hidden');
        if (localVideo) {
            localVideo.src = embedUrl;
            localVideo.volume = (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent)) ? 0.5 : 1.0;
            localVideo.classList.remove('hidden');
        }
    } else {
        if (localVideo) {
            localVideo.classList.add('hidden');
            localVideo.pause();
        }
        if (iframe) {
            iframe.src = embedUrl;
            iframe.classList.remove('hidden');
        }
    }

    videoModal.classList.remove('hidden');
    videoModal.style.display = 'flex';
    document.body.classList.add('video-modal-open');

    window.__videoModalOpen = true;

    const handleClose = () => closeVideoModal();
    const closeBtn = document.getElementById('close-video-modal');
    if (closeBtn) closeBtn.onclick = handleClose;
    videoModal.onclick = (e) => {
        if (e.target === videoModal) handleClose();
    };

    if (!window.__videoModalHistoryPushed) {
        history.pushState({ modalOpen: 'video' }, "");
        window.__videoModalHistoryPushed = true;
    }
}

export function closeVideoModal(isPopState = false) {
    const videoModal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    const isVisible = !!(videoModal && (videoModal.style.display === 'flex' || !videoModal.classList.contains('hidden')));

    if (!isVisible && !window.__videoModalOpen && !window.__videoModalPendingClose) {
        window.__videoModalHistoryPushed = false;
        return;
    }

    if (!isPopState && window.__videoModalHistoryPushed) {
        window.__videoModalPendingClose = true;
        history.back();
        return;
    }

    const localVideo = document.getElementById('video-local-player');
    if (localVideo) {
        localVideo.pause();
        localVideo.src = '';
    }
    if (iframe) iframe.src = '';
    if (videoModal) {
        const resetModal = videoModal.cloneNode(true);
        resetModal.classList.add('hidden');
        resetModal.style.display = 'none';
        resetModal.onclick = null;
        videoModal.replaceWith(resetModal);
    }
    document.body.classList.remove('video-modal-open');
    window.__videoModalOpen = false;
    window.__videoModalPendingClose = false;

    if (isPopState) {
        window.__videoModalHistoryPushed = false;
        return;
    }
}

window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;
window.hideVideoModal = closeVideoModal;

async function fetchLatestCommitDate() {
    const cachedDate = sessionStorage.getItem('latestCommitDate');
    if (cachedDate) {
        applyLastUpdateText(cachedDate);
        return;
    }
    try {
        const res = await fetch('https://api.github.com/repos/happyMilleFeuille/gakumas/commits/master');
        if (res.ok) {
            const data = await res.json();
            const rawDate = data?.commit?.committer?.date || data?.commit?.author?.date;
            if (rawDate) {
                const formattedDate = rawDate.split('T')[0];
                sessionStorage.setItem('latestCommitDate', formattedDate);
                applyLastUpdateText(formattedDate);
            }
        }
    } catch (e) {
        // API error fallback
    }
}

function applyLastUpdateText(dateStr) {
    const targetDate = dateStr || sessionStorage.getItem('latestCommitDate');
    if (!targetDate) return;
    document.querySelectorAll('.last-update').forEach(el => {
        el.textContent = `・Last Updated: ${targetDate}`;
    });
}

export function renderHome() {
    if (!contentArea) return;

    const isFirstVisit = !homeCachedContent;

    // 언어가 바뀌었거나 캐시가 없으면 새로 렌더링
    if (!homeCachedContent || lastRenderedLang !== state.currentLang) {
        const tpl = document.getElementById('tpl-home');
        contentArea.innerHTML = '';
        contentArea.appendChild(tpl.content.cloneNode(true));
        updatePageTranslations(contentArea);

        // 로드맵 렌더링 (자동 스크롤 제거)
        renderPSSRRoadmap(false);

        fetchLatestCommitDate();

        homeCachedContent = contentArea.innerHTML;
        lastRenderedLang = state.currentLang;
        return;
    }

    // 캐시가 있어도 로드맵 영역은 비우고 다시 그려서 새로운 높이/JS 반영
    contentArea.innerHTML = homeCachedContent;
    updatePageTranslations(contentArea); // 추가: 캐시된 내용에도 최신 번역 적용

    applyLastUpdateText();
    fetchLatestCommitDate();

    const listContainer = document.getElementById('pssr-roadmap-list');
    if (listContainer) listContainer.innerHTML = '';
    renderPSSRRoadmap(false);
}

export function renderCalc(mode) {
    if (!contentArea) return;
    preloadCalcImages();
    const tpl = document.getElementById('tpl-calc');
    contentArea.innerHTML = '';
    contentArea.appendChild(tpl.content.cloneNode(true));
    updatePageTranslations();
    initCalc(mode);
}



function openSlotModal() {
    let modal = document.getElementById('slot-modal');
    if (modal) modal.remove();
    const existingShareModal = document.getElementById('slot-share-modal');
    if (existingShareModal) existingShareModal.remove();

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'slot-modal';

    const updateCopyButton = (rootEl, slotId, visible, code = '') => {
        const copyBtn = rootEl?.querySelector(`[data-copy-slot="${slotId}"]`);
        if (!copyBtn) return;
        copyBtn.dataset.code = code;
        copyBtn.textContent = t('ui_slot_copy');
        copyBtn.style.display = visible ? 'inline-block' : 'none';
    };

    const updateExportResult = (rootEl, slotId, message, color = '#666') => {
        const resultEl = rootEl?.querySelector(`[data-export-result="${slotId}"]`);
        if (!resultEl) return;

        const isMobile = window.innerWidth <= 768;
        const resultPadding = isMobile ? '3px 6px' : '4px 8px';
        const resultFontSize = isMobile ? '0.65rem' : '0.72rem';

        if (message) {
            resultEl.textContent = message;
            resultEl.style.display = 'inline-block';
            resultEl.style.flex = '1';
            resultEl.style.boxSizing = 'border-box';
            resultEl.style.textAlign = 'center';
            resultEl.style.padding = resultPadding;
            resultEl.style.borderRadius = '5px';
            resultEl.style.fontSize = resultFontSize;
            resultEl.style.fontWeight = 'bold';
            resultEl.style.userSelect = 'text';
            resultEl.style.background = '#fafafa';
            resultEl.style.border = '1px solid #e0e0e0';
            resultEl.style.color = '#333';
        } else {
            const slotInfo = getSlotInfo(slotId);
            const unissuedText = slotInfo ? (state.currentLang === 'ko' ? '오른쪽의 공유버튼을 누르면 코드가 발급됩니다.' : (state.currentLang === 'ja' ? '右側のボタンを押すとコードが発行されます' : 'Press the button on the right to issue')) : '';
            resultEl.textContent = unissuedText;
            resultEl.style.display = 'inline-block';
            resultEl.style.flex = '1';
            resultEl.style.boxSizing = 'border-box';
            resultEl.style.textAlign = 'center';
            resultEl.style.padding = resultPadding;
            resultEl.style.borderRadius = '5px';
            resultEl.style.fontSize = resultFontSize;
            resultEl.style.fontWeight = 'bold';
            resultEl.style.color = '#888';
            resultEl.style.background = '#fafafa';
            resultEl.style.border = '1px dashed #dcdcdc';
            resultEl.style.userSelect = 'none';
        }
    };

    const updateImportResult = (rootEl, slotId, message, color = '#666') => {
        const resultEl = rootEl?.querySelector(`[data-import-result="${slotId}"]`);
        if (!resultEl) return;
        resultEl.textContent = message || '';
        resultEl.style.color = color;
    };

    const lockExportButton = (rootEl, slotId) => {
        const exportBtn = rootEl?.querySelector(`[data-export-btn="${slotId}"]`);
        if (!exportBtn) return;
        exportBtn.disabled = true;
        exportBtn.dataset.locked = 'true';
        exportBtn.style.cursor = 'default';
        exportBtn.style.opacity = '0.55';
        exportBtn.style.pointerEvents = 'none';
        exportBtn.style.transform = 'none';
        exportBtn.blur();
    };

    const applyImportedPreset = (slotId, preset) => {
        setSlotData(slotId, preset);
        loadFromSlot(slotId);
        ['sense', 'logic', 'anomaly'].forEach(plan => {
            if (calcStore.planCards[plan]) {
                calcStore.planCards[plan] = calcStore.planCards[plan].map(id =>
                    (id && state.disabledCards[id]) ? null : id
                );
            }
        });
        calcStore.save();
        renderSupport();
    };

    const setModalProcessing = (rootEl, isProcessing, slotId) => {
        if (!rootEl) return;
        rootEl.dataset.processing = isProcessing ? 'true' : 'false';
        const inputEl = rootEl.querySelector(`[data-import-input="${slotId}"]`);
        if (inputEl) {
            inputEl.disabled = isProcessing;
            inputEl.style.opacity = isProcessing ? '0.7' : '1';
        }
        const importBtn = rootEl.querySelector(`[data-import-btn="${slotId}"]`);
        if (importBtn) {
            importBtn.disabled = isProcessing;
            importBtn.style.cursor = isProcessing ? 'default' : 'pointer';
            importBtn.style.opacity = isProcessing ? '0.7' : '1';
        }
        const exportBtn = rootEl.querySelector(`[data-export-btn="${slotId}"]`);
        if (exportBtn) {
            const isLocked = exportBtn.dataset.locked === 'true';
            if (isProcessing) {
                exportBtn.disabled = true;
                exportBtn.style.cursor = 'default';
                exportBtn.style.opacity = '0.55';
            } else {
                exportBtn.disabled = isLocked;
                exportBtn.style.cursor = isLocked ? 'default' : 'pointer';
                exportBtn.style.opacity = isLocked ? '0.55' : '1';
            }
        }
    };

    const exportSlotPreset = async (slotId, rootEl) => {
        if (rootEl?.dataset.processing === 'true') return;
        const exportBtn = rootEl?.querySelector(`[data-export-btn="${slotId}"]`);
        if (exportBtn?.dataset.locked === 'true') return;

        if (!PRESET_EXPORT_ENDPOINT) {
            updateExportResult(rootEl, slotId, t('ui_slot_export_missing_config'), '#ef5350');
            updateCopyButton(rootEl, slotId, false);
            return;
        }

        const saved = getSlotData(slotId);
        if (!saved) {
            updateExportResult(rootEl, slotId, t('ui_slot_export_empty'), '#ef5350');
            updateCopyButton(rootEl, slotId, false);
            return;
        }

        setModalProcessing(rootEl, true, slotId);
        lockExportButton(rootEl, slotId);
        updateExportResult(rootEl, slotId, t('ui_slot_exporting'), '#1976d2');
        updateCopyButton(rootEl, slotId, false);

        try {
            const response = await fetch(PRESET_EXPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    type: 'support',
                    slotId: Number(slotId),
                    lang: state.currentLang,
                    exportedAt: new Date().toISOString(),
                    preset: saved
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
            }

            if (!result?.ok || !result?.code) {
                throw new Error(result?.error || 'Invalid export response');
            }

            updateExportResult(rootEl, slotId, t('ui_slot_export_success', { code: result.code }), '#2e7d32');
            updateCopyButton(rootEl, slotId, true, result.code);
        } catch (error) {
            console.warn('Preset export failed:', error);
            const detail = error?.message ? ` ${error.message}` : '';
            updateExportResult(rootEl, slotId, `${t('ui_slot_export_failed')}${detail}`, '#ef5350');
            updateCopyButton(rootEl, slotId, false);
        } finally {
            setModalProcessing(rootEl, false, slotId);
        }
    };

    const copyExportCode = async (slotId, rootEl) => {
        const copyBtn = rootEl?.querySelector(`[data-copy-slot="${slotId}"]`);
        const code = copyBtn?.dataset.code || '';
        if (!copyBtn || !code) return;

        let copied = false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
                copied = true;
            }
        } catch {
        }

        if (!copied) {
            const tempInput = document.createElement('input');
            tempInput.value = code;
            tempInput.setAttribute('readonly', '');
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, code.length);
            copied = document.execCommand('copy');
            tempInput.remove();
        }

        copyBtn.textContent = copied ? t('ui_slot_copied') : t('ui_slot_copy_failed');
        window.setTimeout(() => {
            if (document.body.contains(copyBtn)) {
                copyBtn.textContent = t('ui_slot_copy');
            }
        }, 1500);
    };

    const importSlotPreset = async (slotId, rootEl) => {
        if (rootEl?.dataset.processing === 'true') return;
        const inputEl = rootEl?.querySelector(`[data-import-input="${slotId}"]`);
        const importBtn = rootEl?.querySelector(`[data-import-btn="${slotId}"]`);
        const rawCode = inputEl?.value || '';

        const alphaNumOnly = rawCode.replace(/[^A-Za-z0-9]/g, '');
        if (alphaNumOnly.length !== 6) {
            let errMsg = '';
            if (state.currentLang === 'ko') {
                errMsg = '올바른 코드 길이가 아닙니다. (6자리)';
            } else if (state.currentLang === 'ja') {
                errMsg = 'コードの長さが正しくありません。(6桁)';
            } else {
                errMsg = 'Invalid code length. (6 characters)';
            }
            updateImportResult(rootEl, slotId, errMsg, '#ef5350');
            inputEl?.focus();
            return;
        }

        let cleanInput = rawCode.trim().toUpperCase();
        if (cleanInput.startsWith('C-')) {
            cleanInput = cleanInput.substring(2);
        }
        const code = cleanInput.replace(/[^A-Z0-9]/g, '').trim();

        if (!PRESET_EXPORT_ENDPOINT) {
            updateImportResult(rootEl, slotId, t('ui_slot_export_missing_config'), '#ef5350');
            return;
        }

        if (inputEl) inputEl.value = code;
        setModalProcessing(rootEl, true, slotId);
        updateImportResult(rootEl, slotId, t('ui_slot_importing'), '#1976d2');

        try {
            const response = await fetch(PRESET_EXPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'import',
                    type: 'support',
                    code
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
            }

            if (!result?.ok || !result?.preset) {
                throw new Error(result?.error || 'Invalid import response');
            }

            // Validate that the imported preset is a support card preset
            if (result.preset.calcState) {
                throw new Error(state.currentLang === 'ko' ? '올바른 서포트 카드 프리셋이 아닙니다. (계산기 프리셋 코드로 보입니다)' : state.currentLang === 'ja' ? '正しいサポートカードプリセットではありません。(計算機プリセットコードのようです)' : 'Not a valid support card preset. (Appears to be a calculator preset code)');
            }

            applyImportedPreset(slotId, result.preset);
            modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            updateImportResult(rootEl, slotId, t('ui_slot_import_success'), '#2e7d32');
        } catch (error) {
            console.warn('Preset import failed:', error);
            const detail = error?.message ? ` ${error.message}` : '';
            updateImportResult(rootEl, slotId, `${t('ui_slot_import_failed')}${detail}`, '#ef5350');
        } finally {
            setModalProcessing(rootEl, false, slotId);
        }
    };

    const openShareModal = (slotId) => {
        let shareModal = document.getElementById('slot-share-modal');
        if (shareModal) shareModal.remove();

        const slotInfo = getSlotInfo(slotId);
        const slotData = getSlotData(slotId);
        const displayName = slotData && slotData.customName ? `Slot ${slotId} - ${slotData.customName}` : `Slot ${slotId}`;
        const themeColor = '#ff4d8d';
        const headerTitle = t('ui_slot_share_title');

        shareModal = document.createElement('div');
        shareModal.className = 'modal';
        shareModal.id = 'slot-share-modal';

        const isMobile = window.innerWidth <= 768;
        const modalPadding = isMobile ? '12px 14px 10px' : '18px 18px 16px';
        const modalGap = isMobile ? '8px' : '10px';
        const titleFontSize = isMobile ? '0.85rem' : '1rem';
        const titleBarHeight = isMobile ? '12px' : '16px';
        const containerPadding = isMobile ? '10px' : '12px';
        const nameFontSize = isMobile ? '0.78rem' : '0.85rem';
        const nameMarginBottom = isMobile ? '6px' : '8px';
        const exportMarginBottom = isMobile ? '8px' : '12px';
        const resultFontSize = isMobile ? '0.65rem' : '0.72rem';
        const resultPadding = isMobile ? '3px 6px' : '4px 8px';
        const actionBtnWidth = isMobile ? '28px' : '32px';
        const actionBtnHeight = isMobile ? '28px' : '32px';
        const exportBtnHeight = isMobile ? '26px' : '30px';
        const dividerMargin = isMobile ? '8px 0 8px' : '10px 0 12px';
        const inputHeight = isMobile ? '28px' : '32px';
        const inputFontSize = isMobile ? '0.75rem' : '0.8rem';
        const importResultMarginTop = isMobile ? '5px' : '7px';
        const importResultFontSize = isMobile ? '0.65rem' : '0.7rem';

        shareModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; padding: ${modalPadding}; display: flex; flex-direction: column; gap: ${modalGap};">
                <div style="font-size: ${titleFontSize}; font-weight: 800; color: #333; display: flex; align-items: center; gap: 8px; user-select: none; margin-bottom: 2px;">
                    <div style="width: 4px; height: ${titleBarHeight}; background-color: ${themeColor}; border-radius: 2px;"></div>
                    <span>${headerTitle}</span>
                </div>
                <div style="padding: ${containerPadding}; background: #f9f9f9; border: 1px solid #eee; border-radius: 10px;">
                    <div style="font-size: ${nameFontSize}; font-weight: bold; color: #333; margin-bottom: ${nameMarginBottom}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: none;">
                        ${displayName}
                    </div>
                    <div style="display:${slotInfo ? 'flex' : 'none'}; align-items:center; gap: 8px; margin-bottom: ${exportMarginBottom};">
                        <div style="display:flex; align-items:center; gap: 6px; min-width: 0; flex: 1;">
                            <span data-export-result="${slotId}" style="font-size: ${resultFontSize}; color: #888; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; flex: 1; box-sizing: border-box; text-align: center; padding: ${resultPadding}; background: #fafafa; border: 1px dashed #dcdcdc; border-radius: 5px; font-weight: bold; user-select: none;">${slotInfo ? (state.currentLang === 'ko' ? '오른쪽의 버튼을 누르면 코드가 발급됩니다.' : (state.currentLang === 'ja' ? '右側のボタンを押すとコードが発行されます' : 'Press the button on the right to issue')) : ''}</span>
                            <button class="slot-btn copy-code ${state.currentLang === 'ja' ? 'lang-ja' : ''}" data-copy-slot="${slotId}" data-code="" style="display: none; width: auto; min-width: 0; flex: 0 0 auto; padding: 0; margin: 0; font-size: 0.62rem; background: transparent; color: #5e35b1; border: none; border-radius: 0; cursor: pointer; font-weight: bold; line-height: 1.1; letter-spacing: -0.01em; white-space: nowrap; vertical-align: baseline;">${t('ui_slot_copy')}</button>
                        </div>
                        <button class="slot-btn export" data-slot="${slotId}" data-export-btn="${slotId}" style="width: ${actionBtnWidth}; height: ${exportBtnHeight}; flex: none; padding: 0; background: #fff3e0; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/upload-cloud.svg" alt="${t('ui_slot_export')}" style="width: 16px; height: 16px; filter: invert(48%) sepia(90%) saturate(1250%) hue-rotate(3deg) brightness(101%) contrast(101%);">
                        </button>
                    </div>
                    ${slotInfo ? `<div style="height: 1px; background: #ececec; margin: ${dividerMargin};"></div>` : ''}
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" data-import-input="${slotId}" value="" maxlength="10" placeholder="${t('ui_slot_import_placeholder')}" style="flex: 1; min-width: 0; height: ${inputHeight}; padding: 0 9px; border: 1px solid #ddd; border-radius: 6px; font-size: ${inputFontSize}; outline: none;">
                        <button class="slot-btn import" data-import-btn="${slotId}" style="width: ${actionBtnWidth}; height: ${actionBtnHeight}; flex: none; padding: 0; background: #e8f5e9; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/download-cloud.svg" alt="${t('ui_slot_import')}" style="width: 16px; height: 16px; filter: invert(41%) sepia(12%) saturate(2641%) hue-rotate(81deg) brightness(94%) contrast(87%);">
                        </button>
                    </div>
                    <div data-import-result="${slotId}" style="font-size: ${importResultFontSize}; color: #999; margin-top: ${importResultMarginTop};"></div>
                </div>
            </div>`;

        document.body.appendChild(shareModal);
        shareModal.style.display = 'flex';

        const closeShareModal = () => {
            shareModal.remove();
        };

        let mousedownTarget = null;
        shareModal.addEventListener('mousedown', (e) => {
            mousedownTarget = e.target;
        });
        shareModal.addEventListener('mouseup', (e) => {
            if (e.target === shareModal && mousedownTarget === shareModal) {
                if (shareModal.dataset.processing === 'true') return;
                closeShareModal();
            }
        });

        shareModal.addEventListener('click', (e) => {
            if (shareModal.dataset.processing === 'true') return;
            const exportBtn = e.target.closest('.export');
            const copyBtn = e.target.closest('.copy-code');
            const importBtn = e.target.closest('.import');

            if (exportBtn) {
                exportSlotPreset(exportBtn.dataset.slot, shareModal);
            }

            if (copyBtn) {
                copyExportCode(copyBtn.dataset.copySlot, shareModal);
            }

            if (importBtn) {
                importSlotPreset(slotId, shareModal);
            }
        });

        const importInput = shareModal.querySelector(`[data-import-input="${slotId}"]`);
        importInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (shareModal.dataset.processing === 'true') return;
                importSlotPreset(slotId, shareModal);
            }
        });
    };

    const isMobile = window.innerWidth <= 768;
    const btnWidth = isMobile ? '28px' : '32px';
    const btnHeight = isMobile ? '24px' : '28px';
    const btnIconSize = isMobile ? '13px' : '16px';
    const btnRadius = isMobile ? '5px' : '6px';
    const actionGap = isMobile ? '4px' : '6px';

    const renderSlots = () => {
        let slotsHtml = '';
        for (let i = 1; i <= 5; i++) {
            const data = getSlotData(i);
            const timeInfo = data ? data.timestamp : null;
            const customName = data && data.customName ? data.customName : `Slot ${i}`;

            slotsHtml += `
                <div class="slot-modal-item" style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9f9f9; border-radius: 10px; border: 1px solid #eee; margin-bottom: 10px;">
                    <button class="slot-btn delete" data-slot="${i}" ${!timeInfo ? 'style="display:none;"' : ''} style="position: absolute; top: 7px; right: 9px; background: transparent; color: #b0b0b0; border: none; width: auto; height: auto; padding: 0; border-radius: 0; display: block; font-size: 0.95rem; line-height: 1; cursor: pointer;">&times;</button>
                    <div class="slot-modal-info" style="display: flex; flex-direction: column; gap: 4px; text-align: left; flex: 1; min-width: 0;">
                        <span class="slot-modal-name" style="font-weight: bold; font-size: 1rem; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px;">${customName}</span>
                        <span class="slot-modal-date" style="font-size: 0.75rem; color: #888;">${timeInfo || t('ui_slot_empty')}</span>
                    </div>
                    <div class="slot-modal-actions" style="display: flex; align-items: center; gap: ${actionGap}; padding-top: 10px; padding-right: 2px;">
                        <button class="slot-btn save" data-slot="${i}" style="width: ${btnWidth}; height: ${btnHeight}; flex: none; padding: 0; background: #ffe4ef; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/save.svg" alt="${t('ui_slot_save')}" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(84%) saturate(884%) hue-rotate(305deg) brightness(88%) contrast(92%);">
                        </button>
                        <button class="slot-btn load" data-slot="${i}" ${!timeInfo ? 'style="display:none;"' : ''} style="width: ${btnWidth}; height: ${btnHeight}; flex: none; padding: 0; background: #e3f2fd; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/upload.svg" alt="${t('ui_slot_load')}" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(94%) saturate(1478%) hue-rotate(189deg) brightness(91%) contrast(92%);">
                        </button>
                        <button class="slot-btn share" data-slot="${i}" style="width: ${btnWidth}; height: ${btnHeight}; flex: none; padding: 0; background: #fff1cc; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/cloud.svg" alt="${t('ui_slot_share')}" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(47%) sepia(97%) saturate(452%) hue-rotate(5deg) brightness(91%) contrast(105%);">
                        </button>
                    </div>
                </div>`;
        }
        return slotsHtml;
    };

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 350px; padding: ${isMobile ? '15px' : '20px'};">
            <div class="slot-modal-list">
                ${renderSlots()}
            </div>
        </div>`;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
    history.pushState({ modalOpen: 'slot' }, "");

    const closeSlotModal = () => {
        const shareModal = document.getElementById('slot-share-modal');
        if (shareModal) shareModal.remove();
        history.back();
    };

    modal.onclick = (e) => { if (e.target === modal) closeSlotModal(); };

    modal.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.share');
        const saveBtn = e.target.closest('.save');
        const loadBtn = e.target.closest('.load');
        const deleteBtn = e.target.closest('.delete');

        if (shareBtn) {
            openShareModal(shareBtn.dataset.slot);
        }

        if (saveBtn) {
            const slotId = saveBtn.dataset.slot;
            showSupportSavePresetModal(slotId, modal, renderSlots);
        }

        if (loadBtn) {
            const slotId = loadBtn.dataset.slot;
            const slotInfo = getSlotInfo(slotId);
            const confirmName = (slotInfo && slotInfo.name) ? slotInfo.name : slotId;
            showCustomConfirm(t('ui_slot_load_confirm', { slotId: confirmName }), () => {
                if (loadFromSlot(slotId)) {
                    ['sense', 'logic', 'anomaly'].forEach(plan => {
                        if (calcStore.planCards[plan]) {
                            calcStore.planCards[plan] = calcStore.planCards[plan].map(id =>
                                (id && state.disabledCards[id]) ? null : id
                            );
                        }
                    });
                    calcStore.save();
                    renderSupport();
                    modal.remove();
                }
            });
        }

        if (deleteBtn) {
            const slotId = deleteBtn.dataset.slot;
            showCustomConfirm(t('ui_slot_delete_confirm', { slotId }), () => {
                deleteSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            });
        }
    });
}

function showSupportSavePresetModal(slotId, container, renderSlotsFn) {
    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const themeColor = '#ff4d8d';

    let existingName = '';
    try {
        const data = getSlotData(slotId);
        if (data && data.customName) {
            existingName = data.customName;
        }
    } catch (e) { }

    const defaultPresetName = existingName || `Slot ${slotId}`;

    const backdrop = document.createElement('div');
    backdrop.id = 'support-preset-save-modal';
    backdrop.className = 'modal';
    backdrop.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 30000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white; border-radius: 14px; width: 90%; max-width: 320px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15); padding: 20px; box-sizing: border-box;
        border: 2px solid ${themeColor}; display: flex; flex-direction: column; gap: 12px;
    `;

    const headerTitle = isJa ? 'プリセット保存' : isEn ? 'Save Preset' : '프리셋 저장';
    const descLabel = isJa ? '保存するプリセット名を入力してください:' : isEn ? 'Enter a name for the preset:' : '저장할 프리셋의 이름을 입력하세요:';
    const cancelText = isJa ? 'キャンセル' : isEn ? 'Cancel' : '취소';
    const saveText = isJa ? '保存' : isEn ? 'Save' : '저장';

    dialog.innerHTML = `
        <div style="font-size: 1rem; font-weight: 800; color: #333; display: flex; align-items: center; gap: 8px; user-select: none;">
            <div style="width: 4px; height: 16px; background-color: ${themeColor}; border-radius: 2px;"></div>
            <span>${headerTitle}</span>
        </div>
        <div style="font-size: 0.8rem; color: #666; font-weight: 500; line-height: 1.4; user-select: none;">${descLabel}</div>
        <input type="text" class="preset-name-input" value="${defaultPresetName}" maxlength="15" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.85rem; box-sizing: border-box; outline: none; font-family: inherit; font-weight: 500; transition: border-color 0.15s;">
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
            <button class="modal-cancel-btn" style="padding: 6px 14px; background: #f5f5f5; color: #555; font-size: 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: inherit; transition: background 0.1s;">${cancelText}</button>
            <button class="modal-save-btn" style="padding: 6px 16px; background: ${themeColor}; color: white; font-size: 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: inherit; box-shadow: 0 2px 4px ${themeColor}33; transition: background 0.1s;">${saveText}</button>
        </div>
    `;

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    history.pushState({ modalOpen: 'supportPresetSave' }, "");

    const input = dialog.querySelector('.preset-name-input');
    const cancelBtn = dialog.querySelector('.modal-cancel-btn');
    const saveBtn = dialog.querySelector('.modal-save-btn');

    if (input) {
        input.focus(); input.select();
        input.onfocus = () => { input.style.borderColor = themeColor; };
        input.onblur = () => { input.style.borderColor = '#ddd'; };
    }

    const onPopState = () => {
        backdrop.remove();
        window.removeEventListener('popstate', onPopState);
    };
    window.addEventListener('popstate', onPopState);

    const closeModal = () => history.back();

    const executeSave = () => {
        const val = input.value.trim();
        if (val) {
            saveToSlot(slotId, val);
            if (renderSlotsFn) {
                container.querySelector('.slot-modal-list').innerHTML = renderSlotsFn();
            }
            closeModal();
        }
    };

    let isMouseDownOnBackdrop = false;
    backdrop.onmousedown = (e) => { isMouseDownOnBackdrop = (e.target === backdrop); };
    backdrop.onclick = (e) => { if (e.target === backdrop && isMouseDownOnBackdrop) closeModal(); };
    cancelBtn.onclick = closeModal;
    saveBtn.onclick = executeSave;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') executeSave();
        else if (e.key === 'Escape') closeModal();
    };
}

export function renderSupport() {
    if (!contentArea) return;

    preloadSupportImages();

    let container = contentArea.querySelector('.support-container');
    if (!container) {
        contentArea.innerHTML = '';
        const tpl = document.getElementById('tpl-support');
        contentArea.appendChild(tpl.content.cloneNode(true));
        container = contentArea.querySelector('.support-container');
        setupStaticListeners(container);
    }

    syncFilterUI(container);
    updateSupportGrid(container);
    updateDatePickerDots();
}

function adjustDateFilterPosition(container) {
    const wrapper = container.querySelector('.date-filter-wrapper');
    if (!wrapper) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const abilityDropdown = container.querySelector('#ability-dropdown');
        if (abilityDropdown) {
            const resetBtn = abilityDropdown.querySelector('.ability-reset-btn');
            if (resetBtn) {
                abilityDropdown.insertBefore(wrapper, resetBtn);
            } else {
                abilityDropdown.appendChild(wrapper);
            }
        }
    } else {
        const sortGroup = container.querySelector('.sort-group');
        const sortSelect = container.querySelector('#sort-select');
        if (sortGroup && sortSelect) {
            sortGroup.insertBefore(wrapper, sortSelect);
        }
    }
}

function setupStaticListeners(container) {
    const topRightBtn = container.querySelector('#btn-support-top-right');
    if (topRightBtn) {
        topRightBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { openSupportMenuModal } = await import('./possessionModal.js');
            openSupportMenuModal();
        });
    }

    const filterGroups = ['plan', 'attr', 'source', 'rarity'];
    filterGroups.forEach(type => {
        const group = container.querySelector(`#filter-${type}`);
        if (!group) return;
        group.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            setFilter(type, btn.dataset.val);
            renderSupport();
        });
    });

    // Ability filter dropdown
    const abilityDropdownBtn = container.querySelector('#btn-ability-dropdown');
    const abilityDropdown = container.querySelector('#ability-dropdown');
    if (abilityDropdownBtn && abilityDropdown) {
        // Dynamically populate dropdown from abilityData (entries with name:)
        abilityDropdown.innerHTML = '';

        // Add Reset button first
        const resetBtn = document.createElement('button');
        resetBtn.className = 'filter-btn ability-sub-btn ability-reset-btn';
        resetBtn.dataset.i18n = 'filter_ability_reset';
        resetBtn.textContent = translate('filter_ability_reset') || 'Reset';
        abilityDropdown.appendChild(resetBtn);

        // Add sp_lessonup and percentparam first (these don't have name: in abilityData)
        const specialEntries = [
            { key: 'sp_lessonup', name: { ko: 'SP% ↑', ja: 'SP% ↑', en: 'SP% ↑' } },
            { key: 'percentparam', name: { ko: '보너스(%)', ja: 'ボーナス(%)', en: 'Bonus(%)' } },
        ];
        for (const entry of specialEntries) {
            const hasAbility = cardList.some(card => {
                if (!card.abilities) return false;
                if (entry.key === 'sp_lessonup') {
                    return card.abilities.includes('sp_lessonup') || card.abilities.includes('allsp_lessonup');
                }
                return card.abilities.includes(entry.key);
            });
            if (!hasAbility) continue;

            const btn = document.createElement('button');
            btn.className = 'filter-btn ability-sub-btn';
            btn.dataset.val = entry.key;
            btn.textContent = entry.name[state.currentLang] || entry.name.en;
            abilityDropdown.appendChild(btn);
        }
        // Add all abilityData entries that have name:
        for (const [key, data] of Object.entries(abilityData)) {
            if (!data.name) continue;
            const hasAbility = cardList.some(card => card.abilities && card.abilities.includes(key));
            if (!hasAbility) continue;

            const btn = document.createElement('button');
            btn.className = 'filter-btn ability-sub-btn';
            btn.dataset.val = key;
            btn.textContent = data.name[state.currentLang] || data.name.en;
            abilityDropdown.appendChild(btn);
        }

        // Add P-Item separator and buttons
        const pDivider = document.createElement('div');
        pDivider.className = 'ability-dropdown-divider';
        pDivider.style.cssText = 'grid-column: 1 / -1; display: flex; align-items: center; text-align: center; margin: 8px 0;';
        
        const pLine1 = document.createElement('span');
        pLine1.style.cssText = 'flex-grow: 1; border-bottom: 1px solid #eee;';
        
        const pTextSpan = document.createElement('span');
        const pSepText = {
            ko: 'P 아이템',
            ja: 'Pアイテム',
            en: 'P-Item'
        };
        pTextSpan.textContent = pSepText[state.currentLang] || pSepText.en;
        pTextSpan.style.cssText = 'padding: 0 10px; font-size: 0.72rem; color: #999; font-weight: bold; white-space: nowrap; pointer-events: none; user-select: none;';
        
        const pLine2 = document.createElement('span');
        pLine2.style.cssText = 'flex-grow: 1; border-bottom: 1px solid #eee;';
        
        pDivider.appendChild(pLine1);
        pDivider.appendChild(pTextSpan);
        pDivider.appendChild(pLine2);
        abilityDropdown.appendChild(pDivider);

        const pItemFilters = [
            { key: 'pitem_get', abilityKey: 'get' },
            { key: 'pitem_copy', name: { ko: '카드 복제', ja: 'カードコピー', en: 'Card Copy' } },
            { key: 'pitem_get_drink', abilityKey: 'get_drink' },
            { key: 'pitem_enhance', abilityKey: 'enhance' },
            { key: 'pitem_delete', abilityKey: 'delete' },
            { key: 'pitem_delete_t', abilityKey: 'delete_trouble3' },
            { key: 'pitem_change', abilityKey: 'change3' },
            { key: 'pitem_stats', name: { ko: '스텟', ja: 'パラメーター獲得', en: 'Stat Gain' } },
            { key: 'pitem_ppoint', name: { ko: 'P포인트', ja: 'Pポイント', en: 'P-Points' } },
            { key: 'pitem_hp', name: { ko: '체력 회복', ja: '体力回復', en: 'HP Recovery' } },
            { key: 'pitem_inexam', name: { ko: '레슨/시험 내', ja: 'レッスン/試験内', en: 'In Lesson/Exam' } }
        ];

        for (const entry of pItemFilters) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn ability-sub-btn';
            btn.dataset.val = entry.key;
            btn.textContent = entry.abilityKey ? abilityData[entry.abilityKey].name[state.currentLang] : (entry.name[state.currentLang] || entry.name.en);
            abilityDropdown.appendChild(btn);
        }

        // Add Support Unique Card separator and buttons
        const divider = document.createElement('div');
        divider.className = 'ability-dropdown-divider';
        divider.style.cssText = 'grid-column: 1 / -1; display: flex; align-items: center; text-align: center; margin: 8px 0;';
        
        const line1 = document.createElement('span');
        line1.style.cssText = 'flex-grow: 1; border-bottom: 1px solid #eee;';
        
        const textSpan = document.createElement('span');
        const sepText = {
            ko: '서포트 고유 카드',
            ja: 'サポート固有カード',
            en: 'Support Unique Cards'
        };
        textSpan.textContent = sepText[state.currentLang] || sepText.en;
        textSpan.style.cssText = 'padding: 0 10px; font-size: 0.72rem; color: #999; font-weight: bold; white-space: nowrap; pointer-events: none; user-select: none;';
        
        const line2 = document.createElement('span');
        line2.style.cssText = 'flex-grow: 1; border-bottom: 1px solid #eee;';
        
        divider.appendChild(line1);
        divider.appendChild(textSpan);
        divider.appendChild(line2);
        abilityDropdown.appendChild(divider);

        const cardFilters = [
            { key: 'card_m', labelKey: 'calc_label_mental' },
            { key: 'card_a', labelKey: 'calc_label_active' }
        ];

        for (const entry of cardFilters) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn ability-sub-btn';
            btn.dataset.val = entry.key;
            const getLabel = translate('support_effect_get') || 'Get Card';
            const typeLabel = translate(entry.labelKey) || (entry.labelKey === 'calc_label_mental' ? 'Mental' : 'Active');
            btn.textContent = `${getLabel}(${typeLabel})`;
            abilityDropdown.appendChild(btn);
        }


        abilityDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            abilityDropdown.classList.toggle('hidden');
        });

        adjustDateFilterPosition(container);
        if (window.supportResizeListener) {
            window.removeEventListener('resize', window.supportResizeListener);
        }
        window.supportResizeListener = () => adjustDateFilterPosition(container);
        window.addEventListener('resize', window.supportResizeListener);
        abilityDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const resetBtn = e.target.closest('.ability-reset-btn');
            if (resetBtn) {
                state.filters.ability = [];
                sessionStorage.setItem('filters', JSON.stringify(state.filters));
                syncFilterUI(container);
                updateSupportGrid(container);
                return;
            }

            const btn = e.target.closest('.ability-sub-btn');
            if (!btn) return;
            const val = btn.dataset.val;

            // Support Unique Card category: only 1 selection allowed
            const supportCardKeys = ['card_m', 'card_a'];
            // P-Item category: only 1 selection allowed
            const pItemKeys = ['pitem_get', 'pitem_get_drink', 'pitem_enhance', 'pitem_delete', 'pitem_delete_t', 'pitem_change', 'pitem_copy', 'pitem_stats', 'pitem_ppoint', 'pitem_hp', 'pitem_inexam'];

            if (supportCardKeys.includes(val)) {
                // Remove other support card filters + all p-item filters
                [...supportCardKeys.filter(k => k !== val), ...pItemKeys].forEach(k => {
                    const idx = state.filters.ability.indexOf(k);
                    if (idx > -1) state.filters.ability.splice(idx, 1);
                });
            } else if (pItemKeys.includes(val)) {
                // Remove other p-item filters + all support card filters
                [...pItemKeys.filter(k => k !== val), ...supportCardKeys].forEach(k => {
                    const idx = state.filters.ability.indexOf(k);
                    if (idx > -1) state.filters.ability.splice(idx, 1);
                });
            }

            setFilter('ability', val);
            syncFilterUI(container);
            updateSupportGrid(container);
        });
        document.addEventListener('click', (e) => {
            const inFlatpickr = e.target.closest('.flatpickr-calendar');
            if (!abilityDropdownBtn.contains(e.target) && !abilityDropdown.contains(e.target) && !inFlatpickr) {
                abilityDropdown.classList.add('hidden');
            }
        });
    }

    // 서포트 정보 툴팁 클릭 이벤트
    const infoBtn = container.querySelector('.support-info-btn');
    const infoTooltip = container.querySelector('.support-info-tooltip');
    if (infoBtn && infoTooltip) {
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            infoTooltip.classList.toggle('visible');
        });

        // 툴팁 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!infoBtn.contains(e.target) && !infoTooltip.contains(e.target)) {
                infoTooltip.classList.remove('visible');
            }
        });
    }

    const toggleBtn = container.querySelector('#btn-toggle-extra');
    const extraWrapper = container.querySelector('#extra-filters');
    if (toggleBtn && extraWrapper) {
        toggleBtn.addEventListener('click', () => {
            state.extraFiltersOpen = !state.extraFiltersOpen;
            if (state.extraFiltersOpen) {
                extraWrapper.classList.remove('hidden');
                toggleBtn.classList.add('active');
            } else {
                extraWrapper.classList.add('hidden');
                toggleBtn.classList.remove('active');
            }
        });
    }

    const sortSelect = container.querySelector('#sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            setSortBy(e.target.value);
            renderSupport();
        });
    }

    const sortOrderBtn = container.querySelector('#btn-sort-order');
    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', () => {
            const newOrder = (state.sortOrder === 'asc') ? 'desc' : 'asc';
            setSortOrder(newOrder);
            renderSupport();
        });
    }

    initDatePicker(renderSupport);

    const allMaxBtn = container.querySelector('#btn-all-max-lb');
    if (allMaxBtn) {
        allMaxBtn.textContent = t('ui_bulk_adjust');
        allMaxBtn.addEventListener('click', () => {
            const confirmMsg = t('ui_bulk_adjust_confirm');
            const confirmLabel = t('ui_bulk_adjust_confirm_label');

            showCustomConfirm(confirmMsg, () => {
                cardList.forEach(card => {
                    setSupportLB(card.id, 4);
                });
                renderSupport();
                if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            }, () => {
                cardList.forEach(card => {
                    setSupportLB(card.id, 0);
                });
                state.disabledCards = {};
                localStorage.setItem('disabledCards', JSON.stringify(state.disabledCards));
                renderSupport();
                if (typeof window.refreshCardBonuses === 'function') window.refreshCardBonuses();
            }, confirmLabel);
        });
    }

    const openSlotBtn = container.querySelector('#btn-open-slot-modal');
    if (openSlotBtn) {
        openSlotBtn.addEventListener('click', () => {
            openSlotModal();
        });
    }

    const grid = container.querySelector('.support-grid');
    let longPressTimer;
    let isLongPress = false;

    grid.addEventListener('mouseover', (e) => {
        const cardEl = e.target.closest('.support-card');
        if (cardEl) preloadMainImage(cardEl.dataset.id);
    });

    grid.addEventListener('mousedown', (e) => {
        const cardEl = e.target.closest('.support-card');
        if (!cardEl) return;
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const cardId = cardEl.dataset.id;
            toggleDisabledCard(cardId);
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].map(id => id === cardId ? null : id);
                    }
                });
                calcStore.save();
            }
            renderSupport();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    });

    grid.addEventListener('touchstart', (e) => {
        const cardEl = e.target.closest('.support-card');
        if (!cardEl) return;
        preloadMainImage(cardEl.dataset.id);
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            const cardId = cardEl.dataset.id;
            toggleDisabledCard(cardId);
            if (state.disabledCards[cardId]) {
                ['sense', 'logic', 'anomaly'].forEach(plan => {
                    if (calcStore.planCards[plan]) {
                        calcStore.planCards[plan] = calcStore.planCards[plan].map(id => id === cardId ? null : id);
                    }
                });
                calcStore.save();
            }
            renderSupport();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 600);
    }, { passive: true });

    const cancelLongPress = () => clearTimeout(longPressTimer);
    grid.addEventListener('mouseup', cancelLongPress);
    grid.addEventListener('mouseleave', cancelLongPress);
    grid.addEventListener('touchend', cancelLongPress);
    grid.addEventListener('touchmove', cancelLongPress);

    grid.addEventListener('click', (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const star = e.target.closest('.card-star');
        const cardEl = e.target.closest('.support-card');

        if (star && cardEl) {
            e.stopPropagation();
            const cardId = cardEl.dataset.id;
            const starIdx = parseInt(star.dataset.star, 10);
            const currentLB = state.supportLB[cardId] || 0;
            const newLB = (starIdx === currentLB) ? 0 : starIdx;

            setSupportLB(cardId, newLB);
            const stars = cardEl.querySelectorAll('.card-star');
            stars.forEach((s, idx) => s.classList.toggle('active', idx < newLB));
            return;
        }

        if (cardEl) {
            const cardId = cardEl.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (card) {
                const displayName = getLocalizedCardName(card);
                const imgSrc = card.image || `images/support/${cardId}.webp`;
                showCardModal(card, displayName, imgSrc);
            }
        }
    });
}

function syncFilterUI(container) {
    const filterGroups = ['plan', 'attr', 'source', 'rarity'];
    filterGroups.forEach(type => {
        const btns = container.querySelectorAll(`#filter-${type} .filter-btn`);
        btns.forEach(btn => {
            const val = btn.dataset.val;
            let isActive = false;
            if (val === 'all') {
                isActive = (state.filters[type].length === 0);
            } else {
                isActive = state.filters[type].includes(val);
            }
            btn.classList.toggle('active', isActive);
        });
    });

    // Ability sub-buttons active state
    const abilityBtns = container.querySelectorAll('.ability-sub-btn');
    abilityBtns.forEach(btn => {
        const val = btn.dataset.val;
        btn.classList.toggle('active', state.filters.ability.includes(val));
    });

    // Dropdown trigger button: highlight if any ability filter is active (and also date filters on mobile)
    const dropdownBtn = container.querySelector('#btn-ability-dropdown');
    if (dropdownBtn) {
        const isMobile = window.innerWidth <= 768;
        const isDateModified = isMobile && (document.querySelector('#date-filter-start.is-modified') || document.querySelector('#date-filter-end.is-modified'));
        dropdownBtn.classList.toggle('has-active', state.filters.ability.length > 0 || !!isDateModified);
    }

    // 날짜 input의 is-modified 동기화 (datepicker.js의 단일 함수에 위임)
    syncDateModifiedClass();

    const toggleBtn = container.querySelector('#btn-toggle-extra');
    const extraWrapper = container.querySelector('#extra-filters');
    if (state.extraFiltersOpen) {
        extraWrapper?.classList.remove('hidden');
        toggleBtn?.classList.add('active');
    }

    const sortSelect = container.querySelector('#sort-select');
    if (sortSelect) {
        sortSelect.value = state.sortBy;
    }

    const sortOrderArrow = container.querySelector('#sort-order-arrow');
    if (sortOrderArrow) {
        sortOrderArrow.textContent = (state.sortOrder === 'asc') ? '↑' : '↓';
    }

    syncDatePickerUI();
}

export function normalizeDateStr(str) {
    if (!str) return '';
    const m = str.match(/(\d{4})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/);
    if (!m) return str.trim().replace(/[\/\.]/g, '-');
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

export function checkCardMatchFilters(card, includeDate = false) {
    if (card.encyclopedia === false) return false;
    const cPlan = (card.plan || 'free').toLowerCase();
    const cType = card.type.toLowerCase();
    const cSource = (card.source || 'normal').toLowerCase();
    const cRarity = card.rarity;

    const planMatch = (state.filters.plan.length === 0) || (state.filters.plan.includes(cPlan));
    const attrMatch = (state.filters.attr.length === 0) || (state.filters.attr.includes(cType));
    const sourceMatch = (state.filters.source.length === 0) || (state.filters.source.includes(cSource));
    const rarityMatch = (state.filters.rarity.length === 0) || (state.filters.rarity.includes(cRarity));

    if (!planMatch || !attrMatch || !sourceMatch || !rarityMatch) return false;

    if (includeDate) {
        if (state.filters.dateRange && card.releasedAt) {
            const cardDate = normalizeDateStr(card.releasedAt);
            const startDate = normalizeDateStr(state.filters.dateRange.start);
            const endDate = normalizeDateStr(state.filters.dateRange.end);

            if (startDate && cardDate < startDate) return false;
            if (endDate && cardDate > endDate) return false;
        }
    }

    const abilityMatch = (state.filters.ability.length === 0) || (() => {
        const pItemKeys = ['pitem_get', 'pitem_get_drink', 'pitem_enhance', 'pitem_delete', 'pitem_delete_t', 'pitem_change', 'pitem_copy', 'pitem_stats', 'pitem_ppoint', 'pitem_hp', 'pitem_inexam'];
        const supportCardKeys = ['card_m', 'card_a'];

        const groupA = [];
        const groupBC = [];

        state.filters.ability.forEach(ab => {
            if (pItemKeys.includes(ab) || supportCardKeys.includes(ab)) {
                groupBC.push(ab);
            } else {
                groupA.push(ab);
            }
        });

        const checkAbility = (ab) => {
            if (ab === 'card_m') return card.have === 'card_m';
            if (ab === 'card_a') return card.have === 'card_a';
            if (ab === 'pitem_get') return card.item_effects && card.item_effects.some(eff => !eff.display && (Array.isArray(eff.target) ? eff.target.includes('get') : eff.target === 'get'));
            if (ab === 'pitem_get_drink') return card.item_effects && card.item_effects.some(eff => Array.isArray(eff.target) ? eff.target.includes('get_drink') : eff.target === 'get_drink');
            if (ab === 'pitem_enhance') return card.item_effects && card.item_effects.some(eff => Array.isArray(eff.target) ? eff.target.includes('enhance') : eff.target === 'enhance');
            if (ab === 'pitem_delete') return card.item_effects && card.item_effects.some(eff => Array.isArray(eff.target) ? eff.target.includes('delete') : eff.target === 'delete');
            if (ab === 'pitem_delete_t') return card.item_effects && card.item_effects.some(eff => Array.isArray(eff.target) ? eff.target.includes('delete_t') : eff.target === 'delete_t');
            if (ab === 'pitem_change') return card.item_effects && card.item_effects.some(eff => Array.isArray(eff.target) ? eff.target.includes('change') : eff.target === 'change');
            if (ab === 'pitem_copy') return card.item_effects && card.item_effects.some(eff => eff.display && (Array.isArray(eff.target) ? eff.target.includes('get') : eff.target === 'get'));
            if (ab === 'pitem_stats') return card.item_effects && card.item_effects.some(eff => eff.stats);
            if (ab === 'pitem_ppoint') return card.item_effects && card.item_effects.some(eff => eff.targettext && (Array.isArray(eff.targettext) ? eff.targettext : [eff.targettext]).some(t => typeof t === 'string' && t.includes('ppoint')));
            if (ab === 'pitem_hp') return card.item_effects && card.item_effects.some(eff => eff.targettext && (Array.isArray(eff.targettext) ? eff.targettext : [eff.targettext]).some(t => typeof t === 'string' && t.includes('hp')));
            if (ab === 'pitem_inexam') return card.item_effects && card.item_effects.some(eff => eff.type === 'inexam');

            if (!card.abilities) return false;
            if (ab === 'sp_lessonup') {
                return card.abilities.includes('sp_lessonup') || card.abilities.includes('allsp_lessonup');
            }
            return card.abilities.includes(ab);
        };

        const matchA = groupA.length === 0 || groupA.some(ab => checkAbility(ab));
        const matchBC = groupBC.length === 0 || groupBC.every(ab => checkAbility(ab));

        return matchA && matchBC;
    })();

    return abilityMatch;
}

function updateSupportGrid(container) {
    const grid = container.querySelector('.support-grid');
    const itemTpl = document.getElementById('tpl-support-item');

    let filteredList = cardList.filter(card => checkCardMatchFilters(card, true));

    const getNumericId = (id) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    filteredList.sort((a, b) => {
        const aDisabled = !!state.disabledCards[a.id];
        const bDisabled = !!state.disabledCards[b.id];
        if (aDisabled !== bDisabled) return aDisabled ? 1 : -1;

        const isAsc = (state.sortOrder === 'asc');

        if (state.sortBy === 'id') {
            const dateA = a.releasedAt || "0000.00.00";
            const dateB = b.releasedAt || "0000.00.00";
            if (dateA !== dateB) return isAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);

            const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;
            if (rA !== rB) return rB - rA;

            const idA = getNumericId(a.id);
            const idB = getNumericId(b.id);
            return isAsc ? (idA - idB) : (idB - idA);
        } else if (state.sortBy === 'lb') {
            const lbA = state.supportLB[a.id] || 0;
            const lbB = state.supportLB[b.id] || 0;
            if (lbA !== lbB) return isAsc ? (lbA - lbB) : (lbB - lbA);
            return getNumericId(b.id) - getNumericId(a.id);
        } else if (state.sortBy === 'name') {
            const nameA = getLocalizedCardName(a);
            const nameB = getLocalizedCardName(b);
            return isAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        return 0;
    });

    grid.innerHTML = '';
    if (filteredList.length > 0) {
        const fragment = document.createDocumentFragment();
        filteredList.forEach(card => {
            const item = itemTpl.content.cloneNode(true);
            const cardEl = item.querySelector('.support-card');
            const cardId = card.id;
            const currentLB = state.supportLB[cardId] || 0;
            const isDeactivated = !!state.disabledCards[cardId];

            cardEl.dataset.id = cardId;
            cardEl.classList.add(`rarity-${card.rarity.toLowerCase()}`);
            if (isDeactivated) cardEl.classList.add('is-disabled');
            
            cardEl.addEventListener('mouseenter', () => {
                if (!isMobileDevice()) {
                    const img = new Image();
                    img.src = `images/support/${cardId}.webp`;
                }
            }, { once: true });

            const imgSrc = card.image || `images/support/thumb/${cardId}.webp`;
            item.querySelector('.card-img').src = imgSrc;
            item.querySelectorAll('.card-star').forEach((s, idx) => s.classList.toggle('active', idx < currentLB));

            const plan = (card.plan || 'free').toLowerCase();
            item.querySelector('.card-plan-icon').src = `icons/${plan}.webp`;
            item.querySelector('.card-type-icon').src = `icons/${card.type.toLowerCase()}.webp`;

            fragment.appendChild(item);
        });
        grid.appendChild(fragment);
    }

    // 화면에 나타나는 카드 감지를 위한 Observer 초기화 및 등록
    initSupportObserver();
    grid.querySelectorAll('.support-card').forEach(el => {
        if (supportCardObserver) {
            supportCardObserver.observe(el);
        }
    });

    updatePageTranslations(container);
}

export function updateGlobalBackgroundColor() {
    const fixedBg = document.getElementById('fixed-bg');
    const isHif = window.location.hash === '#calc/hif';
    const idolColor = (state.favoriteIdol && idolColors[state.favoriteIdol]) ? idolColors[state.favoriteIdol] : '#ff4d8d';

    document.documentElement.style.setProperty('--idol-theme-color', idolColor);

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = (state.favoriteIdol && idolColors[state.favoriteIdol]) ? idolColor : '#ff4d8d';

    if (isHif && fixedBg) {
        // HIF 전용 5색 그라데이션 전역 배경 복구
        fixedBg.style.background = 'linear-gradient(225deg, #67c7d3, #189cfa, #3d64fb, #9575fb, #5960fb)';
        fixedBg.style.opacity = '0.3';
        document.body.style.backgroundColor = '#ffffff';
        return;
    }

    if (state.favoriteIdol && idolColors[state.favoriteIdol]) {
        document.body.style.backgroundColor = idolColor + "00";
        if (fixedBg) {
            fixedBg.style.background = '';
            fixedBg.style.backgroundColor = idolColor;
            fixedBg.style.opacity = '0.2';
        }
    } else {
        document.documentElement.style.setProperty('--idol-theme-color', '#ff4d8d');
        if (fixedBg) {
            fixedBg.style.background = '';
            fixedBg.style.backgroundColor = "#adb5bd";
            fixedBg.style.opacity = '0.2';
        }
        document.body.style.backgroundColor = "#ffffff";
    }
}

function showCustomConfirm(message, onConfirmCallback, onResetCallback, confirmLabel) {
    let modal = document.getElementById('custom-confirm-modal');
    if (modal) modal.remove();

    const isMobile = window.innerWidth <= 768;

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'custom-confirm-modal';
    modal.style.zIndex = '40000';

    const pSize = isMobile ? '0.8rem' : '0.95rem';
    const pad = isMobile ? '20px 15px' : '25px 20px';
    const btnSize = '0.75rem';
    const modalWidth = isMobile ? '320px' : '400px';
    const btnMinWidth = isMobile ? '80px' : '100px';
    const btnHeight = isMobile ? '28px' : '32px';

    const resetBtnHtml = onResetCallback ? `<button class="calc-btn reset-btn" style="background:#2196F3; min-width:${btnMinWidth}; font-size:${btnSize}; height:${btnHeight}; padding:0 8px; border-radius:8px;">${t('gacha_reset')}</button>` : '';
    const finalConfirmLabel = confirmLabel || t('ui_confirm');

    modal.innerHTML = `
        <div class="modal-content" style="max-width: ${modalWidth}; text-align: center; padding: ${pad};">
            <p style="margin-bottom: 20px; font-size: ${pSize}; color: #333; line-height: 1.5; font-weight: bold; word-break: keep-all;">${message}</p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                ${resetBtnHtml}
                <button class="calc-btn cancel-btn" style="background:#eee; color:#666 !important; min-width:${btnMinWidth}; font-size:${btnSize}; height:${btnHeight}; padding:0 8px; border-radius:8px;">${t('ui_cancel')}</button>
                <button class="calc-btn confirm-btn" style="min-width:${btnMinWidth}; font-size:${btnSize}; height:${btnHeight}; padding:0 8px; border-radius:8px;">${finalConfirmLabel}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'customConfirm' }, "");
    modal.style.display = 'flex';

    modal.querySelector('.cancel-btn').addEventListener('click', () => history.back());
    if (onResetCallback) {
        modal.querySelector('.reset-btn').addEventListener('click', () => {
            history.back();
            onResetCallback();
        });
    }
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        history.back();
        onConfirmCallback();
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) history.back();
    });
}


