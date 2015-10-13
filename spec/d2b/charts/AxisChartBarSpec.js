describe("AxisChartBar", function() {
  var chart;
  var container;
  var rects;

  var body = d3.select('body');
  body.select('div.container').remove();
  container = body.append('div').attr('class', 'container');
  chart = d2b.CHARTS.axisChart()
    .selection(container)
    .data({
      data:{
        labels:{
          x:'X-Label',
          y:'Y-Label'
        },
        types:[
          {
            type:'bar',
            graphs:[
              {
                label:'Bar Graph 1',
                values:[
                  {x:1, y:100},
                  {x:2, y:120},
                  {x:3, y:80}
                ]
              },
              {
                label:'Bar Graph 2',
                values:[
                  {x:1, y:50},
                  {x:2, y:70},
                  {x:4, y:90}
                ]
              }
            ]
          }
        ]
      }
    })
    .update();

  rects = container.selectAll('.d2b-axis-chart-background-graph rect');

  it("should render correct number of bars.", function(){
    expect(rects.size()).toBe(6);
  });

  it("should contain 2 color groups.", function(){
    var colors = [];
    rects.each(function(){colors.push(d3.select(this).style('fill'))});
    expect(d3.set(colors).values().length).toBe(2);
  });

  it("should contain axis-labels.", function(){
    var labels = [];
    container.selectAll('text.d2b-axis-label').each(function(){
      labels.push(d3.select(this).text());
    });

    expect(labels).toContain('X-Label');
    expect(labels).toContain('Y-Label');
  });

  it("should contain graph-labels.", function(){
    var labels = [];
    container.selectAll('.d2b-legend text').each(function(){
      labels.push(d3.select(this).text());
    });

    expect(labels).toContain('Bar Graph 1');
    expect(labels).toContain('Bar Graph 2');
  });

});
