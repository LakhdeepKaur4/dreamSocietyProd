module.exports = (sequelize, Sequelize) => {
	const EmployeeDetail = sequelize.define('employee_detail_master', {
		employeeDetailId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		serviceType: {
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

	return EmployeeDetail;
}


