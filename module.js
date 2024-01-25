
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
const {ParserCalc, ParserRaw} = require('./module/parser/parser.js');
class Data {
	constructor(spec){
		this.spec = new Specs(spec);
	}
	init(request) {
		this.request = request;
		let url = this.spec.getUrl(request)
		this.response = axios.get(url)
		if(request.sort) {
			this.parsed = this.response.then(response => {
				return (new ParserCalc(response.data, this.request))
			})
		}else{
			this.parsed = this.response.then(response => {
				return (new ParserRaw(response.data, this.request))
			})
		}
		return this
	}
	get handler() {
		return this.parsed.then(data => {
			return data.handler
		})
	}
	async max(type) {
		return (await this.handler).get(type, 'max')
		return this.calculated(type, 'max');
	}
	async min(type) {
		return (await this.handler).get(type, 'min')
		return this.calculated(type, 'min')
	}
	async mean(type) {
		return (await this.handler).get(type, 'avg')
		return this.calculated(type, 'avg')
	}
	async meanMax(type) {
		return (await this.handler).get(type, 'avg', 'max')
		return this.calculated(type, 'avg', 'max')
	}
	async sum(type) {
		return (await this.handler).get(type, 'sum')
		return this.calculated(type, 'sum')
	}
	async ma(type) {
		return (await this.handler).get(type, 'min', 'ma')
		return this.calculated(type, 'min', 'ma')
	}
	async abs_min(type) {
		return (await this.handler).get(type, 'min', 'min')
		return this.calculated(type, 'min', 'min')
	}
	async abs_max(type) {
		return (await this.handler).get(type, 'max', 'max')
		return this.calculated(type, 'max', 'max')
	}
	async snow(type) {
		return (await this.handler).get(type, undefined, 'snow')
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
