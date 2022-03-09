const help = require('climate-plots-helper');

let replace = (req, a, b) => {
	if(req[a]){
		req[b] = req[a];
		delete req[a]
	}
	return req;
}

class Point {
	constructor(req, type){
		this.subType = '';
		this.type = type;
		this.pos = req.position
		req = replace(req,'glob_temp', 'temperature')
		req = replace(req,'64n-90n_temp', 'temperature')
		req = replace(req,'nhem_temp', 'temperature')
		if(typeof req[type] == 'string' && req[type].length < 1) req[type] = undefined
		this.req = req;
		this.x = new Date(req.date);
		// this.y = req[type] === "" ? undefined : Number(req[type])
		// if(req['avg_temperature']){
			// console.log('y',this.y)
			// console.log(req)
		// }
		if(this.y == undefined || isNaN(this.y)){
			if(req[`avg_${type}`] != undefined || !isNaN(req[`avg_${type}`])){
				this.subType = 'avg';
			}
		}
		if(['breakup', 'freezeup'].includes(type)){
			var date = new Date(req[type]);
			this.y = help.dayOfYear(date)
			this.date = date;
			if(help.isFirstHalfYear(date.getMonth())){
				this.y += (((this.year-1) % 4 === 0 && (this.year-1) % 100 > 0) || (this.year) %400 == 0) ? 366 : 365;
			}
		}else if(['co2_weekly'].includes(type) && this.y != undefined && !isNaN(this.y)){
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
		// console.log('req',req)
		// console.log('y',this.y)
		// if(Object.keys(req).includes('snowdepth_single')){
			// console.log('y',this.y)
			// console.log('type',type)
			// console.log('req',req)
			// console.log('this',this)
		// }
	}
	set 'y' (val){
		this.req[`${this.subType}${this.type}`] = val;
	}
	get 'y' (){
		return Number(this.req[`${this.subType}${this.type}`])
	}
	set 'subType' (subType){
		if(subType){
			this.SUBTYPE = `${subType}_`
		}else{
			this.SUBTYPE = subType;
		}
	}
	get 'subType' (){
		return this.SUBTYPE;
	}
	'TYPE'(type){
		return this.req[`${type}_${this.type}`]
	}
	get 'min' (){
		return this.TYPE('min')
	}
	get 'max' (){
		return this.TYPE('min')
	}
	get 'avg' (){
		return this.TYPE('min')
	}
	get 'sum' (){
		return this.TYPE('min')
	}
	get 'year' (){
		return this.x.getFullYear();
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
	}
	equals(other){
		return this.pos[0] == other.pos[0] && this.pos[1] == other.pos[1]  && this.x.getTime() == other.x.getTime() 
	}
	hash(){
		return this.pos[0] +this.pos[1]+this.y+this.x.getTime()
	}
	eq(other){
		return this.equals(other)
	}
	merge(point){
		// TODO
	}
	'short' (){
		let next = {}
		next.y = this.y
		Object.keys(this).forEach(key => {
			next[key] = this[key];
		})
		return next
	}
}

// module.exports.Entry = Entry;
module.exports.Point = Point
