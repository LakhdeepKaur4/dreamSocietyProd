const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var crypto = require('crypto');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: config.machinePort, perMessageDeflate: false });
var schedule = require('node-schedule');
const { userHandler } = require('../handlers/user');
const FingerprintData = db.fingerprintData;
const FingerprintMachineData = db.fingerprintMachineData;
const PunchedData = db.punchedfingerprintMachineData;
const Owner = db.owner;
const Tenant = db.tenant;
const OwnerMembersDetail = db.ownerMembersDetail;
const TenantMembersDetail = db.tenantMembersDetail;
const OwnerFlatDetail = db.ownerFlatDetail;
const TenantFlatDetail = db.tenantFlatDetail;
const User = db.user;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const Role = db.role;
const VendorAllotment = db.vendorAllotment;
const Op = db.Sequelize.Op;

let decrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let decipher = crypto.createDecipher(algorithm, key);
    let decryptedText = decipher.update(text, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}

let filterItem = (arrToBeFiltered) => {
    // console.log(arr);
    const arr = [3, 4];
    const resArr = arrToBeFiltered.filter(item => {
        return arr.includes(item.rfidId) === false;
    });
    // console.log(resArr);
    return resArr;
}

exports.addFingerPrintData = async (req, res, next) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();
        const body = req.body;
        const fingerprintData = await FingerprintData.create(body, transaction);
        if (fingerprintData) {
            await transaction.commit();
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print successfully added",
                fingerprintData
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
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
        // let vendorIds = [];

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
            console.log(owner)
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
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const update = req.body;
        console.log("update----->", update);
        update.fingerprintData = req.body.fingerPrintData;
        const userId = req.params.userId;
        const fingerprintData = await FingerprintData.update(update, { where: { userId: userId }, transaction });
        if (fingerprintData[0] != 0) {
            await transaction.commit();
            return res.status(httpStatus.OK).json({
                message: "Finger Print successfully added"
            });
        } else {
            if (transaction) await transaction.rollback();
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Please try again.Something went wrong",
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
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

exports.getFingerprintAndManchineData = (req, res, next) => {
    const type = req.params.type;
    const allUserData = [];
    const activatedUserData = [];
    const deactivatedUserData = [];
    console.log("***", type)
    switch (type) {
        case 'all':
            FingerprintData.findAll({
                where: {
                    fingerprintData: { [Op.ne]: null }
                },
                attributes: ['userId']
            })
                .then(fingerprint => {
                    // console.log(fingerprint);
                    const userIds = [];
                    fingerprint.map(item => {
                        userIds.push(item.userId);
                    })
                    const promise = userIds.map(id => {
                        return userHandler(id, activatedUserData)
                    })
                    Promise.all(promise)
                        .then(result => {
                            res.status(httpStatus.OK).json({
                                userData:activatedUserData,
                                // disableFlat:true
                            })

                        }).catch(err => {
                            console.log("errrrr", err);
                        })
                })
            break;
        case 'deactivated':
            // userData.unshift({disabled:true});
            FingerprintData.findAll({
                where: {
                    isActive: false,
                    fingerprintData: { [Op.ne]: null }
                },
                attributes: ['userId']
            })
                .then(fingerprint => {
                    // console.log(fingerprint);
                    const userIds = [];
                    fingerprint.map(item => {
                        userIds.push(item.userId);
                    })
                    // console.log(userIds);
                    const promise = userIds.map(id => {
                        return userHandler(id, deactivatedUserData)
                    })
                    Promise.all(promise)
                        .then(result => {
                            res.status(httpStatus.OK).json({
                                userData:deactivatedUserData,
                                // disableFlat:true
                            })
                        })
                        .catch(error => {
                            console.log(";;;;;;", error);
                        })
                })
            break;
        case 'activated':
            FingerprintData.findAll({
                where: {
                    isActive: true,
                    fingerprintData: { [Op.ne]: null }
                },
                attributes: ['userId']
            })
                .then(fingerprint => {
                    const userIds = [];
                    fingerprint.map(item => {
                        userIds.push(item.userId);
                    })
                    const promise = userIds.map(id => {
                        return userHandler(id, allUserData)
                    })

                    Promise.all(promise)
                        .then(result => {
                            // console.log("&&&&=>", result);
                            res.status(httpStatus.OK).json({
                                userData:allUserData,
                                // disableFlat:true
                            })
                        }).catch(error => {
                            // console.log("&&&&", promise)
                            console.log("error", error);
                        })
                })
            break;
    }

}
//API to add fingerprint data in machine through websocket
exports.enableFingerPrintData = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let serialNumber;
        let socketResponse;
        const userId = parseInt(req.params.userId);
        console.log(userId)
        const update = { isActive: true };
        // var sockets = [];
        const updatedStatus = await FingerprintData.update(update, { where: { userId: userId }, transaction });
        const fingerPrintData = await FingerprintData.findOne({ where: { isActive: true, userId: userId }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] });
        const firstName = decrypt(fingerPrintData.user.firstName);
        const lastName = decrypt(fingerPrintData.user.lastName);
        const fullName = firstName + ' ' + lastName;
        //start connecting websocket server
        wss.on('connection', (socket, req) => {
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                socket.send('connected')
            })
        // }),
        // setTimeout(() => {
        //     res.status(httpStatus.OK).json({
        //         message: "Fingerprint enabled successfully"
        //     })
        //     //Closing socket
        //     socket.on('close', () => { console.log('close') });
        })
        await transaction.commit();
        setTimeout(() => {
            res.status(httpStatus.OK).json({
                message: "Fingerprint enabled successfully"
            })
        }, 5000);
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


//API to disable fingerprint data in machine through websocket
exports.disableFingerPrintData = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const userId = parseInt(req.params.userId);
        console.log("&&&&",userId)
        const update = { isActive: false };
        const updatedStatus = await FingerprintData.update(update, { where: { userId: userId } });
        if (updatedStatus) {
            wss.on('connection', (socket, req) => {
                socket.on('open', () => {
                    console.log('websocket is connected ...')
                    // sending a send event to websocket server
                    socket.send('connected')
                })
                socket.on('message', (message) => {
                    // when machine get connected so we need to send this response
                    let response = { "ret": "reg", "result": true }
                    socket.send(JSON.stringify(response));
                    //command to be send to disable user
                    let disableUser = { "cmd": "enableuser", "enrollid": userId, "enflag": 0 }
                    console.log(socket.send(JSON.stringify(disableUser)));
                    // }
                });
                socket.on('error', (error) => {
                    // console.log("fingerprint api socket error", error);
                })
                //closing socket
                socket.on('close', () => { console.log('close') })
            })
        }
        setTimeout(() => {
            res.status(httpStatus.OK).json({
                message: "Fingerprint disabled successfully"
            })
        }, 5000);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error.message);
    }
}

//
exports.getCurrentFingerprintData = async (req, res, next) => {
    try {
        console.log("***getting current");
        let records = [];
        let count;
        let socketResponse;
        let loopCount = 0;
        wss.on('connection', (socket, req) => {
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
            })
            let response = { "ret": "reg", "result": true }
            let getLogs = { "cmd": "getnewlog", "stn": true }
            socket.on('message', (message) => {
                // console.log("%%%%", message)
                // message1 = message.slice(0,message.lastIndexOf(",")) + message.slice(message.lastIndexOf(",") + 1);
                if (message.indexOf(",]") > -1) {
                    message = message.slice(0, message.lastIndexOf(",")) + message.slice(message.lastIndexOf(",") + 1);
                }
                socketResponse = JSON.parse(message);
                socket.send(JSON.stringify(response));
                socket.send(JSON.stringify(getLogs));
                getLogs.stn = false;
                if (socketResponse.cmd == 'sendlog') {
                    // message = message.slice(0, message.lastIndexOf(",")) + message.slice(message.lastIndexOf(",") + 1);
                    records = socketResponse.record;
                    console.log("records", records)
                    console.log("length0---->", records.length);
                    // if (socketResponse.record.length == 10) {
                    //     socketResponse.record.splice(0, 10);
                    //     console.log("current record ", records)
                    // }
                    console.log(" Records", records);
                    from = socketResponse.from;
                    // console.log("from", from)
                    to = socketResponse.to;
                    // console.log("to", to)
                    count = socketResponse.count;

                    console.log('Count ====>', count);
                    // console.log(loopCount !== count)
                    if (loopCount !== count) {
                        // console.log("inside if")
                        records.map(item => {
                            // console.log("***item",item)
                            loopCount += 1;
                            let body = {
                                userId: item.enrollid,
                                time: item.time,
                                mode: item.mode
                            }
                            // console.log("&&&&body",body)
                            let createdData = PunchedData.findOrCreate({
                                where: {
                                    userId: body.userId,
                                    time: body.time,
                                    mode: item.mode
                                },
                                defaults: body
                            })
                        })
                    }
                }
            })
            // socket.on('close', () => { console.log('close') });
            socket.on('error', (error) => {
                console.log("fingerprint api socket error", error);
            })
        })

    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


// exports.fingerprintDataScheduler = async (req, res, next) => {

//Scheduler for fetching fingerprint data from machine and store into database
let date = new Date(Date.now());
let startTime = date.setHours(1);
let endTime = date.setHours(13);
var rule = new schedule.RecurrenceRule();
// rule.hour = new schedule.Range(0, 59, 1);
//scheduling job
var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/10000 * * * *' }, function () {
    try {
        let records = [];
        let from;
        let to;
        let length;
        let count;
        let loopCount = 0;
        //start connecting to websocket server
        wss.on('connection', (socket, req) => {
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                socket.send('connected')
            })
            let response = { "ret": "reg", "result": true }
            let getLogs = { "cmd": "getalllog", "stn": true }
            socket.on('message', (message) => {
                socketResponse = JSON.parse(message);
                // sending response back to fingerprint machine
                socket.send(JSON.stringify(response));
                socket.send(JSON.stringify(getLogs));
                getLogs.stn = false;
                // getLogs.delete('cmd');

                //Capture data which is coming from fingerprint machine
                if (socketResponse.ret == 'getalllog') {
                    records = socketResponse.record;
                    from = socketResponse.from;
                    to = socketResponse.to;
                    count = socketResponse.count;
                    console.log('Count ====>', count);
                    // length = (length === 1000) ? 1000 : records.length;
                    // console.log('Length --->', length);

                    if (loopCount !== count) {
                        records.map(item => {
                            loopCount += 1;
                            let body = {
                                userId: item.enrollid,
                                time: item.time
                            }
                            //Storing data in database
                            let createdData = FingerprintMachineData.findOrCreate({
                                where: {
                                    userId: body.userId,
                                    time: body.time
                                },
                                defaults: body
                            })
                        })
                    }
                }
            });
            socket.on('close', () => { console.log('close') });
            socket.on('error', (error) => {
                console.log("fingerprint api socket error", error);
            })
        })

    } catch (error) {
        console.log("error==>", error);
        // res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
})

// }

exports.punchedData = async (req, res, next) => {
    try {
        const punchedfingerprint = await PunchedData.findAll({ where: { isActive: true }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
        punchedfingerprint.map(user => {
            user.user.firstName = decrypt(user.user.firstName);
            user.user.lastName = decrypt(user.user.lastName);
            user.user.userName = decrypt(user.user.userName);
            user.user.contact = decrypt(user.user.contact);
            user.user.email = decrypt(user.user.email);
        })
        if (punchedfingerprint) {
            return res.status(httpStatus.CREATED).json({
                message: "Finger Print punched Content Page",
                punchedfingerprint
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.fingerPrintDataByUserId = async (req, res, next) => {
    try {
        const fingerprint = await FingerprintMachineData.findAll({ where: { isActive: true, userId: req.params.userId }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
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

// exports.getPunchData = async (req, res, next) => {
//     try {

//     } catch (error) {
//         console.log("error==>", error);
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
//     }
// }


exports.giveAccessByTenant = async (req, res, next) => {
    try {
        console.log("**tenant")
        const userId = req.userId;
        const memberIds = [];
        console.log("^&%user", userId)
        const type = req.params.type;
        // let roleId;
        // const role = await User.find({ where: { isActive: true, userId: userId }, include: [Role] });
        // role.roles.map(item => {
        //     roleId = item.id
        // }
        // )
        if (type == 'member') {
            const member = await TenantMembersDetail.findAll({ where: { isActive: true, tenantId: userId } });
            member.map(item => {
                memberIds.push(item.memberId);
            })
            console.log("memberId", memberIds)
            const fingerprint = await FingerprintData.findAll({ where: { isActive: true, userId: { [Op.in]: memberIds } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
            if (fingerprint.userId = ! null) {
                fingerprint.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            res.status(httpStatus.OK).json(fingerprint);
        }
        if (type == 'vendor') {
            const vendor = await VendorAllotment.findAll({ where: { isActive: true, booked: true, bookedBy: userId } });
            vendor.map(item => {
                Ids.push(item.individualVendorId);
            })
            const fingerprint = await FingerprintData.findAll({ where: { isActive: true, userId: { [Op.in]: Ids } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
            if (fingerprint.userId = ! null) {
                fingerprint.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            res.status(httpStatus.OK).json(fingerprint);
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.giveAccessByOwner = async (req, res, next) => {
    try {
        const userId = req.userId;
        const Ids = [];
        const memberIds = [];
        const flatIds = [];
        const tenantIds = [];
        const type = req.params.type;
        // let roleId;
        // const role = await User.find({ where: { isActive: true, userId: userId }, include: [Role] });
        // role.roles.map(item => {
        //     roleId = item.id
        // }
        // )
        if (type == 'tenant') {
            const ownerFlat = await OwnerFlatDetail.findAll({ where: { isActive: true, ownerId: userId } });
            ownerFlat.map(item => {
                flatIds.push(item.flatDetailId);
            })
            console.log("flats-- ", flatIds);
            const tenantFlat = await TenantFlatDetail.findAll({ where: { isActive: true, flatDetailId: { [Op.in]: flatIds } } });
            tenantFlat.map(item => {
                tenantIds.push(item.tenantId);
            })
            const fingerprint = await FingerprintData.findAll({ where: { isActive: true, userId: { [Op.in]: tenantIds } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
            if (fingerprint.userId = ! null) {
                fingerprint.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            res.status(httpStatus.OK).json(fingerprint);
        }
        if (type == 'member') {
            const member = await OwnerMembersDetail.findAll({ where: { isActive: true, ownerId: userId } });
            member.map(item => {
                memberIds.push(item.memberId);
            })
            console.log("memberId", memberIds)
            const fingerprint = await FingerprintData.findAll({ where: { isActive: true, userId: { [Op.in]: memberIds } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
            if (fingerprint.userId = ! null) {
                fingerprint.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            res.status(httpStatus.OK).json(fingerprint);
        }
        if (type == 'vendor') {
            const vendor = await VendorAllotment.findAll({ where: { isActive: true, booked: true, bookedBy: userId } });
            vendor.map(item => {
                Ids.push(item.individualVendorId);
            })
            const fingerprint = await FingerprintData.findAll({ where: { isActive: true, userId: { [Op.in]: Ids } }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'userName', 'email', 'contact'], include: [Role] }] });
            if (fingerprint.userId = ! null) {
                fingerprint.map(user => {
                    user.user.firstName = decrypt(user.user.firstName);
                    user.user.lastName = decrypt(user.user.lastName);
                    user.user.userName = decrypt(user.user.userName);
                    user.user.contact = decrypt(user.user.contact);
                    user.user.email = decrypt(user.user.email);
                })
            }
            res.status(httpStatus.OK).json(fingerprint);
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.enableVendorFingerPrintData = async (id) => {
    let serialNumber;
    let socketResponse;
    const userId = parseInt(id);
    const update = { isActive: true };
    // var sockets = [];
    const fingerPrintDataExists = await FingerprintData.findOne({ where: { userId: userId, fingerprintData: { [Op.ne]: null } } });
    if (fingerPrintDataExists) {
        const updatedStatus = await FingerprintData.update(update, { where: { userId: userId } });
        const fingerPrintData = await FingerprintData.findOne({ where: { isActive: true, userId: userId }, include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] });
        const firstName = decrypt(fingerPrintData.user.firstName);
        const lastName = decrypt(fingerPrintData.user.lastName);
        const fullName = firstName + ' ' + lastName;
        //start connecting websocket server
        wss.on('connection', (socket, req) => {
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                socket.send('connected')
            })
            socket.on('message', (message) => {
                socketResponse = JSON.parse(message);
                // when machine get connected so we need to send this response
                let response = { "ret": "reg", "result": true }
                socket.send(JSON.stringify(response));
                let getDeviceInfo = { "cmd": "getdevinfo" }
                socket.send(JSON.stringify(getDeviceInfo));
                if (socketResponse.ret == 'getdevinfo') {
                    serialNumber = socketResponse.sn;
                }
                //response to be send to machine for adding data to machine
                let addUser =
                {
                    "sn": serialNumber,
                    "cmd": "setuserinfo",
                    "enrollid": userId,
                    "name": fullName,
                    "backupnum": 0,
                    "admin": 0,
                    "record": fingerPrintData.fingerprintData
                }
                //send this response to machine
                socket.send(JSON.stringify(addUser));
            });
            socket.on('error', (error) => {
                console.log("fingerprint api socket error", error);
            })
            //Closing socket
            socket.on('close', () => { console.log('close') });
        })
        return true;
    } else {
        return false;
    }
    // setTimeout(() => {
    //     res.status(httpStatus.OK).json({
    //         message: "Fingerprint enabled successfully"
    //     })
    // }, 5000);
}
