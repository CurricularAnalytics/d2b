import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as stack} from '../util/stack.js';
import {default as id} from '../core/id.js';

// line svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const area = function (context) {
    const selection = context.selection? context.selection() : context;

    selection.each(d => {
      // stackNest.entries(d).forEach(sg => stacker(sg.values))
    });

    const graph = selection.selectAll('.d2b-area-graph').data(d => d, $$.key);

    const graphEnter = graph.enter().append('g')
        .attr('class', 'd2b-area-graph')
        .style('opacity', 0);

    graphEnter.append('path').attr('class', 'd2b-area');

    let graphUpdate = graph.merge(graphEnter).order(),
        graphExit = graph.exit();

    let areaUpdate = graphUpdate.select('.d2b-area');

    if (context !== selection) {
      graphUpdate = graphUpdate.transition(context);
      graphExit = graphExit.transition(context);
      areaUpdate = areaUpdate.transition(context);
    }

    selection.each(function (d, i) {
      const tooltip = $$.tooltip.call(this, d, i);
      if (tooltip) tooltip.clear('area');
      d3.select(this)
        .selectAll('.d2b-area')
        .each(function () {this.tooltip = tooltip;});
      stackNest.entries(d).forEach(sg => stacker(sg.values));
    });

    graphUpdate.style('opacity', 1);
    graphExit.style('opacity', 0).remove();
    areaUpdate
        .style('fill', $$.color)
        .attr('d', function (d, i) {
          const x = $$.x.call(this, d, i),
                y = $$.y.call(this, d, i),
                values = $$.values.call(this, d, i),
                color = $$.color.call(this, d, i);

          let shift = $$.shift.call(this, d, i);
          if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

          if (this.tooltip) this.tooltip.graph('area', i)
            .data(values)
            .x((d, i) => x(d.__x__) + shift)
            .y((d, i) => y(d.__y1__))
            .color(color);

          return $$.area
            .x((d, i) => x(d.__x__) + shift)
            .y0((d, i) => y(d.__y0__))
            .y1((d, i) => y(d.__y1__))
            (values);
        });

    return area;
  };

  const stacker = stack()
      .out((d, y0, y1, x) => {
        d.__x__ = x;
        d.__y0__ = y0;
        d.__y1__ = y1;
      });

  const stackNest = d3.nest().key(d => {
    const key = $$.stackBy(d);
    return (key !== false && key !== null)? key : id();
  });

  /* Inherit from base model */
  const model = base(area, $$)
      .addProp('area', d3.area())
      .addProp('stack', d3.stack(), null, d => stacker.stack(d))
      .addProp('x', d3.scaleLinear(), function (d) {
        if (!arguments.length) return $$.x;
        if (d.domain) $$.x = () => d;
        else $$.x = d;
        return area;
      })
      .addProp('y', d3.scaleLinear(), function (d) {
        if (!arguments.length) return $$.y;
        if (d.domain) $$.y = () => d;
        else $$.y = d;
        return area;
      })
      .addPropFunctor('tooltip', d => d.tooltip)
      .addPropFunctor('shift', null)
      .addPropFunctor('stackBy', null)
      .addPropFunctor('key', d => d.label)
      .addPropFunctor('values', d => d.values, null, d => stacker.values(d))
      .addPropFunctor('color', d => color(d.label))
      .addPropFunctor('px', d => d.x, null, d => stacker.x(d))
      .addPropFunctor('py', d => d.y, null, d => stacker.y(d));

  return area;
};
