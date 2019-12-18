module.exports = (sequelize, Sequelize) => {
    const societyEventCelebration = sequelize.define('society_event_celebration', {
        societyEventCelebrationId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        noOfAdultsInFamily: {
            type: Sequelize.INTEGER,
        },
        noOfChildInFamily: {
            type: Sequelize.INTEGER,
        },
        noOfAdultInGuest: {
            type: Sequelize.INTEGER,
        },
        noOfChildInGuest: {
            type: Sequelize.INTEGER,
        },
        charges: {
            type: Sequelize.FLOAT,
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

    return societyEventCelebration;
}