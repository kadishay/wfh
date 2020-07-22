import React, { useState,useEffect } from 'react';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, Crosshair} from 'react-vis';


fetch("http://localhost:9000/data/repos")
      .then(res => res.text())
      .then(res => console.log(JSON.parse(res)));
      

function App() {
  const [hours, setHours] = useState([]);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:9000/data/hourly")
      .then(res => res.text())
      .then(res => {
        var hours_chart = JSON.parse(res).map((num,i)=>({
          x:i,
          y:num
        }))
        setHours(hours_chart)
      });
  },[]);

  useEffect(() => {
    fetch("http://localhost:9000/data/weekly")
      .then(res => res.text())
      .then(res => setWeeks(JSON.parse(res)));
  },[]);
  
  console.log(weeks);    

  return (
    <div className="App">
      <header className="App-header">
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={hours}/>
          <XAxis />
          <YAxis />
        </XYPlot>
      </header>
      
    </div>
  );
}

export default App;
