d2b.arcTween = function (transition, arc) {
	transition.attrTween('d', function (d) {
    // omit data attribute incase of a pie chart with nested associations
    d = d2b.omit(d, ['data']);
		this.current = this.current || d;
		const i = d3.interpolate(this.current, d);
		return t => {
			this.current = i(t);
			return arc(this.current);
		}
	});
};

d2b.centroidTween = function (transition, arc) {
  transition.attrTween('transform', function (d) {
    // omit data attribute incase of a pie chart with nested associations
    d = d2b.omit(d, ['data']);
    this.current = this.current || d;
    const i = d3.interpolate(this.current, d);
    return t => {
      this.current = i(t);
      return `translate(${arc.centroid(this.current)})`;
    }
  })
};

d2b.numberTween = function (transition, number = d => d, format = d => d) {
  number = d3.functor(number);
  transition.tween('text', function (d) {
    const val = d2b.numberize(number.call(this, d, i));
    this.current = d2b.numberize(this.current, val);
    const i = d3.interpolate(this.current, val);
    return t => {
      this.textContent = format(this.current = i(t));
    }
  })
}
