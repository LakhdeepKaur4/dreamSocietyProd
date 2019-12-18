module.exports = (sequelize, Sequelize) => {
    const SocietyEventBook = sequelize.define('society_event_book_master', {
        societyEventBookId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        startDate: {
            allowNull: false,
            type: Sequelize.DATEONLY
        },
        endDate: {
            allowNull: false,
            type: Sequelize.DATEONLY
        },
        startTime: {
            allowNull: false,
            type: Sequelize.TIME
        },
        endTime: {
            allowNull: false,
            type: Sequelize.TIME
        },
        breakfast: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        lunch: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        eveningSnacks: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        dinner: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        drinks: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        dj: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        invitationCardPicture: {
            type: Sequelize.STRING,
        },
        perPersonCharge: {
            allowNull: false,
            type: Sequelize.FLOAT
        },
        childAbove: {
            allowNull: false,
            type: Sequelize.STRING
        },
        charges: {
            type: Sequelize.FLOAT
        },
        description: {
            type: Sequelize.STRING
        },
        individualEventAllowed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        guestAllowed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        guestLimit:{
            type: Sequelize.INTEGER,
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

    return SocietyEventBook;
}