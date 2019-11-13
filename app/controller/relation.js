const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const Relation = db.relation;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        let body = req.body;
        body.userId = req.userId;
        const relations = await Relation.findAll({
            where: {
                isActive: true
            }
        })
        let error = relations.some(relation => {
            return relation.relationName.toLowerCase().replace(/ /g, '') == req.body.relationName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Relation Name already Exists" })
        }
        const relation = await Relation.create(body, transaction);
        await transaction.commit();
        return res.status(httpStatus.CREATED).json({
            message: "Relation successfully created",
            relation
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const relation = await Relation.findAll({ where: { isActive: true } });
        if (relation) {
            return res.status(httpStatus.CREATED).json({
                message: "Relation Content Page",
                relation
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
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const relation = await Relation.findOne({
            where: {
                isActive: true,
                relationId: id
            }
        })
        console.log(relation);
        if (relation.relationName === update.relationName) {
            const updatedRelation = await Relation.find({ where: { relationId: id } }).then(relation => {
                return relation.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedRelation) {
                return res.status(httpStatus.OK).json({
                    message: "Relation Updated Page",
                    updatedRelation: updatedRelation
                });
            }
        } else {
            const relations = await Relation.findAll({
                where: {
                    isActive: true
                }
            })
            let error = relations.some(relation => {
                return relation.relationName.toLowerCase().replace(/ /g, '') == req.body.relationName.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Relation Name already Exists" })
            }
            const updatedRelation = await Relation.find({ where: { relationId: id } }).then(relation => {
                return relation.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedRelation) {
                return res.status(httpStatus.OK).json({
                    message: "Relation Updated Page",
                    updatedRelation
                });
            }
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
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
        const updatedRelation = await Relation.find({ where: { relationId: id } }).then(relation => {
            return relation.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (updatedRelation) {
            return res.status(httpStatus.OK).json({
                message: "Relation deleted successfully",
                updatedRelation
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
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
        const updatedRelation = await Relation.update(update, { where: { relationId: { [Op.in]: deleteSelected } },transaction });
        await transaction.commit();
        if (updatedRelation) {
            return res.status(httpStatus.OK).json({
                message: "Relations deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}