// calcEvents.js
import { cardList } from './carddata.js';
import { showOtherTuneModal } from './calcModals.js';
import { calcStore } from './calcStore.js';

/**
 * 전역 분배기 및 카드 카운터 리스너 설정
 */
export function initGlobalDistListener(refreshAll) {
    if (window._distInit) return;
    
    document.addEventListener('click', (e) => {
        const board = document.querySelector('.unified-plan-board');
        if (!board) return;

        const cardCheckBtn = e.target.closest('.card-slot-check');
        const cardOptCheckBtn = e.target.closest('.card-opt-check');
        const cardRemoveBtn = e.target.closest('.card-slot-remove');
        const distBtn = e.target.closest('.dist-btn');
        const tuneBtn = e.target.closest('#btn-other-tune');
        const counterBtn = e.target.closest('.card-counter-btn');

        // 1. 카드 활성화 체크박스
        if (cardCheckBtn) {
            calcStore.cardChecked[cardCheckBtn.dataset.id] = cardCheckBtn.checked;
            calcStore.save();
            refreshAll();
            return;
        }

        // 1-2. 카드 엑스트라 옵션 체크박스
        if (cardOptCheckBtn) {
            calcStore.cardExtraChecked[cardOptCheckBtn.dataset.id] = cardOptCheckBtn.checked;
            calcStore.save();
            refreshAll();
            return;
        }

        // 2. 카드 슬롯에서 제거
        if (cardRemoveBtn) {
            const id = cardRemoveBtn.dataset.id;
            const plan = calcStore.planType;
            calcStore.planCards[plan] = (calcStore.planCards[plan] || []).filter(cid => cid !== id);
            delete calcStore.cardChecked[id];
            delete calcStore.cardExtraChecked[id];

            // 사이드 패널 동기화
            const item = document.querySelector(`.side-card-item[data-id="${id}"]`);
            if (item) { item.classList.remove('selected'); delete item.dataset.selectTime; }
            
            calcStore.save();
            refreshAll();
            return;
        }

        // 3. 아이템 효과 카운터 (+/-)
        if (counterBtn) {
            const id = counterBtn.dataset.id;
            const card = cardList.find(c => c.id === id);
            if (!card) return;

            // carddata.js의 item_effects 중 max 값이 있는 첫 번째 효과를 기준으로 제한 (없으면 99)
            const maxVal = card.item_effects?.find(e => e.max)?.max || 99;

            let count = calcStore.itemCounters[id] || 0;
            if (counterBtn.classList.contains('plus')) {
                if (count < maxVal) count++;
            } else {
                if (count > 0) count--;
            }
            calcStore.itemCounters[id] = count;
            calcStore.save();
            refreshAll();
            return;
        }

        // 4. 스킬 카드 조정 모달 열기
        if (tuneBtn) {
            showOtherTuneModal(refreshAll);
            return;
        }

        // 5. 분배기 (강화/삭제/획득) 조정
        if (distBtn) {
            const target = distBtn.dataset.dist; // 'em', 'ea', 'dm', 'da', 'dt', 'gm', 'ga', 'gt'
            if (!target) return;

            const type = target[0]; // 'e', 'd', 'g'
            const sub = target[1]; // 'm', 'a', 't'
            const storeKey = type === 'e' ? 'manualEnhance' : (type === 'd' ? 'manualDelete' : 'manualGet');
            
            // 삭제(d)의 경우 m, a, t 삼각 교체 / 나머지는 m, a 양방향 교체
            let sourceSub = '';
            if (type === 'd') {
                if (sub === 'm') sourceSub = calcStore[storeKey].a > 0 ? 'a' : 't';
                else if (sub === 'a') sourceSub = calcStore[storeKey].t > 0 ? 't' : 'm';
                else if (sub === 't') sourceSub = calcStore[storeKey].m > 0 ? 'm' : 'a';
            } else {
                sourceSub = sub === 'm' ? 'a' : 'm';
            }

            if (calcStore[storeKey][sourceSub] > 0) {
                calcStore[storeKey][sourceSub]--;
                calcStore[storeKey][sub]++;
                calcStore.save();
                refreshAll();
            }
        }
    });
    
    window._distInit = true;
}
