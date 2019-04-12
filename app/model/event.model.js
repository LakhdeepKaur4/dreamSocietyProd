module.exports = (sequelize, Sequelize) => {
    const EventTable = sequelize.define('event_master', {
        eventId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        eventName: {
            type: Sequelize.STRING
        },
        eventType: {
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

    return EventTable;
}