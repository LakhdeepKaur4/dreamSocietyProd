const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const Facilities = db.facilities;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const facility = req.body;
        console.log('Facility ===>', facility);

        Facilities.findAll({
            where: {
                isActive: true
            }
        })
            .then(facilities => {
                let found;
                facilities.map(item => {
                    if (item.facilityName.toLowerCase().replace(/ /g, '') === facility.facilityName.toLowerCase().replace(/ /g, '')) {
                        found = true;
                        // break;
                    }
                })

                if (found === true) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Already exist!'
                    });
                } else {
                    Facilities.create(facility, transaction)
                        .then(async facilityCreated => {
                            if (facilityCreated !== null) {
                                await transaction.commit();
                                res.status(httpStatus.CREATED).json({
                                    message: 'Created Successfully'
                                });
                            }
                        })
                        .catch(err => {
                            console.log('Error ===>', err);
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(async err => {
                console.log('Error ===>', err);
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log('ID ===>', id);

        const facility = req.body;
        console.log('Facility ===>', facility);

        Facilities.findAll({
            where: {
                isActive: true,
                facilityId: {
                    [Op.ne]: id
                }
            }
        })
            .then(facilities => {
                let found;
                facilities.map(item => {
                    if (item.facilityName.toLowerCase().replace(/ /g, '') === facility.facilityName.toLowerCase().replace(/ /g, '')) {
                        found = true;
                        // break;
                    }
                })

                if (found === true) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Already exist!'
                    });
                } else {
                    Facilities.findOne({
                        where: {
                            isActive: true,
                            facilityId: id
                        }
                    })
                        .then(async facilityToBeUpdated => {
                            if (facilityToBeUpdated !== null) {
                                facilityToBeUpdated.updateAttributes(facility, transaction);
                                await transaction.commit();
                                res.status(httpStatus.CREATED).json({
                                    message: 'Updated Successfully'
                                });
                            }
                        })
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = (req, res, next) => {
    Facilities.findAll({
        where: {
            isActive: true
        }
    })
        .then(facilities => {
            res.status(httpStatus.OK).json({
                facilities: facilities
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log('ID ===>', id);

        Facilities.findOne({
            where: {
                isActive: true,
                facilityId: id
            }
        })
            .then(async facility => {
                facility.updateAttributes({ isActive: false }, transaction);
                await transaction.commit();
                res.status(httpStatus.OK).json({
                    message: 'Deleted Successfully'
                });
            })
            .catch(err => {
                console.log('Error ===>', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const ids = req.body.ids;
        console.log('IDs ===>', ids);

        Facilities.findAll({
            where: {
                isActive: true,
                facilityId: {
                    [Op.in]: ids
                }
            }
        })
            .then(async facilities => {
                facilities.map(facility => {
                    facility.updateAttributes({ isActive: false }, transaction);
                })
                await transaction.commit();
                res.status(httpStatus.OK).json({
                    message: 'Deleted Successfully'
                });
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}