const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const Parking = db.parking;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        let body = req.body;
        body.userId = req.userId;
        console.log("body==>", body);
        const parking = await Parking.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Parking successfully created",
            parking
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.get = async (req, res, next) => {
    try {
        const parking = await Parking.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });
        if (parking) {
            return res.status(httpStatus.CREATED).json({
                message: "Parking Content Page",
                parking: parking
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


