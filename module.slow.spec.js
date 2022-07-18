const parser = require('./module.js')

global.climateplots = {
	dev: true
}
let specs = {
	type: 'precipitation',
	station: 'abisko',
	baseline: {
		'start': 1960,
		'end': 1980
	}
}
let configs = require('./stats/config.json')
let cache = {}
const assert = require('assert');
describe('Request-full', function() {
	before(function () {
		let config = Object.assign(configs['full'],specs)
		cache.fullresult = parser.temperature(config)
	})
	it.only('y', () => {
		return cache.fullresult.then(all => {
			return all.yrly.then(yrly => {
				// console.log(yrly)
				let y = 1.5903616882136928;
				return assert.equal(yrly.y, y)
			})
		})
	})
	it.only('values', () => {
		return cache.fullresult.then(res => {
			return res.yrly.then(yrly => {
				return yrly.values.then(values => {
					return Promise.all(values).then(vals => {
						return assert.equal(vals.length, 101)
					})
				})
			})
		})
	})
	it.only('value of index [0]', () => {
		return cache.fullresult.then(res => {
			return res.yrly.then(yrly => {
				return yrly.values.then(values => {
					return Promise.all(values).then(vals => {
						return assert.equal(vals[0].x, 1920)
					})
				})
			})
		})
	})
})
describe(
	'Requests',
	function() {
		describe('Latest', function() {
			it('year', (done) => {
				let config = Object.assign(configs['latest'],specs)
				cache.result = parser.temperature(config).then((res) => {}).then(done)
			})
		})
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
