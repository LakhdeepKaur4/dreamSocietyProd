const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var CryptoJS = require("crypto-js");
var crypto = require('crypto');
var generator = require('generate-password');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');
var schedule = require('node-schedule');

const User = db.user;
const Role = db.role;
const Test = db.test;
const Tower = db.tower;
const Society = db.society;
const City = db.city;
const Country = db.country;
const State = db.state;
const Location = db.location;
const OTPTable = db.otpUserVerify;
const Token = db.tokenVerify;

const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.start = (req, res) => {
	console.log('Dream Society');
	res.send('Dream Society Api Running');
}

exports.signup = async (req, res) => {
	// Save User to Database
	let alreadyExists = false;
	console.log("Processing func -> SignUp");
	console.log("req.body===>", req.body)
	let password;
	let body = req.body;
	let roles = req.body.roles;
	let roleName = [];
	if (roles) {
		roleName.push(roles);
	}
	const user = await User.findOne({
		where: {
			[Op.and]: [{
				userName: req.body.userName
			},
			{
				contact: req.body.contact
			},
			{
				email: req.body.email
			},
			{
				isActive: true
			}
			]
		}
	})
	if (user) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: 'User Already Exists'
		});
	}
	if (!body.userName || !body.email || !body.roles) {
		return res.json({
			message: "Parameters missing"
		});
	}
	if (!body.password) {
		password = generator.generate({
			length: 10,
			numbers: true
		});
		body.password = password;
	}
	User.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		userName: req.body.userName,
		email: req.body.email,
		contact: req.body.contact,
		password: bcrypt.hashSync(req.body.password, 8),
		towerId: req.body.towerId,
		// // flatDetailId: req.body.flatDetailId,
		familyMember: req.body.familyMember,
		parking: req.body.parking,
		// floor: req.body.floor
	}).then(user => {
		Role.findAll({
			where: {
				roleName: {
					[Op.or]: roleName
				}
			}
		}).then(roles => {
			user.setRoles(roles).then(() => {
				res.status(httpStatus.CREATED).json({
					message: "User registered successfully!"
				});
			});
		}).catch(err => {
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
				status: 500,
				message: err
			});
		});
	}).catch(err => {
		console.log("err==>", err.name)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			status: 500,
			message: err.name
		});
	})
}

exports.update = (req, res) => {
	const id = req.params.id;
	const updates = req.body;
	User.find({
		where: {
			userId: id
		}
	})
		.then(user => {
			Role.findAll({
				where: {
					roleName: req.body.roleName
				}
			}).then(roles => {
				user.setRoles(roles).then(() => {
					return user.updateAttributes(updates)
				});
			})
				.then(updatedUser => {
					res.status(httpStatus.OK).json({
						message: "User updated successfully!",
						updatedUser: updatedUser
					});
				});
		})
}

exports.signin = async (req, res) => {
	console.log("Sign-In", req.body);
	let society = await Society.findOne({
		where: {
			isActive: true
		},
		attributes: ['societyId', 'societyName'],
		include: [{
			model: City,
			attributes: ['cityId', 'cityName']
		},
		{
			model: Country,
			attributes: ['countryId', 'countryName']
		},
		{
			model: State,
			attributes: ['stateId', 'stateName']
		},
		{
			model: User,
			attributes: ['userId', 'userName']
		},
		{
			model: Location,
			attributes: ['locationId', 'locationName']
		},
		]
	});

	society.societyName = decrypt(society.societyName);

	// let userName = '%'+req.body.userName;
	// console.log(userName)
	if (!req.body.userName) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Username cannot be empty"
		})
	}
	if (!req.body.password) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Password cannot be empty"
		})
	}
	User.findOne({
		where: {
			[Op.and]: [{
				userName: req.body.userName
			},
			{
				isActive: true
			}
			]

		},
		include: [{
			model: Role,
			attributes: ['id', 'roleName'],
		}]
	}).then(user => {
		if (!user) {
			console.log("------user-------");
			return res.status(httpStatus.OK).send({
				status: 401,
				auth: false,
				user: user,
				message: "Invalid Username!"
			});
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		console.log("isvalid===>", passwordIsValid)
		if (!passwordIsValid) {
			return res.status(httpStatus.OK).send({
				status: 401,
				auth: false,
				user: user,
				message: "Invalid Password!"

			});
		}

		var token = jwt.sign({
			id: user.userId
		}, config.secret, {
				expiresIn: 86400 // expires in 24 hours
			});

		res.status(httpStatus.OK).send({
			status: 200,
			auth: true,
			accessToken: token,
			user: user,
			society: society,
			message: "Successfully Logged In"
		});

	}).catch(err => {
		console.log()
		res.status(500).json({
			"message": err
		});
	});
}

exports.get = (req, res) => {
	try {
		User.findAll({
			where: {
				isActive: true
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [{
				model: Role,
				attributes: ['id', 'roleName'],
			},
			{
				model: Tower
			}
			]
		})
			.then(user => {
				//   let decipher = crypto.createCipher(config.algorithm,user.QRCode);
				//    let encryptedUser = decipher.update(user,'hex','utf8') + decipher.final('utf8');
				//    console.log("encrypted user==>",encryptedUser)
				res.status(httpStatus.OK).json(user);
			});
	} catch (error) {
		console.log("error--->", error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			"message": error
		})
	}
}


// exports.getUser = async (req,res,next) =>{
// 	try{
// 		console.log("in here get user");
// 	const user =await User.findAll(
// 		{where:{isActive:true},
// 		// raw: true,
// 		include: [{
// 			model: Role,
// 			attributes: ['roleName'],
// 		}]});
// 	if(user){
// 	// console.log("user==>",user)
// 	res.json(user)
// 	}else{
// 		res.json(user)
// 		console.log("user not found")
// 	}
// 	}catch(error){
// 		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({error:error})
// 	}
// }
exports.userContent = (req, res) => {
	User.findOne({
		where: {
			userId: req.userId
		},
		attributes: ['firstName', 'lastName', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'roleName'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(httpStatus.OK).json({
			"description": "User Content Page",
			"user": user
		});
	}).catch(err => {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			"description": "Can not access User Page",
			"error": err
		});
	})
}

exports.adminBoard = (req, res) => {
	console.log(req.userId)
	User.findOne({
		where: {
			id: req.userId
		},
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			"description": "Admin Board",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Admin Board",
			"error": err
		});
	})
}

exports.managementBoard = (req, res) => {
	User.findOne({
		where: {
			id: req.userId
		},
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			"description": "Management Board",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "Can not access Management Board",
			"error": err
		});
	})
}

exports.getById = (req, res) => {
	User.findOne({
		where: {
			userId: req.params.id
		},
	}).then(user => {
		//    let decipher = crypto.createCipher(config.algorithm,user.QRCode);
		//    let encryptedUser = decipher.update(user,'hex','utf8') + decipher.final('utf8');
		//    console.log("encrypted user==>",encryptedUser)
		let firstNameDecipher = crypto.createDecipher(config.algorithm, user.QRCode);
		let firstName = firstNameDecipher.update(user.firstName, 'hex', 'utf8') + firstNameDecipher.final('utf8');
		let lastNameDecipher = crypto.createDecipher(config.algorithm, user.QRCode);
		let lastName = lastNameDecipher.update(user.lastName, 'hex', 'utf8') + lastNameDecipher.final('utf8');
		let userNameDecipher = crypto.createDecipher(config.algorithm, user.QRCode);
		let userName = userNameDecipher.update(user.userName, 'hex', 'utf8') + userNameDecipher.final('utf8');
		let contactDecipher = crypto.createDecipher(config.algorithm, user.QRCode);
		let contact = contactDecipher.update(user.contact, 'hex', 'utf8') + contactDecipher.final('utf8');
		let emailDecipher = crypto.createDecipher(config.algorithm, user.QRCode);
		let email = emailDecipher.update(user.email, 'hex', 'utf8') + emailDecipher.final('utf8');
		// console.log(decrypted);
		res.status(200).json({
			"description": "User Content Page",
			"firstName": firstName,
			"lastName": lastName,
			"userName": userName,
			"contact": contact,
			"email": email
		});
	}).catch(err => {
		console.log("err=>", err)
		res.status(500).json({
			"description": "Can not User Page",
			"error": err
		});
	})
}

// exports.updateUser = (req, res) => {
// 	const id = req.params.id;
// 	console.log("id==>",id);
// 	const updates = req.body;
// 	console.log("updates==>",updates);
// 	User.find({
// 			where: {
// 				userId: id
// 			}
// 		})
// 		.then(user => {
// 			return user.updateAttributes(updates)
// 		})
// 		.then(updatedUser => {
// 			res.json({
// 				message: "User updated successfully!",
// 				updatedUser: updatedUser
// 			});
// 		});
// }

exports.role = async (req, res, next) => {
	try {
		// console.log("req.session===>",req.userId);
		const role = await Role.findAll({
			attributes: ['id', 'roleName']
		});
		if (role) {
			res.status(200).json(role);
		}
	} catch (error) {
		res.status(500).json({
			message: error
		})
	}
}

exports.roleTest = async (req, res, next) => {
	try {
		let roleId;
		const user = await User.findOne({
			where: {
				userId: req.userId
			},
			include: [{
				model: Role
			}]
		});
		user.roles.map(data => {
			roleId = data.id
		})
		console.log("user role name==>", roleId);
		if (roleId == 1) {
			const role = await Role.findAll({
				where: {
					id: {
						[Op.ne]: roleId
					}
				},
			});
			if (role) {
				return res.status(httpStatus.OK).json(role);
			}
		}
		if (roleId == 2) {
			const role = await Role.findAll({
				where: {
					id: {
						[Op.ne]: roleId
					},
					roleName: {
						[Op.ne]: 'SUPER ADMIN'
					},
				},
			});
			if (role) {
				return res.status(httpStatus.OK).json(role);
			}
		}

		if (roleId == 3 || roleId == 4) {
			const role = await Role.findAll({
				where: {
					id: {
						[Op.ne]: roleId
					},
					roleName: {
						[Op.ne]: 'VENDOR'
					},
				},
			});
			if (role) {
				return res.status(httpStatus.OK).json(role);
			}
		}
	} catch (error) {
		res.status(httpStatus.OK).json(error)
	}
}

exports.delete = (req, res) => {
	const id = req.params.id;
	if (!id) {
		res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Id is missing"
		});
	}
	const updates = req.body;
	User.find({
		where: {
			userId: id
		}
	})
		.then(user => {
			return user.updateAttributes(updates)
			// res.json({message:"User deleted successfully!",user:user});
		})
		.then(updatedUser => {
			res.status(httpStatus.OK).json({
				message: "User deactivated successfully!",
				updatedUser: updatedUser
			});
		});
}

function randomValueHex(len) {
	return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len)
}

exports.search = async (req, res, next) => {
	try {
		console.log("in here search api")
		console.log("req.query", req.query);
		if (req.query.roleName) {
			const user = await User.findAll({
				include: [{
					model: Role,
					where: {
						isActive: true,
						[Op.like]: '%' + req.query.roleName + '%'
					},
				}],
			})
			if (user.length > 0) {
				return res.json({
					message: 'Search results',
					users: user
				})
			} else {
				return res.json({
					message: 'No Users Found',
					users: user
				})
			}
		} else {
			// const role = await Role.findAll({
			// 	where:{roleName:req.query.roleName}
			// });
			// console.log("Roless==>",role)
			const user = await User.findAll({
				limit: 10,
				include: [{
					model: Role,
					attributes: ['id', 'roleName'],
				}],
				where: {
					isActive: true,
					[Op.or]: [{
						firstName: {
							[Op.like]: '%' + req.query.firstName + '%'
						}
					},
					{
						lastName: {
							[Op.like]: '%' + req.query.lastName + '%'
						}
					},
					{
						userName: {
							[Op.like]: '%' + req.query.userName + '%'
						}
					},
					{
						contact: {
							[Op.like]: '%' + req.query.contact + '%'
						}
					},
					{
						email: {
							[Op.like]: '%' + req.query.email + '%'
						}
					},
					]
				}
			})
			if (user.length > 0) {
				return res.json({
					message: 'Search results',
					users: user
				})
			} else {
				return res.json({
					message: 'No Users Found',
					users: user
				})
			}
		}
	} catch (error) {
		console.log(error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
			error: error
		});
	}
}
//   var crypto = require('crypto');
// var assert = require('assert');

// var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
// var key = 'password';
// var text = 'I love kittens';

// var cipher = crypto.createCipher(algorithm, key);  
// var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
// var decipher = crypto.createDecipher(algorithm, key);
// var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

// assert.equal(decrypted, text);

exports.signupCopy = (req, res) => {
	// Save User to Database
	console.log("req.body===>", req.body)
	let body = req.body;
	let roles = req.body.roles;
	let roleName = [];
	let QRCode = randomValueHex(30);
	console.log("QRCODE++>", QRCode);
	if (roles) {
		roleName.push(roles);
	}
	if (!body.firstName || !body.lastName || !body.userName || !body.email || !body.contact || !body.roles) {
		return res.json({
			message: "Parameters missing"
		});
	}
	let firstNameCipher = crypto.createCipher(config.algorithm, QRCode);
	let firstName = firstNameCipher.update(req.body.firstName, 'utf8', 'hex') + firstNameCipher.final('hex');
	let lastNameCipher = crypto.createCipher(config.algorithm, QRCode);
	let lastName = lastNameCipher.update(req.body.lastName, 'utf8', 'hex') + lastNameCipher.final('hex');
	let userNameCipher = crypto.createCipher(config.algorithm, QRCode);
	let userName = userNameCipher.update(req.body.userName, 'utf8', 'hex') + userNameCipher.final('hex');
	let emailCipher = crypto.createCipher(config.algorithm, QRCode);
	let email = emailCipher.update(req.body.email, 'utf8', 'hex') + emailCipher.final('hex');
	let contactCipher = crypto.createCipher(config.algorithm, QRCode);
	let contact = contactCipher.update(req.body.contact, 'utf8', 'hex') + contactCipher.final('hex');
	let passwordCipher = crypto.createCipher(config.algorithm, QRCode);
	let password = passwordCipher.update(req.body.password, 'utf8', 'hex') + passwordCipher.final('hex');
	User.create({
		QRCode: QRCode,
		firstName: firstName,
		lastName: lastName,
		userName: userName,
		email: email,
		contact: contact,
		password: password
	}).then(user => {
		Role.findAll({
			where: {
				roleName: {
					[Op.or]: roleName
				}
			}
		}).then(roles => {
			user.setRoles(roles).then(() => {
				res.status(httpStatus.CREATED).json("User registered successfully!");
			});
		}).catch(err => {
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json("Error -> " + err);
		});
	}).catch(err => {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json("Fail! Error -> " + err);
	})
}


exports.encryptData = async (req, res, next) => {
	try {
		var algorithm = 'aes256';
		var value = randomValueHex(30);
		console.log("value======>", value)
		var cipher = crypto.createCipher(algorithm, config.secret);
		var encrypted = cipher.update(req.body.name, 'utf8', 'hex') + cipher.final('hex');
		console.log(encrypted);
		var decipher = crypto.createDecipher(algorithm, config.secret);
		var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
		console.log(decrypted);
		const test = await Test.create({
			name: encrypted
		});
		return res.status(httpStatus.CREATED).json({
			message: "Test successfully created",
			test
		});
	} catch (error) {
		console.log("eroor===>", error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
	}
}

exports.deleteSelected = async (req, res, next) => {
	try {

		const deleteSelected = req.body.ids;
		console.log("delete selected==>", deleteSelected);
		const update = {
			isActive: false
		};
		if (!deleteSelected) {
			return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
				message: "No id Found"
			});
		}
		const updatedUser = await User.update(update, {
			where: {
				userId: {
					[Op.in]: deleteSelected
				}
			}
		})
		console.log("updated user==>", updatedUser)
		if (updatedUser) {
			return res.status(httpStatus.OK).json({
				message: "Users deleted successfully",
			});
		}
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
	}
}

encrypt = (text) => {
	let key = config.secret;
	let algorithm = 'aes-128-cbc';
	let cipher = crypto.createCipher(algorithm, key);
	let encryptedText = cipher.update(text, 'utf8', 'hex');
	encryptedText += cipher.final('hex');
	return encryptedText;
}

decrypt = (text) => {
	let key = config.secret;
	let algorithm = 'aes-128-cbc';
	let decipher = crypto.createDecipher(algorithm, key);
	let decryptedText = decipher.update(text, 'hex', 'utf8');
	decryptedText += decipher.final('utf8');
	return decryptedText;
}

constraintCheck = (property, object) => {
	if ((property in object) && object[property] !== undefined && object[property] !== '' && object[property] !== null) {
		return true;
	} else {
		return false;
	}
}

constraintReturn = (checkConstraint, object, property, entry) => {
	if (checkConstraint) {
		return encrypt(object[property]);
	} else {
		return entry[property];
	}
}

referenceConstraintReturn = (checkConstraint, object, property, entry) => {
	if (checkConstraint) {
		return object[property];
	} else {
		return entry[property];
	}
}

passwordConstraintReturn = (checkConstraint, object, property, entry) => {
	if (checkConstraint) {
		return bcrypt.hashSync(object[property], 8);
	} else {
		return entry[property];
	}
}


mailToUser = (email, firstName, lastName, id, token) => {
	const encryptedId = encrypt(id.toString());
	const encryptedToken = encrypt(token);
	const request = mailjet.post("send", { 'version': 'v3.1' })
		.request({
			"Messages": [
				{
					"From": {
						"Email": "rohit.khandelwal@greatwits.com",
						"Name": "Greatwits"
					},
					"To": [
						{
							"Email": decrypt(email),
							"Name": decrypt(firstName) + ' ' + decrypt(lastName)
						}
					],
					"Subject": "Password reset link",
					"HTMLPart": `<h3>Hi ${decrypt(firstName)},</h3><br />Please click on the below link to reset your password.<br /><a href=\`http://mydreamsociety.com/token?userId=${encryptedId}&&token=${encryptedToken}\`>Click Here</a>`
				}
			]
		})
	request
		.then((result) => {
			console.log(result.body)
			console.log(`http://mydreamsociety.com/api/token?userId=${encryptedId}token=${encryptedToken}`);
		})
		.catch((err) => {
			console.log(err.statusCode)
		})
}
// mailToUser = (email, firstName, lastName, id, token) => {
// 	const encryptedId = encrypt(id.toString());
// 	const encryptedToken = encrypt(token);
// 	const request = mailjet.post("send", { 'version': 'v3.1' })
// 		.request({
// 			"Messages": [
// 				{
// 					"From": {
// 						"Email": "rohit.khandelwal@greatwits.com",
// 						"Name": "Greatwits"
// 					},
// 					"To": [
// 						{
// 							"Email": decrypt(email),
// 							"Name": decrypt(firstName) + ' ' + decrypt(lastName)
// 						}
// 					],
// 					"Subject": "Password reset link",
// 					"HTMLPart": `<h3>Hi ${decrypt(firstName)},</h3><br />Please click on the below link to reset your password.<br /><a href=\`http://mydreamsociety.com/token?userId=${encryptedId}&&token=${encryptedToken}\`>Click Here</a>`
// 				}
// 			]
// 		})
// 	request
// 		.then((result) => {
// 			console.log(result.body)
// 			console.log(`http://mydreamsociety.com/token?userId=${encryptedId}token=${encryptedToken}`);
// 		})
// 		.catch((err) => {
// 			console.log(err.statusCode)
// 		})
// }

generateOTP = () => {
	const OTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
	return OTP;
}

generateToken = () => {
	const token = Math.random().toString(36).replace('0.', '');
	return token;
}

exports.signupEncrypted = async (req, res, next) => {
	console.log('Body ===>', req.body);
	let password;
	let userBody = req.body;
	let rolesBody = req.body.roles;
	let userContactErr;
	let userEmailErr;
	let userUserNameErr;
	const roleName = [];
	if (rolesBody) {
		roleName.push(rolesBody);
	}

	console.log(roleName);

	if (!userBody.userName || !userBody.email || !userBody.roles) {
		return res.json({
			message: "Parameters missing"
		});
	} else {
		if (!userBody.password) {
			password = generator.generate({
				length: 10,
				numbers: true
			});
			userBody.password = password;
		}

		if ((userBody['firstName'] !== undefined) && (userBody['lastName'] !== undefined) && (userBody['contact'] !== undefined)) {
			create = {
				firstName: encrypt(userBody.firstName),
				lastName: encrypt(userBody.lastName),
				userName: encrypt(userBody.userName),
				email: encrypt(userBody.email),
				contact: encrypt(userBody.contact),
				password: bcrypt.hashSync(userBody.password, 8),
				towerId: req.body.towerId,
				// // flatDetailId: req.body.flatDetailId,
				familyMember: encrypt(userBody.familyMember),
				parking: encrypt(userBody.parking),
				// floor: encrypt(userBody.floor)
			}
		} else {
			create = {
				// firstName: encrypt(userBody.firstName),
				// lastName: encrypt(userBody.lastName),
				userName: encrypt(userBody.userName),
				email: encrypt(userBody.email),
				// contact: encrypt(userBody.contact),
				password: bcrypt.hashSync(userBody.password, 8),
				towerId: req.body.towerId,
				// // flatDetailId: req.body.flatDetailId,
				familyMember: encrypt(userBody.familyMember),
				parking: encrypt(userBody.parking),
				// floor: encrypt(userBody.floor)
			}
		}

		if (userBody['userName'] !== undefined) {
			userUserNameErr = await User.findOne({
				where: {
					[Op.and]: [{
						isActive: true
					}, {
						userName: encrypt(userBody.userName)
					}]
				}
			});
		} else {
			userUserNameErr = null;
		}
		if (userBody['contact'] !== undefined) {
			userContactErr = await User.findOne({
				where: {
					[Op.and]: [{
						isActive: true
					}, {
						contact: encrypt(userBody.contact)
					}]
				}
			});
		} else {
			userContactErr = null;
		}
		if (userBody['email'] !== undefined) {
			userEmailErr = await User.findOne({
				where: {
					[Op.and]: [{
						isActive: true
					}, {
						email: encrypt(userBody.email)
					}]
				}
			});
		} else {
			userEmailErr = null;
		}

		if (userUserNameErr !== null) {
			console.log('Duplicate Username, user not updated');
			// userUserNameErr.firstName = decrypt(userUserNameErr.firstName);
			// userUserNameErr.lastName = decrypt(userUserNameErr.lastName);
			// userUserNameErr.userName = decrypt(userUserNameErr.userName);
			// userUserNameErr.email = decrypt(userUserNameErr.email);
			// userUserNameErr.contact = decrypt(userUserNameErr.contact);
			// userUserNameErr.familyMember = decrypt(userUserNameErr.familyMember);
			// userUserNameErr.parking = decrypt(userUserNameErr.parking);
			// userUserNameErr.floor = decrypt(userUserNameErr.floor);
			messageUsernameErr = "Username already exist for another user";
			// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			// 	messageUsernameErr: "Username already exist for another user",
			// 	user: userUserNameErr
			// });
		} else {
			messageUsernameErr = "";
		}

		if (userContactErr !== null) {
			// console.log(userContactErr);
			console.log('Duplicate Contact, user not updated');
			// userContactErr.firstName = decrypt(userContactErr.firstName);
			// userContactErr.lastName = decrypt(userContactErr.lastName);
			// userContactErr.userName = decrypt(userContactErr.userName);
			// userContactErr.email = decrypt(userContactErr.email);
			// userContactErr.contact = decrypt(userContactErr.contact);
			// userContactErr.familyMember = decrypt(userContactErr.familyMember);
			// userContactErr.parking = decrypt(userContactErr.parking);
			// userContactErr.floor = decrypt(userContactErr.floor);
			messageContactErr = "Contact already exist for another user";
			// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			// 	messageContactErr: "Contact already exist for another user",
			// 	user: userContactErr
			// });
		} else {
			messageContactErr = "";
		}

		if (userEmailErr !== null) {
			console.log('Duplicate Email, user not updated');
			// userEmailErr.firstName = decrypt(userEmailErr.firstName);
			// userEmailErr.lastName = decrypt(userEmailErr.lastName);
			// userEmailErr.userName = decrypt(userEmailErr.userName);
			// userEmailErr.email = decrypt(userEmailErr.email);
			// userEmailErr.contact = decrypt(userEmailErr.contact);
			// userEmailErr.familyMember = decrypt(userEmailErr.familyMember);
			// userEmailErr.parking = decrypt(userEmailErr.parking);
			// userEmailErr.floor = decrypt(userEmailErr.floor);
			messageEmailErr = "Email already exist for another user";
			// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			// 	messageEmailErr: "Email already exist for another user",
			// 	user: userEmailErr
			// });
		} else {
			messageEmailErr = "";
		}

		const messageErr = {
			messageUsernameErr: messageUsernameErr,
			messageEmailErr: messageEmailErr,
			messageContactErr: messageContactErr
		};
		if ((messageErr.messageUsernameErr === '') && (messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
			const roles = await Role.findAll({
				where: {
					roleName: {
						[Op.or]: roleName
					}
				}
			});

			console.log(roles);

			User.create(create)
				.then(user => {
					user.setRoles(roles);
				})
				.then(() => {
					return res.status(httpStatus.CREATED).json({
						message: "User registered successfully!"
					});
				})
				.catch(err => {
					console.log("err ===>", err.name)
					res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
						status: 500,
						message: err.name
					});
				})
		} else {
			return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
			// User.findOrCreate({
			// 	where: {
			// 		userName: create.userName,
			// 		contact: create.contact,
			// 		email: create.email,
			// 		isActive: true
			// 	},
			// 	defaults: create
			// })
			// 	.spread((user, created) => {
			// 		if (created) {
			// 			user.setRoles(roles);
			// 			return res.status(httpStatus.CREATED).json({ message: "User registered successfully!" });
			// 		} else {
			// 			res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'User Already Exists' });
			// 		}
			// 	})
			// 	.catch(err => {
			// 		console.log("err ===>", err.name)
			// 		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			// 			status: 500,
			// 			message: err.name
			// 		});
			// 	})
		}
	}
}

exports.updateEncrypted = async (req, res, next) => {
	const id = req.params.id;
	let userUserNameErr;
	let userEmailErr;
	let userContactErr;
	console.log("ID ===>", id);
	if (!id) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Id is missing"
		});
	}
	const update = req.body;
	console.log("Body ===>", update);
	if (!update) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Please try again "
		});
	}
	const user = await User.find({
		where: {
			userId: id
		}
	});
	if (update['userName'] !== undefined) {
		userUserNameErr = await User.findOne({
			where: {
				[Op.and]: [{
					isActive: true
				}, {
					userName: encrypt(update.userName)
				}, {
					userId: {
						[Op.ne]: id
					}
				}]
			}
		});
	} else {
		userUserNameErr = null;
	}
	if (update['contact'] !== undefined) {
		userContactErr = await User.findOne({
			where: {
				[Op.and]: [{
					isActive: true
				}, {
					contact: encrypt(update.contact)
				}, {
					userId: {
						[Op.ne]: id
					}
				}]
			}
		});
	} else {
		userContactErr = null;
	}
	if (update['email'] !== undefined) {
		userEmailErr = await User.findOne({
			where: {
				[Op.and]: [{
					isActive: true
				}, {
					email: encrypt(update.email)
				}, {
					userId: {
						[Op.ne]: id
					}
				}]
			}
		});
	} else {
		userEmailErr = null;
	}

	if (userUserNameErr !== null) {
		console.log('Duplicate Username, user not updated');
		// userUserNameErr.firstName = decrypt(userUserNameErr.firstName);
		// userUserNameErr.lastName = decrypt(userUserNameErr.lastName);
		// userUserNameErr.userName = decrypt(userUserNameErr.userName);
		// userUserNameErr.email = decrypt(userUserNameErr.email);
		// userUserNameErr.contact = decrypt(userUserNameErr.contact);
		// userUserNameErr.familyMember = decrypt(userUserNameErr.familyMember);
		// userUserNameErr.parking = decrypt(userUserNameErr.parking);
		// userUserNameErr.floor = decrypt(userUserNameErr.floor);
		messageUsernameErr = "Username already exist for another user";
		// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
		// 	messageUsernameErr: "Username already exist for another user",
		// 	user: userUserNameErr
		// });
	} else {
		messageUsernameErr = "";
	}

	if (userContactErr !== null) {
		// console.log(userContactErr);
		console.log('Duplicate Contact, user not updated');
		// userContactErr.firstName = decrypt(userContactErr.firstName);
		// userContactErr.lastName = decrypt(userContactErr.lastName);
		// userContactErr.userName = decrypt(userContactErr.userName);
		// userContactErr.email = decrypt(userContactErr.email);
		// userContactErr.contact = decrypt(userContactErr.contact);
		// userContactErr.familyMember = decrypt(userContactErr.familyMember);
		// userContactErr.parking = decrypt(userContactErr.parking);
		// userContactErr.floor = decrypt(userContactErr.floor);
		messageContactErr = "Contact already exist for another user";
		// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
		// 	messageContactErr: "Contact already exist for another user",
		// 	user: userContactErr
		// });
	} else {
		messageContactErr = "";
	}

	if (userEmailErr !== null) {
		console.log('Duplicate Email, user not updated');
		// userEmailErr.firstName = decrypt(userEmailErr.firstName);
		// userEmailErr.lastName = decrypt(userEmailErr.lastName);
		// userEmailErr.userName = decrypt(userEmailErr.userName);
		// userEmailErr.email = decrypt(userEmailErr.email);
		// userEmailErr.contact = decrypt(userEmailErr.contact);
		// userEmailErr.familyMember = decrypt(userEmailErr.familyMember);
		// userEmailErr.parking = decrypt(userEmailErr.parking);
		// userEmailErr.floor = decrypt(userEmailErr.floor);
		messageEmailErr = "Email already exist for another user";
		// return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
		// 	messageEmailErr: "Email already exist for another user",
		// 	user: userEmailErr
		// });
	} else {
		messageEmailErr = "";
	}

	const messageErr = {
		messageUsernameErr: messageUsernameErr,
		messageEmailErr: messageEmailErr,
		messageContactErr: messageContactErr
	};
	if ((messageErr.messageUsernameErr === '') && (messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
		firstNameCheck = constraintCheck('firstName', update);
		lastNameCheck = constraintCheck('lastName', update);
		userNameCheck = constraintCheck('userName', update);
		emailCheck = constraintCheck('email', update);
		contactCheck = constraintCheck('contact', update);
		passwordCheck = constraintCheck('password', update);
		towerIdCheck = constraintCheck('towerId', update);
		// // flatDetailIdCheck = constraintCheck('flatDetailId', update);
		familyMemberCheck = constraintCheck('familyMember', update);
		parkingCheck = constraintCheck('parking', update);
		// floorCheck = constraintCheck('floor', update);

		firstName = constraintReturn(firstNameCheck, update, 'firstName', user);
		lastName = constraintReturn(lastNameCheck, update, 'lastName', user);
		userName = constraintReturn(userNameCheck, update, 'userName', user);
		email = constraintReturn(emailCheck, update, 'email', user);
		contact = constraintReturn(contactCheck, update, 'contact', user);
		familyMember = constraintReturn(familyMemberCheck, update, 'familyMember', user);
		parking = constraintReturn(parkingCheck, update, 'parking', user);
		// floor = constraintReturn(floorCheck, update, 'floor', user);
		towerId = referenceConstraintReturn(towerIdCheck, update, 'towerId', user);
		// // // flatDetailId = referenceConstraintReturn(flatDetailIdCheck, update, 'flatDetailId', user);
		password = passwordConstraintReturn(passwordCheck, update, 'password', user);

		const updates = {
			firstName: firstName,
			lastName: lastName,
			userName: userName,
			email: email,
			contact: contact,
			password: password,
			towerId: towerId,
			// // flatDetailId: flatDetailId,
			familyMember: familyMember,
			parking: parking,
			// floor: floor
		}

		const roles = await Role.find({
			where: {
				roleName: update.roleName
			}
		});

		User.find({
			where: {
				userId: id
			}
		})
			.then(user => {
				user.setRoles(roles);
				return user.updateAttributes(updates);
			})
			.then(user => {
				if ((user['firstName'] !== null) && (user['lastName'] !== null) && (user['contact'] !== null)) {
					user.firstName = decrypt(user.firstName);
					user.lastName = decrypt(user.lastName);
					user.userName = decrypt(user.userName);
					user.email = decrypt(user.email);
					user.contact = decrypt(user.contact);
					user.familyMember = decrypt(user.familyMember);
					user.parking = decrypt(user.parking);
					// user.floor = decrypt(user.floor);
				} else {
					// user.firstName = decrypt(user.firstName);
					// user.lastName = decrypt(user.lastName);
					user.userName = decrypt(user.userName);
					user.email = decrypt(user.email);
					// user.contact = decrypt(user.contact);
					user.familyMember = decrypt(user.familyMember);
					user.parking = decrypt(user.parking);
					// user.floor = decrypt(user.floor);
				}
				res.status(httpStatus.OK).json({
					message: "User updated successfully!",
					updatedUser: user
				});
			})
			.catch(err => {
				console.log(err)
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
			})
	} else {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
	}

}

exports.signinDecrypted = async (req, res, next) => {
	console.log("Sign-In 12121", req.body);
	let society = await Society.findOne({
		where: {
			isActive: true
		},
		attributes: ['societyId', 'societyName'],
		include: [{
			model: City,
			attributes: ['cityId', 'cityName']
		},
		{
			model: Country,
			attributes: ['countryId', 'countryName']
		},
		{
			model: State,
			attributes: ['stateId', 'stateName']
		},
		{
			model: User,
			attributes: ['userId', 'userName']
		},
		{
			model: Location,
			attributes: ['locationId', 'locationName']
		},
		]
	});

	society.societyName = decrypt(society.societyName);

	// let userName = '%'+req.body.userName;
	// console.log(userName)
	if (!req.body.userName) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Username cannot be empty"
		})
	}
	if (!req.body.password) {
		return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
			message: "Password cannot be empty"
		})
	}
	console.log("1");
	User.findOne({
		where: {
			[Op.and]: [{
				userName: encrypt(req.body.userName)
			},
			{
				isActive: true
			}
			]

		},
		include: [{
			model: Role,
			attributes: ['id', 'roleName'],
		}]
	}).then(user => {
		console.log("2");
		console.log(user)
		if (!user) {
			console.log("------user-------");
			return res.status(httpStatus.OK).send({
				status: 401,
				auth: false,
				user: user,
				message: "Invalid Username!"
			});
		}
		if ((user['firstName'] !== null) && (user['lastName'] !== null) && (user['contact'] !== null)) {
			user.firstName = decrypt(user.firstName);
			user.lastName = decrypt(user.lastName);
			user.userName = decrypt(user.userName);
			user.email = decrypt(user.email);
			user.contact = decrypt(user.contact);
			user.familyMember = decrypt(user.familyMember);
			user.parking = decrypt(user.parking);
			// user.floor = decrypt(user.floor);
		} else {
			// user.firstName = decrypt(user.firstName);
			// user.lastName = decrypt(user.lastName);
			user.userName = decrypt(user.userName);
			user.email = decrypt(user.email);
			// user.contact = decrypt(user.contact);
			user.familyMember = decrypt(user.familyMember);
			user.parking = decrypt(user.parking);
			// user.floor = decrypt(user.floor);
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		console.log("isvalid===>", passwordIsValid)
		if (!passwordIsValid) {
			return res.status(httpStatus.OK).send({
				status: 401,
				auth: false,
				user: user,
				message: "Invalid Password!"

			});
		}

		var token = jwt.sign({
			id: user.userId
		}, config.secret, {
				expiresIn: 86400 // expires in 24 hours
			});

		res.status(httpStatus.OK).send({
			status: 200,
			auth: true,
			accessToken: token,
			user: user,
			society: society,
			message: "Successfully Logged In"
		});

	}).catch(err => {
		console.log('123',err)
		res.status(500).json({
			"message": err
		});
	});

	console.log("4");
}

exports.getUserDecrypted = (req, res, next) => {
	try {
		const usersArr = [];
		User.findAll({
			where: {
				isActive: true
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [{
				model: Role,
				attributes: ['id', 'roleName'],
			},
			{
				model: Tower
			}
			]
		})
			.then(users => {
				users.map(item => {
					if ((item['firstName'] !== null) && (item['lastName'] !== null) && (item['contact'] !== null)) {
						item.firstName = decrypt(item.firstName);
						item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						item.contact = decrypt(item.contact);
						item.familyMember = decrypt(item.familyMember);
						item.parking = decrypt(item.parking);
						// item.floor = decrypt(item.floor);
						usersArr.push(item);
					} else {
						// item.firstName = decrypt(item.firstName);
						// item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						// item.contact = decrypt(item.contact);
						item.familyMember = decrypt(item.familyMember);
						item.parking = decrypt(item.parking);
						// user.floor = decrypt(user.floor);
					}
				})
				return usersArr;
			})
			.then(user => {
				res.status(httpStatus.OK).json(user);
			});
	} catch (error) {
		console.log("error--->", error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			"message": error
		})
	}
}

exports.getPersonDecrypted = (req, res, next) => {
	try {
		const usersArr = [];
		User.findAll({
			where: {
				isActive: true
			},
			order: [
				['createdAt', 'DESC']
			],
			include: [{
				model: Role,
				attributes: ['id', 'roleName'],
			},
			{
				model: Tower
			}
			]
		})
			.then(users => {
				users.map(item => {
					if ((item['firstName'] !== null) && (item['lastName'] !== null) && (item['contact'] !== null)) {
						item.firstName = decrypt(item.firstName);
						item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						item.contact = decrypt(item.contact);
						item.familyMember = decrypt(item.familyMember);
						item.parking = decrypt(item.parking);
						// item.floor = decrypt(item.floor);
					} else {
						// item.firstName = decrypt(item.firstName);
						// item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						// item.contact = decrypt(item.contact);
						item.familyMember = decrypt(item.familyMember);
						item.parking = decrypt(item.parking);
						// user.floor = decrypt(user.floor);
						usersArr.push(item);
					}
				})
				return usersArr;
			})
			.then(user => {
				res.status(httpStatus.OK).json(user);
			});
	} catch (error) {
		console.log("error--->", error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			"message": error
		})
	}
}

exports.forgottenPassword = (req, res, next) => {
	const userName = req.params.userName;
	console.log('User ===>', userName);

	User.find({
		where: {
			userName: encrypt(userName),
			isActive: true
		}
	})
		.then(user => {
			// console.log(user);
			if (user !== null) {
				token = generateToken();
				console.log(token);
				mailToUser(user.email, user.firstName, user.lastName, user.userId, token);

				Token.create({
					token: token
				})
				
				res.status(httpStatus.OK).json({
					message: 'Email with reset link is sent to registered email id'
				});
			} else {
				res.status(httpStatus.UNAUTHORIZED).json({
					errMessage: 'User does not exist'
				});
			}
		})
}

exports.changePassword = (req, res, next) => {
	const body = req.body;
	console.log('Body ===>', body);

	User.findOne({
		where: {
			userId: body.userId
		}
	})
		.then(user => {
			if (bcrypt.compareSync(body.oldPassword, user.password) === true) {
				let password = bcrypt.hashSync(body.newPassword, 8);
				const passwordUpdate = {
					password: password
				};
				user.updateAttributes(passwordUpdate);

				res.status(httpStatus.CREATED).json({
					message: 'Password Changed Successfully. Please Login Again'
				});
			} else {
				res.status(httpStatus.UNAUTHORIZED).json({
					message: 'Old password not matching. Please try forgot password.'
				});
			}
		})
		.catch(err => {
			console.log("error--->", err)
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
				"message": err
			})
		})
}

exports.tokenVerify = (req, res, next) => {
	console.log(req.params);
	url = req.params.url;
	const reqObj = {};
	console.log('Body ===>', url);
	required = url.split('userId=')[1];
	reqObj.userId = required.split('token=')[0];
	reqObj.token = required.split('token=')[1];

	userId = decrypt(reqObj.userId);
	console.log(userId);

	token = decrypt(reqObj.token);

	Token.findOne({
		where: {
			token: token
		}
	})
		.then(token => {
			if (token !== null) {
				OTP = generateOTP();
				console.log(OTP);

				OTPTable.create({
					otp: OTP,
					userId: userId
				})
				res.status(httpStatus.OK).json({
					message: 'Token verified'
				});
			} else {
				res.status(httpStatus.UNAUTHORIZED).json({
					messageErr: 'Token expired'
				})
			}
		})
		.catch(err => {
			console.log('Error ===>', err);
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

exports.otpVerify = (req, res, next) => {
	body = req.body;
	const reqObj = {};
	console.log('Body ===>', body);
	required = body.url.split('userId=')[1];
	reqObj.userId = required.split('token=')[0];
	reqObj.token = required.split('token=')[1];

	otp = body.otp;

	userId = decrypt(reqObj.userId);
	console.log(userId);

	token = decrypt(reqObj.token);

	OTPTable.findOne({ where: { userId: userId, otp: otp, isActive: true } })
		.then(user => {
			// console.log(user);
			if (user !== null) {
				user.destroy();
				Token.findOne({
					where: {
						token: token
					}
				})
				.then(token => {
					token.destroy();
				})
				res.status(httpStatus.OK).json({
					message: 'OTP verified successfully'
				})
			} else {
				res.status(httpStatus.UNAUTHORIZED).json({
					messageErr: 'OTP not valid'
				})
			}
		})
		.catch(err => {
			console.log('Error ===>', err);
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

exports.resetPassword = (req, res, next) => {
	body = req.body.values;
	console.log(body);

	const reqObj = {};
	console.log('Body ===>', body);
	required = body.url.split('userId=')[1];
	reqObj.userId = required.split('token=')[0];
	reqObj.token = required.split('token=')[1];

	userId = decrypt(reqObj.userId);
	console.log(userId);

	User.findOne({ where: { userId: userId, isActive: true } })
		.then(user => {
			if (user !== null) {
				const password = {
					password: bcrypt.hashSync(body.newPassword, 8)
				}
				user.updateAttributes(password);
				res.status(httpStatus.CREATED).json({
					message: 'Password reset successful'
				});
			} else {
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
					messageErr: 'Password reset error'
				});
			}
		})
		.catch(err => {
			console.log('Error ===>', err)
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

diff_minutes = (dt2, dt1) => {

	var diff = (dt2.getTime() - dt1.getTime()) / 1000;
	diff /= 60;
	return Math.abs(Math.round(diff));

}

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);
schedule.scheduleJob(rule, () => {
	date = new Date();
	console.log(date);
	OTPTable.findAll()
		.then(user => {
			user.map(item => {
				console.log(diff_minutes(date, item.createdAt));
				if (diff_minutes(date, item.createdAt) > 5) {
					item.destroy();
				}
			})
		})
		.catch(err => console.log(err))
});