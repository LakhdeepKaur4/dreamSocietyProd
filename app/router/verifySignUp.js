const db = require('../config/db.config.js');
const config = require('../config/config.js');
const ROLEs = config.ROLEs; 
const User = db.user;
const Role = db.role;

checkDuplicateEmail = (req, res, next) => {
	// -> Check Username is already in use
	User.findOne({
		where: {
			email: req.body.email
		} 
	}).then(user => {
		if(user){
		return res.status(400).json({status:400,message:"Fail -> email is already taken!"});
		}
		
		// -> Check Email is already in use
		User.findOne({ 
			where: {
				email: req.body.email
			} 
		}).then(user => {
			if(user){
				res.status(400).json({status:400,message:"Fail -> Email is already in use!"});
				return;
			}
				
			next();
		});
	});
}

checkDuplicateUserName = (req, res, next) => {
	// -> Check Username is already in use
	User.findOne({
		where: {
			userName: req.body.userName
		} 
	}).then(user => {
		if(user){
		return res.status(400).json({message:"Fail -> username is already taken!"});
		}
		
		// -> Check Email is already in use
		User.findOne({ 
			where: {
				userName: req.body.userName
			} 
		}).then(user => {
			if(user){
				res.status(400).json({message:"Fail -> Username is already in use!"});
				return;
			}	
			next();
		});
	});
}

checkRolesExisted = (req, res, next) => {	
	let roleName = [];
	let roles = req.body.roles;
	if(roles){
		roleName.push(roles);
	}
	console.log("rolename==>",roleName);
	for(let i=0; i<roleName.length; i++){
		if(!ROLEs.includes(roleName[i].toUpperCase())){
			res.status(400).send("Fail -> Does NOT exist Role = " +roleName[i]);
			return;
		}
	}
	next();
}

const signUpVerify = {};
signUpVerify.checkDuplicateEmail = checkDuplicateEmail;
signUpVerify.checkDuplicateUserName = checkDuplicateUserName;
signUpVerify.checkRolesExisted = checkRolesExisted;

module.exports = signUpVerify;