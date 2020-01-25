
// Using jQuery, read our data and call visualize(...) only once the page is ready:
var CHART_MARGIN_TOP = 260;
var CHART1_MARGIN_LEFT = 400;
var CHART2_MARGIN_LEFT = 1000;

var TOOLTIP1_LEFT = 300;
var TOOLTIP2_LEFT = 900;

$(function() {
    d3.csv("data.csv").then(function(data) {
      // Write the data to the console for debugging:
      console.log(data);
      // Call our visualize function:
      visualize(data);
    });
  });

var visualize = function(data) {
  //Boilerplate:
  var margin = { top: 100, right: 100, bottom: 100, left: 100 },
      width = 1600 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
  

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var generate_chart = function(svg, id, margin_left) {
    return svg
      .append("g")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", id)
      .style("width", width + margin.left + margin.right)
      .style("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + (margin.left+margin_left) + "," + (margin.top+CHART_MARGIN_TOP) + ")");
  }

  var chart1 = generate_chart(svg, "chart1", CHART1_MARGIN_LEFT);
  var chart2 = generate_chart(svg, "chart2", CHART2_MARGIN_LEFT);

  // slider
  var slider = d3.select("#slider").select('#year');
  slider.on('input', function() {
    d3.select("body").select("svg").select("#chart1").remove();
    chart1 = generate_chart(d3.select("body").select("svg"), "chart1", CHART1_MARGIN_LEFT);

    d3.select("body").select("svg").select("#chart2").remove();
    chart2 = generate_chart(d3.select("body").select("svg"), "chart2", CHART2_MARGIN_LEFT);

    var enrollment1 = data.filter((d) => d.Year === "Fall " + this.value)
      .reduce((t,d) => t + parseFloat(d["Total Graduate"]), 0);
    d3.select('#gradCount')
      .text(enrollment1);
    
    var enrollment2 = data.filter((d) => d.Year === "Fall " + this.value)
      .reduce((t,d) => t + parseFloat(d["Total Undergraduate"]), 0);
    d3.select('#undergradCount')
      .text(enrollment2);

    draw(year, this.value);
  });

  var enrollment1 = data.filter((d) => d.Year === "Fall 2018")
    .reduce((t,d) => t + parseFloat(d["Total Graduate"]), 0);
  d3.select('#gradCount')
    .text(enrollment1);

  var enrollment2 = data.filter((d) => d.Year === "Fall 2018")
    .reduce((t,d) => t + parseFloat(d["Total Undergraduate"]), 0);
  d3.select('#undergradCount')
    .text(enrollment2);
  draw(2018, 2018);
  
  function percentage(p) {
    return (Math.round((p) / (Math.PI * 2) * 100) / 100) + "%";
  }
  
  // draw the pie graphs
  function draw(prevYear, year) { 
    
    // Compute the position of each group on the pie:
    var pieUndergrad = d3.pie()
      .value(function(d) {return d["Total Undergraduate"]; })

    var pieGraduate= d3.pie()
      .value(function(d) {return d["Total Graduate"]; })

    var pieTotal = d3.pie()
      .value(function(d) {return d.Total; })

    var enrollment1 = data.filter((d) => d.Year === "Fall " + year)
      .reduce((t,d) => t + parseFloat(d["Total Graduate"]), 0)
    var radius1 = Math.sqrt(enrollment1) * 4;

    var enrollment2 = data.filter((d) => d.Year === "Fall " + year)
      .reduce((t,d) => t + parseFloat(d["Total Undergraduate"]), 0)
    var radius2 = Math.sqrt(enrollment2) * 4;
    // var data_ready = pie(data)

    // Div styling:
    var div = d3.select("body").append("div")
    .style("background-color", "#FFFFFF")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Tooltip:
    var generate_mouseover = function(left, total, percent_m, percent_f) {
      return function(d, i) { 
          div.transition()		
            .duration(200)
            .style("opacity", 0.9)
          div.html("Country: " + d.data["Country"] + "</br>"
            + "Enrollment: "  + d.data[total] + "</br>"
            + "Percentage: " + percentage(100 * (d.endAngle - d.startAngle)) + "</br>"
            + "Male : Female = " + Math.round(d.data[percent_m]) + " : " + Math.round(d.data[percent_f]))
            .style("left", (margin.left + left) + "px")
            .style("top", "500px");	
      }
    }
    var mouseover1 = generate_mouseover(TOOLTIP1_LEFT, "Total Graduate", "Percent_M_Graduate", "Percent_F_Graduate");
    var mouseover2 = generate_mouseover(TOOLTIP2_LEFT, "Total Undergraduate", "Percent_M_Undergraduate", "Percent_F_Undergraduate");

    var mouseout = function(d, i) { 
        div.transition()		
          .duration(200)		
          .style("opacity", 0);
    }

    var tooltip = d3.select("#chart1")
		.append('div')
		.attr('class', 'tooltip');

    // Visualization Code:

    // var color = d3.scaleOrdinal()
    // .domain(["China", "India", "South Korea", "Korea, South", "Taiwan", "Other"])
    // .range(["#de425b", "#e59550", "#d6d988", "#d6d988", "#78b58c", "#448888"])

    var maleColor = d3.scaleLinear()
    .domain([50,80])
    .range(["#918BFF", "#0A00C6"])

    var femaleColor = d3.scaleLinear()
    .domain([50,80])
    .range(["#DAA4A4", "#B40000"])
    
    
    // Graduate
    chart1
    .selectAll("Country")
    .data(pieGraduate(data.filter(function(d) {
      return (d.Year === "Fall " + year);
    })))
    .remove()
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius1))
    .attr('fill', function(d){
  
       if (d.data.Percent_F_Graduate >= 50)
          return(femaleColor(d.data.Percent_F_Graduate))
        else 
          return(maleColor(d.data.Percent_M_Graduate))
    })
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", 1)
    .on("mouseover", mouseover1)
    .on("mouseout", mouseout)


    // Undergraduate
    chart2
    .selectAll("Country")
    .data(pieUndergrad(data.filter(function(d) {
      return (d.Year === "Fall " + year);
    })))
    .remove()
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius2))
    .attr('fill', function(d){
       if (d.data.Percent_F_Undergraduate >= 50)
          return(femaleColor(d.data.Percent_F_Undergraduate))
        else 
          return(maleColor(d.data.Percent_M_Undergraduate))
    })
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", 1)
    .on("mouseover", mouseover2)
    .on("mouseout", mouseout)
    
  }
};