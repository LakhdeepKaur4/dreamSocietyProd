const db = require('../config/db.config.js');
const config = require('../config/config.js');
const httpStatus = require('http-status');
const crypto = require('crypto');

const Op = db.Sequelize.Op;

const VendorComplaints = db.vendorComplaints;
const Complaint = db.complaint;
const FlatDetail = db.flatDetail;
const Tower = db.tower;
const Floor = db.floor;
const User = db.user;

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

    VendorComplaints.findAll({
        where: {
            vendorId: id,
            isActive: true
        }
    })
        .then(complaints => {
            complaints.map(item => {
                complaintIds.push(item.complaintId);
            })
            Complaint.findAll({
                where: {
                    complaintId: {
                        [Op.in]: complaintIds
                    },
                    isActive: true
                },
                include: [
                    { model: FlatDetail, where: { isActive: true }, include: [
                        { model: Tower, where: { isActive: true } },
                        { model: Floor, where: { isActive: true } },
                        { model: User, where: { isActive: true }, attributes: ['firstName', 'lastName','contact'] }
                    ] },
                ]
            })
            .then(complaints => {
                complaints.map(item => {
                    item.flat_detail_master.user_master.firstName = decrypt(item.flat_detail_master.user_master.firstName);
                    item.flat_detail_master.user_master.lastName = decrypt(item.flat_detail_master.user_master.lastName);
                    item.flat_detail_master.user_master.contact = decrypt(item.flat_detail_master.user_master.contact);
                })
                res.status(httpStatus.OK).json({
                    complaints 
                })
            })
        })
}