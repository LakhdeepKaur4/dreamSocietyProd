const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const sequelize = require('sequelize');

const Slots = db.slot;
const Parking = db.parking;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating parking api");
        let body = req.body;
        body.userId = req.userId;
        let slot;
        const start = body.numberOfSlots;
        const parkingId = body.parkingId;
        for (let slots = 1; slots <= start; slots++) {
            slot = await Slots.create({
                slots: slots,
                parkingId: parkingId
            });
        }
        if (slot) {
            res.status(httpStatus.CREATED).json({
                message: "Parking successfully created"
            })
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.get = async (req, res, next) => {
    try {
        console.log("slots is running");
        // const slot = await Slots.findAll({
        //     attributes: ['slots', [sequelize.fn('count', sequelize.col('slots')), 'count']],
        //     include: [{ model: Parking, attributes: ['parkingName'] }],
        //     group: ['slot_master.parkingId'],
        //     order: [['createdAt', 'DESC']],
        //     raw: false,
        //     order: sequelize.literal('count DESC')
        const slots = await Slots.findAll({
            where: {
                isActive: true,
                isAllocated: false,
                parkingId: req.body.parkingId
            }
        });
        console.log("atin");
        if (slots) {
            return res.status(httpStatus.OK).json({
                message: "Slot Content Page",
                slot: slots
            });
        }
    } catch (error) {
        console.log("error-->", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.getItemSaleCount = () => SaleItem.findAll({
    attributes: ['itemId', [sequelize.fn('count', sequelize.col('itemId')), 'count']],
    group: ['SaleItem.itemId'],
    raw: true,
    order: sequelize.literal('count DESC')
});