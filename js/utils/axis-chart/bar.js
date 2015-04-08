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
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

  $$.groupScale = d3.scale.ordinal();

  $$.updateStackedVals = function(yVal, bar){
    if(bar.sHeight < 0){
      yVal+=bar.height;
      return {newValue: yVal, modifier: -bar.height};
    }else{
      yVal-=bar.height;
      return {newValue: yVal, modifier: 0};
    }
  };

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

  chart.xValues = function(){
    var values = [];
    $$.currentChartData.forEach(function(d){
      values = values.concat(d.values.map(function(v){return v.x;}));
    });
    return values;
  };

  chart.yValues = function(){
    var stackedValues = {};
    var values = [0];

    if($$.controlsData.stackBars.enabled){
      $$.currentChartData.forEach(function(d){
        d.values.forEach(function(v){
          if(!stackedValues[v.x]){
            stackedValues[v.x] = {positive:0, negative:0};
          }
          if(v.y > 0){
            stackedValues[v.x].positive += v.y;
          }else{
            stackedValues[v.x].negative += v.y;
          }
        });
      });
      for(var x in stackedValues){
        values.push(stackedValues[x].negative);
        values.push(stackedValues[x].positive);
      }
    }else{
      $$.currentChartData.forEach(function(d){
        values = values.concat(d.values.map(function(v){return v.y;}));
      });
    }

    return values;
  };

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

    var barLabels = $$.currentChartData.map(function(d){return d.label;});
    $$.groupScale
      .domain(barLabels)
      .rangeBands([0, $$.x.rangeBand]);
    var stackedYVals = {};

		$$.background.each(function(graphData){
			var graph = d3.select(this);

      var bar = graph.selectAll('rect').data(graphData.values, function(d,i){
        return d.x;
      });
      var newBar = bar.enter()
        .append('rect')
        .style('fill', $$.color(graphData.label))
        .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d.y);})
				.call(d2b.UTILS.bindElementEvents, $$, 'bar');

      if($$.controlsData.stackBars.enabled){
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2})
            .attr('y', function(d){
              if(!stackedYVals[d.x]){
                stackedYVals[d.x] = {negative:$$.y.customScale(0), positive:$$.y.customScale(0)};
              }

              var updateScheme;
              if(d.y < 0){
                updateScheme = $$.updateStackedVals(stackedYVals[d.x].negative, $$.y.customBarScale(d.y));
                stackedYVals[d.x].negative = updateScheme.newValue;
                return stackedYVals[d.x].negative + updateScheme.modifier;
              }else{
                updateScheme = $$.updateStackedVals(stackedYVals[d.x].positive, $$.y.customBarScale(d.y));
                stackedYVals[d.x].positive = updateScheme.newValue;
                return stackedYVals[d.x].positive + updateScheme.modifier;
              }

            })
            .attr('width',function(d){return Math.max(0, $$.x.rangeBand);})
            .attr('height', function(d){return $$.y.customBarScale(d.y).height;});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }else{
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

				var spacing = Math.min(1,($$.groupScale.rangeBand()*0.1));

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2 + $$.groupScale(graphData.label)+spacing;})
            .attr('width',function(d){return Math.max(0, $$.groupScale.rangeBand() - 2*spacing);})
            .attr('y', function(d){return $$.y.customBarScale(d.y).y;})
            .attr('height', function(d){return $$.y.customBarScale(d.y).height;});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }



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
