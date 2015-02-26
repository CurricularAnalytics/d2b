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