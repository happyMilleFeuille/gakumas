// roadmap.js
import { state, setRoadmapFilter, idolColors } from './state.js';
import { produceList } from './producedata.js';

// 해외 접속자도 항상 JST/KST(일본/한국) 기준으로 동일한 날짜를 보도록 강제하는 함수
function getJSTDate(dateStr = null) {
    if (dateStr) {
        // "2024-05-16" 형태를 "2024/05/16"로 변환하여 브라우저 로컬 시차와 무관하게 자정으로 파싱
        return new Date(dateStr.replace(/-/g, '/'));
    }
    const jstString = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
    return new Date(jstString);
}

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
    const concentrationToggle = document.getElementById('pssr-concentration-toggle');
    const goodconditionToggle = document.getElementById('pssr-goodcondition-toggle');
    const goodimpressionToggle = document.getElementById('pssr-goodimpression-toggle');
    const motivationToggle = document.getElementById('pssr-motivation-toggle');
    const fullpowerToggle = document.getElementById('pssr-fullpower-toggle');
    const enthusiasmToggle = document.getElementById('pssr-enthusiasm-toggle');

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
    registerToggle(concentrationToggle, 'concentration');
    registerToggle(goodconditionToggle, 'goodcondition');
    registerToggle(goodimpressionToggle, 'goodimpression');
    registerToggle(motivationToggle, 'motivation');
    registerToggle(fullpowerToggle, 'fullpower');
    registerToggle(enthusiasmToggle, 'enthusiasm');

    const showAnother = state.roadmapFilters.another;
    const showDist = state.roadmapFilters.dist;
    const showFes = state.roadmapFilters.fes;
    const showUnit = state.roadmapFilters.unit;
    const showLimited = state.roadmapFilters.limited;
    const showNormal = state.roadmapFilters.normal;
    let showConcentration = state.roadmapFilters.concentration;
    let showGoodCondition = state.roadmapFilters.goodcondition;
    let showGoodImpression = state.roadmapFilters.goodimpression;
    let showMotivation = state.roadmapFilters.motivation;
    let showFullPower = state.roadmapFilters.fullpower;
    let showEnthusiasm = state.roadmapFilters.enthusiasm;

    // 아무 오스스메 필터도 선택하지 않은 경우, 모두 ON 처리
    if (!showConcentration && !showGoodCondition && !showGoodImpression && !showMotivation && !showFullPower && !showEnthusiasm) {
        showConcentration = true;
        showGoodCondition = true;
        showGoodImpression = true;
        showMotivation = true;
        showFullPower = true;
        showEnthusiasm = true;
    }


    // 2. 날짜 및 높이 계산
    const start = new Date(2024, 4, 1, 0, 0, 0, 0);
    const now = getJSTDate();
    
    const width = window.innerWidth;
    const isMobile = width <= 768;
    const imageFolder = 'idols/thumb';
    // PC는 +10일, 모바일(768px 이하)은 +30일 여유 공간 배분
    const paddingDays = isMobile ? 30 : 10;
    const end = new Date(now.getTime() + paddingDays * 24 * 60 * 60 * 1000);
    
    const rangeMs = end.getTime() - start.getTime();
    
    // 일(Day)을 기준으로 소수점까지 부드럽게 늘어나도록 높이 계산
    const totalDays = rangeMs / (1000 * 60 * 60 * 24);
    
    let HEIGHT_PER_MONTH = width <= 768 ? 50 : (width <= 1024 ? 120 : 200);
    const GRAPH_HEIGHT = (totalDays / 30.43) * HEIGHT_PER_MONTH;

    // 3. 헤더 렌더링 (항상 노출되는 영역)
    headerContainer.innerHTML = '';
    // 날짜 컬럼 스페이서 제거 (선 안쪽으로 텍스트를 넣기 위함)


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
            
            // 1차: 오스스메별 필터
            if (p.osusume) {
                if (p.osusume === 'concentration' && !showConcentration) return false;
                if (p.osusume === 'goodcondition' && !showGoodCondition) return false;
                if (p.osusume === 'goodimpression' && !showGoodImpression) return false;
                if (p.osusume === 'motivation' && !showMotivation) return false;
                if ((p.osusume === 'fullpower' || p.osusume === 'preservation') && !showFullPower) return false;
                if (p.osusume === 'enthusiasm' && !showEnthusiasm) return false;
            }

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
            const latestCard = [...idolPSSRs].sort((a, b) => getJSTDate(b.releasedAt) - getJSTDate(a.releasedAt))[0];
            const lastDate = getJSTDate(latestCard.releasedAt);
            lastDate.setHours(0, 0, 0, 0);
            const today = getJSTDate();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) {
                daysText = "D-Day";
            } else {
                daysText = diffDays > 0 ? `D+${diffDays}` : `D${diffDays}`;
            }
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
        // 1차: 오스스메별 필터
        if (p.osusume) {
            if (p.osusume === 'concentration' && !showConcentration) return false;
            if (p.osusume === 'goodcondition' && !showGoodCondition) return false;
            if (p.osusume === 'goodimpression' && !showGoodImpression) return false;
            if (p.osusume === 'motivation' && !showMotivation) return false;
            if ((p.osusume === 'fullpower' || p.osusume === 'preservation') && !showFullPower) return false;
            if (p.osusume === 'enthusiasm' && !showEnthusiasm) return false;
        }

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
    // 날짜 컬럼 요소 제거 (선 안쪽으로 텍스트 이동)


    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        d.setDate(1); d.setHours(0, 0, 0, 0);
        const ratio = (d.getTime() - start.getTime()) / rangeMs;
        const bottomOffset = ratio * GRAPH_HEIGHT;
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.bottom = `${bottomOffset}px`;
        
        // 현재 시점보다 미래의 달이면 글씨(라벨)를 표시하지 않음
        if (d <= now) {
            marker.innerHTML = `<span class="time-label">${d.getFullYear()}.${d.getMonth() + 1}</span>`;
        }
        
        graphWrapper.appendChild(marker);
    }

    // 모바일에서만 lazy loading 적용 (IntersectionObserver)
    let roadmapNodeObserver = null;
    if (isMobile && 'IntersectionObserver' in window) {
        roadmapNodeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const node = entry.target;
                roadmapNodeObserver.unobserve(node);
                // 노드 내부의 모든 data-src 이미지를 실제 로드
                node.querySelectorAll('img[data-src]').forEach(img => {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                });
            });
        }, {
            rootMargin: '300px 0px',
            threshold: 0.01
        });
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
                const ratio = (getJSTDate(card.releasedAt).getTime() - start.getTime()) / rangeMs;
                const bottomOffset = ratio * GRAPH_HEIGHT;
                if (bottomOffset < minBottom) minBottom = bottomOffset;
            });
            column.style.setProperty('--line-start', `${minBottom}px`);
        } else {
            column.style.setProperty('--line-start', '100%');
        }

        idolPSSRs.forEach(card => {
            const ratio = (getJSTDate(card.releasedAt).getTime() - start.getTime()) / rangeMs;
            const bottomOffset = ratio * GRAPH_HEIGHT;
            const node = document.createElement('div');
            node.className = 'roadmap-node';
            node.style.bottom = `${bottomOffset}px`;

            const cardDate = getJSTDate(card.releasedAt);
            cardDate.setHours(0, 0, 0, 0);
            const today = getJSTDate();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - cardDate) / (1000 * 60 * 60 * 24));
            const dDayText = diffDays === 0 ? " (D-Day)" : (diffDays > 0 ? ` (D+${diffDays})` : ` (D${diffDays})`);

            const displayName = (state.currentLang === 'en' && card.name_en) ? card.name_en : ((state.currentLang !== 'ko' && card.name_ja) ? card.name_ja : card.name);
            if (isMobile && roadmapNodeObserver) {
                // 모바일: data-src로 지연 로딩
                node.innerHTML = `
                    <div class="roadmap-node-inner"><img data-src="${imageFolder}/${card.id}1.webp" class="roadmap-node-img" alt="${card.name}" onload="this.classList.add('loaded')"></div>
                    <div class="roadmap-tooltip">
                        <img data-src="idols/${card.id}1.webp" class="tooltip-card-img" decoding="async">
                        <div class="tooltip-text">
                            <strong>
                                <img data-src="icons/${card.plan}.webp" class="plan-icon-tooltip" alt="${card.plan}">
                                ${displayName}
                            </strong>
                            <span>
                                ${card.releasedAt}${dDayText}
                            </span>
                        </div>
                    </div>
                `;
                roadmapNodeObserver.observe(node);
            } else {
                // PC: 기존 eager 로딩 유지
                node.innerHTML = `
                    <div class="roadmap-node-inner"><img src="${imageFolder}/${card.id}1.webp" class="roadmap-node-img" alt="${card.name}" loading="eager" onload="this.classList.add('loaded')"></div>
                    <div class="roadmap-tooltip">
                        <img src="idols/${card.id}1.webp" class="tooltip-card-img" decoding="async">
                        <div class="tooltip-text">
                            <strong>
                                <img src="icons/${card.plan}.webp" class="plan-icon-tooltip" alt="${card.plan}">
                                ${displayName}
                            </strong>
                            <span>
                                ${card.releasedAt}${dDayText}
                            </span>
                        </div>
                    </div>
                `;
            }
            column.appendChild(node);
        });
        graphWrapper.appendChild(column);
    });
}
