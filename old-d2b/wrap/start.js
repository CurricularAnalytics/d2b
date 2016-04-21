/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var d2b = d2b || {};

// closure around d2b
(function(){

d2b.version = "0.0.1";

// namespace method for adding new namespaces
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

/* d2b core */
d2b.createNameSpace("d2b.core");

/* d2b model */
d2b.createNameSpace("d2b.model");

/*d2b charts*/
d2b.createNameSpace("d2b.CHARTS");
d2b.createNameSpace("d2b.chart");

/*d2b charts*/
// d2b.createNameSpace("d2b.DASHBOARDS");

/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS");
d2b.createNameSpace("d2b.UTILS.CHARTPAGE");
d2b.createNameSpace("d2b.util");

d2b.createNameSpace("d2b.UTILS.AXISCHART.TYPES");

/* d2b SVG */
d2b.createNameSpace("d2b.SVG");
d2b.createNameSpace("d2b.svg");

/*d2b constants*/
d2b.createNameSpace("d2b.CONSTANTS");

d2b.CONSTANTS = {
  // DEFAULTPALETTE: {primary:"rgb(42,54,82)",secondary:"rgb(11,22,47)"},
  DEFAULTWIDTH: function(){ return 960; },
  DEFAULTHEIGHT: function(){ return 540; },
  DEFAULTMARGIN: function(){ return {left:0,right:0,top:0,bottom:0}; },
  DEFAULTFORCEDMARGIN: function(){ return {left:30, bottom:20, right:30, top:20}; },
  // DEFAULTFORCEDMARGIN: function(){ return {left:0, bottom:0, right:0, top:0}; },
  DEFAULTCOLOR: function(){ return d3.scale.category10(); },
  DEFAULTEVENTS: function(){ return {
                            		elementMouseover:function(){},
                            		elementMouseout:function(){},
                            		elementClick:function(){}
                            	};
                },
  ANIMATIONLENGTHS: function(){ return {normal:500,short:200,long:1000}; }
};
