const {WebR, Shelter, RObject} = require('webr');
const {HandlerResponse} = require('./handlerResponse');
// implement for Date prototype getWeek number function that return int of week number
Date.prototype.getWeek = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    let week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

class Handler {
    constructor(data, request) {
        this.data = data
        this.request = request;
        this.dataframe = undefined;
        this.webR = undefined;
        if(this.request.precalc) {
            this.tags = Object.keys(data[Object.keys(data)[0]])
        } else {
            this.tags = Object.keys(data);
        }
    }
    async get (type, y, calc) {
        console.log(this.request)
        await this.initR(type);
        switch (type) {
            case 'snow':
                // TODO standardize tags line for parent handler
                this.tags = ['precipitation', 'temperature']
                this.xLabel.forEach((label) => {
                    this.tags.push(label)
                })
                break;
            default:
        }
        return this.getCol(type, calc).resolve();
    }
    getDf() {
        return this.dataframe[1];
    }
    addDataFrame(type, shelter = this.webR, env = this.webR.objs.globalEnv) {
        // NOTE: used for raw data
        let code =`df2 <- data.frame(${this.tags.join(',')})
        colnames(df2) <- c("${this.tags.join('","')}") 
        df <- rbind(df, df2);
        return(df);`;
        return shelter.evalR(code, { env })

    }
    createDataFrame(type, shelter = this.webR, env = this.webR.objs.globalEnv) {
        let code = `df <- data.frame(${this.tags.join(',')})
        colnames(df) <- c("${this.tags.join('","')}") 
        df <- df[order(df$${this.xLabel.join(',df$')}),]
        return(df)`;
        return shelter.evalR(code, { env })
    }
    get xLabel () {
        return this.request.label;
    }
    async buildR(){
        if (!this.webR) {
            this.webR = new WebR();
            await this.webR.init();
            //await this.webR.installPackages(['dplyr'])
        }
    }
    async initR(type) {}
    getCol (type, calc, df = this.getDf(type)) {
        let response = new HandlerResponse();
        let code = '';
        switch (calc) {
            case 'ma': /* TODO moving average */
                code = `stats::filter(${type}[order(${this.getName(type, this.xLabel)})], rep(1,5), sides = 1)/5`;
                break
            case 'snow':
                /** NOTE: this is a better way
                 code = `webr::install("dplyr")
                 library("dplyr")
                 df2 <- df[c("${this.tags.join('","')}")] %>% filter(temperature < 0)
                 return(df2)`;
                 */
                code = `df2 <- df[c("${this.tags.join('","')}")]
                return(subset(df2, subset = temperature < 0))`
                break;
            case 'grow':
                // TODO process by week month and year and do calculation based on that
                console.log(this.request.sort)
                code = `df2 <- df[c("${this.tags.join('","')}")]
                names <- colnames(df2)
                df2 <- cbind(df2, lapply(df2[c("${type}")], function(x) x >= 0))
                colnames(df2) <- c(names, "grow")
                v <- lapply(rle(df2$grow)$lengths, function(x) seq(x, 0, length.out = x))
                df2$grow <- unlist(v)
                df2 <- df2[c("grow","${this.xLabel.join('","')}")]
                `;
                switch (this.request.sort) {
                    case 'week':
                    case 'month':
                    case 'year':
                    default:
                        code += `df2 <- subset(df2, subset = grow == max(grow))`
                }
                code += `
                return(df2)`;
                break;
            case 'max':
            case 'min':
            default:
                // NOTE: this is prevent dubblicated code between clases TODO find better wau
                code = `return(df[c("${type}","${this.xLabel.join('","')}")])`;
        }
        let result = this.webR.evalR(code, {df: this.getDf(type)});
        response.addResult(result);
        response.addToBody(code);
        return response
    }
    getName () {
        return `${Object.values(arguments).join('_')}`;
    }
}

class RscriptHandler extends Handler {
    constructor (data, request){
        super(data, request)
    }
    async get (type, y, calc) {
        await this.initR(type);
        switch (type) {
            case 'snow':
            default:
        }
        return this.getCol(y, calc).resolve();
    }
    async initR(type) {
        await this.buildR()
        for (const tag in this.data[type]) {
            await this.webR.objs.globalEnv.bind(tag, this.getData(type, tag))
        }
        this.dataframe = await this.createDataFrame(type);
    }
    getName (type, tag){
        if(tag === this.xLabel){
            return tag;
        }
        return `${type}_${tag}`;
    }
    getData(type, tag) {
        return this.data[type][tag];
    }
}
module.exports.RscriptHandler = RscriptHandler;

class RscriptRawHandler extends Handler {
    constructor(data, request, frameSlice = Object.keys(data).length*2000){
        super(data, request);
        this.tags.push('year');
        this.tags.push('month');
        this.tags.push('week');
        if(this.data.date.length / frameSlice < 1) {
            this.frameSlice = this.data.date.length;
        }else {
            this.frameSlice = frameSlice;
        }
        this.dataframeGroups = Array.from({ length: this.data.date.length/this.frameSlice }, (value, index) => index);
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
    /**
    getName (type, tag) {
        // NOTE could be replaced with an if RAW config
        return tag;
    }*/
    get xLabel () {
        // return ['date']
        return ['date', 'year', 'month', 'week']
    }
    getData(type) {
        return this.data[type];
    }
    async initR(type) {
        await this.buildR();
        // NOTE could it be generalized? to match both raw and non-raw data
        let div = this.frameSlice;
        // current date in time save to variable time
        const shelter = this.webR
        //const shelter = await new Shelter();
        const env = this.webR.objs.globalEnv;
        //const env = await (new this.webR.REnvironment({ }))
        let calls = 0;
        let dataframe;
        for (const g of this.dataframeGroups) {
            //for (const tag of Object.keys(this.data)) {
            for (const tag of this.tags) {
                let data;
                switch (tag) {
                    case 'year':
                        data = this.getData('date').slice(g.start, g.end);
                        await this.webR.objs.globalEnv.bind(this.getName(tag), data.map(each => (new Date(each)).getFullYear()))
                        break;
                    case 'month':
                        data = this.getData('date').slice(g.start, g.end);
                        await this.webR.objs.globalEnv.bind(this.getName(tag), data.map(each => (new Date(each)).getMonth()))
                        break;
                    case 'week':
                        data = this.getData('date').slice(g.start, g.end);
                        await this.webR.objs.globalEnv.bind(this.getName(tag), data.map(each => (new Date(each)).getWeek()))
                        break;
                    default:
                        data = this.getData(tag).slice(g.start, g.end);
                        await this.webR.objs.globalEnv.bind(this.getName(tag), data)
                }
            }
            //this.dataframe.push(await this.createDataFrame(type, Object.keys(this.data)));
            if(g.start === 0) {
                dataframe = (await this.createDataFrame(type));
            } else {
                dataframe = (await this.addDataFrame(type));
            }
        }
        this.dataframe = await dataframe;
    }
}
module.exports.RscriptRawHandler = RscriptRawHandler;
