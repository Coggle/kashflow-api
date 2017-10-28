var soap = require('soap');
var { datesToXSD } = require('./xsdDateTime');
var client;

function error(err, result){
	if (err) return err;
	if (result.Status !== 'OK') {
		var e = new Error('result not OK from Kashflow API ('+result.Status+')');
        e.result = result;
        return e;
	}
}

function getArrayOutputField(description) {
    var output = Object.assign({}, description);
    // try to work out when the result is an array of stuff
    delete output.targetNSAlias;
    delete output.targetNamespace;
    var outputKeys = Object.keys(output);
    if ((outputKeys.length === 1) && outputKeys[0].endsWith('[]')) {
        return outputKeys[0].substr(0, outputKeys[0].length-2);
    } else {
        return false;
    }
}

// Kashflow Object
var Kashflow = {

    url : 'https://securedwebapp.com/api/service.asmx?WSDL',
    options : {},
    login: {},

    client: function (callback) {
        if (client) return callback(false, client);

        soap.createClient(Kashflow.url, Kashflow.options, function (err, result) {
            if (err) return callback(err);
            result.setSecurity(new soap.BasicAuthSecurity('admin-priv', 'password'));
            client = Kashflow.wrapClient(result);
            callback(null, client);
        });
    },

    wrapClient: function(client) {
        var wrapped = {};
        var descriptions = client.describe().KashFlowAPI.KashFlowAPISoap;
        for (const key in descriptions) {
            wrapped[key] = function(params, callback) {
                params = datesToXSD(params);
                params.Password = Kashflow.login.Password;
                params.UserName = Kashflow.login.UserName;
                var fn = client[key];
                fn.bind(client);
                fn(params, function(err, response) {
                    if (error(err, response)) return callback(error(err, response));
                    var arrayOutputField = getArrayOutputField(descriptions[key].output[key+'Result']);
                    if (response[key+'Result'][arrayOutputField]) {
                        return callback(false, response[key+'Result'][arrayOutputField]);
                    } else{
                        return callback(false, response[key+'Result']);
                    }
                });
            };
        }

        return wrapped;
    }

};

module.exports = Kashflow;
