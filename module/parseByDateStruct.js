const Struct = require('./struct.js');
const help = require('climate-plots-helper');
// const keys = Object.keys(values[0]),
module.exports = class ByDateStruct {
	constructor(type = 'avg', custom, specs) {
		this.specs = specs;
		this.type = type;
		this.values = {};
		this.parsed = {};
		this.years = {};
	}
	"insert"(full, kn, ...k) {
		let specs = JSON.parse(JSON.stringify(this.specs));
		specs.keys = k
		let type = this.type;
		specs.delimiter = kn;

		return Struct.build(specs, kn, type, undefined, full)
	}
	"request" (key) {
		this.parse(key)
		let type = this.type;
		return this.values[key]
	}
	get "monthly" () {
		// DEPRECATED remove TODO should be replaced with month jan example
		return this.request("monthly");
	}
	get "weeks" () {

		return this.request("weeks");

	}
	get "months" () {

		return this.request("months");

	}
	get "weeksExtremeHigh" () {

		return this.request("weeksExtremeHigh");

	}
	get "weeksExtremeHighLim" () {

		return this.request("weeksExtremeHighLim");

	}
	get "yrly" () {
		return this.request('yrly')

	}
	get "yrlyFull" () {

		return this.request("yrlyFull");

	}
	get "dailyExtremeHigh" () {

		return this.request("dailyExtremeHigh");

	}
	get "dailyExtremeMaxLim" () {

		return this.request("dailyExtremeMaxLim");

	}
	get "dailyExtremeMinLim" () {

		return this.request("dailyExtremeMinLim");

	}
	get "yrlySplit" () {

		return this.request("yrlySplit");

	}
	get "decades" () {
		return this.request("decades");
	}
	get "splitDecades" () {
		return this.request("splitDecades");
	}
	get "30period" () {
		return this.request("30period");
	}
	get "customPeriod" () {
		return this.request("customPeriod");
	}
	get "meta" () {

		return this.request("meta");

	}
	get "spring" () {
		return this.request("spring");
	}
	get "summer" () {
		return this.request("summer");
	}
	get "autumn" () {
		return this.request("autumn");
	}
	get "winter" () {
		return this.request("winter");
	}
	get "jan" () { return this.request("jan"); }
	get "feb" () { return this.request("feb"); }
	get "mar" () { return this.request("mar"); }
	get "apr" () { return this.request("apr"); }
	get "may" () { return this.request("may"); }
	get "jun" () { return this.request("jun"); }
	get "jul" () { return this.request("jul"); }
	get "aug" () { return this.request("aug"); }
	get "sep" () { return this.request("sep"); }
	get "oct" () { return this.request("oct"); }
	get "nov" () { return this.request("nov"); }
	get "dec" () { return this.request("dec"); }
	get "yrlyTest" () {
		return this.request("yrlyTest");
	}
	////
	//
	//
	get "last" () {
		return this.request("last");

	}
	get "first" (){
		return this.request("first");

	}
	get "growDays" (){
		return this.request("growDays");
	}
	get "growWeeks" () {

		return this.request("growWeeks");

	}
	get "all" () {
		return this.request('all');
	}
"parse" (key) {
	if(!this.values[key]){
		(new Date()).getTime();
		switch (key) {
			case 'all':
				this.insert(false, 'all')(entry)
				break;
			case 'yrly': 
				this.values[key] = this.insert(false, "yrly", 'year', 'DOY')
				break
			case 'summer':
			case 'winter':
			case 'autumn':
			case 'spring':
				this.values[key] = this.insert(false, key, 'year', 'DOY')
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
				this.values[key] = this.insert(true, key, 'year')
				break;
			case 'weeks':
				this.values[key] = this.insert(true, key, 'year', 'week')
				//this.insert(false, "weeks", entry.year, entry.week)(entry);
				break;
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
				this.values[key] = {
					'allTime': this.insert(false, 'allTime', 'splitMonth'),
					'30Periodyear': this.insert(false, key, '30periodyear', 'splitMonth')
				}
				break;
			case 'splitDecades':
				this.values[key] = {
					'allTime': this.insert(false, 'allTime', 'splitMonth'),
					'splitDecade': this.insert(false, key, 'splitDecade', 'splitMonth')
				}
				break;
			case 'yrlySplit':
				this.values[key] = this.insert(false, key, 'splitYear', 'DOY')
				break;
			case 'yrlyFull':
				this.values[key] = this.insert(true, "yrlyFull", "year");
				break;
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
			case 'default':
				break;
		}
	}
}
};

