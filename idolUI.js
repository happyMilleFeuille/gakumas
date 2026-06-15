import { state, setFavoriteIdol, idolColors, setPSSRIndex } from './state.js';
import { translate, updatePageTranslations } from './utils.js';
import { produceList } from './producedata.js';
import { videoList } from './videodata.js';
import { idolList } from './roadmap.js'; 

const contentArea = document.getElementById('content-area');
const t = (key, params = {}, fallback = '') => translate(key, params, fallback);

// ui.js에 남아있는 공통 함수들을 동적으로 가져오거나 나중에 utils로 분리할 예정
// 현재는 ui.js에서 export된 함수를 사용해야 하므로, 순환 참조 방지를 위해 필요시 import() 사용
async function getCommonUI() {
    return await import('./ui.js');
}

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (useJaNames() && card.name_ja) return card.name_ja;
    return card.name;
};

let activeTab = 'p-idol';
const videoExistenceCache = new Map();
let currentSelectedIdol = 'all';
let activePlanFilter = 'all';
let activeSubFilter = 'all';
let activeRarityFilter = 'all';
const activeSourceFilters = new Set();
let activeSortOrder = 'desc';

function updateActiveFilterColorCSS() {
    const getActiveFilterColor = () => {
        if (currentSelectedIdol && currentSelectedIdol !== 'all') {
            return idolColors[currentSelectedIdol] || '#ff4d8d';
        }
        if (state.favoriteIdol && state.favoriteIdol !== 'all') {
            return idolColors[state.favoriteIdol] || '#ff4d8d';
        }
        return '#ff4d8d';
    };
    const color = getActiveFilterColor();
    const pssrArea = document.querySelector('.pssr-container');
    if (pssrArea) {
        pssrArea.style.setProperty('--pssr-active-color', color);
    }
}

export function renderIdolList() {
    if (!contentArea) return;
    contentArea.innerHTML = '';

    currentSelectedIdol = state.favoriteIdol || 'all';
    activePlanFilter = 'all';
    activeSubFilter = 'all';
    activeRarityFilter = 'all';
    activeSourceFilters.clear();

    const gridTpl = document.getElementById('tpl-idol-grid');
    const itemTpl = document.getElementById('tpl-idol-item');
    const view = gridTpl.content.cloneNode(true);
    const grid = view.querySelector('.idol-grid');

    const videoArea = document.createElement('div');
    videoArea.className = 'idol-video-container-wrapper';
    videoArea.innerHTML = '<div class="idol-video-list"></div>';
    const videoListEl = videoArea.querySelector('.idol-video-list');

    const pssrArea = document.createElement('div');
    pssrArea.className = 'pssr-container';
    pssrArea.innerHTML = `
        <div class="pssr-filter-bar">
            <div class="pssr-filter-wrapper-outer">
                <div class="pssr-filter-wrapper">
                    <div class="pssr-source-filters">
                        <button class="pssr-filter-btn" data-source="normal">${t('filter_normal', {}, '통상')}</button>
                        <button class="pssr-filter-btn" data-source="limited">${t('filter_limited', {}, '한정')}</button>
                        <button class="pssr-filter-btn" data-source="limited_f">${t('filter_limited_f', {}, '페스')}</button>
                        <button class="pssr-filter-btn" data-source="limited_u">${t('filter_limited_u', {}, '유닛')}</button>
                        <button class="pssr-filter-btn" data-source="dist">${t('filter_dist', {}, '배포')}</button>
                    </div>
                    <div class="pssr-divider-v"></div>
                    <div class="pssr-rarity-filters">
                        <button class="pssr-filter-btn" data-rarity="PSSR"><img src="icons/ssr.png" alt="SSR"></button>
                    </div>
                    <div class="pssr-divider-v"></div>
                    <div class="pssr-plan-filters">
                        <button class="pssr-filter-btn" data-plan="sense"><img src="icons/sense.webp" alt="Sense"></button>
                        <button class="pssr-filter-btn" data-plan="logic"><img src="icons/logic.webp" alt="Logic"></button>
                        <button class="pssr-filter-btn" data-plan="anomaly"><img src="icons/anomaly.webp" alt="Anomaly"></button>
                    </div>
                    <div class="pssr-divider-v"></div>
                    <button id="pssr-btn-sort-order" class="pssr-filter-btn pssr-sort-order-btn-capsule">
                        <span id="pssr-sort-order-arrow">↓</span>
                        <img src="icons/list.svg" alt="Sort Order" class="sort-order-icon">
                    </button>
                </div>
                <div class="pssr-sub-filter-wrapper hidden">
                    <div class="pssr-sub-filters"></div>
                </div>
            </div>
        </div>
        <div class="pssr-grid"></div>
    `;
    const pssrGrid = pssrArea.querySelector('.pssr-grid');

    const sortOrderBtn = pssrArea.querySelector('#pssr-btn-sort-order');
    const sortOrderArrow = pssrArea.querySelector('#pssr-sort-order-arrow');
    
    if (sortOrderArrow) {
        sortOrderArrow.textContent = (activeSortOrder === 'asc') ? '↑' : '↓';
    }
    
    if (sortOrderBtn) {
        sortOrderBtn.addEventListener('click', () => {
            activeSortOrder = (activeSortOrder === 'asc') ? 'desc' : 'asc';
            if (sortOrderArrow) {
                sortOrderArrow.textContent = (activeSortOrder === 'asc') ? '↑' : '↓';
            }
            renderProduceCards(currentSelectedIdol, pssrGrid);
        });
    }

    // Rarity Filters click handler
    pssrArea.querySelectorAll('.pssr-rarity-filters .pssr-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isAlreadyActive = btn.classList.contains('active');

            pssrArea.querySelectorAll('.pssr-rarity-filters .pssr-filter-btn').forEach(b => b.classList.remove('active'));

            if (isAlreadyActive) {
                activeRarityFilter = 'all';
            } else {
                btn.classList.add('active');
                activeRarityFilter = btn.dataset.rarity;
            }
            renderProduceCards(currentSelectedIdol, pssrGrid);
        });
    });

    // Plan Filters click handler
    pssrArea.querySelectorAll('.pssr-plan-filters .pssr-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isAlreadyActive = btn.classList.contains('active');

            pssrArea.querySelectorAll('.pssr-plan-filters .pssr-filter-btn').forEach(b => b.classList.remove('active'));

            if (isAlreadyActive) {
                activePlanFilter = 'all';
            } else {
                btn.classList.add('active');
                activePlanFilter = btn.dataset.plan;
            }
            updateSubFiltersUI(pssrArea, pssrGrid);
            renderProduceCards(currentSelectedIdol, pssrGrid);
        });
    });

    // Source Filters click handler - Toggle-off multi-select
    pssrArea.querySelectorAll('.pssr-source-filters .pssr-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const source = btn.dataset.source;
            if (activeSourceFilters.has(source)) {
                activeSourceFilters.delete(source);
                btn.classList.remove('active');
            } else {
                activeSourceFilters.add(source);
                btn.classList.add('active');
            }
            renderProduceCards(currentSelectedIdol, pssrGrid);
        });
    });

    updateSubFiltersUI(pssrArea, pssrGrid);

    const preloadedIdols = new Set();
    function preloadIdolImages(idolName) {
        if (preloadedIdols.has(idolName)) return;
        preloadedIdols.add(idolName);

        const cards = produceList.filter(p => {
            const nameMatch = p.id.startsWith(`ssr${idolName}_`) ||
                p.id.startsWith(`sr${idolName}_`) ||
                p.id.startsWith(`r${idolName}_`);
            return nameMatch &&
                (p.rarity === 'PSSR' || p.rarity === 'PSR' || p.rarity === 'PR') &&
                p.another !== true;
        });

        const imageFolder = 'idols';

        cards.forEach(card => {
            const imageList = [
                `${imageFolder}/${card.id}1.webp`,
                `${imageFolder}/${card.id}2.webp`
            ];
            const anothers = produceList.filter(p => p.another === true && p.id.startsWith(card.id));
            anothers.forEach(a => imageList.push(`${imageFolder}/${a.id}1.webp`));

            let currentIndex = state.pssrIndex[card.id] || 0;
            if (currentIndex >= imageList.length) currentIndex = 0;

            const preImg = new Image();
            preImg.src = imageList[currentIndex];
        });
    }

    idolList.forEach(name => {
        const item = itemTpl.content.cloneNode(true);
        const img = item.querySelector('.idol-icon');
        const idolItem = item.querySelector('.idol-item');
        const favBtn = item.querySelector('.fav-star-btn');

        img.src = `icons/idolicons/${name}.png`;
        img.alt = name;
        favBtn.style.setProperty('--fav-color', idolColors[name] || '#fbc02d');

        if (state.favoriteIdol === name) {
            favBtn.classList.add('active');
        }

        idolItem.addEventListener('mouseenter', () => preloadIdolImages(name));
        idolItem.addEventListener('touchstart', () => preloadIdolImages(name), { passive: true });

        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setFavoriteIdol(name);

            document.querySelectorAll('.fav-star-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            if (state.favoriteIdol === name) {
                favBtn.classList.add('active');
            }

            getCommonUI().then(m => m.updateGlobalBackgroundColor());
            updateActiveFilterColorCSS();
        });

        img.addEventListener('click', (e) => {
            const isAlreadySelected = img.classList.contains('selected');

            document.querySelectorAll('.idol-icon').forEach(icon => {
                icon.classList.remove('selected');
                icon.style.borderColor = '';
                icon.style.boxShadow = '';
            });

            if (isAlreadySelected) {
                currentSelectedIdol = 'all';
                videoArea.style.display = 'none';
                updateActiveFilterColorCSS();
                renderProduceCards('all', pssrGrid);
                return;
            }

            currentSelectedIdol = name;
            img.classList.add('selected');
            const color = (idolColors[name] || "#ff4d8d");
            img.style.borderColor = color;
            img.style.boxShadow = `0 0 15px ${color}66`;

            const clickedItem = e.currentTarget.parentElement.parentElement;
            const gridContainer = clickedItem.parentElement;
            if (gridContainer) {
                const containerWidth = gridContainer.offsetWidth;
                const itemOffsetLeft = clickedItem.offsetLeft;
                const itemWidth = clickedItem.offsetWidth;
                const scrollPos = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);
                gridContainer.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }

            videoArea.style.display = 'block';
            videoArea.style.setProperty('--idol-border-color', `${color}66`);
            renderIdolVideos(name, videoListEl);
            updateActiveFilterColorCSS();
            renderProduceCards(name, pssrGrid);
        });
        grid.appendChild(item);
    });

    contentArea.appendChild(view);
    contentArea.appendChild(videoArea);
    contentArea.appendChild(pssrArea);

    updateActiveFilterColorCSS();

    let initialSelected = false;
    if (state.favoriteIdol) {
        const favIcon = contentArea.querySelector(`.idol-icon[alt="${state.favoriteIdol}"]`);
        if (favIcon) {
            initialSelected = true;
            currentSelectedIdol = state.favoriteIdol;
            favIcon.classList.add('selected');
            const color = (idolColors[state.favoriteIdol] || "#ff4d8d");
            favIcon.style.borderColor = color;
            favIcon.style.boxShadow = `0 0 15px ${color}66`;
            videoArea.style.setProperty('--idol-border-color', `${color}66`);

            const clickedItem = favIcon.parentElement.parentElement;
            const gridContainer = clickedItem.parentElement;
            if (gridContainer) {
                const scrollPos = clickedItem.offsetLeft - (gridContainer.offsetWidth / 2) + (clickedItem.offsetWidth / 2);
                gridContainer.scrollTo({ left: scrollPos, behavior: 'auto' });
            }

            videoArea.style.display = 'block';
            renderIdolVideos(state.favoriteIdol, videoListEl);
            renderProduceCards(state.favoriteIdol, pssrGrid);
        }
    }

    if (!initialSelected) {
        currentSelectedIdol = 'all';
        videoArea.style.display = 'none';
        renderProduceCards('all', pssrGrid);
    }
}

export function renderIdolVideos(idolName, container) {
    if (!container) return;
    container.innerHTML = '';

    const filteredVideos = videoList[idolName] || [];

    if (filteredVideos.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }

    container.parentElement.style.display = 'block';

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const dateA = a.date || '0000.00.00';
        const dateB = b.date || '0000.00.00';
        return dateB.localeCompare(dateA);
    });

    const itemTpl = document.getElementById('tpl-idol-video-item');
    sortedVideos.forEach(video => {
        const item = itemTpl.content.cloneNode(true);
        const thumb = item.querySelector('.video-thumb');
        const title = item.querySelector('.video-title');
        const videoItem = item.querySelector('.idol-video-item');

        const personalColor = idolColors[idolName] || "#ffffff";
        const mixedBg = `linear-gradient(${personalColor}26, ${personalColor}26)`;
        videoItem.style.backgroundColor = "#ffffff";
        videoItem.style.backgroundImage = mixedBg;

        let videoId = '';
        if (video.url.includes('youtu.be/')) {
            videoId = video.url.split('youtu.be/')[1].split('?')[0];
        } else if (video.url.includes('watch?v=')) {
            videoId = video.url.split('watch?v=')[1].split('&')[0];
        }

        thumb.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        let displayTitle = video.title;
        if (state.currentLang === 'ko' && video.title_ko) {
            displayTitle = video.title_ko;
        } else if (state.currentLang === 'en' && video.title_en) {
            displayTitle = video.title_en;
        }
        title.textContent = displayTitle;

        const titleLength = displayTitle.length;
        title.classList.remove('len-long', 'len-vlong', 'len-extreme', 'len-ultra', 'lang-ja');
        if (state.currentLang === 'ja') title.classList.add('lang-ja');

        if (titleLength >= 25) title.classList.add('len-ultra');
        else if (titleLength >= 13) title.classList.add('len-extreme');
        else if (titleLength >= 10) title.classList.add('len-vlong');
        else if (titleLength >= 7) title.classList.add('len-long');

        const dateEl = item.querySelector('.video-date');
        if (dateEl) {
            dateEl.textContent = video.date || '';
        }

        videoItem.addEventListener('click', () => {
            const color = idolColors[idolName] || '#ff4d8d';
            getCommonUI().then(m => m.openVideoModal(`https://www.youtube.com/embed/${videoId}?autoplay=1`, color));
        });

        container.appendChild(item);
    });
}

function getIdolNameFromCardId(cardId) {
    const match = cardId.match(/^(?:ssr|sr|r)([a-z]+)_/);
    return match ? match[1] : '';
}

function updateSubFiltersUI(pssrArea, pssrGrid) {
    const subWrapper = pssrArea.querySelector('.pssr-sub-filter-wrapper');
    const subContainer = pssrArea.querySelector('.pssr-sub-filters');
    if (!subWrapper || !subContainer) return;

    subContainer.innerHTML = '';
    activeSubFilter = 'all';

    if (activePlanFilter === 'all') {
        subWrapper.classList.add('hidden');
        return;
    }

    subWrapper.classList.remove('hidden');

    let subPlans = [];
    if (activePlanFilter === 'sense') {
        subPlans = [
            { key: 'goodcondition', icon: 'goodcondition.webp', label: '호조' },
            { key: 'concentration', icon: 'concentration.webp', label: '집중' }
        ];
    } else if (activePlanFilter === 'logic') {
        subPlans = [
            { key: 'goodimpression', icon: 'goodimpression.webp', label: '호인상' },
            { key: 'motivation', icon: 'motivation.webp', label: '의욕' }
        ];
    } else if (activePlanFilter === 'anomaly') {
        subPlans = [
            { key: 'fullpower', icon: 'fullpower.webp', label: '힘축적' },
            { key: 'enthusiasm', icon: 'enthusiasm.webp', label: '열의' }
        ];
    }

    subPlans.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'pssr-filter-btn';
        btn.dataset.sub = sub.key;
        btn.innerHTML = `<img src="icons/${sub.icon}" alt="${sub.label}">`;
        btn.addEventListener('click', () => {
            const isAlreadyActive = btn.classList.contains('active');
            subContainer.querySelectorAll('.pssr-filter-btn').forEach(b => b.classList.remove('active'));

            if (isAlreadyActive) {
                activeSubFilter = 'all';
            } else {
                btn.classList.add('active');
                activeSubFilter = sub.key;
            }
            renderProduceCards(currentSelectedIdol, pssrGrid);
        });
        subContainer.appendChild(btn);
    });
}

export function renderProduceCards(idolName, container) {
    container.innerHTML = '';
    const itemTpl = document.getElementById('tpl-pssr-item');
    if (!itemTpl) return;

    const isAll = (idolName === 'all' || !idolName);
    const produceCards = produceList.filter(p => {
        const nameMatch = isAll ||
            p.id.startsWith(`ssr${idolName}_`) ||
            p.id.startsWith(`sr${idolName}_`) ||
            p.id.startsWith(`r${idolName}_`);

        const planMatch = activePlanFilter === 'all' || p.plan === activePlanFilter;

        let cardOsusume = p.osusume;
        if (p.id === 'ssrmisuzu_1st' || p.id === 'rmisuzu_1r') {
            cardOsusume = 'fullpower';
        } else if (p.id === 'srmisuzu_1sr') {
            cardOsusume = 'enthusiasm';
        }
        
        const subMatch = activeSubFilter === 'all' || cardOsusume === activeSubFilter;
        const rarityMatch = activeRarityFilter === 'all' || p.rarity === activeRarityFilter;
        const sourceMatch = activeSourceFilters.size === 0 || activeSourceFilters.has(p.source);

        return nameMatch && planMatch && subMatch && rarityMatch && sourceMatch &&
            (p.rarity === 'PSSR' || p.rarity === 'PSR' || p.rarity === 'PR') &&
            p.another !== true;
    });

    const isAsc = (activeSortOrder === 'asc');

    if (isAll) {
        produceCards.sort((a, b) => {
            const dateA = a.releasedAt || "";
            const dateB = b.releasedAt || "";
            if (dateA !== dateB) {
                return isAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
            }
            const rarityOrder = { 'PSSR': 3, 'PSR': 2, 'PR': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;
            return isAsc ? (rA - rB) : (rB - rA);
        });
    } else {
        produceCards.sort((a, b) => {
            const rarityOrder = { 'PSSR': 3, 'PSR': 2, 'PR': 1 };
            const rA = rarityOrder[a.rarity] || 0;
            const rB = rarityOrder[b.rarity] || 0;

            if (rA !== rB) {
                return isAsc ? (rA - rB) : (rB - rA);
            }

            const dateA = a.releasedAt || "";
            const dateB = b.releasedAt || "";
            return isAsc ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
        });
    }

    if (produceCards.length === 0) {
        container.innerHTML = '';
        return;
    }

    produceCards.forEach((card, index) => {
        const item = itemTpl.content.cloneNode(true);
        const cardEl = item.querySelector('.pssr-card');
        const img = item.querySelector('.pssr-img');
        const imgWrapper = item.querySelector('.pssr-img-wrapper');
        const infoBox = item.querySelector('.pssr-info');
        const name = item.querySelector('.pssr-name');
        
        const cardIdolName = isAll ? getIdolNameFromCardId(card.id) : idolName;
        const personalColor = idolColors[cardIdolName] || "#ffffff";

        const mixedBg = `linear-gradient(${personalColor}26, ${personalColor}26)`;
        cardEl.style.backgroundColor = "#ffffff";
        cardEl.style.backgroundImage = mixedBg;

        infoBox.style.backgroundColor = "transparent";
        infoBox.style.backgroundImage = "none";

        name.style.color = '#333';
        let initWrapperBg = personalColor + "11";
        if (cardIdolName === 'lilja') initWrapperBg = '#EAFDFF11';
        else if (cardIdolName === 'sumika') initWrapperBg = '#7CFC0011';
        imgWrapper.style.backgroundColor = initWrapperBg;

        const planIcon = item.querySelector('.pssr-plan-icon');
        if (card.plan) {
            planIcon.src = `icons/${card.plan}.webp`;
        } else {
            planIcon.style.display = 'none';
        }

        if (card.osusume) {
            const osusumeIcon = document.createElement('img');
            osusumeIcon.className = 'pssr-osusume-icon';
            osusumeIcon.src = `icons/${card.osusume}.webp`;
            planIcon.parentElement.insertBefore(osusumeIcon, planIcon);
        }

        const imageFolder = 'idols';
        const rarityIcon = item.querySelector('.pssr-rarity-icon');

        const imageList = [
            `${imageFolder}/${card.id}1.webp`,
            `${imageFolder}/${card.id}2.webp`
        ];
        const videoIdList = [card.id, card.id];

        const anothers = produceList.filter(p => p.another === true && p.id.startsWith(card.id));
        anothers.forEach(a => {
            imageList.push(`${imageFolder}/${a.id}1.webp`);
            videoIdList.push(a.id);
        });

        let currentIndex = state.pssrIndex[card.id] || 0;
        if (currentIndex >= imageList.length) currentIndex = 0;

        img.src = imageList[currentIndex];

        cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (img.classList.contains('slide-out') || img.classList.contains('slide-prepare')) return;

            let animColor = personalColor;
            let animColor11 = personalColor + "11";
            if (cardIdolName === 'lilja') {
                animColor = '#EAFDFF';
                animColor11 = '#EAFDFF11';
            } else if (cardIdolName === 'sumika') {
                animColor = '#7CFC00';
                animColor11 = '#7CFC0011';
            }

            img.classList.add('slide-out');
            imgWrapper.style.backgroundColor = animColor;

            const nextIndex = (currentIndex + 1) % imageList.length;
            const nextSrc = imageList[nextIndex];

            const tempImg = new Image();
            tempImg.onload = () => {
                setTimeout(() => {
                    currentIndex = nextIndex;
                    setPSSRIndex(card.id, currentIndex);
                    if (typeof updateGachaVideo === 'function') updateGachaVideo(currentIndex);

                    img.style.transition = 'none';
                    img.classList.remove('slide-out');
                    img.classList.add('slide-prepare');
                    img.src = nextSrc;

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            img.style.transition = '';
                            img.classList.remove('slide-prepare');
                            setTimeout(() => {
                                imgWrapper.style.backgroundColor = animColor11;
                            }, 200);
                        });
                    });
                }, 100);
            };
            tempImg.onerror = () => {
                img.classList.remove('slide-out');
                imgWrapper.style.backgroundColor = animColor11;
            };
            tempImg.src = nextSrc;
        });

        let retryCount = 0;
        img.onerror = () => {
            if (retryCount < imageList.length) {
                retryCount++;
                currentIndex = (currentIndex + 1) % imageList.length;
                img.src = imageList[currentIndex];
            }
        };

        const rarityKey = card.rarity.toLowerCase().replace('p', '');
        rarityIcon.src = `icons/${rarityKey}.png`;

        const sourceBadge = item.querySelector('.pssr-source-badge');
        if (sourceBadge) {
            const sourceMap = {
                'limited': t('filter_limited'),
                'limited_f': t('filter_limited_f'),
                'limited_u': t('filter_limited_u'),
                'normal': t('filter_normal'),
                'dist': t('filter_dist')
            };
            const cSource = card.source || 'normal';
            if (sourceMap[cSource]) {
                sourceBadge.textContent = sourceMap[cSource];
                sourceBadge.style.display = 'inline-block';
            } else {
                sourceBadge.style.display = 'none';
            }
        }

        const displayName = getLocalizedCardName(card);
        name.textContent = displayName;
        name.classList.toggle('lang-ja', useJaNames());

        if (useJaNames()) {
            name.style.wordBreak = 'normal';
            name.style.overflowWrap = 'anywhere';
        } else {
            name.style.wordBreak = 'keep-all';
            name.style.overflowWrap = 'normal';
        }

        const youtubeLink = item.querySelector('.pssr-youtube-link');
        if (youtubeLink) {
            if (card.youtube_url) {
                youtubeLink.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const finalUrl = card.youtube_url;
                    let embedUrl = finalUrl;
                    if (finalUrl.includes('watch?v=')) {
                        const videoId = finalUrl.split('watch?v=')[1].split('&')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    } else if (finalUrl.includes('youtu.be/')) {
                        const videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                    }
                    const color = idolColors[cardIdolName] || '#ff4d8d';
                    getCommonUI().then(m => m.openVideoModal(embedUrl, color));
                };
                youtubeLink.classList.remove('hidden');
            } else {
                youtubeLink.classList.add('hidden');
            }
        }

        const gachaVideoLink = item.querySelector('.pssr-gacha-video-link');
        let currentVideoUrl = '';

        function updateGachaVideo(idx) {
            if (!gachaVideoLink || card.rarity !== 'PSSR') return;
            const vidId = videoIdList[idx];
            currentVideoUrl = `gasya/pssr/${vidId}.mp4`;
            
            if (videoExistenceCache.has(currentVideoUrl)) {
                if (videoExistenceCache.get(currentVideoUrl)) {
                    gachaVideoLink.classList.remove('hidden');
                } else {
                    gachaVideoLink.classList.add('hidden');
                }
            } else {
                gachaVideoLink.classList.add('hidden');
                const checkUrl = currentVideoUrl;
                fetch(checkUrl, { method: 'HEAD' })
                    .then(res => {
                        videoExistenceCache.set(checkUrl, res.ok);
                        if (currentVideoUrl === checkUrl) {
                            if (res.ok) gachaVideoLink.classList.remove('hidden');
                            else gachaVideoLink.classList.add('hidden');
                        }
                    })
                    .catch(() => {
                        videoExistenceCache.set(checkUrl, false);
                        if (currentVideoUrl === checkUrl) {
                            gachaVideoLink.classList.add('hidden');
                        }
                    });
            }
        }

        if (gachaVideoLink) {
            if (card.rarity === 'PSSR') {
                // Precheck all video resources for this card to avoid lag on click
                videoIdList.forEach(vidId => {
                    const url = `gasya/pssr/${vidId}.mp4`;
                    if (!videoExistenceCache.has(url)) {
                        fetch(url, { method: 'HEAD' })
                            .then(res => {
                                videoExistenceCache.set(url, res.ok);
                                if (url === currentVideoUrl) {
                                    if (res.ok) gachaVideoLink.classList.remove('hidden');
                                    else gachaVideoLink.classList.add('hidden');
                                }
                            })
                            .catch(() => {
                                videoExistenceCache.set(url, false);
                                if (url === currentVideoUrl) {
                                    gachaVideoLink.classList.add('hidden');
                                }
                            });
                    }
                });

                updateGachaVideo(currentIndex);

                gachaVideoLink.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!currentVideoUrl) return;
                    const color = idolColors[cardIdolName] || '#ff4d8d';
                    getCommonUI().then(m => m.openVideoModal(currentVideoUrl, color, true));
                };
                gachaVideoLink.style.setProperty('--button-color', idolColors[cardIdolName] || '#ff4d8d');
            } else {
                gachaVideoLink.classList.add('hidden');
            }
        }

        // 모바일: 재생 버튼들을 rarity-wrap 오른쪽으로 이동
        if (window.innerWidth <= 768) {
            const rarityWrap = item.querySelector('.pssr-rarity-wrap');
            if (rarityWrap) {
                rarityWrap.style.width = '100%';
                rarityWrap.style.alignSelf = 'stretch';
                const ytLink = item.querySelector('.pssr-youtube-link');
                const gachaLink = item.querySelector('.pssr-gacha-video-link');
                
                // 버튼들을 오른쪽으로 밀기 위한 빈 공간 생성
                const spacer = document.createElement('div');
                spacer.style.flex = '1';
                rarityWrap.appendChild(spacer);
                
                if (gachaLink) rarityWrap.appendChild(gachaLink);
                if (ytLink) rarityWrap.appendChild(ytLink);
            }

            // 플랜/오스스메 아이콘을 이미지 영역으로 이동
            const imgWrapper = item.querySelector('.pssr-img-wrapper');
            if (imgWrapper) {
                const planIcon = item.querySelector('.pssr-plan-icon');
                const osusumeIcon = item.querySelector('.pssr-osusume-icon');
                if (planIcon) imgWrapper.appendChild(planIcon);
                if (osusumeIcon) imgWrapper.appendChild(osusumeIcon);
            }
        }

        container.appendChild(item);
    });
}
