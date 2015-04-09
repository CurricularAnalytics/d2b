/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var d2b = d2b || {};

//namespace method for adding new namespaces
d2b.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = d2b;

    if (nsparts[0] === "d2b") {
        nsparts = nsparts.slice(1);
    }

    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        parent = parent[partname];
    }
    return parent;
};


/*d2b charts*/
d2b.createNameSpace("d2b.CHARTS");

/*d2b charts*/
d2b.createNameSpace("d2b.DASHBOARDS");

/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS");
/*d2b UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CHARTPAGE");

d2b.createNameSpace("d2b.UTILS.AXISCHART.TYPES");

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*d2b constants*/
d2b.createNameSpace("d2b.CONSTANTS");

d2b.CONSTANTS = {
  DEFAULTPALETTE: {primary:"rgb(42,54,82)",secondary:"rgb(11,22,47)"},
  DEFAULTWIDTH: function(){ return 960; },
  DEFAULTHEIGHT: function(){ return 540; },
  DEFAULTMARGIN: function(){ return {left:0,right:0,top:0,bottom:0}; },
  DEFAULTFORCEDMARGIN: function(){ return {left:30, bottom:20, right:30, top:20}; },
  DEFAULTCOLOR: function(){ return d3.scale.category10(); },
  DEFAULTEVENTS: function(){ return {
                            		elementMouseover:function(){},
                            		elementMouseout:function(){},
                            		elementClick:function(){}
                            	};
                },
  ANIMATIONLENGTHS: function(){ return {normal:500,short:200,long:1000}; }
}

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};

d2b.UTILS.chartLayoutAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new d2b.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);

	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */
d2b.UTILS.chartPage = function(){

  var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.selection;
	$$.currentData = {};

	$$.modifiedData = {};
	$$.dataLoaded = false;

	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.animateFrom = null;

	$$.on = {
		update: function(){}
	};

	$$.init = function(position){
    if($$.animateFrom || !$$.selection.currentPage){

			$$.selection.selectAll('.d2b-chart-page').classed('d2b-chart-page-old', true);

			$$.selection.currentPage = $$.selection
				.append('div')
					.attr('class','d2b-chart-page')
					.style('opacity',0)
					.style('left',position.left+'px')
					.style('top',position.top+'px');
		}
	};

	$$.updateGrid = function(charts){
		var chartLayout = $$.selection.currentPage.selectAll('div.d2b-page-chart-layout').data(charts, function(d, i){return d.chart.key || i;});

		var newChartLayout = chartLayout.enter()
			.append('div')
				.attr('class','d2b-page-chart-layout')
				.each(function(d){
					d2b.UTILS.chartLayoutAdapter(d.chart.type, d.chart);
					this.chart = d.chart.chart;
					this.chartLayout = d.chart.chartLayout;
					this.chartLayout
						.select(this)
						.width($$.width*d.width)
						.height(d.height)
						.animationDuration(0)
						.update(d.chart.chartLayoutData.chartCallback);
				});

		chartLayout
				.each(function(d){
					this.chart
						.data(d.chart.properties.data);
					this.chartLayout
						.animationDuration($$.animationDuration)
						.width($$.width*d.width)
						.update(d.chart.chartLayoutData.chartCallback);

				})
				.style('left',function(d){return ($$.width * d.x)+'px'})
				.style('top',function(d){return (d.y)+'px'})
				.each(function(d){
					$$.computedHeight = Math.max($$.computedHeight, d.y+d.height);
				});

		chartLayout.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		$$.selection.currentPage
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.style('left','0px')
				.style('top','0px');

	};

	var page = {};

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

	var page = {};

	page.on =				d2b.UTILS.CHARTS.MEMBERS.on(page, $$);

  page.width = function(value){
		if(!arguments.length) return $$.width;
		$$.width = value;
		return page;
	};
  page.computedHeight = function(){
		return $$.computedHeight;
	}
  page.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return page;
	};
  page.select = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = d3.select(value);
		return page;
	};
  page.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return page;
	};
  page.animateFrom = function(value){
		if(!arguments.length) return $$.animateFrom;
		$$.animateFrom = value;
		return page;
	};

  page.data = function(data, reset){
		if(!arguments.length) return $$.currentData;

		$$.currentData = data;

    if(!$$.currentData.charts)
      $$.currentData.charts = [];

    if(!$$.currentData.controls)
      $$.currentData.controls = [];

		return page;
	}

  page.update = function(callback){
		if(!$$.selection)
			return console.warn('page was not given a selection');

		var position = $$.getPosition();

    if($$.animateFrom && $$.selection.currentPage){
      $$.selection.oldPage = $$.selection.currentPage;
    }
    $$.init(position);

		$$.computedHeight = 0;

		if($$.currentData.charts.length < 1 && !$$.currentData.url){
			console.warn('chart page was not provided any charts or url');
		}else{
			$$.modifiedData.charts = $$.currentData.charts;
			$$.modifiedData.controls = $$.currentData.controls;

			var postData = {};
			$$.currentData.controls.forEach(function(d){
				postData[d.key] = d;
			});

			if($$.currentData.url){
					var my_request = d3.xhr($$.currentData.url)
					my_request.post(JSON.stringify(postData), function(error,received){
						var data = JSON.parse(received.response);
						if(data.charts)
							$$.modifiedData.charts = data.charts.concat($$.modifiedData.charts);

						$$.updateGrid($$.modifiedData.charts);
						$$.dataLoaded = true;

					});

			}else{
				$$.dataLoaded = true;
				$$.updateGrid($$.modifiedData.charts);
			}
		}

		$$.selection.selectAll('.d2b-chart-page-old')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.style('left',-position.left+'px')
				.style('top',-position.top+'px')
				.remove();

		d3.timer.flush();

		if(callback){
			callback();
		}

		for(key in $$.on.update){
			$$.on.update[key].call(this,$$.modifiedData);
		}

		return page;
	};

	return page;
}

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.CHARTPAGE.chartLayout = function(){
	var width = d2b.CONSTANTS.DEFAULTWIDTH();
	var height = d2b.CONSTANTS.DEFAULTHEIGHT();
	var selection;
	var currentChartLayoutData = {chartLayout:{}};
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var chart;
	var generateRequired = true;


	var chartLayout = {};

	chartLayout.chart = function(value){
		if(!arguments.length) return chart;
		chart = value;
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chartLayout;
	};
	chartLayout.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chartLayout;
	};
	chartLayout.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chartLayout;
	};

	chartLayout.data = function(chartLayoutData, reset){
		if(!arguments.length) return currentChartLayoutData;
		if(reset){
			currentChartLayoutData = {chartLayout:{}};
			generateRequired = true;
		}
		// currentChartLayoutData.chartLayout = chartLayoutData.data.chartLayout
		if(chartLayoutData.data.chartLayout.footnote)
			currentChartLayoutData.chartLayout.footnote = chartLayoutData.data.chartLayout.footnote;

		if(chartLayoutData.data.chartLayout.rightNotes)
			currentChartLayoutData.chartLayout.rightNotes = chartLayoutData.data.chartLayout.rightNotes;

		if(chartLayoutData.data.chartLayout.leftNotes)
			currentChartLayoutData.chartLayout.leftNotes = chartLayoutData.data.chartLayout.leftNotes;

		if(chartLayoutData.data.chartLayout.title)
			currentChartLayoutData.chartLayout.title = chartLayoutData.data.chartLayout.title;

		if(chartLayoutData.data.chartLayout.titleAlt)
			currentChartLayoutData.chartLayout.titleAlt = chartLayoutData.data.chartLayout.titleAlt;

		if(chartLayoutData.data.chartCallback)
			currentChartLayoutData.chartCallback = chartLayoutData.data.chartCallback;

		if(chartLayoutData.data.info)
			currentChartLayoutData.chartLayout.info = chartLayoutData.data.info;

		return chartLayout;
	};

	chartLayout.generate = function(callback){

		selection.selectAll('*').remove();

		selection.wrapper = selection
			.append('div')
				.attr('class','d2b-chart-layout-wrapper');

		selection.container = selection.wrapper
			.append('div')
				.attr('class','d2b-chart-layout d2b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-header');

		selection.container.header.title = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-title');

		selection.container.header.titleAlt = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-title-alt');

		selection.container.header.info = selection.container.header
			.append('div')
				.attr('class','d2b-chart-layout-info');

		selection.container.chart = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-chart');

		chart
			.selection(selection.container.chart);

		selection.container.rightNotes = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-right-notes');

		selection.container.rightNotes.ul = selection.container.rightNotes
			.append('ul');

		selection.container.leftNotes = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-left-notes');

		selection.container.leftNotes.ul = selection.container.leftNotes
			.append('ul');

		selection.container.footnote = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-footnote');
		selection.container.footnote.div = selection.container.footnote
			.append('div');

		selection.container.source = selection.container
			.append('div')
				.attr('class','d2b-chart-layout-source')
			.append('ul');


		generateRequired = false;

		var tempAnimationDuration = animationDuration;
		chartLayout
			.animationDuration(0)
			.update(callback)
			.animationDuration(tempAnimationDuration);

		return chartLayout;
	};

	chartLayout.update = function(callback){
		if(!selection)
			return console.warn('chartLayout was not given a selection');
		if(!chart)
			return console.warn('chartLayout was not given a chart');

		if(generateRequired)
			chartLayout.generate(callback);
		var chartMargin = {
			top:10,bottom:0,left:0,right:0
		};

		selection.wrapper
				.style('width',width+'px')
				.style('height',height+'px');
		selection.container.header.title
				.text(currentChartLayoutData.chartLayout.title);
		selection.container.header.titleAlt
				.text(currentChartLayoutData.chartLayout.titleAlt);

		if(currentChartLayoutData.chartLayout.title){
			selection.container.header.style('opacity',1);
			chartMargin.top+=selection.container.header.node().getBoundingClientRect().height;
		}else{
			selection.container.header.style('opacity','0');
		}

		if(currentChartLayoutData.chartLayout.info){
			selection.container.header.info.html('<i class="fa fa-info-circle"></i>');
		}else{
			selection.container.header.info.selectAll('*').remove();
		}

		selection.container.footnote.div.text(currentChartLayoutData.chartLayout.footnote);

		chartMargin.bottom+=selection.container.footnote.node().getBoundingClientRect().height;
		selection.container.footnote
				.style('top',(height-chartMargin.bottom)+'px');

		if(!currentChartLayoutData.chartLayout.rightNotes || currentChartLayoutData.chartLayout.rightNotes.length < 1){
			currentChartLayoutData.chartLayout.rightNotes = [];
		}else{
			chartMargin.right+=width * 0.2+5;
		}
		var rightNote = selection.container.rightNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.rightNotes);
		rightNote.enter()
			.append('li')
				.attr('class','d2b-chart-layout-note')
			.append('div');

		var rightNotesHeight = 0;
		rightNote.select('div')
				.text(function(d){return d})
				.each(function(d){rightNotesHeight += this.getBoundingClientRect().height;});

		rightNote.exit()
				.style('opacity',0)
				.remove();

		// var rightNotesHeight = selection.container.rightNotes.ul.node().getBoundingClientRect().height;
		selection.container.rightNotes
				.style('width',width*0.2+'px')
				.style('height',height-chartMargin.top+'px')
				.style('left',width*0.8-5+'px');
				// .style('top',(height-rightNotesHeight)/2+'px');

		rightNote
			.style('padding-top',Math.max(10,(height - rightNotesHeight)/(1.8*rightNote.size()))+'px');




		if(!currentChartLayoutData.chartLayout.leftNotes || currentChartLayoutData.chartLayout.leftNotes.length < 1){
			currentChartLayoutData.chartLayout.leftNotes = [];
		}else{
			chartMargin.left+=width * 0.2;
		}

		var leftNote = selection.container.leftNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		leftNote.enter()
			.append('li')
				.attr('class','d2b-chart-layout-note')
			.append('div');

		var leftNotesHeight = 0;
		leftNote.select('div')
				.text(function(d){return d})
				.each(function(d){leftNotesHeight += this.getBoundingClientRect().height;});

		leftNote.exit()
				.style('opacity',0)
				.remove();


				selection.container.leftNotes
						.style('width',width*0.2+'px')
						.style('left',5+'px');
						// .style('height',leftNotesHeight+'px')
						// .style('top',(height-leftNotesHeight)/2+'px');

		leftNote
			.style('padding-top',Math.max(10,(height - leftNotesHeight)/(1.8*leftNote.size()))+'px');



		// var leftNote = selection.container.leftNotes.ul.selectAll('li.d2b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		// leftNote.enter()
		// 	.append('li')
		// 		.attr('class','d2b-chart-layout-note');
		// leftNote
		// 		.text(function(d){return d});
		// leftNote.exit()
		// 		.style('opacity',0)
		// 		.remove();
		//
		//
		// var leftNotesHeight = selection.container.leftNotes.ul.node().getBoundingClientRect().height;
		// selection.container.leftNotes
		// 		.style('width',width*0.2+'px')
		// 		// .style('height',leftNotesHeight+'px')
		// 		.style('top',(height-leftNotesHeight)/2+'px');


		var chartWidth = width-chartMargin.left-chartMargin.right-10,
				chartHeight = height-chartMargin.top-chartMargin.bottom;

		selection.container.chart
				.style('left',(chartMargin.left+5)+'px')
				.style('top',chartMargin.top+'px')
				.style('width',chartWidth+'px')
				.style('height',chartHeight+'px');

		chart
				.width(chartWidth)
				.height(chartHeight)
				.animationDuration(animationDuration)
				.update(currentChartLayoutData.chartCallback);

		d3.timer.flush();

		if(callback){
			callback();
		}

		return chartLayout;
	};

	return chartLayout;
}

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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*CONTROLS UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CONTROLS");
d2b.UTILS.CONTROLS.checkbox = function(){

	var $$ = {};

	$$.scale = 5;
	$$.selection;
	$$.container;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',state:false};

	//init event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	$$.on.change = function(){};

	var control = {};

	// var onChange = function(){};

	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);

	control.checked = function(value){
		if(!arguments.length) return $$.currentData.state;
		$$.currentData.state = value;
		return control.update();
	};
	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;
		return control;
	}

	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('checkbox was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('checkbox data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var checkboxContainer = $$.selection.selectAll('g.d2b-checkbox-container').data([$$.currentData]);
		var newCheckboxContainer = checkboxContainer.enter()
			.append('g')
				.attr('class','d2b-checkbox-container')
				.on('click.d2b-click',function(d,i){
					$$.currentData.state = !$$.currentData.state;
					for(key in $$.on.change){
						$$.on.change[key].call(this,d,i,'checkbox');
					}
					control.update();
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'checkbox');

		newCheckboxContainer
			.append('rect')
				.attr('rx',1);
		newCheckboxContainer
			.append('path');

		newCheckboxContainer
			.append('text')
				.text(function(d){return d.label;});

		var checkboxTranslate = 'translate('+0.4*$$.scale+','+0.4*$$.scale+')';
		var check = checkboxContainer.select('path')
				.attr('transform',checkboxTranslate)
				.attr('d',"M"+(0.38)*$$.scale+","+1.06*$$.scale+" l"+0.7*$$.scale+","+0.5*$$.scale+" l"+0.58*$$.scale+","+(-1.19)*$$.scale+"")
				.style('stroke-width',0.25*$$.scale)
				.attr('stroke-dasharray',2.2*$$.scale)
		check
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.attr('stroke-dashoffset',($$.currentData.state)? 0 : 2.2*$$.scale);
		var box = checkboxContainer.select('rect')
				.attr('width',$$.scale*2.1+'px')
				.attr('height',$$.scale*2.1+'px')
				.attr('transform',checkboxTranslate)
				.style('stroke-width',0.25*$$.scale);

		var label = checkboxContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = label.node().getComputedTextLength();

		var padding = $$.scale;
		labelLength += padding;

		$$.computedWidth = labelLength + $$.scale*2.5;
		$$.computedHeight = $$.scale*2.9;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

d2b.UTILS.CONTROLS.radioButtons = function(){
	var $$ = {};

	$$.scale = 5;
	$$.container;
	$$.selection;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',values:[], selected:null};

	//init event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	$$.on.change = function(){};

	$$.resetValues = function(){
		$$.currentData.values.forEach(function(d){
			d.selected = false;
		});
	};

	var control = {};


	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);

	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;

		var foundSelected = false;
		$$.currentData.values.forEach(function(d){
			if(foundSelected)
				d.selected = false;

			if(d.selected){
				$$.currentData.selected = d;
				foundSelected = true;
			}
		});

		if(!foundSelected){
			$$.currentData.selected = $$.currentData.values[0];
			$$.currentData.values[0].selected = true;
		}

		return control;
	}


	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('radio buttons was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('radio buttons data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var radioButtonContainer = $$.selection.selectAll('g.d2b-radio-button-container').data($$.currentData.values, function(d){return d.label;});

		var newRadioButtonContainer = radioButtonContainer.enter()
			.append('g')
				.attr('class','d2b-radio-button-container')
				.on('click.d2b-click',function(d,i){
					$$.resetValues();
					d.selected = true;
					$$.currentData.selected = d;
					for(key in $$.on.change){
						$$.on.change[key].call($$.selection.node(),$$.currentData,i,'radio-buttons');
					}
					control.update();
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'radio-button');

		radioButtonContainer
			.attr('transform',function(d,i){
				return 'translate('+0+','+(i*3.3*$$.scale)+')'
			});

		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-inner')
			.style('fill-opacity',0);
		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-outer');

		newRadioButtonContainer.append('text')
			.text(function(d){return d.label;});

		var circleInner = radioButtonContainer.select('circle.d2b-radio-button-inner')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4);


		var circleOuter = radioButtonContainer.select('circle.d2b-radio-button-outer')
				.attr('r',$$.scale*1+'px')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4)
				.style('stroke-width',0.25*$$.scale);


		circleInner
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.style('fill-opacity',function(d){return (d.selected)? 1: 0;})
				.attr('r',function(d){return (d.selected)? $$.scale*0.5: 0;});

		var label = radioButtonContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = 0;
		label.each(function(){
			labelLength = Math.max(labelLength, this.getComputedTextLength());
		});

		$$.computedWidth = labelLength + $$.scale*3.4;
		$$.computedHeight = $$.currentData.values.length*$$.scale*3.2;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

// d2b.UTILS.CONTROLS.select = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };


//allow imbeded html for selector control
// d2b.UTILS.CONTROLS.selector = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };

d2b.UTILS.CONTROLS.htmlControls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.controlsHash = {};

	$$.selection;
	$$.scale = 5;

	$$.makeControlsHash = function(){
		$$.controlsHash = {};
		$$.currentData.controls.forEach(function(d){
			$$.controlsHash[d.key] = d;
		});
	};

	//init event object
	$$.on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		change:function(){}
	};

	var controls = {};

	controls.select = d2b.UTILS.CHARTS.MEMBERS.select(controls, $$);
	controls.width = function(value){
		if(!arguments.length) return $$.maxWidth;
		$$.maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return $$.computedHeight;
	};
	controls.computedWidth = function(){
		return $$.computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return $$.scale;
		$$.scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return controls;
	};

	controls.on =				d2b.UTILS.CHARTS.MEMBERS.on(controls, $$);

	controls.data = function(controlsData, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		$$.makeControlsHash();
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a selection');
		// console.log($$.currentData.controls)
		$$.selection.controlContainer = $$.selection.selectAll('div.d2b-control-container').data($$.currentData.controls, function(d){return d.type+'-'+d.key;});

		var newControl = $$.selection.controlContainer.enter()
			.append('div')
				.attr('class', 'd2b-control-container')

		newControl
			.append('div')
				.attr('class', 'd2b-control-label')
				.text(function(d){return d.label+':';});

		newControl
			.append('div')
				.attr('class', 'd2b-control')
				.each(function(d){
					this.control = new d2b.UTILS.CONTROLS[d.type]();
					this.control.container(d3.select(this));
				});

		$$.selection.controlContainer.control = $$.selection.controlContainer.select('.d2b-control')
			.each(function(d){
				this.control
					.scale($$.scale)
					.data(d)
					.on('change.d2b-change',function(d,i){
						for(key in $$.on.change){
							$$.on.change[key].call(this,$$.controlsHash,d,i);
						}
					})
					.update();
			});


		$$.selection.controlContainer.exit()
			// .transition()
			// 	.duration($$.animationDuration)
			// 	.style('opacity',0)
				.remove();


		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};


d2b.UTILS.CONTROLS.controls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.selection;
	$$.scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		change:function(){}
	};

	var controls = {};

	controls.width = function(value){
		if(!arguments.length) return $$.maxWidth;
		$$.maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return $$.computedHeight;
	};
	controls.computedWidth = function(){
		return $$.computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return $$.scale;
		$$.scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return controls;
	};

	controls.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return controls;
	};

	controls.data = function(controlsData, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a $$.selection');

		var xPadding = 3*$$.scale;
		var yPadding = $$.scale;
		$$.computedHeight = 0;
		$$.computedWidth = 0;

		if($$.currentData.length > 0){
			var controls = $$.selection.selectAll('g.d2b-control').data($$.currentData,function(d){return d.label+','+d.type;});

			controls.enter()
				.append('g')
					.attr('class','d2b-control')
					.each(function(d){
						d.control = new d2b.UTILS.CONTROLS[d.type]();
						d.control.selection(d3.select(this))
							.on('elementClick.d2b-click',function(d,i){
								for(key in on.elementClick){
									on.elementClick[key].call(this,d,i);
								}
							})
							.on('change.d2b-change',function(d,i){
								for(key in on.change){
									on.change[key].call(this,d,i);
								}
							})
							.on('elementMouseover.d2b-mouseover',function(d,i){
								for(key in on.elementMouseover){
									on.elementMouseover[key].call(this,d,i);
								}
							})
							.on('elementMouseout.d2b-mouseout',function(d,i){
								for(key in on.elementMouseout){
									on.elementMouseout[key].call(this,d,i);
								}
							});
					});



			var maxControlHeight = 0;
			var maxControlRowWidth = 0;
			controls.each(function(d){

				d.control.scale($$.scale).data(d.data).update();

				if(($$.computedWidth + d.control.computedWidth()) > $$.maxWidth){
					$$.computedWidth = 0;
					$$.computedHeight += maxControlHeight + yPadding;
					maxControlHeight = 0;
				}

				d3.select(this)
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform','translate('+$$.computedWidth+','+$$.computedHeight+')');
				$$.computedWidth += d.control.computedWidth() + xPadding;

				if(maxControlHeight < d.control.computedHeight()){
					maxControlHeight = d.control.computedHeight();
				}
				if(maxControlRowWidth < $$.computedWidth){
					maxControlRowWidth = $$.computedWidth;
				}
			});

			$$.computedWidth = maxControlRowWidth - xPadding;

			$$.computedHeight += maxControlHeight;
			controls.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.remove();
		}

		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*function cloner*/
Function.prototype.clone = function(){
	var that = this;
	var temp = function temporary(){return that.apply(this,arguments);};
	for(var key in this){
		if(this.hasOwnProperty(key)){
			temp[key]=this[key];
		}
	}
	return temp;
}

/*tooltop utilities*/

/*Bind Tooltip Events*/
d2b.UTILS.tooltip = function(element, heading, content){
	element
			.on('mouseover.d2b-mouseover-tooltip',function(d,i){
				d2b.UTILS.createGeneralTooltip(d3.select(this),heading(d,i),content(d,i));
			})
			.on('mouseout.d2b-mouseout-tooltip',function(d,i){
				d2b.UTILS.removeTooltip();
			});
};

d2b.UTILS.createGeneralTooltip = function(elem, heading, content){
	var body = d3.select('body');
	var adGeneralTooltip = body.append('div')
			.attr('class','d2b-general-tooltip')
			.html(heading+': '+content)
			.style('opacity',0);

	adGeneralTooltip
		.transition()
			.duration(50)
			.style('opacity',1);
	var scroll = d2b.UTILS.scrollOffset();

	var bodyWidth = body.node().getBoundingClientRect().width;
	// console.log(bodyWidth)
	var pos = {left:0,top:0};

	pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)?
								scroll.left+d3.event.clientX+10 :
								scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
	pos.top = scroll.top+d3.event.clientY-10;

	d2b.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 0);
	elem.on('mousemove',function(){
		scroll = d2b.UTILS.scrollOffset();

		pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)?
		scroll.left+d3.event.clientX+10 :
									scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
		pos.top = scroll.top+d3.event.clientY-10;

		d2b.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 50);
	});
	return adGeneralTooltip;
};
d2b.UTILS.removeTooltip = function(){
	d3.selectAll('.d2b-general-tooltip')
			.remove();
};
d2b.UTILS.moveTooltip = function(tooltip, x, y, duration){
	tooltip
		.transition()
			.duration(duration)
			.ease('linear')
			.style('opacity',1)
			.style('top',y+'px')
			.style('left',x+'px');

	d3.timer.flush();
};

/*extra utilities*/
d2b.UTILS.scrollOffset = function(){
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {top:top, left:left};
};

d2b.UTILS.getValues = function(obj){
	var values = [];
	for(var key in obj) {
		obj[key].key = key;
    values.push(obj[key]);
	}
	return values;
};

/*Axis Chart Utilities*/
d2b.createNameSpace("d2b.UTILS.AXISCHARTS");
d2b.UTILS.AXISCHARTS.getDomainLinear = function(values){
	return [(d3.min(values)<0)? d3.min(values) : 0, d3.max(values)+1]
};
d2b.UTILS.AXISCHARTS.getDomainOrdinal = function(values){
	return d3.set(values).values();
};

/*Formating Utilities*/
d2b.UTILS.niceFormat = function(value, precision){
	if(!precision)
		precision = 0;
	var format = d3.format("."+precision+"f");
	absValue = Math.abs(value);
	if(isNaN(value)){
		return value;
	}else{
		if(absValue < Math.pow(10,3))
			return format(absValue);
		else if(absValue < Math.pow(10,6))
			return format(absValue/Math.pow(10,3))+' thousand';
		else if(absValue < Math.pow(10,9))
			return format(absValue/Math.pow(10,6))+' million';
		else if(absValue < Math.pow(10,12))
			return format(absValue/Math.pow(10,9))+' billion';
		else if(absValue < Math.pow(10,15))
			return format(absValue/Math.pow(10,12))+' trillion';
		else if(absValue < Math.pow(10,18))
			return format(absValue/Math.pow(10,15))+' quadrillion';
		else if(absValue < Math.pow(10,21))
			return format(absValue/Math.pow(10,18))+' quintillion';
		else if(absValue < Math.pow(10,24))
			return format(absValue/Math.pow(10,21))+' sextillion';
		else if(absValue < Math.pow(10,27))
			return format(absValue/Math.pow(10,24))+' septillion';
		else if(absValue < Math.pow(10,30))
			return format(absValue/Math.pow(10,27))+' octillion';
		else if(absValue < Math.pow(10,33))
			return format(absValue/Math.pow(10,30))+' nonillion';
		else if(absValue < Math.pow(10,36))
			return format(absValue/Math.pow(10,33))+' decillion';
		else if(absValue < Math.pow(10,39))
			return format(absValue/Math.pow(10,36))+' undecillion';
		else if(absValue < Math.pow(10,42))
			return format(absValue/Math.pow(10,39))+' duodecillion';
		else if(absValue < Math.pow(10,45))
			return format(absValue/Math.pow(10,42))+' tredecillion';
		else if(absValue < Math.pow(10,48))
			return format(absValue/Math.pow(10,45))+' quattuordecillion';
		else if(absValue < Math.pow(10,51))
			return format(absValue/Math.pow(10,48))+' quindecillion';
		else if(absValue < Math.pow(10,54))
			return format(absValue/Math.pow(10,51))+' sexdecillion';
		else if(absValue < Math.pow(10,57))
			return format(absValue/Math.pow(10,54))+' septendecillion';
		else if(absValue < Math.pow(10,60))
			return format(absValue/Math.pow(10,57))+' octdecillion';
		else if(absValue < Math.pow(10,63))
			return format(absValue/Math.pow(10,60))+' novemdecillion';
		else if(absValue < Math.pow(10,303))
			return format(absValue/Math.pow(10,63))+' vigintillion';
		else
			return format(absValue/Math.pow(10,303))+' centillion';
	}
}

d2b.UTILS.numberFormat = function(preferences){
	var formatString = "";
	var format;
	var units = {
		before:(preferences.units.before)?preferences.units.before:"",
		after:(preferences.units.after)?preferences.units.after:"",
	}
	if(preferences.nice){
		return function(value){return units.before + d2b.UTILS.niceFormat(value, preferences.precision) + units.after};
	}else if(preferences.siPrefixed){
		if(preferences.precision>-1){
			formatString += "."+preferences.precision;
		}
		formatString += "s";
	}else{
		if(preferences.separateThousands){
			formatString += ",";
		}
		if(preferences.precision>-1){
			formatString += "."+preferences.precision+"f";
		}
	}

	format = d3.format(formatString)

	return function(value){
		if(isNaN(value))
			return units.before+value+units.after;
		else
			return units.before+format(value)+units.after;
	}
};

d2b.UTILS.textWrap = function(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};


/*Custom Tweens*/
d2b.createNameSpace("d2b.UTILS.TWEENS");
//arc tween from this.oldArc to this.newArc
d2b.UTILS.TWEENS.arcTween = function(transition, arc){
	transition.attrTween("d",function(d){
		var _self = this;
		var interpolator = d3.interpolate(_self.oldArc,_self.newArc)
		function tween(t){
			_self.oldArc = interpolator(t);
			return arc(_self.oldArc);
		}
		return tween;
	});
};

/*Events*/
d2b.UTILS.bind = function(mainKey, element, _chart, data, index, type){
	for(key in _chart.on[mainKey]){
		_chart.on[mainKey][key].call(element,data,index,type);
	}
}
d2b.UTILS.bindElementEvents = function(element, _chart, type){
	element
			.on('mouseover.d2b-element-mouseover',function(d,i){
				d2b.UTILS.bind('elementMouseover', element, _chart, d, i, type)
			})
			.on('mouseout.d2b-element-mouseout',function(d,i){
				d2b.UTILS.bind('elementMouseout', element, _chart, d, i, type)
			})
			.on('click.d2b-element-click',function(d,i){
				d2b.UTILS.bind('elementClick', element, _chart, d, i, type)
			});
}

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
d2b.createNameSpace("d2b.UTILS.LEGENDS");
d2b.UTILS.LEGENDS.legend = function(){
	var maxWidth = d2b.CONSTANTS.DEFAULTWIDTH(), maxHeight = d2b.CONSTANTS.DEFAULTHEIGHT();
	var innerMaxHeight, innerMaxWidth;
	var items = [];
	var color = d2b.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentLegendData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var orientation = 'horizontal';
	var padding = 5;
	var active = false;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		elementDblClick:function(){}
	};

	var itemEnter = function(){

				computedHeight = 0;
				computedWidth = 0;

				innerMaxHeight = maxHeight - padding*2;
				innerMaxWidth = maxWidth - padding*2;


				selection.item = selection.selectAll('g.d2b-legend-item')
						.data(currentLegendData.items, function(d){return d.label;});

				var newItem = selection.item.enter()
					.append('g')
						.attr('class','d2b-legend-item')
						.style('opacity',0)
						.on('mouseover.d2b-mouseover',function(d,i){
							d.hovered = true;
							var elem = d3.select(this);
							if(active){
								if(d.open){
									elem.select('circle.d2b-legend-circle-foreground')
										.transition()
											.duration(animationDuration/3)
											.style('fill-opacity', 0.4);
								}else{
									elem.select('circle.d2b-legend-circle-background')
										.transition()
											.duration(animationDuration/3)
											.attr('r',scale*1.5);
								}
							}

							for(key in on.elementMouseover){
								on.elementMouseover[key].call(this,d,i);
							}
						})
						.on('mouseout.d2b-mouseout',function(d,i){
							d.hovered = false;
							var elem = d3.select(this);

							elem.select('circle.d2b-legend-circle-foreground')
								.transition()
									.duration(animationDuration/3)
									.style('fill-opacity', function(d){
										if(d.open)
											return 0;
										else
											return 0.8;
									});
							elem.select('circle.d2b-legend-circle-background')
								.transition()
									.duration(animationDuration/3)
									.attr('r',scale);

							for(key in on.elementMouseout){
								on.elementMouseout[key].call(this,d,i);
							}
						})
						.on('click.d2b-click',function(d,i){
							for(key in on.elementClick){
								on.elementClick[key].call(this,d,i);
							}
						})
						.on('dblclick.d2b-dblClick',function(d,i){
							for(key in on.elementDblClick){
								on.elementDblClick[key].call(this,d,i);
							}
						});

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-background')
					.style('stroke',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label));});

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-foreground')
					.style('fill',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label))});

				newItem.append('text')
						.text(function(d){return d.label;});

	};

	var updateElements = function(){

				var circleBackground = selection.item.select('circle.d2b-legend-circle-background');

				circleBackground
					.transition()
						.duration(animationDuration/3)
						.style('stroke-width', scale/4)
						.attr('y',scale/2)
						.attr('r',function(d){
							if(d.open)
								return scale;
							else
								return (d.hovered)?scale*1.5:scale;
						});

				var circleForeground = selection.item.select('circle.d2b-legend-circle-foreground');

				circleForeground
					.transition()
						.duration(animationDuration/3)
						.attr('r',scale)
						.attr('y',scale/2)
						.style('fill-opacity', function(d){
							if(d.open)
								return (d.hovered)?0.4:0;
							else
								return 0.8;
						})
						.attr('r',function(d){
							if(d.open)
								return scale * 0.5;
							else
								return scale;
						});

				selection.item.classed('d2b-active', (active)? true:false)

				selection.item.text = selection.item.select('text')
						.style('font-size',scale*2.5+'px')
						.attr('x',scale*2)
						.attr('y',scale);

	};

	var updatePositions = function(){

		var xCurrent = scale + padding;
		var yCurrent = scale + padding;
		var maxItemLength = 0;
		var maxY = 0;

		if(currentLegendData.items.length > 0){

			if(orientation == 'vertical'){

				selection.item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							var position = 'translate('+xCurrent+','+yCurrent+')';

							if(yCurrent > maxY)
								maxY = yCurrent

							yCurrent += scale*4;
							maxItemLength = Math.max(maxItemLength,d3.select(this).select('text').node().getComputedTextLength());
							if(yCurrent + scale > innerMaxHeight){
								yCurrent = scale + padding;
								xCurrent += maxItemLength + scale * 6;
								maxItemLength = 0;
							}
							return position;
						});

				computedWidth = xCurrent + maxItemLength + scale*2 + padding;
				computedHeight = maxY + scale + padding;

			}else{

			  var maxItemLength = 0;
				selection.item.text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += scale*6;
				var itemsPerRow = Math.floor((innerMaxWidth+3*scale)/maxItemLength);

				selection.item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							if(i%itemsPerRow == 0 && i > 0){
								xCurrent = scale + padding;
								yCurrent += scale*4
							}
							var position = 'translate('+xCurrent+','+yCurrent+')';
							xCurrent += maxItemLength;
							return position;
						});

				computedHeight = yCurrent + scale + padding;
				computedWidth = (selection.item.size() > itemsPerRow)?
															maxItemLength * itemsPerRow - 3*scale + padding*2
															:
															maxItemLength * selection.item.size() - 3*scale + padding*2;

			}

		}
	};

	var itemExit = function(){
		selection.item.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};

	var legend = {};

	legend.items = function(value){
		if(!arguments.length) return items;
		items = value;
		return legend;
	};
	legend.padding = function(value){
		if(!arguments.length) return padding;
		padding = value;
		return legend;
	};
	legend.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return legend;
	};
	legend.height = function(value){
		if(!arguments.length) return maxHeight;
		maxHeight = value;
		return legend;
	};
	legend.computedHeight = function(){
		return computedHeight;
	}
	legend.computedWidth = function(){
		return computedWidth;
	}
	legend.color = function(value){
		if(!arguments.length) return color;
		color = value;
		return legend;
	};
	legend.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return legend;
	};
	legend.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		return legend;
	};
	legend.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return legend;
	};
	legend.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return legend;
	};
	legend.orientation = function(value){
		if(!arguments.length) return orientation;
		orientation = value;
		return legend;
	};
	legend.active = function(value){
		if(!arguments.length) return active;
		active = value;
		return legend;
	};

	legend.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return legend;
	};

	legend.data = function(legendData, reset){
		if(!arguments.length) return currentLegendData;
		currentLegendData = legendData.data;
		// will tackle deal with sorting options later
		// currentLegendData.items.sort(function(a,b){return d3.ascending(a.label,b.label)})

		return legend;
	}

	legend.update = function(callback){
		if(!selection)
			return console.warn('legend was not given a selection');

		itemEnter();
		updateElements();
		updatePositions();
		itemExit();

		if(callback)
			callback();

		return legend;
	};

	return legend;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.breadcrumbs = function(){
	var maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	var color = d2b.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentBreadcrumbsData = {items:[]};
	var computedWidth=0, computedHeight=0;
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	var breadcrumbs = {};

	breadcrumbs.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return breadcrumbs;
	};
	breadcrumbs.computedHeight = function(){
		return computedHeight;
	};
	breadcrumbs.computedWidth = function(){
		return computedWidth;
	};
	breadcrumbs.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return breadcrumbs;
	};
	breadcrumbs.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return breadcrumbs;
	};
	breadcrumbs.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return breadcrumbs;
	};

	breadcrumbs.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return breadcrumbs;
	};

	breadcrumbs.data = function(breadcrumbsData, reset){
		if(!arguments.length) return currentBreadcrumbsData;
		currentBreadcrumbsData = breadcrumbsData.data;
		return breadcrumbs;
	}

	breadcrumbs.update = function(callback){
		if(!selection)
			return console.warn('breadcrumbs was not given a selection');

		if(callback){
			callback;
		}

		selection.breadcrumb = selection.selectAll('g.d2b-breadcrumb').data(currentBreadcrumbsData.items, function(d){return (d.key)? d.key : i;});

		var newBreadcrumbs = selection.breadcrumb.enter()
			.append('g')
				.attr('class','d2b-breadcrumb')
				.style('opacity',0);

		newBreadcrumbs.append('path');
		newBreadcrumbs.append('text');

		var breadcrumbIndentSize = scale;
		var padding = scale;
		var breadcrumbHeight = scale * 4;
		selection.breadcrumb.text = selection.breadcrumb.select('text')
				.text(function(d){return d.label;})
				.attr('x',padding+breadcrumbIndentSize)
				.attr('y',scale*2.9)
				.style('font-size',scale*2.5+'px');
		selection.breadcrumb.path = selection.breadcrumb.select('path');

		var bcOffset = 0;
		selection.breadcrumb.each(function(d,i){
			var bc = d3.select(this);
			bc.text = bc.select('text');
			bc.path = bc.select('path')
			var pathWidth = bc.text.node().getComputedTextLength() + padding*2 + breadcrumbIndentSize;

			var leftIndent = breadcrumbIndentSize
			var rightIndent = breadcrumbIndentSize;


			if(i==0){
				leftIndent = 0;
			}
			if(i==selection.breadcrumb.size()-1){
				rightIndent = 0;
			}

			bc.path
				.transition()
					.duration(animationDuration/2)
					.attr('d','M 0 0 L '+(leftIndent)+' '+breadcrumbHeight/2+' L 0 '+breadcrumbHeight+' L '+pathWidth+' '+breadcrumbHeight+' L '+(pathWidth+rightIndent)+' '+breadcrumbHeight/2+' L '+pathWidth+' 0 L 0 0 Z');


			bc
				.transition()
					.duration(animationDuration/2)
					.style('opacity',1)
					.attr('transform','translate('+(bcOffset)+',0)');

			bcOffset+=breadcrumbIndentSize + pathWidth;



		});

		computedHeight = breadcrumbHeight;

		selection.breadcrumb.exit()
			.transition()
				.duration(animationDuration/4)
				.style('opacity',0)
				.remove();

		return breadcrumbs;
	};

	return breadcrumbs;
};

d2b.createNameSpace("d2b.UTILS.CHARTS.MEMBERS");

d2b.UTILS.CHARTS.MEMBERS.on = function(chart, $$, callback){
  return function(key, value){
		key = key.split('.');
		if(!arguments.length) return $$.on;
		else if(arguments.length == 1){
			if(key[1])
				return $$.on[key[0]][key[1]];
			else
				return $$.on[key[0]]['default'];
		};

		if(key[1])
      $$.on[key[0]][key[1]] = value;
		else
      $$.on[key[0]]['default'] = value;

    if(callback)
      callback(value);

		return chart;
	};
};

d2b.UTILS.CHARTS.MEMBERS.events = function(chart, $$, callback){
  return function(key, listener){
    // key = key.split('-');
    // if(!arguments.length) return $$.on;
    //
    // var registry = $$.on;
    // var i;
    // for(i = 0; i < key.length-1; i++)
    //   registry = registry[key[i]];
    //
    // registry[key[key.length-1]] = listener;

	// 	key = key.split('.');
	// 	if(!arguments.length) return $$.on;
	// 	else if(arguments.length == 1){
	// 		if(key[1])
	// 			return $$.on[key[0]][key[1]];
	// 		else
	// 			return $$.on[key[0]]['default'];
	// 	};
  //
	// 	if(key[1])
  //     $$.on[key[0]][key[1]] = value;
	// 	else
  //     $$.on[key[0]]['default'] = value;
  //
  //   if(callback)
  //     callback(value);
  //
		return chart;
	};
};

d2b.UTILS.CHARTS.MEMBERS.select = function(chart, $$, callback){
  return function(value){

    $$.selection = d3.select(value);
    if(callback)
      callback(value);
		return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.prop = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = value;
    if(callback)
      callback(value);
    return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.scale = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    if(value.type){
      $$[property].type = value.type;
      var type = $$[property].type.split(',');
      if(type[0] == 'quantitative')
        $$[property].scale = d3.scale[type[1]]();
      else if(type[0] == 'time')
        $$[property].scale = d3[type[0]].scale();
      else
        $$[property].scale = d3.scale[type[0]]();
    }

    if(value.domain){
      $$[property].domain = value.domain;
      $$[property].scale.domain($$[property].domain);
    }

    $$[property].hide = value.hide;

    $$[property].invert = value.invert;

    if(callback)
      callback(value);
    return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.format = function(chart, $$, property, callback){
  return function(value){
    if(!arguments.length) return $$[property];
    $$[property] = d2b.UTILS.numberFormat(value);
    if(callback)
      callback(value);
    return chart;
  }
};

d2b.UTILS.CHARTS.MEMBERS.controls = function(chart, $$, callback){
  return function(value){
    if(!arguments.length) return $$.controlsData;
    for(control in value){
      for(controlProp in value[control]){
        $$.controlsData[control][controlProp] = value[control][controlProp];
      }
    }
    if(callback)
      callback(value);
    return chart;
  }
};

d2b.createNameSpace("d2b.UTILS.CHARTS.HELPERS");
d2b.UTILS.CHARTS.HELPERS.updateLegend = function(_chart){
  var legendPadding = 10;
  if(_chart.legendOrientation == 'right' || _chart.legendOrientation == 'left'){
    _chart.legend.orientation('vertical').data(_chart.legendData).height(_chart.innerHeight).update();
  }
  else{
    _chart.legend.orientation('horizontal').data(_chart.legendData).width(_chart.innerWidth).update();
  }

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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sunburst chart*/
d2b.CHARTS.sunburstChart = function(){


	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = { data: { partition:{}}};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();

	//breacrumbs OBJ
	$$.breadcrumbs = new d2b.UTILS.breadcrumbs();
	$$.breadcrumbs.scale(6)

	//partitioned sunburst data
	$$.partitionData;

	//current root node
	$$.currentRoot;

	//new data indicator
	$$.newData = true;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	//radius scales
	$$.radius = {};

	//sunburst arc width scales
	$$.y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	//arc length scale
	$$.x = d3.scale.linear()
    .range([0, 2 * Math.PI]);


	//controls data
	$$.controlsData = {
				invert: {
					label: "Invert",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sort: {
					label: "Sort",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	// private methods

	//find the ancesstors of a given node
	$$.getAncestors = function(node) {
	  var path = [];
	  var current = node;

	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
    path.unshift(current);

	  return path;
	};

	//set arc fill color to coordinate with the closest 'top' parent
	$$.arcFill = function(d) {
		var sequence = $$.getAncestors(d).reverse();
		for(i=0;i<sequence.length;i++){
			if(sequence[i].top){
				return d3.rgb($$.color(sequence[i].name)).brighter(i*0.1);
			}
		}
		return $$.color(d.name)
	};

	//on arc mouseover highlight the parent tree
	$$.arcMouseover = function(d) {

		var sequence = $$.getAncestors(d);

		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) >= 0);
	              })
			.transition()
				.duration($$.animationDuration/7)
				.style('opacity',1)
		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) < 0);
	              })
			.transition()
				.duration($$.animationDuration/7)
				.style('opacity',0.4)

		$$.updateBreadcrumbs(sequence);

	};

	//on children mouseover set tooltip
	$$.arcMouseover.children = function(d){
			$$.setSunburstTooltip(d,true);
	};

	//on parents mouseover set tooltip
	$$.arcMouseover.parents = function(d){
			$$.setSunburstTooltip(d,false);
	};

	//on sunburst mouseout reset breadcrumbs, tooltip, and arc highlighting
	$$.sunburstMouseout = function(d) {
		$$.resetBreadcrumbs();
	  $$.selection.arcs.arc
			.transition()
				.duration($$.animationDuration/5)
				.style('opacity',1);

		$$.resetSunburstTooltip();
	};

	//reset tooltip
	$$.resetSunburstTooltip = function(){
		$$.setSunburstTooltip($$.currentRoot, false);
	};

	//set tooltip
	$$.setSunburstTooltip = function(d, showPercent){
		var tspanName = d.name;
		var tspanValue = $$.xFormat(d.value);
		if(showPercent)
			tspanValue += ' / ' + d3.format(".2%")(d.value/$$.currentRoot.value);

		$$.selection.tooltip.text.selectAll('*').remove();

		$$.selection.tooltip.text
			.append('tspan')
				.text(tspanName);
		$$.selection.tooltip.text
			.append('tspan')
				.attr('y',30)
				.attr('x',0)
				.text(tspanValue);
	};

	//on arc click change root node to clicked node and update arcs
	$$.arcClick = function(d){
		$$.currentRoot = d;
		$$.updateArcs();
	};

	//get domain functions
	$$.getZoomParentDomain = function(d){
		var cur = d;
		var domain = [1,0];
		do{
			if(domain[0] > cur.y)
				domain[0] = cur.y;
			if(domain[1] < cur.y + cur.dy)
				domain[1] = cur.y + cur.dy;
			cur = cur.parent;
		}while(cur);
		return domain;
	};

	$$.getZoomChildDomain = function(d, domain){
		if(!domain){domain = [1,0];}
		else{
			if(domain[0] > d.y)
				domain[0] = d.y;
			if(domain[1] < d.y + d.dy)
				domain[1] = d.y + d.dy;
		}

		if(d.children){
			d.children.forEach(function(child){
				return $$.getZoomChildDomain(child,domain);
			});
		}

		return domain;

	};

	//update arcs
	$$.updateArcs = function(){
		var sequence = $$.getAncestors($$.currentRoot);
		var paths = {};

		//filter parent paths
		paths.parents = $$.selection.arcs.arc.path
			.filter(function(node) {
        return (sequence.indexOf(node) >= 0);
      }).on('mouseover.updateTooltip',$$.arcMouseover.parents);


		//set scale domains
		$$.x.domain([$$.currentRoot.x,$$.currentRoot.x + $$.currentRoot.dx]);
		$$.y.parents.domain($$.getZoomParentDomain($$.currentRoot));
		$$.y.children.domain($$.getZoomChildDomain($$.currentRoot));

		var yDomain = {};

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.parents.each(function(d){
				this.newArc = {
					start: $$.x(d.x),
					end: $$.x(d.x + d.dx),
					inner: $$.y.parents(d.y),
					outer: $$.y.parents(d.y + d.dy)
				};
				if(!this.oldArc){
					this.oldArc = {
						start: this.newArc.start,
						end: this.newArc.start,
						inner: this.newArc.inner,
						outer: this.newArc.outer
					};
				}
		});

		//filter child paths
		paths.children = $$.selection.arcs.arc.path
			.filter(function(node) {
				return (sequence.indexOf(node) < 0);
			}).on('mouseover.updateTooltip',$$.arcMouseover.children);

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.children.each(function(d){

			this.newArc = {
				start: $$.x(d.x),
				end: $$.x(d.x + d.dx),
				inner: $$.y.children(d.y),
				outer: $$.y.children(d.y + d.dy)
			};

			if(!this.oldArc){
				this.oldArc = {
					start: this.newArc.start,
					end: this.newArc.start,
					inner: this.newArc.inner,
					outer: this.newArc.outer
				};
			}
		});


		//exit arcs (fade/tween out and remove)
		$$.selection.arcs.arc.exit()
			.transition()
				.duration($$.animationDuration*1.5)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d) {
					this.newArc = {
						start: this.oldArc.start,
						end: this.oldArc.start,
						inner: this.oldArc.inner,
						outer: this.oldArc.outer
					};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				// .attrTween("d", $$.arcTween);

		//tween paths to new positions
		var pathTransition = $$.selection.arcs.arc.path
			.transition()
				.duration($$.animationDuration*1.5)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				// .attrTween("d", $$.arcTween);


		//update oldArc to be newArc
		pathTransition
			.each("end",function(d) {
				this.oldArc = this.newArc;
			});

	};

	$$.setupNewData = function(){
		var partition;
		$$.newData = false;

		if($$.controlsData.sort.enabled){
			partition = d3.layout.partition()
						.value(function(d) { return d.size; });
		}else{
			partition = d3.layout.partition()
						.value(function(d) { return d.size; }).sort(function(a,b){return a.index - b.index;});
		}

		$$.partitionData = partition.nodes($$.currentChartData.partition);

		var topNodes = $$.partitionData.filter(function(d){return d.top;});
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items: d3
									.set(topNodes.map(function(d){return d.name;}))
									.values()
									.map(function(d){return {label:d};})
				}
			};
		}
	};

	// //arc tween from old arc to new arc
	// $$.arcTween = function(d){
	// 	var _self = this;
	// 	var interpolator = d3.interpolate(_self.oldArc,_self.newArc)
	// 	function tween(t){
	// 		_self.oldArc = interpolator(t);
	// 		return $$.arc(_self.oldArc);
	// 	}
	// 	return tween;
	// };

	//reset the breadcrumbs
	$$.resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();
	};

	//save children indicies recursively for sorting/unsorting
	$$.saveIndicies = function(node){
		if(node.children){
			node.children.forEach(function(d,i){
				d.index = i;
				$$.saveIndicies(d);
			});
		}
	};

	//update the breadcrumbs based on a parent sequence
	$$.updateBreadcrumbs = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();

		var breadcrumbsSelection = $$.breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			.attr('stroke-width',2)
			.attr('stroke',function(d){return $$.arcFill(d.data);});

	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);


	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
			$$.generateRequired = true;
		}
		$$.newData = true;
		$$.currentChartData = chartData.data;
		$$.saveIndicies($$.currentChartData.partition);
		$$.currentRoot = $$.currentChartData.partition;
		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst')
				.on('mouseout.d2b-mouseout', $$.sunburstMouseout);


		$$.selection.arcs = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-arcs');

		$$.selection.tooltip = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-tooltip');

		$$.selection.tooltip.text = $$.selection.tooltip
			.append('text');

		//create breadcrumbs container
		$$.selection.breadcrumbs = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst-breadcrumbs');

		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						$$.newData = true;
					}
					chart.update();
				});

		//intialize new legend
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//intialize new legend
		$$.breadcrumbs
				.selection($$.selection.breadcrumbs);

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		if($$.newData){
			$$.setupNewData();
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		$$.selection.breadcrumbs
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//reposition the controls
		$$.selection.controls
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left + $$.innerWidth - $$.controls.computedWidth())+','+($$.forcedMargin.top)+')');

		$$.breadcrumbs.width($$.innerWidth).update();
		// $$.forcedMargin.top += Math.max($$.breadcrumbs.computedHeight(), $$.controls.computedHeight());
		$$.forcedMargin.top += $$.breadcrumbs.computedHeight();

		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left+$$.innerWidth/2)+','+($$.forcedMargin.top+$$.innerHeight/2)+')');

		$$.radius.outer = Math.min($$.innerWidth,$$.innerHeight)/2-20;
		$$.radius.inner = $$.radius.outer/3;


		if(!$$.controlsData.invert.enabled){
			$$.y.children.range([$$.radius.inner + 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.outer]);
			$$.y.parents.range([$$.radius.inner, $$.radius.inner + 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}else{
			$$.y.children.range([$$.radius.outer - 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.inner]);
			$$.y.parents.range([$$.radius.outer, $$.radius.outer - 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll("g.sunburst-arc")
		    .data($$.partitionData,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return $$.getAncestors(d).map(function(d){return d.name}).join('-');
					})
		// sunburst_mouseout();
		var newArcs =	$$.selection.arcs.arc.enter().append("g")
			.attr('class','sunburst-arc')
			.style('opacity',0)
			.call(d2b.UTILS.bindElementEvents, $$, 'arc');

		var newPaths = newArcs.append("path")
				.on('mouseover.d2b-mouseover',$$.arcMouseover);

		$$.selection.arcs.arc
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);


		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
				.style('fill',$$.arcFill);

		$$.selection.arcs.arc.path
				.on('click.d2b-click',$$.arcClick)
				.classed('d2b-pointer-element',true);

		$$.updateArcs();

		$$.resetSunburstTooltip();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

///////TODO - Change circle packing to custom algorithm that uses cluster packing rather than d3.force layout

/*bubble chart*/
d2b.CHARTS.bubbleChart = function(){

	//define chart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT(),
			svgHeight = height-55;

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new d2b.UTILS.LEGENDS.legend(),
	  	horizontalControls = new d2b.UTILS.CONTROLS.controls(),
			legendOrientation = 'right';

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};

	var xFormat = function(value){return value};

	var current = {grouping:null,colorGrouping:null};

	var changeLegendWidth = 250;

	//scales for bubble radius, change color, change legend, change axis, change group axis
	var r = d3.scale.linear(),
			colorChange = d3.scale.threshold()
				.domain([-0.25, -0.05, -0.001, 0.001, 0.05, 0.25])
				.range(['#d84b2a', '#ee9586', '#e4b7b2', '#888', '#beccae', '#9caf84', '#7aa25c']),
			changeScaleLegend = d3.scale.ordinal()
				.domain([-1, -0.25, -0.05, 0.0, 0.05, 0.25, 1])
				.rangeBands([0,changeLegendWidth]),
			changeScaleAxis = d3.scale.linear()
				.domain([-0.25, 0.25]),
			changeGroupsScale = d3.scale.ordinal();

	//define scales for bubble group placement and font-size
	var groupsScales = {
		x:d3.scale.ordinal(),
		y:d3.scale.ordinal(),
		fontSize:d3.scale.linear().range([10, 30]).domain([0, 500])
	};


	var longestGroupsTick = 0;

	var formatPercent = d3.format("%");

	//change axis init and tick formatting
	var changeAxis = d3.svg.axis().orient("top")
			.tickFormat(function(d){
				if(d>0.25 || d<-0.25)
					return '';

				if(controls.sortByChange.enabled){
					if(d==0.25)
					  return formatPercent(d)+' or higher';
					else if(d==-0.25)
					  return formatPercent(d)+' or lower';
				}

				return formatPercent(d);
			}),
			groupsAxis = d3.svg.axis().scale(changeGroupsScale).orient("left");

	//init controls to all invisible and disabled
	var controls = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sortByChange: {
					label: "Sort By Change",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				colorByChange: {
					label: "Color By Change",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};


	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	//on force Tick, compute new node positions
	var forceTick = function(e){
		  var k = e.alpha * 0.095;
			this.nodeElements.each(function(d, i) {
				if(d.group){
					d.y += (d.group.focus.y - d.y) * k;
					d.x += (d.group.focus.x - d.x) * k;
				}
	    });
			// this.nodeElements
			// 	.transition()
			// 		.duration(10)
			// 		.ease('linear')
			// 		.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'});
	}

	// update the grouping for all nodes
	var updateNodeGrouping = function(grouping, type){
		if(!type)
			type = "grouping";
		currentChartData.nodes.forEach(function(d,i){
			d[type] = grouping;
		});
	};

	// update the visual group that each node resides in
	var updateNodeGroup = function(grouping){
		currentChartData.nodes.forEach(function(d,i){
			d.group = current.grouping.groups[d.enrollments[d.grouping.index]];
		});
	}

	// update the bubble radius based on total value of the grouping and the chart dimensions
	var updateRadiusScale = function(grouping){
		r
			.range([0,Math.min(innerHeight,innerWidth)/4])
			.domain([0,Math.sqrt(grouping.total/Math.PI)]);
	};

	// special radius function to calculate the radius from the area-value input
	var radius = function(value){
		return Math.max(3,r(Math.sqrt(value/Math.PI)));
	};

	//update the top buttons
	var updateGroupingButtons = function(){
		/*Make grouping buttons*/
		selection.buttonsWrapper.buttons.button = selection.buttonsWrapper.buttons.selectAll('ul').data(currentChartData.groupings, function(d,i){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000)
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});
		var newButton = selection.buttonsWrapper.buttons.button.enter()
			.append('ul');

		newButton.append('li')
			.attr('class','d2b-button')
			.on('click.d2b-click',function(d,i){
				current.grouping = d;
				updateNodeGrouping(d);
				updateNodeGroup();
				chart.update();
				for(key in on.elementClick){
					on.elementClick[key].call(this,d,i,'grouping-button');
				}
			})
			.on('mouseover.d2b-mouseover', function(d,i){
				for(key in on.elementMouseover){
					on.elementMouseover[key].call(this,d,i,'grouping-button');
				}
			})
			.on('mouseout.d2b-mouseout', function(d,i){
				for(key in on.elementMouseout){
					on.elementMouseout[key].call(this,d,i,'grouping-button');
				}
			});
		newButton.append('li')
			.attr('class','d2b-color-button')
			.on('click.d2b-click',function(d,i){
				current.colorGrouping = d;
				updateNodeGrouping(d, "colorGrouping");
				chart.update();
				for(key in on.elementClick){
					on.elementClick[key].call(this,d,i,'color-by-grouping-button');
				}
			})
			.on('mouseover.d2b-mouseover', function(d,i){
				for(key in on.elementMouseover){
					on.elementMouseover[key].call(this,d,i,'color-by-grouping-button');
				}
			})
			.on('mouseout.d2b-mouseout', function(d,i){
				for(key in on.elementMouseout){
					on.elementMouseout[key].call(this,d,i,'color-by-grouping-button');
				}
			});

		selection.buttonsWrapper.buttons.button.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

		selection.buttonsWrapper.buttons.button.grouping = selection.buttonsWrapper.buttons.button.select('li.d2b-button')
				.text(function(d){return d.label;})
				.classed('d2b-selected',function(d,i){return d == current.grouping;});

		selection.buttonsWrapper.buttons.button.color = selection.buttonsWrapper.buttons.button.select('li.d2b-color-button')
				.html('<i class="fa fa-paint-brush"></i>')
				.classed('d2b-selected',function(d,i){return d == current.colorGrouping;});
	};


	// update controls
	var updateControls = function(){
		//update controls
		var controlsData = d2b.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.data(controlsData).width(innerWidth).update();

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left + innerWidth - horizontalControls.computedWidth())+','+(forcedMargin.top)+')');
	};

	//update main legend
	var updateLegend = function(){
		//main legend
		var legendData;
		if(controls.hideLegend.enabled){
			legendData = {data:{items:[]}};
		}else if(controls.colorByChange.enabled){
			legendData = {
				data:{
					items:	[]
				}
			};
		}else if(current.colorGrouping.hideLegend){
			legendData = {data:{items:[]}};
		}else{
			legendData = {
				data:{
					items:	d3
										.set(current.grouping.nodes.map(function(d){return d.enrollments[d.colorGrouping.index];}))
										.values()
										.map(function(d){
											if(d == 'null')
												return {label:'Non-'+current.colorGrouping.label};
											else
												return {label:d};
											})
				}
			};
		}

		innerHeight = svgHeight - forcedMargin.top - forcedMargin.bottom;

		if(legendOrientation == 'right' || legendOrientation == 'left'){
			legend.orientation('vertical').data(legendData).height(innerHeight).update();
		}
		else{
			legend.orientation('horizontal').data(legendData).width(innerWidth).update();
		}

		var legendTranslation;
		if(legendOrientation == 'right')
			legendTranslation = 'translate('+(forcedMargin.left+innerWidth-legend.computedWidth())+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'left')
			legendTranslation = 'translate('+(forcedMargin.left)+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'top')
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+forcedMargin.top+')';
		else
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(innerHeight+forcedMargin.top-legend.computedHeight())+')';

		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform',legendTranslation);

	};

	//update views, sort by change / sort by grouping
	var updateViews = function(){

		if(controls.sortByChange.enabled || controls.colorByChange.enabled){
				selection.changeAxis
					.transition()
						.duration(animationDuration)
						.style('opacity',1);
		}

		if(controls.sortByChange.enabled || !controls.colorByChange.enabled){
				selection.changeAxis.legend
					.transition()
						.duration(animationDuration)
						.style('opacity',0);
		}
		if(controls.sortByChange.enabled){
			selection.group.groups
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
		}else{
				updateGroups();
				selection.group.groups
					.transition()
						.duration(animationDuration)
						.style('opacity',1);
		}

		if(controls.colorByChange.enabled){
			selection.buttonsWrapper.buttons.button.color.style('display','none');
		}else{
			selection.buttonsWrapper.buttons.button.color.style('display','block');
		}

		longestGroupsTick = 0;
		if(controls.sortByChange.enabled){
			changeGroupsScale.domain(Object.keys(current.grouping.groups)).rangeBands([0,innerHeight-60]);

			selection.groupsAxis
					.call(groupsAxis);


			selection.groupsAxis.selectAll('.tick text').each(function(d){
				if(longestGroupsTick < this.getComputedTextLength())
					longestGroupsTick = this.getComputedTextLength();
			})

			groupsAxis.tickSize(-innerWidth+forcedMargin.left + longestGroupsTick);

			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.call(groupsAxis)
					.style('opacity',1)
					.attr('transform','translate('+(forcedMargin.left + longestGroupsTick -20)+','+(forcedMargin.top+60)+')');


			changeScaleAxis
				.range([0,innerWidth-80-longestGroupsTick]);
			changeAxis
					.tickSize(-innerHeight+30)
					.scale(changeScaleAxis);
			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',1)
					.attr('transform','translate('+(forcedMargin.left+30+longestGroupsTick)+','+(20+forcedMargin.top + horizontalControls.computedHeight())+')')
			selection.changeAxis.axis
				.transition()
					.duration(animationDuration)
					.call(changeAxis);


		}else if(controls.colorByChange.enabled){
			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
			selection.changeAxis.legend
				.transition()
					.delay(animationDuration/4)
					.duration(animationDuration)
					.style('opacity',1);
			changeAxis
					.tickSize(15)
					.scale(changeScaleLegend);

			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',1)
					.attr('transform','translate('+(width -changeLegendWidth- 20)+','+(20+forcedMargin.top + horizontalControls.computedHeight())+')')

			selection.changeAxis.axis
				.transition()
					.duration(animationDuration)
					.call(changeAxis);
		}else{
			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
		}
	};

	var bubbleMouseover = function(d, i){
		var changeHTML = '';

		if(isNaN(d.change)){}
		else if(d.change >= 0)
			changeHTML = '(+'+formatPercent(d.change)+')';
		else if(d.change < 0)
			changeHTML = '('+formatPercent(d.change)+')';

		d2b.UTILS.createGeneralTooltip(d3.select(this), "<b>"+d.label+"</b>", xFormat(d.value)+' '+changeHTML);

		for(key in on.elementMouseover){
			on.elementMouseover[key].call(this,d,i,'bubble');
		}
	};

	var bubbleMouseout = function(d,i){
		d2b.UTILS.removeTooltip();
		for(key in on.elementMouseout){
			on.elementMouseout[key].call(this,d,i,'bubble');
		}
	};

	var bubbleClick = function(d,i){
		d2b.UTILS.removeTooltip();
		for(key in on.elementClick){
			on.elementClick[key].call(this,d,i,'bubble');
		}
	};

	//GP async loop
	var asyncLoop = function(iterations, process, exit){
	    var index = 0,
	        done = false,
	        shouldExit = false;
	    var loop = {
	        next:function(){
	            if(done){
	                if(shouldExit && exit){
	                    return exit();
	                }
	            }
	            if(index < iterations){
	                index++;
	                process(loop);
	            } else {
	                done = true;
	                if(exit) exit();
	            }
	        },
	        iteration:function(){
	            return index - 1;
	        },
	        break:function(end){
	            done = true;
	            shouldExit = end;
	        }
	    };
	    loop.next();
	    return loop;
	}

	//update bubble positioning
	var updateBubbles = function(){

		selection.group.bubbles.bubble = selection.group.bubbles.selectAll('g.d2b-bubble')
				.data(current.grouping.nodes.sort(function(a,b){return d3.ascending(b.value, a.value);}),function(d,i){
					if(d.key == 'unique')
						return Math.floor((1 + Math.random()) * 0x10000)
					else if(d.key && d.key != 'auto')
						return d.key;
					else
						return d.label;
				});

		var newBubble = selection.group.bubbles.bubble.enter()
			.append('g')
				.attr('class','d2b-bubble')
				.on('mouseover.d2b-mouseover', bubbleMouseover)
				.on('mouseout.d2b-mouseout', bubbleMouseout)
				.on('click.d2b-click', bubbleClick);
				// .style('opacity',0);

		newBubble.append('circle')
				.style('fill',function(d){return color(d.enrollments[d.colorGrouping.index]);})
				.style('stroke',function(d){return color(d.enrollments[d.colorGrouping.index]);})
				.attr('r',0);

		selection.group.bubbles.bubble.circle = selection.group.bubbles.bubble.select('circle')

		var circleTransition = selection.group.bubbles.bubble.circle
			.transition()
				.duration(animationDuration)
				.attr('r',function(d){return radius(d.value);});

		if(current.groups){
			current.groups.forEach(function(d){
				// d.force.stop();
				d.nodeElements = selection.group.bubbles.bubble.filter(function(b){
					return b.group == d && b.enrollments[current.grouping.index];
				})
			});
		}

		if(controls.colorByChange.enabled){
			circleTransition
				.style('fill',function(d){return colorChange(d.change);})
				.style('stroke',function(d){return d3.rgb(colorChange(d.change)).darker(1);});
		}else{
			circleTransition
				.style('fill',function(d){
						if(d.enrollments[d.colorGrouping.index])
							return color(d.enrollments[d.colorGrouping.index]);
						else
							return color('Non-'+current.colorGrouping.label);
					})
				.style('stroke',function(d){
						if(d.enrollments[d.colorGrouping.index])
							return d3.rgb(color(d.enrollments[d.colorGrouping.index])).darker(1);
						else
							return d3.rgb(color('Non-'+current.colorGrouping.label)).darker(1);
					})
		}

		//place bubbles either in groups or on change axis
		if(controls.sortByChange.enabled){
			var changeRange = changeScaleAxis.range();

			selection.group.bubbles.bubble
				.transition()
					.duration(animationDuration*1.5)
					.each(function(d){
						d.x = (20+Math.min(changeRange[1],Math.max(changeRange[0], changeScaleAxis(d.change)))) + (longestGroupsTick + 10) + forcedMargin.left;
						d.y = (changeGroupsScale(d.enrollments[d.grouping.index])+changeGroupsScale.rangeBand()/2+ 60 + forcedMargin.top);
					})
					.attr('transform',function(d,i){return 'translate('+d.x+','+d.y+')';});

		}else{


			current.groups.forEach(function(d){
				//set force parameters and start it
				d.force
						.size([innerWidth, innerHeight])
						.start();
				//auto-advance the force.tick until the alpha parameter is less than 0.025, then transition the bubbles
				asyncLoop(300, function(loop){
					if(d.force.alpha() < 0.025)
						loop.break(true);
	        var i = loop.iteration();
					d.force.tick();
	        loop.next();
				}, function(){
					d.force.stop();
					d.nodeElements
						.transition()
							.duration(animationDuration*1.5)
							.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'});
				});
			});

		}

		//if new bubbles added to old bubbles, sort visual space largest to smallest
		if(newBubble.size() && selection.group.bubbles.bubble.size() > newBubble.size()){
			selection.group.bubbles.bubble.each(function(d){
				selection.group.bubbles.node().appendChild(this);
			});
		}

		selection.group.bubbles.bubble.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr('transform',function(d){return 'translate(0,0)'})
				.remove()
			.select('circle')
				.attr('r',0);
	};

	// update bubble groups positioning
	var updateGroups = function(){
		current.groups = [];
		for(key in current.grouping.groups)
			current.groups.push(current.grouping.groups[key]);

		var ratio = innerWidth/innerHeight;

		var groupsPerRow = Math.min(current.groups.length,Math.max(1, Math.round(Math.sqrt(current.groups.length) * (ratio))));
		var groupsPerColumn = Math.ceil(current.groups.length/groupsPerRow);

		selection.group.groups.group = selection.group.groups.selectAll('g').data(current.groups);

		groupsScales.x.domain(d3.range(0, groupsPerRow)).rangeBands([0,innerWidth]);
		groupsScales.y.domain(d3.range(0, groupsPerColumn)).rangeBands([0,innerHeight-100]);

		var newGroup = selection.group.groups.group.enter()
			.append('g')
				.style('opacity',0);

		newGroup.append('text').attr('class','d2b-group-title');
		newGroup.append('text').attr('class','d2b-group-total');
		selection.group.groups.group
			.each(function(d,i){
				d.total = d3.sum(d.nodes.map(function(d){return d.value;}));
				d.focus = {x:groupsScales.x(i%groupsPerRow)+groupsScales.x.rangeBand()/2, y:groupsScales.y(Math.floor(i/groupsPerRow))+100+groupsScales.y.rangeBand()/2};

				//if the d3 force layout has not been initialized for this bubble-group yet, initialize it
				if(!d.force){
					d.force = d3.layout.force()
		          .links([])
		          .gravity(0)
							.friction(0.9)
		          .charge(function(d){return -Math.pow( radius(d.value), 2.0) / 9;})
		          .nodes(d.nodes)
		          .on('tick', forceTick.bind(d));
				}
				d.force.stop();

			})
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d,i){
					return 'translate('+(groupsScales.x(i%groupsPerRow)+groupsScales.x.rangeBand()/2)+','+(groupsScales.y(Math.floor(i/groupsPerRow))+100)+')'
				})
				.style('opacity',1);

		selection.group.groups.selectAll('.focus').remove();

		var fontSize = Math.min(30,Math.max(8,groupsScales.fontSize((innerWidth + innerHeight)/(current.groups.length))))

		selection.group.groups.group.total = selection.group.groups.group.select('text.d2b-group-total')
			// .attr('y', groupsScales.y.rangeBand()/2)
			.text(function(d){return xFormat(d.total);})
			.style('font-size', fontSize+'px')
		selection.group.groups.group.each(function(d){
			// selection.group.groups.append('circle').attr('class','focus').attr('r',5).style('fill','red').attr('cx',d.focus.x).attr('cy',d.focus.y)

				// selection.group.groups.group.append('text').attr('class','focus').text('$12.1M').style('text-anchor','middle').attr('x',d.focus.x).attr('y',d.focus.y)
		});

		// selection.group.groups.group
		selection.group.groups.group.title = selection.group.groups.group.select('text.d2b-group-title')
				.text(function(d){return d.label;})
				.attr('dy',0)
				.attr('y',fontSize)
				// .attr('y',0)
				.style('font-size', fontSize+'px')
				.call(d2b.UTILS.textWrap, groupsScales.x.rangeBand()-10);

		selection.group.groups.group.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		svgHeight = height-55;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		legend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = d2b.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}
		if(value.sortByChange){
			controls.sortByChange.visible = (value.sortByChange.visible != null)? value.sortByChange.visible:controls.sortByChange.visible;
			controls.sortByChange.enabled = (value.sortByChange.enabled != null)? value.sortByChange.enabled:controls.sortByChange.enabled;
		}
		if(value.colorByChange){
			controls.colorByChange.visible = (value.colorByChange.visible != null)? value.colorByChange.visible:controls.colorByChange.visible;
			controls.colorByChange.enabled = (value.colorByChange.enabled != null)? value.colorByChange.enabled:controls.colorByChange.enabled;
		}

		return chart;
	};


	chart.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
			generateRequired = true;
		}

		currentChartData = chartData.data;

		currentChartData.nodes = currentChartData.nodes.filter(function(d){return d.value > 0;})

		//link groupings by enrollments
		currentChartData.groupings.forEach(function(d, i){
			d.index = i;
			d.nodes = currentChartData.nodes.filter(function(node){ return node.enrollments[i];	});
			d.groups = {};
			d.total = 0;
			d.nodes.forEach(function(node){
				d.total += node.value;
				if(!d.groups[node.enrollments[i]])
					d.groups[node.enrollments[i]] = {nodes:[], label:node.enrollments[i]};
				d.groups[node.enrollments[i]].nodes.push(node);
			});
		});

		//update grouping
		var tempGrouping = current.grouping;
		current.grouping = currentChartData.groupings[0];
		if(tempGrouping){
			currentChartData.groupings.forEach(function(d){
				if(tempGrouping.label == d.label)
					current.grouping = d;
			});
		}
		updateNodeGrouping(current.grouping);
		updateNodeGroup();

		//update color grouping
		tempGrouping = current.colorGrouping;
		current.colorGrouping = currentChartData.groupings.filter(function(d){return d.default_color_grouping;})[0];
		if(tempGrouping){
			currentChartData.groupings.forEach(function(d){
				if(tempGrouping.label == d.label)
					current.colorGrouping = d;
			});
		}else if(!current.colorGrouping){
			current.colorGrouping = currentChartData.groupings[0];
		}
		updateNodeGrouping(current.colorGrouping, "colorGrouping");

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create button container
		selection.buttonsWrapper = selection
			.append('div')
				.attr('class','d2b-bubble-chart-buttons-wrapper');

		selection.buttonsWrapper.buttons = selection.buttonsWrapper
			.append('ul')
				.attr('class','d2b-buttons');

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','d2b-bubble-chart d2b-svg d2b-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.bubbles = selection.group
			.append('g')
				.attr('class','d2b-bubbles');

		//create change axis/legend
		selection.changeAxis = selection.group
			.append('g')
				.attr('class','d2b-change-axis-legend');

		selection.changeAxis.legend = selection.changeAxis
			.append('g');

		selection.changeAxis.axis = selection.changeAxis
			.append('g');

		selection.group.groups = selection.group
			.append('g')
				.attr('class','d2b-groups');

		//create groups axis
		selection.groupsAxis = selection.group
			.append('g')
				.attr('class','d2b-groups-axis');

		//init change legend rects
		selection.changeAxis.legend.rect = selection.changeAxis.legend.selectAll('rect').data([-0.25, -0.05, 0.0, 0.05, 0.25, 1]);
		selection.changeAxis.legend.rect.enter()
			.append('rect')
			.style('fill', function(d){return colorChange(d-0.01);})
			.attr('x',function(d){return changeScaleLegend(d)-changeScaleLegend.rangeBand()/2;})
			.attr('width',changeScaleLegend.rangeBand())
			.attr('height',10)
			.attr('y',-15);



		//create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','d2b-legend');

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','d2b-controls');


		horizontalControls
				.selection(selection.controls)
				.on('change',function(d,i){
					controls[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});

		// //intialize new legend
		legend
				.color(color)
				.selection(selection.legend);

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		selection.svg
				.attr('width',width)
				.attr('height',svgHeight);

		updateGroupingButtons();

		forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		updateControls();


		forcedMargin.top += horizontalControls.computedHeight() + 10;

		updateLegend();

		if(legendOrientation == 'right' || legendOrientation == 'left')
			forcedMargin[legendOrientation] += legend.computedWidth();
		else
			forcedMargin[legendOrientation] += legend.computedHeight();

		innerHeight = svgHeight - forcedMargin.top - forcedMargin.bottom;
		innerWidth = width - forcedMargin.left - forcedMargin.right;

		updateViews();
		updateRadiusScale(current.grouping);
		updateBubbles();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis chart*/
d2b.CHARTS.axisChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {
		types:[],
		labels:{}
	};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.legend.active(true);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();

	$$.rotate = false;

	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				lockYAxis: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				lockXAxis: {
					label: "Lock X-Axis",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.orientationMap = {
		x: 'x',
		y: 'y'
	}

	//account for any tools defined by the various axis chart types
	for(type in d2b.UTILS.AXISCHART.TYPES){
		if(d2b.UTILS.AXISCHART.TYPES[type].tools){
			var tools = d2b.UTILS.AXISCHART.TYPES[type].tools();
			if(tools){

				//controlsData tools
				if(tools.controlsData){
					for(control in tools.controlsData){
						$$.controlsData[control] = tools.controlsData[control];
					}
				}
			}
		}
	}

	$$.xAlias = {
		scale:d3.scale.linear(),
		axis:d3.svg.axis(),
		type:'quantitative,linear',
		orientation:'bottom',
		domain:[0,1],
		hide: false,
		tickData:{}
	};
	$$.xAlias.axis.scale($$.xAlias.scale).orient($$.xAlias.orientation);
	$$.yAlias = {
		scale:d3.scale.linear(),
		axis:d3.svg.axis(),
		type:'quantitative,linear',
		orientation:'left',
		domain:[0,1],
		hide: false,
		tickData:{}
	};
	$$.yAlias.axis.scale($$.yAlias.scale).orient($$.yAlias.orientation);

	$$.x = $$.xAlias;
	$$.y = $$.yAlias;

	//persistent chart data is used to save data properties that need to persist through a data update
	$$.persistentChartData = {};

	$$.padQuantitativeDomain = function(extent){
		var range = extent[1] - extent[0];
		var paddingCoefficient = 0.15;
		return [
							(extent[0] == 0)? 0 : extent[0]-range*paddingCoefficient,
							extent[1]+range*paddingCoefficient
						]
	};

	//update scale domains based on yValues/xValues 'getters' of each graph type
	$$.updateDomains = function(){
		var xType = $$.xAlias.type.split(',')[0];
		var tools;
		var xValues = [];
		var yValues = [];

		$$.selection.types.background.type.each(function(d){
			this.adType
				.data(d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;}));
			if(this.adType.xValues)
				xValues = xValues.concat(this.adType.xValues());
			if(this.adType.yValues)
				yValues = yValues.concat(this.adType.yValues());
		});

		if(xValues.length == 0){
			xValues = [0,1]
		}else if(xValues.length == 1 && xType == 'quantitative'){
			xValues = [xValues[0]/2, xValues[0]*1.5]
		}
		if(!$$.controlsData.lockXAxis.enabled){
			switch(xType){
				case 'ordinal':
					$$.xAlias.scale.domain(d3.set(xValues).values());
					break;
				case 'quantitative':
					$$.xAlias.scale.domain($$.padQuantitativeDomain(d3.extent(xValues)));
					break;
				default:
					$$.xAlias.scale.domain(d3.extent(xValues));
					break;
			}
		}else{
			$$.xAlias.scale.domain($$.xAlias.domain);
		}

		var yType = $$.yAlias.type.split(',')[0];

		if(yValues.length == 0){
			yValues = [0,1]
		}else if(yValues.length == 1 && yType == 'quantitative'){
			yValues = [yValues[0]/2, yValues[0]*1.5]
		}
		if(!$$.controlsData.lockYAxis.enabled){
			switch(yType){
				case 'ordinal':
					$$.yAlias.scale.domain(d3.set(yValues).values());
					break;
				case 'quantitative':
					$$.yAlias.scale.domain($$.padQuantitativeDomain(d3.extent(yValues)));
					break;
				default:
					$$.yAlias.scale.domain(d3.extent(yValues));
					break;
			}
		}else{
			$$.yAlias.scale.domain($$.yAlias.domain);
		}
	};

	//initialize axis-chart-type containers and graph containers
	$$.initGraphs = function(){
		//enter update exit a foreground svg:g element for each axis-chart-type
		$$.selection.types.foreground.type = $$.selection.types.foreground
			.selectAll('g.d2b-axis-type-foreground')
				.data($$.currentChartData.types, function(d){return d.type;});

		$$.selection.types.foreground.type.enter()
			.append('g')
				.attr('class', function(d){return 'd2b-axis-type-foreground d2b-'+d.type;});

		$$.selection.types.foreground.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.foreground.type.graph = $$.selection.types.foreground.type.selectAll('g.d2b-axis-chart-foreground-graph')
			.data(
				function(d){
					return d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;})
				},
				function(d,i){
					return d.label;
				}
			);
		$$.selection.types.foreground.type.graph.enter()
			.append('g')
				.style('opacity',0)
				.attr('class', 'd2b-axis-chart-foreground-graph')
				.each(function(graph){
					$$.persistentChartData[graph.type][graph.label].foreground = d3.select(this);
				});

		//save the foreground in data for use with the legend events
		$$.selection.types.foreground.type.graph
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);

		$$.selection.types.foreground.type.graph.exit()
			.each(function(d){$$.persistentChartData[d.type][d.label].foreground = null;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a background svg:g element for each axis-chart-type
		$$.selection.types.background.type = $$.selection.types.background
			.selectAll('g.d2b-axis-type-background')
				.data($$.currentChartData.types, function(d){return d.type;});

		$$.selection.types.background.type.enter()
			.append('g')
				.attr('class', function(d){return 'd2b-axis-type-background d2b-'+d.type;})
				.each(function(d){
					var masterType = 'axis-chart-';
					this.adType = new d2b.UTILS.AXISCHART.TYPES[d.type](d.type);
					this.adType
						.on('elementClick.d2b-click', function(d,i,type){
								for(key in $$.on.elementClick){
									$$.on.elementClick[key].call(this,d,i,masterType+type);
								}
						})
						.on('elementMouseover.d2b-mouseover', function(d,i,type){
								for(key in $$.on.elementMouseover){
									$$.on.elementMouseover[key].call(this,d,i,masterType+type);
								}
						})
						.on('elementMouseout.d2b-mouseout', function(d,i,type){
								for(key in $$.on.elementMouseout){
									$$.on.elementMouseout[key].call(this,d,i,masterType+type);
								}
						})
						.x($$.xAlias)
						.y($$.yAlias)
						.color($$.color)
						.axisChart(chart)
						.xFormat($$.xFormat)
						.yFormat($$.yFormat)
						.controls($$.controlsData);
				});
		$$.selection.types.background.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//enter update exit a sub-foreground element for the graphs associated with each type
		$$.selection.types.background.type.graph = $$.selection.types.background.type.selectAll('g.d2b-axis-chart-background-graph')
			.data(
				function(d){
					return d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;})
				},
				function(d,i){
					return d.label;
				}
			);
		$$.selection.types.background.type.graph.enter()
			.append('g')
				.attr('class', 'd2b-axis-chart-background-graph')
				.style('opacity',0)
				.each(function(graph){
					$$.persistentChartData[graph.type][graph.label].background = d3.select(this);
				});

		//save the background in data for use with the legend events
		$$.selection.types.background.type.graph
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);
		$$.selection.types.background.type.graph.exit()
			.each(function(d){$$.persistentChartData[d.type][d.label].background = null;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		//store the foreground graphs within the data
		$$.selection.types.foreground.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.d2b-axis-chart-foreground-graph');
			d.foregroundGraphs = graphs;
		});

	};

	//update the custom scales that are used by the axis-chart-types
	$$.updateCustomScales = function(){

		//use custom scales to fix an inconsistancy with the rotated/horizontal scale and sync ordinal scales with other scale types
		$$.x.customScale = function(value, invert){
			var position = 0;
			if($$.rotate)
				position = $$.innerWidth - $$.x.scale(value);
			else
				position = $$.x.scale(value);
			if($$.x.type == 'ordinal')
				position += $$.x.scale.rangeBand()/2;
			if(invert)
				position = $$.innerWidth - position;
			return position;
		};

		$$.y.customScale = function(value, invert){
			var position = 0;
			position = $$.y.scale(value);
			if($$.y.type == 'ordinal')
				position += $$.y.scale.rangeBand()/2;
			if(invert)
				position = $$.innerHeight - position;
			return position;
		};

		//custom bar scale that returns:
		//bar{
		//  y(y-axis positioning),
		//  height(absolute height),
		//  sHeight(signed height negative down, positive up)
		//  origin(the x-axis position)
		//  destination(bar-end position)
		//}
		$$.yAlias.customBarScale = function(value){
			var bar = {y:0,height:0};

			bar.origin = $$.yAlias.customScale(0);
			bar.destination = $$.yAlias.customScale(value);

			bar.sHeight = bar.origin - bar.destination;

			bar.y = Math.min($$.yAlias.customScale(0), bar.destination);
			bar.height = Math.abs(bar.sHeight);

			return bar;
		};

	}

	//update the graphs stored in the instance of each axis-chart-type-background
	$$.updateGraphs = function(){

		$$.updateCustomScales();

		$$.selection.types.background.type.each(function(d){
			var type = d3.select(this);
			var graphs = type.selectAll('.d2b-axis-chart-background-graph');
			d.backgroundGraphs = graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;});

			this.adType
				.animationDuration($$.animationDuration)
				.width($$.innerWidth)
				.height($$.innerHeight)
				.foreground(d.foregroundGraphs)
				.background(d.backgroundGraphs)
				.data(d.graphs.filter(function(graph){return !$$.persistentChartData[graph.type][graph.label].hide;}))
				.update();
		});

		$$.selection.types.background.type.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

	};

	//axis modifier is used to make like code for x/y axes reusable
	$$.axisModifier = function(callback, params){
		if(params){
			callback('x', params.x);
			callback('y', params.y);
		}else{
			callback('x');
			callback('y');
		}
	};

	//update x and y axis (including scales, labels, grid..)
	$$.updateAxis = function(){

		var labelOffset = 10;
		var labelTransition = {};

		//setup axis labels if specified and visible
		$$.axisModifier(
			function(axis, params){
				labelTransition[axis] = $$.selection.axes[axis].label
					.transition()
						.duration($$.animationDuration);
				if($$.currentChartData.labels[axis] && !$$[axis].hide){
					$$.forcedMargin[$$[axis].orientation] += labelOffset;
					$$[params.dimension] -= labelOffset;
					labelTransition[axis]
						.style('opacity',1);
					$$.selection.axes[axis].label.text
						.text($$[axis].label);
				}else{
					labelTransition[axis]
						.style('opacity',0);
					$$.selection.axes[axis].label.text
						.text('');
				}
			},
			{
				x:{dimension: 'innerHeight'},
				y:{dimension: 'innerWidth'}
			}
		);

		//create axis transitions;
		var axisTransition = {};
		$$.axisModifier(function(axis){
			axisTransition[axis] = $$.selection.axes[axis]
				.transition()
					.duration($$.animationDuration);
		});


		//create axis transitions;
		var gridTransition = {};
		$$.axisModifier(function(axis){
			gridTransition[axis] = $$.selection.grid[axis]
				.transition()
					.duration($$.animationDuration);
		});

		//find max tick size on the vertical axis for proper spacing
		//add tick events based on bound data
		var maxTickLength = 0;
		$$.selection.axes.y.text = $$.selection.axes.y.selectAll('.tick text').each(function(){
			var length = this.getComputedTextLength();
			maxTickLength = Math.max(maxTickLength, length);
		})
			.on('click.d2b-element-click', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementClick){
					$$.on.elementClick[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseover.d2b-element-mouseover', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementMouseover){
					$$.on.elementMouseover[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseout.d2b-element-mouseout', function(d,i){
				var obj = {label:d}
				for(var key in $$.y.tickData[d]){
					obj[key] = $$.y.tickData[d][key];
				}
				for(key in $$.on.elementMouseout){
					$$.on.elementMouseout[key].call(this,obj,i,'axis-tick');
				}
			});

		$$.selection.axes.x.text = $$.selection.axes.x.selectAll('text')
			.on('click.d2b-element-click', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementClick){
					$$.on.elementClick[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseover.d2b-element-mouseover', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementMouseover){
					$$.on.elementMouseover[key].call(this,obj,i,'axis-tick');
				}
			})
			.on('mouseout.d2b-element-mouseout', function(d,i){
				var obj = {label:d}
				for(var key in $$.x.tickData[d]){
					obj[key] = $$.x.tickData[d][key];
				}
				for(key in $$.on.elementMouseout){
					$$.on.elementMouseout[key].call(this,obj,i,'axis-tick');
				}
			});

		var labelPadding = 10;

		//modify x/y axis positioning and visiblity
		$$.axisModifier(
			function(axis, params){
				if($$[axis].hide){
					axisTransition[axis].style('opacity',0);
				}else{
					axisTransition[axis].style('opacity',1);
					$$.forcedMargin[$$[axis].orientation] += params.offset;
					$$[params.dimension] -= params.offset;
				}
			},
			{
				x:{offset:10 + labelPadding, dimension:'innerHeight'},
				y:{offset:maxTickLength + labelPadding, dimension:'innerWidth'}
			}
		);

		//position x/y labels
		var labelOffsetPosition = ($$.y.orientation == 'left')? -maxTickLength-labelOffset-labelPadding-5 : maxTickLength+labelOffset+labelPadding+labelTransition.y.node().getBBox().width;
		labelTransition.y.attr('transform','translate('+ labelOffsetPosition +','+ $$.innerHeight/2 +')');

		labelOffsetPosition = ($$.x.orientation == 'top')? -labelOffset*1.5-labelPadding:+labelOffset*1+labelPadding+labelTransition.x.node().getBBox().height;
		labelTransition.x.attr('transform','translate('+	$$.innerWidth/2 +','+ labelOffsetPosition+')');

		//set x/y scale range
		var range = {};
		if($$.rotate){
			if($$.x.invert)
				range.x=[$$.innerWidth, 0];
			else
				range.x=[0, $$.innerWidth];

			if(!$$.y.invert)
				range.y=[0, $$.innerHeight];
			else
				range.y=[$$.innerHeight, 0];
		}else{
			if($$.x.invert)
				range.x=[$$.innerWidth, 0];
			else
				range.x=[0, $$.innerWidth];

			if($$.y.invert)
				range.y=[0, $$.innerHeight];
			else
				range.y=[$$.innerHeight, 0];
		}

		if($$.x.type.split(',')[0] == 'ordinal'){
			$$.x.scale.rangeBands(range.x);
			$$.x.rangeBand = $$.x.scale.rangeBand()*0.75;
		}else{
			$$.x.scale.range(range.x);
			$$.x.rangeBand = $$.innerWidth/10;
		}



		if($$.y.type.split(',')[0] == 'ordinal'){
			$$.y.scale.rangeBands(range.y);
			$$.y.rangeBand = $$.y.scale.rangeBand()*0.75;
		}else{
			$$.y.scale.range(range.y);
			$$.y.rangeBand = $$.innerHeight/10;
		}

		//set x/y tick size
		$$.x.axis.tickSize(5);
		$$.y.axis.tickSize(5);

		//transition and position x axis
		axisTransition.x
			.call($$.x.axis);

		if($$.x.orientation == 'top'){
			axisTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			axisTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+($$.innerHeight + $$.forcedMargin.top)+')');
		}

		//transition and position y axis
		axisTransition.y
			.call($$.y.axis)
			.each('end',function(){
				//when y transition finishes, wait 10ms and then verify that the horizontal margin is correctly aligned for the maxTickLength
				setTimeout(function(){
					var verifyMaxTickLength = 0;
					$$.selection.axes.y.selectAll('.tick text').each(function(){
						var length = this.getComputedTextLength();
						verifyMaxTickLength = Math.max(verifyMaxTickLength, length);
					});
					if(maxTickLength != verifyMaxTickLength)
						chart.update();
				},10);

			});

		if($$.y.orientation == 'left'){
			axisTransition.y
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			axisTransition.y
					.attr('transform','translate('+($$.innerWidth + $$.forcedMargin.left)+','+$$.forcedMargin.top+')');
		}


		//set x/y tick size for grid
		$$.x.axis.tickSize(-$$.innerHeight);
		$$.y.axis.tickSize(-$$.innerWidth);

		//transition and position x/y grid lines
		gridTransition.x
			.call($$.x.axis);
		if($$.x.orientation == 'top'){
			gridTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			gridTransition.x
					.attr('transform','translate('+$$.forcedMargin.left+','+($$.innerHeight + $$.forcedMargin.top)+')');
		}
		gridTransition.y
			.call($$.y.axis);

		if($$.y.orientation == 'left'){
			gridTransition.y
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
		}else{
			gridTransition.y
					.attr('transform','translate('+($$.innerWidth + $$.forcedMargin.left)+','+$$.forcedMargin.top+')');
		}

	};


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat', function(){$$.xAlias.axis.tickFormat($$.xFormat);});
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'yFormat', function(){$$.yAlias.axis.tickFormat($$.yFormat);});
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

	//rotate the chart, set x,y scales accordingly
	chart.rotate = function(value){
		$$.rotate = value;
		if(value){
			$$.orientationMap = {x:'y', y:'x'}
			$$.x = $$.yAlias;
			$$.y = $$.xAlias;
		}else{
			$$.orientationMap = {x:'x', y:'y'}
			$$.x = $$.xAlias;
			$$.y = $$.yAlias;
		}
		return chart;
	};

	//x/y setters
	chart.x = d2b.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'xAlias', function(value){
		if(value.orientation)
			$$.xAlias.orientation = value.orientation;

		$$.xAlias.axis
			.scale($$.xAlias.scale)
			.orient($$.xAlias.orientation);

		if(value.tickData){
			$$.xAlias.tickData = value.tickData;
		}

	});
	chart.y = d2b.UTILS.CHARTS.MEMBERS.scale(chart, $$, 'yAlias',function(value){
		if(value.orientation)
			$$.yAlias.orientation = value.orientation;

		$$.yAlias.axis
			.scale($$.yAlias.scale)
			.orient($$.yAlias.orientation);

		if(value.tickData){
			$$.yAlias.tickData = value.tickData;
		}

	});

	//data setter
	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		if(chartData.data.types){
			$$.currentChartData.types = chartData.data.types;

			//init persistent data links
			$$.currentChartData.types.forEach(function(type){
				if(!$$.persistentChartData[type.type])
					$$.persistentChartData[type.type] = {};
				type.graphs.forEach(function(graph){
					if(!$$.persistentChartData[type.type][graph.label])
						$$.persistentChartData[type.type][graph.label] = {hide:false};
				});
			});

		}

		if(chartData.data.labels){
			$$.currentChartData.labels = chartData.data.labels;
			$$.xAlias.label = $$.currentChartData.labels.x;
			$$.yAlias.label = $$.currentChartData.labels.y;
		}

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change.d2b-change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-axis-chart');

		$$.selection.axes = $$.selection.main
			.append('g')
				.attr('class','d2b-axes');

		$$.selection.axes.x = $$.selection.axes
			.append('g')
				.attr('class','d2b-axis d2b-x');

		$$.selection.axes.x.label = $$.selection.axes.x
			.append('g')
				.attr('class','d2b-label');
		$$.selection.axes.x.label.text = $$.selection.axes.x.label
			.append('text');

		$$.selection.axes.y = $$.selection.axes
			.append('g')
				.attr('class','d2b-axis d2b-y');

		$$.selection.axes.y.label = $$.selection.axes.y
			.append('g')
				.attr('class','d2b-label');
		$$.selection.axes.y.label.text = $$.selection.axes.y.label
			.append('text')
		    .attr('transform', 'rotate(-90)');

		$$.selection.grid = $$.selection.main
			.append('g')
				.attr('class','d2b-grid');

		$$.selection.grid.x = $$.selection.grid
			.append('g')
				.attr('class','d2b-grid d2b-x');

		$$.selection.grid.y = $$.selection.grid
			.append('g')
				.attr('class','d2b-grid d2b-y');

		$$.selection.types = $$.selection.main
			.append('g')
				.attr('class','d2b-axis-types');
		$$.selection.types.background = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-background');
		$$.selection.types.foreground = $$.selection.types
			.append('g')
				.attr('class','d2b-axis-types-foreground');

		// reset hidden types/graphs
		var resetHidden = function(){
			$$.currentChartData.types.forEach(function(type){
				type.graphs.forEach(function(graph){
					$$.persistentChartData[graph.type][graph.label].hide = false;
				});
			});
		};

		$$.legend.on('elementMouseover',function(d){
			var background = $$.persistentChartData[d.type][d.label].background;
			var foreground = $$.persistentChartData[d.type][d.label].foreground;

			if(background && foreground){
				var backgroundNode = background.node();
				var foregroundNode = foreground.node();
				//bring the type and the graph to the front for the foreground and background
				if(backgroundNode.parentNode){
					backgroundNode.parentNode.appendChild(backgroundNode);
					if(backgroundNode.parentNode.parentNode)
						backgroundNode.parentNode.parentNode.appendChild(backgroundNode.parentNode);
				}
				if(foregroundNode.parentNode){
					foregroundNode.parentNode.appendChild(foregroundNode);
					if(foregroundNode.parentNode.parentNode)
						foregroundNode.parentNode.parentNode.appendChild(foregroundNode.parentNode);
				}

				//dim all but the corresponding graph
				$$.selection.types.foreground.type.graph
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 0.2);
				$$.selection.types.background.type.graph
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 0.2);
				background
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 1);
				foreground
					.transition()
						.duration($$.animationDuration/2)
						.style('opacity', 1);
			}


		})
		.on('elementMouseout',function(d){
			//reset dimming
			$$.selection.types.foreground.type.graph
				.transition()
					.duration($$.animationDuration/2)
					.style('opacity', 1);
			$$.selection.types.background.type.graph
				.transition()
					.duration($$.animationDuration/2)
					.style('opacity', 1);
		})
		.on('elementClick', function(d){
			$$.persistentChartData[d.type][d.label].hide = !$$.persistentChartData[d.type][d.label].hide;
			var allHidden = true;

			$$.currentChartData.types.forEach(function(type){
				type.graphs.forEach(function(graph){
					if(allHidden == true && !$$.persistentChartData[graph.type][graph.label].hide)
						allHidden = false;
				});
			});
			//if all types/graphs are hidden, show them all
			if(allHidden)
				resetHidden();

			chart.update();
		})
		.on('elementDblClick', function(d){
			resetHidden();
			chart.update();
		});

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		//save the type of each graph
		$$.currentChartData.types.forEach(function(type){
			type.graphs.forEach(function(graph){
				graph.type = type.type;
			});
		});

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData.data.items = [].concat.apply([],
				$$.currentChartData.types.map(
					function(type){
						return type.graphs.map(function(graph,i){
							graph.open = $$.persistentChartData[type.type][graph.label].hide;
							return graph;
						})
					}
				)
			);
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		if(($$.legend.computedHeight() && ($$.legendOrientation == 'left'||$$.legendOrientation == 'right'))){
			// || ($$.legend.computedWidth() && ($$.legendOrientation == 'top'||$$.legendOrientation == 'bottom'))){
			$$.forcedMargin[$$.legendOrientation] += 10;
		}

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.initGraphs();

		$$.updateDomains();

		$$.updateAxis();

		$$.selection.types
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		if($$.rotate){
			$$.selection.types.background
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+($$.innerWidth)+', 0),rotate(90)');
			$$.selection.types.foreground
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+($$.innerWidth)+', 0),rotate(90)');
		}else{
			$$.selection.types.background
				.transition()
					.duration($$.animationDuration)
					.attr('transform','');
			$$.selection.types.foreground
				.transition()
					.duration($$.animationDuration)
					.attr('transform','');
		}

		$$.updateGraphs();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//TODO: d2bD CALLBACK TO 'ON' MEMBER THAT RESETS EVENTS ON ELEMENTS, AND CHANGE EVENT INITIALIZATION TO ACT ONLY ON ENTERED() ELEMENTS
//TODO: ATTACH ALL PRIVATE VARIABLES/MEHTODS TO BE STORED ON THE PRIVATE STORE '_'

/*sankey chart*/
d2b.CHARTS.sankeyChart = function(){

	//private
	var _ = {};
	_.on = d2b.CONSTANTS.DEFAULTEVENTS();

	//define axisChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT();

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new d2b.UTILS.LEGENDS.legend(),
	  	horizontalControls = new d2b.UTILS.CONTROLS.controls(),
			legendOrientation = 'bottom';

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {
				nodes:[],
				links:[]
			};

	var sankey;
	var nodePadding = 30;
	var nodeWidth = 15;
	var layout = 20;

	var minLinkWidth = 1;

	var nodeXVals = [];
	var nodeYVals = {};

	var controls = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	//init event object
	// var on = d2b.CONSTANTS.DEFAULTEVENTS();

	var xFormat = function(value){return value};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		legend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = d2b.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.nodePadding = function(value){
		if(!arguments.length) return nodePadding;
		nodePadding = value;
		return chart;
	};

	chart.layout = function(value){
		if(!arguments.length) return layout;
		layout = value;
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}
		return chart;
	};

	chart.minLinkWidth = function(value){
		if(!arguments.length) return minLinkWidth;
		minLinkWidth = value;
		return chart;
	};

	// chart.on = function(key, value){
	// 	key = key.split('.');
	// 	if(!arguments.length) return on;
	// 	else if(arguments.length == 1){
	// 		if(key[1])
	// 			return on[key[0]][key[1]];
	// 		else
	// 			return on[key[0]]['default'];
	// 	};
	//
	// 	if(key[1])
	// 		on[key[0]][key[1]] = value;
	// 	else
	// 		on[key[0]]['default'] = value;
	//
	// 	return chart;
	// };

	chart.on = d2b.UTILS.CHARTS.MEMBERS.on(chart, _);

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {
							nodes:[],
							links:[]
						};
			generateRequired = true;
		}

		if(chartData.data.nodes){
			currentChartData.nodes = chartData.data.nodes;
		}
		if(chartData.data.links){
			currentChartData.links = chartData.data.links;
		}
		if(chartData.data.labels){
			currentChartData.labels = chartData.data.labels;
		}
		if(chartData.data.columnHeaders){
			currentChartData.columnHeaders = chartData.data.columnHeaders;
		}

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','d2b-sankey-chart d2b-svg d2b-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.sankey = selection.group
			.append('g')
				.attr('class','d2b-sankey');
		selection.group.sankey.links = selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-links');
		selection.group.sankey.nodes = selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-nodes');

		selection.group.labels = selection.group
			.append('g')
				.attr('class','d2b-sankey-labels');

		selection.group.labels.source = selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-source');

		selection.group.labels.source.text = selection.group.labels.source.append('text').attr('y',23);

		selection.group.labels.destination = selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-destination');

		selection.group.labels.destination.text = selection.group.labels.destination.append('text').attr('y',23);

		selection.group.columnHeaders = selection.group
			.append('g')
				.attr('class','d2b-sankey-column-headers');


		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','d2b-controls');


		horizontalControls
				.selection(selection.controls)
				.on('change',function(d,i){
					controls[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});


		// //create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','d2b-legend');

		// //intialize new legend
		legend
				.color(color)
				.selection(selection.legend);
		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		var controlsData = d2b.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.data(controlsData).width(innerWidth).update();

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left + innerWidth - horizontalControls.computedWidth())+','+(forcedMargin.top)+')');

		forcedMargin.top += horizontalControls.computedHeight();
		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		if(controls.hideLegend.enabled){
			var legendData = {data:{items:[]}};
		}else{
			var legendData = {
				data:{
					items:	d3
										.set(currentChartData.nodes.map(function(d){
												return (d.colorKey)?d.colorKey:d.name;
											}))
										.values()
										.map(function(d){return {label:d};})
				}
			};
		}


		if(legendOrientation == 'right' || legendOrientation == 'left'){
			legend.orientation('vertical').data(legendData).height(innerHeight).update();
		}
		else{
			legend.orientation('horizontal').data(legendData).width(innerWidth).update();
		}

		var legendTranslation;
		if(legendOrientation == 'right')
			legendTranslation = 'translate('+(forcedMargin.left+innerWidth-legend.computedWidth())+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'left')
			legendTranslation = 'translate('+(forcedMargin.left)+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'top')
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+forcedMargin.top+')';
		else
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(innerHeight+forcedMargin.top-legend.computedHeight())+')';

		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform',legendTranslation);

		if(legendOrientation == 'right' || legendOrientation == 'left')
			forcedMargin[legendOrientation] += legend.computedWidth() + 10;
		else
			forcedMargin[legendOrientation] += legend.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		innerWidth = width - forcedMargin.left - forcedMargin.right;

		var labelTransitions={
			source:
				selection.group.labels.source
					.transition()
						.duration(animationDuration),
			destination:
				selection.group.labels.destination
					.transition()
						.duration(animationDuration)
		}



		if(currentChartData.labels){
			selection.group.labels
				.transition()
					.duration(animationDuration)
					.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');
			if(currentChartData.labels.source){
				labelTransitions.source
						.style('opacity',1);
				selection.group.labels.source.text.text(currentChartData.labels.source);
			}else{
				labelTransitions.source
						.style('opacity',0);
			}
			if(currentChartData.labels.destination){
				labelTransitions.destination
						.style('opacity',1);
				selection.group.labels.destination.text.text(currentChartData.labels.destination);
			}else{
				labelTransitions.destination
						.style('opacity',0);
			}

			labelTransitions.source
					.attr('transform','translate('+0+','+0+')');
			labelTransitions.destination
					.attr('transform','translate('+innerWidth+','+0+')');

			forcedMargin.top += 35;

		}else{
			labelTransitions.source
					.style('opacity',0);
			labelTransitions.destination
					.style('opacity',0);
		}

		var columnHeader;
		var columnHeaderScale;
		if(currentChartData.columnHeaders && currentChartData.columnHeaders.length > 0){
			columnHeaderScale = d3.scale.linear()
				.domain([0,currentChartData.columnHeaders.length-1])
				.range([0,innerWidth-nodeWidth])

			selection.group.columnHeaders
				.transition()
					.duration(animationDuration)
					.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

			columnHeader = selection.group.columnHeaders.selectAll('g.d2b-sankey-column-header').data(currentChartData.columnHeaders);
			columnHeader.enter()
				.append('g')
					.attr('class','d2b-sankey-column-header')
				.append('text')
					.attr('y',16)
					.attr('x',function(d,i){
						if(i == 0)
							return -nodeWidth/2;
						else if(i == currentChartData.columnHeaders.length-1)
							return nodeWidth/2;
					});

			columnHeader.select('text').text(function(d){return d;});
			columnHeader
				.transition()
					.duration(animationDuration)
					.attr('transform',function(d,i){return 'translate('+(columnHeaderScale(i)+nodeWidth/2)+','+0+')'})

			forcedMargin.top += 25;
		}

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;


		//
		// selection.legend
		// 	.transition()
		// 		.duration(animationDuration)
		// 		.attr('transform','translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(innerHeight+forcedMargin.top)+')')

		sankey = d3.sankey()
				.size([innerWidth,innerHeight])
				.nodeWidth(nodeWidth)
				.nodePadding(nodePadding)
				.nodes(currentChartData.nodes)
				.links(currentChartData.links)
				.layout(layout);


		var node = selection.group.sankey.nodes.selectAll('g.d2b-sankey-node')
				.data(currentChartData.nodes,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return i;
					});
		var newNode = node.enter()
			.append('g')
				.attr('class','d2b-sankey-node')
				.on('mouseover.d2b-mouseover',function(d,i){
					d2b.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.name+'</b>',xFormat(d.value));
				})
				.on('mouseout.d2b-mouseout',function(d,i){
					d2b.UTILS.removeTooltip();
				})
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',0)
				.call(d2b.UTILS.bindElementEvents, _, 'node');
		newNode.append('rect');
		newNode.append('text');

		var nodeText = node.select('text')
				.text(function(d){return d.shortName;});

		node
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',1);

		node
			.select('rect')
			.transition()
				.duration(animationDuration)
				.attr('width',sankey.nodeWidth())
				.attr('height',function(d){return Math.max(0,d.dy);});
		nodeText
			.transition()
				.duration(animationDuration)
				.style('text-anchor',function(d){return (d.x < innerWidth/2)? 'start':'end';})
				.attr('x',function(d){return (d.x < innerWidth/2)? sankey.nodeWidth()+5:-5;})
				.attr('y',function(d){return d.dy/2+5;})

		var link = selection.group.sankey.links.selectAll('g.d2b-sankey-link')
				.data(currentChartData.links,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else{
							return i;
						}
					});
		var newLink = link.enter()
			.append('g')
				.attr('class','d2b-sankey-link')
				.on('mouseover.d2b-mouseover',function(d,i){
					d2b.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.source.name+' <i class="fa fa-arrow-right"></i> '+d.target.name+'</b>',xFormat(d.value));
				})
				.on('mouseout.d2b-mouseout',function(d,i){
					d2b.UTILS.removeTooltip();
				})
				.style('opacity',0)
				.call(d2b.UTILS.bindElementEvents, _, 'link');

		// console.log(newLink)
		newLink.append('path');
		newLink.append('text');

		link.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		node.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();


		link
			.transition()
				.duration(animationDuration)
				.style('opacity',1);

		link
			.select('path')
				.style('stroke',function(d){
						return (d.colorBy)?
										color((d[d.colorBy].colorKey)?
											d[d.colorBy].colorKey
										:d[d.colorBy].name)
									:'#777';
								})
			.transition()
				.style('stroke-width',function(d){return Math.max(d.dy,minLinkWidth)})
				.duration(animationDuration)
				.attr('d',sankey.link());

		selection.svg
				.attr('width',width)
				.attr('height',height);

		selection.group.sankey
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*pie chart*/
d2b.CHARTS.pieChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = {element:{}};
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.legend.active(true);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.donutRatio = 0;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); });

	$$.arcText = d3.svg.arc();

	$$.pie = d3.layout.pie()
			.value(function(d){
				var value = ($$.persistentData.hiddenArcs[d.key])? 0 : d.value;
				$$.pieTotal += value;
				return value;
			})
			.sort(null);
	$$.pieTotal = 1;

	$$.persistentData = {
		focusedArc:null,
		hiddenArcs:{}
	};

	$$.arcKey = function(d,i){
		if(d.key == 'unique')
			return Math.floor((1 + Math.random()) * 0x10000);
		else if(d.key && d.key != 'auto')
			return d.key;
		else
			return d.label;
	};

	$$.arcEnter = function(){
		//set radius
		$$.r = 0.93*(Math.min($$.outerWidth,$$.outerHeight)/2);

		//init pie total
		$$.pieTotal = 0;

		$$.selection.pie.datum($$.currentChartData.values)
		$$.selection.pie.arc = $$.selection.pie.selectAll('g').data($$.pie, function(d){return d.data.key});

		//arc enter
		var newArc = $$.selection.pie.arc.enter()
			.append('g')
				.attr('class','d2b-arc')
				.style('opacity',0)
				.call(d2b.UTILS.bindElementEvents, $$, 'arc')
				.call(d2b.UTILS.tooltip, function(d){return '<b>'+d.data.label+'</b>';},function(d){return $$.xFormat(d.data.value);});

		//create arc path
		newArc.append('path')
			.each(function(d){
				//init old Arc
				this.oldArc = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});

		//create arc text
		newArc.append('text')
			.each(function(d){
				//init old position arc
				this.oldPosition = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});
	};

	$$.arcUpdate = function(){

		//update arc container
		$$.selection.pie.arc
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1);

		//update arc path
		$$.selection.pie.arc.path = $$.selection.pie.arc.select('path')
				.each(function(d){
					//update newArc object
					this.newArc = {
						start:d.startAngle,
						end:d.endAngle,
						inner:$$.r*$$.donutRatio,
						outer:(d.data.key == $$.persistentData.focusedArc)? $$.r*1.04 : $$.r
					};
				})
				.style('fill',function(d){
					if(d.data.colorKey){
						return $$.color(d.data.colorKey);
					}else{
						return $$.color(d.data.label);
					}
				})
				.on('mouseover.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = d.data.key;
					chart.update();
				})
				.on('mouseout.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);

		// arc text
		$$.selection.pie.arc.text = $$.selection.pie.arc.select('text')
			.transition()
				.duration($$.animationDuration/1.5)
				.tween("text", function(d) {
					//tween percent value
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, d.data.value/$$.pieTotal);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.attr('opacity',function(d){
					return ($$.persistentData.hiddenArcs[d.data.key])? 0 : 1;
				})
				.attrTween("transform", function(d) {
					//tween centroid position
					var _self = this;
					//update new position arc object
					_self.newPosition = {start:d.startAngle, end:d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
					var i = d3.interpolate(_self.oldPosition, _self.newPosition);
					return function(t){
						_self.oldPosition = i(t);
						return "translate("+$$.arc.centroid(_self.oldPosition)+")";
					};
				});
	};

	$$.arcExit = function(){
		$$.selection.pie.arc.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d){
					this.newArc = {start:d.endAngle, end: d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.donutRatio = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'donutRatio');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		$$.currentChartData.values.forEach(function(d){
			d.key = $$.arcKey(d);
		});

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend)
				.on('elementMouseover.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = d.key;
					chart.update();
				})
				.on('elementMouseout.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})
				.on('elementClick',function(d){
					$$.persistentData.hiddenArcs[d.key] = !$$.persistentData.hiddenArcs[d.key];

					var allHidden = true;

					$$.currentChartData.values.forEach(function(d){
						if(allHidden == true && !$$.persistentData.hiddenArcs[d.key])
							allHidden = false;
					});
					//if all types/graphs are hidden, show them all
					if(allHidden){
						for(var key in $$.persistentData.hiddenArcs)
							$$.persistentData.hiddenArcs[key] = false;
					}


					chart.update();
				})
				.on('elementDblClick',function(d){
					for(var key in $$.persistentData.hiddenArcs)
						$$.persistentData.hiddenArcs[key] = false;
					chart.update();
				});

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		$$.selection.pie = $$.selection.group
			.append('g')
				.attr('class','d2b-pie-chart');

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);
		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items:	$$.currentChartData.values.map(function(d){
						d.open = $$.persistentData.hiddenArcs[d.key];
						return d;
					})
				}
			};
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.pie
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left + $$.innerWidth/2)+','+($$.forcedMargin.top + $$.innerHeight/2)+')');

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.arcEnter();
		$$.arcUpdate();
		$$.arcExit();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */


/*axis chart*/
d2b.CHARTS.interactiveBarChart = function(){

	//define axisChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT();

	var innerHeight = height, innerWidth = width;
	var dimensions = {horizontal:innerWidth, vertical:innerHeight};

	var xScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'},
			yScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'};

	var scales = {
		horizontal:xScale,
		vertical:yScale
	}

	var xBand; //used for the bar width in barCharts

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new d2b.UTILS.LEGENDS.legend(),
	  	horizontalControls = new d2b.UTILS.CONTROLS.controls(),
			legendOrientation = 'bottom';

	var xFormat = function(value){return value};
	var yFormat = function(value){return value};

	//init event object
	var on = d2b.CONSTANTS.DEFAULTEVENTS();

	var orientation = {x:"x",y:"y",horizontal:"horizontal",vertical:"vertical",width:"width",height:"height",bottom:"bottom",left:"left"};

	var controls = {
				yAxisLock: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false,
					enabled: false,
					maxStacked:d2b.CONSTANTS.DEFAULTHEIGHT(),
					maxNonStacked:d2b.CONSTANTS.DEFAULTHEIGHT()
				},
				stacking: {
					label: "Stack Bars",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				horizontal: {
					label: "Horizontal",
					type: "checkbox",
					visible: false,
					enabled:false
				},
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {
				columns: {},
				labels:{x:'',y:''}
			};

	/*COLUMN METHODS*/

	// remove the column (fade out)
	var removeColumn = function(column){
		var columnToBeRemoved = column.svg;
		columnToBeRemoved
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.each('end',function(){
					columnToBeRemoved.remove();
				});

		return;
	}

	var updateColumn = function(column){
		var bar = column.svg.selectAll('rect').data(column.data.values, function(d){return d.x});
		bar.enter().append('rect')
				.attr('class','d2b-bar-rect')
				.style('opacity',0)
				.attr(orientation.height,0)
				.attr(orientation.y,(controls.horizontal.enabled)? 0:dimensions.vertical)
				.on('mouseover.d2b-mouseover',function(d,i){
					d2b.UTILS.createGeneralTooltip(d3.select(this),'<b>'+column.key+' <i>('+xFormat(d.x)+')</i></b> ',yFormat(d.y))
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i,'bar');
					}
				})
				.on('mouseout.d2b-mouseout',function(d,i){
					d2b.UTILS.removeTooltip();
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i,'bar');
					}
				})
				.on('click.d2b-click',function(d,i){
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i,'bar');
					}
				});

		bar
				.style('fill', color(column.data.label))
				// .style('stroke-width','0.6px')
				.style('opacity',1);

		bar.transition()
				.duration(animationDuration)
				.attr(orientation.x,function(d){return d.xPos;})
				.attr(orientation.y,function(d){return d.yPos;})
				.attr(orientation.width,function(d){return d[orientation.width];})
				.attr(orientation.height,function(d){return d[orientation.height];})
				// .style('stroke', color(column.data.label));

		bar.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr(orientation.height,0)
				.attr(orientation.y,(controls.horizontal.enabled)? 0:dimensions.vertical)
				.remove();
	};

	//offset correction for ordinal axis
	var offsetPointX = function(){
		if(xScale.type == 'ordinal')
			return xScale.scale.rangeBand()/2;
		else
			return 0;
	}

	//compute bar positions for all bar columns (stacked vs grouped)
	var computeBarPositions = function(columns){
		var xBand;
		var barWidth;
		var xBandDefault = innerWidth/(columns.length * 2);

		var yVals = {};

		if(controls.stacking.enabled){
			if(xScale.type == 'ordinal'){
				xBand = scales[orientation.horizontal].scale.rangeBand();
				barWidth = xBand * 0.6;
			}else{
				xBand = -xBandDefault*2.5;
				barWidth = xBandDefault;
			}
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){

					if(controls.horizontal.enabled){
						bar[orientation.height] = scales[orientation.vertical].scale(bar.y);
						yVals[bar.x] = yVals[bar.x] || 0;
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand * 0.2;
						bar.yPos = yVals[bar.x];
						yVals[bar.x] += bar[orientation.height];
						bar[orientation.width] = barWidth;
					}else{
						bar[orientation.height] = (dimensions[orientation.vertical] - scales[orientation.vertical].scale(bar.y));
						yVals[bar.x] = yVals[bar.x] || dimensions[orientation.vertical];
						yVals[bar.x] -= bar[orientation.height];
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand * 0.2;
						bar.yPos = yVals[bar.x];
						bar[orientation.width] = barWidth;
					}
				});
			});
		}else{
			if(xScale.type == 'ordinal'){
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([0, xScale.scale.rangeBand()], 0.05, 0);
			}else{
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([-xBandDefault/2, xBandDefault/2], 0.05, 0.3);
			}
			barWidth = xBand.rangeBand();
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(controls.horizontal.enabled){
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand(column.data.label);
						bar[orientation.height] = yScale.scale(bar.y);
						bar.yPos = 0;
						bar[orientation.width] = barWidth;
					}else{
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand(column.data.label);
						bar[orientation.height] = dimensions[orientation.vertical] - yScale.scale(bar.y);
						bar.yPos = dimensions[orientation.vertical] - bar[orientation.height];
						bar[orientation.width] = barWidth;
					}
				});
			});
		}
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	chart.xScale = function(value){
		if(!arguments.length) return xScale;
		xScale.type = value.type;
		xScale.domain = value.domain;
		// generateRequired = true;

		if(value.type == 'linear'){
			xScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			xScale.scale = d3.scale.ordinal();
		}

		if(!value.domain)
			xScale.domain = 'auto';

		return chart;
	};
	chart.yScale = function(value){
		if(!arguments.length) return yScale;
		yScale.type = value.type;
		yScale.domain = value.domain;
		// generateRequired = true;

		if(value.type == 'linear'){
			yScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			yScale.scale = d3.scale.ordinal();
		}

		if(!value.domain)
			yScale.domain = 'auto';

		return chart;
	};

	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	// chart.horizontal = function(value){
	// 	if(!arguments.length) return controls.horizontal.enabled;
	// 	controls.horizontal.enabled = value;
	// 	return chart;
	// }

	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.yAxisLock){
			controls.yAxisLock.visible = (value.yAxisLock.visible != null)? value.yAxisLock.visible:controls.yAxisLock.visible;
			controls.yAxisLock.enabled = (value.yAxisLock.enabled != null)? value.yAxisLock.enabled:controls.yAxisLock.enabled;
			controls.yAxisLock.maxStacked = (value.yAxisLock.maxStacked != null)? value.yAxisLock.maxStacked:controls.yAxisLock.maxStacked;
			controls.yAxisLock.maxNonStacked = (value.yAxisLock.maxNonStacked != null)? value.yAxisLock.maxNonStacked:controls.yAxisLock.maxNonStacked;
		}
		if(value.stacking){
			controls.stacking.visible = (value.stacking.visible != null)? value.stacking.visible:controls.stacking.visible;
			controls.stacking.enabled = (value.stacking.enabled != null)? value.stacking.enabled:controls.stacking.enabled;
		}
		if(value.horizontal){
			controls.horizontal.visible = (value.horizontal.visible != null)? value.horizontal.visible:controls.horizontal.visible;
			controls.horizontal.enabled = (value.horizontal.enabled != null)? value.horizontal.enabled:controls.horizontal.enabled;
		}
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}
		return chart;
	};
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		legend.animationDuration(animationDuration);
		horizontalControls.animationDuration(animationDuration);
		return chart;
	};


	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = d2b.UTILS.numberFormat(value);
		return chart;
	};
	chart.yFormat = function(value){
		if(!arguments.length) return yFormat;
		yFormat = d2b.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {
							columns: {},
							labels:{x:'',y:''}
						};
			generateRequired = true;
		}

		chartData.data.columns.forEach(function(d,i){
			var c;
			if(currentChartData.columns[d.label]){
				c = currentChartData.columns[d.label];
				c.data.values = d.values || c.data.values;
				c.type = d.type;
			}else{
				c = currentChartData.columns[d.label] = {data:d, type:d.type};
				if(!generateRequired){
					c.svg = selection.group.columns
						.append('g');
				}
			}
			if(c.type == 'none'){
				removeColumn(c);
				delete currentChartData.columns[d.label];
			}
		});
		if(chartData.data.labels)
			currentChartData.labels = chartData.data.labels;
		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','d2b-interactive-bar-chart d2b-svg d2b-container');

		//create group container
		selection.group = selection.svg.append('g');

		//create axis containers
		selection.group.axes = selection.group
			.append('g')
				.attr('class','d2b-axes');
		selection.group.axes.x = selection.group.axes
			.append('g')
				.attr('class','d2b-x d2b-axis');
		selection.group.axes.y = selection.group.axes
			.append('g')
				.attr('class','d2b-y d2b-axis');
		selection.group.axes.xLabel = selection.group.axes
			.append('g')
				.attr('class','d2b-x-label')
			.append('text');
		selection.group.axes.yLabel = selection.group.axes
			.append('g')
				.attr('class','d2b-y-label')
			.append('text');



		//create column containers
		selection.group.columns = selection.group
			.append('g')
				.attr('class','d2b-columns');

		for(key in currentChartData.columns){
			currentChartData.columns[key].svg = selection.group.columns
				.append('g');
		}

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','d2b-controls');

		//intialize new controls
		horizontalControls
				.selection(selection.controls)
				.on('change',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});

		//create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','d2b-legend');

		//intialize new legend
		legend
				.color(color)
				.selection(selection.legend)
				.on('elementMouseover.d2b-mouseover',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/2)
							.style('opacity',0.35);
					d.data.svg.selectAll('rect')
						.transition()
							.duration(0)
							.style('opacity',1);
					// .classed('d2b-legend-mouseover',true);
				})
				.on('elementMouseout.d2b-mouseout',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/4)
							.style('opacity',1);
					// d.data.svg.classed('d2b-legend-mouseover',false);
				});


		//auto update chart
		var temp = animationDuration;
		chart.animationDuration(0);
		chart.update(callback);
		chart.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		forcedMargin.bottom += 20;
		forcedMargin.left += 20;

		if(controls.horizontal.enabled){
			scales = {
					horizontal:yScale,
					vertical:xScale
				}
			orientation = {x:"y",y:"x",horizontal:"vertical",vertical:"horizontal",width:"height",height:"width",bottom:"left",left:"bottom"};
		}else{
			scales = {
					horizontal:xScale,
					vertical:yScale
				}
			orientation = {x:"x",y:"y",horizontal:"horizontal",vertical:"vertical",width:"width",height:"height",bottom:"bottom",left:"left"};
		}

		var columns = d2b.UTILS.getValues(currentChartData.columns);

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		if(controls.hideLegend.enabled){
			var legendData = {data:{items:[]}};
		}else{
			var legendData = {
				data:{
					items:columns
									.filter(function(d){return d.newType != 'none';})
									.map(function(d){return {label:d.data.label,type:d.newType,data:d};})
									.sort(function(a,b){return a.label-b.label})
				}
			};
		}
		legend.width(innerWidth).data(legendData).update();

		var controlsData = d2b.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.width(innerWidth).data(controlsData).update();
		forcedMargin.top += horizontalControls.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+((forcedMargin.left) + innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10+(forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10)+')');


		if(legendOrientation == 'right' || legendOrientation == 'left'){
			legend.orientation('vertical').height(innerHeight).update();
		}
		else{
			legend.orientation('horizontal').width(innerWidth).update();
		}

		var legendTranslation;
		if(legendOrientation == 'right')
			legendTranslation = 'translate('+(forcedMargin.left+innerWidth-legend.computedWidth())+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'left')
			legendTranslation = 'translate('+(forcedMargin.left)+','+((innerHeight-legend.computedHeight())/2+forcedMargin.top)+')';
		else if(legendOrientation == 'top')
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(forcedMargin.top-20)+')';
		else
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(25+innerHeight+forcedMargin.top-legend.computedHeight())+')';

		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform',legendTranslation);

		if(legendOrientation == 'right' || legendOrientation == 'left')
			forcedMargin[legendOrientation] += legend.computedWidth() + 30;
		else
			forcedMargin[legendOrientation] += legend.computedHeight() + 10;

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		innerWidth = width - forcedMargin.right - forcedMargin.left;

		dimensions = {horizontal:innerWidth, vertical:innerHeight};

		//gather x and y values to find domain
		var xVals = [];
		var yVals = [];

	  var yValsStackedBars = {};
		if(controls.stacking.enabled){
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(!yValsStackedBars[bar.x])
						yValsStackedBars[bar.x] = 0;
					yValsStackedBars[bar.x] += bar.y;
					xVals.push(bar.x);
					yVals.push(bar.y);
				});
			});
			yVals = yVals.concat(d2b.UTILS.getValues(yValsStackedBars));
		}else{
			columns.forEach(function(column){
				if(column.data.values){
					column.data.values.forEach(function(bar){
						xVals.push(bar.x);
						yVals.push(bar.y);
					});
				}
			});
		}

		var domains = {};

		if(scales[orientation.horizontal].type == 'ordinal'){
			scales[orientation.horizontal].scale.rangeRoundBands([0, dimensions[orientation.horizontal]], .1);
			domains[orientation.horizontal] = d2b.UTILS.AXISCHARTS.getDomainOrdinal(xVals).sort();
		}else{
			scales[orientation.horizontal].scale.range([0, dimensions[orientation.horizontal]])
			domains[orientation.horizontal] = d2b.UTILS.AXISCHARTS.getDomainLinear(xVals);
		}
		if(controls.yAxisLock.enabled){
			if(controls.stacking.enabled){
				domains[orientation.vertical] = [0,controls.yAxisLock.maxStacked];
			}else{
				domains[orientation.vertical] = [0,controls.yAxisLock.maxNonStacked];
			}
		}else{
			domains[orientation.vertical] = d2b.UTILS.AXISCHARTS.getDomainLinear(yVals);
		}
		scales[orientation.vertical].scale.range([dimensions[orientation.vertical], 0]);


		if(scales[orientation.horizontal].domain == 'auto')
			scales[orientation.horizontal].scale.domain(domains[orientation.horizontal]);
		else{
			scales[orientation.horizontal].scale.domain(scales[orientation.horizontal].domain);
		}

		if(scales[orientation.vertical].domain == 'auto')
			scales[orientation.vertical].scale.domain(domains[orientation.vertical]);
		else
			scales[orientation.vertical].scale.domain(scales[orientation.vertical].domain);

		if(controls.horizontal.enabled){
			// scales[orientation.horizontal].scale.domain(scales[orientation.horizontal].scale.domain().reverse());
			scales[orientation.vertical].scale.domain(scales[orientation.vertical].scale.domain().reverse());
		}


		//resize svg
		selection.svg
				.attr('width',width)
				.attr('height',height);

		//create x and y axes
		scales[orientation.vertical].scale.nice(5)
		var axes = {
			x:d3.svg.axis()
				.scale(scales[orientation.horizontal].scale)
				.orient(orientation.bottom)
				.tickFormat(xFormat),
			y:d3.svg.axis()
				.scale(scales[orientation.vertical].scale)
				.orient(orientation.left)
				.tickFormat(yFormat)
		};

		//initialize y-axes transition
		selection.group.axes[orientation.y]
			.transition()
				.duration(animationDuration)
				.call(axes[orientation.y]);

		//find the longest y-axis tick text
		var longestTick = 0;
		selection.group.axes[orientation.y].selectAll('.tick text').each(function(){
			if(longestTick < this.getComputedTextLength())
				longestTick = this.getComputedTextLength();
		})

		forcedMargin.left += longestTick;

		//resize the width based on the longest tick text
		innerWidth = width - forcedMargin.right - forcedMargin.left;

		dimensions.horizontal = innerWidth;
		// console.log(scales.horizontal.scale.domain())
		//Re asign the x-axis range to account for width resize
		if(controls.horizontal.enabled){
			if(scales.horizontal.type == 'linear'){
				scales.horizontal.scale.range([dimensions.horizontal, 0])
			}else if(scales.horizontal.type == 'ordinal'){
				scales.horizontal.scale.rangeRoundBands([dimensions.horizontal, 0], .1);
			}
		}else{
			if(scales.horizontal.type == 'linear'){
				scales.horizontal.scale.range([0, dimensions.horizontal])
			}else if(scales.horizontal.type == 'ordinal'){
				scales.horizontal.scale.rangeRoundBands([0, dimensions.horizontal], .1);
			}
		}


	  //set tickSize for grid
		axes.x.tickSize(-dimensions[orientation.vertical])
		axes.y.tickSize(-dimensions[orientation.horizontal]);

		//transition x-axis
		selection.group.axes[orientation.x]
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top+innerHeight) +')')
				.call(axes[orientation.x]);
		//transition y-axis
		selection.group.axes[orientation.y]
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top) +')')
				.call(axes[orientation.y]);


		//set the xBand, this is used for bar chart inconsistancies between different scale types.
		if(scales[orientation.horizontal].type == 'ordinal'){
			xBand = d3.scale.ordinal()
					.domain(columns.map(function(c){return c.data.label}))
					.rangeRoundBands([0, scales[orientation.horizontal].scale.rangeBand()]);
		}else{
			xBand = dimensions[orientation.horizontal]/(columns.length * 20)
		}

		//update axis labels
		selection.group.axes[orientation.x+"Label"]
			.transition()
				.duration(animationDuration)
				.text(currentChartData.labels[orientation.x])
				.attr('transform', 'translate('+(forcedMargin.left + innerWidth/2)+','+(innerHeight + 30 + (forcedMargin.top))+')');
				// .attr('transform', 'translate('+(innerWidth/2)+','+(innerHeight + 30)+')');

		selection.group.axes[orientation.y+"Label"]
			.transition()
				.duration(animationDuration)
	      .attr('transform', 'translate('+(forcedMargin.left-longestTick-10)+','+(innerHeight/2+(forcedMargin.top))+'),rotate(-90)')
			      // .attr('transform', 'translate('+(-35)+','+(innerHeight/2)+'),rotate(-90)')
				.text(currentChartData.labels[orientation.y]);

		selection.group.columns
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top) +')');
				// .attr('transform','translate('+ (0) +','+ (0) +')');


		//calculate positions
		computeBarPositions(columns);

		columns.forEach(function(c,i){
			updateColumn(c);
		});


		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	}

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*guage chart*/
d2b.CHARTS.guageChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	$$.percentFormat = d2b.UTILS.numberFormat({"precision":2,"units":{"after":'%'}});

	$$.arc = d3.svg.arc()
		.innerRadius(0)
		.outerRadius(0)
    .startAngle(function(d, i){return d.start;})
    .endAngle(function(d, i){return d.end;});

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;


		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-template-chart d2b-svg d2b-container');

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-guage-chart');

		$$.selection.arcs = $$.selection.main.append('g');


		$$.selection.arcHeader = $$.selection.main
			.append('text')
				.attr('class','d2b-guage-arc-header');

		$$.selection.arcLabels = $$.selection.main
			.append('g')
						.attr('class','d2b-guage-arc-labels');

		$$.selection.arcLabels.start = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('0%');
		$$.selection.arcLabels.end = $$.selection.arcLabels.append('text')
				.attr('y', 20)
				.text('100%');
		$$.selection.arcLabels.percent = $$.selection.arcLabels
			.append('text')
				.attr('class', 'd2b-guage-arc-percent')
				.text('0%');

		// $$.selection.arcs.filled = $$.selection.arcs.append('path');
		// $$.selection.arcs.empty = $$.selection.arcs.append('path');

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);



		var radius = {
					current:{outer:Math.min($$.outerHeight * 2 - 80, $$.outerWidth)/2},
					previous:{inner:$$.arc.innerRadius(),outer:$$.arc.outerRadius()}
				};
		radius.current.inner = 0.8 * radius.current.outer;

		$$.arc
			.innerRadius(radius.current.inner)
			.outerRadius(radius.current.outer);

		//Set the data for the filled and empty arcs either by:
		//	-using the user supplied percent
		//	-calculating the percent with the value and total amounts
		//	-defaulting the percen to 0
		var data = [];
		var percent = 0;
		if($$.currentChartData.percent){
			percent = $$.currentChartData.percent;
			data = [
				{
					percent: percent,
					start: -Math.PI/2,
					end:Math.PI*$$.currentChartData.percent-Math.PI/2,
					color: $$.color($$.currentChartData.label),
					filled:true
				},
				{
					percent: percent,
					start: Math.PI*$$.currentChartData.percent-Math.PI/2,
					end:Math.PI/2,
					color: '#ddd',
					filled:false
				}
			];
		}else if($$.currentChartData.value && $$.currentChartData.total){
			percent = $$.currentChartData.value/$$.currentChartData.total;
			data = [
				{
					percent: percent,
					start: -Math.PI/2,
					end:Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2,
					color: $$.color($$.currentChartData.label),
					filled:true
				},
				{
					percent: percent,
					start: Math.PI*$$.currentChartData.value/$$.currentChartData.total-Math.PI/2,
					end:Math.PI/2, color: '#ddd', filled:false
				}
			];
		}else{
			percent = 0;
			data = [
				{
					percent: percent,
					start:-Math.PI/2,
					end:-Math.PI/2,
					color: $$.color($$.currentChartData.label),
					filled:true
				},
				{
					percent: percent,
					start:-Math.PI/2,
					end:Math.PI/2,
					color:"#ddd",
					filled : false
				}
			];
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll('g').data(data);

		var newArc = $$.selection.arcs.arc.enter()
			.append('g')
		newArc
			.append('path')
				.attr('d', $$.arc)
				.style('fill', function(d){return d.color;})
				.each(function(d){
					this._current = {start:d.start, end:d.end};
					this._radiusCurrent = {inner:radius.current.inner, outer:radius.current.outer};
				})
		newArc.filter(function(d){return d.filled;})
				.on('mouseover.d2b-mouseover',function(d,i){
					var arc = d3.select(this);
					arc
						.transition()
							.duration($$.animationDuration/4)
							.attr('transform','scale(1.05)');
					d2b.UTILS.createGeneralTooltip(arc,'<b>'+$$.currentChartData.label+'</b>',$$.percentFormat( 100*d.percent ));
				})
				.on('mouseout.d2b-mouseout',function(d,i){
					var arc = d3.select(this);
					arc
						.transition()
							.duration($$.animationDuration/4)
							.attr('transform','scale(1)');
					d2b.UTILS.removeTooltip();
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'arc');

		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
			.transition()
				.duration($$.animationDuration)
				.attrTween('d', function(d){
					var _self = this;
					var i = d3.interpolate(_self._current, {start: d.start, end: d.end});
					var r = d3.interpolate(_self._radiusCurrent, {inner:radius.current.inner, outer:radius.current.outer});
					return function(t) {
						_self._current = i(t);
						_self._radiusCurrent = r(t);
						$$.arc
							.innerRadius(_self._radiusCurrent.inner)
							.outerRadius(_self._radiusCurrent.outer);
						return $$.arc(_self._current);
					};
				})
				.style('fill', function(d){return d.color;})
				.attr('class', 'd2b-arc');

		// $$.selection.main
			// .transition()
			// 	.duration($$.animationDuration)
	    //   .attr('transform','translate('+$$.outerWidth+','+$$.outerHeight+')');


		$$.selection.arcs
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-10)+')');

		$$.selection.arcLabels
			.transition()
				.duration($$.animationDuration)
	      .attr('transform','translate('+$$.outerWidth/2+','+($$.outerHeight-10)+')');

		$$.selection.arcLabels.percent
			.transition()
				.duration($$.animationDuration)
				.tween("text", function(d) {
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, percent);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.attr('font-size', radius.current.inner * 0.5 + 'px');

		$$.selection.arcLabels.start
			.transition()
				.duration($$.animationDuration)
				.attr('x', -(radius.current.outer - (radius.current.outer-radius.current.inner)/2));
		$$.selection.arcLabels.end
			.transition()
				.duration($$.animationDuration)
				.attr('x', (radius.current.outer - (radius.current.outer-radius.current.inner)/2));


		$$.selection.arcHeader
				.text($$.currentChartData.label)
			.transition()
				.duration($$.animationDuration)
				.attr('x',$$.outerWidth/2)
				.attr('y',20);


		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*iframe chart*/
d2b.CHARTS.iframeChart = function(){

	//define iframeChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT();

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {
			};

	//init event object
	var on = d2b.CONSTANTS.DEFAULTEVENTS();

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chart;
	};

	chart.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
		}

		generateRequired = true;
		currentChartData = chartData.data;

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		selection.div = selection
			.append('div')
				.attr('class','d2b-iframe-chart d2b-container');

		selection.div.iframe = selection.div
			.append('iframe')
				.attr('class','d2b-iframe')
				.attr('src',currentChartData.url);

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		selection.div.iframe
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*multi chart*/
d2b.CHARTS.multiChart = function(){
	//define multiChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			height = d2b.CONSTANTS.DEFAULTHEIGHT();

	var innerWidth, innerHeight;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {
			};

	var current = {chart:{}};
	var previous = {chart:null};

	var adChart;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	var buttonClick = function(d,i){
		previous.chart = current.chart;
		current.chart = d;
		for(key in on.elementClick){
			on.elementClick[key].call(this,d,i,'chart-button');
		}
		// console.log(current.chart)
		chart.update();
	};
	var buttonMouseover = function(d,i){
		for(key in on.elementMouseover){
			on.elementMouseover[key].call(this,d,i,'chart-button');
		}
	};
	var buttonMouseout = function(d,i){
		for(key in on.elementMouseout){
			on.elementMouseout[key].call(this,d,i,'chart-button');
		}
	};
	var updateButtons = function(){
		selection.buttonsWrapper.buttons.button = selection.buttonsWrapper.buttons.selectAll('li').data(currentChartData.charts, function(d){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000)
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});
		selection.buttonsWrapper.buttons.button.enter()
			.append('li')
			.on('click.d2b-click', buttonClick)
			.on('mouseover.d2b-mouseover', buttonMouseover)
			.on('mouseout.d2b-mouseout', buttonMouseout);

		selection.buttonsWrapper.buttons.button
			.text(function(d){return d.label;})
			.classed('d2b-selected',function(d){return d == current.chart;});

	};

	var setChartProperties = function(){
		if(current.chart.properties){
			for(key in current.chart.properties){
				if(current.chart.properties[key].args)
					adChart[key].apply(this, current.chart.properties[key].args);
				else
					adChart[key](current.chart.properties[key]);
			}
		}
		var masterType = 'multiChart-'+current.chart.type+'-';
		adChart
			.on('elementClick.d2b-click', function(d,i,type){
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i,masterType+type);
					}
			})
			.on('elementMouseover.d2b-mouseover', function(d,i,type){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i,masterType+type);
					}
			})
			.on('elementMouseout.d2b-mouseout', function(d,i,type){
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i,masterType+type);
					}
			})
	};

	var updateChart = function(){
		if(!selection.chartWrapper.chart){
			selection.chartWrapper.chart = selection.chartWrapper
				.append('div')
					.attr('class','d2b-multi-chart-chart')
					.style('opacity',1);
			// d2b.UTILS.chartAdapter(current.chart.type, current.chart);
			adChart = current.chart.chart;
			adChart
				.selection(selection.chartWrapper.chart)
				.data(current.chart.data); //clone data for update
		}else if(current.chart != previous.chart){
			if(current.chart.type == previous.chart.type){
				adChart
					.data(current.chart.data); //clone data for update
			}else{
				selection.chartWrapper.chart
					.transition()
						.duration(animationDuration)
						.style('opacity',0)
						.remove();

				selection.chartWrapper.chart = selection.chartWrapper
					.append('div')
						.attr('class','d2b-multi-chart-chart')
						.style('opacity',0);

				// d2b.UTILS.chartAdapter(current.chart.type, current.chart);
				adChart = current.chart.chart;
				adChart
					.selection(selection.chartWrapper.chart)
					.data((JSON.parse(JSON.stringify(current.chart.data)))); //clone data for update

				selection.chartWrapper.chart
					.transition()
						.duration(animationDuration)
						.style('opacity',1);
			}
		}

		setChartProperties();
		adChart
			.width(innerWidth)
			.height(innerHeight)
			.update();

		previous.chart = current.chart;
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chart;
	};

	chart.on = function(key, value){
		key = key.split('.');
		if(!arguments.length) return on;
		else if(arguments.length == 1){
			if(key[1])
				return on[key[0]][key[1]];
			else
				return on[key[0]]['default'];
		};

		if(key[1])
			on[key[0]][key[1]] = value;
		else
			on[key[0]]['default'] = value;

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
		}

		var useDefault = true;

		if(current.chart.key){
			var matchingChart = chartData.data.charts.filter(function(d){
					return current.chart.key == d.key;
				})[0];
			if(matchingChart){
				useDefault = false;
				current.chart = matchingChart;
			}
		}

		if(useDefault)
			current.chart = chartData.data.charts[0];

		generateRequired = true;
		currentChartData = chartData.data;

		currentChartData.charts.forEach(function(d){
			d.chart = new d2b.CHARTS[d.type]();
		});

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		// selection
		// 	.style('width',width + 'px')
		// 	.style('height',height + 'px');

		//create button container
		selection.buttonsWrapper = selection
			.append('div')
				.attr('class','d2b-multi-chart-buttons-wrapper');

		selection.buttonsWrapper.buttons = selection.buttonsWrapper
			.append('ul')
				.attr('class','d2b-buttons');

		// selection.style('position','relative');
		selection.chartWrapper = selection
			.append('div')
				.attr('class','d2b-multi-chart d2b-container');

		// currentChartData.charts.forEach(function(d){
		// 	d.chart.selection(selection.chartWrapper);
		// });

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		innerWidth = width;
		innerHeight = height - 50;

		selection.chartWrapper
			.style('width',innerWidth + 'px')
			.style('height',innerHeight + 'px');

		updateButtons();

		updateChart();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
d2b.CHARTS.templateChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-main-chart');

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			//----replace array with a custom legend builder
			$$.legendData.data.items = [{'label':'item 1'},{'label':'item 2'},{'label':'item 3'},{'label':'item 4'},{'label':'item 5'},{'label':'item 6'}]
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//----chart code goes here!
		//----use innerHeight/innerWidth as the context dimensions and use forcedMargin.|left, right, top, or bottom| as the current positioning margin

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.scatter = function(){
  
};

/* Copyright � 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bar*/
d2b.UTILS.AXISCHART.TYPES.bar = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

  $$.groupScale = d3.scale.ordinal();

  $$.updateStackedVals = function(yVal, bar){
    if(bar.sHeight < 0){
      yVal+=bar.height;
      return {newValue: yVal, modifier: -bar.height};
    }else{
      yVal-=bar.height;
      return {newValue: yVal, modifier: 0};
    }
  };

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

  chart.xValues = function(){
    var values = [];
    $$.currentChartData.forEach(function(d){
      values = values.concat(d.values.map(function(v){return v.x;}));
    });
    return values;
  };

  chart.yValues = function(){
    var stackedValues = {};
    var values = [0];

    if($$.controlsData.stackBars.enabled){
      $$.currentChartData.forEach(function(d){
        d.values.forEach(function(v){
          if(!stackedValues[v.x]){
            stackedValues[v.x] = {positive:0, negative:0};
          }
          if(v.y > 0){
            stackedValues[v.x].positive += v.y;
          }else{
            stackedValues[v.x].negative += v.y;
          }
        });
      });
      for(var x in stackedValues){
        values.push(stackedValues[x].negative);
        values.push(stackedValues[x].positive);
      }
    }else{
      $$.currentChartData.forEach(function(d){
        values = values.concat(d.values.map(function(v){return v.y;}));
      });
    }

    return values;
  };

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

    var barLabels = $$.currentChartData.map(function(d){return d.label;});
    $$.groupScale
      .domain(barLabels)
      .rangeBands([0, $$.x.rangeBand]);
    var stackedYVals = {};

		$$.background.each(function(graphData){
			var graph = d3.select(this);

      var bar = graph.selectAll('rect').data(graphData.values, function(d,i){
        return d.x;
      });
      var newBar = bar.enter()
        .append('rect')
        .style('fill', $$.color(graphData.label))
        .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d.y);})
				.call(d2b.UTILS.bindElementEvents, $$, 'bar');

      if($$.controlsData.stackBars.enabled){
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2})
            .attr('y', function(d){
              if(!stackedYVals[d.x]){
                stackedYVals[d.x] = {negative:$$.y.customScale(0), positive:$$.y.customScale(0)};
              }

              var updateScheme;
              if(d.y < 0){
                updateScheme = $$.updateStackedVals(stackedYVals[d.x].negative, $$.y.customBarScale(d.y));
                stackedYVals[d.x].negative = updateScheme.newValue;
                return stackedYVals[d.x].negative + updateScheme.modifier;
              }else{
                updateScheme = $$.updateStackedVals(stackedYVals[d.x].positive, $$.y.customBarScale(d.y));
                stackedYVals[d.x].positive = updateScheme.newValue;
                return stackedYVals[d.x].positive + updateScheme.modifier;
              }

            })
            .attr('width',function(d){return Math.max(0, $$.x.rangeBand);})
            .attr('height', function(d){return $$.y.customBarScale(d.y).height;});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }else{
        newBar
            .attr('y',$$.y.customScale(0))
            .attr('height',0);

				var spacing = Math.min(1,($$.groupScale.rangeBand()*0.1));

        bar
          .transition()
            .duration($$.animationDuration)
            .attr('x',function(d){return $$.x.customScale(d.x) - $$.x.rangeBand/2 + $$.groupScale(graphData.label)+spacing;})
            .attr('width',function(d){return Math.max(0, $$.groupScale.rangeBand() - 2*spacing);})
            .attr('y', function(d){return $$.y.customBarScale(d.y).y;})
            .attr('height', function(d){return $$.y.customBarScale(d.y).height;});

        bar.exit()
          .transition()
            .duration($$.animationDuration)
            .attr('y', $$.y.customScale(0))
            .attr('height',0);
      }



		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

d2b.UTILS.AXISCHART.TYPES.bar.tools = function(){
  return {
    controlsData:{
      stackBars: {
        label: "Stack Bars",
        type: "checkbox",
        visible: false,
        enabled: false
      }
    }
  }
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-line*/
d2b.UTILS.AXISCHART.TYPES.line = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	$$.line = d3.svg.line()
    .x(function(d) { return $$.x.customScale(d.x); })
    .y(function(d) { return $$.y.customScale(d.y); });

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.y;}));
		});
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData,i){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path')
					.call(d2b.UTILS.bindElementEvents, $$, 'line');
			}

			if(graphData.interpolate){
				$$.line.interpolate(graphData.interpolate);
			}else{
				$$.line.interpolate('linear');
			}

			path
					.style('stroke', function(d){return $$.color(graphData.label);})
				.datum(function(d){return graphData.values;})
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.line);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			var point = graph.selectAll('g').data(function(d){return d.values;});

			newPoint = point.enter()
				.append('g')
				.attr('transform',function(d){
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';
				});

			newPoint
				.append('circle')
					.attr('r', 3.5);

			newPoint
				.append('circle')
					.attr('r', 3.5)
					.on('mouseover.d2b-mouseover',function(){
						d3.select(this)
							.transition()
								.duration($$.animationDuration/2)
								.attr('r',7)
					})
					.on('mouseout.d2b-mouseover',function(){
						d3.select(this)
							.transition()
								.duration($$.animationDuration/2)
								.attr('r',3.5)
					})
					.style('fill-opacity',0)
					.call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d.y);})
					.call(d2b.UTILS.bindElementEvents, $$, 'line-point');


			point
				.selectAll('circle')
					.style('stroke', $$.color(graphData.label))
					.style('fill', 'white');

			point
				.transition()
					.duration($$.animationDuration)
					.attr('transform',function(d){
						return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d.y)+')';
					});

			point.exit()
				.transition()
					.duration($$.animationDuration)
					.style('opacity',0)
					.attr('r',0)
					.remove();
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-area*/
d2b.UTILS.AXISCHART.TYPES.area = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	$$.area = d3.svg.area()
    .x(function(d) { return $$.x.customScale(d.x); })
    .y1(function(d) { return $$.y.customScale(d.y); })
    .y0(function(d) { return $$.y.customScale(d.y0); });


	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	$$.updatePoints = function(graphData, graph, yType){

		$$.foreground.point[yType] = graph.selectAll('g.d2b-'+yType+'-point').data(function(d){return d.values;});

		var newPoint = $$.foreground.point[yType].enter()
			.append('g')
				.attr('class','d2b-'+yType+'-point')
				.attr('transform',function(d){
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d[yType])+')';
				});

		newPoint
			.append('circle')
				.attr('r', 3.5)

		newPoint
			.append('circle')
				.attr('r', 3.5)
				.style('fill-opacity',0)
				.on('mouseover.d2b-mouseover',function(){
					d3.select(this)
						.transition()
							.duration($$.animationDuration/2)
							.attr('r',7)
				})
				.on('mouseout.d2b-mouseover',function(){
					d3.select(this)
						.transition()
							.duration($$.animationDuration/2)
							.attr('r',3.5)
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'area-point-'+yType)
				.call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d[yType]);});

		$$.foreground.point[yType]
			.selectAll('circle')
				.style('stroke', $$.color(graphData.label))
				.style('fill', 'white');

		$$.foreground.point[yType]
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){
					return 'translate('+$$.x.customScale(d.x)+','+$$.y.customScale(d[yType])+')';
				});

		$$.foreground.point[yType].exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.attr('r',0)
				.remove();

	};

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.values.map(function(d){return d.y;}));
			values = values.concat(graphData.values.map(function(d){return d.y0;}));
		});
		return values;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			var path = graph.select('path');
			if(path.size() == 0){
				path = graph.append('path')
					.call(d2b.UTILS.bindElementEvents, $$, 'area');
			}

			if(graphData.interpolate){
				$$.area.interpolate(graphData.interpolate);
			}else{
				$$.area.interpolate('linear');
			}

			path
					.style('stroke', function(d){return $$.color(graphData.label);})
					.style('fill', function(d){return $$.color(graphData.label);})
				.datum(function(d){return graphData.values;})
				.transition()
					.duration($$.animationDuration)
					.attr("d", $$.area);

		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);

			graph.on('mouseover', function(){
				console.log(d3.event)
			});

			$$.foreground.point = {};

			$$.updatePoints(graphData, graph, 'y');
			$$.updatePoints(graphData, graph, 'y0');
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-histogram*/
d2b.UTILS.AXISCHART.TYPES.histogram = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	$$.hist = d3.layout.histogram();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	chart.xValues = function(){
    var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.x;}));
		});
    return values;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
			values = values.concat(graphData.histData.map(function(d){return d.y;}));
		});
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		$$.currentChartData.forEach(function(graphData){
			graphData.histData = $$.hist.bins(graphData.bins)(graphData.values);
		});

		return chart;
	};

	//chart update
	chart.update = function(callback){

		$$.background.each(function(graphData){
			var graph = d3.select(this);

			// console.log
			var xVals = graphData.histData.map(function(d){return d.x;});
			var xRange = [$$.x.customScale(d3.min(xVals)),
										$$.x.customScale(d3.max(xVals))];
			// console.log(histWidth)
			var barWidth = 1.03*Math.abs(xRange[0]-xRange[1])/graphData.histData.length;

			// var barWidth = ($$.width / data.length)/2;

			graph.selectAll('rect')

			var bar = graph.selectAll('rect').data(graphData.histData, function(d,i){
				return d.x;
			});

			var newBar = bar.enter()
				.append('rect')
					.call(d2b.UTILS.bindElementEvents, $$, 'histogram-bar')
					.style('fill', $$.color(graphData.label))
					.attr('y',$$.y.customScale(0))
					.attr('height',0)
					.call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+'</b>';},function(d){return $$.yFormat(d.y);});

			bar
				.transition()
					.duration($$.animationDuration)
					.attr('x',function(d){return $$.x.customScale(d.x) - barWidth/2;})
					.attr('width',function(d){return Math.max(0, barWidth);})
					.attr('y', function(d){return $$.y.customBarScale(d.y).y;})
					.attr('height', function(d){return $$.y.customBarScale(d.y).height;});

			bar.exit()
				.transition()
					.duration($$.animationDuration)
					.attr('y', $$.y.customScale(0))
					.attr('height',0);

		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-bubble-pack*/
d2b.UTILS.AXISCHART.TYPES.bubblePack = function(){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};

  $$.packData = [];

	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

  //pack layout
  $$.pack = d3.layout.pack()
    .size([500,500])
    .value(function(d) { return d.size; });

  $$.persistentData = {
    expandedNodes:{}
  };

  $$.resetExpandedNodes = function(node){
    $$.persistentData.expandedNodes[node.key] = false;
    if(node.children){
      node.children.forEach(function(child){
        $$.resetExpandedNodes(child);
      });
    }
  };

  //This function will find the weighted position of all parent nodes based on child x/y/size
  $$.setParentPositions = function(node){
    if(node.children){
      node.x0 = 0;
      node.y0 = 0;
      node.children.forEach(function(childNode){
        $$.setParentPositions(childNode);
        node.x0 += (childNode.x0 * childNode.value)/node.value;
        node.y0 += (childNode.y0 * childNode.value)/node.value;
      });
    }
  };

  $$.flatten = function(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children)
            node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
        if (!node.id)
            node.id = ++i;
        nodes.push(node);
        return node.size;
    }

    root.size = recurse(root);
    return nodes;
  }

  $$.addNodeKey = function(d){
    d.key = d.name;
    if(d.parent){
      d.key += $$.addNodeKey(d.parent);
    }
    return d.key;
  };

  $$.packJoin = function(){
    var parentPack = {
      children:$$.currentChartData.map(function(d){return d.pack;})
    };
    $$.pack(parentPack);
		if(parentPack.children)
	    parentPack.children.forEach(function(d){d.parent = null;});
  }

  $$.bubbleEnter = function(graph, graphData, bubble){
    newBubble = bubble.enter()
      .append('g')
        .attr('class', 'd2b-bubble')
        .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+' - '+d.name+'</b>';},function(d){return d.value;})
        .call(d2b.UTILS.bindElementEvents, $$, 'bubble')
        .attr('transform', function(d){
          if(d.parent){
            if(!$$.persistentData.expandedNodes[d.parent.key])
              return 'translate('+$$.x.customScale(d.parent.x0)+','+$$.y.customScale(d.parent.y0)+')';
          }
          return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';
        })
        .style('opacity',0);

    newBubble
      .append('circle')
        .attr('class','d2b-bubble-background')
        .style('stroke', $$.color(graphData.label));

    newBubble
      .append('circle')
        .attr('class','d2b-bubble-foreground')
        .style('fill', $$.color(graphData.label));
  };

  $$.bubbleUpdate = function(graph, graphData, bubble){
    //customize bubbles that contain children
    var bubbleWithChildren = bubble
      .filter(function(d){return (d.children)? true:false;})
      .on('click.d2b-click',function(d){
        $$.persistentData.expandedNodes[d.key] = true;
        $$.axisChart.update();
      })
      .style('cursor','pointer')
      .on('mouseover.d2b-mouseover',function(d){
        d3.select(this)
          .select('.d2b-bubble-background')
          .transition()
            .duration($$.animationDuration/2)
            .attr('r', 3+Math.max(0.5,d.r));
      })
      .on('mouseout.d2b-mouseout',function(d){
          d3.select(this)
            .select('.d2b-bubble-background')
            .transition()
              .duration($$.animationDuration/2)
              .attr('r', Math.max(0.5,d.r));
      });

    //customize bubbles that do not contain children
    bubbleWithChildren
      .select('.d2b-bubble-background')
      .style('stroke', d3.rgb($$.color(graphData.label)).darker(1));

    var bubbleWithoutChildren = bubble.filter(function(d){return (d.children)? false:true;})
      .style('cursor','auto');

    bubbleWithoutChildren
      .select('.d2b-bubble-background')
      .style('stroke', d3.rgb($$.color(graphData.label)));

    //transition visible bubbles
    var bubbleVisibleTransition = bubble.filter($$.visible)
        .classed('d2b-hidden',false)
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0.7)
        .attr('transform', function(d){return 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';});
    bubbleVisibleTransition
      .select('circle.d2b-bubble-background')
        .attr('r', function(d){return Math.max(0.5,d.r);});
    bubbleVisibleTransition
      .select('circle.d2b-bubble-foreground')
        .attr('r', function(d){return Math.max(0.5,d.r);});

    //transition hidden bubbles
    var bubbleHiddenTransition = bubble.filter(function(d){
          if(d.parent){
            if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
              return false;
          }else if(!$$.persistentData.expandedNodes[d.key])
            return false;

          return true;
        })
        .classed('d2b-hidden',true)
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0)
        .attr('transform', function(d){
          var translate = '';
          if(d.parent)
            translate = 'translate('+$$.x.customScale(d.parent.x0)+','+$$.y.customScale(d.parent.y0)+')';
          else
            translate = 'translate('+$$.x.customScale(d.x0)+','+$$.y.customScale(d.y0)+')';
          return translate;
        });
    bubbleHiddenTransition
      .select('circle.d2b-bubble-background')
        .attr('r', function(d){return Math.max(1,d.r);});
    bubbleHiddenTransition
      .select('circle.d2b-bubble-foreground')
        .attr('r', function(d){return Math.max(1,d.r);});

  };

  $$.bubbleExit = function(graph, graphData, bubble){
    bubble.exit()
      .transition()
        .duration($$.animationDuration)
        .style('opacity',0)
        .remove();
  };

	$$.visible = function(d){
		if(d.parent){
			if($$.persistentData.expandedNodes[d.parent.key] && !$$.persistentData.expandedNodes[d.key])
				return true;
		}else if(!$$.persistentData.expandedNodes[d.key])
			return true;

		return false;
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 						  d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
    var values = [];
		// $$.currentChartData.forEach(function(graphData){
		// 	values = values.concat(
		// 		graphData.packed
		// 			.filter($$.visible)
		// 			.map(function(d){return d.x0;})
		// 	);
		// });
		// return values;
    $$.currentChartData.forEach(function(graphData){
      values = values.concat(
				graphData.packed
					.filter($$.visible)
					.map(function(d){return d.x0;})
			);
    });
		var merged = [];
		merged = merged.concat.apply(merged, values)
    return merged;
  };
	chart.yValues = function(){
		var values = [];
		$$.currentChartData.forEach(function(graphData){
      values = values.concat(
				graphData.packed
					.filter($$.visible)
					.map(function(d){return d.y0;})
			);
    });
		var merged = [];
		merged = merged.concat.apply(merged, values)
    return merged;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;

    $$.packJoin();

    $$.currentChartData.forEach(function(graphData){
      $$.setParentPositions(graphData.pack);
      graphData.packed = $$.flatten(graphData.pack);
      graphData.packed.forEach($$.addNodeKey);
    });

		return chart;
	};

	//chart update
	chart.update = function(callback){
    $$.pack.size([$$.width/2, $$.height/2]);
    $$.packJoin();

		$$.background.each(function(graphData){
			var graph = d3.select(this);
		});

    var indicatorPosition = {x:10, y:10};

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);

      var bubble = graph.selectAll('g.d2b-bubble').data(graphData.packed, function(d){return d.key;});

      $$.bubbleEnter(graph, graphData, bubble);
      $$.bubbleUpdate(graph, graphData, bubble);
      $$.bubbleExit(graph, graphData, bubble);

      var expandedBubbleIndicator = graph.selectAll('g.d2b-expanded-bubble-indicator')
        .data(graphData.packed.filter(function(d){return $$.persistentData.expandedNodes[d.key];}), function(d){return d.key;});

      var newIndicator = expandedBubbleIndicator.enter()
        .append('g')
          .attr('class', 'd2b-expanded-bubble-indicator')
          .on('click.d2b-click', function(d){
            $$.resetExpandedNodes(d);
            d2b.UTILS.removeTooltip();
            $$.axisChart.update();
          })
          .call(d2b.UTILS.tooltip, function(d){return '<b>'+graphData.label+' - '+d.name+'</b>';},function(d){return d.value;});

      newIndicator
        .append('rect')
          .attr('width', 50)
          .attr('height', 20)
          .style('fill', $$.color(graphData.label))
          .style('stroke', d3.rgb($$.color(graphData.label)).darker(1));

      newIndicator
        .append('text')
          .attr('x', 25)
          .attr('y', 15)
          .text(function(d){return d.name.substring(0,5);});

      var indicatorTransition = expandedBubbleIndicator
        .transition()
          .duration($$.animationDuration);

      indicatorTransition
        .attr('transform', function(d){
          indicatorPosition.x += 55;
          if(indicatorPosition.x > $$.width-20){
            indicatorPosition.y += 25;
            indicatorPosition.x = 65;
          }

          return 'translate('+(indicatorPosition.x - 55)+','+indicatorPosition.y+')';
        });

      expandedBubbleIndicator.exit()
        // .transition()
        //   .duration($$.animationDuration)
          // .style('opacity',0)
          .remove();


		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*axis-chart-template*/
d2b.UTILS.AXISCHART.TYPES.template = function(type){

	//private store
	var $$ = {};

	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//formatting y values
	$$.yFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//properties that will be set by the axis-chart main code
	chart.foreground = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'foreground');
	chart.background = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'background');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.x = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'x');
	chart.y = 									d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'y');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'xFormat');
	chart.yFormat = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'yFormat');
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'controlsData');
	chart.axisChart = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'axisChart');

	//these are used by the axis-chart to automatically set the scale domains based on the returned set of x/y values;
	chart.xValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].xValues){
				return d2b.UTILS.AXISCHART.TYPES[type].xValues.call($$, chart);
			}
		}

    var values = [];
    return values;
  };
	chart.yValues = function(){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].yValues){
				return d2b.UTILS.AXISCHART.TYPES[type].yValues.call($$, chart);
			}
		}

		var values = [];
		return values;
	};

	chart.data = function(chartData){
		if(!arguments.length) return $$.currentChartData;
		$$.currentChartData = chartData;
		return chart;
	};

	//chart update
	chart.update = function(callback){
		if(type){
			if(d2b.UTILS.AXISCHART.TYPES[type].update){
				d2b.UTILS.AXISCHART.TYPES[type].update.call($$, chart);
				if(callback)
					callback();
				return chart;
			}
		}

		$$.background.each(function(graphData){
			var graph = d3.select(this);
			//code for the background visualization goes here
			//this will iterate through all of the background graph containers of this type
		});

		$$.foreground.each(function(graphData){
			var graph = d3.select(this);
			//code for the foreground visualization goes here
			//this will iterate through all of the foreground graph containers of this type
		});

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.DASHBOARDS.dashboard = function(){

	//define axisChart variables
	var width = d2b.CONSTANTS.DEFAULTWIDTH(),
			margin = d2b.CONSTANTS.DEFAULTMARGIN();

	var pageMargin = 210;
	var pageWidth = width - pageMargin;

	var innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

  var dashboardCategory = new d2b.UTILS.dashboardCategory();
	var chartPage = new d2b.UTILS.chartPage();
  var controls = new d2b.UTILS.CONTROLS.htmlControls();

	var sectionsByKey = {};

	var controlsHidden = false;
	var navigationHidden = false;

	var navigationHistory = {};
	navigationHistory.array = [];
	navigationHistory.position = -1;
	navigationHistory.pushNew = function(value){
		navigationHistory.array = navigationHistory.array
				.slice(0,navigationHistory.position+1);

		navigationHistory.position++;
		navigationHistory.array.push({category:value.category,section:value.section});
	};
	var current = {section:{}, category:{}};

	var currentPage = {};

	var resized = true;

	// var controls = {
	// 		};

	// var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentDashboardData = {
			};

	var palette = d2b.CONSTANTS.DEFAULTPALETTE;

	var traversePages = function(pages, categoryName, sectionName){
		pages.forEach(function(page, i){
			page.categoryName = categoryName;
			page.sectionName = sectionName;
			page.index = i;

		});
	};

	var traverseCategories = function(categories, sectionName){
		if(categories){
			categories.forEach(function(cat){
				cat.sectionName = sectionName;

				if(!cat.pages){
					cat.pages = [];
				}

				traversePages(cat.pages, cat.name, cat.sectionName);

			});
		}
	};
	var traverseSections = function(position,sections,sectionGroup){
		sections.forEach(function(section){
			if(section.key)
				sectionsByKey[section.key] = section;
			traverseCategories(section.categories, section.name);
			section.position = position.concat([{section:section, sectionGroup: sectionGroup}]);
			if(section.sections)
				traverseSections(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sections);
			if(section.sectionGroups)
				traverseSectionGroups(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sectionGroups);
		});
	};
	var traverseSectionGroups = function(position,sectionGroups){
		sectionGroups.forEach(function(sectionGroup){
			if(sectionGroup.sections)
				traverseSections(position,sectionGroup.sections,sectionGroup);
		});
	};
	var dashboardLayout = function(data){
		traverseSections([],[data.dashboard.topSection]);
	};

	var resetSubSectionGroupBreadcrumbs = function(){
		selection.container.header.breadcrumbs.svg.selectAll('.d2b-breadcrumb-sub-section-group-section')
			.transition()
				.duration(animationDuration/2)
				.style('opacity',0);
		selection.container.header.breadcrumbs.svg.selectAll('.d2b-breadcrumb').each(function(){this.expanded = false;});
		selection.container.header.breadcrumbs.svg.style('height','28px');
	};

	var updateBreadcrumbs = function(){
		//breadcrumb indention
		var breadcrumbIndentSize = 7;

		//set breadcrumb data keyed by the section name
		var breadcrumb = selection.container.header.breadcrumbs.svg.selectAll('g.d2b-breadcrumb').data(current.section.position,function(d){return d.section.name;});

		//enter new breadcrumbs
		var newBreadcrumb = breadcrumb.enter()
			.append('g')
				.style('opacity',0)
				.attr('class','d2b-breadcrumb');


		//init new breadcrumb path and text
		newBreadcrumb.append('path').attr('class','d2b-breadcrumb-background');

		newBreadcrumb.append('path').attr('class','d2b-breadcrumb-foreground');

		newBreadcrumb
			.append('text')
				.text(function(d){return d.section.name;})
				.attr('y',17)
				.attr('x',15);

		//iterate through all breadcrumbs
		breadcrumb.each(function(d,i){
			//save this obj
			var _breadcrumb = this;
			var elem = d3.select(_breadcrumb);
			var text = elem.select('text');
			var foreground = elem.select('path.d2b-breadcrumb-foreground');
			var background = elem.select('path.d2b-breadcrumb-background');

			//set breadCrumb path width according to text width
			var pathWidth = text.node().getBBox().width+25;
			var triangle;

			elem.select('g.d2b-breadcrumb-triangle').remove();
			//if section is part of a sectionGroup add sub-section dropdown

			if(d.section != current.section){
				elem
						.classed('d2b-innactive',false)
						.on('click.d2b-click',function(d){
							changeCurrentSection(d.section);
						});
			}else{
				elem
						.classed('d2b-innactive',true)
						.on('click.d2b-click',null);
			}
			if(d.sectionGroup){

				//set data for sub-section, omitting the selected section
				var sectionBreadcrumb = elem.selectAll('g.d2b-breadcrumb-sub-section-group-section')
						.data(d.sectionGroup.sections.filter(function(dd){return dd!=d.section;}));

				//init breadcrumb dyExpanded and expanded flags
				_breadcrumb.dyExpanded = 0;
				_breadcrumb.expanded = false;

				//enter breadcrumb group, path, and text
				var newSectionBreadcrumb = sectionBreadcrumb.enter()
					.append('g')
						.style('opacity',0)
						.attr('class','d2b-breadcrumb-sub-section-group-section');
				newSectionBreadcrumb.append('path').attr('class','d2b-breadcrumb-background');
				newSectionBreadcrumb.append('path').attr('class','d2b-breadcrumb-foreground');
				newSectionBreadcrumb.append('text')
					.attr('y',17)
					.attr('x',15)
					.text(function(d){return d.name;});

				//iterate through sub-section breadcrumbs
				sectionBreadcrumb.each(function(d){
							var elem = d3.select(this);
							var foreground = elem.select('path.d2b-breadcrumb-foreground');
							var background = elem.select('path.d2b-breadcrumb-background');
							var text = elem.select('text');
							var pathWidth = text.node().getBBox().width+25;
							foreground
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z')
								.attr('transform','translate(4,0)');
							background
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z');
						}).on('click.d2b-click',function(d){
							d3.event.stopPropagation();
							changeCurrentSection(d);
						})
						.attr('transform',function(d,i){return 'translate(0,'+(28*(i+1))+')';});

				//set dyExpanded to be the max size of the dropdown
				_breadcrumb.dyExpanded = (32*(sectionBreadcrumb.size()+5));

				//add triangle under sectionGroup breadcrumb
				pathWidth += 15;
				triangle = elem.append('g')
						.attr('class','d2b-breadcrumb-triangle')
						.on('click.d2b-click',function(){
							d3.event.stopPropagation();
							if(!_breadcrumb.expanded){
								resetSubSectionGroupBreadcrumbs();
								selection.container.header.breadcrumbs.svg
										.style('height',Math.max(25,_breadcrumb.dyExpanded)+'px');
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.delay(function(d,i){return i*20;})
										.style('opacity',1);
							}else{
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.style('opacity',0);
								selection.container.header.breadcrumbs.svg
										.style('height',27+'px');
							}
							_breadcrumb.expanded = !_breadcrumb.expanded;
						});
				triangle.append('rect')
						.attr('width',20)
						.attr('height',24)
						.attr('y',0.5)
						// .style('fill',d3.rgb(palette.primary).darker(2))
						.attr('transform','translate('+(pathWidth-20)+',0)');
				triangle.append('path')
						.attr('d','M 0 0 L 9 0 L 4.5 5 L 0 0 Z')
						.attr('transform','translate('+(pathWidth-15)+',11)');
			}else{

			}

			//draw breadcrumb path, making note of start and end breadcrumbs
			var startIndent = breadcrumbIndentSize;
			var endIndent = breadcrumbIndentSize;
			if(i == 0)
				startIndent = 0;
			if(i+1 == breadcrumb.size())
				endIndent = 0;

			foreground
				.transition()
					.duration(animationDuration)
					.attr('transform','translate(4,0)')
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			background
				.transition()
					.duration(animationDuration)
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			this.dx = pathWidth;
		});

		//position breadcrumbs
		var xCurrent = 0;
		breadcrumb
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){
					var translation = 'translate('+xCurrent+',1)';
					xCurrent += this.dx + 7;
					return translation;
				})
				.style('opacity',1);

		//fade out exiting breadcrumbs
		breadcrumb.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

	};
	var updateCategoryTabs = function(){

		var categoryTab = selection.container.header.navigation.categoryTabs.selectAll('li.d2b-category-tab').data(current.section.categories);
		categoryTab.enter()
			.append('li')
				.attr('class','d2b-category-tab')
				.on('click.d2b-click',changeCurrentCategory);
		categoryTab
			.text(function(d){return d.name;})
			.each(function(d){
				if(d==current.category){
					d3.select(this)
							.classed('d2b-innactive',true)
							.on('click.d2b-click',null);
				}else{
					d3.select(this)
							.classed('d2b-innactive',false)
							.on('click.d2b-click',changeCurrentCategory);
				}
			});
			categoryTab.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();


	};
	var updateSubSections = function(){

		var subSection = selection.container.sidebar.subSections.selectAll('li.d2b-sub-section').data(current.section.sections);

		subSection.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d2b-sub-section')
				.on('click.d2b-click',changeCurrentSection);

		subSection
				.text(function(d){return d.name})
			.transition()
				.duration(animationDuration)
				.style('opacity',1);

		subSection.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};
	var updateSubSectionGroups = function(){

		var subSectionGroupData = current.section.sectionGroups.filter(function(d){return d.sections.length > 0;});

		var subSectionGroup = selection.container.sidebar.subSectionGroups.selectAll('li.d2b-sub-section-group').data(subSectionGroupData);

		subSectionGroup.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d2b-sub-section-group');

		subSectionGroup
			.transition()
				.duration(animationDuration)
				.style('opacity',1);

		subSectionGroup
				.text(function(d){return d.name})
				.each(makeSubSectionGroupSections);

		subSectionGroup.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};
	var makeSubSectionGroupSections = function(d){
		if(!d.sections || d.sections.length < 1)
			return;
		var elem = d3.select(this);
		elem.selectAll('*').remove();
		var subSectionGroupSections = elem
			.append('ul')
				.datum(d)
				.attr('class','d2b-sub-section-group-sections');

		var subSectionGroupSection = subSectionGroupSections.selectAll('li.d2b-sub-section-group-section').data(function(dd){return dd.sections;});

		subSectionGroupSection.enter()
			.append('li')
				.attr('class','d2b-sub-section-group-section');

		subSectionGroupSection
				.on('click.d2b-click',changeCurrentSection);

		subSectionGroupSection
				.text(function(d){return d.name;});
	};

	var changeCurrentSection = function(d){
		resetSubSectionGroupBreadcrumbs();

		current.section = d;

		if(!current.section.sections)
			current.section.sections = [];

		if(!current.section.sectionGroups)
			current.section.sectionGroups = [];

		if(!current.section.categories)
			current.section.categories = [];

		var newCategory = d.categories.filter(function(d){return d.name == current.category.name;});
		if(newCategory.length > 0){
			return changeCurrentCategory(newCategory[0]);
		}else{
			return changeCurrentCategory(d.categories[0]);
		}
	};
	var ii=0;
	var changeCurrentCategory = function(d){
		current.category = d;
		navigationHistory.pushNew(current);
		/////Work on proper push/pop/find state later
		// history.pushState({},'','?category='+(current.category.name)+'&section='+(current.section.name))
		dashboardCategory
				.animateFrom('right')
				.data({data:current.category});
		return dashboard.update();
	};

	var dashboard = {};

	//members that will set the regenerate flag
	dashboard.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return dashboard;
	};
	dashboard.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return dashboard;
	};

	//methods that require update
	dashboard.width = function(value){
		if(!arguments.length) return width;
		width = value;
		pageWidth = width - 210;
		dashboardCategory.width(pageWidth);
		chartPage.width(pageWidth);
		resized = true;
		return dashboard;
	};

	dashboard.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return dashboard;
	};

	dashboard.palette = function(value){
		if(!arguments.length) return palette;
		palette = value;
		return dashboard;
	};

	dashboard.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		dashboardCategory.animationDuration(animationDuration);

		return dashboard;
	};

	dashboard.data = function(dashboardData, reset){
		if(!arguments.length) return animationDuration;
		if(reset){
			generateRequired = true;
			currentDashboardData = {};
		}

		currentDashboardData = dashboardData;
		dashboardLayout(currentDashboardData);

		return dashboard;
	}

	//generate chart
	dashboard.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create container
		selection.container = selection
			.append('div')
				.attr('class','d2b-dashboard d2b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d2b-header');

		selection.container.header.navigation = selection.container.header
			.append('div')
				.attr('class','d2b-navigation');

		selection.container.header.navigation.home = selection.container.header.navigation
			.append('div')
				.attr('class','d2b-navigation-home');

		selection.container.header.navigation.home.append('i').attr('class','fa fa-home')

		selection.container.header.navigation.arrows = selection.container.header.navigation
			.append('div')
				.attr('class','d2b-navigation-arrows');

		selection.container.header.navigation.arrows.left = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d2b-left-arrow');

		selection.container.header.navigation.arrows.right = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d2b-right-arrow');

		selection.container.header.navigation.arrows.left.append('i').attr('class','fa fa-chevron-left')

		selection.container.header.navigation.arrows.right.append('i').attr('class','fa fa-chevron-right')

		selection.container.header.navigation.categoryTabs = selection.container.header.navigation
			.append('ul')
				.attr('class','d2b-category-tabs');

		selection.container.header.navigation.logo = selection.container.header.navigation
			.append('img')
				.attr('class','d2b-dashboard-logo');

		selection.container.header.breadcrumbs = selection.container.header
			.append('div')
				.attr('class','d2b-dashboard-breadcrumbs');

		selection.container.header.breadcrumbs.svg = selection.container.header.breadcrumbs
			.append('svg')
				.attr('class','d2b-dashboard-breadcrumbs-svg');

		selection.container.sidebar = selection.container
			.append('div')
				.attr('class','d2b-dashboard-sidebar');


		selection.container.sidebar.sectionNav = selection.container.sidebar
			.append('div')
				.attr('class','d2b-sidebar-section-nav d2b-sidebar-container');

		selection.container.sidebar.sectionsHeader = selection.container.sidebar.sectionNav
			.append('div')
				.attr('class','d2b-sidebar-header')
				.text('Go To');

		selection.container.sidebar.subSections = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d2b-sub-sections');

		selection.container.sidebar.subSectionGroups = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d2b-sub-section-groups');

		selection.container.sidebar.filters = selection.container.sidebar
			.append('div')
				.attr('class','d2b-sidebar-filters d2b-sidebar-container');

		selection.container.sidebar.filtersHeader = selection.container.sidebar.filters
			.append('div')
				.attr('class','d2b-sidebar-header')
				.text('Filter By');

		controls.selection(selection.container.sidebar.filters)
			.on('change',function(d){
				dashboard.update();
			});

		selection.container.content = selection.container
			.append('div')
				.attr('class','d2b-dashboard-content');

		selection.container.content.dashboardCategory = selection.container.content
			.append('div')
				.attr('class','d2b-dashboard-category');

		// selection.container.content.chartPage = selection.container.content
		// 	.append('div')
		// 		.attr('class','d2b-chart-page-container');

		dashboardCategory
			.selection(selection.container.content.dashboardCategory)
			.on('pageChange.d2b-page-change',function(pageData, iOld, iNew){

				var temp = controlsHidden;
				if(!pageData.controls)
					pageData.controls = [];
				if(pageData.controls.length > 0){
					controlsHidden = false;
					selection.container.sidebar.filters.style('display', 'block');
				}else{
					controlsHidden = true;
					selection.container.sidebar.filters.style('display', 'none');
				}

				controls
					.data(pageData)
					.update(function(){
					});
				var animateFrom = null;
				if(iOld < iNew)
					animateFrom = 'right';
				else if(iNew < iOld)
					animateFrom = 'left';
				chartPage
					.selection(dashboardCategory.chartPageSelection())
					.data(pageData)
					.animateFrom(animateFrom)
					.update(function(){
						if(temp != controlsHidden){
							dashboard.update();
						}
					})
					.animateFrom(null);

			});

		changeCurrentSection(currentDashboardData.dashboard.topSection);

		dashboard.update(callback);

		return dashboard;
	};

	//update chart
	dashboard.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return dashboard.generate(callback);
		}

		if(current.section == currentDashboardData.dashboard.topSection){
			selection.container.header.navigation.home
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null);
		}else{
			selection.container.header.navigation.home
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						changeCurrentSection(currentDashboardData.dashboard.topSection);
					});
		}

		if(navigationHistory.position+1 == navigationHistory.array.length){
			selection.container.header.navigation.arrows.right
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null);
		}else{
			selection.container.header.navigation.arrows.right
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						navigationHistory.position++;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('right')
								.data({data:current.category});
						dashboard.update();
					});
		}

		if(navigationHistory.position == 0){
			selection.container.header.navigation.arrows.left
					.classed('d2b-innactive',true)
					.on('click.d2b-click',null)
		}else{
			selection.container.header.navigation.arrows.left
					.classed('d2b-innactive',false)
					.on('click.d2b-click',function(){
						navigationHistory.position--;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('left')
								.data({data:current.category});
						dashboard.update();
					});
		}

		selection.container
			.transition()
				.delay(animationDuration)
				.duration(animationDuration)
				.style('width', width+'px');

		updateCategoryTabs();
		updateBreadcrumbs();

		if(current.section.sections.length == 0 && current.section.sectionGroups.length == 0){
			navigationHidden = true;
			selection.container.sidebar.sectionNav
				.style('display','none');
			}
		else{
			navigationHidden = false;
			selection.container.sidebar.sectionNav
				.style('display','block');
		}

		updateSubSections();
		updateSubSectionGroups();

		if(controlsHidden && navigationHidden){
			pageMargin = 10;
		}else{
			pageMargin = 210
		}

		pageWidth = width - pageMargin;

		selection.container.content
			.style('width',pageWidth+'px');

		selection.container.content
			.transition()
				.duration(animationDuration)
				.style('margin-left', pageMargin - 10 + 'px');

		dashboardCategory
			.width(pageWidth)
			.update()
			.animateFrom(null);

		chartPage
			.width(pageWidth)
			.update();

		d3.timer.flush();

		if(callback){
			callback();
		}

		return dashboard;
	};

	return dashboard;

};

d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
var colorbrewer = {YlGn: {
3: ["#f7fcb9","#addd8e","#31a354"],
4: ["#ffffcc","#c2e699","#78c679","#238443"],
5: ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
6: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],
7: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
8: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
9: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]
},YlGnBu: {
3: ["#edf8b1","#7fcdbb","#2c7fb8"],
4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
9: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
},GnBu: {
3: ["#e0f3db","#a8ddb5","#43a2ca"],
4: ["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],
5: ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
6: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],
7: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
8: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
9: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]
},BuGn: {
3: ["#e5f5f9","#99d8c9","#2ca25f"],
4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
9: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]
},PuBuGn: {
3: ["#ece2f0","#a6bddb","#1c9099"],
4: ["#f6eff7","#bdc9e1","#67a9cf","#02818a"],
5: ["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
6: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],
7: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
8: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
9: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]
},PuBu: {
3: ["#ece7f2","#a6bddb","#2b8cbe"],
4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
},BuPu: {
3: ["#e0ecf4","#9ebcda","#8856a7"],
4: ["#edf8fb","#b3cde3","#8c96c6","#88419d"],
5: ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
6: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],
7: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
8: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
9: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]
},RdPu: {
3: ["#fde0dd","#fa9fb5","#c51b8a"],
4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
9: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]
},PuRd: {
3: ["#e7e1ef","#c994c7","#dd1c77"],
4: ["#f1eef6","#d7b5d8","#df65b0","#ce1256"],
5: ["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
6: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],
7: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
8: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
9: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]
},OrRd: {
3: ["#fee8c8","#fdbb84","#e34a33"],
4: ["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],
5: ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
6: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],
7: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
8: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
9: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]
},YlOrRd: {
3: ["#ffeda0","#feb24c","#f03b20"],
4: ["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],
5: ["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
6: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],
7: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
8: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
9: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]
},YlOrBr: {
3: ["#fff7bc","#fec44f","#d95f0e"],
4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
},Purples: {
3: ["#efedf5","#bcbddc","#756bb1"],
4: ["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],
5: ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
6: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],
7: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
8: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
9: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]
},Blues: {
3: ["#deebf7","#9ecae1","#3182bd"],
4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
},Greens: {
3: ["#e5f5e0","#a1d99b","#31a354"],
4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
},Oranges: {
3: ["#fee6ce","#fdae6b","#e6550d"],
4: ["#feedde","#fdbe85","#fd8d3c","#d94701"],
5: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
6: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],
7: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
8: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
9: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]
},Reds: {
3: ["#fee0d2","#fc9272","#de2d26"],
4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
},Greys: {
3: ["#f0f0f0","#bdbdbd","#636363"],
4: ["#f7f7f7","#cccccc","#969696","#525252"],
5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
},PuOr: {
3: ["#f1a340","#f7f7f7","#998ec3"],
4: ["#e66101","#fdb863","#b2abd2","#5e3c99"],
5: ["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
6: ["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],
7: ["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],
8: ["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],
9: ["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],
10: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],
11: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]
},BrBG: {
3: ["#d8b365","#f5f5f5","#5ab4ac"],
4: ["#a6611a","#dfc27d","#80cdc1","#018571"],
5: ["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
6: ["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],
7: ["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],
8: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],
9: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],
10: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],
11: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]
},PRGn: {
3: ["#af8dc3","#f7f7f7","#7fbf7b"],
4: ["#7b3294","#c2a5cf","#a6dba0","#008837"],
5: ["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
6: ["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],
7: ["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],
8: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
9: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
10: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],
11: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]
},PiYG: {
3: ["#e9a3c9","#f7f7f7","#a1d76a"],
4: ["#d01c8b","#f1b6da","#b8e186","#4dac26"],
5: ["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
6: ["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],
7: ["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],
8: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
9: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
10: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],
11: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]
},RdBu: {
3: ["#ef8a62","#f7f7f7","#67a9cf"],
4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
},RdGy: {
3: ["#ef8a62","#ffffff","#999999"],
4: ["#ca0020","#f4a582","#bababa","#404040"],
5: ["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
6: ["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],
7: ["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]
},RdYlBu: {
3: ["#fc8d59","#ffffbf","#91bfdb"],
4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
},Spectral: {
3: ["#fc8d59","#ffffbf","#99d594"],
4: ["#d7191c","#fdae61","#abdda4","#2b83ba"],
5: ["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
6: ["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],
7: ["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],
8: ["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],
9: ["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],
10: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
11: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
},RdYlGn: {
3: ["#fc8d59","#ffffbf","#91cf60"],
4: ["#d7191c","#fdae61","#a6d96a","#1a9641"],
5: ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
6: ["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],
7: ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],
8: ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
9: ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
},RdGn: {
7: ["#e71007","#c71007","#a71007","#871007","#888","#1a8850","#1aa850","#1ac850","#1ae850"]
},Accent: {
3: ["#7fc97f","#beaed4","#fdc086"],
4: ["#7fc97f","#beaed4","#fdc086","#ffff99"],
5: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],
6: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],
7: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],
8: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]
},Dark2: {
3: ["#1b9e77","#d95f02","#7570b3"],
4: ["#1b9e77","#d95f02","#7570b3","#e7298a"],
5: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],
6: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],
7: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],
8: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]
},Paired: {
3: ["#a6cee3","#1f78b4","#b2df8a"],
4: ["#a6cee3","#1f78b4","#b2df8a","#33a02c"],
5: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
6: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],
7: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],
8: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],
9: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
10: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],
11: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],
12: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
},Pastel1: {
3: ["#fbb4ae","#b3cde3","#ccebc5"],
4: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],
5: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
6: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],
7: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],
8: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],
9: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]
},Pastel2: {
3: ["#b3e2cd","#fdcdac","#cbd5e8"],
4: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],
5: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],
6: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],
7: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],
8: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
},Set1: {
3: ["#e41a1c","#377eb8","#4daf4a"],
4: ["#e41a1c","#377eb8","#4daf4a","#984ea3"],
5: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],
6: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],
7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
8: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
9: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
},Set2: {
3: ["#66c2a5","#fc8d62","#8da0cb"],
4: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],
5: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
6: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],
7: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],
8: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
},Set3: {
3: ["#8dd3c7","#ffffb3","#bebada"],
4: ["#8dd3c7","#ffffb3","#bebada","#fb8072"],
5: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],
6: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],
7: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],
8: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],
9: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],
10: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],
11: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],
12: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
}};
