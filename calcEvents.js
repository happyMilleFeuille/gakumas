// calcEvents.js
import { state } from './state.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { showOtherTuneModal } from './calcModals.js';
import { updateSelectedCardsUI } from './calcUI.js';

/**
 * 전역 분배기 리스너 설정
 */
export function initGlobalDistListener(getBoardPools, refreshCardBonuses, updateActivityCounts) {
    if (window._distInit) return;
    document.addEventListener('click', (e) => {
        const cardCheckBtn = e.target.closest('.card-slot-check');
        const cardRemoveBtn = e.target.closest('.card-slot-remove');
        const btn = e.target.closest('.dist-btn');
        const tuneBtn = e.target.closest('#btn-other-tune');
        const counterBtn = e.target.closest('.card-counter-btn');
        
        const board = document.querySelector('.unified-plan-board');
        if (!board) return;
        const type = board.dataset.calcType;
        const current = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;

        if (counterBtn) {
            e.stopPropagation();
            const cardId = counterBtn.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (!card || !card.item_effects) return;

            if (!current.itemCounters) current.itemCounters = {};
            let count = current.itemCounters[cardId] || 0;

            if (counterBtn.classList.contains('plus')) {
                // Max 계산
                let max = 99;
                const effect = card.item_effects.find(e => e.type === 'action' || e.type === 'add_count');
                if (effect) {
                    if (effect.max) max = effect.max;
                    else if (effect.trigger || effect.target) {
                        const trigger = effect.trigger || effect.target;
                        // SSR, 원기, 호조, 집중 등의 속성이면 현재 총합을 max로 사용
                        if (['get_ssr', 'get_genki', 'get_goodcondition', 'get_concentration', 'get_motivation', 'get_goodimpression', 'get_preservation', 'get_enthusiasm', 'get_fullpower'].includes(trigger)) {
                             max = current.lastCounts?.[trigger] || 0;
                        }
                    }
                }
                if (count < max) count++;
            } else {
                if (count > 0) count--;
            }

            current.itemCounters[cardId] = count;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            
            // 현재 슬롯의 카드 ID 순서를 유지하여 UI 업데이트 (순서 꼬임 방지)
            const currentIds = Array.from(document.querySelectorAll('.selected-card-slot.filled')).map(el => el.dataset.id);
            updateSelectedCardsUI(currentIds, type);
            
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        if (cardRemoveBtn) {
            e.stopPropagation();
            const cardId = cardRemoveBtn.dataset.id;
            if (current.planCards && activePlan && current.planCards[activePlan]) {
                current.planCards[activePlan] = current.planCards[activePlan].filter(id => id !== cardId);
            }
            if (current.cardChecked && current.cardChecked[cardId]) {
                delete current.cardChecked[cardId];
            }
            
            // 사이드 패널 UI 동기화 (선택 해제)
            const panel = document.getElementById('calc-side-panel');
            if (panel) {
                const item = panel.querySelector(`.side-card-item[data-id="${cardId}"]`);
                if (item) {
                    item.classList.remove('selected');
                    delete item.dataset.selectTime;
                }
            }

            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            updateSelectedCardsUI(current.planCards[activePlan] || [], type);
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        if (cardCheckBtn) {
            if (!current.cardChecked) current.cardChecked = {};
            current.cardChecked[cardCheckBtn.dataset.id] = cardCheckBtn.checked;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        if (tuneBtn) {
            showOtherTuneModal(type, current, refreshCardBonuses, updateActivityCounts, getBoardPools);
            return;
        }

        if (!btn) return;
        
        e.preventDefault(); e.stopPropagation();
        const distTarget = btn.dataset.dist;
        const otherTarget = btn.dataset.target;
        const pools = getBoardPools(type, current);

        if (btn.classList.contains('other-btn') && otherTarget) {
            if (!current.manualOther) current.manualOther = {};
            let curManual = Number(current.manualOther[otherTarget]) || 0;
            if (btn.classList.contains('plus')) curManual++;
            else if (btn.classList.contains('minus') && curManual > -20) curManual--;
            current.manualOther[otherTarget] = curManual;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        // 분배 로직 (전체 풀은 calc.js에서 동기화되므로 여기서는 교체 로직만 수행)
        if (!current.manualEnhance) current.manualEnhance = { m: 0, a: 0 };
        if (!current.manualDelete) current.manualDelete = { m: 0, a: 0 };
        if (!current.manualGet) current.manualGet = { m: 0, a: 0 };
        
        let em = Number(current.manualEnhance.m), ea = Number(current.manualEnhance.a);
        let dm = Number(current.manualDelete.m), da = Number(current.manualDelete.a);
        let gm = Number(current.manualGet.m), ga = Number(current.manualGet.a);

        if (distTarget === 'a' && em > 0) { em--; ea++; }
        else if (distTarget === 'm' && ea > 0) { ea--; em++; }
        else if (distTarget === 'da' && dm > 0) { dm--; da++; }
        else if (distTarget === 'dm' && da > 0) { da--; dm++; }
        else if (distTarget === 'ga' && gm > 0) { gm--; ga++; }
        else if (distTarget === 'gm' && ga > 0) { ga--; gm++; }
        
        current.manualEnhance = { m: em, a: ea };
        current.manualDelete = { m: dm, a: da };
        current.manualGet = { m: gm, a: ga }; // ga: ga에서 a: ga로 오타도 수정
        localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
        refreshCardBonuses(); 
        updateActivityCounts();
    });
    window._distInit = true;
}

/**
 * 아이돌 셀렉터 설정
 */
export function setupIdolSelector(saveCalcState) {
    const grid = document.getElementById('idol-selector-grid');
    let isDown = false, startX, scrollLeft, isDragging = false;
    if (grid) {
        grid.addEventListener('mousedown', (e) => { isDown = true; isDragging = false; grid.classList.add('active'); startX = e.pageX - grid.offsetLeft; scrollLeft = grid.scrollLeft; });
        grid.addEventListener('mouseleave', () => { isDown = false; grid.classList.remove('active'); });
        grid.addEventListener('mouseup', () => { isDown = false; grid.classList.remove('active'); setTimeout(() => { isDragging = false; }, 0); });
        grid.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - grid.offsetLeft; const walk = (x - startX) * 2; grid.scrollLeft = scrollLeft - walk; if (Math.abs(walk) > 5) isDragging = true; });
    }
    document.querySelectorAll('.idol-sel-item').forEach(item => {
        item.onclick = (e) => { if (isDragging) { e.preventDefault(); return; } if (item.classList.contains('active')) return; 
            document.querySelectorAll('.idol-sel-item').forEach(i => i.classList.remove('active')); 
            item.classList.add('active'); item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); 
            saveCalcState(); 
        };
    });
}

/**
 * 보드 아이콘 토글 및 툴팁 설정
 */
export function setupIconToggles(updateSPBadge, updateMainLabel, updateActivityCounts, saveCalcState) {
    const board = document.querySelector('.unified-plan-board');
    const removeAllTooltips = (exclude = null) => {
        document.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
            if (w === exclude) return;
            const opts = activityOptions[w.dataset.value] || [];
            if (opts.some(o => o.type === 'checkbox') && !opts.some(o => w.dataset[`opt${o.id}`] === 'true' || (o.subOptions && o.subOptions.some(so => w.dataset[`opt${so.id}`] === 'true')))) {
                Object.keys(w.dataset).forEach(k => { if (k.startsWith('opt')) delete w.dataset[k]; }); w.classList.remove('active'); updateSPBadge(w); updateMainLabel(w);
            }
        });
        document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip').forEach(t => t.remove()); updateActivityCounts(); saveCalcState();
    };
    board.addEventListener('click', (e) => {
        const wrapper = e.target.closest('.plan-icon-wrapper');
        if (e.target.closest('.calc-tooltip, .calc-sub-tooltip, .dist-btn')) return;
        if (!wrapper) { removeAllTooltips(); return; }
        if (wrapper.classList.contains('active')) { Object.keys(wrapper.dataset).forEach(k => { if (k.startsWith('opt')) delete wrapper.dataset[k]; }); wrapper.classList.remove('active'); updateSPBadge(wrapper); updateMainLabel(wrapper); removeAllTooltips(); }
        else {
            wrapper.closest('.week-row').querySelectorAll('.plan-icon-wrapper').forEach(w => { w.classList.remove('active'); w.querySelectorAll('.sp-badge, .main-label-text').forEach(el => el.remove()); });
            wrapper.classList.add('active'); updateSPBadge(wrapper); updateMainLabel(wrapper); removeAllTooltips(wrapper);
            const opts = activityOptions[wrapper.dataset.value];
            if (opts?.length > 0) {
                const tooltip = document.createElement('div'); tooltip.className = 'calc-tooltip';
                tooltip.innerHTML = opts.map(o => {
                    const label = o[`label_${state.currentLang}`] || o.label_ko;
                    return o.type === 'checkbox' ? `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${wrapper.dataset[`opt${o.id}`] === 'true' ? 'checked' : ''}><span>${label}${o.subOptions ? ' ▶' : ''}</span></label>` : `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${o.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${wrapper.dataset[`opt${o.id}`] || 0}</span><button class="cnt-btn plus">+</button></div></div>`;
                }).join('');
                document.body.appendChild(tooltip);
                const rect = wrapper.getBoundingClientRect(); tooltip.style.left = `${rect.left + rect.width / 2}px`; tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`; tooltip.style.transform = 'translate(-50%, -50%)';
                
                tooltip.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                    chk.onchange = () => {
                        if (chk.checked) tooltip.querySelectorAll('input[type="checkbox"]').forEach(other => { if (other !== chk && other.checked) { other.checked = false; wrapper.dataset[`opt${other.dataset.id}`] = 'false'; if (other.dataset.id === 'sp') updateSPBadge(wrapper); } });
                        wrapper.dataset[`opt${chk.dataset.id}`] = chk.checked; if (chk.dataset.id === 'sp') updateSPBadge(wrapper); updateMainLabel(wrapper); saveCalcState();
                        document.querySelector('.calc-sub-tooltip')?.remove();
                        if (chk.checked && opts.find(o => o.id === chk.dataset.id)?.subOptions) showSubTooltip(opts.find(o => o.id === chk.dataset.id), wrapper, tooltip, updateMainLabel, saveCalcState);
                        else if (!opts.some(o => o.type === 'counter')) setTimeout(() => { if (!document.querySelector('.calc-sub-tooltip')) removeAllTooltips(); }, 100);
                    };
                });
                tooltip.querySelectorAll('.counter-controls').forEach(ctrl => {
                    ctrl.onclick = (ce) => {
                        const btn = ce.target.closest('.cnt-btn'); if (!btn) return;
                        const opt = opts.find(o => o.id === ctrl.dataset.id);
                        let cur = parseInt(wrapper.dataset[`opt${opt.id}`]) || 0;
                        if (btn.classList.contains('plus') && cur < (opt.max || 9)) cur++; else if (btn.classList.contains('minus') && cur > 0) cur--;
                        wrapper.dataset[`opt${opt.id}`] = cur; ctrl.querySelector('.cnt-val').textContent = cur; updateMainLabel(wrapper); saveCalcState();
                    };
                });
            }
        }
        updateActivityCounts(); saveCalcState();
    });
    document.getElementById('board-toggle-bar').onclick = () => { board.classList.toggle('collapsed-board'); document.getElementById('board-toggle-bar').textContent = board.classList.contains('collapsed-board') ? '주간 행동 열기 ▼' : '주간 행동 닫기 ▲'; saveCalcState(); };
    document.addEventListener('mousedown', (e) => { if (!e.target.closest('.calc-tooltip, .calc-sub-tooltip, .plan-icon-wrapper, .dist-btn, .p-item-slot')) { if (document.querySelector('.calc-tooltip, .calc-sub-tooltip, .p-item-tooltip')) { removeAllTooltips(); document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove()); } } });
}

function showSubTooltip(parent, wrapper, pTooltip, updateMainLabel, saveCalcState) {
    const sub = document.createElement('div'); sub.className = 'calc-tooltip calc-sub-tooltip'; sub.style.zIndex = '1100'; sub.style.backgroundColor = '#fefefe'; sub.style.border = '1px solid #ff4d8d';
    sub.innerHTML = parent.subOptions.map(o => `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${wrapper.dataset[`opt${o.id}`] === 'true' ? 'checked' : ''}><span>${o[`label_${state.currentLang}`] || o.label_ko}</span></label>`).join('');
    document.body.appendChild(sub); const rect = pTooltip.getBoundingClientRect(); sub.style.left = `${rect.left + rect.width / 2}px`; sub.style.top = `${rect.top + window.scrollY + rect.height / 2}px`; sub.style.transform = 'translate(-50%, -50%)';
    sub.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = () => {
            if (chk.checked) sub.querySelectorAll('input[type="checkbox"]').forEach(other => { if (other !== chk && other.checked) { other.checked = false; wrapper.dataset[`opt${other.dataset.id}`] = 'false'; } });
            wrapper.dataset[`opt${chk.dataset.id}`] = chk.checked; updateMainLabel(wrapper); saveCalcState();
            setTimeout(() => { document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip').forEach(t => t.remove()); }, 100);
        };
    });
}

/**
 * P-아이템 셀렉터 설정
 */
export function setupPItemSelector(type, saveCalcState, refreshCardBonuses, updateActivityCounts) {
    if (type !== 'nia') return;
    const container = document.getElementById('p-item-container');
    if (!container) return;
    const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    const pItems = saved.pItems || [null, null, null, null, null];
    const niaItemsBySlot = [['nia1-1', 'nia1-2'], ['nia2-1', 'nia2-2', 'nia2-3'], ['nia3-1', 'nia3-2'], ['nia4-1', 'nia4-2', 'nia4-3'], ['nia5-1', 'nia5-2', 'nia5-3']];

    container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
        const val = pItems[idx];
        slot.innerHTML = val ? `<img src="icons/cal/${val}.webp" data-val="${val}">` : '<span class="p-item-placeholder">+</span>';
        slot.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove());
            const tooltip = document.createElement('div');
            tooltip.className = 'calc-tooltip p-item-tooltip';
            tooltip.style.cssText = 'flex-direction:row; flex-wrap:wrap; width:210px; min-width:180px; gap:8px; justify-content:flex-start; padding:12px;';

            const clearBtn = document.createElement('div');
            clearBtn.textContent = 'X'; clearBtn.className = 'calc-btn'; clearBtn.style.cssText = 'width:40px; height:40px; padding:0; display:flex; align-items:center; justify-content:center; font-size:1.2rem; background:#f8f9fa; color:#888; border:1px solid #ddd; cursor:pointer;';
            clearBtn.onclick = () => { slot.innerHTML = '<span class="p-item-placeholder">+</span>'; saveCalcState(); refreshCardBonuses(); updateActivityCounts(); tooltip.remove(); };
            tooltip.appendChild(clearBtn);

            (niaItemsBySlot[idx] || []).forEach(item => {
                const img = document.createElement('img');
                img.src = `icons/cal/${item}.webp`; img.style.cssText = 'width:40px; height:40px; cursor:pointer; border:1px solid #eee; border-radius:4px;';
                img.onclick = () => { slot.innerHTML = `<img src="icons/cal/${item}.webp" data-val="${item}">`; saveCalcState(); refreshCardBonuses(); updateActivityCounts(); tooltip.remove(); };
                tooltip.appendChild(img);
            });
            document.body.appendChild(tooltip);
            const rect = slot.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`; tooltip.style.top = `${rect.top + window.scrollY - 10}px`; tooltip.style.transform = 'translate(-50%, -100%)';
        };
    });

    const infoBtn = container.querySelector('.p-item-info-btn');
    if (infoBtn) {
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            if (document.querySelector('.p-item-info-tooltip')) {
                document.querySelector('.p-item-info-tooltip').remove();
                return;
            }
            const tooltip = document.createElement('div');
            tooltip.className = 'calc-tooltip p-item-info-tooltip';
            tooltip.style.cssText = 'position: absolute; width: max-content; max-width: 90vw; padding: 12px 15px; background: #fff; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.85rem; color: #333; line-height: 1.2; z-index: 10000; white-space: nowrap;';
            tooltip.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia1-1.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>특별수업 시 카드 삭제/획득 +1 (프로듀스 중 2회)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia1-2.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>상담 시 카드 삭제/획득 +1 (프로듀스 중 2회)</span>
                    </div>
                    <div style="height: 1px; background: #eee; margin: 2px 0;"></div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia2-1.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>영업(강화카드) 시 카드 삭제/획득 +1 (프로듀스 중 2회)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia2-2.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>영업(P포인트) 시 카드 삭제/획득 +1 (프로듀스 중 2회)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia2-3.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>영업(드링크) 시 카드 삭제/획득 +1 (프로듀스 중 2회)</span>
                    </div>
                    <div style="height: 1px; background: #eee; margin: 2px 0;"></div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia3-1.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>오디션 종료 시 카드 삭제 +1 / 복제 (프로듀스 중 2회)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/cal/nia3-2.webp" style="width: 24px; height: 24px; border-radius: 4px;">
                        <span>오디션 종료 시 카드 삭제 +1 / 복제 (프로듀스 중 2회)</span>
                    </div>
                </div>
            `;
            document.body.appendChild(tooltip);
            const rect = infoBtn.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`; 
            tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;

            const closeTooltip = (ev) => {
                if (!tooltip.contains(ev.target) && ev.target !== infoBtn) {
                    tooltip.remove();
                    document.removeEventListener('click', closeTooltip);
                }
            };
            setTimeout(() => document.addEventListener('click', closeTooltip), 10);
        };
    }
}

/**
 * 플랜 타입(Sense/Logic/Anomaly) 셀렉터 설정
 */
export function setupPlanTypeSelector(saveCalcState, renderSidePanelContent, updateSelectedCardsUI) {
    document.querySelectorAll('.plan-type-btn').forEach(btn => {
        btn.onclick = () => {
            if (btn.classList.contains('active')) return;
            saveCalcState();
            document.querySelectorAll('.plan-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const newPlan = btn.dataset.type;
            const type = document.querySelector('.unified-plan-board')?.dataset.calcType;
            const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
            const planCards = (saved.planCards && saved.planCards[newPlan]) ? saved.planCards[newPlan] : [];
            const panel = document.getElementById('calc-side-panel');
            if (panel) {
                renderSidePanelContent(panel, newPlan);
                panel.querySelectorAll('.side-card-item').forEach(item => {
                    item.classList.toggle('selected', planCards.includes(item.dataset.id));
                    if (planCards.includes(item.dataset.id)) item.dataset.selectTime = Date.now();
                });
            }
            updateSelectedCardsUI(planCards, type);
            saveCalcState();
            if (panel) setTimeout(() => { document.getElementById('calc-side-spinner-overlay')?.remove(); }, 100);
        };
    });
}

