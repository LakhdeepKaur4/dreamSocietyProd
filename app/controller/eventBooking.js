const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');


const Event = db.event;
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
