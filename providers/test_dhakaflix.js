// test_dhakaflix.js
const scraper = require('./dhakaflix.js');

async function runTests() {
    console.log("🚀 Running Expanded TV Series Validation...\n");

    const testCases = [
        {
            name: "TV Show Test 1: Mixed Case with Spaces (House of the Dragon)",
            args: [{ title: "House of the Dragon" }, "series", 2, 4]
        },
        {
            name: "TV Show Test 2: Standard Sci-Fi Series (The Mandalorian)",
            args: [{ title: "The Mandalorian" }, "series", 3, 1]
        }
    ];

    for (const tc of testCases) {
        console.log(`--------------------------------------------------`);
        console.log(`🧪 Running Test Case: ${tc.name}`);

        try {
            const streams = await scraper.getStreams(...tc.args);

            if (!Array.isArray(streams)) {
                console.error("❌ FAIL: Scraper did not return an array.");
                continue;
            }

            console.log(`✅ SUCCESS: Found ${streams.length} directory path variations.`);

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
