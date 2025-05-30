// Load the CSV file asynchronously
d3.csv("High_Frequency_Makes.csv").then(function(data) {
    
    // Convert 'Injury Severity' column to numerical values
    data.forEach(d => {
        d["Injury Severity"] = +d["Injury Severity"];
    });

    const margin = { top: 50, right: 100, bottom: 100, left: 150 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d["Categories"]))])
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d["Weather"]))])
        .range([height, 0])
        .padding(0.05);

    const maxSeverity = d3.max(data, d => d["Injury Severity"]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, maxSeverity]);

    // Append axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale));
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Vehicle Age (Years)");

    svg.append("text")
        .attr("transform", "rotate(-90")
        .attr("x", -height / 2)
        .attr("y", -100)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Weather Type");

    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "lightgrey")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("visibility", "hidden")
        .style("font-size", "12px");

    // Draw heatmap cells
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d["Categories"]))
        .attr("y", d => yScale(d["Weather"]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d["Injury Severity"]))
        .style("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .text(`% Severe Injury: ${d["Injury Severity"].toFixed(4)}`);
            d3.select(this).style("stroke", "red");
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            d3.select(this).style("stroke", "black");
        });

    // ======== ADD COLOR LEGEND (Color Bar) ========
    const legendHeight = 200, legendWidth = 20;
    const legendX = width + 30, legendY = (height - legendHeight) / 2;

    // Define legend scale
    const legendScale = d3.scaleLinear()
        .domain([0, maxSeverity])
        .range([legendHeight, 0]);

    // Create gradient for legend
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("x2", "0%")
        .attr("y1", "100%").attr("y2", "0%");

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(0));

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(maxSeverity));

    // Create legend group
    const legend = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    // Draw the color bar
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Add axis for legend
    legend.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(d3.axisRight(legendScale).ticks(5));

    // Legend label
    legend.append("text")
    .attr("x", 20)
    .attr("y", legendHeight + 30)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .selectAll("tspan")
    .data([
        "Proportion of",
        "Crashes with Major",
        "or Fatal Injuries"
    ])
    .enter()
    .append("tspan")
    .attr("x", 20)  // Keep x the same for alignment
    .attr("dy", (d, i) => i === 0 ? 0 : 15) // 15px spacing for each new line
    .text(d => d);


}).catch(error => console.error("Error loading the CSV file:", error));
