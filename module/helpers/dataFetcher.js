// dataFetcher.js
const axios = require('axios').create();

const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

module.exports = {
    fetchData
};
