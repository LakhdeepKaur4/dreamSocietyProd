const fs = require('fs');

require('dotenv').config();

var setEnvVariable = process.env.env_dream_security;

//process.env['env_dream_security'] = './index.js';

//console.log(setEnvVariable);

//console.log(fs.readFileSync(process.env.env_dream_security).toString());

fs.readFile(process.env.env_dream_security, (err, data) => {
	console.log(data.toString());
});