var schedule = require('node-schedule');
let date = new Date(Date.now());
let startTime = date.setHours(15);
let endTime = date.setHours(18);
const db = require('../config/db.config.js');
const FlatDetail = db.flatDetail;
const Flat = db.flat;
const MaintenanceCharges = db.maintenanceCharges;
const MaintenanceType = db.maintenanceType;
const Maintenance = db.maintenance;
const Meter = db.meter;
const MeterDetail = db.meterDetail;
const Tower = db.tower;
const Floor = db.floor;
const Op = db.Sequelize.Op;
const httpStatus = require('http-status');

schedule.scheduleJob({ hour: 23, minute: 59, dayOfMonth: 1 }, async function () {
    let dateToday = new Date(Date.now());
    console.log(dateToday.toLocaleDateString())
    // var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
    var nextMonth = new Date();
    nextMonth.setMonth(0);
    let chargesArr = [];
    await MaintenanceType.findOne({
        where: {
            maintenanceTypeId: 2,
            isActive: true
        },
        order: [['createdAt', 'DESC']]
    }).then(async (resp) => {
        let presentRate = resp.rate;
        await FlatDetail.findAll({
            where: {
                isActive: true,
            },
            attributes: ['flatDetailId'],
            include: [
                { model: Flat, attributes: ['flatSuperArea'] }
            ]
        })
            .then((flats) => {
                flats.map(flat => {
                    flat = flat.toJSON();
                    flat['rate'] = presentRate;
                    flat['superArea'] = flat.flat_master.flatSuperArea;
                    delete flat['flat_master'];
                    flat['charges'] = parseFloat(flat.rate * flat.superArea);
                    flat['maintenanceTypeId'] = resp.maintenanceTypeId;
                    flat['from'] = dateToday.toLocaleDateString();
                    flat['to'] = nextMonth.toLocaleDateString();
                    chargesArr.push(flat);
                })
            })
        if (chargesArr) {
            const maintenanceCharges = await MaintenanceCharges.bulkCreate(
                chargesArr, {
                returning: true
            }, {
                fields: ["rate", "superArea", "charges", "flatDetailId", "maintenanceTypeId", "from", "to"]
                // updateOnDuplicate: ["name"]
            }
            );
            // res.json(maintenanceCharges);
        }
    })
})

exports.calculateMaintenanceCharges = async (req, res, next) => {
    try {
        let dateToday = new Date(Date.now());
        console.log(dateToday.toLocaleDateString())
        // var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        var nextMonth = new Date();
        nextMonth.setMonth(0);
        let chargesArr = [];
        await MaintenanceType.findOne({
            where: {
                maintenanceTypeId: 2,
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        }).then(async (resp) => {
            let presentRate = resp.rate;
            await FlatDetail.findAll({
                where: {
                    isActive: true,
                },
                attributes: ['flatDetailId'],
                include: [
                    { model: Flat, attributes: ['flatSuperArea'] }
                ]
            })
                .then((flats) => {
                    flats.map(flat => {
                        flat = flat.toJSON();
                        flat['rate'] = presentRate;
                        flat['superArea'] = flat.flat_master.flatSuperArea;
                        delete flat['flat_master'];
                        flat['charges'] = parseFloat(flat.rate * flat.superArea);
                        flat['maintenanceTypeId'] = resp.maintenanceTypeId;
                        flat['from'] = dateToday.toLocaleDateString();
                        flat['to'] = nextMonth.toLocaleDateString();
                        chargesArr.push(flat);
                    })
                })
            if (chargesArr) {
                const maintenanceCharges = await MaintenanceCharges.bulkCreate(
                    chargesArr, {
                    returning: true
                }, {
                    fields: ["rate", "superArea", "charges", "flatDetailId", "maintenanceTypeId", "from", "to"]
                    // updateOnDuplicate: ["name"]
                }
                );
                res.json(maintenanceCharges);
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getMaintenanceCharges = async (req, res, next) => {
    try {
        const towerId = req.params.towerId;
        MaintenanceCharges.findAll({
            where: {
                isActive: true,
            },
            include: [{ model: MaintenanceType, include: [Maintenance] }, { model: FlatDetail, where: { towerId: towerId }, include: [{ model: Tower }, Floor] }]
        })
            .then(charges => {
                if (charges.length !== 0) {
                    res.status(httpStatus.OK).json({
                        charges
                    })
                } else {
                    res.status(httpStatus.NOT_FOUND).json({
                        charges
                    })
                }
            })
            .catch(err => {
                console.log('Error ===>', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
