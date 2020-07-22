var express = require("express");
var router = express.Router();
const https = require('https');
var secret = require('../../secret');

router.get("/hourly", function(req, res, next) {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
    protocol: 'https:',
    hostname: 'api.github.com',
    //path: '/orgs/guestyorg/repos'
    path: '/repos/guestyorg/legacy-calculator/stats/punch_card'
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

      console.log(data);

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
    path: '/repos/guestyorg/legacy-calculator/stats/commit_activity'
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
      data.forEach((week,i)=>{
        weeks[i] += week.total;
        week.days.forEach((day,j)=>{
          days[j] += day;
        });
      });

      const result = {days,weeks}

      res.send(result);
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

});

module.exports = router;


/*

"{"id":257897123,"node_id":"MDEwOlJlcG9zaXRvcnkyNTc4OTcxMjM=","name":"legacy-calculator","full_name":"guestyorg/legacy-calculator","private":false,"owner":{"login":"guestyorg","id":7859092,"node_id":"MDEyOk9yZ2FuaXphdGlvbjc4NTkwOTI=","avatar_url":"https://avatars0.githubusercontent.com/u/7859092?v=4","gravatar_id":"","url":"https://api.github.com/users/guestyorg","html_url":"https://github.com/guestyorg","followers_url":"https://api.github.com/users/guestyorg/followers","following_url":"https://api.github.com/users/guestyorg/following{/other_user}","gists_url":"https://api.github.com/users/guestyorg/gists{/gist_id}","starred_url":"https://api.github.com/users/guestyorg/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/guestyorg/subscriptions","organizations_url":"https://api.github.com/users/guestyorg/orgs","repos_url":"https://api.github.com/users/guestyorg/repos","events_url":"https://api.github.com/users/guestyorg/events{/privacy}","received_events_url":"https://api.github.com/users/guestyorg/received_events","type":"Organization","site_admin":false},"html_url":"https://github.com/guestyorg/legacy-calculator","description":"Measure legacy ownership ","fork":false,"url":"https://api.github.com/repos/guestyorg/legacy-calculator","forks_url":"https://api.github.com/repos/guestyorg/legacy-calculator/forks","keys_url":"https://api.github.com/repos/guestyorg/legacy-calculator/keys{/key_id}","collaborators_url":"https://api.github.com/repos/guestyorg/legacy-calculator/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/guestyorg/legacy-calculator/teams","hooks_url":"https://api.github.com/repos/guestyorg/legacy-calculator/hooks","issue_events_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues/events{/number}","events_url":"https://api.github.com/repos/guestyorg/legacy-calculator/events","assignees_url":"https://api.github.com/repos/guestyorg/legacy-calculator/assignees{/user}","branches_url":"https://api.github.com/repos/guestyorg/legacy-calculator/branches{/branch}","tags_url":"https://api.github.com/repos/guestyorg/legacy-calculator/tags","blobs_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/refs{/sha}","trees_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/trees{/sha}","statuses_url":"https://api.github.com/repos/guestyorg/legacy-calculator/statuses/{sha}","languages_url":"https://api.github.com/repos/guestyorg/legacy-calculator/languages","stargazers_url":"https://api.github.com/repos/guestyorg/legacy-calculator/stargazers","contributors_url":"https://api.github.com/repos/guestyorg/legacy-calculator/contributors","subscribers_url":"https://api.github.com/repos/guestyorg/legacy-calculator/subscribers","subscription_url":"https://api.github.com/repos/guestyorg/legacy-calculator/subscription","commits_url":"https://api.github.com/repos/guestyorg/legacy-calculator/commits{/sha}","git_commits_url":"https://api.github.com/repos/guestyorg/legacy-calculator/git/commits{/sha}","comments_url":"https://api.github.com/repos/guestyorg/legacy-calculator/comments{/number}","issue_comment_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues/comments{/number}","contents_url":"https://api.github.com/repos/guestyorg/legacy-calculator/contents/{+path}","compare_url":"https://api.github.com/repos/guestyorg/legacy-calculator/compare/{base}...{head}","merges_url":"https://api.github.com/repos/guestyorg/legacy-calculator/merges","archive_url":"https://api.github.com/repos/guestyorg/legacy-calculator/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/guestyorg/legacy-calculator/downloads","issues_url":"https://api.github.com/repos/guestyorg/legacy-calculator/issues{/number}","pulls_url":"https://api.github.com/repos/guestyorg/legacy-calculator/pulls{/number}","milestones_url":"https://api.github.com/repos/guestyorg/legacy-calculator/milestones{/number}","notifications_url":"https://api.github.com/repos/guestyorg/legacy-calculator/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/guestyorg/legacy-calculator/labels{/name}","releases_url":"https://api.github.com/repos/guestyorg/legacy-calculator/releases{/id}","deployments_url":"https://api.github.com/repos/guestyorg/legacy-calculator/deployments","created_at":"2020-04-22T12:37:57Z","updated_at":"2020-05-17T10:08:30Z","pushed_at":"2020-07-20T14:13:15Z","git_url":"git://github.com/guestyorg/legacy-calculator.git","ssh_url":"git@github.com:guestyorg/legacy-calculator.git","clone_url":"https://github.com/guestyorg/legacy-calculator.git","svn_url":"https://github.com/guestyorg/legacy-calculator","homepage":null,"size":162,"stargazers_count":0,"watchers_count":0,"language":"JavaScript","has_issues":true,"has_projects":true,"has_downloads":true,"has_wiki":true,"has_pages":false,"forks_count":0,"mirror_url":null,"archived":false,"disabled":false,"open_issues_count":1,"license":null,"forks":0,"open_issues":1,"watchers":0,"default_branch":"master","permissions":{"admin":false,"push":false,"pull":true}}"

*/