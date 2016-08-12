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

	const model = modelChart(update, buildData, legendConfig);
	const $$ = model.values();
	const chart = model.base();

	// configure legend
	$$.legend
		.active(true)
		.clickable(true)
		.dblclickable(true);

  // Legend config callback
  function legendConfig (legend) {
    legend
      .items(d => d.values)
			.label(d => d.label)
			.key(d => d.key)
			.color(d => d.color);
  }

	// pie data layout
	const layout = d3.pie().sort(null)
		.value(d => d.value);

	// arc generator
	const arc = d3.arc()
		.outerRadius(d => d.outerRadius)
		.innerRadius(d => d.innerRadius);

	// d2b pie generator
	const pie = d2b.svgPie()
		.arc(arc)
		.key(d => d.key)
		.color(d => d.color);

	// percent formater
	const percent = d3.format('.0%');

	const defaultTooltip = tooltip()
		.followMouse(true)
		.html(d => `<b>${d.label}:</b> ${d.value}`);

	// configure model properties
	model
		.addProp('tooltip', defaultTooltip, null, tooltip => {
			tooltip.color(d => d3.rgb(d.color).darker(0.3));
		})
		.addPropFunctor('key', d => d.label)
		.addPropFunctor('values', d => d)
		.addPropFunctor('donutRatio', 0)
		.addPropFunctor('startAngle', 0)
		.addPropFunctor('endAngle', 2 * Math.PI)
		.addPropFunctor('at', 'center center')
		.addPropFunctor('center', null)
		.addPropFunctor('radius', (d, i, w, h) => Math.min(w, h) / 2)
		.addPropFunctor('sort', null)
		.addPropFunctor('color', d => color(d.label))
		.addPropFunctor('value', d => d.value)
		.addPropFunctor('label', d => d.label);

	// update chart
	function update (context, data, index, width, height, tools) {
		const selection = (context.selection)? context.selection() : context,
					radius = $$.radius(data.data, index, width, height),
					values = data.values.filter(d => !d.__empty__);

		// legend functionality
		tools.selection
			.select('.d2b-chart-legend')
			.selectAll('.d2b-legend-item')
				.on('mouseover', d => {
					selection.selectAll('.d2b-pie-arc').filter(arc => arc === d).each(arcGrow);
				})
				.on('mouseout', d => {
					selection.selectAll('.d2b-pie-arc').filter(arc => arc === d).each(arcShrink);
				});

		// Filter and sort for current data.
		const total = d3.sum(values, (d, i) => d.value);

		// Select and enter pie chart 'g' element.
		let chartGroup = selection.selectAll('.d2b-pie-chart').data([values]);
		const chartGroupEnter = chartGroup.enter()
			.append('g')
				.attr('class', 'd2b-pie-chart');

		chartGroup = chartGroup.merge(chartGroupEnter)
				.datum(d => {
					return layout
						.startAngle(data.startAngle)
						.endAngle(data.endAngle)
						(d)
						.map(value => {
							const v = value.data;
							v.startAngle = value.startAngle;
							v.endAngle = value.endAngle;
							v.padAngle = value.padAngle;
							v.outerRadius = radius;
							v.innerRadius = radius * data.donutRatio;
							return v;
						});
				});

		if (selection !== context) chartGroup = chartGroup.transition(context);

		chartGroup.call(pie);

		// For each arc in the pie chart assert the transitioning flag and store
		// the element node in data. Also setup hover and tooltip events;
		let arcGroup = selection
			.selectAll('.d2b-pie-arc')
				.each(function (d, i) {
					this.outerRadius = d.outerRadius;
					d.percent = d.value / total;
				})
				.on('mouseover', arcGrow)
				.on('mouseout', arcShrink)
				.call(data.tooltip);

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
				.call(tweenNumber, d => d.percent, percent);

		const coords = chartCoords(data, index, radius, width, height);
		chartGroupEnter.attr('transform', `translate(${coords.x}, ${coords.y})`);
		chartGroup.attr('transform', `translate(${coords.x}, ${coords.y})`);
	}

	// Position the pie chart according to the 'at' string (e.g. 'center left',
	// 'top center', ..). Unless a `$$.center` function is specified by the user
	// to return the {x: , y:} coordinates of the pie chart center.
	function chartCoords (data, index, radius, width, height) {
		let coords = $$.center(data.data, index, width, height, radius),
				at = $$.at(data.data, index, width, height).split(' ');

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

	function buildData (d, i) {
		return {
			tooltip: $$.tooltip,
			donutRatio: $$.donutRatio(d, i),
			startAngle: $$.startAngle(d, i),
			endAngle: $$.endAngle(d, i),
			at: $$.at(d, i),
			sort: $$.sort(d, i),
			values: $$.values(d, i).map((v, i) => {
				return {
					data: v,
					key: $$.key(v, i),
					value: $$.value(v, i),
					label: $$.label(v, i),
					color: $$.color(v, i),
					__empty__: v.hidden // __empty__ needs to be manually retrived
															// from hidden in order to save the
															// changes made to the legend controls.
				};
			})
		};
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
