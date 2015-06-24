/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

/*map chart*/
d2b.CHARTS.mapChart = function(){

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
	//legend OBJ
	$$.legend = new d2b.UTILS.LEGENDS.legend();
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

	$$.filterSet = {};

	$$.topoPaths = [
		{key:'countries',file:'countries.topo.json'},
		{key:'states',file:'states.topo.json'}
		// {key:'counties',file:'counties.topo.json'},
		// {key:'zip_codes',file:'zip_codes.csv',type:'csv'}
	];

	$$.topoData = {};
	$$.filteredTopoData = {};
	$$.topoDataReady = false;
	$$.projection = "equirectangular";

	$$.drawCountries = function(path){

		$$.selection.countries.country = $$.selection.countries.selectAll('g.d2b-country')
			.data($$.filteredTopoData.countries.features, function(d){return d.properties.GU_A3;});

		$$.selection.countries.country
				.enter()
			.append("g")
				.attr('class','d2b-country')
				.style("opacity",0)
			.append("path");

		$$.selection.countries.country.path = $$.selection.countries.country.select('path');

		$$.selection.countries.country
			.transition()
				.duration($$.animationDuration)
				.style("opacity",1)
			.select('path')
				.attr("d", path)
				.style("fill", "black")

		$$.selection.countries.country
				.exit()
			.transition()
				.duration($$.animationDuration)
				.style("opacity",0)
				.remove();


		console.log($$.selection.countries.node().getBBox());
	};

	$$.pathFit = function(feature){
		var center = d3.geo.centroid(feature);
		var scale  = 150;
		var offset = [$$.innerWidth/2,$$.innerHeight/2];
		var projection = d3.geo[$$.projection]()
					.scale(scale)
					.translate(offset);

		if($$.projection != "albersUsa")
			projection.center(center);

		var path = d3.geo.path().projection(projection);

		var bounds  = path.bounds(feature);
		var hscale  = scale * $$.innerWidth / (bounds[1][0]-bounds[0][0]);
		var vscale  = scale * $$.innerHeight / (bounds[1][1]-bounds[0][1]);
		var scale   = (hscale < vscale) ? hscale : vscale;
		var offset  = [$$.innerWidth - (bounds[0][0] + bounds[1][0])/2,
										$$.innerHeight - (bounds[0][1] + bounds[1][1])/2];

		projection
			.scale(scale)
			.translate(offset);

		if($$.projection != "albersUsa")
			projection.center(center);

		path = path.projection(projection);

		return path;
	};

	$$.setTopoData = function(callback){
		//data is not ready
		$$.topoDataReady = false;
		//initiate file load
		d2b.UTILS.load($$.topoPaths, function(data){
			//save data feature sets
			$$.topoData = data;

			//clone the topo data
			$$.filteredTopoData = JSON.parse(JSON.stringify($$.topoData));

			//filter states and countries using the filter set
			$$.filteredTopoData.states.objects.states_simplified.geometries
			 	= $$.topoData.states.objects.states_simplified.geometries
					.filter(function(geo){
						return Object.keys($$.filterSet.states || {}).map(function(key){
											return $$.filterSet.states[key].split(',').indexOf(geo.properties[key]) > -1;
										})
											.concat([true])
											.every(function(test){return test == true;});
					});
			$$.filteredTopoData.states = topojson.feature($$.filteredTopoData.states, $$.filteredTopoData.states.objects.states_simplified)

			$$.filteredTopoData.countries.objects.countries_simplified.geometries
			 	= $$.topoData.countries.objects.countries_simplified.geometries
					.filter(function(geo){
						return Object.keys($$.filterSet.countries || {}).map(function(key){
											return $$.filterSet.countries[key].split(',').indexOf(geo.properties[key]) > -1;
										})
											.concat([true])
											.every(function(test){return test == true;});
					});
			$$.filteredTopoData.countries = topojson.feature($$.filteredTopoData.countries, $$.filteredTopoData.countries.objects.countries_simplified)

			//data is now ready
			$$.topoDataReady = true;

			//if an update has been queued and is waiting on data, update the chart.
			if($$.updateRequired){
				chart.update();
				$$.updateRequired = false;
			}

			//if callback present, invoke
			if(callback)
				callback();
		});
	};

	/*DEFINE CHART OBJECT AND CHART MEMBERS*/
	var chart = {};

	//chart setters
	chart.select = 							d2b.UTILS.CHARTS.MEMBERS.select(chart, $$, function(){ $$.generateRequired = true; });
	chart.selection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'selection', function(){ $$.generateRequired = true; });
	chart.width = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'width');
	chart.height = 							d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'height');
	chart.projection = 					d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'projection');
	chart.animationDuration = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'animationDuration', function(){
		$$.legend.animationDuration($$.animationDuration);
		$$.controls.animationDuration($$.animationDuration);
	});
	chart.legendOrientation = 	d2b.UTILS.CHARTS.MEMBERS.prop(chart, $$, 'legendOrientation');
	chart.xFormat = 						d2b.UTILS.CHARTS.MEMBERS.format(chart, $$, 'xFormat');
	chart.controls = 						d2b.UTILS.CHARTS.MEMBERS.controls(chart, $$);
	chart.on = 									d2b.UTILS.CHARTS.MEMBERS.on(chart, $$);

	chart.filter = function(filters){
		$$.filterSet = filters;
		$$.setTopoData();
		return chart;
	};

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

		//empties $$.selection and appends ($$.selection.svg, $$.selection.group, $$.selection.legend, $$.selection.controls)
		d2b.UTILS.CHARTS.HELPERS.generateDefaultSVG($$);

		//init legend properties
		$$.legend
				.color($$.color)
				.selection($$.selection.legend);

		//init control properties
		$$.controls
				.selection($$.selection.controls)
				.on('change',function(d,i){
					$$.controlsData[d.key].enabled = d.state;
					chart.update();
				});

		//init main chart container
		$$.selection.main = $$.selection.group
			.append('g')
				.attr('class','d2b-main-chart');

		$$.selection.countries = $$.selection.main
			.append('g')
				.attr('class','d2b-countries');

		//fetch topo files for countries and states
		$$.setTopoData(function(){
			var temp = $$.animationDuration;
			chart
					.animationDuration(0)
					.update(callback)
					.animationDuration(temp);

		});

		return chart;
	};



	//chart update
	chart.update = function(callback){
		//if generate required call the generate method
		if($$.generateRequired){
			return chart.generate(callback);
		}
		// console.log('update')
		if(!$$.topoDataReady){
			$$.updateRequired = true;}
		else{
console.log($$.filteredTopoData.countries)
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

console.log('draw')
			var path = $$.pathFit($$.filteredTopoData.countries);

			$$.selection.main
				.transition()
					.duration($$.animationDuration)
					.attr('transform', 'translate('+$$.forcedMargin.left+','+$$.forcedMargin.top+')')

			d2b.UTILS.CHARTS.HELPERS.updateDimensions($$);

			$$.drawCountries(path);

			d3.timer.flush();

		}

		if(callback)
			callback();

		return chart;
	};

	return chart;
};
