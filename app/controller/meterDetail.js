const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const MeterDetail = db.meterDetail;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();     
        let body = req.body;
        body.userId = req.userId;

        const meters = await MeterDetail.findAll({
            where: {
                isActive: true
            }
        });
        let error = meters.some(meter => {
            return meter.meterName.toLowerCase().replace(/ /g, '') == req.body.meterName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Meter Name already Exists" })
        }
        const meter = await MeterDetail.create(body, transaction);
        await transaction.commit();
        if (meter) {
            return res.status(httpStatus.CREATED).json({
                message: "Meter successfully created",
                meter
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const meter = await MeterDetail.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
        if (meter) {
            return res.status(httpStatus.CREATED).json({
                message: "Meter Content Page",
                meter
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        const update = req.body;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const meters = await MeterDetail.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { meterDetailId: id },
                ]
            }
        })

        if (meters.meterName === update.meterName) {
            const updatedMeter = await MeterDetail.find({ where: { meterDetailId: id } }).then(meter => {
                return meter.updateAttributes(update, transaction);
            })
            await transaction.commit();
            if (updatedMeter) {
                return res.status(httpStatus.OK).json({
                    message: "Meter Updated Page",
                    updatedMeter: updatedMeter
                });
            }
        } else {
            const meters = await MeterDetail.findAll({
                where: {
                    isActive: true
                }
            })
            let error = meters.some(meter => {
                return meter.meterName.toLowerCase().replace(/ /g, '') == req.body.meterName.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Meter Name already Exists" })
            }

            const updatedMeter = await MeterDetail.find({ where: { meterDetailId: id } }).then(meter => {
                return meter.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedMeter) {
                return res.status(httpStatus.OK).json({
                    message: "Meter Updated Page",
                    updatedMeter
                });
            }
        }
    } catch (error) {
        console.log(":::::", error)
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = { isActive: false };
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedMeter = await MeterDetail.find({ where: { meterDetailId: id } }).then(meter => {
            return meter.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (updatedMeter) {
            return res.status(httpStatus.OK).json({
                message: "Meter deleted successfully",
                updatedMeter
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedMeter = await MeterDetail.update(update, { where: { meterDetailId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedMeter) {
            return res.status(httpStatus.OK).json({
                message: "Meters deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}