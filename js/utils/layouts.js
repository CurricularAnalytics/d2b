d2b.createNameSpace("d2b.UTILS.LAYOUTS");

d2b.UTILS.LAYOUTS.partition = function(){

  var $$ = {};

  $$.group = function(d, columns){
    var column = columns.shift();

    var childrenHash = {};
    var children = [];
    var child;

    d.forEach(function(row){
      child = childrenHash[row[column.column]] = childrenHash[row[column.column]] || {allChildren:[]};
      child.allChildren.push(row);
    });

    for(key in childrenHash){
      child = childrenHash[key];
      child.name = key;
      child.top = column.top;
      if(columns.length > 0)
        child.children = $$.group(child.allChildren, columns.slice(0));
      if(columns.length == 0){
        child.size = d3.sum(child.allChildren, function(d){return d.count;});
      }

      if(child.name)
        children.push(child);
      else{
        children = children.concat(child.children);
      }
    };

    return children;
  };

  var my = function(data, columns, title){
    return {
      "name": title,
      "top": true,
      "children": $$.group(data, columns)
    };
  };

  return my;
};
