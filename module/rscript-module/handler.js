const {WebR, Shelter, RObject} = require('webr');
const {Point} = require('../point');
const {HandlerResponse} = require('./handlerResponse');
class Handler {
    constructor(data, request) {
        this.data = data
        this.request = request;
        this.dataframe = undefined;
        this.webR = undefined;
    }
    async get (type, y, calc) {
        return this.getMatch(type, y, calc).then((response) => {
            return  response.resolve();
        });
    }
    async getMatch (type, y, calc) {
        await this.initR(type);
        return (await this.getCol(type, y, calc))
    }
    getDf() {
        return this.dataframe[1];
    }
    addDataFrame(type, tags, shelter = this.webR, env = this.webR.objs.globalEnv) {
        // NOTE: used for raw data
        return shelter.evalR(`df2 <- data.frame(${tags.map(tag => this.getName(type, tag)).join(',')})
        colnames(df2) <- c("${tags.join('","')}") 
        df <- rbind(df, df2);
        return(df);`, { env })
    }
    createDataFrame(type, tags, shelter = this.webR, env = this.webR.objs.globalEnv) {
        //console.log(shelter)
        //console.log(env)
        return shelter.evalR(`df <- data.frame(${tags.map(tag => this.getName(type, tag)).join(',')})
        colnames(df) <- c("${tags.join('","')}") 
        df <- df[order(df$${this.xLabel.join(',df$')}),]
        return(df)`, { env })
    }
    get xLabel () {
        return this.request.label;
    }
    async initR(type) {}
    async getCol(type, y, calc) {}
    getName(type, tag) {}
}

class RscriptHandler extends Handler {
    constructor (data, request){
        super(data, request)
    }
    async initR(type) {
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        for (const tag in this.data[type]) {
            await this.webR.objs.globalEnv.bind(this.getName(type, tag), this.getData(type, tag))
        }
        this.dataframe = await this.createDataFrame(type, Object.keys(this.data[type]));
    }
    getName(type, tag){
        if(tag === this.xLabel){
            return tag;
        }
        return `${type}_${tag}`;
    }
    getCol (type, tag, calc, df = this.getDf(type)) {
        let response = new HandlerResponse();
        let code = '';
        let result;
        switch (calc) {
            case 'ma': /* TODO moving average */
                code = `stats::filter(${this.getName(type, tag)}[order(${this.getName(type, this.xLabel)})], rep(1,5), sides = 1)/5`;
                result = this.webR.evalR(code);
                break
            case 'snow':
                // TODO
                code = `mapply(function (x) (abs(x) - x) / (2 * abs(x)), avg_temperature)*precipitation`;
                result = this.webR.evalR(code);
                break;
            case 'max':
            case 'min':
            default:
                code = `return(df[c("${tag}","${this.xLabel.join('","')}")])`;
                result = this.webR.evalR(code, {df: this.getDf(type)});
        }
        response.addToBody(code);
        response.result = result;
        return response
    }
    getData(type, tag) {
        return this.data[type][tag];
    }
    async evalR(code) {
        return await this.webR.evalR(code, { df: this.dataframe });
    }
}
module.exports.RscriptHandler = RscriptHandler;

class RscriptRawHandler extends Handler {
    constructor(data, request, frameSlice = Object.keys(data).length*2000){
        super(data, request);
        if(this.data.date.length / frameSlice < 1) {
            this.frameSlice = this.data.date.length;
        }else {
            this.frameSlice = frameSlice;
        }
        this.dataframeGroups = Array.from({ length: this.data.date.length/this.frameSlice }, (value, index) => index);
        //console.log(this.dataframeGroups.length)
        this.dataframeGroups = this.dataframeGroups.map(g => {
            return {
                start: g*this.frameSlice,
                end: (g+1)*this.frameSlice
            }
        })
        if(this.frameSlice != this.data.date.length) {
            // TODO better solution cleaning up special cases
            this.dataframeGroups.push({
                start: this.dataframeGroups[this.dataframeGroups.length-1].end,
                end: this.data.date.length
            })
        }
    }
    getCol (type, tag, calc) {
        let response = new HandlerResponse();
        let code = '';
        let result;
        switch (calc) {
            case 'ma':
            case 'snow':
            case 'max':
            case 'min':
            default:
                code = `return(df[c("${type}","${this.xLabel.join('","')}")])`;
                result = this.webR.evalR(code, this.dataframe);
        }
        response.addToBody(code);
        response.result = result;
        return response
    }
    getName(type, tag) {
        // NOTE could be replaced with an if RAW config
        return tag;
    }
    get xLabel () {
        return ['date']
    }
    getData(type, tag) {
        return this.data[type];
    }
    async initR(type) {
        // NOTE could it be generalized? to match both raw and non-raw data
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
        }
        let div = this.frameSlice;
        // current date in time save to variable time
        const shelter = this.webR
        //const shelter = await new Shelter();
        const env = this.webR.objs.globalEnv;
        //const env = await (new this.webR.REnvironment({ }))
        let todo = Promise.resolve([]);
        let calls = 0;
        // TODO make mapping instead
        for (const g of this.dataframeGroups) {
            for (const tag of [type, 'date']) {
                calls += 1;
                //console.log('nr of calls', calls);
                let data = this.getData(tag);
                //let time = (new Date()).getTime();
                let object = new shelter.RObject(data.slice(g.start, g.end));
                //object.then(() => console.log(calls, 'time', (new Date()).getTime() - time));
                todo = todo.then((array) => {
                    return object.then((object) => {
                        env.bind(this.getName(type, tag), object)
                        calls -= 1;
                        array.push(object)
                        return array
                    })
                })
            }
            todo.then((array) => {
                //console.log('done')
                return (g.start === 0 ? this.createDataFrame(type, Object.keys(this.data), shelter, env) : this.addDataFrame(type, Object.keys(this.data), shelter, env))
                    .then(() => {
                        //console.log(array)
                        array.forEach((object) => {
                            shelter.destroy(object)
                        })
                    })
                // Clean up
            })
            //shelter.purge();
        }
        return await todo
    }
}
module.exports.RscriptRawHandler = RscriptRawHandler;
