d2b.svg.checkbox = function () {
  const $$ = {};

	const stateChange = function (d, i) {
		d.state = !d.state;
		d3.select(this.parentNode)
			.transition()
				.duration(100)
				.call(checkbox);

		$$.dispatch.change.call(this, d, i);
	};

	const pad = (elem, size) => {
		const sWidth = strokeWidth(size);
		elem.attr('transform', `translate(${sWidth}, ${sWidth})`);
	};

	const strokeWidth = (size) => size / 10;

	const updateRect = (rect, size) => {
		const sWidth = strokeWidth(size);
		rect
			.style('stroke-width', `${sWidth}px`)
			.attr('width', size * 0.8)
			.attr('height', size * 0.8)
			.attr('rx', sWidth)
			.attr('ry', sWidth)
			.call(pad, size);
	};

	const updateText = (text, size, label) => {
		text
			.style('font-size', `${size}px`)
			.text(label)
			.attr('x', size * 1.2)
			.attr('y', size * 0.775)
			.call(pad, size);
	};

	const  updatePath = (path, size, state) => {
		const d = `M${0.13 * size},${0.40 * size}`+
							`l${0.22 * size},${0.24* size}`+
							`l${0.29 * size},${-0.49 * size}`;
		const length = 1.1 * size;
		path
			.attr('d', d)
			.style('stroke-width', `${strokeWidth(size)}px`)
			.attr('stroke-dasharray', length)
			.attr('stroke-dashoffset',(state)? 0 : length)
			.call(pad, size);
	};

  const checkbox = function (g) {

		g.each( function ( d, i ) {
      const gg = d3.select(this);
			const size = $$.size.call(this, d, i),
						label = $$.label.call(this, d, i),
						state = d.state;

			const container = gg.selectAll('g.d2b-checkbox').data([d]);

			const newContainer = container.enter()
			 	.append('g')
					.attr('class', 'd2b-checkbox')
					.on('click.d2b-click', stateChange);

			// enter components
			newContainer.append('rect').call(updateRect, size);
			newContainer.append('path').call(updatePath, size, state);
			newContainer.append('text').call(updateText, size, label);

			// update components
			const update = d3.transition(container);
			update.select('rect').call(updateRect, size);
			update.select('path').call(updatePath, size, state);
			update.select('text').call(updateText, size, label);

		});

		return checkbox;
  };

  /* Inherit from base model */
  const model = d2b.model.base(checkbox, $$)
    .addPropFunctor('size', 12)
    .addPropFunctor('label', (d => d.label))
		.addDispatcher(['change']);

  return checkbox;
};
