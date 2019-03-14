module.exports = (sequelize, Sequelize) => {
    const Maintenance = sequelize.define('maintenance_master', {
        maintenanceId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category: {
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

    return Maintenance;
}