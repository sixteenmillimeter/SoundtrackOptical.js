'use strict';

const { exec } = require('child_process');

async function execAsync (cmd) {
	return new Promise((resolve, reject) => {
		return exec(cmd, (err, stdout, stderr) => {
			if (err) {
				//console.error(err);
				return reject(stdout);
			}
			return resolve(stdout);
		});
	});
}

async function main () {
	const compileDom = `./node_modules/.bin/tsc ./src/dom/index.ts --outFile ./dist/dom/SoundtrackOptical.js -noImplicitAny --lib ES2017 --lib ES2016 --lib dom -t ES2015`;
	const compileNode = `./node_modules/.bin/tsc -p ./tsconfig.json`
	let res;

	try {
		res = await execAsync(compileDom);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Compiled SoundtrackOptical.js DOM library for browsers + canvas`);
	console.log(res);

	try {
		res = await execAsync(compileNode);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Compiled SoundtrackOptical.js node library`);
	console.log(res);

}

main();