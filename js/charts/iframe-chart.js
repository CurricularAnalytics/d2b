/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*iframe chart*/
d2b.CHARTS.iframeChart = function(){

	//define iframeChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT();

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {
			};

	//init event object
	var on = d2b.CONSTANTS.DEFAULTEVENTS();

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chart;
	};

	chart.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
		}

		generateRequired = true;
		currentChartData = chartData.data;

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		selection.div = selection
			.append('div')
				.attr('class','d2b-iframe-chart d2b-container');

		selection.div.iframe = selection.div
			.append('iframe')
				.attr('class','d2b-iframe')
				.attr('src',currentChartData.url);

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		selection.div.iframe
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
