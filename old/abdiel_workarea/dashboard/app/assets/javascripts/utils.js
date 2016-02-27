var updateLayouts = function(layouts){
  var sideBarWidth = $("#sidebar").width();
  var windowHeight = $(window).height() - 80;

  var pageWrap = $("#page-wrap");
  var pageWidth = pageWrap.innerWidth()-5;

  layouts.forEach(function(layout){
    var layoutSelection = layout.selection();
    var widthRatio = layoutSelection.attr('width');
    var heightRatio = layoutSelection.attr('height');
    var layoutHeight = Math.max(
                        layoutSelection.attr('min-height') || 0,
                        Math.min(
                          layoutSelection.attr('max-height') || (heightRatio * windowHeight),
                          heightRatio * windowHeight
                        ));

    var layoutWidth;

    if ($(window).width() <= 700){
      layoutWidth = pageWidth - 10;
  	}else{
      layoutWidth = (pageWidth * widthRatio) - 10;
    }

    layout
      .width(layoutWidth)
      .height(layoutHeight)
      .animationDuration(0)
      .update()
      .animationDuration(500);
  });
};
