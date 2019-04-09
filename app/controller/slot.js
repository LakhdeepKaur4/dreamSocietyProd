const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const sequelize = require('sequelize');

const Slots = db.slot;
const Parking = db.parking;
const Op = db.Sequelize.Op;
const Flat = db.flat;

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
                slots: 'Slot ' + slots,
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
        console.log("req",req.params);
        console.log("slots is running");
        let flat = await Flat.findOne({where:{flatId:req.params.flatId}});
        let flatInteger = parseInt(flat.flatType.slice(0,1)) - 1;

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
                parkingId: req.params.parkingId
            }
        });
        console.log("atin");
        if (slots) {
            return res.status(httpStatus.OK).json({
                message: "You can select " + flatInteger +  ' parking slots',
                slot: slots,
                slotNumbers: flatInteger

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