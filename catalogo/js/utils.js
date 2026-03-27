const DEFAULT_YOUTUBE_ID = '7RUA0IOfar8';

function randomInt(min, max, rng = Math.random) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

export function getYouTubeId(url, defaultId = DEFAULT_YOUTUBE_ID) {
    if (!url) {
        return defaultId;
    }

    const rawValue = String(url).trim();
    let parsedUrl = null;

    try {
        parsedUrl = new URL(rawValue);
    } catch {
        parsedUrl = null;
    }

    if (parsedUrl) {
        const host = parsedUrl.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            const id = parsedUrl.pathname.split('/').find(Boolean);
            return id || defaultId;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const watchId = parsedUrl.searchParams.get('v');
            if (watchId) {
                return watchId;
            }

            const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
            const markerIndex = pathParts.findIndex((part) => part === 'shorts' || part === 'embed' || part === 'live');

            if (markerIndex !== -1 && pathParts[markerIndex + 1]) {
                return pathParts[markerIndex + 1];
            }
        }
    }

    const youtubeIdPattern = /([A-Za-z0-9_-]{11})/;
    const fallbackMatch = youtubeIdPattern.exec(rawValue);
    return fallbackMatch ? fallbackMatch[1] : defaultId;
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
