AD.DASHBOARDS.dashboard = function(){
	
	//define axisChart variables
	var width = AD.CONSTANTS.DEFAULTWIDTH(),
			margin = AD.CONSTANTS.DEFAULTMARGIN();				

	var pageWidth = width - 200;

	var innerWidth = width;		
		
	var generateRequired = true; //using some methods may require the chart to be redrawn		
			
	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = AD.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = AD.CONSTANTS.DEFAULTFORCEDMARGIN();

  var chartPage = new AD.UTILS.chartPage();

	var navigationHistory = {};
	navigationHistory.array = [];
	navigationHistory.position = -1;
	navigationHistory.pushNew = function(value){	
		navigationHistory.array = navigationHistory.array
				.slice(0,navigationHistory.position+1);
						
		navigationHistory.position++;
		navigationHistory.array.push({category:value.category,section:value.section});
	};
	var current = {section:{}, category:{}};
	
	// var controls = {
	// 		};

	// var color = AD.CONSTANTS.DEFAULTCOLOR();

	var currentDashboardData = {
			};
	
	var palette = AD.CONSTANTS.DEFAULTPALETTE;
	
	
	var traverseCategories = function(categories){
		if(categories){
			categories.forEach(function(cat){
				if(cat.charts){
					cat.charts.forEach(function(chart){
						chart.chart = currentDashboardData.dashboard.charts[chart.reference];
					});
				};
			});
		}
	};
	var traverseSections = function(position,sections,sectionGroup){
		sections.forEach(function(section){
			traverseCategories(section.categories);
			section.position = position.concat([{section:section, sectionGroup: sectionGroup}]);
			if(section.sections)
				traverseSections(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sections);
			if(section.sectionGroups)
				traverseSectionGroups(position.concat([{section:section, sectionGroup: sectionGroup}]),section.sectionGroups);
		});
	};
	var traverseSectionGroups = function(position,sectionGroups){
		sectionGroups.forEach(function(sectionGroup){
			if(sectionGroup.sections)
				traverseSections(position,sectionGroup.sections,sectionGroup);
		});
	};
	var dashboardLayout = function(data){
		for(chart in data.dashboard.charts){
			AD.UTILS.chartAdapter(data.dashboard.charts[chart].type,data.dashboard.charts[chart]);
		}
		traverseSections([],[data.dashboard.topSection]);
	};
	
	var resetSubSectionGroupBreadcrumbs = function(){
		selection.container.content.breadcrumbs.svg.selectAll('.ad-breadcrumb-sub-section-group-section')
			.transition()
				.duration(animationDuration/2)
				.style('opacity',0);
		selection.container.content.breadcrumbs.svg.selectAll('.ad-breadcrumb').each(function(){this.expanded = false;});		
		selection.container.content.breadcrumbs.svg.style('height','30px');
	};
	
	var updateBreadcrumbs = function(){
		//breadcrumb indention
		var breadcrumbIndentSize = 9;
		
		//set breadcrumb data keyed by the section name
		var breadcrumb = selection.container.content.breadcrumbs.svg.selectAll('g.ad-breadcrumb').data(current.section.position,function(d){return d.section.name;});
		
		//enter new breadcrumbs
		var newBreadcrumb = breadcrumb.enter()
			.append('g')
				.style('opacity',0)
				.attr('class','ad-breadcrumb');
		
		//init new breadcrumb path and text
		newBreadcrumb
			.append('path')
				.style('fill',palette.primary);
		newBreadcrumb
			.append('text')
				.text(function(d){return d.section.name;})
				.attr('y',21)
				.attr('x',15);
					
		//iterate through all breadcrumbs			
		breadcrumb.each(function(d,i){
			//save this obj
			var _breadcrumb = this;
			var elem = d3.select(_breadcrumb);
			var text = elem.select('text');
			var path = elem.select('path');
			
			//set breadCrumb path width according to text width
			var pathWidth = text.node().getBBox().width+25;
			var triangle;

			elem.select('g.ad-breadcrumb-triangle').remove();
			//if section is part of a sectionGroup add sub-section dropdown
			
			if(d.section != current.section){
				elem
						.classed('ad-innactive',false)
						.on('click',function(d){
							changeCurrentSection(d.section);
						});
			}else{
				elem
						.classed('ad-innactive',true)
						.on('click',function(){});
			}
			if(d.sectionGroup){
				
				//set data for sub-section, omitting the selected section
				var sectionBreadcrumb = elem.selectAll('g.ad-breadcrumb-sub-section-group-section')
						.data(d.sectionGroup.sections.filter(function(dd){return dd!=d.section;}));
				
				//init breadcrumb dyExpanded and expanded flags
				_breadcrumb.dyExpanded = 0;
				_breadcrumb.expanded = false;
				
				//enter breadcrumb group, path, and text
				var newSectionBreadcrumb = sectionBreadcrumb.enter()
					.append('g')
						.style('opacity',0)
						.attr('class','ad-breadcrumb-sub-section-group-section');
				newSectionBreadcrumb.append('path');
				newSectionBreadcrumb.append('text')
					.attr('y',21)
					.attr('x',15)
					.text(function(d){return d.name;});
					
				//iterate through sub-section breadcrumbs	
				sectionBreadcrumb.each(function(d){
							var elem = d3.select(this);
							var path = elem.select('path');
							var text = elem.select('text');
							var pathWidth = text.node().getBBox().width+25;
							path
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 15 L 0 30 L '+pathWidth+' 30 L '+(pathWidth+breadcrumbIndentSize)+' 15 L '+pathWidth+' 0 L 5 0');
						}).on('click',function(d){
							d3.event.stopPropagation();
							changeCurrentSection(d);
						})
						.attr('transform',function(d,i){return 'translate(0,'+(32*(i+1)+1)+')';});		
				
				//set dyExpanded to be the max size of the dropdown
				_breadcrumb.dyExpanded = (32*(sectionBreadcrumb.size()+1)+1);
				
				//add triangle under sectionGroup breadcrumb
				pathWidth += 15;
				triangle = elem.append('g')
						.attr('class','ad-breadcrumb-triangle')
						.on('click',function(){
							d3.event.stopPropagation();
							if(!_breadcrumb.expanded){
								resetSubSectionGroupBreadcrumbs();
								selection.container.content.breadcrumbs.svg
										.style('height',Math.max(30,_breadcrumb.dyExpanded)+'px');
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.delay(function(d,i){return i*20;})
										.style('opacity',1);
							}else{
								sectionBreadcrumb
									.transition()
										.duration(animationDuration/2)
										.style('opacity',0);
								selection.container.content.breadcrumbs.svg
										.style('height',30+'px');		
							}
							_breadcrumb.expanded = !_breadcrumb.expanded;
						});
				triangle.append('rect')
						.attr('width',20)
						.attr('height',30)
						.style('fill',d3.rgb(palette.primary).darker(2))
						.attr('transform','translate('+(pathWidth-20)+',0)');
				triangle.append('path')
						.attr('d','M 0 0 L 9 0 L 4.5 5 L 0 0')
						.style('fill','white')
						.attr('transform','translate('+(pathWidth-15)+',13)');
			}else{
				
			}
			
			//draw breadcrumb path, making note of start and end breadcrumbs
			var startIndent = breadcrumbIndentSize;
			var endIndent = breadcrumbIndentSize;
			if(i == 0)
				startIndent = 0;
			if(i+1 == breadcrumb.size())
				endIndent = 0;
			path
				.transition()
					.duration(animationDuration)
					.attr('d','M 0 0 L '+(startIndent)+' 15 L 0 30 L '+pathWidth+' 30 L '+(pathWidth+endIndent)+' 15 L '+pathWidth+' 0 L 5 0');
			this.dx = pathWidth;
		});	
		
		//position breadcrumbs
		var xCurrent = 0;		
		breadcrumb 
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){
					var translation = 'translate('+xCurrent+',0)';
					xCurrent += this.dx + 2;
					return translation;
				})
				.style('opacity',1);
				
		//fade out exiting breadcrumbs
		breadcrumb.exit()
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();
		
	};
	var updateCategoryTabs = function(){
		if(!current.section.categories || current.section.categories.length < 1){
			selection.container.header.navigation.categoryTabs.style('display','none').selectAll("*").remove();
			return;
		}else{
			selection.container.header.navigation.categoryTabs.style('display','');
		}
		
		var categoryTab = selection.container.header.navigation.categoryTabs.selectAll('li.ad-category-tab').data(current.section.categories);
		categoryTab.enter()
			.append('li')
				.attr('class','ad-category-tab')
				.on('click',changeCurrentCategory);
		categoryTab
			.text(function(d){return d.name;})
			.each(function(d){
				if(d==current.category){
					d3.select(this)
							.classed('ad-innactive',true)
							.on('click',function(){});
				}else{
					d3.select(this)
							.classed('ad-innactive',false)
							.on('click',changeCurrentCategory);
				}
			});
			categoryTab.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();
			
		
	};
	var updateSubSections = function(){
		if(!current.section.sections || current.section.sections.length < 1){
			selection.container.sidebar.subSections.style('display','none').selectAll("*").remove();
			return;
		}else{
			selection.container.sidebar.subSections.style('display','');
		}
		
		var subSection = selection.container.sidebar.subSections.selectAll('li.ad-sub-section').data(current.section.sections);

		subSection.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','ad-sub-section')
				.on('click',function(d){
					current.section = d;
					navigationHistory.pushNew(current);
					dashboard.update();
				});
		
		subSection
				.text(function(d){return d.name})
			.transition()
				.duration(animationDuration)
				.style('opacity',1);
				
		subSection.exit()	
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};
	var updateSubSectionGroups = function(){
		if(!current.section.sectionGroups || current.section.sectionGroups.length < 1){
			selection.container.sidebar.subSectionGroups.style('display','none').selectAll("*").remove();
			return;
		}else{
			var subSectionGroupData = current.section.sectionGroups.filter(function(d){return d.sections.length > 0;});
			if(subSectionGroupData.length < 1){
				selection.container.sidebar.subSectionGroups.style('display','none').selectAll("*").remove();
				return;
			}else{
				selection.container.sidebar.subSectionGroups.style('display','');
			}
		}
		var subSectionGroup = selection.container.sidebar.subSectionGroups.selectAll('li.ad-sub-section-group').data(subSectionGroupData);

		subSectionGroup.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','ad-sub-section-group');
		
		subSectionGroup
			.transition()
				.duration(animationDuration)
				.style('opacity',1);
				
		subSectionGroup
				.text(function(d){return d.name})
				.each(makeSubSectionGroupSections);		
				
		subSectionGroup.exit()	
			.transition()
				.duration(animationDuration)
				.style('opacity',0)
				.remove();	
	};
	var makeSubSectionGroupSections = function(d){
		if(!d.sections || d.sections.length < 1)
			return;
		var elem = d3.select(this);
		elem.selectAll('*').remove();
		var subSectionGroupSections = elem
			.append('ul')
				.datum(d)
				.attr('class','ad-sub-section-group-sections');
					
		var subSectionGroupSection = subSectionGroupSections.selectAll('li.ad-sub-section-group-section').data(function(dd){return dd.sections;});

		subSectionGroupSection.enter()
			.append('li')
				.attr('class','ad-sub-section-group-section');
				
		subSectionGroupSection
				.on('click',changeCurrentSection);	

		subSectionGroupSection
				.text(function(d){return d.name;});
	};
	
	var changeCurrentSection = function(d){
		resetSubSectionGroupBreadcrumbs();
		
		current.section = d;
		
		var newCategory = d.categories.filter(function(d){return d.name == current.category.name;});
		if(newCategory.length > 0){
			return changeCurrentCategory(newCategory[0]);
		}else{
			return changeCurrentCategory(d.categories[0]);
		}
	};
	var changeCurrentCategory = function(d){
		current.category = d;
		navigationHistory.pushNew(current);
		// console.log(current.category.charts);
		chartPage.update({data:current.category});
		return dashboard.update();
	};
	
	var dashboard = {};

	//members that will set the regenerate flag
	dashboard.select = function(value){
		selection = d3.select(value);
		generateRequired = true;	
		return dashboard;
	};
	dashboard.selection = function(value){
		if(!arguments.length) return selection;
		selection = value;
		generateRequired = true;	
		return dashboard;
	};

	//methods that require update
	dashboard.width = function(value){
		if(!arguments.length) return width;
		width = value;
		pageWidth = width - 200;
		chartPage.width(pageWidth - 10);
		return dashboard;
	};

	dashboard.margin = function(values){
		if(!arguments.length) return margin;
		if(values.left)
			margin.left = values.left;
		if(values.right)
			margin.right = values.right;
		if(values.top)
			margin.top = values.top;
		if(values.bottom)
			margin.bottom = values.bottom;
		return dashboard;
	};

	dashboard.palette = function(value){
		if(!arguments.length) return palette;
		palette = value;
		return dashboard;
	};
	
	//other members
	// dashboard.controls = function(value){
	// 	if(!arguments.length) return controls;
	//
	// 	return dashboard;
	// };
	dashboard.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		chartPage.animationDuration(animationDuration);
		return dashboard;
	};

	//generate chart
	dashboard.generate = function(dashboardData) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create container
		selection.container = selection
			.append('div')
				.attr('class','ad-dashboard ad-container');
		
		selection.container.header = selection.container
			.append('div')
				.attr('class','ad-header');		
				
		selection.container.header.navigation = selection.container.header
			.append('div')
				.attr('class','ad-navigation');	
				
		selection.container.header.navigation.home = selection.container.header.navigation
			.append('div')
				.attr('class','ad-navigation-home');
				
		selection.container.header.navigation.home.append('i').attr('class','fa fa-home')		
				
		selection.container.header.navigation.arrows = selection.container.header.navigation
			.append('div')
				.attr('class','ad-navigation-arrows');
				
		selection.container.header.navigation.arrows.left = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','ad-left-arrow');
				
		selection.container.header.navigation.arrows.right = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','ad-right-arrow');
		
		selection.container.header.navigation.arrows.left.append('i').attr('class','fa fa-chevron-left')

		selection.container.header.navigation.arrows.right.append('i').attr('class','fa fa-chevron-right')				
				
		selection.container.header.navigation.categoryTabs = selection.container.header.navigation
			.append('ul')
				.attr('class','ad-category-tabs');		
				
		selection.container.sidebar = selection.container
			.append('div')
				.attr('class','ad-dashboard-sidebar');	
				
		selection.container.sidebar.subSections = selection.container.sidebar
			.append('ul')
				.attr('class','ad-sub-sections');		
				
		selection.container.sidebar.subSectionGroups = selection.container.sidebar
			.append('ul')
				.attr('class','ad-sub-section-groups');	
				
		selection.container.content = selection.container	
			.append('div')
				.attr('class','ad-dashboard-content');	
				
		selection.container.content.breadcrumbs = selection.container.content
			.append('div')
				.attr('class','ad-navigation-breadcrumbs');	
				
		selection.container.content.breadcrumbs.svg = selection.container.content.breadcrumbs
			.append('svg')
				.attr('class','ad-navigation-breadcrumbs-svg');			

		selection.container.content.chartPage = selection.container.content
			.append('div')
				.attr('class','ad-dashboard-chart-page');
				
		chartPage.selection(selection.container.content.chartPage);

		//auto update dashboard
		var temp = animationDuration;
		dashboard.animationDuration(0);		
		dashboard.update(dashboardData);
		dashboard.animationDuration(temp);

		return dashboard;
	};

	//update chart
	dashboard.update = function(dashboardData){
	
		selection.container.content
			.style('width',pageWidth+'px');
	
		if(dashboardData){
			currentDashboardData = dashboardData;
			dashboardLayout(currentDashboardData);
			return changeCurrentSection(currentDashboardData.dashboard.topSection);
		}
		//if generate required call the generate method
		if(generateRequired){
			return dashboard.generate(currentDashboardData);
		}
		
		if(current.section == currentDashboardData.dashboard.topSection){
			selection.container.header.navigation.home
					.classed('ad-innactive',true)
					.on('click',function(){});
		}else{
			selection.container.header.navigation.home
					.classed('ad-innactive',false)
					.on('click',function(){
						changeCurrentSection(currentDashboardData.dashboard.topSection);
					});
		}
		
		if(navigationHistory.position+1 == navigationHistory.array.length){
			selection.container.header.navigation.arrows.right
					.classed('ad-innactive',true)
					.on('click',function(){});
		}else{
			selection.container.header.navigation.arrows.right
					.classed('ad-innactive',false)
					.on('click',function(){
						navigationHistory.position++;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						chartPage.update({data:current.category});
						dashboard.update();
					});
		}
		
		if(navigationHistory.position == 0){
			selection.container.header.navigation.arrows.left
					.classed('ad-innactive',true)
					.on('click',function(){})
		}else{
			selection.container.header.navigation.arrows.left
					.classed('ad-innactive',false)
					.on('click',function(){
						navigationHistory.position--;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						chartPage.update({data:current.category}, 'backward');
						dashboard.update();
					});
		}
		
		selection.container
			.transition()
				.delay(animationDuration)
				.duration(animationDuration)
				.style('width', width+'px');	
		updateCategoryTabs();
		updateBreadcrumbs();
		updateSubSections();	
		updateSubSectionGroups();	
		chartPage.update();
		
		d3.timer.flush();
		
		return dashboard;
	};
	
	return dashboard;
	
};