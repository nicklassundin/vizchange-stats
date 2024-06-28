const parsePeriod = (date) => {
    try {
        if (typeof date === 'string') date = new Date(date);
        const pad = (value) => value >= 10 ? `${value}` : `0${value}`;
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        return `${year}${month}${day}`;
    } catch (error) {
        throw error;
    }
};
export default parsePeriod;
