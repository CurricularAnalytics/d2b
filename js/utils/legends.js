/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*LEGEND UTILITIES*/
d2b.createNameSpace("d2b.UTILS.LEGENDS");
d2b.UTILS.LEGENDS.legend = function(){

	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.maxHeight = d2b.CONSTANTS.DEFAULTHEIGHT();
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	$$.currentLegendData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.orientation = 'horizontal';
	$$.padding = 5;
	$$.active = false;

	$$.scale = 5;

	//init event object
	$$.events = d2b.UTILS.chartEvents();

	var itemEnter = function(){

				$$.computedHeight = 0;
				$$.computedWidth = 0;

				$$.innerMaxHeight = $$.maxHeight - $$.padding*2;
				$$.innerMaxWidth = $$.maxWidth - $$.padding*2;


				$$.selection.item = $$.selection.selectAll('g.d2b-legend-item')
						.data($$.currentLegendData.items, function(d){return d.label;});

				var newItem = $$.selection.item.enter()
					.append('g')
						.attr('class','d2b-legend-item')
						.style('opacity',0)
						.on('mouseover.d2b-mouseover',function(d,i){
							d.hovered = true;
							var elem = d3.select(this);
							if($$.active){
								if(d.open){
									elem.select('circle.d2b-legend-circle-foreground')
										.transition()
											.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
											.style('fill-opacity', 0.4);
								}else{
									elem.select('circle.d2b-legend-circle-background')
										.transition()
											.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
											.attr('r',$$.scale*1.5);
								}
							}
						})
						.on('mouseout.d2b-mouseout',function(d,i){
							d.hovered = false;
							var elem = d3.select(this);

							elem.select('circle.d2b-legend-circle-foreground')
								.transition()
									.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
									.style('fill-opacity', function(d){
										if(d.open)
											return 0;
										else
											return 0.8;
									});
							elem.select('circle.d2b-legend-circle-background')
								.transition()
									.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
									.attr('r',$$.scale);
						})
						.call($$.events.addElementDispatcher, 'main', 'd2b-legend-item');

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-background')
					.style('stroke', d2b.UTILS.getColor($$.color, 'label'));

				newItem.append('circle')
					.attr('class', 'd2b-legend-circle-foreground')
					.style('fill', d2b.UTILS.getColor($$.color, 'label'));

				newItem.append('text')
						.text(function(d){return d.label;});

	};

	var updateElements = function(){

				var circleBackground = $$.selection.item.select('circle.d2b-legend-circle-background');

				circleBackground
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
						.style('stroke', d2b.UTILS.getColor($$.color, 'label'))
						.style('stroke-width', $$.scale/4)
						.attr('y',$$.scale/2)
						.attr('r',function(d){
							if(d.open)
								return $$.scale;
							else
								return (d.hovered)?$$.scale*1.5:$$.scale;
						});

				var circleForeground = $$.selection.item.select('circle.d2b-legend-circle-foreground');

				circleForeground
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
						.attr('r',$$.scale)
						.attr('y',$$.scale/2)
						.style('fill', d2b.UTILS.getColor($$.color, 'label'))
						.style('fill-opacity', function(d){
							if(d.open)
								return (d.hovered)?0.4:0;
							else
								return 0.8;
						})
						.attr('r',function(d){
							if(d.open)
								return $$.scale * 0.5;
							else
								return $$.scale;
						});

				$$.selection.item.classed('d2b-active', ($$.active)? true:false)

				$$.selection.item.text = $$.selection.item.select('text')
						.style('font-size',$$.scale*2.5+'px')
						.attr('x',$$.scale*2)
						.attr('y',$$.scale);

	};

	var updatePositions = function(){

		var xCurrent = $$.scale + $$.padding;
		var yCurrent = $$.scale + $$.padding;
		var maxItemLength = 0;
		var maxY = 0;

		if($$.currentLegendData.items.length > 0){

			if($$.orientation == 'vertical'){

				$$.selection.item
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							var position = 'translate('+xCurrent+','+yCurrent+')';

							if(yCurrent > maxY)
								maxY = yCurrent

							yCurrent += $$.scale*4;
							maxItemLength = Math.max(maxItemLength,d3.select(this).select('text').node().getComputedTextLength());
							if(yCurrent + $$.scale > $$.innerMaxHeight){
								yCurrent = $$.scale + $$.padding;
								xCurrent += maxItemLength + $$.scale * 6;
								maxItemLength = 0;
							}
							return position;
						});

				$$.computedWidth = xCurrent + maxItemLength + $$.scale*2 + $$.padding;
				$$.computedHeight = maxY + $$.scale + $$.padding;

			}else{

			  var maxItemLength = 0;
				$$.selection.item.text.each(function(d){
					var length = this.getComputedTextLength();
					if(length > maxItemLength)
						maxItemLength = length;
				})
				maxItemLength += $$.scale*6;
				var itemsPerRow = Math.floor(($$.innerMaxWidth+3*$$.scale)/maxItemLength);

				$$.selection.item
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform',function(d,i){
							if(i%itemsPerRow == 0 && i > 0){
								xCurrent = $$.scale + $$.padding;
								yCurrent += $$.scale*4
							}
							var position = 'translate('+xCurrent+','+yCurrent+')';
							xCurrent += maxItemLength;
							return position;
						});

				$$.computedHeight = yCurrent + $$.scale + $$.padding;
				$$.computedWidth = ($$.selection.item.size() > itemsPerRow)?
															maxItemLength * itemsPerRow - 3*$$.scale + $$.padding*2
															:
															maxItemLength * $$.selection.item.size() - 3*$$.scale + $$.padding*2;

			}

		}
	};

	var itemExit = function(){
		$$.selection.item.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	var legend = {};

	legend.select = 							d2b.UTILS.CHARTS.MEMBERS.select(legend, $$, function(){ $$.generateRequired = true; });
	legend.selection = 						d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'selection', function(){ $$.generateRequired = true; });
	legend.width = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'width');
	legend.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'height');
	legend.animationDuration = 		d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'animationDuration');
	legend.legendOrientation = 		d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'legendOrientation');
	legend.on = 									d2b.UTILS.CHARTS.MEMBERS.events(legend, $$);
	legend.color = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'color');
	legend.padding = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'padding');
	legend.scale = 								d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'scale');
	legend.orientation = 					d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'orientation');
	legend.active = 							d2b.UTILS.CHARTS.MEMBERS.prop(legend, $$, 'active');
	legend.computedHeight = function(){
		return $$.computedHeight;
	}
	legend.computedWidth = function(){
		return $$.computedWidth;
	}
	legend.data = function(legendData, reset){
		if(!arguments.length) return $$.currentLegendData;
		$$.currentLegendData = legendData.data;
		return legend;
	}

	legend.update = function(callback){
		if(!$$.selection)
			return console.warn('legend was not given a selection');

		itemEnter();
		updateElements();
		updatePositions();
		itemExit();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return legend;
	};

	return legend;
};
