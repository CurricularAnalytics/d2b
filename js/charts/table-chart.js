/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*table chart*/
d2b.CHARTS.tableChart = function(){

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

	$$.selectedRow = null;

	$$.updateSubFacts = function(row, subFacts, subFactsData, x, padding, height, showValueLabels){
		var subFact = subFacts.selectAll('g.d2b-table-subFact').data(subFactsData);

		var newSubFact = subFact.enter()
			.append('g')
				.attr('class','d2b-table-subFact');

		newSubFact.append('g').attr('class','d2b-table-subFact-chart');
		newSubFact.append('text').attr('class','d2b-table-subFact-label');

		$$.updateSubFact(subFact, x, padding, height, showValueLabels);

		subFact.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();

		return subFact;
	};

	$$.updateSubFact = function(subFact, x, padding, height, showValueLabels){
		subFact.select('text.d2b-table-subFact-label')
				.text(function(d){return d.label})
			.transition()
				.duration($$.animationDuration)
				.attr('y', -4)
				.attr('x',(x.rangeBand()-padding)/2)


		subFact.each(function(d){

					d.x = d3.scale.linear();

					d.x
						.domain([0, d3.sum(d.values, function(d){return d.value;})])
						.range([0, x.rangeBand()-padding]);

					var currentX = 0;
					d.values.forEach(function(value){
						value.xPos = currentX;
						value.width = d.x(value.value);
						currentX += value.width;
					});

				})

		var subFactValue = subFact.select('g').selectAll('g').data(function(d){return d.values;});

		var newSubFactValue = subFactValue.enter()
			.append('g');

		newSubFactValue.append('rect');
		newSubFactValue.append('text').attr('class','d2b-subFact-value-label');

		var subFactValueTransition = subFactValue
				.call(d2b.UTILS.tooltip, function(d){return '<b>'+d.label+'</b>';},function(d){return $$.xFormat(d.value);})
			.transition()
				.duration($$.animationDuration);

		subFactValueTransition
			.select('rect')
				.attr('x', function(d){return d.xPos;})
				.attr('width', function(d){return d.width;})
				.attr('height', height)
				.style('fill', function(d){return $$.color(d.label);});

		subFactValueTransition
			.select('text.d2b-subFact-value-label')
				.style('opacity',+showValueLabels)
				.attr('y', height/2 + 4)
				.attr('x', function(d){return d.xPos + d.width/2;})
				.text(function(d) { return d.label.substring(0, d.width / 10); });


		subFactValue.exit()
			.transition()
				.duration($$.animationDuration)
				.style('opacity',0)
				.remove();
	};

	$$.showRow = function(){

		$$.selection.table.row = $$.selection.table.selectAll('g.d2b-table-row').data($$.currentChartData.rows);

		$$.selection.table.row.select('tspan.d2b-label').text(function(d){return d.label+' ';});
		$$.selection.table.row.select('tspan.d2b-value').text(function(d){return $$.xFormat(d.value);});

		$$.selectedRow.data = $$.selectedRow[0][0].__data__

		$$.forcedMargin.top += 20;
		$$.innerHeight = $$.outerHeight - $$.forcedMargin.top;
		var rowTransition = $$.selectedRow
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate(0,'+$$.forcedMargin.top+')'
				});
		rowTransition.select('rect.d2b-row-background')
			.attr('height',$$.innerHeight);

		var subFacts = $$.selectedRow.select('.d2b-table-subFacts');

		var x = d3.scale.ordinal();

		x
			.domain([0])
			.rangeBands([0, $$.innerWidth]);

		var y = d3.scale.ordinal();

		y
			.domain(d3.range(0, $$.selectedRow.data.subFacts.length))
			.rangeBands([5, $$.innerHeight]);
		$$.updateSubFacts($$.selectedRow, subFacts, $$.selectedRow.data.subFacts, x, 0, y.rangeBand()/2, true)
			.transition()
				.duration($$.animationDuration)
				.attr('transform', function(d,i){return 'translate(0,'+(y(i) + y.rangeBand()/2)+')';});
	};

	$$.showTable = function(){

		var padding = $$.innerWidth * 0.03;

		var rowHeight = $$.innerHeight / $$.currentChartData.rows.length;

		$$.selection.table.row = $$.selection.table.selectAll('g.d2b-table-row').data($$.currentChartData.rows);
		var newTableRow = $$.selection.table.row.enter()
			.append('g')
				.attr('class','d2b-table-row');

		newTableRow.append('rect')
			.attr('class', 'd2b-row-background');

		newTableRow.append('rect')
			.attr('class', 'd2b-row-border');

		var newTableRowText = newTableRow.append('text')
			.attr('class','d2b-table-row-label');

		newTableRowText.append('tspan').attr('class','d2b-label');
		newTableRowText.append('tspan').attr('class','d2b-value');

		newTableRow.append('g').attr('class', 'd2b-table-subFacts')

		var rowTransition = $$.selection.table.row
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1)
				.attr('transform', function(d,i){
					return 'translate(0,'+(i*rowHeight + rowHeight/2)+')'
				});

		rowTransition.select('rect.d2b-row-border')
			.attr('width',$$.innerWidth)
			.attr('height',1.5)
			.attr('y',5);

		rowTransition.select('rect.d2b-row-background')
			.attr('width',$$.innerWidth)
			.attr('height',30)
			.attr('y',-22);

		var longestText = 0;

		$$.selection.table.row.select('tspan.d2b-label').text(function(d){return d.label+' ';});
		$$.selection.table.row.select('tspan.d2b-value').text(function(d){return $$.xFormat(d.value);});

		$$.selection.table.row.select('text.d2b-table-row-label')
			.each(function(){longestText = Math.max(this.getComputedTextLength(), longestText);});

		$$.selection.table.row
			.style('pointer-events','all')
			.each(function(d){
				var row = d3.select(this);
				var x = d3.scale.ordinal();
				var text = row.select('text.d2b-table-row-label');
				var subFacts = row.select('g.d2b-table-subFacts');

				if(d.subFacts.length > 0){
					text
						.transition()
							.duration($$.animationDuration)
							.style('text-anchor','start')
							.attr('x',0);
					row.style('cursor','pointer');
				}else{
					text
						.transition()
							.duration($$.animationDuration)
							.style('text-anchor','middle')
							.attr('x',$$.innerWidth/2);
					row.style('cursor','auto');
				}


				x
					.domain(d3.range(0, d.subFacts.length))
					.rangeBands([longestText + padding, $$.innerWidth + padding]);

				$$.updateSubFacts(row, subFacts, d.subFacts, x, padding, 5, false)
					.transition()
						.duration($$.animationDuration)
						.attr('transform', function(d,i){return 'translate('+x(i)+',-2)';})
			})
			.on('click.d2b-click', function(d,i){
				var elem = d3.select(this);
				if($$.selectedRow){
					$$.selectedRow = null;
				}else{

					if(d.subFacts.length > 0){
						$$.selection.table.row
								.style('pointer-events','none')
							.transition()
								.duration($$.animationDuration)
								.style('opacity',0);
						elem
								.style('pointer-events','all');
						$$.selectedRow = elem;
						// $$.selectedRow.data = d;
					}
				}
				chart.update();

			});

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

		$$.currentChartData.rows.forEach(function(d){
			d.subFacts = d.subFacts || [];
		});

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
	  // $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.forcedMargin = {top:10,left:20, right:20,bottom:10};
	  $$.selection.group = $$.selection.svg.append('g')
	      .attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-table-chart');

		$$.selection.table = $$.selection.main
			.append('g')
				.attr('class','d2b-table')

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
		// $$.forcedMargin = d2b.CONSTANTS.DEFAULTFORCEDMARGIN();
		$$.forcedMargin = {top:10,left:20, right:20,bottom:10};
		$$.outerWidth = $$.width;
		$$.outerHeight = $$.height;

		//init svg dimensions
		$$.selection.svg
				.attr('width',$$.width)
				.attr('height',$$.height);

		d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

		if($$.selectedRow){
			$$.showRow();
		}else{
			$$.showTable();
		}

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
