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
		describe('Year', function() {
			// it('Yearly Week', (done) => {
				// let config = Object.assign(configs['year-week'],specs)
				// cache.result = parser.temperature(config).then((res) => {}).then(done)
			// })
			it('Yearly Month', (done) => {
				let config = Object.assign(configs['year-month'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('Yearly Half', (done) => {
				let config = Object.assign(configs['year-half'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})

		})
		describe('Decade', function() {
			it('Decade Year', (done) => {
				let config = Object.assign(configs['decade-year'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('Decade Half', (done) => {
				let config = Object.assign(configs['decade-5year'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('Decade full', (done) => {
				let config = Object.assign(configs['decade-decade'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})

		})
		describe('Century', function() {
			// it('Year', (done) => {
				// let config = Object.assign(configs['century-year'],specs)
				// cache.result = parser.temperature(config).then((res) => {}).then(done)
			// })
			it('5 Year', (done) => {
				let config = Object.assign(configs['century-5year'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('Decade', (done) => {
				let config = Object.assign(configs['century-decade'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('30 Year', (done) => {
				let config = Object.assign(configs['century-30year'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
			it('Full', (done) => {
				let config = Object.assign(configs['century-full'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
		})
	}
)
