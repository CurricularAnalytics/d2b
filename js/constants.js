/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*AD constants*/
AD.createNameSpace("AD.CONSTANTS");

AD.CONSTANTS.DEFAULTPALETTE = {primary:"rgb(42,54,82)",secondary:"rgb(11,22,47)"}
AD.CONSTANTS.DEFAULTWIDTH = function(){ return 960; };
AD.CONSTANTS.DEFAULTHEIGHT = function(){ return 540; };
AD.CONSTANTS.DEFAULTMARGIN = function(){ return {left:0,right:0,top:0,bottom:0}; };
AD.CONSTANTS.DEFAULTFORCEDMARGIN = function(){ return {left:30, bottom:20, right:30, top:20}; };
AD.CONSTANTS.DEFAULTCOLOR = function(){ return d3.scale.category10(); };

AD.CONSTANTS.ANIMATIONLENGTHS = function(){ return {normal:500,short:100,long:1000}; };
