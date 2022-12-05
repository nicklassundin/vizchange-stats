const help = require('climate-plots-helper');
const curl = require('../gateway.js')

function ColorToHex(color) {
	let hexadecimal = color.toString();
	return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
}

let replace = (req, a, b) => {
	if(req[a]){
		req[b] = req[a];
		delete req[a]
	}
	return req;
}

let nr_max = 0;
Array.prototype.divideConquerFilter = function(f){
	let nr = 0
	let recursive = function(array){
		nr += 1;
		if(nr_max < nr){
			nr_max = nr;
		}
		if(array.length === 0) return []
		switch(f(array[array.length - 1])){
			case -1:
				return []
			case 0:
				switch(f(array[0])){
					case -1:
						return recursive(array.slice(0, Math.floor(array.length/2)))
							.concat(recursive(array.slice(Math.floor(array.length/2))))
					case 0:
						return array;
					default:
						throw new Error('Should not happen')
				}
			case 1:
				switch(f(array[0])){
					case -1:
						return recursive(array.slice(0, Math.floor(array.length/2)))
							.concat(recursive(array.slice(Math.floor(array.length/2))))
						break;
					case 0:
						return array;
					default:
						return []
				}
		}
	}

	return recursive(this)
}
class PointReq {
	static build(requests, specs){
		try{
			requests = requests.map(each => {
				each.date = new Date(each.date)
				return each
			}).sort((a, b) => {
				if(a.date.getTime() < b.date.getTime()){
					return -1
				}else if(a.date.getTime() > b.date.getTime()){
					return 1
				}else{
					return 0
				}
			})
		}catch (error) {
			throw error
		}
		let result = {}
		switch (specs.subType) {
			case 'high':
				requests.forEach(req => {
					let date = new Date(req.date)
					let key = `${date.getFullYear()}${help.dayOfYear(date)}${req.position}`
					if(typeof result[key] !== 'object'){
						result[key] = req
					}else if(Number(req[`${specs.parentType}_${specs.type}`]) < Number(result[key][`${specs.parentType}_${specs.type}`])){
						result[key] = req
					}
				});
				break
			case 'low':
				requests.forEach(req => {
					let date = new Date(req.date)
					let key = `${date.getFullYear()}${help.dayOfYear(date)}${req.position}`
					if(typeof result[key] !== 'object'){
						result[key] = req
					}else if(req[`${specs.parentType}_${specs.type}`] > result[key][`${specs.parentType}_${specs.type}`]){
						result[key] = req
					}
				})
				break
			/*
			case 'maxAvg':
				// TODO sort out this so it takes averages of daily weekly etc
				requests.forEach(req => {
					let date = new Date(req.date)
					let key = `${date.getFullYear()}${help.dayOfYear(date)}${req.position}`
					if(result[key] === undefined){
						result[key][`${specs.subType}_${specs.type}`] = []
						result[key][`${specs.subType}_${specs.type}`] = [req[`${specs.parentType}_${specs.type}`]]
					}
					result[key][`${specs.subType}_${specs.type}`].push(req[`${specs.parentType}_${specs.type}`])
				})
*/
				break;
			default:
				requests.forEach(req => {
					if(typeof result[`${req.date}${req.position}`] !== 'object') result[`${req.date}${req.position}`] = {}
					Object.assign(result[`${req.date}${req.position}`], req)
				})
		}
		return Object.values(result).filter(each => {
			if(typeof each.date === 'string') each.date = new Date(each.date)
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
		switch (specs.type) {
			case 'co2_weekly':
				if(this.y !== undefined && !isNaN(this.y)){
					this.req[specs.type] = this.req[specs.type].replace(' ', '')
				}
				break;
			default:
		}
		request = replace(request,'glob_temp', 'temperature')
		request = replace(request,'64n-90n_temp', 'temperature')
		request = replace(request,'nhem_temp', 'temperature')
		this.request = request;
		Object.keys(request).forEach((key) => {
			this[key] = request[key];
		})
	}
	get 'year' (){
		return this.date.getFullYear();
	}
	get 'splitYear' () {
		if(help.isFirstHalfYear(this.month)){
			return this.year - 1
		}else{
			return this.year
		}
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
	get 'month' (){
		return this.date.getMonth();
	}
	get 'week' (){
		return this.date.getWeekNumber()
	}
	get 'season' () {
		return help.getSeasonByIndex(this.month)
	}
	get 'dayOfMonth' () {
		return this.date.getDate()
	}
}

class Point {
	static build(specs, full=false){
		switch (specs.keys[0]){
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
			case 'spring':
			case 'summer':
			case 'winter':
			case 'autumn':
			case 'year':
				full = true;
				break;
			default:
		}
		return curl.proxRequest(specs, full).then(res => {
			if (res.length < 1) return new Point(specs, res, full)

			if (!full) res = res.reduce((a, b) => Object.assign(a, b))
			return new Point(specs, res, full);
		})
	}
	constructor(specs, req = {}, full=false){
		this.full = full;
		this.specs = specs;
		if(typeof this.specs.dates.start === 'string'){
			this.specs.dates.start = new Date(this.specs.dates.start)
			this.specs.dates.end = new Date(this.specs.dates.end)
		}
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
		//this.monthName = help.monthByIndex(this.month);
		//this.season = help.getSeasonByIndex(this.month)
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
	get 'date' () {
		// TODO sort out none valid points HOTFIX
		//if(this.req.length < 1) return this.x
		if(this.req.length < 1) return undefined
		switch (this.specs.subType){
			case 'last':
				if(this.years.length > 0){
					return Object.values(this.req.reduce((all, current) => {
						let year = current.splitYear
						all[year] = current.date
						return {
							...all
						}
					}, {}))
				}else{
					return this.req[this.req.length - 1].date
				}
			case 'first':
				if(this.years.length > 0){
					return Object.values(this.req.reduce((all, current) => {
						let year = current.splitYear
						if(all[year] === undefined) all[year] = current.date
						return {
							...all
						}
					}, {}))
				}else{
					return this.req[0].date
				}
			case 'breakfreeze':
				return new Date(this.req[0][this.type])
			case 'avg':
				if(typeof this.x === 'number') return new Date(this.x)
			default:
				return this.x;
		}
	}
	choice(key, start, end) {
		switch(key){
			case 'spring':
			case 'summer':
			case 'winter':
			case 'autumn':
				return this.req.filter((e) => {
					e.date = new Date(e.date)
					let season = help.getSeasonByIndex(e.date.getMonth())
					return season === specs.keys[0]
				})
				break;
			case 'weeks':
				return this.req.filter((e) => {
					return e.date.getWeekNumber()
				})
				break;
			case 'splitMonth':
				return this.req.filter((e) => {
					e.date = new Date(e.date)
					let month = e.date.getMonth()
					return (month >= start.getMonth()) && (month <= end.getMonth())
				})
				break
			default:
				return this.req.filter(function(a){return a.date>=start&&a.date<=end});
		}
	}
	'dateSlice' (start, end) {
		let specs = JSON.parse(JSON.stringify(this.specs));
		specs.keys.shift()
		specs.dates.start = start;
		specs.dates.end = end;
		if(Array.isArray(this.req)){
			// TODO return to struct two piles of entries within and outside dates
			return new Point(specs, this.choice(specs.keys[0], start, end), this.full)
		}else{
			if((this.specs.dates.start > start) && (this.specs.dates.end < end)){
				return this
			}else{
				return NaN
			}
		}
	}
	get 'x'(){
		switch(this.specs.keys[0]){
			case 'autumn':
			case 'spring':
			case 'summer':
			case 'winter':
				return this.specs.keys[0]
			case 'weekly':
			case 'week':
				return this.week
			case 'all':
				return (new Date(this.req.date).getTime())
			case 'splitYear':
			case 'yrly':
			case 'year':
				switch(this.SUBTYPE) {
					case 'breakfreeze':
						return this.year + 1;
					default:
						return this.year
				}
			case 'splitMonth':
				return this.monthName
			case 'months':
				return this.monthName
			case 'month':
				return this.monthName
			case 'decade':
				return this.decade
			default:
				return this.specs.dates
		}
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
	'first'(f){
		//let n = 0;
		let req = this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		}).filter((e) => {
			//n += 1;
			//console.log(n+'/'+this.req.length)
			return f(this.getY(e))
		})
		return new Point(this.specs, req, true)
	}
	'last'(f){
		let req = this.req.sort((a, b) => {
			return (new Date(a.date).getTime()) - (new Date(b.date).getTime())
		}).filter((e) => {
			return f(this.getY(e))
		})
		return new Point(this.specs, req, true)
	}
	'high' (f){
		return this.occurrence(f)
	}
	'low' (f) {
		return this.occurrence(f)
	}
	'occurrence'(f){
		let req = this.req.filter((e) => {
			return f({
				'y': this.getY(e)
			})
		})
		return new Point(this.specs, req, true)
	}
	set 'y' (val){
		this.req[`${this.subType}${this.type}`] = val
	}
	'getY'(req = this.req){
		let y = req[`${this.type}`]
		let date = new Date(req[this.type]);

		switch (this.specs.dates.type) {
			case 'month':
				if(help.monthByIndex(req.date.getMonth()) !== this.specs.keys[0]) return undefined
				break;
			case 'spring':
			case 'autumn':
			case 'winter':
			case 'summer':
				if(help.getSeasonByIndex(req.date.getMonth()) !== this.specs.keys[0]) return undefined
			default:
		}
		switch (this.SUBTYPE){
			case 'breakfreeze':
				y = help.dayOfYear(date)
				if(help.isFirstHalfYear(date.getMonth()) && this.specs.type === 'freezeup'){
					y += (((date.getFullYear()-1) % 4 === 0 && (date.getFullYear()-1) % 100 > 0) || (date.getFullYear()) %400 === 0) ? 366 : 365;
				}
				return y
			case 'last':
			case 'first':
				date = this.date
				if(!Array.isArray(date)){
					date = [date];
				}
				date = date.map(each => help.dayOfYear(each)).reduce((a, b) => a + b)/date.length
				return {
					value: date,
					y: req[`${this.specs.parentType}_${this.type}`]
				}
			case 'high':
			case 'low':
				return req[`${this.specs.parentType}_${this.type}`]
			case 'difference':
				if(typeof y == 'object'){
					return y.difference
				}else if(this.specs.parentType === 'sum') {
					return req[`avg_${this.type}`].difference
				}
				return req[`${this.specs.parentType}_${this.type}`].difference
			case 'growingSeason':
				let res = {}
				res.value = Number(req[`${this.specs.parentType}_${this.type}`])
				res.start = req.date;
				res.end = req.date;
				return res
			case 'snow':
			case 'rain':
				switch (this.specs.keys[0]) {

				}
				y = req[`${this.subType}${this.type}`]
				break;
			case 'minAvg':
			case 'maxAvg':
				y = req[`${'avg'}_${this.type}`]
				if(y === undefined && req[this.type] !== undefined){
					y = req[this.type]
				}
				if(typeof y == 'object'){
					y = Number(y[this.specs.parentType])
				}else{
					y = Number(y)
				}
				return {
					date: req.date,
					y: y
				}
			default:
				// TODO generalize
		}
		if(y === undefined) y = req[`${this.subType}${this.type}`];
		if(y === undefined && this.SUBTYPE === 'sum') y = req[`avg_${this.type}`]
		if(y === undefined) y = req[this.type];
		if(typeof y == 'object') y = y[this.SUBTYPE]
		return Number(y)
	}
	key(date) {
		switch (this.specs.keys[this.specs.keys.length - 1]) {
			case 'DOY':
				return `${help.dayOfYear(date)}`
			case 'week':
				return `${date.getWeekNumber()}`
			case 'month':
				return `${date.getMonth()}`
			default:
		}
	}
	get 'y' (){
		let result = NaN;
		if(this.req.length === 0) return NaN
		if(this.full){
			result = this.req.map(each => this.getY(each)).filter(y => (y !== undefined && !isNaN(y)) || (typeof y === 'object'))
			if(result.length === 0) return NaN
			switch(this.SUBTYPE){
				case 'sum':
					switch (this.specs.keys[0]) {
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
						case 'yrly':
						case 'spring':
						case 'summer':
						case 'winter':
						case 'autumn':
							return result.reduce((a,b) => a + b)/this.years.length
						default:
							return result.reduce((a,b) => a + b)
					}
				case 'avg':
					return result.reduce((a,b) => a + b)/result.length
				case 'min':
				case 'max':
					return Math[this.SUBTYPE](...result)
				case 'maxAvg':
				case 'minAvg':
					let time = this.specs.keys[this.specs.keys.length - 1]
					result = result.reduce((all, entry) => {
						let key = this.key(entry.date)
						let year = entry.date.getFullYear();
						if(all[year] === undefined){
							all[year] = {}
							all[year][key] = {
								value: key,
								y: []
							}
						}else if(all[year][key] === undefined){
							all[year][key] = {
								value: key,
								y: []
							};
						}
						//console.log('(', (all[year][key] ? all[year][key].y : 0),'*', (all[year][key] ? all[year][key].nr : 1), '+', entry.y, ')/', ((all[year][key] ? all[year][key].nr : 0) + 1))
						if(!isNaN(entry.y)) all[year][key].y.push(entry.y)

						return all;
					}, {})
					result = Object.values(result).map(year => Object.values(year)).filter(year => {
						return year.length > 10
					})
					result = result.map(year => {
						year = year.map(each => {
							switch (this.specs.parentType) {
								case 'avg':
									each.y = each.y.reduce((a, b) => a + b)/each.y.length
									return each
								case 'sum':
									if(each.y.length === 0){
										each.y == NaN
									}else{
										each.y = each.y.reduce((a, b) => a + b)
									}

									return each
								default:
									return each
							}
						})
						switch (this.SUBTYPE) {
							case 'minAvg':
								return year.sort((a, b) => (a.y - b.y)/Math.abs(a.y - b.y))[0]
							case 'maxAvg':
								return year.sort((a, b) => (b.y - a.y)/Math.abs(a.y - b.y))[0]
						}
					})
					return result.reduce((all, current) => {
						all.y = (all.y*all.value.length) + current.y
						all.value.push(current.value)
						all.y = all.y/all.value.length
						return all
					}, {
						value: [],
						y: 0,
					})
					break;
				case 'snow':
				case 'rain':
					return result.reduce((a,b) => a + b)
				case 'last':
					return this.getY(this.req[this.req.length - 1])
				case 'first':
					return this.getY(this.req[0]);
				case 'difference':
					return this.difference
				case 'breakfreeze':
					switch (this.specs.keys[0]) {
						case 'yrlySplit':
							return result.reduce((a,b) => a + b)/result.length
						default:
							return result[0]
					}
				case 'growingSeason':
					result = result.filter(each => each.start !== undefined).sort((a, b) => (new Date(a)) < (new Date(b)))
					result = result.reduce((all, entry) => {
						let doy = this.key(entry.start)
						let year = entry.start.getFullYear();
						if(all[year] === undefined) all[year] = {}
						let curr = {
							value: (all[year][doy] ? all[year][doy].value : []).concat([entry.value]),
							nr: (all[year][doy] ? all[year][doy].nr : 0) + 1,
							y: (all[year][doy] ? all[year][doy].y : 0) + entry.y,
							start: (all[year][doy] ? all[year][doy].start : entry.start),
							end: entry.end
						}
						all[year][doy] = curr;
						return {
							...all,
							//[doy]: curr,
						};
					}, {});
					Object.keys(result).forEach(key => {
						result[key] = Object.values(result[key]).map(each => {
							each.value = each.value.reduce((a, b) => a + b)/each.nr
							let f = (e) => e > 0
							each.y = f(each.value) ? 1 : 0;
							return each
						}).reduce((all, current) => {
							// NEXT TODO
							if(all.length > 0) {
								current.y = current.y > 0 ? current.y + all[all.length - 1].y : 0
								current.start = current.y > 0 ? all[all.length - 1].start : current.start
							}
							all.push(current)
							return all
						}, [])
						result[key] = Math.max(...result[key].map(e => e.y));
					})
					result = Object.values(result).filter(each => each !== 0)
					if(result.length === 0) return undefined
					return result.reduce((a, b) => a + b)/result.length
				case 'high':
				case 'low':
					return result.length
				default:
					return result

			}
		}else{
			switch(this.SUBTYPE){
				default:
					return this.getY()
			}
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
			return Point.build(specs, true);
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
		return this.startDate.getFullYear();
	}
	get 'strDate'(){
		return `${this.year}-${this.startDate.month+1}-${this.startDate.getDate()}`
	}
	get 'years' (){
		let start = this.specs.dates.start.getFullYear();
		let end = this.specs.dates.end.getFullYear();
		return Array.from({length: (end - start)}, (v, k) => k + start)
	}
	get 'seasons' (){
		return Object.keys(help.seasons)
	}
	get 'months' () {
		return help.months()
	}
	get 'weeks' () {
		return Array.from({length: (53 - 1)}, (v, k) => k + 1)
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
	}
	get 'startDate'() {
		return this.specs.dates.start;
	}
	get 'month' (){
		return this.startDate.getMonth();
	}
	get 'monthName'() {
		return help.monthByIndex(this.month);
	}
	get 'week' (){
		return this.startDate.getWeekNumber();
	}
	get 'DOY' (){
		return help.dayOfYear(this.startDate)
	}
	get 'DOYs' (){
		let start = help.dayOfYear(this.specs.dates.start)
		let end = help.dayOfYear(this.specs.dates.end.addDays(-1))
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
	get 'short' (){
		let y = this.y
		let value = undefined;
		switch(this.SUBTYPE) {
			case 'first':
			case 'last':
				value = Number(y.y)
				y = y.value

				break;
			case 'minAvg':
			case 'maxAvg':
				value = Number(y.value)
				y = y.y;
			default:
		}
		return {
			compressed: true,
			y: y,
			x: this.x,
			colors: {
				red: ColorToHex(255, 55 + Math.floor(y * 200 / (this.y - y)), 0),
				blue: ColorToHex(55 + Math.floor(y * 200 / (this.y - y)), 255, 0)
			},
//			type: this.type,
			xInterval: this.specs.dates,
//			typeMeta: this.typeMeta,
			date: this.date,
			value
		}
	}
	'getSeed' () {
		let specs = this.specs;
		let req = this.req
		return {
			specs,
			req
		}
	}
	get 'splinter' () {
		return this.req.map(req => {
			return new Point(this.specs, req)
		}).sort((a, b) => {
			return (a.date - b.date)
		})
	}
}
// module.exports.Entry = Entry;
module.exports.Point = Point