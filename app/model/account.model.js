module.exports = (sequelize, Sequelize) => {
    const Account = sequelize.define('account_master', {
        accountId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        bankName: {
            type: Sequelize.STRING
        },
        accountNo: {
            type: Sequelize.INTEGER
        },
        pan: {
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

    return Account;
}