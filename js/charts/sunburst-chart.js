/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sunburst chart*/
AD.CHARTS.sunburstChart = function(){

	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend();
	var breadcrumbs = new AD.UTILS.breadcrumbs();
	breadcrumbs.scale(6)

	var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};
	var partitionData;
	var currentRoot;

	// var newData = true;

	var xFormat = function(value){return value};

	var partition = d3.layout.partition()
	    .value(function(d) { return d.size; });

	var arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	var y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	var radius = {};

	var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	// private methods

	var getAncestors = function(node) {
	  var path = [];
	  var current = node;

	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
    path.unshift(current);

	  return path;
	};

	var arcFill = function(d) {

		// if(d.color_style == "Independent")
		// 	return color(d.name)
		// else if(d.color_style == "Custom")
		// 	return d.color

		var sequence = getAncestors(d).reverse();
		for(i=0;i<sequence.length;i++){
			if(sequence[i].top){
				return d3.rgb(color(sequence[i].name)).brighter(i*0.5);
			}
		}
		return color(d.name)
	};

	var arcMouseover = function(d) {

	  // selection.group.sunburst.arcs.arc.style('opacity',0.3);
		// var e_select, e = d;

		var sequence = getAncestors(d);
		// console.log(sequence)

		selection.group.sunburst.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) >= 0);
	              })
			.transition()
				.duration(animationDuration/7)
				.style('opacity',1)
		selection.group.sunburst.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) < 0);
	              })
			.transition()
				.duration(animationDuration/7)
				.style('opacity',0.4)

		updateBreadcrumbs(sequence);

	};

	var sunburstMouseout = function(d) {
		resetBreadcrumbs();
	  selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration/5)
				.style('opacity',1);
	};

	var arcTweenZoom = function(d){
				currentRoot = d;
				updateArcs();

	};

	var getZoomParentDomain = function(d){
		var cur = d;
		var domain = [1,0];
		do{
			if(domain[0] > cur.y)
				domain[0] = cur.y;
			if(domain[1] < cur.y + cur.dy)
				domain[1] = cur.y + cur.dy;
			cur = cur.parent;
		}while(cur);
		return domain;
	};
	var getZoomChildDomain = function(d, domain){
		if(!domain){domain = [1,0];}
		else{
			if(domain[0] > d.y)
				domain[0] = d.y;
			if(domain[1] < d.y + d.dy)
				domain[1] = d.y + d.dy;
		}

		if(d.children){
			d.children.forEach(function(child){
				return getZoomChildDomain(child,domain);
			});
		}

		return domain;

	};

	var updateArcs = function(){

				var sequence = getAncestors(currentRoot);
				var paths = {};

				paths.parents = selection.group.sunburst.arcs.arc.path
					.filter(function(node) {
		        return (sequence.indexOf(node) >= 0);
		      });


				x.domain([currentRoot.x,currentRoot.x + currentRoot.dx]);
				y.parents.domain(getZoomParentDomain(currentRoot));
				y.children.domain(getZoomChildDomain(currentRoot));

				var yDomain = {};

				paths.parents.each(function(d){
						this.newArc = {
							start: x(d.x),
							end: x(d.x + d.dx),
							inner: y.parents(d.y),
							outer: y.parents(d.y + d.dy)
						};
						if(!this.oldArc){
							this.oldArc = {
								start: 0,
								end: 0,
								inner: this.newArc.inner,
								outer: this.newArc.outer
							};
						}
				});


				paths.children = selection.group.sunburst.arcs.arc.path
					.filter(function(node) {
						return (sequence.indexOf(node) < 0);
					});

				paths.children.each(function(d){

					this.newArc = {
						start: x(d.x),
						end: x(d.x + d.dx),
						inner: y.children(d.y),
						outer: y.children(d.y + d.dy)
					};

					if(!this.oldArc){
						this.oldArc = {
							start: 0,
							end: 0,
							inner: this.newArc.inner,
							outer: this.newArc.outer
						};
					}
				});


				selection.group.sunburst.arcs.arc.exit().select('path')
					.each(function(d) {
						this.newArc = {
							start: 0,
							end: 0,
							inner: this.oldArc.inner,
							outer: this.oldArc.outer
						};
					})
					.transition()
						.duration(animationDuration*1.5)
						.attrTween("d", arcTween)
						.each("end",function(d){this.parentNode.remove()})
						.remove();


			var pathTransition = selection.group.sunburst.arcs.arc.path
				.transition()
					.duration(animationDuration*1.5)
					.attrTween("d", arcTween);



			pathTransition
				.each("end",function(d) {
					this.oldArc = this.newArc;
				});

	};


	var arcTween = function(d){
		var interpolator = d3.interpolate(this.oldArc,this.newArc)
		function tween(t){
			b = interpolator(t);
			return arc(b);
		}
		return tween;
	};

	var resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		breadcrumbs.data(breadcrumbsData).update();
	};

	var updateBreadcrumbs = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		breadcrumbs.data(breadcrumbsData).update();

		breadcrumbsSelection = breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			.attr('stroke-width',2)
			.attr('stroke',function(d){return arcFill(d.data);});

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
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
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
			generateRequired = true;
		}

		currentChartData = chartData.data;

		partitionData = partition.nodes(currentChartData.partition);

		// newData = true;
		currentRoot =currentChartData.partition;
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
				.attr('class','ad-sunburst-chart ad-svg ad-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.sunburst = selection.group
			.append('g')
				.attr('class','ad-sunburst')
				.on('mouseout', sunburstMouseout);


		selection.group.sunburst.arcs = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-arcs');

		selection.group.sunburst.tooltip = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-tooltip');

		//create legend container
		selection.group.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		//create breadcrumbs container
		selection.group.breadcrumbs = selection.group
			.append('g')
				.attr('class','ad-sunburst-breadcrumbs');

		//intialize new legend
		horizontalLegend
				.color(color)
				.selection(selection.group.legend);

		//intialize new legend
		breadcrumbs
				.selection(selection.group.breadcrumbs);

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

		selection.svg
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		var topNodes = partitionData.filter(function(d){return d.top;});

		var legendData = {
			data:{
				items: d3
								.set(topNodes.map(function(d){return d.name;}))
								.values()
								.map(function(d){return {label:d};})
			}
		};

		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();

		selection.group.breadcrumbs
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

		breadcrumbs.width(innerWidth).update();
		forcedMargin.top += breadcrumbs.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		selection.group.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+(innerWidth-horizontalLegend.computedWidth())/2)+','+(innerHeight+forcedMargin.top)+')');

		selection.group.sunburst
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+innerWidth/2)+','+(forcedMargin.top+innerHeight/2)+')');


		radius.outer = Math.min(innerWidth,innerHeight)/2-20;
		radius.inner = radius.outer/3;

		y.children.range([radius.inner + 0.17 * (radius.outer - radius.inner), radius.outer]);
		y.parents.range([radius.inner, radius.inner + 0.13 * (radius.outer - radius.inner)]);

	  selection.group.sunburst.arcs.arc = selection.group.sunburst.arcs.selectAll("g.sunburst-arc")
		    .data(partitionData,function(d){return getAncestors(d).map(function(d){return d.name}).join('-');})
		// sunburst_mouseout();
		var newArcs =	selection.group.sunburst.arcs.arc.enter().append("g")
			.attr('class','sunburst-arc');
			// .style('opacity',0)

		var newPaths = newArcs.append("path")
				.on('mouseover',arcMouseover);


		selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration)
				.style('opacity',1);


		selection.group.sunburst.arcs.arc.path = selection.group.sunburst.arcs.arc.select('path')
				.style('fill',arcFill);

		selection.group.sunburst.arcs.arc.path
			// .filter(function(d){return (d.children)? true:false;})
				.on('click',arcTweenZoom)
				.classed('ad-pointer-element',true);

		updateArcs();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
