/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
d2b.UTILS.AXISCHART.TYPES.template = function(type){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].xValues){
				return d2b.UTILS.AXISCHART.TYPES[type].xValues.call($$, chart);
			}
		}

    var values = [];
    return values;
  };
	chart.yValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].yValues){
				return d2b.UTILS.AXISCHART.TYPES[type].yValues.call($$, chart);
			}
		}

		var values = [];
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].update){
				d2b.UTILS.AXISCHART.TYPES[type].update.call($$, chart);
				if(callback)
					callback();
				return chart;
			}
		}

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			//code for the background visualization goes here
			//this will iterate through all of the background graph containers of this type
		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			//code for the foreground visualization goes here
			//this will iterate through all of the foreground graph containers of this type
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
