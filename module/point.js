const help = require('climate-plots-helper');
const curl = require('../gateway.js')

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
		//console.log(specs)
		let start = specs.baseline.start;
		let end = specs.baseline.end;
		if(undefined === this.cache[`${start}${end}${specs.type}`]){
			this.cache[`${start}${end}${specs.type}`] = curl.proxRequest({
				dates: {
					start: new Date(specs.baseline.start,1,1),
					end: new Date(specs.baseline.end,1,1),
				},
				url: specs.url,
				type: specs.type,
				station: specs.station
			}).then(baseline => {
				return baseline.reduce((a,b) => Object.assign(a, b));
			})
		}
		return this.cache[`${start}${end}${specs.type}`]
	}
}

let baselineContain = new Baseline();

class PointReq {
	static build(requests, specs){
		let result = {}
		requests.forEach(req => {
			if(typeof result[`${req.date}${req.position}`] !== 'object') result[`${req.date}${req.position}`] = {}
			Object.assign(result[`${req.date}${req.position}`], req)
		})
		return Object.values(result).filter(each => {
			switch(specs.description) {
				case 'splitMonth':
				case 'splitDecades':
					let x = (specs.x > 12) ? specs.x - 7 : specs.x
					return !((new Date(each.date)).getMonth()+1 === x)
				default:
					return true
			}
		}).map(each => new PointReq(each, specs))
	}
	constructor(request, specs){
		request = replace(request,'glob_temp', 'temperature')
		request = replace(request,'64n-90n_temp', 'temperature')
		request = replace(request,'nhem_temp', 'temperature')
		this.request = request;
		Object.keys(request).forEach((key) => {
			this[key] = request[key];
		})
	}
	get 'snow_precipitation'() {
		return ((Number(this.request['avg_temperature']) > 0) ? 0 : Number(this.request['precipitation']))
	}
	get 'rain_precipitation'() {
		return ((Number(this.request['avg_temperature']) <= 0) ? 0 : Number(this.request['precipitation']))
	}
	get "keys" (){
		if(Array.isArray(this.request)){
			return Object.keys(this.request.reduce((a, b) => Object.assign(a, b))).push()
		}else{
			return Object.keys(this.request)
		}
	}

}

class Point {
	static build(specs, full=false){
		switch (specs.delimiter){
			case 'weeks':
			case 'splitMonth':
			case 'splitDecades':
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
				full = true;
			default:
		}
		return curl.proxRequest(specs, full).then(res => {
			if (res.length < 1) return {
				'ERROR': new Error('empty result'),
				'specs': specs
			}
			if (!full) res = res.reduce((a, b) => Object.assign(a, b))
			return new Point(specs, res, full);
		})
	}
	constructor(specs, req = {}, full=false){
		this.full = full;
		this.specs = specs;
	//	console.log('Point.constructor:', this.specs.dates)
		if(typeof this.specs.dates.start === 'string'){
			this.specs.dates.start = new Date(this.specs.dates.start)
			this.specs.dates.end = new Date(this.specs.dates.end)
		}
		//console.log(this.specs)
		// this.subType = '';
		this.type = specs.type;
		let type = this.type;
		// this.pos = req.position
		//req = replace(req,'glob_temp', 'temperature')
		//req = replace(req,'64n-90n_temp', 'temperature')
		//req = replace(req,'nhem_temp', 'temperature')
		if(typeof req[type] == 'string' && req[type].length < 1) req[type] = undefined
		if(full){
			this.req = PointReq.build(req, specs);
		}else{
			this.req = new PointReq(req, specs);
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
	'dateSlice' (start, end) {
		let req = this.req;
		if(Array.isArray(req)){
			req = req.filter((e) => {
				return (e.date > start) && (e.date < end)
			})
			return new Point(this.specs, req, this.full)
		}else{
			if((this.specs.dates.start > start) && (this.specs.dates.end < end)){
				return this
			}else{
				return NaN
			}
		}
	}
	get 'x'(){
		let date = this.req.date
		if(date === undefined){
			date = this.specs.dates.start;
		}
		if(typeof date === 'string') return new Date(date);
		return date
	}
	'filter' (f){
		let req = JSON.parse(JSON.stringify(this.req)).filter((x) => {
			switch (this.SUBTYPE){
				case 'first':
				case 'last':
					return f(Number(x[`${this.specs.parentType}_${this.type}`]))
				default:
					return f(Number(x[`${this.subType}${this.type}`]))
			}
		});
		return new Point(this.specs, req, this.full)
	}
	'outside' (specs) {
		let start = specs.dates.start
		let end = specs.dates.end
		let req = JSON.parse(JSON.stringify(this.req)).filter((x => {
			let date = new Date(x.date).getTime()
			return date > start && date < end;
		}))
		return new Point(specs, req, this.full)
	}
	get 'first'(){
		let req = this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		})[0]
		req[`${this.subType}${this.type}`] = req[`${this.specs.parentType}_${this.type}`]
		return new Point(this.specs, req, false)
	}
	get 'last'(){
		let req = this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		})[this.req.length-1]
		req[`${this.subType}${this.type}`] = req[`${this.specs.parentType}_${this.type}`]
		return new Point(this.specs, req, false)
	}
	get 'difference' (){
		return baselineContain.getBaseline(this.specs).then(baseline => {
			let req = Object.assign(Object.create(Object.getPrototypeOf(this.req)), this.req)
			Object.keys(baseline).forEach(key => {
				try{
					if(req[key] !== undefined){
						console.log('--------------------------------')
						//console.log(baseline)
						console.log(`${this.req[key].avg} - ${baseline[key].avg}`)
						req[key].baseline = baseline[key].avg
						req[key].difference = this.req[key].avg - baseline[key].avg
						console.log(req[key].difference)
					}else{
						req[key] = {
							baseline: NaN,
							difference: NaN
						}
					}
				}catch(error){
					throw error
				}
			})
			return new Point(this.specs, req, this.full)
		})
	}
	set 'y' (val){
		this.req[`${this.subType}${this.type}`] = val
	}
	'getY'(req = this.req){
		let y = req[`${this.type}`]
		//console.log('old:', y)
		switch (this.SUBTYPE){
			case 'difference':
				if(typeof y == 'object'){
					return y.difference
				}else if(this.specs.parentType === 'sum') {
					return req[`avg_${this.type}`].difference
				}
				return req[`${this.specs.parentType}_${this.type}`].difference
			case 'snow':
			case 'rain':
				y = req[`${this.subType}${this.type}`]
				break;
			case 'minAvg':
				y = req[`${'avg'}_${this.type}`]
				if(typeof y == 'object'){
					return Number(y.min)
				}
			case 'maxAvg':
				y = req[`${'avg'}_${this.type}`]
				if(typeof y == 'object'){
					return Number(y.max)
				}
				return Number(req[`avg_${this.type}`])
			default:
				// TODO generalize
		}
		if(y === undefined) y = req[`${this.subType}${this.type}`];
		if(y === undefined && this.SUBTYPE === 'sum') y = req[`avg_${this.type}`]
		if(y === undefined) y = req[this.type];
		if(typeof y == 'object') y = y[this.SUBTYPE]
		return Number(y)
	}
	get 'y' (){
		let result = NaN;
		if(this.req.length === 0) return NaN
		if(this.full){
			result = this.req.map(each => this.getY(each)).filter(y => y !== undefined && !isNaN(y))
			if(result.length === 0) return NaN
			switch(this.SUBTYPE){
				case 'sum':
					return result.reduce((a,b) => a + b)
				case 'avg':
					return result.reduce((a,b) => a + b)/this.req.length
				case 'min':
				case 'max':
					return Math[this.SUBTYPE](...result)
				case 'maxAvg':
				case 'minAvg':
					return result.reduce((a,b) => a + b)/this.req.length;
				case 'snow':
				case 'rain':
					return result.reduce((a,b) => a + b)
				case 'last':
				case 'first':
					return this.getY(this.req[0]);
				case 'difference':
					return this.difference

				default:
					return result

			}
		}else{
			return this.getY()
		}
	}
	set 'subType' (subType){
		if(subType){
			this.SUBTYPE = `${subType}`
		}else{
			this.SUBTYPE = subType;
		}
	}
	get 'SUBTYPE' () {
		return this.specs.subType;
	}
	set 'SUBTYPE' (type) {
		this.specs.subType = type;
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
	// TODO DEPRECATED: use 'snow' / 'rain'
	"changeY" (type) {
		let specs = JSON.parse(JSON.stringify(this.specs));
		specs.type = type
		let req = JSON.parse(JSON.stringify(this.req));
		if(type === 'snow'){
			let point = Point.build(specs, true);
			return point
		}
		if(Array.isArray(req)){
			return new Point(specs, req, this.full)
		}
		if(isNaN(this.req[type])){
			return NaN
		}
		return new Point(specs, req, this.full)
	}
	get 'year' (){
		return this.x.getFullYear();
	}
	get 'strDate'(){
		return `${this.year}-${this.x.month+1}-${this.x.getDate()}`
	}
	get 'years' (){
		let start = this.specs.dates.start.getFullYear();
		let end = this.specs.dates.end.getFullYear();
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'months' () {
		return help.months()
	}
	get 'weeks' () {
		let start = this.specs.dates.start.getWeekNumber();
		let end = this.specs.dates.end.getWeekNumber();
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'decades' (){
		let start = this.decade
		let end = this.specs.dates.end.getFullYear();
		end = (end - end % 10)
		return Array.from({length: (end - start)/10+1}, (v, k) => k*10 + start)
	}
	get 'splitYears' (){
		let start = this.splitYear
		let end = this.specs.dates.end.getFullYear();
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'splitMonths' (){
		let start = 7
		let end = start + 12;
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'splitDecades' (){
		let start = this.splitDecade
		let end = this.specs.dates.end.getFullYear();
		return Array.from({length: (end - start)/10}, (v, k) => k*10 + start)
	}
	get '30periodyears'() {
		let start = this['30periodyear']
		let end = this.specs.dates.end.getFullYear();
		return Array.from({length: (end - start)/30}, (v, k) => k*30 + start)
		let decades = this.splitDecades
		return decades.map((v) => {
			console.log(v)
			return v - v % 30 +1
		})
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
		let start = help.dayOfYear(this.specs.dates.start)
		let end = help.dayOfYear(this.specs.dates.end)
		return [...Array(end-start).keys()].map(v => (v+start));
	}
	get '30periodyear' (){
		return this.splitDecade - (this.splitDecade-1900) % 30 + 1
	}
	get '30period' (){
		return `${this['30periodyear']-this.century}-${this['30periodyear']-this.century+29}`
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
		return new Point(this.specs, this.req, this.full)
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