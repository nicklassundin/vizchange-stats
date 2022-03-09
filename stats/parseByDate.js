const help = require('climate-plots-helper');
const regression = require("regression");
const {PointFactory} = require('./factory.js')
const {Point} = require('./point.js')
const ByDateStruct = require('./parseByDateStruct.js');

const parseByDate = function (specs, type = "mean", custom) {
	let factory = new PointFactory(specs);
	let values = factory.createPoints(new Date(specs.start,1,1), new Date(specs.end,1,1))
	let dateStruct = new ByDateStruct(type, custom)
	return new Promise((res,rej) => {
		values.then(val => {
			Promise.all(val).then((vals) => {
				if(vals.length < 1){
					rej({
						"ERROR": "missing error",
						"data": []
					})
				}else if(vals[0].ERROR){
					factory.close();
					rej(vals[0]) 
				}else{
					vals = vals.reduce((a,b) => {
						return a.concat(b)
					})
					if(vals.length < 1){
						res({
							"ERROR": "no data at point",
							"data": []
						})
					}else{
						if(climateplots.dev) {

						console.log("Request Success", {
							"entries": vals.length,
						})
						}
						res(dateStruct.build(vals));
					}
				}
			})
		})
	}).catch(error => [])

};
exports.parseByDate = parseByDate;

