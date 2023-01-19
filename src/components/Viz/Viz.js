import React from 'react';
import { drawScatterPlot, drawCirclePacking, drawLineGraph } from '../../visualizations/demo.js'
import './Viz.css';

export default class Viz extends React.Component {
  componentDidMount() {
    // drawScatterPlot(this.props);
    drawCirclePacking(this.props);
  }
  componentDidUpdate(){
    // drawScatterPlot(this.props);
    drawCirclePacking(this.props);
  }

  // Let D3 / viz handle all DOM manipulation via drawDemo + react's props
  shouldComponentUpdate(){
    return false;
  }

  render(){
    return (
      <React.Fragment>
        {/* <div id='viz-area'/> */}
        <svg id='circle-packing' />
        
      </React.Fragment>
    )
  }
} 