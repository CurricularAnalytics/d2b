/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*CONTROLS UTILITIES*/
AD.createNameSpace("AD.UTILS.CONTROLS");
AD.UTILS.CONTROLS.checkbox = function(){
	var scale = 5;
	var selection;
	var computedWidth=0, computedHeight=0;
	var currentCheckboxData = {label:'',state:false};

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		elementChange:function(){}
	};

	var checkbox = {};

	// var onChange = function(){};

	checkbox.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return checkbox;
	};
	checkbox.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return checkbox;
	};
	checkbox.checked = function(value){
		if(!arguments.length) return currentCheckboxData.state;
		currentCheckboxData.state = value;
		return checkbox.update();
	};
	checkbox.computedHeight = function(){
		return computedHeight;
	};
	checkbox.computedWidth = function(){
		return computedWidth;
	};

	checkbox.on = function(key, value){
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

		return checkbox;
	};

	checkbox.data = function(checkboxData, reset){
		if(!arguments.length) return currentCheckboxData;
		currentCheckboxData = checkboxData;
		return checkbox;
	}


	checkbox.update = function(callback){

		if(!selection)
			return console.warn('checkbox was not given a selection');

		if(!currentCheckboxData)
			return console.warn('checkboxData is null');

		var checkboxContainer = selection.selectAll('g.ad-checkbox-container').data([currentCheckboxData]);
		var newCheckboxContainer = checkboxContainer.enter()
			.append('g')
				.attr('class','ad-checkbox-container')
				.on('click.ad-click',function(d,i){
					currentCheckboxData.state = !currentCheckboxData.state;
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i,'checkbox');
					}
					for(key in on.elementChange){
						on.elementChange[key].call(this,d,i,'checkbox');
					}
					checkbox.update();
				})
				.on('mouseover.ad-mouseover',function(d,i){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i);
					}
				})
				.on('mouseout.ad-mouseout',function(d,i){
					for(key in on.elementMouseout){
						on.elementMouseout[key].call(this,d,i);
					}
				});
		newCheckboxContainer
			.append('rect')
				.attr('rx',1);
		newCheckboxContainer
			.append('path');

		newCheckboxContainer
			.append('text')
				.text(function(d){return d.label;});

		var label = checkboxContainer.select('text')
				.attr('y',scale*2.1)
				.style('font-size',scale*2.5+'px');

		var labelLength = label.node().getComputedTextLength();

		var padding = scale;
		labelLength += padding;

		var checkboxTranslate = 'translate('+labelLength+',0)';
		var check = checkboxContainer.select('path')
				.attr('transform',checkboxTranslate)
				.attr('d',"M"+(0.38)*scale+","+1.06*scale+" l"+0.7*scale+","+0.5*scale+" l"+0.58*scale+","+(-1.19)*scale+"")
				.style('stroke-width',0.4*scale)
				.attr('stroke-dasharray',2.2*scale)
		check
			.transition()
				.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
				.attr('stroke-dashoffset',(currentCheckboxData.state)? 0 : 2.2*scale);
		var box = checkboxContainer.select('rect')
				.attr('width',scale*2.1+'px')
				.attr('height',scale*2.1+'px')
				.attr('transform',checkboxTranslate)
				.style('stroke-width',0.4*scale);

		computedWidth = labelLength + scale*2.1;
		computedHeight = scale*2.5;

		if(callback)
			callback();

		return checkbox;
	};

	return checkbox;

}
AD.UTILS.CONTROLS.horizontalControls = function(){
	var maxWidth = AD.CONSTANTS.DEFAULTWIDTH();
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	var selection;
	var currentControlsData;
	var computedWidth=0, computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;

	var scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		elementChange:function(){}
	};

	var controls = {};

	controls.width = function(value){
		if(!arguments.length) return maxWidth;
		maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return computedHeight;
	};
	controls.computedWidth = function(){
		return computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return scale;
		scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return controls;
	};

	controls.on = function(key, value){
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

		return controls;
	};

	controls.data = function(controlsData, reset){
		if(!arguments.length) return currentControlsData;
		currentControlsData = controlsData;
		return controls;
	}

	controls.update = function(callback){
		if(!selection)
			return console.warn('controls was not given a selection');

		var xPadding = 3*scale;
		var yPadding = scale;
		computedHeight = 0;
		computedWidth = 0;

		if(currentControlsData.length > 0){
			var controls = selection.selectAll('g.ad-control').data(currentControlsData,function(d){return d.label+','+d.type;});

			controls.enter()
				.append('g')
					.attr('class','ad-control')
					.each(function(d){
						d.control = new AD.UTILS.CONTROLS[d.type]();
						d.control.selection(d3.select(this))
							.on('elementClick.ad-click',function(d,i){
								for(key in on.elementClick){
									on.elementClick[key].call(this,d,i);
								}
							})
							.on('elementChange',function(d,i){
								for(key in on.elementChange){
									on.elementChange[key].call(this,d,i);
								}
							})
							.on('elementMouseover.ad-mouseover',function(d,i){
								for(key in on.elementMouseover){
									on.elementMouseover[key].call(this,d,i);
								}
							})
							.on('elementMouseout.ad-mouseout',function(d,i){
								for(key in on.elementMouseout){
									on.elementMouseout[key].call(this,d,i);
								}
							});
					});



			var maxControlHeight = 0;
			var maxControlRowWidth = 0;
			controls.each(function(d){

				d.control.scale(scale).data(d.data).update();

				if((computedWidth + d.control.computedWidth()) > maxWidth){
					computedWidth = 0;
					computedHeight += maxControlHeight + yPadding;
					maxControlHeight = 0;
				}

				d3.select(this)
					.transition()
						.duration(animationDuration)
						.style('opacity',1)
						.attr('transform','translate('+computedWidth+','+computedHeight+')');
				computedWidth += d.control.computedWidth() + xPadding;

				if(maxControlHeight < d.control.computedHeight()){
					maxControlHeight = d.control.computedHeight();
				}
				if(maxControlRowWidth < computedWidth){
					maxControlRowWidth = computedWidth;
				}
			});

			computedWidth = maxControlRowWidth - xPadding;

			computedHeight += maxControlHeight;
			controls.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();
		}

		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};
