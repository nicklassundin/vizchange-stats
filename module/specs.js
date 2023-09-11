class Specs {
    constructor(config) {
        this.config = {};
        Object.assign(this.config, config);
    }
    getUrl(request) {
        let url = `${this.config.url}?position=${request.latitude},${request.longitude}&radius=30&date=${this.config.dates.start}0101-${this.config.dates.end}1231&types=`
        url = `${url}${request.types.join(',')}`
        switch (request.sort) {
            case undefined:
                return url
            default:
                return `${url}&calculate&${request.sort}`
        }
    }
}
module.exports.Specs = Specs;