const assert = require('assert');
const {RscriptHandler, RscriptRawHandler} = require('./handler');

// array of dates in ms since epoch from 2019-01-01 to 2019-01-04
const RawRequest = {
    "types": ["precipitation", "temperature"],
    "label": ["date"],
}
const RawRequestSort = {
    "types": ["precipitation", "temperature"],
    "label": ["date"],
    "sort": "week"
}
const RawData = {
    "precipitation": [2, 1, 3, 5],
    "temperature": [-1, 0, -5, 3],
    "date": [1546387200000, 1546300800000, 1546473600000, 1546560000000],
}
const RawStreakData = {
    "precipitation": [10, 5, 1, 0, 0, 1, 0, 0, 0],
    "temperature": [-1, 0, 0, -1, -1, 1, -1, -1, 1],
    "date": [1546387200000, 1556385200000, 1566385200000, 1576385200000, 1586385200000, 1596385200000, 1596385200000, 1596385200000, 1596385200000],
}
let RawDataOdd = require('./RawDataOdd.json');
let RawDataLong = require('./RawDataLong.json');
let RawDataMedium = require('./RawDataMedium.json');
// save RawDataLong as .json file
const fs = require('fs');

const CalcRequest = {
    //"types": ["type"],
    "types": ["precipitation", "temperature"],
    "precalc": true,
    "sort": "year",
    "label": ["year"]
}
const CalcData = {
    "precipitation": {
        "min": [-1, -2, 0, 1],
        "avg": [0, -1, 1, 2],
        "max": [1, 0, 2, 3],
        "year": [2020, 2019, 2021, 2021],
    }
}
let generateTestFile = (size = 10, name) => {
    let data = {
        "precipitation": [1],
        "temperature": [-1],
        "date": [1546387200000]
    }
    for (let i = 1; i < size; i++) {
        data.precipitation.push(Math.floor(Math.random() * 5) + 1);
        data.temperature.push(Math.floor(Math.random() * 5) - 5);
        data.date.push(data.date[data.date.length - 1] + 86400000);
    }
    fs.writeFile(`./module/rscript-module/${name}.json`, JSON.stringify(data), (err, data) => {})
    return data;
}
//RawDataOdd = generateTestFile(14, 'RawDataOdd');
//RawDataLong = generateTestFile(60000, 'RawDataLong');
//RawDataMedium = generateTestFile(10000, 'RawDataMedium');
describe(
    'Handler',
    function () {
        describe('Rscript', function () {
            describe('Calc', function () {
                it('min - should return -2', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('precipitation', 'min').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, -2);
                    })
                })
                it('max - should return 0', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('precipitation', 'max').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, 0);
                    })
                })
                it('avg - should return -1', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('precipitation', 'avg').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, -1);
                    })
                })
            })
            describe('Raw', function () {
                describe('operations', function () {
                    it('should return 1', function () {
                        let handler = new RscriptRawHandler(RawDataOdd, RawRequest);
                        return handler.get('precipitation').then(result => {
                            result = result.values
                            console.log(result)
                            return assert.equal(result[0].y, 1);
                        })
                    });
                    it('snow', function () {
                        let handler = new RscriptRawHandler(RawData, RawRequest);
                        return handler.get('snow', undefined, 'snow').then(result => {
                            result = result.values;
                            console.log(result)
                            return assert.equal(result[0].y, 2);
                        })             //for (const tag of Object.keys(this.data)) {)
                    })
                    it('Growing Season', function () {
                        let handler = new RscriptRawHandler(RawStreakData, RawRequest);
                        return handler.get('temperature', undefined, 'grow').then(result => {
                            result = result.values;
                            console.log(result)
                            return assert.equal(result[0].y, 2);
                        })
                    })
                })
                describe('sort', function () {
                    it('return', function () {
                        let handler = new RscriptRawHandler(RawStreakData, RawRequestSort);
                        return handler.get('precipitation').then(result => {
                            result = result.values
                            console.log(result)
                            return assert.equal(result[0].y, 10);
                        })
                    });
                    it('Growing Season', function () {
                        let handler = new RscriptRawHandler(RawStreakData, RawRequestSort);
                        return handler.get('temperature', undefined, 'grow').then(result => {
                            result = result.values;
                            console.log(result)
                            return assert.equal(result[0].y, 2);
                        })
                    })
                })
                describe.skip('data managerment check', function () {           //for (const tag of Object.keys(this.data)) {nction () {
                    it('constructor', () => {
                        return Promise.resolve(new RscriptRawHandler(RawDataLong, RawRequest)).then((handler) => {
                            return true
                        });
                    })
                    describe('initR - frameSlice', function () {
                        before('init', function () {
                            RawDataMedium = RawDataLong
                        })
                        it('default', async function () {
                            let handler = new RscriptRawHandler(RawDataMedium, RawRequest);
                            await handler.initR('temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                        it('lowest', async function () {
                            let low = 1000;
                            //let low = 875;
                            let handler = new RscriptRawHandler(RawDataMedium, RawRequest, low);
                            await handler.initR('temperature');
                            console.log(`frameSlice: ${low}`, `length: ${RawDataMedium.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it('2500', async function () {
                            let handler = new RscriptRawHandler(RawDataMedium, RawRequest, 2500);
                            await handler.initR('temperature');
                            console.log('frameSlice: 2500', `length: ${RawDataMedium.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it('5000', async function () {
                            let handler = new RscriptRawHandler(RawDataMedium, RawRequest, 5000);
                            await handler.initR('temperature');
                            console.log('frameSlice: 5000', `length: ${RawDataMedium.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('fail', async function () {
                            let handler = new RscriptRawHandler(RawDataMedium, RawRequest, 80000);
                            await handler.initR('temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                    })
                })
                describe('merge check', function () {
                    it('length test', function () {
                        let handler = new RscriptRawHandler(RawDataOdd, RawRequest, 10);
                        return handler.get('precipitation').then(result => {
                            result = result.values
                            return assert.equal(result.length, RawDataOdd.date.length);
                        })
                    })
                    it.skip('large test', () => {
                        let handler = new RscriptRawHandler(RawDataLong, RawRequest);
                        return handler.get('precipitation').then(result => {
                            result = result.values
                            console.log(`${result.length} === ${RawDataLong.date.length}`)
                            return assert.equal(result.length, RawDataLong.date.length);
                        })
                    })
                })
            })
        })
    }
)