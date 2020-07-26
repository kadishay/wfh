var express = require("express");
var router = express.Router();
const https = require('https');
const http = require('http');
var secret = require('../../secret');
var jira = require('../jira.json');
var git = require('../git.json');

router.get("/repos", function(req, res, next) {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
    protocol: 'https:',
    hostname: 'api.github.com',
    path: '/orgs/guestyorg/repos'
  };
  https.get(options, (resp) => {
    let data = '';
  
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      data = JSON.parse(data);

      res.send(data);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
});

router.get("/hourly", function(req, res, next) {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
    protocol: 'https:',
    hostname: 'api.github.com',
    //path: '/orgs/guestyorg/repos'
    path: '/repos/guestyorg/guesty/stats/punch_card'
  };
  https.get(options, (resp) => {
    let data = '';
  
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      /*
        0-6: Sunday - Saturday
        0-23: Hour of day
        Number of commits
      */
      const hours = new Array(24);
      hours.fill(0);
      data = JSON.parse(data);

      data.forEach((day)=>{
        hours[day[1]] += day[2];
      });

      res.send(hours);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
});

router.get("/daily", function(req, res, next) {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
    protocol: 'https:',
    hostname: 'api.github.com',
    //path: '/repos/guestyorg/legacy-calculator/stats/commit_activity'
    path: '/repos/guestyorg/guesty/stats/commit_activity'
  };
  https.get(options, (resp) => {
    let data = '';
  
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      const days = new Array(7);
      const weeks = new Array(52);
      days.fill(0);
      weeks.fill(0);
      data = JSON.parse(data);
      try {
        data.forEach((week,i)=>{
          weeks[i] += week.total;
          week.days.forEach((day,j)=>{
            days[j] += day;
          });
        });
      }
      catch(err) {
        console.log(err);
      }
 

      const result = {days,weeks}

      res.send(result);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

});

router.get("/weekly", function(req, res, next) {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
    protocol: 'https:',
    hostname: 'api.github.com',
    //path: '/repos/guestyorg/legacy-calculator/stats/commit_activity'
    path: '/repos/guestyorg/guesty/stats/participation'
  };
  https.get(options, (resp) => {
    let data = '';
  
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {
      const weeks = new Array(52);
      weeks.fill(0);
      data = JSON.parse(data);

      res.send(data);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

});

router.get("/trend", function(req, res, next) {
  res.send(git);
});

/*

{
      "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
      "id": "61025",
      "self": "https://guesty.atlassian.net/rest/api/2/issue/61025",
      "key": "ACC-13",
      "fields": {
        "updated": "2020-03-26T12:41:08.195+0000",
        "assignee": {
          "self": "https://guesty.atlassian.net/rest/api/2/user?accountId=5c98ee60beb7ed09e701402f",
          "accountId": "5c98ee60beb7ed09e701402f",
          "emailAddress": "X@guesty.com",
          "avatarUrls": {
            "48x48": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5c98ee60beb7ed09e701402f/3fc11cdc-136d-49f9-9084-cbd4805748b8/48",
            "24x24": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5c98ee60beb7ed09e701402f/3fc11cdc-136d-49f9-9084-cbd4805748b8/24",
            "16x16": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5c98ee60beb7ed09e701402f/3fc11cdc-136d-49f9-9084-cbd4805748b8/16",
            "32x32": "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5c98ee60beb7ed09e701402f/3fc11cdc-136d-49f9-9084-cbd4805748b8/32"
          },
          "displayName": "X Y",
          "active": true,
          "timeZone": "Etc/GMT",
          "accountType": "atlassian"
        }
      }
    },
*/

router.get("/jira/:date", function(req, res, next) {  
  const hours = getMonthJira(req.params.date);
  
  res.send(hours);
});

router.get("/jira", function(req, res, next) {
  let month = {};

  var d = new Date();
  var m = d.getMonth();
  var current_month = m+1;
  var current_year = d.getFullYear();
  var counter = 0;

  //current year
  for (var i=current_month; i>0; i--) {
    counter++;
    var month_number = transalteMonth(i);
    month[current_year+"-"+month_number] = getMonthJira(current_year+"-"+month_number);
  }

  //pre year gap
  for (var j=12; j>12-counter; j--) {
    var month_number = transalteMonth(j);
    month[(current_year-1)+"-"+month_number] = getMonthJira((current_year-1)+"-"+month_number);
  }

  res.send(month);
});

router.get("/jira-month", function(req, res, next) {
  let data = {};

  var d = new Date();
  var start_year = 2017;
  var end_year = d.getFullYear();

  for (var year = start_year; year<= end_year; year++) {
    for (var month = 1; month <= 12; month ++) {
      var month_number = transalteMonth(month);
      var filteredResults = jira.filter((item)=>item.fields.updated.indexOf(year+"-"+month_number)===0);
      if (filteredResults.length) {
        data[year+"-"+month_number] = filteredResults.length;
      }
    }
  }

  res.send(data);
});

router.get("/jira-users", function(req, res, next) {
  var data = {};
  var result = {};

  var year, week;

  jira.forEach(item=>{
    year = new Date (item.fields.updated).getWeekYear();
    week = transalteMonth(new Date (item.fields.updated).getWeek());
    if(!data[year+"-"+week]) {
      data[year+"-"+week] = {
        contributers : {}
      };
    }
    var user = (item.fields && item.fields.assignee) ?  item.fields.assignee.emailAddress : null;

    if(user) {
      data[year+"-"+week].contributers[user] = true;
    }
    
  });

  Object.keys(data).forEach(week=>{
    result[week] = Object.keys(data[week].contributers).length;
  });

  res.send(result);
});

function transalteMonth(m) {
  if (m<10) {
    return "0"+m;
  } else {
    return ""+m;
  }
}

function getMonthJira(year_month) {
  var any = 0;
  var filteredResults = jira.filter((item)=>item.fields.updated.indexOf(year_month)===0);
  
  const hours = new Array(24);
  hours.fill(0);
  
  filteredResults.forEach((result)=>{
    var d = new Date(result.fields.updated);
    var n = d.getHours();
    hours[n]++;
    any++;
  });

  return any ? hours: null;
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

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
  var date = new Date(this.getTime());
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

module.exports = router;


/*

"{"id":257897123,"node_id":"MDEwOlJlcG9zaXRvcnkyNTc4OTcxMjM=","name":"legacy-calculator","full_name":"guestyorg/legacy-calculator","private":false,"owner":{"login":"guestyorg","id":7859092,"node_id":"MDEyOk9yZ2FuaXphdGlvbjc4NTkwOTI=","avatar_url":"https://avatars0.githubusercontent.com/u/7859092?v=4","gravatar_id":"","url":"https://api.github.com/users/guestyorg","html_url":"https://github.com/guestyorg","followers_url":"https://api.github.com/users/guestyorg/followers","following_url":"https://api.github.com/users/guestyorg/following{/other_user}","gists_url":"https://api.github.com/users/guestyorg/gists{/gist_id}","starred_url":"https://api.github.com/users/guestyorg/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/guestyorg/subscriptions","organizations_url":"https://api.github.com/users/guestyorg/orgs","repos_url":"https://api.github.com/users/guestyorg/repos","events_url":"https://api.github.com/users/guestyorg/events{/privacy}","received_events_url":"https://api.github.com/users/guestyorg/received_events","type":"Organization","site_admin":false},"html_url":"https://github.com/guestyorg/legacy-calculator","description":"Measure legacy ownership ","fork":false,"url":"https://api.github.com/repos/guestyorg/legacy-calculator","forks_url":"https://api.github.com/repos/guestyorg/legacy-calculator/forks","keys_url":"https://api.github.com/repos/guestyorg/legacy-calculator/keys{/key_id}","collaborators_url":"https://api.github.com/repos/guestyorg/legacy-calculator/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/guestyorg/legacy-calculator/teams","hooks_url":"https://api.github.com/repos/guestyorg/legacy-calculator/hooks","issue_events_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues/events{/number}","events_url":"https://api.github.com/repos/guestyorg/legacy-calculator/events","assignees_url":"https://api.github.com/repos/guestyorg/legacy-calculator/assignees{/user}","branches_url":"https://api.github.com/repos/guestyorg/legacy-calculator/branches{/branch}","tags_url":"https://api.github.com/repos/guestyorg/legacy-calculator/tags","blobs_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/refs{/sha}","trees_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/trees{/sha}","statuses_url":"https://api.github.com/repos/guestyorg/legacy-calculator/statuses/{sha}","languages_url":"https://api.github.com/repos/guestyorg/legacy-calculator/languages","stargazers_url":"https://api.github.com/repos/guestyorg/legacy-calculator/stargazers","contributors_url":"https://api.github.com/repos/guestyorg/legacy-calculator/contributors","subscribers_url":"https://api.github.com/repos/guestyorg/legacy-calculator/subscribers","subscription_url":"https://api.github.com/repos/guestyorg/legacy-calculator/subscription","commits_url":"https://api.github.com/repos/guestyorg/legacy-calculator/commits{/sha}","git_commits_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/commits{/sha}","comments_url":"https://api.github.com/repos/guestyorg/legacy-calculator/comments{/number}","issue_comment_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues/comments{/number}","contents_url":"https://api.github.com/repos/guestyorg/legacy-calculator/contents/{+path}","compare_url":"https://api.github.com/repos/guestyorg/legacy-calculator/compare/{base}...{head}","merges_url":"https://api.github.com/repos/guestyorg/legacy-calculator/merges","archive_url":"https://api.github.com/repos/guestyorg/legacy-calculator/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/guestyorg/legacy-calculator/downloads","issues_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues{/number}","pulls_url":"https://api.github.com/repos/guestyorg/legacy-calculator/pulls{/number}","milestones_url":"https://api.github.com/repos/guestyorg/legacy-calculator/milestones{/number}","notifications_url":"https://api.github.com/repos/guestyorg/legacy-calculator/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/guestyorg/legacy-calculator/labels{/name}","releases_url":"https://api.github.com/repos/guestyorg/legacy-calculator/releases{/id}","deployments_url":"https://api.github.com/repos/guestyorg/legacy-calculator/deployments","created_at":"2020-04-22T12:37:57Z","updated_at":"2020-05-17T10:08:30Z","pushed_at":"2020-07-20T14:13:15Z","git_url":"git://github.com/guestyorg/legacy-calculator.git","ssh_url":"git@github.com:guestyorg/legacy-calculator.git","clone_url":"https://github.com/guestyorg/legacy-calculator.git","svn_url":"https://github.com/guestyorg/legacy-calculator","homepage":null,"size":162,"stargazers_count":0,"watchers_count":0,"language":"JavaScript","has_issues":true,"has_projects":true,"has_downloads":true,"has_wiki":true,"has_pages":false,"forks_count":0,"mirror_url":null,"archived":false,"disabled":false,"open_issues_count":1,"license":null,"forks":0,"open_issues":1,"watchers":0,"default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}"

*/