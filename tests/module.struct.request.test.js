import { expect } from 'chai';
import sinon from 'sinon';
import Struct from '../module/Struct.js';
import curl from '../module/utility/gateway.js';
import axiosWrapper from '../module/utility/axiosWrapper.js';
import parser from "../module.js";
import assert from "assert";

let specs = {
    type: 'temperature',
    station: 'abisko',
    baseline: {
        'start': 1961,
        'end': 1991
    }
}
const configs = (await import('../config.json', {
    assert: { type: "json" }
})).default;
const specsJson = (await import('./specs.json', {
    assert: { type: "json" }
})).default;

describe.only('Struct Class', () => {
    let seedSpecs;
    let struct;

    beforeEach(() => {
        seedSpecs = {
            type: 'monthly',
            keys: ['month'],
            dates: {
                start: new Date('2023-01-01'),
                end: new Date('2023-12-31')
            }
        };
        struct = new Struct(undefined, seedSpecs, undefined, 'avg', () => true, false, undefined);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Request Counting', () => {
        it('should make the correct number of requests for subDivide', async () => {
            const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves('response');
            await struct.subDivide;
            expect(proxRequestStub).to.have.been.calledOnce;
        });

        it('should make the correct number of requests when getting values', async () => {
            const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves([{
                date: '2023-01-01',
                temperature: '10'
            }]);

            const values = struct.values;
            expect(proxRequestStub).to.have.been.calledOnce;
        });

        it('should make the correct number of requests for multiple instances', async () => {
            const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves([{
                date: '2023-01-01',
                temperature: '10'
            }]);

            const struct1 = new Struct(undefined, seedSpecs, undefined, 'avg', () => true, false, undefined);
            const struct2 = new Struct(undefined, seedSpecs, undefined, 'avg', () => true, false, undefined);

            await struct1.subDivide;
            await struct2.subDivide;

            expect(proxRequestStub).to.have.been.calledTwice;
        });
        describe('number of calls', function () {
            describe('temperature', function () {
                it('avg / min / max', async () => {
                    const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves([{
                        date: '2023-01-01',
                        temperature: '10'
                    }]);
                    let params = ['temperature', 'yrly', 'shortValues']
                    let config = Object.assign(configs['latest'], specsJson['specs'])
                    const startTime = (new Date()).getTime();
                    await parser.getByParams(config, params).then(values => {
                        return Promise.any(values).then(values => {
                            let endTime = (new Date()).getTime();
                            return true
                        })
                    }).then(() => {
                        let endTime = (new Date()).getTime();
                        console.log('Time: ' + (endTime - startTime));
                    });

                    const avg = await struct.avg;
                    expect(proxRequestStub.callCount).to.equal(7);
                });
                it('first', async () => {
                    const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves([{
                        date: '2023-01-01',
                        avg_temperature: 5,
                        min_temperature: -10,
                        max_temperature: 20
                    },{
                        date: '2023-01-02',
                        avg_temperature: -10,
                        min_temperature: -20,
                        max_temperature: 0
                    },{
                        date: '2023-01-03',
                        avg_temperature: 15,
                        min_temperature: 10,
                        max_temperature: 20
                    },{
                        date: '2023-01-04',
                        avg_temperature: 10,
                        min_temperature: 5,
                        max_temperature: 15
                    },{
                        date: '2023-01-05',
                        avg_temperature: 5,
                        min_temperature: 0,
                        max_temperature: 10
                    },{
                        date: '2023-01-06',
                        avg_temperature: 0,
                        min_temperature: -5,
                        max_temperature: 5
                    },{
                        date: '2023-01-07',
                        avg_temperature: -5,
                        min_temperature: -10,
                        max_temperature: 0
                    }]);
                    let params = ['temperature', 'yrlySplit', 'min', 'first', 'shortValues', 5];
                    let config = Object.assign(configs['latest'], specsJson['specs'])
                    const startTime = (new Date()).getTime();
                    await parser.getByParams(config, params).then(values => {
                        console.log(values)
                        return assert.equal(values.y, 242)
                    })

                    expect(proxRequestStub.callCount).to.equal(7);
                });
            })
        })
    });
});
