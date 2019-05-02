const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const ElectricityConsumer = db.electricityConsumer;

exports.create = async (req, res, next) => {
    try {
        console.log("creating event");
        let body = req.body;
        body.userId = req.userId;
        const electricityConsumer = await ElectricityConsumer.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Electricity Consumer successfully created",
            electricityConsumer
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const electricityConsumer = await ElectricityConsumer.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
        });
        if (electricityConsumer) {
            return res.status(httpStatus.CREATED).json({
                message: "Electricity Consumer Content Page",
                electricityConsumer: electricityConsumer
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;

        console.log("id==>", id);
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedElectricityConsumer = await ElectricityConsumer.find({ where: { electricityConsumerId: id } }).then(electricity => {
            return electricity.updateAttributes(update)
        })
        if (updatedElectricityConsumer) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Consumer Updated Page",
                updatedElectricityConsumer
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
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
        const updatedElectricityConsumer = await ElectricityConsumer.find({ where: { electricityConsumerId: id } }).then(electricityConsumer => {
            return electricityConsumer.updateAttributes(update)
        })
        if (updatedElectricityConsumer) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Consumer deleted successfully",
                updatedElectricityConsumer
            });
        }
    } catch (error) {
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
        const updatedElectricityConsumer = await updatedElectricityConsumer.update(update, { where: { electricityConsumerId: { [Op.in]: deleteSelected } } })
        if (updatedElectricityConsumer) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Consumer deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
