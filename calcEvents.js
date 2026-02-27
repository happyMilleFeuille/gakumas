// calcEvents.js
import { cardList } from './carddata.js';
import { showOtherTuneModal } from './calcModals.js';
import { calcStore } from './calcStore.js';

/**
 * 전역 분배기 및 카드 카운터 리스너 설정
 */
export function initGlobalDistListener(refreshAll, getBoardPools) {
    if (window._distInit) return;
    
    document.addEventListener('click', (e) => {
        const board = document.querySelector('.unified-plan-board');
        if (!board) return;

        const cardCheckBtn = e.target.closest('.card-slot-check');
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

        // 2. 카드 슬롯에서 제거
        if (cardRemoveBtn) {
            const id = cardRemoveBtn.dataset.id;
            const plan = calcStore.planType;
            calcStore.planCards[plan] = (calcStore.planCards[plan] || []).filter(cid => cid !== id);
            delete calcStore.cardChecked[id];
            
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

            let count = calcStore.itemCounters[id] || 0;
            if (counterBtn.classList.contains('plus')) {
                if (count < 99) count++;
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
            showOtherTuneModal(refreshAll, getBoardPools);
            return;
        }

        // 5. 분배기 (강화/삭제/획득) 조정
        if (distBtn) {
            const target = distBtn.dataset.dist; // 'em', 'ea', 'dm', 'da', 'gm', 'ga'
            if (!target) return;

            const type = target[0]; // 'e', 'd', 'g'
            const sub = target[1]; // 'm', 'a'
            const storeKey = type === 'e' ? 'manualEnhance' : (type === 'd' ? 'manualDelete' : 'manualGet');
            const otherSub = sub === 'm' ? 'a' : 'm';

            // 간단한 교체 로직: 반대쪽에서 하나 가져옴
            if (calcStore[storeKey][otherSub] > 0) {
                calcStore[storeKey][otherSub]--;
                calcStore[storeKey][sub]++;
                calcStore.save();
                refreshAll();
            }
        }
    });
    
    window._distInit = true;
}
