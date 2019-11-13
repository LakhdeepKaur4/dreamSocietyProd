const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const Tower = db.tower;
const Tenant = db.tenant;
const Floor = db.floor;
const Owner = db.owner;
const TowerFloor = db.towerFloor;
const FlatDetail = db.flatDetail;
const Op = db.Sequelize.Op;
const OwnerFlatDetail = db.ownerFlatDetail;

exports.create = async (req, res) => {
    let transaction;
    console.log("creating tower");
    let body = req.body;
    body.userId = req.userId;
    try {
        transaction = await db.sequelize.transaction();
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
        const tower = await Tower.create(body, transaction);
        await transaction.commit();
        const towerId = tower.towerId;

        const result = body.floors.forEach(function (element) { element.towerId = towerId });
        const updatedTowerFloor = await TowerFloor.bulkCreate(body.floors, { returning: true }, {
            fields: ["floorId", "towerId"],
        }, { transaction }
        );
        // const updatedTower = await TowerFloor.update(bodyToUpdate, { where: { floorId: { [Op.in]: req.body.floorIds } } });
        await transaction.commit();
        if (updatedTowerFloor) {
            return res.status(httpStatus.CREATED).json({
                message: "Tower Created successfully"
            })
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
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
        console.log("count", flats.count);
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
        const flatIds = [];
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
        // const owners = await Owner.findAll({ where: { isActive: true }});
        // owners.map(owner => {
        //     return flatIds.push(owner.flatDetailId);
        // })
        let ownerFlatDetails = await OwnerFlatDetail.findAll({ where: { isActive: true } });
        ownerFlatDetails.map(ownerFlat => {
            return flatIds.push(ownerFlat.flatDetailId);
        })

        const flatDetail = await FlatDetail.findAll({ where: { towerId: towerId, floorId: { [Op.in]: floorIds }, flatDetailId: { [Op.notIn]: flatIds } } })

        if (tower && flatDetail) {
            res.status(httpStatus.OK).json({ message: 'Tower Floor Page', tower: tower, flatDetail: flatDetail })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.getFloorByTowerId = async (req, res) => {
    try {
        const towerId = req.params.id;
        const flatIds = [];
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
        // const owners = await Owner.findAll({ where: { isActive: true }});
        // owners.map(owner => {
        //     return flatIds.push(owner.flatDetailId);
        // })
        let ownerFlatDetails = await OwnerFlatDetail.findAll({ where: { isActive: true } });
        ownerFlatDetails.map(ownerFlat => {
            return flatIds.push(ownerFlat.flatDetailId);
        })

        const flatDetail = await FlatDetail.findAll({ where: { towerId: towerId, floorId: { [Op.in]: floorIds }, flatDetailId: { [Op.notIn]: flatIds } } })

        if (tower && flatDetail) {
            res.status(httpStatus.OK).json({ message: 'Tower Floor Page', tower: tower, flatDetail: flatDetail })
        }
    } catch (error) {
        console.log(error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}

exports.getFloorByTowerIdForTenant = async (req, res, next) => {
    const towerId = req.params.id;
    const floorArr = [];
    const flatDetailIdArr = [];
    const ownerIdArr = [];
    let towerSend;
    let flat;
    let owner;

    await Tower.findOne({
        where: {
            isActive: true,
            towerId: towerId
        },
        include: [
            { model: Floor, as: 'Floors', where: { isActive: true } }
        ]
    })
        .then(tower => {
            if (tower !== null) {
                // res.json(tower);
                towerSend = tower;
                tower.Floors.map(item => {
                    floorArr.push(item.floorId);
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Tower Not Found'
                })
            }
        })
    console.log(floorArr);

    if (towerSend !== null) {
        await FlatDetail.findAll({
            where: {
                isActive: true,
                towerId: towerId,
                floorId: {
                    [Op.in]: floorArr
                }
            }
        })
            .then(flats => {
                if (flats.length !== 0) {
                    flat = flats
                    flats.map(item => {
                        flatDetailIdArr.push(item.flatDetailId);
                    })
                } else {
                    res.status(httpStatus.OK).json({
                        message: 'No Flat Found',
                        tower: towerSend,
                        flatDetail: flats
                    })
                }
            })
        if (flat.length !== 0) {
            await OwnerFlatDetail.findAll({
                where: {
                    isActive: true,
                    flatDetailId: {
                        [Op.in]: flatDetailIdArr
                    }
                }
            })
                .then(owners => {
                    owner = owners;
                    if (owners.length !== 0) {
                        owners.map(item => {
                            ownerIdArr.push(item.ownerId);
                        })
                    }
                    else {
                        res.status(httpStatus.OK).json({
                            message: 'No Flat Found',
                            tower: towerSend,
                            flatDetail: []
                        })
                    }
                })

            if (owner.length !== 0) {
                await Owner.findAll({
                    where: {
                        isActive: true,
                        ownerId: {
                            [Op.in]: ownerIdArr
                        }
                    }
                })
                    .then(owners => {
                        owner = owners;
                        if (owners.length !== 0) {
                            ownerIdArr.splice(0, ownerIdArr.length);
                            owners.map(item => {
                                ownerIdArr.push(item.ownerId);
                            })
                        } else {
                            res.status(httpStatus.OK).json({
                                message: 'No Flat Found',
                                tower: towerSend,
                                flatDetail: []
                            })
                        }
                    })

                if (owner.length !== 0) {
                    await OwnerFlatDetail.findAll({
                        where: {
                            isActive: true,
                            ownerId: {
                                [Op.in]: ownerIdArr
                            }
                        }
                    })
                        .then(owners => {
                            owner = owners;
                            if (owners.length !== 0) {
                                flatDetailIdArr.splice(0, flatDetailIdArr.length);
                                owners.map(item => {
                                    flatDetailIdArr.push(item.flatDetailId);
                                })
                            }
                            else {
                                res.status(httpStatus.OK).json({
                                    message: 'No Flat Found',
                                    tower: towerSend,
                                    flatDetail: []
                                })
                            }
                        })

                    if (owner.length !== 0) {
                        FlatDetail.findAll({
                            where: {
                                isActive: true,
                                flatDetailId: {
                                    [Op.in]: flatDetailIdArr
                                },
                                towerId: towerId,
                                floorId: {
                                    [Op.in]: floorArr
                                }
                            }
                        })
                            .then(flats => {
                                console.log(towerId, floorArr)
                                if (flats.length !== 0) {
                                    res.status(httpStatus.OK).json({
                                        message: 'Flats Found',
                                        tower: towerSend,
                                        flatDetail: flats
                                    })
                                } else {
                                    res.status(httpStatus.OK).json({
                                        message: 'No Flat Found',
                                        tower: towerSend,
                                        flatDetail: flats
                                    })
                                }
                            })
                    }


                }


            }


        }

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
    let transaction;
    try {
        console.log("-----update---------");
        transaction = await db.sequelize.transaction();
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
                return tower.updateAttributes(updates, transaction)
            })
            if (req.body.floors) {
                const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
                const towerFloorId = towerFloor.map(towerFloor => {
                    towerIds.push(towerFloor.towerFloorId)
                });

                await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } }, transaction });

                const result = req.body.floors.forEach(function (element) {
                    element.towerId = towerId
                    console.log(element.towerId)
                });
                const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
                    fields: ["floorId", "towerId"],
                }, { transaction }
                );
            }
            await transaction.commit();
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
                return tower.updateAttributes(updates, transaction)
            })
            if (req.body.floors) {
                const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
                const towerFloorId = towerFloor.map(towerFloor => {
                    towerIds.push(towerFloor.towerFloorId)
                });

                await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } }, transaction });

                const result = req.body.floors.forEach(function (element) {
                    element.towerId = towerId
                    console.log(element.towerId)
                });
                const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
                    fields: ["floorId", "towerId"],
                }, { transaction }
                );
            }
            await transaction.commit();
            return res.status(httpStatus.OK).json({
                message: "Tower Updated Succussfully"
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }

}

exports.updateTowerAndFloor = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const towerId = req.params.id;
        let towerIds = [];
        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: towerId } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId)
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } }, transaction });

        const result = req.body.floors.forEach(function (element) {
            element.towerId = towerId
            console.log(element.towerId)
        });
        const updatedTowerFloor = await TowerFloor.bulkCreate(req.body.floors, { returning: true }, {
            fields: ["floorId", "towerId"],
        }, { transaction }
        );
        await transaction.commit();
        res.status(httpStatus.OK).json({ message: 'Updated Successfully' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

exports.delete = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
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
            return tower.updateAttributes(update, transaction)
        })

        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: id } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId)
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds } }, transaction });
        await transaction.commit();
        if (deleteTowerFloor) {
            return res.status(httpStatus.OK).json({
                message: "Tower and Floor deleted successfully"
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
        let towerIds = [];
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedTower = await Tower.update(update, { where: { towerId: { [Op.in]: deleteSelected } }, transaction });

        const towerFloor = await TowerFloor.findAll({ where: { isActive: true, towerId: id } });
        const towerFloorId = towerFloor.map(towerFloor => {
            towerIds.push(towerFloor.towerFloorId);
        });
        // console.log(towerIds);
        const deleteTowerFloor = await TowerFloor.destroy({ where: { towerFloorId: { [Op.in]: towerIds }, transaction } });
        await transaction.commit();
        if (deleteTowerFloor) {
            return res.status(httpStatus.OK).json({
                message: "Tower and Floors deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

