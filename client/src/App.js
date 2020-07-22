import React, { useState,useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

function App() {
  const [hours, setHours] = useState([]);
  const [days, setDays] = useState([]);

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
    fetch("http://localhost:9000/data/daily")
      .then(res => res.text())
      .then(res => setDays(JSON.parse(res)));
  },[]);
  
  console.log(hours);    


  return (
    <div className="App">
      <header className="App-header">
        <XYPlot
          width={300}
          height={300}>
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
