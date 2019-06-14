const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const Op = db.Sequelize.Op;

const VendorComplaints = db.vendorComplaints;
const Complaint = db.complaint;
const ComplaintStatus = db.complaintStatus;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const User = db.user;
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

exports.getById = (req, res, next) => {
    const id = req.userId;
    console.log('Vendor ID ===>', id);
    const complaintIds = [];
    const complaintsArr = [];

    VendorComplaints.findAll({
        where: {
            vendorId: id,
            isActive: true
        }
    })
        .then(complaints => {
            // console.log("C---->",complaints);
            complaints.map(item => {
                complaintIds.push(item.complaintId);
            })
            // console.log("C---->", complaintIds);
            Complaint.findAll({
                where: {
                    complaintId: {
                        [Op.in]: complaintIds
                    },
                    isActive: true
                },
                include: [
                    { model: ComplaintStatus },
                    {
                        model: FlatDetail, where: { isActive: true }, include: [
                            { model: Tower, where: { isActive: true } },
                            { model: Floor, where: { isActive: true } },
                        ]
                    },
                    { model: User, where: { isActive: true }, attributes: ['firstName', 'lastName', 'contact'] }
                ]
            })
                .then(complaints => {
                    const slotArr = [];
                    complaints.map(item => {
                        let disable;
                        slotArr.splice(0, slotArr.length);
                        item.user_master.firstName = decrypt(item.user_master.firstName);
                        item.user_master.lastName = decrypt(item.user_master.lastName);
                        item.user_master.contact = decrypt(item.user_master.contact);

                        if (item.slotTime1 !== '') {
                            slotArr.push(item.slotTime1)
                        }
                        if (item.slotTime2 !== '') {
                            slotArr.push(item.slotTime2)
                        }
                        if (item.slotTime3 !== '') {
                            slotArr.push(item.slotTime3)
                        }
                        item = item.toJSON();
                        item.slots = slotArr;
                        // console.log(slotArr);

                        if (item.isAccepted === true && item.vendorId !== req.userId) {
                            disable = true;
                        }
                        else {
                            disable = false;
                        }
                        item.disable = disable;
                        complaintsArr.push(item);
                    })
                    res.status(httpStatus.OK).json({
                        complaints: complaintsArr
                    })
                })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.rejectComplaint = (req, res, next) => {
    const id = req.body.complaintId;
    console.log('Complaint ID ===>', id);

    VendorComplaints.findOne({
        where: {
            complaintId: id,
            vendorId: req.userId,
            isActive: true
        }
    })
        .then(complaint => {
            complaint.destroy();
            VendorComplaints.update({ isActive: true }, { where: { complaintId: id, vendorId: { [Op.ne]: req.userId } } });
            Complaint.findOne({
                where: {
                    complaintId: id,
                    isActive: true,
                    isAccepted: true
                }
            })
                .then(complaint => {
                    complaint.updateAttributes({ vendorId: null, isAccepted: false, complaintStatusId: 1 });
                })

            res.status(httpStatus.OK).json({
                message: 'Complaint rejected successfully'
            })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.acceptComplaint = (req, res, next) => {
    const id = req.body.complaintId;
    console.log('Complaint ID ===>', id);

    Complaint.findOne({
        where: {
            complaintId: id,
            isActive: true,
            isAccepted: false
        }
    })
        .then(complaint => {
            if (complaint !== null) {
                complaint.updateAttributes({ isAccepted: true, vendorId: req.userId, complaintStatusId: 6 });
                res.status(httpStatus.OK).json({
                    message: 'Complaint accepted by vendor.'
                })
            } else {
                res.status(httpStatus.OK).json({
                    message: "Please refresh complaint may be already have been in accepted state or doesn't exist anymore."
                })
            }
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.selectSlot = (req, res, next) => {
    const body = req.body;
    console.log('Slot selected ===>', body);

    Complaint.findOne({
        where: {
            complaintId: body.complaintId,
            isActive: true,
            isAccepted: true
        }
    })
        .then(complaint => {
            complaint.updateAttributes({ selectedSlot: body.updatedSlots, complaintStatusId: 3 });
            VendorComplaints.update({ isActive: false }, { where: { complaintId: body.complaintId, vendorId: { [Op.ne]: req.userId } } });
            res.status(httpStatus.CREATED).json({
                message: 'Complaint in progress now'
            })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.completedComplaint = (req, res, next) => {
    const id = req.body.complaintId;
    console.log('Complaint ID ===>', id);

    Complaint.findOne({
        where: {
            complaintId: id,
            isActive: true,
            isAccepted: true
        }
    })
        .then(complaint => {
            complaint.updateAttributes({ complaintStatusId: 4 });
            res.status(httpStatus.OK).json({
                message: 'Complaint status changed to completed'
            })
        })
        .catch(err => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}

exports.deleteComplaints = (req, res, next) => {
    const ids = req.body.ids;
    console.log('Comaplaint IDs ===>', ids);

    VendorComplaints.findAll({
        where: {
            vendorId: req.userId,
            isActive: true,
            complaintId: {
                [Op.in]: ids
            }
        }
    })
        .then(complaints => {
            complaints.map(item => {
                item.destroy();
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

exports.getFeedback = (req, res, next) => {
    const id = req.params.id;
    console.log('Complaint ID ===>', id);

    Feedback.findOne({
        where: {
            complaintId: id,
            vendorId: req.userId,
            isActive: true
        }
    })
        .then(feedback => {
            res.status(httpStatus.OK).json({
                feedback
            })
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}