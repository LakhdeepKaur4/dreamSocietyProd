const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const CommonArea = db.commonArea;

exports.create = (req, res, next) => {
    const body = req.body;
    console.log('Body ===>', body);

    CommonArea.findOne({
        where: {
            isActive: true,
            commonArea: body.commonArea
        }
    })
        .then(commonAreaExisting => {
            if (commonAreaExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Common Area exist!'
                })
            } else {
                CommonArea.create(body)
                    .then(commonArea => {
                        if (commonArea !== null) {
                            res.status(httpStatus.CREATED).json({
                                message: 'Created Successfully!'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Not created'
                            })
                        }
                    })
                    .catch(err => {
                        console.log('Error ===>', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                    })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}

exports.get = (req, res, next) => {
    CommonArea.findAll({
        where: {
            isActive: true
        },
    })
        .then(commonAreas => {
            if (commonAreas.length !== 0) {
                res.status(httpStatus.OK).json({
                    commonAreas: commonAreas
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data available!'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}

exports.update = (req, res, next) => {
    const commonAreaId = req.params.id;
    const body = req.body;
    body.commonAreaId = commonAreaId;
    console.log('Body ===>', body);

    CommonArea.findOne({
        where: {
            isActive: true,
            commonArea: body.commonArea,
            commonAreaId: {
                [Op.ne]: body.commonAreaId
            }
        }
    })
        .then(commonAreaExisting => {
            if (commonAreaExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Common Area exist!'
                })
            } else {
                CommonArea.findOne({
                    where: {
                        commonAreaId: body.commonAreaId,
                        isActive: true
                    }
                })
                    .then(commonArea => {
                        if (commonArea !== null) {
                            commonArea.updateAttributes(body);
                            res.status(httpStatus.CREATED).json({
                                message: 'Updated Successfully!'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Not updated'
                            })
                        }
                    })
                    .catch(err => {
                        console.log('Error ===>', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                    })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}

exports.delete = (req, res, next) => {
    const commonAreaId = req.params.id;
    console.log('ID ===>', commonAreaId);

    CommonArea.findOne({
        where: {
            commonAreaId: commonAreaId,
            isActive: true
        }
    })
        .then(commonArea => {
            if (commonArea !== null) {
                commonArea.updateAttributes({ isActive: false });
                res.status(httpStatus.OK).json({
                    message: 'Deleted successfully'
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Not deleted'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteSelected = (req, res, next) => {
    const commonAreaIds = req.body.ids;
    console.log('IDs ===>', commonAreaIds);

    CommonArea.findAll({
        where: {
            commonAreaId: {
                [Op.in]: commonAreaIds
            },
            isActive: true
        }
    })
        .then(commonAreas => {
            if (commonAreas.length !== 0) {
                commonAreas.map(item => {
                    item.updateAttributes({ isActive: false })
                })
                res.status(httpStatus.OK).json({
                    message: 'Deleted successfully'
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data found'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}