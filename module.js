
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
