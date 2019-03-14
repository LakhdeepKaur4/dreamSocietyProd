module.exports = (sequelize, Sequelize) => {
    const SocietyMemberEvent = sequelize.define('society_member_event_master', {
        societyMemberEventId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        societyMemberEventName: {
            allowNull: false,
            type: Sequelize.STRING
        },
        isActive: {
            allowNull: false,
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

    return SocietyMemberEvent;
}