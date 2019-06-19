module.exports = (sequelize, Sequelize) => {
    const FingerprintMachineData = sequelize.define('fingerprint_machine_data_master', {
        fingerprintMachineDataId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
        },
        time:{
            allowNull: false,
            type: Sequelize.DATE
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

    return FingerprintMachineData;
}
