const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var crypto = require('crypto');

const FingerprintData = db.fingerprintData;
const Owner = db.owner;
const Tenant = db.tenant;
const OwnerMembersDetail = db.ownerMembersDetail;
const TenantMembersDetail = db.tenantMembersDetail;;
const User = db.user;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;


const Role = db.role;
const Op = db.Sequelize.Op;

decrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let decipher = crypto.createDecipher(algorithm, key);
    let decryptedText = decipher.update(text, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}

exports.addFingerPrintData = async (req, res, next) => {
    try {
        const body = req.body;
        const fingerprintData = await FingerprintData.create(body);
        if (fingerprintData) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print successfully added",
                fingerprintData
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getFingerPrintData = async (req, res, next) => {
    try {
        const fingerprint = await FingerprintData.findAll({ where: { isActive: true }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
        if (fingerprint.userId = ! null) {
            fingerprint.map(user => {
                user.user.firstName = decrypt(user.user.firstName);
                user.user.lastName = decrypt(user.user.lastName);
                user.user.userName = decrypt(user.user.userName);
                user.user.contact = decrypt(user.user.contact);
                user.user.email = decrypt(user.user.email);
            })
        }
        if (fingerprint) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprint
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.nullFingerPrintData = async (req, res, next) => {
    try {
        const fingerprintData = await FingerprintData.findAll({ where: { isActive: true, fingerprintData: { [Op.eq]: null } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
        if (fingerprintData.userId = ! null) {
            fingerprintData.map(user => {
                user.user.firstName = decrypt(user.user.firstName);
                user.user.lastName = decrypt(user.user.lastName);
                user.user.userName = decrypt(user.user.userName);
                user.user.contact = decrypt(user.user.contact);
                user.user.email = decrypt(user.user.email);
            })
        }
        if (fingerprintData) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.notNullFingerPrintData = async (req, res, next) => {
    try {
        const fingerprintData = await FingerprintData.findAll({ where: { isActive: true, fingerprintData: { [Op.ne]: null } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
        if (fingerprintData.userId = ! null) {
            fingerprintData.map(user => {
                user.user.firstName = decrypt(user.user.firstName);
                user.user.lastName = decrypt(user.user.lastName);
                user.user.userName = decrypt(user.user.userName);
                user.user.contact = decrypt(user.user.contact);
                user.user.email = decrypt(user.user.email);
            })
        }
        if (fingerprintData) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.nullFilterOnflats = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("ID ***", id)
        let ownerIds = [];
        let ownerMemberIds = [];
        let tenantIds = [];
        let tenantMemberIds = [];

        if (id == 3) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null }
            });
            fingerprintData.map(user => {
                ownerIds.push(user.userId);
            })
            const owner = await Owner.findAll({
                where: { isActive: true, ownerId: { [Op.in]: ownerIds } },
                attributes: ['ownerId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            owner.map(owner => {
                owner.firstName = decrypt(owner.firstName);
                owner.lastName = decrypt(owner.lastName);
                owner.userName = decrypt(owner.userName);
                owner.contact = decrypt(owner.contact);
                owner.email = decrypt(owner.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                owner
            });
        }
        if (id == 4) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null }
            });
            fingerprintData.map(user => {
                tenantIds.push(user.userId);
            })
            const tenant = await Tenant.findAll({
                where: { isActive: true, tenantId: { [Op.in]: tenantIds } },
                attributes: ['tenantId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            tenant.map(tenant => {
                tenant.firstName = decrypt(tenant.firstName);
                tenant.lastName = decrypt(tenant.lastName);
                tenant.userName = decrypt(tenant.userName);
                tenant.contact = decrypt(tenant.contact);
                tenant.email = decrypt(tenant.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                tenant
            });
        }
        if (id == 5) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null }
            });
            fingerprintData.map(user => {
                vendorIds.push(user.userId);
            })
            const ownerMember = await OwnerMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: ownerMemberIds } },
                attributes: ['ownerId', 'memberFirstName', 'memberLastName', 'memberUserName', 'memberContact', 'memberEmail'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            ownerMember.map(ownerMember => {
                ownerMember.memberFirstName = decrypt(ownerMember.memberFirstName);
                ownerMember.memberLastName = decrypt(ownerMember.memberLastName);
                ownerMember.memberUserName = decrypt(ownerMember.memberUserName);
                ownerMember.memberContact = decrypt(ownerMember.memberContact);
                ownerMember.memberEmail = decrypt(ownerMember.memberEmail);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                ownerMember
            });
        }
        if (id == 7) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null }
            });
            fingerprintData.map(user => {
                ownerMemberIds.push(user.userId);
            })
            const ownerMember = await OwnerMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: ownerMemberIds } },
                attributes: ['ownerId', 'memberFirstName', 'memberLastName', 'memberUserName', 'memberContact', 'memberEmail'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            ownerMember.map(ownerMember => {
                ownerMember.memberFirstName = decrypt(ownerMember.memberFirstName);
                ownerMember.memberLastName = decrypt(ownerMember.memberLastName);
                ownerMember.memberUserName = decrypt(ownerMember.memberUserName);
                ownerMember.memberContact = decrypt(ownerMember.memberContact);
                ownerMember.memberEmail = decrypt(ownerMember.memberEmail);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                ownerMember
            });
        }
        if (id == 8) {
            console.log("&&&&#@#@#@#*@#*@#*@#@(#   in 8")
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null }
            });
            fingerprintData.map(user => {
                tenantMemberIds.push(user.userId);
            })
            const tenantMember = await TenantMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: tenantMemberIds } },
                attributes: ['tenantId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            tenantMember.map(tenantMember => {
                tenantMember.firstName = decrypt(tenantMember.firstName);
                tenantMember.lastName = decrypt(tenantMember.lastName);
                tenantMember.userName = decrypt(tenantMember.userName);
                tenantMember.contact = decrypt(tenantMember.contact);
                tenantMember.email = decrypt(tenantMember.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                tenantMember
            });
        }

    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.notNullFilterOnflats = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("ID ***", id)
        let ownerIds = [];
        let ownerMemberIds = [];
        let tenantIds = [];
        let tenantMemberIds = [];
        let vendorIds = [];

        if (id == 3) {
            console.log("inside")
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: { [Op.ne]: null } }
            });
            fingerprintData.map(user => {
                ownerIds.push(user.userId);
            })
            const owner = await Owner.findAll({
                where: { isActive: true, ownerId: { [Op.in]: ownerIds } },
                attributes: ['ownerId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            owner.map(owner => {
                owner.firstName = decrypt(owner.firstName);
                owner.lastName = decrypt(owner.lastName);
                owner.userName = decrypt(owner.userName);
                owner.contact = decrypt(owner.contact);
                owner.email = decrypt(owner.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                owner
            });
        }
        if (id == 4) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: { [Op.ne]: null } }
            });
            fingerprintData.map(user => {
                tenantIds.push(user.userId);
            })
            const tenant = await Tenant.findAll({
                where: { isActive: true, tenantId: { [Op.in]: tenantIds } },
                attributes: ['tenantId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            tenant.map(tenant => {
                tenant.firstName = decrypt(tenant.firstName);
                tenant.lastName = decrypt(tenant.lastName);
                tenant.userName = decrypt(tenant.userName);
                tenant.contact = decrypt(tenant.contact);
                tenant.email = decrypt(tenant.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                tenant
            });
        }
        if (id == 5) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: { [Op.ne]: null } }
            });
            fingerprintData.map(user => {
                vendorIds.push(user.userId);
            })
            const ownerMember = await OwnerMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: ownerMemberIds } },
                attributes: ['ownerId', 'memberFirstName', 'memberLastName', 'memberUserName', 'memberContact', 'memberEmail'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            ownerMember.map(ownerMember => {
                ownerMember.memberFirstName = decrypt(ownerMember.memberFirstName);
                ownerMember.memberLastName = decrypt(ownerMember.memberLastName);
                ownerMember.memberUserName = decrypt(ownerMember.memberUserName);
                ownerMember.memberContact = decrypt(ownerMember.memberContact);
                ownerMember.memberEmail = decrypt(ownerMember.memberEmail);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                ownerMember
            });
        }
        if (id == 7) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: { [Op.ne]: null } }
            });
            fingerprintData.map(user => {
                ownerMemberIds.push(user.userId);
            })
            const ownerMember = await OwnerMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: ownerMemberIds } },
                attributes: ['ownerId', 'memberFirstName', 'memberLastName', 'memberUserName', 'memberContact', 'memberEmail'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            ownerMember.map(ownerMember => {
                ownerMember.memberFirstName = decrypt(ownerMember.memberFirstName);
                ownerMember.memberLastName = decrypt(ownerMember.memberLastName);
                ownerMember.memberUserName = decrypt(ownerMember.memberUserName);
                ownerMember.memberContact = decrypt(ownerMember.memberContact);
                ownerMember.memberEmail = decrypt(ownerMember.memberEmail);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                ownerMember
            });
        }
        if (id == 8) {
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: { [Op.ne]: null } }
            });
            fingerprintData.map(user => {
                tenantMemberIds.push(user.userId);
            })
            const tenantMember = await TenantMembersDetail.findAll({
                where: { isActive: true, memberId: { [Op.in]: tenantMemberIds } },
                attributes: ['tenantId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
                include: [{ model: FlatDetail, include: [Tower, Floor] }]
            });
            // if (fingerprintData.userId = ! null) {
            tenantMember.map(tenantMember => {
                tenantMember.firstName = decrypt(tenantMember.firstName);
                tenantMember.lastName = decrypt(tenantMember.lastName);
                tenantMember.userName = decrypt(tenantMember.userName);
                tenantMember.contact = decrypt(tenantMember.contact);
                tenantMember.email = decrypt(tenantMember.email);
            })
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                tenantMember
            });
        }

    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.test = async (req, res, next) => {
    const id = req.params.id;
    const tenantIds = [];
    const fingerprintData = await FingerprintData.findAll({
        where: { isActive: true, fingerprintData: null }
    });
    fingerprintData.map(user => {
        tenantIds.push(user.userId);
    })
    const tenant = await Tenant.findAll({
        where: { isActive: true, tenantId: { [Op.in]: tenantIds } },
        attributes: ['tenantId', 'firstName', 'lastName', 'userName', 'contact', 'email'],
        include: [{ model: FlatDetail, include: [Tower, Floor] }]
    });
    // if (fingerprintData.userId = ! null) {
    tenant.map(tenant => {
        tenant.firstName = decrypt(tenant.firstName);
        tenant.lastName = decrypt(tenant.lastName);
        tenant.userName = decrypt(tenant.userName);
        tenant.contact = decrypt(tenant.contact);
        tenant.email = decrypt(tenant.email);
    })
    // }

    res.json(tenant);
}
exports.updateFingerPrintData = async (req, res, next) => {
    try {
        const update = req.body;
        const userId = req.params.userId;
        console.log(userId)
        const fingerprintData = await FingerprintData.update(update, { where: { userId: userId } });
        console.log(fingerprintData[0])
        if (fingerprintData[0] != 0) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print successfully added"
            });
        } else {
            return res.status(httpStatus.CREATED).json({
                message: "Please try again.Something went wrong",
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getRoles = async (req, res, next) => {
    try {
        const role = await Role.findAll({
            where: {
                id: {
                    [Op.notIn]: [1, 2]
                }
            },
            attributes: ['id', 'roleName']
        });
        console.log(role)
        if (role) {
            res.status(200).json(role);
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}