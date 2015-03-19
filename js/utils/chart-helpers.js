AD.createNameSpace("AD.UTILS.CHARTS.HELPERS");
AD.UTILS.CHARTS.HELPERS.updateLegend = function(_){
  if(_.legendOrientation == 'right' || _.legendOrientation == 'left'){
    _.legend.orientation('vertical').data(_.legendData).height(_.innerHeight).update();
  }
  else{
    _.legend.orientation('horizontal').data(_.legendData).width(_.innerWidth).update();
  }

  var legendTranslation;
  if(_.legendOrientation == 'right')
    legendTranslation = 'translate('+(_.forcedMargin.left+_.innerWidth-_.legend.computedWidth())+','+((_.innerHeight-_.legend.computedHeight())/2+_.forcedMargin.top)+')';
  else if(_.legendOrientation == 'left')
    legendTranslation = 'translate('+(_.forcedMargin.left)+','+((_.innerHeight-_.legend.computedHeight())/2+_.forcedMargin.top)+')';
  else if(_.legendOrientation == 'top')
    legendTranslation = 'translate('+(_.forcedMargin.left+(_.innerWidth-_.legend.computedWidth())/2)+','+_.forcedMargin.top+')';
  else
    legendTranslation = 'translate('+(_.forcedMargin.left+(_.innerWidth-_.legend.computedWidth())/2)+','+(_.innerHeight+_.forcedMargin.top-_.legend.computedHeight())+')';

  _.selection.legend
    .transition()
      .duration(_.animationDuration)
      .attr('transform',legendTranslation);

  if(_.legendOrientation == 'right' || _.legendOrientation == 'left')
    _.forcedMargin[_.legendOrientation] += _.legend.computedWidth();
  else
    _.forcedMargin[_.legendOrientation] += _.legend.computedHeight();

  _.innerHeight = _.outerHeight - _.forcedMargin.top - _.forcedMargin.bottom;
  _.innerWidth = _.outerHeight - _.forcedMargin.left - _.forcedMargin.right;
};
AD.UTILS.CHARTS.HELPERS.updateControls = function(_){
  var controlsData = AD.UTILS.getValues(_.controlsData).filter(function(d){return d.visible;});
  controlsData.map(function(d){
    d.data = {state:d.enabled, label:d.label, key:d.key};
  });
  _.controls.data(controlsData).width(_.innerWidth).update();

  //reposition the controls
  _.selection.controls
    .transition()
      .duration(_.animationDuration)
      .attr('transform','translate('+(_.forcedMargin.left + _.innerWidth - _.controls.computedWidth())+','+_.forcedMargin.top+')');

  _.forcedMargin.top += _.controls.computedHeight();
  _.innerHeight = _.outerHeight - _.forcedMargin.top - _.forcedMargin.bottom;

};
AD.UTILS.CHARTS.HELPERS.updateDimensions = function(_){
	_.outerWidth = _.outerWidth - _.forcedMargin.right - _.forcedMargin.left;
	_.outerHeight = _.outerHeight - _.forcedMargin.top - _.forcedMargin.bottom;
	_.forcedMargin = {top:0,bottom:0,left:0,right:0};
	_.innerWidth = _.outerWidth;
	_.innerHeight = _.outerHeight;
};
AD.UTILS.CHARTS.HELPERS.generateDefaultSVG = function(_){
  //clean container
  _.selection.selectAll('*').remove();

  //create svg
  _.selection.svg = _.selection
    .append('svg')
      .attr('class','ad-template-chart ad-svg ad-container');

  //create group container
  _.forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
  _.selection.group = _.selection.svg.append('g')
      .attr('transform','translate('+_.forcedMargin.left+','+_.forcedMargin.top+')');

  //create legend container
  _.selection.legend = _.selection.group
    .append('g')
      .attr('class','ad-legend');

  //create controls container
  _.selection.controls = _.selection.group
    .append('g')
      .attr('class','ad-controls');
};
