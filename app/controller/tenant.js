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
const randomInt = require('random-int');


const Tenant = db.tenant;
const TenantMembersDetail = db.tenantMembersDetail;
const Owner = db.owner;
const OwnerFlatDetail = db.ownerFlatDetail;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Society = db.society;
const Relation = db.relation;
const Floor = db.floor;
const User = db.user;
const Otp = db.otp;
const Role = db.role;
const UserRoles = db.userRole;
const TenantFlatDetail = db.tenantFlatDetail;
const RFID = db.rfid;
const UserRFID = db.userRfid;

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
    if ((property in object) && object[property] !== undefined && object[property] !== null) {
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

generateRandomId = () => {
    const id = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return id;
}


function decrypt1(key, data) {
    var decipher = crypto.createDecipher("aes-128-cbc", key);
    var decrypted = decipher.update(data, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
}

let mailToUser = (email, id) => {
    const token = jwt.sign(
        { data: 'foo' },
        'secret', { expiresIn: '1h' });
    tenantId = encrypt(id.toString());
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
                    "HTMLPart": `<b>Your verification link has been sent to your owner</b>`
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

let mailToOwner = async (ownerId, email, id, userName) => {
    // let email = decrypt1(key,owner.email);
    // let password = owner.password;
    let key = config.secret;
    const owner = await Owner.findOne({ where: { isActive: true, ownerId: ownerId } });
    let email1 = decrypt1(key, owner.email)
    mailToUser(decrypt1(key, email), id);
    ownerId = encrypt(ownerId.toString());
    tenantId = encrypt(id.toString());
    let userName1 = decrypt(userName);
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
                            "Email": email1,
                            "Name": 'Atin' + ' ' + 'Tanwar'
                        }
                    ],
                    "Subject": "Tenant tried to register in Dream Society",
                    "HTMLPart": `${userName1} is registering in Dream society <b>Click on the given link to verify your tenant</b> <a href="http://mydreamsociety.com/login/tenantVerification?ownerId=${ownerId}&tenantId=${tenantId}">click here</a>`
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



let mailToOwner1 = async (ownerId, email, id, userName) => {
    // let email = decrypt1(key,owner.email);
    // let password = owner.password;
    let key = config.secret;
    const owner = await Owner.findOne({ where: { isActive: true, ownerId: ownerId } });
    let email1 = decrypt1(key, owner.email)
    mailToUser(decrypt1(key, email), id);
    ownerId = encrypt(ownerId.toString());
    tenantId = encrypt(id.toString());
    let userName1 = decrypt(userName);
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
                            "Email": email1,
                            "Name": 'Atin' + ' ' + 'Tanwar'
                        }
                    ],
                    "Subject": "Tenant tried to register in Dream Society",
                    "HTMLPart": `${userName1} is registering in Dream society <b>Click on the given link to verify your tenant</b> <a href="http://mydreamsociety.com/login/tenantVerification?ownerId=${ownerId}&tenantMemberId=${tenantId}">click here</a>`
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

let filterFlats = item => {
    return item.tenant_flatDetail_master.isActive === true;
}


exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        const userNames = [];
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
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
            User.update({ isActive: false }, { where: { userId: id } })
            UserRoles.update({ isActive: false }, { where: { userId: id, roleId: 4 } });
            UserRFID.update({ isActive: false }, { where: { userId: id } });
            TenantFlatDetail.findAll({ where: { tenantId: id } })
                .then(flats => {
                    flats.map(item => {
                        item.updateAttributes({ isActive: false });
                    })
                })
            TenantMembersDetail.findAll({
                where: {
                    tenantId: id
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

        let randomNumber;
        randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
        const tenantExists = await Tenant.findOne({ where: { isActive: true, tenantId: randomNumber } });
        const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
        if (tenantExists !== null || userExists !== null) {
            console.log("duplicate random number")
            randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
        }

        let tenant = req.body;
        let members = req.body.member;
        const membersArr = [];
        const ownersArr = [];
        let tenantCreated;
        tenant.userId = req.userId;
        uniqueId = generateRandomId();
        let userName = tenant.firstName.replace(/ /g, '') + 'T' + uniqueId.toString(36);
        tenant.userName = userName;
        index = tenant.fileName.lastIndexOf('.');
        tenant.fileExt = tenant.fileName.slice(index + 1);
        tenant.fileName = tenant.fileName.slice(0, index);
        tenant.profilePicture = tenant.profilePicture.split(',')[1];
        tenant.tenantId = randomNumber;
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
                    tenantId: tenant.tenantId,
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
                    gender: encrypt(tenant.gender),
                    panCardNumber: encrypt(tenant.panCardNumber),
                    noOfMembers: tenant.noOfMembers,
                    userId: tenant.userId,
                    floorId: tenant.floorId,
                    societyId: tenant.societyId,
                    towerId: tenant.towerId,
                    // flatDetailId: tenant.flatDetailId
                })
                    .then(async entry => {
                        console.log('Body ==>', entry);
                        tenantCreated = entry;

                        if (tenant.flatDetailId !== null && tenant.flatDetailId !== undefined && tenant.flatDetailId !== '') {
                            TenantFlatDetail.create({
                                flatDetailId: tenant.flatDetailId,
                                tenantId: entry.tenantId,
                                // isActive: false
                            })
                        }

                        const roles = await Role.findOne({
                            where: {
                                id: 4
                            }
                        })

                        User.create({
                            userId: tenant.tenantId,
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
                                UserRoles.create({ userId: user.userId, roleId: roles.id, isActive: false });
                                UserRFID.create({ userId: tenant.tenantId, rfidId: tenant.rfidId, isActive: true });
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
                                let randomNumber;
                                randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);

                                item.memberId = randomNumber;
                                let memberUserName = item.firstName.replace(/ /g, '') + 'T' + uniqueId.toString(36);
                                console.log("tenant member userNAme ",memberUserName)
                                const password = passwordGenerator.generate({
                                    length: 10,
                                    numbers: true
                                });
                                item.password = password;
                                item.memberDob = item.memberDob;
                                item.email = encrypt(item.email);
                                item.contact = encrypt(item.contact);
                                item.firstName = encrypt(item.firstName);
                                item.lastName = encrypt(item.lastName);
                                item.aadhaarNumber = encrypt(item.aadhaarNumber);
                                item.userName = encrypt(memberUserName);
                                item.gender = encrypt(item.gender);
                                item.userId = req.userId;
                                item.tenantId = entry.tenantId;
                                membersArr.push(item);
                            })
                            membersArr.map(item => {
                                TenantMembersDetail.create(item)
                                    .then(async member => {
                                        const owners = await OwnerFlatDetail.findAll({
                                            where: {
                                                isActive: true,
                                                flatDetailId: tenant.flatDetailId
                                            },
                                            attributes: ['ownerId']
                                        })
                                        owners.map(item => {
                                            ownerId = item.ownerId;
                                            mailToOwner1(ownerId, member.email, member.memberId, member.userName);
                                        });
                                    });
                                User.create({
                                    userId: item.memberId,
                                    firstName: item.firstName,
                                    lastName: item.lastName,
                                    userName: item.userName,
                                    contact: item.contact,
                                    email: item.email,
                                    password: bcrypt.hashSync(item.password, 8),
                                    // familyMember: encrypt(tenant.noOfMembers.toString()),
                                    // parking: encrypt('...'),
                                    towerId: tenant.towerId,
                                    isActive: false
                                })
                                    .then(user => {
                                        // user.setRoles(roles);
                                        UserRoles.create({ userId: user.userId, roleId: roles.id, isActive: false });
                                        UserRFID.create({ userId: user.userId, rfidId: item.rfidId, isActive: true });
                                    })
                            })
                        }
                    })
                    .then(() => {
                        Tenant.find({
                            where: {
                                tenantId: tenantCreated.tenantId
                            }
                        })
                            .then(async tenantSend => {
                                let ownerId;

                                const owners = await OwnerFlatDetail.findAll({
                                    where: {
                                        isActive: true,
                                        flatDetailId: tenant.flatDetailId
                                    },
                                    attributes: ['ownerId']
                                })
                                // ownerId = owners[0].ownerId;

                                // const message = mailToUser(req.body.email, tenantSend.tenantId);
                                console.log("ownerID1====?", tenantSend.owner, "87389547374 ", tenantSend)
                                owners.map(item => {
                                    ownerId = item.ownerId;
                                    mailToOwner(ownerId, tenantSend.email, tenantSend.tenantId, tenantSend.userName);
                                });
                                // mailToOwner(ownerId, tenantSend);
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

// exports.getDecrypted = async (req, res, next) => {
//     try {
//         const tenantsArr = [];

//         Tenant.findAll({
//             where: {
//                 isActive: true
//             },
//             order: [['createdAt', 'DESC']],
//             include: [
//                 { model: Society },
//                 {
//                     model: FlatDetail, include: [
//                         { model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
//                         { model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
//                     ]
//                 },
//             ]
//         })
//             .then(tenants => {
//                 // console.log(tenants);
//                 tenants.map(async item => {
//                     let rfid = await UserRFID.findOne({
//                         where: {
//                             userId: item.tenantId,
//                             isActive: true
//                         },
//                         include: [
//                             {model: RFID, where: {isActive: true},attributes:['rfidId','rfid']}
//                         ]
//                     })
//                     // console.log('RFID',rfid);
//                     item.firstName = decrypt(item.firstName);
//                     item.lastName = decrypt(item.lastName);
//                     item.userName = decrypt(item.userName);
//                     item.email = decrypt(item.email);
//                     item.contact = decrypt(item.contact);
//                     item.aadhaarNumber = decrypt(item.aadhaarNumber);
//                     item.picture = decrypt(item.picture);
//                     item.permanentAddress = decrypt(item.permanentAddress);
//                     item.correspondenceAddress = decrypt(item.correspondenceAddress);
//                     item.gender = decrypt(item.gender);
//                     item.panCardNumber = decrypt(item.panCardNumber);
//                     item.rfid_master = rfid;
//                     tenantsArr.push(item);
//                 })
//                 return tenantsArr;
//             })
//             .then(tenants => {
//                 return res.status(httpStatus.OK).json({
//                     message: "Tenant Content Page",
//                     tenants
//                 });
//             })
//             .catch(err => console.log(err))
//     } catch (error) {
//         console.log("error==>", error);
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }

exports.getDecrypted = (req, res, next) => {
    // const rfidsArr = [];
    const tenantsArr = [];
    const tenantIds = [];
    Tenant.findAll({
        where: {
            isActive: true
        },
        attributes: ['tenantId']
    })
        .then(tenants => {
            if (tenants.length !== 0) {
                tenants.map(item => {
                    tenantIds.push(item.tenantId);
                })
                // console.log(tenantIds);
                tenantIds.map(item => {
                    Tenant.findOne({
                        where: {
                            isActive: true,
                            tenantId: item
                        },
                        order: [['createdAt', 'DESC']],
                        include: [
                            { model: Society },
                            {
                                model: FlatDetail, include: [
                                    { model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
                                    { model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
                                ]
                            },
                        ]
                    })
                        .then(async tenant => {
                            // console.log(tenant.tenantId);
                            let rfid = await UserRFID.findOne({
                                where: {
                                    userId: tenant.tenantId,
                                    isActive: true
                                },
                                include: [
                                    { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                                ]
                            })
                            // setTimeout(() => console.log(rfid), 1000);
                            tenant.firstName = decrypt(tenant.firstName);
                            tenant.lastName = decrypt(tenant.lastName);
                            tenant.userName = decrypt(tenant.userName);
                            tenant.email = decrypt(tenant.email);
                            tenant.contact = decrypt(tenant.contact);
                            tenant.aadhaarNumber = decrypt(tenant.aadhaarNumber);
                            if (tenant.picture !== null) {
                                tenant.picture = decrypt(tenant.picture);
                            }
                            tenant.permanentAddress = decrypt(tenant.permanentAddress);
                            tenant.correspondenceAddress = decrypt(tenant.correspondenceAddress);
                            tenant.gender = decrypt(tenant.gender);
                            tenant.panCardNumber = decrypt(tenant.panCardNumber);
                            // rfidsArr.push(rfid.rfid_master);
                            tenant = tenant.toJSON();
                            if (rfid !== null) {
                                tenant['rfid_master'] = {
                                    rfidId: rfid.rfid_master.rfidId,
                                    rfid: rfid.rfid_master.rfid
                                };
                            }
                            else {
                                tenant['rfid_master'] = null;
                            }
                            // console.log(tenant);
                            return tenant;
                        })
                        .then(tenant => {
                            tenantsArr.push(tenant);
                        })
                })
                setTimeout(() => {
                    let tenants = tenantsArr;
                    res.status(httpStatus.OK).json({
                        message: "Tenant Content Page",
                        tenants
                    });
                }, 1000);
                // console.log(tenantsArr);
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data available!'
                })
            }
        })
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

    user1 = await User.findOne({ where: { [Op.and]: [{ email: encrypt(update.email) }, { isActive: true }, { userName: { [Op.ne]: tenant.userName } }] } });
    user2 = await User.findOne({ where: { [Op.and]: [{ contact: encrypt(update.contact) }, { isActive: true }, { userName: { [Op.ne]: tenant.userName } }] } });

    if (update['email'] !== undefined) {
        tenantEmailErr = await Tenant.findOne({ where: { email: encrypt(update.email), isActive: true, tenantId: { [Op.ne]: id } } });
    } else {
        tenantEmailErr = null;
    }
    if (update['contact'] !== undefined) {
        tenantContactErr = await Tenant.findOne({ where: { contact: encrypt(update.contact), isActive: true, tenantId: { [Op.ne]: id } } });
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

    if (user1 === null && user2 === null) {
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
            // rfidIdCheck = constraintCheck('rfidId', update);


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
            // rfidId = referenceConstraintReturn(rfidIdCheck, update, 'rfidId', tenant);

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
                // rfidId: update.rfidId,
            };

            Tenant.find({
                where: {
                    tenantId: id
                }
            })
                .then(tenant => {
                    UserRFID.findOne({ where: { userId: tenant.tenantId, isActive: true } })
                        .then(tenantRfid => {
                            if (tenantRfid !== null) {
                                tenantRfid.updateAttributes({ rfidId: update.rfidId })
                            } else {
                                UserRFID.create({
                                    userId: tenant.tenantId,
                                    rfidId: update.rfidId
                                })
                            }
                        })
                    User.update(updates, { where: { userName: tenant.userName, isActive: true } });
                    return tenant.updateAttributes(updates);
                })
                .then(tenant => {
                    return res.status(httpStatus.CREATED).json({
                        message: "Tenant successfully updated",
                        // tenant: tenant
                    });
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
}

exports.getTenantMembers = async (req, res, next) => {
    const tenantId = req.params.id;
    const membersArr = [];
    const memberIds = [];
    console.log('Tenant-ID ===>', tenantId);

    if (!tenantId) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
    }

    TenantMembersDetail.findAll({
        where: {
            isActive: true,
            tenantId: tenantId
        },
        attributes: ['memberId']
    })
        .then(members => {
            members.map(item => {
                memberIds.push(item.memberId);
            })
            memberIds.map(item => {
                TenantMembersDetail.findOne({
                    where: {
                        isActive: true,
                        memberId: item
                    },
                    order: [['createdAt', 'DESC']],
                    include: [
                        { model: Relation },
                        { model: FlatDetail }
                    ]
                })
                    .then(async member => {
                        let rfid = await UserRFID.findOne({
                            where: {
                                userId: member.memberId,
                                isActive: true
                            },
                            include: [
                                { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                            ]
                        })

                        member.firstName = decrypt(member.firstName);
                        member.lastName = decrypt(member.lastName);
                        member.userName = decrypt(member.userName);
                        member.email = decrypt(member.email);
                        member.contact = decrypt(member.contact);
                        member.aadhaarNumber = decrypt(member.aadhaarNumber);
                        // member.picture = decrypt(member.picture);
                        // member.permanentAddress = decrypt(member.permanentAddress);
                        // member.correspondenceAddress = decrypt(member.correspondenceAddress);
                        member.gender = decrypt(member.gender);
                        // member.panCardNumber = decrypt(member.panCardNumber);

                        member = member.toJSON();
                        if (rfid !== null) {
                            member['rfid_master'] = {
                                rfidId: rfid.rfid_master.rfidId,
                                rfid: rfid.rfid_master.rfid
                            };
                        }
                        else {
                            member['rfid_master'] = null;
                        }

                        return member;
                    })
                    .then(member => {
                        membersArr.push(member);
                    })
            })
        })
    // console.log(tenantMembers)

    setTimeout(() => {
        let members = membersArr;
        res.status(httpStatus.OK).json({
            message: "Tenant Members Details",
            members
        });
    }, 1000);
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

        TenantMembersDetail.findOne({
            where: {
                memberId: id
            }
        })
            .then(member => {
                member.updateAttributes({ isActive: false });
                User.update({ isActive: false }, { where: { userId: member.memberId } });
                UserRoles.update({ isActive: false }, { where: { userId: member.memberId } });
                UserRFID.update({ isActive: false }, { where: { userId: member.memberId } });
                return res.status(httpStatus.OK).json({
                    message: "Member deleted successfully"
                });
            })
    } catch (error) {
        console.log("error ===>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.addTenantMembers = async (req, res, next) => {
    const member = req.body;
    const flatIds = [];
    member.userId = req.userId;

    let randomNumber;
    randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    const tenantExists = await TenantMembersDetail.findOne({ where: { isActive: true, memberId: randomNumber } });
    const userExists = await User.findOne({ where: { isActive: true, userId: randomNumber } });
    if (tenantExists !== null || userExists !== null) {
        console.log("duplicate random number")
        randomNumber = randomInt(config.randomNumberMin, config.randomNumberMax);
    }
    let uniqueId = generateRandomId();
    let userName = member.firstName.replace(/ /g, '') + 'T' + uniqueId.toString(36);
    member.userName = userName;
    const password = passwordGenerator.generate({
        length: 10,
        numbers: true
    });
    member.firstName = encrypt(member.firstName);
    member.lastName = encrypt(member.lastName);
    member.userName = encrypt(member.userName);
    member.email = encrypt(member.email);
    member.contact = encrypt(member.contact);
    member.aadhaarNumber = encrypt(member.aadhaarNumber);
    member.gender = encrypt(member.gender);
    member.password = password;
    member.memberId = randomNumber;
    member.isActive = false;

    TenantMembersDetail.create(member)
        .then(async memberCreated => {
            member.password = bcrypt.hashSync(member.password, 8);
            member.userId = member.memberId;
            User.create(member)
                .then(user => {
                    UserRoles.create({
                        userId: member.userId,
                        roleId: 4,
                        isActive: false
                    })
                    UserRFID.create({
                        userId: member.userId,
                        rfidId: member.rfidId,
                        // isActive: false
                    })
                })

            const flats = await TenantFlatDetail.findAll({
                where: {
                    isActive: true,
                    tenantId: member.tenantId
                },
                attributes: ['flatDetailId']
            })

            flats.map(item => {
                flatIds.push(item.flatDetailId);
            })

            const owners = await OwnerFlatDetail.findAll({
                where: {
                    isActive: true,
                    flatDetailId: {
                        [Op.in]: flatIds
                    }
                },
                attributes: ['ownerId']
            })
            owners.map(item => {
                ownerId = item.ownerId;
                mailToOwner1(ownerId, member.email, member.memberId, member.userName);
            });
            return res.status(httpStatus.CREATED).json({
                message: 'Member created successfully. Please check email and contact to your flat owner for account activation.'
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

    console.log('ID ===>', id);

    const update = req.body;

    if (!update) {
        return res.status(httpStatus.UNPROCESSABLE_ENTITY).json('Please try again');
    }

    console.log('Body ===>', update);

    member = await TenantMembersDetail.findOne({ where: { memberId: id } });

    firstNameCheck = constraintCheck('firstName', update);
    lastNameCheck = constraintCheck('lastName', update);
    emailCheck = constraintCheck('email', update);
    contactCheck = constraintCheck('contact', update);
    aadhaarNumberCheck = constraintCheck('aadhaarNumber', update);
    genderCheck = constraintCheck('gender', update);

    update.firstName = constraintReturn(firstNameCheck, update, 'firstName', member);
    update.lastName = constraintReturn(lastNameCheck, update, 'lastName', member);
    update.email = constraintReturn(emailCheck, update, 'email', member);
    update.contact = constraintReturn(contactCheck, update, 'contact', member);
    update.aadhaarNumber = constraintReturn(aadhaarNumberCheck, update, 'aadhaarNumber', member);
    update.gender = constraintReturn(genderCheck, update, 'gender', member);

    TenantMembersDetail.findOne({
        where: {
            memberId: id
        }
    })
        .then(member => {
            member.updateAttributes(update);
            User.update(update, { where: { userId: member.memberId } })
            UserRFID.findOne({ where: { userId: member.memberId, isActive: true } })
                .then(memberRfid => {
                    if (memberRfid !== null) {
                        memberRfid.updateAttributes({ rfidId: update.rfidId })
                    } else {
                        UserRFID.create({
                            userId: member.memberId,
                            rfidId: update.rfidId
                        })
                    }
                })
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

    TenantMembersDetail.findAll({
        where: {
            memberId: {
                [Op.or]: ids
            }
        }
    })
        .then(members => {
            members.map(item => {
                item.updateAttributes(deleteUpdate);
                User.update(deleteUpdate, { where: { userId: item.memberId } });
                UserRoles.update(deleteUpdate, { where: { userId: item.memberId } });
                UserRFID.update(deleteUpdate, { where: { userId: item.memberId } });
            })
            return res.status(httpStatus.OK).json({
                message: 'Members deleted successfully'
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.addFlats = async (req, res, next) => {
    const body = req.body;

    console.log('Body ===>', body);

    const flat = await TenantFlatDetail.findOne({ where: { isActive: true, tenantId: body.tenantId, flatDetailId: body.flatDetailId } });
    const flatCount = await TenantFlatDetail.findAll({ where: { isActive: true, tenantId: body.tenantId } });

    if (flatCount.length === 5) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: 'Maximum flats for this tenant'
        })
    } else {
        if (flat !== null) {
            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: 'Flat already exist for this tenant'
            })
        } else {
            if (body !== null) {
                TenantFlatDetail.findOne({
                    where: {
                        tenantId: body.tenantId,
                        flatDetailId: body.flatDetailId
                    }
                })
                    .then(tenant => {
                        if (tenant !== null) {
                            tenant.updateAttributes({ isActive: true });
                            res.status(httpStatus.CREATED).json({
                                message: 'Flat added successfully'
                            })
                        } else {
                            TenantFlatDetail.create(body)
                                .then(flat => {
                                    if (flat !== null) {
                                        res.status(httpStatus.CREATED).json({
                                            message: 'Flat added successfully'
                                        })
                                    } else {
                                        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                            message: 'Flat not added'
                                        })
                                    }
                                })
                                .catch(err => {
                                    console.log('Error ===>', err);
                                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                                })
                        }
                    })

            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Please provide required data'
                })
            }
        }
    }
}

exports.getFlats = (req, res, next) => {
    const tenantId = req.params.id;

    console.log('Tenant ID ===>', tenantId);

    Tenant.findOne({
        where: {
            tenantId: tenantId,
            isActive: true
        },
        include: [
            {
                model: FlatDetail,
                where: {
                    isActive: true
                },
                include: [
                    { model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
                    { model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
                ]
            }
        ]
    })
        .then(tenant => {
            if (tenant !== null) {
                // console.log(tenant);
                res.status(httpStatus.OK).json({
                    flats: tenant.flat_detail_masters.filter(filterFlats)
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'No tenant found'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.editFlat = (req, res, next) => {
    const body = req.body;
    console.log('Body ===>', body);

    TenantFlatDetail.findOne({
        where: {
            tenantId: body.tenantId,
            flatDetailId: body.previousFlatDetailId,
            isActive: true
        }
    })
        .then(flat => {
            if (flat !== null) {
                TenantFlatDetail.findOne({
                    where: {
                        tenantId: body.tenantId,
                        flatDetailId: body.flatDetailId,
                        isActive: true
                    }
                })
                    .then(flatExisting => {
                        if (flatExisting !== null) {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Flat details already exist for same tenant'
                            })
                        } else {
                            TenantFlatDetail.findOne({
                                where: {
                                    tenantId: body.tenantId,
                                    flatDetailId: body.flatDetailId
                                }
                            })
                                .then(flatExistingNotActive => {
                                    if (flatExistingNotActive !== null) {
                                        flatExistingNotActive.updateAttributes({ isActive: true });
                                        flat.updateAttributes({ isActive: false });
                                        res.status(httpStatus.CREATED).json({
                                            message: 'Flat details updated successfully'
                                        });
                                    } else {
                                        flat.updateAttributes({ flatDetailId: body.flatDetailId });
                                        res.status(httpStatus.CREATED).json({
                                            message: 'Flat details updated successfully'
                                        });
                                    }
                                })
                        }
                    })
                    .catch(err => {
                        console.log('Error ===>', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Flat details not updated'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteFlat = (req, res, next) => {
    const body = req.body;
    console.log('Body ===>', body);

    TenantFlatDetail.findOne({
        where: {
            tenantId: body.tenantId,
            flatDetailId: body.flatDetailId,
            isActive: true
        }
    })
        .then(flat => {
            console.log(flat);
            if (flat !== null) {
                flat.updateAttributes({ isActive: false });
                res.status(httpStatus.OK).json({
                    message: 'Flat deleted successfully'
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Flat not deleted'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}


exports.flatsList = async (req, res, next) => {
    try {
        const activeFlats = await FlatDetail.findAndCountAll({ where: { isActive: true } });
        const occupiedFlats = await OwnerFlatDetail.findAndCountAll({ where: { isActive: true } });
        console.log("active Flats==>", activeFlats.count);
        console.log("empty flats ==>", occupiedFlats.count);
        const emptyFlats = activeFlats.count - occupiedFlats.count;
        console.log(emptyFlats)
        res.status(httpStatus.OK).json({ activeFlats: occupiedFlats.count, emptyFlats });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.rfidCount = async (req, res, next) => {
    try {
        const rfidCount = await Tenant.findAndCountAll({
            where: {
                rfidId: {
                    [Op.ne]: null
                }
            }
        });
        if (rfidCount) {
            res.status(httpStatus.OK).json({ rfid: rfidCount.count });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}