module.exports = (sequelize, Sequelize) => {
    const VendorAllotment = sequelize.define('vendor_allotment_master', {
        vendorAllotmentId: {
            type: Sequelize.INTEGER,
            // autoIncrement: true,
            primaryKey: true
        },
        startTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        endTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        booked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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

    return VendorAllotment;
}