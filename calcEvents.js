// calcEvents.js
import { cardList } from './carddata.js';
import { state } from './state.js';
import { showOtherTuneModal } from './calcModals.js';
import { calcStore } from './calcStore.js';
import { showSupportItemTooltip } from './calcUI.js';
import { translate } from './utils.js';

const t = (key, params = {}, fallback = '') => translate(key, params, fallback);

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
        const cardEventCheckBtn = e.target.closest('.card-event-check');
        const cardRemoveBtn = e.target.closest('.card-slot-remove');
        const distBtn = e.target.closest('.dist-btn');
        const tuneBtn = e.target.closest('#btn-other-tune, #floating-skill-btn');
        const counterBtn = e.target.closest('.card-counter-btn');
        const slotImg = e.target.closest('.slot-frame img');
        const emptySlotFrame = e.target.closest('.selected-card-slot.empty .slot-frame');

        // 0. 장착된 서포트 카드 이미지 클릭 (툴팁 표시)
        if (slotImg) {
            const slotEl = slotImg.closest('.selected-card-slot');
            const cardId = slotEl?.dataset.id;
            if (cardId) {
                const card = cardList.find(c => c.id === cardId);
                if (card?.item_effects) {
                    showSupportItemTooltip(slotEl, cardId);
                    return;
                }
            }
        }

        // 0-1. 빈 서포트 카드 슬롯 클릭 시 계산 버튼 트리거 (서포트 패널이 닫혀있을 때만)
        if (emptySlotFrame) {
            const sidePanel = document.getElementById('calc-side-panel');
            if (!sidePanel || !sidePanel.classList.contains('open')) {
                const calcBtn = document.getElementById('btn-run-calc');
                if (calcBtn) { calcBtn.click(); return; }
            }
        }

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

        // 1-3. 카드 이벤트(Option 1) 체크박스
        if (cardEventCheckBtn) {
            calcStore.cardEventChecked[cardEventCheckBtn.dataset.id] = cardEventCheckBtn.checked;
            calcStore.save();
            refreshAll();
            return;
        }

        // 2. 카드 슬롯에서 제거
        if (cardRemoveBtn) {
            const id = cardRemoveBtn.dataset.id;
            const plan = calcStore.planType;
            calcStore.planCards[plan] = (calcStore.planCards[plan] || []).map(cid => cid === id ? null : cid);
            
            // 카드 제거 시 해당 카드의 체크박스 옵션들(이벤트, 강화, 체인지 등) 초기화
            delete calcStore.cardEventChecked[id];
            delete calcStore.cardExtraChecked[id];


            // 사이드 패널 동기화
            const sidePanel = document.getElementById('calc-side-panel');
            const item = sidePanel?.querySelector(`.side-card-item[data-id="${id}"]`);
            if (item) {
                item.classList.remove('selected'); delete item.dataset.selectTime;
                item.style.borderColor = '#ddd'; item.style.borderWidth = '';
            }
            // Update stars for 6th slot mode
            if (sidePanel) {
                const updatedPlanCards = calcStore.planCards[plan] || [];
                const filledCount = updatedPlanCards.filter(cid => cid !== null).length;
                const isSelectingSixth = filledCount === 5 && updatedPlanCards[5] === null;
                if (isSelectingSixth) sidePanel.classList.add('is-selecting-sixth');
                else sidePanel.classList.remove('is-selecting-sixth');

                const tabs = sidePanel.querySelector('.side-panel-tabs');
                const content = sidePanel.querySelector('.side-panel-content');
                if (tabs) {
                    tabs.style.background = isSelectingSixth ? '#8FDDBA' : 'white';
                    tabs.style.borderBottomColor = '#eee';
                    
                    let badge = tabs.querySelector('.rental-badge');
                    if (isSelectingSixth) {
                        if (!badge) {
                            badge = document.createElement('span');
                            badge.className = 'rental-badge';
                            badge.textContent = t('calc_label_rental');
                            Object.assign(badge.style, {
                                position: 'absolute', top: '2px', left: '6px',
                                fontSize: '8px', fontWeight: 'bold', color: '#fff',
                                letterSpacing: '0.5px', zIndex: '10', opacity: '0.8'
                            });
                            tabs.appendChild(badge);
                        }
                    } else if (badge) {
                        badge.remove();
                    }
                }
                if (content) {
                    content.style.background = isSelectingSixth ? '#8FDDBA' : 'white';
                }
                sidePanel.querySelectorAll('.side-card-item').forEach(el => {
                    const elId = el.dataset.id;
                    const isSixth = updatedPlanCards.indexOf(elId) === 5;
                    const rawLb = state.supportLB?.[elId] || 0;
                    const isSelectedCard = updatedPlanCards.includes(elId);
                    const displayLb = (isSelectingSixth && !isSelectedCard) || isSixth ? 4 : rawLb;
                    el.querySelectorAll('.calc-card-star').forEach((star, i) => {
                        if (i < displayLb) star.classList.add('active');
                        else star.classList.remove('active');
                    });
                });
            }

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
        // 6. 스탯 상세 정보 토글 (vocal/dance/visual 하단 정보)
        const statToggleBtn = e.target.closest('#btn-stat-detail-toggle');
        if (statToggleBtn) {
            const detailAreas = document.querySelectorAll('.stat-detail-area');
            const isActive = statToggleBtn.classList.toggle('active');
            
            detailAreas.forEach(area => {
                area.classList.toggle('collapsed', !isActive);
            });
            
            // 상태 저장
            calcStore.statDetailsOpen = isActive;
            calcStore.save();
            return;
        }
    });

    window._distInit = true;
}
