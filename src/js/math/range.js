import {default as functor} from '../core/functor.js';

export default function (arr, value) {
  value = functor(value || function(d){return d;});
  var extent = d3.extent(arr, value);
  if(arr.length) return extent[1] - extent[0];
};
