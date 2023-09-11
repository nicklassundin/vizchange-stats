
'use strict';
const http = require('http');
const axios = require('axios').create({
	httpAgent: new http.Agent({
//		keepAlive: true,
		scheduling: 'fifo',
		maxSockets: 1,
		maxTotalSockets: 1,
	}),
});
const {Specs} = require('./module/specs');
const {Point} = require('./module/point');
const {Parser} = require('./module/rscript/parser.js');
class Data {
	constructor(spec){
		this.spec = new Specs(spec);
	}
	init(request) {
		let url = this.spec.getUrl(request)
		console.log(url)
		this.parsed = axios.get(url).then(response => (new Parser(response.data)))
		return this
	}
	calculated (type, column) {
		if(type === ''){
			throw(new Error('Request has no type'))
		}else{
			return this.parsed.then(data => {
				return data.calculate(type, column).then(result => {
					return result
				})
			})
		}
	}
	max(type) {
		return this.calculated(type, 'max');
	}
	min(type) {
		return this.calculated(type, 'min')
	}
	mean(type) {
		return this.calculated(type, 'mean')
	}
	sum(type) {
		return this.calculated(type, 'sum')
	}
	getRaw (column) {
		return this.parsed.then(data => {
			return data.raw(column).then(result => {
				return result
			})
		})
	}
	snow() {
		return this.getRaw('snow')
	}
	getByParams(request, params) {
		request.types = [params[0]]
		request.sort = params[1].replace('yrly', 'year')
		return this.get(request).then(result => {
			return result
		})
	}
};
module.exports.Data = Data
