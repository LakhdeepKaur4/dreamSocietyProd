const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const Op = db.Sequelize.Op;

const Complaint = db.complaint;
const ComplaintStatus = db.complaintStatus;
const Service = db.service;
const FlatDetail = db.flatDetail;
const Vendor = db.vendor;
const VendorComplaints = db.vendorComplaints;
const VendorService = db.vendorService;
const Feedback = db.feedback;


let encrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let cipher = crypto.createCipher(algorithm, key);
    let encryptedText = cipher.update(text, 'utf8', 'hex');
    encryptedText += cipher.final('hex');
    return encryptedText;
}

let decrypt = (text) => {
    let key = config.secret;
    let algorithm = 'aes-128-cbc';
    let decipher = crypto.createDecipher(algorithm, key);
    let decryptedText = decipher.update(text, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}

exports.create = (req, res, next) => {
    const complaintBody = req.body;
    const vendorIds = [];

    console.log('Complaint ===>', complaintBody);

    complaintBody.complaintStatusId = 1;
    complaintBody.userId = req.userId;

    if (complaintBody !== null) {
        Complaint.create(complaintBody)
            .then(complaint => {
                if (complaint !== null) {
                    VendorService.findAll({
                        where: {
                            serviceId: complaint.serviceId,
                            isActive: true
                        },
                        attributes: ['vendorId']
                    })
                        .then(vendorIdsRes => {
                            if (vendorIdsRes.length !== 0) {
                                vendorIdsRes.map(item => {
                                    vendorIds.push(item.vendorId);
                                })
                                Vendor.findAll({
                                    where: {
                                        vendorId: {
                                            [Op.in]: vendorIds
                                        },
                                        isActive: true
                                    },
                                    attributes: ['vendorId']
                                })
                                    .then(vendorIdsRec => {
                                        if (vendorIdsRec.length !== 0) {
                                            vendorIdsRec.map(item => {
                                                VendorComplaints.create({
                                                    vendorId: item.vendorId,
                                                    complaintId: complaint.complaintId
                                                })
                                            })
                                        }
                                    })
                            }

                        })
                    res.status(httpStatus.CREATED).json({
                        message: 'Compalint registered successfully'
                    })
                } else {
                    res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        message: 'Complaint not registered'
                    })
                }
            })
            .catch(err => {
                console.log('Error ===>', err);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
            })
    } else {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: 'Please provide complete details'
        })
    }
}

exports.get = (req, res, next) => {
    Complaint.findAll({
        where: {
            isActive: true
        },
        include: [
            { model: ComplaintStatus },
            { model: FlatDetail, where: { isActive: true } },
            { model: Service, where: { isActive: true } }
        ]
    })
        .then(complaints => {
            if (complaints.length !== 0) {
                res.status(httpStatus.OK).json({
                    complaints: complaints
                })
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No Data Found'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.getByUserId = (req, res, next) => {
    const complaintsSend = [];
    Complaint.findAll({
        where: {
            isActive: true,
            userId: req.userId
        },
        include: [
            { model: ComplaintStatus },
            { model: FlatDetail, where: { isActive: true } },
            { model: Service, where: { isActive: true } },
            // { model: Vendor, where: { isActive: true }, attributes: ['vendorId','firstName','lastName'] }
        ]
    })
        .then(complaints => {
            if (complaints.length !== 0) {
                complaints.map(async item => {
                    if (item.vendorId !== null) {
                        await Vendor.findOne({
                            where: {
                                isActive: true,
                                vendorId: item.vendorId
                            }
                        })
                            .then(vendor => {
                                vendor.firstName = decrypt(vendor.firstName);
                                vendor.lastName = decrypt(vendor.lastName);
                                vendor.contact = decrypt(vendor.contact);
                                item = item.toJSON();
                                item.vendor_master = {
                                    vendorId: vendor.vendorId,
                                    firstName: vendor.firstName,
                                    lastName: vendor.lastName,
                                    contact: vendor.contact
                                }
                                complaintsSend.push(item);
                            })
                    }
                    else {
                        complaintsSend.push(item);
                    }
                })
                setTimeout(() => {
                    res.status(httpStatus.OK).json({
                        complaints: complaintsSend
                    })
                }, 1000);
            } else {
                res.status(httpStatus.NO_CONTENT).json({
                    message: 'No Data Found'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.cancelRequestByUser = (req, res, next) => {
    const complaintId = req.body.complaintId;
    console.log('Complaint ID ===>', complaintId);

    Complaint.update({ complaintStatusId: 5 }, { where: { complaintId: complaintId, isActive: true } })
        .then(complaintCancelled => {
            if (complaintCancelled[0] === 1) {
                res.status(httpStatus.CREATED).json({
                    message: 'Complaint cancelled successfully'
                })
            } else {
                res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                    message: 'Complaint not cancelled'
                })
            }
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.feedback = (req, res, next) => {
    const feedback = req.body;
    feedback.userId = req.userId;
    console.log('Feedback ===>', feedback);

    Feedback.create(feedback)
        .then(feedbackCreated => {
            if (feedbackCreated.status === 'Reopen') {
                Complaint.findOne({
                    where: {
                        complaintId: feedbackCreated.complaintId,
                        isActive: true
                    }
                })
                    .then(complaint => {
                        complaint = complaint.toJSON();
                        delete complaint.complaintId;
                        delete complaint.createdAt;
                        delete complaint.updatedAt;
                        delete complaint.vendorId;
                        delete complaint.selectedSlot;
                        complaint.isAccepted = false;
                        complaint.complaintStatusId = 1;
                        complaint.userId = req.userId;
                        Complaint.create(complaint)
                            .then(complaintCreated => {
                                if (complaintCreated !== null) {
                                    delete feedback.complaintId;
                                    delete feedback.vendorId;
                                    delete feedback.userId;
                                    delete feedback.rating;
                                    delete feedback.status;
                                    delete feedback.feedback;
                                    Complaint.update({ feedback }, { where: { complaintId: complaintCreated.complaintId } });
                                    VendorService.findAll({
                                        where: {
                                            serviceId: complaintCreated.serviceId,
                                            isActive: true
                                        },
                                        attributes: ['vendorId']
                                    })
                                        .then(vendorIdsRes => {
                                            if (vendorIdsRes.length !== 0) {
                                                vendorIdsRes.map(item => {
                                                    vendorIds.push(item.vendorId);
                                                })
                                                Vendor.findAll({
                                                    where: {
                                                        vendorId: {
                                                            [Op.in]: vendorIds
                                                        },
                                                        isActive: true
                                                    },
                                                    attributes: ['vendorId']
                                                })
                                                    .then(vendorIdsRec => {
                                                        if (vendorIdsRec.length !== 0) {
                                                            vendorIdsRec.map(item => {
                                                                VendorComplaints.create({
                                                                    vendorId: item.vendorId,
                                                                    complaintId: complaintCreated.complaintId
                                                                })
                                                            })
                                                        }
                                                    })
                                            }

                                        })
                                    res.status(httpStatus.CREATED).json({
                                        message: 'Compalint registered successfully'
                                    })
                                }
                            })
                    })
            }
            res.status(httpStatus.CREATED).json({
                message: 'Feedback submitted successfully'
            })
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteComplaints = (req, res, next) => {
    const ids = req.body.complaintIds;
    console.log('Comaplaint IDs ===>', ids);

    Complaint.findAll({
        where: {
            isActive: true,
            complaintId: {
                [Op.in]: ids
            }
        }
    })
        .then(complaints => {
            complaints.map(item => {
                item.updateAttributes({ isActive: false })
            })
            res.status(httpStatus.OK).json({
                message: 'Deleted successfully'
            })
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}