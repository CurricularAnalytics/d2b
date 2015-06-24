/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*fact chart*/
d2b.CHARTS.funnelChart = function(){

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

	$$.coneHeight = d3.scale.linear();
	$$.coneCurve = 15;
	$$.heightCoeff = 0.9;

	$$.funnel = function(){

		$$.coneHeight
			.range([0, $$.innerHeight*$$.heightCoeff])
			.domain([0, d3.sum($$.currentChartData.values,function(d){return d.value;})]);
		var coneTopMaxWidth = $$.innerWidth;
		var coneBottomMinWidth = $$.innerWidth/4;
		var pinchCoeff = (coneTopMaxWidth - coneBottomMinWidth)/($$.innerHeight*$$.heightCoeff);

		var currentConeWidth = coneTopMaxWidth;
		var currentY = 0;

		$$.currentChartData.values.forEach(function(d){

			var height = $$.coneHeight(d.value);
			var topWidth = currentConeWidth;
			if(d.pinched){
				currentConeWidth -= height*pinchCoeff
			}
			var bottomWidth = currentConeWidth;

			var x = {
				start:$$.innerWidth/2-topWidth/2,
				end:$$.innerWidth/2+topWidth/2,
				mid:$$.innerWidth/2
			};
			d.top = "M"+x.start+",0 Q"+x.mid+","+$$.coneCurve+" "+x.end+",0 M"+x.end+",0 Q"+x.mid+","+-$$.coneCurve+" "+x.start+",0";

			x = {
				start:$$.innerWidth/2-bottomWidth/2,
				end:$$.innerWidth/2+bottomWidth/2,
				mid:$$.innerWidth/2
			};
			d.bottom = "M"+x.start+","+height+" Q"+x.mid+","+(height+$$.coneCurve)+" "+x.end+","+height+" M"+x.end+","+height+" Q"+x.mid+","+(height-$$.coneCurve)+" "+x.start+","+height;

			d.center = ($$.innerWidth/2-topWidth/2)+","+0+" "+
								 ($$.innerWidth/2-bottomWidth/2)+","+height+" "+
								 ($$.innerWidth/2+bottomWidth/2)+","+height+" "+
								 ($$.innerWidth/2+topWidth/2)+","+0+" ";

			d.y = currentY;
			d.height = height;
			d.width = bottomWidth;
			currentY += height;
		});

		return $$.currentChartData.values;
	};

	$$.showText = function(d){
// console.log(this)
		this.select('.d2b-cone-note-group')
				.style('opacity',0)
				.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height)+')';})
		this.select('.d2b-cone-text-group')
				.style('opacity',1)
				.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height/2 + $$.coneCurve - 15)+')';})
	};

	$$.showNote = function(d){
			this.select('.d2b-cone-note-group')
					.style('opacity',1)
					.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+($$.coneCurve*1.5 + (d.height-d.noteHeight)/2)+')';})
			this.select('.d2b-cone-text-group')
					.style('opacity',0)
					.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(0)+')';})
	};

	$$.coneMouseover = function(d){
		var _self = this;
		var coneFound = false;
		var mouseoverPadding = 20;
		$$.selection.funnel.cone.each(function(){
			var transition = d3.select(this)
					.transition()
						.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short*2)
			if(this == _self){
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y)+')';})
						.call($$.showNote);
				coneFound = true;
			}else if(!coneFound){
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y+mouseoverPadding)+')';});
			}else{
				transition
						.attr('transform',function(d){return 'translate(0,'+(d.y-mouseoverPadding)+')';});
			}
		})
	};

	$$.coneMouseout = function(d){
		$$.selection.funnel.cone
			.transition()
				.duration(d2b.CONSTANTS.ANIMATIONLENGTHS().short*2)
				.call($$.showText)
				.attr('transform',function(d){return 'translate(0,'+(d.y)+')';});
	};

	$$.enterCones = function(){
		var newCone = $$.selection.funnel.cone.enter()
			.append('g')
				.attr('class','d2b-cone')
				.style('opacity',0)
				.call($$.events.addElementDispatcher, 'main', 'd2b-cone')
				.on('mouseout.d2b-mouseout',$$.coneMouseout)
				.on('mouseover.d2b-mouseover',$$.coneMouseover);

		newCone
			.append('path')
				.attr('class','d2b-cone-bottom');
		newCone
			.append('polygon')
				.attr('class','d2b-cone-center');
		newCone
			.append('path')
				.attr('class','d2b-cone-top');

		var newConeNoteGroup = newCone
			.append('g')
				.attr('class','d2b-cone-note-group');

		var newConeNote = newConeNoteGroup
			.append('text')
				.attr('class','d2b-cone-note');

		var newConeTextGroup = newCone
			.append('g')
				.attr('class','d2b-cone-text-group');

		var newConeText = newConeTextGroup
			.append('text')
				.attr('class','d2b-cone-text');

		newConeText
			.append('tspan')
				.attr('class','d2b-cone-label');

		newConeText
			.append('tspan')
				.attr('class','d2b-cone-value')
				.attr('x',0)
				.attr('y',20);

		$$.selection.funnel.cone.bottom = $$.selection.funnel.cone.select('.d2b-cone-bottom');
		$$.selection.funnel.cone.top = $$.selection.funnel.cone.select('.d2b-cone-top');
		$$.selection.funnel.cone.center = $$.selection.funnel.cone.select('.d2b-cone-center');
		$$.selection.funnel.cone.textGroup = $$.selection.funnel.cone.select('.d2b-cone-text-group');
		$$.selection.funnel.cone.text = $$.selection.funnel.cone.select('.d2b-cone-text');
		$$.selection.funnel.cone.label = $$.selection.funnel.cone.select('.d2b-cone-label');
		$$.selection.funnel.cone.value = $$.selection.funnel.cone.select('.d2b-cone-value');
		$$.selection.funnel.cone.noteGroup = $$.selection.funnel.cone.select('.d2b-cone-note-group');
		$$.selection.funnel.cone.note = $$.selection.funnel.cone.select('.d2b-cone-note');

		if(newCone.size()){
			$$.selection.funnel.cone.each(function(){
				this.parentNode.appendChild(this);
			});
		}

	};

	$$.updateCones = function(){

		$$.selection.funnel.transition()
			.duration($$.animationDuration)
				.attr('transform',function(){return 'translate(0,'+$$.innerHeight*(1-$$.heightCoeff)/2+')';});

		var coneTransition = $$.selection.funnel.cone
			.transition()
				.duration($$.animationDuration)
				.attr('transform',function(d){return 'translate(0,'+d.y+')';})
				.style('opacity',1)
				.call($$.showText);

		// coneTransition.select('.d2b-cone-note-group')
		// 		.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+($$.coneCurve*1.5)+')';})
		$$.selection.funnel.cone.note
				.attr('dy',0)
				.attr('y',0)
				.text(function(d){return d.note;})
				.each(function(d){
					d3.select(this)
						.call(d2b.UTILS.textWrap, d.width-10);
					d.noteHeight = this.getBBox().height;
				})

		// coneTransition.select('.d2b-cone-text-group')
		// 		.attr('transform',function(d){return 'translate('+$$.innerWidth/2+','+(d.height/2 + $$.coneCurve - 15)+')';})
		coneTransition.select('.d2b-cone-label')
				.text(function(d){return d.label;});
		coneTransition.select('.d2b-cone-value')
				.text(function(d){return $$.xFormat(d.value);});

		coneTransition.select('.d2b-cone-bottom')
				.attr('d',function(d){return d.bottom;})
				.style('fill',function(d){return $$.color(d.label);});

		coneTransition.select('.d2b-cone-center')
				.attr('points',function(d){return d.center;})
				.style('fill',function(d){return $$.color(d.label);});

		coneTransition.select('.d2b-cone-top')
				.attr('d',function(d){return d.top;})
				.style('fill',function(d){return d3.rgb($$.color(d.label)).darker(1.2);});
	};

	$$.exitCones = function(){
		$$.selection.funnel.cone.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.coneCurve = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'coneCurve');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.events(chart, $$);

	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
		}

		$$.currentChartData = chartData.data;

		return chart;
	};

	//chart generate
	chart.generate = function(callback) {
		$$.generateRequired = false;

		//clean container
	  $$.selection.selectAll('*').remove();

	  //create svg
	  $$.selection.svg = $$.selection
	    .append('svg')
	      .attr('class','d2b-svg d2b-container')

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-funnel-chart');

		$$.selection.funnel = $$.selection.main
			.append('g')
				.attr('class','d2b-funnel');

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

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		$$.selection.funnel.cone = $$.selection.funnel.selectAll('g.d2b-cone').data($$.funnel($$.currentChartData.values)._reverse(),function(d,i){
			if(d.key == 'unique')
				return Math.floor((1 + Math.random()) * 0x10000);
			else if(d.key && d.key != 'auto')
				return d.key;
			else
				return d.label;
		});

		$$.enterCones();
		$$.updateCones();
		$$.exitCones();

		d3.timer.flush();

		$$.events.dispatch("update", $$.selection)

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
