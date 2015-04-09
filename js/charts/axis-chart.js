/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis chart*/
d2b.CHARTS.axisChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {
		types:[],
		labels:{}
	};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.legend.active(true);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();

	$$.rotate = false;

	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				lockYAxis: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				lockXAxis: {
					label: "Lock X-Axis",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.orientationMap = {
		x: 'x',
		y: 'y'
	}

	//account for any tools defined by the various axis chart types
	for(type in d2b.UTILS.AXISCHART.TYPES){
		if(d2b.UTILS.AXISCHART.TYPES[type].tools){
			var tools = d2b.UTILS.AXISCHART.TYPES[type].tools();
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
		hide: false,
		tickData:{}
	};
	$$.xAlias.axis.scale($$.xAlias.scale).orient($$.xAlias.orientation);
	$$.yAlias = {
		scale:d3.scale.linear(),
		axis:d3.svg.axis(),
		type:'quantitative,linear',
		orientation:'left',
		domain:[0,1],
		hide: false,
		tickData:{}
	};
	$$.yAlias.axis.scale($$.yAlias.scale).orient($$.yAlias.orientation);

	$$.x = $$.xAlias;
	$$.y = $$.yAlias;

	//persistent chart data is used to save data properties that need to persist through a data update
	$$.persistentChartData = {};

	$$.padQuantitativeDomain = function(extent){
		var range = extent[1] - extent[0];
		var paddingCoefficient = 0.15;
		return [
							(extent[0] == 0)? 0 : extent[0]-range*paddingCoefficient,
							extent[1]+range*paddingCoefficient
						]
	};

	//update scale domains based on yValues/xValues 'getters' of each graph type
	$$.updateDomains = function(){
		var xType = $$.xAlias.type.split(',')[0];
		var tools;
		var xValues = [];
		var yValues = [];

		$$.selection.types.background.type.each(function(d){
			this.adType
				.data(d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;}));
			if(this.adType.xValues)
				xValues = xValues.concat(this.adType.xValues());
			if(this.adType.yValues)
				yValues = yValues.concat(this.adType.yValues());
		});

		if(xValues.length == 0){
			xValues = [0,1]
		}else if(xValues.length == 1 && xType == 'quantitative'){
			xValues = [xValues[0]/2, xValues[0]*1.5]
		}
		if(!$$.controlsData.lockXAxis.enabled){
			switch(xType){
				case 'ordinal':
					$$.xAlias.scale.domain(d3.set(xValues).values());
					break;
				case 'quantitative':
					$$.xAlias.scale.domain($$.padQuantitativeDomain(d3.extent(xValues)));
					break;
				default:
					$$.xAlias.scale.domain(d3.extent(xValues));
					break;
			}
		}else{
			$$.xAlias.scale.domain($$.xAlias.domain);
		}

		var yType = $$.yAlias.type.split(',')[0];

		if(yValues.length == 0){
			yValues = [0,1]
		}else if(yValues.length == 1 && yType == 'quantitative'){
			yValues = [yValues[0]/2, yValues[0]*1.5]
		}
		if(!$$.controlsData.lockYAxis.enabled){
			switch(yType){
				case 'ordinal':
					$$.yAlias.scale.domain(d3.set(yValues).values());
					break;
				case 'quantitative':
					$$.yAlias.scale.domain($$.padQuantitativeDomain(d3.extent(yValues)));
					break;
				default:
					$$.yAlias.scale.domain(d3.extent(yValues));
					break;
			}
		}else{
			$$.yAlias.scale.domain($$.yAlias.domain);
		}
	};

	//initialize axis-chart-type containers and graph containers
	$$.initGraphs = function(){
		//enter update exit a foreground svg:g element for each axis-chart-type
		$$.selection.types.foreground.type = $$.selection.types.foreground
			.selectAll('g.d2b-axis-type-foreground')
				.data($$.currentChartData.types, function(d){return d.type;});

		$$.selection.types.foreground.type.enter()
			.append('g')
				.attr('class', function(d){return 'd2b-axis-type-foreground d2b-'+d.type;});

		$$.selection.types.foreground.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.foreground.type.graph = $$.selection.types.foreground.type.selectAll('g.d2b-axis-chart-foreground-graph')
			.data(
				function(d){
					return d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;})
				},
				function(d,i){
					return d.label;
				}
			);
		$$.selection.types.foreground.type.graph.enter()
			.append('g')
				.style('opacity',0)
				.attr('class', 'd2b-axis-chart-foreground-graph')
				.each(function(graph){
					$$.persistentChartData[graph.type][graph.label].foreground = d3.select(this);
				});

		//save the foreground in data for use with the legend events
		$$.selection.types.foreground.type.graph
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);

		$$.selection.types.foreground.type.graph.exit()
			.each(function(d){$$.persistentChartData[d.type][d.label].foreground = null;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a background svg:g element for each axis-chart-type
		$$.selection.types.background.type = $$.selection.types.background
			.selectAll('g.d2b-axis-type-background')
				.data($$.currentChartData.types, function(d){return d.type;});

		$$.selection.types.background.type.enter()
			.append('g')
				.attr('class', function(d){return 'd2b-axis-type-background d2b-'+d.type;})
				.each(function(d){
					var masterType = 'axis-chart-';
					this.adType = new d2b.UTILS.AXISCHART.TYPES[d.type](d.type);
					this.adType
						.on('elementClick.d2b-click', function(d,i,type){
								for(key in $$.on.elementClick){
									$$.on.elementClick[key].call(this,d,i,masterType+type);
								}
						})
						.on('elementMouseover.d2b-mouseover', function(d,i,type){
								for(key in $$.on.elementMouseover){
									$$.on.elementMouseover[key].call(this,d,i,masterType+type);
								}
						})
						.on('elementMouseout.d2b-mouseout', function(d,i,type){
								for(key in $$.on.elementMouseout){
									$$.on.elementMouseout[key].call(this,d,i,masterType+type);
								}
						})
						.x($$.xAlias)
						.y($$.yAlias)
						.color($$.color)
						.axisChart(chart)
						.xFormat($$.xFormat)
						.yFormat($$.yFormat)
						.controls($$.controlsData);
				});
		$$.selection.types.background.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.background.type.graph = $$.selection.types.background.type.selectAll('g.d2b-axis-chart-background-graph')
			.data(
				function(d){
					return d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;})
				},
				function(d,i){
					return d.label;
				}
			);
		$$.selection.types.background.type.graph.enter()
			.append('g')
				.attr('class', 'd2b-axis-chart-background-graph')
				.style('opacity',0)
				.each(function(graph){
					$$.persistentChartData[graph.type][graph.label].background = d3.select(this);
				});

		//save the background in data for use with the legend events
		$$.selection.types.background.type.graph
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);
		$$.selection.types.background.type.graph.exit()
			.each(function(d){$$.persistentChartData[d.type][d.label].background = null;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//store the foreground graphs within the data
		$$.selection.types.foreground.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.d2b-axis-chart-foreground-graph');
			d.foregroundGraphs = graphs;
		});

	};

	//update the custom scales that are used by the axis-chart-types
	$$.updateCustomScales = function(){

		//use custom scales to fix an inconsistancy with the rotated/horizontal scale and sync ordinal scales with other scale types
		$$.x.customScale = function(value, invert){
			var position = 0;
			if($$.rotate)
				position = $$.innerWidth - $$.x.scale(value);
			else
				position = $$.x.scale(value);
			if($$.x.type == 'ordinal')
				position += $$.x.scale.rangeBand()/2;
			if(invert)
				position = $$.innerWidth - position;
			return position;
		};

		$$.y.customScale = function(value, invert){
			var position = 0;
			position = $$.y.scale(value);
			if($$.y.type == 'ordinal')
				position += $$.y.scale.rangeBand()/2;
			if(invert)
				position = $$.innerHeight - position;
			return position;
		};

		//custom bar scale that returns:
		//bar{
		//  y(y-axis positioning),
		//  height(absolute height),
		//  sHeight(signed height negative down, positive up)
		//  origin(the x-axis position)
		//  destination(bar-end position)
		//}
		$$.yAlias.customBarScale = function(value){
			var bar = {y:0,height:0};

			bar.origin = $$.yAlias.customScale(0);
			bar.destination = $$.yAlias.customScale(value);

			bar.sHeight = bar.origin - bar.destination;

			bar.y = Math.min($$.yAlias.customScale(0), bar.destination);
			bar.height = Math.abs(bar.sHeight);

			return bar;
		};

	}

	//update the graphs stored in the instance of each axis-chart-type-background
	$$.updateGraphs = function(){

		$$.updateCustomScales();

		$$.selection.types.background.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.d2b-axis-chart-background-graph');
			d.backgroundGraphs = graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;});

			this.adType
				.animationDuration($$.animationDuration)
				.width($$.innerWidth)
				.height($$.innerHeight)
				.foreground(d.foregroundGraphs)
				.background(d.backgroundGraphs)
				.data(d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;}))
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

	//update x and y axis (including scales, labels, grid..)
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
		//add tick events based on bound data
		var maxTickLength = 0;
		$$.selection.axes.y.text = $$.selection.axes.y.selectAll('.tick text').each(function(){
			var length = this.getComputedTextLength();
			maxTickLength = Math.max(maxTickLength, length);
		})
			.on('click.d2b-element-click', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementClick){
					$$.on.elementClick[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseover.d2b-element-mouseover', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementMouseover){
					$$.on.elementMouseover[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseout.d2b-element-mouseout', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementMouseout){
					$$.on.elementMouseout[key].call(this,obj,i,'axis-tick');
				}
			});

		$$.selection.axes.x.text = $$.selection.axes.x.selectAll('text')
			.on('click.d2b-element-click', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementClick){
					$$.on.elementClick[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseover.d2b-element-mouseover', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementMouseover){
					$$.on.elementMouseover[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseout.d2b-element-mouseout', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementMouseout){
					$$.on.elementMouseout[key].call(this,obj,i,'axis-tick');
				}
			});

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
			$$.x.rangeBand = $$.x.scale.rangeBand()*0.75;
		}else{
			$$.x.scale.range(range.x);
			$$.x.rangeBand = $$.innerWidth/10;
		}



		if($$.y.type.split(',')[0] == 'ordinal'){
			$$.y.scale.rangeBands(range.y);
			$$.y.rangeBand = $$.y.scale.rangeBand()*0.75;
		}else{
			$$.y.scale.range(range.y);
			$$.y.rangeBand = $$.innerHeight/10;
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
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat', function(){$$.xAlias.axis.tickFormat($$.xFormat);});
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat', function(){$$.yAlias.axis.tickFormat($$.yFormat);});
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

	//rotate the chart, set x,y scales accordingly
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

	//x/y setters
	chart.x = d2b.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'xAlias', function(value){
		if(value.orientation)
			$$.xAlias.orientation = value.orientation;

		$$.xAlias.axis
			.scale($$.xAlias.scale)
			.orient($$.xAlias.orientation);

		if(value.tickData){
			$$.xAlias.tickData = value.tickData;
		}

	});
	chart.y = d2b.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'yAlias',function(value){
		if(value.orientation)
			$$.yAlias.orientation = value.orientation;

		$$.yAlias.axis
			.scale($$.yAlias.scale)
			.orient($$.yAlias.orientation);

		if(value.tickData){
			$$.yAlias.tickData = value.tickData;
		}

	});

	//data setter
	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		if(chartData.data.types){
			$$.currentChartData.types = chartData.data.types;

			//init persistent data links
			$$.currentChartData.types.forEach(function(type){
				if(!$$.persistentChartData[type.type])
					$$.persistentChartData[type.type] = {};
				type.graphs.forEach(function(graph){
					if(!$$.persistentChartData[type.type][graph.label])
						$$.persistentChartData[type.type][graph.label] = {hide:false};
				});
			});

		}

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
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change.d2b-change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-axis-chart');

		$$.selection.axes = $$.selection.main
			.append('g')
				.attr('class','d2b-axes');

		$$.selection.axes.x = $$.selection.axes
			.append('g')
				.attr('class','d2b-axis d2b-x');

		$$.selection.axes.x.label = $$.selection.axes.x
			.append('g')
				.attr('class','d2b-label');
		$$.selection.axes.x.label.text = $$.selection.axes.x.label
			.append('text');

		$$.selection.axes.y = $$.selection.axes
			.append('g')
				.attr('class','d2b-axis d2b-y');

		$$.selection.axes.y.label = $$.selection.axes.y
			.append('g')
				.attr('class','d2b-label');
		$$.selection.axes.y.label.text = $$.selection.axes.y.label
			.append('text')
		    .attr('transform', 'rotate(-90)');

		$$.selection.grid = $$.selection.main
			.append('g')
				.attr('class','d2b-grid');

		$$.selection.grid.x = $$.selection.grid
			.append('g')
				.attr('class','d2b-grid d2b-x');

		$$.selection.grid.y = $$.selection.grid
			.append('g')
				.attr('class','d2b-grid d2b-y');

		$$.selection.types = $$.selection.main
			.append('g')
				.attr('class','d2b-axis-types');
		$$.selection.types.background = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-background');
		$$.selection.types.foreground = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-foreground');

		// reset hidden types/graphs
		var resetHidden = function(){
			$$.currentChartData.types.forEach(function(type){
				type.graphs.forEach(function(graph){
					$$.persistentChartData[graph.type][graph.label].hide = false;
				});
			});
		};

		$$.legend.on('elementMouseover',function(d){
			var background = $$.persistentChartData[d.type][d.label].background;
			var foreground = $$.persistentChartData[d.type][d.label].foreground;

			if(background && foreground){
				var backgroundNode = background.node();
				var foregroundNode = foreground.node();
				//bring the type and the graph to the front for the foreground and background
				if(backgroundNode.parentNode){
					backgroundNode.parentNode.appendChild(backgroundNode);
					if(backgroundNode.parentNode.parentNode)
						backgroundNode.parentNode.parentNode.appendChild(backgroundNode.parentNode);
				}
				if(foregroundNode.parentNode){
					foregroundNode.parentNode.appendChild(foregroundNode);
					if(foregroundNode.parentNode.parentNode)
						foregroundNode.parentNode.parentNode.appendChild(foregroundNode.parentNode);
				}

				//dim all but the corresponding graph
				$$.selection.types.foreground.type.graph
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 0.2);
				$$.selection.types.background.type.graph
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 0.2);
				background
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 1);
				foreground
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 1);
			}


		})
		.on('elementMouseout',function(d){
			//reset dimming
			$$.selection.types.foreground.type.graph
				.transition()
					.duration($$.animationDuration/2)
					.style('opacity', 1);
			$$.selection.types.background.type.graph
				.transition()
					.duration($$.animationDuration/2)
					.style('opacity', 1);
		})
		.on('elementClick', function(d){
			$$.persistentChartData[d.type][d.label].hide = !$$.persistentChartData[d.type][d.label].hide;
			var allHidden = true;

			$$.currentChartData.types.forEach(function(type){
				type.graphs.forEach(function(graph){
					if(allHidden == true && !$$.persistentChartData[graph.type][graph.label].hide)
						allHidden = false;
				});
			});
			//if all types/graphs are hidden, show them all
			if(allHidden)
				resetHidden();

			chart.update();
		})
		.on('elementDblClick', function(d){
			resetHidden();
			chart.update();
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
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		//save the type of each graph
		$$.currentChartData.types.forEach(function(type){
			type.graphs.forEach(function(graph){
				graph.type = type.type;
			});
		});

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData.data.items = [].concat.apply([],
				$$.currentChartData.types.map(
					function(type){
						return type.graphs.map(function(graph,i){
							graph.open = $$.persistentChartData[type.type][graph.label].hide;
							return graph;
						})
					}
				)
			);
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		if(($$.legend.computedHeight() && ($$.legendOrientation == 'left'||$$.legendOrientation == 'right'))){
			// || ($$.legend.computedWidth() && ($$.legendOrientation == 'top'||$$.legendOrientation == 'bottom'))){
			$$.forcedMargin[$$.legendOrientation] += 10;
		}

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.initGraphs();

		$$.updateDomains();

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
