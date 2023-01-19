import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import "./PieChart.css";

const PieChart = (props) => {

  const containerRef = useRef({})
  const [ drawn, setDrawn ] = useState(false); 


  // Initial Draw Method
  const drawPieChart = (props) => {

    // 1. Set the dimensions and margins of the graph
    const width = props.width || 0, height = props.height || 0;

    // 2. Let the radius of the pie chart be half of the width or height (whichever is smaller) minus some margin;
    const radius = Math.min(width, height) / 2;

    // 3. Append the root SVG element to the parameters we specified. This boilerplate set-up is common on all d3 visualizations.
    const svg = d3.select(`#${props.id}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .classed("pie-chart", true);

    const arc = d3.arc()
      .outerRadius(radius);

    function tweenPie(b) {
      b.innerRadius = 0;
      const i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
      return (t) => arc(i(t));
    }

    // 4. Map the domain of the dataset (each slice of the pie) to a color via an ordinal scale
    const color = d3.scaleOrdinal()
      .domain(props.data)
      .range(["#2A6965", "#4EA19B", "#C3DFDE"])

    // 5. Create a D3 pie object constructor, defining a simple data mapping from its input to output
    const pie = d3.pie()
      .value((d) =>  d.value)

    // 6. Join the pie chart data with the pie chart constructor feeding it the pie chart data
    const pieChartJoinedData = pie(d3.entries(props.data))

    // 7. Draw the pie chart using our joined data to create each slice using the d3.arc function
    svg
      .selectAll('pieSlice')
      .data(pieChartJoinedData)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(0)
      )
      .attr('fill', (d) => color(d.data.key))
      .each(function(d) { this._current = d; })
      .classed("pie-slice", true)

    svg
      .selectAll('path')
      .transition()
        .ease(d3.easeExpInOut)
        .duration(1000)
        .attrTween("d", tweenPie)

    svg.append("g")
      .attr('class')

  }

  // Update Method
  const updatePieChart = (props, dimensions) => {
  
    var pie = d3.pie()
      .value((d) =>  d.value)

    var pieChartJoinedData2 = pie(d3.entries(props.data))

    var width = dimensions.width || 0, height = dimensions.height || 0;

    var radius = Math.min(width, height) / 2;

    var arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }

    d3
      .select(`#${props.id}`)
      .selectAll('path')
      .data(pieChartJoinedData2)
      .transition()
        .ease(d3.easeBackInOut)
        .duration(1000)
        .attrTween("d", arcTween)

  }

  // Always redraw the graph if the data changes
  useEffect(() => {
    if(containerRef.current && !drawn) {

      const { width, height } =  containerRef.current.getBoundingClientRect();

      drawPieChart({
        width,
        height,
        ...props
      });

      setDrawn(true);

    } else if (containerRef.current && drawn) {

      const { width, height } =  containerRef.current.getBoundingClientRect();
      const dimensions = {
        width,
        height,
      }

      updatePieChart(props, dimensions)
    }
  }, [props.data, containerRef]);


  // Return 
  return (
    <div className={`${props.id}-container`} >
      <div id={props.id} className={props.id} ref={containerRef}/>
    </div>
  )

}

export default PieChart