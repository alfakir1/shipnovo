#!/bin/bash
# ShipNovo Color Enforcement Script

COLOR_PATTERNS="bg-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-|text-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-|border-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-"

echo "🔍 Checking for non-brand colors..."

# Search files excluding certain directories
grep -rnE "$COLOR_PATTERNS" . \
    --exclude-dir={.next,node_modules,.git,public} \
    --include=\*.{tsx,ts,css}

if [ $? -eq 0 ]; then
    echo -e "\n\033[0;31m⚠️ Color check FAILED. Please use brand tokens instead of default Tailwind colors.\033[0m"
    exit 1
else
    echo -e "\n\033[0;32m✅ Color check PASSED. All colors seem to follow the brand identity.\033[0m"
    exit 0
fi
