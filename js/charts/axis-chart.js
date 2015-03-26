/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
AD.CHARTS.axisChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = AD.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = AD.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = AD.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {
		types:[],
		labels:{}
	};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = AD.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new AD.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new AD.UTILS.CONTROLS.horizontalControls();

	$$.rotate = false;

	// $$.orientationMap = {
	// 	x: {
	// 		dimension1:'innerHeight',
	// 		dimension2:'innerWidth'
	// 	},
	// 	y: {
	// 		dimension1:'innerWidth',
	// 		dimension2:'innerHeight'
	// 	}
	// };

	$$.orientationMap = {
		x:'x',
		y:'y'
	}

	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	//account for any tools defined by the various axis chart types
	for(type in AD.UTILS.AXISCHART.TYPES){
		if(AD.UTILS.AXISCHART.TYPES[type].tools){
			var tools = AD.UTILS.AXISCHART.TYPES[type].tools();
			if(tools){

				//controlsData tools
				if(tools.controlsData){
					for(control in tools.controlsData){
						$$.controlsData[control] = tools.controlsData[control];
					}
				}

			}
		}
	}

	$$.xAlias = {
		scale:d3.scale.linear(),
		axis:d3.svg.axis(),
		type:'quantitative,linear',
		orientation:'bottom',
		domain:[0,1],
		hide: false
	};
	$$.xAlias.axis.scale($$.xAlias.scale).orient($$.xAlias.orientation);
	$$.yAlias = {
		scale:d3.scale.linear(),
		axis:d3.svg.axis(),
		type:'quantitative,linear',
		orientation:'left',
		domain:[0,1],
		hide: false
	};
	$$.yAlias.axis.scale($$.yAlias.scale).orient($$.yAlias.orientation);

	$$.x = $$.xAlias;
	$$.y = $$.yAlias;

	$$.updateGraphs = function(){

		//enter update exit a foreground svg:g element for each axis-chart-type
		$$.selection.types.foreground.type = $$.selection.types.foreground.selectAll('g.ad-axis-type-foreground').data($$.currentChartData.types, function(d){return d.type;});
		$$.selection.types.foreground.type.enter()
			.append('g')
				.attr('class', function(d){return 'ad-axis-type-foreground ad-'+d.type;});
		$$.selection.types.foreground.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.foreground.type.graph = $$.selection.types.foreground.type.selectAll('g.axis-chart-foreground-graph').data(function(d){return d.graphs;},function(d,i){
				return d.label;
			});
		$$.selection.types.foreground.type.graph.enter()
			.append('g')
				.attr('class', 'axis-chart-foreground-graph');
		//save the foreground in data for use with the legend events
		$$.selection.types.foreground.type.graph
				.each(function(d){d.foreground = d3.select(this);});
		$$.selection.types.foreground.type.graph.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a background svg:g element for each axis-chart-type
		$$.selection.types.background.type = $$.selection.types.background.selectAll('g.ad-axis-type-background').data($$.currentChartData.types, function(d){return d.type;});
		$$.selection.types.background.type.enter()
			.append('g')
				.attr('class', function(d){return 'ad-axis-type-background ad-'+d.type;})
				.each(function(d){
					this.adType = new AD.UTILS.AXISCHART.TYPES[d.type];
				});
		$$.selection.types.background.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.background.type.graph = $$.selection.types.background.type.selectAll('g.axis-chart-background-graph').data(function(d){return d.graphs;},function(d,i){
				return d.label;
			});
		$$.selection.types.background.type.graph.enter()
			.append('g')
				.attr('class', 'axis-chart-background-graph');

		//save the background in data for use with the legend events
		$$.selection.types.background.type.graph
				.each(function(d){
						d.background = d3.select(this);
					});
		$$.selection.types.background.type.graph.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		$$.selection.types.foreground.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.axis-chart-foreground-graph');
			d.foregroundGraphs = graphs;
		});


		//use custom scales to fix an inconsistancy with the rotated/horizontal scale and sync ordinal scales with other scale types
		$$.x.customScale = function(value){
			var position = 0;
			if($$.rotate)
				position = $$.innerWidth - $$.x.scale(value);
			else
				position = $$.x.scale(value);

			if($$.x.type == 'ordinal')
				position += $$.x.scale.rangeBand()/2;

			return position;
		};
		$$.y.customScale = function(value){
			var position = 0;

			position = $$.y.scale(value);

			if($$.y.type == 'ordinal')
				position += $$.y.scale.rangeBand()/2;

			return position;
		};

		$$.selection.types.background.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.axis-chart-background-graph');
			d.backgroundGraphs = graphs;

			this.adType
				.x($$.xAlias)
				.y($$.yAlias)
				.color($$.color)
				.foreground(d.foregroundGraphs)
				.background(d.backgroundGraphs)
				.animationDuration($$.animationDuration)
				// .orientationMap($$.orientationMap)
				.data(d.graphs)
				.controls($$.controlsData)
				.update();
		});

		$$.selection.types.background.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

	};

	//axis modifier is used to make like code for x/y axes reusable
	$$.axisModifier = function(callback, params){
		if(params){
			callback('x', params.x);
			callback('y', params.y);
		}else{
			callback('x');
			callback('y');
		}
	};

	$$.updateAxis = function(){

		var labelOffset = 10;
		var labelTransition = {};

		//setup axis labels if specified and visible
		$$.axisModifier(
			function(axis, params){
				labelTransition[axis] = $$.selection.axes[axis].label
					.transition()
						.duration($$.animationDuration);
				if($$.currentChartData.labels[axis] && !$$[axis].hide){
					$$.forcedMargin[$$[axis].orientation] += labelOffset;
					$$[params.dimension] -= labelOffset;
					labelTransition[axis]
						.style('opacity',1);
					$$.selection.axes[axis].label.text
						.text($$[axis].label);
				}else{
					labelTransition[axis]
						.style('opacity',0);
					$$.selection.axes[axis].label.text
						.text('');
				}
			},
			{
				x:{dimension: 'innerHeight'},
				y:{dimension: 'innerWidth'}
			}
		);

		//create axis transitions;
		var axisTransition = {};
		$$.axisModifier(function(axis){
			axisTransition[axis] = $$.selection.axes[axis]
				.transition()
					.duration($$.animationDuration);
		});


		//create axis transitions;
		var gridTransition = {};
		$$.axisModifier(function(axis){
			gridTransition[axis] = $$.selection.grid[axis]
				.transition()
					.duration($$.animationDuration);
		});

		//find max tick size on the vertical axis for proper spacing
		var maxTickLength = 0;
		$$.selection.axes.y.text = $$.selection.axes.y.selectAll('.tick text').each(function(){
			var length = this.getComputedTextLength();
			maxTickLength = Math.max(maxTickLength, length);
		});

		$$.selection.axes.x.text = $$.selection.axes.x.selectAll('text');

		var labelPadding = 10;

		//modify x/y axis positioning and visiblity
		$$.axisModifier(
			function(axis, params){
				if($$[axis].hide){
					axisTransition[axis].style('opacity',0);
				}else{
					axisTransition[axis].style('opacity',1);
					$$.forcedMargin[$$[axis].orientation] += params.offset;
					$$[params.dimension] -= params.offset;
				}
			},
			{
				x:{offset:10 + labelPadding, dimension:'innerHeight'},
				y:{offset:maxTickLength + labelPadding, dimension:'innerWidth'}
			}
		);

		//position x/y labels
		var labelOffsetPosition = ($$.y.orientation == 'left')? -maxTickLength-labelOffset-labelPadding-5 : maxTickLength+labelOffset+labelPadding+labelTransition.y.node().getBBox().width;
		labelTransition.y.attr('transform','translate('+ labelOffsetPosition +','+ $$.innerHeight/2 +')');

		labelOffsetPosition = ($$.x.orientation == 'top')? -labelOffset*1.5-labelPadding:+labelOffset*1+labelPadding+labelTransition.x.node().getBBox().height;
		labelTransition.x.attr('transform','translate('+	$$.innerWidth/2 +','+ labelOffsetPosition+')');

		//set x/y scale range
		var range = {};
		if($$.rotate){
			if($$.x.invert)
				range.x=[$$.innerWidth, 0];
			else
				range.x=[0, $$.innerWidth];

			if(!$$.y.invert)
				range.y=[0, $$.innerHeight];
			else
				range.y=[$$.innerHeight, 0];
		}else{
			if($$.x.invert)
				range.x=[$$.innerWidth, 0];
			else
				range.x=[0, $$.innerWidth];

			if($$.y.invert)
				range.y=[0, $$.innerHeight];
			else
				range.y=[$$.innerHeight, 0];
		}

		if($$.x.type.split(',')[0] == 'ordinal'){
			$$.x.scale.rangeBands(range.x);
			$$.x.rangeBand = $$.x.scale.rangeBand();
		}else{
			$$.x.scale.range(range.x);
			$$.x.rangeBand = $$.innerWidth/15;
		}



		if($$.y.type.split(',')[0] == 'ordinal'){
			$$.y.scale.rangeBands(range.y);
			$$.y.rangeBand = $$.y.scale.rangeBand();
		}else{
			$$.y.scale.range(range.y);
			$$.y.rangeBand = $$.innerHeight/15;
		}

		//set x/y tick size
		$$.x.axis.tickSize(5);
		$$.y.axis.tickSize(5);

		//transition and position x axis
		axisTransition.x
			.call($$.x.axis);

		if($$.x.orientation == 'top'){
			axisTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			axisTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+($$.innerHeight + $$.forcedMargin.top)+')');
		}

		//transition and position y axis
		axisTransition.y
			.call($$.y.axis)
			.each('end',function(){
				//when y transition finishes, wait 10ms and then verify that the horizontal margin is correctly aligned for the maxTickLength
				setTimeout(function(){
					var verifyMaxTickLength = 0;
					$$.selection.axes.y.selectAll('.tick text').each(function(){
						var length = this.getComputedTextLength();
						verifyMaxTickLength = Math.max(verifyMaxTickLength, length);
					});
					if(maxTickLength != verifyMaxTickLength)
						chart.update();
				},10);

			});

		if($$.y.orientation == 'left'){
			axisTransition.y
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			axisTransition.y
					.attr('transform','translate('+($$.innerWidth + $$.forcedMargin.left)+','+$$.forcedMargin.top+')');
		}


		//set x/y tick size for grid
		$$.x.axis.tickSize(-$$.innerHeight);
		$$.y.axis.tickSize(-$$.innerWidth);

		//transition and position x/y grid lines
		gridTransition.x
			.call($$.x.axis);
		if($$.x.orientation == 'top'){
			gridTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			gridTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+($$.innerHeight + $$.forcedMargin.top)+')');
		}
		gridTransition.y
			.call($$.y.axis);

		if($$.y.orientation == 'left'){
			gridTransition.y
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			gridTransition.y
					.attr('transform','translate('+($$.innerWidth + $$.forcedMargin.left)+','+$$.forcedMargin.top+')');
		}


	};


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							AD.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	AD.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						AD.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						AD.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									AD.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.rotate = function(value){
		$$.rotate = value;
		if(value){
			$$.orientationMap = {x:'y', y:'x'}
			$$.x = $$.yAlias;
			$$.y = $$.xAlias;
		}else{
			$$.orientationMap = {x:'x', y:'y'}
			$$.x = $$.xAlias;
			$$.y = $$.yAlias;
		}
		return chart;
	};

	chart.x = AD.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'xAlias', function(value){
		if(value.orientation)
			$$.xAlias.orientation = value.orientation;

			$$.xAlias.axis
			.scale($$.xAlias.scale)
			.orient($$.xAlias.orientation);
	});
	chart.y = AD.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'yAlias',function(value){
		if(value.orientation)
			$$.yAlias.orientation = value.orientation;

		$$.yAlias.axis
			.scale($$.yAlias.scale)
			.orient($$.yAlias.orientation);
	});

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		if(chartData.data.types)
			$$.currentChartData.types = chartData.data.types;

		if(chartData.data.labels){
			$$.currentChartData.labels = chartData.data.labels;
			$$.xAlias.label = $$.currentChartData.labels.x;
			$$.yAlias.label = $$.currentChartData.labels.y;
		}


		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		AD.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('elementChange',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','ad-axis-chart');

		$$.selection.axes = $$.selection.main
			.append('g')
				.attr('class','ad-axes');

		$$.selection.axes.x = $$.selection.axes
			.append('g')
				.attr('class','ad-axis ad-x');

		$$.selection.axes.x.label = $$.selection.axes.x
			.append('g')
				.attr('class','ad-label');
		$$.selection.axes.x.label.text = $$.selection.axes.x.label
			.append('text');

		$$.selection.axes.y = $$.selection.axes
			.append('g')
				.attr('class','ad-axis ad-y');

		$$.selection.axes.y.label = $$.selection.axes.y
			.append('g')
				.attr('class','ad-label');
		$$.selection.axes.y.label.text = $$.selection.axes.y.label
			.append('text')
		    .attr('transform', 'rotate(-90)');

		$$.selection.grid = $$.selection.main
			.append('g')
				.attr('class','ad-grid');

		$$.selection.grid.x = $$.selection.grid
			.append('g')
				.attr('class','ad-grid ad-x');

		$$.selection.grid.y = $$.selection.grid
			.append('g')
				.attr('class','ad-grid ad-y');

		$$.selection.types = $$.selection.main
			.append('g')
				.attr('class','ad-axis-types');
		$$.selection.types.background = $$.selection.types
			.append('g')
				.attr('class','ad-axis-types-background');
		$$.selection.types.foreground = $$.selection.types
			.append('g')
				.attr('class','ad-axis-types-foreground');

		$$.legend.on('elementMouseover',function(d){
			d3.selectAll('g.axis-chart-background-graph').style('opacity',0.3);
			d.background.style('opacity',1);
			d3.selectAll('g.axis-chart-foreground-graph').style('opacity',0.3);
			d.foreground.style('opacity',1);
		})
		.on('elementMouseout',function(d){
			d3.selectAll('g.axis-chart-background-graph').style('opacity',1);
			d3.selectAll('g.axis-chart-foreground-graph').style('opacity',1);
		});

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
		$$.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		AD.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		AD.UTILS.CHARTS.HELPERS.updateControls($$);

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData.data.items = [].concat.apply([], $$.currentChartData.types.map(function(d){return d.graphs.map(function(d){return d;})}));;
		}
		AD.UTILS.CHARTS.HELPERS.updateLegend($$);

		if(($$.legend.computedHeight() && ($$.legendOrientation == 'left'||$$.legendOrientation == 'right'))){
			// || ($$.legend.computedWidth() && ($$.legendOrientation == 'top'||$$.legendOrientation == 'bottom'))){
			$$.forcedMargin[$$.legendOrientation] += 10;
		}

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		AD.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.updateAxis();

		$$.selection.types
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');


		if($$.rotate){
			$$.selection.types.background
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+($$.innerWidth)+', 0),rotate(90)');
			$$.selection.types.foreground
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+($$.innerWidth)+', 0),rotate(90)');
		}else{
			$$.selection.types.background
				.transition()
					.duration($$.animationDuration)
					.attr('transform','');
			$$.selection.types.foreground
				.transition()
					.duration($$.animationDuration)
					.attr('transform','');
		}


		$$.updateGraphs();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
