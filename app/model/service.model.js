module.exports = (sequelize, Sequelize) => {
	const Service = sequelize.define('service_master', {
		serviceId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		serviceName: {
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

	return Service;
}