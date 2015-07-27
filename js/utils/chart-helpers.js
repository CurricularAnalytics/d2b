d2b.createNameSpace("d2b.UTILS.CHARTS.HELPERS");
d2b.UTILS.CHARTS.HELPERS.updateLegend = function(_chart){
  var legendPadding = 10;
  _chart.legend
    .orientation(
      (_chart.legendOrientation == 'right' || _chart.legendOrientation == 'left')? "vertical" : "horizontal"
    )
    .data(_chart.legendData)
    .height(_chart.innerHeight)
    .width(_chart.innerWidth)
    .update();

  var legendTranslation;
  if(_chart.legendOrientation == 'right')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+_chart.innerWidth-_chart.legend.computedWidth())
      +','+
        ((_chart.innerHeight-_chart.legend.computedHeight())/2+_chart.forcedMargin.top)
      +')';
  else if(_chart.legendOrientation == 'left')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left)
      +','+
        ((_chart.innerHeight-_chart.legend.computedHeight())/2+_chart.forcedMargin.top)
      +')';
  else if(_chart.legendOrientation == 'top')
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+(_chart.innerWidth-_chart.legend.computedWidth())/2)
      +','+
        _chart.forcedMargin.top
      +')';
  else
    legendTranslation = 'translate('+
        (_chart.forcedMargin.left+(_chart.innerWidth-_chart.legend.computedWidth())/2)
      +','+
        (_chart.innerHeight+_chart.forcedMargin.top-_chart.legend.computedHeight())
      +')';

  _chart.selection.legend
    .transition()
      .duration(_chart.animationDuration)
      .attr('transform',legendTranslation);

  var computedSize;
  if(_chart.legendOrientation == 'right' || _chart.legendOrientation == 'left'){
    computedSize = _chart.legend.computedWidth();
  }else{
    computedSize = _chart.legend.computedHeight();
  }
  if(computedSize)
    computedSize += legendPadding;
  _chart.forcedMargin[_chart.legendOrientation] += computedSize;

  _chart.innerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;
  _chart.innerWidth = _chart.outerWidth - _chart.forcedMargin.left - _chart.forcedMargin.right;
};
d2b.UTILS.CHARTS.HELPERS.updateControls = function(_chart){
  var controlsPadding = 10;
  var controlsData = d2b.UTILS.getValues(_chart.controlsData).filter(function(d){return d.visible;});
  controlsData.map(function(d){
    d.data = {state:d.enabled, label:d.label, key:d.key};
  });
  _chart.controls.data(controlsData).width(_chart.innerWidth).update();

  //reposition the controls
  _chart.selection.controls
    .transition()
      .duration(_chart.animationDuration)
      .attr('transform','translate('+(_chart.forcedMargin.left + _chart.innerWidth - _chart.controls.computedWidth())+','+_chart.forcedMargin.top+')');

  var computedSize = _chart.controls.computedHeight();
  if(computedSize)
    computedSize += controlsPadding;
  _chart.forcedMargin.top += computedSize;

  _chart.innerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;

};
d2b.UTILS.CHARTS.HELPERS.updateDimensions = function(_chart){
	_chart.outerWidth = _chart.outerWidth - _chart.forcedMargin.right - _chart.forcedMargin.left;
	_chart.outerHeight = _chart.outerHeight - _chart.forcedMargin.top - _chart.forcedMargin.bottom;
	_chart.forcedMargin = {top:0,bottom:0,left:0,right:0};
	_chart.innerWidth = _chart.outerWidth;
	_chart.innerHeight = _chart.outerHeight;
};
d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG = function(_chart){
  //clean container
  _chart.selection.selectAll('*').remove();

  //create svg
  _chart.selection.svg = _chart.selection
    .append('svg')
      .attr('class','d2b-svg d2b-container');

  //create group container
  _chart.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
  _chart.selection.group = _chart.selection.svg.append('g')
      .attr('transform','translate('+_chart.forcedMargin.left+','+_chart.forcedMargin.top+')');

  //create legend container
  _chart.selection.legend = _chart.selection.group
    .append('g')
      .attr('class','d2b-legend');

  //create controls container
  _chart.selection.controls = _chart.selection.group
    .append('g')
      .attr('class','d2b-controls');
};


//symbol helpers
d2b.UTILS.CHARTS.HELPERS.symbolEnter = function(elem){
  elem.append('path').attr('class', 'd2b-symbol d2b-background');
  elem.append('path').attr('class', 'd2b-symbol d2b-foreground');
};
d2b.UTILS.CHARTS.HELPERS.symbolUpdate = function(elem, stroke, fill, size){
  size = size || 40;
  var symbol = d2b.UTILS.symbol().size(size);

  elem.select('.d2b-symbol.d2b-background')
      .attr('d', function(d){return symbol.type(d.symbolType)();})
      .style('stroke', stroke)
      .style('fill', fill);
  elem.select('.d2b-symbol.d2b-foreground')
  		.attr('d', function(d){return symbol.type(d.symbolType)();})
  		.style('stroke', stroke)
  		.style('fill', fill);
};
d2b.UTILS.CHARTS.HELPERS.symbolEvents = function(elem, size){
  size = size || 40;
  var symbol = d2b.UTILS.symbol();
  elem.on('mouseover.d2b-symbol-mouseover', function(){
    d3.select(this)
      .select('.d2b-symbol.d2b-background')
      .transition()
        .duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
    		.attr('d', function(d){return symbol.size(size + 15 * Math.pow(size,0.5)).type(d.symbolType)();})
  });
  elem.on('mouseout.d2b-symbol-mouseout', function(){
    d3.select(this)
      .select('.d2b-symbol.d2b-background')
      .transition()
        .duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
    		.attr('d', function(d){return symbol.size(size).type(d.symbolType)();})
  });
};
