function xsdDateTime(date)
{
  function pad(n) {
	 var s = n.toString();
	 return s.length < 2 ? '0'+s : s;
  };

  var yyyy = date.getFullYear();
  var mm1  = pad(date.getMonth()+1);
  var dd   = pad(date.getDate());
  var hh   = pad(date.getHours());
  var mm2  = pad(date.getMinutes());
  var ss   = pad(date.getSeconds());

  return yyyy +'-' +mm1 +'-' +dd +'T' +hh +':' +mm2 +':' +ss;
}

function datesToXSD(params) {
    for (const key in params){
        if (params[key] instanceof Date) {
            params[key] = xsdDateTime(params[key]);
        }
    }
    return params;
}


module.exports.xsdDateTime = xsdDateTime;
module.exports.datesToXSD = datesToXSD;
