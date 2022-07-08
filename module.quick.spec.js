const parser = require('./module.js')

global.climateplots = {
	dev: true
}
let specs = {
	type: 'temperature',
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
	it('y', () => {
		return cache.fullresult.then(all => {
			return all.yrly.then(yrly => {
				// console.log(yrly)
				let y = -0.21810069713400465;
				return assert.equal(yrly.y, y)
			})
		})
	})
	it('values', () => {
		return cache.fullresult.then(res => {
			return res.yrly.then(yrly => {
				return yrly.values.then(values => {
					return Promise.all(values).then(vals => {
						return assert.equal(vals.length, 110)
					})
				})
			})
		})
	})
})
describe(
	'Requests',
	function() {
		before(function () {
			let config = Object.assign(configs['latest'],specs)
			cache.result = parser.temperature(config)
		});
		it('yearly', (done) => {
			cache.result.then((res) => {
				res.yrly.then(yrly => {
				}).then(done)
			})
		})
		it.only('shortValues', () => {
			return cache.result.then(res => {
				return res.yrly.then(yrly => {
					return yrly.shortValues.then(values => {
						return Promise.all(values).then(vals => {
							// console.log('vals', vals)
							return assert.equal(vals[0].compressed, true)
						})
					})
				})
			})
		})
		it.only('values', () => {
			return cache.result.then(res => {
				return res.yrly.then(yrly => {
					return yrly.values.then(values => {
						return Promise.all(values).then(vals => {

							return assert.equal(vals.length, 3)
						})
					})
				})
			})
		})
		it('values to VALUES', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.values.then(vals => {

						return vals[0].then(value => {
							return yrly.VALUES.then(VALS => {

								return Object.values(VALS)[0].then(VALUE => {
									return assert.equal(VALUE, value)
								})
							})
						})
					})
				})
			})
		})
		it('yearly - length test', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return assert.equal(6, yrly.values.length)
				})
			})
		})
		it('a year', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.values[0].then(year => {
						return assert.equal(2019, year.x)
					})
				})
			})
		})
		it('a DOY', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.values[0].then(year => {
						year.values[0].then(doy => {
							return assert.equal(0, doy.x)
						})
					})
				})
			})
		})
		describe('functions', 
			function() {
				before(function() {
					cache.result[2019] = cache.result.then(res => {
						return res.yrly.then(yrly => {
							return yrly.values.then(values => {
								return values[1]
							})
						})
					}) 
					cache.result[2025] = cache.result.then(res => {
						return res.yrly.then(yrly => {
							return yrly.values.then(values => {
								return values[4]
							})
						})
					}) 
				})
				it('empty', () => {
					return cache.result[2025].then(year => {
						return assert.equal(year.y, undefined)
					})
				})
				it('min', () => {
					return cache.result[2019].then(year => {
						var min = year.min
						return assert.equal(min.y, -26.6)
					})
				})
				it('minAvg', () => {
					return cache.result[2019].then(year => {
						var avg = year.minAvg
						var y = -16.7 
						return assert.equal(y, avg.y)
					})
				})
				it('max', () => {
					return cache.result[2019].then(year => {
						var max = year.max
						return assert.equal(max.y, 24.1)
					})
				})
				it('maxAvg', () => {
					return cache.result[2019].then(year => {
						var avg = year.maxAvg
						var y = 18.1 
						return assert.equal(y, avg.y)
					})
				})
				it('sum', () => {
					return cache.result[2019].then(year => {
						var sum = year.sum
						// console.log(sum)
						return assert.equal(sum.y, 519.1)
					})
				})
				// it('first', () => {
				// 	return cache.result[2019].then(year => {
				// 		year.f = (e) => e <= 0;
				// 		return year.first.then(first => {
				// 			console.log('first',first)
				// 			var y = -4.6 
				// 			return assert.equal(y, first.y)
				// 		})
				// 	})
				// })
				// it('last', () => {
				// 	return cache.result[2019].then(year => {
				// 		year.f = (e) => e <= 0;
				// 		return year.last.then(last => {
				// 			var y = -4.5 
				// 			return assert.equal(y, last.y)
				// 		})
				// 	})
				// })
				it('number', () => {
					return cache.result[2019].then(year => {
						return assert.equal(365, year.values.length)
					})
				})
				it('difference', () => {
					return cache.result[2019].then(year => {
						var diff = year.difference
						// console.log(diff)
						// console.log(diff.entry.req)
						return assert.equal(1.4913425661630546, diff.y)
					})
				})
			})
	}
)
