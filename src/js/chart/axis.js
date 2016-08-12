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
    .addProp('plane', plane())
    .addPropFunctor('x', d => { return {}; })
    .addPropFunctor('y', d => { return {}; })
    .addPropFunctor('x2', d => { return {}; })
    .addPropFunctor('y2', d => { return {}; })
    .addPropFunctor('tooltipConfig', d => d.tooltipConfig)
    .addPropFunctor('groups', d => d.groups)
    .addPropFunctor('sets', d => d.sets)
    .addPropFunctor('generator', d => d)
    // group functors
    .addPropFunctor('groupLabel', d => d.label)
    .addPropFunctor('groupColor', d => color($$.groupLabel(d)))
    // set functors
    .addPropFunctor('setGenerators', d => d.generators)
    .addPropFunctor('setGraphs', d => d.graphs)
    // generator functors
    .addPropFunctor('generatorKey', d => d.name)
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

  // default default axis components
  const bandDefault = d3.scaleBand(),
        linearDefault = d3.scaleLinear(),
        axisDefaults = {
          x: {
            band: bandDefault.copy(),
            linear: linearDefault.copy(),
            axis: d3.axisBottom()
          },
          y: {
            band: bandDefault.copy(),
            linear: linearDefault.copy(),
            axis: d3.axisLeft()
          },
          x2: {
            band: bandDefault.copy(),
            linear: linearDefault.copy(),
            axis: d3.axisTop()
          },
          y2: {
            band: bandDefault.copy(),
            linear: linearDefault.copy(),
            axis: d3.axisRight()
          }
        };

  // Legend config callback
  function legendConfig (legend) {
    legend
      .items(getGroups)
      .empty(d => d.data.hidden)
      .setEmpty((d, i, state) => d.data.hidden = state)
      .label(d => d.label)
      .color(d => d.color);
  }

  function getGroups (d, i, sets = getSets(d, i), graphs = getAllGraphs(sets)) {
    const graphGroups = graphs.filter(graph => !graph.group);

    graphGroups.forEach(g => {
      g.groupType = 'graph';
      g.groupGraphs = [g];
    })

    return ($$.groups(d, i) || []).map((group, i) => {
      const newGroup = {
        groupType: 'group',
        data: group,
        label: $$.groupLabel(group, i),
        color: $$.groupColor(group, i)
      };

      newGroup.groupGraphs = graphs.filter(graph => newGroup.label === graph.group);

      newGroup.groupGraphs.forEach(g => {
        g.color = newGroup.color;
      });

      return newGroup;
    })
    .concat(graphGroups);
  }

  function getSets (d, i) {
    return $$.sets(d, i).map((set, i) => {
      return {
        data: set,
        index: i,
        generators: $$.setGenerators(set, i).map((generator, i) => {
          return {
            data: generator,
            index: i,
            generator: $$.generator(generator, i),
            key: $$.generatorKey(generator, i)
          }
        }),
        graphs: getSetGraphs(set, i)
      };
    });
  }

  function getSetGraphs (d, i) {
    return $$.setGraphs(d, i).map((graph, i) => {
      return {
        data: graph,
        index: i,
        label: $$.graphLabel(graph, i) || '',
        xType: $$.graphXType(graph, i) || 'x',
        yType: $$.graphYType(graph, i) || 'y',
        color: $$.graphColor(graph, i),
        group: $$.graphGroup(graph, i),
        tooltipConfig: $$.graphTooltipConfig || function () {}
      };
    });
  }

  function getAllGraphs (sets = getSets(d, i)) {
    return [].concat.apply([], sets.map( set => set.graphs ));
  }

  function propagateHidden (groups) {
    groups.forEach(group => {
      group.groupGraphs.forEach(graph => graph.data.hidden = group.data.hidden);
    })
  }

  function legendMouseover(d, selection) {
    const graphs = selection.selectAll('.d2b-graph');
    if (!d.groupGraphs.some(graph => !graph.data.hidden)) return;
    graphs
        .style('opacity', 0.2)
      .filter(graph => {
        return d.data === graph.data ||
               (d.groupGraphs.map(d => d.data) || []).indexOf(graph.data) > -1;
      })
        .style('opacity', '');
  }

  function legendMouseout(d, selection) {
    selection.selectAll('.d2b-graph').style('opacity', 1);
  }

  function matchGraph(graph, allGraphs) {
    return allGraphs.filter(g => g.data === graph || g.data === graph.data)[0];
  }

  function setupAxis(data, points, defaults, reverse) {
    if (!points.length) return;
    if (!data.axis) data.axis = defaults.axis;
    if (!data.scale) data.scale = getScale(points, defaults);

    let domain = data.scale.domain();

    if (reverse) domain = domain.reverse();
    if (!data.scale.bandwidth && data.linearPadding) {
      const dist = domain[1] - domain[0];
      domain[0] = domain[0] + dist * data.linearPadding[0];
      domain[1] = domain[1] + dist * data.linearPadding[1];
    }

    data.scale.domain(domain);
    data.axis.scale(data.scale);
  }

  function getScale(points, defaults) {
    if (points.some(d => isNaN(d))) return defaults.band.domain(d3.set(points).values());
    else return defaults.linear.domain(d3.extent(points));
  }

  function update(context, index, width, height, tools) {
    const selection = context.selection? context.selection() : context,
          datum = selection.datum(),
          node = selection.node(),
          sets = getSets(datum, index),
          allGraphs = getAllGraphs(sets),
          duration = $$.duration(datum, index),
          groups = getGroups(datum, index, sets);

    propagateHidden(groups);

    let tooltip = node.tooltip = node.tooltip || tooltipAxis().trackX(true).trackY(false).threshold(50);
    tooltip
      .title(points => `${points[0].x || points[0].x1}`)
      .clear();

		// legend functionality
		tools.selection
			.select('.d2b-chart-legend')
				.on('change', tools.update)
			.selectAll('.d2b-legend-item')
        .on('mouseover', d => legendMouseover(d, selection))
        .on('mouseout', d => legendMouseout(d, selection));


    // update plane dimensions, width and height
    $$.plane.size({width: width, height: height});

    let plane = selection.selectAll('.d2b-axis-plane').data([datum]),
        planeUpdate = plane,
        planeEnter = plane.enter().append('g').attr('class', 'd2b-axis-plane');

    plane = plane.merge(planeEnter);

    // enter axis-set wrapper
    let wrapper = selection.selectAll('.d2b-axis-wrapper').data([datum]),
        wrapperUpdate = wrapper,
        wrapperEnter = wrapper.enter().append('g').attr('class', 'd2b-axis-wrapper');

    wrapperEnter.append('rect').attr('class', 'd2b-axis-background');

    wrapper = wrapper.merge(wrapperEnter);

    // enter axis-sets
    let set = wrapper.selectAll('.d2b-axis-set').data(sets),
        setEnter = set.enter().append('g').attr('class', 'd2b-axis-set'),
        setExit = set.exit();

    set = set.merge(setEnter).order();

    // queue transitions if context is a transition
    if (selection !== context) {
      setExit = setExit.transition(context);
      wrapperUpdate = wrapperUpdate.transition(context);
      planeUpdate = planeUpdate.transition(context);
    }

    // initialze generator and visible point sets
    const visible = {
      x: [],
      x2: [],
      y: [],
      y2: []
    };

    set.each(function (s, i) {
      const el = d3.select(this);

      this.genUpdate = el.selectAll('.d2b-graph-generator')
        .data(s.generators, d => d.key);

      this.genEnter = this.genUpdate.enter().append('g')
        .attr('class', 'd2b-graph-generator')
        .style('opacity', 0);

      this.genExit = this.genUpdate.exit();

      this.gen = this.genUpdate.merge(this.genEnter).order();

      this.gen.each(function (d, i) {
        const gen = d3.select(this),
              visiblePoints = d.generator
                .tooltipGraph(graph => {
                  if (i) return null;
                  let tooltipGraph = tooltip.graph(d2bid());
                  tooltipGraph.row(point => {
                    const graphLabel = matchGraph(point.graph.data, allGraphs).label;
                    return `${graphLabel}: ${point.y || point.y1}`;
                  });
                  matchGraph(graph, allGraphs).tooltipConfig(tooltipGraph);
                  return tooltipGraph;
                })
                .color(graph => matchGraph(graph, allGraphs).color)
                .graphs(s.graphs.map(g => g.data).filter(g => !g.hidden))
                .getVisiblePoints(gen)
                [0];

        if (d.generator.duration) d.generator.duration(duration);

        visiblePoints.forEach(point => {
          const graph = matchGraph(point.graph, allGraphs);
          visible[graph.xType || 'x'].push(point.x);
          visible[graph.yType || 'y'].push(point.y);
        });

      });

    });

    const xData = $$.x(datum, index, visible.x),
          yData = $$.y(datum, index, visible.y),
          x2Data = $$.x2(datum, index, visible.x2),
          y2Data = $$.y2(datum, index, visible.y2);

    setupAxis(xData, visible.x, axisDefaults.x);
    setupAxis(yData, visible.y, axisDefaults.y, true);
    setupAxis(x2Data, visible.x2, axisDefaults.x2);
    setupAxis(y2Data, visible.y2, axisDefaults.y2, true);

    $$.plane
      .axis(d => d.axis)
      .x(xData.axis? xData : null)
      .y(yData.axis? yData : null)
      .x2(x2Data.axis? x2Data : null)
      .y2(y2Data.axis? y2Data : null);

    // update plane
    planeEnter.call($$.plane);
    planeUpdate.call($$.plane);

    // after plane update, fetch plane box
    const planeBox = $$.plane.box(plane);

    // update the graphs with their generators
    set.each(function (s, i) {

      if (selection !== context) {
        this.genUpdate = this.genUpdate.transition(context).style('opacity', 1);
        this.genExit.transition(context).style('opacity', 0).remove();
        this.genEnter.transition(context).style('opacity', 1);
      }

      this.gen.each(function (d, i) {
        let el = d3.select(this);
        if (selection !== context) el = el.transition(context);

        d.generator
          .x((graph, i) => {
            return matchGraph(graph, allGraphs).xType === 'x2'? x2Data.scale : xData.scale;
          })
          .y((graph, i) => {
            return matchGraph(graph, allGraphs).yType === 'y2'? y2Data.scale : yData.scale;
          });

        el.call(d.generator);
      });

      d3.select(this).on('change', tools.update);
    });

    // remaining transitions and exits
    setExit.style('opacity', 0).remove();

    // position wrapper
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
