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
