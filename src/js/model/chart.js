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
    .addProp('width', 960)
    .addProp('height', 500)
    .addProp('size', null)
    .addProp('duration', 500)
    .addProp('legendOrient', 'bottom')
    .addProp('padding', {top: 0, left: 0, right: 0, bottom: 0})
    .addProp('color', d3.scale.category10())
    .addProp('data', null, function (data) {
      if (!arguments.length) return $$.data;
      $$.data = data.data || data;

      return chart;
    })
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
      if (arguments.length === 1) return control;
      for (let key in data) control[key] = data[key];

      return chart;
    })
    .addDispatcher(['beforeUpdate', 'afterUpdate'].concat(events));



  /* Controls */
  const checkbox = d2b.svg.checkbox().size(14);

  $$.controlsData = [];
  model.addControl = (_) => {
    $$.controlsData.push(_);
    return model;
  };

  const updateControls = (transition, margin = {}) => {
    $$.svg.controls = $$.svg.group.selectAll('.d2b-controls')
        .data([$$.controlsData.filter(d => d.visible)]);

    $$.svg.controls.enter()
      .append('g')
        .attr('class', 'd2b-controls');

    const control = $$.svg.controls.selectAll('.d2b-control').data(d => d);

    control.enter()
      .append('g')
        .attr('class', 'd2b-control');

    let x = 0, y = 0, boxHeight = 0;
    const pad = {x: 14, y: 5};

    control.call(checkbox);

    transition.selectAll('.d2b-control')
        .attr('transform', function (d, i) {
          const box = this.getBBox();
          boxHeight = box.height;

          if (x + box.width > $$.width && i > 0) {
            x = 0;
            y += box.height + pad.y;
          }

          const translate = `translate(${x}, ${y})`;
          x += box.width + pad.x;
          return translate;
        });

    margin.top += y + boxHeight + pad.y;
    $$.height -= margin.top;
  };

  /* Legend */
  const updateLegend = () => {
    $$.svg.legend = $$.svg.selectAll('.d2b-legend').data([model.legend]);
    $$.svg.legend.enter()
      .append('g')
        .attr('class', 'd2b-legend');
  };

  /* Main Container */
  const updateContainer = () => {
    $$.svg.main = $$.svg.selectAll('.d2b-main').data([$$.data]);
    $$.svg.main.enter()
      .append('g')
        .attr('class', 'd2b-main');
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
