import Struct from './Struct.js';

export default class ByDateStruct {
	constructor(type = 'avg', custom, specs, preCalculated) {
		this.specs = specs;
		this.type = type;
		this.values = {};
		this.parsed = {};
		this.years = {};
	}

	insert(full, ...k) {
		const specs = { ...this.specs, keys: k };
		const type = this.type;
		return Struct.build(specs, k[0], type, undefined, full);
	}

	request(key) {
		this.parse(key);
		return this.values[key];
	}

	parse(key) {
		if (!this.values[key]) {
			const startTime = Date.now(); // Record the start time

			const seasonalKeys = ['summer', 'winter', 'autumn', 'spring'];
			const monthlyKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

			if (seasonalKeys.includes(key)) {
				this.values[key] = this.insert(false, key, 'year');
				return;
			}

			if (monthlyKeys.includes(key)) {
				this.values[key] = this.insert(false, key, 'year');
				return;
			}

			switch (key) {
				case 'all':
					this.values[key] = this.insert(true, 'all');
					break;
				case 'yrly':
					this.values[key] = this.insert(true, 'yrly', 'year', 'DOY');
					break;
				case 'weekly':
					this.values[key] = this.insert(true, 'weekly', 'year', 'week');
					break;
				case 'monthly':
					this.values[key] = this.insert(false, 'monthly', 'month', 'year');
					break;
				case 'months':
					this.values[key] = this.insert(true, 'months', 'year', 'month');
					break;
				case 'decades':
					this.values[key] = this.insert(false, 'decades', 'decade', 'year');
					break;
				case 'splitDecades':
					this.values[key] = this.insert(true, 'splitDecades', 'splitMonth', 'decade');
					break;
				case 'yrlySplit':
					this.values[key] = this.insert(false, 'yrlySplit', 'splitYear', 'DOY');
					break;
				case 'yrlyFull':
					this.values[key] = this.insert(true, 'yrlyFull', 'year', 'DOY');
					break;
				case 'default':
					break;
				default:
					break;
			}
		}
	}
};
