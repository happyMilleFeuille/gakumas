// calc.js
import { state, idolColors } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calcStore } from './calcStore.js';
import { pItemDescriptions } from './pItemData.js';
import { getTriggerCounts, calculateTotals } from './calcLogic.js';
import { calculateCardBonus } from './simulator-engine.js';
import { baseStats, getNiaLessonStat, getHajimeLessonStat, idolData, niaAuditionStats, judgingRatios } from './calcStats.js';
import { 
    updateActivityCountsUI, updateSelectedCardsUI, updateStatHeaderUI, 
    renderCalcMenu, renderWeeklyPlan, updateSPBadge, updateMainLabel 
} from './calcUI.js';
import { initGlobalDistListener } from './calcEvents.js';
import { toggleSupportCardPanel, closeSupportCardPanel, showStatDetailModal } from './calcModals.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];

export function initCalc() { 
    window._lastIdolScrollLeft = undefined; // 메뉴 진입 시 스크롤 위치 초기화
    renderCalcMenu(updatePageTranslations, () => startWeeklyPlan('hajime'), () => startWeeklyPlan('nia')); 
}

function startWeeklyPlan(type) {
    calcStore.init(type);
    initGlobalDistListener(refreshAll, getBoardPools);
    
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
                    
                    const renderColumn = (val, color, icon) => {
                        const height = Math.min(100, (val/maxVal)*100);
                        return `
                        <div class="graph-column">
                            <span class="graph-val" style="color: ${color}">${val}</span>
                            <div class="graph-bar-bg">
                                <div class="graph-bar-fill" style="height: ${height}%; background: ${color};"></div>
                            </div>
                            <div class="graph-icon"><img src="icons/${icon}.png"></div>
                        </div>`;
                    };

                    tooltip.innerHTML = `
                        <div class="graph-container">
                            ${renderColumn(circleStats.vocal, '#ff4d8d', 'vocal')}
                            ${renderColumn(circleStats.dance, '#46a4f3', 'dance')}
                            ${renderColumn(circleStats.visual, '#fcc75e', 'visual')}
                        </div>
                    `;

                    // [수정] body가 아닌 공통 부모(icon-outer-container)에 추가하여 버튼과 함께 스크롤되게 함
                    const container = btn.closest('.icon-outer-container');
                    if (container) {
                        const idolId = calcStore.selectedIdol;
                        const idolColor = (idolId === 'lilja') ? "#a0e6ff" : (idolColors[idolId] || "#ff4d8d");
                        
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
                    const getIdolColor = (id) => (id === 'lilja') ? "#a0e6ff" : (idolColors[id] || "#ff4d8d");
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
                            tooltip.className = 'calc-tooltip';
                            tooltip.onclick = (te) => te.stopPropagation(); // 툴팁 내부 클릭 시 닫힘 방지
                            
                            // [추가] 아이돌 색상 적용
                            const idolId = calcStore.selectedIdol;
                            const idolColor = (idolId === 'lilja') ? "#a0e6ff" : (idolColors[idolId] || "#ff4d8d");
                            tooltip.style.borderColor = idolColor;

                            tooltip.innerHTML = opts.map(o => {
                                const label = o[`label_${state.currentLang}`] || o.label_ko;
                                const savedVal = calcStore.weeks[weekNum].opts[o.id];
                                if (o.type === 'checkbox') {
                                    return `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${savedVal === 'true' ? 'checked' : ''}><span>${label}${o.subOptions ? ' ▶' : ''}</span></label>`;
                                } else {
                                    return `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${o.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${savedVal || 0}</span><button class="cnt-btn plus">+</button></div></div>`;
                                }
                            }).join('');
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
                                    if (chk.checked && currentOptDef?.subOptions) showSubTooltip(currentOptDef, weekNum, wrapper, tooltip);
                                    else if (!opts.some(o => o.type === 'counter')) setTimeout(() => { if (!document.querySelector('.calc-sub-tooltip')) removeAllTooltips(); }, 100);
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
                        toggleBar.textContent = isJa ? 'スケジュールを閉じる ▲' : '주간 행동 닫기 ▲';
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
        const { cardBonusTotal, breakdown } = calculateTotals(calcStore, counts);
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

        updateStatHeaderUI(calcStore, cardBonusTotal, spTotals);
        updateActivityCountsUI(calcStore, counts);
        updateSelectedCardsUI(calcStore);

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
    } catch (err) {
        console.error("Critical error in refreshAll:", err);
    }
}

/**
 * 사이드 패널 내의 각 카드 보너스 수치 실시간 업데이트
 */
function updateSidePanelBonuses(panel, counts) {
    try {
        const { baseTotal } = calculateTotals(calcStore, counts);
        const bonusItems = panel.querySelectorAll('.side-card-item');
        
        bonusItems.forEach(item => {
            const cardId = item.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (!card) return;
            
            const lb = state.supportLB[cardId] || 0;
            const bonus = calculateCardBonus(card, counts, lb);
            
            let totalVal = (bonus.vocal || 0) + (bonus.dance || 0) + (bonus.visual || 0);
            if (bonus.percent > 0 && card.type && baseTotal[card.type]) {
                totalVal += Math.round(baseTotal[card.type] * (bonus.percent / 100));
            }

            if (card.item_effects) {
                const counter = calcStore.itemCounters[cardId] || 0;
                card.item_effects.forEach(eff => {
                    if (eff.type === 'fixed' && eff.stats) {
                        totalVal += (eff.stats.vocal || 0) + (eff.stats.dance || 0) + (eff.stats.visual || 0);
                    } else if (eff.type === 'action' && eff.stats && counter > 0) {
                        let multiplier = counter;
                        if (eff.trigger) {
                            const triggers = Array.isArray(eff.trigger) ? eff.trigger : [eff.trigger];
                            let tCount = 0;
                            triggers.forEach(t => {
                                if (t === 'lesson') {
                                    tCount += (counts.lessons.vocal.normal + counts.lessons.vocal.sp + counts.lessons.dance.normal + counts.lessons.dance.sp + counts.lessons.visual.normal + counts.lessons.visual.sp);
                                } else if (t === 'class') {
                                    tCount += (counts.total['class_hajime'] || 0) + (counts.total['class_nia'] || 0);
                                } else if (t === 'gift') {
                                    tCount += (counts.total['gift_hajime'] || 0) + (counts.total['gift_nia'] || 0);
                                } else if (t === 'goout') {
                                    tCount += (counts.total['goout_hajime'] || 0) + (counts.total['goout_nia'] || 0);
                                } else {
                                    tCount += (counts.total[t] || 0);
                                }
                            });
                            multiplier = Math.min(tCount, counter);
                        }
                        if (multiplier > 0) {
                            totalVal += ((eff.stats.vocal || 0) + (eff.stats.dance || 0) + (eff.stats.visual || 0)) * multiplier;
                        }
                    }
                });
            }

            const bonusEl = item.querySelector('.bonus-val');
            if (bonusEl) {
                // 수치가 0보다 클 때만 표시, 소수점은 반올림하여 정수로 처리
                const displayVal = Math.round(totalVal);
                bonusEl.textContent = displayVal > 0 ? `+${displayVal}` : '';
                
                // SP 강조 효과 처리
                bonusEl.classList.remove('sp-vocal', 'sp-dance', 'sp-visual');
                if (card.abilities?.includes('sp_lessonup')) {
                    bonusEl.classList.add(`sp-${card.type}`);
                }
            }
            // 정렬 순서 강제 적용
            item.style.order = Math.floor(-totalVal);
        });
    } catch (err) {
        console.error("Failed to update side panel bonuses:", err);
    }
}

function setupPItemSelector() {
    const container = document.getElementById('p-item-container');
    if (!container) return;

    if (!calcStore.pItems) calcStore.pItems = [null, null, null, null, null];
    
    // 캐릭터별 아이템 구성
    const niaItemsBySlot = [['nia1-1', 'nia1-2'], ['nia2-1', 'nia2-2', 'nia2-3'], ['nia3-1', 'nia3-2'], ['nia4-1', 'nia4-2', 'nia4-3'], ['nia5-1', 'nia5-2', 'nia5-3']];
    const hajimeItemsBySlot = [['hajime1'], ['hajime2'], ['hajime3'], ['hajime4-1', 'hajime4-2', 'hajime4-3']];
    
    const currentType = calcStore.type;
    const itemsBySlot = currentType === 'nia' ? niaItemsBySlot : hajimeItemsBySlot;

    container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
        const val = calcStore.pItems[idx];
        slot.innerHTML = val ? `<img src="icons/cal/${val}.webp" data-val="${val}">` : '<span class="p-item-placeholder">+</span>';
        
        slot.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove());
            
            const isMobile = window.innerWidth <= 768;
            const tooltip = document.createElement('div');
            tooltip.className = 'calc-tooltip p-item-tooltip';
            const tooltipPadding = isMobile ? '8px' : '12px';
            const targetWidth = isMobile ? '170px' : '210px';
            tooltip.style.cssText = `flex-direction:row; flex-wrap:wrap; width:${targetWidth}; min-width:140px; gap:8px; justify-content:flex-start; padding:${tooltipPadding}; box-sizing:border-box;`;

            const btnSize = isMobile ? '32px' : '40px';
            const clearBtn = document.createElement('div');
            clearBtn.textContent = 'X'; clearBtn.className = 'calc-btn-square'; // 충돌 방지를 위해 클래스명 변경 또는 커스텀
            clearBtn.style.cssText = `width:${btnSize}; height:${btnSize}; min-width:0 !important; aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center; font-size:${isMobile ? '1rem' : '1.2rem'}; background:#f8f9fa; color:#888; border:1px solid #ddd; cursor:pointer; box-sizing:border-box; border-radius:4px;`;
            clearBtn.onclick = () => {
                calcStore.pItems[idx] = null;
                slot.innerHTML = '<span class="p-item-placeholder">+</span>';
                calcStore.save(); refreshAll(); tooltip.remove();
            };
            tooltip.appendChild(clearBtn);

            const slotItems = itemsBySlot[idx] || [];
            slotItems.forEach(item => {
                const img = document.createElement('img');
                img.src = `icons/cal/${item}.webp`; 
                img.style.cssText = `width:${btnSize}; height:${btnSize}; min-width:0 !important; aspect-ratio:1/1; cursor:pointer; border:1px solid #eee; border-radius:4px; box-sizing:border-box; object-fit:contain;`;
                img.onclick = () => {
                    calcStore.pItems[idx] = item;
                    slot.innerHTML = `<img src="icons/cal/${item}.webp" data-val="${item}">`;
                    calcStore.save(); refreshAll(); tooltip.remove();
                };
                tooltip.appendChild(img);
            });
            // [수정] body가 아닌 slot에 추가하여 스크롤 연동
            slot.appendChild(tooltip);
            tooltip.style.left = '50%';
            tooltip.style.bottom = '100%';
            tooltip.style.top = 'auto'; // 기존 top 설정 제거
            tooltip.style.marginBottom = '10px';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = '1000';
        };
    });

    const infoBtn = container.querySelector('.p-item-info-btn');
    if (infoBtn) {
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            if (document.querySelector('.p-item-info-tooltip')) { document.querySelector('.p-item-info-tooltip').remove(); return; }
            
            const isMobile = window.innerWidth <= 768;
            const tooltip = document.createElement('div');
            tooltip.className = 'calc-tooltip p-item-info-tooltip';
            tooltip.style.cssText = `position: absolute; width: max-content; max-width: 95vw; padding: ${isMobile ? '6px 8px' : '12px 15px'}; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(8px); border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: ${isMobile ? '0.65rem' : '0.85rem'}; color: #333; line-height: 1.2; z-index: 10000; white-space: nowrap;`;
            
            const imgSize = isMobile ? '16px' : '24px';
            const gap = isMobile ? '4px' : '8px';

            const isJa = state.currentLang === 'ja';
            const items = pItemDescriptions[calcStore.type] || [];
            
            let contentHtml = items.map(item => {
                if (item.type === 'separator') return `<div style="height: 1px; background: #eee; margin: 1px 0;"></div>`;
                const iconsHtml = item.icons.map(icon => `<img src="icons/cal/${icon}.webp" style="width: ${imgSize}; height: ${imgSize}; border-radius: 4px;">`).join('<div style="width:2px;"></div>');
                return `<div style="display: flex; align-items: center; gap: ${gap};">
                            <div style="display: flex; align-items: center; gap: 2px;">${iconsHtml}</div>
                            <span>${isJa ? (item.ja || item.ko) : item.ko}</span>
                        </div>`;
            }).join('');

            tooltip.innerHTML = `<div style="display: flex; flex-direction: column; gap: ${gap};">${contentHtml}</div>`;
            document.body.appendChild(tooltip);
            const rect = infoBtn.getBoundingClientRect();
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            let left = rect.left;
            let top = rect.bottom + window.scrollY + 8;

            // 가로 위치 보정
            if (left + tooltipWidth > window.innerWidth - 10) {
                left = window.innerWidth - tooltipWidth - 10;
            }
            if (left < 10) left = 10;

            // 세로 위치 보정 (화면 하단을 벗어나면 위로 띄움)
            if (rect.bottom + tooltipHeight + 20 > window.innerHeight) {
                top = rect.top + window.scrollY - tooltipHeight - 8;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        };
    }
}

function getBoardPools(type, store) {
    const resArr = { enhance: { generic: 0, m: 0, a: 0 }, delete: { generic: 0, m: 0, a: 0 }, get: { generic: 0, m: 0, a: 0, t: 0 } };
    Object.values(store.weeks).forEach(week => {
        const val = week.value; if(!val) return;
        const opts = week.opts || {};
        const res = (Object.keys(opts).filter(k => opts[k] === 'true' || !isNaN(opts[k])).flatMap(optId => {
            const countInc = (opts[optId] === 'true' ? 1 : parseInt(opts[optId]));
            const optDef = (activityOptions[val] || []).find(o => o.id === optId) || (activityOptions[val] || []).flatMap(o => o.subOptions || []).find(so => so.id === optId);
            return Array(countInc).fill((optDef && optDef.results) ? optDef.results : [optId]).flat();
        }));
        res.forEach(id => {
            if (['enhance', 'ranenhance'].includes(id)) resArr.enhance.generic++;
            else if (id === 'enhance_m') resArr.enhance.m++;
            else if (id === 'enhance_a') resArr.enhance.a++;
            else if (id === 'delete') resArr.delete.generic++;
            else if (id === 'delete_m') resArr.delete.m++;
            else if (id === 'delete_a') resArr.delete.a++;
            else if (id === 'get') resArr.get.generic++;
            else if (id === 'get_m') resArr.get.m++;
            else if (id === 'get_a') resArr.get.a++;
            else if (id === 'get_t') resArr.get.t++;
        });
    });
    if (type === 'nia' && store.pItems) {
        const boardCounts = {};
        Object.values(store.weeks).forEach(w => { if(w.value) boardCounts[w.value] = (boardCounts[w.value] || 0) + 1; });
        let niaBonusGet = 0, niaBonusDelete = 0, niaBonusEnhance = 0;
        if (store.pItems.includes('nia1-1')) { const b = Math.min(boardCounts['spclass'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        if (store.pItems.includes('nia1-2')) { const b = Math.min(boardCounts['advice'] || 0, 2); niaBonusGet += b; niaBonusDelete += b; }
        let n21 = 0, n41 = 0;
        Object.keys(store.weeks).forEach(wNum => {
            const week = store.weeks[wNum]; if(week.value === 'class_nia' && week.opts.get_enhancedcard === 'true') { n21++; if (parseInt(wNum) >= 10) n41++; }
        });
        if (store.pItems.includes('nia2-1')) { const b = Math.min(n21, 2); niaBonusGet += b; niaBonusDelete += b; }
        resArr.get.generic += niaBonusGet; resArr.delete.generic += niaBonusDelete; resArr.enhance.generic += niaBonusEnhance;
    }
    return resArr;
}

function showSubTooltip(parent, week, wrapper, pTooltip) {
    const sub = document.createElement('div'); sub.className = 'calc-tooltip calc-sub-tooltip'; sub.style.zIndex = '1100'; sub.style.backgroundColor = '#fefefe'; 
    
    // [추가] 아이돌 색상 적용
    const idolId = calcStore.selectedIdol;
    const idolColor = (idolId === 'lilja') ? "#a0e6ff" : (idolColors[idolId] || "#ff4d8d");
    sub.style.border = `1px solid ${idolColor}`;

    sub.innerHTML = parent.subOptions.map(o => `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${calcStore.weeks[week].opts[o.id] === 'true' ? 'checked' : ''}><span>${o[`label_${state.currentLang}`] || o.label_ko}</span></label>`).join('');
    
    // [수정] wrapper에 추가하여 스크롤 연동
    wrapper.appendChild(sub); 
    sub.style.left = '50%'; 
    sub.style.top = '50%'; 
    sub.style.transform = 'translate(-50%, -50%)';
    sub.style.position = 'absolute';
    sub.style.width = 'max-content';

    sub.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = () => {
            if (chk.checked) {
                sub.querySelectorAll('input[type="checkbox"]').forEach(other => {
                    if (other !== chk && other.checked) {
                        other.checked = false;
                        calcStore.updateWeekOpt(week, other.dataset.id, false);
                        wrapper.dataset[`opt${other.dataset.id}`] = 'false';
                    }
                });
            }
            calcStore.updateWeekOpt(week, chk.dataset.id, chk.checked);
            wrapper.dataset[`opt${chk.dataset.id}`] = String(chk.checked);
            updateMainLabel(wrapper);
            setTimeout(() => { document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip').forEach(t => t.remove()); }, 100);
            refreshAll();
        };
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
