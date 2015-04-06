/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-line*/
d3b.UTILS.AXISCHART.TYPES.line = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d3b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d3b.CONSTANTS.DEFAULTEVENTS();

	$$.line = d3.svg.line()
    .x(function(d) { return $$.x.customScale(d.x); })
    .y(function(d) { return $$.y.customScale(d.y); });

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d3b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');

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
			if(path.size() == 0){
				path = graph.append('path')
					.call(d3b.UTILS.bindElementEvents, $$, 'line');
			}

			if(graphData.interpolate){
				$$.line.interpolate(graphData.interpolate);
			}else{
				$$.line.interpolate('linear');
			}

			path
					.style('stroke', function(d){return $$.color(graphData.label);})
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
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';
				});

			newPoint
				.append('circle')
					.attr('r', 3.5);

			newPoint
				.append('circle')
					.attr('r', 3.5)
					.on('mouseover.d3b-mouseover',function(){
						d3.select(this)
							.transition()
								.duration($$.animationDuration/2)
								.attr('r',7)
					})
					.on('mouseout.d3b-mouseover',function(){
						d3.select(this)
							.transition()
								.duration($$.animationDuration/2)
								.attr('r',3.5)
					})
					.style('fill-opacity',0)
					.call(d3b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d.y);})
					.call(d3b.UTILS.bindElementEvents, $$, 'line-point');


			point
				.selectAll('circle')
					.style('stroke', $$.color(graphData.label))
					.style('fill', 'white');

			point
				.transition()
					.duration($$.animationDuration)
					.attr('transform',function(d){
						return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';
					});

			point.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.attr('r',0)
					.remove();
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
