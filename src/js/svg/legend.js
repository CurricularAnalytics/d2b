d2b.svg.legend = function () {
  const $$ = {};

  const legend = function (g) {
    legend.duration((g.duration)? g.duration() : 0);
    g.each( function (d) {
      const el = d3.select(this);
      legend.selection(el).data(el.datum()).update();
    });
  };

  const click = function (d, i) {
    const clickable = $$.clickable.call(this, d, i),
          allowEmptied = $$.allowEmptied.call(this, d, i);

    if (!clickable) return $$.dispatch.click.call(this, d, i);

    d.empty = !d.empty;

    d3.select(this).transition().duration(100).call(point);

    if (allowEmptied) return $$.dispatch.click.call(this, d, i);

    let allEmpty = true;
    $$.data.forEach( d => allEmpty = (d.empty)? allEmpty : false );

    if (allEmpty) {
      $$.data.forEach( d => d.empty = false );
      legend.generate();
    }

    $$.dispatch.click.call(this, d, i);
  };

  const dblclick = function (d, i) {
    const dblclickable = $$.dblclickable.call(this, d, i);

    if (!dblclickable) return $$.dispatch.dblclick.call(this, d, i);

    $$.data.forEach(d => d.empty = true);
    d.empty = false;

    legend.generate();

    $$.dispatch.dblclick.call(this, d, i);
  };

  const point = d2b.svg.point()
    .stroke( function (d, i) {
      return d3.rgb($$.color.call(this, d, i)).darker(0.3);
    });

  const update = function () {

    $$.svg = $$.selection.selectAll('.d2b-legend').data([$$.data]);

    $$.svg.enter().append('g').attr('class', 'd2b-legend');

    $$.svg.item = $$.svg.selectAll('.d2b-legend-item').data(d => d, $$.key);

    const newItem = $$.svg.item.enter()
      .append('g')
        .style('opacity', 0)
        .attr('class', 'd2b-legend-item');

    newItem
      .append('g')
        .on('click.d2b-legend', click)
        .on('dblclick.d2b-legend', dblclick)
        .on('mouseover.d2b-legend', function (d, i) {
          $$.dispatch.mouseover.call(this, d, i);
        })
        .on('mouseout.d2b-legend', function (d, i) {
          $$.dispatch.mouseout.call(this, d, i);
        })
      .append('text');

    $$.svg.item
        .style('cursor', function (d, i) {
          const clickable = $$.clickable.call(this, d, i),
                dblclickable = $$.dblclickable.call(this, d, i);
          return (clickable || dblclickable)? 'pointer' : 'auto';
        })
      .select('g')
        .attr('transform', `translate(${$$.size / 2}, ${$$.size / 2})`)
      .transition()
        .call(point);

    $$.svg.item.select('text')
      .style('font-size', `${$$.size}px`)
      .attr('transform', `translate(${$$.size / 1.5}, ${$$.size / 3})`)
      .call(d2b.textWrap, $$.label, $$.maxTextLength);

    const maxWidth = $$.size + d3.max($$.svg.item[0], node => itemBox(node).width);

    const pad = {x: $$.size, y: 5};

    newItem.call(position[$$.orient], pad, maxWidth);

    const transition = $$.svg.item
      .transition()
        .duration($$.duration)
        .style('opacity', 1)
        .call(position[$$.orient], pad, maxWidth);

    $$.svg.item.exit()
      .transition()
        .duration($$.duration)
        .style('opacity', 0)
        .remove();

    return legend;
  };

  const itemBox = (node) => {
    const box = d3.select(node).select('text').node().getBBox();
    box.width += $$.size;
    return box;
  };

  const position = {
    horizontal: (transition, pad, maxWidth) => {
      let x = 0, y = 0, maxHeight = 0;
      $$.computedSize = {width: 0, height: 0};
      transition
        .attr('transform', function () {
          const box = itemBox(this);
          if (x + maxWidth > $$.maxSize.width){
            x = 0;
            y += maxHeight + pad.y;
            maxHeight = 0;
          }
          const translate = `translate(${x}, ${y})`;
          maxHeight = Math.max(maxHeight, box.height);
          $$.computedSize.width = Math.max($$.computedSize.width, x + box.width + 5);
          x += maxWidth + pad.x;
          return translate;
        });
      $$.computedSize.height = y + maxHeight;
    },
    vertical: (transition, pad) => {
      let x = 0, y = 0, maxWidth = 0;
      $$.computedSize = {width: 0, height: 0};
      transition
        .attr('transform', function () {
          const box = itemBox(this);
          if (y + box.height > $$.maxSize.height){
            x += maxWidth + pad.x;
            y = 0;
            maxWidth = 0;
          }
          const translate = `translate(${x}, ${y})`;
          maxWidth = Math.max(maxWidth, box.width);
          $$.computedSize.height = Math.max($$.computedSize.height, y + box.height);
          y += box.height + pad.y;
          return translate;
        });
      $$.computedSize.width = x + maxWidth + 5;
    }
  };

  /* Inherit from base model */
  const model = d2b.model.base(legend, $$)
    .addProp('size', 12, null, _ => point.size(1.5 * Math.pow(_ / 2, 2)) )
    .addProp('strokeWidth', '1px', null, _ => point.strokeWidth(_) )
    .addProp('maxSize', {width: 960, height: 500})
    .addProp('orient', 'vertical')
    .addProp('duration', 500)
    .addProp('maxTextLength', Infinity)
    .addProp('selection', null)
    .addProp('data', [], function (_) {
      if(!arguments.length) return $$.data;
      $$.data = _.data || _;
      return legend;
    })
    .addPropFunctor('key', (d, i) => i)
    .addPropFunctor('active', false, null, _ => point.active(_) )
    .addPropFunctor('allowEmptied', false)
    .addPropFunctor('clickable', false)
    .addPropFunctor('dblclickable', false)
    .addPropFunctor('label', (d => d.label))
    .addPropFunctor('symbol', 'circle', null, _ => point.type(_) )
    .addPropFunctor('color', d => d2b.defaultColor(d.label), null, d => point.fill(d))
    .addPropFunctor('empty', (d => d.empty), null, _ => point.empty(_) )
    .addMethod('select', (_) => d3.select(_))
    .addMethod('update', update)
    .addMethod('computedSize', () => $$.computedSize)
    .addMethod('generate', (callback) => {
      const duration = $$.duration;
      legend.duration(0).update(callback).duration(duration);
    })
    .addMethod('clear', () => {
      if ($$.svg && $$.svg.item) {
        $$.svg.item
          .transition()
            .duration($$.duration)
            .style('opacity', 0)
            .remove();
      }
    })
		.addDispatcher(['dblclick', 'click', 'mouseover', 'mouseout']);

  return legend;
};
