// Only the large PSSR cutscene collection is hosted as GitHub Release assets.
// The small set of shared gacha media stays on Pages for same-origin loading.
const GACHA_MEDIA_RELEASE_BASE =
    'https://github.com/happyMilleFeuille/gakumas/releases/download/media-v1/';

export function getMediaUrl(path) {
    if (typeof path !== 'string') return path;

    const pathWithoutQuery = path.split(/[?#]/, 1)[0].replace(/\\/g, '/');
    if (!pathWithoutQuery.startsWith('gasya/pssr/')) return path;

    const fileName = pathWithoutQuery.slice(pathWithoutQuery.lastIndexOf('/') + 1);
    return `${GACHA_MEDIA_RELEASE_BASE}${encodeURIComponent(fileName)}`;
}
