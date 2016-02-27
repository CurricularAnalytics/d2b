d2b.CHARTS.customSunburst = function(){
	var $$ = {};

	var generateRequired = true;

  var sunburstChart = new d2b.CHARTS.sunburstChart();

  var partition = new d2b.UTILS.LAYOUTS.partition();

  var persistentData = {}

  $$.controlsData = {
    hideLegend:{enabled:false, visible:false}
  }

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						function(d){
    sunburstChart
      .xFormat(d);
  };
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);


	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$, function(){
    sunburstChart
      .controls($$.controlsData);
  });
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation', function(){
    sunburstChart
      .legendOrientation($$.legendOrientation);
  });

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		return chart;
	};

	chart.generate = function(){

		generateRequired = false;

		$$.selection.selectAll('*').remove();
		$$.selection.container = $$.selection.append('div').attr('class','custom-sunburst-container')
		$$.selection.toggles = $$.selection.append('div').attr('class','custom-sunburst-toggles').text('Break Down By:');

    $$.currentChartData.columns.forEach(function(d){
      persistentData[d.label] = d.disabled;
    });

		sunburstChart.selection($$.selection.container);

		chart.update();

		return chart;

	};

	chart.update = function(){

		if(generateRequired){
			return chart.generate();
		}

		sunburstChart
			.data(
        {
          data:{
            partition:partition($$.currentChartData.rows, $$.currentChartData.columns.filter(function(d){return !persistentData[d.label]}), $$.currentChartData.label)
          }
        }
      )
			.width(Math.max(0,$$.width))
			.height($$.height)
			.update();
    var option = $$.selection.toggles.selectAll("div.custom-sunburst-toggle-option").data($$.currentChartData.columns.filter(function(d){return d.toggle;}));
    option.enter()
      .append('div')
        .attr('class','custom-sunburst-toggle-option');

    option
      .classed('innactive',function(d){return persistentData[d.label]})
      .text(function(d){return d.label;})
      .on('click', function(d){
        persistentData[d.label] = !persistentData[d.label];
        chart.update();
      });

		return chart;

	};

	return chart;
}
