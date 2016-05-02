import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';

// line svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const line = function (context) {
    const selection = context.selection? context.selection() : context;

    const graph = selection.selectAll('.d2b-line-graph').data(d => d, $$.key);

    const graphEnter = graph.enter().append('g')
        .attr('class', 'd2b-line-graph')
        .style('opacity', 0);

    graphEnter.append('path').attr('class', 'd2b-line');

    let graphUpdate = graph.merge(graphEnter).order(),
        graphExit = graph.exit();

    let lineUpdate = graphUpdate.select('.d2b-line');

    if (context !== selection) {
      graphUpdate = graphUpdate.transition(context);
      graphExit = graphExit.transition(context);
      lineUpdate = lineUpdate.transition(context);
    }

    graphUpdate.style('opacity', 1);
    graphExit.style('opacity', 0).remove();
    lineUpdate
        .style('stroke', $$.color)
        .attr('d', function (d, i) {
          const x = $$.x.call(this, d, i),
                y = $$.y.call(this, d, i),
                values = $$.values.call(this, d, i);

          let shift = $$.shift.call(this, d, i);
          if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

          return $$.line
            .x((d, i) => x($$.px.call(this, d, i)) + shift)
            .y((d, i) => y($$.py.call(this, d, i)))
            (values);
        });

    return line;
  };

  /* Inherit from base model */
  const model = base(line, $$)
    .addProp('line', d3.line())
    .addProp('x', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.x;
      if (d.domain) $$.x = () => d;
      else $$.x = d;
      return line;
    })
    .addProp('y', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.y;
      if (d.domain) $$.y = () => d;
      else $$.y = d;
      return line;
    })
    .addPropFunctor('shift', null)
    .addPropFunctor('key', d => d.label)
    .addPropFunctor('values', d => d.values)
    .addPropFunctor('color', d => color(d.label))
    .addPropFunctor('px', d => d.x)
    .addPropFunctor('py', d => d.y);

  return line;
};
