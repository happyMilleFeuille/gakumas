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

export function renderIdolList() {
    if (!contentArea) return;
    contentArea.innerHTML = '';

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
    pssrArea.innerHTML = '<div class="pssr-grid"></div>';
    const pssrGrid = pssrArea.querySelector('.pssr-grid');

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
        });

        img.addEventListener('click', (e) => {
            document.querySelectorAll('.idol-icon').forEach(icon => {
                icon.classList.remove('selected');
                icon.style.borderColor = '';
                icon.style.boxShadow = '';
            });

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

            videoArea.style.setProperty('--idol-border-color', `${color}66`);
            renderIdolVideos(name, videoListEl);
            renderProduceCards(name, pssrGrid);
        });
        grid.appendChild(item);
    });

    contentArea.appendChild(view);
    contentArea.appendChild(videoArea);
    contentArea.appendChild(pssrArea);

    if (state.favoriteIdol) {
        const favIcon = contentArea.querySelector(`.idol-icon[alt="${state.favoriteIdol}"]`);
        if (favIcon) {
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

            renderIdolVideos(state.favoriteIdol, videoListEl);
            renderProduceCards(state.favoriteIdol, pssrGrid);
        }
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

export function renderProduceCards(idolName, container) {
    container.innerHTML = '';
    const itemTpl = document.getElementById('tpl-pssr-item');
    if (!itemTpl) return;

    const produceCards = produceList.filter(p => {
        const nameMatch = p.id.startsWith(`ssr${idolName}_`) ||
            p.id.startsWith(`sr${idolName}_`) ||
            p.id.startsWith(`r${idolName}_`);

        return nameMatch &&
            (p.rarity === 'PSSR' || p.rarity === 'PSR' || p.rarity === 'PR') &&
            p.another !== true;
    });

    produceCards.sort((a, b) => {
        const rarityOrder = { 'PSSR': 3, 'PSR': 2, 'PR': 1 };
        const rA = rarityOrder[a.rarity] || 0;
        const rB = rarityOrder[b.rarity] || 0;

        if (rA !== rB) {
            return rB - rA;
        }

        const dateA = a.releasedAt || "";
        const dateB = b.releasedAt || "";
        return dateB.localeCompare(dateA);
    });

    if (produceCards.length === 0) {
        container.innerHTML = `<p style="color:#999; padding:2rem; width:100%; text-align:center;">${t('ui_no_cards_found_for', { idolName }, `No cards found for ${idolName}.`)}</p>`;
        return;
    }

    produceCards.forEach((card, index) => {
        const item = itemTpl.content.cloneNode(true);
        const cardEl = item.querySelector('.pssr-card');
        const img = item.querySelector('.pssr-img');
        const imgWrapper = item.querySelector('.pssr-img-wrapper');
        const infoBox = item.querySelector('.pssr-info');
        const name = item.querySelector('.pssr-name');
        const personalColor = idolColors[idolName] || "#ffffff";

        const mixedBg = `linear-gradient(${personalColor}26, ${personalColor}26)`;
        cardEl.style.backgroundColor = "#ffffff";
        cardEl.style.backgroundImage = mixedBg;

        infoBox.style.backgroundColor = "transparent";
        infoBox.style.backgroundImage = "none";

        name.style.color = '#333';
        let initWrapperBg = personalColor + "11";
        if (idolName === 'lilja') initWrapperBg = '#EAFDFF11';
        else if (idolName === 'sumika') initWrapperBg = '#7CFC0011';
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
            if (idolName === 'lilja') {
                animColor = '#EAFDFF';
                animColor11 = '#EAFDFF11';
            } else if (idolName === 'sumika') {
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
                    const color = idolColors[idolName] || '#ff4d8d';
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
                    const color = idolColors[idolName] || '#ff4d8d';
                    getCommonUI().then(m => m.openVideoModal(currentVideoUrl, color, true));
                };
                gachaVideoLink.style.setProperty('--button-color', idolColors[idolName] || '#ff4d8d');
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
