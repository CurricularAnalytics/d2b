var updateLayouts = function(layouts){
  var sideBarWidth = $("#sidebar").width();
  var windowHeight = $(window).height() - 90;
  var pageWrap = $("#page-wrap");
  var pageWidth = pageWrap.innerWidth();
console.log(pageWidth)
  layouts.forEach(function(layout){
    var widthRatio = layout.selection().attr('width');
    var heightRatio = layout.selection().attr('height');
    var layoutHeight = Math.max(
                        layout.selection().attr('min-height') || 0,
                        Math.min(
                          layout.selection().attr('max-height') || (heightRatio * windowHeight),
                          heightRatio * windowHeight
                        ));

    var layoutWidth;

    if ($(window).width() <= 700){
      layoutWidth = pageWidth - 16;
  	}else{
      layoutWidth = (pageWidth * widthRatio) - 16;
    }

    layout
      .width(layoutWidth)
      .height(layoutHeight)
      .update();
  });
};
