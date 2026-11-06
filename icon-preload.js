// icons 폴더 바로 아래의 이미지만 포함한다. 하위 폴더는 의도적으로 제외한다.
export const ROOT_ICON_PATHS = Object.freeze([
    'icons/1st.webp',
    'icons/2nd.webp',
    'icons/3rd.webp',
    'icons/anomaly.webp',
    'icons/assist.webp',
    'icons/caculation.svg',
    'icons/calendar.svg',
    'icons/card.svg',
    'icons/carduseplus.webp',
    'icons/check-square.svg',
    'icons/cloud.svg',
    'icons/concentration.webp',
    'icons/crown.webp',
    'icons/cuthp.webp',
    'icons/dance.webp',
    'icons/download-cloud.svg',
    'icons/download.svg',
    'icons/enthusiasm.webp',
    'icons/file-text.svg',
    'icons/filter.svg',
    'icons/flower.webp',
    'icons/flowerback.webp',
    'icons/free.webp',
    'icons/fullpower.webp',
    'icons/fullpowerparam.webp',
    'icons/gasha.svg',
    'icons/gasya.png',
    'icons/genki.webp',
    'icons/goodcondition.webp',
    'icons/goodimpression.webp',
    'icons/hif.webp',
    'icons/home.svg',
    'icons/hpper.webp',
    'icons/hprecovery.webp',
    'icons/hpreduce.webp',
    'icons/icon16x16.png',
    'icons/icon192x192.png',
    'icons/icon32x32.png',
    'icons/icon48x48.png',
    'icons/idol.svg',
    'icons/info.svg',
    'icons/itemplus.webp',
    'icons/jewel.png',
    'icons/kyoukagekkan.webp',
    'icons/linktitle.png',
    'icons/linktitle.webp',
    'icons/list.svg',
    'icons/logic.webp',
    'icons/minus.svg',
    'icons/motivation.webp',
    'icons/netui.webp',
    'icons/nia.webp',
    'icons/nonbiri.webp',
    'icons/pie-chart.svg',
    'icons/play-circle.svg',
    'icons/plus.svg',
    'icons/preservation.webp',
    'icons/pride.webp',
    'icons/primastella.webp',
    'icons/r.png',
    'icons/saien.webp',
    'icons/sainou.webp',
    'icons/save.svg',
    'icons/sense.webp',
    'icons/sp_icon.webp',
    'icons/sr.png',
    'icons/ssr.png',
    'icons/title.webp',
    'icons/train.webp',
    'icons/trash.svg',
    'icons/upload-cloud.svg',
    'icons/upload.svg',
    'icons/user.svg',
    'icons/visual.webp',
    'icons/vocal.webp',
    'icons/volume.svg',
    'icons/volumeoff.svg',
    'icons/volumeon.svg',
    'icons/x.svg',
    'icons/youtube.svg'
]);

const loadedRootIcons = new Set();
let activePreloadPromise = null;

function preloadIcon(path) {
    return new Promise(resolve => {
        const image = new Image();
        let settled = false;
        const finish = loaded => {
            if (settled) return;
            settled = true;
            image.removeEventListener('load', handleLoad);
            image.removeEventListener('error', handleError);
            if (loaded) loadedRootIcons.add(path);
            resolve();
        };
        const handleLoad = () => finish(true);
        const handleError = () => finish(false);

        image.decoding = 'async';
        image.addEventListener('load', handleLoad, { once: true });
        image.addEventListener('error', handleError, { once: true });
        image.src = new URL(path, import.meta.url).href;
    });
}

export function preloadRootIcons() {
    if (activePreloadPromise) return activePreloadPromise;

    const pendingPaths = ROOT_ICON_PATHS.filter(path => !loadedRootIcons.has(path));
    if (pendingPaths.length === 0) return Promise.resolve();

    let nextIndex = 0;
    const workerCount = Math.min(6, pendingPaths.length);
    const runWorker = async () => {
        while (nextIndex < pendingPaths.length) {
            const path = pendingPaths[nextIndex++];
            await preloadIcon(path);
        }
    };

    activePreloadPromise = Promise.all(Array.from({ length: workerCount }, runWorker))
        .finally(() => {
            activePreloadPromise = null;
        });
    return activePreloadPromise;
}
