d2b.math = d2b.MATH = {};

//  mean, median, mode, midpoint, and range are usefull in hierarchical positioning
//  where the position of the parent nodes are relative to their leaf nodes
//  by the chosen statistical metric

d2b.math.mean = function(arr, value, weight){
  var totalWeight = 0, contribution = 0;
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});
  arr
    .filter(function(a){
      return !isNaN(d2b.number(weight(a))) && !isNaN(d2b.number(value(a)));
    })
    .forEach(function(item){
      var w = weight(item), v = value(item);
      totalWeight += w;
      contribution += v * w;
    });
  if(arr.length && totalWeight) return contribution / totalWeight;
};
d2b.math.median = function(arr, value, weight){
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});

  var medians = [],
      midWeight;

  var newArray = arr
    .filter(function(a){
      return weight(a) !== 0 && !isNaN(d2b.number(weight(a))) && !isNaN(d2b.number(value(a)));
    })
    .sort(function(a,b){return d3.ascending(value(a), value(b))});

  midWeight = Math.round(d3.sum(newArray, function(item){return weight(item);})/2 * 1e12) / 1e12;

  var currentPosition = 0;
  var getNext = false;

  newArray.forEach(function(item){
    if(getNext){
      medians.push(value(item));
      getNext = false;
    }

    currentPosition += weight(item);

    if(currentPosition === midWeight){
      medians.push(value(item));
      getNext = true;
    }

    if(currentPosition > midWeight && medians.length === 0){
      medians.push(value(item));
    }
  });

  if(arr.length) return d2b.MATH.mean(medians);
};
d2b.math.mode = function(arr, value, weight){
  weight = d3.functor(weight || 1);
  value = d3.functor(value || function(d){return d;});

  var modes = [], maxFrequency = 0, frequencies = {};

  arr.forEach(function(item){
    var val = d2b.number(value(item));
    if(isNaN(value(item))) return;
    frequencies[val] = frequencies[val] || 0;
    frequencies[val] += weight(item);

    if(frequencies[val] > maxFrequency){
      maxFrequency = frequencies[value(item)];
      modes = [value(item)];
    }else if(frequencies[value(item)] == maxFrequency){
      modes.push(value(item));
    }
  });

  if(arr.length) return d2b.MATH.mean(modes);
};
d2b.math.midpoint = function(arr, value){
  value = d3.functor(value || function(d){return d;});
  if(arr.length) return d3.mean(d3.extent(arr, value));
};
d2b.math.range = function(arr, value){
  value = d3.functor(value || function(d){return d;});
  var extent = d3.extent(arr, value);
  if(arr.length) return extent[1] - extent[0];
};

//----

d2b.math.toRadians = function(angle) {
  return angle * (Math.PI / 180);
};
d2b.math.toDegrees = function(angle) {
  return angle * (180 / Math.PI);
};
