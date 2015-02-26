/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.UTILS.breadcrumbs = function(){
	var maxWidth = AD.CONSTANTS.DEFAULTWIDTH();
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentBreadcrumbsData = {items:[]};
	var computedWidth=0, computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	var breadcrumbs = {};

	breadcrumbs.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return breadcrumbs;
	};
	breadcrumbs.computedHeight = function(){
		return computedHeight;
	};
	breadcrumbs.computedWidth = function(){
		return computedWidth;
	};
	breadcrumbs.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return breadcrumbs;
	};
	breadcrumbs.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return breadcrumbs;
	};
	breadcrumbs.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return breadcrumbs;
	};

	breadcrumbs.on = function(key, value){
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

		return breadcrumbs;
	};

	breadcrumbs.data = function(breadcrumbsData, reset){
		if(!arguments.length) return currentBreadcrumbsData;
		currentBreadcrumbsData = breadcrumbsData.data;
		return breadcrumbs;
	}

	breadcrumbs.update = function(callback){
		if(!selection)
			return console.warn('breadcrumbs was not given a selection');

		if(callback){
			callback;
		}

		selection.breadcrumb = selection.selectAll('g.ad-breadcrumb').data(currentBreadcrumbsData.items, function(d){return (d.key)? d.key : i;});

		var newBreadcrumbs = selection.breadcrumb.enter()
			.append('g')
				.attr('class','ad-breadcrumb')
				.style('opacity',0);

		newBreadcrumbs.append('path');
		newBreadcrumbs.append('text');

		var breadcrumbIndentSize = scale;
		var padding = scale;
		var breadcrumbHeight = scale * 4;
		selection.breadcrumb.text = selection.breadcrumb.select('text')
				.text(function(d){return d.label;})
				.attr('x',padding+breadcrumbIndentSize)
				.attr('y',scale*2.9)
				.style('font-size',scale*2.5+'px');
		selection.breadcrumb.path = selection.breadcrumb.select('path');

		var bcOffset = 0;
		selection.breadcrumb.each(function(d,i){
			var bc = d3.select(this);
			bc.text = bc.select('text');
			bc.path = bc.select('path')
			var pathWidth = bc.text.node().getComputedTextLength() + padding*2 + breadcrumbIndentSize;

			var leftIndent = breadcrumbIndentSize
			var rightIndent = breadcrumbIndentSize;


			if(i==0){
				leftIndent = 0;
			}
			if(i==selection.breadcrumb.size()-1){
				rightIndent = 0;
			}

			bc.path
				.transition()
					.duration(animationDuration/2)
					.attr('d','M 0 0 L '+(leftIndent)+' '+breadcrumbHeight/2+' L 0 '+breadcrumbHeight+' L '+pathWidth+' '+breadcrumbHeight+' L '+(pathWidth+rightIndent)+' '+breadcrumbHeight/2+' L '+pathWidth+' 0 L 0 0 Z');


			bc
				.transition()
					.duration(animationDuration/2)
					.style('opacity',1)
					.attr('transform','translate('+(bcOffset)+',0)');

			bcOffset+=breadcrumbIndentSize + pathWidth;



		});

		computedHeight = breadcrumbHeight;

		selection.breadcrumb.exit()
			.transition()
				.duration(animationDuration/4)
				.style('opacity',0)
				.remove();

		return breadcrumbs;
	};

	return breadcrumbs;
};
