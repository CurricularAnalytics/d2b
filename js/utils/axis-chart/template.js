/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
AD.CHARTS.template = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = AD.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = AD.CONSTANTS.DEFAULTHEIGHT();
	// //inner/outer height/width and margin are modified as sections of the chart are drawn
	// $$.innerHeight = $$.height;
	// $$.innerWidth = $$.width;
	// $$.outerHeight = $$.height;
	// $$.outerWidth = $$.width;
	// $$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
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

	// $$.x = d3.scale.linear();
	// $$.y = d3.scale.linear();
	$$.rangeBand = 0;

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							AD.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.rangeBand = AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'rangeBand');
	chart.x = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.yFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}
		$$.currentChartData = chartData;
		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}



		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
