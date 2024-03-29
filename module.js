const ByDateStruct = require('./module/parseByDateStruct.js');
const parseByDate = function (specs, type = 'avg', custom) {
	//specs = Object.assign(config.default, specs);
	return new Promise((res,rej) => {
		try {
			let struct = new ByDateStruct(type, custom, specs);
			res(struct)
		}catch(error) {
			rej(error)
		}
	}).catch(() => [])

};
/*
 * Var R = require('r-script');
 * var python=require('python').shell;
 * TODO temporary hotfix
 */
// TODO use const.json instead
const constant = require("./module/const.json");
const http = require("http");
/**
global.startYear = constant.startYear;
global.baselineLower = constant.baselineLower;
global.baselineUpper = constant.baselineUpper;
*/
// global.vizchangeStats = {
// 	startYear: constant.startYear,
// 	baselineLower: constant.baselineLower,
// 	baselineUpper: constant.baselineUpper
// }
//
const axios = require('axios').create();


module.exports = {
	getByParams: function (specs, params){
		return this.recursive(params, this[params[0]](specs).then(result => result.request(params[1])))
	},
	precalcCached: {},
	getByParamsPreCalculated: function (specs, params){
		let struct = axios.get(`${specs.url}/precalculated/${specs.station}/${params.join('/')}?start=${specs.dates.start}&end=${specs.dates.end}&baselineStart=${specs.baseline.start}&baselineEnd=${specs.baseline.end}`)

		let key = `${specs.type}${specs.dates.start}${specs.dates.end}${specs.baseline.start}${specs.baseline.end}`
		if(typeof this.precalcCached[specs.station] !== 'object'){
			this.precalcCached[specs.station] = {};
			this.precalcCached[specs.station][key] = {}
		}else if(typeof this.precalcCached[specs.station][key] !== 'object'){
			this.precalcCached[specs.station][key] = {}
		}
		this.precalcCached[specs.station][key] = Object.assign(this.precalcCached[specs.station][key], this.precalcCached[specs.station][key]  = params.reverse().reduce((all, current) => {
			let res = {};
			res[current] = all;
			return res;
		}, struct), true)
		return struct
	},
	"recursive": function(params, data, index = 2){
		if(params.length - index === 1){
			if(typeof data.then === 'function'){
				return data.then(function(results){
					return results[params[index]]
				})
			}
			return data[params[index]];
		}else if(params.length - index < 1){
			return data
		}else if(typeof data.then === 'function'){
			return data.then(function(values){
				if(typeof values[params[index]] === 'function'){
					return module.exports.recursive(params, values[params[index]](params[index+1]), index+2)
				}
				return module.exports.recursive(params, values[params[index]], index+1)
			})
		}else if(typeof data === 'function'){
			return module.exports.recursive(params, data(params[index]), index+1)
		}else{
			return module.exports.recursive(params, data[params[index]], index+1)
		}
	},
	clear (){
		this.cache = {};
		return this;
	},
	getStruct: function(specs, type = undefined) {
		let key = `${specs.type}${specs.dates.start}${specs.dates.end}${specs.baseline.start}${specs.baseline.end}`
		//let key = `${specs.type}${specs.dates.start}${specs.dates.end}`
		if(this.cache[specs.station] === undefined){
			this.cache[specs.station] = {}
		}
		if(this.cache[specs.station][key] === undefined) {
			this.cache[specs.station][key] = parseByDate(specs, type, undefined, this.precalcCached)
		}
		return this.cache[specs.station][key].then((value) => {
			return value
		})
	},
	cache: {},
	"temperature" (specs) {
		return this.getStruct(specs)
	},
	"precipitation" (specs) {
		return this.getStruct(specs, 'sum')
	},
	// "growingSeason" (specs) {
	// return parseByDate(specs) 
	// },
	"snowdepth_single" (specs) {
		return this.getStruct(specs)
	},
	"complete_ice_cover" (specs) {
		return this.getStruct(specs)
	},
	"perma" (specs) {
		return this.getStruct(specs)
	},
	"icetime" (specs) {
		return this.getStruct(specs)
	},
	"breakup" (specs) {
		return this.getStruct(specs)
	},
	"freezeup" (specs) {
		return this.getStruct(specs)
	},
	"co2_weekly" (specs){
		return this.getStruct(specs)
	},
	"configs": require('./config')
};
