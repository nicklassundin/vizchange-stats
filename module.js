
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
const {ParserRaw} = require('./module/rscript/parser.js');
class Data {
	constructor(spec){
		this.spec = new Specs(spec);
	}
	init(request) {
		this.request = request;
		let url = this.spec.getUrl(request)
		if(request.sort) {
			this.parsed = axios.get(url).then(response => {
				return (new Parser(response.data, this.request))
			})
		}else{
			this.parsed = axios.get(url).then(response => {
				return (new ParserRaw(response.data, this.request))
			})
		}
		return this
	}
	calculated (type, tag, calc) {
		if(type === ''){
			throw(new Error('Request has no type'))
		}else{
			return this.parsed.then(data => {
				return data.get(type, tag, calc)
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
		return this.calculated(type, 'avg')
	}
	meanMax(type) {
		return this.calculated(type, 'avg', 'max')
	}
	sum(type) {
		return this.calculated(type, 'sum')
	}
	ma(type) {
		return this.calculated(type, 'min', 'ma')
	}
	abs_min(type) {
		return this.calculated(type, 'min', 'min')
	}
	abs_max(type) {
		return this.calculated(type, 'max', 'max')
	}
	snow(type) {
		return this.calculated(type, undefined, 'snow')
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
