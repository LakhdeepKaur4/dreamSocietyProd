module.exports = (sequelize, Sequelize) => {
	const TowerFloor = sequelize.define('tower_floor_master', {
		towerFloorId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
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

	return TowerFloor;
}