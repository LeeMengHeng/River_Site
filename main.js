var svg = d3.select("svg");
var projection = d3.geoMercator().scale(80);
var path = d3.geoPath(projection);
var tool_tip = d3.select(".tooltip");
tool_tip.style("position", "absolute");

d3.queue()
.defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
.defer(d3.csv, "River_Info.csv", function(d){
  var r = {
    name:d.Catchment,
    country:d.Country,
    coord: projection([d.Longitude, d.Latitude]),
  };

  //Separating numbers in the table, for example: 3.5 x 104 --> ["3.5 x 10", "4"]
  ["LowerMassInputEstimate","MidpointMassInputEstimate","UpperMassInputEstimate","TotalCatchmentSurfaceArea","YearlyAverageDischarge"].forEach(function(g){
    var num=d[g];
    d[g]= [num.slice(0,num.length-1),num[num.length-1]];
  });

  Object.assign(r, {
    LowerM: d.LowerMassInputEstimate,
    Midpoint: d.MidpointMassInputEstimate,
    UpperM: d.UpperMassInputEstimate,
    TotalSurface: d.TotalCatchmentSurfaceArea,
    Yearly: d.YearlyAverageDischarge
  });
  return r;
})
.await(function(err, world, rivers){
  if (err) throw err;
  var feature = topojson.feature(world, world.objects.countries);
  svg.append("path")
    .datum(feature)
    .attr("d",path)
    .style("fill","none")
    .style("stroke","lightblue");

  svg.selectAll("circle")
    .data(rivers)
    .enter()
    .append("circle")
    .attr("cx",function(d){
      return d.coord[0]
    })
    .attr("cy",function(d){
      return d.coord[1]
    })
    .attr("r", 3)
    .style("fill", "pink")
    // Mouse over event handler
    .on("mouseover", function(river_info){
      // genEntry function take term and key from tool_tip html generation
      // <sup></sup> makes number into power 
      var genEntry = (term, key) => `
        <dt>${term}:</dt>
        <dd>${river_info[key][0]} <sup>${river_info[key][1]}</sup></dd>`;

      tool_tip
        .style("left", (river_info.coord[0] + 20) + "px")
        .style("top", (river_info.coord[1] - 10) + "px")
        .style("display","block")
        // dl = definition list, dt = definition title, dd = definition description
        .html(`<dl>
          <dt>Name:</dt>
          <dd>${river_info.name}</dd>
          <dt>Country:</dt>
          <dd>${river_info.country}</dd>
          ${genEntry("Lower Mass Input Estimate", "LowerM")}
          ${genEntry("Midpoint Mass Input Estimate", "Midpoint")}
          ${genEntry("Upper Mass Input Estimate", "UpperM")}
          ${genEntry("Total Catchment Surface Area", "TotalSurface")}
          ${genEntry("Yearly Average Discharge", "Yearly")}
          </dl>`)
    })

    .on("mouseout", function(river_info){
      tool_tip
        .style("display","none")
    })

})
