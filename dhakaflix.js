/**
 * Dhakaflix / SAMOnline BDIX Media Scraper Module for Nuvio
 * Optimized with title casing fallbacks for strict BDIX file paths.
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

// Helper to convert "breaking bad" -> "Breaking%20Bad"
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

module.exports = {
    async scrap(query) {
        const results = [];
        const rawTitle = query.title.trim();

        // Path variations to combat strict BDIX server file systems
        const lowerTitle = encodeURIComponent(rawTitle.toLowerCase());
        const titleCased = encodeURIComponent(toTitleCase(rawTitle));

        try {
            // 1. Live TV Streams
            if (query.type === 'tv' && query.isLive) {
                results.push({
                    provider: P_LIVETV,
                    title: `${rawTitle} [BDIX IPTV]`,
                    url: `${ENDPOINTS.livetv}/${lowerTitle}.m3u8`,
                    quality: "1080p",
                    format: "m3u8",
                        isLive: true
                });
                return results;
            }

            // 2. Movies
            if (query.type === 'movie') {
                // Primary Candidate: Title Case (Most BDIX FTPs store as "Inception.mkv")
                results.push({
                    provider: P_MAIN,
                    title: `${rawTitle} (1080p Bluray) [DhakaFlix]`,
                             url: `${ENDPOINTS.movies_hd}/ENGLISH%20MOVIES%20%281080P%29/${titleCased}.mkv`,
                             quality: "1080p",
                             format: "mkv"
                });

                // Lowercase Fallback
                results.push({
                    provider: P_MAIN,
                    title: `${rawTitle} (1080p Alternate Link) [DhakaFlix]`,
                             url: `${ENDPOINTS.movies_hd}/ENGLISH%20MOVIES%20%281080P%29/${lowerTitle}.mkv`,
                             quality: "1080p",
                             format: "mkv"
                });

                // SD Mirror
                results.push({
                    provider: P_MAIN,
                    title: `${rawTitle} (720p BRRip) [DhakaFlix]`,
                             url: `${ENDPOINTS.movies_sd}/ENGLISH%20MOVIES/${titleCased}.mp4`,
                             quality: "720p",
                             format: "mp4"
                });
            }

            // 3. Series
            else if (query.type === 'series' || query.type === 'tv') {
                const seasonStr = query.season ? `Season%20${String(query.season).padStart(2, '0')}` : 'Season%2001';
                const episodeStr = query.episode ? `E${String(query.episode).padStart(2, '0')}` : 'E01';

                // Add both common configurations found on SAMOnline's indexing script
                results.push({
                    provider: P_MAIN,
                    title: `${rawTitle} - ${episodeStr} [DhakaFlix Series]`,
                    url: `${ENDPOINTS.series}/${titleCased}/${seasonStr}/${episodeStr}.mkv`,
                    quality: "720p",
                    format: "mkv"
                });

                results.push({
                    provider: P_MAIN,
                    title: `${rawTitle} - ${episodeStr} (Alt Folder) [DhakaFlix Series]`,
                             url: `${ENDPOINTS.series}/${lowerTitle}/${seasonStr}/${episodeStr}.mkv`,
                             quality: "720p",
                             format: "mkv"
                });
            }

        } catch (error) {
            console.error(`[DhakaFlix Error] ${error.message}`);
        }

        return results;
    }
};
