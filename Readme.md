# SoundtrackOptical.js

Create optical soundtracks using Javascript in either node.js or the browser.

## Usage - Browser

```html
<html>
<body>
	<canvas id="canvas"></canvas>
	<script src="SoundtrackOptical.js"></script>
	<script>
			var soundFile = 'data/barking.wav'; //url of sound file to decode
			var canvas = document.getElementById('canvas');
			var soundtrack = new SoundtrackOptical(canvas, soundFile);
			soundtrack.decode().then(() => {
				for (var i = 0; i < soundtrack.FRAMES; i++) {
					soundtrack.draw()
				}
			}).catch(err => {
				console.error(err);
			})
	</script>
</body>
</html>
```

## Usage - Node

```javascript
const SoundtrackOptical = require('soundtrackoptical');
const soundFile = './data/barking.wav'; // Path 
const soundtrack = new SoundtrackOptical(soundFile);

async function demo () {
	await soundtrack.decode();
	for ()
}

demo();
```