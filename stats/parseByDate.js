const help = require('climate-plots-helper');
const regression = require("regression");
const {PointFactory} = require('./factory.js')
const {Point} = require('./point.js')
const ByDateStruct = require('./parseByDateStruct.js');

let config = require('./config.json');

const parseByDate = function (specs, type = "mean", custom) {
	specs = Object.assign(config.default, specs);	
	return new Promise((res,rej) => {
		// console.log('parseByDate',specs)
		res(new ByDateStruct(type, custom, specs))
	}).catch(error => [])

};
exports.parseByDate = parseByDate;

