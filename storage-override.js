// storage-override.js

// 제외할 로컬 키 목록
const EXCLUDED_KEYS = [
    'gakumas_note_version',
    'lang',
    'firebase:authUser',
    'sync_loaded',
    'online_', // 이미 가상 경로가 적용된 키는 매핑을 건너뜀 (중복 방지)
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

// 로컬스토리지 메소드 원본 보관
const originalGetItem = localStorage.getItem;
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

/**
 * 로그인 여부(영구 보관소 정보)에 따라 가상의 맵핑된 키 이름 반환 (네임스페이스 격리)
 */
function getMappedKey(key) {
    // 무한 루프 방지를 위해 가로채기 전 원본 메소드(originalGetItem)로 값을 읽어옵니다.
    const sessionUid = originalGetItem.call(localStorage, 'sync_loaded');
    if (sessionUid && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        return `online_${sessionUid}_${key}`;
    }
    return key;
}

// 로컬스토리지 메소드 오버라이딩 (가상 격리 라우팅)
localStorage.getItem = function(key) {
    const mappedKey = getMappedKey(key);
    return originalGetItem.call(localStorage, mappedKey);
};

localStorage.setItem = function(key, value) {
    // 로그인/로그아웃 전환 리프레시 중 발생하는 강제 데이터 저장을 무시 (단, 제외 키들은 정상 실행)
    if (sessionStorage.getItem('is_syncing_reload') === 'true' && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        return;
    }

    const mappedKey = getMappedKey(key);
    originalSetItem.call(localStorage, mappedKey, value);

    // 쓰기가 발생했을 때 동기화 감지기(firebase-sync.js)에 이벤트를 전달
    if (originalGetItem.call(localStorage, 'sync_loaded') && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        window.dispatchEvent(new CustomEvent('syncStorageUpdated'));
    }
};

localStorage.removeItem = function(key) {
    // 로그인/로그아웃 전환 리프레시 중 발생하는 강제 데이터 저장을 무시 (단, 제외 키들은 정상 실행)
    if (sessionStorage.getItem('is_syncing_reload') === 'true' && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        return;
    }

    const mappedKey = getMappedKey(key);
    originalRemoveItem.call(localStorage, mappedKey);

    // 삭제가 발생했을 때 동기화 감지기에 이벤트를 전달
    if (originalGetItem.call(localStorage, 'sync_loaded') && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        window.dispatchEvent(new CustomEvent('syncStorageUpdated'));
    }
};
