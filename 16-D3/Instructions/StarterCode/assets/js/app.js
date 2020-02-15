// @TODO: YOUR CODE HERE!
//create svg base - Master-C
var svgwdth = 950;
var svghght = 520;

//margin objects
var margin = {top: 20, right: 40, 
    bottom: 70, 
    left: 50
};

//Build Chart Width
var width = svgwdth - margin.left - margin.right;
var height = svghght - margin.top - margin.bottom;

//Creation of svg wrapper
var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", svgwdth)
	.attr("height", svghght);

//Append svg ; 
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

//Set x axis default.
var defaultX = "poverty";

//------Draw SVG chart-----//

//Read in csv data
d3.csv("assets/data/data.csv").then((dataset, error) =>{
    if (error) throw error;
    //parse data (floats?)
    dataset.forEach((d)=>{
        d.poverty = parseFloat(d.poverty);
        d.healthcare = parseFloat(d.healthcare);
    });

    //apply xScale function
    var xLinearScale = xScale(dataset, defaultX);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d=> d.healthcare)])
    .range([height,0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append axises
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g")
    .call(leftAxis);

    //append initial plots
    var tmp = chartGroup.selectAll("circle")
      .data(dataset)
      .enter();
    
    //data points (circles)
    var plotGroup = tmp.append("circle")
      .classed("datum", true)
      .attr("cx", d=> xLinearScale(d[defaultX]))
      .attr("cy", d=> yLinearScale(d.healthcare))
      .attr("r", 12)
      .attr("fill", "blue")
      .attr("opacity", "0.5");

    //data point labels (state abbr)
    var plotGroup2 = tmp.append("text")
      .attr("dx", d=> xLinearScale(d[defaultX]))
      .attr("dy", d=> yLinearScale(d.healthcare)+3)
      .classed("stateText", true)
      .text((d) => d.abbr);


    //Create group for the x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`);

    //append axises
    var povertyLabel = labelsGroup.append("text")
    .attr("x",0)
    .attr("y",20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("Poverty Rate (%)")

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y",45)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Median Income ($)");

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Healthcare Rate (%)");

    plotGroup = updateToolTip(defaultX, plotGroup);

    //x axis event listener
    labelsGroup.selectAll("text").on("click", function(){
        var value = d3.select(this).attr("value");
        if (value !== defaultX) {

            defaultX = value;
            xLinearScale = xScale(dataset, defaultX);
            xAxis = renderAxis(xLinearScale, xAxis);

            plotGroup = renderPlot(plotGroup, xLinearScale, defaultX, "cx");
            plotGroup2 = renderPlot(plotGroup2, xLinearScale, defaultX, "dx");
            plotGroup = updateToolTip(defaultX, plotGroup);

            if (defaultX === "poverty"){
                povertyLabel.classed("active", true).classed("inactive", false);
                incomeLabel.classed("active", false).classed("inactive", true);
            }
            else{
                povertyLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", true).classed("inactive", false);
            }
        }
    })

});

//----- Support/Reference Functions ---///
function xScale (data, xaxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[xaxis])* 0.8,
        d3.max(data, d => d[xaxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale
}

//function for updating xAxis upon click
function renderAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}

//function to update circles group w/ transition
function renderPlot(plotGroup, newXScale, xaxis, xatr = 'cx'){

    plotGroup.transition()
    .duration(1000)
    .attr(xatr, d=> newXScale(d[xaxis]));

    return plotGroup
}

//function used to updating group with tooltip
function updateToolTip(xAxis, plotGroup) {

    if (xAxis === "poverty") {
      var label = "Poverty Rate (%):";
    }
    else {
      var label = "Median Income: $";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip, d3-tip")
      .offset([30, 90])
      .html(function(d) {
        return (`${d.state}<br> Healthcare Rate(%): ${d.healthcare}%<br>${label} ${d[xAxis]}`);
      });
  
    plotGroup.call(toolTip);
  
    plotGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return plotGroup;
  }

