// tooltip with id in case of duplicate d2b.tooltip generators

d2b.tooltip = function (id = d2b.id()) {
  const $$ = {};

  const tooltip = function (selection) {
    selection
      .on(event('mouseover', 'node'), mouseover)
      .on(event('mouseout', 'node'), mouseout)
      .on(event('mousemove', 'node'), mousemove);

    return tooltip;
  };

  const getCoords = function (d, i) {
    const box = this.getBoundingClientRect();
    let coords = {};

    // construct at object, if null automatically set it based on cursor event position
    let at = ($$.at.call(this, d, i) || ((d3.event.clientX > window.innerWidth / 2)? 'center left' : 'center right')).split(' ');
    at = {x: at[1], y: at[0]};

    // switch for horizontal coordinate
    switch (at.x) {
      case 'left':
        coords.x = box.left;
        break;
      case 'center':
        coords.x = box.left + box.width / 2;
        break;
      default: // right
        coords.x = box.left + box.width;
    }

    // switch for vertical coordinate
    switch (at.y) {
      case 'bottom':
        coords.y = box.top + box.height;
        break;
      case 'center':
        coords.y = box.top + box.height / 2;
        break;
      default: // top
        coords.y = box.top;
    }
    return coords;
  };

  const mouseover = function (d, i) {
    $$.tooltip = $$.selection.selectAll('.d2b-tooltip').data([1]);

    const newTooltip = $$.tooltip.enter()
      .append('div')
        .style('opacity', 0)
        .attr('class', 'd2b-tooltip');

    newTooltip
      .append('div')
        .attr('class', 'd2b-tooltip-content');

    $$.tooltip
      .transition()
        .duration(100)
        .style('opacity', 1);

    $$.dispatch.insert.call($$.tooltip, this, d, i);
  };

  const mousemove = function (d, i) {
    const html = $$.html.call(this, d, i),
          target = $$.target.call(this, d, i),
          color = $$.color.call(this, d, i),
          targetNode = (target)? target.node() : this,
          coords = ($$.followMouse.call(this, d, i))?
                        {x: d3.event.clientX, y: d3.event.clientY} :
                        getCoords.call(targetNode, d, i);

    let my = ($$.my.call(this, d, i) || ((d3.event.clientX > window.innerWidth / 2)? 'left' : 'right'));

    $$.tooltip
        .attr('class', `d2b-tooltip d2b-tooltip-${my}`)
        .style('top', coords.y+'px')
        .style('left', coords.x+'px')
        .style('border-color', color)
      .select('.d2b-tooltip-content')
        .html(html);

    $$.dispatch.move.call($$.tooltip, this, d, i);
  };

  const mouseout = function (d, i) {
    $$.tooltip
      .transition()
        .duration(100)
        .style('opacity', 0)
        .remove();

    $$.dispatch.remove.call($$.tooltip, this, d, i);
  };

  const event = (listener) => {
    return `${listener}.d2b-tooltip`;//-${id}`;
  };


  const updateContainer = (newContainer, oldContainer) => {
    if (oldContainer) oldContainer.select(`.d2b-tooltip-area-${id}`).remove();
    if (!newContainer) return;
    $$.selection = newContainer.selectAll(`.d2b-tooltip-area-${id}`).data([1]);
    $$.selection.enter().append('div').attr('class', `d2b-tooltip-area-${id} d2b-tooltip-area`);
  };

  /* Inherit from base model */
  const model = d2b.model.base(tooltip, $$)
    .addProp('container', d3.select('body'), null, (n, o) => {
      updateContainer(n, o);
    })
    .addMethod('clear', function (selection) {
      oldGraph
        .on(event('mouseover'), null)
        .on(event('mouseout'), null)
        .on(event('mousemove'), null);
    })
    .addPropFunctor('followMouse', false)
    .addPropFunctor('color', null)
    .addPropFunctor('my', null)
    .addPropFunctor('at', null)
    .addPropFunctor('target', null)
    .addPropFunctor('html', null)
    .addDispatcher(['insert', 'move', 'remove']);

  return tooltip;
};
