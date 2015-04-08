/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*template chart*/
d2b.CHARTS.pieChart = function(){

	var $$ = {};

	//define axisChart variables
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();

	$$.innerHeight = $$.height
	$$.innerWidth = $$.width;

	$$.generateRequired = true; //using some methods may require the chart to be redrawn
	var newData = true;

	$$.selection = d3.select('body'); //default $$.selection of the HTML body

	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();

	$$.legend = new d2b.UTILS.LEGENDS.legend()
	$$.controls = new d2b.UTILS.CONTROLS.controls()

	$$.legendOrientation = 'bottom';

	var color = d2b.CONSTANTS.DEFAULTCOLOR();

	var currentChartData = {};

	var xFormat = function(value){return value};

	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: true,
					enabled: false
				}
			};

	//init event object
	var on = d2b.CONSTANTS.DEFAULTEVENTS();

	var donutRatio = 0;

	var r = Math.min($$.innerHeight,$$.innerWidth)/2;
	var arc = d3.svg.arc()
			.outerRadius(r)
			.innerRadius(r*donutRatio);
	var pie = d3.layout.pie()
			.value(function(d){return d.value;})
			.sort(null);

	var pieTotal = 1;
	$$.legendData = {data:{items:[]}};

	var arcTween = function(transition, arc) {
		transition.attrTween("d",function(d){
			_self = this;
		  var i = d3.interpolate(_self._current, d);
		  return function(t) {
			  _self._current = i(t);
		    return arc(i(t));
		  };
		})
	};

	$$.persistentChartData = {
		hoveredArc:null,
		hiddenArcs:{}
	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
	var chart = {};


	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		// $$.controls.animationDuration($$.animationDuration);
	});
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);

	chart.xFormat = function(value){
		if(!arguments.length) return xFormat;
		xFormat = d2b.UTILS.numberFormat(value);
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
			$$.generateRequired = true;
		}

		currentChartData.values = chartData.data.values;

		pieTotal = d3.sum(currentChartData.values.map(function(d){return d.value;}));
		newData = true;

		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
		$$.selection.selectAll('*').remove();

		//create svg
		$$.selection.svg = $$.selection
			.append('svg')
				.attr('class','d2b-pie-chart d2b-svg d2b-container');

		//create group container
		$$.selection.group = $$.selection.svg.append('g');

		$$.selection.group.pie = $$.selection.group
			.append('g')
				.attr('class','d2b-pie');
		// //create $$.legend container
		$$.selection.legend = $$.selection.group
			.append('g')
				.attr('class','d2b-$$.legend');

		//create controls container
		$$.selection.controls = $$.selection.group
			.append('g')
				.attr('class','d2b-controls');


		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					controls[d.key].enabled = d.state;
					chart.update();
				});

		// //intialize new $$.legend
		$$.legend
				.color(color)
				.selection($$.selection.legend)
				// .on('elementMouseover.d2b-mouseover',function(d){
				// 	console.log(d.path)
				// 	// d.path
				// 	// 		.transition()
				// 	// 			.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				// 	// 			.attr('transform','scale(1.01)')
				// 	// 			.style('fill-opacity',0.9);
				// })
				// .on('elementMouseout.d2b-mouseout',function(d){
				// 	// d.path
				// 	// 		.transition()
				// 	// 			.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
				// 	// 			.attr('transform','scale(1)')
				// 	// 			.style('fill-opacity','');
				// });

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//update chart
	chart.update = function(callback){

		// //if generate required call the generate method
		// if($$.generateRequired){
		// 	return chart.generate(callback);
		// }

		// $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		//
		// $$.innerWidth = $$.width - $$.forcedMargin.right - $$.forcedMargin.left;
		//
		// var controlsData = d2b.UTILS.getValues(controls).filter(function(d){return d.visible;});
		// controlsData.map(function(d){
		// 	d.data = {state:d.enabled, label:d.label, key:d.key};
		// });
		// horizontalControls.data(controlsData).width($$.innerWidth).update();
		//
		// //reposition the controls
		// $$.selection.controls
		// 	.transition()
		// 		.duration($$.animationDuration)
		// 		.attr('transform','translate('+($$.innerWidth - horizontalControls.computedWidth())+','+(-horizontalControls.computedHeight())+')');
		//
		// $$.forcedMargin.top += horizontalControls.computedHeight();
		// $$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;
		//
		// $$.legendData = {
		// 	data:{
		// 		items:	currentChartData.values
		// 	}
		// };
		//
		// $$.legend.width($$.innerWidth).data($$.legendData).update();
		// $$.forcedMargin.bottom += $$.legend.computedHeight();
		//
		// $$.innerHeight = $$.height - $$.forcedMargin.top - $$.forcedMargin.bottom;


		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		//update dimensions to the conform to the padded SVG:G
		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		//update controls viz
		d2b.UTILS.CHARTS.HELPERS.updateControls($$);

		//set legend data and update legend viz
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			//----replace array with a custom legend builder
			$$.legendData.data.items = [{'label':'item 1'},{'label':'item 2'},{'label':'item 3'},{'label':'item 4'},{'label':'item 5'},{'label':'item 6'}]
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);


		r = Math.min($$.innerHeight,$$.innerWidth)/2;
		arc
				.outerRadius(r)
				.innerRadius(r*donutRatio);

		$$.selection.group.pie
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.innerWidth/2+','+$$.innerHeight/2+')');
		// currentChartData.values = pie(currentChartData.values);
		var arcGroup = $$.selection.group.pie
					.datum(currentChartData.values)
				.selectAll("g.d2b-arc")
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
				.attr('class','d2b-arc')
				.style('opacity',0);

		arcGroup
			.transition()
				.duration($$.animationDuration)
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
				.duration($$.animationDuration)
				.text(function(d){return d3.format("%")(d.data.value/pieTotal);})
				.attr("transform", function(d) {
					    var c = arc.centroid(d);
						  return "translate(" + c[0] +"," + c[1] + ")";
				    });

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
				.on('mouseover.d2b-mouseover',null)
				.on('mouseout.d2b-mouseout',null);
		var arcPathTransition = arcPath
			.transition()
				.duration($$.animationDuration)

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
					.on('mouseover.d2b-mouseover',function(d,i){
						elem
							.transition()
								.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1.01)')
								.style('fill-opacity',0.9);

						d2b.UTILS.createGeneralTooltip(elem, "<b>"+d.data.label+"</b>", xFormat(d.data.value));
						for(key in on.elementMouseover){
							on.elementMouseover[key].call(this,d,i,'arc');
						}
					})
					.on('mouseout.d2b-mouseout',function(d,i){
						elem
							.transition()
								.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short)
								.attr('transform','scale(1)')
								.style('fill-opacity','')
						d2b.UTILS.removeTooltip();
						for(key in on.elementMouseout){
							on.elementMouseout[key].call(this,d,i,'arc');
						}
					})
					.on('click.d2b-click',function(d,i){
						for(key in on.elementClick){
							on.elementClick[key].call(this,d,i,'arc');
						}
					});
		});

		arcGroup.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		$$.selection.legend
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.innerWidth-$$.legend.computedWidth())/2+','+$$.innerHeight+')')

		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		$$.selection.group
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');


		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
