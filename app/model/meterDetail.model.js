module.exports = (sequelize, Sequelize) => {
	const MeterDetail = sequelize.define('meter_detail_master', {
		meterDetailId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		meterName: {
			type: Sequelize.STRING,
			required: true
		},
		initialReading: {
			type: Sequelize.FLOAT,
			required: true
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

	return MeterDetail;
}