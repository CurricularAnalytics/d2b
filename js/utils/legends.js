/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
AD.createNameSpace("AD.UTILS.LEGENDS");
AD.UTILS.LEGENDS.legend = function(){
	var maxWidth = AD.CONSTANTS.DEFAULTWIDTH(), maxHeight = AD.CONSTANTS.DEFAULTHEIGHT();
	var items = [];
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentLegendData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var orientation = 'horizontal';


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


		var item = selection.selectAll('g.ad-legend-item')
				.data(currentLegendData.items, function(d){return d.label;});

		var newItem = item.enter()
			.append('g')
				.attr('class','ad-legend-item')
				.style('opacity',0)
				.on('mouseover.ad-mouseover',function(d,i){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i);
					}
				})
				.on('mouseout.ad-mouseout',function(d,i){
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i);
					}
				})
				.on('click.ad-click',function(d,i){
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i);
					}
				});

		newItem.append('circle')
				.attr('fill',function(d){return d.color || ((d.colorKey)? color(d.colorKey) : color(d.label));});

		newItem.append('text')
				.text(function(d){return d.label;})

		var circle = item.select('circle')
				.attr('r',scale)
				.attr('y',scale/2);
		var text = item.select('text')
				.style('font-size',scale*2.5+'px')
				.attr('x',scale*2)
				.attr('y',scale);

		if(currentLegendData.items.length > 0){

			if(orientation == 'vertical'){

				var xCurrent = 0;
				var yCurrent = 0;
				var maxItemLength = 0;
				item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							var position = 'translate('+xCurrent+','+yCurrent+')';
							yCurrent += scale*4;
							maxItemLength = Math.max(maxItemLength,d3.select(this).select('text').node().getComputedTextLength());
							if(yCurrent > maxHeight){
								yCurrent = 0;
								xCurrent += maxItemLength + scale * 6;
								maxItemLength = 0;
							}
							return position;
						});

				computedWidth = xCurrent + maxItemLength + scale * 6;
				computedHeight = (xCurrent==0)? yCurrent : maxHeight;

			}else{

			  var maxItemLength = 0;
				text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += scale*6;
				var itemsPerRow = Math.floor(maxWidth/maxItemLength);

				var xCurrent = 0;
				var yCurrent = 0;
				item
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							if(i%itemsPerRow == 0){
								xCurrent = 0;
								yCurrent += scale*4
							}
							var position = 'translate('+xCurrent+','+yCurrent+')';
							xCurrent += maxItemLength;
							return position;
						});

				computedHeight = yCurrent;
				computedWidth = (item[0].length >= itemsPerRow)? maxItemLength * itemsPerRow : maxItemLength * item[0].length;

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
