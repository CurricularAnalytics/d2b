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
  $$.pack = d3.layout.pack().sort(function(a, b){
    // sort by value unless at top level
    return (a.parent.parent &&
            b.parent.parent)? d3.ascending(a.value, b.value) : null;
  });

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
          });

      // init pack labels
      newPackLabel
        .attr('transform', function(d){
          var y = d.center.y - $$.gridY.rangeBand()/3;
          return 'translate('+d.center.x+','+y+')';
        });

      packLabel
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
    background.exit()
      .transition()
        .duration($$.animationDuration)
        .style('opacity', 0)
        .remove();

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
