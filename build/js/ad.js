/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

//create root namespace
var AD = AD || {};

//namespace method for adding new namespaces
AD.createNameSpace = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = AD;
 
    if (nsparts[0] === "AD") {
        nsparts = nsparts.slice(1);
    }
 
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        parent = parent[partname];
    }
    return parent;
};


/*AD charts*/
AD.createNameSpace("AD.CHARTS");

/*AD charts*/
AD.createNameSpace("AD.DASHBOARDS");

/*AD UTILITIES*/
AD.createNameSpace("AD.UTILS");
/*AD UTILITIES*/
AD.createNameSpace("AD.UTILS.CHARTPAGE");
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*AD constants*/
AD.createNameSpace("AD.CONSTANTS");

AD.CONSTANTS.DEFAULTPALETTE = {primary:"rgb(42,54,82)",secondary:"rgb(11,22,47)"}
AD.CONSTANTS.DEFAULTWIDTH = function(){ return 960; };
AD.CONSTANTS.DEFAULTHEIGHT = function(){ return 540; };
AD.CONSTANTS.DEFAULTMARGIN = function(){ return {left:0,right:0,top:0,bottom:0}; };
AD.CONSTANTS.DEFAULTFORCEDMARGIN = function(){ return {left:30, bottom:20, right:30, top:20}; };
AD.CONSTANTS.DEFAULTCOLOR = function(){ return d3.scale.category20c(); };

AD.CONSTANTS.ANIMATIONLENGTHS = function(){ return {normal:500,short:100,long:1000}; };

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new AD.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new AD.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);

	if(chartData.properties){
		for(key in chartData.properties){
			chartData.chart[key](chartData.properties[key]);
		}
	}
}

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.UTILS.CHARTPAGE.chartLayout = function(){
	var width = AD.CONSTANTS.DEFAULTWIDTH();
	var height = AD.CONSTANTS.DEFAULTHEIGHT();
	var selection;
	var currentChartLayoutData = {chartLayout:{}};
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var chart;
	var generateRequired = true;
	

	var chartLayout = {};

	chartLayout.chart = function(value){
		if(!arguments.length) return chart;
		chart = value;
		generateRequired = true;
		return chartLayout;
	};	
	chartLayout.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chartLayout;
	};
	chartLayout.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chartLayout;
	};
	chartLayout.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		generateRequired = true;
		return chartLayout;
	};
	chartLayout.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chartLayout;
	};
	
	chartLayout.data = function(chartLayoutData, reset){
		if(!arguments.length) return currentChartLayoutData;
		if(reset){
			currentChartLayoutData = {chartLayout:{}};
			generateRequired = true;
		}
		// currentChartLayoutData.chartLayout = chartLayoutData.data.chartLayout
		if(chartLayoutData.data.chartLayout.footnote)
			currentChartLayoutData.chartLayout.footnote = chartLayoutData.data.chartLayout.footnote;
		
		if(chartLayoutData.data.chartLayout.rightNotes)
			currentChartLayoutData.chartLayout.rightNotes = chartLayoutData.data.chartLayout.rightNotes;
		
		if(chartLayoutData.data.chartLayout.leftNotes)
			currentChartLayoutData.chartLayout.leftNotes = chartLayoutData.data.chartLayout.leftNotes;
		
		if(chartLayoutData.data.chartLayout.title)
			currentChartLayoutData.chartLayout.title = chartLayoutData.data.chartLayout.title;
		
		if(chartLayoutData.data.chartCallback)
			currentChartLayoutData.chartCallback = chartLayoutData.data.chartCallback;
		
		return chartLayout;
	};
	
	chartLayout.generate = function(callback){
		
		selection.selectAll('*').remove();

		selection.wrapper = selection
			.append('div')
				.attr('class','ad-chart-layout-wrapper');
		
		selection.container = selection.wrapper
			.append('div')
				.attr('class','ad-chart-layout ad-container');
		
		selection.container.title = selection.container
			.append('div')
				.attr('class','ad-chart-layout-title');

		selection.container.title.div = selection.container.title
			.append('div');
				
		selection.container.chart = selection.container
			.append('div')
				.attr('class','ad-chart-layout-chart');
				
		chart
			.selection(selection.container.chart)
			.update(currentChartLayoutData.chartCallback);			
				
		selection.container.rightNotes = selection.container
			.append('div')
				.attr('class','ad-chart-layout-right-notes');
				
		selection.container.rightNotes.ul = selection.container.rightNotes		
			.append('ul');
				
		selection.container.leftNotes = selection.container
			.append('div')
				.attr('class','ad-chart-layout-left-notes');
				
		selection.container.leftNotes.ul = selection.container.leftNotes		
			.append('ul');
			
		selection.container.footnote = selection.container
			.append('div')
				.attr('class','ad-chart-layout-footnote');
		selection.container.footnote.div = selection.container.footnote
			.append('div');
				
		selection.container.source = selection.container
			.append('div')
				.attr('class','ad-chart-layout-source')
			.append('ul');
				
		
		generateRequired = false;
		
		var tempAnimationDuration = animationDuration;
		chartLayout
			.animationDuration(0)
			.update(callback)
			.animationDuration(tempAnimationDuration);
		
		return chartLayout;
	};
	
	chartLayout.update = function(callback){
		if(!selection)
			return console.warn('chartLayout was not given a selection');
		if(!chart)
			return console.warn('chartLayout was not given a chart');

		if(generateRequired)
			chartLayout.generate(callback);
		var chartMargin = {
			top:10,bottom:0,left:0,right:0
		};
		
		selection.wrapper
				.style('width',width+'px')
				.style('height',height+'px')
		selection.container.title.div
				.text(currentChartLayoutData.chartLayout.title)
				.style('opacity','1');	
		if(currentChartLayoutData.chartLayout.title){
			chartMargin.top+=selection.container.title.node().getBoundingClientRect().height;
		}else{
			selection.container.title.div.style('opacity','0');
		}
		
		selection.container.footnote.div.text(currentChartLayoutData.chartLayout.footnote);
		
		chartMargin.bottom+=selection.container.footnote.node().getBoundingClientRect().height;
		selection.container.footnote
				.style('top',(height-chartMargin.bottom)+'px');
		
		if(!currentChartLayoutData.chartLayout.rightNotes || currentChartLayoutData.chartLayout.rightNotes.length < 1){
			currentChartLayoutData.chartLayout.rightNotes = [];
		}else{
			chartMargin.right+=width * 0.2+5;
		}		
		selection.container.rightNotes
				.style('width',width*0.2+'px')
				.style('height',(height-chartMargin.top-chartMargin.bottom)+'px')
				.style('left',width*0.8-5+'px');
		var rightNote = selection.container.rightNotes.ul.selectAll('li.ad-chart-layout-note').data(currentChartLayoutData.chartLayout.rightNotes);
		rightNote.enter()
			.append('li')
				.attr('class','ad-chart-layout-note');
		rightNote
				.text(function(d){return d});
		rightNote.exit()
				.style('opacity',0)
				.remove();
				
		if(!currentChartLayoutData.chartLayout.leftNotes || currentChartLayoutData.chartLayout.leftNotes.length < 1){
			currentChartLayoutData.chartLayout.leftNotes = [];
		}else{
			chartMargin.left+=width * 0.2;
		}		
		selection.container.leftNotes
				.style('width',width*0.2+'px')
				.style('height',(height-chartMargin.top-chartMargin.bottom)+'px');
		var leftNote = selection.container.leftNotes.ul.selectAll('li.ad-chart-layout-note').data(currentChartLayoutData.chartLayout.leftNotes);
		leftNote.enter()
			.append('li')
				.attr('class','ad-chart-layout-note');
		leftNote
				.text(function(d){return d});		
		leftNote.exit()
				.style('opacity',0)
				.remove();
		selection.container.chart
				.style('left',(chartMargin.left+5)+'px')
				.style('top',chartMargin.top+'px');
				
		
		chart
				.width(width-chartMargin.left-chartMargin.right-10)
				.height(height-chartMargin.top-chartMargin.bottom)
				.animationDuration(animationDuration)
				.update(currentChartLayoutData.chartCallback);
				
		d3.timer.flush();
		
		if(callback){
			callback();
		}
		
		return chartLayout;
	};

	return chartLayout;
}

AD.UTILS.chartPage = function(){
	var width = AD.CONSTANTS.DEFAULTWIDTH();
	var selection;
	var currentPageData;
	var computedHeight=0;
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var animationType = 'forward';

	var init = function(){
		var position = {};
		if(animationType == 'backward'){
			position.left = -width+'px';
		}else{
			position.left = width+'px';
		}
		selection.currentPage = selection
			.append('div')
				.attr('class','ad-chart-page-current-page')
				.style('opacity',0)
				.style('left',position.left);
				// .attr('transform',transform);
	};

	var page = {};

	page.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return page;
	};
	page.computedHeight = function(){
		return computedHeight;
	}
	page.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		return page;
	};
	page.select = function(value){
		if(!arguments.length) return selection;
		selection = d3.select(value);
		return page;
	};
	page.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return page;
	};
	page.animationType = function(value){
		if(!arguments.length) return animationType;
		animationType = value;
		return page;
	};
	
	page.data = function(pageData, reset){
		if(!arguments.length) return currentPageData;
		newData = true;
		currentPageData = pageData;
		return page;
	}
	
	page.update = function(callback){
		if(!selection)
			return console.warn('page was not given a selection');
		var position = {};
		
		if(newData){
			newData = false;
			if(selection.currentPage){
				if(animationType == 'backward'){
					position.left = width+'px';
				}else{
					position.left = -width+'px';
				}
				selection.currentPage
					.transition()
						.duration(animationDuration)
						.style('opacity',0)
						.style('left',position.left)
						.remove();
			}
			init();
		}

		computedHeight = 0;
		
		selection.currentPage 
			.transition()
				.duration(animationDuration)
				.style('opacity',1)
				.style('left',0+'px');
		
		if(!currentPageData.data.charts || currentPageData.data.charts.length < 1){
			return console.warn('chart page was not provided any charts')
		}

		var chartLayout = selection.currentPage.selectAll('div.ad-page-chart-layout').data(currentPageData.data.charts);

		var newChartLayout = chartLayout.enter()
			.append('div')
				.attr('class','ad-page-chart-layout')
				.each(function(d){
					if(d.chart.chartLayout){
						d.chart.chartLayout
							.select(this)
							.width(width*d.width)
							.height(d.height)
							.animationDuration(0)
							.update(d.chart.chartLayoutData.chartCallback);
					}
				});

		chartLayout
				.each(function(d){
					if(d.chart.chartLayout){
						d.chart.chartLayout
								.animationDuration(animationDuration)
								.width(width*d.width)
								.update(d.chart.chartLayoutData.chartCallback);
					}
				})
				.style('left',function(d){return (width * d.x)+'px'})
				.style('top',function(d){return (d.y)+'px'});
				
		d3.timer.flush();

		if(callback){
			callback();
		}
		
		return page;
	};

	return page;
}
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
				.on('click',function(d,i){
					currentCheckboxData.state = !currentCheckboxData.state;
					for(key in on.elementClick){
						on.elementClick[key].call(this,d,i);
					}
					for(key in on.elementChange){
						on.elementChange[key].call(this,d,i);
					}
					checkbox.update();
				})
				.on('mouseover',function(d,i){
					for(key in on.elementMouseover){
						on.elementMouseover[key].call(this,d,i);
					}
				})
				.on('mouseout',function(d,i){
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
							.on('elementClick',function(d,i){
								for(key in on.elementClick){
									on.elementClick[key].call(this,d,i);
								}
							})
							.on('elementChange',function(d,i){
								for(key in on.elementChange){
									on.elementChange[key].call(this,d,i);
								}
							})
							.on('elementMouseover',function(d,i){
								for(key in on.elementMouseover){
									on.elementMouseover[key].call(this,d,i);
								}
							})
							.on('elementMouseout',function(d,i){
								for(key in on.elementMouseout){
									on.elementMouseout[key].call(this,d,i);
								}
							});
					});
				

			
			var maxControlHeight = 0;
			controls.each(function(d){
				
				d.control.scale(scale).data(d.data).update();
				
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
		
		if(callback){
			callback;
		}
		
		return controls;
	};

	return controls;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*shapes*/
AD.createNameSpace("AD.UTILS.SHAPES");


/*tooltop utilities*/
AD.UTILS.createGeneralTooltip = function(elem, heading, content){
	var body = d3.select('body');
	var adGeneralTooltip = body.append('div')
			.attr('class','ad-general-tooltip')
			.html(heading+': '+content)
			.style('opacity',0);
	
	adGeneralTooltip
		.transition()
			.duration(50)
			.style('opacity',1);
	var scroll = AD.UTILS.scrollOffset();
	
	var bodyWidth = body.node().getBoundingClientRect().width;
	// console.log(bodyWidth)
	var pos = {left:0,top:0};
	
	pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)? 
								scroll.left+d3.event.clientX+10 : 
								scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
	pos.top = scroll.top+d3.event.clientY-10;
			
	AD.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 0);	
	elem.on('mousemove',function(){
		scroll = AD.UTILS.scrollOffset();

		pos.left = (scroll.left+d3.event.clientX < bodyWidth/2)? 
		scroll.left+d3.event.clientX+10 : 
									scroll.left+d3.event.clientX-adGeneralTooltip.node().getBoundingClientRect().width-10;
		pos.top = scroll.top+d3.event.clientY-10;
	
		AD.UTILS.moveTooltip(adGeneralTooltip, pos.left, pos.top, 50);
	});
	return adGeneralTooltip;
};
AD.UTILS.removeTooltip = function(){
	d3.selectAll('.ad-general-tooltip')
			.remove();
};
AD.UTILS.moveTooltip = function(tooltip, x, y, duration){
	tooltip
		.transition()
			.duration(duration)
			.ease('linear')
			.style('opacity',1)
			.style('top',y+'px')
			.style('left',x+'px');
			
	d3.timer.flush();				
};

/*extra utilities*/
AD.UTILS.scrollOffset = function(){
	var doc = document.documentElement;
	var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
	var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
	return {top:top, left:left};
};

AD.UTILS.getValues = function(obj){
	var values = [];
	for(var key in obj) {
		obj[key].key = key;
    values.push(obj[key]);
	}
	return values;
};

/*Axis Chart Utilities*/
AD.createNameSpace("AD.UTILS.AXISCHARTS");
AD.UTILS.AXISCHARTS.getDomainLinear = function(values){
	return [(d3.min(values)<0)? d3.min(values) : 0, d3.max(values)+1]
};
AD.UTILS.AXISCHARTS.getDomainOrdinal = function(values){
	return d3.set(values).values();
};

/*Formating Utilities*/
AD.UTILS.numberFormat = function(preferences){
	var formatString = "";
	var format;
	
	if(preferences.siPrefixed){
		if(preferences.precision>-1){
			formatString += "."+preferences.precision;
		}
		formatString += "s";
	}else{
		if(preferences.separateThousands){
			formatString += ",";
		}
		if(preferences.precision>-1){
			formatString += "."+preferences.precision+"f";
		}
	}
	
	format = d3.format(formatString)
	
	return function(value){
		var units = {
			before:(preferences.units.before)?preferences.units.before:"",
			after:(preferences.units.after)?preferences.units.after:"",
		}
		if(isNaN(value))
			return units.before+value+units.after;
		else
			return units.before+format(value)+units.after;
	}
};


/*Custom Tweens*/
function arcTween(transition, arc) {
	transition.attrTween("d",function(d){
	  var i = d3.interpolate(this._current, d);
	  this._current = d;
	  return function(t) {
	    return arc(i(t));
	  };
	})
}



/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

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
		return legend;
	}
	
	legend.update = function(callback){
		if(!selection)
			return console.warn('legend was not given a selection');
		
		computedHeight = 0;
		computedWidth = 0;
		
		if(currentLegendData.items.length > 0){
			var item = selection.selectAll('g.ad-legend-item')
					.data(currentLegendData.items, function(d){return d.label;});
			
			var newItem = item.enter()
				.append('g')
					.attr('class','ad-legend-item')
					.style('opacity',0)
					.on('mouseover',function(d,i){
						for(key in on.elementMouseover){
							on.elementMouseover[key].call(this,d,i);
						}
					})
					.on('mouseout',function(d,i){
						for(key in on.elementMouseout){
							on.elementMouseout[key].call(this,d,i);
						}
					})
					.on('click',function(d,i){
						for(key in on.elementClick){
							on.elementClick[key].call(this,d,i);
						}
					});
				
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
		
		if(callback)
			callback();
		
		return legend;
	};

	return legend;
};

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

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sunburst chart*/
AD.CHARTS.sunburstChart = function(){

	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();

	var innerHeight = height, innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend();
	var breadcrumbs = new AD.UTILS.breadcrumbs();
	breadcrumbs.scale(6)

	var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};
	var partitionData;
	var currentRoot;

	// var newData = true;

	var xFormat = function(value){return value};

	var partition = d3.layout.partition()
	    .value(function(d) { return d.size; });

	var arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	var y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	var radius = {};

	var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};

	// private methods

	var getAncestors = function(node) {
	  var path = [];
	  var current = node;

	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
    path.unshift(current);

	  return path;
	};

	var arcFill = function(d) {

		// if(d.color_style == "Independent")
		// 	return color(d.name)
		// else if(d.color_style == "Custom")
		// 	return d.color

		var sequence = getAncestors(d).reverse();
		for(i=0;i<sequence.length;i++){
			if(sequence[i].top){
				return d3.rgb(color(sequence[i].name)).brighter(i*0.5);
			}
		}
		return color(d.name)
	};

	var arcMouseover = function(d) {

	  // selection.group.sunburst.arcs.arc.style('opacity',0.3);
		// var e_select, e = d;

		var sequence = getAncestors(d);
		// console.log(sequence)

		selection.group.sunburst.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) >= 0);
	              })
			.transition()
				.duration(animationDuration/7)
				.style('opacity',1)
		selection.group.sunburst.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) < 0);
	              })
			.transition()
				.duration(animationDuration/7)
				.style('opacity',0.4)

		updateBreadcrumbs(sequence);

	};

	var sunburstMouseout = function(d) {
		resetBreadcrumbs();
	  selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration/5)
				.style('opacity',1);
	};

	var arcTweenZoom = function(d){
				currentRoot = d;
				updateArcs();

	};

	var getZoomParentDomain = function(d){
		var cur = d;
		var domain = [1,0];
		do{
			if(domain[0] > cur.y)
				domain[0] = cur.y;
			if(domain[1] < cur.y + cur.dy)
				domain[1] = cur.y + cur.dy;
			cur = cur.parent;
		}while(cur);
		return domain;
	};
	var getZoomChildDomain = function(d, domain){
		if(!domain){domain = [1,0];}
		else{
			if(domain[0] > d.y)
				domain[0] = d.y;
			if(domain[1] < d.y + d.dy)
				domain[1] = d.y + d.dy;
		}

		if(d.children){
			d.children.forEach(function(child){
				return getZoomChildDomain(child,domain);
			});
		}

		return domain;

	};

	var updateArcs = function(){

				var sequence = getAncestors(currentRoot);
				var paths = {};

				paths.parents = selection.group.sunburst.arcs.arc.path
					.filter(function(node) {
		        return (sequence.indexOf(node) >= 0);
		      });


				x.domain([currentRoot.x,currentRoot.x + currentRoot.dx]);
				y.parents.domain(getZoomParentDomain(currentRoot));
				y.children.domain(getZoomChildDomain(currentRoot));

				var yDomain = {};

				paths.parents.each(function(d){
						this.newArc = {
							start: x(d.x),
							end: x(d.x + d.dx),
							inner: y.parents(d.y),
							outer: y.parents(d.y + d.dy)
						};
						if(!this.oldArc){
							this.oldArc = {
								start: 0,
								end: 0,
								inner: this.newArc.inner,
								outer: this.newArc.outer
							};
						}
				});


				paths.children = selection.group.sunburst.arcs.arc.path
					.filter(function(node) {
						return (sequence.indexOf(node) < 0);
					});

				paths.children.each(function(d){

					this.newArc = {
						start: x(d.x),
						end: x(d.x + d.dx),
						inner: y.children(d.y),
						outer: y.children(d.y + d.dy)
					};

					if(!this.oldArc){
						this.oldArc = {
							start: 0,
							end: 0,
							inner: this.newArc.inner,
							outer: this.newArc.outer
						};
					}
				});


				selection.group.sunburst.arcs.arc.exit().select('path')
					.each(function(d) {
						this.newArc = {
							start: 0,
							end: 0,
							inner: this.oldArc.inner,
							outer: this.oldArc.outer
						};
					})
					.transition()
						.duration(animationDuration*1.5)
						.attrTween("d", arcTween)
						.each("end",function(d){this.parentNode.remove()})
						.remove();


			var pathTransition = selection.group.sunburst.arcs.arc.path
				.transition()
					.duration(animationDuration*1.5)
					.attrTween("d", arcTween);



			pathTransition
				.each("end",function(d) {
					this.oldArc = this.newArc;
				});

	};


	var arcTween = function(d){
		var interpolator = d3.interpolate(this.oldArc,this.newArc)
		function tween(t){
			b = interpolator(t);
			return arc(b);
		}
		return tween;
	};

	var resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		breadcrumbs.data(breadcrumbsData).update();
	};

	var updateBreadcrumbs = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		breadcrumbs.data(breadcrumbsData).update();

		breadcrumbsSelection = breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			.attr('stroke-width',2)
			.attr('stroke',function(d){return arcFill(d.data);});

	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};

	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};

	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};

	chart.on = function(key, value){
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

		return chart;
	};

	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
			generateRequired = true;
		}

		currentChartData = chartData.data;

		partitionData = partition.nodes(currentChartData.partition);

		// newData = true;
		currentRoot =currentChartData.partition;
		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-sunburst-chart ad-svg ad-container');

		//create group container
		selection.group = selection.svg.append('g');

		selection.group.sunburst = selection.group
			.append('g')
				.attr('class','ad-sunburst')
				.on('mouseout', sunburstMouseout);


		selection.group.sunburst.arcs = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-arcs');

		selection.group.sunburst.tooltip = selection.group.sunburst
			.append('g')
				.attr('class','ad-sunburst-tooltip');

		//create legend container
		selection.group.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		//create breadcrumbs container
		selection.group.breadcrumbs = selection.group
			.append('g')
				.attr('class','ad-sunburst-breadcrumbs');

		//intialize new legend
		horizontalLegend
				.color(color)
				.selection(selection.group.legend);

		//intialize new legend
		breadcrumbs
				.selection(selection.group.breadcrumbs);

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

		selection.svg
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		innerWidth = width - forcedMargin.right - forcedMargin.left;

		var topNodes = partitionData.filter(function(d){return d.top;});

		var legendData = {
			data:{
				items: d3
								.set(topNodes.map(function(d){return d.name;}))
								.values()
								.map(function(d){return {label:d};})
			}
		};

		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();

		selection.group.breadcrumbs
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');

		breadcrumbs.width(innerWidth).update();
		forcedMargin.top += breadcrumbs.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		selection.group.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+(innerWidth-horizontalLegend.computedWidth())/2)+','+(innerHeight+forcedMargin.top)+')');

		selection.group.sunburst
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+innerWidth/2)+','+(forcedMargin.top+innerHeight/2)+')');


		radius.outer = Math.min(innerWidth,innerHeight)/2-20;
		radius.inner = radius.outer/3;

		y.children.range([radius.inner + 0.17 * (radius.outer - radius.inner), radius.outer]);
		y.parents.range([radius.inner, radius.inner + 0.13 * (radius.outer - radius.inner)]);

	  selection.group.sunburst.arcs.arc = selection.group.sunburst.arcs.selectAll("g.sunburst-arc")
		    .data(partitionData,function(d){return getAncestors(d).map(function(d){return d.name}).join('-');})
		// sunburst_mouseout();
		var newArcs =	selection.group.sunburst.arcs.arc.enter().append("g")
			.attr('class','sunburst-arc');
			// .style('opacity',0)

		var newPaths = newArcs.append("path")
				.on('mouseover',arcMouseover);


		selection.group.sunburst.arcs.arc
			.transition()
				.duration(animationDuration)
				.style('opacity',1);


		selection.group.sunburst.arcs.arc.path = selection.group.sunburst.arcs.arc.select('path')
				.style('fill',arcFill);

		selection.group.sunburst.arcs.arc.path
			// .filter(function(d){return (d.children)? true:false;})
				.on('click',arcTweenZoom)
				.classed('ad-pointer-element',true);

		updateArcs();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};

/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */


/*axis chart*/
AD.CHARTS.axisChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT(),
			margin = AD.CONSTANTS.DEFAULTMARGIN();		
	
	var innerHeight = height, innerWidth = width;
			
	var xScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'},
			yScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'};		
			
	var xBand; //used for the bar width in barCharts		
			
	var generateRequired = true; //using some methods may require the chart to be redrawn		
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend; 
	var horizontalControls;
	
	var xFormat = function(value){return value};
	var yFormat = function(value){return value};
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
	var controls = {
				yAxisLock: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false, 
					enabled: false,
					maxStacked:AD.CONSTANTS.DEFAULTHEIGHT(),
					maxNonStacked:AD.CONSTANTS.DEFAULTHEIGHT()
				}, 
				stacking: {
					label: "Stack Bars",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
				columns: {},
				labels:{x:'',y:''}
			};
	
	/*COLUMN METHODS*/
			
	// replace the column (fade old out and update)			
	var replaceColumn = function(column){ 
		var columnToBeRemoved = column.svg;
		columnToBeRemoved
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.each('end',function(){
					columnToBeRemoved.remove();
				});

		column.svg = selection.group.columns[column.newType.split(',')[0]+'_columns']
			.append('g');		

		updateColumn[column.newType](column, 'true');
		return;
	}
	
	// remove the column (fade out)
	var removeColumn = function(column){
		var columnToBeRemoved = column.svg;
		columnToBeRemoved
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.each('end',function(){
					columnToBeRemoved.remove();
				});
				
		return;
	}
	
	// different column types
	var axisChartColumnTypes = ['area','bar','line','scatter'];
	
	//update column methods (1 for each type)
	var updateColumn = {};
	updateColumn.area = function(column, newFlag){
		var path = column.svg.selectAll('path').data([column]);
		path.enter()
			.append('path')
				.style('opacity',0)
				.datum(column.modifiedData.values)
				.attr('d', column.area)
				.style('stroke', color(column.data.label))
				.style('fill', color(column.data.label));

		path
				.datum(column.modifiedData.values)
			.transition()
				.duration(animationDuration)
				.attr('d', column.area)
				.style('opacity',1);
	};
	updateColumn.bar = function(column, newFlag){
		
		var bar = column.svg.selectAll('rect').data(column.data.values, function(d){return d.x});
		
		bar.enter().append('rect')
				.attr('class','ad-bar-rect')
				.style('opacity',0)
				.attr('height',0)
				.attr('y',innerHeight);
		
		bar
				.style('fill', color(column.data.label))
				.style('stroke-width','0.6px')
				.style('opacity',1);
		
		bar.transition()
				.duration(animationDuration)
				.attr('x',function(d){return d.xPos;})
				.attr('y',function(d){return d.yPos;})
				.attr('width',function(d){return d.width;})
				.attr('height',function(d){return d.height;})
				.style('stroke', color(column.data.label));
				
		bar.exit()		
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr('height',0)
				.attr('y',innerHeight)
				.remove();
				
	};
	updateColumn.line = function(column, newFlag){
		var line = d3.svg.line()
				.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
				.y(function(d){ return yScale.scale(d.y);});
		
		var interpolationType = column.data.type.split(',')[1];
		if(interpolationType)
			line.interpolate(interpolationType);
				
		var path = column.svg.selectAll('path').data([column]);
		path.enter()
			.append('path')
				.attr('class','ad-line')
				.style('opacity',0)
				.datum(column.data.values)
				.attr('d', line)
				.style('stroke', color(column.data.label));
		
		path
				.datum(column.data.values)
			.transition()
				.duration(animationDuration)
				.attr('d', line)
				.style('opacity',1);
	};
	updateColumn.scatter = function(column, newFlag){
		var scatterPoint = column.svg.selectAll('g.ad-scatter-point').data(column.data.values, function(d){return d.x});
		var newScatterPoint = scatterPoint.enter()
			.append('g')
				.attr('class','ad-scatter-point')
				.attr('transform', function(d){
					return 'translate('+(xScale.scale(d.x) + offsetPointX())+','+yScale.scale(d.y)+')';
				});

		var newCircle = newScatterPoint
			.append('circle')
				.attr('class','ad-scatter-point')
				.attr('r', 5)
				.style('fill', color(column.data.label))
				.on('mouseover',function(){d3.select(this).transition().duration(250).attr('r',7);})
				.on('mouseout',function(){d3.select(this).transition().duration(250).attr('r',5);})
				// .style('stroke-width', '2px')
				// .style('stroke', color(column.data.label));
				
		scatterPoint
			.transition()
				.duration(animationDuration)
				.attr('transform', function(d){
					return 'translate('+(xScale.scale(d.x) + offsetPointX())+','+yScale.scale(d.y)+')';
				});
				
		scatterPoint.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};		
	
	//legend hover functions for additional functionality (most of this is done through CSS)
	var legendItemMouseover = {};
	var legendItemMouseout = {};
	
	legendItemMouseover.bar = function(){};
	legendItemMouseover.scatter = function(d){ 
		d.data.svg.selectAll('circle')
			.transition() 
				.duration(animationDuration/2)
				.attr('r', 7);
	};
	legendItemMouseover.area = function(){};
	legendItemMouseover.line = function(){};
	
	legendItemMouseout.bar = function(){};
	legendItemMouseout.scatter = function(d){
		d.data.svg.selectAll('circle')
			.transition() 
				.duration(animationDuration/2)
				.attr('r', 5);
	};
	legendItemMouseout.area = function(){};
	legendItemMouseout.line = function(){};
	
	//offset correction for ordinal axis
	var offsetPointX = function(){
		if(xScale.type == 'ordinal')
			return xScale.scale.rangeBand()/2;
		else
			return 0;
	}
	
	//compute bar positions for all bar columns (stacked vs grouped)
	var computeBarPositions = function(columns){
		var xBand;
		var barWidth;
		var xBandDefault = innerWidth/(columns.length * 7);
		
		var yVals = {};
		
		if(controls.stacking.enabled){
			if(xScale.type == 'ordinal'){
				xBand = xScale.scale.rangeBand();
				barWidth = xBand * 0.6;
			}else{
				xBand = -xBandDefault*2.5;
				barWidth = xBandDefault;
			}	
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					bar.height = (innerHeight - yScale.scale(bar.y));
					yVals[bar.x] = yVals[bar.x] || innerHeight;
					yVals[bar.x] -= bar.height;
					bar.xPos = xScale.scale(bar.x) + xBand * 0.2;
					bar.yPos = yVals[bar.x];
					bar.width = barWidth;
				});
			});
		}else{ 
			if(xScale.type == 'ordinal'){
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([0, xScale.scale.rangeBand()], 0.05, 0.3);
			}else{
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([-xBandDefault/2, xBandDefault/2], 0.05, 0.3);
			}	
			barWidth = xBand.rangeBand();
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					bar.xPos = xScale.scale(bar.x) + xBand(column.data.label);
					bar.height = innerHeight - yScale.scale(bar.y);
					bar.yPos = innerHeight - bar.height;
					bar.width = barWidth;
				});
			});
		}
	};
	
	//compute area positions for all area columns	
	var computeAreaPositions = function(columns){
		// var interpolationType;
		// if(controls.stacking.enabled){
		//
		// 	var modifiedData = columns.map(function(column){
		// 			return column.data.values.map(function(value){
		// 					return {x:value.x,y:value.y,y0:0};
		// 			});
		// 		});
		//
		// 	modifiedData = d3.layout.stack()(modifiedData);
		// 	columns.forEach(function(column,i){
		// 		column.modifiedData = column.data;
		// 		column.modifiedData.values = modifiedData[i];
		// 		column.area = d3.svg.area()
		// 				.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
		// 				.y0(function(d){ return yScale.scale(d.y0);})
		// 				.y1(function(d){ return yScale.scale(d.y);});
		//
		// 		interpolationType = column.data.type.split(',')[1];
		// 		if(interpolationType)
		// 			column.area.interpolate(interpolationType);
		//
		// 	});
		// }else{
			columns.forEach(function(column){
				column.area = d3.svg.area()
						.x(function(d){ return xScale.scale(d.x) + offsetPointX();})
						.y0(innerHeight)
						.y1(function(d){ return yScale.scale(d.y);});
		
				interpolationType = column.data.type.split(',')[1];
				if(interpolationType)
					column.area.interpolate(interpolationType);
				
				column.modifiedData = column.data;
			});

		// }
		
	};
	
	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};
	
	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return chart;
	};
	chart.xScale = function(value){
		if(!arguments.length) return xScale;
		xScale.type = value.type;
		xScale.domain = value.domain;
		generateRequired = true;
		
		if(value.type == 'linear'){
			xScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			xScale.scale = d3.scale.ordinal();
		}
		
		if(value.domain)
			xScale.scale.domain(value.domain);
		else
			xScale.domain = 'auto';
		
		return chart;
	};
	chart.yScale = function(value){
		if(!arguments.length) return yScale;
		yScale.type = value.type;
		yScale.domain = value.domain;
		generateRequired = true;
		
		if(value.type == 'linear'){
			yScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			yScale.scale = d3.scale.ordinal();
		}
		
		if(value.domain)
			yScale.scale.domain(value.domain);
		else
			yScale.domain = 'auto';
		
		return chart;
	};
	
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};
	chart.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return chart;
	};
	
	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.yAxisLock){
			controls.yAxisLock.visible = (value.yAxisLock.visible != null)? value.yAxisLock.visible:controls.yAxisLock.visible;
			controls.yAxisLock.enabled = (value.yAxisLock.enabled != null)? value.yAxisLock.enabled:controls.yAxisLock.enabled;
			controls.yAxisLock.maxStacked = (value.yAxisLock.maxStacked != null)? value.yAxisLock.maxStacked:controls.yAxisLock.maxStacked;
			controls.yAxisLock.maxNonStacked = (value.yAxisLock.maxNonStacked != null)? value.yAxisLock.maxNonStacked:controls.yAxisLock.maxNonStacked;
		}	
		
		if(value.stacking){
			controls.stacking.visible = (value.stacking.visible != null)? value.stacking.visible:controls.stacking.visible;
			controls.stacking.enabled = (value.stacking.enabled != null)? value.stacking.enabled:controls.stacking.enabled;
		}	
		
		return chart;
	};
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
		horizontalControls.animationDuration(animationDuration);
		return chart;
	};
	
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	chart.yFormat = function(value){
		if(!arguments.length) return yFormat;
		yFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	
	chart.on = function(key, value){
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
		
		return chart;
	};
	
	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {
							columns: {},
							labels:{x:'',y:''}
						};
			generateRequired = true;
		}
		
		chartData.data.columns.forEach(function(d,i){
			var c;
			if(currentChartData.columns[d.label]){
				c = currentChartData.columns[d.label];
				c.data.values = d.values || c.data.values;
				c.data.type = d.type || c.data.type;
				c.replace = d.replace || false;
				if(d.type)
					c.newType = d.type.split(',')[0];
				else
					c.newType = c.oldType; 
			}else{
				c = currentChartData.columns[d.label] = {data:d, newType:d.type.split(',')[0], oldType:null};
				if(!generateRequired){
					c.svg = selection.group.columns[d.type.split(',')[0]+'_columns']
						.append('g');
				}
			}
		});	
		if(chartData.data.labels)
			currentChartData.labels = chartData.data.labels;
		
		return chart;
	};
	
	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-axis-chart ad-svg ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		//create axis containers
		selection.group.axes = selection.group
			.append('g')
				.attr('class','ad-axes');
		selection.group.axes.x = selection.group.axes
			.append('g')
				.attr('class','ad-x ad-axis');
		selection.group.axes.y = selection.group.axes
			.append('g')
				.attr('class','ad-y ad-axis');
		selection.group.axes.xLabel = selection.group.axes
			.append('g')
				.attr('class','ad-x-label')
			.append('text');		
		selection.group.axes.yLabel = selection.group.axes
			.append('g')
				.attr('class','ad-y-label')
			.append('text');		



		//create column containers
		selection.group.columns = selection.group
			.append('g')
				.attr('class','ad-columns');
				
		axisChartColumnTypes.forEach(function(d){
			selection.group.columns[d+'_columns'] = selection.group.columns
				.append('g')
					.attr('class','ad-'+d+'-columns');
		})		
		
		for(key in currentChartData.columns){
			currentChartData.columns[key].svg = selection.group.columns[currentChartData.columns[key].newType+'_columns']
				.append('g');
		}
		
		//create controls container		
		selection.controls = selection.group
			.append('g')	
				.attr('class','ad-controls');
				
		//intialize new controls
		horizontalControls = new AD.UTILS.CONTROLS.horizontalControls();
		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});		
				
		//create legend container		
		selection.legend = selection.group
			.append('g')	
				.attr('class','ad-legend');
		
		//intialize new legend
		horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend();
		horizontalLegend
				.color(color)
				.selection(selection.legend)
				.on('elementMouseover', function(d,i){
					if(legendItemMouseover[d.data.newType]){
						legendItemMouseover[d.data.newType](d); 
						d.data.svg.classed('ad-legend-mouseover',true);
					}
				})
				.on('elementMouseout',function(d,i){
					if(legendItemMouseover[d.data.newType]){
						legendItemMouseout[d.data.newType](d); 
						d.data.svg.classed('ad-legend-mouseover',false);
					}
				});
		
		//auto update chart
		var temp = animationDuration;
		chart.animationDuration(0);		
		chart.update(callback);
		chart.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(callback){
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		forcedMargin.bottom += 20;
		forcedMargin.left += 20;

		var columns = AD.UTILS.getValues(currentChartData.columns);
		var barColumns = columns.filter(function(d){return d.newType == 'bar';});
		var areaColumns = columns.filter(function(d){return d.newType == 'area';});
		innerWidth = width - margin.left - margin.right - forcedMargin.right - forcedMargin.left;
		
		var legendData = {
			data:{
				items:columns
								.filter(function(d){return d.newType != 'none';})
								.map(function(d){return {label:d.data.label,type:d.newType,data:d};})
								.sort(function(a,b){return a.label-b.label})
			}
		};
		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();
		
		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.width(innerWidth).data(controlsData).update();
		forcedMargin.top += horizontalControls.computedHeight();
		
		innerHeight = height - margin.top - margin.bottom - forcedMargin.top - forcedMargin.bottom;

		
		//gather x and y values to find domain
		var xVals = [];
		var yVals = [];
		
		columns.forEach(function(c){
			if(c.data.values && c.newType){
				c.data.values.forEach(function(v){
					xVals.push(v.x);
					yVals.push(v.y);
				});
			}
		});
		
		//if stacking is add stacked values to set of y values
	  var yValsStackedBars = {};
		if(controls.stacking.enabled){
			barColumns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(!yValsStackedBars[bar.x])
						yValsStackedBars[bar.x] = 0;
					yValsStackedBars[bar.x] += bar.y;
				});
			});
			yVals = yVals.concat(AD.UTILS.getValues(yValsStackedBars));
		}
		
		//Set rand and domain of x and y scales
		if(xScale.type == 'linear'){
			xScale.scale.range([0, innerWidth])
			if(xScale.domain == 'auto'){
				vals = [];
				xScale.scale.domain(AD.UTILS.AXISCHARTS.getDomainLinear(xVals));
			}
		}else if(xScale.type == 'ordinal'){
			xScale.scale.rangeRoundBands([0, innerWidth], .1);
			if(xScale.domain == 'auto'){
				xScale.scale.domain(AD.UTILS.AXISCHARTS.getDomainOrdinal(xVals));
			}
		}

		var yDomain = [0,0];
		if(controls.yAxisLock.enabled){
			if(controls.stacking.enabled){
				yDomain = [0,controls.yAxisLock.maxStacked];
			}else{
				yDomain = [0,controls.yAxisLock.maxNonStacked];
			}
		}else{
			yDomain = AD.UTILS.AXISCHARTS.getDomainLinear(yVals);
		}
		yScale.scale.range([innerHeight, 0])
		if(yScale.domain == 'auto'){
			yScale.scale.domain(yDomain);
		}
		
		//resize svg		
		selection.svg
				.attr('width',width)
				.attr('height',height);		
				
		//create x and y axes		
		yScale.scale.nice(5)
		var xAxis = d3.svg.axis()
				.scale(xScale.scale)
				.orient('bottom')
				.tickFormat(xFormat);
		var yAxis = d3.svg.axis()
				.scale(yScale.scale)
				.orient('left')
				.tickFormat(yFormat);

		//initialize y-axes transition
		selection.group.axes.y
			.transition()
				.duration(animationDuration)
				.call(yAxis);
		
		//find the longest y-axis tick text
		var longestTick = 0;
		d3.select('.ad-y.ad-axis').selectAll('.tick text').each(function(){
			if(longestTick < this.getComputedTextLength())
				longestTick = this.getComputedTextLength();
		})		
	
		forcedMargin.left += longestTick;
	
		//resize the width based on the longest tick text
		innerWidth = width - margin.left - margin.right - forcedMargin.right - forcedMargin.left;
		
		//Re asign the x-axis range to account for width resize
		if(xScale.type == 'linear'){
			xScale.scale.range([0, innerWidth])
		}else if(xScale.type == 'ordinal'){
			xScale.scale.rangeRoundBands([0, innerWidth], .1);
		}
	
	  //set tickSize for grid
		xAxis.tickSize(-innerHeight)
		yAxis.tickSize(-innerWidth);
	
		//reposition the g container
		selection.group
			.transition()
				.duration(animationDuration)
				// .attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')');
		//transition x-axis
		selection.group.axes.x
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ ((margin.top + forcedMargin.top)+innerHeight) +')')
				// .attr('transform','translate('+ (0) +','+ (innerHeight) +')')
				.call(xAxis);		
		//transition y-axis		
		selection.group.axes.y
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')')
				// .attr('transform','translate('+ (0) +','+ (0) +')')
				.call(yAxis);

		//set the xBand, this is used for bar chart inconsistancies between different scale types.
		if(xScale.type == 'ordinal'){
			xBand = d3.scale.ordinal()
					.domain(barColumns.map(function(c){return c.data.label}))
					.rangeRoundBands([0, xScale.scale.rangeBand()]);
		}else{
			xBand = innerWidth/(barColumns.length * 20)
		}	

		//update axis labels
		selection.group.axes.xLabel
			.transition()
				.duration(animationDuration)
				.text(currentChartData.labels.x)
				.attr('transform', 'translate('+(margin.left + forcedMargin.left + innerWidth/2)+','+(innerHeight + 30 + (margin.top + forcedMargin.top))+')');
				// .attr('transform', 'translate('+(innerWidth/2)+','+(innerHeight + 30)+')');

		selection.group.axes.yLabel
			.transition()
				.duration(animationDuration)
	      .attr('transform', 'translate('+(margin.left + forcedMargin.left-longestTick-10)+','+(innerHeight/2+(margin.top + forcedMargin.top))+'),rotate(-90)')
	      // .attr('transform', 'translate('+(-35)+','+(innerHeight/2)+'),rotate(-90)')
				.text(currentChartData.labels.y);

		//reposition the legend
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(margin.left + forcedMargin.left + (innerWidth - horizontalLegend.computedWidth())/2)+','+(innerHeight+25+(margin.top + forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalLegend.computedWidth())/2+','+(innerHeight+25)+')');

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+((margin.left + forcedMargin.left) + innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10+(margin.top + forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10)+')');

		selection.group.columns
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (margin.left + forcedMargin.left) +','+ (margin.top + forcedMargin.top) +')');
				// .attr('transform','translate('+ (0) +','+ (0) +')');

		//calculate barChart positions
		computeBarPositions(barColumns);
		//calculate areaChart positions
		computeAreaPositions(areaColumns);

		//update columns replace(replace the column with a different type)/update(update the column with the same type)/remove(remove the column)
		columns.forEach(function(c,i){
			if(c.replace){
				replaceColumn(c);
			}else if(c.newType == 'none'){
				removeColumn(c);
			}else if(!c.oldType){
				updateColumn[c.newType](c, true);
			}else if(c.newType == c.oldType){
				updateColumn[c.newType](c, false);
			}else{
				replaceColumn(c);
			}
			
			c.oldType = c.newType;
		});
		
		//sort the areas by max value (greatest to least)
		var maxAreaValues = areaColumns.map(function(d){
			return {column: d,maxY: d3.max(d.data.values.map(function(v){
				return v.y;
			}))};
		});
		maxAreaValues
				.sort(function(a,b){return b.maxY - a.maxY;})
		maxAreaValues
				.forEach(function(d){
					selection.group.columns.area_columns.node().appendChild(d.column.svg.node());
				});	
				
		d3.timer.flush();		
		
		if(callback)
			callback();	
				
		return chart;
	}
	
	return chart;
};
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sankey chart*/
AD.CHARTS.sankeyChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var innerHeight = height, innerWidth = width;
	
	var generateRequired = true; //using some methods may require the chart to be redrawn		
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend(); 
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
				nodes:[],
				links:[]
			};
	
	var sankey;
	var nodePadding = 30;
	var nodeWidth = 15;
	var layout = 20;
	
	var minLinkWidth = 1;
	
	var nodeXVals = [];
	var nodeYVals = {};
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
	var xFormat = function(value){return value};
	
	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};
	
	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};
	
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	
	chart.nodePadding = function(value){
		if(!arguments.length) return nodePadding;
		nodePadding = value;
		return chart;
	};
	
	chart.layout = function(value){
		if(!arguments.length) return layout;
		layout = value;
		return chart;
	};
	
	chart.minLinkWidth = function(value){
		if(!arguments.length) return minLinkWidth;
		minLinkWidth = value;
		return chart;
	};
	
	chart.on = function(key, value){
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
		
		return chart;
	};
	
	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {
							nodes:[],
							links:[]
						};
			generateRequired = true;
		}
		
		if(chartData.data.nodes){			
			currentChartData.nodes = chartData.data.nodes;
		}
		if(chartData.data.links){
			currentChartData.links = chartData.data.links;
		}
		if(chartData.data.labels){
			currentChartData.labels = chartData.data.labels;
		}
		if(chartData.data.columnHeaders){
			currentChartData.columnHeaders = chartData.data.columnHeaders;
		}
		
		return chart;
	};
	
	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-sankey-chart ad-svg ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		selection.group.sankey = selection.group
			.append('g')
				.attr('class','ad-sankey');
		selection.group.sankey.links = selection.group.sankey
			.append('g')
				.attr('class','ad-sankey-links');
		selection.group.sankey.nodes = selection.group.sankey
			.append('g')
				.attr('class','ad-sankey-nodes');

		selection.group.labels = selection.group
			.append('g')
				.attr('class','ad-sankey-labels');
				
		selection.group.labels.source = selection.group.labels
			.append('g')
				.attr('class','ad-sankey-label-source');
				
		selection.group.labels.source.text = selection.group.labels.source.append('text').attr('y',23);		
				
		selection.group.labels.destination = selection.group.labels
			.append('g')
				.attr('class','ad-sankey-label-destination');
				
		selection.group.labels.destination.text = selection.group.labels.destination.append('text').attr('y',23);

		selection.group.columnHeaders = selection.group
			.append('g')
				.attr('class','ad-sankey-column-headers');
		

		//create axis containers
		// selection.group.axes = selection.group
		// 	.append('g')
		// 		.attr('class','ad-axes');


		// //create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		// //intialize new legend
		horizontalLegend
				.color(color)
				.selection(selection.legend);
		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)	
				.update(callback)
				.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(callback){
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		
		// if(currentChartData.columnHeaders){
		// 	forcedMargin.right+=20;
		// 	forcedMargin.left+=20;
		// }

		innerWidth = width - forcedMargin.right - forcedMargin.left;
		
		var legendData = {
			data:{
				items:	d3
									.set(currentChartData.nodes.map(function(d){
											return (d.colorKey)?d.colorKey:d.name;
										}))
									.values()
									.map(function(d){return {label:d};})
			}
		};
		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();

		var labelTransitions={
			source:
				selection.group.labels.source
					.transition()
						.duration(animationDuration),
			destination:
				selection.group.labels.destination
					.transition()
						.duration(animationDuration)
		}

		
				
		if(currentChartData.labels){
			selection.group.labels
					.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');
			if(currentChartData.labels.source){
				labelTransitions.source
						.style('opacity',1);
				selection.group.labels.source.text.text(currentChartData.labels.source);
			}else{
				labelTransitions.source
						.style('opacity',0);
			}
			if(currentChartData.labels.destination){
				labelTransitions.destination
						.style('opacity',1);
				selection.group.labels.destination.text.text(currentChartData.labels.destination);
			}else{
				labelTransitions.destination
						.style('opacity',0);
			}
		
			labelTransitions.source
					.attr('transform','translate('+0+','+0+')');
			labelTransitions.destination
					.attr('transform','translate('+innerWidth+','+0+')');
		
			forcedMargin.top += 35;

		}else{
			labelTransitions.source
					.style('opacity',0);
			labelTransitions.destination
					.style('opacity',0);
		}

		var columnHeader;
		var columnHeaderScale;
		if(currentChartData.columnHeaders && currentChartData.columnHeaders.length > 0){
			columnHeaderScale = d3.scale.linear()
				.domain([0,currentChartData.columnHeaders.length-1])
				.range([0,innerWidth-nodeWidth])
			
			selection.group.columnHeaders
					.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');
			
			columnHeader = selection.group.columnHeaders.selectAll('g.ad-sankey-column-header').data(currentChartData.columnHeaders);	
			columnHeader.enter()
				.append('g')
					.attr('class','ad-sankey-column-header')
				.append('text')
					.attr('y',16)
					.attr('x',function(d,i){
						if(i == 0)
							return -nodeWidth/2;
						else if(i == currentChartData.columnHeaders.length-1)
							return nodeWidth/2;
					});
			
			columnHeader.select('text').text(function(d){return d;});	
			columnHeader
				.transition()
					.duration(animationDuration)
					.attr('transform',function(d,i){return 'translate('+(columnHeaderScale(i)+nodeWidth/2)+','+0+')'})
					
			forcedMargin.top += 25;
		}

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		
		
		
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left+(innerWidth-horizontalLegend.computedWidth())/2)+','+(innerHeight+forcedMargin.top)+')')
		
		sankey = d3.sankey()
				.size([innerWidth,innerHeight])
				.nodeWidth(nodeWidth)
				.nodePadding(nodePadding)
				.nodes(currentChartData.nodes)
				.links(currentChartData.links)
				.layout(layout);
		

		var node = selection.group.sankey.nodes.selectAll('g.ad-sankey-node')
				.data(currentChartData.nodes, function(d,i){return (d.key)?d.key:i;});
		var newNode = node.enter()
			.append('g')
				.attr('class','ad-sankey-node')
				.on('mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.name+'</b>',xFormat(d.value));
				})
				.on('mouseout',function(d){
					AD.UTILS.removeTooltip();
				});
		newNode.append('rect');
		newNode.append('text');
		
		var nodeText = node.select('text')
				.text(function(d){return d.shortName;});

		node
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});

		node.select('rect')
			.transition()
				.duration(animationDuration)
				.attr('width',sankey.nodeWidth())
				.attr('height',function(d){return d.dy;});
		nodeText
			.transition()
				.duration(animationDuration)
				.style('text-anchor',function(d){return (d.x < innerWidth/2)? 'start':'end';})
				.attr('x',function(d){return (d.x < innerWidth/2)? sankey.nodeWidth()+5:-5;})
				.attr('y',function(d){return d.dy/2+5;})
				
		var link = selection.group.sankey.links.selectAll('g.ad-sankey-link')
				.data(currentChartData.links, function(d,i){return (d.key)?d.key:i;});
		var newLink = link.enter()
			.append('g')
				.attr('class','ad-sankey-link')
				.on('mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+d.source.name+' <i class="fa fa-arrow-right"></i> '+d.target.name+'</b>',xFormat(d.value));
				})
				.on('mouseout',function(d){
					AD.UTILS.removeTooltip();
				});
		newLink.append('path');
		newLink.append('text');

		link.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		node.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		

		link.select('path')
			.transition()
				.duration(animationDuration)
				.attr('d',sankey.link())
				.style('stroke-width',function(d){return Math.max(d.dy,minLinkWidth)})
				.style('stroke',function(d){return color((d[d.colorBy].colorKey)?d[d.colorBy].colorKey:d[d.colorBy].name)});

		selection.svg
				.attr('width',width)
				.attr('height',height);
				
		selection.group.sankey
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');		
			

		d3.timer.flush();		
				
		if(callback)
			callback();		
				
		return chart;
	};
	
	return chart;
};
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
AD.CHARTS.pieChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var innerHeight = height, innerWidth = width;
	
	var generateRequired = true; //using some methods may require the chart to be redrawn		
	var newData = true;			
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend(); 
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {};
	
	var xFormat = function(value){return value};
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
	var donutRatio = 0;
	
	var r = Math.min(innerHeight,innerWidth)/2;
	var arc = d3.svg.arc()
			.outerRadius(r)
			.innerRadius(r*donutRatio);
	var pie = d3.layout.pie()
			.value(function(d){return d.value;})
			.sort(null);	
	
	var pieTotal = 1;
	var legendData = [];
			
	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};
	
	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};
	
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
		return chart;
	};
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};

	chart.donutRatio = function(value){
		if(!arguments.length) return donutRatio;
		donutRatio = value;
		return chart;
	};
	
	chart.on = function(key, value){
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
		
		return chart;
	};
	
	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
			generateRequired = true;
		}
		
		if(chartData.data.values){
			chartData.data.values.forEach(function(d,i){
				if(!d.key){
					d.key = Date.now()+i;
				}
			});
			currentChartData.values = chartData.data.values;

			pieTotal = d3.sum(currentChartData.values.map(function(d){return d.value;}));
	
			legendData = {
				data:{
					items:	currentChartData.values
				}
			};
	
			newData = true;
		}
		
		return chart;
	};
	
	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-pie-chart ad-svg ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		selection.group.pie = selection.group
			.append('g')
				.attr('class','ad-pie');
		// //create legend container
		selection.legend = selection.group
			.append('g')
				.attr('class','ad-legend');

		// //intialize new legend
		horizontalLegend
				.color(color)
				.selection(selection.legend)
				// .on('elementMouseover',function(d){
				// 	console.log(d.path)
				// 	// d.path
				// 	// 		.transition()
				// 	// 			.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
				// 	// 			.attr('transform','scale(1.01)')
				// 	// 			.style('fill-opacity',0.9);
				// })
				// .on('elementMouseout',function(d){
				// 	// d.path
				// 	// 		.transition()
				// 	// 			.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
				// 	// 			.attr('transform','scale(1)')
				// 	// 			.style('fill-opacity','');
				// });
				
		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)	
				.update(callback)
				.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(callback){
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

		innerWidth = width - forcedMargin.right - forcedMargin.left;
		

		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();

		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		
	
		r = Math.min(innerHeight,innerWidth)/2;
		arc
				.outerRadius(r)
				.innerRadius(r*donutRatio);
		
		selection.group.pie
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+innerWidth/2+','+innerHeight/2+')');
		// currentChartData.values = pie(currentChartData.values);		
		var arcGroup = selection.group.pie
					.datum(currentChartData.values)	
				.selectAll("g.ad-arc")
					.data(pie,function(d,i){return d.data.key;});

		var newArcGroup = arcGroup.enter()
			.append('g')
				.attr('class','ad-arc')
				.style('opacity',0);
		
		arcGroup
			.transition()
				.duration(animationDuration)
				.style('opacity',1);
		
		
		newArcGroup.append('path')
				.each(function(d){
					this._current = {};
					this._current.startAngle = 0;
					this._current.endAngle = 0;
					d.path = d3.select(this);
				});	
		newArcGroup.append('text');
		arcGroup.select('text')
			.transition()
				.duration(animationDuration)
				.text(function(d){return d3.format("%")(d.data.value/pieTotal);})
				.attr("transform", function(d) {
					    var c = arc.centroid(d);
						  return "translate(" + c[0] +"," + c[1] + ")";
				    })
				// .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });

		var arcPath = arcGroup.select('path');
		arcPath		
				.each(function(d){d.test = 'test';})
				.style('fill',function(d){
					if(d.data.colorKey){
						return color(d.data.colorKey);
					}else{
						return color(d.data.label);
					}
				})	
				.on('mouseover',null)
				.on('mouseout',null);	
		var arcPathTransition = arcPath
			.transition()
				.duration(animationDuration)
		
		if(newData){
			newData = !newData;
			arcPathTransition
					.call(arcTween, arc);
		}else{
			arcPathTransition
					.attr('d',arc);
		}	
		
		arcPathTransition.each("end",function(d){
			var elem = d3.select(this);
			elem
					.on('mouseover',function(d){
						elem
							.transition()
								.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1.01)')
								.style('fill-opacity',0.9);
								
						AD.UTILS.createGeneralTooltip(elem, "<b>"+d.data.label+"</b>", xFormat(d.data.value));	
					})
					.on('mouseout',function(d){
						elem
							.transition()
								.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1)')
								.style('fill-opacity','')
						AD.UTILS.removeTooltip();
					});
		});
		
		arcGroup.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(innerWidth-horizontalLegend.computedWidth())/2+','+innerHeight+')')

		selection.svg
				.attr('width',width)
				.attr('height',height);
				
		selection.group
				.attr('transform','translate('+forcedMargin.left+','+forcedMargin.top+')');		
				
				
		d3.timer.flush();		

		if(callback)
			callback();
				
		return chart;
	};
	
	return chart;
};
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */


/*axis chart*/
AD.CHARTS.interactiveBarChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var innerHeight = height, innerWidth = width;
	var dimensions = {horizontal:innerWidth, vertical:innerHeight};		
			
	var xScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'},
			yScale = {type: 'linear', scale: d3.scale.linear(), domain:'auto'};		
			
	var scales = {
		horizontal:xScale,
		vertical:yScale
	}		
			
	var xBand; //used for the bar width in barCharts		
			
	var generateRequired = true; //using some methods may require the chart to be redrawn		
				
	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
	
	var horizontalLegend; 
	var horizontalControls;
	
	var xFormat = function(value){return value};
	var yFormat = function(value){return value};
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
	var orientation = {x:"x",y:"y",horizontal:"horizontal",vertical:"vertical",width:"width",height:"height",bottom:"bottom",left:"left"};
	
	var controls = {
				yAxisLock: {
					label: "Lock Y-Axis",
					type: "checkbox",
					visible: false, 
					enabled: false,
					maxStacked:AD.CONSTANTS.DEFAULTHEIGHT(),
					maxNonStacked:AD.CONSTANTS.DEFAULTHEIGHT()
				}, 
				stacking: {
					label: "Stack Bars",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				horizontal: {
					label: "Horizontal",
					type: "checkbox",
					visible: false,
					enabled:false
				}
			};
	
	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
				columns: {},
				labels:{x:'',y:''}
			};
	
	/*COLUMN METHODS*/
	
	// remove the column (fade out)
	var removeColumn = function(column){
		var columnToBeRemoved = column.svg;
		columnToBeRemoved
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.each('end',function(){
					columnToBeRemoved.remove();
				});
				
		return;
	}
	
	var updateColumn = function(column){
		var bar = column.svg.selectAll('rect').data(column.data.values, function(d){return d.x});
		bar.enter().append('rect')
				.attr('class','ad-bar-rect')
				.style('opacity',0)
				.attr(orientation.height,0)
				.attr(orientation.y,dimensions[orientation.vertical])
				.on('mouseover',function(d){
					AD.UTILS.createGeneralTooltip(d3.select(this),'<b>'+column.key+' <i>('+xFormat(d.x)+')</i></b> ',yFormat(d.y))
				})
				.on('mouseout',function(d){
					AD.UTILS.removeTooltip();
				});
		
		bar
				.style('fill', color(column.data.label))
				// .style('stroke-width','0.6px')
				.style('opacity',1);
		
		bar.transition()
				.duration(animationDuration)
				.attr(orientation.x,function(d){return d.xPos;})
				.attr(orientation.y,function(d){return d.yPos;})
				.attr(orientation.width,function(d){return d[orientation.width];})
				.attr(orientation.height,function(d){return d[orientation.height];})
				// .style('stroke', color(column.data.label));
				
		bar.exit()		
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.attr(orientation.height,0)
				.attr(orientation.y,dimensions.vertical)
				.remove();
	};
	
	//offset correction for ordinal axis
	var offsetPointX = function(){
		if(xScale.type == 'ordinal')
			return xScale.scale.rangeBand()/2;
		else
			return 0;
	}
	
	//compute bar positions for all bar columns (stacked vs grouped)
	var computeBarPositions = function(columns){
		var xBand;
		var barWidth;
		var xBandDefault = innerWidth/(columns.length * 2);
		
		var yVals = {};
		
		if(controls.stacking.enabled){
			if(xScale.type == 'ordinal'){
				xBand = scales[orientation.horizontal].scale.rangeBand();
				barWidth = xBand * 0.6;
			}else{
				xBand = -xBandDefault*2.5;
				barWidth = xBandDefault;
			}	
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					
					if(controls.horizontal.enabled){
						bar[orientation.height] = scales[orientation.vertical].scale(bar.y);
						yVals[bar.x] = yVals[bar.x] || 0;
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand * 0.2;
						bar.yPos = yVals[bar.x];
						yVals[bar.x] += bar[orientation.height];
						bar[orientation.width] = barWidth;
					}else{
						bar[orientation.height] = (dimensions[orientation.vertical] - scales[orientation.vertical].scale(bar.y));
						yVals[bar.x] = yVals[bar.x] || dimensions[orientation.vertical];
						yVals[bar.x] -= bar[orientation.height];
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand * 0.2;
						bar.yPos = yVals[bar.x];
						bar[orientation.width] = barWidth;
					}
				});
			});
		}else{ 
			if(xScale.type == 'ordinal'){
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([0, xScale.scale.rangeBand()], 0.05, 0);
			}else{
				xBand = d3.scale.ordinal()
						.domain(columns.map(function(c){return c.data.label}))
						.rangeRoundBands([-xBandDefault/2, xBandDefault/2], 0.05, 0.3);
			}	
			barWidth = xBand.rangeBand();
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(controls.horizontal.enabled){
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand(column.data.label);
						bar[orientation.height] = yScale.scale(bar.y);
						bar.yPos = 0;
						bar[orientation.width] = barWidth;
					}else{
						bar.xPos = scales[orientation.horizontal].scale(bar.x) + xBand(column.data.label);
						bar[orientation.height] = dimensions[orientation.vertical] - yScale.scale(bar.y);
						bar.yPos = dimensions[orientation.vertical] - bar[orientation.height];
						bar[orientation.width] = barWidth;
					}
				});
			});
		}
	};
	
	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};
	
	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return chart;
	};
	chart.xScale = function(value){
		if(!arguments.length) return xScale;
		xScale.type = value.type;
		xScale.domain = value.domain;
		generateRequired = true;
		
		if(value.type == 'linear'){
			xScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			xScale.scale = d3.scale.ordinal();
		}
		
		if(!value.domain)
			xScale.domain = 'auto';
		
		return chart;
	};
	chart.yScale = function(value){
		if(!arguments.length) return yScale;
		yScale.type = value.type;
		yScale.domain = value.domain;
		generateRequired = true;
		
		if(value.type == 'linear'){
			yScale.scale = d3.scale.linear();
		}else if(value.type == 'ordinal'){
			yScale.scale = d3.scale.ordinal();
		}
		
		if(!value.domain)
			yScale.domain = 'auto';
		
		return chart;
	};
	
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};
	
	// chart.horizontal = function(value){
	// 	if(!arguments.length) return controls.horizontal.enabled;
	// 	controls.horizontal.enabled = value;
	// 	return chart;
	// }
	
	chart.controls = function(value){
		if(!arguments.length) return controls;
		if(value.yAxisLock){
			controls.yAxisLock.visible = (value.yAxisLock.visible != null)? value.yAxisLock.visible:controls.yAxisLock.visible;
			controls.yAxisLock.enabled = (value.yAxisLock.enabled != null)? value.yAxisLock.enabled:controls.yAxisLock.enabled;
			controls.yAxisLock.maxStacked = (value.yAxisLock.maxStacked != null)? value.yAxisLock.maxStacked:controls.yAxisLock.maxStacked;
			controls.yAxisLock.maxNonStacked = (value.yAxisLock.maxNonStacked != null)? value.yAxisLock.maxNonStacked:controls.yAxisLock.maxNonStacked;
		}	
		
		if(value.stacking){
			controls.stacking.visible = (value.stacking.visible != null)? value.stacking.visible:controls.stacking.visible;
			controls.stacking.enabled = (value.stacking.enabled != null)? value.stacking.enabled:controls.stacking.enabled;
		}	
		
		if(value.horizontal){
			controls.horizontal.visible = (value.horizontal.visible != null)? value.horizontal.visible:controls.horizontal.visible;
			controls.horizontal.enabled = (value.horizontal.enabled != null)? value.horizontal.enabled:controls.horizontal.enabled;
		}	
		return chart;
	};
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		horizontalLegend.animationDuration(animationDuration);
		horizontalControls.animationDuration(animationDuration);
		return chart;
	};
	
	
	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	chart.yFormat = function(value){
		if(!arguments.length) return yFormat;
		yFormat = AD.UTILS.numberFormat(value);
		return chart;
	};
	
	chart.on = function(key, value){
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
		
		return chart;
	};
	
	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {
							columns: {},
							labels:{x:'',y:''}
						};
			generateRequired = true;
		}
		
		chartData.data.columns.forEach(function(d,i){
			var c;
			if(currentChartData.columns[d.label]){
				c = currentChartData.columns[d.label];
				c.data.values = d.values || c.data.values;
				c.type = d.type;
			}else{
				c = currentChartData.columns[d.label] = {data:d, type:d.type};
				if(!generateRequired){
					c.svg = selection.group.columns
						.append('g');
				}
			}
			if(c.type == 'none'){
				removeColumn(c);
				delete currentChartData.columns[d.label];
			}
		});	
		if(chartData.data.labels)
			currentChartData.labels = chartData.data.labels;
		
		return chart;
	};
	
	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.svg = selection
			.append('svg')
				.attr('class','ad-interactive-bar-chart ad-svg ad-container');
				
		//create group container		
		selection.group = selection.svg.append('g');

		//create axis containers
		selection.group.axes = selection.group
			.append('g')
				.attr('class','ad-axes');
		selection.group.axes.x = selection.group.axes
			.append('g')
				.attr('class','ad-x ad-axis');
		selection.group.axes.y = selection.group.axes
			.append('g')
				.attr('class','ad-y ad-axis');
		selection.group.axes.xLabel = selection.group.axes
			.append('g')
				.attr('class','ad-x-label')
			.append('text');		
		selection.group.axes.yLabel = selection.group.axes
			.append('g')
				.attr('class','ad-y-label')
			.append('text');		



		//create column containers
		selection.group.columns = selection.group
			.append('g')
				.attr('class','ad-columns');
				
		for(key in currentChartData.columns){
			currentChartData.columns[key].svg = selection.group.columns
				.append('g');
		}		
				
		//create controls container		
		selection.controls = selection.group
			.append('g')	
				.attr('class','ad-controls');
				
		//intialize new controls
		horizontalControls = new AD.UTILS.CONTROLS.horizontalControls();
		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});		
				
		//create legend container		
		selection.legend = selection.group
			.append('g')	
				.attr('class','ad-legend');
		
		//intialize new legend
		horizontalLegend = new AD.UTILS.LEGENDS.horizontalLegend();
		horizontalLegend
				.color(color)
				.selection(selection.legend)
				.on('elementMouseover',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/2)
							.style('opacity',0.35);
					d.data.svg.selectAll('rect')
						.transition()
							.duration(0)
							.style('opacity',1);
					// .classed('ad-legend-mouseover',true);
				})
				.on('elementMouseout',function(d,i){
					selection.group.columns.selectAll('rect')
						.transition()
							.duration(animationDuration/4)
							.style('opacity',1);
					// d.data.svg.classed('ad-legend-mouseover',false);
				});

				
		//auto update chart
		var temp = animationDuration;
		chart.animationDuration(0);		
		chart.update(callback);
		chart.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(callback){
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}

		forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();
		forcedMargin.bottom += 20;
		forcedMargin.left += 20;
		
		if(controls.horizontal.enabled){
			scales = {
					horizontal:yScale,
					vertical:xScale
				}
			orientation = {x:"y",y:"x",horizontal:"vertical",vertical:"horizontal",width:"height",height:"width",bottom:"left",left:"bottom"};
		}else{
			scales = {
					horizontal:xScale,
					vertical:yScale
				}
			orientation = {x:"x",y:"y",horizontal:"horizontal",vertical:"vertical",width:"width",height:"height",bottom:"bottom",left:"left"};
		}

		var columns = AD.UTILS.getValues(currentChartData.columns);
		
		innerWidth = width - forcedMargin.right - forcedMargin.left;
		
		var legendData = {
			data:{
				items:columns
								.map(function(d){return {label:d.data.label,data:d};})
								.sort(function(a,b){return a.label-b.label})
			}
		};
		horizontalLegend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += horizontalLegend.computedHeight();
		
		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.width(innerWidth).data(controlsData).update();
		forcedMargin.top += horizontalControls.computedHeight();
		
		innerHeight = height - forcedMargin.top - forcedMargin.bottom;
		
		dimensions = {horizontal:innerWidth, vertical:innerHeight};
		
		//gather x and y values to find domain
		var xVals = [];
		var yVals = [];
		

		
	  var yValsStackedBars = {};
		if(controls.stacking.enabled){
			columns.forEach(function(column,i){
				column.data.values.forEach(function(bar){
					if(!yValsStackedBars[bar.x])
						yValsStackedBars[bar.x] = 0;
					yValsStackedBars[bar.x] += bar.y;
					xVals.push(bar.x);
					yVals.push(bar.y);
				});
			});
			yVals = yVals.concat(AD.UTILS.getValues(yValsStackedBars));
		}else{
			columns.forEach(function(column){
				if(column.data.values){
					column.data.values.forEach(function(bar){
						xVals.push(bar.x);
						yVals.push(bar.y);
					});
				}
			});
		}
		
		var domains = {};
		
		if(scales[orientation.horizontal].type == 'ordinal'){
			scales[orientation.horizontal].scale.rangeRoundBands([0, dimensions[orientation.horizontal]], .1);
			domains[orientation.horizontal] = AD.UTILS.AXISCHARTS.getDomainOrdinal(xVals).sort();
		}else{
			scales[orientation.horizontal].scale.range([0, dimensions[orientation.horizontal]])
			domains[orientation.horizontal] = AD.UTILS.AXISCHARTS.getDomainLinear(xVals);
		}
		if(controls.yAxisLock.enabled){
			if(controls.stacking.enabled){
				domains[orientation.vertical] = [0,controls.yAxisLock.maxStacked];
			}else{
				domains[orientation.vertical] = [0,controls.yAxisLock.maxNonStacked];
			}
		}else{
			domains[orientation.vertical] = AD.UTILS.AXISCHARTS.getDomainLinear(yVals);
		}
		scales[orientation.vertical].scale.range([dimensions[orientation.vertical], 0]);


		if(scales[orientation.horizontal].domain == 'auto')
			scales[orientation.horizontal].scale.domain(domains[orientation.horizontal]);
		else{
			scales[orientation.horizontal].scale.domain(scales[orientation.horizontal].domain);
		}
		
		if(scales[orientation.vertical].domain == 'auto')
			scales[orientation.vertical].scale.domain(domains[orientation.vertical]);
		else
			scales[orientation.vertical].scale.domain(scales[orientation.vertical].domain);
		
		if(controls.horizontal.enabled){
			// scales[orientation.horizontal].scale.domain(scales[orientation.horizontal].scale.domain().reverse());
			scales[orientation.vertical].scale.domain(scales[orientation.vertical].scale.domain().reverse());
		}
		
		
		//resize svg		
		selection.svg
				.attr('width',width)
				.attr('height',height);		
				
		//create x and y axes		
		scales[orientation.vertical].scale.nice(5)
		var axes = {
			x:d3.svg.axis()
				.scale(scales[orientation.horizontal].scale)
				.orient(orientation.bottom)
				.tickFormat(xFormat),
			y:d3.svg.axis()
				.scale(scales[orientation.vertical].scale)
				.orient(orientation.left)
				.tickFormat(yFormat)
		};
		
		//initialize y-axes transition
		selection.group.axes[orientation.y]
			.transition()
				.duration(animationDuration)
				.call(axes[orientation.y]);
		
		//find the longest y-axis tick text
		var longestTick = 0;
		selection.group.axes[orientation.y].selectAll('.tick text').each(function(){
			if(longestTick < this.getComputedTextLength())
				longestTick = this.getComputedTextLength();
		})		
		
		forcedMargin.left += longestTick;
		
		//resize the width based on the longest tick text
		innerWidth = width - forcedMargin.right - forcedMargin.left;

		dimensions.horizontal = innerWidth;
		// console.log(scales.horizontal.scale.domain())
		//Re asign the x-axis range to account for width resize
		if(controls.horizontal.enabled){
			if(scales.horizontal.type == 'linear'){
				scales.horizontal.scale.range([dimensions.horizontal, 0])
			}else if(scales.horizontal.type == 'ordinal'){
				scales.horizontal.scale.rangeRoundBands([dimensions.horizontal, 0], .1);
			}
		}else{
			if(scales.horizontal.type == 'linear'){
				scales.horizontal.scale.range([0, dimensions.horizontal])
			}else if(scales.horizontal.type == 'ordinal'){
				scales.horizontal.scale.rangeRoundBands([0, dimensions.horizontal], .1);
			}
		}
	
	
	  //set tickSize for grid
		axes.x.tickSize(-dimensions[orientation.vertical])
		axes.y.tickSize(-dimensions[orientation.horizontal]);
				
		//transition x-axis
		selection.group.axes[orientation.x]
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top+innerHeight) +')')
				.call(axes[orientation.x]);
		//transition y-axis
		selection.group.axes[orientation.y]
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top) +')')
				.call(axes[orientation.y]);


		//set the xBand, this is used for bar chart inconsistancies between different scale types.
		if(scales[orientation.horizontal].type == 'ordinal'){
			xBand = d3.scale.ordinal()
					.domain(columns.map(function(c){return c.data.label}))
					.rangeRoundBands([0, scales[orientation.horizontal].scale.rangeBand()]);
		}else{
			xBand = dimensions[orientation.horizontal]/(columns.length * 20)
		}

		//update axis labels
		selection.group.axes[orientation.x+"Label"]
			.transition()
				.duration(animationDuration)
				.text(currentChartData.labels[orientation.x])
				.attr('transform', 'translate('+(forcedMargin.left + innerWidth/2)+','+(innerHeight + 30 + (forcedMargin.top))+')');
				// .attr('transform', 'translate('+(innerWidth/2)+','+(innerHeight + 30)+')');

		selection.group.axes[orientation.y+"Label"]
			.transition()
				.duration(animationDuration)
	      .attr('transform', 'translate('+(forcedMargin.left-longestTick-10)+','+(innerHeight/2+(forcedMargin.top))+'),rotate(-90)')
			      // .attr('transform', 'translate('+(-35)+','+(innerHeight/2)+'),rotate(-90)')
				.text(currentChartData.labels[orientation.y]);

		//reposition the legend
		selection.legend
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(forcedMargin.left + (innerWidth - horizontalLegend.computedWidth())/2)+','+(innerHeight+25+(forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalLegend.computedWidth())/2+','+(innerHeight+25)+')');

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+((forcedMargin.left) + innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10+(forcedMargin.top))+')');
				// .attr('transform','translate('+(innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight()-10)+')');

		selection.group.columns
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+ (forcedMargin.left) +','+ (forcedMargin.top) +')');
				// .attr('transform','translate('+ (0) +','+ (0) +')');
				

		//calculate positions
		computeBarPositions(columns);

		columns.forEach(function(c,i){
			updateColumn(c);
		});


		d3.timer.flush();		
			
		if(callback)
			callback();		
				
		return chart;
	}
	
	return chart;
};
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
AD.CHARTS.iframeChart = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			height = AD.CONSTANTS.DEFAULTHEIGHT();		
	
	var generateRequired = true; //using some methods may require the chart to be redrawn		

	var selection = d3.select('body'); //default selection of the HTML body
	
	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

	var color = AD.CONSTANTS.DEFAULTCOLOR();
	
	var currentChartData = {
			};
	
	//init event object
	var on = {
		elementMouseover:function(){},
		elementMouseout:function(){},
		elementClick:function(){}
	};
	
	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};
	
	//members that will set the regenerate flag
	chart.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return chart;
	};
	chart.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return chart;
	};
	//methods that require update
	chart.width = function(value){
		if(!arguments.length) return width;
		width = value;
		return chart;
	};
	chart.height = function(value){
		if(!arguments.length) return height;
		height = value;
		return chart;
	};
	
	chart.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		return chart;
	};
	
	chart.on = function(key, value){
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
		
		return chart;
	};
	
	chart.data = function(chartData, reset){
		if(!arguments.length) return currentChartData;
		if(reset){
			currentChartData = {};
		}

		generateRequired = true;	
		currentChartData = chartData.data;
		
		return chart;
	};
	
	//generate chart
	chart.generate = function(callback) {
		generateRequired = false;
		
		//clean container
		selection.selectAll('*').remove();

		//create svg
		selection.div = selection
			.append('div')
				.attr('class','ad-iframe-chart ad-container');

		selection.div.iframe = selection.div
			.append('iframe')
				.attr('class','ad-iframe')
				.attr('src',currentChartData.url);

		//auto update chart
		var temp = animationDuration;
		chart
				.animationDuration(0)	
				.update(callback)
				.animationDuration(temp);
		
		return chart;
	};
	
	//update chart
	chart.update = function(callback){
		
		//if generate required call the generate method
		if(generateRequired){
			return chart.generate(callback);
		}
		
		selection.div.iframe
			.transition()
				.duration(animationDuration)
				.attr('width',width)
				.attr('height',height);

		d3.timer.flush();	

		if(callback)
			callback();	
				
		return chart;
	};
	
	return chart;
};
/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.DASHBOARDS.dashboard = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			margin = AD.CONSTANTS.DEFAULTMARGIN();				

	var pageWidth = width - 200;

	var innerWidth = width;		
		
	var generateRequired = true; //using some methods may require the chart to be redrawn		
			
	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

  var chartPage = new AD.UTILS.chartPage();

	var navigationHistory = {};
	navigationHistory.array = [];
	navigationHistory.position = -1;
	navigationHistory.pushNew = function(value){	
		navigationHistory.array = navigationHistory.array
				.slice(0,navigationHistory.position+1);
						
		navigationHistory.position++;
		navigationHistory.array.push({category:value.category,section:value.section});
	};
	var current = {section:{}, category:{}};
	
	var resized = true;
	
	// var controls = {
	// 		};

	// var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentDashboardData = {
			};
	
	var palette = AD.CONSTANTS.DEFAULTPALETTE;
	
	
	var traverseCategories = function(categories){
		if(categories){
			categories.forEach(function(cat){
				if(cat.charts){
					cat.charts.forEach(function(chart){
						chart.chart = currentDashboardData.dashboard.charts[chart.reference];
					});
				};
			});
		}
	};
	var traverseSections = function(position,sections,sectionGroup){
		sections.forEach(function(section){
			traverseCategories(section.categories);
			section.position = position.concat([{section:section, sectionGroup: sectionGroup}]);
			if(section.sections)
				traverseSections(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sections);
			if(section.sectionGroups)
				traverseSectionGroups(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sectionGroups);
		});
	};
	var traverseSectionGroups = function(position,sectionGroups){
		sectionGroups.forEach(function(sectionGroup){
			if(sectionGroup.sections)
				traverseSections(position,sectionGroup.sections,sectionGroup);
		});
	};
	var dashboardLayout = function(data){
		for(chart in data.dashboard.charts){
			AD.UTILS.chartAdapter(data.dashboard.charts[chart].type,data.dashboard.charts[chart]);
		}
		traverseSections([],[data.dashboard.topSection]);
	};
	
	var resetSubSectionGroupBreadcrumbs = function(){
		selection.container.content.breadcrumbs.svg.selectAll('.ad-breadcrumb-sub-section-group-section')
			.transition()
				.duration(animationDuration/2)
				.style('opacity',0);
		selection.container.content.breadcrumbs.svg.selectAll('.ad-breadcrumb').each(function(){this.expanded = false;});		
		selection.container.content.breadcrumbs.svg.style('height','30px');
	};
	
	var updateBreadcrumbs = function(){
		//breadcrumb indention
		var breadcrumbIndentSize = 9;
		
		//set breadcrumb data keyed by the section name
		var breadcrumb = selection.container.content.breadcrumbs.svg.selectAll('g.ad-breadcrumb').data(current.section.position,function(d){return d.section.name;});
		
		//enter new breadcrumbs
		var newBreadcrumb = breadcrumb.enter()
			.append('g')
				.style('opacity',0)
				.attr('class','ad-breadcrumb');
		
		//init new breadcrumb path and text
		newBreadcrumb
			.append('path')
				.style('fill',palette.primary);
		newBreadcrumb
			.append('text')
				.text(function(d){return d.section.name;})
				.attr('y',21)
				.attr('x',15);
					
		//iterate through all breadcrumbs			
		breadcrumb.each(function(d,i){
			//save this obj
			var _breadcrumb = this;
			var elem = d3.select(_breadcrumb);
			var text = elem.select('text');
			var path = elem.select('path');
			
			//set breadCrumb path width according to text width
			var pathWidth = text.node().getBBox().width+25;
			var triangle;

			elem.select('g.ad-breadcrumb-triangle').remove();
			//if section is part of a sectionGroup add sub-section dropdown
			
			if(d.section != current.section){
				elem
						.classed('ad-innactive',false)
						.on('click',function(d){
							changeCurrentSection(d.section);
						});
			}else{
				elem
						.classed('ad-innactive',true)
						.on('click',function(){});
			}
			if(d.sectionGroup){
				
				//set data for sub-section, omitting the selected section
				var sectionBreadcrumb = elem.selectAll('g.ad-breadcrumb-sub-section-group-section')
						.data(d.sectionGroup.sections.filter(function(dd){return dd!=d.section;}));
				
				//init breadcrumb dyExpanded and expanded flags
				_breadcrumb.dyExpanded = 0;
				_breadcrumb.expanded = false;
				
				//enter breadcrumb group, path, and text
				var newSectionBreadcrumb = sectionBreadcrumb.enter()
					.append('g')
						.style('opacity',0)
						.attr('class','ad-breadcrumb-sub-section-group-section');
				newSectionBreadcrumb.append('path');
				newSectionBreadcrumb.append('text')
					.attr('y',21)
					.attr('x',15)
					.text(function(d){return d.name;});
					
				//iterate through sub-section breadcrumbs	
				sectionBreadcrumb.each(function(d){
							var elem = d3.select(this);
							var path = elem.select('path');
							var text = elem.select('text');
							var pathWidth = text.node().getBBox().width+25;
							path
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 15 L 0 30 L '+pathWidth+' 30 L '+(pathWidth+breadcrumbIndentSize)+' 15 L '+pathWidth+' 0 L 0 0 Z');
						}).on('click',function(d){
							d3.event.stopPropagation();
							changeCurrentSection(d);
						})
						.attr('transform',function(d,i){return 'translate(0,'+(34*(i+1))+')';});		
				
				//set dyExpanded to be the max size of the dropdown
				_breadcrumb.dyExpanded = (34*(sectionBreadcrumb.size()+5));
				
				//add triangle under sectionGroup breadcrumb
				pathWidth += 15;
				triangle = elem.append('g')
						.attr('class','ad-breadcrumb-triangle')
						.on('click',function(){
							d3.event.stopPropagation();
							if(!_breadcrumb.expanded){
								resetSubSectionGroupBreadcrumbs();
								selection.container.content.breadcrumbs.svg
										.style('height',Math.max(30,_breadcrumb.dyExpanded)+'px');
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.delay(function(d,i){return i*20;})
										.style('opacity',1);
							}else{
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.style('opacity',0);
								selection.container.content.breadcrumbs.svg
										.style('height',30+'px');		
							}
							_breadcrumb.expanded = !_breadcrumb.expanded;
						});
				triangle.append('rect')
						.attr('width',20)
						.attr('height',30)
						.style('fill',d3.rgb(palette.primary).darker(2))
						.attr('transform','translate('+(pathWidth-20)+',0)');
				triangle.append('path')
						.attr('d','M 0 0 L 9 0 L 4.5 5 L 0 0')
						.style('fill','white')
						.attr('transform','translate('+(pathWidth-15)+',13)');
			}else{
				
			}
			
			//draw breadcrumb path, making note of start and end breadcrumbs
			var startIndent = breadcrumbIndentSize;
			var endIndent = breadcrumbIndentSize;
			if(i == 0)
				startIndent = 0;
			if(i+1 == breadcrumb.size())
				endIndent = 0;
			path
				.transition()
					.duration(animationDuration)
					.attr('d','M 0 0 L '+(startIndent)+' 15 L 0 30 L '+pathWidth+' 30 L '+(pathWidth+endIndent)+' 15 L '+pathWidth+' 0 L 5 0 Z');
			this.dx = pathWidth;
		});	
		
		//position breadcrumbs
		var xCurrent = 0;		
		breadcrumb 
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){
					var translation = 'translate('+xCurrent+',0)';
					xCurrent += this.dx + 2;
					return translation;
				})
				.style('opacity',1);
				
		//fade out exiting breadcrumbs
		breadcrumb.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		
	};
	var updateCategoryTabs = function(){
		if(!current.section.categories || current.section.categories.length < 1){
			selection.container.header.navigation.categoryTabs.style('display','none').selectAll("*").remove();
			return;
		}else{
			selection.container.header.navigation.categoryTabs.style('display','');
		}
		
		var categoryTab = selection.container.header.navigation.categoryTabs.selectAll('li.ad-category-tab').data(current.section.categories);
		categoryTab.enter()
			.append('li')
				.attr('class','ad-category-tab')
				.on('click',changeCurrentCategory);
		categoryTab
			.text(function(d){return d.name;})
			.each(function(d){
				if(d==current.category){
					d3.select(this)
							.classed('ad-innactive',true)
							.on('click',function(){});
				}else{
					d3.select(this)
							.classed('ad-innactive',false)
							.on('click',changeCurrentCategory);
				}
			});
			categoryTab.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();
			
		
	};
	var updateSubSections = function(){
		if(!current.section.sections || current.section.sections.length < 1){
			selection.container.sidebar.subSections.style('display','none').selectAll("*").remove();
			return;
		}else{
			selection.container.sidebar.subSections.style('display','');
		}
		
		var subSection = selection.container.sidebar.subSections.selectAll('li.ad-sub-section').data(current.section.sections);

		subSection.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','ad-sub-section')
				.on('click',changeCurrentSection);
		
		subSection
				.text(function(d){return d.name})
			.transition()
				.duration(animationDuration)
				.style('opacity',1);
				
		subSection.exit()	
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};
	var updateSubSectionGroups = function(){
		if(!current.section.sectionGroups || current.section.sectionGroups.length < 1){
			selection.container.sidebar.subSectionGroups.style('display','none').selectAll("*").remove();
			return;
		}else{
			var subSectionGroupData = current.section.sectionGroups.filter(function(d){return d.sections.length > 0;});
			if(subSectionGroupData.length < 1){
				selection.container.sidebar.subSectionGroups.style('display','none').selectAll("*").remove();
				return;
			}else{
				selection.container.sidebar.subSectionGroups.style('display','');
			}
		}
		var subSectionGroup = selection.container.sidebar.subSectionGroups.selectAll('li.ad-sub-section-group').data(subSectionGroupData);

		subSectionGroup.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','ad-sub-section-group');
		
		subSectionGroup
			.transition()
				.duration(animationDuration)
				.style('opacity',1);
				
		subSectionGroup
				.text(function(d){return d.name})
				.each(makeSubSectionGroupSections);		
				
		subSectionGroup.exit()	
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};
	var makeSubSectionGroupSections = function(d){
		if(!d.sections || d.sections.length < 1)
			return;
		var elem = d3.select(this);
		elem.selectAll('*').remove();
		var subSectionGroupSections = elem
			.append('ul')
				.datum(d)
				.attr('class','ad-sub-section-group-sections');
					
		var subSectionGroupSection = subSectionGroupSections.selectAll('li.ad-sub-section-group-section').data(function(dd){return dd.sections;});

		subSectionGroupSection.enter()
			.append('li')
				.attr('class','ad-sub-section-group-section');
				
		subSectionGroupSection
				.on('click',changeCurrentSection);	

		subSectionGroupSection
				.text(function(d){return d.name;});
	};
	
	var changeCurrentSection = function(d){
		resetSubSectionGroupBreadcrumbs();
		
		current.section = d;
		
		var newCategory = d.categories.filter(function(d){return d.name == current.category.name;});
		if(newCategory.length > 0){
			return changeCurrentCategory(newCategory[0]);
		}else{
			return changeCurrentCategory(d.categories[0]);
		}
	};
	var ii=0;
	var changeCurrentCategory = function(d){
		current.category = d;
		navigationHistory.pushNew(current);
		/////Work on proper push/pop/find state later
		// history.pushState({},'','?category='+(current.category.name)+'&section='+(current.section.name))
		chartPage
				.animationType('forward')
				.data({data:current.category}).update();
		return dashboard.update();
	};
	
	var dashboard = {};

	//members that will set the regenerate flag
	dashboard.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return dashboard;
	};
	dashboard.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return dashboard;
	};

	//methods that require update
	dashboard.width = function(value){
		if(!arguments.length) return width;
		width = value;
		pageWidth = width - 200;
		chartPage.width(pageWidth - 10);
		resized = true;
		return dashboard;
	};

	dashboard.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return dashboard;
	};

	dashboard.palette = function(value){
		if(!arguments.length) return palette;
		palette = value;
		return dashboard;
	};
	
	//other members
	// dashboard.controls = function(value){
	// 	if(!arguments.length) return controls;
	//
	// 	return dashboard;
	// };
	dashboard.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		chartPage.animationDuration(animationDuration);
		
		return dashboard;
	};

	dashboard.data = function(dashboardData, reset){
		if(!arguments.length) return animationDuration;
		if(reset){
			generateRequired = true;
			currentDashboardData = {};
		}
		
		currentDashboardData = dashboardData;
		dashboardLayout(currentDashboardData);
		
		return dashboard;
	}

	//generate chart
	dashboard.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create container
		selection.container = selection
			.append('div')
				.attr('class','ad-dashboard ad-container');
		
		selection.container.header = selection.container
			.append('div')
				.attr('class','ad-header');		
				
		selection.container.header.navigation = selection.container.header
			.append('div')
				.attr('class','ad-navigation');	
				
		selection.container.header.navigation.home = selection.container.header.navigation
			.append('div')
				.attr('class','ad-navigation-home');
				
		selection.container.header.navigation.home.append('i').attr('class','fa fa-home')		
				
		selection.container.header.navigation.arrows = selection.container.header.navigation
			.append('div')
				.attr('class','ad-navigation-arrows');
				
		selection.container.header.navigation.arrows.left = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','ad-left-arrow');
				
		selection.container.header.navigation.arrows.right = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','ad-right-arrow');
		
		selection.container.header.navigation.arrows.left.append('i').attr('class','fa fa-chevron-left')

		selection.container.header.navigation.arrows.right.append('i').attr('class','fa fa-chevron-right')				
				
		selection.container.header.navigation.categoryTabs = selection.container.header.navigation
			.append('ul')
				.attr('class','ad-category-tabs');		
				
		selection.container.sidebar = selection.container
			.append('div')
				.attr('class','ad-dashboard-sidebar');	
				
		selection.container.sidebar.subSections = selection.container.sidebar
			.append('ul')
				.attr('class','ad-sub-sections');		
				
		selection.container.sidebar.subSectionGroups = selection.container.sidebar
			.append('ul')
				.attr('class','ad-sub-section-groups');	
				
		selection.container.content = selection.container	
			.append('div')
				.attr('class','ad-dashboard-content');	
				
		selection.container.content.breadcrumbs = selection.container.content
			.append('div')
				.attr('class','ad-navigation-breadcrumbs');	
				
		selection.container.content.breadcrumbs.svg = selection.container.content.breadcrumbs
			.append('svg')
				.attr('class','ad-navigation-breadcrumbs-svg');			

		selection.container.content.chartPage = selection.container.content
			.append('div')
				.attr('class','ad-dashboard-chart-page');		
				
		chartPage.selection(selection.container.content.chartPage);
		
		changeCurrentSection(currentDashboardData.dashboard.topSection);

		//auto update dashboard
		var temp = animationDuration;
		// dashboard
		// 		.animationDuration(0);
		// 		update(dashboardData);
		// 		animationDuration(temp);
		dashboard.update(callback);

		return dashboard;
	};

	//update chart
	dashboard.update = function(callback){
	
		//if generate required call the generate method
		if(generateRequired){
			return dashboard.generate(callback);
		}

		selection.container.content
			.style('width',pageWidth+'px');
		
		if(current.section == currentDashboardData.dashboard.topSection){
			selection.container.header.navigation.home
					.classed('ad-innactive',true)
					.on('click',function(){});
		}else{
			selection.container.header.navigation.home
					.classed('ad-innactive',false)
					.on('click',function(){
						changeCurrentSection(currentDashboardData.dashboard.topSection);
					});
		}
		
		if(navigationHistory.position+1 == navigationHistory.array.length){
			selection.container.header.navigation.arrows.right
					.classed('ad-innactive',true)
					.on('click',function(){});
		}else{
			selection.container.header.navigation.arrows.right
					.classed('ad-innactive',false)
					.on('click',function(){
						navigationHistory.position++;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						chartPage
								.animationType('forward')
								.data({data:current.category}).update();
						dashboard.update();
					});
		}
		
		if(navigationHistory.position == 0){
			selection.container.header.navigation.arrows.left
					.classed('ad-innactive',true)
					.on('click',function(){})
		}else{
			selection.container.header.navigation.arrows.left
					.classed('ad-innactive',false)
					.on('click',function(){
						navigationHistory.position--;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						chartPage
								.animationType('backward')
								.data({data:current.category}).update();
						dashboard.update();
					});
		}
		
		selection.container
			.transition()
				.delay(animationDuration)
				.duration(animationDuration)
				.style('width', width+'px');	
		updateCategoryTabs();
		updateBreadcrumbs();
		updateSubSections();	
		updateSubSectionGroups();	
		
		if(resized){
			resized = false;
			chartPage
					.update();
		}
		
		d3.timer.flush();
		
		if(callback){
			callback();
		}
		
		return dashboard;
	};
	
	return dashboard;
	
};
d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          if (nextNodes.indexOf(link.target) < 0) {
            nextNodes.push(link.target);
          }
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};