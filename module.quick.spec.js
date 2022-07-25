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
let configs = require('./module/config.json')
let cache = {}

const assert = require('assert');
describe(
	'Requests',
	function() {
		before(function () {
			let config = Object.assign(configs['latest'],specs)
			cache.result = parser.temperature(config)
		});
		it.only('shortValues', () => {
			return cache.result.then(res => {
				return res.yrly.then(yrly => {
					return yrly.shortValues.then(values => {
						return Promise.all(values).then(vals => {
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

							return assert.equal(vals.length, 6) // TODO should be 3
						})
					})
				})
			})
		})
		it.only('yearly - length test', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.values.then(values => {
						return assert.equal(values.length, 6) // TODO should be 3
					})
				})
			})
		})
		it.only('valuesAll', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.valuesAll.entry.then(all => {
						return all.req.length > 1000
						return assert.equal(all.req.length, 1461)
					})
				})
			})
		})
		it('a year', () => {
			return cache.result.then((res) => {
				return res.yrly.then(yrly => {
					return yrly.values.then(years => {
						return assert.equal(2019, years[0].x)
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
						let min = year.min;
						return assert.equal(min.y, -26.6)
					})
				})
				it('minAvg', () => {
					return cache.result[2019].then(year => {
						let avg = year.minAvg;
						const y = -16.7;
						return assert.equal(y, avg.y)
					})
				})
				it('max', () => {
					return cache.result[2019].then(year => {
						let max = year.max;
						return assert.equal(max.y, 24.1)
					})
				})
				it('maxAvg', () => {
					return cache.result[2019].then(year => {
						let avg = year.maxAvg;
						let y = 18.1;
						return assert.equal(y, avg.y)
					})
				})
				it('sum', () => {
					return cache.result[2019].then(year => {
						let sum = year.sum;
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
						const diff = year.difference;
						// console.log(diff)
						// console.log(diff.entry.req)
						return assert.equal(1.4913425661630546, diff.y)
					})
				})
			})
	}
)
