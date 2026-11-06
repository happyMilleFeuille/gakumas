// gacha-assets.js - 오디오 및 자산 관리 로직
import { state } from './state.js';
import { getMediaUrl } from './media-url.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export const audioBuffers = {};
export const audioElements = {};
export const assetBlobs = {};
let activeNodes = {};

export const GACHA_ASSETS = [
    'bgm/mainbgm.mp3',
    'gasya/start_r.mp4', 'gasya/start_sr.mp4', 'gasya/start_ssr.mp4', 
    'gasya/start_bgmnormal.mp3', 'gasya/bgm_ssr.mp3', 'gasya/bgm_ssrcm.mp3',
    'gasya/gasyaclick.mp3', 'gasya/start_click.mp3', 'gasya/start_srclick.mp3', 'gasya/start_ssrclick.mp3', 'gasya/screen1.mp3',
    'gasya/screen_sr2.mp3', 'gasya/screen_sr3.mp3', 'gasya/screen_r2.mp3', 'gasya/slide.mp3',
    'gasya/blackout.mp4', 'gasya/blackout.mp3', 'gasya/blackoutresult.mp3',
    'gasya/get_r1.mp4', 'gasya/get_r2.mp4',
    'gasya/get_sr1.mp4', 'gasya/get_sr2.mp4', 'gasya/get_sr3.mp4',
    'gasya/get_ssr1.mp4', 'gasya/get_ssr2.mp4', 'gasya/get_ssr3.mp4',
    'gasya/1ren_result.mp3', 'gasya/10ren_result.mp3', 
    'gasya/spotget_rsupport.mp4', 'gasya/spotget_srsupport.mp4', 'gasya/spotget_ssrsupport.mp4', 
    'gasya/spotget_psr.mp4', 'gasya/spotget_pr.mp4', 'gasya/spotget_pssr.mp4', 'gasya/spotget_pssralt1.mp4',
    'gasya/spotget_r.mp3', 'gasya/spotget_sr.mp3', 'gasya/get_pssr.mp3', 'gasya/get_pssralt1.mp3', 'gasya/getssr.mp3'
];

let isAssetsLoading = false;
let assetsLoadedPromise = null;
export let isAllLoaded = false;

/**
 * 다운로드 확인창에 표시할 핵심 연출 리소스의 예상 크기
 */
export async function fetchTotalAssetSizeMB() {
    // GitHub Release assets do not expose CORS-readable HEAD responses.
    return "70.0";
}

export async function loadGachaAssets() {
    if (isAllLoaded) return Promise.resolve();
    if (assetsLoadedPromise) return assetsLoadedPromise;
    if (isAssetsLoading) return;

    isAssetsLoading = true;
    const progressText = document.getElementById('gacha-progress-text');
    let loadedCount = 0;
    const totalCount = GACHA_ASSETS.length;

    const updateProgress = () => {
        if (progressText) {
            const percent = Math.floor((loadedCount / totalCount) * 100);
            progressText.textContent = `${percent}%`;
        }
    };

    assetsLoadedPromise = (async () => {
        const loadTasks = GACHA_ASSETS.map(async (src) => {
            if ((src.endsWith('.mp3') && (audioBuffers[src] || audioElements[src])) || (src.endsWith('.mp4') && assetBlobs[src])) {
                loadedCount++;
                updateProgress();
                return;
            }

            try {
                if (src.startsWith('gasya/')) {
                    const mediaUrl = getMediaUrl(src);
                    if (src.endsWith('.mp3')) {
                        const audio = new Audio(mediaUrl);
                        audio.preload = 'auto';
                        audioElements[src] = audio;
                    } else {
                        // Direct media URLs avoid CORS restrictions on Release assets.
                        assetBlobs[src] = mediaUrl;
                    }
                    return;
                }

                const response = await fetch(getMediaUrl(src));
                const buffer = await response.arrayBuffer();
                
                if (src.endsWith('.mp3')) {
                    const decoded = await audioCtx.decodeAudioData(buffer);
                    audioBuffers[src] = decoded;
                } else {
                    const blob = new Blob([buffer], { type: 'video/mp4' });
                    assetBlobs[src] = URL.createObjectURL(blob);
                }
            } catch (error) {
                console.error(`Failed to load asset: ${src}`, error);
            } finally {
                loadedCount++;
                updateProgress();
            }
        });

        await Promise.allSettled(loadTasks);
        isAssetsLoading = false;
        isAllLoaded = true;
        if (progressText) progressText.textContent = '0%';
    })();

    return assetsLoadedPromise;
}

export function playSound(name, options = {}) {
    if (state.gachaMuted || (!audioBuffers[name] && !audioElements[name])) return null;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const { loop = false, isBGM = false, bgmType = null, offset = 0, volume = 1.0 } = options;

    if (bgmType) stopBGM(bgmType);

    if (audioElements[name]) {
        const audio = audioElements[name].cloneNode();
        audio.loop = loop;
        audio.volume = volume;
        if (offset > 0) {
            try {
                audio.currentTime = offset;
            } catch (error) {
                audio.addEventListener('loadedmetadata', () => { audio.currentTime = offset; }, { once: true });
            }
        }
        // Call play immediately so the browser retains the user's click activation.
        audio.play().catch(error => console.error(`Failed to play asset: ${name}`, error));
        if (isBGM && bgmType) activeNodes[bgmType] = audio;
        return audio;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[name];
    source.loop = loop;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start(0, offset);

    if (isBGM && bgmType) activeNodes[bgmType] = source;
    
    return source;
}

export function stopBGM(type) {
    const stopNode = (node) => {
        try {
            if (typeof node.stop === 'function') node.stop();
            else if (typeof node.pause === 'function') {
                node.pause();
                node.currentTime = 0;
            }
        } catch (e) {}
    };

    if (type === 'all') {
        Object.keys(activeNodes).forEach(key => {
            stopNode(activeNodes[key]);
            delete activeNodes[key];
        });
        return;
    }
    if (activeNodes[type]) {
        stopNode(activeNodes[type]);
        delete activeNodes[type];
    }
}

export function playMainBGM() {
    playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
}
