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
  * @param {Array} events  - array of event keys to be added to the dispatcher
  * @param {Object} $$     - value object
  * @return {Object} model - object with model properties and methods
  */

export default function (update, $$ = {}) {

  // Chart main update function. Usually used as a call from a d3 selection.
  // e.g. d3.select('div.chart').call(d2b.chartPie())
  const chart = (context) => {
    // Iterate through the context and call chart.update with each element.
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
    .addProp('legend', legend())
    .addPropFunctor('size', null)
    .addPropFunctor('padding', 0)
    // duration is used if the chart needs an internal update
    .addPropFunctor('duration', 250)
    .addPropFunctor('legendHidden', false);

  // General tools used in generating the chart. These are helpful in the
  // individual charts when the original context is no longer available. These
  // methods ensure that the chart's context is always the first argument for
  // accessor functions or event listeners.
  function newTools (context, index) {
    const selection = context.selection? context.selection() : context;
    const tools = {
      // retrieve a chart property e.g. `tools.prop($$.size)` or with extra
      // arguments `tools.prop($$.radius, this, [width, height])`
      prop: (prop, inst, args = []) => {
        inst = inst || context;
        args.unshift(context);
        return (typeof prop === 'function')? prop.apply(inst, args) : prop;
      },
      // dispatch a chart event e.g. `tools.dispatch("beforeUpdate")` or with
      // extra arguments `tools.dispatch("barClick", this, [d, i])`
      dispatch: (key, inst, args = []) => {
        inst = inst || context;
        args.unshift(context);
        return $$.dispatch.apply(key, inst, args);
      },
      // chart selections
      context: context,
      selection: selection,
      // trigger an update for the context under the 'd2b-chart' transition space
      update: function () {
        const newContext = (context.selection? context.selection() : context)
          .transition()
            .duration(tools.prop($$.duration));

        build(newContext, index);
      }
    };

    return tools;
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

  // Main build function to build the chart components and call the 'update'
  // function for the specific chart.
  function build (context, index) {
    const tools = newTools(context, index);

    const selection = (context.selection)? context.selection() : context,
          datum = selection.datum(),
          size = tools.prop($$.size),
          padding = cleanPadding(tools.prop($$.padding)),
          translate = `translate(${padding.left}, ${padding.top})`;


    // trigger before update event
    selection.dispatch('beforeUpdate');

    // enter d2b-svg and d2b-group
    let svg = selection.selectAll('.d2b-svg').data(d => [d]);
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
        .data((tools.prop($$.legendHidden))? [] : [datum]);

    let enterLegend = chartLegend.enter()
      .append('g')
        .attr('class', 'd2b-chart-legend')
        .style('opacity', 0);

    let exitLegend = chartLegend.exit();

    chartLegend = chartLegend.merge(enterLegend);

    if (context !== selection) {
      chartLegend = chartLegend.transition(context);
      exitLegend = exitLegend.transition(context).style('opacity', 0);
    }

    chartLegend
      .style('opacity', 1)
      .call($$.legend.size({width: width, height: height}));

    exitLegend.remove();

    // account for legend spacing
    let legendSpacing = { left: 0, top: 0 };
    if (chartLegend.size()) {
      const legendSize = $$.legend.box(chartLegend),
            legendOrient = $$.legend.orient().call(chartLegend.node(), datum, 0).split(' '),
            pad = 10;

      if (legendOrient[1] === 'top') legendSpacing.top = legendSize.height + pad;
      if (legendOrient[2] === 'left') legendSpacing.left = legendSize.width + pad;
      if (legendOrient[0] === 'vertical') width -= legendSize.width + pad;
      else height -= legendSize.height + pad;
    }

    // enter update exit main chart container
    const mainTranslate = `translate(${legendSpacing.left}, ${legendSpacing.top})`;
    let main = group.selectAll('.d2b-chart-main').data(d => [d]);
    let mainEnter = main.enter()
      .append('g')
        .attr('class', 'd2b-chart-main')
        .attr('transform', mainTranslate);

    main = context.select('.d2b-chart-main').attr('transform', mainTranslate);

    // Update the chart with the main context (selection or transition),
    // inner width, inner height, and a tools object.
    update(main, width, height, tools);

    // trigger after update event
    selection.dispatch('afterUpdate');
  };

  return model;
};
