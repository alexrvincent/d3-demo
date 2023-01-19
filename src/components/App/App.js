import React, { useState } from 'react';
import "./App.css"
import LineChart from "../LineChart/LineChart"
import PieChart from '../PieChart/PieChart'

const data = {
  pie: {
    "1": {
      a: 48, 
      b: 32, 
      c: 24, 
    },
    "2": {
      a: 75, 
      b: 15, 
      c: 10, 
    },
  }
}

function App() {

  const [ pieData, updatePieData ] = useState(data.pie["1"]);

  const updateDataSet = (e) => {
    if(e.target.dataset['chart'] === 'pie') {
      updatePieData(data.pie[e.target.dataset['set']]);
    }
  }

  return (
    <div className="App">

      <h1> D3 Demo </h1>

      {/* Line Chart */}
      <h2> Line Chart </h2>
      <LineChart id={'demo-line-chart'}/>

      {/* Pie Chart */}
      <h2> Pie Chart </h2>
      <button data-chart="pie" data-set="1" onClick={updateDataSet}> Use Data Set 1 </button>
      <button data-chart="pie" data-set="2" onClick={updateDataSet}> Use Data Set 2 </button>
      <PieChart id={'demo-pie-chart'} data={pieData}/>

    </div>
  );
}

export default App;
