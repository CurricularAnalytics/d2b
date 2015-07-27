/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*pie chart*/
d2b.CHARTS.pieChart = function(){

	//private store
	var $$ = {};

	//user set width
	$$.width = d2b.CONSTANTS.DEFAULTWIDTH();
	//user set height
	$$.height = d2b.CONSTANTS.DEFAULTHEIGHT();
	//inner/outer height/width and margin are modified as sections of the chart are drawn
	$$.innerHeight = $$.height;
	$$.innerWidth = $$.width;
	$$.outerHeight = $$.height;
	$$.outerWidth = $$.width;
	$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	//force chart regeneration on next update()
	$$.generateRequired = true;
	//d3.selection for chart container
	$$.selection = d3.select('body');
	//default animation duration
	$$.animationDuration = d2b.CONSTANTS.ANIMATIONLENGTHS().normal;
	//color hash to be used
	$$.color = d2b.CONSTANTS.DEFAULTCOLOR();
	//carries current data set
	$$.currentChartData = {};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.events = d2b.UTILS.chartEvents();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	$$.legend.active(true);
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();
	//controls data
	$$.controlsData = {
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	$$.tooltip = function(d){
		return "<b>"+d.label+":</b> "+$$.xFormat(d.value)+" ("+d3.round(100*d.value/$$.pieTotal, 1)+"%)";
	};

	$$.donutRatio = 0;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); });

	$$.arcText = d3.svg.arc();

	$$.pie = d3.layout.pie()
			.value(function(d){
				var value = ($$.persistentData.hiddenArcs[d.key])? 0 : d.value;
				$$.pieTotal += value;
				return value;
			})
			.sort(null);
	$$.pieTotal = 1;

	$$.persistentData = {
		focusedArc:null,
		hiddenArcs:{}
	};

	$$.arcKey = function(d,i){
		if(d.key == 'unique')
			return Math.floor((1 + Math.random()) * 0x10000);
		else if(d.key && d.key != 'auto')
			return d.key;
		else
			return d.label;
	};

	$$.arcEnter = function(){
		//set radius
		$$.r = 0.93*(Math.min($$.outerWidth,$$.outerHeight)/2);

		//init pie total
		$$.pieTotal = 0;

		$$.selection.pie.datum($$.currentChartData.values)
		$$.selection.pie.arc = $$.selection.pie.selectAll('g').data($$.pie, function(d){return d.data.key});

		//arc enter
		var newArc = $$.selection.pie.arc.enter()
			.append('g')
				.attr('class','d2b-arc')
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-arc')
				.call(d2b.UTILS.bindToolip, $$.tooltip, function(d){return d.data;});

		//create arc path
		newArc.append('path')
			.each(function(d){
				//init old Arc
				this.oldArc = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});

		//create arc text
		newArc.append('text')
			.attr('y', 6)
			.each(function(d){
				//init old position arc
				this.oldPosition = {start:d.startAngle, end: d.startAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
			});
	};

	$$.arcUpdate = function(){

		//update arc container
		$$.selection.pie.arc
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1);

		//update arc path
		$$.selection.pie.arc.path = $$.selection.pie.arc.select('path')
				.each(function(d){
					//update newArc object
					this.newArc = {
						start:d.startAngle,
						end:d.endAngle,
						inner:$$.r*$$.donutRatio,
						outer:(d.data.key == $$.persistentData.focusedArc)? $$.r*1.04 : $$.r
					};
				})
				.style('fill',function(d){
					return d2b.UTILS.getColor($$.color, 'label')(d.data);
				})
				.on('mouseover.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = d.data.key;
					chart.update();
				})
				.on('mouseout.d2b-mouseover',function(d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})

		$$.selection.pie.arc.path.transition = $$.selection.pie.arc.path
			.transition()
				.duration($$.animationDuration/1.5)
				.style('opacity',1)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)

		// arc text
		$$.selection.pie.arc.text = $$.selection.pie.arc.select('text')
			.transition()
				.duration($$.animationDuration/1.5)
				.tween("text", function(d) {
					//tween percent value
					var _self = this;
					if(!_self._current)
						_self._current = 0;
	        var i = d3.interpolate(_self._current, d.data.value/$$.pieTotal);
	        return function(t) {
						_self._current = i(t);
						_self.textContent = d3.format('%')(i(t));
	        };
		    })
				.style('opacity',function(d){
					return ((d.data.value/$$.pieTotal<0.03)||$$.persistentData.hiddenArcs[d.data.key])? 0 : 1;
				})
				.attrTween("transform", function(d) {
					//tween centroid position
					var _self = this;
					//update new position arc object
					_self.newPosition = {start:d.startAngle, end:d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
					var i = d3.interpolate(_self.oldPosition, _self.newPosition);
					return function(t){
						_self.oldPosition = i(t);
						return "translate("+$$.arc.centroid(_self.oldPosition)+")";
					};
				});
	};

	$$.arcExit = function(){
		$$.selection.pie.arc.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d){
					this.newArc = {start:d.endAngle, end: d.endAngle, inner:$$.r*$$.donutRatio, outer:$$.r};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc);
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);
	chart.color = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'color', function(){
		$$.legend.color($$.color);
	});
	chart.tooltip = 						d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'tooltip');
	chart.donutRatio = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'donutRatio');

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		$$.currentChartData.values.forEach(function(d){
			d.key = $$.arcKey(d);
		});

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend)
				.on('element-mouseover.d2b-mouseover',function(t,d){
					$$.persistentData.focusedArc = d.key;
					chart.update();
				})
				.on('element-mouseout.d2b-mouseover',function(t,d){
					$$.persistentData.focusedArc = null;
					chart.update();
				})
				.on('element-click',function(t,d){
					$$.persistentData.hiddenArcs[d.key] = !$$.persistentData.hiddenArcs[d.key];

					var allHidden = true;

					$$.currentChartData.values.forEach(function(d){
						if(allHidden == true && !$$.persistentData.hiddenArcs[d.key])
							allHidden = false;
					});
					//if all types/graphs are hidden, show them all
					if(allHidden){
						for(var key in $$.persistentData.hiddenArcs)
							$$.persistentData.hiddenArcs[key] = false;
					}


					chart.update();
				})
				.on('element-dblclick',function(t,d){
					//on legend dbl click hide all but clicked arc
					$$.currentChartData.values.forEach(function(d2){
						$$.persistentData.hiddenArcs[d2.key] = d2.key != d.key;
					})
					chart.update();
				});

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		$$.selection.pie = $$.selection.group
			.append('g')
				.attr('class','d2b-pie-chart');

		//auto update chart
		var temp = $$.animationDuration;
		chart
				.animationDuration(0)
				.update(callback)
				.animationDuration(temp);

		return chart;
	};

	//chart update
	chart.update = function(callback){

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
			$$.legendData = {
				data:{
					items:	$$.currentChartData.values.map(function(d){
						d.open = $$.persistentData.hiddenArcs[d.key];
						return d;
					})
				}
			};
		}
		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.pie
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left + $$.innerWidth/2)+','+($$.forcedMargin.top + $$.innerHeight/2)+')');

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.arcEnter();
		$$.arcUpdate();
		$$.arcExit();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection);

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
