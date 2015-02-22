/* Copyright 2014 - 2015 Kevin Warne All rights reserved. */


/*axis chart*/
AD.CHARTS.axisChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT(),
			margin = AD.CONSTANTS.DEFAULTMARGIN();		
	
	var innerHeight = height, innerWidth = width;
			
	var xScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'},
			yScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'};		
			
	var xBand; //used for the bar width in barCharts		
			
	var generateRequired = true; //using some methods may require the chart to be redrawn		
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend; 
	var horizontalControls;
	
	var xFormat = function(value){return value};
	var yFormat = function(value){return value};
	
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
				}
			};
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
				columns: {},
				labels:{x:'',y:''}
			};
	
	/*COLUMN METHODS*/
			
	// replace the column (fade old out and update)			
	var replaceColumn = function(column){ 
		var columnToBeRemoved = column.svg;
		columnToBeRemoved
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.each('end',function(){
					columnToBeRemoved.remove();
				});

		column.svg = selection.group.columns[column.newType.split(',')[0]+'_columns']
			.append('g');		

		updateColumn[column.newType](column, 'true');
		return;
	}
	
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
	
	// different column types
	var axisChartColumnTypes = ['area','bar','line','scatter'];
	
	//update column methods (1 for each type)
	var updateColumn = {};
	updateColumn.area = function(column, newFlag){
		var path = column.svg.selectAll('path').data([column]);
		path.enter()
			.append('path')
				.style('opacity',0)
				.datum(column.modifiedData.values)
				.attr('d', column.area)
				.style('stroke', color(column.data.label))
				.style('fill', color(column.data.label));

		path
				.datum(column.modifiedData.values)
			.transition()
				.duration(animationDuration)
				.attr('d', column.area)
				.style('opacity',1);
	};
	updateColumn.bar = function(column, newFlag){
		
		var bar = column.svg.selectAll('rect').data(column.data.values, function(d){return d.x});
		
		bar.enter().append('rect')
				.attr('class','ad-bar-rect')
				.style('opacity',0)
				.attr('height',0)
				.attr('y',innerHeight);
		
		bar
				.style('fill', color(column.data.label))
				.style('stroke-width','0.6px')
				.style('opacity',1);
		
		bar.transition()
				.duration(animationDuration)
				.attr('x',function(d){return d.xPos;})
				.attr('y',function(d){return d.yPos;})
				.attr('width',function(d){return d.width;})
				.attr('height',function(d){return d.height;})
				.style('stroke', color(column.data.label));
				
		bar.exit()		
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr('height',0)
				.attr('y',innerHeight)
				.remove();
				
	};
	updateColumn.line = function(column, newFlag){
		var line = d3.svg.line()
				.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
				.y(function(d){ return yScale.scale(d.y);});
		
		var interpolationType = column.data.type.split(',')[1];
		if(interpolationType)
			line.interpolate(interpolationType);
				
		var path = column.svg.selectAll('path').data([column]);
		path.enter()
			.append('path')
				.attr('class','ad-line')
				.style('opacity',0)
				.datum(column.data.values)
				.attr('d', line)
				.style('stroke', color(column.data.label));
		
		path
				.datum(column.data.values)
			.transition()
				.duration(animationDuration)
				.attr('d', line)
				.style('opacity',1);
	};
	updateColumn.scatter = function(column, newFlag){
		var scatterPoint = column.svg.selectAll('g.ad-scatter-point').data(column.data.values, function(d){return d.x});
		var newScatterPoint = scatterPoint.enter()
			.append('g')
				.attr('class','ad-scatter-point')
				.attr('transform', function(d){
					return 'translate('+(xScale.scale(d.x) + offsetPointX())+','+yScale.scale(d.y)+')';
				});

		var newCircle = newScatterPoint
			.append('circle')
				.attr('class','ad-scatter-point')
				.attr('r', 5)
				.style('fill', color(column.data.label))
				.on('mouseover',function(){d3.select(this).transition().duration(250).attr('r',7);})
				.on('mouseout',function(){d3.select(this).transition().duration(250).attr('r',5);})
				// .style('stroke-width', '2px')
				// .style('stroke', color(column.data.label));
				
		scatterPoint
			.transition()
				.duration(animationDuration)
				.attr('transform', function(d){
					return 'translate('+(xScale.scale(d.x) + offsetPointX())+','+yScale.scale(d.y)+')';
				});
				
		scatterPoint.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};		
	
	//legend hover functions for additional functionality (most of this is done through CSS)
	var legendItemMouseover = {};
	var legendItemMouseout = {};
	
	legendItemMouseover.bar = function(){};
	legendItemMouseover.scatter = function(d){ 
		d.data.svg.selectAll('circle')
			.transition() 
				.duration(animationDuration/2)
				.attr('r', 7);
	};
	legendItemMouseover.area = function(){};
	legendItemMouseover.line = function(){};
	
	legendItemMouseout.bar = function(){};
	legendItemMouseout.scatter = function(d){
		d.data.svg.selectAll('circle')
			.transition() 
				.duration(animationDuration/2)
				.attr('r', 5);
	};
	legendItemMouseout.area = function(){};
	legendItemMouseout.line = function(){};
	
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
		var xBandDefault = innerWidth/(columns.length * 7);
		
		var yVals = {};
		
		if(controls.stacking.enabled){
			if(xScale.type == 'ordinal'){
				xBand = xScale.scale.rangeBand();
				barWidth = xBand * 0.6;
			}else{
				xBand = -xBandDefault*2.5;
				barWidth = xBandDefault;
			}	
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					bar.height = (innerHeight - yScale.scale(bar.y));
					yVals[bar.x] = yVals[bar.x] || innerHeight;
					yVals[bar.x] -= bar.height;
					bar.xPos = xScale.scale(bar.x) + xBand * 0.2;
					bar.yPos = yVals[bar.x];
					bar.width = barWidth;
				});
			});
		}else{ 
			if(xScale.type == 'ordinal'){
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([0, xScale.scale.rangeBand()], 0.05, 0.3);
			}else{
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([-xBandDefault/2, xBandDefault/2], 0.05, 0.3);
			}	
			barWidth = xBand.rangeBand();
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					bar.xPos = xScale.scale(bar.x) + xBand(column.data.label);
					bar.height = innerHeight - yScale.scale(bar.y);
					bar.yPos = innerHeight - bar.height;
					bar.width = barWidth;
				});
			});
		}
	};
	
	//compute area positions for all area columns	
	var computeAreaPositions = function(columns){
		// var interpolationType;
		// if(controls.stacking.enabled){
		//
		// 	var modifiedData = columns.map(function(column){
		// 			return column.data.values.map(function(value){
		// 					return {x:value.x,y:value.y,y0:0};
		// 			});
		// 		});
		//
		// 	modifiedData = d3.layout.stack()(modifiedData);
		// 	columns.forEach(function(column,i){
		// 		column.modifiedData = column.data;
		// 		column.modifiedData.values = modifiedData[i];
		// 		column.area = d3.svg.area()
		// 				.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
		// 				.y0(function(d){ return yScale.scale(d.y0);})
		// 				.y1(function(d){ return yScale.scale(d.y);});
		//
		// 		interpolationType = column.data.type.split(',')[1];
		// 		if(interpolationType)
		// 			column.area.interpolate(interpolationType);
		//
		// 	});
		// }else{
			columns.forEach(function(column){
				column.area = d3.svg.area()
						.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
						.y0(innerHeight)
						.y1(function(d){ return yScale.scale(d.y);});
		
				interpolationType = column.data.type.split(',')[1];
				if(interpolationType)
					column.area.interpolate(interpolationType);
				
				column.modifiedData = column.data;
			});

		// }
		
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
		
		if(value.domain)
			xScale.scale.domain(value.domain);
		else
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
		
		if(value.domain)
			yScale.scale.domain(value.domain);
		else
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
	chart.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return chart;
	};
	
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
		
		return chart;
	};
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
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
				c.data.type = d.type || c.data.type;
				c.replace = d.replace || false;
				if(d.type)
					c.newType = d.type.split(',')[0];
				else
					c.newType = c.oldType; 
			}else{
				c = currentChartData.columns[d.label] = {data:d, newType:d.type.split(',')[0], oldType:null};
				if(!generateRequired){
					c.svg = selection.group.columns[d.type.split(',')[0]+'_columns']
						.append('g');
				}
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
				.attr('class','ad-axis-chart ad-svg ad-container');
				
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
				
		axisChartColumnTypes.forEach(function(d){
			selection.group.columns[d+'_columns'] = selection.group.columns
				.append('g')
					.attr('class','ad-'+d+'-columns');
		})		
		
		for(key in currentChartData.columns){
			currentChartData.columns[key].svg = selection.group.columns[currentChartData.columns[key].newType+'_columns']
				.append('g');
		}
		
		//create controls container		
		selection.controls = selection.group
			.append('g')	
				.attr('class','ad-controls');
				
		//intialize new controls
		horizontalControls = new AD.UTILS.CONTROLS.horizontalControls();
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
		horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend();
		horizontalLegend
				.color(color)
				.selection(selection.legend)
				.on('elementMouseover', function(d,i){
					if(legendItemMouseover[d.data.newType]){
						legendItemMouseover[d.data.newType](d); 
						d.data.svg.classed('ad-legend-mouseover',true);
					}
				})
				.on('elementMouseout',function(d,i){
					if(legendItemMouseover[d.data.newType]){
						legendItemMouseout[d.data.newType](d); 
						d.data.svg.classed('ad-legend-mouseover',false);
					}
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

		var columns = AD.UTILS.getValues(currentChartData.columns);
		var barColumns = columns.filter(function(d){return d.newType == 'bar';});
		var areaColumns = columns.filter(function(d){return d.newType == 'area';});
		innerWidth = width - margin.left - margin.right - forcedMargin.right - forcedMargin.left;
		
		var legendData = {
			data:{
				items:columns
								.filter(function(d){return d.newType != 'none';})
								.map(function(d){return {label:d.data.label,type:d.newType,data:d};})
								.sort(function(a,b){return a.label-b.label})
			}
		};
		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();
		
		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.width(innerWidth).data(controlsData).update();
		forcedMargin.top += horizontalControls.computedHeight();
		
		innerHeight = height - margin.top - margin.bottom - forcedMargin.top - forcedMargin.bottom;

		
		//gather x and y values to find domain
		var xVals = [];
		var yVals = [];
		
		columns.forEach(function(c){
			if(c.data.values && c.newType){
				c.data.values.forEach(function(v){
					xVals.push(v.x);
					yVals.push(v.y);
				});
			}
		});
		
		//if stacking is add stacked values to set of y values
	  var yValsStackedBars = {};
		if(controls.stacking.enabled){
			barColumns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(!yValsStackedBars[bar.x])
						yValsStackedBars[bar.x] = 0;
					yValsStackedBars[bar.x] += bar.y;
				});
			});
			yVals = yVals.concat(AD.UTILS.getValues(yValsStackedBars));
		}
		
		//Set rand and domain of x and y scales
		if(xScale.type == 'linear'){
			xScale.scale.range([0, innerWidth])
			if(xScale.domain == 'auto'){
				vals = [];
				xScale.scale.domain(AD.UTILS.AXISCHARTS.getDomainLinear(xVals));
			}
		}else if(xScale.type == 'ordinal'){
			xScale.scale.rangeRoundBands([0, innerWidth], .1);
			if(xScale.domain == 'auto'){
				xScale.scale.domain(AD.UTILS.AXISCHARTS.getDomainOrdinal(xVals));
			}
		}

		var yDomain = [0,0];
		if(controls.yAxisLock.enabled){
			if(controls.stacking.enabled){
				yDomain = [0,controls.yAxisLock.maxStacked];
			}else{
				yDomain = [0,controls.yAxisLock.maxNonStacked];
			}
		}else{
			yDomain = AD.UTILS.AXISCHARTS.getDomainLinear(yVals);
		}
		yScale.scale.range([innerHeight, 0])
		if(yScale.domain == 'auto'){
			yScale.scale.domain(yDomain);
		}
		
		//resize svg		
		selection.svg
				.attr('width',width)
				.attr('height',height);		
				
		//create x and y axes		
		yScale.scale.nice(5)
		var xAxis = d3.svg.axis()
				.scale(xScale.scale)
				.orient('bottom')
				.tickFormat(xFormat);
		var yAxis = d3.svg.axis()
				.scale(yScale.scale)
				.orient('left')
				.tickFormat(yFormat);

		//initialize y-axes transition
		selection.group.axes.y
			.transition()
				.duration(animationDuration)
				.call(yAxis);
		
		//find the longest y-axis tick text
		var longestTick = 0;
		d3.select('.ad-y.ad-axis').selectAll('.tick text').each(function(){
			if(longestTick < this.getComputedTextLength())
				longestTick = this.getComputedTextLength();
		})		
	
		forcedMargin.left += longestTick;
	
		//resize the width based on the longest tick text
		innerWidth = width - margin.left - margin.right - forcedMargin.right - forcedMargin.left;
		
		//Re asign the x-axis range to account for width resize
		if(xScale.type == 'linear'){
			xScale.scale.range([0, innerWidth])
		}else if(xScale.type == 'ordinal'){
			xScale.scale.rangeRoundBands([0, innerWidth], .1);
		}
	
	  //set tickSize for grid
		xAxis.tickSize(-innerHeight)
		yAxis.tickSize(-innerWidth);
	
		//reposition the g container
		selection.group
			.transition()
				.duration(animationDuration)
				// .attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')');
		//transition x-axis
		selection.group.axes.x
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ ((margin.top + forcedMargin.top)+innerHeight) +')')
				// .attr('transform','translate('+ (0) +','+ (innerHeight) +')')
				.call(xAxis);		
		//transition y-axis		
		selection.group.axes.y
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')')
				// .attr('transform','translate('+ (0) +','+ (0) +')')
				.call(yAxis);

		//set the xBand, this is used for bar chart inconsistancies between different scale types.
		if(xScale.type == 'ordinal'){
			xBand = d3.scale.ordinal()
					.domain(barColumns.map(function(c){return c.data.label}))
					.rangeRoundBands([0, xScale.scale.rangeBand()]);
		}else{
			xBand = innerWidth/(barColumns.length * 20)
		}	

		//update axis labels
		selection.group.axes.xLabel
			.transition()
				.duration(animationDuration)
				.text(currentChartData.labels.x)
				.attr('transform', 'translate('+(margin.left + forcedMargin.left + innerWidth/2)+','+(innerHeight + 30 + (margin.top + forcedMargin.top))+')');
				// .attr('transform', 'translate('+(innerWidth/2)+','+(innerHeight + 30)+')');

		selection.group.axes.yLabel
			.transition()
				.duration(animationDuration)
	      .attr('transform', 'translate('+(margin.left + forcedMargin.left-longestTick-10)+','+(innerHeight/2+(margin.top + forcedMargin.top))+'),rotate(-90)')
	      // .attr('transform', 'translate('+(-35)+','+(innerHeight/2)+'),rotate(-90)')
				.text(currentChartData.labels.y);

		//reposition the legend
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(margin.left + forcedMargin.left + (innerWidth - horizontalLegend.computedWidth())/2)+','+(innerHeight+25+(margin.top + forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalLegend.computedWidth())/2+','+(innerHeight+25)+')');

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+((margin.left + forcedMargin.left) + innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10+(margin.top + forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10)+')');

		selection.group.columns
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')');
				// .attr('transform','translate('+ (0) +','+ (0) +')');

		//calculate barChart positions
		computeBarPositions(barColumns);
		//calculate areaChart positions
		computeAreaPositions(areaColumns);

		//update columns replace(replace the column with a different type)/update(update the column with the same type)/remove(remove the column)
		columns.forEach(function(c,i){
			if(c.replace){
				replaceColumn(c);
			}else if(c.newType == 'none'){
				removeColumn(c);
			}else if(!c.oldType){
				updateColumn[c.newType](c, true);
			}else if(c.newType == c.oldType){
				updateColumn[c.newType](c, false);
			}else{
				replaceColumn(c);
			}
			
			c.oldType = c.newType;
		});
		
		//sort the areas by max value (greatest to least)
		var maxAreaValues = areaColumns.map(function(d){
			return {column: d,maxY: d3.max(d.data.values.map(function(v){
				return v.y;
			}))};
		});
		maxAreaValues
				.sort(function(a,b){return b.maxY - a.maxY;})
		maxAreaValues
				.forEach(function(d){
					selection.group.columns.area_columns.node().appendChild(d.column.svg.node());
				});	
				
		d3.timer.flush();		
		
		if(callback)
			callback();	
				
		return chart;
	}
	
	return chart;
};