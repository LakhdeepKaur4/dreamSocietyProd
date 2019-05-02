const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const Complaint = db.complaint;
const ComplaintStatus = db.complaintStatus;
const Service = db.service;
const FlatDetail = db.flatDetail;
const Vendor = db.vendor;


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

    console.log('Complaint ===>', complaintBody);

    complaintBody.complaintStatusId = 1;
    complaintBody.userId = req.userId;

    if (complaintBody !== null) {
        Complaint.create(complaintBody)
            .then(complaint => {
                if (complaint !== null) {
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