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

	var legend = new AD.UTILS.LEGENDS.legend(),
	  	horizontalControls = new AD.UTILS.CONTROLS.horizontalControls(),
			legendOrientation = 'bottom';

	var breadcrumbs = new AD.UTILS.breadcrumbs();

	breadcrumbs.scale(6)

	var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = { data: { partition:{}}};
	var partitionData;
	var currentRoot;

	var newData = true;

	var xFormat = function(value){return value};

	var partition;

	var arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	var radius = {};

	var y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

	var controls = {
				invert: {
					label: "Invert",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sort: {
					label: "Sort",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	//init event object
	var on = AD.CONSTANTS.DEFAULTEVENTS();

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
				return d3.rgb(color(sequence[i].name)).brighter(i*0.1);
			}
		}
		return color(d.name)
	};

	var arcMouseover = function(d) {

		var sequence = getAncestors(d);

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

	arcMouseover.children = function(d){
			setSunburstTooltip(d,true);
	}

	arcMouseover.parents = function(d){
			setSunburstTooltip(d,false);
	}

	var sunburstMouseout = function(d) {
		resetBreadcrumbs();
	  selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration/5)
				.style('opacity',1);

		resetSunburstTooltip();
	};

	var resetSunburstTooltip = function(){
		setSunburstTooltip(currentRoot, false);
	};

	var setSunburstTooltip = function(d, showPercent){
		var tspanName = d.name;
		var tspanValue = xFormat(d.value);
		if(showPercent)
			tspanValue += ' / ' + d3.format(".2%")(d.value/currentRoot.value);

		selection.group.sunburst.tooltip.text.selectAll('*').remove();

		selection.group.sunburst.tooltip.text
			.append('tspan')
				.text(tspanName);
		selection.group.sunburst.tooltip.text
			.append('tspan')
				.attr('y',30)
				.attr('x',0)
				.text(tspanValue);

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
		      }).on('mouseover.updateTooltip',arcMouseover.parents);


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
								start: this.newArc.start,
								end: this.newArc.start,
								inner: this.newArc.inner,
								outer: this.newArc.outer
							};
						}
				});


				paths.children = selection.group.sunburst.arcs.arc.path
					.filter(function(node) {
						return (sequence.indexOf(node) < 0);
					}).on('mouseover.updateTooltip',arcMouseover.children);

				paths.children.each(function(d){

					this.newArc = {
						start: x(d.x),
						end: x(d.x + d.dx),
						inner: y.children(d.y),
						outer: y.children(d.y + d.dy)
					};

					if(!this.oldArc){
						this.oldArc = {
							start: this.newArc.start,
							end: this.newArc.start,
							inner: this.newArc.inner,
							outer: this.newArc.outer
						};
					}
				});



			var arcExit = selection.group.sunburst.arcs.arc.exit()
				.transition()
					.duration(animationDuration*1.5)
					.style('opacity',0);

			arcExit.select('path')
					.each(function(d) {
						this.newArc = {
							start: this.oldArc.start,
							end: this.oldArc.start,
							inner: this.oldArc.inner,
							outer: this.oldArc.outer
						};
					})
					.attrTween("d", arcTween);

			arcExit.remove();


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
		var _arc = this;
		var interpolator = d3.interpolate(_arc.oldArc,_arc.newArc)
		function tween(t){
			_arc.oldArc = interpolator(t);
			return arc(_arc.oldArc);
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

	var saveIndicies = function(node){
		if(node.children){
			node.children.forEach(function(d,i){
				d.index = i;
				saveIndicies(d);
			});
		}
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
		legend.animationDuration(animationDuration);
		horizontalControls.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;

		if(value.invert){
			controls.invert.visible = (value.invert.visible != null)? value.invert.visible:controls.invert.visible;
			controls.invert.enabled = (value.invert.enabled != null)? value.invert.enabled:controls.invert.enabled;
		}
		if(value.sort){
			controls.sort.visible = (value.sort.visible != null)? value.sort.visible:controls.sort.visible;
			controls.sort.enabled = (value.sort.enabled != null)? value.sort.enabled:controls.sort.enabled;
		}
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}

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
		newData = true;
		currentChartData = chartData.data;
		saveIndicies(currentChartData.partition);
		currentRoot = currentChartData.partition;
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
				.on('mouseout.ad-mouseout', sunburstMouseout);


		selection.group.sunburst.arcs = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-arcs');

		selection.group.sunburst.tooltip = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-tooltip');

		selection.group.sunburst.tooltip.text = selection.group.sunburst.tooltip
			.append('text');

		//create legend container
		selection.group.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		//create breadcrumbs container
		selection.group.breadcrumbs = selection.group
			.append('g')
				.attr('class','ad-sunburst-breadcrumbs');


		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','ad-controls');


		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});

		//intialize new legend
		legend
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

		if(newData){
			var partition;
			newData = false;

			if(controls.sort.enabled){
				partition = d3.layout.partition()
					    .value(function(d) { return d.size; });
			}else{
				partition = d3.layout.partition()
					    .value(function(d) { return d.size; }).sort(function(a,b){return a.index - b.index;});
			}

			partitionData = partition.nodes(currentChartData.partition);

			var topNodes = partitionData.filter(function(d){return d.top;});
			if(controls.hideLegend.enabled){
				var legendData = {data:{items:[]}};
			}else{
				var legendData = {
					data:{
						items: d3
										.set(topNodes.map(function(d){return d.name;}))
										.values()
										.map(function(d){return {label:d};})
					}
				};
			}
			legend.data(legendData);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

		selection.svg
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		innerWidth = width - forcedMargin.right - forcedMargin.left;


		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.data(controlsData).width(innerWidth).update();

		selection.group.breadcrumbs
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left + innerWidth - horizontalControls.computedWidth())+','+(forcedMargin.top)+')');

		breadcrumbs.width(innerWidth).update();
		forcedMargin.top += Math.max(breadcrumbs.computedHeight(), horizontalControls.computedHeight());

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

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
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+forcedMargin.top+')';
		else
			legendTranslation = 'translate('+(forcedMargin.left+(innerWidth-legend.computedWidth())/2)+','+(innerHeight+forcedMargin.top-legend.computedHeight())+')';

		selection.group.legend
			.transition()
				.duration(animationDuration)
				.attr('transform',legendTranslation);

		if(legendOrientation == 'right' || legendOrientation == 'left')
			forcedMargin[legendOrientation] += legend.computedWidth();
		else
			forcedMargin[legendOrientation] += legend.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		innerWidth = width - forcedMargin.left - forcedMargin.right;

		selection.group.sunburst
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+innerWidth/2)+','+(forcedMargin.top+innerHeight/2)+')');


		radius.outer = Math.min(innerWidth,innerHeight)/2-20;
		radius.inner = radius.outer/3;


		if(!controls.invert.enabled){
			y.children.range([radius.inner + 0.17 * (radius.outer - radius.inner), radius.outer]);
			y.parents.range([radius.inner, radius.inner + 0.13 * (radius.outer - radius.inner)]);
		}else{
			y.children.range([radius.outer - 0.17 * (radius.outer - radius.inner), radius.inner]);
			y.parents.range([radius.outer, radius.outer - 0.13 * (radius.outer - radius.inner)]);
		}

	  selection.group.sunburst.arcs.arc = selection.group.sunburst.arcs.selectAll("g.sunburst-arc")
		    .data(partitionData,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return getAncestors(d).map(function(d){return d.name}).join('-');
					})
		// sunburst_mouseout();
		var newArcs =	selection.group.sunburst.arcs.arc.enter().append("g")
			.attr('class','sunburst-arc')
			.style('opacity',0)
			.on('mouseover.ad-mouseover',function(d,i){
				for(key in on.elementMouseover){
					on.elementMouseover[key].call(this,d,i,'arc');
				}
			})
			.on('mouseout.ad-mouseout',function(d,i){
				for(key in on.elementMouseout){
					on.elementMouseout[key].call(this,d,i,'arc');
				}
			})
			.on('click.ad-click',function(d,i){
				for(key in on.elementClick){
					on.elementClick[key].call(this,d,i,'arc');
				}
			});

		var newPaths = newArcs.append("path")
				.on('mouseover.ad-mouseover',arcMouseover);


		selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration)
				.style('opacity',1);


		selection.group.sunburst.arcs.arc.path = selection.group.sunburst.arcs.arc.select('path')
				.style('fill',arcFill);

		selection.group.sunburst.arcs.arc.path
				.on('click.ad-click',arcTweenZoom)
				.classed('ad-pointer-element',true);

		updateArcs();

		resetSunburstTooltip();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
