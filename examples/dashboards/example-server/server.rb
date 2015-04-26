require 'sinatra'
require 'json'
require 'sinatra/cross_origin'

configure do
  enable :cross_origin
end

before do
  response['Access-Control-Allow-Origin'] = '*'
  # header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
end

post '/' do

  postData = JSON.parse(request.body.read)

  content_type :json


  data1 = {
    "charts":[
      {
        "chart":{
          "type":"axisChart",
          "key":"chart1",
          "properties":{
            "x":{"type":"ordinal"},
            "controls":{"hideLegend":{"enabled":true}},
            "data":{
              "data":{
                "labels":{
                  "x":"Template x label",
                  "y":"Template y label"
                },
                "types":[
                  {
                    "type":"bar",
                    "graphs":[
                      {
                        "label":"data 1",
                        "values":[
                          {"x":1,"y":267},
                          {"x":2,"y":311},
                          {"x":3,"y":746},
                          {"x":4,"y":213}
                        ]
                      }
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
        "x":0,
        "y":0,
        "width":0.5,
        "height":500
      },
      {
        "chart":{
          "type":"axisChart",
          "key":"chart2",
          "properties":{
            "x":{"type":"ordinal"},
            "controls":{"hideLegend":{"enabled":true}},
            "data":{
              "data":{
                "labels":{
                  "x":"Template x label",
                  "y":"Template y label"
                },
                "types":[
                  {
                    "type":"bar",
                    "graphs":[
                      {
                        "label":"data 1",
                        "values":[
                          {"x":1,"y":367},
                          {"x":2,"y":611},
                          {"x":3,"y":246},
                          {"x":4,"y":413}
                        ]
                      }
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
        "x":0.5,
        "y":0,
        "width":0.5,
        "height":500
      }
    ]
  }.to_json

  data2 = {
    "charts":[
      {
        "chart":{
          "type":"axisChart",
          "key":"chart1",
          "properties":{
            "x":{"type":"ordinal"},
            "controls":{"hideLegend":{"enabled":true}},
            "data":{
              "data":{
                "labels":{
                  "x":"Template x label",
                  "y":"Template y label"
                },
                "types":[
                  {
                    "type":"bar",
                    "graphs":[
                      {
                        "label":"data 1",
                        "values":[
                          {"x":1,"y":67},
                          {"x":2,"y":211},
                          {"x":3,"y":346},
                          {"x":4,"y":113}
                        ]
                      }
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
        "x":0,
        "y":0,
        "width":0.5,
        "height":500
      },
      {
        "chart":{
          "type":"axisChart",
          "key":"chart2",
          "properties":{
            "x":{"type":"ordinal"},
            "controls":{"hideLegend":{"enabled":true}},
            "data":{
              "data":{
                "labels":{
                  "x":"Template x label",
                  "y":"Template y label"
                },
                "types":[
                  {
                    "type":"bar",
                    "graphs":[
                      {
                        "label":"data 1",
                        "values":[
                          {"x":1,"y":67},
                          {"x":2,"y":211},
                          {"x":3,"y":346},
                          {"x":4,"y":113}
                        ]
                      }
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
        "x":0.5,
        "y":0,
        "width":0.5,
        "height":500
      }
    ]
  }.to_json


  filters = postData["controls"]

  if(filters)
    if(filters["testCheckbox"])
      if(filters["testCheckbox"]["state"])
        data1
      else
        data2
      end
    else
      data2
    end
  else
    data2
  end


end
