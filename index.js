var restify = require('restify')
var scrypt = require('scrypt-hash')
var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

var server = restify.createServer()
server.use(restify.acceptParser(server.acceptable))
server.use(restify.bodyParser())
server.use(restify.gzipResponse())
// TODO: throttle

var valid = {
	salt: 'identity.mozilla.com/picl/v1/scrypt',
	N: 65536,
	r: 8,
	p: 1,
	buflen: 32
}

function validate(params) {
	for (var name in valid) {
		if (valid[name] !== params[name]) {
			return name + ' is invalid'
		}
	}
	if (typeof params.input !== 'string' || !HEX_STRING.test(params.input)) {
		return 'input is invalid'
	}
	return params
}

server.get('/', function (req, res, next) { res.send('ok'); next() })

server.post(
	'/',
	function (req, res, next) {
		var p = validate(req.params)
		if (typeof p === 'string') {
			return next(new restify.BadRequestError(p))
		}
		scrypt(Buffer(p.input, 'hex'), Buffer(p.salt), p.N, p.r, p.p, p.buflen,
			function (err, hash) {
				if (err) {
					res.send(new restify.InternalError(err.message))
				}
				else {
					res.send({ output: hash.toString('hex') })
				}
				next()
			}
		)
	}
)

server.listen(8080)
