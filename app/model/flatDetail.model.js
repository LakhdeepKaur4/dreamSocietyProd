module.exports = (sequelize, Sequelize) => {
	const FlatDetail = sequelize.define('flat_detail_master', {
		flatDetailId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		flatNo: {
			type: Sequelize.STRING,
			// unique:'compositeIndex'
		},
		floor: {
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

	return FlatDetail;
}