module.exports = (sequelize, Sequelize) => {
	const EmployeeType = sequelize.define('employee_type_master', {
		employeeTypeId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		employeeType: {
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

	return EmployeeType;
}


