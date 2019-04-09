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
        }
	}, {
		freezeTableName: true
	});

	return FlatParking;
}