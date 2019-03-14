module.exports = (sequelize, Sequelize) => {
	const Relation = sequelize.define('relation_master', {
		relationId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		relationName: {
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

	return Relation;
}