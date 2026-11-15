// gacha-ui-render.js - 가챠 UI 렌더링 로직
import { state, setSelectedPickup, idolColors, hasGachaLogCard, getGachaLog } from './state.js';
import { CURRENT_PICKUPS, SELECTION_CONFIG, NORMAL_CONFIG, LIMITED_CONFIG, UNIT_CONFIG, FES_CONFIG } from './gachaconfig.js';
import { produceList } from './producedata.js';
import { cardList } from './carddata.js'; // 서포트 카드 데이터 추가
import { openDrawer } from './gacha-drawer.js';
import { bindSafeClick } from './gacha-utils.js';
import { getMediaUrl } from './media-url.js';
import { showProduceCardInfoModal } from './pssrInfoModal.js';
import { showCardModal } from './cardModal.js';
import translations from './i18n.js';

const BANNER_AUTO_SWITCH_DELAY = 10000;
let bannerAutoSwitchTimer = null;

export function stopGachaBannerAutoSwitch() {
    if (bannerAutoSwitchTimer !== null) {
        clearTimeout(bannerAutoSwitchTimer);
        bannerAutoSwitchTimer = null;
    }
}

const useJaNames = () => state.currentLang !== 'ko';
const getLocalizedCardName = (card) => {
    if (!card) return '';
    if (state.currentLang === 'en' && card.name_en) return card.name_en;
    if (useJaNames() && card.name_ja) return card.name_ja;
    return card.name || '';
};

const getLocalizedIdolName = (produceId) => {
    const idolKey = produceId?.match(/^ssr([^_]+)/)?.[1];
    if (!idolKey) return '';
    const language = translations[state.currentLang] || translations.ko;
    return language?.[`idol_fullname_${idolKey}`] || language?.[`idol_name_${idolKey}`] || idolKey;
};

function applyGachaBackground(imageUrl) {
    const fixedBg = document.getElementById('fixed-bg');
    if (!fixedBg || !imageUrl) return;

    const applyImage = (url) => {
        fixedBg.dataset.gachaBackground = url;
        fixedBg.style.webkitMaskImage = 'none';
        fixedBg.style.maskImage = 'none';
        fixedBg.style.backgroundImage = `url('${url}')`;
        fixedBg.style.backgroundColor = 'transparent';
        fixedBg.style.backgroundSize = 'cover';
        fixedBg.style.backgroundRepeat = 'no-repeat';
        fixedBg.style.backgroundPosition = 'center bottom';
        fixedBg.style.filter = 'brightness(1.2)';
        fixedBg.style.opacity = '0.4';
    };

    applyImage(imageUrl);

    if (imageUrl.includes('idols/verygood/')) {
        const requestedUrl = imageUrl;
        const img = new Image();
        img.onerror = () => {
            if (fixedBg.dataset.gachaBackground !== requestedUrl) return;
            applyImage(requestedUrl.replace('idols/verygood/', 'idols/'));
        };
        img.src = requestedUrl;
    }
}

/**
 * 픽업 선택기 영역 렌더링
 */
export function renderPickupSelector(ui) {
    stopGachaBannerAutoSwitch();
    if (!ui.pickupSelector) return;
    const type = state.gachaType;
    const checkHasCard = (id) => hasGachaLogCard(id, type);

    // 1. 드로어 방식 (셀렉션, 통상, 한정, 유닛, 페스)
    if (type === 'selection' || type === 'normal' || type === 'limited' || type === 'unit' || type === 'fes') {
        ui.pickupSelector.classList.remove('hidden');
        const { currentCfg, favColor, gachaName, bannerImg, bgImg } = getDrawerTypeDisplayData(type, checkHasCard);
        
        // 더블 픽업도 첫 번째 PSSR 기준의 단일 배너로 표시
        const isSelection = type === 'selection';
        const isMulti = false;
        const itemClass = (isSelection || isMulti) ? 'selection-item' : 'normal-selection-item';

        // 픽업 서포트 카드 데이터 추출
        const sssrPickups = currentCfg.pool?.sssr || [];
        const srPickups = currentCfg.pool?.sr_card || [];
        const pickupPssrIds = (currentCfg.pool?.pssr || [])
            .map(item => typeof item === 'string' ? item : item?.id)
            .filter(Boolean);
        const useMobileHighQualityPssr = window.matchMedia('(max-width: 768px)').matches;
        const createSupportBannerItem = (id) => {
            const cardData = cardList.find(card => card.id === id);
            const isCardType = cardData?.have?.startsWith('card');
            return {
                type: 'support',
                id,
                name: getLocalizedCardName(cardData),
                rarity: cardData?.rarity || 'SSR',
                plan: cardData?.plan,
                attribute: cardData?.type,
                extraSrc: `images/support/${id}_${isCardType ? 'card' : 'item'}.webp`,
                extraFallbackSrc: `images/support/${id}_${isCardType ? 'item' : 'card'}.webp`,
                src: `images/support/${id}.webp`,
                backgroundSrc: `images/support/${id}.webp`
            };
        };
        const bannerItems = [
            ...pickupPssrIds.map(id => {
                const cardData = produceList.find(card => card.id === id);
                const imageVersion = checkHasCard(id) ? '2' : '1';
                const defaultSrc = `idols/${id}${imageVersion}.webp`;
                return {
                    type: 'produce',
                    id,
                    plan: cardData?.plan,
                    rarity: cardData?.rarity || 'PSSR',
                    characterName: getLocalizedIdolName(id),
                    src: useMobileHighQualityPssr
                        ? `idols/verygood/${id}${imageVersion}.webp`
                        : defaultSrc,
                    fallbackSrc: useMobileHighQualityPssr ? defaultSrc : null,
                    backgroundSrc: `idols/verygood/${id}2.webp`
                };
            }),
            ...sssrPickups.filter(Boolean).map(createSupportBannerItem),
            ...srPickups.filter(Boolean).map(createSupportBannerItem)
        ];

        applyGachaBackground(bgImg);

        const idolContainer = document.getElementById('idol');
        let bannerLayer = document.getElementById('gacha-banner-layer');
        if (!bannerLayer && idolContainer) {
            bannerLayer = document.createElement('div');
            bannerLayer.id = 'gacha-banner-layer';
            bannerLayer.className = 'gacha-banner-layer';
            idolContainer.prepend(bannerLayer);
        }
        bannerLayer?.replaceChildren();

        ui.pickupSelector.innerHTML = `
            <div class="pickup-wrapper ${ (isSelection || isMulti) ? 'selection-wrapper' : ''}">
                <div class="pickup-item ${itemClass}">
                    <button type="button" class="pickup-drawer-bar" aria-label="Open gacha details">
                        <span class="pickup-drawer-bar-handle" aria-hidden="true"></span>
                    </button>
                    <div class="pickup-img-wrapper idol-main-img" style="border: 1px solid ${favColor}; ${isMulti ? 'display: flex; position: absolute;' : 'position: absolute;'} box-shadow: 0 0 20px 5px ${favColor}99;">
                        ${ isMulti ? 
                            currentCfg.pool.pssr.map((p, idx) => {
                                const pid = typeof p === 'string' ? p : p.id;
                                const imgVer = checkHasCard(pid) ? '2' : '1';
                                
                                return `
                                <div style="flex: 1; position: relative; overflow: hidden; ${idx < currentCfg.pool.pssr.length - 1 ? `border-right: 1px solid ${favColor}88;` : ''}">
                                    <img src="idols/${pid}${imgVer}.webp" style="width: 100%; height: 100%; object-fit: cover; object-position: top; display: block;">
                                </div>`;
                            }).join('')
                            : `
                            <div class="selection-banner-img" style="width: 100%; height: 100%; overflow: hidden; position: relative;">
                                <img src="${isSelection ? bannerImg : (bannerItems[0]?.src || bannerImg)}" style="width: 100%; height: 100%; object-fit: cover; object-position: top; display: block;">
                            </div>
                            `
                        }
                    </div>
                    <div class="pickup-info-row">
                        <div class="pickup-identity">
                            <div class="pickup-rarity-row">
                                <img class="pickup-rarity-icon hidden" src="" alt="">
                                ${!isSelection ? `
                                    <button type="button" class="pickup-info-btn" aria-label="Gacha information">
                                        <img src="icons/info.svg" alt="">
                                    </button>
                                ` : ''}
                            </div>
                            <div class="pickup-name">
                                <div class="pickup-gacha-name">${gachaName}</div>
                                <div class="pickup-character-name"></div>
                            </div>
                            ${!isSelection && bannerItems.length > 1 ? `
                                <button type="button" class="gacha-image-switch-btn" aria-label="Image 1 of ${bannerItems.length}">
                                    <span class="gacha-image-switch-icon" aria-hidden="true">⇌</span>
                                    <span class="gacha-image-switch-count">1/${bannerItems.length}</span>
                                    <span class="gacha-image-switch-progress" aria-hidden="true">
                                        <span class="gacha-image-switch-progress-fill"></span>
                                    </span>
                                </button>
                            ` : ''}
                        </div>
                        <div class="pickup-skill-item-icons hidden" aria-hidden="true"></div>
                    </div>
                </div>
                <div class="pickup-banner-spacer" aria-hidden="true"></div>
            </div>
        `;
        const bannerContainer = ui.pickupSelector.querySelector('.pickup-item');
        if (bannerContainer && bannerLayer) bannerLayer.appendChild(bannerContainer);

        if (!isSelection && bannerItems[0]?.fallbackSrc) {
            const initialBannerImage = bannerLayer?.querySelector('.selection-banner-img img');
            const fallbackSrc = bannerItems[0].fallbackSrc;
            initialBannerImage?.addEventListener('error', () => {
                initialBannerImage.src = fallbackSrc;
            }, { once: true });
            if (initialBannerImage?.complete && initialBannerImage.naturalWidth === 0) {
                initialBannerImage.src = fallbackSrc;
            }
        }

        const drawerBar = bannerLayer?.querySelector('.pickup-drawer-bar');
        if (drawerBar) bindSafeClick(drawerBar, openDrawer);

        const skillItemIcons = bannerLayer?.querySelector('.pickup-skill-item-icons');
        const rarityIcon = bannerLayer?.querySelector('.pickup-rarity-icon');
        const gachaNameLabel = bannerLayer?.querySelector('.pickup-gacha-name');
        const characterName = bannerLayer?.querySelector('.pickup-character-name');
        const infoBtn = bannerLayer?.querySelector('.pickup-info-btn');
        let iconRenderVersion = 0;
        let activeBannerItem = isSelection ? null : bannerItems[0];
        const updateSkillItemIcons = async (item) => {
            activeBannerItem = item || null;
            if (!skillItemIcons) return;
            const renderVersion = ++iconRenderVersion;
            skillItemIcons.classList.add('hidden');
            skillItemIcons.classList.toggle('support-icons', item?.type === 'support');
            skillItemIcons.replaceChildren();

            if (gachaNameLabel) {
                gachaNameLabel.textContent = item?.type === 'support' ? (item.name || '') : gachaName;
                gachaNameLabel.classList.toggle('support-card-name', item?.type === 'support');
            }
            if (rarityIcon) {
                const rarityKey = item?.rarity?.toLowerCase().replace(/^p/, '');
                rarityIcon.classList.toggle('hidden', !rarityKey);
                if (rarityKey) {
                    rarityIcon.src = `icons/${rarityKey}.png`;
                    rarityIcon.alt = item.rarity;
                }
            }
            if (characterName) {
                characterName.textContent = item?.type === 'produce' ? item.characterName : '';
                characterName.classList.toggle('hidden', !characterName.textContent);
            }

            if (!item || !item.id) {
                skillItemIcons.classList.add('hidden');
                return;
            }

            const iconSources = [];
            if (item.type === 'support') {
                if (item.attribute) iconSources.push({ src: `icons/${item.attribute}.webp`, alt: 'Attribute' });
                iconSources.push({ src: item.extraSrc, fallbackSrc: item.extraFallbackSrc, alt: 'Support effect' });
            } else if (item.type === 'produce') {
                if (item.plan) {
                    iconSources.push(
                        { src: `icons/${item.plan}.webp`, alt: 'Plan' },
                        { src: `idols/${item.plan}/${item.id}.webp`, alt: 'Skill' },
                        { src: `idols/${item.plan}/${item.id}second.webp`, alt: 'Skill 2' }
                    );
                }
                iconSources.push({ src: `idols/item/${item.id}.webp`, alt: 'Item' });
            } else {
                skillItemIcons.classList.add('hidden');
                return;
            }

            const loadedIcons = await Promise.all(iconSources.map(({ src, fallbackSrc, alt }) => new Promise(resolve => {
                const icon = document.createElement('img');
                let usingFallback = false;
                icon.alt = alt;
                icon.className = 'pickup-skill-item-icon';
                icon.addEventListener('load', () => resolve(icon), { once: true });
                icon.addEventListener('error', () => {
                    if (fallbackSrc && !usingFallback) {
                        usingFallback = true;
                        icon.src = fallbackSrc;
                        return;
                    }
                    resolve(null);
                });
                icon.src = src;
            })));

            if (renderVersion !== iconRenderVersion) return;
            skillItemIcons.replaceChildren(...loadedIcons.filter(Boolean));
            skillItemIcons.classList.toggle('hidden', loadedIcons.every(icon => !icon));
        };

        updateSkillItemIcons(isSelection ? null : bannerItems[0]);

        if (infoBtn) {
            ['pointerdown', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(eventName => {
                infoBtn.addEventListener(eventName, event => event.stopPropagation());
            });
            bindSafeClick(infoBtn, () => {
                if (!activeBannerItem?.id) return;

                if (activeBannerItem.type === 'support') {
                    const card = cardList.find(entry => entry.id === activeBannerItem.id);
                    if (!card) return;
                    showCardModal(
                        card,
                        getLocalizedCardName(card),
                        card.image || `images/support/${card.id}.webp`,
                        { restoreLBOnClose: true }
                    );
                    return;
                }

                if (activeBannerItem.type !== 'produce') return;

                const card = produceList.find(entry => entry.id === activeBannerItem.id);
                if (!card) return;

                const idolKey = activeBannerItem.id.match(/^ssr([^_]+)/)?.[1];
                showProduceCardInfoModal(card, idolColors[idolKey] || '#ffffff');
            });
        }

        const imageSwitchBtn = bannerLayer?.querySelector('.gacha-image-switch-btn');
        if (imageSwitchBtn) {
            ['pointerdown', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(eventName => {
                imageSwitchBtn.addEventListener(eventName, event => {
                    event.stopPropagation();
                });
            });

            const bannerImage = bannerLayer?.querySelector('.selection-banner-img img');
            const bannerImageWrapper = bannerLayer?.querySelector('.selection-banner-img');
            const countLabel = imageSwitchBtn.querySelector('.gacha-image-switch-count');
            const progressFill = imageSwitchBtn.querySelector('.gacha-image-switch-progress-fill');
            let bannerIndex = 0;
            const setBannerImageSource = (image, item) => {
                if (!image || !item) return;
                image.onerror = item.fallbackSrc ? () => {
                    image.onerror = null;
                    image.src = item.fallbackSrc;
                } : null;
                image.src = item.src;
            };
            const playSupportBannerEnter = (item) => {
                if (!bannerImage) return;
                bannerImage.classList.remove('support-banner-enter');
                void bannerImage.offsetWidth;
                bannerImage.classList.add('support-banner-enter');

                if (!bannerImageWrapper) return;
                let secondaryImage = bannerImageWrapper.querySelector('.support-banner-enter-secondary');
                if (!secondaryImage) {
                    secondaryImage = document.createElement('img');
                    secondaryImage.className = 'support-banner-enter-secondary';
                    secondaryImage.alt = '';
                    secondaryImage.setAttribute('aria-hidden', 'true');
                    bannerImageWrapper.appendChild(secondaryImage);
                }
                setBannerImageSource(secondaryImage, item);
                secondaryImage.classList.remove('is-animating');
                void secondaryImage.offsetWidth;
                secondaryImage.classList.add('is-animating');

                let finaleGlow = bannerImageWrapper.querySelector('.support-banner-finale-glow');
                if (!finaleGlow) {
                    finaleGlow = document.createElement('span');
                    finaleGlow.className = 'support-banner-finale-glow';
                    finaleGlow.setAttribute('aria-hidden', 'true');
                    bannerImageWrapper.appendChild(finaleGlow);
                }
                finaleGlow.classList.remove('is-animating');
                void finaleGlow.offsetWidth;
                finaleGlow.classList.add('is-animating');

                let finaleRays = bannerImageWrapper.querySelector('.support-banner-finale-rays');
                if (!finaleRays) {
                    finaleRays = document.createElement('span');
                    finaleRays.className = 'support-banner-finale-rays';
                    finaleRays.setAttribute('aria-hidden', 'true');
                    bannerImageWrapper.appendChild(finaleRays);
                }
                finaleRays.classList.remove('is-animating');
                void finaleRays.offsetWidth;
                finaleRays.classList.add('is-animating');

                let finaleImage = bannerImageWrapper.querySelector('.support-banner-finale');
                if (!finaleImage) {
                    finaleImage = document.createElement('img');
                    finaleImage.className = 'support-banner-finale';
                    finaleImage.alt = '';
                    finaleImage.setAttribute('aria-hidden', 'true');
                    bannerImageWrapper.appendChild(finaleImage);
                }
                setBannerImageSource(finaleImage, item);
                finaleImage.classList.remove('is-animating');
                void finaleImage.offsetWidth;
                finaleImage.classList.add('is-animating');
            };
            const advanceBanner = () => {
                if (!bannerImage || bannerItems.length < 2) return;

                bannerIndex = (bannerIndex + 1) % bannerItems.length;
                const nextItem = bannerItems[bannerIndex];
                setBannerImageSource(bannerImage, nextItem);
                bannerImage.style.objectFit = nextItem.type === 'support' ? 'contain' : 'cover';
                bannerImage.style.objectPosition = nextItem.type === 'support' ? 'center 15%' : 'top';
                if (nextItem.type === 'support') {
                    playSupportBannerEnter(nextItem);
                } else {
                    bannerImage.classList.remove('support-banner-enter');
                    bannerImageWrapper?.querySelector('.support-banner-enter-secondary')?.remove();
                    bannerImageWrapper?.querySelector('.support-banner-finale-glow')?.remove();
                    bannerImageWrapper?.querySelector('.support-banner-finale-rays')?.remove();
                    bannerImageWrapper?.querySelector('.support-banner-finale')?.remove();
                }
                applyGachaBackground(nextItem.backgroundSrc);
                updateSkillItemIcons(nextItem);
                if (countLabel) countLabel.textContent = `${bannerIndex + 1}/${bannerItems.length}`;
                imageSwitchBtn.setAttribute('aria-label', `Image ${bannerIndex + 1} of ${bannerItems.length}`);
            };
            const scheduleAutoSwitch = () => {
                stopGachaBannerAutoSwitch();
                if (progressFill) {
                    progressFill.classList.remove('is-running');
                    void progressFill.offsetWidth;
                    progressFill.classList.add('is-running');
                }
                bannerAutoSwitchTimer = setTimeout(() => {
                    bannerAutoSwitchTimer = null;
                    if (!imageSwitchBtn.isConnected || bannerLayer !== document.getElementById('gacha-banner-layer')) return;
                    if (document.hidden || document.body.classList.contains('immersive-mode') || document.body.classList.contains('gacha-result-active')) {
                        scheduleAutoSwitch();
                        return;
                    }
                    advanceBanner();
                    scheduleAutoSwitch();
                }, BANNER_AUTO_SWITCH_DELAY);
            };
            imageSwitchBtn.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                advanceBanner();
                scheduleAutoSwitch();
            });
            scheduleAutoSwitch();
        }

        return;
    }

    // 2. 기타 방식 (필요 시)
    ui.pickupSelector.classList.add('hidden');
    document.getElementById('gacha-banner-layer')?.remove();
}

/**
 * 서포트 카드 툴팁 설정
 */
function setupSupportTooltips(container) {
    const isMobile = window.innerWidth <= 768;

    let tooltip = document.getElementById('gacha-card-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'gacha-card-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '9999';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.border = '3px solid #fff';
        tooltip.style.borderRadius = '12px';
        tooltip.style.transition = 'none';
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.overflow = 'hidden';
        tooltip.style.padding = '0';
        tooltip.style.margin = '0';
        tooltip.style.boxSizing = 'border-box';
        document.body.appendChild(tooltip);
    }
    
    // 내부 구조 고정 (쏠림 방지를 위해 전용 컨테이너 사용)
    tooltip.innerHTML = `
        <div class="tooltip-container" style="position: relative; width: 100%; height: auto; display: block; background: #000;">
            <img src="" class="tooltip-main-img" style="width: 100%; height: auto; display: block;">
            <img src="" class="tooltip-attr-icon" style="position: absolute; top: 8px; left: 8px; z-index: 5; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
            <div class="tooltip-card-name" style="position: absolute; bottom: 8px; right: 8px; z-index: 10; color: #fff; font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.8); padding: 2px 0; pointer-events: none; white-space: nowrap;"></div>
            <img src="" class="tooltip-rarity-img" style="position: absolute; bottom: 8px; left: 8px; z-index: 5;">
            <img src="" class="tooltip-plan-icon" style="position: absolute; z-index: 5; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
        </div>
    `;

    const tImg = tooltip.querySelector('.tooltip-main-img');
    const attrIcon = tooltip.querySelector('.tooltip-attr-icon');
    const rarityImg = tooltip.querySelector('.tooltip-rarity-img');
    const planIcon = tooltip.querySelector('.tooltip-plan-icon');
    const nameLabel = tooltip.querySelector('.tooltip-card-name');

    // 이미지 로드 실패 시 툴팁 자동 닫기
    tImg.onerror = () => {
        tooltip.style.opacity = '0';
        setTimeout(() => { tooltip.style.display = 'none'; }, 150);
    };

    const showTooltip = (e, clientX, clientY) => {
        // 드래그 중일 때는 툴팁을 표시하지 않음
        if (window.isGlobalDragging) return;

        const item = e.target.closest('.support-pickup-mini');
        if (!item) return;

        const bgImgPath = item.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        const cardId = bgImgPath.split('/').pop().replace('.webp', '');
        const cardData = cardList.find(c => c.id === cardId);

        if (cardData) {
            attrIcon.src = `icons/${cardData.type}.webp`;
            attrIcon.style.display = 'block';
            rarityImg.src = `icons/${cardData.rarity.toLowerCase()}.png`;
            rarityImg.style.display = 'block';
            
            // 카드 이름 설정 (다국어 지원)
            nameLabel.textContent = getLocalizedCardName(cardData);
            
            if (cardData.plan && cardData.plan !== 'free') {
                planIcon.src = `icons/${cardData.plan}.webp`;
                planIcon.style.display = 'block';
            } else {
                planIcon.style.display = 'none';
            }
        }

        tImg.dataset.targetId = cardId;
        const highResSrc = `images/support/${cardId}.webp`;
        const highResImg = new Image();
        highResImg.src = highResSrc;

        if (highResImg.complete) {
            tImg.src = highResSrc;
            tImg.style.opacity = '1';
        } else {
            tImg.src = bgImgPath;
            tImg.style.opacity = '1';

            highResImg.onload = () => {
                if (tImg.dataset.targetId === cardId) {
                    tImg.src = highResSrc;
                }
            };
        }
        
        const rarity = item.dataset.rarity;
        const ssrGradient = 'linear-gradient(135deg, #ffeb7a 0%, #ff8bad 35%, #c293ff 70%, #73e8ff 100%)';
        const srGradient = 'linear-gradient(135deg, #fff44f 0%, #fffde6 25%, #ffcc00 50%)';
        const borderGradient = rarity === 'SSR' ? ssrGradient : (rarity === 'SR' ? srGradient : 'linear-gradient(135deg, #fff, #fff)');
        const shadow = rarity === 'SSR' ? 'rgba(212, 165, 255, 0.4)' : 'rgba(255, 224, 130, 0.3)';

        tooltip.style.border = '3px solid transparent';
        tooltip.style.backgroundImage = `linear-gradient(#000, #000), ${borderGradient}`;
        tooltip.style.backgroundOrigin = 'border-box';
        tooltip.style.backgroundClip = 'padding-box, border-box';
        tooltip.style.boxShadow = `0 10px 40px ${shadow}`;
        tooltip.style.display = 'block';
        
        moveTooltipInternal(clientX, clientY);
        setTimeout(() => tooltip.style.opacity = '1', 10);
    };

    const moveTooltipInternal = (clientX, clientY) => {
        if (tooltip.style.display !== 'block') return;
        
        // 매번 현재 화면 크기를 체크하여 모바일 여부 판단
        const currentIsMobile = window.innerWidth <= 768;
        const tw = currentIsMobile ? 240 : 400; 
        const th = tw * (9 / 16);
        
        let x, y;
        if (currentIsMobile) {
            x = clientX - (tw / 2); // 손가락 중앙
            y = clientY - th - 40; // 기본적으로 위쪽
            
            // 상단 경계 돌파 시 아래쪽으로 반전
            if (y < 10) {
                y = clientY + 40;
            }
        } else {
            x = clientX + 25;
            y = clientY + 25;
        }

        // 화면 좌우 경계 체크
        if (x + tw > window.innerWidth - 10) x = window.innerWidth - tw - 10;
        if (x < 10) x = 10;
        
        // 화면 하단 경계 체크
        if (y + th > window.innerHeight - 10) y = window.innerHeight - th - 10;
        if (y < 10) y = 10;

        tooltip.style.setProperty('width', tw + 'px', 'important');
        tooltip.style.setProperty('min-width', tw + 'px', 'important');
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        
        // 아이콘 크기/위치 최적화 (모두 좌측 배치)
        if (currentIsMobile) {
            attrIcon.style.width = '25px';
            attrIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'; // 그림자 축소
            
            rarityImg.style.width = '35px';
            
            planIcon.style.width = '20px';
            planIcon.style.bottom = '42px';
            planIcon.style.left = '10px';
            planIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'; // 그림자 축소
            
            // 이름 폰트 및 그림자 축소
            nameLabel.style.fontSize = '0.7rem';
            nameLabel.style.textShadow = '0 1px 3px rgba(0,0,0,1)';
        } else {
            attrIcon.style.width = '45px';
            attrIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
            
            rarityImg.style.width = '65px';
            
            planIcon.style.width = '38px';
            planIcon.style.bottom = '62px';
            planIcon.style.left = '15px';
            planIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
            
            nameLabel.style.fontSize = '1.1rem';
            nameLabel.style.textShadow = '0 1px 3px rgba(0,0,0,1)';
        }
    };

    const hideTooltip = () => {
        tooltip.style.opacity = '0';
        setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 150);
    };

    const globalHide = (e) => { if (!e.target.closest('.support-pickup-mini')) hideTooltip(); };

    const targets = container.querySelectorAll('.support-pickup-mini');
    targets.forEach(target => {
        if (isMobile) {
            target.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                showTooltip(e, e.touches[0].clientX, e.touches[0].clientY);
            });
        } else {
            target.addEventListener('mouseenter', (e) => showTooltip(e, e.clientX, e.clientY));
            target.addEventListener('mousemove', (e) => moveTooltipInternal(e.clientX, e.clientY));
            target.addEventListener('mouseleave', hideTooltip);
        }
    });

    if (isMobile) document.addEventListener('touchstart', globalHide, { passive: true });
}

export function renderResults(ui, currentResults, existingIdsBeforePull = null) {
    if (!ui.resultsContainer) return;
    ui.resultsContainer.innerHTML = '';
    const itemTpl = document.getElementById('tpl-gacha-result-item');
    ui.resultsContainer.classList.toggle('single-result', currentResults.length === 1);

    // existingIdsBeforePull이 전달되면 그대로 사용, 아니면 로그에서 계산
    let prePullExistingIds;
    if (existingIdsBeforePull) {
        prePullExistingIds = existingIdsBeforePull;
    } else {
        const currentLog = getGachaLog();
        prePullExistingIds = new Set(currentLog.slice(currentResults.length));
    }

    currentResults.forEach((card, index) => {
        const clone = itemTpl.content.cloneNode(true);
        const cardEl = clone.querySelector('.gacha-result-card');
        cardEl.classList.add('animate', `${card.displayRarity.toLowerCase()}-bg`);
        cardEl.style.animationDelay = `${index * 0.08}s`;
        // 이전 기록에 이 카드 ID가 없었으면 NEW 배지 표시
        if (!prePullExistingIds.has(card.id)) {
            const badge = document.createElement('div'); badge.className = 'new-badge'; badge.textContent = 'NEW'; cardEl.appendChild(badge);
        }


        const img = clone.querySelector('.result-card-img');
        if (card.type === 'produce') {
            img.src = `idols/${card.id}1.webp`; cardEl.classList.add('produce-card');
            
            let s = (card.scale || 1.60) * (window.innerWidth <= 768 ? 0.7 : 1), o = (card.offsetY || 55) * (window.innerWidth <= 768 ? 0.7 : 1);
            img.style.transform = `scale(${s}) translateY(${o}px)`;
            const p = clone.querySelector('.result-card-plan-icon'); if (card.plan && p) { p.src = `icons/${card.plan}.webp`; p.classList.remove('hidden'); }
        } else {
            img.src = card.id.includes('dummy') ? 'icons/idol.png' : `images/support/${card.id}.webp`; cardEl.classList.add('landscape');
        }
        clone.querySelector('.result-card-rarity-img').src = `icons/${card.displayRarity.toLowerCase()}.png`;
        const t = document.createElement('div'); t.className = 'card-type-label'; t.textContent = card.type === 'produce' ? 'IDOL' : 'SUPPORT'; cardEl.appendChild(t);
        clone.querySelector('.result-card-name').textContent = getLocalizedCardName(card);
        ui.resultsContainer.appendChild(clone);
    });
}

function getDrawerTypeDisplayData(type, checkHasCard) {
    let currentCfg, favColor, displayName, bannerImg, bgImg;
    const getConfigDisplayName = (cfg) => {
        if (!cfg) return '';
        if (state.currentLang === 'en' && cfg.name_en) return cfg.name_en;
        if (useJaNames() && cfg.name_ja) return cfg.name_ja;
        return cfg.name || '';
    };
    if (type === 'selection') {
        currentCfg = SELECTION_CONFIG.find(c => c.id === state.activeSelectionId) || SELECTION_CONFIG[0];
        favColor = idolColors[state.favoriteIdol] || "#ff4081";
        displayName = getConfigDisplayName(currentCfg);
        bannerImg = currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp';
        bgImg = bannerImg;
    } else if (type === 'normal') {
        currentCfg = NORMAL_CONFIG.find(c => c.id === state.activeNormalId) || NORMAL_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = getLocalizedCardName(cardData) || currentCfg.name;
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/verygood/${pid}2.webp` : bannerImg;
    } else if (type === 'limited') {
        currentCfg = LIMITED_CONFIG.find(c => c.id === state.activeLimitedId) || LIMITED_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = getLocalizedCardName(cardData) || currentCfg.name;
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/verygood/${pid}2.webp` : bannerImg;
    } else if (type === 'unit') {
        currentCfg = UNIT_CONFIG.find(c => c.id === state.activeUnitId) || UNIT_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = getLocalizedCardName(cardData) || currentCfg.name;
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/verygood/${pid}2.webp` : bannerImg;
    } else if (type === 'fes') {
        currentCfg = FES_CONFIG.find(c => c.id === state.activeFesId) || FES_CONFIG[0];
        const firstPSSR = currentCfg.pool?.pssr?.[0], pid = typeof firstPSSR === 'string' ? firstPSSR : firstPSSR?.id;
        const cardData = produceList.find(c => c.id === pid);
        displayName = getLocalizedCardName(cardData) || currentCfg.name;
        const charKey = pid ? pid.replace('ssr', '').split('_')[0] : '';
        favColor = idolColors[charKey] || "#ff4081";
        const imgVer = checkHasCard(pid) ? '2' : '1';
        bannerImg = pid ? `idols/${pid}${imgVer}.webp` : (currentCfg.bannerImg || 'gasya/gasya_ongakusai1.webp');
        bgImg = pid ? `idols/verygood/${pid}2.webp` : bannerImg;
    }
    return {
        currentCfg,
        favColor,
        displayName,
        gachaName: getConfigDisplayName(currentCfg) || displayName,
        bannerImg: getMediaUrl(bannerImg),
        bgImg: getMediaUrl(bgImg)
    };
}
