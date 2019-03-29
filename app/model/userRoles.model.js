module.exports = (sequelize, Sequelize) => {
	const userRoles = sequelize.define('user_role_master', {
		userRoleId: {
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

	return userRoles;
}