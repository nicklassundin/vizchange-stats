
const help = require('climate-plots-helper');
const {parseByDate} = require('./module/parseByDate.js')
/*
 * Var R = require('r-script');
 * var python=require('python').shell;
 * TODO temporary hotfix
 */
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
		if(params.length - index <= 1){
			if(typeof data.then === 'function'){
				return data.then(function(results){
					if(Array.isArray(results)){
						return Promise.all(results).then(function(values){
							return values[params[index]]
						})
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
		}else if(typeof data.then === 'function'){
			return data.then(function(values){
				return module.exports.recursive(params, values[params[index]], index+1)
			})
		}else if(typeof data === 'function'){
			return module.exports.recursive(params, data(params[index]), index+1)
		}else{
			return module.exports.recursive(params, data[params[index]], index+1)
		}
	},
	"temperature" (specs) {
		return parseByDate(specs)
	},
	"precipitation" (specs) {
		return parseByDate(specs, 'sum')
	},
	// "growingSeason" (specs) {
	// return parseByDate(specs) 
	// },
	"snowdepth_single" (specs) {
		return parseByDate(specs)
	},
	"complete_ice_cover" (specs) {
		return parseByDate(specs)
	},
	"perma" (specs) {
		return parseByDate(specs)
	},
	"icetime" (specs) {
		return parseByDate(specs)
	},
	"breakup" (specs) {
		return parseByDate(specs)
	},
	"freezeup" (specs) {
		return parseByDate(specs)
	},
	"co2_weekly" (specs){
		return parseByDate(specs)
	},
	"configs": require('./config')
};
