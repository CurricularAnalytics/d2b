/**
 * d2b.chart.pie() returns a d2b
 * pie chart generator
 */
d2b.chart.pie = () => {

	const model = d2b.model.chart(update);
	const $$ = model.values();
	const chart = model.base();

	// configure legend
	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true)
		.on('mouseover.d2b-pie', d => d3.select(d.elem).each(arcMouseover))
		.on('mouseout.d2b-pie', d => d3.select(d.elem).each(arcMouseout))
		.on('click.d2b-pie', chart.update)
		.on('dblclick.d2b-pie', chart.update);

	// pie data layout
	const layout = d3.layout.pie().sort(null);

	// arc generator
	const arc = d3.svg.arc().outerRadius(d => d.outerRadius).innerRadius(d => d.innerRadius);

	// d2b pie generator
	const pie = d2b.svg.pie().arc(arc);

	// percent formater
	const percent = d3.format('%');

	// configure model properties
	model
		.addProp('donutRatio', 0)
		.addProp('startAngle', 0, null, d => layout.startAngle(d))
		.addProp('endAngle', 2 * Math.PI, null, d => layout.endAngle(d))
		.addProp('at', 'center center')
		.addProp('key', d => d.label, null, d => {
			$$.legend.key(d);
			pie.key(d);
		})
		.addProp('tooltip', d2b.tooltip().followMouse(true).html(d => `<b>${$$.label(d.data)}:</b> ${$$.value(d.data)}`))
		.addPropFunctor('showPercent', function (d) { return this.current > 0.03; })
		.addPropFunctor('center', null)
		.addPropFunctor('radius', null)
		.addPropFunctor('sort', null)
		.addPropFunctor('color', d => d2b.defaultColor(d.label), null, (d) => {
			$$.tooltip.color(dd => d3.rgb(d(dd.data)).darker(0.3));
			$$.legend.color(d);
			pie.color(d);
		})
		.addPropFunctor('value', d => d.value, null, d => layout.value(d))
		.addPropFunctor('label', d => d.label, null, d => $$.legend.label(d));

	// update chart
	function update () {
		// Sort and set legend data.
		$$.legend.data($$.data.sort($$.sort));

		// Build the chart template.
		model.build();

		// Filter and sort for current data.
		const data = $$.data.filter(d => !d.empty);
		const total = d3.sum(data, (d, i) => $$.value.call(chart, d, i) );

		// Select and enter pie chart 'g' element.
		const chartGroup = $$.svg.main.selectAll('.d2b-pie-chart').data([data]);
		const newChartGroup = chartGroup.enter()
			.append('g')
				.attr('class', 'd2b-pie-chart');

		// Compute radius.
		const radius = getRadius();

		// Transition the d2b pie chart.
		const transition = chartGroup
				.datum(d => {
					d = layout(d)
					d.forEach(dd => {
						dd.outerRadius = radius;
						dd.innerRadius = radius * $$.donutRatio;
					});
					return d;
				})
			.transition()
				.duration($$.duration)
				.call(pie);

		// For each arc in the pie chart assert the transitioning flag and store
		// the element node in data. Also setup hover and tooltip events;
		const arcGroup = chartGroup
			.selectAll('.d2b-pie-arc')
				.each(function (d) {
					this.transitioning = true;
					d.data.elem = this;
				})
				.on('mouseover.d2b-pie', arcMouseover)
				.on('mouseout.d2b-pie', arcMouseout)
				.call($$.tooltip);

		// Enter arc percent label if it doesn't already exist.
		const arcPercent = arcGroup.selectAll('.d2b-pie-arc-percent').data(d => [d]);
		arcPercent.enter()
			.append('g')
				.attr('class', 'd2b-pie-arc-percent')
			.append('text')
				.attr('y', 6)
				.text('test');

		// For each arc 'g' element translate teh current path state to the percent
		// label. Also, make sure the text current value is initalized at 0.
		arcGroup
				.each(function (d) {
					const elem = d3.select(this);
					const current = elem.select('.d2b-pie-arc-path').node().current;
					const percentGroup = elem.select('.d2b-pie-arc-percent')
					percentGroup.node().current = current;
					const percentText = percentGroup.select('text');
					const percentTextNode = percentText.node();
					percentText.node().current = percentText.node().current || 0;
				});

		// Grab the d2b pie arc transition. When it finishes clear the transition
		// state. Also tween the percent label position and value.
		const arcUpdate = transition
			.selectAll('.d2b-pie-arc')
				.each('end', function (d) {
					this.transitioning = false
				})
			.select('.d2b-pie-arc-percent')
				.call(d2b.centroidTween, arc)
			.select('text')
				.styleTween('opacity', function (d, i) {
					return t => ($$.showPercent.call(this, d.data, i))? 1 : 0;
				})
				.call(d2b.numberTween, d => d.value / total, percent);

		// Position the pie chart.
		const coords = chartCoords(radius);
		newChartGroup.attr('transform', `translate(${coords.x}, ${coords.y})`);
		chartGroup.transition()
			.duration($$.duration)
				.attr('transform', `translate(${coords.x}, ${coords.y})`);
	}

	// Position the pie chart according to the 'at' string (e.g. 'center left',
	// 'top center', ..). Unless a `$$.center` function is specified by the user
	// to return the {x: , y:} coordinates of the pie chart center.
	function chartCoords (radius) {
		let coords = $$.center.call(chart, $$.width, $$.height, radius);

		if (!coords) {
			let at = $$.at.split(' ');
			at = {x: at[1], y: at[0]};
			coords = {};
			switch (at.x) {
				case 'left':
					coords.x = radius;
					break;
				case 'center':
					coords.x = $$.width / 2
					break;
				default: // right
					coords.x = $$.width - radius;
			}

			switch (at.y) {
				case 'bottom':
					coords.y = $$.height - radius;
					break;
				case 'center':
					coords.y = $$.height / 2;
					break;
				default: // top
					coords.y = radius;
			}
		}
		return coords;
	}

	// Shrink arc on mouseout.
	function arcMouseout(d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		const radius = getRadius();
		d.outerRadius = radius;
		d3.select(this).transition().select('path').call(d2b.arcTween, arc);
	}

	// Grow arc on mouseover.
	function arcMouseover(d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		const radius = getRadius();
		d.outerRadius = radius * 1.03;
		d3.select(this).transition().select('path').call(d2b.arcTween, arc);
	}

	// Get radius from the minimum of the width and height. Unless a `$$.radius`
	// function is specified by the user to dynamically set the radius value.
	function getRadius() {
		return $$.radius.call(chart, $$.width, $$.height) ||
		 			 Math.min($$.width, $$.height) / 2;
	}

	return chart;
};
