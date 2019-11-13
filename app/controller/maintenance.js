const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const Maintenance = db.maintenance;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating maintenance");
        let body = req.body;
        body.userId = req.userId;

        const maintenances = await Maintenance.findAll({
            where: {
                isActive: true
            }
        })
        let error = maintenances.some(maintenance => {
            return maintenance.category.toLowerCase().replace(/ /g, '') == req.body.category.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Maintainance Name already Exists" })
        }
        const maintenance = await Maintenance.create(body,transaction);
        await transaction.commit();
        if (maintenance) {
            return res.status(httpStatus.CREATED).json({
                message: "Maintenance successfully created",
                maintenance
            });
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const maintenance = await Maintenance.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
        });
        if (maintenance) {
            return res.status(httpStatus.CREATED).json({
                message: "Maintenance Content Page",
                maintenance: maintenance
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("update maintenance")
        const id = req.params.id;
        const update = req.body;
        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const maintenance = await Maintenance.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { maintenanceId: id },
                ]
            }
        })

        if (maintenance.category === update.category) {
            const updatedMaintenance = await Maintenance.find({ where: { maintenanceId: id } }).then(maintenance => {
                return maintenance.updateAttributes(update,transaction)
            })
            await transaction.commit();
            if (updatedMaintenance) {
                return res.status(httpStatus.OK).json({
                    message: "Maintainance Updated Page",
                    updatedMaintenance: updatedMaintenance
                });
            }
        } else {
            const maintenances = await Maintenance.findAll({
                where: {
                    isActive: true
                }
            })
            let error = maintenances.some(maintenance => {
                return maintenance.category.toLowerCase().replace(/ /g, '') == req.body.category.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Maintainance Name already Exists" })
            }

            console.log("update==>", update)
            if (!update) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
            }
            const updatedMaintenance = await Maintenance.find({ where: { maintenanceId: id } }).then(maintenance => {
                return maintenance.updateAttributes(update,transaction)
            })
            await transaction.commit();
            if (updatedMaintenance) {
                return res.status(httpStatus.OK).json({
                    message: "Maintenance Updated Page",
                    updatedMaintenance
                });
            }
        }
    } catch (error) {
        if(transaction) await transaction.rollback()
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
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedMaintenance = await Maintenance.find({ where: { maintenanceId: id } }).then(maintenance => {
            return maintenance.updateAttributes(update,transaction);
        })
        await transaction.commit();
        if (updatedMaintenance) {
            return res.status(httpStatus.OK).json({
                message: "Maintenance deleted successfully",
                updatedMaintenance
            });
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedMaintenance = await Maintenance.update(update, { where: { maintenanceId: { [Op.in]: deleteSelected } },transaction })
        await transaction.commit();
        if (updatedMaintenance) {
            return res.status(httpStatus.OK).json({
                message: "Maintenance deleted successfully",
            });
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}