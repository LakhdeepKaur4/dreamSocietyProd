const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const passwordGenerator = require('generate-password');
const shortId = require('short-id');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = db.Sequelize.Op;

const Tenant = db.tenant;
const TenantMembersDetail = db.tenantMembersDetail;
const Owner = db.owner;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;

function saveToDisc(name, fileExt, base64String, callback) {
    console.log("HERE ", name, fileExt);
    let d = new Date();
    let pathFile = "../../public/profilePictures/" + shortId.generate() + name + d.getTime() + Math.floor(Math.random() * 1000) + "." + fileExt;
    let fileName = path.join(__dirname, pathFile);
    let dataBytes = Buffer.from(base64String, 'base64');
    // console.log(base64String);
    fs.writeFile(fileName, dataBytes, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, pathFile);
        }
    });
}

exports.create = async (req, res, next) => {
    try {
        let tenantBody = req.body;
        let memberBody = req.body;
        let memberId = [];
        tenantBody.userId = req.userId;
        let customVendorName = tenantBody.tenantName;
        const userName = customVendorName + 'T' + tenantBody.towerId + tenantBody.flatDetailId;
        tenantBody.userName = userName;
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        tenantBody.password = password;
        const tenant = await Tenant.create(tenantBody);
        const tenantId = tenant.tenantId;
        if (req.body.profilePicture) {
            saveToDisc(tenantBody.fileName, tenantBody.fileExt, tenantBody.profilePicture, (err, resp) => {
                if (err) {
                    console.log(err)
                }
                console.log(resp)
                const updatedImage = {
                    picture: resp
                };
                Tenant.update(updatedImage, { where: { tenantId: tenantId } });
            });
        }
        if (tenantBody.noOfMembers) {
            memberBody.userId = req.userId;
            memberBody.tenantId = tenantId;
            const tenantMember = await TenantMembersDetail.bulkCreate(tenantBody.member, { returning: true },
                {
                    fields: ["memberName", "memberDob", "relationId", "gender"],
                })
            tenantMember.forEach(item => {
                memberId.push(item.memberId)
            });
            const bodyToUpdate = {
                userId: req.userId
            }
            const updatedMember = await TenantMembersDetail.update(bodyToUpdate, { where: { memberId: { [Op.in]: memberId } } });

        }
        return res.status(httpStatus.CREATED).json({
            message: "Tenant successfully created",
            tenant
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const tenant = await Tenant.findAll({
            // where: { isActive: true },
            order: [['createdAt', 'DESC']],
            // include: [{
            //     model: User,
            //     as: 'organiser',
            //     attributes: ['userId', 'userName'],
            // }]
        });
        if (tenant) {
            return res.status(httpStatus.OK).json({
                message: "Tenant Content Page",
                tenant
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedTenant = await Tenant.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } })
        if (updatedTenant) {
            return res.status(httpStatus.OK).json({
                message: "Tenant deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedTenant = await Tenant.find({ where: { tenantId: id } }).then(tenant => {
            return tenant.updateAttributes(update)
        })
        if (updatedTenant) {
            return res.status(httpStatus.OK).json({
                message: "Tenant deleted successfully",
                tenant: updatedTenant
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
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

exports.createEncrypted = (req, res, next) => {
    try {
        console.log('Creating Tenant');

        let tenant = req.body;
        let members = req.body.member;
        const membersArr = [];
        const ownersArr = [];
        let tenantCreated;
        tenant.userId = req.userId;
        let userName = tenant.tenantName + 'T' + tenant.towerId + tenant.flatDetailId;
        tenant.userName = userName;
        index = tenant.fileName.lastIndexOf('.');
        tenant.fileExt = tenant.fileName.slice(index + 1);
        tenant.fileName = tenant.fileName.slice(0, index);
        tenant.profilePicture = tenant.profilePicture.split(',')[1];
        const password = passwordGenerator.generate({
            length: 10,
            numbers: true
        });
        tenant.password = password;
        console.log(tenant);
        Tenant.create({
            tenantName: encrypt(tenant.tenantName),
            userName: encrypt(tenant.userName),
            dob: tenant.dob,
            email: encrypt(tenant.email),
            aadhaarNumber: encrypt(tenant.aadhaarNumber),
            contact: encrypt(tenant.contact),
            password: tenant.password,
            permanentAddress: encrypt(tenant.permanentAddress),
            bankName: encrypt(tenant.bankName),
            accountHolderName: encrypt(tenant.accountHolderName),
            accountNumber: encrypt(tenant.accountNumber),
            gender: encrypt(tenant.gender),
            panCardNumber: encrypt(tenant.panCardNumber),
            IFSCCode: encrypt(tenant.IFSCCode),
            noOfMembers: tenant.noOfMembers,
            // ownerId: tenant.ownerId1,
            // ownerId1: tenant.ownerId1,
            // ownerId2: tenant.ownerId2,
            // ownerId3: tenant.ownerId3,
            userId: tenant.userId,
            societyId: tenant.societyId,
            towerId: tenant.towerId,
            flatDetailId: tenant.flatDetailId
        })
            .then(async entry => {
                console.log('Body ==>', entry);
                tenantCreated = entry;
                if (tenant.profilePicture) {

                    await saveToDisc(tenant.fileName, tenant.fileExt, tenant.profilePicture, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res);
                            const updatedImage = {
                                picture: encrypt(res)
                            };
                            Tenant.update(updatedImage, { where: { tenantId: entry.tenantId } });
                        }
                    })
                }
                if (tenant.noOfMembers !== 0 && tenant.noOfMembers !== null) {
                    members.map(item => {
                        item.memberName = encrypt(item.memberName);
                        item.gender = encrypt(item.gender);
                        item.userId = req.userId;
                        item.tenantId = entry.tenantId;
                        membersArr.push(item);
                    })
                    membersArr.map(item => {
                        TenantMembersDetail.create(item);
                    })
                }

                await Owner.findAll({
                    attributes: ['ownerId'],
                    where: {
                        flatDetailId: tenant.flatDetailId
                    }
                })
                    .then(owners => {
                        owners.map(item => {
                            ownersArr.push(item.ownerId);
                        })
                        return ownersArr;
                    })
                    .then(owners => {
                        if (ownersArr.length !== 0) {
                            if (ownersArr[0]) {
                                ownerId1 = ownersArr[0];
                            }
                            else {
                                ownerId1 = null;
                            }
                            if (ownersArr[1]) {
                                ownerId2 = ownersArr[1];
                            }
                            else {
                                ownerId2 = null;
                            }
                            if (ownersArr[2]) {
                                ownerId3 = ownersArr[2];
                            }
                            else {
                                ownerId3 = null;
                            }
                            const ownersIds = {
                                ownerId1: ownerId1,
                                ownerId2: ownerId2,
                                ownerId3: ownerId3
                            };
                            Tenant.update(ownersIds, { where: { tenantId: entry.tenantId } });
                        }
                    })
            })
            .then(() => {
                Tenant.find({
                    where: {
                        tenantId: tenantCreated.tenantId
                    }
                })
                    .then(tenantSend => {
                        tenantSend.tenantName = decrypt(tenantSend.tenantName);
                        tenantSend.userName = decrypt(tenantSend.userName);
                        tenantSend.email = decrypt(tenantSend.email);
                        tenantSend.contact = decrypt(tenantSend.contact);
                        tenantSend.aadhaarNumber = decrypt(tenantSend.aadhaarNumber);
                        tenantSend.picture = decrypt(tenantSend.picture);
                        tenantSend.permanentAddress = decrypt(tenantSend.permanentAddress);
                        tenantSend.bankName = decrypt(tenantSend.bankName);
                        tenantSend.accountHolderName = decrypt(tenantSend.accountHolderName);
                        tenantSend.accountNumber = decrypt(tenantSend.accountNumber);
                        tenantSend.gender = decrypt(tenantSend.gender);
                        tenantSend.panCardNumber = decrypt(tenantSend.panCardNumber);
                        tenantSend.IFSCCode = decrypt(tenantSend.IFSCCode);
                        tenant = tenantSend;
                        return res.status(httpStatus.CREATED).json({
                            message: "Tenant successfully created",
                            tenant
                        });
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getDecrypted = async (req, res, next) => {
    try {
        const tenantsArr = [];
        
        Tenant.findAll({
            where: {
                isActive: true
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Society },
                { model: Tower },
                { model: FlatDetail },
                { model: Owner, as: 'Owner1' },
                { model: Owner, as: 'Owner2' },
                { model: Owner, as: 'Owner3' }
            ]
        })
            .then(tenants => {
                // console.log(tenants);
                tenants.map(item => {
                    item.tenantName = decrypt(item.tenantName);
                    item.userName = decrypt(item.userName);
                    item.email = decrypt(item.email);
                    item.contact = decrypt(item.contact);
                    item.aadhaarNumber = decrypt(item.aadhaarNumber);
                    item.picture = decrypt(item.picture);
                    item.permanentAddress = decrypt(item.permanentAddress);
                    item.bankName = decrypt(item.bankName);
                    item.accountHolderName = decrypt(item.accountHolderName);
                    item.accountNumber = decrypt(item.accountNumber);
                    item.gender = decrypt(item.gender);
                    item.panCardNumber = decrypt(item.panCardNumber);
                    item.IFSCCode = decrypt(item.IFSCCode);
                    tenantsArr.push(item);
                    console.log(tenantsArr);
                })
                return tenantsArr;
            })
            .then(tenants => {
                return res.status(httpStatus.OK).json({
                    message: "Tenant Content Page",
                    tenants
                });
            })
            .catch(err => console.log(err))
        // if (tenantsArr) {
        //     return res.status(httpStatus.OK).json({
        //         message: "Tenant Content Page",
        //         tenantsArr
        //     });
        // }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.updateEncrypted = (req, res, next) => {

}