/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
d3b.createNameSpace("d3b.UTILS.LEGENDS");
d3b.UTILS.LEGENDS.legend = function(){
	var maxWidth = d3b.CONSTANTS.DEFAULTWIDTH(), maxHeight = d3b.CONSTANTS.DEFAULTHEIGHT();
	var innerMaxHeight, innerMaxWidth;
	var items = [];
	var color = d3b.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentLegendData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var orientation = 'horizontal';
	var padding = 5;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
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

		computedHeight = 0;
		computedWidth = 0;

		innerMaxHeight = maxHeight - padding*2;
		innerMaxWidth = maxWidth - padding*2;


		var item = selection.selectAll('g.d3b-legend-item')
				.data(currentLegendData.items, function(d){return d.label;});

		var newItem = item.enter()
			.append('g')
				.attr('class','d3b-legend-item')
				.style('opacity',0)
				.on('mouseover.d3b-mouseover',function(d,i){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i);
					}
				})
				.on('mouseout.d3b-mouseout',function(d,i){
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i);
					}
				})
				.on('click.d3b-click',function(d,i){
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i);
					}
				});

		newItem.append('circle')
			.style('fill',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label))})
			.style('stroke',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label));});

		newItem.append('text')
				.text(function(d){return d.label;})

		var circle = item.select('circle')
				.attr('r',scale)
				.attr('y',scale/2);

		circle
			.transition()
				.duration(animationDuration)
				.style('stroke-width',function(d){
					if(d.open)
						return '2px';
					else
						return '0px';
				})
				.style('fill-opacity', function(d){
					if(d.open)
						return 0;
					else
						return 1;
				});

		var text = item.select('text')
				.style('font-size',scale*2.5+'px')
				.attr('x',scale*2)
				.attr('y',scale);

		var xCurrent = scale + padding;
		var yCurrent = scale + padding;
		var maxItemLength = 0;
		var maxY = 0;

		if(currentLegendData.items.length > 0){

			if(orientation == 'vertical'){


				item
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
				text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += scale*6;
				var itemsPerRow = Math.floor((innerMaxWidth+3*scale)/maxItemLength);

				item
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
				computedWidth = (item.size() > itemsPerRow)?
															maxItemLength * itemsPerRow - 3*scale + padding*2
															:
															maxItemLength * item.size() - 3*scale + padding*2;

			}

		}
		item.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();

		if(callback)
			callback();

		return legend;
	};

	return legend;
};
