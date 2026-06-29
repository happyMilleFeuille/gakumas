// storage-override.js

// 제외할 로컬 키 목록
const EXCLUDED_KEYS = [
    'gakumas_note_version',
    'lang',
    'firebase:authUser',
    'sync_loaded',
    'online_' // 이미 가상 경로가 적용된 키는 매핑을 건너뜀 (중복 방지)
];

/**
 * 로그인 여부(세션 정보)에 따라 가상의 맵핑된 키 이름 반환 (네임스페이스 격리)
 */
function getMappedKey(key) {
    const sessionUid = sessionStorage.getItem('sync_loaded');
    if (sessionUid && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        return `online_${sessionUid}_${key}`;
    }
    return key;
}

// 로컬스토리지 메소드 오버라이딩 (가상 격리 라우팅)
const originalGetItem = localStorage.getItem;
localStorage.getItem = function(key) {
    const mappedKey = getMappedKey(key);
    return originalGetItem.call(localStorage, mappedKey);
};

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    const mappedKey = getMappedKey(key);
    originalSetItem.call(localStorage, mappedKey, value);

    // 쓰기가 발생했을 때 동기화 감지기(firebase-sync.js)에 이벤트를 전달
    if (sessionStorage.getItem('sync_loaded') && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        window.dispatchEvent(new CustomEvent('syncStorageUpdated'));
    }
};

const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
    const mappedKey = getMappedKey(key);
    originalRemoveItem.call(localStorage, mappedKey);

    // 삭제가 발생했을 때 동기화 감지기에 이벤트를 전달
    if (sessionStorage.getItem('sync_loaded') && !EXCLUDED_KEYS.some(ex => key.startsWith(ex))) {
        window.dispatchEvent(new CustomEvent('syncStorageUpdated'));
    }
};
