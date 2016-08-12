import {default as base} from '../model/base.js';
import {default as legend} from '../svg/legend.js';

/**
  * d2b.modelChart() returns a d2b chart model.
  *
  * model.base() will return a chart interface with various built in
  * getter/setter methods.
  * model.values()
  *
  * @param {Object} update - chart update function
  * @param {Function} legendConfig  - legend config callback function
  * @param {Object} $$     - value object
  * @return {Object} model - object with model properties and methods
  */

export default function (update, buildChartData = () => {}, legendConfig = () => {}, $$ = {}) {

  // Chart main update function. Usually used as a call from a d3 selection.
  // e.g. d3.select('div.chart').call(d2b.chartPie())
  const chart = (context) => {
    // Iterate through the context and build each element.
    // If context is a transition this transition will propagate to each of
    // the chart elements.
    context.each(function (d, i) {
      const el = d3.select(this);
      const elContext = (context.selection)? el.transition(context) : el;
      build(elContext, i);
    });
  };

  // Settup base model to have generic chart properties.
  const model = base(chart, $$)
    .addProp('legend', legend(), null, legendConfig)
    .addPropFunctor('size', null)
    .addPropFunctor('padding', 0)
    // duration is used if the chart needs an internal update
    .addPropFunctor('duration', 250)
    .addPropFunctor('legendHidden', false);

  // General tools used in generating the chart. These are helpful in the
  // individual charts when the original context is no longer available. These
  // methods ensure that the chart's context is always the first argument for
  // accessor functions or event listeners.
  function newTools (context, data, index) {
    const selection = context.selection? context.selection() : context;
    return {
      context: context,
      selection: selection,
      update: function () {
        const newContext = (context.selection? context.selection() : context)
          .transition()
            .duration(data.duration);

        build(newContext, index);
      }
    };
  }

  // Padding can either be a constant or an object containing any of the
  // attributes (left, right, top, bottom). cleanPadding returns an object
  // with (left, right, top, bottom) attributes.
  function cleanPadding (pad) {
    const padding = {top: 0, left: 0, right: 0, bottom: 0};
    if (typeof(pad) === 'number') return {top: pad, left: pad, right: pad, bottom: pad};
    ['top', 'bottm', 'right', 'left'].forEach( d => {
      if (pad[d]) padding[d] == pad[d];
    });
    return padding;
  }

  // Build a reconstruction of the datum to be used throughout the chart nodes
  function buildData(d, i) {
    const data = {
      data: d,
      legend: $$.legend,
      size: $$.size(d, i),
      padding: $$.padding(d, i),
      legendHidden: $$.legendHidden(d, i),
      duration: $$.duration(d, i)
    };

    const chartData = buildChartData(d, i) || {};

    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        if (prop in chartData) console.error(`Cannot redefine chart data
                                              property '${prop}'. Please use a
                                              different property name.`);
        else chartData[prop] = data[prop];
      }
    }

    return chartData;
  }

  // Main build function to build the chart components and call the 'update'
  // function for the specific chart.
  function build (context, index) {

    const selection = (context.selection)? context.selection() : context,
          datum = selection.datum();

    const data = buildData(datum, index);

    const tools = newTools(context, data, index),
          padding = cleanPadding(data.padding),
          legend = data.legend,
          size = data.size,
          translate = `translate(${padding.left}, ${padding.top})`;

    // trigger before update event
    selection.dispatch('beforeUpdate');

    // enter d2b-svg and d2b-group
    let svg = selection.selectAll('.d2b-svg').data([data]);
    let enterSvg = svg.enter().append('svg').attr('class', 'd2b-svg');

    // setup box attributes
    let box = selection.node().getBoundingClientRect();

    let width = (size && size.width)? size.width : box.width;
    let height = (size && size.height)? size.height : box.height;

    enterSvg
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('class', 'd2b-group')
        .attr('transform', translate);

    // update d2b-svg and d2b-group
    context
      .select('.d2b-svg')
        .attr('width', width)
        .attr('height', height)
      .select('.d2b-group')
        .attr('transform', translate);

    let group = selection.select('.d2b-group');

    // account for padding in box dimensions
    width -= padding.top + padding.bottom;
    height -= padding.left + padding.right;

    // enter update exit position d2b-chart-legend
    let chartLegend = group.selectAll('.d2b-chart-legend')
        .data(data.legendHidden? [] : [data]);

    let enterLegend = chartLegend.enter()
      .append('g')
        .attr('class', 'd2b-chart-legend')
        .style('opacity', 0);

    let exitLegend = chartLegend.exit();

    chartLegend = chartLegend.merge(enterLegend)

    chartLegend
      .on('change', d  => {
        selection.selectAll('.d2b-legend-item').each(d => {
          d.data.hidden = d.__empty__;
        })
        tools.update();
      });

    if (context !== selection) {
      chartLegend = chartLegend.transition(context);
      exitLegend = exitLegend.transition(context).style('opacity', 0);
    }

    chartLegend
      .style('opacity', 1)
      .call(legend.size({width: width, height: height}));

    exitLegend.remove();

    // account for legend spacing
    let legendSpacing = { left: 0, top: 0 };
    if (chartLegend.size()) {
      const legendSize = legend.box(chartLegend),
            legendOrient = legend.orient()(data).split(' '),
            pad = 10;

      if (legendOrient[1] === 'top') legendSpacing.top = legendSize.height + pad;
      if (legendOrient[2] === 'left') legendSpacing.left = legendSize.width + pad;
      if (legendOrient[0] === 'vertical') width -= legendSize.width + pad;
      else height -= legendSize.height + pad;
    }
    // enter update exit main chart container
    const mainTranslate = `translate(${legendSpacing.left}, ${legendSpacing.top})`;

    let main = group.selectAll('.d2b-chart-main').data([data]);

    let mainEnter = main.enter()
      .append('g')
        .attr('class', 'd2b-chart-main')
        .attr('transform', mainTranslate);

    main = main.merge(mainEnter);

    if (context !== selection) main = main.transition(context).attr('transform', mainTranslate);

    // Update the chart with the main context (selection or transition),
    // inner width, inner height, and a tools object.
    update(main, data, index, width, height, tools);

    // trigger after update event
    selection.dispatch('afterUpdate');
  };

  return model;
};
