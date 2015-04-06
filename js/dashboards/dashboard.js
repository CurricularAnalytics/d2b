/* Copyright © 2013-2015 Academic Dashboards, All Rights Reserved. */

d3b.DASHBOARDS.dashboard = function(){

	//define axisChart variables
	var width = d3b.CONSTANTS.DEFAULTWIDTH(),
			margin = d3b.CONSTANTS.DEFAULTMARGIN();

	var pageMargin = 210;
	var pageWidth = width - pageMargin;

	var innerWidth = width;

	var generateRequired = true; //using some methods may require the chart to be redrawn

	var selection = d3.select('body'); //default selection of the HTML body

	var animationDuration = d3b.CONSTANTS.ANIMATIONLENGTHS().normal;
	var forcedMargin = d3b.CONSTANTS.DEFAULTFORCEDMARGIN();

  var dashboardCategory = new d3b.UTILS.dashboardCategory();
	var chartPage = new d3b.UTILS.chartPage();
  var controls = new d3b.UTILS.CONTROLS.htmlControls();

	var sectionsByKey = {};

	var controlsHidden = false;
	var navigationHidden = false;

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

	var currentPage = {};

	var resized = true;

	// var controls = {
	// 		};

	// var color = d3b.CONSTANTS.DEFAULTCOLOR();

	var currentDashboardData = {
			};

	var palette = d3b.CONSTANTS.DEFAULTPALETTE;

	var traversePages = function(pages, categoryName, sectionName){
		pages.forEach(function(page, i){
			page.categoryName = categoryName;
			page.sectionName = sectionName;
			page.index = i;

		});
	};

	var traverseCategories = function(categories, sectionName){
		if(categories){
			categories.forEach(function(cat){
				cat.sectionName = sectionName;

				if(!cat.pages){
					cat.pages = [];
				}

				traversePages(cat.pages, cat.name, cat.sectionName);

			});
		}
	};
	var traverseSections = function(position,sections,sectionGroup){
		sections.forEach(function(section){
			if(section.key)
				sectionsByKey[section.key] = section;
			traverseCategories(section.categories, section.name);
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
		traverseSections([],[data.dashboard.topSection]);
	};

	var resetSubSectionGroupBreadcrumbs = function(){
		selection.container.header.breadcrumbs.svg.selectAll('.d3b-breadcrumb-sub-section-group-section')
			.transition()
				.duration(animationDuration/2)
				.style('opacity',0);
		selection.container.header.breadcrumbs.svg.selectAll('.d3b-breadcrumb').each(function(){this.expanded = false;});
		selection.container.header.breadcrumbs.svg.style('height','28px');
	};

	var updateBreadcrumbs = function(){
		//breadcrumb indention
		var breadcrumbIndentSize = 7;

		//set breadcrumb data keyed by the section name
		var breadcrumb = selection.container.header.breadcrumbs.svg.selectAll('g.d3b-breadcrumb').data(current.section.position,function(d){return d.section.name;});

		//enter new breadcrumbs
		var newBreadcrumb = breadcrumb.enter()
			.append('g')
				.style('opacity',0)
				.attr('class','d3b-breadcrumb');


		//init new breadcrumb path and text
		newBreadcrumb.append('path').attr('class','d3b-breadcrumb-background');

		newBreadcrumb.append('path').attr('class','d3b-breadcrumb-foreground');

		newBreadcrumb
			.append('text')
				.text(function(d){return d.section.name;})
				.attr('y',17)
				.attr('x',15);

		//iterate through all breadcrumbs
		breadcrumb.each(function(d,i){
			//save this obj
			var _breadcrumb = this;
			var elem = d3.select(_breadcrumb);
			var text = elem.select('text');
			var foreground = elem.select('path.d3b-breadcrumb-foreground');
			var background = elem.select('path.d3b-breadcrumb-background');

			//set breadCrumb path width according to text width
			var pathWidth = text.node().getBBox().width+25;
			var triangle;

			elem.select('g.d3b-breadcrumb-triangle').remove();
			//if section is part of a sectionGroup add sub-section dropdown

			if(d.section != current.section){
				elem
						.classed('d3b-innactive',false)
						.on('click.d3b-click',function(d){
							changeCurrentSection(d.section);
						});
			}else{
				elem
						.classed('d3b-innactive',true)
						.on('click.d3b-click',null);
			}
			if(d.sectionGroup){

				//set data for sub-section, omitting the selected section
				var sectionBreadcrumb = elem.selectAll('g.d3b-breadcrumb-sub-section-group-section')
						.data(d.sectionGroup.sections.filter(function(dd){return dd!=d.section;}));

				//init breadcrumb dyExpanded and expanded flags
				_breadcrumb.dyExpanded = 0;
				_breadcrumb.expanded = false;

				//enter breadcrumb group, path, and text
				var newSectionBreadcrumb = sectionBreadcrumb.enter()
					.append('g')
						.style('opacity',0)
						.attr('class','d3b-breadcrumb-sub-section-group-section');
				newSectionBreadcrumb.append('path').attr('class','d3b-breadcrumb-background');
				newSectionBreadcrumb.append('path').attr('class','d3b-breadcrumb-foreground');
				newSectionBreadcrumb.append('text')
					.attr('y',17)
					.attr('x',15)
					.text(function(d){return d.name;});

				//iterate through sub-section breadcrumbs
				sectionBreadcrumb.each(function(d){
							var elem = d3.select(this);
							var foreground = elem.select('path.d3b-breadcrumb-foreground');
							var background = elem.select('path.d3b-breadcrumb-background');
							var text = elem.select('text');
							var pathWidth = text.node().getBBox().width+25;
							foreground
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z')
								.attr('transform','translate(4,0)');
							background
								.attr('d','M 0 0 L '+(breadcrumbIndentSize)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+breadcrumbIndentSize)+' 12.5 L '+pathWidth+' 0 L 0 0 Z');
						}).on('click.d3b-click',function(d){
							d3.event.stopPropagation();
							changeCurrentSection(d);
						})
						.attr('transform',function(d,i){return 'translate(0,'+(28*(i+1))+')';});

				//set dyExpanded to be the max size of the dropdown
				_breadcrumb.dyExpanded = (32*(sectionBreadcrumb.size()+5));

				//add triangle under sectionGroup breadcrumb
				pathWidth += 15;
				triangle = elem.append('g')
						.attr('class','d3b-breadcrumb-triangle')
						.on('click.d3b-click',function(){
							d3.event.stopPropagation();
							if(!_breadcrumb.expanded){
								resetSubSectionGroupBreadcrumbs();
								selection.container.header.breadcrumbs.svg
										.style('height',Math.max(25,_breadcrumb.dyExpanded)+'px');
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
								selection.container.header.breadcrumbs.svg
										.style('height',27+'px');
							}
							_breadcrumb.expanded = !_breadcrumb.expanded;
						});
				triangle.append('rect')
						.attr('width',20)
						.attr('height',24)
						.attr('y',0.5)
						// .style('fill',d3.rgb(palette.primary).darker(2))
						.attr('transform','translate('+(pathWidth-20)+',0)');
				triangle.append('path')
						.attr('d','M 0 0 L 9 0 L 4.5 5 L 0 0 Z')
						.attr('transform','translate('+(pathWidth-15)+',11)');
			}else{

			}

			//draw breadcrumb path, making note of start and end breadcrumbs
			var startIndent = breadcrumbIndentSize;
			var endIndent = breadcrumbIndentSize;
			if(i == 0)
				startIndent = 0;
			if(i+1 == breadcrumb.size())
				endIndent = 0;

			foreground
				.transition()
					.duration(animationDuration)
					.attr('transform','translate(4,0)')
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			background
				.transition()
					.duration(animationDuration)
					.attr('d','M 0 0 L '+(startIndent)+' 12.5 L 0 25 L '+pathWidth+' 25 L '+(pathWidth+endIndent)+' 12.5 L '+pathWidth+' 0 L 5 0 Z');

			this.dx = pathWidth;
		});

		//position breadcrumbs
		var xCurrent = 0;
		breadcrumb
			.transition()
				.duration(animationDuration)
				.attr('transform',function(d){
					var translation = 'translate('+xCurrent+',1)';
					xCurrent += this.dx + 7;
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

		var categoryTab = selection.container.header.navigation.categoryTabs.selectAll('li.d3b-category-tab').data(current.section.categories);
		categoryTab.enter()
			.append('li')
				.attr('class','d3b-category-tab')
				.on('click.d3b-click',changeCurrentCategory);
		categoryTab
			.text(function(d){return d.name;})
			.each(function(d){
				if(d==current.category){
					d3.select(this)
							.classed('d3b-innactive',true)
							.on('click.d3b-click',null);
				}else{
					d3.select(this)
							.classed('d3b-innactive',false)
							.on('click.d3b-click',changeCurrentCategory);
				}
			});
			categoryTab.exit()
				.transition()
					.duration(animationDuration)
					.style('opacity',0)
					.remove();


	};
	var updateSubSections = function(){

		var subSection = selection.container.sidebar.subSections.selectAll('li.d3b-sub-section').data(current.section.sections);

		subSection.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d3b-sub-section')
				.on('click.d3b-click',changeCurrentSection);

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

		var subSectionGroupData = current.section.sectionGroups.filter(function(d){return d.sections.length > 0;});

		var subSectionGroup = selection.container.sidebar.subSectionGroups.selectAll('li.d3b-sub-section-group').data(subSectionGroupData);

		subSectionGroup.enter()
			.append('li')
				.style('opacity',0)
				.attr('class','d3b-sub-section-group');

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
				.attr('class','d3b-sub-section-group-sections');

		var subSectionGroupSection = subSectionGroupSections.selectAll('li.d3b-sub-section-group-section').data(function(dd){return dd.sections;});

		subSectionGroupSection.enter()
			.append('li')
				.attr('class','d3b-sub-section-group-section');

		subSectionGroupSection
				.on('click.d3b-click',changeCurrentSection);

		subSectionGroupSection
				.text(function(d){return d.name;});
	};

	var changeCurrentSection = function(d){
		resetSubSectionGroupBreadcrumbs();

		current.section = d;

		if(!current.section.sections)
			current.section.sections = [];

		if(!current.section.sectionGroups)
			current.section.sectionGroups = [];

		if(!current.section.categories)
			current.section.categories = [];

		var newCategory = d.categories.filter(function(d){return d.name == current.category.name;});
		if(newCategory.length > 0){
			return changeCurrentCategory(newCategory[0]);
		}else{
			return changeCurrentCategory(d.categories[0]);
		}
	};
	var ii=0;
	var changeCurrentCategory = function(d){
		current.category = d;
		navigationHistory.pushNew(current);
		/////Work on proper push/pop/find state later
		// history.pushState({},'','?category='+(current.category.name)+'&section='+(current.section.name))
		dashboardCategory
				.animateFrom('right')
				.data({data:current.category});
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
		pageWidth = width - 210;
		dashboardCategory.width(pageWidth);
		chartPage.width(pageWidth);
		resized = true;
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

	dashboard.animationDuration = function(value){
		if(!arguments.length) return animationDuration;
		animationDuration = value;
		dashboardCategory.animationDuration(animationDuration);

		return dashboard;
	};

	dashboard.data = function(dashboardData, reset){
		if(!arguments.length) return animationDuration;
		if(reset){
			generateRequired = true;
			currentDashboardData = {};
		}

		currentDashboardData = dashboardData;
		dashboardLayout(currentDashboardData);

		return dashboard;
	}

	//generate chart
	dashboard.generate = function(callback) {
		generateRequired = false;

		//clean container
		selection.selectAll('*').remove();

		//create container
		selection.container = selection
			.append('div')
				.attr('class','d3b-dashboard d3b-container');

		selection.container.header = selection.container
			.append('div')
				.attr('class','d3b-header');

		selection.container.header.navigation = selection.container.header
			.append('div')
				.attr('class','d3b-navigation');

		selection.container.header.navigation.home = selection.container.header.navigation
			.append('div')
				.attr('class','d3b-navigation-home');

		selection.container.header.navigation.home.append('i').attr('class','fa fa-home')

		selection.container.header.navigation.arrows = selection.container.header.navigation
			.append('div')
				.attr('class','d3b-navigation-arrows');

		selection.container.header.navigation.arrows.left = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d3b-left-arrow');

		selection.container.header.navigation.arrows.right = selection.container.header.navigation.arrows
			.append('div')
				.attr('id','d3b-right-arrow');

		selection.container.header.navigation.arrows.left.append('i').attr('class','fa fa-chevron-left')

		selection.container.header.navigation.arrows.right.append('i').attr('class','fa fa-chevron-right')

		selection.container.header.navigation.categoryTabs = selection.container.header.navigation
			.append('ul')
				.attr('class','d3b-category-tabs');

		selection.container.header.navigation.logo = selection.container.header.navigation
			.append('img')
				.attr('class','d3b-dashboard-logo');

		selection.container.header.breadcrumbs = selection.container.header
			.append('div')
				.attr('class','d3b-dashboard-breadcrumbs');

		selection.container.header.breadcrumbs.svg = selection.container.header.breadcrumbs
			.append('svg')
				.attr('class','d3b-dashboard-breadcrumbs-svg');

		selection.container.sidebar = selection.container
			.append('div')
				.attr('class','d3b-dashboard-sidebar');


		selection.container.sidebar.sectionNav = selection.container.sidebar
			.append('div')
				.attr('class','d3b-sidebar-section-nav d3b-sidebar-container');

		selection.container.sidebar.sectionsHeader = selection.container.sidebar.sectionNav
			.append('div')
				.attr('class','d3b-sidebar-header')
				.text('Go To');

		selection.container.sidebar.subSections = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d3b-sub-sections');

		selection.container.sidebar.subSectionGroups = selection.container.sidebar.sectionNav
			.append('ul')
				.attr('class','d3b-sub-section-groups');

		selection.container.sidebar.filters = selection.container.sidebar
			.append('div')
				.attr('class','d3b-sidebar-filters d3b-sidebar-container');

		selection.container.sidebar.filtersHeader = selection.container.sidebar.filters
			.append('div')
				.attr('class','d3b-sidebar-header')
				.text('Filter By');

		controls.selection(selection.container.sidebar.filters)
			.on('change',function(d){
				dashboard.update();
			});

		selection.container.content = selection.container
			.append('div')
				.attr('class','d3b-dashboard-content');

		selection.container.content.dashboardCategory = selection.container.content
			.append('div')
				.attr('class','d3b-dashboard-category');

		// selection.container.content.chartPage = selection.container.content
		// 	.append('div')
		// 		.attr('class','d3b-chart-page-container');

		dashboardCategory
			.selection(selection.container.content.dashboardCategory)
			.on('pageChange.d3b-page-change',function(pageData, iOld, iNew){

				var temp = controlsHidden;
				if(!pageData.controls)
					pageData.controls = [];
				if(pageData.controls.length > 0){
					controlsHidden = false;
					selection.container.sidebar.filters.style('display', 'block');
				}else{
					controlsHidden = true;
					selection.container.sidebar.filters.style('display', 'none');
				}

				controls
					.data(pageData)
					.update(function(){
					});
				var animateFrom = null;
				if(iOld < iNew)
					animateFrom = 'right';
				else if(iNew < iOld)
					animateFrom = 'left';
				chartPage
					.selection(dashboardCategory.chartPageSelection())
					.data(pageData)
					.animateFrom(animateFrom)
					.update(function(){
						if(temp != controlsHidden){
							dashboard.update();
						}
					})
					.animateFrom(null);

			});

		changeCurrentSection(currentDashboardData.dashboard.topSection);

		dashboard.update(callback);

		return dashboard;
	};

	//update chart
	dashboard.update = function(callback){

		//if generate required call the generate method
		if(generateRequired){
			return dashboard.generate(callback);
		}

		if(current.section == currentDashboardData.dashboard.topSection){
			selection.container.header.navigation.home
					.classed('d3b-innactive',true)
					.on('click.d3b-click',null);
		}else{
			selection.container.header.navigation.home
					.classed('d3b-innactive',false)
					.on('click.d3b-click',function(){
						changeCurrentSection(currentDashboardData.dashboard.topSection);
					});
		}

		if(navigationHistory.position+1 == navigationHistory.array.length){
			selection.container.header.navigation.arrows.right
					.classed('d3b-innactive',true)
					.on('click.d3b-click',null);
		}else{
			selection.container.header.navigation.arrows.right
					.classed('d3b-innactive',false)
					.on('click.d3b-click',function(){
						navigationHistory.position++;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('right')
								.data({data:current.category});
						dashboard.update();
					});
		}

		if(navigationHistory.position == 0){
			selection.container.header.navigation.arrows.left
					.classed('d3b-innactive',true)
					.on('click.d3b-click',null)
		}else{
			selection.container.header.navigation.arrows.left
					.classed('d3b-innactive',false)
					.on('click.d3b-click',function(){
						navigationHistory.position--;
						current = {category:navigationHistory.array[navigationHistory.position].category, section:navigationHistory.array[navigationHistory.position].section};
						resetSubSectionGroupBreadcrumbs();
						dashboardCategory
								.animateFrom('left')
								.data({data:current.category});
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

		if(current.section.sections.length == 0 && current.section.sectionGroups.length == 0){
			navigationHidden = true;
			selection.container.sidebar.sectionNav
				.style('display','none');
			}
		else{
			navigationHidden = false;
			selection.container.sidebar.sectionNav
				.style('display','block');
		}

		updateSubSections();
		updateSubSectionGroups();

		if(controlsHidden && navigationHidden){
			pageMargin = 10;
		}else{
			pageMargin = 210
		}

		pageWidth = width - pageMargin;

		selection.container.content
			.style('width',pageWidth+'px');

		selection.container.content
			.transition()
				.duration(animationDuration)
				.style('margin-left', pageMargin - 10 + 'px');

		dashboardCategory
			.width(pageWidth)
			.update()
			.animateFrom(null);

		chartPage
			.width(pageWidth)
			.update();

		d3.timer.flush();

		if(callback){
			callback();
		}

		return dashboard;
	};

	return dashboard;

};
