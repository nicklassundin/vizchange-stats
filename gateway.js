
//let libcurl = require('node-libcurl');
//const { Curl } = libcurl;
// const { Curl, libcurl } = 
// const WaitNotify = require('wait-notify');
// const waitNotify = new WaitNotify();
// const host = `staging-devop-deploy-vischange.k8s.glimworks.se/data/query/v1`;
// let local_debug = `localhost/debug/data/query/v1/test`;
// const host = `vischange.k8s.glimworks.se/data/query/v1`;
//

const axios = require('axios');
// TODO this should work on client side FIXME
//const { setupCache } = require('axios-cache-adapter');
//setupCache(axios)


let getSmhiStation = async function(id){
	return await new Promise((result, reject) => {
		let host = `https://opendata-download-metobs.smhi.se`
		let path = `/api/version/1.0/parameter/1/station/${id}.json`
		const https = require('https')
		https.get(`${host}${path}`,(res) => {
			let body = "";

			res.on("data", (chunk) => {
				body += chunk;

			});

			res.on("end", () => {
				try {
					let json = JSON.parse(body);
					result(`?position=${json.position[0].longitude},${json.position[0].latitude}`)
				} catch (error) {
					console.error(error.message);
					reject(error)

				}

			});


		}).on("error", (error) => {
			console.error(error.message);

		});
	})
}
const preset = {
	stationTypes: {
		abisko: ['temperature, precipitation', 'growingSeason','snowdepth_single', 'decadeMeans', 'periodMeans', 'perma'],
		umea: ['temperature, precipitation', 'growingSeason'],
		pavlopetri: ['temperature, precipitation', 'growingSeason','snowdepth_single', 'decadeMeans', 'periodMeans', 'perma'],
		glob: ['glob','co2_weekly'],
		nhem: ['nhem_temp'],
		'64n-90n': ['64n-90n_temp'],
		'tornetrask': ['freezeup,breakup'],
		'heliport': ['freezeup,breakup'],
		'katterjokk': ['freezeup,breakup'],
		'kursflaket': ['freezeup,breakup'],
		'lakta': ['freezeup,breakup'],
		'mellanflaket': ['freezeup,breakup'],
		'narkevaere': ['freezeup,breakup'],
		'storflaket': ['freezeup,breakup'],
		'bergfors': ['freezeup,breakup'],
	},
	// radious: 'radius=500000',
	radious30: 'radius=30',
	station: {
		abisko: '?position=18.8166,68.3538&radius=30',
		pavlopetri: '?position=22.98865,36.51698&radius=30',
		glob: '?position=22.98865,36.51698&radius=30',
		nhem: '?position=22.98865,36.51698&radius=30',
		'calm': '?position=18.33333333,68.4263889&radius=300000',
		'64n-90n': '?position=22.98865,36.51698&radius=30',
		'tornetrask': '?position=19.723333333333333,68.22555555555556&radius=30',
		'heliport': '?position=18.795555555555556,68.3644444&radius=30',
		'katterjokk': '?position=18.1747222222222,68.4252778&radius=30',
		'kursflaket': '?position=18.878333333333334,68.3513889&radius=30',
		'lakta': '?position=18.33333333,68.4263889&radius=30',
		'mellanflaket': '?position=18.964166666667,68.3480556&radius=30',
		'narkevaere': '?position=19.76583333333,68.1977778&radius=30',
		'storflaket': '?position=18.96527777778,68.3475&radius=30',
		'bergfors': '?position=19.762777777778,68.1455556&radius=30',
		get 'umea'() {
			return preset.station['140480']+'&radius=10000'
		}
		// '': ['?position='],
	},
	types: {
		temperature: 'temperature,avg_temperature,min_temperature,max_temperature',
		precipitation: 'precipitation,avg_temperature',
		snow: 'precipitation,avg_temperature',
		rain: 'precipitation,avg_temperature',
		growingSeason: 'temperature',
		perma: 'perma',
		lakeice: 'icetime',
		'breakup': 'freezeup,breakup',
		'freezeup': 'freezeup,breakup',
		'snowdepth_single': 'snowdepth_single',
		'decadeMeans': 'snowdepth_single',
		'periodMeans': 'snowdepth_single',
		'co2': 'co2_weekly',
		'globtemperature': 'glob_temp',
		'nhemtemperature': 'nhem_temp',
		'64n-90ntemperature': '64n-90n_temp',
	}
}
let set = (station) => {
	getSmhiStation(station).then(str => {
		preset.station[station] = str
	}) 
}
set(140480)
set(140490)


let debug = {
	slow: undefined,
}

let parsePeriod = function(date){
	try{
		if(typeof date === 'string') date = new Date(date);
		let pad = (value) => value >= 10 ? `${value}` : `0${value}`;
		let year = date.getFullYear();
		let month = pad(date.getMonth()+1);
		let day = pad(date.getDate());
		return `${year}${month}${day}`;
	}catch(error){
		console.log(typeof date, date)
		throw error;
	}

}
const totalProductsCount = 500;
module.exports = {
	preset: preset,
	proxRequest: function(specs, full = false){
		var station = specs.station;
		var dates = {
			start: specs.dates.start,
			end: specs.dates.end
		}
		var host = specs.url;
		var type = specs.type
		var url = `${preset.station[station]}&date=${parsePeriod(dates.start)}-${parsePeriod(dates.end)}`
		if(['glob', '64n-90n', 'nhem'].includes(station) && ['glob_temp','nhem_temp','64n-90n_temp','temperature'].includes(type)){
			// url = `${url}&types=${preset.types[station+type]},station`
			url = `${url}&types=${preset.types[station+type]}`

		}else if(type){
			url = `${url}&types=${preset.types[type] !== undefined ? preset.types[type] : type}`
		}
		if(preset.station[station] === undefined) return Promise.reject({
			"ERROR": "No such station",
			"keys": Object.keys(preset.station),
			"data": [],
			"URL": url
		})
		if(full){
			return module.exports.axios('https://'+(host)+url)
		}else{
			return module.exports.axios('https://'+(host)+url+"&calculate")
		}
	},
	number: 0,
	cached: {},
	axios(url){
		let path = `debug/${url.split('/').join('')}.json`;
		//if(fs.existsSync(path)){
		//	return require('./'+path)
		//}
		//console.log('url', url)
		if(this.cached[url] === undefined){
			// TODO nicer solution to individual requests
			//console.log('start', (new Date()).getTime(), this.number)
			this.cached[url] = axios.get(url).then(result => {
				//console.log((new Date()).getTime(), this.number)
				if(!result.cached){
					this.number += 1;
					//console.log('number', this.number)
				}
				let list = undefined;
				/*
				if(global.development) {
					let fs = require("fs");
					if(fs.existsSync('./debug/list.json')){
						list = require('./debug/list.json')
						list[path] = result.data.length
					}else{
						list = {}
						list[path] = result.data.length;
					}
					fs.writeFile('./debug/list.json', JSON.stringify(list), () => {})
					fs.writeFile('./'+path, JSON.stringify(result.data), () => {})
				}
				 */


				return result.data
			}).catch(
				function (error) {
					console.log('Show error notification!')
					return Promise.reject(error)
				}
			)
		}
		return this.cached[url]
	},
	// requests: 300,
	curl: function(url) {
		const curl = new Curl();
		curl.setOpt('URL', url)
		curl.setOpt('FOLLOWLOCATION', true);
		var req = new Promise((res, rej) => {
			curl.on('end', function (statusCode, data) {
				// console.info("curl req", statusCode);
				// console.info('---');
				// console.info(data.length);
				// console.info('---');
				// console.info("time",this.getInfo( 'TOTAL_TIME' ));

				if(debug.slow){
					debug.slow = debug.slow['TOTAL_TIME'] > this.getInfo('TOTAL_TIME') ?
						debug.slow : 
						{
							'TOTAL_TIME' : this.getInfo('TOTAL_TIME'),
							'data': data,
							statusCode,
							url
						}
				}else{
					debug.slow = {
						'TOTAL_TIME' : this.getInfo('TOTAL_TIME'),
						'data': data,
						statusCode,
						url
					}
				}
				// console.log({
				// 	'url': url,
				// 	'time': this.getInfo('TOTAL_TIME')
				// })
				this.close();
				if(statusCode === 504){
					rej(statusCode)
				}else if(statusCode === 400){
					res([]);
				}else {
					json = JSON.parse(data)
					res(json)
				}
			});

		})
		curl.on('error', () => {
			curl.close.bind(curl)
		});
		return new Promise((res, rej) => {

		process.nextTick(() => {
			curl.perform()
			res(Promise.race([req, 
				new Promise((res, rej) => {
					let time = 50000;
					let to = setTimeout(() => {
						clearTimeout(to)
						rej({'ERROR': `toLong time: ${time}`,
							'url': url
						})
					},time)
				})
			]))
		});
		})
	},
}

