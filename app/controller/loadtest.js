const loadtest = require('loadtest');
var fs = require('fs');
const http = require('http');
// var max = 1000;
// if(http.globalAgent.maxSockets < max) {
//     console.log(">>>")
//     http.globalAgent.maxSockets = max;
// }

// exports.test = (req, res, next) => {
//     function statusCallback(error, result, latency) {
//         console.log('Current latency %j, result %j, error %j', latency, result, error);
//         // console.log('Request elapsed milliseconds: ', result.requestElapsed);
//         // console.log('Request index: ', result.requestIndex);
//         // console.log('Request loadtest() instance index: ', result.instanceIndex);
//     }
//     const logins = [
//         { "userName": "kunal@gmail.com", "password": "NSUVEHXkpO" },
//         { "userName": "Lakhdeep123", "password": "lakhdeep" },
//         { "userName": "rohit.khandelwal@gmail.com", "password": "3m8wyjmHun" },
//         { "userName": "mohit.rottela@greatwits.com", "password": "JMHYigo4jV" },
//         { "userName": "akash@gmail.com", "password": "80ee6MaUQh" },
//         { "userName": "lakhdeepkaur36@gmail.com", "password": "5xfSri3xnA" },
//         { "userName": "nitish.parashar@greatwits.com", "password": "5KtzCBiSQF" },
//         { "userName": "kumarabhinav167@gmail.com", "password": "7dwdO13ZzE" }
//     ]
//     logins.map(login => {
//         const options = {
//             url: 'http://localhost:8083/api/auth/signin',
//             method: 'POST',
//             requestsPerSecond:5,
//             contentType: 'application/json',
//             body: login,
//             // headers:{'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2MjQxMTYzLCJleHAiOjE1NzYzMjc1NjN9.UP3c6By8vv4q_M5AKREKPVaOhjClYRhOS0CwxAHeJpI'},
//             maxRequests: 2000,
//             statusCallback: statusCallback
//         };

//         loadtest.loadTest(options, function (error) {
//             if (error) {
//                 return console.error('Got an error: %s', error);
//             }
//             console.log('Tests run successfully');
//         });
//     })
// }

exports.test = (req, res, next) => {
    function statusCallback(error, result, latency) {
        console.log("eeee")
        console.log('Current latency %j, result %j, error %j====', latency, result, error);
        // console.log('Request elapsed milliseconds: ', result.requestElapsed);
        // console.log('Request index: ', result.requestIndex);
        // console.log('Request loadtest() instance index: ', result.instanceIndex);
        // var trueLog = console.log;
        // console.log = function (msg) {
        //trueLog(msg); //uncomment if you want logs
        // }

    }
    const logins = [
        { "userName": "kunal@gmail.com", "password": "NSUVEHXkpO" },
        { "userName": "Lakhdeep123", "password": "lakhdeep" },
        { "userName": "rohit.khandelwal@gmail.com", "password": "3m8wyjmHun" },
        { "userName": "mohit.rottela@greatwits.com", "password": "JMHYigo4jV" },
        { "userName": "akash@gmail.com", "password": "80ee6MaUQh" },
        { "userName": "lakhdeepkaur36@gmail.com", "password": "5xfSri3xnA" },
        { "userName": "nitish.parashar@greatwits.com", "password": "5KtzCBiSQF" },
        { "userName": "kumarabhinav167@gmail.com", "password": "7dwdO13ZzE" }
    ]
    logins.map(login => {
        const options = {
            url: 'http://localhost:8085/api/auth/signin',
            method: 'POST',
            concurrency: 200,
            requestsPerSecond: 5,
            contentType: 'application/json',
            body: login,
            keepalive: true,
            // headers:{'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2MjQxMTYzLCJleHAiOjE1NzYzMjc1NjN9.UP3c6By8vv4q_M5AKREKPVaOhjClYRhOS0CwxAHeJpI'},
            maxRequests: 5000,
            statusCallback: statusCallback
        };

        loadtest.loadTest(options, function (error, resp) {
            if (error) {
                return console.error('Got an error: %s', error);
            }
            fs.appendFile("log.json", JSON.stringify(resp), function (err) {
                console.log("------------------", resp);
                if (err) {
                    console.log("error", err)
                }
            });
            console.log('Tests run successfully');
        });
    })
}


// exports.testApi = (req, res, next) => {
//     function statusCallback(error, result, latency) {
//         console.log("eeee")
//         console.log('Current latency %j, result %j, error %j====', latency, result, error);
//         // console.log('Request elapsed milliseconds: ', result.requestElapsed);
//         // console.log('Request index: ', result.requestIndex);
//         // console.log('Request loadtest() instance index: ', result.instanceIndex);
//         // var trueLog = console.log;
//         // console.log = function (msg) {
//         //trueLog(msg); //uncomment if you want logs
//         // }

//     }
//         const options = {
//             url: 'http://localhost:8085/api/designation',
//             method: 'GET',
//             concurrency:200,
//             requestsPerSecond: 5,
//             contentType: 'application/json',
//             keepalive:true,
//              headers:{'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2NTg0ODgxLCJleHAiOjE1NzY2NzEyODF9.Wz8XsME8AFQTMIQIAg1kiR2BtcsQqyUFAPQvOwdwhnc'},
//             maxRequests: 5000,
//             statusCallback: statusCallback
//         };

//         loadtest.loadTest(options, function (error, resp) {
//             if (error) {
//                 return console.error('Got an error: %s', error);
//             }
//             fs.appendFile("log.json", JSON.stringify(resp), function (err) {
//                 console.log("------------------",resp);
//                 if (err) {
//                     console.log("error", err)
//                 }
//             });

//             console.log('Tests run successfully');
//         });
// }
