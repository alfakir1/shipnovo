function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex({ r, g, b }) {
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function mix(color1, color2, weight) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    return rgbToHex({
        r: c1.r * (1 - weight) + c2.r * weight,
        g: c1.g * (1 - weight) + c2.g * weight,
        b: c1.b * (1 - weight) + c2.b * weight,
    });
}

const anchors = {
    navy: '#08113A',
    blue: '#223F76',
    orange: '#F77909',
    yellow: '#FDD32A',
    border: '#DCDFE2'
};

const weights = {
    50: 0.95,
    100: 0.85,
    200: 0.65,
    300: 0.45,
    400: 0.25,
    500: 0,
    600: 0.15, // Mix with black
    700: 0.30,
    800: 0.45,
    900: 0.60
};

const results = {};
for (const [name, color] of Object.entries(anchors)) {
    results[name] = {};
    for (const [level, weight] of Object.entries(weights)) {
        if (level < 500) {
            results[name][level] = mix(color, '#FFFFFF', weight);
        } else if (level == 500) {
            results[name][level] = color.toUpperCase();
        } else {
            results[name][level] = mix(color, '#000000', weight);
        }
    }
}

console.log(JSON.stringify(results, null, 2));
