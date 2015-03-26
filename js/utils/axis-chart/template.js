/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
AD.UTILS.AXISCHART.TYPES.template = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = AD.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = AD.CONSTANTS.DEFAULTEVENTS();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.yFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

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
