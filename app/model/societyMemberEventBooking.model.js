module.exports = (sequelize, Sequelize) => {
    const SocietyMemberEventBooking = sequelize.define('society_member_event_booking_master', {
        societyMemberEventBookingId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        startDate: {
            type: Sequelize.STRING,
        },
        endDate: {
            type: Sequelize.STRING,
        },
        numberOfGuestExpected: {
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

    return SocietyMemberEventBooking;
}