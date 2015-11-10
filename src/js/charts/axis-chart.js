/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis chart*/
d2b.CHARTS.axisChart = function(){

	//private store
	var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height; $$.innerWidth = $$.width;
	$$.outerHeight = $$.height; $$.outerWidth = $$.width;
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
	$$.xFormat = function(value){return value;};

	//formatting y values
	$$.yFormat = function(value){return value;};

	$$.events = d2b.UTILS.chartEvents();

	//legend OBJ
	$$.legend = d2b.UTILS.LEGENDS.legend()
		.active(true)
		.color($$.color);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = d2b.UTILS.CONTROLS.controls();

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
			enabled: false,
			domain:[0,1]
		},
		lockXAxis: {
			label: "Lock X-Axis",
			type: "checkbox",
			visible: false,
			enabled: false,
			domain:[0,1]
		}
	};

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

	//setup tooltip
	$$.tooltipLayout = 0;
	$$.tooltip = d2b.SVG.tooltip();
	$$.tooltip.update = function(){
		//force tooltip layout 0 for rotated or ordinal axes
		if($$.rotate || $$.axis.x().axis.scale().rangeBand || $$.axis.y().axis.scale().rangeBand){
			$$.tooltip.layout(0);
		}else{
			$$.tooltip.layout($$.tooltipLayout);
		}
		$$.tooltip
			.x($$.axis.scale('x'))
			.y($$.axis.scale('y'))
			.start();
	};

	//define d2p axis
	$$.axis = d2b.SVG.axis();

	//persistent graph data for saving graph properties that need to persist through a data update
	$$.pGraphData = {};
	//persistent type data for saving type properties that need to persist through a data update
	$$.pTypeData = {};

	//graph method store
	$$.graphs = {};
	$$.graphs.planes = ['foreground', 'background'];
	$$.graphs.filterVisible = function(graph){ return graph.p.visible; };
	$$.graphs.init = function(){
		this.planes.forEach(function(plane){
			//set graph data
			$$.selection.types[plane].type.graph = $$.selection.types[plane].type
				.selectAll('g.d2b-axis-chart-'+plane+'-graph')
					.data(
						function(type){ return type.graphs.filter($$.graphs.filterVisible); },
						function(graph){ return graph.p.key;}
					);

			//enter new types and add reference to the persistent type data
			$$.selection.types[plane].type.graph.enter()
				.append('g')
					.attr('class', 'd2b-axis-chart-'+plane+'-graph')
					.each(function(graph){ graph.p[plane] = this; })
					.style('opacity', 0);

			$$.selection.types[plane].type.graph
				.transition()
					.duration($$.animationDuration)
					.style('opacity',1);

			$$.selection.types[plane].type.graph.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();
		});
	};

	//type method store
	$$.types = {};
	$$.types.planes = ['foreground', 'background', 'general'];
	$$.types.setProperties = function(){
		$$.currentChartData.types.forEach(function(type){
			var graphs = type.graphs.filter($$.graphs.filterVisible)
			var backgrounds = d3.selectAll(
				graphs.map(function(graph){ return graph.p.background; })
			);
			var foregrounds = d3.selectAll(
				graphs.map(function(graph){ return graph.p.foreground; })
			);
			d2b.UTILS.applyProperties.call(type.p.d2bType, type.properties);
			type.p.d2bType
				.animationDuration($$.animationDuration)
				.x($$.axis.scale('x').reversed($$.rotate))
				.y($$.axis.scale('y').reversed($$.rotate))
				.width($$.innerWidth)
				.height($$.innerHeight)
				.color($$.color)
				.tooltipSVG($$.tooltip)
				.xFormat($$.xFormat)
				.yFormat($$.yFormat)
				.general(d3.select(type.p.general))
				.foreground(foregrounds)
				.background(backgrounds)
				.data(graphs);
		});
	};
	$$.types.filterVisible = function(type){
		return type.graphs.filter($$.graphs.filterVisible).length > 0;
	};
	$$.types.init = function(){
		var newPlanes = {};
		this.planes.forEach(function(plane){
			//set type data
			$$.selection.types[plane].type = $$.selection.types[plane]
				.selectAll('g.d2b-axis-type-'+plane)
					.data(
						$$.currentChartData.types.filter($$.types.filterVisible),
						function(d){return d.type;}
					);
			//enter new types and add reference to the persistent type data
			newPlanes[plane] = $$.selection.types[plane].type.enter()
				.append('g')
					.attr('class', function(d){return 'd2b-axis-type-'+plane+' d2b-'+d.type;})
					.each(function(type){ type.p[plane] = this; });
			//exit planes
			$$.selection.types[plane].type.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity', 0)
					.remove();
		});

		//instantiate new d2b type object for entered types
		newPlanes.general.each(function(type){
			type.p.d2bType = d2b.UTILS.AXISCHART.TYPES[type.type](type.type)
					.axisChart(chart)
					.controls($$.controlsData);

			$$.events.translateEvents(type.p.d2bType);
		});

		//update graph containers
		$$.graphs.init();

		this.setProperties();

	};
	$$.types.update = function(){
		$$.currentChartData.types.forEach(function(type){
			type.p.d2bType.update();
		});
	};

	//axes method store
	$$.axes = {};
	$$.axes.update = function(){
		this.setLabels();
		this.setDomain();

		//rotate axis orientations if $$.rotate is true
		if($$.rotate){this.rotate();}
		//update axis width/height
		$$.axis.width($$.innerWidth).height($$.innerHeight);
		//transition to new axis
		$$.selection.axes.transition().duration($$.animationDuration).call($$.axis);
		//revert axis orientations
		if($$.rotate){this.rotate();}

		//get the bounding box for the rendered axis grid and position types/tracker accordingly
		var axisBox = $$.axis.box();

		$$.forcedMargin.left += axisBox.padding.left;
		$$.forcedMargin.right += axisBox.padding.right;

		$$.selection.types
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+axisBox.padding.left+','+axisBox.padding.top+')');

		$$.selection.types.tracker
			.transition()
				.duration($$.animationDuration)
				.attr('width', axisBox.innerWidth)
				.attr('height', axisBox.innerHeight);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);
	};
	$$.axes.rotate = function(){
		var orientationX = $$.axis.x().orientation;
		var orientationX2 = $$.axis.x2().orientation;
		var orientationY = $$.axis.y().orientation;
		var orientationY2 = $$.axis.y2().orientation;
		$$.axis.x({orientation: orientationY});
		$$.axis.y({orientation: orientationX});
		$$.axis.x2({orientation: orientationY2});
		$$.axis.y2({orientation: orientationX2});

		var getXDomain = $$.axis.x().axis.scale().domain;
		getXDomain(getXDomain().reverse());
	};
	//update scale domains based on yValues/xValues 'getters' of each graph type
	$$.axes.setDomain = function(){

		var xValues = [], yValues = [];
		var xDomain, yDomain;
		var xScale = $$.axis.x().axis.scale(), yScale = $$.axis.y().axis.scale();

		$$.currentChartData.types.forEach(function(type){
			if(type.p.d2bType.xValues) xValues = xValues.concat(type.p.d2bType.xValues());
			if(type.p.d2bType.yValues) yValues = yValues.concat(type.p.d2bType.yValues());
		});

		if($$.controlsData.lockXAxis.enabled){
			xScale.domain($$.controlsData.lockXAxis.domain);
		}else{
			xScale.domain(d2b.UTILS.domain(xValues, xScale, $$.xPadding));
		}

		if($$.controlsData.lockYAxis.enabled){
			yScale.domain($$.controlsData.lockYAxis.domain);
		}else{
			yScale.domain(d2b.UTILS.domain(yValues, yScale, $$.yPadding));
		}
	};
	$$.axes.setLabels = function(){
		$$.axis.x({labelOutside: $$.currentChartData.labels.x});
		$$.axis.y({labelOutside: $$.currentChartData.labels.y});
	};

	$$.legend.updateData = function(){
		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData.data.items = [].concat.apply([],
				$$.currentChartData.types.map( function(type){
							return type.graphs
								.filter( function(graph){ return !graph.notInLegend; } )
								.map(function(graph,i){ graph.open = !graph.p.visible; return graph; });
				})
			);
		}

		//update legend
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		//add 10px padding if legend is on left or right and he contents
		if(($$.legend.computedHeight() && ($$.legendOrientation == 'left'||$$.legendOrientation == 'right'))){
			$$.forcedMargin[$$.legendOrientation] += 10;
		}
	};

	$$.legend.mouseover = function(t,graph){
		if(!graph.p.visible) return;

		//bring elements associated with legend item to the front of their parent containers
		var frontElements = [];
		frontElements.push(graph.p.background);
		frontElements.push(graph.p.foreground);
		frontElements.push(graph.type.p.background);
		frontElements.push(graph.type.p.foreground);
		frontElements.push(graph.type.p.general);
		frontElements.forEach(function(el){
			if(el && el.parentNode) el.parentNode.appendChild(el);
		});

		//dim all but the corresponding graphs background and foreground
		$$.selection.types.foreground.type.graph
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 0.2);
		$$.selection.types.background.type.graph
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 0.2);
		d3.select(graph.p.background)
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 1);
		d3.select(graph.p.foreground)
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 1);
	};

	$$.legend.mouseout = function(){
		//reset dimming
		$$.selection.types.foreground.type.graph
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 1);
		$$.selection.types.background.type.graph
			.transition()
				.duration($$.animationDuration/2)
				.style('opacity', 1);
	};

	$$.legend.click = function(t,graph){
		graph.p.visible = !graph.p.visible;
		var allHidden = true;

		$$.currentChartData.types.forEach(function(type){
			type.graphs.forEach(function(graph){
				if(allHidden === true && graph.p.visible) allHidden = false;
			});
		});
		//if all types/graphs are hidden, show them all
		if(allHidden) $$.legend.resetHidden();
		chart.update();
	};

	$$.legend.dblClick = function(t,graph){
		$$.currentChartData.types.forEach(function(type){
			type.graphs.forEach(function(_graph){
				_graph.p.visible = _graph.p.key === graph.p.key;
			});
		});

		chart.update();
	};

	// reset hidden types/graphs
	$$.legend.resetHidden = function(){
		$$.currentChartData.types.forEach(function(type){
			type.graphs.forEach(function(graph){
				graph.p.visible = true;
			});
		});
	};

	$$.transformTypesContainers = function(){
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
	};

	$$.initMargin = function(){
		if($$.padding){
			$$.forcedMargin = {
				top: d2b.UTILS.visualLength($$.padding.top, $$.height),
				bottom: d2b.UTILS.visualLength($$.padding.bottom, $$.height),
				left: d2b.UTILS.visualLength($$.padding.left, $$.width),
				right: d2b.UTILS.visualLength($$.padding.right, $$.width)
			}
		}else{
			$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		}
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.tooltipLayout =				d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipLayout');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
		// if d2b types have been instantiated, update their animation duration as well
		for(type in $$.pTypeData){
			if($$.pTypeData[type].d2bType) $$.pTypeData[type].d2bType.animationDuration($$.animationDuration);
		}
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.axis = 								d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axis');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat');
	chart.pGraphData = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'persistentChartData');
	chart.padding = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'padding');
	chart.xPadding = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xPadding');
	chart.yPadding = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yPadding');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color)
	});

	// rotate the chart, set x,y scales accordingly
	chart.rotate = function(value){
		$$.rotate = value;
		return chart;
	};

	//data setter
	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;

		$$.currentChartData.types = chartData.data.types || $$.currentChartData.types;
		$$.currentChartData.labels = chartData.data.labels || $$.currentChartData.labels;

		$$.currentChartData.types.forEach(function(type){

			// init persistent data for type and store reference at type.p
			type.p = $$.pTypeData[type.type] = $$.pTypeData[type.type] || {key: type.type};

			type.graphs.forEach(function(graph){
				var pKey;

				// set graph key and type
				graph.key = graph.key || graph.label;
				graph.type = type;

				// init persistent data for graph and store reference at graph.p
				pKey = graph.type.type + "-" + graph.key;
				graph.p = $$.pGraphData[pKey] = $$.pGraphData[pKey] || {key: pKey, visible: true};

				// allow users to force the visibility state based on the "visible" attr
				if(typeof(graph.visible) === "boolean"){
				 	graph.p.visible = graph.visible;
					graph.visible = null;
				}
			});
		});

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend.selection($$.selection.legend);

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

		$$.selection.types = $$.selection.main
			.append('g')
				.attr('class','d2b-axis-types')
				.call($$.tooltip.tracker);
		$$.selection.types.tracker = $$.selection.types
			.append('rect')
				.style('fill-opacity', 0);
		$$.selection.types.background = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-background');
		$$.selection.types.foreground = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-foreground');
		$$.selection.types.general = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-general');

		$$.selection.types.tooltip = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-tooltip-area')
				.style('opacity',0)
				.call($$.tooltip.container);

		$$.legend
			.on('element-mouseover',$$.legend.mouseover)
			.on('element-mouseout',$$.legend.mouseout)
			.on('element-click',$$.legend.click)
			.on('element-dblclick',$$.legend.dblClick);

		//auto update chart
		var temp = $$.animationDuration;
		return chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired) return chart.generate(callback);

		//init forcedMargin
		$$.initMargin();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg.attr('width',$$.width).attr('height',$$.height);

	  $$.selection.group
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		//set data for legend and update the legend
		$$.legend.updateData();

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//reset Tooltip
		$$.tooltip.reset();
		$$.types.init();
		$$.axes.update();
		$$.types.update();
		$$.tooltip.update();

		$$.transformTypesContainers();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback) callback();

		return chart;
	};

	return chart;
};
