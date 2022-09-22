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
		switch (kn) {
			case 'spring':
			case 'summer':
			case 'autumn':
			case 'winter':
				specs.delimiter = kn;
				break;
			default:
		}
		return Struct.build(specs, kn, type, undefined, full)
	}
	"request" (key) {
		// console.log('parseByDateStruct - request key', key)
		this.parse(key)
		let type = this.type;
		return this.values[key]
	}
	get "monthly" () {

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
	// console.log(key)
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
			case 'decades':
				this.insert(false, "decades", 'decade', 'year')(entry);
				break;
			case 'splitDecades':
				this.insert(false, key, 'allTime', 'splitMonth')(entry);
				this.insert(false, key, 'splitDecade', 'splitMonth')(entry);
				break;
			case '30period':
				this.insert(false, key, 'allTime', 'splitMonth')(entry)
				this.insert(false, key, '30periodyear', 'splitMonth')(entry)
				break;
			case 'yrlySplit':
				var splitDOY = ((year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 366 : 365) + entry.DOY;
				this.insert(false, "yrlySplit", entry.splitYear, (entry.splitYear === entry.year ? entry.DOY : splitDOY))(entry);
				break;
			case 'yrlyFull':
				this.values[key] = this.insert(true, "yrlyFull", "year");
				break;
			case 'monthly':
				this.insert(false, "monthly", entry.monthName, entry.year)(entry);
				break
			case 'weeks':
				this.insert(false, "weeks", entry.year, entry.week)(entry);
				break;
			case 'months':
				this.insert(false, "months", entry.year, entry.monthName)(entry);
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
		// console.log("time",(new Date()).getTime()-startTime)
	}
}
};

