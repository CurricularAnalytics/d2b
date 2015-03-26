AD.createNameSpace("AD.UTILS.CHARTS.MEMBERS");

AD.UTILS.CHARTS.MEMBERS.on = function(chart, _chart, callback){
  return function(key, value){
		key = key.split('.');
		if(!arguments.length) return _chart.on;
		else if(arguments.length == 1){
			if(key[1])
				return _chart.on[key[0]][key[1]];
			else
				return _chart.on[key[0]]['default'];
		};

		if(key[1])
      _chart.on[key[0]][key[1]] = value;
		else
      _chart.on[key[0]]['default'] = value;

    if(callback)
      callback(value);

		return chart;
	};
};

AD.UTILS.CHARTS.MEMBERS.select = function(chart, _chart, callback){
  return function(value){

    _chart.selection = d3.select(value);
    if(callback)
      callback(value);
		return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.prop = function(chart, _chart, property, callback){
  return function(value){
    if(!arguments.length) return _chart[property];
    _chart[property] = value;
    if(callback)
      callback(value);
    return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.scale = function(chart, _chart, property, callback){
  return function(value){
    if(!arguments.length) return _chart[property];
    if(value.type){
      _chart[property].type = value.type;
      var type = _chart[property].type.split(',');
      if(type[0] == 'quantitative')
        _chart[property].scale = d3.scale[type[1]]();
      else if(type[0] == 'time')
        _chart[property].scale = d3[type[0]].scale();
      else
        _chart[property].scale = d3.scale[type[0]]();
    }

    if(value.domain){
      _chart[property].domain = value.domain;
      _chart[property].scale.domain(_chart[property].domain);
    }

    _chart[property].hide = value.hide;

    _chart[property].invert = value.invert;

    if(callback)
      callback(value);
    return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.format = function(chart, _chart, property, callback){
  return function(value){
    if(!arguments.length) return _chart[property];
    _chart.xFormat = AD.UTILS.numberFormat(value);
    if(callback)
      callback(value);
    return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.controls = function(chart, _chart, callback){
  return function(value){
    if(!arguments.length) return _chart.controlsData;
    for(control in value){
      for(controlProp in value[control]){
        _chart.controlsData[control][controlProp] = value[control][controlProp];
      }
    }
    if(callback)
      callback(value);
    return chart;
  }
};
