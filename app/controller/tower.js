const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const Tower = db.tower;
const Floor = db.floor;
const Owner = db.owner;
const TowerFloor = db.towerFloor;
const FlatDetail = db.flatDetail;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    console.log("creating tower");
    let body = req.body;
    body.userId = req.userId;
    try {
        const towers = await Tower.findAll({
            where: {
                isActive: true
            }
        })

        let error = towers.some(tower => {
            return tower.towerName.toLowerCase().replace(/ /g, '') == req.body.towerName.toLowerCase().replace(/ /g, '');
        });
        console.log(error);
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Tower Name already Exists" })
        }
        const tower = await Tower.create(body);
        const towerId = tower.towerId;

        const result = body.floors.forEach(function (element) { element.towerId = towerId });

        const updatedTowerFloor = await TowerFloor.bulkCreate(body.floors, { returning: true }, {
            fields: ["floorId", "towerId"],
        },
        );

        // const updatedTower = await TowerFloor.update(bodyToUpdate, { where: { floorId: { [Op.in]: req.body.floorIds } } });

        if (updatedTowerFloor) {
            return res.status(httpStatus.CREATED).json({
                message: "Tower Created successfully"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }

}

exports.get = async (req, res) => {
    let towerIds = [];
    const tower = await Tower.findAll({
        where: { isActive: true },
        // include:[{model:'Floor',as:'Floors'}],
        order: [['createdAt', 'DESC']],
    })
    // .then(tower => {
    if (tower) {
        tower.map(tower => {
            towerIds.push(tower.towerId);
        })
        // console.log(towerIds);
        const flats = await FlatDetail.findAndCountAll({
            where: {
                isActive: true,
                towerId: {
                    [Op.in]: towerIds
                }
            }
        })
        // console.log("flats==>",flats)
        console.log("count",flats.count);
        // console.log("rows",flats.rows);
// 
        //                 Project
        //   .findAndCountAll({
        //      where: {
        //         title: {
        //           [Op.like]: 'foo%'
        //         }
        //      },
        //      offset: 10,
        //      limit: 2
        //   })
        //   .then(result => {
        //     console.log(result.count);
        //     console.log(result.rows);
        //   });
        res.json(tower);
    }
    // });
}


exports.getTowerAndFloor = async (req, res) => {
    try {
        const tower = await Tower.findAll({
            where: { isActive: true },
            include: [{
                model: Floor,
                as: 'Floors',
                attributes: ['floorId', 'floorName'],
                through: {
                    attributes: ['floorId', 'floorName'],
                }
            }
            ]
            , order: [['createdAt', 'DESC']]
        });
        if (tower) {
            res.status(httpStatus.OK).json({ message: 'Tower Floor Page', tower })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}


exports.getFloorByTowerId = async (req, res) => {
    try {
        const towerId = req.params.id;
        const floorIds = [];
        const floors = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
        console.log(floors.map(floor => {
            floorIds.push(floor.floorId);
        }))
        console.log(floorIds);
        const tower = await Tower.findOne({
            where: { isActive: true, towerId: towerId },
            include: [{
                model: Floor,
                as: 'Floors',
                attributes: ['floorId', 'floorName'],
                through: {
                    attributes: ['floorId', 'floorName'],
                }
            }
            ]
            , order: [['createdAt', 'DESC']]
        });
        const flatDetail = await FlatDetail.findAll({ where: { towerId: towerId, floorId: { [Op.in]: floorIds } } })
        if (tower && flatDetail) {
            res.status(httpStatus.OK).json({ message: 'Tower Floor Page', tower: tower, flatDetail: flatDetail })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.getFloorByTowerIdForTenant = async (req, res) => {
    try {
        console.log("in here")
        const towerId = req.params.id;
        const floorIds = [];
        const flatIds = [];
        let flatDetailId;
        const floors = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
        floors.map(floor => {
            floorIds.push(floor.floorId);
        })
        console.log("floorIds===>", floorIds);
        const tower = await Tower.findOne({
            where: { isActive: true, towerId: towerId },
            include: [{
                model: Floor,
                as: 'Floors',
                attributes: ['floorId', 'floorName'],
                through: {
                    attributes: ['floorId', 'floorName'],
                }
            }
            ]
            , order: [['createdAt', 'DESC']]
        });

        const flatDetail = await FlatDetail.findAll({ where: { isActive: true, towerId: towerId, floorId: { [Op.in]: floorIds } } })
        flatDetail.map(flats => {
            flatIds.push(flats.flatDetailId);
        })
        const owner = await Owner.findAll({ where: { isActive: true, flatDetailId: { [Op.in]: flatIds } } })
        owner.map(flat => {
            flatDetailId = flat.flatDetailId;
        })
        const flat = await FlatDetail.findAll({ where: { isActive: true, flatDetailId: flatDetailId } })
        if (tower && flatDetail && flat) {
            return res.status(httpStatus.OK).json({ message: 'Tower Floor Page', tower: tower, flatDetail: flat })
        } else {
            return res.status(httpStatus.OK).json({ message: 'No Flats Found' })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.getById = (req, res) => {
    Tower.findOne({
        where: { id: req.userId },
    }).then(tower => {
        res.status(200).json({
            "description": "Tower Content Page",
            "tower": tower
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not tower Page",
            "error": err
        });
    })
}

exports.update = async (req, res) => {
    console.log("-----update---------");
    const id = req.params.id;
    const towerId = req.params.id;

    let towerIds = [];
    const updates = req.body;
    if (!id) {
        res.json("Please enter id");
    }
    const tower = await Tower.findOne({
        where: {
            [Op.and]: [
                { isActive: true },
                { towerId: id },
            ]
        }
    })

    if (tower.towerName === updates.towerName) {
        const updatedTower = await Tower.find({ where: { towerId: id } }).then(tower => {
            return tower.updateAttributes(updates)
        })
        if (req.body.floors) {
            const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
            const towerFloorId = towerFloor.map(towerFloor => {
                towerIds.push(towerFloor.towerFloorId)
            });

            await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } } });

            const result = req.body.floors.forEach(function (element) {
                element.towerId = towerId
                console.log(element.towerId)
            });
            const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
                fields: ["floorId", "towerId"],
            },
            );
        }
        // if (updatedTowerFloor) {
        return res.status(httpStatus.OK).json({
            message: "Tower Updated Succussfully"
        });
        // }
    } else {
        const towers = await Tower.findAll({
            where: {
                isActive: true
            }
        })
        let error = towers.some(tower => {
            return tower.towerName.toLowerCase().replace(/ /g, '') == req.body.towerName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Tower Name already Exists" })
        }
        const updatedTower = await Tower.find({ where: { towerId: id } }).then(tower => {
            return tower.updateAttributes(updates)
        })
        if (req.body.floors) {
            const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
            const towerFloorId = towerFloor.map(towerFloor => {
                towerIds.push(towerFloor.towerFloorId)
            });

            await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } } });

            const result = req.body.floors.forEach(function (element) {
                element.towerId = towerId
                console.log(element.towerId)
            });
            const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
                fields: ["floorId", "towerId"],
            },
            );
        }
        return res.status(httpStatus.OK).json({
            message: "Tower Updated Succussfully"
        });
    }
}

exports.updateTowerAndFloor = async (req, res) => {
    try {
        const towerId = req.params.id;

        let towerIds = [];
        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId)
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } } });

        const result = req.body.floors.forEach(function (element) {
            element.towerId = towerId
            console.log(element.towerId)
        });
        const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
            fields: ["floorId", "towerId"],
        },
        );

        res.json({ message: 'Updated Successfully' });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        let towerIds = [];

        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const updatedTower = await Tower.find({ where: { towerId: id } }).then(tower => {
            return tower.updateAttributes(update)
        })

        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: id } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId)
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } } });
        if (deleteTowerFloor) {
            return res.status(httpStatus.OK).json({
                message: "Tower and Floor deleted successfully"
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        let towerIds = [];
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedTower = await Tower.update(update, { where: { towerId: { [Op.in]: deleteSelected } } });

        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: id } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId)
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } } });
        if (deleteTowerFloor) {
            return res.status(httpStatus.OK).json({
                message: "Tower and Floors deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

