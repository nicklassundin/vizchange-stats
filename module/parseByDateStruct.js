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
		let specs = this.specs;
		specs.keys = k
		let type = this.type;
		return Struct.build(specs, kn, type, undefined, full)
		// return (entry) => {
			// k = k.map(key => {
				// if(entry[key] != undefined) return entry[key]
				// return key
			// })
			// if(kn) k.unshift(kn)
			// this.values = this.recInsert(entry,k) 
		// }

	}
	// "recInsert" (entry, k, data = this.values) {
	// 	let kn = k[0];
	// 	if(kn === undefined){
	// 		// return data;
	// 	}
	// 	if(!data[kn]) {
	// 		if (k.length > 1) {
	// 			data[kn] = this.recInsert(entry, k.slice(1), {});
	// 		} else {
	// 			data[kn] = new Struct(
	// 				[],
					// kn,
					// this.type
				// );
				// if(k[0].valueOf() == 'DOY'.valueOf() && entry.req[`avg_${entry.type}`] != undefined){
					// data[kn].point = entry;
				// }else{
					// data[kn].values.push(entry)
				// }
			// }
		// } else if (k.length > 1) {
			// data[kn] = this.recInsert(entry, k.slice(1), data[kn]);
		// } else {
			// if(k[0].valueOf() == 'DOY'.valueOf() && entry.req[`avg_${entry.type}`] != undefined){
				// console.log("no avg")
				// data[kn].point = entry;
			// }else{
				// data[kn].VALUES.push(entry)
			// }
		// }
		// return data;

	// }
	// "temp"(){
	// 	if (this.custom) {

	// 		if (!this.values.customPeriod) {

	// 			this.values.customPeriod = {};

	// 		}
	// 		const pkey = custom(date);
	// 		if (pkey) {

	// 				if (!this.values.customPeriod[pkey]) {

	// 					this.values.customPeriod[pkey] = new Struct(
	// 						[],
	// 						pkey,
	// 						type
	// 					);

	// 				}
	// 				this.values.customPeriod[key].values.push(entry);

	// 			}

	// 		}
	// 		return this.values
	// 	}
	// "construct" (bValues, x) {
	// 	try {
	// 		if(bValues == undefined){
	// 			return new ByDateStruct('mean',x)
	// 		}else if(typeof bValues.build === 'function'){
	// 			return bValues.build(this.type);
	// 		}else{
	// 			Object.keys(bValues).map(key => {
	// 				return this.construct(bValues[key], key); 
	// 			})
	// 			return bValues;
			// }
		// } catch (error) {
			// throw error;
		// }
	// }
	"request" (key) {
		// console.log('parseByDateStruct - request key', key)
		this.parse(key)
		let type = this.type;
		return new Promise((res, rej) => {
			let vals = {};

			if (this.parsed[key]) {
				res(this.values[key]);
			} else {
				this.parsed[key] = true;
				switch (key) {
					case "monthly":
						this.values[key] = []; 
						Object.keys(this.values[key]).forEach((month) => {
							vals[month] = new Struct(specs, parseInt(month), type)
							vals[month].values = Object.values(this.values[key][month])
							vals[month].build(type)
						});
						this.values[key] = vals;
						res(this.values[key]);
						break;
					case "yrlySplit":
						let fkey = Object.keys(this.values[key])[0];
						delete this.values[key][fkey]
						let lngth = Object.keys(this.values[key]).length
						let lkey = Object.keys(this.values[key])[lngth-1];
						delete this.values[key][lkey]
						res(this.values[key])
						break;
					case "yrly":
					case "months":
					case "weeks":
					case "yrlyFull":
						res(this.values[key]);
						break;
					case "dailyExtremeHigh":
					case "weeksExtremeHigh":
					case "defaultExtremeHigh":
						let tkey = {
							"weeksExtremeHigh": "weeks",
							"dailyExtremeHigh": "yrly"
						}
						tkey = tkey[key]
						vals = this[tkey].then();
						this.values[key] = new Struct([],undefined, 'max');
						vals.then((y) => {
							this.values[key].values = y.values.map(each => each.maxAvg)
							this.values[key].build('max');
							res(this.values[key]);
						})
						break;
					case "dailyExtremeMaxLim":
						this.values[key] = this.yrly.then((y) => {

							// this.values[key] = (y.max ? y.max : y.total).occurrence((e) => 30 < e);
							return y

						});
						res(this.values[key])
						// res(this.yrly.then())
						break;
					case "dailyExtremeMinLim":
						this.yrly.then((y) => {

							// This.values[key] = (y.max ? y.max : y.total).occurrence((e) => 30 < e);
							this.values[key] = y.total
								? y.total
								: y
							res(this.values[key]);

						});
						break;
					case "decades":
						this.values[key] = this.construct(this.values[key])
						res(this.values[key]);
						break;
					case "splitDecades":
					case "30period":
						this.values[key] = this.construct(this.values[key])
						Object.keys(this.values[key]).forEach(year => {
							vals[year] = new Struct([], parseInt(year), type)
							vals[year].values =  Object.values(this.values[key][year]);
							this.values[key][year] = vals[year].build();
						})
						res(this.values[key]);
						break;
					case "customPeriod":
						Object.keys(this.values[key]).forEach((tkey) => {

							this.values[key][tkey] = new Struct(Object.keys(this.values[key][tkey]).map((decade) => this.values[key][tkey][decade].build(type))).build(type);

						});
						res(this.values[key]);
						break;
					case "meta":
						res(this.values[key]);
						break;
					case "spring":
					case "summer":
					case "winter":
					case "autumn":
					case "season":
						if (this.values[key]) {
							vals = new Struct([],undefined, type)

							vals.values = this.construct(
								this.values[key],
								help.seasons[key]
							);
							this.values[key] = vals.build(type)
						}
						res(this.values[key]);
						break;
					case "last":
					case "first":
					case "default":
						this.values[key] = this.yrlySplit.then((split) => {
							return split[key]

						});
						res(this.values[key]);
						break;
					case "growDays":
					case "growWeeks":
					case "growDefault":
						let gkey = {
							"growWeeks": "weeks",
							"growDays": "yrly"
						}
						gkey = gkey[key];
						vals = this[gkey].then();
						this.values[key] = new Struct([],undefined, 'max');
						vals.then((yrly) => {
							this.values[key].values = yrly.values.map(y =>  y.sequence((e) => e > 0))
							this.values[key].build('max');
							res(this.values[key]);
						})
						break;
					case "all":
						this.values[key] = this.values[key].build()	
						res(this.values[key].build())
						break;
					default:
						if(climateplots.dev) console.log("default")
						// keys.forEach((tkey) => {

						if (this.values[key]) {

							this.values[key] = this.construct(
								this.values[key],
								help.seasons[key]
							);

						}

						// });
						this.parsed[key] = true;
						res(this.values[key]);
						break;

				}

			}

		});

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
				// TODO should cahnge to 'season' [season], year 
				// to match decasdes and others
				this.insert(false, false, 'season', 'year')(entry);
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
				this.values[key] = this.insert(true, "yrlyFull", "year", 'DOY');
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

