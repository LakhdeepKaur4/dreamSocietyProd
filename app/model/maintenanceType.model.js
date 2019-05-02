module.exports = (sequelize, Sequelize) => {
    const MaintenanceType = sequelize.define('maintenance_type_master', {
        maintenanceTypeId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rate: {
            type:  Sequelize.DECIMAL(10,3),
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

    return MaintenanceType;
}