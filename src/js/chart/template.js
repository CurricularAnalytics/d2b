/**
 * d2b.chart.template() returns a d2b
 * template chart object
 */
d2b.chart.template = () => {

	const model = d2b.model.chart(update, ['zoomIn', 'zoomOut']);
	const $$ = model.values();
	const chart = model.base();

	model
 // 	 .addControl({
 // 		 key: 'control_1',
 // 		 label: 'Control 1',
 // 		 visible: true,
 // 		 enabled: false
 // 	 })
 // 	 .addControl({
 // 		 key: 'control_2',
 // 		 label: 'Control 2',
 // 		 visible: true,
 // 		 enabled: false
 // 	 })
 // 	 .addControl({
 // 		 key: 'control_3',
 // 		 label: 'Control 3',
 // 		 visible: true,
 // 		 enabled: false
 // 	 })
 // 	 .addControl({
 // 		 key: 'control_4',
 // 		 label: 'Control 4',
 // 		 visible: true,
 // 		 enabled: false
 // 	 });

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

	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true)
		.on('click', () => { console.log($$.legend.data()) });

	// main chart update function
	function update() {
		$$.legend
			.data([
		    {label: 'Item 1 Long One'},
		    {label: 'Item 2'},
		    {label: 'Item 3 Here is a Longer One'},
		    {label: 'Item 4 Another'},
		    {label: 'Item 5'},
		    {label: 'Item 6 More'},
		    {label: 'Item 7'}
			]);

			// console.log($$.legend.data())

		// console.log($$.legend.data())
		// console.log(chart.control('hideLegend'))

		model.build();

	}

	return chart;
};
