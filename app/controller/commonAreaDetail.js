const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const CommonAreaDetail = db.commonAreaDetail;
const MachineDetail = db.machineDetail;
const CommonArea = db.commonArea;
const AreaMachine = db.areaMachine;

exports.create = async (req, res) => {
    
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
        let body = req.body;
        body.userId = req.userId;

        const commonAreaDetail = await CommonAreaDetail.create(body,transaction);
        await transaction.commit()

        const commonAreaDetailId = commonAreaDetail.commonAreaDetailId;

        const result = body.machines.map(function (element) { element.commonAreaDetailId = commonAreaDetailId });

        const updated = await AreaMachine.bulkCreate(body.machines, { returning: true }, {
            fields: ["machineDetailId", "commonAreaDetailId"],
        },{transaction});
        await transaction.commit();
        if (updated) {
            return res.status(httpStatus.CREATED).json({
                message: "Created successfully"
            })
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.create1 = async(req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction()
        const body = req.body;
    console.log('Body ===>', body);
    let success = 0;
    let error = 0;
    // body.machineDetailId = body.machineDetailId.split(',');

    body.machineDetailId.map(async(item) => {
        CommonAreaDetail.create({
            commonAreaId: body.commonAreaId,
            machineDetailId: item
        },transaction)
            .then(async(commonArea) => {
                await transaction.commit();
                if (commonArea !== null) {
                    success += 1;
                }
                else {
                    error += 1;
                }
            })
    })
    if (error === 0) {
        res.status(httpStatus.CREATED).json({
            message: 'Machines added to common area succesfully'
        })
    } else {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: 'Machine not added to common area. Please try again!'
        })
    }
}catch(err){
    if(transaction) await transaction.rollback();
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
}
}

exports.getAreaAndMachine = async (req, res) => {
  
    try {
       
        const commonAreaDetail = await CommonAreaDetail.findAll({
            where: { isActive: true },
            include: [{
                model: MachineDetail,
                as: 'Machine',
                attributes: ['machineDetailId', 'machineActualId'],
                through: {
                    attributes: ['machineDetailId', 'commonAreaDetailId'],
                }
            },
            { model: CommonArea, attributes: ['commonArea'] }
            ]
            , order: [['createdAt', 'DESC']]
        });
        if (commonAreaDetail) {
            res.status(httpStatus.OK).json({ message: 'Common Area with machine', commonAreaDetail })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.updateAreaAndMachine = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const commonAreaDetailId = req.params.id;
        let commonAreaDetailIds = [];
        let body = req.body;
        const commonAreaDetail = await CommonAreaDetail.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { commonAreaDetailId: commonAreaDetailId },
                ]
            }
        });

        const updatedCommonArea = await CommonAreaDetail.find({ where: { commonAreaDetailId: commonAreaDetailId } }).then(commonAreaDetail => {
            commonAreaDetail.updateAttributes(body,transaction);
        })
        const areaMachine = await AreaMachine.findAll({ where: { isActive: true, commonAreaDetailId: commonAreaDetailId } });
        const areaMachineMasterId = areaMachine.map(areaMachine => {
            commonAreaDetailIds.push(areaMachine.areaMachineMasterId)
        });
        const deleteAreaMachine = await AreaMachine.destroy({ where: { areaMachineMasterId: { [Op.in]: commonAreaDetailIds } },transaction });

        const result = req.body.machines.forEach(function (element) {
            element.commonAreaDetailId = commonAreaDetailId
            console.log(element.commonAreaDetailId)
        });
        const updatedAreaMachine = await AreaMachine.bulkCreate(req.body.machines, { returning: true }, {
            fields: ["machineDetailId", "commonAreaDetailId"],
        },{transaction});
        await transaction.commit();
        res.json({ message: 'Updated Successfully' });
    } catch (error) {
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

exports.update = async(req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction()
        const commonAreaDetailId = req.params.id;
    const body = req.body;
    console.log('Body ===>', body);

    CommonAreaDetail.findAll({
        where: {
            machineDetailId: body.machineDetailId,
            commonAreaId: body.commonAreaId,
            isActive: true,
            commonAreaDetailId: {
                [Op.ne]: commonAreaDetailId
            }
        }
    })
        .then(commonAreaExisting => {
            if (commonAreaExisting !== null) {
                res.status(httpStatus.NOT_MODIFIED).json({
                    message: 'Machine already exist for another common area'
                })
            } else {
                CommonAreaDetail.findOne({
                    where: {
                        isActive: true,
                        commonAreaDetailId: commonAreaDetailId
                    }
                })
                    .then(async(commonArea) => {
                        if (commonArea !== null) {
                            commonArea.updateAttributes(body,transaction);
                            await transaction.commit();
                            res.status(httpStatus.CREATED).json({
                                message: 'Updated successfully'
                            })
                        } else {
                            res.status(httpStatus.NOT_MODIFIED).json({
                                message: 'Not updated. Please try again!'
                            })
                        }
                    })
                    .catch(async(err) => {
                        
                        if(transaction) await transaction.rollback()
                        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                    })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback()
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.get = (req, res, next) => {
    // const commonAreaIds = [];
    CommonAreaDetail.findAll({
        where: {
            isActive: true
        },
        // group: ['common_area_detail_master.commonAreaId'],
        include: [
            { model: CommonArea, where: { isActive: true }, attributes: ['commonAreaId', 'commonArea'] },
            { model: MachineDetail, where: { isActive: true }, attributes: ['machineDetailId', 'machineActualId'] }
        ]
    })
        .then(commonAreas => {
            if (commonAreas.length !== 0) {
                // console.log(commonAreaIds);
                res.status(httpStatus.OK).json({
                    commonAreas: commonAreas.sort()
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

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let commonAreaDetailIds = [];
        const commonAreaDetailId = req.params.id;
        console.log('ID ===>', commonAreaDetailId);

        const updatedAreaMachine = await CommonAreaDetail.find({ where: { commonAreaDetailId: commonAreaDetailId } }).then(commonDetail => {
            return commonDetail.updateAttributes({ isActive: false },transaction)
        })

        const areaMachine = await AreaMachine.findAll({ where: { isActive: true, commonAreaDetailId: commonAreaDetailId } });
        const areaMachineMasterId = areaMachine.map(areaMachine => {
            commonAreaDetailIds.push(areaMachine.areaMachineMasterId)
        });
        console.log("in here ==>", commonAreaDetailIds);
        const deleteAreaMachine = await AreaMachine.destroy({ where: { areaMachineMasterId: { [Op.in]: commonAreaDetailIds } },transaction });
        // if (deleteAreaMachine) {
            await transaction.commit();
        return res.status(httpStatus.OK).json({
            message: "Area and machine deleted successfully"
        });
        // }
    } catch (error) {
        if(transaction) await transaction.rollback()
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

// exports.deleteSelected = (req, res, next) => {
//     const commonAreaDetailIds = req.body.ids;
//     console.log('IDs ===>', commonAreaDetailIds);

//     CommonAreaDetail.findAll({
//         where: {
//             commonAreaDetailId: {
//                 [Op.in]: commonAreaDetailIds
//             },
//             isActive: true
//         }
//     })
//         .then(commonAreas => {
//             if (commonAreas.length !== 0) {
//                 commonAreas.map(item => {
//                     item.updateAttributes({ isActive: false });
//                 })
//                 res.status(httpStatus.OK).json({
//                     message: 'Deleted successfully'
//                 })
//             } else {
//                 res.status(httpStatus.NO_CONTENT).json({
//                     message: 'No data found'
//                 })
//             }
//         })
//         .catch(err => {
//             console.log('Error ===>', err);
//             res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
//         })
// }

exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        let commonAreaDetailIds = [];
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedAreaMachine = await CommonAreaDetail.update(update, { where: { commonAreaDetailId: { [Op.in]: deleteSelected } },transaction });

        const areaMachine = await AreaMachine.findAll({ where: { isActive: true, commonAreaDetailId: { [Op.in]: deleteSelected } } });
        const areaMachineId = areaMachine.map(areaMachine => {
            commonAreaDetailIds.push(areaMachine.areaMachineMasterId)
        });
        // console.log(towerIds);
        const deleteAreaMachine = await AreaMachine.destroy({ where: { areaMachineMasterId: { [Op.in]: commonAreaDetailIds } },transaction });
        await transaction.commit();
        if (deleteAreaMachine) {
            return res.status(httpStatus.OK).json({
                message: "Area and Machines deleted successfully",
            });
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
