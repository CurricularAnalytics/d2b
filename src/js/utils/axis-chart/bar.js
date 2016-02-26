/* Copyright � 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bar*/
d2b.UTILS.AXISCHART.TYPES.bar = function(){

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

  $$.groupScale = d3.scale.ordinal();

	$$.padding = "10%";

  $$.updateStackedVals = function(yVal, d){
    if($$.barSignedHeight(d) < 0){
      yVal+=$$.barHeight(d);
      return {newValue: yVal, modifier: -$$.barHeight(d)};
    }else{
      yVal-=$$.barHeight(d);
      return {newValue: yVal, modifier: 0};
    }
  };

	$$.getLinearRangeBand = function(){
		var allXVals = $$.currentChartData.map(function(d){return d.values.map(function(d){return d.x;}).sort()});
		var minDistance = Infinity;
		allXVals.forEach(function(d){
			for(var i=0;i<d.length-1;i++)
				minDistance = Math.min(Math.abs(d[i+1] - d[i]), minDistance);
		});
		return (minDistance==Infinity)? $$.width : $$.x(Math.min.apply(null,$$.x.domain()) + minDistance);
	};

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
	};

	$$.barSignedHeight = function(d){
		var origin, destination;

		origin = $$.y(0);
		destination = $$.y(d.y);

		return origin - destination;
	};
	$$.barHeight = function(d){
		return Math.abs($$.barSignedHeight(d));
	};
	$$.barY = function(d){
		var origin, destination;

		origin = $$.y(0);
		destination = $$.y(d.y);

		return  Math.min(origin, destination);
	};
	$$.buildOut = function(dataSeriesCount) {
    var currentXOffsets = [];
    var current_xIndex = 0;
    return function(d, y0, y){
      if(current_xIndex++ % dataSeriesCount === 0){
        currentXOffsets = [0, 0];
      }
      if(y >= 0) {
        d.y0 = currentXOffsets[1];
        d.y = y;
        currentXOffsets[1] += y;
      } else {
        d.y0 = currentXOffsets[0];
        d.y = y;
        currentXOffsets[0] += y;
      }
    }
	}

	$$.resetY0 = function(){
		$$.currentChartData.forEach(function(d){
			d.values.forEach(function(value){
				value.y0 = 0;
			});
		});
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
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	//additional bar properties
	chart.padding =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'padding');

  chart.xValues = function(){
    var values = [];
    $$.currentChartData.forEach(function(d){
      values = values.concat(d.values.map(function(v){return v.x;}));
    });
    return values;
  };

  chart.yValues = function(){

		if($$.controlsData.stackBars.enabled){
			d3.layout.stack()
		    .values(function(d) { return d.values; })
				.out($$.buildOut($$.currentChartData.length))
				($$.currentChartData);
		}else{
			$$.resetY0();
		}

    var stackedValues = {};
    var values = [0];
// console.log($$.currentChartData)
		$$.currentChartData.forEach(function(d){
	    values = values.concat(d.values.map(function(v){return v.y + v.y0;}));
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

		if($$.controlsData.stackBars.enabled){
			d3.layout.stack()
		    .values(function(d) { return d.values; })
				.out($$.buildOut($$.currentChartData.length))
				($$.currentChartData);
		}else{
			$$.resetY0();
		}

		var rangeBand = $$.x.rangeBand();

		if($$.x.rangeBand() === 0){
			rangeBand = $$.getLinearRangeBand();
		}

		var padding = d2b.UTILS.visualLength($$.padding, rangeBand);

    var barLabels = $$.currentChartData.filter(function(d){return !d.center;}).map(function(d){return d.label;});

    $$.groupScale
      .domain(barLabels)
      .rangeBands([0 + padding, rangeBand - padding]);

		var spacing = $$.groupScale.rangeBand() * 0.01;
    var stackedYVals = {};

		$$.background.each(function(graphData){
			var graph = d3.select(this);

      var bar = graph.selectAll('rect').data(graphData.values, function(d,i){
        return d.x;
      });
      var newBar = bar.enter()
        .append('rect')
				.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.call($$.events.addElementDispatcher, 'main', 'd2b-bar');

			bar.each(function(d){
				var updateScheme;
				d.placement = {};
				if($$.controlsData.stackBars.enabled){
					d.placement.x = $$.x(d.x) - rangeBand/2 + padding;
					if(d.y >= 0){
						d.placement.y = $$.y(d.y + d.y0);
					}else{
						d.placement.y = $$.y(d.y0);
					}
					d.placement.dx = rangeBand - padding*2;
				}else if(d.center || graphData.center){
					d.placement.x = $$.x(d.x) - rangeBand/2 + padding;
					d.placement.y = $$.barY(d);
					d.placement.dx = rangeBand - padding*2;
				}else{
					d.placement.x = $$.x(d.x) - rangeBand/2 + $$.groupScale(graphData.label)+spacing;
					d.placement.y = $$.barY(d);
					d.placement.dx = Math.max(0, $$.groupScale.rangeBand() - 2*spacing);
				}
				d.placement.dy = $$.barHeight(d);
			});


      newBar
          .attr('y',$$.y(0))
          .attr('height',0);

      bar
					.call($$.tooltipSVG.graph,
						{
							key: graphData.label,
							content: $$.tooltip,
							data: function(d){return {data:d, graph:graphData};},
							x:function(d){return $$.x.invert(d.placement.x + d.placement.dx/2);},
							y:function(d){return d.y + d.y0;},
							fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
						}
					)
        .transition()
          .duration($$.animationDuration)
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.attr('x', function(d){return d.placement.x;})
					.attr('y', function(d){return d.placement.y;})
					.attr('width', function(d){return d.placement.dx;})
					.attr('height', function(d){return d.placement.dy;})

		  bar.exit()
		    .transition()
		      .duration($$.animationDuration)
		      .attr('y', $$.y(0))
		      .attr('height',0);

		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.TYPES.bar.tools = function(){
  return {
    controlsData:{
      stackBars: {
        label: "Stack Bars",
        type: "checkbox",
        visible: false,
        enabled: false
      }
    }
  }
};
