const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');

const SocietyMemberEvent = db.societyMemberEvent;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("creating Society member event");
        let body = req.body;
        const societyMemberEvent = await SocietyMemberEvent.findAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { societyMemberEventName: req.body.societyMemberEventName },
                ]
            }
        })
        // console.log(cities);
        let error = societyMemberEvent.some(member => {
            return member.societyMemberEventName.toLowerCase().replace(/ /g, '') == req.body.societyMemberEventName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Society Event Name already Exists" })
        }
        body.userId = req.userId;
        const event = await SocietyMemberEvent.create(body);
        return res.status(httpStatus.CREATED).json({
            message: "Society Member event created successfully",
        });
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.get = async (req, res, next) => {
    try {
        const event = await SocietyMemberEvent.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']],
        });
        if (event) {
            return res.status(httpStatus.CREATED).json({
                message: "Society Member Event Content Page",
                event
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
        const updatedEvent = await SocietyMemberEvent.find({ where: { societyMemberEventId: id } }).then(event => {
            return event.updateAttributes(update);
        })
        if (updatedEvent) {
            return res.status(httpStatus.OK).json({
                message: "Event deleted successfully",
                updatedEvent
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};

exports.deleteSelected = async (req, res, next) => {
    try {
        const deleteSelected = req.body.ids;
        console.log(req.body.ids);
        console.log("delete selected==>", deleteSelected);
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const updatedEvent = await SocietyMemberEvent.update(update, { where: { societyMemberEventId: { [Op.in]: deleteSelected } } })
        if (updatedEvent) {
            return res.status(httpStatus.OK).json({
                message: "Events deleted successfully",
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        // if (!update) {
        //     return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        // }
        const societyMemberEvent = await SocietyMemberEvent.findAll({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { societyMemberEventName: req.body.societyMemberEventName },
                ]
            }
        })

        let error = societyMemberEvent.some(member => {
            return member.societyMemberEventName.toLowerCase().replace(/ /g, '') == req.body.societyMemberEventName.toLowerCase().replace(/ /g, '');
        });
        if (error) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Society Event Name already Exists" })
        }
        const updatedEvent = await SocietyMemberEvent.find({ where: { societyMemberEventId: id } }).then(event => {
            return event.updateAttributes(update);
        })
        if (updatedEvent) {
            return res.status(httpStatus.OK).json({
                message: "Event updated successfully",
                updatedEvent
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}