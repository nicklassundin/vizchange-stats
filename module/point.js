class Point {
    constructor(values, keys) {
        values.forEach((value, index) => {
            switch (index) {
                case 0:
                    this.y = value
                    break;
                case 1:
                    this.x = value
                default:
                    if(keys[index]) this[keys[index]] = value
                    break;
            }
        })
    }
}
module.exports.Point = Point