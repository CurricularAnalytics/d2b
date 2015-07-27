d2b.MATH = {};

//  mean, median, mode, midpoint, and range are usefull in hierarchical positioning
//  where the position of the parent nodes are relative to their leaf nodes
//  by the chosen statistical metric

d2b.MATH.mean = function(arr, value, weight){
  if(!(typeof weight === "function"))
    weight = function(){return 1};
  if(!(typeof value === "function"))
    value = function(item){return item};

  var totalWeight = d3.sum(arr, function(item){return weight(item)});

  var mean = 0;
  arr.forEach(function(item){
    mean += value(item) * weight(item) / totalWeight;
  });
  return mean;
};
d2b.MATH.median = function(arr, value, weight){
  if(!(typeof weight === "function"))
    weight = function(){return 1};
  if(!(typeof value === "function"))
    value = function(item){return item};

  var medians = [], midWeight = d3.sum(arr, function(item){return weight(item)})/2;

  arr.sort(function(a,b){return d3.ascending(value(a), value(b))});

  var currentPosition = 0;
  arr.forEach(function(item){
    if(currentPosition == midWeight){
      medians.push(value(item));
    }

    currentPosition += weight(item);

    if(currentPosition >= midWeight && medians.length == 0){
      medians.push(value(item));
    }
  });

  return d2b.MATH.mean(medians);
};
d2b.MATH.mode = function(arr, value, weight){ //finish mode...
  if(!(typeof weight === "function"))
    weight = function(){return 1};
  if(!(typeof value === "function"))
    value = function(item){return item};

  var modes = [], maxFrequency = 0, frequencies = {};

  arr.forEach(function(item){
    frequencies[value(item)] = frequencies[value(item)] || 0;
    frequencies[value(item)] += weight(item);

    if(frequencies[value(item)] > maxFrequency){
      maxFrequency = frequencies[value(item)];
      modes = [value(item)];
    }else if(frequencies[value(item)] == maxFrequency){
      modes.push(value(item));
    }
  });

  return d2b.MATH.mean(modes);
};
d2b.MATH.midpoint = function(arr, value){
  return d3.mean(d3.extent(arr, function(item){return (value)? value(item) : item;}))
};
d2b.MATH.range = function(arr, value){
  var extent = d3.extent(arr, function(item){return (value)? value(item) : item;});
  return extent[1] - extent[0];
};
