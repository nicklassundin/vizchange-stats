import { expect } from 'chai';
import sinon from 'sinon';
import Point from '../module/Point.js';
import * as help from 'climate-plots-helper';
import curl from '../module/utility/gateway.js';

describe.only('Point Class', () => {
    let specs;
    let req;

    beforeEach(() => {
        specs = {
            keys: ['year'],
            type: 'temperature',
            dates: {
                start: new Date('2023-01-01'),
                end: new Date('2023-12-31')
            }
        };
        req = [{
            date: new Date('2023-12-31'),
            temperature: 10
        },{
            date: new Date('2024-01-01'),
            temperature: -10
        },{
            date: new Date('2024-01-02'),
            temperature: 5
        },{
            date: new Date('2024-01-03'),
            temperature: 10
        },{
            date: new Date('2024-01-04'),
            temperature: -3
        }];
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('Point Constructor', () => {
        it('should initialize a Point instance with correct properties', () => {
            const point = new Point(specs, req, true);
            expect(point.specs).to.deep.equal(specs);
            expect(point.req.map(each => each.request)).to.deep.equal(req);
            expect(point.full).to.be.true;
        });
    });

    describe('Point Static Build Method', () => {
        it('should call curl.proxRequest with correct parameters and return a Point instance', async () => {
            const res = [req];
            const proxRequestStub = sinon.stub(curl, 'proxRequest').resolves(res);

            const point = await Point.build(specs, true);
            expect(proxRequestStub).to.have.been.calledOnceWith(specs, true, undefined);
            expect(point).to.be.instanceof(Point);
            proxRequestStub.restore();
        });
    });

    describe('Point Instance Methods', () => {
        it('should return the correct decade', () => {
            const point = new Point(specs, req, true);
            expect(point.decade).to.equal(2020);
        });

        it('should return the correct century', () => {
            const point = new Point(specs, req, true);
            expect(point.century).to.equal(2000);
        });

        it('should return the correct splitMonth', () => {
            const point = new Point(specs, req, true);
            expect(point.splitMonth).to.equal(12);
        });

        it('should return the correct splitYear', () => {
            const point = new Point(specs, req, true);
            expect(point.splitYear).to.equal(2022);
        });

        it('should return the correct splitDecade', () => {
            const point = new Point(specs, req, true);
            expect(point.splitDecade).to.equal(2021);
        });

        it('should return the correct y value', () => {
            const point = new Point(specs, req, true);
            expect(point.y).to.deep.equal([10, -10, 5, 10, -3]);
        });

        it('should correctly filter requests in first method', () => {
            const point = new Point(specs, req, true);
            const result = point.first((e) => e > 5);
            expect(result.req).to.have.lengthOf(2);
            expect(result.req[0].temperature).to.equal(10);
        });
    });
});
