// Large gacha media is hosted as GitHub Release assets so the Pages artifact
// stays below GitHub's 1 GiB published-site limit.
const GACHA_MEDIA_RELEASE_BASE =
    'https://github.com/happyMilleFeuille/gakumas/releases/download/media-v1/';

export function getMediaUrl(path) {
    if (typeof path !== 'string') return path;

    const pathWithoutQuery = path.split(/[?#]/, 1)[0].replace(/\\/g, '/');
    if (!pathWithoutQuery.startsWith('gasya/')) return path;

    const fileName = pathWithoutQuery.slice(pathWithoutQuery.lastIndexOf('/') + 1);
    return `${GACHA_MEDIA_RELEASE_BASE}${encodeURIComponent(fileName)}`;
}
