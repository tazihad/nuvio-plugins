// test_dhakaflix.js
const scraper = require('./dhakaflix.js');

async function runTests() {
    console.log("🚀 Starting Dhakaflix Scraper Validation...\n");

    // Mock Queries matching Nuvio core payload signatures
    const testCases = [
        {
            name: "Movie Test (HD & SD Fallbacks)",
            query: { title: "Inception", type: "movie" }
        },
        {
            name: "TV Show/Series Test (Season & Episode Structure)",
            query: { title: "Breaking Bad", type: "series", season: 1, episode: 5 }
        },
        {
            name: "Live IPTV Channel Routing Test",
            query: { title: "Somoy TV", type: "tv", isLive: true }
        }
    ];

    for (const tc of testCases) {
        console.log(`--------------------------------------------------`);
        console.log(`🧪 Running Test Case: ${tc.name}`);
        console.log(`Parameters:`, JSON.stringify(tc.query, null, 2));

        try {
            const streams = await scraper.scrap(tc.query);

            if (!Array.isArray(streams)) {
                console.error("❌ FAIL: Scraper did not return an array.");
                continue;
            }

            console.log(`✅ SUCCESS: Found ${streams.length} stream definitions.`);

            streams.forEach((stream, idx) => {
                console.log(`\n  [Stream #${idx + 1}]`);
                console.log(`  Provider: ${stream.provider}`);
                console.log(`  Title:    ${stream.title}`);
                console.log(`  Quality:  ${stream.quality}`);
                console.log(`  Format:   ${stream.format}`);
                console.log(`  Endpoint: ${stream.url}`);
            });

        } catch (err) {
            console.error(`❌ CRITICAL ERROR during execution: ${err.message}`);
        }
        console.log(`--------------------------------------------------\n`);
    }
}

runTests();
