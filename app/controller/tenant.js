const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const passwordGenerator = require('generate-password');
const shortId = require('short-id');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const mailjet = require('node-mailjet').connect('5549b15ca6faa8d83f6a5748002921aa', '68afe5aeee2b5f9bbabf2489f2e8ade2');


const Tenant = db.tenant;
const TenantMembersDetail = db.tenantMembersDetail;
const Owner = db.owner;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;
const Relation = db.relation;
const Floor = db.floor;
const Location = db.location;
const City = db.city;
const State = db.state;
const Country = db.country;
const User = db.user;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;
const Slot = db.slot;
const Parking = db.parking;
const TenantFlatDetail = db.tenantFlatDetail;

setInterval(async function () {
    // console.log("atin")
    let ndate = new Date();
    let otps = await Otp.findAll();
    if (otps) {
        otps.map(async otp => {
            let timeStr = otp.createdAt.toString();
            let diff = Math.abs(ndate - new Date(timeStr.replace(/-/g, '/')));
            console.log("diff==>", diff);
            if (Math.abs(Math.floor((diff / (1000 * 60)) % 60) >= 50)) {
                await Owner.destroy({ where: { [Op.and]: [{ ownerId: otp.ownerId }, { isActive: false }] } });
                await otp.destroy();
                console.log("otp destroyed");
            }
        })
    }
}, 10000009);

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


function decrypt1(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}

let mailToUser = (email, tenantId) => {
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    tenantId = encrypt(tenantId.toString());
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
                            "Email": email,
                            "Name": 'Atin' + ' ' + 'Tanwar'
                        }
                    ],
                    "Subject": "Activation link",
                    "HTMLPart": `<b>Click on the given link to activate your account</b> <a href="http://mydreamsociety.com/login/tokenVerification?tenantId=${tenantId}&token=${token}">click here</a>`
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
            // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}

let mailToOwner = async (ownerId, tenant) => {
    // let email = decrypt1(key,owner.email);
    // let password = owner.password;
    let key = config.secret;
    const owner = await Owner.findOne({ where: { isActive: true, ownerId: ownerId } });
    let email = decrypt1(key, owner.email)
    let userName = tenant.userName;
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
                            "Email": email,
                            "Name": 'Atin' + ' ' + 'Tanwar'
                        }
                    ],
                    "Subject": "Tenant tried to register in Dream Society",
                    "HTMLPart": `${userName} is registering in Dream society`
                    //   "HTMLPart": `your username is: ${userName} and password is: ${password}. `
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
            // console.log(`http://192.168.1.105:3000/submitotp?userId=${encryptedId}token=${encryptedToken}`);
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}

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
        const deleteSelected = req.body.ids.split(',');
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedTenant = await Tenant.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } })
        if (updatedTenant) {
            TenantMembersDetail.update(update, { where: { tenantId: { [Op.in]: deleteSelected } } });
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
            TenantMembersDetail.update({ isActive: false }, { where: { tenantId: id } });
            return res.status(httpStatus.OK).json({
                message: "Tenant deleted successfully",
                tenant: updatedTenant
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.createEncrypted = async (req, res, next) => {
    try {
        console.log('Creating Tenant');

        let tenant = req.body;
        let members = req.body.member;
        const membersArr = [];
        const ownersArr = [];
        let tenantCreated;
        tenant.userId = req.userId;
        let userName = tenant.firstName.replace(/ /g, '') + 'T' + tenant.towerId + tenant.flatDetailId;
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

        user1 = await User.findOne({ where: { [Op.and]: [{ email: encrypt(tenant.email) }, { isActive: true }] } });
        user2 = await User.findOne({ where: { [Op.and]: [{ contact: encrypt(tenant.contact) }, { isActive: true }] } });

        if (tenant['email'] !== undefined) {
            tenantEmailErr = await Tenant.findOne({ where: { email: encrypt(tenant.email), isActive: true } });
        } else {
            tenantEmailErr = null;
        }
        if (tenant['contact'] !== undefined) {
            tenantContactErr = await Tenant.findOne({ where: { contact: encrypt(tenant.contact), isActive: true } });
        } else {
            tenantContactErr = null;
        }

        if (tenantEmailErr !== null) {
            messageEmailErr = 'Email already in use';
        }
        else {
            messageEmailErr = '';
        }
        if (tenantContactErr !== null) {
            messageContactErr = 'Contact already in use';
        }
        else {
            messageContactErr = '';
        }

        const messageErr = {
            messageEmailErr: messageEmailErr,
            messageContactErr: messageContactErr
        };

        if ((tenant.locationId === '') && (tenant.stateId === '') && (tenant.cityId === '') && (tenant.countryId === '')) {
            tenant.locationId = null;
            tenant.stateId = null;
            tenant.cityId = null;
            tenant.countryId = null;
        }


        if (user1 === null && user2 === null) {
            if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
                Tenant.create({
                    firstName: encrypt(tenant.firstName),
                    lastName: encrypt(tenant.lastName),
                    userName: encrypt(tenant.userName),
                    dob: tenant.dob,
                    email: encrypt(tenant.email),
                    contact: encrypt(tenant.contact),
                    password: tenant.password,
                    permanentAddress: encrypt(tenant.permanentAddress),
                    correspondenceAddress: encrypt(tenant.correspondenceAddress),
                    aadhaarNumber: encrypt(tenant.aadhaarNumber),
                    // bankName: encrypt(tenant.bankName),
                    // accountHolderName: encrypt(tenant.accountHolderName),
                    // accountNumber: encrypt(tenant.accountNumber),
                    gender: encrypt(tenant.gender),
                    panCardNumber: encrypt(tenant.panCardNumber),
                    // IFSCCode: encrypt(tenant.IFSCCode),
                    noOfMembers: tenant.noOfMembers,
                    // ownerId: tenant.ownerId1,
                    // ownerId1: tenant.ownerId1,
                    // ownerId2: tenant.ownerId2,
                    // ownerId3: tenant.ownerId3,

                    userId: tenant.userId,
                    floorId: tenant.floorId,
                    societyId: tenant.societyId,
                    towerId: tenant.towerId,
                    // flatDetailId: tenant.flatDetailId
                })
                    .then(async entry => {
                        console.log('Body ==>', entry);
                        tenantCreated = entry;

                        if (tenant.flatDetailIds[0] !== null && tenant.flatDetailIds[0] !== undefined && tenant.flatDetailIds[0] !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailIds[0],
                                tenantId: entry.tenantId
                            })
                        }
                        if (tenant.flatDetailIds[1] !== null && tenant.flatDetailIds[1] !== undefined && tenant.flatDetailIds[1] !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailIds[1],
                                tenantId: entry.tenantId
                            })
                        }
                        if (tenant.flatDetailIds[2] !== null && tenant.flatDetailIds[2] !== undefined && tenant.flatDetailIds[2] !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailIds[2],
                                tenantId: entry.tenantId
                            })
                        }
                        if (tenant.flatDetailIds[3] !== null && tenant.flatDetailIds[3] !== undefined && tenant.flatDetailIds[3] !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailIds[3],
                                tenantId: entry.tenantId
                            })
                        }
                        if (tenant.flatDetailIds[4] !== null && tenant.flatDetailIds[4] !== undefined && tenant.flatDetailIds[4] !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailIds[4],
                                tenantId: entry.tenantId
                            })
                        }

                        const roles = await Role.findOne({
                            where: {
                                id: 4
                            }
                        })

                        User.create({
                            firstName: encrypt(tenant.firstName),
                            lastName: encrypt(tenant.lastName),
                            userName: encrypt(tenant.userName),
                            contact: encrypt(tenant.contact),
                            email: encrypt(tenant.email),
                            password: bcrypt.hashSync(tenant.password, 8),
                            // familyMember: encrypt(tenant.noOfMembers.toString()),
                            // parking: encrypt('...'),
                            towerId: tenant.towerId,
                            isActive: false
                        })
                            .then(user => {
                                // user.setRoles(roles);
                                UserRoles.create({ userId: user.userId, roleId: roles.id });
                            })
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

                        // await Owner.findOne({
                        //     attributes: ['ownerId'],
                        //     where: {
                        //         flatDetailId: tenant.flatDetailId
                        //     }
                        // })
                        //     .then(owners => {
                        //         owners.map(item => {
                        //             ownersArr.push(item.ownerId);
                        //         })
                        //         return ownersArr;
                        //     })
                        //     .then(owners => {
                        //         if (ownersArr.length !== 0) {
                        //             if (ownersArr[0]) {
                        //                 ownerId1 = ownersArr[0];
                        //             }
                        //             else {
                        //                 ownerId1 = null;
                        //             }
                        //             if (ownersArr[1]) {
                        //                 ownerId2 = ownersArr[1];
                        //             }
                        //             else {
                        //                 ownerId2 = null;
                        //             }
                        //             if (ownersArr[2]) {
                        //                 ownerId3 = ownersArr[2];
                        //             }
                        //             else {
                        //                 ownerId3 = null;
                        //             }
                        //             const ownersIds = {
                        //                 ownerId1: ownerId1,
                        //                 ownerId2: ownerId2,
                        //                 ownerId3: ownerId3
                        //             };
                        //             Tenant.update(ownersIds, { where: { tenantId: entry.tenantId } });
                        //         }
                        //     })
                    })
                    .then(() => {
                        Tenant.find({
                            where: {
                                tenantId: tenantCreated.tenantId
                            }
                        })
                            .then(tenantSend => {
                                // tenantSend.firstName = decrypt(tenantSend.firstName);
                                // tenantSend.lastName = decrypt(tenantSend.lastName);
                                // tenantSend.userName = decrypt(tenantSend.userName);
                                // tenantSend.email = decrypt(tenantSend.email);
                                // tenantSend.contact = decrypt(tenantSend.contact);
                                // tenantSend.picture = decrypt(tenantSend.picture);
                                // tenantSend.aadhaarNumber = decrypt(tenantSend.aadhaarNumber);
                                // tenantSend.permanentAddress = decrypt(tenantSend.permanentAddress);
                                // tenantSend.correspondenceAddress = decrypt(tenantSend.correspondenceAddress);
                                // tenantSend.bankName = decrypt(tenantSend.bankName);
                                // tenantSend.accountHolderName = decrypt(tenantSend.accountHolderName);
                                // tenantSend.accountNumber = decrypt(tenantSend.accountNumber);
                                // tenantSend.gender = decrypt(tenantSend.gender);
                                // tenantSend.panCardNumber = decrypt(tenantSend.panCardNumber);
                                // tenantSend.IFSCCode = decrypt(tenantSend.IFSCCode);

                                const message = mailToUser(req.body.email, tenantSend.tenantId);
                                console.log("ownerID1====?", tenantSend.owner, "87389547374 ", tenantSend)
                                mailToOwner(tenantSend.ownerId1, tenantSend);
                                return res.status(httpStatus.CREATED).json({
                                    message: "Tenant successfully created. please activate your account. click on the link delievered to your given email",
                                    // tenant: tenantSend
                                });
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(err => console.log(err))
            } else {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
            }
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: 'User already exist for same email and contact'
            });
        }
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
                { model: Floor },
                // { model: Owner, as: 'Owner1' },
                // { model: Owner, as: 'Owner2' },
                // { model: Owner, as: 'Owner3' }
            ]
        })
            .then(tenants => {
                // console.log(tenants);
                tenants.map(item => {
                    item.firstName = decrypt(item.firstName);
                    item.lastName = decrypt(item.lastName);
                    item.userName = decrypt(item.userName);
                    item.email = decrypt(item.email);
                    item.contact = decrypt(item.contact);
                    item.aadhaarNumber = decrypt(item.aadhaarNumber);
                    item.picture = decrypt(item.picture);
                    item.permanentAddress = decrypt(item.permanentAddress);
                    item.correspondenceAddress = decrypt(item.correspondenceAddress);
                    // item.bankName = decrypt(item.bankName);
                    // item.accountHolderName = decrypt(item.accountHolderName);
                    // item.accountNumber = decrypt(item.accountNumber);
                    item.gender = decrypt(item.gender);
                    item.panCardNumber = decrypt(item.panCardNumber);
                    // item.IFSCCode = decrypt(item.IFSCCode);
                    tenantsArr.push(item);
                    // console.log(tenantsArr);
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

exports.updateEncrypted = async (req, res, next) => {
    const id = req.params.id;
    const ownersArr = [];
    console.log("Id ===>", id)
    if (!id) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
    }

    const update = req.body;
    console.log("Update ===>", update)
    if (!update) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
    }

    update.userId = req.userId;
    if ((update['fileName'] !== '' && update['fileName'] !== null && update['fileName'] !== undefined) && (update['picture'] !== '' && update['picture'] !== null && update['picture'] !== undefined)) {
        index = update.fileName.lastIndexOf('.');
        update.fileExt = update.fileName.slice(index + 1);
        update.fileName = update.fileName.slice(0, index);
        update.picture = update.picture.split(',')[1];
    }

    const tenant = await Tenant.find({ where: { tenantId: id } });

    if (update['email'] !== undefined) {
        tenantEmailErr = await Tenant.findOne({ where: { email: encrypt(update.email), tenantId: { [Op.ne]: id } } });
    } else {
        tenantEmailErr = null;
    }
    if (update['contact'] !== undefined) {
        tenantContactErr = await Tenant.findOne({ where: { contact: encrypt(update.contact), tenantId: { [Op.ne]: id } } });
    } else {
        tenantContactErr = null;
    }

    if (tenantEmailErr !== null) {
        messageEmailErr = 'Email already in use';
    }
    else {
        messageEmailErr = '';
    }
    if (tenantContactErr !== null) {
        messageContactErr = 'Contact already in use';
    }
    else {
        messageContactErr = '';
    }

    const messageErr = {
        messageEmailErr: messageEmailErr,
        messageContactErr: messageContactErr
    };

    if ((messageErr.messageEmailErr === '') && (messageErr.messageContactErr === '')) {
        firstNameCheck = constraintCheck('firstName', update);
        lastNameCheck = constraintCheck('lastName', update);
        dobCheck = constraintCheck('dob', update);
        emailCheck = constraintCheck('email', update);
        contactCheck = constraintCheck('contact', update);
        aadhaarNumberCheck = constraintCheck('aadhaarNumber', update);
        permanentAddressCheck = constraintCheck('permanentAddress', update);
        correspondenceAddressCheck = constraintCheck('correspondenceAddress', update);
        bankNameCheck = constraintCheck('bankName', update);
        accountHolderNameCheck = constraintCheck('accountHolderName', update);
        accountNumberCheck = constraintCheck('accountNumber', update);
        genderCheck = constraintCheck('gender', update);
        panCardNumberCheck = constraintCheck('panCardNumber', update);
        IFSCCodeCheck = constraintCheck('IFSCCode', update);
        societyIdCheck = constraintCheck('societyId', update);
        towerIdCheck = constraintCheck('towerId', update);
        // flatDetailIdCheck = constraintCheck('flatDetailId', update);
        floorIdCheck = constraintCheck('floorId', update);


        firstName = constraintReturn(firstNameCheck, update, 'firstName', tenant);
        lastName = constraintReturn(lastNameCheck, update, 'lastName', tenant);
        dob = referenceConstraintReturn(dobCheck, update, 'dob', tenant);
        email = constraintReturn(emailCheck, update, 'email', tenant);
        contact = constraintReturn(contactCheck, update, 'contact', tenant);
        aadhaarNumber = constraintReturn(aadhaarNumberCheck, update, 'aadhaarNumber', tenant);
        permanentAddress = constraintReturn(permanentAddressCheck, update, 'permanentAddress', tenant);
        correspondenceAddress = constraintReturn(correspondenceAddressCheck, update, 'correspondenceAddress', tenant);
        bankName = constraintReturn(bankNameCheck, update, 'bankName', tenant);
        accountHolderName = constraintReturn(accountHolderNameCheck, update, 'accountHolderName', tenant);
        accountNumber = constraintReturn(accountNumberCheck, update, 'accountNumber', tenant);
        gender = constraintReturn(genderCheck, update, 'gender', tenant);
        panCardNumber = constraintReturn(panCardNumberCheck, update, 'panCardNumber', tenant);
        IFSCCode = constraintReturn(IFSCCodeCheck, update, 'IFSCCode', tenant);
        societyId = referenceConstraintReturn(societyIdCheck, update, 'societyId', tenant);
        towerId = referenceConstraintReturn(towerIdCheck, update, 'towerId', tenant);
        // flatDetailId = referenceConstraintReturn(flatDetailIdCheck, update, 'flatDetailId', tenant);
        floorId = referenceConstraintReturn(floorIdCheck, update, 'floorId', tenant);


        // await Owner.findAll({
        //     attributes: ['ownerId'],
        //     where: {
        //         flatDetailId: flatDetailId
        //     }
        // })
        //     .then(owners => {
        //         owners.map(item => {
        //             ownersArr.push(item.ownerId);
        //         })
        //         return ownersArr;
        //     })
        //     .then(owners => {
        //         if (ownersArr.length !== 0) {
        //             if (ownersArr[0]) {
        //                 ownerId1 = ownersArr[0];
        //             }
        //             else {
        //                 ownerId1 = null;
        //             }
        //             if (ownersArr[1]) {
        //                 ownerId2 = ownersArr[1];
        //             }
        //             else {
        //                 ownerId2 = null;
        //             }
        //             if (ownersArr[2]) {
        //                 ownerId3 = ownersArr[2];
        //             }
        //             else {
        //                 ownerId3 = null;
        //             }
        //             const ownersIds = {
        //                 ownerId1: ownerId1,
        //                 ownerId2: ownerId2,
        //                 ownerId3: ownerId3
        //             };
        //             Tenant.update(ownersIds, { where: { tenantId: id } });
        //         }
        //     })
        if ((update.picture !== '') && (update.picture !== null) && (update.picture !== undefined)) {
            tenantImage = await Tenant.find({ where: { tenantId: id }, attributes: ['picture'] });
            fs.unlink((decrypt(tenantImage.picture)).replace('../../', ''), err => {
                if (err) {
                    console.log("File Missing ===>", err);
                }
                console.log('File Deleted Successfully');
            })
            await saveToDisc(update.fileName, update.fileExt, update.picture, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    const updatedImage = {
                        picture: encrypt(res)
                    };
                    Tenant.update(updatedImage, { where: { tenantId: id } });
                }
            })
        }

        const updates = {
            firstName: firstName,
            lastName: lastName,
            dob: dob,
            email: email,
            contact: contact,
            aadhaarNumber: aadhaarNumber,
            permanentAddress: permanentAddress,
            correspondenceAddress: correspondenceAddress,
            bankName: bankName,
            accountHolderName: accountHolderName,
            accountNumber: accountNumber,
            gender: gender,
            panCardNumber: panCardNumber,
            IFSCCode: IFSCCode,
            floorId: floorId,
            userId: req.userId,
            societyId: societyId,
            towerId: towerId,
            flatDetailId: flatDetailId
        };

        Tenant.find({
            where: {
                tenantId: id
            }
        })
            .then(tenant => {
                return tenant.updateAttributes(updates);
            })
            .then(tenant => {
                // tenant.tenantName = decrypt(tenant.tenantName);
                // tenant.userName = decrypt(tenant.userName);
                // tenant.email = decrypt(tenant.email);
                // tenant.contact = decrypt(tenant.contact);
                // tenant.aadhaarNumber = decrypt(tenant.aadhaarNumber);
                // tenant.picture = decrypt(tenant.picture);
                // tenant.permanentAddress = decrypt(tenant.permanentAddress);
                // tenant.bankName = decrypt(tenant.bankName);
                // tenant.accountHolderName = decrypt(tenant.accountHolderName);
                // tenant.accountNumber = decrypt(tenant.accountNumber);
                // tenant.gender = decrypt(tenant.gender);
                // tenant.panCardNumber = decrypt(tenant.panCardNumber);
                // tenant.IFSCCode = decrypt(tenant.IFSCCode);
                return res.status(httpStatus.CREATED).json({
                    message: "Tenant successfully updated",
                    // tenant: tenant
                });
            })
            .catch(err => console.log(err))
    } else {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(messageErr);
    }
}

exports.getTenantMembers = async (req, res, next) => {
    const tenantId = req.params.id;
    const membersArr = [];
    console.log('Tenant-ID ===>', tenantId);

    // const tenant = Tenant.findOne({
    //     where: {
    //         tenantId: tenantId
    //     }
    // });

    if (!tenantId) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
    }

    const tenantMembers = await TenantMembersDetail.findAll({
        where: {
            tenantId: tenantId,
            isActive: true
        },
        include: {
            model: Relation,
            attributes: ['relationName']
        }
    });
    // console.log(tenantMembers)



    tenantMembers.map(item => {
        item.memberName = decrypt(item.memberName);
        item.gender = decrypt(item.gender);
    })

    res.status(httpStatus.OK).json({
        message: "Tenant Members Details",
        members: tenantMembers
    });
}

exports.deleteTenantMember = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log('Tenant Member-ID ===>', id);

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }

        const update = req.body;
        console.log('Tenant Member Body ===>', update);

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }

        const member = await TenantMembersDetail.find({ where: { memberId: id } });

        const updatedMember = await member.updateAttributes(update);

        updatedMember.memberName = decrypt(updatedMember.memberName);
        updatedMember.gender = decrypt(updatedMember.gender);

        if (updatedMember) {
            return res.status(httpStatus.OK).json({
                message: "Member deleted successfully",
                member: updatedMember
            });
        }
    } catch (error) {
        console.log("error ===>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.addTenantMembers = (req, res, next) => {
    const member = req.body;
    member.userId = req.userId;

    member.memberName = encrypt(member.memberName);
    member.gender = encrypt(member.gender);

    TenantMembersDetail.create(member)
        .then(member => {
            member.memberName = decrypt(member.memberName);
            member.gender = decrypt(member.gender);
            return res.status(httpStatus.CREATED).json({
                message: 'Member created successfully',
                member
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.editTenantMembers = async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json('Id is missing');
    }

    const update = req.body;

    if (!update) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json('Please try again');
    }

    member = await TenantMembersDetail.findOne({ where: { memberId: id } });

    memberNameCheck = constraintCheck('memberName', update);
    genderCheck = constraintCheck('gender', update);

    update.memberName = constraintReturn(memberNameCheck, update, 'memberName', member);
    update.gender = constraintReturn(genderCheck, update, 'gender', member);

    TenantMembersDetail.update(update, {
        where: {
            memberId: id
        }
    })
        .then(member => {
            return res.status(httpStatus.CREATED).json({
                message: 'Member updated successfully',
            })
        })
        .catch(err => {
            console.log('Error ===>', err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteSelectedTenantMembers = (req, res, next) => {
    const ids = req.body.ids;

    if (!ids) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json('Ids are missing');
    }

    const deleteUpdate = { isActive: false };

    TenantMembersDetail.update(deleteUpdate, {
        where: {
            memberId: {
                [Op.or]: ids
            }
        }
    })
        .then(members => {
            return res.status(httpStatus.OK).json({
                message: 'Members deleted successfully'
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}