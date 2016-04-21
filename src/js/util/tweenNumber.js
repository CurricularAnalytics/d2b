import {default as functor} from '../core/functor.js';
import {default as numberize} from '../core/numberize.js';

export default function (context, number = d => d, format = d => d) {
  number = functor(number);

	// if context is not a transition just render the text and update current
	if (!context.selection) {
		return context
				.text(function (d, i) {
          this.current = numberize(number.call(this, d, i));
					return format(this.current);
				});
	}

  context.tween('text', function (d, i) {
    const val = numberize(number.call(this, d, i));
    this.current = numberize(this.current, val);
    const interpolate = d3.interpolate(this.current, val);
    return t => {
      this.textContent = format(this.current = interpolate(t));
    }
  })
}
