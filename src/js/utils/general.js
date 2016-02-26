/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*function cloner*/
Function.prototype.clone = function(){
	var that = this;
	var temp = function temporary(){return that.apply(this,arguments);};
	for(var key in this){
		if(this.hasOwnProperty(key)){
			temp[key]=this[key];
		}
	}
	return temp;
}

d2b.number = function(x){
	return x === null ? NaN : +x;
};

/*bring to front*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

/*non destructive reverse*/
Array.prototype._reverse = function(){
	var tmp = [];
	Array.prototype.push.apply(tmp, this)
	return tmp.reverse();
};

d2b.UTILS.visualLength = function(value,span){
	if(value.toString().indexOf('%') > -1){
		return span * parseFloat(value) / 100;
	}else{
		return parseFloat(value);
	}
};

d2b.UTILS.defined = function(value){
	return value != null && value != undefined;
};

/** apply properties to d2b object
	* use: d2b.UTILS.applyProperties.call(obj, properties);
	*/
d2b.UTILS.applyProperties = function(properties){
	for(var key in properties)
		this[key](properties[key]);

		for(key in properties){
			if(properties[key] != null && properties[key].args)
				this[key].apply(this, properties[key].args)
			else
				this[key](properties[key]);
		}

};

/** check for existance of a nested attribute
	*/
d2b.UTILS.checkNested = function(obj) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
};

/** get color for a d2b element
	*/
d2b.UTILS.getColor = function(color, defaultAttribute, data, reverse){
	data = data || [];
	return function(d){
		var allData = data.slice(0);
		allData.push(d);
		if(!reverse) allData = allData.reverse();

		for(var i = 0;i < allData.length; i++){
			if(allData[i].colorKey !== null && allData[i].colorKey !== undefined){
				return color(allData[i].colorKey);
			}
		}

		return color(allData[allData.length-1][defaultAttribute]);
	};
};

/*extra utilities*/
d2b.UTILS.scrollOffset = function(){
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {top:top, left:left};
};

d2b.UTILS.getValues = function(obj){
	var values = [];
	for(var key in obj) {
		obj[key].key = key;
    values.push(obj[key]);
	}
	return values;
};

/*Formating Utilities*/
d2b.UTILS.niceFormat = function(value, precision){
	if(!precision)
		precision = 0;
	var format = d3.format("."+precision+"f");
	absValue = Math.abs(value);
	if(isNaN(value)){
		return value;
	}else{
		if(absValue < Math.pow(10,3))
			return format(absValue);
		else if(absValue < Math.pow(10,6))
			return format(absValue/Math.pow(10,3))+' thousand';
		else if(absValue < Math.pow(10,9))
			return format(absValue/Math.pow(10,6))+' million';
		else if(absValue < Math.pow(10,12))
			return format(absValue/Math.pow(10,9))+' billion';
		else if(absValue < Math.pow(10,15))
			return format(absValue/Math.pow(10,12))+' trillion';
		else if(absValue < Math.pow(10,18))
			return format(absValue/Math.pow(10,15))+' quadrillion';
		else if(absValue < Math.pow(10,21))
			return format(absValue/Math.pow(10,18))+' quintillion';
		else if(absValue < Math.pow(10,24))
			return format(absValue/Math.pow(10,21))+' sextillion';
		else if(absValue < Math.pow(10,27))
			return format(absValue/Math.pow(10,24))+' septillion';
		else if(absValue < Math.pow(10,30))
			return format(absValue/Math.pow(10,27))+' octillion';
		else if(absValue < Math.pow(10,33))
			return format(absValue/Math.pow(10,30))+' nonillion';
		else if(absValue < Math.pow(10,36))
			return format(absValue/Math.pow(10,33))+' decillion';
		else if(absValue < Math.pow(10,39))
			return format(absValue/Math.pow(10,36))+' undecillion';
		else if(absValue < Math.pow(10,42))
			return format(absValue/Math.pow(10,39))+' duodecillion';
		else if(absValue < Math.pow(10,45))
			return format(absValue/Math.pow(10,42))+' tredecillion';
		else if(absValue < Math.pow(10,48))
			return format(absValue/Math.pow(10,45))+' quattuordecillion';
		else if(absValue < Math.pow(10,51))
			return format(absValue/Math.pow(10,48))+' quindecillion';
		else if(absValue < Math.pow(10,54))
			return format(absValue/Math.pow(10,51))+' sexdecillion';
		else if(absValue < Math.pow(10,57))
			return format(absValue/Math.pow(10,54))+' septendecillion';
		else if(absValue < Math.pow(10,60))
			return format(absValue/Math.pow(10,57))+' octdecillion';
		else if(absValue < Math.pow(10,63))
			return format(absValue/Math.pow(10,60))+' novemdecillion';
		else if(absValue < Math.pow(10,303))
			return format(absValue/Math.pow(10,63))+' vigintillion';
		else
			return format(absValue/Math.pow(10,303))+' centillion';
	}
}

d2b.UTILS.numberFormat = function(preferences){
	var formatString = "";
	var format;
	var units;

	if(preferences.units){
		units = {
			before:(preferences.units.before)?preferences.units.before:"",
			after:(preferences.units.after)?preferences.units.after:"",
		};
	}else{
		units = {
			before:"",
			after:"",
		}
	}

	if(preferences.nice){
		return function(value){return units.before + d2b.UTILS.niceFormat(value, preferences.precision) + units.after};
	}else if(preferences.siPrefixed){
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
		if(isNaN(value))
			return units.before+value+units.after;
		else
			return units.before+format(value)+units.after;
	}
};

d2b.UTILS.textWrap = function(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};


/*Custom Tweens*/
d2b.createNameSpace("d2b.UTILS.TWEENS");
//arc tween from this.oldArc to this.newArc
d2b.UTILS.TWEENS.arcTween = function(transition, arc){
	transition.attrTween("d",function(d){
		var _self = this;
		_self.oldArc = _self.oldArc || _self.newArc;
		var interpolator = d3.interpolate(_self.oldArc,_self.newArc)
		function tween(t){
			_self.oldArc = interpolator(t);
			return arc(_self.oldArc);
		}
		return tween;
	});
};

/*grid positioning*/
d2b.UTILS.grid = function(width, height, count){
	var ratio = width / height;
	var obj = {};
	obj.columns = Math.min(count,Math.max(1, Math.round(Math.sqrt(count) * (ratio))));
	obj.rows = Math.ceil(count/obj.columns);
	return obj
};

/*automaticaly get scale domain from a set of values*/
d2b.UTILS.domain = function(values, scale, padding){
	var domain = [], extent, range;
	if(scale && scale.rangeBand){
		domain = d3.set(values).values();
		padding = null;
	}else if(values.length == 0){
		domain = [0,1];
	}else if(values.length == 1){
		domain = [values[0]/2, values[0]*1.5];
	}else{
		domain = d3.extent(values);
	}

	if(padding){
		domain[0] -= padding[0];
		domain[1] += padding[1];
	}

	return domain;
};
