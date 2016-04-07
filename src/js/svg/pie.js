// pie svg generator
d2b.svg.pie = function () {

  const $$ = {};

  /* Update Function */
  const pie = function (g) {
    g.each( function (d, i) {
      const el = d3.select(this);

  		// select arc group and get their old data
  		let arc = el.selectAll('.d2b-pie-arc');
  		const oldData = arc.data();

  		arc = arc.data(el.datum(), (d, i) => $$.key(d.data, i));

      const arcEnter = arc.enter().append('g').attr('class', 'd2b-pie-arc'),
            arcExit = d3.transition(arc.exit()).remove(),
            arcUpdate = d3.transition(arc.order());

      // create path within entered arcs
  		arcEnter.append('path')
          .attr('class', 'd2b-pie-arc-path')
          .attr('fill', function (d, i) { return $$.color.call(this, d.data, i); });

      // retrieve new data
  		const newData = arc.data();

  		// for new arcs, find and set the neighboring insertion point
  		arcEnter.each( function (d, i) {
  					const neighbor = findNeighborArc(i, oldData, newData);
  					const arc = d3.select(this);
  					arc.select('.d2b-pie-arc-path').node().current = neighbor;
  				});

  		// transition arc path
  		arcUpdate
        .select('.d2b-pie-arc-path')
  				.call(d2b.arcTween, $$.arc)
          .attr('fill', function (d, i) { return $$.color.call(this, d.data, i); });

  		// exit arcs through their proper exit position
      arc.exit()
  	      .datum(function(d, i) {
  					const data = findNeighborArc(i, newData, oldData);
  					data.data = d.data;
  					return data;
  				})
  		arcExit
        .select('.d2b-pie-arc-path')
          .call(d2b.arcTween, $$.arc);

    });
    return pie;
  };

  /* Inherit from base model */
  const model = d2b.model.base(pie, $$)
    .addProp('key', d => d.label)
    .addProp('arc', d3.svg.arc().innerRadius(100).outerRadius(200))
    .addPropFunctor('color', d => d2b.defaultColor(d.label));


	function findNeighborArc (i, data0, data1) {
	  let d;
		if (d = findPreceding(i, data0, data1)) {
			return {startAngle: d.endAngle, endAngle: d.endAngle};
		} else if (d = findFollowing(i, data0, data1)) {
			return {startAngle: d.startAngle, endAngle: d.startAngle};
		}
		return {startAngle: 0, endAngle: 0};
	}

	// Find the element in data0 that joins the highest preceding element in data1.
	function findPreceding (i, data0, data1) {
	  const m = data0.length;
	  while (--i >= 0) {
	    const k = $$.key(data1[i].data, i);
	    for (let j = 0; j < m; ++j) {
	      if ($$.key(data0[j].data, j) === k) return data0[j];
	    }
	  }
	}

	// Find the element in data0 that joins the lowest following element in data1.
	function findFollowing (i, data0, data1) {
	  const n = data1.length, m = data0.length;
	  while (++i < n) {
	    const k = $$.key(data1[i].data, i);
	    for (let j = 0; j < m; ++j) {
	      if ($$.key(data0[j].data, j) === k) return data0[j];
	    }
	  }
	}

  return pie;
};
