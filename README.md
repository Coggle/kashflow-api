# Kashflow API
Wrapper around the Kashflow SOAP API to make it more node-like


### Usage

```javascript
var Kashflow = require('kashflow-api');
Kashflow.login = { UserName: process.env.KASHFLOW_USERNAME, Password: process.env.KASHFLOW_PASSWORD };

Kashflow.client(function(err, client) {
    client.GetCustomers({
    }, function(err, result){
        console.log(err, result);
    });
});
```
