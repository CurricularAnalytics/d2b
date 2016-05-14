import {default as base} from '../model/base.js';
import {default as textWrap} from '../util/textWrap.js';

// plane svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const plane = function (context) {
    const selection = context.selection? context.selection() : context;

    selection.each(function (d, i) {
      const size = $$.size.call(this, d, i),
            margin = makeMargin($$.margin.call(this, d, i)),
            axes = $$.axes.call(this, d, i);

      let padding = makePadding($$.padding.call(this, d, i));

      // axes element
      const el = d3.select(this);

      // enter new axes
      const axis = el.selectAll('.d2b-axis').data(axes, $$.key),
            axisEnter = axis.enter().append('g').attr('class', 'd2b-axis');

      axisEnter.append('text').attr('class', 'd2b-axis-label-outer');
      axisEnter.append('text').attr('class', 'd2b-axis-label-inner');

      let axisUpdate = axis.merge(axisEnter);
      let axisExit = axis.exit();

      if (context !== selection) axisExit = axisExit.transition(context);
      axisExit.style('opacity', 0).remove();

      // if padding is null, find it dynamically
      if (!padding) padding = getDynamicPadding(axisUpdate, size);

      // create plane box model
      const box = this.planeBox = {
        top: margin.top + padding.top,
        bottom: margin.bottom + padding.bottom,
        right: margin.right + padding.right,
        left: margin.left + padding.left
      };
      box.height = size.height - box.top - box.bottom;
      box.width = size.width - box.left - box.right;

      // update each axis
      axisUpdate.each(function (d, i) {
        const axis = $$.axis.call(this, d, i),
              scale = axis.scale(),
              orient = $$.orient.call(this, d, i).split(' '),
              labelInner = $$.labelInner.call(this, d, i),
              labelOuter = $$.labelOuter.call(this, d, i),
              wrapLength = $$.wrapLength.call(this, d, i),
              el = d3.select(this),
              vert = ['right', 'left'].indexOf(orient[0]) > -1;

        let axisUpdate = d3.select(this);
        if (context !== selection) axisUpdate = axisUpdate.transition(context);

        if (vert) scale.range([0, box.height]);
        else scale.range([0, box.width]);

        let labelPadInner = 0;
        let labelPadOuter = 0;
        axisUpdate
            .call(axis)
          .selectAll('.tick text')
            .each(function () {
              const tick = d3.select(this);
              const text = tick.text();
              console.log(text)
              tick
                .text('')
                .call(textWrap, (d) => d, wrapLength);
              const box = this.getBBox();

              if (orient[1] === 'inner') labelPadInner = Math.max(labelPadInner, box[vert? 'width' : 'height']);
              else labelPadOuter = Math.max(labelPadOuter, box[vert? 'width' : 'height']);

              if (orient[0] === 'top' && orient[1] === 'outer') {
                tick.selectAll('tspan').attr('y', tick.attr('y') - box.height);
              }
            });

        const labelOuterUpdate = axisUpdate.select('.d2b-axis-label-outer').text(labelOuter);
        const labelInnerUpdate = axisUpdate.select('.d2b-axis-label-inner').text(labelInner);

        const labelOuterBox = labelOuterUpdate.node().getBBox();
        const labelInnerBox = labelInnerUpdate.node().getBBox();
        // console.log
        switch (orient[0]) {
          case 'right':
            axisUpdate.attr('transform', `translate(${box.left + box.width}, ${box.top})`);
            labelOuterUpdate.attr('transform', `translate(${labelPadOuter}, ${box.height / 2})`);
            labelInnerUpdate.attr('transform', `translate(${-labelPadInner}, ${box.height})`);
            break;
          case 'bottom':
            axisUpdate.attr('transform', `translate(${box.left}, ${box.top + box.height})`);
            // labelOuterUpdate.attr('transform', `translate(
            //   ${}, ${}
            // )`);
            // labelInnerUpdate.attr('transform', `translate(
            //   ${}, ${}
            // )`);
            break;
          case 'left':
            axisUpdate.attr('transform', `translate(${box.left}, ${box.top})`);
            // labelOuterUpdate.attr('transform', `translate(
            //   ${}, ${}
            // )`);
            // labelInnerUpdate.attr('transform', `translate(
            //   ${}, ${}
            // )`);
            break;
          case 'top':
            axisUpdate.attr('transform', `translate(${box.left}, ${box.top})`);
            labelOuterUpdate.attr('transform', `translate(${box.width / 2}, ${-labelPadOuter})`);
            labelInnerUpdate.attr('transform', `translate(${box.width}, ${labelPadInner})`);
            break;
        };

      });
    });

    return plane;
  };

  /* Inherit from base model */
  const model = base(plane, $$)
    // plane level functors
    .addPropFunctor('size', d => d.size || {width: 960, height: 500})
    .addPropFunctor('padding', null)
    .addPropFunctor('margin', 0)
    .addPropFunctor('axes', d => d.axes)
    // axis level functors
    .addPropFunctor('axis', d => d.axis || d3.axisBottom())
    .addPropFunctor('orient', d => d.orient || 'bottom')
    .addPropFunctor('wrapLength', Infinity)
    .addPropFunctor('key', (d, i) => d.key || i)
    .addPropFunctor('labelInner', d => d.labelInner || null)
    .addPropFunctor('labelOuter', d => d.labelOuter || null)

  return plane;

  // insert and remove axes and labels to find the largest ticks on any sides
  function getDynamicPadding(axisSvg, size) {
    const axisPad = {top: 0, left: 0, right: 0, bottom: 0},
          labelPad = {top: 0, left: 0, right: 0, bottom: 0};
    axisSvg.each(function (d, i) {
      const axis = $$.axis.call(this, d, i),
            scale = axis.scale(),
            orient = $$.orient.call(this, d, i).split(' '),
            labelOuter = $$.labelOuter.call(this, d, i),
            wrapLength = $$.wrapLength.call(this, d, i),
            el = d3.select(this),
            vert = ['right', 'left'].indexOf(orient[0]) > -1;

      if (vert) scale.range([0, size.height]);
      else scale.range([0, size.width]);

      if (orient[1] !== 'inner') {
        const testAxis = el.append('g');
        testAxis
            .call(axis)
            .selectAll('.tick text')
              .each(function () {
                const tick = d3.select(this);
                const text = tick.text();
                tick
                  .text('')
                  .call(textWrap, () => text, wrapLength);

                const box = this.getBBox();

                axisPad[orient[0]] = Math.max(axisPad[orient[0]],
                                              box[vert? 'width' : 'height']);
              });
        testAxis.remove();
      }

      if (labelOuter) {
        const testLabel = el.append('text')
            .attr('class', 'd2b-axis-label-outer')
            .text(labelOuter);

        const box = testLabel.node().getBBox();
        labelPad[orient[0]] = Math.max(labelPad[orient[0]],
                                       box[vert? 'width' : 'height']);
        testLabel.remove();
      }

    });
    return {
      left: axisPad.left + labelPad.left,
      right: axisPad.right + labelPad.right,
      top: axisPad.top + labelPad.top,
      bottom: axisPad.bottom + labelPad.bottom
    };
  }

  // create padding from number or object
  function makePadding(p) {
    return (typeof p === 'number')? {top: p, left: p, right: p, bottom: p} : p;
  }

  // create margin same as padding but default as 0
  function makeMargin(m) {
    m = m || 0;
    return makePadding(m);
  }
};
