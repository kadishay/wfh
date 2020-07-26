const axios = require('axios');
const secret = require('./../secret');
const fs = require('fs');

var data_stream = [];
(async () => {
    try {
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Authorization': 'token '+secret.token },
        };
        for (var i=1;i<=2000;i++) {
            var response = await axios.get('https://api.github.com/repos/guestyorg/guesty/commits?page='+i,options);
            data_stream = data_stream.concat(response.data);
            console.log(i);  
        }

        console.log(data_stream.length);
      
        fs.writeFile("test3.json", JSON.stringify(data_stream), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    } catch (error) {
        console.log(error);
        console.log(error.response.body);
    }
})();



