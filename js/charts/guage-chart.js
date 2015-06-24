/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*guage chart*/
d2b.CHARTS.guageChart = function(){

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

	$$.arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius(0)
    .startAngle(function(d, i){return d.start;})
    .endAngle(function(d, i){return d.end;});

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
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-guage-chart');

		$$.selection.arcs = $$.selection.main.append('g');


		$$.selection.arcHeader = $$.selection.main
			.append('text')
				.attr('class','d2b-guage-arc-header');

		$$.selection.arcLabels = $$.selection.main
			.append('g')
						.attr('class','d2b-guage-arc-labels');

		$$.selection.arcLabels.start = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('0%');
		$$.selection.arcLabels.end = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('100%');
		$$.selection.arcLabels.percent = $$.selection.arcLabels
			.append('text')
				.attr('class', 'd2b-guage-arc-percent')
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
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		var radius = {
					current:{
										outer:($$.currentChartData.label)?
											Math.min($$.outerHeight * 2 - 80, $$.outerWidth)/2 :
											Math.min($$.outerHeight * 2, $$.outerWidth)/2
									},
					previous:{inner:$$.arc.innerRadius(),outer:$$.arc.outerRadius()}
				};
		radius.current.inner = 0.8 * radius.current.outer;

		$$.arc
			.innerRadius(radius.current.inner)
			.outerRadius(radius.current.outer);

		//Set the data for the filled and empty arcs either by:
		//	-using the user supplied percent
		//	-calculating the percent with the value and total amounts
		//	-defaulting the percent to 0
		var data = [];
		var percent = 0;
		if($$.currentChartData.percent){
			percent = $$.currentChartData.percent;
			data = [
				{
					percent: percent,
					start: -Math.PI/2,
					end:Math.PI*$$.currentChartData.percent-Math.PI/2,
					color: d2b.UTILS.getColor($$.color, 'label')($$.currentChartData),
					filled:true
				},
				{
					percent: percent,
					start: Math.PI*$$.currentChartData.percent-Math.PI/2,
					end:Math.PI/2,
					color: '#ddd',
					filled:false
				}
			];
		}else if($$.currentChartData.value && $$.currentChartData.total){
			percent = $$.currentChartData.value/$$.currentChartData.total;
			data = [
				{
					percent: percent,
					start: -Math.PI/2,
					end:Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2,
					color: d2b.UTILS.getColor($$.color, 'label')($$.currentChartData),
					filled:true
				},
				{
					percent: percent,
					start: Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2,
					end:Math.PI/2, color: '#ddd', filled:false
				}
			];
		}else{
			percent = 0;
			data = [
				{
					percent: percent,
					start:-Math.PI/2,
					end:-Math.PI/2,
					color: d2b.UTILS.getColor($$.color, 'label')($$.currentChartData),
					filled:true
				},
				{
					percent: percent,
					start:-Math.PI/2,
					end:Math.PI/2,
					color:"#ddd",
					filled : false
				}
			];
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll('g').data(data);

		var newArc = $$.selection.arcs.arc.enter()
			.append('g')
		newArc
			.append('path')
				.attr('d', $$.arc)
				.style('fill', function(d){return d.color;})
				.each(function(d){
					this._current = {start:d.start, end:d.end};
					this._radiusCurrent = {inner:radius.current.inner, outer:radius.current.outer};
				})
		newArc.filter(function(d){return d.filled;})
				.on('mouseover.d2b-mouseover',function(d,i){
					var arc = d3.select(this);
					arc
						.transition()
							.duration($$.animationDuration/4)
							.attr('transform','scale(1.05)');
					d2b.UTILS.createGeneralTooltip(arc,'<b>'+$$.currentChartData.label+'</b>',$$.percentFormat( 100*d.percent ));
				})
				.on('mouseout.d2b-mouseout',function(d,i){
					var arc = d3.select(this);
					arc
						.transition()
							.duration($$.animationDuration/4)
							.attr('transform','scale(1)');
					d2b.UTILS.removeTooltip();
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-arc');

		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
			.transition()
				.duration($$.animationDuration)
				.attrTween('d', function(d){
					var _self = this;
					var i = d3.interpolate(_self._current, {start: d.start, end: d.end});
					var r = d3.interpolate(_self._radiusCurrent, {inner:radius.current.inner, outer:radius.current.outer});
					return function(t) {
						_self._current = i(t);
						_self._radiusCurrent = r(t);
						$$.arc
							.innerRadius(_self._radiusCurrent.inner)
							.outerRadius(_self._radiusCurrent.outer);
						return $$.arc(_self._current);
					};
				})
				.style('fill', function(d){return d.color;})
				.attr('class', 'd2b-arc');

		// $$.selection.main
			// .transition()
			// 	.duration($$.animationDuration)
	    //   .attr('transform','translate('+$$.outerWidth+','+$$.outerHeight+')');


		$$.selection.arcs
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-10)+')');

		$$.selection.arcLabels
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-10)+')');

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

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
