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

	$$.centerMouseover = function(){
		d3.select(this).select('.d2b-grid-marker-circle.d2b-background')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r', 7);
	};

	$$.centerMouseout = function(){
		d3.select(this).select('.d2b-grid-marker-circle.d2b-background')
			.transition()
				.duration($$.animationDuration/2)
				.attr('r', 3.5);
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
				.attr('x', -5)
				.attr('y', 12);

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
				.attr('x', -5)
				.attr('y', 12);

		var newGroupCenter = elem
			.append('g')
				.attr('class','d2b-grid-marker-center')
				.on('mouseover.d2b-mouseover', $$.centerMouseover)
				.on('mouseout.d2b-mouseout', $$.centerMouseout)
				.call($$.updateCenter, graphData, false)
				.call($$.events.addElementDispatcher, 'main', 'd2b-grid-marker');

		newGroupCenter
			.append('circle')
				.attr('r', '3.5px')
				.attr('class', 'd2b-grid-marker-circle d2b-background');

		newGroupCenter
			.append('circle')
				.attr('r', '3.5px')
				.attr('class', 'd2b-grid-marker-circle d2b-foreground');

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
			var elemTransition = d3.select(this);
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

				if(d.x != null && d.y != null){
					if($$.x.customScale(d.x) > $$.width/2){
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')');

						textTransition
							.style('text-anchor','end')
							.attr('x', -5)
							.attr('y', -5);
					}else{;
						elemTransition
							.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')');

						textTransition
							.style('text-anchor','start')
							.attr('x', 5)
							.attr('y', -5);
					}
				}else if(d.y != null){
					elemTransition
						.attr('transform', 'translate('+$$.x.scale.range()[1]+','+$$.y.customScale(d.y)+')');

					textTransition
						.style('text-anchor', 'end')
						.attr('x', -5)
						.attr('y', -5);
				}else{
					elemTransition
						.attr('transform', 'translate('+$$.x.customScale(d.x)+','+$$.y.scale.range()[1]+')');

					textTransition
						.style('text-anchor', 'end')
						.attr('x', -5)
						.attr('y', -5)
						.attr('transform', 'rotate(-90)');
				}
			});


	};

	$$.updateCenter = function(elem, graphData, transition){
		if(transition)
			elem = elem.transition().duration($$.animationDuration);

		elem.each(function(d){
			if(d.y != null && d.x != null){
				elem
						.style('opacity', 1)
						.attr('transform', function(d){return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';})
					.selectAll('.d2b-grid-marker-circle')
						.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));
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

	//if you need additional chart-type properties, those can go here..

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
				if(d2.x)
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
				if(d2.y)
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
				// .call(d2b.UTILS.tooltip, function(d){return '<b>'+d.label+'</b>';},function(d){return '';});//$$.yFormat(d.y);});

			var groupCenter = group.select('g.d2b-grid-marker-center')
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
