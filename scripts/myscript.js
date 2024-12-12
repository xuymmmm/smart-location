// add your JavaScript/D3 to this file
// myscript.js

// add your JavaScript/D3 to this file
// myscript.js

// scripts.js

// Load the data with a row converter to parse numeric values
const rowConverter = function (d) {
  return {
    D5AR: +d.D5AR,
    D5CRI: +d.D5CRI,
    D3B_Cat: d.D3B_Cat.trim().toLowerCase(), // Normalize for consistent filtering
    D1C_Cat: d.D1C_Cat
  };
};

// Set up margins, width, and height for the SVG container
const margin = { top: 20, right: 200, bottom: 60, left: 60 }, // Increased right margin for legend
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Create an SVG element to hold the plot
const svg = d3.select("div#plot")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up scales for the x and y axes
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define a color scale for D1C_Cat categories
const colorScale = d3.scaleOrdinal()
                     .domain(["Low", "Medium", "High", "Very High"])
                     .range(["red", "green", "blue", "purple"]);

// Set up the tooltip
const tooltip = d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .style("position", "absolute")
                  .style("text-align", "left")
                  .style("width", "auto")
                  .style("height", "auto")
                  .style("padding", "8px")
                  .style("font", "12px sans-serif")
                  .style("background", "lightsteelblue")
                  .style("border", "0px")
                  .style("border-radius", "8px")
                  .style("pointer-events", "none")
                  .style("opacity", 0);

// Load the CSV data
d3.csv("https://raw.githubusercontent.com/xuymmmm/smart-location/refs/heads/main/data/data_new.csv", rowConverter).then(function(data) {

  // Set domain for the axes based on data with padding
  xScale.domain([d3.min(data, d => d.D5AR) * 0.95, d3.max(data, d => d.D5AR) * 1.05]);
  yScale.domain([d3.min(data, d => d.D5CRI) * 0.95, d3.max(data, d => d.D5CRI) * 1.05]);

  // Add X axis
  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(xScale));

  // Add Y axis
  svg.append("g")
     .call(d3.axisLeft(yScale));

  // Add axes labels
  svg.append("text") 
     .attr("x", width / 2) 
     .attr("y", height + margin.bottom - 15) 
     .attr("text-anchor", "middle") 
     .style("font-size", "14px") 
     .text("Jobs within 45 minutes"); 
      
  svg.append("text") 
     .attr("transform", "rotate(-90)") 
     .attr("x", -height / 2) 
     .attr("y", -margin.left + 20) 
     .attr("text-anchor", "middle") 
     .style("font-size", "14px") 
     .text("Regional Centrality Index"); 

  // Create a group for the scatterplot points
  const scatter = svg.append("g")
                     .attr("class", "scatterplot");

  // Function to render scatterplot points
  function renderScatter(filteredData) {
    // Bind the data to circles
    const circles = scatter.selectAll(".dot")
                           .data(filteredData, d => `${d.D5AR}-${d.D5CRI}-${d.D1C_Cat}-${d.D3B_Cat}`);

    // Handle exiting circles
    circles.exit()
           .transition()
           .duration(500)
           .attr("r", 0)
           .remove();

    // Handle updating existing circles
    circles.transition()
           .duration(500)
           .attr("cx", d => xScale(d.D5AR))
           .attr("cy", d => yScale(d.D5CRI))
           .style("fill", d => colorScale(d.D1C_Cat) || "purple");

    // Handle entering circles
    circles.enter()
           .append("circle")
           .attr("class", "dot")
           .attr("cx", d => xScale(d.D5AR))
           .attr("cy", d => yScale(d.D5CRI))
           .attr("r", 0)
           .style("fill", d => colorScale(d.D1C_Cat) || "purple")
           .style("opacity", 0.7)
           .on("mouseover", function(event, d) {
              tooltip.transition().duration(200).style("opacity", .9);
              tooltip.html("Regional Centrality Index: " + d.D5CRI + "<br>Jobs within 45 minutes: " + d.D5AR)
                     .style("left", (event.pageX + 5) + "px") 
                     .style("top", (event.pageY - 28) + "px"); 
           }) 
           .on("mouseout", function() { 
              tooltip.transition().duration(500).style("opacity", 0); 
           })
           .transition()
           .duration(500)
           .attr("r", 5);
  }

  // Initial rendering with all data
  renderScatter(data);

  // Add Legend for D1C_Cat
  const legendData = [
    { label: "Low", color: "red" },
    { label: "Medium", color: "green" },
    { label: "High", color: "blue" },
    { label: "Very High", color: "purple" }
  ];

  const legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width + 20}, 0)`); // Position legend to the right

 legend.append("text")
      .attr("x", 0)
      .attr("y", -10) // Position above the first legend item
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text("D1C: Gross Employment Density Level");

// Add colored rectangles to the legend
legend.selectAll(".legend-rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("class", "legend-rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25) // Adjusted positioning
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => d.color)
      .style("stroke", "black"); // Optional: Add a stroke for debugging visibility

// Add labels to the legend
legend.selectAll(".legend-text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("class", "legend-text")
      .attr("x", 25) // Position to the right of rectangles
      .attr("y", (d, i) => i * 25 + 9) // Align with the center of the rectangles
      .attr("dy", ".35em") // Vertical alignment for text
      .text(d => d.label)
      .style("font-size", "8px")
      .attr("alignment-baseline", "middle");

  // Function to update the scatterplot based on selected D3B_Cat
  function updateScatter(selectedCategory) {
    let filteredData;
    if (selectedCategory === "all") {
      filteredData = data;
    } else {
      filteredData = data.filter(d => d.D3B_Cat === selectedCategory);
    }

    renderScatter(filteredData);
  }

  // Add event listener to the dropdown menu
  d3.select("#filter").on("change", function() {
    const selectedOption = d3.select(this).property("value").toLowerCase();
    updateScatter(selectedOption);
  });
// Append a paragraph for user instructions
  d3.select("div#plot")
  .append("p")
  .attr("class", "user-instruction")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .style("margin-top", "20px")
  .text("Instructions: Use the dropdown menu above to filter the data by category. Hover over the scatterplot points to see details about the 'Regional Centrality Index' and 'Jobs within 45 minutes'. The legend on the right indicates the employment density levels, represented by different colors.");
  
  // Append findings header
   d3.select("div#plot")
  .append("p")
  .attr("class", "findings-header")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .style("margin-top", "20px")
  .text("Findings:");

// Append each finding point
   const findings = [
  "1. Linear Relationship Strength: As the street intersection density decreases, the positive linear relationship between Jobs within 45 minutes and Regional Centrality Index weakens. This indicates that urban design factors (like street connectivity) significantly enhance regional centrality when employment opportunities are geographically accessible.",
  "2. Spread and Clustering: Higher street intersection density leads to more compact data points, reflecting better regional integration and accessibility. Conversely, lower density increases the spread, suggesting less connectivity and centrality in areas with sparse street networks.",
  "3. Employment Density Distribution: At higher street intersection densities, employment density categories (Low, Medium, High, Very High) are more mixed, reflecting better integration across urban regions. In contrast, at lower densities, specific employment density categories dominate distinct areas of the graph, indicating less regional integration."
];

   findings.forEach(finding => {
   d3.select("div#plot")
    .append("p")
    .attr("class", "finding-point")
    .style("font-size", "14px")
    .style("margin-left", "20px")
    .style("margin-top", "10px")
    .text(finding);
});

// Append possible reasons header
   d3.select("div#plot")
  .append("p")
  .attr("class", "reasons-header")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .style("margin-top", "20px")
  .text("Possible Reasons for Differences:");

// Append each possible reason point
   const reasons = [
  "1. Urban Connectivity: Higher street intersection densities correspond to urban areas with more integrated street networks, facilitating greater accessibility to jobs within shorter travel times. This contributes to higher centrality.",
  "2. Regional Land Use Patterns: High and very high street intersection densities likely represent urban cores, where employment opportunities are denser and well-distributed. Medium and low densities correspond to less urbanization areas with fewer jobs and less centrality.",
  "3. Transportation and Infrastructure: Regions with low street intersection density may lack robust transportation infrastructure, increasing travel times and reducing access to jobs, thereby lowering regional centrality.",
  "4. Economic and Spatial Planning: Urban areas with high connectivity tend to prioritize mixed-use developments, while lower connectivity areas may focus more on single-use zoning, contributing to the observed variations in employment density distribution and centrality."
];

    reasons.forEach(reason => {
    d3.select("div#plot")
    .append("p")
    .attr("class", "reason-point")
    .style("font-size", "14px")
    .style("margin-left", "20px")
    .style("margin-top", "10px")
    .text(reason);
});

});
