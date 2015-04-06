/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d3b.UTILS.CHARTPAGE.chartLayout = function(){
	var width = d3b.CONSTANTS.DEFAULTWIDTH();
	var height = d3b.CONSTANTS.DEFAULTHEIGHT();
	var selection;
	var currentChartLayoutData = {chartLayout:{}};
	var animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
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
				.attr('class','d3b-chart-layout-wrapper');

		selection.container = selection.wrapper
			.append('div')
				.attr('class','d3b-chart-layout d3b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-header');

		selection.container.header.title = selection.container.header
			.append('div')
				.attr('class','d3b-chart-layout-title');

		selection.container.header.titleAlt = selection.container.header
			.append('div')
				.attr('class','d3b-chart-layout-title-alt');

		selection.container.header.info = selection.container.header
			.append('div')
				.attr('class','d3b-chart-layout-info');

		selection.container.chart = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-chart');

		chart
			.selection(selection.container.chart);

		selection.container.rightNotes = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-right-notes');

		selection.container.rightNotes.ul = selection.container.rightNotes
			.append('ul');

		selection.container.leftNotes = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-left-notes');

		selection.container.leftNotes.ul = selection.container.leftNotes
			.append('ul');

		selection.container.footnote = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-footnote');
		selection.container.footnote.div = selection.container.footnote
			.append('div');

		selection.container.source = selection.container
			.append('div')
				.attr('class','d3b-chart-layout-source')
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
		var rightNote = selection.container.rightNotes.ul.selectAll('li.d3b-chart-layout-note').data(currentChartLayoutData.chartLayout.rightNotes);
		rightNote.enter()
			.append('li')
				.attr('class','d3b-chart-layout-note')
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

		var leftNote = selection.container.leftNotes.ul.selectAll('li.d3b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		leftNote.enter()
			.append('li')
				.attr('class','d3b-chart-layout-note')
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



		// var leftNote = selection.container.leftNotes.ul.selectAll('li.d3b-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		// leftNote.enter()
		// 	.append('li')
		// 		.attr('class','d3b-chart-layout-note');
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
