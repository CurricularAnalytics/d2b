/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*multi chart*/
AD.CHARTS.multiChart = function(){
	//define multiChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();

	var innerWidth, innerHeight;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = AD.CONSTANTS.DEFAULTCOLOR();

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
			.on('click.ad-click', buttonClick)
			.on('mouseover.ad-mouseover', buttonMouseover)
			.on('mouseout.ad-mouseout', buttonMouseout);

		selection.buttonsWrapper.buttons.button
			.text(function(d){return d.label;})
			.classed('ad-selected',function(d){return d == current.chart;});

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
			.on('elementClick.ad-click', function(d,i,type){
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i,masterType+type);
					}
			})
			.on('elementMouseover.ad-mouseover', function(d,i,type){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i,masterType+type);
					}
			})
			.on('elementMouseout.ad-mouseout', function(d,i,type){
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i,masterType+type);
					}
			})
	};

	var updateChart = function(){
		if(!selection.chartWrapper.chart){
			selection.chartWrapper.chart = selection.chartWrapper
				.append('div')
					.attr('class','ad-multi-chart-chart')
					.style('opacity',1);
			// AD.UTILS.chartAdapter(current.chart.type, current.chart);
			adChart = current.chart.chart;
			adChart
				.selection(selection.chartWrapper.chart)
				.data((JSON.parse(JSON.stringify(current.chart.data)))); //clone data for update
		}else if(current.chart != previous.chart){
			if(current.chart.type == previous.chart.type){
				adChart
					.data((JSON.parse(JSON.stringify(current.chart.data)))); //clone data for update
			}else{
				selection.chartWrapper.chart
					.transition()
						.duration(animationDuration)
						.style('opacity',0)
						.remove();

				selection.chartWrapper.chart = selection.chartWrapper
					.append('div')
						.attr('class','ad-multi-chart-chart')
						.style('opacity',0);

				// AD.UTILS.chartAdapter(current.chart.type, current.chart);
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
			d.chart = new AD.CHARTS[d.type]();
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
				.attr('class','ad-multi-chart-buttons-wrapper');

		selection.buttonsWrapper.buttons = selection.buttonsWrapper
			.append('ul')
				.attr('class','ad-buttons');

		// selection.style('position','relative');
		selection.chartWrapper = selection
			.append('div')
				.attr('class','ad-multi-chart ad-container');

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
