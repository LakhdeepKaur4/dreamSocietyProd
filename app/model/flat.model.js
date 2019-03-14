module.exports = (sequelize, Sequelize) => {
	const Flat = sequelize.define('flat_master', {
		flatId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		flatType: {
			type: Sequelize.STRING
		},
		flatSuperArea: {
			type: Sequelize.INTEGER
		},
		coverArea: {
			type: Sequelize.INTEGER
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

	return Flat;
}