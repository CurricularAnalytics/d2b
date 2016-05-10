import {default as base} from '../model/base.js';

// axis svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const axes = function (context) {
    const selection = context.selection? context.selection() : context;

    return axes;
  };

  /* Inherit from base model */
  const model = base(axes, $$);

  return axes;
};
