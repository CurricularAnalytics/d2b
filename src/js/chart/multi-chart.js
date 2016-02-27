/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*multi chart*/
d2b.CHARTS.multiChart = function(){

	var $$ = {};

	//define multiChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH(),
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.generateRequired = true; //using some methods may require the chart to be redrawn

	$$.selection = d3.select('body'); //default selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.currentChartData = {
			};

	$$.current = {chart:{}};
	$$.previous = {chart:null};

	$$.d2bChart;

	$$.events = d2b.UTILS.chartEvents();

	//init event object
	// var on = {
	// 	elementMouseover:function(){},
	// 	elementMouseout:function(){},
	// 	elementClick:function(){}
	// };

	var buttonClick = function(d,i){
		$$.previous.chart = $$.current.chart;
		$$.current.chart = d;
		// for(key in on.elementClick){
		// 	on.elementClick[key].call(this,d,i,'chart-button');
		// }
		// console.log($$.current.chart)
		chart.update();
	};

	var updateButtons = function(){
		$$.selection.buttonsWrapper.buttons.button = $$.selection.buttonsWrapper.buttons.selectAll('li').data($$.currentChartData.charts, function(d){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000)
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});
		$$.selection.buttonsWrapper.buttons.button.enter()
			.append('li')
			.on('click.d2b-click', buttonClick);

		$$.selection.buttonsWrapper.buttons.button
			.text(function(d){return d.label;})
			.classed('d2b-selected',function(d){return d == $$.current.chart;});

		$$.selection.buttonsWrapper.buttons.button.exit().remove();

	};

	var setChartProperties = function(options){
		if($$.current.chart.properties){
			for(var key in $$.current.chart.properties){
				if(options && options.skip){
					if(options.skip.indexOf(key) > -1)
						continue;
				}
				if(key == 'data')
					continue;
				if($$.current.chart.properties[key].args)
					$$.d2bChart[key].apply(this, $$.current.chart.properties[key].args);
				else
					$$.d2bChart[key]($$.current.chart.properties[key]);
			}
		}

		// translate the events to the currently drawn chart
		$$.events.translateEvents($$.d2bChart);
	};

	var updateChart = function(){
		if(!$$.selection.chartWrapper.chart){
			$$.selection.chartWrapper.chart = $$.selection.chartWrapper
				.append('div')
					.attr('class','d2b-multi-chart-chart')
					.style('opacity',1);
			// d2b.UTILS.chartAdapter($$.current.chart.type, $$.current.chart);
			$$.d2bChart = $$.current.chart.chart;
			$$.d2bChart
				.data($$.current.chart.properties.data)
				.selection($$.selection.chartWrapper.chart);

			setChartProperties();
		}else if($$.current.chart != $$.previous.chart){
			if($$.current.chart.type == $$.previous.chart.type){
				$$.d2bChart
					.data($$.current.chart.properties.data);

				setChartProperties({'skip': ['controls']});
			}else{
				$$.selection.chartWrapper.chart
					.transition()
						.duration($$.animationDuration)
						.style('opacity',0)
						.remove();

				$$.selection.chartWrapper.chart = $$.selection.chartWrapper
					.append('div')
						.attr('class','d2b-multi-chart-chart')
						.style('opacity',0);

				// d2b.UTILS.chartAdapter($$.current.chart.type, $$.current.chart);
				$$.d2bChart = $$.current.chart.chart;
				$$.d2bChart
					.selection($$.selection.chartWrapper.chart)
					.data((JSON.parse(JSON.stringify($$.current.chart.data)))); //clone data for update

				$$.selection.chartWrapper.chart
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1);

				setChartProperties();
			}
		}

		$$.d2bChart
			// .events($$.events)
			.width($$.innerWidth)
			.height($$.innerHeight)
			.update();

		$$.previous.chart = $$.current.chart;
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		var useDefault = true;

		if($$.current.chart.key){
			var matchingChart = chartData.data.charts.filter(function(d){
					return $$.current.chart.key == d.key;
				})[0];
			if(matchingChart){
				useDefault = false;
				$$.current.chart = matchingChart;
			}
		}

		if(useDefault)
			$$.current.chart = chartData.data.charts[0];

		$$.currentChartData = chartData.data;

		$$.currentChartData.charts.forEach(function(d){
			d.chart = new d2b.CHARTS[d.type]();
		});

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		// $$.selection
		// 	.style('width',width + 'px')
		// 	.style('height',height + 'px');

		//create button container
		$$.selection.buttonsWrapper = $$.selection
			.append('div')
				.attr('class','d2b-multi-chart-buttons-wrapper');

		$$.selection.buttonsWrapper.buttons = $$.selection.buttonsWrapper
			.append('ul')
				.attr('class','d2b-buttons');

		// $$.selection.style('position','relative');
		$$.selection.chartWrapper = $$.selection
			.append('div')
				.attr('class','d2b-multi-chart d2b-container');

		// $$.currentChartData.charts.forEach(function(d){
		// 	d.chart.selection($$.selection.chartWrapper);
		// });

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		$$.innerWidth = $$.width;
		$$.innerHeight = $$.height - 50;

		$$.selection.chartWrapper
			.style('width',$$.innerWidth + 'px')
			.style('height',$$.innerHeight + 'px');

		updateButtons();

		updateChart();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
