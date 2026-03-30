/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

console.log("🔍 Checking for forbidden Tailwind color classes...");

const forbiddenFamilies = [
    'red', 'green', 'blue', 'yellow', 'purple', 'pink', 'indigo', 'teal', 'cyan',
    'slate', 'gray', 'zinc', 'neutral', 'stone'
];

const patterns = [
    new RegExp(`bg-(${forbiddenFamilies.join('|')})-\\d+`, 'g'),
    new RegExp(`text-(${forbiddenFamilies.join('|')})-\\d+`, 'g'),
    new RegExp(`border-(${forbiddenFamilies.join('|')})-\\d+`, 'g')
];

const searchDirs = ['app', 'components', 'lib'];
const excludedFiles = ['globals.css', 'extract-palette.js', 'check-colors.ps1', 'check-colors.js'];

let foundIssues = false;

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (stat.isFile() && /\.(tsx|ts|css)$/.test(file)) {
            if (excludedFiles.includes(file)) continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            let fileHasIssue = false;

            patterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    if (!fileHasIssue) {
                        console.error(`❌ FAIL: Found forbidden color classes in ${fullPath}:`);
                        fileHasIssue = true;
                        foundIssues = true;
                    }
                    matches.forEach(m => console.error(`   Found: ${m}`));
                }
            });
        }
    }
}

searchDirs.forEach(scanDir);

if (foundIssues) {
    console.log("\n--------------------------------------------------------");
    console.log("Please use ShipNovo brand tokens instead (e.g., bg-brand-navy, text-brand-orange, bg-card, etc.).");
    process.exit(1);
} else {
    console.log("✅ PASS: No forbidden color classes found.");
    process.exit(0);
}
