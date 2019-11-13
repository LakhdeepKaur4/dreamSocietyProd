const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const Facilities = db.facilities;
const FacilitiesDetails = db.facilitiesDetails;

exports.create = async(req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
        const facility = req.body;
    console.log('Facility ===>', facility);
    facility.facilityId = parseInt(facility.facilityId); 
    if(facility.monthlyRateType){
        facility.unitRate = null;
        facility.monthlyRate = parseFloat(facility.monthlyRate);
    }
    if(facility.rateType){
        facility.monthlyRate = null;
        facility.unitRate = parseFloat(facility.unitRate);
    }

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
                FacilitiesDetails.create(facility,transaction)
                    .then(async facilityCreated => {
                        
                        if (facilityCreated !== null) {
                            await transaction.commit();
                            res.status(httpStatus.CREATED).json({
                                message: 'Created Successfully'
                            });
                        }
                    })
                    .catch(async err => {
                        console.log('Error ===>', err);
                        if(transaction) await transaction.rollback();
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
    
}

exports.update = async(req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
    console.log('ID ===>', id);

    const facility = req.body;
    console.log('Facility ===>', facility);   

    if(facility.monthlyRate !== null){
        facility.unitRate = null;
        facility.monthlyRate = parseFloat(facility.monthlyRate);
    }
    if(facility.unitRate !== null){
        facility.monthlyRate = null;
        facility.unitRate = parseFloat(facility.unitRate);
    }

    FacilitiesDetails.findOne({
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
                    .then(async facilityToBeUpdated => {
                        if (facilityToBeUpdated !== null) {
                            facilityToBeUpdated.updateAttributes(facility,transaction);
                            await transaction.commit();
                            res.status(httpStatus.CREATED).json({
                                message: 'Updated Successfully'
                            });
                        }
                    })
                    .catch(async err => {
                        if(transaction) await transaction.rollback();
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            }
        })
        .catch(async err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.get = (req, res, next) => {
    FacilitiesDetails.findAll({
        where: {
            isActive: true
        },
        include: [
            { model: Facilities }
        ]
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

exports.delete = async(req, res, next) => {
    let transaction;
 try{
     transaction = await db.sequelize.transaction();
    const id = req.params.id;
    console.log('ID ===>', id);

    FacilitiesDetails.findOne({
        where: {
            isActive: true,
            facilityDetailId: id
        }
    })
        .then(async facility => {
            facility.updateAttributes({ isActive: false },transaction);
            await transaction.commit();
            res.status(httpStatus.OK).json({
                message: 'Deleted Successfully'
            });
        })
        .catch(async err => {
            if(transaction) await transaction.rollback();
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
 }catch(err){
    if(transaction) await transaction.rollback();
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
 }
    
}

exports.deleteSelected = async(req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
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
        .then(async facilities => {
            facilities.map(facility => {
                facility.updateAttributes({ isActive: false },transaction);
            })
            await transaction.commit();

            res.status(httpStatus.OK).json({
                message: 'Deleted Successfully'
            });
        })
        .catch(async err => {
            if(transaction) await transaction.rollback();
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}