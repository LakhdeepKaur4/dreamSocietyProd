module.exports = (sequelize, Sequelize) => {
    const ElectricityCharges = sequelize.define('electricity_charges', {
        electricityChargesId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        entryDate: {
            type: Sequelize.DATEONLY,
        },
        lastReadingDate: {
            type: Sequelize.DATEONLY,
        },
        initialReading: {
            type: Sequelize.INTEGER,
        },
        currentReading: {
            type: Sequelize.INTEGER,
        },
        unitConsumed: {
            type: Sequelize.INTEGER,
        },
        to: {
            type: Sequelize.STRING
        },
        monthlyCharges: {
            type: Sequelize.FLOAT,
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

    return ElectricityCharges;
}