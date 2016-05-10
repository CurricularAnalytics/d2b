import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as point} from '../svg/point.js';
import {default as mean} from '../math/mean.js';

// bubble pack svg generator
export default function () {
  const $$ = {};

  // bubble pack updater
  const bubblePack = function (context) {
    const transition = context.selection? context : null,
          selection = context.selection? context.selection() : context,
          graph = selection.selectAll('.d2b-bubble-pack-graph').data(d => d, $$.key);

    // enter graph
    const graphEnter = graph.enter().append('g').attr('class', 'd2b-bubble-pack-graph');

    let graphUpdate = graph.merge(graphEnter).order(),
        graphExit = graph.exit();

    if (transition) {
      graphUpdate = graphUpdate.transition(transition);
      graphExit = graphExit.transition(transition);
    }

    if ($$.tooltip) $$.tooltip.clear('bubblePack');

    // update graph
    graphUpdate.style('opacity', 1);

    // exit graph
    graphExit.style('opacity', 0).remove();

    // iterate through each context element
    context.each(function (d, i) {
      const selection = d3.select(this),
            graph = selection.selectAll('.d2b-bubble-pack-graph');

      selection.on('change', function () {
        selection.transition().duration($$.duration).call(bubblePack);
      });

      // render the bubble packs for each graph
      graph.each( function (d, i) {
        const el = d3.select(this),
              x = $$.x.call(this, d, i),
              y = $$.y.call(this, d, i),
              color = $$.color.call(this, d, i),
              symbol = $$.symbol.call(this, d, i);

        d.values.forEach(compute);

        let shift = $$.shift.call(this, d, i);
        if (shift === null) shift = (x.bandwidth)? x.bandwidth() / 2 : 0;

        $$.point
            .fill( function (dd, ii) {
              return $$.pcolor.call(this, dd, ii) || color;
            })
            .type( function (dd, ii) {
              return $$.psymbol.call(this, dd, ii) || symbol;
            });

        const addTooltipPoint = $$.tooltip?
            $$.tooltip.graph('bubblePack', i)
                .x((d, i) => x(d.__x__))
                .y((d, i) => y(d.__y__))
                .color((d, i) => $$.pcolor(d, i) || color)
                .addPoint
              : null;
        renderPacks(el, d.values, transition, x, y, shift, selection, addTooltipPoint);
      });

      positionIndicators(selection);
    });

    return bubblePack;
  };

  // Position all bubble indicators to be next to each other.
  function positionIndicators(selection) {
    let positionx = 0, positiony = 0, maxWidth = 300;
    selection.selectAll('.d2b-bubble-indicator.d2b-active')
      .attr('transform', function () {
        const box = this.getBBox();

        if (box.width + positionx > maxWidth && positionx > 0) {
          positionx = 0;
          positiony += box.height + 5;
        }

        const translate = `translate(${positionx}, ${positiony})`;
        positionx += box.width + 5;
        return translate;
      });
  }

  // On chart change (usually a bubble/indicator click) update and dispatch events.
  function change(node, d, i, chart) {
    if (!d.__children__) return;
    d3.select(node).dispatch('change', {bubbles: true, cancelable: true});
  }

  /**
   * Renders bubble.
   * @param {d3.selection} el - bubble pack
   * @param {d3.transition or null} trans - transition if present
   * @param {d3.scale} x - x scale
   * @param {d3.scale} y - y scale
   * @param {Number} shift - horizontal pixel shift
   * @param {d3.selection} chart - master chart container
   */
  function renderPoint(el, trans, x, y, shift, chart) {
    el.each(function (d, i) {
      let el = d3.select(this);

      const transform = el.attr('transform');

      if (!transform) {
        el.attr('transform', `translate(`+
          `${x(d.__parent__? d.__parent__.__x__ : d.__x__) + shift},`+
          `${y(d.__parent__? d.__parent__.__y__ : d.__y__)})`);
      }

      if (d.__children__) {
        el
            .attr('cursor', 'pointer')
            .on('click', function () {
              d3.select(this).dispatch('change', {bubbles: true, cancelable: true});
            })
            .on('change', d => d.__expanded__ = !d.__expanded__);
      } else el.attr('cursor', '').on('click', null);

      if (trans) el = el.transition(trans);

      if (d.__expanded__) el.style('opacity', 0).selectAll('*').remove();
      else el.style('opacity', 1).call($$.point);

      el.attr('transform', `translate(${x(d.__x__) + shift}, ${y(d.__y__)})`);
    });
  }

  /**
   * Renders bubble indicator.
   * @param {d3.selection} el - bubble pack
   * @param {d3.transition or null} trans - transition if present
   * @param {d3.scale} x - x scale
   * @param {d3.scale} y - y scale
   * @param {Number} shift - horizontal pixel shift
   * @param {d3.selection} chart - master chart container
   */
  function renderIndicator(el, trans, x, y, shift, chart) {
    el.each(function (d, i) {
      let el = d3.select(this).classed('d2b-active', d.__expanded__);

      if (!d.__expanded__) return el.selectAll('rect, text').remove();

      let rect = el.select('rect'),
          text = el.select('text');
      if (!rect.size()) rect = el.append('rect');
      if (!text.size()) text = el.append('text');

      text.text($$.pindicator.call(this, d, i).substring(0,5)).attr('x', 5);
      const textBox = text.node().getBBox();
      text.attr('y', textBox.height / 1.35);
      rect
        .on('click', function () {
          d3.select(this).dispatch('change', {bubbles: true, cancelable: true});
        })
        .on('change', d => d.__expanded__ = !d.__expanded__)
        .attr('width', textBox.width + 10)
        .attr('height', textBox.height)
        .style('fill', $$.point.fill())
        .style('stroke', $$.point.stroke());
    });
  }

  /**
   * Renders bubble packs recursively.
   * @param {d3.selection} el - packs container
   * @param {Array} data - packs data
   * @param {d3.transition or null} trans - transition if present
   * @param {d3.scale} x - x scale
   * @param {d3.scale} y - y scale
   * @param {Number} shift - horizontal pixel shift
   * @param {d3.selection} chart - master chart container
   * @param {function} addTooltipPoint - function to append a point to the tooltip component
   * @param {Number} depth - depth tracker
   */
  function renderPacks(el, data, trans, x, y, shift, chart, addTooltipPoint, depth = 0) {
    // set pack data
    const pack = el.selectAll(`.d2b-bubble-pack.d2b-depth-${depth}`)
              .data(data, $$.pkey),
          packEnter = pack.enter().append('g')
              .attr('class', `d2b-bubble-pack d2b-depth-${depth}`),
          packUpdate = pack.merge(packEnter);

    packEnter.append('g').attr('class', 'd2b-bubble-point').style('opacity', 0);
    renderPoint(packUpdate.select('.d2b-bubble-point'), trans, x, y, shift, chart);
    packEnter.append('g').attr('class', 'd2b-bubble-indicator');
    renderIndicator(packUpdate.select('.d2b-bubble-indicator'), trans, x, y, shift, chart);

    // update children bubbles if expanded
    packUpdate.each(function (d, i) {
      const el = d3.select(this);
      if (d.__children__ && d.__expanded__) {
        renderPacks(el, d.__children__, trans, x, y, shift, chart, addTooltipPoint, depth + 1);
      } else {
        if (addTooltipPoint) addTooltipPoint(d);
        el.selectAll('.d2b-bubble-pack')
          .transition(trans)
            .remove()
          .select('.d2b-bubble-point')
            .style('opacity', 0)
            .attr('transform', `translate(${x(d.__x__)+shift}, ${y(d.__y__)})`);
      }
    });

    let packExit = pack.exit();
    if (trans) packExit = packExit.transition(trans);
    packExit.remove();
  }

  // Recursively set the data structure starting at root node `d`
  function setStructure (d, depth = 0) {
    const children = $$.pchildren(d);
    d.__leaves__ = [];
    d.__depth__ = depth;
    if (children && children.length) {
      d.__children__ = children;
      children.forEach(function (child) {
        setStructure(child, depth + 1);
        child.__parent__ = d;
        d.__leaves__ = d.__leaves__.concat(child.__leaves__);
      });
    } else {
      d.__x__ = $$.px(d);
      d.__y__ = $$.py(d);
      d.__size__ = $$.psize(d);
      d.__leaves__.push(d);
    }
  }

  // Recursively set x, y, size attributes starting at root node `d`
  function setAttributes (d) {
    d.__x__ = ($$.tendancy.x || $$.tendancy)(d.__leaves__, d => d.__x__, d => d.__size__);
    d.__y__ = ($$.tendancy.y || $$.tendancy)(d.__leaves__, d => d.__y__, d => d.__size__);
    d.__size__ = d3.sum(d.__leaves__, d => d.__size__);

    if (d.__children__ && d.__children__.length) {
      d.__children__.forEach(child => setAttributes(child));
    }
  }

  // Compute hierarchical structure and render attributes
  function compute (d) {
    setStructure(d);
    setAttributes(d);
  }

  /* Inherit from base model */
  const model = base(bubblePack, $$)
    .addProp('point', point().active(true), null, d => {
      $$.point
          .size(d => d.__size__ * 100)
          .active(d => !!d.__children__);
    })
    .addProp('x', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.x;
      if (d.domain) $$.x = () => d;
      else $$.x = d;
      return bubblePack;
    })
    .addProp('y', d3.scaleLinear(), function (d) {
      if (!arguments.length) return $$.y;
      if (d.domain) $$.y = () => d;
      else $$.y = d;
      return bubblePack;
    })
    .addProp('tooltip', null)
    .addProp('tendancy', mean)
    .addProp('duration', 250)
    .addPropFunctor('shift', null)
    .addPropFunctor('key', d => d.label)
    .addPropFunctor('values', d => d.values)
    .addPropFunctor('color', d => color(d.label))
    .addPropFunctor('symbol', d => d3.symbolCircle)
    .addPropFunctor('px', d => d.x)
    .addPropFunctor('py', d => d.y)
    .addPropFunctor('psize', d => d.size)
    .addPropFunctor('pchildren', d => d.children)
    .addPropFunctor('pcolor', d => null)
    .addPropFunctor('psymbol', null)
    .addPropFunctor('pindicator', d => d.label)
    .addPropFunctor('pkey', (d, i) => i);

  return bubblePack;
};
