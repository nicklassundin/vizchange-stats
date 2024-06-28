// dataFetcher.js
import axios from 'axios';
const connection = axios.create();

const fetchData = async (url) => {
    try {
        const response = await connection.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

export default {
    fetchData
};
