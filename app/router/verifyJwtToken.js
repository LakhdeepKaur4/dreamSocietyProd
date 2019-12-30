const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const db = require('../config/db.config.js');
const Role = db.role;
const User = db.user;
const UserRole = db.userRole;
const Op = db.Sequelize.Op;
const httpStatus = require('http-status');

verifyToken = (req, res, next) => {
	let token = req.headers['x-access-token'];
	if (!token) {
		return res.status(httpStatus.FORBIDDEN).json({
			auth: false,
			message: 'No token provided.'
		});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
				auth: false,
				message: 'Fail to Authentication. Error -> ' + err
			});
		}
		req.userId = decoded.id;
		next();
	});
}

isAdmin = (req, res, next) => {
	let token = req.headers['x-access-token'];

	User.findById(req.userId)
		.then(user => {
			user.getRoles().then(roles => {
				for (let i = 0; i < roles.length; i++) {
					// console.log(roles[i].name);
					if (roles[i].name.toUpperCase() === "ADMIN") {
						next();
						return;
					}
				}

				res.status(403).send("Require Admin Role!");
				return;
			})
		})
}

isAdminRole = async (req, res, next) => {

	let token = req.headers['x-access-token'];
	const user = await User.findOne({ where: { isActive: true, userId: req.userId } });
	if (user) {
		const role = await UserRole.findOne({
			where: {
				isActive: true, userId: req.userId, roleId: {
					[Op.in]: [1, 2]
				}
			}
		});

		if (role) {
			next();
			return
		}
		res.status(httpStatus.FORBIDDEN).json("Require Admin or SuperAdmin Role!");
		return;
	}
}

isSuperAdminRole = async (req, res, next) => {
	let token = req.headers['x-access-token'];

	const user = await User.findOne({ where: { isActive: true, userId: req.userId } });
	if (user) {
		const role = await UserRole.findOne({ where: { isActive: true, userId: req.userId, roleId: 1 } });
		if (role) {
			next();
			return
		}
		res.status(httpStatus.FORBIDDEN).send("Require Super Admin Role!");
		return;
	}
}

isOwnerOrTenantRole = async (req, res, next) => {
	let token = req.headers['x-access-token'];

	const user = await User.findOne({ where: { isActive: true, userId: req.userId } });
	if (user) {
		const role = await UserRole.findOne({
			where: {
				isActive: true, userId: req.userId, roleId: {
					[Op.in]: [3, 4]
				}
			}
		});
		if (role) {
			next();
			return;
		}
		res.status(httpStatus.FORBIDDEN).send("Require Owner or Tenant Roles!");
		return;
	}
}

isOwnerOrTenant = (req, res, next) => {
	let token = req.headers['x-access-token'];
	console.log(req.userId)
	User.findById(req.userId)
		.then(user => {
			console.log("user", user)
			user.getRoles().then(roles => {
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name.toUpperCase() === "SOCIETY_MEMBER_OWNER") {
						next();
						return;
					}

					if (roles[i].name.toUpperCase() === "SOCIETY_MEMBER_TENANT") {
						next();
						return;
					}
				}

				res.status(403).send("Require Owner or Tenant Roles!");
			})
		})
}

isVendorRole = async (req, res, next) => {
	let token = req.headers['x-access-token'];
	const user = await User.findOne({ where: { isActive: true, userId: req.userId } });
	if (user) {
		const role = await UserRole.findOne({ where: { isActive: true, userId: req.userId, roleId: 5 } });
		if (role) {
			next();
			return
		}
		res.status(httpStatus.FORBIDDEN).send("Require Vendor Role!");
		return;
	}
}

const authJwt = {};
authJwt.verifyToken = verifyToken;
authJwt.isAdmin = isAdmin;
authJwt.isAdminRole = isAdminRole;
authJwt.isSuperAdminRole = isSuperAdminRole;
authJwt.isOwnerOrTenant = isOwnerOrTenant;
authJwt.isOwnerOrTenantRole = isOwnerOrTenantRole;
authJwt.isVendorRole = isVendorRole;

module.exports = authJwt;