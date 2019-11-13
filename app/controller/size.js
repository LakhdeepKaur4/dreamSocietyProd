const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')

const Size = db.size;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating size");
        const sizes = await Size.findAll({
            where: {
                isActive: true
            }
        })
        let error = sizes.some(size => {
            return size.sizeType.toLowerCase().replace(/ /g, '') == req.body.sizeType.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Size Name already Exists" })
        }
        let body = req.body;
        body.userId = req.userId;
        Size.create({
            sizeType: req.body.sizeType,
        }, transaction).then(async size => {
            await transaction.commit();
            res.json({ message: "Size added successfully!", size: size });
        }).catch(err => {
            res.status(500).send("Fail! Error -> " + err);
        })
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = (req, res) => {
    Size.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
    })
        .then(size => {
            res.json(size);
        });
}

exports.getById = (req, res) => {
    Size.findOne({
        where: { id: req.userId },
    }).then(size => {
        res.status(200).json({
            "description": "Size Content Page",
            "size": size
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not size Page",
            "error": err
        });
    })
}

exports.update = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            res.json("Please enter id");
        }
        const updates = req.body;
        const size = await Size.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { sizeId: id },
                ]
            }
        })

        if (size.sizeType === updates.sizeType) {
            const updatedSize = await Size.find({ where: { sizeId: id } }).then(size => {
                return size.updateAttributes(updates, transaction)
            })
            await transaction.commit();
            if (updatedSize) {
                return res.status(httpStatus.OK).json({
                    message: "Size Updated Page",
                    updatedSize: updatedSize
                });
            }
        } else {
            const sizes = await Size.findAll({
                where: {
                    isActive: true
                }
            })
            console.log(sizes);
            let error = sizes.some(size => {
                return size.sizeType.toLowerCase().replace(/ /g, '') == req.body.sizeType.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Size Name already Exists" })
            }
            Size.find({
                where: { sizeId: id }
            })
                .then(size => {
                    return size.updateAttributes(updates, transaction)
                })
                .then(async updatedSize => {
                    await transaction.commit();
                    res.json({ message: "Size updated successfully!", updatedSize: updatedSize });
                });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
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
        const updatedSize = await Size.find({ where: { sizeId: id } }).then(size => {
            return size.updateAttributes(update, transaction)
        });
        await transaction.commit();
        if (updatedSize) {
            return res.status(httpStatus.OK).json({
                message: "Size deleted successfully",
                event: updatedSize
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
        const updatedSize = await Size.update(update, { where: { sizeId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedSize) {
            return res.status(httpStatus.OK).json({
                message: "Sizes deleted successfully",
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

