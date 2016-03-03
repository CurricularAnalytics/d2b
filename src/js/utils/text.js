d2b.util.textWrap = (text, width) => {
  width = width || Infinity;
  text.each( function() {
    let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = parseFloat(text.attr('y')) || 0,
        dy = parseFloat(text.attr('dy')) || 0,
        tspan = text.text(null)
          .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
      }
    }
  });
};
