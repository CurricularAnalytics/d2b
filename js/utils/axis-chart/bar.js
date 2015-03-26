/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bar*/
AD.UTILS.AXISCHART.TYPES.bar = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = AD.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = AD.CONSTANTS.DEFAULTEVENTS();

  $$.groupScale = d3.scale.ordinal();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 						  AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');

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
    var stackedYVals = {'1':0,'2':0,'3':0};

		$$.background.each(function(graphData){
			var graph = d3.select(this);

      var bar = graph.selectAll('rect').data(graphData.values, function(d,i){
        return d.x;
      });

      var newBar = bar.enter()
        .append('rect')
        .style('fill', $$.color(graphData.label));


      if($$.controlsData.stackBars.enabled){
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2})
            .attr('y',function(d){
              if(!stackedYVals[d.x])
                stackedYVals[d.x] = 0;

              stackedYVals[d.x] += $$.y.customScale(d.y, true);
              return $$.y.customScale(0) - stackedYVals[d.x];
            })
            .attr('width',function(d){return Math.max(0, $$.x.rangeBand);})
            .attr('height',function(d){return Math.max(0, $$.y.customScale(d.y, true));});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }else{
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2 + $$.groupScale(graphData.label)+1;})
            .attr('y',function(d){return $$.y.customScale(0) - $$.y.customScale(d.y, true);})
            .attr('width',function(d){return Math.max(0, $$.groupScale.rangeBand()-2);})
            .attr('height',function(d){return Math.max(0, $$.y.customScale(d.y, true));});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }



		});

		// $$.foreground.each(function(graphData){
		// 	var graph = d3.select(this);
		// });

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

AD.UTILS.AXISCHART.TYPES.bar.tools = function(){
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
}
