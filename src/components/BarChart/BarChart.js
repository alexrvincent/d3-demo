import React from 'react';
import { drawBarChart } from '../../visualizations/demo.js'

export default class BarChart extends React.Component {
  componentDidMount() {
     drawBarChart(this.props);
  }
  componentDidUpdate(){
    drawBarChart(this.props);
  }

  // Let D3 / viz handle all DOM manipulation via drawDemo + react's props
  shouldComponentUpdate(){
    return false;
  }

  render(){
    return (
      <svg className='barchart' width="100%" height="500px"/>
    )
  }
} 