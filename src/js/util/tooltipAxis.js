import {default as base} from '../model/base.js';
import {default as id} from '../core/id.js';
import {default as oreq} from '../core/oreq.js';

export default function (id = d2b.id()) {
  const $$ = {};

  const tooltip = {};

  const positionMarker = function (marker, info, type) {
    if (type === 'y') {
      if (info.y === Infinity) return marker.style('opacity', 0);
      marker
          .style('opacity', 1)
          .attr('transform', `translate(0, ${info.y})`)
          .attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', $$.size.width);
    } else {
      if (info.x === Infinity) return marker.style('opacity', 0);
      marker
          .style('opacity', 1)
          .attr('transform', `translate(${info.x}, 0)`)
          .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', $$.size.height);
    }
  };

  const positionTooltip = function (tooltip, info, base) {
    const node = tooltip.node();
    if (!node) return;
    const tooltipBox = tooltip.node().getBoundingClientRect();
    let x = base.x, y = base.y, pad = 10;

    if ($$.trackY) {
      if (info.y > $$.size.height / 2) {
        y += info.y - pad - tooltipBox.height;
      } else {
        y += info.y + pad;
      }
    } else {
      if (d3.event.clientY - base.y > $$.size.height / 2) {
        y = d3.event.clientY - pad - tooltipBox.height;
      } else {
        y = d3.event.clientY + pad;
      }
    }

    if ($$.trackX) {
      if (info.x > $$.size.width / 2) {
        x += info.x - pad - tooltipBox.width;
      } else {
        x += info.x + pad;
      }
    } else {
      if (d3.event.clientX - base.x > $$.size.width / 2) {
        x = d3.event.clientX - pad - tooltipBox.width;
      } else {
        x = d3.event.clientX + pad;
      }
    }

    x += window.scrollX;
    y += window.scrollY;

    tooltip.style('left', x+'px').style('top', y+'px');
  };

  const populateTooltip = function (tooltip, info) {
    const title = $$.title(info.points.map(d => d.data));

    tooltip.select('.d2b-tooltip-title')
      .style('display', title? 'block' : 'none')
      .html(title);

    const content = tooltip.select('.d2b-tooltip-content');

    let row = content.selectAll('.d2b-tooltip-row').data(info.points);
    const rowEnter = row.enter().append('div').attr('class', 'd2b-tooltip-row');

    row.exit().remove();

    row = row.merge(rowEnter)
      .html(d => d.row)
      .style('border-left-color', d => d.color || 'transparent');
  }

  // Finds the x, y coordinates associated with the points 'closest' to the cursor.
  // Also returns the set of points that meet the 'closest' configuration.
  const findPointInfo = function (base) {
    const cursor = {x: d3.event.clientX - base.x, y: d3.event.clientY - base.y};
    let x = Infinity, y = Infinity, points = [];
    for (let groupName in groups) {
      if (!groups.hasOwnProperty(groupName)) continue;
      const group = groups[groupName];
      for (let graphName in group) {
        if(!group.hasOwnProperty(graphName)) continue;
        const graph = group[graphName];
        let newPoints = [];
        graph.config.data.forEach((d, i) => {
          const item = {
            data: d,
            x: oreq(graph.config.x(d, i), $$.x(d, i)),
            y: oreq(graph.config.y(d, i), $$.y(d, i)),
            color: oreq(graph.config.color(d, i), $$.color(d, i)),
            row: oreq(graph.config.row(d, i), $$.row(d, i))
          };

          if ($$.trackX && $$.trackY) {
            if (item.x === x && item.y === y) return newPoints.push(item);

            const od = Math.sqrt(Math.pow(x - cursor.x, 2) + Math.pow(y - cursor.y, 2));
            const nd = Math.sqrt(Math.pow(item.x - cursor.x, 2) + Math.pow(item.y - cursor.y, 2));

            if (nd < od) {
              x = item.x;
              y = item.y;
              points = [];
              newPoints = [item];
            }
          } else if ($$.trackX) {
            if (item.x === x) return newPoints.push(item);

            const od = Math.abs(x - cursor.x);
            const nd = Math.abs(item.x - cursor.x);

            if (nd < od) {
              x = item.x;
              points = [];
              newPoints = [item];
            }
          } else if ($$.trackY) {
            if (item.y === y) return newPoints.push(item);

            const od = Math.abs(y - cursor.y);
            const nd = Math.abs(item.y - cursor.y);

            if (nd < od) {
              y = item.y;
              points = [];
              newPoints = [item];
            }
          }
        });

        points = points.concat(newPoints);
      }
    }

    points = points.sort((a, b) => {
      return d3.ascending(a.x, b.x) || d3.ascending(a.y, b.y);
    })

    return {x: x, y: y, points: points};
  };

  const mouseover = function (d, i) {
    let base = $$.selectionSvg.selectAll('.d2b-tooltip-base').data([d]);
    base = base.merge(base.enter().append('rect').attr('class', 'd2b-tooltip-base'));
    let baseBox = base.node().getBoundingClientRect();
    baseBox = {x: baseBox.left + window.scrollX, y: baseBox.top + window.scrollY};

    const pointInfo = findPointInfo(baseBox);

    const markerX = $$.selectionSvg.selectAll('.d2b-tooltip-marker-x').data($$.trackX? [d] : []);
    const markerXEnter = markerX.enter().append('line')
      .attr('class', 'd2b-tooltip-marker-x d2b-tooltip-marker')
      .call(positionMarker, pointInfo, 'x');

    const markerY = $$.selectionSvg.selectAll('.d2b-tooltip-marker-y').data($$.trackY? [d] : []);
    const markerYEnter = markerY.enter().append('line')
      .attr('class', 'd2b-tooltip-marker-y d2b-tooltip-marker')
      .call(positionMarker, pointInfo, 'y');

    $$.tooltip = $$.selection.selectAll('.d2b-tooltip').data(d => [d]);

    const newTooltip = $$.tooltip.enter()
      .append('div')
        .style('opacity', 0)
        .attr('class', 'd2b-tooltip');

    newTooltip.append('div').attr('class', 'd2b-tooltip-title');

    newTooltip
      .append('div')
        .attr('class', 'd2b-tooltip-content')
        .call(populateTooltip, pointInfo)
        .call(positionTooltip, pointInfo, baseBox);

    $$.tooltip = $$.tooltip.merge(newTooltip);

    $$.tooltip
      .transition()
        .duration(100)
        .style('opacity', 1);

    $$.dispatch.call("insert", $$.tooltip, this, d, i);
  };

  const mousemove = function (d, i) {
    let base = $$.selectionSvg.select('.d2b-tooltip-base');
    let baseBox = base.node().getBoundingClientRect();
    baseBox = {x: baseBox.left, y: baseBox.top};

    const pointInfo = findPointInfo(baseBox);

    const markerX = $$.selectionSvg
      .select('.d2b-tooltip-marker-x')
        .call(positionMarker, pointInfo, 'x');

    const markerY = $$.selectionSvg
      .select('.d2b-tooltip-marker-y')
        .call(positionMarker, pointInfo, 'y');

    $$.tooltip
        .call(populateTooltip, pointInfo)
        .call(positionTooltip, pointInfo, baseBox);

    $$.dispatch.call("move", $$.tooltip, this, d, i);
  };

  const mouseout = function (d, i) {
    $$.selectionSvg.selectAll('.d2b-tooltip-marker, .d2b-tooltip-base').remove();
    $$.selection.selectAll('.d2b-tooltip')
      .transition()
        .duration(100)
        .style('opacity', 0)
        .remove();

    $$.dispatch.call("remove", $$.tooltip, this, d, i);
  };

  const event = (listener) => {
    return `${listener}.d2b-tooltip-axis`;
  };

  // update container which houses tooltip html components
  const updateContainerHtml = (n, o) => {
    if (o) o.select(`div.d2b-tooltip-axis-area-${id}`).remove();
    if (!n) return;
    $$.selection = n.selectAll(`div.d2b-tooltip-axis-area-${id}`).data([tooltip]);
    $$.selection = $$.selection.merge(
      $$.selection.enter().append('div').attr('class', `d2b-tooltip-axis-area-${id} d2b-tooltip-axis-area`)
    );
  };

  // update container which houses tooltip svg components
  const updateContainerSvg = (n, o) => {
    if (o) o.select(`g.d2b-tooltip-axis-area-${id}`).remove();
    if (!n) return;
    $$.selectionSvg = n.selectAll(`g.d2b-tooltip-axis-area-${id}`).data([tooltip]);
    $$.selectionSvg = $$.selectionSvg.merge(
      $$.selectionSvg.enter().append('g').attr('class', `d2b-tooltip-axis-area-${id} d2b-tooltip-axis-area`)
    );
  };

  // update mouse event tracker
  const updateTracker = (n, o) => {
    if (o) {
      o
          .on(event('mouseover'), null)
          .on(event('mouseout'), null)
          .on(event('mousemove'), null);
    }
    if (n) {
      n
          .on(event('mouseover'), mouseover)
          .on(event('mouseout'), mouseout)
          .on(event('mousemove'), mousemove);
    }
  };

  // setup tooltip model
  const model = base(tooltip, $$)
    .addProp('htmlContainer', d3.select('body'), null, updateContainerHtml)
    .addProp('svgContainer', null, null, updateContainerSvg)
    .addProp('tracker', d3.select('body'), null, updateTracker)
    .addProp('size', {height: 0, width: 0})
    .addProp('trackX', true)
    .addProp('trackY', false)
    .addMethod('clear', function (groupName, graphName) {
      if (arguments.length === 0) groups = {};
      else if (arguments.length === 1) delete groups[groupName];
      else if (arguments.length >= 2) delete groups[groupName][graphName];
    })
    .addPropFunctor('title', null)
    .addPropFunctor('x', d => d.x)
    .addPropFunctor('y', d => d.y)
    .addPropFunctor('color', null)
    .addPropFunctor('row', null)
    .addDispatcher(['insert', 'move', 'remove']);


  // construct an interface for each graph that is initialized
  let groups = {};
  tooltip.graph = function (groupName = null, graphName = null) {
    const graphs = groups[groupName] = groups[groupName] || {};
    let graph = graphs[graphName];

    if (!graph) {
      graph = graphs[graphName] = {config: {}};
      const graphModel = base(graph, graph.config);

      graphModel
        .addProp('data', [])
        .addMethod('addPoint', p => graph.config.data.push(p))
        .addPropFunctor('x', null)
        .addPropFunctor('y', null)
        .addPropFunctor('color', null)
        .addPropFunctor('row', null);
    }

    return graph;
  };

  return tooltip;
};
