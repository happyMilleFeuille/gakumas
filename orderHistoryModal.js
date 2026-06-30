// orderHistoryModal.js
import { state } from './state.js';
const KOREAN_MAPPINGS = {
    '学園アイドルマスター': '학원 아이돌 마스터',
    'プレミアムミッションパス': '프리미엄 미션패스',
    'ジュエル': '쥬얼',
    '回数制限': '횟수제한'
};

function translateItemTitle(title) {
    if (state.currentLang !== 'ko') return title;
    let translated = title;
    for (const [jp, ko] of Object.entries(KOREAN_MAPPINGS)) {
        translated = translated.replace(new RegExp(jp, 'g'), ko);
    }
    return translated;
}

export function openOrderHistoryModal() {
    let modal = document.getElementById('order-history-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'order-history-modal';
    modal.className = 'modal';
    modal.style.zIndex = '35000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0, 0, 0, 0.75)';
    modal.style.backdropFilter = 'blur(4px)';

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';

    const titleText = isJa ? '課金履歴レポート' : isEn ? 'Payment History Report' : '결제 내역 보고서';
    const closeBtnText = isJa ? '閉じる' : isEn ? 'Close' : '닫기';

    modal.innerHTML = `
        <style>
            .order-history-content {
                width: 90%;
                max-width: 720px;
                max-height: 85vh;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                position: relative;
                overflow-y: auto;
                overflow-x: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                animation: oh-modal-fade 0.25s ease-out;
            }
            .order-history-content * {
                box-sizing: border-box;
            }
            @keyframes oh-modal-fade {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .oh-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                background: #fff;
                border-bottom: 1px solid #e2e8f0;
            }
            .oh-title-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .oh-title {
                font-size: 1.25rem;
                font-weight: 800;
                color: #0f172a;
                margin: 0;
            }
            .oh-title-icon {
                color: #ff4d8d;
                width: 24px;
                height: 24px;
            }
            .oh-close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                font-weight: bold;
                color: #94a3b8;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
                transition: color 0.2s;
            }
            .oh-close-btn:hover {
                color: #475569;
            }
            .oh-body {
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                background: #f8fafc;
            }
            .oh-summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 12px;
            }
            .oh-card {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 6px 20px 2px 20px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                position: relative;
                overflow: hidden;
            }
            .oh-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: #ff4d8d;
            }
            .oh-card-label {
                font-size: 0.75rem;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .oh-card-value {
                font-size: 1.3rem;
                font-weight: 800;
                color: #0f172a;
                margin-top: 2px;
                text-align: center;
            }
            .oh-card-sub {
                font-size: 0.7rem;
                color: #94a3b8;
                margin-top: 2px;
                text-align: center;
            }
            /* Monthly Chart Container */
            .oh-section {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .oh-section-title {
                font-size: 0.95rem;
                font-weight: 700;
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            /* Visual Bar Chart */
            .oh-btn-nav {
                background: #f8fafc;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 1px 8px;
                font-size: 0.75rem;
                font-weight: 700;
                color: #475569;
                cursor: pointer;
                user-select: none;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .oh-btn-nav:hover:not(:disabled) {
                background: #ff4d8d;
                border-color: #ff4d8d;
                color: white;
            }
            .oh-btn-nav:disabled {
                opacity: 0.35;
                cursor: not-allowed;
            }
            .oh-chart-wrapper {
                height: 120px;
                display: flex;
                align-items: flex-end;
                border-bottom: 1.5px solid #cbd5e1;
                position: relative;
                gap: 4px;
                width: 100%;
                margin-bottom: 36px;
                padding-top: 25px;
            }
            .oh-chart-bar-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
                justify-content: flex-end;
                position: relative;
            }
            .oh-chart-bar-container:hover {
                z-index: 20;
            }
            .oh-chart-bar {
                width: 100%;
                max-width: 32px;
                background: linear-gradient(0deg, #ff4d8d 0%, #ff85b3 100%);
                border-radius: 3px 3px 0 0;
                transition: height 0.4s ease-out;
                min-height: 2px;
                position: relative;
                cursor: pointer;
            }
            .oh-chart-bar:hover {
                filter: brightness(1.1);
            }
            .oh-chart-tooltip {
                position: absolute;
                bottom: 105%;
                background: #0f172a;
                color: #fff;
                font-size: 0.6rem;
                padding: 3px 5px;
                border-radius: 3px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            }
            .oh-chart-bar:hover .oh-chart-tooltip {
                opacity: 1;
            }
            .oh-chart-label {
                font-size: 0.52rem;
                color: #64748b;
                white-space: nowrap;
                transform: rotate(-60deg);
                transform-origin: top right;
                position: absolute;
                top: calc(100% + 4px);
                right: 50%;
            }
            /* Itemized Breakdown List */
            .oh-breakdown-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .oh-breakdown-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .oh-breakdown-header {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                font-weight: 600;
                color: #334155;
            }
            .oh-breakdown-name {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-right: 12px;
            }
            .oh-breakdown-stats {
                display: flex;
                gap: 12px;
                color: #0f172a;
                font-weight: 700;
            }
            .oh-breakdown-count {
                color: #64748b;
                font-weight: normal;
                font-size: 0.75rem;
            }
            .oh-progress-bg {
                height: 8px;
                background: #f1f5f9;
                border-radius: 4px;
                overflow: hidden;
                width: 100%;
            }
            .oh-progress-fill {
                height: 100%;
                background: #ff4d8d;
                border-radius: 4px;
            }
            /* Table/Timeline UI */
            .oh-table-controls {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 8px;
            }
            .oh-search-input {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.85rem;
                outline: none;
                transition: border-color 0.2s;
            }
            .oh-search-input:focus {
                border-color: #ff4d8d;
            }
            .oh-table-wrapper {
                max-height: 300px;
                overflow-y: auto;
                overflow-x: auto;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                scrollbar-gutter: stable;
            }
            .oh-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                table-layout: fixed;
                font-size: 0.8rem;
                text-align: left;
            }
            .oh-table th {
                background: #f1f5f9;
                color: #475569;
                font-weight: 600;
                padding: 10px 12px;
                position: sticky;
                top: 0;
                z-index: 2;
                border-bottom: 1px solid #e2e8f0;
            }
            .oh-table td {
                padding: 10px 12px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
            }
            .oh-table tr:hover {
                background: #f8fafc;
            }
            .oh-item-title-col {
                font-weight: 600;
                color: #0f172a;
            }
            .oh-refund-tag {
                background: #fee2e2;
                color: #ef4444;
                font-size: 0.65rem;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: bold;
                margin-left: 6px;
            }
            /* Drag and Drop Zone */
            .oh-dropzone {
                border: 2px dashed #cbd5e1;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                background: #f8fafc;
                cursor: pointer;
                transition: border-color 0.2s, background-color 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .oh-dropzone.dragover {
                border-color: #ff4d8d;
                background: #fff1f6;
            }
            .oh-dropzone-icon {
                color: #94a3b8;
                width: 32px;
                height: 32px;
            }
            .oh-dropzone-text {
                font-size: 0.8rem;
                color: #64748b;
                font-weight: 500;
            }
            .oh-dropzone-sub {
                font-size: 0.7rem;
                color: #94a3b8;
            }
            .oh-loading {
                text-align: center;
                color: #64748b;
                padding: 20px;
                font-size: 0.85rem;
            }
            .oh-error {
                color: #ef4444;
                background: #fef2f2;
                border: 1px solid #fca5a5;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.8rem;
                text-align: center;
            }

            @media (max-width: 600px) {
                .order-history-content {
                    width: 96%;
                    max-height: 92vh;
                }
                .oh-header {
                    padding: 10px 14px;
                }
                .oh-title {
                    font-size: 0.92rem;
                }
                .oh-body {
                    padding: 10px;
                    gap: 10px;
                }
                .oh-summary-grid {
                    grid-template-columns: 1fr;
                    gap: 6px;
                }
                .oh-card {
                    padding: 6px 10px;
                }
                .oh-card-label {
                    font-size: 0.65rem;
                }
                .oh-card-value {
                    font-size: 0.98rem;
                }
                .oh-card-sub {
                    font-size: 0.62rem;
                }
                .oh-chart-wrapper {
                    height: 100px;
                    margin-bottom: 24px;
                    padding-top: 12px;
                    gap: 2px;
                }
                .oh-chart-label {
                    font-size: 0.52rem;
                }
                .oh-section {
                    padding: 10px;
                    gap: 10px;
                    border-radius: 10px;
                }
                .oh-section-title {
                    font-size: 0.78rem;
                }
                .oh-breakdown-header {
                    font-size: 0.72rem;
                }
                .oh-breakdown-count {
                    font-size: 0.65rem;
                }
                .oh-table th {
                    padding: 6px 4px;
                    font-size: 0.62rem;
                }
                .oh-table td {
                    padding: 5px 4px;
                    font-size: 0.6rem;
                    font-weight: normal !important;
                }
                .oh-item-title-col {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-weight: 500 !important;
                }
                .oh-table th:first-child {
                    width: 75px !important;
                }
                .oh-table th:last-child {
                    width: 65px !important;
                }
                .oh-precautions {
                    font-size: 0.65rem !important;
                    padding: 10px 12px !important;
                }
                .oh-how-to-download button {
                    font-size: 0.68rem !important;
                    padding: 8px 12px !important;
                }
                #oh-instructions-content {
                    font-size: 0.65rem !important;
                }
                .oh-dropzone-text {
                    font-size: 0.72rem;
                }
                .oh-dropzone-sub {
                    font-size: 0.62rem;
                }
                .oh-loading {
                    font-size: 0.72rem;
                    padding: 12px;
                }
            }
        </style>
        <div class="order-history-content">
            <div class="oh-header">
                <div class="oh-title-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="oh-title-icon"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    <h2 class="oh-title">${titleText}</h2>
                </div>
                <button class="oh-close-btn" id="oh-btn-close">&times;</button>
            </div>
            <div class="oh-body" id="oh-body-container">
                <div class="oh-loading" id="oh-status-msg">결제 데이터를 로드하는 중...</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    history.pushState({ modalOpen: 'orderHistory' }, "");

    let isClosing = false;
    const closeMenu = () => {
        if (isClosing) return;
        isClosing = true;
        delete state._ohData;
        delete state._ohRates;
        delete state._ohPhase;
        if (history.state && history.state.modalOpen === 'orderHistory') {
            history.back();
        } else {
            modal.remove();
        }
    };

    document.getElementById('oh-btn-close').onclick = closeMenu;
    modal.onclick = (e) => {
        if (e.target === modal) closeMenu();
    };

    // Render upload form directly
    renderUploadForm();
}

function parsePrice(priceStr) {
    if (!priceStr) return { currency: '?', amount: 0 };
    // Remove commas
    const clean = priceStr.replace(/,/g, '');
    // Regex matches the currency symbol and numeric part
    const match = clean.match(/^([^0-9\s-]+)?\s*(-?\d+)/);
    if (match) {
        let currency = (match[1] || '').trim();
        if (currency.includes('¥')) currency = '¥';
        return {
            currency,
            amount: parseInt(match[2], 10)
        };
    }
    return { currency: '', amount: 0 };
}

function formatDate(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString(state.currentLang === 'ko' ? 'ko-KR' : state.currentLang === 'ja' ? 'ja-JP' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return isoString.split('T')[0];
    }
}

function renderUploadForm(errorMessage = '') {
    const container = document.getElementById('oh-body-container');
    if (!container) return;

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';

    const uploadText = isJa ? 'Google Play決済履歴(Order History.json)ファイルをドラッグ＆ドロップするか、クリックしてアップロードしてください。' : isEn ? 'Drag & drop Google Play payment history (Order History.json) here or click to upload.' : '구글 플레이 결제 내역(Order History.json) 파일을 이곳에 드래그하거나 클릭하여 선택해 주세요.';
    const subText = isJa ? '※ Google Takeoutからエクスポートしたファイルを選択します。' : isEn ? '※ Exported from Google Takeout.' : '※ Google 테이크아웃에서 내보낸 JSON 형식의 결제 내역 파일입니다.';

    let precautionsHTML = '';
    if (isJa) {
        precautionsHTML = `
            <div class="oh-precautions" style="margin-top: 16px; font-size: 0.75rem; color: #64748b; text-align: left; line-height: 1.5; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; border-left: 3px solid #cbd5e1;">
                <div style="font-weight: 700; color: #475569; margin-bottom: 6px;">⚠️ アップロードに関する注意事項</div>
                <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px;">
                    <li>アップロードされたJSONファイルはサーバーに送信・保存されず、ブラウザ内でローカルに安全に解析されます。</li>
                    <li><a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google Takeout</a>からエクスポートした <code>Order History.json</code> ファイルのみサポートされています。</li>
                    <li>全体の履歴から<strong>学園アイドルマスター</strong>関連の課金額および払戻額のみを自動的に抽出して集計します。</li>
                    <li style="color: #e11d48; font-weight: 600;">本ファイルには決済商品名、日付などの個人情報が含まれているため、第三者へ配布・共有しないようご注意ください。</li>
                </ul>
            </div>
        `;
    } else if (isEn) {
        precautionsHTML = `
            <div class="oh-precautions" style="margin-top: 16px; font-size: 0.75rem; color: #64748b; text-align: left; line-height: 1.5; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; border-left: 3px solid #cbd5e1;">
                <div style="font-weight: 700; color: #475569; margin-bottom: 6px;">⚠️ Important Notes</div>
                <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px;">
                    <li>Your uploaded JSON file is processed locally in the browser and is never uploaded or saved on any servers.</li>
                    <li>Only the <code>Order History.json</code> file exported from <a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google Takeout</a> is supported.</li>
                    <li>Filters and calculates payment/refund data specifically for <strong>Gakuen Idolmaster</strong> items.</li>
                    <li style="color: #e11d48; font-weight: 600;">This file contains personal transaction details, so please be careful not to distribute or share it with others.</li>
                </ul>
            </div>
        `;
    } else {
        precautionsHTML = `
            <div class="oh-precautions" style="margin-top: 16px; font-size: 0.75rem; color: #64748b; text-align: left; line-height: 1.5; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; border-left: 3px solid #cbd5e1;">
                <div style="font-weight: 700; color: #475569; margin-bottom: 6px;">⚠️ 업로드 시 주의 사항</div>
                <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px;">
                    <li>업로드하신 JSON 파일은 서버로 전송되거나 저장되지 않으며, 오직 브라우저 내에서 로컬로만 안전하게 분석됩니다.</li>
                    <li><a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google 테이크아웃 서비스</a>에서 내보낸 결제 서비스 정보 중 <code>Order History.json</code> 파일만 지원합니다.</li>
                    <li>구글 플레이 결제 건 중 <strong>학원 아이돌 마스터</strong> 관련 결제 및 환불 내역만 자동으로 감지하여 집계합니다.</li>
                    <li style="color: #e11d48; font-weight: 600;">해당 파일에는 결제 정보 등 개인정보가 포함되어 있으므로 타인에게 공유하거나 다른 곳에 업로드하지 않도록 주의해 주세요.</li>
                </ul>
            </div>
        `;
    }

    let instructionsHTML = '';
    if (isJa) {
        instructionsHTML = `
            <div class="oh-how-to-download" style="margin-top: 12px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff;">
                <button id="oh-btn-toggle-instructions" style="width: 100%; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: none; outline: none; cursor: pointer; text-align: left; font-size: 0.75rem; font-weight: 700; color: #475569; transition: background-color 0.2s;">
                    <span>Order History.jsonファイルのダウンロード方法</span>
                    <svg id="oh-instructions-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(0deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div id="oh-instructions-content" style="max-height: 0; overflow: hidden; transition: max-height 0.25s ease-out; background: #fff; font-size: 0.72rem; color: #64748b;">
                    <div style="padding: 16px; line-height: 1.5; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">1. Google Takeoutにアクセス & 選択をすべて解除</div>
                            <div style="color: #64748b; margin-bottom: 4px;"><a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google Takeout</a> にアクセスし、「選択をすべて解除」をクリックします。</div>
                            <img src="images/order1.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 1">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">2. Google Playストアをチェック</div>
                            <div style="color: #64748b; margin-bottom: 4px;">リストから「Google Play ストア」を探し、チェックボックスを選択します。</div>
                            <img src="images/order2.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 2">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">3. エクスポート形式をJSONに変更</div>
                            <div style="color: #64748b; margin-bottom: 4px;">「すべてのHTML形式が含まれています」ボタンを押し、データの形式を「JSON」に変更して確定します。</div>
                            <img src="images/order3.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 3">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">4. エクスポートの作成</div>
                            <div style="color: #64748b; margin-bottom: 4px;">一番下までスクロールして「次のステップ」を押し、「エクスポートを作成」をクリックします。</div>
                            <img src="images/order4.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 4">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">5. ファイルをダウンロードしてアップロード</div>
                            <div style="color: #64748b; margin-bottom: 4px;">エクスポート完了後にファイルをダウンロードして解凍し、<code>Order History.json</code> をここにアップロードします。</div>
                            <img src="images/order5.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 5">
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (isEn) {
        instructionsHTML = `
            <div class="oh-how-to-download" style="margin-top: 12px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff;">
                <button id="oh-btn-toggle-instructions" style="width: 100%; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: none; outline: none; cursor: pointer; text-align: left; font-size: 0.75rem; font-weight: 700; color: #475569; transition: background-color 0.2s;">
                    <span>How to download Order History.json file</span>
                    <svg id="oh-instructions-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(0deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div id="oh-instructions-content" style="max-height: 0; overflow: hidden; transition: max-height 0.25s ease-out; background: #fff; font-size: 0.72rem; color: #64748b;">
                    <div style="padding: 16px; line-height: 1.5; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">1. Access Google Takeout & Deselect all</div>
                            <div style="color: #64748b; margin-bottom: 4px;">Go to <a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google Takeout</a> and click "Deselect all".</div>
                            <img src="images/order1.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 1">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">2. Select Google Play Store</div>
                            <div style="color: #64748b; margin-bottom: 4px;">Find "Google Play Store" in the list and check its box.</div>
                            <img src="images/order2.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 2">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">3. Change format to JSON</div>
                            <div style="color: #64748b; margin-bottom: 4px;">Click "Multiple formats" under Google Play Store, change the billing format to "JSON", and confirm.</div>
                            <img src="images/order3.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 3">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">4. Proceed & Create Export</div>
                            <div style="color: #64748b; margin-bottom: 4px;">Scroll to the bottom, click "Next step", and then click "Create export".</div>
                            <img src="images/order4.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 4">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">5. Download and Upload the file</div>
                            <div style="color: #64748b; margin-bottom: 4px;">Once export is complete, download and extract the archive. Upload <code>Order History.json</code> here.</div>
                            <img src="images/order5.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 5">
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        instructionsHTML = `
            <div class="oh-how-to-download" style="margin-top: 12px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff;">
                <button id="oh-btn-toggle-instructions" style="width: 100%; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: none; outline: none; cursor: pointer; text-align: left; font-size: 0.75rem; font-weight: 700; color: #475569; transition: background-color 0.2s;">
                    <span>Order History.json 파일 다운받는 법</span>
                    <svg id="oh-instructions-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(0deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div id="oh-instructions-content" style="max-height: 0; overflow: hidden; transition: max-height 0.25s ease-out; background: #fff; font-size: 0.72rem; color: #64748b;">
                    <div style="padding: 16px; line-height: 1.5; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">1. Google 테이크아웃 접속 & 선택 해제</div>
                            <div style="color: #64748b; margin-bottom: 4px;"><a href="https://takeout.google.com/" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Google 테이크아웃</a> 페이지에 접속한 뒤, '선택 해제' 버튼을 클릭합니다.</div>
                            <img src="images/order1.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 1">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">2. Google Play 스토어 항목 체크</div>
                            <div style="color: #64748b; margin-bottom: 4px;">목록을 내려 'Google Play 스토어' 항목을 찾아 우측 체크박스를 선택합니다.</div>
                            <img src="images/order2.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 2">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">3. 다음 단계 클릭</div>
                            <div style="color: #64748b; margin-bottom: 4px;">맨 하단에 있는 '다음 단계' 버튼을 누릅니다.</div>
                            <img src="images/order3.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 3">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">4. 내보내기 단계 진행 및 생성</div>
                            <div style="color: #64748b; margin-bottom: 4px;">파일 형식 및 전송 방법을 확인하고 '내보내기 생성'을 클릭합니다.</div>
                            <img src="images/order4.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 4">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            <div style="font-weight: 700; color: #334155;">5. 파일 다운로드 및 업로드</div>
                            <div style="color: #64748b; margin-bottom: 4px;">이메일 등으로 생성 완료 알림을 받으면 다운로드하여 압축을 푼 뒤, <code>Order History.json</code> 파일을 업로드합니다.</div>
                            <img src="images/order5.webp" style="max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; display: block;" alt="Step 5">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        ${errorMessage ? `<div class="oh-error">${errorMessage}</div>` : ''}
        <div class="oh-dropzone" id="oh-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="oh-dropzone-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <div class="oh-dropzone-text">${uploadText}</div>
            <div class="oh-dropzone-sub">${subText}</div>
            <input type="file" id="oh-file-input" accept=".json" style="display: none;">
        </div>
        ${precautionsHTML}
        ${instructionsHTML}
    `;

    const dropzone = document.getElementById('oh-dropzone');
    const fileInput = document.getElementById('oh-file-input');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });
    }

    // Toggle collapsible instructions
    const toggleBtn = document.getElementById('oh-btn-toggle-instructions');
    const content = document.getElementById('oh-instructions-content');
    const arrow = document.getElementById('oh-instructions-arrow');

    if (toggleBtn && content && arrow) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = content.style.maxHeight === '0px' || content.style.maxHeight === '';
            if (isCollapsed) {
                content.style.maxHeight = '3000px';
                arrow.style.transform = 'rotate(180deg)';
                toggleBtn.style.backgroundColor = '#f1f5f9';
            } else {
                content.style.maxHeight = '0px';
                arrow.style.transform = 'rotate(0deg)';
                toggleBtn.style.backgroundColor = '#f8fafc';
            }
        });
    }
}


function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            // Verify format
            if (!Array.isArray(data)) {
                throw new Error(state.currentLang === 'ko' ? '올바른 결제 내역 JSON 배열 형식이 아닙니다.' : 'Invalid payment history JSON format.');
            }
            const container = document.getElementById('oh-body-container');
            if (container) {
                container.innerHTML = `<div class="oh-loading">${state.currentLang === 'ko' ? '데이터 분석 중...' : 'Analyzing data...'}</div>`;
            }
            // Tiny timeout to let the loader render
            setTimeout(() => {
                prepareAndRenderDashboard(data);
            }, 50);
        } catch (err) {
            renderUploadForm(err.message || 'JSON 파싱 오류가 발생했습니다.');
        }
    };
    reader.onerror = () => {
        renderUploadForm('파일을 읽는 도중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
}

function prepareAndRenderDashboard(data) {
    // Cache data for re-rendering on navigation/page change
    state._ohData = data;
    renderDashboard(data);
}

function renderDashboard(data) {
    const container = document.getElementById('oh-body-container');
    if (!container) return;

    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';

    const overallMinDate = new Date(2024, 4, 16); // May 16, 2024 local time
    let overallMaxDate = null;

    // Parse transactions
    const transactions = [];

    data.forEach(item => {
        const oh = item.orderHistory;
        if (!oh) return;

        const rawTitle = oh.lineItem && oh.lineItem[0] && oh.lineItem[0].doc ? oh.lineItem[0].doc.title : 'Unknown Item';
        if (!rawTitle.includes('学園アイドルマスター')) {
            return;
        }

        const date = new Date(oh.creationTime);
        if (!overallMaxDate || date > overallMaxDate) {
            overallMaxDate = date;
        }

        const rawPrice = oh.totalPrice;
        const { currency, amount } = parsePrice(rawPrice);

        const rawRefund = oh.refundAmount;
        const { amount: refundAmount } = parsePrice(rawRefund);

        if (refundAmount >= amount && amount > 0) {
            return;
        }

        const title = translateItemTitle(rawTitle);

        transactions.push({
            orderId: oh.orderId,
            date: oh.creationTime,
            title,
            currency: currency || '₩',
            amount: amount,
            refundAmount: refundAmount,
            isRefunded: refundAmount >= amount && amount > 0
        });
    });

    // Group stats by currency
    const totalByCurrency = {};
    const countByCurrency = {};
    const refundByCurrency = {};

    transactions.forEach(t => {
        if (!totalByCurrency[t.currency]) {
            totalByCurrency[t.currency] = 0;
            countByCurrency[t.currency] = 0;
            refundByCurrency[t.currency] = 0;
        }
        totalByCurrency[t.currency] += t.amount;
        countByCurrency[t.currency]++;
        refundByCurrency[t.currency] += t.refundAmount;
    });

    let summaryHTML = '';
    const currencies = Object.keys(totalByCurrency);
    if (currencies.length > 0) {
        currencies.forEach(curr => {
            const total = totalByCurrency[curr];
            const count = countByCurrency[curr];
            const refund = refundByCurrency[curr];
            const net = total - refund;
            const avg = count > 0 ? Math.round(net / count) : 0;
            const formatNum = (num) => num.toLocaleString();

            const sumLabel = isJa ? `総課金額 (${curr})` : isEn ? `Total Spent (${curr})` : `총 결제 금액 (${curr})`;
            const countLabel = isJa ? '決済回数' : isEn ? 'Transactions' : '결제 횟수';
            const avgLabel = isJa ? `平均決済額 (${curr})` : isEn ? `Average Spent (${curr})` : `평균 결제액 (${curr})`;
            const refundLabel = isJa ? '払戻額' : isEn ? 'Refunded' : '환불 금액';

            summaryHTML += `
                <div class="oh-card">
                    <span class="oh-card-label">${sumLabel}</span>
                    <span class="oh-card-value">${curr} ${formatNum(net)}</span>
                    <span class="oh-card-sub">${refund > 0 ? `${refundLabel}: ${curr} ${formatNum(refund)}` : '&nbsp;'}</span>
                </div>
                <div class="oh-card">
                    <span class="oh-card-label">${countLabel}</span>
                    <span class="oh-card-value">${isJa ? `${count}回` : isEn ? `${count}` : `${count}회`}</span>
                    <span class="oh-card-sub">&nbsp;</span>
                </div>
                <div class="oh-card">
                    <span class="oh-card-label">${avgLabel}</span>
                    <span class="oh-card-value">${curr} ${formatNum(avg)}</span>
                    <span class="oh-card-sub">&nbsp;</span>
                </div>
            `;
        });
    }

    // Monthly Spend Chart
    const monthlySpend = {};
    transactions.forEach(t => {
        if (t.isRefunded) return; // skip fully refunded
        const monthKey = t.date.substring(0, 7); // YYYY-MM
        if (!monthlySpend[monthKey]) {
            monthlySpend[monthKey] = {};
        }
        if (!monthlySpend[monthKey][t.currency]) {
            monthlySpend[monthKey][t.currency] = 0;
        }
        monthlySpend[monthKey][t.currency] += (t.amount - t.refundAmount);
    });

    // Selected Phase for Chart Navigation (2-year intervals ending at overallMaxDate)
    const endBaseDate = overallMaxDate ? new Date(overallMaxDate) : new Date();
    endBaseDate.setDate(1);

    const startLimitDate = new Date(2024, 4, 1); // May 2024
    const totalMonths = (endBaseDate.getFullYear() - startLimitDate.getFullYear()) * 12 + (endBaseDate.getMonth() - startLimitDate.getMonth()) + 1;
    const maxPhase = Math.max(1, Math.ceil(totalMonths / 24));

    if (!state._ohPhase) {
        state._ohPhase = maxPhase;
    }
    const currentPhase = state._ohPhase;

    // Generate exactly 24 months for the selected phase, ending at offset of currentPhase
    const offsetMonths = (maxPhase - currentPhase) * 24;
    const phaseEndDate = new Date(endBaseDate);
    phaseEndDate.setMonth(phaseEndDate.getMonth() - offsetMonths);

    const allMonths = [];
    const tempDate = new Date(phaseEndDate);
    tempDate.setMonth(tempDate.getMonth() - 23);

    for (let i = 0; i < 24; i++) {
        const y = tempDate.getFullYear();
        const m = String(tempDate.getMonth() + 1).padStart(2, '0');
        allMonths.push(`${y}-${m}`);
        tempDate.setMonth(tempDate.getMonth() + 1);
    }

    let chartHTML = '';
    if (allMonths.length > 0) {
        // find max amount for percentage height
        // for simplicity, we focus on the primary currency found (usually JPY/¥)
        const primaryCurr = currencies[0] || '¥';
        let maxMonthAmount = 1;
        allMonths.forEach(m => {
            const amt = monthlySpend[m] ? (monthlySpend[m][primaryCurr] || 0) : 0;
            if (amt > maxMonthAmount) maxMonthAmount = amt;
        });

        allMonths.forEach(m => {
            const amt = monthlySpend[m] ? (monthlySpend[m][primaryCurr] || 0) : 0;
            const pct = Math.max(4, Math.round((amt / maxMonthAmount) * 100));
            const formatNum = (num) => num.toLocaleString();

            const yShort = m.substring(2, 4);
            const mNum = parseInt(m.substring(5));
            const labelStr = `${yShort}/${m.substring(5)}`;
            const tooltipTitle = isJa ? `${m.substring(0, 4)}年 ${mNum}月` : isEn ? m : `${m.substring(0, 4)}년 ${mNum}월`;

            chartHTML += `
                <div class="oh-chart-bar-container">
                    <div class="oh-chart-bar" style="height: ${pct}%;">
                        <div class="oh-chart-tooltip">
                            ${tooltipTitle}<br>
                            ${primaryCurr} ${formatNum(amt)}
                        </div>
                    </div>
                    <span class="oh-chart-label">${labelStr}</span>
                </div>
            `;
        });
    }

    // Itemized Breakdown
    const itemSpend = {};
    transactions.forEach(t => {
        if (!itemSpend[t.title]) {
            itemSpend[t.title] = { count: 0, total: 0, currency: t.currency };
        }
        itemSpend[t.title].count++;
        itemSpend[t.title].total += (t.amount - t.refundAmount);
    });

    const sortedItems = Object.keys(itemSpend).map(name => ({
        name,
        count: itemSpend[name].count,
        total: itemSpend[name].total,
        currency: itemSpend[name].currency
    })).sort((a, b) => b.total - a.total);

    let breakdownHTML = '';
    if (sortedItems.length > 0) {
        const maxItemTotal = sortedItems[0].total || 1;
        sortedItems.forEach(item => {
            if (item.total <= 0) return;
            const pct = Math.round((item.total / maxItemTotal) * 100);
            const formatNum = (num) => num.toLocaleString();

            breakdownHTML += `
                <div class="oh-breakdown-item">
                    <div class="oh-breakdown-header">
                        <span class="oh-breakdown-name" title="${item.name}">${item.name}</span>
                        <div class="oh-breakdown-stats">
                            <span class="oh-breakdown-count">${item.count}회 구매</span>
                            <span>${item.currency} ${formatNum(item.total)}</span>
                        </div>
                    </div>
                    <div class="oh-progress-bg">
                        <div class="oh-progress-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        });
    }

    // Timeline Table Rows
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    let tableRowsHTML = '';
    sortedTransactions.forEach((t, index) => {
        const formatNum = (num) => num.toLocaleString();
        const refundTag = t.refundAmount > 0 ? `
            <span class="oh-refund-tag">환불 (${t.currency}${formatNum(t.refundAmount)})</span>
        ` : '';
        tableRowsHTML += `
            <tr class="oh-table-row" data-title="${t.title.toLowerCase()}">
                <td style="white-space: nowrap;">${formatDate(t.date)}</td>
                <td class="oh-item-title-col">${t.title}${refundTag}</td>
                <td style="text-align: right; font-weight: 700; white-space: nowrap;">
                    ${t.currency} ${formatNum(t.amount)}
                </td>
            </tr>
        `;
    });

    const dashTitleSummary = isJa ? '決済概要' : isEn ? 'Overview' : '결제 요약';
    const dashTitleMonthly = isJa ? '月別決済推移' : isEn ? 'Monthly Spending' : '월별 결제 금액 추이';
    const dashTitleBreakdown = isJa ? '商品別統計' : isEn ? 'Item breakdown' : '아이템별 구매 통계';
    const dashTitleHistory = isJa ? '詳細履歴' : isEn ? 'Detailed History' : '상세 결제 내역';
    const dateRangeLabel = isJa ? '期間' : isEn ? 'Period' : '분석 기간';

    const pad2 = n => String(n).padStart(2, '0');
    const formatDateText = d => `${d.getFullYear()}.${pad2(d.getMonth()+1)}.${pad2(d.getDate())}`;
    const startStr = formatDateText(overallMinDate);
    const endStr = formatDateText(overallMaxDate);

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: -8px; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">
                ${dateRangeLabel}: ${startStr} ~ ${endStr}
            </div>
        </div>

        <div class="oh-summary-grid">
            ${summaryHTML}
        </div>

        <div class="oh-section">
            <h3 class="oh-section-title" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    ${dashTitleMonthly} (${allMonths[0].replace('-', '.')} ~ ${allMonths[allMonths.length - 1].replace('-', '.')})
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button id="oh-chart-prev-year" class="oh-btn-nav" ${currentPhase <= 1 ? 'disabled' : ''}>&lt;</button>
                    <button id="oh-chart-next-year" class="oh-btn-nav" ${currentPhase >= maxPhase ? 'disabled' : ''}>&gt;</button>
                </div>
            </h3>
            <div class="oh-chart-wrapper">
                ${chartHTML || '<div style="color: #94a3b8; font-size: 0.8rem; margin: auto;">차트 데이터가 없습니다.</div>'}
            </div>
        </div>

        <div class="oh-section">
            <h3 class="oh-section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                ${dashTitleBreakdown}
            </h3>
            <div class="oh-breakdown-list">
                ${breakdownHTML || '<div style="color: #94a3b8; font-size: 0.8rem;">통계 데이터가 없습니다.</div>'}
            </div>
        </div>

        <div class="oh-section">
            <h3 class="oh-section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                ${dashTitleHistory}
            </h3>
            <div class="oh-table-wrapper" style="max-height: 400px;">
                <table class="oh-table">
                    <thead>
                        <tr>
                            <th style="width: 100px;">날짜</th>
                            <th>상품명</th>
                            <th style="text-align: right; width: 100px;">결제 금액</th>
                        </tr>
                    </thead>
                    <tbody id="oh-table-body">
                        ${tableRowsHTML}
                    </tbody>
                </table>
            </div>
        </div>

    `;

    // Bind chart year navigation buttons
    const btnPrev = document.getElementById('oh-chart-prev-year');
    const btnNext = document.getElementById('oh-chart-next-year');
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            if (state._ohPhase > 1) {
                state._ohPhase--;
                renderDashboard(state._ohData);
            }
        });
        btnNext.addEventListener('click', () => {
            if (state._ohPhase < maxPhase) {
                state._ohPhase++;
                renderDashboard(state._ohData);
            }
        });
    }
}



