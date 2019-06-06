module.exports = (sequelize, Sequelize) => {
    const Fingerprint = sequelize.define('fingerprint_data_master', {
        fingerprintId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fingerprintData: {
            type: Sequelize.STRING(2500),
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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

    return Fingerprint;
}
