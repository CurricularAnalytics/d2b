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

	    d3.select(this).select('path.d2b-point-back').transition('d2b-point-transition').duration(100).attr('d', symbolBig);

	    d3.select(this).select('path.d2b-point-front').transition('d2b-point-transition').duration(100).style('opacity', empty ? 0.5 : 1).attr('d', symbolSmall);
	  }

	  function mouseout(d, i) {
	    var size = $$.size.call(this, d, i),
	        empty = $$.empty.call(this, d, i);

	    d3.select(this).select('path.d2b-point-back').transition('d2b-point-transition').duration(100).attr('d', symbolNormal);

	    d3.select(this).select('path.d2b-point-front').transition('d2b-point-transition').duration(100).style('opacity', empty ? 0 : 1).attr('d', symbolSmall);
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

	  text.each(function (d, i) {
	    var text = d3.select(this),
	        words = getText.call(this, d, i).split(/\s+/).reverse(),
	        word = undefined,
	        lines = [],
	        line = [words.pop()],
	        lineHeight = 1.1;

	    while (word = words.pop()) {
	      // console.log(line.length)
	      if (line.join(' ').length + word.length > count) {
	        lines.push(line);
	        line = [];
	      }

	      line.push(word);
	    }
	    lines.push(line);

	    var tspan = text.selectAll('tspan').data(lines);

	    tspan.merge(tspan.enter().append('tspan')).text(function (d) {
	      return d.join(' ');
	    }).attr('x', 0).attr('y', 0).attr('dy', function (d, i) {
	      return i * lineHeight + 'em';
	    });
	  });
	}

	function legend () {
	  var $$ = {};

	  var legend = function legend(context) {
	    context.each(function (data, index) {
	      var selection = d3.select(this),
	          size = $$.size.call(this, data, index),
	          maxSize = $$.maxSize.call(this, data, index),
	          orient = $$.orient.call(this, data, index),
	          maxTextLength = $$.maxTextLength.call(this, data, index),
	          items = $$.items.call(this, data, index);

	      // Set point size and stroke width.
	      point$$.size(1.5 * Math.pow(size / 2, 2)).strokeWidth(size * 0.1);

	      // enter d2b-legend container
	      var g = selection.selectAll('.d2b-legend').data([items]);
	      g = g.merge(g.enter().append('g').attr('class', 'd2b-legend'));

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
	      var wrap = item.select('g').attr('transform', 'translate(' + size / 2 + ', ' + size / 2 + ')');

	      // select item text
	      var text = item.select('text').attr('transform', 'translate(' + size / 1.5 + ', ' + size / 3 + ')').style('font-size', size + 'px').call(textWrap, $$.label, maxTextLength);

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
	      wrap.call(point$$);

	      // find max item width
	      var maxWidth = 0;
	      text.each(function () {
	        maxWidth = Math.max(maxWidth, this.getBBox().width);
	      });
	      maxWidth += size;

	      // inital item padding
	      var pad = { x: size, y: 5 };

	      // entering items will be positioned immediately
	      itemEnter.call(position[orient], this, pad, size, maxSize, maxWidth);

	      // Initialize computed dimensions of the legend to 0. These are attached
	      // as attributes to the legend selection node. They can be used to
	      // reposition the legend accordingly.
	      this.computedWidth = 0;
	      this.computedHeight = 0;

	      // update item position and opacity
	      item.style('opacity', 1).call(position[orient], this, pad, size, maxSize, maxWidth);
	    });

	    return legend;
	  };

	  // Bind events and dispatchers to all legend items within selection. Use the
	  // 'd2b-legend' namespace.
	  function bindEvents(selection, index) {
	    selection.selectAll('.d2b-legend-item').on('click.d2b-legend', function (d, i) {
	      click.call(this, d, i, selection, index);
	      $$.dispatch.call("click", this, selection, d, i);
	    }).on('dblclick.d2b-legend', function (d, i) {
	      dblclick.call(this, d, i, selection, index);
	      $$.dispatch.call("dblclick", this, selection, d, i);
	    }).on('mouseover.d2b-legend', function (d, i) {
	      $$.dispatch.call("mouseover", this, selection, d, i);
	    }).on('mouseout.d2b-legend', function (d, i) {
	      $$.dispatch.call("mouseout", this, selection, d, i);
	    });
	  }

	  // On legend item click decide and perform any necessary actions.
	  function click(d, i, selection, index) {
	    var clickable = $$.clickable.call(this, d, i),
	        allowEmptied = $$.allowEmptied.call(selection.node(), selection.datum(), index),
	        data = selection.datum();

	    if (!clickable) return;

	    d.empty = !d.empty;

	    d3.select(this).transition('d2b-legend-change').duration(100).call(point$$);

	    if (allowEmptied) return $$.dispatch.call("change", this, selection, d, i);

	    var allEmpty = true;
	    data.forEach(function (d) {
	      return allEmpty = d.empty ? allEmpty : false;
	    });

	    if (allEmpty) {
	      data.forEach(function (d) {
	        return d.empty = false;
	      });
	      selection.transition('d2b-legend-change').duration(100).call(legend);
	    }

	    $$.dispatch.call("change", this, selection, d, i);
	  };

	  // On legend item dblclick decide and perform any necessary actions.
	  function dblclick(d, i, selection, index) {
	    var dblclickable = $$.dblclickable.call(this, d, i),
	        data = selection.datum();

	    if (!dblclickable) return;

	    data.forEach(function (d) {
	      return d.empty = true;
	    });
	    d.empty = false;

	    selection.transition('d2b-legend-change').duration(100).call(legend);

	    $$.dispatch.call("change", this, selection, d, i);
	  };

	  // Initialize new d2b point.
	  var point$$ = point().empty(function (d) {
	    return d.empty;
	  });

	  // Position legend items either horizontally or vertically.
	  var position = {
	    // transition - d3 transition for legend items that need to be positioned
	    // legendNode - svg node for the current legend (to set compute dimensions)
	    // pad - item padding
	    // size - legend 'size', usually the height of each legend item
	    // maxSize - object with 'width' and 'height' attributes to bound either the vertical or horizontal legend
	    // maxWidth - maximum width of all legend items
	    horizontal: function horizontal(transition, legendNode, pad, size, maxSize, maxWidth) {
	      var x = 0,
	          y = 0,
	          maxHeight = 0;
	      transition.attr('transform', function () {
	        var el = d3.select(this),
	            boxHeight = size * el.selectAll('tspan').size(),
	            boxWidth = el.select('text').node().getBBox().width;

	        if (x + maxWidth > maxSize.width) {
	          x = 0;
	          y += maxHeight + pad.y;
	          maxHeight = 0;
	        }
	        var translate = 'translate(' + x + ', ' + y + ')';
	        maxHeight = Math.max(maxHeight, boxHeight);
	        legendNode.computedWidth = Math.max(legendNode.computedWidth, x + boxWidth + 1.5 * size);
	        x += maxWidth + pad.x;
	        return translate;
	      });
	      legendNode.computedHeight = y + maxHeight;
	    },
	    vertical: function vertical(transition, legendNode, pad, size, maxSize) {
	      var x = 0,
	          y = 0,
	          maxWidth = 0;
	      transition.attr('transform', function () {
	        var el = d3.select(this),
	            boxHeight = size * el.selectAll('tspan').size(),
	            boxWidth = el.select('text').node().getBBox().width;

	        if (y + boxHeight > maxSize.height) {
	          x += maxWidth + pad.x + size;
	          y = 0;
	          maxWidth = 0;
	        }
	        var translate = 'translate(' + x + ', ' + y + ')';
	        maxWidth = Math.max(maxWidth, boxWidth);
	        legendNode.computedHeight = Math.max(legendNode.computedHeight, y + boxHeight);
	        y += boxHeight + pad.y;
	        return translate;
	      });
	      legendNode.computedWidth = x + maxWidth + 1.5 * size;
	    }
	  };

	  /* Inherit from base model */
	  var model = base(legend, $$)
	  // legend level functors
	  .addPropFunctor('items', function (d) {
	    return d;
	  }).addPropFunctor('size', 12).addPropFunctor('maxSize', { width: 960, height: 500 }).addPropFunctor('orient', 'vertical').addPropFunctor('maxTextLength', Infinity).addPropFunctor('allowEmptied', false)
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
	  // .addPropFunctor('empty', d => d.empty, null, _ => point.empty(_) )
	  // Method to get the computed size of a specific legend container. This
	  // method should be used after the legend has been rendered. Either the
	  // legend SVG node or a d3 selection of the node may be specified.
	  .addMethod('computedSize', function (_) {
	    var node = _.node ? _.node() : _;
	    if (!node) return { width: 0, height: 0 };
	    return { width: node.computedWidth, height: node.computedHeight };
	  })
	  // Dispatcher setup.
	  .addDispatcher(['dblclick', 'click', 'mouseover', 'mouseout', 'change']);

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
	          values = $$.values.call(this, d, i);

	      return $$.line.x(function (d, i) {
	        return x($$.px.call(_this, d, i));
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
	  }).addPropFunctor('key', function (d) {
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

	function id () {
	  return Math.random().toString(36).substr(2, 9);
	};

	// line svg generator
	function area () {
	  var $$ = {};

	  /* Update Function */
	  var area = function area(context) {
	    var selection = context.selection ? context.selection() : context;

	    selection.each(function (d) {
	      stackNest.entries(d).forEach(function (sg) {
	        return stacker(sg.values);
	      });
	    });

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

	    graphUpdate.style('opacity', 1);
	    graphExit.style('opacity', 0).remove();
	    areaUpdate.style('fill', $$.color).attr('d', function (d, i) {
	      var x = $$.x.call(this, d, i),
	          y = $$.y.call(this, d, i),
	          values = $$.values.call(this, d, i);

	      return $$.area.x(function (d, i) {
	        return x(d.x);
	      }).y0(function (d, i) {
	        return y(d.__y0__);
	      }).y1(function (d, i) {
	        return y(d.__y1__);
	      })(values);
	    });

	    return area;
	  };

	  var stacker = stack().out(function (d, y0, y1) {
	    d.__y0__ = y0;
	    d.__y1__ = y1;
	  });

	  var stackNest = d3.nest().key(function (d) {
	    var key = $$.stackBy(d);
	    return key !== false && key !== null ? key : id();
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
	  }).addPropFunctor('stackBy', null).addPropFunctor('key', function (d) {
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
	          symbol = $$.symbol.call(this, d, i);

	      $$.point.fill(function (dd, ii) {
	        return $$.pcolor.call(this, dd, ii) || color;
	      }).type(function (dd, ii) {
	        return $$.psymbol.call(this, dd, ii) || symbol;
	      }).size($$.psize);

	      var point = el.selectAll('.d2b-scatter-point').data($$.values, $$.pkey);
	      var pointEnter = point.enter().append('g').attr('class', 'd2b-scatter-point');

	      var pointUpdate = point.merge(pointEnter).order(),
	          pointExit = point.exit();

	      if (context !== selection) {
	        pointUpdate = pointUpdate.transition(context);
	        pointExit = pointExit.transition(context);
	      }

	      pointEnter.style('opacity', 0).call(pointTransform, x, y);

	      pointUpdate.style('opacity', 1).call($$.point).call(pointTransform, x, y);

	      pointExit.style('opacity', 0).remove();
	    });

	    return scatter;
	  };

	  function pointTransform(transition, x, y) {
	    transition.attr('transform', function (d, i) {
	      var px = x($$.px.call(this, d, i));
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
	  }).addPropFunctor('key', function (d) {
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
	  });;

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
	            offset = $$.offset.call(this, d, i) || x.bandwidth ? x.bandwidth() / 2 : 0;

	        // enter update exit bars
	        var bar = graph.selectAll('.d2b-bar-group').data($$.values, $$.pkey);
	        var barEnter = bar.enter().append('g').attr('class', 'd2b-bar-group');
	        barEnter.append('rect');
	        var barUpdate = bar.merge(barEnter).order(),
	            barExit = bar.exit();

	        barUpdate.each(function (d, i) {
	          var centered = $$.pcentered.call(this, d, i),
	              barOffset = centered ? offset - bandwidth / 4 : offset - bandwidth / 2 + d.__stackIndex__ * barWidth + groupPadding;
	          d.__basepx__ = x(d.__base__) + barOffset;
	          d.__extentpx__ = [_y(d.__extent__[0]), _y(d.__extent__[1])];
	          d.__extentpx__.sort(d3.ascending);
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
	    return key !== false && key !== null ? key : id();
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
	  }).addPropFunctor('orient', 'vertical').addPropFunctor('padding', 0.5).addPropFunctor('groupPadding', 0).addPropFunctor('bandwidth', null).addPropFunctor('offset', null).addPropFunctor('stackBy', null).addPropFunctor('key', function (d) {
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
	  var events = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
	  var $$ = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];


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
	  .addPropFunctor('duration', 250).addPropFunctor('legendHidden', false).addPropFunctor('legendAt', 'center right').addDispatcher(['beforeUpdate', 'afterUpdate'].concat(events));

	  // Position the legend either by the specified center coordinates or by
	  // computing them dynamicaly from the chart size, legend size and legend
	  // orientation.
	  function positionLegend(chartLegend, enterLegend, width, height, legendOrient, legendSize, tools) {
	    var x = undefined,
	        y = undefined;
	    var at = tools.prop($$.legendAt).split(" ");
	    at = { x: at[1], y: at[0] };

	    switch (at.x) {
	      case 'left':
	        x = 0;
	        break;
	      case 'center':
	        x = width / 2 - legendSize.width / 2;
	        break;
	      default:
	        // right
	        x = width - legendSize.width;
	    }

	    switch (at.y) {
	      case 'bottom':
	        y = height - legendSize.height;
	        break;
	      case 'center':
	        y = height / 2 - legendSize.height / 2;
	        break;
	      default:
	        // top
	        y = 0;
	    }

	    // add chart margin to allow for horizontal or vertical legend
	    // except in the case of a centered legend
	    var pad = 10;
	    var spacing = { left: 0, top: 0, bottom: 0, right: 0 };
	    legendSize.height += pad;
	    legendSize.width += pad;
	    if (at.x !== 'center' || at.y !== 'center') {
	      if (legendOrient === 'horizontal') {
	        if (at.y === 'top') spacing.top += legendSize.height;else if (at.y === 'bottom') spacing.bottom += legendSize.height;
	      } else {
	        if (at.x === 'left') spacing.left += legendSize.width;else if (at.x === 'right') spacing.right += legendSize.width;
	      }
	    }

	    // translate the legend to the proper coordinates
	    enterLegend.attr('transform', 'translate(' + x + ', ' + y + ')');
	    chartLegend.attr('transform', 'translate(' + x + ', ' + y + ')');

	    return spacing;
	  }

	  // General tools used in generating the chart. These are helpful in the
	  // individual charts when the original context is no longer available. These
	  // methods ensure that the chart's context is always the first argument for
	  // accessor functions or event listeners.
	  function newTools(context, index) {
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
	      // trigger an update for the context under the 'd2b-chart' transition space
	      update: function update() {
	        var newContext = (context.selection ? context.selection() : context).transition('d2b-chart').duration(tools.prop($$.duration));

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
	    tools.dispatch("beforeUpdate");

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

	    chartLegend.style('opacity', 1).call($$.legend.maxSize({ width: width, height: height }));

	    exitLegend.remove();

	    // position legend and account for legend spacing
	    var legendSpacing = { left: 0, top: 0 };
	    if (chartLegend.size()) {
	      var legendSize = $$.legend.computedSize(chartLegend);
	      var legendOrient = $$.legend.orient().call(chartLegend.node(), datum, index);
	      legendSpacing = positionLegend(chartLegend, enterLegend, width, height, legendOrient, legendSize, tools);
	      width -= legendSpacing.left + legendSpacing.right;
	      height -= legendSpacing.top + legendSpacing.bottom;
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
	    tools.dispatch("afterUpdate");
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
	  var id = arguments.length <= 0 || arguments[0] === undefined ? d2b.id() : arguments[0];

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

	    $$.tooltip.transition('d2b-tooltip-insert').duration(100).style('opacity', 1);

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
	  }).addPropFunctor('followMouse', false).addPropFunctor('color', null).addPropFunctor('my', null).addPropFunctor('at', null).addPropFunctor('target', null).addPropFunctor('html', null).addDispatcher(['insert', 'move', 'remove']);

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
	    return d.values;
	  }).active(true).clickable(true).dblclickable(true).on('change', function () {
	    console.log('legend changed!');
	  });

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
		$$.legend.active(true).clickable(true).dblclickable(true).on('change', function (legend, d) {
			return legend.datum().__update__();
		}).on('mouseover.d2b-pie', function (legend, d) {
			return d3.select(d.__elem__).each(arcGrow);
		}).on('mouseout.d2b-pie', function (legend, d) {
			return d3.select(d.__elem__).each(arcShrink);
		});

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
		model.addProp('donutRatio', 0).addProp('startAngle', 0, null, function (d) {
			return layout.startAngle(d);
		}).addProp('endAngle', 2 * Math.PI, null, function (d) {
			return layout.endAngle(d);
		}).addProp('at', 'center center').addProp('key', function (d) {
			return d.label;
		}, null, function (d) {
			$$.legend.key(d);
			pie.key(d);
		}).addProp('tooltip', tooltip().followMouse(true).html(function (d) {
			return '<b>' + $$.label(d.data) + ':</b> ' + $$.value(d.data);
		})).addPropFunctor('showPercent', function (d, i, p) {
			return p > 0.03;
		}).addPropFunctor('center', null).addPropFunctor('radius', function (w, h) {
			return Math.min(w, h) / 2;
		}).addPropFunctor('sort', null).addPropFunctor('color', function (d) {
			return d2b.defaultColor(d.label);
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
			    radius = $$.radius.call(node, width, height);

			// Retrieve pie datum, save refresh method, filter out emptied items.
			var datum = selection.datum();
			datum.__update__ = tools.update;
			datum = datum.filter(function (d) {
				return !d.empty;
			});

			// Filter and sort for current data.
			var total = d3.sum(datum, function (d, i) {
				return $$.value.call(chart, d, i);
			});

			// Select and enter pie chart 'g' element.
			var chartGroup = selection.selectAll('.d2b-pie-chart').data([datum]);
			var chartGroupEnter = chartGroup.enter().append('g').attr('class', 'd2b-pie-chart');

			chartGroup = chartGroup.merge(chartGroupEnter).datum(function (d) {
				d = layout(d);
				d.forEach(function (dd) {
					dd.outerRadius = radius;
					dd.innerRadius = radius * $$.donutRatio;
				});
				return d;
			});

			if (selection !== context) chartGroup = chartGroup.transition(context);

			chartGroup.call(pie);

			// For each arc in the pie chart assert the transitioning flag and store
			// the element node in data. Also setup hover and tooltip events;
			var arcGroup = selection.selectAll('.d2b-pie-arc').each(function (d) {
				this.outerRadius = d.outerRadius;
				d.data.__elem__ = this;
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
				return d.value / total;
			}, percent).style('opacity', function (d, i) {
				return $$.showPercent.call(this, d.data, i, d.value / total) ? 1 : 0;
			});

			var coords = chartCoords(node, radius, width, height);
			chartGroupEnter.attr('transform', 'translate(' + coords.x + ', ' + coords.y + ')');
			chartGroup.attr('transform', 'translate(' + coords.x + ', ' + coords.y + ')');
		}

		// Position the pie chart according to the 'at' string (e.g. 'center left',
		// 'top center', ..). Unless a `$$.center` function is specified by the user
		// to return the {x: , y:} coordinates of the pie chart center.
		function chartCoords(node, radius, width, height) {
			var coords = $$.center.call(node, width, height, radius);

			if (!coords) {
				var at = $$.at.split(' ');
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
			path.transition('d2b-chart').call(tweenArc, arc);
		}

		function arcShrink(d) {
			if (this.transitioning) return;
			var path = d3.select(this).select('path');
			d.outerRadius = this.outerRadius;
			path.transition('d2b-chart').call(tweenArc, arc);
		}

		return chart;
	};

	exports.symbolMars = mars;
	exports.symbolVenus = venus;
	exports.point = point;
	exports.legend = legend;
	exports.svgPie = pie;
	exports.svgLine = line;
	exports.svgArea = area;
	exports.svgScatter = scatter;
	exports.svgBar = bar;
	exports.modelBase = base;
	exports.modelChart = modelChart;
	exports.defaultColor = color;
	exports.id = id;
	exports.textWrap = textWrap;
	exports.textWrapPX = textWrapPX;
	exports.tweenCentroid = tweenCentroid;
	exports.tweenNumber = tweenNumber;
	exports.tweenArc = tweenArc;
	exports.tooltip = tooltip;
	exports.stack = stack;
	exports.omit = omit;
	exports.chartTemplate = template;
	exports.chartPie = pie$1;

}));