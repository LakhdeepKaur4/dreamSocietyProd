const conn = require('./db_connect.js');

conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

conn.end();