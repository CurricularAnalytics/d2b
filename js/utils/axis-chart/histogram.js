/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-histogram*/
AD.UTILS.AXISCHART.TYPES.histogram = function(){

	//private store
	var $$ = {};

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

	$$.hist = d3.layout.histogram();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var data = $$.hist.bins(graphData.bins)(graphData.values);

			// console.log
			var barWidth = 0.92*$$.x.customScale(d3.max(data.map(function(d){return d.x;})) - d3.min(data.map(function(d){return d.x;})))/data.length;

			// var barWidth = ($$.width / data.length)/2;

			graph.selectAll('rect')

			var bar = graph.selectAll('rect').data(data, function(d,i){
				return d.x;
			});

			var newBar = bar.enter()
				.append('rect')
				.style('fill', $$.color(graphData.label))
				.attr('y',$$.y.customScale(0))
				.attr('height',0)
        .on('mouseover.ad-mouseover',function(d,i){
          AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+graphData.label+'</b>',$$.yFormat(d.y));
        })
        .on('mouseout.ad-mouseout',function(d,i){
          AD.UTILS.removeTooltip();
        });

			bar
				.transition()
					.duration($$.animationDuration)
					.attr('x',function(d){return $$.x.customScale(d.x) - barWidth/2;})
					.attr('y',function(d){return $$.y.customScale(0) - $$.y.customScale(d.y, true);})
					.attr('width',function(d){return Math.max(0, barWidth);})
					.attr('height',function(d){return Math.max(0, $$.y.customScale(d.y, true));});

			bar.exit()
				.transition()
					.duration($$.animationDuration)
					.attr('y', $$.y.customScale(0))
					.attr('height',0);

			//

		});

		// $$.foreground.each(function(graphData){
		// 	var graph = d3.select(this);
		// 	//code for the foreground visualization goes here
		// 	//this will iterate through all of the foreground graph containers of this type
		// });

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
