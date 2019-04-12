module.exports = (sequelize, Sequelize) => {
    const societyMember = sequelize.define('society_member_master', {
        societyMemberId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        societyMemberName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        currentAddress: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        permanentAddress: {
            type: Sequelize.STRING
        },
        contactNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        panCardNumber: {
            type: Sequelize.STRING
        },
        bankName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        accountHolderName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        accountNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        optionalMail: {
            type: Sequelize.STRING
        },
        optionalContactNumber: {
            type: Sequelize.STRING
        },
        IFSCCode: {
            type: Sequelize.STRING
        },
        dob: {
            type: Sequelize.DATE
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

    return societyMember;
}