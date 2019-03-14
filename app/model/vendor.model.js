module.exports = (sequelize, Sequelize) => {
    const Vendor = sequelize.define('vendor_master', {
        vendorId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        vendorName: {
            type: Sequelize.STRING
        },
        picture:{
            // type: Sequelize.BLOB('long')
            type: Sequelize.STRING
        },
        documentOne:{
            type: Sequelize.STRING
        },
        documentTwo:{
            type: Sequelize.STRING
        },
        permanentAddress: {
            type: Sequelize.STRING
        },
        currentAddress: {
            type: Sequelize.STRING
        },
        contact: {
            type: Sequelize.STRING
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

    return Vendor;
}