import React, { useState,useEffect } from 'react';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, Crosshair} from 'react-vis';


fetch("http://localhost:9000/data/repos")
      .then(res => res.text())
      .then(res => console.log(JSON.parse(res)));
      

function App() {
  const [hours, setHours] = useState([]);
  const [days, setDays] = useState([]);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:9000/data/hourly")
      .then(res => res.text())
      .then(res => {
        var hours_chart = JSON.parse(res).map((num,i)=>({
          x:i,
          y:num
        }));
        setHours(hours_chart);
      });
  },[]);

  useEffect(() => {
    fetch("http://localhost:9000/data/daily")
      .then(res => res.text())
      .then(res => {
        var days_chart = JSON.parse(res).days.map((num,i)=>({
          x:i+1,
          y:num
        }));
        setDays(days_chart);

        var weeks_chart = JSON.parse(res).weeks.map((num,i)=>({
          x:52-i,
          y:num
        }));
        setWeeks(weeks_chart);
      });
  },[]);
  
  var sum_weeks = 0;
  var sum_days = 0;
  var sum_hours = 0;
  weeks.forEach(element => {
    sum_weeks+=element.y;
  });
  days.forEach(element => {
    sum_days+=element.y;
  });
  hours.forEach(element => {
    sum_hours+=element.y;
  });
  console.log('hours: ' + sum_hours);    
  console.log('days: ' + sum_days);    
  console.log('weeks: ' + sum_weeks);    

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

        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={weeks}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        <XYPlot
          width={300}
          height={300}>
          <HorizontalGridLines />
          <LineSeries
            data={days}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        
      </header>
      
    </div>
  );
}

export default App;
