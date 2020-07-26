function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

var total = 0;
var iteration = 0;
var curr_iteration = 0;
var issues = [];

httpGetAsync(
    "https://guesty.atlassian.net/rest/api/2/search?jql=&fields=updated&maxResults=100&startAt=0",
    function(res){
        var obj = JSON.parse(res);
        total = obj.total;
        iteration = Math.ceil(total / 100);
        issues = issues.concat(obj.issues);
        curr_iteration++;
        for (var i=1; i<iteration; i++) {
            setTimeout(makeCall,i*200);
        }
    }
);

function makeCall() {
    httpGetAsync(
        "https://guesty.atlassian.net/rest/api/2/search?jql=&fields=updated,assignee&maxResults=100&startAt="+(curr_iteration*100),
        function(resp){
            issues = issues.concat(JSON.parse(resp).issues);
        }
    )
    curr_iteration++;
}

function testEnd(){
    if (issues.length == total) {
        console.log(issues);
    } else {
        console.log(issues + " / " + total);
        setTimeout(testEnd,1000);
    }
}
setTimeout(testEnd,3000);

/**
 * clean support tickets
 */