var _ = require('underscore');

/*
 * Replace the functions within this api object with whatever you wish to
 * expose through a qryq endpoint.
 *
 * The contract to fulfil is:
 * - each function must accept two parameters: deferred, qry
 *		- deferred is a Q deferred object
 *			- when the computation is finished, call deferred.resolve with
 *				the result
 *			- when the computation fails, call deferred.reject with
 *				the failure reason
 *		- qry is a plain old javascript object
 *			- these will contain the input values to the function
 */
var api = {
	add: function(deferred, qry) {
		if (!qry || ! _.isNumber(qry.a) || ! _.isNumber(qry.b)) {
		  deferred.reject('Must specify two numeric params, a and b. Params were: '+JSON.stringify(qry));
		}
		else {
		  deferred.resolve(qry.a + qry.b);
		}
	},

	multiply: function(deferred, qry) {
		if (!qry || ! _.isNumber(qry.a) || ! _.isNumber(qry.b)) {
		  deferred.reject('Must specify two numeric params, a and b. Params were: '+JSON.stringify(qry));
		}
		else {
		  deferred.resolve(qry.a * qry.b);
		}
	}
};

_.extend(exports, api);
