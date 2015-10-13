/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d2b.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};

d2b.UTILS.chartLayoutAdapter = function(type, chartData){
	chartData.chart = new d2b.CHARTS[type];
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayout = new d2b.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout
			.chart(chartData.chart)
			.data(chartData.chartLayoutData);

	if(chartData.properties){
		for(key in chartData.properties){
			if(chartData.properties[key].args)
				chartData.chart[key].apply(this, chartData.properties[key].args)
			else
				chartData.chart[key](chartData.properties[key]);
		}
	}
};
