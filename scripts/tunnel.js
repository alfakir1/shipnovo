const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
    const tunnel = await localtunnel({ port: 8000 });
    console.log('Tunnel started at:', tunnel.url);
    fs.writeFileSync('backend_url.txt', tunnel.url);

    tunnel.on('close', () => {
        console.log('Tunnel closed');
    });
})();
