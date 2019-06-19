const db = require('../config/db.config.js');

const httpStatus = require('http-status');

const Op = db.Sequelize.Op;

const VendorComplaints = db.vendorComplaints;
const Complaint = db.complaint;
const ComplaintStatus = db.complaintStatus;


exports.complaintsData = (req, res, next) => {
    let userId = req.userId;
    console.log('User ID ===>', userId);

    VendorComplaints.findAll({
        where: {
            vendorId: userId,
            isActive: true
        }
    })
        .then(complaints => {
            let complaintIds = [];
            complaints.map(item => {
                complaintIds.push(item.complaintId);
            })

            Complaint.findAll({
                where: {
                    complaintId: {
                        [Op.in]: complaintIds
                    },
                    isActive: true
                }
            })
                .then(complaints => {
                    let todo, assigned, inprogress, completed, cancelled, accepted;
                    todo = 0; 
                    assigned = 0; 
                    inprogress = 0; 
                    completed = 0; 
                    cancelled = 0; 
                    accepted = 0;
                    complaints.map(item => {
                        if (item.complaintStatusId === 1) {
                            todo += 1;
                        }
                        else if (item.complaintStatusId === 2) {
                            assigned += 1;
                        }
                        else if (item.complaintStatusId === 3) {
                            inprogress += 1;
                        }
                        else if (item.complaintStatusId === 4) {
                            completed += 1;
                        }
                        else if (item.complaintStatusId === 5) {
                            cancelled += 1;
                        }
                        else if (item.complaintStatusId === 6) {
                            accepted += 1;
                        }
                    })

                    const complaintsData = {
                        todo: todo,
                        assigned: assigned,
                        inprogress: inprogress,
                        completed: completed,
                        cancelled: cancelled,
                        accepted: accepted
                    }

                    res.status(httpStatus.OK).json({
                        complaintsData: complaintsData
                    })
                })
                .catch(err => {
                    console.log('Error ===>', err);
                    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
                })
        })
        .catch(err => {
            console.log('Error ===>', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        })
}