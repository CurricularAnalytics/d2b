/* Copyright 2014 - 2015 Kevin Warne All rights reserved. */

AD.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new AD.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new AD.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);
	
	console.log(chartData.chartLayoutData)	
			console.log('hi')	
			
	if(chartData.properties){
		for(key in chartData.properties){
			chartData.chart[key](chartData.properties[key]);
		}
	}
}