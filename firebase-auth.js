// firebase-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 구글 파이어베이스 설정값 (전달해주신 비밀 열쇠 키)
const firebaseConfig = {
    apiKey: "AIzaSyBFcY7VDtHvYLxXxMG_9q_sbZHD6sFoT8g",
    authDomain: "gakumasnote.firebaseapp.com",
    projectId: "gakumasnote",
    storageBucket: "gakumasnote.firebasestorage.app",
    messagingSenderId: "506036204956",
    appId: "1:506036204956:web:7e01b934f0006ebc184459",
    measurementId: "G-KF7J9WQHWQ"
};

// 파이어베이스 및 로그인 도구 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/**
 * 구글 팝업 로그인을 실행하는 함수
 */
export function loginWithGoogle() {
    return signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("로그인 성공:", user.displayName);
            return user;
        })
        .catch((error) => {
            console.error("로그인 에러:", error);
            throw error;
        });
}

/**
 * 로그아웃을 실행하는 함수
 */
export function logout() {
    return signOut(auth)
        .then(() => {
            console.log("로그아웃 완료");
        })
        .catch((error) => {
            console.error("로그아웃 에러:", error);
            throw error;
        });
}

export { auth, onAuthStateChanged, db };
