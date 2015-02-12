AD.UTILS.chartAdapter = function(type, chartData){
	chartData.chart = new AD.CHARTS[type];
	
	if(!chartData.chartLayoutData)
		chartData.chartLayoutData = {};
	chartData.chartLayoutData.chart = chartData.chart;
	chartData.chartLayoutData = {chartLayout: chartData.chartLayoutData, chartData:chartData.chartData};
	chartData.chartLayout = new AD.UTILS.CHARTPAGE.chartLayout();
	chartData.chartLayout.chart(chartData.chart);
	if(chartData.properties){
		for(key in chartData.properties){
			chartData.chart[key](chartData.properties[key]);
		}
	}
}