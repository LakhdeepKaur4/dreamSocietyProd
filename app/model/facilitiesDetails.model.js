module.exports = (sequelize, Sequelize) => {
    const Facility = sequelize.define('facilities_details_master', {
        facilityDetailId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        unitRate: {
            type: Sequelize.FLOAT,
        },
        monthlyRate: {
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

    return Facility;
}