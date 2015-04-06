/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */
d2b.UTILS.dashboardCategory = function(){

  var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.selection;
  $$.chartPageSelection;
	$$.currentData;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.animateFrom = null;

  $$.charts = [];

  // $$.chartPage = new d2b.UTILS.chartPage();

  // $$.chartPage.on('update.d2b-update', function(pageData){
  //   for(key in $$.on.pageUpdate){
  //     $$.on.pageUpdate[key].call(this,pageData);
  //   }
  // });

  $$.on = {
    // update: function(){},
    pageChange: function(){},
    // pageUpdate: function(){}
  };

	$$.init = function(position){
    if($$.animateFrom || !$$.selection.currentCategory){

      $$.currentPageIndex=0;

      $$.selection.selectAll('.d2b-category').classed('d2b-category-old', true);

      $$.selection.currentCategory = $$.selection
        .append('div')
          .attr('class','d2b-category')
          .style('opacity',0)
          .style('left',position.left+'px')
          .style('top',position.top+'px');

      $$.selection.currentCategory.label = $$.selection.currentCategory
        .append('div')
          .attr('class','d2b-category-label');

      $$.selection.currentCategory.label.section = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-section');
      $$.selection.currentCategory.label.category = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-category');
      $$.selection.currentCategory.label.pages = $$.selection.currentCategory.label
        .append ('div')
          .attr('class','d2b-category-label-pages');

      // $$.selection.currentCategory.label.pages.select = $$.selection.currentCategory.label.pages
      //   .append ('select')
      //     .on('change', function(d){
      //       var selectedIndex = $$.selection.currentCategory.label.pages.select.property('selectedIndex')
      //       var pageData          = $$.selection.currentCategory.label.pages.select.option[0][selectedIndex].__data__;
      //       // $$.charts = data.charts;
      //
      //       for(key in $$.on.pageChange){
      //         $$.on.pageChange[key].call(this,pageData,$$.currentPageIndex,selectedIndex);
      //       }
      //       $$.currentPageIndex = selectedIndex;
      //
      //       // $$.chartPage
      //       //   .data(pageData)
      //       //   .animateFrom(($$.currentPageIndex < selectedIndex)? 'right' : 'left');
      //       //
      //       // category
      //       //   .animateFrom(null)
      //       //   .update();
      //     });

      $$.chartPageSelection = $$.selection.chartPage = $$.selection.currentCategory
        .append('div')
          .attr('class','d2b-chart-page-container');

      // var pageData;

      if($$.currentData.pages.length > 0){
        pageData = $$.currentData.pages[0];
        $$.selection.currentCategory.label.pages.style('display','');
      }else{
        pageData = $$.currentData;
        $$.selection.currentCategory.label.pages.style('display','none');
      }

      for(key in $$.on.pageChange){
        $$.on.pageChange[key].call(this,pageData,0,0);
      }

      // $$.chartPage
      //   .selection($$.selection.chartPage)
      //   .animateFrom(null)
      //   .data(pageData);

    }
	};

  $$.getPosition = function(){
    var position = {top:0, left:0};

    switch($$.animateFrom){
      case 'right':
        position.top = 0;
        position.left = $$.width;
        break;
      case 'left':
        position.top = 0;
        position.left = -$$.width;
        break;
      case 'top':
        position.top = -$$.computedHeight;
        position.left = 0;
        break;
      case 'bottom':
        position.top = $$.computedHeight;
        position.left = 0;
        break;
      default:
    }

    return position;
  };

	var category = {};

  category.on =	d2b.UTILS.CHARTS.MEMBERS.on(category, $$);

  category.chartPageSelection =	d2b.UTILS.CHARTS.MEMBERS.prop(category, $$, 'chartPageSelection');

  category.width = function(value){
		if(!arguments.length) return $$.width;
		$$.width = value;
		return category;
	};
  category.computedHeight = function(){
		return $$.computedHeight;
	}
  category.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return category;
	};
  category.select = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = d3.select(value);
		return category;
	};
  category.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return category;
	};
  category.animateFrom = function(value){
		if(!arguments.length) return $$.animateFrom;
		$$.animateFrom = value;
		return category;
	};

  category.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		// newData = true;
		$$.currentData = data.data;

    if(!$$.currentData.pages)
      $$.currentData.pages = [];

		return category;
	}

  category.update = function(callback){
		if(!$$.selection)
			return console.warn('category was not given a $$.selection');

		var position = $$.getPosition();

    if($$.animateFrom && $$.selection.currentCategory){
      $$.selection.oldCategory = $$.selection.currentCategory;
    }
    $$.init(position);

		$$.computedHeight = 0;

    $$.selection.currentCategory.label.section.text($$.currentData.sectionName)
    $$.selection.currentCategory.label.category.text($$.currentData.name)

    // $$.selection.currentCategory.label.pages.select.option = $$.selection.currentCategory.label.pages.select.selectAll('option').data($$.currentData.pages);
    // $$.selection.currentCategory.label.pages.select.option.enter()
    //   .append('option')
    //     .text(function(d){return d.name});

    $$.selection.currentCategory.label.pages.tab = $$.selection.currentCategory.label.pages.selectAll('.d2b-page-tab').data($$.currentData.pages);
    $$.selection.currentCategory.label.pages.tab.enter()
      .append('div')
        .attr('class','d2b-page-tab')
        .text(function(d){return d.name})
        .each(function(d,i){
          d3.select(this).classed('d2b-tab-selected', !i);
        });

    $$.selection.currentCategory.label.pages.tab
        .on('click', function(pageData, i){

          $$.selection.currentCategory.label.pages.tab.classed('d2b-tab-selected', false);
          d3.select(this).classed('d2b-tab-selected', true);

          for(key in $$.on.pageChange){
            $$.on.pageChange[key].call(this,pageData,$$.currentPageIndex,i);
          }
          $$.currentPageIndex = i;
        })

    // $$.chartPage
    //   .width($$.width)
    //   .update()
    //   .animateFrom(null);
		$$.selection.selectAll('.d2b-category-old')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.style('left',-position.left+'px')
				.style('top',-position.top+'px')
				.remove();

		$$.selection.currentCategory
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.style('left','0px')
				.style('top','0px');

		d3.timer.flush();

		if(callback){
			callback();
		}

    // for(key in $$.on.update){
    //   $$.on.update[key].call(this,$$.currentData);
    // }

		return category;
	};

	return category;
}
