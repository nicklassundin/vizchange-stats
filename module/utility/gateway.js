const preset = require('./preset');
const getSmhiStation = require('./smhiStation');
const parsePeriod = require('./parsePeriod');
const axiosWrapper = require('./axiosWrapper');

module.exports = {
	preset,
	async proxRequest(specs, full = false, sort) {
		const { station: rawStation, dates, url: host, type } = specs;
		const station = rawStation.replace(/å|ä/g, 'a').replace('ö', 'o');
		let url = `&date=${parsePeriod(dates.start)}-${parsePeriod(dates.end)}`;

		if (!preset.station[station]) {
			url = `?position=${specs.coordinates.latitude},${specs.coordinates.longitude}&radius=30${url}`;
		} else {
			url = `${preset.station[station]}${url}`;
		}

		if (['glob', '64n-90n', 'nhem'].includes(station) && ['glob_temp', 'nhem_temp', '64n-90n_temp', 'temperature'].includes(type)) {
			url = `${url}&types=${preset.types[station + type]}`;
		} else if (type) {
			url = `${url}&types=${preset.types[type] || type}`;
		}

		return full ? axiosWrapper(`${host}${url}`) : axiosWrapper(`${host}${url}&calculate`);
	},
	number: 0,
	cached: {},
};
