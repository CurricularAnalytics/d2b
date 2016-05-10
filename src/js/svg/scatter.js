import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as point} from '../svg/point.js';

// scatter svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const scatter = function (context) {
    const selection = context.selection? context.selection() : context;

    if ($$.tooltip) $$.tooltip.clear('bar');

    const graph = selection.selectAll('.d2b-scatter-graph').data(d => d, $$.key);

    const graphEnter = graph.enter().append('g')
        .attr('class', 'd2b-scatter-graph')
        .style('opacity', 0);

    let graphUpdate = graph.merge(graphEnter).order(),
        graphExit = graph.exit();

    if (context !== selection) {
      graphUpdate = graphUpdate.transition(context);
      graphExit = graphExit.transition(context);
    }

    graphUpdate.style('opacity', 1);
    graphExit.style('opacity', 0).remove();

    graphUpdate.each( function (d, i) {
      const el = d3.select(this),
            x = $$.x.call(this, d, i),
            y = $$.y.call(this, d, i),
            color = $$.color.call(this, d, i),
            symbol = $$.symbol.call(this, d, i),
            values = $$.values.call(this, d, i);

      let shift = $$.shift.call(this, d, i);
      if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

      if ($$.tooltip) $$.tooltip.graph('scatter', i)
        .data(values)
        .x((d, i) => x($$.px(d, i)))
        .y((d, i) => y($$.py(d, i)))
        .color((d, i) => $$.pcolor(d, i) || color);

      $$.point
          .fill( function (dd, ii) {
            return $$.pcolor.call(this, dd, ii) || color;
          })
          .type( function (dd, ii) {
            return $$.psymbol.call(this, dd, ii) || symbol;
          })
          .size($$.psize);

      const point = el.selectAll('.d2b-scatter-point')
          .data(values, $$.pkey);
      const pointEnter = point.enter().append('g')
          .attr('class', 'd2b-scatter-point');

      let pointUpdate = point.merge(pointEnter).order(),
          pointExit = point.exit();

      if (context !== selection) {
        pointUpdate = pointUpdate.transition(context);
        pointExit = pointExit.transition(context);
      }

      pointEnter
          .style('opacity', 0)
          .call(pointTransform, x, y, shift);

      pointUpdate
          .style('opacity', 1)
          .call($$.point)
          .call(pointTransform, x, y, shift);

      pointExit
          .style('opacity', 0)
          .remove();

    });

    return scatter;
  };

  function pointTransform (transition, x, y, shift) {
    transition.attr('transform', function (d, i) {
      const px = x($$.px.call(this, d, i)) + shift;
      const py = y($$.py.call(this, d, i));
      return `translate(${px}, ${py})`;
    })
  }

  /* Inherit from base model */
  const model = base(scatter, $$)
    .addProp('point', point().active(true))
    .addProp('x', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.x;
      if (d.domain) $$.x = () => d;
      else $$.x = d;
      return scatter;
    })
    .addProp('y', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.y;
      if (d.domain) $$.y = () => d;
      else $$.y = d;
      return scatter;
    })
    .addProp('tooltip', null)
    .addPropFunctor('shift', null)
    .addPropFunctor('key', d => d.label)
    .addPropFunctor('values', d => d.values)
    .addPropFunctor('color', d => color(d.label))
    .addPropFunctor('symbol', d => d3.symbolCircle)
    .addPropFunctor('px', d => d.x)
    .addPropFunctor('py', d => d.y)
    .addPropFunctor('pcolor', d => null)
    .addPropFunctor('psymbol', null)
    .addPropFunctor('pkey', (d, i) => i)
    .addPropFunctor('psize', d => 25);

  return scatter;
};
