module.exports = (sequelize, Sequelize) => {
	const AreaMachineMaster = sequelize.define('area_machine_master', {
		areaMachineMasterId: {
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

	return AreaMachineMaster;
}