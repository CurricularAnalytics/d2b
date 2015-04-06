/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var d3b = d3b || {};

//namespace method for adding new namespaces
d3b.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = d3b;

    if (nsparts[0] === "d3b") {
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


/*d3b charts*/
d3b.createNameSpace("d3b.CHARTS");

/*d3b charts*/
d3b.createNameSpace("d3b.DASHBOARDS");

/*d3b UTILITIES*/
d3b.createNameSpace("d3b.UTILS");
/*d3b UTILITIES*/
d3b.createNameSpace("d3b.UTILS.CHARTPAGE");

d3b.createNameSpace("d3b.UTILS.AXISCHART.TYPES");
