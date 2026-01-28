// calc.js
import { state } from './state.js';
import { updatePageTranslations } from './utils.js';
import { calcPlans } from './calcData.js';
import { activityOptions } from './calcOptions.js';
import { cardList } from './carddata.js';
import { calculateCardBonus } from './simulator-engine.js';
import { getTriggerCountsFromDOM, calculateAllTotals } from './calcLogic.js';
import { updateActivityCountsUI, updateSelectedCardsUI, updateStatHeaderUI } from './calcUI.js';

const idolList = ['saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja', 'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'];

export function initCalc() { 
    renderCalcMenu(); 
    initGlobalDistListener();
}

// 보드에서 사용 가능한 각종 풀(pool) 계산
function getBoardPools(calcType) {
    const board = document.querySelector('.unified-plan-board');
    const resArr = {
        enhance: { generic: 0, m: 0, a: 0 },
        delete: { generic: 0, m: 0, a: 0 },
        get: { generic: 0, m: 0, a: 0 }
    };
    if (!board) return resArr;

    board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
        const val = icon.dataset.value;
        const res = (icon.dataset.results ? icon.dataset.results.split(',') : []).concat(Object.keys(icon.dataset).filter(k => k.startsWith('opt')).flatMap(k => {
            const optId = k.slice(3).toLowerCase(), countInc = (icon.dataset[k] === 'true' ? 1 : (!isNaN(icon.dataset[k]) ? parseInt(icon.dataset[k]) : 0));
            if (countInc === 0) return [];
            const optDef = (activityOptions[val] || []).find(o => o.id === optId) || (activityOptions[val] || []).flatMap(o => o.subOptions || []).find(so => so.id === optId);
            return Array(countInc).fill((optDef && optDef.results) ? optDef.results : [optId]).flat();
        }));
        res.forEach(rid => {
            const id = rid.trim();
            if (id === 'enhance' || id === 'ranenhance') resArr.enhance.generic++;
            else if (id === 'enhance_m') resArr.enhance.m++;
            else if (id === 'enhance_a') resArr.enhance.a++;
            else if (id === 'delete') resArr.delete.generic++;
            else if (id === 'delete_m') resArr.delete.m++;
            else if (id === 'delete_a') resArr.delete.a++;
            else if (id === 'get') resArr.get.generic++;
            else if (id === 'get_m') resArr.get.m++;
            else if (id === 'get_a') resArr.get.a++;
        });
    });
    return resArr;
}

function initGlobalDistListener() {
    if (window._distInit) return;
    document.addEventListener('click', (e) => {
        const cardCheckBtn = e.target.closest('.card-slot-check');
        const btn = e.target.closest('.dist-btn');
        
        const board = document.querySelector('.unified-plan-board');
        if (!board) return;
        const type = board.dataset.calcType;
        const current = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};

        // 카드 슬롯 체크박스 처리 (가장 먼저 체크)
        if (cardCheckBtn) {
            if (!current.cardChecked) current.cardChecked = {};
            current.cardChecked[cardCheckBtn.dataset.id] = cardCheckBtn.checked;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        if (!btn) return;
        
        e.preventDefault(); e.stopPropagation();
        
        const distTarget = btn.dataset.dist; // 'm', 'a', 'dm', 'da', 'gm', 'ga'
        const otherTarget = btn.dataset.target; // 'get_ssr', 'get_genki', etc.

        const pools = getBoardPools(type);

        // 기타 획득 수동 조절 처리
        if (btn.classList.contains('other-btn') && otherTarget) {
            if (!current.manualOther) current.manualOther = {};
            let curManual = Number(current.manualOther[otherTarget]) || 0;
            
            if (btn.classList.contains('plus')) {
                curManual++;
            } else if (btn.classList.contains('minus')) {
                // 수동 보정치는 0 미만으로 내려가지 않음 (기본+체크카드 수치를 최저치로 보장)
                if (curManual > 0) {
                    curManual--;
                }
            }
            
            current.manualOther[otherTarget] = curManual;
            localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
            refreshCardBonuses();
            updateActivityCounts();
            return;
        }

        // [추가] 니아 보너스를 분배 풀에 합산 (리셋 방지용)
        let niaBonusGet = 0;
        let niaBonusDelete = 0;
        if (type === 'nia' && current.pItems) {
            // 보드 활동 횟수 집계
            const counts = {};
            board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
                const val = icon.dataset.value; counts[val] = (counts[val] || 0) + 1;
            });

            if (current.pItems.includes('nia1-1')) {
                const bonus = Math.min(counts['spclass'] || 0, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
            if (current.pItems.includes('nia1-2')) {
                const bonus = Math.min(counts['advice'] || 0, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
            
            let nia21Count = 0, nia22Count = 0, nia23Count = 0;
            board.querySelectorAll('.plan-icon-wrapper.active[data-value="class_nia"]').forEach(icon => {
                if (icon.dataset.optget_enhancedcard === 'true') nia21Count++;
                if (icon.dataset.optget_ppoint === 'true') nia22Count++;
                if (icon.dataset.optget_drink === 'true') nia23Count++;
            });

            if (current.pItems.includes('nia2-1')) {
                const bonus = Math.min(nia21Count, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
            if (current.pItems.includes('nia2-2')) {
                const bonus = Math.min(nia22Count, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
            if (current.pItems.includes('nia2-3')) {
                const bonus = Math.min(nia23Count, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }

            // 3단계: 오디션 시 추가 획득/삭제
            if (current.pItems.includes('nia3-1')) {
                const bonus = Math.min(counts['audition'] || 0, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
            if (current.pItems.includes('nia3-2')) {
                const bonus = Math.min(counts['audition'] || 0, 2);
                niaBonusGet += bonus; niaBonusDelete += bonus;
            }
        }
        pools.get.generic += niaBonusGet;
        pools.delete.generic += niaBonusDelete;

        // [수정] 모든 분배기의 싱크 및 초기화 로직 보강
        if (!current.manualEnhance || (Number(current.manualEnhance.m) + Number(current.manualEnhance.a) !== pools.enhance.generic)) {
            current.manualEnhance = { m: pools.enhance.generic, a: 0 };
        }
        if (!current.manualDelete || (Number(current.manualDelete.m) + Number(current.manualDelete.a) !== pools.delete.generic)) {
            current.manualDelete = { m: pools.delete.generic, a: 0 };
        }
        if (!current.manualGet || (Number(current.manualGet.m) + Number(current.manualGet.a) !== pools.get.generic)) {
            current.manualGet = { m: pools.get.generic, a: 0 };
        }
        
        let em = Number(current.manualEnhance.m) || 0;
        let ea = Number(current.manualEnhance.a) || 0;
        let dm = Number(current.manualDelete.m) || 0;
        let da = Number(current.manualDelete.a) || 0;
        let gm = Number(current.manualGet.m) || 0;
        let ga = Number(current.manualGet.a) || 0;

        // 분배 로직 (제로섬)
        if (distTarget === 'a') { if (em > 0) { em--; ea++; } }
        else if (distTarget === 'm') { if (ea > 0) { ea--; em++; } }
        else if (distTarget === 'da') { if (dm > 0) { dm--; da++; } }
        else if (distTarget === 'dm') { if (da > 0) { da--; dm++; } }
        else if (distTarget === 'ga') { if (gm > 0) { gm--; ga++; } }
        else if (distTarget === 'gm') { if (ga > 0) { ga--; gm++; } }
        
        current.manualEnhance = { m: em, a: ea };
        current.manualDelete = { m: dm, a: da };
        current.manualGet = { m: gm, a: ga };
        
        localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
        
        // [중요] 실시간 갱신을 위해 계산 및 UI 업데이트 호출
        refreshCardBonuses(); 
        updateActivityCounts();
    });
    window._distInit = true;
}

function renderCalcMenu() {
    const root = document.getElementById('calc-root');
    if (!root) return;
    root.innerHTML = `<div class="calc-menu-container"><h2 data-i18n="calc_title">계산기 메뉴</h2><div class="calc-buttons"><button class="primary-btn" id="btn-hajime">Hajime</button><button class="primary-btn" id="btn-nia">N.i.a</button></div></div>`;
    updatePageTranslations();
    document.getElementById('btn-hajime').onclick = () => renderWeeklyPlan('hajime');
    document.getElementById('btn-nia').onclick = () => renderWeeklyPlan('nia');
}

function renderWeeklyPlan(type) {
    const root = document.getElementById('calc-root');
    const planData = calcPlans[type];
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || { weeks: {}, planCards: {} };
    
    // 기본값 설정: 저장된 값이 없으면 첫 번째 아이돌과 sense 플랜을 선택
    if (!savedState.selectedIdol) savedState.selectedIdol = idolList[0];
    if (!savedState.planType) savedState.planType = 'sense';

    const savedWeeks = savedState.weeks || {};

    const idolsHtml = idolList.map(name => `<div class="idol-sel-item" data-id="${name}"><img src="icons/idolicons/${name}.png" onerror="this.src='icons/idol.png'"></div>`).join('');
    const weekNumbers = Object.keys(planData.weeks).map(Number).sort((a, b) => b - a);
    
    let weeksHtml = weekNumbers.map(i => {
        const options = planData.weeks[i] || [];
        const savedWeek = savedWeeks[i] || {};
        const optionsHtml = options.map(opt => {
            const isActive = savedWeek.value === opt.value;
            const resData = (opt.results || opt.result) ? ` data-results="${(opt.results || opt.result).join(',')}"` : '';
            let optAttrs = isActive && savedWeek.opts ? Object.keys(savedWeek.opts).map(k => ` data-opt${k}="${savedWeek.opts[k]}"`).join('') : '';
            return `<div class="plan-icon-wrapper ${['audition', 'test', 'oikomi'].includes(opt.value) ? 'large-icon' : ''} ${isActive ? 'active' : ''}" data-value="${opt.value}" ${optAttrs} ${resData}><img src="icons/cal/${opt.value}.webp" class="plan-icon-img"></div>`;
        }).join('');
        return `<div class="week-row" data-week="${i}"><div class="week-header"><span class="week-label">${i}주</span></div><div class="plan-icons-container">${optionsHtml}</div></div>`;
    }).join('');

    const pItemHtml = type === 'nia' ? `
        <div class="p-item-container" id="p-item-container">
            <div class="p-item-slot" data-index="0"></div>
            <div class="p-item-slot" data-index="1"></div>
            <div class="p-item-slot" data-index="2"></div>
            <div class="p-item-slot" data-index="3"></div>
        </div>
    ` : '';

    root.innerHTML = `<div class="calc-container"><div class="calc-main-wrapper"><div class="calc-actions top"><button class="calc-btn primary-btn" id="btn-run-calc">계산</button><button class="back-btn primary-btn">뒤로가기</button></div><div class="idol-selector-grid" id="idol-selector-grid">${idolsHtml}</div><div class="plan-type-selector"><div class="plan-type-btn" data-type="sense"><img src="icons/sense.webp"></div><div class="plan-type-btn" data-type="logic"><img src="icons/logic.webp"></div><div class="plan-type-btn" data-type="anomaly"><img src="icons/anomaly.webp"></div></div>${pItemHtml}<div class="selected-support-container" id="selected-support-container"></div><div class="stat-header">
    <div class="stat-item">
        <img src="icons/vocal.png" alt="Vocal">
        <span id="total-vocal">0</span>
        <span id="sp-vocal-percent" class="sp-percent-label"></span>
    </div>
    <div class="stat-item">
        <img src="icons/dance.png" alt="Dance">
        <span id="total-dance">0</span>
        <span id="sp-dance-percent" class="sp-percent-label"></span>
    </div>
    <div class="stat-item">
        <img src="icons/visual.png" alt="Visual">
        <span id="total-visual">0</span>
        <span id="sp-visual-percent" class="sp-percent-label"></span>
    </div>
</div>
<div class="activity-counter" id="activity-counter"></div><div class="board-toggle-bar" id="board-toggle-bar">주간 행동 닫기 ▲</div><div class="unified-plan-board" data-calc-type="${type}">${weeksHtml}</div></div></div>`;

    const board = document.querySelector('.unified-plan-board');
    if (savedState.isBoardCollapsed) board.classList.add('collapsed-board');

    const savedIdolItem = root.querySelector(`.idol-sel-item[data-id="${savedState.selectedIdol}"]`);
    if (savedIdolItem) {
        savedIdolItem.classList.add('active');
        requestAnimationFrame(() => savedIdolItem.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' }));
    }
    const activePlan = savedState.planType || 'sense'; // 여기서도 기본값 보장
    const savedPlanBtn = root.querySelector(`.plan-type-btn[data-type="${activePlan}"]`);
    if (savedPlanBtn) savedPlanBtn.classList.add('active');

    if (activePlan && savedState.planCards && savedState.planCards[activePlan]) {
        updateSelectedCardsUI(savedState.planCards[activePlan], type);
    }

    setupBackBtn(); setupPlanTypeSelector(); setupIdolSelector(); setupIconToggles(); setupCalcAction(); 
    setupPItemSelector(type); // P-아이템 셀렉터 설정 추가
    
    // 저장된 뱃지 및 라벨 UI 복원
    root.querySelectorAll('.plan-icon-wrapper.active').forEach(wrapper => {
        updateSPBadge(wrapper);
        updateMainLabel(wrapper);
    });
    
    // 초기 렌더링 후 상태 저장 및 UI 갱신 호출
    saveCalcState();
    refreshCardBonuses();
    updateActivityCounts();
}

function refreshCardBonuses() {
    const panel = document.getElementById('calc-side-panel');
    const boardElem = document.querySelector('.unified-plan-board');
    if (!boardElem) return;
    const type = boardElem.dataset.calcType;
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
    const detailedCounts = getTriggerCountsFromDOM();
    
    let selectedIds = [];
    if (panel) {
        selectedIds = Array.from(panel.querySelectorAll('.side-card-item.selected')).map(i => i.dataset.id);
    } else {
        const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        if (saved.planCards && activePlan) selectedIds = saved.planCards[activePlan] || [];
    }

    const { baseTotal, cardBonusTotal } = calculateAllTotals(detailedCounts, selectedIds);
    updateStatHeaderUI(cardBonusTotal, document.querySelector('.idol-sel-item.active')?.dataset.id, selectedIds, type);

    if (panel?.classList.contains('open')) {
        panel.querySelectorAll('.side-card-item').forEach(item => {
            const card = cardList.find(c => c.id === item.dataset.id);
            if (!card) return;
            const bonus = calculateCardBonus(card, detailedCounts, state.supportLB[card.id] || 0);
            let val = bonus.vocal + bonus.dance + bonus.visual + (bonus.percent > 0 ? Math.round((baseTotal[card.type] || 0) * (bonus.percent / 100)) : 0);
            const bonusEl = item.querySelector('.bonus-val');
            if (bonusEl) {
                bonusEl.textContent = val > 0 ? `+${val}` : '';
                // SP 레슨 업 클래스 초기화 및 조건부 추가
                bonusEl.classList.remove('sp-vocal', 'sp-dance', 'sp-visual');
                if (card.abilities.includes('sp_lessonup')) {
                    bonusEl.classList.add(`sp-${card.type}`);
                }
            }
            item.style.order = -val;
        });
    }
}

function updateActivityCounts() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;
    const type = board.dataset.calcType;
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
    const savedState = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    
    const counts = {}, spCounts = { lessonvo: 0, lessondan: 0, lessonvi: 0 }, extraCounts = { enhance: 0, enhance_m: 0, enhance_a: 0, delete: 0, delete_m: 0, delete_a: 0, get_drink: 0, purchase_drink: 0, change: 0, customize: 0, get: 0, get_m: 0, get_a: 0, get_ssr: 0, get_genki: 0, get_goodcondition: 0, get_concentration: 0, get_motivation: 0, get_goodimpression: 0, get_preservation: 0, get_enthusiasm: 0, get_fullpower: 0, get_item: (type === 'nia' ? 1 : 0) };

    const pools = getBoardPools(type);
    
    // 1. 보드 활동 집계
    board.querySelectorAll('.plan-icon-wrapper.active').forEach(icon => {
        const val = icon.dataset.value; counts[val] = (counts[val] || 0) + 1;
        if (icon.dataset.optsp === 'true' && spCounts.hasOwnProperty(val)) spCounts[val]++;
        const res = (icon.dataset.results ? icon.dataset.results.split(',') : []).concat(Object.keys(icon.dataset).filter(k => k.startsWith('opt')).flatMap(k => {
            const optId = k.slice(3).toLowerCase(), countInc = (icon.dataset[k] === 'true' ? 1 : (!isNaN(icon.dataset[k]) ? parseInt(icon.dataset[k]) : 0));
            if (countInc === 0) return [];
            const optDef = (activityOptions[val] || []).find(o => o.id === optId) || (activityOptions[val] || []).flatMap(o => o.subOptions || []).find(so => so.id === optId);
            return Array(countInc).fill((optDef && optDef.results) ? optDef.results : [optId]).flat();
        }));
        res.forEach(rid => { 
            const id = rid.trim();
            if (id === 'item') extraCounts.get_item++; // 아이템 획득 집계
            if (!['enhance', 'ranenhance', 'enhance_m', 'enhance_a', 'delete', 'delete_m', 'delete_a', 'get', 'get_m', 'get_a'].includes(id)) {
                if (extraCounts.hasOwnProperty(id)) extraCounts[id]++; 
            }
        });
    });

    // 2. Nia 전용 P-아이템 보너스 계산
    let niaBonusGet = 0;
    let niaBonusDelete = 0;
    let niaBonusEnhance = 0; // 4단계 보너스용
    if (type === 'nia' && savedState.pItems) {
        if (savedState.pItems.includes('nia1-1')) {
            const bonus = Math.min(counts['spclass'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (savedState.pItems.includes('nia1-2')) {
            const bonus = Math.min(counts['advice'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        
        let nia21Count = 0, nia22Count = 0, nia23Count = 0;
        let nia41Count = 0, nia42Count = 0;

        board.querySelectorAll('.week-row').forEach(row => {
            const week = parseInt(row.dataset.week);
            const icon = row.querySelector('.plan-icon-wrapper.active[data-value="class_nia"]');
            if (icon) {
                if (icon.dataset.optget_enhancedcard === 'true') nia21Count++;
                if (icon.dataset.optget_ppoint === 'true') nia22Count++;
                if (icon.dataset.optget_drink === 'true') nia23Count++;

                if (week >= 10) {
                    if (icon.dataset.optget_enhancedcard === 'true') nia41Count++;
                    if (icon.dataset.optget_drink === 'true') nia42Count++;
                }
            }
        });

        if (savedState.pItems.includes('nia2-1')) {
            const bonus = Math.min(nia21Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (savedState.pItems.includes('nia2-2')) {
            const bonus = Math.min(nia22Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (savedState.pItems.includes('nia2-3')) {
            const bonus = Math.min(nia23Count, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }

        if (savedState.pItems.includes('nia3-1')) {
            const bonus = Math.min(counts['audition'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }
        if (savedState.pItems.includes('nia3-2')) {
            const bonus = Math.min(counts['audition'] || 0, 2);
            niaBonusGet += bonus; niaBonusDelete += bonus;
        }

        if (savedState.pItems.includes('nia4-1')) {
            niaBonusEnhance += Math.min(nia41Count, 2);
        }
        if (savedState.pItems.includes('nia4-2')) {
            extraCounts.get_drink += Math.min(nia42Count, 2) * 2;
        }
    }

    // 3. 슬롯 선택 카드 (체크박스) 반영
    const selectedIds = (savedState.planCards && activePlan) ? (savedState.planCards[activePlan] || []) : [];
    const cardChecked = savedState.cardChecked || {};
    selectedIds.forEach(id => {
        if (cardChecked[id]) {
            const card = cardList.find(c => c.id === id);
            if (card) {
                if (card.have === 'item') {
                    extraCounts.get_item++;
                } else if (card.have?.startsWith('card_')) {
                    if (card.rarity === 'SSR') extraCounts.get_ssr++; // 카드일 때만 SSR 획득 증가
                    if (card.have === 'card_m') {
                        extraCounts.get_m++;
                        extraCounts.get++;
                    } else if (card.have === 'card_a') {
                        extraCounts.get_a++;
                        extraCounts.get++;
                    }
                }
            }
        }
    });

    // 4. 강화/삭제/획득 분배 로직
    // 1) 강화 분배 (니아 보너스 포함)
    const totalEnhancePool = pools.enhance.generic + niaBonusEnhance;
    let manualE = savedState.manualEnhance || { m: totalEnhancePool, a: 0 };
    const diffE = totalEnhancePool - (Number(manualE.m) + Number(manualE.a));
    if (diffE !== 0) manualE.m = Math.max(0, Number(manualE.m) + diffE);
    extraCounts.enhance += totalEnhancePool + pools.enhance.m + pools.enhance.a;
    extraCounts.enhance_m += pools.enhance.m + Number(manualE.m);
    extraCounts.enhance_a += pools.enhance.a + Number(manualE.a);

    // 2) 삭제 분배
    const totalDeletePool = pools.delete.generic + niaBonusDelete;
    let manualD = savedState.manualDelete || { m: totalDeletePool, a: 0 };
    const diffD = totalDeletePool - (Number(manualD.m) + Number(manualD.a));
    if (diffD !== 0) {
        manualD.m = Math.max(0, Number(manualD.m) + diffD);
    }
    extraCounts.delete += totalDeletePool + pools.delete.m + pools.delete.a;
    extraCounts.delete_m += pools.delete.m + Number(manualD.m);
    extraCounts.delete_a += pools.delete.a + Number(manualD.a);

    // 3) 획득 분배
    const totalGetPool = pools.get.generic + niaBonusGet;
    let manualG = savedState.manualGet || { m: totalGetPool, a: 0 };
    const diffG = totalGetPool - (Number(manualG.m) + Number(manualG.a));
    if (diffG !== 0) {
        manualG.m = Math.max(0, Number(manualG.m) + diffG);
    }
    extraCounts.get += totalGetPool + pools.get.m + pools.get.a;
    extraCounts.get_m += pools.get.m + Number(manualG.m);
    extraCounts.get_a += pools.get.a + Number(manualG.a);

    // 5. 기타 획득 수동 보정 반영
    const manualOther = savedState.manualOther || {};
    Object.keys(manualOther).forEach(key => {
        if (extraCounts.hasOwnProperty(key)) {
            extraCounts[key] = (extraCounts[key] || 0) + (Number(manualOther[key]) || 0);
            if (extraCounts[key] < 0) extraCounts[key] = 0;
        }
    });

    const sortOrder = ['lessonvo', 'lessondan', 'lessonvi', 'class_hajime', 'class_nia', 'goout_hajime', 'goout_nia', 'gift_hajime', 'gift_nia', 'advice', 'spclass', 'audition', 'test', 'oikomi'];
    const allPossibleValues = Array.from(new Set(Array.from(board.querySelectorAll('.plan-icon-wrapper')).map(w => w.dataset.value)));
    updateActivityCountsUI(counts, spCounts, extraCounts, activePlan, allPossibleValues, sortOrder, type);
}

function saveCalcState() {
    const board = document.querySelector('.unified-plan-board');
    if (!board) return;
    const type = board.dataset.calcType;
    const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type || '';
    
    // [수정] 모든 수동 분배 데이터(manualEnhance, manualDelete, manualGet)를 보존하며 저장
    const oldSaved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    const manualEnhance = oldSaved.manualEnhance || null;
    const manualDelete = oldSaved.manualDelete || null;
    const manualGet = oldSaved.manualGet || null;
    const manualOther = oldSaved.manualOther || null;
    const cardChecked = oldSaved.cardChecked || {};
    const planCards = oldSaved.planCards || {};
    
    // P-아이템 상태 추출
    const pItems = [];
    document.querySelectorAll('.p-item-slot').forEach(slot => {
        const img = slot.querySelector('img');
        pItems.push(img ? img.dataset.val : null);
    });

    const panel = document.getElementById('calc-side-panel');
    if (panel && activePlan) {
        planCards[activePlan] = Array.from(panel.querySelectorAll('.side-card-item.selected')).map(i => i.dataset.id);
    }

    const stateData = {
        ...oldSaved,
        manualEnhance: manualEnhance,
        manualDelete: manualDelete,
        manualGet: manualGet,
        manualOther: manualOther,
        cardChecked: cardChecked,
        pItems: pItems, // P-아이템 저장 추가
        planCards: planCards,
        selectedIdol: document.querySelector('.idol-sel-item.active')?.dataset.id || '',
        planType: activePlan,
        isBoardCollapsed: board.classList.contains('collapsed-board'),
        weeks: {}
    };

    board.querySelectorAll('.week-row').forEach(row => {
        const activeIcon = row.querySelector('.plan-icon-wrapper.active');
        if (activeIcon) {
            const opts = {}; Object.keys(activeIcon.dataset).forEach(k => { if (k.startsWith('opt')) opts[k.slice(3).toLowerCase()] = activeIcon.dataset[k]; });
            stateData.weeks[row.dataset.week] = { value: activeIcon.dataset.value, opts };
        }
    });

    localStorage.setItem(`calc_state_${type}`, JSON.stringify(stateData));
    refreshCardBonuses(); updateActivityCounts();
}

// toggleSupportCardPanel 내에서 호출되는 updateSelectedCardsUI는 이미 위에서 수정함.
// 그런데 saveCalcState 내부에서는 updateSelectedCardsUI를 직접 호출하지 않고 
// updateActivityCounts가 이를 간접적으로 호출하거나 별도로 호출하지 않음.
// 아, saveCalcState 끝에서 updateActivityCounts()를 부르는데, 
// updateActivityCounts() 안에서 updateSelectedCardsUI를 부르지 않으므로 상관없음.
// 하지만 카드 선택 시(panel click) updateSelectedCardsUI를 부르는 로직이 toggleSupportCardPanel에 있음.

function setupIdolSelector() {
    const grid = document.getElementById('idol-selector-grid');
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    if (grid) {
        grid.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
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
            // 드래그가 끝났음을 표시하지만, click 이벤트에서 처리 후 초기화해야 하므로 여기서는 유지하거나
            // click 이벤트가 mouseup 직후에 발생하므로 타이밍 조절이 필요할 수 있음.
            // 여기서는 단순히 isDown만 해제. isDragging은 click 핸들러에서 확인 후 리셋하거나, 
            // setTimeout으로 약간 늦게 리셋하여 click이 이를 감지하게 함.
            setTimeout(() => { isDragging = false; }, 0); 
        });
        grid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 2; // 스크롤 속도
            grid.scrollLeft = scrollLeft - walk;
            if (Math.abs(walk) > 5) {
                isDragging = true;
            }
        });
    }

    document.querySelectorAll('.idol-sel-item').forEach(item => {
        item.onclick = (e) => { 
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (item.classList.contains('active')) return; 
            document.querySelectorAll('.idol-sel-item').forEach(i => i.classList.remove('active')); 
            item.classList.add('active'); 
            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); 
            saveCalcState(); 
        };
    });
}

function setupPlanTypeSelector() {
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

function setupCalcAction() {
    document.getElementById('btn-run-calc').onclick = () => {
        const panel = document.getElementById('calc-side-panel');
        if (panel?.classList.contains('open')) { closeSupportCardPanel(); return; }
        const activePlan = document.querySelector('.plan-type-btn.active')?.dataset.type;
        if (activePlan) toggleSupportCardPanel(activePlan);
    };
}

function renderSidePanelContent(panel, selectedPlan) {
    const filtered = cardList.filter(c => (c.plan === selectedPlan || c.plan === 'free') && c.rarity !== 'R' && c.type !== 'assist');
    const renderCol = (type) => filtered.filter(c => c.type === type).map(c => {
        const lb = state.supportLB[c.id] || 0;
        return `<div class="side-card-item" data-id="${c.id}"><img src="images/support/${c.id}.webp" onerror="this.src='icons/card.png'"><img src="images/support/${c.id}_card.webp" class="side-card-overlay-icon" onerror="this.src='images/support/${c.id}_item.webp'; this.onerror=null;"><div class="calc-card-stars">${Array.from({length:4}, (_, i) => `<img src="icons/flower.png" class="calc-card-star ${i < lb ? 'active' : ''}">`).join('')}</div><div class="card-bonus-overlay"><span class="bonus-val"></span></div><div class="info-btn">i</div></div>`;
    }).join('');
    panel.innerHTML = `<div class="side-panel-tabs"><div class="panel-tab-item"><img src="icons/vocal.png"></div><div class="panel-tab-item"><img src="icons/dance.png"></div><div class="panel-tab-item"><img src="icons/visual.png"></div></div><div class="side-panel-content"><div class="calc-spinner-overlay" id="calc-side-spinner-overlay"><div class="calc-spinner"></div></div><div class="side-panel-column" data-type="vocal">${renderCol('vocal')}</div><div class="side-panel-column" data-type="dance">${renderCol('dance')}</div><div class="side-panel-column" data-type="visual">${renderCol('visual')}</div></div>`;
}

function toggleSupportCardPanel(selectedPlan) {
    let panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (panel?.classList.contains('open')) { closeSupportCardPanel(); return; }
    if (!panel) {
        panel = document.createElement('div'); panel.id = 'calc-side-panel'; panel.className = 'calc-side-panel';
        (window.innerWidth <= 768 ? document.body : document.querySelector('.calc-container')).appendChild(panel);
        panel.addEventListener('click', (e) => {
            const infoBtn = e.target.closest('.info-btn'), item = e.target.closest('.side-card-item');
            if (infoBtn && item) {
                e.stopPropagation();
                const card = cardList.find(c => c.id === item.dataset.id);
                if (card) window.showCardModal(card, (state.currentLang === 'ja' && card.name_ja ? card.name_ja : card.name), card.image || `images/support/${card.id}.webp`);
                return;
            }
            if (item) {
                const board = document.querySelector('.unified-plan-board');
                const type = board?.dataset.calcType;
                const cardId = item.dataset.id, isSelected = item.classList.contains('selected');
                let selectedItems = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0));
                
                const current = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
                if (!current.cardChecked) current.cardChecked = {};

                if (isSelected) { 
                    item.classList.remove('selected'); 
                    delete item.dataset.selectTime;
                    // 카드를 뺄 때 체크 상태도 함께 삭제
                    if (current.cardChecked[cardId]) delete current.cardChecked[cardId];
                }
                else {
                    if (selectedItems.length >= 6) { 
                        const oldestItem = selectedItems[0]; 
                        oldestItem.classList.remove('selected'); 
                        delete oldestItem.dataset.selectTime;
                        if (current.cardChecked[oldestItem.dataset.id]) delete current.cardChecked[oldestItem.dataset.id];
                    }
                    item.classList.add('selected'); item.dataset.selectTime = Date.now();
                }
                
                localStorage.setItem(`calc_state_${type}`, JSON.stringify(current));
                const finalIds = Array.from(panel.querySelectorAll('.side-card-item.selected')).sort((a, b) => (parseInt(a.dataset.selectTime) || 0) - (parseInt(b.dataset.selectTime) || 0)).map(el => el.dataset.id);
                updateSelectedCardsUI(finalIds, type); 
                saveCalcState();
            }
        });
    }
    if (window.innerWidth <= 768 && !overlay) { overlay = document.createElement('div'); overlay.id = 'panel-overlay'; overlay.className = 'panel-overlay'; document.body.appendChild(overlay); overlay.onclick = closeSupportCardPanel; }
    renderSidePanelContent(panel, selectedPlan);
    const boardElem = document.querySelector('.unified-plan-board');
    if (boardElem) {
        const type = boardElem.dataset.calcType, saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
        const planCards = (saved.planCards && selectedPlan) ? (saved.planCards[selectedPlan] || []) : [];
        planCards.forEach(id => {
            const item = panel.querySelector(`.side-card-item[data-id="${id}"]`);
            if (item) { item.classList.add('selected'); item.dataset.selectTime = Date.now(); }
        });
        updateSelectedCardsUI(planCards, type);
    }
    requestAnimationFrame(() => {
        panel.classList.add('open'); if (overlay) overlay.classList.add('show');
        setTimeout(() => { refreshCardBonuses(); document.getElementById('calc-side-spinner-overlay')?.remove(); }, 150);
    });
}

export function closeSupportCardPanel(isPopState = false) {
    const panel = document.getElementById('calc-side-panel'), overlay = document.getElementById('panel-overlay');
    if (panel?.classList.contains('open')) { panel.classList.remove('open'); if (overlay) overlay.classList.remove('show'); if (!isPopState && window.innerWidth <= 768 && history.state?.panelOpen) history.back(); }
}
window.closeSupportCardPanel = closeSupportCardPanel;

function setupIconToggles() {
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
        // dist-btn 클릭 시 툴팁 제거 로직 방지
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
                        if (chk.checked && opts.find(o => o.id === chk.dataset.id)?.subOptions) showSubTooltip(opts.find(o => o.id === chk.dataset.id), wrapper, tooltip);
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
    document.addEventListener('mousedown', (e) => { 
        if (!e.target.closest('.calc-tooltip, .calc-sub-tooltip, .plan-icon-wrapper, .dist-btn, .p-item-slot')) {
            // 툴팁이 화면에 있을 때만 제거 로직 실행
            if (document.querySelector('.calc-tooltip, .calc-sub-tooltip, .p-item-tooltip')) {
                removeAllTooltips();
                document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove());
            }
        }
    });
}

function updateSPBadge(w) { w.querySelector('.sp-badge')?.remove(); if (w.classList.contains('active') && w.dataset.optsp === 'true') { const b = document.createElement('div'); b.className = 'sp-badge'; b.textContent = 'SP'; w.appendChild(b); } }
function updateMainLabel(w) {
    w.querySelector('.main-label-text')?.remove(); if (!w.classList.contains('active')) return;
    const labels = (activityOptions[w.dataset.value] || []).filter(o => o.mainlabel && (o.type === 'counter' ? parseInt(w.dataset[`opt${o.id}`]) > 0 : w.dataset[`opt${o.id}`] === 'true')).map(o => o.type === 'counter' ? `${o.mainlabel} ${w.dataset[`opt${o.id}`]}` : o.mainlabel);
    if (labels.length > 0) { const l = document.createElement('div'); l.className = 'main-label-text'; l.textContent = labels.join(' '); w.appendChild(l); }
}

function setupBackBtn() { document.querySelector('.back-btn').onclick = () => renderCalcMenu(); }

let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const cur = window.innerWidth;
    if ((lastWidth <= 768 && cur > 768) || (lastWidth > 768 && cur <= 768)) {
        document.getElementById('calc-side-panel')?.remove(); document.getElementById('panel-overlay')?.remove();
        const type = document.querySelector('.unified-plan-board')?.dataset.calcType;
        if (type) renderWeeklyPlan(type);
    }
    lastWidth = cur;
});

function showSubTooltip(parent, wrapper, pTooltip) {
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

function setupPItemSelector(type) {
    if (type !== 'nia') return;
    const container = document.getElementById('p-item-container');
    if (!container) return;

    const saved = JSON.parse(localStorage.getItem(`calc_state_${type}`)) || {};
    const pItems = saved.pItems || [null, null, null, null];
    
    // 각 슬롯별 아이템 정의
    const niaItemsBySlot = [
        ['nia1-1', 'nia1-2'],
        ['nia2-1', 'nia2-2', 'nia2-3'],
        ['nia3-1', 'nia3-2'],
        ['nia4-1', 'nia4-2', 'nia4-3']
    ];

    // 초기 렌더링
    container.querySelectorAll('.p-item-slot').forEach((slot, idx) => {
        const val = pItems[idx];
        if (val) {
            slot.innerHTML = `<img src="icons/cal/${val}.webp" data-val="${val}">`;
        } else {
            slot.innerHTML = '<span class="p-item-placeholder">+</span>';
        }

        slot.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.p-item-tooltip').forEach(t => t.remove());
            
            const tooltip = document.createElement('div');
            tooltip.className = 'calc-tooltip p-item-tooltip';
            tooltip.style.flexDirection = 'row';
            tooltip.style.flexWrap = 'wrap';
            tooltip.style.width = '210px'; // 4열(40px*4 + 8px*3 + padding)에 맞춘 적정 너비
            tooltip.style.minWidth = '180px'; // 기존 최소 너비 유지 시도
            tooltip.style.gap = '8px';
            tooltip.style.justifyContent = 'flex-start';
            tooltip.style.padding = '12px';

            // 해당 슬롯 전용 아이템 목록 가져오기
            const currentSlotItems = niaItemsBySlot[idx] || [];

            // 초기화 버튼 (X 박스) - 맨 앞으로 이동
            const clearBtn = document.createElement('div');
            clearBtn.textContent = 'X';
            clearBtn.className = 'calc-btn';
            clearBtn.style.width = '40px';
            clearBtn.style.height = '40px';
            clearBtn.style.padding = '0';
            clearBtn.style.display = 'flex';
            clearBtn.style.alignItems = 'center';
            clearBtn.style.justifyContent = 'center';
            clearBtn.style.fontSize = '1.2rem';
            clearBtn.style.backgroundColor = '#f8f9fa';
            clearBtn.style.color = '#888';
            clearBtn.style.border = '1px solid #ddd';
            clearBtn.onclick = () => {
                slot.innerHTML = '<span class="p-item-placeholder">+</span>';
                saveCalcState();
                refreshCardBonuses();
                updateActivityCounts();
                tooltip.remove();
            };
            tooltip.appendChild(clearBtn);

            currentSlotItems.forEach(item => {
                const img = document.createElement('img');
                img.src = `icons/cal/${item}.webp`;
                img.style.width = '40px';
                img.style.height = '40px';
                img.style.cursor = 'pointer';
                img.style.border = '1px solid #eee';
                img.style.borderRadius = '4px';
                img.onclick = () => {
                    slot.innerHTML = `<img src="icons/cal/${item}.webp" data-val="${item}">`;
                    saveCalcState();
                    refreshCardBonuses();
                    updateActivityCounts();
                    tooltip.remove();
                };
                tooltip.appendChild(img);
            });

            document.body.appendChild(tooltip);
            const rect = slot.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 10}px`;
            tooltip.style.transform = 'translate(-50%, -100%)';
        };
    });
}
