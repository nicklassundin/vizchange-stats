const ByDateStruct = require('./module/parseByDateStruct.js');
const axios = require('axios').create();

const parseByDate = (specs, type = 'avg', custom) => {
	return new Promise((resolve, reject) => {
		try {
			let struct = new ByDateStruct(type, custom, specs);
			resolve(struct);
		} catch (error) {
			reject(error);
		}
	}).catch(() => []);
};

module.exports = {
	precalcCached: {},
	cache: {},
	getByParams(specs, params) {
		return this.recursive(params, this[params[0]](specs).then(result => result.request(params[1])));
	},
	getByParamsPreCalculated(specs, params) {
		let struct = axios.get(`${specs.url}/precalculated/${specs.station}/${params.join('/')}?start=${specs.dates.start}&end=${specs.dates.end}&baselineStart=${specs.baseline.start}&baselineEnd=${specs.baseline.end}`);

		let key = `${specs.type}${specs.dates.start}${specs.dates.end}${specs.baseline.start}${specs.baseline.end}`;
		if (!this.precalcCached[specs.station]) {
			this.precalcCached[specs.station] = {};
		}
		if (!this.precalcCached[specs.station][key]) {
			this.precalcCached[specs.station][key] = {};
		}
		this.precalcCached[specs.station][key] = Object.assign(this.precalcCached[specs.station][key], params.reverse().reduce((all, current) => {
			let res = {};
			res[current] = all;
			return res;
		}, struct), true);
		return struct;
	},

	recursive(params, data, index = 2) {
		if (params.length - index === 1) {
			return data.then ? data.then(results => results[params[index]]) : data[params[index]];
		} else if (params.length - index < 1) {
			return data;
		} else if (data.then) {
			return data.then(values => {
				if (typeof values[params[index]] === 'function') {
					return this.recursive(params, values[params[index]](params[index + 1]), index + 2);
				}
				return this.recursive(params, values[params[index]], index + 1);
			});
		} else if (typeof data === 'function') {
			return this.recursive(params, data(params[index]), index + 1);
		} else {
			return this.recursive(params, data[params[index]], index + 1);
		}
	},

	clear() {
		this.cache = {};
		return this;
	},

	getStruct(specs, type) {
		let key = `${specs.type}${specs.dates.start}${specs.dates.end}${specs.baseline.start}${specs.baseline.end}`;
		if (!this.cache[specs.station]) {
			this.cache[specs.station] = {};
		}
		if (!this.cache[specs.station][key]) {
			this.cache[specs.station][key] = parseByDate(specs, type);
		}
		return this.cache[specs.station][key];
	},

	temperature(specs) {
		return this.getStruct(specs);
	},

	precipitation(specs) {
		return this.getStruct(specs, 'sum');
	},

	snowdepth_single(specs) {
		return this.getStruct(specs);
	},

	complete_ice_cover(specs) {
		return this.getStruct(specs);
	},

	perma(specs) {
		return this.getStruct(specs);
	},

	icetime(specs) {
		return this.getStruct(specs);
	},

	breakup(specs) {
		return this.getStruct(specs);
	},

	freezeup(specs) {
		return this.getStruct(specs);
	},

	co2_weekly(specs) {
		return this.getStruct(specs);
	},

	configs: require('./config')
};
