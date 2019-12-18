const db = require('../config/db.config.js');
const httpStatus = require('http-status');
const Op = db.Sequelize.Op;
const handler = require('../controller/fingerprint');
const sendSms = require('../controller/checktoken').sendSmsToVendor;
const IndividualVendorBooking = db.individualVendorBooking;
const IndividualVendor = db.individualVendor;
const Service = db.service;
const Rate = db.rate;
const Tower = db.tower;
const Floor = db.floor;
const FlatDetail = db.flatDetail;
const RateType = db.rate;
const City = db.city;
const Location = db.location;
const Country = db.country;
const State = db.state;
const UserRFID = db.userRfid;
const RFID = db.rfid;
const { getUserSelectedFlat, getIndividualVendorDetail } = require('../handlers/user');
const encryption = require('../handlers/encryption');

exports.create = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const body = req.body;
        body.userId = req.userId;
        body.bookedBy = req.userId;
        IndividualVendorBooking.findOne({
            where: {
                individualVendorId: body.individualVendorId,
                startTimeSlotSelected: body.startTimeSlotSelected,
                endTimeSlotSelected: body.endTimeSlotSelected,
                isActive: true
            }
        })
            .then(bookingExist => {
                if (bookingExist !== null) {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'You have already booked this slot'
                    })
                } else {
                    IndividualVendorBooking.create(body, transaction)
                        .then(async booking => {
                            if (booking !== null) {
                                if (body.enableFingerPrint) {
                                    const response = await handler.enableVendorFingerPrintData(booking.individualVendorId);
                                    if (response) {
                                        const vendor = await IndividualVendor.findOne({ where: { isActive: true, individualVendorId: booking.individualVendorId } });
                                        // sendSms(decrypt(vendor.contact));
                                        await transaction.commit();
                                        return res.status(httpStatus.CREATED).json({
                                            message: 'Vendor booking registered successfully'
                                        })
                                    }
                                } else {
                                    const vendor = await IndividualVendor.findOne({ where: { isActive: true, individualVendorId: booking.individualVendorId }, attributes: ['contact'] });
                                    // sendSms(decrypt(vendor.contact));
                                    await transaction.commit();
                                    res.status(httpStatus.CREATED).json({
                                        message: 'Vendor booking registered successfully',
                                    })
                                }
                            } else {
                                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                                    message: 'Vendor booking not registered'
                                })
                            }
                        })
                        .catch(async err => {
                            console.log("::::", err)
                            if (transaction) await transaction.rollback();
                            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                        })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        // console.log("**", err)
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.getBookings = async (req, res, next) => {
    try {
        IndividualVendorBooking.findAll({
            where: {
                isActive: true
            },
        })
            .then(bookings => {
                if (bookings.length !== 0) {
                    const userData = [];
                    const userObject = {};
                    const promise = bookings.map(item => {
                        return getUserSelectedFlat(item.bookedBy, item.flatDetailId, userData);
                    })
                    Promise.all(promise)
                        .then(async result => {
                            Object.assign(userObject, userData);
                            bookings.map(item => {
                                item.bookedBy = userObject;
                            })
                            res.status(httpStatus.OK).send({
                                bookings: bookings
                            })
                        }).catch(err => {
                            console.log("errrrr", err);
                        })
                } else {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'No data available'
                    })
                }
            })
            .catch(err => {
                console.log('Error', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
            })
    } catch (err) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.get = async (req, res, next) => {
    try {
        const userId = req.userId;
        const booking = await IndividualVendorBooking.findAll({ where: { isActive: true, bookedBy: userId }, include: [{ model: IndividualVendor, attributes: ['firstName', 'lastName', 'serviceId', 'rateId', 'rate'], include: [Service, Rate] }, { model: FlatDetail, include: [Tower, Floor] }], order: [['createdAt', 'DESC']] });
        booking.map(item => {
            item.individual_vendor.firstName = encryption.decrypt(item.individual_vendor.firstName)
            item.individual_vendor.lastName = encryption.decrypt(item.individual_vendor.lastName);
            item.individual_vendor.rate = encryption.decrypt(item.individual_vendor.rate)
        })
        if (booking) {
            return res.status(httpStatus.CREATED).json({
                message: "Individual vendor Content Page",
                booking
            });
        }
    } catch (error) {
        console.log("error==>", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.update = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        const update = req.body;
        console.log("update----", update)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const bookings = await IndividualVendorBooking.findOne({
            where: {
                [Op.and]: [
                    { isActive: true },
                    { individualVendorBookingId: id },
                    { individualVendorId: req.body.individualVendorId }
                ]
            }
        })
        // console.log("))))", bookings)
        if (bookings != null) {
            if (bookings.startTimeSlotSelected === update.startTimeSlotSelected || bookings.endTimeSlotSelected === update.endTimeSlotSelected) {
                const updatedBooking = await IndividualVendorBooking.find({ where: { individualVendorBookingId: id } }).then(booking => {
                    return booking.updateAttributes(update, transaction);
                })
                await transaction.commit();
                if (updatedBooking) {
                    return res.status(httpStatus.OK).json({
                        message: "Booking Updated Page",
                        updatedBooking: updatedBooking
                    });
                }
            }
        } else {
            const updatedBooking = await IndividualVendorBooking.find({ where: { individualVendorBookingId: id } }).then(booking => {
                return booking.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (updatedBooking) {
                return res.status(httpStatus.OK).json({
                    message: "Booking Updated Page",
                    updatedBooking
                });
            }
        }
    } catch (error) {
        console.log(":::::", error)
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.delete = async (req, res, next) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.")
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const id = req.params.id;
        console.log(id)
        if (!id) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Id is missing" });
        }
        const update = { isActive: false };
        if (!update) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "Please try again " });
        }
        const booking = await IndividualVendorBooking.find({ where: { individualVendorBookingId: id } }).then(booking => {
            return booking.updateAttributes(update, transaction)
        })
        await transaction.commit();
        if (booking) {
            return res.status(httpStatus.OK).json({
                message: "Individual booking deleted successfully",
                booking
            });
        }
    } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback();
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.deleteSelected = async (req, res, next) => {
    console.log(req.body.ids)
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const deleteSelected = req.body.ids;
        const update = { isActive: false };
        if (!deleteSelected) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: "No id Found" });
        }
        const bookings = await IndividualVendorBooking.update(update, { where: { individualVendorBookingId: { [Op.in]: deleteSelected } }, transaction });
        await transaction.commit();
        if (bookings) {
            return res.status(httpStatus.OK).json({
                message: "Individual bookings deleted successfully",
            });
        }
    } catch (error) {
        console.log(error);
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.provideService = async (req, res, next) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();
        const type = req.params.type;
        const individualVendorBookingId = req.params.id;
        if (!type || !individualVendorBookingId) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ message: 'No id or type is provided' })
        }
        if (type == 'confirm') {
            const update = { confirmedByVendor: true };
            const booking = await IndividualVendorBooking.find({ where: { individualVendorBookingId: individualVendorBookingId } }).then(booking => {
                return booking.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (booking) {
                return res.status(httpStatus.OK).json({
                    message: "Individual booking confirmed successfully",
                    booking
                });
            }
        }
        if (type == 'notConfirm') {
            const update = { confirmedByVendor: false };
            const booking = await IndividualVendorBooking.find({ where: { individualVendorBookingId: individualVendorBookingId } }).then(booking => {
                return booking.updateAttributes(update, transaction)
            })
            await transaction.commit();
            if (booking) {
                return res.status(httpStatus.OK).json({
                    message: "Individual booking confirmed successfully",
                    booking
                });
            }
        }
    } catch (error) {
        console.log(error)
        if (transaction) await transaction.rollback();
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}


exports.slotsNotBooked = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log(id)
        let vendorSend;
        const booking = await IndividualVendorBooking.findOne({
            where: { isActive: true, individualVendorId: id },
            attributes: ['startTimeSlotSelected', 'endTimeSlotSelected', 'confirmedByVendor'],
            raw: true,
            order: [['createdAt', 'DESC']]
        });
        if (booking) {
            const firstSlotBooked = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime: booking.startTimeSlotSelected, endTime: booking.endTimeSlotSelected, isActive: true } });
            if (firstSlotBooked) {
                const slots = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime: booking.startTimeSlotSelected, endTime: booking.endTimeSlotSelected, isActive: true }, attributes: { exclude: ['startTime', 'endTime'] } });
                return res.status(httpStatus.OK).json({ message: 'Vendor available slots', slots })
            }
            const secondSlotBooked = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime1: booking.startTimeSlotSelected, endTime1: booking.endTimeSlotSelected, isActive: true } });
            if (secondSlotBooked) {
                const slots = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime: booking.startTimeSlotSelected, endTime: booking.endTimeSlotSelected, isActive: true }, attributes: { exclude: ['startTime1', 'endTime1'] } });
                return res.status(httpStatus.OK).json({ message: 'Vendor available slots', slots })
            }
            const thirdSlotBooked = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime2: booking.startTimeSlotSelected, endTime2: booking.endTimeSlotSelected, isActive: true } });
            if (thirdSlotBooked) {
                const slots = await IndividualVendor.findOne({ where: { individualVendorId: id, startTime: booking.startTimeSlotSelected, endTime: booking.endTimeSlotSelected, isActive: true }, attributes: { exclude: ['startTime3', 'endTime3'] } });
                return res.status(httpStatus.OK).json({ message: 'Vendor available slots', slots })
            }
            if (firstSlotBooked && secondSlotBooked && thirdSlotBooked) {
                return res.status(httpStatus.OK).json({ message: 'No slots available' })
            }
        } else {
            IndividualVendor.findOne(
                {
                    where: { individualVendorId: id, isActive: true },
                    // order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: City,
                            attributes: ['cityId', 'cityName']
                        },
                        {
                            model: Country,
                            attributes: ['countryId', 'countryName']
                        },
                        {
                            model: State,
                            attributes: ['stateId', 'stateName']
                        },
                        {
                            model: Location,
                            attributes: ['locationId', 'locationName']
                        },
                        {
                            model: Service,
                            attributes: ['serviceId', 'serviceName']
                        },
                        {
                            model: RateType,
                            attributes: ['rateId', 'rateType']
                        },
                    ]
                })
                .then(async vendor => {
                    const rfid = await UserRFID.findOne({
                        where: {
                            userId: vendor.individualVendorId,
                            isActive: true
                        },
                        include: [
                            { model: RFID, where: { isActive: true }, attributes: ['rfidId', 'rfid'] }
                        ]
                    });
                    vendor.firstName = decrypt(vendor.firstName);
                    vendor.lastName = decrypt(vendor.lastName);
                    vendor.userName = decrypt(vendor.userName);
                    vendor.contact = decrypt(vendor.contact);
                    vendor.email = decrypt(vendor.email);
                    vendor.permanentAddress = decrypt(vendor.permanentAddress);
                    vendor.currentAddress = decrypt(vendor.currentAddress);
                    vendor.rate = decrypt(vendor.rate);
                    if (vendor.profilePicture !== null) {
                        vendor.profilePicture = decrypt(vendor.profilePicture);
                    }
                    vendor.documentOne = decrypt(vendor.documentOne);
                    vendor.documentTwo = decrypt(vendor.documentTwo);

                    vendor = vendor.toJSON();

                    if (rfid !== null) {
                        vendor.rfid_master = {
                            rfidId: rfid.rfid_master.rfidId,
                            rfid: rfid.rfid_master.rfid
                        }
                    }
                    else {
                        vendor.rfid_master = rfid;
                    }

                    return vendor;
                })
                .then(vendor => {
                    res.status(httpStatus.OK).json({
                        slots: vendor
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                })
        }
    } catch (error) {
        console.log(error)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}