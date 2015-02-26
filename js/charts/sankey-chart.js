/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sankey chart*/
AD.CHARTS.sankeyChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var innerHeight = height, innerWidth = width;
	
	var generateRequired = true; //using some methods may require the chart to be redrawn		
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend(); 
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
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
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
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
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
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
	
	chart.minLinkWidth = function(value){
		if(!arguments.length) return minLinkWidth;
		minLinkWidth = value;
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
				.attr('class','ad-sankey-chart ad-svg ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		selection.group.sankey = selection.group
			.append('g')
				.attr('class','ad-sankey');
		selection.group.sankey.links = selection.group.sankey
			.append('g')
				.attr('class','ad-sankey-links');
		selection.group.sankey.nodes = selection.group.sankey
			.append('g')
				.attr('class','ad-sankey-nodes');

		selection.group.labels = selection.group
			.append('g')
				.attr('class','ad-sankey-labels');
				
		selection.group.labels.source = selection.group.labels
			.append('g')
				.attr('class','ad-sankey-label-source');
				
		selection.group.labels.source.text = selection.group.labels.source.append('text').attr('y',23);		
				
		selection.group.labels.destination = selection.group.labels
			.append('g')
				.attr('class','ad-sankey-label-destination');
				
		selection.group.labels.destination.text = selection.group.labels.destination.append('text').attr('y',23);

		selection.group.columnHeaders = selection.group
			.append('g')
				.attr('class','ad-sankey-column-headers');
		

		//create axis containers
		// selection.group.axes = selection.group
		// 	.append('g')
		// 		.attr('class','ad-axes');


		// //create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		// //intialize new legend
		horizontalLegend
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

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		
		// if(currentChartData.columnHeaders){
		// 	forcedMargin.right+=20;
		// 	forcedMargin.left+=20;
		// }

		innerWidth = width - forcedMargin.right - forcedMargin.left;
		
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
		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();

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
					.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');
			
			columnHeader = selection.group.columnHeaders.selectAll('g.ad-sankey-column-header').data(currentChartData.columnHeaders);	
			columnHeader.enter()
				.append('g')
					.attr('class','ad-sankey-column-header')
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
		
		
		
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+(innerWidth-horizontalLegend.computedWidth())/2)+','+(innerHeight+forcedMargin.top)+')')
		
		sankey = d3.sankey()
				.size([innerWidth,innerHeight])
				.nodeWidth(nodeWidth)
				.nodePadding(nodePadding)
				.nodes(currentChartData.nodes)
				.links(currentChartData.links)
				.layout(layout);
		

		var node = selection.group.sankey.nodes.selectAll('g.ad-sankey-node')
				.data(currentChartData.nodes, function(d,i){return (d.key)?d.key:i;});
		var newNode = node.enter()
			.append('g')
				.attr('class','ad-sankey-node')
				.on('mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.name+'</b>',xFormat(d.value));
				})
				.on('mouseout',function(d){
					AD.UTILS.removeTooltip();
				});
		newNode.append('rect');
		newNode.append('text');
		
		var nodeText = node.select('text')
				.text(function(d){return d.shortName;});

		node
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});

		node.select('rect')
			.transition()
				.duration(animationDuration)
				.attr('width',sankey.nodeWidth())
				.attr('height',function(d){return d.dy;});
		nodeText
			.transition()
				.duration(animationDuration)
				.style('text-anchor',function(d){return (d.x < innerWidth/2)? 'start':'end';})
				.attr('x',function(d){return (d.x < innerWidth/2)? sankey.nodeWidth()+5:-5;})
				.attr('y',function(d){return d.dy/2+5;})
				
		var link = selection.group.sankey.links.selectAll('g.ad-sankey-link')
				.data(currentChartData.links, function(d,i){return (d.key)?d.key:i;});
		var newLink = link.enter()
			.append('g')
				.attr('class','ad-sankey-link')
				.on('mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.source.name+' <i class="fa fa-arrow-right"></i> '+d.target.name+'</b>',xFormat(d.value));
				})
				.on('mouseout',function(d){
					AD.UTILS.removeTooltip();
				});
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
		

		link.select('path')
			.transition()
				.duration(animationDuration)
				.attr('d',sankey.link())
				.style('stroke-width',function(d){return Math.max(d.dy,minLinkWidth)})
				.style('stroke',function(d){return color((d[d.colorBy].colorKey)?d[d.colorBy].colorKey:d[d.colorBy].name)});

		selection.svg
				.attr('width',width)
				.attr('height',height);
				
		selection.group.sankey
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');		
			

		d3.timer.flush();		
				
		if(callback)
			callback();		
				
		return chart;
	};
	
	return chart;
};