const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
var crypto = require('crypto');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: config.machinePort, perMessageDeflate: false });

const FingerprintData = db.fingerprintData;
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
const Machine = db.machine;
const MachineDetail = db.machineDetail;

const Role = db.role;
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
    try {
        const update = req.body;
        console.log("update----->", update);
        update.fingerprintData = req.body.fingerPrintData;
        const userId = req.params.userId;
        const fingerprintData = await FingerprintData.update(update, { where: { userId: userId } });
        if (fingerprintData[0] != 0) {
            return res.status(httpStatus.OK).json({
                message: "Finger Print successfully added"
            });
        } else {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
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

exports.getFingerprintAndManchineData = (req, res, next) => {
    // console.log(1)
    const userData = [];
    // userData.unshift({disabled:true});
    FingerprintData.findAll({
        where: {
            [Op.and]: [
                { isActive: true },
                { fingerprintData: { [Op.ne]: null } }
            ]
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

            const promise = userIds.map(async id => {
                await User.findOne({
                    where: {
                        userId: id,
                        // isActive: true
                    },
                    include: [
                        { model: Role }
                    ]
                })
                    .then(async user => {
                        if (user !== null) {
                            user = user.toJSON();
                            user.firstName = decrypt(user.firstName);
                            user.lastName = decrypt(user.lastName);
                            user.userName = decrypt(user.userName);
                            user.contact = decrypt(user.contact);
                            user.email = decrypt(user.email);
                            user.flatDisable = true;
                            const flatIds = [];
                            if (user.roles.length === 1) {
                                if (user.roles[0].id === 3) {
                                    const OwnerFlats = await OwnerFlatDetail.findAll({
                                        where: {
                                            ownerId: user.userId
                                        },
                                        attributes: ['flatDetailId']
                                    })

                                    if (OwnerFlats.length !== 0) {
                                        OwnerFlats.map(item => {
                                            flatIds.push(item.flatDetailId);
                                        })
                                    }
                                    else {
                                        const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                            where: {
                                                memberId: user.userId
                                            },
                                            attributes: ['flatDetailId']
                                        })

                                        if (OwnerMemberFlat !== null) {
                                            flatIds.push(OwnerMemberFlat.flatDetailId);
                                        }
                                    }
                                    const Flats = await FlatDetail.findAll({
                                        where: {
                                            flatDetailId: {
                                                [Op.in]: flatIds
                                            }
                                        }
                                    })
                                    user.flats = Flats;
                                }

                                if (user.roles[0].id === 4) {
                                    const TenantFlats = await TenantFlatDetail.findAll({
                                        where: {
                                            tenantId: user.userId
                                        },
                                        attributes: ['flatDetailId']
                                    })

                                    if (TenantFlats.length !== 0) {
                                        TenantFlats.map(item => {
                                            flatIds.push(item.flatDetailId);
                                        })
                                    }
                                    else {
                                        const TenantMemberFlat = await TenantMembersDetail.findOne({
                                            where: {
                                                memberId: user.userId
                                            },
                                            attributes: ['flatDetailId']
                                        })

                                        if (TenantMemberFlat !== null) {
                                            flatIds.push(TenantMemberFlat.flatDetailId);
                                        }
                                    }
                                    const Flats = await FlatDetail.findAll({
                                        where: {
                                            flatDetailId: {
                                                [Op.in]: flatIds
                                            }
                                        }
                                    })
                                    user.flats = Flats;
                                }
                            }

                            if (user.roles.length === 2) {
                                if (user.roles[1].id === 3) {
                                    const OwnerFlats = await OwnerFlatDetail.findAll({
                                        where: {
                                            ownerId: user.userId
                                        },
                                        attributes: ['flatDetailId']
                                    })

                                    if (OwnerFlats.length !== 0) {
                                        OwnerFlats.map(item => {
                                            flatIds.push(item.flatDetailId);
                                        })
                                    }
                                    else {
                                        const OwnerMemberFlat = await OwnerMembersDetail.findOne({
                                            where: {
                                                memberId: user.userId
                                            },
                                            attributes: ['flatDetailId']
                                        })

                                        if (OwnerMemberFlat !== null) {
                                            flatIds.push(OwnerMemberFlat.flatDetailId);
                                        }
                                    }
                                    const Flats = await FlatDetail.findAll({
                                        where: {
                                            flatDetailId: {
                                                [Op.in]: flatIds
                                            }
                                        }
                                    })
                                    user.flats = Flats;
                                }

                                if (user.roles[1].id === 4) {
                                    const TenantFlats = await TenantFlatDetail.findAll({
                                        where: {
                                            tenantId: user.userId
                                        },
                                        attributes: ['flatDetailId']
                                    })

                                    if (TenantFlats.length !== 0) {
                                        TenantFlats.map(item => {
                                            flatIds.push(item.flatDetailId);
                                        })
                                    }
                                    else {
                                        const TenantMemberFlat = await TenantMembersDetail.findOne({
                                            where: {
                                                memberId: user.userId
                                            },
                                            attributes: ['flatDetailId']
                                        })

                                        if (TenantMemberFlat !== null) {
                                            flatIds.push(TenantMemberFlat.flatDetailId);
                                        }
                                    }
                                    const Flats = await FlatDetail.findAll({
                                        where: {
                                            flatDetailId: {
                                                [Op.in]: flatIds
                                            }
                                        }
                                    })
                                    user.flats = Flats;
                                }
                            }
                            userData.push(user);
                        }
                    })
            })

            Promise.all(promise)
                .then(result => {
                    console.log("&&&&=>", userData);
                    res.status(httpStatus.OK).json({
                        userData,
                        // disableFlat:true
                    })
                })
        })

}

exports.enableFingerPrintData = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const update = { isActive: true };
        // var sockets = [];
        const updatedStatus = await FingerprintData.update(update, { where: { userId: userId } });
        wss.on('connection', (socket, req) => {
            // sockets.push(socket);
            // console.log("Sockets ",sockets)
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                socket.send('connected')
                // console.log("connected");
            })
            socket.on('message', (message) => {
                // for (var i = 0; i < sockets.length; i++) {
                // Don't send the data back to the original sender
                // if (sockets[i] == socket)
                // continue;
                console.log(`Received message => ${message}`)
                // when machine get connected so we need to send this response
                let response = { "ret": "reg", "result": true }
                socket.send(JSON.stringify(response));
                let getDeviceInfo = {
                    "cmd": "getdevinfo"
                }
                socket.send(JSON.stringify(getDeviceInfo));
                console.log("completed");
                let getUserInfo = {
                    "cmd": "getuserinfo", "enrollid": userId
                }

                console.log("here in user info", getUserInfo)
                let enableUser = { "cmd": "enableuser", "enrollid": userId, "enflag": 1 }
                console.log("enabling user ===>")
                socket.send(JSON.stringify(enableUser));
                // }
            });
            socket.on('error', (error) => {
                console.log("fingerprint api socket error", error);
            })
            socket.on('close', () => { console.log('close') })
            // socket.send('hello this is just for testing!')
        })
        setTimeout(() => {
            res.status(httpStatus.OK).json({
                message: "Fingerprint enabled successfully"
            })
        }, 3000);
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.disableFingerPrintData = async (req, res, next) => {
    try {
        console.log("**disabling ")
        const userId = parseInt(req.params.userId);
        const update = { isActive: true };
        // var sockets = [];
        const updatedStatus = await FingerprintData.update(update, { where: { userId: userId } });
        wss.on('connection', (socket, req) => {
            // sockets.push(socket);
            // console.log("Sockets ",sockets)
            socket.on('open', () => {
                console.log('websocket is connected ...')
                // sending a send event to websocket server
                socket.send('connected')
                // console.log("connected");
            })
            socket.on('message', (message) => {
                console.log(`Received message => ${message}`)
                // when machine get connected so we need to send this response
                let response = { "ret": "reg", "result": true }
                socket.send(JSON.stringify(response));
                let getDeviceInfo = {
                    "cmd": "getdevinfo"
                }
                socket.send(JSON.stringify(getDeviceInfo));
                console.log("completed");
                let getUserInfo = {
                    "cmd": "getuserinfo", "enrollid": userId
                }

                console.log("here in user info", getUserInfo)
                let disableUser = { "cmd": "enableuser", "enrollid": userId, "enflag": 0 }
                console.log("disabling user ===>")
                socket.send(JSON.stringify(disableUser));
                // }
            });
            socket.on('error', (error) => {
                console.log("fingerprint api socket error", error);
            })
            socket.on('close', () => { console.log('close') })
            // socket.send('hello this is just for testing!')
        })
        setTimeout(() => {
            res.status(httpStatus.OK).json({
                message: "Fingerprint disabled successfully"
            })
        }, 3000);
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}