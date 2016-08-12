import {default as modelChart} from '../model/chart.js';
import {default as tooltip} from '../util/tooltip.js';
import {default as tweenArc} from '../util/tweenArc.js';
import {default as tweenCentroid} from '../util/tweenCentroid.js';
import {default as tweenNumber} from '../util/tweenNumber.js';
import {default as color} from '../core/color.js';

/**
 * d2b.chartPie() returns a d2b
 * pie chart generator
 */
export default function () {

	const model = modelChart(update, legendConfig);
	const $$ = model.values();
	const chart = model.base();

	// configure legend
	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true);

	function legendConfig (legend) {
		legend
			.empty(d => d.hidden)
			.setEmpty((d, i, state) => d.hidden = state)
	}

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
		.addProp('key', d => d.label, null, d => {
			$$.legend.key(d);
			pie.key(d);
		})
		.addProp('tooltip',
			tooltip()
					.followMouse(true)
					.html(d => `<b>${$$.label(d.data)}:</b> ${$$.value(d.data)}`)
		)
		.addPropFunctor('values', d => d)
		.addPropFunctor('donutRatio', 0)
		.addPropFunctor('startAngle', 0)
		.addPropFunctor('endAngle', 2 * Math.PI)
		.addPropFunctor('at', 'center center')
		.addPropFunctor('showPercent', (d, i) => d.__percent__ > 0.03)
		.addPropFunctor('center', null)
		.addPropFunctor('radius', (d, i, w, h) => Math.min(w, h) / 2)
		.addPropFunctor('sort', null)
		.addPropFunctor('color', d => color(d.label), null, (d) => {
			$$.tooltip.color(dd => d3.rgb(d(dd.data)).darker(0.3));
			$$.legend.color(d);
			pie.color(d);
		})
		.addPropFunctor('value', d => d.value, null, d => layout.value(d))
		.addPropFunctor('label', d => d.label, null, d => $$.legend.label(d));

	// update chart
	function update (context, index, width, height, tools) {
		const selection = (context.selection)? context.selection() : context,
					node = selection.node(),
					datum = selection.datum(),
					radius = $$.radius(datum, index, width, height),
					startAngle = $$.startAngle(datum, index),
					endAngle = $$.endAngle(datum, index),
					donutRatio = $$.donutRatio(datum, index),
					at = $$.at(datum, index),
					values = $$.values(datum, index).filter(d => !d.hidden);

		// legend functionality
		tools.selection
			.select('.d2b-chart-legend')
				.on('change', tools.update)
			.selectAll('.d2b-legend-item')
				.on('mouseover', d => d3.select(d.__arc__).each(arcGrow))
				.on('mouseout', d => d3.select(d.__arc__).each(arcShrink));

		// Filter and sort for current data.
		const total = d3.sum(values, (d, i) => d.__value__ = $$.value(d, i));

		// Select and enter pie chart 'g' element.
		let chartGroup = selection.selectAll('.d2b-pie-chart').data([values]);
		const chartGroupEnter = chartGroup.enter()
			.append('g')
				.attr('class', 'd2b-pie-chart');

		chartGroup = chartGroup.merge(chartGroupEnter)
				.datum(d => {
					d = layout.startAngle(startAngle).endAngle(endAngle)(d);
					d.forEach(dd => {
						dd.outerRadius = radius;
						dd.innerRadius = radius * donutRatio;
					});
					return d;
				});

		if (selection !== context) chartGroup = chartGroup.transition(context);

		chartGroup.call(pie);

		// For each arc in the pie chart assert the transitioning flag and store
		// the element node in data. Also setup hover and tooltip events;
		let arcGroup = selection
			.selectAll('.d2b-pie-arc')
				.each(function (d, i) {
					this.outerRadius = d.outerRadius;
					d.data.__arc__ = this;
					d.data.__percent__ = d.data.__value__ / total;
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
				.call(tweenNumber, d => d.data.__percent__, percent)
				.style('opacity', function (d, i) {
					return $$.showPercent.call(this, d.data, i)? 1 : 0;
				});

		const coords = chartCoords(node, datum, index, radius, width, height);
		chartGroupEnter.attr('transform', `translate(${coords.x}, ${coords.y})`);
		chartGroup.attr('transform', `translate(${coords.x}, ${coords.y})`);
	}

	// Position the pie chart according to the 'at' string (e.g. 'center left',
	// 'top center', ..). Unless a `$$.center` function is specified by the user
	// to return the {x: , y:} coordinates of the pie chart center.
	function chartCoords (node, datum, index, radius, width, height) {
		let coords = $$.center(datum, index, width, height, radius),
				at = $$.at(datum, index, width, height).split(' ');

		if (!coords) {
			at = {x: at[1], y: at[0]};
			coords = {};
			switch (at.x) {
				case 'left':
					coords.x = radius;
					break;
				case 'center':
				case 'middle':
					coords.x = width / 2
					break;
				case 'right':
				default:
					coords.x = width - radius;
			}

			switch (at.y) {
				case 'bottom':
					coords.y = height - radius;
					break;
				case 'center':
				case 'middle':
					coords.y = height / 2;
					break;
				case 'top':
				default:
					coords.y = radius;
			}
		}

		return coords;
	}

	function arcGrow (d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		d.outerRadius = this.outerRadius * 1.03;
		path.transition().duration(100).call(tweenArc, arc);
	}

	function arcShrink (d) {
		if (this.transitioning) return;
		const path = d3.select(this).select('path');
		d.outerRadius = this.outerRadius;
		path.transition().duration(100).call(tweenArc, arc);
	}

	return chart;
};
