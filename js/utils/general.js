/* Copyright 2014 - 2015 Kevin Warne All rights reserved. */

/*shapes*/
AD.createNameSpace("AD.UTILS.SHAPES");


/*tooltop utilities*/
AD.UTILS.createGeneralTooltip = function(elem, heading, content){
	var body = d3.select('body');
	var adGeneralTooltip = body.append('div')
			.attr('class','ad-general-tooltip')
			.html(heading+': '+content)
			.style('opacity',0);
	
	adGeneralTooltip
		.transition()
			.duration(50)
			.style('opacity',1);
	var scroll = AD.UTILS.scrollOffset();
	
	var bodyWidth = body.node().getBoundingClientRect().width;
	// console.log(bodyWidth)
	var pos = {left:0,top:0};
	
	pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)? 
								scroll.left+d3.event.clientX+10 : 
								scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
	pos.top = scroll.top+d3.event.clientY-10;
			
	AD.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 0);	
	elem.on('mousemove',function(){
		scroll = AD.UTILS.scrollOffset();

		pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)? 
		scroll.left+d3.event.clientX+10 : 
									scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
		pos.top = scroll.top+d3.event.clientY-10;
	
		AD.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 50);
	});
	return adGeneralTooltip;
};
AD.UTILS.removeTooltip = function(){
	d3.selectAll('.ad-general-tooltip')
			.remove();
};
AD.UTILS.moveTooltip = function(tooltip, x, y, duration){
	tooltip
		.transition()
			.duration(duration)
			.ease('linear')
			.style('opacity',1)
			.style('top',y+'px')
			.style('left',x+'px');
			
	d3.timer.flush();				
};

/*extra utilities*/
AD.UTILS.scrollOffset = function(){
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {top:top, left:left};
};

AD.UTILS.getValues = function(obj){
	var values = [];
	for(var key in obj) {
		obj[key].key = key;
    values.push(obj[key]);
	}
	return values;
};

/*Axis Chart Utilities*/
AD.createNameSpace("AD.UTILS.AXISCHARTS");
AD.UTILS.AXISCHARTS.getDomainLinear = function(values){
	return [(d3.min(values)<0)? d3.min(values) : 0, d3.max(values)+1]
};
AD.UTILS.AXISCHARTS.getDomainOrdinal = function(values){
	return d3.set(values).values();
};

/*Formating Utilities*/
AD.UTILS.numberFormat = function(preferences){
	var formatString = "";
	var format;
	
	if(preferences.siPrefixed){
		if(preferences.precision>-1){
			formatString += "."+preferences.precision;
		}
		formatString += "s";
	}else{
		if(preferences.separateThousands){
			formatString += ",";
		}
		if(preferences.precision>-1){
			formatString += "."+preferences.precision+"f";
		}
	}
	
	format = d3.format(formatString)
	
	return function(value){
		var units = {
			before:(preferences.units.before)?preferences.units.before:"",
			after:(preferences.units.after)?preferences.units.after:"",
		}
		if(isNaN(value))
			return units.before+value+units.after;
		else
			return units.before+format(value)+units.after;
	}
};


/*Custom Tweens*/
function arcTween(transition, arc) {
	transition.attrTween("d",function(d){
	  var i = d3.interpolate(this._current, d);
	  this._current = d;
	  return function(t) {
	    return arc(i(t));
	  };
	})
}


