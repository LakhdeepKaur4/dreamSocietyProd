module.exports = (sequelize, Sequelize) => {
	const Otp = sequelize.define('otp_master', {
		otpId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		otpvalue: {
			type: Sequelize.INTEGER
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