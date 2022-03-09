const Struct = require('./struct.js');
const help = require('climate-plots-helper');
// const keys = Object.keys(values[0]),
module.exports = class ByDateStruct {
	constructor(type = mean, custom) {
		this.type = type;
		this.values = {};
		this.parsed = {};
		this.years = {};
	}
	"insert" (kn, ...k) {
		return (entry) => {
			// if(k.includes(undefined)){
			// throw new Error({'message': 'undefined k'})
			// }
			// if(entry.y != undefined && !isNaN(entry.y)){
				k = k.map(key => {
					if(entry[key] != undefined) return entry[key]
					return key
				})
				if(kn) k.unshift(kn)
				this.values = this.recInsert(entry,k) 
			// }
		}

	}
	"recInsert" (entry, k, data = this.values ) {
		let kn = k[0];
		if(kn === undefined){
			// return data;
		}
		if(!data[kn]) {
			if (k.length > 1) {
				data[kn] = this.recInsert(entry, k.slice(1), {});
			} else {
				data[kn] = new Struct(
					[],
					kn,
					this.type
				);
				if(k[0].valueOf() == 'DOY'.valueOf() && entry.req[`avg_${entry.type}`] != undefined){
					data[kn].point = entry;
				}else{
					data[kn].values.push(entry)
				}
			}
		} else if (k.length > 1) {
			data[kn] = this.recInsert(entry, k.slice(1), data[kn]);
		} else {
			if(k[0].valueOf() == 'DOY'.valueOf() && entry.req[`avg_${entry.type}`] != undefined){
				data[kn].point = entry;
			}else{
				data[kn].VALUES.push(entry)
			}
		}
		return data;

	}
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
	"build" (entries) {
		this.entries = entries;
		return this
	}
	"construct" (bValues, x) {
		try {
			if(bValues == undefined){
				return new ByDateStruct('mean',x)
			}else if(typeof bValues.build === 'function'){
				return bValues.build(this.type);
			}else{
				Object.keys(bValues).map(key => {
					return this.construct(bValues[key], key); 
				})
				return bValues;
			}

		} catch (error) {
			throw error;

		}

	}
	"request" (key) {
		let type = this.type;
		return new Promise((res, rej) => {
			let vals = {};

			if (this.parsed[key]) {
				res(this.values[key]);
			} else {
				this.parsed[key] = true;
				switch (key) {
					case "monthly":
						this.values[key] = this.construct(this.values[key]);
						Object.keys(this.values[key]).forEach((month) => {
							vals[month] = new Struct([], parseInt(month), type)
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
					case "yrly":
					case "months":
					case "weeks":
						this.values[key] = this.construct(this.values[key]);
						Object.keys(this.values[key]).forEach(year => {
							vals[year] = new Struct([], parseInt(year), type)
							vals[year].values = Object.values(this.values[key][year])
							vals[year].build(type)
						})
						this.values[key] = new Struct([],undefined, type);
						this.values[key].values = Object.values(vals);
						this.values[key] = this.construct(this.values[key])
						res(this.values[key]);
						break;
					case "yrlyFull":
						Object.keys(this.values[key]).forEach((year) => {
							this.values[key][year] = this.construct(
								this.values[key][year],
								parseInt(year)
							);


						});
						res(this.values[key]);
						break;
					case "yrlyTest":
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
								: y,
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

		return this.parse("monthly");

	}
	get "weeks" () {

		return this.parse("weeks");

	}
	get "months" () {

		return this.parse("months");

	}
	get "weeksExtremeHigh" () {

		return this.parse("weeksExtremeHigh");

	}
	get "weeksExtremeHighLim" () {

		return this.parse("weeksExtremeHighLim");

	}
	get "yrly" () {
		return this.parse('yrly')
		// return this.request("yrly");

	}
	get "yrlyFull" () {

		return this.parse("yrlyFull");

	}
	get "dailyExtremeHigh" () {

		return this.parse("dailyExtremeHigh");

	}
	get "dailyExtremeMaxLim" () {

		return this.parse("dailyExtremeMaxLim");

	}
	get "dailyExtremeMinLim" () {

		return this.parse("dailyExtremeMinLim");

	}
	get "yrlySplit" () {

		return this.parse("yrlySplit");

	}
	get "decades" () {
		return this.parse("decades");
	}
	get "splitDecades" () {
		return this.parse("splitDecades");
	}
	get "30period" () {

		return this.parse("30period");

	}
	get "customPeriod" () {

		return this.parse("customPeriod");

	}
	get "meta" () {

		return this.parse("meta");

	}
	get "spring" () {

		return this.parse("spring");

	}
	get "summer" () {

		return this.parse("summer");

	}
	get "autumn" () {

		return this.parse("autumn");

	}
	get "winter" () {

		return this.parse("winter");

	}
	get "yrlyTest" () {

		return this.parse("yrlyTest");

	}
	////
	//
	//
	get "last" () {
		return this.parse("last");

	}
	get "first" (){
		return this.parse("first");

	}
	get "growDays" (){
		return this.parse("growDays");
	}
	get "growWeeks" () {

		return this.parse("growWeeks");

	}
	get "all" () {
		return this.parse('all');
	}
"parse" (key) {
	// console.log(key)
	if(!this.values[key]){
		let startTime = (new Date()).getTime();
		this.entries
			.forEach((entry, index) => {
				let date = entry.x
				const year = entry.year;
				if (!this.years[`${year}`]) {
					this.years[year] = `${year}`;
				}
				switch (key) {
					case 'all':
						this.insert('all')(entry)
						break;
					case 'yrly': 
						this.insert(
							"yrly",
							'year',
							'DOY'
						)(entry);
						break
					case 'summer':
					case 'winter':
					case 'autumn':
					case 'spring':
						// TODO should cahnge to 'season' [season], year 
						// to match decasdes and others
						this.insert(
							false,
							'season',
							'year'
							// ,entry.DOY
						)(entry);
						break;
					case 'decades':
						this.insert("decades",
							'decade',
							'year'
							// ,entry.DOY
						)(entry);
						break;
					case 'splitDecades':
						this.insert(key,
							'allTime',
							'splitMonth'
						)(entry);
						this.insert(key,
							'splitDecade',
							'splitMonth'
						)(entry);
						break;
					case '30period':
						this.insert(key, 
							'allTime',
							'splitMonth'
						)(entry)
						this.insert(key, 
							'30periodyear',
							'splitMonth'
						)(entry)
						break;
					case 'yrlySplit':
						var splitDOY = ((year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 366 : 365) + entry.DOY;
						this.insert(
							"yrlySplit",
							// key,
							entry.splitYear,
							(entry.splitYear === entry.year ? entry.DOY : splitDOY)
						)(entry);
						break;
					case 'yrlyFull':
						this.insert(
							"yrlyFull",
							entry.decade,
							entry.monthName
						)(entry);
						break;
					case 'monthly':
						this.insert(
							"monthly",
							entry.monthName,
							// key,
							entry.year
						)(entry);
						break
					case 'weeks':
						this.insert(
							"weeks",
							// key,
							entry.year,
							entry.week
						)(entry);
						break;
					case 'months':
						this.insert(
							"months",
							// key,
							entry.year,
							entry.monthName
						)(entry);
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
					case 'default':
						break;
				}
				//if(entry.req['min_temperature']){
				//	console.log('entry',entry)
				//	console.log(this.values['yrly'][entry.year+''][entry.DOY].values[0].req)
				//} 
			})
		console.log("time",(new Date()).getTime()-startTime)
	}
	return this.request(key);
}
};

