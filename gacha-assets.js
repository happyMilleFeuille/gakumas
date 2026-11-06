// gacha-assets.js - 오디오 및 자산 관리 로직
import { state } from './state.js';
import { getMediaUrl } from './media-url.js';
import { GACHA_ROOT_MEDIA } from './gacha-root-media-manifest.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export const audioBuffers = {};
export const audioElements = {};
export const assetBlobs = {};
const preloadedVideos = new Map();
const unavailableVideos = new Set();
let activeNodes = {};
const activeAudioElements = new Set();
const activeBufferSources = new Set();
const visibilityPausedAudio = new Set();
const visibilityMutedVideos = new Map();

export const GACHA_ASSETS = Object.freeze(['bgm/mainbgm.mp3', ...GACHA_ROOT_MEDIA]);

let isAssetsLoading = false;
let assetsLoadedPromise = null;
export let isAllLoaded = false;

/**
 * 다운로드 확인창에 표시할 핵심 연출 리소스의 예상 크기
 */
export async function fetchTotalAssetSizeMB() {
    // GitHub Release assets do not expose CORS-readable HEAD responses.
    return "103.7";
}

function preloadAudioFully(path, onProgress) {
    const audio = audioElements[path] || new Audio();
    audioElements[path] = audio;
    audio.preload = 'auto';

    return new Promise((resolve, reject) => {
        let finished = false;
        let endSeekRequested = false;
        let lastGapSeek = -1;

        const getContiguousBufferedEnd = () => {
            if (audio.buffered.length === 0) return 0;
            let coveredUntil = 0;
            for (let index = 0; index < audio.buffered.length; index++) {
                if (audio.buffered.start(index) > coveredUntil + 0.15) break;
                coveredUntil = Math.max(coveredUntil, audio.buffered.end(index));
            }
            return coveredUntil;
        };

        const reportProgress = () => {
            const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
            onProgress(duration ? Math.min(1, getContiguousBufferedEnd() / duration) : 0);
        };

        const finish = error => {
            if (finished) return;
            finished = true;
            clearTimeout(timeoutId);
            clearInterval(checkTimer);
            audio.removeEventListener('progress', checkProgress);
            if (error) {
                reject(error);
            } else {
                audio.currentTime = 0;
                onProgress(1);
                resolve();
            }
        };

        const checkProgress = () => {
            const duration = audio.duration;
            const coveredUntil = getContiguousBufferedEnd();
            reportProgress();
            if (Number.isFinite(duration) && duration > 0 && coveredUntil >= duration - 0.1) {
                finish();
                return;
            }

            const lastBufferedEnd = audio.buffered.length
                ? audio.buffered.end(audio.buffered.length - 1)
                : 0;
            if (endSeekRequested && Number.isFinite(duration) && lastBufferedEnd >= duration - 0.1 && coveredUntil > lastGapSeek + 0.1) {
                lastGapSeek = coveredUntil;
                try {
                    audio.currentTime = Math.min(duration - 0.05, coveredUntil + 0.05);
                } catch (error) { }
            }
        };

        const requestEndSeek = () => {
            if (endSeekRequested || !Number.isFinite(audio.duration)) return;
            endSeekRequested = true;
            try {
                audio.currentTime = Math.max(0, audio.duration - 0.05);
            } catch (error) { }
        };

        const timeoutId = setTimeout(() => finish(new Error(`Audio preload timed out: ${path}`)), 180000);
        const checkTimer = setInterval(checkProgress, 100);
        audio.addEventListener('progress', checkProgress);
        audio.addEventListener('canplaythrough', requestEndSeek, { once: true });
        audio.addEventListener('error', () => finish(new Error(`Audio preload failed: ${path}`)), { once: true });

        if (!audio.src) audio.src = getMediaUrl(path);
        audio.load();
        checkProgress();
    });
}

export async function loadGachaAssets() {
    if (isAllLoaded) return Promise.resolve();
    if (assetsLoadedPromise) return assetsLoadedPromise;
    if (isAssetsLoading) return;

    isAssetsLoading = true;
    const progressText = document.getElementById('gacha-progress-text');
    const audioAssets = GACHA_ASSETS.filter(src => src.endsWith('.mp3'));
    const videoAssets = GACHA_ASSETS.filter(src => src.endsWith('.mp4'));
    const loadingAssets = [...audioAssets, ...videoAssets];
    const progressByAsset = new Map(loadingAssets.map(src => [src, 0]));

    const updateProgress = () => {
        if (progressText) {
            const totalProgress = [...progressByAsset.values()].reduce((sum, value) => sum + value, 0);
            const percent = loadingAssets.length ? Math.floor((totalProgress / loadingAssets.length) * 100) : 100;
            progressText.textContent = `${percent}%`;
        }
    };

    const setAssetProgress = (src, progress) => {
        progressByAsset.set(src, Math.max(progressByAsset.get(src) || 0, progress));
        updateProgress();
    };

    assetsLoadedPromise = (async () => {
        const audioTasks = audioAssets.map(async src => {
            if (audioBuffers[src]) {
                setAssetProgress(src, 1);
                return;
            }

            try {
                if (src.startsWith('gasya/')) {
                    await preloadAudioFully(src, progress => setAssetProgress(src, progress));
                    return;
                }

                const response = await fetch(getMediaUrl(src));
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const buffer = await response.arrayBuffer();
                const decoded = await audioCtx.decodeAudioData(buffer);
                audioBuffers[src] = decoded;
                setAssetProgress(src, 1);
            } catch (error) {
                console.error(`Failed to load asset: ${src}`, error);
                throw error;
            }
        });

        videoAssets.forEach(src => {
            if (!assetBlobs[src]) assetBlobs[src] = getMediaUrl(src);
        });
        const videoTask = preloadGachaVideos(
            videoAssets,
            (_completed, _total, path) => setAssetProgress(path, 1),
            { retain: false, concurrency: 3 }
        );

        const results = await Promise.allSettled([...audioTasks, videoTask]);
        const failed = results.find(result => result.status === 'rejected');
        if (failed) throw failed.reason;
        isAllLoaded = true;
    })().finally(() => {
        isAssetsLoading = false;
        if (!isAllLoaded) assetsLoadedPromise = null;
        if (progressText) progressText.textContent = '0%';
    });

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
        activeAudioElements.add(audio);
        const releaseAudio = () => {
            activeAudioElements.delete(audio);
            visibilityPausedAudio.delete(audio);
        };
        audio.addEventListener('ended', releaseAudio, { once: true });
        audio.addEventListener('error', releaseAudio, { once: true });
        audio.play().catch(error => {
            releaseAudio();
            console.error(`Failed to play asset: ${name}`, error);
        });
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

    activeBufferSources.add(source);
    source.addEventListener('ended', () => activeBufferSources.delete(source), { once: true });
    source.start(0, offset);

    if (isBGM && bgmType) activeNodes[bgmType] = source;
    
    return source;
}

export function stopSound(node) {
    if (!node) return;

    if (typeof node.pause === 'function') {
        try { node.pause(); } catch (error) { }
        try { node.currentTime = 0; } catch (error) { }
        activeAudioElements.delete(node);
        visibilityPausedAudio.delete(node);
    } else if (typeof node.stop === 'function') {
        try { node.stop(); } catch (error) { }
        try { node.disconnect(); } catch (error) { }
        activeBufferSources.delete(node);
    }

    Object.keys(activeNodes).forEach(key => {
        if (activeNodes[key] === node) delete activeNodes[key];
    });
}

export function stopBGM(type) {

    if (type === 'all') {
        Object.keys(activeNodes).forEach(key => {
            stopSound(activeNodes[key]);
            delete activeNodes[key];
        });
        return;
    }
    if (activeNodes[type]) {
        stopSound(activeNodes[type]);
        delete activeNodes[type];
    }
}

export function stopAllSounds() {
    stopBGM('all');
    activeBufferSources.forEach(stopSound);
    activeBufferSources.clear();
    activeAudioElements.forEach(stopSound);
    activeAudioElements.clear();
    visibilityPausedAudio.clear();
}

export function suspendGachaAudio() {
    activeAudioElements.forEach(audio => {
        if (!audio.paused && !audio.ended) {
            audio.pause();
            visibilityPausedAudio.add(audio);
        }
    });

    if (visibilityMutedVideos.size === 0) {
        ['gacha-video-main', 'gacha-video-next'].forEach(id => {
            const video = document.getElementById(id);
            if (video) {
                visibilityMutedVideos.set(video, video.muted);
                video.muted = true;
            }
        });
    }

    return audioCtx.suspend();
}

export function resumeGachaAudio() {
    visibilityMutedVideos.forEach((wasMuted, video) => {
        video.muted = state.gachaMuted ? true : wasMuted;
    });
    visibilityMutedVideos.clear();

    if (state.gachaMuted) {
        visibilityPausedAudio.clear();
        return;
    }

    audioCtx.resume().catch(error => console.error('Failed to resume audio context', error));
    const pausedAudio = [...visibilityPausedAudio];
    visibilityPausedAudio.clear();
    pausedAudio.forEach(audio => {
        if (activeAudioElements.has(audio) && !audio.ended) {
            audio.play().catch(error => console.error('Failed to resume gacha audio', error));
        }
    });

}

/**
 * Release 영상은 CORS 때문에 fetch로 Blob 변환할 수 없다. 숨김 video로 전체
 * 재생 구간을 버퍼링한다. 초기 탭 로딩은 브라우저 캐시만 데운 뒤 요소를 해제하고,
 * 가챠 버튼 뒤에 받는 PSSR 영상은 연출 재생을 위해 유지한다.
 */
export async function preloadGachaVideos(paths, onProgress = null, options = {}) {
    const uniquePaths = [...new Set(paths.filter(path => path?.endsWith('.mp4')))];
    const { retain = true, concurrency = uniquePaths.length || 1 } = options;
    const workerCount = Math.max(1, Math.min(uniquePaths.length || 1, Math.floor(concurrency) || 1));
    let completed = 0;

    const reportProgress = path => {
        completed++;
        if (onProgress) onProgress(completed, uniquePaths.length, path);
    };

    const preloadOne = path => {
        const existing = preloadedVideos.get(path);
        if (existing) return existing.then(() => reportProgress(path));

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
                video.removeEventListener('canplaythrough', requestEndSeek);
                video.removeEventListener('error', handleError);
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

            const handleError = () => finish(new Error(`Video preload failed: ${path}`));

            video.addEventListener('progress', checkProgress);
            video.addEventListener('canplaythrough', requestEndSeek, { once: true });
            video.addEventListener('error', handleError, { once: true });
            const checkTimer = setInterval(checkProgress, 100);

            document.body.appendChild(video);
            video.src = assetBlobs[path] || getMediaUrl(path);
            video.load();
        });

        const settledPromise = promise.then(video => {
            unavailableVideos.delete(path);
            if (!retain) {
                video.pause();
                video.remove();
                video.removeAttribute('src');
                video.load();
                preloadedVideos.delete(path);
                return null;
            }
            return video;
        }).catch(error => {
            unavailableVideos.add(path);
            console.warn(`Skipping unavailable gacha video: ${path}`, error);
            return null;
        });
        preloadedVideos.set(path, settledPromise);
        return settledPromise.then(() => reportProgress(path));
    };

    if (uniquePaths.length === 0) {
        if (onProgress) onProgress(0, 0);
        return;
    }
    let nextIndex = 0;
    const runWorker = async () => {
        while (nextIndex < uniquePaths.length) {
            const path = uniquePaths[nextIndex++];
            await preloadOne(path);
        }
    };
    await Promise.all(Array.from({ length: workerCount }, runWorker));
}

export function isGachaVideoUnavailable(path) {
    return unavailableVideos.has(path);
}

export function playMainBGM() {
    playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
}
