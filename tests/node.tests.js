'use strict';

const SoundtrackOptical = require('../dist/node');

async function main () {
	const soundtrack = new SoundtrackOptical('./data/barking.wav');
	//console.dir(so);
	try {
		await soundtrack.decode();
	} catch (err) {
		console.error(err);
	}
	//console.dir(so);
	console.time('frame');
	soundtrack.frame(100);
	console.timeEnd('frame');
	
	console.log('min');
	console.log(soundtrack.min);
	console.log('max');
	console.log(soundtrack.max);
}

main();