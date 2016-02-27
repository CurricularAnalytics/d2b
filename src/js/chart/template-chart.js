/**
 * d2b.chart.template() returns a d2b
 * template chart object
 */
d2b.chart.template = function () {

	// pseudo inheritance from the chart model
	// inherit internal object and chart interface
	var { internal: $$, interface: chart } = d2b.model.chart({
		props: ['axis'],
		events: ['zoom'],
		update: update
	});

	// main chart update function
	function update() {

	}

	return chart;
};
