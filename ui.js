// ui.js
import { state, setFilter, setSupportLB, setPSSRIndex, setFavoriteIdol, idolColors, toggleDisabledCard, saveToSlot, setSlotData, loadFromSlot, getSlotInfo, getSlotData, deleteSlot, setSortBy, setSortOrder } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { cardList } from './carddata.js';
import { initCalc } from './calc.js';
import { calcStore } from './calcStore.js';
import { renderPSSRRoadmap } from './roadmap.js';
import { showCardModal } from './cardModal.js';

const contentArea = document.getElementById('content-area');
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);
const PRESET_EXPORT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwSafeNbHyCmIU9YHHXX-mdtKukA8fcEHlWkzOegXxOwQTUnoSp4MKa_EMBkQU_PuiE/exec';

// 계산기 화면 복귀 이벤트 리스너
window.addEventListener('renderCalcRequested', () => {
    renderCalc();
});

let homeCachedContent = null;
let lastRenderedLang = null;
window.__videoModalOpen = false;
window.__videoModalHistoryPushed = false;
window.__videoModalPendingClose = false;

// 서포트 카드 이미지 프리로드 (호버/클릭 시)
let preloadedSupport = false;
export function preloadSupportImages() {
    if (preloadedSupport) return;
    preloadedSupport = true;

    cardList.forEach(card => {
        const baseIconPath = `images/support/${card.id}`;

        // 내부 아이템/카드 이미지 프리로드 및 실제 경로 판별
        const isCardType = card.have && card.have.startsWith('card');
        const path1 = isCardType ? `${baseIconPath}_card.webp` : `${baseIconPath}_item.webp`;
        const path2 = isCardType ? `${baseIconPath}_item.webp` : `${baseIconPath}_card.webp`;

        const img1 = new Image();
        img1.onload = () => { card._extraPath = path1; };
        img1.src = path1;

        const img2 = new Image();
        img2.onload = () => { if (!card._extraPath) card._extraPath = path2; };
        img2.src = path2;
    });
}

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (useJaNames() && card.name_ja) return card.name_ja;
    return card.name;
};

export function openVideoModal(embedUrl, borderColor = '#ff4d8d') {
    const videoModal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    if (!videoModal || !iframe) return;

    const modalContent = videoModal.querySelector('.video-modal-content');
    const innerContainer = videoModal.querySelector('.video-container');
    if (modalContent) modalContent.style.borderColor = borderColor;
    if (innerContainer) innerContainer.style.borderColor = borderColor;

    iframe.src = embedUrl;
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

        homeCachedContent = contentArea.innerHTML;
        lastRenderedLang = state.currentLang;
        return;
    }

    // 캐시가 있어도 로드맵 영역은 비우고 다시 그려서 새로운 높이/JS 반영
    contentArea.innerHTML = homeCachedContent;
    updatePageTranslations(contentArea); // 추가: 캐시된 내용에도 최신 번역 적용

    const listContainer = document.getElementById('pssr-roadmap-list');
    if (listContainer) listContainer.innerHTML = '';
    renderPSSRRoadmap(false);
}

export function renderCalc(mode) {
    if (!contentArea) return;
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
        resultEl.textContent = message || '';
        resultEl.style.color = color;
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

    const exportSlotPreset = async (slotId, rootEl) => {
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
        const inputEl = rootEl?.querySelector(`[data-import-input="${slotId}"]`);
        const importBtn = rootEl?.querySelector(`[data-import-btn="${slotId}"]`);
        const rawCode = inputEl?.value || '';
        const code = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();

        if (!PRESET_EXPORT_ENDPOINT) {
            updateImportResult(rootEl, slotId, t('ui_slot_export_missing_config'), '#ef5350');
            return;
        }

        if (!code) {
            updateImportResult(rootEl, slotId, t('ui_slot_import_empty'), '#ef5350');
            inputEl?.focus();
            return;
        }

        if (inputEl) inputEl.value = code;
        if (importBtn) {
            importBtn.disabled = true;
            importBtn.style.cursor = 'default';
            importBtn.style.opacity = '0.7';
        }
        updateImportResult(rootEl, slotId, t('ui_slot_importing'), '#1976d2');

        try {
            const response = await fetch(PRESET_EXPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'import',
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

            applyImportedPreset(slotId, result.preset);
            modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            updateImportResult(rootEl, slotId, t('ui_slot_import_success'), '#2e7d32');
        } catch (error) {
            console.warn('Preset import failed:', error);
            const detail = error?.message ? ` ${error.message}` : '';
            updateImportResult(rootEl, slotId, `${t('ui_slot_import_failed')}${detail}`, '#ef5350');
        } finally {
            if (importBtn) {
                importBtn.disabled = false;
                importBtn.style.cursor = 'pointer';
                importBtn.style.opacity = '1';
            }
        }
    };

    const openShareModal = (slotId) => {
        let shareModal = document.getElementById('slot-share-modal');
        if (shareModal) shareModal.remove();

        const slotInfo = getSlotInfo(slotId);
        shareModal = document.createElement('div');
        shareModal.className = 'modal';
        shareModal.id = 'slot-share-modal';

        shareModal.innerHTML = `
            <div class="modal-content" style="max-width: 340px; padding: 18px 18px 16px;">
                <div style="padding: 12px; background: #f9f9f9; border: 1px solid #eee; border-radius: 10px;">
                    <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 12px;">
                        <div style="display:flex; align-items:center; gap: 6px; min-width: 0; flex: 1;">
                            <span style="font-weight: bold; color: #333; white-space: nowrap;">Slot ${slotId}</span>
                            <span data-export-result="${slotId}" style="font-size: 0.72rem; color: #666; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
                        </div>
                        <button class="slot-btn copy-code ${state.currentLang === 'ja' ? 'lang-ja' : ''}" data-copy-slot="${slotId}" data-code="" style="display: none; width: auto; min-width: 0; flex: 0 0 auto; padding: 0; margin: 0; font-size: 0.62rem; background: transparent; color: #5e35b1; border: none; border-radius: 0; cursor: pointer; font-weight: bold; line-height: 1.1; letter-spacing: -0.01em; white-space: nowrap; vertical-align: baseline;">${t('ui_slot_copy')}</button>
                        <button class="slot-btn export" data-slot="${slotId}" data-export-btn="${slotId}" ${!slotInfo ? 'style="display:none;"' : ''} style="width: 32px; height: 30px; flex: none; padding: 0; background: #fff3e0; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/upload-cloud.svg" alt="${t('ui_slot_export')}" style="width: 16px; height: 16px; filter: invert(48%) sepia(90%) saturate(1250%) hue-rotate(3deg) brightness(101%) contrast(101%);">
                        </button>
                    </div>
                    <div style="height: 1px; background: #ececec; margin: 10px 0 12px;"></div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" data-import-input="${slotId}" value="" placeholder="${t('ui_slot_import_placeholder')}" style="flex: 1; min-width: 0; height: 32px; padding: 0 9px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.8rem; outline: none;">
                        <button class="slot-btn import" data-import-btn="${slotId}" style="width: 32px; height: 32px; flex: none; padding: 0; background: #e8f5e9; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/download-cloud.svg" alt="${t('ui_slot_import')}" style="width: 16px; height: 16px; filter: invert(41%) sepia(12%) saturate(2641%) hue-rotate(81deg) brightness(94%) contrast(87%);">
                        </button>
                    </div>
                    <div data-import-result="${slotId}" style="font-size: 0.7rem; color: #999; margin-top: 7px;"></div>
                </div>
            </div>`;

        document.body.appendChild(shareModal);
        shareModal.style.display = 'flex';

        const closeShareModal = () => {
            shareModal.remove();
        };

        shareModal.onclick = (e) => {
            if (e.target === shareModal) closeShareModal();
        };

        shareModal.addEventListener('click', (e) => {
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
                importSlotPreset(slotId, shareModal);
            }
        });
    };

    const renderSlots = () => {
        let slotsHtml = '';
        for (let i = 1; i <= 3; i++) {
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
                    <div class="slot-modal-actions" style="display: flex; align-items: center; gap: 6px; padding-top: 10px; padding-right: 2px;">
                        <button class="slot-btn save" data-slot="${i}" style="width: 32px; height: 28px; flex: none; padding: 0; background: #ffe4ef; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/save.svg" alt="${t('ui_slot_save')}" style="width: 16px; height: 16px; filter: invert(36%) sepia(84%) saturate(884%) hue-rotate(305deg) brightness(88%) contrast(92%);">
                        </button>
                        <button class="slot-btn load" data-slot="${i}" ${!timeInfo ? 'style="display:none;"' : ''} style="width: 32px; height: 28px; flex: none; padding: 0; background: #e3f2fd; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/upload.svg" alt="${t('ui_slot_load')}" style="width: 16px; height: 16px; filter: invert(36%) sepia(94%) saturate(1478%) hue-rotate(189deg) brightness(91%) contrast(92%);">
                        </button>
                        <button class="slot-btn share" data-slot="${i}" style="width: 32px; height: 28px; flex: none; padding: 0; background: #fff1cc; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <img src="icons/cloud.svg" alt="${t('ui_slot_share')}" style="width: 16px; height: 16px; filter: invert(47%) sepia(97%) saturate(452%) hue-rotate(5deg) brightness(91%) contrast(105%);">
                        </button>
                    </div>
                </div>`;
        }
        return slotsHtml;
    };

    const isMobile = window.innerWidth <= 768;

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
        }

        if (deleteBtn) {
            const slotId = deleteBtn.dataset.slot;
            if (confirm(t('ui_slot_delete_confirm', { slotId }))) {
                deleteSlot(slotId);
                modal.querySelector('.slot-modal-list').innerHTML = renderSlots();
            }
        }
    });
}

function showSupportSavePresetModal(slotId, container, renderSlotsFn) {
    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';
    const themeColor = '#ff4d8d';
    const defaultPresetName = `Slot ${slotId}`;
            
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
        <input type="text" class="preset-name-input" value="${defaultPresetName}" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.85rem; box-sizing: border-box; outline: none; font-family: inherit; font-weight: 500; transition: border-color 0.15s;">
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
}

function setupStaticListeners(container) {
    const filterGroups = ['plan', 'attr', 'source', 'rarity', 'ability'];
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
    const filterGroups = ['plan', 'attr', 'source', 'rarity', 'ability'];
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
}

function updateSupportGrid(container) {
    const grid = container.querySelector('.support-grid');
    const itemTpl = document.getElementById('tpl-support-item');

    let filteredList = cardList.filter(card => {
        if (card.encyclopedia === false) return false;
        const cPlan = (card.plan || 'free').toLowerCase();
        const cType = card.type.toLowerCase();
        const cSource = (card.source || 'normal').toLowerCase();
        const cRarity = card.rarity;

        const planMatch = (state.filters.plan.length === 0) || (state.filters.plan.includes(cPlan));
        const attrMatch = (state.filters.attr.length === 0) || (state.filters.attr.includes(cType));
        const sourceMatch = (state.filters.source.length === 0) || (state.filters.source.includes(cSource));
        const rarityMatch = (state.filters.rarity.length === 0) || (state.filters.rarity.includes(cRarity));
        
        // ability filter uses AND logic (must have all selected abilities)
        const abilityMatch = (state.filters.ability.length === 0) || state.filters.ability.every(ab => {
            if (!card.abilities) return false;
            if (ab === 'sp_lessonup') {
                return card.abilities.includes('sp_lessonup') || card.abilities.includes('allsp_lessonup');
            }
            return card.abilities.includes(ab);
        });

        return planMatch && attrMatch && sourceMatch && rarityMatch && abilityMatch;
    });

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
    if (filteredList.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%; grid-column:1/-1; padding:2rem;">${t('ui_no_cards_found', {}, 'No cards found.')}</p>`;
    } else {
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

            const imgSrc = card.image || `images/support/${cardId}.webp`;
            item.querySelector('.card-img').src = imgSrc;
            item.querySelectorAll('.card-star').forEach((s, idx) => s.classList.toggle('active', idx < currentLB));

            const plan = (card.plan || 'free').toLowerCase();
            item.querySelector('.card-plan-icon').src = `icons/${plan}.webp`;
            item.querySelector('.card-type-icon').src = `icons/${card.type.toLowerCase()}.png`;

            fragment.appendChild(item);
        });
        grid.appendChild(fragment);
    }
    updatePageTranslations(container);
}

export function updateGlobalBackgroundColor() {
    const fixedBg = document.getElementById('fixed-bg');
    const isHif = window.location.hash === '#calc/hif';
    const idolColor = (state.favoriteIdol && idolColors[state.favoriteIdol]) ? idolColors[state.favoriteIdol] : '#ff4d8d';

    document.documentElement.style.setProperty('--idol-theme-color', idolColor);

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
