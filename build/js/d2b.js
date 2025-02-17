/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var d2b = d2b || {};

//namespace method for adding new namespaces
d2b.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = d2b;

    if (nsparts[0] === "d2b") {
        nsparts = nsparts.slice(1);
    }

    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        parent = parent[partname];
    }
    return parent;
};


/*d2b charts*/
d2b.createNameSpace("d2b.CHARTS");

/*d2b charts*/
d2b.createNameSpace("d2b.DASHBOARDS");

/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS");
/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CHARTPAGE");

d2b.createNameSpace("d2b.UTILS.AXISCHART.TYPES");

/* d2b SVG */
d2b.createNameSpace("d2b.SVG");

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*d2b constants*/
d2b.createNameSpace("d2b.CONSTANTS");

d2b.CONSTANTS = {
  // DEFAULTPALETTE: {primary:"rgb(42,54,82)",secondary:"rgb(11,22,47)"},
  DEFAULTWIDTH: function(){ return 960; },
  DEFAULTHEIGHT: function(){ return 540; },
  DEFAULTMARGIN: function(){ return {left:0,right:0,top:0,bottom:0}; },
  DEFAULTFORCEDMARGIN: function(){ return {left:30, bottom:20, right:30, top:20}; },
  // DEFAULTFORCEDMARGIN: function(){ return {left:0, bottom:0, right:0, top:0}; },
  DEFAULTCOLOR: function(){ return d3.scale.category10(); },
  DEFAULTEVENTS: function(){ return {
                            		elementMouseover:function(){},
                            		elementMouseout:function(){},
                            		elementClick:function(){}
                            	};
                },
  ANIMATIONLENGTHS: function(){ return {normal:500,short:200,long:1000}; }
}

d2b.chartEvents = function(){
  return {
    // update:function(){};
  }
};

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

		//add 10px padding if legend is on left or right and has contents
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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*bubble chart*/
d2b.CHARTS.bubbleChart = function(){

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
	$$.data = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//dispatcher
  $$.dispatch = d3.dispatch('update', 'zoomIn', 'zoomOut');

  //default tooltip content function
	$$.tooltipContent = function(d){
    var tt = "<b>"+d.label+":</b> "+$$.xFormat(d.value)+" ";
    if(d.change === null || d.change === undefined) return tt;
    if(d.change > 0) tt += "+";
    tt += $$.format.percent(d.change);
		return tt;
	};

  //view type (packs or change)
  $$.view = 'packs';

  //defined formats
  $$.format = {
    general: d3.format(),
    percent: d3.format(".0%")
  };

  //d3 pack layout
  $$.pack = d3.layout.pack();

  // set axes and scales
  $$.xTickFormat = function(d){
    var bounds = $$.axis._x.domain();
    var newD = $$.format.percent(d);
    if(+d === bounds[0]) return $$.format.percent(bounds[0])+" or lower";
    if(+d === bounds[1]) return $$.format.percent(bounds[1])+" or higher";
    return newD;
  };

  $$.axis = d2b.SVG.axis();
  $$.axis._x = d3.scale.linear().domain([-0.25, 0.25]);
  $$.axis.x().axis.tickFormat($$.xTickFormat);
  $$.axis._y = d3.scale.ordinal();
  $$.axis
    .x({scale: $$.axis._x, orientation: 'top-outside'})
    .y({scale: $$.axis._y, orientation: 'left-inside'});

  $$.r = d3.scale.linear().domain([0, 1]);

  $$.gridX = d3.scale.ordinal();
  $$.gridY = d3.scale.ordinal();

  // track the current center and zoom rati
  // $$.center = {};

  /*BACKGROUND METHODS*/
  $$.background = {
    // update background for packs view (pack labels)
    packs: function(){
      var textSize;
      var packLabel = this.selectAll('.d2b-pack-label')
        .data($$.data.categories, function(d){ return d.key || d.label; });
      var newPackLabel;

      // compute dynamic text size
  		var textSize = Math.min(30,Math.max(16,Math.min($$.innerWidth, $$.innerHeight)/(10 * $$.data.categories.length)));

      $$.grid = d2b.UTILS.grid($$.outerWidth, $$.outerHeight, $$.data.categories.length);

      newPackLabel = packLabel.enter()
        .append('text')
          .style('opacity', 0)
          .attr('class', 'd2b-pack-label');

      newPackLabel
        .append('tspan')
          .attr('class', 'd2b-pack-label-name');
      newPackLabel
        .append('tspan')
          .attr('x', 0)
          .attr('class', 'd2b-pack-label-value');

      $$.gridX.rangeBands([0, $$.outerWidth]).domain(d3.range(0, $$.grid.columns));
      $$.gridY.rangeBands([0, $$.outerHeight]).domain(d3.range(0, $$.grid.rows));

      packLabel
          .each(function(d, i){
            d.center = {
              x: $$.gridX(i % $$.grid.columns) + $$.gridX.rangeBand() / 2,
              y: $$.gridY(Math.floor(i / $$.grid.columns)) + $$.gridY.rangeBand() / 2
            };
          })
        .transition()
          .duration($$.animationDuration)
          .style('opacity', 1)
          .attr('transform', function(d){
            var y = d.center.y - $$.gridY.rangeBand()/3;
            return 'translate('+d.center.x+','+y+')';
          });
      packLabel
        .select('tspan.d2b-pack-label-name')
          .style('font-size', textSize+'px')
          .text(function(d){ return d.label; });
      packLabel
        .select('tspan.d2b-pack-label-value')
          .style('font-size', textSize+'px')
          .attr('dy', textSize + 5)
          .text(function(d){ return $$.xFormat(d.value); });

      packLabel.exit().remove();
    },
    // update background for change view (change axes)
    change: function(){

      var axisSvg;

      var catLabels = $$.data.categories.map(function(d){ return d.label; });
      catLabels = d3.set(catLabels);

      $$.axis
        .width($$.outerWidth)
        .height($$.outerHeight);
      $$.axis._y.domain(catLabels.values().reverse())

      axisSvg = this.selectAll('.d2b-bubble-axes').data([$$.data]);

      axisSvg.enter().append('g').attr('class','d2b-bubble-axes');

      axisSvg
        .transition()
          .duration($$.animationDuration)
          .call($$.axis);

    }
  };

  /*ZOOM METHODS*/
  $$.zoom = {
    // zoom coefficient (can be modified by the user)
    coefficient: 1,
    // store currently zoomed node (null of zoomed out)
    elem: null,
    // toggle zoom on a node
    toggle: function(){
      if($$.zoom.elem === this) $$.zoom.out();
      else $$.zoom.in.call(this);
    },
    // zoom in on a node
    in: function(){
      var self = this;
      var elem = d3.select(self);
      var d = elem.datum();
      var bubble = $$.selection.bubbles.selectAll('.bubble');
      var offsetX = $$.outerWidth/2 - d.attrs.x;
      var offsetY = $$.outerHeight/2 - d.attrs.y;
      var scale = Math.min($$.outerWidth, $$.outerHeight) / (2 * d.attrs.r);

      if(!d.children || !d.children.length) return $$.zoom.out();

      $$.dispatch.zoomIn.call(this, d);

      $$.zoom.elem = self;

      elem.each(function(){ this.parentNode.appendChild(this); });

      scale *= $$.zoom.coefficient;

      $$.selection.background
        .transition()
          .duration($$.animationDuration)
          .style('opacity', 0);

      $$.selection.bubbles
        .select('.d2b-bubbles-wrap')
        .transition()
          .duration($$.animationDuration)
          .attr('transform', 'translate(0,0)');

      // update sub-bubbles at the smaller size
      // elem.each($$.bubbles.updateSubPack);

      $$.selection.bubbles
        .selectAll('.d2b-bubble')
          .each(function(d){
            d.zoom = {
              x: (d.attrs.x - $$.outerWidth/2 + offsetX) * scale + $$.outerWidth/2,
              y: (d.attrs.y - $$.outerHeight/2 + offsetY) * scale + $$.outerHeight/2,
              r: d.attrs.r * scale
            };
          })
          .classed('d2b-background-bubble', true)
        .transition()
          .duration($$.animationDuration)
          .call($$.bubbles.transition, true);

      // update sub-bubbles again after zoom attrs have been changed
      elem
        .classed('d2b-background-bubble', false)
        .each($$.bubbles.updateSubPack);

    },
    // zoom out
    out: function(){
      if(!$$.zoom.elem) return;

      var elem = d3.select($$.zoom.elem);
      var data = elem.datum();
      var size;

      $$.dispatch.zoomOut.call($$.zoom.elem, data);

      $$.zoom.elem = null;
      chart.update();

      size = data.attrs.r * 2;

      $$.pack.size([size, size])({children: data.children});

      elem.selectAll('.d2b-sub-bubble')
          // .each(function(d){
          //   d.attrs = {
          //     r: d.r,
          //     x: d.x - size/2,
          //     y: d.y - size/2,
          //     color: d.attrs.color
          //   };
          // })
        .transition()
          .duration($$.animationDuration)
          .style('opacity', 0)
          .call($$.bubbles.transition)
          .remove();


      $$.selection.bubbles
        .selectAll('.d2b-bubble')
          .classed('d2b-background-bubble', false);

    }
  }

  /*BUBBLE METHODS*/
  $$.bubbles = {
    // get color for bubbles
    getColor: function(d){
      var elem = d, key;
      while(elem.parent.parent) {
        if(elem.colorKey !== null && elem.colorKey !== undefined) {
          key = elem.colorKey;
          break;
        }
        elem = elem.parent;
      }
      return $$.color(key || elem.label);
    },
    // get color for subpack bubbles
    getSubColor: function(d, parentColor){
      if(d.colorKey !== null && d.colorKey !== undefined) return $$.color(d.colorKey);
      else if(d.children && d.children.length) return d3.rgb(parentColor).brighter(d.depth / 2);
      else return 'white';
    },
    // update the subpack for the zoomed in node
    updateSubPack: function(d){
      var subBubble, newSubBubble, newCircle, bubble = d3.select(this);
      var size = d.attrs.r * 2;
      var sizeZoom = d.zoom.r * 2;
      var color = d.attrs.color;
      var pack = $$.pack.size([size, size])({children: d.children});
      pack.shift(); // remove the parent node, as it is already drawn

      subBubble = d3.select(bubble.node()).selectAll('.d2b-sub-bubble')
        .data(pack, function(d){ return d.key || d.label; });

      newSubBubble = subBubble.enter()
        .append('g')
          .attr('class', 'd2b-sub-bubble')
          .style('opacity', 0);

      newCircle = newSubBubble
        .append('circle')
          .call(
            d2b.UTILS.bindTooltip,
            $$.tooltipContent,
            function(d){return d;},
            function(d){return d.attrs.color;}
          );

      // set standard attributes
      subBubble.each(function(d){
        d.attrs = {
          r: d.r,
          x: d.x - size/2,
          y: d.y - size/2,
          color: $$.bubbles.getSubColor(d, color)
        };
      });

      // initialize new circle colors
      newCircle
          .style('fill', function(d){ return d.attrs.color; })
          .style('stroke', function(d){ return d3.rgb(d.attrs.color).darker(1); });

      // set zoomed attributes
      pack = $$.pack.size([sizeZoom, sizeZoom])({children: d.children});
      pack.shift(); // remove the parent node, as it is already drawn
      subBubble.each(function(d){
        d.zoom = {
          r: d.r,
          x: d.x - sizeZoom/2,
          y: d.y - sizeZoom/2
        };
      });

      newSubBubble.call($$.bubbles.transition);

      subBubble
        .transition()
          .duration($$.animationDuration)
          .style('opacity', 1)
          .call($$.bubbles.transition, true);
    },
    // transition a set of bubbles (radius, translation, fill, stroke)
    transition: function(bubble, zoom){
      bubble
          .attr('transform', function(d){
            var end = (zoom)? d.zoom : d.attrs;
            return 'translate('+end.x+', '+end.y+')';
          })
        .select('circle')
          .style('fill', function(d){ return d.attrs.color; })
          .style('stroke', function(d){ return d3.rgb(d.attrs.color).darker(1); })
          .attr('r', function(d){
            var end = (zoom)? d.zoom : d.attrs;
            return Math.max(0, end.r);
          });
    },
    // update packs view for bubbles
    packs: function(){

      var bubblesWrap = this.select('.d2b-bubbles-wrap');
      var bubble = this.selectAll('.d2b-bubble');

      var rangeBand = 0.9 * Math.sqrt($$.data.categories.length) * Math.min($$.gridX.rangeBand(), $$.gridY.rangeBand());

      bubblesWrap
        .transition()
          .duration($$.animationDuration)
          .attr('transform', 'translate(0,0)');

      $$.r.range([0, rangeBand]);

      bubble
          .each(function(d){
            d.attrs = {
              x: d.parent.center.x + rangeBand * (d.x - d.parent.x),
              y: d.parent.center.y + rangeBand * (d.y - d.parent.y),
              color: $$.bubbles.getColor(d),
              r: $$.r(d.r)
            };
          });
    },
    // update change view for bubbles
    change: function(){

      var box = $$.axis.box();
      var x = $$.axis.scale('x');
      var y = $$.axis.scale('y');
      var getX = function(d){ return Math.min(Math.max(x(d), 0), box.innerWidth); };
      var bubblesWrap = this.select('.d2b-bubbles-wrap');
      var bubble = this.selectAll('.d2b-bubble');

      bubblesWrap
        .transition()
          .duration($$.animationDuration)
          .attr('transform', 'translate('+box.padding.left+', '+box.padding.top+')');

      $$.r.range([0, Math.min(box.innerWidth, box.innerHeight)/2]);

      bubble
          .each(function(d){
            d.attrs = {
              x: getX(d.change),
              y: y(d.parent.label),
              color: $$.bubbles.getColor(d),
              r: $$.r(d.r)
            };
          });

    }
  };


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters and getters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		// $$.legend.animationDuration($$.animationDuration);
		// $$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	// chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.view =     						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'view');
	chart.zoomCoefficient = function(coefficient){
    if(!arguments.lenght) return $$.zoom.coefficient;
    $$.zoom.coefficient = coefficient;
    return chart;
  };

  // zoom in by data object / .d2b-bubble node / label / key
  // or argument null to zoom out
	chart.zoom = function(elem){
    var zoomed = false;
    $$.selection.bubbles.selectAll('.d2b-bubble').each(function(d){
      if( !zoomed &&
          (
            elem === d ||
            elem === this ||
            elem === d.label ||
            elem === d.key
          ) ) {
            zoomed = true;
            $$.zoom.in.call(this);
          }
    });
    if(!zoomed) $$.zoom.out();
    return chart;
  };
  chart.on = function(key, func){
		if(arguments.length === 1) return $$.dispatch.on(key);
    $$.dispatch.on(key, func);
    return chart;
  };
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
  chart.axis =                d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axis', function(){
    $$.axis._x = $$.axis.x().axis.scale();
    $$.axis._y = d3.scale.ordinal();
    $$.axis.y({scale: $$.axis._y});
    $$.axis.x().axis.tickFormat($$.xTickFormat);
  });

	chart.data = function(chartData){
		if(!arguments.length) return $$.data;
		$$.data = chartData.data;
    $$.pack.size([1, 1])({children: $$.data.categories});

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-bubble-chart');

    $$.selection.bubbles = $$.selection.main
      .append('g')
        .attr('class','d2b-bubbles');

    $$.selection.bubbles
      .append('g')
        .attr('class','d2b-bubbles-wrap');

    $$.selection.background = $$.selection.main
      .append('g')
        .attr('class','d2b-bubble-background');

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
    var background, bubbleData, bubble;

		//if generate required call the generate method
		if($$.generateRequired) return chart.generate(callback);

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

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

    // enter update exit background wrapper
    $$.selection.background
      .transition()
        .duration($$.animationDuration)
        .style('opacity', 1)
    background = $$.selection.background
      .selectAll('.d2b-bubble-background-wrap')
        .data([$$.view], function(d){return d;});

    background.enter().append('g').attr('class', 'd2b-bubble-background-wrap');
    background.exit().remove();

    // enter update exit bubbles
    bubbleData = $$.data.categories.map(function(d){ return d.children; })
    bubbleData = [].concat.apply([], bubbleData)
        .sort(function(a, b){ return d3.descending(a.r, b.r); });

    bubble = $$.selection.bubbles.select('.d2b-bubbles-wrap')
      .selectAll('.d2b-bubble')
        .data(bubbleData, function(d){ return d.key || d.label; });

    var newBubble = bubble.enter()
      .append('g')
        .attr('class', 'd2b-bubble');

    newBubble
      .append('circle')
				.call(
          d2b.UTILS.bindTooltip,
					$$.tooltipContent,
					function(d){return d;},
          function(d){return d.attrs.color;}
				);

    bubble
        .classed('d2b-zoomable', false)
        .on('click.d2b-bubble-zoom', null)
        .each(function(){ this.parentNode.appendChild(this); })
        .filter(function(d){ return d.children && d.children.length; })
        .classed('d2b-zoomable', true)
        .on('click.d2b-bubble-zoom', $$.zoom.toggle);

    // remove exited bubbles
    bubble.exit()
      .transition()
        .duration($$.animationDuration)
        .remove()
      .select('circle')
        .attr('r', 0);

    // refresh views
    background.call($$.background[$$.view]);
    $$.selection.bubbles.call($$.bubbles[$$.view]);

    // init new bubble
    newBubble
        .call($$.bubbles.transition)
      .select('circle')
        .attr('r', 0);

    // transition bubbles after attributes have been set
    bubble
      .transition()
        .duration($$.animationDuration)
        .call($$.bubbles.transition);

    // if page is zoomed, rezoom
    if($$.zoom.elem) $$.zoom.in.call($$.zoom.elem);

		d3.timer.flush();

		//dispatch the on 'update' event, and pass it the selection object
		$$.dispatch.update.call($$.selection);

		if(callback) callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*fact chart*/
d2b.CHARTS.factChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	$$.selectedFact = null;

	//for fact positioning
	$$.x = d3.scale.ordinal();
	$$.y = d3.scale.ordinal();
	$$.textScale = d3.scale.linear().range([15, 30]).domain([100, 1000]);
	$$.textScale.custom = function(value){
		var range = this.range();
		var translation = this(value);
		if(translation < range[0])
			return range[0];
		else if(translation > range[1])
			return range[1];
		return translation;
	};

	$$.updateFact = function(fact, textSize){
		fact
			.select('text.d2b-fact-label')
				.style('font-size', textSize+'px')
				.text(function(d){return d.label;})
				.each(function(d){d.labelWidth = this.getComputedTextLength();})
			.transition()
				.duration($$.animationDuration)
				.attr('y', -0.5*textSize);

		var barHeight = 3;
		fact
			.select('rect')
			.transition()
				.duration($$.animationDuration)
				.attr('width', function(d){return d.labelWidth;})
				.attr('height', barHeight)
				.attr('x', function(d){return -d.labelWidth/2;})
				.attr('y', -barHeight/2)
				.style('fill', '#ccc');

		fact
			.select('text.d2b-fact-value')
				.style('font-size', 2*textSize+'px')
				.text(function(d){return $$.xFormat(d.value);})
			.transition()
				.duration($$.animationDuration)
				.attr('y', 2*textSize);
	};

	$$.showMainFacts = function(){
		$$.selection.subFacts
			.style('pointer-events','none')
				.selectAll('*')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		var factCount = $$.currentChartData.facts.length;
		var textSize = $$.textScale.custom(Math.min($$.innerWidth, $$.innerHeight)/factCount);
		var grid = d2b.UTILS.grid($$.innerWidth, $$.innerHeight, factCount);

		$$.x.domain(d3.range(0, grid.columns)).rangeBands([0,$$.innerWidth]);
		$$.y.domain(d3.range(0, grid.rows)).rangeBands([0,$$.innerHeight]);

		$$.selection.fact = $$.selection.main.selectAll('g.d2b-fact').data($$.currentChartData.facts);
		var newFact = $$.selection.fact.enter()
			.append('g')
				.attr('class', 'd2b-fact')
				.call($$.events.addElementDispatcher, 'main', 'd2b-fact');

		newFact.append('text').attr('class','d2b-fact-label');
		newFact.append('text').attr('class','d2b-fact-value');
		newFact.append('rect').attr('class','d2b-fact-bar');

		var factTransition = $$.selection.fact
				.style('pointer-events','all')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate('+($$.x(i%grid.columns) + $$.x.rangeBand()/2)+','+($$.y(Math.floor(i/grid.columns)) + $$.y.rangeBand()/2)+')';
				});

		$$.updateFact($$.selection.fact, textSize);

		$$.selection.fact.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity', 0)
				.remove();

		//setup sub-fact events if available
		$$.selection.fact.each(function(d){
			var elem = d3.select(this);

			if(!d.subFacts || d.subFacts.length < 1){
				elem
					.style('cursor', 'auto')
					.on('mouseover.d2b-mouseover',null)
					.on('mouseout.d2b-mouseout',null)
					.on('click.d2b-click',null);
				return;
			}


			elem
				.style('cursor', 'pointer')
				.on('mouseover.d2b-mouseover', function(){
					elem.select('rect')
						.transition()
							.duration($$.animationDuration/2)
							.style('fill', '#333');
				})
				.on('mouseout.d2b-mouseout', function(){
					elem.select('rect')
						.transition()
							.duration($$.animationDuration/2)
							.style('fill', '#ccc');
				})
				.on('click.d2b-click', function(){
					var elem = d3.select(this);
					if($$.selectedFact){
						$$.selection.fact
								.style('pointer-events','all')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',1);
						$$.selectedFact = null;
					}else{
						$$.selection.fact
								.style('pointer-events','none')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',0);
						elem
								.style('pointer-events','all')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',1);
						$$.selectedFact = elem;
						$$.selectedFact.data = d;
					}
					chart.update();
				});

		});

	};

	$$.showSubFacts = function(){
		var factCount = $$.currentChartData.facts.length;
		var textSize = $$.textScale.custom(Math.min($$.innerWidth, $$.innerHeight)/factCount);

		$$.selectedFact
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.innerWidth/2+','+textSize+')');

		$$.updateFact($$.selectedFact, textSize);

		var topOffset = textSize * 3;
		$$.forcedMargin.top += topOffset;
		$$.innerHeight -= $$.forcedMargin.top;

		$$.selection.subFacts
				.style('pointer-events','all')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform','translate(0,'+topOffset+')')

		var subFactCount = $$.selectedFact.data.subFacts.length;
		var grid = d2b.UTILS.grid($$.innerWidth, $$.innerHeight, subFactCount);
		$$.x.domain(d3.range(0, grid.columns)).rangeBands([0,$$.innerWidth]);
		$$.y.domain(d3.range(0, grid.rows)).rangeBands([0,$$.innerHeight]);

		$$.selection.subFact = $$.selection.subFacts.selectAll('g.d2b-sub-fact').data($$.selectedFact.data.subFacts);

		var newSubFact = $$.selection.subFact.enter()
			.append('g')
				.attr('class', 'd2b-sub-fact')
				.style('opacity',0)
				.attr('transform', function(d,i){
					return 'translate('+$$.x(i%grid.columns)+','+$$.y(Math.floor(i/grid.columns))+')';
				});

		newSubFact
			.append('g')
				.attr('class', 'd2b-sub-fact-chart')
				.each(function(d){
					this.pieChart = new d2b.CHARTS.pieChart();
					this.pieChart
						.select(this)
						.color($$.color)
						.donutRatio(0.6)
						.controls({hideLegend:{enabled:true}});
				});

		newSubFact.append('text').attr('class', 'd2b-sub-fact-label');

		$$.selection.subFact
			.transition()
				.duration($$.animationDuration)
				.attr('transform', function(d,i){
					return 'translate('+$$.x(i%grid.columns)+','+$$.y(Math.floor(i/grid.columns))+')';
				})
			.delay($$.animationDuration/1.5)
				.style('opacity',0.9);

		$$.selection.subFact
			.select('g.d2b-sub-fact-chart')
				.each(function(d){
					$$.events.translateEvents(this.pieChart);
					this.pieChart
						.animationDuration($$.animationDuration)
						.width($$.x.rangeBand())
						.height($$.y.rangeBand())
						.data({data:{values:d.values}})
						.update();
				})

		$$.selection.subFact.select('text.d2b-sub-fact-label')
				.text(function(d){return d.label;})
			.transition()
				.duration($$.animationDuration)
				.attr('x', $$.x.rangeBand()/2)
				.attr('y', $$.y.rangeBand()/2);

	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		if($$.selection.subFact){
			$$.selection.subFact.each(function(d){
				this.pieChart.color($$.color);
			});
		}
	});

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

		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-svg d2b-container');

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-fact-chart');

		$$.selection.subFacts = $$.selection.main
			.append('g')
				.attr('class','d2b-sub-facts');

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
		// console.log('hi')
		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		if($$.selectedFact){
			$$.showSubFacts();
		}else{
			$$.showMainFacts();
		}

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*fact chart*/
d2b.CHARTS.funnelChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	$$.coneHeight = d3.scale.linear();
	$$.coneCurve = 15;
	$$.heightCoeff = 0.9;

	$$.funnel = function(){

		$$.coneHeight
			.range([0, $$.innerHeight*$$.heightCoeff])
			.domain([0, d3.sum($$.currentChartData.values,function(d){return d.value;})]);
		var coneTopMaxWidth = $$.innerWidth;
		var coneBottomMinWidth = $$.innerWidth/4;
		var pinchCoeff = (coneTopMaxWidth - coneBottomMinWidth)/($$.innerHeight*$$.heightCoeff);

		var currentConeWidth = coneTopMaxWidth;
		var currentY = 0;

		$$.currentChartData.values.forEach(function(d){

			var height = $$.coneHeight(d.value);
			var topWidth = currentConeWidth;
			if(d.pinched){
				currentConeWidth -= height*pinchCoeff
			}
			var bottomWidth = currentConeWidth;

			var x = {
				start:$$.innerWidth/2-topWidth/2,
				end:$$.innerWidth/2+topWidth/2,
				mid:$$.innerWidth/2
			};
			d.top = "M"+x.start+",0 Q"+x.mid+","+$$.coneCurve+" "+x.end+",0 M"+x.end+",0 Q"+x.mid+","+-$$.coneCurve+" "+x.start+",0";

			x = {
				start:$$.innerWidth/2-bottomWidth/2,
				end:$$.innerWidth/2+bottomWidth/2,
				mid:$$.innerWidth/2
			};
			d.bottom = "M"+x.start+","+height+" Q"+x.mid+","+(height+$$.coneCurve)+" "+x.end+","+height+" M"+x.end+","+height+" Q"+x.mid+","+(height-$$.coneCurve)+" "+x.start+","+height;

			d.center = ($$.innerWidth/2-topWidth/2)+","+0+" "+
								 ($$.innerWidth/2-bottomWidth/2)+","+height+" "+
								 ($$.innerWidth/2+bottomWidth/2)+","+height+" "+
								 ($$.innerWidth/2+topWidth/2)+","+0+" ";

			d.y = currentY;
			d.height = height;
			d.width = bottomWidth;
			currentY += height;
		});

		return $$.currentChartData.values;
	};

	$$.showText = function(d){
// console.log(this)
		this.select('.d2b-cone-note-group')
				.style('opacity',0)
				.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height)+')';})
		this.select('.d2b-cone-text-group')
				.style('opacity',1)
				.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height/2 + $$.coneCurve - 15)+')';})
	};

	$$.showNote = function(d){
			this.select('.d2b-cone-note-group')
					.style('opacity',1)
					.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+($$.coneCurve*1.5 + (d.height-d.noteHeight)/2)+')';})
			this.select('.d2b-cone-text-group')
					.style('opacity',0)
					.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(0)+')';})
	};

	$$.coneMouseover = function(d){
		var _self = this;
		var coneFound = false;
		var mouseoverPadding = 20;
		$$.selection.funnel.cone.each(function(){
			var transition = d3.select(this)
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short*2)
			if(this == _self){
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y)+')';})
						.call($$.showNote);
				coneFound = true;
			}else if(!coneFound){
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y+mouseoverPadding)+')';});
			}else{
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y-mouseoverPadding)+')';});
			}
		})
	};

	$$.coneMouseout = function(d){
		$$.selection.funnel.cone
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short*2)
				.call($$.showText)
				.attr('transform',function(d){return 'translate(0,'+(d.y)+')';});
	};

	$$.enterCones = function(){
		var newCone = $$.selection.funnel.cone.enter()
			.append('g')
				.attr('class','d2b-cone')
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-cone')
				.on('mouseout.d2b-mouseout',$$.coneMouseout)
				.on('mouseover.d2b-mouseover',$$.coneMouseover);

		newCone
			.append('path')
				.attr('class','d2b-cone-bottom');
		newCone
			.append('polygon')
				.attr('class','d2b-cone-center');
		newCone
			.append('path')
				.attr('class','d2b-cone-top');

		var newConeNoteGroup = newCone
			.append('g')
				.attr('class','d2b-cone-note-group');

		var newConeNote = newConeNoteGroup
			.append('text')
				.attr('class','d2b-cone-note');

		var newConeTextGroup = newCone
			.append('g')
				.attr('class','d2b-cone-text-group');

		var newConeText = newConeTextGroup
			.append('text')
				.attr('class','d2b-cone-text');

		newConeText
			.append('tspan')
				.attr('class','d2b-cone-label');

		newConeText
			.append('tspan')
				.attr('class','d2b-cone-value')
				.attr('x',0)
				.attr('y',20);

		$$.selection.funnel.cone.bottom = $$.selection.funnel.cone.select('.d2b-cone-bottom');
		$$.selection.funnel.cone.top = $$.selection.funnel.cone.select('.d2b-cone-top');
		$$.selection.funnel.cone.center = $$.selection.funnel.cone.select('.d2b-cone-center');
		$$.selection.funnel.cone.textGroup = $$.selection.funnel.cone.select('.d2b-cone-text-group');
		$$.selection.funnel.cone.text = $$.selection.funnel.cone.select('.d2b-cone-text');
		$$.selection.funnel.cone.label = $$.selection.funnel.cone.select('.d2b-cone-label');
		$$.selection.funnel.cone.value = $$.selection.funnel.cone.select('.d2b-cone-value');
		$$.selection.funnel.cone.noteGroup = $$.selection.funnel.cone.select('.d2b-cone-note-group');
		$$.selection.funnel.cone.note = $$.selection.funnel.cone.select('.d2b-cone-note');

		if(newCone.size()){
			$$.selection.funnel.cone.each(function(){
				this.parentNode.appendChild(this);
			});
		}

	};

	$$.updateCones = function(){

		$$.selection.funnel.transition()
			.duration($$.animationDuration)
				.attr('transform',function(){return 'translate(0,'+$$.innerHeight*(1-$$.heightCoeff)/2+')';});

		var coneTransition = $$.selection.funnel.cone
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){return 'translate(0,'+d.y+')';})
				.style('opacity',1)
				.call($$.showText);

		// coneTransition.select('.d2b-cone-note-group')
		// 		.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+($$.coneCurve*1.5)+')';})
		$$.selection.funnel.cone.note
				.attr('dy',0)
				.attr('y',0)
				.text(function(d){return d.note;})
				.each(function(d){
					d3.select(this)
						.call(d2b.UTILS.textWrap, d.width-10);
					d.noteHeight = this.getBBox().height;
				})

		// coneTransition.select('.d2b-cone-text-group')
		// 		.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height/2 + $$.coneCurve - 15)+')';})
		coneTransition.select('.d2b-cone-label')
				.text(function(d){return d.label;});
		coneTransition.select('.d2b-cone-value')
				.text(function(d){return $$.xFormat(d.value);});

		coneTransition.select('.d2b-cone-bottom')
				.attr('d',function(d){return d.bottom;})
				.style('fill',function(d){return $$.color(d.label);});

		coneTransition.select('.d2b-cone-center')
				.attr('points',function(d){return d.center;})
				.style('fill',function(d){return $$.color(d.label);});

		coneTransition.select('.d2b-cone-top')
				.attr('d',function(d){return d.top;})
				.style('fill',function(d){return d3.rgb($$.color(d.label)).darker(1.2);});
	};

	$$.exitCones = function(){
		$$.selection.funnel.cone.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.coneCurve = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'coneCurve');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

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

		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-svg d2b-container')

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-funnel-chart');

		$$.selection.funnel = $$.selection.main
			.append('g')
				.attr('class','d2b-funnel');

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

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.selection.funnel.cone = $$.selection.funnel.selectAll('g.d2b-cone').data($$.funnel($$.currentChartData.values)._reverse(),function(d,i){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000);
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});

		$$.enterCones();
		$$.updateCones();
		$$.exitCones();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*gauge chart*/
d2b.CHARTS.gaugeChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	$$.percentFormat = d2b.UTILS.numberFormat({"precision":2,"units":{"after":'%'}});
	$$.percent = 0;

	$$.arc = d3.svg.arc()
    .startAngle(function(d, i){return d.start;})
    .endAngle(function(d, i){return d.end;})
    .innerRadius(function(d, i){return d.inner;})
    .outerRadius(function(d, i){return d.outer;});

	$$.tooltip = function(d){
		if(d.value != null)
			return "<b>"+d.label+":</b> "+$$.xFormat(d.value)+" ("+d.percent*100+"%)";
		else
			return "<b>"+d.label+":</b> "+d.percent*100+"%";
	};

	$$.getPercent = function(){
		//Set the percent for the gauge either by:
		//	-using the user supplied percent
		//	-calculating the percent with the user supplied value and total amounts
		//	-defaulting the percent to 0
		if($$.currentChartData.percent != null)
			return $$.currentChartData.percent;
		else if($$.currentChartData.value != null && $$.currentChartData.total != null)
			return $$.currentChartData.value / $$.currentChartData.total;
		else
			return 0;
	};

	$$.getData = function(){
		return [
			{
				label: $$.currentChartData.label,
				value: $$.currentChartData.value,
				percent: $$.percent,
				start: -Math.PI/2,
				end: Math.PI * $$.percent - Math.PI/2,
				color: d2b.UTILS.getColor($$.color, 'label')($$.currentChartData),
				filled:true
			},
			{
				percent: $$.percent,
				start: Math.PI * $$.percent - Math.PI/2,
				end: Math.PI/2,
				color: '#ddd',
				filled:false
			}
		]
	};

	$$.setNewArc = function(elem, inner, outer){
		elem.each(function(d){
			this.newArc = {
				start: d.start,
				end: d.end,
				inner: inner,
				outer: outer
			}
		})
	};

	$$.arcMouseover = function(d){
		var arc = d3.select(this).select('path');
		arc
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer * 1.03)
			.transition()
				.duration($$.animationDuration/4)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	$$.arcMouseout = function(d){
		var arc = d3.select(this).select('path');
		arc
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer)
			.transition()
				.duration($$.animationDuration/4)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

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

		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-template-chart d2b-svg d2b-container');

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      // .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-gauge-chart');

		$$.selection.arcs = $$.selection.main.append('g');


		$$.selection.arcHeader = $$.selection.main
			.append('text')
				.attr('class','d2b-gauge-arc-header');

		$$.selection.arcLabels = $$.selection.main
			.append('g')
						.attr('class','d2b-gauge-arc-labels');

		$$.selection.arcLabels.start = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('0%');
		$$.selection.arcLabels.end = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('100%');
		$$.selection.arcLabels.percent = $$.selection.arcLabels
			.append('text')
				.attr('class', 'd2b-gauge-arc-percent')
				.text('0%');

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
		$$.innerWidth = $$.outerWidth - $$.forcedMargin.left - $$.forcedMargin.right;
		$$.innerHeight = $$.outerHeight - $$.forcedMargin.top - $$.forcedMargin.bottom;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		var headerHeight = ($$.currentChartData.label)? 20 : 0;
		var labelHeight = 20;

		$$.radius = {};

		$$.radius.outer = Math.min($$.innerHeight * 2 - headerHeight * 2 - labelHeight * 2, $$.innerWidth)/2;
		$$.radius.inner = 0.8 * $$.radius.outer;

		$$.forcedMargin.top = $$.forcedMargin.top + $$.innerHeight/2  + ($$.radius.outer)/2 - labelHeight/2 + headerHeight/2;
		$$.forcedMargin.left = $$.forcedMargin.left + $$.innerWidth/2;

		$$.selection.group
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.percent = $$.getPercent();

		$$.selection.arcs.arc = $$.selection.arcs.selectAll('g').data($$.getData());

		var newArc = $$.selection.arcs.arc.enter()
			.append('g')
		newArc
			.append('path')
				// .attr('d', $$.arc)
				.style('fill', function(d){return d.color;})

		newArc
			.filter(function(d){return d.filled;})
				.on('mouseover.d2b-mouseover', $$.arcMouseover)
				.on('mouseout.d2b-mouseout', $$.arcMouseout)
				.call($$.events.addElementDispatcher, 'main', 'd2b-arc');

		$$.selection.arcs.arc
			.filter(function(d){return d.filled;})
				.call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return d;});

		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
				.call($$.setNewArc, $$.radius.inner, $$.radius.outer)
			.transition()
				.duration($$.animationDuration)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				.style('fill', function(d){return d.color;})
				.attr('class', 'd2b-arc');

		$$.selection.arcLabels.percent
			.transition()
				.duration($$.animationDuration)
				.tween("text", function(d) {
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, $$.percent);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.attr('font-size', $$.radius.inner * 0.5 + 'px');

		$$.selection.arcLabels.start
			.transition()
				.duration($$.animationDuration)
				.attr('x', -($$.radius.outer - ($$.radius.outer-$$.radius.inner)/2));
		$$.selection.arcLabels.end
			.transition()
				.duration($$.animationDuration)
				.attr('x', ($$.radius.outer - ($$.radius.outer-$$.radius.inner)/2));


		$$.selection.arcHeader
				.text($$.currentChartData.label)
			.transition()
				.duration($$.animationDuration)
				.attr('y',-$$.radius.outer - 10);


		d3.timer.flush();

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*iframe chart*/
d2b.CHARTS.iframeChart = function(){

	var $$ = {};

	//define iframeChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.generateRequired = true; //using some methods may require the chart to be redrawn

	$$.selection = d3.select('body'); //default selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();

	$$.currentChartData = {
			};

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.generateRequired = true;
		$$.currentChartData = chartData.data;

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		$$.selection.div = $$.selection
			.append('div')
				.attr('class','d2b-iframe-chart d2b-container');

		$$.selection.div.iframe = $$.selection.div
			.append('iframe')
				.attr('class','d2b-iframe')
				.attr('src',$$.currentChartData.url);

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		$$.selection.div.iframe
			.transition()
				.duration($$.animationDuration)
				.attr('width',$$.width)
				.attr('height',$$.height);

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*map chart*/
d2b.CHARTS.mapChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.filterSet = {};

	$$.topoPaths = [
		{key:'countries',file:'countries.topo.json'},
		{key:'states',file:'states.topo.json'}
		// {key:'counties',file:'counties.topo.json'},
		// {key:'zip_codes',file:'zip_codes.csv',type:'csv'}
	];

	$$.topoData = {};
	$$.filteredTopoData = {};
	$$.topoDataReady = false;
	$$.projection = "equirectangular";

	$$.drawCountries = function(path){

		$$.selection.countries.country = $$.selection.countries.selectAll('g.d2b-country')
			.data($$.filteredTopoData.countries.features, function(d){return d.properties.GU_A3;});

		$$.selection.countries.country
				.enter()
			.append("g")
				.attr('class','d2b-country')
				.style("opacity",0)
			.append("path");

		$$.selection.countries.country.path = $$.selection.countries.country.select('path');

		$$.selection.countries.country
			.transition()
				.duration($$.animationDuration)
				.style("opacity",1)
			.select('path')
				.attr("d", path)
				.style("fill", "black")

		$$.selection.countries.country
				.exit()
			.transition()
				.duration($$.animationDuration)
				.style("opacity",0)
				.remove();
	};

	$$.pathFit = function(feature){
		var center = d3.geo.centroid(feature);
		var scale  = 150;
		var offset = [$$.innerWidth/2,$$.innerHeight/2];
		var projection = d3.geo[$$.projection]()
					.scale(scale)
					.translate(offset);

		if($$.projection != "albersUsa")
			projection.center(center);

		var path = d3.geo.path().projection(projection);

		var bounds  = path.bounds(feature);
		var hscale  = scale * $$.innerWidth / (bounds[1][0]-bounds[0][0]);
		var vscale  = scale * $$.innerHeight / (bounds[1][1]-bounds[0][1]);
		var scale   = (hscale < vscale) ? hscale : vscale;
		var offset  = [$$.innerWidth - (bounds[0][0] + bounds[1][0])/2,
										$$.innerHeight - (bounds[0][1] + bounds[1][1])/2];

		projection
			.scale(scale)
			.translate(offset);

		if($$.projection != "albersUsa")
			projection.center(center);

		path = path.projection(projection);

		return path;
	};

	$$.setTopoData = function(callback){
		//data is not ready
		$$.topoDataReady = false;
		//initiate file load
		d2b.UTILS.load($$.topoPaths, function(data){
			//save data feature sets
			$$.topoData = data;

			//clone the topo data
			$$.filteredTopoData = JSON.parse(JSON.stringify($$.topoData));

			//filter states and countries using the filter set
			$$.filteredTopoData.states.objects.states_simplified.geometries
			 	= $$.topoData.states.objects.states_simplified.geometries
					.filter(function(geo){
						return Object.keys($$.filterSet.states || {}).map(function(key){
											return $$.filterSet.states[key].split(',').indexOf(geo.properties[key]) > -1;
										})
											.concat([true])
											.every(function(test){return test == true;});
					});
			$$.filteredTopoData.states = topojson.feature($$.filteredTopoData.states, $$.filteredTopoData.states.objects.states_simplified)
// console.log($$.filteredTopoData.states)
			// console.log($$.filteredTopoData.map(function(d){return d.properties.name}))

			$$.filteredTopoData.countries.objects.countries_simplified.geometries
			 	= $$.topoData.countries.objects.countries_simplified.geometries
					.filter(function(geo){
						return Object.keys($$.filterSet.countries || {}).map(function(key){
											return $$.filterSet.countries[key].split(',').indexOf(geo.properties[key]) > -1;
										})
											.concat([true])
											.every(function(test){return test == true;});
					});
			$$.filteredTopoData.countries = topojson.feature($$.filteredTopoData.countries, $$.filteredTopoData.countries.objects.countries_simplified)

			//data is now ready
			$$.topoDataReady = true;

			//if an update has been queued and is waiting on data, update the chart.
			if($$.updateRequired){
				chart.update();
				$$.updateRequired = false;
			}

			//if callback present, invoke
			if(callback)
				callback();
		});
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.projection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'projection');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.filter = function(filters){
		$$.filterSet = filters;
		$$.setTopoData();
		return chart;
	};

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
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

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
				.attr('class','d2b-main-chart');

		$$.selection.countries = $$.selection.main
			.append('g')
				.attr('class','d2b-countries');

		//fetch topo files for countries and states
		$$.setTopoData(function(){
			var temp = $$.animationDuration;
			chart
					.animationDuration(0)
					.update(callback)
					.animationDuration(temp);

		});

		return chart;
	};



	//chart update
	chart.update = function(callback){
		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}
		// console.log('update')
		if(!$$.topoDataReady){
			$$.updateRequired = true;}
		else{
// console.log($$.filteredTopoData.countries)
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

			//set legend data and update legend viz
			if($$.controlsData.hideLegend.enabled){
				$$.legendData = {data:{items:[]}};
			}else{
				//----replace array with a custom legend builder
				$$.legendData.data.items = [{'label':'item 1'},{'label':'item 2'},{'label':'item 3'},{'label':'item 4'},{'label':'item 5'},{'label':'item 6'}]
			}
			d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

			var path = $$.pathFit($$.filteredTopoData.countries);

			$$.selection.main
				.transition()
					.duration($$.animationDuration)
					.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

			d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

			$$.drawCountries(path);

			d3.timer.flush();

		}

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*multi chart*/
d2b.CHARTS.multiChart = function(){

	var $$ = {};

	//define multiChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH(),
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.generateRequired = true; //using some methods may require the chart to be redrawn

	$$.selection = d3.select('body'); //default selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.currentChartData = {
			};

	$$.current = {chart:{}};
	$$.previous = {chart:null};

	$$.d2bChart;

	$$.events = d2b.UTILS.chartEvents();

	//init event object
	// var on = {
	// 	elementMouseover:function(){},
	// 	elementMouseout:function(){},
	// 	elementClick:function(){}
	// };

	var buttonClick = function(d,i){
		$$.previous.chart = $$.current.chart;
		$$.current.chart = d;
		// for(key in on.elementClick){
		// 	on.elementClick[key].call(this,d,i,'chart-button');
		// }
		// console.log($$.current.chart)
		chart.update();
	};

	var updateButtons = function(){
		$$.selection.buttonsWrapper.buttons.button = $$.selection.buttonsWrapper.buttons.selectAll('li').data($$.currentChartData.charts, function(d){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000)
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});
		$$.selection.buttonsWrapper.buttons.button.enter()
			.append('li')
			.on('click.d2b-click', buttonClick);

		$$.selection.buttonsWrapper.buttons.button
			.text(function(d){return d.label;})
			.classed('d2b-selected',function(d){return d == $$.current.chart;});

		$$.selection.buttonsWrapper.buttons.button.exit().remove();

	};

	var setChartProperties = function(options){
		if($$.current.chart.properties){
			for(key in $$.current.chart.properties){
				if(options && options.skip){
					if(options.skip.indexOf(key) > -1)
						continue;
				}
				if(key == 'data')
					continue;
				if($$.current.chart.properties[key].args)
					$$.d2bChart[key].apply(this, $$.current.chart.properties[key].args);
				else
					$$.d2bChart[key]($$.current.chart.properties[key]);
			}
		}

		// translate the events to the currently drawn chart
		$$.events.translateEvents($$.d2bChart);
	};

	var updateChart = function(){
		if(!$$.selection.chartWrapper.chart){
			$$.selection.chartWrapper.chart = $$.selection.chartWrapper
				.append('div')
					.attr('class','d2b-multi-chart-chart')
					.style('opacity',1);
			// d2b.UTILS.chartAdapter($$.current.chart.type, $$.current.chart);
			$$.d2bChart = $$.current.chart.chart;
			$$.d2bChart
				.data($$.current.chart.properties.data)
				.selection($$.selection.chartWrapper.chart);

			setChartProperties();
		}else if($$.current.chart != $$.previous.chart){
			if($$.current.chart.type == $$.previous.chart.type){
				$$.d2bChart
					.data($$.current.chart.properties.data);

				setChartProperties({'skip': ['controls']});
			}else{
				$$.selection.chartWrapper.chart
					.transition()
						.duration($$.animationDuration)
						.style('opacity',0)
						.remove();

				$$.selection.chartWrapper.chart = $$.selection.chartWrapper
					.append('div')
						.attr('class','d2b-multi-chart-chart')
						.style('opacity',0);

				// d2b.UTILS.chartAdapter($$.current.chart.type, $$.current.chart);
				$$.d2bChart = $$.current.chart.chart;
				$$.d2bChart
					.selection($$.selection.chartWrapper.chart)
					.data((JSON.parse(JSON.stringify($$.current.chart.data)))); //clone data for update

				$$.selection.chartWrapper.chart
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1);

				setChartProperties();
			}
		}

		$$.d2bChart
			// .events($$.events)
			.width($$.innerWidth)
			.height($$.innerHeight)
			.update();

		$$.previous.chart = $$.current.chart;
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		var useDefault = true;

		if($$.current.chart.key){
			var matchingChart = chartData.data.charts.filter(function(d){
					return $$.current.chart.key == d.key;
				})[0];
			if(matchingChart){
				useDefault = false;
				$$.current.chart = matchingChart;
			}
		}

		if(useDefault)
			$$.current.chart = chartData.data.charts[0];

		$$.currentChartData = chartData.data;

		$$.currentChartData.charts.forEach(function(d){
			d.chart = new d2b.CHARTS[d.type]();
		});

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		// $$.selection
		// 	.style('width',width + 'px')
		// 	.style('height',height + 'px');

		//create button container
		$$.selection.buttonsWrapper = $$.selection
			.append('div')
				.attr('class','d2b-multi-chart-buttons-wrapper');

		$$.selection.buttonsWrapper.buttons = $$.selection.buttonsWrapper
			.append('ul')
				.attr('class','d2b-buttons');

		// $$.selection.style('position','relative');
		$$.selection.chartWrapper = $$.selection
			.append('div')
				.attr('class','d2b-multi-chart d2b-container');

		// $$.currentChartData.charts.forEach(function(d){
		// 	d.chart.selection($$.selection.chartWrapper);
		// });

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		$$.innerWidth = $$.width;
		$$.innerHeight = $$.height - 50;

		$$.selection.chartWrapper
			.style('width',$$.innerWidth + 'px')
			.style('height',$$.innerHeight + 'px');

		updateButtons();

		updateChart();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*pie chart*/
d2b.CHARTS.pieChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.legend.active(true);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	//controls data

	// $$.tooltipLayout = 0;
	// $$.tooltip = d2b.SVG.tooltip().layout($$.tooltipLayout);

	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.tooltipContent = function(d){
		return "<b>"+d.label+":</b> "+$$.xFormat(d.value)+" ("+d3.round(100*d.value/$$.pieTotal, 1)+"%)";
	};

	$$.donutRatio = 0;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); });

	$$.arcText = d3.svg.arc();

	$$.pie = d3.layout.pie()
			.value(function(d){
				var value = ($$.persistentData.hiddenArcs[d.key])? 0 : d.value;
				$$.pieTotal += value;
				return value;
			})
			.sort(null);
	$$.pieTotal = 1;

	$$.persistentData = {
		focusedArc:null,
		hiddenArcs:{}
	};

	$$.arcKey = function(d,i){
		if(d.key == 'unique')
			return Math.floor((1 + Math.random()) * 0x10000);
		else if(d.key && d.key != 'auto')
			return d.key;
		else
			return d.label;
	};

	$$.arcEnter = function(){
		//set radius
		$$.r = 0.93*(Math.min($$.outerWidth,$$.outerHeight)/2);

		//init pie total
		$$.pieTotal = 0;

		$$.selection.pie.datum($$.currentChartData.values)
		$$.selection.pie.arc = $$.selection.pie.selectAll('g').data($$.pie, function(d){return d.data.key});

		//arc enter
		var newArc = $$.selection.pie.arc.enter()
			.append('g')
				.attr('class','d2b-arc')
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-arc');

		//create arc path
		newArc.append('path')
			.each(function(d){
				//init old Arc
				this.oldArc = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});

		//create arc text
		newArc.append('text')
			.attr('y', 6)
			.each(function(d){
				//init old position arc
				this.oldPosition = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});
	};

	$$.arcUpdate = function(){

		//update arc container
		$$.selection.pie.arc
				.call(d2b.UTILS.bindTooltip,
							$$.tooltipContent,
							function(d){return d.data;}, function(d){return d2b.UTILS.getColor($$.color, 'label')(d.data);}
				)
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1);

		//update arc path
		$$.selection.pie.arc.path = $$.selection.pie.arc.select('path')
				.each(function(d){
					//update newArc object
					this.newArc = {
						start:d.startAngle,
						end:d.endAngle,
						inner:$$.r*$$.donutRatio,
						outer:(d.data.key == $$.persistentData.focusedArc)? $$.r*1.04 : $$.r
					};
				})
				.on('mouseover.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = d.data.key;
					chart.update();
				})
				.on('mouseout.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})

		$$.selection.pie.arc.path.transition = $$.selection.pie.arc.path
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1)
				.style('fill',function(d){
					return d2b.UTILS.getColor($$.color, 'label')(d.data);
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)

		// arc text
		$$.selection.pie.arc.text = $$.selection.pie.arc.select('text')
			.transition()
				.duration($$.animationDuration/1.5)
				.tween("text", function(d) {
					//tween percent value
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, d.data.value/$$.pieTotal);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.style('opacity',function(d){
					return ((d.data.value/$$.pieTotal<0.03)||$$.persistentData.hiddenArcs[d.data.key])? 0 : 1;
				})
				.attrTween("transform", function(d) {
					//tween centroid position
					var _self = this;
					//update new position arc object
					_self.newPosition = {start:d.startAngle, end:d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
					var i = d3.interpolate(_self.oldPosition, _self.newPosition);
					return function(t){
						_self.oldPosition = i(t);
						return "translate("+$$.arc.centroid(_self.oldPosition)+")";
					};
				});
	};

	$$.arcExit = function(){
		$$.selection.pie.arc.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d){
					this.newArc = {start:d.endAngle, end: d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
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
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.donutRatio = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'donutRatio');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		$$.currentChartData.values.forEach(function(d){
			d.key = $$.arcKey(d);
		});

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
				.selection($$.selection.legend)
				.on('element-mouseover.d2b-mouseover',function(t,d){
					$$.persistentData.focusedArc = d.key;
					chart.update();
				})
				.on('element-mouseout.d2b-mouseover',function(t,d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})
				.on('element-click',function(t,d){
					$$.persistentData.hiddenArcs[d.key] = !$$.persistentData.hiddenArcs[d.key];

					var allHidden = true;

					$$.currentChartData.values.forEach(function(d){
						if(allHidden == true && !$$.persistentData.hiddenArcs[d.key])
							allHidden = false;
					});
					//if all types/graphs are hidden, show them all
					if(allHidden){
						for(var key in $$.persistentData.hiddenArcs)
							$$.persistentData.hiddenArcs[key] = false;
					}


					chart.update();
				})
				.on('element-dblclick',function(t,d){
					//on legend dbl click hide all but clicked arc
					$$.currentChartData.values.forEach(function(d2){
						$$.persistentData.hiddenArcs[d2.key] = d2.key != d.key;
					})
					chart.update();
				});

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		$$.selection.pie = $$.selection.group
			.append('g')
				.attr('class','d2b-pie-chart');

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

		// $$.tooltip.reset();

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
		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items:	$$.currentChartData.values.map(function(d){
						d.open = $$.persistentData.hiddenArcs[d.key];
						return d;
					})
				}
			};
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.pie
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left + $$.innerWidth/2)+','+($$.forcedMargin.top + $$.innerHeight/2)+')');

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.arcEnter();
		$$.arcUpdate();
		$$.arcExit();

		// $$.tooltip.start();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sankey chart*/
d2b.CHARTS.sankeyChart = function(){

	//private
	var $$ = {};

	//define axisChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;

	$$.generateRequired = true; //using some methods may require the chart to be redrawn

	$$.selection = d3.select('body'); //default selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	$$.legendOrientation = 'bottom';

	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();

	$$.events = d2b.UTILS.chartEvents();

	$$.currentChartData = {
			nodes:[],
			links:[]
		};

	$$.sankey = d3.sankey();
	$$.nodePadding = 30;
	$$.nodeWidth = 15;
	$$.layout = 20;

	$$.minLinkWidth = 1;

	$$.controlsData = {
		hideLegend: {
			label: "Hide Legend",
			type: "checkbox",
			visible: false,
			enabled: false
		}
	};

	$$.xFormat = function(value){return value};

	$$.nodeTooltip = function(d){
		return '<b>'+d.name+' : </b>'+$$.xFormat(d.value);
	}
	$$.linkTooltip = function(d){
		return '<b>'+d.source.name+' <i class="fa fa-arrow-right"></i> '+d.target.name+': </b>'+$$.xFormat(d.value);
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});

	chart.nodePadding = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'nodePadding');
	chart.layout = 				d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'layout');
	chart.minLinkWidth = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'minLinkWidth');

	chart.nodeTooltip = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'nodeTooltip');
	chart.linkTooltip = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'linkTooltip');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {
							nodes:[],
							links:[]
						};
			$$.generateRequired = true;
		}

		if(chartData.data.nodes){
			$$.currentChartData.nodes = chartData.data.nodes;
		}
		if(chartData.data.links){
			$$.currentChartData.links = chartData.data.links;
		}
		if(chartData.data.labels){
			$$.currentChartData.labels = chartData.data.labels;
		}
		if(chartData.data.columnHeaders){
			$$.currentChartData.columnHeaders = chartData.data.columnHeaders;
		}

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		//create svg
		$$.selection.svg = $$.selection
			.append('svg')
				.attr('class','d2b-sankey-chart d2b-svg d2b-container');

		//create group container
		$$.selection.group = $$.selection.svg.append('g');

		$$.selection.group.sankey = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey');
		$$.selection.group.sankey.links = $$.selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-links');
		$$.selection.group.sankey.nodes = $$.selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-nodes');

		$$.selection.group.labels = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey-labels');

		$$.selection.group.labels.source = $$.selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-source');

		$$.selection.group.labels.source.text = $$.selection.group.labels.source.append('text').attr('y',23);

		$$.selection.group.labels.destination = $$.selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-destination');

		$$.selection.group.labels.destination.text = $$.selection.group.labels.destination.append('text').attr('y',23);

		$$.selection.group.columnHeaders = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey-column-headers');


		//create controls container
		$$.selection.controls = $$.selection.group
			.append('g')
				.attr('class','d2b-controls');


		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});


		// //create legend container
		$$.selection.legend = $$.selection.group
			.append('g')
				.attr('class','d2b-legend');

		// //intialize new legend
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);
		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

		$$.innerWidth = $$.width - $$.forcedMargin.right - $$.forcedMargin.left;

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		// $$.forcedMargin.top += $$.controls.computedHeight();
		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;

		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items:	d3
										.set($$.currentChartData.nodes.map(function(d){
												return d.colorKey || d.name;
											}))
										.values()
										.map(function(d){return {label:d};})
				}
			};
		}

		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;
		$$.innerWidth = $$.width - $$.forcedMargin.left - $$.forcedMargin.right;

		var labelTransitions={
			source:
				$$.selection.group.labels.source
					.transition()
						.duration($$.animationDuration),
			destination:
				$$.selection.group.labels.destination
					.transition()
						.duration($$.animationDuration)
		}



		if($$.currentChartData.labels){
			$$.selection.group.labels
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
			if($$.currentChartData.labels.source){
				labelTransitions.source
						.style('opacity',1);
				$$.selection.group.labels.source.text.text($$.currentChartData.labels.source);
			}else{
				labelTransitions.source
						.style('opacity',0);
			}
			if($$.currentChartData.labels.destination){
				labelTransitions.destination
						.style('opacity',1);
				$$.selection.group.labels.destination.text.text($$.currentChartData.labels.destination);
			}else{
				labelTransitions.destination
						.style('opacity',0);
			}

			labelTransitions.source
					.attr('transform','translate('+0+','+0+')');
			labelTransitions.destination
					.attr('transform','translate('+$$.innerWidth+','+0+')');

			$$.forcedMargin.top += 35;

		}else{
			labelTransitions.source
					.style('opacity',0);
			labelTransitions.destination
					.style('opacity',0);
		}

		var columnHeader;
		var columnHeaderScale;
		if($$.currentChartData.columnHeaders && $$.currentChartData.columnHeaders.length > 0){
			columnHeaderScale = d3.scale.linear()
				.domain([0,$$.currentChartData.columnHeaders.length-1])
				.range([0,$$.innerWidth-$$.nodeWidth])

			$$.selection.group.columnHeaders
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

			columnHeader = $$.selection.group.columnHeaders.selectAll('g.d2b-sankey-column-header').data($$.currentChartData.columnHeaders);
			columnHeader.enter()
				.append('g')
					.style('opacity',0)
					.attr('transform',function(d,i){return 'translate('+(columnHeaderScale(i)+$$.nodeWidth/2)+','+0+')'})
					.attr('class','d2b-sankey-column-header')
				.append('text')
					.attr('y',16)
					.attr('x',function(d,i){
						if(i == 0)
							return -$$.nodeWidth/2;
						else if(i == $$.currentChartData.columnHeaders.length-1)
							return $$.nodeWidth/2;
					});

			columnHeader
				.select('text')
					.text(function(d){return d;});
			columnHeader
				.transition()
					.duration($$.animationDuration)
					.style('opacity',1)
					.attr('transform',function(d,i){return 'translate('+(columnHeaderScale(i)+$$.nodeWidth/2)+','+0+')'})

			columnHeader.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity', 0)
					.remove();

			$$.forcedMargin.top += 25;
		}

		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;

		$$.sankey
				.size([$$.innerWidth,$$.innerHeight])
				.nodeWidth($$.nodeWidth)
				.nodePadding($$.nodePadding)
				.nodes($$.currentChartData.nodes)
				.links($$.currentChartData.links)
				.layout($$.layout);


		var node = $$.selection.group.sankey.nodes.selectAll('g.d2b-sankey-node')
				.data($$.currentChartData.nodes.filter(function(d){return d.value;}),function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return i;
					});
		var newNode = node.enter()
			.append('g')
				.attr('class','d2b-sankey-node')
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-sankey-node');
		newNode.append('rect');
		newNode.append('text');

		var nodeText = node.select('text')
				.text(function(d){return d.shortName;});

		node
				.call(d2b.UTILS.bindTooltip, $$.nodeTooltip, function(d){return d;})
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',1);

		node
			.select('rect')
			.transition()
				.duration($$.animationDuration)
				.attr('width',$$.sankey.nodeWidth())
				.attr('height',function(d){return Math.max(0,d.dy);});
		nodeText
			.transition()
				.duration($$.animationDuration)
				.style('text-anchor',function(d){return (d.x < $$.innerWidth/2)? 'start':'end';})
				.attr('x',function(d){return (d.x < $$.innerWidth/2)? $$.sankey.nodeWidth()+5:-5;})
				.attr('y',function(d){return d.dy/2+5;})

		var link = $$.selection.group.sankey.links.selectAll('g.d2b-sankey-link')
				.data($$.currentChartData.links.filter(function(d){return d.value;}),function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else{
							return i;
						}
					});
		var newLink = link.enter()
			.append('g')
				.attr('class','d2b-sankey-link')
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-sankey-node');

		// console.log(newLink)
		newLink.append('path');
		newLink.append('text');

		link.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
		node.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();


		link
				.call(d2b.UTILS.bindTooltip, $$.linkTooltip, function(d){return d;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);

		link
			.select('path')
				.style('stroke',function(d){
						return (d.colorBy)?
										$$.color((d[d.colorBy].colorKey)?
											d[d.colorBy].colorKey
										:d[d.colorBy].name)
									:'#777';
								})
			.transition()
				.style('stroke-width',function(d){return Math.max(d.dy,$$.minLinkWidth)})
				.duration($$.animationDuration)
				.attr('d',$$.sankey.link());

		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		$$.selection.group.sankey
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sunburst chart*/
d2b.CHARTS.sunburstChart = function(){


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
	$$.currentChartData = { data: { partition:{}}};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend().color($$.color);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();

	//breacrumbs OBJ
	$$.breadcrumbs = new d2b.UTILS.breadcrumbs();
	$$.breadcrumbs.scale(6)

	//partitioned sunburst data
	$$.partitionData;

	//current root node
	$$.currentRoot;

	//new data indicator
	$$.newData = true;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	//radius scales
	$$.radius = {};

	//sunburst arc width scales
	$$.y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	//arc length scale
	$$.x = d3.scale.linear()
    .range([0, 2 * Math.PI]);


	//controls data
	$$.controlsData = {
				invert: {
					label: "Invert",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sort: {
					label: "Sort",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	// private methods

	//find the ancesstors of a given node
	$$.getAncestors = function(node) {
	  var path = [];
	  var current = node;

	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
    path.unshift(current);

	  return path;
	};

	//set arc fill color to coordinate with the closest 'top' parent
	$$.arcFill = function(d) {
		var sequence = $$.getAncestors(d).reverse();

		if(d.colorKey)
			return $$.color(d.colorKey);

		var colorSequence = [], limit = sequence.length;
		for(i=0;i<limit;i++){
			if(sequence[i].top){
				return d3.rgb(d2b.UTILS.getColor($$.color, 'name')(sequence[i])).brighter(i*0.3);
			}
		}

		return $$.color(d.name)
	};

	//on arc mouseover highlight the parent tree
	$$.arcMouseover = function(d) {

		var sequence = $$.getAncestors(d);
		//use a css class transition rather than javascript transition for performance benefit with large amounts of nodes
		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) >= 0);
	              }).classed('d2b-transparent',false);

		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) < 0);
	              }).classed('d2b-transparent',true);

		$$.updateBreadcrumbs(sequence);

	};

	//on children mouseover set tooltip
	$$.arcMouseover.children = function(d){
			$$.setSunburstTooltip(d,true);
	};

	//on parents mouseover set tooltip
	$$.arcMouseover.parents = function(d){
			$$.setSunburstTooltip(d,false);
	};

	//on sunburst mouseout reset breadcrumbs, tooltip, and arc highlighting
	$$.sunburstMouseout = function(d) {
		$$.resetBreadcrumbs();
	  $$.selection.arcs.arc.classed('d2b-transparent',false);

		$$.resetSunburstTooltip();
	};

	//reset tooltip
	$$.resetSunburstTooltip = function(){
		$$.setSunburstTooltip($$.currentRoot, false);
	};

	//set tooltip
	$$.setSunburstTooltip = function(d, showPercent){
		var tspanName = d.name;
		var tspanValue = $$.xFormat(d.value);
		if(showPercent)
			tspanValue += ' / ' + d3.format(".2%")(d.value/$$.currentRoot.value);

		$$.selection.tooltip.text.selectAll('*').remove();

		$$.selection.tooltip.text
			.append('tspan')
				.text(tspanName);
		$$.selection.tooltip.text
			.append('tspan')
				.attr('y',30)
				.attr('x',0)
				.text(tspanValue);
	};

	//on arc click change root node to clicked node and update arcs
	$$.arcClick = function(d){
		$$.currentRoot = d;
		$$.updateArcs();
	};

	//get domain functions
	$$.getZoomParentDomain = function(d){
		var cur = d;
		var domain = [1,0];
		do{
			if(domain[0] > cur.y)
				domain[0] = cur.y;
			if(domain[1] < cur.y + cur.dy)
				domain[1] = cur.y + cur.dy;
			cur = cur.parent;
		}while(cur);
		return domain;
	};

	$$.getZoomChildDomain = function(d, domain){
		if(!domain){domain = [1,0];}
		else{
			if(domain[0] > d.y)
				domain[0] = d.y;
			if(domain[1] < d.y + d.dy)
				domain[1] = d.y + d.dy;
		}

		if(d.children){
			d.children.forEach(function(child){
				return $$.getZoomChildDomain(child,domain);
			});
		}

		return domain;

	};

	//update arcs
	$$.updateArcs = function(){
		var sequence = $$.getAncestors($$.currentRoot);
		var paths = {};

		//filter parent paths
		paths.parents = $$.selection.arcs.arc.path
			.filter(function(node) {
        return (sequence.indexOf(node) >= 0);
      }).on('mouseover.updateTooltip',$$.arcMouseover.parents);


		//set scale domains
		$$.x.domain([$$.currentRoot.x,$$.currentRoot.x + $$.currentRoot.dx]);
		$$.y.parents.domain($$.getZoomParentDomain($$.currentRoot));
		$$.y.children.domain($$.getZoomChildDomain($$.currentRoot));

		var yDomain = {};

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.parents.each(function(d){
				this.newArc = {
					start: $$.x(d.x),
					end: $$.x(d.x + d.dx),
					inner: $$.y.parents(d.y),
					outer: $$.y.parents(d.y + d.dy)
				};
				if(!this.oldArc){
					this.oldArc = {
						start: this.newArc.start,
						end: this.newArc.start,
						inner: this.newArc.inner,
						outer: this.newArc.outer
					};
				}
		});

		//filter child paths
		paths.children = $$.selection.arcs.arc.path
			.filter(function(node) {
				return (sequence.indexOf(node) < 0);
			}).on('mouseover.updateTooltip',$$.arcMouseover.children);

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.children.each(function(d){

			this.newArc = {
				start: $$.x(d.x),
				end: $$.x(d.x + d.dx),
				inner: $$.y.children(d.y),
				outer: $$.y.children(d.y + d.dy)
			};

			if(!this.oldArc){
				this.oldArc = {
					start: this.newArc.start,
					end: this.newArc.start,
					inner: this.newArc.inner,
					outer: this.newArc.outer
				};
			}
		});


		//exit arcs (fade/tween out and remove)
		$$.selection.arcs.arc.exit()
			.transition()
				.duration($$.animationDuration*1.5)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d) {
					this.newArc = {
						start: this.oldArc.start,
						end: this.oldArc.start,
						inner: this.oldArc.inner,
						outer: this.oldArc.outer
					};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);

		//tween paths to new positions
		var pathTransition = $$.selection.arcs.arc.path
			.transition()
				.duration($$.animationDuration*1.5)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				// .attrTween("d", $$.arcTween);


		//update oldArc to be newArc
		pathTransition
			.each("end",function(d) {
				this.oldArc = this.newArc;
			});

	};

	$$.setupNewData = function(){
		var partition;
		$$.newData = false;

		if($$.controlsData.sort.enabled){
			partition = d3.layout.partition()
						.value(function(d) { return d.size; });
		}else{
			partition = d3.layout.partition()
						.value(function(d) { return d.size; }).sort(function(a,b){return a.index - b.index;});
		}

		$$.partitionData = partition.nodes($$.currentChartData.partition);

		var topNodes = $$.partitionData.filter(function(d){return d.top;});
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items: d3
									.set(topNodes.map(function(d){return d.name;}))
									.values()
									.map(function(d){return {label:d};})
				}
			};
		}
	};

	//reset the breadcrumbs
	$$.resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();
	};

	//save children indicies recursively for sorting/unsorting
	$$.saveIndicies = function(node){
		var i = 0;
		if(node.children){
			for(i=0;i<node.children.length;i++){
				node.children[i].index = i;
				$$.saveIndicies(node.children[i]);
			}
		}
	};

	//update the breadcrumbs based on a parent sequence
	$$.updateBreadcrumbs = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();

		var breadcrumbsSelection = $$.breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			// .attr('stroke-width',2)
			.attr('stroke-width',1.5)
			.style('fill-opacity',0.2)
			.style('stroke-opacity',0.7)
			.style('fill',function(d){return $$.arcFill(d.data);})
			.style('stroke',function(d){return d3.rgb($$.arcFill(d.data)).darker(1);});

	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
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
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});


	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
			$$.generateRequired = true;
		}
		$$.newData = true;
		$$.currentChartData = chartData.data;
		$$.saveIndicies($$.currentChartData.partition);
		$$.currentRoot = $$.currentChartData.partition;
		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst')
				.on('mouseout.d2b-mouseout', $$.sunburstMouseout);


		$$.selection.arcs = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-arcs');

		$$.selection.tooltip = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-tooltip');

		$$.selection.tooltip.text = $$.selection.tooltip
			.append('text');

		//create breadcrumbs container
		$$.selection.breadcrumbs = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst-breadcrumbs');

		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						$$.newData = true;
					}
					chart.update();
				});

		//intialize new legend
		$$.legend
			.selection($$.selection.legend);

		$$.breadcrumbs
				.selection($$.selection.breadcrumbs);

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		if($$.newData){
			$$.setupNewData();
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

		$$.selection.breadcrumbs
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+0+')');

		$$.breadcrumbs.width($$.innerWidth).update();

		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left+$$.innerWidth/2)+','+($$.forcedMargin.top+$$.innerHeight/2)+')');

		$$.radius.outer = Math.min($$.innerWidth,$$.innerHeight)/2;
		$$.radius.inner = $$.radius.outer/3;


		if(!$$.controlsData.invert.enabled){
			$$.y.children.range([$$.radius.inner + 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.outer]);
			$$.y.parents.range([$$.radius.inner, $$.radius.inner + 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}else{
			$$.y.children.range([$$.radius.outer - 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.inner]);
			$$.y.parents.range([$$.radius.outer, $$.radius.outer - 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll("g.d2b-sunburst-arc")
		    .data($$.partitionData,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return $$.getAncestors(d).map(function(d){return d.name}).join('-');
					})
		// sunburst_mouseout();
		var newArcs =	$$.selection.arcs.arc.enter().append("g")
			.attr('class','d2b-sunburst-arc')
			.style('opacity',0)
			.call($$.events.addElementDispatcher, 'main', 'd2b-arc');

		var newPaths = newArcs.append("path")
				.on('mouseover.d2b-mouseover',$$.arcMouseover);

		$$.selection.arcs.arc
			.transition()
				.duration($$.animationDuration)
				.style('opacity','');


		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
				.style('fill',$$.arcFill);

		$$.selection.arcs.arc.path
				.on('click.d2b-click',$$.arcClick)
				.classed('d2b-pointer-element',true);

		$$.updateArcs();

		$$.resetSunburstTooltip();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*table chart*/
d2b.CHARTS.tableChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	$$.tooltip = function(d){
		return "<b>"+d.label+"</b>: "+$$.xFormat(d.value);
	};

	$$.selectedRow = null;

	$$.updateSubFacts = function(row, subFacts, subFactsData, x, padding, height, showValueLabels){
		var subFact = subFacts.selectAll('g.d2b-table-subFact').data(subFactsData);

		var newSubFact = subFact.enter()
			.append('g')
				.attr('class','d2b-table-subFact');

		newSubFact.append('g').attr('class','d2b-table-subFact-chart');
		newSubFact.append('text').attr('class','d2b-table-subFact-label');

		$$.updateSubFact(subFact, x, padding, height, showValueLabels);

		subFact.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		return subFact;
	};

	$$.updateSubFact = function(subFact, x, padding, height, showValueLabels){
		subFact.select('text.d2b-table-subFact-label')
				.text(function(d){return d.label})
			.transition()
				.duration($$.animationDuration)
				.attr('y', -4)
				.attr('x',(x.rangeBand()-padding)/2)


		subFact.each(function(d){

					d.x = d3.scale.linear();

					d.x
						.domain([0, d3.sum(d.values, function(d){return d.value;})])
						.range([0, x.rangeBand()-padding]);

					var currentX = 0;
					d.values.forEach(function(value){
						value.xPos = currentX;
						value.width = d.x(value.value);
						currentX += value.width;
					});

				})

		var subFactValue = subFact.select('g').selectAll('g').data(function(d){return d.values;});

		var newSubFactValue = subFactValue.enter()
			.append('g')
				.call($$.events.addElementDispatcher, 'main', 'd2b-table-row-sub-fact');

		newSubFactValue.append('rect');
		newSubFactValue.append('text').attr('class','d2b-subFact-value-label');

		var subFactValueTransition = subFactValue
				.call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return d;})
			.transition()
				.duration($$.animationDuration);

		subFactValueTransition
			.select('rect')
				.attr('x', function(d){return d.xPos;})
				.attr('width', function(d){return d.width;})
				.attr('height', height)
				.style('fill', d2b.UTILS.getColor($$.color, 'label'));

		subFactValueTransition
			.select('text.d2b-subFact-value-label')
				.style('opacity',+showValueLabels)
				.attr('y', height/2 + 4)
				.attr('x', function(d){return d.xPos + d.width/2;})
				.text(function(d) { return d.label.substring(0, d.width / 10); });


		subFactValue.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	$$.showRow = function(){

		$$.selection.table.row = $$.selection.table.selectAll('g.d2b-table-row').data($$.currentChartData.rows);

		$$.selection.table.row.select('tspan.d2b-label').text(function(d){return d.label+' ';});
		$$.selection.table.row.select('tspan.d2b-value').text(function(d){return $$.xFormat(d.value);});

		$$.selectedRow.data = $$.selectedRow[0][0].__data__

		$$.forcedMargin.top += 20;
		$$.innerHeight = $$.outerHeight - $$.forcedMargin.top;
		var rowTransition = $$.selectedRow
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate(0,'+$$.forcedMargin.top+')'
				});

		rowTransition.select('rect.d2b-row-border')
			.attr('width',$$.innerWidth);

		rowTransition.select('rect.d2b-row-background')
			.attr('height',$$.innerHeight);

		var subFacts = $$.selectedRow.select('.d2b-table-subFacts');

		var x = d3.scale.ordinal();

		x
			.domain([0])
			.rangeBands([0, $$.innerWidth]);

		var y = d3.scale.ordinal();

		y
			.domain(d3.range(0, $$.selectedRow.data.subFacts.length))
			.rangeBands([5, $$.innerHeight]);
		$$.updateSubFacts($$.selectedRow, subFacts, $$.selectedRow.data.subFacts, x, 0, y.rangeBand()/2, true)
			.transition()
				.duration($$.animationDuration)
				.attr('transform', function(d,i){return 'translate(0,'+(y(i) + y.rangeBand()/2)+')';});
	};

	$$.showTable = function(){

		var padding = $$.innerWidth * 0.03;

		var rowHeight = $$.innerHeight / $$.currentChartData.rows.length;

		$$.selection.table.row = $$.selection.table.selectAll('g.d2b-table-row').data($$.currentChartData.rows);
		var newTableRow = $$.selection.table.row.enter()
			.append('g')
				.call($$.events.addElementDispatcher, 'main', 'd2b-table-row')
				.attr('class','d2b-table-row');

		newTableRow.append('rect')
			.attr('class', 'd2b-row-background');

		newTableRow.append('rect')
			.attr('class', 'd2b-row-border');

		var newTableRowText = newTableRow.append('text')
			.attr('class','d2b-table-row-label');

		newTableRowText.append('tspan').attr('class','d2b-label');
		newTableRowText.append('tspan').attr('class','d2b-value');

		newTableRow.append('g').attr('class', 'd2b-table-subFacts')

		var rowTransition = $$.selection.table.row
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate(0,'+(i*rowHeight + rowHeight/2)+')'
				});

		rowTransition.select('rect.d2b-row-border')
			.attr('width',$$.innerWidth)
			.attr('height',1.5)
			.attr('y',5);

		rowTransition.select('rect.d2b-row-background')
			.attr('width',$$.innerWidth)
			.attr('height',30)
			.attr('y',-22);

		var longestText = 0;

		$$.selection.table.row.select('tspan.d2b-label').text(function(d){return d.label+' ';});
		$$.selection.table.row.select('tspan.d2b-value').text(function(d){return $$.xFormat(d.value);});

		$$.selection.table.row.select('text.d2b-table-row-label')
			.each(function(){longestText = Math.max(this.getComputedTextLength(), longestText);});

		$$.selection.table.row
			.style('pointer-events','all')
			.each(function(d){
				var row = d3.select(this);
				var x = d3.scale.ordinal();
				var text = row.select('text.d2b-table-row-label');
				var subFacts = row.select('g.d2b-table-subFacts');

				if(d.subFacts.length > 0){
					text
						.transition()
							.duration($$.animationDuration)
							.style('text-anchor','start')
							.attr('x',0);
					row.style('cursor','pointer');
				}else{
					text
						.transition()
							.duration($$.animationDuration)
							.style('text-anchor','middle')
							.attr('x',$$.innerWidth/2);
					row.style('cursor','auto');
				}


				x
					.domain(d3.range(0, d.subFacts.length))
					.rangeBands([longestText + padding, $$.innerWidth + padding]);

				$$.updateSubFacts(row, subFacts, d.subFacts, x, padding, 5, false)
					.transition()
						.duration($$.animationDuration)
						.attr('transform', function(d,i){return 'translate('+x(i)+',-2)';})
			})
			.on('click.d2b-click', function(d,i){
				var elem = d3.select(this);
				if($$.selectedRow){
					$$.selectedRow = null;
				}else{

					if(d.subFacts.length > 0){
						$$.selection.table.row
								.style('pointer-events','none')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',0);
						elem
								.style('pointer-events','all');
						$$.selectedRow = elem;
						// $$.selectedRow.data = d;
					}
				}
				chart.update();

			});

	};


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		$$.currentChartData.rows.forEach(function(d){
			d.subFacts = d.subFacts || [];
		});

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
	  $$.selection.selectAll('*').remove();


	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-svg d2b-container')
				// .on('click.d2b-click',function(){
				// 	if($$.selectedFact)
				// 		$$.selectedFact = null;
				// 	chart.update();
				// });

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-table-chart');

		$$.selection.table = $$.selection.main
			.append('g')
				.attr('class','d2b-table')

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

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		if($$.selectedRow){
			$$.showRow();
		}else{
			$$.showTable();
		}

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
d2b.CHARTS.templateChart = function(){

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
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();
	//legend OBJ
	$$.legend = d2b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = d2b.UTILS.CONTROLS.controls();
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
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});

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
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

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
				.attr('class','d2b-main-chart');

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

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			//----replace array with a custom legend builder
			$$.legendData.data.items = [{'label':'item 1'},{'label':'item 2'},{'label':'item 3'},{'label':'item 4'},{'label':'item 5'},{'label':'item 6'}]
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//----chart code goes here!
		//----use innerHeight/innerWidth as the context dimensions and use forcedMargin.|left, right, top, or bottom| as the current positioning margin

		d3.timer.flush();

		//dispatch the on 'update' event, and pass it the selection object
		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.DASHBOARDS.dashboard = function(){

	//define axisChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			margin = d2b.CONSTANTS.DEFAULTMARGIN();

	var pageMargin = 210;
	var pageWidth = width - pageMargin;

	var innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

  var dashboardCategory = new d2b.UTILS.dashboardCategory();
	var chartPage = new d2b.UTILS.chartPage();
  var controls = new d2b.UTILS.CONTROLS.htmlControls();

	var sectionsByKey = {};

	var controlsHidden = false;
	var navigationHidden = false;

	var navigationHistory = {};
	navigationHistory.array = [];
	navigationHistory.position = -1;
	navigationHistory.pushNew = function(value){
		navigationHistory.array = navigationHistory.array
				.slice(0,navigationHistory.position+1);

		navigationHistory.position++;
		navigationHistory.array.push({category:value.category,section:value.section});
	};
	var current = {section:{}, category:{}};

	var currentPage = {};

	var resized = true;

	// var controls = {
	// 		};

	// var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentDashboardData = {
			};

	var palette = d2b.CONSTANTS.DEFAULTPALETTE;

	var traversePages = function(pages, categoryName, sectionName){
		pages.forEach(function(page, i){
			page.categoryName = categoryName;
			page.sectionName = sectionName;
			page.index = i;

		});
	};

	var traverseCategories = function(categories, sectionName){
		if(categories){
			categories.forEach(function(cat){
				cat.sectionName = sectionName;

				if(!cat.pages){
					cat.pages = [];
				}

				traversePages(cat.pages, cat.name, cat.sectionName);

			});
		}
	};
	var traverseSections = function(position,sections,sectionGroup){
		sections.forEach(function(section){
			if(section.key)
				sectionsByKey[section.key] = section;
			traverseCategories(section.categories, section.name);
			section.position = position.concat([{section:section, sectionGroup: sectionGroup}]);
			if(section.sections)
				traverseSections(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sections);
			if(section.sectionGroups)
				traverseSectionGroups(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sectionGroups);
		});
	};
	var traverseSectionGroups = function(position,sectionGroups){
		sectionGroups.forEach(function(sectionGroup){
			if(sectionGroup.sections)
				traverseSections(position,sectionGroup.sections,sectionGroup);
		});
	};
	var dashboardLayout = function(data){
		traverseSections([],[data.dashboard.topSection]);
	};

	var resetSubSectionGroupBreadcrumbs = function(){
		selection.container.header.breadcrumbs.svg.selectAll('.d2b-breadcrumb-sub-section-group-section')
			.transition()
				.duration(animationDuration/2)
				.style('opacity',0);
		selection.container.header.breadcrumbs.svg.selectAll('.d2b-breadcrumb').each(function(){this.expanded = false;});
		selection.container.header.breadcrumbs.svg.style('height','28px');
	};

	var updateBreadcrumbs = function(){
		//breadcrumb indention
		var breadcrumbIndentSize = 7;

		//set breadcrumb data keyed by the section name
		var breadcrumb = selection.container.header.breadcrumbs.svg.selectAll('g.d2b-breadcrumb').data(current.section.position,function(d){return d.section.name;});

		//enter new breadcrumbs
		var newBreadcrumb = breadcrumb.enter()
			.append('g')
				.style('opacity',0)
				.attr('class','d2b-breadcrumb');


		//init new breadcrumb path and text
		newBreadcrumb.append('path').attr('class','d2b-breadcrumb-background');

		newBreadcrumb.append('path').attr('class','d2b-breadcrumb-foreground');

		newBreadcrumb
			.append('text')
				.text(function(d){return d.section.name;})
				.attr('y',17)
				.attr('x',15);

		//iterate through all breadcrumbs
		breadcrumb.each(function(d,i){
			//save this obj
			var _breadcrumb = this;
			var elem = d3.select(_breadcrumb);
			var text = elem.select('text');
			var foreground = elem.select('path.d2b-breadcrumb-foreground');
			var background = elem.select('path.d2b-breadcrumb-background');

			//set breadCrumb path width according to text width
			var pathWidth = text.node().getBBox().width+25;
			var triangle;

			elem.select('g.d2b-breadcrumb-triangle').remove();
			//if section is part of a sectionGroup add sub-section dropdown

			if(d.section != current.section){
				elem
						.classed('d2b-innactive',false)
						.on('click.d2b-click',function(d){
							changeCurrentSection(d.section);
						});
			}else{
				elem
						.classed('d2b-innactive',true)
						.on('click.d2b-click',null);
			}
			if(d.sectionGroup){

				//set data for sub-section, omitting the selected section
				var sectionBreadcrumb = elem.selectAll('g.d2b-breadcrumb-sub-section-group-section')
						.data(d.sectionGroup.sections.filter(function(dd){return dd!=d.section;}));

				//init breadcrumb dyExpanded and expanded flags
				_breadcrumb.dyExpanded = 0;
				_breadcrumb.expanded = false;

				//enter breadcrumb group, path, and text
				var newSectionBreadcrumb = sectionBreadcrumb.enter()
					.append('g')
						.style('opacity',0)
						.attr('class','d2b-breadcrumb-sub-section-group-section');
				newSectionBreadcrumb.append('path').attr('class','d2b-breadcrumb-background');
				newSectionBreadcrumb.append('path').attr('class','d2b-breadcrumb-foreground');
				newSectionBreadcrumb.append('text')
					.attr('y',17)
					.attr('x',15)
					.text(function(d){return d.name;});

				//iterate through sub-section breadcrumbs
				sectionBreadcrumb.each(function(d){
							var elem = d3.select(this);
							var foreground = elem.select('path.d2b-breadcrumb-foreground');
							var background = elem.select('path.d2b-breadcrumb-background');
							var text = elem.select('text');
							var pathWidth = text.node().getBBox().width+25;
							foreground
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z')
								.attr('transform','translate(4,0)');
							background
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z');
						}).on('click.d2b-click',function(d){
							d3.event.stopPropagation();
							changeCurrentSection(d);
						})
						.attr('transform',function(d,i){return 'translate(0,'+(28*(i+1))+')';});

				//set dyExpanded to be the max size of the dropdown
				_breadcrumb.dyExpanded = (32*(sectionBreadcrumb.size()+5));

				//add triangle under sectionGroup breadcrumb
				pathWidth += 15;
				triangle = elem.append('g')
						.attr('class','d2b-breadcrumb-triangle')
						.on('click.d2b-click',function(){
							d3.event.stopPropagation();
							if(!_breadcrumb.expanded){
								resetSubSectionGroupBreadcrumbs();
								selection.container.header.breadcrumbs.svg
										.style('height',Math.max(25,_breadcrumb.dyExpanded)+'px');
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.delay(function(d,i){return i*20;})
										.style('opacity',1);
							}else{
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.style('opacity',0);
								selection.container.header.breadcrumbs.svg
										.style('height',27+'px');
							}
							_breadcrumb.expanded = !_breadcrumb.expanded;
						});
				triangle.append('rect')
						.attr('width',20)
						.attr('height',24)
						.attr('y',0.5)
						// .style('fill',d3.rgb(palette.primary).darker(2))
						.attr('transform','translate('+(pathWidth-20)+',0)');
				triangle.append('path')
						.attr('d','M 0 0 L 9 0 L 4.5 5 L 0 0 Z')
						.attr('transform','translate('+(pathWidth-15)+',11)');
			}else{

			}

			//draw breadcrumb path, making note of start and end breadcrumbs
			var startIndent = breadcrumbIndentSize;
			var endIndent = breadcrumbIndentSize;
			if(i == 0)
				startIndent = 0;
			if(i+1 == breadcrumb.size())
				endIndent = 0;

			foreground
				.transition()
					.duration(animationDuration)
					.attr('transform','translate(4,0)')
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			background
				.transition()
					.duration(animationDuration)
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			this.dx = pathWidth;
		});

		//position breadcrumbs
		var xCurrent = 0;
		breadcrumb
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){
					var translation = 'translate('+xCurrent+',1)';
					xCurrent += this.dx + 7;
					return translation;
				})
				.style('opacity',1);

		//fade out exiting breadcrumbs
		breadcrumb.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

	};
	var updateCategoryTabs = function(){

		var categoryTab = selection.container.header.navigation.categoryTabs.selectAll('li.d2b-category-tab').data(current.section.categories);
		categoryTab.enter()
			.append('li')
				.attr('class','d2b-category-tab')
				.on('click.d2b-click',changeCurrentCategory);
		categoryTab
			.text(function(d){return d.name;})
			.each(function(d){
				if(d==current.category){
					d3.select(this)
							.classed('d2b-innactive',true)
							.on('click.d2b-click',null);
				}else{
					d3.select(this)
							.classed('d2b-innactive',false)
							.on('click.d2b-click',changeCurrentCategory);
				}
			});
			categoryTab.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();


	};
	var updateSubSections = function(){

		var subSection = selection.container.sidebar.subSections.selectAll('li.d2b-sub-section').data(current.section.sections);

		subSection.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d2b-sub-section')
				.on('click.d2b-click',changeCurrentSection);

		subSection
				.text(function(d){return d.name})
			.transition()
				.duration(animationDuration)
				.style('opacity',1);

		subSection.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};
	var updateSubSectionGroups = function(){

		var subSectionGroupData = current.section.sectionGroups.filter(function(d){return d.sections.length > 0;});

		var subSectionGroup = selection.container.sidebar.subSectionGroups.selectAll('li.d2b-sub-section-group').data(subSectionGroupData);

		subSectionGroup.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d2b-sub-section-group');

		subSectionGroup
			.transition()
				.duration(animationDuration)
				.style('opacity',1);

		subSectionGroup
				.text(function(d){return d.name})
				.each(makeSubSectionGroupSections);

		subSectionGroup.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};
	var makeSubSectionGroupSections = function(d){
		if(!d.sections || d.sections.length < 1)
			return;
		var elem = d3.select(this);
		elem.selectAll('*').remove();
		var subSectionGroupSections = elem
			.append('ul')
				.datum(d)
				.attr('class','d2b-sub-section-group-sections');

		var subSectionGroupSection = subSectionGroupSections.selectAll('li.d2b-sub-section-group-section').data(function(dd){return dd.sections;});

		subSectionGroupSection.enter()
			.append('li')
				.attr('class','d2b-sub-section-group-section');

		subSectionGroupSection
				.on('click.d2b-click',changeCurrentSection);

		subSectionGroupSection
				.text(function(d){return d.name;});
	};

	var changeCurrentSection = function(d){
		resetSubSectionGroupBreadcrumbs();

		current.section = d;

		if(!current.section.sections)
			current.section.sections = [];

		if(!current.section.sectionGroups)
			current.section.sectionGroups = [];

		if(!current.section.categories)
			current.section.categories = [];

		var newCategory = d.categories.filter(function(d){return d.name == current.category.name;});
		if(newCategory.length > 0){
			return changeCurrentCategory(newCategory[0]);
		}else{
			return changeCurrentCategory(d.categories[0]);
		}
	};
	var ii=0;
	var changeCurrentCategory = function(d){
		current.category = d;
		navigationHistory.pushNew(current);
		/////Work on proper push/pop/find state later
		// history.pushState({},'','?category='+(current.category.name)+'&section='+(current.section.name))
		dashboardCategory
				.animateFrom('right')
				.data({data:current.category});
		resized = true;
		return dashboard.update();
	};

	var dashboard = {};

	//members that will set the regenerate flag
	dashboard.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return dashboard;
	};
	dashboard.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return dashboard;
	};

	//methods that require update
	dashboard.width = function(value){
		if(!arguments.length) return width;
		width = value;
		pageWidth = width - 210;
		dashboardCategory.width(pageWidth);
		chartPage.width(pageWidth);
		resized = true;
		return dashboard;
	};

	dashboard.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return dashboard;
	};

	dashboard.palette = function(value){
		if(!arguments.length) return palette;
		palette = value;
		return dashboard;
	};

	dashboard.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		dashboardCategory.animationDuration(animationDuration);

		return dashboard;
	};

	dashboard.data = function(dashboardData, reset){
		if(!arguments.length) return animationDuration;
		if(reset){
			generateRequired = true;
			currentDashboardData = {};
		}

		currentDashboardData = dashboardData;
		dashboardLayout(currentDashboardData);

		return dashboard;
	}

	//generate chart
	dashboard.generate = function(callback) {
		generateRequired = false;
		// resized = false;
		//clean container
		selection.selectAll('*').remove();

		//create container
		selection.container = selection
			.append('div')
				.attr('class','d2b-dashboard d2b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d2b-header');

		selection.container.header.navigation = selection.container.header
			.append('div')
				.attr('class','d2b-navigation');

		selection.container.header.navigation.home = selection.container.header.navigation
			.append('div')
				.attr('class','d2b-navigation-home');

		selection.container.header.navigation.home.append('i').attr('class','fa fa-home')

		selection.container.header.navigation.arrows = selection.container.header.navigation
			.append('div')
				.attr('class','d2b-navigation-arrows');

		selection.container.header.navigation.arrows.left = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d2b-left-arrow');

		selection.container.header.navigation.arrows.right = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d2b-right-arrow');

		selection.container.header.navigation.arrows.left.append('i').attr('class','fa fa-chevron-left')

		selection.container.header.navigation.arrows.right.append('i').attr('class','fa fa-chevron-right')

		selection.container.header.navigation.categoryTabs = selection.container.header.navigation
			.append('ul')
				.attr('class','d2b-category-tabs');

		selection.container.header.navigation.logo = selection.container.header.navigation
			.append('img')
				.attr('class','d2b-dashboard-logo');

		selection.container.header.breadcrumbs = selection.container.header
			.append('div')
				.attr('class','d2b-dashboard-breadcrumbs');

		selection.container.header.breadcrumbs.svg = selection.container.header.breadcrumbs
			.append('svg')
				.attr('class','d2b-dashboard-breadcrumbs-svg');

		selection.container.sidebar = selection.container
			.append('div')
				.attr('class','d2b-dashboard-sidebar');


		selection.container.sidebar.sectionNav = selection.container.sidebar
			.append('div')
				.attr('class','d2b-sidebar-section-nav d2b-sidebar-container');

		selection.container.sidebar.sectionsHeader = selection.container.sidebar.sectionNav
			.append('div')
				.attr('class','d2b-sidebar-header')
				.text('Go To');

		selection.container.sidebar.subSections = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d2b-sub-sections');

		selection.container.sidebar.subSectionGroups = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d2b-sub-section-groups');

		selection.container.sidebar.filters = selection.container.sidebar
			.append('div')
				.attr('class','d2b-sidebar-filters d2b-sidebar-container');

		selection.container.sidebar.filtersHeader = selection.container.sidebar.filters
			.append('div')
				.attr('class','d2b-sidebar-header')
				.text('Filter By');

		controls.selection(selection.container.sidebar.filters)
			.on('change',function(d){
				resized = true;
				dashboard.update();
			});

		selection.container.content = selection.container
			.append('div')
				.attr('class','d2b-dashboard-content');

		selection.container.content.dashboardCategory = selection.container.content
			.append('div')
				.attr('class','d2b-dashboard-category');

		// selection.container.content.chartPage = selection.container.content
		// 	.append('div')
		// 		.attr('class','d2b-chart-page-container');

		dashboardCategory
			.selection(selection.container.content.dashboardCategory)
			.on('page-change.d2b-page-change',function(pageData, iOld, iNew){
// console.log('page change!')
				var temp = controlsHidden;
				if(!pageData.controls)
					pageData.controls = [];
				if(pageData.controls.length > 0){
					controlsHidden = false;
					selection.container.sidebar.filters.style('display', 'block');
				}else{
					controlsHidden = true;
					selection.container.sidebar.filters.style('display', 'none');
				}

				controls
					.data(pageData)
					.update(function(){
					});
				var animateFrom = null;
				if(iOld < iNew)
					animateFrom = 'right';
				else if(iNew < iOld)
					animateFrom = 'left';
				// console.log('hi')
				chartPage
					.selection(dashboardCategory.chartPageSelection())
					.data(pageData)
					.animateFrom(animateFrom)
					.update(function(){
						if(temp != controlsHidden){
							dashboard.update();
						}
					})
					.animateFrom(null);

			});

		changeCurrentSection(currentDashboardData.dashboard.topSection);

		dashboard.update(callback);

		return dashboard;
	};

	//update chart
	dashboard.update = function(callback){
		//if generate required call the generate method
		if(generateRequired){
			return dashboard.generate(callback);
		}

		//if home, make home button innactive: else setup home button
		if(current.section == currentDashboardData.dashboard.topSection){
			selection.container.header.navigation.home
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null);
		}else{
			selection.container.header.navigation.home
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						changeCurrentSection(currentDashboardData.dashboard.topSection);
					});
		}

		//if at the end of navigationHistory make right arrow innactive: else setup right arrow
		if(navigationHistory.position+1 == navigationHistory.array.length){
			selection.container.header.navigation.arrows.right
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null);
		}else{
			selection.container.header.navigation.arrows.right
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						resized = true;
						navigationHistory.position++;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('right')
								.data({data:current.category});
						dashboard.update();
					});
		}

		//if at the beginning of navigationHistory make left arrow innactive: else setup left arrow
		if(navigationHistory.position == 0){
			selection.container.header.navigation.arrows.left
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null)
		}else{
			selection.container.header.navigation.arrows.left
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						resized = true;
						navigationHistory.position--;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('left')
								.data({data:current.category});
						dashboard.update();
					});
		}

		//set container width
		selection.container
			.transition()
				.delay(animationDuration)
				.duration(animationDuration)
				.style('width', width+'px');

		//update tabs and breadcrumbs
		updateCategoryTabs();
		updateBreadcrumbs();

		//if there are no section/sectionGroups hide navigation: else show it
		if(current.section.sections.length == 0 && current.section.sectionGroups.length == 0){
			navigationHidden = true;
			selection.container.sidebar.sectionNav
				.style('display','none');
			}
		else{
			navigationHidden = false;
			selection.container.sidebar.sectionNav
				.style('display','block');
		}

		//update subSections and subSectionGroups
		updateSubSections();
		updateSubSectionGroups();

		//if no controls and navigation hidden, resize container content
		if(controlsHidden && navigationHidden){
			pageMargin = 10;
		}else{
			pageMargin = 210
		}

		pageWidth = width - pageMargin;

		selection.container.content
			.style('width',pageWidth+'px');

		selection.container.content
			.transition()
				.duration(animationDuration)
				.style('margin-left', pageMargin - 10 + 'px');

		//if the dashboard has been resized update the dashboardCategory and chartPage
		if(resized){
			// console.log('hi2')
			resized = false;
			dashboardCategory
				.width(pageWidth)
				.update()
				.animateFrom(null);
			chartPage
				.width(pageWidth)
				.update();
		}

		d3.timer.flush();

		if(callback){
			callback();
		}

		return dashboard;
	};

	return dashboard;

};

// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
var colorbrewer = {YlGn: {
3: ["#f7fcb9","#addd8e","#31a354"],
4: ["#ffffcc","#c2e699","#78c679","#238443"],
5: ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
6: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],
7: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
8: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
9: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]
},YlGnBu: {
3: ["#edf8b1","#7fcdbb","#2c7fb8"],
4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
9: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
},GnBu: {
3: ["#e0f3db","#a8ddb5","#43a2ca"],
4: ["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],
5: ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
6: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],
7: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
8: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
9: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]
},BuGn: {
3: ["#e5f5f9","#99d8c9","#2ca25f"],
4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
9: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]
},PuBuGn: {
3: ["#ece2f0","#a6bddb","#1c9099"],
4: ["#f6eff7","#bdc9e1","#67a9cf","#02818a"],
5: ["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
6: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],
7: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
8: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
9: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]
},PuBu: {
3: ["#ece7f2","#a6bddb","#2b8cbe"],
4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
},BuPu: {
3: ["#e0ecf4","#9ebcda","#8856a7"],
4: ["#edf8fb","#b3cde3","#8c96c6","#88419d"],
5: ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
6: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],
7: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
8: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
9: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]
},RdPu: {
3: ["#fde0dd","#fa9fb5","#c51b8a"],
4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
9: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]
},PuRd: {
3: ["#e7e1ef","#c994c7","#dd1c77"],
4: ["#f1eef6","#d7b5d8","#df65b0","#ce1256"],
5: ["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
6: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],
7: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
8: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
9: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]
},OrRd: {
3: ["#fee8c8","#fdbb84","#e34a33"],
4: ["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],
5: ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
6: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],
7: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
8: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
9: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]
},YlOrRd: {
3: ["#ffeda0","#feb24c","#f03b20"],
4: ["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],
5: ["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
6: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],
7: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
8: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
9: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]
},YlOrBr: {
3: ["#fff7bc","#fec44f","#d95f0e"],
4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
},Purples: {
3: ["#efedf5","#bcbddc","#756bb1"],
4: ["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],
5: ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
6: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],
7: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
8: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
9: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]
},Blues: {
3: ["#deebf7","#9ecae1","#3182bd"],
4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
},Greens: {
3: ["#e5f5e0","#a1d99b","#31a354"],
4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
},Oranges: {
3: ["#fee6ce","#fdae6b","#e6550d"],
4: ["#feedde","#fdbe85","#fd8d3c","#d94701"],
5: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
6: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],
7: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
8: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
9: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]
},Reds: {
3: ["#fee0d2","#fc9272","#de2d26"],
4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
},Greys: {
3: ["#f0f0f0","#bdbdbd","#636363"],
4: ["#f7f7f7","#cccccc","#969696","#525252"],
5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
},PuOr: {
3: ["#f1a340","#f7f7f7","#998ec3"],
4: ["#e66101","#fdb863","#b2abd2","#5e3c99"],
5: ["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
6: ["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],
7: ["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],
8: ["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],
9: ["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],
10: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],
11: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]
},BrBG: {
3: ["#d8b365","#f5f5f5","#5ab4ac"],
4: ["#a6611a","#dfc27d","#80cdc1","#018571"],
5: ["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
6: ["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],
7: ["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],
8: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],
9: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],
10: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],
11: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]
},PRGn: {
3: ["#af8dc3","#f7f7f7","#7fbf7b"],
4: ["#7b3294","#c2a5cf","#a6dba0","#008837"],
5: ["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
6: ["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],
7: ["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],
8: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
9: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
10: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],
11: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]
},PiYG: {
3: ["#e9a3c9","#f7f7f7","#a1d76a"],
4: ["#d01c8b","#f1b6da","#b8e186","#4dac26"],
5: ["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
6: ["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],
7: ["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],
8: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
9: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
10: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],
11: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]
},RdBu: {
3: ["#ef8a62","#f7f7f7","#67a9cf"],
4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
},RdGy: {
3: ["#ef8a62","#ffffff","#999999"],
4: ["#ca0020","#f4a582","#bababa","#404040"],
5: ["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
6: ["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],
7: ["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]
},RdYlBu: {
3: ["#fc8d59","#ffffbf","#91bfdb"],
4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
},Spectral: {
3: ["#fc8d59","#ffffbf","#99d594"],
4: ["#d7191c","#fdae61","#abdda4","#2b83ba"],
5: ["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
6: ["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],
7: ["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],
8: ["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],
9: ["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],
10: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
11: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
},RdYlGn: {
3: ["#fc8d59","#ffffbf","#91cf60"],
4: ["#d7191c","#fdae61","#a6d96a","#1a9641"],
5: ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
6: ["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],
7: ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],
8: ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
9: ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
},RdGn: {
7: ["#e71007","#c71007","#a71007","#871007","#888","#1a8850","#1aa850","#1ac850","#1ae850"]
},Accent: {
3: ["#7fc97f","#beaed4","#fdc086"],
4: ["#7fc97f","#beaed4","#fdc086","#ffff99"],
5: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],
6: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],
7: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],
8: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]
},Dark2: {
3: ["#1b9e77","#d95f02","#7570b3"],
4: ["#1b9e77","#d95f02","#7570b3","#e7298a"],
5: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],
6: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],
7: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],
8: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]
},Paired: {
3: ["#a6cee3","#1f78b4","#b2df8a"],
4: ["#a6cee3","#1f78b4","#b2df8a","#33a02c"],
5: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
6: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],
7: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],
8: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],
9: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
10: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],
11: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],
12: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
},Pastel1: {
3: ["#fbb4ae","#b3cde3","#ccebc5"],
4: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],
5: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
6: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],
7: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],
8: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],
9: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]
},Pastel2: {
3: ["#b3e2cd","#fdcdac","#cbd5e8"],
4: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],
5: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],
6: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],
7: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],
8: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
},Set1: {
3: ["#e41a1c","#377eb8","#4daf4a"],
4: ["#e41a1c","#377eb8","#4daf4a","#984ea3"],
5: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],
6: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],
7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
8: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
9: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
},Set2: {
3: ["#66c2a5","#fc8d62","#8da0cb"],
4: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],
5: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
6: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],
7: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],
8: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
},Set3: {
3: ["#8dd3c7","#ffffb3","#bebada"],
4: ["#8dd3c7","#ffffb3","#bebada","#fb8072"],
5: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],
6: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],
7: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],
8: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],
9: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],
10: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],
11: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],
12: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
}};

d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

d2b.MATH = {};

//  mean, median, mode, midpoint, and range are usefull in hierarchical positioning
//  where the position of the parent nodes are relative to their leaf nodes
//  by the chosen statistical metric

d2b.MATH.mean = function(arr, value, weight){
  var totalWeight = 0, contribution = 0;
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});
  arr
    .filter(function(a){
      return !isNaN(d2b.number(weight(a))) && !isNaN(d2b.number(value(a)));
    })
    .forEach(function(item){
      var w = weight(item), v = value(item);
      totalWeight += w;
      contribution += v * w;
    });
  if(arr.length && totalWeight) return contribution / totalWeight;
};
d2b.MATH.median = function(arr, value, weight){
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});

  var medians = [],
      midWeight;

  var newArray = arr
    .filter(function(a){
      return weight(a) !== 0 && !isNaN(d2b.number(weight(a))) && !isNaN(d2b.number(value(a)));
    })
    .sort(function(a,b){return d3.ascending(value(a), value(b))});

  midWeight = Math.round(d3.sum(newArray, function(item){return weight(item);})/2 * 1e12) / 1e12;

  var currentPosition = 0;
  var getNext = false;

  newArray.forEach(function(item){
    if(getNext){
      medians.push(value(item));
      getNext = false;
    }

    currentPosition += weight(item);

    if(currentPosition === midWeight){
      medians.push(value(item));
      getNext = true;
    }

    if(currentPosition > midWeight && medians.length === 0){
      medians.push(value(item));
    }
  });

  if(arr.length) return d2b.MATH.mean(medians);
};
d2b.MATH.mode = function(arr, value, weight){
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});

  var modes = [], maxFrequency = 0, frequencies = {};

  arr.forEach(function(item){
    var val = d2b.number(value(item));
    if(isNaN(value(item))) return;
    frequencies[val] = frequencies[val] || 0;
    frequencies[val] += weight(item);

    if(frequencies[val] > maxFrequency){
      maxFrequency = frequencies[value(item)];
      modes = [value(item)];
    }else if(frequencies[value(item)] == maxFrequency){
      modes.push(value(item));
    }
  });

  if(arr.length) return d2b.MATH.mean(modes);
};
d2b.MATH.midpoint = function(arr, value){
  value = d3.functor(value || function(d){return d;});
  if(arr.length) return d3.mean(d3.extent(arr, value));
};
d2b.MATH.range = function(arr, value){
  value = d3.functor(value || function(d){return d;});
  var extent = d3.extent(arr, value);
  if(arr.length) return extent[1] - extent[0];
};

//----

d2b.MATH.toRadians = function(angle) {
  return angle * (Math.PI / 180);
};
d2b.MATH.toDegrees = function(angle) {
  return angle * (180 / Math.PI);
};

d2b.slides = function(){
  var $$ = {};

  var slides = function(){

  };

  slides.add = function(){

  };
  
  slides.remove = function(){

  };

  slides.next = function(){

  };

  slides.previous = function(){

  };

  slides.stop = function(){

  };

  slides.stop = function(){

  };

  slides.restart = function(){

  };

  slides.goTo = function(){

  };

};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/* Provides a pre-built 2D axis. Optional labels/axis-orientation/second x-axis/second y-axis etc.. are supported */
d2b.SVG.axis = function(){
  var $$ = {};

  $$.innerTickSize = 5;

  $$.padding = {top:0,bottom:0,left:0,right:0};

  //init dimensions
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

  //init axes
  $$.x = {key:'x', axis: d3.svg.axis(), orientation: 'bottom-outside', hidden:false, labelOrientation: 'outside'};
  $$.y = {key:'y', axis: d3.svg.axis(), orientation: 'left-outside', hidden:false, labelOrientation: 'outside'};
  $$.x2 = {key:'x2', axis: d3.svg.axis(), orientation: 'top-outside', hidden:true, labelOrientation: 'outside'};
  $$.y2 = {key:'y2', axis: d3.svg.axis(), orientation: 'right-outside', hidden:true, labelOrientation: 'outside'};

  $$.axisKeys = ['x','y','x2','y2'];

  //init event object
	$$.events = d2b.UTILS.customEvents();

  $$.updateScaleRange = function(scale, range){
    //if oridnal scale set rangeBands, else set range
    if(scale.rangeBand){
      scale.rangeBands(range);
    }else{
      scale.range(range);
    }
  };

  $$.getMaxTickBox = function(axis){
    //create test-axis, find the maximum tick-size,
    var test = d3.select('body')
      .append('svg')
        .attr('class', 'd2b-axis')
        .style('opacity', 0);

    var maxTickBox = {width:0,height:0};
    test
      .call(axis)
      .selectAll('.tick text')
      .each(function(d){
        var box = this.getBBox();
        maxTickBox.width = Math.max(maxTickBox.width, box.width);
        maxTickBox.height = Math.max(maxTickBox.height, box.height);
      });

    test.remove();

    return maxTickBox;
  };

  $$.getLabelHeight = function(classAlt){
    //create test-label, find the rendered height,
    var testSvg = d3.select('body')
      .append('svg').attr('class','d2b-axis');
    var testText = testSvg
      .append('text')
        .attr('class', 'd2b-axis-label '+classAlt)
        .text('Test')
        .style('opacity', 0);
    var height = parseInt(window.getComputedStyle(testText.node()).fontSize, 10);
    testSvg.remove();
    return height;
  };

  $$.initOridinalRanges = function(){
    //fix for ordinal NAN bug, init rangeBand to [0,1]
    $$.axisKeys.forEach(function(_axis){
      var scale = $$[_axis].axis.scale();
      if(scale.rangeBand){
        scale.rangeBands([0,1]);
      }
    });
  };
  $$.initOridinalRanges();

  $$.updateScale = function(d){
    //update axis -> scale range
    var scale = d.axis.scale();
    var orientation = d.orientation;
    orientation = orientation.split('-');
    var side = orientation[0];
    if(side === 'right' || side === 'left'){
      $$.updateScaleRange(scale, [$$.innerHeight, 0]);
    }else{
      $$.updateScaleRange(scale, [0, $$.innerWidth]);
    }
  };

  $$.denoteOriginTicks = function(){
    //add origin class to any nodes with a 0 tick value
		this.selectAll('.tick text')
			.each(function(d){
				if(parseFloat(this.textContent) === 0)
					d3.select(this.parentNode).classed('d2b-origin-tick', true)
				else
					d3.select(this.parentNode).classed('d2b-origin-tick', false)
			})
	};

  $$.updateGrid = function(d){
    //update the background grid
    var transition = d3.transition(d3.select(this));
    var grid = d.axis;
    var orientation = d.orientation;
    orientation = orientation.split('-');
    var side = orientation[0];
    var scale = grid.scale();

    var range;

    if(side === 'top' || side === 'bottom'){
      grid.orient('top').tickSize(-$$.innerHeight);
    }else{
      grid.orient('left').tickSize(-$$.innerWidth);
    }

    transition
      .call(grid)
      .call($$.denoteOriginTicks)
      .style('opacity', 1);
  };

  $$.updateAxis = function(d){
    var transition = d3.transition(d3.select(this));
    var _axis = d.axis;
    var width = $$.innerWidth;
    var height = $$.innerHeight;

    var scale = _axis.scale();
    var transform = 'translate(0,0)';

    _axis.tickSize($$.innerTickSize);

    var range;
    //switch on axis orientation
    switch (d.orientation) {
      case "left-inside":
        _axis.orient('right');
        break;
      case "left-outside":
        _axis.orient('left');
        break;
      case "right-inside":
        _axis.orient('left');
        transform = 'translate('+width+',0)';
        break;
      case "right-outside":
        _axis.orient('right');
        transform = 'translate('+width+',0)';
        break;
      case "top-inside":
        _axis.orient('bottom');
        break;
      case "top-outside":
        _axis.orient('top');
        break;
      case "bottom-inside":
        _axis.orient('top');
        transform = 'translate(0,'+height+')';
        break;
      case "bottom-outside":
        _axis.orient('bottom');
        transform = 'translate(0,'+height+')';
        break;
      default:
        _axis.orient('bottom');
        transform = 'translate(0,'+height+')';
    }

    transition
      .call(_axis)
      .call($$.denoteOriginTicks)
      .style('opacity', 1)
      .attr('transform',transform);

  };

  $$.updateLabelInside = function(d){
    var elem = d3.select(this);

    var transition = d3.transition(elem);
    var transform = '';

    var heightInside = $$.labelHeightInside;
    var heightOutside = $$.labelHeightOutside * 0.75;

    switch (d.orientation.split('-')[0]) {
      case "left":
        transform = 'translate('+heightInside+',5), rotate(-90)';
        break;
      case "right":
        transform = 'translate('+(-5)+',5), rotate(-90)';
        break;
      case "top":
        transform = 'translate('+($$.innerWidth-5)+','+heightInside+')';
        break;
      case "bottom":
        transform = 'translate('+($$.innerWidth-5)+',-5)';
        break;
      default:
        transform = 'translate(0,'+0+')';
    }

    transition
      .attr('transform', transform)
      .text(d.labelInside || '');
  };

  $$.updateLabelOutside = function(d){
    var elem = d3.select(this);

    var transition = d3.transition(elem);
    var transform = '';

    var heightInside = $$.labelHeightInside;
    var heightOutside = $$.labelHeightOutside * 0.75;

    var orientation = d.orientation.split('-')[0] + "-" + d.labelOrientation;
    switch (orientation) {
      case "left-outside":
        transform = 'translate('+(-$$.padding.left + heightOutside )+','+$$.innerHeight/2+'), rotate(-90)';
        break;
      case "right-outside":
        transform = 'translate('+($$.padding.right)+','+$$.innerHeight/2+'), rotate(-90)';
        break;
      case "top-outside":
        transform = 'translate('+($$.innerWidth/2)+','+(-$$.padding.top + heightOutside)+')';
        break;
      case "bottom-outside":
        transform = 'translate('+($$.innerWidth/2)+','+($$.padding.bottom)+')';
        break;
      default:
        transform = 'translate(0,'+0+')';
    }

    transition
      .attr('transform', transform)
      .text(d.labelOutside || '');

  };

  $$.setPadding = function(orientation, padding){
    //if new padding is greater than current, update it
    $$.padding[orientation] = Math.max($$.padding[orientation],padding);
  };

  $$.updatePadding = function(){
    //update the padding object
    var orientation;
    var box;
    var labelHeight;
    //buffer multiplier for the sides
    var sideBuffer = 1.25;

    //if custom padding defined use that, else estimate based on tick sizes
    if($$.customPadding){
      $$.padding = $$.customPadding;
    }else{
      //estimate padding to allow for tick sizes
      $$.padding = {top:0,bottom:0,left:0,right:0};
      $$.axesVisible.forEach(function(_axis){
        //split orientationation
        orientation = _axis.orientation.split('-');
        //get largest axis tick box
        box = $$.getMaxTickBox(_axis.axis);
        //account for half of the padding to make room for ticks close to the corners of the axis
        $$.setPadding('top', box.height/2); $$.setPadding('bottom', box.height/2);
        $$.setPadding('left', box.width/2); $$.setPadding('right', box.width/2);
        //add the max tick width or height to the appropriate padding side
        if(orientation[1] === 'outside'){
          if(orientation[0] === 'right' || orientation[0] === 'left'){
            $$.setPadding(orientation[0], sideBuffer * box.width + $$.innerTickSize);
          }else if(orientation[0] === 'top' || orientation[0] === 'bottom'){
            $$.setPadding(orientation[0], box.height + $$.innerTickSize);
          }
        }

        if(_axis.labelOutside){
          $$.padding[orientation[0]] += $$.labelHeightOutside * 1.1;
        }

      });
    }
  };

  $$.updateTickCounts = function(width, height){
    var tickCountMultiplier;
    $$.axesVisible.forEach(function(_axis){
      tickCountMultiplier = _axis.tickCountMultiplier || 1;
      if(_axis.axis.scale().rangeBand){}
      else if(_axis.tickCount){
        _axis.axis.ticks(_axis.tickCount)
      }else{
        if(['right','left'].indexOf(_axis.orientation.split("-")[0]) > -1){
    			_axis.axis.ticks(tickCountMultiplier * height/60);
        }else{
    			_axis.axis.ticks(tickCountMultiplier * width/75);
        }
      }
    });
  };

  var axis = function(g){
    //initialize ordinal scale ranges (d3 init workaround)
    $$.initOridinalRanges();

    //init axes-arrays one for all axes and onther for those that are visible
    $$.axesAll = [$$.x, $$.y, $$.x2, $$.y2];
    $$.axesVisible = $$.axesAll.filter(function(d){
      return !d.hidden;
    });

    //set the computed height of the axis labels
    $$.labelHeightOutside = $$.labelHeightOutside || $$.getLabelHeight('d2b-label-outside');
    $$.labelHeightInside = $$.labelHeightInside || $$.getLabelHeight('d2b-label-inside');

    //update padding dynamically unless customPadding has been set
    $$.updatePadding();

    //update innerWidth/innerHeight to account for computed padding
    $$.innerWidth = $$.width - $$.padding.left - $$.padding.right;
    $$.innerHeight = $$.height - $$.padding.top - $$.padding.bottom;

    //update dynamic tick counts
    $$.updateTickCounts($$.innerWidth, $$.innerHeight);

    //update scales to use calculated dimensions
    $$.axesAll.forEach($$.updateScale);

    g.each(function(d, i){

      var selection = d3.select(this);

      //make container
      var g = selection.selectAll('g.d2b-axis-container').data([0]);
      g._enter = g.enter()
        .append('g')
          .attr('class','d2b-axis-container');
      g._update = d3.transition(g)
        .attr('transform', 'translate('+$$.padding.left+','+$$.padding.top+')');

      //make grid
      g.grid = g.selectAll('g.d2b-axis-grid').data($$.axesVisible, function(d){return d.key;});
      g.grid._enter = g.grid.enter()
        .append('g')
          .attr('class', function(d){return 'd2b-axis-grid d2b-'+d.key;})
          .style('opacity', 0)
          .each($$.updateGrid);
      g.grid._update = d3.transition(g.grid).each($$.updateGrid);
      g.grid._exit = d3.transition(g.grid.exit())
        .style('opacity', 0)
          .remove();

      //make axes
      g.axis = g.selectAll('g.d2b-axis').data($$.axesVisible, function(d){return d.key;});
      g.axis._enter = g.axis.enter()
        .append('g')
          .style('opacity', 0)
          .attr('class', function(d){return 'd2b-axis d2b-'+d.key;})
          .each($$.updateAxis);
      g.axis._update = d3.transition(g.axis).each($$.updateAxis);
      g.axis._exit = d3.transition(g.axis.exit())
        .style('opacity', 0)
          .remove();

      //make axis labels
      g.axis._enter.append('text').attr('class', 'd2b-axis-label d2b-label-outside');
      g.axis._enter.append('text').attr('class', 'd2b-axis-label d2b-label-inside');
      g.axis.labelOutside = g.axis.select('.d2b-axis-label.d2b-label-outside');
      g.axis.labelInside = g.axis.select('.d2b-axis-label.d2b-label-inside');
      d3.transition(g.axis.labelOutside).each($$.updateLabelOutside);
      d3.transition(g.axis.labelInside).each($$.updateLabelInside);

    });

  };

  axis.on = d2b.UTILS.CHARTS.MEMBERS.events(axis, $$);

  axis.width = function(width){
    if (!arguments.length) return $$.width;
    $$.width = width;
    return axis;
  };

  axis.height = function(height){
    if (!arguments.length) return $$.height;
    $$.height = height;
    return axis;
  };

  axis.customPadding = function(customPadding){
    if (!arguments.length) return $$.customPadding;
    if (typeof(customPadding) === 'number'){
      $$.customPadding = {
        left:customPadding, right:customPadding,
        top:customPadding, bottom:customPadding
      };
    }else{
      $$.customPadding = customPadding;
    }
    return axis;
  };

  $$.axisKeys.forEach(function(_axis){
    axis[_axis] = function(val){
      if (!arguments.length) return $$[_axis];
      // $$[_axis].label = val.label || $$[_axis].label;
      $$[_axis].labelOutside = val.labelOutside || $$[_axis].labelOutside;
      $$[_axis].labelInside = val.labelInside || $$[_axis].labelInside;
      $$[_axis].axis = val.axis || $$[_axis].axis;
      $$[_axis].tickCount = val.tickCount || $$[_axis].tickCount;
      $$[_axis].tickCountMultiplier = val.tickCountMultiplier || $$[_axis].tickCountMultiplier;
      $$[_axis].hidden = (val.hidden != null  && val.hidden != undefined)? val.hidden : $$[_axis].hidden;
      if(val.orientation){
        val.orientation = val.orientation.split('-');
        $$[_axis].orientation = val.orientation[0] + '-' + val.orientation[1] || 'outside';
      }
      if(val.scale){
        $$[_axis].scale = val.scale;
        $$[_axis].axis.scale($$[_axis].scale);
      }
      return axis;
    };
  });

  axis.scale = function(_axisKey){

    var _axisKey = _axisKey.toLowerCase() || 'x';
    var _axis = axis[_axisKey]().axis;
    var _scale = _axis.scale();
    var _reversed = false;

    var scale;

    if($$.axisKeys.indexOf(_axisKey) > -1){
      scale = function(value){
        var _side = axis[_axisKey]().orientation.split('-')[0];
        var position, value;
        if(typeof(value) === 'object' && _axisKey in value){
          value = value[_axisKey];
        }

        position = _scale(value) || 0;
        var _range = _scale.range();
        if(_reversed){
          position = d3.max(_range) - position + d3.min(_range) + scale.rangeBand()/2;
        }else{
          position += scale.rangeBand()/2;
        }

        return position;
      };
    }else{
      scale = function(){ return null; };
    };

    scale.range = function(){
      var range = [];
      if(_scale.rangeBand){
        range = _scale.range()
        range = [range[0], range[range.length-1] + _scale.rangeBand()]
      }else{
        range = _scale.range();
      }
      return range;
    };

    scale.domain = function(){
      if(_reversed){
        return _scale.domain().slice().reverse();
      }
      return _scale.domain();
    };

    scale.reversed = function(reversed){
      _reversed = reversed;
      return scale;
    };

    scale.invert = function(value){ // todo: support invert for ordinal/reversed scales
      var _domain = _scale.domain();
      var position = _scale.invert(value);
      position = _scale.invert(value);
      // if(_reversed){
      //   position = d3.max(_domain) - position + d3.min(_domain);
      // }
      return position;
    };

    scale.rangeBand = function(){
      if(_scale.rangeBand){
        return _scale.rangeBand();
      }else{
        return 0;
      }
    };

    scale.change = function(_newAxisKey){
      _axisKey = _newAxisKey.toLowerCase() || 'x';
      _axis = axis[_axisKey]().axis;
      _scale = _axis.scale();
      return scale;
    };

    return scale;
  };

  axis.box = function(box){
    if (!arguments.length) {
      return {
        width: $$.width,
        height: $$.height,
        innerWidth : $$.innerWidth,
        innerHeight : $$.innerHeight,
        padding: $$.padding
      };
    }
    $$.width = box.width || $$.width;
    $$.height = box.height || $$.height;
    $$.customPadding = box.padding || $$.customPadding;
    return axis;
  };

  return axis;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.SVG.point = function(){
  var $$ = {};

  $$.size = d3.functor(150);
  $$.type = d3.functor('circle');
  $$.active = d3.functor(false);
  $$.stroke = d3.functor(null);
  $$.strokeWidth = d3.functor('1px');
  $$.fill = d3.functor(null);

  $$.symbol = d2b.SVG.symbol().type($$.type);

  //mouseover: enlarge background
  $$.mouseover = function(d, i){
    var size = $$.size.call(this, d, i),
        type = $$.type.call(this, d, i),
        strokeWidth = $$.strokeWidth.call(this, d, i);

    size = 15*Math.pow(size,0.5) + size * Math.pow(parseFloat(strokeWidth),0.2);

    $$.symbol.size(size).type(type);

    d3.select(this).select('path.d2b-point-background')
      .transition().duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
      .attr("d", $$.symbol);
  };

  //mouseout: shrink back to original size
  $$.mouseout = function(d, i){
    var size = $$.size.call(this, d, i),
        type = $$.type.call(this, d, i);

    $$.symbol.size(size).type(type);

    d3.select(this).select('path.d2b-point-background')
      .transition().duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
      .attr("d", $$.symbol);
  };

  var point = function(g){
    g.each(function(d, i){
      var g = d3.select(this);

      //size, type, fill, stroke, active for this point
      var size = $$.size.call(this, d, i),
          type = $$.type.call(this, d, i),
          fill = $$.fill.call(this, d, i),
          stroke = $$.stroke.call(this, d, i),
          strokeWidth = $$.strokeWidth.call(this, d, i),
          active = $$.active.call(this, d, i);

      //set symbol properties
      $$.symbol.size(size).type(type);

      //background
      var background = g.selectAll('path.d2b-point-background').data([d]);

      backgroundEnter   = background.enter().append('path').attr('class', 'd2b-point-background');
      backgroundUpdate  = d3.transition(background);
      backgroundExit    = d3.transition(background.exit());

      backgroundEnter
        .attr('d', $$.symbol)
        .style('fill', 'rgba(255,255,255,0)')
        .style('stroke-width', strokeWidth)
        .style('stroke', stroke);

      backgroundUpdate
        .attr('d', $$.symbol)
        .style('stroke', stroke);

      backgroundExit.style('opacity', 0).remove();

      //foreground
      var foreground = g.selectAll('path.d2b-point-foreground').data([d]);

      foregroundEnter   = foreground.enter().append('path').attr('class', 'd2b-point-foreground');
      foregroundUpdate  = d3.transition(foreground);
      foregroundExit    = d3.transition(foreground.exit());

      foregroundEnter
        .attr('d', $$.symbol)
        .style('stroke-width', strokeWidth)
        .style('stroke', stroke)
        .style('fill', fill);

      foregroundUpdate
        .attr('d', $$.symbol)
        .style('fill', fill)
        .style('stroke', stroke);

      foregroundExit.style('opacity', 0).remove();

      //if active set hover events
      if(active){
        g
          .on('mouseover.d2b-mouseover', $$.mouseover)
          .on('mouseout.d2b-mouseout', $$.mouseout)
      }else{
        g
          .on('mouseover.d2b-mouseover', null)
          .on('mouseout.d2b-mouseout', null)
      }

    });
  };

  point.type = function(type){
    if (!arguments.length) return $$.type;
    $$.type = d3.functor(type);
    $$.symbol.type($$.type);
    return point;
  };
  point.size = function(size){
    if (!arguments.length) return $$.size;
    $$.size = d3.functor(size);
    $$.symbol.size($$.size);
    return point;
  };
  point.fill = function(fill){
    if (!arguments.length) return $$.fill;
    $$.fill = d3.functor(fill);
    return point;
  };
  point.stroke = function(stroke){
    if (!arguments.length) return $$.stroke;
    $$.stroke = d3.functor(stroke);
    return point;
  };
  point.strokeWidth = function(strokeWidth){
    if (!arguments.length) return $$.strokeWidth;
    $$.strokeWidth = d3.functor(strokeWidth);
    return point;
  };
  point.active = function(active){
    if (!arguments.length) return $$.active;
    $$.active = d3.functor(active);
    return point;
  };
  return point;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

// Add symbols to the default d3 svg support

d2b.SVG.symbol = function(){
  var $$ = {};

  $$.size = d3.functor(150);
  $$.type = d3.functor('circle');
  $$.d3Symbol = d3.svg.symbol().type($$.type);
  $$.symbol = $$.d3Symbol;

  var symbol = function(d, i){
    var type = $$.type.call(this, d, i);
    var size = $$.size;

    if(d3.svg.symbolTypes.indexOf(type) > -1)
      $$.symbol = $$.d3Symbol.type(type).size(size);
    else if(d2b.SVG.symbolTypes.indexOf(type) > -1)
      $$.symbol = d2b.SVG.symbols[type];
    else
      $$.symbol = $$.d3Symbol.type('circle').size(size);
// console.log($$.symbol($$.size.call(this, d, i)))
    return $$.symbol($$.size.call(this, d, i));
  };

  symbol.size = function(size){
    if (!arguments.length) return $$.size;
    $$.size = d3.functor(size);
    return symbol;
  };

  symbol.type = function(type){
    if (!arguments.length) return $$.type;
    $$.type = d3.functor(type);
    return symbol;
  };

  return symbol;
};

d2b.SVG.symbols = {
  star: function(size){
    var sin36 = Math.sin(d2b.MATH.toRadians(36));
    var cos36 = Math.cos(d2b.MATH.toRadians(36));

    var sin54 = Math.sin(d2b.MATH.toRadians(54));
    var cos54 = Math.cos(d2b.MATH.toRadians(54));

    var sin18 = Math.sin(d2b.MATH.toRadians(18));
    var cos18 = Math.cos(d2b.MATH.toRadians(18));
    var tan18 = Math.tan(d2b.MATH.toRadians(18));

    var r = Math.sqrt(size/(5*cos36*(sin36+cos36/tan18)));
    var r2 = r*sin36 + r*cos36/tan18;

    return "M" + 0 +","+ -r2
          +"L" + r*cos54 +","+ -r*sin54
          +" " + r2*cos18 +","+ -r2*sin18
          +" " + r*cos18 +","+ r*sin18
          +" " + r2*sin36 +","+ r2*cos36
          +" " + 0 +","+ r
          +" " + -r2*sin36 +","+ r2*cos36
          +" " + -r*cos18 +","+ r*sin18
          +" " + -r2*cos18 +","+ -r2*sin18
          +" " + -r*cos54 +","+ -r*sin54
          +" " + 0 +","+ -r2 +"Z";
  },
  mars: function(size){
    var r = Math.sqrt(size/(Math.PI+5/4));
    var sqrt8 = Math.sqrt(8);
    var sqrt2 = Math.sqrt(2);
    var s = 0.3125 * r;

    return "M" + r/sqrt8 + ","+ 0
          +"A" + r +","+ r +" 0 1,1 "+ 0 + ","+ -r/sqrt8
          +"L" + r*(5/4-1/sqrt2) + ","+ -r*(1/sqrt8 + 5/4 - 1/sqrt2)
          +" " + (r*(5/4-1/sqrt2)-s) + ","+ -r*(1/sqrt8 + 5/4 - 1/sqrt2)
          +" " + (r*(5/4-1/sqrt2)-s) + ","+ -r*(1/sqrt8 + 7/4 - 1/sqrt2)
          +" " + r*(7/4-1/sqrt2+1/sqrt8) + ","+ -r*(1/sqrt8 + 7/4 - 1/sqrt2)
          +" " + r*(7/4-1/sqrt2+1/sqrt8) + ","+ (-r*(5/4 - 1/sqrt2) + s)
          +" " + r*(5/4-1/sqrt2+1/sqrt8) + ","+ (-r*(5/4 - 1/sqrt2) + s)
          +" " + r*(5/4-1/sqrt2+1/sqrt8) + ","+ -r*(5/4 - 1/sqrt2)
          +"Z";

  },
  venus: function(size){
    var r = Math.sqrt(size/(Math.PI+5/4));

    //center point is at ~ 3/4*r down from the center of the circle

    return "M" + -r/4 + ","+ r/4
          +"A" + r +","+ r +" 0 1,1 "+ r/4 + ","+ r/4
          +"L" + r/4 + ","+ (3*r/4)
          +" " + r*3/4 + ","+ (3*r/4)
          +" " + r*3/4 + ","+ (5*r/4)
          +" " + r/4 + ","+ (5*r/4)
          +" " + r/4 + ","+ (7*r/4)
          +" " + -r/4 + ","+ (7*r/4)
          +" " + -r/4 + ","+ (5*r/4)
          +" " + -r*3/4 + ","+ (5*r/4)
          +" " + -r*3/4 + ","+ (3*r/4)
          +" " + -r/4 + ","+ (3*r/4)
          +"Z";
  },
  // asterisk: function(size){
  //   //TODO
  //   var l = Math.sqrt(size/11.7043);
  //   var sqrt_3 = Math.sqrt(3);
  //   var s = l*sqrt_3/2;
  //   var sqrt_8 = Math.sqrt(8);
  //
  //   var current = {x:0,y:0}
  //
  //   return "M" + (current.x -= l/2) +","+ (current.y -= s)
  //         +"L" + current.x +","+ (current.y -= l)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += 1/4) +","+ (current.y -= l/4)
  //         +"L" + (current.x += l/2) +","+ current.y
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += 1/4) +","+ (current.y += l/4)
  //         +"L" + current.x +","+ (current.y += l)
  //         +" " + (current.x += l*sqrt_3/2) +","+ (current.y -= l/2)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += l*sqrt_3/(2*sqrt_8)) +","+ (current.y += l/(2*sqrt_8))
  //         +"L" + (current.x += l/4) +","+ (current.y += l*sqrt_3/4)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x -= l/(2*sqrt_8)) +","+ (current.y += l*sqrt_3/(2*sqrt_8))
  //
  //         +"L" + 0 +","+ 100
  //         +"Z";
  // },
  close: function(size){
    var r = Math.sqrt(size/5); // border length of each side
    var r2 = Math.sqrt(r*r/2); // small side of intersecting triangle for each far point
    var r3 = Math.sqrt(1/2)*r; // from center to the close intersection point
    var r4 = r2 + r3;          // long side of intersecting triangle for each far point

    return "M" + 0 +","+ -r3
          +"L" + r2 +","+ -r4
          +" " + r4 +","+ -r2
          +" " + r3 +","+ 0
          +" " + r4 +","+ r2
          +" " + r2 +","+ r4
          +" " + 0 +","+ r3
          +" " + -r2 +","+ r4
          +" " + -r4 +","+ r2
          +" " + -r3 +","+ 0
          +" " + -r4 +","+ -r2
          +" " + -r2 +","+ -r4
          +" " + 0 +","+ -r3 +"Z";

  },
  hexagon: function(size){
    var s = Math.sqrt(size * 2 / (3 * Math.sqrt(3)));
    var moveX = Math.cos(d2b.MATH.toRadians(30)) * s;
    var moveY = Math.sin(d2b.MATH.toRadians(30)) * s;


    return "M"+ 0 +","+ -s
          +"L"+ moveX +","+ -moveY
          +" "+ moveX +","+ moveY
          +" "+ 0 +","+ s
          +" "+ -moveX +","+ moveY
          +" "+ -moveX +","+ -moveY +"Z";

  },
  "rect-horizontal": function(size){
    var sideRatio = 3; // 3 to 1
    var r = Math.sqrt(size/sideRatio);
    var r2 = r*sideRatio;

    return "M" + -r2/2 +","+ -r/2
          +"L" + r2/2 +","+ -r/2
          +" " + r2/2 +","+ r/2
          +" " + -r2/2 +","+ r/2 +"Z";
  },
  "rect-vertical": function(size){
    var sideRatio = 1/3; // 1 to 3
    var r = Math.sqrt(size/sideRatio);
    var r2 = r*sideRatio;

    return "M" + -r2/2 +","+ -r/2
          +"L" + r2/2 +","+ -r/2
          +" " + r2/2 +","+ r/2
          +" " + -r2/2 +","+ r/2 +"Z";
  },
  "arrow-right": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r +","+ -r/4
          +"L" + 0 +","+ -r/4
          +" " + 0 +","+ -3*r/4
          +" " + r +","+ 0
          +" " + 0 +","+ 3*r/4
          +" " + 0 +","+ r/4
          +" " + -r +","+ r/4 +"Z";

  },
  "arrow-left": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + r +","+ -r/4
          +"L" + 0 +","+ -r/4
          +" " + 0 +","+ -3*r/4
          +" " + -r +","+ 0
          +" " + 0 +","+ 3*r/4
          +" " + 0 +","+ r/4
          +" " + r +","+ r/4 +"Z";

  },
  "arrow-up": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r/4 +","+ r
          +"L" + -r/4 +","+ 0
          +" " + -3*r/4 +","+ 0
          +" " + 0 +","+ -r
          +" " + 3*r/4 +","+ 0
          +" " + r/4 +","+ 0
          +" " + r/4 +","+ r +"Z";

  },
  "arrow-down": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r/4 +","+ -r
          +"L" + -r/4 +","+ 0
          +" " + -3*r/4 +","+ 0
          +" " + 0 +","+ r
          +" " + 3*r/4 +","+ 0
          +" " + r/4 +","+ 0
          +" " + r/4 +","+ -r +"Z";

  }

};

//more keys for the close symbol
d2b.SVG.symbols["cross-diagonal"] = d2b.SVG.symbols.close;
d2b.SVG.symbols["x"] = d2b.SVG.symbols.close;

d2b.SVG.symbolTypes = d3.svg.symbolTypes.concat(
  [
    "star", "close", //"asterisk",
    "rect-horizontal", "rect-vertical",
    "arrow-right", "arrow-left", "arrow-up", "arrow-down",
    "venus", "mars",
    "hexagon"
  ]
);

//copy symbol to old location for old version support
d2b.UTILS.symbol = d2b.SVG.symbol;
d2b.UTILS.symbolTypes = d2b.SVG.symbolTypes;

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

// Tooltip to be used for axis-charts

d2b.SVG.tooltip = function(){
  var $$ = {};

  $$.layout = 0;
  $$.container = d3.select('body');
  $$.animationDuration = 100;
  $$.graph = {};

  $$.refreshLayout = {};

  /*LAYOUT 0*/

  $$.refreshLayout['0'] = function(){
    for(key in $$.graph){
      $$.graph[key].call(
        d2b.UTILS.bindTooltip,
        $$.graph[key].config.content,
        $$.graph[key].config.data,
        $$.graph[key].config.fill
      );
    }
  };

  /*END LAYOUT 0*/

  /*LAYOUT 1*/

  $$.refreshLayout['1'] = function(){
    if(!$$.tracker || !$$.container || !$$.x || !$$.y){return;}
    var graphArray = [];

    for(var key in $$.graph){
      graphArray.push($$.graph[key]);
    }

    var tooltip = $$.container.selectAll('.d2b-tooltip').data(graphArray, function(d){return d.config.key;});
    tooltip._update = tooltip.transition().duration($$.animationDuration);
    tooltip._enter = tooltip.enter().append('g').attr('class', 'd2b-tooltip d2b-tooltip-layout-1');

    tooltip._enter.append('polyline').style('stroke-width', '2px').style('fill','none');
    tooltip._enter.append('rect');
    tooltip._enter.append('circle').attr('r', 3);
    tooltip._enter.append('text').style('font-size', '12px');

    tooltip._exit = tooltip.exit().transition().duration($$.animationDuration).style('opacity',0).remove();

    $$.tracker.on('mouseenter.d2b-tooltip', function(){
      $$.container.transition().duration($$.animationDuration).style('opacity',1);
    });

    $$.tracker.on('mouseleave.d2b-tooltip', function(){
      $$.container.transition().duration($$.animationDuration).style('opacity',0);
    });

    $$.tracker.on('mousemove.d2b-tooltip', function(){
      $$.mousemoveLayout1(this, tooltip);
    });
  };

  $$.mousemoveLayout1 = function(event, tooltip){
    // set the range of x and y and the width/height
    var xRange = $$.x.range();
    var boxWidth = Math.abs(xRange[1] - xRange[0]);
    var yRange = $$.y.range();
    var boxHeight = Math.abs(yRange[1] - yRange[0]);

    // get mouse position and invert it to x,y points
    var mouse = d3.mouse(event);
    var mouseInvert = [$$.x.invert(mouse[0]), $$.y.invert(mouse[1])];

    // set tooltip position to be on the side oposite of the pointer
    var position = 'right';
    if(boxWidth/2 < mouse[0]){
      position = 'left';
    }

    // create a vertical-pixel array of empty cells
    var verticalPixelCells = $$.initCellArray(d3.min(yRange),d3.max(yRange));

    tooltip.each(function(tooltipData){
      // for the current tooltip, get the closest point of the associated graph and it's properties
      var closestNode = $$.getClosestProperties(mouseInvert, tooltipData);
      // init vars
      var text, rect, line, circle, lineLength = 15, paddingX = 5, paddingY = 3, marginY = 5;

      //if the closest node data is the same as previously calculated, don't re-setup the tooltip
      // if(this.closest && this.closest.data === closestNode.data){return;}

      //store closest node data onto tooltip instance
      this.closest = closestNode;

      //select tooltip components
      elem = d3.select(this);
      elem.update = elem.transition().duration($$.animationDuration).ease('linear');
      text = elem.select('text');
      text.update = text.transition().duration($$.animationDuration).ease('linear');
      line = elem.select('polyline');
      line.update = line.transition().duration($$.animationDuration).ease('linear');
      rect = elem.select('rect');
      rect.update = rect.transition().duration($$.animationDuration).ease('linear');
      circle = elem.select('circle');

      //set tooltip text
      text
        .text(this.closest.content)

      //get bounding box of tooltip text
      var textBox = text.node().getBBox();

      //get the tooltip vertical offset so that it doesn't overlap with other tooltips
      this.offsetY = $$.offsetForCollisionResolution(
                      verticalPixelCells,
                      $$.y(this.closest.y),
                      textBox.height + paddingY * 2 + marginY*2
                    );

      //position tooltip svg:g
      elem.update
        .attr('transform','translate('+$$.x(this.closest.x)+','+$$.y(this.closest.y)+')');

      rect
        .attr('width', textBox.width + paddingX*2)
        .attr('height', textBox.height + paddingY*2)
        .style('stroke',this.closest.darkFill)
        .style('fill', this.closest.fill);
      circle
        .style('stroke', this.closest.darkFill);
      line
        .style('stroke', this.closest.darkFill);

      if(position === 'right'){
        text.update
          .attr('transform', 'translate('+(lineLength+paddingX)+','+(textBox.height/3.5 + this.offsetY)+')')
          .style('text-anchor', 'start');
        rect.update
          .attr('transform', 'translate('+lineLength+','+(-textBox.height/2-paddingY + this.offsetY)+')');
        line.update
          .attr('points','0,0 0,'+this.offsetY+' '+lineLength+','+this.offsetY);
      }else{
        text.update
          .attr('transform', 'translate('+(-lineLength-paddingX)+','+(textBox.height/3.5 + this.offsetY)+')')
          .style('text-anchor', 'end');
        rect.update
          .attr('transform', 'translate('+(-textBox.width-lineLength-paddingX*2)+','+(-textBox.height/2-paddingY + this.offsetY)+')');
        line.update
          .attr('points','0,0 0,'+this.offsetY+' '+(-lineLength)+','+this.offsetY);
      }
    });
  };

  $$.initCellArray = function(min, max){
    min = d3.round(min, 0);
    max = d3.round(max, 0);
    max = Math.max(max, min);
    min = Math.min(max, min);
    var arr = [], i=min;
    arr.top = max;
    arr.bottom = min;
    for(;i<max;i+=1){
      arr[i] = false;
    }
    return arr;
  };

  $$.offsetForCollisionResolution = function(pixels, y, height){
    var offsetY = $$.findClosestOpenOffset(pixels, y, height);
    $$.occupyPixels(pixels, y + offsetY, height);

    return offsetY;
  };

  $$.findClosestOpenOffset = function(pixels, y, height) {
    var i=0, consecutiveDown = 0, consecutiveUp = 0;
    y = d3.round(y,0);
    height = d3.round(height, 0);
    //define length to be half of the height
    var length = d3.round(height/2, 0);
    var offsetDown = length, offsetUp = -length;

    while(consecutiveDown < height && (offsetDown+y) > pixels.bottom){
      if(pixels[offsetDown+y]){
        consecutiveDown = -1;
      }
      consecutiveDown += 1;
      offsetDown -= 1;
    };

    while(consecutiveUp < height && (offsetUp+y) < pixels.top){
      if(pixels[offsetUp+y]){
        consecutiveUp = -1;
      }
      consecutiveUp += 1;
      offsetUp += 1;
    };

    offsetUp -= length;
    offsetDown += length;

    if(Math.abs(offsetUp) < Math.abs(offsetDown) && consecutiveUp >= height){
      return offsetUp;
    }else if(consecutiveDown >= height){
      return offsetDown;
    }else if(consecutiveUp > consecutiveDown){
      return offsetUp;
    }else{
      return offsetDown;
    }
  };

  $$.occupyPixels = function(pixels, y, height) {
    var i;
    y = d3.round(y,0);
    var length = d3.round(height/2, 0);
    for( i=y-length;i<=y+length;i+=1 ){
      pixels[i] = true;
    }
  };

  $$.getClosestProperties = function(point, nodes){
    var smallestDistX = Infinity, smallestDistY = Infinity;

    var closest = null;

    nodes.each(function(d,i){
      var node = {};
      node.x = (typeof nodes.config.x === "function")?
                    nodes.config.x.apply(this, arguments) :
                    (nodes.config.x || null);
      node.y = (typeof nodes.config.y === "function")?
                    nodes.config.y.apply(this, arguments) :
                    (nodes.config.y || null);

      if(node.y === null || node.x === null || node.y === undefined || node.x === undefined) return;

      var distX = Math.abs(point[0] - node.x);
      var distY = Math.abs(point[1] - node.y);

      if(distX > smallestDistX){return;}
      if(distX === smallestDistX && distY > smallestDistY){return;}

      node.point = [node.x, node.y];
      node.data = (typeof nodes.config.data === "function")?
            nodes.config.data.apply(this, arguments) :
            (nodes.config.data || d);
      node.content = (typeof nodes.config.content === "function")?
            nodes.config.content.apply(this, [node.data, i]) :
            d.config.content;
      node.fill = (typeof nodes.config.fill === "function")?
            nodes.config.fill.apply(this, arguments) :
            (nodes.config.fill || d);

      node.darkFill = d3.rgb(node.fill).darker(1);

      node.data = d;

      smallestDistX = distX;
      smallestDistY = distY;
      closest = node;

    });

    return closest;
  };

  /*END LAYOUT 1*/

  // reset mouseovers
  $$.stop = function(){
    if($$.tracker){
      $$.tracker.on('mouseenter.d2b-tooltip', null);
      $$.tracker.on('mousemove.d2b-tooltip', null);
      $$.tracker.on('mouseout.d2b-tooltip', null);
    }
    for(key in $$.graph) $$.graph[key].call(d2b.UTILS.unbindTooltip);

    d2b.UTILS.removeTooltip();

    $$.container.selectAll('.d2b-tooltip').remove();
  };

  var tooltip = {};

  tooltip.container = function(selection){
    if (!arguments.length) return $$.container;
    $$.container = selection;
    $$.container.transition().duration($$.animationDuration).style('opacity',0);
    return tooltip;
  };

  tooltip.tracker = function(selection){
    if (!arguments.length) return $$.tracker;
    $$.tracker = selection;
    return tooltip;
  };

  tooltip.graph = function(selection, config){
    if (!arguments.length) return $$.graph;
    $$.graph[config.key] = selection;
    $$.graph[config.key].config = config;
    return tooltip;
  };

  tooltip.layout = function(layout){
    if (!arguments.length) return $$.layout;
    $$.layout = layout + '';
    return tooltip;
  };

  tooltip.animationDuration = function(animationDuration){
    if (!arguments.length) return $$.animationDuration;
    $$.animationDuration = animationDuration;
    return tooltip;
  };

  tooltip.start = function(){
    $$.refreshLayout[$$.layout]();
    return tooltip;
  };

  tooltip.stop = function(){
    $$.stop();
    return tooltip;
  };

  tooltip.reset = function(){
    $$.stop();
    $$.graph = {};
    return tooltip;
  };

  //todo: add interpreted vs visual x/y for rotated axes and proper bar interpretation
  tooltip.x = function(x){
    if (!arguments.length) return $$.x;
    $$.x = x;
    return tooltip;
  };

  tooltip.y = function(y){
    if (!arguments.length) return $$.y;
    $$.y = y;
    return tooltip;
  };

  return tooltip;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-area*/
d2b.UTILS.AXISCHART.TYPES.area = function(){

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

	$$.x = d3.scale.linear();
	$$.y = d3.scale.linear();

	$$.area = d3.svg.area()
    .x(function(d) { return $$.x(d.x); })
    .y1(function(d) { return $$.y(d.yComputed + d.y0Computed); })
    .y0(function(d) {	return $$.y(d.y0Computed); });

	$$.point = d2b.SVG.point()
		.size(40)
		.active(true)
		.fill('white');

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
	};

	$$.initYComputed = function(data){
		data.forEach(function(d){
			d.values.forEach(function(value){
				value.y0Computed = 0;
				value.yComputed = value.y;
			});
		});
	};

	$$.tooltipSVG = d2b.SVG.tooltip();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.general =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'general');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG =					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	chart.offset =	 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'offset');

	$$.updatePoints = function(graphData, graph){

		$$.foreground.point = graph.selectAll('g.d2b-point').data(function(d){return d.values;});

		var newPoint = $$.foreground.point.enter()
			.append('g')
				.attr('class','d2b-point')
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.yComputed + d.y0Computed)+')';
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-area-point');

		$$.point
			.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; })
			.stroke(d2b.UTILS.getColor($$.color, 'label', [graphData]));
		$$.foreground.point
			.call($$.point);

		$$.foreground.point
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return d.x;},
						y:function(d){return d.yComputed + d.y0Computed;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				)
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.yComputed + d.y0Computed)+')';
				})

		$$.foreground.point.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

	};



	$$.stack = function(data){
		if($$.controlsData.stackAreas.enabled){
			d3.layout.stack()
				.out(function(d, y0, y){
					d.y0Computed = y0;
					d.yComputed = y;
				})
				.offset($$.offset || $$.controlsData.stackAreas.offset || "zero")
		    .values(function(d) { return d.values; })
				(data);
		}else{
			$$.initYComputed(data);
		}
	};

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		$$.stack($$.currentChartData);

		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.yComputed + d.y0Computed;}));
			values = values.concat(graphData.values.map(function(d){return d.y0Computed;}));
		});
		return values;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;

		if(reset){
			$$.currentChartData = {};
		}
		$$.currentChartData = chartData;

		return chart;
	};

	//chart update
	chart.update = function(callback){
		$$.stack($$.currentChartData);

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path')
					.call($$.events.addElementDispatcher, 'main', 'd2b-area');
			}

			$$.area
				.interpolate(graphData.interpolate || 'linear')
				.tension(graphData.tension || 0);

			path
				.datum(function(d){return graphData.values;})
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.area);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			$$.updatePoints(graphData, graph);
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.TYPES.area.tools = function(){
  return {
    controlsData:{
      stackAreas: {
        label: "Stack Areas",
        type: "checkbox",
        visible: false,
        enabled: false
      }
    }
  }
};

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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bubble-pack*/
d2b.UTILS.AXISCHART.TYPES.bubblePack = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();

	$$.positionType = 'mean';
	$$.positionTypeX = $$.positionType;
	$$.positionTypeY = $$.positionType;

	$$.reformatRequired = true;

	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

	//	hash for all nodes that have been expanded
  $$.expandedNodes = {};

	$$.sizeScale = [1,1];
	$$.size = d3.scale.linear();

	$$.tooltip = function(d){
		return ""+$$.xFormat(d.data.xComputed)+" : "+$$.yFormat(d.data.yComputed)+
					 " ("+d.data.sizeComputed+")";
	};

  // Breadcrumb object and external methods
	$$.breadcrumbs = d2b.UTILS.breadcrumbs().scale(5.5);

	$$.breadcrumbs.reset = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();
	};
	$$.breadcrumbs.set = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();

		var breadcrumbsSelection = $$.breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			.attr('stroke-width',1.5)
			.style('fill-opacity',0.2)
			.style('stroke-opacity',0.7)
			.style('fill', function(d){return $$.node.fill(d.data);})
			.attr('stroke',function(d){return $$.node.fillDark(d.data);});
	};

	//Define Node Object And Methods
	$$.node = {};

	//find the ancesstors of a given node
	$$.node.getAncestors = function(node) {
		var path = [];
		var current = node;

		while (current.parent) {
			path.unshift(current);
			current = current.parent;
		}
		path.unshift(current);

		return path;
	};

  $$.node.resetExpanded = function(node){
    $$.expandedNodes[node.key] = false;
    if(node.children){
      node.children.forEach(function(child){
        $$.node.resetExpanded(child);
      });
    }
  };

  $$.node.formKey = function(d, graphLabel){
    d.key = graphLabel + d.name;
    if(d.parent){
      d.key += $$.node.formKey(d.parent, graphLabel);
    }
    return d.key;
  };

	// toggle a bubble's expanded indicator and update the axis chart
	$$.node.toggleExpanded = function(d){
		$$.breadcrumbs.reset();
		$$.expandedNodes[d.key] = !$$.expandedNodes[d.key];
		if(!$$.expandedNodes[d.key]) $$.node.resetExpanded(d);
		$$.axisChart.update();
	};

	$$.node.mouseover = function(node){
		$$.breadcrumbs.set($$.node.getAncestors(node));
	};
	$$.node.mouseout = function(node){
		$$.breadcrumbs.reset();
	};
	//	get node fill color
	$$.node.fill = function(d){
		return $$.color(d.fill);
	};
	//	get darkened node fill color
	$$.node.fillDark = function(d){
		return d3.rgb($$.node.fill(d)).darker(1);
	};
	$$.node.symbol = function(d){
		return d.symbolType;
	}
	$$.node.getSymbolPathSmall = function(d){
		return d2b.UTILS.symbol().type(d.symbolType).size(75)(d);
	};

	// define the point svg obj
	$$.point = d2b.SVG.point()
		.type($$.node.symbol)
		.size(function(d){return $$.size(d.sizeComputed);})
		.active(function(d){return d.children && d.children.length;})
		.fill($$.node.fill)
		.stroke($$.node.fillDark)
		.strokeWidth(function(d){return (d.children && d.children.length)? '1.5px' : '0px';});

	//Define Bubble Object And Methods
	$$.bubble = {};

	//	If the bubble has been expanded, transition to invisible and set the d2b-hidden class
	$$.bubble.visibility = function(d){
		var elem = d3.select(this);
		var transition = d3.transition(elem);
		elem.classed('d2b-hidden', $$.expandedNodes[d.key]);
		transition.style('opacity', ($$.expandedNodes[d.key])? 0 : 0.7);
	};

	//	If the bubble has children, setup click event
	$$.bubble.bindClick = function(d){
		var elem = d3.select(this);
		if(d.children){
			elem.on('click', $$.node.toggleExpanded).style('cursor', 'pointer');
		}else{
			elem.on('click', null).style('cursor', 'auto');
		}
	};

	//	Position bubble based on x, y scales
	$$.bubble.transform = function(d){
		return 'translate('+$$.x(d.xComputed)+','+$$.y(d.yComputed)+')';
	};

	//	For entering bubbles with a parent node, initialize the transform
	//	to that of the parent bubble. Otherwise use default transform.
	$$.bubble.enterTransform = function(d){
		if(d.parent) return d.parent.bubble.attr('transform');
		else return $$.bubble.transform(d);
	};

	//	Update Child Gubbles
	$$.bubble.updateChildren = function(d){
		var elem = d3.select(this);
		var transition = d3.transition(elem);
		//	Has bubble been expanded. And does it have children.
		if($$.expandedNodes[d.key] && d.children && d.children.length){
			//	update bubble children
			$$.bubble.update(d3.select(this), d.children);
		}else{
			//	pseudo exit all child bubble groups
			transition.selectAll('.d2b-bubble-group')
					.style('opacity', 0)
					.remove()
				.selectAll('.d2b-bubble')
					.attr('transform', $$.bubble.transform(d));
		}
	};

	//	Update Bubble Group.
	$$.bubble.update = function(bubbleContainer, bubbleData){
		var bubbleGroup = bubbleContainer.selectAll('g.d2b-bubble-group')
				.data(bubbleData, $$.bubbleKey);
		var newBubbleGroup = bubbleGroup.enter().append('g').attr('class', 'd2b-bubble-group');

		newBubbleGroup
			.append('g')
				.call($$.events.addElementDispatcher, 'main', 'd2b-bubble')
				.attr('class', 'd2b-bubble')
				.attr('transform', $$.bubble.enterTransform)
				.on('mouseover.d2b-node-mouseover', $$.node.mouseover)
				.on('mouseout.d2b-node-mouseout', $$.node.mouseout);

		var bubble = bubbleGroup.select('.d2b-bubble')
				.each(function(d){
					//	Save element to the data.
					d.bubble = d3.select(this);
				})
				.each($$.bubble.bindClick)
			.transition()
				.duration($$.animationDuration)
				.call($$.point)
				.attr('transform', $$.bubble.transform)
				.each($$.bubble.visibility);

		bubbleGroup
			.transition()
				.duration($$.animationDuration)
				.each($$.bubble.updateChildren);

	};

	// Define Expanded Bubble Indicator Object
	$$.expandedBubbleIndicator = {};
	$$.expandedBubbleIndicator.enter = function(indicator){
    var newIndicator = indicator.enter()
      .append('g')
        .attr('class', 'd2b-expanded-bubble-indicator')
				.on('click.d2b-click', $$.node.toggleExpanded)
				.on('mouseover.d2b-node-mouseover', $$.node.mouseover)
				.on('mouseout.d2b-mouseout', $$.node.mouseout)
				.call($$.events.addElementDispatcher, 'main', 'd2b-expanded-bubble-indicator');
    newIndicator
      .append('rect')
				.style('fill', $$.node.fill)
				.style('stroke', $$.node.fillDark)
        .attr('height', 20);
		newIndicator
			.append('path')
			.style('fill', $$.node.fill)
			.attr('transform','translate(10, 10)');
    newIndicator
      .append('text')
        .attr('x', 20)
        .attr('y', 15)
        .text(function(d){return d.name.substring(0,4).trim();});

	};
	$$.expandedBubbleIndicator.update = function(indicator, position){
		var indicatorTransition = indicator
				.attr('transform', function(d){
					var elem = d3.select(this);
					var width = elem.select('text').node().getComputedTextLength() + 30;

					//save desired indicatorWidth onto the rect element
					elem.select('rect').each(function(){this.indicatorWidth = width;})

					width += 5;

					position.x += width;
					if(position.x > $$.width-20){
						position.y += 25;
						position.x = width + 10;
					}
					return 'translate('+(position.x - width)+','+position.y+')';
				});
		indicatorTransition
			.select('rect')
				.attr('width', function(){return this.indicatorWidth;})
				.style('fill', $$.node.fill)
				.style('stroke', $$.node.fillDark);
		indicatorTransition
			.select('path')
				.attr('d', $$.node.getSymbolPathSmall)
				.style('fill', $$.node.fill)

		$$.breadcrumbsContainer
				.attr('transform', 'translate('+(10)+','+(position.y+30)+')');

	};
	$$.expandedBubbleIndicator.exit = function(indicator){
		indicator.exit()
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.style('opacity',0)
				.remove();
	};

	// Other methods

	$$.cleanSizeScale = function(scale){
		if(scale){
			if(scale.length === 1)
				return [scale[0], scale[0]];
			else
				return scale;
		}else if(scale === null){
				return [1,1];
		}
	};

	// Returns an array containing all of the values for a particular node
	$$.getValues = function(node){
		var values = [];
		if(node.children){
			return [].concat.apply([], node.children.map(function(d, i){
				return $$.getValues(d);
			}));
		}else{
			return (node.values)? node.values : [node];
		}
	};

	//	Tree Traversal
	//	args:
	//		-node, top of tree to be traversed
	//		-callback, function to be executed for each traversed node
	//	callback's "this" will be the child node itself and the first
	//	argument will be the parent node. if the callback, returns 'break' the
	//	current branch will not traverse further
	$$.traverseTree = function(node, callback){
	 	function eachChild(parent){
			var _self = this;
			var stop = callback.call(_self, parent);
			if(!_self.children || stop === 'break') return;
			_self.children.forEach(function(d,i){
				eachChild.call(d, _self);
			});
		};
		eachChild.call(node, null);
	};

	// Format the data to compute each node position/size/etc.. based on relative
	// children values
	$$.formatData = function(){
		if(!$$.currentChartData || !$$.reformatRequired) return;

		$$.currentChartData.forEach(function(graphData, graphIndex){
			$$.traverseTree(graphData.pack, function(parent){
				this.parent = parent;
				this.key = $$.node.formKey(this, graphData.label);
				this.values = $$.getValues(this);
				this.sizeComputed = d3.sum(
					this.values,
					function(d){return d.size || 1;}
				);
				this.xComputed = d2b.MATH[$$.positionTypeX](
					this.values,
					function(d){return d.x || 0;},
					function(d){return d.size || 1;}
				);
				this.yComputed = d2b.MATH[$$.positionTypeY](
					this.values,
					function(d){return d.y || 0;},
					function(d){return d.size || 1;}
				);
				this.fill = this.colorKey || graphData.colorKey || graphData.label;
				this.symbolType = this.symbol || graphData.symbol || 'circle';
			});
		});

		$$.reformatRequired = false;
	};

	//	Sort pack hierarchy into expanded and visible node arrays
	//	Also add visible/expanded class to respective nodes
	$$.sortPack = function(pack){
		var sorting = {expanded: [], visible: []};
		$$.traverseTree(pack, function(){
			if(this.bubble) this.bubble.classed('d2b-visible', false).classed('d2b-expanded', false);
		});
		$$.traverseTree(pack, function(){
			if($$.expandedNodes[this.key]){
				sorting.expanded.push(this);
				if(this.bubble) this.bubble.classed('d2b-expanded', true);
			}else{
				sorting.visible.push(this);
				if(this.bubble) this.bubble.classed('d2b-visible', true);
				return 'break';
			}
		});
		return sorting;
	};

	//	bubble key accessor
	$$.bubbleKey = function(d){return d.key;};

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
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	//type specific properties
	chart.sizeScale =	 				d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'sizeScale', function(){
		$$.sizeScale = $$.cleanSizeScale($$.sizeScale);
	});
	chart.positionType = 			d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionType', function(){
		$$.positionTypeX = $$.positionType;
		$$.positionTypeY = $$.positionType;
		$$.reformatRequired = true;
	});
	chart.positionTypeX = 		d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionTypeX', function(){
		$$.reformatRequired = true;
	});
	chart.positionTypeY = 		d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionTypeY', function(){
		$$.reformatRequired = true;
	});

	//xValues and yValues are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
    var values = [];
		$$.formatData();
    $$.currentChartData.forEach(function(graphData){
			$$.traverseTree(graphData.pack, function(){
				if(!$$.expandedNodes[this.key]) {
					values.push(this.xComputed);
					return 'break';
				}
			});
    });
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.formatData();
    $$.currentChartData.forEach(function(graphData){
			$$.traverseTree(graphData.pack, function(d){
				if(!$$.expandedNodes[this.key]) {
					values.push(this.yComputed);
					return 'break';
				}
			});
    });
    return values;
	};

	//data setter
	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		$$.reformatRequired = true;

		return chart;
	};

	//chart update
	chart.update = function(callback){
		$$.formatData();

		//	Set size scale domain. 0 -> max bubble size
		$$.size.domain(
			[0, d3.max($$.currentChartData, function(d){return d.pack.sizeComputed})]
		);

		/** init breadcrumbs, rather than use a generate function, just append
			*	breadcrumb container if it doesn't exist yet.
			*/
		$$.breadcrumbsContainer = $$.general.select('g.d2b-breadcrumbs');
		if(!$$.breadcrumbsContainer.size()){
			$$.breadcrumbsContainer = $$.general.append('g')
				.attr('class', 'd2b-breadcrumbs');
			$$.breadcrumbs.selection($$.breadcrumbsContainer);
		}
		$$.breadcrumbs.width($$.width);

		//update size scale range
		$$.size.range([$$.sizeScale[0] * 10, $$.sizeScale[1] * Math.min($$.width, $$.height) * 10]);

		//init indicator origin
		var indicatorPosition = {x:10, y:10};

		//draw foreground elements for each graph
		$$.foreground.each(function(graphData){

			var graph = d3.select(this);

			$$.bubble.update(graph, [graphData.pack]);

			//	Sort bubbles into visible and expanded arrays
			//	expect -> {visible: [], expanded: []}
			var sorting = $$.sortPack(graphData.pack);

			//	Add tooltip for visible bubbles
			graph.selectAll('.d2b-visible').call($$.tooltipSVG.graph,
				{
					key: graphData.label,
					content: $$.tooltip,
					data: function(d){return {data:d, graph:graphData};},
					x:function(d){return d.xComputed;},
					y:function(d){return d.yComputed;},
					fill:$$.node.fill
				}
			);

			var indicator = graph
				.selectAll('g.d2b-expanded-bubble-indicator')
					.data(sorting.expanded, function(d){return d.key;});

			$$.expandedBubbleIndicator.enter(indicator);
			$$.expandedBubbleIndicator.update(indicator, indicatorPosition);
			$$.expandedBubbleIndicator.exit(indicator);

			//	add tooltip to indicator
			indicator
				.call(
					d2b.UTILS.bindTooltip,
					$$.tooltip,
					function(d){return {data:d, graph:graphData};},
					$$.node.fill
				)

		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

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

	$$.labelOffset = 3;

	$$.point = d2b.SVG.point()
		.size(40)
		.active(true)
		.fill('white');

	// $$.tooltip = function(d){
	// 	var tooltip = d.graph.label;
	// 	if(d.data.label && d.graph.label.toLowerCase() != d.data.label.toLowerCase())
	// 		tooltip += " - "+d.data.label;
	//
	// 	tooltip = "<u><b>"+tooltip+"</b></u>";
	//
	// 	if( (d.line != 'y') && d.data.x != null )
	// 		tooltip += "<br /><b>x: </b>"+$$.xFormat(d.data.x);
	//
	// 	if( (d.line != 'x') && d.data.y != null )
	// 		tooltip += "<br /><b>y: </b>"+$$.xFormat(d.data.y);
	//
	// 	return tooltip
	// };

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
				.attr('y', 7+$$.labelOffset);

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
				.attr('y', 7+$$.labelOffset);

		var newGroupCenter = elem
			.append('g')
				.attr('class','d2b-grid-marker-center')
				.call($$.updateCenter, graphData, false)
				.call($$.events.addElementDispatcher, 'main', 'd2b-grid-marker');

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
					return 'translate('+$$.x(d.x)+',0)';
				})
			.select('line')
				.attr('x1', 0)
				.attr('x2', 0)
				.attr('y1', range[0])
				.attr('y2', range[1])
				.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));

		elem
			.select('.d2b-grid-marker-coordinate')
				.attr('x', function(d){return (d.invert)? -range[0]+$$.labelOffset : -$$.labelOffset;});
	};
	$$.updateMarker.y = function(elem, range, graphData){
		elem
				.style('opacity',1)
				.attr('transform', function(d){
					return 'translate('+range[1]+','+$$.y(d.y)+')';
				})
			.select('line')
				.attr('x1', range[0])
				.attr('x2', -range[1])
				.attr('y1', 0)
				.attr('y2', 0)
				.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]));

		elem
			.select('.d2b-grid-marker-coordinate')
				.attr('x', function(d){return (d.invert)? -range[1]+$$.labelOffset : -$$.labelOffset;});
	};

	$$.updateMarkers = function(elem, graphData, orient, transition){
		var x = 'x', y = 'y';
		if(orient == 'y'){
			x = 'y';
			y = 'x';
		}

		var range = $$[y].range();

		//position marker grouping if transition flag is set transition to new position/opacity
		elem.each(function(d){
			var elemTransition = d3.select(this)

			// elemTransition
			// 	.call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return {line:x, data:d, graph:graphData};});
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
			.classed('d2b-inverted', function(d){return d.invert;})
			.text(function(d){return $$[x+'Format'](d[x]);});
	};

	$$.updateLabel = function(elem, graphData, transition){
		var xRange = $$.x.range();
		var yRange = $$.y.range();

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
					.attr('y', -$$.labelOffset)
					.attr('transform', 'rotate(0)');

				if(d.x != null && d.y != null){
					if($$.x(d.x) > $$.width/2){
						elemTransition
							.attr('transform', 'translate('+$$.x(d.x)+','+$$.y(d.y)+')');

						textTransition
							.style('text-anchor','end')
							.attr('x', $$.labelOffset);
					}else{;
						elemTransition
							.attr('transform', 'translate('+$$.x(d.x)+','+$$.y(d.y)+')');

						textTransition
							.style('text-anchor','start')
							.attr('x', $$.labelOffset);
					}
				}else if(d.y != null){
					if(d.invert){
						elemTransition
							.attr('transform', 'translate('+xRange[0]+','+$$.y(d.y)+')');
						textTransition
							.style('text-anchor', 'start')
							.attr('x', $$.labelOffset);
					}else{
						elemTransition
							.attr('transform', 'translate('+xRange[1]+','+$$.y(d.y)+')');
						textTransition
							.style('text-anchor', 'end')
							.attr('x', -$$.labelOffset);
					}

				}else{
					if(d.invert){
						elemTransition
							.attr('transform', 'translate('+$$.x(d.x)+','+yRange[0]+')');
						textTransition
							.style('text-anchor', 'start')
							.attr('x', $$.labelOffset)
							.attr('transform', 'rotate(-90)');
					}else{
						elemTransition
							.attr('transform', 'translate('+$$.x(d.x)+','+yRange[1]+')');
						textTransition
							.style('text-anchor', 'end')
							.attr('x', -$$.labelOffset)
							.attr('transform', 'rotate(-90)');
					}
				}
			});


	};

	$$.updateCenter = function(elem, graphData, transition){

		elem.each(function(d){

			var elem = d3.select(this);

			if(transition)
				elem = elem.transition().duration($$.animationDuration);

			if(d.y != null && d.x != null){
				$$.point
					.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; })
					.stroke(d2b.UTILS.getColor($$.color, 'label', [graphData]));

				elem
					.style('opacity',1)
					.call($$.point)
					.attr('transform', 'translate('+$$.x(d.x)+','+$$.y(d.y)+')');

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
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

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
				if(d.x)
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
				if(d.y)
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
				// .call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return {data:d, graph:graphData};})

			var groupCenter = group.select('g.d2b-grid-marker-center')
				// .call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return {data:d, graph:graphData};})

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
		var delay = $$.animationDuration / (2*points.length);

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(delay * i)
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
		var delay = $$.animationDuration / (2*points.length);

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(delay * i)
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
		var delay = $$.animationDuration / (2*points.length);

		points.forEach(function(point, i){
			var elem = point.elem;

			elem
				.transition()
					.duration($$.animationDuration / 2)
					.delay(delay * i)
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
					.style('opacity',1)
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
					.style('opacity',1)
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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-histogram*/
d2b.UTILS.AXISCHART.TYPES.histogram = function(){

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

	$$.hist = d3.layout.histogram();

	$$.padding = "0";

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" - "+$$.xFormat(d.data.x + d.data.dx)+": "+$$.yFormat(d.data.y);
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
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.tooltipSVG = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltipSVG');

	//additional histogram properties
	chart.padding =		 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'padding');

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.y;}));
		});
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		$$.currentChartData.forEach(function(graphData){
			graphData.histData = $$.hist.bins(graphData.bins)(graphData.values);
		});

		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData){
			var graph = d3.select(this);

			var xVals = graphData.histData.map(function(d){return d.x;});
			var xRange = [$$.x(d3.min(xVals)),
										$$.x(d3.max(xVals))];

			var barWidth = 1.03*Math.abs(xRange[0]-xRange[1])/graphData.histData.length;

			var padding = d2b.UTILS.visualLength($$.padding, barWidth);

			barWidth -= 1*padding;

			// var barWidth = ($$.width / data.length)/2;

			graph.selectAll('rect')

			var bar = graph.selectAll('rect').data(graphData.histData, function(d,i){
				return d.x;
			});
			var newBar = bar.enter()
				.append('rect')
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.attr('y',$$.y(0))
					.attr('height',0)
					.call($$.events.addElementDispatcher, 'main', 'd2b-histogram-bar');

			bar
				// .call(d2b.UTILS.bindTooltip, $$.tooltip, function(d){return {data:d, graph:graphData};})
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return $$.x.invert(($$.x(d.x) - padding + barWidth/2));},
						y:function(d){return d.y;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				)
				.transition()
					.duration($$.animationDuration)
					.style('fill', d2b.UTILS.getColor($$.color, 'label', [graphData]))
					.attr('x',function(d){return $$.x(d.x) - padding;})
					.attr('width',function(d){return Math.max(0, barWidth);})
					.attr('y', $$.barY)
					.attr('height', $$.barHeight);

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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-line*/
d2b.UTILS.AXISCHART.TYPES.line = function(){

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

	$$.point = d2b.SVG.point()
		.size(40)
		.active(true)
		.fill('white');

	$$.line = d3.svg.line()
    .x(function(d) { return $$.x(d.x); })
    .y(function(d) { return $$.y(d.y); });

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
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
		$$.background.each(function(graphData,i){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() === 0){
				path = graph.append('path')
					.call($$.events.addElementDispatcher, 'main', 'd2b-line');
			}

			$$.line
				.interpolate(graphData.interpolate || 'linear')
				.tension(graphData.tension || 0);

			path
					.style('stroke', d2b.UTILS.getColor($$.color, 'label', [graphData]))
				.datum(function(d){return graphData.values;})
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.line);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			var point = graph.selectAll('g').data(function(d){return d.values;});

			newPoint = point.enter()
				.append('g')
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
				});

			var stroke = d2b.UTILS.getColor($$.color, 'label', [graphData])
			$$.point
				.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; })
				.stroke(stroke);

			point
				.call($$.point)
				.call($$.events.addElementDispatcher, 'main', 'd2b-line-point')
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return d.x;},
						y:function(d){return d.y;},
						fill:d2b.UTILS.getColor($$.color, 'label', [graphData])
					}
				);

			point
				.transition()
					.duration($$.animationDuration)
					.attr('transform',function(d){
						return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
					});

			point.exit()
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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-scatter*/
d2b.UTILS.AXISCHART.TYPES.scatter = function(){

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

	$$.point = d2b.SVG.point()
		.size(function(d){ return d.size || 40; })
		.active(true);

	$$.tooltip = function(d){
		return $$.xFormat(d.data.x)+" : "+$$.yFormat(d.data.y);
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

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			var point = graph.selectAll('g')
					.data(
						function(d){return d.values;},
						function(d){ return d.key || d.x+'-'+d.y; }
					);

			var fill = d2b.UTILS.getColor($$.color, 'label', [graphData]);
			$$.point
				.stroke(fill)
				.fill(fill)
				.type(function(d,i){ return d.symbol || graphData.symbol || 'circle'; });

			newPoint = point.enter()
				.append('g')
				.call($$.point.size(0))
				.attr('transform',function(d){
					return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
				});

			$$.point.size(function(d){ return d.size || 40; });

			point
				.call($$.events.addElementDispatcher, 'main', 'd2b-scatter-point')
				.call($$.tooltipSVG.graph,
					{
						key: graphData.label,
						content: $$.tooltip,
						data: function(d){return {data:d, graph:graphData};},
						x:function(d){return d.x;},
						y:function(d){return d.y;},
						fill: fill
					}
				);

			point
				.transition()
					.duration($$.animationDuration)
					.style('opacity',1)
					.call($$.point)
					.attr('transform',function(d){
						return 'translate('+$$.x(d.x)+','+$$.y(d.y)+')';
					});

			point.exit()
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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
d2b.UTILS.AXISCHART.TYPES.template = function(){

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

	$$.tooltip = function(d){
		return "<u><b>"+d.graph.label+"</b></u> <br />\
						<b>x:</b> "+$$.xFormat(d.data.x)+"<br />\
						<b>y:</b> "+$$.yFormat(d.data.y);
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
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

	//if you need additional chart-type properties, those can go here..

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
    var values = [];
    return values;
  };
	chart.yValues = function(){
		var values = [];
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
			//code for the background visualization goes here
			//this will iterate through all of the background graph containers of this type
		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			//code for the foreground visualization goes here
			//this will iterate through all of the foreground graph containers of this type
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
d2b.UTILS.AXISCHART.TYPES.template = function(type){

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

	$$.tooltip = function(d){
		return "<u><b>"+d.graph.label+"</b></u> <br />\
						<b>x:</b> "+$$.xFormat(d.data.x)+"<br />\
						<b>y:</b> "+$$.yFormat(d.data.y);
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
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

	//if you need additional chart-type properties, those can go here..

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].xValues){
				return d2b.UTILS.AXISCHART.TYPES[type].xValues.call($$, chart);
			}
		}

    var values = [];
    return values;
  };
	chart.yValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].yValues){
				return d2b.UTILS.AXISCHART.TYPES[type].yValues.call($$, chart);
			}
		}

		var values = [];
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].update){
				d2b.UTILS.AXISCHART.TYPES[type].update.call($$, chart);
				if(callback)
					callback();
				return chart;
			}
		}

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			//code for the background visualization goes here
			//this will iterate through all of the background graph containers of this type
		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			//code for the foreground visualization goes here
			//this will iterate through all of the foreground graph containers of this type
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.breadcrumbs = function(){
	var maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	var color = d2b.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentBreadcrumbsData = {items:[]};
	var computedWidth=0, computedHeight=0;
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	var breadcrumbs = {};

	breadcrumbs.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return breadcrumbs;
	};
	breadcrumbs.computedHeight = function(){
		return computedHeight;
	};
	breadcrumbs.computedWidth = function(){
		return computedWidth;
	};
	breadcrumbs.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return breadcrumbs;
	};
	breadcrumbs.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return breadcrumbs;
	};
	breadcrumbs.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return breadcrumbs;
	};

	breadcrumbs.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return breadcrumbs;
	};

	breadcrumbs.data = function(breadcrumbsData, reset){
		if(!arguments.length) return currentBreadcrumbsData;
		currentBreadcrumbsData = breadcrumbsData.data;
		return breadcrumbs;
	}

	breadcrumbs.update = function(callback){
		if(!selection)
			return console.warn('breadcrumbs was not given a selection');

		if(callback){
			callback;
		}

		selection.breadcrumb = selection.selectAll('g.d2b-breadcrumb').data(currentBreadcrumbsData.items, function(d){return (d.key)? d.key : i;});

		var newBreadcrumbs = selection.breadcrumb.enter()
			.append('g')
				.attr('class','d2b-breadcrumb')
				.style('opacity',0);

		newBreadcrumbs.append('path');
		newBreadcrumbs.append('text');

		var breadcrumbIndentSize = scale;
		var padding = scale;
		var breadcrumbHeight = scale * 4;
		selection.breadcrumb.text = selection.breadcrumb.select('text')
				.text(function(d){return d.label;})
				.attr('x',function(d,i){
					if(i == 0)
						return padding+breadcrumbIndentSize/2;
					else
						return padding+breadcrumbIndentSize;
				})
				.attr('y',scale*2.9)
				.style('font-size',scale*2.5+'px');
		selection.breadcrumb.path = selection.breadcrumb.select('path');

		var bcOffset = 0;
		selection.breadcrumb.each(function(d,i){
			var bc = d3.select(this);
			bc.text = bc.select('text');
			bc.path = bc.select('path')
			var pathWidth = bc.text.node().getComputedTextLength() + padding*2 + breadcrumbIndentSize;

			var leftIndent = breadcrumbIndentSize
			var rightIndent = breadcrumbIndentSize;


			if(i==0){
				leftIndent = 0;
			}
			if(i==selection.breadcrumb.size()-1){
				rightIndent = 0;
			}

			bc.path
				.transition()
					.duration(animationDuration/2)
					.attr('d','M 0 0 L '+(leftIndent)+' '+breadcrumbHeight/2+' L 0 '+breadcrumbHeight+' L '+pathWidth+' '+breadcrumbHeight+' L '+(pathWidth+rightIndent)+' '+breadcrumbHeight/2+' L '+pathWidth+' 0 L 0 0 Z');


			bc
				.transition()
					.duration(animationDuration/2)
					.style('opacity',1)
					.attr('transform','translate('+(bcOffset)+',0)');

			bcOffset+=breadcrumbIndentSize + pathWidth;

		});

		computedHeight = breadcrumbHeight;

		selection.breadcrumb.exit()
			.transition()
				.duration(animationDuration/4)
				.style('opacity',0)
				.remove();

		return breadcrumbs;
	};

	return breadcrumbs;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};

d2b.UTILS.chartLayoutAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new d2b.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);

	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};

d2b.createNameSpace("d2b.UTILS.CHARTS.HELPERS");
d2b.UTILS.CHARTS.HELPERS.updateLegend = function(_chart){
  var legendPadding = 10;
  _chart.legend
    .orientation(
      (_chart.legendOrientation == 'right' || _chart.legendOrientation == 'left')? "vertical" : "horizontal"
    )
    .data(_chart.legendData)
    .height(_chart.innerHeight)
    .width(_chart.innerWidth)
    .update();

  var legendTranslation;
  if(_chart.legendOrientation == 'right')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+_chart.innerWidth-_chart.legend.computedWidth())
      +','+
        ((_chart.innerHeight-_chart.legend.computedHeight())/2+_chart.forcedMargin.top)
      +')';
  else if(_chart.legendOrientation == 'left')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left)
      +','+
        ((_chart.innerHeight-_chart.legend.computedHeight())/2+_chart.forcedMargin.top)
      +')';
  else if(_chart.legendOrientation == 'top')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+(_chart.innerWidth-_chart.legend.computedWidth())/2)
      +','+
        _chart.forcedMargin.top
      +')';
  else
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+(_chart.innerWidth-_chart.legend.computedWidth())/2)
      +','+
        (_chart.innerHeight+_chart.forcedMargin.top-_chart.legend.computedHeight())
      +')';

  _chart.selection.legend
    .transition()
      .duration(_chart.animationDuration)
      .attr('transform',legendTranslation);

  var computedSize;
  if(_chart.legendOrientation == 'right' || _chart.legendOrientation == 'left'){
    computedSize = _chart.legend.computedWidth();
  }else{
    computedSize = _chart.legend.computedHeight();
  }
  if(computedSize)
    computedSize += legendPadding;
  _chart.forcedMargin[_chart.legendOrientation] += computedSize;

  _chart.innerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;
  _chart.innerWidth = _chart.outerWidth - _chart.forcedMargin.left - _chart.forcedMargin.right;
};
d2b.UTILS.CHARTS.HELPERS.updateControls = function(_chart){
  var controlsPadding = 10;
  var controlsData = d2b.UTILS.getValues(_chart.controlsData).filter(function(d){return d.visible;});
  controlsData.map(function(d){
    d.data = {state:d.enabled, label:d.label, key:d.key};
  });
  _chart.controls.data(controlsData).width(_chart.innerWidth).update();

  //reposition the controls
  _chart.selection.controls
    .transition()
      .duration(_chart.animationDuration)
      .attr('transform','translate('+(_chart.forcedMargin.left + _chart.innerWidth - _chart.controls.computedWidth())+','+_chart.forcedMargin.top+')');

  var computedSize = _chart.controls.computedHeight();
  if(computedSize)
    computedSize += controlsPadding;
  _chart.forcedMargin.top += computedSize;

  _chart.innerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;

};
d2b.UTILS.CHARTS.HELPERS.updateDimensions = function(_chart){
	_chart.outerWidth = _chart.outerWidth - _chart.forcedMargin.right - _chart.forcedMargin.left;
	_chart.outerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;
	_chart.forcedMargin = {top:0,bottom:0,left:0,right:0};
	_chart.innerWidth = _chart.outerWidth;
	_chart.innerHeight = _chart.outerHeight;
};
d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG = function(_chart){
  //clean container
  _chart.selection.selectAll('*').remove();

  //create svg
  _chart.selection.svg = _chart.selection
    .append('svg')
      .attr('class','d2b-svg d2b-container');

  //create group container
  _chart.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
  _chart.selection.group = _chart.selection.svg.append('g')
      .attr('transform','translate('+_chart.forcedMargin.left+','+_chart.forcedMargin.top+')');

  //create legend container
  _chart.selection.legend = _chart.selection.group
    .append('g')
      .attr('class','d2b-legend');

  //create controls container
  _chart.selection.controls = _chart.selection.group
    .append('g')
      .attr('class','d2b-controls');
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.CHARTPAGE.chartLayout = function(){
	var width = d2b.CONSTANTS.DEFAULTWIDTH();
	var height = d2b.CONSTANTS.DEFAULTHEIGHT();
	var selection;
	var currentChartLayoutData = {chartLayout:{}};
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var chart;
	var generateRequired = true;


	var chartLayout = {};

	chartLayout.chart = function(value){
		if(!arguments.length) return chart;
		chart = value;
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chartLayout;
	};
	chartLayout.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chartLayout;
	};
	chartLayout.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		chart.animationDuration(animationDuration);
		return chartLayout;
	};

	chartLayout.data = function(chartLayoutData, reset){
		if(!arguments.length) return currentChartLayoutData;
		if(reset){
			currentChartLayoutData = {chartLayout:{}};
			generateRequired = true;
		}
		// currentChartLayoutData.chartLayout = chartLayoutData.data.chartLayout
		if(chartLayoutData.data.chartLayout.footnote)
			currentChartLayoutData.chartLayout.footnote = chartLayoutData.data.chartLayout.footnote;

		if(chartLayoutData.data.chartLayout.rightNotes)
			currentChartLayoutData.chartLayout.rightNotes = chartLayoutData.data.chartLayout.rightNotes;

		if(chartLayoutData.data.chartLayout.leftNotes)
			currentChartLayoutData.chartLayout.leftNotes = chartLayoutData.data.chartLayout.leftNotes;

		if(chartLayoutData.data.chartLayout.title)
			currentChartLayoutData.chartLayout.title = chartLayoutData.data.chartLayout.title;

		if(chartLayoutData.data.chartLayout.titleAlt)
			currentChartLayoutData.chartLayout.titleAlt = chartLayoutData.data.chartLayout.titleAlt;

		if(chartLayoutData.data.chartCallback)
			currentChartLayoutData.chartCallback = chartLayoutData.data.chartCallback;

		if(chartLayoutData.data.chartLayout.info)
			currentChartLayoutData.chartLayout.info = chartLayoutData.data.chartLayout.info;

		return chartLayout;
	};

	chartLayout.generate = function(callback){

		selection.selectAll('*').remove();

		selection.wrapper = selection
			.append('div')
				.attr('class','d2b-chart-layout-wrapper');

		selection.container = selection.wrapper
			.append('div')
				.attr('class','d2b-chart-layout d2b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-header');

		selection.container.header.title = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-title');

		selection.container.header.titleAlt = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-title-alt');

		selection.container.header.infoIcon = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-info-icon');

		selection.container.info = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-info');

		selection.container.chart = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-chart');

		chart
			.selection(selection.container.chart);

		selection.container.rightNotes = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-right-notes');

		selection.container.rightNotes.ul = selection.container.rightNotes
			.append('ul');

		selection.container.leftNotes = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-left-notes');

		selection.container.leftNotes.ul = selection.container.leftNotes
			.append('ul');

		selection.container.footnote = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-footnote');
		selection.container.footnote.div = selection.container.footnote
			.append('div');

		selection.container.source = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-source')
			.append('ul');


		generateRequired = false;

		var tempAnimationDuration = animationDuration;
		chartLayout
			.animationDuration(0)
			.update(callback)
			.animationDuration(tempAnimationDuration);

		return chartLayout;
	};

	chartLayout.update = function(callback){
		if(!selection)
			return console.warn('chartLayout was not given a selection');
		if(!chart)
			return console.warn('chartLayout was not given a chart');

		if(generateRequired){
			return chartLayout.generate(callback);
		}

		var chartMargin = {
			top:10,bottom:0,left:0,right:0
		};

		selection.wrapper
				.style('width',width+'px')
				.style('height',height+'px');
		selection.container.header.title
				.text(currentChartLayoutData.chartLayout.title);
		selection.container.header.titleAlt
				.text(currentChartLayoutData.chartLayout.titleAlt);

		var headerHeight = selection.container.header.node().getBoundingClientRect().height

		if(currentChartLayoutData.chartLayout.title){
			selection.container.header.style('opacity',1);
			chartMargin.top+=headerHeight;
		}else{
			selection.container.header.style('opacity','0');
		}

		if(currentChartLayoutData.chartLayout.info){
			selection.container.header.infoIcon
					.html('<i class="fa fa-info-circle"></i>')
					.on('click', function(){
						selection.container.info.classed('d2b-visible', !selection.container.info.classed('d2b-visible'));
						});
			selection.container.info
					.html(currentChartLayoutData.chartLayout.info)
					.style('top', headerHeight+'px')
					.style('height',height - headerHeight + 'px');

		}else{
			selection.container.header.infoIcon.selectAll('*')
				.on('click.d2b-click',null)
				.remove();
			selection.container.info.selectAll('*')
				.remove();
		}

		selection.container.footnote.div.text(currentChartLayoutData.chartLayout.footnote);

		chartMargin.bottom+=selection.container.footnote.node().getBoundingClientRect().height;
		selection.container.footnote
				.style('top',(height-chartMargin.bottom)+'px');

		if(!currentChartLayoutData.chartLayout.rightNotes || currentChartLayoutData.chartLayout.rightNotes.length < 1){
			currentChartLayoutData.chartLayout.rightNotes = [];
		}else{
			chartMargin.right+=width * 0.2+5;
		}
		var rightNote = selection.container.rightNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.rightNotes);
		rightNote.enter()
			.append('li')
				.attr('class','d2b-chart-layout-note')
			.append('div');

		var rightNotesHeight = 0;
		rightNote.select('div')
				.text(function(d){return d})
				.each(function(d){rightNotesHeight += this.getBoundingClientRect().height;});

		rightNote.exit()
				.style('opacity',0)
				.remove();

		// var rightNotesHeight = selection.container.rightNotes.ul.node().getBoundingClientRect().height;
		selection.container.rightNotes
				.style('width',width*0.2+'px')
				.style('height',height-chartMargin.top+'px')
				.style('left',width*0.8-5+'px');
				// .style('top',(height-rightNotesHeight)/2+'px');

		rightNote
			.style('padding-top',Math.max(10,(height - rightNotesHeight)/(1.8*rightNote.size()))+'px');




		if(!currentChartLayoutData.chartLayout.leftNotes || currentChartLayoutData.chartLayout.leftNotes.length < 1){
			currentChartLayoutData.chartLayout.leftNotes = [];
		}else{
			chartMargin.left+=width * 0.2;
		}

		var leftNote = selection.container.leftNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		leftNote.enter()
			.append('li')
				.attr('class','d2b-chart-layout-note')
			.append('div');

		var leftNotesHeight = 0;
		leftNote.select('div')
				.text(function(d){return d})
				.each(function(d){leftNotesHeight += this.getBoundingClientRect().height;});

		leftNote.exit()
				.style('opacity',0)
				.remove();


				selection.container.leftNotes
						.style('width',width*0.2+'px')
						.style('left',5+'px');
						// .style('height',leftNotesHeight+'px')
						// .style('top',(height-leftNotesHeight)/2+'px');

		leftNote
			.style('padding-top',Math.max(10,(height - leftNotesHeight)/(1.8*leftNote.size()))+'px');



		// var leftNote = selection.container.leftNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		// leftNote.enter()
		// 	.append('li')
		// 		.attr('class','d2b-chart-layout-note');
		// leftNote
		// 		.text(function(d){return d});
		// leftNote.exit()
		// 		.style('opacity',0)
		// 		.remove();
		//
		//
		// var leftNotesHeight = selection.container.leftNotes.ul.node().getBoundingClientRect().height;
		// selection.container.leftNotes
		// 		.style('width',width*0.2+'px')
		// 		// .style('height',leftNotesHeight+'px')
		// 		.style('top',(height-leftNotesHeight)/2+'px');


		var chartWidth = width-chartMargin.left-chartMargin.right-10,
				chartHeight = height-chartMargin.top-chartMargin.bottom;

		selection.container.chart
				.style('left',(chartMargin.left+5)+'px')
				.style('top',chartMargin.top+'px')
				.style('width',chartWidth+'px')
				.style('height',chartHeight+'px');

		chart
				.width(chartWidth)
				.height(chartHeight)
				.animationDuration(animationDuration)
				.update(currentChartLayoutData.chartCallback);

		d3.timer.flush();

		if(callback){
			callback();
		}

		return chartLayout;
	};

	return chartLayout;
}

d2b.createNameSpace("d2b.UTILS.CHARTS.MEMBERS");

d2b.UTILS.CHARTS.MEMBERS.events = function(chart, $$, callback){
  return function(key, listener){
    var expKey = key.split('-');
    if(expKey[0] == 'element'){
      $$.events.addElementListener('main', key, listener);
    }else{
      $$.events.addListener(key, listener);
    }

    if(callback) callback(key, listener);

		return chart;
	};
};

d2b.UTILS.CHARTS.MEMBERS.select = function(chart, $$, callback){
  return function(value){
    $$.selection = d3.select(value);
    if(callback) callback(value);
		return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.prop = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = value;
    if(callback) callback(value);
    return chart;
  }
};

// d2b.UTILS.CHARTS.MEMBERS.scale = function(chart, $$, property, callback){
//   return function(value){
//     if(!arguments.length) return $$[property];
//     if(value.type){
//       $$[property].type = value.type;
//       var type = $$[property].type.split(',');
//       if(type[0] == 'quantitative')
//         $$[property].scale = d3.scale[type[1]]();
//       else if(type[0] == 'time')
//         $$[property].scale = d3[type[0]].scale();
//       else
//         $$[property].scale = d3.scale[type[0]]();
//     }
//
//     if(value.domain){
//       $$[property].domain = value.domain;
//       $$[property].scale.domain($$[property].domain);
//     }
//
//     $$[property].hide = value.hide;
//
//     $$[property].invert = value.invert;
//
//     if(callback) callback(value);
//     return chart;
//   }
// };

d2b.UTILS.CHARTS.MEMBERS.format = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = d2b.UTILS.numberFormat(value);
    if(callback) callback(value);
    return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.controls = function(chart, $$, callback){
  return function(value){
    if(!arguments.length) return $$.controlsData;
    for(control in value){
      for(controlProp in value[control]){
        $$.controlsData[control][controlProp] = value[control][controlProp];
      }
    }
    if(callback) callback(value);
    return chart;
  }
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */
d2b.UTILS.chartPage = function(){

  var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.selection;
	$$.currentData = {};

	$$.modifiedData = {};

	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.animateFrom = null;

	$$.events = d2b.UTILS.chartEvents();

	$$.init = function(position){
    if($$.animateFrom || !$$.selection.currentPage){

			$$.selection.selectAll('.d2b-chart-page').classed('d2b-chart-page-old', true);

			$$.selection.currentPage = $$.selection
				.append('div')
					.attr('class','d2b-chart-page')
					// .style('opacity',0)
					.style('left',position.left+'px')
					.style('top',position.top+'px');
		}
	};

	$$.updateGrid = function(charts){
		var chartLayout = $$.selection.currentPage.selectAll('div.d2b-page-chart-layout').data(charts, function(d, i){return d.chart.key || i;});

		var newChartLayout = chartLayout.enter()
			.append('div')
				.attr('class','d2b-page-chart-layout')
				.each(function(d){
					d2b.UTILS.chartLayoutAdapter(d.chart.type, d.chart);
					this.chart = d.chart.chart;
					this.chartLayout = d.chart.chartLayout;

					this.chartLayout
						.select(this)
						.width($$.width*d.width)
						.height(d.height)
						.animationDuration(0);
						// .update(d.chart.chartLayoutData.chartCallback);
				});

		chartLayout
				.each(function(d){
					this.chart
						.data(d.chart.properties.data);
            // console.log(d.chart.type)
					this.chartLayout
						.animationDuration($$.animationDuration)
						.width($$.width*d.width)
						.update(d.chart.chartLayoutData.chartCallback);

				})
				.style('left',function(d){return ($$.width * d.x)+'px'})
				.style('top',function(d){return (d.y)+'px'})
				.each(function(d){
					$$.computedHeight = Math.max($$.computedHeight, d.y+d.height);
				});

		chartLayout.exit()
			.transition()
				.duration($$.animationDuration)
				// .style('opacity',0)
				.remove();

		$$.selection.currentPage
			.transition()
				.duration($$.animationDuration)
				// .style('opacity',1)
				.style('left','0px')
				.style('top','0px');

	};

	var page = {};

  $$.getPosition = function(){
    var position = {top:0, left:0};

    switch($$.animateFrom){
      case 'right':
        position.top = 0;
        position.left = $$.width;
        break;
      case 'left':
        position.top = 0;
        position.left = -$$.width;
        break;
      case 'top':
        position.top = -$$.computedHeight;
        position.left = 0;
        break;
      case 'bottom':
        position.top = $$.computedHeight;
        position.left = 0;
        break;
      default:
    }

    return position;
  };

	var page = {};

	page.on =				d2b.UTILS.CHARTS.MEMBERS.events(page, $$);

  page.width = function(value){
		if(!arguments.length) return $$.width;
		$$.width = value;
		return page;
	};
  page.computedHeight = function(){
		return $$.computedHeight;
	}
  page.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return page;
	};
  page.select = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = d3.select(value);
		return page;
	};
  page.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return page;
	};
  page.animateFrom = function(value){
		if(!arguments.length) return $$.animateFrom;
		$$.animateFrom = value;
		return page;
	};

  page.data = function(data, reset){
		if(!arguments.length) return $$.currentData;

		$$.currentData = data;

    if(!$$.currentData.charts)
      $$.currentData.charts = [];

    if(!$$.currentData.controls)
      $$.currentData.controls = [];

		return page;
	}

  page.update = function(callback){
		if(!$$.selection)
			return console.warn('page was not given a selection');

		var position = $$.getPosition();
    
    if($$.animateFrom && $$.selection.currentPage){
      $$.selection.oldPage = $$.selection.currentPage;
    }
    $$.init(position);

		$$.computedHeight = 0;

    if($$.currentData.charts.length < 1 && !$$.currentData.url){
			console.warn('chart page was not provided any charts or url');
		}else{
			$$.modifiedData.charts = $$.currentData.charts;
			$$.modifiedData.controls = $$.currentData.controls;

			var postData = {controls:{}};
			$$.currentData.controls.forEach(function(d){
				postData.controls[d.key] = d;
			});

      postData.sectionName = $$.currentData.sectionName;
      postData.categoryName = $$.currentData.categoryName || $$.currentData.name;
      postData.pageName = $$.currentData.name;

      if($$.currentData.url){

					var my_request = d3.xhr($$.currentData.url+".json")
					my_request.post(JSON.stringify(postData), function(error,received){
						var data = JSON.parse(received.response);
						if(data.charts)
							$$.modifiedData.charts = data.charts.concat($$.modifiedData.charts);

						$$.updateGrid($$.modifiedData.charts);

					});

			}else{
				$$.updateGrid($$.modifiedData.charts);
			}
		}

		$$.selection.selectAll('.d2b-chart-page-old')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.style('left',-position.left+'px')
				.style('top',-position.top+'px')
				.remove();

		d3.timer.flush();

		if(callback){
			callback();
		}

		$$.events.dispatch("update", $$.selection, [$$.modifiedData])

		// for(key in $$.on.update){
		// 	$$.on.update[key].call(this,$$.modifiedData);
		// }

		return page;
	};

	return page;
}

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*CONTROLS UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CONTROLS");
d2b.UTILS.CONTROLS.checkbox = function(){

	var $$ = {};

	$$.scale = 5;
	$$.selection;
	$$.container;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',state:false};

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	var control = {};

	// var onChange = function(){};

	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.events(control, $$);

	control.checked = function(value){
		if(!arguments.length) return $$.currentData.state;
		$$.currentData.state = value;
		return control.update();
	};
	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;
		return control;
	}

	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('checkbox was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('checkbox data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var checkboxContainer = $$.selection.selectAll('g.d2b-checkbox-container').data([$$.currentData]);
		var newCheckboxContainer = checkboxContainer.enter()
			.append('g')
				.attr('class','d2b-checkbox-container')
				.on('click.d2b-click',function(d,i){
					$$.currentData.state = !$$.currentData.state;
					$$.events.dispatch("change", this, [d,i]);
					control.update();
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-checkbox');

		newCheckboxContainer
			.append('rect')
				.attr('rx',1);
		newCheckboxContainer
			.append('path');

		newCheckboxContainer
			.append('text')
				.text(function(d){return d.label;});

		var checkboxTranslate = 'translate('+0.4*$$.scale+','+0.4*$$.scale+')';
		var check = checkboxContainer.select('path')
				.attr('transform',checkboxTranslate)
				.attr('d',"M"+(0.38)*$$.scale+","+1.06*$$.scale+" l"+0.7*$$.scale+","+0.5*$$.scale+" l"+0.58*$$.scale+","+(-1.19)*$$.scale+"")
				.style('stroke-width',0.25*$$.scale)
				.attr('stroke-dasharray',2.2*$$.scale)
		check
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.attr('stroke-dashoffset',($$.currentData.state)? 0 : 2.2*$$.scale);
		var box = checkboxContainer.select('rect')
				.attr('width',$$.scale*2.1+'px')
				.attr('height',$$.scale*2.1+'px')
				.attr('transform',checkboxTranslate)
				.style('stroke-width',0.25*$$.scale);

		var label = checkboxContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = label.node().getComputedTextLength();

		var padding = $$.scale;
		labelLength += padding;

		$$.computedWidth = labelLength + $$.scale*2.5;
		$$.computedHeight = $$.scale*2.9;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

d2b.UTILS.CONTROLS.radioButtons = function(){
	var $$ = {};

	$$.scale = 5;
	$$.container;
	$$.selection;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',values:[], selected:null};

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	$$.resetValues = function(){
		$$.currentData.values.forEach(function(d){
			d.selected = false;
		});
	};

	var control = {};


	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.events(control, $$);

	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;

		var foundSelected = false;
		$$.currentData.values.forEach(function(d){
			if(foundSelected)
				d.selected = false;

			if(d.selected){
				$$.currentData.selected = d;
				foundSelected = true;
			}
		});

		if(!foundSelected){
			$$.currentData.selected = $$.currentData.values[0];
			$$.currentData.values[0].selected = true;
		}

		return control;
	}


	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('radio buttons was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('radio buttons data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var radioButtonContainer = $$.selection.selectAll('g.d2b-radio-button-container').data($$.currentData.values, function(d){return d.label;});

		var newRadioButtonContainer = radioButtonContainer.enter()
			.append('g')
				.attr('class','d2b-radio-button-container')
				.on('click.d2b-click',function(d,i){
					$$.resetValues();
					d.selected = true;
					$$.currentData.selected = d;
					$$.events.dispatch("change", $$.selection.node(), [$$.currentData,i]);
					control.update();
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-radio-button');

		radioButtonContainer
			.attr('transform',function(d,i){
				return 'translate('+0+','+(i*3.3*$$.scale)+')'
			});

		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-inner')
			.style('fill-opacity',0);
		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-outer');

		newRadioButtonContainer.append('text')
			.text(function(d){return d.label;});

		var circleInner = radioButtonContainer.select('circle.d2b-radio-button-inner')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4);


		var circleOuter = radioButtonContainer.select('circle.d2b-radio-button-outer')
				.attr('r',$$.scale*1+'px')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4)
				.style('stroke-width',0.25*$$.scale);


		circleInner
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.style('fill-opacity',function(d){return (d.selected)? 1: 0;})
				.attr('r',function(d){return (d.selected)? $$.scale*0.5: 0;});

		var label = radioButtonContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = 0;
		label.each(function(){
			labelLength = Math.max(labelLength, this.getComputedTextLength());
		});

		$$.computedWidth = labelLength + $$.scale*3.4;
		$$.computedHeight = $$.currentData.values.length*$$.scale*3.2;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

// d2b.UTILS.CONTROLS.select = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };


//allow imbeded html for selector control
// d2b.UTILS.CONTROLS.selector = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };

d2b.UTILS.CONTROLS.htmlControls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.controlsHash = {};

	$$.selection;
	$$.scale = 5;

	$$.makeControlsHash = function(){
		$$.controlsHash = {};
		$$.currentData.controls.forEach(function(d){
			$$.controlsHash[d.key] = d;
		});
	};

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	var controls = {};

	controls.select = d2b.UTILS.CHARTS.MEMBERS.select(controls, $$);
	controls.width = function(value){
		if(!arguments.length) return $$.maxWidth;
		$$.maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return $$.computedHeight;
	};
	controls.computedWidth = function(){
		return $$.computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return $$.scale;
		$$.scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return controls;
	};

	controls.on =				d2b.UTILS.CHARTS.MEMBERS.events(controls, $$);

	controls.data = function(controlsData, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		$$.makeControlsHash();
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a selection');
		// console.log($$.currentData.controls)
		$$.selection.controlContainer = $$.selection.selectAll('div.d2b-control-container').data($$.currentData.controls, function(d){return d.type+'-'+d.key;});

		var newControl = $$.selection.controlContainer.enter()
			.append('div')
				.attr('class', 'd2b-control-container')

		newControl
			.append('div')
				.attr('class', 'd2b-control-label')
				.text(function(d){return d.label+':';});

		newControl
			.append('div')
				.attr('class', 'd2b-control')
				.each(function(d){
					this.control = new d2b.UTILS.CONTROLS[d.type]();
					this.control.container(d3.select(this));
				});

		$$.selection.controlContainer.control = $$.selection.controlContainer.select('.d2b-control')
			.each(function(d){
				this.control
					.scale($$.scale)
					.data(d)
					.on('change.d2b-change',function(d,i){
						$$.events.dispatch("change", $$.selection, [$$.controlsHash,d,i]);
					})
					.update();
			});


		$$.selection.controlContainer.exit()
			// .transition()
			// 	.duration($$.animationDuration)
			// 	.style('opacity',0)
				.remove();


		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};


d2b.UTILS.CONTROLS.controls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.events = d2b.UTILS.chartEvents();

	$$.selection;
	$$.scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		change:function(){}
	};

	var controls = {};

	controls.scale = 							d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'scale');
	controls.select = 						d2b.UTILS.CHARTS.MEMBERS.select(controls, $$);
	controls.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'selection');
	controls.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'width');
	controls.computedHeight = 		d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'computedHeight');
	controls.computedWidth =  		d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'computedWidth');
	controls.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(controls, $$, 'animationDuration');
	controls.on =									d2b.UTILS.CHARTS.MEMBERS.events(controls, $$);

	controls.data = function(controlsData, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a $$.selection');

		var xPadding = 3*$$.scale;
		var yPadding = $$.scale;
		$$.computedHeight = 0;
		$$.computedWidth = 0;

		if($$.currentData.length > 0){
			var controls = $$.selection.selectAll('g.d2b-control').data($$.currentData,function(d){return d.label+','+d.type;});

			controls.enter()
				.append('g')
					.attr('class','d2b-control')
					.each(function(d){
						d.control = new d2b.UTILS.CONTROLS[d.type]().selection(d3.select(this));
						$$.events.translateEvents(d.control);
					});



			var maxControlHeight = 0;
			var maxControlRowWidth = 0;
			controls.each(function(d){

				d.control.scale($$.scale).data(d.data).update();

				if(($$.computedWidth + d.control.computedWidth()) > $$.maxWidth){
					$$.computedWidth = 0;
					$$.computedHeight += maxControlHeight + yPadding;
					maxControlHeight = 0;
				}

				d3.select(this)
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform','translate('+$$.computedWidth+','+$$.computedHeight+')');
				$$.computedWidth += d.control.computedWidth() + xPadding;

				if(maxControlHeight < d.control.computedHeight()){
					maxControlHeight = d.control.computedHeight();
				}
				if(maxControlRowWidth < $$.computedWidth){
					maxControlRowWidth = $$.computedWidth;
				}
			});

			$$.computedWidth = maxControlRowWidth - xPadding;

			$$.computedHeight += maxControlHeight;
			controls.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();
		}

		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */
d2b.UTILS.dashboardCategory = function(){

  var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.selection;
  $$.chartPageSelection;
	$$.currentData;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.animateFrom = null;

  $$.charts = [];

  // $$.chartPage = new d2b.UTILS.chartPage();

  // $$.chartPage.on('update.d2b-update', function(pageData){
  //   for(key in $$.on.pageUpdate){
  //     $$.on.pageUpdate[key].call(this,pageData);
  //   }
  // });

  $$.events = d2b.UTILS.chartEvents();

	$$.init = function(position){
    if($$.animateFrom || !$$.selection.currentCategory){

      $$.currentPageIndex=0;

      $$.selection.selectAll('.d2b-category').classed('d2b-category-old', true);

      $$.selection.currentCategory = $$.selection
        .append('div')
          .attr('class','d2b-category')
          // .style('opacity',0)
          .style('left',position.left+'px')
          .style('top',position.top+'px');

      $$.selection.currentCategory.label = $$.selection.currentCategory
        .append('div')
          .attr('class','d2b-category-label');

      $$.selection.currentCategory.label.section = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-section');
      $$.selection.currentCategory.label.category = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-category');
      $$.selection.currentCategory.label.pages = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-pages');

      // $$.selection.currentCategory.label.pages.select = $$.selection.currentCategory.label.pages
      //   .append ('select')
      //     .on('change', function(d){
      //       var selectedIndex = $$.selection.currentCategory.label.pages.select.property('selectedIndex')
      //       var pageData          = $$.selection.currentCategory.label.pages.select.option[0][selectedIndex].__data__;
      //       // $$.charts = data.charts;
      //
      //       for(key in $$.on.page-change){
      //         $$.on.page-change[key].call(this,pageData,$$.currentPageIndex,selectedIndex);
      //       }
      //       $$.currentPageIndex = selectedIndex;
      //
      //       // $$.chartPage
      //       //   .data(pageData)
      //       //   .animateFrom(($$.currentPageIndex < selectedIndex)? 'right' : 'left');
      //       //
      //       // category
      //       //   .animateFrom(null)
      //       //   .update();
      //     });

      $$.chartPageSelection = $$.selection.chartPage = $$.selection.currentCategory
        .append('div')
          .attr('class','d2b-chart-page-container');

      // var pageData;

      if($$.currentData.pages.length > 0){
        pageData = $$.currentData.pages[0];
        $$.selection.currentCategory.label.pages.style('display','');
      }else{
        pageData = $$.currentData;
        $$.selection.currentCategory.label.pages.style('display','none');
      }

  		$$.events.dispatch("page-change", $$.selection, [pageData, 0, 0]);

      // $$.chartPage
      //   .selection($$.selection.chartPage)
      //   .animateFrom(null)
      //   .data(pageData);

    }
	};

  $$.getPosition = function(){
    var position = {top:0, left:0};

    switch($$.animateFrom){
      case 'right':
        position.top = 0;
        position.left = $$.width;
        break;
      case 'left':
        position.top = 0;
        position.left = -$$.width;
        break;
      case 'top':
        position.top = -$$.computedHeight;
        position.left = 0;
        break;
      case 'bottom':
        position.top = $$.computedHeight;
        position.left = 0;
        break;
      default:
    }

    return position;
  };

	var category = {};

  category.on =	d2b.UTILS.CHARTS.MEMBERS.events(category, $$);

  category.chartPageSelection =	d2b.UTILS.CHARTS.MEMBERS.prop(category, $$, 'chartPageSelection');

  category.width = function(value){
		if(!arguments.length) return $$.width;
		$$.width = value;
		return category;
	};
  category.computedHeight = function(){
		return $$.computedHeight;
	}
  category.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return category;
	};
  category.select = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = d3.select(value);
		return category;
	};
  category.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return category;
	};
  category.animateFrom = function(value){
		if(!arguments.length) return $$.animateFrom;
		$$.animateFrom = value;
		return category;
	};

  category.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		// newData = true;
		$$.currentData = data.data;

    if(!$$.currentData.pages)
      $$.currentData.pages = [];

		return category;
	}

  category.update = function(callback){
		if(!$$.selection)
			return console.warn('category was not given a $$.selection');

		var position = $$.getPosition();

    if($$.animateFrom && $$.selection.currentCategory){
      $$.selection.oldCategory = $$.selection.currentCategory;
    }
    $$.init(position);

		$$.computedHeight = 0;

    $$.selection.currentCategory.label.section.text($$.currentData.sectionName)
    $$.selection.currentCategory.label.category.text($$.currentData.name)

    // $$.selection.currentCategory.label.pages.select.option = $$.selection.currentCategory.label.pages.select.selectAll('option').data($$.currentData.pages);
    // $$.selection.currentCategory.label.pages.select.option.enter()
    //   .append('option')
    //     .text(function(d){return d.name});

    $$.selection.currentCategory.label.pages.tab = $$.selection.currentCategory.label.pages.selectAll('.d2b-page-tab').data($$.currentData.pages);
    $$.selection.currentCategory.label.pages.tab.enter()
      .append('div')
        .attr('class','d2b-page-tab')
        .text(function(d){return d.name})
        .each(function(d,i){
          d3.select(this).classed('d2b-tab-selected', !i);
        });

    $$.selection.currentCategory.label.pages.tab
        .on('click', function(pageData, i){

          $$.selection.currentCategory.label.pages.tab.classed('d2b-tab-selected', false);
          d3.select(this).classed('d2b-tab-selected', true);

      		$$.events.dispatch("page-change", $$.selection, [pageData, $$.currentPageIndex,i]);

          // for(key in $$.on.page-change){
          //   $$.on.page-change[key].call(this,pageData,$$.currentPageIndex,i);
          // }
          $$.currentPageIndex = i;
        })

    // $$.chartPage
    //   .width($$.width)
    //   .update()
    //   .animateFrom(null);
		$$.selection.selectAll('.d2b-category-old')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.style('left',-position.left+'px')
				.style('top',-position.top+'px')
				.remove();

		$$.selection.currentCategory
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.style('left','0px')
				.style('top','0px');

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback){
			callback();
		}

    // for(key in $$.on.update){
    //   $$.on.update[key].call(this,$$.currentData);
    // }

		return category;
	};

	return category;
}

d2b.UTILS.customEvents = function(){
	var $$ = {};

	$$.events = {};

	// return object with a hash for the events, addListener method, and dispatch method
	return {
		addListener:function(key, listener){
			// split key into event key and event class (namespace)
			var key = key.split(".");
			var eventKey = key[0];
			var eventClass = key[1];

			// if the event handle doesn't exist, initialize it
			if(!$$.events[eventKey])
				$$.events[eventKey] = {};

			// save the listener
			$$.events[eventKey][eventClass] = listener;
		},
		dispatch:function(key, my, args){
			// dispatch all listeners with the event key
			for(var listener in $$.events[key]){
				if($$.events[key][listener])
					$$.events[key][listener].apply(my, args);
			}
		},
		events:function(){return $$.events;}
	}
};

d2b.UTILS.chartEvents = function(){
	var $$ = {};
	$$.elementDispatchers = {};
	$$.elementListeners = {};
	$$.setElementEvents = function(selection, eventKey, listener, namespace, type){
		var callback;
		if(listener){
			callback = function(){
				var mainArguments = Array.prototype.slice.call(arguments);
				mainArguments.unshift(type);
				listener.apply(this, mainArguments);
			}
		}else{
			callback = null;
		}

		selection.on(eventKey.split("-")[1]+"."+namespace+".d2b-element-event", callback);
	};

	// get custom events object
	var handler = d2b.UTILS.customEvents();

	/** Define Custom Element Dispatcher:
		*	Element dispatcher is for adding an array of element selections and
		* binding them all to their own built in events (e.g. 'click', 'mouseover'..).
		* Use: var events = d2b.chartEvents()
		*			 // these three selections will be added to the "main" dispatcher array
		*			 d3.select("body").call(events.addElementDispatcher, "main", "body");
		*			 d3.selectAll("div.foo").call(events.addElementDispatcher, "main", "foo");
		*			 d3.selectAll("div.bar").call(events.addElementDispatcher, "main", "bar");
		*			 // now to add a listener for the "main" elements above to dispatch
		*			 events.addElementListener("main", "click.my_click", function(){ //uses optional namespace "my_click"
		* 				// do something here..
		*					// first argument is the type (body, foo, bar..)
		*					// remaining arguments are default for the event (e.g. for d3 - data and index)
		*			 })
		*/
	handler.addElementListener = function(dispatchKey, key, listener){
		$$.elementListeners[key] = listener;
		for(var selection in $$.elementDispatchers[dispatchKey]){
			$$.setElementEvents($$.elementDispatchers[dispatchKey][selection].selection, key, listener, dispatchKey, $$.elementDispatchers[dispatchKey][selection].type);
		}
	};
	handler.addElementDispatcher = function(selection, dispatchKey, elementKey){
		$$.elementDispatchers[dispatchKey] = $$.elementDispatchers[dispatchKey] || {};
		$$.elementDispatchers[dispatchKey][elementKey] = {selection:selection, type:elementKey.split('.')[0]};
		for(var listener in $$.elementListeners){
			$$.setElementEvents(selection, listener, $$.elementListeners[listener], dispatchKey, $$.elementDispatchers[dispatchKey][elementKey].type);
		}
	};

	// returns all bound events with key/listener attributes
	handler.allEvents = function(chart){
		var events = [];
		var handlerEvents = handler.events()
		for(var key in handlerEvents){
			for(var key2 in handlerEvents[key])
				events.push({key:key+"."+key2,listener:handlerEvents[key][key2]});
		}
		for(var key in $$.elementListeners)
			events.push({key:key,listener:$$.elementListeners[key]})
		return events
	};

	// translate all bound events to a new chart
	handler.translateEvents = function(chart){
		handler.allEvents().forEach(function(event){
			chart.on(event.key, event.listener);
		});
	};
	return handler;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*function cloner*/
Function.prototype.clone = function(){
	var that = this;
	var temp = function temporary(){return that.apply(this,arguments);};
	for(var key in this){
		if(this.hasOwnProperty(key)){
			temp[key]=this[key];
		}
	}
	return temp;
}

d2b.number = function(x){
	return x === null ? NaN : +x;
};

/*bring to front*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

/*non destructive reverse*/
Array.prototype._reverse = function(){
	var tmp = [];
	Array.prototype.push.apply(tmp, this)
	return tmp.reverse();
};

d2b.UTILS.visualLength = function(value,span){
	if(value.toString().indexOf('%') > -1){
		return span * parseFloat(value) / 100;
	}else{
		return parseFloat(value);
	}
};

d2b.UTILS.defined = function(value){
	return value != null && value != undefined;
};

/** apply properties to d2b object
	* use: d2b.UTILS.applyProperties.call(obj, properties);
	*/
d2b.UTILS.applyProperties = function(properties){
	for(var key in properties)
		this[key](properties[key]);

		for(key in properties){
			if(properties[key] != null && properties[key].args)
				this[key].apply(this, properties[key].args)
			else
				this[key](properties[key]);
		}

};

/** check for existance of a nested attribute
	*/
d2b.UTILS.checkNested = function(obj) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
};

/** get color for a d2b element
	*/
d2b.UTILS.getColor = function(color, defaultAttribute, data, reverse){
	data = data || [];
	return function(d){
		var allData = data.slice(0);
		allData.push(d);
		if(!reverse) allData = allData.reverse();

		for(var i = 0;i < allData.length; i++){
			if(allData[i].colorKey !== null && allData[i].colorKey !== undefined){
				return color(allData[i].colorKey);
			}
		}

		return color(allData[allData.length-1][defaultAttribute]);
	};
};

/*extra utilities*/
d2b.UTILS.scrollOffset = function(){
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {top:top, left:left};
};

d2b.UTILS.getValues = function(obj){
	var values = [];
	for(var key in obj) {
		obj[key].key = key;
    values.push(obj[key]);
	}
	return values;
};

/*Formating Utilities*/
d2b.UTILS.niceFormat = function(value, precision){
	if(!precision)
		precision = 0;
	var format = d3.format("."+precision+"f");
	absValue = Math.abs(value);
	if(isNaN(value)){
		return value;
	}else{
		if(absValue < Math.pow(10,3))
			return format(absValue);
		else if(absValue < Math.pow(10,6))
			return format(absValue/Math.pow(10,3))+' thousand';
		else if(absValue < Math.pow(10,9))
			return format(absValue/Math.pow(10,6))+' million';
		else if(absValue < Math.pow(10,12))
			return format(absValue/Math.pow(10,9))+' billion';
		else if(absValue < Math.pow(10,15))
			return format(absValue/Math.pow(10,12))+' trillion';
		else if(absValue < Math.pow(10,18))
			return format(absValue/Math.pow(10,15))+' quadrillion';
		else if(absValue < Math.pow(10,21))
			return format(absValue/Math.pow(10,18))+' quintillion';
		else if(absValue < Math.pow(10,24))
			return format(absValue/Math.pow(10,21))+' sextillion';
		else if(absValue < Math.pow(10,27))
			return format(absValue/Math.pow(10,24))+' septillion';
		else if(absValue < Math.pow(10,30))
			return format(absValue/Math.pow(10,27))+' octillion';
		else if(absValue < Math.pow(10,33))
			return format(absValue/Math.pow(10,30))+' nonillion';
		else if(absValue < Math.pow(10,36))
			return format(absValue/Math.pow(10,33))+' decillion';
		else if(absValue < Math.pow(10,39))
			return format(absValue/Math.pow(10,36))+' undecillion';
		else if(absValue < Math.pow(10,42))
			return format(absValue/Math.pow(10,39))+' duodecillion';
		else if(absValue < Math.pow(10,45))
			return format(absValue/Math.pow(10,42))+' tredecillion';
		else if(absValue < Math.pow(10,48))
			return format(absValue/Math.pow(10,45))+' quattuordecillion';
		else if(absValue < Math.pow(10,51))
			return format(absValue/Math.pow(10,48))+' quindecillion';
		else if(absValue < Math.pow(10,54))
			return format(absValue/Math.pow(10,51))+' sexdecillion';
		else if(absValue < Math.pow(10,57))
			return format(absValue/Math.pow(10,54))+' septendecillion';
		else if(absValue < Math.pow(10,60))
			return format(absValue/Math.pow(10,57))+' octdecillion';
		else if(absValue < Math.pow(10,63))
			return format(absValue/Math.pow(10,60))+' novemdecillion';
		else if(absValue < Math.pow(10,303))
			return format(absValue/Math.pow(10,63))+' vigintillion';
		else
			return format(absValue/Math.pow(10,303))+' centillion';
	}
}

d2b.UTILS.numberFormat = function(preferences){
	var formatString = "";
	var format;
	var units;

	if(preferences.units){
		units = {
			before:(preferences.units.before)?preferences.units.before:"",
			after:(preferences.units.after)?preferences.units.after:"",
		};
	}else{
		units = {
			before:"",
			after:"",
		}
	}

	if(preferences.nice){
		return function(value){return units.before + d2b.UTILS.niceFormat(value, preferences.precision) + units.after};
	}else if(preferences.siPrefixed){
		if(preferences.precision>-1){
			formatString += "."+preferences.precision;
		}
		formatString += "s";
	}else{
		if(preferences.separateThousands){
			formatString += ",";
		}
		if(preferences.precision>-1){
			formatString += "."+preferences.precision+"f";
		}
	}

	format = d3.format(formatString)

	return function(value){
		if(isNaN(value))
			return units.before+value+units.after;
		else
			return units.before+format(value)+units.after;
	}
};

d2b.UTILS.textWrap = function(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};


/*Custom Tweens*/
d2b.createNameSpace("d2b.UTILS.TWEENS");
//arc tween from this.oldArc to this.newArc
d2b.UTILS.TWEENS.arcTween = function(transition, arc){
	transition.attrTween("d",function(d){
		var _self = this;
		_self.oldArc = _self.oldArc || _self.newArc;
		var interpolator = d3.interpolate(_self.oldArc,_self.newArc)
		function tween(t){
			_self.oldArc = interpolator(t);
			return arc(_self.oldArc);
		}
		return tween;
	});
};

/*grid positioning*/
d2b.UTILS.grid = function(width, height, count){
	var ratio = width / height;
	var obj = {};
	obj.columns = Math.min(count,Math.max(1, Math.round(Math.sqrt(count) * (ratio))));
	obj.rows = Math.ceil(count/obj.columns);
	return obj
};

/*automaticaly get scale domain from a set of values*/
d2b.UTILS.domain = function(values, scale, padding){
	var domain = [], extent, range;
	if(scale && scale.rangeBand){
		domain = d3.set(values).values();
		padding = null;
	}else if(values.length == 0){
		domain = [0,1];
	}else if(values.length == 1){
		domain = [values[0]/2, values[0]*1.5];
	}else{
		domain = d3.extent(values);
	}

	if(padding){
		domain[0] -= padding[0];
		domain[1] += padding[1];
	}

	return domain;
};

d2b.createNameSpace("d2b.UTILS.LAYOUTS");

d2b.UTILS.LAYOUTS.partition = function(){

  var $$ = {};

  $$.group = function(rows, columns){
    var column = columns.shift();

    // var childrenHash = {};
    var children = [];
    var child;

    var groups = d3.nest()
      .key(function(d){ return d[column.column]; })
      .entries(rows);

    groups.forEach(function(group){
      child = {
        allChildren: group.values,
        name: group.key,
        top: column.top
      };

      if(columns.length){
        child.children = $$.group(child.allChildren, columns.slice(0));
      }else{
        child.size = d3.sum(child.allChildren, function(d){return d.count;});
      }

      if(["null", "undefined"].indexOf(child.name) === -1)
        children.push(child);
      else{
        children = children.concat(child.children);
      }

    });

    //
    // d.forEach(function(row){
    //   child = childrenHash[row[column.column]] = childrenHash[row[column.column]] || {allChildren:[]};
    //   child.allChildren.push(row);
    // });
    //
    // for(key in childrenHash){
    //   child = childrenHash[key];
    //   child.name = key;
    //   child.top = column.top;
    //   if(columns.length > 0)
    //     child.children = $$.group(child.allChildren, columns.slice(0));
    //   if(columns.length == 0){
    //     child.size = d3.sum(child.allChildren, function(d){return d.count;});
    //   }
    //   console.log(column.column);
    //   console.log(key);
    //   if(child.name)
    //     children.push(child);
    //   else{
    //     children = children.concat(child.children);
    //   }
    // };

    return children;
  };

  var my = function(data, columns, title){
    return {
      "name": title,
      "top": true,
      "children": $$.group(data, columns.slice(0))
    };
  };

  return my;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
d2b.createNameSpace("d2b.UTILS.LEGENDS");
d2b.UTILS.LEGENDS.legend = function(){

	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.maxHeight = d2b.CONSTANTS.DEFAULTHEIGHT();
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	$$.currentLegendData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.orientation = 'horizontal';
	$$.padding = 5;
	$$.active = false;

	$$.scale = 5;

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	$$.getPathForeground = function(d){
		var scale = Math.pow($$.scale/1.7, 1.5);
		if(d.open)
			return d.path.size(scale * 4)(d);
		else
			return d.path.size(scale * 15)(d);
	};
	$$.getPathBackground = function(d){
		var scale = Math.pow($$.scale/1.7, 1.5);
		if(d.open || !d.hovered)
			return d.path.size(scale * 15)(d);
		else if(d.hovered)
			return d.path.size(scale * 35)(d);
	};

	$$.enterElements = function(){

				$$.computedHeight = 0;
				$$.computedWidth = 0;

				$$.innerMaxHeight = $$.maxHeight - $$.padding*2;
				$$.innerMaxWidth = $$.maxWidth - $$.padding*2;


				$$.selection.item = $$.selection.selectAll('g.d2b-legend-item')
						.data($$.currentLegendData.items, function(d){return d.label;});

				var newItem = $$.selection.item.enter()
					.append('g')
						.attr('class','d2b-legend-item')
						.style('opacity',0)
						.on('mouseover.d2b-mouseover',function(d,i){
							d.hovered = true;
							var elem = d3.select(this);
							if($$.active){
								if(d.open){
									elem.select('path.d2b-legend-symbol-foreground')
										.transition()
											.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
											.style('fill-opacity', 0.4);
								}else{
									elem.select('path.d2b-legend-symbol-background')
										.transition()
											.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
											.attr('d', $$.getPathBackground(d));
								}
							}
						})
						.on('mouseout.d2b-mouseout',function(d,i){
							d.hovered = false;
							var elem = d3.select(this);

							elem.select('path.d2b-legend-symbol-foreground')
								.transition()
									.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
									.style('fill-opacity', function(d){
										if(d.open)
											return 0;
										else
											return 0.8;
									});
							elem.select('path.d2b-legend-symbol-background')
								.transition()
									.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
									.attr('d', $$.getPathBackground(d));
						})
						.call($$.events.addElementDispatcher, 'main', 'd2b-legend-item');

				newItem.append('path')
					.attr('class', 'd2b-legend-symbol-background')
					.style('stroke', d2b.UTILS.getColor($$.color, 'label'));

				newItem.append('path')
					.attr('class', 'd2b-legend-symbol-foreground')
					.style('fill', d2b.UTILS.getColor($$.color, 'label'));

				newItem.append('text')
						.text(function(d){return d.label;});

	};


	$$.updateElements = function(){

				var symbolBackground = $$.selection.item.select('path.d2b-legend-symbol-background');

				symbolBackground
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
						.style('stroke', d2b.UTILS.getColor($$.color, 'label'))
						.style('stroke-width', 1)
						.attr('transform', 'translate(0,'+$$.scale/10+')')
						.attr('d', function(d){return $$.getPathBackground(d);});

				var symbolForeground = $$.selection.item.select('path.d2b-legend-symbol-foreground');

				symbolForeground
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
						.attr('transform', 'translate(0,'+$$.scale/10+')')
						.style('fill', d2b.UTILS.getColor($$.color, 'label'))
						.style('fill-opacity', function(d){
							if(d.open)
								return (d.hovered)?0.4:0;
							else
								return 0.8;
						})
						.attr('d', function(d){return $$.getPathForeground(d);});

				$$.selection.item.classed('d2b-active', ($$.active)? true:false)

				$$.selection.item.text = $$.selection.item.select('text')
						.style('font-size',$$.scale*2.5+'px')
						.attr('x',$$.scale*2)
						.attr('y',$$.scale);

	};

	$$.updatePositions = function(){

		var xCurrent = $$.scale + $$.padding;
		var yCurrent = $$.scale + $$.padding;
		var maxItemLength = 0;
		var maxY = 0;

		if($$.currentLegendData.items.length > 0){

			if($$.orientation == 'vertical'){

				$$.selection.item
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							var position = 'translate('+xCurrent+','+yCurrent+')';

							if(yCurrent > maxY)
								maxY = yCurrent

							yCurrent += $$.scale*4;
							maxItemLength = Math.max(maxItemLength,d3.select(this).select('text').node().getComputedTextLength());
							if(yCurrent + $$.scale > $$.innerMaxHeight){
								yCurrent = $$.scale + $$.padding;
								xCurrent += maxItemLength + $$.scale * 6;
								maxItemLength = 0;
							}
							return position;
						});

				$$.computedWidth = xCurrent + maxItemLength + $$.scale*2 + $$.padding;
				$$.computedHeight = maxY + $$.scale + $$.padding;

			}else{

			  var maxItemLength = 0;
				$$.selection.item.text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += $$.scale*6;
				var itemsPerRow = Math.floor(($$.innerMaxWidth+3*$$.scale)/maxItemLength);

				$$.selection.item
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							if(i%itemsPerRow == 0 && i > 0){
								xCurrent = $$.scale + $$.padding;
								yCurrent += $$.scale*4
							}
							var position = 'translate('+xCurrent+','+yCurrent+')';
							xCurrent += maxItemLength;
							return position;
						});

				$$.computedHeight = yCurrent + $$.scale + $$.padding;
				$$.computedWidth = ($$.selection.item.size() > itemsPerRow)?
															maxItemLength * itemsPerRow - 3*$$.scale + $$.padding*2
															:
															maxItemLength * $$.selection.item.size() - 3*$$.scale + $$.padding*2;

			}

		}
	};

	$$.exitElements = function(){
		$$.selection.item.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	var legend = {};

	legend.select = 							d2b.UTILS.CHARTS.MEMBERS.select(legend, $$, function(){ $$.generateRequired = true; });
	legend.selection = 						d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'selection', function(){ $$.generateRequired = true; });
	legend.width = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'maxWidth');
	legend.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'maxHeight');
	legend.animationDuration = 		d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'animationDuration');
	legend.legendOrientation = 		d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'legendOrientation');
	legend.on = 									d2b.UTILS.CHARTS.MEMBERS.events(legend, $$);
	legend.color = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'color');
	legend.padding = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'padding');
	legend.scale = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'scale');
	legend.orientation = 					d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'orientation');
	legend.active = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'active');
	legend.computedHeight = function(){
		return $$.computedHeight;
	}
	legend.computedWidth = function(){
		return $$.computedWidth;
	}
	legend.data = function(legendData, reset){
		if(!arguments.length) return $$.currentLegendData;
		$$.currentLegendData = legendData.data;

		$$.currentLegendData.items.forEach(function(item){
			item.path = d2b.UTILS.symbol().type(item.symbol || 'circle');
		});

		return legend;
	}

	legend.update = function(callback){
		if(!$$.selection)
			return console.warn('legend was not given a selection');

		$$.enterElements();
		$$.updateElements();
		$$.updatePositions();
		$$.exitElements();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return legend;
	};

	return legend;
};

/**
 *   This 'loader' will instantiate a multi-file loader. It is used to avoid
 *   duplicate (redundant) file requests and process multiple file requests
 *   asynchronously.
*/
d2b.UTILS.loader = function(){

  var $$ = {};

  // keep track of how many file loads are in progress
  $$.inProgress = 0;

  // all files that have been loaded for this loader, identified by their key
  $$.files = {};

  // callback stack
  $$.stack = [];

  /**
   * Flush the callback stack.
   */
  $$.flushStack = function(){

    if($$.stack.length == 0)
      return;

    var item = $$.stack.shift();

    var my = {};
    if(item.paths === 'all') my = $$.files;
    else{
      item.paths.forEach(function(path){
        my[path.key] = $$.files[path.key];
      });
    }
    
    if(item.callback) item.callback(my);

    $$.flushStack();
  };

  /**
   * The main loader function that will resemble this instance of the multi-file
   * loader.
   * @param paths -- Array of paths for which to fetch data files.
   *        [
   *          {
   *            key:  'file1',                 // defaults to the file name
   *            file: 'file.csv',              // file name
   *            path: 'http://filestore.com/', // default: 'http://d2b.academicdashboards.com/'
   *            type: 'csv'                    // default: 'json'
   *          }//,{},{}
   *        ]
   * @param callback -- function
   *        function(files){
   *          // do something with the files when they have loaded..
   *        }
   */
  var loader = function(paths, callback){
    $$.stack.push({callback:callback, paths:paths});

    // loop through file paths
    paths.forEach(function(path){
      var file = path.file.split('.');

      // set path config defaults
      path.key = path.key || path.file;
      path.path = path.path || "http://d2b.s3-website-us-west-2.amazonaws.com/";
      path.type = path.type || file[file.length-1];

      // check if file with key has already been loaded
      if(!$$.files[path.key]){

        // set this specific file to be in the process of being loaded
        $$.files[path.key] = true;
        // increment the amount of files in progress
        $$.inProgress++;

        // request file with path, file, and type
        d3[path.type](path.path+path.file, function(data){

          // once this file has been loaded decrement the file in progress counter
          $$.inProgress--;
          // save the loaded data
          $$.files[path.key] = data;

          //if no more files are in progress, flush the call stack
          if(!$$.inProgress) $$.flushStack();
        });
      }
    });

    //if no files were queued, flush the call stack
    if(!$$.inProgress)
      $$.flushStack();

    return loader;
  };

  loader.loadAll = function(_){
    $$.stack.push({callback:_, paths: 'all'});
    if(!$$.inProgress) $$.flushStack();
  };

  return loader;
};

// default loader instance
d2b.UTILS.load = new d2b.UTILS.loader();

/*tooltip utilities*/
d2b.UTILS.bindTooltip = function(element, html, data, fill){
	if(html){
		element
			.on('mouseover.d2b-mouseover-tooltip', function(d,i){
				var nodeData = (typeof data === "function")? data.apply(this, arguments) : (data || d);
				var nodeHtml = (typeof html === "function")? html.apply(this, [nodeData, i]) : html;
				var nodeFill = (typeof fill === "function")? fill.apply(this, arguments) : fill;
				d2b.UTILS.createTooltip(d3.select(this), nodeHtml, nodeFill);
			})
			.on('mouseout.d2b-mouseout-tooltip', function(d,i){
				d2b.UTILS.removeTooltip();
			});
	}else{
		d2b.UTILS.unbindTooltip();
	}
};

d2b.UTILS.unbindTooltip = function(elem){
	d2b.UTILS.removeTooltip();
	elem
		.on('mouseover.d2b-mouseover-tooltip', null)
		.on('mouseout.d2b-mouseout-tooltip', null)
		.on('mousemove.d2b-mousemove-tooltip', null);
};
d2b.UTILS.createTooltip = function(elem, html, fill){
	fill = fill || '#555'
	d3.selectAll('.d2b-general-tooltip')
		.remove();

	var body = d3.select('body');
	var tooltip = body.append('div')
			.attr('class','d2b-general-tooltip')
			.html(html)
			.style('color', function(d){
				return (d3.hsl(fill).l > 0.75)? 'black' : 'white';
			})
			.style('background', fill)
			.style('border-color', d3.rgb(fill).darker(1))
			.style('opacity',0);

	tooltip
		.transition()
			.duration(50)
			.style('opacity',1);

	tooltip.call(d2b.UTILS.moveTooltip);

	elem.on('mousemove.d2b-mousemove-tooltip',function(){
		tooltip
			.transition()
				.duration(50)
				.ease('linear')
				.call(d2b.UTILS.moveTooltip);
	});
	return tooltip;
};

d2b.UTILS.removeTooltip = function(){
	d3.selectAll('.d2b-general-tooltip')
		.remove();
};

//move the tooltip to be next to the cursor
d2b.UTILS.moveTooltip = function(tooltip){
	var body = d3.select('body');
	var offsetX = 15;
	var scroll = d2b.UTILS.scrollOffset();
	var bodyWidth = body.node().getBoundingClientRect().width;

	var positionRight = (scroll.left+d3.event.clientX < bodyWidth/2);
	var tooltipBox = tooltip.node().getBoundingClientRect();

	var x = positionRight?
								scroll.left+d3.event.clientX+offsetX :
								scroll.left+d3.event.clientX-tooltipBox.width-offsetX;

	var y = scroll.top + d3.event.clientY - tooltipBox.height/2

	tooltip.each(function(d){
		elem = d3.select(this);
		elemUpdate = d3.transition(elem);

		elem
			.classed('d2b-general-tooltip-left', !positionRight)
			.classed('d2b-general-tooltip-right', positionRight);

		elemUpdate
			.style('opacity',1)
			.style('top',y+'px')
			.style('left',x+'px');
	});

	d3.timer.flush();
};
