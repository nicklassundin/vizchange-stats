module.exports = class Summery {
	constructor(json) {
		this.stations = json.map(each => { return each.station }).filter((item, i, ar) => ar.indexOf(item) === i);

		this.types = []
		json.map(each => { 
			this.types = this.types.concat(Object.keys(each))
		})
		this.types = this.types.filter((item, i, ar) => ar.indexOf(item) === i).filter(each => ['position','date','station'].includes(each));
	}
}
