/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*gauge chart*/
d2b.CHARTS.gaugeChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	$$.percentFormat = d2b.UTILS.numberFormat({"precision":2,"units":{"after":'%'}});
	$$.percent = 0;

	$$.arc = d3.svg.arc()
    .startAngle(function(d, i){return d.start;})
    .endAngle(function(d, i){return d.end;})
    .innerRadius(function(d, i){return d.inner;})
    .outerRadius(function(d, i){return d.outer;});

	$$.tooltip = function(d){
		if(d.value != null)
			return "<b>"+d.label+":</b> "+$$.xFormat(d.value)+" ("+d.percent*100+"%)";
		else
			return "<b>"+d.label+":</b> "+d.percent*100+"%";
	};

	$$.getPercent = function(){
		//Set the percent for the gauge either by:
		//	-using the user supplied percent
		//	-calculating the percent with the user supplied value and total amounts
		//	-defaulting the percent to 0
		if($$.currentChartData.percent != null)
			return $$.currentChartData.percent;
		else if($$.currentChartData.value != null && $$.currentChartData.total != null)
			return $$.currentChartData.value / $$.currentChartData.total;
		else
			return 0;
	};

	$$.getData = function(){
		return [
			{
				label: $$.currentChartData.label,
				value: $$.currentChartData.value,
				percent: $$.percent,
				start: -Math.PI/2,
				end: Math.PI * $$.percent - Math.PI/2,
				color: d2b.UTILS.getColor($$.color, 'label')($$.currentChartData),
				filled:true
			},
			{
				percent: $$.percent,
				start: Math.PI * $$.percent - Math.PI/2,
				end: Math.PI/2,
				color: '#ddd',
				filled:false
			}
		]
	};

	$$.setNewArc = function(elem, inner, outer){
		elem.each(function(d){
			this.newArc = {
				start: d.start,
				end: d.end,
				inner: inner,
				outer: outer
			}
		})
	};

	$$.arcMouseover = function(d){
		var arc = d3.select(this).select('path');
		arc
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer * 1.03)
			.transition()
				.duration($$.animationDuration/4)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	$$.arcMouseout = function(d){
		var arc = d3.select(this).select('path');
		arc
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer)
			.transition()
				.duration($$.animationDuration/4)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

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
	      .attr('class','d2b-template-chart d2b-svg d2b-container');

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      // .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-gauge-chart');

		$$.selection.arcs = $$.selection.main.append('g');


		$$.selection.arcHeader = $$.selection.main
			.append('text')
				.attr('class','d2b-gauge-arc-header');

		$$.selection.arcLabels = $$.selection.main
			.append('g')
						.attr('class','d2b-gauge-arc-labels');

		$$.selection.arcLabels.start = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('0%');
		$$.selection.arcLabels.end = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('100%');
		$$.selection.arcLabels.percent = $$.selection.arcLabels
			.append('text')
				.attr('class', 'd2b-gauge-arc-percent')
				.text('0%');

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
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;
		$$.innerWidth = $$.outerWidth - $$.forcedMargin.left - $$.forcedMargin.right;
		$$.innerHeight = $$.outerHeight - $$.forcedMargin.top - $$.forcedMargin.bottom;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		var headerHeight = ($$.currentChartData.label)? 20 : 0;
		var labelHeight = 20;

		$$.radius = {};

		$$.radius.outer = Math.min($$.innerHeight * 2 - headerHeight * 2 - labelHeight * 2, $$.innerWidth)/2;
		$$.radius.inner = 0.8 * $$.radius.outer;

		$$.forcedMargin.top = $$.forcedMargin.top + $$.innerHeight/2  + ($$.radius.outer)/2 - labelHeight/2 + headerHeight/2;
		$$.forcedMargin.left = $$.forcedMargin.left + $$.innerWidth/2;

		$$.selection.group
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.percent = $$.getPercent();

		$$.selection.arcs.arc = $$.selection.arcs.selectAll('g').data($$.getData());

		var newArc = $$.selection.arcs.arc.enter()
			.append('g')
		newArc
			.append('path')
				// .attr('d', $$.arc)
				.style('fill', function(d){return d.color;})

		newArc
			.filter(function(d){return d.filled;})
				.on('mouseover.d2b-mouseover', $$.arcMouseover)
				.on('mouseout.d2b-mouseout', $$.arcMouseout)
				.call($$.events.addElementDispatcher, 'main', 'd2b-arc');

		$$.selection.arcs.arc
			.filter(function(d){return d.filled;})
				.call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return d;});

		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer)
			.transition()
				.duration($$.animationDuration)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				.style('fill', function(d){return d.color;})
				.attr('class', 'd2b-arc');

		$$.selection.arcLabels.percent
			.transition()
				.duration($$.animationDuration)
				.tween("text", function(d) {
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, $$.percent);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.attr('font-size', $$.radius.inner * 0.5 + 'px');

		$$.selection.arcLabels.start
			.transition()
				.duration($$.animationDuration)
				.attr('x', -($$.radius.outer - ($$.radius.outer-$$.radius.inner)/2));
		$$.selection.arcLabels.end
			.transition()
				.duration($$.animationDuration)
				.attr('x', ($$.radius.outer - ($$.radius.outer-$$.radius.inner)/2));


		$$.selection.arcHeader
				.text($$.currentChartData.label)
			.transition()
				.duration($$.animationDuration)
				.attr('y',-$$.radius.outer - 10);


		d3.timer.flush();

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
