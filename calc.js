// calc.js
import { state, idolColors } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { PRESET_EXPORT_ENDPOINT } from './ui.js';
import { calcPlans, baseStats, idolData, niaAuditionStats, judgingRatios, hifPrimaStellaIdols, hifParameterLimitBonuses } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { abilityData } from './abilitydata.js';
import { calcStore } from './calcStore.js';
import { pItemDescriptions, pItemSlots } from './pItemData.js';
import { getTriggerCounts, calculateTotals, getNiaLessonStat, getHajimeLessonStat, getSupportPercentBonusForCard } from './calcLogic.js';
import { calculateCardBonus } from './simulator-engine.js';
import { skillCardList } from './skillcarddata.js';
import {
    updateActivityCountsUI, updateSelectedCardsUI, updateStatHeaderUI,
    renderCalcMenu, renderWeeklyPlan, updateSPBadge, updateMainLabel,
    showSubTooltip, showPItemSelectorTooltip, showPItemInfoTooltip, showSupportItemTooltip,
    getIdolDisplayColor, updateMemorySlotsUI, syncDisabledSelectedCards, showTalentBloomInfoTooltip,
    showToast
} from './calcUI.js';
import { initGlobalDistListener } from './calcEvents.js';
import { toggleSupportCardPanel, closeSupportCardPanel, showStatDetailModal, syncSupportPanelUI, showRecommendModal, showOtherTuneModal, showConfirmResetModal } from './calcModals.js';
import { initRecommendationFeature } from './calcRecommend.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);
const hifClassActionIds = ['class_hif', 'class_hif0', 'class_hif1'];

function getVisibleIdolList(type) {
    if (type === 'hif') return idolList.filter(id => hifPrimaStellaIdols.includes(id));
    return idolList;
}

function migrateOldPresets() {
    try {
        const migratedFlag = localStorage.getItem('calc_presets_migrated_to_unified_v2');
        if (migratedFlag === 'true') return;

        const modes = ['hajime', 'nia', 'hif'];
        const plans = ['sense', 'logic', 'anomaly'];
        const idols = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];

        idols.forEach(idol => {
            modes.forEach(mode => {
                const oldPresets = [];
                plans.forEach(planType => {
                    for (let i = 1; i <= 15; i++) {
                        const oldKey = `calc_preset_slot_${mode}_${idol}_${planType}_${i}`;
                        const raw = localStorage.getItem(oldKey);
                        if (raw) {
                            try {
                                const parsed = JSON.parse(raw);
                                if (parsed && parsed.calcState) {
                                    oldPresets.push({
                                        oldKey,
                                        data: parsed
                                    });
                                }
                            } catch (e) {}
                        }
                    }
                });

                if (oldPresets.length === 0) return;

                let nextNewSlot = 1;
                oldPresets.forEach(item => {
                    while (nextNewSlot <= 15) {
                        const newKey = `calc_preset_slot_${mode}_${idol}_${nextNewSlot}`;
                        if (!localStorage.getItem(newKey)) {
                            item.data.slotId = nextNewSlot;
                            // No text prefixing needed, visual icons are displayed instead
                            localStorage.setItem(newKey, JSON.stringify(item.data));
                            localStorage.removeItem(item.oldKey);
                            nextNewSlot++;
                            break;
                        }
                        nextNewSlot++;
                    }
                });
            });
        });

        localStorage.setItem('calc_presets_migrated_to_unified_v2', 'true');
    } catch (err) {
        console.warn('Failed to migrate old presets:', err);
    }
}


export function initCalc(mode) {
    migrateOldPresets();
    window._lastIdolScrollLeft = undefined; // 메뉴 진입 시 스크롤 위치 초기화

    sessionStorage.removeItem('is_loading_preset');

    const loadedToast = sessionStorage.getItem('preset_loaded_toast');
    if (loadedToast) {
        sessionStorage.removeItem('preset_loaded_toast');
        setTimeout(() => {
            showToast(loadedToast);
        }, 300);
    }

    // mode가 명시적으로 있거나, 혹은 localStorage에 기록이 있는 경우 해당 모드로 진입
    // 단, URL이 정확히 #calc라면 메뉴를 보여주기 위해 localStorage를 무시함
    const lastType = mode || (window.location.hash === '#calc' ? null : localStorage.getItem('last_calc_type'));

    if (lastType === 'hajime' || lastType === 'nia' || lastType === 'hif') {
        ensureFloatingSkillButton();
        startWeeklyPlan(lastType);
    } else {
        renderCalcMenu(updatePageTranslations,
            () => window.location.hash = 'calc/hajime',
            () => window.location.hash = 'calc/nia',
            () => window.location.hash = 'calc/hif'
        );
    }
}

function ensureFloatingSkillButton() {
    let btn = document.getElementById('floating-skill-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'floating-skill-btn';
        btn.className = 'floating-skill-btn calc-tune-btn';
        btn.innerHTML = '<img src="icons/check-square.svg" alt="Card">';
        document.body.appendChild(btn);
    }
}

function restoreIdolGridPosition(grid) {
    if (!grid) return;

    if (window._lastIdolScrollLeft !== undefined) {
        grid.scrollLeft = window._lastIdolScrollLeft;
    }

    const activeItem = grid.querySelector('.idol-sel-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
        window._lastIdolScrollLeft = grid.scrollLeft;
    }
}

function applyCalcThemeColor(color) {
    document.querySelectorAll('.plan-icon-wrapper.active').forEach(w => {
        if (w.classList.contains('large-icon')) {
            w.style.setProperty('--idol-color', color);
            w.style.filter = `drop-shadow(1.5px 0 0 ${color}) drop-shadow(-1.5px 0 0 ${color}) drop-shadow(0 1.5px 0 ${color}) drop-shadow(0 -1.5px 0 ${color}) drop-shadow(0 0 3px ${color})`;
        } else {
            w.style.borderColor = color;
            w.style.boxShadow = 'none';
        }
        const badge = w.querySelector('.sp-badge');
        if (badge) badge.style.backgroundColor = color;
    });

    document.querySelectorAll('.info-i-btn').forEach(iBtn => {
        iBtn.style.backgroundColor = color;
    });

    document.querySelectorAll('.plan-type-btn.active').forEach(btn => {
        btn.style.setProperty('--idol-color', color);
    });

    document.querySelectorAll('.talent-toggle-item').forEach(btn => {
        btn.style.setProperty('--idol-color', color);
    });

    // [추가] 사이드 패널 및 카드 아이템에 색상 변수 반영
    const sidePanel = document.getElementById('calc-side-panel');
    if (sidePanel) {
        sidePanel.style.setProperty('--idol-color', color);
        sidePanel.style.setProperty('--idol-color-shadow', color + '4d'); // 30% 투명도
    }

    const runCalcBtn = document.getElementById('btn-run-calc');
    if (runCalcBtn) {
        runCalcBtn.style.backgroundColor = color;
        runCalcBtn.style.boxShadow = `0 2px 6px ${color}33`;
    }

    const floatingBtn = document.getElementById('floating-skill-btn');
    if (floatingBtn) {
        floatingBtn.style.setProperty('--idol-color', color);
        floatingBtn.style.setProperty('--idol-color-shadow', color + '66');
    }

    const statHeader = document.querySelector('.stat-header');
    if (statHeader) statHeader.style.borderColor = color;

    document.querySelectorAll('.board-title-row').forEach(row => {
        row.style.backgroundColor = color;
        row.style.borderColor = color;
    });

    document.querySelectorAll('.preset-brand-icon').forEach(icon => {
        icon.style.backgroundColor = color;
    });

    const totalContainer = document.getElementById('total-stats-sum-container');
    if (totalContainer) {
        totalContainer.style.backgroundColor = color;
        totalContainer.style.boxShadow = `0 2px 6px ${color}33`;
    }

    document.querySelectorAll('.p-item-slot').forEach(slot => {
        const hasImg = slot.querySelector('img');
        slot.style.borderColor = hasImg ? 'transparent' : '#ddd';

    });

    const pItemInfoBtn = document.querySelector('.p-item-info-btn');
    if (pItemInfoBtn) {
        pItemInfoBtn.style.backgroundColor = '#f8f9fa';
        pItemInfoBtn.style.color = '#666';
    }

    if (sidePanel) {
        const currentPlanCards = calcStore.planCards[calcStore.planType] || [];
        sidePanel.querySelectorAll('.side-card-item.selected').forEach(card => {
            const isSixth = currentPlanCards.indexOf(card.dataset.id) === 5;
            card.style.borderColor = isSixth ? '#8FDDBA' : color;
        });
    }
}

function isIncompleteWeekSelection(wrapper) {
    const value = wrapper.dataset.value;
    const optsDef = activityOptions[value] || [];
    const checkboxOpts = optsDef.filter(o => o.type === 'checkbox');
    if (checkboxOpts.length === 0) return false;

    const week = wrapper.closest('.week-row')?.dataset.week;
    const savedOpts = calcStore.weeks[week]?.opts || {};
    const hasCheckedOption = checkboxOpts.some(o => savedOpts[o.id] === 'true');
    const requiresAttr = value === 'class_hajime' || value === 'class_nia' || hifClassActionIds.includes(value);
    const requiresSubAttr = calcStore.type === 'hif' && ['lessonvo', 'lessondan', 'lessonvi'].includes(value);
    const hasSelectedAttr = !!savedOpts.selectedAttr;
    const hasSelectedSubAttr = !!savedOpts.selectedSubAttr;

    if (requiresAttr) {
        return hasCheckedOption !== hasSelectedAttr;
    }

    if (requiresSubAttr) {
        return hasCheckedOption !== hasSelectedSubAttr;
    }

    return !hasCheckedOption;
}

function clearIncompleteWeekSelections(exclude = null) {
    let changed = false;
    document.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        if (wrapper === exclude) return;
        if (!isIncompleteWeekSelection(wrapper)) return;

        const week = wrapper.closest('.week-row')?.dataset.week;
        if (!week) return;

        calcStore.setWeekAction(week, '', {});
        wrapper.classList.remove('active');
        wrapper.style.filter = '';
        wrapper.style.borderColor = '';
        wrapper.style.boxShadow = '';
        updateSPBadge(wrapper, calcStore.selectedIdol);
        updateMainLabel(wrapper);
        changed = true;
    });

    return changed;
}

function bindIdolSelector(grid, refreshAll) {
    document.querySelectorAll('.idol-sel-item').forEach(item => {
        item.onclick = (e) => {
            if (window._isDraggingIdol) {
                e.preventDefault();
                return;
            }

            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            if (item.classList.contains('active')) return;

            calcStore.setSelectedIdol(item.dataset.id);
            document.querySelectorAll('.idol-sel-item').forEach(i => i.classList.remove('active'));

            const color = getIdolDisplayColor(item.dataset.id);
            item.style.setProperty('--idol-color', color);
            item.style.setProperty('--idol-color-shadow', color + 'b3');
            item.classList.add('active');

            applyCalcThemeColor(color);


            // 프리셋 슬롯 상세는 닫고, 5개 프리셋 아이콘만 즉시 갱신
            const previewEl = document.getElementById('preset-preview');
            if (previewEl) renderPresetPreview(previewEl);
            const slotsContainer = document.getElementById('calc-preset-slots-container');
            if (slotsContainer) slotsContainer.style.display = 'none';

            refreshAll();
        };
    });

    if (!grid) return;

    let isDown = false;
    let startX;
    let scrollLeft;

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
        setTimeout(() => { window._isDraggingIdol = false; }, 50);
    });
    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) window._isDraggingIdol = true;
        grid.scrollLeft = scrollLeft - walk;
        window._lastIdolScrollLeft = grid.scrollLeft;
    });
}

function startWeeklyPlan(type) {
    calcStore.init(type);

    // [추가] HIF 모드인 경우 강화월간 강제 해제 및 전용 카드 제거
    if (type === 'hif') {
        calcStore.isKyouka = false;
        Object.keys(calcStore.planSkills).forEach(plan => {
            const selected = calcStore.planSkills[plan];
            Object.keys(selected).forEach(id => {
                if (skillCardList[id]?.isKyoukaOnly) {
                    delete selected[id];
                }
            });
        });
        calcStore.save();
    }

    const visibleIdolList = getVisibleIdolList(type);
    if (visibleIdolList.length > 0 && !visibleIdolList.includes(calcStore.selectedIdol)) {
        calcStore.setSelectedIdol(visibleIdolList[0]);
    }

    // URL 해시 동기화 (이미 해당 해시가 아니라면 변경)
    if (window.location.hash !== `#calc/${type}`) {
        window.location.hash = `calc/${type}`;
    }

    initGlobalDistListener(refreshAll);

    const handlers = {
        setupAll: () => {
            const grid = document.getElementById('idol-selector-grid');
            restoreIdolGridPosition(grid);

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
                        if (calcStore.type === 'nia' || calcStore.type === 'hif') {
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
                        const height = Math.min(100, (val / maxVal) * 100);
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
            if (backBtn) backBtn.onclick = () => {
                localStorage.removeItem('last_calc_type');
                window.location.hash = 'calc';
            };

            document.querySelectorAll('.plan-type-btn').forEach(btn => {
                btn.onclick = () => {
                    if (btn.classList.contains('active')) {
                        // ON상태에서 클릭 시 프리셋 토글!
                        window._showPreset = !window._showPreset;
                        localStorage.setItem('calc_show_preset', window._showPreset ? 'true' : 'false');

                        const integratedCard = document.getElementById('preset-integrated-card');
                        if (integratedCard) {
                            integratedCard.style.display = window._showPreset ? 'flex' : 'none';
                        }

                        const optionsRow = document.querySelector('.idol-options-row');
                        if (optionsRow) {
                            optionsRow.style.marginBottom = window._showPreset ? '0' : '12px';
                            optionsRow.style.borderBottomLeftRadius = window._showPreset ? '0' : '12px';
                            optionsRow.style.borderBottomRightRadius = window._showPreset ? '0' : '12px';
                            optionsRow.style.borderBottom = window._showPreset ? '1px solid #ccc' : '1px solid #ddd';
                        }

                        if (window._showPreset) {
                            window._activePresetSlot = null;
                            const previewEl = document.getElementById('preset-preview');
                            if (previewEl) renderPresetPreview(previewEl);

                            const slotsContainer = document.getElementById('calc-preset-slots-container');
                            if (slotsContainer) {
                                slotsContainer.style.display = 'none';
                            }
                        }
                        return;
                    }

                    // OFF상태에서 클릭 시 플랜 변경 및 프리셋 강제 오픈!
                    window._showPreset = true;
                    localStorage.setItem('calc_show_preset', 'true');

                    // [추가] 플랜 전환 직전에 현재 스크롤 위치 저장
                    const currentGrid = document.getElementById('idol-selector-grid');
                    if (currentGrid) window._lastIdolScrollLeft = currentGrid.scrollLeft;

                    calcStore.setPlanType(btn.dataset.type);
                    startWeeklyPlan(type);
                };
            });

            // [추가] 자동 추천 기능 초기화
            initRecommendationFeature(
                calcStore,
                calcPlans,
                refreshAll,
                syncSupportPanelUI,
                showToast,
                state,
                showRecommendModal,
                () => {
                    if (window.innerWidth > 768) {
                        const panel = document.getElementById('calc-side-panel');
                        if (!panel || !panel.classList.contains('open')) {
                            toggleSupportCardPanel(calcStore.planType, refreshAll);
                        }
                    }
                }
            );

            bindIdolSelector(grid, refreshAll);

            const board = document.querySelector('.unified-plan-board');
            if (board) {
                const removeAllTooltips = (exclude = null) => {
                    document.querySelectorAll('.plan-icon-wrapper').forEach(w => {
                        w.style.zIndex = '';
                        w.style.filter = '';
                        w.style.transition = '';
                        w.style.transform = '';
                        w.onmouseenter = null;
                        w.onmouseleave = null;
                    });
                    document.querySelectorAll('.hif-test-tooltip').forEach(t => {
                        const weekStr = t.dataset.weekNum;
                        if (weekStr !== undefined) {
                            const weekIdx = parseInt(weekStr);
                            const inputs = Array.from(t.querySelectorAll('.hif-test-stat-input'));
                            const allZero = inputs.every(input => {
                                const v = input.value.trim();
                                return v === "" || v === "0";
                            });

                            if (allZero) {
                                // 값이 없으면 저장소에서 해당 주차 행동을 'none'으로 초기화
                                calcStore.setWeekAction(weekIdx, 'none', {});

                                // 화면상의 아이콘 상태도 즉시 초기화
                                const targetWrapper = document.querySelector(`.week-row[data-week="${weekIdx}"] .plan-icon-wrapper.active[data-value="test"]`);
                                if (targetWrapper) {
                                    targetWrapper.classList.remove('active');
                                    targetWrapper.style.filter = '';
                                    targetWrapper.style.borderColor = '';
                                    targetWrapper.style.transform = '';
                                }
                            }
                        }
                        t.remove();
                    });
                    document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip').forEach(t => t.remove());
                    clearIncompleteWeekSelections(exclude);
                    refreshAll();
                };

                board.onclick = (e) => {
                    const wrapper = e.target.closest('.plan-icon-wrapper');
                    if (!wrapper || e.target.closest('.calc-tooltip, .calc-sub-tooltip, .dist-btn')) return;

                    // 이벤트 전파 방지 (모바일 클릭/터치 간섭 방지)
                    e.stopPropagation();

                    const weekNum = wrapper.closest('.week-row').dataset.week;
                    const val = wrapper.dataset.value;
                    calcStore.activeWeek = weekNum;

                    if (wrapper.classList.contains('active')) {
                        calcStore.setWeekAction(weekNum, '', {});
                        wrapper.classList.remove('active');
                        Object.keys(wrapper.dataset).forEach(k => { if (k.startsWith('opt')) delete wrapper.dataset[k]; });
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
                            Object.keys(w.dataset).forEach(k => { if (k.startsWith('opt')) delete w.dataset[k]; });
                            w.querySelectorAll('.sp-badge, .main-label-text').forEach(el => el.remove());
                        });
                        calcStore.setWeekAction(weekNum, val, {});
                        wrapper.classList.add('active');

                        if (wrapper.classList.contains('large-icon')) {
                            const idolColor = idolColors[calcStore.selectedIdol] || "#ff4d8d";
                            wrapper.style.setProperty('--idol-color', idolColor);
                        } else {
                            wrapper.style.borderColor = idolColor;
                            wrapper.style.boxShadow = 'none';
                        }

                        updateSPBadge(wrapper, calcStore.selectedIdol); updateMainLabel(wrapper);
                        removeAllTooltips(wrapper);

                        const opts = activityOptions[val];
                        if (calcStore.type === 'hif' && val === 'test') {
                            // 기존에 열려있는 HIF 테스트 툴팁이 있다면 제거
                            document.querySelectorAll('.hif-test-tooltip').forEach(t => t.remove());

                            const isMobile = window.innerWidth <= 768;
                            const tooltip = document.createElement('div');
                            tooltip.className = 'hif-test-tooltip';
                            tooltip.dataset.weekNum = weekNum; // 주차 정보 저장
                            tooltip.style.backgroundColor = 'white';
                            tooltip.style.padding = '12px';
                            tooltip.style.borderRadius = '10px';
                            tooltip.onclick = (te) => te.stopPropagation();

                            const idolId = calcStore.selectedIdol;
                            const idolColor = idolColors[idolId] || "#ff4d8d";
                            tooltip.style.border = `1px solid ${idolColor}`;
                            tooltip.style.cursor = 'default'; // 툴팁 내부에선 일반 커서 사용

                            // 툴팁이 열려있는 동안은 아이콘이 커지지 않게 설정
                            const originalTransform = wrapper.style.transform;
                            const originalTransition = wrapper.style.transition;
                            wrapper.style.transition = 'none'; // 즉시 크기가 돌아가도록 애니메이션 끄기
                            wrapper.onmouseenter = () => { wrapper.style.transform = 'none'; };
                            wrapper.onmouseleave = () => { wrapper.style.transform = 'none'; };
                            wrapper.style.transform = 'none';


                            const savedOpts = calcStore.weeks[weekNum].opts || {};
                            const defaultTestValue = 0;
                            const fields = [
                                { key: 'hif_test_vocal', icon: 'vocal', color: '#ff4d8d', label: 'Vo' },
                                { key: 'hif_test_dance', icon: 'dance', color: '#46a4f3', label: 'Da' },
                                { key: 'hif_test_visual', icon: 'visual', color: '#fcc75e', label: 'Vi' }
                            ];

                            tooltip.innerHTML = `
                                <div style="display:flex; flex-direction:column; gap:${isMobile ? '6px' : '10px'}; min-width:${isMobile ? '160px' : '190px'};">
                                    <div class="hif-test-desc" style="font-size:${isMobile ? '0.56rem' : '0.62rem'}; line-height:1.3; color:#666; text-align:center; max-width:${isMobile ? '180px' : '220px'};">
                                        ${t(savedOpts.hif_test_use_perc === 'true' ? 'hif_test_tooltip_desc_inc' : 'hif_test_tooltip_desc')}
                                    </div>
                                    <div style="display:grid; grid-template-columns:repeat(3, minmax(${isMobile ? '48px' : '58px'}, 1fr)); gap:${isMobile ? '6px' : '10px'}; align-items:start;">
                                    ${fields.map(field => `
                                        <label style="display:flex; flex-direction:column; align-items:center; gap:${isMobile ? '4px' : '6px'};">
                                            <img src="icons/${field.icon}.png" alt="${field.label}" style="width:${isMobile ? '15px' : '18px'}; height:${isMobile ? '15px' : '18px'};">
                                            <input
                                                type="number"
                                                inputmode="numeric"
                                                max="999"
                                                class="hif-test-stat-input"
                                                data-id="${field.key}"
                                                value="${savedOpts[field.key] ?? defaultTestValue}"
                                                placeholder="0"
                                                style="width:${isMobile ? '48px' : '58px'}; border:1px solid ${field.color}55; border-radius:6px; padding:${isMobile ? '4px 5px' : '5px 6px'}; font-size:${isMobile ? '0.72rem' : '0.8rem'}; outline:none; text-align:center;"
                                            >
                                        </label>
                                    `).join('')}
                                    </div>
                                    <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; width:100%;">
                                        <button class="hif-test-perc-btn" style="width:${isMobile ? '26px' : '30px'}; height:${isMobile ? '26px' : '30px'}; background:${savedOpts.hif_test_use_perc === 'true' ? idolColor : 'white'}; color:${savedOpts.hif_test_use_perc === 'true' ? 'white' : idolColor}; border:1px solid ${idolColor}; border-radius:50%; cursor:pointer; font-weight:bold; font-size:${isMobile ? '0.7rem' : '0.8rem'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">%</button>
                                        <button class="hif-test-complete-btn" style="flex:1; height:${isMobile ? '26px' : '30px'}; background:${idolColor}; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:${isMobile ? '0.7rem' : '0.8rem'}; display:flex; align-items:center; justify-content:center;">${t('hif_test_complete')}</button>
                                    </div>
                                </div>
                            `;

                            // 아이콘(wrapper)에 직접 추가하여 스크롤 시 완벽하게 따라가도록 설정
                            const originalZ = wrapper.style.zIndex;
                            const originalFilter = wrapper.style.filter; // 기존 필터 저장

                            wrapper.style.zIndex = '50002'; // 다른 주차보다 위에 표시되도록
                            wrapper.style.setProperty('filter', 'none', 'important'); // CSS의 drop-shadow 끄기
                            wrapper.appendChild(tooltip);

                            tooltip.style.position = 'absolute';
                            tooltip.style.left = '50%';
                            tooltip.style.top = '50%';
                            tooltip.style.transform = 'translate(-50%, -50%)';
                            tooltip.style.width = 'max-content';
                            tooltip.style.zIndex = '50001';

                            // 완료 버튼 클릭 시에만 닫기
                            tooltip.querySelector('.hif-test-complete-btn').onclick = (e) => {
                                e.stopPropagation();

                                // 모든 입력값이 0인지 확인
                                const inputs = Array.from(tooltip.querySelectorAll('.hif-test-stat-input'));
                                const allZero = inputs.every(input => (parseInt(input.value) || 0) === 0);

                                if (allZero) {
                                    // 값이 없으면 선택 해제
                                    calcStore.setWeekAction(weekNum, 'none', {});
                                    wrapper.classList.remove('active');
                                    wrapper.style.filter = '';
                                    wrapper.style.borderColor = '';
                                    wrapper.style.boxShadow = '';
                                    wrapper.querySelectorAll('.sp-badge, .main-label-text').forEach(el => el.remove());
                                    updateSPBadge(wrapper, calcStore.selectedIdol);
                                    updateMainLabel(wrapper);
                                }

                                tooltip.remove();
                                wrapper.style.zIndex = originalZ;
                                wrapper.style.filter = originalFilter;
                                wrapper.style.transition = originalTransition;
                                wrapper.style.transform = originalTransform;
                                wrapper.onmouseenter = null;
                                wrapper.onmouseleave = null;

                                refreshAll();
                            };

                            // % 버튼 클릭 토글 로직 추가
                            const percBtn = tooltip.querySelector('.hif-test-perc-btn');
                            percBtn.onclick = (e) => {
                                e.stopPropagation();
                                const isCurrentlyPerc = calcStore.weeks[weekNum].opts.hif_test_use_perc === 'true';
                                const nextState = !isCurrentlyPerc;

                                calcStore.updateWeekOpt(weekNum, 'hif_test_use_perc', String(nextState));
                                percBtn.style.background = nextState ? idolColor : 'white';
                                percBtn.style.color = nextState ? 'white' : idolColor;

                                // 설명 텍스트 업데이트
                                const descEl = tooltip.querySelector('.hif-test-desc');
                                if (descEl) {
                                    descEl.innerHTML = t(nextState ? 'hif_test_tooltip_desc_inc' : 'hif_test_tooltip_desc');
                                }

                                refreshAll();
                            };

                            tooltip.querySelectorAll('input[type="number"]').forEach(input => {
                                const syncValue = () => {
                                    const raw = input.value.trim();
                                    if (raw === '') {
                                        calcStore.updateWeekOpt(weekNum, input.dataset.id, null);
                                        delete wrapper.dataset[`opt${input.dataset.id}`];
                                    } else {
                                        const num = Math.min(999, Math.max(0, parseInt(raw) || 0));
                                        input.value = String(num);
                                        calcStore.updateWeekOpt(weekNum, input.dataset.id, num);
                                        wrapper.dataset[`opt${input.dataset.id}`] = String(num);
                                    }
                                    updateMainLabel(wrapper);
                                    refreshAll();
                                };

                                input.addEventListener('input', syncValue);
                                input.addEventListener('change', syncValue);
                            });
                        } else if (opts?.length > 0) {
                            const tooltip = document.createElement('div');
                            const isClass = val === 'class_hajime' || val === 'class_nia' || hifClassActionIds.includes(val);
                            const isHifLesson = calcStore.type === 'hif' && ['lessonvo', 'lessondan', 'lessonvi'].includes(val);
                            const usesAttrColumn = isClass || isHifLesson;
                            tooltip.className = `calc-tooltip ${usesAttrColumn ? 'split-layout' : ''}`;
                            tooltip.onclick = (te) => te.stopPropagation(); // 툴팁 내부 클릭 시 닫힘 방지

                            // [추가] 아이돌 색상 적용
                            const idolId = calcStore.selectedIdol;
                            const idolColor = idolColors[idolId] || "#ff4d8d";
                            tooltip.style.borderColor = idolColor;

                            const savedOpts = calcStore.weeks[weekNum].opts || {};
                            const selectedAttr = savedOpts.selectedAttr || '';
                            const selectedSubAttr = savedOpts.selectedSubAttr || '';
                            const lessonMainAttr = val === 'lessonvo' ? 'vocal' : (val === 'lessondan' ? 'dance' : 'visual');
                            const lessonSubAttrs = ['vocal', 'dance', 'visual'].filter(attr => attr !== lessonMainAttr);

                            const optionsHtml = opts.map(o => {
                                const label = o.labelKey ? t(o.labelKey) : (o[`label_${state.currentLang}`] || o.label_ko || '');
                                const savedVal = savedOpts[o.id];
                                if (o.type === 'checkbox') {
                                    return `<label class="tooltip-option"><input type="checkbox" data-id="${o.id}" ${savedVal === 'true' ? 'checked' : ''}><span>${label}${o.subOptions ? ' ▶' : ''}</span></label>`;
                                } else {
                                    return `<div class="tooltip-option"><span>${label}</span><div class="counter-controls" data-id="${o.id}"><button class="cnt-btn minus">-</button><span class="cnt-val">${savedVal || 0}</span><button class="cnt-btn plus">+</button></div></div>`;
                                }
                            }).join('');

                            if (usesAttrColumn) {
                                const attrItems = isClass
                                    ? ['vocal', 'dance', 'visual'].map(attr => `
                                        <div class="attr-icon-button ${selectedAttr === attr ? 'active' : ''}" data-attr="${attr}" title="${t(`attr_${attr}`)}">
                                            <img src="icons/${attr}.png" alt="${attr}">
                                        </div>
                                    `).join('')
                                    : lessonSubAttrs.map(attr => `
                                        <div class="attr-icon-button ${selectedSubAttr === attr ? 'active' : ''}" data-sub-attr="${attr}" title="${t(`attr_${attr}`)}">
                                            <img src="icons/${attr}.png" alt="${attr}">
                                        </div>
                                    `).join('');

                                const attrColumn = `
                                    <div class="tooltip-attr-column">
                                        ${attrItems}
                                    </div>`;
                                tooltip.innerHTML = `
                                    ${attrColumn}
                                    <div class="tooltip-divider"></div>
                                    <div class="tooltip-options-column">
                                        ${optionsHtml}
                                    </div>`;

                                tooltip.querySelectorAll('.attr-icon-button').forEach(btn => {
                                    btn.onclick = () => {
                                        const isActive = btn.classList.contains('active');
                                        tooltip.querySelectorAll('.attr-icon-button').forEach(b => b.classList.remove('active'));

                                        if (!isActive) {
                                            btn.classList.add('active');
                                            if (isClass) {
                                                calcStore.updateWeekOpt(weekNum, 'selectedAttr', btn.dataset.attr);
                                            } else {
                                                calcStore.updateWeekOpt(weekNum, 'selectedSubAttr', btn.dataset.subAttr);
                                            }

                                            // [추가] 체크박스도 이미 선택되어 있다면 툴팁 닫기
                                            const anyChecked = tooltip.querySelector('input[type="checkbox"]:checked');
                                            if (anyChecked) {
                                                setTimeout(() => removeAllTooltips(), 100);
                                            }
                                        } else {
                                            if (isClass) calcStore.updateWeekOpt(weekNum, 'selectedAttr', null);
                                            else calcStore.updateWeekOpt(weekNum, 'selectedSubAttr', null);
                                        }
                                        updateMainLabel(wrapper);
                                        refreshAll();
                                    };
                                });
                            } else {
                                tooltip.innerHTML = optionsHtml;
                            }
                            wrapper.appendChild(tooltip);

                            // [추가] 바깥 클릭 시 주간 계획 옵션 툴팁 닫기
                            setTimeout(() => {
                                const closeWeeklyTooltip = (e) => {
                                    if (!tooltip.parentElement) {
                                        document.removeEventListener('click', closeWeeklyTooltip);
                                        return;
                                    }
                                    if (!tooltip.contains(e.target) && !wrapper.contains(e.target) && !e.target.closest('.calc-sub-tooltip')) {
                                        tooltip.remove();
                                        document.querySelectorAll('.calc-sub-tooltip').forEach(st => st.remove());
                                        document.removeEventListener('click', closeWeeklyTooltip);
                                    }
                                };
                                document.addEventListener('click', closeWeeklyTooltip);
                            }, 10);

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
                                        // 클래스/HIF 레슨은 속성 선택도 완료되어 있어야 닫음
                                        const hasAttr = !!calcStore.weeks[weekNum].opts.selectedAttr;
                                        const hasSubAttr = !!calcStore.weeks[weekNum].opts.selectedSubAttr;
                                        if (isClass) {
                                            if (chk.checked && hasAttr) {
                                                setTimeout(() => { if (!document.querySelector('.calc-sub-tooltip')) removeAllTooltips(); }, 100);
                                            }
                                        } else if (isHifLesson) {
                                            if (chk.checked && hasSubAttr) {
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

            if (type === 'nia' || type === 'hajime' || type === 'hif') {
                const c = document.getElementById('p-item-container');
                if (c) c.classList.remove('hidden');
                setupPItemSelector();
            } else {
                const c = document.getElementById('p-item-container');
                if (c) c.classList.add('hidden');
            }
            const calcBtn = document.getElementById('btn-run-calc');
            if (calcBtn) calcBtn.onclick = () => toggleSupportCardPanel(calcStore.planType, refreshAll);

            const previewEl = document.getElementById('preset-preview');
            if (previewEl) renderPresetPreview(previewEl);



            const floatingBtn = document.getElementById('floating-skill-btn');

            const resetWeeksBtn = document.getElementById('btn-reset-weeks');
            if (resetWeeksBtn) {
                resetWeeksBtn.onclick = () => {
                    showConfirmResetModal((options) => {
                        const scrollContainer = document.getElementById('idol');
                        const scrollTop = scrollContainer?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
                        
                        calcStore.resetState(options);
                        showToast(t('calc_reset_success'));
                        
                        if (options.supportCards) {
                            if (typeof syncSupportPanelUI === 'function') syncSupportPanelUI();
                        }
                        
                        startWeeklyPlan(type);
                        
                        requestAnimationFrame(() => {
                            if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                            window.scrollTo(0, scrollTop);
                            requestAnimationFrame(() => {
                                if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                                window.scrollTo(0, scrollTop);
                            });
                        });
                    });
                };
            }
            const kyoukaBtn = document.getElementById('btn-kyouka');
            if (kyoukaBtn) {
                kyoukaBtn.classList.toggle('active', !!calcStore.isKyouka);
                kyoukaBtn.onclick = () => {
                    calcStore.isKyouka = !calcStore.isKyouka;

                    // 강화월간이 꺼지면 선택된 강화월간 전용 카드들 제거
                    if (!calcStore.isKyouka) {
                        Object.keys(calcStore.planSkills).forEach(plan => {
                            const selected = calcStore.planSkills[plan];
                            Object.keys(selected).forEach(id => {
                                if (skillCardList[id]?.isKyoukaOnly) {
                                    delete selected[id];
                                }
                            });
                        });
                    }

                    calcStore.save();
                    kyoukaBtn.classList.toggle('active', calcStore.isKyouka);
                    refreshAll();
                };
            }
        }
    };

    renderWeeklyPlan(calcStore, calcPlans, visibleIdolList, handlers);

    window.refreshAll = refreshAll;
    window.renderPresetPreview = renderPresetPreview;
    window.renderCalcPresetSlots = renderCalcPresetSlots;

    // [수정] 렌더링 후 DOM이 확실히 준비된 시점에 초기 계산 수행
    requestAnimationFrame(() => {
        refreshAll();
    });
}

/**
 * [핵심] 모든 수치 계산 및 UI 동기화
 */
function refreshAll() {
    try {
        syncDisabledSelectedCards(calcStore);

        const counts = getTriggerCounts(calcStore);
        const { bonusTotal, finalTotal, breakdown } = calculateTotals(calcStore, counts);
        calcStore.bonusTotal = bonusTotal;
        calcStore.finalTotal = finalTotal;
        window._lastStatBreakdown = breakdown; // 상세 모달용 데이터

        // 플로팅 버튼 데이터 및 색상 업데이트
        const floatingBtn = document.getElementById('floating-skill-btn');
        if (floatingBtn && finalTotal) {
            // 툴팁 HTML 업데이트 (아이콘 포함)
            let tooltip = floatingBtn.querySelector('.floating-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'floating-tooltip';
                floatingBtn.appendChild(tooltip);
            }

            // 카드 수 계산 (모달 헤더 로직과 동일하게 맞춤)
            const activePlan = calcStore.planType;
            const skills = calcStore.planSkills[activePlan] || {};
            const boardGetCount = counts.total.get || 0;

            // 1. 선택된 스킬들 합계
            let selectedCount = Object.values(skills).reduce((a, b) => a + b, 0);

            // 4. 서포트 카드 획득 스킬 중 체크된 것들
            const selectedIds = calcStore.planCards[activePlan] || [];
            selectedIds.forEach(id => {
                if (id && calcStore.cardChecked[id]) {
                    const card = cardList.find(c => c.id === id);
                    if (card && card.have?.startsWith('card_')) selectedCount++;
                }
            });

            // 색상 동기화 및 툴팁 업데이트 준비
            const idolColor = (typeof getIdolDisplayColor === 'function')
                ? getIdolDisplayColor(calcStore.selectedIdol || 'saki')
                : '#ff4d8d';

            floatingBtn.style.setProperty('--idol-color', idolColor);
            floatingBtn.style.setProperty('--idol-color-shadow', idolColor + '66');

            tooltip.innerHTML = `
                <div class="tooltip-header" style="display: flex; justify-content: center; align-items: center; gap: 2px;">
                    <span style="font-size: 0.8rem; font-weight: 800; color: #ffffff;">${selectedCount}</span> 
                    <span style="font-size: 0.8rem; font-weight: 800; color: #ffffff;"> / ${boardGetCount}</span>
                </div>
                <div class="tooltip-row">
                    <div class="tooltip-label"><img src="icons/vocal.png"></div>
                    <span class="tooltip-val vo">${Math.floor(finalTotal.vocal)}</span>
                </div>
                <div class="tooltip-row">
                    <div class="tooltip-label"><img src="icons/dance.png"></div>
                    <span class="tooltip-val da">${Math.floor(finalTotal.dance)}</span>
                </div>
                <div class="tooltip-row">
                    <div class="tooltip-label"><img src="icons/visual.png"></div>
                    <span class="tooltip-val vi">${Math.floor(finalTotal.visual)}</span>
                </div>
            `;
        }

        const spTotals = { vocal: 0, dance: 0, visual: 0 };
        const selectedIds = calcStore.planCards[calcStore.planType] || [];
        selectedIds.forEach(id => {
            if (!id) return;
            const card = cardList.find(c => c.id === id);
            if (card?.abilities?.includes('sp_lessonup')) {
                const lb = (selectedIds.indexOf(id) === 5) ? 4 : (state.supportLB[id] || 0);
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
        setupPItemSelector();
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
        const planCards = calcStore.planCards[calcStore.planType] || [];
        const filledCount = planCards.filter(id => id !== null).length;
        const isSelectingSixth = filledCount === 5 && planCards[5] === null;

        bonusItems.forEach(item => {
            const cardId = item.dataset.id;
            const card = cardList.find(c => c.id === cardId);
            if (!card) return;

            const isSixth = planCards.indexOf(cardId) === 5;
            const isSelectedCard = planCards.includes(cardId);
            const lb = (isSelectingSixth && !isSelectedCard) || isSixth ? 4 : (state.supportLB[cardId] || 0);
            const itemCounter = calcStore.cardChecked?.[cardId] ? (calcStore.itemCounters[cardId] || 0) : 0;
            const includeEvent = !!calcStore.cardEventChecked[cardId];
            const bonus = calculateCardBonus(card, counts, lb, itemCounter, includeEvent);

            let totalVal = (bonus.vocal || 0) + (bonus.dance || 0) + (bonus.visual || 0);
            if (bonus.percent > 0 && card.type) {
                totalVal += getSupportPercentBonusForCard(calcStore, bonus.percent, card.type);
            }

            const bonusEl = item.querySelector('.bonus-val');
            if (bonusEl) {
                const displayVal = Math.floor(totalVal);
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

    const pItemToggle = document.getElementById('p-item-toggle');
    if (pItemToggle) {
        pItemToggle.onclick = (e) => {
            e.preventDefault();
            calcStore.pItemChecked = !calcStore.pItemChecked;
            calcStore.save();
            pItemToggle.classList.toggle('active', calcStore.pItemChecked);
            refreshAll();
        };
    }

    const srToggle = document.getElementById('sr-toggle');
    if (srToggle) {
        srToggle.onclick = (e) => {
            e.preventDefault();
            calcStore.isSR = !calcStore.isSR;

            calcStore.save();

            // 즉시 시각적 상태 업데이트
            srToggle.classList.toggle('active', calcStore.isSR);

            refreshAll();
        };
    }

    const talentInfoBtn = document.querySelector('.talent-bloom-info-btn');
    if (talentInfoBtn) {
        talentInfoBtn.onclick = (e) => {
            e.stopPropagation();
            showTalentBloomInfoTooltip(talentInfoBtn);
        };
    }

    if (!calcStore.pItems) calcStore.pItems = [null, null, null, null, null];
    if (!calcStore.pItemSubOpts) calcStore.pItemSubOpts = [null, null, null, null, null];
    if (!calcStore.pItemSubSubOpts) calcStore.pItemSubSubOpts = [null, null, null, null, null];

    const container = document.getElementById('p-item-container');
    if (container) {
        const currentType = calcStore.type;
        const itemsBySlot = pItemSlots[currentType] || [];
        const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

        container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
            const val = calcStore.pItems[idx];
            slot.style.borderColor = val ? 'transparent' : '#ddd';

            let slotHtml = '';
            if (val) {
                let iconName = val;
                if (currentType === 'hif') {
                    if (calcStore.pItemSubSubOpts && calcStore.pItemSubSubOpts[idx]) {
                        iconName = calcStore.pItemSubSubOpts[idx];
                    } else if (calcStore.pItemSubOpts && calcStore.pItemSubOpts[idx]) {
                        iconName = calcStore.pItemSubOpts[idx];
                    }
                }
                slotHtml = `<img src="icons/cal/${iconName}.webp" data-val="${val}">`;
            } else {
                slotHtml = '<span class="support-bg-text">P-item</span>';
            }
            slot.innerHTML = slotHtml;

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

        container.querySelectorAll('.hif-stat-controls').forEach(ctrl => {
            ctrl.onclick = (e) => {
                e.stopPropagation();
                const btn = e.target.closest('.cnt-btn');
                if (!btn) return;
                const attr = ctrl.dataset.attr;
                let cur = calcStore.hifStats?.[attr] || 0;
                if (btn.classList.contains('plus') && cur < 5) cur++;
                else if (btn.classList.contains('minus') && cur > 0) cur--;

                if (!calcStore.hifStats) calcStore.hifStats = { vocal: 0, dance: 0, visual: 0 };
                if (calcStore.hifStats[attr] !== cur) {
                    calcStore.hifStats[attr] = cur;
                    calcStore.save();
                    ctrl.querySelector('.cnt-val').textContent = cur;
                    const valsContainer = ctrl.closest('.hif-stat-item').querySelector('.hif-bonus-vals');
                    if (valsContainer) {
                        const spans = valsContainer.querySelectorAll('span');
                        if (spans.length >= 2) {
                            spans[0].textContent = `+${cur * 20}`;
                            spans[1].textContent = `+${cur * 2}%`;
                        }
                    }
                    refreshAll();
                }
            };
        });

        container.querySelectorAll('.hif-param-limit-controls').forEach(ctrl => {
            ctrl.onclick = (e) => {
                e.stopPropagation();
                const btn = e.target.closest('.cnt-btn');
                if (!btn) return;

                let cur = calcStore.hifParamLimitLevel || 0;
                if (btn.classList.contains('plus') && cur < 6) cur++;
                else if (btn.classList.contains('minus') && cur > 0) cur--;

                if (calcStore.hifParamLimitLevel !== cur) {
                    calcStore.hifParamLimitLevel = cur;
                    calcStore.save();
                    ctrl.querySelector('.cnt-val').textContent = cur;
                    const valsContainer = ctrl.closest('.hif-param-limit-item').querySelector('.hif-bonus-vals');
                    if (valsContainer) {
                        const span = valsContainer.querySelector('span');
                        if (span) span.textContent = `+${hifParameterLimitBonuses[cur] || 0}`;
                    }
                    refreshAll();
                }
            };
        });
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

function closePresetPanel() {
    const slotsContainer = document.getElementById('calc-preset-slots-container');
    const integratedCard = document.getElementById('preset-integrated-card');
    const previewEl = document.getElementById('preset-preview');
    if (slotsContainer) slotsContainer.style.display = 'none';
    if (integratedCard) {
        integratedCard.style.background = 'transparent';
        integratedCard.style.borderColor = 'transparent';
        integratedCard.style.boxShadow = 'none';
    }
    if (previewEl) previewEl.style.display = 'none';
}

function renderPresetPreview(el) {
    if (window._activePresetSlot === undefined) window._activePresetSlot = null;
    const activeSlot = window._activePresetSlot;
    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';
    const planType = calcStore.planType || 'sense';
    const idolColor = idolColors[idol] || "#ff4d8d";
    let iconsHtml = '';

    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? '20px' : '24px';
    const fontSize = isMobile ? '0.55rem' : '0.65rem';
    const badgeFontSize = isMobile ? '0.4rem' : '0.5rem';
    const badgeOffset = isMobile ? '-3px' : '-2px';

    for (let i = 1; i <= 15; i++) {
        const raw = localStorage.getItem(`calc_preset_slot_${mode}_${idol}_${i}`);
        let hasData = false;
        if (raw) {
            try {
                const data = JSON.parse(raw);
                if (data && data.calcState) {
                    hasData = true;
                    const isActive = i === activeSlot;
                    const activeStyle = isActive ? `border: 2px solid ${idolColor};` : 'border: none;';

                    const plan = data.calcState?.planType || 'sense';
                    const logicShift = plan === 'logic' ? 'transform: translateX(-1px);' : '';

                    iconsHtml += `<div class="preset-circle-slot" data-slot="${i}" style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; width: ${size}; height: ${size}; border-radius: 50%; box-sizing: border-box; ${activeStyle}">
                        <img src="icons/${plan}.webp" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; ${logicShift}">
                        <span style="position: absolute; bottom: ${badgeOffset}; right: ${badgeOffset}; font-size: ${badgeFontSize}; background: ${idolColor}; color: white; border-radius: 3px; padding: 0 2px; font-weight: bold; line-height: 1.2;">${i}</span>
                    </div>`;
                }
            } catch (e) { }
        }
        if (!hasData) {
            const isActive = i === activeSlot;
            const borderStyle = isActive ? `border: 2px solid ${idolColor}; color: ${idolColor}; background: ${idolColor}10;` : 'border: 1.5px dashed #ccc; color: #aaa; background: transparent;';
            iconsHtml += `<div class="preset-circle-slot empty" data-slot="${i}" style="width: ${size}; height: ${size}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${fontSize}; font-weight: bold; cursor: pointer; transition: all 0.15s; box-sizing: border-box; flex-shrink: 0; ${borderStyle}">
                ${i}
            </div>`;
        }
    }
    el.innerHTML = iconsHtml;

    el.querySelectorAll('.preset-circle-slot').forEach(circle => {
        circle.onclick = (e) => {
            e.stopPropagation();
            const slotId = parseInt(circle.dataset.slot);
            const container = document.getElementById('calc-preset-slots-container');
            if (window._activePresetSlot === slotId && container && container.style.display === 'flex') {
                container.style.display = 'none';
                window._activePresetSlot = null;
                renderPresetPreview(el);
            } else {
                window._activePresetSlot = slotId;
                renderPresetPreview(el);
                if (container) {
                    container.style.display = 'flex';
                    renderCalcPresetSlots(container);
                }
            }
        };
    });
}

function renderCalcPresetSlots(container) {
    if (window._activePresetSlot === undefined || window._activePresetSlot === null) window._activePresetSlot = 1;
    const i = window._activePresetSlot;
    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';
    let html = '';

    const slotKey = `calc_preset_slot_${mode}_${idol}_${i}`;
    const raw = localStorage.getItem(slotKey);
    let data = null;
    try { if (raw) data = JSON.parse(raw); } catch (e) { }

    const isMobile = window.innerWidth <= 768;
    const slotPad = isMobile ? '5px 7px' : '10px 12px';
    const iconSize = isMobile ? '22px' : '32px';
    const planIconSize = isMobile ? '12px' : '18px';
    const nameSize = isMobile ? '0.7rem' : '0.9rem';
    const timeSize = isMobile ? '0.5rem' : '0.65rem';
    const noDataSize = isMobile ? '0.68rem' : '0.85rem';
    const btnSize = isMobile ? '18px' : '28px';
    const btnIconSize = isMobile ? '9px' : '14px';
    const btnRadius = isMobile ? '3px' : '6px';
    const contentGap = isMobile ? '5px' : '10px';
    const btnGap = isMobile ? '2px' : '6px';

    if (data && data.calcState) {
        const idolIcon = `icons/idolicons/${data.calcState.selectedIdol || 'saki'}_c.png`;
        let customName = data.customName || `Slot ${i}`;
        // Remove brackets prefix e.g., [SENSE]
        customName = customName.replace(/^\[(SENSE|LOGIC|ANOMALY)\]\s*/i, '');
        // Remove general prefix like SAKI-SENSE or SENSE or SAKI-SENSE 1
        customName = customName.replace(/^(?:(?:SAKI|TEMARI|KOTONE|TSUBAME|MAO|LILJA|CHINA|SUMIKA|HIRO|SENA|MISUZU|UME|RINAMI)-(?:SENSE|LOGIC|ANOMALY)|(?:SENSE|LOGIC|ANOMALY))\s*/i, '');
        // If the resulting name is empty or just a number, make it a clean slot name
        if (!customName.trim() || /^\d+$/.test(customName.trim())) {
            const num = customName.trim() || i;
            customName = `Slot ${num}`;
        }
        const time = data.timestamp || '';
        const plan = data.calcState?.planType || 'sense';
        const idolIconHtmlMain = `<img src="${idolIcon}" style="width: ${iconSize}; height: ${iconSize}; border-radius: 50%; border: 1px solid #ddd; object-fit: contain; flex-shrink: 0;" onerror="this.src='icons/idol.png'">`;
        const planIconHtmlSub = `<img src="icons/${plan}.webp" style="width: ${planIconSize}; height: ${planIconSize}; object-fit: contain; flex-shrink: 0;" title="${plan.toUpperCase()}">`;

        let finalStats = data.finalStats;
        let percentBonus = data.percentBonus;

        if (!finalStats && data.calcState) {
            try {
                const counts = getTriggerCounts(data.calcState);
                const { finalTotal, breakdown } = calculateTotals(data.calcState, counts);
                if (finalTotal) {
                    finalStats = {
                        vocal: Math.floor(finalTotal.vocal ?? 0),
                        dance: Math.floor(finalTotal.dance ?? 0),
                        visual: Math.floor(finalTotal.visual ?? 0),
                        total: Math.floor((finalTotal.vocal ?? 0) + (finalTotal.dance ?? 0) + (finalTotal.visual ?? 0))
                    };
                }
                if (breakdown && breakdown.totalPercs) {
                    percentBonus = {
                        vocal: parseFloat((breakdown.totalPercs.vocal ?? 0).toFixed(1)),
                        dance: parseFloat((breakdown.totalPercs.dance ?? 0).toFixed(1)),
                        visual: parseFloat((breakdown.totalPercs.visual ?? 0).toFixed(1))
                    };
                }
            } catch (e) {
                console.error("Failed to dynamically calculate stats for preset:", e);
            }
        }

        let statsHtml = '';
        if (finalStats) {
            const vo = Number(finalStats.vocal ?? 0);
            const da = Number(finalStats.dance ?? 0);
            const vi = Number(finalStats.visual ?? 0);
            const total = Number(finalStats.total ?? (vo + da + vi));
            
            const voP = Number(percentBonus?.vocal ?? 0);
            const daP = Number(percentBonus?.dance ?? 0);
            const viP = Number(percentBonus?.visual ?? 0);

            const labelTotal = 'TOTAL';
            const statBoxPad = isMobile ? '2px 4px' : '4px 8px';
            const statFontSize = isMobile ? '0.6rem' : '0.8rem';
            const statValFontSize = isMobile ? '0.65rem' : '0.85rem';

            const iconSizeAttr = isMobile ? '10px' : '14px';
            const iconVocal = `<img src="icons/vocal.png" style="width: ${iconSizeAttr}; height: ${iconSizeAttr}; object-fit: contain; flex-shrink: 0;">`;
            const iconDance = `<img src="icons/dance.png" style="width: ${iconSizeAttr}; height: ${iconSizeAttr}; object-fit: contain; flex-shrink: 0;">`;
            const iconVisual = `<img src="icons/visual.png" style="width: ${iconSizeAttr}; height: ${iconSizeAttr}; object-fit: contain; flex-shrink: 0;">`;

            statsHtml = `
                <div style="border-top: 1px dashed #e2e8f0; margin-top: 6px; padding-top: 6px; display: flex; flex-direction: column; gap: ${isMobile ? '3px' : '5px'}; width: 100%;">
                    <!-- Row 1: Attribute Stats -->
                    <div style="display: flex; align-items: center; gap: 4px; width: 100%; justify-content: space-between;">
                        <!-- Vocal Badge -->
                        <div style="display: flex; align-items: center; gap: 4px; background: #fff5f8; border: 1px solid #ffe4ef; border-radius: 6px; padding: ${statBoxPad}; flex: 1; justify-content: center; min-width: 0;">
                            ${iconVocal}
                            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 1px; min-width: 0;">
                                <span style="font-size: ${statValFontSize}; font-weight: 800; color: #d62d6c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${vo}</span>
                                <span style="font-size: ${isMobile ? '0.5rem' : '0.65rem'}; font-weight: 600; color: #ff8cb6; white-space: nowrap;">+${voP.toFixed(1)}%</span>
                            </div>
                        </div>
                        <!-- Dance Badge -->
                        <div style="display: flex; align-items: center; gap: 4px; background: #f0f8ff; border: 1px solid #e3f2fd; border-radius: 6px; padding: ${statBoxPad}; flex: 1; justify-content: center; min-width: 0;">
                            ${iconDance}
                            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 1px; min-width: 0;">
                                <span style="font-size: ${statValFontSize}; font-weight: 800; color: #1565c0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${da}</span>
                                <span style="font-size: ${isMobile ? '0.5rem' : '0.65rem'}; font-weight: 600; color: #7cbbf2; white-space: nowrap;">+${daP.toFixed(1)}%</span>
                            </div>
                        </div>
                        <!-- Visual Badge -->
                        <div style="display: flex; align-items: center; gap: 4px; background: #fffdf5; border: 1px solid #fff1cc; border-radius: 6px; padding: ${statBoxPad}; flex: 1; justify-content: center; min-width: 0;">
                            ${iconVisual}
                            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.1; gap: 1px; min-width: 0;">
                                <span style="font-size: ${statValFontSize}; font-weight: 800; color: #b87c0a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${vi}</span>
                                <span style="font-size: ${isMobile ? '0.5rem' : '0.65rem'}; font-weight: 600; color: #f2cc80; white-space: nowrap;">+${viP.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <!-- Row 2: Total Badge -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: ${statBoxPad}; font-size: ${statFontSize}; color: #475569; font-weight: 700; width: 100%; box-sizing: border-box;">
                        <span>${labelTotal}</span>
                        <span style="font-size: ${statValFontSize}; font-weight: 800; color: #0f172a;">${total}</span>
                    </div>
                </div>
            `;
        }

        html += `
            <div class="preset-slot-item" style="display: flex; flex-direction: column; align-items: stretch; padding: ${slotPad}; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); gap: ${isMobile ? '4px' : '6px'};">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: ${contentGap};">
                    <div style="display: flex; align-items: center; gap: ${contentGap}; flex: 1; min-width: 0;">
                        ${idolIconHtmlMain}
                        <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 4px; min-width: 0;">
                                ${planIconHtmlSub}
                                <span style="font-weight: bold; font-size: ${nameSize}; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${customName}</span>
                            </div>
                            <div style="display: flex; align-items: center; font-size: ${timeSize}; flex-wrap: wrap;">
                                <span style="color: #888;">${time}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: ${btnGap}; flex-shrink: 0;">
                        <button class="slot-btn slot-save" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #ffe4ef; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${t('ui_slot_save')}">
                            <img src="icons/save.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(84%) saturate(884%) hue-rotate(305deg) brightness(88%) contrast(92%);">
                        </button>
                        <button class="slot-btn slot-load" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #e3f2fd; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${t('ui_slot_load')}">
                            <img src="icons/upload.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(94%) saturate(1478%) hue-rotate(189deg) brightness(91%) contrast(92%);">
                        </button>
                        <button class="slot-btn slot-share" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #fff1cc; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${t('ui_slot_share')}">
                            <img src="icons/cloud.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(47%) sepia(97%) saturate(452%) hue-rotate(5deg) brightness(91%) contrast(105%);">
                        </button>
                        <button class="slot-btn slot-delete" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #ffebee; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" title="${t('calc_label_delete')}">
                            <img src="icons/trash.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(84%) saturate(884%) hue-rotate(336deg) brightness(88%) contrast(92%);">
                        </button>
                    </div>
                </div>
                ${statsHtml}
            </div>
        `;
    } else {
        html += `
            <div class="preset-slot-item" style="display: flex; align-items: center; justify-content: space-between; padding: ${slotPad}; background: #fdfdfd; border: 1px dashed #ddd; border-radius: 8px;">
                <div style="font-size: ${noDataSize}; color: #aaa; font-weight: 500;">Slot ${i} - ${t('ui_slot_empty')}</div>
                <div style="display: flex; gap: ${btnGap}; flex-shrink: 0;">
                    <button class="slot-btn slot-save" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #ffe4ef; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${t('ui_slot_save')}">
                        <img src="icons/save.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(36%) sepia(84%) saturate(884%) hue-rotate(305deg) brightness(88%) contrast(92%);">
                    </button>
                    <button class="slot-btn slot-share" data-slot="${i}" style="width: ${btnSize}; height: ${btnSize}; background: #fff1cc; border: none; border-radius: ${btnRadius}; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="${t('ui_slot_share')}">
                        <img src="icons/cloud.svg" style="width: ${btnIconSize}; height: ${btnIconSize}; filter: invert(47%) sepia(97%) saturate(452%) hue-rotate(5deg) brightness(91%) contrast(105%);">
                    </button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    container.querySelectorAll('.slot-save').forEach(btn => {
        btn.onclick = () => {
            showSavePresetModal(btn.dataset.slot, container);
        };
    });
    container.querySelectorAll('.slot-load').forEach(btn => btn.onclick = () => loadCalcPreset(btn.dataset.slot));
    container.querySelectorAll('.slot-share').forEach(btn => {
        btn.onclick = () => {
            openCalcShareModal(btn.dataset.slot, container);
        };
    });
    container.querySelectorAll('.slot-delete').forEach(btn => {
        btn.onclick = () => {
            if (confirm(t('ui_slot_delete_confirm', { slotId: btn.dataset.slot }))) {
                const idol = calcStore.selectedIdol || 'saki';
                localStorage.removeItem(`calc_preset_slot_${mode}_${idol}_${btn.dataset.slot}`);
                renderCalcPresetSlots(container);
                const previewEl = document.getElementById('preset-preview');
                if (previewEl) renderPresetPreview(previewEl);
            }
        };
    });
}

function showSavePresetModal(slotId, container) {
    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';
    const planType = calcStore.planType || 'sense';
    const idolColor = getIdolDisplayColor(idol);
    const isJa = state.currentLang === 'ja';
    const isEn = state.currentLang === 'en';

    const planLabel = planType.toUpperCase();

    const slotKey = `calc_preset_slot_${mode}_${idol}_${slotId}`;
    let existingName = '';
    try {
        const raw = localStorage.getItem(slotKey);
        if (raw) {
            const data = JSON.parse(raw);
            if (data && data.customName) {
                existingName = data.customName;
            }
        }
    } catch (e) { }

    const defaultPresetName = existingName || `Slot ${slotId}`;

    const backdrop = document.createElement('div');
    backdrop.id = 'preset-save-modal';
    backdrop.className = 'modal';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 30000;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 320px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        padding: 20px;
        box-sizing: border-box;
        border: 2px solid ${idolColor};
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;

    const headerTitle = isJa ? 'プリセット保存' : isEn ? 'Save Preset' : '프리셋 저장';
    const descLabel = isJa
        ? '保存するプリセット名を入力してください:'
        : isEn
            ? 'Enter a name for the preset:'
            : '저장할 프리셋의 이름을 입력하세요:';

    const cancelText = isJa ? 'キャンセル' : isEn ? 'Cancel' : '취소';
    const saveText = isJa ? '保存' : isEn ? 'Save' : '저장';

    const planIconHtml = `<img src="icons/${planType}.webp" style="width: 14px; height: 14px; object-fit: contain; flex-shrink: 0;" title="${planLabel}">`;
    const idolIconHtml = `<img src="icons/idolicons/${idol}_c.png" style="width: 18px; height: 18px; border-radius: 50%; border: 1px solid #ddd; object-fit: contain; flex-shrink: 0;" onerror="this.src='icons/idol.png'">`;

    dialog.innerHTML = `
        <div style="font-size: 1rem; font-weight: 800; color: #333; display: flex; align-items: center; gap: 8px; user-select: none;">
            <div style="width: 4px; height: 16px; background-color: ${idolColor}; border-radius: 2px;"></div>
            <span>${headerTitle}</span>
            <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
                ${idolIconHtml}
                ${planIconHtml}
            </div>
        </div>
        <div style="font-size: 0.8rem; color: #666; font-weight: 500; line-height: 1.4; user-select: none;">${descLabel}</div>
        <input type="text" class="preset-name-input" value="${defaultPresetName}" maxlength="15" style="width: 100%; padding: 8px 12px; border: 1.5px solid #ddd; border-radius: 8px; font-size: 0.85rem; box-sizing: border-box; outline: none; font-family: inherit; font-weight: 500; transition: border-color 0.15s;">
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
            <button class="modal-cancel-btn" style="padding: 6px 14px; background: #f5f5f5; color: #555; font-size: 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: inherit; transition: background 0.1s;">${cancelText}</button>
            <button class="modal-save-btn" style="padding: 6px 16px; background: ${idolColor}; color: white; font-size: 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: inherit; box-shadow: 0 2px 4px ${idolColor}33; transition: background 0.1s;">${saveText}</button>
        </div>
    `;

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // 브라우저 뒤로가기 처리를 위해 history state 추가
    history.pushState({ modalOpen: 'presetSave' }, "");

    const input = dialog.querySelector('.preset-name-input');
    const cancelBtn = dialog.querySelector('.modal-cancel-btn');
    const saveBtn = dialog.querySelector('.modal-save-btn');

    if (input) {
        input.focus();
        input.select();

        input.onfocus = () => { input.style.borderColor = idolColor; };
        input.onblur = () => { input.style.borderColor = '#ddd'; };
    }

    const onPopState = () => {
        backdrop.remove();
        window.removeEventListener('popstate', onPopState);
    };
    window.addEventListener('popstate', onPopState);

    const closeModal = () => {
        history.back();
    };

    const executeSave = () => {
        const val = input.value.trim();
        if (val) {
            saveCalcPreset(slotId, val, container);
            closeModal();
        }
    };

    let isMouseDownOnBackdrop = false;
    backdrop.onmousedown = (e) => {
        isMouseDownOnBackdrop = (e.target === backdrop);
    };

    backdrop.onclick = (e) => {
        if (e.target === backdrop && isMouseDownOnBackdrop) {
            closeModal();
        }
    };

    cancelBtn.onclick = closeModal;
    saveBtn.onclick = executeSave;

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            executeSave();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    };
}

function saveCalcPreset(slotId, customName, container) {
    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';

    // Calculate current stats and percentage bonuses
    let finalStats = null;
    let percentBonus = null;
    try {
        const counts = getTriggerCounts(calcStore);
        const { finalTotal, breakdown } = calculateTotals(calcStore, counts);
        if (finalTotal) {
            finalStats = {
                vocal: Math.floor(finalTotal.vocal ?? 0),
                dance: Math.floor(finalTotal.dance ?? 0),
                visual: Math.floor(finalTotal.visual ?? 0),
                total: Math.floor((finalTotal.vocal ?? 0) + (finalTotal.dance ?? 0) + (finalTotal.visual ?? 0))
            };
        }
        if (breakdown && breakdown.totalPercs) {
            percentBonus = {
                vocal: parseFloat((breakdown.totalPercs.vocal ?? 0).toFixed(1)),
                dance: parseFloat((breakdown.totalPercs.dance ?? 0).toFixed(1)),
                visual: parseFloat((breakdown.totalPercs.visual ?? 0).toFixed(1))
            };
        }
    } catch (e) {
        console.error("Failed to pre-calculate stats for preset:", e);
    }

    const data = {
        slotId: parseInt(slotId),
        customName: customName || `Slot ${slotId}`,
        type: mode,
        timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }),
        calcState: calcStore.serializeState(),
        finalStats,
        percentBonus
    };
    localStorage.setItem(`calc_preset_slot_${mode}_${idol}_${slotId}`, JSON.stringify(data));
    showToast(t('calc_preset_save_success', { slotId }));
    renderCalcPresetSlots(container);
    const previewEl = document.getElementById('preset-preview');
    if (previewEl) renderPresetPreview(previewEl);
}

function loadCalcPreset(slotId) {
    if (!confirm(t('calc_preset_load_confirm', { slotId }))) return;
    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';
    const raw = localStorage.getItem(`calc_preset_slot_${mode}_${idol}_${slotId}`);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        if (data && data.calcState) {
            const targetType = data.type || data.calcState.type || mode;
            // Merge preset state with current state to preserve other plans' skill & card selections
            const currentRaw = localStorage.getItem(`calc_state_${targetType}`);
            if (currentRaw) {
                try {
                    const currentState = JSON.parse(currentRaw);
                    if (currentState) {
                        const targetPlan = data.calcState.planType || 'sense';
                        
                        // Normalize preset planSkills/planCards
                        let presetSkills = data.calcState.planSkills || {};
                        if (!presetSkills.sense && !presetSkills.logic && !presetSkills.anomaly) {
                            presetSkills = { sense: { ...presetSkills }, logic: { ...presetSkills }, anomaly: { ...presetSkills } };
                        }
                        let presetCards = data.calcState.planCards || {};
                        if (Array.isArray(presetCards)) {
                            presetCards = { sense: [...presetCards], logic: [...presetCards], anomaly: [...presetCards] };
                        }
                        
                        // Normalize current planSkills/planCards
                        let currentSkills = currentState.planSkills || {};
                        if (!currentSkills.sense && !currentSkills.logic && !currentSkills.anomaly) {
                            currentSkills = { sense: { ...currentSkills }, logic: { ...currentSkills }, anomaly: { ...currentSkills } };
                        }
                        let currentCards = currentState.planCards || {};
                        if (Array.isArray(currentCards)) {
                            currentCards = { sense: [...currentCards], logic: [...currentCards], anomaly: [...currentCards] };
                        }
                        
                        // Merge: only keep the preset's target plan selections, and retain current selections for the other plans
                        const mergedSkills = { ...presetSkills };
                        const mergedCards = { ...presetCards };
                        
                        ['sense', 'logic', 'anomaly'].forEach(plan => {
                            if (plan !== targetPlan) {
                                mergedSkills[plan] = currentSkills[plan] || {};
                                mergedCards[plan] = currentCards[plan] || [];
                            }
                        });
                        
                        data.calcState.planSkills = mergedSkills;
                        data.calcState.planCards = mergedCards;
                    }
                } catch (err) {
                    console.warn('Failed to merge current state with preset:', err);
                }
            }

            // Set flag to prevent pagehide/beforeunload from overwriting this preset
            sessionStorage.setItem('is_loading_preset', 'true');

            // Ensure the preset wins the updatedAt comparison in loadPersistedState
            data.calcState.updatedAt = Date.now();
            const serialized = JSON.stringify(data.calcState);

            // Write to ALL 3 storage keys so loadPersistedState always picks the preset
            localStorage.setItem(`calc_state_${targetType}`, serialized);
            localStorage.setItem(`calc_state_shadow_${targetType}`, serialized);
            sessionStorage.setItem(`calc_state_session_${targetType}`, serialized);
            localStorage.setItem('last_calc_type', targetType);

            // Set toast in session storage to display after reload
            sessionStorage.setItem('preset_loaded_toast', t('calc_preset_load_success', { slotId }));

            // Reload the page to guarantee a perfect and pristine UI refresh
            window.location.reload();
        }
    } catch (e) {
        showToast(t('calc_preset_load_failed'));
    }
}

function openCalcShareModal(slotId, container) {
    let shareModal = document.getElementById('slot-share-modal');
    if (shareModal) shareModal.remove();

    const mode = calcStore.type;
    const idol = calcStore.selectedIdol || 'saki';
    const slotKey = `calc_preset_slot_${mode}_${idol}_${slotId}`;

    const raw = localStorage.getItem(slotKey);
    let data = null;
    try { if (raw) data = JSON.parse(raw); } catch (e) { }

    const displayName = data && data.customName ? `Slot ${slotId} - ${data.customName}` : `Slot ${slotId}`;
    const themeColor = '#ff4d8d';
    const headerTitle = t('ui_slot_share_title');

    const isMobile = window.innerWidth <= 768;
    const modalPadding = isMobile ? '12px 14px 10px' : '18px 18px 16px';
    const modalGap = isMobile ? '8px' : '10px';
    const titleFontSize = isMobile ? '0.85rem' : '1rem';
    const titleBarHeight = isMobile ? '12px' : '16px';
    const containerPadding = isMobile ? '10px' : '12px';
    const nameFontSize = isMobile ? '0.78rem' : '0.85rem';
    const nameMarginBottom = isMobile ? '6px' : '8px';
    const exportMarginBottom = isMobile ? '8px' : '12px';
    const resultFontSize = isMobile ? '0.65rem' : '0.72rem';
    const resultPadding = isMobile ? '3px 6px' : '4px 8px';
    const actionBtnWidth = isMobile ? '28px' : '32px';
    const actionBtnHeight = isMobile ? '28px' : '32px';
    const exportBtnHeight = isMobile ? '26px' : '30px';
    const dividerMargin = isMobile ? '8px 0 8px' : '10px 0 12px';
    const inputHeight = isMobile ? '28px' : '32px';
    const inputFontSize = isMobile ? '0.75rem' : '0.8rem';
    const importResultMarginTop = isMobile ? '5px' : '7px';
    const importResultFontSize = isMobile ? '0.65rem' : '0.7rem';

    shareModal = document.createElement('div');
    shareModal.className = 'modal';
    shareModal.id = 'slot-share-modal';

    shareModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; padding: ${modalPadding}; display: flex; flex-direction: column; gap: ${modalGap};">
            <div style="font-size: ${titleFontSize}; font-weight: 800; color: #333; display: flex; align-items: center; gap: 8px; user-select: none; margin-bottom: 2px;">
                <div style="width: 4px; height: ${titleBarHeight}; background-color: ${themeColor}; border-radius: 2px;"></div>
                <span>${headerTitle}</span>
            </div>
            <div style="padding: ${containerPadding}; background: #f9f9f9; border: 1px solid #eee; border-radius: 10px;">
                <div style="font-size: ${nameFontSize}; font-weight: bold; color: #333; margin-bottom: ${nameMarginBottom}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: none;">
                    ${displayName}
                </div>
                <div style="display:flex; align-items:center; gap: 8px; margin-bottom: ${exportMarginBottom};">
                    <div style="display:flex; align-items:center; gap: 6px; min-width: 0; flex: 1;">
                        <span data-export-result="${slotId}" style="font-size: ${resultFontSize}; color: #888; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; flex: 1; box-sizing: border-box; text-align: center; padding: ${resultPadding}; background: #fafafa; border: 1px dashed #dcdcdc; border-radius: 5px; font-weight: bold; user-select: none;">${state.currentLang === 'ko' ? '오른쪽의 버튼을 누르면 코드가 발급됩니다.' : (state.currentLang === 'ja' ? '右側のボタンを押すとコードが発行されます' : 'Press the button on the right to issue')}</span>
                        <button class="slot-btn copy-code ${state.currentLang === 'ja' ? 'lang-ja' : ''}" data-copy-slot="${slotId}" data-code="" style="display: none; width: auto; min-width: 0; flex: 0 0 auto; padding: 0; margin: 0; font-size: 0.62rem; background: transparent; color: #5e35b1; border: none; border-radius: 0; cursor: pointer; font-weight: bold; line-height: 1.1; letter-spacing: -0.01em; white-space: nowrap; vertical-align: baseline;">${t('ui_slot_copy')}</button>
                    </div>
                    <button class="slot-btn export" data-slot="${slotId}" data-export-btn="${slotId}" ${!data ? 'style="display:none;"' : ''} style="width: ${actionBtnWidth}; height: ${exportBtnHeight}; flex: none; padding: 0; background: #fff3e0; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <img src="icons/upload-cloud.svg" alt="${t('ui_slot_export')}" style="width: 16px; height: 16px; filter: invert(48%) sepia(90%) saturate(1250%) hue-rotate(3deg) brightness(101%) contrast(101%);">
                    </button>
                </div>
                <div style="height: 1px; background: #ececec; margin: ${dividerMargin};"></div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" data-import-input="${slotId}" value="" maxlength="10" placeholder="${t('ui_slot_import_placeholder')}" style="flex: 1; min-width: 0; height: ${inputHeight}; padding: 0 9px; border: 1px solid #ddd; border-radius: 6px; font-size: ${inputFontSize}; outline: none;">
                    <button class="slot-btn import" data-import-btn="${slotId}" style="width: ${actionBtnWidth}; height: ${actionBtnHeight}; flex: none; padding: 0; background: #e8f5e9; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <img src="icons/download-cloud.svg" alt="${t('ui_slot_import')}" style="width: 16px; height: 16px; filter: invert(41%) sepia(12%) saturate(2641%) hue-rotate(81deg) brightness(94%) contrast(87%);">
                    </button>
                </div>
                <div data-import-result="${slotId}" style="font-size: ${importResultFontSize}; color: #999; margin-top: ${importResultMarginTop};"></div>
            </div>
        </div>`;

    document.body.appendChild(shareModal);
    shareModal.style.display = 'flex';

    const closeShareModal = () => {
        shareModal.remove();
    };

    let mousedownTarget = null;
    shareModal.addEventListener('mousedown', (e) => {
        mousedownTarget = e.target;
    });
    shareModal.addEventListener('mouseup', (e) => {
        if (e.target === shareModal && mousedownTarget === shareModal) {
            if (shareModal.dataset.processing === 'true') return;
            closeShareModal();
        }
    });

    const updateCopyButton = (rootEl, slotId, visible, code = '') => {
        const copyBtn = rootEl?.querySelector(`[data-copy-slot="${slotId}"]`);
        if (!copyBtn) return;
        copyBtn.dataset.code = code;
        copyBtn.textContent = t('ui_slot_copy');
        copyBtn.style.display = visible ? 'inline-block' : 'none';
    };

    const updateExportResult = (rootEl, slotId, message, color = '#666') => {
        const resultEl = rootEl?.querySelector(`[data-export-result="${slotId}"]`);
        if (!resultEl) return;

        const isMobile = window.innerWidth <= 768;
        const resultPadding = isMobile ? '3px 6px' : '4px 8px';
        const resultFontSize = isMobile ? '0.65rem' : '0.72rem';

        if (message) {
            resultEl.textContent = message;
            resultEl.style.display = 'inline-block';
            resultEl.style.flex = '1';
            resultEl.style.boxSizing = 'border-box';
            resultEl.style.textAlign = 'center';
            resultEl.style.padding = resultPadding;
            resultEl.style.borderRadius = '5px';
            resultEl.style.fontSize = resultFontSize;
            resultEl.style.fontWeight = 'bold';
            resultEl.style.userSelect = 'text';
            resultEl.style.background = '#fafafa';
            resultEl.style.border = '1px solid #e0e0e0';
            resultEl.style.color = '#333';
        } else {
            const unissuedText = state.currentLang === 'ko' ? '오른쪽의 버튼을 누르면 코드가 발급됩니다.' : (state.currentLang === 'ja' ? '右側のボタンを押すとコードが発行されます' : 'Press the button on the right to issue');
            resultEl.textContent = unissuedText;
            resultEl.style.display = 'inline-block';
            resultEl.style.flex = '1';
            resultEl.style.boxSizing = 'border-box';
            resultEl.style.textAlign = 'center';
            resultEl.style.padding = resultPadding;
            resultEl.style.borderRadius = '5px';
            resultEl.style.fontSize = resultFontSize;
            resultEl.style.fontWeight = 'bold';
            resultEl.style.color = '#888';
            resultEl.style.background = '#fafafa';
            resultEl.style.border = '1px dashed #dcdcdc';
            resultEl.style.userSelect = 'none';
        }
    };

    const updateImportResult = (rootEl, slotId, message, color = '#666') => {
        const resultEl = rootEl?.querySelector(`[data-import-result="${slotId}"]`);
        if (!resultEl) return;
        resultEl.textContent = message || '';
        resultEl.style.color = color;
    };

    const lockExportButton = (rootEl, slotId) => {
        const exportBtn = rootEl?.querySelector(`[data-export-btn="${slotId}"]`);
        if (!exportBtn) return;
        exportBtn.disabled = true;
        exportBtn.dataset.locked = 'true';
        exportBtn.style.cursor = 'default';
        exportBtn.style.opacity = '0.55';
        exportBtn.style.pointerEvents = 'none';
        exportBtn.style.transform = 'none';
        exportBtn.blur();
    };

    const setModalProcessing = (rootEl, isProcessing, slotId) => {
        if (!rootEl) return;
        rootEl.dataset.processing = isProcessing ? 'true' : 'false';
        const inputEl = rootEl.querySelector(`[data-import-input="${slotId}"]`);
        if (inputEl) {
            inputEl.disabled = isProcessing;
            inputEl.style.opacity = isProcessing ? '0.7' : '1';
        }
        const importBtn = rootEl.querySelector(`[data-import-btn="${slotId}"]`);
        if (importBtn) {
            importBtn.disabled = isProcessing;
            importBtn.style.cursor = isProcessing ? 'default' : 'pointer';
            importBtn.style.opacity = isProcessing ? '0.7' : '1';
        }
        const exportBtn = rootEl.querySelector(`[data-export-btn="${slotId}"]`);
        if (exportBtn) {
            const isLocked = exportBtn.dataset.locked === 'true';
            if (isProcessing) {
                exportBtn.disabled = true;
                exportBtn.style.cursor = 'default';
                exportBtn.style.opacity = '0.55';
            } else {
                exportBtn.disabled = isLocked;
                exportBtn.style.cursor = isLocked ? 'default' : 'pointer';
                exportBtn.style.opacity = isLocked ? '0.55' : '1';
            }
        }
    };

    const exportSlotPreset = async (slotId, rootEl) => {
        if (rootEl?.dataset.processing === 'true') return;
        const exportBtn = rootEl?.querySelector(`[data-export-btn="${slotId}"]`);
        if (exportBtn?.dataset.locked === 'true') return;

        if (!PRESET_EXPORT_ENDPOINT) {
            updateExportResult(rootEl, slotId, t('ui_slot_export_missing_config'), '#ef5350');
            updateCopyButton(rootEl, slotId, false);
            return;
        }

        const rawData = localStorage.getItem(slotKey);
        let saved = null;
        try { if (rawData) saved = JSON.parse(rawData); } catch (e) { }

        if (!saved) {
            updateExportResult(rootEl, slotId, t('ui_slot_export_empty'), '#ef5350');
            updateCopyButton(rootEl, slotId, false);
            return;
        }


        setModalProcessing(rootEl, true, slotId);
        lockExportButton(rootEl, slotId);
        updateExportResult(rootEl, slotId, t('ui_slot_exporting'), '#1976d2');
        updateCopyButton(rootEl, slotId, false);

        try {
            const response = await fetch(PRESET_EXPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    type: 'calc',
                    slotId: Number(slotId),
                    lang: state.currentLang,
                    exportedAt: new Date().toISOString(),
                    preset: saved
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
            }

            if (!result?.ok || !result?.code) {
                throw new Error(result?.error || 'Invalid export response');
            }

            const visualCode = `C${result.code}`;
            updateExportResult(rootEl, slotId, t('ui_slot_export_success', { code: visualCode }), '#2e7d32');
            updateCopyButton(rootEl, slotId, true, visualCode);
        } catch (error) {
            console.warn('Preset export failed:', error);
            const detail = error?.message ? ` ${error.message}` : '';
            updateExportResult(rootEl, slotId, `${t('ui_slot_export_failed')}${detail}`, '#ef5350');
            updateCopyButton(rootEl, slotId, false);
        } finally {
            setModalProcessing(rootEl, false, slotId);
        }
    };

    const copyExportCode = async (slotId, rootEl) => {
        const copyBtn = rootEl?.querySelector(`[data-copy-slot="${slotId}"]`);
        const code = copyBtn?.dataset.code || '';
        if (!copyBtn || !code) return;

        let copied = false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
                copied = true;
            }
        } catch { }

        if (!copied) {
            const tempInput = document.createElement('input');
            tempInput.value = code;
            tempInput.setAttribute('readonly', '');
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, code.length);
            copied = document.execCommand('copy');
            tempInput.remove();
        }

        copyBtn.textContent = copied ? t('ui_slot_copied') : t('ui_slot_copy_failed');
        window.setTimeout(() => {
            if (document.body.contains(copyBtn)) {
                copyBtn.textContent = t('ui_slot_copy');
            }
        }, 1500);
    };

    const importSlotPreset = async (slotId, rootEl) => {
        if (rootEl?.dataset.processing === 'true') return;
        const inputEl = rootEl?.querySelector(`[data-import-input="${slotId}"]`);
        const importBtn = rootEl?.querySelector(`[data-import-btn="${slotId}"]`);
        const rawCode = inputEl?.value || '';

        const alphaNumOnly = rawCode.replace(/[^A-Za-z0-9]/g, '');
        if (alphaNumOnly.length !== 7) {
            let errMsg = '';
            if (state.currentLang === 'ko') {
                errMsg = '올바른 코드 길이가 아닙니다. (7자리)';
            } else if (state.currentLang === 'ja') {
                errMsg = 'コードの長さが正しくありません。(7桁)';
            } else {
                errMsg = 'Invalid code length. (7 characters)';
            }
            updateImportResult(rootEl, slotId, errMsg, '#ef5350');
            inputEl?.focus();
            return;
        }

        let cleanInput = rawCode.trim().toUpperCase();
        if (cleanInput.startsWith('C-')) {
            cleanInput = cleanInput.substring(2);
        } else if (cleanInput.startsWith('C') && cleanInput.replace(/[^A-Z0-9]/g, '').length === 7) {
            // Strip the 'C' prefix only if the remaining alphanumeric code would be exactly 6 characters.
            cleanInput = cleanInput.substring(1);
        }
        const code = cleanInput.replace(/[^A-Z0-9]/g, '').trim();

        if (!PRESET_EXPORT_ENDPOINT) {
            updateImportResult(rootEl, slotId, t('ui_slot_export_missing_config'), '#ef5350');
            return;
        }

        setModalProcessing(rootEl, true, slotId);
        updateImportResult(rootEl, slotId, t('ui_slot_importing'), '#1976d2');

        try {
            const response = await fetch(PRESET_EXPORT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'import',
                    type: 'calc',
                    code
                })
            });

            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
            }

            if (!result?.ok || !result?.preset) {
                throw new Error(result?.error || 'Invalid import response');
            }

            // Validate that the imported preset is a calculator preset
            if (!result.preset.calcState) {
                throw new Error(state.currentLang === 'ko' ? '올바른 계산기 프리셋이 아닙니다.' : state.currentLang === 'ja' ? '正しい計算機プリセットではありません。' : 'Not a valid calculator preset.');
            }

            // Parse calcState if it comes as a string from Google Apps Script to prevent double-serialization bugs
            let presetState = result.preset.calcState;
            if (typeof presetState === 'string') {
                try {
                    presetState = JSON.parse(presetState);
                } catch (e) {
                    throw new Error(state.currentLang === 'ko' ? '프리셋 데이터 구문 분석에 실패했습니다.' : 'Failed to parse preset state.');
                }
            }
            result.preset.calcState = presetState;

            // Validate if the imported preset matches the current calculator settings
            const targetPlan = presetState.planType || 'sense';
            const targetIdol = presetState.selectedIdol || 'saki';
            
            let targetMode = presetState.type || result.preset.type;
            if (!targetMode || targetMode === 'calc' || targetMode === 'hajime') {
                const weekKeys = Object.keys(presetState.weeks || {});
                const maxWeek = Math.max(...weekKeys.map(Number).filter(n => !isNaN(n)), 0);
                if (maxWeek > 26) {
                    targetMode = 'hif';
                } else if (maxWeek > 18) {
                    targetMode = 'nia';
                } else {
                    let hasHifAct = false;
                    let hasNiaAct = false;
                    for (const wk of Object.values(presetState.weeks || {})) {
                        const val = wk.value || '';
                        if (val.includes('hif')) { hasHifAct = true; break; }
                        if (val.includes('nia')) { hasNiaAct = true; }
                    }
                    targetMode = hasHifAct ? 'hif' : (hasNiaAct ? 'nia' : 'hajime');
                }
            }

            if (targetIdol !== idol || targetMode !== mode) {
                const modeMap = {
                    'hajime': state.currentLang === 'ko' ? '하지메' : (state.currentLang === 'ja' ? '初' : 'HAJIME'),
                    'nia': state.currentLang === 'ko' ? '니아' : 'NIA',
                    'hif': 'HIF'
                };

                const tMode = modeMap[targetMode] || targetMode.toUpperCase();

                // Fetch dynamic short name from i18n, fallback to UPPERCASE if key doesn't exist yet
                let tIdol = t(`idol_name_${targetIdol}`);
                if (!tIdol || tIdol === `idol_name_${targetIdol}`) {
                    tIdol = targetIdol.toUpperCase();
                }

                let errMsg = '';
                if (state.currentLang === 'ko') {
                    errMsg = `가져올 프리셋 설정이 다릅니다. [${tMode} - ${tIdol}]로 전환 후 다시 시도해주세요.`;
                } else if (state.currentLang === 'ja') {
                    errMsg = `設定が異なります。[${tMode} - ${tIdol}] に手動で切り替えてから再度お試しください。`;
                } else {
                    errMsg = `Config mismatch. Switch to [${tMode} - ${tIdol}] manually and retry.`;
                }
                throw new Error(errMsg);
            }

            // Write to current active slot key
            const importedPreset = result.preset;
            

            importedPreset.slotId = parseInt(slotId);
            importedPreset.timestamp = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

            localStorage.setItem(slotKey, JSON.stringify(importedPreset));

            updateImportResult(rootEl, slotId, t('ui_slot_import_success'), '#2e7d32');

            // Merge preset state with current state to preserve other plans' skill & card selections
            const currentRaw = localStorage.getItem(`calc_state_${mode}`);
            if (currentRaw) {
                try {
                    const currentState = JSON.parse(currentRaw);
                    if (currentState) {
                        const targetPlan = importedPreset.calcState.planType || 'sense';
                        
                        // Normalize preset planSkills/planCards
                        let presetSkills = importedPreset.calcState.planSkills || {};
                        if (!presetSkills.sense && !presetSkills.logic && !presetSkills.anomaly) {
                            presetSkills = { sense: { ...presetSkills }, logic: { ...presetSkills }, anomaly: { ...presetSkills } };
                        }
                        let presetCards = importedPreset.calcState.planCards || {};
                        if (Array.isArray(presetCards)) {
                            presetCards = { sense: [...presetCards], logic: [...presetCards], anomaly: [...presetCards] };
                        }
                        
                        // Normalize current planSkills/planCards
                        let currentSkills = currentState.planSkills || {};
                        if (!currentSkills.sense && !currentSkills.logic && !currentSkills.anomaly) {
                            currentSkills = { sense: { ...currentSkills }, logic: { ...currentSkills }, anomaly: { ...currentSkills } };
                        }
                        let currentCards = currentState.planCards || {};
                        if (Array.isArray(currentCards)) {
                            currentCards = { sense: [...currentCards], logic: [...currentCards], anomaly: [...currentCards] };
                        }
                        
                        // Merge: only keep the preset's target plan selections, and retain current selections for the other plans
                        const mergedSkills = { ...presetSkills };
                        const mergedCards = { ...presetCards };
                        
                        ['sense', 'logic', 'anomaly'].forEach(plan => {
                            if (plan !== targetPlan) {
                                mergedSkills[plan] = currentSkills[plan] || {};
                                mergedCards[plan] = currentCards[plan] || [];
                            }
                        });
                        
                        importedPreset.calcState.planSkills = mergedSkills;
                        importedPreset.calcState.planCards = mergedCards;
                    }
                } catch (err) {
                    console.warn('Failed to merge current state with preset:', err);
                }
            }

            // Force load it immediately into the CURRENT configuration
            sessionStorage.setItem('is_loading_preset', 'true');
            importedPreset.calcState.updatedAt = Date.now();
            const serialized = JSON.stringify(importedPreset.calcState);

            localStorage.setItem(`calc_state_${mode}`, serialized);
            localStorage.setItem(`calc_state_shadow_${mode}`, serialized);
            sessionStorage.setItem(`calc_state_session_${mode}`, serialized);
            localStorage.setItem('last_calc_type', mode);

            sessionStorage.setItem('preset_loaded_toast', t('calc_preset_load_success', { slotId }));

            // Close the modal
            closeShareModal();

            // Reload the page to guarantee a perfect and pristine UI refresh
            window.location.reload();
        } catch (error) {
            console.warn('Preset import failed:', error);
            const detail = error?.message ? ` ${error.message}` : '';
            updateImportResult(rootEl, slotId, `${t('ui_slot_import_failed')}${detail}`, '#ef5350');
        } finally {
            setModalProcessing(rootEl, false, slotId);
        }
    };

    shareModal.addEventListener('click', (e) => {
        if (shareModal.dataset.processing === 'true') return;
        const exportBtn = e.target.closest('.export');
        const copyBtn = e.target.closest('.copy-code');
        const importBtn = e.target.closest('.import');

        if (exportBtn) {
            exportSlotPreset(exportBtn.dataset.slot, shareModal);
        }

        if (copyBtn) {
            copyExportCode(copyBtn.dataset.copySlot, shareModal);
        }

        if (importBtn) {
            importSlotPreset(slotId, shareModal);
        }
    });

    const importInput = shareModal.querySelector(`[data-import-input="${slotId}"]`);
    importInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (shareModal.dataset.processing === 'true') return;
            importSlotPreset(slotId, shareModal);
        }
    });
}



