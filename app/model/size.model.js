module.exports = (sequelize, Sequelize) => {
	const Size = sequelize.define('size_master', {
		sizeId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		sizeType: {
			type: Sequelize.STRING,
			unique:'compositeIndex'
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

	return Size;
}