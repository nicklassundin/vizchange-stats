const assert = require('assert');
const {RscriptHandler, RscriptRawHandler} = require('./handler');

// array of dates in ms since epoch from 2019-01-01 to 2019-01-04
const RawRequest = {
    "types": ["type", "temperature"],
    "label": ["date"],
}
const RawData = {
    "type": [2, 1, 3, 5],
    "temperature": [-1, 0, -5, 3],
    "date": [1546387200000, 1546300800000, 1546473600000, 1546560000000],
}
let RawDataOdd = require('./RawDataOdd.json');
let RawDataLong = require('./RawDataLong.json');
// save RawDataLong as .json file
const fs = require('fs');

const CalcRequest = {
    //"types": ["type"],
    "types": ["type", "temperature"],
    "sort": "year",
    "label": ["year"]
}
const CalcData = {
    "type": {
        "min": [-1, -2, 0, 1],
        "avg": [0, -1, 1, 2],
        "max": [1, 0, 2, 3],
        "year": [2020, 2019, 2021, 2021],
    }
}
let generateTestFile = (size = 10, name) => {
    let data = {
        "type": [1],
        "temperature": [-1],
        "date": [1546387200000]
    }
    for (let i = 1; i < size; i++) {
        data.type.push(Math.floor(Math.random() * 5) + 1);
        data.temperature.push(Math.floor(Math.random() * 5) - 5);
        data.date.push(data.date[data.date.length - 1] + 86400000);
    }
    fs.writeFile(`./module/rscript-module/${name}.json`, JSON.stringify(data), (err, data) => {})
    return data;
}
//RawDataOdd = generateTestFile(14, 'RawDataOdd');
//RawDataLong = generateTestFile(60000, 'RawDataLong');
describe(
    'Handler',
    function () {
        describe('Rscript', function () {
            describe('Calc', function () {
                it('min - should return -2', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'min').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, -2);
                    })
                })
                it('max - should return 0', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'max').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, 0);
                    })
                })
                it('avg - should return -1', function () {
                    let handler = new RscriptHandler(CalcData, CalcRequest);
                    return handler.get('type', 'avg').then(result => {
                        result = result.values
                        return assert.equal(result[0].y, -1);
                    })
                })
            })
            describe('Raw', function () {
                describe('data managerment check', function () {
                    it('constructor', () => {
                        return Promise.resolve(new RscriptRawHandler(RawDataLong, RawRequest)).then((handler) => {
                            return true
                        });
                    })
                    describe('initR - frameSlice', function () {
                        it.skip('default', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest);
                            await handler.initR('avg_temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('failing', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 1);
                            await handler.initR('avg_temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('failing', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 500);
                            await handler.initR('avg_temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('lowest', async function () {
                            // NOTE: lowest 900
                            let low = 875;
                            //let low = 900;
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, low);
                            await handler.initR('avg_temperature');
                            console.log(`frameSlice: ${low}`, `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('2500', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 2500);
                            await handler.initR('avg_temperature');
                            console.log('frameSlice: 2500', `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('5000', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 5000);
                            await handler.initR('avg_temperature');
                            console.log('frameSlice: 5000', `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it('10000', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 10000);
                            await handler.initR('avg_temperature');
                            console.log('frameSlice: 10000', `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('20000', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 20000);
                            await handler.initR('avg_temperature');
                            console.log('frameSlice: 20000', `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('30000', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 30000);
                            await handler.initR('avg_temperature');
                            console.log('frameSlice: 30000', `length: ${RawDataLong.length}`)
                            return Promise.resolve(handler).then(() => true)
                        })
                        it.skip('fail', async function () {
                            let handler = new RscriptRawHandler(RawDataLong, RawRequest, 80000);
                            await handler.initR('avg_temperature');
                            return Promise.resolve(handler).then(() => true)
                        })
                    })
                })
                describe.only('merge check', function () {
                    it('length test', function () {
                        let handler = new RscriptRawHandler(RawDataOdd, RawRequest, 10);
                        return handler.get('type').then(result => {
                            result = result.values
                            return assert.equal(result.length, RawDataOdd.date.length);
                        })
                    })
                    it('large test', () => {
                        let handler = new RscriptRawHandler(RawDataLong, RawRequest);
                        return handler.get('type').then(result => {
                            result = result.values
                            console.log(`${result.length} === ${RawDataLong.date.length}`)
                            return assert.equal(result.length, RawDataLong.date.length);
                        })
                    })
                })
                describe('operations', function () {
                    it('should return 1', function () {
                        let handler = new RscriptRawHandler(RawData, RawRequest);
                        return handler.get('type').then(result => {
                            result = result.values
                            return assert.equal(result[0].y, 1);
                        })
                    });
                    describe('snow', function () {

                    })
                })
            })
        })
    }
)