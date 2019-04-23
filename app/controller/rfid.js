const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const RFID = db.rfid;

exports.create = (req, res, next) => {
    const body = req.body;
    console.log('Body ===>', body);

    RFID.findOne({
        where: {
            rfid: body.rfid,
            isActive: true
        }
    })
        .then(rfid => {
            if (rfid !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Already exist'
                })
            } else {
                RFID.create(body)
                    .then(rfid => {
                        if (rfid !== null) {
                            res.status(httpStatus.CREATED).json({
                                message: 'Created'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Not created'
                            })
                        }
                    })
                    .catch(err => {
                        console.log('Error', err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            }
        })
        .catch(err => {
            console.log('Error', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.get = (req, res, next) => {
    RFID.findAll({
        where: {
            isActive: true
        }
    })
        .then(rfids => {
            if (rfids.length !== 0) {
                res.status(httpStatus.OK).json({
                    RFIDs: rfids
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'No data available'
                })
            }
        })
        .catch(err => {
            console.log('Error', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.update = (req, res, next) => {
    const body = req.body;
    body.rfidId = req.params.id;
    console.log('Body ===>', body);

    RFID.findOne({
        where: { rfid: body.rfid, isActive: true, rfidId: { [Op.ne]: body.rfidId } }
    })
        .then((rfid) => {
            if (rfid !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'RFID already exist!'
                })
            }
            else {
                RFID.findOne({
                    where: { rfidId: body.rfidId, isActive: true }
                })
                    .then((rfid) => {
                        if (rfid !== null) {
                            rfid.updateAttributes(body);
                            res.status(httpStatus.CREATED).json({
                                message: 'Updated successfully!'
                            })
                        }
                        else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Data not available!'
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
                    })
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
        })
}

exports.delete = (req, res, next) => {
    const rfidId = req.params.id;
    console.log('ID ===>', rfidId);

    RFID.findOne({
        where: {
            rfidId: rfidId,
            isActive: true
        }
    })
        .then(rfid => {
            if (rfid !== null) {
                rfid.updateAttributes({ isActive: false });
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
    const rfidIds = req.body.ids;
    console.log('IDs ===>', rfidIds);

    RFID.findAll({
        where: {
            rfidId: {
                [Op.in]: rfidIds
            },
            isActive: true
        }
    })
        .then(rfids => {
            if (rfids.length !== 0) {
                rfids.map(item => {
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