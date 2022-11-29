const Struct = require('./struct.js');
module.exports = class ByDateStruct {
	constructor(type = 'avg', custom, specs) {
		this.specs = specs;
		this.type = type;
		this.values = {};
		this.parsed = {};
		this.years = {};
	}
	//insert"(full, kn, ...k) {
	"insert"(full, ...k) {
		let specs = JSON.parse(JSON.stringify(this.specs));
		specs.keys = k
		let type = this.type;
//		return Struct.build(specs, kn, type, undefined, full)
		return Struct.build(specs, k[0], type, undefined, full)
	}
	"request" (key) {
		this.parse(key)
		return this.values[key]
	}
"parse" (key) {
	if(!this.values[key]){
		(new Date()).getTime();
		switch (key) {
			case 'all':
				this.values[key] = this.insert(true, 'all')
				break;
			case 'yrly':
				// TODO check value 1914 for full: true vs false
				this.values[key] = this.insert(true, "yrly", 'year', 'DOY')
				break
			case 'summer':
			case 'winter':
			case 'autumn':
			case 'spring':
				this.values[key] = this.insert(false, key, 'year')
				break;
			case 'jan':
			case 'feb':
			case 'mar':
			case 'apr':
			case 'may':
			case 'jun':
			case 'jul':
			case 'aug':
			case 'sep':
			case 'oct':
			case 'nov':
			case 'dec':
				this.values[key] = this.insert(false, key, 'year')
				break;
			case 'weekly':
				this.values[key] = this.insert(false, key, 'year', 'week')
				break;
			//case 'weeks':
			//	this.values[key] = this.insert(true, key, 'year', 'week')
			//	break;
			case 'monthly':
				// deprecated TODO
				this.values[key] = this.insert(false, key, 'month', 'year')
				break;
			case 'months':
				this.values[key] = this.insert(true, key, "year", "month")
				//this.insert(false, "months", entry.year, entry.monthName)(entry);
				break;
			case 'decades':
				this.values[key] = this.insert(false, key, 'decade', 'year')
				//this.insert(false, "decades", 'decade', 'year')(entry);
				break;
			case '30period':
				/*
				this.values[key] = {
					'allTime': this.insert(false, 'allTime', 'splitMonth'),
					'30Periodyear': this.insert(false, key, '30periodyear', 'splitMonth')
				}
				break;
				 */
			case 'splitDecades':
				this.values[key] = this.insert(true, key, 'splitMonth', 'decade')
				break;
			case 'yrlySplit':
				this.values[key] = this.insert(false, key, 'splitYear', 'DOY')
				break;
			case 'yrlyFull':
				this.values[key] = this.insert(true, "yrlyFull", "year", 'DOY');
				break;
			/*
			case 'custom':
				if (this.custom) {

					if (!this.values.customPeriod) {

						this.values.customPeriod = {};

					}
					const pkey = custom(date);
					if (pkey) {

						if (!this.values.customPeriod[pkey]) {

							this.values.customPeriod[pkey] = new Struct(
								[],
								pkey,
								type
							);

						}
						this.values.customPeriod[key].values.push(entry);

					}

				}
				break;
				 */
			case 'default':
				break;
		}
	}
}
};

