module.exports = (sequelize, Sequelize) => {
    const SalaryAccount = sequelize.define('salary_account_master', {
        salaryAccountId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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

    return SalaryAccount;
}