d2b.createNameSpace("d2b.UTILS.CHARTS.MEMBERS");

d2b.UTILS.CHARTS.MEMBERS.events = function(chart, $$, callback){
  return function(key, listener){
    var expKey = key.split('-');
    if(expKey[0] == 'element'){
      $$.events.addElementListener('main', key, listener);
    }else{
      $$.events.addListener(key, listener);
    }

    if(callback) callback(key, listener);

		return chart;
	};
};

d2b.UTILS.CHARTS.MEMBERS.select = function(chart, $$, callback){
  return function(value){
    $$.selection = d3.select(value);
    if(callback) callback(value);
		return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.prop = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = value;
    if(callback) callback(value);
    return chart;
  }
};

// d2b.UTILS.CHARTS.MEMBERS.scale = function(chart, $$, property, callback){
//   return function(value){
//     if(!arguments.length) return $$[property];
//     if(value.type){
//       $$[property].type = value.type;
//       var type = $$[property].type.split(',');
//       if(type[0] == 'quantitative')
//         $$[property].scale = d3.scale[type[1]]();
//       else if(type[0] == 'time')
//         $$[property].scale = d3[type[0]].scale();
//       else
//         $$[property].scale = d3.scale[type[0]]();
//     }
//
//     if(value.domain){
//       $$[property].domain = value.domain;
//       $$[property].scale.domain($$[property].domain);
//     }
//
//     $$[property].hide = value.hide;
//
//     $$[property].invert = value.invert;
//
//     if(callback) callback(value);
//     return chart;
//   }
// };

d2b.UTILS.CHARTS.MEMBERS.format = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = d2b.UTILS.numberFormat(value);
    if(callback) callback(value);
    return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.controls = function(chart, $$, callback){
  return function(value){
    if(!arguments.length) return $$.controlsData;
    for(control in value){
      for(controlProp in value[control]){
        $$.controlsData[control][controlProp] = value[control][controlProp];
      }
    }
    if(callback) callback(value);
    return chart;
  }
};
