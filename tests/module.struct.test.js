import { expect } from 'chai';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
import Struct from '../module/Struct.js';
import Point from '../module/Point.js';
import curl from '../module/utility/gateway.js';
import { getDateOfWeek, ColorToHex, replace, climatePlotsHelper } from '../module/helpers/help.js';

describe.only('Struct', () => {
    let struct;
    let seedSpecs;

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

    it('should initialize with the correct values', () => {
        expect(struct.specs).to.deep.equal(seedSpecs);
        expect(struct.type).to.equal('avg');
    });

    describe('build', () => {
        it('should build a Struct with correct specs for monthly type', () => {
            const builtStruct = Struct.build(seedSpecs, 'Jan', 'avg');
            expect(builtStruct.specs.dates.type).to.equal('monthly');
            expect(builtStruct.specs.dates.start).to.be.an.instanceof(Date);
            expect(builtStruct.specs.dates.end).to.be.an.instanceof(Date);
        });

        it('should handle freezeup and breakup types', () => {
            seedSpecs.type = 'freezeup';
            const builtStruct = Struct.build(seedSpecs, 'Jan', 'avg');
            expect(builtStruct.specs.dates.type).to.equal('freezeup');
        });
    });

    describe('subDivide', () => {
        it('should make a proxRequest with correct parameters', async () => {
            const stub = sinon.stub(curl, 'proxRequest').resolves('response');
            const response = await struct.subDivide;
            expect(stub).to.have.been.calledOnce;
            expect(response).to.equal('response');
            stub.restore();
        });
    });

    describe('entry', () => {
        it('should return a Point object', async () => {
            const specs = {
                keys: ['year'],
                type: 'temperature',
                dates: {
                    start: new Date('2023-01-01'),
                    end: new Date('2023-12-31')
                }
            };
            const req = {
                date: new Date('2023-01-01'),
                temperature: '10'
            };
            const pointStub = sinon.stub(Point, 'build').resolves(new Point(specs, req, false));
            const entry = await struct.entry;
            expect(pointStub).to.have.been.calledOnce;
            expect(entry).to.be.instanceof(Point);
            pointStub.restore();
        });
    });

    describe('getters and setters', () => {
        it('should set and get entry correctly', () => {
            struct.entry = 'entryValue';
            expect(struct.POINT).to.equal('entryValue');
        });

        it('should set and get y value correctly', () => {
            struct.y = 'yValue';
            expect(struct.Y).to.equal('yValue');
        });
    });

    describe('getValues', () => {
        it('should build a new Struct with correct values', () => {
            const result = struct.getValues(seedSpecs, 2023);
            expect(result).to.be.instanceof(Struct);
        });
    });

    describe('TYPE method', () => {
        it('should return a new Struct of specified type', () => {
            const result = struct.TYPE('sum');
            expect(result).to.be.instanceof(Struct);
            expect(result.type).to.equal('sum');
        });
    });

    describe('baseline', () => {
        it('should return a baseline Struct with correct dates', async () => {
            seedSpecs.baseline = { start: 1990, end: 2000 };
            const baselineStruct = await struct.baseline;
            expect(baselineStruct.specs.dates.start.getFullYear()).to.equal(1990);
            expect(baselineStruct.specs.dates.end.getFullYear()).to.equal(2000);
        });
    });

    describe.skip('variance', () => {
        it('should calculate variance correctly', () => {
            struct.values = [{ y: 1 }, { y: 2 }, { y: 3 }];
            const variance = struct.variance();
            expect(variance).to.be.closeTo(1, 0.01);
        });
    });
});
