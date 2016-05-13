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

      const el = d3.select(this);

      const axis = el.selectAll('.d2b-axis').data(axes, $$.key),
            axisEnter = axis.enter().append('g').attr('class', 'd2b-axis');

      let axisUpdate = axis.merge(axisEnter);
      let axisExit = axis.exit();

      if (context !== selection) axisExit = axisExit.transition(context);
      axisExit.style('opacity', 0).remove();

      if (!padding) padding = dynamicPadding(axisUpdate, size);

      // axisUpdate.each(function (d, i) {
      //   const axis = $$.axis.call(this, d, i),
      //         scale = axis.scale(),
      //         orient = $$.orient.call(this, d, i),
      //         key = $$.key.call(this, d, i),
      //         labelInner = $$.labelInner.call(this, d, i),
      //         labelOuter = $$.labelOuter.call(this, d, i),
      //         wrapLength = $$.wrapLength.call(this, d, i);
      //
      //
      //
      //   let axisUpdate = d3.select(this);
      //
      //   const maxLength = getMaxLength(axisUpdate, scale.ticks(), wrapLength);
      //
      //   // if (context !== selection) axisUpdate = axisUpdate.transition(context);
      //   //
      //   // axisUpdate.call(axis);
      //
      // });
    });

    return plane;
  };

  /* Inherit from base model */
  const model = base(plane, $$)
    // plane level functors
    .addPropFunctor('size', {width: 960, height: 500})
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

  // insert and remove axes to find the largest ticks on any sides
  function dynamicPadding(axisSvg, size) {
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

      const testAxis = el.append('g');

      testAxis
          .call(axis)
        // .selectAll('.tick text')
        //   .call(textWrapTicks, wrapLength);

      // textAxis.remove();

      const testLabel = el.append('text')
          .attr('class', 'd2b-axis-label-outer')
          .text(labelOuter);

      // testLabel.remove();

    });
  }


  // returns maximum tick length
  // function getMaxLength(container, ticks, wrapLength) {
  //   console.log(ticks)
  //   container.selectAll('.d2b-test-tick').data(ticks)
  //     .enter().append('text')
  //     .call(textWrap, function (d) { console.log(d)}, wrapLength);
  //
  // }

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
