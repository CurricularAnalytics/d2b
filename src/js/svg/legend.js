import {default as base} from '../model/base.js';
import {default as color} from '../core/color.js';
import {default as textWrap} from '../util/textWrap.js';
import {default as svgPoint} from '../svg/point.js';

export default function () {
  const $$ = {};

  const legend = function (context) {
    context.each(function (data, index) {
      const selection = d3.select(this),
            size = $$.size.call(this, data, index),
            maxSize = $$.maxSize.call(this, data, index),
            orient = $$.orient.call(this, data, index),
            maxTextLength = $$.maxTextLength.call(this, data, index),
            items = $$.items.call(this, data, index);

      // Set point size and stroke width.
      point
          .size(1.5 * Math.pow(size / 2, 2))
          .strokeWidth(size * 0.1);

      // enter d2b-legend container
      let g = selection.selectAll('.d2b-legend').data([items]);
      g = g.merge(g.enter().append('g').attr('class', 'd2b-legend'));

      // enter d2b-legend-items
      let item = g.selectAll('.d2b-legend-item').data(d => d, $$.key);
      let itemEnter = item.enter()
        .append('g')
          .attr('class', 'd2b-legend-item')
          .style('opacity', 0);
      itemEnter.append('g').append('text');

      // exit d2b-legend-items
      let itemExit = item.exit();

      // merge enter and update items
      item = item.merge(itemEnter)
          .style('cursor', function (d, i) {
            const clickable = $$.clickable.call(this, d, i),
                  dblclickable = $$.dblclickable.call(this, d, i);
            return (clickable || dblclickable)? 'pointer' : 'auto';
          })

      // bind item events for each selection
      selection.call(bindEvents, index);

      // select item wrapper
      let wrap = item.select('g')
          .attr('transform', `translate(${size / 2}, ${size / 2})`);

      // select item text
      let text = item.select('text')
          .attr('transform', `translate(${size / 1.5}, ${size / 3})`)
          .style('font-size', `${size}px`)
          .call(textWrap, $$.label, maxTextLength);

      // init transitions if context is a transition
      if (context.selection) {
        itemExit = itemExit.transition(context).style('opacity', 0);
        item = item.transition(context);
        wrap = wrap.transition(context);
        text = text.transition(context);
      }

      // remove exiting items
      itemExit.remove();

      // wrap update
      wrap.call(point);

      // find max item width
      let maxWidth = 0;
      text.each(function () {
        maxWidth = Math.max(maxWidth, this.getBBox().width);
      });
      maxWidth += size;

      // inital item padding
      const pad = {x: size, y: 5};

      // entering items will be positioned immediately
      itemEnter.call(position[orient], this, pad, size, maxSize, maxWidth);

      // Initialize computed dimensions of the legend to 0. These are attached
      // as attributes to the legend selection node. They can be used to
      // reposition the legend accordingly.
      this.computedWidth = 0;
      this.computedHeight = 0;

      // update item position and opacity
      item
          .style('opacity', 1)
          .call(position[orient], this, pad, size, maxSize, maxWidth);
    });

    return legend;
  };

  // Bind events and dispatchers to all legend items within selection. Use the
  // 'd2b-legend' namespace.
  function bindEvents (selection, index) {
    selection.selectAll('.d2b-legend-item')
        .on('click.d2b-legend', function (d, i) {
          click.call(this, d, i, selection, index);
          $$.dispatch.call("click", this, selection, d, i);
        })
        .on('dblclick.d2b-legend', function (d, i) {
          dblclick.call(this, d, i, selection, index);
          $$.dispatch.call("dblclick", this, selection, d, i);
        })
        .on('mouseover.d2b-legend', function (d, i) {
          $$.dispatch.call("mouseover", this, selection, d, i);
        })
        .on('mouseout.d2b-legend', function (d, i) {
          $$.dispatch.call("mouseout", this, selection, d, i);
        });
  }

  // On legend item click decide and perform any necessary actions.
  function click (d, i, selection, index) {
    const clickable = $$.clickable.call(this, d, i),
          allowEmptied = $$.allowEmptied.call(selection.node(), selection.datum(), index),
          data = selection.datum();

    if (!clickable) return;

    d.empty = !d.empty;

    d3.select(this).transition('d2b-legend-change').duration(100).call(point);

    if (allowEmptied) return $$.dispatch.call("change", this, selection, d, i);

    let allEmpty = true;
    data.forEach( d => allEmpty = (d.empty)? allEmpty : false );

    if (allEmpty) {
      data.forEach( d => d.empty = false );
      selection.transition('d2b-legend-change').duration(100).call(legend);
    }

     $$.dispatch.call("change", this, selection, d, i);
  };

  // On legend item dblclick decide and perform any necessary actions.
  function dblclick (d, i, selection, index) {
    const dblclickable = $$.dblclickable.call(this, d, i),
          data = selection.datum();

    if (!dblclickable) return;

    data.forEach(d => d.empty = true);
    d.empty = false;

    selection.transition('d2b-legend-change').duration(100).call(legend);

    $$.dispatch.call("change", this, selection, d, i);
  };

  // Initialize new d2b point.
  const point = svgPoint().empty(d => d.empty);

  // Position legend items either horizontally or vertically.
  const position = {
    // transition - d3 transition for legend items that need to be positioned
    // legendNode - svg node for the current legend (to set compute dimensions)
    // pad - item padding
    // size - legend 'size', usually the height of each legend item
    // maxSize - object with 'width' and 'height' attributes to bound either the vertical or horizontal legend
    // maxWidth - maximum width of all legend items
    horizontal: (transition, legendNode, pad, size, maxSize, maxWidth) => {
      let x = 0, y = 0, maxHeight = 0;
      transition
        .attr('transform', function () {
          const el = d3.select(this),
                boxHeight = size * el.selectAll('tspan').size(),
                boxWidth = el.select('text').node().getBBox().width;

          if (x + maxWidth > maxSize.width) {
            x = 0;
            y += maxHeight + pad.y;
            maxHeight = 0;
          }
          const translate = `translate(${x}, ${y})`;
          maxHeight = Math.max(maxHeight, boxHeight);
          legendNode.computedWidth = Math.max(legendNode.computedWidth, x + boxWidth + 1.5 * size);
          x += maxWidth + pad.x;
          return translate;
        });
      legendNode.computedHeight = y + maxHeight;
    },
    vertical: (transition, legendNode, pad, size, maxSize) => {
      let x = 0, y = 0, maxWidth = 0;
      transition
        .attr('transform', function () {
          const el = d3.select(this),
                boxHeight = size * el.selectAll('tspan').size(),
                boxWidth = el.select('text').node().getBBox().width;

          if (y + boxHeight > maxSize.height){
            x += maxWidth + pad.x + size;
            y = 0;
            maxWidth = 0;
          }
          const translate = `translate(${x}, ${y})`;
          maxWidth = Math.max(maxWidth, boxWidth);
          legendNode.computedHeight = Math.max(legendNode.computedHeight, y + boxHeight);
          y += boxHeight + pad.y;
          return translate;
        });
      legendNode.computedWidth = x + maxWidth + 1.5 * size;
    }
  };

  /* Inherit from base model */
  const model = base(legend, $$)
    // legend level functors
    .addPropFunctor('items', d => d)
    .addPropFunctor('size', 12)
    .addPropFunctor('maxSize', {width: 960, height: 500})
    .addPropFunctor('orient', 'vertical')
    .addPropFunctor('maxTextLength', Infinity)
    .addPropFunctor('allowEmptied', false)
    // legend item level functors
    .addPropFunctor('key', (d, i) => i)
    .addPropFunctor('clickable', false)
    .addPropFunctor('dblclickable', false)
    .addPropFunctor('label', d => d.label)
    // legend item point functors
    .addPropFunctor('active', false, null, _ => point.active(_) )
    .addPropFunctor('symbol', d3.symbolCircle, null, _ => point.type(_) )
    .addPropFunctor('color', d => color(d.label), null, _ => point.fill(_))
    // .addPropFunctor('empty', d => d.empty, null, _ => point.empty(_) )
    // Method to get the computed size of a specific legend container. This
    // method should be used after the legend has been rendered. Either the
    // legend SVG node or a d3 selection of the node may be specified.
    .addMethod('computedSize', (_) => {
      const node = (_.node)? _.node() : _;
      if (!node) return {width: 0, height: 0};
      return {width: node.computedWidth, height: node.computedHeight};
    })
    // Dispatcher setup.
		.addDispatcher(['dblclick', 'click', 'mouseover', 'mouseout', 'change']);

  return legend;
};
