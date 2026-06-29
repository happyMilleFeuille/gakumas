// firebase-sync-modal.js
import { state } from './state.js';

// 다국어 번역 딕셔너리
const translations = {
    ko: {
        title: "구글 계정 연동 설정",
        desc: "현재 브라우저에 임시로 저장된 로컬 세팅(서포카 설정, 계산기 프리셋 등)이 있습니다. 이 데이터를 구글 계정에 연동하여 덮어쓰겠습니까?",
        warning: "※ '아니오'를 선택하시면 구글 계정은 기본값(빈 상태)로 시작됩니다. (로컬 세팅은 지워지지 않고 로그아웃 시 다시 돌아옵니다.)",
        yesBtn: "예 (현재 로컬 데이터 연동하기)",
        noBtn: "아니오 (계정 새로 시작하기)",
        syncing: "데이터 동기화 중..."
    },
    ja: {
        title: "Googleアカウント連携設定",
        desc: "現在ブラウザに一時的に保存されているローカル設定（サポカ設定、計算機プリセットなど）があります。このデータをGoogleアカウントに連携して上書きしますか？",
        warning: "※「いいえ」を選択すると、Googleアカウントはデフォルト（空の状態）で開始されます。（ローカル設定は削除されず、ログアウト時に復元されます）",
        yesBtn: "はい（現在のローカルデータを連携する）",
        noBtn: "いいえ（アカウントを新しく開始する）",
        syncing: "データを同期中..."
    },
    en: {
        title: "Google Account Sync Settings",
        desc: "There are temporary local settings (support card settings, calculator presets, etc.) saved in this browser. Would you like to link and overwrite this data to your Google account?",
        warning: "※ If you select 'No', the Google account will start with default (empty) settings. (Local settings will not be deleted and will be restored when you log out.)",
        yesBtn: "Yes (Link Current Local Data)",
        noBtn: "No (Start Fresh on Account)",
        syncing: "Syncing data..."
    }
};

// 스타일 동적 추가 (CSS keyframes 및 트랜지션 지원)
const style = document.createElement('style');
style.textContent = `
    .sync-modal-overlay {
        position: fixed;
        z-index: 31000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .sync-modal-overlay.active {
        opacity: 1;
    }
    .sync-modal-container {
        background: #ffffff;
        width: 90%;
        max-width: 440px;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        padding: 26px 24px;
        box-sizing: border-box;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        gap: 18px;
    }
    .sync-modal-overlay.active .sync-modal-container {
        transform: scale(1);
    }
    .sync-modal-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .sync-modal-accent-bar {
        width: 4px;
        height: 18px;
        background-color: #ff4d8d;
        border-radius: 2px;
    }
    .sync-modal-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: #222222;
        letter-spacing: -0.02em;
    }
    .sync-modal-body {
        font-size: 0.88rem;
        line-height: 1.6;
        color: #4a4a4a;
        word-break: keep-all;
    }
    .sync-modal-warning {
        font-size: 0.78rem;
        line-height: 1.5;
        color: #777777;
        background: #fff0f5;
        border: 1px dashed #ffc0cb;
        padding: 12px;
        border-radius: 10px;
        word-break: keep-all;
    }
    .sync-modal-actions {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-top: 5px;
    }
    .sync-btn {
        padding: 11px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        font-family: inherit;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
    }
    .sync-btn-confirm {
        background: #ff4d8d;
        color: white;
        box-shadow: 0 4px 10px rgba(255, 77, 141, 0.25);
    }
    .sync-btn-confirm:hover {
        background: #e03b77;
        box-shadow: 0 4px 14px rgba(255, 77, 141, 0.35);
    }
    .sync-btn-cancel {
        background: #f5f5f5;
        color: #666666;
    }
    .sync-btn-cancel:hover {
        background: #e8e8e8;
        color: #444444;
    }
    .sync-spinner-wrapper {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px 0;
    }
    .sync-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(255, 77, 141, 0.1);
        border-radius: 50%;
        border-top-color: #ff4d8d;
        animation: sync-spin 0.8s linear infinite;
    }
    .sync-spinner-text {
        font-size: 0.85rem;
        color: #ff4d8d;
        font-weight: 700;
    }
    @keyframes sync-spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

/**
 * 첫 로그인 시 세팅 병합 여부를 묻는 모달을 띄웁니다.
 * @param {Object} param
 * @param {Function} param.onConfirm - '예, 현재 데이터 연동'을 선택했을 때 실행할 비동기 액션
 * @param {Function} param.onCancel - '아니오, 계정 새로 시작'을 선택했을 때 실행할 액션
 */
export function showSyncMergeModal({ onConfirm, onCancel }) {
    const currentLang = state.currentLang || 'ko';
    const t = translations[currentLang] || translations.ko;

    const overlay = document.createElement('div');
    overlay.className = 'sync-modal-overlay';

    overlay.innerHTML = `
        <div class="sync-modal-container">
            <div class="sync-modal-header">
                <div class="sync-modal-accent-bar"></div>
                <div class="sync-modal-title">${t.title}</div>
            </div>
            <div class="sync-modal-body">
                ${t.desc}
            </div>
            <div class="sync-modal-warning">
                ${t.warning}
            </div>
            <div class="sync-modal-actions">
                <button class="sync-btn sync-btn-confirm">${t.yesBtn}</button>
                <button class="sync-btn sync-btn-cancel">${t.noBtn}</button>
            </div>
            <div class="sync-spinner-wrapper">
                <div class="sync-spinner"></div>
                <div class="sync-spinner-text">${t.syncing}</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 트랜지션 활성화
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    const btnConfirm = overlay.querySelector('.sync-btn-confirm');
    const btnCancel = overlay.querySelector('.sync-btn-cancel');
    const actionsWrapper = overlay.querySelector('.sync-modal-actions');
    const spinnerWrapper = overlay.querySelector('.sync-spinner-wrapper');

    btnConfirm.addEventListener('click', async () => {
        actionsWrapper.style.display = 'none';
        spinnerWrapper.style.display = 'flex';
        try {
            await onConfirm();
        } catch (error) {
            console.error("구글 동기화 병합 오류:", error);
            // 실패 시 버튼 원복
            actionsWrapper.style.display = 'flex';
            spinnerWrapper.style.display = 'none';
            alert("동기화 실패: " + error.message);
        }
    });

    btnCancel.addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
        onCancel();
    });
}
