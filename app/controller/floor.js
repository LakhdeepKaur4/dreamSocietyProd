const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')

const Floor = db.floor;
const User = db.user;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating event");
        let body = req.body;
        body.userId = req.userId;
        const floors = await Floor.findAll({
            where: {
                isActive: true
            }
        })
        let error = floors.some(floor => {
            return floor.floorName.toLowerCase().replace(/ /g, '') == req.body.floorName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Floor Name already Exists" })
        }
        console.log("body===>", body)
        const floor = await Floor.create(body,transaction);
        await transaction.commit();
        return res.status(httpStatus.CREATED).json({
            message: "Floor successfully created",
            Floor
        });
    } catch (error) {
        console.log("error==>", error);
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const floor = await Floor.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
        });
        if (floor) {
            return res.status(httpStatus.CREATED).json({
                message: "Floor Content Page",
                floor: floor
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction()
        const id = req.params.id;
        console.log("id==>", id);
        const update = req.body;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const floor = await Floor.findOne({
            where:{
                floorId:id,
                isActive:true
            }
        })
    
        if(floor.floorName === update.floorName){
            const updatedFloor = await Floor.find({ where: { floorId: id } }).then(floor => {
                return floor.updateAttributes(update,transaction)
            })
            await transaction.commit();
            if (updatedFloor) {
                return res.status(httpStatus.OK).json({
                    message: "Floor Updated Page",
                    updatedFloor: updatedFloor
                });
            }
        }else{
        const floors = await Floor.findAll({
            where: {
                isActive: true
            }
        })
        let error = floors.some(floor => {
            return floor.floorName.toLowerCase().replace(/ /g, '') == req.body.floorName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Floor Name already Exists" })
        }
  
        // console.log("update==>", update)
        // if (!update) {
        //     return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        // }
        const updatedFloor = await Floor.find({ where: { floorId: id } }).then(floor => {
            return floor.updateAttributes(update,transaction)
        })
        await transaction.commit();
        if (updatedFloor) {
            return res.status(httpStatus.OK).json({
                message: "Floor Updated Page",
                event: updatedFloor
            });
        }
    }
    } catch (error) {
        console.log(error)
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedFloor = await Floor.find({ where: { floorId: id } }).then(floor => {
            return floor.updateAttributes(update,transaction);
        })
        await transaction.commit();
        if (updatedFloor) {
            return res.status(httpStatus.OK).json({
                message: "Floor deleted successfully",
                floor: updatedFloor
            });
        }
    } catch (error) {
        if(transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelected = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedFloor = await Floor.update(update, { where: { floorId: { [Op.in]: deleteSelected } },transaction })
        await transaction.commit();
        if (updatedFloor) {
            return res.status(httpStatus.OK).json({
                message: "Floor deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        if(transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}