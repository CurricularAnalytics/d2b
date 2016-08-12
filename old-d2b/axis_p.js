import {default as modelChart} from '../model/chart.js';
import {default as plane} from '../svg/plane.js';
import {default as color} from '../core/color.js';
import {default as tooltipAxis} from '../util/tooltipAxis.js';
import {default as d2bid} from '../core/id.js';

export default function () {

  // Configure model and chart properties.
  const model = modelChart(update, buildData, legendConfig);

  const $$ = model.values();
  const chart = model.base();

  model
    .addProp('plane', plane())
    .addScaleFunctor('x', d3.scaleLinear())
    .addScaleFunctor('y', d3.scaleLinear())
    .addScaleFunctor('x2', d3.scaleLinear())
    .addScaleFunctor('y2', d3.scaleLinear())
    // .addPropFunctor('planeData', d => d)
    .addPropFunctor('tooltipConfig', d => d.tooltipConfig)
    .addPropFunctor('groups', d => d.groups)
    .addPropFunctor('types', d => d.types)
    .addPropFunctor('graphs', d => d.graphs)
    // group functors
    .addPropFunctor('groupLabel', d => d.label)
    .addPropFunctor('groupColor', d => color($$.groupLabel(d)))
    // type functors
    .addPropFunctor('typeGenerator', d => d.generator)
    // graph functors
    .addPropFunctor('graphLabel', d => d.label)
    .addPropFunctor('graphGroup', d => d.group)
    .addPropFunctor('graphColor', d => color($$.graphLabel(d)))
    .addPropFunctor('graphXType', 'x')
    .addPropFunctor('graphYType', 'y')
    .addPropFunctor('graphTooltipConfig', d => d.tooltipConfig);

	// configure legend
	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true);

  // Legend config callback
  function legendConfig (legend) {
    legend
      .items(allGroups)
      .label(d => d.label)
      .color(d => d.groupColor || d.color);
  }

  function allGroups (d) {
    let graphs = allGraphs(d);
    d.groups.forEach(group => {
      group.groupType = 'group';
      group.groupGraphs = graphs.filter(graph => graph.group === group.label);
      group.groupGraphs.forEach(graph => graph.groupColor = group.color);
    });
    let groupGraphs = graphs.filter(graph => !graph.group);
    groupGraphs.forEach(group => {
      group.groupType = 'graph';
    });
    return d.groups.concat(groupGraphs);
  }

  function allGraphs (d) {
    return [].concat.apply([], d.types.map(type => type.graphs));
  }

  function setHidden (groups) {
    groups.forEach(group => {
      const hidden = !!group.__empty__;
      group.__hidden__ = hidden;
      if (group.__groupGraphs__)
        group.__groupGraphs__.forEach(graph => graph.__hidden__ = hidden);
    })
  }

  function legendMouseover(d, selection) {
    const graphs = selection.selectAll('.d2b-graph'),
          t = d3.transition().duration(250);

    graphs.transition(t).style('opacity', 0.2);
    graphs.filter(graph => {
      return d === graph ||
             (d.__groupGraphs__ || []).indexOf(graph) > -1;
    }).transition(t).style('opacity', 1);
  }

  function legendMouseout(d, selection) {
    const graphs = selection.selectAll('.d2b-graph'),
          t = d3.transition().duration(250);

    graphs.transition(t).style('opacity', 1);
  }

	function buildData (d, i) {
		return {
      plane: $$.plane,
      x: $$.x(d, i),
      y: $$.y(d, i),
      x2: $$.x2(d, i),
      y2: $$.y2(d, i),
			tooltipConfig: $$.tooltipConfig(d, i),
      groups: $$.groups(d, i).map((g, i) => {
        return {
          label: $$.groupLabel(g, i),
          color: $$.groupColor(g, i)
        };
      }),
      types: $$.types(d, i).map((t, i) => {
        return {
          generator: $$.typeGenerator(t, i),
          graphs: $$.graphs(t, i).map((g, i) => {
            return {
              label: $$.graphLabel(g, i),
              group: $$.graphGroup(g, i),
              color: $$.graphColor(g, i),
              xType: $$.graphXType(g, i),
              yType: $$.graphYType(g, i),
              tooltipConfig: $$.graphTooltipConfig(g, i)
            };
          })
        };
      })
		};
	}

  function update(context, data, index, width, height, tools) {
    const selection = context.selection? context.selection() : context,
          node = selection.node(),
          groups = allGroups(data),
          types = allTypes(data);

    // get tooltip
    let tooltip = node.__tooltip__ = node.__tooltip__ || tooltipAxis().trackX(true).trackY(false).threshold(50);

		// legend functionality
		tools.selection
			.select('.d2b-chart-legend')
				.on('change', tools.update)
			.selectAll('.d2b-legend-item')
        .on('mouseover', d => legendMouseover(d, selection))
        .on('mouseout', d => legendMouseout(d, selection));

    // set hidden attibute on all graphs according to their legend __empty__ state
    setHidden(allGroups(datum));

    // update plane with proper width and height
    $$.plane.size({width: width, height: height});
    context.call($$.plane);

    // after plane update, fetch plane box
    const planeBox = $$.plane.box(selection);

    // enter axis-type wrapper
    let wrapper = selection.selectAll('.d2b-axis-wrapper').data([datum]),
        wrapperUpdate = wrapper,
        wrapperEnter = wrapper.enter().append('g').attr('class', 'd2b-axis-wrapper');

    wrapperEnter.append('rect').attr('class', 'd2b-axis-background');

    wrapper = wrapper.merge(wrapperEnter);

    // enter axis-types
    let type = wrapper.selectAll('.d2b-axis-type').data(types, t => $$.typeGenerator(t)),
        typeEnter = type.enter().append('g').attr('class', 'd2b-axis-type'),
        typeExit = type.exit();

    type = type.merge(typeEnter);

    // update the graphs for each type
    type.each(function (t, i) {
      tooltip.clear(i);
      t.__generator__
        .tooltipGraph(graph => {
          let tooltipGraph = tooltip.graph(i, graph.__label__);
          tooltipGraph.row(point => t.__generator__.py()(point));
          graph.__tooltipConfig__(tooltipGraph);
          return tooltipGraph;
        })
        .x(graph => $$.plane[graph.__xType__]()(datum).axis.scale())
        .y(graph => $$.plane[graph.__yType__]()(datum).axis.scale())
        .color(graph => graph.__color__)
        .graphs(d => $$.graphs(d).filter(graph => !graph.__hidden__));

      let type = d3.select(this);
      if (context !== selection) type = type.transition(context);
      type.call(t.__generator__);
    });

    // queue transitions if context is a transition
    if (selection !== context) {
      typeExit = typeExit.transition(context);
      wrapperUpdate = wrapperUpdate.transition(context);
    }

    // remaining transitions and exits
    typeExit.style('opacity', 0).remove();

    wrapperEnter
        .attr('transform', `translate(${planeBox.left}, ${planeBox.top})`)
      .select('rect.d2b-axis-background')
        .attr('height', Math.max(0, planeBox.height))
        .attr('width', Math.max(0, planeBox.width));

    wrapperUpdate
        .attr('transform', `translate(${planeBox.left}, ${planeBox.top})`)
      .select('rect.d2b-axis-background')
        .attr('height', Math.max(0, planeBox.height))
        .attr('width', Math.max(0, planeBox.width));

    // configure tooltip
    $$.tooltipConfig(tooltip);
    tooltip
      .svgContainer(wrapper)
      .tracker(wrapper.select('.d2b-axis-background'))
      .size(planeBox);
  }

  return chart;
};

// node.call(setProps);
//
// function setProps (node, data) {
//   return {
//     types: $$.types(data).map(type => {
//       return {
//         data: type,
//         generator: $$.typeGenerator(type),
//         graphs: $$.graphs(type).map(graph => {
//           return {
//             data: graph,
//             label: $$.graphLabel(graph),
//             group: $$.graphGroup(graph),
//             color: $$.graphColor(graph)
//           }
//         })
//       }
//     },
//     groups: $$.groups..
//     x: ..
//     y: ..
//   };
// });
  // node.__types__.forEach(type => {
  //
  // })
// }
