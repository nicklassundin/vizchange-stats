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
    function () {
        before(function () {
            let config = Object.assign(configs['latest'], specs)
            cache.result = parser.temperature(config)
        });
        describe.only('recursive', function () {
            it('promises', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then((values) => {
                    return assert.equal(values, 0.4771604938271605)
                })
            })
            it('promises & arrays', function () {
                let params = ['temperature', 'yrly', 'values', 0, 'x'];
                let config = Object.assign(configs['latest'], specs)
                return parser.getByParams(config, params).then(function (values) {
                    return assert.equal(values, 2019)
                })
            })
            it('multiple', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                return Promise.all([parser.getByParams(config, params),
                    parser.getByParams(config, params)]).then(values => {
                    return assert.equal(values[0], values[1])
                })
            })
            it('cached', function () {
                let params = ['temperature', 'yrly', 'y'];
                let config = Object.assign(configs['latest'], specs)
                parser.getByParams(config, params)
                return parser.cache['abisko']['temperature'].then(values => {
                    return values
                })
            })
        })
        describe.only('functionality', function () {
            it('y', () => {
                // let params = ['temperature', 'yrly', 'y'] TODO replace this with somethingdoug
                return cache.result.then(res => {
                    return res.yrly.then(yrly => {
                        return yrly.y.then(values => {
                            return typeof values === 'number'
                        })
                    })
                })
            })
            it('shortValues', () => {
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
            it('values', () => {
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
            it('yearly - length test', () => {
                return cache.result.then((res) => {
                    return res.yrly.then(yrly => {
                        return yrly.values.then(values => {
                            return assert.equal(values.length, 6) // TODO should be 3
                        })
                    })
                })
            })
            it('valuesAll', () => {
                return cache.result.then((res) => {
                    return res.yrly.then(yrly => {
                        return yrly.valuesAll.entry.then(all => {
                            return all.req.length > 1000
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
                        return yrly.values.then(year => {
                            year[0].values.then(doy => {
                                return assert.equal(0, doy[0].x)
                            })
                        })
                    })
                })
            })

        })
        describe('functions',
            function () {
                before(function () {
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
                        console.log(year.y)
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
