/**
 * d2b.chart.template() returns a d2b chart model.
 *
 * model.attrs() will return an object of chart attributes.
 *
 * model.chart() will return a chart interface with various built in methods.
 *
 * @param {Object} config
 * @return {Object} model
 */

d2b.model.chart = function(config){
  var model = {};

  var $$ = {
    duration: 500,
    dispatch: d3.dispatch.apply(this, config.events)
  };

  var chart = {};

  // init dispatcher
  config.events = ['beforeUpdate', 'afterUpdate'].concat(config.events);
  $$.dispatch = d3.dispatch.apply(this, config.events);

  // chart methods

  chart.select = (_) => {
    if(!arguments.length) return $$.selection;
    $$.selection = _;
    return chart;
  };

  chart.update = function(callback){
  	$$.dispatch.beforeUpdate.call($$.selection);

    // execute config.update
    config.update();

		// flush the d3 timer after update complete
		// this allows for immediate updates with $$.duration = 0
		d3.timer.flush();

		// dispatch the 'afterUpdate' event
		$$.dispatch.afterUpdate.call($$.selection);

    // execute callback if provided
		if(callback) callback();

    return chart;
  };

  chart.width = function(){
    return chart;
  };

  chart.height = function(){
    return chart;
  };

  // model methods

  model.internal = function(){
    return $$;
  };

  model.interface = function(){
    return chart;
  };

  return model;
};
