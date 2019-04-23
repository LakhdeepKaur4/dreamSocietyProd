module.exports = (sequelize, Sequelize) => {
    const IndividualVendor = sequelize.define('individual_vendor', {
        individualVendorId: {
            type: Sequelize.INTEGER,
            // autoIncrement: true,
            primaryKey: true
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        profilePicture: {
            type: Sequelize.STRING
        },
        documentOne: {
            type: Sequelize.STRING
        },
        documentTwo: {
            type: Sequelize.STRING
        },
        permanentAddress: {
            type: Sequelize.STRING,
            allowNull: false
        },
        currentAddress: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contact: {
            type: Sequelize.STRING,
        },
        rate: {
            type: Sequelize.STRING,
            allowNull: false
        },
        dailyRoutine: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        startTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        endTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        startTime1: {
            type: Sequelize.STRING,

        },

        endTime1: {
            type: Sequelize.STRING,

        },
        startTime2: {
            type: Sequelize.STRING,

        },

        endTime2: {
            type: Sequelize.STRING,

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

    return IndividualVendor;
}