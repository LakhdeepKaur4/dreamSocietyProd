const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var CryptoJS = require("crypto-js");
var crypto = require('crypto');
var generator = require('generate-password');
const mailjet = require('node-mailjet').connect(config.mail_public_key, config.mail_secret_key);
var schedule = require('node-schedule');
const key = config.secret;
const randomInt = require('random-int');

const User = db.user;
const Role = db.role;
const Test = db.test;
const Tower = db.tower;
const Floor = db.floor;
const Society = db.society;
const City = db.city;
const Country = db.country;
const State = db.state;
const Location = db.location;
const Owner = db.owner;
const Tenant = db.tenant;
const TenantFlatDetail = db.tenantFlatDetail;
// const Owner = db.owner;
const OwnerFlatDetail = db.ownerFlatDetail;
const Vendor = db.vendor;
const Employee = db.employee;
const FlatDetail = db.flatDetail;
const OTPTable = db.otpUserVerify;
const Token = db.tokenVerify;
const UserRoles = db.userRole;
const UserRfid = db.userRfid;
const OwnerMembersDetail = db.ownerMembersDetail;
const FingerprintData = db.fingerprintData;

const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.start = (req, res) => {
	console.log('Dream Society');
	res.send('Dream Society Api Running');
}


exports.test = (req, res) => {
	res.send('Test');
}

function decrypt1(key, data) {
	var decipher = crypto.createDecipher("aes-128-cbc", key);
	var decrypted = decipher.update(data, "hex", "utf-8");
	decrypted += decipher.final("utf-8");

	return decrypted;
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

generateOTP = () => {
	const OTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
	return OTP;
}

generateToken = () => {
	const token = Math.random().toString(36).replace('0.', '');
	return token;
}

sendSMS = (number, OTP) => {
	const apiKey = '07hlECj1sy4-ynODCNlExLsx91Pv29Zdrh0bxc1pLc';
	const num = number;

	const message = `Your OTP for password reset is ${OTP} which is valid for 5 min. Please do not disclose OTP.`;

	http.get(`http://api.textlocal.in/send/?apiKey=${apikey}&numbers=${num}&message=${message}`, (err, data) => {
		if (err) {
			console.log('Message sending error ===>', err);
			return false;
		} else {
			return true;
		}
	});
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
				raw: true,
				roleName: {
					[Op.or]: roleName
				}
			}
		}).then(roles => {

			// user.setRoles(roles).then(() => {
			// UserRoles.create({userId:user.userId,roleId:roleId});
			res.status(httpStatus.CREATED).json({
				message: "User registered successfully!"
			});
			// });
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
			// user.setRoles(roles).then(() => {
			UserRoles.create({ userId: user.userId, roleId: roles.id })
			res.status(httpStatus.CREATED).json("User registered successfully!");
			// });
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
	let randomNumber;
	randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
	const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
	if (userExists !== null) {
		console.log("duplicate random number")
		randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
	}
	userBody.userId = randomNumber;
	console.log(userBody)

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
				userId: userBody.userId,
				firstName: encrypt(userBody.firstName),
				lastName: encrypt(userBody.lastName),
				userName: encrypt(userBody.email),
				email: encrypt(userBody.email),
				contact: encrypt(userBody.contact),
				password: bcrypt.hashSync(userBody.password, 8),
				towerId: req.body.towerId,
				// // flatDetailId: req.body.flatDetailId,
				// familyMember: encrypt(userBody.familyMember),
				// parking: encrypt(userBody.parking),
				// floor: encrypt(userBody.floor)
			}
		} else {
			create = {
				userId: userBody.userId,
				// firstName: encrypt(userBody.firstName),
				// lastName: encrypt(userBody.lastName),
				userName: encrypt(userBody.userName),
				email: encrypt(userBody.email),
				// contact: encrypt(userBody.contact),
				password: bcrypt.hashSync(userBody.password, 8),
				towerId: req.body.towerId,
				// // flatDetailId: req.body.flatDetailId,
				// familyMember: encrypt(userBody.familyMember),
				// parking: encrypt(userBody.parking),
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

			// console.log(roles);

			User.create(create)
				.then(user => {
					let roleId;
					// user.setRoles(roles);
					roles.map(role => {
						roleId = role.id;
					});
					UserRoles.create({ userId: user.userId, roleId: roleId });
					FingerprintData.create({ userId: user.userId });
				})
				.then(() => {
					return res.status(httpStatus.CREATED).json({
						message: "User registered successfully!"
					});
				})
				.catch(err => {
					console.log("err ===>", err)
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
	let flats;
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
		// familyMemberCheck = constraintCheck('familyMember', update);
		parkingCheck = constraintCheck('parking', update);
		// floorCheck = constraintCheck('floor', update);

		firstName = constraintReturn(firstNameCheck, update, 'firstName', user);
		lastName = constraintReturn(lastNameCheck, update, 'lastName', user);
		userName = constraintReturn(userNameCheck, update, 'userName', user);
		email = constraintReturn(emailCheck, update, 'email', user);
		contact = constraintReturn(contactCheck, update, 'contact', user);
		// familyMember = constraintReturn(familyMemberCheck, update, 'familyMember', user);
		// parking = constraintReturn(parkingCheck, update, 'parking', user);
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
			// familyMember: familyMember,
			// parking: parking,
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
				// user.setRoles(roles);
				let roleId;
				// user.setRoles(roles);
				roles.map(role => {
					roleId = role.id;
				});
				UserRoles.create({ userId: user.userId, roleId: roleId });
				return user.updateAttributes(updates);
			})
			.then(user => {
				if ((user['firstName'] !== null) && (user['lastName'] !== null) && (user['contact'] !== null)) {
					user.firstName = decrypt(user.firstName);
					user.lastName = decrypt(user.lastName);
					user.userName = decrypt(user.userName);
					user.email = decrypt(user.email);
					user.contact = decrypt(user.contact);
					// user.familyMember = decrypt(user.familyMember);
					// user.parking = decrypt(user.parking);
					// user.floor = decrypt(user.floor);
				} else {
					// user.firstName = decrypt(user.firstName);
					// user.lastName = decrypt(user.lastName);
					user.userName = decrypt(user.userName);
					user.email = decrypt(user.email);
					// user.contact = decrypt(user.contact);
					// user.familyMember = decrypt(user.familyMember);
					// user.parking = decrypt(user.parking);
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
	let flats;
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
	console.log("userName", encrypt(req.body.userName))
	User.findOne({
		nested: true,
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
		}
		]
	}).then(user => {
		// console.log("user--->", user)
		if (user === null) {
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
			// user.familyMember = decrypt(user.familyMember);
			// user.parking = decrypt(user.parking);
			// user.floor = decrypt(user.floor);
		} else {
			// user.firstName = decrypt(user.firstName);
			// user.lastName = decrypt(user.lastName);
			user.userName = decrypt(user.userName);
			user.email = decrypt(user.email);
			// user.contact = decrypt(user.contact);
			// user.familyMember = decrypt(user.familyMember);
			// user.parking = decrypt(user.parking);
			// user.floor = decrypt(user.floor);
		}
		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		// const password = User.findOne({where:{password:decrypt(req.body.password),isActive:true}});

		console.log("isvalid===>", passwordIsValid)
		if (passwordIsValid.toString() === 'false') {
			return res.status(httpStatus.OK).send({
				status: 401,
				auth: false,
				// user: user,
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
			message: "Successfully Logged In",
			flats: flats
		});

	}).catch(err => {
		res.status(500).json({
			"message": err
		});
	});
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
				// through: {
				//     attributes: ['roleId', 'roleName'],
				// }
			},
			{
				model: Tower
			}]
		})
			.then(users => {
				users.map(item => {
					if ((item['firstName'] !== null) && (item['lastName'] !== null) && (item['contact'] !== null)) {
						item.firstName = decrypt(item.firstName);
						item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						item.contact = decrypt(item.contact);
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
						// item.floor = decrypt(item.floor);
						usersArr.push(item);
					} else {
						// item.firstName = decrypt(item.firstName);
						// item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						item.contact = decrypt(item.contact);
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
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

exports.getUserRoleDecrypted = (req, res, next) => {
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
				where: {
					id: {
						[Op.in]: [1, 2, 3, 4]
					},
				},
				// through: {
				//     attributes: ['roleId', 'roleName'],
				// }
			},
			{
				model: Tower
			}]
		})
			.then(users => {
				users.map(item => {
					if ((item['firstName'] !== null) && (item['lastName'] !== null) && (item['contact'] !== null)) {
						item.firstName = decrypt(item.firstName);
						item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						item.contact = decrypt(item.contact);
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
						// item.floor = decrypt(item.floor);
						usersArr.push(item);
					} else {
						// item.firstName = decrypt(item.firstName);
						// item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						// item.contact = decrypt(item.contact);
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
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
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
						// item.floor = decrypt(item.floor);
					} else {
						// item.firstName = decrypt(item.firstName);
						// item.lastName = decrypt(item.lastName);
						item.userName = decrypt(item.userName);
						item.email = decrypt(item.email);
						// item.contact = decrypt(item.contact);
						// item.familyMember = decrypt(item.familyMember);
						// item.parking = decrypt(item.parking);
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

exports.tokenVerify = async (req, res, next) => {
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

	userContact = await User.findOne({
		where: {
			userId: userId,
			isActive: true
		},
		attributes: ['contact']
	});

	contact = decrypt(userContact.contact);

	Token.findOne({
		where: {
			token: token
		}
	})
		.then(token => {
			if (token !== null) {
				OTP = generateOTP();
				console.log(OTP);

				smsSended = sendSMS(contact, OTP);
				if (!smsSended) {
					res.status(httpStatus.FAILED_DEPENDENCY).json({
						message: 'SMS send failure. Please contact admin.'
					})
				} else {
					OTPTable.create({
						otp: OTP,
						userId: userId
					})
					res.status(httpStatus.OK).json({
						message: 'Token verified'
					});
				}
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
	date = new Date(Date.now());
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

exports.assignRoles = async (req, res, next) => {
	try {
		console.log("assigning roles==>");
		let userArr = [];
		const roleId = req.body.roleId;
		console.log(roleId);
		switch (roleId) {
			case "3": {
				const owner = await Owner.findOne({ where: { isActive: true, ownerId: req.body.userId } });
				console.log("owner==>", owner.email)
				// let ownerEmail = owner.email;
				const user = await User.findOne({ where: { isActive: true, email: owner.email }, attributes: ['userId', 'firstName', 'lastName', 'userName'], include: [{ model: Role, attributes: ['id', 'roleName'] }] });
				console.log("user==>", user);
				user.firstName = decrypt(user.firstName);
				user.lastName = decrypt(user.lastName);
				user.userName = decrypt(user.userName);
				userArr.push(user);
				if (user) {
					const userRoles = await UserRoles.create({
						userId: user.userId,
						roleId: req.body.id
					});
					if (userRoles && user) {
						res.json({ userArr });
					}
				}
				break;
			}
			case "4": {
				const tenant = await Tenant.findOne({ where: { isActive: true, tenantId: req.body.userId } });
				console.log(tenant)
				// let tenantEmail = tenant.email;
				const user = await User.findOne({ where: { isActive: true, email: tenant.email }, attributes: ['userId', 'firstName', 'lastName', 'userName'], include: [{ model: Role, attributes: ['id', 'roleName'] }] });
				console.log(user)
				user.firstName = decrypt(user.firstName);
				user.lastName = decrypt(user.lastName);
				user.userName = decrypt(user.userName);
				userArr.push(user);
				if (user) {
					const userRoles = await UserRoles.create({
						userId: user.userId,
						roleId: req.body.id
					});
					if (userRoles && user) {
						res.json({ userArr });
					}
				}
				break;
			}
			// case "5": {
			// 	const vendor = await Vendor.findOne({ where: { isActive: true, vendorId: req.body.userId } });
			// 	// let vendorEmail = vendor.email;
			// 	const user = await User.findOne({ where: { isActive: true, email: vendor.email }, attributes: ['userId', 'firstName', 'lastName', 'userName'], include: [{ model: Role, attributes: ['id', 'roleName'] }] })
			// 	user.firstName = decrypt(user.firstName);
			// 	user.lastName = decrypt(user.lastName);
			// 	user.userName = decrypt(user.userName);
			// 	userArr.push(user);
			// 	if (user) {
			// 		const userRoles = await UserRoles.create({
			// 			userId: user.userId,
			// 			roleId: req.body.id
			// 		});
			// 		if (userRoles && user) {
			// 			res.json({ userArr });
			// 		}
			// 	}
			// 	break;
			// }
			// case "6": {
			// 	console.log("in here");
			// 	const employee = await Employee.findOne({ where: { isActive: true, employeeId: req.body.userId } });
			// 	// let employeeEmail = decrypt(employee.email);
			// 	// console.log(employeeEmail);
			// 	const user = await User.findOne({ where: { isActive: true, email: employee.email }, attributes: ['userId', 'firstName', 'lastName', 'userName', 'email'], include: [{ model: Role, attributes: ['id', 'roleName'] }] });
			// 	user.firstName = decrypt(user.firstName);
			// 	user.lastName = decrypt(user.lastName);
			// 	user.userName = decrypt(user.userName);
			// 	userArr.push(user);
			// 	if (user) {
			// 		const userRoles = await UserRoles.create({
			// 			userId: user.userId,
			// 			roleId: req.body.id
			// 		});
			// 		if (userRoles && user) {
			// 			res.json({ userArr });
			// 		}
			// 	}
			// 	break;
			// }
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No Role Found with this Id" })
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.getRolesToAssign = async (req, res, next) => {
	try {
		const role = await Role.findAll({ where: { id: { [Op.notIn]: [1, 2, 5, 6] } } });
		console.log(role);
		return res.status(httpStatus.OK).json({ role: role });
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.getRolesForActivation = async (req, res, next) => {
	try {
		const role = await Role.findAll({ where: { id: { [Op.notIn]: [1, 2] } } });
		console.log(role);
		return res.status(httpStatus.OK).json({ role: role });
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.activeUsersByRole = async (req, res, next) => {
	try {
		const roleId = req.params.id;
		const userIds = [];
		console.log(roleId);
		const tenantsArr = [];
		const ownersArr = [];
		const vendorsArr = [];
		const employeesArr = [];
		console.log(roleId);
		switch (roleId) {
			case "3":
				const userByRole = await UserRoles.findAll({ where: { isActive: true, roleId: roleId } });
				userByRole.map(user => { userIds.push(user.userId) });
				const owners = await User.findAll({ where: { isActive: true, userId: { [Op.in]: userIds } }, attributes: ['userId', 'firstName', 'lastName', 'email'] });
				owners.map(owner => {
					let firstName = decrypt(owner.firstName);
					let lastName = decrypt(owner.lastName);
					let email = decrypt1(key, owner.email);
					let fullName = firstName + " " + lastName;
					console.log(fullName)
					ownersArr['fullName'] = fullName;
					ownersArr['type'] = 'Owner',
						ownersArr.push({ fullName: fullName, userId: owner.userId, type: 'ActiveOwner', email: email });
				})
				res.status(httpStatus.OK).json({ users: ownersArr });
				break;
			case "4":
				const users = await UserRoles.findAll({ where: { isActive: true, roleId: roleId } });
				users.map(user => { userIds.push(user.userId) });
				const tenants = await User.findAll({ where: { isActive: true, userId: { [Op.in]: userIds } }, attributes: ['userId', 'firstName', 'lastName', 'email'] });
				// console.log(tenants)
				tenants.map(tenant => {
					let firstName = decrypt(tenant.firstName);
					let lastName = decrypt(tenant.lastName);
					let email = decrypt1(key, tenant.email);
					let fullName = firstName + " " + lastName;
					tenantsArr['fullName'] = fullName;
					tenantsArr.push({ fullName: fullName, userId: tenant.userId, type: 'ActiveTenant', email: email });
				})
				res.status(httpStatus.OK).json({ users: tenantsArr });
				break;
			case "5":
				const vendors = await Vendor.findAll({ where: { isActive: true }, attributes: ['vendorId', 'firstName', 'lastName', 'email'] });
				vendors.map(vendor => {
					let firstName = decrypt(vendor.firstName);
					let lastName = decrypt(vendor.lastName);
					let email = decrypt1(key, vendor.email);
					let fullName = firstName + " " + lastName;
					vendorsArr['fullName'] = fullName;
					vendorsArr.push({ fullName: fullName, userId: vendor.vendorId, type: 'ActiveVendor', email: email });
				})
				res.status(httpStatus.OK).json({ users: vendorsArr });
				break;
			case "6":
				const employees = await Employee.findAll({ where: { isActive: true }, attributes: ['employeeId', 'firstName', 'middleName', 'lastName', 'email'] });
				employees.map(employee => {

					let firstName = decrypt(employee.firstName);
					let middleName = decrypt(employee.middleName);
					let lastName = decrypt(employee.lastName);
					let email = decrypt1(key, employee.email);
					let fullName = firstName + " " + middleName + " " + lastName;
					employeesArr['fullName'] = fullName;
					employeesArr.push({ fullName: fullName, userId: employee.employeeId, type: 'ActiveEmployee', email: email });
				})
				res.status(httpStatus.OK).json({ users: employeesArr });
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No Role Found with this Id" })
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.deactiveUsersByRole = async (req, res, next) => {
	try {
		const roleId = req.params.id;
		const tenantsArr = [];
		const ownersArr = [];
		const vendorsArr = [];
		const employeesArr = [];
		const userIds = [];
		console.log(roleId)
		switch (roleId) {
			case "3":
				const userByRole = await UserRoles.findAll({ where: { isActive: false, roleId: roleId } });
				userByRole.map(user => { userIds.push(user.userId) });
				const owners = await User.findAll({ where: { isActive: false, userId: { [Op.in]: userIds } }, attributes: ['userId', 'firstName', 'lastName', 'email'] });
				// const owners = await Owner.findAll({ where: { isActive: false }, attributes: ['ownerId', 'firstName', 'lastName'] });
				owners.map(owner => {
					let firstName = decrypt1(key, owner.firstName);
					let lastName = decrypt1(key, owner.lastName);
					let email = decrypt1(key, owner.email);
					let fullName = firstName + " " + lastName;
					ownersArr['fullName'] = fullName;
					ownersArr.push({ fullName: fullName, userId: owner.userId, type: 'DeactiveOwner', email: email });
				})
				res.status(httpStatus.OK).json({ users: ownersArr });
				break;
			case "4":
				const users = await UserRoles.findAll({ where: { isActive: false, roleId: roleId } });
				users.map(user => { userIds.push(user.userId) });
				const tenants = await User.findAll({ where: { isActive: false, userId: { [Op.in]: userIds } }, attributes: ['userId', 'firstName', 'lastName', 'email'] });
				// console.log(tenants)
				tenants.map(tenant => {
					let firstName = decrypt(tenant.firstName);
					let lastName = decrypt(tenant.lastName);
					let fullName = firstName + " " + lastName;
					tenantsArr['fullName'] = fullName;
					tenantsArr.push({ fullName: fullName, userId: tenant.userId, type: 'DeactiveTenant' });
				})
				res.status(httpStatus.OK).json({ users: tenantsArr });
				break;
			case "5":
				const vendors = await Vendor.findAll({ where: { isActive: false }, attributes: ['vendorId', 'firstName', 'lastName'] });
				vendors.map(vendor => {
					let firstName = decrypt1(key, vendor.firstName);
					let lastName = decrypt1(key, vendor.lastName);
					let fullName = firstName + " " + lastName;
					vendorsArr['fullName'] = fullName;
					vendorsArr.push({ fullName: fullName, userId: vendor.vendorId, type: 'DeactiveVendor' });
				})
				res.status(httpStatus.OK).json({ users: vendorsArr });
				break;
			case "6":
				const employees = await Employee.findAll({ where: { isActive: false }, attributes: ['employeeId', 'firstName', 'lastName', 'middleName'] });
				employees.map(employee => {
					let firstName = decrypt(employee.firstName);
					let middleName = decrypt(employee.middleName);
					let lastName = decrypt(employee.lastName);
					let fullName = firstName + " " + middleName + " " + lastName
					employeesArr['fullName'] = fullName;
					employeesArr.push({ fullName: fullName, userId: employee.employeeId, type: 'DeactiveEmployee' });
				})
				res.status(httpStatus.OK).json({ users: employeesArr });
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No Role Found with this Id" })
		}


		// const user = await User.findAll({
		// 	where:{isActive:true},
		//     attributes: ['userId', 'userName'],
		//      include: [{
		// 		raw:true,
		//         model: Role,
		//         where: { id:roleId },
		//         attributes: ['id', 'roleName'],
		//     },
		//     ]
		// });
		// console.log("user==>",user);
		// res.send(user)
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.rolesToAssign = async (req, res, next) => {
	try {
		const role = await Role.findAll({
			where: {
				id: {
					[Op.in]: [1, 2]
				},
			},
		});
		if (role) {
			return res.status(httpStatus.OK).json(role);
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.activateUsers = async (req, res, next) => {
	try {
		console.log(req.body);
		const userRoleIds = [];
		const userIds = [];
		const userId = req.body.userId;
		const type = req.body.type;
		const update = { isActive: true };
		switch (type) {
			case "DeactiveTenant":
				const tenant = await Tenant.findOne({ where: { tenantId: userId, isActive: false } });
				if (tenant) {
					await Tenant.update(update, { where: { tenant: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: false } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
						const userRoles = await UserRoles.findAll({ where: { isActive: false, userId: userId } });
						userRoles.map(users => { userRoleIds.push(users.userRoleId) });
						await UserRoles.update(update, { where: { userRoleId: { [Op.in]: userRoleIds } } });
						await UserRfid.update(update, { where: { userId: userId } });
						await TenantFlatDetail.update(update, { where: { tenantId: userId } });
					}
					const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: false, tenantId: userId } });
					tenantMember.map(members => { userIds.push(members.memberId) });
					if (tenantMember.length > 0) {
						await TenantMembersDetail.update(update, { where: { memberId: { [Op.in]: userIds } } });
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
						await UserRoles.update(update, { where: { userId: { [Op.in]: userIds } } });
					}
					res.status(httpStatus.OK).json({ message: "Owner activated successfully" });
				}
				break;
			case "DeactiveOwner":
				const owner = await Owner.findOne({ where: { ownerId: userId, isActive: false } });
				console.log(owner)
				if (owner && owner != null) {
					console.log("inside owner");
					await Owner.update(update, { where: { ownerId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: false } });
					console.log("**********************************************************1")
					if (user) {
						await User.update(update, { where: { userId: userId } });
						console.log("**********************************************************2")
						const userRoles = await UserRoles.findAll({ where: { isActive: false, userId: userId } });
						userRoles.map(users => {
							console.log("inside user role if", users)
							userRoleIds.push(users.userRoleId)
						});
						console.log("userRole ", userRoleIds);
						console.log("**********************************************************3")
						const roleid = await UserRoles.update(update, { where: { userRoleId: { [Op.in]: userRoleIds } } });
						console.log("********role updated**************************************************4", roleid)
						await UserRfid.update(update, { where: { userId: userId } });
						console.log("**********************************************************5")
						await OwnerFlatDetail.update(update, { where: { ownerId: userId } });
					}
					const ownerMember = await OwnerMembersDetail.findAll({ where: { isActive: false, ownerId: userId } });
					ownerMember.map(members => { userIds.push(members.memberId) });
					if (ownerMember.length > 0) {
						await OwnerMembersDetail.update(update, { where: { memberId: { [Op.in]: userIds } } });
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
						await UserRoles.update(update, { where: { userId: { [Op.in]: userIds } } });
					}
					res.status(httpStatus.OK).json({ message: "Owner activated successfully" });
				}
				break;
			case "DeactiveVendor":
				const vendor = await Vendor.findOne({ where: { vendorId: userId, isActive: false } });
				if (vendor) {
					await Vendor.update(update, { where: { vendorId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: false } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
					}
					const userRole = await UserRoles.findOne({ where: { isActive: false, userId: userId } });
					if (userRole) {
						await UserRoles.update(update, { where: { userId: userId } });
					}
					res.status(httpStatus.OK).json({ message: "Vendor activated successfully" });
				}
				break;
			case "DeactiveEmployee":
				const employee = await Employee.findOne({ where: { employeeId: userId, isActive: false } });
				if (employee) {
					await Employee.update(update, { where: { employeeId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: false } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
					}
					const userRole = await UserRoles.findOne({ where: { isActive: false, userId: userId } });
					if (userRole) {
						await UserRoles.update(update, { where: { userId: userId } });
					}
					res.status(httpStatus.OK).json({ message: "Employee activated successfully" });
				}
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'No user found with this userId' });
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.deactivateUsers = async (req, res, next) => {
	try {
		console.log(req.body);
		const userIds = [];
		const userRoleIds = [];
		const ownerFlats = [];
		const tenantIds = [];
		const userId = req.body.userId;
		console.log(userId)
		const type = req.body.type;
		const update = { isActive: false };
		switch (type) {
			case "ActiveOwner":
				const owner = await Owner.findOne({ where: { ownerId: userId, isActive: true } });
				console.log(owner)
				if (owner && owner != null) {
					await Owner.update(update, { where: { ownerId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: true } });
					if (user && user != null) {
						await User.update(update, { where: { userId: userId } });
						const userRoles = await UserRoles.findAll({ where: { isActive: true, userId: userId } });
						userRoles.map(users => { userRoleIds.push(users.userRoleId) });
						if (UserRoles && userRoles != null) {
							await UserRoles.update(update, { where: { userRoleId: { [Op.in]: userRoleIds } } });
						}
						await UserRfid.update(update, { where: { userId: userId } });
						// const ownerFlatDetail = await OwnerFlatDetail.findAll({ where: { isActive: true, ownerId: userId } })
						// if (ownerFlatDetail) {
						// 	await OwnerFlatDetail.update(update, { where: { ownerId: userId } });

						// 	// ownerFlatDetail.map(flats => ownerFlats.push(flats.flatDetail));
						// 	// console.log("owner flats -->", ownerFlats);
						// 	// const tenantFlatDetail = await TenantFlatDetail.findAll({ where: { isActive: true, flatDetailId: { [Op.in]: ownerFlats } } });
						// 	// tenantFlatDetail.map(tenant => tenantIds.push(tenant.tenantId));
						// 	// await Tenant.update(update, { where: { tenantId: { [Op.in]: tenantIds } } });
						// }
						await OwnerFlatDetail.findAll({
							where: {
								ownerId: userId,
								isActive: true
							}
						}).then(entries => {
							return entries.forEach(async function (entry) {
								// Deactivate Tenant Here
								let tenants = await TenantFlatDetail.findAll({
									where: {
										isActive: true,
										flatDetailId: entry.flatDetailId
									}
								});
								if (tenants) {
									// tenants.forEach(tenant => tenant.updateAttributes(update))
									tenants.forEach(async tenant => {
										let tenantToDeactivate = await Tenant.findOne({ where: { isActive: true, tenantId: tenant.tenantId } });
										let user1 = await User.findOne({ where: { isActive: true, userId: tenant.tenantId } });
										let rfId = await UserRfId.findOne({ where: { isActive: true, userId: tenant.tenantId } });
										let role = await UserRoles.findOne({ where: { isActive: true, userId: tenant.tenantId } });
										let tenantMembers = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: tenant.tenantId } });
										tenantMembers.forEach(async tenantMember => {
											let userMember = await User.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
											let memberRfId = await UserRfId.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
											let memberRole = await UserRoles.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
											if (userMember) {
												userMember.updateAttributes({ isActive: false });
											}
											if (memberRfId) {
												memberRfId.updateAttributes({ isActive: false });
											}
											if (memberRole) {
												memberRole.updateAttributes({ isActive: false });
											}
											tenantMember.updateAttributes({ isActive: false });
										})
										if (tenantToDeactivate) {
											tenantToDeactivate.updateAttributes({ isActive: false });
										}
										if (user1) {
											user1.updateAttributes({ isActive: false });
										}
										if (rfId) {
											rfId.updateAttributes({ isActive: false });
										}
										if (role) {
											role.updateAttributes({ isActive: false });
										}
										if (tenant) {
											tenant.updateAttributes({ isActive: false });
										}
									}
									)
								}
								return entry.updateAttributes(update);
							})
						});
					}
					const ownerMember = await OwnerMembersDetail.findAll({ where: { isActive: true, ownerId: userId } });
					ownerMember.map(members => { userIds.push(members.memberId) });
					console.log(userIds);
					if (ownerMember.length > 0) {
						const member = await OwnerMembersDetail.update(update, { where: { memberId: { [Op.in]: userIds } } });
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
						await UserRoles.update(update, { where: { userId: { [Op.in]: userIds } } });
					}

					const tenant = await Tenant.findOne({ where: { ownerId: userId, isActive: true } });
					if (tenant) {
						await Tenant.update(update, { where: { ownerId: userId } });
						const user = await User.findOne({ where: { userId: userId, isActive: true } });
						if (user) {
							await User.update(update, { where: { userId: userId } });
							const userRoles = await User.findAll({ where: { isActive: true, userId: userId } });
							userRoles.map(users => { userRoleIds.push(users.userRoleId) });
							await UserRoles.update(update, { where: { userRoleId: { [Op.in]: userRoleIds } } });
							await UserRfid.update(update, { where: { userId: userId } });
							await TenantFlatDetail.update(update, { where: { tenantId: userId } });
						}
						const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: userId } });
						tenantMember.map(members => { userIds.push(members.memberId) });
						if (tenantMember.length > 0) {
							await TenantMembersDetail.update(update, { where: { tenantId: { [Op.in]: userIds } } });
							await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
							await UserRoles.update(update, { where: { userId: { [Op.in]: userIds } } });
						}
					}
					res.status(httpStatus.OK).json({ message: "Owner deactivated successfully" });
				}
				break;
			case "ActiveTenant":
				const tenant = await Tenant.findOne({ where: { tenantId: userId, isActive: true } });
				if (tenant) {
					await Tenant.update(update, { where: { tenantId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: true } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
						const userRoles = await User.findAll({ where: { isActive: true, userId: userId } });
						userRoles.map(users => { userRoleIds.push(users.userRoleId) });
						await UserRoles.update(update, { where: { userRoleId: { [Op.in]: userRoleIds } } });
						await UserRfid.update(update, { where: { userId: userId } });
						await TenantFlatDetail.update(update, { where: { tenantId: userId } });
					}
					const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: userId } });
					tenantMember.map(members => { userIds.push(members.memberId) });
					if (tenantMember.length > 0) {
						await TenantMembersDetail.update(update, { where: { tenantId: { [Op.in]: userIds } } });
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
						await UserRoles.update(update, { where: { userId: { [Op.in]: userIds } } });
					}
					res.status(httpStatus.OK).json({ message: "Owner deactivated successfully" });
				}
				break;
			case "ActiveVendor":
				const vendor = await Vendor.findOne({ where: { vendorId: userId, isActive: true } });
				if (vendor) {
					await Vendor.update(update, { where: { vendorId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: true } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
					}
					const userRole = await UserRoles.findOne({ where: { isActive: true, userId: userId } });
					if (userRole) {
						await UserRoles.update(update, { where: { userId: userId } });
					}
					res.status(httpStatus.OK).json({ message: "Vendor deactivated successfully" });
				}
				break;
			case "ActiveEmployee":
				const employee = await Employee.findOne({ where: { employeeId: userId, isActive: true } });
				await UserRoles.findOne({ where: { isActive: true, userId: userId } });
				if (employee) {
					await Employee.update(update, { where: { employeeId: userId } });
					const user = await User.findOne({ where: { userId: userId, isActive: true } });
					if (user) {
						await User.update(update, { where: { userId: userId } });
					}
					const userRole = await UserRoles.findOne({ where: { isActive: true, userId: userId } });
					if (userRole) {
						await UserRoles.update(update, { where: { userId: userId } });
					}
					res.status(httpStatus.OK).json({ message: "Employee deactivated successfully" });
				}
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'No user found with this userId' });

		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.multipleDeactivateUsers = async (req, res, next) => {
	try {
		const selectedIds = req.body.ids;
		console.log(selectedIds);
		const type = req.body.type;
		console.log(type);
		const update = { isActive: false }
		switch (type) {
			case "ActiveTenant":
				const updatedTenant = await Tenant.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } });
				const users = await Tenant.findAll({ where: { tenantId: { [Op.in]: deleteSelected } }, attributes: ['userName'] });
				users.map(item => {
					userNames.push(item.userName);
				})
				const userIds = await User.findAll({ where: { userName: { [Op.in]: userNames } } });
				if (updatedTenant) {
					User.update({ isActive: false }, { where: { userName: { [Op.in]: userNames } } });
					UserRoles.update({ isActive: false }, { where: { userId: { [Op.in]: userIds }, roleId: 4 } });
					UserRFID.update({ isActive: false }, { where: { userId: { [Op.in]: deleteSelected } } });
					TenantFlatDetail.update({ isActive: false }, { where: { tenantId: { [Op.in]: deleteSelected } } });
					TenantMembersDetail.findAll({
						where: {
							tenantId: { [Op.in]: deleteSelected }
						}
					})
						.then(tenantMembers => {
							tenantMembers.map(item => {
								item.updateAttributes({ isActive: false });
								User.update({ isActive: false }, { where: { userId: item.memberId } });
								UserRoles.update({ isActive: false }, { where: { userId: item.memberId, roleId: 4 } });
								UserRFID.update({ isActive: false }, { where: { userId: item.memberId } });
							})
						})
				}
				break;
			case "ActiveOwner":
				const updatedOwners = await Owner.update(update, {
					where: {
						ownerId: {
							[Op.in]: selectedIds
						}
					}
				});
				let usersToUpdate = await Owner.findAll({
					where: {
						ownerId: {
							[Op.in]: selectedIds
						}
					}
				});
				// const updatedUsers = await User.findAll()
				if (usersToUpdate.length > 0) {
					usersToUpdate.forEach(async (updatedOwner) => {
						console.log("updatedOwnerEmail", updatedOwner.email)
						let user = await User.findOne({
							where: {
								isActive: true,
								userId: updatedOwner.ownerId
							}
						});
						let urfId = await UserRfId.findOne({
							where: {
								isActive: true,
								userId: updatedOwner.ownerId
							}
						});
						console.log("user_rf_id ====>", urfId)
						urfId.updateAttributes(update);
						let role = await UserRoles.findOne({
							where: {
								userId: user.userId
							}
						});
						role.updateAttributes(update);
						return user.updateAttributes(update);
					});
				}

				// const updatedUsers = updatedOwners.forEach(async (owner) => {
				//   await User.update(update,{where:{email:owner.email}})
				// })

				const updatedOwnersMembers = await OwnerMembersDetail.findAll({
					where: {
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});

				updatedOwnersMembers.forEach(async member => {
					let memberUser = await User.findOne({
						where: {
							isActive: true,
							userId: member.memberId
						}
					});
					let role = await UserRoles.findOne({
						where: {
							userId: member.memberId
						}
					});
					let urfId = await UserRfId.findOne({
						where: {
							isActive: true,
							userId: member.memberId
						}
					});
					console.log("user_rf_id ====>", urfId);
					if (urfId) {
						urfId.updateAttributes(update);
					}
					if (role) {
						role.updateAttributes(update);
					}
					if (memberUser) {
						memberUser.updateAttributes(update);
					}
					member.updateAttributes(update);
				})



				let flats = await OwnerFlatDetail.findAll({
					where: {
						isActive: true,
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});
				if (flats.length > 0) {
					flats.forEach(async flat => {
						let tenants = await TenantFlatDetail.findAll({ where: { isActive: true, flatDetailId: flat.flatDetailId } });
						if (tenants) {
							tenants.forEach(async tenant => {

								let tenantToDeactivate = await Tenant.findOne({ where: { isActive: true, tenantId: tenant.tenantId } });
								let user1 = await User.findOne({ where: { isActive: true, userId: tenant.tenantId } });
								let rfId = await UserRfId.findOne({ where: { isActive: true, userId: tenant.tenantId } });
								let role = await UserRoles.findOne({ where: { isActive: true, userId: tenant.tenantId } });
								let tenantMembers = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: tenant.tenantId } });
								tenantMembers.forEach(async tenantMember => {
									let userMember = await User.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
									let memberRfId = await UserRfId.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
									let memberRole = await UserRoles.findOne({ where: { isActive: true, userId: tenantMember.memberId } });
									if (userMember) {
										userMember.updateAttributes(update);
									}
									if (memberRfId) {
										memberRfId.updateAttributes(update);
									}
									if (memberRole) {
										memberRole.updateAttributes(update);
									}
									tenantMember.updateAttributes(update);
								})
								if (tenantToDeactivate) {
									tenantToDeactivate.updateAttributes(update);
								}
								if (user1) {
									user1.updateAttributes(update);
								}
								if (rfId) {
									rfId.updateAttributes(update);
								}
								if (role) {
									role.updateAttributes(update);
								}
								if (tenant) {
									tenant.updateAttributes(update);
								}

							})
						}
					})
				}

				let flatDetails = await OwnerFlatDetail.update(update, {
					where: {
						isActive: true,
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});

				if (updatedOwners && updatedOwnersMembers && flatDetails) {
					return res.status(httpStatus.OK).json({
						message: "Owners deactivated successfully",
					});
				};
				break;
			case "ActiveVendor":
				const updatedVendor = await Vendor.update(update, { where: { vendorId: { [Op.in]: selectedIds } } });
				const updatedUser = await User.update(update, { where: { userId: { [Op.in]: selectedIds } } })
				if (updatedVendor && updatedUser) {
					res.status(httpStatus.OK).json({ message: "Vendors deactivated successfully" });
				}
				break;
			case "ActiveEmployee":
				const updatedEmployee = await Employee.update(update, { where: { employeeId: { [Op.in]: selectedIds } } });
				const updated = await User.update(update, { where: { userId: { [Op.in]: selectedIds } } })
				if (updatedEmployee && updated) {
					res.status(httpStatus.OK).json({ message: "Employees deactivated successfully" });
				}
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'No user found with this userId' });
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}


exports.multipleActivateUsers = async (req, res, next) => {
	try {
		const selectedIds = req.body.ids;
		console.log(selectedIds);
		const type = req.body.type;
		console.log(type);
		const update = { isActive: true }
		switch (type) {
			case "DeactiveTenant":
				const updatedTenant = await Tenant.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } });
				const users = await Tenant.findAll({ where: { tenantId: { [Op.in]: deleteSelected } }, attributes: ['userName'] });
				users.map(item => {
					userNames.push(item.userName);
				})
				const userIds = await User.findAll({ where: { userName: { [Op.in]: userNames } } });
				if (updatedTenant) {
					User.update(update, { where: { userName: { [Op.in]: userNames } } });
					UserRoles.update(update, { where: { userId: { [Op.in]: userIds }, roleId: 4 } });
					UserRFID.update(update, { where: { userId: { [Op.in]: deleteSelected } } });
					TenantFlatDetail.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } });
					TenantMembersDetail.findAll({
						where: {
							tenantId: { [Op.in]: deleteSelected }
						}
					})
						.then(tenantMembers => {
							tenantMembers.map(item => {
								item.updateAttributes(update);
								User.update(update, { where: { userId: item.memberId } });
								UserRoles.update(update, { where: { userId: item.memberId, roleId: 4 } });
								UserRFID.update(update, { where: { userId: item.memberId } });
							})
						})
				}
				break;
			case "DeactiveOwner":
				const updatedOwners = await Owner.update(update, {
					where: {
						ownerId: {
							[Op.in]: selectedIds
						}
					}
				});
				let usersToUpdate = await Owner.findAll({
					where: {
						ownerId: {
							[Op.in]: selectedIds
						}
					}
				});
				// const updatedUsers = await User.findAll()
				if (usersToUpdate.length > 0) {
					usersToUpdate.forEach(async (updatedOwner) => {
						console.log("updatedOwnerEmail", updatedOwner.email)
						let user = await User.findOne({
							where: {
								isActive: false,
								userId: updatedOwner.ownerId
							}
						});
						let urfId = await UserRfId.findOne({
							where: {
								isActive: false,
								userId: updatedOwner.ownerId
							}
						});
						console.log("user_rf_id ====>", urfId)
						urfId.updateAttributes(update);
						let role = await UserRoles.findOne({
							where: {
								userId: user.userId
							}
						});
						role.updateAttributes(update);
						return user.updateAttributes(update);
					});
				}

				// const updatedUsers = updatedOwners.forEach(async (owner) => {
				//   await User.update(update,{where:{email:owner.email}})
				// })

				const updatedOwnersMembers = await OwnerMembersDetail.findAll({
					where: {
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});

				updatedOwnersMembers.forEach(async member => {
					let memberUser = await User.findOne({
						where: {
							isActive: false,
							userId: member.memberId
						}
					});
					let role = await UserRoles.findOne({
						where: {
							userId: member.memberId
						}
					});
					let urfId = await UserRfId.findOne({
						where: {
							isActive: false,
							userId: member.memberId
						}
					});
					console.log("user_rf_id ====>", urfId);
					if (urfId) {
						urfId.updateAttributes(update);
					}
					if (role) {
						role.updateAttributes(update);
					}
					if (memberUser) {
						memberUser.updateAttributes(update);
					}
					member.updateAttributes(update);
				})



				let flats = await OwnerFlatDetail.findAll({
					where: {
						isActive: false,
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});
				if (flats.length > 0) {
					flats.forEach(async flat => {
						let tenants = await TenantFlatDetail.findAll({ where: { isActive: false, flatDetailId: flat.flatDetailId } });
						if (tenants) {
							tenants.forEach(async tenant => {

								let tenantToDeactivate = await Tenant.findOne({ where: { isActive: false, tenantId: tenant.tenantId } });
								let user1 = await User.findOne({ where: { isActive: false, userId: tenant.tenantId } });
								let rfId = await UserRfId.findOne({ where: { isActive: false, userId: tenant.tenantId } });
								let role = await UserRoles.findOne({ where: { isActive: false, userId: tenant.tenantId } });
								let tenantMembers = await TenantMembersDetail.findAll({ where: { isActive: false, tenantId: tenant.tenantId } });
								tenantMembers.forEach(async tenantMember => {
									let userMember = await User.findOne({ where: { isActive: false, userId: tenantMember.memberId } });
									let memberRfId = await UserRfId.findOne({ where: { isActive: false, userId: tenantMember.memberId } });
									let memberRole = await UserRoles.findOne({ where: { isActive: false, userId: tenantMember.memberId } });
									if (userMember) {
										userMember.updateAttributes(update);
									}
									if (memberRfId) {
										memberRfId.updateAttributes(update);
									}
									if (memberRole) {
										memberRole.updateAttributes(update);
									}
									tenantMember.updateAttributes(update);
								})
								if (tenantToDeactivate) {
									tenantToDeactivate.updateAttributes(update);
								}
								if (user1) {
									user1.updateAttributes(update);
								}
								if (rfId) {
									rfId.updateAttributes(update);
								}
								if (role) {
									role.updateAttributes(update);
								}
								if (tenant) {
									tenant.updateAttributes(update);
								}

							})
						}
					})
				}

				let flatDetails = await OwnerFlatDetail.update(update, {
					where: {
						isActive: false,
						ownerId: {
							[Op.in]: deleteSelected
						}
					}
				});

				if (updatedOwners && updatedOwnersMembers && flatDetails) {
					return res.status(httpStatus.OK).json({
						message: "Owners activated successfully",
					});
				};
				break;
			case "DeactiveVendor":
				const updatedVendor = await Vendor.update(update, { where: { vendorId: { [Op.in]: selectedIds } } });
				const updatedUser = await User.update(update, { where: { userId: { [Op.in]: selectedIds } } })
				if (updatedVendor && updatedUser) {
					res.status(httpStatus.OK).json({ message: "Vendors activated successfully" });
				}
				break;
			case "DeactiveEmployee":
				const updatedEmployee = await Employee.update(update, { where: { employeeId: { [Op.in]: selectedIds } } });
				const updated = await User.update(update, { where: { userId: { [Op.in]: selectedIds } } })
				if (updatedEmployee && updated) {
					res.status(httpStatus.OK).json({ message: "Employees activated successfully" });
				}
				break;
			default:
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'No user found with this userId' });
		}
	} catch (error) {
		console.log(error);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Sequelize Error' })
	}
}

exports.flatByUserId = (req, res, next) => {
	userId = req.userId;
	const flatIds = [];
	// User.findOne({where:{isActive:true,userId:userId},include:[{model:Role}]})
	User.findOne({
		where: {
			[Op.and]: [{
				userId: userId
			},
			{
				isActive: true
			}]
		},
		include: [{
			model: Role,
		}]
	}).then(user => {
		if (user !== null) {
			// console.log(bcrypt.compareSync('dbEgbGGuqc', user.password));
			// console.log("user==>", user)
			// res.json(user);
			if (user.roles[0].id === 4) {
				Tenant.findOne({
					where: {
						isActive: true,
						userName: user.userName
					}
				})
					.then(tenant => {
						if (tenant !== null) {
							TenantFlatDetail.findAll({
								where: {
									isActive: true,
									tenantId: tenant.tenantId
								}
							})
								.then(flats => {
									if (flats.length !== 0) {
										flatIds.splice(0, flatIds.length);
										flats.map(item => {
											flatIds.push(item.flatDetailId);
										})
										FlatDetail.findAll({
											where: {
												isActive: true,
												flatDetailId: {
													[Op.in]: flatIds
												}
											},
											include: [
												{ model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
												{ model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
											]
										})
											.then(flats => {
												if (flats.length !== 0) {
													res.status(httpStatus.OK).json({
														message: 'Flats Found',
														flats: flats
													})
												} else {
													res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
														message: 'No Flats Found',
														flats: flats
													})
												}
											})
									} else {
										res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
											message: 'No Flats Found',
											flats: flats
										})
									}
								})
						} else {
							res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
								message: 'No Flats Found',
								flats: []
							})
						}
					})
			} else {
				Owner.findOne({
					where: {
						isActive: true,
						userName: user.userName
					}
				})
					.then(owner => {
						if (owner !== null) {
							OwnerFlatDetail.findAll({
								where: {
									isActive: true,
									ownerId: owner.ownerId
								}
							})
								.then(flats => {
									if (flats.length !== 0) {
										flatIds.splice(0, flatIds.length);
										flats.map(item => {
											flatIds.push(item.flatDetailId);
										})
										FlatDetail.findAll({
											where: {
												isActive: true,
												flatDetailId: {
													[Op.in]: flatIds
												}
											},
											include: [
												{ model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
												{ model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
											]
										})
											.then(flats => {
												if (flats.length !== 0) {
													res.status(httpStatus.OK).json({
														message: 'Flats Found',
														flats: flats
													})
												} else {
													res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
														message: 'No Flats Found',
														flats: flats
													})
												}
											})
									} else {
										res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
											message: 'No Flats Found',
											flats: flats
										})
									}
								})
						} else {
							res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
								message: 'No Flats Found',
								flats: []
							})
						}
					})
			}

		} else {
			res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
				message: 'User Not Found'
			})
		}
	})
		.catch(err => {
			console.log(err);
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

exports.activeUsersCount = async (req, res, next) => {
	try {
		const activeUsers = await User.findAndCountAll({ where: { isActive: true } });
		const deactiveUsers = await User.findAndCountAll({ where: { isActive: false } });
		const activeTenant = await Tenant.findAndCountAll({ where: { isActive: true } });
		const deactiveTenant = await Tenant.findAndCountAll({ where: { isActive: false } });
		const activeVendor = await Vendor.findAndCountAll({ where: { isActive: true } });
		const deactiveVendor = await Vendor.findAndCountAll({ where: { isActive: false } });
		const activeEmployee = await Employee.findAndCountAll({ where: { isActive: true } });
		const deactiveEmployee = await Employee.findAndCountAll({ where: { isActive: false } });
		const activeOwner = await Owner.findAndCountAll({ where: { isActive: true } });
		const deactiveOwner = await Owner.findAndCountAll({ where: { isActive: false } });
		if (activeUsers && deactiveUsers && activeTenant && deactiveTenant && activeVendor && deactiveVendor && activeEmployee && deactiveEmployee && activeOwner && deactiveOwner) {
			res.status(httpStatus.OK).json({
				totalActiveTenant: activeTenant.count,
				totalDeactiveTenant: deactiveTenant.count, totalActiveVendor: activeVendor.count,
				totalDeactiveVendor: deactiveVendor.count, totalActiveEmployee: activeEmployee.count, totalDeactiveEmployee: deactiveEmployee.count,
				totalActiveOwner: activeOwner.count, totalDeactiveOwner: deactiveOwner.count
			})
		}
	} catch (error) {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
	}
}

exports.checkEmail = (req, res, next) => {
	const body = req.body;
	console.log('Body ===>', body);

	User.findOne({
		where: {
			isActive: true,
			email: encrypt(body.email)
		}
	})
		.then(user => {
			if (user !== null) {
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
					message: 'Email in use for another user'
				})
			} else {
				res.status(httpStatus.OK).json({
					message: 'Email can be used'
				})
			}
		})
		.catch(err => {
			console.log('Error ===>', err);
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

exports.checkContact = (req, res, next) => {
	const body = req.body;
	console.log('Body ===>', body);

	User.findOne({
		where: {
			isActive: true,
			contact: encrypt(body.contact)
		}
	})
		.then(user => {
			if (user !== null) {
				res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
					message: 'Contact in use for another user'
				})
			} else {
				res.status(httpStatus.OK).json({
					message: 'Contact can be used'
				})
			}
		})
		.catch(err => {
			console.log('Error ===>', err);
			res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
		})
}

exports.releaseUsersResources = async (req, res, next) => {
	try {
		const userId = req.body.userId;
		console.log(userId)
		const type = req.body.type;
		const update = { isActive: false };
		switch (type) {
			case "ActiveOwner":
				const owner = await Owner.findOne({ where: { ownerId: userId, isActive: false } });
				console.log(owner)
				if (owner && owner != null) {
					await Owner.update(update, { where: { ownerId: userId } });
					await UserRfid.update(update, { where: { userId: userId } });
					await OwnerFlatDetail.findAll({
						where: {
							ownerId: userId,
							isActive: true
						}
					}).then(entries => {
						return entries.forEach(async function (entry) {
							// Deactivate Tenant Here
							let tenants = await TenantFlatDetail.findAll({
								where: {
									isActive: true,
									flatDetailId: entry.flatDetailId
								}
							});
							if (tenants) {
								tenants.forEach(async tenant => {
									let tenantToDeactivate = await Tenant.findOne({ where: { isActive: false, tenantId: tenant.tenantId } });
									let rfId = await UserRfId.findOne({ where: { isActive: true, userId: tenant.tenantId } });

									let tenantMembers = await TenantMembersDetail.findAll({ where: { isActive: false, tenantId: tenant.tenantId } });
									tenantMembers.forEach(async tenantMember => {

										let memberRfId = await UserRfId.findOne({ where: { isActive: true, userId: tenantMember.memberId } });

										if (memberRfId) {
											memberRfId.updateAttributes({ isActive: false });
										}

										tenantMember.updateAttributes({ isActive: false });
									})
									if (tenantToDeactivate) {
										tenantToDeactivate.updateAttributes({ isActive: false });
									}

									if (rfId) {
										rfId.updateAttributes({ isActive: false });
									}

									if (tenant) {
										tenant.updateAttributes({ isActive: false });
									}
								}
								)
							}
							return entry.updateAttributes(update);
						})
					});
					// }
					const ownerMember = await OwnerMembersDetail.findAll({ where: { isActive: false, ownerId: userId } });
					ownerMember.map(members => { userIds.push(members.memberId) });
					console.log(userIds);
					if (ownerMember.length > 0) {
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
					}

					const tenant = await Tenant.findOne({ where: { ownerId: userId, isActive: false } });
					if (tenant) {
						await Tenant.update(update, { where: { ownerId: userId } });
						await UserRfid.update(update, { where: { userId: userId } });

						const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: userId } });
						tenantMember.map(members => { userIds.push(members.memberId) });
						if (tenantMember.length > 0) {
							await TenantMembersDetail.update(update, { where: { tenantId: { [Op.in]: userIds } } });
							await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
						}
					}
					res.status(httpStatus.OK).json({ message: "Owner flats released successfully", owner, tenant });
				}
				break;
			case "ActiveTenant":
				const tenant = await Tenant.findOne({ where: { tenantId: userId, isActive: false } });
				if (tenant) {
					await Tenant.update(update, { where: { tenantId: userId } });
					await UserRfid.update(update, { where: { userId: userId } });
					await TenantFlatDetail.update(update, { where: { tenantId: userId } });

					const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: userId } });
					tenantMember.map(members => { userIds.push(members.memberId) });
					if (tenantMember.length > 0) {
						await TenantMembersDetail.update(update, { where: { tenantId: { [Op.in]: userIds } } });
						await UserRfid.update(update, { where: { userId: { [Op.in]: userIds } } });
					}
					res.status(httpStatus.OK).json({ message: "Tenant flats released successfully", owner, tenant });
				}
				break;

		}
	} catch (error) {
		console.log('Error ===>', error);
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
	}
}

// let date = new Date(Date.now());
// let startTime = date.setHours(15);
// let endTime = date.setHours(18);
// rule.minute = new schedule.Range(0, 59, 1);
// var j = schedule.scheduleJob({ start: startTime, end: endTime, rule}, function () {
// 	// console.log('Time for tea!');
// })
// function getAge(DOB) {
//     var today = new Date();
//     var birthDate = new Date(DOB);
//     var age = today.getFullYear() - birthDate.getFullYear();
//     var m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//         age = age - 1;
//     }

//     return age;
// }

// alert(getAge("8-17-1981"));

exports.ageWiseCount = async (req, res, next) => {
	try {
		let children = [];
		let adult = [];


	} catch (error) {
		console.log('Error ===>', error);
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
	}
}

