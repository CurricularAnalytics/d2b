/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*CONTROLS UTILITIES*/
d2b.createNameSpace("d2b.UTILS.CONTROLS");
d2b.UTILS.CONTROLS.checkbox = function(){

	var $$ = {};

	$$.scale = 5;
	$$.selection;
	$$.container;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',state:false};

	//init event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	$$.on.change = function(){};

	var control = {};

	// var onChange = function(){};

	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);

	control.checked = function(value){
		if(!arguments.length) return $$.currentData.state;
		$$.currentData.state = value;
		return control.update();
	};
	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;
		return control;
	}

	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('checkbox was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('checkbox data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var checkboxContainer = $$.selection.selectAll('g.d2b-checkbox-container').data([$$.currentData]);
		var newCheckboxContainer = checkboxContainer.enter()
			.append('g')
				.attr('class','d2b-checkbox-container')
				.on('click.d2b-click',function(d,i){
					$$.currentData.state = !$$.currentData.state;
					for(key in $$.on.change){
						$$.on.change[key].call(this,d,i,'checkbox');
					}
					control.update();
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'checkbox');

		newCheckboxContainer
			.append('rect')
				.attr('rx',1);
		newCheckboxContainer
			.append('path');

		newCheckboxContainer
			.append('text')
				.text(function(d){return d.label;});

		var checkboxTranslate = 'translate('+0.4*$$.scale+','+0.4*$$.scale+')';
		var check = checkboxContainer.select('path')
				.attr('transform',checkboxTranslate)
				.attr('d',"M"+(0.38)*$$.scale+","+1.06*$$.scale+" l"+0.7*$$.scale+","+0.5*$$.scale+" l"+0.58*$$.scale+","+(-1.19)*$$.scale+"")
				.style('stroke-width',0.25*$$.scale)
				.attr('stroke-dasharray',2.2*$$.scale)
		check
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.attr('stroke-dashoffset',($$.currentData.state)? 0 : 2.2*$$.scale);
		var box = checkboxContainer.select('rect')
				.attr('width',$$.scale*2.1+'px')
				.attr('height',$$.scale*2.1+'px')
				.attr('transform',checkboxTranslate)
				.style('stroke-width',0.25*$$.scale);

		var label = checkboxContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = label.node().getComputedTextLength();

		var padding = $$.scale;
		labelLength += padding;

		$$.computedWidth = labelLength + $$.scale*2.5;
		$$.computedHeight = $$.scale*2.9;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

d2b.UTILS.CONTROLS.radioButtons = function(){
	var $$ = {};

	$$.scale = 5;
	$$.container;
	$$.selection;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.currentData = {label:'',values:[], selected:null};

	//init event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	$$.on.change = function(){};

	$$.resetValues = function(){
		$$.currentData.values.forEach(function(d){
			d.selected = false;
		});
	};

	var control = {};


	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
	control.container = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'container');
	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);

	control.computedHeight = function(){
		return $$.computedHeight;
	};
	control.computedWidth = function(){
		return $$.computedWidth;
	};

	control.data = function(data, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = data;

		var foundSelected = false;
		$$.currentData.values.forEach(function(d){
			if(foundSelected)
				d.selected = false;

			if(d.selected){
				$$.currentData.selected = d;
				foundSelected = true;
			}
		});

		if(!foundSelected){
			$$.currentData.selected = $$.currentData.values[0];
			$$.currentData.values[0].selected = true;
		}

		return control;
	}


	control.update = function(callback){

		if(!$$.selection && !$$.container){
			console.warn('radio buttons was not given a selection or html container');
			return control;
		}

		if(!$$.currentData){
			console.warn('radio buttons data is null');
			return control;
		}

		if(!$$.selection){
			$$.selection = $$.container.append('svg');
			$$.container.svg = $$.selection;
		}

		var radioButtonContainer = $$.selection.selectAll('g.d2b-radio-button-container').data($$.currentData.values, function(d){return d.label;});

		var newRadioButtonContainer = radioButtonContainer.enter()
			.append('g')
				.attr('class','d2b-radio-button-container')
				.on('click.d2b-click',function(d,i){
					$$.resetValues();
					d.selected = true;
					$$.currentData.selected = d;
					for(key in $$.on.change){
						$$.on.change[key].call($$.selection.node(),$$.currentData,i,'radio-buttons');
					}
					control.update();
				})
				.call(d2b.UTILS.bindElementEvents, $$, 'radio-button');

		radioButtonContainer
			.attr('transform',function(d,i){
				return 'translate('+0+','+(i*3.3*$$.scale)+')'
			});

		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-inner')
			.style('fill-opacity',0);
		newRadioButtonContainer.append('circle')
			.attr('class','d2b-radio-button-outer');

		newRadioButtonContainer.append('text')
			.text(function(d){return d.label;});

		var circleInner = radioButtonContainer.select('circle.d2b-radio-button-inner')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4);


		var circleOuter = radioButtonContainer.select('circle.d2b-radio-button-outer')
				.attr('r',$$.scale*1+'px')
				.attr('cy',$$.scale*1.4)
				.attr('cx',$$.scale*1.4)
				.style('stroke-width',0.25*$$.scale);


		circleInner
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				.style('fill-opacity',function(d){return (d.selected)? 1: 0;})
				.attr('r',function(d){return (d.selected)? $$.scale*0.5: 0;});

		var label = radioButtonContainer.select('text')
				.attr('y',$$.scale*2.4)
				.attr('x',$$.scale*3.2)
				.style('font-size',$$.scale*2.5+'px');

		var labelLength = 0;
		label.each(function(){
			labelLength = Math.max(labelLength, this.getComputedTextLength());
		});

		$$.computedWidth = labelLength + $$.scale*3.4;
		$$.computedHeight = $$.currentData.values.length*$$.scale*3.2;

		if($$.container){
			if($$.container.svg){
				$$.container.svg
					.attr('width',$$.computedWidth)
					.attr('height',$$.computedHeight);
			}
		}

		if(callback)
			callback();

		return control;
	};

	return control;

};

// d2b.UTILS.CONTROLS.select = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };


//allow imbeded html for selector control
// d2b.UTILS.CONTROLS.selector = function(){
// 	var $$ = {};
//
// 	$$.scale = 5;
// 	$$.selection;
// 	$$.computedWidth=0;
// 	$$.computedHeight=0;
// 	$$.currentData = {label:'',values:[], selected:null};
//
// 	$$.maxWidth = 180;
//
// 	$$.expanded = false;
//
// 	//init event object
// 	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
// 	$$.on.change = function(){};
//
// 	$$.resetValues = function(){
// 		$$.currentData.values.forEach(function(d){
// 			d.selected = false;
// 		});
// 	};
//
// 	var control = {};
//
// 	control.scale = 		d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'scale');
// 	control.select = 		d2b.UTILS.CHARTS.MEMBERS.select(control, $$);
// 	control.selection = d2b.UTILS.CHARTS.MEMBERS.prop(control, $$, 'selection');
// 	control.on =				d2b.UTILS.CHARTS.MEMBERS.on(control, $$);
//
// 	control.computedHeight = function(){
// 		return $$.computedHeight;
// 	};
// 	control.computedWidth = function(){
// 		return $$.computedWidth;
// 	};
//
// 	control.data = function(data, reset){
// 		if(!arguments.length) return $$.currentData;
// 		$$.currentData = data;
//
// 		var foundSelected = false;
// 		$$.currentData.values.forEach(function(d){
// 			if(foundSelected)
// 				d.selected = false;
//
// 			if(d.selected){
// 				$$.currentData.selected = d;
// 				foundSelected = true;
// 			}
// 		});
//
// 		if(!foundSelected){
// 			$$.currentData.selected = $$.currentData.values[0];
// 			$$.currentData.values[0].selected = true;
// 		}
//
// 		return control;
// 	}
//
//
// 	control.update = function(callback){
//
// 		if(!$$.selection)
// 			return console.warn('selector was not given a $$.selection');
//
// 		if(!$$.currentData)
// 			return console.warn('selector data is null');
//
// 		var selectedContainer = $$.selection.selectAll('g.d2b-selector-selected').data($$.currentData.values.filter(function(d){return d.selected;}));
//
// 		var newSelectedContainer = selectedContainer.enter()
// 			.append('g')
// 				.attr('class','d2b-selector-selected');
//
// 		newSelectedContainer
// 			.append('rect')
// 				.attr('rx',1)
// 				.attr('class','d2b-selector-border');
//
// 		var newSelectedSubContainer = newSelectedContainer
// 			.append('g');
//
// 	  newSelectedSubContainer
// 			.append('text');
//
// 		newSelectedContainer
// 			.append('path')
// 				.attr('class','d2b-selector-triangle');
//
// 		selectedContainer
// 			.attr('transform','translate('+0.4*$$.scale+','+0.4*$$.scale+')')
//
// 		selectedContainer.select('rect')
// 			.attr('stroke-width',0.4*$$.scale)
// 			.attr('width', $$.maxWidth - 0.8*$$.scale)
// 			.attr('height', 4*$$.scale)
//
// 		selectedContainer.select('text')
// 				.text(function(d){return d.label});
//
// 		selectedContainer.select('path')
// 				.attr('d','M 0 0 L '+$$.scale*1.8+' 0 L '+$$.scale*0.9+' '+$$.scale*1+' L 0 0 Z');
//
// 		$$.computedWidth = 200;
// 		$$.computedHeight = 200;
//
// 		if(callback)
// 			callback();
//
// 		return control;
// 	};
//
// 	return control;
//
// };

d2b.UTILS.CONTROLS.htmlControls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.controlsHash = {};

	$$.selection;
	$$.scale = 5;

	$$.makeControlsHash = function(){
		$$.controlsHash = {};
		$$.currentData.controls.forEach(function(d){
			$$.controlsHash[d.key] = d;
		});
	};

	//init event object
	$$.on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		change:function(){}
	};

	var controls = {};

	controls.select = d2b.UTILS.CHARTS.MEMBERS.select(controls, $$);
	controls.width = function(value){
		if(!arguments.length) return $$.maxWidth;
		$$.maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return $$.computedHeight;
	};
	controls.computedWidth = function(){
		return $$.computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return $$.scale;
		$$.scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
		return controls;
	};

	controls.on =				d2b.UTILS.CHARTS.MEMBERS.on(controls, $$);

	controls.data = function(controlsData, reset){
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		$$.makeControlsHash();
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a selection');
		// console.log($$.currentData.controls)
		$$.selection.controlContainer = $$.selection.selectAll('div.d2b-control-container').data($$.currentData.controls, function(d){return d.type+'-'+d.key;});

		var newControl = $$.selection.controlContainer.enter()
			.append('div')
				.attr('class', 'd2b-control-container')

		newControl
			.append('div')
				.attr('class', 'd2b-control-label')
				.text(function(d){return d.label+':';});

		newControl
			.append('div')
				.attr('class', 'd2b-control')
				.each(function(d){
					this.control = new d2b.UTILS.CONTROLS[d.type]();
					this.control.container(d3.select(this));
				});

		$$.selection.controlContainer.control = $$.selection.controlContainer.select('.d2b-control')
			.each(function(d){
				this.control
					.scale($$.scale)
					.data(d)
					.on('change.d2b-change',function(d,i){
						for(key in $$.on.change){
							$$.on.change[key].call(this,$$.controlsHash,d,i);
						}
					})
					.update();
			});


		$$.selection.controlContainer.exit()
			// .transition()
			// 	.duration($$.animationDuration)
			// 	.style('opacity',0)
				.remove();


		if(callback){
			callback;
		}

		return controls;
	};

	return controls;
};


d2b.UTILS.CONTROLS.controls = function(){
	var $$ = {};

	$$.maxWidth = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.currentData;
	$$.computedWidth=0;
	$$.computedHeight=0;
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;

	$$.selection;
	$$.scale = 5;

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){},
		change:function(){}
	};

	var controls = {};

	controls.width = function(value){
		if(!arguments.length) return $$.maxWidth;
		$$.maxWidth = value;
		return controls;
	};
	controls.computedHeight = function(){
		return $$.computedHeight;
	};
	controls.computedWidth = function(){
		return $$.computedWidth;
	};
	controls.selection = function(value){
		if(!arguments.length) return $$.selection;
		$$.selection = value;
		return controls;
	};
	controls.scale = function(value){
		if(!arguments.length) return $$.scale;
		$$.scale = value;
		return controls;
	};
	controls.animationDuration = function(value){
		if(!arguments.length) return $$.animationDuration;
		$$.animationDuration = value;
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
		if(!arguments.length) return $$.currentData;
		$$.currentData = controlsData;
		return controls;
	}

	controls.update = function(callback){
		if(!$$.selection)
			return console.warn('controls was not given a $$.selection');

		var xPadding = 3*$$.scale;
		var yPadding = $$.scale;
		$$.computedHeight = 0;
		$$.computedWidth = 0;

		if($$.currentData.length > 0){
			var controls = $$.selection.selectAll('g.d2b-control').data($$.currentData,function(d){return d.label+','+d.type;});

			controls.enter()
				.append('g')
					.attr('class','d2b-control')
					.each(function(d){
						d.control = new d2b.UTILS.CONTROLS[d.type]();
						d.control.selection(d3.select(this))
							.on('elementClick.d2b-click',function(d,i){
								for(key in on.elementClick){
									on.elementClick[key].call(this,d,i);
								}
							})
							.on('change.d2b-change',function(d,i){
								for(key in on.change){
									on.change[key].call(this,d,i);
								}
							})
							.on('elementMouseover.d2b-mouseover',function(d,i){
								for(key in on.elementMouseover){
									on.elementMouseover[key].call(this,d,i);
								}
							})
							.on('elementMouseout.d2b-mouseout',function(d,i){
								for(key in on.elementMouseout){
									on.elementMouseout[key].call(this,d,i);
								}
							});
					});



			var maxControlHeight = 0;
			var maxControlRowWidth = 0;
			controls.each(function(d){

				d.control.scale($$.scale).data(d.data).update();

				if(($$.computedWidth + d.control.computedWidth()) > $$.maxWidth){
					$$.computedWidth = 0;
					$$.computedHeight += maxControlHeight + yPadding;
					maxControlHeight = 0;
				}

				d3.select(this)
					.transition()
						.duration($$.animationDuration)
						.style('opacity',1)
						.attr('transform','translate('+$$.computedWidth+','+$$.computedHeight+')');
				$$.computedWidth += d.control.computedWidth() + xPadding;

				if(maxControlHeight < d.control.computedHeight()){
					maxControlHeight = d.control.computedHeight();
				}
				if(maxControlRowWidth < $$.computedWidth){
					maxControlRowWidth = $$.computedWidth;
				}
			});

			$$.computedWidth = maxControlRowWidth - xPadding;

			$$.computedHeight += maxControlHeight;
			controls.exit()
				.transition()
					.duration($$.animationDuration)
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
