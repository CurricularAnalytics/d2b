(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d2b = global.d2b || {})));
}(this, function (exports) { 'use strict';

	var pi = Math.PI;
	var sqrt8 = Math.sqrt(8);
	var sqrt2 = Math.sqrt(2);

	var mars = {
	  draw: function draw(context, size) {
	    var r = Math.sqrt(size / (pi + 5 / 4));
	    var s = 0.3125 * r;
	    var theta = 2 * Math.asin(1 / 4);
	    var theta2 = (pi / 2 - theta) / 2;
	    var circlex = r / sqrt8 - r * Math.cos(theta2);
	    var circley = r * Math.sin(theta2);

	    context.arc(circlex, circley, r, -theta2, 2 * pi - theta - theta2);
	    context.lineTo(r * (5 / 4 - 1 / sqrt2), -r * (1 / sqrt8 + 5 / 4 - 1 / sqrt2));
	    context.lineTo(r * (5 / 4 - 1 / sqrt2) - s, -r * (1 / sqrt8 + 5 / 4 - 1 / sqrt2));
	    context.lineTo(r * (5 / 4 - 1 / sqrt2) - s, -r * (1 / sqrt8 + 7 / 4 - 1 / sqrt2));
	    context.lineTo(r * (7 / 4 - 1 / sqrt2 + 1 / sqrt8), -r * (1 / sqrt8 + 7 / 4 - 1 / sqrt2));
	    context.lineTo(r * (7 / 4 - 1 / sqrt2 + 1 / sqrt8), -r * (5 / 4 - 1 / sqrt2) + s);
	    context.lineTo(r * (5 / 4 - 1 / sqrt2 + 1 / sqrt8), -r * (5 / 4 - 1 / sqrt2) + s);
	    context.lineTo(r * (5 / 4 - 1 / sqrt2 + 1 / sqrt8), -r * (5 / 4 - 1 / sqrt2));
	    context.closePath();
	  }
	};

	var venus = {
	  draw: function draw(context, size) {
	    var r = Math.sqrt(size / (pi + 5 / 4));
	    var theta = 2 * Math.asin(1 / 4);
	    var circley = r / 4 - r * Math.cos(theta / 2);

	    context.arc(0, circley, r, -pi * 3 / 2 + theta / 2, pi / 2 - theta / 2);
	    context.lineTo(r / 4, 3 * r / 4);
	    context.lineTo(r * 3 / 4, 3 * r / 4);
	    context.lineTo(r * 3 / 4, 5 * r / 4);
	    context.lineTo(r / 4, 5 * r / 4);
	    context.lineTo(r / 4, 7 * r / 4);
	    context.lineTo(-r / 4, 7 * r / 4);
	    context.lineTo(-r / 4, 5 * r / 4);
	    context.lineTo(-r * 3 / 4, 5 * r / 4);
	    context.lineTo(-r * 3 / 4, 3 * r / 4);
	    context.lineTo(-r / 4, 3 * r / 4);
	    context.closePath();
	  }
	};

	function functor(v) {
	  return typeof v === "function" ? v : function () {
	    return v;
	  };
	}

	function number (x) {
		return x === null ? NaN : +x;
	};

	function mean (arr, value, weight) {
	  var totalWeight = 0,
	      contribution = 0;
	  weight = functor(weight || 1);
	  value = functor(value || function (d) {
	    return d;
	  });
	  arr.filter(function (a) {
	    return !isNaN(number(weight(a))) && !isNaN(number(value(a)));
	  }).forEach(function (item) {
	    var w = weight(item),
	        v = value(item);
	    totalWeight += w;
	    contribution += v * w;
	  });
	  if (arr.length && totalWeight) return contribution / totalWeight;
	}

	function median (arr, value, weight) {
	  weight = functor(weight || 1);
	  value = functor(value || function (d) {
	    return d;
	  });

	  var medians = [],
	      midWeight;

	  var newArray = arr.filter(function (a) {
	    return weight(a) !== 0 && !isNaN(number(weight(a))) && !isNaN(number(value(a)));
	  }).sort(function (a, b) {
	    return d3.ascending(value(a), value(b));
	  });

	  midWeight = Math.round(d3.sum(newArray, function (item) {
	    return weight(item);
	  }) / 2 * 1e12) / 1e12;

	  var currentPosition = 0;
	  var getNext = false;

	  newArray.forEach(function (item) {
	    if (getNext) {
	      medians.push(value(item));
	      getNext = false;
	    }

	    currentPosition += weight(item);

	    if (currentPosition === midWeight) {
	      medians.push(value(item));
	      getNext = true;
	    }

	    if (currentPosition > midWeight && medians.length === 0) {
	      medians.push(value(item));
	    }
	  });

	  if (arr.length) return mean(medians);
	};

	function mode (arr, value, weight) {
	  weight = functor(weight || 1);
	  value = functor(value || function (d) {
	    return d;
	  });

	  var modes = [],
	      maxFrequency = 0,
	      frequencies = {};

	  arr.forEach(function (item) {
	    var val = number(value(item));
	    if (isNaN(value(item))) return;
	    frequencies[val] = frequencies[val] || 0;
	    frequencies[val] += weight(item);

	    if (frequencies[val] > maxFrequency) {
	      maxFrequency = frequencies[value(item)];
	      modes = [value(item)];
	    } else if (frequencies[value(item)] == maxFrequency) {
	      modes.push(value(item));
	    }
	  });

	  if (arr.length) return mean(modes);
	};

	function range (arr, value) {
	  value = functor(value || function (d) {
	    return d;
	  });
	  var extent = d3.extent(arr, value);
	  if (arr.length) return extent[1] - extent[0];
	};

	function midpoint (arr, value) {
	  value = functor(value || function (d) {
	    return d;
	  });
	  if (arr.length) return d3.mean(d3.extent(arr, value));
	};

	function toDegrees (angle) {
	  return angle * (Math.PI / 180);
	};

	function toRadians (angle) {
	  return angle * (180 / Math.PI);
	};

	/**
	  * d2b.modelBase() returns a d2b base model.
	  *
	  * model.interface() will return a base interface with various built in
	  * getter/setter methods.
	  * model.values() will return the values set through the interface.
	  * @param {function} base - function that will act as the model interface
	  * @param {object} $$ - attributes set by interactive with the base interface
	  * @return {Object} model - object with properties and methods
	  */

	function base() {
	  var _base = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  var _this = this;

	  var $$ = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	  var protect = arguments[2];


	  var propFn = function propFn(prop, cb) {
	    return function (_) {
	      if (!arguments.length) return $$[prop];
	      var old = $$[prop];
	      $$[prop] = _;
	      if (cb) cb(_, old);
	      return _base;
	    };
	  };

	  var propFnGet = function propFnGet(prop) {
	    return function (_) {
	      return $$[prop];
	    };
	  };

	  var propFnFunctor = function propFnFunctor(prop, cb) {
	    return function (_) {
	      if (!arguments.length) return $$[prop];
	      var old = $$[prop];
	      $$[prop] = functor(_);
	      if (cb) cb(_, old);
	      return _base;
	    };
	  };

	  /* Base Model */
	  var model = {
	    base: function base() {
	      return _base;
	    },
	    values: function values() {
	      return $$;
	    },
	    /**
	      * model.removeProp removes the specified property
	      * @param {Number} prop    - property key
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    removeProp: function removeProp(prop) {
	      if (protect.indexOf(prop) !== -1) {
	        console.error('Cannot remove ' + prop + ' property or value');
	        return model;
	      }

	      $$[prop] = null;
	      _base[prop] = null;
	      return model;
	    },
	    /**
	      * model.addProp allows new properties to be added to the model and base
	      * interface. If the property is already defined an error will be raised.
	      * @param {Number} prop    - property key
	      * @param {Number} value   - default value to set
	      * @param {Number} fn      - function as new prop getter/setter
	      * @param {Number} cb      - callback function after prop is set
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    addProp: function addProp(prop) {
	      var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	      var fn = arguments.length <= 2 || arguments[2] === undefined ? propFn(prop) : arguments[2];
	      var cb = arguments[3];

	      if ($$[prop] || _base[prop]) {
	        console.error(prop + ' property is already defined.');
	        return model;
	      }
	      // allow for null:default 'fn' in order to access callback
	      fn = fn || propFn(prop, cb);

	      $$[prop] = value;
	      _base[prop] = fn;

	      if (cb) cb(value);

	      return model;
	    },
	    /**
	      * model.addPropGet is similar to addProp except it doesn't allow for the
	      * property to be reset through the API.
	      * @param {Number} prop    - property key
	      * @param {Number} value   - default value to set
	      * @param {Number} fn      - function as new prop getter
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    addPropGet: function addPropGet(prop) {
	      var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	      var fn = arguments.length <= 2 || arguments[2] === undefined ? propFnGet(prop) : arguments[2];

	      if ($$[prop] || _base[prop]) {
	        console.error(prop + ' property is already defined.');
	        return model;
	      }

	      $$[prop] = value;
	      _base[prop] = fn;

	      return model;
	    },
	    /**
	      * model.addMethod allows new methods to be added to the model and base
	      * interface. If the method is already defined an error will be raised.
	      * @param {Number} method  - method key
	      * @param {Number} fn      - new method
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    addMethod: function addMethod(method, fn) {
	      if (_base[method]) {
	        console.error(method + ' method is already defined.');
	        return model;
	      }
	      _base[method] = fn;

	      return model;
	    },
	    /**
	      * model.addPropFunctor allows new functor properties to be added to the
	      * model and base interface. If the property is already defined an error
	      * will be raised.
	      * @param {Number} prop    - property key
	      * @param {Number} value   - default value to set
	      * @param {Number} fn      - function as new prop getter/setter
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    addPropFunctor: function addPropFunctor(prop) {
	      var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
	      var fn = arguments.length <= 2 || arguments[2] === undefined ? propFnFunctor(prop) : arguments[2];
	      var cb = arguments[3];

	      if ($$[prop] || _base[prop]) {
	        console.error(prop + ' property is already defined.');
	        return model;
	      }
	      // allow for null:default 'fn' in order to access callback
	      fn = fn || propFnFunctor(prop, cb);
	      value = functor(value);
	      if (cb) cb(value);

	      $$[prop] = value;
	      _base[prop] = fn;

	      return model;
	    },
	    /**
	      * model.addDispatch allows dispatcher to be added to the model and base
	      * interface.
	      * @param {Number} prop    - property key
	      * @param {Number} store   - store key
	      * @param {Number} events  - array of event keys
	      * @return {Object} model  - returns model to allow for method chaining
	      */
	    addDispatcher: function addDispatcher(events) {
	      var prop = arguments.length <= 1 || arguments[1] === undefined ? 'on' : arguments[1];
	      var store = arguments.length <= 2 || arguments[2] === undefined ? 'dispatch' : arguments[2];

	      if (_base[prop]) {
	        console.error(prop + ' property is already defined.');
	        return model;
	      }
	      if ($$[store]) {
	        console.error(store + ' value is already defined.');
	        return model;
	      }

	      _base[prop] = function (key, fn) {
	        if (arguments.length === 0) return $$[store];
	        if (arguments.length === 1) return $$[store].on(key);
	        $$[store].on(key, fn);

	        return _base;
	      };

	      $$[store] = d3.dispatch.apply(_this, events);

	      return model;
	    }
	  };

	  return model;
	};

	// point svg generator
	function point () {
	  var $$ = {};

	  /* Update Function */
	  var point = function point(context) {
	    var selection = context.selection ? context.selection() : context;

	    // point background
	    var back = selection.selectAll('path.d2b-point-back').data(function (d) {
	      return [d];
	    });

	    var backEnter = back.enter().append('path').attr('class', 'd2b-point-back').attr('d', symbolNormal).style('fill-opacity', 0).style('stroke', $$.stroke).style('stroke-width', $$.strokeWidth);

	    if (context !== selection) {
	      back = back.transition(context);
	    }

	    back.attr('d', symbolNormal).style('stroke', $$.stroke).style('stroke-width', $$.strokeWidth);

	    // point foreground
	    var front = selection.selectAll('path.d2b-point-front').data(function (d) {
	      return [d];
	    });

	    var frontEnter = front.enter().append('path').attr('class', 'd2b-point-front').attr('d', symbolSmall).style('opacity', frontOpacity).style('fill', $$.fill).style('stroke', $$.stroke).style('stroke-width', $$.strokeWidth);

	    if (context !== selection) {
	      front = front.transition(context);
	    }

	    front.attr('d', symbolSmall).style('opacity', frontOpacity).style('fill', $$.fill).style('stroke', $$.stroke).style('stroke-width', $$.strokeWidth);

	    // set mouse events if active
	    selection.each(function (d, i) {
	      var active = $$.active.call(this, d, i);
	      d3.select(this).on('mouseover.d2b-point', active ? mouseover : null).on('mouseout.d2b-point', active ? mouseout : null);
	    });

	    return point;
	  };

	  var symbol = d3.symbol();

	  /* Inherit from base model */
	  var model = base(point, $$).addPropFunctor('size', 150, null, function (d) {
	    return symbol.size(d);
	  }).addPropFunctor('type', d3.symbolCircle, null, function (d) {
	    return symbol.type(d);
	  }).addPropFunctor('active', false).addPropFunctor('empty', false).addPropFunctor('fill', 'steelblue').addPropFunctor('stroke', function (d, i) {
	    return d3.rgb($$.fill.call(this, d, i)).darker(0.3);
	  }).addPropFunctor('strokeWidth', '1px');

	  function frontOpacity(d, i) {
	    return $$.empty.call(this, d, i) ? 0 : 1;
	  }

	  function symbolBig(d, i) {
	    var size = $$.size.call(this, d, i),
	        empty = $$.empty.call(this, d, i);
	    return symbol.size(empty ? size : 2.5 * size).call(this, d, i);
	  }

	  function symbolSmall(d, i) {
	    var size = $$.size.call(this, d, i),
	        empty = $$.empty.call(this, d, i);
	    return symbol.size(empty ? size / 3 : size).call(this, d, i);
	  }

	  function symbolNormal(d, i) {
	    var size = $$.size.call(this, d, i);
	    return symbol.size(size).call(this, d, i);
	  }

	  function mouseover(d, i) {
	    var size = $$.size.call(this, d, i),
	        empty = $$.empty.call(this, d, i);

	    d3.select(this).select('path.d2b-point-back').transition().duration(100).attr('d', symbolBig);

	    d3.select(this).select('path.d2b-point-front').transition().duration(100).style('opacity', empty ? 0.5 : 1).attr('d', symbolSmall);
	  }

	  function mouseout(d, i) {
	    var size = $$.size.call(this, d, i),
	        empty = $$.empty.call(this, d, i);

	    d3.select(this).select('path.d2b-point-back').transition().duration(100).attr('d', symbolNormal);

	    d3.select(this).select('path.d2b-point-front').transition().duration(100).style('opacity', empty ? 0 : 1).attr('d', symbolSmall);
	  }

	  return point;
	};

	var color = d3.scaleCategory10();

	// Wraps text based on character count and text accessor. This method uses
	// d3's enter/update/exit strategy as to be less destructive on the text content.
	function textWrap (text) {
	  var getText = arguments.length <= 1 || arguments[1] === undefined ? function (d) {
	    return d.label;
	  } : arguments[1];
	  var count = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
	  var anchor = arguments.length <= 3 || arguments[3] === undefined ? 'start' : arguments[3];

	  getText = functor(getText);

	  text.each(function (d, i) {
	    var text = d3.select(this),
	        words = ('' + getText.call(this, d, i)).split(/\s+/).reverse(),
	        word = undefined,
	        lines = [],
	        line = [words.pop()],
	        lineHeight = 1.1,
	        x = +text.attr('x'),
	        y = +text.attr('y'),
	        dy = parseFloat(text.attr('dy')) || 0;

	    // clear text if the wrapper is being run for the first time
	    if (text.html().indexOf('tspan') === -1) text.text('');

	    while (word = words.pop()) {
	      if (line.join(' ').length + word.length > count) {
	        lines.push(line);
	        line = [];
	      }

	      line.push(word);
	    }
	    lines.push(line);

	    var tspan = text.selectAll('tspan').data(lines),
	        height = (lines.length - 1) * lineHeight,
	        offset = anchor === 'end' ? height : anchor === 'middle' ? height / 2 : 0;

	    tspan.merge(tspan.enter().append('tspan')).text(function (d) {
	      return d.join(' ');
	    }).attr('x', x).attr('y', y).attr('dy', function (d, i) {
	      return dy + i * lineHeight - offset + 'em';
	    });
	  });
	}

	function legend () {
	  var $$ = {};

	  var legend = function legend(context) {
	    context.each(function (data, index) {
	      var selection = d3.select(this),
	          itemSize = $$.itemSize.call(this, data, index),
	          size = $$.size.call(this, data, index),
	          orient = $$.orient.call(this, data, index).split(' '),
	          orient1 = orient[0],
	          maxTextLength = $$.maxTextLength.call(this, data, index),
	          items = $$.items.call(this, data, index);

	      // Set point size and stroke width for.
	      point$$.size(1.5 * Math.pow(itemSize / 2, 2)).strokeWidth(itemSize * 0.1);

	      // enter d2b-legend container
	      var g = selection.selectAll('.d2b-legend').data([items]),
	          gEnter = g.enter().append('g').attr('class', 'd2b-legend');
	      g = g.merge(gEnter);

	      // enter d2b-legend-items
	      var item = g.selectAll('.d2b-legend-item').data(function (d) {
	        return d;
	      }, $$.key);

	      var itemEnter = item.enter().append('g').attr('class', 'd2b-legend-item').style('opacity', 0);
	      itemEnter.append('g').append('text');

	      // exit d2b-legend-items
	      var itemExit = item.exit();

	      // merge enter and update items
	      item = item.merge(itemEnter).style('cursor', function (d, i) {
	        var clickable = $$.clickable.call(this, d, i),
	            dblclickable = $$.dblclickable.call(this, d, i);
	        return clickable || dblclickable ? 'pointer' : 'auto';
	      });

	      // bind item events for each selection
	      selection.call(bindEvents, index);

	      // select item wrapper
	      var wrap = item.select('g').attr('transform', 'translate(' + itemSize / 2 + ', ' + itemSize / 2 + ')');

	      // select item text
	      var text = item.select('text').attr('transform', 'translate(' + itemSize / 1.5 + ', ' + itemSize / 3 + ')').style('font-size', itemSize + 'px').call(textWrap, $$.label, maxTextLength);

	      // init transitions if context is a transition
	      if (context.selection) {
	        itemExit = itemExit.transition(context).style('opacity', 0);
	        item = item.transition(context);
	        wrap = wrap.transition(context);
	        text = text.transition(context);
	        g = g.transition(context);
	      }

	      // remove exiting items
	      itemExit.remove();

	      // wrap update
	      wrap.call(point$$);

	      // find max item width
	      var maxWidth = 0;
	      text.each(function () {
	        maxWidth = Math.max(maxWidth, this.getBBox().width);
	      });
	      maxWidth += itemSize;

	      // inital item padding
	      var pad = { x: itemSize, y: 5 };

	      // entering items will be positioned immediately
	      itemEnter.call(positionItems[orient1], {}, pad, itemSize, size, maxWidth);

	      // Initialize computed box dimensions of the legend to 0. These are
	      // attached as attributes to the legend selection node.
	      this.__box__ = {
	        width: 0,
	        height: 0,
	        top: 0,
	        left: 0,
	        right: 0,
	        bottom: 0
	      };

	      // update item position and opacity
	      item.style('opacity', 1).call(positionItems[orient1], this.__box__, pad, itemSize, size, maxWidth);

	      // postiion legend
	      gEnter.call(positionLegend, this.__box__, size, orient);
	      g.call(positionLegend, this.__box__, size, orient);
	    });

	    return legend;
	  };

	  // Bind events and dispatchers to all legend items within selection. Use the
	  // 'd2b-legend' namespace.
	  function bindEvents(selection, index) {
	    selection.selectAll('.d2b-legend-item').on('click', function (d, i) {
	      click.call(this, d, i, selection, index);
	    }).on('dblclick', function (d, i) {
	      dblclick.call(this, d, i, selection, index);
	    });
	  }

	  // On legend item click decide and perform any necessary actions.
	  function click(d, i, selection, index) {
	    var clickable = $$.clickable.call(this, d, i),
	        allowEmptied = $$.allowEmptied.call(selection.node(), selection.datum(), index),
	        data = selection.datum(),
	        node = selection.node();

	    if (!clickable) return;

	    d.__empty__ = !d.__empty__;

	    var el = d3.select(this),
	        items = selection.selectAll('.d2b-legend-item');

	    var allEmpty = true;
	    data.forEach(function (d) {
	      return allEmpty = d.__empty__ ? allEmpty : false;
	    });

	    if (allEmpty && !allowEmptied) {
	      items.each(function (d) {
	        return d.__empty__ = false;
	      }).transition().duration(100).call(point$$);
	      items.filter(function (dd) {
	        return dd != d;
	      }).dispatch('change');
	    } else {
	      el.transition().duration(100).call(point$$);
	    }

	    el.dispatch('change', { bubbles: true });
	  };

	  // On legend item dblclick decide and perform any necessary actions.
	  function dblclick(d, i, selection, index) {
	    var dblclickable = $$.dblclickable.call(this, d, i),
	        data = selection.datum();

	    if (!dblclickable) return;

	    data.forEach(function (d) {
	      return d.__empty__ = true;
	    });
	    d.__empty__ = false;

	    var items = selection.selectAll('.d2b-legend-item');
	    items.transition().duration(100).call(point$$);
	    items.filter(function (dd) {
	      return dd != d;
	    }).dispatch('change');
	    d3.select(this).dispatch('change', { bubbles: true });
	  };

	  // Initialize new d2b point.
	  var point$$ = point().empty(function (d) {
	    return d.__empty__;
	  });

	  // Position legend according the the box width/height
	  function positionLegend(ctx, box, size, orient) {
	    var x = 0,
	        y = 0;
	    switch (orient[1]) {
	      case 'center':
	      case 'middle':
	        y = size.height / 2 - box.height / 2;
	        break;
	      case 'bottom':
	        y = size.height - box.height;
	        break;
	      case 'top':
	      default:
	        y = 0;
	    }
	    switch (orient[2]) {
	      case 'center':
	      case 'middle':
	        x = size.width / 2 - box.width / 2;
	        break;
	      case 'right':
	        x = size.width - box.width;
	        break;
	      case 'left':
	      default:
	        x = 0;
	    }
	    box.left = x;
	    box.right = size.width - x + box.width;
	    box.top = y;
	    box.bottom = size.height - y + box.height;

	    ctx.attr('transform', 'translate(' + x + ', ' + y + ')');
	  }

	  // Position legend items either horizontally or vertically.
	  var positionItems = {
	    // ctx - d3 context for legend items that need to be positioned
	    // legendNode - svg node for the current legend (to set compute dimensions)
	    // pad - item padding
	    // itemSize - legend 'itemSize', usually the height of each legend item
	    // size - object with 'width' and 'height' attributes to bound either the vertical or horizontal legend
	    // maxWidth - maximum width of all legend items
	    horizontal: function horizontal(ctx, legendBox, pad, itemSize, size, maxWidth) {
	      var x = 0,
	          y = 0,
	          maxHeight = 0;

	      ctx.attr('transform', function () {
	        var el = d3.select(this),
	            boxHeight = itemSize * el.selectAll('tspan').size(),
	            boxWidth = el.select('text').node().getBBox().width;

	        if (x + maxWidth > size.width) {
	          x = 0;
	          y += maxHeight + pad.y;
	          maxHeight = 0;
	        }
	        var translate = 'translate(' + x + ', ' + y + ')';
	        maxHeight = Math.max(maxHeight, boxHeight);
	        legendBox.width = Math.max(legendBox.width, x + boxWidth + 1.5 * itemSize);
	        x += maxWidth + pad.x;
	        return translate;
	      });
	      legendBox.height = y + maxHeight;
	    },
	    vertical: function vertical(ctx, legendBox, pad, itemSize, size) {
	      var x = 0,
	          y = 0,
	          maxWidth = 0;
	      ctx.attr('transform', function () {
	        var el = d3.select(this),
	            boxHeight = itemSize * el.selectAll('tspan').size(),
	            boxWidth = el.select('text').node().getBBox().width;

	        if (y + boxHeight > size.height) {
	          x += maxWidth + pad.x + itemSize;
	          y = 0;
	          maxWidth = 0;
	        }
	        var translate = 'translate(' + x + ', ' + y + ')';
	        maxWidth = Math.max(maxWidth, boxWidth);
	        legendBox.height = Math.max(legendBox.height, y + boxHeight);
	        y += boxHeight + pad.y;
	        return translate;
	      });
	      legendBox.width = x + maxWidth + 1.5 * itemSize;
	    }
	  };

	  /* Inherit from base model */
	  var model = base(legend, $$)
	  // legend level functors
	  .addPropFunctor('items', function (d) {
	    return d;
	  }).addPropFunctor('itemSize', 12).addPropFunctor('size', { width: 960, height: 500 }).addPropFunctor('orient', 'vertical center right').addPropFunctor('maxTextLength', Infinity).addPropFunctor('allowEmptied', false)
	  // legend item level functors
	  .addPropFunctor('key', function (d, i) {
	    return i;
	  }).addPropFunctor('clickable', false).addPropFunctor('dblclickable', false).addPropFunctor('label', function (d) {
	    return d.label;
	  })
	  // legend item point functors
	  .addPropFunctor('active', false, null, function (_) {
	    return point$$.active(_);
	  }).addPropFunctor('symbol', d3.symbolCircle, null, function (_) {
	    return point$$.type(_);
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }, null, function (_) {
	    return point$$.fill(_);
	  })
	  // Method to get the computed box of a specific legend container. This
	  // method should be used after the legend has been rendered. Either the
	  // legend SVG node or a d3 selection of the node may be specified.
	  .addMethod('box', function (_) {
	    var node = _.node ? _.node() : _;
	    if (!node) return null;
	    return node.__box__;
	  });

	  return legend;
	};

	// Returns the specified object, omit the properties with keys matching
	// those in the specified keys array.

	function omit(obj, keys) {
	  var newObj = {};
	  for (var k in obj) {
	    if (typeof obj[k] !== 'function') {
	      if (keys.indexOf(k) < 0) newObj[k] = obj[k];
	    }
	  }
	  return newObj;
	}

	function tweenArc (context, arc) {
		// if context is not a transition just render the arc and update current
		if (!context.selection) {
			return context.attr('d', function (d) {
				this.current = omit(d, ['data']);
				return arc(d);
			});
		}

		// if context is a transition tween the 'd' attribute
		context.attrTween('d', function (d) {
			var _this = this;

			// omit data attribute incase of a pie chart with nested associations
			d = omit(d, ['data']);
			this.current = this.current || d;
			var i = d3.interpolate(this.current, d);
			return function (t) {
				_this.current = i(t);
				return arc(_this.current);
			};
		});
	};

	// pie svg generator
	function pie () {

	  var $$ = {};

	  /* Update Function */
	  var pie = function pie(context) {
	    var selection = context.selection ? context.selection() : context;

	    selection.each(function (d, i) {
	      var el = d3.select(this);

	      // select arc group and get their old data
	      var arc = el.selectAll('.d2b-pie-arc');
	      var oldData = arc.data();

	      arc = arc.data($$.values, function (d, i) {
	        return $$.key(d.data, i);
	      });

	      var arcEnter = arc.enter().append('g').attr('class', 'd2b-pie-arc'),
	          arcExit = arc.exit(),
	          arcUpdate = arc.merge(arcEnter).order();

	      arcEnter.append('path').attr('fill', function (d, i) {
	        return $$.color.call(this, d.data, i);
	      });

	      // retrieve new data
	      var newData = arcUpdate.data();

	      // for new arcs, find and set the neighboring insertion point
	      arcEnter.select('path').each(function (d, i) {
	        this.current = findNeighborArc(i, oldData, newData);
	      });

	      arcExit.datum(function (d, i) {
	        var data = findNeighborArc(i, newData, oldData);
	        data.data = d.data;
	        return data;
	      });

	      // start transition for exiting and updating arcs
	      if (context !== selection) {
	        arcExit = arcExit.transition(context);
	        arcUpdate = arcUpdate.transition(context);
	      }

	      // transition arc path
	      arcUpdate.select('path').call(tweenArc, $$.arc).attr('fill', function (d, i) {
	        return $$.color.call(this, d.data, i);
	      });

	      arcExit.remove().select('path').call(tweenArc, $$.arc);
	    });
	    return pie;
	  };

	  /* Inherit from base model */
	  var model = base(pie, $$).addProp('key', function (d) {
	    return d.label;
	  }).addProp('arc', d3.arc().innerRadius(100).outerRadius(200)).addPropFunctor('values', function (d) {
	    return d;
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  });

	  function findNeighborArc(i, data0, data1) {
	    var d = undefined;
	    if (d = findPreceding(i, data0, data1)) {
	      return { startAngle: d.endAngle, endAngle: d.endAngle };
	    } else if (d = findFollowing(i, data0, data1)) {
	      return { startAngle: d.startAngle, endAngle: d.startAngle };
	    }
	    return { startAngle: 0, endAngle: 0 };
	  }

	  // Find the element in data0 that joins the highest preceding element in data1.
	  function findPreceding(i, data0, data1) {
	    var m = data0.length;
	    while (--i >= 0) {
	      var k = $$.key(data1[i].data, i);
	      for (var j = 0; j < m; ++j) {
	        if ($$.key(data0[j].data, j) === k) return data0[j];
	      }
	    }
	  }

	  // Find the element in data0 that joins the lowest following element in data1.
	  function findFollowing(i, data0, data1) {
	    var n = data1.length,
	        m = data0.length;
	    while (++i < n) {
	      var k = $$.key(data1[i].data, i);
	      for (var j = 0; j < m; ++j) {
	        if ($$.key(data0[j].data, j) === k) return data0[j];
	      }
	    }
	  }

	  return pie;
	};

	// line svg generator
	function line () {
	  var $$ = {};

	  /* Update Function */
	  var line = function line(context) {
	    var selection = context.selection ? context.selection() : context;

	    var graph = selection.selectAll('.d2b-line-graph').data(function (d) {
	      return d;
	    }, $$.key);

	    var graphEnter = graph.enter().append('g').attr('class', 'd2b-line-graph').style('opacity', 0);

	    graphEnter.append('path').attr('class', 'd2b-line');

	    var graphUpdate = graph.merge(graphEnter).order(),
	        graphExit = graph.exit();

	    var lineUpdate = graphUpdate.select('.d2b-line');

	    if (context !== selection) {
	      graphUpdate = graphUpdate.transition(context);
	      graphExit = graphExit.transition(context);
	      lineUpdate = lineUpdate.transition(context);
	    }

	    graphUpdate.style('opacity', 1);
	    graphExit.style('opacity', 0).remove();
	    lineUpdate.style('stroke', $$.color).attr('d', function (d, i) {
	      var _this = this;

	      var x = $$.x.call(this, d, i),
	          y = $$.y.call(this, d, i),
	          color = $$.color.call(this, d, i),
	          values = $$.values.call(this, d, i),
	          tooltipGraph = $$.tooltipGraph.call(this, d, i);

	      var shift = $$.shift.call(this, d, i);
	      if (shift === null) shift = x.bandwidth ? x.bandwidth() / 2 : 0;

	      if (tooltipGraph) tooltipGraph.data(values).x(function (d, i) {
	        return x($$.px(d, i)) + shift;
	      }).y(function (d, i) {
	        return y($$.py(d, i));
	      }).color(color);

	      return $$.line.x(function (d, i) {
	        return x($$.px.call(_this, d, i)) + shift;
	      }).y(function (d, i) {
	        return y($$.py.call(_this, d, i));
	      })(values);
	    });

	    return line;
	  };

	  /* Inherit from base model */
	  var model = base(line, $$).addProp('line', d3.line()).addProp('x', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.x;
	    if (d.domain) $$.x = function () {
	      return d;
	    };else $$.x = d;
	    return line;
	  }).addProp('y', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.y;
	    if (d.domain) $$.y = function () {
	      return d;
	    };else $$.y = d;
	    return line;
	  }).addPropFunctor('tooltipGraph', function (d) {
	    return d.tooltipGraph;
	  }).addPropFunctor('shift', null).addPropFunctor('key', function (d) {
	    return d.label;
	  }).addPropFunctor('values', function (d) {
	    return d.values;
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }).addPropFunctor('px', function (d) {
	    return d.x;
	  }).addPropFunctor('py', function (d) {
	    return d.y;
	  });

	  return line;
	};

	// d2b.stack will stack the x and y values in place for
	// some datum and d3.stack configuration.
	function stack () {
	  var $$ = {};

	  var stack = function stack(datum) {
	    var _this = this;

	    var original = datum;

	    // for simplicity map datum to just array of values arrays
	    datum = datum.map($$.values);

	    // format values to be in the form
	    // [
	    //   {x_1: y_1, x_2: y_2, .. },
	    //   {x_1: y_1, x_2: y_2, .. },
	    //   ..
	    // ]
	    var xset = [];

	    var vals = datum.map(function (d, i) {
	      var nodes = {};
	      d.forEach(function (d, i) {
	        var x = $$.x.call(_this, d, i);
	        xset.push(x);
	        nodes[x] = $$.y.call(_this, d, i);
	      });
	      return nodes;
	    });

	    // find unique set of x values
	    xset = d3.set(xset).values();

	    // value => index mapping of x values
	    var xmap = xset.reduce(function (o, v, i) {
	      o[v] = i;
	      return o;
	    }, {});

	    // graph keys (just use index)
	    var keys = d3.range(0, datum.length);

	    // transpose values for d3.stack
	    var tvals = xset.map(function (col, i) {
	      return vals.map(function (row, i) {
	        return row[col] || 0;
	      });
	    });

	    // stack transposed values
	    var stacking = $$.stack.keys(keys).value(function (d, k) {
	      return d[k] || 0;
	    })(tvals);

	    // reassociate the stacked values with the original datum
	    datum.forEach(function (d, i) {
	      d.forEach(function (val, ind) {
	        var x = $$.x.call(_this, val, ind);
	        var ys = stacking[i][xmap[x]];
	        $$.out.call(_this, val, ys[0], ys[1], x);
	      });
	    });

	    return original;
	  };

	  /* Inherit from base model */
	  var model = base(stack, $$).addProp('stack', d3.stack()).addPropFunctor('values', function (d) {
	    return d;
	  }).addPropFunctor('x', function (d) {
	    return d.x;
	  }).addPropFunctor('y', function (d) {
	    return d.y;
	  }).addPropFunctor('out', function (d, y0, y1) {
	    d.y0 = y0;
	    d.y1 = y1;
	  });

	  return stack;
	};

	function d2bid () {
	  return Math.random().toString(36).substr(2, 9);
	};

	// line svg generator
	function area () {
	  var $$ = {};

	  /* Update Function */
	  var area = function area(context) {
	    var selection = context.selection ? context.selection() : context;

	    var graph = selection.selectAll('.d2b-area-graph').data(function (d) {
	      return d;
	    }, $$.key);

	    var graphEnter = graph.enter().append('g').attr('class', 'd2b-area-graph').style('opacity', 0);

	    graphEnter.append('path').attr('class', 'd2b-area');

	    var graphUpdate = graph.merge(graphEnter).order(),
	        graphExit = graph.exit();

	    var areaUpdate = graphUpdate.select('.d2b-area');

	    if (context !== selection) {
	      graphUpdate = graphUpdate.transition(context);
	      graphExit = graphExit.transition(context);
	      areaUpdate = areaUpdate.transition(context);
	    }

	    selection.each(function (d, i) {
	      stackNest.entries(d).forEach(function (sg) {
	        return stacker(sg.values);
	      });
	    });

	    graphUpdate.style('opacity', 1);
	    graphExit.style('opacity', 0).remove();
	    areaUpdate.style('fill', $$.color).attr('d', function (d, i) {
	      var x = $$.x.call(this, d, i),
	          y = $$.y.call(this, d, i),
	          values = $$.values.call(this, d, i),
	          color = $$.color.call(this, d, i),
	          tooltipGraph = $$.tooltipGraph.call(this, d, i);

	      var shift = $$.shift.call(this, d, i);
	      if (shift === null) shift = x.bandwidth ? x.bandwidth() / 2 : 0;

	      if (tooltipGraph) tooltipGraph.data(values).x(function (d, i) {
	        return x(d.__x__) + shift;
	      }).y(function (d, i) {
	        return y(d.__y1__);
	      }).color(color);

	      return $$.area.x(function (d, i) {
	        return x(d.__x__) + shift;
	      }).y0(function (d, i) {
	        return y(d.__y0__);
	      }).y1(function (d, i) {
	        return y(d.__y1__);
	      })(values);
	    });

	    return area;
	  };

	  var stacker = stack().out(function (d, y0, y1, x) {
	    d.__x__ = x;
	    d.__y0__ = y0;
	    d.__y1__ = y1;
	  });

	  var stackNest = d3.nest().key(function (d) {
	    var key = $$.stackBy(d);
	    return key !== false && key !== null ? key : d2bid();
	  });

	  /* Inherit from base model */
	  var model = base(area, $$).addProp('area', d3.area()).addProp('stack', d3.stack(), null, function (d) {
	    return stacker.stack(d);
	  }).addProp('x', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.x;
	    if (d.domain) $$.x = function () {
	      return d;
	    };else $$.x = d;
	    return area;
	  }).addProp('y', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.y;
	    if (d.domain) $$.y = function () {
	      return d;
	    };else $$.y = d;
	    return area;
	  }).addPropFunctor('tooltipGraph', function (d) {
	    return d.tooltipGraph;
	  }).addPropFunctor('shift', null).addPropFunctor('stackBy', null).addPropFunctor('key', function (d) {
	    return d.label;
	  }).addPropFunctor('values', function (d) {
	    return d.values;
	  }, null, function (d) {
	    return stacker.values(d);
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }).addPropFunctor('px', function (d) {
	    return d.x;
	  }, null, function (d) {
	    return stacker.x(d);
	  }).addPropFunctor('py', function (d) {
	    return d.y;
	  }, null, function (d) {
	    return stacker.y(d);
	  });

	  return area;
	};

	// scatter svg generator
	function scatter () {
	  var $$ = {};

	  /* Update Function */
	  var scatter = function scatter(context) {
	    var selection = context.selection ? context.selection() : context;

	    var graph = selection.selectAll('.d2b-scatter-graph').data(function (d) {
	      return d;
	    }, $$.key);

	    var graphEnter = graph.enter().append('g').attr('class', 'd2b-scatter-graph').style('opacity', 0);

	    var graphUpdate = graph.merge(graphEnter).order(),
	        graphExit = graph.exit();

	    if (context !== selection) {
	      graphUpdate = graphUpdate.transition(context);
	      graphExit = graphExit.transition(context);
	    }

	    graphUpdate.style('opacity', 1);
	    graphExit.style('opacity', 0).remove();

	    graphUpdate.each(function (d, i) {
	      var el = d3.select(this),
	          x = $$.x.call(this, d, i),
	          y = $$.y.call(this, d, i),
	          color = $$.color.call(this, d, i),
	          symbol = $$.symbol.call(this, d, i),
	          values = $$.values.call(this, d, i),
	          tooltipGraph = $$.tooltipGraph.call(this, d, i);

	      var shift = $$.shift.call(this, d, i);
	      if (shift === null) shift = x.bandwidth ? x.bandwidth() / 2 : 0;

	      if (tooltipGraph) tooltipGraph.data(values).x(function (d, i) {
	        return x($$.px(d, i)) + shift;
	      }).y(function (d, i) {
	        return y($$.py(d, i));
	      }).color(function (d, i) {
	        return $$.pcolor(d, i) || color;
	      });

	      $$.point.fill(function (dd, ii) {
	        return $$.pcolor.call(this, dd, ii) || color;
	      }).type(function (dd, ii) {
	        return $$.psymbol.call(this, dd, ii) || symbol;
	      }).size($$.psize);

	      var point = el.selectAll('.d2b-scatter-point').data(values, $$.pkey);
	      var pointEnter = point.enter().append('g').attr('class', 'd2b-scatter-point');

	      var pointUpdate = point.merge(pointEnter).order(),
	          pointExit = point.exit();

	      if (context !== selection) {
	        pointUpdate = pointUpdate.transition(context);
	        pointExit = pointExit.transition(context);
	      }

	      pointEnter.style('opacity', 0).call(pointTransform, x, y, shift);

	      pointUpdate.style('opacity', 1).call($$.point).call(pointTransform, x, y, shift);

	      pointExit.style('opacity', 0).remove();
	    });

	    return scatter;
	  };

	  function pointTransform(transition, x, y, shift) {
	    transition.attr('transform', function (d, i) {
	      var px = x($$.px.call(this, d, i)) + shift;
	      var py = y($$.py.call(this, d, i));
	      return 'translate(' + px + ', ' + py + ')';
	    });
	  }

	  /* Inherit from base model */
	  var model = base(scatter, $$).addProp('point', point().active(true)).addProp('x', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.x;
	    if (d.domain) $$.x = function () {
	      return d;
	    };else $$.x = d;
	    return scatter;
	  }).addProp('y', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.y;
	    if (d.domain) $$.y = function () {
	      return d;
	    };else $$.y = d;
	    return scatter;
	  }).addPropFunctor('tooltipGraph', function (d) {
	    return d.tooltipGraph;
	  }).addPropFunctor('shift', null).addPropFunctor('key', function (d) {
	    return d.label;
	  }).addPropFunctor('values', function (d) {
	    return d.values;
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }).addPropFunctor('symbol', function (d) {
	    return d3.symbolCircle;
	  }).addPropFunctor('px', function (d) {
	    return d.x;
	  }).addPropFunctor('py', function (d) {
	    return d.y;
	  }).addPropFunctor('pcolor', function (d) {
	    return null;
	  }).addPropFunctor('psymbol', null).addPropFunctor('pkey', function (d, i) {
	    return i;
	  }).addPropFunctor('psize', function (d) {
	    return 25;
	  });

	  return scatter;
	};

	// bar svg generator
	function bar () {
	  var $$ = {};

	  /* Update Function */
	  var bar = function bar(context) {
	    var selection = context.selection ? context.selection() : context;
	    // iterate through each selection element
	    selection.each(function (d, i) {

	      // set orientation mappings
	      var orient = {};
	      if ($$.orient.call(this, d, i) === 'horizontal') {
	        orient = { rotate: true, px: 'py', py: 'px', x: 'y', y: 'x', w: 'height', h: 'width' };
	      } else {
	        orient = { rotate: false, px: 'px', py: 'py', x: 'x', y: 'y', w: 'width', h: 'height' };
	      }

	      stacker.x($$[orient.px]).y($$[orient.py]);

	      // run each selection datum through the stacker
	      var stacking = stackNest.entries(d);
	      stacking.forEach(function (sg, si) {
	        return stacker.out(buildOut(si))(sg.values);
	      });

	      // compute bar sizing properties
	      var bandwidth = (1 - $$.padding.call(this, d, i)) * ($$.bandwidth.call(this, d, i) || getBandwidth(d, orient)),
	          barWidth = bandwidth / stacking.length,
	          groupPadding = barWidth * $$.groupPadding.call(this, d, i);

	      // enter update exit bar graph container
	      var graph = d3.select(this).selectAll('.d2b-bar-graph').data(d, $$.key);

	      var graphEnter = graph.enter().append('g').attr('class', 'd2b-bar-graph').style('opacity', 0);

	      var graphUpdate = graph.merge(graphEnter).order(),
	          graphExit = graph.exit();

	      if (context !== selection) {
	        graphUpdate = graphUpdate.transition(context);
	        graphExit = graphExit.transition(context);
	      }

	      graphUpdate.style('opacity', 1);
	      graphExit.style('opacity', 0).remove();

	      // iterate through graph containers
	      graphUpdate.each(function (d, i) {
	        var graph = d3.select(this),
	            color = $$.color.call(this, d, i),
	            x = $$[orient.x].call(this, d, i),
	            _y = $$[orient.y].call(this, d, i),
	            values = $$.values.call(this, d, i),
	            tooltipGraph = $$.tooltipGraph.call(this, d, i);

	        var shift = $$.shift.call(this, d, i);
	        if (shift === null) shift = x.bandwidth ? x.bandwidth() / 2 : 0;

	        // enter update exit bars
	        var bar = graph.selectAll('.d2b-bar-group').data(values, $$.pkey);
	        var barEnter = bar.enter().append('g').attr('class', 'd2b-bar-group');
	        barEnter.append('rect');
	        var barUpdate = bar.merge(barEnter).order(),
	            barExit = bar.exit();

	        barUpdate.each(function (d, i) {
	          var centered = $$.pcentered.call(this, d, i),
	              barShift = centered ? shift - bandwidth / 4 : shift - bandwidth / 2 + d.__stackIndex__ * barWidth + groupPadding;
	          d.__basepx__ = x(d.__base__) + barShift;
	          d.__extentpx__ = [_y(d.__extent__[0]), _y(d.__extent__[1])];
	          d.__extentpx__.sort(d3.ascending);
	        });

	        if (tooltipGraph) tooltipGraph.data(values)[orient.x](function (d, i) {
	          return x($$[orient.px](d, i)) + shift;
	        })[orient.y](function (d, i) {
	          return _y(d.__extent__[1]);
	        }).color(function (d, i) {
	          return $$.pcolor(d, i) || color;
	        });

	        if (context !== selection) {
	          barUpdate = barUpdate.transition(context);
	          barExit = barExit.transition(context);
	        }

	        barEnter.attr('class', 'd2b-bar-group').style('opacity', 0).call(transformBar, { x: function x(d) {
	            return d.__basepx__;
	          }, y: function y(d) {
	            return _y(0);
	          } }, orient).select('rect').attr('fill', function (d, i) {
	          return $$.pcolor.call(this, d, i) || color;
	        }).attr(orient.w, barWidth - groupPadding * 2).attr(orient.h, 0);

	        barUpdate.style('opacity', 1).call(transformBar, { x: function x(d) {
	            return d.__basepx__;
	          }, y: function y(d) {
	            return d.__extentpx__[0];
	          } }, orient).select('rect').attr('fill', function (d, i) {
	          return $$.pcolor.call(this, d, i) || color;
	        }).attr(orient.w, barWidth - groupPadding * 2).attr(orient.h, function (d) {
	          return d.__extentpx__[1] - d.__extentpx__[0];
	        });

	        barExit.style('opacity', 0).remove();
	      });
	    });

	    return bar;
	  };

	  var stacker = stack();

	  var stackNest = d3.nest().key(function (d) {
	    var key = $$.stackBy(d);
	    return key !== false && key !== null ? key : d2bid();
	  });

	  // custom stacker build out that separates the negative and possitive bars
	  function buildOut(stackIndex) {
	    var offsets = {};
	    return function (d, y0, y1, x) {
	      var dy = y1 - y0,
	          offset = offsets[x] = offsets[x] || [0, 0];
	      d.__stackIndex__ = stackIndex;
	      d.__base__ = x;
	      if (dy > 0) d.__extent__ = [offset[0], offset[0] += dy];else d.__extent__ = [offset[1], offset[1] += dy];
	    };
	  }

	  // transform bar position
	  function transformBar(transition, pos, orient) {
	    transition.attr('transform', function (d) {
	      return 'translate(' + [pos[orient.x](d), pos[orient.y](d)] + ')';
	    });
	  }

	  // find closes non equal point pixel distance on the base axis
	  function getBandwidth(data, orient) {
	    var xVals = [];
	    data.forEach(function (graph, graphIndex) {
	      var x = $$[orient.x].call(data, graph, graphIndex),
	          values = $$.values.call(data, graph, graphIndex);

	      values.forEach(function (d, i) {
	        var px = $$[orient.px].call(graph, d, i);
	        xVals.push(x(px));
	      });
	    });

	    xVals.sort(d3.ascending);

	    var bandwidth = Infinity;
	    for (var i = 0; i < xVals.length - 1; i++) {
	      if (xVals[i + 1] === xVals[i]) continue;
	      bandwidth = Math.min(xVals[i + 1] - xVals[i], bandwidth);
	    }
	    return bandwidth;
	  }

	  /* Inherit from base model */
	  var model = base(bar, $$).addProp('stack', d3.stack(), null, function (d) {
	    return stacker.stack(d);
	  }).addProp('x', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.x;
	    if (d.domain) $$.x = function () {
	      return d;
	    };else $$.x = d;
	    return bar;
	  }).addProp('y', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.y;
	    if (d.domain) $$.y = function () {
	      return d;
	    };else $$.y = d;
	    return bar;
	  }).addPropFunctor('tooltipGraph', function (d) {
	    return d.tooltipGraph;
	  }).addPropFunctor('orient', 'vertical').addPropFunctor('padding', 0.5).addPropFunctor('groupPadding', 0).addPropFunctor('bandwidth', null).addPropFunctor('shift', null).addPropFunctor('stackBy', null).addPropFunctor('key', function (d) {
	    return d.label;
	  }).addPropFunctor('values', function (d) {
	    return d.values;
	  }, null, function (d) {
	    return stacker.values(d);
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }).addPropFunctor('px', function (d) {
	    return d.x;
	  }).addPropFunctor('py', function (d) {
	    return d.y;
	  }).addPropFunctor('pcentered', false).addPropFunctor('pcolor', null).addPropFunctor('pkey', function (d, i) {
	    return i;
	  });

	  return bar;
	};

	//original stacking function, might revert to this one instead of d3 stack layout in the future
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

	// bubble pack svg generator
	function bubblePack () {
	  var $$ = {};

	  // bubble pack updater
	  var bubblePack = function bubblePack(context) {
	    var transition = context.selection ? context : null,
	        selection = context.selection ? context.selection() : context,
	        graph = selection.selectAll('.d2b-bubble-pack-graph').data(function (d) {
	      return d;
	    }, $$.key);

	    // enter graph
	    var graphEnter = graph.enter().append('g').attr('class', 'd2b-bubble-pack-graph');

	    var graphUpdate = graph.merge(graphEnter).order(),
	        graphExit = graph.exit();

	    if (transition) {
	      graphUpdate = graphUpdate.transition(transition);
	      graphExit = graphExit.transition(transition);
	    }

	    // update graph
	    graphUpdate.style('opacity', 1);

	    // exit graph
	    graphExit.style('opacity', 0).remove();

	    // iterate through each context element
	    context.each(function (d, i) {
	      var selection = d3.select(this),
	          graph = selection.selectAll('.d2b-bubble-pack-graph');

	      selection.on('change', function () {
	        selection.transition().duration($$.duration).call(bubblePack);
	      });

	      // render the bubble packs for each graph
	      graph.each(function (d, i) {
	        var el = d3.select(this),
	            x = $$.x.call(this, d, i),
	            y = $$.y.call(this, d, i),
	            color = $$.color.call(this, d, i),
	            symbol = $$.symbol.call(this, d, i),
	            tooltipGraph = $$.tooltipGraph.call(this, d, i);

	        d.values.forEach(compute);

	        var shift = $$.shift.call(this, d, i);
	        if (shift === null) shift = x.bandwidth ? x.bandwidth() / 2 : 0;

	        $$.point.fill(function (dd, ii) {
	          return $$.pcolor.call(this, dd, ii) || color;
	        }).type(function (dd, ii) {
	          return $$.psymbol.call(this, dd, ii) || symbol;
	        });

	        var addTooltipPoint = tooltipGraph ? tooltipGraph.clear().x(function (d, i) {
	          return x(d.__x__) + shift;
	        }).y(function (d, i) {
	          return y(d.__y__);
	        }).color(function (d, i) {
	          return $$.pcolor(d, i) || color;
	        }).addPoint : null;

	        renderPacks(el, d.values, transition, x, y, shift, selection, addTooltipPoint);
	      });

	      positionIndicators(selection);
	    });

	    return bubblePack;
	  };

	  // Position all bubble indicators to be next to each other.
	  function positionIndicators(selection) {
	    var positionx = 0,
	        positiony = 0,
	        maxWidth = 300;
	    selection.selectAll('.d2b-bubble-indicator.d2b-active').attr('transform', function () {
	      var box = this.getBBox();

	      if (box.width + positionx > maxWidth && positionx > 0) {
	        positionx = 0;
	        positiony += box.height + 5;
	      }

	      var translate = 'translate(' + positionx + ', ' + positiony + ')';
	      positionx += box.width + 5;
	      return translate;
	    });
	  }

	  // On chart change (usually a bubble/indicator click) update and dispatch events.
	  function change(node, d, i, chart) {
	    if (!d.__children__) return;
	    d3.select(node).dispatch('change', { bubbles: true, cancelable: true });
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
	      var el = d3.select(this);

	      var transform = el.attr('transform');

	      if (!transform) {
	        el.attr('transform', 'translate(' + (x(d.__parent__ ? d.__parent__.__x__ : d.__x__) + shift + ',') + (y(d.__parent__ ? d.__parent__.__y__ : d.__y__) + ')'));
	      }

	      if (d.__children__) {
	        el.attr('cursor', 'pointer').on('click', function () {
	          d3.select(this).dispatch('change', { bubbles: true, cancelable: true });
	        }).on('change', function (d) {
	          return d.__expanded__ = !d.__expanded__;
	        });
	      } else el.attr('cursor', '').on('click', null);

	      if (trans) el = el.transition(trans);

	      if (d.__expanded__) el.style('opacity', 0).selectAll('*').remove();else el.style('opacity', 1).call($$.point);

	      el.attr('transform', 'translate(' + (x(d.__x__) + shift) + ', ' + y(d.__y__) + ')');
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
	      var el = d3.select(this).classed('d2b-active', d.__expanded__);

	      if (!d.__expanded__) return el.selectAll('rect, text').remove();

	      var rect = el.select('rect'),
	          text = el.select('text');
	      if (!rect.size()) rect = el.append('rect');
	      if (!text.size()) text = el.append('text');

	      text.text($$.pindicator.call(this, d, i).substring(0, 5)).attr('x', 5);
	      var textBox = text.node().getBBox();
	      text.attr('y', textBox.height / 1.35);
	      rect.on('click', function () {
	        d3.select(this).dispatch('change', { bubbles: true, cancelable: true });
	      }).on('change', function (d) {
	        return d.__expanded__ = !d.__expanded__;
	      }).attr('width', textBox.width + 10).attr('height', textBox.height).style('fill', $$.point.fill()).style('stroke', $$.point.stroke());
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
	  function renderPacks(el, data, trans, x, y, shift, chart, addTooltipPoint) {
	    var depth = arguments.length <= 8 || arguments[8] === undefined ? 0 : arguments[8];

	    // set pack data
	    var pack = el.selectAll('.d2b-bubble-pack.d2b-depth-' + depth).data(data, $$.pkey),
	        packEnter = pack.enter().append('g').attr('class', 'd2b-bubble-pack d2b-depth-' + depth),
	        packUpdate = pack.merge(packEnter);

	    packEnter.append('g').attr('class', 'd2b-bubble-point').style('opacity', 0);
	    renderPoint(packUpdate.select('.d2b-bubble-point'), trans, x, y, shift, chart);
	    packEnter.append('g').attr('class', 'd2b-bubble-indicator');
	    renderIndicator(packUpdate.select('.d2b-bubble-indicator'), trans, x, y, shift, chart);

	    // update children bubbles if expanded
	    packUpdate.each(function (d, i) {
	      var el = d3.select(this);
	      if (d.__children__ && d.__expanded__) {
	        renderPacks(el, d.__children__, trans, x, y, shift, chart, addTooltipPoint, depth + 1);
	      } else {
	        if (addTooltipPoint) addTooltipPoint(d);
	        el.selectAll('.d2b-bubble-pack').transition(trans).remove().select('.d2b-bubble-point').style('opacity', 0).attr('transform', 'translate(' + (x(d.__x__) + shift) + ', ' + y(d.__y__) + ')');
	      }
	    });

	    var packExit = pack.exit();
	    if (trans) packExit = packExit.transition(trans);
	    packExit.remove();
	  }

	  // Recursively set the data structure starting at root node `d`
	  function setStructure(d) {
	    var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	    var children = $$.pchildren(d);
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
	  function setAttributes(d) {
	    d.__x__ = ($$.tendancy.x || $$.tendancy)(d.__leaves__, function (d) {
	      return d.__x__;
	    }, function (d) {
	      return d.__size__;
	    });
	    d.__y__ = ($$.tendancy.y || $$.tendancy)(d.__leaves__, function (d) {
	      return d.__y__;
	    }, function (d) {
	      return d.__size__;
	    });
	    d.__size__ = d3.sum(d.__leaves__, function (d) {
	      return d.__size__;
	    });

	    if (d.__children__ && d.__children__.length) {
	      d.__children__.forEach(function (child) {
	        return setAttributes(child);
	      });
	    }
	  }

	  // Compute hierarchical structure and render attributes
	  function compute(d) {
	    setStructure(d);
	    setAttributes(d);
	  }

	  /* Inherit from base model */
	  var model = base(bubblePack, $$).addProp('point', point().active(true), null, function (d) {
	    $$.point.size(function (d) {
	      return d.__size__ * 100;
	    }).active(function (d) {
	      return !!d.__children__;
	    });
	  }).addProp('x', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.x;
	    if (d.domain) $$.x = function () {
	      return d;
	    };else $$.x = d;
	    return bubblePack;
	  }).addProp('y', d3.scaleLinear(), function (d) {
	    if (!arguments.length) return $$.y;
	    if (d.domain) $$.y = function () {
	      return d;
	    };else $$.y = d;
	    return bubblePack;
	  }).addProp('tendancy', mean).addProp('duration', 250).addPropFunctor('tooltipGraph', function (d) {
	    return d.tooltipGraph;
	  }).addPropFunctor('shift', null).addPropFunctor('key', function (d) {
	    return d.label;
	  }).addPropFunctor('values', function (d) {
	    return d.values;
	  }).addPropFunctor('color', function (d) {
	    return color(d.label);
	  }).addPropFunctor('symbol', function (d) {
	    return d3.symbolCircle;
	  }).addPropFunctor('px', function (d) {
	    return d.x;
	  }).addPropFunctor('py', function (d) {
	    return d.y;
	  }).addPropFunctor('psize', function (d) {
	    return d.size;
	  }).addPropFunctor('pchildren', function (d) {
	    return d.children;
	  }).addPropFunctor('pcolor', function (d) {
	    return null;
	  }).addPropFunctor('psymbol', null).addPropFunctor('pindicator', function (d) {
	    return d.label;
	  }).addPropFunctor('pkey', function (d, i) {
	    return i;
	  });

	  return bubblePack;
	};

	// TODO: Clean up text wrapping with transition udpates
	// TODO: Clean up plane build workflow

	// plane svg generator
	function plane () {

	  var $$ = {},
	      labelPad = 5;

	  /* Update Function */
	  var plane = function plane(context) {
	    var selection = context.selection ? context.selection() : context;

	    selection.each(function (d, i) {
	      // get plane props
	      var size = $$.size.call(this, d, i) || { width: 960, height: 500 },
	          margin = makeMargin($$.margin.call(this, d, i)),
	          x = $$.x.call(this, d, i),
	          x2 = $$.x2.call(this, d, i),
	          y = $$.y.call(this, d, i),
	          y2 = $$.y2.call(this, d, i),
	          el = d3.select(this),
	          axes = {
	        x: { type: 'x', data: x },
	        x2: { type: 'x2', data: x2 },
	        y: { type: 'y', data: y },
	        y2: { type: 'y2', data: y2 }
	      };

	      // check if user defined padding
	      var padding = makePadding($$.padding.call(this, d, i));

	      // enter plane svg group
	      var planeUpdate = el.selectAll('.d2b-plane').data([d]),
	          planeEnter = planeUpdate.enter().append('g').attr('class', 'd2b-plane'),
	          plane = planeUpdate.merge(planeEnter);

	      var transCtx = context !== selection ? context : null;

	      setupAxis(axes.x, i, plane, size.width, transCtx);
	      setupAxis(axes.x2, i, plane, size.width, transCtx);
	      setupAxis(axes.y, i, plane, size.height, transCtx);
	      setupAxis(axes.y2, i, plane, size.height, transCtx);

	      // if padding is not set, find it dynamically
	      if (!padding) padding = dynamicPadding(axes);

	      // define plane box properties
	      var planeBox = {
	        top: padding.top + margin.top,
	        bottom: padding.bottom + margin.bottom,
	        left: padding.left + margin.left,
	        right: padding.right + margin.right
	      };
	      planeBox.width = size.width - planeBox.left - planeBox.right;
	      planeBox.height = size.height - planeBox.top - planeBox.bottom;

	      // store plane box on the node
	      this.planeBox = planeBox;

	      // position plane
	      plane.attr('transform', 'translate(' + planeBox.left + ', ' + planeBox.top + ')');

	      updateAxis(axes.x, planeBox.width, 0, planeBox.height);
	      updateAxis(axes.x2, planeBox.width, 0, 0);
	      updateAxis(axes.y, planeBox.height, 0, 0);
	      updateAxis(axes.y2, planeBox.height, planeBox.width, 0);

	      updateGrid(axes.x, planeBox.width, planeBox.height);
	      updateGrid(axes.x2, planeBox.width, planeBox.height);
	      updateGrid(axes.y, planeBox.height, planeBox.width);
	      updateGrid(axes.y2, planeBox.height, planeBox.width);

	      updateLabel(axes.x, planeBox.width);
	      updateLabel(axes.x2, planeBox.width);
	      updateLabel(axes.y, -planeBox.height);
	      updateLabel(axes.y2, -planeBox.height);
	    });

	    return plane;
	  };

	  /* Inherit from base model */
	  var model = base(plane, $$)
	  // plane level functors
	  .addPropFunctor('size', function (d) {
	    return d.size;
	  }).addPropFunctor('padding', null).addPropFunctor('margin', 0).addPropFunctor('x', function (d) {
	    return d.x;
	  }).addPropFunctor('x2', function (d) {
	    return d.x2;
	  }).addPropFunctor('y', function (d) {
	    return d.y;
	  }).addPropFunctor('y2', function (d) {
	    return d.y2;
	  })
	  // axis level functors
	  .addPropFunctor('axis', function (d) {
	    return d.axis;
	  }).addPropFunctor('orient', function (d) {
	    return d.orient;
	  }).addPropFunctor('wrapLength', Infinity).addPropFunctor('tickSize', 6).addPropFunctor('showGrid', true).addPropFunctor('label', function (d) {
	    return d.label;
	  }).addPropFunctor('labelOrient', function (d) {
	    return d.labelOrient;
	  })
	  // other methods
	  .addMethod('computedSize', function (_) {
	    var node = _.node ? _.node() : _;
	    if (!node) return { width: 0, height: 0 };
	    return node.planeBox;
	  });

	  return plane;

	  function setupAxis(axis, index, plane, extent, transCtx) {
	    var axisData = [],
	        gridData = [],
	        data = axis.data;

	    if (data) {
	      setAxisInfo(axis, data, index, plane, extent);
	      axisData = [data];
	      if (axis.info.showGrid) gridData = [data];
	    }

	    // enter new axis container
	    axis.update = plane.selectAll('.d2b-' + axis.type + '-axis').data(axisData);
	    axis.enter = axis.update.enter().append('g').attr('class', 'd2b-axis d2b-' + axis.type + '-axis');

	    // enter label container
	    axis.labelEnter = axis.enter.append('text').attr('class', 'd2b-axis-label');

	    // merge axis svg container
	    axis.svg = axis.enter.merge(axis.update);

	    // fetch axis label
	    axis.label = axis.svg.select('.d2b-axis-label');

	    // exit axis
	    axis.update.exit().remove();

	    // set axis grid data
	    axis.gridUpdate = plane.selectAll('.d2b-' + axis.type + '-grid').data(gridData);

	    // enter axis grid
	    axis.gridEnter = axis.gridUpdate.enter().append('g').attr('class', 'd2b-grid d2b-' + axis.type + '-grid');

	    // exit axis grid
	    axis.gridUpdate.exit().remove();

	    // merge axis grid
	    axis.grid = axis.gridEnter.merge(axis.gridUpdate);

	    if (transCtx) {
	      axis.svg = axis.svg.transition(transCtx);
	      axis.update = axis.update.transition(transCtx);
	      axis.grid = axis.grid.transition(transCtx);
	      axis.gridUpdate = axis.gridUpdate.transition(transCtx);
	      axis.label = axis.label.transition(transCtx);
	    }
	  }

	  function updateAxis(axis, extent, x, y) {
	    if (!axis.data) return;
	    setAxisTickSize(axis);
	    setAxisRange(axis, extent);

	    axis.enter.call(axis.info.axis).attr('transform', 'translate(' + x + ', ' + y + ')');
	    axis.update.call(axis.info.axis).attr('transform', 'translate(' + x + ', ' + y + ')');

	    axis.svg.call(wrapTicks, axis).on('end', function () {
	      axis.svg.call(wrapTicks, axis);
	    });
	  }

	  function updateGrid(axis, extentRange, extentGrid) {
	    if (!axis.data) return;
	    setGridTickSize(axis, extentGrid);
	    setAxisRange(axis, extentRange);

	    axis.gridUpdate.call(axis.info.axis).selectAll('.tick text').remove();

	    axis.gridEnter.call(axis.info.axis).selectAll('.tick text').remove();
	  }

	  function updateLabel(axis, extent) {
	    if (!axis.data) return;
	    axis.labelEnter.text(axis.info.label).attr('x', labelX(axis, extent)).attr('y', labelY(axis)).attr('text-anchor', labelAnchor(axis));
	    axis.label.text(axis.info.label).attr('x', labelX(axis, extent)).attr('y', labelY(axis)).attr('text-anchor', labelAnchor(axis));
	  }

	  function setGridTickSize(axis, extent) {
	    if (!axis.data) return;
	    switch (axis.type) {
	      case 'x':
	        return axis.info.axis.tickSize(axis.info.orient === 'inner' ? -extent : extent);
	      case 'x2':
	        return axis.info.axis.tickSize(axis.info.orient === 'inner' ? extent : -extent);
	      case 'y':
	        return axis.info.axis.tickSize(axis.info.orient === 'inner' ? extent : -extent);
	      case 'y2':
	        return axis.info.axis.tickSize(axis.info.orient === 'inner' ? -extent : extent);
	    }
	  }

	  function setAxisTickSize(axis) {
	    if (!axis.data) return;
	    axis.info.axis.tickSizeOuter(0).tickSizeInner(axis.info.tickSize);
	  }

	  function setAxisRange(axis, extent) {
	    if (!axis.data) return;
	    axis.info.axis.scale().range([0, extent]);
	  }

	  // insert and remove dummy ticks and labels to pad axes accordingly
	  function setAxisInfo(axis, d, i, cont, extent) {
	    if (!axis.data) return;
	    var info = axis.info = {};

	    info.axis = $$.axis(d, i);
	    info.orient = $$.orient(d, i) || 'outer';
	    info.wrapLength = $$.wrapLength(d, i) || Infinity;
	    info.label = $$.label(d, i) || '';
	    info.labelOrient = $$.labelOrient(d, i) || 'outer center';
	    info.tickSize = $$.tickSize(d, i);
	    info.showGrid = $$.showGrid(d, i);
	    info.labelOrient1 = info.labelOrient.split(' ')[0];
	    info.labelOrient2 = info.labelOrient.split(' ')[1];

	    info.wrapAnchor = wrapAnchor(axis);

	    setAxisTickSize(axis);
	    setAxisRange(axis, extent);

	    var dummyAxis = cont.append('g').attr('class', 'd2b-axis d2b-' + axis.type + '-axis').call(info.axis).call(wrapTicks, axis);
	    info.axisBox = dummyAxis.node().getBBox();

	    var dummyLabel = dummyAxis.append('text').attr('class', 'd2b-axis-label d2b-' + axis.type + '-label').text(info.label);
	    info.labelBox = dummyLabel.node().getBBox();

	    dummyAxis.remove();
	  }

	  function labelAnchor(axis) {
	    if (!axis.data) return;
	    var info = axis.info,
	        vert = ['y', 'y2'].indexOf(axis.type) > -1;
	    return info.labelOrient2 === 'start' && vert ? 'end' : info.labelOrient2 === 'end' && !vert ? 'end' : info.labelOrient2 === 'middle' ? 'middle' : 'start';
	  }

	  function wrapAnchor(axis) {
	    if (!axis.data) return;
	    switch (axis.type) {
	      case 'x':
	        return axis.info.orient === 'inner' ? 'end' : 'start';
	      case 'x2':
	        return axis.info.orient === 'outer' ? 'end' : 'start';
	      case 'y':
	      case 'y2':
	        return 'middle';
	      default:
	        return 'start';
	    }
	  }

	  function labelY(axis) {
	    if (!axis.data) return;
	    var info = axis.info;
	    var y = 0;

	    switch (axis.type + ' ' + info.orient + ' ' + info.labelOrient1) {
	      case 'x inner inner':
	      case 'x2 outer outer':
	        return -info.axisBox.height - labelPad;
	      case 'x inner outer':
	      case 'x2 outer inner':
	        return info.labelBox.height + labelPad;
	      case 'x outer inner':
	      case 'x2 inner outer':
	      case 'y inner outer':
	      case 'y2 outer inner':
	        return -labelPad;
	      case 'x outer outer':
	      case 'x2 inner inner':
	        return info.labelBox.height + info.axisBox.height + labelPad;
	      case 'y inner inner':
	      case 'y2 outer outer':
	        return info.labelBox.height + info.axisBox.width + labelPad;
	      case 'y outer inner':
	      case 'y2 inner outer':
	        return info.labelBox.height + labelPad;
	      case 'y outer outer':
	      case 'y2 inner inner':
	        return -info.axisBox.width - labelPad;
	    }
	  }

	  function labelX(axis, extent) {
	    if (!axis.data) return;
	    return axis.info.labelOrient2 === 'start' ? 0 : axis.info.labelOrient2 === 'middle' ? extent / 2 : extent;
	  }

	  function dynamicPadding(axes) {
	    var padding = { top: 0, left: 0, right: 0, bottom: 0 };

	    if (axes.x.data) {
	      if (axes.x.info.orient === 'outer') padding.bottom += axes.x.info.axisBox.height;
	      if (axes.x.info.labelOrient1 === 'outer') padding.bottom += axes.x.info.labelBox.height + labelPad;
	    };

	    if (axes.x2.data) {
	      if (axes.x2.info.orient === 'outer') padding.top += axes.x2.info.axisBox.height;
	      if (axes.x2.info.labelOrient1 === 'outer') padding.top += axes.x2.info.labelBox.height;
	    };

	    if (axes.y.data) {
	      if (axes.y.info.orient === 'outer') padding.left += axes.y.info.axisBox.width;
	      if (axes.y.info.labelOrient1 === 'outer') padding.left += axes.y.info.labelBox.height;
	    };

	    if (axes.y2.data) {
	      if (axes.y2.info.orient === 'outer') padding.right += axes.y2.info.axisBox.width;
	      if (axes.y2.info.labelOrient1 === 'outer') padding.right += axes.y2.info.labelBox.height + labelPad;
	    };

	    padding.top = Math.max(padding.top, 10);
	    padding.bottom = Math.max(padding.bottom, 10);
	    padding.left = Math.max(padding.left, 10);
	    padding.right = Math.max(padding.right, 10);

	    return padding;
	  }

	  function wrapTicks(el, axis) {
	    if (!axis.data) return;
	    var length = axis.info.wrapLength,
	        anchor = axis.info.wrapAnchor;
	    el.selectAll('.tick text').each(function () {
	      var tick = d3.select(this);
	      if (tick.html().indexOf('tspan') === -1) this.storeText = tick.text();
	      tick.text('');
	    }).call(textWrap, function () {
	      return this.storeText;
	    }, length, anchor);
	  }

	  // create padding from number or object
	  function makePadding(p) {
	    return typeof p === 'number' ? { top: p, left: p, right: p, bottom: p } : p;
	  }

	  // create margin same as padding but default as 0
	  function makeMargin(m) {
	    return makePadding(m || 0);
	  }
	};

	/**
	  * d2b.modelChart() returns a d2b chart model.
	  *
	  * model.base() will return a chart interface with various built in
	  * getter/setter methods.
	  * model.values()
	  *
	  * @param {Object} update - chart update function
	  * @param {Array} events  - array of event keys to be added to the dispatcher
	  * @param {Object} $$     - value object
	  * @return {Object} model - object with model properties and methods
	  */

	function modelChart (update) {
	  var $$ = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


	  // Chart main update function. Usually used as a call from a d3 selection.
	  // e.g. d3.select('div.chart').call(d2b.chartPie())
	  var chart = function chart(context) {
	    // Iterate through the context and call chart.update with each element.
	    // If context is a transition this transition will propagate to each of
	    // the chart elements.
	    context.each(function (d, i) {
	      var el = d3.select(this);
	      var elContext = context.selection ? el.transition(context) : el;
	      build(elContext, i);
	    });
	  };

	  // Settup base model to have generic chart properties.
	  var model = base(chart, $$).addProp('legend', legend()).addPropFunctor('size', null).addPropFunctor('padding', 0)
	  // duration is used if the chart needs an internal update
	  .addPropFunctor('duration', 250).addPropFunctor('legendHidden', false);

	  // General tools used in generating the chart. These are helpful in the
	  // individual charts when the original context is no longer available. These
	  // methods ensure that the chart's context is always the first argument for
	  // accessor functions or event listeners.
	  function newTools(context, index) {
	    var selection = context.selection ? context.selection() : context;
	    var tools = {
	      // retrieve a chart property e.g. `tools.prop($$.size)` or with extra
	      // arguments `tools.prop($$.radius, this, [width, height])`
	      prop: function prop(_prop, inst) {
	        var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

	        inst = inst || context;
	        args.unshift(context);
	        return typeof _prop === 'function' ? _prop.apply(inst, args) : _prop;
	      },
	      // dispatch a chart event e.g. `tools.dispatch("beforeUpdate")` or with
	      // extra arguments `tools.dispatch("barClick", this, [d, i])`
	      dispatch: function dispatch(key, inst) {
	        var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

	        inst = inst || context;
	        args.unshift(context);
	        return $$.dispatch.apply(key, inst, args);
	      },
	      // chart selections
	      context: context,
	      selection: selection,
	      // trigger an update for the context under the 'd2b-chart' transition space
	      update: function update() {
	        var newContext = (context.selection ? context.selection() : context).transition().duration(tools.prop($$.duration));

	        build(newContext, index);
	      }
	    };

	    return tools;
	  }

	  // Padding can either be a constant or an object containing any of the
	  // attributes (left, right, top, bottom). cleanPadding returns an object
	  // with (left, right, top, bottom) attributes.
	  function cleanPadding(pad) {
	    var padding = { top: 0, left: 0, right: 0, bottom: 0 };
	    if (typeof pad === 'number') return { top: pad, left: pad, right: pad, bottom: pad };
	    ['top', 'bottm', 'right', 'left'].forEach(function (d) {
	      if (pad[d]) padding[d] == pad[d];
	    });
	    return padding;
	  }

	  // Main build function to build the chart components and call the 'update'
	  // function for the specific chart.
	  function build(context, index) {
	    var tools = newTools(context, index);

	    var selection = context.selection ? context.selection() : context,
	        datum = selection.datum(),
	        size = tools.prop($$.size),
	        padding = cleanPadding(tools.prop($$.padding)),
	        translate = 'translate(' + padding.left + ', ' + padding.top + ')';

	    // trigger before update event
	    selection.dispatch('beforeUpdate');

	    // enter d2b-svg and d2b-group
	    var svg = selection.selectAll('.d2b-svg').data(function (d) {
	      return [d];
	    });
	    var enterSvg = svg.enter().append('svg').attr('class', 'd2b-svg');

	    // setup box attributes
	    var box = selection.node().getBoundingClientRect();

	    var width = size && size.width ? size.width : box.width;
	    var height = size && size.height ? size.height : box.height;

	    enterSvg.attr('width', width).attr('height', height).append('g').attr('class', 'd2b-group').attr('transform', translate);

	    // update d2b-svg and d2b-group
	    context.select('.d2b-svg').attr('width', width).attr('height', height).select('.d2b-group').attr('transform', translate);

	    var group = selection.select('.d2b-group');

	    // account for padding in box dimensions
	    width -= padding.top + padding.bottom;
	    height -= padding.left + padding.right;

	    // enter update exit position d2b-chart-legend
	    var chartLegend = group.selectAll('.d2b-chart-legend').data(tools.prop($$.legendHidden) ? [] : [datum]);

	    var enterLegend = chartLegend.enter().append('g').attr('class', 'd2b-chart-legend').style('opacity', 0);

	    var exitLegend = chartLegend.exit();

	    chartLegend = chartLegend.merge(enterLegend);

	    if (context !== selection) {
	      chartLegend = chartLegend.transition(context);
	      exitLegend = exitLegend.transition(context).style('opacity', 0);
	    }

	    chartLegend.style('opacity', 1).call($$.legend.size({ width: width, height: height }));

	    exitLegend.remove();

	    // account for legend spacing
	    var legendSpacing = { left: 0, top: 0 };
	    if (chartLegend.size()) {
	      var legendSize = $$.legend.box(chartLegend),
	          legendOrient = $$.legend.orient().call(chartLegend.node(), datum, 0).split(' '),
	          pad = 10;

	      if (legendOrient[1] === 'top') legendSpacing.top = legendSize.height + pad;
	      if (legendOrient[2] === 'left') legendSpacing.left = legendSize.width + pad;
	      if (legendOrient[0] === 'vertical') width -= legendSize.width + pad;else height -= legendSize.height + pad;
	    }

	    // enter update exit main chart container
	    var mainTranslate = 'translate(' + legendSpacing.left + ', ' + legendSpacing.top + ')';
	    var main = group.selectAll('.d2b-chart-main').data(function (d) {
	      return [d];
	    });
	    var mainEnter = main.enter().append('g').attr('class', 'd2b-chart-main').attr('transform', mainTranslate);

	    main = context.select('.d2b-chart-main').attr('transform', mainTranslate);

	    // Update the chart with the main context (selection or transition),
	    // inner width, inner height, and a tools object.
	    update(main, width, height, tools);

	    // trigger after update event
	    selection.dispatch('afterUpdate');
	  };

	  return model;
	};

	// Wrap text based on pixel length.
	// This isn't used very frequently because it causes problems with event
	// rebinding namely double click events.
	function textWrapPX (text) {
	  var width = arguments.length <= 1 || arguments[1] === undefined ? Infinity : arguments[1];

	  text.each(function () {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word = undefined,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1,
	        // ems
	    y = parseFloat(text.attr('y')) || 0,
	        dy = parseFloat(text.attr('dy')) || 0,
	        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(' '));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(' '));
	        line = [word];
	        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
	      }
	    }
	  });
	};

	function numberize (x) {
	  var def = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	  if (isNaN(x) || x === null) return def;
	  return x;
	}

	function tweenNumber (context) {
	  var number = arguments.length <= 1 || arguments[1] === undefined ? function (d) {
	    return d;
	  } : arguments[1];
	  var format = arguments.length <= 2 || arguments[2] === undefined ? function (d) {
	    return d;
	  } : arguments[2];

	  number = functor(number);

	  // if context is not a transition just render the text and update current
	  if (!context.selection) {
	    return context.text(function (d, i) {
	      this.current = numberize(number.call(this, d, i));
	      return format(this.current);
	    });
	  }

	  context.tween('text', function (d, i) {
	    var _this = this;

	    var val = numberize(number.call(this, d, i));
	    this.current = numberize(this.current, val);
	    var interpolate = d3.interpolate(this.current, val);
	    return function (t) {
	      _this.textContent = format(_this.current = interpolate(t));
	    };
	  });
	}

	function tweenCentroid (context, arc) {
	  // if context is not a transition just render the centroid and update current
	  if (!context.selection) {
	    return context.attr('transform', function (d) {
	      this.current = omit(d, ['data']);
	      return 'translate(' + arc.centroid(this.current) + ')';
	    });
	  }

	  context.attrTween('transform', function (d) {
	    var _this = this;

	    // omit data attribute incase of a pie chart with nested associations
	    d = d2b.omit(d, ['data']);
	    this.current = this.current || d;
	    var i = d3.interpolate(this.current, d);
	    return function (t) {
	      _this.current = i(t);
	      return 'translate(' + arc.centroid(_this.current) + ')';
	    };
	  });
	};

	// tooltip with id in case of multiple d2b.tooltip generators
	function tooltip () {
	  var id = arguments.length <= 0 || arguments[0] === undefined ? d2bid() : arguments[0];

	  var $$ = {};

	  var tooltip = function tooltip(context) {
	    (context.selection ? context.selection() : context).on(event('mouseover'), mouseover).on(event('mouseout'), mouseout).on(event('mousemove'), mousemove);

	    return tooltip;
	  };

	  var getCoords = function getCoords(d, i) {
	    var box = this.getBoundingClientRect();
	    var coords = {};

	    // construct at object, if null automatically set it based on cursor event position
	    var at = ($$.at.call(this, d, i) || (d3.event.clientX > window.innerWidth / 2 ? 'center left' : 'center right')).split(' ');
	    at = { x: at[1], y: at[0] };

	    // switch for horizontal coordinate
	    switch (at.x) {
	      case 'left':
	        coords.x = box.left;
	        break;
	      case 'center':
	        coords.x = box.left + box.width / 2;
	        break;
	      default:
	        // right
	        coords.x = box.left + box.width;
	    }

	    // switch for vertical coordinate
	    switch (at.y) {
	      case 'bottom':
	        coords.y = box.top + box.height;
	        break;
	      case 'center':
	        coords.y = box.top + box.height / 2;
	        break;
	      default:
	        // top
	        coords.y = box.top;
	    }
	    return coords;
	  };

	  var mouseover = function mouseover(d, i) {
	    $$.tooltip = $$.selection.selectAll('.d2b-tooltip').data(function (d) {
	      return [d];
	    });

	    var newTooltip = $$.tooltip.enter().append('div').style('opacity', 0).attr('class', 'd2b-tooltip');

	    newTooltip.append('div').attr('class', 'd2b-tooltip-content');

	    $$.tooltip = $$.tooltip.merge(newTooltip);

	    $$.tooltip.transition().duration(100).style('opacity', 1);

	    $$.dispatch.call("insert", $$.tooltip, this, d, i);
	  };

	  var mousemove = function mousemove(d, i) {
	    var html = $$.html.call(this, d, i),
	        target = $$.target.call(this, d, i),
	        color = $$.color.call(this, d, i),
	        targetNode = target ? target.node() : this,
	        coords = $$.followMouse.call(this, d, i) ? { x: d3.event.clientX, y: d3.event.clientY } : getCoords.call(targetNode, d, i);

	    var my = $$.my.call(this, d, i) || (d3.event.clientX > window.innerWidth / 2 ? 'left' : 'right');

	    $$.tooltip.attr('class', 'd2b-tooltip d2b-tooltip-' + my).style('top', coords.y + 'px').style('left', coords.x + 'px').style('border-color', color).select('.d2b-tooltip-content').html(html);

	    $$.dispatch.call("move", $$.tooltip, this, d, i);
	  };

	  var mouseout = function mouseout(d, i) {
	    $$.tooltip.transition().duration(100).style('opacity', 0).remove();

	    $$.dispatch.call("remove", $$.tooltip, this, d, i);
	  };

	  var event = function event(listener) {
	    return listener + '.d2b-tooltip';
	  };

	  var updateContainer = function updateContainer(n, o) {
	    if (o) o.select('.d2b-tooltip-area-' + id).remove();
	    if (!n) return;
	    $$.selection = n.selectAll('.d2b-tooltip-area-' + id).data([tooltip]);
	    $$.selection = $$.selection.merge($$.selection.enter().append('div').attr('class', 'd2b-tooltip-area-' + id + ' d2b-tooltip-area'));
	  };

	  /* Inherit from base model */
	  var model = base(tooltip, $$).addProp('container', d3.select('body'), null, updateContainer).addMethod('clear', function (selection) {
	    oldGraph.on(event('mouseover'), null).on(event('mouseout'), null).on(event('mousemove'), null);

	    return tooltip;
	  }).addPropFunctor('followMouse', false).addPropFunctor('color', null).addPropFunctor('my', null).addPropFunctor('at', null).addPropFunctor('target', null).addPropFunctor('html', null).addDispatcher(['insert', 'move', 'remove']);

	  return tooltip;
	};

	// Work around for JavaScripts ||= operator. Only null, undefined, and false will me construed ad falsy.

	function oreq () {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  var val = args[0];
	  args.forEach(function (a) {
	    if (val === null || val === undefined || val === false) val = a;
	  });
	  return val;
	}

	function tooltipAxis () {
	  var id = arguments.length <= 0 || arguments[0] === undefined ? d2bid() : arguments[0];

	  var $$ = {};

	  var tooltip = {};

	  // Position markers relative to selected points and axes
	  var positionMarker = function positionMarker(marker, info, type) {
	    if (type === 'y') {
	      if (info.y === Infinity) return marker.style('opacity', 0);
	      marker.style('opacity', 1).attr('transform', 'translate(0, ' + info.y + ')').attr('y1', 0).attr('y2', 0).attr('x1', 0).attr('x2', $$.size.width);
	    } else {
	      if (info.x === Infinity) return marker.style('opacity', 0);
	      marker.style('opacity', 1).attr('transform', 'translate(' + info.x + ', 0)').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', $$.size.height);
	    }
	  };

	  // Position tooltip relative to selected points and axes
	  var positionTooltip = function positionTooltip(tooltip, info, base) {
	    var node = tooltip.node();
	    if (!node) return;
	    var tooltipBox = tooltip.node().getBoundingClientRect();
	    var x = base.x,
	        y = base.y,
	        pad = 10;

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

	    tooltip.style('left', x + 'px').style('top', y + 'px');
	  };

	  // Populate tooltip with point rows
	  var populateTooltip = function populateTooltip(tooltip, info) {
	    var title = $$.title(info.points.map(function (d) {
	      return d.data;
	    }));

	    tooltip.select('.d2b-tooltip-title').style('display', title ? 'block' : 'none').html(title);

	    var content = tooltip.select('.d2b-tooltip-content');

	    var row = content.selectAll('.d2b-tooltip-row').data(info.points);
	    var rowEnter = row.enter().append('div').attr('class', 'd2b-tooltip-row');

	    row.exit().remove();

	    row = row.merge(rowEnter).html(function (d) {
	      return d.row;
	    }).style('border-left-color', function (d) {
	      return d.color || 'transparent';
	    });
	  };

	  // Finds the x, y coordinates associated with the points 'closest' to the cursor.
	  // Also returns the set of points that meet the 'closest' configuration.
	  var findPointInfo = function findPointInfo(base) {
	    var cursor = { x: d3.event.clientX - base.x, y: d3.event.clientY - base.y };
	    var x = Infinity,
	        y = Infinity,
	        points = [];
	    for (var groupName in groups) {
	      if (!groups.hasOwnProperty(groupName)) continue;
	      var group = groups[groupName];

	      var _loop = function _loop(graphName) {
	        if (!group.hasOwnProperty(graphName)) return 'continue';
	        var graph = group[graphName];
	        var newPoints = [];
	        graph.config.data.forEach(function (d, i) {
	          var item = {
	            data: d,
	            x: oreq(graph.config.x(d, i), $$.x(d, i)),
	            y: oreq(graph.config.y(d, i), $$.y(d, i)),
	            color: oreq(graph.config.color(d, i), $$.color(d, i)),
	            row: oreq(graph.config.row(d, i), $$.row(d, i))
	          };

	          if ($$.trackX && $$.trackY) {
	            if (item.x === x && item.y === y) return newPoints.push(item);

	            var od = Math.sqrt(Math.pow(x - cursor.x, 2) + Math.pow(y - cursor.y, 2));
	            var nd = Math.sqrt(Math.pow(item.x - cursor.x, 2) + Math.pow(item.y - cursor.y, 2));

	            if (nd < od && nd < $$.threshold) {
	              x = item.x;
	              y = item.y;
	              points = [];
	              newPoints = [item];
	            }
	          } else if ($$.trackX) {
	            if (item.x === x) return newPoints.push(item);

	            var od = Math.abs(x - cursor.x);
	            var nd = Math.abs(item.x - cursor.x);

	            if (nd < od && nd < $$.threshold) {
	              x = item.x;
	              points = [];
	              newPoints = [item];
	            }
	          } else if ($$.trackY) {
	            if (item.y === y) return newPoints.push(item);

	            var od = Math.abs(y - cursor.y);
	            var nd = Math.abs(item.y - cursor.y);

	            if (nd < od && nd < $$.threshold) {
	              y = item.y;
	              points = [];
	              newPoints = [item];
	            }
	          }
	        });

	        points = points.concat(newPoints);
	      };

	      for (var graphName in group) {
	        var _ret = _loop(graphName);

	        if (_ret === 'continue') continue;
	      }
	    }

	    points = points.sort(function (a, b) {
	      return d3.ascending(a.x, b.x) || d3.ascending(a.y, b.y);
	    });

	    return { x: x, y: y, points: points };
	  };

	  // Exit tooltip element.
	  var exitElement = function exitElement(el) {
	    el.transition().duration(50).style('opacity', 0).remove();
	  };

	  // Enter tooltip element.
	  var enterElement = function enterElement(el) {
	    el.transition().duration(50).style('opacity', 1);
	  };

	  // Enter tooltip components.
	  var enter = function enter() {
	    var markerX = $$.selectionSvg.selectAll('.d2b-tooltip-marker-x').data($$.trackX ? [tooltip] : []);
	    var markerXEnter = markerX.enter().append('line').attr('class', 'd2b-tooltip-marker-x d2b-tooltip-marker');

	    var markerY = $$.selectionSvg.selectAll('.d2b-tooltip-marker-y').data($$.trackY ? [tooltip] : []);
	    var markerYEnter = markerY.enter().append('line').attr('class', 'd2b-tooltip-marker-y d2b-tooltip-marker');

	    var tooltipEl = $$.selection.selectAll('.d2b-tooltip').data([tooltip]);

	    var tooltipEnter = tooltipEl.enter().append('div').attr('class', 'd2b-tooltip');

	    tooltipEnter.merge(tooltipEl).call(enterElement);
	    markerY.merge(markerYEnter).call(enterElement);
	    markerX.merge(markerXEnter).call(enterElement);

	    tooltipEnter.append('div').attr('class', 'd2b-tooltip-title');
	    tooltipEnter.append('div').attr('class', 'd2b-tooltip-content');
	  };

	  // Exit tooltip components.
	  var exit = function exit() {
	    $$.selectionSvg.selectAll('.d2b-tooltip-marker-x').data([]).exit().call(exitElement);
	    $$.selectionSvg.selectAll('.d2b-tooltip-marker-y').data([]).exit().call(exitElement);
	    $$.selection.selectAll('.d2b-tooltip').data([]).exit().call(exitElement);
	  };

	  // Tracker mousemove event.
	  var mousemove = function mousemove(d, i) {
	    var base = $$.selectionSvg.selectAll('.d2b-tooltip-base').data([d]);
	    base = base.merge(base.enter().append('rect').attr('class', 'd2b-tooltip-base'));
	    var baseBox = base.node().getBoundingClientRect();
	    baseBox = { x: baseBox.left, y: baseBox.top };

	    var pointInfo = findPointInfo(baseBox);

	    if (pointInfo.points.length) enter();else return exit();

	    $$.selectionSvg.select('.d2b-tooltip-marker-x').call(positionMarker, pointInfo, 'x');

	    $$.selectionSvg.select('.d2b-tooltip-marker-y').call(positionMarker, pointInfo, 'y');

	    $$.selection.select('.d2b-tooltip').call(populateTooltip, pointInfo).call(positionTooltip, pointInfo, baseBox);

	    $$.dispatch.call("move", $$.tooltip, this, d, i);
	  };

	  // Tracker mouseout event.
	  var mouseout = function mouseout(d, i) {
	    exit();
	  };

	  // Event key builder.
	  var event = function event(listener) {
	    return listener + '.d2b-tooltip-axis';
	  };

	  // update container which houses tooltip html components
	  var updateContainerHtml = function updateContainerHtml(n, o) {
	    if (o) o.select('div.d2b-tooltip-axis-area-' + id).remove();
	    if (!n) return;
	    $$.selection = n.selectAll('div.d2b-tooltip-axis-area-' + id).data([tooltip]);
	    $$.selection = $$.selection.merge($$.selection.enter().append('div').attr('class', 'd2b-tooltip-axis-area-' + id + ' d2b-tooltip-axis-area'));
	  };

	  // update container which houses tooltip svg components
	  var updateContainerSvg = function updateContainerSvg(n, o) {
	    if (o) o.select('g.d2b-tooltip-axis-area-' + id).remove();
	    if (!n) return;
	    $$.selectionSvg = n.selectAll('g.d2b-tooltip-axis-area-' + id).data([tooltip]);
	    $$.selectionSvg = $$.selectionSvg.merge($$.selectionSvg.enter().append('g').attr('class', 'd2b-tooltip-axis-area-' + id + ' d2b-tooltip-axis-area'));
	  };

	  // update mouse event tracker
	  var updateTracker = function updateTracker(n, o) {
	    if (o) {
	      o.on(event('mouseout'), null).on(event('mousemove'), null);
	    }
	    if (n) {
	      n.on(event('mouseout'), mouseout).on(event('mousemove'), mousemove);
	    }
	  };

	  // setup tooltip model
	  var model = base(tooltip, $$).addProp('htmlContainer', d3.select('body'), null, updateContainerHtml).addProp('svgContainer', null, null, updateContainerSvg).addProp('tracker', d3.select('body'), null, updateTracker).addProp('size', { height: 0, width: 0 }).addProp('trackX', true).addProp('trackY', false).addProp('threshold', Infinity).addMethod('clear', function (groupName, graphName) {
	    if (arguments.length === 0) groups = {};else if (arguments.length === 1) delete groups[groupName];else if (arguments.length >= 2) delete groups[groupName][graphName];

	    return tooltip;
	  }).addPropFunctor('title', null).addPropFunctor('x', function (d) {
	    return d.x;
	  }).addPropFunctor('y', function (d) {
	    return d.y;
	  }).addPropFunctor('color', null).addPropFunctor('row', null).addDispatcher(['insert', 'move', 'remove']);

	  // construct an interface for each graph that is initialized
	  var groups = {};
	  tooltip.graph = function () {
	    var groupName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	    var graphName = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	    var graphs = groups[groupName] = groups[groupName] || {};
	    var graph = graphs[graphName];

	    if (!graph) {
	      graph = graphs[graphName] = { interface: {}, config: {} };
	      var graphModel = base(graph.interface, graph.config);

	      graphModel.addProp('data', []).addMethod('clear', function () {
	        graph.config.data = [];
	        return graph.interface;
	      }).addMethod('addPoint', function (p) {
	        graph.config.data.push(p);
	        return graph.interface;
	      }).addPropFunctor('x', null).addPropFunctor('y', null).addPropFunctor('color', null).addPropFunctor('row', null);
	    }

	    return graph.interface;
	  };

	  return tooltip;
	};

	function template () {

	  // Configure model and chart properties.
	  var model = modelChart(update, ['zoomIn', 'zoomOut']).addPropFunctor('interpolate', 'linear');

	  var $$ = model.values();
	  var chart = model.base();

	  // The legend may be configured here. If the items data needs to be defined
	  // as something other than the main chart data that can be done here. Also,
	  // legend click events can be configured for hiding / showing specific chart
	  // elements.
	  $$.legend.items(function (d) {
	    return d;
	  }).active(true).clickable(true).dblclickable(true);

	  function update(context, width, height, tools) {
	    // context is simply the main chart container to append content to. It may
	    // be a d3.selection or a d3.transition

	    // width and height represent the pixel size available for this chart to
	    // occupy.

	    // tools has several methods to help draw the chart for the current context
	    // tools.prop($$.interpolate[, this[, args]]) returns the value of the
	    // specified property, in this case $$.interpolate. Optionaly, `this`
	    // may be specified as well as an arguments array.
	    // tools.dispatch('zoomIn'[, this[, args]]) dispatches an event specified by
	    // a key, in this case 'zoomIn'. Optionaly, `this` may be specified as well
	    // as an arguments array.
	  }

	  return chart;
	};

	/**
	 * d2b.chartPie() returns a d2b
	 * pie chart generator
	 */
	function pie$1 () {

		var model = modelChart(update);
		var $$ = model.values();
		var chart = model.base();

		// configure legend
		$$.legend.active(true).clickable(true).dblclickable(true);

		// pie data layout
		var layout = d3.pie().sort(null);

		// arc generator
		var arc = d3.arc().outerRadius(function (d) {
			return d.outerRadius;
		}).innerRadius(function (d) {
			return d.innerRadius;
		});

		// d2b pie generator
		var pie = d2b.svgPie().arc(arc);

		// percent formater
		var percent = d3.format('.0%');

		// configure model properties
		model.addProp('key', function (d) {
			return d.label;
		}, null, function (d) {
			$$.legend.key(d);
			pie.key(d);
		}).addProp('tooltip', tooltip().followMouse(true).html(function (d) {
			return '<b>' + $$.label(d.data) + ':</b> ' + $$.value(d.data);
		})).addPropFunctor('values', function (d) {
			return d;
		}).addPropFunctor('donutRatio', 0).addPropFunctor('startAngle', 0).addPropFunctor('endAngle', 2 * Math.PI).addPropFunctor('at', 'center center').addPropFunctor('showPercent', function (d, i) {
			return d.__percent__ > 0.03;
		}).addPropFunctor('center', null).addPropFunctor('radius', function (d, w, h) {
			return Math.min(w, h) / 2;
		}).addPropFunctor('sort', null).addPropFunctor('color', function (d) {
			return color(d.label);
		}, null, function (d) {
			$$.tooltip.color(function (dd) {
				return d3.rgb(d(dd.data)).darker(0.3);
			});
			$$.legend.color(d);
			pie.color(d);
		}).addPropFunctor('value', function (d) {
			return d.value;
		}, null, function (d) {
			return layout.value(d);
		}).addPropFunctor('label', function (d) {
			return d.label;
		}, null, function (d) {
			return $$.legend.label(d);
		});

		// update chart
		function update(context, width, height, tools) {
			var selection = context.selection ? context.selection() : context,
			    node = selection.node(),
			    datum = selection.datum(),
			    radius = $$.radius.call(node, datum, width, height),
			    startAngle = $$.startAngle.call(node, datum),
			    endAngle = $$.endAngle.call(node, datum),
			    donutRatio = $$.donutRatio.call(node, datum),
			    at = $$.at.call(node, datum),
			    values = $$.values.call(node, datum).filter(function (d) {
				return !d.__empty__;
			});

			// legend functionality
			tools.selection.select('.d2b-chart-legend').on('change', tools.update).selectAll('.d2b-legend-item').on('mouseover', function (d) {
				return d3.select(d.__arc__).each(arcGrow);
			}).on('mouseout', function (d) {
				return d3.select(d.__arc__).each(arcShrink);
			});

			// Filter and sort for current data.
			var total = d3.sum(values, function (d, i) {
				return d.__value__ = $$.value(d, i);
			});

			// Select and enter pie chart 'g' element.
			var chartGroup = selection.selectAll('.d2b-pie-chart').data([values]);
			var chartGroupEnter = chartGroup.enter().append('g').attr('class', 'd2b-pie-chart');

			chartGroup = chartGroup.merge(chartGroupEnter).datum(function (d) {
				d = layout.startAngle(startAngle).endAngle(endAngle)(d);
				d.forEach(function (dd) {
					dd.outerRadius = radius;
					dd.innerRadius = radius * donutRatio;
				});
				return d;
			});

			if (selection !== context) chartGroup = chartGroup.transition(context);

			chartGroup.call(pie);

			// For each arc in the pie chart assert the transitioning flag and store
			// the element node in data. Also setup hover and tooltip events;
			var arcGroup = selection.selectAll('.d2b-pie-arc').each(function (d, i) {
				this.outerRadius = d.outerRadius;
				d.data.__arc__ = this;
				d.data.__percent__ = d.data.__value__ / total;
			}).on('mouseover', arcGrow).on('mouseout', arcShrink).call($$.tooltip);

			var arcPercent = arcGroup.selectAll('.d2b-pie-arc-percent').data(function (d) {
				return [d];
			});

			arcPercent.enter().append('g').attr('class', 'd2b-pie-arc-percent').append('text').attr('y', 6);

			arcGroup.each(function (d) {
				var elem = d3.select(this),
				    current = elem.select('.d2b-pie-arc path').node().current,
				    percentGroup = elem.select('.d2b-pie-arc-percent'),
				    percentText = percentGroup.select('text').node();
				percentGroup.node().current = current;
				percentText.current = percentText.current || 0;
			});

			if (selection !== context) {
				arcGroup = arcGroup.each(function (d) {
					this.transitioning = true;
				}).transition(context).on('end', function (d) {
					this.transitioning = false;
				});
			}

			arcGroup.select('.d2b-pie-arc-percent').call(d2b.tweenCentroid, arc).select('text').call(tweenNumber, function (d) {
				return d.data.__percent__;
			}, percent).style('opacity', function (d, i) {
				return $$.showPercent.call(this, d.data, i) ? 1 : 0;
			});

			var coords = chartCoords(node, datum, radius, width, height);
			chartGroupEnter.attr('transform', 'translate(' + coords.x + ', ' + coords.y + ')');
			chartGroup.attr('transform', 'translate(' + coords.x + ', ' + coords.y + ')');
		}

		// Position the pie chart according to the 'at' string (e.g. 'center left',
		// 'top center', ..). Unless a `$$.center` function is specified by the user
		// to return the {x: , y:} coordinates of the pie chart center.
		function chartCoords(node, datum, radius, width, height) {
			var coords = $$.center.call(node, datum, width, height, radius),
			    at = $$.at.call(node, datum, width, height).split(' ');

			if (!coords) {
				at = { x: at[1], y: at[0] };
				coords = {};
				switch (at.x) {
					case 'left':
						coords.x = radius;
						break;
					case 'center':
						coords.x = width / 2;
						break;
					default:
						// right
						coords.x = width - radius;
				}

				switch (at.y) {
					case 'bottom':
						coords.y = height - radius;
						break;
					case 'center':
						coords.y = height / 2;
						break;
					default:
						// top
						coords.y = radius;
				}
			}
			return coords;
		}

		function arcGrow(d) {
			if (this.transitioning) return;
			var path = d3.select(this).select('path');
			d.outerRadius = this.outerRadius * 1.03;
			path.transition().duration(100).call(tweenArc, arc);
		}

		function arcShrink(d) {
			if (this.transitioning) return;
			var path = d3.select(this).select('path');
			d.outerRadius = this.outerRadius;
			path.transition().duration(100).call(tweenArc, arc);
		}

		return chart;
	};

	exports.symbolMars = mars;
	exports.symbolVenus = venus;
	exports.mean = mean;
	exports.median = median;
	exports.midpoint = midpoint;
	exports.mode = mode;
	exports.range = range;
	exports.toDegrees = toDegrees;
	exports.toRadians = toRadians;
	exports.point = point;
	exports.plane = plane;
	exports.legend = legend;
	exports.svgPie = pie;
	exports.svgLine = line;
	exports.svgArea = area;
	exports.svgScatter = scatter;
	exports.svgBar = bar;
	exports.svgBubblePack = bubblePack;
	exports.modelBase = base;
	exports.modelChart = modelChart;
	exports.defaultColor = color;
	exports.id = d2bid;
	exports.textWrap = textWrap;
	exports.textWrapPX = textWrapPX;
	exports.tweenCentroid = tweenCentroid;
	exports.tweenNumber = tweenNumber;
	exports.tweenArc = tweenArc;
	exports.tooltip = tooltip;
	exports.tooltipAxis = tooltipAxis;
	exports.stack = stack;
	exports.omit = omit;
	exports.chartTemplate = template;
	exports.chartPie = pie$1;

}));