module.exports = (sequelize, Sequelize) => {
    const societyBoardMember = sequelize.define('society_board_member_master', {
        societyBoardMemberId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        societyBoardMemberName: {
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
            unique:'compositeIndex'
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
            unique:'compositeIndex'
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

    return societyBoardMember;
}