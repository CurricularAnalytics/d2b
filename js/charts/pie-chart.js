/* Copyright 2014 - 2015 Kevin Warne All rights reserved. */

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