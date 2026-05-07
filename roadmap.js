// roadmap.js
import { state, setRoadmapFilter, idolColors } from './state.js';
import { produceList } from './producedata.js';

export const idolList = [
    'saki', 'temari', 'kotone', 'tsubame', 'mao', 'lilja',
    'china', 'sumika', 'hiro', 'sena', 'misuzu', 'ume', 'rinami'
];

const idolNameMap = {
    saki: { ko: "사키", ja: "咲季" },
    temari: { ko: "테마리", ja: "手毬" },
    kotone: { ko: "코토네", ja: "琴音" },
    tsubame: { ko: "츠바메", ja: "つばめ" },
    mao: { ko: "마오", ja: "麻央" },
    lilja: { ko: "릴리야", ja: "リーリヤ" },
    china: { ko: "치나", ja: "千奈" },
    sumika: { ko: "스미카", ja: "清夏" },
    hiro: { ko: "히로", ja: "広" },
    sena: { ko: "세나", ja: "星南" },
    misuzu: { ko: "미스즈", ja: "美鈴" },
    ume: { ko: "우메", ja: "佑芽" },
    rinami: { ko: "리나미", ja: "莉波" }
};

export function renderPSSRRoadmap(shouldScroll = false) {
    const listContainer = document.getElementById('pssr-roadmap-list');
    const headerContainer = document.getElementById('pssr-roadmap-header');
    const roadmapContainer = document.getElementById('pssr-roadmap-container');
    if (!listContainer || !headerContainer) return;

    const isExpanded = roadmapContainer ? !roadmapContainer.classList.contains('is-collapsed') : false;

    // 1. 토글 요소들 등록
    const anotherToggle = document.getElementById('pssr-another-toggle');
    const distToggle = document.getElementById('pssr-dist-toggle');
    const fesToggle = document.getElementById('pssr-fes-toggle');
    const unitToggle = document.getElementById('pssr-unit-toggle');
    const limitedToggle = document.getElementById('pssr-limited-toggle');
    const normalToggle = document.getElementById('pssr-normal-toggle');
    const senseToggle = document.getElementById('pssr-sense-toggle');
    const logicToggle = document.getElementById('pssr-logic-toggle');
    const anomalyToggle = document.getElementById('pssr-anomaly-toggle');

    const registerToggle = (el, filterType) => {
        if (el) {
            el.checked = state.roadmapFilters[filterType];
        }
    };

    registerToggle(anotherToggle, 'another');
    registerToggle(distToggle, 'dist');
    registerToggle(fesToggle, 'fes');
    registerToggle(unitToggle, 'unit');
    registerToggle(limitedToggle, 'limited');
    registerToggle(normalToggle, 'normal');
    registerToggle(senseToggle, 'sense');
    registerToggle(logicToggle, 'logic');
    registerToggle(anomalyToggle, 'anomaly');

    const showAnother = state.roadmapFilters.another;
    const showDist = state.roadmapFilters.dist;
    const showFes = state.roadmapFilters.fes;
    const showUnit = state.roadmapFilters.unit;
    const showLimited = state.roadmapFilters.limited;
    const showNormal = state.roadmapFilters.normal;
    const showSense = state.roadmapFilters.sense;
    const showLogic = state.roadmapFilters.logic;
    const showAnomaly = state.roadmapFilters.anomaly;

    // 2. 날짜 및 높이 계산
    const start = new Date(2024, 4, 1, 0, 0, 0, 0);
    const now = new Date();
    
    const width = window.innerWidth;
    // PC는 +10일, 모바일(768px 이하)은 +30일 여유 공간 배분
    const paddingDays = width <= 768 ? 30 : 10;
    const end = new Date(now.getTime() + paddingDays * 24 * 60 * 60 * 1000);
    
    const rangeMs = end.getTime() - start.getTime();
    
    // 일(Day)을 기준으로 소수점까지 부드럽게 늘어나도록 높이 계산
    const totalDays = rangeMs / (1000 * 60 * 60 * 24);
    
    let HEIGHT_PER_MONTH = width <= 768 ? 50 : (width <= 1024 ? 120 : 200);
    const GRAPH_HEIGHT = (totalDays / 30.43) * HEIGHT_PER_MONTH;

    // 3. 헤더 렌더링 (항상 노출되는 영역)
    headerContainer.innerHTML = '';
    const dateSpacer = document.createElement('div');
    dateSpacer.className = 'roadmap-date-column-spacer';
    dateSpacer.style.flex = `0 0 clamp(35px, 10vw, 70px)`;
    headerContainer.appendChild(dateSpacer);

    idolList.forEach((idolName) => {
        const columnHeader = document.createElement('div');
        columnHeader.className = 'roadmap-column-header-persistent';
        columnHeader.style.flex = '1';
        columnHeader.style.display = 'flex';
        columnHeader.style.justifyContent = 'center';

        const idolColor = idolColors[idolName] || '#f1f3f5';
        columnHeader.style.setProperty('--idol-theme-color', idolColor);

        const idolPSSRs = produceList.filter(p => {
            if (p.rarity !== 'PSSR' || !p.releasedAt || !p.id.startsWith(`ssr${idolName}_`)) return false;
            
            // 1차: 플랜별 필터 (Sense, Logic, Anomaly)
            if (p.plan === 'sense' && !showSense) return false;
            if (p.plan === 'logic' && !showLogic) return false;
            if (p.plan === 'anomaly' && !showAnomaly) return false;

            // 2차: 출처별 필터
            if (p.another) return showAnother;
            if (p.source === 'dist') return showDist;
            if (p.source === 'limited_f') return showFes;
            if (p.source === 'limited_u') return showUnit;
            if (p.source === 'limited') return showLimited;
            if (p.source === 'normal') return showNormal;
            return true;
        });

        let daysText = "";
        if (idolPSSRs.length > 0) {
            const latestCard = [...idolPSSRs].sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))[0];
            const lastDate = new Date(latestCard.releasedAt);
            lastDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            daysText = diffDays >= 0 ? `D+${diffDays}` : `D${diffDays}`;
        }

        const iconName = idolName === 'tsubame' ? 'tsubame' : idolName;
        columnHeader.innerHTML = `
            <img src="icons/idolicons/${iconName}_c.png" class="column-idol-icon" loading="eager">
            ${daysText ? `<div class="idol-header-tooltip">${daysText}</div>` : ''}
        `;
        headerContainer.appendChild(columnHeader);
    });

    // 4. 그래프 본체 렌더링 (확장 시에만)
    if (!isExpanded && !shouldScroll) {
        listContainer.innerHTML = '';
        return;
    }

    let roadmapData = produceList.filter(p => p.rarity === 'PSSR' && p.releasedAt);
    roadmapData = roadmapData.filter(p => {
        // 1차: 플랜별 필터
        if (p.plan === 'sense' && !showSense) return false;
        if (p.plan === 'logic' && !showLogic) return false;
        if (p.plan === 'anomaly' && !showAnomaly) return false;

        // 2차: 출처별 필터
        if (p.another) return showAnother;
        if (p.source === 'dist') return showDist;
        if (p.source === 'limited_f') return showFes;
        if (p.source === 'limited_u') return showUnit;
        if (p.source === 'limited') return showLimited;
        if (p.source === 'normal') return showNormal;
        return true;
    });

    listContainer.innerHTML = '';
    const graphWrapper = document.createElement('div');
    graphWrapper.className = 'roadmap-graph-wrapper';
    graphWrapper.style.height = `${GRAPH_HEIGHT}px`;
    listContainer.appendChild(graphWrapper);

    const dateColumn = document.createElement('div');
    dateColumn.className = 'roadmap-date-column';
    graphWrapper.appendChild(dateColumn);

    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        d.setDate(1); d.setHours(0, 0, 0, 0);
        const ratio = (d.getTime() - start.getTime()) / rangeMs;
        const bottomOffset = ratio * GRAPH_HEIGHT;
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.bottom = `${bottomOffset}px`;
        marker.innerHTML = `<span class="time-label">${d.getFullYear()}.${d.getMonth() + 1}</span>`;
        graphWrapper.appendChild(marker);
    }

    idolList.forEach((idolName, index) => {
        const column = document.createElement('div');
        column.className = 'roadmap-column';
        
        // 양쪽 끝 2열씩 특수 클래스 부여 (모바일 툴팁 정렬용)
        if (index === 0) column.classList.add('is-first-col');
        if (index === 1) column.classList.add('is-second-col');
        if (index === idolList.length - 1) column.classList.add('is-last-col');
        if (index === idolList.length - 2) column.classList.add('is-second-last-col');

        const idolColor = idolColors[idolName] || '#f1f3f5';
        column.style.setProperty('--idol-theme-color', idolColor);

        const idolPSSRs = roadmapData.filter(p => p.id.startsWith(`ssr${idolName}_`));
        let minBottom = GRAPH_HEIGHT;
        if (idolPSSRs.length > 0) {
            idolPSSRs.forEach(card => {
                const ratio = (new Date(card.releasedAt).getTime() - start.getTime()) / rangeMs;
                const bottomOffset = ratio * GRAPH_HEIGHT;
                if (bottomOffset < minBottom) minBottom = bottomOffset;
            });
            column.style.setProperty('--line-start', `${minBottom}px`);
        } else {
            column.style.setProperty('--line-start', '100%');
        }

        idolPSSRs.forEach(card => {
            const ratio = (new Date(card.releasedAt).getTime() - start.getTime()) / rangeMs;
            const bottomOffset = ratio * GRAPH_HEIGHT;
            const node = document.createElement('div');
            node.className = 'roadmap-node';
            node.style.bottom = `${bottomOffset}px`;
            const displayName = (state.currentLang === 'en' && card.name_en) ? card.name_en : ((state.currentLang !== 'ko' && card.name_ja) ? card.name_ja : card.name);
            node.innerHTML = `
                <div class="roadmap-node-inner"><img src="idols/${card.id}1.webp" class="roadmap-node-img" alt="${card.name}" loading="eager" onload="this.classList.add('loaded')"></div>
                <div class="roadmap-tooltip">
                    <img src="idols/${card.id}1.webp" class="tooltip-card-img" decoding="async">
                    <div class="tooltip-text">
                        <strong>${displayName}</strong>
                        <span>
                            ${card.releasedAt}
                            <img src="icons/${card.plan}.webp" class="plan-icon-tooltip" alt="${card.plan}">
                        </span>
                    </div>
                </div>
            `;
            column.appendChild(node);
        });
        graphWrapper.appendChild(column);
    });
}
