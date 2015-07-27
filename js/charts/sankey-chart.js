/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sankey chart*/
d2b.CHARTS.sankeyChart = function(){

	//private
	var $$ = {};

	//define axisChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;

	$$.generateRequired = true; //using some methods may require the chart to be redrawn

	$$.selection = d3.select('body'); //default selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	$$.legendOrientation = 'bottom';

	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();

	$$.events = d2b.UTILS.chartEvents();

	$$.currentChartData = {
			nodes:[],
			links:[]
		};

	$$.sankey = d3.sankey();
	$$.nodePadding = 30;
	$$.nodeWidth = 15;
	$$.layout = 20;

	$$.minLinkWidth = 1;

	$$.controlsData = {
		hideLegend: {
			label: "Hide Legend",
			type: "checkbox",
			visible: false,
			enabled: false
		}
	};

	$$.xFormat = function(value){return value};

	$$.nodeTooltip = function(d){
		return '<b>'+d.name+' : </b>'+$$.xFormat(d.value);
	}
	$$.linkTooltip = function(d){
		return '<b>'+d.source.name+' <i class="fa fa-arrow-right"></i> '+d.target.name+': </b>'+$$.xFormat(d.value);
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

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
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});

	chart.nodePadding = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'nodePadding');
	chart.layout = 				d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'layout');
	chart.minLinkWidth = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'minLinkWidth');

	chart.nodeTooltip = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'nodeTooltip');
	chart.linkTooltip = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'linkTooltip');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {
							nodes:[],
							links:[]
						};
			$$.generateRequired = true;
		}

		if(chartData.data.nodes){
			$$.currentChartData.nodes = chartData.data.nodes;
		}
		if(chartData.data.links){
			$$.currentChartData.links = chartData.data.links;
		}
		if(chartData.data.labels){
			$$.currentChartData.labels = chartData.data.labels;
		}
		if(chartData.data.columnHeaders){
			$$.currentChartData.columnHeaders = chartData.data.columnHeaders;
		}

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		//create svg
		$$.selection.svg = $$.selection
			.append('svg')
				.attr('class','d2b-sankey-chart d2b-svg d2b-container');

		//create group container
		$$.selection.group = $$.selection.svg.append('g');

		$$.selection.group.sankey = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey');
		$$.selection.group.sankey.links = $$.selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-links');
		$$.selection.group.sankey.nodes = $$.selection.group.sankey
			.append('g')
				.attr('class','d2b-sankey-nodes');

		$$.selection.group.labels = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey-labels');

		$$.selection.group.labels.source = $$.selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-source');

		$$.selection.group.labels.source.text = $$.selection.group.labels.source.append('text').attr('y',23);

		$$.selection.group.labels.destination = $$.selection.group.labels
			.append('g')
				.attr('class','d2b-sankey-label-destination');

		$$.selection.group.labels.destination.text = $$.selection.group.labels.destination.append('text').attr('y',23);

		$$.selection.group.columnHeaders = $$.selection.group
			.append('g')
				.attr('class','d2b-sankey-column-headers');


		//create controls container
		$$.selection.controls = $$.selection.group
			.append('g')
				.attr('class','d2b-controls');


		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});


		// //create legend container
		$$.selection.legend = $$.selection.group
			.append('g')
				.attr('class','d2b-legend');

		// //intialize new legend
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);
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

		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

		$$.innerWidth = $$.width - $$.forcedMargin.right - $$.forcedMargin.left;

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		// $$.forcedMargin.top += $$.controls.computedHeight();
		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;

		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items:	d3
										.set($$.currentChartData.nodes.map(function(d){
												return d.colorKey || d.name;
											}))
										.values()
										.map(function(d){return {label:d};})
				}
			};
		}

		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;
		$$.innerWidth = $$.width - $$.forcedMargin.left - $$.forcedMargin.right;

		var labelTransitions={
			source:
				$$.selection.group.labels.source
					.transition()
						.duration($$.animationDuration),
			destination:
				$$.selection.group.labels.destination
					.transition()
						.duration($$.animationDuration)
		}



		if($$.currentChartData.labels){
			$$.selection.group.labels
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');
			if($$.currentChartData.labels.source){
				labelTransitions.source
						.style('opacity',1);
				$$.selection.group.labels.source.text.text($$.currentChartData.labels.source);
			}else{
				labelTransitions.source
						.style('opacity',0);
			}
			if($$.currentChartData.labels.destination){
				labelTransitions.destination
						.style('opacity',1);
				$$.selection.group.labels.destination.text.text($$.currentChartData.labels.destination);
			}else{
				labelTransitions.destination
						.style('opacity',0);
			}

			labelTransitions.source
					.attr('transform','translate('+0+','+0+')');
			labelTransitions.destination
					.attr('transform','translate('+$$.innerWidth+','+0+')');

			$$.forcedMargin.top += 35;

		}else{
			labelTransitions.source
					.style('opacity',0);
			labelTransitions.destination
					.style('opacity',0);
		}

		var columnHeader;
		var columnHeaderScale;
		if($$.currentChartData.columnHeaders && $$.currentChartData.columnHeaders.length > 0){
			columnHeaderScale = d3.scale.linear()
				.domain([0,$$.currentChartData.columnHeaders.length-1])
				.range([0,$$.innerWidth-$$.nodeWidth])

			$$.selection.group.columnHeaders
				.transition()
					.duration($$.animationDuration)
					.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

			columnHeader = $$.selection.group.columnHeaders.selectAll('g.d2b-sankey-column-header').data($$.currentChartData.columnHeaders);
			columnHeader.enter()
				.append('g')
					.attr('class','d2b-sankey-column-header')
				.append('text')
					.attr('y',16)
					.attr('x',function(d,i){
						if(i == 0)
							return -$$.nodeWidth/2;
						else if(i == $$.currentChartData.columnHeaders.length-1)
							return $$.nodeWidth/2;
					});

			columnHeader.select('text').text(function(d){return d;});
			columnHeader
				.transition()
					.duration($$.animationDuration)
					.attr('transform',function(d,i){return 'translate('+(columnHeaderScale(i)+$$.nodeWidth/2)+','+0+')'})

			$$.forcedMargin.top += 25;
		}

		$$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;

		$$.sankey
				.size([$$.innerWidth,$$.innerHeight])
				.nodeWidth($$.nodeWidth)
				.nodePadding($$.nodePadding)
				.nodes($$.currentChartData.nodes)
				.links($$.currentChartData.links)
				.layout($$.layout);


		var node = $$.selection.group.sankey.nodes.selectAll('g.d2b-sankey-node')
				.data($$.currentChartData.nodes,function(d,i){
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
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-sankey-node');
		newNode.append('rect');
		newNode.append('text');

		var nodeText = node.select('text')
				.text(function(d){return d.shortName;});

		node
				.call(d2b.UTILS.bindToolip, $$.nodeTooltip, function(d){return d;})
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
				.style('opacity',1);

		node
			.select('rect')
			.transition()
				.duration($$.animationDuration)
				.attr('width',$$.sankey.nodeWidth())
				.attr('height',function(d){return Math.max(0,d.dy);});
		nodeText
			.transition()
				.duration($$.animationDuration)
				.style('text-anchor',function(d){return (d.x < $$.innerWidth/2)? 'start':'end';})
				.attr('x',function(d){return (d.x < $$.innerWidth/2)? $$.sankey.nodeWidth()+5:-5;})
				.attr('y',function(d){return d.dy/2+5;})

		var link = $$.selection.group.sankey.links.selectAll('g.d2b-sankey-link')
				.data($$.currentChartData.links,function(d,i){
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
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-sankey-node');

		// console.log(newLink)
		newLink.append('path');
		newLink.append('text');

		link.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
		node.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();


		link
				.call(d2b.UTILS.bindToolip, $$.linkTooltip, function(d){return d;})
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);

		link
			.select('path')
				.style('stroke',function(d){
						return (d.colorBy)?
										$$.color((d[d.colorBy].colorKey)?
											d[d.colorBy].colorKey
										:d[d.colorBy].name)
									:'#777';
								})
			.transition()
				.style('stroke-width',function(d){return Math.max(d.dy,$$.minLinkWidth)})
				.duration($$.animationDuration)
				.attr('d',$$.sankey.link());

		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		$$.selection.group.sankey
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
