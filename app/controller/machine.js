const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const Machine = db.machine;
const AreaMachine = db.areaMachine;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const MachineDetail = db.machineDetail;
const CommonAreaDetail = db.commonAreaDetail;

let filterItem = (machineDetailIdsArr, arr) => {
    // console.log(machineDetailIdsArr);
    const resArr = machineDetailIdsArr.filter(item => {
        // console.log(1);
        return arr.includes(item.machineDetailId) === false;
    });
    // console.log(resArr);
    return resArr;
}

exports.create = (req, res, next) => {
    const body = req.body;
    body.userId = req.userId;
    console.log('Body ===>', body);

    Machine.findOne({
        where: {
            machineDetailId: body.machineDetailId,
            flatDetailId: body.flatDetailId,
            isActive: true
        }
    })
        .then(machineExisting => {
            if (machineExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Machine already in use for another flat'
                })
            } else {
                Machine.create(body)
                    .then(machine => {
                        if (machine !== null) {
                            res.status(httpStatus.CREATED).json({
                                message: 'Machine registered successfully'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Machine registeration not successful'
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
    Machine.findAll({
        where: {
            isActive: true
        },
        include: [
            {
                model: FlatDetail,
                where: { isActive: true },
                include: [
                    { model: Tower, where: { isActive: true }, attributes: ['towerId', 'towerName'] },
                    { model: Floor, where: { isActive: true }, attributes: ['floorId', 'floorName'] }
                ]
            },
            { model: MachineDetail, where: { isActive: true } }
        ]
    })
        .then(machines => {
            if (machines.length !== 0) {
                res.status(httpStatus.OK).json({
                    Machines: machines
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
    body.machineId = req.params.id;
    console.log('Body ===>', body);

    Machine.findOne({
        where: {
            machineDetailId: body.machineDetailId,
            flatDetailId: body.flatDetailId,
            isActive: true,
            machineId: {
                [Op.ne]: body.machineId
            }
        }
    })
        .then(machineExisting => {
            if (machineExisting !== null) {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Machine already in use for another flat'
                })
            } else {
                Machine.findOne({
                    where: {
                        machineId: body.machineId,
                        isActive: true
                    }
                })
                    .then(machine => {
                        if (machine !== null) {
                            if (body.machineId !== undefined) {
                                delete body.machineId;
                            }
                            if (body.flatDetailId !== undefined && (body.flatDetailId === '' || body.flatDetailId === null)) {
                                delete body.flatDetailId;
                            }
                            machine.updateAttributes(body);
                            res.status(httpStatus.CREATED).json({
                                message: 'Machine updated successfully'
                            })
                        } else {
                            res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                message: 'Machine updation not successful'
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

exports.delete = (req, res, next) => {
    const machineId = req.params.id;
    console.log('ID ===>', machineId);

    Machine.findOne({
        where: {
            machineId: machineId,
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
    const machineIds = req.body.ids;
    console.log('IDs ===>', machineIds);

    Machine.findAll({
        where: {
            machineId: {
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

// exports.getMachineForCommonArea = (req, res, next) => {
//     const machineDetailIds = [];
//     MachineDetail.findAll({
//         where: {
//             isActive: true
//         }
//     })
//         .then(machines => {
//             if (machines.length !== 0) {
//                 CommonAreaDetail.findAll({
//                     where: {
//                         isActive: true
//                     },
//                     attributes: ['machineDetailId']
//                 })
//                     .then(commonAreaMachines => {
//                         if (commonAreaMachines.length !== 0) {
//                             commonAreaMachines.map(item => {
//                                 machineDetailIds.push(item.machineDetailId);
//                             });
//                             // console.log(machines);
//                             SendMachines = filterItem(machines, machineDetailIds);
//                             // console.log(1);
//                             res.status(httpStatus.OK).json({
//                                 machines: SendMachines
//                             })
//                         } else {
//                             // console.log(2);
//                             res.status(httpStatus.OK).json({
//                                 machines: machines
//                             })
//                         }
//                     })
//                     .catch(err => {
//                         console.log('Error ===>', err);
//                         res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
//                     })
//             } else {
//                 res.status(httpStatus.NO_CONTENT).json({
//                     message: 'No data available!'
//                 })
//             }
//         })
//         .catch(err => {
//             console.log('Error ===>', err);
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
//         })
// }

exports.getMachineForCommonArea = (req, res, next) => {
    const machineDetailIds = [];

    MachineDetail.findAll({ where: { isActive: true } })
        .then(async machines => {
            if (machines.length !== 0) {
                const commonAreaMachines = await AreaMachine.findAll({ where: { isActive: true }, attributes: ['machineDetailId'] });
                const flatMachines = await Machine.findAll({ where: { isActive: true }, attributes: ['machineDetailId'] });

                flatMachines.map(item => {
                    machineDetailIds.push(item.machineDetailId);
                });
                commonAreaMachines.map(item => {
                    machineDetailIds.push(item.machineDetailId);
                })

                SendMachines = filterItem(machines, machineDetailIds);

                res.status(httpStatus.OK).json({
                    machines: SendMachines
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No data available!'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}