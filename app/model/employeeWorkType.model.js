module.exports = (sequelize, Sequelize) => {
	const EmployeeWorkType = sequelize.define('employee_work_type_master', {
		employeeWorkTypeId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		employeeWorkType: {
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

	return EmployeeWorkType;
}
