module.exports = (sequelize, Sequelize) => {
	const CommonArea = sequelize.define('common_area_master', {
		commonAreaId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
        },
        commonArea: {
            type: Sequelize.STRING
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

    return CommonArea;
}