module.exports = (sequelize, Sequelize) => {
	const FlatParking = sequelize.define('flat_parking_master', {
		flatParkingId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            defaultValue: null,
            type: Sequelize.DATE
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true
		}
	}, {
		freezeTableName: true
	});

	return FlatParking;
}