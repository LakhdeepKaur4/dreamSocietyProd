const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const Op = db.Sequelize.Op;

const Meter = db.meter;
const MeterDetail = db.meterDetail;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.userId = req.userId;

        Meter.findOne({
            where: {
                meterDetailId: body.meterDetailId,
                flatDetailId: body.flatDetailId,
                isActive: true
            }
        })
            .then(machineExisting => {
                if (machineExisting !== null) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Meter already in use for another flat'
                    })
                } else {
                    Meter.create(body, transaction)
                        .then(async meter => {
                            await transaction.commit();
                            if (meter !== null) {
                                res.status(httpStatus.CREATED).json({
                                    message: 'Meter registered successfully'
                                })
                            } else {
                                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Meter registeration not successful'
                                })
                            }
                        })
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.get = async (req, res, next) => {
    try {
        Meter.findAll({
            where: {
                isActive: true
            },
            include: [
                {
                    model: FlatDetail,
                    where: { isActive: true },
                    include: [
                        { model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
                        { model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
                    ]
                },
                { model: MeterDetail, where: { isActive: true } }
            ]
        })
            .then(meters => {
                if (meters.length !== 0) {
                    res.status(httpStatus.OK).json({
                        Meters: meters
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
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.update = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.meterId = req.params.id;
        console.log('Body ===>', body);

        Meter.findOne({
            where: {
                meterDetailId: body.meterDetailId,
                flatDetailId: body.flatDetailId,
                isActive: true,
                meterId: {
                    [Op.ne]: body.meterId
                }
            }
        })
            .then(meterExisting => {
                if (meterExisting !== null) {
                    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Meter already in use for another flat'
                    })
                } else {
                    Meter.findOne({
                        where: {
                            meterId: body.meterId,
                            isActive: true
                        }
                    })
                        .then(async meter => {
                            if (meter !== null) {
                                if (body.meter !== undefined) {
                                    delete body.meter;
                                }
                                if (body.flatDetailId !== undefined && (body.flatDetailId === '' || body.flatDetailId === null)) {
                                    delete body.flatDetailId;
                                }
                                meter.updateAttributes(body, transaction);
                                await transaction.commit();
                                return res.status(httpStatus.OK).json({
                                    message: 'Meter updated successfully'
                                })
                            } else {
                                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Meter updation not successful'
                                })
                            }
                        })
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }

}



exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const meterId = req.params.id;

        Meter.findOne({
            where: {
                meterId: meterId,
                isActive: true
            }
        })
            .then(async meter => {
                if (meter !== null) {
                    meter.updateAttributes({ isActive: false }, transaction);
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
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
        const meterIds = req.body.ids;

        Meter.findAll({
            where: {
                meterId: {
                    [Op.in]: meterIds
                },
                isActive: true
            }
        })
            .then(async meters => {
                if (meters.length !== 0) {
                    meters.map(item => {
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
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}