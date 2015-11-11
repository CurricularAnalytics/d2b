/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-heat-point*/
d2b.UTILS.AXISCHART.TYPES.heatPoints = function(){

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

	$$.layout = 'square';
	$$.sortBy = 'name';

	$$.symbol = d2b.SVG.symbol();

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
	};

	$$.key = function(d){
		return d.x+'-'+d.y;
	};

	$$.renderLayout = {};

	$$.renderLayout.square = function(points){

		var direction = 'right';
		var current = {x:0, y:0};
		var moves = 1;
		var move = 0;
		var padding = 1.5;
		var offset = Math.sqrt($$.symbolSize) + padding;

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(i * 10)
					.attr("d", $$.symbol);

			if(i === 0) return elem.attr('transform', 'translate(0,0)');

			switch(direction){
					case 'right':
						current.x += offset;
						move += 1;
						if(move === moves){
							direction = 'up';
							move = 0;
						}
						break;
					case 'up':
						current.y -= offset;
						move += 1;

						if(move === moves){
							direction = 'left';
							moves += 1;
							move = 0;
						}
						break;
					case 'left':
						current.x -= offset;
						move += 1;

						if(move === moves){
							direction = 'down';
							move = 0;
						}
						break;
					case 'down':
						current.y += offset;
						move += 1;

						if(move === moves){
							direction = 'right';
							moves += 1;
							move = 0;
						}
						break;
			}

			elem
					.attr('transform', function(d,i){
						return 'translate('+current.x+','+current.y+')';
					});
		});

	};

	$$.renderLayout.hexagon = function(points){

		var sides = 6;
		var current = {x:0, y:0, side: 0, move: 0, moves: 1};
		var padding = 1.5;

		var l = Math.sqrt($$.symbolSize * 2 / (3 * Math.sqrt(3))) + padding;
		var h = 2 * Math.sin(Math.PI/6) * l + l;
		var w = 2 * Math.cos(Math.PI/6) * l;

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(i * 10)
					.attr("d", $$.symbol);

			if(i === 0) return elem.attr('transform', 'translate(0,0)');

			if(current.move === 0 && current.side === 0) current.x += w;

			switch(current.side){
					case 0:
						current.x -= w / 2;
						current.y += l + (h - l) / 2;
						break;
					case 1:
						current.x -= w;
						break;
					case 2:
						current.x -= w / 2;
						current.y -= l + (h - l) / 2;
						break;
					case 3:
						current.x += w / 2;
						current.y -= l + (h - l) / 2;
						break;
					case 4:
						current.x += w;
						break;
					case 5:
						current.x += w / 2;
						current.y += l + (h - l) / 2;
						break;
			}

			current.move += 1;

			if(current.move === current.moves){
				current.move = 0;
				current.side += 1;
				if(current.side === sides){
					current.side = 0;
					current.moves += 1;
				}
			}

			elem
					.attr('transform', function(d,i){
						return 'translate('+current.x+','+current.y+')';
					});
		});

	};

	$$.renderLayout.circle = function(points){

		var padding = 1.5;

		var r = Math.sqrt($$.symbolSize / Math.PI) + padding/2;
		var d = 2 * r;

		var current = {moves: 0, move: 0, r: 0};
		var moves = 1;
		var move = 0;

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(i * 10)
					.attr("d", $$.symbol);

			if(i === 0) return elem.attr('transform', 'translate(0,0)');

			if(current.moves <= current.move) {
				current.r += d;
				current.circum = 2 * Math.PI * current.r;
				current.moves = Math.floor(current.circum / d);
				current.theta = 2 * Math.PI / current.moves;
				current.move = 0;
			}

			current.x = Math.cos(current.move * current.theta) * current.r;
			current.y = Math.sin(current.move * current.theta) * current.r;

			elem
					.attr('transform', function(d,i){
						return 'translate('+current.x+','+current.y+')';
					});

			current.move += 1;
		});

	};

	$$.eachPointSet = function(points){
		var sortBy = $$.sortBy.replace('!', '');
		var sorter = d3.ascending;
		if($$.sortBy.indexOf('!') !== -1) sorter = d3.descending;
		points = points.sort(function(a, b){ return sorter(a[sortBy], b[sortBy]); });

		$$.renderLayout[$$.layout](points);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

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
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');
	chart.layout = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'layout');
	chart.sortBy = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'sortBy');
	chart.size =	 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'size');

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.y;}));
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

		var mergedPoints = {};
		var xKeys = {};
		var yKeys = {};
		maxPoints = 0;

		$$.symbol.type($$.layout);

		// var fill = function(d){
		// 	if(d.colorKey !== null && d.colorKey !== undefined){
		// 		return $$.color(d.colorKey);
		// 	} else {
		// 		return $$.color(d.name);
		// 	}
		// };

		$$.background.each(function(graphData, i){

			var graph = d3.select(this);

			var heatPointSet = graph.selectAll('.d2b-heat-point-set').data(graphData.values, $$.key);

			heatPointSet.enter()
				.append('g')
					.attr('class', 'd2b-heat-point-set')
					.attr('transform', function(d){
						return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
					});

			heatPointSet
				.transition()
					.duration($$.animationDuration)
					.attr('transform', function(d){
						return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
					})
					.each(function(d){
						var key = $$.key(d);
						if(mergedPoints[key]){
							mergedPoints[key] = mergedPoints[key].concat(d.points);
						} else {
							mergedPoints[key] = d.points || [];
						}
						xKeys[d.x] = 1;
						yKeys[d.y] = 1;
						maxPoints = Math.max(maxPoints, mergedPoints[key].length);
					});

			heatPointSet.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();

			var heatPoint = heatPointSet.selectAll('.d2b-heat-point')
				.data(function(d){ return d.points; });

			heatPoint.enter()
				.append('path')
					.attr('d', $$.symbol.size(0))
					.attr('class', 'd2b-heat-point');

			heatPoint
					.each(function(d){ d.elem = d3.select( this ); });

			heatPoint.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();

		});

		var space = Math.min(
			$$.width / Object.keys(xKeys).length,
			$$.height / Object.keys(yKeys).length
		);

		if($$.size){
			$$.symbolSize = $$.size;
		}else{
			$$.symbolSize = Math.pow(space / Math.sqrt(maxPoints), 2);
			if($$.layout == 'circle') $$.symbolSize *= 0.3;
			else $$.symbolSize *= 0.5;
		}

		$$.symbol.size($$.symbolSize);

		var key;

		for( key in mergedPoints ){
			if(mergedPoints.hasOwnProperty(key)){
				$$.eachPointSet(mergedPoints[key]);
			}
		}

		$$.background.selectAll(".d2b-heat-point")
				.style('fill', d2b.UTILS.getColor($$.color, 'name'))
				.style('stroke', d2b.UTILS.getColor($$.color, 'name'));

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
