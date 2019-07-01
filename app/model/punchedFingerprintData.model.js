module.exports = (sequelize, Sequelize) => {
    const punchedFingerprintData = sequelize.define('punched_fingerprint_data_master', {
        punchedFingerprintId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        mode: {
            type: Sequelize.BOOLEAN,
        },
        time: {
            type: Sequelize.STRING,
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

    return punchedFingerprintData;
}
