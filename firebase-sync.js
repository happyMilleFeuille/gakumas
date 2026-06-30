// firebase-sync.js
import { db, auth, onAuthStateChanged } from './firebase-auth.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { showSyncMergeModal } from './firebase-sync-modal.js';

let isSyncing = false; // 동기화 중 루프 방지 플래그
let saveTimeout = null;

// 제외할 설정 관련 로컬 키 목록
const EXCLUDED_KEYS = [
    'gakumas_note_version',
    'lang',
    'firebase:authUser',
    'sync_loaded',
    'online_',
    'gachaLogObj', // 가챠 로그
    'totalPullsObj', // 가챠 누적 횟수
    'gachaType', // 활성화된 가챠 탭 타입
    'jewels', // 가챠용 보유 쥬얼
    'selectedPickup', // 선택된 픽업 캐릭터
    'activeFesId', // 액티브 Fes 가챠 ID
    'activeUnitId', // 액티브 유닛 가챠 ID
    'activeSelectionId', // 액티브 셀렉션 가챠 ID
    'activeNormalId', // 액티브 일반 가챠 ID
    'activeLimitedId' // 액티브 한정 가챠 ID
];

/**
 * 동기화할 수 있는 로컬 오프라인 데이터가 로컬 스토리지에 존재하는지 확인
 */
function hasOfflineData() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
            return true;
        }
    }
    return false;
}

/**
 * 로그인된 사용자 전용 네임스페이스의 데이터만 수집하여 반환
 */
function getAllOnlineData(uid) {
    const data = {};
    const prefix = `online_${uid}_`;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
            const cleanKey = key.substring(prefix.length);
            if (!EXCLUDED_KEYS.includes(cleanKey)) {
                data[cleanKey] = localStorage.getItem(key);
            }
        }
    }
    return data;
}

/**
 * 클라우드에 데이터를 저장하는 함수 (디바운스 적용)
 */
export function triggerCloudSave() {
    const user = auth.currentUser;
    if (!user || isSyncing) return;

    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const onlineData = getAllOnlineData(user.uid);
            
            await setDoc(userDocRef, {
                data: onlineData,
                updatedAt: new Date().toISOString()
            });
            
            console.log("구글 계정 클라우드 동기화 완료");
        } catch (error) {
            console.error("클라우드 저장 에러:", error);
        }
    }, 3000); // 3초 대기 후 전송 (트래픽 최적화)
}

// storage-override.js에서 디스패치된 이벤트를 수신하여 자동 백업 실행
window.addEventListener('syncStorageUpdated', () => {
    triggerCloudSave();
});

// 로그인 상태 변경 시 처리
onAuthStateChanged(auth, async (user) => {
    // 새로고침 직전 데이터 로드로 인한 리프레시인지 확인
    const isSyncingReload = sessionStorage.getItem('is_syncing_reload') === 'true';
    sessionStorage.removeItem('is_syncing_reload');

    if (user) {
        // 방금 클라우드 데이터를 로드하고 새로고침된 직후라면 중복 패치 방지
        if (isSyncingReload) {
            return;
        }

        try {
            isSyncing = true;
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            const prefix = `online_${user.uid}_`;

            if (docSnap.exists()) {
                const cloudData = docSnap.data().data || {};
                
                // 로컬의 현재 온라인 연동 데이터 상태 수집
                const localOnlineData = getAllOnlineData(user.uid);
                
                // 로컬 데이터와 서버 데이터가 100% 동일하면 굳이 덮어쓰거나 리로드하지 않고 종료 (더블 새로고침 방지)
                const isIdentical = JSON.stringify(localOnlineData) === JSON.stringify(cloudData);
                if (isIdentical) {
                    localStorage.setItem('sync_loaded', user.uid); // 로그인 세션 키 복원
                    return;
                }

                // 기존 로컬에 남아있던 이 계정의 온라인 연동 데이터를 먼저 초기화 (삭제 반영 목적)
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                }

                // 클라우드 백업 데이터를 유저용 가상 네임스페이스 영역에 로드
                Object.keys(cloudData).forEach(key => {
                    localStorage.setItem(`${prefix}${key}`, cloudData[key]);
                });
                
                // 새로고침 직전 데이터 오염 방지 락을 걸고 새로고침 수행
                sessionStorage.setItem('is_syncing_reload', 'true');
                localStorage.setItem('sync_loaded', user.uid);
                window.location.reload();
            } else {
                // 클라우드 보관함이 완전히 비어 있는 최초 로그인의 경우
                if (hasOfflineData()) {
                    isSyncing = false; // 모달 활성화 중 플래그 해제하여 버튼 클릭 이벤트 보장
                    showSyncMergeModal({
                        onConfirm: async () => {
                            try {
                                const onlineData = {};
                                // 기존 오프라인 데이터를 온라인용 네임스페이스 키로 변환하여 복사
                                for (let i = 0; i < localStorage.length; i++) {
                                    const key = localStorage.key(i);
                                    if (key && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
                                        const value = localStorage.getItem(key);
                                        localStorage.setItem(`${prefix}${key}`, value);
                                        onlineData[key] = value;
                                    }
                                }
                                
                                // Firestore에 데이터를 즉시 동기화 저장
                                await setDoc(userDocRef, {
                                    data: onlineData,
                                    updatedAt: new Date().toISOString()
                                });
                                
                                console.log("최초 로그인: 로컬 데이터 서버 연동 완료");
                                
                                // 새로고침 락 설정 후 새로고침 수행
                                sessionStorage.setItem('is_syncing_reload', 'true');
                                localStorage.setItem('sync_loaded', user.uid);
                                window.location.reload();
                            } catch (err) {
                                console.error("서버 연동 병합 중 에러:", err);
                                throw err;
                            }
                        },
                        onCancel: () => {
                            // 로컬 세팅 무시하고 새로 시작 (클라우드 데이터는 빈 상태)
                            console.log("최초 로그인: 로컬 데이터를 연동하지 않고 새로 시작");
                            sessionStorage.setItem('is_syncing_reload', 'true');
                            localStorage.setItem('sync_loaded', user.uid);
                            window.location.reload();
                        }
                    });
                } else {
                    // 연동할 로컬 데이터가 없는 경우 즉시 새로고침하여 시작
                    console.log("로컬 데이터가 없는 클린 계정으로 즉시 시작합니다.");
                    sessionStorage.setItem('is_syncing_reload', 'true');
                    localStorage.setItem('sync_loaded', user.uid);
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("클라우드 데이터 로드 실패:", error);
        } finally {
            isSyncing = false;
        }
    } else {
        // 로그아웃 시 온라인 세션 정보 제거 및 화면 리프레시를 통해 오프라인 기기 데이터로 원상 복구
        if (localStorage.getItem('sync_loaded')) {
            sessionStorage.setItem('is_syncing_reload', 'true');
            localStorage.removeItem('sync_loaded');
            window.location.reload();
        }
    }
});
