/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
d3b.CHARTS.templateChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d3b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d3b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d3b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d3b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = d3b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d3b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d3b.UTILS.CONTROLS.horizontalControls();
	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d3b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d3b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d3b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d3b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d3b.UTILS.CHARTS.MEMBERS.on(chart, $$);

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

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d3b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d3b-main-chart');

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
		$$.forcedMargin = d3b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d3b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d3b.UTILS.CHARTS.HELPERS.updateControls($$);

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			//----replace array with a custom legend builder
			$$.legendData.data.items = [{'label':'item 1'},{'label':'item 2'},{'label':'item 3'},{'label':'item 4'},{'label':'item 5'},{'label':'item 6'}]
		}
		d3b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d3b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//----chart code goes here!
		//----use innerHeight/innerWidth as the context dimensions and use forcedMargin.|left, right, top, or bottom| as the current positioning margin

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
