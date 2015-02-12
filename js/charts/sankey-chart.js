
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
	
	var nodeXVals = [];
	var nodeYVals = {};
	
	var xFormat = d3.format("");
	
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
		if(!arguments.length) return xFormat;
		nodePadding = value;
		return chart;
	};
	
	//generate chart
	chart.generate = function(chartData) {
		generateRequired = false;

		currentChartData = {
						nodes:[],
						links:[]
					};

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
				.update(chartData)
				.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(chartData){

		//if chartData is non-nil update the currentChartData information
		if(chartData){	
			if(chartData.data){
				if(chartData.data.nodes){			
					currentChartData.nodes = chartData.data.nodes;
				}
				if(chartData.data.links){
					currentChartData.links = chartData.data.links;
				}
			}
		}
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(currentChartData);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;
		
		var legendData = {
			data:{
				items:	d3
									.set(currentChartData.nodes.map(function(d){
											return d.colorKey;
										}))
									.values()
									.map(function(d){return {label:d};})
			}
		};
		horizontalLegend.width(innerWidth).update(legendData);
		forcedMargin.bottom += horizontalLegend.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(innerWidth-horizontalLegend.computedWidth())/2+','+innerHeight+')')
		
		sankey = d3.sankey()
				.size([innerWidth,innerHeight])
				.nodeWidth(15)
				.nodePadding(nodePadding)
				.nodes(currentChartData.nodes)
				.links(currentChartData.links)
				.layout(20);
		

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
				// .each(function(d){
				// 	d.group = d3.select(this);
				// })
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
				.style('stroke-width',function(d){return d.dy})
				.style('stroke',function(d){return color(d[d.colorBy].colorKey)});

		selection.svg
				.attr('width',width)
				.attr('height',height);
				
		selection.group
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');		
			

		d3.timer.flush();		
				
		return chart;
	};
	
	return chart;
};