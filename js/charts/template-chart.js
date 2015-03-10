/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
AD.CHARTS.templateChart = function(){

	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new AD.UTILS.LEGENDS.legend(),
	  	horizontalControls = new AD.UTILS.CONTROLS.horizontalControls(),
			legendOrientation = 'bottom';

	var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};

	var xFormat = function(value){return value};

	var controls = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

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
		legend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}

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
			generateRequired = true;
		}

		currentChartData = chartData.data;

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-template-chart ad-svg ad-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.template = selection.group
			.append('g')
				.attr('class','ad-template');
		// //create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','ad-controls');


		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});

		// //intialize new legend
		legend
				.color(color)
				.selection(selection.legend);

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

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		// if(controls.hideLegend.enabled){
		// 	var legendData = {data:{items:[]}};
		// }else{
		// 	var legendData = {
		// 		data:{
		// 			items:	d3
		// 								.set(currentChartData.nodes.map(function(d){
		// 										return d.colorKey;
		// 									}))
		// 								.values()
		// 								.map(function(d){return {label:d};})
		// 		}
		// 	};
		// }

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		// if(legendOrientation == 'right' || legendOrientation == 'left'){
		// 	legend.orientation('vertical').data(legendData).height(innerHeight).update();
		// }
		// else{
		// 	legend.orientation('horizontal').data(legendData).width(innerWidth).update();
		// }
		//
		// var legendTranslation;
		// if(legendOrientation == 'right')
		// 	legendTranslation = 'translate('+(forcedMargin.left+innerWidth-legend.computedWidth())+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		// else if(legendOrientation == 'left')
		// 	legendTranslation = 'translate('+(forcedMargin.left)+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		// else if(legendOrientation == 'top')
		// 	legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+forcedMargin.top+')';
		// else
		// 	legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(innerHeight+forcedMargin.top-legend.computedHeight())+')';
		//
		// selection.group.legend
		// 	.transition()
		// 		.duration(animationDuration)
		// 		.attr('transform',legendTranslation);
		//
		// if(legendOrientation == 'right' || legendOrientation == 'left')
		// 	forcedMargin[legendOrientation] += legend.computedWidth();
		// else
		// 	forcedMargin[legendOrientation] += legend.computedHeight();
		//
		// innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		// innerWidth = width - forcedMargin.left - forcedMargin.right;

		selection.svg
				.attr('width',width)
				.attr('height',height);

		selection.group
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
