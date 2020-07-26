import React, { useState,useEffect } from 'react';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, LineMarkSeries, Hint, MarkSeriesCanvas} from 'react-vis';

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

fetch("http://localhost:9000/data/jira-users")
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

function compare( a, b ) {
  if ( b.x < a.x ){
    return -1;
  }
  if ( b.x > a.x ){
    return 1;
  }
  return 0;
}

var colors = {
  "01": "blue",
  "02": "blue",
  "03": "yellow",
  "04": "red",
  "05": "red",
  "06": "red",
  "07": "red",
  "08": "red",
  "09": "blue",
  "10": "blue",
  "11": "blue",
  "12": "blue"
}

function colorMap(month) {
  return colors[month];
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
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
  const [jiraUsers, setJiraUsers] = useState([]);

  const [tooltip, setTooltip] = useState(false);

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
          week: (currentWeekNumber - (52 - i) + 1 > 0) ? 
            ((i-(52-currentWeekNumber)+1) + "-"+new Date().getFullYear()) : 
            ( currentWeekNumber + i + 1) + "-" + (new Date().getFullYear()-1),
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

  useEffect(() => {
    fetch("http://localhost:9000/data/jira-users")
      .then(res => res.text())
      .then(res => {
        var users_chart = [];
        var result = JSON.parse(res);
        Object.keys(result).forEach((key,i)=>{
          users_chart.push({
            x:key,
            y:parseInt(result[key])
          });
        });
        users_chart = users_chart.sort(compare);
        setJiraUsers(users_chart);
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

        <h2>Jira Weekly unique users</h2>
        <XYPlot 
          onMouseLeave={() => {setTooltip(false)}}
          
          xType="ordinal"
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={jiraUsers}
            onNearestXY={(datapoint, event)=>{
              setTooltip(datapoint);
            }}/>
          <XAxis tickLabelAngle={90} />
          <YAxis />
          {tooltip ? <Hint value={tooltip} /> : null}
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
          onMouseLeave={() => {setTooltip(false)}}
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={weeks}
            onNearestXY={(datapoint, event)=>{
              setTooltip(datapoint);
            }}/>
          <LineSeries
            curve={'curveMonotoneX'}
            data={weeksAVG}/>
          <XAxis tickLabelAngle={90} />
          <YAxis />
          {tooltip ? <Hint value={tooltip} /> : null}
        </XYPlot>

        <h2>Git commits by day of the week</h2>
        <XYPlot
          width={800}
          height={600}>
          <HorizontalGridLines />
          <LineSeries
            data={days}/>
          <XAxis tickValues={[1, 2, 3, 4,5,6,7]} tickFormat={v => Math.round(v)}/>
          <YAxis />
        </XYPlot>

        
      </header>
      
    </div>
  );
}

export default App;
