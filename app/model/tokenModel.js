module.exports = (sequelize, Sequelize) => {
    const Token = sequelize.define('token_verify', {
        token: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
            freezeTableName: true
        });

    return Token;
}