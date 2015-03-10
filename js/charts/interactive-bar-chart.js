/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */


/*axis chart*/
AD.CHARTS.interactiveBarChart = function(){

	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();

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

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new AD.UTILS.LEGENDS.legend(),
	  	horizontalControls = new AD.UTILS.CONTROLS.horizontalControls(),
			legendOrientation = 'bottom';

	var xFormat = function(value){return value};
	var yFormat = function(value){return value};

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	var orientation = {x:"x",y:"y",horizontal:"horizontal",vertical:"vertical",width:"width",height:"height",bottom:"bottom",left:"left"};

	var controls = {
				yAxisLock: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false,
					enabled: false,
					maxStacked:AD.CONSTANTS.DEFAULTHEIGHT(),
					maxNonStacked:AD.CONSTANTS.DEFAULTHEIGHT()
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

	var color = AD.CONSTANTS.DEFAULTCOLOR();

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
				.attr('class','ad-bar-rect')
				.style('opacity',0)
				.attr(orientation.height,0)
				.attr(orientation.y,dimensions[orientation.vertical])
				.on('mouseover.ad-mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+column.key+' <i>('+xFormat(d.x)+')</i></b> ',yFormat(d.y))
				})
				.on('mouseout.ad-mouseout',function(d){
					AD.UTILS.removeTooltip();
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
				.attr(orientation.y,dimensions.vertical)
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
		generateRequired = true;

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
		generateRequired = true;

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
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	chart.yFormat = function(value){
		if(!arguments.length) return yFormat;
		yFormat = AD.UTILS.numberFormat(value);
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
				.attr('class','ad-interactive-bar-chart ad-svg ad-container');

		//create group container
		selection.group = selection.svg.append('g');

		//create axis containers
		selection.group.axes = selection.group
			.append('g')
				.attr('class','ad-axes');
		selection.group.axes.x = selection.group.axes
			.append('g')
				.attr('class','ad-x ad-axis');
		selection.group.axes.y = selection.group.axes
			.append('g')
				.attr('class','ad-y ad-axis');
		selection.group.axes.xLabel = selection.group.axes
			.append('g')
				.attr('class','ad-x-label')
			.append('text');
		selection.group.axes.yLabel = selection.group.axes
			.append('g')
				.attr('class','ad-y-label')
			.append('text');



		//create column containers
		selection.group.columns = selection.group
			.append('g')
				.attr('class','ad-columns');

		for(key in currentChartData.columns){
			currentChartData.columns[key].svg = selection.group.columns
				.append('g');
		}

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','ad-controls');

		//intialize new controls
		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});

		//create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		//intialize new legend
		legend
				.color(color)
				.selection(selection.legend)
				.on('elementMouseover.ad-mouseover',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/2)
							.style('opacity',0.35);
					d.data.svg.selectAll('rect')
						.transition()
							.duration(0)
							.style('opacity',1);
					// .classed('ad-legend-mouseover',true);
				})
				.on('elementMouseout.ad-mouseout',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/4)
							.style('opacity',1);
					// d.data.svg.classed('ad-legend-mouseover',false);
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

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
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

		var columns = AD.UTILS.getValues(currentChartData.columns);

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

		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
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
			forcedMargin[legendOrientation] += legend.computedHeight();

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
			yVals = yVals.concat(AD.UTILS.getValues(yValsStackedBars));
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
			domains[orientation.horizontal] = AD.UTILS.AXISCHARTS.getDomainOrdinal(xVals).sort();
		}else{
			scales[orientation.horizontal].scale.range([0, dimensions[orientation.horizontal]])
			domains[orientation.horizontal] = AD.UTILS.AXISCHARTS.getDomainLinear(xVals);
		}
		if(controls.yAxisLock.enabled){
			if(controls.stacking.enabled){
				domains[orientation.vertical] = [0,controls.yAxisLock.maxStacked];
			}else{
				domains[orientation.vertical] = [0,controls.yAxisLock.maxNonStacked];
			}
		}else{
			domains[orientation.vertical] = AD.UTILS.AXISCHARTS.getDomainLinear(yVals);
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
