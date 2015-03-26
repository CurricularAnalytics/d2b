/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-area*/
AD.UTILS.AXISCHART.area = function(){

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
	// //d3.selection for chart container
	// $$.selection = d3.select('body');
	// $$.foreground =
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

	$$.area = d3.svg.area()
    .x(function(d) { return $$.getPointCenter(d).x; })
    .y1(function(d) { return $$.getPointCenter(d).y; })
    .y0(function(d) { return $$.getPointCenter(d).y0; });

	$$.getPointCenter = function(point){
		var obj = {};
		obj.x = $$.x.customScale(point.x) + $$.x.rangeBand/2;
		obj.y = $$.y.customScale(point.y) + $$.y.rangeBand/2;
		obj.y0 = $$.y.customScale(point.y0) + $$.y.rangeBand/2;
		return obj;
	};

	$$.getGraphColor = function(d){
		var color = '';
		d3.select(this.parentNode).each(function(d){
			color = $$.color(d.label);
		});
		return color;
	};


	$$.updateGraph = function(d){

	};
	// $$.x = d3.scale.linear();
	// $$.y = d3.scale.linear();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	// chart.select = 							AD.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.foreground = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground', function(){ $$.generateRequired = true; });
	chart.background = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background', function(){ $$.generateRequired = true; });
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.orientationMap = 			AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'orientationMap');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.yFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');

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

		chart
			.update(callback)

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path');
			}

			if(graphData.interpolate){
				$$.area.interpolate(graphData.interpolate);
			}else{
				$$.area.interpolate('linear');
			}

			path
					.style('stroke', function(d){return $$.color(graphData.label);})
					.style('fill', function(d){return $$.color(graphData.label);})
				.datum(function(d){return graphData.values;})
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.area);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			var circle = graph.selectAll('circle').data(function(d){return d.values;});

			circle.enter()
				.append('circle')
					.attr('r', '5');
			circle
					.style('fill', $$.color(graphData.label))
				.transition()
					.duration($$.animationDuration)
					.attr('cx',function(d){return $$.getPointCenter(d).x;})
					.attr('cy',function(d){return $$.getPointCenter(d).y;});
			circle.exit()
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
