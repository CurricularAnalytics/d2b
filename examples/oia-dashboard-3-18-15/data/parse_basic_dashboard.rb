require 'csv'
require 'json'


def make_college_school_section_group(section)
  if !section[:sectionGroups]
    section[:sectionGroups] = []
  end
  section[:sectionGroups].push({
      name:"College / School",
      "sections":college_school_sections
    })
end

def college_school_sections
  colleges = [];
  @colleges.each{|ck, cv|
    # puts cv[:majors].keys.length
    colleges.push({
        "key":"college_school_"+ck,
        "name":ck,
        "categories":[
          {
            "name":"Student",
            "charts":[
              {
                "reference":ck + '_college_grad_rate_chart',
                "x":0,
                "y":0,
                "width":1,
                "height":350 + 50 * cv[:majors].keys.length
              }
            ]
          },
          {"name":"Faculty",
            "charts":template_charts_reference
          },
          {
            "name":"Financial",
            "charts":template_charts_reference
          }
        ]
      })
  }
  return colleges
end

#add charts to dashboard Object
def make_charts(charts)
  charts["GraduationRatesAll"] = allGradRatesChart
  @colleges.each{|ck, cv|
    charts[ck + '_college_grad_rate_chart'] = collegeGradRatesChart(ck, cv)
  }
  # charts["GraduationRatesAll"] = allGradRatesChart
end

def collegeGradRatesChart(name, college)
  chart = {
    type:"customBar",
    chartLayoutData:{
      data:{
        chartLayout:{
          title:name+" Student Graduation Rates"
        }
      }
    },
    properties:{
      data:{
        data:{
          guages:collegeGradRatesGuages(college),
          chart:{
            type:"multiChart",
            data:{
              data:{
                charts:collegeGradRatesCharts(college)
              }
            }
          }
        }
      }
    }
  }

  collegeGradRatesGuages college

  return chart
end

def collegeGradRatesGuages (college)
  guages = [
    {
      label:"4-Year",
      percents:college[:values].select{|v| v[:year_count]=="4_year" && v[:type]=="accepted"}.map{|v| v[:y]/100}
    },
    {
      label:"5-Year",
      percents:college[:values].select{|v| v[:year_count]=="5_year" && v[:type]=="accepted"}.map{|v| v[:y]/100}
    },
    {
      label:"6-Year",
      percents:college[:values].select{|v| v[:year_count]=="6_year" && v[:type]=="accepted"}.map{|v| v[:y]/100}
    },
    {
      label:"4-Year Intended Major",
      percents:college[:values].select{|v| v[:year_count]=="4_year" && v[:type]=="intended"}.map{|v| v[:y]/100}
    },
    {
      label:"5-Year Intended Major",
      percents:college[:values].select{|v| v[:year_count]=="5_year" && v[:type]=="intended"}.map{|v| v[:y]/100}
    },
    {
      label:"6-Year Intended Major",
      percents:college[:values].select{|v| v[:year_count]=="6_year" && v[:type]=="intended"}.map{|v| v[:y]/100}
    }
  ]
  puts guages
  return guages

end


def collegeGradRatesCharts(college)
  labels = ['2011-12','2012-13','2013-14']
  charts = [];
  @columnInfo.each_with_index{|ci, index|
    charts.push({
      label:labels[index],
      key:labels[index],
      type:"interactiveBarChart",
      properties:{
        controls:{
          horizontal:{
            visible:false,
            enabled:true
          },
          yAxisLock:{
            enabled:true,
            maxStacked:150,
            maxNonStacked:100
          }
        },
        xScale:{
          type:"ordinal",
          domain:college[:majors].keys
        },
        yFormat:{
          units:{
            after:"%"
          }
        }
      },
      data:{
        data:{
          labels:{
            x:"Major",
            y:"Percentage"
          },
          columns:collegeGradRatesColumns(ci, college)
        }
      }
    })
  }
  return charts;
end

def collegeGradRatesColumns(columnInfo, college)
  columns = []
  columnInfo.each{|ci|
    columns.push(
      {
        "label":(ci[:type] == 'accepted')? ci[:year_count].gsub('_','-').gsub('y','Y') : ci[:year_count].gsub('_','-').gsub('y','Y')+" "+ci[:type].capitalize+" Major",
        "values":
          college[:majors].map{|mk, mv|
                                values = mv[:values].select{|v| v[:reporting_year] == ci[:reporting_year]&&v[:year_count] == ci[:year_count] &&v[:type] == ci[:type]};
                                if values.length > 0
                                  values = values[0];
                                  {x:values[:x], y:values[:y]};
                                end
                              }.select{|v| v}

      }
    )
  }
  return columns
end


def allGradRatesChart
  chart = {
    type:"customBar",
    chartLayoutData:{
      data:{
        chartLayout:{
          title:"UNM Student Graduation Rates"
        }
      }
    },
    properties:{
      data:{
        data:{
          guages:[
						{"label":'4-Year', "percents": [0.1239, 0.1502, 0.1505]},
						{"label":'5-Year', "percents": [0.3720, 0.3961, 0.3760]},
						{"label":'6-Year', "percents": [0.4582, 0.4818, 0.4757]},
						{"label":'4-Year Intended Major', "percents": [0.0345, 0.0389, 0.0505]},
						{"label":'5-Year Intended Major', "percents": [0.0751, 0.0884, 0.10]},
						{"label":'6-Year Intended Major', "percents": [0.0870, 0.1035, 0.1229]},
          ],
          chart:{
            type:"multiChart",
            data:{
              data:{
                charts:allGradRatesCharts
              }
            }
          }
        }
      }
    }
  }
  return chart
end

def allGradRatesCharts
  labels = ['2011-12','2012-13','2013-14']
  charts = [];
  @columnInfo.each_with_index{|ci, index|
    charts.push({
      label:labels[index],
      key:labels[index],
      type:"interactiveBarChart",
      properties:{
        controls:{
          horizontal:{
            visible:false,
            enabled:true
          },
          yAxisLock:{
            enabled:true,
            maxStacked:150,
            maxNonStacked:100
          }
        },
        xScale:{
          type:"ordinal",
          domain:@colleges_list
        },
        yFormat:{
          units:{
            after:"%"
          }
        }
      },
      data:{
        data:{
          labels:{
            x:"College",
            y:"Percentage"
          },
          columns:allGradRatesColumns(ci)
        }
      }
    })
  }
  return charts;
end

def allGradRatesColumns(columnInfo)
  columns = []
  columnInfo.each{|ci|
    columns.push(
      {
        "label":(ci[:type] == 'accepted')? ci[:year_count].gsub('_','-').gsub('y','Y') : ci[:year_count].gsub('_','-').gsub('y','Y')+" "+ci[:type].capitalize+" Major",
        "values":
          @colleges.map{|ck, cv|
                                values = cv[:values].select{|v| v[:reporting_year] == ci[:reporting_year]&&v[:year_count] == ci[:year_count] &&v[:type] == ci[:type]};
                                if values.length > 0
                                  values = values[0];
                                  {x:values[:x], y:values[:y]};
                                end
                              }.select{|v| v}

      }
    )
  }
  return columns
end

def template_charts_reference
  return [
      {
        "reference":"Template",
        "x":0,
        "y":0,
        "width":1,
        "height":700
      }
    ]

end

@columnInfo = [
  [
    {reporting_year: '2011_12', year_count: '4_year',type:'accepted'},
    {reporting_year: '2011_12', year_count: '5_year',type:'accepted'},
    {reporting_year: '2011_12', year_count: '6_year',type:'accepted'},
    {reporting_year: '2011_12', year_count: '4_year',type:'intended'},
    {reporting_year: '2011_12', year_count: '5_year',type:'intended'},
    {reporting_year: '2011_12', year_count: '6_year',type:'intended'},
  ],
  [
    {reporting_year: '2012_13', year_count: '4_year',type:'accepted'},
    {reporting_year: '2012_13', year_count: '5_year',type:'accepted'},
    {reporting_year: '2012_13', year_count: '6_year',type:'accepted'},
    {reporting_year: '2012_13', year_count: '4_year',type:'intended'},
    {reporting_year: '2012_13', year_count: '5_year',type:'intended'},
    {reporting_year: '2012_13', year_count: '6_year',type:'intended'},
  ],
  [
    {reporting_year: '2013_14', year_count: '4_year',type:'accepted'},
    {reporting_year: '2013_14', year_count: '5_year',type:'accepted'},
    {reporting_year: '2013_14', year_count: '6_year',type:'accepted'},
    {reporting_year: '2013_14', year_count: '4_year',type:'intended'},
    {reporting_year: '2013_14', year_count: '5_year',type:'intended'},
    {reporting_year: '2013_14', year_count: '6_year',type:'intended'},
  ]
]

#Read Data into Colleges Object
reporting_years = ['2011_12', '2012_13', '2013_14'];

intended_columns = {};
accepted_columns = {};
columns = [];
year_ammounts = ['4_year', '5_year', '6_year'];

types = ['accepted', 'intended'];
folders = ['accepted', 'intended'];

@colleges_list = [];

@colleges = {};

reporting_years.each do |reporting_year|
  year_ammounts.each do |y|
    types.each_with_index do |t|

      CSV.foreach('./by_college/'+t+'_major_grad_rate_'+reporting_year+'.csv', :headers => true) do |row|
        if(row['college'] != 'Unclassified')

          @colleges_list.push(row['college'])

          if(!@colleges[row['college']])
            @colleges[row['college']] = {majors:{},values:[]};
          end

          @colleges[row['college']][:values].push({
            reporting_year: reporting_year,
            year_count: y,
            type: t,
            x: row['college'],
            y: (row[y]) ? row[y].gsub('%', '').to_f : 0
            })

        end

      end

      CSV.foreach('./by_major/'+t+'_major_grad_rate_'+reporting_year+'.csv', :headers => true) do |row|

        if(row['college'] != 'Unclassified')

          if(!@colleges[row['college']][:majors][row['major']])
            @colleges[row['college']][:majors][row['major']] = {values:[]};
          end

          @colleges[row['college']][:majors][row['major']][:values].push({
            reporting_year: reporting_year,
            year_count: y,
            type: t,
            x: row['major'],
            y: (row[y]) ? row[y].gsub('%', '').to_f : 0
            })

        end

      end

    end

  end

end

@colleges_list = @colleges_list.uniq

dashboard = {
  dashboard:{
    charts:{
      "Template": {
        "type":"axisChart",
        "properties":{
          "data":{
            "data":{
              "labels":{
                "x":"Template x label",
                "y":"Template y label"
              },
              "columns":[
                {
                  "label":"data 1",
                  "type":"bar",
                  "values":[
                    {"x":1,"y":67},
                    {"x":2,"y":211},
                    {"x":3,"y":346},
                    {"x":4,"y":113}
                  ]
                }
              ]
            }
          }
        },
        "chartLayoutData":{
          "data":{
            "chartLayout":{
              "title":"Template",
              "footnote":"* This is something important to note for the chart",
              "source":["Office of Institutional Analytics", "Student Data Mart", "Fall 2013"]
            }
          }
        }
      },
    },
    topSection:{
      "key":"University_of_New_Mexico",
      "name":"University of New Mexico",
      "categories":[
        {
          "name":"Student",
          "charts":[
            {
              "reference":"GraduationRatesAll",
              "x":0,
              "y":0,
              "width":1,
              "height":1000
            }
          ]
        },
        {"name":"Faculty",
          "charts":template_charts_reference
        },
        {
          "name":"Financial",
          "charts":template_charts_reference
        }
      ],
      "sectionGroups":[
        {
          "name":"College / School",
          "sections":college_school_sections
        }
      ]
    }
  }
};




make_charts(dashboard[:dashboard][:charts]);
# make_college_school_sections(dashboard[:dashboard][:topSection]);

# puts dashboard[:dashboard][:charts]["GraduationRatesAll"]
# puts dashboard.to_json

File.open('../simple-dashboard.json', 'w'){|file| file.write(dashboard.to_json)}

# puts columns.to_json;
