const {Point} = require('../point')

// TODO extend array instead so no value field is required
class HandlerResponse {
    constructor(webR, statusCode = 200) {
        this.webR = webR;
        this.statusCode = statusCode
        this.body = ''
        this.result = Promise.resolve(true);
    }
    addToBody(code) {
        this.body += code;
    }
    addResult(result = this.result) {
        this.result = result.then(() => result)
    }
    async resolve() {
        let response = this;
        return (await this.result).toJs().then((result) => {
            let df = result
            response.values = df.values[0].values.map((each, i) => {
                return new Point(Object.keys(df.values).map((key, j) => df.values[j].values[i]), df.names)
            })
            return response;
        })
    }
}
module.exports.HandlerResponse = HandlerResponse;