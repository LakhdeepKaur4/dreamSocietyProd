const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const MaintenanceType = db.maintenanceType;
const Maintenance = db.maintenance;
const Size = db.size;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating maintenance");
        let body = req.body;
        body.userId = req.userId;

        const maintenanceTypes = await MaintenanceType.findAll({
            where: {
                isActive: true,
                startDate: body.startDate,
                endDate: body.endDate
            }
        })
        if (maintenanceTypes) {
            let error = maintenanceTypes.some(maintenance => {
                if (maintenance.maintenanceId == req.body.maintenanceId && maintenance.sizeId == req.body.sizeId)
                    return true;
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Maintainance Name already Exists" })
            }
        }
        const maintenance = await MaintenanceType.create(body, transaction);
        await transaction.commit();
        if (maintenance) {
            return res.status(httpStatus.CREATED).json({
                message: "Maintenance successfully created",
                maintenance
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getMaintenanceForElectricity = async (req, res, next) => {
    try {
        const maintenance = await Maintenance.findOne({
            where: {
                isActive: true,
                category: {
                    [Op.like]: '%Electricity%'
                }
            }
        })

        const maintenanceType = await MaintenanceType.findAll({
            where: {
                isActive: true,
                maintenanceId: maintenance.maintenanceId
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Size },
                { model: Maintenance }
            ]
        });
        if (maintenanceType) {
            return res.status(httpStatus.CREATED).json({
                message: "Maintenance Type Content Page",
                maintenanceType: maintenanceType
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const maintenanceType = await MaintenanceType.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Size },
                { model: Maintenance }
            ]
        });
        if (maintenanceType) {
            return res.status(httpStatus.CREATED).json({
                message: "Maintenance Type Content Page",
                maintenanceType: maintenanceType
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
        console.log("maintenannce>>")
        const id = req.params.id;
        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        console.log("update==>", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const alreadyExist = await MaintenanceType.findOne({ where: { isActive: true, maintenanceId: update.maintenanceId, sizeId: update.sizeId, startDate: update.startDate, endDate: update.endDate, maintenanceTypeId: { [Op.ne]: id } } });

        if (alreadyExist !== null) {
            console.log(alreadyExist.rate)
            console.log(update.rate)
            if (alreadyExist.rate != update.rate) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Maintenance Type already exist'
                })
            }
        } else {
            const updatedMaintenanceType = await MaintenanceType.find({ where: { maintenanceTypeId: id } }).then(maintenanceType => {
                return maintenanceType.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedMaintenanceType) {
                return res.status(httpStatus.OK).json({
                    message: "Maintenance Type Updated Page",
                    updatedMaintenanceType
                });
            }
        }
    } catch (error) {
        console.log(error);
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
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedMaintenanceType = await MaintenanceType.find({ where: { maintenanceTypeId: id } }).then(maintenanceType => {
            return maintenanceType.updateAttributes(update, transaction);
        })
        await transaction.commit();
        if (updatedMaintenanceType) {
            return res.status(httpStatus.OK).json({
                message: "Maintenance Type deleted successfully",
                updatedMaintenanceType
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("maintenance Type delete");
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedMaintenanceType = await MaintenanceType.update(update, { where: { maintenanceTypeId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedMaintenanceType) {
            return res.status(httpStatus.OK).json({
                message: "Maintenance Types deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}