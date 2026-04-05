// gacha-assets.js - 오디오 및 자산 관리 로직
import { state } from './state.js';

export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export const audioBuffers = {};
export const assetBlobs = {}; 
let activeNodes = {}; 

export const GACHA_ASSETS = [
    'bgm/mainbgm.mp3',
    'gasya/start_r.mp4', 'gasya/start_sr.mp4', 'gasya/start_ssr.mp4', 
    'gasya/start_bgmnormal.mp3', 'gasya/bgm_ssr.mp3', 
    'gasya/gasyaclick.mp3', 'gasya/start_click.mp3', 'gasya/start_srclick.mp3', 'gasya/start_ssrclick.mp3', 'gasya/screen1.mp3',
    'gasya/screen_sr2.mp3', 'gasya/screen_sr3.mp3', 'gasya/screen_r2.mp3', 'gasya/slide.mp3',
    'gasya/blackout.mp4', 'gasya/blackout.mp3', 'gasya/blackoutresult.mp3',
    'gasya/get_r1.mp4', 'gasya/get_r2.mp4',
    'gasya/get_sr1.mp4', 'gasya/get_sr2.mp4', 'gasya/get_sr3.mp4',
    'gasya/get_ssr1.mp4', 'gasya/get_ssr2.mp4', 'gasya/get_ssr3.mp4',
    'gasya/1ren_result.mp3', 'gasya/10ren_result.mp3', 
    'gasya/spotget_rsupport.mp4', 'gasya/spotget_srsupport.mp4', 'gasya/spotget_ssrsupport.mp4', 
    'gasya/spotget_psr.mp4', 'gasya/spotget_pr.mp4', 'gasya/spotget_pssr.mp4', 
    'gasya/spotget_r.mp3', 'gasya/spotget_sr.mp3', 'gasya/get_pssr.mp3'
];

let isAssetsLoading = false;
let assetsLoadedPromise = null;
export let isAllLoaded = false;

/**
 * 서버에 HEAD 요청을 보내 실제 파일 크기를 합산 (완전 자동)
 */
export async function fetchTotalAssetSizeMB() {
    try {
        const sizePromises = GACHA_ASSETS.map(src => 
            fetch(src, { method: 'HEAD' })
                .then(res => parseInt(res.headers.get('content-length') || 0))
                .catch(() => 0)
        );
        const sizes = await Promise.all(sizePromises);
        const totalBytes = sizes.reduce((acc, s) => acc + s, 0);
        
        // 0인 경우(체크 실패 등) 기본값 70MB 반환
        if (totalBytes === 0) return "70.0";
        return (totalBytes / (1024 * 1024)).toFixed(1);
    } catch (e) {
        return "70.0";
    }
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
            if ((src.endsWith('.mp3') && audioBuffers[src]) || (src.endsWith('.mp4') && assetBlobs[src])) {
                loadedCount++;
                updateProgress();
                return;
            }

            try {
                const response = await fetch(src);
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
    if (state.gachaMuted || !audioBuffers[name]) return null;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const { loop = false, isBGM = false, bgmType = null, offset = 0, volume = 1.0 } = options;

    if (bgmType) stopBGM(bgmType);

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
    if (type === 'all') {
        Object.keys(activeNodes).forEach(key => {
            try { activeNodes[key].stop(); } catch(e) {}
            delete activeNodes[key];
        });
        return;
    }
    if (activeNodes[type]) {
        try { activeNodes[type].stop(); } catch(e) {}
        delete activeNodes[type];
    }
}

export function playMainBGM() {
    playSound('bgm/mainbgm.mp3', { loop: true, isBGM: true, bgmType: 'main' });
}
