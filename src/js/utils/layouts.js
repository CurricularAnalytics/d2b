d2b.createNameSpace("d2b.UTILS.LAYOUTS");

d2b.UTILS.LAYOUTS.partition = function(){

  var $$ = {};

  $$.group = function(rows, columns){
    var column = columns.shift();

    // var childrenHash = {};
    var children = [];
    var child;

    var groups = d3.nest()
      .key(function(d){ return d[column.column]; })
      .entries(rows);

    groups.forEach(function(group){
      child = {
        allChildren: group.values,
        name: group.key,
        top: column.top
      };

      if(columns.length){
        child.children = $$.group(child.allChildren, columns.slice(0));
      }else{
        child.size = d3.sum(child.allChildren, function(d){return d.count;});
      }

      if(["null", "undefined"].indexOf(child.name) === -1)
        children.push(child);
      else{
        children = children.concat(child.children);
      }

    });

    //
    // d.forEach(function(row){
    //   child = childrenHash[row[column.column]] = childrenHash[row[column.column]] || {allChildren:[]};
    //   child.allChildren.push(row);
    // });
    //
    // for(key in childrenHash){
    //   child = childrenHash[key];
    //   child.name = key;
    //   child.top = column.top;
    //   if(columns.length > 0)
    //     child.children = $$.group(child.allChildren, columns.slice(0));
    //   if(columns.length == 0){
    //     child.size = d3.sum(child.allChildren, function(d){return d.count;});
    //   }
    //   console.log(column.column);
    //   console.log(key);
    //   if(child.name)
    //     children.push(child);
    //   else{
    //     children = children.concat(child.children);
    //   }
    // };

    return children;
  };

  var my = function(data, columns, title){
    return {
      "name": title,
      "top": true,
      "children": $$.group(data, columns.slice(0))
    };
  };

  return my;
};
