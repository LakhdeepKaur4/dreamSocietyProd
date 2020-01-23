module.exports = (sequelize, Sequelize) => {
    const EmployeeSalary = sequelize.define('employee_salary', {
        employeeSalaryId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        attendenceInDays: {
            type: Sequelize.INTEGER
        },
        lwp: {
            type: Sequelize.INTEGER
        },
        plBalance: {
            type: Sequelize.STRING,
        },
        clBalance: {
            type: Sequelize.STRING,
        },
        variableComponent: {
            type: Sequelize.STRING,
        },
        selfDevelopmentComponent: {
            type: Sequelize.STRING,
        },
        canteenAllowance: {
            type: Sequelize.STRING,
        },
        medicalReimbursement: {
            type: Sequelize.STRING,
        },
        nightAllowance: {
            type: Sequelize.STRING,
        },
        specialAllowance: {
            type: Sequelize.STRING,
        },
        tds: {
            type: Sequelize.STRING,
        },
        mobileReimbursement: {
            type: Sequelize.STRING,
        },
        adjustmentAdditions: {
            type: Sequelize.STRING,
        },
        adjustmentDeductions: {
            type: Sequelize.STRING,
        },
        annualBonus: {
            type: Sequelize.STRING,
        },
        totalPayment: {
            type: Sequelize.INTEGER,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
    }, {
        freezeTableName: true
    });

    return EmployeeSalary;
}

