/**
 * Dhakaflix / SAMOnline BDIX Media Scraper Module for Nuvio
 * Re-architected for strict Nuvio sandbox compliance (No async/await, exports getStreams)
 */

const P_MAIN = "dhakaflix-main";
const P_LIVETV = "dhakaflix-livetv";
const P_FTP = "samonline-ftp";

const ENDPOINTS = {
    movies_sd: "http://172.16.50.14/DHAKA-FLIX-7",
    movies_hd: "http://172.16.50.14/DHAKA-FLIX-14",
    series:    "http://172.16.50.12/TV-WEB-SERIES",
    anime:     "http://172.16.50.12/ANIME-CARTOON",
    livetv:    "http://172.16.29.28/live"
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Core Nuvio Entry Method
 * @param {string} tmdbId - Target Media ID
 * @param {string} mediaType - Type of media ('movie', 'tv', 'series')
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 */
function getStreams(tmdbId, mediaType, season, episode) {
    return new Promise(function(resolve, reject) {
        var results = [];

        // Fallback translation if Nuvio passes Title in an object structure or metadata
        var titleQuery = "";
        if (typeof tmdbId === 'object' && tmdbId.title) {
            titleQuery = tmdbId.title.trim();
        } else if (global.currentMediaTitle) {
            titleQuery = global.currentMediaTitle; // Fallback helper hook
        } else {
            // If Nuvio passes an ID, we assume standard matching hook.
            // Note: For local offline metadata title string resolution, ensure your context includes query strings.
            titleQuery = tmdbId;
        }

        var lowerTitle = encodeURIComponent(titleQuery.toLowerCase());
        var titleCased = encodeURIComponent(toTitleCase(titleQuery));

        try {
            // 1. Live TV Configuration Map
            if (mediaType === 'tv' && !season && !episode) {
                results.push({
                    provider: P_LIVETV,
                    title: titleQuery + " [BDIX IPTV]",
                    url: ENDPOINTS.livetv + "/" + lowerTitle + ".m3u8",
                    quality: "1080p",
                    format: "m3u8",
                        isLive: true
                });
                return resolve(results);
            }

            // 2. Movie Architecture Map
            if (mediaType === 'movie') {
                results.push({
                    provider: P_MAIN,
                    title: titleQuery + " (1080p Bluray) [DhakaFlix]",
                             url: ENDPOINTS.movies_hd + "/ENGLISH%20MOVIES%20%281080P%29/" + titleCased + ".mkv",
                             quality: "1080p",
                             format: "mkv"
                });

                results.push({
                    provider: P_MAIN,
                    title: titleQuery + " (1080p Alt) [DhakaFlix]",
                             url: ENDPOINTS.movies_hd + "/ENGLISH%20MOVIES%20%281080P%29/" + lowerTitle + ".mkv",
                             quality: "1080p",
                             format: "mkv"
                });

                results.push({
                    provider: P_MAIN,
                    title: titleQuery + " (720p BRRip) [DhakaFlix]",
                             url: ENDPOINTS.movies_sd + "/ENGLISH%20MOVIES/" + titleCased + ".mp4",
                             quality: "720p",
                             format: "mp4"
                });
            }

            // 3. TV / Series Architecture Map
            else if (mediaType === 'series' || mediaType === 'tv') {
                var padS = String(season || 1).padStart(2, '0');
                var padE = String(episode || 1).padStart(2, '0');
                var seasonStr = "Season%20" + padS;
                var episodeStr = "E" + padE;

                results.push({
                    provider: P_MAIN,
                    title: titleQuery + " - " + episodeStr + " [DhakaFlix Series]",
                    url: ENDPOINTS.series + "/" + titleCased + "/" + seasonStr + "/" + episodeStr + ".mkv",
                    quality: "720p",
                    format: "mkv"
                });

                results.push({
                    provider: P_MAIN,
                    title: titleQuery + " - " + episodeStr + " (Alt) [DhakaFlix Series]",
                             url: ENDPOINTS.series + "/" + lowerTitle + "/" + seasonStr + "/" + episodeStr + ".mkv",
                             quality: "720p",
                             format: "mkv"
                });
            }

            resolve(results);

        } catch (error) {
            console.log("[DhakaFlix Sandbox Error] " + error.message);
            resolve([]); // Always resolve an empty array on catch so the core thread doesn't hang
        }
    });
}

module.exports = { getStreams };
