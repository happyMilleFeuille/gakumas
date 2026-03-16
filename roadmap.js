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

/**
 * PSSR 출시 이력을 세로 위쪽 방향의 그래프(로드맵) 형식으로 렌더링합니다.
 * 하단이 과거, 상단이 최신입니다.
 */
export function renderPSSRRoadmap(shouldScroll = false) {
    const listContainer = document.getElementById('pssr-roadmap-list');
    const anotherToggle = document.getElementById('pssr-another-toggle');
    const distToggle = document.getElementById('pssr-dist-toggle');
    const fesToggle = document.getElementById('pssr-fes-toggle');
    const unitToggle = document.getElementById('pssr-unit-toggle');
    const limitedToggle = document.getElementById('pssr-limited-toggle');
    const normalToggle = document.getElementById('pssr-normal-toggle');
    if (!listContainer) return;

    // 초기 상태 반영 및 이벤트 리스너 등록
    const registerToggle = (el, filterType) => {
        if (el) {
            // 저장된 상태 반영
            el.checked = state.roadmapFilters[filterType];
            
            if (!el.dataset.listener) {
                el.addEventListener('change', (e) => {
                    setRoadmapFilter(filterType, e.target.checked);
                    renderPSSRRoadmap(false);
                });
                el.dataset.listener = 'true';
            }
        }
    };

    registerToggle(anotherToggle, 'another');
    registerToggle(distToggle, 'dist');
    registerToggle(fesToggle, 'fes');
    registerToggle(unitToggle, 'unit');
    registerToggle(limitedToggle, 'limited');
    registerToggle(normalToggle, 'normal');

    const showAnother = state.roadmapFilters.another;
    const showDist = state.roadmapFilters.dist;
    const showFes = state.roadmapFilters.fes;
    const showUnit = state.roadmapFilters.unit;
    const showLimited = state.roadmapFilters.limited;
    const showNormal = state.roadmapFilters.normal;

    // [정밀 정렬] 기준 날짜 (24년 5월 ~ 26년 4월)
    const start = new Date(2024, 4, 1, 0, 0, 0, 0); 
    const end = new Date(2026, 3, 1, 0, 0, 0, 0);   
    const rangeMs = end.getTime() - start.getTime();

    // [유동적 높이 계산] 월 수에 따라 비례하도록 변경
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    
    // 단계별 높이 조절로 반응형 개선 (PC 기준 200px로 조정)
    const width = window.innerWidth;
    let HEIGHT_PER_MONTH = 200; // PC: 200px
    if (width <= 768) {
        HEIGHT_PER_MONTH = 50;  // 모바일
    } else if (width <= 1024) {
        HEIGHT_PER_MONTH = 120; // 태블릿/작은 PC: 120px
    }
    
    const GRAPH_HEIGHT = monthDiff * HEIGHT_PER_MONTH; 

    // 필터링 적용: 어나더는 독립적으로, 일반 카드는 소스별로 필터링
    let roadmapData = produceList.filter(p => p.rarity === 'PSSR' && p.releasedAt);
    
    roadmapData = roadmapData.filter(p => {
        // 어나더 카드인 경우: 오직 어나더 토글 상태에만 의존 (한정/통상 여부 상관없음)
        if (p.another) {
            return showAnother;
        }
        
        // 일반 카드인 경우: 각 소스별 토글 상태 확인
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

    // 1. 날짜 전용 1열(컬럼) 및 그리드 생성
    const dateColumn = document.createElement('div');
    dateColumn.className = 'roadmap-date-column';
    graphWrapper.appendChild(dateColumn);
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        d.setDate(1); d.setHours(0, 0, 0, 0);
        const ratio = (d.getTime() - start.getTime()) / rangeMs;
        const bottomOffset = ratio * GRAPH_HEIGHT;
        
        // 가로 그리드 선 (전체 너비)
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.bottom = `${bottomOffset}px`;
        
        // 날짜 라벨 (1열 전용)
        marker.innerHTML = `<span class="time-label">${d.getFullYear()}.${d.getMonth() + 1}</span>`;
        graphWrapper.appendChild(marker);
    }

    // 2. 캐릭터별 컬럼 및 노드 배치
    idolList.forEach((idolName, index) => {
        const column = document.createElement('div');
        column.className = 'roadmap-column';
        
        // [위치 보정용 클래스 추가]
        if (index === 0) column.classList.add('is-first-col');
        if (index === 1) column.classList.add('is-second-col');
        if (index === idolList.length - 1) column.classList.add('is-last-col');
        if (index === idolList.length - 2) column.classList.add('is-second-last-col');
        
        // 아이돌 고유 컬러 가져오기 (없으면 기본 회색)
        const idolColor = idolColors[idolName] || '#f1f3f5';
        column.style.setProperty('--idol-theme-color', idolColor);
        
        const header = document.createElement('div');
        header.className = 'roadmap-column-header';
        const iconName = idolName === 'tsubame' ? 'tsubame' : idolName;

        const idolPSSRs = roadmapData.filter(p => p.id.startsWith(`ssr${idolName}_`));
        
        // 마지막 PSSR로부터 경과일 계산 (복구)
        let daysText = "";
        if (idolPSSRs.length > 0) {
            const latestCard = [...idolPSSRs].sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))[0];
            const lastDate = new Date(latestCard.releasedAt);
            lastDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffMs = today - lastDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            daysText = diffDays >= 0 ? `D+${diffDays}` : `D${diffDays}`;
        }

        const idolLocalName = idolNameMap[idolName] ? (state.currentLang === 'ja' ? idolNameMap[idolName].ja : idolNameMap[idolName].ko) : idolName;

        header.innerHTML = `
            <img src="icons/idolicons/${iconName}_c.png" class="column-idol-icon" title="${idolLocalName}" loading="eager" onload="this.classList.add('loaded')">
            ${daysText ? `<div class="idol-header-tooltip">${daysText}</div>` : ''}
        `;
        column.appendChild(header);
        
        // 캐릭터의 첫 번째(가장 오래된) PSSR 위치계산하여 선 시작점 설정
        let minBottom = GRAPH_HEIGHT;
        if (idolPSSRs.length > 0) {
            idolPSSRs.forEach(card => {
                const cardDate = new Date(card.releasedAt);
                cardDate.setHours(0, 0, 0, 0);
                const ratio = (cardDate.getTime() - start.getTime()) / rangeMs;
                const bottomOffset = ratio * GRAPH_HEIGHT;
                if (bottomOffset < minBottom) minBottom = bottomOffset;
            });
            column.style.setProperty('--line-start', `${minBottom}px`);
        } else {
            column.style.setProperty('--line-start', '100%'); 
        }
        
        idolPSSRs.forEach(card => {
            const cardDate = new Date(card.releasedAt);
            cardDate.setHours(0, 0, 0, 0); // 시간 정규화 필수
            
            const ratio = (cardDate.getTime() - start.getTime()) / rangeMs;
            const bottomOffset = ratio * GRAPH_HEIGHT;
            
            const node = document.createElement('div');
            node.className = 'roadmap-node';
            node.style.bottom = `${bottomOffset}px`;
            
            const displayName = (state.currentLang === 'ja' && card.name_ja) ? card.name_ja : card.name;
            node.innerHTML = `
                <div class="roadmap-node-inner">
                    <img src="idols/${card.id}1.webp" class="roadmap-node-img" alt="${card.name}" loading="eager" onload="this.classList.add('loaded')">
                </div>
                <div class="roadmap-tooltip">
                    <img src="idols/${card.id}1.webp" class="tooltip-card-img" decoding="async">
                    <div class="tooltip-text">
                        <strong>${displayName}</strong>
                        <span>${card.releasedAt}</span>
                    </div>
                </div>
            `;

            column.appendChild(node);
        });

        graphWrapper.appendChild(column);
    });

    listContainer.appendChild(graphWrapper);

}
