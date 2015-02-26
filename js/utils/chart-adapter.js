/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

AD.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new AD.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new AD.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);

	if(chartData.properties){
		for(key in chartData.properties){
			chartData.chart[key](chartData.properties[key]);
		}
	}
}
