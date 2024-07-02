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
        it('should call once when avg is called', async () => {
            const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves([{
                date: '2023-01-01',
                temperature: '10'
            }]);
            let params = ['temperature', 'yrly', 'shortValues']
            let config = Object.assign(configs['live'], specs)
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
            expect(proxRequestStub.callCount).to.equal(1);
        });
    });
});
