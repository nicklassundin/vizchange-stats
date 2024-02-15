const {WebR, Shelter, Robject} = require('web-r');

class RscriptLibraryHandler {
    static webR = new WebR().init();
    constructor(packages = ['dplyr']){
        this.packages = packages;
    }
    async init() {
        await RscriptLibraryHandler.webR.init();
        await RscriptLibraryHandler.webR.installPackages(this.packages);
        return this
    }
}