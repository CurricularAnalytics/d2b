/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var d2b = d2b || {};

//namespace method for adding new namespaces
d2b.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = d2b;

    if (nsparts[0] === "d2b") {
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


/*d2b charts*/
d2b.createNameSpace("d2b.CHARTS");

/*d2b charts*/
d2b.createNameSpace("d2b.DASHBOARDS");

/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS");
/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CHARTPAGE");

d2b.createNameSpace("d2b.UTILS.AXISCHART.TYPES");
