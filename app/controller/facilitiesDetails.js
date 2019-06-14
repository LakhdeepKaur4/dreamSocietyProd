const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const Facilities = db.facilities;
const FacilitiesDetails = db.facilitiesDetails;

exports.create = (req, res, next) => {
    const facility = req.body;
    console.log('Facility ===>', facility);

    FacilitiesDetails.findOne({
        where: {
            isActive: true,
            facilityId: facility.facilityId
        }
    })
        .then(facilityFound => {
            if (facilityFound !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Already exist!'
                });
            }
            else {
                FacilitiesDetails.create(facility)
                    .then(facilityCreated => {
                        if (facilityCreated !== null) {
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
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.update = (req, res, next) => {
    const id = req.params.id;
    console.log('ID ===>', id);

    const facility = req.body;
    console.log('Facility ===>', facility);

    Facilities.findOne({
        where: {
            isActive: true,
            facilityId: facility.facilityId,
            facilityDetailId: {
                [Op.ne]: id
            }
        }
    })
        .then(facilityFound => {
            if (facilityFound !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Already exist!'
                });
            }
            else {
                FacilitiesDetails.findOne({
                    where: {
                        facilityDetailId: id,
                        isActive: true
                    }
                })
                    .then(facilityToBeUpdated => {
                        if (facilityToBeUpdated !== null) {
                            facilityToBeUpdated.updateAttributes(facility);
                            res.status(httpStatus.CREATED).json({
                                message: 'Updated Successfully'
                            });
                        }
                    })
                    .catch(err => {
                        console.log('Error ===>', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.get = (req, res, next) => {
    FacilitiesDetails.findAll({
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

exports.delete = (req, res, next) => {
    const id = req.params.id;
    console.log('ID ===>', id);

    FacilitiesDetails.findOne({
        where: {
            isActive: true,
            facilityDetailId: id
        }
    })
        .then(facility => {
            facility.updateAttributes({ isActive: false });
            res.status(httpStatus.OK).json({
                message: 'Deleted Successfully'
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteSelected = (req, res, next) => {
    const ids = req.body.ids;
    console.log('IDs ===>', ids);

    FacilitiesDetails.findAll({
        where: {
            isActive: true,
            facilityDetailId: {
                [Op.in]: ids
            }
        }
    })
        .then(facilities => {
            facilities.map(facility => {
                facility.updateAttributes({ isActive: false });
            })

            res.status(httpStatus.OK).json({
                message: 'Deleted Successfully'
            });
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}