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
        var description = client.describe();
        for (const key in description.KashFlowAPI.KashFlowAPISoap) {
            wrapped[key] = function(params, callback) {
                params = datesToXSD(params);
                params.Password = Kashflow.login.Password;
                params.UserName = Kashflow.login.UserName;
                var fn = client[key];
                fn.bind(client);
                fn(params, function(err, response) {
                    if (error(err, response)) callback(error(err, response));
                    callback(false, response[key+'Result']);
                });
            };
        }

        return wrapped;
    }

};

module.exports = Kashflow;
