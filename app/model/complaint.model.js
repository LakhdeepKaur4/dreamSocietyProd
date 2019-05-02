module.exports = (sequelize, Sequelize) => {
    const Complaint = sequelize.define('complaint_master', {
        complaintId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        slotTime1: {
            type: Sequelize.STRING
        },
        slotTime2: {
            type: Sequelize.STRING
        },
        slotTime3: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.DATE
        },
        isAccepted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        description: {
            type: Sequelize.STRING
        },
        priority: {
            type: Sequelize.STRING
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            defaultValue: null,
            type: Sequelize.DATE
        }
    }, {
            freezeTableName: true
        });

    return Complaint;
}