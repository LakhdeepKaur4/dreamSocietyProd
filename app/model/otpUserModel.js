module.exports = (sequelize, Sequelize) => {
    const Otp = sequelize.define('otp_user_verify', {
        otpId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        otp: {
            type: Sequelize.STRING
        },
        isActive: {
            allowNull: false,
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

    return Otp;
}