module.exports = (sequelize, Sequelize) => {
    const VendorComplaints = sequelize.define('vendor_complaints_master', {
        vendorComplaintId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
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

    return VendorComplaints;
}