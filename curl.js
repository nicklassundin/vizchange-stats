
let libcurl = require('node-libcurl');
const { Curl } = libcurl;
// const { Curl, libcurl } = 
// const WaitNotify = require('wait-notify');
// const waitNotify = new WaitNotify();
// const host = `staging-devop-deploy-vischange.k8s.glimworks.se/data/query/v1`;
// let local_debug = `localhost/debug/data/query/v1/test`;
// const host = `vischange.k8s.glimworks.se/data/query/v1`;
//




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

				};

			});


		}).on("error", (error) => {
			console.error(error.message);

		});
	})
}
const preset = {
	stationTypes: {
		abisko: ['temperature, precipitation', 'growingSeason','snowdepth_single', 'decadeMeans', 'periodMeans', 'perma'],
		umeå: ['temperature, precipitation', 'growingSeason'],
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
		get 'umeå'() {
			return preset.station['140480']+'&radius=10000'
		}
		// '': ['?position='],
	},
	types: {
		// temperatures: 'temperature,max_temperature,avg_temperature,min_temperature',
		// temperature: 'avg_temperature,min_temperature,max_temperature',
		temperature: 'temperature,avg_temperature,min_temperature,max_temperature',
		precipitation: 'precipitation,avg_temperature',
		growingSeason: 'temperature',
		perma: 'perma',
		lakeice: 'freezeup,breakup',
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
	let pad = (value) => value >= 10 ? `${value}` : `0${value}`;
	let year = date.getFullYear();
	let month = pad(date.getMonth()+1);
	let day = pad(date.getDate());
	return `${year}${month}${day}`;
}

module.exports = {
	preset: preset,
	curlProx: function(host, station, dates, type){
	
		// console.log('station',station)
		// console.log('dates',dates)
		// console.log('type',type)
		var url = `${preset.station[station]}&date=${parsePeriod(dates.start)}-${parsePeriod(dates.end)}`
		if(['glob', '64n-90n', 'nhem'].includes(station) && ['glob_temp','nhem_temp','64n-90n_temp','temperature'].includes(type)){
			// url = `${url}&types=${preset.types[station+type]},station`
			url = `${url}&types=${preset.types[station+type]}`
				
		}else if(type){
			url = `${url}&types=${preset.types[type] != undefined ? preset.types[type] : type},station`
			// console.log('types',`${preset.types[type] != undefined ? preset.types[type] : type},station`)
		} 
		if(preset.station[station] === undefined) return Promise.reject({
			"ERROR": "No such station",
			"keys": Object.keys(preset.station),
			"data": [],
			"URL": url
		})
		// console.log('URL', url)
		// ffsdfsd
		return module.exports.curl((host)+url) 
	},
	// requests: 300,
	curl: function(url) {
		// console.log('URL', url)
		const curl = new Curl();
		curl.setOpt('URL', url)
		curl.setOpt('FOLLOWLOCATION', true);
		var req = new Promise((res, rej) => {
			curl.on('end', function (statusCode, data, headers) {
				// console.info("curl req", statusCode);
				// console.info('---');
				// console.info(data.length);
				// console.info('---');
				// console.info("time",this.getInfo( 'TOTAL_TIME' ));
				// console.log("data",data)
				//

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
				this.close();
				if(statusCode === 504){
					rej(statusCode)
				}else if(statusCode === 400){
					res([]);
				}else {
					json = JSON.parse(data)
					// console.log("json",json)
					// console.log('URL', url)
					res(json)
				}
			});

		}) 
		curl.on('error', () => {
			curl.close.bind(curl)
		});
		process.nextTick(() => {
			// setTimeout(curl.perform(), Math.floor(Math.random()*200))
			curl.perform()
		});
		return req
	},
}

