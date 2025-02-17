/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-line*/
d2b.UTILS.AXISCHART.TYPES.line = function(){

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

	$$.point = d2b.SVG.point()
		.size(40)
		.active(true)
		.fill('white');

	$$.line = d3.svg.line()
    .x(function(d) { return $$.x(d.x); })
    .y(function(d) { return $$.y(d.y); });

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

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

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.y;}));
		});
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){
		$$.background.each(function(graphData,i){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() === 0){
				path = graph.append('path')
					.call($$.events.addElementDispatcher, 'main', 'd2b-line');
			}

			$$.line
				.interpolate(graphData.interpolate || 'linear')
				.tension(graphData.tension || 0);

			path
					.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.datum(function(d){return graphData.values;})
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.line);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			var point = graph.selectAll('g').data(function(d){return d.values;});

			newPoint = point.enter()
				.append('g')
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
				});

			var stroke = d2b.UTILS.getColor($$.color, 'label', [graphData])
			$$.point
				.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; })
				.stroke(stroke);

			point
				.call($$.point)
				.call($$.events.addElementDispatcher, 'main', 'd2b-line-point')
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return d.x;},
						y:function(d){return d.y;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				);

			point
				.transition()
					.duration($$.animationDuration)
					.attr('transform',function(d){
						return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
					});

			point.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
