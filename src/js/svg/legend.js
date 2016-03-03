d2b.svg.legend = function () {
  const $$ = {};

  const legend = function (g) {
    if(g.duration) legend.duration(g.duration());
    g.each( function (d) {
      var el = d3.select(this);
      legend
        .selection(el)
        .data(el.datum())
        .update();
    });
  };

  const click = function (d, i) {
    const clickable = $$.clickable.call(this, d, i),
          allowEmptied = $$.allowEmptied.call(this, d, i);

    if (!clickable) return $$.dispatch.click.call(this, d, i);

    d.empty = !d.empty;

    d3.select(this)
      .transition()
        .call(point);

    if (allowEmptied) return;

    let allEmpty = true;
    $$.data.forEach( d => allEmpty = (d.empty)? allEmpty : false );

    if (allEmpty) {
      $$.data.forEach( d => d.empty = false );
      legend.update();
    }

    $$.dispatch.click.call(this, d, i);
  };

  const dblclick = function (d, i) {
    const dblclickable = $$.dblclickable.call(this, d, i);

    if (!dblclickable) return $$.dispatch.dblclick.call(this, d, i);

    $$.data.forEach(d => d.empty = true);
    d.empty = false;

    legend.update();

    $$.dispatch.dblclick.call(this, d, i);
  };

  const point = d2b.svg.point();

  const update = function () {

    $$.svg = $$.selection.selectAll('.d2b-legend').data([$$.data]);

    $$.svg.enter()
      .append('g')
        .attr('class', 'd2b-legend');

    $$.svg.item = $$.svg.selectAll('.d2b-legend-item').data(d => d);

    const newItem = $$.svg.item.enter()
      .append('g')
        .attr('class', 'd2b-legend-item')
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
      .text($$.label)
      .call(d2b.util.textWrap, $$.maxTextLength);

    const maxWidth = d3.max($$.svg.item[0], (node) => node.getBBox().width) + 5;

    const pad = {x: $$.size, y: 5};

    $$.computedSize = {width: 0, height: 0};

    const transition = $$.svg.item
      .transition()
        .duration($$.duration)
        .call(position[$$.orient], pad, maxWidth);

  };

  const position = {
    horizontal: (transition, pad, maxWidth) => {
      let x = 0, y = 0, maxHeight = 0;
      transition
        .attr('transform', function () {
          const box = this.getBBox();
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
      transition
        .attr('transform', function () {
          const box = this.getBBox();
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
    .addProp('size', 16, null, _ => point.size(1.5 * Math.pow(_ / 2, 2)) )
    .addProp('strokeWidth', '1px', null, _ => point.strokeWidth(_) )
    .addProp('maxSize', {width: 960, height: 500})
    .addProp('orient', 'vertical')
    .addProp('duration', 500)
    .addProp('maxTextLength', null)
    .addProp('selection', null)
    .addProp('data', function (_) {
      if(!arguments.length) return $$.data;
      $$.data = _.data || _;
      return legend;
    })
    .addPropFunctor('active', false, null, _ => point.active(_) )
    .addPropFunctor('allowEmptied', false)
    .addPropFunctor('clickable', false)
    .addPropFunctor('dblclickable', false)
    .addPropFunctor('label', (d => d.label))
    .addPropFunctor('symbol', 'circle', null, _ => point.type(_) )
    .addPropFunctor('fill', 'steelblue', null, _ => point.fill(_) )
    .addPropFunctor('stroke', d3.rgb('steelblue').darker(1), null, _ => point.stroke(_) )
    .addPropFunctor('empty', false, null, _ => point.empty(_) )
    .addMethod('select', (_) => d3.select(_))
    .addMethod('update', update)
    .addMethod('computedSize', () => $$.computedSize)
    .addMethod('generate', (callback) => {
      const duration = $$.duration;
      legend
        .duration(0)
        .update()
        .duration(duration);
    })
		.addDispatcher(['dblclick', 'click', 'mouseover', 'mouseout']);

  return legend;
};
