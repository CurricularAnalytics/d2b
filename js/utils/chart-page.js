/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */
d2b.UTILS.chartPage = function(){

  var $$ = {};

	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.selection;
	$$.currentData = {};

	$$.modifiedData = {};

	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.animateFrom = null;

  // $$.reloadCharts = true;

	$$.on = {
		update: function(){}
	};

	$$.init = function(position){
    if($$.animateFrom || !$$.selection.currentPage){

			$$.selection.selectAll('.d2b-chart-page').classed('d2b-chart-page-old', true);

			$$.selection.currentPage = $$.selection
				.append('div')
					.attr('class','d2b-chart-page')
					// .style('opacity',0)
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
				// .style('opacity',0)
				.remove();

		$$.selection.currentPage
			.transition()
				.duration($$.animationDuration)
				// .style('opacity',1)
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

			var postData = {controls:{}};
			$$.currentData.controls.forEach(function(d){
				postData.controls[d.key] = d;
			});

      postData.sectionName = $$.currentData.sectionName;
      postData.categoryName = $$.currentData.categoryName || $$.currentData.name;
      postData.pageName = $$.currentData.name;

      if($$.currentData.url){
					var my_request = d3.xhr($$.currentData.url)
					my_request.post(JSON.stringify(postData), function(error,received){
						var data = JSON.parse(received.response);
						if(data.charts)
							$$.modifiedData.charts = data.charts.concat($$.modifiedData.charts);

						$$.updateGrid($$.modifiedData.charts);

					});

			}else{
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
