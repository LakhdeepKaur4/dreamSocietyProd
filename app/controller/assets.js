const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const Assets = db.assets;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating assets");
        console.log("userId==>", req.userId)
        let body = req.body;
        body.userId = req.userId;
        const assets = await Assets.create(body, transaction);
        await transaction.commit();
        return res.status(httpStatus.CREATED).json({
            message: "Assets successfully created",
            assets
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        // let limit = 10;
        // let offset = 0;
        // let page = req.params.page;
        // offset = limit * (page - 1);
        // const data = await Assets.findAndCountAll();
        // let pages = Math.ceil(data.count / limit);

        const assets = await Assets.findAll({
            where: { isActive: true }, order: [
                ['createdAt', 'DESC']
            ],
        });
        if (assets) {
            return res.status(httpStatus.CREATED).json({
                message: "Assets Content Page",
                assets: assets
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getAssetsByPageNumber = async (req, res, next) => {
    try {
        let limit = 10;
        let offset = 0;
        let page = req.params.page;
        offset = limit * (page - 1);
        const data = await Assets.findAndCountAll();
        // let pages = Math.ceil(data.count / limit);
        const assets = await Assets.findAll({
            where: { isActive: true },
            limit: limit,
            offset: offset,
        });
        if (assets) {
            return res.status(httpStatus.CREATED).json({
                message: "Assets Content Page",
                assets: assets
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

        console.log("update", update)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedAssets = await Assets.find({ where: { assetId: id } }).then(assets => {
            return assets.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (updatedAssets) {
            return res.status(httpStatus.OK).json({
                message: "Assets Updated Page",
                assets: updatedAssets
            });
        }
    } catch (error) {
        console.log("error==>", error);
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteById = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const asset = await Assets.findOne({ where: { assetId: id } });
        if (!asset) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id does not exists" });
        }
        const deletedAsset = await Assets.destroy({ where: { assetId: id }, transaction });
        await transaction.commit();

        if (deletedAsset) {
            return res.status(httpStatus.OK).json({
                message: "Asset deleted successfully",
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: error });
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log("in asserts delete ==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedAssets = await Assets.find({ where: { assetId: id } }).then(assets => {
            return assets.updateAttributes(update, transaction)
        });
        await transaction.commit();
        if (updatedAssets) {
            return res.status(httpStatus.OK).json({
                message: "Assets deleted successfully",
                assets: updatedAssets
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
        const updatedAssets = await Assets.update(update, { where: { assetId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedAssets) {
            return res.status(httpStatus.OK).json({
                message: "Assets deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}






