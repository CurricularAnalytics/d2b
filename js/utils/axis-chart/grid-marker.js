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

	$$.labelOffset = 3;

	$$.symbol = d2b.UTILS.symbol();

	$$.tooltip = function(d){
		var tooltip = d.graph.label;
		if(d.data.label && d.graph.label.toLowerCase() != d.data.label.toLowerCase())
			tooltip += " - "+d.data.label;

		tooltip = "<u><b>"+tooltip+"</b></u>";

		if( (d.line != 'y') && d.data.x != null )
			tooltip += "<br /><b>x: </b>"+$$.xFormat(d.data.x);

		if( (d.line != 'x') && d.data.y != null )
			tooltip += "<br /><b>y: </b>"+$$.xFormat(d.data.y);

		return tooltip
	};

	$$.newGroup = function(elem, graphData){
		var newXMarker = elem
			.append('g')
				.attr('class','d2b-grid-marker-x')
				.call($$.updateMarkers, graphData, 'x', false);

		newXMarker
			.append('line')
				.attr('class','d2b-grid-marker-line');
		newXMarker
			.append('text')
				.attr('class','d2b-grid-marker-coordinate')
				.attr('transform','rotate(-90)')
				.attr('y', 7+$$.labelOffset);

		var newYMarker = elem
			.append('g')
				.attr('class','d2b-grid-marker-y')
				.call($$.updateMarkers, graphData, 'y', false);

		newYMarker
			.append('line')
				.attr('class','d2b-grid-marker-line');
		newYMarker
			.append('text')
				.attr('class','d2b-grid-marker-coordinate')
				.attr('y', 7+$$.labelOffset);

		var newGroupCenter = elem
			.append('g')
				.attr('class','d2b-grid-marker-center')
				.call($$.updateCenter, graphData, false)
				.call($$.events.addElementDispatcher, 'main', 'd2b-grid-marker')
				.call(d2b.UTILS.CHARTS.HELPERS.symbolEnter)
				.call(d2b.UTILS.CHARTS.HELPERS.symbolEvents);

		elem
			.append('g')
				.attr('class', 'd2b-grid-marker-label')
				.call($$.updateLabel, graphData, false)
			.append('text');

	};

	$$.updateMarker = {};
	$$.updateMarker.x = function(elem, range, graphData){
		elem
				.style('opacity',1)
				.attr('transform', function(d){
					return 'translate('+$$.x.customScale(d.x)+',0)';
				})
			.select('line')
				.attr('x1', 0)
				.attr('x2', 0)
				.attr('y1', range[0])
				.attr('y2', range[1])
				.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));

		elem
			.select('.d2b-grid-marker-coordinate')
				.attr('x', function(d){return (d.invert)? -range[0]+$$.labelOffset : -$$.labelOffset;});
	};
	$$.updateMarker.y = function(elem, range, graphData){
		elem
				.style('opacity',1)
				.attr('transform', function(d){
					return 'translate('+range[1]+','+$$.y.customScale(d.y)+')';
				})
			.select('line')
				.attr('x1', range[0])
				.attr('x2', -range[1])
				.attr('y1', 0)
				.attr('y2', 0)
				.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));

		elem
			.select('.d2b-grid-marker-coordinate')
				.attr('x', function(d){return (d.invert)? -range[1]+$$.labelOffset : -$$.labelOffset;});
	};

	$$.updateMarkers = function(elem, graphData, orient, transition){
		var x = 'x', y = 'y';
		if(orient == 'y'){
			x = 'y';
			y = 'x';
		}

		var range = $$[y].scale.range();

		//position marker grouping if transition flag is set transition to new position/opacity
		elem.each(function(d){
			var elemTransition = d3.select(this)
				.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return {line:x, data:d, graph:graphData};});
			if(transition)
				elemTransition = elemTransition.transition().duration($$.animationDuration);

			if(d[x]){
				elemTransition
					.call($$.updateMarker[x], range, graphData)
			}else{
				elemTransition
					.style('opacity',0)
			}
		});

		//set line attributes
		elem.select('line')
			.classed('d2b-dashed', function(d){return (d.dashed);});

		elem.select('text.d2b-grid-marker-coordinate')
			.classed('d2b-inverted', function(d){return d.invert;})
			.text(function(d){return $$[x+'Format'](d[x]);});
	};

	$$.updateLabel = function(elem, graphData, transition){
		this
			.each(function(d){
				var elemTransition = d3.select(this);
				var textTransition = elemTransition.select('text');

				if(transition){
					elemTransition = elemTransition.transition().duration($$.animationDuration);
					textTransition = textTransition.transition().duration($$.animationDuration);
				}

				textTransition
					.text(function(d){return d.label;})
					.attr('y', -$$.labelOffset)
					.attr('transform', 'rotate(0)');

				if(d.x != null && d.y != null){
					if($$.x.customScale(d.x) > $$.width/2){
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')');

						textTransition
							.style('text-anchor','end')
							.attr('x', $$.labelOffset);
					}else{;
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')');

						textTransition
							.style('text-anchor','start')
							.attr('x', $$.labelOffset);
					}
				}else if(d.y != null){
					if(d.invert){
						elemTransition
							.attr('transform', 'translate('+$$.x.scale.range()[0]+','+$$.y.customScale(d.y)+')');
						textTransition
							.style('text-anchor', 'start')
							.attr('x', $$.labelOffset);
					}else{
						elemTransition
							.attr('transform', 'translate('+$$.x.scale.range()[1]+','+$$.y.customScale(d.y)+')');
						textTransition
							.style('text-anchor', 'end')
							.attr('x', -$$.labelOffset);
					}

				}else{
					if(d.invert){
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.scale.range()[0]+')');
						textTransition
							.style('text-anchor', 'start')
							.attr('x', $$.labelOffset)
							.attr('transform', 'rotate(-90)');
					}else{
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.scale.range()[1]+')');
						textTransition
							.style('text-anchor', 'end')
							.attr('x', -$$.labelOffset)
							.attr('transform', 'rotate(-90)');
					}
				}
			});


	};

	$$.updateCenter = function(elem, graphData, transition){

		elem.each(function(d){

			d.symbolType = d.symbol || graphData.symbol || 'circle';

			var elem = d3.select(this);

			if(transition)
				elem = elem.transition().duration($$.animationDuration);

			if(d.y != null && d.x != null){
				elem
						.style('opacity', 1)
						.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')')
						.call(d2b.UTILS.CHARTS.HELPERS.symbolUpdate, d2b.UTILS.getColor($$.color, 'label', [graphData]), '');

			}else{
				elem.style('opacity',0);
			}
		})

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
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(d){
			if(d.values){
				d.values.forEach(function(d2){
					if(d2.x)
						values.push(d2.x);
				})
			}else
				if(d.x)
					values.push(d.x);
		});
		return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(d){
			if(d.values){
				d.values.forEach(function(d2){
					if(d2.y)
						values.push(d2.y);
				})
			}else
				if(d.y)
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

			//enter group and all components with transitions

			var newGroup = group.enter()
				.append('g')
					.attr('class', 'd2b-grid-marker')
					.call($$.newGroup, graphData);

			group.select('g.d2b-grid-marker-x')
				.call($$.updateMarkers, graphData, 'x', true);

			group.select('g.d2b-grid-marker-y')
				.call($$.updateMarkers, graphData, 'y', true);

			group.select('g.d2b-grid-marker-label')
				.call($$.updateLabel, graphData, 'y', true)
				.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return {data:d, graph:graphData};})
				// .call(d2b.UTILS.tooltip, function(d){return '<b>'+d.label+'</b>';},function(d){return '';});//$$.yFormat(d.y);});

			var groupCenter = group.select('g.d2b-grid-marker-center')
				.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return {data:d, graph:graphData};})
				// .call(d2b.UTILS.tooltip, function(d){return '<b>'+d.label+'</b>';},function(d){return '';});//$$.yFormat(d.y);});

			groupCenter
				.call($$.updateCenter, graphData, true);

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
