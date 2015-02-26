/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.UTILS.CHARTPAGE.chartLayout = function(){
	var width = AD.CONSTANTS.DEFAULTWIDTH();
	var height = AD.CONSTANTS.DEFAULTHEIGHT();
	var selection;
	var currentChartLayoutData = {chartLayout:{}};
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
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
		
		if(chartLayoutData.data.chartCallback)
			currentChartLayoutData.chartCallback = chartLayoutData.data.chartCallback;
		
		return chartLayout;
	};
	
	chartLayout.generate = function(callback){
		
		selection.selectAll('*').remove();

		selection.wrapper = selection
			.append('div')
				.attr('class','ad-chart-layout-wrapper');
		
		selection.container = selection.wrapper
			.append('div')
				.attr('class','ad-chart-layout ad-container');
		
		selection.container.title = selection.container
			.append('div')
				.attr('class','ad-chart-layout-title');

		selection.container.title.div = selection.container.title
			.append('div');
				
		selection.container.chart = selection.container
			.append('div')
				.attr('class','ad-chart-layout-chart');
				
		chart
			.selection(selection.container.chart)
			.update(currentChartLayoutData.chartCallback);			
				
		selection.container.rightNotes = selection.container
			.append('div')
				.attr('class','ad-chart-layout-right-notes');
				
		selection.container.rightNotes.ul = selection.container.rightNotes		
			.append('ul');
				
		selection.container.leftNotes = selection.container
			.append('div')
				.attr('class','ad-chart-layout-left-notes');
				
		selection.container.leftNotes.ul = selection.container.leftNotes		
			.append('ul');
			
		selection.container.footnote = selection.container
			.append('div')
				.attr('class','ad-chart-layout-footnote');
		selection.container.footnote.div = selection.container.footnote
			.append('div');
				
		selection.container.source = selection.container
			.append('div')
				.attr('class','ad-chart-layout-source')
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
				.style('height',height+'px')
		selection.container.title.div
				.text(currentChartLayoutData.chartLayout.title)
				.style('opacity','1');	
		if(currentChartLayoutData.chartLayout.title){
			chartMargin.top+=selection.container.title.node().getBoundingClientRect().height;
		}else{
			selection.container.title.div.style('opacity','0');
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
		selection.container.rightNotes
				.style('width',width*0.2+'px')
				.style('height',(height-chartMargin.top-chartMargin.bottom)+'px')
				.style('left',width*0.8-5+'px');
		var rightNote = selection.container.rightNotes.ul.selectAll('li.ad-chart-layout-note').data(currentChartLayoutData.chartLayout.rightNotes);
		rightNote.enter()
			.append('li')
				.attr('class','ad-chart-layout-note');
		rightNote
				.text(function(d){return d});
		rightNote.exit()
				.style('opacity',0)
				.remove();
				
		if(!currentChartLayoutData.chartLayout.leftNotes || currentChartLayoutData.chartLayout.leftNotes.length < 1){
			currentChartLayoutData.chartLayout.leftNotes = [];
		}else{
			chartMargin.left+=width * 0.2;
		}		
		selection.container.leftNotes
				.style('width',width*0.2+'px')
				.style('height',(height-chartMargin.top-chartMargin.bottom)+'px');
		var leftNote = selection.container.leftNotes.ul.selectAll('li.ad-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		leftNote.enter()
			.append('li')
				.attr('class','ad-chart-layout-note');
		leftNote
				.text(function(d){return d});		
		leftNote.exit()
				.style('opacity',0)
				.remove();
		selection.container.chart
				.style('left',(chartMargin.left+5)+'px')
				.style('top',chartMargin.top+'px');
				
		
		chart
				.width(width-chartMargin.left-chartMargin.right-10)
				.height(height-chartMargin.top-chartMargin.bottom)
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

AD.UTILS.chartPage = function(){
	var width = AD.CONSTANTS.DEFAULTWIDTH();
	var selection;
	var currentPageData;
	var computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var animationType = 'forward';

	var init = function(){
		var position = {};
		if(animationType == 'backward'){
			position.left = -width+'px';
		}else{
			position.left = width+'px';
		}
		selection.currentPage = selection
			.append('div')
				.attr('class','ad-chart-page-current-page')
				.style('opacity',0)
				.style('left',position.left);
				// .attr('transform',transform);
	};

	var page = {};

	page.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return page;
	};
	page.computedHeight = function(){
		return computedHeight;
	}
	page.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return page;
	};
	page.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		return page;
	};
	page.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return page;
	};
	page.animationType = function(value){
		if(!arguments.length) return animationType;
		animationType = value;
		return page;
	};
	
	page.data = function(pageData, reset){
		if(!arguments.length) return currentPageData;
		newData = true;
		currentPageData = pageData;
		return page;
	}
	
	page.update = function(callback){
		if(!selection)
			return console.warn('page was not given a selection');
		var position = {};
		
		if(newData){
			newData = false;
			if(selection.currentPage){
				if(animationType == 'backward'){
					position.left = width+'px';
				}else{
					position.left = -width+'px';
				}
				selection.currentPage
					.transition()
						.duration(animationDuration)
						.style('opacity',0)
						.style('left',position.left)
						.remove();
			}
			init();
		}

		computedHeight = 0;
		
		selection.currentPage 
			.transition()
				.duration(animationDuration)
				.style('opacity',1)
				.style('left',0+'px');
		
		if(!currentPageData.data.charts || currentPageData.data.charts.length < 1){
			return console.warn('chart page was not provided any charts')
		}

		var chartLayout = selection.currentPage.selectAll('div.ad-page-chart-layout').data(currentPageData.data.charts);

		var newChartLayout = chartLayout.enter()
			.append('div')
				.attr('class','ad-page-chart-layout')
				.each(function(d){
					if(d.chart.chartLayout){
						d.chart.chartLayout
							.select(this)
							.width(width*d.width)
							.height(d.height)
							.animationDuration(0)
							.update(d.chart.chartLayoutData.chartCallback);
					}
				});

		chartLayout
				.each(function(d){
					if(d.chart.chartLayout){
						d.chart.chartLayout
								.animationDuration(animationDuration)
								.width(width*d.width)
								.update(d.chart.chartLayoutData.chartCallback);
					}
				})
				.style('left',function(d){return (width * d.x)+'px'})
				.style('top',function(d){return (d.y)+'px'});
				
		d3.timer.flush();

		if(callback){
			callback();
		}
		
		return page;
	};

	return page;
}