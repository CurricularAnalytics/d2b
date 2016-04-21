import {omit} from './object.js';

export default function (context, arc) {
	// if context is not a transition just render the centroid and update current
	if (!context.selection) {
		return context
				.attr('transform', function (d) {
					this.current = omit(d, ['data']);
					return `translate(${arc.centroid(this.current)})`;
				});
	}

  context.attrTween('transform', function (d) {
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
