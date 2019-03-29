module.exports = (sequelize, Sequelize) => {
	const Employee = sequelize.define('employee_master', {
		employeeId: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
        },
        uniqueId: {
            type: Sequelize.STRING
        },
        userName: {
            type: Sequelize.STRING
        },
		firstName: {
            type: Sequelize.STRING
        },
		middleName: {
			type: Sequelize.STRING,
		},
		lastName: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        contact: {
            type: Sequelize.STRING,
        },
        salary:{
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.STRING,
        },
        serviceType:{
            type: Sequelize.STRING,
        },
        startDate:{
            type: Sequelize.STRING,
        },
        picture:{
            type: Sequelize.STRING,
        },
        documentOne:{
            type: Sequelize.STRING,
        },
        documentTwo:{
            type: Sequelize.STRING,   
        },
        isActive: {
			type: Sequelize.BOOLEAN,
			defaultValue: false
		},
	}, {
		freezeTableName: true
	});

	return Employee;
}


