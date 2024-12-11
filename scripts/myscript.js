// add your JavaScript/D3 to this file
// myscript.js

// myscript.js

const width = 600;
const height = 800;

const svg = d3.select("div#plot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

const projection = d3.geoMercator()
  .center([-73.97, 40.75])
  .scale(55000)
  .translate([width/2, height/2]);

const path = d3.geoPath().projection(projection);
let colorScale = d3.scaleSequential(d3.interpolateBlues);

d3.json("smart_location/data/manhattan.geojson").then(data => {
  const varName = "D5CRI";
  const values = data.features.map(d => +d.properties[varName]).filter(v => !isNaN(v));
  const minVal = d3.min(values);
  const maxVal = d3.max(values);
  colorScale.domain([minVal, maxVal]);

  svg.selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", d => {
      const val = d.properties[varName];
      return isNaN(val) ? "#ccc" : colorScale(val);
    })
    .attr("stroke", "grey")
    .attr("stroke-width", 0.1)
    .attr("fill-opacity", 0.8)
    .on("mouseover", (event, d) => {
      const val = d.properties[varName];
      tooltip.style("opacity", 1)
        .html(`<strong>Regional Centrality Index:</strong> ${val !== undefined ? val.toFixed(2) : "N/A"}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Legend
  const legendWidth = 200;
  const legendHeight = 10;
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

  const steps = 10;
  const stepValues = d3.range(steps).map(i => minVal + i*(maxVal - minVal)/(steps-1));
  stepValues.forEach((sv, i) => {
    gradient.append("stop")
      .attr("offset", (i/(steps-1))*100 + "%")
      .attr("stop-color", colorScale(sv));
  });

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legendGradient)");

  legend.append("text")
    .attr("x", 0)
    .attr("y", -2)
    .style("text-anchor", "start")
    .style("font-size", "12px")
    .text(minVal.toFixed(2));

  legend.append("text")
    .attr("x", legendWidth)
    .attr("y", -2)
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .text(maxVal.toFixed(2));

  legend.append("text")
    .attr("x", legendWidth/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Regional Centrality Index");
});
