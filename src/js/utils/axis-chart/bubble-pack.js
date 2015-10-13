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
