const help = require('climate-plots-helper');
const curl = require('../curl.js')

let replace = (req, a, b) => {
	if(req[a]){
		req[b] = req[a];
		delete req[a]
	}
	return req;
}

class Baseline {
	constructor(){
		this.cache = {};
	}
	getBaseline(specs){
		let start = specs.baseline.start;
		let end = specs.baseline.end;
		if(undefined === this.cache[`${start}${end}`]){
			this.cache[`${start}${end}`] = curl.curlProx({
				start: new Date(specs.baseline.start,1,1),
				end: new Date(specs.baseline.end,1,1),
				url: specs.url,
				type: specs.type,
				station: specs.station
			}).then(baseline => {
				return baseline.reduce((a,b) => Object.assign(a, b));
			})
		}
		return this.cache[`${start}${end}`]

	}
}

let baselineContain = new Baseline();


class Point {
	static build(specs, full=false){
		return curl.curlProx(specs, full).then(res => {
			if(res.length < 1) return {
				'ERROR': new Error('empty result'),
				'specs': specs
			}
			if(!full) res = res.reduce((a,b) => Object.assign(a, b))
			return new Point(specs, res, full);
		})
	}
	get 'diff' (){
		return baselineContain.getBaseline(this.specs).then(baseline => {
			Object.keys(baseline).forEach(key => {
				this.req[key].baseline = baseline[key].avg
				this.req[key].diff = this.req[key].avg - baseline[key].avg
			})
			// TODO cases
			// first, last and numbers etc
			return new Point(this.specs, this.req, this.full);
		})
	}
	constructor(specs, req, full=false){
		this.full = full;
		this.specs = specs;
		// this.subType = '';
		this.type = specs.type;
		let type = this.type;
		// this.pos = req.position
		req = replace(req,'glob_temp', 'temperature')
		req = replace(req,'64n-90n_temp', 'temperature')
		req = replace(req,'nhem_temp', 'temperature')
		if(typeof req[type] == 'string' && req[type].length < 1) req[type] = undefined
		this.req = req;


		// this.x = specs.start
		// this.y = req[type] === "" ? undefined : Number(req[type])
		// if(req['avg_temperature']){
		// }
		if(req[`${this.type}`] === undefined){
			if(req[`avg_${type}`] !== undefined){
				this.subType = 'avg';
			}
		}
		if(['breakup', 'freezeup'].includes(type)){
			let date = new Date(req[type]);
			this.y = help.dayOfYear(date)
			this.date = date;
			if(help.isFirstHalfYear(date.getMonth())){
				this.y += (((this.year-1) % 4 === 0 && (this.year-1) % 100 > 0) || (this.year) %400 === 0) ? 366 : 365;
			}
		}else if(['co2_weekly'].includes(type) && this.y !== undefined && !isNaN(this.y)){
			this.req[type] = this.req[type].replace(' ', '')
		}else{
			this.date = this.x;
		}
		this.monthName = help.monthByIndex(this.month);
		this.season = help.getSeasonByIndex(this.month)
		this.decade = this.year - this.year % 10;
		this.decade = this.year - this.year % 10;
		// this.DOY = help.dayOfYear(this.x)
		this.century = this.year - this.year % 100
		if(help.isFirstHalfYear(this.month)){
			this.splitMonth = this.month+12
			this.splitYear = this.year - 1
		}else{
			this.splitMonth = this.month
			this.splitYear = this.year
		}
		this.splitDecade = this.splitYear - this.splitYear % 10 +1;
	}
	get 'x'(){
		if(this.req.date !== undefined) return this.req.date
		return this.specs.start
	}
	'filter' (f){
		this.req = this.req.filter((x) => {
			return f(Number(x[this.type]))
		});
		return this
	}
	get 'first'(){
		this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		})
		this.req = this.req[0]
		return this
	}
	get 'last'(){
		this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		})
		this.req = this.req[this.req.length-1]
		return this
	}
	set 'y' (val){
		this.req[`${this.subType}${this.type}`] = val
	}
	get 'y' (){
		let y = this.req[`${this.type}`]
		if(y === undefined) y = this.req[`${this.subType}${this.type}`];

		if(y === undefined && this.SUBTYPE === 'sum') y = this.req[`avg_${this.type}`][this.SUBTYPE]
		if(typeof y == 'object') return Number(y[this.SUBTYPE])

		return Number(y)
	}
	set 'subType' (subType){
		if(subType === "mean") subType = 'avg'
		if(subType){
			this.SUBTYPE = `${subType}`
		}else{
			this.SUBTYPE = subType;
		}
	}
	get 'subType' (){
		if(!this.SUBTYPE) return ''
		return `${this.SUBTYPE}_`;
	}
	'TYPE'(type){
		return this.req[`${this.subType}${this.type}`][type]
	}
	get 'min' (){
		return this.TYPE('min')
	}
	get 'max' (){
		return this.TYPE('max')
	}
	get 'avg' (){
		return this.TYPE('avg')
	}
	get 'sum' (){
		return this.TYPE('sum')
	}
	get 'difference' (){
		return this.TYPE('diff')
	}
	get 'year' (){
		return this.x.getFullYear();
	}
	get 'strDate'(){
		return `${this.year}-${this.x.month+1}-${this.x.getDate()}`
	}
	get 'years' (){
		let start = this.specs.start.getFullYear();
		let end = this.specs.end.getFullYear();
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'month' (){
		return this.x.getMonth();
	}
	get 'week' (){
		return this.x.getWeekNumber();
	}
	get 'DOY' (){
		return help.dayOfYear(this.x)
	}
	get 'DOYs' (){
		let start = help.dayOfYear(this.specs.start)
		let end = help.dayOfYear(this.specs.end)
		return [...Array(end-start).keys()].map(v => (v+start));
	}
	get '30periodyear' (){
		return `${this.splitDecade - (this.splitDecade-1900) % 30 + 1}` 
	}
	get '30period' (){
		return `${this['30periodyear']-this.century}-${this['30periodyear']-this.century+29}`
	}
	get 'snow'(){
		this.req.snow = (this.req['avg_temperature'] > 0) ? 0 : Number(this.req['precipitation'])
		return new Point(this.req, 'snow'); 
	}
	get 'rain'(){
		this.req.rain = (this.req['avg_temperature'] <= 0) ? 0 : Number(this.req['precipitation'])
	}
	merge(other){
		return Object.assign(true, {}, this, other);
	}/*
	equals(other){
		return this.pos[0] === other.pos[0] && this.pos[1] === other.pos[1]  && this.x.getTime() === other.x.getTime()
	}
	eq(other){
		return this.equals(other)
	}
	hash(){
		return this.pos[0] +this.pos[1]+this.y+this.x.getTime()
	}*/
	clone(){
		return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
	}
	'short' (){
		let next = {}
		next.y = this.y
		Object.keys(this).forEach(key => {
			next[key] = this[key];
		})
		return next
	}
	'getSeed' () {
		let specs = this.specs;
		let req = this.req
		return {
			specs,
			req
		}
	}
}

// module.exports.Entry = Entry;
module.exports.Point = Point
