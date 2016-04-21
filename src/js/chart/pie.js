import {default as modelChart} from '../model/chart.js';
import {default as tooltip} from '../util/tooltip.js';
import {default as tweenArc} from '../util/tweenArc.js';
import {default as tweenCentroid} from '../util/tweenCentroid.js';
import {default as tweenNumber} from '../util/tweenNumber.js';

/**
 * d2b.chartPie() returns a d2b
 * pie chart generator
 */
export default function () {

	const model = modelChart(update);
	const $$ = model.values();
	const chart = model.base();

	// configure legend
	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true)
		.on('change', (legend, d) => legend.datum().__update__())
		.on('mouseover.d2b-pie', (legend, d) => d3.select(d.__elem__).each(arcGrow))
		.on('mouseout.d2b-pie', (legend, d) => d3.select(d.__elem__).each(arcShrink));

	// pie data layout
	const layout = d3.pie().sort(null);

	// arc generator
	const arc = d3.arc()
			.outerRadius(d => d.outerRadius)
			.innerRadius(d => d.innerRadius);

	// d2b pie generator
	const pie = d2b.svgPie().arc(arc);

	// percent formater
	const percent = d3.format('.0%');

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
		.addProp('tooltip',
			tooltip()
					.followMouse(true)
					.html(d => `<b>${$$.label(d.data)}:</b> ${$$.value(d.data)}`)
		)
		.addPropFunctor('showPercent', (d, i, p) => p > 0.03)
		.addPropFunctor('center', null)
		.addPropFunctor('radius', (w, h) => Math.min(w, h) / 2)
		.addPropFunctor('sort', null)
		.addPropFunctor('color', d => d2b.defaultColor(d.label), null, (d) => {
			$$.tooltip.color(dd => d3.rgb(d(dd.data)).darker(0.3));
			$$.legend.color(d);
			pie.color(d);
		})
		.addPropFunctor('value', d => d.value, null, d => layout.value(d))
		.addPropFunctor('label', d => d.label, null, d => $$.legend.label(d));

	// update chart
	function update (context, width, height, tools) {
		const selection = (context.selection)? context.selection() : context,
					node = selection.node(),
					radius = $$.radius.call(node, width, height);

		// Retrieve pie datum, save refresh method, filter out emptied items.
		let datum = selection.datum();
		datum.__update__ = tools.update;
		datum = datum.filter(d => !d.empty);

		// Filter and sort for current data.
		const total = d3.sum(datum, (d, i) => $$.value.call(chart, d, i));

		// Select and enter pie chart 'g' element.
		let chartGroup = selection.selectAll('.d2b-pie-chart').data([datum]);
		const chartGroupEnter = chartGroup.enter()
			.append('g')
				.attr('class', 'd2b-pie-chart');

		chartGroup = chartGroup.merge(chartGroupEnter)
				.datum(d => {
					d = layout(d);
					d.forEach(dd => {
						dd.outerRadius = radius;
						dd.innerRadius = radius * $$.donutRatio;
					});
					return d;
				});

		if (selection !== context) chartGroup = chartGroup.transition(context);

		chartGroup.call(pie);

		// For each arc in the pie chart assert the transitioning flag and store
		// the element node in data. Also setup hover and tooltip events;
		let arcGroup = selection
			.selectAll('.d2b-pie-arc')
				.each(function (d) {
					this.outerRadius = d.outerRadius;
					d.data.__elem__ = this;
				})
				.on('mouseover', arcGrow)
				.on('mouseout', arcShrink)
				.call($$.tooltip);

		let arcPercent = arcGroup.selectAll('.d2b-pie-arc-percent').data(d => [d]);

		arcPercent.enter()
			.append('g')
				.attr('class', 'd2b-pie-arc-percent')
			.append('text')
				.attr('y', 6);

		arcGroup
				.each(function (d) {
					const elem = d3.select(this),
								current = elem.select('.d2b-pie-arc path').node().current,
								percentGroup = elem.select('.d2b-pie-arc-percent'),
								percentText = percentGroup.select('text').node();
					percentGroup.node().current = current;
					percentText.current = percentText.current || 0;
				})

		if (selection !== context) {
			arcGroup = arcGroup
					.each(function (d) {this.transitioning = true;})
				.transition(context)
					.on('end', function (d) {this.transitioning = false;});
		}

		arcGroup
			.select('.d2b-pie-arc-percent')
				.call(d2b.tweenCentroid, arc)
			.select('text')
				.call(tweenNumber, d => d.value / total, percent)
				.style('opacity', function (d, i) {
					return $$.showPercent.call(this, d.data, i, d.value / total)? 1 : 0;
				});

		const coords = chartCoords(node, radius, width, height);
		chartGroupEnter.attr('transform', `translate(${coords.x}, ${coords.y})`);
		chartGroup.attr('transform', `translate(${coords.x}, ${coords.y})`);
	}

	// Position the pie chart according to the 'at' string (e.g. 'center left',
	// 'top center', ..). Unless a `$$.center` function is specified by the user
	// to return the {x: , y:} coordinates of the pie chart center.
	function chartCoords (node, radius, width, height) {
		let coords = $$.center.call(node, width, height, radius);

		if (!coords) {
			let at = $$.at.split(' ');
			at = {x: at[1], y: at[0]};
			coords = {};
			switch (at.x) {
				case 'left':
					coords.x = radius;
					break;
				case 'center':
					coords.x = width / 2
					break;
				default: // right
					coords.x = width - radius;
			}

			switch (at.y) {
				case 'bottom':
					coords.y = height - radius;
					break;
				case 'center':
					coords.y = height / 2;
					break;
				default: // top
					coords.y = radius;
			}
		}
		return coords;
	}

	function arcGrow (d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		d.outerRadius = this.outerRadius * 1.03;
		path.transition('d2b-chart').call(tweenArc, arc);
	}

	function arcShrink (d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		d.outerRadius = this.outerRadius;
		path.transition('d2b-chart').call(tweenArc, arc);
	}

	return chart;
};
