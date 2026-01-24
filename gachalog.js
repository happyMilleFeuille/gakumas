import { state } from './state.js';
import { currencyData } from './currency.js';

export function openGachaLogModal() {
    const modal = document.getElementById('gacha-log-modal');
    const statsArea = document.getElementById('gacha-log-stats');
    const list = document.getElementById('gacha-log-list');
    if (!modal || !list || !statsArea) return;

    list.innerHTML = '';
    statsArea.innerHTML = '';
    const currentLog = state.gachaLog[state.gachaType] || [];

    if (currentLog.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem; width: 100%; color: #888;">기록이 없습니다.</p>';
        modal.classList.remove('hidden');
        return;
    }

    const total = currentLog.length;
    const stats = {
        total: { SSR: 0, SR: 0, R: 0 },
        produce: { SSR: 0, SR: 0, R: 0 },
        support: { SSR: 0, SR: 0, R: 0 }
    };
    const grouped = new Map();

    // 통계 및 그룹화 계산
    currentLog.forEach(item => {
        const rarity = item.displayRarity;
        stats.total[rarity] = (stats.total[rarity] || 0) + 1;
        
        if (item.type === 'produce') stats.produce[rarity] = (stats.produce[rarity] || 0) + 1;
        else stats.support[rarity] = (stats.support[rarity] || 0) + 1;

        const groupKey = `${item.type}_${item.id}`;
        if (grouped.has(groupKey)) {
            grouped.get(groupKey).count++;
        } else {
            grouped.set(groupKey, { ...item, count: 1 });
        }
    });

    // 가장 많이 나온 아이돌 캐릭터 찾기 (등급별 우선순위: SSR > SR > R)
    const charData = new Map();
    currentLog.filter(item => item.type === 'produce').forEach(item => {
        const charId = item.id.split('_')[0];
        if (!charData.has(charId)) {
            charData.set(charId, { 
                charId: charId, // 캐릭터 식별자 저장 (아이콘용)
                id: item.id, 
                name: item.name, 
                counts: { SSR: 0, SR: 0, R: 0 },
                repId: item.id 
            });
        }
        const data = charData.get(charId);
        const rarity = item.displayRarity; // 'SSR', 'SR', 'R'
        data.counts[rarity]++;
        
        // 대표 이미지 결정 (SSR이 있으면 무조건 SSR 이미지 사용)
        if (rarity === 'SSR') data.repId = item.id;
    });
    
    const sortedChars = Array.from(charData.values()).sort((a, b) => {
        if (b.counts.SSR !== a.counts.SSR) return b.counts.SSR - a.counts.SSR;
        if (b.counts.SR !== a.counts.SR) return b.counts.SR - a.counts.SR;
        return b.counts.R - a.counts.R;
    });
    
    const topChar = sortedChars[0] || null;

    renderStats(statsArea, total, stats, topChar);

    // 정렬: 등급(SSR>SR>R) -> 타입(P>S) -> 횟수(내림차순)
    const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
    const sorted = Array.from(grouped.values()).sort((a, b) => 
        (rarityOrder[b.displayRarity] - rarityOrder[a.displayRarity]) || 
        (a.type === 'produce' ? -1 : 1) || 
        (b.count - a.count)
    );

    const fragment = document.createDocumentFragment();
    sorted.forEach(item => {
        fragment.appendChild(createLogItem(item));
    });
    list.appendChild(fragment);

    modal.classList.remove('hidden');
    // 모달 상태 히스토리 추가 (뒤로가기 시 닫힘 처리용)
    history.pushState({ modalOpen: 'gachaLog' }, "");
}

function renderStats(container, total, stats, topChar) {
    const isJa = state.currentLang === 'ja';
    const totalJewels = total * 250;
    const yenPerJewel = 1.1951;
    let priceDisplay = isJa ? 
        `${totalJewels.toLocaleString()} (￥${Math.round(totalJewels * yenPerJewel).toLocaleString()})` : 
        `${totalJewels.toLocaleString()} (₩${Math.round(totalJewels * yenPerJewel * currencyData.rate).toLocaleString()})`;

    const getPerc = (c) => ((c / total) * 100).toFixed(1) + '%';
    const labels = isJa ? 
        { total: '総ガチャ回数', all: ['全体 SSR', '全体 SR', '全体 R'], p: 'プロデュースアイドル詳細', s: 'サポート카드 상세' } : 
        { total: '총 뽑기 횟수', all: ['전체 SSR', '전체 SR', '전체 R'], p: '프로듀스 아이돌 상세', s: '서포트 카드 상세' };

    const charThumb = topChar ? `<img src="icons/idolicons/${topChar.charId}.png" class="stat-header-thumb" title="${topChar.name}">` : '';

    container.innerHTML = `
        <div class="stat-row-top">
            <div class="stat-item full-width">
                <span class="stat-label">${labels.total} <span class="stat-value" style="margin-left: 5px;">${total}</span></span>
                <span class="stat-value" style="color: #777; font-weight: normal; font-size: 0.85rem;">${priceDisplay}</span>
            </div>
            <div class="stat-row-bottom" style="border-top: 1px dashed #ccc; padding-top: 8px;">
                <div class="stat-item">
                    <span class="stat-label">${labels.all[0]} <small>(${getPerc(stats.total.SSR)})</small></span>
                    <span class="stat-value">${stats.total.SSR}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${labels.all[1]} <small>(${getPerc(stats.total.SR)})</small></span>
                    <span class="stat-value">${stats.total.SR}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${labels.all[2]} <small>(${getPerc(stats.total.R)})</small></span>
                    <span class="stat-value">${stats.total.R}</span>
                </div>
            </div>
        </div>
        
        <div class="stat-category-header" data-target="produce">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${labels.p}</span>
                ${charThumb}
            </div>
            <span class="toggle-icon">▼</span>
        </div>
        <div id="stat-produce-content" class="stat-row-bottom hidden">
            <div class="stat-item"><span class="stat-label">PSSR <small>(${getPerc(stats.produce.SSR)})</small></span><span class="stat-value">${stats.produce.SSR}</span></div>
            <div class="stat-item"><span class="stat-label">PSR <small>(${getPerc(stats.produce.SR)})</small></span><span class="stat-value">${stats.produce.SR}</span></div>
            <div class="stat-item"><span class="stat-label">PR <small>(${getPerc(stats.produce.R)})</small></span><span class="stat-value">${stats.produce.R}</span></div>
        </div>

        <div class="stat-category-header" data-target="support"><span>${labels.s}</span><span class="toggle-icon">▼</span></div>
        <div id="stat-support-content" class="stat-row-bottom hidden">
            <div class="stat-item"><span class="stat-label">SSR <small>(${getPerc(stats.support.SSR)})</small></span><span class="stat-value">${stats.support.SSR}</span></div>
            <div class="stat-item"><span class="stat-label">SR <small>(${getPerc(stats.support.SR)})</small></span><span class="stat-value">${stats.support.SR}</span></div>
            <div class="stat-item"><span class="stat-label">R <small>(${getPerc(stats.support.R)})</small></span><span class="stat-value">${stats.support.R}</span></div>
        </div>
    `;

    container.querySelectorAll('.stat-category-header').forEach(header => {
        header.onclick = () => {
            const content = document.getElementById(`stat-${header.dataset.target}-content`);
            if (content) {
                header.classList.toggle('active');
                content.classList.toggle('hidden');
            }
        };
    });
}

function createLogItem(item) {
    const el = document.createElement('div');
    const isProduce = item.type === 'produce';
    
    // 클래스 추가
    el.classList.add('log-item');
    el.classList.add(isProduce ? 'type-produce' : 'type-support');
    el.classList.add(`rarity-${item.displayRarity.toLowerCase()}`);

    // 이미지 생성
    const img = document.createElement('img');
    img.className = 'log-card-img'; // 클래스 추가
    if (isProduce) {
        img.src = `idols/${item.id}1.webp`;
        img.loading = 'lazy';
    } else {
        img.src = item.id.includes('dummy') ? 'icons/idol.png' : `images/support/${item.id}.webp`;
        img.loading = 'lazy';
    }
    el.appendChild(img);

    // 등급 배지 (이미지)
    const rarityBadge = document.createElement('img');
    const rKey = item.displayRarity.toLowerCase();
    rarityBadge.className = 'log-badge-rarity';
    rarityBadge.src = `icons/${rKey}.png`;
    el.appendChild(rarityBadge);

    // 개수 카운트 (2개 이상일 때만)
    if (item.count > 1) {
        const countBadge = document.createElement('div');
        countBadge.className = 'log-badge-count';
        countBadge.textContent = `x${item.count}`;
        el.appendChild(countBadge);
    }

    // 이름 오버레이
    const nameOverlay = document.createElement('div');
    nameOverlay.className = 'log-item-name-overlay';
    const nameText = (state.currentLang === 'ja' && item.name_ja) ? item.name_ja : item.name;
    nameOverlay.textContent = nameText;
    nameOverlay.title = nameText; // 마우스 오버 시 전체 이름 표시
    el.appendChild(nameOverlay);

    return el;
}
