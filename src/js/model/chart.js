/**
  * d2b.model.chart() returns a d2b chart model.
  *
  * model.base() will return a chart interface with various built in
  * getter/setter methods.
  * model.values()
  *
  * @param {Object} update - chart update function
  * @param {Array} events  - array of event keys to be added to the dispatcher
  * @param {Object} $$     - value object
  * @return {Object} model - object with model properties and methods
  */

d2b.model.chart = function (update, events = [], $$ = {}) {

  /* Chart interface */
  const chart = (selection) => {
    if(selection.duration) chart.duration(selection.duration());
    chart
      .selection(selection)
      .data(selection.datum())
      .update();
  };

  /* Inherit from base model */
  const model = d2b.model.base(chart, $$)
    .addProp('selection', d3.select('body'))
    .addProp('size', null)
    .addProp('duration', 500)
    .addProp('legendOrient', 'bottom-center')
    .addProp('padding', {top: 0, left: 0, right: 0, bottom: 0}, function (_) {
      if(!arguments.length) return $$.padding;
      if (typeof(_) === 'number') {
        $$.padding = {top: _, left: _, right: _, bottom: _}
      };
      ['top', 'bottm', 'right', 'left'].forEach( d => {
        if (_[d]) $$.padding[d] == _[d];
      });
      return chart;
    })
    .addProp('color', d3.scale.category10())
    .addProp('data', null, function (data) {
      if (!arguments.length) return $$.data;
      $$.data = data.data || data;

      return chart;
    })
    .addPropGet('checkbox',
      d2b.svg.checkbox().on('change.d2b-chart-checkbox', () => chart.update())
    )
    .addPropGet('legend', d2b.svg.legend())
    .addMethod('select', (_) => {
      $$.selection = d3.select(_);
      return chart;
    })
    .addMethod('update', (callback) => {
    	$$.dispatch.beforeUpdate.call($$.selection);

      // execute update
      update();

  		// flush the d3 timer after update complete
  		// this allows for immediate updates with $$.duration = 0
  		d3.timer.flush();

  		$$.dispatch.afterUpdate.call($$.selection);
  		if(callback) callback();

      return chart;
    })
    .addMethod('generate', (callback) => {
      const duration = $$.duration;
      chart
        .duration(0)
        .update()
        .duration(duration);
    })
    .addMethod('control', function (key, data) {
      if (arguments.length === 0) return $$.controlsData;
      const control = $$.controlsData.filter(d => d.key === key)[0];
      if (!control) {
        console.error(`Control ${key} not found.`);
        return chart;
      }
      if (arguments.length === 1) return control;
      for (let key in data) if(key !== 'key') control[key] = data[key];

      return chart;
    })
    .addDispatcher(['beforeUpdate', 'afterUpdate'].concat(events));

  /* Controls */
  $$.controlsData = [];

  model.addControl = (_) => {
    $$.controlsData.push(_);
    return model;
  };

  model
    .addControl({
      key: 'hideLegend', label: 'Hide Legend', visible: false, state: false
    });

  const updateControls = (transition, margin = {}) => {

    $$.svg.controls = $$.svg.group.selectAll('.d2b-controls')
        .data([$$.controlsData.filter(d => d.visible)]);

    $$.svg.controls.enter()
      .append('g')
        .attr('class', 'd2b-controls');

    const control = $$.svg.controls.selectAll('.d2b-control')
        .data(d => d, d => d.key);

    const newControl = control.enter()
      .append('g')
        .style('opacity', 0)
        .attr('class', 'd2b-control');

    control.exit()
      .transition()
        .duration($$.duration)
        .style('opacity', 0)
        .remove();

    let x = 0, y = 0, boxHeight = 0;
    const pad = {x: 12, y: 5};

    control
        .call($$.checkbox)
        .each( function (d) {
          const box = this.getBBox();
          boxHeight = box.height;

          if (x + box.width > $$.width && i > 0) {
            x = 0;
            y += box.height + pad.y;
          }

          this.translate = `translate(${x}, ${y})`;

          x += box.width + pad.x;
        });

    newControl.attr('transform', function () { return this.translate; })

    transition.selectAll('.d2b-control')
        .style('opacity', 1)
        .attr('transform', function () { return this.translate; });

    let marginTop = y + boxHeight;
    if(boxHeight) marginTop += pad.y;
    margin.top += marginTop;
    $$.height -= marginTop;
  };

  /* Legend */
  const updateLegend = (transition, margin = {}) => {

    $$.svg.legend = $$.svg.group.selectAll('.d2b-legend').data([$$.legend]);
    $$.svg.legend.enter()
      .append('g')
        .attr('class', 'd2b-legend');

    let size, x, y;
    const [orient1, orient2] = $$.legendOrient.split("-");
    const legendTransition = $$.svg.legend.transition().duration($$.duration);

    $$.legend
      .selection($$.svg.legend)
      .duration($$.duration)
      .maxSize({width: $$.width, height: $$.height});

    if (chart.control('hideLegend').state) return $$.legend.clear();

    switch (orient1) {
      case 'right':
        $$.legend.orient('vertical').update();

        size = $$.legend.computedSize();
        x = margin.left + $$.width - size.width;

        if(orient2 === 'top') y = margin.top;
        else if(orient2 === 'bottom') y = margin.top + $$.height - size.height;
        else y = margin.top + $$.height / 2 - size.height / 2;

        margin.right += size.width;
        $$.width -= size.width;
        break;
      case 'left':
        $$.legend.orient('vertical').update();

        size = $$.legend.computedSize();
        x = margin.left;

        if(orient2 === 'top') y = margin.top;
        else if(orient2 === 'bottom') y = margin.top + $$.height - size.height;
        else y = margin.top + $$.height / 2 - size.height / 2;

        margin.left += size.width;
        $$.width -= size.width;
        break;
      case 'top':
        $$.legend.orient('horizontal').update();

        size = $$.legend.computedSize();
        y = margin.top;

        if(orient2 === 'left') x = margin.left;
        else if(orient2 === 'right') x = margin.left + $$.width - size.width;
        else x = margin.left + $$.width / 2 - size.width / 2;

        margin.top += size.height;
        $$.height -= size.height;
        break;
      default: // bottom
        $$.legend.orient('horizontal').update();

        size = $$.legend.computedSize();
        y = margin.top + $$.height - size.height;

        if(orient2 === 'left') x = margin.left;
        else if(orient2 === 'right') x = margin.left + $$.width - size.width;
        else x = margin.left + $$.width / 2 - size.width / 2;

        margin.bottom += size.height;
        $$.height -= size.height;
        break;
    }

    legendTransition.attr('transform', `translate(${x}, ${y})`);
  };

  /* Main Container */
  const updateContainer = (transition, margin = {}) => {
    $$.svg.main = $$.svg.group.selectAll('.d2b-main').data([$$.data]);
    $$.svg.main.enter()
      .append('g')
        .attr('class', 'd2b-main');

    transition
      .select('.d2b-main')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
  };

  /* Chart Build Method */
  model.build = () => {

    $$.svg = $$.selection.selectAll('.d2b-svg').data([$$.data]);

    const newSvg = $$.svg.enter()
      .append('svg')
        .attr('class', 'd2b-svg');

    newSvg
      .append('g')
        .attr('class', 'd2b-group');

    $$.svg.group = $$.svg.select('.d2b-group');

    // set dimensions
    const box = $$.selection.node().getBoundingClientRect();

    $$.width = ($$.size && $$.size.width)? $$.size.width : box.width;
    $$.height = ($$.size && $$.size.height)? $$.size.height : box.height;

    const transition = $$.svg
      .transition()
        .duration($$.duration)
        .attr('width', $$.width)
        .attr('height', $$.height)
      .select('.d2b-group')
        .attr('transform', `translate(${$$.padding.left}, ${$$.padding.top})`);

    $$.width -= $$.padding.top + $$.padding.bottom;
    $$.height -= $$.padding.left + $$.padding.right;

    const margin = {left: 0, top: 0, bottom: 0, right: 0};

    updateControls(transition, margin);
    updateLegend(transition, margin);
    updateContainer(transition, margin);

    return model;

  };

  return model;
};
