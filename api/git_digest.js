const jsonX = require('./test.json'); //partial for testing
const json1 = require('./test2.json');
const json2 = require('./test3.json');
const fs = require('fs');

var json = json1.concat(json2);


console.log(json.length);
var agg = {};
var agg_personal = {};
var users = {};
json.forEach(commit => {
    var date = new Date(commit.commit.author.date);
    var year = date.getFullYear();
    var month = transalteNum(date.getMonth() + 1);
    var hour = transalteNum(date.getHours());
    
    //non personal
    if (!agg[year+"-"+month+"-"+hour]) {
        agg[year+"-"+month+"-"+hour] = 0;
    }
    agg[year+"-"+month+"-"+hour]++;
    
    //personal
    if (year === 2020 && month > 3) {
        var user = commit.commit.author.name;
        if (!agg_personal[year+"-"+month+"-"+hour]) {
            agg_personal[year+"-"+month+"-"+hour] = {};
        }
        if (!agg_personal[year+"-"+month+"-"+hour][user]) {
            agg_personal[year+"-"+month+"-"+hour][user] = 0;
        }
        agg_personal[year+"-"+month+"-"+hour][user]++;
    }
   
});

/**
 * Personal
 */

Object.keys(agg_personal).forEach(time=>{
    Object.keys(agg_personal[time]).forEach(person=>{
        if (!users[person]) {
            users[person] = {};
        }
        
        var hour = parseInt(time.split("-")[2]);
        if (!users[person][hour]) {
            users[person][hour] = 0;
        }
        users[person][hour] += agg_personal[time][person];
        
    });
});
console.log(users);
fs.writeFile("personal_git.json", JSON.stringify(users), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved! - personal data");
});



//fill in gaps with 00
for (var y = 2016; y <= 2020; y++) {
    for (var m = 1; m <= 12; m++) {
        for (var h = 0; h<= 23; h++) {
            if (y === 2020 && m > 7) {
                //skip
            } else if(!agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)]) {
                agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)] = 0;
            }
        }
    }
}


// percentage
for (var y = 2016; y <= 2020; y++) {
    for (var m = 1; m <= 12; m++) {
        var monthTotal = 0;
        if (y === 2020 && m > 7) {
            //skip
        } else {
            for (var h = 0; h<= 23; h++) {
                if (agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)]) {
                    monthTotal += agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)];
                }
            }
            for (var h = 0; h<= 23; h++) {
                if (agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)]) {
                    agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)] = Math.round(agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)] / monthTotal * 10000)/100;
                }
            }
        }
    }
}

var result = {};

for (var y = 2018; y <= 2020; y++) {
    for (var m = 1; m <= 12; m++) {
        for (var h = 0; h<= 23; h++) {
            if (y === 2020 && m > 7) {
                //skip
            } else {
                if (!result[y+"-"+transalteNum(m)]) {
                    result[y+"-"+transalteNum(m)] = [];
                }
                result[y+"-"+transalteNum(m)].push({
                    x : y+"-"+transalteNum(m)+"-"+transalteNum(h),
                    y : agg[y+"-"+transalteNum(m)+"-"+transalteNum(h)] || 0
                });
            }
        }
    }
}


//console.log(result);

fs.writeFile("git.json", JSON.stringify(result), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

function transalteNum(n) {
    if (n<10) {
        return "0"+n;
    } else {
        return ""+n;
    }
}


/*
{ sha: '0cb772ad772fef34efdf269fdc06cb80bf107385',
  node_id: 'MDY6Q29tbWl0MTEwNTg1NDY2OjBjYjc3MmFkNzcyZmVmMzRlZmRmMjY5ZmRjMDZjYjgwYmYxMDczODU=',
  commit:
   { author:
      { name: 'Tim',
        email: 'timuretis@users.noreply.github.com',
        date: '2020-07-26T13:26:42Z' },
     committer:
      { name: 'GitHub',
        email: 'noreply@github.com',
        date: '2020-07-26T13:26:42Z' },
     message: 'BCom reservation not billed: log messages were fixed and new ones were added (#11513)\n\n* BCom reservation not billed: log messages were added and fixed\r\n\r\n* Missed logMeta initialization has added',
     tree:
      { sha: 'f2d644e67a785a9c82efecc0f17a99c5b94b0bf3',
        url: 'https://api.github.com/repos/guestyorg/guesty/git/trees/f2d644e67a785a9c82efecc0f17a99c5b94b0bf3' },
     url: 'https://api.github.com/repos/guestyorg/guesty/git/commits/0cb772ad772fef34efdf269fdc06cb80bf107385',
     comment_count: 0,
     verification:
      { verified: true,
        reason: 'valid',
        signature: '-----BEGIN PGP SIGNATURE-----\n\nwsBcBAABCAAQBQJfHYSSCRBK7hj4Ov3rIwAAdHIIAD9xFOdYCdNmQApc4KF2PZuZ\njpJABl0YOIwurx/V8GMUY92X5G1xDBkoes7+vaV8aIfOOS7YlGtGC9f9vJ9ki5L/\nyH6yJBkmKID+nk/7iqBEzAEYscPtOSsyFZw1qbBLErpEYkMjRI63XYMoc5MWJkL4\nk0ZoEYkbbzQcWTmwIjV/CF55fyWEqW9VWEFEKnbD5wYO6YUPyvOZyC5cLWkhAEhD\nLugyC2ozZ98HQvbTvRf/oLErXe11/gWyGrHtGcS9krhjNvKOP5Z3/KeR5Xkj1py0\nI4SQpUkGCLEb+FOWBcYO1E5qXVvKtksMRYclRlhgz0UanVuVefAcgHF6TofWDhU=\n=CoIQ\n-----END PGP SIGNATURE-----\n',
        payload: 'tree f2d644e67a785a9c82efecc0f17a99c5b94b0bf3\nparent fb5bd0aa89d9476d625874cc1e18026c6cd9429a\nauthor Tim <timuretis@users.noreply.github.com> 1595770002 +0300\ncommitter GitHub <noreply@github.com> 1595770002 +0300\n\nBCom reservation not billed: log messages were fixed and new ones were added (#11513)\n\n* BCom reservation not billed: log messages were added and fixed\r\n\r\n* Missed logMeta initialization has added' } },
  url: 'https://api.github.com/repos/guestyorg/guesty/commits/0cb772ad772fef34efdf269fdc06cb80bf107385',
  html_url: 'https://github.com/guestyorg/guesty/commit/0cb772ad772fef34efdf269fdc06cb80bf107385',
  comments_url: 'https://api.github.com/repos/guestyorg/guesty/commits/0cb772ad772fef34efdf269fdc06cb80bf107385/comments',
  author:
   { login: 'timuretis',
     id: 7100371,
     node_id: 'MDQ6VXNlcjcxMDAzNzE=',
     avatar_url: 'https://avatars3.githubusercontent.com/u/7100371?v=4',
     gravatar_id: '',
     url: 'https://api.github.com/users/timuretis',
     html_url: 'https://github.com/timuretis',
     followers_url: 'https://api.github.com/users/timuretis/followers',
     following_url: 'https://api.github.com/users/timuretis/following{/other_user}',
     gists_url: 'https://api.github.com/users/timuretis/gists{/gist_id}',
     starred_url: 'https://api.github.com/users/timuretis/starred{/owner}{/repo}',
     subscriptions_url: 'https://api.github.com/users/timuretis/subscriptions',
     organizations_url: 'https://api.github.com/users/timuretis/orgs',
     repos_url: 'https://api.github.com/users/timuretis/repos',
     events_url: 'https://api.github.com/users/timuretis/events{/privacy}',
     received_events_url: 'https://api.github.com/users/timuretis/received_events',
     type: 'User',
     site_admin: false },
  committer:
   { login: 'web-flow',
     id: 19864447,
     node_id: 'MDQ6VXNlcjE5ODY0NDQ3',
     avatar_url: 'https://avatars3.githubusercontent.com/u/19864447?v=4',
     gravatar_id: '',
     url: 'https://api.github.com/users/web-flow',
     html_url: 'https://github.com/web-flow',
     followers_url: 'https://api.github.com/users/web-flow/followers',
     following_url: 'https://api.github.com/users/web-flow/following{/other_user}',
     gists_url: 'https://api.github.com/users/web-flow/gists{/gist_id}',
     starred_url: 'https://api.github.com/users/web-flow/starred{/owner}{/repo}',
     subscriptions_url: 'https://api.github.com/users/web-flow/subscriptions',
     organizations_url: 'https://api.github.com/users/web-flow/orgs',
     repos_url: 'https://api.github.com/users/web-flow/repos',
     events_url: 'https://api.github.com/users/web-flow/events{/privacy}',
     received_events_url: 'https://api.github.com/users/web-flow/received_events',
     type: 'User',
     site_admin: false },
  parents:
   [ { sha: 'fb5bd0aa89d9476d625874cc1e18026c6cd9429a',
       url: 'https://api.github.com/repos/guestyorg/guesty/commits/fb5bd0aa89d9476d625874cc1e18026c6cd9429a',
       html_url: 'https://github.com/guestyorg/guesty/commit/fb5bd0aa89d9476d625874cc1e18026c6cd9429a' } ] }

*/