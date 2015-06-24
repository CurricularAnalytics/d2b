/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-area*/
d2b.UTILS.AXISCHART.TYPES.area = function(){

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

	$$.area = d3.svg.area()
    .x(function(d) { return $$.x.customScale(d.x); })
    .y1(function(d) { return $$.y.customScale(d.y); })
    .y0(function(d) { return $$.y.customScale(d.y0); });


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.general =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'general');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	$$.pointMouseover = function(){
		d3.select(this)
				.select('.d2b-area-point-foreground')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r',7);
	};
	$$.pointMouseout = function(){
		d3.select(this)
				.select('.d2b-area-point-foreground')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r',3.5);
	};

	$$.updatePoints = function(graphData, graph, yType){

		$$.foreground.point[yType] = graph.selectAll('g.d2b-'+yType+'-point').data(function(d){return d.values;});

		var newPoint = $$.foreground.point[yType].enter()
			.append('g')
				.attr('class','d2b-'+yType+'-point')
				.attr('transform',function(d){
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d[yType])+')';
				});

		newPoint
			.append('circle')
				.attr('class', 'd2b-area-point-foreground')
				.attr('r', 3.5)

		newPoint
			.append('circle')
				.attr('class', 'd2b-area-point-background')
				.attr('r', 3.5)
				.call($$.events.addElementDispatcher, 'main', 'd2b-area-point-'+yType);

		$$.foreground.point[yType]
			.selectAll('circle')
				.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.style('fill', 'white');

		$$.foreground.point[yType]
				.call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d[yType]);})
				.on('mouseover', $$.pointMouseover)
				.on('mouseout', $$.pointMouseout)
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d[yType])+')';
				});

		$$.foreground.point[yType].exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.attr('r',0)
				.remove();

	};

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
			values = values.concat(graphData.values.map(function(d){return d.y0;}));
		});
		return values;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){
		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path')
					.call($$.events.addElementDispatcher, 'main', 'd2b-area');
			}

			if(graphData.interpolate){
				$$.area.interpolate(graphData.interpolate);
			}else{
				$$.area.interpolate('linear');
			}

			path
				.datum(function(d){return graphData.values;})
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.area);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);

			$$.foreground.point = {};

			$$.updatePoints(graphData, graph, 'y');
			$$.updatePoints(graphData, graph, 'y0');
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
