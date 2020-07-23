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

fetch("http://localhost:9000/data/jira-month")
  .then(res => res.text())
  .then(res => console.log(JSON.parse(res)));

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
  const [weeksAVG, setWeeksAVG] = useState([]);
  const [jira, setJira] = useState({});
  const [jiraAVG, setJiraAVG] = useState({});

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

        var weeks_avg = [];
        for (var i=weeks_chart.length-1; i>=0; i--) {
          weeks_avg[i] = {
            x: weeks_chart[i].x,
            y: weeks_chart[i].y
          };

          if (weeks_chart[i-5]) {
            weeks_avg[i].y = Math.round((weeks_chart[i].y + weeks_chart[i-1].y + weeks_chart[i-2].y + weeks_chart[i-3].y + weeks_chart[i-4].y + weeks_chart[i-5].y)/6);
          } else if (weeks_chart[i-4]) {
            weeks_avg[i].y = Math.round((weeks_chart[i].y + weeks_chart[i-1].y + weeks_chart[i-2].y + weeks_chart[i-3].y + weeks_chart[i-4].y)/5);
          } else if (weeks_chart[i-3]) {
            weeks_avg[i].y = Math.round((weeks_chart[i].y + weeks_chart[i-1].y + weeks_chart[i-2].y + weeks_chart[i-3].y)/4);
          } else if (weeks_chart[i-2]) {
            weeks_avg[i].y = Math.round((weeks_chart[i].y + weeks_chart[i-1].y + weeks_chart[i-2].y)/3);
          } else if (weeks_chart[i-1]) {
            weeks_avg[i].y = Math.round((weeks_chart[i].y + weeks_chart[i-1].y)/2);
          } else {
            weeks_avg[i].y = weeks_chart[i].y;
          }
        }

        setWeeksAVG(weeks_avg);
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

        var month_hours_avg_chart = {
          before: [],
          after: []
        };
        var dataPrepBefore = {};
        var dataPrepAfter = {};
        Object.keys(result).forEach((key) => {
          if (["2019-10","2019-09","2019-08"].includes(key)) {
            result[key].forEach((num,i)=>{
              if (!dataPrepBefore[i]) {
                dataPrepBefore[i] = 0;
              }
              dataPrepBefore[i] += num;
            });
          }
          if (["2020-06","2020-05","2020-04"].includes(key)) {
            result[key].forEach((num,i)=>{
              if (!dataPrepAfter[i]) {
                dataPrepAfter[i] = 0;
              }
              dataPrepAfter[i] += num;
            });
          }
        });

        Object.keys(dataPrepBefore).forEach((key)=>{
          month_hours_avg_chart.before.push({
            x: parseInt(key),
            y: Math.round(dataPrepBefore[key]/3)
          });
        });

        Object.keys(dataPrepAfter).forEach((key)=>{
          month_hours_avg_chart.after.push({
            x: parseInt(key),
            y: Math.round(dataPrepAfter[key]/3)
          });
        });

        setJiraAVG(month_hours_avg_chart);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Engineering Engagement</h1>

        <h2>Jira Last 3M (Blue) VS. 2019 3 Month (Red)</h2>
        <XYPlot width={800} height={600}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
              <LineMarkSeries
                style={{
                  strokeWidth: '3px'
                }}
                curve={'curveMonotoneX'}
                lineStyle={{stroke: 'red'}}
                /*markStyle={{stroke: 'blue'}}*/
                data={jiraAVG.before}
                />
                <LineMarkSeries
                style={{
                  strokeWidth: '3px'
                }}
                curve={'curveMonotoneX'}
                lineStyle={{stroke: 'blue'}}
                /*markStyle={{stroke: 'blue'}}*/
                data={jiraAVG.after}
                />
          
        </XYPlot>

        <h2>Jira Per Hour last 12M</h2>
        <XYPlot width={800} height={600}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          {Object.keys(jira).map(month=>{
            return (
              <LineMarkSeries
                key={month}
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

        <h2>Git commits by hour of the day - last 20k commits</h2>
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={hours}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        <h2>Git commits by week 0 is current - going back 1 year - 52 weeks - with 6m running average </h2>
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={weeks}/>
          <LineSeries
            curve={'curveMonotoneX'}
            data={weeksAVG}/>
          <XAxis />
          <YAxis />
        </XYPlot>

        <h2>Git commits by day of the week</h2>
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
