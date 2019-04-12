module.exports = (sequelize, Sequelize) => {
    const VendorService = sequelize.define('vendor_service', {
        vendorServiceId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rate:{
            type: Sequelize.FLOAT,
        },
        dailyServices:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
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

    return VendorService;
}