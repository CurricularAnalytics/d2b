import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as stack} from '../util/stack.js';
import {default as id} from '../core/id.js';

// bar svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const bar = function (context) {
    const selection = context.selection? context.selection() : context;
    // iterate through each selection element
    selection.each(function (d, i) {
      // set orientation mappings
      let orient = {};
      if ($$.orient.call(this, d, i) === 'horizontal') {
        orient = { rotate: true, px: 'py', py: 'px', x: 'y', y: 'x', w: 'height', h: 'width' };
      } else {
        orient = { rotate: false, px: 'px', py: 'py', x: 'x', y: 'y', w: 'width', h: 'height' };
      }
      stacker.x($$[orient.px]).y($$[orient.py]);

      // run each selection datum through the stacker
      const stacking = stackNest.entries(d);
      stacking.forEach((sg, si) => stacker.out(buildOut(si))(sg.values));

      // compute bar sizing properties
      const bandwidth = (1 - $$.padding.call(this, d, i)) *
                        ($$.bandwidth.call(this, d, i) || getBandwidth(d, orient)),
            barWidth = bandwidth / stacking.length,
            groupPadding = barWidth * $$.groupPadding.call(this, d, i);

      // enter update exit bar graph container
      const graph = d3.select(this).selectAll('.d2b-bar-graph').data(d, $$.key);

      const graphEnter = graph.enter().append('g')
          .attr('class', 'd2b-bar-graph')
          .style('opacity', 0);

      let graphUpdate = graph.merge(graphEnter).order(),
          graphExit = graph.exit();

      if (context !== selection) {
        graphUpdate = graphUpdate.transition(context);
        graphExit = graphExit.transition(context);
      }

      graphUpdate.style('opacity', 1);
      graphExit.style('opacity', 0).remove();

      if ($$.tooltip) $$.tooltip.clear('bar');

      // iterate through graph containers
      graphUpdate.each(function (d, i) {
        const graph = d3.select(this),
              color = $$.color.call(this, d, i),
              x = $$[orient.x].call(this, d, i),
              y = $$[orient.y].call(this, d, i),
              values = $$.values.call(this, d, i);

        let shift = $$.shift.call(this, d, i);
        if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

        // enter update exit bars
        const bar = graph.selectAll('.d2b-bar-group').data(values, $$.pkey);
        const barEnter = bar.enter().append('g').attr('class', 'd2b-bar-group');
        barEnter.append('rect');
        let barUpdate = bar.merge(barEnter).order(),
            barExit = bar.exit();

        barUpdate.each(function (d, i) {
          const centered = $$.pcentered.call(this, d, i),
                barShift = (centered)? shift - bandwidth / 4
                                      :
                                        shift - bandwidth / 2 +
                                        d.__stackIndex__ * barWidth +
                                        groupPadding;
          d.__basepx__ = x(d.__base__) + barShift;
          d.__extentpx__ = [y(d.__extent__[0]), y(d.__extent__[1])]
          d.__extentpx__.sort(d3.ascending);
        });

        if ($$.tooltip) $$.tooltip.graph('bar', i)
          .data(values)
          [orient.x]((d, i) => x($$[orient.px](d, i)))
          [orient.y]((d, i) => y($$[orient.py](d, i)))
          .color((d, i) => $$.pcolor(d, i) || color);

        if (context !== selection) {
          barUpdate = barUpdate.transition(context);
          barExit = barExit.transition(context);
        }

        barEnter
            .attr('class', 'd2b-bar-group')
            .style('opacity', 0)
            .call(transformBar, {x: d => d.__basepx__, y: d => y(0)}, orient)
          .select('rect')
            .attr('fill', function (d, i) {
              return $$.pcolor.call(this, d, i) || color;
            })
            .attr(orient.w, barWidth - groupPadding * 2)
            .attr(orient.h, 0);

        barUpdate
            .style('opacity', 1)
            .call(transformBar, {x: d => d.__basepx__, y: d => d.__extentpx__[0]}, orient)
          .select('rect')
            .attr('fill', function (d, i) {
              return $$.pcolor.call(this, d, i) || color;
            })
            .attr(orient.w, barWidth - groupPadding * 2)
            .attr(orient.h, d => d.__extentpx__[1] - d.__extentpx__[0]);

        barExit.style('opacity', 0).remove();

      });
    });

    return bar;
  };

  const stacker = stack();

  const stackNest = d3.nest().key(d => {
    const key = $$.stackBy(d);
    return (key !== false && key !== null)? key : id();
  });

  // custom stacker build out that separates the negative and possitive bars
  function buildOut(stackIndex) {
    const offsets = {};
    return function(d, y0, y1, x){
      const dy = y1 - y0,
            offset = offsets[x] = offsets[x] || [0, 0];
      d.__stackIndex__ = stackIndex;
      d.__base__ = x;
      if(dy > 0) d.__extent__ = [offset[0], offset[0] += dy];
      else d.__extent__ = [offset[1], offset[1] += dy];
    }
  }

  // transform bar position
  function transformBar (transition, pos, orient) {
    transition.attr('transform', d => {
      return `translate(${[pos[orient.x](d), pos[orient.y](d)]})`;
    });
  }

  // find closes non equal point pixel distance on the base axis
  function getBandwidth (data, orient) {
    const xVals = [];
    data.forEach( (graph, graphIndex) => {
      const x = $$[orient.x].call(data, graph, graphIndex),
            values = $$.values.call(data, graph, graphIndex);

      values.forEach( (d, i) => {
        const px = $$[orient.px].call(graph, d, i);
        xVals.push(x(px));
      });
    });

    xVals.sort(d3.ascending);

    let bandwidth = Infinity;
    for (let i = 0; i < xVals.length-1; i++) {
      if (xVals[i+1] === xVals[i]) continue;
      bandwidth = Math.min(xVals[i+1] - xVals[i], bandwidth);
    }
    return bandwidth;
  }

  /* Inherit from base model */
  const model = base(bar, $$)
      .addProp('stack', d3.stack(), null, d => stacker.stack(d))
      .addProp('x', d3.scaleLinear(), function (d) {
        if (!arguments.length) return $$.x;
        if (d.domain) $$.x = () => d;
        else $$.x = d;
        return bar;
      })
      .addProp('y', d3.scaleLinear(), function (d) {
        if (!arguments.length) return $$.y;
        if (d.domain) $$.y = () => d;
        else $$.y = d;
        return bar;
      })
      .addProp('tooltip', null)
      .addPropFunctor('orient', 'vertical')
      .addPropFunctor('padding', 0.5)
      .addPropFunctor('groupPadding', 0)
      .addPropFunctor('bandwidth', null)
      .addPropFunctor('shift', null)
      .addPropFunctor('stackBy', null)
      .addPropFunctor('key', d => d.label)
      .addPropFunctor('values', d => d.values, null, d => stacker.values(d))
      .addPropFunctor('color', d => color(d.label))
      .addPropFunctor('px', d => d.x)
      .addPropFunctor('py', d => d.y)
      .addPropFunctor('pcentered', false)
      .addPropFunctor('pcolor', null)
      .addPropFunctor('pkey', (d, i) => i);

  return bar;
};


//original stacking function, might use this one instead of d3 stack layout in the future
// // create stack layout based on $$.stack key accessor
// const stacking = stackNest.entries(data);
// const bandwidth = (1 - $$.padding.call(this, data, i)) * ($$.bandwidth.call(this, data, i) || getBandwidth(data, orient));
// const barWidth = bandwidth / stacking.length;
// const groupPadding = barWidth * $$.groupPadding.call(this, data, i);
//
// stacking.forEach((stack, stackIndex) => {
//   // group values in this stack by positive 'sp' and negative 'sn' values
//   const sp = {}, sn = {};
//
//   stack.values.forEach((graph, graphIndex) => {
//     graphIndex = data.indexOf(graph);
//     const values = $$.values.call(data, graph, graphIndex),
//           x = $$[orient.x].call(data, graph, graphIndex),
//           y = $$[orient.y].call(data, graph, graphIndex),
//           offset = $$.offset.call(data, graph, graphIndex) || (x.rangeBand)? x.rangeBand() / 2 : 0;
//     values.forEach((d, i) => {
//       const px = $$[orient.px].call(graph, d, i),
//             py = $$[orient.py].call(graph, d, i),
//             barOffset = offset - bandwidth / 2 + stackIndex * barWidth + groupPadding;
//
//       d.base = x(px) + barOffset;
//       if (py > 0) d.extent = [y(sp[px] = sp[px] || 0), y(sp[px] = sp[px] + py)];
//       else d.extent = [y(sn[px] = sn[px] || 0), y(sn[px] = sn[px] + py)];
//       d.extent.sort(d3.ascending);
//     });
//   });
// });
