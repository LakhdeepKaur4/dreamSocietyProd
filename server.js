'use strict';

var express = require('express');
var app = express();
var cors = require('cors');
app.use(cors());
var bodyParser = require('body-parser');
const path = require('path');
// var upload = require('express-fileupload');
console.log('server started');
// const WebSocket = require('ws');
 
// const ws = new WebSocket.Server({ port: 7788 });
 
// ws.on('open', function open() {
//   ws.send('something');
// });
 
// ws.on('message', function incoming(data) {
//   console.log(data);
// });

// ws.on('error', (error) => {
// 	console.log("socket error",error);
// })

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/public',express.static(path.resolve(__dirname, 'public')));

require('./app/router/router.js')(app);

// app.use(bodyParser());
// app.use(upload());

// const complaint = require('./app/controller/complaintStatusCreate');

const db = require('./app/config/db.config.js');

const Role = db.role;
var PORT = process.env.PORT || 8083;

// force: true will drop the table if it already exists

try{
	db.sequelize.sync({
		force: false,
	}).then(() => {
		console.log('Drop and Resync with { force: false }');
		//   initial();
		// complaint();
	});
}catch(err){
	console.log("eeeeeeee",err)
}finally{
							db.sequelize.options.handleDisconnects = false;
                            db.sequelize.connectionManager.pool.clear();
                           
                         
}


app.use(function (req, res, next) {
	console.log("p-------------------");
	if (req.method === "OPTIONS") {
		return next();
	  }
	next();
});

// app.use(function(req, res, next) {
// 	console.log("------------ ---------------------------");
// 	//console.log("------",cors().role);
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader(
// 	  "Access-Control-Allow-Headers",
// 	  "Origin, Content-Length,  X-Requested-With, Content-Type, Accept, Authorization, request-node-status"
// 	);
// 	res.setHeader(
// 	  "Access-Control-Allow-Methods",
// 	  "GET, POST, OPTIONS, HEAD, PUT, PATCH, DELETE"
// 	);
// 	res.setHeader('Access-Control-Allow-Credentials', true);
// 	next();
//   });



// require('./app/route/project.route.js')(app);

// Create a Server
var server = app.listen(PORT, function () {
	//   var host = server.address().address
	//   var port = server.address().port

	console.log("App listening at ", PORT)
})


function initial() {
	Role.create({
		id: 1,
		roleName: "SUPER_ADMIN"
	});
	Role.create({
		id: 2,
		roleName: "ADMIN"
	});

	Role.create({
		id: 3,
		roleName: "SOCIETY_MEMBER_OWNER"
	});
	Role.create({
		id: 4,
		roleName: "SOCIETY_MEMBER_TENENT"
	});
	Role.create({
		id: 5,
		roleName: "VENDOR"
	});
}
