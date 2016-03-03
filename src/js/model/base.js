/**
  * d2b.model.base() returns a d2b base model.
  *
  * model.interface() will return a base interface with various built in
  * getter/setter methods.
  * model.values() will return the values set through the interface.
  * @param {function} base - function that will act as the model interface
  * @param {object} $$ - attributes set by interactive with the base interface
  * @return {Object} model - object with properties and methods
  */

d2b.model.base = function (base = {}, $$ = {}, protect) {

  const propFn = (prop, cb) => {
    return function (_) {
      if (!arguments.length) return $$[prop];
      $$[prop] = _;
      if (cb) cb(_);
      return base;
    }
  };

  const propFnFunctor = (prop, cb) => {
    return function (_) {
      if (!arguments.length) return $$[prop];
      $$[prop] = d3.functor(_);
      if (cb) cb(_);
      return base;
    }
  };

  /* Base Model */
  const model = {
    base: () => { return base; },
    values: () => { return $$; },
    /**
      * model.removeProp removes the specified property
      * @param {Number} prop    - property key
      * @return {Object} model  - returns model to allow for method chaining
      */
    removeProp: (prop) => {
      if (protect.indexOf(prop) !== -1) {
        console.error(`Cannot remove ${prop} property or value`);
        return model;
      }

      $$[prop] = null;
      base[prop] = null;
      return model;
    },
    /**
      * model.addProp allows new properties to be added to the model and base
      * interface. If the property is already defined an error will be raised.
      * @param {Number} prop    - property key
      * @param {Number} value   - default value to set
      * @param {Number} fn      - function as new prop getter/setter
      * @return {Object} model  - returns model to allow for method chaining
      */
    addProp: (prop, value = null, fn = propFn(prop), cb) => {
      if ($$[prop] || base[prop]) {
        console.error(`${prop} property is already defined.`)
        return model;
      }
      // allow for null:default 'fn' in order to access callback
      fn = fn || propFn(prop, cb);
      if (cb) cb(value);

      $$[prop] = value;
      base[prop] = fn;

      return model;
    },
    /**
      * model.addMethod allows new methods to be added to the model and base
      * interface. If the method is already defined an error will be raised.
      * @param {Number} method  - method key
      * @param {Number} fn      - new method
      * @return {Object} model  - returns model to allow for method chaining
      */
    addMethod: (method, fn) => {
      if (base[method]) {
        console.error(`${method} method is already defined.`)
        return model;
      }
      base[method] = fn;

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
    addPropFunctor: (prop, value = null, fn = propFnFunctor(prop), cb) => {
      if ($$[prop] || base[prop]) {
        console.error(`${prop} property is already defined.`);
        return model;
      }
      // allow for null:default 'fn' in order to access callback
      fn = fn || propFnFunctor(prop, cb);
      value = d3.functor(value);
      if (cb) cb(value);
      
      $$[prop] = value;
      base[prop] = fn;

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
    addDispatcher: (events, prop = 'on', store = 'dispatch') => {
      if (base[prop]) {
        console.error(`${prop} property is already defined.`);
        return model;
      }
      if ($$[store]) {
        console.error(`${store} value is already defined.`);
        return model;
      }
      base[prop] = function (key, fn) {
        if(arguments.length === 0) return $$[store];
        if(arguments.length === 1) return $$[store].on(key);
        $$[store].on(key, fn);

        return base;
      };
      $$[store] = d3.dispatch.apply(this, events);

      return model;
    }
  };

  return model;
};
