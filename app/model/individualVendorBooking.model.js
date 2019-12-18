module.exports = (sequelize, Sequelize) => {
    const IndividualVendorBooking = sequelize.define('individual_vendor_booking', {
        individualVendorBookingId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        startTimeSlotSelected: {
            type: Sequelize.STRING,
        },
        endTimeSlotSelected: {
            type: Sequelize.STRING,
        },
        enableFingerPrint: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        enableSmsNotification: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        payOnline: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        confirmedByVendor: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
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

    return IndividualVendorBooking;
}