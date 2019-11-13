const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require("http-status")

const State = db.state;
const Country = db.country;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        console.log("creating state");
        const states = await State.findAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { countryId: req.body.countryId }
                ]
            }
        })
        console.log(states);
        let error = states.some(state => {
            return state.stateName.toLowerCase().replace(/ /g, '') == req.body.stateName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            console.log("inside state");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "State Name already Exists" })
        }
        State.create({
            stateName: req.body.stateName,
            stateId: req.body.stateId,
            countryId: req.body.countryId,
            userId: req.userId
        }, transaction).then(async state => {
            await transaction.commit();
            res.json({ message: "State added successfully!", state: state });
        }).catch(async err => {
            if (transaction) await transaction.rollback();
            res.status(500).send("Fail! Error -> " + err);
        })
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = (req, res) => {
    State.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        include: [{ model: Country, attributes: ['countryId', 'countryName'] }]
    })
        .then(state => {
            res.json(state);
        });
}

exports.getById = (req, res) => {
    State.findOne({
        where: { id: req.userId },
    }).then(state => {
        res.status(200).json({
            "description": "State Content Page",
            "state": state
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not state Page",
            "error": err
        });
    })
}

exports.getCountry = (req, res) => {
    State.findAll({
        where: {
            [Op.and]: [
                { countryId: req.params.id },
                { isActive: true }
            ]
        }
    }).then(state => {
        res.status(200).json(state);
    }).catch(err => {
        res.status(500).json({
            "description": "Can not state Page",
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

        const state = await State.findOne({
            where: {
                stateId: id,
                isActive: true
            }
        })

        if (state.stateName === updates.stateName) {
            const updatedState = await State.find({ where: { stateId: id } }).then(state => {
                return state.updateAttributes(updates, transaction)
            })
            await transaction.commit();
            if (updatedState) {
                return res.status(httpStatus.OK).json({
                    message: "State Updated Page",
                    updatedState: updatedState
                });
            }
        } else {
            const states = await State.findAll({
                where: {
                    [Op.and]: [
                        { isActive: true },
                        { countryId: req.body.countryId }
                    ]
                }
            })
            let error = states.some(state => {
                return state.stateName.toLowerCase().replace(/ /g, '') == req.body.stateName.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                console.log("inside state");
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "State Name already Exists" })
            }
            const updatedState = await State.find({ where: { stateId: id } }).then(state => {
                return state.updateAttributes(updates, transaction)
            })
            await transaction.commit();
            if (updatedState) {
                return res.status(httpStatus.OK).json({
                    message: "State deleted successfully",
                    state: updatedState
                });
            }
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update1 = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        if (!id) {
            res.json("Please enter id");
        }
        const states = await State.findAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { countryId: req.body.countryId }
                ]
            }
        })
        console.log(states);
        let error = states.some(state => {
            return state.stateName.toLowerCase().replace(/ /g, '') == req.body.stateName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            console.log("inside state");
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "State Name already Exists" })
        }
        const updates = req.body;
        const updatedState = await State.find({ where: { stateId: id } }).then(state => {
            return state.updateAttributes(update, transaction)
        });
        await transaction.commit();
        if (updatedState) {
            return res.status(httpStatus.OK).json({
                message: "State deleted successfully",
                state: updatedState
            });
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
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
        const updatedState = await State.find({ where: { stateId: id } }).then(state => {
            return state.updateAttributes(update)
        })
        if (updatedState) {
            return res.status(httpStatus.OK).json({
                message: "State deleted successfully",
                state: updatedState
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
        const updatedState = await State.update(update, { where: { stateId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (updatedState) {
            return res.status(httpStatus.OK).json({
                message: "States deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}
