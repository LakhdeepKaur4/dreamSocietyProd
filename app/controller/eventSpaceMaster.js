const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const EventSpace = db.eventSpace;
const Size = db.size;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating event Space");
        let body = req.body;
        console.log(body);
        const eventSpaces = await EventSpace.findAll({
            where: {
                isActive: true
            }
        })
        let error = eventSpaces.some(eventSpace => {
            return eventSpace.spaceName.toLowerCase().replace(/ /g, '') == req.body.spaceName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Event Space Name already Exists" })
        }
        body.userId = req.userId;
        const eventSpace = await EventSpace.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Event Space registered successfully",
            eventSpace
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.get = async (req, res, next) => {
    try {
        const eventSpace = await EventSpace.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Size }
            ]
        });
        if (eventSpace) {
            return res.status(httpStatus.CREATED).json({
                message: "Event Space Content Page",
                societyMember: eventSpace
            });
        }
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.update = async (req, res, next) => {
    let updAttr = {};
    let attrArr = ['spaceName', 'capacity', 'spaceType', 'area', 'description', 'sizeId'];

    try {
        console.log("updating event Space");
        console.log(":::::req.body==>", req.body)
        const id = req.params.id;
        console.log(":::::id", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const eventSpaces = await EventSpace.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { eventSpaceId: id }
                ]
            }
        })

        if (eventSpaces.spaceName === update.spaceName) {
            const updatedEventSpace = await EventSpace.find({ where: { eventSpaceId: id } }).then(eventSpace => {
                return eventSpace.updateAttributes(update)
            })
            if (updatedEventSpace) {
                return res.status(httpStatus.OK).json({
                    message: "Event Space Updated Page",
                    updatedEventSpace: updatedEventSpace
                });
            }
        } else {
            const eventSpaces = await EventSpace.findAll({
                where: {
                    isActive: true
                }
            })
            let error = eventSpaces.some(eventSpace => {
                return eventSpace.spaceName.toLowerCase().replace(/ /g, '') == req.body.spaceName.toLowerCase().replace(/ /g, '');
            });
            if (error) {
                return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Event Space Name already Exists" })
            }
            const updatedEventSpace = await EventSpace.find({ where: { eventSpaceId: id } }).then(eventSpace => {

                attrArr.forEach(attr => {
                    if (attr in req.body && req.body[attr] !== undefined && req.body[attr] !== null) {
                        updAttr[attr] = req.body[attr];
                    }
                })

                return eventSpace.updateAttributes(updAttr);
            })

            return res.status(httpStatus.OK).json({
                message: "Event Space Updated Page",
                vendor: updatedEventSpace
            });
        }
    } catch (error) {
        console.log(error)
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
        const eventSpace = await EventSpace.find({ where: { eventSpaceId: id } }).then(eventSpace => {
            return eventSpace.updateAttributes(update)
        })
        if (eventSpace) {
            return res.status(httpStatus.OK).json({
                message: "Event Space deleted successfully",
                societyMember: eventSpace
            });
        }
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids
        console.log("delete selected==>", deleteSelected);

        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedEventSpace = await EventSpace.update(update, { where: { eventSpaceId: { [Op.in]: deleteSelected } } })
        if (updatedEventSpace) {
            return res.status(httpStatus.OK).json({
                message: "EventSpaces deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}






