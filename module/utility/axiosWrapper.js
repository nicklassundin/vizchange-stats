import axios from 'axios';
import http from 'http';
import hashCode from './hashCode.js'

const connection = axios.create({
    httpAgent: new (http.Agent)({
        scheduling: 'fifo',
        maxSockets: 1,
        maxTotalSockets: 1,
    }),
});

const cachedRequests = {};

const axiosWrapper = async (url) => {
    const path = `${hashCode(url)}.json`;

    console.time(`Request Time: ${url}`);
    if (!cachedRequests[url]) {
        cachedRequests[url] = connection.get(url).then(result => {
            //console.timeEnd(`Request Time: ${url}`);

            if (result && result.data) result = result.data;
            if (Array.isArray(result)) {
                result = result.map(each => {
                    Object.keys(each).forEach(key => {
                        if (!['position', 'station', 'date'].includes(key) && typeof each[key] === 'string') {
                            each[key] = each[key].replace(',', '.');
                        }
                    });
                    return each;
                });
            }
            return result;
        }).catch(error => {
            //console.timeEnd(`Request Time: ${url}`);
            return Promise.reject(error);
        });
    }
    return cachedRequests[url];
};

export default axiosWrapper;
