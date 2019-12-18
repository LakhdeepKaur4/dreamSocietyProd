module.exports = (sequelize, Sequelize) => {
    const FacilitiesCharges = sequelize.define('facilities_charges', {
        facilityChargesId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        from: {
            type: Sequelize.STRING
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

    return FacilitiesCharges;
}