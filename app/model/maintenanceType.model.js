module.exports = (sequelize, Sequelize) => {
    const MaintenanceType = sequelize.define('maintenance_type_master', {
        maintenanceTypeId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rate: {
            type: Sequelize.STRING
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        startDate:{
            type: Sequelize.DATEONLY,
        },
        endDate:{
            type: Sequelize.DATEONLY,
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

    return MaintenanceType;
}