var cp = require('child_process')
var http = require('http')

var server = cp.spawn('node', ['index.js'])

setTimeout(function () {
var req = http.request({
	hostname: '127.0.0.1',
	port: 8080,
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
},
function (res) {
	console.assert(res.statusCode === 200)
	res.on('data', function (data) {
		console.assert(JSON.parse(data).output === '8158f3aae9044369c4c6ba5eda6f679cca8adc1186eb29637a75c9e4b4b940f1')
	})
	res.on('end', function () { console.log('ok\n'); server.kill() })
})

req.write('{"input": "ABCDEF0123", "salt":"identity.mozilla.com/picl/v1/scrypt", "N": 65536, "r":8, "p":1, "buflen":32}')
req.end()
}, 100)
