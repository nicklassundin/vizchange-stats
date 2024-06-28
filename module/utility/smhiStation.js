const https = require('https');

const getSmhiStation = async (id) => {
    const host = 'https://opendata-download-metobs.smhi.se';
    const path = `/api/version/1.0/parameter/1/station/${id}.json`;
    return new Promise((resolve, reject) => {
        https.get(`${host}${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(`?position=${json.position[0].latitude},${json.position[0].longitude}`);
                } catch (error) {
                    console.error(error.message);
                    reject(error);
                }
            });
        }).on('error', error => {
            console.error(error.message);
            reject(error);
        });
    });
};

module.exports = getSmhiStation;
