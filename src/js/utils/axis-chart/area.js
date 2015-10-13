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

	$$.x = d3.scale.linear();
	$$.y = d3.scale.linear();

	$$.area = d3.svg.area()
    .x(function(d) { return $$.x(d.x); })
    .y1(function(d) { return $$.y(d.yComputed + d.y0Computed); })
    .y0(function(d) {	return $$.y(d.y0Computed); });

	$$.point = d2b.SVG.point()
		.size(40)
		.active(true)
		.fill('white');

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
	};

	$$.initYComputed = function(data){
		data.forEach(function(d){
			d.values.forEach(function(value){
				value.y0Computed = 0;
				value.yComputed = value.y;
			});
		});
	};

	$$.tooltipSVG = d2b.SVG.tooltip();

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

	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG =					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	chart.offset =	 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'offset');

	$$.updatePoints = function(graphData, graph){

		$$.foreground.point = graph.selectAll('g.d2b-point').data(function(d){return d.values;});

		var newPoint = $$.foreground.point.enter()
			.append('g')
				.attr('class','d2b-point')
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.yComputed + d.y0Computed)+')';
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-area-point');

		$$.point
			.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; })
			.stroke(d2b.UTILS.getColor($$.color, 'label', [graphData]));
		$$.foreground.point
			.call($$.point);

		$$.foreground.point
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return d.x;},
						y:function(d){return d.yComputed + d.y0Computed;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				)
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.yComputed + d.y0Computed)+')';
				})

		$$.foreground.point.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.attr('r',0)
				.remove();

	};



	$$.stack = function(data){
		if($$.controlsData.stackAreas.enabled){
			d3.layout.stack()
				.out(function(d, y0, y){
					d.y0Computed = y0;
					d.yComputed = y;
				})
				.offset($$.offset || $$.controlsData.stackAreas.offset || "zero")
		    .values(function(d) { return d.values; })
				(data);
		}else{
			$$.initYComputed(data);
		}
	};

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		$$.stack($$.currentChartData);

		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.yComputed + d.y0Computed;}));
			values = values.concat(graphData.values.map(function(d){return d.y0Computed;}));
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
		$$.clonedChartData = JSON.parse(JSON.stringify($$.currentChartData));

		$$.stack($$.currentChartData);

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path')
					.call($$.events.addElementDispatcher, 'main', 'd2b-area');
			}

			$$.area
				.interpolate(graphData.interpolate || 'linear')
				.tension(graphData.tension || 0);

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
			$$.updatePoints(graphData, graph);
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.TYPES.area.tools = function(){
  return {
    controlsData:{
      stackAreas: {
        label: "Stack Areas",
        type: "checkbox",
        visible: false,
        enabled: false
      }
    }
  }
};
