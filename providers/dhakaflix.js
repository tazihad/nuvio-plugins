/**
 * Dhakaflix / SAMOnline BDIX Media Scraper Module for Nuvio
 * Re-architected to match the exact runtime signature of the Nuvio core sandbox environment.
 */

const BASE_URL = "http://172.16.50.14";
const TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

const ENDPOINTS = {
    movies_sd: "http://172.16.50.7/DHAKA-FLIX-7/English%20Movies/",
    movies_hd: "http://172.16.50.14/DHAKA-FLIX-14/English%20Movies%20%281080p%29/",
    series:    "http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/",
    anime:     "http://172.16.50.9/DHAKA-FLIX-9/Anime%20%26%20Cartoon%20TV%20Series/",
    livetv:    "http://172.16.29.28/live"
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        // 1. Resolve Name/Title dynamically via TMDB API context
        const tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`;
        const mediaInfo = await (await fetch(tmdbUrl, { skipSizeCheck: true })).json();
        const title = mediaInfo.title || mediaInfo.name;

        if (!title) return [];

        const streams = [];
        const lowerTitle = encodeURIComponent(title.toLowerCase());
        const titleCased = encodeURIComponent(toTitleCase(title));

        // 2. Handle Live TV IPTV Route mapping
        if (mediaType === 'tv' && !season && !episode) {
            streams.push({
                url: `${ENDPOINTS.livetv}/${lowerTitle}.m3u8`,
                quality: "1080p",
                title: `${title} [BDIX IPTV]`,
                subtitles: []
            });
            return streams;
        }

        // 3. Handle Movie Paths
        if (mediaType === 'movie') {
            streams.push({
                url: `${ENDPOINTS.movies_hd}/ENGLISH%20MOVIES%20%281080P%29/${titleCased}.mkv`,
                quality: "1080p",
                title: `DhakaFlix [${title} - 1080p Bluray]`,
                subtitles: []
            });

            streams.push({
                url: `${ENDPOINTS.movies_hd}/ENGLISH%20MOVIES%20%281080P%29/${lowerTitle}.mkv`,
                quality: "1080p",
                title: `DhakaFlix [${title} - 1080p Alt]`,
                subtitles: []
            });

            streams.push({
                url: `${ENDPOINTS.movies_sd}/ENGLISH%20MOVIES/${titleCased}.mp4`,
                quality: "720p",
                title: `DhakaFlix [${title} - 720p BRRip]`,
                subtitles: []
            });

            // SAMOnline Direct FTP Backup
            streams.push({
                url: `http://172.16.50.4/Movies/${titleCased}.mkv`,
                quality: "Source",
                title: `SAMOnline FTP [${title}]`,
                subtitles: []
            });
        }

        // 4. Handle TV Show / Series Paths
        else if (mediaType === 'series' || mediaType === 'tv') {
            const padS = String(season || 1).padStart(2, '0');
            const padE = String(episode || 1).padStart(2, '0');
            const seasonStr = `Season%20${padS}`;
            const episodeStr = `E${padE}`;

            streams.push({
                url: `${ENDPOINTS.series}/${titleCased}/${seasonStr}/${episodeStr}.mkv`,
                quality: "720p",
                title: `DhakaFlix [${title} - S${padS}${episodeStr}]`,
                subtitles: []
            });

            streams.push({
                url: `${ENDPOINTS.series}/${lowerTitle}/${seasonStr}/${episodeStr}.mkv`,
                quality: "720p",
                title: `DhakaFlix [${title} - S${padS}${episodeStr} Alt]`,
                subtitles: []
            });
        }

        return streams;

    } catch (e) {
        console.error("[DhakaFlix Engine Error]", e);
        return [];
    }
}

module.exports = { getStreams };
