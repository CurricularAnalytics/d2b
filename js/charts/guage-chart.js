/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*guage chart*/
AD.CHARTS.guageChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = AD.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = AD.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = AD.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = AD.CONSTANTS.DEFAULTEVENTS();


	$$.arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius(0)
    .startAngle(function(d, i){return d.start;})
    .endAngle(function(d, i){return d.end;});

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							AD.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;


		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','ad-template-chart ad-svg ad-container');

	  //create group container
	  $$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','ad-guage-chart');

		$$.selection.arcs = $$.selection.main.append('g');


		$$.selection.arcHeader = $$.selection.main
			.append('text')
				.attr('class','ad-guage-arc-header');

		$$.selection.arcLabels = $$.selection.main
			.append('g')
						.attr('class','ad-guage-arc-labels');

		$$.selection.arcLabels.start = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('0%');
		$$.selection.arcLabels.end = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('100%');
		$$.selection.arcLabels.percent = $$.selection.arcLabels
			.append('text')
				.attr('class', 'ad-guage-arc-percent')
				.text('0%');

		// $$.selection.arcs.filled = $$.selection.arcs.append('path');
		// $$.selection.arcs.empty = $$.selection.arcs.append('path');

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		AD.UTILS.CHARTS.HELPERS.updateDimensions($$);



		var radius = {
					current:{outer:Math.min($$.outerHeight * 2 - 160, $$.outerWidth)/2},
					previous:{inner:$$.arc.innerRadius(),outer:$$.arc.outerRadius()}
				};
		radius.current.inner = 0.8 * radius.current.outer;

		$$.arc
			.innerRadius(radius.current.inner)
			.outerRadius(radius.current.outer);

		var data = [];
		var percent = 0;
		if($$.currentChartData.percent){
			percent = $$.currentChartData.percent;
			data = [
				{start: -Math.PI/2, end:Math.PI*$$.currentChartData.percent-Math.PI/2, color: 'rgb(193,0,55)'},
				{start: Math.PI*$$.currentChartData.percent-Math.PI/2, end:Math.PI/2, color: '#ddd'}
			]
		}else if($$.currentChartData.value && $$.currentChartData.total){
			percent = $$.currentChartData.value/$$.currentChartData.total;
			data = [
				{start: -Math.PI/2, end:Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2, color: 'rgb(193,0,55)'},
				{start: Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2, end:Math.PI/2, color: '#ddd'}
			]
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll('g').data(data);

		$$.selection.arcs.arc.enter()
			.append('g')
			.append('path')
				.attr('d', $$.arc)
				.style('fill', function(d){return d.color;})
				.each(function(d){
					this._current = {start:d.start, end:d.end};
					this._radiusCurrent = {inner:radius.current.inner, outer:radius.current.outer};
				});

		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
			.transition()
				.duration($$.animationDuration)
				.attrTween('d', function(d){
					var _self = this;
					var i = d3.interpolate(_self._current, {start: d.start, end: d.end});
					var r = d3.interpolate(_self._radiusCurrent, {inner:radius.current.inner, outer:radius.current.outer});
					return function(t) {
						_self._current = i(t);
						_self._currentRadius = r(t);
						$$.arc
							.innerRadius(_self._currentRadius.inner)
							.outerRadius(_self._currentRadius.outer);
						return $$.arc(_self._current);
					};
				})
				.style('fill', function(d){return d.color;})
				.attr('class', 'ad-arc');

		// $$.selection.main
			// .transition()
			// 	.duration($$.animationDuration)
	    //   .attr('transform','translate('+$$.outerWidth+','+$$.outerHeight+')');


		$$.selection.arcs
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-40)+')');

		$$.selection.arcLabels
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-40)+')');

		$$.selection.arcLabels.percent
			.transition()
				.duration($$.animationDuration)
				.tween("text", function(d) {
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, percent);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.attr('font-size', radius.current.inner * 0.5 + 'px');

		$$.selection.arcLabels.start
			.transition()
				.duration($$.animationDuration)
				.attr('x', -(radius.current.outer - (radius.current.outer-radius.current.inner)/2));
		$$.selection.arcLabels.end
			.transition()
				.duration($$.animationDuration)
				.attr('x', (radius.current.outer - (radius.current.outer-radius.current.inner)/2));


		$$.selection.arcHeader
				.text($$.currentChartData.label)
			.transition()
				.duration($$.animationDuration)
				.attr('x',$$.outerWidth/2)
				.attr('y',20);


		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
