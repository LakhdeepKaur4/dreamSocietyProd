const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const UserFacility = db.userFacility;
const Facilities = db.facilities;
const FacilitiesDetails = db.facilitiesDetails;

let filterFacilities = (arr1, arr2) => {
    const resArr = arr1.filter(item => {
        return arr2.includes(item.facilityDetailId) === false;
    })

    return resArr;
}

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const facilitiesUpdated = [];
        const facilities = req.body.facilities;
        console.log('Facilities ===>', facilities);

        const userId = req.userId;
        console.log('ID ===>', userId);

        facilities.map(item => {
            item.userId = userId;
            item.startDate = new Date(Date.now());
            let dateToday = new Date(Date.now());
            if (item.duration === '1 Month') {
                item.endDate = dateToday.setDate(dateToday.getDate() + 30);
            } else if (item.duration === '2 Months') {
                item.endDate = dateToday.setDate(dateToday.getDate() + 60);
            } else if (item.duration === 'Quarterly') {
                item.endDate = dateToday.setDate(dateToday.getDate() + 120);
            } else if (item.duration === 'Half Yearly') {
                item.endDate = dateToday.setDate(dateToday.getDate() + 180);
            } else if (item.duration === 'Yearly') {
                item.endDate = dateToday.setDate(dateToday.getDate() + 360);
            }
            facilitiesUpdated.push(item);
        })
        console.log("______", facilitiesUpdated)
        UserFacility.bulkCreate(facilitiesUpdated, { returning: true }, { transaction })
            .then(userFacilitiesCreated => {
                res.status(httpStatus.CREATED).json({
                    message: 'Facilities added successfully'
                })
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = (req, res, next) => {
    const userId = req.userId;
    console.log('ID ===>', userId);
    UserFacility.findAll({
        where: {
            isActive: true,
            userId: userId
        },
        include: [
            {
                model: FacilitiesDetails, where: { isActive: true },
                include: [
                    { model: Facilities }
                ]
            }
        ]
    })
        .then(facilities => {
            res.status(httpStatus.OK).json({
                facilitiesInUse: facilities
            })
        })
        .catch(err => {
            console.log('Error ===>', err)
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.getNotInUse = (req, res, next) => {
    const userId = req.userId;
    console.log('ID ===>', userId);

    FacilitiesDetails.findAll({
        where: {
            isActive: true
        },
        include: [
            { model: Facilities }
        ]
    })
        .then(async facilities => {
            const usedFacilities = await UserFacility.findAll({
                where: {
                    isActive: true,
                    userId: userId
                }
            });

            const usedFacilitiesIds = [];

            usedFacilities.map(item => {
                usedFacilitiesIds.push(item.facilityDetailId);
            })

            const facilitiesSend = filterFacilities(facilities, usedFacilitiesIds);
            res.status(httpStatus.OK).json({
                facilitiesNotInUse: facilitiesSend
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const userId = req.userId;
        console.log('ID ===>', userId);

        const facilities = req.body.facilities;
        console.log('Facilities ===>', facilities);

        const promise = facilities.map(item => {
            UserFacility.findOne({
                where: {
                    userId: userId,
                    facilityDetailId: item.facilityDetailId
                }
            })
                .then(async userFacility => {
                    userFacility.updateAttributes(item, transaction);
                })
        })

        Promise.all(promise)
            .then(async result => {
                await transaction.commit();
                res.status(httpStatus.CREATED).json({
                    message: 'Facilities updated successfully'
                });
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
