/*CONTROLS UTILITIES*/
AD.createNameSpace("AD.UTILS.CONTROLS");
AD.UTILS.CONTROLS.checkbox = function(){
	var scale = 5;
	var selection;
	var computedWidth=0, computedHeight=0;
	var currentCheckboxData = {label:'',state:false};
	
	var checkbox = {};
	
	var onChange = function(){};
	
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
	checkbox.onChange = function(value){
		if(!arguments.length) return onChange;
		onChange = value;
		return checkbox;
	}
	
	checkbox.update = function(checkboxData){
		
		if(!selection)
			return console.warn('checkbox was not given a selection');
		if(checkboxData)
			currentCheckboxData = checkboxData;
		if(!currentCheckboxData)
			return console.warn('checkboxData is null');
		
		var checkboxContainer = selection.selectAll('g.ad-checkbox-container').data([currentCheckboxData]);
		var newCheckboxContainer = checkboxContainer.enter()
			.append('g')
				.attr('class','ad-checkbox-container')
				.on('click',function(d,i){
					currentCheckboxData.state = !currentCheckboxData.state;
					onChange(d,i);
					checkbox.update();
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
	
	var onControlChange = function(){};
	
	var scale = 5;

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
	
	controls.onControlChange = function(value){
		if(!arguments.length) return onControlChange;
		onControlChange = value;
		return controls;
	};
	
	controls.update = function(controlsData){
		if(!selection)
			return console.warn('controls was not given a selection');

		if(controlsData)
			currentControlsData = controlsData;
		
		var xPadding = 3*scale;
		var yPadding = scale;
		computedHeight = 0;
		computedWidth = 0;
		
		if(currentControlsData.length > 0){
			var controls = selection.selectAll('g.ad-control').data(currentControlsData,function(d){return d.label+','+d.type;});
			
			controls.enter()
				.append('g')
					// .style('opacity',0)
					.attr('class','ad-control')
					.each(function(d){
						d.control = new AD.UTILS.CONTROLS[d.type]();
						d.control.selection(d3.select(this));
						d.control.onChange(onControlChange);
					});
				

			
			var maxControlHeight = 0;
			controls.each(function(d){
				
				d.control.scale(scale).update(d.data);
				
				if((computedWidth + d.control.computedWidth()) > maxWidth){
					computedWidth = 0;
					computedHeight += maxControlHeight + yPadding;
					maxControlHeight = 0;
				}
				
				d3.select(this)
					// .transition()
					// 	.duration(animationDuration)
						.style('opacity',1)
						.attr('transform','translate('+computedWidth+','+computedHeight+')');
				computedWidth += d.control.computedWidth() + xPadding;	
						
				if(maxControlHeight < d.control.computedHeight()){
					maxControlHeight = d.control.computedHeight();
				}
			});

			computedWidth -= xPadding;

				
			computedHeight += maxControlHeight;
			controls.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();
		}
		return controls;
	};

	return controls;
};
