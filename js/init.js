/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var AD = AD || {};

//namespace method for adding new namespaces
AD.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = AD;

    if (nsparts[0] === "AD") {
        nsparts = nsparts.slice(1);
    }

    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        parent = parent[partname];
    }
    return parent;
};


/*AD charts*/
AD.createNameSpace("AD.CHARTS");

/*AD charts*/
AD.createNameSpace("AD.DASHBOARDS");

/*AD UTILITIES*/
AD.createNameSpace("AD.UTILS");
/*AD UTILITIES*/
AD.createNameSpace("AD.UTILS.CHARTPAGE");

// AD.createNameSpace("AD.UTILS.CHARTS");
// AD.UTILS.CHARTS.onHelper = function(){
//   var _self = this;
//   return function(key, value){
// 		key = key.split('.');
// 		if(!arguments.length) return _self.on;
// 		else if(arguments.length == 1){
// 			if(key[1])
// 				return _self.on[key[0]][key[1]];
// 			else
// 				return _self.on[key[0]]['default'];
// 		};
//
// 		if(key[1])
//       _self.on[key[0]][key[1]] = value;
// 		else
//       _self.on[key[0]]['default'] = value;
//
// 		return _self.chart;
// 	};
// };
