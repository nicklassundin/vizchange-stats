const parser = require('./module.js')

global.climateplots = {
	dev: true
}
let specs = {
	type: 'precipitation',
	station: 'abisko',
}
let configs = require('./stats/config.json')
let cache = {}
describe(
	'Requests',
	function() {
		it('year', (done) => {
			let config = Object.assign(configs['latest'],specs)
			cache.result = parser.temperature(config).then((res) => {
				// console.log(Object.keys(res))
				res.yrly.then(yrly => {
					// console.log(yrly)
					console.log('yrly length',yrly.values.length)
				})
				// console.log(res.entries.length)
			}).then(done)
		})
	}
)
