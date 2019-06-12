const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const MachineDetail = db.machineDetail;

exports.create = (req, res, next) => {
    const body = req.body;
    body.userId = req.userId;
    console.log('Body ===>', body);

    MachineDetail.findOne({
        where: {
            machineActualId: body.machineActualId,
            isActive: true
        }
    })
        .then(machineExisting => {
            if (machineExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Machine already exist'
                })
            } else {
                MachineDetail.create(body)
                    .then(machine => {
                        if (machine !== null) {
                            res.status(httpStatus.CREATED).json({
                                message: 'Machine registered successfully'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Machine not registered'
                            })
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
    MachineDetail.findAll({
        where: {
            isActive: true
        }
    })
        .then(machines => {
            if (machines.length !== 0) {
                res.status(httpStatus.OK).json({
                    machinesDetail: machines
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No Content'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.update = (req, res, next) => {
    const body = req.body;
    const machineDetailId = req.params.id;
    console.log('Id ===>', machineDetailId);
    body.machineDetailId = machineDetailId;
    console.log('Body ===>', body);

    MachineDetail.findOne({
        where: {
            machineActualId: body.machineActualId,
            machineDetailId: { [Op.ne]: body.machineDetailId },
            isActive: true,
        }
    })
        .then(machineExisting => {
            if (machineExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Machine already exist'
                })
            } else {
                MachineDetail.findOne({
                    where: {
                        machineDetailId: body.machineDetailId,
                        isActive: true
                    }
                })
                    .then(machine => {
                        if (machine !== null) {
                            machine.updateAttributes(body);
                            res.status(httpStatus.CREATED).json({
                                message: 'Machine updated successfully'
                            })
                        } else {
                            res.status(httpStatus.NO_CONTENT).json({
                                message: 'Machine does not exist'
                            })
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

exports.delete = (req, res, next) => {
    const machineDetailId = req.params.id;
    console.log('ID ===>', machineDetailId);

    MachineDetail.findOne({
        where: {
            machineDetailId: machineDetailId,
            isActive: true
        }
    })
        .then(machine => {
            if (machine !== null) {
                machine.updateAttributes({ isActive: false });
                res.status(httpStatus.OK).json({
                    message: 'Deleted successfully'
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
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
    const machineIds = req.body.ids;
    console.log('IDs ===>', machineIds);

    MachineDetail.findAll({
        where: {
            machineDetailId: {
                [Op.in]: machineIds
            },
            isActive: true
        }
    })
        .then(machines => {
            if (machines.length !== 0) {
                machines.map(item => {
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

