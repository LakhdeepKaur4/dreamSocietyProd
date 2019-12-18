const db = require('../config/db.config.js');
const FlatDetail = db.flatDetail;
const Flat = db.flat;
const ElectricityCharges = db.electricityCharges;
const Meter = db.meter;
const MeterDetail = db.meterDetail;
const MaintenanceType = db.maintenanceType;
const Maintenance = db.maintenance;
const Tower = db.tower;
const Floor = db.floor;
const Op = db.Sequelize.Op;
const httpStatus = require('http-status');

exports.calculateElectricityMaintenanceCharges = async (req, res, next) => {
    try {
        let dateToday = new Date(Date.now());
        // var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        var nextMonth = new Date();
        nextMonth.setMonth(0);
        let chargesArr = [];
        await MaintenanceType.findOne({
            where: {
                maintenanceTypeId: 1,
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        }).then(async (resp) => {
            let presentRate = resp.rate;
            await Meter.findAll({
                where: {
                    isActive: true,
                },
                include: [
                    { model: MeterDetail },
                    // { model: FlatDetail },
                ]
            })
                .then((meters) => {
                    meters.map(meter => {
                        meter = meter.toJSON();
                        meter['rate'] = presentRate;
                        meter['meterDetailId'] = meter.meterDetailId;
                        meter['flatDetailId'] = meter.flatDetailId;
                        meter['maintenanceTypeId'] = resp.maintenanceTypeId;
                        meter['initialReading'] = meter.meter_detail_master.initialReading;
                        meter['lastReadingDate'] = meter.meter_detail_master.createdAt.toLocaleDateString();
                        delete meter['meter_detail_master'];
                        chargesArr.push(meter);
                    })
                })
            if (chargesArr) {
                const electricityCharges = await ElectricityCharges.bulkCreate(
                    chargesArr, {
                    returning: true
                }
                );
                res.json(electricityCharges);
            }
        })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log("id==>", id);
        const update = req.body;
        console.log("update body", update);
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        var nowDate = new Date();
        var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        update.entryDate = date;
        const updatedElectricityCharges = await ElectricityCharges.find({ where: { electricityChargesId: id } }).then(electricity => {
            return electricity.updateAttributes(update, transaction);
        })
        await transaction.commit();
        if (updatedElectricityCharges) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Charges Updated Page",
                updatedElectricityCharges
            });
        }
    } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.get = async (req, res, next) => {
    try {
        const towerId = req.params.towerId;
        const electricityCharges = await ElectricityCharges.findAll({
            where: { isActive: true },
            include: [{ model: FlatDetail, where: { towerId: towerId }, include: [Tower, Floor] }, { model: MaintenanceType }],
            order: [['createdAt', 'DESC']],
        });
        if (electricityCharges) {
            return res.status(httpStatus.OK).json({
                message: "Electricity Charges Content Page",
                electricityCharges
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}