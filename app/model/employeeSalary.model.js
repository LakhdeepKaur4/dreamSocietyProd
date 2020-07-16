module.exports=(sequelize,Sequelize)=>{
    const EmployeeSalary= sequelize.define('employee_salary',{
        employeeSalaryId: {
            type: Sequelize.INTEGER,
            // autoIncrement: true,
            primaryKey: true
        },
        attendenceInDays: {
            type: Sequelize.STRING,
        },
        leaveWithoutPay: {
            type: Sequelize.STRING,
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
        tds:{
            type: Sequelize.STRING,
        },
        selfDevelopmentAllowance: {
            type: Sequelize.STRING,
        },
        totalDeduction: {
            type: Sequelize.STRING,
        },
        canteenAllowance: {
            type: Sequelize.STRING,
        },
        medicalReimbursement:{
            type: Sequelize.STRING
        },
        mobileReimbursement:{
            type: Sequelize.STRING,
        },
        adjustments:{
            type: Sequelize.STRING,
        },
        nightAllowance:{
            type: Sequelize.STRING,
        },
        adjustmentAdditions:{
            type: Sequelize.STRING,
        },
        specialAllowance:{
            type: Sequelize.STRING,
        },
        adjustmentDeductions:{
            type: Sequelize.STRING,
        },
        annualBonus:{
            type: Sequelize.STRING,
        },
        netSalary:{
            type: Sequelize.STRING,
        },
        totalPayment:{
            type: Sequelize.STRING,
        },
        remarks:{
            type: Sequelize.STRING,
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
    },{
        freezeTableName: true
    });
    return EmployeeSalary
}