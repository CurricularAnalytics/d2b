/*template chart*/
AD.CHARTS.iframeChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var generateRequired = true; //using some methods may require the chart to be redrawn		

	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
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
		return chart;
	};
	
	//generate chart
	chart.generate = function(chartData) {
		generateRequired = false;

		currentChartData = {
					};

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('div')
				.attr('class','ad-iframe-chart ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		selection.group.iframe = selection.group
			.append('iframe')
				.attr('class','ad-iframe');

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)	
				.update(chartData)
				.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(chartData){

		//if chartData is non-nil update the currentChartData information
		if(chartData){	
			if(chartData.data){
				currentChartData = chartData.data;
			}
		}
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(currentChartData);
		}
		
		selection.group.iframe
				.attr('src',currentChartData.url)
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);
		

		d3.timer.flush();		
				
		return chart;
	};
	
	return chart;
};