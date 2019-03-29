const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const sequelize = require('sequelize')

const Inventory = db.inventory;
const Assets = db.assets;
const AssetsType = db.assetsType;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating inventory");
        console.log("userId==>", req.userId);
        let body = req.body;
        body.userId = req.userId;
        let serialNumber;
        let assetName;
        let inventory;
        console.log("body assert id ==>", body.assetId)
        const assets = await Assets.findOne({ where: { assetId: body.assetId } });
        assetName = assets.assetName;
        if (body.number && req.body.autoGenerate) {
            for (let i = 0; i < body.number; i++) {
                serialNumber = assetName.toUpperCase().substring(0, 2) + i;
                body.serialNumber = serialNumber;
                inventory = await Inventory.create(body);
            }
        }
        else {
            for (let i = 0; i < body.serialNumber.length; i++) {
                inventory = await Inventory.create({
                    assetId: body.assetId,
                    assetTypeId: body.assetTypeId,
                    number: body.number,
                    rate: body.rate,
                    serialNumber: body.serialNumber[i],
                    dateOfPurchase: body.dateOfPurchase,
                    userId: req.userId
                })
            }
        }
        return res.status(httpStatus.CREATED).json({
            message: "Inventory successfully created",
            inventory
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const assetsId = [];
        const assetTypesId = [];
        // const inventory = await Inventory.findAll({
        //     where: { isActive: true },
        //     distinct:true,
        //     order: [['createdAt', 'DESC']],
        //     include: [
        //         { model: Assets },
        //         { model: AssetsType }
        //     ]
        // });
        // inventory.map(asset => assetsId.push(asset.assetId))
        // console.log(assetsId)
        // const distinctInventories = await Inventory.findAll({
        // where:{ assetId: { [Op.in]: assetsId }},
        // distinct:'assetId'
        // })
        // console.log(distinctInventories.length);
        const inventory = await Inventory.findAll({
            // distinct: true,
            raw:true,
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('assetId')), 'assetId'], 'assetTypeId', 'number', 'rate', 'assetId', 'dateOfPurchase'
            ],include:[
                {model:Assets}
            ]
        });
        inventory.map(asset => assetsId.push(asset.assetId));
        inventory.map(asset => assetTypesId.push(asset.assetTypeId))
        const assets = await Assets.findAll({
            attributes: ['assetId', 'assetName'],
            where: {
                [Op.and]: {
                    isActive: true,
                    assetId: { [Op.in]: assetsId }
                },
            }
        })

        const assetsType = await AssetsType.findAll({
            attributes: ['assetTypeId', 'assetType'],
            where: {
                [Op.and]: {
                    isActive: true,
                    assetTypeId: { [Op.in]: assetTypesId }
                },
            }
        })
        // inventory['assets'] = assets;
        // inventory['assetstype'] =assetsType;

        // inventory.splice(0, 0, assets);
        // inventory.splice(0, 0, assetsType);

        // inventory.push({assets:assets,assetsType:assetsType})
        inventory['assets'] = assets;
        if (inventory) {
            return res.status(httpStatus.OK).json({
                message: "Inventory Content Page",
                inventory: inventory,
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
        console.log("id==>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;

        console.log("update", update)

        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedInventory = await Inventory.find({ where: { inventoryId: id } }).then(inventory => {
            return inventory.updateAttributes(update)
        })
        if (updatedInventory) {
            return res.status(httpStatus.OK).json({
                message: "Inventory Updated Page",
                updatedInventory
            });
        }
    } catch (error) {
        console.log("error==>", error)
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
        const updatedInventory = await Inventory.find({ where: { inventoryId: id } }).then(inventory => {
            return inventory.updateAttributes(update)
        })
        if (updatedInventory) {
            return res.status(httpStatus.OK).json({
                message: "Inventory deleted successfully",
                updatedInventory
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
        const updatedInventory = await Inventory.update(update, { where: { inventoryId: { [Op.in]: deleteSelected } } })
        if (updatedInventory) {
            return res.status(httpStatus.OK).json({
                message: "Inventories deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}




