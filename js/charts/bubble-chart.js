/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

///////TODO - Change circle packing to custom algorithm that uses cluster packing rather than d3.force layout

/*bubble chart*/
d3b.CHARTS.bubbleChart = function(){

	//define chart variables
	var width = d3b.CONSTANTS.DEFAULTWIDTH(),
			height = d3b.CONSTANTS.DEFAULTHEIGHT(),
			svgHeight = height-55;

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d3b.CONSTANTS.DEFAULTFORCEDMARGIN();

	var legend = new d3b.UTILS.LEGENDS.legend(),
	  	horizontalControls = new d3b.UTILS.CONTROLS.controls(),
			legendOrientation = 'right';

	var color = d3b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};

	var xFormat = function(value){return value};

	var current = {grouping:null,colorGrouping:null};

	var changeLegendWidth = 250;

	//scales for bubble radius, change color, change legend, change axis, change group axis
	var r = d3.scale.linear(),
			colorChange = d3.scale.threshold()
				.domain([-0.25, -0.05, -0.001, 0.001, 0.05, 0.25])
				.range(['#d84b2a', '#ee9586', '#e4b7b2', '#888', '#beccae', '#9caf84', '#7aa25c']),
			changeScaleLegend = d3.scale.ordinal()
				.domain([-1, -0.25, -0.05, 0.0, 0.05, 0.25, 1])
				.rangeBands([0,changeLegendWidth]),
			changeScaleAxis = d3.scale.linear()
				.domain([-0.25, 0.25]),
			changeGroupsScale = d3.scale.ordinal();

	//define scales for bubble group placement and font-size
	var groupsScales = {
		x:d3.scale.ordinal(),
		y:d3.scale.ordinal(),
		fontSize:d3.scale.linear().range([10, 30]).domain([0, 500])
	};


	var longestGroupsTick = 0;

	var formatPercent = d3.format("%");

	//change axis init and tick formatting
	var changeAxis = d3.svg.axis().orient("top")
			.tickFormat(function(d){
				if(d>0.25 || d<-0.25)
					return '';

				if(controls.sortByChange.enabled){
					if(d==0.25)
					  return formatPercent(d)+' or higher';
					else if(d==-0.25)
					  return formatPercent(d)+' or lower';
				}

				return formatPercent(d);
			}),
			groupsAxis = d3.svg.axis().scale(changeGroupsScale).orient("left");

	//init controls to all invisible and disabled
	var controls = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sortByChange: {
					label: "Sort By Change",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				colorByChange: {
					label: "Color By Change",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};


	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	//on force Tick, compute new node positions
	var forceTick = function(e){
		  var k = e.alpha * 0.095;
			this.nodeElements.each(function(d, i) {
				if(d.group){
					d.y += (d.group.focus.y - d.y) * k;
					d.x += (d.group.focus.x - d.x) * k;
				}
	    });
			// this.nodeElements
			// 	.transition()
			// 		.duration(10)
			// 		.ease('linear')
			// 		.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'});
	}

	// update the grouping for all nodes
	var updateNodeGrouping = function(grouping, type){
		if(!type)
			type = "grouping";
		currentChartData.nodes.forEach(function(d,i){
			d[type] = grouping;
		});
	};

	// update the visual group that each node resides in
	var updateNodeGroup = function(grouping){
		currentChartData.nodes.forEach(function(d,i){
			d.group = current.grouping.groups[d.enrollments[d.grouping.index]];
		});
	}

	// update the bubble radius based on total value of the grouping and the chart dimensions
	var updateRadiusScale = function(grouping){
		r
			.range([0,Math.min(innerHeight,innerWidth)/4])
			.domain([0,Math.sqrt(grouping.total/Math.PI)]);
	};

	// special radius function to calculate the radius from the area-value input
	var radius = function(value){
		return Math.max(3,r(Math.sqrt(value/Math.PI)));
	};

	//update the top buttons
	var updateGroupingButtons = function(){
		/*Make grouping buttons*/
		selection.buttonsWrapper.buttons.button = selection.buttonsWrapper.buttons.selectAll('ul').data(currentChartData.groupings, function(d,i){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000)
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});
		var newButton = selection.buttonsWrapper.buttons.button.enter()
			.append('ul');

		newButton.append('li')
			.attr('class','d3b-button')
			.on('click.d3b-click',function(d,i){
				current.grouping = d;
				updateNodeGrouping(d);
				updateNodeGroup();
				chart.update();
				for(key in on.elementClick){
					on.elementClick[key].call(this,d,i,'grouping-button');
				}
			})
			.on('mouseover.d3b-mouseover', function(d,i){
				for(key in on.elementMouseover){
					on.elementMouseover[key].call(this,d,i,'grouping-button');
				}
			})
			.on('mouseout.d3b-mouseout', function(d,i){
				for(key in on.elementMouseout){
					on.elementMouseout[key].call(this,d,i,'grouping-button');
				}
			});
		newButton.append('li')
			.attr('class','d3b-color-button')
			.on('click.d3b-click',function(d,i){
				current.colorGrouping = d;
				updateNodeGrouping(d, "colorGrouping");
				chart.update();
				for(key in on.elementClick){
					on.elementClick[key].call(this,d,i,'color-by-grouping-button');
				}
			})
			.on('mouseover.d3b-mouseover', function(d,i){
				for(key in on.elementMouseover){
					on.elementMouseover[key].call(this,d,i,'color-by-grouping-button');
				}
			})
			.on('mouseout.d3b-mouseout', function(d,i){
				for(key in on.elementMouseout){
					on.elementMouseout[key].call(this,d,i,'color-by-grouping-button');
				}
			});

		selection.buttonsWrapper.buttons.button.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

		selection.buttonsWrapper.buttons.button.grouping = selection.buttonsWrapper.buttons.button.select('li.d3b-button')
				.text(function(d){return d.label;})
				.classed('d3b-selected',function(d,i){return d == current.grouping;});

		selection.buttonsWrapper.buttons.button.color = selection.buttonsWrapper.buttons.button.select('li.d3b-color-button')
				.html('<i class="fa fa-paint-brush"></i>')
				.classed('d3b-selected',function(d,i){return d == current.colorGrouping;});
	};


	// update controls
	var updateControls = function(){
		//update controls
		var controlsData = d3b.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.data(controlsData).width(innerWidth).update();

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left + innerWidth - horizontalControls.computedWidth())+','+(forcedMargin.top)+')');
	};

	//update main legend
	var updateLegend = function(){
		//main legend
		var legendData;
		if(controls.hideLegend.enabled){
			legendData = {data:{items:[]}};
		}else if(controls.colorByChange.enabled){
			legendData = {
				data:{
					items:	[]
				}
			};
		}else if(current.colorGrouping.hideLegend){
			legendData = {data:{items:[]}};
		}else{
			legendData = {
				data:{
					items:	d3
										.set(current.grouping.nodes.map(function(d){return d.enrollments[d.colorGrouping.index];}))
										.values()
										.map(function(d){
											if(d == 'null')
												return {label:'Non-'+current.colorGrouping.label};
											else
												return {label:d};
											})
				}
			};
		}

		innerHeight = svgHeight - forcedMargin.top - forcedMargin.bottom;

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

	};

	//update views, sort by change / sort by grouping
	var updateViews = function(){

		if(controls.sortByChange.enabled || controls.colorByChange.enabled){
				selection.changeAxis
					.transition()
						.duration(animationDuration)
						.style('opacity',1);
		}

		if(controls.sortByChange.enabled || !controls.colorByChange.enabled){
				selection.changeAxis.legend
					.transition()
						.duration(animationDuration)
						.style('opacity',0);
		}
		if(controls.sortByChange.enabled){
			selection.group.groups
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
		}else{
				updateGroups();
				selection.group.groups
					.transition()
						.duration(animationDuration)
						.style('opacity',1);
		}

		if(controls.colorByChange.enabled){
			selection.buttonsWrapper.buttons.button.color.style('display','none');
		}else{
			selection.buttonsWrapper.buttons.button.color.style('display','block');
		}

		longestGroupsTick = 0;
		if(controls.sortByChange.enabled){
			changeGroupsScale.domain(Object.keys(current.grouping.groups)).rangeBands([0,innerHeight-60]);

			selection.groupsAxis
					.call(groupsAxis);


			selection.groupsAxis.selectAll('.tick text').each(function(d){
				if(longestGroupsTick < this.getComputedTextLength())
					longestGroupsTick = this.getComputedTextLength();
			})

			groupsAxis.tickSize(-innerWidth+forcedMargin.left + longestGroupsTick);

			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.call(groupsAxis)
					.style('opacity',1)
					.attr('transform','translate('+(forcedMargin.left + longestGroupsTick -20)+','+(forcedMargin.top+60)+')');


			changeScaleAxis
				.range([0,innerWidth-80-longestGroupsTick]);
			changeAxis
					.tickSize(-innerHeight+30)
					.scale(changeScaleAxis);
			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',1)
					.attr('transform','translate('+(forcedMargin.left+30+longestGroupsTick)+','+(20+forcedMargin.top + horizontalControls.computedHeight())+')')
			selection.changeAxis.axis
				.transition()
					.duration(animationDuration)
					.call(changeAxis);


		}else if(controls.colorByChange.enabled){
			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
			selection.changeAxis.legend
				.transition()
					.delay(animationDuration/4)
					.duration(animationDuration)
					.style('opacity',1);
			changeAxis
					.tickSize(15)
					.scale(changeScaleLegend);

			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',1)
					.attr('transform','translate('+(width -changeLegendWidth- 20)+','+(20+forcedMargin.top + horizontalControls.computedHeight())+')')

			selection.changeAxis.axis
				.transition()
					.duration(animationDuration)
					.call(changeAxis);
		}else{
			selection.changeAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
			selection.groupsAxis
				.transition()
					.duration(animationDuration)
					.style('opacity',0);
		}
	};

	var bubbleMouseover = function(d, i){
		var changeHTML = '';

		if(isNaN(d.change)){}
		else if(d.change >= 0)
			changeHTML = '(+'+formatPercent(d.change)+')';
		else if(d.change < 0)
			changeHTML = '('+formatPercent(d.change)+')';

		d3b.UTILS.createGeneralTooltip(d3.select(this), "<b>"+d.label+"</b>", xFormat(d.value)+' '+changeHTML);

		for(key in on.elementMouseover){
			on.elementMouseover[key].call(this,d,i,'bubble');
		}
	};

	var bubbleMouseout = function(d,i){
		d3b.UTILS.removeTooltip();
		for(key in on.elementMouseout){
			on.elementMouseout[key].call(this,d,i,'bubble');
		}
	};

	var bubbleClick = function(d,i){
		d3b.UTILS.removeTooltip();
		for(key in on.elementClick){
			on.elementClick[key].call(this,d,i,'bubble');
		}
	};

	//GP async loop
	var asyncLoop = function(iterations, process, exit){
	    var index = 0,
	        done = false,
	        shouldExit = false;
	    var loop = {
	        next:function(){
	            if(done){
	                if(shouldExit && exit){
	                    return exit();
	                }
	            }
	            if(index < iterations){
	                index++;
	                process(loop);
	            } else {
	                done = true;
	                if(exit) exit();
	            }
	        },
	        iteration:function(){
	            return index - 1;
	        },
	        break:function(end){
	            done = true;
	            shouldExit = end;
	        }
	    };
	    loop.next();
	    return loop;
	}

	//update bubble positioning
	var updateBubbles = function(){

		selection.group.bubbles.bubble = selection.group.bubbles.selectAll('g.d3b-bubble')
				.data(current.grouping.nodes.sort(function(a,b){return d3.ascending(b.value, a.value);}),function(d,i){
					if(d.key == 'unique')
						return Math.floor((1 + Math.random()) * 0x10000)
					else if(d.key && d.key != 'auto')
						return d.key;
					else
						return d.label;
				});

		var newBubble = selection.group.bubbles.bubble.enter()
			.append('g')
				.attr('class','d3b-bubble')
				.on('mouseover.d3b-mouseover', bubbleMouseover)
				.on('mouseout.d3b-mouseout', bubbleMouseout)
				.on('click.d3b-click', bubbleClick);
				// .style('opacity',0);

		newBubble.append('circle')
				.style('fill',function(d){return color(d.enrollments[d.colorGrouping.index]);})
				.style('stroke',function(d){return color(d.enrollments[d.colorGrouping.index]);})
				.attr('r',0);

		selection.group.bubbles.bubble.circle = selection.group.bubbles.bubble.select('circle')

		var circleTransition = selection.group.bubbles.bubble.circle
			.transition()
				.duration(animationDuration)
				.attr('r',function(d){return radius(d.value);});

		if(current.groups){
			current.groups.forEach(function(d){
				// d.force.stop();
				d.nodeElements = selection.group.bubbles.bubble.filter(function(b){
					return b.group == d && b.enrollments[current.grouping.index];
				})
			});
		}

		if(controls.colorByChange.enabled){
			circleTransition
				.style('fill',function(d){return colorChange(d.change);})
				.style('stroke',function(d){return d3.rgb(colorChange(d.change)).darker(1);});
		}else{
			circleTransition
				.style('fill',function(d){
						if(d.enrollments[d.colorGrouping.index])
							return color(d.enrollments[d.colorGrouping.index]);
						else
							return color('Non-'+current.colorGrouping.label);
					})
				.style('stroke',function(d){
						if(d.enrollments[d.colorGrouping.index])
							return d3.rgb(color(d.enrollments[d.colorGrouping.index])).darker(1);
						else
							return d3.rgb(color('Non-'+current.colorGrouping.label)).darker(1);
					})
		}

		//place bubbles either in groups or on change axis
		if(controls.sortByChange.enabled){
			var changeRange = changeScaleAxis.range();

			selection.group.bubbles.bubble
				.transition()
					.duration(animationDuration*1.5)
					.each(function(d){
						d.x = (20+Math.min(changeRange[1],Math.max(changeRange[0], changeScaleAxis(d.change)))) + (longestGroupsTick + 10) + forcedMargin.left;
						d.y = (changeGroupsScale(d.enrollments[d.grouping.index])+changeGroupsScale.rangeBand()/2+ 60 + forcedMargin.top);
					})
					.attr('transform',function(d,i){return 'translate('+d.x+','+d.y+')';});

		}else{


			current.groups.forEach(function(d){
				//set force parameters and start it
				d.force
						.size([innerWidth, innerHeight])
						.start();
				//auto-advance the force.tick until the alpha parameter is less than 0.025, then transition the bubbles
				asyncLoop(300, function(loop){
					if(d.force.alpha() < 0.025)
						loop.break(true);
	        var i = loop.iteration();
					d.force.tick();
	        loop.next();
				}, function(){
					d.force.stop();
					d.nodeElements
						.transition()
							.duration(animationDuration*1.5)
							.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'});
				});
			});

		}

		//if new bubbles added to old bubbles, sort visual space largest to smallest
		if(newBubble.size() && selection.group.bubbles.bubble.size() > newBubble.size()){
			selection.group.bubbles.bubble.each(function(d){
				selection.group.bubbles.node().appendChild(this);
			});
		}

		selection.group.bubbles.bubble.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr('transform',function(d){return 'translate(0,0)'})
				.remove()
			.select('circle')
				.attr('r',0);
	};

	// update bubble groups positioning
	var updateGroups = function(){
		current.groups = [];
		for(key in current.grouping.groups)
			current.groups.push(current.grouping.groups[key]);

		var ratio = innerWidth/innerHeight;

		var groupsPerRow = Math.min(current.groups.length,Math.max(1, Math.round(Math.sqrt(current.groups.length) * (ratio))));
		var groupsPerColumn = Math.ceil(current.groups.length/groupsPerRow);

		selection.group.groups.group = selection.group.groups.selectAll('g').data(current.groups);

		groupsScales.x.domain(d3.range(0, groupsPerRow)).rangeBands([0,innerWidth]);
		groupsScales.y.domain(d3.range(0, groupsPerColumn)).rangeBands([0,innerHeight-100]);

		var newGroup = selection.group.groups.group.enter()
			.append('g')
				.style('opacity',0);

		newGroup.append('text').attr('class','d3b-group-title');
		newGroup.append('text').attr('class','d3b-group-total');
		selection.group.groups.group
			.each(function(d,i){
				d.total = d3.sum(d.nodes.map(function(d){return d.value;}));
				d.focus = {x:groupsScales.x(i%groupsPerRow)+groupsScales.x.rangeBand()/2, y:groupsScales.y(Math.floor(i/groupsPerRow))+100+groupsScales.y.rangeBand()/2};

				//if the d3 force layout has not been initialized for this bubble-group yet, initialize it
				if(!d.force){
					d.force = d3.layout.force()
		          .links([])
		          .gravity(0)
							.friction(0.9)
		          .charge(function(d){return -Math.pow( radius(d.value), 2.0) / 9;})
		          .nodes(d.nodes)
		          .on('tick', forceTick.bind(d));
				}
				d.force.stop();

			})
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d,i){
					return 'translate('+(groupsScales.x(i%groupsPerRow)+groupsScales.x.rangeBand()/2)+','+(groupsScales.y(Math.floor(i/groupsPerRow))+100)+')'
				})
				.style('opacity',1);

		selection.group.groups.selectAll('.focus').remove();

		var fontSize = Math.min(30,Math.max(8,groupsScales.fontSize((innerWidth + innerHeight)/(current.groups.length))))

		selection.group.groups.group.total = selection.group.groups.group.select('text.d3b-group-total')
			// .attr('y', groupsScales.y.rangeBand()/2)
			.text(function(d){return xFormat(d.total);})
			.style('font-size', fontSize+'px')
		selection.group.groups.group.each(function(d){
			// selection.group.groups.append('circle').attr('class','focus').attr('r',5).style('fill','red').attr('cx',d.focus.x).attr('cy',d.focus.y)

				// selection.group.groups.group.append('text').attr('class','focus').text('$12.1M').style('text-anchor','middle').attr('x',d.focus.x).attr('y',d.focus.y)
		});

		// selection.group.groups.group
		selection.group.groups.group.title = selection.group.groups.group.select('text.d3b-group-title')
				.text(function(d){return d.label;})
				.attr('dy',0)
				.attr('y',fontSize)
				// .attr('y',0)
				.style('font-size', fontSize+'px')
				.call(d3b.UTILS.textWrap, groupsScales.x.rangeBand()-10);

		selection.group.groups.group.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

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
		svgHeight = height-55;
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
		xFormat = d3b.UTILS.numberFormat(value);
		return chart;
	};

	chart.legendOrientation = function(value){
		if(!arguments.length) return legendOrientation;
		legendOrientation = value;
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.hideLegend){
			controls.hideLegend.visible = (value.hideLegend.visible != null)? value.hideLegend.visible:controls.hideLegend.visible;
			controls.hideLegend.enabled = (value.hideLegend.enabled != null)? value.hideLegend.enabled:controls.hideLegend.enabled;
		}
		if(value.sortByChange){
			controls.sortByChange.visible = (value.sortByChange.visible != null)? value.sortByChange.visible:controls.sortByChange.visible;
			controls.sortByChange.enabled = (value.sortByChange.enabled != null)? value.sortByChange.enabled:controls.sortByChange.enabled;
		}
		if(value.colorByChange){
			controls.colorByChange.visible = (value.colorByChange.visible != null)? value.colorByChange.visible:controls.colorByChange.visible;
			controls.colorByChange.enabled = (value.colorByChange.enabled != null)? value.colorByChange.enabled:controls.colorByChange.enabled;
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

		currentChartData = chartData.data;

		currentChartData.nodes = currentChartData.nodes.filter(function(d){return d.value > 0;})

		//link groupings by enrollments
		currentChartData.groupings.forEach(function(d, i){
			d.index = i;
			d.nodes = currentChartData.nodes.filter(function(node){ return node.enrollments[i];	});
			d.groups = {};
			d.total = 0;
			d.nodes.forEach(function(node){
				d.total += node.value;
				if(!d.groups[node.enrollments[i]])
					d.groups[node.enrollments[i]] = {nodes:[], label:node.enrollments[i]};
				d.groups[node.enrollments[i]].nodes.push(node);
			});
		});

		//update grouping
		var tempGrouping = current.grouping;
		current.grouping = currentChartData.groupings[0];
		if(tempGrouping){
			currentChartData.groupings.forEach(function(d){
				if(tempGrouping.label == d.label)
					current.grouping = d;
			});
		}
		updateNodeGrouping(current.grouping);
		updateNodeGroup();

		//update color grouping
		tempGrouping = current.colorGrouping;
		current.colorGrouping = currentChartData.groupings.filter(function(d){return d.default_color_grouping;})[0];
		if(tempGrouping){
			currentChartData.groupings.forEach(function(d){
				if(tempGrouping.label == d.label)
					current.colorGrouping = d;
			});
		}else if(!current.colorGrouping){
			current.colorGrouping = currentChartData.groupings[0];
		}
		updateNodeGrouping(current.colorGrouping, "colorGrouping");

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create button container
		selection.buttonsWrapper = selection
			.append('div')
				.attr('class','d3b-bubble-chart-buttons-wrapper');

		selection.buttonsWrapper.buttons = selection.buttonsWrapper
			.append('ul')
				.attr('class','d3b-buttons');

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','d3b-bubble-chart d3b-svg d3b-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.bubbles = selection.group
			.append('g')
				.attr('class','d3b-bubbles');

		//create change axis/legend
		selection.changeAxis = selection.group
			.append('g')
				.attr('class','d3b-change-axis-legend');

		selection.changeAxis.legend = selection.changeAxis
			.append('g');

		selection.changeAxis.axis = selection.changeAxis
			.append('g');

		selection.group.groups = selection.group
			.append('g')
				.attr('class','d3b-groups');

		//create groups axis
		selection.groupsAxis = selection.group
			.append('g')
				.attr('class','d3b-groups-axis');

		//init change legend rects
		selection.changeAxis.legend.rect = selection.changeAxis.legend.selectAll('rect').data([-0.25, -0.05, 0.0, 0.05, 0.25, 1]);
		selection.changeAxis.legend.rect.enter()
			.append('rect')
			.style('fill', function(d){return colorChange(d-0.01);})
			.attr('x',function(d){return changeScaleLegend(d)-changeScaleLegend.rangeBand()/2;})
			.attr('width',changeScaleLegend.rangeBand())
			.attr('height',10)
			.attr('y',-15);



		//create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','d3b-legend');

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','d3b-controls');


		horizontalControls
				.selection(selection.controls)
				.on('change',function(d,i){
					controls[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						newData = true;
					}
					chart.update();
				});

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

		selection.svg
				.attr('width',width)
				.attr('height',svgHeight);

		updateGroupingButtons();

		forcedMargin = d3b.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		updateControls();


		forcedMargin.top += horizontalControls.computedHeight() + 10;

		updateLegend();

		if(legendOrientation == 'right' || legendOrientation == 'left')
			forcedMargin[legendOrientation] += legend.computedWidth();
		else
			forcedMargin[legendOrientation] += legend.computedHeight();

		innerHeight = svgHeight - forcedMargin.top - forcedMargin.bottom;
		innerWidth = width - forcedMargin.left - forcedMargin.right;

		updateViews();
		updateRadiusScale(current.grouping);
		updateBubbles();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
