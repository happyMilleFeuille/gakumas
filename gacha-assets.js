// gacha-assets.js - 오디오 및 자산 관리 로직
import { state } from './state.js';
import { getMediaUrl } from './media-url.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export const audioBuffers = {};
export const audioElements = {};
export const assetBlobs = {};
const preloadedVideos = new Map();
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

/**
 * Release 영상은 CORS 때문에 fetch로 Blob 변환할 수 없다. 숨김 video로 전체
 * 재생 구간을 버퍼링하고 요소를 유지해, 실제 연출이 같은 URL을 즉시 재생하게 한다.
 */
export async function preloadGachaVideos(paths, onProgress = null) {
    const uniquePaths = [...new Set(paths.filter(path => path?.endsWith('.mp4')))];
    let completed = 0;

    const reportProgress = () => {
        completed++;
        if (onProgress) onProgress(completed, uniquePaths.length);
    };

    const preloadOne = path => {
        const existing = preloadedVideos.get(path);
        if (existing) return existing.then(reportProgress);

        const promise = new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const timeoutId = setTimeout(() => {
                const ranges = Array.from({ length: video.buffered.length }, (_, index) =>
                    `${video.buffered.start(index).toFixed(3)}-${video.buffered.end(index).toFixed(3)}`
                ).join(',');
                finish(new Error(`Video preload timed out: ${path} (${ranges || 'empty'}/${video.duration || 'unknown'})`));
            }, 180000);
            let finished = false;
            let endSeekRequested = false;
            let lastGapSeek = -1;

            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('aria-hidden', 'true');
            video.style.display = 'none';

            const getContiguousBufferedEnd = () => {
                if (video.buffered.length === 0) return 0;
                let coveredUntil = 0;
                for (let index = 0; index < video.buffered.length; index++) {
                    if (video.buffered.start(index) > coveredUntil + 0.15) break;
                    coveredUntil = Math.max(coveredUntil, video.buffered.end(index));
                }
                return coveredUntil;
            };

            const isFullyBuffered = () => {
                if (!Number.isFinite(video.duration) || video.duration <= 0) return false;
                return getContiguousBufferedEnd() >= video.duration - 0.1;
            };

            const finish = error => {
                if (finished) return;
                finished = true;
                clearTimeout(timeoutId);
                clearInterval(checkTimer);
                video.removeEventListener('progress', checkProgress);
                if (error) {
                    video.remove();
                    reject(error);
                } else {
                    video.currentTime = 0;
                    resolve(video);
                }
            };

            const checkProgress = () => {
                if (isFullyBuffered()) {
                    finish();
                    return;
                }

                // 끝 구간을 받은 뒤 중간에 남은 틈이 있으면 그 지점부터 이어 받는다.
                const lastBufferedEnd = video.buffered.length
                    ? video.buffered.end(video.buffered.length - 1)
                    : 0;
                const coveredUntil = getContiguousBufferedEnd();
                if (endSeekRequested && lastBufferedEnd >= video.duration - 0.1 && coveredUntil > lastGapSeek + 0.1) {
                    lastGapSeek = coveredUntil;
                    video.currentTime = Math.min(video.duration - 0.05, coveredUntil + 0.05);
                }
            };

            const requestEndSeek = () => {
                if (endSeekRequested || !Number.isFinite(video.duration)) return;
                endSeekRequested = true;
                video.currentTime = Math.max(0, video.duration - 0.05);
            };

            video.addEventListener('progress', checkProgress);
            video.addEventListener('canplaythrough', requestEndSeek, { once: true });
            video.addEventListener('error', () => finish(new Error(`Video preload failed: ${path}`)), { once: true });
            const checkTimer = setInterval(checkProgress, 100);

            document.body.appendChild(video);
            video.src = assetBlobs[path] || getMediaUrl(path);
            video.load();
        });

        preloadedVideos.set(path, promise);
        promise.catch(() => preloadedVideos.delete(path));
        return promise.then(reportProgress);
    };

    if (uniquePaths.length === 0) {
        if (onProgress) onProgress(0, 0);
        return;
    }
    await Promise.all(uniquePaths.map(preloadOne));
}

export function playMainBGM() {
    playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
}
