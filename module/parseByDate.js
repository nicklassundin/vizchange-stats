
const ByDateStruct = require('./parseByDateStruct.js');

const parseByDate = function (specs, type = 'avg', custom) {
	//specs = Object.assign(config.default, specs);
	return new Promise((res,rej) => {
		// console.log('parseByDate',specs)
		try {
			let struct = new ByDateStruct(type, custom, specs);
			res(struct)
		}catch(error) {
			rej(error)
		}
	}).catch(() => [])

};
exports.parseByDate = parseByDate;

