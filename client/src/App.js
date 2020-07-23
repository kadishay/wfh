import React, { useState,useEffect } from 'react';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, LineMarkSeries} from 'react-vis';

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

const currentWeekNumber = (new Date()).getWeek();

fetch("http://localhost:9000/data/repos")
  .then(res => res.text())
  .then(res => console.log(JSON.parse(res)));
      
/*
fetch("http://localhost:9000/data/jira/2020-05")
  .then(res => res.text())
  .then(res => console.log(JSON.parse(res)));
*/

/*
fetch("https://guesty.atlassian.net/rest/api/2/search?jql=&fields=updated&maxResults=100&startAt=50")
  .then(res => res.text())
  .then(res => {
    console.log("----");
    console.log(JSON.parse(res))
  });
*/

var colors = {
  "01": "AliceBlue",
  "02": "AntiqueWhite",
  "03": "Aqua",
  "04": "Aquamarine",
  "05": "Azure",
  "06": "Beige",
  "07": "BurlyWood",
  "08": "CornflowerBlue",
  "09": "CadetBlue",
  "10": "Cornsilk",
  "11": "DarkCyan",
  "12": "DarkSeaGreen"
}

function colorMap(month) {
  return colors[month];
}

function App() {
  var d = new Date();
  var n = d.getMonth();

  const [hours, setHours] = useState([]);
  const [days, setDays] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [jira, setJira] = useState({});

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

  useEffect(() => {
    fetch("http://localhost:9000/data/jira")
      .then(res => res.text())
      .then(res => {
        
        var month_hours_chart = {};
        var result = JSON.parse(res);
        Object.keys(result).forEach((key) => {
          month_hours_chart[key] = result[key].map((num,i)=>({
            x:i+1,
            y:num
          }));
        });

        setJira(month_hours_chart);
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
        <h1>Engineering Engagement</h1>

        <h2>Jira Per Hour</h2>
        <XYPlot width={800} height={600}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          {Object.keys(jira).map(month=>{
            console.log(month);

            return (
              <LineMarkSeries
                style={{
                  strokeWidth: '3px'
                }}
                curve={'curveMonotoneX'}
                lineStyle={{stroke: colorMap(month.split("-")[1])}}
                /*markStyle={{stroke: 'blue'}}*/
                data={jira[month]}
                />
          )
          })}
        </XYPlot>

        <h2>Commits by hour of the day</h2>
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={hours}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        <h2>Commits by week 0 is current - going back 1 year - 52 weeks</h2>
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={weeks}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        <h2>Commits by day of the week</h2>
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
