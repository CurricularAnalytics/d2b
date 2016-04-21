// Wrap text based on pixel length.
// This isn't used very frequently because it causes problems with event
// rebinding namely double click events.
d2b.textWrapWidth = (text, width = Infinity) => {
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

// Wraps text based on character count and text accessor. This method uses
// d3's enter/update/exit strategy as to be less destructive on the text content.
d2b.textWrap = (text, getText = d => d.label, count = Infinity) => {

  text.each( function(d, i) {
    let text = d3.select(this),
        words = getText.call(this, d, i).split(/\s+/).reverse(),
        word,
        lines = [],
        line = [words.pop()],
        lineHeight = 1.1;

    while (word = words.pop()) {
      // console.log(line.length)
      if (line.join(' ').length + word.length > count) {
        lines.push(line);
        line = [];
      }

      line.push(word);
    }
    lines.push(line);

    const tspan = text.selectAll('tspan').data(lines);
    tspan.enter().append('tspan');

    tspan
        .text(d => d.join(' '))
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', (d, i) => `${i * lineHeight}em`);
  });
}
