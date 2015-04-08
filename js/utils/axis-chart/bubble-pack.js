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

  $$.packData = [];

	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

  //pack layout
  $$.pack = d3.layout.pack()
    .size([500,500])
    .value(function(d) { return d.size; });

  $$.persistentData = {
    expandedNodes:{}
  };

  $$.resetExpandedNodes = function(node){
    $$.persistentData.expandedNodes[node.key] = false;
    if(node.children){
      node.children.forEach(function(child){
        $$.resetExpandedNodes(child);
      });
    }
  };

  //This function will find the weighted position of all parent nodes based on child x/y/size
  $$.setParentPositions = function(node){
    if(node.children){
      node.x0 = 0;
      node.y0 = 0;
      node.children.forEach(function(childNode){
        $$.setParentPositions(childNode);
        node.x0 += (childNode.x0 * childNode.value)/node.value;
        node.y0 += (childNode.y0 * childNode.value)/node.value;
      });
    }
  };

  $$.flatten = function(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children)
            node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
        if (!node.id)
            node.id = ++i;
        nodes.push(node);
        return node.size;
    }

    root.size = recurse(root);
    return nodes;
  }

  $$.addNodeKey = function(d){
    d.key = d.name;
    if(d.parent){
      d.key += $$.addNodeKey(d.parent);
    }
    return d.key;
  };

  $$.packJoin = function(){
    var parentPack = {
      children:$$.currentChartData.map(function(d){return d.pack;})
    };
    $$.pack(parentPack);
		if(parentPack.children)
	    parentPack.children.forEach(function(d){d.parent = null;});
  }

  $$.bubbleEnter = function(graph, graphData, bubble){
    newBubble = bubble.enter()
      .append('g')
        .attr('class', 'd2b-bubble')
        .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+' - '+d.name+'</b>';},function(d){return d.value;})
        .call(d2b.UTILS.bindElementEvents, $$, 'bubble')
        .attr('transform', function(d){
          if(d.parent){
            if(!$$.persistentData.expandedNodes[d.parent.key])
              return 'translate('+$$.x.customScale(d.parent.x0)+','+$$.y.customScale(d.parent.y0)+')';
          }
          return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';
        })
        .style('opacity',0);

    newBubble
      .append('circle')
        .attr('class','d2b-bubble-background')
        .style('stroke', $$.color(graphData.label));

    newBubble
      .append('circle')
        .attr('class','d2b-bubble-foreground')
        .style('fill', $$.color(graphData.label));
  };

  $$.bubbleUpdate = function(graph, graphData, bubble){
    //customize bubbles that contain children
    var bubbleWithChildren = bubble
      .filter(function(d){return (d.children)? true:false;})
      .on('click.d2b-click',function(d){
        $$.persistentData.expandedNodes[d.key] = true;
        $$.axisChart.update();
      })
      .style('cursor','pointer')
      .on('mouseover.d2b-mouseover',function(d){
        d3.select(this)
          .select('.d2b-bubble-background')
          .transition()
            .duration($$.animationDuration/2)
            .attr('r', 3+Math.max(0.5,d.r));
      })
      .on('mouseout.d2b-mouseout',function(d){
          d3.select(this)
            .select('.d2b-bubble-background')
            .transition()
              .duration($$.animationDuration/2)
              .attr('r', Math.max(0.5,d.r));
      });

    //customize bubbles that do not contain children
    bubbleWithChildren
      .select('.d2b-bubble-background')
      .style('stroke', d3.rgb($$.color(graphData.label)).darker(1));

    var bubbleWithoutChildren = bubble.filter(function(d){return (d.children)? false:true;})
      .style('cursor','auto');

    bubbleWithoutChildren
      .select('.d2b-bubble-background')
      .style('stroke', d3.rgb($$.color(graphData.label)));

    //transition visible bubbles
    var bubbleVisibleTransition = bubble.filter($$.visible)
        .classed('d2b-hidden',false)
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0.7)
        .attr('transform', function(d){return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';});
    bubbleVisibleTransition
      .select('circle.d2b-bubble-background')
        .attr('r', function(d){return Math.max(0.5,d.r);});
    bubbleVisibleTransition
      .select('circle.d2b-bubble-foreground')
        .attr('r', function(d){return Math.max(0.5,d.r);});

    //transition hidden bubbles
    var bubbleHiddenTransition = bubble.filter(function(d){
          if(d.parent){
            if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
              return false;
          }else if(!$$.persistentData.expandedNodes[d.key])
            return false;

          return true;
        })
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
      .select('circle.d2b-bubble-background')
        .attr('r', function(d){return Math.max(1,d.r);});
    bubbleHiddenTransition
      .select('circle.d2b-bubble-foreground')
        .attr('r', function(d){return Math.max(1,d.r);});

  };

  $$.bubbleExit = function(graph, graphData, bubble){
    bubble.exit()
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0)
        .remove();
  };

	$$.visible = function(d){
		if(d.parent){
			if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
				return true;
		}else if(!$$.persistentData.expandedNodes[d.key])
			return true;

		return false;
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
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

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
    var values = [];
		// $$.currentChartData.forEach(function(graphData){
		// 	values = values.concat(
		// 		graphData.packed
		// 			.filter($$.visible)
		// 			.map(function(d){return d.x0;})
		// 	);
		// });
		// return values;
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

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;

    $$.packJoin();

    $$.currentChartData.forEach(function(graphData){
      $$.setParentPositions(graphData.pack);
      graphData.packed = $$.flatten(graphData.pack);
      graphData.packed.forEach($$.addNodeKey);
    });

		return chart;
	};

	//chart update
	chart.update = function(callback){
    $$.pack.size([$$.width/2, $$.height/2]);
    $$.packJoin();

		$$.background.each(function(graphData){
			var graph = d3.select(this);
		});

    var indicatorPosition = {x:10, y:10};

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);

      var bubble = graph.selectAll('g.d2b-bubble').data(graphData.packed, function(d){return d.key;});

      $$.bubbleEnter(graph, graphData, bubble);
      $$.bubbleUpdate(graph, graphData, bubble);
      $$.bubbleExit(graph, graphData, bubble);

      var expandedBubbleIndicator = graph.selectAll('g.d2b-expanded-bubble-indicator')
        .data(graphData.packed.filter(function(d){return $$.persistentData.expandedNodes[d.key];}), function(d){return d.key;});

      var newIndicator = expandedBubbleIndicator.enter()
        .append('g')
          .attr('class', 'd2b-expanded-bubble-indicator')
          .on('click.d2b-click', function(d){
            $$.resetExpandedNodes(d);
            d2b.UTILS.removeTooltip();
            $$.axisChart.update();
          })
          .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+' - '+d.name+'</b>';},function(d){return d.value;});

      newIndicator
        .append('rect')
          .attr('width', 50)
          .attr('height', 20)
          .style('fill', $$.color(graphData.label))
          .style('stroke', d3.rgb($$.color(graphData.label)).darker(1));

      newIndicator
        .append('text')
          .attr('x', 25)
          .attr('y', 15)
          .text(function(d){return d.name.substring(0,5);});

      var indicatorTransition = expandedBubbleIndicator
        .transition()
          .duration($$.animationDuration);

      indicatorTransition
        .attr('transform', function(d){
          indicatorPosition.x += 55;
          if(indicatorPosition.x > $$.width-20){
            indicatorPosition.y += 25;
            indicatorPosition.x = 65;
          }

          return 'translate('+(indicatorPosition.x - 55)+','+indicatorPosition.y+')';
        });

      expandedBubbleIndicator.exit()
        // .transition()
        //   .duration($$.animationDuration)
          // .style('opacity',0)
          .remove();


		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
