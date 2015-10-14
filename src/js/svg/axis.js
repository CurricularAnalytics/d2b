/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/* Provides a pre-built 2D axis. Optional labels/axis-orientation/second x-axis/second y-axis etc.. are supported */
d2b.SVG.axis = function(){
  var $$ = {};

  $$.innerTickSize = 5;

  $$.padding = {top:0,bottom:0,left:0,right:0};

  //init dimensions
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

  //init axes
  $$.x = {key:'x', axis: d3.svg.axis(), orientation: 'bottom-outside', hidden:false, labelOrientation: 'outside'};
  $$.y = {key:'y', axis: d3.svg.axis(), orientation: 'left-outside', hidden:false, labelOrientation: 'outside'};
  $$.x2 = {key:'x2', axis: d3.svg.axis(), orientation: 'top-outside', hidden:true, labelOrientation: 'outside'};
  $$.y2 = {key:'y2', axis: d3.svg.axis(), orientation: 'right-outside', hidden:true, labelOrientation: 'outside'};

  $$.axisKeys = ['x','y','x2','y2'];

  //init event object
	$$.events = d2b.UTILS.customEvents();

  $$.updateScaleRange = function(scale, range){
    //if oridnal scale set rangeBands, else set range
    if(scale.rangeBand){
      scale.rangeBands(range);
    }else{
      scale.range(range);
    }
  };

  $$.getMaxTickBox = function(axis){
    //create test-axis, find the maximum tick-size,
    var test = d3.select('body')
      .append('svg')
        .attr('class', 'd2b-axis')
        .style('opacity', 0);

    var maxTickBox = {width:0,height:0};
    test
      .call(axis)
      .selectAll('.tick text')
      .each(function(d){
        var box = this.getBBox();
        maxTickBox.width = Math.max(maxTickBox.width, box.width);
        maxTickBox.height = Math.max(maxTickBox.height, box.height);
      });

    test.remove();

    return maxTickBox;
  };

  $$.getLabelHeight = function(classAlt){
    //create test-label, find the rendered height,
    var testSvg = d3.select('body')
      .append('svg').attr('class','d2b-axis');
    var testText = testSvg
      .append('text')
        .attr('class', 'd2b-axis-label '+classAlt)
        .text('Test')
        .style('opacity', 0);
    var height = parseInt(window.getComputedStyle(testText.node()).fontSize, 10);
    testSvg.remove();
    return height;
  };

  $$.initOridinalRanges = function(){
    //fix for ordinal NAN bug, init rangeBand to [0,1]
    $$.axisKeys.forEach(function(_axis){
      var scale = $$[_axis].axis.scale();
      if(scale.rangeBand){
        scale.rangeBands([0,1]);
      }
    });
  };
  $$.initOridinalRanges();

  $$.updateScale = function(d){
    //update axis -> scale range
    var scale = d.axis.scale();
    var orientation = d.orientation;
    orientation = orientation.split('-');
    var side = orientation[0];
    if(side === 'right' || side === 'left'){
      $$.updateScaleRange(scale, [$$.innerHeight, 0]);
    }else{
      $$.updateScaleRange(scale, [0, $$.innerWidth]);
    }
  };

  $$.denoteOriginTicks = function(){
    //add origin class to any nodes with a 0 tick value
		this.selectAll('.tick text')
			.each(function(d){
				if(parseFloat(this.textContent) === 0)
					d3.select(this.parentNode).classed('d2b-origin-tick', true)
				else
					d3.select(this.parentNode).classed('d2b-origin-tick', false)
			})
	};

  $$.updateGrid = function(d){
    //update the background grid
    var transition = d3.transition(d3.select(this));
    var grid = d.axis;
    var orientation = d.orientation;
    orientation = orientation.split('-');
    var side = orientation[0];
    var scale = grid.scale();

    var range;

    if(side === 'top' || side === 'bottom'){
      grid.orient('top').tickSize(-$$.innerHeight);
    }else{
      grid.orient('left').tickSize(-$$.innerWidth);
    }

    transition
      .call(grid)
      .call($$.denoteOriginTicks)
      .style('opacity', 1);
  };

  $$.updateAxis = function(d){
    var transition = d3.transition(d3.select(this));
    var _axis = d.axis;
    var width = $$.innerWidth;
    var height = $$.innerHeight;

    var scale = _axis.scale();
    var transform = 'translate(0,0)';

    _axis.tickSize($$.innerTickSize);

    var range;
    //switch on axis orientation
    switch (d.orientation) {
      case "left-inside":
        _axis.orient('right');
        break;
      case "left-outside":
        _axis.orient('left');
        break;
      case "right-inside":
        _axis.orient('left');
        transform = 'translate('+width+',0)';
        break;
      case "right-outside":
        _axis.orient('right');
        transform = 'translate('+width+',0)';
        break;
      case "top-inside":
        _axis.orient('bottom');
        break;
      case "top-outside":
        _axis.orient('top');
        break;
      case "bottom-inside":
        _axis.orient('top');
        transform = 'translate(0,'+height+')';
        break;
      case "bottom-outside":
        _axis.orient('bottom');
        transform = 'translate(0,'+height+')';
        break;
      default:
        _axis.orient('bottom');
        transform = 'translate(0,'+height+')';
    }

    transition
      .call(_axis)
      .call($$.denoteOriginTicks)
      .style('opacity', 1)
      .attr('transform',transform);

  };

  $$.updateLabelInside = function(d){
    var elem = d3.select(this);

    var transition = d3.transition(elem);
    var transform = '';

    var heightInside = $$.labelHeightInside;
    var heightOutside = $$.labelHeightOutside * 0.75;

    switch (d.orientation.split('-')[0]) {
      case "left":
        transform = 'translate('+heightInside+',5), rotate(-90)';
        break;
      case "right":
        transform = 'translate('+(-5)+',5), rotate(-90)';
        break;
      case "top":
        transform = 'translate('+($$.innerWidth-5)+','+heightInside+')';
        break;
      case "bottom":
        transform = 'translate('+($$.innerWidth-5)+',-5)';
        break;
      default:
        transform = 'translate(0,'+0+')';
    }

    transition
      .attr('transform', transform)
      .text(d.labelInside || '');
  };

  $$.updateLabelOutside = function(d){
    var elem = d3.select(this);

    var transition = d3.transition(elem);
    var transform = '';

    var heightInside = $$.labelHeightInside;
    var heightOutside = $$.labelHeightOutside * 0.75;

    var orientation = d.orientation.split('-')[0] + "-" + d.labelOrientation;
    switch (orientation) {
      case "left-outside":
        transform = 'translate('+(-$$.padding.left + heightOutside )+','+$$.innerHeight/2+'), rotate(-90)';
        break;
      case "right-outside":
        transform = 'translate('+($$.padding.right)+','+$$.innerHeight/2+'), rotate(-90)';
        break;
      case "top-outside":
        transform = 'translate('+($$.innerWidth/2)+','+(-$$.padding.top + heightOutside)+')';
        break;
      case "bottom-outside":
        transform = 'translate('+($$.innerWidth/2)+','+($$.padding.bottom)+')';
        break;
      default:
        transform = 'translate(0,'+0+')';
    }

    transition
      .attr('transform', transform)
      .text(d.labelOutside || '');

  };

  $$.setPadding = function(orientation, padding){
    //if new padding is greater than current, update it
    $$.padding[orientation] = Math.max($$.padding[orientation],padding);
  };

  $$.updatePadding = function(){
    //update the padding object
    var orientation;
    var box;
    var labelHeight;
    //buffer multiplier for the sides
    var sideBuffer = 1.25;

    //if custom padding defined use that, else estimate based on tick sizes
    if($$.customPadding){
      $$.padding = $$.customPadding;
    }else{
      //estimate padding to allow for tick sizes
      $$.padding = {top:0,bottom:0,left:0,right:0};
      $$.axesVisible.forEach(function(_axis){
        //split orientationation
        orientation = _axis.orientation.split('-');
        //get largest axis tick box
        box = $$.getMaxTickBox(_axis.axis);
        //account for half of the padding to make room for ticks close to the corners of the axis
        $$.setPadding('top', box.height/2); $$.setPadding('bottom', box.height/2);
        $$.setPadding('left', box.width/2); $$.setPadding('right', box.width/2);
        //add the max tick width or height to the appropriate padding side
        if(orientation[1] === 'outside'){
          if(orientation[0] === 'right' || orientation[0] === 'left'){
            $$.setPadding(orientation[0], sideBuffer * box.width + $$.innerTickSize);
          }else if(orientation[0] === 'top' || orientation[0] === 'bottom'){
            $$.setPadding(orientation[0], box.height + $$.innerTickSize);
          }
        }

        if(_axis.labelOutside){
          $$.padding[orientation[0]] += $$.labelHeightOutside * 1.1;
        }

      });
    }
  };

  $$.updateTickCounts = function(width, height){
    var tickCountMultiplier;
    $$.axesVisible.forEach(function(_axis){
      tickCountMultiplier = _axis.tickCountMultiplier || 1;
      if(_axis.axis.scale().rangeBand){}
      else if(_axis.tickCount){
        _axis.axis.ticks(_axis.tickCount)
      }else{
        if(['right','left'].indexOf(_axis.orientation.split("-")[0]) > -1){
    			_axis.axis.ticks(tickCountMultiplier * height/60);
        }else{
    			_axis.axis.ticks(tickCountMultiplier * width/75);
        }
      }
    });
  };

  var axis = function(g){
    //initialize ordinal scale ranges (d3 init workaround)
    $$.initOridinalRanges();

    //init axes-arrays one for all axes and onther for those that are visible
    $$.axesAll = [$$.x, $$.y, $$.x2, $$.y2];
    $$.axesVisible = $$.axesAll.filter(function(d){
      return !d.hidden;
    });

    //set the computed height of the axis labels
    $$.labelHeightOutside = $$.labelHeightOutside || $$.getLabelHeight('d2b-label-outside');
    $$.labelHeightInside = $$.labelHeightInside || $$.getLabelHeight('d2b-label-inside');

    //update padding dynamically unless customPadding has been set
    $$.updatePadding();

    //update innerWidth/innerHeight to account for computed padding
    $$.innerWidth = $$.width - $$.padding.left - $$.padding.right;
    $$.innerHeight = $$.height - $$.padding.top - $$.padding.bottom;

    //update dynamic tick counts
    $$.updateTickCounts($$.innerWidth, $$.innerHeight);

    //update scales to use calculated dimensions
    $$.axesAll.forEach($$.updateScale);

    g.each(function(d, i){

      var selection = d3.select(this);

      //make container
      var g = selection.selectAll('g.d2b-axis-container').data([0]);
      g._enter = g.enter()
        .append('g')
          .attr('class','d2b-axis-container');
      g._update = d3.transition(g)
        .attr('transform', 'translate('+$$.padding.left+','+$$.padding.top+')');

      //make grid
      g.grid = g.selectAll('g.d2b-axis-grid').data($$.axesVisible, function(d){return d.key;});
      g.grid._enter = g.grid.enter()
        .append('g')
          .attr('class', function(d){return 'd2b-axis-grid d2b-'+d.key;})
          .style('opacity', 0)
          .each($$.updateGrid);
      g.grid._update = d3.transition(g.grid).each($$.updateGrid);
      g.grid._exit = d3.transition(g.grid.exit())
        .style('opacity', 0)
          .remove();

      //make axes
      g.axis = g.selectAll('g.d2b-axis').data($$.axesVisible, function(d){return d.key;});
      g.axis._enter = g.axis.enter()
        .append('g')
          .style('opacity', 0)
          .attr('class', function(d){return 'd2b-axis d2b-'+d.key;})
          .each($$.updateAxis);
      g.axis._update = d3.transition(g.axis).each($$.updateAxis);
      g.axis._exit = d3.transition(g.axis.exit())
        .style('opacity', 0)
          .remove();

      //make axis labels
      g.axis._enter.append('text').attr('class', 'd2b-axis-label d2b-label-outside');
      g.axis._enter.append('text').attr('class', 'd2b-axis-label d2b-label-inside');
      g.axis.labelOutside = g.axis.select('.d2b-axis-label.d2b-label-outside');
      g.axis.labelInside = g.axis.select('.d2b-axis-label.d2b-label-inside');
      d3.transition(g.axis.labelOutside).each($$.updateLabelOutside);
      d3.transition(g.axis.labelInside).each($$.updateLabelInside);

    });

  };

  axis.on = d2b.UTILS.CHARTS.MEMBERS.events(axis, $$);

  axis.width = function(width){
    if (!arguments.length) return $$.width;
    $$.width = width;
    return axis;
  };

  axis.height = function(height){
    if (!arguments.length) return $$.height;
    $$.height = height;
    return axis;
  };

  axis.customPadding = function(customPadding){
    if (!arguments.length) return $$.customPadding;
    if (typeof(customPadding) === 'number'){
      $$.customPadding = {
        left:customPadding, right:customPadding,
        top:customPadding, bottom:customPadding
      };
    }else{
      $$.customPadding = customPadding;
    }
    return axis;
  };

  $$.axisKeys.forEach(function(_axis){
    axis[_axis] = function(val){
      if (!arguments.length) return $$[_axis];
      // $$[_axis].label = val.label || $$[_axis].label;
      $$[_axis].labelOutside = val.labelOutside || $$[_axis].labelOutside;
      $$[_axis].labelInside = val.labelInside || $$[_axis].labelInside;
      $$[_axis].axis = val.axis || $$[_axis].axis;
      $$[_axis].tickCount = val.tickCount || $$[_axis].tickCount;
      $$[_axis].tickCountMultiplier = val.tickCountMultiplier || $$[_axis].tickCountMultiplier;
      $$[_axis].hidden = (val.hidden != null  && val.hidden != undefined)? val.hidden : $$[_axis].hidden;
      if(val.orientation){
        val.orientation = val.orientation.split('-');
        $$[_axis].orientation = val.orientation[0] + '-' + val.orientation[1] || 'outside';
      }
      if(val.scale){
        $$[_axis].scale = val.scale;
        $$[_axis].axis.scale($$[_axis].scale);
      }
      return axis;
    };
  });

  axis.scale = function(_axisKey){

    var _axisKey = _axisKey.toLowerCase() || 'x';
    var _axis = axis[_axisKey]().axis;
    var _scale = _axis.scale();
    var _reversed = false;

    var scale;

    if($$.axisKeys.indexOf(_axisKey) > -1){
      scale = function(value){
        var _side = axis[_axisKey]().orientation.split('-')[0];
        var position, value;
        if(typeof(value) === 'object' && _axisKey in value){
          value = value[_axisKey];
        }

        position = _scale(value) || 0;
        var _range = _scale.range();
        if(_reversed){
          position = d3.max(_range) - position + d3.min(_range) + scale.rangeBand()/2;
        }else{
          position += scale.rangeBand()/2;
        }

        return position;
      };
    }else{
      scale = function(){ return null; };
    };

    scale.range = function(){
      var range = [];
      if(_scale.rangeBand){
        range = _scale.range()
        range = [range[0], range[range.length-1] + _scale.rangeBand()]
      }else{
        range = _scale.range();
      }
      return range;
    };

    scale.domain = function(){
      if(_reversed){
        return _scale.domain().slice().reverse();
      }
      return _scale.domain();
    };

    scale.reversed = function(reversed){
      _reversed = reversed;
      return scale;
    };

    scale.invert = function(value){ // todo: support invert for ordinal/reversed scales
      var _domain = _scale.domain();
      var position = _scale.invert(value);
      position = _scale.invert(value);
      // if(_reversed){
      //   position = d3.max(_domain) - position + d3.min(_domain);
      // }
      return position;
    };

    scale.rangeBand = function(){
      if(_scale.rangeBand){
        return _scale.rangeBand();
      }else{
        return 0;
      }
    };

    scale.change = function(_newAxisKey){
      _axisKey = _newAxisKey.toLowerCase() || 'x';
      _axis = axis[_axisKey]().axis;
      _scale = _axis.scale();
      return scale;
    };

    return scale;
  };

  axis.box = function(box){
    if (!arguments.length) {
      return {
        width: $$.width,
        height: $$.height,
        innerWidth : $$.innerWidth,
        innerHeight : $$.innerHeight,
        padding: $$.padding
      };
    }
    $$.width = box.width || $$.width;
    $$.height = box.height || $$.height;
    $$.customPadding = box.padding || $$.customPadding;
    return axis;
  };

  return axis;
};
