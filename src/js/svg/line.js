import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as stack} from '../util/stack.js';
import {default as id} from '../core/id.js';

// line svg generator
export default function () {
  const $$ = {};

  function getGraphs (d, i) {
    const graphs = $$.graphs(d, i).map((graph, i) => {
      const newGraph = {
        data:          graph,
        index:         i,
        x:             $$.x(graph, i),
        y:             $$.y(graph, i),
        tooltipGraph:  $$.tooltipGraph(graph, i),
        shift:         $$.shift(graph, i),
        stackBy:       $$.stackBy(graph, i),
        key:           $$.key(graph, i),
        color:         $$.color(graph, i)
      };
      newGraph.values = $$.values(graph, i).map((point, i) => {
        return {
          data:   point,
          index:  i,
          graph:  newGraph,
          x:      $$.px(point, i),
          y:      $$.py(point, i)
        }
      });
      return newGraph;
    });

    stackNest.entries(graphs).forEach(sg => stacker(sg.values));

    return graphs;
  }

  /* Update Function */
  const line = function (context) {
    const selection = context.selection? context.selection() : context;

    const graph = selection.selectAll('.d2b-line-graph').data((d, i) => getGraphs(d, i), d => d.key);

    const graphEnter = graph.enter().append('g')
        .attr('class', 'd2b-line-graph d2b-graph')
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
        .style('stroke', d => d.color)
        .attr('d', function (d, i) {
          const x = d.x, y = d.y;
          let shift = d.shift;
          if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

          if (d.tooltipGraph) d.tooltipGraph
            .data(d.values)
            .x((d, i) => x(d.x) + shift)
            .y((d, i) => y(d.y1))
            .color(d.color);

          return $$.line
            .x((d, i) => x(d.x) + shift)
            .y((d, i) => y(d.y1))
            (d.values);
        });

    return line;
  };

  const stacker = stack()
      .values(d => d.values)
      .y(d => d.y)
      .x(d => d.x);

  const stackNest = d3.nest().key(d => {
    const key = d.stackBy;
    return (key !== false && key !== null)? key : id();
  });

  /* Inherit from base model */
  const model = base(line, $$)
      .addProp('line', d3.line())
      .addPropFunctor('graphs', d => d)
      // graph props
      .addScaleFunctor('x', d3.scaleLinear())
      .addScaleFunctor('y', d3.scaleLinear())
      .addPropFunctor('tooltipGraph', d => d.tooltipGraph)
      .addPropFunctor('shift', null)
      .addPropFunctor('stackBy', null)
      .addPropFunctor('key', d => d.label)
      .addPropFunctor('values', d => d.values)
      .addPropFunctor('color', d => color(d.label))
      // points props
      .addPropFunctor('px', d => d.x)
      .addPropFunctor('py', d => d.y)
      // methods
      .addMethod('getComputedGraphs', context => {
        return (context.selection? context.selection() : context).data().map((d, i) => getGraphs(d, i));
      })
      .addMethod('getVisiblePoints', context => {
        const data = line.getComputedGraphs(context);
        return data.map(graphs => {
          return [].concat.apply([], graphs.map(graph => {
            return graph.values.map(v => {
              return {x: v.x, y: v.y1, graph: graph};
            });
          }));
        });
      });

  return line;
};
