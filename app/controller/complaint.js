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

exports.create = async (req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
        const complaintBody = req.body;
    const vendorIds = [];

    console.log('Complaint ===>', complaintBody);

    complaintBody.complaintStatusId = 1;
    complaintBody.userId = req.userId;

    if (complaintBody !== null) {
        Complaint.create(complaintBody,transaction)
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
                                    .then(async vendorIdsRec => {
                                        if (vendorIdsRec.length !== 0) {
                                            vendorIdsRec.map(item => {
                                                VendorComplaints.create({
                                                    vendorId: item.vendorId,
                                                    complaintId: complaint.complaintId
                                                },transaction)
                                            })
                                            await transaction.commit();
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
            .catch(async err => {
                if(transaction) await transaction.rollback();
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
            })
    } else {
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
            message: 'Please provide complete details'
        })
    }
}catch(err){
    if(transaction) await transaction.rollback();
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err)
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
                const promise = complaints.map(async item => {
                    if (item.vendorId !== null) {
                        const vendor = await Vendor.findOne({
                            where: {
                                isActive: true,
                                vendorId: item.vendorId
                            }
                        })
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

                        const feedback = await Feedback.findOne({
                            where: {
                                complaintId: item.complaintId,
                                isActive: true
                            }
                        })

                        if (feedback !== null) {
                            item.feedbackDisable = true;
                        } else {
                            item.feedbackDisable = false;
                        }
                        complaintsSend.push(item);

                    }
                    else {
                        item = item.toJSON();
                        item.feedbackDisable = false;
                        complaintsSend.push(item);
                    }
                })
                Promise.all(promise)
                    .then(result => {
                        complaintsSend.sort(function (a, b) {
                            return Number(a.complaintId) - Number(b.complaintId)
                        });
                        res.status(httpStatus.OK).json({
                            complaints: complaintsSend
                        })
                    })
                    .catch(err => {
                        console.log(err)
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

exports.cancelRequestByUser = async(req, res, next) => {
   let transaction;
    try{
    transaction = await db.sequelize.transaction()   
    const complaintId = req.body.complaintId;
    console.log('Complaint ID ===>', complaintId);

    Complaint.update({ complaintStatusId: 5 }, { where: { complaintId: complaintId, isActive: true },transaction })
        .then(async complaintCancelled => {
            await transaction.commit();
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
        .catch(async err => {
            if(transaction) await transaction.rollback()
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback()
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.feedback = async(req, res, next) => {
    let transaction;
    try{
    transaction = await db.sequelize.transaction()    
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
                    .then(async complaint => {
                        complaint = complaint.toJSON();
                        delete complaint.complaintId;
                        delete complaint.createdAt;
                        delete complaint.updatedAt;
                        delete complaint.vendorId;
                        delete complaint.selectedSlot;
                        complaint.isAccepted = false;
                        complaint.complaintStatusId = 1;
                        complaint.userId = req.userId;
                        Complaint.create(complaint,transaction)
                            .then(async complaintCreated => {
                                if (complaintCreated !== null) {
                                    delete feedback.complaintId;
                                    delete feedback.vendorId;
                                    delete feedback.userId;
                                    delete feedback.rating;
                                    delete feedback.status;
                                    delete feedback.feedback;
                                    Complaint.update({ feedback }, { where: { complaintId: complaintCreated.complaintId },transaction });
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
                                                    .then(async vendorIdsRec => {
                                                        if (vendorIdsRec.length !== 0) {
                                                            vendorIdsRec.map(item => {
                                                                VendorComplaints.create({
                                                                    vendorId: item.vendorId,
                                                                    complaintId: complaintCreated.complaintId
                                                                },transaction)
                                                            })
                                                            await transaction.commit();
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
        .catch(async err => {
            if(transaction) await transaction.rollback();
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}

exports.deleteComplaints = async (req, res, next) => {
    let transaction;
    try{
        transaction = await db.sequelize.transaction();
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
        .then(async complaints => {
            complaints.map(item => {
                item.updateAttributes({ isActive: false },transaction)
            })
            await transaction.commit();
            res.status(httpStatus.OK).json({
                message: 'Deleted successfully'
            })
        })
        .catch(async err => {
            if(transaction) await transaction.rollback();
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
    }catch(err){
        if(transaction) await transaction.rollback();
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
    }
}