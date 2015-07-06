/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-grid-marker*/
d2b.UTILS.AXISCHART.TYPES.gridMarker = function(){

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

	$$.setLine = function(elem, orient, graphData){
		var x = 'x',y = 'y';

		if(orient == 'horizontal'){x = 'y';y = 'x'};

		var range = $$[y].scale.range();

		elem
			.attr(y+'1', range[0])
			.attr(y+'2', range[1])
			.attr(x+'1', function(d){return $$[x].customScale(d[x]);})
			.attr(x+'2', function(d){return $$[x].customScale(d[x]);})
			.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));
	};

	$$.centerMouseover = function(){
		d3.select(this).select('.d2b-grid-marker-circle.background')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r', 7);
	};

	$$.centerMouseout = function(){
		d3.select(this).select('.d2b-grid-marker-circle.background')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r', 3.5);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
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

	//if you need additional chart-type properties, those can go here..

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(d){
			if(d.values){
				d.values.forEach(function(d2){
					values.push(d2.x);
				})
			}else
				values.push(d.x);
		});
		return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(d){
			if(d.values){
				d.values.forEach(function(d2){
					values.push(d2.y);
				})
			}else
				values.push(d.y);
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
		$$.background.each(function(graphData){
			var graph = d3.select(this);
		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);

			var data = graphData.values || [graphData];

			var group = graph.selectAll('g.d2b-grid-marker').data(data);

			//enter group and all components

			var newGroup = group.enter()
				.append('g')
					.attr('class', 'd2b-grid-marker');

			newGroup
				.append('line')
					.attr('class', 'd2b-grid-marker-horizontal d2b-grid-marker-line')
					.call($$.setLine, 'horizontal', graphData);

			newGroup
				.append('line')
					.attr('class', 'd2b-grid-marker-vertical d2b-grid-marker-line')
					.call($$.setLine, 'vertical', graphData);

			var newGroupCenter = newGroup
				.append('g')
					.attr('class','d2b-grid-marker-center')
					.on('mouseover.d2b-mouseover', $$.centerMouseover)
					.on('mouseout.d2b-mouseout', $$.centerMouseout)
					.attr('transform', function(d){return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';})
					.call($$.events.addElementDispatcher, 'main', 'd2b-grid-marker');

			newGroupCenter
				.append('text')
					.attr('class', 'd2b-grid-marker-label')
					.attr('y', -5);

			newGroupCenter
				.append('text')
					.attr('class', 'd2b-grid-marker-coordinates')
					.attr('y', 14);

			newGroupCenter
				.append('circle')
					.attr('r', '3.5px')
					.attr('class', 'd2b-grid-marker-circle background');

			newGroupCenter
				.append('circle')
					.attr('r', '3.5px')
					.attr('class', 'd2b-grid-marker-circle');

			//update group and all components

			group.select('.d2b-grid-marker-horizontal')
					.classed('d2b-dashed', function(d){return (d.dashed);})
				.transition()
					.duration($$.animationDuration)
					.call($$.setLine, 'horizontal', graphData);

			group.select('.d2b-grid-marker-vertical')
					.classed('d2b-dashed', function(d){return (d.dashed)})
				.transition()
					.duration($$.animationDuration)
					.call($$.setLine, 'vertical', graphData);

			var groupCenter = group.select('g.d2b-grid-marker-center')
				.call(d2b.UTILS.tooltip, function(d){return '<b>'+d.label+'</b>';},function(d){return $$.yFormat(d.y);});

			groupCenter.transition()
				.duration($$.animationDuration)
					.attr('transform', function(d){return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';});

			groupCenter.select('.d2b-grid-marker-label')
					.text(function(d){return d.label;});

			var coordinates = groupCenter.select('.d2b-grid-marker-coordinates')
					.style('opacity',function(d){return (d.hideCoordinates)? 0 : 1;})
					.text(function(d){return "("+$$.xFormat(d.x)+","+$$.yFormat(d.y)+")";});

			// coordinates.selectAll('*').remove();
			// coordinates.append('tspan').style('font-size','16px').text("(");
			// coordinates.append('tspan').text(function(d){return $$.xFormat(d.x);});
			// coordinates.append('tspan').style('font-size','16px').text(",");
			// coordinates.append('tspan').text(function(d){return $$.yFormat(d.y);});
			// coordinates.append('tspan').style('font-size','16px').text(")");

			groupCenter.each(function(d){
				if($$.x.customScale(d.x) > $$.width/2){
					d3.select(this).selectAll('text').attr('x', -5).style('text-anchor','end');
				}else{
					d3.select(this).selectAll('text').attr('x', 5).style('text-anchor','start');
				}
			});

			groupCenter.selectAll('.d2b-grid-marker-circle')
				.transition()
					.duration($$.animationDuration)
					.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));

			//exit group

			group.exit()
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
