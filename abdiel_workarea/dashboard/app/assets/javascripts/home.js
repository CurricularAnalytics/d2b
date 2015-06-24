$(document).ready(function(){

  var gradRateBySport = d2b.CHARTS.axisChart()
      .x({type:'ordinal'})
      .yFormat({units:{after:"%"}})
      .controls({hideLegend:{enabled:true}});

  gradRateBySport.mainData = [
    {name: 'Baseball', rate: 75},
    {name: 'Basketball', rate: 82},
    {name: 'Football', rate: 68},
    {name: 'Swimming', rate: 95},
    {name: 'Skiing', rate: 90},
    {name: 'Golf', rate: 91}
  ];


  gradRateBySport.data({
    data: {
      labels:{
        x:'Sport',
        y:'Percentage'
      },
      types:[
        {
          type:'bar',
          graphs:[
            {
              label:'Students',
              values:gradRateBySport.mainData.map(function(d){
                return {x: d.name, y: d.rate};
              })
            },
          ]
        }
      ]
    }
  })

	gradRateBySport.layout = new d2b.UTILS.CHARTPAGE.chartLayout();

  gradRateBySport.layout
			.width(1000)
			.height(600)
			.chart(gradRateBySport)
			.select('.grad-rates-by-sport');

  gradRateBySport.layout
		.data({
  		"data":
  		{
  			"chartLayout":{
  				"title":"Graduation Rate By Sport"
  			}
  		}
  	})
		.update();

});
