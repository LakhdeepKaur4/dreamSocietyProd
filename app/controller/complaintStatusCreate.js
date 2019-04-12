const db = require('../config/db.config.js');

const ComplaintStatus = db.complaintStatus;

complaintStatus = () => {
    ComplaintStatus.create({
        complaintStatusId: 1,
        statusType: "REGISTERED"
    });
    ComplaintStatus.create({
        complaintStatusId: 2,
        statusType: "ASSIGNED"
    });
    ComplaintStatus.create({
        complaintStatusId: 3,
        statusType: "IN PROGRESS"
    });
    ComplaintStatus.create({
        complaintStatusId: 4,
        statusType: "COMPLETED"
    });
    ComplaintStatus.create({
        complaintStatusId: 5,
        statusType: "REJECTED"
    });
}

module.exports = complaintStatus;