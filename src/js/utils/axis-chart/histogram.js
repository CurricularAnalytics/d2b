/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-histogram*/
d2b.UTILS.AXISCHART.TYPES.histogram = function(){

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
	$$.events = d2b.UTILS.chartEvents();

	$$.hist = d3.layout.histogram();

	$$.padding = "0";

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" - "+$$.xFormat(d.data.x + d.data.dx)+": "+$$.yFormat(d.data.y);
	};

	$$.barSignedHeight = function(d){
		var origin, destination;

		origin = $$.y(0);
		destination = $$.y(d.y);

		return origin - destination;
	};
	$$.barHeight = function(d){
		return Math.abs($$.barSignedHeight(d));
	};
	$$.barY = function(d){
		var origin, destination;

		origin = $$.y(0);
		destination = $$.y(d.y);

		return  Math.min(origin, destination);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.general =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'general');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	//additional histogram properties
	chart.padding =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'padding');

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.y;}));
		});
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		$$.currentChartData.forEach(function(graphData){
			graphData.histData = $$.hist.bins(graphData.bins)(graphData.values);
		});

		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData){
			var graph = d3.select(this);

			var xVals = graphData.histData.map(function(d){return d.x;});
			var xRange = [$$.x(d3.min(xVals)),
										$$.x(d3.max(xVals))];

			var barWidth = 1.03*Math.abs(xRange[0]-xRange[1])/graphData.histData.length;

			var padding = d2b.UTILS.visualLength($$.padding, barWidth);

			barWidth -= 1*padding;

			// var barWidth = ($$.width / data.length)/2;

			graph.selectAll('rect')

			var bar = graph.selectAll('rect').data(graphData.histData, function(d,i){
				return d.x;
			});
			var newBar = bar.enter()
				.append('rect')
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.attr('y',$$.y(0))
					.attr('height',0)
					.call($$.events.addElementDispatcher, 'main', 'd2b-histogram-bar');

			bar
				// .call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return {data:d, graph:graphData};})
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return $$.x.invert(($$.x(d.x) - padding + barWidth/2));},
						y:function(d){return d.y;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				)
				.transition()
					.duration($$.animationDuration)
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.attr('x',function(d){return $$.x(d.x) - padding;})
					.attr('width',function(d){return Math.max(0, barWidth);})
					.attr('y', $$.barY)
					.attr('height', $$.barHeight);

			bar.exit()
				.transition()
					.duration($$.animationDuration)
					.attr('y', $$.y(0))
					.attr('height',0);

		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
