/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bubble-pack*/
d2b.UTILS.AXISCHART.TYPES.bubblePack = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};

	$$.positionType = 'mean';
	$$.positionTypeX = $$.positionType;
	$$.positionTypeY = $$.positionType;

  $$.packData = [];

	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();

  //pack layout
  $$.pack = d3.layout.pack()
    .size([500,500])
    .value(function(d) { return d.size; });

  $$.persistentData = {
    expandedNodes:{}
  };

	$$.sizeScale = [1,1];
	$$.size = d3.scale.linear();

	//breacrumbs OBJ
	$$.breadcrumbs = new d2b.UTILS.breadcrumbs();
	$$.breadcrumbs.scale(5.5)

  $$.resetExpandedNodes = function(node){
    $$.persistentData.expandedNodes[node.key] = false;
    if(node.children){
      node.children.forEach(function(child){
        $$.resetExpandedNodes(child);
      });
    }
  };


  // BREADCRUMB METHODS
	$$.resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();
	};
	$$.updateBreadcrumbs = function(sequence){
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
			.style('fill', function(d){return $$.fill(d.data);})
			.attr('stroke',function(d){return $$.fillDark(d.data);});

	};
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


	$$.getLeaves = function(node, leaves){
		leaves = leaves || [];
		if(node.children){
			node.children.forEach(function(childNode){
				if(childNode.children)
					leaves = leaves.concat($$.getLeaves(childNode));
				else
					leaves.push(childNode);
			});
		}
		return leaves
	};

  //This function will find the weighted position of all parent nodes based on child x/y/size
  $$.setParentPositions = function(node, positionTypeX, positionTypeY){
    if(node.children){
			node.leaves = $$.getLeaves(node);
			node.children.forEach(function(childNode){
				$$.setParentPositions(childNode, positionTypeX, positionTypeY);
			});

			node.x0 = d2b.MATH[positionTypeX](node.leaves, function(leaf){return leaf.x0;}, function(leaf){return leaf.value/node.value;});
			node.y0 = d2b.MATH[positionTypeY](node.leaves, function(leaf){return leaf.y0;}, function(leaf){return leaf.value/node.value;});
    }
  };

  $$.addNodeKey = function(d, graphIndex){
    d.key = graphIndex + d.name;
    if(d.parent){
      d.key += $$.addNodeKey(d.parent, graphIndex);
    }
    return d.key;
  };

	$$.visible = function(d){
		if(d.parent){
			if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
				return true;
		}else if(!$$.persistentData.expandedNodes[d.key])
			return true;

		return false;
	};

	$$.hidden = function(d){
		if(d.parent){
			if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
				return false;
		}else if(!$$.persistentData.expandedNodes[d.key])
			return false;

		return true;
	};

	$$.getTop = function(d){
		if(d.top)
			return d.name
		else if(d.parent)
			return $$.getTop(d.parent)
		else
			return false;
	};

	$$.getSymbolPathSmall = function(d){
		return $$.getSymbol(d).size(75)(d);
	};
	$$.getSymbolPath = function(d){
		return $$.getSymbol(d).size($$.size(d.value))(d);
	};
	$$.getSymbolPathEnlarged = function(d){
		return $$.getSymbol(d).size(15*Math.pow($$.size(d.value),0.5) + $$.size(d.value))(d);
	};

	$$.getSymbol = function(d){
		return d2b.UTILS.symbol().type(d.symbolType);
	};

	$$.getTopSymbolType = function(d){
		if(d.topSymbol)
			return d.topSymbol;
		else if(d.parent)
			return $$.getTopSymbolType(d.parent);
		else
			return false;
	};

	$$.fill = function(d){
		var key;
		if(d.colorKey)
			key = d.colorKey;
		else if($$.controlsData.bubbleSubFill.enabled)
			key = d.subFillColorKey;
		else if(d.graphColorKey)
			key = d.graphColorKey;
		else
			key = d.graphLabel;

		return $$.color(key);
	};

	$$.fillDark = function(d){
		return d3.rgb($$.fill(d)).darker(1);
	};

	$$.tooltip = function(d){
		var label = d.graph.label;
		if(d.data.name && d.graph.label.toLowerCase() != d.data.name.toLowerCase())
			label += " - "+d.data.name;
		return "<u><b>"+label+"</b></u> <br />\
						<b>x:</b> "+$$.xFormat(d.data.x0)+"<br />\
						<b>y:</b> "+$$.yFormat(d.data.y0)+"<br />\
						<b><i>"+d.data.value+"</i></b>";
	};

	//Define Bubble Object
	$$.bubble = {};

	$$.bubble.mouseover = function(node){
		$$.updateBreadcrumbs($$.getAncestors(node));
		d3.select(this)
			.select('.d2b-bubble-background')
			.transition()
				.attr('d', $$.getSymbolPathEnlarged);
	};
	$$.bubble.mouseout = function(node){
		$$.resetBreadcrumbs();
		d3.select(this)
			.select('.d2b-bubble-background')
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.attr('d', $$.getSymbolPath);
	};
	$$.bubble.enter = function(graph, graphData, bubble){
		var newBubble = bubble.enter()
			.append('g')
				.attr('class', 'd2b-bubble')
				.attr('transform', function(d){
					if(d.parent){
						if(!$$.persistentData.expandedNodes[d.parent.key])
							return 'translate('+$$.x.customScale(d.parent.x0)+','+$$.y.customScale(d.parent.y0)+')';
					}else
						return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';
				})
				.style('opacity',0)
	      .on('mouseover.d2b-mouseover',$$.bubble.mouseover)
	      .on('mouseout.d2b-mouseout',$$.bubble.mouseout)
				.call($$.events.addElementDispatcher, 'main', 'd2b-bubble');

		newBubble
			.append('path')
				.attr('class','d2b-bubble-background');

		newBubble
			.append('path')
				.attr('class','d2b-bubble-foreground')
				.style('fill', $$.fill);
	};
  $$.bubble.update = function(graph, graphData, bubble){

		bubble
			.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return {data:d, graph:graphData};})
			// .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+' - '+d.name+'</b>';},function(d){return d.value;})

    //customize bubbles that contain children
    var bubbleWithChildren = bubble
      .filter(function(d){return (d.children)? true:false;})
      .on('click.d2b-click',function(d){
        $$.persistentData.expandedNodes[d.key] = true;
        $$.axisChart.update();
      })
      .style('cursor','pointer');

    //customize bubbles that do not contain children
    bubbleWithChildren
      .select('.d2b-bubble-background')
			.style('stroke', $$.fillDark);

    var bubbleWithoutChildren = bubble.filter(function(d){return (d.children)? false:true;})
      .style('cursor','auto');

    bubbleWithoutChildren
      .select('.d2b-bubble-background')
			.style('stroke', $$.fill);

    //transition visible bubbles
    var bubbleVisibleTransition = bubble.filter($$.visible)
        .classed('d2b-hidden',false)
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0.7)
        .attr('transform', function(d){return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';});
    bubbleVisibleTransition
      .select('path.d2b-bubble-background')
				.attr('d', $$.getSymbolPath);

    bubbleVisibleTransition
      .select('path.d2b-bubble-foreground')
				.style('fill', $$.fill)
				.attr('d', $$.getSymbolPath);

    //transition hidden bubbles
    var bubbleHiddenTransition = bubble.filter($$.hidden)
        .classed('d2b-hidden',true)
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0)
        .attr('transform', function(d){
          var translate = '';
          if(d.parent)
            translate = 'translate('+$$.x.customScale(d.parent.x0)+','+$$.y.customScale(d.parent.y0)+')';
          else
            translate = 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';
          return translate;
        });
    bubbleHiddenTransition
      .select('path.d2b-bubble-background')
				.attr('d', $$.getSymbolPath);
    bubbleHiddenTransition
      .select('path.d2b-bubble-foreground')
				.attr('d', $$.getSymbolPath);

  };
  $$.bubble.exit = function(graph, graphData, bubble){
    bubble.exit()
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0)
        .remove();
  };


	// Define Expanded Bubble Indicator Object
	$$.expandedBubbleIndicator = {};
	$$.expandedBubbleIndicator.enter = function(graph, graphData, indicator){
    var newIndicator = indicator.enter()
      .append('g')
        .attr('class', 'd2b-expanded-bubble-indicator')
        .on('click.d2b-click', function(d){
          $$.resetExpandedNodes(d);
          d2b.UTILS.removeTooltip();
          $$.axisChart.update();
					$$.resetBreadcrumbs();
        })
				.on('mouseover.d2b-mouseover', function(node){
					$$.updateBreadcrumbs($$.getAncestors(node));
				})
				.on('mouseout.d2b-mouseover', function(node){
					$$.resetBreadcrumbs();
				})
				.call($$.events.addElementDispatcher, 'main', 'd2b-expanded-bubble-indicator');
    newIndicator
      .append('rect')
				.style('fill', $$.fill)
				.style('stroke', $$.fillDark)
        .attr('height', 20);
		newIndicator
			.append('path')
			.style('fill', $$.fill)
			.attr('transform','translate(10, 10)');
    newIndicator
      .append('text')
        .attr('x', 20)
        .attr('y', 15)
        .text(function(d){return d.name.substring(0,4).trim();});

	};
	$$.expandedBubbleIndicator.update = function(graph, graphData, indicator, position){
		var indicatorTransition = indicator
			.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return {data:d, graph:graphData};})
			.transition()
				.duration($$.animationDuration)
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
				.style('fill', $$.fill)
				.style('stroke', $$.fillDark);
		indicatorTransition
			.select('path')
				.attr('d', $$.getSymbolPathSmall)
				.style('fill', $$.fill)

		$$.breadcrumbsContainer
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+(10)+','+(position.y+30)+')');

	};
	$$.expandedBubbleIndicator.exit = function(graph, graphData, indicator){
		indicator.exit()
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.style('opacity',0)
				.remove();
	};

	$$.cleanSizeScale = function(scale){
		if(scale){
			if(scale.length == 1)
				return [scale[0], scale[0]];
			else
				return scale;
		}else if(scale === null){
				return [1,1];
		}
	};

	$$.initData = function(){
		var max = 0;
    $$.currentChartData.forEach(function(graphData, graphIndex){
			graphData.packed = $$.pack(graphData.pack)
      $$.setParentPositions(graphData.pack, $$.positionTypeX, $$.positionTypeY);
      graphData.packed.forEach(function(d){
				d.graphLabel = graphData.label;
				d.graphColorKey = graphData.colorKey;
				d.subFillColorKey = $$.getTop(d) || graphData.colorKey || graphData.label;
				d.symbolType = d.symbol || $$.getTopSymbolType(d) || graphData.symbol || 'circle';
				$$.addNodeKey(d, graphIndex);
				d.key += graphData.label;
	    });
			max = Math.max(max,graphData.packed[0].value);
		});
		$$.size.domain([0, max]);
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
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');

	//type specific properties
	chart.sizeScale =	 				d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'sizeScale', function(){
		$$.sizeScale = $$.cleanSizeScale($$.sizeScale);
	});
	chart.positionType = 			d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionType', function(){
		$$.positionTypeX = $$.positionType;
		$$.positionTypeY = $$.positionType;
		$$.initData();
	});
	chart.positionTypeX = 		d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionTypeX', function(){
		$$.initData();
	});
	chart.positionTypeY = 		d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'positionTypeY', function(){
		$$.initData();
	});

	//xValues and yValues are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
    var values = [];
    $$.currentChartData.forEach(function(graphData){
      values = values.concat(
				graphData.packed
					.filter($$.visible)
					.map(function(d){return d.x0;})
			);
    });
		var merged = [];
		merged = merged.concat.apply(merged, values)
    return merged;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
      values = values.concat(
				graphData.packed
					.filter($$.visible)
					.map(function(d){return d.y0;})
			);
    });
		var merged = [];
		merged = merged.concat.apply(merged, values)
    return merged;
	};

	//data setter
	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;

		$$.initData();

		return chart;
	};

	//chart update
	chart.update = function(callback){

		/** init breadcrumbs, rather than use a generate function, just append
			*	breadcrumb container if it doesn't exist yet.
			*/
		$$.breadcrumbsContainer = $$.general.select('g.d2b-breadcrumbs');
		if($$.breadcrumbsContainer.size() == 0){
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

      var bubble = graph
				.selectAll('g.d2b-bubble')
					.data(graphData.packed, function(d){return d.key;});

      $$.bubble.enter(graph, graphData, bubble);
      $$.bubble.update(graph, graphData, bubble);
      $$.bubble.exit(graph, graphData, bubble);

			var expandedBubbleIndicator = graph
				.selectAll('g.d2b-expanded-bubble-indicator')
					.data(graphData.packed.filter(function(d){return $$.persistentData.expandedNodes[d.key];}), function(d){return d.key;});

			$$.expandedBubbleIndicator.enter(graph, graphData, expandedBubbleIndicator);
			$$.expandedBubbleIndicator.update(graph, graphData, expandedBubbleIndicator, indicatorPosition);
			$$.expandedBubbleIndicator.exit(graph, graphData, expandedBubbleIndicator);
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.TYPES.bubblePack.tools = function(){
  return {
    controlsData:{
      bubbleSubFill: {
        label: "Fill By Sub-Category",
        type: "checkbox",
        visible: false,
        enabled: false
      }
    }
  }
};
