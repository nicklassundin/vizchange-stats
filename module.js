const {parseByDate} = require('./module/parseByDate.js')
/*
 * Var R = require('r-script');
 * var python=require('python').shell;
 * TODO temporary hotfix
 */
// TODO use const.json instead
const constant = require("./module/const.json");
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

module.exports = {
	getByParams: function (specs, params){
		return this.recursive(params, this[params[0]](specs))
	},
	"recursive": function(params, data, index = 1){
		if(params.length - index === 1){
			if(typeof data.then === 'function'){
				return data.then(function(results){
					if(Array.isArray(results)){
						return results[params[index]]
					}
					return results[params[index]]
				})
			}
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
	getStruct: function(specs, type = undefined) {
		if(this.cache[specs.station] === undefined){
			this.cache[specs.station] = {}
		}
		if(this.cache[specs.station][specs.type] === undefined){
			this.cache[specs.station][specs.type] = {}
		}
		this.cache[specs.station][specs.type] = parseByDate(specs, type)
		return this.cache[specs.station][specs.type].then((value) => { return value})
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
