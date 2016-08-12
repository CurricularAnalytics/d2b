import {default as modelChart} from '../model/chart.js';

export default function () {

  // Configure model and chart properties.
  const model = modelChart(update, buildData, legendConfig)
      .addPropFunctor('interpolate', 'linear')
      .addPropFunctor('items', d => d);

  const $$ = model.values();
  const chart = model.base();

  // Here you can define a legend setter callback. Every time the a new legend
  // is set, this callback will be executed for configuration.
  function legendConfig (legend) {
    legend.items(d => d.items);
  }

  // You may also do initial legend configuration if you don't want it forced
  // every time the user sets a new legend.
  // $$.legend.active(true);

  // This function is a data reconstruction method. Use this to build that chart
  // data object before the update is executed. This will be the `data` property
  // supplied to the update method.
  function buildData (data, index) {
    return {
      items: $$.items(data, index),
      interpolate: $$.interpolate(data, index)
    };
  }

  function update(context, data, index, width, height, tools) {
    // context is simply the main chart container to append content to. It may
    // be a d3.selection or a d3.transition

    // width and height represent the pixel size available for this chart to
    // occupy.

    // tools has several helpful properties `tools.selection` outer chart
    // selection, `tools.context` outer chart context, `tools.update` update
    // method to update the whole chart
  }

  return chart;
};
