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
                    totalComplaints = complaints.length;
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
                            assacceptedigned += 1;
                        }
                    })

                    let todoPercent = todo / totalComplaints * 100;
                    let assignedPercent = assigned / totalComplaints * 100;
                    let inprogressPercent = inprogress / totalComplaints * 100;
                    let completedPercent = completed / totalComplaints * 100;
                    let cancelledPercent = cancelled / totalComplaints * 100;
                    let acceptedPercent = accepted / totalComplaints * 100;
                    
                    const complaintsData = {
                        todo: todoPercent,
                        assigned: assignedPercent,
                        inprogress: inprogressPercent,
                        completed: completedPercent,
                        cancelled: cancelledPercent,
                        accepted: acceptedPercent
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