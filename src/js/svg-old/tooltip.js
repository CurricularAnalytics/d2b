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
    for(var key in $$.graph){
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
      var elem = d3.select(this);
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
    for(var key in $$.graph) $$.graph[key].call(d2b.UTILS.unbindTooltip);

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
