// Wraps text based on character count and text accessor. This method uses
// d3's enter/update/exit strategy as to be less destructive on the text content.
export default function (text, getText = d => d.label, count = Infinity) {
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

    tspan.merge(tspan.enter().append('tspan'))
        .text(d => d.join(' '))
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', (d, i) => `${i * lineHeight}em`);
  });
}
