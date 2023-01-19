import * as d3 from 'd3';
import * as hierarchy from 'd3-hierarchy'
import packingData from './packing2.json';

const Library = require('@observablehq/stdlib');
const library = new Library.Library();


export const drawScatterPlot = (props) => {

// Step 1: Set the dimensions and margins of the graph; the playground D3 needs to scale things correctly
var margin = {top: 10, right: 40, bottom: 30, left: 30},
  width = 450 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Step 2: Append the actual svg object to the body of the page, setting the dimensions defined in step 1.
var sVg = d3.select("#viz-area") // In jQuery fashion, use d3 to DOM-select our visualization area
  .append("svg") // And add our svg (the HTML building block we'll use to build our library)
  .attr("width", width + margin.left + margin.right) // The width of this svg will be that we specified. Note this selected value isn't special by any means.
  .attr("height", height + margin.top + margin.bottom) // And the height will also be what we specified. Note this selected value isn't special by any means.
  .append("g") // Start drawing the wrapper as the first 'child' of our svg, giving it a 'padding' by ...
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // adding an attribute wheich push the axis' in a little so we can see the eventual tick values

// Step 3.1: Create an x-axis function for the svg to 'plot' things. x(pt) will correctly plot the point 'pt' on the x-axis at the correct scale relative to the max dimensions of the axis.
var x = d3.scaleLinear()    // First, tell d3 we want all elements that get plotted on the x axis to scale linearly (1-1).
  .domain([0, 100])         // We then specify a domain - the raw min / max input values - to be somewhere between 0 and 100. This sets a boundary on the graph to create a nicely even plot distribution.
  .range([0, width]);       // Finally, we specify a range - the computed min / max input values AFTER we scale the domain input. This maps to an exact pixel value we'll plot the point on in the axis.
  sVg
  .append('g')              // Start drawing a line
  .attr("transform", "translate(0," + height + ")") // That is positioned at the height (SVG origin is in the top left!), so the bottom of the entire SVG chart.
  .call(d3.axisBottom(x)); // And use d3 and our x() function to generate a nice sequence of organized tick marks that'll get added to this line - now our x-axis

// Step 3.2: Create a y-axis in the same way as the x-axis
var y = d3.scaleLinear()
  .domain([0, 100])         
  .range([height, 0]);      // Except our range values are inverted (because going up and to the left is opposite to SVG's default down and to the right positioning)
  sVg
  .append('g')
  .call(d3.axisLeft(y));

// Step 4: Get yo' data. This can be loaded via an api call, but we'll hardcode it here for simplicity.
var data = [ {x:10, y:20}, {x:40, y:90}, {x:80, y:50} ]

// Step 5: Bind the data 
sVg.selectAll()            // First, select everything (in this case just the svg object we've just made)
  .append()                // Tell D3 we're going to start data binding
  .data(data)              // Pass the data we want to bind
  .enter()                 // Think of enter like the start of a 'for each' loop, iterating over each element in our 'data'.
  .append('circle')        // For each data point in our data set, append a circle with ...
    .attr("cx", function(d){ return x(d.x) }) // an x position at the scaled version of the data point's 'x' value (AKA: x(data.x))
    .attr("cy", function(d){ return y(d.y) }) // a y position at the scaled version of the data point's 'y' value (AKA: x(data.y))
    .attr("r", 7) // and a constant radius of 7

// Step 6: View it! All the data should be bound and updated.
}


export const drawCirclePacking = (props) => {

  const width = 1000;
  const height = width;

  const format = d3.format(",d");
  
  const pack = data => {
    return hierarchy.pack()
    .size([width - 2, height - 2])
    .padding(3)(d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value))
  }

  const root = pack(packingData);

  const color = d3.scaleSequential([8, 0], d3.interpolateInferno);

  const svg = d3.select("#circle-packing")
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")
      .attr("text-anchor", "middle");

  const shadow = library.DOM.uid("shadow");

  svg.append("filter")
      .attr("id", shadow.id)
    .append("feDropShadow")
      .attr("flood-opacity", 0.3)
      .attr("dx", 0)
      .attr("dy", 1);

  const node = svg.selectAll("g")
    .data(d3.nest().key(d => d.height).entries(root.descendants()))
    .join("g")
      .attr("filter", shadow)
    .selectAll("g")
    .data(d => d.values)
    .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => color(d.height));

  const leaf = node.filter(d => !d.children);
  
  leaf.select("circle")
      .attr("id", d => (d.leafUid = library.DOM.uid("leaf")).id);

  leaf.append("clipPath")
      .attr("id", d => (d.clipUid = library.DOM.uid("clip")).id)
    .append("use")
      .attr("xlink:href", d => d.leafUid.href);

  leaf.append("text")
      .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);

  node.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    
  return svg.node();
}


export const drawLineGraph = (props) => {
  // 1. Set up the dimensions and margins of the graph. Common d3 convention practice.
  var margin = {top: 10, right: 40, bottom: 30, left: 30},
  width = 450 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  // 2. Set up the number of datapoints
  const n = 7;

  // 3.1: Create an x-axis function for the svg to 'plot' things. x(pt) will correctly plot the point 'pt' on the x-axis at the correct scale relative to the max dimensions of the axis.
  const xScale = d3.scaleLinear()
    .domain([0, n-1]) // The min and max raw values our input domain can take on
    .range([0, width]); // The min and max COMPUTED (scaled) values our output domain will take on -> 

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
  var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right) // with a full width (adding back in the margins to demonstrate the entire take-up area)
    .attr("height", height + margin.top + margin.bottom) // as well as a full height
    .append("g") // start drawing the wrapper (group) of the graph
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // and push it in left and from the top to allow our axis numbers to show

  // 7. Add the x-axis to the page
  svg.append("g") // first create a group for it
    .attr("class", "x axis") // give it a css class for styling
    .attr("transform", "translate(0," + height + ")") // push it all the way to the bottom of the graph (because remember, svg's default position is in the top left)
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
