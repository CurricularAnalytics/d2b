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
	
	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend(); 
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {};
	
	var xFormat = function(value){return value};
	
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
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
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

		// //intialize new legend
		horizontalLegend
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
		
		// var legendData = {
		// 	data:{
		// 		items:	d3
		// 							.set(currentChartData.nodes.map(function(d){
		// 									return d.colorKey;
		// 								}))
		// 							.values()
		// 							.map(function(d){return {label:d};})
		// 	}
		// };
		// horizontalLegend.width(innerWidth).data(legendData).update();
		// forcedMargin.bottom += horizontalLegend.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		
		// selection.legend
		// 	.transition()
		// 		.duration(animationDuration)
		// 		.attr('transform','translate('+(innerWidth-horizontalLegend.computedWidth())/2+','+innerHeight+')')
		
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