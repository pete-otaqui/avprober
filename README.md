AVProber
========

A simple rewrite of [node-ffprobe](https://github.com/ListenerApproved/node-ffprobe), designed to work with avprobe instead.

This was done since Ubuntu 14.04 doesn't include the metapackage "ffmpeg", and instead uses "libav-tools".

It uses Promises instead of callbacks, and makes use of the es6-promises library so that the API is standard.



Installation
------------

This has only been tested on Ununtu 14.04

First you need to get the "avprobe" executable:

`$ sudo apt-get install libav-tools`

Then install this package, either inside your package.json or like so:

`$ npm install avprober`



Usage
-----

```javascript
var avprober = require('avprober');

avprober('some/file.mp3')
	.then(
		function(data) {
			console.log('YAY', data);
		},
		function(err) {
			console.error('BOO', err);
		}
	);
```



License
-------

MIT licensed.