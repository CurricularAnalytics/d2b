describe("Point", function() {
  var point;
  var g;

  beforeEach(function() {
    point = d2b.SVG.point();
    d3.selectAll('svg').remove();
    g = d3.select('body')
      .append('svg')
      .append('g')
        .attr('class', 'point');
  });

  it("it should render foreground and background.", function(){
    g.call(point);
    expect(g.select('path.d2b-point-background').size()).toBe(1);
    expect(g.select('path.d2b-point-foreground').size()).toBe(1);
  });

  it("it should render circle point with size 6000.", function(){
    point
      .type('circle')
      .size(6000);
    g.call(point);

    expect(g.select('path.d2b-point-background').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
    expect(g.select('path.d2b-point-foreground').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
  });

  it("it should render point with red fill.", function(){
    point
      .fill('#ff0000');
    g.call(point);

    expect(g.select('path.d2b-point-foreground').style('fill')).toBe('#ff0000');
  });

  it("it should render point with red stroke.", function(){
    point
      .stroke('#ff0000');
    g.call(point);

    expect(g.select('path.d2b-point-background').style('stroke')).toBe('#ff0000');
    expect(g.select('path.d2b-point-foreground').style('stroke')).toBe('#ff0000');
  });

  it("it should render point with 2px stroke-width.", function(){
    point
      .strokeWidth('2px');
    g.call(point);

    expect(g.select('path.d2b-point-background').style('stroke-width')).toBe('2px');
    expect(g.select('path.d2b-point-foreground').style('stroke-width')).toBe('2px');
  });

  it("it should be active.", function(){
    point
      .active(true);

    expect(point.active()()).toBe(true);
  });

  it("it should support type accessor.", function(){
    point
      .type(function(d){return d;})
      .size(6000);
    g
      .datum('circle')
      .call(point);

    expect(g.select('path.d2b-point-background').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
    expect(g.select('path.d2b-point-foreground').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
  });

  it("it should support size accessor.", function(){
    point
      .type('circle')
      .size(function(d){return d;});
    g
      .datum(6000)
      .call(point);

    expect(g.select('path.d2b-point-background').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
    expect(g.select('path.d2b-point-foreground').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
  });

  it("it should support fill accessor.", function(){
    point
      .fill(function(d){return d;});
    g
      .datum('#ff0000')
      .call(point);

    expect(g.select('path.d2b-point-foreground').style('fill')).toBe('#ff0000');
  });

  it("it should support stroke accessor.", function(){
    point
      .stroke(function(d){return d;});
    g
      .datum('#ff0000')
      .call(point);

    expect(g.select('path.d2b-point-background').style('stroke')).toBe('#ff0000');
    expect(g.select('path.d2b-point-foreground').style('stroke')).toBe('#ff0000');
  });

  it("it should support stroke-width accessor", function(){
    point
      .strokeWidth(function(d){return d;});
    g
      .datum("2px")
      .call(point);

    expect(g.select('path.d2b-point-background').style('stroke-width')).toBe('2px');
    expect(g.select('path.d2b-point-foreground').style('stroke-width')).toBe('2px');
  });

  it("it should support updating", function(){
    point.size(100).type('square');
    g.call(point);

    point.size(6000).type('circle');
    g.call(point);

    expect(g.select('path.d2b-point-background').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
    expect(g.select('path.d2b-point-foreground').attr('d')).toBe("M0,43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,-43.70193722368317A43.70193722368317,43.70193722368317 0 1,1 0,43.70193722368317Z");
  });

});
