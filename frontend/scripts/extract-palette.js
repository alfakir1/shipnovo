/* eslint-disable @typescript-eslint/no-require-imports */
const { Jimp } = require('jimp');
const path = require('path');

async function extractPalette() {
    const logoPath = path.join(__dirname, '../public/brand/logo.png');

    try {
        const image = await Jimp.read(logoPath);
        const w = image.bitmap.width;
        const h = image.bitmap.height;

        const colors = {};

        // Sampling more pixels for better accuracy
        for (let x = 0; x < w; x += 2) {
            for (let y = 0; y < h; y += 2) {
                const pixelHex = image.getPixelColor(x, y);

                // Jimp v1 getPixelColor returns 32-bit int RRGGBBAA
                const r = (pixelHex >> 24) & 0xFF;
                const g = (pixelHex >> 16) & 0xFF;
                const b = (pixelHex >> 8) & 0xFF;
                const a = pixelHex & 0xFF;

                // Ignore transparent or near-white pixels
                if (a < 50) continue;
                if (r > 240 && g > 240 && b > 240) continue;
                if (r < 15 && g < 15 && b < 15) continue; // ignore near black

                const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                colors[hex] = (colors[hex] || 0) + 1;
            }
        }

        const sortedColors = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30);

        console.log("--- Extracted Colors (Dominant) ---");
        sortedColors.forEach(([hex, count]) => {
            console.log(`#${hex}: ${count} samples`);
        });

        const anchors = {
            NAVY: "060F39",
            BLUE: "34558C",
            ORANGE: "EE7011",
            YELLOW: "FEA012"
        };

        console.log("\n--- Nearest Brand Matches ---");
        const finalPalette = {};
        Object.entries(anchors).forEach(([name, targetHex]) => {
            let bestMatch = "";
            let minDiff = Infinity;

            sortedColors.forEach(([hex]) => {
                const diff = colorDistance(hex, targetHex);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestMatch = hex;
                }
            });
            finalPalette[name] = `#${bestMatch}`;
            console.log(`${name}: #${bestMatch} (Target: #${targetHex}, Distance: ${minDiff.toFixed(2)})`);
        });

    } catch (err) {
        console.error("Error processing logo:", err);
    }
}

function colorDistance(hex1, hex2) {
    const r1 = parseInt(hex1.slice(0, 2), 16);
    const g1 = parseInt(hex1.slice(2, 4), 16);
    const b1 = parseInt(hex1.slice(4, 6), 16);

    const r2 = parseInt(hex2.slice(0, 2), 16);
    const g2 = parseInt(hex2.slice(2, 4), 16);
    const b2 = parseInt(hex2.slice(4, 6), 16);

    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

extractPalette();
