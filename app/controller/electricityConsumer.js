const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const ElectricityConsumer = db.electricityConsumer;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const MaintenanceType = db.maintenanceType;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating event");
        let body = req.body;
        var nowDate = new Date();
        var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        body.entryDate = date;
        console.log(body.entryDate);
        const exists = await ElectricityConsumer.findOne({
            where: { isActive: true, flatDetailId: body.flatDetailId }
        });
        if (exists) {
            exists.updateAttributes(body);
            return res.status(httpStatus.OK).json({ message: "Electricity Consumer successfully created" });
        }
        body.userId = req.userId;
        // const maintenanceType = await MaintenanceType.findOne({ where: { isActive: true, maintenanceId: 98 } });
        // // const rate = maintenanceType.rate
        // // body.totalConsumption = body.unitConsumed * rate;
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
            include: [{ model: FlatDetail, include: [Tower, Floor] }],
            order: [['createdAt', 'DESC']],
        });
        if (electricityConsumer) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Consumer Content Page",
                electricityConsumer: electricityConsumer
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getByFlatNo = async (req, res, next) => {
    try {
        console.log("***********************");
        const flatDetailId = req.params.id;
        const electricityConsumer = await ElectricityConsumer.findOne({
            where: { isActive: true, flatDetailId: flatDetailId },
            include: [{ model: FlatDetail, include: [Tower, Floor] }],
            order: [['createdAt', 'DESC']],
        });
        console.log("###", electricityConsumer)
        if (electricityConsumer) {
            return res.status(httpStatus.OK).json({
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
        const update = req.body;
        console.log("update body",update);
        var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        update.entryDate = date;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        // console.log("****")
        // const exists = await ElectricityConsumer.findOne({
        //     where: { isActive: true, flatDetailId: update.flatDetailId, electricityConsumerId: { [Op.ne]: id } }
        // })
        // console.log(exists)
        // if (exists) {
        //     return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Already Exists" });
        // }

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
        console.log(error)
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
        const updatedElectricityConsumer = await ElectricityConsumer.update(update, { where: { electricityConsumerId: { [Op.in]: deleteSelected } } })
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

exports.calculateMonthlyCharges = async (req, res, next) => {
    try {
        const body = req.body;
        let monthlyCharges;
        if (!body.unitConsumed && !body.mdi && !body.sanctionedLoad && !body.rate && !body.rent && !body.amountDue) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const numberToBeMultiply = (body.sanctionedLoad < body.mdi) ? body.mdi : body.sanctionedLoad;
        console.log("%%%5 ", numberToBeMultiply)
        const charges = body.unitConsumed * body.rate + body.rent * numberToBeMultiply;
        const amountDue = body.amountDue === true ? monthlyCharges = charges + body.amount : monthlyCharges = charges - body.amount;
        if (monthlyCharges) {
            return res.status(httpStatus.OK).json(
                { monthlyCharges }
            );
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.dateFilter = async (req, res, next) => {
    try {
        const from = req.params.from;
        const to = req.params.to;
        const electricityConsumer = await ElectricityConsumer.findAll({
            where: {
                isActive: true, entryDate: { [Op.between]: [from, to] }
            },
            include: [{ model: FlatDetail, include: [Tower, Floor] }],
            order: [['createdAt', 'DESC']],
        });
        return res.status(httpStatus.OK).json({ electricityConsumer });
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
