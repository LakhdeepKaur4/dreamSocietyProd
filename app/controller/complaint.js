const db = require('../config/db.config.js');
const httpStatus = require('http-status');

const Complaint = db.complaint;
const ComplaintStatus = db.complaintStatus;
const Service = db.Service;
const FlatDetail = db.flatDetail;


exports.create = (req, res, next) => {
    const complaintBody = req.body;

    console.log('Complaint ===>', complaintBody);

    complaintBody.complaintStatusId = 1;

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
