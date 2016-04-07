// tooltip with id in case of duplicate d2b.tooltip generators

d2b.tooltipAxis = function (id = d2b.id()) {
  const $$ = { graph: {} };

  const tooltip = function (key) {
    if(!arguments.length) return $$.graph;
    return function (graph) {
      if(!arguments.length) return $$.graph[key];
      const old = $$.graph[key];
      updateGraph($$.graph[key] = graph, old);
      return tooltip;
    };
  };

  const getCoords = function (d, i) {
    let coords = {}, at = $$.at.call(this, d, i).split(' ');
    const box = this.getBoundingClientRect();
    at = {x: at[1], y: at[0]};

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

  const nodeMouseover = function (d, i) {
    const box = this.getBoundingClientRect(),
          coords = ($$.followMouse)?
                        {x: d3.event.clientX, y: d3.event.clientY} :
                        getCoords.call(this, d, i);

    let my = ($$.my.call(this, d, i) || '').split(' ');
    my = `${my[0] || 'top'}-${my[1] || 'center'}`

    console.log(coords)
    // updateTooltips([[this, d, i, x, y]]);
    $$.selection.append('div')
      .attr('class', `d2b-tooltip `+
                     `d2b-tooltip-at-${my} `+
                     `d2b-tooltip-style-${$$.style}`)
      .text('hello')
      .style('position', 'fixed')
      // .style('background', 'red')
      .style('top', coords.y+'px')
      // .style('transform', 'translateX(-100%)')
      .style('left', coords.x+'px');
    console.log(this.getBoundingClientRect(), d3.event.clientY)
  };
  const nodeMousemove = function (d, i) {
    if ($$.followMouse) nodeMouseover.call(this, d, i);
  };
  const nodeMouseout = function () {
    // $$.selection.select('div').remove();
  };

  const event = (listener, type) => {
    return `${listener}.d2b-tooltip-${id}-${type}`;
  };

  const updateGraph = (newGraph, oldGraph) => {
    if (oldGraph) {
      oldGraph
        .on(event('mouseover', 'node'), null)
        .on(event('mouseout', 'node'), null)
        .on(event('mousemove', 'node'), null);
    }
    if (newGraph) {
      newGraph
        .on(event('mouseover', 'node'), nodeMouseover)
        .on(event('mouseout', 'node'), nodeMouseout)
        .on(event('mousemove', 'node'), nodeMousemove);
    }
  };

  const updateTracker = (newTracker, oldTracker) => {
    if (oldTracker) {
      oldTracker
        .on(event('mouseover', 'tracker'), null)
        .on(event('mouseout', 'tracker'), null)
        .on(event('mousemove', 'tracker'), null);
    }
    if (newTracker) {
      newTracker
        .on(event('mouseover', 'tracker'), trackerMouseover)
        .on(event('mouseout', 'tracker'), trackerMouseout)
        .on(event('mousemove', 'tracker'), trackerMousemove);
    }
  };

  const updateContainer = (newContainer, oldContainer) => {
    if (oldContainer) oldContainer.select(`.d2b-tooltip-area-${id}`).remove();
    if (!newContainer) return;
    $$.selection = newContainer.selectAll(`.d2b-tooltip-area-${id}`).data([1]);
    $$.selection.enter().append('div').attr('class', `d2b-tooltip-area-${id} d2b-tooltip-area`);
  };

  /* Inherit from base model */
  const model = d2b.model.base(tooltip, $$)
    .addProp('tracker', null, null, (n, o) => {
      updateTracker(n, o);
    })
    .addProp('container', d3.select('body'), null, (n, o) => {
      updateContainer(n, o);
    })
    .addProp('layout', 0)
    .addProp('style', 0)
    .addProp('followMouse', true)
    .addProp('trackX', true)
    .addProp('trackY', true)
    .addProp('equalOverride', true)
    .addProp('perGraph', true)
    .addPropFunctor('my', null)
    .addPropFunctor('at', 'center-center')
    .addPropFunctor('html', null);

  return tooltip;
};
