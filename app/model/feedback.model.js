module.exports = (sequelize, Sequelize) => {
    const Feedback = sequelize.define('feedback_master', {
        feedbackId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        status: {
            type: Sequelize.STRING,
        },
        rating: {
            type: Sequelize.STRING,
        },
        feedback: {
            type: Sequelize.STRING(2000),
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

    return Feedback;
}