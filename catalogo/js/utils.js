const DEFAULT_YOUTUBE_ID = '7RUA0IOfar8';

function randomInt(min, max, rng = Math.random) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function getYouTubeId(url, defaultId = DEFAULT_YOUTUBE_ID) {
    if (!url) return defaultId;
    if (url.includes('v=')) {
        return url.split('v=')[1].split('&')[0];
    }
    return url.split('/').pop();
}

export function getRandomMatchScore(rng = Math.random) {
    return randomInt(80, 99, rng);
}

export function getRandomDuration(hasProgress, rng = Math.random) {
    return hasProgress ? '10 temporadas' : `2h ${randomInt(0, 59, rng)}m`;
}

export function getRandomAgeBadge(rng = Math.random) {
    return rng() > 0.5 ? { text: 'A16', class: 'red-accent' } : { text: '16', class: '' };
}
