d2b.UTILS.customEvents = function(){
	var $$ = {};

	$$.events = {};

	// return object with a hash for the events, addListener method, and dispatch method
	return {
		addListener:function(key, listener){
			// split key into event key and event class (namespace)
			var key = key.split(".");
			var eventKey = key[0];
			var eventClass = key[1];

			// if the event handle doesn't exist, initialize it
			if(!$$.events[eventKey])
				$$.events[eventKey] = {};

			// save the listener
			$$.events[eventKey][eventClass] = listener;
		},
		dispatch:function(key, my, args){
			// dispatch all listeners with the event key
			for(var listener in $$.events[key]){
				if($$.events[key][listener])
					$$.events[key][listener].apply(my, args);
			}
		},
		events:function(){return $$.events;}
	}
};

d2b.UTILS.chartEvents = function(){
	var $$ = {};
	$$.elementDispatchers = {};
	$$.elementListeners = {};
	$$.setElementEvents = function(selection, eventKey, listener, namespace, type){
		var callback;
		if(listener){
			callback = function(){
				var mainArguments = Array.prototype.slice.call(arguments);
				mainArguments.unshift(type);
				listener.apply(this, mainArguments);
			}
		}else{
			callback = null;
		}

		selection.on(eventKey.split("-")[1]+"."+namespace+".d2b-element-event", callback);
	};

	// get custom events object
	var handler = d2b.UTILS.customEvents();

	/** Define Custom Element Dispatcher:
		*	Element dispatcher is for adding an array of element selections and
		* binding them all to their own built in events (e.g. 'click', 'mouseover'..).
		* Use: var events = d2b.chartEvents()
		*			 // these three selections will be added to the "main" dispatcher array
		*			 d3.select("body").call(events.addElementDispatcher, "main", "body");
		*			 d3.selectAll("div.foo").call(events.addElementDispatcher, "main", "foo");
		*			 d3.selectAll("div.bar").call(events.addElementDispatcher, "main", "bar");
		*			 // now to add a listener for the "main" elements above to dispatch
		*			 events.addElementListener("main", "click.my_click", function(){ //uses optional namespace "my_click"
		* 				// do something here..
		*					// first argument is the type (body, foo, bar..)
		*					// remaining arguments are default for the event (e.g. for d3 - data and index)
		*			 })
		*/
	handler.addElementListener = function(dispatchKey, key, listener){
		$$.elementListeners[key] = listener;
		for(var selection in $$.elementDispatchers[dispatchKey]){
			$$.setElementEvents($$.elementDispatchers[dispatchKey][selection].selection, key, listener, dispatchKey, $$.elementDispatchers[dispatchKey][selection].type);
		}
	};
	handler.addElementDispatcher = function(selection, dispatchKey, elementKey){
		$$.elementDispatchers[dispatchKey] = $$.elementDispatchers[dispatchKey] || {};
		$$.elementDispatchers[dispatchKey][elementKey] = {selection:selection, type:elementKey.split('.')[0]};
		for(var listener in $$.elementListeners){
			$$.setElementEvents(selection, listener, $$.elementListeners[listener], dispatchKey, $$.elementDispatchers[dispatchKey][elementKey].type);
		}
	};

	// returns all bound events with key/listener attributes
	handler.allEvents = function(chart){
		var events = [];
		var handlerEvents = handler.events()
		for(var key in handlerEvents){
			for(var key2 in handlerEvents[key])
				events.push({key:key+"."+key2,listener:handlerEvents[key][key2]});
		}
		for(var key in $$.elementListeners)
			events.push({key:key,listener:$$.elementListeners[key]})
		return events
	};

	// translate all bound events to a new chart
	handler.translateEvents = function(chart){
		handler.allEvents().forEach(function(event){
			chart.on(event.key, event.listener);
		});
	};
	return handler;
};
