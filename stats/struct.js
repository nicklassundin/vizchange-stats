// const help = require("./../helpers.js");
const help = require('climate-plots-helper')
const regression = require("regression");

/*
 * Const { JSDOM } = require( "jsdom" );
 * let { window } = new JSDOM( "" );
 * const $ = require( "jquery" )( window );
 */
const {Point} = require('./point.js')
const curl = require('../curl.js')

function ColorToHex(color) {
	var hexadecimal = color.toString(16);
	return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
	return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
}


module.exports = class Struct {
	static build(specs, x, type, f, full=false){
		switch (specs.key) {
			case 'month':
				if(typeof specs.start != 'object'){
					specs.start = new Date(specs.start,0,1)
				}
				if(typeof specs.end != 'object'){
					specs.end = new Date(specs.end+1,0,0)
				}
				break;
			case 'year':
			case 'DOY':
			default:
				if(typeof specs.start != 'object'){
					specs.start = new Date(specs.start,0,1)
				}
				if(typeof specs.end != 'object'){
					specs.end = new Date(specs.end+1,0,0)
				}

		}
		return Point.build(specs, full).then(point => {
			switch (type){
				case 'first':
					point = point.filter(f).first;
					break;
				case 'last':
					point = point.filter(f).last;
					break;
				default:
			}
			if(point.ERROR){
				return point.ERROR
			}
			return new Struct(point, specs, x, type)
		})
	}
	constructor(point, specs, x = undefined, type = "mean", f) {

		this.specs = specs;
		// this.specs.start = new Date(specs.start,0,0)
		// this.specs.end = new Date(specs.end,12,30)

		this.entry = point
		// this.entry.subType = type
		this.f = f;
		this.x = x;
		this.type = type
		this.meta = {
			"fields": [],
			"src": "",
		};
		this.movAvg = undefined;
		this.VALUES = Promise.resolve({});
		this.POINT = [];
	}
	set "y" (val) {
		this.Y = val;
	}
	get "y" () {
		let val;
		// if(this.Y === undefined){
		// 	try{

		// 		if(this.values.length > 0 && this.values[0].reInit){
		// 			this.values = this.values.map(each => {
		// 				each.f = this.f
		// 				return each.reInit(this.type)
		// 			})
		// 		} 
		// 	}catch(ERROR){
		// throw ERROR
		// }
		// val = this.values
		// this.values = this.values.filter((entry) => !isNaN(parseFloat(entry.y)) && isFinite(entry.y));
		// }
		// if(this.values.length < 1){
		// return null
		// } 
		switch (this.type) {
			case "difference":
				// this.entry.subType = this.type
				this.Y = this.entry.difference;
				break;
			case "mean":
				// this.Y = help.sum(this.values.map((each) => {
				// if(each instanceof Point && each.avg != undefined){
				// each.subType = 'avg';
				// }
				// return each.y
				// }));
				// this.Y /= this.count;
				// break;
			case "max":
				// this.Y = Math.max(...this.values.map((each) => {
				// if(each instanceof Point && each.max != undefined){
				// each.subType = 'max';
				// }
				// return each.y
				// }));
				// break;
			case "min":
				// this.Y = Math.min(...this.values.map((each) => {
				// if(each instanceof Point && each.min != undefined){
				// each.subType = 'min';
				// }
				// return each.y
				// }));
				// break;
			case "sum":
				// this.Y = help.sum(this.values.map((each) => each.y));
				this.entry.subType = this.type
				this.Y = this.entry.y
				break;
			case "number":
				if(typeof this.f == 'function' && this.values[0] instanceof Point){
					this.values = this.values.filter(this.f)
				}
				this.Y = this.values.length;
				break;
			case "last":
			case "first":
				this.Y = this.entry.y
				var vals = this.entry.y
				if(!vals.typeMeta){
					var date = new Date(vals.x)
					this.typeMeta = {
						"value": vals.y,
						"fullDate": vals.x,
						"year": vals.year,
						"month": vals.month,
						"date": date.getTime(),
						"strDate": `${vals.year}-${vals.month+1}-${date.getDate()}`,
						// "x": vals.x,
						"x": vals.year,
						"y": vals.DOY,
					}
				}else{
					this.typeMeta = vals.typeMeta;
				}
				break;
			default:

		}
		return this.Y
	}
	get "count" () {
		return this.values.length
	}
	// set "values" (val) {
	// this.VALUES = val.sort((a,b) => {
	// // return a.x - b.x 
	// });
	// }
	set "point" (val){
		this.POINT.push(val)
	}
	get "point" (){
		return this.POINT[0]
	}
	get "values" () {
		var genSpecs = JSON.parse(JSON.stringify(this.specs)); 
		var key = genSpecs.keys.shift();


		let getValues = async function(entry, values, type, f){
			let k = entry.shift();

			if(entry.length < 1){
				return values
			}else{
				var specs = JSON.parse(JSON.stringify(genSpecs)); 
				specs.start = k;
				specs.end = k;
				values = values.then(val => {
					val[k] = Struct.build(specs, k, type, f)
					return val
				})
				return getValues(entry, values, type, f)
			}
		}
		this.VALUES = getValues(this.entry[`${key}s`], this.VALUES, this.type, this.f)	

		// if(this.point != undefined){
		// return [this.point]
		// }else
		return this.VALUES.then(vals => {
			return Object.values(vals)
		})
		return undefined;
	}
	get "valuesAll" () {

		if (this.values[0] != undefined) {

			if (this.values[0].values != undefined) {

				return this.values.map((each) => each.values).reduce((a, c) => a.concat(c));

			}

			return this.values;


		}

		return this.values;


	}
	"split" (f) {
		if (this.values[0].split) {
			return new Struct(
				this.values.map((each) => each.split(f)),
				this.x,
				this.type
			)
		}
		return new Struct(
			f(this.values),
			this.x,
			this.type
		);
	}
	"filter" (f, type = this.type, abs = true) {
		let res = new Struct([],this.x,this.type)
		if (typeof this.values[0].filter == 'function' && abs) {
			res.values = this.values.map((entry) => {
				return entry.filter(
					f,
					type
				);
			});
			// return value;
		}else {
			return f(this)
		}
		return res.build(type) 

	}
	"filterForm" (f, type, abs) {
		let g = (entry) => {
			const y = f(...entry.values.map((each) => each.y));
			return {
				"subX": entry.values.filter((each) => each.y == y).map((each) => new Date(each.x)),
				y,
				"x": entry.x
			};

		};
		try {
			if (this.values.length > 0 && Array.isArray(this.values[0].values) && abs) { 
				return new Struct(this.values.map((each) => each.filter(
					g,
					type,
					abs
				)),this.x, type).build(type);

			}

			// return this.filter(g,type,abs)
			return this.filter(
				g,
				type,
				abs
			)

		} catch (error) {

			throw error
			return {"values": undefined};

		}

	}
	get "min" (){
		return this.TYPE('min');
	}
	get "minAvg" () {
		return this.AVGTYPE('min');
	}
	get "max" (){
		return this.TYPE('max');
	}
	get "maxAvg" () {
		return this.AVGTYPE('max');
	}
	get "sum" (){
		return this.TYPE('sum');
	}
	get "first" () {
		// return this.type('first');
		return Struct.build(this.specs, this.x, 'first', this.f, true)
	}
	get "last" () {
		// return this.type('last');
		return Struct.build(this.specs, this.x, 'last', this.f, true)
	}
	get "number" () {
		return this.TYPE("number", this.f)
	}
	get "difference" () {
		return this.TYPE("difference", this.f)
		// if(bsln == undefined){
		// bsln = {
		// lower: baselineLower,
		// upper: baselineUpper
		// }
		// }else{
		// bsln = JSON.parse(bsln);
		// }
		// let lower = bsln.lower;
		// let upper = bsln.upper;
		// try {
		//TODO change to TYPE later
		// const basevalue = help.mean(this.values.filter((value) => value.x >= lower && value.x <= upper).map((each) => each.y));
		// return Array.from(this.values.map((each) => [
		// each.x,
		// each.y - basevalue
		// ]));
		// } catch (error) {
		// throw error
		// }
	}
	"AVGTYPE" (type, f) {
		let entry = this.entry.clone()
		let seed = entry.getSeed();
		if(entry.subType.length > 0){
			seed.specs.type = `${entry.subType}${entry.type}`
		}
		let nEntry = new Point(seed.specs, seed.req)
		return new Struct(nEntry, seed.specs, this.x, type, f)
		// return res
		// let res = new Struct([], this.x, type)
		// res.values = this.values.map(each => each.short())
		// return res.build(type)
	}
	"TYPE" (type, f) {
		let res = new Struct(this.entry.clone(), this.specs, this.x, type, f)
		res.colored = this.colored;
		res.color = this.color;
		return res
		// if(!(this.values[0] instanceof Point) && typeof this.values[0].TYPE === 'function'){
		// res.values = this.values.map(each => each.TYPE(type))	
		// }else{
		// res.values = this.values; 
		// }
		// return res.build(type)
	}
	"numberReq" () {
		return this;
	}
	get "shortValues" () {
		try{
			if(this.values.length > 0 && typeof this.values[0].short === 'function'){
				return this.values.map(each => each.short(this.y));
			}else{
				return this.values
			}	
		}catch(error){
			throw error
		}
	}
	get "yValues" (){
		return this.shortValues.map(each => each.y)
	}
	"short" (y) {
		if(this.typeMeta != undefined) return this.typeMeta
		return {
			y: this.y,
			x: this.x,
			colors: {
				red: ColorToHex(255,55+Math.floor(y * 200 / (this.y-y)), 0),
				blue: ColorToHex(55+Math.floor(y * 200 / (this.y-y)), 255, 0)
			}, 
			type: this.type,
			xInterval: this.xInterval,
			typeMeta: this.typeMeta,
			date: (this.values.length === 1 ? this.values[0].short().date : null),

		}
	}
	// "subOccur" (type) {
	"occurrence" (type){
		return (val) => {
			var f = type;
			if(typeof f != 'function'){
				switch (type){
					case 'high':
						f = (e) => e.y > val
						break;
					case 'low':
						f = (e) => e.y < val
						break;
					default:
				}
			}
			this.f = f;
			return this.number
		}
	}
	"sequence" (f = (e) => e > 0) {

		const values = this.values.map((each) => {

			const res = {};
			this.keys.forEach((key) => {

				res[key] = each[key];

			});
			res.y = f(each.y)
				? 1
				: 0;
			res.x = this.x;
			res.start = each.x;
			res.end = each.x;
			return res;

		}),
			max = values.reduce(
				(a, b) => {

					if (b.y > 0) {

						if (a.length > 0) {

							const i = a.length - 1;
							if (a[i].y > 0) {
								a[i].y += b.y;
								a[i].end = b.end;

							} else {

								a.push(b);

							}

						} else {

							a.push(b);

						}

					} else {

						a.push(b);

					}
					return a;

				},
				[]
			);

		/*
		 * Console.log(max)
		 * Fsdfsd
		 */
		let res = new Struct(
			[],
			this.x,
			'max'
		)
		res.values = max;
		return res.build("max");

	}
	"variance" () {

		switch (this.type) {

			case "sum":
				return this.count * variance(this.values.map((each) => each.y));
				break;
			default:
				return variance(this.values.map((each) => each.y));

		}

	}
	"ci" () {

		return help.confidenceInterval(
			this.y,
			this.variance(),
			this.count
		);

	}
	"plotCI" () {

		let result = [],
			e = this.ci(),
			{y} = this;
		this.values.forEach((each) => {

			if (each.ci) {

				e = each.ci();
				y = each.y;

			}
			result.push({
				"x": each.x,
				"high": e.high + (each.y - y),
				"low": e.low + (each.y - y)
			});

		});
		return result;

	}
	"closest" (date) {
		if(typeof date == 'string') date = new Date(date)
		const oneDay = 24 * 60 * 60 * 1000,
			distance = [];
		this.values.forEach((each) => {

			const temp = new Date(each.x),
				end = new Date(
					temp.getYear() + 1900,
					11,
					31
				),
				start = new Date(
					temp.getYear() + 1900,
					0,
					1
				),
				days = Math.round(Math.abs((start - end) / oneDay)),
				degree = 360 / days;
			date = new Date(
				temp.getYear() + 1900,
				date.getMonth(),
				date.getDate()
			);
			const dis = Math.round(Math.abs((date - temp) / oneDay)),
				degrees = dis * degree;
			// If(degrees > 180) degrees = 360 - degrees;
			distance.push(Math.round(degrees / degree));

		});
		const min = Math.min.apply(
			null,
			distance
		),
			// Console.log(distance)
			{values} = this,
			result = {
				"data": undefined,
				"interval": {
					"y": {
						"hi": undefined,
						"lo": undefined
					}
				}
			};
		distance.forEach((value, index) => {

			if (value == min) {

				result.data = values[index];

			}

		});
		return result;

	}
	"plotMovAvg" () {

		if (this.movAvg != undefined) {

			return this.movAvg;

		}
		let movAvg = movingAverages(
			this.values.map((each) => each.y),
			10
		),
			result = [],
			variance = this.variance(),
			{count} = this;
		this.values.forEach((each, index) => {

			if (each.variance) {

				variance = each.variance();

			}
			if (each.count) {

				count = each.count;

			}
			const e = help.confidenceInterval(
				movAvg[index],
				variance,
				count
			);
			result.push({
				"y": movAvg[index],
				"x": each.x,
				"high": e.high,
				"low": e.low
			});

		});
		return result.slice(10);

	}
	"plotMovAvgCI" () {

		if (this.movAvg == undefined) {

			this.movAvg = this.plotMovAvg();

		}
		return this.movAvg;

	}
	"linReg" () {

		const result = regression.linear(this.values.map((each, index) => [
			index,
			each.y
		]));
		result.linReg.points = values.map((each, index) => [
			each.x,
			result.linReg.points[index][1]
		]);
		return result;

	}
	"changeY" (type){
		let res = new Struct([],this.x,this.type)
		if(this.values.length > 0 && typeof this.values[0].changeY === 'function'){
			res.values = this.values.map(each => each.changeY(type))
			return res.build();
		}
		res.values = this.values.map(each => each[type]);
		return res.build();
	}
	"reInit" (type = this.type, lower = baselineLower, upper = baselineUpper, color) {
		this.type = type;
		if (this.values.length > 0) {
			if (this.values[0].keys) {
				this.keys = this.values[0].keys;
			} else {
				this.keys = Object.keys(this.values[0]);
			}
		}
		this.values = this.values.sort((a, b) => {
			return a.x - b.x
		})
		// const max = Math.max(...this.values.map((each) => each.y));
		// this.values = this.values.map((each) => {

		// 	switch (color) {

		// 		case "red":
		// 			each.color = `rgb(255,${255 - Math.floor(each.y * 255 / max)}, 0)`;
		// 			break;
		// 		case "blue":
		// 			each.color = `rgb(${
		// 				255 - Math.floor(each.y * 255 / max)},${
		// 					255 - Math.floor(each.y * 255 / max)},${
		// 						255})`;

		// 			break;
		// 		case "green":
		// 			each.color = `rgb(${255 - Math.floor(each.y * 255 / max)},255, 0)`;
		// 			break;
		// 		default:
		// 			return each;
		// }

		// });
		return this;
	}
	"Axis" (key) {
		let keys = Object.values(this.values).map((each) => each[key]);
		keys = keys.filter((element, i) => i === keys.indexOf(element));
		const result = {};
		keys.forEach((each) => {

			result[each] = this.values.filter((entry) => each == entry[key]);

		});
		return result;

	}
	"clone" () {
		return new Struct(this.values, this.x, this.type)
		// {"values": [],
		// ...this};

	}
	"map" (F) {
		return new Struct(F(this.values), this.x, this.type)
	}
	get "xInterval" () {

		let x1 = new Date(Math.min.apply(
			null,
			this.values.map((each) => (each.xInterval
				? Math.min.apply(
					null,
					each.xInterval
				)
				: new Date(each.x)))
		)).getTime();
		let x2 = new Date(Math.max.apply(
			null,
			this.values.map((each) => (each.xInterval
				? Math.max.apply(
					null,
					each.xInterval
				)
				: new Date(each.x)))
		)).getTime();
		return {
			x: x1,
			x2: x2	
		}
	}
};
// exports.struct = struct;

// exports.parseByDate = require("./parseByDate.js").parseByDate;
