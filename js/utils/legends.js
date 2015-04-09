/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
d2b.createNameSpace("d2b.UTILS.LEGENDS");
d2b.UTILS.LEGENDS.legend = function(){
	var maxWidth = d2b.CONSTANTS.DEFAULTWIDTH(), maxHeight = d2b.CONSTANTS.DEFAULTHEIGHT();
	var innerMaxHeight, innerMaxWidth;
	var items = [];
	var color = d2b.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentLegendData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var orientation = 'horizontal';
	var padding = 5;
	var active = false;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		elementDblClick:function(){}
	};

	var itemEnter = function(){

				computedHeight = 0;
				computedWidth = 0;

				innerMaxHeight = maxHeight - padding*2;
				innerMaxWidth = maxWidth - padding*2;


				selection.item = selection.selectAll('g.d2b-legend-item')
						.data(currentLegendData.items, function(d){return d.label;});

				var newItem = selection.item.enter()
					.append('g')
						.attr('class','d2b-legend-item')
						.style('opacity',0)
						.on('mouseover.d2b-mouseover',function(d,i){
							d.hovered = true;
							var elem = d3.select(this);
							if(active){
								if(d.open){
									elem.select('circle.d2b-legend-circle-foreground')
										.transition()
											.duration(animationDuration/2)
											.style('fill-opacity', 0.8);
								}else{
									elem.select('circle.d2b-legend-circle-background')
										.transition()
											.duration(animationDuration/2)
											.attr('r',scale*1.5);
								}
							}

							for(key in on.elementMouseover){
								on.elementMouseover[key].call(this,d,i);
							}
						})
						.on('mouseout.d2b-mouseout',function(d,i){
							d.hovered = false;
							var elem = d3.select(this);

							elem.select('circle.d2b-legend-circle-foreground')
								.transition()
									.duration(animationDuration/2)
									.style('fill-opacity', function(d){
										if(d.open)
											return 0;
										else
											return 0.8;
									});
							elem.select('circle.d2b-legend-circle-background')
								.transition()
									.duration(animationDuration/2)
									.attr('r',scale);

							for(key in on.elementMouseout){
								on.elementMouseout[key].call(this,d,i);
							}
						})
						.on('click.d2b-click',function(d,i){
							for(key in on.elementClick){
								on.elementClick[key].call(this,d,i);
							}
						})
						.on('dblclick.d2b-dblClick',function(d,i){
							for(key in on.elementDblClick){
								on.elementDblClick[key].call(this,d,i);
							}
						});

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-background')
					.style('stroke',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label));});

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-foreground')
					.style('fill',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label))});

				newItem.append('text')
						.text(function(d){return d.label;});

	};

	var updateElements = function(){

				var circleBackground = selection.item.select('circle.d2b-legend-circle-background');

				circleBackground
					.transition()
						.duration(animationDuration/2)
						.style('stroke-width', scale/4)
						.attr('y',scale/2)
						.attr('r',function(d){
							if(d.open)
								return scale;
							else
								return (d.hovered)?scale*1.5:scale;
						});

				var circleForeground = selection.item.select('circle.d2b-legend-circle-foreground');

				circleForeground
					.transition()
						.duration(animationDuration/2)
						.attr('r',scale)
						.attr('y',scale/2)
						.style('fill-opacity', function(d){
							if(d.open)
								return (d.hovered)?0.6:0;
							else
								return 0.8;
						})
						.attr('r',function(d){
							if(d.open)
								return scale * 0.5;
							else
								return scale;
						});

				selection.item.classed('d2b-active', (active)? true:false)

				selection.item.text = selection.item.select('text')
						.style('font-size',scale*2.5+'px')
						.attr('x',scale*2)
						.attr('y',scale);

	};

	var updatePositions = function(){

		var xCurrent = scale + padding;
		var yCurrent = scale + padding;
		var maxItemLength = 0;
		var maxY = 0;

		if(currentLegendData.items.length > 0){

			if(orientation == 'vertical'){

				selection.item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							var position = 'translate('+xCurrent+','+yCurrent+')';

							if(yCurrent > maxY)
								maxY = yCurrent

							yCurrent += scale*4;
							maxItemLength = Math.max(maxItemLength,d3.select(this).select('text').node().getComputedTextLength());
							if(yCurrent + scale > innerMaxHeight){
								yCurrent = scale + padding;
								xCurrent += maxItemLength + scale * 6;
								maxItemLength = 0;
							}
							return position;
						});

				computedWidth = xCurrent + maxItemLength + scale*2 + padding;
				computedHeight = maxY + scale + padding;

			}else{

			  var maxItemLength = 0;
				selection.item.text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += scale*6;
				var itemsPerRow = Math.floor((innerMaxWidth+3*scale)/maxItemLength);

				selection.item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							if(i%itemsPerRow == 0 && i > 0){
								xCurrent = scale + padding;
								yCurrent += scale*4
							}
							var position = 'translate('+xCurrent+','+yCurrent+')';
							xCurrent += maxItemLength;
							return position;
						});

				computedHeight = yCurrent + scale + padding;
				computedWidth = (selection.item.size() > itemsPerRow)?
															maxItemLength * itemsPerRow - 3*scale + padding*2
															:
															maxItemLength * selection.item.size() - 3*scale + padding*2;

			}

		}
	};

	var itemExit = function(){
		selection.item.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
	};

	var legend = {};

	legend.items = function(value){
		if(!arguments.length) return items;
		items = value;
		return legend;
	};
	legend.padding = function(value){
		if(!arguments.length) return padding;
		padding = value;
		return legend;
	};
	legend.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return legend;
	};
	legend.height = function(value){
		if(!arguments.length) return maxHeight;
		maxHeight = value;
		return legend;
	};
	legend.computedHeight = function(){
		return computedHeight;
	}
	legend.computedWidth = function(){
		return computedWidth;
	}
	legend.color = function(value){
		if(!arguments.length) return color;
		color = value;
		return legend;
	};
	legend.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return legend;
	};
	legend.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		return legend;
	};
	legend.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return legend;
	};
	legend.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return legend;
	};
	legend.orientation = function(value){
		if(!arguments.length) return orientation;
		orientation = value;
		return legend;
	};
	legend.active = function(value){
		if(!arguments.length) return active;
		active = value;
		return legend;
	};

	legend.on = function(key, value){
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

		return legend;
	};

	legend.data = function(legendData, reset){
		if(!arguments.length) return currentLegendData;
		currentLegendData = legendData.data;
		// will tackle deal with sorting options later
		// currentLegendData.items.sort(function(a,b){return d3.ascending(a.label,b.label)})

		return legend;
	}

	legend.update = function(callback){
		if(!selection)
			return console.warn('legend was not given a selection');

		itemEnter();
		updateElements();
		updatePositions();
		itemExit();

		if(callback)
			callback();

		return legend;
	};

	return legend;
};
