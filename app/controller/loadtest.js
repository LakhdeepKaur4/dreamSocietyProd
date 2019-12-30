// const loadtest = require('loadtest');
var fs = require('fs');
const http = require('http');
var request = require('request');
// http.globalAgent['keepAlive'] = true;
// process.env.UV_THREADPOOL_SIZE = 50;
// console.log(process.env.UV_THREADPOOL_SIZE)
// console.log(">>>", http.globalAgent)
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
            concurrency: 500,
            requestsPerSecond: 5,
            contentType: 'application/json',
            body: login,
            keepalive: true,
            // headers:{'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2MjQxMTYzLCJleHAiOjE1NzYzMjc1NjN9.UP3c6By8vv4q_M5AKREKPVaOhjClYRhOS0CwxAHeJpI'},
            maxRequests: 6000,
            statusCallback: statusCallback,
            // maxSeconds: 30,
            // requestGenerator: (params, options, client, callback) => {
            //     console.log(">>>>>>>>>>>>>",login)
            //     const message = '{"hi": "ho"}';
            //     options.headers['Content-Type'] = 'application/json';
            //     options.body = options.headers['Content-Type'] = 'application/json';
            //     options.path = "http://localhost:8085/api/auth/signin";
            //     console.log("<<",options.body)
            //     const request = client(options, callback);
            //     request.write(message);
            //     return request;
            // }
        };

        loadtest.loadTest(options, function (error, resp) {
            if (error) {
                return console.error('Got an error: %s', error);
            }
            // fs.appendFile("log.json", JSON.stringify(resp), function (err) {
            //     console.log("------------------", resp);
            //     if (err) {
            //         console.log("error", err)
            //     }
            // });
            console.log('Tests run successfully');
        });
    })
}


exports.testApi = (req, res, next) => {
    const options = {
        url: 'http://localhost:8085/api/designation',
        concurrency: 5,
        method: 'GET',
        body: '',
        requestsPerSecond: 5,
        maxSeconds: 30,
        requestGenerator: (params, options, client, callback) => {
            const message = '{"hi": "ho"}';
            options.headers['Content-Length'] = message.length;
            options.headers['Content-Type'] = 'application/json';
            options.headers['x-access-token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2MjQxMTYzLCJleHAiOjE1NzYzMjc1NjN9.UP3c6By8vv4q_M5AKREKPVaOhjClYRhOS0CwxAHeJpI',
                // options.body = { "userName": "kumarabhinav167@gmail.com", "password": "7dwdO13ZzE" };
                options.path = "http://localhost:8085/api/designation";
            const request = client(options, callback);
            request.write(message);
            return request;
        }
    };

    loadtest.loadTest(options, (error, results) => {
        if (error) {
            return console.error('Got an error: %s', error);
        }
        console.log(results);
        console.log('Tests run successfully');
    });

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
}

// exports.check = async () => {
//     loop = require('nodeload/lib/loop'),
//         requests = 0,
//         options = {
//             port: 8085,
//             host: 'localhost',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2NzM0MDc3LCJleHAiOjE1NzY4MjA0Nzd9.JJ_0Nv81vIDOt7R3dw2Wwe21O_9T3s5l07VA1D2eZ5A'
//             },
//             method: 'GET',
//             path: '/api/designation'
//         }
//     client = http.request(
//         options
//         //     {
//         //     headers: {
//         //     //   'Content-Length': 100,
//         //       'Content-Type': 'application/json'
//         //     },
//         //     uri: 'http://localhost:8085',
//         //     body: { "userName": "kunal@gmail.com", "password": "NSUVEHXkpO" },
//         //     method: 'POST'
//         //   }
//     ),
//         l = new loop.MultiLoop({
//             fun: function (finished) {
//                 http.request(options).end();
//                 requests++;
//                 finished();
//             },
//             rps: 1000,
//             duration: 3,
//             concurrency: 500
//         }).start();
//     l.on('end', function () { console.log('Total requests: ' + requests) });
// }

// const k6http = require("k6/http");
// const { check, sleep } = require("k6");


// let options = {
//     vus: 10,
//     duration: "10s"
// };
// function test() {
//     let res = http.get("url");
//     check(res, {
//         "success": (r) => r.status == 200
//     });
// };
