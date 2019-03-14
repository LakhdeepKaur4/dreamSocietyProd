module.exports = (sequelize, Sequelize) => {
	const Tower = sequelize.define('tower_master', {
		towerId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		towerName: {
			type: Sequelize.STRING
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

	return Tower;
}