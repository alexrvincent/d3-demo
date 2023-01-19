import React, { useEffect } from 'react';
import * as d3 from 'd3';
import "./LineChart.css";

const LineChart = (props) => {

  const drawLineGraph = (props) => {
    // 1. Set up the dimensions and margins of the graph. Common d3 convention practice.
    var margin = {top: 10, right: 40, bottom: 30, left: 30},
    width = 450 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  
    // 2. Set up the number of datapoints
    const n = 7;
  
    // 3.1: Create an x-axis function for the svg to 'plot' things. x(pt) will correctly plot the point 'pt' on the x-axis at the correct scale relative to the max dimensions of the axis.
    const xScale = d3.scaleLinear()
      .domain([0, n-1]) // The min and max raw values our input domain can take on. Zero indexed so it's n-1.
      .range([0, width]); // The min and max COMPUTED (scaled) values our output domain will take on
  
    // 3.2. Create a y-axis function similar to the x-axis. Remember, we flip the range to get values because default SVG 'increasing' values go down and to the right (which is negative in normal graphs)
    const yScale = d3.scaleLinear()
      .domain([0, 1]) // input 
      .range([height, 0]); // output 
  
    // 4. Create a generic 'line' generator function (which is basically d3's line generator, with our scaling and custom visual aspects like curvature).
    const line = d3.line()
      .x(function(d, i) { return xScale(i); }) // All x values of our line should be scaled by the x-axis function we made.
      .y(function(d) { return yScale(d.y); }) // All y values of our line should be scaled by the y-axis function we made.
      .curve(d3.curveMonotoneX) // Use d3 magic to smooth out the line using a cubic spline generator. Monotone x means make the edges of the line smooth horizontally at the ends.
  
    // 5. Create a random dataset (an array of objects of length n). Each object will contain a random y value between 0 and 1 (aka our designated y domain of raw values)
    // We'll use the index of the data to ensure a continous line (otherwise we'll get a scatter plot)
    var dataset = d3.range(n).map(function(d, i) { 
      return {
        "y": d3.randomUniform(1)() ,
        'key': i
      } 
    })
  
    // 6. Add the SVG graph to the page 
    var svg = d3.select(`#${props.id}`).append("svg")
      .attr("width", width + margin.left + margin.right) // with a full width (adding back in the margins to demonstrate the entire take-up area)
      .attr("height", height + margin.top + margin.bottom) // as well as a full height
      .append("g") // start drawing the wrapper (group) of the graph
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // and push it in left and from the top to allow our axis numbers to show
  
    // 7. Add the x-axis to the page
    svg.append("g") // first create a group for it
      .attr("class", "x axis") // give it a css class for styling
      .attr("transform", `translate(0, ${height})`) // push it all the way to the bottom of the graph (because remember, svg's default position is in the top left)
      .call(d3.axisBottom(xScale)); // Use the helper d3.axisBottom with our custom scaling to append the x-axis
  
    // 8. Add the y-axis to the page (same process as x except no need to push it down)
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale));
  
    // 9. Append the path, bind the data, and call the line generator 
    var theLine = svg.append("path")
      .datum(dataset, function(d, i) { return `$path-${d.key}`}) // 10. Binds data to the line 
      .attr("class", "line") // Assign a class for styling 
      .attr("d", line); // 11. Calls the line generator 
  
    // 10. Appends a circle for each datapoint 
    var circles = svg.selectAll(".dot")
      .data(dataset, function(d, i) { return `$dot-${d.key}` })
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { return yScale(d.y) })
      .attr("r", 5)
        .on("mouseover", function(a, b, c) { 
          console.log(a) 
          // this.attr('class', 'focus')
      })
        .on("mouseout", function() {  })
        .on("mousemove", function () { });
  
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(dataset)
      .enter()
      .append('option')
      .text(function (d) { return d.y; }) // text showed in the menu
      .attr("value", function (d) { return d.y; }) // corresponding value returned by the button
  
    function update(selectedGroup) {
  
      var newDataset = d3.range(n).map(function(d) { 
        return {
          "y": d3.randomUniform(1)() 
        } 
      })
  
      theLine.datum(newDataset)
        .transition()
        .duration(1000)
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator 
  
      circles.data(newDataset)
      .transition()
      .duration(1000)
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { return yScale(d.y) })
      .attr("r", 5)
    }
  
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
    })
  
  }

  // Always redraw the line graph if the data changes
  useEffect(() => {
    drawLineGraph(props);
  }, [props.data]);


  // Return 
  return (
    <div>
      <select id="selectButton"/>
      <div id={props.id}/>
    </div>
  )

}

export default LineChart