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
