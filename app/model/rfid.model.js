module.exports = (sequelize, Sequelize) => {
    const RFID = sequelize.define('rfid_master', {
        rfidId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rfid: {
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

    return RFID;
}