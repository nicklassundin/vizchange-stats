class Summery {
	constructor(json) {
		this.stations = json.map(each => { return each.station }).filter((item, i, ar) => ar.indexOf(item) === i);
		this.types = []
		json.map(each => { 
			this.types = this.types.concat(Object.keys(each))
		})
		this.types = this.types.filter((item, i, ar) => ar.indexOf(item) === i).filter(each => ['position','date','station'].includes(each));
	}
}
// helper.js
const climatePlotsHelper = require('climate-plots-helper');

const getDateOfWeek = (w, y) => {
	let d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week
	return new Date(y, 0, d);
};

const ColorToHex = (color) => {
	let hexadecimal = color.toString();
	return hexadecimal.length === 1 ? "0" + hexadecimal : hexadecimal;
};

const replace = (req, a, b) => {
	if (req[a]) {
		req[b] = req[a];
		delete req[a];
	}
	return req;
};

module.exports = {
	getDateOfWeek,
	ColorToHex,
	replace,
	climatePlotsHelper,
	Summery
};

