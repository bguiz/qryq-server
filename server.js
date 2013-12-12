//external dependencies
var express = require('express');
var qryq = require('qryq');
var Q = require('q');
var _ = require('underscore');

//local includes
var npmPackage = require('./package.json');
var qryqApi = require('./api');

var config = npmPackage.config;
var portNumber = config.port || 8080;
var staticFiles = config.static || 'static';
var apiUrl = (config.apiQryq || '/api/v1/qryq');
var maxReqLength = config.maxReqLength || 1000000;
var debugMode = !! config.debug;

var server = express();
if (staticFiles) {
	server.use(express.static(__dirname+'/'+staticFiles));
}
if (debugMode) {
	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/*
 * Middleware that parses a request in chunks as it is received.
 * Ignores assumes content type is JSON
 * Sets value on req.json
 */
function parseJsonMw(req, resp, next) {
	req.content = '';
	var contentLength = 0;
	req.on('data', function(data) {
		req.content += data;
		contentLength += data.length;
		if (contentLength > maxReqLength) {
			resp.contentType('application/json');
			resp.send(406, JSON.stringify({
				error: 'Data exceeded size limit'
			}));
			req.connection.destroy();
		}
	});
	req.on('end', function() {
		try {
			req.json = JSON.parse(req.content);
		}
		catch (exc) {
			//Do nothing, handled in finally block
		}
		finally {
			if (req.json) {
				next();
			}
			else
			{
				resp.contentType('application/json');
				resp.send(406, JSON.stringify({
					error: 'Data was invalid JSON'
				}));
			}
		}
	});
}

/*
 * This single express endpoint handles all qryq requests.
 * No further modifications required here, however, you
 * probably want to modify the API object to contain the
 * desired functionality (api.js)
 *
curl -i -X POST \
-d '[
{"id": "A", "api": "add", "qry":{"a":3, "b":4}},
{"id": "B", "api": "multiply", "qry":{"a":"#{A}", "b":3}},
{"id": "C", "api": "multiply", "qry":{"a":7, "b": "#{A}"}},
{"id": "D", "api": "add", "qry":{"a":"#{C}", "b":"#{B}"}}
]' \
http://localhost:9999/api/v1/qryq
 *
 */
server.post(apiUrl, [parseJsonMw], function(req, resp) {
	console.log('post', apiUrl, req.json);
	var out = {
		'request': req.json,
		'response': {}
	};
	var deferred = Q.defer();
	qryq.dependent(deferred, req.json, qryqApi);
	console.log('dependent called', apiUrl, req.json);
	deferred.promise.then(function(result) {
		console.log('success', result);
		out.response = result;
		resp.send(200, JSON.stringify(out));
	}, function(reason) {
		console.log('failure', reason);
		resp.send(500, JSON.stringify(_.extend(out, {reason: reason})));
	});
});

/*
 * You can still expose endpoints that do not use qryq, e.g.:
 *
curl -i -X GET http://localhost:9999/hello
 *
 */
server.get('/hello', function(req, resp) {
  resp.contentType('text/plain');
  resp.send(200, "world");
});

server.listen(portNumber);
console.log(npmPackage.name, 'v'+npmPackage.version, 'listening on port', portNumber);
console.log('qryq endpoint exposed at', apiUrl);
