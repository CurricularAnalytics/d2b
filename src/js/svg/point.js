d2b.svg.point = function () {

  const $$ = {};

  /* Update Function */
  const point = function (g) {
    g.each( function (d, i) {
      const gg = d3.select(this);

      //size, type, fill, stroke, active for this point
      const size = $$.size.call(this, d, i),
            type = $$.type.call(this, d, i),
            fill = $$.fill.call(this, d, i),
            empty = $$.empty.call(this, d, i),
            stroke = $$.stroke.call(this, d, i),
            strokeWidth = $$.strokeWidth.call(this, d, i),
            active = $$.active.call(this, d, i);

      //set symbol properties
      symbol.size(size).type(type);

      //background
      const background = gg.selectAll('path.d2b-point-background').data([d]);

      const backgroundEnter   = background.enter()
        .append('path')
          .attr('class', 'd2b-point-background')
          .attr('d', symbol)
          .style('fill', 'rgba(255, 255, 255, 0)')
          .style('stroke', stroke)
          .style('stroke-width', strokeWidth);

      const backgroundUpdate  = d3.transition(background)
          .attr('d', symbol)
          .style('stroke', stroke)
          .style('stroke-width', strokeWidth);

      //foreground
      const foreground = gg.selectAll('path.d2b-point-foreground').data([d]);

      if (empty) symbol.size(size / 3);

      const foregroundEnter   = foreground.enter()
        .append('path')
          .attr('class', 'd2b-point-foreground')
          .attr('d', symbol)
          .style('fill', fill)
          .style('stroke', stroke)
          .style('stroke-width', strokeWidth);

      const foregroundUpdate  = d3.transition(foreground)
          .attr('d', symbol)
          .style('opacity', (empty)? 0 : 1)
          .style('fill', fill)
          .style('stroke', stroke)
          .style('stroke-width', strokeWidth);

      //if active set hover events otherwise unbind them
      gg
        .on('mouseover.d2b-point', (active)? mouseover : null )
        .on('mouseout.d2b-point', (active)? mouseout : null );

      return point;
    });
  };

  /* Inherit from base model */
  const model = d2b.model.base(point, $$)
    .addPropFunctor('size', 150)
    .addPropFunctor('type', 'circle')
    .addPropFunctor('active', false)
    .addPropFunctor('empty', false)
    .addPropFunctor('fill', 'steelblue')
    .addPropFunctor('stroke', d3.rgb('steelblue').darker(1))
    .addPropFunctor('strokeWidth', '1px');

  /* Private variables and method */
  const symbol = d2b.svg.symbol().type($$.type);

  const mouseover = function (d, i) {
    const size = $$.size.call(this, d, i),
          empty = $$.empty.call(this, d, i),
          type = $$.type.call(this, d, i);

    symbol.type(type);

    d3.select(this).select('path.d2b-point-foreground')
      .transition()
        .duration(100)
        .attr('d', symbol.size((empty)? size / 3 : size))
        .style('opacity', (empty)? 0.5 : 1);

    d3.select(this).select('path.d2b-point-background')
      .transition()
        .duration(100)
        .attr('d', symbol.size((empty)? size : 2.5 * size));
  };

  const mouseout = function (d, i) {
    const size = $$.size.call(this, d, i),
          empty = $$.empty.call(this, d, i),
          type = $$.type.call(this, d, i);

    symbol.type(type);

    d3.select(this).select('path.d2b-point-background')
      .transition()
        .duration(100)
        .attr('d', symbol.size(size));

    d3.select(this).select('path.d2b-point-foreground')
      .transition()
        .duration(100)
        .attr('d', symbol.size((empty)? size / 3 : size))
        .style('opacity', (empty)? 0 : 1);
  };

  return point;
};
