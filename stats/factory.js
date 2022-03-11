const help = require('climate-plots-helper');
const curl = require('../curl.js');
const cliProgress = require('cli-progress')
const {Point} = require('./point.js')

Date.prototype.addDays = function(days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;

}
Date.prototype.addMonths = function(months) {
	var date = new Date(this.valueOf());
	date.setMonth(date.getMonth() + months);
	return date;
}
Date.prototype.addYears = function(years) {
	var date = new Date(this.valueOf());
	date.setFullYear(date.getFullYear() + years);
	return date;

}
function getDates(startDate, stopDate, specs) {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate < stopDate) {
		// console.log("current", currentDate)
		// let diffTime = stopDate - currentDate.addDays(specs.interval);
		// let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
		// if(diffDays > 0){
			// diffDays = 0; 
		// }
		let nextDate = currentDate.addDays(specs.interval)
		if(nextDate - stopDate >= 0){
			nextDate = stopDate
		} 
		// console.log("next - diff", nextDate)
		dateArray.push({
			start: new Date (currentDate),
			end: nextDate
		});
		currentDate = nextDate;
	}
	// console.log(dateArray)
	return dateArray;
}
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

// dynamic filling element for curl
module.exports.PointFactory = class PointFactory{
	constructor(specs){
		this.specs = specs;
		this.bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
		this.startTime = (new Date()).getTime();
		this.station = specs.station;
		this.type = specs.type;
		this.queue = 0;
		this.complete = 0;
		this.url = specs.url;
	}
	barUpdate(){
		this.complete += 1;
		this.bar.update(this.complete);
		if(this.complete == this.length){
			this.close();
			// console.log("time",(new Date()).getTime()-this.startTime)
		}
	}
	async createPoints(startDate, stopDate) {
		let dates = await getDates(startDate, stopDate, this.specs)
		this.length = dates.length;
		this.bar.start(this.length,0);
		return dates.map(dates => {
			// var delay = (Math.floor(Math.random() * 7)) + 2;
			// setTimeout(delay * 1000);
			return this.createPoint(dates)
		}).sort((a,b) => a.x-b.x)
	}
	async createPoint(dates){
		let station = this.station;
		let type = this.type;
		let date = new Date();
		// let timeInMs = Math.random() * (3000);
		// await sleep(timeInMs);
		let res = await curl.curlProx(this.url, station, dates, type).then(response => {			
			let points = {};
			try{
				response.forEach(each => {
					let point = new Point(each, type)

					// if(points[point.hash()]){
					// TODO merge
					// }else 
					// if(point.y != undefined){
					if(!points[point.hash()]){
						points[point.hash()] = point		
					}
					// }
				})
			}catch(error){
				throw error
			}
			this.barUpdate();
			return Object.values(points)
		}).catch(error => {
			// console.log(error)
			// throw error
			return error
		})
		return res

	}
	close(){
		if(climateplots.dev) this.bar.stop();
	}
}

let replace = (req, a, b) => {
	if(req[a]){
		req[b] = req[a];
		delete req[a]
	}
	return req;
}

