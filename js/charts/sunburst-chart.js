/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*sunburst chart*/
d2b.CHARTS.sunburstChart = function(){


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
	$$.currentChartData = { data: { partition:{}}};
	//formatting x values
	$$.xFormat = function(value){return value};
	//event object
	$$.on = d2b.CONSTANTS.DEFAULTEVENTS();
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
	//legend orientation 'top', 'bottom', 'left', or 'right'
	$$.legendOrientation = 'bottom';
	//legend data
	$$.legendData = {data:{items:[]}};
	//controls OBJ
	$$.controls = new d2b.UTILS.CONTROLS.controls();

	//breacrumbs OBJ
	$$.breadcrumbs = new d2b.UTILS.breadcrumbs();
	$$.breadcrumbs.scale(6)

	//partitioned sunburst data
	$$.partitionData;

	//current root node
	$$.currentRoot;

	//new data indicator
	$$.newData = true;

	//initialize the d3 arc shape
	$$.arc = d3.svg.arc()
			    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.start)); })
			    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, d.end)); })
			    .innerRadius(function(d) { return Math.max(0, d.inner); })
			    .outerRadius(function(d) { return Math.max(0, d.outer); });

	//radius scales
	$$.radius = {};

	//sunburst arc width scales
	$$.y = {
				children: d3.scale.pow().exponent(0.8),
				parents: d3.scale.linear()
			};

	//arc length scale
	$$.x = d3.scale.linear()
    .range([0, 2 * Math.PI]);


	//controls data
	$$.controlsData = {
				invert: {
					label: "Invert",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				sort: {
					label: "Sort",
					type: "checkbox",
					visible: false,
					enabled: false
				},
				hideLegend: {
					label: "Hide Legend",
					type: "checkbox",
					visible: false,
					enabled: false
				}
			};

	// private methods

	//find the ancesstors of a given node
	$$.getAncestors = function(node) {
	  var path = [];
	  var current = node;

	  while (current.parent) {
	    path.unshift(current);
	    current = current.parent;
	  }
    path.unshift(current);

	  return path;
	};

	//set arc fill color to coordinate with the closest 'top' parent
	$$.arcFill = function(d) {
		var sequence = $$.getAncestors(d).reverse();
		for(i=0;i<sequence.length;i++){
			if(sequence[i].top){
				return d3.rgb($$.color(sequence[i].name)).brighter(i*0.1);
			}
		}
		return $$.color(d.name)
	};

	//on arc mouseover highlight the parent tree
	$$.arcMouseover = function(d) {

		var sequence = $$.getAncestors(d);

		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) >= 0);
	              })
			.transition()
				.duration($$.animationDuration/7)
				.style('opacity',1)
		$$.selection.arcs.arc.filter(function(node) {
	                return (sequence.indexOf(node) < 0);
	              })
			.transition()
				.duration($$.animationDuration/7)
				.style('opacity',0.4)

		$$.updateBreadcrumbs(sequence);

	};

	//on children mouseover set tooltip
	$$.arcMouseover.children = function(d){
			$$.setSunburstTooltip(d,true);
	};

	//on parents mouseover set tooltip
	$$.arcMouseover.parents = function(d){
			$$.setSunburstTooltip(d,false);
	};

	//on sunburst mouseout reset breadcrumbs, tooltip, and arc highlighting
	$$.sunburstMouseout = function(d) {
		$$.resetBreadcrumbs();
	  $$.selection.arcs.arc
			.transition()
				.duration($$.animationDuration/5)
				.style('opacity',1);

		$$.resetSunburstTooltip();
	};

	//reset tooltip
	$$.resetSunburstTooltip = function(){
		$$.setSunburstTooltip($$.currentRoot, false);
	};

	//set tooltip
	$$.setSunburstTooltip = function(d, showPercent){
		var tspanName = d.name;
		var tspanValue = $$.xFormat(d.value);
		if(showPercent)
			tspanValue += ' / ' + d3.format(".2%")(d.value/$$.currentRoot.value);

		$$.selection.tooltip.text.selectAll('*').remove();

		$$.selection.tooltip.text
			.append('tspan')
				.text(tspanName);
		$$.selection.tooltip.text
			.append('tspan')
				.attr('y',30)
				.attr('x',0)
				.text(tspanValue);
	};

	//on arc click change root node to clicked node and update arcs
	$$.arcClick = function(d){
		$$.currentRoot = d;
		$$.updateArcs();
	};

	//get domain functions
	$$.getZoomParentDomain = function(d){
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

	$$.getZoomChildDomain = function(d, domain){
		if(!domain){domain = [1,0];}
		else{
			if(domain[0] > d.y)
				domain[0] = d.y;
			if(domain[1] < d.y + d.dy)
				domain[1] = d.y + d.dy;
		}

		if(d.children){
			d.children.forEach(function(child){
				return $$.getZoomChildDomain(child,domain);
			});
		}

		return domain;

	};

	//update arcs
	$$.updateArcs = function(){
		var sequence = $$.getAncestors($$.currentRoot);
		var paths = {};

		//filter parent paths
		paths.parents = $$.selection.arcs.arc.path
			.filter(function(node) {
        return (sequence.indexOf(node) >= 0);
      }).on('mouseover.updateTooltip',$$.arcMouseover.parents);


		//set scale domains
		$$.x.domain([$$.currentRoot.x,$$.currentRoot.x + $$.currentRoot.dx]);
		$$.y.parents.domain($$.getZoomParentDomain($$.currentRoot));
		$$.y.children.domain($$.getZoomChildDomain($$.currentRoot));

		var yDomain = {};

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.parents.each(function(d){
				this.newArc = {
					start: $$.x(d.x),
					end: $$.x(d.x + d.dx),
					inner: $$.y.parents(d.y),
					outer: $$.y.parents(d.y + d.dy)
				};
				if(!this.oldArc){
					this.oldArc = {
						start: this.newArc.start,
						end: this.newArc.start,
						inner: this.newArc.inner,
						outer: this.newArc.outer
					};
				}
		});

		//filter child paths
		paths.children = $$.selection.arcs.arc.path
			.filter(function(node) {
				return (sequence.indexOf(node) < 0);
			}).on('mouseover.updateTooltip',$$.arcMouseover.children);

		//update new arc
		//if old arc is not set, initialize as new arc
		paths.children.each(function(d){

			this.newArc = {
				start: $$.x(d.x),
				end: $$.x(d.x + d.dx),
				inner: $$.y.children(d.y),
				outer: $$.y.children(d.y + d.dy)
			};

			if(!this.oldArc){
				this.oldArc = {
					start: this.newArc.start,
					end: this.newArc.start,
					inner: this.newArc.inner,
					outer: this.newArc.outer
				};
			}
		});


		//exit arcs (fade/tween out and remove)
		$$.selection.arcs.arc.exit()
			.transition()
				.duration($$.animationDuration*1.5)
				.style('opacity',0)
				.remove()
			.select('path')
				.each(function(d) {
					this.newArc = {
						start: this.oldArc.start,
						end: this.oldArc.start,
						inner: this.oldArc.inner,
						outer: this.oldArc.outer
					};
				})
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				// .attrTween("d", $$.arcTween);

		//tween paths to new positions
		var pathTransition = $$.selection.arcs.arc.path
			.transition()
				.duration($$.animationDuration*1.5)
				.call(d2b.UTILS.TWEENS.arcTween, $$.arc)
				// .attrTween("d", $$.arcTween);


		//update oldArc to be newArc
		pathTransition
			.each("end",function(d) {
				this.oldArc = this.newArc;
			});

	};

	$$.setupNewData = function(){
		var partition;
		$$.newData = false;

		if($$.controlsData.sort.enabled){
			partition = d3.layout.partition()
						.value(function(d) { return d.size; });
		}else{
			partition = d3.layout.partition()
						.value(function(d) { return d.size; }).sort(function(a,b){return a.index - b.index;});
		}

		$$.partitionData = partition.nodes($$.currentChartData.partition);

		var topNodes = $$.partitionData.filter(function(d){return d.top;});
		if($$.controlsData.hideLegend.enabled){
			$$.legendData = {data:{items:[]}};
		}else{
			$$.legendData = {
				data:{
					items: d3
									.set(topNodes.map(function(d){return d.name;}))
									.values()
									.map(function(d){return {label:d};})
				}
			};
		}
	};

	// //arc tween from old arc to new arc
	// $$.arcTween = function(d){
	// 	var _self = this;
	// 	var interpolator = d3.interpolate(_self.oldArc,_self.newArc)
	// 	function tween(t){
	// 		_self.oldArc = interpolator(t);
	// 		return $$.arc(_self.oldArc);
	// 	}
	// 	return tween;
	// };

	//reset the breadcrumbs
	$$.resetBreadcrumbs = function(){
		var breadcrumbsData = {
			data:{
				items: []
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();
	};

	//save children indicies recursively for sorting/unsorting
	$$.saveIndicies = function(node){
		if(node.children){
			node.children.forEach(function(d,i){
				d.index = i;
				$$.saveIndicies(d);
			});
		}
	};

	//update the breadcrumbs based on a parent sequence
	$$.updateBreadcrumbs = function(sequence){
		var breadcrumbsData = {
			data:{
				items: sequence.map(function(d,i){return {label:d.name, key:i+','+d.name, data:d};})
			}
		};
		$$.breadcrumbs.data(breadcrumbsData).update();

		var breadcrumbsSelection = $$.breadcrumbs.selection();
		breadcrumbsSelection.breadcrumb.path
			.attr('stroke-width',2)
			.attr('stroke',function(d){return $$.arcFill(d.data);});

	};

	/*DEFINE CHART OBJECT AND MEMBERS*/
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
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);


	chart.data = function(chartData, reset){
		if(!arguments.length) return $$.currentChartData;
		if(reset){
			$$.currentChartData = {};
			$$.generateRequired = true;
		}
		$$.newData = true;
		$$.currentChartData = chartData.data;
		$$.saveIndicies($$.currentChartData.partition);
		$$.currentRoot = $$.currentChartData.partition;
		return chart;
	};

	//generate chart
	chart.generate = function(callback) {
		$$.generateRequired = false;

		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst')
				.on('mouseout.d2b-mouseout', $$.sunburstMouseout);


		$$.selection.arcs = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-arcs');

		$$.selection.tooltip = $$.selection.main
			.append('g')
				.attr('class','d2b-sunburst-tooltip');

		$$.selection.tooltip.text = $$.selection.tooltip
			.append('text');

		//create breadcrumbs container
		$$.selection.breadcrumbs = $$.selection.group
			.append('g')
				.attr('class','d2b-sunburst-breadcrumbs');

		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					if(d.key == 'sort' || d.key == 'hideLegend'){
						$$.newData = true;
					}
					chart.update();
				});

		//intialize new legend
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//intialize new legend
		$$.breadcrumbs
				.selection($$.selection.breadcrumbs);

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

		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}

		if($$.newData){
			$$.setupNewData();
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

		$$.selection.breadcrumbs
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')');

		//reposition the controls
		$$.selection.controls
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left + $$.innerWidth - $$.controls.computedWidth())+','+($$.forcedMargin.top)+')');

		$$.breadcrumbs.width($$.innerWidth).update();
		// $$.forcedMargin.top += Math.max($$.breadcrumbs.computedHeight(), $$.controls.computedHeight());
		$$.forcedMargin.top += $$.breadcrumbs.computedHeight();

		d2b.UTILS.CHARTS.HELPERS.updateLegend($$);

		$$.selection.main
			.transition()
				.duration($$.animationDuration)
				.attr('transform','translate('+($$.forcedMargin.left+$$.innerWidth/2)+','+($$.forcedMargin.top+$$.innerHeight/2)+')');

		$$.radius.outer = Math.min($$.innerWidth,$$.innerHeight)/2-20;
		$$.radius.inner = $$.radius.outer/3;


		if(!$$.controlsData.invert.enabled){
			$$.y.children.range([$$.radius.inner + 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.outer]);
			$$.y.parents.range([$$.radius.inner, $$.radius.inner + 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}else{
			$$.y.children.range([$$.radius.outer - 0.17 * ($$.radius.outer - $$.radius.inner), $$.radius.inner]);
			$$.y.parents.range([$$.radius.outer, $$.radius.outer - 0.13 * ($$.radius.outer - $$.radius.inner)]);
		}

		$$.selection.arcs.arc = $$.selection.arcs.selectAll("g.sunburst-arc")
		    .data($$.partitionData,function(d,i){
						if(d.key == 'unique')
							return Math.floor((1 + Math.random()) * 0x10000)
						else if(d.key && d.key != 'auto')
							return d.key;
						else
							return $$.getAncestors(d).map(function(d){return d.name}).join('-');
					})
		// sunburst_mouseout();
		var newArcs =	$$.selection.arcs.arc.enter().append("g")
			.attr('class','sunburst-arc')
			.style('opacity',0)
			.call(d2b.UTILS.bindElementEvents, $$, 'arc');

		var newPaths = newArcs.append("path")
				.on('mouseover.d2b-mouseover',$$.arcMouseover);

		$$.selection.arcs.arc
			.transition()
				.duration($$.animationDuration)
				.style('opacity',1);


		$$.selection.arcs.arc.path = $$.selection.arcs.arc.select('path')
				.style('fill',$$.arcFill);

		$$.selection.arcs.arc.path
				.on('click.d2b-click',$$.arcClick)
				.classed('d2b-pointer-element',true);

		$$.updateArcs();

		$$.resetSunburstTooltip();

		d3.timer.flush();

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
