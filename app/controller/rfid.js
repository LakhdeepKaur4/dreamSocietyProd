const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const RFID = db.rfid;
const Tenant = db.tenant;
const TenantMembersDetail = db.tenantMembersDetail;
const Owner = db.owner;
const OwnerMembersDetail = db.ownerMembersDetail;
const UserRFID = db.userRfid;


let filterItem = (rfids, arr) => {
    // console.log(arr);
    const resArr = rfids.filter(item => {
        return arr.includes(item.rfidId) === false;
    });
    // console.log(resArr);
    return resArr;
}

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.userId = req.userId;
        console.log('Body ===>', body);

        RFID.findOne({
            where: {
                rfid: body.rfid,
                isActive: true
            }
        })
            .then(rfid => {
                if (rfid !== null) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Already exist'
                    })
                } else {
                    RFID.create(body, transaction)
                        .then(async rfid => {
                            if (rfid !== null) {
                                await transaction.commit();
                                res.status(httpStatus.CREATED).json({
                                    message: 'Created'
                                })
                            } else {
                                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Not created'
                                })
                            }
                        })
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }

}

exports.get = (req, res, next) => {
    RFID.findAll({
        where: {
            isActive: true
        }
    })
        .then(rfids => {
            if (rfids.length !== 0) {
                res.status(httpStatus.OK).json({
                    RFIDs: rfids
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'No data available'
                })
            }
        })
        .catch(err => {
            console.log('Error', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.rfidId = req.params.id;
        console.log('Body ===>', body);
        RFID.findOne({
            where: { rfid: body.rfid, isActive: true, rfidId: { [Op.ne]: body.rfidId } }
        })
            .then((rfid) => {
                if (rfid !== null) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'RFID already exist!'
                    })
                }
                else {
                    RFID.findOne({
                        where: { rfidId: body.rfidId, isActive: true }
                    })
                        .then(async (rfid) => {
                            if (rfid !== null) {
                                rfid.updateAttributes(body, transaction);
                                await transaction.commit();
                                res.status(httpStatus.CREATED).json({
                                    message: 'Updated successfully!'
                                })
                            }
                            else {
                                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Data not available!'
                                })
                            }
                        })
                        .catch(async (err) => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                        })
                }
            })
            .catch(async (err) => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const rfidId = req.params.id;
        console.log('ID ===>', rfidId);
        RFID.findOne({
            where: {
                rfidId: rfidId,
                isActive: true
            }
        })
            .then(async rfid => {
                if (rfid !== null) {
                    rfid.updateAttributes({ isActive: false }, transaction);
                    await transaction.commit();
                    res.status(httpStatus.OK).json({
                        message: 'Deleted successfully'
                    })
                } else {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Not deleted'
                    })
                }
            })
            .catch(async err => {
                console.log('Error ===>', err);
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const rfidIds = req.body.ids;
        console.log('IDs ===>', rfidIds);

        RFID.findAll({
            where: {
                rfidId: {
                    [Op.in]: rfidIds
                },
                isActive: true
            }
        })
            .then(async rfids => {
                if (rfids.length !== 0) {
                    rfids.map(item => {
                        item.updateAttributes({ isActive: false }, transaction)
                    })
                    await transaction.commit();
                    res.status(httpStatus.OK).json({
                        message: 'Deleted successfully'
                    })
                } else {
                    res.status(httpStatus.NO_CONTENT).json({
                        message: 'No data found'
                    })
                }
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getRFID = (req, res, next) => {
    const rfidsArr = [];
    RFID.findAll({
        where: {
            isActive: true
        }
    })
        .then(rfids => {
            if (rfids.length !== 0) {
                Tenant.findAll({
                    where: {
                        isActive: true
                    },
                    attributes: ['rfidId']
                })
                    .then(tenantRFIDs => {
                        if (tenantRFIDs.length !== 0) {
                            tenantRFIDs.map(item => {
                                rfidsArr.push(item.rfidId);
                            })
                            TenantMembersDetail.findAll({
                                where: {
                                    isActive: true
                                },
                                attributes: ['rfidId']
                            })
                                .then(tenantmembersRFIDs => {
                                    if (tenantmembersRFIDs.length !== 0) {
                                        tenantmembersRFIDs.map(item => {
                                            rfidsArr.push(item.rfidId);
                                        })
                                        sendRFIDs = filterItem(rfids, rfidsArr);
                                        res.status(httpStatus.OK).json({
                                            rfids: sendRFIDs
                                        })
                                    } else {
                                        sendRFIDs = filterItem(rfids, rfidsArr);
                                        res.status(httpStatus.OK).json({
                                            rfids: sendRFIDs
                                        })
                                    }
                                })
                                .catch(err => {
                                    console.log('Error ===>', err);
                                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                                })
                        } else {
                            res.status(httpStatus.OK).json({
                                rfids: rfids
                            })
                        }
                    })
                    .catch(err => {
                        console.log('Error ===>', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                    })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data available!'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}

exports.getRFIDByAll = (req, res, next) => {
    const rfidsArr = [];
    RFID.findAll({
        where: {
            isActive: true
        }
    })
        .then(async rfids => {
            if (rfids.length !== 0) {
                userRFIDs = await UserRFID.findAll({ where: { isActive: true }, attributes: ['rfidId'] });

                userRFIDs.map(item => {
                    rfidsArr.push(item.rfidId);
                })

                sendRFIDs = filterItem(rfids, rfidsArr);
                res.status(httpStatus.OK).json({
                    rfids: sendRFIDs
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data available!'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}