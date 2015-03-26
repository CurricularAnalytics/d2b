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

	var legend = new AD.UTILS.LEGENDS.legend(),
	  	horizontalControls = new AD.UTILS.CONTROLS.horizontalControls(),
			legendOrientation = 'bottom';

	var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};

	var xFormat = function(value){return value};

	var controls = {
			};

	//init event object
	var on = AD.CONSTANTS.DEFAULTEVENTS();

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

	var arcTween = function(transition, arc) {
		transition.attrTween("d",function(d){
		  var i = d3.interpolate(this._current, d);
		  // this._current = d;
		  return function(t) {
			  this._current = i(t);
		    return arc(i(t));
		  };
		})
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
		legend.animationDuration(animationDuration);
		return chart;
	};

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = AD.UTILS.numberFormat(value);
		return chart;
	};

	chart.controls = function(value){
		if(!arguments.length) return controls;
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

		currentChartData.values = chartData.data.values;

		pieTotal = d3.sum(currentChartData.values.map(function(d){return d.value;}));
		newData = true;

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

		//create controls container
		selection.controls = selection.group
			.append('g')
				.attr('class','ad-controls');


		horizontalControls
				.selection(selection.controls)
				.on('elementChange',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});

		// //intialize new legend
		legend
				.color(color)
				.selection(selection.legend)
				// .on('elementMouseover.ad-mouseover',function(d){
				// 	console.log(d.path)
				// 	// d.path
				// 	// 		.transition()
				// 	// 			.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
				// 	// 			.attr('transform','scale(1.01)')
				// 	// 			.style('fill-opacity',0.9);
				// })
				// .on('elementMouseout.ad-mouseout',function(d){
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

		var controlsData = AD.UTILS.getValues(controls).filter(function(d){return d.visible;});
		controlsData.map(function(d){
			d.data = {state:d.enabled, label:d.label, key:d.key};
		});
		horizontalControls.data(controlsData).width(innerWidth).update();

		//reposition the controls
		selection.controls
			.transition()
				.duration(animationDuration)
				.attr('transform','translate('+(innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight())+')');

		forcedMargin.top += horizontalControls.computedHeight();
		innerHeight = height - forcedMargin.top - forcedMargin.bottom;

		// legendData = {
		// 	data:{
		// 		items:	currentChartData.values
		// 	}
		// };

		// legend.width(innerWidth).data(legendData).update();
		forcedMargin.bottom += legend.computedHeight();

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
					.data(pie,function(d,i){
						if(d.data.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000);
						else if(d.data.key && d.data.key != 'auto')
							return d.data.key;
						else
							return d.data.label;
					});

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

		// newArcGroup.append('g')
		// 		.attr('class','ad-pie-label')
		// 		.attr("transform", function(d) {
		// 		    var c = arc.centroid(d),
		// 		        x = c[0],
		// 		        y = c[1],
		// 		        // pythagorean theorem for hypotenuse
		// 		        h = Math.sqrt(x*x + y*y);
		// 		    return "translate(" + (x/h * 500) +  ',' +
		// 		       (y/h * 500) +  ")";
		// 		})
		// 	.append('text').text('hi')
		// 		// .each(function(d){
		// 		// 	this._
		// 		// });

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
				.on('mouseover.ad-mouseover',null)
				.on('mouseout.ad-mouseout',null);
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
					.on('mouseover.ad-mouseover',function(d,i){
						elem
							.transition()
								.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1.01)')
								.style('fill-opacity',0.9);

						AD.UTILS.createGeneralTooltip(elem, "<b>"+d.data.label+"</b>", xFormat(d.data.value));
						for(key in on.elementMouseover){
							on.elementMouseover[key].call(this,d,i,'arc');
						}
					})
					.on('mouseout.ad-mouseout',function(d,i){
						elem
							.transition()
								.duration(AD.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1)')
								.style('fill-opacity','')
						AD.UTILS.removeTooltip();
						for(key in on.elementMouseout){
							on.elementMouseout[key].call(this,d,i,'arc');
						}
					})
					.on('click.ad-click',function(d,i){
						for(key in on.elementClick){
							on.elementClick[key].call(this,d,i,'arc');
						}
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
				.attr('transform','translate('+(innerWidth-legend.computedWidth())/2+','+innerHeight+')')

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
