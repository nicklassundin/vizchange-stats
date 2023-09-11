const https = require("https");
let stations = {
    abisko: { latitude: 18.8166, longitude: 68.3538 },
    pavlopetri: { latitude: 22.98865, longitude: 36.51698 },
    glob: { latitude: 22.98865, longitude: 36.51698 },
    nhem: { latitude: 22.98865, longitude: 36.51698 },
    'calm': { latitude: 18.33333333, longitude: 68.4263889 }, //radius=300000
    '64n-90n': { latitude: 22.98865, longitude: 36.51698 },
    'tornetrask': { latitude: 19.723333333333333, longitude: 68.22555555555556 },
    'heliport': { latitude: 18.795555555555556, longitude: 68.3644444 },
    'katterjokk': { latitude: 18.1747222222222, longitude: 68.4252778 },
    'kursflaket': { latitude: 18.878333333333334, longitude: 68.3513889 },
    'lakta': { latitude: 18.33333333, longitude: 68.4263889 },
    'mellanflaket': { latitude: 18.964166666667, longitude: 68.3480556 },
    'narkevaere': { latitude: 19.76583333333, longitude: 68.1977778 },
    'storflaket': { latitude: 18.96527777778, longitude: 68.3475 },
    'bergfors': { latitude: 19.762777777778, longitude: 68.1455556 }
}

module.exports = {
    getStation: async function(id) {
        let station = undefined;
        if(stations[id] !== undefined){
            station = Object.assign({}, stations[id]);
        }else if(!Number.isInteger(id) && stations[id.replace('ö', 'o').replace('ä', 'a').replace('å', 'a')] !== undefined){
            station = Object.assign({}, stations[id.replace('ö', 'o').replace('ä', 'a').replace('å', 'a')])
        }else{
            return this.getSmhiStation(id);
        }
        return Promise.resolve(station)
    },
    getSmhiStation: async function(id){
        return await new Promise((result, reject) => {
            let host = `https://opendata-download-metobs.smhi.se`
            let path = `/api/version/1.0/parameter/1/station/${id}.json`
            https.get(`${host}${path}`,(res) => {
                let body = "";

                res.on("data", (chunk) => {
                    body += chunk;
                });

                res.on("end", () => {
                    try {
                        let json = JSON.parse(body);
                        result({
                            latitude: json.position[0].latitude,
                            longitude: json.position[0].longitude
                        })
                        result(`?position=${json.position[0].latitude},${json.position[0].longitude}`)
                    } catch (error) {
                        console.error(error.message);
                        reject(error)
                    }

                });


            }).on("error", (error) => {
                console.error(error.message);
            });
        })
    }
}