/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*fact chart*/
d2b.CHARTS.factChart = function(){

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
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();

	$$.selectedFact = null;

	//for fact positioning
	$$.x = d3.scale.ordinal();
	$$.y = d3.scale.ordinal();
	$$.textScale = d3.scale.linear().range([15, 30]).domain([100, 1000]);
	$$.textScale.custom = function(value){
		var range = this.range();
		var translation = this(value);
		if(translation < range[0])
			return range[0];
		else if(translation > range[1])
			return range[1];
		return translation;
	};

	$$.updateFact = function(fact, textSize){
		fact
			.select('text.d2b-fact-label')
				.style('font-size', textSize+'px')
				.text(function(d){return d.label;})
				.each(function(d){d.labelWidth = this.getComputedTextLength();})
			.transition()
				.duration($$.animationDuration)
				.attr('y', -0.5*textSize);

		var barHeight = 3;
		fact
			.select('rect')
			.transition()
				.duration($$.animationDuration)
				.attr('width', function(d){return d.labelWidth;})
				.attr('height', barHeight)
				.attr('x', function(d){return -d.labelWidth/2;})
				.attr('y', -barHeight/2)
				.style('fill', '#ccc');

		fact
			.select('text.d2b-fact-value')
				.style('font-size', 2*textSize+'px')
				.text(function(d){return $$.xFormat(d.value);})
			.transition()
				.duration($$.animationDuration)
				.attr('y', 2*textSize);
	};

	$$.showMainFacts = function(){
		$$.selection.subFacts
			.style('pointer-events','none')
				.selectAll('*')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		var factCount = $$.currentChartData.facts.length;
		var textSize = $$.textScale.custom(Math.min($$.innerWidth, $$.innerHeight)/factCount);
		var grid = d2b.UTILS.grid($$.innerWidth, $$.innerHeight, factCount);

		$$.x.domain(d3.range(0, grid.columns)).rangeBands([0,$$.innerWidth]);
		$$.y.domain(d3.range(0, grid.rows)).rangeBands([0,$$.innerHeight]);

		$$.selection.fact = $$.selection.main.selectAll('g.d2b-fact').data($$.currentChartData.facts);
		var newFact = $$.selection.fact.enter()
			.append('g')
				.attr('class', 'd2b-fact');

		newFact.append('text').attr('class','d2b-fact-label');
		newFact.append('text').attr('class','d2b-fact-value');
		newFact.append('rect').attr('class','d2b-fact-bar');

		var factTransition = $$.selection.fact
				.style('pointer-events','all')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate('+($$.x(i%grid.columns) + $$.x.rangeBand()/2)+','+($$.y(Math.floor(i/grid.columns)) + $$.y.rangeBand()/2)+')';
				});

		$$.updateFact($$.selection.fact, textSize);

		$$.selection.fact.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity', 0)
				.remove();

		//setup sub-fact events if available
		$$.selection.fact.each(function(d){
			var elem = d3.select(this);
			if(!d.subFacts || d.subFacts.length < 1){
				elem
					.style('cursor', 'auto')
					.on('mouseover.d2b-mouseover',null)
					.on('mouseout.d2b-mouseout',null)
					.on('click.d2b-click',null);
				return;
			}


			elem
				.style('cursor', 'pointer')
				.on('mouseover.d2b-mouseover', function(){
					elem.select('rect')
						.transition()
							.duration($$.animationDuration/2)
							.style('fill', '#333');
				})
				.on('mouseout.d2b-mouseout', function(){
					elem.select('rect')
						.transition()
							.duration($$.animationDuration/2)
							.style('fill', '#ccc');
				})
				.on('click.d2b-click', function(){
					var elem = d3.select(this);
					if($$.selectedFact){
						$$.selection.fact
								.style('pointer-events','all')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',1);
						$$.selectedFact = null;
					}else{
						$$.selection.fact
								.style('pointer-events','none')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',0);
						elem
								.style('pointer-events','all')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',1);
						$$.selectedFact = elem;
						$$.selectedFact.data = d;
					}
					chart.update();
				});

		});

	};

	$$.showSubFacts = function(){
		var factCount = $$.currentChartData.facts.length;
		var textSize = $$.textScale.custom(Math.min($$.innerWidth, $$.innerHeight)/factCount);

		$$.selectedFact
			.transition()
				.duration($$.animationDuration)
				.attr('transform', 'translate('+$$.innerWidth/2+','+textSize+')');

		$$.updateFact($$.selectedFact, textSize);

		var topOffset = textSize * 3;
		$$.forcedMargin.top += topOffset;
		$$.innerHeight -= $$.forcedMargin.top;

		$$.selection.subFacts
				.style('pointer-events','all')
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform','translate(0,'+topOffset+')')

		var subFactCount = $$.selectedFact.data.subFacts.length;
		var grid = d2b.UTILS.grid($$.innerWidth, $$.innerHeight, subFactCount);
		$$.x.domain(d3.range(0, grid.columns)).rangeBands([0,$$.innerWidth]);
		$$.y.domain(d3.range(0, grid.rows)).rangeBands([0,$$.innerHeight]);

		$$.selection.subFact = $$.selection.subFacts.selectAll('g.d2b-sub-fact').data($$.selectedFact.data.subFacts);

		var newSubFact = $$.selection.subFact.enter()
			.append('g')
				.attr('class', 'd2b-sub-fact')
				.style('opacity',0)
				.attr('transform', function(d,i){
					return 'translate('+$$.x(i%grid.columns)+','+$$.y(Math.floor(i/grid.columns))+')';
				});

		newSubFact
			.append('g')
				.attr('class', 'd2b-sub-fact-chart')
				.each(function(d){
					this.pieChart = new d2b.CHARTS.pieChart();
					this.pieChart
						.select(this)
						.donutRatio(0.6)
						.controls({hideLegend:{enabled:true}});
				});

		newSubFact.append('text').attr('class', 'd2b-sub-fact-label');

		$$.selection.subFact
			.transition()
				.duration($$.animationDuration)
				.attr('transform', function(d,i){
					return 'translate('+$$.x(i%grid.columns)+','+$$.y(Math.floor(i/grid.columns))+')';
				})
			.delay($$.animationDuration/1.5)
				.style('opacity',0.9);

		$$.selection.subFact
			.select('g.d2b-sub-fact-chart')
				.each(function(d){
					this.pieChart
						.animationDuration($$.animationDuration)
						.width($$.x.rangeBand())
						.height($$.y.rangeBand())
						.data({data:{values:d.values}})
						.update();
				})

		$$.selection.subFact.select('text.d2b-sub-fact-label')
				.text(function(d){return d.label;})
			.transition()
				.duration($$.animationDuration)
				.attr('x', $$.x.rangeBand()/2)
				.attr('y', $$.y.rangeBand()/2);

	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

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
				// .on('click.d2b-click',function(){
				// 	if($$.selectedFact)
				// 		$$.selectedFact = null;
				// 	chart.update();
				// });

	  //create group container
	  $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-fact-chart');

		$$.selection.subFacts = $$.selection.main
			.append('g')
				.attr('class','d2b-sub-facts');

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
		// console.log('hi')
		//init forcedMargin
		$$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		if($$.selectedFact){
			$$.showSubFacts();
		}else{
			$$.showMainFacts();
		}

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
