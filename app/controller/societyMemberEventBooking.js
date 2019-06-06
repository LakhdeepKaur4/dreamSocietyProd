const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status')

const SocietyMemberEventBooking = db.societyMemberEventBooking;
const User = db.user;
const SocietyMemberEvent = db.societyMemberEvent;
const EventSpaceMaster = db.eventSpace;
// const Role = db.role;
const Op = db.Sequelize.Op;

exports.create = async (req, res, next) => {
    try {
        console.log("----> creating event");
        let body = req.body;
        body.userId = req.userId;
        console.log("Body===>", body)

        SocietyMemberEventBooking.findOrCreate({
            where: {
                startDate: body.startDate,
                eventSpaceId: body.eventSpaceId
            },
            // defaults: {
            //     endDate: body.endDate,
            //     numberOfGuestExpected: body.numberOfGuestExpected,
            //     userId: body.userId
            // }
            defaults: body
        })
            .spread((event, created) => {
                if (created) {
                    return res.status(httpStatus.CREATED).json({
                        message: "Event successfully created",
                        event
                    });
                }
                else {
                    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: "Date not available for same venue"
                    });
                }
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};

exports.get = async (req, res, next) => {
    try {
        SocietyMemberEventBooking.findAll({
            where: {
                isActive: true
            },
            include: [
                {
                    model: SocietyMemberEvent
                },
                {
                    model: EventSpaceMaster
                }
            ]
        })
            .then(events => {
                return res.status(httpStatus.CREATED).json({
                    message: "Event Content Page",
                    events: events
                });
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};

exports.getByUserId = async (req, res, next) => {
    try {
        let userId = req.userId;

        SocietyMemberEventBooking.findAll({
            where: {
                isActive: true,
                userId: userId
            },
            include: [
                {
                    model: SocietyMemberEvent
                },
                {
                    model: EventSpaceMaster
                }
            ]
        })
            .then(events => {
                return res.status(httpStatus.CREATED).json({
                    message: "Event Content Page",
                    events: events
                });
            })
            .catch(err => console.log(err))
    } catch (error) {
        console.log("error==>", error)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("Id ===>", id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = req.body;
        console.log("Update ===>", update)
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }

        if ((update['startDate'] !== undefined) && (update['eventSpaceId'] !== undefined)) {
            eventExisting = await SocietyMemberEventBooking.findOne({ where: { startDate: update.startDate, eventSpaceId: update.eventSpaceId, societyMemberEventBookingId: { [Op.ne]: id } } });
        }
        else {
            eventExisting = null;
        }

        if (eventExisting !== null) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                message: "Date not available for same venue"
            });
        } else {
            const updatedEvent = await SocietyMemberEventBooking.find({ where: { societyMemberEventBookingId: id } }).then(event => {
                return event.updateAttributes(update)
            })
            if (updatedEvent) {
                return res.status(httpStatus.CREATED).json({
                    message: "Event Updated Page",
                    event: updatedEvent
                });
            }
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
        const updatedEvent = await SocietyMemberEventBooking.find({ where: { societyMemberEventBookingId: id } }).then(event => {
            return event.updateAttributes(update)
        })
        if (updatedEvent) {
            return res.status(httpStatus.OK).json({
                message: "Event deleted successfully",
                event: updatedEvent
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
        const updatedEvent = await SocietyMemberEventBooking.update(update, { where: { societyMemberEventBookingId: { [Op.in]: deleteSelected } } })
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