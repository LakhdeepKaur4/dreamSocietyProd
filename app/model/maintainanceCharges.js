module.exports = (sequelize, Sequelize) => {
    const MaintenanceCharges = sequelize.define('maintenance_charges', {
        maintenanceChargesId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rate: {
            type: Sequelize.STRING
        },
        superArea: {
            type: Sequelize.STRING
        },
        charges: {
            type: Sequelize.FLOAT
        },
        from: {
            type: Sequelize.STRING
        },
        to: {
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

    return MaintenanceCharges;
}