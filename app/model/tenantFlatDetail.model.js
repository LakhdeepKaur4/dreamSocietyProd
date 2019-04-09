module.exports = (sequelize, Sequelize) => {
    const tenantFlatDetail = sequelize.define('tenant_flatDetail_master', {
        tenantFlatDetailId: {
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

    return tenantFlatDetail;
}