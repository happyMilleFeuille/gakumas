// calc.js
import { state, idolColors } from './state.js';
import { updatePageTranslations, translate } from './utils.js';
import { calcPlans, baseStats, idolData, niaAuditionStats, judgingRatios, hifPrimaStellaIdols, hifParameterLimitBonuses, canUseHifPrimaStella } from './calcData.js';
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
import { toggleSupportCardPanel, closeSupportCardPanel, showStatDetailModal, syncSupportPanelUI, showRecommendModal } from './calcModals.js';
import { initRecommendationFeature } from './calcRecommend.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);
const hifClassActionIds = ['class_hif', 'class_hif0', 'class_hif1'];

function getVisibleIdolList(type) {
    if (type === 'hif') return idolList.filter(id => hifPrimaStellaIdols.includes(id));
    return idolList;
}

function enforceHifPrimaEligibility() {
    const primaToggle = document.getElementById('hif-prima-toggle');
    if (!primaToggle) return;

    const isAllowed = canUseHifPrimaStella(calcStore.selectedIdol, calcStore.planType);
    primaToggle.classList.toggle('disabled', !isAllowed);

    if (!isAllowed && calcStore.hifPrimaChecked) {
        calcStore.hifPrimaChecked = false;
        primaToggle.classList.remove('active');
        calcStore.save();
    }
}

export function initCalc(mode) {
    window._lastIdolScrollLeft = undefined; // 메뉴 진입 시 스크롤 위치 초기화

    // mode가 명시적으로 있거나, 혹은 localStorage에 기록이 있는 경우 해당 모드로 진입
    // 단, URL이 정확히 #calc라면 메뉴를 보여주기 위해 localStorage를 무시함
    const lastType = mode || (window.location.hash === '#calc' ? null : localStorage.getItem('last_calc_type'));

    if (lastType === 'hajime' || lastType === 'nia' || lastType === 'hif') {
        startWeeklyPlan(lastType);
    } else {
        renderCalcMenu(updatePageTranslations,
            () => window.location.hash = 'calc/hajime',
            () => window.location.hash = 'calc/nia',
            () => window.location.hash = 'calc/hif'
        );
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

    const statHeader = document.querySelector('.stat-header');
    if (statHeader) statHeader.style.borderColor = color;

    const boardTitleRow = document.querySelector('.board-title-row');
    if (boardTitleRow) {
        boardTitleRow.style.backgroundColor = color;
        boardTitleRow.style.borderColor = color;
    }

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

            // [추가] 프리마 스텔라 버튼 활성화 상태 즉시 갱신
            enforceHifPrimaEligibility();

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
                    if (btn.classList.contains('active')) return;
                    // [추가] 플랜 전환 직전에 현재 스크롤 위치 저장
                    const currentGrid = document.getElementById('idol-selector-grid');
                    if (currentGrid) window._lastIdolScrollLeft = currentGrid.scrollLeft;

                    calcStore.setPlanType(btn.dataset.type);
                    if (type === 'hif') {
                        enforceHifPrimaEligibility();
                    }
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
                            // 이미지 외곽을 따라가는 선명한 테두리 + 캐릭터 색상의 얕은 그림자
                            wrapper.style.filter = `drop-shadow(1.5px 0 0 ${idolColor}) drop-shadow(-1.5px 0 0 ${idolColor}) drop-shadow(0 1.5px 0 ${idolColor}) drop-shadow(0 -1.5px 0 ${idolColor}) drop-shadow(0 0 3px ${idolColor})`;
                        } else {
                            wrapper.style.borderColor = idolColor;
                            wrapper.style.boxShadow = 'none';
                        }

                        updateSPBadge(wrapper, calcStore.selectedIdol); updateMainLabel(wrapper);
                        removeAllTooltips(wrapper);

                        const opts = activityOptions[val];
                        if (calcStore.type === 'hif' && val === 'test') {
                            const isMobile = window.innerWidth <= 768;
                            const tooltip = document.createElement('div');
                            tooltip.className = 'calc-tooltip';
                            tooltip.onclick = (te) => te.stopPropagation();

                            const idolId = calcStore.selectedIdol;
                            const idolColor = idolColors[idolId] || "#ff4d8d";
                            tooltip.style.borderColor = idolColor;

                            const savedOpts = calcStore.weeks[weekNum].opts || {};
                            const defaultTestValuesByWeek = {
                                7: 50,
                                13: 150,
                                20: 200
                            };
                            const defaultTestValue = defaultTestValuesByWeek[weekNum] ?? 50;
                            const fields = [
                                { key: 'hif_test_vocal', icon: 'vocal', color: '#ff4d8d', label: 'Vo' },
                                { key: 'hif_test_dance', icon: 'dance', color: '#46a4f3', label: 'Da' },
                                { key: 'hif_test_visual', icon: 'visual', color: '#fcc75e', label: 'Vi' }
                            ];

                            tooltip.innerHTML = `
                                <div style="display:flex; flex-direction:column; gap:${isMobile ? '6px' : '8px'}; min-width:${isMobile ? '160px' : '190px'};">
                                    <div style="font-size:${isMobile ? '0.56rem' : '0.62rem'}; line-height:1.3; color:#666; text-align:center; max-width:${isMobile ? '180px' : '220px'};" data-i18n="hif_test_tooltip_desc">
                                        ${t('hif_test_tooltip_desc')}
                                    </div>
                                    <div style="display:grid; grid-template-columns:repeat(3, minmax(${isMobile ? '48px' : '58px'}, 1fr)); gap:${isMobile ? '6px' : '10px'}; align-items:start;">
                                    ${fields.map(field => `
                                        <label style="display:flex; flex-direction:column; align-items:center; gap:${isMobile ? '4px' : '6px'};">
                                            <img src="icons/${field.icon}.png" alt="${field.label}" style="width:${isMobile ? '15px' : '18px'}; height:${isMobile ? '15px' : '18px'};">
                                            <input
                                                type="number"
                                                inputmode="numeric"
                                                class="hif-test-stat-input"
                                                data-id="${field.key}"
                                                value="${savedOpts[field.key] ?? defaultTestValue}"
                                                placeholder="0"
                                                style="width:${isMobile ? '48px' : '58px'}; border:1px solid ${field.color}55; border-radius:6px; padding:${isMobile ? '4px 5px' : '5px 6px'}; font-size:${isMobile ? '0.72rem' : '0.8rem'}; outline:none; text-align:center;"
                                            >
                                        </label>
                                    `).join('')}</div>
                                </div>
                            `;

                            document.body.appendChild(tooltip);
                            const rect = wrapper.getBoundingClientRect();
                            const tooltipWidth = tooltip.offsetWidth;
                            const tooltipHeight = tooltip.offsetHeight;
                            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                            let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);

                            if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
                            if (left < 10) left = 10;
                            if (top < 10) top = 10;
                            if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10;

                            tooltip.style.left = `${left}px`;
                            tooltip.style.top = `${top}px`;
                            tooltip.style.transform = '';
                            tooltip.style.position = 'absolute';
                            tooltip.style.width = 'max-content';
                            tooltip.style.zIndex = '50001';

                            const tooltipDocTop = top + window.scrollY;
                            tooltip.style.top = `${tooltipDocTop}px`;

                            const scrollContainer = document.getElementById('idol');
                            const closeOnScroll = () => {
                                if (tooltip.isConnected) tooltip.remove();
                                window.removeEventListener('scroll', closeOnScroll);
                                scrollContainer?.removeEventListener('scroll', closeOnScroll);
                            };

                            window.addEventListener('scroll', closeOnScroll, { passive: true });
                            scrollContainer?.addEventListener('scroll', closeOnScroll, { passive: true });

                            tooltip.querySelectorAll('input[type="number"]').forEach(input => {
                                const syncValue = () => {
                                    const raw = input.value.trim();
                                    if (raw === '') {
                                        calcStore.updateWeekOpt(weekNum, input.dataset.id, null);
                                        delete wrapper.dataset[`opt${input.dataset.id}`];
                                    } else {
                                        const num = Math.max(0, parseInt(raw) || 0);
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
            const resetWeeksBtn = document.getElementById('btn-reset-weeks');
            if (resetWeeksBtn) {
                resetWeeksBtn.onclick = () => {
                    const scrollContainer = document.getElementById('idol');
                    const scrollTop = scrollContainer?.scrollTop ?? window.scrollY ?? document.documentElement.scrollTop ?? 0;
                    calcStore.resetWeeks();
                    showToast(t('calc_toast_reset_weeks'));
                    startWeeklyPlan(type);
                    requestAnimationFrame(() => {
                        if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                        window.scrollTo(0, scrollTop);
                        requestAnimationFrame(() => {
                            if (scrollContainer) scrollContainer.scrollTop = scrollTop;
                            window.scrollTo(0, scrollTop);
                        });
                    });
                };
            }
            const kyoukaBtn = document.getElementById('btn-kyouka');
            if (kyoukaBtn) {
                if (calcStore.isKyouka) kyoukaBtn.classList.add('active');
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
    if (type === 'hif') {
        enforceHifPrimaEligibility();
    }
    window.refreshAll = refreshAll;

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

    const hifPrimaToggle = document.getElementById('hif-prima-toggle');
    if (hifPrimaToggle) {
        hifPrimaToggle.onclick = (e) => {
            e.preventDefault();
            if (!canUseHifPrimaStella(calcStore.selectedIdol, calcStore.planType)) return;
            calcStore.hifPrimaChecked = !calcStore.hifPrimaChecked;

            // 프리마스텔라가 켜지면 SR은 끈다
            if (calcStore.hifPrimaChecked) {
                calcStore.isSR = false;
                const srToggle = document.getElementById('sr-toggle');
                if (srToggle) srToggle.classList.remove('active');
            }

            calcStore.save();
            hifPrimaToggle.classList.toggle('active', calcStore.hifPrimaChecked);
            refreshAll();
        };
    }

    const srToggle = document.getElementById('sr-toggle');
    if (srToggle) {
        srToggle.onclick = (e) => {
            e.preventDefault();
            calcStore.isSR = !calcStore.isSR;

            // SR이 켜지면 프리마스텔라는 끈다
            if (calcStore.isSR) {
                calcStore.hifPrimaChecked = false;
                const hifPrimaToggle = document.getElementById('hif-prima-toggle');
                if (hifPrimaToggle) hifPrimaToggle.classList.remove('active');
            }

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

    const container = document.getElementById('p-item-container');
    if (container) {
        const currentType = calcStore.type;
        const itemsBySlot = pItemSlots[currentType] || [];
        const idolColor = getIdolDisplayColor(calcStore.selectedIdol || 'saki');

        container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
            const val = calcStore.pItems[idx];
            slot.style.borderColor = val ? 'transparent' : '#ddd';
            slot.innerHTML = val ? `<img src="icons/cal/${val}.webp" data-val="${val}">` : '<span class="support-bg-text">P-item</span>';

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
            document.querySelectorAll('.calc-tooltip, .calc-sub-tooltip, .p-item-tooltip, .support-item-tooltip').forEach(t => t.remove());
            const changed = clearIncompleteWeekSelections();
            if (changed && typeof window.refreshAll === 'function') {
                window.refreshAll();
            }
        }
    });
    window._calcGlobalInit = true;
}
