import React from 'react';
import "./PackingCircle.css";
import * as d3 from 'd3';
import * as hierarchy from 'd3-hierarchy'
import * as d3plus from 'd3plus';
//import packingData from './packing2.json';
import data from './data.json';

const Library = require('@observablehq/stdlib');
const library = new Library.Library();

function wrap(text, width) {
  text.each(function () {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.2, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          dy = -1, //parseFloat(text.attr("dy")),
          tspan = text.text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em");
      while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
          }
      }
  });
}

function measureWidth(text) {
  const context = document.createElement("canvas").getContext("2d");
  return context.measureText(text).width;
}

class PackingCircle extends React.Component {
  componentDidMount() {
    this.drawCirclePacking2(this.props);
  }
  componentDidUpdate(){
    this.drawCirclePacking2(this.props);
  }

  // Let D3 / viz handle all DOM manipulation via drawDemo + react's props
  shouldComponentUpdate(){
    return false;
  }

  drawCirclePacking = (props) => {

    function handleMouseOver(d){

      console.log(this);

      d3.select(this).attr({
        fill: "#FFFFFF",
      });
    }

    function handleMouseOut(d) {
      d3.select(this).style({
        fill: "black",
      });
    }

    const packingData = props.data;

    const width = 1000;
    const height = 1000;
  
    const format = d3.format(",d");
    
    const pack = data => {
      return hierarchy.pack()
      .size([width, height])
      .padding(1)(d3.hierarchy(data)
        .sum(d => d.value * Math.log(d.value))
        .sort((a, b) => b.value - a.value))
    }
  
    const root = pack(packingData);
  
    const color = d3.scaleSequential([4, 0], d3.interpolateInferno);
  
    const svg = d3.select("#circle-packing")
        .attr("viewBox", [0, 0, width, height])
        .attr('max-width', '100%')
        .style("font", "10px sans-serif")
        .attr("text-anchor", "middle")
  
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
      .attr("filter", d => {
        if(d.key === '0') return shadow
      })
      .selectAll("g")
      .data(d => d.values)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr('font-size', (d) => { return `10px` });
  
    node.append("circle")
        .attr("r", d => d.r)
        .attr("fill", d => { 
          if(d.height <= 0) {
            return '#e16120'
          } return 'white';
        })
        .style("fill-opacity", 0.7)
        
  
    const leaf = node.filter(d => !d.children);
    
    leaf.select("circle")
        .attr("id", d => (d.leafUid = library.DOM.uid("leaf")).id)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)

  
    // leaf.append("clipPath")
    //     .attr("id", d => (d.clipUid = library.DOM.uid("clip")).id)
    //     .append("use")
    //     .attr("xlink:href", d => d.leafUid.href);
  
    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
        // .attr("text-anchor", "middle")
        .attr('transform', d => `scale(${Math.max(d.value / 40, 0.75)})`)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
          .append('tspan')
          .attr("class", "circle-text")
          .attr("x", 0)
          // .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
            .text(d => d)
            .call(wrap, 10)

    // node.append("title")
    //     .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
      
    return svg.node();
  }

  drawCirclePacking2(props){
    // set the dimensions and margins of the graph
    var width = window.innerWidth
    var height = 2000

    // append the svg object to the body of the page
    var svg = d3.select(".circle-packing-wrapper")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font", "10px sans-serif")

    // create dummy data -> just one element per circle
    //var data = [{ "name": "A" }, { "name": "B" }, { "name": "C" }, { "name": "D" }, { "name": "E" }, { "name": "F" }, { "name": "G" }, { "name": "H" }]
    var { data } = props

    console.log(data);
    // Initialize the circle: all located at the center of the svg area
    var node = svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
        .attr("r", d => Math.log(d.value) * 75)
        .attr("cx", d => d.value / 2)
        .attr("cy", d => d.value / 2)
        .style("fill", "#3a9691")
        //.style("fill-opacity", 0.1)
        .attr("stroke", "#b3a2c8")
        .style("stroke-width", 4)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    // Features of the forces applied to the nodes:
    var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(.02)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(.2).radius(150).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function(d){
          node
              .attr("cx", function(d){ return d.x; })
              .attr("cy", function(d){ return d.y; })
        });

    // What happens when a circle is dragged?
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }
  }

  render(){
    return (
      <React.Fragment>
        <defs>
          <pattern id="image" x="0" y="0" height="40" width="40">
            <image x="0" y="0" width="40" height="40" xlinkHref="https://images.ctfassets.net/3vz37y2qhojh/6etvSde5Ht4fm58evYPeIy/bd590b8768655b7a9199a985f79925b2/browse-ingredients-chickenbreast_3x.jpg?w=128&fit=fill"/>
          </pattern> 
        </defs>
      <div className={'circle-packing-wrapper'}>
        <svg id='circle-packing'></svg>

      </div>
      </React.Fragment>
      
    )
  }
}

export default PackingCircle