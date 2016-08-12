import {default as modelChart} from '../model/chart.js';
import {default as plane} from '../svg/plane.js';
import {default as color} from '../core/color.js';
import {default as tooltipAxis} from '../util/tooltipAxis.js';
import {default as d2bid} from '../core/id.js';

export default function () {

  // Configure model and chart properties.
  const model = modelChart(update, legendConfig);

  const $$ = model.values();
  const chart = model.base();

  model
    .addProp('plane', plane().showGrid(false), null, d => {
      d.x(d => d.__x__).y(d => d.__y__).x2(d => d.__x2__).y2(d => d.__y2__);
    })
    .addScaleFunctor('x', (d, points) => {
      return points.length? defaultAxis(d3.axisBottom(), points) : null;
    })
    .addScaleFunctor('y', (d, points) => {
      const axis = defaultAxis(d3.axisLeft(), points);
      axis.axis.scale().domain(axis.axis.scale().domain().reverse());
      return points.length? axis : null;
    })
    .addScaleFunctor('x2', (d, points) => {
      return points.length? defaultAxis(d3.axisTop(), points) : null;
    })
    .addScaleFunctor('y2', (d, points) => {
      const axis = defaultAxis(d3.axisRight(), points);
      axis.axis.scale().domain(axis.axis.scale().domain().reverse());
      return points.length? axis : null;
    })
    .addPropFunctor('tooltipConfig', d => d.tooltipConfig)
    .addPropFunctor('groups', d => d.groups)
    .addPropFunctor('sets', d => d.sets)
    .addPropFunctor('graphs', d => d.graphs)
    // group functors
    .addPropFunctor('groupLabel', d => d.label)
    .addPropFunctor('groupColor', d => color($$.groupLabel(d)))
    // set functors
    .addPropFunctor('setGenerators', d => d.generators)
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
      .label(d => d.__label__)
      .color(d => d.__color__);
  }

  function defaultScale (points) {
    if (points.some(d => isNaN(d))) return d3.scaleBand().domain(d3.set(points).values());
    else return d3.scaleLinear().domain(d3.extent(points));
  }

  function defaultAxis (axis, points) {
    return {
      axis: axis.scale(defaultScale(points)),
    };
  }

  function allGroups (d) {
    let groups = $$.groups(d),
        graphs = allGraphs(d);
    groups.forEach(group => {
      group.__groupType__ = 'group';
      group.__label__ = $$.groupLabel(group);
      group.__color__ = $$.groupColor(group);
      group.__groupGraphs__ = graphs.filter(graph => $$.graphGroup(graph) === $$.groupLabel(group));
      group.__groupGraphs__.forEach(graph => {
        graph.__color__ = group.__color__ || $$.graphColor(graph);
      });
    });
    let groupGraphs = graphs.filter(graph => !$$.graphGroup(graph));
    groupGraphs.forEach(group => {
      group.__groupType__ = 'graph';
      group.__color__ = $$.graphColor(group);
    });
    return groups.concat(groupGraphs);
  }

  function allGraphs (d) {
    const graphs = [].concat.apply([], $$.sets(d).map(set => $$.graphs(set)));
    graphs.forEach((graph, i) => {
      graph.__label__ = $$.graphLabel(graph) || '';
      graph.__xType__ = $$.graphXType(graph) || 'x';
      graph.__yType__ = $$.graphYType(graph) || 'y';
      graph.__tooltipConfig__ = $$.graphTooltipConfig(graph) || function () {};
    });
    return graphs;
  }

  function allSets (d) {
    return $$.sets(d).map((set, i) => {
      set.__generators__ = $$.setGenerators(set);
      set.__graphs__ = $$.graphs(set);
      return set
    });
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
    const graphs = selection.selectAll('.d2b-graph');

    graphs
        .style('opacity', 0.2)
      .filter(graph => {
        return d === graph ||
               (d.__groupGraphs__ || []).indexOf(graph) > -1;
      })
        .style('opacity', 1);
  }

  function legendMouseout(d, selection) {
    selection.selectAll('.d2b-graph').style('opacity', 1);
  }

  function update(context, width, height, tools) {
    const selection = context.selection? context.selection() : context,
          datum = selection.datum(),
          node = selection.node(),
          tooltipConfig = $$.tooltipConfig(datum),
          groups = allGroups(datum),
          sets = allSets(datum);

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

    // enter axis-set wrapper
    let wrapper = selection.selectAll('.d2b-axis-wrapper').data([datum]),
        wrapperUpdate = wrapper,
        wrapperEnter = wrapper.enter().append('g').attr('class', 'd2b-axis-wrapper');

    wrapperEnter.append('rect').attr('class', 'd2b-axis-background');

    wrapper = wrapper.merge(wrapperEnter);

    // enter axis-sets
    let set = wrapper.selectAll('.d2b-axis-set').data(sets, t => t.__generators__),
        setEnter = set.enter().append('g').attr('class', 'd2b-axis-set'),
        setExit = set.exit();

    set = set.merge(setEnter);

    // initialze generator and visible point sets
    const visible = {
      x: [],
      x2: [],
      y: [],
      y2: []
    };

    set.each(function (s, i) {
      const graphs = s.__graphs__.filter(graph => !graph.__hidden__)
      let set = d3.select(this);
      tooltip.clear(i);

      s.__generators__.forEach((generator, index) => {
        generator
          .tooltipGraph(graph => {
            if (index) return null;
            let tooltipGraph = tooltip.graph(i, graph.__label__);
            tooltipGraph.row(point => point.__y__ || generator.py()(point));
            graph.__tooltipConfig__(tooltipGraph);
            return tooltipGraph;
          })
          .color(graph => graph.__color__)
          .graphs(graphs);

        set.call(generator.setVisiblePoints);

        graphs.forEach(graph => {
          const xs = graph.__visiblePoints__.map(p => p.x),
                ys = graph.__visiblePoints__.map(p => p.y);
          visible[graph.__xType__] = visible[graph.__xType__].concat(xs);
          visible[graph.__yType__] = visible[graph.__yType__].concat(ys);
        });
      });
    });

    datum.__x__ = $$.x(datum, visible.x);
    datum.__x2__ = $$.x2(datum, visible.x2);
    datum.__y__ = $$.y(datum, visible.y);
    datum.__y2__ = $$.y2(datum, visible.y2);

    // update plane
    context.call($$.plane);

    // after plane update, fetch plane box
    const planeBox = $$.plane.box(selection);

    // update the graphs with generator
    set.each(function (s, i) {
      const graphs = s.__graphs__.filter(graph => !graph.__hidden__);
      let el = d3.select(this), set = el;
      if (context !== selection) set = set.transition(context);

      s.__generators__.forEach((generator, index) => {

        generator
          .x(graph => {
            return datum[`__${graph.__xType__}__`]? $$.plane.axis()(datum[`__${graph.__xType__}__`]).scale() : d3.scaleLinear();
          })
          .y(graph => {
            return datum[`__${graph.__yType__}__`]? $$.plane.axis()(datum[`__${graph.__yType__}__`]).scale() : d3.scaleLinear();
          });

        set.call(generator);

      });
      el.on('change', tools.update);
    });

    // queue transitions if context is a transition
    if (selection !== context) {
      setExit = setExit.transition(context);
      wrapperUpdate = wrapperUpdate.transition(context);
    }

    // remaining transitions and exits
    setExit.style('opacity', 0).remove();

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
      .tracker(wrapper)
      .size(planeBox);
  }

  return chart;
};
