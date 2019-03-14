const db = require('../config/db.config.js');
const httpStatus = require('http-status')

const AssetsType = db.assetsType;
const Assets = db.assets;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("userId==>", req.userId)
        let body = req.body;
        body.userId = req.userId;
        console.log("body==>", req.body)
        const assetsType = await AssetsType.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "AssetsType successfully created",
            assetsType
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        // let limit = 10;
        // let offset = 0;
        // let page = req.params.page;
        // offset = limit * (page - 1);
        const assetsType = await AssetsType.findAll({
            where: { isActive: true },
            // limit: limit,
            // offset: offset,
            order: [['createdAt', 'DESC']],
            include: [{ model: Assets, attributes: ['assetId', 'assetName'] }]
        });
        if (assetsType) {
            return res.status(httpStatus.CREATED).json({
                message: "AssetsType Content Page",
                assetsType: assetsType
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.getAssetsTypeByPageNumber = async (req, res, next) => {
    try {
        let limit = 10;
        let offset = 0;
        let page = req.params.page;
        offset = limit * (page - 1);
        const assetsType = await AssetsType.findAll({
            where: { isActive: true },
            limit: limit,
            offset: offset,
            include: [{ model: Assets, attributes: ['assetId', 'assetName'] }]
        });
        if (assetsType) {
            return res.status(httpStatus.CREATED).json({
                message: "AssetsType Content Page",
                assetsType: assetsType
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedAssetsType = await AssetsType.find({ where: { assetTypeId: id }, include: [{ model: Assets, attributes: ['assetId', 'assetName'] }] }).then(assetsType => {
            return assetsType.updateAttributes(update)
        })
        if (updatedAssetsType) {
            return res.status(httpStatus.OK).json({
                message: "AssetsType Updated Page",
                assetsType: updatedAssetsType
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteById = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const assetType = await AssetsType.findOne({ where: { assetTypeId: id } });
        if (!assetType) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id does not exists" });
        }
        const deletedAssetType = await AssetsType.destroy({ where: { assetTypeId: id } })

        if (deletedAssetType) {
            return res.status(httpStatus.OK).json({
                message: "Asset Type deleted successfully",
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedAssetsType = await AssetsType.find({ where: { assetTypeId: id } }).then(assetsType => {
            return assetsType.updateAttributes(update)
        })
        if (updatedAssetsType) {
            return res.status(httpStatus.OK).json({
                message: "AssetsType deleted successfully",
                assetsType: updatedAssetsType
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedAssetsType = await AssetsType.update(update, { where: { assetTypeId: { [Op.in]: deleteSelected } } })
        if (updatedAssetsType) {
            return res.status(httpStatus.OK).json({
                message: "Assets Type deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
