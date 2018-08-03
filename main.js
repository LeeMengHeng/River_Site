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
  ["LowerMassInputEstimate","MidpointMassInputEstimate","UpperMassInputEstimate","TotalCatchmentSurfaceArea","YearlyAverageDischarge"].forEach(function(g){
    var num=d[g];
    r[g]= [num.slice(0,num.length-1),num[num.length-1]];
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
    .on("mouseover", function(river_info){
      tool_tip
        .style("left", (river_info.coord[0] + 20) + "px")
        .style("top", (river_info.coord[1] - 10) + "px")
        .style("display","block")
        .html(river_info.name+ "," + " " + river_info.country)
    })

    .on("mouseout", function(river_info){
      tool_tip
        .style("display","none")
    })

})
