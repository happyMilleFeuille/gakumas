// calc.js
import { state, idolColors } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans, baseStats, idolData, niaAuditionStats, judgingRatios } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calcStore } from './calcStore.js';
import { pItemDescriptions, pItemSlots } from './pItemData.js';
import { getTriggerCounts, calculateTotals, getNiaLessonStat, getHajimeLessonStat } from './calcLogic.js';
import { calculateCardBonus } from './simulator-engine.js';
import { 
    updateActivityCountsUI, updateSelectedCardsUI, updateStatHeaderUI, 
    renderCalcMenu, renderWeeklyPlan, updateSPBadge, updateMainLabel,
    showSubTooltip, showPItemSelectorTooltip, showPItemInfoTooltip,
    getIdolDisplayColor, updateMemorySlotsUI
} from './calcUI.js';import { initGlobalDistListener } from './calcEvents.js';
import { toggleSupportCardPanel, closeSupportCardPanel, showStatDetailModal } from './calcModals.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];

export function initCalc() { 
    window._lastIdolScrollLeft = undefined; // 메뉴 진입 시 스크롤 위치 초기화
    renderCalcMenu(updatePageTranslations, () => startWeeklyPlan('hajime'), () => startWeeklyPlan('nia')); 
}

function startWeeklyPlan(type) {
    calcStore.init(type);
    initGlobalDistListener(refreshAll);
    
    const handlers = {
        setupAll: () => {
            const grid = document.getElementById('idol-selector-grid');
            if (grid) {
                // 플랜 전환(센스/로직/어노말리)인 경우 기존 위치 유지
                if (window._lastIdolScrollLeft !== undefined) {
                    grid.scrollLeft = window._lastIdolScrollLeft;
                } 
                
                // 메뉴에서 처음 들어왔거나, 위에서 위치를 잡았더라도 활성화된 아이돌 보장 로직
                setTimeout(() => {
                    const activeItem = grid.querySelector('.idol-sel-item.active');
                    if (activeItem) {
                        // [수정] 이미 구현된 클릭 핸들러의 스크롤 로직을 재사용하기 위해 클릭 이벤트 발생
                        activeItem.click();
                        
                        // 스크롤 완료 후 위치 다시 저장
                        setTimeout(() => { window._lastIdolScrollLeft = grid.scrollLeft; }, 300);
                    }
                }, 100);
            }

            // [추가] 정보 버튼(i) 이벤트 바인딩
            document.querySelectorAll('.info-i-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const actionType = btn.dataset.type; // 'test' or 'audition'
                    const weekRow = btn.closest('.week-row');
                    if (!weekRow) return;
                    const weekNum = parseInt(weekRow.dataset.week);
                    
                    // 1. 수치 데이터 추출 로직 (참조용 비율 데이터만 사용)
                    let circleStats = { vocal: 0, dance: 0, visual: 0 };
                    const idolInfo = idolData[calcStore.selectedIdol];
                    const ratios = judgingRatios[calcStore.type];
                    
                    if (idolInfo && ratios) {
                        let stageIdx = 0;
                        if (calcStore.type === 'nia') {
                            if (weekNum <= 10) stageIdx = 1;
                            else if (weekNum <= 20) stageIdx = 2;
                            else stageIdx = 3;
                        } else {
                            // 하지메: 6주차 부근은 1단계(중간), 그 이후(13주차 부근)는 2단계(기말)
                            stageIdx = (weekNum <= 10) ? 1 : 2;
                        }
                        
                        const stageData = ratios[stageIdx];
                        if (stageData) {
                            const data = idolInfo.growthType === 'protruded' ? stageData.protruded : stageData.balanced;
                            // 동그라미 수치 배분
                            idolInfo.priority.forEach((attr, idx) => {
                                if (data && data.circle) {
                                    circleStats[attr] = data.circle[idx] || 0;
                                } else if (Array.isArray(data)) {
                                    circleStats[attr] = data[idx] || 0;
                                }
                            });
                        }
                    }

                    document.querySelectorAll('.stat-graph-tooltip').forEach(t => t.remove());

                    const tooltip = document.createElement('div');
                    tooltip.className = 'calc-tooltip stat-graph-tooltip';
                    
                    const isJa = state.currentLang === 'ja';
                    const maxVal = Math.max(circleStats.vocal, circleStats.dance, circleStats.visual, 1); // 0 방지
                    
                    const getBarPart = (val, color, icon) => {
                        const height = Math.min(100, (val/maxVal)*100);
                        return `
                        <div class="graph-column">
                            <div class="graph-bar-bg">
                                <div class="graph-bar-fill" style="height: ${height}%; background: ${color};"></div>
                                <div class="graph-icon" style="bottom: ${height}%;"><img src="icons/${icon}.png"></div>
                            </div>
                        </div>`;
                    };
                    const getValPart = (val, color) => `
                        <div class="graph-val-column">
                            <span class="graph-val" style="color: ${color}">${val}</span>
                        </div>`;

                    tooltip.innerHTML = `
                        <div class="graph-container">
                            <div class="graph-bars-area">
                                ${getBarPart(circleStats.vocal, '#ff4d8d', 'vocal')}
                                ${getBarPart(circleStats.dance, '#46a4f3', 'dance')}
                                ${getBarPart(circleStats.visual, '#fcc75e', 'visual')}
                            </div>
                            <div class="graph-baseline"></div>
                            <div class="graph-vals-area">
                                ${getValPart(circleStats.vocal, '#ff4d8d')}
                                ${getValPart(circleStats.dance, '#46a4f3')}
                                ${getValPart(circleStats.visual, '#fcc75e')}
                            </div>
                        </div>
                    `;

                    // [수정] body가 아닌 공통 부모(icon-outer-container)에 추가하여 버튼과 함께 스크롤되게 함
                    const container = btn.closest('.icon-outer-container');
                    if (container) {
                        const idolId = calcStore.selectedIdol;
                        const idolColor = idolColors[idolId] || "#ff4d8d";
                        
                        container.appendChild(tooltip);
                        tooltip.style.left = '50%';
                        tooltip.style.top = '-5px';
                        tooltip.style.transform = 'translate(-50%, -100%)';
                        tooltip.style.borderColor = idolColor;
                    }

                    const closeTooltip = (ev) => { if (!tooltip.contains(ev.target)) { tooltip.remove(); document.removeEventListener('mousedown', closeTooltip); } };
                    setTimeout(() => document.addEventListener('mousedown', closeTooltip), 10);
                };
            });

            const backBtn = document.querySelector('.back-btn');
            if (backBtn) backBtn.onclick = () => renderCalcMenu(updatePageTranslations, () => startWeeklyPlan('hajime'), () => startWeeklyPlan('nia'));
            
            document.querySelectorAll('.plan-type-btn').forEach(btn => {
                btn.onclick = () => {
                    if (btn.classList.contains('active')) return;
                    // [추가] 플랜 전환 직전에 현재 스크롤 위치 저장
                    const currentGrid = document.getElementById('idol-selector-grid');
                    if (currentGrid) window._lastIdolScrollLeft = currentGrid.scrollLeft;

                    calcStore.setPlanType(btn.dataset.type);
                    startWeeklyPlan(type); 
                };
            });

            document.querySelectorAll('.idol-sel-item').forEach(item => {
                item.onclick = (e) => {
                    if (window._isDraggingIdol) {
                        e.preventDefault();
                        return;
                    }
                    
                    // [수정] active 체크를 뒤로 미루거나, 스크롤은 항상 되도록 함
                    item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    
                    if (item.classList.contains('active')) return;
                    
                    calcStore.setSelectedIdol(item.dataset.id);
                    document.querySelectorAll('.idol-sel-item').forEach(i => {
                        i.classList.remove('active');
                        i.style.borderColor = '';
                        i.style.boxShadow = '';
                        i.style.transform = '';
                    });
                    item.classList.add('active');
                    const getIdolColor = (id) => (idolColors[id] || "#ff4d8d");
                    const color = getIdolColor(item.dataset.id);
                    item.style.borderColor = color;
                    item.style.borderWidth = '3px';
                    item.style.boxShadow = `0 0 12px ${color}b3`;
                    item.style.transform = 'scale(1.1)';

                    // [추가] 계획 보드의 모든 활성화된 아이콘 테두리 및 SP 배지 색상 변경
                    document.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
                        if (w.classList.contains('large-icon')) {
                            w.style.filter = `drop-shadow(1.5px 0 0 ${color}) drop-shadow(-1.5px 0 0 ${color}) drop-shadow(0 1.5px 0 ${color}) drop-shadow(0 -1.5px 0 ${color}) drop-shadow(0 0 5px ${color})`;
                        } else {
                            w.style.borderColor = color;
                            w.style.boxShadow = `0 0 8px ${color}66`;
                        }
                        // SP 배지가 있다면 색상 즉시 업데이트
                        const badge = w.querySelector('.sp-badge');
                        if (badge) badge.style.backgroundColor = color;
                    });

                    // [추가] 정보 버튼(i) 색상도 즉시 업데이트
                    document.querySelectorAll('.info-i-btn').forEach(iBtn => {
                        iBtn.style.backgroundColor = color;
                    });

                    // [추가] 플랜 타입 버튼의 활성화 테두리 색상도 변경
                    document.querySelectorAll('.plan-type-btn.active').forEach(btn => {
                        btn.style.borderColor = color;
                        btn.style.boxShadow = `0 0 8px ${color}66`;
                    });

                    // [추가] 상단 계산 버튼 색상 변경
                    const runCalcBtn = document.getElementById('btn-run-calc');
                    if (runCalcBtn) {
                        runCalcBtn.style.backgroundColor = color;
                        runCalcBtn.style.boxShadow = `0 2px 6px ${color}33`;
                    }

                    // [추가] 스탯 헤더 테두리 및 TOTAL 배경색 변경
                    const statHeader = document.querySelector('.stat-header');
                    if (statHeader) statHeader.style.borderColor = color;
                    const totalContainer = document.getElementById('total-stats-sum-container');
                    if (totalContainer) {
                        totalContainer.style.backgroundColor = color;
                        totalContainer.style.boxShadow = `0 2px 6px ${color}33`;
                    }

                    // [추가] P-아이템 슬롯 테두리 즉시 업데이트 (아이템 있으면 투명, 없으면 회색)
                    document.querySelectorAll('.p-item-slot').forEach(slot => {
                        const hasImg = slot.querySelector('img');
                        slot.style.borderColor = hasImg ? 'transparent' : '#ddd';
                        const placeholder = slot.querySelector('.p-item-placeholder');
                        if (placeholder) placeholder.style.color = '#ccc';
                    });

                    // [추가] P-아이템 정보 버튼(i) 색상 유지 (회색)
                    const pItemInfoBtn = document.querySelector('.p-item-info-btn');
                    if (pItemInfoBtn) {
                        pItemInfoBtn.style.backgroundColor = '#f8f9fa';
                        pItemInfoBtn.style.color = '#666';
                    }

                    // [추가] 서포트 패널이 열려있다면 선택된 카드들의 테두리 색상도 즉시 업데이트
                    const sidePanel = document.getElementById('calc-side-panel');
                    if (sidePanel) {
                        sidePanel.querySelectorAll('.side-card-item.selected').forEach(card => {
                            card.style.borderColor = color;
                        });
                    }

                    refreshAll();
                };
            });

            // 아이돌 셀렉터 드래그 스크롤 복구 및 이벤트 바인딩
            if (grid) {
                let isDown = false, startX, scrollLeft;
                grid.addEventListener('mousedown', (e) => {
                    isDown = true;
                    window._isDraggingIdol = false;
                    grid.classList.add('active');
                    startX = e.pageX - grid.offsetLeft;
                    scrollLeft = grid.scrollLeft;
                });
                grid.addEventListener('mouseleave', () => {
                    isDown = false;
                    grid.classList.remove('active');
                });
                grid.addEventListener('mouseup', () => {
                    isDown = false;
                    grid.classList.remove('active');
                    // 클릭 이벤트 방지를 위해 약간의 지연 후 드래그 상태 해제
                    setTimeout(() => { window._isDraggingIdol = false; }, 50);
                });
                grid.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - grid.offsetLeft;
                    const walk = (x - startX) * 2;
                    if (Math.abs(walk) > 5) window._isDraggingIdol = true;
                    grid.scrollLeft = scrollLeft - walk;
                    // [추가] 드래그 중에도 위치 기억 (실시간 반영)
                    window._lastIdolScrollLeft = grid.scrollLeft;
                });
            }

            const board = document.querySelector('.unified-plan-board');
            if (board) {
                const removeAllTooltips = (exclude = null) => {
                    document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip').forEach(t => t.remove());
                    document.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
                        if (w === exclude) return;
                        const optsDef = activityOptions[w.dataset.value] || [];
                        const week = w.closest('.week-row').dataset.week;
                        const savedOpts = calcStore.weeks[week]?.opts || {};
                        if (optsDef.some(o => o.type === 'checkbox') && !optsDef.some(o => savedOpts[o.id] === 'true')) {
                            calcStore.setWeekAction(week, '', {});
                            w.classList.remove('active');
                            // [수정] 스타일 초기화 추가
                            w.style.filter = '';
                            w.style.borderColor = '';
                            w.style.boxShadow = '';
                            updateSPBadge(w, calcStore.selectedIdol); updateMainLabel(w);
                        }
                    });
                    refreshAll();
                };

                board.onclick = (e) => {
                    const wrapper = e.target.closest('.plan-icon-wrapper');
                    if (!wrapper || e.target.closest('.calc-tooltip, .calc-sub-tooltip, .dist-btn')) return;
                    
                    // 이벤트 전파 방지 (모바일 클릭/터치 간섭 방지)
                    e.stopPropagation();

                    const weekNum = wrapper.closest('.week-row').dataset.week;
                    const val = wrapper.dataset.value;

                    if (wrapper.classList.contains('active')) {
                        calcStore.setWeekAction(weekNum, '', {});
                        wrapper.classList.remove('active');
                        Object.keys(wrapper.dataset).forEach(k => { if(k.startsWith('opt')) delete wrapper.dataset[k]; });
                        // [수정] 필터와 모든 스타일 초기화
                        wrapper.style.filter = '';
                        wrapper.style.borderColor = '';
                        wrapper.style.boxShadow = '';
                        updateSPBadge(wrapper, calcStore.selectedIdol); updateMainLabel(wrapper);
                        removeAllTooltips();
                    } else {
                        const idolColor = idolColors[calcStore.selectedIdol] || "#ff4d8d";
                        wrapper.closest('.week-row').querySelectorAll('.plan-icon-wrapper').forEach(w => {
                            w.classList.remove('active');
                            w.style.borderColor = '';
                            w.style.boxShadow = '';
                            Object.keys(w.dataset).forEach(k => { if(k.startsWith('opt')) delete w.dataset[k]; });
                            w.querySelectorAll('.sp-badge, .main-label-text').forEach(el => el.remove());
                        });
                        calcStore.setWeekAction(weekNum, val, {});
                        wrapper.classList.add('active');
                        
                        if (wrapper.classList.contains('large-icon')) {
                            // 이미지 외곽을 따라가는 선명한 테두리 + 캐릭터 색상의 얕은 그림자
                            wrapper.style.filter = `drop-shadow(1.5px 0 0 ${idolColor}) drop-shadow(-1.5px 0 0 ${idolColor}) drop-shadow(0 1.5px 0 ${idolColor}) drop-shadow(0 -1.5px 0 ${idolColor}) drop-shadow(0 0 5px ${idolColor})`;
                        } else {
                            wrapper.style.borderColor = idolColor;
                            wrapper.style.boxShadow = `0 0 8px ${idolColor}66`;
                        }
                        
                        updateSPBadge(wrapper, calcStore.selectedIdol); updateMainLabel(wrapper);
                        removeAllTooltips(wrapper);

                        const opts = activityOptions[val];
                        if (opts?.length > 0) {
                            const tooltip = document.createElement('div');
                            const isClass = val === 'class_hajime' || val === 'class_nia';
                            tooltip.className = `calc-tooltip ${isClass ? 'split-layout' : ''}`;
                            tooltip.onclick = (te) => te.stopPropagation(); // 툴팁 내부 클릭 시 닫힘 방지
                            
                            // [추가] 아이돌 색상 적용
                            const idolId = calcStore.selectedIdol;
                            const idolColor = idolColors[idolId] || "#ff4d8d";
                            tooltip.style.borderColor = idolColor;

                            const savedOpts = calcStore.weeks[weekNum].opts || {};
                            const selectedAttr = savedOpts.selectedAttr || '';

                            const optionsHtml = opts.map(o => {
                                const label = o[`label_${state.currentLang}`] || o.label_ko;
                                const savedVal = savedOpts[o.id];
                                if (o.type === 'checkbox') {
                                    return `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${savedVal === 'true' ? 'checked' : ''}><span>${label}${o.subOptions ? ' ▶' : ''}</span></label>`;
                                } else {
                                    return `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${o.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${savedVal || 0}</span><button class="cnt-btn plus">+</button></div></div>`;
                                }
                            }).join('');

                            if (isClass) {
                                const attrColumn = `
                                    <div class="tooltip-attr-column">
                                        <div class="attr-icon-button ${selectedAttr === 'vocal' ? 'active' : ''}" data-attr="vocal" title="보컬">
                                            <img src="icons/vocal.png" alt="Vo">
                                        </div>
                                        <div class="attr-icon-button ${selectedAttr === 'dance' ? 'active' : ''}" data-attr="dance" title="댄스">
                                            <img src="icons/dance.png" alt="Da">
                                        </div>
                                        <div class="attr-icon-button ${selectedAttr === 'visual' ? 'active' : ''}" data-attr="visual" title="비주얼">
                                            <img src="icons/visual.png" alt="Vi">
                                        </div>
                                    </div>`;
                                tooltip.innerHTML = `
                                    ${attrColumn}
                                    <div class="tooltip-divider"></div>
                                    <div class="tooltip-options-column">
                                        ${optionsHtml}
                                    </div>`;

                                tooltip.querySelectorAll('.attr-icon-button').forEach(btn => {
                                    btn.onclick = () => {
                                        const attr = btn.dataset.attr;
                                        const isActive = btn.classList.contains('active');
                                        tooltip.querySelectorAll('.attr-icon-button').forEach(b => b.classList.remove('active'));
                                        
                                        if (!isActive) {
                                            btn.classList.add('active');
                                            calcStore.weeks[weekNum].opts.selectedAttr = attr;
                                            
                                            // [추가] 체크박스도 이미 선택되어 있다면 툴팁 닫기
                                            const anyChecked = tooltip.querySelector('input[type="checkbox"]:checked');
                                            if (anyChecked) {
                                                setTimeout(() => removeAllTooltips(), 100);
                                            }
                                        } else {
                                            delete calcStore.weeks[weekNum].opts.selectedAttr;
                                        }
                                        updateMainLabel(wrapper);
                                        calcStore.save();
                                        refreshAll();
                                    };
                                });
                            } else {
                                tooltip.innerHTML = optionsHtml;
                            }
                            wrapper.appendChild(tooltip);
                            
                            const tooltipWidth = tooltip.offsetWidth;
                            const tooltipHeight = tooltip.offsetHeight;
                            
                            // 부모(wrapper) 기준 중앙 정렬
                            tooltip.style.left = '50%';
                            tooltip.style.top = '50%';
                            tooltip.style.transform = 'translate(-50%, -50%)';
                            tooltip.style.position = 'absolute';
                            tooltip.style.width = 'max-content';
                            tooltip.style.zIndex = '1000';

                            tooltip.querySelectorAll('input[type="checkbox"]').forEach(chk => {
                                chk.onchange = () => {
                                    const optId = chk.dataset.id;
                                    const currentOptDef = opts.find(o => o.id === optId);
                                    if (chk.checked) {
                                        tooltip.querySelectorAll('input[type="checkbox"]').forEach(other => {
                                            if (other !== chk && other.checked) {
                                                other.checked = false;
                                                calcStore.updateWeekOpt(weekNum, other.dataset.id, false);
                                                wrapper.dataset[`opt${other.dataset.id}`] = 'false';
                                            }
                                        });
                                    }
                                    calcStore.updateWeekOpt(weekNum, optId, chk.checked);
                                    wrapper.dataset[`opt${optId}`] = String(chk.checked);
                                    updateSPBadge(wrapper, calcStore.selectedIdol); updateMainLabel(wrapper);
                                    
                                    if (chk.checked && currentOptDef?.subOptions) {
                                        showSubTooltip(currentOptDef, weekNum, wrapper, tooltip);
                                    } else if (!opts.some(o => o.type === 'counter')) {
                                        // 클래스인 경우 속성도 선택되어 있어야 닫음
                                        const hasAttr = !!calcStore.weeks[weekNum].opts.selectedAttr;
                                        if (isClass) {
                                            if (chk.checked && hasAttr) {
                                                setTimeout(() => { if (!document.querySelector('.calc-sub-tooltip')) removeAllTooltips(); }, 100);
                                            }
                                        } else {
                                            setTimeout(() => { if (!document.querySelector('.calc-sub-tooltip')) removeAllTooltips(); }, 100);
                                        }
                                    }
                                    refreshAll();
                                };
                            });

                            tooltip.querySelectorAll('.counter-controls').forEach(ctrl => {
                                ctrl.onclick = (ce) => {
                                    ce.stopPropagation();
                                    const btn = ce.target.closest('.cnt-btn'); if (!btn) return;
                                    const optId = ctrl.dataset.id;
                                    const optDef = opts.find(o => o.id === optId);
                                    let cur = parseInt(calcStore.weeks[weekNum].opts[optId]) || 0;
                                    if (btn.classList.contains('plus') && cur < (optDef.max || 9)) cur++;
                                    else if (btn.classList.contains('minus') && cur > 0) cur--;
                                    calcStore.updateWeekOpt(weekNum, optId, cur);
                                    wrapper.dataset[`opt${optId}`] = String(cur);
                                    ctrl.querySelector('.cnt-val').textContent = cur;
                                    updateMainLabel(wrapper);
                                    refreshAll();
                                };
                            });
                        }
                    }
                    refreshAll();
                };
            }

            if (type === 'nia' || type === 'hajime') {
                const c = document.getElementById('p-item-container');
                if (c) c.classList.remove('hidden');
                setupPItemSelector();
            } else {
                const c = document.getElementById('p-item-container');
                if (c) c.classList.add('hidden');
            }
            const calcBtn = document.getElementById('btn-run-calc');
            if (calcBtn) calcBtn.onclick = () => toggleSupportCardPanel(calcStore.planType, refreshAll);
            const toggleBar = document.getElementById('board-toggle-bar');
            if (toggleBar) {
                toggleBar.onclick = () => {
                    calcStore.isBoardCollapsed = !calcStore.isBoardCollapsed;
                    calcStore.save();
                    board?.classList.toggle('collapsed-board', calcStore.isBoardCollapsed);
                    const isJa = state.currentLang === 'ja';
                    if (calcStore.isBoardCollapsed) {
                        toggleBar.textContent = isJa ? 'スケジュールを開く ▼' : '주간 행동 열기 ▼';
                    } else {
                        toggleBar.textContent = isJa ? 'スケジュール를 닫기 ▲' : '주간 행동 닫기 ▲';
                    }
                };
            }
        }
    };

    renderWeeklyPlan(calcStore, calcPlans, idolList, handlers);
    window.refreshAll = refreshAll;
    refreshAll();
}

/**
 * [핵심] 모든 수치 계산 및 UI 동기화
 */
function refreshAll() {
    try {
        const counts = getTriggerCounts(calcStore);
        const { bonusTotal, finalTotal, breakdown } = calculateTotals(calcStore, counts);
        calcStore.bonusTotal = bonusTotal;
        calcStore.finalTotal = finalTotal;
        window._lastStatBreakdown = breakdown; // 상세 모달용 데이터
        
        const spTotals = { vocal: 0, dance: 0, visual: 0 };
        const selectedIds = calcStore.planCards[calcStore.planType] || [];
        selectedIds.forEach(id => {
            const card = cardList.find(c => c.id === id);
            if (card?.abilities?.includes('sp_lessonup')) {
                const lb = state.supportLB[id] || 0;
                const ability = abilityData['sp_lessonup'];
                if (ability) {
                    const bonusLevels = ability.levels[card.rarity] || ability.levels;
                    spTotals[card.type] += (bonusLevels[lb >= 2 ? 2 : 1] || bonusLevels[1]);
                }
            }
        });
        window._lastSpTotals = spTotals;

        updateStatHeaderUI(calcStore, breakdown);
        updateActivityCountsUI(calcStore, counts);
        updateSelectedCardsUI(calcStore);
        updateMemorySlotsUI(calcStore);

        // 스탯 정보 버튼 리스너
        const infoBtn = document.getElementById('btn-stat-info');
        if (infoBtn) {
            infoBtn.onclick = () => {
                if (window._lastStatBreakdown) showStatDetailModal(window._lastStatBreakdown);
            };
        }

        // 사이드 패널 업데이트 (에러 격리)
        const panel = document.getElementById('calc-side-panel');
        if (panel && panel.classList.contains('open')) {
            updateSidePanelBonuses(panel, counts);
        }

        setupMemorySelector();
    } catch (err) {
        console.error("Critical error in refreshAll:", err);
    }
}

/**
 * 사이드 패널 내의 각 카드 보너스 수치 실시간 업데이트
 */
function updateSidePanelBonuses(panel, counts) {
    try {
        const { baseTotal, bonusTotal } = calculateTotals(calcStore, counts);
        const bonusItems = panel.querySelectorAll('.side-card-item');
        
        bonusItems.forEach(item => {
            const cardId = item.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (!card) return;
            
            const lb = state.supportLB[cardId] || 0;
            const itemCounter = calcStore.itemCounters[cardId] || 0;
            const bonus = calculateCardBonus(card, counts, lb, itemCounter);
            
            let totalVal = (bonus.vocal || 0) + (bonus.dance || 0) + (bonus.visual || 0);
            if (bonus.percent > 0 && card.type && baseTotal[card.type]) {
                totalVal += Math.round(baseTotal[card.type] * (bonus.percent / 100));
            }

            const bonusEl = item.querySelector('.bonus-val');
            if (bonusEl) {
                const displayVal = Math.round(totalVal);
                bonusEl.textContent = displayVal > 0 ? `+${displayVal}` : '';
                
                bonusEl.classList.remove('sp-vocal', 'sp-dance', 'sp-visual');
                if (card.abilities?.includes('sp_lessonup')) {
                    bonusEl.classList.add(`sp-${card.type}`);
                }
            }
            item.style.order = Math.floor(-totalVal);
        });
    } catch (err) {
        console.error("Failed to update side panel bonuses:", err);
    }
}

function setupPItemSelector() {
    const container = document.getElementById('p-item-container');
    if (!container) return;

    const checkbox = document.getElementById('p-item-checkbox');
    if (checkbox) {
        checkbox.checked = (calcStore.pItemChecked === true || calcStore.pItemChecked === 'true');
        checkbox.onchange = (e) => {
            calcStore.pItemChecked = e.target.checked;
            calcStore.save();
            refreshAll();
        };
    }

    if (!calcStore.pItems) calcStore.pItems = [null, null, null, null, null];
    
    const currentType = calcStore.type;
    const itemsBySlot = pItemSlots[currentType] || [];
    const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

    container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
        const val = calcStore.pItems[idx];
        slot.style.borderColor = val ? 'transparent' : '#ddd';
        slot.innerHTML = val ? `<img src="icons/cal/${val}.webp" data-val="${val}">` : '<span class="p-item-placeholder">+</span>';
        
        // Hover 효과 (JS로 추가)
        slot.onmouseenter = () => { slot.style.backgroundColor = `${idolColor}11`; };
        slot.onmouseleave = () => { slot.style.backgroundColor = 'white'; };

        slot.onclick = (e) => {
            e.stopPropagation();
            showPItemSelectorTooltip(slot, idx, itemsBySlot, refreshAll);
        };
    });

    const infoBtn = container.querySelector('.p-item-info-btn');
    if (infoBtn) {
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            showPItemInfoTooltip(infoBtn, pItemDescriptions);
        };
    }
}

// Memory Slots Event Binding
function setupMemorySelector() {
    import('./calcModals.js').then(({ showMemorySelectModal }) => {
        document.querySelectorAll('.memory-slot').forEach((slot, idx) => {
            slot.onclick = (e) => {
                e.stopPropagation();
                showMemorySelectModal(idx, window.refreshAll);
            };
        });
    });
}

// 화면 리사이즈 감지 (768px 경계 안정화)
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    // 768px 경계를 넘어갈 때만 실행
    if ((lastWidth <= 768 && currentWidth > 768) || (lastWidth > 768 && currentWidth <= 768)) {
        if (typeof closeSupportCardPanel === 'function') closeSupportCardPanel();
        const panel = document.getElementById('calc-side-panel');
        const overlay = document.getElementById('panel-overlay');
        if (panel) panel.remove();
        if (overlay) overlay.remove();
    }
    lastWidth = currentWidth;
});

if (!window._calcGlobalInit) {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal') || e.target.closest('.modal-content')) return;
        if (!e.target.closest('.calc-tooltip, .calc-sub-tooltip, .plan-icon-wrapper, .dist-btn, .p-item-slot, .other-tune-btn')) {
            document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip, .p-item-tooltip').forEach(t => t.remove());
        }
    });
    window._calcGlobalInit = true;
}
