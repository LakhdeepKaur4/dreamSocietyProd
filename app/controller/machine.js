const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const Machine = db.machine;
const AreaMachine = db.areaMachine;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const MachineDetail = db.machineDetail;

let filterItem = (machineDetailIdsArr, arr) => {
    // console.log(machineDetailIdsArr);
    const resArr = machineDetailIdsArr.filter(item => {
        // console.log(1);
        return arr.includes(item.machineDetailId) === false;
    });
    // console.log(resArr);
    return resArr;
}

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
        const body = req.body;
        body.userId = req.userId;
        console.log('Body ===>', body);

        Machine.findOne({
            where: {
                machineDetailId: body.machineDetailId,
                flatDetailId: body.flatDetailId,
                type: body.type,
                isActive: true
            }
        })
            .then(machineExisting => {
                if (machineExisting !== null) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Machine already in use for another flat'
                    })
                } else {
                    Machine.create(body, transaction)
                        .then(async machine => {
                            await transaction.commit();
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
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }

}

exports.get = async (req, res, next) => {
    try {
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
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }


}

exports.update = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.machineId = req.params.id;
        console.log('888888Body ===>', body);

        Machine.findOne({
            where: {
                machineDetailId: body.machineDetailId,
                flatDetailId: body.flatDetailId,
                isActive: true,
                type: body.type,
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
                        .then(async machine => {
                            if (machine !== null) {
                                if (body.machineId !== undefined) {
                                    delete body.machineId;
                                }
                                if (body.flatDetailId !== undefined && (body.flatDetailId === '' || body.flatDetailId === null)) {
                                    delete body.flatDetailId;
                                }
                                machine.updateAttributes(body, transaction);
                                await transaction.commit();
                                res.status(httpStatus.CREATED).json({
                                    message: 'Machine updated successfully'
                                })
                            } else {
                                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Machine updation not successful'
                                })
                            }
                        })
                        .catch(async err => {
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }

}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const machineId = req.params.id;
        console.log('ID ===>', machineId);

        Machine.findOne({
            where: {
                machineId: machineId,
                isActive: true
            }
        })
            .then(async machine => {
                if (machine !== null) {
                    machine.updateAttributes({ isActive: false }, transaction);
                    await transaction.commit();
                    res.status(httpStatus.OK).json({
                        message: 'Deleted successfully'
                    })
                } else {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Not deleted'
                    })
                }
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
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
            .then(async machines => {
                if (machines.length !== 0) {
                    machines.map(item => {
                        item.updateAttributes({ isActive: false }, transaction)
                    })
                    await transaction.commit();
                    res.status(httpStatus.OK).json({
                        message: 'Deleted successfully'
                    })
                } else {
                    res.status(httpStatus.NO_CONTENT).json({
                        message: 'No data found'
                    })
                }
            })
            .catch(async err => {
                if (transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
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

exports.getByFlatId = (req, res, next) => {
    const flatDetailId = req.params.id;
    if (!flatDetailId) {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ "message": "Flat can't be empty" });
    }
    Machine.findAll({
        where: {
            isActive: true,
            flatDetailId: req.params.id
        },
        include: [
            FlatDetail,
            MachineDetail
        ]
    })
        .then(machines => {
            if (machines.length !== 0) {
                res.status(httpStatus.OK).json({
                    machinesDetail: machines,
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