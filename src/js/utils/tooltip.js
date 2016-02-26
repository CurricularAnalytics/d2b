/*tooltip utilities*/
d2b.UTILS.bindTooltip = function(element, html, data, fill){
	if(html){
		element
			.on('mouseover.d2b-mouseover-tooltip', function(d,i){
				var nodeData = (typeof data === "function")? data.apply(this, arguments) : (data || d);
				var nodeHtml = (typeof html === "function")? html.apply(this, [nodeData, i]) : html;
				var nodeFill = (typeof fill === "function")? fill.apply(this, arguments) : fill;
				d2b.UTILS.createTooltip(d3.select(this), nodeHtml, nodeFill);
			})
			.on('mouseout.d2b-mouseout-tooltip', function(d,i){
				d2b.UTILS.removeTooltip();
			});
	}else{
		d2b.UTILS.unbindTooltip();
	}
};

d2b.UTILS.unbindTooltip = function(elem){
	d2b.UTILS.removeTooltip();
	elem
		.on('mouseover.d2b-mouseover-tooltip', null)
		.on('mouseout.d2b-mouseout-tooltip', null)
		.on('mousemove.d2b-mousemove-tooltip', null);
};
d2b.UTILS.createTooltip = function(elem, html, fill){
	fill = fill || '#555'
	d3.selectAll('.d2b-general-tooltip')
		.remove();

	var body = d3.select('body');
	var tooltip = body.append('div')
			.attr('class','d2b-general-tooltip')
			.html(html)
			.style('color', function(d){
				return (d3.hsl(fill).l > 0.75)? 'black' : 'white';
			})
			.style('background', fill)
			.style('border-color', d3.rgb(fill).darker(1))
			.style('opacity',0);

	tooltip
		.transition()
			.duration(50)
			.style('opacity',1);

	tooltip.call(d2b.UTILS.moveTooltip);

	elem.on('mousemove.d2b-mousemove-tooltip',function(){
		tooltip
			.transition()
				.duration(50)
				.ease('linear')
				.call(d2b.UTILS.moveTooltip);
	});
	return tooltip;
};

d2b.UTILS.removeTooltip = function(){
	d3.selectAll('.d2b-general-tooltip')
		.remove();
};

//move the tooltip to be next to the cursor
d2b.UTILS.moveTooltip = function(tooltip){
	var body = d3.select('body');
	var offsetX = 15;
	var scroll = d2b.UTILS.scrollOffset();
	var bodyWidth = body.node().getBoundingClientRect().width;

	var positionRight = (scroll.left+d3.event.clientX < bodyWidth/2);
	var tooltipBox = tooltip.node().getBoundingClientRect();

	var x = positionRight?
								scroll.left+d3.event.clientX+offsetX :
								scroll.left+d3.event.clientX-tooltipBox.width-offsetX;

	var y = scroll.top + d3.event.clientY - tooltipBox.height/2

	tooltip.each(function(d){
		elem = d3.select(this);
		elemUpdate = d3.transition(elem);

		elem
			.classed('d2b-general-tooltip-left', !positionRight)
			.classed('d2b-general-tooltip-right', positionRight);

		elemUpdate
			.style('opacity',1)
			.style('top',y+'px')
			.style('left',x+'px');
	});

	d3.timer.flush();
};
