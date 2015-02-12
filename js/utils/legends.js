/*LEGEND UTILITIES*/
AD.createNameSpace("AD.UTILS.LEGENDS");
AD.UTILS.LEGENDS.horizontalLegend = function(){
	var maxWidth = AD.CONSTANTS.DEFAULTWIDTH();
	var items = [];
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentLegendData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	
	var itemMouseover = function(){};
	var itemMouseout = function(){};
	var itemClick = function(){};
	var scale = 5;

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
	
	legend.itemMouseover = function(value){
		if(!arguments.length) return itemMouseover;
		itemMouseover = value;
		return legend;
	};
	legend.itemMouseout = function(value){
		if(!arguments.length) return itemMouseout;
		itemMouseout = value;
		return legend;
	};
	legend.itemClick = function(value){
		if(!arguments.length) return itemClick;
		itemClick = value;
		return legend;
	};
	
	
	
	legend.update = function(legendData){
		if(!selection)
			return console.warn('legend was not given a selection');

		if(legendData)
			currentLegendData = legendData;
		
		computedHeight = 0;
		computedWidth = 0;
		
		if(currentLegendData.data.items.length > 0){
			
			var item = selection.selectAll('g.ad-legend-item').data(currentLegendData.data.items, function(d){return d.label;});
			
			var newItem = item.enter()
				.append('g')
					.attr('class','ad-legend-item')
					.style('opacity',0)
					.on('mouseover',itemMouseover)
					.on('mouseout',itemMouseout);
				
			newItem.append('circle')
					.attr('fill',function(d){return d.color || color(d.label);});
					
			newItem.append('text')
					.text(function(d){return d.label;})
		
			var circle = item.select('circle')
					.attr('r',scale)
					.attr('y',scale/2);
			var text = item.select('text')
					.style('font-size',scale*2.5+'px')
					.attr('x',scale*2)
					.attr('y',scale);
		
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
		
			item.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();	
					
			computedHeight = yCurrent;
			computedWidth = (item[0].length >= itemsPerRow)? maxItemLength * itemsPerRow : maxItemLength * item[0].length;
					
		}
		return legend;
	};

	return legend;
};
