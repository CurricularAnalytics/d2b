require 'csv'
require 'json'

puts 'Enter a reporting year:'
reporting_year = gets
reporting_year = reporting_year.strip
reporting_year = (reporting_year != nil && reporting_year != '') ? reporting_year : '2013_14'

intended_columns = {};
accepted_columns = {};
columns = [];
year_ammounts = ['4_year', '5_year', '6_year'];


year_ammounts.each do |y|

  accepted_columns[y] = [];

  CSV.foreach('./by_college/accepted_major_grad_rate_'+reporting_year+'.csv', :headers => true) do |row|

    accepted_columns[y].push({
      'x': row['college'],
      'y': (row[y]) ? row[y].gsub('%', '').to_f : 0
      });

  end

  columns.push({
    label:y.gsub('_','-').gsub('y','Y')+' Accepted Major Graduation Rate',
    values:accepted_columns[y]
  });
end


year_ammounts.each do |y|

  intended_columns[y] = [];

  CSV.foreach('./by_college/intended_major_grad_rate_'+reporting_year+'.csv', :headers => true) do |row|

    intended_columns[y].push({
      'x': row['college'],
      'y': (row[y]) ? row[y].gsub('%', '').to_f : 0
      });

  end

  columns.push({
    label:y.gsub('_','-').gsub('y','Y')+' Intended Major Graduation Rate',
    values:intended_columns[y]
  });

end

# columns = [];
#
# columns.push({
#   label:'4-Year Intended Major Graduation Rate',
#   values:intended_columns['4_year']
# });
# columns.push({
#   label:'5-Year Intended Major Graduation Rate',
#   values:intended_columns['5_year']
# });
# columns.push({
#   label:'6-Year Intended Major Graduation Rate',
#   values:intended_columns['6_year']
# });
# columns.push({
#   label:'4-Year Accepted Major Graduation Rate',
#   values:accepted_columns['4_year']
# });
# columns.push({
#   label:'5-Year Accepted Major Graduation Rate',
#   values:accepted_columns['5_year']
# });
# columns.push({
#   label:'6-Year Accepted Major Graduation Rate',
#   values:accepted_columns['6_year']
# });


puts columns.to_json;
