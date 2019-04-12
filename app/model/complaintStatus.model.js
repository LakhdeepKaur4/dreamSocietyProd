module.exports = (sequelize, Sequelize) => {
    const ComplaintStatus = sequelize.define('complaint_status_master', {
        complaintStatusId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        statusType: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
            freezeTableName: true
        });

    return ComplaintStatus;
}