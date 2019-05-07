const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var crypto = require('crypto');

const FingerprintData = db.fingerprintData;
const OwnerFlatDetail = db.ownerFlatDetail;
const TenantFlatDetail = db.tenantFlatDetail;
const OwnerMembersDetail = db.ownerMembersDetail;
const TenantMembersDetail = db.ownerMembersDetail;
const User = db.user;


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
        const type = req.params.type;
        console.log(type)
        let ownerIds = [];
        let ownerMemberIds =[];
        let tenantIds = [];
        let tenantMemberIds =[];
     
        if (type == 'owner') {
            const owner = await OwnerFlatDetail.findAll({ where: { isActive: true } });
            owner.map(owner => {
                ownerIds.push(owner.ownerId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null, userId: { [Op.in]: ownerIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'ownerMember') {
            const owner = await OwnerMembersDetail.findAll({ where: { isActive: true } });
            owner.map(owner => {
                ownerMemberIds.push(owner.ownerId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null, userId: { [Op.in]: ownerMemberIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role,
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'tenant') {
            const tenant = await TenantFlatDetail.findAll({ where: { isActive: true } });
            tenant.map(tenant => {
                ownerIds.push(tenant.tenantId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null, userId: { [Op.in]: tenantIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'tenantMember') {
            const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true } });
            tenantMember.map(tenant => {
                tenantMemberIds.push(tenant.tenantId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: null, userId: { [Op.in]: tenantMemberIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
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

exports.notNullFilterOnflats = async (req, res, next) => {
    try {
        const type = req.params.type;
        console.log(type)
        let ownerIds = [];
        let ownerMemberIds =[];
        let tenantIds = [];
        let tenantMemberIds =[];
     
        if (type == 'owner') {
            const owner = await OwnerFlatDetail.findAll({ where: { isActive: true } });
            owner.map(owner => {
                ownerIds.push(owner.ownerId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: {[Op.ne]:null}, userId: { [Op.in]: ownerIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'ownerMember') {
            const owner = await OwnerMembersDetail.findAll({ where: { isActive: true } });
            owner.map(owner => {
                ownerMemberIds.push(owner.ownerId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: {[Op.ne]:null}, userId: { [Op.in]: ownerMemberIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'tenant') {
            const tenant = await TenantFlatDetail.findAll({ where: { isActive: true } });
            tenant.map(tenant => {
                ownerIds.push(tenant.tenantId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true,fingerprintData: {[Op.ne]:null}, userId: { [Op.in]: tenantIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print Content Page",
                fingerprintData
            });
        }
        if (type == 'tenantMember') {
            const tenantMember = await TenantMembersDetail.findAll({ where: { isActive: true } });
            tenantMember.map(tenant => {
                tenantMemberIds.push(tenant.tenantId);
            })
            const fingerprintData = await FingerprintData.findAll({
                where: { isActive: true, fingerprintData: {[Op.ne]:null}, userId: { [Op.in]: tenantMemberIds } },
                include: [{
                    model: User, as: 'user',
                    attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'],
                    include: [{
                        model: Role
                    }]
                }]
            });
            if (fingerprintData.userId = ! null) {
                fingerprintData.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
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