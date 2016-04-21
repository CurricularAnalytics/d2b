// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery.touchSwipe.min
//= require jquery_ujs
//= require_tree .

$(document).ready(function(){
  var sidebar = $("nav#sidebar");
  sidebar.on('click', function(event){
    event.stopPropagation();
  });
  $("#sidebar-button").on('click',function(event){
    event.stopPropagation();
    sidebar.toggleClass('expanded');
  });

  var swipe = {
    allowPageScroll:"vertical",
    swipe:function(event, direction) {
      if(direction == 'right')
        sidebar.addClass('expanded');
      else if(direction == 'left')
        sidebar.removeClass('expanded');
    }
  };

  $(document).swipe(swipe);

});
