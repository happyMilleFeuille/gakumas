// firebase-sync.js
import { db, auth, onAuthStateChanged } from './firebase-auth.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let isSyncing = false; // 동기화 중 루프 방지 플래그
let saveTimeout = null;

// 제외할 설정 관련 로컬 키 목록
const EXCLUDED_KEYS = [
    'gakumas_note_version',
    'lang',
    'firebase:authUser',
    'sync_loaded',
    'online_'
];

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
            data[cleanKey] = localStorage.getItem(key);
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
            }, { merge: true });
            
            console.log("구글 계정 클라우드 동기화 완료");
        } catch (error) {
            console.error("클라우드 저장 에러:", error);
        }
    }, 2000);
}

// storage-override.js에서 디스패치된 이벤트를 수신하여 자동 백업 실행
window.addEventListener('syncStorageUpdated', () => {
    triggerCloudSave();
});

// 로그인 상태 변경 시 처리
onAuthStateChanged(auth, async (user) => {
    // 페이지 로드가 끝났으므로 새로고침 데이터 오염 방지 락 해제
    sessionStorage.removeItem('is_syncing_reload');

    if (user) {
        // 이미 동기화가 완료되어 리프레시된 세션이면 중복 작업 방지
        if (localStorage.getItem('sync_loaded') === user.uid) {
            return;
        }

        try {
            isSyncing = true;
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            const prefix = `online_${user.uid}_`;

            if (docSnap.exists()) {
                const cloudData = docSnap.data().data || {};
                // 클라우드 백업 데이터를 유저용 가상 네임스페이스 영역에 로드
                Object.keys(cloudData).forEach(key => {
                    localStorage.setItem(`${prefix}${key}`, cloudData[key]);
                });
            } else {
                // 클라우드 보관함이 완전히 비어 있는 최초 로그인의 경우
                // 기기의 기존 로컬 데이터는 전혀 건드리지 않고, 구글 계정 영역은 빈(0) 상태로 시작!
                console.log("구글 계정 영역이 비어 있습니다. 0부터 새로운 세션을 시작합니다.");
            }

            // 새로고침 직전 데이터 오염 방지 락을 걸고 새로고침 수행
            sessionStorage.setItem('is_syncing_reload', 'true');
            localStorage.setItem('sync_loaded', user.uid);
            window.location.reload();
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
