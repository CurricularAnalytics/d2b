import {default as modelChart} from '../model/chart.js';

export default function () {

  // Configure model and chart properties.
  const model = modelChart(update, ['zoomIn', 'zoomOut'])
      .addPropFunctor('interpolate', 'linear');

  const $$ = model.values();
  const chart = model.base();

  // The legend may be configured here. If the items data needs to be defined
  // as something other than the main chart data that can be done here. Also,
  // legend click events can be configured for hiding / showing specific chart
  // elements.
  $$.legend
    .items(d => d.values)
    .active(true)
    .clickable(true)
    .dblclickable(true)
    .on('change', () => { console.log('legend changed!') });

  function update(context, width, height, tools) {
    // context is simply the main chart container to append content to. It may
    // be a d3.selection or a d3.transition

    // width and height represent the pixel size available for this chart to
    // occupy.

    // tools has several methods to help draw the chart for the current context
    // tools.prop($$.interpolate[, this[, args]]) returns the value of the
    // specified property, in this case $$.interpolate. Optionaly, `this`
    // may be specified as well as an arguments array.
    // tools.dispatch('zoomIn'[, this[, args]]) dispatches an event specified by
    // a key, in this case 'zoomIn'. Optionaly, `this` may be specified as well
    // as an arguments array.
  }

  return chart;
};
