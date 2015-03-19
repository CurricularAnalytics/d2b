AD.createNameSpace("AD.UTILS.CHARTS.MEMBERS");

AD.UTILS.CHARTS.MEMBERS.on = function(chart, _, callback){
  return function(key, value){
		key = key.split('.');
		if(!arguments.length) return _.on;
		else if(arguments.length == 1){
			if(key[1])
				return _.on[key[0]][key[1]];
			else
				return _.on[key[0]]['default'];
		};

		if(key[1])
      _.on[key[0]][key[1]] = value;
		else
      _.on[key[0]]['default'] = value;

    if(callback)
      callback();

		return chart;
	};
};

AD.UTILS.CHARTS.MEMBERS.select = function(chart, _, callback){
  return function(value){

    _.selection = d3.select(value);
    if(callback)
      callback();
		return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.prop = function(chart, _, property, callback){
  return function(value){
    if(!arguments.length) return _[property];
    _[property] = value;
    if(callback)
      callback();
    return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.format = function(chart, _, property, callback){
  return function(value){
    if(!arguments.length) return _[property];
    _.xFormat = AD.UTILS.numberFormat(value);
    if(callback)
      callback();
    return chart;
  }
};

AD.UTILS.CHARTS.MEMBERS.controls = function(chart, _, callback){
  return function(value){
    if(!arguments.length) return _.controlsData;
    for(control in value){
      for(controlProp in value[control]){
        _.controlsData[control][controlProp] = value[control][controlProp];
      }
    }
    if(callback)
      callback();
    return chart;
  }
};
