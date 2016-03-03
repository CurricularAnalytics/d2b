/**
 * d2b.chart.template() returns a d2b
 * template chart object
 */
d2b.chart.template = () => {

	const model = d2b.model.chart(update, ['zoomIn', 'zoomOut']);
	const $$ = model.values();
	const chart = model.base();

	model
	 .addControl({
		 key: 'hideLegend',
		 label: 'Hide Legend',
		 visible: false,
		 enabled: false
	 })
 	 .addControl({
 		 key: 'control_1',
 		 label: 'Control 1',
 		 visible: true,
 		 enabled: false
 	 })
 	 .addControl({
 		 key: 'control_2',
 		 label: 'Control 2',
 		 visible: true,
 		 enabled: false
 	 })
 	 .addControl({
 		 key: 'control_3',
 		 label: 'Control 3',
 		 visible: true,
 		 enabled: false
 	 })
 	 .addControl({
 		 key: 'control_4',
 		 label: 'Control 4',
 		 visible: true,
 		 enabled: false
 	 })
	// 	.removeProp('height')
	// 	.removeProp('data')
	// 	.addProp('data', function(_) {
	// 	});

	// chart.control('hideLegend')
	// chart.control('hideLegend', {enabled: true});

	// model.legend
	// 	.active(true)
	// 	.on('empty', ..)
	// 	.on('fill', ..);

	// main chart update function
	function update() {

		// model.legend.data();
		console.log(chart.control('hideLegend'))

		model.build();

	}

	return chart;
};
