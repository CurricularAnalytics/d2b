/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

// Add symbols to the default d3 svg support

d2b.SVG.symbol = function(){
  var $$ = {};

  $$.size = d3.functor(150);
  $$.type = d3.functor('circle');
  $$.d3Symbol = d3.svg.symbol().type($$.type);
  $$.symbol = $$.d3Symbol;

  var symbol = function(d, i){
    var type = $$.type.call(this, d, i);
    var size = $$.size;

    if(d3.svg.symbolTypes.indexOf(type) > -1)
      $$.symbol = $$.d3Symbol.type(type).size(size);
    else if(d2b.SVG.symbolTypes.indexOf(type) > -1)
      $$.symbol = d2b.SVG.symbols[type];
    else
      $$.symbol = $$.d3Symbol.type('circle').size(size);
// console.log($$.symbol($$.size.call(this, d, i)))
    return $$.symbol($$.size.call(this, d, i));
  };

  symbol.size = function(size){
    if (!arguments.length) return $$.size;

    $$.size = d3.functor(size);
    // $$.d3Symbol.size($$.size);

    return symbol;
  };

  symbol.type = function(type){
    if (!arguments.length) return $$.type;

    $$.type = d3.functor(type);

    return symbol;
  };

  return symbol;
};

d2b.SVG.symbols = {
  star: function(size){
    var sin36 = Math.sin(d2b.MATH.toRadians(36));
    var cos36 = Math.cos(d2b.MATH.toRadians(36));

    var sin54 = Math.sin(d2b.MATH.toRadians(54));
    var cos54 = Math.cos(d2b.MATH.toRadians(54));

    var sin18 = Math.sin(d2b.MATH.toRadians(18));
    var cos18 = Math.cos(d2b.MATH.toRadians(18));
    var tan18 = Math.tan(d2b.MATH.toRadians(18));

    var r = Math.sqrt(size/(5*cos36*(sin36+cos36/tan18)));
    var r2 = r*sin36 + r*cos36/tan18;

    return "M" + 0 +","+ -r2
          +"L" + r*cos54 +","+ -r*sin54
          +" " + r2*cos18 +","+ -r2*sin18
          +" " + r*cos18 +","+ r*sin18
          +" " + r2*sin36 +","+ r2*cos36
          +" " + 0 +","+ r
          +" " + -r2*sin36 +","+ r2*cos36
          +" " + -r*cos18 +","+ r*sin18
          +" " + -r2*cos18 +","+ -r2*sin18
          +" " + -r*cos54 +","+ -r*sin54
          +" " + 0 +","+ -r2 +"Z";
  },
  mars: function(size){
    var r = Math.sqrt(size/(Math.PI+5/4));
    var sqrt8 = Math.sqrt(8);
    var sqrt2 = Math.sqrt(2);
    var s = 0.3125 * r;

    return "M" + r/sqrt8 + ","+ 0
          +"A" + r +","+ r +" 0 1,1 "+ 0 + ","+ -r/sqrt8
          +"L" + r*(5/4-1/sqrt2) + ","+ -r*(1/sqrt8 + 5/4 - 1/sqrt2)
          +" " + (r*(5/4-1/sqrt2)-s) + ","+ -r*(1/sqrt8 + 5/4 - 1/sqrt2)
          +" " + (r*(5/4-1/sqrt2)-s) + ","+ -r*(1/sqrt8 + 7/4 - 1/sqrt2)
          +" " + r*(7/4-1/sqrt2+1/sqrt8) + ","+ -r*(1/sqrt8 + 7/4 - 1/sqrt2)
          +" " + r*(7/4-1/sqrt2+1/sqrt8) + ","+ (-r*(5/4 - 1/sqrt2) + s)
          +" " + r*(5/4-1/sqrt2+1/sqrt8) + ","+ (-r*(5/4 - 1/sqrt2) + s)
          +" " + r*(5/4-1/sqrt2+1/sqrt8) + ","+ -r*(5/4 - 1/sqrt2)
          +"Z";

  },
  venus: function(size){
    var r = Math.sqrt(size/(Math.PI+5/4));

    //center point is at ~ 3/4*r down from the center of the circle

    return "M" + -r/4 + ","+ r/4
          +"A" + r +","+ r +" 0 1,1 "+ r/4 + ","+ r/4
          +"L" + r/4 + ","+ (3*r/4)
          +" " + r*3/4 + ","+ (3*r/4)
          +" " + r*3/4 + ","+ (5*r/4)
          +" " + r/4 + ","+ (5*r/4)
          +" " + r/4 + ","+ (7*r/4)
          +" " + -r/4 + ","+ (7*r/4)
          +" " + -r/4 + ","+ (5*r/4)
          +" " + -r*3/4 + ","+ (5*r/4)
          +" " + -r*3/4 + ","+ (3*r/4)
          +" " + -r/4 + ","+ (3*r/4)
          +"Z";
  },
  // asterisk: function(size){
  //   //TODO
  //   var l = Math.sqrt(size/11.7043);
  //   var sqrt_3 = Math.sqrt(3);
  //   var s = l*sqrt_3/2;
  //   var sqrt_8 = Math.sqrt(8);
  //
  //   var current = {x:0,y:0}
  //
  //   return "M" + (current.x -= l/2) +","+ (current.y -= s)
  //         +"L" + current.x +","+ (current.y -= l)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += 1/4) +","+ (current.y -= l/4)
  //         +"L" + (current.x += l/2) +","+ current.y
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += 1/4) +","+ (current.y += l/4)
  //         +"L" + current.x +","+ (current.y += l)
  //         +" " + (current.x += l*sqrt_3/2) +","+ (current.y -= l/2)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x += l*sqrt_3/(2*sqrt_8)) +","+ (current.y += l/(2*sqrt_8))
  //         +"L" + (current.x += l/4) +","+ (current.y += l*sqrt_3/4)
  //         +"A" + l/4 +","+ l/4 +" 0 0,1 "+ (current.x -= l/(2*sqrt_8)) +","+ (current.y += l*sqrt_3/(2*sqrt_8))
  //
  //         +"L" + 0 +","+ 100
  //         +"Z";
  // },
  close: function(size){
    var r = Math.sqrt(size/5); // border length of each side
    var r2 = Math.sqrt(r*r/2); // small side of intersecting triangle for each far point
    var r3 = Math.sqrt(1/2)*r; // from center to the close intersection point
    var r4 = r2 + r3;          // long side of intersecting triangle for each far point

    return "M" + 0 +","+ -r3
          +"L" + r2 +","+ -r4
          +" " + r4 +","+ -r2
          +" " + r3 +","+ 0
          +" " + r4 +","+ r2
          +" " + r2 +","+ r4
          +" " + 0 +","+ r3
          +" " + -r2 +","+ r4
          +" " + -r4 +","+ r2
          +" " + -r3 +","+ 0
          +" " + -r4 +","+ -r2
          +" " + -r2 +","+ -r4
          +" " + 0 +","+ -r3 +"Z";

  },
  hexagon: function(size){
    var s = Math.sqrt(size * 2 / (3 * Math.sqrt(3)));
    var moveX = Math.cos(d2b.MATH.toRadians(30)) * s;
    var moveY = Math.sin(d2b.MATH.toRadians(30)) * s;


    return "M"+ 0 +","+ -s
          +"L"+ moveX +","+ -moveY
          +" "+ moveX +","+ moveY
          +" "+ 0 +","+ s
          +" "+ -moveX +","+ moveY
          +" "+ -moveX +","+ -moveY +"Z";

  },
  "rect-horizontal": function(size){
    var sideRatio = 3; // 3 to 1
    var r = Math.sqrt(size/sideRatio);
    var r2 = r*sideRatio;

    return "M" + -r2/2 +","+ -r/2
          +"L" + r2/2 +","+ -r/2
          +" " + r2/2 +","+ r/2
          +" " + -r2/2 +","+ r/2 +"Z";
  },
  "rect-vertical": function(size){
    var sideRatio = 1/3; // 1 to 3
    var r = Math.sqrt(size/sideRatio);
    var r2 = r*sideRatio;

    return "M" + -r2/2 +","+ -r/2
          +"L" + r2/2 +","+ -r/2
          +" " + r2/2 +","+ r/2
          +" " + -r2/2 +","+ r/2 +"Z";
  },
  "arrow-right": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r +","+ -r/4
          +"L" + 0 +","+ -r/4
          +" " + 0 +","+ -3*r/4
          +" " + r +","+ 0
          +" " + 0 +","+ 3*r/4
          +" " + 0 +","+ r/4
          +" " + -r +","+ r/4 +"Z";

  },
  "arrow-left": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + r +","+ -r/4
          +"L" + 0 +","+ -r/4
          +" " + 0 +","+ -3*r/4
          +" " + -r +","+ 0
          +" " + 0 +","+ 3*r/4
          +" " + 0 +","+ r/4
          +" " + r +","+ r/4 +"Z";

  },
  "arrow-up": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r/4 +","+ r
          +"L" + -r/4 +","+ 0
          +" " + -3*r/4 +","+ 0
          +" " + 0 +","+ -r
          +" " + 3*r/4 +","+ 0
          +" " + r/4 +","+ 0
          +" " + r/4 +","+ r +"Z";

  },
  "arrow-down": function(size){
    var r = Math.sqrt(4/5 * size);

    return "M" + -r/4 +","+ -r
          +"L" + -r/4 +","+ 0
          +" " + -3*r/4 +","+ 0
          +" " + 0 +","+ r
          +" " + 3*r/4 +","+ 0
          +" " + r/4 +","+ 0
          +" " + r/4 +","+ -r +"Z";

  }

};

//more keys for the close symbol
d2b.SVG.symbols["cross-diagonal"] = d2b.SVG.symbols.close;
d2b.SVG.symbols["x"] = d2b.SVG.symbols.close;

d2b.SVG.symbolTypes = d3.svg.symbolTypes.concat(
  [
    "star", "close", //"asterisk",
    "rect-horizontal", "rect-vertical",
    "arrow-right", "arrow-left", "arrow-up", "arrow-down",
    "venus", "mars",
    "hexagon"
  ]
);

//copy symbol to old location for old version support
d2b.UTILS.symbol = d2b.SVG.symbol;
d2b.UTILS.symbolTypes = d2b.SVG.symbolTypes;
