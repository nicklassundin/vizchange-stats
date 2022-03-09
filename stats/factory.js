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
function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate <= stopDate) {
		// nextDate = apiconfig.debug ? stopDate.addMonths(1) : currentDate.addYears(5);
		// nextDate = currentDate.addDays(1)
		nextDate = currentDate.addYears(5)
		dateArray.push({
			start: new Date (currentDate),
			end: nextDate
		});
		// console.log('current',currentDate)
		// console.log('next',nextDate)
		currentDate = nextDate;
	}
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
		this.bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
		this.startTime = (new Date()).getTime();
		this.station = specs.station;
		this.type = specs.type;
		this.queue = 0;
		this.complete = 0;
		this.bar.start(100,0);
		this.url = specs.url;
	}
	barQueue(){
		if(climateplots.dev){
			this.queue += 100;
		}
	}
	barUpdate(){
		if(climateplots.dev){
			this.complete += 100;
			this.queue -= 100;
			this.bar.update(100*this.complete/(this.queue+this.complete));
			if(this.progress == 100){
				this.close();
				console.log("time",(new Date()).getTime()-this.startTime)
			}
		}
	}
	async createPoints(startDate, stopDate) {
		return await getDates(startDate, stopDate).map(dates => {
			return this.createPoint(dates)
		}).sort((a,b) => a.x-b.x)
	}
	async createPoint(dates){
		this.barQueue();
		let station = this.station;
		let type = this.type;
		let date = new Date();
		// console.log("station",station)
		// console.log("type",type)
		// console.log('dates',dates)
		// let timeInMs = Math.random() * (3000);
		// await sleep(timeInMs);
		let res = await curl.curlProx(this.url, station, dates, type).then(response => {			
			let points = {};
			try{
					response.forEach(each => {
						// console.log(each)
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
				// console.log(response)
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
	get progress(){
		return 100*this.complete/(this.queue+this.complete);
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

